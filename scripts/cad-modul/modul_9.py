# Konten Modul 9 Pemodelan CAD — Evaluasi Hasil Simulasi dan Analisis Kekuatan
# (Pertemuan 10, Sub-CPMK 3.2: membaca hasil FEM — kontur, min/maks, von Mises,
# deformasi — faktor keamanan, konvergensi mesh, konsentrasi tegangan, validasi
# analitis vs FEM, post-processing Python). Angka contoh dihitung di sini agar teks,
# tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian tugas parametrik
# mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 9
JUDUL = "Evaluasi Hasil Simulasi dan Analisis Kekuatan"
JUDUL_PANJANG = "Evaluasi Hasil Simulasi dan Analisis Kekuatan"
JUDUL_EKSPOR = "Evaluasi Hasil Simulasi"

# ─────────────────────────── angka contoh ───────────────────────────
E_ST, NU_ST, SIG_Y = 210000, 0.3, 250                       # baja S235 (MPa)
F_C, L_C, B_C, H_C = 500, 200, 20, 20                        # kantilever contoh
I_C = B_C * H_C ** 3 / 12
SIG_C = 6 * F_C * L_C / (B_C * H_C ** 2)
DELTA_C = F_C * L_C ** 3 / (3 * E_ST * I_C)
SF_C = SIG_Y / SIG_C
K_C = F_C / DELTA_C
SIG_FEM_C, DELTA_FEM_C = 77.6, 0.481                         # ilustrasi hasil FEM mesh 2 mm
F_S, L_S, B_S, H_S = 2000, 500, 30, 20                       # tumpuan sederhana contoh
I_S = B_S * H_S ** 3 / 12
DELTA_S = F_S * L_S ** 3 / (48 * E_ST * I_S)
BATAS_S = L_S / 250
DELTA_FEM_S = 1.247
W_P, T_P, D_P, F_P = 60, 5, 15, 5000                         # pelat berlubang contoh
R_P = D_P / W_P


def kt_peterson(r):
    return 3.00 - 3.13 * r + 3.66 * r ** 2 - 1.53 * r ** 3


KT_P = kt_peterson(R_P)
SIG_NOM_P = F_P / ((W_P - D_P) * T_P)
SIG_MAKS_P = KT_P * SIG_NOM_P
SIG_FEM_P = 55.9
L_K, H_K, B_K = 500, 10, 20                                  # kolom Euler contoh
I_K = B_K * H_K ** 3 / 12
P_CR = math.pi ** 2 * E_ST * I_K / L_K ** 2
SIG_K = P_CR / (B_K * H_K)
P_CR_FEM = 13990.0
# konvergensi mesh pelat berlubang (ilustrasi): ukuran elemen → jumlah elemen, σ_maks
KONV_H = [8, 4, 2, 1]
KONV_N = [900, 3600, 21000, 150000]
KONV_SIG = [SIG_MAKS_P * (1 - 0.15 * (h / 8) ** 1.3) for h in KONV_H]
KONV_UBAH = [None] + [abs(KONV_SIG[i] - KONV_SIG[i - 1]) / KONV_SIG[i - 1] * 100 for i in range(1, 4)]


def err(fem, ana):
    return abs(fem - ana) / ana * 100


# ─────────────────────────── gambar ───────────────────────────
def _warna(v):
    """Skala kontur FEM: biru → cyan → hijau → kuning → merah untuk v = 0…1."""
    stops = [(0.0, (59, 130, 246)), (0.25, (34, 211, 238)), (0.5, (34, 197, 94)), (0.75, (245, 158, 11)), (1.0, (239, 68, 68))]
    v = max(0.0, min(1.0, v))
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if v <= b:
            f = (v - a) / (b - a)
            return "rgb(%d,%d,%d)" % tuple(round(ca[i] + (cb[i] - ca[i]) * f) for i in range(3))
    return "rgb(239,68,68)"


def _grad(gid):
    stops = "".join(f'<stop offset="{p * 100:.0f}%" stop-color="{_warna(p)}"/>' for p in [0, 0.25, 0.5, 0.75, 1])
    return f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0">{stops}</linearGradient></defs>'


def _dinding(x, y0, y1, arah=1):
    out = f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y1}" stroke="{AX}" stroke-width="2"/>'
    for yy in range(int(y0), int(y1), 8):
        out += f'<line x1="{x}" y1="{yy + 8}" x2="{x - 8 * arah}" y2="{yy}" stroke="{AX}" stroke-width="1"/>'
    return out


def gambar1():
    b = _grad("m9g1")
    w, h = 124, 54
    tahap = [("Solve", "CalculiX statik", "#22d3ee"), ("CCX_Results", "objek hasil", "#f59e0b"), ("Show result", "jenis hasil, kontur", "#a855f7"),
             ("Min / Maks", "nilai & lokasi node", "#ec4899"), ("Bandingkan", "analitis, SF, batas", "#00e09e")]
    xs = [10, 142, 274, 406, 538]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 30, w, h, [a, s], c, 11.5)
    for i in range(4):
        b += arrow(xs[i] + w, 57, xs[i + 1], 57)
    b += t(180, 110, "Skala kontur von Mises (MPa)", 10.5, TX, "middle", "600")
    b += '<rect x="40" y="118" width="280" height="14" rx="3" fill="url(#m9g1)"/>'
    b += t(40, 148, "0 (min)", 10, AX, "start") + t(320, 148, "σ_maks (maks)", 10, AX, "end")
    b += t(180, 170, "biru = rendah · merah = tinggi; legenda memuat min/maks seluruh mesh", 10, AX)
    b += t(440, 112, "Hasil yang tersedia:", 11, TX, "start", "600")
    for i, s_ in enumerate(["Displacement (vektor, panjang)", "von Mises, Principal maks/min", "Max shear, Strain", "Temperature (analisis termal)", "Buckling factor (analisis tekuk)"]):
        b += t(440, 130 + i * 16, s_, 10, AX, "start")
    b += teks2(340, 222, "Alur baca: solve → objek hasil → pilih besaran → kontur dan min/maks → bandingkan dengan rumus, SF, dan batas", 11, AX, maks=92)
    return svg(680, 240, b, "Gambar 1 — Alur membaca hasil FEM: objek hasil, kontur, min/maks, pembanding analitis")


