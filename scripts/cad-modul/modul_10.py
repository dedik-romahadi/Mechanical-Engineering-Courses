# Konten Modul 10 Pemodelan CAD — Optimasi Desain Pasca-Simulasi (Sub-CPMK 3.3: siklus
# iterasi simulasi → evaluasi → modifikasi; fillet dan Kt; rusuk dan kekakuan; pengurangan
# massa dengan batas tegangan; pemilihan material; Spreadsheet dan ekspresi parametrik;
# penampang optimal). Angka contoh dihitung di sini agar teks, tabel, dan gambar konsisten,
# dan sengaja tidak sama dengan varian tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from pustaka import BG  # noqa: E402
from tugas_gambar import AM, CY, GR, PK, RD, VI, _panah, dim_h, dim_v, ext, iso  # noqa: E402

NOMOR = 10
JUDUL = "Optimasi Desain Pasca-Simulasi"
JUDUL_PANJANG = "Optimasi Desain Pasca-Simulasi"
JUDUL_EKSPOR = "Optimasi Desain Pasca-Simulasi"

# ─────────────────────────── angka contoh ───────────────────────────
E_ST, E_AL = 210000, 70000
RHO_ST, RHO_AL = 7.85e-3, 2.70e-3          # g/mm³
# Bagian 02 — bahu bertingkat: D, d, h = (D − d)/2, σ_nom
D_B, D_K, H_B, S_NOM = 30, 20, 5, 90
R_F = 2.0


def kt_bahu(r, h=H_B):
    """Pendekatan kelas untuk bahu bertingkat D/d ≈ 1,5 (lentur), dikalibrasi ke grafik Peterson."""
    return 1 + 0.5 * math.sqrt(h / r)


def kt_lubang(x):
    """Peterson, pelat lebar hingga berlubang tarik: x = d/W."""
    return 3.00 - 3.13 * x + 3.66 * x ** 2 - 1.53 * x ** 3


def i_gabungan(b, t, tr, hr):
    """Momen inersia penampang T: pelat b × t (z = 0…t) + rusuk tr × hr (z = t…t+hr), sumbu sejajar."""
    a1, y1 = b * t, t / 2
    a2, y2 = tr * hr, t + hr / 2
    yb = (a1 * y1 + a2 * y2) / (a1 + a2)
    return b * t ** 3 / 12 + a1 * (y1 - yb) ** 2 + tr * hr ** 3 / 12 + a2 * (y2 - yb) ** 2


# Bagian 03 — pelat berusuk (Gambar 3)
A_R, B_R, T_R, R1, R2, TR = 90, 70, 8, 35, 30, 6
V_PELAT = A_R * B_R * T_R
V_RUSUK = 0.5 * R1 * R2 * TR
V_RIB = V_PELAT + V_RUSUK
I_PELAT = B_R * T_R ** 3 / 12
I_T = i_gabungan(B_R, T_R, TR, R2)
L_RIB, F_RIB = 200, 400
DELTA_PELAT = F_RIB * L_RIB ** 3 / (3 * E_ST * I_PELAT)
DELTA_RIB = F_RIB * L_RIB ** 3 / (3 * E_ST * I_T)
# Bagian 04 — pelat tiga lubang dan h_req
A_L, B_L, T_L, D_L, F_L = 110, 70, 10, 15, 12000
M_PENUH = RHO_ST * A_L * B_L * T_L
V_LUBANG3 = 3 * math.pi * D_L ** 2 * T_L / 4
M_LUBANG = RHO_ST * (A_L * B_L * T_L - V_LUBANG3)
HEMAT_PCT = 100 * (M_PENUH - M_LUBANG) / M_PENUH
KT_L = kt_lubang(D_L / B_L)
S_NOM_L = F_L / ((B_L - D_L) * T_L)
S_MAKS_L = KT_L * S_NOM_L
F_H, L_H, B_H, S_IZIN = 800, 240, 20, 125
H_REQ = math.sqrt(6 * F_H * L_H / (B_H * S_IZIN))
H_PILIH = 22
I_PILIH = B_H * H_PILIH ** 3 / 12
S_PILIH = 6 * F_H * L_H / (B_H * H_PILIH ** 2)
DELTA_PILIH = F_H * L_H ** 3 / (3 * E_ST * I_PILIH)
# Bagian 05 — material dengan kekakuan lentur sama
L_M, B_M, H_M = 320, 25, 12
MATERIAL = [("Baja", 210000, 7.85, 250), ("Titanium", 110000, 4.43, 830), ("Aluminium", 70000, 2.70, 240), ("Magnesium", 45000, 1.74, 160)]
H_AL = H_M * (E_ST / E_AL) ** (1 / 3)
M_ST = RHO_ST * L_M * B_M * H_M
M_AL = RHO_AL * L_M * B_M * H_AL
# Bagian 07 — penampang I
B_I, H_I, TF, TW = 50, 90, 6, 5
I_PROFIL = (B_I * H_I ** 3 - (B_I - TW) * (H_I - 2 * TF) ** 3) / 12
A_PROFIL = B_I * H_I - (B_I - TW) * (H_I - 2 * TF)
H_REKT_I = (12 * I_PROFIL / B_I) ** (1 / 3)
A_REKT_I = B_I * H_REKT_I
H_REKT_A = A_PROFIL / B_I
I_REKT_A = B_I * H_REKT_A ** 3 / 12
# Bagian 09 — praktik terbimbing braket L: teks langkah dan Gambar 7 memakai angka yang sama
PR_T, PR_R, PR_F = 8, 2, 2000                         # alias Spreadsheet iterasi 0: tebal t, fillet r, gaya F (N)
PR_KAKI, PR_TEGAK, PR_LEBAR = 100, 80, 50             # braket L 100 × 80, lebar Pad 50
PR_BAUT, PR_MESH = 9, 3                               # lubang baut 2 × ⌀9 di kaki; ukuran mesh Gmsh (mm)
PR_R_ITER = (2, 6, 10)                                # langkah 3: radius fillet sudut dalam
PR_DELTA = 0.4                                        # batas defleksi δ_maks (mm)
PR_RUSUK, PR_RUSUK_PAD, PR_FILLET_RUSUK = 40, 5, 2    # langkah 4: kaki segitiga 40 × hr, Pad 5 simetris, fillet 2
PR_HR_ITER = (20, 30)                                 # langkah 4: tinggi rusuk hr
PR_D_ITER = (15, 20, 25)                              # langkah 5: diameter lubang penghemat massa d
PR_SY_BAJA, PR_SY_AL, PR_SF = MATERIAL[0][3], MATERIAL[2][3], 2   # σ_y baja dan aluminium (MPa), SF minimum
PR_TEBAL_AL = f"=Spreadsheet.t * pow({E_ST // E_AL}; 1/3)"        # langkah 6: tebal aluminium berkekakuan sama


def _urut(v):
    """Deret nilai iterasi, mis. (2, 6, 10) → '2 → 6 → 10'."""
    return " → ".join(str(x) for x in v)


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def _poli(pts, fill, stroke, w=1.4):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"/>'


def gambar1():
    b = ""
    w, h = 130, 54
    tahap = [(["Model parametrik", "Spreadsheet + Body"], "#22d3ee"), (["Simulasi FEM", "CalculiX statik"], "#a855f7"),
             (["Evaluasi", "σ, δ, SF, massa"], "#f59e0b"), (["Modifikasi", "fillet · rusuk · h"], "#ec4899")]
    xs = [20, 190, 360, 530]
    for (lines, c), x in zip(tahap, xs):
        b += box(x, 40, w, h, lines, c, 11.5)
    for i in range(3):
        b += arrow(xs[i] + w, 67, xs[i + 1], 67)
    # panah balik iterasi
    b += f'<polyline points="595,94 595,120 85,120 85,98" fill="none" stroke="{AX}" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += arrow(85, 106, 85, 96)
    b += t(340, 136, "belum memenuhi kriteria → iterasi berikutnya (ubah satu parameter, catat metriknya)", 10.5, "#00e09e")
    b += t(20, 172, "Kriteria berhenti (Bagian 04–07):", 11, TX, "start", "600")
    b += t(20, 190, "σ_maks ≤ σ_y/SF · δ_maks ≤ δ_izin · m ≤ m_target", 10.5, AX, "start")
    b += t(380, 172, "Variabel yang diubah tiap putaran:", 11, TX, "start", "600")
    b += t(380, 190, "r fillet · tinggi rusuk · ⌀ lubang · material · h, B, tf", 10.5, AX, "start")
    b += teks2(340, 226, "Setiap putaran mencatat metrik sebelum/sesudah; berhenti saat semua kriteria terpenuhi dengan massa terkecil", 11, AX, maks=92)
    return svg(680, 250, b, "Gambar 1 — Siklus iterasi desain pasca-simulasi")


def gambar2():
    b = ""
    oy, xs, xe, xst, s = 140, 30, 300, 170, 4
    D2, d2, r = D_B / 2 * s, D_K / 2 * s, R_F * s
    d = (f"M {xs} {oy - D2} H {xst} V {oy - d2 - r} A {r} {r} 0 0 0 {xst + r} {oy - d2} H {xe} V {oy + d2} "
         f"H {xst + r} A {r} {r} 0 0 0 {xst} {oy + d2 + r} V {oy + D2} H {xs} Z")
    b += f'<path d="{d}" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    for k in range(7):
        b += f'<line x1="{xs}" y1="{oy - D2 + k * 20}" x2="{xs - 10}" y2="{oy - D2 + k * 20 + 10}" stroke="{AX}" stroke-width="1"/>'
    b += f'<line x1="{xs}" y1="{oy - D2 - 6}" x2="{xs}" y2="{oy + D2 + 6}" stroke="{AX}" stroke-width="1.6"/>'
    for yy in (oy - d2, oy + d2):
        b += f'<circle cx="{xst + 3}" cy="{yy + (3 if yy < oy else -3)}" r="11" fill="rgba(239,68,68,.35)"/>'
    b += f'<line x1="{xs - 6}" y1="{oy}" x2="{xe + 6}" y2="{oy}" stroke="{AX}" stroke-width=".7" stroke-dasharray="8 3 2 3"/>'
    b += arrow(290, oy - d2 - 42, 290, oy - d2 - 4, "#f59e0b", 1.8)
    b += t(298, 74, "F", 11, "#f59e0b", "start", "700")
    b += t(20, oy + 4, "D", 11, "#f59e0b", "end", "600")
    b += t(310, oy + 4, "d", 11, "#f59e0b", "start", "600")
    b += t(162, oy - D2 + 12, "h", 10.5, "#f59e0b", "end", "600")
    b += t(xst + r + 6, oy - d2 - r - 4, "r", 11, "#ec4899", "start", "700")
    b += t(120, 66, "σ_maks = Kt·σ_nom di kaki fillet", 10.5, "#ef4444", "middle", "600")
    b += t(30, oy + D2 + 21, "jepit", 9.5, AX, "middle")
    b += t(274, 198, "σ_nom = 6·M/(b·d²) pada batang tipis", 10, AX, "middle")
    b += t(452, 56, "Bahu bertingkat, D/d = 1,5:", 11, "#22d3ee", "start", "600")
    b += t(452, 74, "σ_maks = Kt · σ_nom", 11, TX, "start")
    b += t(452, 92, "Kt ≈ 1 + 0,5·√(h/r)  (pendekatan)", 10.5, TX, "start")
    b += t(452, 118, f"h = {H_B} mm, σ_nom = {S_NOM} MPa:", 10.5, AX, "start")
    for i, (rr, c) in enumerate([(1, "#ef4444"), (2, "#f59e0b"), (4, "#f59e0b"), (8, "#00e09e")]):
        b += t(452, 136 + i * 18, f"r = {rr} → Kt {ind(kt_bahu(rr), 2)} → {ind(kt_bahu(rr) * S_NOM, 1)} MPa", 10.5, c, "start")
    b += teks2(340, 236, "Fillet lebih besar memperkecil h/r sehingga Kt dan tegangan puncak turun tanpa mengubah σ_nom; ini langkah pertama iterasi", 11, AX, maks=70)
    return svg(680, 260, b, "Gambar 2 — Bahu bertingkat: fillet menurunkan faktor konsentrasi tegangan")


