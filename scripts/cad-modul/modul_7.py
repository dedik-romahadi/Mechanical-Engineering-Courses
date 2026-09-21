# Konten Modul 7 Pemodelan CAD — Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly
# (Sub-CPMK 2.5: memadukan sketsa 2D dan fitur 3D, pola fitur, Loft/Sweep lanjutan,
# Thickness, blok yang dipakai ulang (App::Link, Draft Clone, Part container), dan
# sub-assembly sederhana dengan Placement). Angka contoh dihitung di sini agar teks,
# tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian tugas parametrik
# mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from pustaka import BG  # noqa: E402
from tugas_gambar import AM, CY, GN, GR, PK, RD, VI, _panah, dim_h, dim_v, ext  # noqa: E402

NOMOR = 7
JUDUL = "Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly"
JUDUL_PANJANG = "Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly"
JUDUL_EKSPOR = "Proyek Gabungan 2D-3D dan Sub-Assembly"

# ─────────────────────────── angka contoh ───────────────────────────
W_L, H_L, T_L, L_EX = 50, 30, 6, 25                      # profil L → Part Extrude
A_L = W_L * T_L + (H_L - T_L) * T_L
V_L = L_EX * A_L
A1, B1, A2, B2, H_LO = 50, 30, 25, 15, 40                # loft ruled dua persegi panjang sepusat
DA, DB_ = A2 - A1, B2 - B1
V_LOFT = H_LO * (A1 * B1 + (A1 * DB_ + B1 * DA) / 2 + DA * DB_ / 3)
A_S, B_S, H_S, T_S = 70, 45, 35, 2.5                     # Thickness (cangkang terbuka atas)
V_RONGGA = (A_S - 2 * T_S) * (B_S - 2 * T_S) * (H_S - T_S)
V_SHELL = A_S * B_S * H_S - V_RONGGA
ALPHA = 5                                                # sudut tirus (Draft) contoh, derajat
SUSUT = 2 * H_S * math.tan(math.radians(ALPHA))
D_F, D0_F, DB_F, H_F, N_F = 90, 26, 7, 10, 6             # flens: Pocket + PolarPattern
DBC_F = (D_F + D0_F) / 2
V_FLENS = H_F * math.pi / 4 * (D_F ** 2 - D0_F ** 2 - N_F * DB_F ** 2)
A_C, B_C, T_C, DB_C, HB_C, K_C = 80, 45, 6, 14, 10, 1.5  # pelat + boss + Draft Clone berskala k
V_PELAT = A_C * B_C * T_C
V_BOSS = math.pi / 4 * DB_C ** 2 * HB_C
V_RAKIT = V_PELAT + V_BOSS * (1 + K_C ** 3)
RHO_BAJA = 7.85


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _silinder(cx0, cy0, z0, z1, r, cx, cy, s, warna, n=36):
    out = ""
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        out += _poli([_iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z0, cx, cy, s), _iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z0, cx, cy, s),
                      _iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z1, cx, cy, s), _iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z1, cx, cy, s)],
                     "rgba(34,211,238,.08)", "rgba(34,211,238,.25)", 0.6)
    out += _poli([_iso(cx0 + r * math.cos(k / n * 2 * math.pi), cy0 + r * math.sin(k / n * 2 * math.pi), z1, cx, cy, s) for k in range(n)], "rgba(34,211,238,.22)", warna, 1.3)
    return out


def gambar1():
    b = ""
    w, h = 124, 54
    tahap = [("Bentuk induk", "Pad · Extrude · Loft", "#22d3ee"), ("Fitur tambahan", "Pocket · Pad · Sweep", "#f59e0b"), ("Pola", "Linear · Polar · Mirror", "#a855f7"),
             ("Dressing", "Fillet · Shell · Draft", "#ec4899"), ("Blok & rakitan", "Link · Clone · Placement", "#00e09e")]
    xs = [10, 142, 274, 406, 538]
    # subjudul yang hampir selebar kotak 124 px dipecah dua baris; gaya sama dengan box()
    pecah = {"Link · Clone · Placement": ["Link · Clone ·", "Placement"]}
    for (a, s, c), x in zip(tahap, xs):
        baris = [(a, True)] + [(q, False) for q in pecah.get(s, [s])]
        b += box(x, 36, w, h, [], c, 11.5)
        for i, (q, judul) in enumerate(baris):
            yy = 36 + h / 2 + (i - (len(baris) - 1) / 2) * 14.5 + 11.5 / 3
            b += t(x + w / 2, yy, q, 11.5, TX if judul else AX, weight="600" if judul else "")
    for i in range(4):
        b += arrow(xs[i] + w, 63, xs[i + 1], 63)
    b += t(340, 118, "Pohon proyek braket flens:", 11, TX, "start", "600")
    for i, s_ in enumerate(["Part Braket (Placement sub-assembly)", "  ├ Body Flens: Pad → Pocket → PolarPattern", "  ├ Body Boss: Sketch → Pad", "  ├ Link Boss ×2 (App::Link, Placement)", "  └ Clone Boss (Draft Clone, Scale k)"]):
        b += t(340, 136 + i * 16, s_, 10, "#00e09e" if i == 0 else AX, "start")
    b += t(60, 130, "Urutan fitur menentukan", 10.5, AX, "start")
    b += t(60, 146, "kemudahan penyuntingan:", 10.5, AX, "start")
    b += t(60, 162, "induk dulu, pola kemudian,", 10.5, AX, "start")
    b += t(60, 178, "dressing paling akhir.", 10.5, AX, "start")
    b += teks2(340, 228, "Komponen rumit diurai menjadi fitur berurutan; blok yang dipakai ulang dan Placement menyusunnya menjadi sub-assembly", 11, AX, maks=70)
    return svg(680, 254, b, "Gambar 1 — Dekomposisi fitur komponen rumit dan pohon proyek braket flens")