def gambar2():
    b = ""
    x0, x1, y0, y1 = 70, 330, 80, 120
    nx, nz = 26, 8
    for i in range(nx):
        for j in range(nz):
            xa = x0 + (x1 - x0) * i / nx
            ya = y0 + (y1 - y0) * j / nz
            xm = (i + 0.5) / nx
            ym = abs((j + 0.5) / nz - 0.5) * 2
            v = (1 - xm) * ym
            b += f'<rect x="{xa:.1f}" y="{ya:.1f}" width="{(x1 - x0) / nx + 0.4:.1f}" height="{(y1 - y0) / nz + 0.4:.1f}" fill="{_warna(v)}" opacity=".85"/>'
    b += f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="none" stroke="{TX}" stroke-width="1.2"/>'
    b += _dinding(x0, y0 - 10, y1 + 10)
    b += f'<line x1="{x0}" y1="{(y0 + y1) / 2}" x2="{x1}" y2="{(y0 + y1) / 2}" stroke="{TX}" stroke-width=".8" stroke-dasharray="6 3"/>'
    b += arrow(x1, 40, x1, y0 - 2, "#ef4444", 2)
    b += t(x1 + 8, 60, "F", 11, "#ef4444", "start", "700")
    b += t(x1 + 6, 104, "sumbu netral", 9.5, AX, "start")
    b += t(200, 70, "σ = M(x)·y/I, M(x) = F·(L − x)", 10.5, TX)
    b += f'<polygon points="{x0},190 {x0},150 {x1},190" fill="rgba(239,68,68,.25)" stroke="#ef4444" stroke-width="1.4"/>'
    b += t(x0, 144, "σ_maks = 6FL/(bh²) di jepitan", 10, "#ef4444", "start", "600")
    b += t(200, 206, "diagram |σ| serat terluar sepanjang x (nol di ujung bebas)", 10, AX)
    b += t(452, 56, "Contoh kantilever:", 11, "#22d3ee", "start", "600")
    b += t(452, 74, f"F = {F_C} N, L = {L_C}, b = h = {B_C}", 10, AX, "start")
    b += t(452, 92, f"I = bh³/12 = {ind(I_C, 1)} mm⁴", 10, AX, "start")
    b += t(452, 116, "σ_maks = 6FL/(bh²)", 11, TX, "start")
    b += t(452, 134, f"= {ind(SIG_C, 2)} MPa", 11, "#00e09e", "start")
    b += t(452, 158, f"von Mises FEM (mesh 2 mm) ≈ {ind(SIG_FEM_C, 1)}", 10, AX, "start")
    b += t(452, 176, f"kesalahan relatif ≈ {ind(err(SIG_FEM_C, SIG_C), 1)} %", 10, AX, "start")
    b += t(452, 200, "σ_vm = |σ| untuk lentur murni", 10, AX, "start")
    b += teks2(340, 246, "Tegangan lentur maksimum ada di serat terluar muka jepitan; kontur von Mises FEM kantilever menunjukkan pola yang sama", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 2 — Distribusi tegangan lentur kantilever dan kontur von Mises")


def gambar3():
    b = ""
    # (a) kantilever
    xa, xb, ya = 50, 250, 70
    b += _dinding(xa, ya - 16, ya + 16)
    b += f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{ya}" stroke="rgba(148,163,184,.5)" stroke-width="3" stroke-dasharray="6 4"/>'
    pts = []
    for k in range(41):
        u = k / 40
        pts.append((xa + (xb - xa) * u, ya + 30 * u * u * (3 - u) / 2))
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#22d3ee" stroke-width="3"/>'
    b += arrow(xb, 30, xb, ya - 2, "#ef4444", 2) + t(xb + 8, 44, "F", 11, "#ef4444", "start", "700")
    b += arrow(xb + 14, ya, xb + 14, ya + 30, "#00e09e", 1.4) + t(xb + 20, ya + 20, "δ", 11, "#00e09e", "start", "700")
    b += t(xa, 46, "kantilever, beban ujung", 10.5, "#22d3ee", "start", "600")
    b += t(150, 124, "δ_maks = F·L³/(3·E·I) di ujung bebas", 10.5, "#22d3ee")
    # (b) tumpuan sederhana
    xa, xb, yb = 50, 250, 190
    for xx in (xa, xb):
        b += f'<polygon points="{xx},{yb} {xx - 9},{yb + 16} {xx + 9},{yb + 16}" fill="none" stroke="{AX}" stroke-width="1.5"/>'
    b += f'<line x1="{xa}" y1="{yb}" x2="{xb}" y2="{yb}" stroke="rgba(148,163,184,.5)" stroke-width="3" stroke-dasharray="6 4"/>'
    pts = [(xa + (xb - xa) * k / 40, yb + 30 * math.sin(math.pi * k / 40)) for k in range(41)]
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#f59e0b" stroke-width="3"/>'
    b += arrow(150, 150, 150, yb - 2, "#ef4444", 2) + t(158, 164, "F", 11, "#ef4444", "start", "700")
    b += arrow(150 + 14, yb, 150 + 14, yb + 30, "#00e09e", 1.4) + t(170, yb + 20, "δ", 11, "#00e09e", "start", "700")
    b += t(xa, 166, "tumpuan sederhana", 10.5, "#f59e0b", "start", "600")
    b += t(150, 244, "δ_maks = F·L³/(48·E·I) di tengah bentang", 10.5, "#f59e0b")
    b += t(452, 50, "Contoh:", 11, TX, "start", "600")
    b += t(452, 68, f"kantilever {F_C} N, L {L_C}, {B_C} × {H_C}", 10, AX, "start")
    b += t(452, 86, f"δ = {ind(DELTA_C, 4)} mm", 10.5, "#00e09e", "start")
    b += t(452, 110, f"tumpuan sederhana {F_S} N, L {L_S},", 10, AX, "start")
    b += t(452, 128, f"penampang {B_S} × {H_S} → I = {ind(I_S, 0)}", 10, AX, "start")
    b += t(452, 146, f"δ = {ind(DELTA_S, 4)} mm", 10.5, "#00e09e", "start")
    b += t(452, 164, f"batas L/250 = {ind(BATAS_S, 3)} mm → OK", 10, AX, "start")
    b += t(452, 188, f"Displacement FEM ≈ {ind(DELTA_FEM_C, 3)} / {ind(DELTA_FEM_S, 3)}", 10, AX, "start")
    b += t(452, 212, "kekakuan k = F/δ (N/mm)", 10, TX, "start")
    b += teks2(340, 266, "Lendutan dibandingkan dengan batas L/250 (umum) atau L/360–L/500 (mesin presisi); FEM membacanya dari Displacement maksimum", 11, AX, maks=70)
    return svg(680, 292, b, "Gambar 3 — Defleksi kantilever dan balok tumpuan sederhana beserta rumusnya")


def gambar4():
    b = _grad("m9g4")
    x0, x1, y0 = 60, 400, 90
    sk = (x1 - x0) / SIG_Y
    b += f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="22" rx="4" fill="url(#m9g4)" opacity=".85"/>'
    for sig, lab, c, anc, yy in [(0, "0", AX, "start", 80), (SIG_C, f"σ_maks {ind(SIG_C, 0)} MPa", "#22d3ee", "middle", 80), (SIG_Y, f"σ_y = {SIG_Y} MPa", "#ef4444", "end", 80)]:
        xx = x0 + sig * sk
        b += f'<line x1="{xx:.1f}" y1="{y0 - 4}" x2="{xx:.1f}" y2="{y0 + 26}" stroke="{c}" stroke-width="1.6"/>'
        b += t(xx, yy, lab, 10, c, anc, "600")
    xi = x0 + SIG_Y / 2 * sk
    b += f'<line x1="{xi:.1f}" y1="{y0 - 4}" x2="{xi:.1f}" y2="{y0 + 26}" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="4 3"/>'
    b += t(xi, 130, f"σ_izin = σ_y/2 = {SIG_Y // 2}", 10, "#f59e0b", "middle", "600")
    b += t(230, 154, f"SF = σ_y / σ_maks = {SIG_Y} / {ind(SIG_C, 0)} = {ind(SF_C, 2)}", 11, TX, "middle", "600")
    for i, (s_, c) in enumerate([("SF ≈ 1,25–1,5: beban & material pasti, uji lengkap", "#00e09e"), ("SF ≈ 2–3: beban statik terdefinisi (umum mesin)", "#f59e0b"), ("SF ≈ 3–4: beban tak pasti, lingkungan berat", "#ef4444")]):
        b += t(60, 182 + i * 16, s_, 10, c, "start")
    b += t(452, 56, "Faktor keamanan:", 11, TX, "start", "600")
    b += t(452, 74, "SF luluh = σ_y / σ_vm,maks", 10, AX, "start")
    b += t(452, 92, "SF tekuk = P_cr / P", 10, AX, "start")
    b += t(452, 110, "SF defleksi = δ_izin / δ", 10, AX, "start")
    b += t(452, 134, "kriteria: semua SF ≥ SF_target", 10.5, "#00e09e", "start")
    b += t(452, 158, f"Contoh: {ind(SF_C, 2)} (rumus) · {ind(SIG_Y / SIG_FEM_C, 2)} (FEM)", 10, AX, "start")
    b += t(452, 176, "hasil FEM sedikit lebih konservatif", 10, AX, "start")
    b += teks2(340, 238, "Faktor keamanan membandingkan kapasitas dengan tuntutan; pada FEM tuntutannya adalah von Mises maksimum yang sudah konvergen", 11, AX, maks=70)
    return svg(680, 262, b, "Gambar 4 — Skala tegangan, tegangan izin, dan faktor keamanan terhadap luluh")


def gambar5():
    b = ""
    for k, (hh, sp) in enumerate(zip(KONV_H[:3], [20, 10, 5])):
        ox, oy, sz = 20 + k * 100, 50, 80
        b += f'<rect x="{ox}" y="{oy}" width="{sz}" height="{sz}" fill="rgba(34,211,238,.08)" stroke="#22d3ee" stroke-width="1.2"/>'
        for g in range(sp, sz, sp):
            b += f'<line x1="{ox + g}" y1="{oy}" x2="{ox + g}" y2="{oy + sz}" stroke="rgba(34,211,238,.35)" stroke-width=".6"/>'
            b += f'<line x1="{ox}" y1="{oy + g}" x2="{ox + sz}" y2="{oy + g}" stroke="rgba(34,211,238,.35)" stroke-width=".6"/>'
        b += f'<circle cx="{ox + sz / 2}" cy="{oy + sz / 2}" r="14" fill="#0a101f" stroke="#f59e0b" stroke-width="1.4"/>'
        b += t(ox + sz / 2, 146, f"h = {hh} mm", 9.5, AX) + t(ox + sz / 2, 158, f"≈ {ind(KONV_N[k], 0)} elemen", 9.5, AX)
    b += t(20, 180, f"Perubahan σ_maks: {ind(KONV_UBAH[1], 1)} % → {ind(KONV_UBAH[2], 1)} % → {ind(KONV_UBAH[3], 1)} %", 10, TX, "start")
    b += t(20, 198, "konvergen bila perubahan terakhir < 2–5 %", 10, "#00e09e", "start")
    # grafik σ vs n
    gx0, gx1, gy0, gy1 = 350, 650, 160, 50
    b += f'<line x1="{gx0}" y1="{gy0}" x2="{gx1}" y2="{gy0}" stroke="{AX}" stroke-width="1"/><line x1="{gx0}" y1="{gy0}" x2="{gx0}" y2="{gy1}" stroke="{AX}" stroke-width="1"/>'
    Y = lambda s: gy0 - (s - 44) / 12 * (gy0 - gy1)
    ya = Y(SIG_MAKS_P)
    b += f'<line x1="{gx0}" y1="{ya:.1f}" x2="{gx1}" y2="{ya:.1f}" stroke="#00e09e" stroke-width="1.2" stroke-dasharray="6 3"/>'
    b += t(gx1 - 2, ya - 4, f"analitis {ind(SIG_MAKS_P, 2)}", 9.5, "#00e09e", "end")
    xs = [370, 450, 530, 610]
    pts = [(x, Y(s)) for x, s in zip(xs, KONV_SIG)]
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#22d3ee" stroke-width="1.6"/>'
    for (x, y), s, n, k in zip(pts, KONV_SIG, KONV_N, range(4)):
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#22d3ee"/>'
        b += t(x, y + (18 if k == 3 else -8), ind(s, 1), 9, TX)
        b += t(x, 176, ind(n, 0), 9.5, AX)
    b += t(500, 192, "jumlah elemen (skala log)", 10, AX) + t(gx0, 40, "σ_maks (MPa)", 10, AX, "start")
    b += teks2(340, 228, "Menghaluskan mesh (h-refinement) memperbanyak elemen ~ (1/h)³; tegangan maksimum mendekati nilai analitis dari bawah", 11, AX, maks=70)
    return svg(680, 254, b, "Gambar 5 — Konvergensi mesh pelat berlubang: tiga tingkat kehalusan dan grafik σ_maks terhadap jumlah elemen")


def gambar6():
    b = ""
    px0, px1, py0, py1 = 110, 330, 70, 170
    cx, cy, rr = (px0 + px1) / 2, (py0 + py1) / 2, 25
    b += f'<rect x="{px0}" y="{py0}" width="{px1 - px0}" height="{py1 - py0}" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="1.8"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="#0a101f" stroke="#a855f7" stroke-width="1.8"/>'
    b += t(cx, cy + 4, "⌀d", 10, "#a855f7", "middle", "600")
    b += f'<line x1="{cx}" y1="{py0}" x2="{cx}" y2="{py1}" stroke="{AX}" stroke-width=".8" stroke-dasharray="4 3"/>'
    # distribusi tegangan Kirsch pada penampang bersih (ligamen atas dan bawah)
    for tanda in (-1, 1):
        pts = [(cx, cy + tanda * rr)]
        for k in range(21):
            rho = rr + (cy - py0 - rr) * k / 20
            s = (1 + (rr / rho) ** 2 / 2 + 3 * (rr / rho) ** 4 / 2) / 3
            pts.append((cx + 34 * s, cy + tanda * rho))
        pts.append((cx, cy + tanda * (cy - py0)))
        b += f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="rgba(239,68,68,.35)" stroke="#ef4444" stroke-width="1.2"/>'
    b += arrow(px0, cy, 60, cy, "#f59e0b", 2) + t(54, cy + 4, "F", 11, "#f59e0b", "end", "700")
    b += arrow(px1, cy, 380, cy, "#f59e0b", 2) + t(386, cy + 4, "F", 11, "#f59e0b", "start", "700")
    b += f'<line x1="96" y1="{py0}" x2="96" y2="{py1}" stroke="{AX}" stroke-width="1"/>' + t(90, 96, "W", 10.5, AX, "end", "600")
    b += t(cx, 58, "σ_maks = Kt·σ_nom di tepi lubang (merah)", 10, "#ef4444", "middle", "600")
    b += t(cx, 190, "σ_nom = F / ((W − d)·t) pada penampang bersih", 10, AX, "middle")
    b += t(452, 56, "Contoh pelat berlubang:", 11, "#a855f7", "start", "600")
    b += t(452, 74, f"W = {W_P}, t = {T_P}, d = {D_P}, F = {F_P} N", 10, AX, "start")
    b += t(452, 92, f"d/W = {ind(R_P, 2)} → Kt = {ind(KT_P, 3)}", 10, AX, "start")
    b += t(452, 110, f"σ_nom = {F_P}/({W_P - D_P} × {T_P}) = {ind(SIG_NOM_P, 2)} MPa", 10, AX, "start")
    b += t(452, 128, f"σ_maks = {ind(SIG_MAKS_P, 2)} MPa", 11, "#00e09e", "start")
    b += t(452, 152, f"von Mises FEM (1 mm) ≈ {ind(SIG_FEM_P, 1)}", 10, AX, "start")
    b += t(452, 170, f"kesalahan relatif ≈ {ind(err(SIG_FEM_P, SIG_MAKS_P), 1)} %", 10, AX, "start")
    b += t(452, 194, "Kt turun saat d/W membesar", 10, AX, "start")
    b += teks2(340, 244, "Lubang memusatkan tegangan pada tepinya: σ_maks = Kt·σ_nom dengan σ_nom dihitung pada penampang bersih (W − d)·t", 11, AX, maks=70)
    return svg(680, 270, b, "Gambar 6 — Pelat berlubang tarik: konsentrasi tegangan di tepi lubang dan tegangan nominal")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-hasil">Membaca Hasil</a>
  <a href="#m-vonmises">von Mises</a>
  <a href="#m-deformasi">Deformasi</a>
  <a href="#m-sf">Faktor Keamanan</a>
  <a href="#m-konvergensi">Konvergensi</a>
  <a href="#m-kt">Konsentrasi Tegangan</a>
  <a href="#m-validasi">Validasi</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="hs9a" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgba(239,68,68,.7)"/><stop offset="50%" stop-color="rgba(34,197,94,.5)"/><stop offset="100%" stop-color="rgba(59,130,246,.5)"/></linearGradient></defs>
      <line x1="14" y1="40" x2="14" y2="90" stroke="rgba(148,163,184,.6)" stroke-width="2"/>
      <rect x="14" y="54" width="72" height="20" fill="url(#hs9a)" stroke="rgba(226,232,240,.5)" stroke-width="1"/>
      <line x1="86" y1="34" x2="86" y2="52" stroke="rgba(239,68,68,.8)" stroke-width="1.6"/>
      <polygon points="86,54 82,46 90,46" fill="rgba(239,68,68,.8)"/>
      <rect x="20" y="120" width="8" height="70" fill="url(#hs9a)" opacity=".8"/>
      <text x="34" y="128" fill="rgba(148,163,184,.6)" font-family="JetBrains Mono" font-size="7">maks</text>
      <text x="34" y="190" fill="rgba(148,163,184,.6)" font-family="JetBrains Mono" font-size="7">min</text>
      <text x="50" y="212" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">σ_vm</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="60" height="90" fill="rgba(0,229,255,.10)" stroke="rgba(0,229,255,.5)" stroke-width="1.3"/>
      <circle cx="50" cy="75" r="12" fill="#0a101f" stroke="rgba(168,85,247,.7)" stroke-width="1.3"/>
      <path d="M 50 63 Q 62 58 70 40" fill="none" stroke="rgba(239,68,68,.7)" stroke-width="1.4"/>
      <path d="M 50 87 Q 62 92 70 110" fill="none" stroke="rgba(239,68,68,.7)" stroke-width="1.4"/>
      <line x1="50" y1="20" x2="50" y2="30" stroke="rgba(255,179,0,.7)" stroke-width="1.4"/>
      <line x1="50" y1="120" x2="50" y2="130" stroke="rgba(255,179,0,.7)" stroke-width="1.4"/>
      <path d="M 20 190 L 80 190 L 80 150 Q 60 150 50 165 Q 40 180 20 180 Z" fill="rgba(124,77,255,.25)" stroke="rgba(124,77,255,.7)" stroke-width="1"/>
      <text x="50" y="208" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">Kt = σmaks/σnom</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="09">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">σ_vm ≤ σ_y</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">SF = σ_y / σ_maks</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">δ = FL³/3EI</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">Kt · σ_nom</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">P_cr = π²EI/L²</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">δ ≤ L/250</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">|e| &lt; 5 %</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">h-refinement</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 10 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dari Kontur</span><br>
      <em>ke Keputusan:</em><br>
      <span class="hl-amber">Kuat, Kaku, Aman?</span>
    </h1>
    <p class="hero-sub">Simulasi baru bermakna setelah hasilnya dibaca dengan benar. Pertemuan ini menafsirkan keluaran FEM Workbench: objek hasil dan kontur, tegangan von Mises sebagai ukuran luluh, deformasi terhadap batas defleksi, faktor keamanan, konvergensi mesh, konsentrasi tegangan pada daerah kritis, dan validasi terhadap rumus analitis balok, pelat berlubang, dan kolom Euler. Tugasnya lima berkas FreeCAD berisi analisis FEM dengan bacaan angka analitis sebagai pembanding hasil simulasi.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Kontur, von Mises, SF, konvergensi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>FEM FreeCAD, diskusi, dan tugas</small></div>
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

    # 01 — Membaca hasil
    isi = figure(1, "Alur membaca hasil FEM: objek hasil, kontur, min/maks, pembanding analitis", "Setelah solve, CalculiX menulis objek hasil di dalam Analysis; panel Show result memilih besaran dan menggambar kontur dengan legenda min/maks. Angka itu baru bermakna setelah dibandingkan dengan rumus, faktor keamanan, dan batas defleksi.", gambar1())
    isi += cards([
        ("📊", "Objek hasil (CCX_Results)", "Muncul di pohon Analysis setelah solve. Menyimpan hasil per node: Displacement (vektor dan panjangnya), von Mises, tegangan utama, geser maksimum, regangan; untuk analisis termal Temperature, untuk tekuk Buckling factor.", "hasil per node"),
        ("🎨", "Show result dan kontur", "Klik dua kali objek hasil → panel Show result: pilih besaran, tampilkan kontur warna pada mesh, atur Displacement factor untuk memperbesar deformasi (visual, bukan skala nyata), dan baca nilai min/maks di legenda.", "kontur + legenda"),
        ("🔍", "Minimum, maksimum, lokasi", "Nilai maksimum tegangan dan lokasinya (node) adalah hal pertama yang dicari: di mana daerah kritis, apakah lokasinya masuk akal (serat terluar jepitan, tepi lubang), atau justru di sudut tajam yang mencurigakan.", "di mana?"),
        ("🧪", "Post pipeline", "FEM PostPipelineFromResult membuka filter VTK: clip (potong), warp (deformasi), plot data sepanjang garis, dan histogram. Cocok untuk memeriksa distribusi tegangan pada penampang, bukan hanya nilai puncak.", "filter VTK"),
    ])
    isi += tabel(["Besaran hasil", "Properti Python (objek hasil)", "Satuan", "Dipakai untuk"],
                 [["Displacement", "<code>DisplacementVectors</code>, <code>DisplacementLengths</code>", "mm", "Defleksi maksimum, kekakuan, batas L/250"],
                  ["von Mises", "<code>vonMises</code>", "MPa", "Kriteria luluh material ulet, faktor keamanan"],
                  ["Tegangan utama", "<code>PrincipalMax</code>, <code>PrincipalMed</code>, <code>PrincipalMin</code>", "MPa", "Material getas, arah retak, tarik/tekan"],
                  ["Geser maksimum", "<code>MaxShear</code>", "MPa", "Kriteria Tresca (τ_maks = σ_y/2)"],
                  ["Regangan", "<code>StrainVectors</code>", "—", "Memeriksa linearitas (ε kecil), pembanding uji regangan"],
                  ["Temperature", "<code>Temperature</code>", "K", "Analisis termal (Modul 8)"],
                  ["Buckling factor", "properti solver (mode tekuk)", "—", "P_cr ≈ faktor × beban yang dipasang"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02–04 adalah tiga pertanyaan utama evaluasi: kuat (von Mises vs σ_y → Tugas 1), kaku (defleksi vs L/250 → Tugas 3), dan aman (faktor keamanan → Tugas 2). Bagian 05 memastikan angka FEM dapat dipercaya (konvergensi mesh), Bagian 06 membahas daerah kritis: lubang (Kt → Tugas 4) dan kolom langsing (tekuk Euler → Tugas 5). Bagian 07 merumuskan validasi analitis vs FEM yang wajib ada di setiap berkas tugas, Bagian 08–09 menutup dengan Python dan praktik pelat berlubang.")
    m += bagian(1, "m-hasil", "Membaca Hasil FEM:<br>Objek Hasil, Pipeline, dan Kontur", "Modul 8 menyiapkan dan menjalankan simulasi; modul ini membaca hasilnya. Bagian ini memetakan objek hasil CalculiX, panel Show result, legenda kontur, dan besaran yang tersedia agar angka maksimum tidak sekadar dilihat, tetapi ditafsirkan.", isi, "MEMBACA HASIL")

    # 02 — von Mises
    isi = figure(2, "Distribusi tegangan lentur kantilever dan kontur von Mises", f"Kantilever {B_C} × {H_C} mm, L = {L_C} mm, F = {F_C} N: tegangan lentur terbesar di serat terluar muka jepitan, σ_maks = 6FL/(bh²) = {ind(SIG_C, 2)} MPa; kontur von Mises FEM menampilkan pola merah di jepitan yang memudar ke ujung bebas.", gambar2())
    isi += formula(1, "Tegangan von Mises dan Tegangan Lentur Maksimum", r"\sigma_{vm} = \sqrt{\tfrac{1}{2}\left[(\sigma_1-\sigma_2)^2+(\sigma_2-\sigma_3)^2+(\sigma_3-\sigma_1)^2\right]}, \qquad \sigma_{maks} = \frac{6\,F\,L}{b\,h^{2}}",
                   r"\(\sigma_1, \sigma_2, \sigma_3\) = tegangan utama &nbsp;·&nbsp; \(F\) = beban ujung &nbsp;·&nbsp; \(L\) = panjang kantilever &nbsp;·&nbsp; \(b, h\) = lebar dan tinggi penampang. Contoh " + f"{F_C} N, {L_C} mm, {B_C} × {H_C}" + r": \(\sigma_{maks} = " + ind(SIG_C, 2) + r"\) MPa.",
                   "Von Mises meringkas keadaan tegangan tiga dimensi menjadi satu angka yang dibandingkan dengan kekuatan luluh σ_y (kriteria energi distorsi untuk material ulet). Pada balok yang dominan lentur, σ_vm ≈ |σ_lentur|, sehingga σ_maks = M·c/I = 6FL/(bh²) di jepitan menjadi pembanding langsung kontur FEM; itulah bacaan Tugas 1.",
                   [(r"\sigma_{vm}", "Tegangan ekuivalen von Mises (MPa)"), (r"\sigma_{1,2,3}", "Tegangan utama (MPa)"), (r"\sigma_{maks}", "Tegangan lentur maksimum (MPa)"), ("F, L", "Beban (N) dan panjang (mm)"), ("b, h", "Lebar dan tinggi penampang (mm)")])
    isi += tabel(["Kriteria luluh / patah", "Rumus pembanding", "Material", "Di FEM FreeCAD"],
                 [["von Mises (energi distorsi)", "σ_vm ≤ σ_y", "Ulet (baja, aluminium)", "Hasil <code>vonMises</code> (bawaan kontur)"],
                  ["Tresca (geser maksimum)", "τ_maks = (σ₁ − σ₃)/2 ≤ σ_y/2", "Ulet, lebih konservatif ~15 %", "Hasil <code>MaxShear</code>"],
                  ["Tegangan normal maksimum", "σ₁ ≤ σ_ut (tarik), |σ₃| ≤ σ_uc (tekan)", "Getas (besi cor, keramik)", "<code>PrincipalMax</code> / <code>PrincipalMin</code>"],
                  ["Lentur murni balok", "σ = M·c/I, σ_vm = |σ|", "Semua (pembanding analitis)", "Bandingkan pada serat terluar, jauh dari sudut"]])
    isi += anim_panel(1, "cyan", "Kontur von Mises kantilever berbeban ujung", "cvKonturVM",
                      [("sl_vm_F", "v_vm_F", "Beban F (N)", 100, 1000, 10, 500, "500"),
                       ("sl_vm_L", "v_vm_L", "Panjang L (mm)", 100, 400, 5, 200, "200"),
                       ("sl_vm_h", "v_vm_h", "Tinggi h (mm)", 10, 40, 1, 20, "20")],
                      "btnKonturVM", "toggleKonturVM", "infoKonturVM",
                      "<strong>Cara membaca:</strong> beban berdenyut dari nol ke F (PAUSE menahan F penuh); kontur merah tumbuh dari serat terluar jepitan dan memudar ke sumbu netral dan ujung bebas. Legenda kanan memberi σ_maks = 6FL/(bh²) dan δ = FL³/(3EI); menaikkan h menurunkan tegangan kuadratis dan defleksi kubik.")
    isi += kotak("warning-box", "⚠️ <strong>Puncak di sudut jepitan:</strong> Constraint Fixed pada seluruh muka menahan pula kontraksi lateral (efek Poisson), sehingga tepat di rusuk jepitan FEM menunjukkan von Mises lebih tinggi dari 6FL/(bh²) dan terus naik bila mesh dihaluskan: itu singularitas tumpuan ideal, bukan tegangan fisik. Bandingkan rumus dengan von Mises pada jarak ≈ h dari jepitan atau pada serat terluar di tengah muka.")
    m += bagian(2, "m-vonmises", "Tegangan von Mises<br>dan Kriteria Luluh", "Kontur merah pada model bukan otomatis berarti bahaya; artinya bergantung pada kriteria kegagalan yang dipakai. Bagian ini membahas von Mises sebagai tegangan ekuivalen material ulet, alternatifnya (Tresca, tegangan utama), dan rumus lentur balok yang menjadi pembanding kontur.", isi, "VON MISES")

    # 03 — Deformasi
    isi = figure(3, "Defleksi kantilever dan balok tumpuan sederhana beserta rumusnya", f"Kantilever {F_C} N (L {L_C}, {B_C} × {H_C}) melendut {ind(DELTA_C, 4)} mm di ujung; balok tumpuan sederhana {F_S} N (L {L_S}, {B_S} × {H_S}) melendut {ind(DELTA_S, 4)} mm di tengah, di bawah batas L/250 = {ind(BATAS_S, 3)} mm.", gambar3())
    isi += formula(2, "Defleksi Balok Euler–Bernoulli", r"\delta_{kantilever} = \frac{F L^{3}}{3 E I}, \qquad \delta_{tumpuan\ sederhana} = \frac{F L^{3}}{48 E I}, \qquad I = \frac{b h^{3}}{12}",
                   r"\(E\) = modulus elastisitas (baja 210000 MPa) &nbsp;·&nbsp; \(I\) = momen inersia penampang terhadap sumbu lentur. Contoh kantilever: \(\delta = " + ind(DELTA_C, 4) + r"\) mm; tumpuan sederhana: \(\delta = " + ind(DELTA_S, 4) + r"\) mm.",
                   "Defleksi berbanding lurus dengan F dan L³, berbanding terbalik dengan E dan I: menggandakan tinggi h mengurangi lendutan delapan kali. Displacement maksimum FEM harus mendekati rumus ini untuk balok langsing (L/h > 10); pada balok gemuk FEM memberi lendutan sedikit lebih besar karena deformasi geser ikut dihitung. Bacaan Tugas 3 adalah δ tumpuan sederhana yang lalu dibandingkan dengan batas L/250.",
                   [(r"\delta", "Defleksi maksimum (mm)"), ("F", "Beban terpusat (N)"), ("L", "Panjang / bentang (mm)"), ("E", "Modulus elastisitas (MPa)"), ("I", "Momen inersia penampang (mm⁴)")])
    isi += tabel(["Batas defleksi", "Nilai untuk L = 500 mm", "Penerapan"],
                 [["L/250", f"{ind(500 / 250, 2)} mm", "Rangka mesin dan struktur umum (tampilan, kenyamanan)"],
                  ["L/360", f"{ind(500 / 360, 2)} mm", "Balok penopang lantai, kerangka peralatan"],
                  ["L/500", f"{ind(500 / 500, 2)} mm", "Mesin presisi, rel pemandu, meja mesin perkakas"],
                  ["L/1000", f"{ind(500 / 1000, 2)} mm", "Struktur optik/pengukuran, spindel"],
                  ["δ_izin absolut", "mis. 0,05 mm", "Celah bantalan, clearance rakitan (Modul 11–12)"]])
    isi += cards([
        ("📏", "Displacement, bukan warp", "Displacement factor pada Show result hanya memperbesar gambar deformasi agar terlihat; angka defleksi tetap dibaca dari legenda Displacement (mm), bukan dari seberapa bengkok model di layar.", "faktor visual"),
        ("🧲", "Kekakuan", f"k = F/δ (N/mm) merangkum kekakuan struktur; kantilever contoh: k = {ind(K_C, 1)} N/mm. Kekakuan lentur EI adalah pengali yang sama pada rumus tegangan? Tidak: tegangan bergantung I (dan c), defleksi bergantung EI, sehingga material kaku tidak mengubah tegangan lentur.", "k = F/δ"),
        ("📐", "Syarat balok langsing", "Rumus Euler–Bernoulli mengabaikan deformasi geser; akurat bila L/h > 10. Untuk balok pendek, FEM 3D memberi δ lebih besar 2–5 % (geser), dan itu bukan kesalahan model.", "L/h > 10"),
        ("⚖️", "Kaku dulu, baru kuat", "Banyak rangka mesin dibatasi kekakuan, bukan kekuatan: pada contoh kantilever σ_maks hanya 75 MPa (SF 3,3) tetapi δ sudah 0,48 mm; pada mesin presisi δ itulah yang gagal lebih dahulu.", "δ vs σ"),
    ])
    isi += kotak("info-box", "<strong>🧭 Tumpuan sederhana di FEM:</strong> sendi–rol dibuat dengan Constraint Displacement pada rusuk bawah kedua ujung (x = y = z = 0 di satu ujung; z = 0 saja di ujung lain agar balok bebas memanjang). Beban tengah diberikan pada rusuk yang sengaja dibuat dengan membagi garis atas sketsa di x = L/2, sehingga Pad menghasilkan dua muka atas yang berbatasan di tengah bentang. Tanpa rusuk itu beban harus disebar pada muka kecil, dan δ FEM tetap mendekati rumus.")
    m += bagian(3, "m-deformasi", "Deformasi, Kekakuan,<br>dan Batas Defleksi", "Struktur yang kuat belum tentu cukup kaku. Bagian ini membaca Displacement maksimum, membandingkannya dengan rumus defleksi balok, dan menilai terhadap batas defleksi (L/250 dan sejenisnya) yang lazim pada rangka mesin.", isi, "DEFORMASI")

    # 04 — Faktor keamanan
    isi = figure(4, "Skala tegangan, tegangan izin, dan faktor keamanan terhadap luluh", f"Kantilever contoh: σ_maks = {ind(SIG_C, 0)} MPa terhadap σ_y = {SIG_Y} MPa memberi SF = {ind(SF_C, 2)}; dengan SF target 2, tegangan izin σ_y/2 = {SIG_Y // 2} MPa masih jauh di atas tegangan kerja.", gambar4())
    isi += formula(3, "Faktor Keamanan terhadap Luluh", r"SF = \frac{\sigma_y}{\sigma_{maks}} = \frac{\sigma_y\, b\, h^{2}}{6\,F\,L}, \qquad \sigma_{izin} = \frac{\sigma_y}{SF_{target}}",
                   r"\(\sigma_y\) = kekuatan luluh (S235: 250 MPa) &nbsp;·&nbsp; \(\sigma_{maks}\) = tegangan von Mises maksimum yang sudah konvergen. Contoh: \(SF = " + f"{SIG_Y}/{ind(SIG_C, 0)} = " + ind(SF_C, 3) + r"\).",
                   "Faktor keamanan adalah rasio kapasitas terhadap tuntutan. Untuk material ulet kapasitasnya σ_y dan tuntutannya von Mises maksimum; hasilnya harus ≥ SF target yang dipilih menurut ketidakpastian beban, material, dan model. Bacaan Tugas 2 adalah SF dari σ_maks analitis; SF versi FEM (σ_y/σ_vm,maks) ditulis di dokumen sebagai pembanding.",
                   [("SF", "Faktor keamanan (tanpa satuan)"), (r"\sigma_y", "Kekuatan luluh (MPa)"), (r"\sigma_{maks}", "Tegangan maksimum (MPa)"), (r"\sigma_{izin}", "Tegangan izin (MPa)"), ("SF_{target}", "Faktor keamanan yang disyaratkan")])
    isi += tabel(["Keadaan desain", "SF target", "Alasan"],
                 [["Beban, material, dan model diketahui pasti; uji prototipe lengkap", "1,25–1,5", "Ketidakpastian kecil; struktur pesawat, komponen teroptimasi"],
                  ["Beban statik terdefinisi, material bersertifikat, FEM tervalidasi", "2–2,5", "Praktik umum mesin industri"],
                  ["Beban tak pasti atau kejut, lingkungan korosif, hasil FEM belum divalidasi", "3–4", "Menutupi ketidaktahuan model dan beban"],
                  ["Beban berulang (lelah)", "Dinilai dari batas lelah σ_e, bukan σ_y", "Tegangan bolak-balik jauh di bawah σ_y masih bisa meretakkan"],
                  ["Kolom langsing tekan", "SF_tekuk = P_cr/P ≥ 2–3", "Tekuk terjadi mendadak pada tegangan rendah (Bagian 06)"]])
    isi += cards([
        ("🛡️", "SF luluh", "σ_y dibagi von Mises maksimum. Nilai dari FEM sedikit lebih rendah daripada dari rumus karena kontur menangkap efek 3D dan tumpuan; keduanya harus dilaporkan.", "σ_y / σ_vm"),
        ("🏛️", "SF tekuk", "P_cr dibagi beban tekan yang bekerja; berlaku untuk kolom, batang tekan rangka, dan pelat tipis. Tegangan rendah bukan jaminan aman terhadap tekuk.", "P_cr / P"),
        ("📐", "SF kekakuan", "δ_izin dibagi δ aktual. Bukan faktor keamanan dalam arti kegagalan material, tetapi kriteria layak-pakai yang sering lebih menentukan pada mesin presisi.", "δ_izin / δ"),
        ("🧮", "Kt dan lelah", "Pada beban berulang, konsentrasi tegangan (Kt) dan kekasaran permukaan menurunkan batas lelah; SF luluh statik yang besar tidak otomatis aman terhadap lelah (Modul 10 membahas perbaikan daerah kritis).", "σ_e"),
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca SF secara jujur:</strong> ambil σ_vm,maks dari mesh yang sudah konvergen dan bukan dari sudut singular; sebutkan σ_y material yang benar-benar dipakai (S235: 235–250 MPa, bukan σ_ut 360–510 MPa); dan laporkan SF terkecil dari semua mode kegagalan (luluh, tekuk, defleksi), bukan rata-ratanya.")
    m += bagian(4, "m-sf", "Faktor Keamanan:<br>Seberapa Jauh dari Luluh", "Angka tegangan berubah menjadi keputusan lewat faktor keamanan. Bagian ini mendefinisikan SF terhadap luluh, tegangan izin, nilai target menurut ketidakpastian, dan jenis SF lain (tekuk, kekakuan) yang harus diperiksa bersama.", isi, "FAKTOR KEAMANAN")

    # 05 — Konvergensi mesh
    isi = figure(5, "Konvergensi mesh pelat berlubang: tiga tingkat kehalusan dan grafik σ_maks terhadap jumlah elemen", f"Ukuran elemen {KONV_H[0]} → {KONV_H[-1]} mm menaikkan jumlah elemen dari ≈ {ind(KONV_N[0], 0)} ke ≈ {ind(KONV_N[-1], 0)}; σ_maks naik dari {ind(KONV_SIG[0], 1)} ke {ind(KONV_SIG[-1], 1)} MPa mendekati nilai analitis {ind(SIG_MAKS_P, 2)} MPa, dengan perubahan terakhir {ind(KONV_UBAH[-1], 1)} %.", gambar5())
    isi += tabel(["Ukuran elemen h (mm)", "Jumlah elemen (≈)", "σ_maks FEM (MPa)", "Perubahan terhadap tingkat sebelumnya", "Kesalahan terhadap analitis"],
                 [[f"{h}", ind(n, 0), ind(s, 2), "—" if u is None else f"{ind(u, 1)} %", f"{ind(err(s, SIG_MAKS_P), 1)} %"] for h, n, s, u in zip(KONV_H, KONV_N, KONV_SIG, KONV_UBAH)])
    isi += cards([
        ("🔬", "h-refinement", "Memperkecil ukuran elemen (CharacteristicLengthMax pada Gmsh). Jumlah elemen tetra naik ~ (1/h)³, waktu solve naik lebih cepat lagi; lakukan bertahap: h, h/2, h/4.", "h → h/2"),
        ("📈", "p-refinement", "Menaikkan orde elemen (tetra 10 node orde 2, bawaan Gmsh di FreeCAD) memperbaiki akurasi lentur jauh lebih efektif daripada memperbanyak elemen orde 1; jangan memakai tetra orde 1 untuk lentur.", "orde 2"),
        ("🎯", "Mesh region", "FEM MeshRegion menghaluskan hanya di sekitar lubang, fillet, atau jepitan (mis. 1 mm di tepi lubang, 4 mm di tempat lain), sehingga akurasi naik tanpa mesh halus di seluruh model.", "lokal"),
        ("✅", "Kriteria berhenti", "Konvergen bila perubahan besaran yang diamati (σ_maks, δ) antar dua tingkat < 2–5 %, dan besaran itu bukan pada titik singular. Defleksi konvergen lebih cepat daripada tegangan.", "< 2–5 %"),
    ])
    isi += anim_panel(2, "amber", "Konvergensi mesh: σ_maks terhadap jumlah elemen", "cvKonvergensi",
                      [("sl_kv_tingkat", "v_kv_tingkat", "Jumlah tingkat penghalusan", 2, 7, 1, 5, "5"),
                       ("sl_kv_orde", "v_kv_orde", "Laju konvergensi p", 0.5, 2, 0.1, 1.2, "1,2")],
                      "btnKonvergensi", "toggleKonvergensi", "infoKonvergensi",
                      "<strong>Cara membaca:</strong> titik-titik muncul satu per satu tiap kali mesh dihaluskan (h dibagi dua, jumlah elemen × 8); kurva mendekati garis analitis putus-putus dari bawah. Laju p menggambarkan seberapa cepat kesalahan turun (elemen orde 2 ≈ p besar); tabel kanan menunjukkan perubahan antar tingkat dan pita ± 5 %.")
    isi += kotak("warning-box", "⚠️ <strong>Hasil yang tidak pernah konvergen:</strong> bila σ_maks terus naik tiap kali mesh dihaluskan tanpa mendatar, periksa apakah lokasinya di sudut dalam tajam, beban titik, atau rusuk tumpuan: itu singularitas (Bagian 06). Menghaluskan mesh di situ hanya membuat angka makin besar; perbaiki modelnya (fillet, beban tersebar, tumpuan pada muka) atau evaluasi tegangan pada jarak tertentu dari titik singular.")
    m += bagian(5, "m-konvergensi", "Konvergensi Mesh:<br>Hasil yang Tidak Bergantung Ukuran Elemen", "Satu hasil FEM belum bisa dipercaya sebelum terbukti tidak berubah ketika mesh dihaluskan. Bagian ini membahas studi konvergensi h dan p, mesh region, kriteria berhenti, dan cara membedakan konvergensi lambat dari singularitas.", isi, "KONVERGENSI MESH")

    # 06 — Konsentrasi tegangan & daerah kritis
    isi = figure(6, "Pelat berlubang tarik: konsentrasi tegangan di tepi lubang dan tegangan nominal", f"Pelat W = {W_P}, t = {T_P}, lubang ⌀{D_P}, F = {F_P} N: d/W = {ind(R_P, 2)} memberi Kt = {ind(KT_P, 3)}; σ_nom pada penampang bersih {ind(SIG_NOM_P, 2)} MPa, sehingga σ_maks = {ind(SIG_MAKS_P, 2)} MPa di tepi lubang.", gambar6())
    isi += formula(4, "Faktor Konsentrasi Tegangan Pelat Berlubang (Peterson)", r"K_t = 3{,}00 - 3{,}13\,r + 3{,}66\,r^{2} - 1{,}53\,r^{3}, \quad r = \frac{d}{W}, \qquad \sigma_{maks} = K_t\,\sigma_{nom} = K_t\,\frac{F}{(W-d)\,t}",
                   r"\(d\) = diameter lubang &nbsp;·&nbsp; \(W\) = lebar pelat &nbsp;·&nbsp; \(t\) = tebal &nbsp;·&nbsp; \(\sigma_{nom}\) = tegangan nominal pada penampang bersih. Contoh " + f"d/W = {ind(R_P, 2)}" + r": \(K_t = " + ind(KT_P, 3) + r"\), \(\sigma_{maks} = " + ind(SIG_MAKS_P, 2) + r"\) MPa.",
                   "Lubang memaksa garis gaya mengalir memutar sehingga tegangan menumpuk di tepi lubang. Kt = 3 untuk pelat sangat lebar (solusi Kirsch) dan turun saat d/W membesar karena tegangan nominal sendiri sudah naik; polinom Peterson merangkum kurva eksperimental dan elastisitas untuk pelat lebar hingga. Bacaan Tugas 4 adalah σ_maks = Kt·σ_nom, pembanding von Mises FEM di tepi lubang dengan mesh halus.",
                   [("K_t", "Faktor konsentrasi tegangan (tanpa satuan)"), ("r = d/W", "Rasio diameter lubang terhadap lebar"), (r"\sigma_{nom}", "Tegangan nominal penampang bersih (MPa)"), ("F", "Gaya tarik (N)"), ("W, d, t", "Lebar, diameter lubang, tebal (mm)")])
    isi += tabel(["d/W", "Kt (Peterson)", "σ_nom / (F/(W·t))", "Catatan"],
                 [[ind(r, 2), ind(kt_peterson(r), 3), ind(1 / (1 - r), 3), ket] for r, ket in [(0.1, "Mendekati solusi Kirsch Kt = 3"), (0.2, "Lubang baut umum"), (0.25, "Contoh Gambar 6"), (0.3, "—"), (0.4, "Penampang bersih tinggal 60 %"), (0.5, "Kt kecil, tetapi σ_nom sudah dua kali lipat")]])
    isi += anim_panel(3, "green", "Kt pelat berlubang terhadap d/W", "cvKtLubang",
                      [("sl_kt_d", "v_kt_d", "Diameter lubang d (mm)", 4, 40, 1, 15, "15"),
                       ("sl_kt_W", "v_kt_W", "Lebar pelat W (mm)", 40, 100, 1, 60, "60"),
                       ("sl_kt_F", "v_kt_F", "Gaya tarik F (N)", 1000, 10000, 100, 5000, "5000")],
                      "btnKtLubang", "toggleKtLubang", "infoKtLubang",
                      "<strong>Cara membaca:</strong> lubang membesar-mengecil (PAUSE menahan d dari slider) sementara titik pada kurva Kt(d/W) ikut bergeser; distribusi merah pada penampang bersih memuncak di tepi lubang. Kt turun saat d/W naik, tetapi σ_nom naik lebih cepat sehingga σ_maks tetap membesar; tebal t = 5 mm.")
    isi += formula(5, "Beban Kritis Tekuk Euler (Kolom Sendi–Sendi)", r"P_{cr} = \frac{\pi^{2} E I}{(K L)^{2}}, \qquad I_{lemah} = \frac{b\,h^{3}}{12}, \qquad SF_{tekuk} = \frac{P_{cr}}{P}",
                   r"\(K\) = faktor panjang efektif (sendi–sendi 1; jepit–jepit 0,5; jepit–bebas 2) &nbsp;·&nbsp; \(I_{lemah}\) = momen inersia terkecil penampang. Contoh kolom " + f"L = {L_K}, {B_K} × {H_K}" + r": \(P_{cr} = " + ind(P_CR, 1) + r"\) N, tegangan hanya \(" + ind(SIG_K, 1) + r"\) MPa.",
                   "Kolom langsing yang ditekan tidak gagal karena luluh, melainkan menekuk ke samping pada sumbu inersia terkecil ketika beban mencapai P_cr; tegangannya saat itu P_cr/A bisa jauh di bawah σ_y, sehingga kontur von Mises statik terlihat aman. FEM memerlukan analisis Buckling (CalculiX) yang memberi buckling factor: P_cr ≈ faktor × beban yang dipasang. Bacaan Tugas 5 adalah P_cr Euler sebagai pembanding faktor itu.",
                   [("P_{cr}", "Beban kritis tekuk (N)"), ("E", "Modulus elastisitas (MPa)"), ("I_{lemah}", "Momen inersia sumbu lemah (mm⁴)"), ("K L", "Panjang efektif kolom (mm)"), ("SF_{tekuk}", "Faktor keamanan tekuk")])
    isi += anim_panel(4, "violet", "Tekuk kolom sendi–sendi terhadap beban P", "cvTekuk",
                      [("sl_tk_L", "v_tk_L", "Panjang kolom L (mm)", 200, 800, 10, 500, "500"),
                       ("sl_tk_h", "v_tk_h", "Tebal h (mm)", 4, 20, 0.5, 10, "10"),
                       ("sl_tk_P", "v_tk_P", "Beban tekan P (N)", 1000, 30000, 250, 10000, "10000")],
                      "btnTekuk", "toggleTekuk", "infoTekuk",
                      "<strong>Cara membaca:</strong> beban naik perlahan dari nol ke P (PAUSE menahan P dari slider); kolom tetap lurus selama P < P_cr dan melengkung sinusoidal begitu P melampaui P_cr = π²EI/L² (lebar b = 20 mm). Perhatikan tegangan P/A yang masih kecil saat tekuk terjadi; memperpendek L atau menebalkan h menaikkan P_cr kuadratis dan kubik.")
    isi += kotak("tip-box", "💡 <strong>Daftar daerah kritis yang selalu diperiksa:</strong> tepi lubang dan alur (Kt 2–3), bahu poros dan sudut dalam tanpa fillet (Kt bisa > 3, singular bila radius nol), muka jepitan dan titik beban (efek tumpuan), batang tekan langsing dan pelat tipis (tekuk), serta sambungan las/baut (tegangan sekunder). Modul 10 membahas cara memperbaikinya: fillet, rusuk, penebalan lokal, dan pemilihan material.")
    m += bagian(6, "m-kt", "Konsentrasi Tegangan<br>dan Daerah Kritis", "Kegagalan bermula di tempat tegangan menumpuk atau di batang yang menekuk. Bagian ini menghitung faktor konsentrasi tegangan pelat berlubang dengan polinom Peterson, membedakannya dari singularitas, dan menutup dengan tekuk Euler sebagai mode kritis yang tidak terlihat pada kontur von Mises.", isi, "KONSENTRASI TEGANGAN")

    # 07 — Validasi analitis vs FEM
    isi = formula(6, "Kesalahan Relatif FEM terhadap Solusi Analitis", r"e = \frac{\left|x_{FEM} - x_{analitis}\right|}{x_{analitis}} \times 100\,\%",
                   r"\(x\) = besaran yang dibandingkan (σ_maks, δ, P_cr). Contoh kantilever: \(e_\sigma = " + ind(err(SIG_FEM_C, SIG_C), 1) + r"\,\%\), \(e_\delta = " + ind(err(DELTA_FEM_C, DELTA_C), 1) + r"\,\%\).",
                   "Validasi membandingkan FEM dengan kasus yang jawabannya diketahui. Kesalahan beberapa persen wajar dan sumbernya dapat dijelaskan (mesh, deformasi geser, kondisi batas ideal); kesalahan puluhan persen berarti model salah: satuan, material, tumpuan, atau rumus yang tidak sesuai kasus. Setiap berkas tugas modul ini memuat tabel kecil analitis vs FEM dengan e.",
                   [("e", "Kesalahan relatif (%)"), ("x_{FEM}", "Hasil simulasi"), ("x_{analitis}", "Hasil rumus / referensi")])
    isi += tabel(["Kasus (contoh modul)", "Analitis", "FEM (ilustrasi)", "e", "Sumber selisih yang wajar"],
                 [[f"σ_maks kantilever {B_C} × {H_C}, L {L_C}, {F_C} N", f"{ind(SIG_C, 2)} MPa", f"{ind(SIG_FEM_C, 1)} MPa", f"{ind(err(SIG_FEM_C, SIG_C), 1)} %", "Efek Poisson di jepitan, mesh 2 mm"],
                  [f"δ kantilever (sama)", f"{ind(DELTA_C, 4)} mm", f"{ind(DELTA_FEM_C, 3)} mm", f"{ind(err(DELTA_FEM_C, DELTA_C), 1)} %", "Deformasi geser (L/h = 10)"],
                  [f"δ tumpuan sederhana {B_S} × {H_S}, L {L_S}, {F_S} N", f"{ind(DELTA_S, 4)} mm", f"{ind(DELTA_FEM_S, 3)} mm", f"{ind(err(DELTA_FEM_S, DELTA_S), 1)} %", "Beban rusuk vs beban titik ideal"],
                  [f"σ_maks pelat berlubang d/W = {ind(R_P, 2)}", f"{ind(SIG_MAKS_P, 2)} MPa", f"{ind(SIG_FEM_P, 1)} MPa", f"{ind(err(SIG_FEM_P, SIG_MAKS_P), 1)} %", "Polinom Peterson ± 2 %, mesh 1 mm di tepi lubang"],
                  [f"P_cr kolom {B_K} × {H_K}, L {L_K}", f"{ind(P_CR, 1)} N", f"{ind(P_CR_FEM, 0)} N", f"{ind(err(P_CR_FEM, P_CR), 1)} %", "Sendi FEM pada rusuk (sedikit lebih kaku)"]])
    isi += cards([
        ("🧾", "Satuan dan material", "FreeCAD memakai mm–N–MPa; E = 210000 MPa (bukan 210 GPa atau 2,1e11 Pa) dan ρ = 7850 kg/m³ pada kartu material. Kesalahan satuan memberi e ribuan persen dan mudah dikenali.", "mm · N · MPa"),
        ("🪢", "Kondisi batas", "Fixed pada seluruh muka lebih kaku daripada jepitan teoretis; sendi dibuat dengan Displacement pada rusuk. Selisih akibat tumpuan ideal biasanya 1–5 % dan terpusat di dekat tumpuan.", "tumpuan ideal"),
        ("📚", "Batas teori", "Rumus balok mengabaikan geser dan efek 3D; Kt Peterson berlaku untuk pelat lebar hingga dengan lubang di tengah; Euler berlaku untuk tekuk elastis (σ_cr < σ_y). Di luar itu FEM yang lebih benar, bukan rumus.", "domain rumus"),
        ("🚩", "Kapan curiga", "e > 10 % pada besaran global (δ, reaksi tumpuan) berarti model salah; e besar hanya pada σ lokal sering berarti singularitas atau mesh belum konvergen di daerah itu.", "e > 10 %"),
    ])
    isi += kotak("info-box", "<strong>🧭 Urutan validasi di setiap berkas tugas:</strong> (1) hitung nilai analitis dengan rumus modul; (2) jalankan FEM dengan mesh awal, catat hasil; (3) haluskan mesh sekali lagi, pastikan perubahan < 5 %; (4) hitung e; (5) tulis keduanya (Spreadsheet atau Draft Text di dokumen) beserta kesimpulan kuat/kaku/aman. Angka yang diisikan pada kartu tugas selalu nilai analitis; berkas .FCStd membuktikan FEM-nya dijalankan.")
    m += bagian(7, "m-validasi", "Validasi Analitis vs FEM:<br>Kesalahan Relatif", "Simulasi yang tidak dibandingkan dengan apa pun hanyalah gambar berwarna. Bagian ini merumuskan kesalahan relatif, menyusun tabel validasi lima kasus modul, dan menjelaskan sumber selisih yang wajar dan yang mencurigakan.", isi, "VALIDASI")

    # 08 — Python console
    isi = kode("Python console — membaca objek hasil CalculiX: maksimum, minimum, dan lokasinya", '''import FreeCAD as App
doc = App.ActiveDocument
res = doc.getObject("CCX_Results")                       # objek hasil di dalam Analysis
vm, u = res.vonMises, res.DisplacementLengths           # daftar per node (MPa, mm)
i = vm.index(max(vm)); n = res.NodeNumbers[i]
p = res.Mesh.FemMesh.Nodes[n]
print(f"von Mises maks = {max(vm):.3f} MPa di node {n} ({p.x:.1f}, {p.y:.1f}, {p.z:.1f})")
print(f"von Mises min  = {min(vm):.3f} MPa; principal maks = {max(res.PrincipalMax):.3f} MPa")
print(f"Displacement maks = {max(u):.4f} mm; jumlah node = {len(vm)}, elemen = {res.Mesh.FemMesh.VolumeCount}")
# von Mises pada jarak >= h dari jepitan (menghindari singularitas rusuk Fixed)
h = 20
jauh = [s for s, k in zip(vm, res.NodeNumbers) if res.Mesh.FemMesh.Nodes[k].x >= h]
print(f"von Mises maks di x >= {h}: {max(jauh):.3f} MPa")''', "Python (FreeCAD)")
    isi += kode("Python console — pembanding analitis: σ_maks, δ, SF, dan kesalahan relatif", f'''import math
E, sig_y = {E_ST}, {SIG_Y}                                  # MPa, baja S235
F, L, b, h = {F_C}, {L_C}, {B_C}, {H_C}                              # kantilever contoh
I = b*h**3/12
sig = 6*F*L/(b*h**2); delta = F*L**3/(3*E*I); SF = sig_y/sig
print(f"sigma_maks = {{sig:.3f}} MPa, delta = {{delta:.4f}} mm, SF = {{SF:.3f}}")   # {ind(SIG_C, 3)} · {ind(DELTA_C, 4)} · {ind(SF_C, 3)}
vm_fem, u_fem = {SIG_FEM_C}, {DELTA_FEM_C}                                # dari cell 1 (contoh mesh 2 mm)
e = lambda fem, ana: abs(fem-ana)/ana*100
print(f"e_sigma = {{e(vm_fem, sig):.1f}} %, e_delta = {{e(u_fem, delta):.1f}} %, SF_FEM = {{sig_y/vm_fem:.3f}}")
# tumpuan sederhana beban tengah + batas L/250
F2, L2, b2, h2 = {F_S}, {L_S}, {B_S}, {H_S}
d2 = F2*L2**3/(48*E*b2*h2**3/12)
print(f"delta tengah = {{d2:.4f}} mm; batas L/250 = {{L2/250:.3f}} mm -> {{'OK' if d2 <= L2/250 else 'melampaui'}}")   # {ind(DELTA_S, 4)}
# pelat berlubang (Peterson) dan kolom Euler
W, t, d, Fp = {W_P}, {T_P}, {D_P}, {F_P}
r = d/W; Kt = 3.00 - 3.13*r + 3.66*r**2 - 1.53*r**3
print(f"Kt = {{Kt:.4f}}, sigma_nom = {{Fp/((W-d)*t):.3f}}, sigma_maks = {{Kt*Fp/((W-d)*t):.3f}} MPa")   # {ind(SIG_MAKS_P, 3)}
Lk, bk, hk = {L_K}, {B_K}, {H_K}
Pcr = math.pi**2*E*(bk*hk**3/12)/Lk**2
print(f"P_cr = {{Pcr:.1f}} N, sigma_cr = {{Pcr/(bk*hk):.2f}} MPa < sigma_y")   # {ind(P_CR, 1)}''', "Python (FreeCAD)")
    isi += kode("Python console — studi konvergensi otomatis: mesh Gmsh dihaluskan, solve ulang, catat σ_maks", '''import FreeCAD as App
from femmesh.gmshtools import GmshTools
from femtools import ccxtools
doc = App.ActiveDocument
mesh = doc.getObject("FEMMeshGmsh")                      # objek mesh di dalam Analysis
hasil = []
for ukuran in [8, 4, 2]:                                 # mm; tambah 1 bila komputer kuat
    mesh.CharacteristicLengthMax = ukuran
    GmshTools(mesh).create_mesh()
    fea = ccxtools.FemToolsCcx()
    fea.update_objects(); fea.setup_working_dir(); fea.setup_ccx(); fea.purge_results()
    fea.run(); fea.load_results()
    res = doc.getObject("CCX_Results")
    hasil.append((ukuran, mesh.FemMesh.VolumeCount, max(res.vonMises), max(res.DisplacementLengths)))
    print(f"h = {ukuran} mm: {hasil[-1][1]} elemen, vm maks = {hasil[-1][2]:.3f} MPa, u maks = {hasil[-1][3]:.4f} mm")
for (h0, n0, s0, u0), (h1, n1, s1, u1) in zip(hasil, hasil[1:]):
    print(f"{h0} -> {h1} mm: perubahan sigma {abs(s1-s0)/s0*100:.1f} %, perubahan u {abs(u1-u0)/u0*100:.1f} %")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> cell 1 dijalankan setelah solve pada model apa pun; cell 2 memberi angka pembanding contoh (σ " + ind(SIG_C, 2) + " MPa, δ " + ind(DELTA_C, 4) + " mm, SF " + ind(SF_C, 3) + ", δ tumpuan sederhana " + ind(DELTA_S, 4) + " mm, σ_maks pelat " + ind(SIG_MAKS_P, 2) + " MPa, P_cr " + ind(P_CR, 1) + " N) yang harus cocok dengan komentar; cell 3 memerlukan objek mesh Gmsh dan CalculiX yang sudah terpasang (Modul 8). Nama objek (CCX_Results, FEMMeshGmsh) periksa di pohon dokumen bila berbeda.")
    m += bagian(8, "m-python", "Python Console:<br>Post-Processing Hasil", "Cell pertama membaca objek hasil: maksimum, minimum, lokasi node, dan tegangan di luar zona singular; cell kedua menghitung seluruh pembanding analitis modul beserta kesalahan relatif; cell ketiga mengotomatiskan studi konvergensi mesh.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Model pelat", f"Part Design → Body → Sketch XY persegi panjang {W_P} × 180 (sudut di origin, fully constrained) → Pad {T_P}. Sketch di muka atas: lingkaran ⌀{D_P} berpusat (90, {W_P // 2}) → Pocket Through all."),
               ("2", "Analysis dan material", f"FEM Workbench → Analysis container → Material solid: Steel (E = {E_ST} MPa, ν = {NU_ST}). Periksa kartu material menampilkan satuan MPa, bukan Pa."),
               ("3", "Tumpuan dan beban", f"Constraint Fixed pada muka ujung x = 0; Constraint Force {F_P} N arah +X pada muka ujung x = 180 (tarik). Arah gaya: pilih muka, Direction = normal muka, balik bila perlu."),
               ("4", "Mesh awal", "FEM mesh from shape by Gmsh: Element order 2, Max size 4 mm → Apply. Catat jumlah elemen. Solver CalculiX Standard → Write input → Run."),
               ("5", "Membaca hasil", f"Klik dua kali CCX_Results → von Mises: catat maksimum dan lokasinya (tepi lubang, sisi atas/bawah). Bandingkan dengan Kt·σ_nom = {ind(SIG_MAKS_P, 2)} MPa; hitung e. Baca juga Displacement maks."),
               ("6", "Konvergensi", "Tambahkan FEM MeshRegion 1 mm pada muka silinder lubang (atau Max size 2 mm global), mesh ulang, solve ulang. Perubahan σ_maks harus < 5 %; bila belum, haluskan sekali lagi. Isi tabel analitis vs FEM."),
               ("7", "Kesimpulan dan simpan", f"SF = {SIG_Y}/σ_vm,maks; tuliskan σ_maks analitis, FEM, e, SF pada Spreadsheet di dokumen. Ctrl+S → <code>Latihan9_NIM.FCStd</code> (hasil ikut tersimpan bila objek hasil tidak dihapus).")]
    isi = '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["σ_maks FEM jauh di bawah rumus (e −30 %)", "Elemen orde 1, mesh kasar di tepi lubang", "Element order 2; MeshRegion 1 mm di lubang"],
                  ["σ_maks FEM terus naik tiap penghalusan", "Singularitas: rusuk Fixed, sudut tajam, beban titik", "Evaluasi pada jarak ≥ h dari tumpuan; beri fillet; beban pada muka"],
                  ["Displacement ribuan mm atau nol", "Satuan E salah (Pa/GPa) atau material belum terhubung ke Body", "E = 210000 MPa; kartu material merujuk solid yang benar"],
                  ["Solver gagal: “no constraints / underconstrained”", "Model masih bisa bergerak kaku (rigid body motion)", "Fixed pada satu muka, atau Displacement cukup pada tiga arah"],
                  ["Hasil buckling factor negatif atau kosong", "Beban tarik (bukan tekan), atau jenis analisis masih static", "Force arah −Z tekan; Analysis type Buckling, jumlah mode ≥ 1"],
                  ["Kontur tampak seragam tanpa gradasi", "Legenda memakai rentang min/maks yang didominasi satu titik singular", "Batasi rentang legenda (User defined) atau buang node singular dari evaluasi"],
                  ["δ FEM 3–5 % lebih besar dari rumus balok", "Deformasi geser pada balok pendek (L/h < 10)", "Bukan kesalahan; catat sebagai sumber selisih"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) Analysis lengkap: material, mesh, tumpuan, beban, solver, objek hasil; (2) angka yang diisikan adalah nilai ANALITIS dengan desimal sesuai label; (3) tabel analitis vs FEM dengan e ada di dokumen (Spreadsheet/Draft Text); (4) mesh sudah dihaluskan sekali dan perubahan < 5 %; (5) σ_maks dibaca jauh dari sudut singular; (6) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Pelat Berlubang", "Tujuh langkah berikut memodelkan pelat berlubang tarik, menjalankan FEM, membaca von Mises maksimum di tepi lubang, membuktikan konvergensi mesh, dan memvalidasinya terhadap Kt·σ_nom; ditutup tabel gejala dan daftar periksa berkas tugas.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: FEM Workbench (FEM Results, PostPipelineFromResult, ConstraintFixed/Force/Displacement, MeshRegion, SolverCalculiX buckling), FEM Tutorial", " (wiki.freecad.org), 2024–2026.", "Acuan nama objek, panel Show result, properti objek hasil (vonMises, DisplacementLengths, PrincipalMax), dan API femtools/gmshtools pada cell Python.")
    refs += pm_ref(2, "amber", "249,115,22", "R. G. Budynas &amp; J. K. Nisbett", "Shigley's Mechanical Engineering Design", ", 11th ed. McGraw-Hill, 2020.", "Kriteria luluh von Mises/Tresca, faktor keamanan, konsentrasi tegangan, dan tekuk kolom Euler (bab kegagalan statik dan kolom).")
    refs += pm_ref(3, "violet", "168,85,247", "W. D. Pilkey, D. F. Pilkey &amp; Z. Bi", "Peterson's Stress Concentration Factors", ", 4th ed. Wiley, 2020.", "Kurva dan polinom Kt pelat lebar hingga berlubang yang dipakai pada Persamaan (4) dan Tugas 4.")
    refs += pm_ref(4, "green", "0,224,158", "R. D. Cook, D. S. Malkus, M. E. Plesha &amp; R. J. Witt", "Concepts and Applications of Finite Element Analysis", ", 4th ed. Wiley, 2002.", "Konvergensi h/p, singularitas tegangan, kesalahan diskretisasi, dan verifikasi/validasi hasil FEM.")
    refs += pm_ref(5, "pink", "236,72,153", "J. M. Gere &amp; B. J. Goodno", "Mechanics of Materials", ", 9th ed. Cengage, 2018.", "Rumus tegangan lentur, defleksi balok kantilever dan tumpuan sederhana, serta beban kritis Euler yang menjadi pembanding analitis.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari pembacaan hasil FEM, kriteria luluh, faktor keamanan, konvergensi, konsentrasi tegangan, dan tekuk. Dokumentasi FEM Workbench adalah pendamping wajib karena nama objek dan panel hasil mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki FEM Results / FEM ResultShow (panel Show result), FEM PostPipelineFromResult dan filter VTK, FEM MeshRegion, FEM SolverCalculiX (analysis type static/frequency/buckling), FEM ConstraintDisplacement, serta dokumentasi CalculiX (*BUCKLE). Video tutorial daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk menilai hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 9 — Evaluasi Hasil Simulasi dan Analisis Kekuatan · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">σ_maks = 6FL/bh²</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">SF = σ_y/σ_maks</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">δ = FL³/48EI</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Kt · σ_nom</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">P_cr = π²EI/L²</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 10 · Evaluasi Hasil Simulasi</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 9</span><br><em>Membaca dan Menguji</em><br>Hasil FEM</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang objek hasil, von Mises, defleksi, faktor keamanan, konvergensi, singularitas, Kt, dan tekuk, ditambah 5 tugas: kantilever (σ_maks teoretis vs von Mises FEM), kantilever S235 (faktor keamanan), balok tumpuan sederhana (defleksi vs L/250), pelat berlubang (Kt·σ_nom vs FEM), dan kolom sendi–sendi (P_cr Euler vs CalculiX Buckling). Setiap tugas mengunggah berkas .FCStd berisi model dan Analysis FEM, lalu mengisi angka ANALITIS yang deterministik; hasil FEM di berkas adalah pembandingnya. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Hasil analisis CalculiX di FreeCAD dibaca dengan cara...",
     ["Membuka berkas .inp dengan editor teks dan mencari nilai terbesar", "Melihat warna Body di tampilan 3D setelah solve", "Klik dua kali objek hasil (CCX_Results) → panel Show result: pilih besaran, kontur warna pada mesh, nilai min/maks di legenda", "Membaca properti Volume pada objek mesh"],
     "Membaca objek hasil"),
    ("Tegangan <strong>von Mises</strong> adalah...",
     ["Tegangan ekuivalen skalar dari tiga tegangan utama (kriteria energi distorsi) yang dibandingkan dengan σ_y untuk material ulet", "Tegangan normal terbesar pada arah X", "Rata-rata tegangan seluruh node model", "Tegangan geser pada bidang tumpuan"],
     "Arti von Mises"),
    ("Batas defleksi <strong>L/250</strong> berarti...",
     ["Defleksi harus kurang dari 250 mm", "Beban maksimum 250 N per meter bentang", "Rasio tegangan terhadap modulus sebesar 1/250", "Lendutan maksimum yang diizinkan = panjang bentang dibagi 250 (L = 500 mm → 2 mm)"],
     "Batas defleksi L/250"),
    ("Faktor keamanan terhadap luluh didefinisikan sebagai...",
     ["SF = σ_maks/σ_y; makin besar makin aman", "SF = σ_y/σ_maks; SF < 1 berarti luluh, nilai 1,5–3 lazim untuk beban statik terdefinisi", "SF = E/σ_maks", "SF = jumlah elemen dibagi jumlah node"],
     "Definisi SF"),
    ("Konvergensi mesh dianggap tercapai bila...",
     ["Jumlah elemen sudah melebihi 100.000", "Perubahan besaran yang diamati (σ_maks, δ) antara dua penghalusan berturut-turut sudah di bawah toleransi (mis. < 2–5 %)", "Waktu solve lebih dari 10 menit", "Kontur warna terlihat halus di layar"],
     "Kriteria konvergensi"),
    ("Tegangan maksimum FEM yang <strong>terus naik tanpa batas</strong> ketika mesh dihaluskan pada sudut dalam tajam menandakan...",
     ["Material sudah luluh di sudut itu", "Solver CalculiX perlu diperbarui", "Beban terlalu besar dan harus dikurangi", "Singularitas tegangan akibat idealisasi geometri/tumpuan, bukan tegangan fisik; beri fillet atau evaluasi tegangan pada jarak tertentu dan bandingkan dengan Kt"],
     "Singularitas tegangan"),
    ("Faktor konsentrasi tegangan <strong>Kt</strong> pelat berlubang tarik...",
     ["= σ_maks/σ_nom dengan σ_nom pada penampang bersih (W − d)·t; ≈ 3 untuk lubang kecil dan turun saat d/W membesar (Peterson)", "Selalu sama dengan 1 untuk lubang bulat", "Naik tanpa batas saat d/W membesar", "Bergantung pada modulus elastisitas material"],
     "Kt pelat berlubang"),
    ("Kesalahan relatif hasil FEM terhadap solusi analitis dihitung dengan...",
     ["e = FEM − analitis (dalam MPa)", "e = analitis/FEM", "e = |FEM − analitis|/analitis × 100 %", "e = (FEM + analitis)/2"],
     "Kesalahan relatif"),
    ("Displacement maksimum FEM kantilever berbeban ujung dibandingkan dengan...",
     ["δ = F·L/(E·A)", "δ = F·L³/(48·E·I)", "δ = 6·F·L/(b·h²)", "δ = F·L³/(3·E·I) dengan I = b·h³/12"],
     "Pembanding defleksi kantilever"),
    ("Beban kritis tekuk Euler kolom sendi–sendi...",
     ["Tidak perlu diperiksa bila von Mises masih jauh di bawah σ_y", "P_cr = π²·E·I/L² dengan I sumbu lemah; kolom langsing gagal tekuk pada tegangan jauh di bawah σ_y sehingga perlu analisis Buckling", "P_cr = σ_y·A untuk semua kolom", "Hanya bergantung pada kekuatan luluh material"],
     "Tekuk Euler"),
]

TUGAS_LABELS = ["Kantilever FEM — σ_maks teoretis (MPa)", "Kantilever S235 — faktor keamanan SF", "Tumpuan sederhana — defleksi δ (mm)",
                "Pelat berlubang — Kt·σ_nom (MPa)", "Kolom sendi–sendi — P_cr Euler (N)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 1, 3: 1}

FQ_JUDUL = [
    "Apakah tegangan maksimum 168 MPa pada laporan vendor bermakna, atau hanya singularitas sudut tajam?",
    "Bukti apa yang harus diminta agar hasil FEM rangka dapat dipercaya: konvergensi mesh dan validasi analitis?",
    "Bagaimana menyimpulkan kuat, kaku, dan aman: SF luluh, batas defleksi, dan tekuk kolom penopang?",
]
FQ_RINGKAS = [
    "Tinjau lokasi σ_vm maksimum vendor (sudut dalam tanpa fillet, mesh 20 mm): bedakan singularitas dari konsentrasi tegangan nyata, usulkan cara evaluasi (fillet, jarak, Kt), dan tetapkan tegangan yang layak dipakai untuk SF.",
    "Susun permintaan audit: tabel konvergensi ≥ 3 mesh dengan perubahan < 5 %, kesalahan relatif terhadap rumus balok pada bagian yang sederhana, satuan/material/tumpuan; jelaskan mana yang membuat laporan ditolak.",
    "Hitung SF luluh dari tegangan yang sudah dikoreksi, periksa δ balok atas terhadap L/500 mesin presisi, dan SF tekuk kolom penopang 20 × 8 × 900 mm dengan Euler; putuskan diterima/ditolak beserta perbaikan.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Laporan vendor melaporkan σ_vm maksimum 168 MPa (S235, σ_y 250) sehingga SF 1,49, dan nilai itu terletak tepat di sudut dalam pertemuan balok atas dan kolom yang dimodelkan tanpa radius, dengan mesh seragam 20 mm. Nilai pada jarak 20 mm dari sudut hanya 96 MPa. Berdasarkan Bagian 02, 05, dan 06: apakah 168 MPa itu tegangan fisik? Bagaimana Anda membedakan singularitas dari konsentrasi tegangan yang nyata, dan tegangan mana yang layak dipakai untuk menghitung SF?",
            ["σ_vm maks 168 MPa di sudut tajam", "mesh seragam 20 mm", "96 MPa pada jarak 20 mm"],
            "Tegangan maksimum 168 MPa yang muncul tepat di sudut dalam tajam laporan vendor sebaiknya...",
            ["Dipakai langsung sebagai σ_maks desain karena itu nilai terbesar", "Diabaikan sepenuhnya karena hasil di sudut selalu salah", "Diuji konvergensinya; bila terus naik saat mesh dihaluskan, itu singularitas: modelkan fillet sesuai gambar atau evaluasi tegangan pada jarak tertentu dan bandingkan dengan Kt", "Diganti dengan tegangan rata-rata seluruh model"],
            "✅ Tepat! Sudut dalam beradius nol adalah singularitas: angkanya tidak konvergen dan tidak fisik. Auditor meminta model dengan fillet aktual (Kt hingga) atau evaluasi pada jarak tertentu, lalu memakai tegangan yang konvergen untuk SF.",
            "❌ Nilai singular tidak boleh dipakai apa adanya, tetapi juga tidak boleh diabaikan tanpa memodelkan fillet/Kt; rata-rata model tidak mewakili daerah kritis. Lihat Bagian 05–06.",
            "Petunjuk: (1) Jelaskan uji konvergensi pada sudut itu. (2) Usulkan fillet/Kt atau jarak evaluasi. (3) Tetapkan tegangan untuk SF dan alasannya.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Laporan hanya memuat satu gambar kontur dan satu angka, tanpa jumlah elemen, orde elemen, satuan material, atau perbandingan dengan rumus. Balok atas rangka (profil kotak 100 × 100 × 5, bentang 1.200 mm) menerima beban tengah 50 kN dan dapat dihitung dengan rumus balok tumpuan sederhana. Susun daftar bukti yang harus diminta dari vendor (Bagian 05 dan 07): tabel konvergensi, kesalahan relatif terhadap analitis, satuan, tumpuan, dan orde elemen; dan tentukan mana yang bila gagal membuat laporan ditolak.",
            ["balok kotak 100 × 100 × 5, L 1.200", "beban tengah 50 kN", "tanpa tabel konvergensi"],
            "Bukti konvergensi dan validasi yang memadai dalam laporan FEM adalah...",
            ["Satu mesh yang “terlihat halus” pada gambar kontur", "Tabel/grafik σ_maks dan δ untuk ≥ 3 ukuran mesh dengan perubahan terakhir < 2–5 %, ditambah kesalahan relatif terhadap rumus analitis pada bagian yang sederhana", "Jumlah elemen di atas 100.000 tanpa pembanding", "Waktu solve yang lama sebagai tanda ketelitian"],
            "✅ Tepat! Konvergensi dibuktikan dengan beberapa tingkat mesh dan kriteria perubahan, validasi dengan kesalahan relatif terhadap kasus yang jawabannya diketahui (rumus balok pada bagian sederhana). Tanpa keduanya, satu kontur hanyalah gambar.",
            "❌ Kehalusan visual, jumlah elemen, atau lama solve bukan bukti; yang dibutuhkan adalah perubahan antar tingkat mesh dan kesalahan relatif terhadap analitis. Lihat Bagian 05 dan 07.",
            "Petunjuk: (1) Daftarkan bukti yang diminta. (2) Hitung δ dan σ analitis balok atas sebagai pembanding. (3) Tetapkan kriteria tolak/terima.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Setelah dikoreksi, σ_vm maksimum yang konvergen 118 MPa; defleksi balok atas 2,9 mm pada bentang 1.200 mm (mesin presisi, batas L/500); kolom penopang samping 20 × 8 mm panjang 900 mm (sendi–sendi, E 210000) memikul 12 kN tekan dengan σ_vm hanya 40 MPa. Dengan Bagian 03, 04, dan 06: hitung SF luluh, periksa defleksi terhadap L/500, hitung P_cr Euler sumbu lemah dan SF tekuk, lalu putuskan apakah rangka diterima dan perbaikan apa yang diminta.",
            ["σ_vm konvergen 118 MPa", "δ 2,9 mm vs L/500", "kolom 20 × 8 × 900, P 12 kN"],
            "Kolom penopang 20 × 8 × 900 mm menerima 12 kN tekan; P_cr Euler ≈ 2,2 kN, σ_vm hanya 40 MPa. Kesimpulan audit yang benar...",
            ["Aman, karena σ_vm jauh di bawah σ_y = 250 MPa", "Tidak aman: SF tekuk = P_cr/P ≪ 1 walau tegangan kecil; perbesar tebal/inersia sumbu lemah, perpendek panjang efektif, atau tambah pengikat lateral", "Aman bila material diganti baja berkekuatan luluh lebih tinggi", "Cukup tambahkan fillet pada ujung kolom"],
            "✅ Tepat! Tekuk elastis tidak bergantung σ_y: P_cr = π²EI/L² pada sumbu lemah (I = 20·8³/12) jauh di bawah beban, sehingga kolom gagal walau von Mises kecil. Perbaikan menaikkan I atau memperpendek L efektif.",
            "❌ Von Mises kecil dan σ_y tinggi tidak mencegah tekuk; fillet tidak mengubah I. Lihat Persamaan (5) dan Animasi 4.",
            "Petunjuk: (1) SF luluh = 250/118. (2) Bandingkan 2,9 mm dengan 1.200/500. (3) Hitung P_cr dan SF tekuk, lalu putuskan.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">audit FEM</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">σ_vm 168 → ?</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">konvergen &lt; 5 %</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">P_cr / P</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 10 · Evaluasi Hasil Simulasi</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Mengaudit<br><em>Laporan FEM Vendor</em></h1>
    <p class="hero-sub">Konsultan rekayasa Nusa Audit Struktur diminta menilai laporan FEM rangka mesin pengepres dari vendor sebelum rangka diproduksi. Terapkan Pertemuan 10: membaca hasil, membedakan singularitas dari tegangan nyata, menuntut bukti konvergensi dan validasi, lalu memutuskan kuat, kaku, dan aman dengan SF luluh, batas defleksi, dan tekuk.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Nusa Audit Struktur —<br>Rangka Mesin Pengepres 50 kN</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS AUDIT HASIL SIMULASI</div>
    <p>
      <strong style="color:var(--amber)">Nusa Audit Struktur</strong>, konsultan rekayasa independen, menerima <strong style="color:var(--cyan)">laporan FEM rangka mesin pengepres 50 kN</strong> dari vendor rangka. Rangka portal baja S235 (σ_y 250 MPa) terdiri atas <strong>balok atas</strong> profil kotak 100 × 100 × 5 mm bentang 1.200 mm, dua <strong>kolom utama</strong>, dan <strong>kolom penopang samping</strong> 20 × 8 × 900 mm yang memikul 12 kN tekan. Vendor melaporkan σ_vm maksimum 168 MPa (SF 1,49) dan menyatakan rangka “aman”.
    </p>
    <p style="margin-top:12px">
      Pemeriksaan awal menemukan: tegangan maksimum terletak <strong style="color:var(--cyan)">tepat di sudut dalam tanpa fillet</strong> dengan mesh seragam 20 mm dan tanpa studi konvergensi; tidak ada perbandingan dengan rumus balok; <strong>defleksi balok atas 2,9 mm</strong> tidak dibandingkan dengan batas L/500 mesin presisi; dan kolom penopang langsing hanya dinilai dari von Mises 40 MPa tanpa analisis tekuk.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">audit hasil simulasi</strong>: menilai kebermaknaan tegangan maksimum, menuntut bukti konvergensi dan validasi, lalu memutuskan diterima/ditolak beserta perbaikan yang harus dilakukan vendor.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Balok atas kotak 100 × 100 × 5, L 1.200, 50 kN", "14,165,233", "cyan")}
{kartu("σ_vm maks 168 MPa di sudut tajam, mesh 20 mm", "14,165,233", "cyan")}
{kartu("δ balok atas 2,9 mm · batas L/500", "14,165,233", "cyan")}
{kartu("Kolom penopang 20 × 8 × 900, P 12 kN · S235", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Angka merah di kontur, satu mesh tanpa pembanding, dan batang tekan yang “aman” karena tegangannya kecil adalah tiga kesalahan baca hasil yang paling sering. Forum ini mengajak Anda mengauditnya satu per satu.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Rangka portal 50 kN: titik singular di sudut dalam, defleksi balok atas terhadap L/500, dan kolom penopang langsing yang menekuk</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Konsultan Nusa Audit Struktur menilai laporan FEM rangka mesin pengepres 50 kN dari vendor: rangka portal S235 (&sigma;_y 250 MPa) dengan balok atas kotak 100 &times; 100 &times; 5 mm bentang 1.200 mm, dua kolom utama, dan kolom penopang samping 20 &times; 8 &times; 900 mm yang memikul 12 kN tekan. Vendor melaporkan &sigma;_vm maksimum 168 MPa (SF 1,49) dan menyatakan aman. Temuan awal: tegangan maksimum tepat di sudut dalam tanpa fillet dengan mesh seragam 20 mm tanpa studi konvergensi, tidak ada perbandingan dengan rumus balok, defleksi balok atas 2,9 mm tidak dibandingkan dengan batas L/500, dan kolom langsing hanya dinilai dari von Mises 40 MPa tanpa analisis tekuk. Susun audit hasil simulasi: kebermaknaan tegangan maksimum (singularitas vs Kt), bukti konvergensi dan validasi analitis, lalu keputusan kuat/kaku/aman dengan SF luluh, batas defleksi, dan P_cr Euler."
FORUM_CHIPS_LMS = ["balok atas 100 × 100 × 5, L 1.200, 50 kN", "σ_vm 168 MPa di sudut tajam, mesh 20 mm", "δ 2,9 mm vs L/500", "kolom 20 × 8 × 900, P 12 kN"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Rangka portal mesin pengepres: titik singular, defleksi balok atas, tekuk kolom penopang (Pertemuan 10)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const x0 = W * 0.18, x1 = W * 0.62, yT = H * 0.30, yB = H * 0.86, tb = 12;
  // lantai
  ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 40, yB); ctx.lineTo(x1 + 40, yB); ctx.stroke();
  // kolom utama dan balok atas (profil kotak)
  ctx.fillStyle = 'rgba(34,211,238,.14)'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.4;
  [[x0 - tb, yT, tb, yB - yT], [x1, yT, tb, yB - yT]].forEach(r => { ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.strokeRect(r[0], r[1], r[2], r[3]); });
  // balok atas melendut (garis putus = semula, tebal = terdeformasi)
  ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.strokeRect(x0, yT - tb, x1 - x0, tb); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(34,211,238,.14)'; ctx.strokeStyle = '#22d3ee'; ctx.beginPath();
  const bend = 14; for (let i = 0; i <= 40; i++) { const u = i / 40, x = x0 + (x1 - x0) * u, y = yT - tb + bend * Math.sin(Math.PI * u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  for (let i = 40; i >= 0; i--) { const u = i / 40, x = x0 + (x1 - x0) * u, y = yT + bend * Math.sin(Math.PI * u); ctx.lineTo(x, y); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // beban 50 kN di tengah
  const xm = (x0 + x1) / 2; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(xm, yT - tb - 40); ctx.lineTo(xm, yT - tb - 6); ctx.stroke();
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(xm, yT - tb); ctx.lineTo(xm - 5, yT - tb - 9); ctx.lineTo(xm + 5, yT - tb - 9); ctx.closePath(); ctx.fill();
  ctx.font = "bold 10px 'JetBrains Mono',monospace"; ctx.textAlign = 'left'; ctx.fillText('F = 50 kN', xm + 8, yT - tb - 26);
  // sudut dalam tajam: titik singular (glow merah)
  [[x0, yT], [x1, yT]].forEach(([sx, sy]) => { const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 18); g.addColorStop(0, 'rgba(239,68,68,.95)'); g.addColorStop(1, 'rgba(239,68,68,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 18, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#ef4444'; ctx.font = "10px 'JetBrains Mono',monospace"; ctx.textAlign = 'right'; ctx.fillText('σ_vm 168 MPa di sudut tajam → singular?', x0 - 6, yT + 24);
  // defleksi balok atas
  ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xm + 40, yT); ctx.lineTo(xm + 40, yT + bend); ctx.stroke();
  ctx.fillStyle = '#00e09e'; ctx.textAlign = 'left'; ctx.fillText('δ = 2,9 mm ≤ L/500 = 2,4 mm?', xm + 46, yT + bend + 4);
  // kolom penopang langsing yang menekuk
  const xk = W * 0.80, amp = 12; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const u = i / 40, y = yB - (yB - yT) * u, x = xk + amp * Math.sin(Math.PI * u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(168,85,247,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xk, yB); ctx.lineTo(xk, yT); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xk, yT - 34); ctx.lineTo(xk, yT - 6); ctx.stroke();
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(xk, yT); ctx.lineTo(xk - 5, yT - 9); ctx.lineTo(xk + 5, yT - 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a855f7'; ctx.textAlign = 'left'; ctx.fillText('P 12 kN', xk + 8, yT - 20); ctx.fillText('kolom 20 × 8 × 900', xk + 14, (yT + yB) / 2); ctx.fillText('P_cr = π²EI/L² ≈ 2,2 kN → tekuk', xk + 14, (yT + yB) / 2 + 14);
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = "10px 'JetBrains Mono',monospace"; ctx.textAlign = 'left';
  ctx.fillText('■ audit: singularitas vs Kt · konvergensi & validasi · SF luluh, L/500, SF tekuk', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