def gambar3():
    b = ""
    cx, cy, s = 130, 200, 1.8
    a, bb, tt = A_R, B_R, T_R
    dasar = [_iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [_iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        b += _poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.22)", "#22d3ee", 1.8)
    # rusuk segitiga di tepi y = 0…TR, kaki tegak menempel x = 0
    tri0 = [_iso(x, 0, z, cx, cy, s) for x, z in [(0, tt), (R1, tt), (0, tt + R2)]]
    tri1 = [_iso(x, TR, z, cx, cy, s) for x, z in [(0, tt), (R1, tt), (0, tt + R2)]]
    b += _poli([tri0[1], tri1[1], tri1[2], tri0[2]], "rgba(245,158,11,.18)", "#f59e0b", 1.2)
    b += _poli([tri0[2], tri1[2], tri1[0], tri0[0]], "rgba(245,158,11,.12)", "#f59e0b", 1.0)
    b += _poli(tri0, "rgba(245,158,11,.35)", "#f59e0b", 1.8)
    p = _iso(a / 2, -6, 0, cx, cy, s)
    b += t(p[0], p[1] + 18, "a", 11, "#22d3ee", "middle", "700")
    p = _iso(a + 6, bb / 2, 0, cx, cy, s)
    b += t(p[0] + 8, p[1] - 2, "b", 11, "#22d3ee", "start", "700")
    p = _iso(a + 4, 0, tt / 2, cx, cy, s)
    b += t(p[0] + 6, p[1] + 4, "t", 11, "#22d3ee", "start", "700")
    p = _iso(R1 / 2, -4, tt, cx, cy, s)
    b += t(p[0] - 8, p[1] - 6, "r₁", 10.5, "#f59e0b", "middle", "700")
    p = _iso(0, -6, tt + R2 / 2, cx, cy, s)
    b += t(p[0] - 14, p[1], "r₂", 10.5, "#f59e0b", "end", "700")
    p = _iso(0, TR / 2, tt + R2 + 4, cx, cy, s)
    b += t(p[0] + 12, p[1] + 6, "tᵣ", 10.5, "#f59e0b", "middle", "700")
    b += t(440, 56, "Volume pelat berusuk:", 11, "#22d3ee", "start", "600")
    b += t(440, 74, "V = a·b·t + ½·r₁·r₂·tᵣ", 11, TX, "start")
    b += t(440, 92, f"= {ind(V_PELAT, 0)} + {ind(V_RUSUK, 0)} = {ind(V_RIB, 0)} mm³", 10.5, "#00e09e", "start")
    b += t(440, 120, "Kekakuan penampang T di x = 0:", 11, "#f59e0b", "start", "600")
    b += t(440, 138, f"I pelat = b·t³/12 = {ind(I_PELAT, 0)} mm⁴", 10.5, AX, "start")
    b += t(440, 156, f"I pelat + rusuk = {ind(I_T, 0)} mm⁴", 10.5, AX, "start")
    b += t(440, 174, f"→ {ind(I_T / I_PELAT, 1)}× lebih kaku, volume +{ind(100 * V_RUSUK / V_PELAT, 1)} %", 10.5, "#00e09e", "start")
    b += teks2(340, 254, "Rusuk segitiga menyatu dengan pelat dalam satu Body; volumenya hanya suku ½·r₁·r₂·tᵣ, tetapi momen inersia penampangnya melonjak", 11, AX, maks=70)
    return svg(680, 280, b, "Gambar 3 — Pelat berusuk: volume kecil, kekakuan besar")


def gambar4():
    b = ""
    s = 2.4
    ox, oy = 40, 210
    aw, bh = A_L * s, B_L * s
    b += f'<rect x="{ox}" y="{oy - bh}" width="{aw}" height="{bh}" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="2"/>'
    for fx in (0.25, 0.5, 0.75):
        b += f'<circle cx="{ox + fx * aw:.1f}" cy="{oy - bh / 2:.1f}" r="{D_L / 2 * s}" fill="#0a101f" stroke="#a855f7" stroke-width="2"/>'
    b += f'<line x1="{ox + 0.25 * aw - 26}" y1="{oy - bh / 2}" x2="{ox + 0.75 * aw + 26}" y2="{oy - bh / 2}" stroke="#ef4444" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    b += arrow(ox, oy - bh / 2, ox - 28, oy - bh / 2, "#f59e0b", 1.8) + arrow(ox + aw, oy - bh / 2, ox + aw + 28, oy - bh / 2, "#f59e0b", 1.8)
    b += t(14, oy - bh / 2 - 8, "F", 11, "#f59e0b", "middle", "700") + t(ox + aw + 30, oy - bh / 2 - 8, "F", 11, "#f59e0b", "middle", "700")
    b += f'<line x1="{ox}" y1="{oy - bh - 16}" x2="{ox + aw}" y2="{oy - bh - 16}" stroke="#f59e0b" stroke-width="1"/>'
    b += t(ox + aw / 2, oy - bh - 21, "a", 11, "#f59e0b", "middle", "600")
    b += f'<line x1="{ox + aw + 14}" y1="{oy - bh}" x2="{ox + aw + 14}" y2="{oy}" stroke="#f59e0b" stroke-width="1"/>'
    b += t(ox + aw + 20, oy - bh / 2 + 22, "b", 11, "#f59e0b", "start", "600")
    b += t(ox + 0.25 * aw, oy - bh / 2 - D_L / 2 * s - 6, "⌀d", 10.5, "#a855f7", "middle", "600")
    b += t(ox + 0.125 * aw, oy - 6, "a/4", 9.5, AX, "middle") + t(ox + 0.5 * aw, oy - 6, "a/2 (Overall Length, 3 lubang)", 9.5, AX, "middle")
    b += t(ox + aw / 2, oy - bh / 2 + D_L / 2 * s + 16, f"tebal t (Pad), pola LinearPattern searah X", 9.5, AX, "middle")
    b += t(440, 52, "Massa vs tegangan (Bagian 04):", 11, "#22d3ee", "start", "600")
    b += t(440, 70, "m = ρ·(a·b·t − 3·π·d²·t/4)", 11, TX, "start")
    b += t(440, 88, f"penuh {ind(M_PENUH, 1)} g → 3 lubang ⌀{D_L}: {ind(M_LUBANG, 1)} g", 10.5, "#00e09e", "start")
    b += t(440, 106, f"hemat {ind(HEMAT_PCT, 1)} % massa", 10.5, AX, "start")
    b += t(440, 132, "Tegangan di tepi lubang:", 11, "#f59e0b", "start", "600")
    b += t(440, 150, "σ_maks = Kt·F/((b − d)·t)", 11, TX, "start")
    b += t(440, 168, f"Kt(d/b = {ind(D_L / B_L, 2)}) = {ind(KT_L, 2)}", 10.5, AX, "start")
    b += t(440, 186, f"F = {ind(F_L, 0)} N: σ_nom {ind(S_NOM_L, 1)} → σ_maks {ind(S_MAKS_L, 1)} MPa", 10, "#ef4444", "start")
    b += teks2(340, 236, "Lubang menghemat massa sedikit tetapi menaikkan tegangan lokal lewat Kt; letakkan di daerah bertegangan rendah dan periksa ulang σ_maks", 11, AX, maks=70)
    return svg(680, 262, b, "Gambar 4 — Pelat tiga lubang: massa turun, tegangan lokal naik")


def gambar5():
    b = ""
    x0, base, hmax = 60, 200, 130
    massa = [(nama, rho * L_M * B_M * H_M * (E_ST / E) ** (1 / 3) / 1000, H_M * (E_ST / E) ** (1 / 3)) for nama, E, rho, _ in MATERIAL]
    mmax = max(m for _, m, _ in massa)
    warna = ["#94a3b8", "#a855f7", "#22d3ee", "#00e09e"]
    b += f'<line x1="{x0 - 16}" y1="{base}" x2="{x0 + 4 * 80}" y2="{base}" stroke="{AX}" stroke-width="1"/>'
    for i, ((nama, m, hh), c) in enumerate(zip(massa, warna)):
        x = x0 + i * 80
        hb = hmax * m / mmax
        b += f'<rect x="{x}" y="{base - hb:.1f}" width="50" height="{hb:.1f}" fill="{c}" fill-opacity=".28" stroke="{c}" stroke-width="1.6" rx="3"/>'
        b += t(x + 25, base - hb - 7, f"{ind(m, 0)} g", 10.5, c, "middle", "700")
        b += t(x + 25, base + 16, nama, 10, TX, "middle")
        b += t(x + 25, base + 30, f"h = {ind(hh, 1)}", 9.5, AX, "middle")
    b += t(180, 36, f"Massa kantilever L = {L_M}, b = {B_M} untuk kekakuan sama", 10.5, TX, "middle", "600")
    b += t(440, 52, "Kekakuan lentur sama (E·I tetap):", 11, "#22d3ee", "start", "600")
    b += t(440, 70, "h_i = h·(E_baja/E_i)^(1/3)", 11, TX, "start")
    b += t(440, 88, "m_i = ρ_i·L·b·h_i", 11, TX, "start")
    b += t(440, 114, "Indeks material lentur pelat:", 11, "#f59e0b", "start", "600")
    b += t(440, 132, "M = E^(1/3)/ρ  (makin besar makin ringan)", 10, TX, "start")
    idx = " · ".join(f"{nama[:2] if nama != 'Aluminium' else 'Al'} {ind((E / 1000) ** (1 / 3) / rho, 2)}" for nama, E, rho, _ in MATERIAL)
    b += t(440, 150, idx, 10, "#00e09e", "start")
    b += t(440, 176, "Tetapi periksa juga:", 11, "#ec4899", "start", "600")
    b += t(440, 194, f"σ_y, biaya/kg, ruang (h_Al = {ind(H_AL / H_M, 2)}·h)", 10, TX, "start")
    b += teks2(340, 252, f"Aluminium perlu balok {ind(100 * (H_AL / H_M - 1), 0)} % lebih tinggi tetapi massanya separuh baja; magnesium lebih ringan lagi, namun σ_y dan biaya membatasi", 11, AX, maks=70)
    return svg(680, 278, b, "Gambar 5 — Pemilihan material untuk kekakuan lentur sama")


def gambar6():
    b = ""
    s = 2
    cx, cy = 110, 140
    B2, H2, tf, tw = B_I / 2 * s, H_I / 2 * s, TF * s, TW / 2 * s
    pts = [(-B2, -H2), (B2, -H2), (B2, -H2 + tf), (tw, -H2 + tf), (tw, H2 - tf), (B2, H2 - tf), (B2, H2), (-B2, H2), (-B2, H2 - tf), (-tw, H2 - tf), (-tw, -H2 + tf), (-B2, -H2 + tf)]
    b += _poli([(cx + x, cy + y) for x, y in pts], "rgba(34,211,238,.18)", "#22d3ee", 2)
    b += f'<line x1="{cx - B2 - 30}" y1="{cy}" x2="{cx + B2 + 22}" y2="{cy}" stroke="#ef4444" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    b += f'<line x1="{cx}" y1="{cy - H2 - 22}" x2="{cx}" y2="{cy + H2 + 10}" stroke="#22c55e" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    b += t(cx + B2 + 26, cy - 4, "X", 10, "#ef4444", "start", "700") + t(cx + 6, cy - H2 - 24, "Y", 10, "#22c55e", "start", "700")
    b += f'<line x1="{cx - B2}" y1="{cy - H2 - 10}" x2="{cx + B2}" y2="{cy - H2 - 10}" stroke="#f59e0b" stroke-width="1"/>'
    b += t(cx - 30, cy - H2 - 14, "B", 11, "#f59e0b", "middle", "600")
    b += f'<line x1="{cx + B2 + 12}" y1="{cy - H2}" x2="{cx + B2 + 12}" y2="{cy + H2}" stroke="#f59e0b" stroke-width="1"/>'
    b += t(cx + B2 + 18, cy + 24, "H", 11, "#f59e0b", "start", "600")
    b += t(cx - B2 - 8, cy - H2 + tf - 2, "t_f", 10.5, "#f59e0b", "end", "600")
    b += t(cx + tw + 6, cy + 46, "t_w", 10.5, "#f59e0b", "start", "600")
    b += t(cx, cy + H2 + 22, f"profil I: B = {B_I}, H = {H_I}, t_f = {TF}, t_w = {TW}", 10, AX, "middle")
    # persegi panjang ber-I sama (lebar B)
    rx, ry = 300, 140
    hr = H_REKT_I * s
    b += f'<rect x="{rx - B2}" y="{ry - hr / 2:.1f}" width="{B2 * 2}" height="{hr:.1f}" fill="rgba(236,72,153,.16)" stroke="#ec4899" stroke-width="2"/>'
    b += f'<line x1="{rx - B2 - 22}" y1="{ry}" x2="{rx + B2 + 12}" y2="{ry}" stroke="#ef4444" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    b += t(rx + B2 + 8, ry - 30, f"h = {ind(H_REKT_I, 1)}", 10.5, "#ec4899", "start", "600")
    b += t(rx, ry - hr / 2 - 8, "persegi panjang, I sama", 10, "#ec4899", "middle")
    b += t(rx, ry + hr / 2 + 16, f"A = {ind(A_REKT_I, 0)} mm² ({ind(A_REKT_I / A_PROFIL, 1)}× massa)", 10, AX, "middle")
    b += t(452, 52, "Penampang I (Bagian 07):", 11, "#22d3ee", "start", "600")
    b += t(452, 70, "I_x = [B·H³ − (B − tw)(H − 2tf)³]/12", 10.5, TX, "start")
    b += t(452, 88, f"= {ind(I_PROFIL, 0)} mm⁴, A = {ind(A_PROFIL, 0)} mm²", 10.5, "#00e09e", "start")
    b += t(452, 114, "Persegi panjang lebar B, I sama:", 11, "#ec4899", "start", "600")
    b += t(452, 132, f"h = (12·I/B)^(1/3) = {ind(H_REKT_I, 1)} mm", 10.5, TX, "start")
    b += t(452, 150, f"A = {ind(A_REKT_I, 0)} mm² → {ind(A_REKT_I / A_PROFIL, 1)}× massa", 10.5, AX, "start")
    b += t(452, 176, f"Persegi panjang luas sama ({ind(A_PROFIL, 0)} mm²):", 11, "#f59e0b", "start", "600")
    b += t(452, 194, f"h = {ind(H_REKT_A, 1)} → I = {ind(I_REKT_A, 0)} mm⁴", 10.5, TX, "start")
    b += t(452, 212, f"({ind(I_PROFIL / I_REKT_A, 0)}× lebih lentur daripada profil I)", 10, AX, "start")
    b += t(452, 238, "Python: Part.Face(w).MatrixOfInertia.A11", 10, "#00e09e", "start")
    b += teks2(340, 276, "Bahan yang dijauhkan dari sumbu netral (sayap) memberi I besar dengan luas kecil; persegi panjang ber-I sama butuh luas berkali lipat", 11, AX, maks=70)
    return svg(680, 300, b, "Gambar 6 — Penampang I versus persegi panjang dengan momen inersia sama")


# ── Gambar 7: gambar kerja praktik terbimbing (Bagian 09) ──
# Warna hex + fill-opacity/stroke-opacity, tanpa rgba(): pengurai SVG MuPDF di generator Word
# mencetak rgba() sebagai hitam pekat dan mengabaikan stroke-dasharray, jadi garis bantu dan
# fitur "hantu" juga dibedakan lewat opasitas.
def _lurus(x1, y1, x2, y2, warna, w=1.0, dash="", op=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o = f' stroke-opacity="{op:g}"' if op < 1 else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}{o}/>'


def _bidang(pts, warna, isi=0.16, w=1.2, dash="", op=1.0, isi_warna=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o = f' stroke-opacity="{op:g}"' if op < 1 else ""
    return (f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{isi_warna or warna}" fill-opacity="{isi:g}" '
            f'stroke="{warna}" stroke-width="{w}"{d}{o}/>')


def _kepala(x, y, ang, warna):
    """Kepala panah dimensi 7 × 3 px berujung di (x, y), menunjuk arah ang (rad)."""
    bx, by = x - 7 * math.cos(ang), y - 7 * math.sin(ang)
    px, py = 3 * math.sin(ang), -3 * math.cos(ang)
    return f'<polygon points="{x:.1f},{y:.1f} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{warna}"/>'


def _dim_miring(p1, p2, label, warna=AM, geser=(0, -6), anchor="middle"):
    """Garis dimensi sejajar p1→p2 (arah sumbu isometrik) dengan panah di kedua ujung."""
    ang = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    out = _lurus(*p1, *p2, warna) + _kepala(p2[0], p2[1], ang, warna) + _kepala(p1[0], p1[1], ang + math.pi, warna)
    return out + t((p1[0] + p2[0]) / 2 + geser[0], (p1[1] + p2[1]) / 2 + geser[1], label, 11, warna, anchor, "600")


def _dim_kecil_h(x1, x2, y, label, warna=AM):
    """Dimensi mendatar jarak pendek: panah di luar menunjuk ke dalam, nilai di atas garis."""
    out = _lurus(x1 - 13, y, x2 + 13, y, warna) + _kepala(x1, y, 0, warna) + _kepala(x2, y, math.pi, warna)
    return out + t((x1 + x2) / 2, y - 7, label, 11, warna, "middle", "600")


def _dim_kecil_v(x, y1, y2, label, warna=AM):
    """Dimensi tegak jarak pendek (y1 < y2): panah di luar menunjuk ke dalam, nilai di kiri."""
    out = _lurus(x, y1 - 13, x, y2 + 13, warna) + _kepala(x, y1, math.pi / 2, warna) + _kepala(x, y2, -math.pi / 2, warna)
    return out + t(x - 6, (y1 + y2) / 2 + 4, label, 11, warna, "end", "600")


def _lencana(x, y, no, warna):
    """Lingkaran bernomor langkah praktik."""
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="{BG}" stroke="{warna}" stroke-width="1.3"/>'
            + t(x, y + 3.6, str(no), 10, warna, "middle", "700"))


def gambar7():
    b = ""
    T, L, H, W = PR_T, PR_KAKI, PR_TEGAK, PR_LEBAR
    x_in = L - T                          # muka dalam kaki tegak (kaki tegak di kanan)
    xb, zc = 26, 60                       # letak lubang di gambar: tidak ditetapkan langkah, jadi tanpa dimensi
    dmaks, hr_m = PR_D_ITER[-1], PR_HR_ITER[-1]
    # (a) Tampak depan: sketsa profil L (bidang XZ), fillet sudut dalam, beban dan tumpuan
    s, X0, Y0 = 1.7, 40, 204
    X = lambda x: X0 + x * s  # noqa: E731
    Z = lambda z: Y0 - z * s  # noqa: E731
    b += t(X(L / 2), 24, "Tampak depan — sketsa profil", 11, TX, "middle", "600")
    r0 = PR_R
    prof = (f"M {X(0):.1f} {Z(0):.1f} H {X(L):.1f} V {Z(H):.1f} H {X(x_in):.1f} V {Z(T + r0):.1f} "
            f"A {r0 * s:.1f} {r0 * s:.1f} 0 0 1 {X(x_in - r0):.1f} {Z(T):.1f} H {X(0):.1f} Z")
    b += f'<path d="{prof}" fill="{CY}" fill-opacity=".16" stroke="{CY}" stroke-width="1.8"/>'
    for rr in PR_R_ITER[1:]:                                    # fillet hantu langkah 3
        b += (f'<path d="M {X(x_in):.1f} {Z(T + rr):.1f} A {rr * s:.1f} {rr * s:.1f} 0 0 1 {X(x_in - rr):.1f} {Z(T):.1f}" '
              f'fill="none" stroke="{PK}" stroke-width="1.3" stroke-dasharray="3 2" stroke-opacity=".8"/>')
    b += _lurus(X(0) - 4, Z(0) + 1.5, X(L) + 4, Z(0) + 1.5, AX, 1.8)       # Fixed: muka bawah kaki berlubang
    for k in range(int(L * s / 10) + 1):
        b += _lurus(X(0) + k * 10, Z(0) + 2, X(0) + k * 10 - 7, Z(0) + 9, AX, 1)
    b += t(X(L) + 8, Z(0) + 13, "Fixed", 10, AX, "start", "600")
    b += _panah(X(x_in - 30), Z(H - 3), X(x_in), Z(H - 3), RD, 1.8)     # F di tepi atas kaki tegak
    b += t(X(x_in - 30) - 5, Z(H - 3) + 4, f"F = {PR_F} N", 11, RD, "end", "700")
    b += ext(X(L) + 3, Z(H), X(L) + 24, Z(H)) + ext(X(L) + 3, Z(0), X(L) + 24, Z(0))
    b += dim_v(X(L) + 18, Z(H), Z(0), f"{H}", kiri=False)
    b += ext(X(0), Z(0) + 12, X(0), Z(0) + 34) + ext(X(L), Z(0) + 18, X(L), Z(0) + 34)
    b += dim_h(X(0), X(L), Z(0) + 28, f"{L}")
    b += ext(X(x_in), Z(H) - 3, X(x_in), Z(H) - 16) + ext(X(L), Z(H) - 3, X(L), Z(H) - 16)
    b += _dim_kecil_h(X(x_in), X(L), Z(H) - 13, f"t = {T}")
    b += ext(X(0) - 3, Z(T), X(0) - 18, Z(T))
    b += _dim_kecil_v(X(0) - 12, Z(T), Z(0), "t")
    fx, fy = X(x_in - 10 + 10 * (1 - math.cos(math.pi / 4))), Z(T + 10 - 10 * math.sin(math.pi / 4))
    b += _lurus(fx, fy, X(62), Z(40), PK, 0.9)
    b += t(X(62) - 3, Z(40) - 5, "r = " + _urut(PR_R_ITER), 11, PK, "end", "700")
    # (b) Sketsa rusuk pada bidang tengah, bentuk sebenarnya, di sudut dalam braket
    sr, xc, yb = 1.7, 372, 168
    b += t(xc - 34, 24, "Sketsa rusuk (bidang tengah)", 11, GR, "middle", "600")
    b += _lurus(xc - PR_RUSUK * sr - 16, yb, xc, yb, CY, 1.4) + _lurus(xc, yb, xc, yb - hr_m * sr - 8, CY, 1.4)
    for hr, op in zip(PR_HR_ITER, (0.10, 0.22)):
        tri = [(xc - PR_RUSUK * sr, yb), (xc, yb), (xc, yb - hr * sr)]
        b += _bidang(tri, GR, op, 1.3 if hr == hr_m else 1.0, "" if hr == hr_m else "4 3", 1 if hr == hr_m else 0.7)
    b += ext(xc - PR_RUSUK * sr, yb + 3, xc - PR_RUSUK * sr, yb + 24) + ext(xc, yb + 3, xc, yb + 24)
    b += dim_h(xc - PR_RUSUK * sr, xc, yb + 18, f"{PR_RUSUK}")
    b += ext(xc + 3, yb - hr_m * sr, xc + 22, yb - hr_m * sr) + ext(xc + 3, yb, xc + 22, yb)
    b += dim_v(xc + 16, yb - hr_m * sr, yb, "hr", kiri=False)
    b += t(xc - 52, yb - hr_m * sr - 16, "hr = 0 → " + _urut(PR_HR_ITER), 11, GR, "middle", "700")
    b += t(xc - 34, yb + 42, f"Pad {PR_RUSUK_PAD} simetris", 11, GR, "middle", "600")
    # (c) Isometrik hasil Pad: lebar, lubang baut, lubang penghemat massa, rusuk
    si, cx, cy = 1.6, 512, 240
    P = lambda x, y, z: iso(x, y, z, cx, cy, si)  # noqa: E731
    b += t(552, 24, "Isometrik — hasil Pad", 11, TX, "middle", "600")
    fil = [(x_in - r0 + r0 * math.cos(a), T + r0 - r0 * math.sin(a)) for a in [k * math.pi / 16 for k in range(9)]]
    b += _bidang([P(0, 0, 0), P(0, W, 0), P(0, W, T), P(0, 0, T)], CY, 0.10, 1.1)
    b += _bidang([P(0, 0, T), P(x_in - r0, 0, T), P(x_in - r0, W, T), P(0, W, T)], CY, 0.20, 1.1)
    b += _bidang([P(x_in, 0, T + r0), P(x_in, W, T + r0), P(x_in, W, H), P(x_in, 0, H)], CY, 0.12, 1.1)
    b += _bidang([P(x_in, 0, H), P(L, 0, H), P(L, W, H), P(x_in, W, H)], CY, 0.24, 1.3)
    for yy in (W / 4, 3 * W / 4):
        pts = [P(xb + PR_BAUT / 2 * math.cos(a), yy + PR_BAUT / 2 * math.sin(a), T) for a in [k * math.pi / 14 for k in range(28)]]
        b += _bidang(pts, CY, 1, 1.2, isi_warna=BG)
    for dd in PR_D_ITER:
        pts = [P(x_in, W / 2 + dd / 2 * math.cos(a), zc + dd / 2 * math.sin(a)) for a in [k * math.pi / 16 for k in range(32)]]
        akhir = dd == dmaks
        b += _bidang(pts, VI, 0.9 if akhir else 0, 1.2 if akhir else 1.0, "" if akhir else "3 2", 1 if akhir else 0.75, isi_warna=BG)
    y1, y2 = W / 2 - PR_RUSUK_PAD / 2, W / 2 + PR_RUSUK_PAD / 2
    b += _bidang([P(x_in - PR_RUSUK, y1, T), P(x_in - PR_RUSUK, y2, T), P(x_in, y2, T + hr_m), P(x_in, y1, T + hr_m)], GR, 0.30, 1.1)
    b += _bidang([P(x_in - PR_RUSUK, y1, T), P(x_in, y1, T), P(x_in, y1, T + hr_m)], GR, 0.18, 1.2)
    depan = [P(0, 0, 0), P(L, 0, 0), P(L, 0, H), P(x_in, 0, H), P(x_in, 0, T + r0)] + [P(x, 0, z) for x, z in fil] + [P(0, 0, T)]
    b += _bidang(depan, CY, 0.22, 1.6)
    p = P(xb, 3 * W / 4, T)
    b += _lurus(p[0], p[1] - 4, 490, 158, AM, 0.8) + t(490, 152, f"2 × ⌀{PR_BAUT}", 11, AM, "middle", "600")
    p = P(x_in, W / 2 + dmaks / 2 * 0.7, zc + dmaks / 2 * 0.7)
    b += _lurus(p[0] - 1, p[1] + 2, 575, 88, VI, 0.8)
    b += t(516, 72, "⌀d = 0 → " + _urut(PR_D_ITER), 11, VI, "middle", "700")
    b += t(516, 86, "di daerah biru kontur", 10, VI, "middle")
    b += ext(*P(-1, 0, 0), *P(-12, 0, 0)) + ext(*P(-1, W, 0), *P(-12, W, 0))
    b += _dim_miring(P(-9, 0, 0), P(-9, W, 0), f"{W}", geser=(-8, 8), anchor="end")
    # (d) catatan per langkah: angka yang diketik di Spreadsheet/FEM dan kriteria berhenti
    kol = [(20, [(1, CY, f"Spreadsheet: t = {T}, r = {PR_R}, hr = 0, d = 0, F = {PR_F}"),
                 (0, CY, f"massa baja = Volume × {ind(RHO_ST * 1000, 2)}×10⁻³"),
                 (2, CY, f"Steel, mesh Gmsh {PR_MESH}; Fixed + Force F"),
                 (3, PK, f"pilih r dengan SF = {PR_SY_BAJA}/σ_maks ≥ {PR_SF}"),
                 (4, GR, f"rusuk bila δ_maks > {ind(PR_DELTA, 1)}; fillet {PR_FILLET_RUSUK} di rusuk–pelat")]),
           (352, [(5, VI, f"⌀d: berhenti saat σ_maks ≈ {S_IZIN} MPa"),
                  (0, VI, "atau massa sudah ≤ target"),
                  (6, TX, f"Aluminium: tebal {PR_TEBAL_AL}"),
                  (0, TX, f"periksa σ_maks ≤ {PR_SY_AL}/{PR_SF} = {PR_SY_AL // PR_SF} MPa"),
                  (7, TX, f"pilih SF ≥ {PR_SF}, δ ≤ {ind(PR_DELTA, 1)}, massa terkecil")])]
    for x0, baris in kol:
        for i, (no, warna, teks) in enumerate(baris):
            yy = 272 + i * 17 + 14
            if no:
                b += _lencana(x0 + 8, yy - 4, no, warna)
            b += t(x0 + 22, yy, teks, 10.5, TX if no else AX, "start")
    b += t(660, 364, "Satuan: mm", 10, AX, "end")
    return svg(680, 380, b, "Gambar 7 — Braket L iteratif: ukuran awal dan parameter yang diubah tiap langkah")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-siklus">Siklus Iterasi</a>
  <a href="#m-fillet">Fillet &amp; Kt</a>
  <a href="#m-rusuk">Rusuk</a>
  <a href="#m-massa">Massa &amp; σ</a>
  <a href="#m-material">Material</a>
  <a href="#m-spreadsheet">Spreadsheet</a>
  <a href="#m-penampang">Penampang</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 14 40 H 60 V 70 Q 40 70 40 90 V 150 H 14 Z" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.4"/>
      <path d="M 40 90 Q 40 70 60 70" fill="none" stroke="rgba(255,179,0,.8)" stroke-width="1.6"/>
      <circle cx="44" cy="76" r="6" fill="rgba(239,68,68,.35)"/>
      <line x1="14" y1="150" x2="40" y2="110" stroke="rgba(124,77,255,.6)" stroke-width="1.4" stroke-dasharray="3 2"/>
      <circle cx="27" cy="128" r="5" fill="none" stroke="rgba(0,224,158,.6)" stroke-width="1.2"/>
      <text x="50" y="205" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">σ = Kt·σ_nom</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 25 40 H 75 V 52 H 56 V 128 H 75 V 140 H 25 V 128 H 44 V 52 H 25 Z" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.4"/>
      <line x1="14" y1="90" x2="86" y2="90" stroke="rgba(239,68,68,.55)" stroke-width="1" stroke-dasharray="6 2 2 2"/>
      <rect x="30" y="160" width="40" height="14" fill="rgba(255,179,0,.2)" stroke="rgba(255,179,0,.6)" stroke-width="1"/>
      <text x="50" y="171" text-anchor="middle" fill="rgba(255,179,0,.8)" font-family="JetBrains Mono" font-size="7">=Spreadsheet.h</text>
      <text x="50" y="205" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">I = BH³/12 − …</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="10">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">σ_maks = Kt·σ_nom</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">h_req = √(6FL/bσ)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">δ = FL³/3EI</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">=Spreadsheet.h_req</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">E^(1/3)/ρ</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">MatrixOfInertia.A11</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">SF = σ_y/σ_maks ≥ 2</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">m = ρ·V</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 11 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dari Hasil FEM</span><br>
      <em>ke Desain</em><br>
      <span class="hl-amber">yang Lebih Baik</span>
    </h1>
    <p class="hero-sub">Simulasi baru berguna bila hasilnya mengubah model. Pertemuan ini menutup siklus: membaca daerah kritis lalu memperbaikinya dengan fillet, menaikkan kekakuan dengan rusuk, memangkas massa tanpa melewati tegangan izin, memilih material dari kekakuan spesifik, dan mengendalikan semua parameter lewat Spreadsheet dan ekspresi agar tiap iterasi hanya mengubah satu angka. Tugasnya lima model parametrik dengan bacaan tinggi penampang, volume, massa, dan momen inersia.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Kt, rusuk, massa, material, penampang</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi iterasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Spreadsheet, diskusi, dan tugas</small></div>
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

    # 01 — Siklus iterasi desain
    isi = figure(1, "Siklus iterasi desain pasca-simulasi", "Model parametrik disimulasikan, hasilnya dievaluasi terhadap kriteria tegangan, defleksi, dan massa, lalu satu parameter diubah dan simulasi diulang; berhenti saat semua kriteria terpenuhi dengan massa terkecil.", gambar1())
    isi += cards([
        ("🔁", "Satu parameter per putaran", "Ubah satu hal (radius fillet, tinggi rusuk, diameter lubang, tebal) lalu simulasi ulang. Bila dua hal diubah sekaligus, Anda tidak tahu mana yang bekerja; catatan iterasi menjadi bukti keputusan desain.", "Δ satu variabel"),
        ("🎯", "Kriteria yang terukur", "σ_maks ≤ σ_y/SF, δ_maks ≤ δ_izin, massa ≤ target, frekuensi alami ≥ batas. Angka dari Modul 9 (von Mises, defleksi, SF, Kt) sekarang menjadi syarat berhenti.", "SF ≥ 2 · δ ≤ L/250"),
        ("🧮", "Model parametrik", "Dimensi diikat ke Spreadsheet (alias) sehingga iterasi hanya mengganti angka di sel; Body, fitur, dan mesh menghitung ulang. Tanpa parametrisasi, tiap iterasi berarti menggambar ulang.", "=Spreadsheet.h"),
        ("⚖️", "Tegangan vs massa", "Semua perbaikan berbayar: fillet menurunkan σ tanpa massa, rusuk menaikkan I dengan sedikit massa, lubang mengurangi massa tetapi menaikkan σ lokal. Optimasi memilih kombinasi termurah.", "σ ↓ · δ ↓ · m ↓"),
    ])
    isi += tabel(["Kriteria", "Besaran FEM (Modul 9)", "Sumber angka di FreeCAD", "Tindakan bila gagal (Bagian)"],
                 [["Kekuatan", "σ_vm,maks ≤ σ_y/SF", "Result → vonMises max; Python <code>max(r.vonMises)</code>", "Fillet daerah kritis (02), naikkan h (04/07)"],
                  ["Kekakuan", "δ_maks ≤ δ_izin (mis. L/250)", "Result → DisplacementLengths max", "Rusuk (03), penampang I (07), material (05)"],
                  ["Massa", "m = ρ·V ≤ m_target", "<code>Body.Shape.Volume</code> × ρ; Material 1.0", "Lubang/penipisan dengan batas σ (04), aluminium (05)"],
                  ["Konvergensi", "σ berubah < 2–5 % saat mesh dihaluskan", "Mesh → Max element size", "Haluskan mesh di fillet/lubang sebelum menilai"],
                  ["Dokumentasi", "Tabel sebelum/sesudah tiap iterasi", "Spreadsheet: baris per iterasi", "Praktik (09)"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02–05 adalah empat “tuas” optimasi: fillet untuk tegangan puncak, rusuk untuk kekakuan (Tugas 2), lubang untuk massa (Tugas 3), dan material (Tugas 4). Bagian 06 membuat semuanya parametrik dengan Spreadsheet (Tugas 1 dan 4), Bagian 07 menghitung penampang dari σ_izin dan momen inersia profil I (Tugas 1 dan 5), Bagian 08–09 menutup dengan Python dan praktik braket iteratif.")
    m += bagian(1, "m-siklus", "Siklus Iterasi Desain:<br>Simulasi, Evaluasi, Modifikasi", "Hasil FEM bukan akhir pekerjaan, melainkan masukan untuk mengubah model. Bagian ini menetapkan alur iterasi, kriteria berhenti yang terukur, dan mengapa model harus parametrik sebelum iterasi dimulai.", isi, "SIKLUS ITERASI")

    # 02 — Fillet dan Kt
    isi = figure(2, "Bahu bertingkat: fillet menurunkan faktor konsentrasi tegangan", f"Batang bertingkat D = {D_B}, d = {D_K} (h = {H_B}) dengan σ_nom = {S_NOM} MPa: radius fillet r = 1 mm memberi Kt ≈ {ind(kt_bahu(1), 2)}, r = 8 mm hanya {ind(kt_bahu(8), 2)}; tegangan puncak turun dari {ind(kt_bahu(1) * S_NOM, 0)} ke {ind(kt_bahu(8) * S_NOM, 0)} MPa tanpa menambah bahan.", gambar2())
    isi += formula(1, "Tegangan Puncak dan Pendekatan Kt Bahu", r"\sigma_{maks} = K_t\,\sigma_{nom}, \qquad K_t \approx 1 + 0{,}5\sqrt{\frac{h}{r}}",
                   r"\(\sigma_{nom}\) = tegangan nominal pada penampang tipis &nbsp;·&nbsp; \(h = (D - d)/2\) = tinggi bahu &nbsp;·&nbsp; \(r\) = radius fillet. Pendekatan kelas untuk bahu bertingkat \(D/d \approx 1{,}5\) dalam lentur (dikalibrasi ke grafik Peterson); contoh \(h = " + str(H_B) + r",\ r = " + str(int(R_F)) + r"\): \(K_t = " + ind(kt_bahu(R_F), 2) + r"\).",
                   "Fillet tidak mengubah σ_nom; ia hanya memperkecil h/r sehingga garis tegangan tidak “berbelok tajam” di kaki bahu. Karena Kt bergantung pada akar h/r, menggandakan radius menurunkan suku konsentrasi sebesar faktor √2; radius yang terlalu besar tidak lagi banyak menolong (Kt → 1) dan mulai mengganggu fungsi (dudukan bantalan, bahu pengunci).",
                   [("\\sigma_{maks}", "Tegangan puncak di kaki fillet (MPa)"), ("K_t", "Faktor konsentrasi tegangan (—)"), ("\\sigma_{nom}", "Tegangan nominal penampang tipis (MPa)"), ("h", "Tinggi bahu (mm)"), ("r", "Radius fillet (mm)")])
    isi += tabel(["r/h", "Kt bahu (pendekatan)", "σ_maks untuk σ_nom = 90 MPa", "Penilaian terhadap σ_izin = 125 MPa"],
                 [[ind(rh, 2), ind(1 + 0.5 * math.sqrt(1 / rh), 2), f"{ind((1 + 0.5 * math.sqrt(1 / rh)) * S_NOM, 1)} MPa", "❌ gagal" if (1 + 0.5 * math.sqrt(1 / rh)) * S_NOM > S_IZIN else "✅ lolos"] for rh in (0.1, 0.25, 0.5, 1, 2, 4)])
    isi += anim_panel(1, "cyan", "Radius fillet pada bahu: Kt dan σ_maks turun", "cvFilletKt",
                      [("sl_fk_r", "v_fk_r", "Radius fillet r (mm)", 0.5, 12, 0.5, 2, "2"),
                       ("sl_fk_h", "v_fk_h", "Tinggi bahu h (mm)", 2, 12, 1, 5, "5"),
                       ("sl_fk_s", "v_fk_s", "Tegangan nominal σ_nom (MPa)", 40, 160, 5, 90, "90")],
                      "btnFilletKt", "toggleFilletKt", "filletKtInfo",
                      "<strong>Cara membaca:</strong> radius fillet membesar dari 0,5 mm ke nilai slider (PAUSE menahan nilai slider). Sorotan merah di kaki bahu memudar saat Kt turun; batang tegangan di kanan menunjukkan σ_maks = Kt·σ_nom terhadap σ_izin = 125 MPa (S235, SF 2). Tegangan nominal tidak berubah, hanya konsentrasinya.")
    isi += kotak("warning-box", "⚠️ <strong>Fillet di FEM:</strong> hasil σ_maks pada fillet hanya tepercaya bila mesh di daerah itu halus (minimal 3–4 elemen sepanjang busur fillet; Modul 9, konvergensi). Sudut tajam tanpa fillet menghasilkan singularitas: tegangan terus naik saat mesh dihaluskan, jadi angkanya tidak boleh dipakai sebagai σ_maks. Beri fillet dahulu, baru bandingkan.")
    m += bagian(2, "m-fillet", "Memperbaiki Daerah Kritis:<br>Fillet dan Faktor Konsentrasi Tegangan", "Titik merah pada kontur von Mises hampir selalu berada di sudut dalam, bahu, atau tepi lubang. Bagian ini menunjukkan bahwa tegangan puncak di sana adalah Kt kali tegangan nominal, dan fillet adalah cara termurah menurunkannya.", isi, "FILLET DAN KT")

    # 03 — Rusuk dan kekakuan
    isi = figure(3, "Pelat berusuk: volume kecil, kekakuan besar", f"Pelat {A_R} × {B_R} × {T_R} diberi rusuk segitiga r₁ = {R1}, r₂ = {R2}, tebal {TR} mm di tepi; volume hanya bertambah {ind(V_RUSUK, 0)} mm³ ({ind(100 * V_RUSUK / V_PELAT, 1)} %), tetapi momen inersia penampang T di akar naik dari {ind(I_PELAT, 0)} menjadi {ind(I_T, 0)} mm⁴.", gambar3())
    isi += formula(2, "Momen Inersia Gabungan (Sumbu Sejajar) dan Volume Rusuk", r"I_{gab} = \sum_i \left(I_i + A_i\,d_i^{2}\right), \qquad V = a\,b\,t + \tfrac{1}{2}\,r_1\,r_2\,t_r",
                   r"\(I_i = b_i h_i^{3}/12\) tiap persegi panjang &nbsp;·&nbsp; \(A_i\) = luasnya &nbsp;·&nbsp; \(d_i\) = jarak titik beratnya ke sumbu netral gabungan \(\bar{y} = \sum A_i y_i / \sum A_i\). Contoh penampang T (pelat " + f"{B_R} × {T_R}" + r" + rusuk " + f"{TR} × {R2}" + r"): \(I_{gab} = " + ind(I_T, 0) + r"\) mm⁴, " + ind(I_T / I_PELAT, 1) + r"× pelat polos.",
                   "Rusuk bekerja lewat suku A·d²: bahan rusuk berada jauh dari sumbu netral sehingga sumbangan momen inersianya berlipat, padahal luasnya kecil. Defleksi kantilever δ = F·L³/(3·E·I) turun sebanding 1/I, jadi rusuk adalah tuas kekakuan termurah. Rusuk segitiga (tinggi mengecil ke ujung) mengikuti diagram momen kantilever: tinggi di akar, tipis di ujung.",
                   [("I_{gab}", "Momen inersia penampang gabungan (mm⁴)"), ("A_i, d_i", "Luas dan jarak titik berat komponen (mm², mm)"), ("V", "Volume pelat berusuk (mm³)"), ("r_1, r_2, t_r", "Kaki mendatar, kaki tegak, tebal rusuk (mm)")])
    isi += tabel(["Konfigurasi (pelat 70 × 8, L = 200, F = 400 N)", "I di akar (mm⁴)", "δ ujung (mm)", "Volume tambahan", "Catatan"],
                 [["Pelat polos", ind(I_PELAT, 0), ind(DELTA_PELAT, 3), "—", "δ terlalu besar (batas L/250 = 0,8 mm)"],
                  [f"+ rusuk segitiga {TR} × {R2} (Gambar 3)", ind(I_T, 0), ind(DELTA_RIB, 3), f"+{ind(100 * V_RUSUK / V_PELAT, 1)} %", "δ turun " + ind(DELTA_PELAT / DELTA_RIB, 0) + "×"],
                  [f"+ rusuk persegi {TR} × {R2} sepanjang L", ind(I_T, 0), ind(DELTA_RIB, 3), f"+{ind(100 * TR * R2 * A_R / V_PELAT, 1)} %", "I sama di akar, massa 2× rusuk segitiga"],
                  ["pelat ditebalkan menjadi t = 16", ind(B_R * 16 ** 3 / 12, 0), ind(F_RIB * L_RIB ** 3 / (3 * E_ST * B_R * 16 ** 3 / 12), 3), "+100 %", "kaku, tetapi massa dua kali lipat"]])
    isi += anim_panel(2, "amber", "Rusuk tumbuh: momen inersia naik, defleksi turun", "cvRusuk",
                      [("sl_rb_hr", "v_rb_hr", "Tinggi rusuk h_r (mm)", 0, 40, 1, 25, "25"),
                       ("sl_rb_tr", "v_rb_tr", "Tebal rusuk t_r (mm)", 2, 12, 1, 5, "5"),
                       ("sl_rb_F", "v_rb_F", "Beban ujung F (N)", 100, 1000, 50, 400, "400")],
                      "btnRusuk", "toggleRusuk", "rusukInfo",
                      "<strong>Cara membaca:</strong> pelat kantilever 60 × 6 mm sepanjang 200 mm (baja) dilengkungkan oleh F; rusuk di kirinya tumbuh dari 0 ke h_r slider (PAUSE menahan tinggi penuh). Penampang T di kiri memperlihatkan sumbu netral bergeser ke atas; angka I_gab dan δ di kanan mengikuti Persamaan (2) dan δ = F·L³/(3·E·I).")
    isi += kotak("info-box", "<strong>🧱 Memodelkan rusuk di Part Design:</strong> sketsa segitiga pada bidang XZ (atau muka samping pelat) dengan kaki mendatar di muka atas pelat, lalu Pad setebal t_r ke arah dalam pelat (centang <em>Reversed</em> bila rusuk keluar); karena berada dalam Body yang sama, rusuk otomatis menyatu dan Body.Shape.Volume langsung memberi a·b·t + ½·r₁·r₂·t_r. Beri fillet kecil di pertemuan rusuk–pelat: sudut dalam itu adalah daerah kritis baru (Bagian 02).")
    m += bagian(3, "m-rusuk", "Rusuk dan Kekakuan:<br>Menaikkan I Tanpa Menambah Banyak Massa", "Bila defleksi melampaui batas, menebalkan seluruh komponen adalah jawaban termahal. Bagian ini membahas rusuk sebagai cara memindahkan bahan menjauh dari sumbu netral, rumus momen inersia gabungan, dan cara memodelkannya menyatu dengan pelat.", isi, "RUSUK DAN KEKAKUAN")
    # 04 — Pengurangan massa dengan batas tegangan
    isi = figure(4, "Pelat tiga lubang: massa turun, tegangan lokal naik", f"Pelat {A_L} × {B_L} × {T_L} baja ({ind(M_PENUH, 1)} g) diberi tiga lubang ⌀{D_L} pola linear: massa menjadi {ind(M_LUBANG, 1)} g (hemat {ind(HEMAT_PCT, 1)} %), tetapi pada beban tarik {ind(F_L, 0)} N tegangan di tepi lubang {ind(S_MAKS_L, 1)} MPa, {ind(KT_L, 2)}× tegangan nominal.", gambar4())
    isi += formula(3, "Tinggi Minimum Penampang dari Tegangan Izin", r"\sigma_{maks} = \frac{6\,F\,L}{b\,h^{2}} \le \sigma_{izin} = \frac{\sigma_y}{SF} \quad\Rightarrow\quad h_{req} = \sqrt{\frac{6\,F\,L}{b\,\sigma_{izin}}}",
                   r"Kantilever persegi panjang \(b \times h\), beban ujung \(F\), panjang \(L\); \(\sigma_{izin} = 250/2 = 125\) MPa untuk S235 dengan SF 2. Contoh \(F = " + str(F_H) + r"\) N, \(L = " + str(L_H) + r"\), \(b = " + str(B_H) + r"\): \(h_{req} = " + ind(H_REQ, 3) + r"\) mm → dipilih " + str(H_PILIH) + r" mm (σ = " + ind(S_PILIH, 1) + r" MPa, δ = " + ind(DELTA_PILIH, 3) + r" mm).",
                   "Penipisan adalah pengurangan massa paling langsung, dan rumus ini memberi batasnya: tinggi tidak boleh di bawah h_req. Karena σ ∝ 1/h², menipiskan 10 % menaikkan tegangan 23 %; sebaliknya defleksi ∝ 1/h³, sehingga batas kekakuan (δ_izin) sering lebih ketat daripada batas kekuatan; periksa keduanya (Bagian 07).",
                   [("h_{req}", "Tinggi minimum penampang (mm)"), ("F, L", "Beban ujung (N) dan panjang (mm)"), ("b", "Lebar penampang (mm)"), ("\\sigma_{izin}", "Tegangan izin = σ_y/SF (MPa)")])
    isi += formula(4, "Massa Pelat dengan n Lubang Penghemat", r"m = \rho\left(a\,b\,t - n\,\frac{\pi d^{2}}{4}\,t\right), \qquad \sigma_{maks} = K_t\,\frac{F}{(b - d)\,t}",
                   r"\(\rho\) baja \(7{,}85\times10^{-3}\) g/mm³ &nbsp;·&nbsp; \(n\) = jumlah lubang &nbsp;·&nbsp; \(K_t = 3{,}00 - 3{,}13x + 3{,}66x^{2} - 1{,}53x^{3}\), \(x = d/b\) (Modul 9). Contoh " + f"{A_L} × {B_L} × {T_L}, 3 × ⌀{D_L}" + r": \(m = " + ind(M_LUBANG, 2) + r"\) g, \(K_t = " + ind(KT_L, 2) + r"\).",
                   "Lubang membuang bahan dari bagian yang tegangannya rendah (dekat sumbu netral pada lentur, atau daerah yang kontur von Mises-nya biru), tetapi ia sendiri menjadi konsentrator: Kt ≈ 2,5–3 pada tepi lubang dan luas neto berkurang. Karena itu lubang penghemat massa dipasang setelah daerah kritis aman, lalu σ_maks diperiksa ulang.",
                   [("m", "Massa pelat berlubang (g)"), ("a, b, t", "Panjang, lebar, tebal pelat (mm)"), ("n, d", "Jumlah dan diameter lubang (mm)"), ("K_t", "Faktor konsentrasi tepi lubang (—)")])
    baris = []
    for dd in (0, 10, 15, 20, 25, 30):
        mm_ = RHO_ST * (A_L * B_L * T_L - 3 * math.pi * dd ** 2 * T_L / 4)
        kt = kt_lubang(dd / B_L) if dd else 1
        sm = kt * F_L / ((B_L - dd) * T_L)
        baris.append([f"⌀{dd}" if dd else "tanpa lubang", ind(mm_, 1), f"−{ind(100 * (M_PENUH - mm_) / M_PENUH, 1)} %", ind(kt, 2), ind(sm, 1), "✅" if sm <= S_IZIN else "❌"])
    isi += tabel(["Diameter lubang (3 buah)", "Massa (g)", "Hemat", "Kt tepi lubang", "σ_maks (MPa), F = 12 000 N", "≤ 125 MPa?"], baris)
    isi += anim_panel(3, "green", "Lubang penghemat massa: massa turun, σ_maks naik", "cvLubangMassa",
                      [("sl_lm_d", "v_lm_d", "Diameter lubang d (mm)", 0, 40, 1, 15, "15"),
                       ("sl_lm_F", "v_lm_F", "Gaya tarik F (N)", 2000, 30000, 500, 12000, "12000"),
                       ("sl_lm_t", "v_lm_t", "Tebal pelat t (mm)", 4, 16, 1, 10, "10")],
                      "btnLubangMassa", "toggleLubangMassa", "lubangMassaInfo",
                      "<strong>Cara membaca:</strong> tiga lubang pada pelat 110 × 70 membesar dari 0 ke d slider (PAUSE menahan d penuh). Batang kiri: massa (Persamaan 4) yang turun; batang kanan: σ_maks = Kt·F/((b − d)·t) yang naik dan memerah saat melewati σ_izin = 125 MPa. Titik terbaik adalah d terbesar yang masih hijau.")
    isi += kotak("tip-box", "💡 <strong>Pola lubang parametrik:</strong> satu Pocket lalu <em>LinearPattern</em> (Part Design) dengan Overall Length a/2 dan Occurrences 3 menghasilkan lubang di a/4, a/2, 3a/4; diameter lubang di sketsa diikat ke alias Spreadsheet <code>d</code> sehingga tabel di atas dapat dihasilkan hanya dengan mengubah satu sel (Bagian 06). Untuk bacaan massa, FreeCAD 1.0 menyediakan Material pada Body; tanpa itu kalikan Shape.Volume dengan ρ.")
    m += bagian(4, "m-massa", "Pengurangan Massa<br>dengan Batas Tegangan", "Massa dikurangi lewat penipisan atau lubang, tetapi keduanya menaikkan tegangan. Bagian ini memberi dua batas kuantitatif: tinggi minimum dari σ_izin dan tegangan tepi lubang lewat Kt, lalu tabel pertukaran massa–tegangan yang menjadi dasar keputusan.", isi, "MASSA DAN TEGANGAN")

    # 05 — Pemilihan material
    isi = figure(5, "Pemilihan material untuk kekakuan lentur sama", f"Kantilever baja {L_M} × {B_M} × {H_M} ({ind(M_ST, 0)} g) diganti material lain dengan E·I sama: tinggi disesuaikan h_i = h·(E_baja/E_i)^(1/3); aluminium memerlukan h = {ind(H_AL, 1)} mm tetapi massanya hanya {ind(M_AL, 0)} g.", gambar5())
    isi += formula(5, "Substitusi Material dengan Kekakuan Lentur Sama", r"E_{st}\,\frac{b\,h^{3}}{12} = E_{Al}\,\frac{b\,h_{Al}^{3}}{12} \ \Rightarrow\ h_{Al} = h\left(\frac{E_{st}}{E_{Al}}\right)^{1/3}, \qquad m_{Al} = \rho_{Al}\,L\,b\,h_{Al}",
                   r"\(E_{st} = 210\,000\), \(E_{Al} = 70\,000\) MPa ⇒ \(h_{Al} = 3^{1/3}h = 1{,}442\,h\); \(\rho_{Al} = 2{,}70\times10^{-3}\) g/mm³. Contoh " + f"L = {L_M}, b = {B_M}, h = {H_M}" + r": \(h_{Al} = " + ind(H_AL, 3) + r"\) mm, \(m_{Al} = " + ind(M_AL, 2) + r"\) g vs baja " + ind(M_ST, 2) + r" g.",
                   "Untuk lentur pelat/balok dengan lebar tetap, massa pada kekakuan sama sebanding ρ/E^(1/3): itulah indeks material Ashby untuk “pelat kaku ringan”. Aluminium unggul (massa ≈ 0,50 baja) meski E-nya sepertiga, karena tinggi hanya naik 44 %. Syaratnya ruang untuk tinggi ekstra tersedia dan tegangan tetap di bawah σ_y aluminium yang lebih rendah.",
                   [("h_{Al}", "Tinggi balok aluminium (mm)"), ("E_{st}, E_{Al}", "Modulus elastisitas baja dan aluminium (MPa)"), ("m_{Al}", "Massa balok aluminium (g)"), ("\\rho_{Al}", "Massa jenis aluminium (g/mm³)")])
    isi += tabel(["Material", "E (MPa)", "ρ (g/cm³)", "σ_y (MPa)", "E/ρ (kekakuan spesifik, tarik)", "E^(1/3)/ρ (lentur pelat)", f"Massa balok kaku-sama (g, contoh {L_M} × {B_M})"],
                 [[nama, ind(E, 0), ind(rho, 2), ind(sy, 0), ind(E / 1000 / rho, 1), ind((E / 1000) ** (1 / 3) / rho, 2), ind(rho * L_M * B_M * H_M * (E_ST / E) ** (1 / 3) / 1000, 0)] for nama, E, rho, sy in MATERIAL])
    isi += kotak("info-box", "<strong>🧪 Material di FreeCAD 1.0:</strong> Body → tab Data → <em>Material</em> (Material Editor) mengisi ρ, E, dan ν sekaligus untuk bacaan massa dan untuk FEM; ganti material di satu tempat, lalu Analysis memakai nilai yang sama. Untuk substitusi aluminium, tinggi diikat ekspresi <code>=Spreadsheet.h * pow(Spreadsheet.E_st / Spreadsheet.E_Al; 1/3)</code> agar E·I tetap saat material berganti.")
    isi += kotak("warning-box", "⚠️ <strong>Kekakuan sama ≠ kekuatan sama:</strong> aluminium yang 44 % lebih tinggi memikul tegangan lentur σ = 6FL/(b·h²) yang 48 % lebih kecil daripada baja, tetapi σ_y-nya juga lebih rendah (240 vs 250 MPa); untuk beban dinamis, batas lelah aluminium jauh lebih rendah dan tidak memiliki batas ketahanan. Periksa SF lentur dan lelah sebelum mengganti material.")
    m += bagian(5, "m-material", "Pemilihan Material:<br>Kekakuan Spesifik dan Massa Minimum", "Mengganti material adalah tuas optimasi yang mengubah semua angka sekaligus. Bagian ini membandingkan baja, aluminium, titanium, dan magnesium pada kekakuan lentur sama, memperkenalkan indeks E^(1/3)/ρ, dan menunjukkan syarat yang harus diperiksa ulang.", isi, "PEMILIHAN MATERIAL")

    # 06 — Spreadsheet dan ekspresi
    isi = tabel(["Sel", "Alias", "Isi", "Keterangan"],
                [["A1 / B1", "F", str(F_H), "beban ujung (N), angka tanpa satuan"],
                 ["A2 / B2", "L", str(L_H), "panjang kantilever (mm)"],
                 ["A3 / B3", "b", str(B_H), "lebar penampang (mm)"],
                 ["A4 / B4", "sigma_izin", str(S_IZIN), "σ_y/SF = 250/2"],
                 ["A5 / B5", "h_req", "<code>=sqrt(6*F*L/(b*sigma_izin))</code>", f"hasil {ind(H_REQ, 3)}; Persamaan (3)"],
                 ["A6 / B6", "h", "<code>=ceil(h_req)</code>", f"dibulatkan ke atas → {H_PILIH}"],
                 ["A7 / B7", "delta", "<code>=4*F*L^3/(210000*b*h^3)</code>", f"δ = {ind(DELTA_PILIH, 3)} mm; periksa ≤ L/250 = {ind(L_H / 250, 2)}"],
                 ["A8 / B8", "massa", "<code>=7.85e-3*L*b*h</code>", "g; baris ini dicatat tiap iterasi"]])
    isi += cards([
        ("🏷️", "Alias", "Klik kanan sel → Properties → Alias (huruf, angka, garis bawah; tanpa spasi). Alias membuat ekspresi terbaca: <code>Spreadsheet.h_req</code>, bukan <code>Spreadsheet.B5</code>.", "Set alias"),
        ("ƒ", "Ekspresi di fitur", "Pada konstrain sketsa atau properti Pad, klik ikon f(x) lalu tulis <code>=Spreadsheet.h</code>; nilai menjadi biru/terkunci dan mengikuti sel. Satuan: sel tanpa satuan diperlakukan mm/derajat.", "=Spreadsheet.h"),
        ("🧮", "Fungsi yang tersedia", "sqrt, pow(x; y), abs, ceil, floor, round, min, max, sin/cos (derajat), pi. Pemisah argumen mengikuti lokal (; atau ,). Sel boleh merujuk sel lain: <code>=h_req*1.1</code>.", "pow(E_st/E_Al; 1/3)"),
        ("📋", "Tabel iterasi", "Baris 10 ke bawah: satu baris per iterasi (r, h_r, d, material) dengan kolom σ, δ, massa yang disalin dari hasil FEM. Ini dokumentasi optimasi yang diminta praktik Bagian 09.", "iterasi 0…n"),
    ])
    isi += anim_panel(4, "violet", "Iterasi penampang lewat parameter: profil I vs persegi panjang ber-I sama", "cvIprofil",
                      [("sl_ip_B", "v_ip_B", "Lebar sayap B (mm)", 30, 80, 1, 50, "50"),
                       ("sl_ip_H", "v_ip_H", "Tinggi H (mm)", 40, 120, 1, 90, "90"),
                       ("sl_ip_tf", "v_ip_tf", "Tebal sayap t_f (mm)", 3, 12, 0.5, 6, "6"),
                       ("sl_ip_tw", "v_ip_tw", "Tebal badan t_w (mm)", 3, 10, 0.5, 5, "5")],
                      "btnIprofil", "toggleIprofil", "iprofilInfo",
                      "<strong>Cara membaca:</strong> empat slider berperan sebagai alias Spreadsheet B, H, t_f, t_w; profil I di kiri menghitung ulang I_x (Persamaan 6) dan luasnya. Persegi panjang di kanan tumbuh sampai momen inersianya sama (PAUSE menahan tinggi akhir); bandingkan luas keduanya: itulah rasio massa per satuan panjang untuk kekakuan yang sama.")
    isi += kotak("tip-box", "💡 <strong>Urutan yang aman:</strong> (1) buat Spreadsheet dan semua alias dahulu; (2) baru sketsa dan ikat konstrainnya; (3) recompute (Ctrl+R) setelah mengubah sel; (4) hindari melingkar: sel tidak boleh membaca properti fitur yang bergantung pada sel itu. Bila ekspresi merah, periksa nama alias (huruf besar-kecil berbeda) dan pemisah argumen.")
    m += bagian(6, "m-spreadsheet", "Spreadsheet dan Ekspresi:<br>Model yang Siap Diiterasi", "Iterasi hanya cepat bila mengubah satu sel menghitung ulang seluruh model. Bagian ini membangun Spreadsheet beralias untuk kasus kantilever, mengikat konstrain sketsa dengan ekspresi, dan menyiapkan tabel iterasi sebagai dokumentasi optimasi.", isi, "SPREADSHEET DAN EKSPRESI")
    # 07 — Penampang optimal
    isi = figure(6, "Penampang I versus persegi panjang dengan momen inersia sama", f"Profil I B = {B_I}, H = {H_I}, t_f = {TF}, t_w = {TW} memiliki I_x = {ind(I_PROFIL, 0)} mm⁴ dengan luas {ind(A_PROFIL, 0)} mm²; persegi panjang selebar B yang sama kakunya harus setinggi {ind(H_REKT_I, 1)} mm dengan luas {ind(A_REKT_I, 0)} mm², {ind(A_REKT_I / A_PROFIL, 1)} kali massa.", gambar6())
    isi += formula(6, "Momen Inersia Penampang I Simetris", r"I_x = \frac{B\,H^{3} - (B - t_w)(H - 2t_f)^{3}}{12}, \qquad A = B\,H - (B - t_w)(H - 2t_f)",
                   r"Persegi luar \(B \times H\) dikurangi dua rongga sepusat \((B - t_w)/2 \times (H - 2t_f)\) di kiri-kanan badan; karena sepusat, rumus persegi panjang dikurangkan langsung. Contoh " + f"B = {B_I}, H = {H_I}, t_f = {TF}, t_w = {TW}" + r": \(I_x = " + ind(I_PROFIL, 0) + r"\) mm⁴.",
                   "Sayap menyimpan hampir seluruh momen inersia karena berada sejauh H/2 dari sumbu netral (suku A·d² Persamaan 2); badan hanya menghubungkan keduanya dan memikul geser. Itulah sebabnya rangka mesin, lengan ayun, dan braket besar memakai profil I, kotak, atau kanal, bukan pelat pejal. Di FreeCAD, sketsa profil yang berpusat di titik asal memberi I_x langsung lewat MatrixOfInertia.A11 muka sketsa.",
                   [("I_x", "Momen inersia terhadap sumbu X (mm⁴)"), ("B, H", "Lebar sayap dan tinggi total (mm)"), ("t_f, t_w", "Tebal sayap dan tebal badan (mm)"), ("A", "Luas penampang (mm²)")])
    isi += tabel(["Penampang (luas ≈ sama)", "Ukuran", "A (mm²)", "I_x (mm⁴)", "I/A (mm²)", "Massa relatif untuk I sama"],
                 [["Persegi panjang pejal", f"{B_I} × {ind(H_REKT_A, 1)}", ind(A_PROFIL, 0), ind(I_REKT_A, 0), ind(I_REKT_A / A_PROFIL, 0), f"{ind(A_REKT_I / A_PROFIL, 2)}×"],
                  ["Profil I (Gambar 6)", f"B {B_I}, H {H_I}, t_f {TF}, t_w {TW}", ind(A_PROFIL, 0), ind(I_PROFIL, 0), ind(I_PROFIL / A_PROFIL, 0), "1,00×"],
                  ["Kotak berongga", f"{B_I} × {H_I}, dinding 3", ind(2 * 3 * (B_I + H_I - 6), 0), ind((B_I * H_I ** 3 - (B_I - 6) * (H_I - 6) ** 3) / 12, 0), ind((B_I * H_I ** 3 - (B_I - 6) * (H_I - 6) ** 3) / 12 / (2 * 3 * (B_I + H_I - 6)), 0), f"{ind((A_PROFIL / (2 * 3 * (B_I + H_I - 6))) * (((B_I * H_I ** 3 - (B_I - 6) * (H_I - 6) ** 3) / 12) / I_PROFIL) ** (-0.5), 2)}× (skala tebal)"],
                  ["Silinder pejal", f"⌀{ind(2 * math.sqrt(A_PROFIL / math.pi), 1)}", ind(A_PROFIL, 0), ind(math.pi * (2 * math.sqrt(A_PROFIL / math.pi) / 2) ** 4 / 4, 0), ind(math.pi * (2 * math.sqrt(A_PROFIL / math.pi) / 2) ** 4 / 4 / A_PROFIL, 0), "paling boros untuk lentur satu arah"]])
    isi += kotak("info-box", "<strong>📏 Memilih ukuran dari dua batas:</strong> tinggi minimum kekuatan h_req = √(6FL/(bσ_izin)) (Persamaan 3) dan tinggi minimum kekakuan h_δ = (4FL³/(E·b·δ_izin))^(1/3) dari δ = 4FL³/(E·b·h³) ≤ δ_izin; ambil yang lebih besar. Untuk contoh Bagian 06 (F = " + str(F_H) + ", L = " + str(L_H) + ", b = " + str(B_H) + ", δ_izin = L/250): h_req = " + ind(H_REQ, 2) + " mm, h_δ = " + ind((4 * F_H * L_H ** 3 / (E_ST * B_H * (L_H / 250))) ** (1 / 3), 2) + " mm → pilih " + str(max(H_PILIH, math.ceil((4 * F_H * L_H ** 3 / (E_ST * B_H * (L_H / 250))) ** (1 / 3)))) + " mm bila keduanya harus dipenuhi.")
    isi += kotak("tip-box", "💡 <strong>Membaca I_x di FreeCAD:</strong> sketsa profil harus berpusat di titik asal (konstrain Symmetric terhadap origin); di Python console: <code>f = Part.Face(App.ActiveDocument.Sketch.Shape.Wires[0]); print(f.MatrixOfInertia.A11, f.MatrixOfInertia.A22, f.Area)</code> → I_x, I_y, A. Bila profil tidak berpusat di origin, kurangi A·ȳ² (sumbu sejajar) atau geser sketsanya.")
    m += bagian(7, "m-penampang", "Penampang Optimal:<br>Tinggi Minimum dan Profil I", "Setelah tuas-tuas optimasi dipahami, ukuran penampang ditetapkan dari dua batas: tegangan izin dan defleksi izin. Bagian ini menghitung tinggi minimum, membandingkan bentuk penampang pada luas sama, dan membaca momen inersia profil I dari model.", isi, "PENAMPANG OPTIMAL")

    # 08 — Python console
    isi = kode("Python console — Spreadsheet beralias dan loop parameter tinggi h (σ, δ, massa)", f'''import FreeCAD as App, math
doc = App.newDocument("Latihan10")
sh = doc.addObject("Spreadsheet::Sheet", "Spreadsheet")
for baris, (alias, nilai) in enumerate([("F", {F_H}), ("L", {L_H}), ("b", {B_H}), ("sigma_izin", {S_IZIN})], start=1):
    sh.set(f"A{{baris}}", alias); sh.set(f"B{{baris}}", str(nilai)); sh.setAlias(f"B{{baris}}", alias)
sh.set("A5", "h_req"); sh.set("B5", "=sqrt(6*F*L/(b*sigma_izin))"); sh.setAlias("B5", "h_req")
doc.recompute()
print(f"h_req dari Spreadsheet = {{sh.get('h_req'):.3f}} mm")                    # {ind(H_REQ, 3)}
F, L, b, E = {F_H}, {L_H}, {B_H}, {E_ST}
print(" h    sigma(MPa)   delta(mm)   massa(g)")
for h in range(14, 30, 2):
    I = b*h**3/12
    sigma = 6*F*L/(b*h**2); delta = F*L**3/(3*E*I); massa = 7.85e-3*L*b*h
    tanda = "OK" if sigma <= {S_IZIN} and delta <= L/250 else "--"
    print(f"{{h:3d}}  {{sigma:9.2f}}   {{delta:8.4f}}   {{massa:8.1f}}  {{tanda}}")
# h terkecil yang lolos dua batas = penampang optimal (massa minimum)''', "Python (FreeCAD)")
    isi += kode("Python console — rusuk (I gabungan, δ) dan lubang (massa, σ_maks) dengan Part untuk memeriksa volume", f'''import FreeCAD as App, Part, math
V = App.Vector
def I_gab(b, t, tr, hr):                                # penampang T: pelat b×t + rusuk tr×hr
    A1, y1, A2, y2 = b*t, t/2, tr*hr, t + hr/2
    yb = (A1*y1 + A2*y2)/(A1 + A2)
    return b*t**3/12 + A1*(y1-yb)**2 + tr*hr**3/12 + A2*(y2-yb)**2
F, L, E = {F_RIB}, {L_RIB}, {E_ST}
for hr in (0, 10, 20, {R2}, 40):
    I = I_gab({B_R}, {T_R}, {TR}, hr); print(f"h_r = {{hr:2d}}: I = {{I:9.0f}} mm^4, delta = {{F*L**3/(3*E*I):.3f}} mm")   # h_r = {R2}: {ind(I_T, 0)}
pelat = Part.makeBox({A_R}, {B_R}, {T_R})
rusuk = Part.makePolygon([V(0,0,{T_R}), V({R1},0,{T_R}), V(0,0,{T_R + R2}), V(0,0,{T_R})])
rusuk = Part.Face(rusuk).extrude(V(0,{TR},0))
print(f"Volume pelat + rusuk = {{pelat.fuse(rusuk).Volume:.1f}} (rumus {{{A_R}*{B_R}*{T_R} + 0.5*{R1}*{R2}*{TR}}})")   # {ind(V_RIB, 1)}
def Kt(x): return 3.00 - 3.13*x + 3.66*x**2 - 1.53*x**3
a, b, t, F = {A_L}, {B_L}, {T_L}, {F_L}
for d in (0, 10, 15, 20, 25, 30):
    massa = 7.85e-3*(a*b*t - 3*math.pi*d**2*t/4)
    s = (Kt(d/b) if d else 1)*F/((b-d)*t)
    print(f"d = {{d:2d}}: massa {{massa:6.1f}} g, sigma_maks {{s:6.1f}} MPa {{'OK' if s <= {S_IZIN} else 'GAGAL'}}")   # d = {D_L}: {ind(M_LUBANG, 1)} g, {ind(S_MAKS_L, 1)} MPa''', "Python (FreeCAD)")
    isi += kode("Python console — profil I: MatrixOfInertia vs rumus, dan substitusi material", f'''import FreeCAD as App, Part, math
V = App.Vector
B, H, tf, tw = {B_I}, {H_I}, {TF}, {TW}
p = [(-B/2,-H/2), (B/2,-H/2), (B/2,-H/2+tf), (tw/2,-H/2+tf), (tw/2,H/2-tf), (B/2,H/2-tf), (B/2,H/2), (-B/2,H/2), (-B/2,H/2-tf), (-tw/2,H/2-tf), (-tw/2,-H/2+tf), (-B/2,-H/2+tf)]
w = Part.makePolygon([V(x, y, 0) for x, y in p] + [V(p[0][0], p[0][1], 0)])
f = Part.Face(w)                                          # profil berpusat di titik asal
Ix = f.MatrixOfInertia.A11
print(f"I_x = {{Ix:.0f}} mm^4 (rumus {{(B*H**3 - (B-tw)*(H-2*tf)**3)/12:.0f}}), A = {{f.Area:.0f}} mm^2")   # {ind(I_PROFIL, 0)}, {ind(A_PROFIL, 0)}
h_rect = (12*Ix/B)**(1/3)
print(f"Persegi panjang lebar B ber-I sama: h = {{h_rect:.1f}} mm, A = {{B*h_rect:.0f}} mm^2 ({{B*h_rect/f.Area:.1f}}x massa)")
L, b, h = {L_M}, {B_M}, {H_M}
h_Al = h*({E_ST}/{E_AL})**(1/3)
print(f"h_Al = {{h_Al:.3f}} mm; massa baja {{7.85e-3*L*b*h:.1f}} g, aluminium {{2.70e-3*L*b*h_Al:.1f}} g")   # {ind(H_AL, 3)}; {ind(M_ST, 1)}; {ind(M_AL, 1)}
Part.show(f.extrude(V(0,0,100)), "BatangI")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (h_req " + ind(H_REQ, 3) + " mm, I_gab " + ind(I_T, 0) + " mm⁴, volume pelat berusuk " + ind(V_RIB, 1) + " mm³, massa pelat berlubang " + ind(M_LUBANG, 1) + " g, I_x profil I " + ind(I_PROFIL, 0) + " mm⁴, h_Al " + ind(H_AL, 3) + " mm). Tugas meminta model dibuat dengan Spreadsheet dan Part Design (alias, ekspresi, Body, Pad, Pocket, LinearPattern) agar pohon fitur parametriknya ada di berkas; Part API di sini hanya untuk memeriksa rumus.")
    m += bagian(8, "m-python", "Python Console:<br>Loop Parameter dan Pemeriksaan Rumus", "Cell pertama membuat Spreadsheet beralias lewat API dan menyapu tinggi h untuk menemukan penampang minimum; cell kedua menghitung rusuk dan lubang; cell ketiga membaca momen inersia profil I dari MatrixOfInertia dan menghitung substitusi material.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Model parametrik", f"Spreadsheet: alias t = {PR_T}, r = {PR_R}, hr = 0, d = 0, F = {PR_F}. Body: braket L {PR_KAKI} × {PR_TEGAK} (lebar {PR_LEBAR}) dengan Sketch tebal =Spreadsheet.t, lubang baut 2 × ⌀{PR_BAUT} di kaki, fillet sudut dalam radius =Spreadsheet.r. Recompute, catat massa baja (Volume × {ind(RHO_ST * 1000, 2)}×10⁻³)."),
               ("2", "FEM iterasi 0", f"FEM Workbench (Modul 8): Analysis, material Steel, mesh Gmsh {PR_MESH} mm, Fixed di muka kaki berlubang, Force F pada tepi kaki tegak, solve CalculiX. Catat σ_vm,maks (di sudut dalam), δ_maks, massa pada baris iterasi 0 Spreadsheet."),
               ("3", "Fillet daerah kritis", f"Ubah r: {_urut(PR_R_ITER)}; recompute dan solve ulang tiap kali. Catat σ_maks: turun mengikuti Kt (Bagian 02) tanpa perubahan massa berarti. Pilih r yang memberi SF = {PR_SY_BAJA}/σ_maks ≥ {PR_SF}."),
               ("4", "Rusuk untuk kekakuan", f"Bila δ_maks > {ind(PR_DELTA, 1)} mm: sketsa segitiga rusuk pada bidang tengah (kaki {PR_RUSUK} × hr), Pad {PR_RUSUK_PAD} mm simetris; ubah hr = {_urut(PR_HR_ITER)}. Catat δ turun (Bagian 03) dan σ baru di pertemuan rusuk–pelat; beri fillet {PR_FILLET_RUSUK} mm di sana."),
               ("5", "Pengurangan massa", f"Tambah lubang ⌀d di daerah biru kontur (dekat sumbu netral kaki tegak): d = {_urut(PR_D_ITER)}. Berhenti saat σ_maks mendekati {S_IZIN} MPa atau massa sudah ≤ target (Bagian 04)."),
               ("6", "Alternatif material", f"Duplikat dokumen; material Aluminium, tebal {PR_TEBAL_AL}. Solve: δ hampir sama, massa ≈ setengah, periksa σ_maks ≤ {PR_SY_AL}/{PR_SF} = {PR_SY_AL // PR_SF} MPa (Bagian 05)."),
               ("7", "Tabel iterasi dan simpan", f"Lengkapi tabel iterasi (r, hr, d, material, σ, δ, massa, SF); pilih desain dengan SF ≥ {PR_SF}, δ ≤ {ind(PR_DELTA, 1)} mm, massa terkecil. Ctrl+S → <code>Latihan10_NIM.FCStd</code>.")]
    isi = figure(7, "Gambar kerja braket L iteratif: ukuran awal dan parameter yang diubah tiap langkah",
                 f"Satuan mm; gaya dalam N dan tegangan dalam MPa. Kiri: profil L yang disketsa pada langkah 1 (braket {PR_KAKI} × {PR_TEGAK}, tebal t = {PR_T}) "
                 f"dengan fillet sudut dalam r = {PR_R} yang dinaikkan menjadi {PR_R_ITER[1]} lalu {PR_R_ITER[2]} pada langkah 3 (busur merah muda), Fixed di muka kaki berlubang, "
                 f"dan F = {PR_F} N di tepi kaki tegak (langkah 2). Tengah: sketsa rusuk langkah 4 pada bidang tengah, kaki {PR_RUSUK} × hr dengan hr = {PR_HR_ITER[0]} lalu {PR_HR_ITER[1]}, "
                 f"Pad {PR_RUSUK_PAD} simetris. Kanan: hasil Pad selebar {PR_LEBAR} dengan lubang baut 2 × ⌀{PR_BAUT} dan lubang ⌀d langkah 5 ({_urut(PR_D_ITER)}); "
                 "langkah tidak menetapkan letak kedua jenis lubang itu, jadi posisinya tidak diberi ukuran. Nomor bulat di bawah merujuk nomor langkah.", gambar7())
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
                 [["Ekspresi merah: “Invalid alias” / “Unknown alias”", "Alias belum dibuat, salah huruf besar-kecil, atau memakai spasi", "Set alias dahulu di Spreadsheet; nama persis sama"],
                  ["Model tidak berubah setelah sel diedit", "Belum recompute", "Ctrl+R (Std Refresh); pastikan ikon fitur tidak biru-tanda"],
                  ["Fillet gagal setelah r diperbesar", "r melebihi setengah tebal/lebar rusuk yang dipilih", "Batasi r di Spreadsheet: =min(r; t/2 − 0.5)"],
                  ["Pad rusuk keluar dari pelat / tidak menyatu", "Arah Pad normal bidang XZ menuju −Y", "Centang Reversed atau pakai Symmetric; periksa Body.Shape satu solid"],
                  ["Lubang LinearPattern keluar tepi pelat", "Overall Length terlalu besar", "Length = a/2 untuk 3 lubang di a/4…3a/4; diameter ≤ b/2"],
                  ["MatrixOfInertia.A11 tidak sama rumus", "Profil tidak berpusat di titik asal, atau wire terbuka", "Konstrain Symmetric ke origin; Part.Face(Wires[0]) harus tertutup"],
                  ["σ_maks FEM naik terus saat mesh dihaluskan", "Sudut tajam (singularitas), bukan fillet", "Beri fillet dahulu; nilai σ hanya dibaca di fillet"],
                  ["Massa FreeCAD 1.0 berbeda dari ρ·V", "Material Body belum diatur / satuan ρ", "Body → Material; atau hitung 7,85×10⁻³ × Volume(mm³)"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) Spreadsheet dengan alias yang diminta dan sel rumus (h_req atau h_Al); (2) konstrain sketsa terikat ekspresi (nilai biru), sketsa fully constrained; (3) Body satu solid dengan pohon fitur sesuai tugas (Pad, Pocket, LinearPattern, rusuk); (4) profil I berpusat di titik asal untuk Tugas 5; (5) angka dibaca dari Spreadsheet/Body (Tip) dengan desimal sesuai label; (6) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Braket Iteratif dari Tegangan ke Massa", "Tujuh langkah berikut menjalankan satu siklus optimasi lengkap pada braket L: model parametrik, FEM awal, fillet daerah kritis, rusuk, lubang penghemat massa, alternatif aluminium, dan tabel iterasi; ditutup tabel gejala dan perbaikan.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: Spreadsheet Workbench, Expressions, PartDesign LinearPattern/Fillet, FEM Workbench, Part TopoShape (MatrixOfInertia)", " (wiki.freecad.org), 2024–2026.", "Acuan alias, sintaks ekspresi dan fungsi, pola fitur, serta API yang dipakai di cell Python.")
    refs += pm_ref(2, "amber", "249,115,22", "R. G. Budynas &amp; J. K. Nisbett", "Shigley's Mechanical Engineering Design", ", 11th ed. McGraw-Hill, 2020.", "Faktor konsentrasi tegangan (bahu, lubang), faktor keamanan, dan perancangan penampang dari tegangan izin.")
    refs += pm_ref(3, "violet", "168,85,247", "M. F. Ashby", "Materials Selection in Mechanical Design", ", 5th ed. Butterworth-Heinemann, 2017.", "Indeks material E^(1/2)/ρ dan E^(1/3)/ρ untuk balok dan pelat kaku ringan; dasar Bagian 05.")
    refs += pm_ref(4, "green", "0,224,158", "W. D. Pilkey, D. F. Pilkey &amp; Z. Bi", "Peterson's Stress Concentration Factors", ", 4th ed. Wiley, 2020.", "Grafik Kt bahu bertingkat dan pelat berlubang yang didekati Persamaan (1) dan (4).")
    refs += pm_ref(5, "pink", "236,72,153", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: design table/equations dan iterasi desain parametrik; konsep yang sama pada Spreadsheet FreeCAD.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari siklus iterasi, faktor konsentrasi tegangan, kekakuan penampang, pemilihan material, dan pemodelan parametrik dengan Spreadsheet. Dokumentasi Spreadsheet dan Expressions adalah pendamping wajib karena sintaks fungsi mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Spreadsheet Workbench (alias, Set alias), Expressions (fungsi sqrt/pow/ceil, pemisah argumen), PartDesign LinearPattern dan Fillet, FEM Workbench (Modul 8–9), dan Part TopoShape (MatrixOfInertia, Volume). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasil tiap iterasi.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 10 — Optimasi Desain Pasca-Simulasi · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">h_req = √(6FL/bσ_izin)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">V = abt + ½r₁r₂tᵣ</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">m = ρ·V</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">h_Al = 1,44·h</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">MatrixOfInertia.A11</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 11 · Optimasi Desain Pasca-Simulasi</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 10</span><br><em>Lima Model</em><br>yang Dioptimasi</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang siklus iterasi, fillet dan Kt, rusuk, pengurangan massa, pemilihan material, Spreadsheet, dan penampang, ditambah 5 tugas pemodelan parametrik: tinggi balok dari tegangan izin (Spreadsheet), pelat berusuk, pelat tiga lubang penghemat massa, substitusi baja → aluminium dengan kekakuan sama, dan momen inersia profil I. Setiap tugas mengunggah berkas .FCStd (Spreadsheet/Body parametrik) dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Urutan <strong>siklus optimasi pasca-simulasi</strong> yang benar adalah...",
     ["Modifikasi model → menggambar ulang → mencetak gambar kerja", "Simulasi sekali → menerima hasil apa pun sebagai desain akhir", "Simulasi → evaluasi terhadap kriteria (σ_izin, δ_izin, massa) → modifikasi satu parameter model → simulasi ulang sampai memenuhi", "Mengubah semua parameter sekaligus lalu memilih hasil yang tampak paling bagus"],
     "Siklus iterasi"),
    ("<strong>Fillet</strong> pada bahu (shoulder) menurunkan tegangan puncak karena...",
     ["Memperbesar radius r memperkecil h/r sehingga Kt turun; σ_maks = Kt·σ_nom sedangkan σ_nom tetap", "Fillet menambah bahan sehingga σ_nom turun drastis", "Fillet mengubah modulus elastisitas di daerah itu", "Fillet menghilangkan momen lentur di bahu"],
     "Fillet dan Kt"),
    ("Menambahkan <strong>rusuk</strong> pada pelat kantilever terutama...",
     ["Menurunkan σ_nom karena luas penampang bertambah banyak", "Mengurangi panjang efektif kantilever", "Mengubah material menjadi lebih kaku", "Menaikkan momen inersia penampang lewat suku A·d² sehingga defleksi turun jauh lebih besar daripada tambahan massanya"],
     "Rusuk dan kekakuan"),
    ("<strong>Lubang penghemat massa</strong> sebaiknya ditempatkan...",
     ["Tepat di daerah bertegangan tertinggi agar tegangan tersebar", "Di daerah bertegangan rendah (jauh dari daerah kritis), lalu σ_maks = Kt·σ_nom diperiksa ulang", "Di sudut dalam braket, menggantikan fillet", "Di mana saja karena lubang tidak mengubah tegangan"],
     "Penempatan lubang"),
    ("Untuk <strong>kekakuan lentur sama</strong> (E·I tetap), mengganti baja (E = 210 000 MPa) dengan aluminium (E = 70 000 MPa) mengharuskan tinggi balok...",
     ["Dikalikan 3^(1/3) ≈ 1,44 sehingga massanya sekitar setengah massa baja", "Dikalikan 3 sehingga massanya sama dengan baja", "Dibagi 3 karena aluminium lebih ringan", "Tetap, karena kekakuan hanya bergantung pada ρ"],
     "Substitusi material"),
    ("<strong>Alias</strong> pada Spreadsheet FreeCAD berguna untuk...",
     ["Mengunci sel agar tidak bisa diedit", "Mengubah satuan seluruh dokumen", "Memberi nama sel (mis. F, L, h_req) agar dapat dirujuk ekspresi di properti fitur atau konstrain sketsa, seperti =Spreadsheet.h_req", "Menyalin sel ke dokumen lain"],
     "Alias Spreadsheet"),
    ("Tinggi minimum kantilever persegi panjang (lebar b, beban ujung F, panjang L) agar σ_maks ≤ σ_izin adalah...",
     ["h_req = 6·F·L/(b·σ_izin)", "h_req = √(6·F·L/(b·σ_izin))", "h_req = (F·L³/(3·E·b))^(1/3)", "h_req = b·σ_izin/(6·F·L)"],
     "Tinggi minimum h_req"),
    ("Momen inersia <strong>penampang I simetris</strong> (lebar sayap B, tinggi H, tebal sayap t_f, tebal badan t_w) terhadap sumbu X adalah...",
     ["I_x = B·H³/12", "I_x = t_w·H³/12 + 2·B·t_f³/12", "I_x = (B − t_w)(H − 2t_f)³/12", "I_x = [B·H³ − (B − t_w)(H − 2t_f)³]/12 (persegi luar dikurangi dua rongga sepusat)"],
     "Momen inersia profil I"),
    ("Di Python console, momen inersia luas penampang sketsa yang <strong>berpusat di titik asal</strong> dibaca dari...",
     ["Part.Face(sketsa.Shape.Wires[0]).MatrixOfInertia.A11 (= I_x untuk profil di bidang XY)", "sketsa.Shape.Length", "Body.Shape.Volume dibagi panjang Pad", "sketsa.Shape.BoundBox.DiagonalLength"],
     "Membaca I_x di Python"),
    ("Faktor keamanan <strong>SF = σ_y/σ_izin = 2</strong> berarti...",
     ["Tegangan izin dua kali tegangan luluh", "Tegangan izin adalah setengah tegangan luluh; desain diterima bila σ_maks ≤ σ_y/2", "Defleksi izin adalah setengah panjang balok", "Massa harus dikurangi setengahnya"],
     "Arti faktor keamanan"),
]

TUGAS_LABELS = ["Spreadsheet h_req dari σ_izin — h_req (mm)", "Pelat + rusuk segitiga — volume (mm³)", "Pelat 3 lubang LinearPattern — massa baja (g)",
                "Substitusi Al kekakuan sama — massa Al (g)", "Profil I berpusat di origin — I_x (mm⁴)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 2, 3: 0}

FQ_JUDUL = [
    "Bagaimana menurunkan tegangan puncak di bahu pivot lengan ayun tanpa menambah massa, dan seberapa besar radius fillet yang cukup?",
    "Rusuk atau penebalan untuk memenuhi batas defleksi, dan di mana lubang penghemat massa boleh diletakkan?",
    "Bagaimana Spreadsheet, penampang, dan pilihan material menutup iterasi dengan SF ≥ 2, δ ≤ δ_izin, dan massa ≤ 2,0 kg?",
]
FQ_RINGKAS = [
    "Dari hasil FEM (σ_maks 215 MPa di bahu pivot, σ_y 240 MPa) tentukan Kt yang bekerja, hitung radius fillet yang membawa SF ke ≥ 2 dengan Persamaan (1), dan jelaskan mengapa mesh di fillet harus dihaluskan sebelum angkanya dipercaya.",
    "Bandingkan rusuk vs penebalan lengan untuk menurunkan δ dari 3,4 ke ≤ 1,7 mm dengan Persamaan (2) dan δ ∝ 1/I; tetapkan daerah aman untuk lubang penghemat massa dan periksa σ_maks tepi lubang dengan Persamaan (4).",
    "Susun Spreadsheet beralias (r, h_r, d, B, H, t_f, t_w), hitung ukuran penampang dari dua batas (Persamaan 3 dan 6), bandingkan lengan aluminium dan baja pada kekakuan sama (Persamaan 5), lalu pilih desain akhir dengan tabel iterasi.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Hasil FEM lengan ayun aluminium 6061 (σ_y = 240 MPa): σ_vm,maks = 215 MPa tepat di bahu dudukan poros pivot, tempat tinggi profil berubah dari 60 ke 40 mm (h = 10) dengan fillet R2, sedangkan tegangan nominal di sana hanya 95 MPa. Tentukan Kt yang bekerja, hitung dengan Persamaan (1) radius fillet yang membawa σ_maks ke ≤ 120 MPa (SF 2), dan jelaskan mengapa angka σ_maks di fillet hanya boleh dipercaya setelah mesh di daerah itu dihaluskan (Bagian 02).",
            ["σ_maks 215 · σ_nom 95 MPa", "h = 10, fillet R2 → R?", "target SF ≥ 2"],
            "Cara paling efektif menurunkan tegangan puncak di bahu tanpa menambah massa adalah...",
            ["Menebalkan seluruh lengan dua kali lipat", "Memperbesar radius fillet bahu sehingga Kt turun (σ_maks = Kt·σ_nom, σ_nom tetap)", "Mengganti material menjadi baja", "Menghaluskan mesh FEM sampai tegangan turun"],
            "✅ Tepat! Tegangan puncak adalah Kt kali tegangan nominal; fillet memperkecil h/r dan menurunkan Kt tanpa mengubah σ_nom maupun massa. Menebalkan lengan menurunkan σ_nom tetapi mahal massanya; mesh yang lebih halus justru menaikkan σ pada sudut tajam.",
            "❌ Menebalkan seluruh lengan membayar massa untuk masalah lokal; baja lebih berat tiga kali; mesh halus tidak mengubah desain (dan pada sudut tajam menaikkan σ). Lihat Bagian 02 dan Animasi 1.",
            "Petunjuk: (1) Kt = σ_maks/σ_nom. (2) Balik Persamaan (1) untuk r. (3) Jelaskan singularitas sudut tajam dan konvergensi mesh.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Defleksi ujung poros roda 3,4 mm melampaui batas L/250 ≈ 1,7 mm untuk lengan sepanjang 420 mm. Tim mengusulkan dua jalan: menebalkan dinding lengan dari 4 ke 6 mm (massa +50 %) atau menambah rusuk tinggi 20 mm tebal 4 mm sepanjang sisi dalam. Bandingkan keduanya dengan Persamaan (2) dan δ ∝ 1/I (Bagian 03), lalu tentukan di mana lubang penghemat massa ⌀25 boleh diletakkan agar σ_maks tepi lubang (Persamaan 4) tetap ≤ 120 MPa (Bagian 04).",
            ["δ 3,4 → ≤ 1,7 mm", "dinding 4 → 6 mm vs rusuk 20 × 4", "lubang ⌀25 di daerah biru"],
            "Rusuk menurunkan defleksi lengan ayun terutama karena...",
            ["Menambah massa sehingga getaran teredam", "Memperpendek panjang efektif lengan", "Menaikkan momen inersia penampang (bahan dijauhkan dari sumbu netral, suku A·d²) sehingga δ ∝ 1/I turun", "Menurunkan modulus elastisitas material"],
            "✅ Tepat! Rusuk bekerja lewat suku A·d² teorema sumbu sejajar: sedikit bahan jauh dari sumbu netral melipatgandakan I, dan δ = F·L³/(3·E·I) turun sebanding. Penebalan dinding juga menaikkan I, tetapi dengan massa yang jauh lebih besar.",
            "❌ Massa dan redaman tidak mengubah defleksi statis; panjang lengan ditentukan geometri sepeda; E adalah sifat material. Lihat Persamaan (2) dan Animasi 2.",
            "Petunjuk: (1) Hitung I sebelum/sesudah untuk kedua usulan. (2) Bandingkan δ dan massa. (3) Tetapkan daerah lubang dari kontur von Mises dan periksa Kt.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Manajemen menetapkan target akhir: SF ≥ 2, δ ≤ 1,7 mm, massa ≤ 2,0 kg (sekarang 2,6 kg), dan model harus parametrik agar varian rangka berikutnya cepat dibuat. Susun Spreadsheet beralias (r, h_r, d, B, H, t_f, t_w) dan ekspresi yang mengikat sketsa (Bagian 06); tentukan tinggi minimum penampang dari dua batas (Persamaan 3 dan h_δ, Bagian 07); bandingkan penampang kotak/I terhadap pelat pejal dengan Persamaan (6); dan nilai apakah lengan baja setipis 1/1,44 kali (Persamaan 5, Bagian 05) lebih ringan atau lebih berat daripada aluminium.",
            ["alias r, h_r, d, B, H, t_f, t_w", "h_req vs h_δ · I profil", "Al vs baja: kekakuan sama"],
            "Untuk kekakuan lentur sama, lengan aluminium dibandingkan lengan baja...",
            ["Harus 1,44× lebih tinggi tetapi massanya sekitar setengah massa baja", "Sama tinggi dan sama berat", "Boleh lebih tipis karena E-nya lebih kecil", "Selalu lebih berat karena perlu lebih banyak bahan"],
            "✅ Tepat! E·I sama ⇒ h_Al = h·(E_st/E_Al)^(1/3) = 1,44·h; massa ∝ ρ·h sehingga m_Al/m_st = 2,70 × 1,44/7,85 ≈ 0,50. Syaratnya ada ruang untuk tinggi ekstra dan σ_maks tetap di bawah σ_y aluminium.",
            "❌ E aluminium sepertiga baja, jadi balok harus lebih tinggi, bukan lebih tipis; tetapi karena ρ-nya sepertiga dan tinggi hanya naik 44 %, massanya justru separuh. Lihat Persamaan (5) dan Gambar 5.",
            "Petunjuk: (1) Daftarkan alias dan ekspresi pengikatnya. (2) Hitung h dari dua batas dan I penampang pilihan. (3) Bandingkan massa Al vs baja, lalu isi tabel iterasi dan pilih desain akhir.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">lengan ayun Al 6061</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">σ_maks = Kt·σ_nom</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">δ ∝ 1/I</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">SF ≥ 2 · m ≤ 2,0 kg</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 11 · Optimasi Desain Pasca-Simulasi</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Lengan Ayun<br><em>yang Diiterasi</em></h1>
    <p class="hero-sub">Startup Kayuh Elektrik menyelesaikan FEM pertama lengan ayun sepeda listriknya dan hasilnya belum memenuhi target. Terapkan Pertemuan 11: fillet untuk daerah kritis, rusuk untuk kekakuan, lubang untuk massa, Spreadsheet untuk iterasi, dan pemilihan material, untuk membawa desain ke SF ≥ 2, δ ≤ 1,7 mm, dan massa ≤ 2,0 kg.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Startup Kayuh Elektrik —<br>Optimasi Lengan Ayun Pasca-FEM</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS OPTIMASI DESAIN</div>
    <p>
      <strong style="color:var(--amber)">Startup Kayuh Elektrik</strong> merancang <strong style="color:var(--cyan)">lengan ayun (swingarm) sepeda listrik</strong> dari aluminium 6061 (σ_y = 240 MPa) sepanjang 420 mm dari poros pivot ke poros roda, dinding 4 mm, beban roda 2 400 N. FEM pertama (Modul 8–9) menunjukkan: <strong>σ_vm,maks = 215 MPa</strong> di bahu dudukan pivot (fillet R2; tegangan nominal 95 MPa), <strong>δ ujung 3,4 mm</strong> (batas L/250 ≈ 1,7 mm), dan <strong>massa 2,6 kg</strong>.
    </p>
    <p style="margin-top:12px">
      Target manajemen: <strong style="color:var(--cyan)">SF ≥ 2, δ ≤ 1,7 mm, massa ≤ 2,0 kg</strong>, dan model harus parametrik agar varian rangka berikutnya cepat dibuat. Iterasi pertama tim gagal: dinding ditebalkan menjadi 6 mm (massa 3,4 kg), fillet tidak disentuh sehingga σ_maks tetap 200-an MPa, dan lubang penghemat massa dibuat tepat di dekat bahu sehingga tegangan naik lagi.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">rencana iterasi</strong>: perbaikan daerah kritis, jalan menuju kekakuan, penempatan lubang, Spreadsheet beralias, ukuran penampang, dan keputusan material.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("σ_maks 215 MPa di bahu, fillet R2 · σ_y 240", "14,165,233", "cyan")}
{kartu("δ ujung 3,4 mm · batas 1,7 mm (L = 420)", "14,165,233", "cyan")}
{kartu("massa 2,6 kg → target ≤ 2,0 kg", "14,165,233", "cyan")}
{kartu("SF ≥ 2 · model parametrik (Spreadsheet)", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Tegangan yang tak turun, defleksi yang mahal, dan lubang yang salah tempat berasal dari tiga hal: daerah kritis yang tidak difillet, bahan yang ditambah di tempat yang salah, dan iterasi tanpa model parametrik. Forum ini mengajak Anda membereskan ketiganya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Lengan ayun dari pivot ke poros roda: bahu kritis (fillet), rusuk sisi dalam, lubang penghemat massa di daerah bertegangan rendah</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Startup Kayuh Elektrik merancang lengan ayun sepeda listrik dari aluminium 6061 (&sigma;_y = 240 MPa) sepanjang 420 mm, dinding 4 mm, beban roda 2.400 N. FEM pertama: &sigma;_maks 215 MPa di bahu dudukan pivot (fillet R2, tegangan nominal 95 MPa), defleksi ujung 3,4 mm (batas L/250 &asymp; 1,7 mm), massa 2,6 kg. Target: SF &ge; 2, &delta; &le; 1,7 mm, massa &le; 2,0 kg, model parametrik. Iterasi pertama gagal: dinding ditebalkan ke 6 mm (massa 3,4 kg), fillet tidak disentuh, lubang penghemat massa dibuat dekat bahu. Susun rencana iterasi: fillet daerah kritis (Kt), rusuk vs penebalan (I gabungan), penempatan lubang (Kt lubang), Spreadsheet beralias, ukuran penampang dari &sigma;_izin dan &delta;_izin, dan keputusan material Al vs baja pada kekakuan sama."
FORUM_CHIPS_LMS = ["σ_maks 215 MPa di bahu · fillet R2", "δ 3,4 mm → ≤ 1,7 mm (L = 420)", "massa 2,6 kg → ≤ 2,0 kg", "SF ≥ 2 · Spreadsheet parametrik"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Lengan ayun sepeda listrik: bahu kritis, rusuk, lubang penghemat massa (Pertemuan 11)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const x0 = W * 0.14, x1 = W * 0.86, cy = H * 0.58, hP = 34, hR = 22;
  // lengan meruncing dari pivot (kiri, tinggi hP) ke poros roda (kanan, tinggi hR) dengan bahu di dekat pivot
  const xb = x0 + (x1 - x0) * 0.22;
  ctx.beginPath(); ctx.moveTo(x0, cy - hP); ctx.lineTo(xb - 8, cy - hP); ctx.quadraticCurveTo(xb, cy - hP, xb, cy - hP + 8); ctx.lineTo(xb, cy - hR - 4); ctx.lineTo(x1, cy - hR); ctx.lineTo(x1, cy + hR); ctx.lineTo(xb, cy + hR + 4); ctx.lineTo(xb, cy + hP - 8); ctx.quadraticCurveTo(xb, cy + hP, xb - 8, cy + hP); ctx.lineTo(x0, cy + hP); ctx.closePath();
  ctx.fillStyle = 'rgba(34,211,238,.12)'; ctx.fill(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.6; ctx.stroke();
  // pivot dan poros roda
  [[x0, 14], [x1, 10]].forEach(([x, r]) => { ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#020812'; ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4; ctx.stroke(); });
  // daerah kritis di bahu (merah) dan fillet usulan
  const gl = ctx.createRadialGradient(xb + 2, cy - hR - 2, 2, xb + 2, cy - hR - 2, 16); gl.addColorStop(0, 'rgba(239,68,68,.75)'); gl.addColorStop(1, 'rgba(239,68,68,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(xb + 2, cy - hR - 2, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(xb + 12, cy - hR - 16, 12, Math.PI / 2, Math.PI); ctx.stroke(); ctx.setLineDash([]);
  // rusuk sisi dalam (garis tebal sepanjang lengan) dan lubang penghemat massa di daerah biru
  ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xb + 6, cy); ctx.lineTo(x1 - 24, cy); ctx.stroke();
  [0.5, 0.68].forEach(f => { const x = xb + (x1 - xb) * f; ctx.beginPath(); ctx.arc(x, cy, 9, 0, Math.PI * 2); ctx.fillStyle = '#020812'; ctx.fill(); ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.6; ctx.stroke(); });
  ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444'; ctx.fillText('σ_maks 215 MPa → fillet R2 → R?', xb + 10, cy - hP - 12);
  ctx.fillStyle = '#00e09e'; ctx.fillText('rusuk: I naik, δ 3,4 → ≤ 1,7 mm', (xb + x1) / 2, cy + hR + 20);
  ctx.fillStyle = '#a855f7'; ctx.fillText('lubang ⌀25 di daerah biru (Kt ≈ 2,5)', (xb + x1) / 2, cy - hR - 12);
  ctx.fillStyle = 'rgba(226,232,240,.85)'; ctx.fillText('pivot', x0, cy + hP + 20); ctx.fillText('poros roda · F = 2 400 N', x1, cy + hR + 20);
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0,224,158,.95)';
  ctx.fillText('■ target: SF ≥ 2 · δ ≤ 1,7 mm · massa 2,6 → ≤ 2,0 kg · Spreadsheet r, h_r, d, B, H', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