def gambar2():
    b = ""
    cx, cy, s = 150, 203, 2.6
    W, H, tt, L = W_L, H_L, T_L, L_EX
    prof = [(0, 0), (W, 0), (W, tt), (tt, tt), (tt, H), (0, H)]
    bawah = [_iso(x, y, 0, cx, cy, s) for x, y in prof]
    atas = [_iso(x, y, L, cx, cy, s) for x, y in prof]
    for i in range(6):
        j = (i + 1) % 6
        b += _poli([bawah[i], bawah[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.22)", "#22d3ee", 1.8)
    b += _poli(bawah, "rgba(245,158,11,.14)", "#f59e0b", 1.6, "5 3")
    p = _iso(W / 2, -4, 0, cx, cy, s)             # label di bawah titik terendah profil (sudut asal, y = cy)
    b += t(p[0], cy + 15, f"Draft Wire L: W = {W}, H = {H}, t = {tt} (bidang XY)", 10.5, "#f59e0b")
    p = _iso(W, 0, L / 2, cx, cy, s)
    b += t(p[0] + 10, p[1] + 4, f"Part Extrude L = {L} (arah Z)", 10.5, "#22d3ee", "start")
    b += t(452, 56, "Part Extrude:", 11, "#22d3ee", "start", "600")
    b += t(452, 74, "Direction Normal · Length L · Solid", 10, AX, "start")
    b += t(452, 104, "A_L = W·t + (H − t)·t", 11, TX, "start")
    b += t(452, 122, f"= {ind(A_L, 0)} mm²", 10.5, "#00e09e", "start")
    b += t(452, 152, "V = L·A_L", 11, TX, "start")
    b += t(452, 170, f"= {ind(V_L, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(452, 200, "Boolean: Cut · Fuse · Common", 10, AX, "start")
    b += teks2(340, 246, "Kontur 2D dari Draft (Make Face) ditebalkan Part Extrude menjadi solid; hasilnya bebas dipadukan lewat Boolean dengan solid lain", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 2 — Profil L dari Draft Wire ditebalkan Part Extrude sepanjang L")


def gambar3():
    b = ""
    cx, cy, k = 170, 142, 2.0
    R, r0, rb, rbc = D_F / 2 * k, D0_F / 2 * k, DB_F / 2 * k, DBC_F / 2 * k
    b += f'<circle cx="{cx}" cy="{cy}" r="{R:.1f}" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="{r0:.1f}" fill="#0a101f" stroke="#22d3ee" stroke-width="1.6"/>'
    # lingkaran baut (garis sumbu) diputus pada sudut 15°–42°, di belakang label 360°/n (celah ±7 px dari teks)
    g0, g1 = math.radians(15), math.radians(42)
    b += (f'<path d="M {cx + rbc * math.cos(g1):.1f} {cy - rbc * math.sin(g1):.1f} A {rbc:.1f} {rbc:.1f} 0 1 0 '
          f'{cx + rbc * math.cos(g0):.1f} {cy - rbc * math.sin(g0):.1f}" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="5 4"/>')
    for i in range(N_F):
        ang = 2 * math.pi * i / N_F
        px, py = cx + rbc * math.cos(ang), cy - rbc * math.sin(ang)
        b += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rb:.1f}" fill="#0a101f" stroke="{"#00e09e" if i == 0 else "#a855f7"}" stroke-width="1.6"/>'
    a1 = 2 * math.pi / N_F
    b += f'<path d="M {cx + 40} {cy} A 40 40 0 0 0 {cx + 40 * math.cos(a1):.1f} {cy - 40 * math.sin(a1):.1f}" fill="none" stroke="#ec4899" stroke-width="1.2"/>'
    b += t(cx + 44, cy - 24, "360°/n", 10, "#ec4899", "start", "600")     # di celah lingkaran baut, bebas dari tepi flens
    b += t(cx, cy - R - 8, "⌀D (Pad h)", 10.5, "#22d3ee")
    b += t(cx, cy + 4, "⌀d₀", 10, "#22d3ee")
    b += t(cx + R + 8, cy + 4, "n × ⌀d_b (induk hijau)", 10, "#00e09e", "start")      # di luar tepi flens, sebaris lubang induk
    b += t(cx, cy + rbc + 12, "lingkaran baut ⌀D_bc", 10, "#f59e0b")                  # di antara lingkaran baut dan tepi flens
    b += t(440, 50, "Pocket + PolarPattern:", 11, "#a855f7", "start", "600")
    b += t(440, 68, "Axis Z · Angle 360° · Occurrences n", 10, AX, "start")
    b += t(440, 98, "V = h·(π/4)(D² − d₀² − n·d_b²)", 11, TX, "start")
    b += t(440, 116, f"= {ind(V_FLENS, 1)} mm³ (h = {H_F})", 10.5, "#00e09e", "start")
    b += t(440, 146, f"sudut antar lubang 360°/n = {360 // N_F}°", 10, AX, "start")
    b += t(440, 164, "D_bc = (D + d₀)/2 pada contoh", 10, AX, "start")
    b += t(440, 194, "Occurrences 6 → 8: semua lubang ikut", 10, AX, "start")
    b += teks2(340, 258, "Satu lubang induk disketsa pada lingkaran baut, lalu PolarPattern menyalinnya n kali; mengubah n atau D_bc memperbarui seluruh pola", 11, AX, maks=70)
    return svg(680, 284, b, "Gambar 3 — Flens cakram: lubang pusat dan pola polar n lubang baut")


def gambar4():
    b = ""
    cx, cy, s = 170, 184, 2.4
    a1, b1, a2, b2, h = A1, B1, A2, B2, H_LO
    r1 = [(-a1 / 2, -b1 / 2), (a1 / 2, -b1 / 2), (a1 / 2, b1 / 2), (-a1 / 2, b1 / 2)]
    r2 = [(-a2 / 2, -b2 / 2), (a2 / 2, -b2 / 2), (a2 / 2, b2 / 2), (-a2 / 2, b2 / 2)]
    bawah = [_iso(x, y, 0, cx, cy, s) for x, y in r1]
    atas = [_iso(x, y, h, cx, cy, s) for x, y in r2]
    for i in range(4):
        j = (i + 1) % 4
        b += _poli([bawah[i], bawah[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.24)", "#22d3ee", 1.8)
    b += _poli(bawah, "rgba(245,158,11,.14)", "#f59e0b", 1.6, "5 3")
    zm = h / 2
    am, bm = a1 + DA * 0.5, b1 + DB_ * 0.5
    tengah = [_iso(x, y, zm, cx, cy, s) for x, y in [(-am / 2, -bm / 2), (am / 2, -bm / 2), (am / 2, bm / 2), (-am / 2, bm / 2)]]
    b += _poli(tengah, "none", "#ec4899", 1.2, "4 3")
    z0, z1 = _iso(0, 0, -6, cx, cy, s), _iso(0, 0, h + 14, cx, cy, s)
    b += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="#ef4444" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    p = _iso(0, -b1 / 2 - 3, 0, cx, cy, s)       # di bawah sudut terendah alas (bebas dari rusuk dan sketsa)
    b += t(p[0], max(q[1] for q in bawah) + 15, "Sketch a₁ × b₁ (z = 0), sepusat", 10.5, "#f59e0b")
    p = _iso(0, 0, h, cx, cy, s)                 # di atas ujung sumbu Z
    b += t(p[0] - 30, p[1] - 36, "Sketch a₂ × b₂ (z = h)", 10.5, "#22d3ee")
    p = _iso(am / 2, 0, zm, cx, cy, s)           # kanan rusuk depan-kanan
    b += t(p[0] + 18, p[1] + 4, "penampang z: a(z) × b(z)", 10, "#ec4899", "start")
    p = _iso(a1 / 2, -b1 / 2, 0, cx, cy, s)
    q = _iso(a2 / 2, -b2 / 2, h, cx, cy, s)
    b += t((p[0] + q[0]) / 2 + 14, (p[1] + q[1]) / 2 + 26, "rusuk lurus (ruled)", 10, AX, "start")
    b += t(440, 50, "Part Loft:", 11, "#22d3ee", "start", "600")
    b += t(440, 68, "Sections: Sketch (z=0), Sketch001 (z=h)", 10, AX, "start")
    b += t(440, 86, "Create solid · Ruled surface", 10, AX, "start")
    b += t(440, 116, "V = h·[a₁b₁ + (a₁Δb + b₁Δa)/2 + ΔaΔb/3]", 10.5, TX, "start")
    b += t(440, 134, f"= {ind(V_LOFT, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(440, 164, "Δa = a₂ − a₁, Δb = b₂ − b₁ (negatif bila mengecil)", 9.5, AX, "start")
    b += t(440, 182, "loft halus (B-spline) ≠ ruled", 10, AX, "start")
    b += teks2(340, 250, "Loft ruled menghubungkan titik seiring dua profil dengan rusuk lurus; penampangnya berubah linear terhadap z, volumenya integral a(z)·b(z)", 11, AX, maks=72)
    return svg(680, 276, b, "Gambar 4 — Loft ruled antara dua persegi panjang sepusat pada z = 0 dan z = h")


def gambar5():
    b = ""
    k = 2.4
    ox, oy = 40, 200
    a, h, tt = A_S, H_S, T_S
    luar = [(ox, oy), (ox + a * k, oy), (ox + a * k, oy - h * k), (ox, oy - h * k)]
    dalam = [(ox + tt * k, oy - tt * k), (ox + a * k - tt * k, oy - tt * k), (ox + a * k - tt * k, oy - h * k), (ox + tt * k, oy - h * k)]
    b += _poli(luar, "rgba(236,72,153,.22)", "#ec4899", 2)
    b += _poli(dalam, "#0a101f", "#ec4899", 1.2)
    b += f'<line x1="{ox - 8}" y1="{oy - h * k}" x2="{ox + a * k + 8}" y2="{oy - h * k}" stroke="#94a3b8" stroke-width=".8" stroke-dasharray="4 3"/>'
    b += t(ox + a * k / 2, oy - h * k - 10, "muka atas dibuang (bukaan)", 10, AX)
    b += t(ox + a * k / 2, oy - h * k / 2 + 4, "rongga (a − 2t)(b − 2t)(h − t)", 10, AX)
    b += t(ox + a * k / 2, oy + 18, "a (luar tetap)", 10.5, "#f59e0b")
    b += t(ox - 8, oy - h * k / 2 + 4, "h", 10.5, "#f59e0b", "end")
    b += t(ox + a * k + 8, oy - h * k + 36, "t", 10.5, "#f59e0b", "start")
    b += t(ox + a * k / 2, oy - 10, "dasar t", 9.5, "#ec4899")
    ox2, w2, h2, susut = 280, 90, h * k, 18
    trap = [(ox2, oy), (ox2 + w2, oy), (ox2 + w2 - susut, oy - h2), (ox2 + susut, oy - h2)]
    b += _poli(trap, "rgba(168,85,247,.18)", "#a855f7", 1.8)
    b += f'<line x1="{ox2 + w2}" y1="{oy}" x2="{ox2 + w2}" y2="{oy - h2}" stroke="#94a3b8" stroke-width=".8" stroke-dasharray="3 3"/>'
    b += t(ox2 + w2 + 6, oy - h2 + 40, "α", 12, "#a855f7", "start", "700")
    b += t(ox2 + w2 / 2, oy - h2 - 10, "Draft (tirus) α", 10, "#a855f7")
    b += t(ox2 + w2 / 2, oy + 18, "atas = a − 2h·tan α", 10, AX)
    b += t(440, 50, "Thickness (shell):", 11, "#ec4899", "start", "600")
    b += t(440, 68, "pilih muka yang dibuang · Mode Skin", 10, AX, "start")
    b += t(440, 86, "t ke dalam, ukuran luar tetap", 10, AX, "start")
    b += t(440, 116, "V = abh − (a − 2t)(b − 2t)(h − t)", 11, TX, "start")
    b += t(440, 134, f"= {ind(V_SHELL, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(440, 152, f"massa baja ≈ {ind(V_SHELL / 1000 * RHO_BAJA, 1)} g", 10, AX, "start")
    b += t(440, 182, f"Draft α = {ALPHA}°: sisi menyusut {ind(SUSUT, 2)} mm", 10, AX, "start")
    b += t(440, 200, "Pad Taper angle = Draft saat Pad", 10, AX, "start")
    b += teks2(340, 246, "Thickness membuang muka pilihan dan menyisakan dinding setebal t; Draft memiringkan muka sebesar α agar produk cetakan mudah dilepas", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 5 — Penampang cangkang Thickness dan muka tirus Draft")


def gambar6():
    b = ""
    cx, cy, s = 150, 225, 2.2
    a, bb, tt, dB, hB, k = A_C, B_C, T_C, DB_C, HB_C, K_C
    dasar = [_iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [_iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        b += _poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.18)", "#22d3ee", 1.6)
    b += _silinder(a / 4, bb / 2, tt, tt + hB, dB / 2, cx, cy, s, "#f59e0b")
    b += _silinder(3 * a / 4, bb / 2, tt, tt + k * hB, k * dB / 2, cx, cy, s, "#00e09e")
    p = _iso(a / 4, bb / 2, tt + hB, cx, cy, s)
    b += t(p[0] - dB / 2 * s - 8, p[1] - 6, "Body Boss ⌀d_B × h_B", 10, "#f59e0b", "end")
    p = _iso(3 * a / 4, bb / 2, tt + k * hB, cx, cy, s)
    b += t(p[0] + 4, p[1] - 22, "Clone: Scale k → ⌀k·d_B × k·h_B", 10, "#00e09e")
    p = _iso(a / 2, -3, 0, cx, cy, s)             # di bawah rusuk bawah-depan pelat
    b += t(p[0] + 4, p[1] + 26, "Pelat a × b × t (Pad)", 10.5, "#22d3ee")
    b += t(440, 50, "Draft Clone + Part Union:", 11, "#00e09e", "start", "600")
    b += t(440, 68, "Clone mengikuti asal; Scale (k, k, k)", 10, AX, "start")
    b += t(440, 98, "V_clone = k³·V_boss", 11, TX, "start")
    b += t(440, 116, "V = abt + (π/4)d_B²h_B(1 + k³)", 11, TX, "start")
    b += t(440, 134, f"= {ind(V_RAKIT, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(440, 164, "App::Link: geometri asal, Scale 1", 10, AX, "start")
    b += t(440, 182, "Placement: (a/4, b/2, t) · (3a/4, b/2, t)", 10, AX, "start")
    b += t(440, 200, "Union tidak menambah volume tumpang tindih", 9.5, AX, "start")
    b += teks2(340, 252, "Boss dibuat sekali lalu dipakai ulang sebagai Link (identik) atau Clone (boleh berskala); Union menyatukan ketiganya menjadi satu solid", 11, AX, maks=70)
    return svg(680, 278, b, "Gambar 6 — Pelat, boss, dan Draft Clone berskala k disatukan Part Union")


# ─────────────────────────── gambar kerja praktik terbimbing (Bagian 09) ───────────────────────────
def _g7_garis(x1, y1, x2, y2, warna, w=1.0, dash="", op=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o = f' stroke-opacity="{op:g}"' if op < 1 else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w:g}"{d}{o}/>'


def _g7_bulat(cx, cy, r, stroke, fill="none", fop=1.0, w=1.6, dash=""):
    f = f' fill-opacity="{fop:g}"' if fill != "none" and fop < 1 else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"{f} stroke="{stroke}" stroke-width="{w:g}"{d}/>'


def _g7_kepala(x, y, sudut, warna):
    """Kepala panah dimensi (7 × 3, sama dengan dim_h) berujung di (x, y) menunjuk arah `sudut` (radian, layar)."""
    bx, by = x - 7 * math.cos(sudut), y - 7 * math.sin(sudut)
    px, py = 3 * math.sin(sudut), -3 * math.cos(sudut)
    return f'<polygon points="{x:.1f},{y:.1f} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{warna}"/>'


def _g7_tunjuk(xt, yt, xs, ys, xe, label, warna=AM, ukuran=11, tebal="600"):
    """Garis penunjuk: panah di (xt, yt) ← siku (xs, ys) ← bahu mendatar dari xe; label di ujung bahu."""
    kanan = xe >= xs
    out = _g7_garis(xs, ys, xe, ys, warna, 1) + _panah(xs, ys, xt, yt, warna, 1)
    return out + t(xe + (4 if kanan else -4), ys + 4, label, ukuran, warna, "start" if kanan else "end", tebal)


def gambar7():
    b = ""
    # ── tampak atas (bidang XY): cakram, lubang pusat, pola lubang baut, dan posisi boss ──
    cx, cy, k = 178, 190, 2.0
    R, r0, rbc, rb, rB = D_F / 2 * k, D0_F / 2 * k, DBC_F / 2 * k, DB_F / 2 * k, DB_C / 2 * k

    def pol(r, a):
        return cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))

    b += t(cx, 26, "TAMPAK ATAS (bidang XY)", 11, TX, "middle", "700")
    b += _g7_bulat(cx, cy, R, CY, CY, 0.12, 2)
    b += _g7_bulat(cx, cy, r0, CY, BG, 1, 1.6)
    b += _g7_bulat(cx, cy, rbc, AX, w=0.8, dash="8 3 2 3")                       # lingkaran baut (garis sumbu)
    b += _g7_garis(cx - R - 12, cy, cx + R + 24, cy, AX, 0.8, "8 3 2 3")         # sumbu X lewat origin
    b += _g7_garis(cx, cy - R - 12, cx, cy + R + 34, AX, 0.8, "8 3 2 3")         # sumbu Y (juga garis bantu dimensi 29)
    for a in (30, 150, 270):                                                     # garis sumbu radial ke tiap boss
        p = pol(R + 24 if a == 30 else rbc, a)
        b += _g7_garis(cx, cy, p[0], p[1], AX, 0.8, "8 3 2 3")
    for i in range(N_F):                                                         # 6 lubang baut; induk di sudut 0°
        p = pol(rbc, 360 * i / N_F)
        b += _g7_bulat(p[0], p[1], rb, GR if i == 0 else VI, BG, 1, 1.6)
    for a in (30, 150, 270):                                                     # Boss (Body) 30°, Link 150° dan 270°
        p = pol(rbc, a)
        b += _g7_bulat(p[0], p[1], rB, PK, PK, 0.22, 1.8)
    b += f'<circle cx="{cx}" cy="{cy}" r="2.2" fill="{TX}"/>'
    # sudut boss induk: busur 0° → 30° di luar cakram
    ra = R + 14
    p0, p1 = pol(ra, 0), pol(ra, 30)
    b += f'<path d="M {p0[0]:.1f} {p0[1]:.1f} A {ra:.1f} {ra:.1f} 0 0 0 {p1[0]:.1f} {p1[1]:.1f}" fill="none" stroke="{AM}" stroke-width="1"/>'
    a1 = math.radians(30)                               # ujung 30°: panah searah putaran berlawanan jarum jam
    b += _g7_kepala(p0[0], p0[1], math.pi / 2, AM) + _g7_kepala(p1[0], p1[1], math.atan2(-math.cos(a1), -math.sin(a1)), AM)
    pl = pol(ra + 12, 15)
    b += t(pl[0] + 2, pl[1] + 4, "30°", 11, AM, "start", "600")
    # label boss dan link
    p = pol(R + 24, 30)
    b += t(p[0] + 4, p[1] - 4, "Boss (Body)", 10.5, PK, "start", "600")
    p = pol(rbc + rB, 150)
    q = pol(R + 22, 150)
    b += _g7_tunjuk(p[0], p[1], q[0], q[1], q[0] - 10, "Link 150°", PK, 10.5)
    c270, q = pol(rbc, 270), (cx - 58, cy + R + 16)
    u = math.hypot(q[0] - c270[0], q[1] - c270[1])                              # ujung panah tepat di tepi boss 270°
    p = (c270[0] + rB * (q[0] - c270[0]) / u, c270[1] + rB * (q[1] - c270[1]) / u)
    b += _g7_tunjuk(p[0], p[1], q[0], q[1], q[0] - 10, "Link 270°", PK, 10.5)
    # diameter lubang pusat dan lubang baut (penunjuk)
    p = pol(r0, 205)
    q = pol(R + 16, 205)
    b += _g7_tunjuk(p[0], p[1], q[0], q[1], q[0] - 10, f"⌀{D0_F}")
    p = pol(rbc, 0)
    p = (p[0] + rb * math.cos(math.radians(-40)), p[1] - rb * math.sin(math.radians(-40)))
    q = pol(R + 18, -22)
    b += _g7_tunjuk(p[0], p[1], q[0], q[1], q[0] + 10, f"{N_F}× ⌀{DB_F}")
    b += t(q[0] + 14, q[1] + 19, f"induk ({ind(DBC_F / 2, 0)}, 0)", 10, GR, "start", "600")
    # posisi lubang induk dari origin: 29 = D_bc/2
    xi = pol(rbc, 0)[0]
    yd = cy + R + 26
    b += ext(xi, cy + rb + 2, xi, yd + 8) + dim_h(cx, xi, yd, ind(DBC_F / 2, 0))
    # sumbu koordinat kecil (diturunkan agar label X tidak menempel di bawah label Link 270°)
    ax0, ay0 = 30, cy + R + 46
    b += _panah(ax0, ay0, ax0 + 28, ay0, RD, 1.2) + _panah(ax0, ay0, ax0, ay0 - 28, GN, 1.2)
    b += t(ax0 + 32, ay0 + 4, "X", 10, RD, "start", "700") + t(ax0, ay0 - 32, "Y", 10, GN, "middle", "700")

    # ── tampak depan (bidang XZ): tebal flens dan tinggi boss ──
    ox, oy = 500, 132                                   # titik asal (x = 0, z = 0) di tengah alas flens
    W2, hF, hB, wB = D_F / 2 * k, H_F * k, HB_C * k, DB_C / 2 * k
    b += t(ox, 26, "TAMPAK DEPAN (bidang XZ)", 11, TX, "middle", "700")
    b += f'<rect x="{ox - W2:.1f}" y="{oy - hF:.1f}" width="{2 * W2:.1f}" height="{hF:.1f}" fill="{CY}" fill-opacity="0.12" stroke="{CY}" stroke-width="2"/>'
    xs_boss = [DBC_F / 2 * math.cos(math.radians(a)) * k for a in (150, 270, 30)]
    for xb in xs_boss:
        b += f'<rect x="{ox + xb - wB:.1f}" y="{oy - hF - hB:.1f}" width="{2 * wB:.1f}" height="{hB:.1f}" fill="{PK}" fill-opacity="0.22" stroke="{PK}" stroke-width="1.8"/>'
    b += _g7_garis(ox, oy - hF - hB - 6, ox, oy + 5, AX, 0.8, "8 3 2 3")       # sumbu Z; bebas dari label ⌀14 dan ⌀90
    # dimensi: ⌀90 di bawah, ⌀14 di atas boss tengah, 10 + 10 berantai di kanan
    b += ext(ox - W2, oy + 2, ox - W2, oy + 30) + ext(ox + W2, oy + 2, ox + W2, oy + 30) + dim_h(ox - W2, ox + W2, oy + 24, f"⌀{D_F}")
    yb = oy - hF - hB
    b += ext(ox - wB, yb - 2, ox - wB, yb - 22) + ext(ox + wB, yb - 2, ox + wB, yb - 22) + dim_h(ox - wB, ox + wB, yb - 14, f"⌀{DB_C}")
    xk = ox + W2 + 20
    xbk = ox + xs_boss[2] + wB
    b += ext(ox + W2 + 2, oy, xk + 6, oy) + ext(ox + W2 + 2, oy - hF, xk + 6, oy - hF) + ext(xbk + 2, yb, xk + 6, yb)
    b += dim_v(xk, oy - hF, oy, f"{H_F}", kiri=False) + dim_v(xk, yb, oy - hF, f"{HB_C}", kiri=False)

    # ── catatan parameter yang diketik ──
    x0, y0 = 384, 190
    baris = [(0, f"Lubang ⌀{DB_F}: Pocket Through all, lalu", VI, "600"),        # (indentasi, teks, warna, tebal)
             (12, "PolarPattern Axis Base Z · Angle 360°", AX, ""),
             (12, f"Occurrences {N_F} (lubang induk hijau)", AX, ""),
             (0, "Boss (Body): Placement Base =", PK, "600"),
             (12, f"(D_bc/2·cos 30°, D_bc/2·sin 30°, {H_F})", AX, ""),
             (12, f"D_bc/2 = {ind(DBC_F / 2, 0)} (jari-jari lingkaran baut)", AX, ""),
             (0, "Link ×2: Placement sudut 150° dan 270°", PK, "600"),
             (0, "Part Braket: Rotation Axis (1,0,0), 90°", CY, "600"),
             (0, "Baja ρ = 7,85 g/cm³", AX, ""),
             (0, "Sudut dari sumbu +X, berlawanan jarum jam", AX, "")]
    for i, (dx, s_, c, w_) in enumerate(baris):
        b += t(x0 + dx, y0 + i * 16, s_, 10.5, c, "start", w_)
    b += t(662, 354, "Satuan: mm", 10.5, AM, "end", "600")     # tebal 600 melebar ±0,7 px ke kanan titik jangkar
    return svg(680, 368, b, "Gambar 7 — Gambar kerja braket flens: cakram berlubang, pola lubang baut, dan boss")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-alur">Alur Proyek</a>
  <a href="#m-2d3d">2D → 3D</a>
  <a href="#m-pola">Pola Fitur</a>
  <a href="#m-loft">Loft &amp; Sweep</a>
  <a href="#m-shell">Thickness &amp; Draft</a>
  <a href="#m-blok">Blok</a>
  <a href="#m-rakit">Sub-Assembly</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,64 66,64 66,78 30,78 30,118 16,118" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.4"/>
      <polygon points="16,64 30,52 80,52 66,64" fill="rgba(0,229,255,.08)" stroke="rgba(0,229,255,.4)" stroke-width="1.1"/>
      <polygon points="66,64 80,52 80,66 66,78" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.1"/>
      <polygon points="30,78 44,66 44,106 30,118" fill="none" stroke="rgba(0,229,255,.35)" stroke-width="1.1"/>
      <line x1="30" y1="52" x2="16" y2="64" stroke="rgba(255,179,0,.6)" stroke-width="1.2" stroke-dasharray="3 2"/>
      <circle cx="50" cy="170" r="22" fill="none" stroke="rgba(124,77,255,.55)" stroke-width="1.3"/>
      <circle cx="50" cy="170" r="7" fill="none" stroke="rgba(124,77,255,.45)" stroke-width="1"/>
      <circle cx="65" cy="170" r="3" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1"/>
      <circle cx="35" cy="170" r="3" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1"/>
      <circle cx="50" cy="155" r="3" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1"/>
      <circle cx="50" cy="185" r="3" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1"/>
      <text x="50" y="210" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">Polar ×n</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,40 82,40 66,90 34,90" fill="rgba(0,229,255,.10)" stroke="rgba(0,229,255,.5)" stroke-width="1.3"/>
      <polygon points="18,40 34,32 98,32 82,40" fill="rgba(0,229,255,.06)" stroke="rgba(0,229,255,.35)" stroke-width="1"/>
      <line x1="34" y1="90" x2="42" y2="84" stroke="rgba(0,229,255,.35)" stroke-width="1"/>
      <line x1="66" y1="90" x2="74" y2="84" stroke="rgba(0,229,255,.35)" stroke-width="1"/>
      <rect x="20" y="120" width="60" height="36" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.3"/>
      <rect x="26" y="126" width="48" height="30" fill="none" stroke="rgba(255,179,0,.35)" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="30" cy="180" r="6" fill="rgba(34,197,94,.15)" stroke="rgba(34,197,94,.6)" stroke-width="1.2"/>
      <circle cx="50" cy="180" r="6" fill="rgba(34,197,94,.15)" stroke="rgba(34,197,94,.6)" stroke-width="1.2"/>
      <circle cx="72" cy="180" r="9" fill="rgba(34,197,94,.15)" stroke="rgba(34,197,94,.6)" stroke-width="1.2"/>
      <text x="50" y="208" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">Link · Clone k</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="07">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Draft Wire → Extrude</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">PolarPattern ×n</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">Loft ruled</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">Thickness t</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">App::Link</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">V_clone = k³·V</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">Placement.Base.x</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">Part → Union</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 7 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Proyek Gabungan</span><br>
      <em>2D dan 3D:</em><br>
      <span class="hl-amber">Blok dan Sub-Assembly</span>
    </h1>
    <p class="hero-sub">Pertemuan penutup paruh pertama: komponen rumit diurai menjadi fitur berurutan, kontur 2D Draft ditebalkan Part Extrude dan dipadukan Boolean, lubang dan boss digandakan dengan LinearPattern/PolarPattern/Mirrored, transisi bentuk dibuat dengan Loft ruled dan Sweep, solid dijadikan cangkang dengan Thickness dan dimiringkan Draft, lalu blok yang sama dipakai ulang lewat App::Link dan Draft Clone di dalam Part container yang disusun Placement berekspresi. Setiap bentuk disertai rumus volume agar hasil model dapat diperiksa dari Shape.Volume; tugasnya lima berkas FreeCAD dengan bacaan volume.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Dekomposisi, pola, loft, shell, blok</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>FreeCAD, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — Alur proyek dan dekomposisi fitur
    isi = figure(1, "Dekomposisi fitur komponen rumit dan pohon proyek braket flens", "Komponen diurai menjadi bentuk induk, fitur tambahan, pola, dressing, lalu blok dan rakitan; pohon di kanan adalah proyek praktik Bagian 09.", gambar1())
    isi += cards([
        ("🧩", "Dekomposisi fitur", "Sebelum membuka Sketcher, tulis daftar fitur: bentuk induk (Pad/Extrude/Loft), fitur tambahan (Pocket, Pad kedua, Sweep), pola (Linear/Polar/Mirrored), dressing (Fillet, Chamfer, Thickness, Draft). Daftar ini menjadi pohon fitur Body.", "induk → pola → dressing"),
        ("🧱", "Satu Body per komponen", "Tiap komponen yang bergerak atau dibuat terpisah adalah Body sendiri. Komponen yang muncul berulang (boss, pin, dudukan) cukup dimodelkan sekali lalu dipakai ulang sebagai Link atau Clone (Bagian 06).", "1 Body = 1 komponen"),
        ("📐", "2D tetap berguna", "Kontur yang sudah digambar di Draft (Modul 1–4) dapat langsung ditebalkan Part Extrude; Sketch dipakai bila kontur harus terikat ke muka Body. Keduanya dipadukan lewat Boolean.", "Draft · Sketch · Boolean"),
        ("🔗", "Rakitan parametrik", "Part container menampung beberapa Body/Link dengan Placement masing-masing; Placement yang diikat ekspresi membuat posisi komponen ikut berubah ketika dimensi induknya berubah.", "Placement + ekspresi"),
    ])
    isi += tabel(["Tahap proyek", "Alat FreeCAD 1.0", "Keluaran", "Dipakai di"],
                 [["Kontur 2D → solid", "Draft Wire (Make Face) → Part Extrude; Sketch → Pad", "Solid induk", "Bagian 02, Tugas 1"],
                  ["Penggandaan fitur", "PartDesign LinearPattern · PolarPattern · Mirrored · MultiTransform", "n salinan fitur", "Bagian 03, Tugas 4"],
                  ["Transisi bentuk", "Part Loft (Ruled/halus) · Sweep · Additive Loft/Pipe", "Solid transisi", "Bagian 04, Tugas 2"],
                  ["Cangkang & tirus", "PartDesign Thickness · Draft; Pad Taper angle", "Dinding tipis, muka miring", "Bagian 05, Tugas 3"],
                  ["Blok dipakai ulang", "App::Link (Std LinkMake) · Draft Clone (Scale) · Part container", "Salinan terikat asal", "Bagian 06, Tugas 5"],
                  ["Sub-assembly", "Placement (Base, Rotation) + ekspresi/Spreadsheet · Part → Boolean Union", "Rakitan & volume total", "Bagian 07, Tugas 5"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 memadukan hasil Modul 1–4 (2D) dengan Modul 5 (3D) lewat Part Extrude dan Boolean (Tugas 1). Bagian 03 menggandakan fitur dengan pola (Tugas 4), Bagian 04 membuat transisi bentuk dengan Loft ruled (Tugas 2), Bagian 05 menjadikan solid cangkang dengan Thickness (Tugas 3), Bagian 06–07 memakai ulang blok dan menyusun sub-assembly dengan Placement (Tugas 5). Bagian 08–09 menutup dengan Python dan praktik braket flens.")
    m += bagian(1, "m-alur", "Alur Proyek Komponen Rumit:<br>Dekomposisi Fitur", "Komponen nyata jarang berupa satu Pad. Bagian ini mengajarkan cara mengurai bentuk menjadi fitur berurutan, memutuskan mana yang menjadi Body sendiri, mana yang digandakan pola, dan mana yang dipakai ulang sebagai blok di dalam sub-assembly.", isi, "ALUR PROYEK")

    # 02 — 2D ke 3D: Draft/Sketch → Part Extrude dan Boolean
    isi = figure(2, "Profil L dari Draft Wire ditebalkan Part Extrude sepanjang L", f"Draft Wire L berukuran W = {W_L}, H = {H_L}, t = {T_L} (Make Face) di-Extrude {L_EX} mm searah Z; luas profil {ind(A_L, 0)} mm² sehingga volumenya {ind(V_L, 1)} mm³.", gambar2())
    isi += formula(1, "Volume Ekstrusi Profil L", r"A_L = W\,t + (H - t)\,t, \qquad V = L\,A_L",
                   r"\(W, H\) = lebar dan tinggi profil L &nbsp;·&nbsp; \(t\) = tebal kaki &nbsp;·&nbsp; \(L\) = panjang ekstrusi. Contoh " + f"W = {W_L}, H = {H_L}, t = {T_L}, L = {L_EX}" + r": \(A_L = " + ind(A_L, 0) + r"\) mm², \(V = " + ind(V_L, 1) + r"\) mm³.",
                   "Ekstrusi adalah prisma: luas profil dikali panjang. Profil L dipecah menjadi dua persegi panjang yang tidak tumpang tindih (kaki mendatar W × t dan kaki tegak (H − t) × t), cara yang sama dipakai untuk profil T, U, atau Z. Extrude.Shape.Volume membaca hasil ini langsung, cara memeriksa Tugas 1.",
                   [("A_L", "Luas profil L (mm²)"), ("W, H", "Lebar dan tinggi profil (mm)"), ("t", "Tebal kaki (mm)"), ("L", "Panjang ekstrusi (mm)"), ("V", "Volume solid (mm³)")])
    isi += tabel(["Parameter Part Extrude", "Pilihan", "Catatan"],
                 [["Base", "Draft Wire/Face, Sketch, atau muka", "Wire tertutup + Make Face → solid; wire terbuka → permukaan"],
                  ["Direction", "Normal · Custom (x, y, z) · Edge", "Normal = tegak lurus bidang profil"],
                  ["Length along / against", "Angka (mm)", "Dua arah sekaligus bila keduanya diisi; Symmetric membagi dua"],
                  ["Create solid", "Centang", "Wajib agar hasilnya punya Volume; tanpa ini hanya Shell"],
                  ["Taper angle", "Sudut (°)", "Sisi miring (tirus) langsung saat ekstrusi"],
                  ["Boolean (Part)", "Cut · Fuse (Union) · Common · Section", "Memadukan hasil Extrude dengan solid lain; Refine menyatukan muka sebidang"]])
    isi += anim_panel(1, "cyan", "Profil L ditebalkan: Part Extrude tumbuh sepanjang L", "cvExtrude",
                      [("sl_ex_w", "v_ex_w", "Lebar profil W (mm)", 30, 120, 1, 50, "50"),
                       ("sl_ex_h", "v_ex_h", "Tinggi profil H (mm)", 20, 80, 1, 30, "30"),
                       ("sl_ex_t", "v_ex_t", "Tebal kaki t (mm)", 3, 20, 1, 6, "6"),
                       ("sl_ex_l", "v_ex_l", "Panjang ekstrusi L (mm)", 5, 60, 1, 25, "25")],
                      "btnExtrude", "toggleExtrude", "extrudeInfo",
                      "<strong>Cara membaca:</strong> profil L kuning pada bidang XY adalah Draft Wire ber-Make Face; solid biru tumbuh searah Z sampai panjang L lalu berulang (PAUSE menahan panjang penuh). Luas profil dan volume di kanan mengikuti Persamaan (1); ubah t untuk melihat kedua kaki menebal bersama.")
    isi += kotak("info-box", "<strong>🧭 Draft → Extrude atau Sketch → Pad?</strong> Keduanya menghasilkan prisma yang sama. Part Extrude bekerja pada objek apa pun di luar Body dan hasilnya objek lepas yang dipadukan Boolean (cocok untuk kontur warisan Modul 1–4 dan Tugas 1); Pad harus di dalam Body dan langsung menyatu dengan solid Body (cocok untuk pohon fitur parametrik). Untuk komponen yang akan diberi pola dan Thickness, mulailah dari Body.")
    m += bagian(2, "m-2d3d", "Dari 2D ke 3D:<br>Draft/Sketch → Part Extrude dan Boolean", "Kontur 2D yang sudah dikuasai pada Modul 1–4 tidak terbuang: Part Extrude menebalkannya menjadi solid dan Boolean memadukannya dengan solid lain. Bagian ini membahas parameter Extrude, syarat profil, dan rumus volume prisma profil L.", isi, "2D KE 3D")

    # 03 — Pola fitur
    isi = figure(3, "Flens cakram: lubang pusat dan pola polar n lubang baut", f"Cakram ⌀{D_F} × {H_F} dengan lubang pusat ⌀{D0_F} dan {N_F} lubang baut ⌀{DB_F} pada lingkaran baut ⌀{ind(DBC_F, 0)}; volumenya h·(π/4)(D² − d₀² − n·d_b²) = {ind(V_FLENS, 1)} mm³.", gambar3())
    isi += formula(2, "Volume Flens Berpola Polar", r"V = h\,\frac{\pi}{4}\left(D^{2} - d_0^{2} - n\,d_b^{2}\right)",
                   r"\(D\) = diameter cakram &nbsp;·&nbsp; \(h\) = tebal (Pad) &nbsp;·&nbsp; \(d_0\) = diameter lubang pusat &nbsp;·&nbsp; \(n\) = jumlah lubang baut (Occurrences) &nbsp;·&nbsp; \(d_b\) = diameter lubang baut. Contoh " + f"D = {D_F}, h = {H_F}, d₀ = {D0_F}, n = {N_F}, d_b = {DB_F}" + r": \(V = " + ind(V_FLENS, 1) + r"\) mm³.",
                   "Setiap lubang tembus membuang silinder (π/4)·d²·h. PolarPattern menyalin Pocket lubang baut n kali dengan sudut 360°/n, sehingga suku n·d_b² muncul otomatis; posisi lingkaran baut D_bc tidak memengaruhi volume selama lubang tidak saling memotong dan tidak keluar dari cakram. Rumus ini yang memeriksa Tugas 4.",
                   [("V", "Volume flens (mm³)"), ("D, h", "Diameter dan tebal cakram (mm)"), ("d_0", "Diameter lubang pusat (mm)"), ("n", "Jumlah lubang baut"), ("d_b", "Diameter lubang baut (mm)")])
    isi += tabel(["Pola (Part Design)", "Masukan", "Hasil", "Catatan"],
                 [["<strong>LinearPattern</strong>", "Fitur asal, Direction (sumbu/rusuk), Length, Occurrences", "Deret salinan sepanjang garis", "Mode Overall length atau Offset (jarak antar salinan) pada 1.0"],
                  ["<strong>PolarPattern</strong>", "Fitur asal, Axis (Z Body / normal sketsa), Angle, Occurrences", "Salinan melingkar 360°/n", "Untuk lubang baut, gigi, sirip; Tugas 4"],
                  ["<strong>Mirrored</strong>", "Fitur asal, Plane (XY/XZ/YZ atau muka)", "Cermin fitur", "Bentuk simetris cukup dibuat separuh"],
                  ["<strong>MultiTransform</strong>", "Gabungan beberapa transformasi berurutan", "Pola dari pola (mis. polar lalu linear)", "Satu fitur, banyak transformasi"],
                  ["<strong>Draft Array</strong> (Ortho/Polar)", "Objek apa pun (bukan fitur Body)", "Objek array lepas", "Untuk Part/Draft di luar Body; Modul 2"]])
    isi += anim_panel(2, "violet", "Pola polar lubang baut: jumlah n dan diameter berubah", "cvPolar",
                      [("sl_po_n", "v_po_n", "Jumlah lubang n (Occurrences)", 3, 12, 1, 6, "6"),
                       ("sl_po_D", "v_po_D", "Diameter cakram D (mm)", 60, 140, 1, 90, "90"),
                       ("sl_po_d0", "v_po_d0", "Diameter lubang pusat d₀ (mm)", 10, 50, 1, 26, "26"),
                       ("sl_po_db", "v_po_db", "Diameter lubang baut d_b (mm)", 4, 14, 1, 7, "7"),
                       ("sl_po_h", "v_po_h", "Tebal cakram h (mm)", 5, 30, 1, 10, "10")],
                      "btnPolar", "togglePolar", "polarInfo",
                      "<strong>Cara membaca:</strong> lubang induk hijau disketsa pada lingkaran baut D_bc = (D + d₀)/2; PolarPattern menyalinnya satu per satu mengelilingi sumbu Z dengan sudut 360°/n (PAUSE menahan pola lengkap). Volume di kanan mengikuti Persamaan (2); tambah n dan perhatikan suku n·d_b² membesar.")
    isi += kotak("warning-box", "⚠️ <strong>Pola yang gagal:</strong> salinan yang saling tumpang tindih atau keluar dari solid membuat PolarPattern/LinearPattern menolak (“transformed shape does not intersect support” atau hasil kosong). Periksa D_bc terhadap d₀ dan D: lubang baut harus berada di antara tepi lubang pusat dan tepi cakram dengan sisa daging cukup, dan Occurrences × d_b tidak boleh melebihi keliling lingkaran baut.")
    m += bagian(3, "m-pola", "Pola Fitur:<br>LinearPattern, PolarPattern, Mirrored, MultiTransform", "Lubang baut, sirip, gigi, dan slot berulang tidak digambar satu per satu. Bagian ini membahas empat pola Part Design, parameternya, syarat agar pola berhasil, dan rumus volume flens berlubang yang dipakai Tugas 4.", isi, "POLA FITUR")

    # 04 — Loft dan Sweep lanjutan
    isi = figure(4, "Loft ruled antara dua persegi panjang sepusat pada z = 0 dan z = h", f"Persegi panjang {A1} × {B1} (z = 0) dan {A2} × {B2} (z = {H_LO}) dihubungkan Loft ruled; penampang pada ketinggian z berubah linear sehingga volumenya {ind(V_LOFT, 1)} mm³ menurut Persamaan (3).", gambar4())
    isi += formula(3, "Volume Loft Ruled Dua Persegi Panjang Sepusat", r"V = h\left[a_1 b_1 + \frac{a_1\,\Delta b + b_1\,\Delta a}{2} + \frac{\Delta a\,\Delta b}{3}\right], \quad \Delta a = a_2 - a_1,\ \Delta b = b_2 - b_1",
                   r"\(a_1 \times b_1\) = profil bawah (z = 0) &nbsp;·&nbsp; \(a_2 \times b_2\) = profil atas (z = h) &nbsp;·&nbsp; \(h\) = jarak kedua profil. Contoh " + f"{A1} × {B1} → {A2} × {B2}, h = {H_LO}" + r": \(V = " + ind(V_LOFT, 1) + r"\) mm³.",
                   "Pada loft ruled, titik seiring kedua profil dihubungkan garis lurus, sehingga penampang pada ketinggian z adalah persegi panjang a(z) × b(z) dengan a dan b berubah linear. Mengintegralkan a(z)·b(z) dari 0 sampai h memberi tiga suku di atas; bila a₂ = a₁ dan b₂ = b₁ rumus kembali menjadi prisma a·b·h. Loft halus (tanpa Ruled) menginterpolasi B-spline sehingga volumenya sedikit berbeda; Tugas 2 mewajibkan Ruled agar cocok dengan rumus.",
                   [("V", "Volume loft (mm³)"), ("a_1, b_1", "Sisi profil bawah (mm)"), ("a_2, b_2", "Sisi profil atas (mm)"), ("h", "Jarak antar profil (mm)"), (r"\Delta a, \Delta b", "Selisih sisi atas − bawah (mm)")])
    isi += tabel(["Fitur", "Masukan", "Opsi penting", "Catatan"],
                 [["<strong>Part Loft</strong>", "≥ 2 profil (Sketch/Wire) pada bidang berbeda", "Create solid · Ruled surface · Closed", "Jumlah titik profil sebaiknya sama agar tidak terpuntir"],
                  ["<strong>Additive Loft</strong> (Part Design)", "Sketsa pertama + sketsa berikutnya", "Ruled · Closed", "Versi Body dari Loft; menyatu dengan solid"],
                  ["<strong>Part Sweep</strong>", "Profil + lintasan (Sweep Path)", "Create solid · Frenet", "Frenet menjaga orientasi profil pada lintasan 3D/heliks"],
                  ["<strong>Additive Pipe</strong>", "Profil + lintasan + (opsional) sketsa bantu", "Transition Transformed/Right corner/Round corner", "Mode Auxiliary mengikat orientasi profil ke spine kedua"],
                  ["<strong>Transisi profil</strong>", "Bulat → persegi, besar → kecil", "Profil dengan jumlah tepi berbeda", "Bagi lingkaran menjadi 4 busur agar seiring dengan 4 sisi persegi"]])
    isi += anim_panel(3, "amber", "Loft dua persegi panjang: penampang bergerak dari z = 0 ke z = h", "cvLoft",
                      [("sl_lf_a1", "v_lf_a1", "Sisi bawah a₁ (mm)", 30, 100, 1, 50, "50"),
                       ("sl_lf_b1", "v_lf_b1", "Sisi bawah b₁ (mm)", 20, 70, 1, 30, "30"),
                       ("sl_lf_a2", "v_lf_a2", "Sisi atas a₂ (mm)", 10, 80, 1, 25, "25"),
                       ("sl_lf_b2", "v_lf_b2", "Sisi atas b₂ (mm)", 10, 60, 1, 15, "15"),
                       ("sl_lf_h", "v_lf_h", "Jarak profil h (mm)", 10, 80, 1, 40, "40")],
                      "btnLoft", "toggleLoft", "loftInfo",
                      "<strong>Cara membaca:</strong> bidang merah muda menyapu dari profil bawah ke profil atas; ukuran penampang a(z) × b(z) dan luasnya ditampilkan tiap saat (PAUSE menahan posisi). Volume total di kanan mengikuti Persamaan (3); coba a₂ > a₁ untuk loft yang melebar ke atas.")
    isi += kotak("tip-box", "💡 <strong>Agar loft tidak terpuntir:</strong> gambar kedua profil dengan urutan titik yang sama (mulai dari sudut kiri-bawah, berlawanan arah jarum jam) dan konstrain Symmetric terhadap titik asal sehingga keduanya sepusat pada sumbu Z. Sketsa kedua dibuat pada bidang XY lalu digeser lewat Attachment Offset z = h, bukan dengan menggeser geometri di dalam sketsa.")
    m += bagian(4, "m-loft", "Loft dan Sweep Lanjutan:<br>Transisi Profil dan Ruled", "Corong, transisi saluran, dan pegangan berubah bentuk sepanjang tingginya. Bagian ini melanjutkan sweep Modul 5 dengan Loft antar profil berbeda ukuran, opsi Ruled dan Closed, sweep Frenet, serta rumus volume loft ruled yang memeriksa Tugas 2.", isi, "LOFT DAN SWEEP")

    # 05 — Thickness dan Draft
    isi = figure(5, "Penampang cangkang Thickness dan muka tirus Draft", f"Balok {A_S} × {B_S} × {H_S} dijadikan cangkang terbuka atas dengan dinding {ind(T_S, 1)} mm; volumenya {ind(V_SHELL, 1)} mm³. Di tengah, muka tirus α = {ALPHA}° menyusutkan sisi atas sebesar 2h·tan α = {ind(SUSUT, 2)} mm.", gambar5())
    isi += formula(4, "Volume Cangkang Thickness (Muka Atas Dibuang)", r"V = a\,b\,h - (a - 2t)(b - 2t)(h - t)",
                   r"\(a, b, h\) = ukuran luar balok (tetap) &nbsp;·&nbsp; \(t\) = tebal dinding ke dalam. Contoh " + f"{A_S} × {B_S} × {H_S}, t = {ind(T_S, 1)}" + r": rongga \(" + ind(V_RONGGA, 1) + r"\) mm³, \(V = " + ind(V_SHELL, 1) + r"\) mm³.",
                   "Thickness membuang muka yang dipilih dan mengoffset muka lainnya sejauh t ke dalam, sehingga rongga adalah balok (a − 2t) × (b − 2t) yang tingginya h − t (dasar tetap ada, atas terbuka). Untuk balok cembung, offset ke dalam menghasilkan sudut rongga yang tajam apa pun Join type-nya. Rumus ini yang memeriksa Tugas 3; bila dua muka dibuang (atas dan bawah), tinggi rongga menjadi h.",
                   [("V", "Volume cangkang (mm³)"), ("a, b, h", "Ukuran luar balok (mm)"), ("t", "Tebal dinding (mm)")])
    isi += formula(5, "Muka Tirus (Draft) dan Penyusutan Sisi", r"a_{atas} = a - 2h\tan\alpha, \qquad b_{atas} = b - 2h\tan\alpha",
                   r"\(\alpha\) = sudut tirus terhadap arah tarik &nbsp;·&nbsp; \(h\) = tinggi muka yang dimiringkan. Contoh " + f"a = {A_S}, b = {B_S}, h = {H_S}, α = {ALPHA}°" + r": \(a_{atas} = " + ind(A_S - SUSUT, 2) + r"\), \(b_{atas} = " + ind(B_S - SUSUT, 2) + r"\) mm.",
                   "Draft memutar setiap muka pilihan sebesar α mengelilingi garis potongnya dengan bidang netral (neutral plane), biasanya muka dasar. Balok yang diberi tirus pada keempat sisi menjadi loft ruled antara a × b dan a_atas × b_atas, sehingga volumenya mengikuti Persamaan (3). Pad dengan Taper angle memberi hasil yang sama saat ekstrusi.",
                   [(r"\alpha", "Sudut tirus (°)"), ("h", "Tinggi muka miring (mm)"), ("a_{atas}, b_{atas}", "Sisi atas setelah tirus (mm)")])
    isi += tabel(["Fitur dressing", "Masukan", "Opsi", "Tips"],
                 [["<strong>Thickness</strong>", "Muka yang dibuang (satu atau lebih); Thickness t", "Mode Skin/Pipe/RectoVerso · Join Arc/Intersection · Reversed", "Buat setelah semua Pad/Pocket; t harus lebih kecil dari fillet terkecil pada muka"],
                  ["<strong>Draft</strong>", "Muka yang dimiringkan; Angle; Neutral plane; Pull direction", "Reverse direction", "Pilih bidang netral = muka dasar agar ukuran dasar tetap"],
                  ["<strong>Pad Taper angle</strong>", "Sudut saat Pad/Pocket", "Positif mengecil, negatif membesar", "Cara cepat tirus untuk prisma tunggal"],
                  ["<strong>Fillet / Chamfer</strong>", "Rusuk; radius/ukuran", "Modul 5", "Fillet rusuk luar sebelum Thickness → dinding dalam ikut membulat"]])
    isi += anim_panel(4, "pink", "Thickness: balok menjadi cangkang dengan tebal dinding t berubah", "cvShell",
                      [("sl_sh_a", "v_sh_a", "Panjang a (mm)", 40, 120, 1, 70, "70"),
                       ("sl_sh_b", "v_sh_b", "Lebar b (mm)", 30, 80, 1, 45, "45"),
                       ("sl_sh_h", "v_sh_h", "Tinggi h (mm)", 20, 60, 1, 35, "35"),
                       ("sl_sh_t", "v_sh_t", "Tebal dinding t (mm)", 1, 10, 0.5, 2.5, "2,5")],
                      "btnShell", "toggleShell", "shellInfo",
                      "<strong>Cara membaca:</strong> kiri, balok terbuka atas dalam pandangan isometrik dengan rongga yang berdenyut mengikuti t (PAUSE menahan t penuh); kanan, penampang tegak menunjukkan dinding dan dasar setebal t. Volume cangkang, persentase bahan yang tersisa, dan massa baja mengikuti Persamaan (4).")
    isi += kotak("warning-box", "⚠️ <strong>Thickness yang gagal:</strong> tebal t lebih besar dari radius fillet pada muka yang dioffset, muka yang dibuang tidak bersebelahan, atau solid punya rongga lain. Kecilkan t, buat fillet setelah Thickness, atau pilih Mode Pipe. Periksa juga arah: bila hasilnya membesar ke luar (ukuran luar berubah), balikkan Reversed sampai ukuran luar tetap seperti Tugas 3.")
    m += bagian(5, "m-shell", "Thickness dan Draft:<br>Cangkang dan Sudut Tirus", "Kotak plastik, pelindung lembaran, dan bodi tuang adalah cangkang berdinding tipis dengan muka miring. Bagian ini membahas Thickness (shell), Draft, Taper angle, rumus volume cangkang untuk Tugas 3, dan penyusutan sisi akibat tirus.", isi, "THICKNESS DAN DRAFT")

    # 06 — Blok: App::Link, Draft Clone, Part container
    isi = figure(6, "Pelat, boss, dan Draft Clone berskala k disatukan Part Union", f"Pelat {A_C} × {B_C} × {T_C} membawa boss ⌀{DB_C} × {HB_C} dan Clone-nya dengan Scale {ind(K_C, 1)} (⌀{ind(K_C * DB_C, 0)} × {ind(K_C * HB_C, 0)}); Union ketiganya bervolume {ind(V_RAKIT, 1)} mm³.", gambar6())
    isi += formula(6, "Volume Blok Berskala dan Rakitan Union", r"V_{clone} = k^{3}\,V_{asal}, \qquad V = a\,b\,t + \frac{\pi}{4}d_B^{2}h_B\left(1 + k^{3}\right)",
                   r"\(k\) = faktor Scale seragam Draft Clone &nbsp;·&nbsp; \(a \times b \times t\) = pelat &nbsp;·&nbsp; \(d_B, h_B\) = diameter dan tinggi boss asal. Contoh " + f"k = {ind(K_C, 1)}, boss ⌀{DB_C} × {HB_C}" + r": \(V_{boss} = " + ind(V_BOSS, 1) + r"\), \(V = " + ind(V_RAKIT, 1) + r"\) mm³.",
                   "Menskalakan semua panjang k kali membuat luas k² kali dan volume k³ kali; Link (Scale 1) bervolume sama dengan asalnya. Union (Fuse) hanya menjumlahkan volume bila komponen tidak saling menembus; boss yang berdiri di atas pelat menempel pada muka sebidang sehingga tidak ada tumpang tindih. Rumus ini memeriksa Tugas 5.",
                   [("V_{clone}", "Volume clone (mm³)"), ("k", "Faktor Scale seragam"), ("V_{asal}", "Volume objek asal (mm³)"), ("d_B, h_B", "Diameter dan tinggi boss (mm)"), ("V", "Volume Union (mm³)")])
    isi += tabel(["Cara memakai ulang", "Objek", "Ikut berubah bila asal disunting?", "Placement / Scale", "Kapan dipakai"],
                 [["Copy–paste (Ctrl+C/V)", "Salinan lepas", "Tidak", "Bebas / tidak", "Variasi yang akan disunting terpisah"],
                  ["<strong>App::Link</strong> (Std LinkMake)", "Rujukan ke objek asal", "Ya, otomatis", "Placement sendiri; Scale seragam (LinkTransform)", "Komponen identik berulang; rakitan; berkas ringan"],
                  ["<strong>Draft Clone</strong>", "Objek turunan dengan Shape sendiri", "Ya (recompute)", "Placement + Scale (x, y, z) per sumbu", "Salinan berskala; Tugas 5"],
                  ["<strong>Part container</strong> (Std Part)", "Wadah beberapa Body/Link", "—", "Placement memindahkan seluruh isi", "Sub-assembly; Bagian 07"],
                  ["<strong>SubShapeBinder</strong>", "Salinan geometri lintas Body", "Ya", "Mengikuti asal", "Memakai muka/rusuk Body lain sebagai acuan sketsa"]])
    isi += cards([
        ("🔗", "App::Link", "Pilih Body lalu Std LinkMake: objek baru yang menampilkan geometri asal tanpa menyalinnya. Ubah sketsa boss asal, semua link ikut. Link bisa diberi Placement dan Scale seragam; Link Array menggandakannya sekaligus.", "identik · ringan"),
        ("🧬", "Draft Clone", "Draft → Clone membuat objek dengan Shape hasil salin yang tetap terikat asal; properti Scale (x, y, z) mengubah ukurannya per sumbu. Volume clone berskala seragam k adalah k³ kali asal.", "Scale k → k³·V"),
        ("📦", "Part container", "Std Part (App::Part) mengelompokkan Body, Link, dan Clone; Placement Part memindahkan seluruh isinya. Part di dalam Part membentuk sub-assembly bertingkat.", "wadah rakitan"),
        ("➕", "Part Union", "Part → Boolean → Union menyatukan beberapa solid (Body, Link, Clone) menjadi satu solid untuk membaca volume total, massa, atau ekspor STEP tunggal; Refine menghapus rusuk sebidang.", "Fusion.Shape.Volume"),
    ])
    isi += kotak("info-box", "<strong>🧭 Link atau Clone?</strong> Pakai App::Link bila salinan harus identik (baut, boss, pin standar): geometri tidak digandakan sehingga berkas tetap kecil dan pergantian asal serentak. Pakai Draft Clone bila salinan perlu skala berbeda per sumbu atau harus punya Shape sendiri untuk Boolean di Part Workbench, seperti boss kedua pada Tugas 5.")
    m += bagian(6, "m-blok", "Blok yang Dipakai Ulang:<br>App::Link, Draft Clone, Part Container", "Boss, dudukan, dan pin yang sama muncul berkali-kali dalam satu proyek. Bagian ini membandingkan salin-tempel, App::Link, Draft Clone berskala, dan Part container, serta rumus volume clone dan rakitan Union yang dipakai Tugas 5.", isi, "BLOK")

    # 07 — Sub-assembly dan Placement
    isi = formula(7, "Placement: Transformasi Posisi Komponen", r"\mathbf{p}_{global} = \mathbf{R}(\theta,\ \mathbf{n})\,\mathbf{p}_{lokal} + \mathbf{T}, \qquad \mathbf{T} = (x, y, z),\ \mathbf{R} = \text{rotasi } \theta \text{ terhadap sumbu } \mathbf{n}",
                  r"\(\mathbf{T}\) = Placement.Base &nbsp;·&nbsp; \(\mathbf{R}\) = Placement.Rotation (Axis \(\mathbf{n}\), Angle \(\theta\)). Contoh boss di (a/4, b/2, t) pada pelat " + f"{A_C} × {B_C} × {T_C}" + r": \(\mathbf{T} = (" + f"{A_C / 4:g}, {B_C / 2:g}, {T_C}" + r")\); Part yang diputar 90° terhadap X memutar semua isinya sekaligus.",
                  "Setiap Body, Link, Clone, dan Part punya Placement: rotasi dulu terhadap titik asal lokal, lalu translasi. Placement Part container berlapis di atas Placement isinya (getGlobalPlacement menggabungkannya). Mengikat komponen Placement ke ekspresi membuat rakitan mengikuti dimensi induk tanpa digeser manual; Assembly Workbench dengan joint dibahas pada Modul 11.",
                  [(r"\mathbf{p}_{lokal}", "Titik pada koordinat objek (mm)"), (r"\mathbf{T}", "Translasi Placement.Base (mm)"), (r"\mathbf{R}", "Rotasi (Axis, Angle)"), (r"\theta", "Sudut rotasi (°)")])
    isi += tabel(["Properti Placement", "Isi", "Cara mengisi", "Contoh ekspresi"],
                 [["Base (x, y, z)", "Translasi", "Panel Data → Placement → Position; atau Edit → Placement", "<code>Pelat.Sketch.Constraints.a / 4</code> atau <code>Param.a / 4</code>"],
                  ["Rotation Axis", "Sumbu putar (vektor satuan)", "Axis (0,0,1) untuk putaran sekitar Z", "<code>&lt;&lt;Boss&gt;&gt;.Placement.Rotation.Axis</code>"],
                  ["Rotation Angle", "Sudut (°)", "Angle", "<code>360 / Param.n</code>"],
                  ["Ekspresi (fx)", "Rumus yang mengikat properti", "Klik ikon fx di properti; rujuk objek lain dengan &lt;&lt;Label&gt;&gt;", "<code>Placement.Base.z = &lt;&lt;Pelat&gt;&gt;.Pad.Length</code>"],
                  ["Spreadsheet alias", "Parameter terpusat", "Spreadsheet → alias sel (a, b, t, k)", "<code>Param.k</code> pada Scale Clone"]])
    isi += cards([
        ("⚓", "Komponen dasar (ground)", "Tetapkan satu komponen (pelat/rangka) pada Placement identitas sebagai acuan; komponen lain diposisikan relatif terhadapnya. Tanpa acuan, seluruh rakitan bisa bergeser bersama tanpa disadari.", "Placement = identitas"),
        ("🧮", "Urutan transformasi", "FreeCAD memutar dulu, lalu menggeser: boss yang diputar 90° terhadap X di titik asal lokalnya baru dipindahkan ke Base. Putar objek di titik asalnya sendiri sebelum memberi translasi agar hasilnya mudah ditebak.", "R lalu T"),
        ("🏗️", "Sub-assembly bertingkat", "Part “Stasiun” berisi Part “Braket” yang berisi Body Flens dan Link Boss; Placement tiap lapis ditumpuk. Memindahkan Stasiun memindahkan semua tanpa mengubah Placement isinya.", "Part di dalam Part"),
        ("📏", "Memeriksa rakitan", "Std Measure Distance antar muka dua komponen, Part → Check geometry, dan Boolean Common (irisan harus kosong) memastikan komponen tidak saling menembus; volume Union harus sama dengan jumlah volume komponen.", "Common = kosong"),
    ])
    isi += kotak("tip-box", "💡 <strong>Ekspresi yang tahan perubahan:</strong> simpan a, b, t, d_B, h_B, k pada Spreadsheet beralias, ikat konstrain sketsa dan Placement ke alias itu, lalu ubah satu sel untuk menguji: boss tetap di seperempat panjang pelat, clone tetap di tiga perempat, dan volume Union berubah sesuai Persamaan (6). Tugas 5 boleh dikerjakan tanpa Spreadsheet, tetapi ekspresi mencegah boss keluar dari pelat saat dimensi diubah.")
    m += bagian(7, "m-rakit", "Sub-Assembly Sederhana:<br>Placement dan Ekspresi", "Beberapa Body, Link, dan Clone menjadi rakitan ketika posisinya diatur dan saling terikat. Bagian ini membahas Placement (Base, Rotation), Part container bertingkat, ekspresi dan Spreadsheet untuk posisi parametrik, serta cara memeriksa rakitan sebelum dibaca volumenya.", isi, "SUB-ASSEMBLY")

    # 08 — Python console
    isi = kode("Python console — Draft Wire L → Part Extrude, lalu flens dengan Pocket + PolarPattern", f'''import FreeCAD as App, Part, Draft, Sketcher, math
doc = App.newDocument("Latihan7")
V = App.Vector
W, H, t, L = {W_L}, {H_L}, {T_L}, {L_EX}
wire = Draft.make_wire([V(0,0,0), V(W,0,0), V(W,t,0), V(t,t,0), V(t,H,0), V(0,H,0)], closed=True, face=True)
ext = doc.addObject("Part::Extrusion", "Extrude")
ext.Base = wire; ext.DirMode = "Normal"; ext.LengthFwd = L; ext.Solid = True
doc.recompute()
print(f"Volume Extrude = {{ext.Shape.Volume:.2f}} mm^3  (rumus L*(W*t+(H-t)*t) = {{L*(W*t+(H-t)*t)}})")   # {ind(V_L, 2)}
# Flens: Pad lingkaran D, Pocket lubang pusat d0, Pocket lubang baut db di (Dbc/2, 0) + PolarPattern n
D, d0, db, h, n = {D_F}, {D0_F}, {DB_F}, {H_F}, {N_F}
Dbc = (D + d0) / 2
xy = lambda b: [o for o in b.Origin.OriginFeatures if o.Role == "XY_Plane"][0]
body = doc.addObject("PartDesign::Body", "Flens")
def sketsa(nama, geom, z=0):
    sk = body.newObject("Sketcher::SketchObject", nama)
    sk.AttachmentSupport = (xy(body), [""]); sk.MapMode = "FlatFace"
    sk.AttachmentOffset = App.Placement(V(0,0,z), App.Rotation())
    sk.addGeometry(geom, False); return sk
pad = body.newObject("PartDesign::Pad", "Pad"); pad.Profile = sketsa("Sketch", Part.Circle(V(0,0,0), V(0,0,1), D/2)); pad.Length = h
p1 = body.newObject("PartDesign::Pocket", "Pusat"); p1.Profile = sketsa("Sketch001", Part.Circle(V(0,0,0), V(0,0,1), d0/2), h); p1.Type = 1
p2 = body.newObject("PartDesign::Pocket", "Baut"); p2.Profile = sketsa("Sketch002", Part.Circle(V(Dbc/2,0,0), V(0,0,1), db/2), h); p2.Type = 1
pp = body.newObject("PartDesign::PolarPattern", "PolarPattern")
pp.Originals = [p2]; pp.Axis = (p2.Profile, ["N_Axis"]); pp.Angle = 360; pp.Occurrences = n
doc.recompute()
print(f"Volume flens = {{body.Shape.Volume:.2f}} mm^3  (rumus {{h*math.pi/4*(D**2-d0**2-n*db**2):.2f}})")   # {ind(V_FLENS, 2)}''', "Python (FreeCAD)")
    isi += kode("Python console — memeriksa Loft ruled, Thickness, dan Draft dengan Part API", f'''import FreeCAD as App, Part, math
V = App.Vector
a1, b1, a2, b2, h = {A1}, {B1}, {A2}, {B2}, {H_LO}
kotak = lambda a, b, z: Part.makePolygon([V(-a/2,-b/2,z), V(a/2,-b/2,z), V(a/2,b/2,z), V(-a/2,b/2,z), V(-a/2,-b/2,z)])
loft = Part.makeLoft([kotak(a1,b1,0), kotak(a2,b2,h)], True, True)      # solid=True, ruled=True
da, db_ = a2 - a1, b2 - b1
print(f"Loft ruled = {{loft.Volume:.2f}} (rumus {{h*(a1*b1 + (a1*db_ + b1*da)/2 + da*db_/3):.2f}})")   # {ind(V_LOFT, 2)}
halus = Part.makeLoft([kotak(a1,b1,0), kotak(a2,b2,h)], True, False)
print(f"Loft halus (B-spline) = {{halus.Volume:.2f}}  -> berbeda dari ruled")
# Thickness: balok a x b x hh, muka atas dibuang, tebal t ke dalam (offset negatif)
a, b, hh, t = {A_S}, {B_S}, {H_S}, {T_S}
balok = Part.makeBox(a, b, hh)
atas = [f for f in balok.Faces if abs(f.CenterOfMass.z - hh) < 1e-6]
cangkang = balok.makeThickness(atas, -t, 1e-4)
print(f"Cangkang = {{cangkang.Volume:.2f}} (rumus {{a*b*hh - (a-2*t)*(b-2*t)*(hh-t):.2f}})")   # {ind(V_SHELL, 2)}
print(f"Sisa bahan = {{100*cangkang.Volume/balok.Volume:.1f}} %, massa baja = {{cangkang.Volume/1000*{RHO_BAJA}:.1f}} g")
# Draft (tirus) alpha derajat pada keempat sisi = loft ruled a x b -> (a-2hh tan) x (b-2hh tan)
alpha = math.radians({ALPHA}); s = 2*hh*math.tan(alpha)
tirus = Part.makeLoft([kotak(a,b,0), kotak(a-s,b-s,hh)], True, True)
print(f"Sisi atas tirus = {{a-s:.2f}} x {{b-s:.2f}}, volume = {{tirus.Volume:.2f}} (Persamaan (3))")''', "Python (FreeCAD)")
    isi += kode("Python console — App::Link, Draft Clone berskala, Placement berekspresi, Part Union", f'''import FreeCAD as App, Part, Draft, Sketcher, math
doc = App.ActiveDocument or App.newDocument("Latihan7")
V = App.Vector
a, b, t, dB, hB, k = {A_C}, {B_C}, {T_C}, {DB_C}, {HB_C}, {K_C}
ss = doc.addObject("Spreadsheet::Sheet", "Param")
for i, (nama, nilai) in enumerate([("a", a), ("b", b), ("t", t), ("k", k)], 1):
    ss.set(f"A{{i}}", nama); ss.set(f"B{{i}}", str(nilai)); ss.setAlias(f"B{{i}}", nama)
xy = lambda body: [o for o in body.Origin.OriginFeatures if o.Role == "XY_Plane"][0]
def body_pad(nama, geom, tinggi):
    body = doc.addObject("PartDesign::Body", nama)
    sk = body.newObject("Sketcher::SketchObject", nama + "Sketch")
    sk.AttachmentSupport = (xy(body), [""]); sk.MapMode = "FlatFace"
    for g in geom: sk.addGeometry(g, False)
    pad = body.newObject("PartDesign::Pad", nama + "Pad"); pad.Profile = sk; pad.Length = tinggi
    return body
p = [V(0,0,0), V(a,0,0), V(a,b,0), V(0,b,0)]
pelat = body_pad("Pelat", [Part.LineSegment(p[i], p[(i+1)%4]) for i in range(4)], t)
boss = body_pad("Boss", [Part.Circle(V(0,0,0), V(0,0,1), dB/2)], hB)
boss.Placement = App.Placement(V(a/4, b/2, t), App.Rotation())
boss.setExpression("Placement.Base.x", "Param.a / 4")                 # boss ikut bila a diubah
link = doc.addObject("App::Link", "BossLink"); link.LinkedObject = boss  # identik, tanpa salin geometri
link.Placement = App.Placement(V(a/2, b/2, t), App.Rotation())
klon = Draft.make_clone(boss); klon.Label = "BossClone"
klon.Scale = V(k, k, k); klon.Placement = App.Placement(V(3*a/4, b/2, t), App.Rotation())
klon.setExpression("Placement.Base.x", "3 * Param.a / 4"); klon.setExpression("Scale.x", "Param.k")
fusi = doc.addObject("Part::MultiFuse", "Fusion"); fusi.Shapes = [pelat, boss, klon]; fusi.Refine = True
rakit = doc.addObject("App::Part", "SubAssembly")
for o in (pelat, boss, link, klon, fusi): rakit.addObject(o)
rakit.Placement = App.Placement(V(0,0,0), App.Rotation(V(1,0,0), 90))     # seluruh isi ikut berdiri
doc.recompute()
vb = math.pi/4*dB**2*hB
print(f"Link = {{link.Shape.Volume:.2f}} (= Boss {{boss.Shape.Volume:.2f}}); Clone = {{klon.Shape.Volume:.2f}} (= k^3 x {{vb:.2f}} = {{k**3*vb:.2f}})")
print(f"Union pelat+boss+clone = {{fusi.Shape.Volume:.2f}} mm^3 (rumus {{a*b*t + vb*(1+k**3):.2f}})")   # {ind(V_RAKIT, 2)}
print(f"Posisi global boss = {{boss.getGlobalPlacement().Base}}  (Placement Part x isinya)")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (profil L " + ind(V_L, 2) + " mm³, flens " + ind(V_FLENS, 2) + " mm³, loft " + ind(V_LOFT, 2) + " mm³, cangkang " + ind(V_SHELL, 2) + " mm³, rakitan " + ind(V_RAKIT, 2) + " mm³). Tugas meminta model dibuat dengan alat GUI (Draft Wire, Part Extrude, Part Loft, Thickness, Pocket + PolarPattern, Draft Clone, Part Union) agar pohon fiturnya ada di berkas; API di sini untuk memeriksa rumus dan mencoba ekspresi.")
    m += bagian(8, "m-python", "Python Console:<br>Membangun dan Memeriksa Proyek Gabungan", "Cell pertama menebalkan Draft Wire dengan Part Extrude dan membangun flens berpola polar lewat API Part Design; cell kedua memeriksa Loft ruled, Thickness, dan Draft dengan Part API; cell ketiga membuat Link, Clone berskala, Placement berekspresi, Part container, dan Union.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Dekomposisi dan Body Flens", f"Tulis daftar fitur: cakram, lubang pusat, pola lubang baut, boss ×3, rakitan. Part Design → Create body “Flens” → Sketch XY lingkaran ⌀{D_F} berpusat di origin (konstrain Coincident + Diameter) → Pad {H_F} mm."),
               ("2", "Lubang pusat", f"Klik muka atas → Create sketch → lingkaran ⌀{D0_F} sepusat → Pocket Through all. Baca Body.Shape.Volume dan bandingkan dengan (π/4)(D² − d₀²)·h."),
               ("3", "Lubang baut + PolarPattern", f"Sketch di muka atas: satu lingkaran ⌀{DB_F} berpusat di ({ind(DBC_F / 2, 0)}, 0) (konstrain Distance dari origin + Point on horizontal axis) → Pocket Through all → PolarPattern: Axis Base Z, Angle 360°, Occurrences {N_F}. Cocokkan volume dengan Persamaan (2) = {ind(V_FLENS, 1)} mm³."),
               ("4", "Boss sekali saja", f"Create body “Boss” → Sketch XY lingkaran ⌀{DB_C} di origin → Pad {HB_C}. Atur Placement Body Boss ke (0, 0, {H_F}) lalu geser ke sudut 30° pada lingkaran baut: Base = (D_bc/2·cos 30°, D_bc/2·sin 30°, {H_F}) dengan ekspresi."),
               ("5", "Link boss ×2", "Pilih Body Boss → Std LinkMake dua kali; beri Placement pada sudut 150° dan 270° (ekspresi cos/sin) sehingga tiga boss berselang-seling dengan enam lubang baut. Ubah diameter sketsa boss → ketiga boss ikut berubah."),
               ("6", "Part container dan rakitan", "Std Part “Braket” → seret Flens, Boss, dan dua Link ke dalamnya. Ubah Placement Part: Rotation Axis (1,0,0) Angle 90° sehingga flens berdiri tegak. Part → Boolean → Union (Flens + Boss + Link) → volume total = flens + 3 × boss."),
               ("7", "Periksa dan simpan", "Boolean Common Boss–Flens harus kosong (tidak menembus); Std Measure Distance antar boss = D_bc·sin 60°. Hitung massa baja (ρ = 7,85 g/cm³) dari Fusion.Shape.Volume/1000; Ctrl+S → <code>Latihan7_NIM.FCStd</code>.")]
    isi = figure(7, "Gambar kerja braket flens: cakram, pola lubang baut, dan boss", f"Tampak atas dan tampak depan benda yang dibangun pada praktik ini, semua ukuran dalam mm: cakram ⌀{D_F} × {H_F} dengan lubang pusat ⌀{D0_F} (langkah 1–2), {N_F} lubang ⌀{DB_F} berpola polar dengan lubang induk di ({ind(DBC_F / 2, 0)}, 0) (langkah 3), dan tiga boss ⌀{DB_C} × {HB_C} di lingkaran baut (langkah 4–5). Catatan kanan bawah merangkum nilai PolarPattern, Placement, rotasi Part, dan massa jenis yang diketik pada langkah 3–7.", gambar7())
    isi += '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["Part Extrude menghasilkan permukaan tanpa Volume", "Wire terbuka, Make Face false, atau Create solid tidak dicentang", "Tutup wire (Close), Make Face = true, centang Create solid"],
                  ["PolarPattern kosong / pesan “does not intersect support”", "Lubang induk keluar cakram atau salinan saling memotong", "Perkecil d_b atau Occurrences; pastikan D_bc di antara d₀ dan D"],
                  ["Loft terpuntir atau menyilang", "Urutan/jumlah titik kedua profil berbeda", "Gambar kedua profil dengan urutan titik sama; jumlah tepi sama"],
                  ["Volume loft tidak cocok rumus", "Ruled surface tidak dicentang (B-spline) atau profil tidak sepusat", "Centang Ruled; konstrain Symmetric ke origin"],
                  ["Thickness gagal atau membesar ke luar", "t > radius fillet; muka tak bersebelahan; arah terbalik", "Kecilkan t; buat fillet setelah shell; balikkan Reversed"],
                  ["Link tidak tampak / tidak ikut berubah", "Link dibuat dari salinan, bukan objek asal; atau salin-tempel", "Std LinkMake dari Body asal; hapus salinan lepas"],
                  ["Union bervolume lebih kecil dari jumlah komponen", "Komponen saling menembus (tumpang tindih)", "Periksa Placement; Boolean Common harus kosong"],
                  ["Clone bervolume sama dengan asal", "Scale masih (1, 1, 1)", "Isi Scale (k, k, k) pada properti Clone, recompute"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) pohon fitur sesuai permintaan tiap tugas (Draft Wire → Extrude; dua Sketch → Loft ruled; Pad → Thickness; Pad → Pocket → Pocket → PolarPattern; Pelat + Boss + Clone → Union); (2) semua sketsa fully constrained dan sepusat bila diminta; (3) Ruled/Create solid/Through all dicentang; (4) volume dibaca dari objek akhir (Extrude, Loft, Body Tip, Fusion), 2 desimal; (5) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Braket Flens dengan Pola Lubang dan Link Boss", "Tujuh langkah berikut membangun braket flens lengkap: dekomposisi, Pad, Pocket, PolarPattern, boss yang dipakai ulang lewat App::Link, Part container yang diputar, dan Union untuk volume total; ditutup tabel gejala dan daftar periksa.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab patterns (linear/circular/mirror), loft and sweep, shell and draft, serta reuse of parts dan assemblies bottom-up; konsep yang sama pada FreeCAD.")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: bab feature patterns, loft/sweep, shell, derived components, dan assembly placement.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Part Extrude, Part Loft, Part Boolean, PartDesign LinearPattern/PolarPattern/Mirrored/MultiTransform, PartDesign Thickness, PartDesign Draft, Std LinkMake, Draft Clone, Std Part, Placement, Expressions", " (wiki.freecad.org), 2024–2026.", "Acuan nama fitur, parameter, dan API (Part::Extrusion, Part::Loft, PartDesign::PolarPattern, App::Link, Draft.make_clone) yang dipakai di cell Python.")
    refs += pm_ref(4, "green", "0,224,158", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab solid modeling dan assembly modeling: feature-based decomposition, pattern features, dan constraint-based assembly.")
    refs += pm_ref(5, "pink", "236,72,153", "D. G. Ullman", "The Mechanical Design Process", ", 6th ed. David Ullman LLC, 2017.", "Dekomposisi produk menjadi sub-assembly dan komponen, serta pemakaian ulang komponen standar dalam desain.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi dekomposisi fitur, pola, Loft/Sweep, Thickness/Draft, blok yang dipakai ulang, dan sub-assembly dengan Placement. Dokumentasi FreeCAD 1.0 adalah pendamping wajib karena nama properti (App::Link, Draft Clone Scale, PolarPattern Mode) mengikuti versi yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Part Extrude/Loft/Sweep/Boolean, PartDesign PolarPattern/LinearPattern/Mirrored/MultiTransform/Thickness/Draft, Std LinkMake dan App Link, Draft Clone, Std Part (App::Part), Placement, dan Expressions (sintaks &lt;&lt;Label&gt;&gt; dan alias Spreadsheet). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 7 — Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = '''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Draft Wire → Extrude</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Loft ruled</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Thickness · PolarPattern</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Clone Scale k</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">Fusion.Shape.Volume</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 7 · Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 7</span><br><em>Lima Proyek</em><br>Gabungan 2D–3D</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang dekomposisi fitur, Part Extrude, pola fitur, Loft ruled, Thickness, Draft, App::Link, Draft Clone, Part container, dan Placement, ditambah 5 tugas pemodelan: profil L Draft Wire yang di-Extrude, Loft ruled dua persegi panjang, cangkang Thickness, flens dengan lubang pusat dan pola polar lubang baut, serta pelat dengan boss dan Clone berskala yang disatukan Union. Setiap tugas mengunggah berkas .FCStd dan mengisi volume solid akhir. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Langkah pertama yang tepat saat memodelkan komponen rumit (misalnya braket flens berlubang dengan beberapa boss) adalah...",
     ["Membuat satu sketsa yang memuat seluruh kontur, lubang, dan boss sekaligus", "Memakai primitif Part saja tanpa sketsa agar cepat", "Mengurai bentuk menjadi fitur dasar (bentuk induk, fitur tambahan, pola, dressing) dan menentukan urutannya", "Membuat Fillet dan Chamfer lebih dulu agar rusuk aman sebelum fitur lain"],
     "Dekomposisi fitur"),
    ("Agar <strong>Part Extrude</strong> dari Draft Wire menghasilkan solid (bukan permukaan), syaratnya adalah...",
     ["Wire tertutup dengan Make Face (atau opsi Create solid dicentang) serta arah dan panjang ekstrusi ditentukan", "Wire boleh terbuka asalkan Length along diisi", "Wire harus dibuat di dalam Body Part Design", "Wire harus terdiri dari tepat empat garis lurus"],
     "Syarat Part Extrude"),
    ("Flens dengan 4 lubang baut hasil <strong>PolarPattern</strong> harus diubah menjadi 6 lubang. Cara yang paling efisien adalah...",
     ["Menambahkan dua Pocket baru secara manual di posisi yang kosong", "Menghapus PolarPattern dan membuat enam sketsa lingkaran terpisah", "Memperbesar diameter lingkaran baut agar muat enam lubang", "Mengubah Occurrences PolarPattern dari 4 menjadi 6; semua salinan dihitung ulang otomatis"],
     "Mengubah jumlah pola"),
    ("Perbedaan Loft dengan opsi <strong>Ruled surface</strong> dan loft halus (tanpa Ruled) adalah...",
     ["Ruled hanya dapat dipakai untuk profil lingkaran", "Ruled menghubungkan profil dengan permukaan lurus (garis penghubung titik seiring; muka datar untuk dua persegi panjang), loft halus menginterpolasi B-spline", "Ruled selalu menghasilkan volume yang lebih besar", "Tidak ada perbedaan geometri, hanya warna tampilan"],
     "Loft ruled vs halus"),
    ("<strong>Thickness</strong> pada balok dengan muka atas dipilih dan tebal t menghasilkan...",
     ["Cangkang terbuka di atas: muka yang dipilih dibuang, muka lain menjadi dinding setebal t ke dalam", "Balok yang lebih tebal t pada semua sisinya", "Pelat tipis setebal t yang diambil dari muka atas saja", "Balok yang terbagi menjadi dua solid terpisah"],
     "Hasil Thickness"),
    ("Fitur <strong>Draft</strong> (sudut tirus) pada Part Design berfungsi untuk...",
     ["Membuat gambar 2D dari solid untuk dicetak", "Menyalin muka solid ke bidang lain", "Memiringkan muka sebesar sudut α terhadap arah tarik dari bidang netral agar produk cetakan mudah dilepas", "Mengubah solid menjadi permukaan tanpa ketebalan"],
     "Fungsi Draft"),
    ("Keunggulan <strong>App::Link</strong> dibanding salin-tempel (copy) untuk enam boss identik adalah...",
     ["Link menghasilkan geometri baru yang bebas disunting terpisah dari asalnya", "Link merujuk objek asal: perubahan pada asal tercermin pada semua link, berkas tetap ringan, dan tiap link punya Placement sendiri", "Link hanya dapat dibuat dari objek Draft", "Link otomatis membuat pola polar dari objek asal"],
     "Keunggulan App::Link"),
    ("<strong>Draft Clone</strong> dengan Scale seragam k = 1,5 mempunyai volume...",
     ["Sama dengan volume asal karena clone hanya rujukan", "1,5 kali volume asal", "2,25 kali volume asal", "3,375 kali (= k³) volume asal"],
     "Volume Clone berskala"),
    ("<strong>Part container</strong> (Std Part / App::Part) berguna untuk...",
     ["Mengelompokkan beberapa Body/Link/Clone; Placement Part memindahkan seluruh isinya sebagai satu sub-assembly", "Menyatukan beberapa solid menjadi satu solid seperti Boolean Union", "Menyimpan lembar gambar TechDraw", "Menggantikan Body pada Part Design"],
     "Fungsi Part container"),
    ("Agar boss tetap berada di seperempat panjang pelat ketika panjang pelat diubah, Placement boss sebaiknya...",
     ["Diatur manual dengan menggeser boss di 3D view setiap kali pelat berubah", "Dikunci dengan konstrain Fixed pada sketsa boss", "Diikat ekspresi (misalnya Placement.Base.x = panjang pelat / 4 atau alias Spreadsheet) sehingga posisi menyesuaikan otomatis", "Dibiarkan saja karena FreeCAD selalu menyesuaikan posisi sendiri"],
     "Placement berekspresi"),
]

TUGAS_LABELS = ["Draft Wire L + Part Extrude — volume (mm³)", "Part Loft ruled dua persegi panjang — volume (mm³)", "Pad + Thickness cangkang terbuka atas — volume (mm³)",
                "Flens: Pocket pusat + PolarPattern lubang baut — volume (mm³)", "Pelat + boss + Draft Clone berskala k, Part Union — volume (mm³)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 2, 3: 0}

FQ_JUDUL = [
    "Bagaimana mendekomposisi braket flens stasiun dan memakai PolarPattern agar enam lubang baut mengikuti perubahan lingkaran baut?",
    "Kapan Loft ruled dan Thickness dipakai untuk corong transisi dan pelindung lembaran tipis, dan bagaimana menaksir volumenya?",
    "App::Link, Draft Clone, atau salin-tempel untuk boss berulang di tiga stasiun, dan bagaimana Placement berekspresi menjaga rakitan?",
]
FQ_RINGKAS = [
    "Susun daftar fitur braket flens (Pad, Pocket pusat, Pocket baut + PolarPattern, boss) dan hitung volumenya dengan Persamaan (2). Jelaskan mengapa enam Pocket terpisah gagal mengikuti perubahan D_bc.",
    "Modelkan corong transisi persegi → persegi sebagai Loft ruled lalu Thickness, hitung volume solid dengan Persamaan (3) dan cangkang dengan Persamaan (4), dan jelaskan mengapa Pad bertingkat memberi volume yang salah.",
    "Bandingkan salin-tempel, App::Link, dan Draft Clone untuk enam boss di tiga stasiun; tetapkan Placement berekspresi dan hitung volume Union dengan Persamaan (6).",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Braket flens stasiun pengisian dipesin dari baja: cakram ⌀120 × 12 mm dengan lubang pusat ⌀40 dan enam lubang baut ⌀9 pada lingkaran baut ⌀90, ditambah tiga boss ⌀16 × 10 di antara lubang. Susun pohon fiturnya (Bagian 01–03): sketsa apa pada muka mana, Pocket tipe apa, PolarPattern dengan sumbu dan Occurrences berapa. Hitung volume flens (tanpa boss) dengan Persamaan (2). Jelaskan mengapa percobaan pertama, enam Pocket digambar satu per satu, gagal mengikuti ketika pelanggan mengubah lingkaran baut ⌀90 → ⌀96.",
            ["cakram ⌀120 × 12, ⌀40", "6 × ⌀9 pada ⌀90", "PolarPattern 360°/6"],
            "Keunggulan PolarPattern untuk enam lubang baut dibanding enam Pocket terpisah adalah...",
            ["Enam Pocket terpisah lebih presisi karena tiap lubang dikonstrain sendiri", "Satu sketsa induk pada lingkaran baut + Occurrences n: mengubah n atau D_bc memperbarui semua lubang sekaligus", "PolarPattern hanya dapat dipakai untuk lubang pusat", "Tidak ada bedanya karena volumenya sama"],
            "✅ Tepat! PolarPattern menyalin Pocket induk n kali mengelilingi sumbu; lingkaran baut cukup diubah pada sketsa induk (satu konstrain) dan jumlah lubang pada Occurrences, sehingga seluruh pola dihitung ulang. Volumenya tetap mengikuti Persamaan (2).",
            "❌ Enam Pocket terpisah berarti enam konstrain posisi yang harus diubah satu per satu; PolarPattern berlaku untuk fitur apa pun, bukan hanya lubang pusat. Lihat Bagian 03 dan Animasi 2.",
            "Petunjuk: (1) Tulis pohon fitur berurutan. (2) Hitung volume dengan Persamaan (2). (3) Jelaskan apa yang terjadi pada enam Pocket terpisah saat D_bc berubah.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Corong pengumpan (hopper) berbentuk transisi persegi 200 × 200 di atas ke persegi 80 × 80 di bawah setinggi 150 mm, dibuat dari pelat baja tahan karat 1,5 mm; pelindung rantai berupa kotak 300 × 120 × 80 terbuka satu sisi dari pelat 2 mm. Tentukan fitur yang tepat (Bagian 04–05): Loft ruled dua sketsa sepusat lalu Thickness dengan muka atas dan bawah dibuang untuk corong; Pad lalu Thickness untuk pelindung. Hitung volume solid corong dengan Persamaan (3), volume cangkang pelindung dengan Persamaan (4), dan taksir massanya (ρ = 7,9 g/cm³). Jelaskan mengapa corong yang dibuat Pad bertingkat dan pelindung yang dimodelkan pejal memberi massa yang jauh melenceng.",
            ["corong 200² → 80², h 150, t 1,5", "pelindung 300 × 120 × 80, t 2", "ρ 7,9 g/cm³"],
            "Corong transisi persegi 200 → 80 mm setinggi 150 mm dari pelat 1,5 mm paling tepat dimodelkan dengan...",
            ["Pad bertingkat beberapa persegi lalu Fillet agar tampak miring", "Revolution profil trapesium terhadap sumbu Z", "Loft ruled dua sketsa persegi sepusat (Create solid) lalu Thickness 1,5 mm dengan muka atas dan bawah dibuang", "Sweep lingkaran sepanjang garis tegak"],
            "✅ Tepat! Loft ruled memberi empat muka trapesium datar seperti pelat yang dipotong dan dilas; Thickness dengan dua muka dibuang menyisakan dinding 1,5 mm sehingga volume (dan massa) mencerminkan pelat, bukan benda pejal.",
            "❌ Pad bertingkat menghasilkan tangga, Revolution menghasilkan kerucut bulat, Sweep lingkaran menghasilkan tabung; tidak satu pun berupa cangkang transisi persegi. Lihat Bagian 04–05.",
            "Petunjuk: (1) Pasangkan corong dan pelindung dengan fiturnya. (2) Hitung volume solid dan cangkang. (3) Taksir massa dan jelaskan penyebab massa yang melenceng.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Tiga stasiun (pengisian, penyegelan, pemotongan) memakai pelat dasar 400 × 250 × 12 dengan dua boss dudukan ⌀30 × 20 per stasiun pada seperempat dan tiga perempat panjang pelat; stasiun pemotongan memerlukan boss 1,4 kali lebih besar. Percobaan pertama menyalin-tempel boss enam kali sehingga saat diameter boss direvisi hanya satu yang berubah, dan boss bergeser keluar pelat saat panjang pelat diubah 400 → 460. Tentukan (Bagian 06–07) kapan memakai App::Link, Draft Clone berskala, atau Body baru; tetapkan Placement berekspresi (a/4 dan 3a/4) atau alias Spreadsheet; susun Part container per stasiun; dan hitung volume Union pelat + dua boss stasiun pemotongan dengan Persamaan (6) (k = 1,4).",
            ["pelat 400 × 250 × 12", "boss ⌀30 × 20 · k = 1,4", "Placement = a/4, 3a/4"],
            "Untuk enam boss identik di tiga stasiun yang harus ikut berubah saat boss induk direvisi, gunakan...",
            ["App::Link ke Body boss induk dengan Placement masing-masing (diikat ekspresi/Spreadsheet)", "Salin-tempel boss enam kali lalu mengubah tiap salinan", "Draft Clone dengan Scale 2 untuk semua boss", "Enam Body baru yang digambar ulang"],
            "✅ Tepat! Link merujuk geometri asal sehingga revisi induk tercermin serentak; Placement tiap link diikat ekspresi (a/4, 3a/4) agar tetap di pelat saat panjang berubah. Clone berskala hanya untuk boss yang memang berbeda ukuran (k = 1,4).",
            "❌ Salin-tempel dan Body baru memutus hubungan dengan induk; Clone Scale 2 mengubah ukuran semua boss. Lihat Bagian 06 dan tabel cara memakai ulang.",
            "Petunjuk: (1) Pilih Link/Clone/Body untuk tiap boss. (2) Tulis ekspresi Placement dan struktur Part container. (3) Hitung volume Union stasiun pemotongan dengan Persamaan (6).")
    kartu = lambda teks, rgb, warna: f'      <div style="background:rgba({rgb},.05);border:1px solid rgba({rgb},.15);border-radius:10px;padding:12px 16px;font-family:\'JetBrains Mono\',monospace;font-size:13px;color:var(--{warna})">{teks}</div>'
    return f'''<div class="page" id="page-forum">
<div class="hero" data-tab="forum" style="min-height:55vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1c" d="" fill="none" stroke="rgba(0,230,118,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2c" d="" fill="none" stroke="rgba(124,77,255,.08)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">mesin pengemas sachet</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">PolarPattern ×6</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Loft → Thickness</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">App::Link · a/4</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 7 · Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Satu Blok<br><em>untuk Tiga Stasiun</em></h1>
    <p class="hero-sub">Bengkel Tirta Kemas membangun mesin pengemas sachet untuk UKM makanan: tiga stasiun dengan braket flens berlubang, corong transisi, pelindung lembaran, dan boss dudukan yang berulang. Terapkan Pertemuan 7: dekomposisi fitur, pola, Loft dan Thickness, blok yang dipakai ulang, dan Placement berekspresi, untuk menyusun model yang tetap benar saat pelanggan mengubah ukuran.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Tirta Kemas —<br>Rangka Mesin Pengemas Tiga Stasiun</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PROYEK GABUNGAN</div>
    <p>
      <strong style="color:var(--amber)">Bengkel Tirta Kemas</strong> menerima pesanan <strong style="color:var(--cyan)">mesin pengemas sachet tiga stasiun</strong> (pengisian, penyegelan, pemotongan) dari UKM bumbu: tiap stasiun memakai <strong>braket flens</strong> ⌀120 × 12 mm berlubang pusat ⌀40 dengan enam lubang baut ⌀9 pada lingkaran baut ⌀90 dan tiga boss ⌀16 × 10, <strong>corong pengumpan</strong> transisi persegi 200 → 80 mm setinggi 150 mm dari pelat 1,5 mm, <strong>pelindung rantai</strong> 300 × 120 × 80 dari pelat 2 mm, dan <strong>pelat dasar</strong> 400 × 250 × 12 dengan dua boss dudukan ⌀30 × 20 (stasiun pemotongan memakai boss 1,4 kali lebih besar).
    </p>
    <p style="margin-top:12px">
      Pelanggan sering merevisi: lingkaran baut ⌀90 → ⌀96, panjang pelat dasar 400 → 460, diameter boss dudukan. Percobaan pertama juru gambar gagal mengikuti: enam lubang baut digambar satu per satu sehingga hanya sebagian yang berpindah, corong dibuat Pad bertingkat dan pelindung dimodelkan pejal sehingga <strong>taksiran massa melenceng jauh</strong>, dan boss disalin-tempel enam kali sehingga revisi diameter hanya mengubah satu boss dan boss lain <strong>keluar dari pelat</strong> saat panjangnya berubah.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur pemodelan proyek gabungan</strong>: dekomposisi fitur dan pola untuk braket, Loft + Thickness untuk corong dan pelindung, blok yang dipakai ulang (App::Link/Draft Clone) dengan Placement berekspresi di dalam Part container per stasiun, serta taksiran volume dan massa dari Union.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Braket flens ⌀120 × 12, 6 × ⌀9 pada ⌀90", "14,165,233", "cyan")}
{kartu("Corong 200² → 80², h 150, pelat 1,5", "14,165,233", "cyan")}
{kartu("Pelindung 300 × 120 × 80, pelat 2", "14,165,233", "cyan")}
{kartu("Pelat 400 × 250 × 12 · boss ⌀30 × 20 · k 1,4", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Lubang yang tertinggal, massa yang melenceng, dan boss yang keluar pelat berasal dari tiga hal: fitur yang tidak dipola, cangkang yang dimodelkan pejal, dan salinan yang tidak terikat induknya. Forum ini mengajak Anda membereskan ketiganya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Empat komponen mesin pengemas dan fitur pembentuknya: Pad + Pocket + PolarPattern, Loft ruled + Thickness, Pad + Thickness, Pelat + Link/Clone boss</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Bengkel Tirta Kemas membangun mesin pengemas sachet tiga stasiun untuk UKM bumbu: braket flens &oslash;120 &times; 12 berlubang pusat &oslash;40 dengan 6 lubang baut &oslash;9 pada lingkaran baut &oslash;90 dan 3 boss &oslash;16 &times; 10; corong transisi persegi 200 &rarr; 80 mm setinggi 150 dari pelat 1,5 mm; pelindung rantai 300 &times; 120 &times; 80 dari pelat 2 mm; pelat dasar 400 &times; 250 &times; 12 dengan dua boss dudukan &oslash;30 &times; 20 (stasiun pemotongan memakai boss 1,4 kali lebih besar). Pelanggan merevisi lingkaran baut, panjang pelat, dan diameter boss. Percobaan pertama gagal: lubang digambar satu per satu, corong dari Pad bertingkat dan pelindung pejal sehingga massa melenceng, boss disalin-tempel sehingga revisi tidak menyebar dan boss keluar pelat. Susun dekomposisi fitur dan PolarPattern untuk braket, Loft ruled + Thickness untuk corong/pelindung, App::Link/Draft Clone dengan Placement berekspresi di Part container per stasiun, dan taksiran volume dari Union."
FORUM_CHIPS_LMS = ["braket flens ⌀120 × 12, 6 × ⌀9 pada ⌀90", "corong 200² → 80², h 150, pelat 1,5", "pelindung 300 × 120 × 80, pelat 2", "pelat 400 × 250 × 12 · boss ⌀30 × 20 · k 1,4"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Empat komponen mesin pengemas tiga stasiun dan fitur pembentuknya (Pertemuan 7)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const P = (p, cx, cy, s) => { const a = 35 * Math.PI / 180, e = 28 * Math.PI / 180; const x1 = p[0] * Math.cos(a) - p[1] * Math.sin(a), y1 = p[0] * Math.sin(a) + p[1] * Math.cos(a); return [cx + s * x1, cy - s * (p[2] * Math.cos(e) + y1 * Math.sin(e))]; };
  const poli = (pts, cx, cy, s, isi, garis) => { ctx.beginPath(); pts.map(p => P(p, cx, cy, s)).forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); if (isi) { ctx.fillStyle = isi; ctx.fill(); } ctx.strokeStyle = garis; ctx.lineWidth = 1.2; ctx.stroke(); };
  const ling = (x0, y0, z, r, n) => { const l = []; for (let i = 0; i < n; i++) l.push([x0 + r * Math.cos(i / n * 6.283), y0 + r * Math.sin(i / n * 6.283), z]); return l; };
  const kolom = W / 4, s = Math.min(kolom / 170, (H - 60) / 110);
  const nama = ['Braket — Pad+Pocket+PolarPattern', 'Corong — Loft ruled+Thickness', 'Pelindung — Pad+Thickness', 'Pelat — Link ×2 + Clone k'];
  for (let k = 0; k < 4; k++) {
    const cx = kolom * (k + 0.5), cy = H * 0.72;
    if (k === 0) { const n = 28, R = 40, h = 8; for (let i = 0; i < n; i++) { const t0 = i / n * 6.283, t1 = (i + 1) / n * 6.283; poli([[R * Math.cos(t0), R * Math.sin(t0), 0], [R * Math.cos(t1), R * Math.sin(t1), 0], [R * Math.cos(t1), R * Math.sin(t1), h], [R * Math.cos(t0), R * Math.sin(t0), h]], cx, cy, s, 'rgba(34,211,238,.08)', 'rgba(34,211,238,.3)'); } poli(ling(0, 0, h, R, n), cx, cy, s, 'rgba(34,211,238,.2)', '#22d3ee'); poli(ling(0, 0, h, 13, n), cx, cy, s, '#020812', '#22d3ee'); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; poli(ling(30 * Math.cos(a), 30 * Math.sin(a), h, 3.5, 12), cx, cy, s, '#020812', i ? '#a855f7' : '#00e09e'); } }
    if (k === 1) { const A = 60, B = 24, h = 50; const b0 = [[-A / 2, -A / 2, 0], [A / 2, -A / 2, 0], [A / 2, A / 2, 0], [-A / 2, A / 2, 0]], b1 = [[-B / 2, -B / 2, h], [B / 2, -B / 2, h], [B / 2, B / 2, h], [-B / 2, B / 2, h]]; for (let i = 0; i < 4; i++) poli([b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]], cx, cy + 6 * s, s, 'rgba(245,158,11,.10)', 'rgba(245,158,11,.6)'); poli(b1, cx, cy + 6 * s, s, '#020812', '#f59e0b'); poli([[-B / 2 + 3, -B / 2 + 3, h], [B / 2 - 3, -B / 2 + 3, h], [B / 2 - 3, B / 2 - 3, h], [-B / 2 + 3, B / 2 - 3, h]], cx, cy + 6 * s, s, 'rgba(245,158,11,.15)', 'rgba(245,158,11,.5)'); }
    if (k === 2) { const a = 70, b = 34, h = 26, t = 4; const b0 = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0]], b1 = b0.map(p => [p[0], p[1], h]); for (let i = 0; i < 4; i++) poli([b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]], cx - 35 * s, cy + 4 * s, s, 'rgba(236,72,153,.10)', 'rgba(236,72,153,.6)'); poli(b1, cx - 35 * s, cy + 4 * s, s, 'rgba(236,72,153,.22)', '#ec4899'); poli([[t, t, h], [a - t, t, h], [a - t, b - t, h], [t, b - t, h]], cx - 35 * s, cy + 4 * s, s, '#020812', 'rgba(236,72,153,.7)'); }
    if (k === 3) { const a = 80, b = 40, t = 6; const b0 = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0]], b1 = b0.map(p => [p[0], p[1], t]); for (let i = 0; i < 4; i++) poli([b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]], cx - 40 * s, cy + 4 * s, s, 'rgba(34,211,238,.10)', 'rgba(34,211,238,.6)'); poli(b1, cx - 40 * s, cy + 4 * s, s, 'rgba(34,211,238,.18)', '#22d3ee'); [[20, 7, 10], [45, 7, 10], [66, 10, 14]].forEach(([x0, r, hb], j) => { const n = 20; for (let i = 0; i < n; i++) { const t0 = i / n * 6.283, t1 = (i + 1) / n * 6.283; poli([[x0 + r * Math.cos(t0), b / 2 + r * Math.sin(t0), t], [x0 + r * Math.cos(t1), b / 2 + r * Math.sin(t1), t], [x0 + r * Math.cos(t1), b / 2 + r * Math.sin(t1), t + hb], [x0 + r * Math.cos(t0), b / 2 + r * Math.sin(t0), t + hb]], cx - 40 * s, cy + 4 * s, s, 'rgba(0,224,158,.08)', 'rgba(0,224,158,.3)'); } poli(ling(x0, b / 2, t + hb, r, n), cx - 40 * s, cy + 4 * s, s, 'rgba(0,224,158,.25)', j === 2 ? '#f59e0b' : '#00e09e'); }); }
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText(nama[k], cx, H - 10);
  }
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ satu boss induk → App::Link (identik) dan Draft Clone (Scale k); Placement diikat ekspresi a/4 dan 3a/4', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
