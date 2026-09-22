# Konten Modul 11 Teknik Tenaga Listrik — Konsep dan Teori Dasar Sistem Distribusi
# Tenaga Listrik (Sub-CPMK 5.2, Pertemuan 12). Angka contoh dihitung di sini agar teks,
# tabel, dan gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 11
PERTEMUAN = 12
SUB_CPMK = "5.2"
JUDUL = "Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik"
JUDUL_PANJANG = "Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik"
JUDUL_EKSPOR = "Dasar Sistem Distribusi"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
# gardu contoh: 250 kVA, beban terhubung 250 kW, faktor kebutuhan 0,55
TERHUBUNG, DF = 250.0, 0.55
P_MAKS = TERHUBUNG * DF                                  # 137,5 kW
P_IND = [80.0, 60.0, 45.0]                               # kebutuhan maksimum tiga kelompok
FD = 1.4
P_SEREMPAK = sum(P_IND) / FD                             # 132,1 kW
E_BULAN, P_MAKS_LF, JAM_BULAN = 36000.0, 100.0, 720.0
LF = E_BULAN / (P_MAKS_LF * JAM_BULAN)                   # 0,5
FB_TH = 0.55
LOSSF = 0.3 * FB_TH + 0.7 * FB_TH ** 2                   # 0,37675
S_TRAFO, P_TRAFO, PF_TRAFO = 250.0, 180.0, 0.9
S_BEBAN = P_TRAFO / PF_TRAFO                             # 200 kVA
PEMBEBANAN = S_BEBAN / S_TRAFO * 100                     # 80 %
# JTR contoh: kabel Al 4×50, r 0,641, x 0,08; 150 m; 100 A pf 0,9
R50, X_JTR, L_JTR, I_JTR, PF_JTR = 0.641, 0.08, 0.15, 100.0, 0.9
SIN_JTR = math.sqrt(1 - PF_JTR ** 2)
DV_JTR = SQ3 * I_JTR * L_JTR * (R50 * PF_JTR + X_JTR * SIN_JTR)   # V antar-saluran
DV_JTR_PCT = DV_JTR / 380 * 100
# sambungan rumah: 2×10 mm² r 1,83 Ω/km, 40 m, 25 A
R10, L_SR, I_SR = 1.83, 0.04, 25.0
DV_SR = 2 * I_SR * R10 * L_SR
DV_SR_PCT = DV_SR / 220 * 100
# penyulang 20 kV beban merata: 10 km, r 0,4, 120 A
L_PY, R_PY, I_PY = 10.0, 0.4, 120.0
RUGI_PY = I_PY ** 2 * R_PY * L_PY / 1000                  # kW (beban merata = 1/3 × 3I²R)
RUGI_PY_TERPUSAT = 3 * RUGI_PY
F_RUGI_PY = 0.3
E_RUGI_PY = RUGI_PY * 8760 * F_RUGI_PY
# keandalan
PEL, PEL_JAM, PEL_KALI = 8000, 30000.0, 14000.0
SAIDI = PEL_JAM / PEL
SAIFI = PEL_KALI / PEL
CAIDI = SAIDI / SAIFI
ASAI = 1 - SAIDI / 8760
P_MW_ENS, FB_ENS = 2.5, 0.55
ENS = P_MW_ENS * FB_ENS * SAIDI
# pemilihan trafo: 80 rumah × 1,3 kW, fd 2,0, pf 0,9
N_RUMAH, D_RUMAH, FD_RUMAH, PF_RUMAH = 80, 1.3, 2.0, 0.9
S_GARDU = N_RUMAH * D_RUMAH / FD_RUMAH / PF_RUMAH         # 57,8 kVA → 100 kVA
# JTR tiga beban bertahap (kabel 50 mm²): 50/40/30 A pada 80/160/240 m
I_ABC = [50.0, 40.0, 30.0]
L_ABC = [0.08, 0.08, 0.08]
DV_ABC = SQ3 * R50 * ((I_ABC[0] + I_ABC[1] + I_ABC[2]) * L_ABC[0] + (I_ABC[1] + I_ABC[2]) * L_ABC[1] + I_ABC[2] * L_ABC[2])
# penampang minimum: 100 A, 200 m, pf 0,85, 5 %, tembaga
I_MIN, L_MIN, PF_MIN, DV_MIN_PCT, RHO_CU = 100.0, 200.0, 0.85, 5.0, 0.0175
A_MIN = RHO_CU * L_MIN * SQ3 * I_MIN * PF_MIN / (DV_MIN_PCT / 100 * 380)
# beban merata 20 kV: 7 km, 160 A, pf 0,9
L_M, I_M, PF_M, X_PY = 7.0, 160.0, 0.9, 0.35
SIN_M = math.sqrt(1 - PF_M ** 2)
DV_M = 0.5 * I_M * L_M * (R_PY * PF_M + X_PY * SIN_M)
VF20 = 20000 / SQ3
DV_M_PCT = DV_M / VF20 * 100


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def kotak_svg(x, y, w, h, c, label, sub=""):
    b = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>' + t(x + w / 2, y + h / 2 + (0 if not sub else -4), label, 11, c, "middle", "700")
    if sub:
        b += t(x + w / 2, y + h / 2 + 11, sub, 9.5, AX)
    return b


def gambar1():
    b = t(330, 20, "Rantai pasokan dari pembangkit sampai stopkontak", 12, TX, "middle", "700")
    tahap = [("Pembangkit", "11–24 kV", "#ef4444"), ("Transmisi", "150/500 kV", "#f59e0b"), ("GI 150/20 kV", "trafo 60 MVA", "#a855f7"), ("JTM 20 kV", "penyulang", "#22d3ee"), ("Gardu\ndistribusi", "20 kV/400 V", "#00e09e"), ("JTR 380/220 V", "jurusan", "#22d3ee"), ("Pelanggan", "SR 1/3 fasa", "#00e09e")]
    for i, (nama, sub, c) in enumerate(tahap):
        x = 12 + i * 92
        judul = nama.split("\n")
        b += f'<rect x="{x}" y="36" width="84" height="54" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>'
        for k, baris in enumerate(judul):
            b += t(x + 42, 36 + (20 if len(judul) == 1 else 16) + 13 * k, baris, 11, c, "middle", "700")
        b += t(x + 42, 36 + (38 if len(judul) == 1 else 46), sub, 9.5, AX)
        if i < len(tahap) - 1:
            b += arrow(x + 84, 63, x + 92, 63, AX, 1.4)
    b += f'<rect x="12" y="100" width="636" height="2" fill="{GRID}"/>'
    b += t(150, 120, "SISTEM TRANSMISI (Modul 7–9)", 10.5, "#f59e0b", "middle", "700") + t(480, 120, "SISTEM DISTRIBUSI (Modul 10–12)", 10.5, "#00e09e", "middle", "700")
    b += t(330, 142, "Distribusi primer (JTM 20 kV): GI → penyulang → gardu distribusi;", 10.5, AX)
    b += t(330, 156, "distribusi sekunder (JTR 380/220 V): gardu → jurusan → sambungan rumah", 10.5, AX)
    b += t(330, 174, "Rugi teknis nasional ± 9 %: hampir dua pertiganya terjadi di distribusi (JTR dan trafo distribusi),", 10.5, AX)
    b += t(330, 188, "karena arus besar pada tegangan rendah", 10.5, AX)
    return svg(660, 198, b, "Gambar 1 — Kedudukan sistem distribusi dalam rantai pasokan tenaga listrik")


def gambar2():
    b = ""
    x0, x1, y0, y1 = 60, 630, 190, 26
    X = lambda h: x0 + h / 24 * (x1 - x0)
    Y = lambda v: y0 - v * (y0 - y1)
    prof = [0.35, 0.3, 0.28, 0.28, 0.32, 0.45, 0.7, 0.65, 0.5, 0.45, 0.45, 0.5, 0.55, 0.5, 0.48, 0.5, 0.6, 0.85, 1.0, 0.98, 0.9, 0.75, 0.55, 0.42]
    prof2 = [0.15, 0.12, 0.1, 0.1, 0.1, 0.15, 0.3, 0.55, 0.8, 0.95, 1.0, 1.0, 0.95, 0.98, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.55, 0.35, 0.25, 0.2]
    for h in range(0, 25, 4):
        b += f'<line x1="{X(h):.1f}" y1="{y1}" x2="{X(h):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(h), y0 + 16, f"{h}:00", 10.5, AX)
    for v in [0, 0.5, 1.0]:
        b += t(x0 - 8, Y(v) + 4, f"{v * 100:.0f} %", 10.5, AX, "end")
    p1 = " ".join(f"{X(h + 0.5):.1f},{Y(v):.1f}" for h, v in enumerate(prof))
    p2 = " ".join(f"{X(h + 0.5):.1f},{Y(v):.1f}" for h, v in enumerate(prof2))
    lf1, lf2 = sum(prof) / 24, sum(prof2) / 24
    b += f'<polyline points="{p1}" fill="none" stroke="#22d3ee" stroke-width="2.4"/>' + t(X(19), Y(1.0) - 8, f"rumah tangga: F_B = {ind(lf1, 2)}", 10.5, "#22d3ee", "middle", "600")
    b += f'<polyline points="{p2}" fill="none" stroke="#f59e0b" stroke-width="2.4"/>' + t(X(11), Y(1.0) - 8, f"komersial: F_B = {ind(lf2, 2)}", 10.5, "#f59e0b", "middle", "600")
    b += f'<line x1="{x0}" y1="{Y(lf1):.1f}" x2="{x1}" y2="{Y(lf1):.1f}" stroke="#22d3ee" stroke-width="1" stroke-dasharray="5 4"/>'
    b += f'<line x1="{x0}" y1="{Y(lf2):.1f}" x2="{x1}" y2="{Y(lf2):.1f}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="5 4"/>'
    b += t(x0, y1 - 8, "P/P_maks", 10.5, AX, "start") + t(345, 226, "Kurva beban harian ternormalisasi: puncak rumah tangga 18–20, puncak komersial 10–15;", 10.5, AX)
    b += t(345, 240, "garis putus = rata-rata = faktor beban. Puncak yang tidak bersamaan → keragaman", 10.5, AX)
    return svg(660, 250, b, "Gambar 2 — Kurva beban harian dua jenis pelanggan dan faktor bebannya")


def gambar3():
    b = ""

    def sumber(x, y, c, label):
        return f'<circle cx="{x}" cy="{y}" r="9" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x, y - 14, label, 9.5, c, "middle", "700")

    def beban(x, y, c):
        return kawat(x, y, x, y + 12, c, 1.2) + f'<rect x="{x - 4}" y="{y + 12}" width="8" height="8" fill="{c}"/>'
    # radial
    b += t(110, 18, "RADIAL", 11, "#ef4444", "middle", "700") + sumber(20, 60, "#00e09e", "GI") + kawat(29, 60, 200, 60, "#ef4444", 2.2)
    for i in range(4):
        b += beban(60 + i * 40, 60, "#ef4444")
    b += kawat(120, 60, 120, 110, "#ef4444", 1.6) + kawat(120, 110, 200, 110, "#ef4444", 1.6)
    for i in range(2):
        b += beban(150 + i * 40, 110, "#ef4444")
    b += t(110, 150, "murah, sederhana; satu gangguan", 9.5, AX) + t(110, 162, "memadamkan seluruh hilir", 9.5, AX)
    # loop
    b += t(330, 18, "LOOP / RING", 11, "#22d3ee", "middle", "700") + sumber(240, 60, "#00e09e", "GI A") + sumber(420, 60, "#00e09e", "GI B")
    b += kawat(249, 60, 320, 60, "#22d3ee", 2.2) + kawat(340, 60, 411, 60, "#22d3ee", 2.2)
    b += f'<rect x="320" y="53" width="20" height="14" fill="{BOX}" stroke="#f59e0b" stroke-width="1.6"/>' + t(330, 45, "NO", 9.5, "#f59e0b", "middle", "700")
    for x in [270, 300, 360, 390]:
        b += beban(x, 60, "#22d3ee")
    for x in [275, 305, 355, 385]:
        b += f'<rect x="{x - 4}" y="56" width="8" height="8" fill="{BOX}" stroke="#a855f7" stroke-width="1.2"/>'
    b += t(330, 150, "dua arah pasokan; seksi gangguan", 9.5, AX) + t(330, 162, "diisolasi LBS, sisanya dipulihkan", 9.5, AX)
    # spindle
    b += t(550, 18, "SPINDLE", 11, "#a855f7", "middle", "700") + sumber(460, 40, "#00e09e", "GI")
    b += f'<rect x="616" y="30" width="24" height="90" rx="4" fill="{BOX}" stroke="#f59e0b" stroke-width="1.6"/>' + t(628, 132, "GH", 9.5, "#f59e0b", "middle", "700")
    for j, y in enumerate([50, 75, 100]):
        b += kawat(469, 40 + (y - 40) * 0.2, 490, y, "#a855f7", 1.6) + kawat(490, y, 616, y, "#a855f7", 2)
        for x in [520, 550, 580]:
            b += beban(x, y, "#a855f7")
    b += kawat(469, 44, 490, 122, "#f59e0b", 1.6) + f'<line x1="490" y1="122" x2="616" y2="122" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4"/>' + t(553, 134, "ekspres (tanpa beban)", 9, "#f59e0b")
    b += t(550, 150, "kabel tanah kota: penyulang kerja +", 9.5, AX) + t(550, 162, "satu ekspres cadangan lewat GH", 9.5, AX)
    return svg(660, 172, b, "Gambar 3 — Tiga konfigurasi jaringan tegangan menengah: radial, loop, dan spindle")


def gambar4():
    b = t(330, 20, "Gardu distribusi portal 20 kV/400 V (contoh 250 kVA)", 12, TX, "middle", "700")
    b += kawat(40, 50, 220, 50, "#22d3ee", 2.4) + t(60, 42, "JTM 20 kV", 10, "#22d3ee", "start", "600")
    b += kawat(130, 50, 130, 78, "#22d3ee", 1.6) + f'<rect x="122" y="78" width="16" height="22" rx="2" fill="{BOX}" stroke="#f59e0b" stroke-width="1.6"/>' + t(150, 92, "fuse cut-out + arrester", 9.5, "#f59e0b", "start")
    b += kawat(130, 100, 130, 118, "#22d3ee", 1.6) + f'<circle cx="130" cy="136" r="18" fill="{BOX}" stroke="#a855f7" stroke-width="2"/><circle cx="130" cy="156" r="18" fill="{BOX}" stroke="#a855f7" stroke-width="2"/>' + t(160, 148, f"trafo {ind(S_TRAFO, 0)} kVA, Dyn5", 10, "#a855f7", "start", "600") + t(160, 161, "tap ±2×2,5 % (tanpa beban)", 9.5, AX, "start")
    b += kawat(130, 174, 130, 192, "#00e09e", 1.6) + f'<rect x="20" y="192" width="220" height="18" rx="3" fill="{BOX}" stroke="#00e09e" stroke-width="1.6"/>' + t(130, 205, "PHB-TR: saklar utama + NH-fuse per jurusan", 9, "#00e09e")
    for i, x in enumerate([75, 110, 145, 180]):
        b += kawat(x, 210, x, 232, "#00e09e", 1.4) + t(x, 244, f"J{i + 1}", 9.5, "#00e09e", "middle", "600")
    b += t(130, 258, "4 jurusan JTR 380/220 V,", 9.5, AX) + t(130, 270, "masing-masing ≤ 63 A (NH 63 A)", 9.5, AX)
    # tabel kecil kanan: pembebanan
    kolom = [("Beban puncak", f"{ind(P_TRAFO, 0)} kW, pf {ind(PF_TRAFO, 1)}"), ("S beban", f"{ind(S_BEBAN, 0)} kVA"), ("Pembebanan", f"{ind(PEMBEBANAN, 0)} % (sasaran 60–80 %)"), ("Arus TR", f"{ind(S_BEBAN * 1000 / (SQ3 * 400), 0)} A pada 400 V"), ("Arus TM", f"{ind(S_BEBAN * 1000 / (SQ3 * 20000), 1)} A pada 20 kV"), ("Rugi trafo", "P₀ ≈ 0,4 kW + P_k ≈ 3 kW × (0,8)²")]
    for i, (k_, v_) in enumerate(kolom):
        y = 44 + i * 34
        b += f'<rect x="300" y="{y}" width="340" height="28" rx="6" fill="{BOX}" stroke="{GRID}" stroke-width="1"/>' + t(310, y + 18, k_, 10.5, TX, "start", "600") + t(630, y + 18, v_, 10, "#22d3ee", "end")
    return svg(660, 280, b, "Gambar 4 — Susunan gardu distribusi portal dan pembebanan trafonya")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 60, 616, 190, 26
    X = lambda p: x0 + p * (x1 - x0)
    for p in [0, 0.25, 0.5, 0.75, 1.0]:
        b += f'<line x1="{X(p):.1f}" y1="{y1}" x2="{X(p):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(p), y0 + 16, f"{ind(p * L_PY, 1)} km", 10.5, AX)
    # arus: terpusat (konstan) vs merata (linear)
    Yi = lambda v: y0 - v * 0.42 * (y0 - y1) - 0.5 * (y0 - y1)
    b += f'<line x1="{X(0):.1f}" y1="{Yi(1):.1f}" x2="{X(1):.1f}" y2="{Yi(1):.1f}" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="6 4"/>' + t(X(0.5), Yi(1) - 8, f"arus terpusat di ujung: {ind(I_PY, 0)} A sepanjang saluran", 10, "#ef4444", "middle", "600")
    b += f'<line x1="{X(0):.1f}" y1="{Yi(1):.1f}" x2="{X(1):.1f}" y2="{Yi(0):.1f}" stroke="#00e09e" stroke-width="2.4"/>' + t(X(0.55), Yi(0) - 4, "arus beban merata: I(x) = I(1 − x/ℓ)", 10, "#00e09e", "middle", "600")
    b += t(x0 - 8, Yi(1) + 4, "I", 10.5, AX, "end") + t(x0 - 8, Yi(0) + 4, "0", 10.5, AX, "end")
    # tegangan
    Yv = lambda v: y0 - v * 0.4 * (y0 - y1)
    b += f'<line x1="{X(0):.1f}" y1="{Yv(1):.1f}" x2="{X(1):.1f}" y2="{Yv(0):.1f}" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4"/>'
    pts = " ".join(f"{X(i / 40):.1f},{Yv(1 - 0.5 * (2 * (i / 40) - (i / 40) ** 2)):.1f}" for i in range(41))
    b += f'<polyline points="{pts}" fill="none" stroke="#00e09e" stroke-width="2.4"/>'
    b += t(x0 - 8, Yv(1) + 4, "V₀", 10.5, AX, "end") + t(x0 - 8, Yv(0.5) + 4, "−½ΔV", 10.5, "#00e09e", "end") + t(x0 - 8, Yv(0) + 4, "−ΔV", 10.5, "#ef4444", "end")
    b += t(X(0.5), Yv(0.15), "ΔV terpusat (linear)", 10, "#ef4444", "middle", "600") + t(X(0.62), Yv(0.88), "ΔV merata = ½ ΔV terpusat (parabola); rugi = ⅓", 10, "#00e09e", "middle", "600")
    b += t(345, 226, f"Penyulang 20 kV {ind(L_PY, 0)} km, r = {ind(R_PY, 1)} Ω/km, arus pangkal {ind(I_PY, 0)} A: rugi terpusat {ind(RUGI_PY_TERPUSAT, 1)} kW, beban merata {ind(RUGI_PY, 1)} kW", 10.5, AX)
    return svg(660, 236, b, "Gambar 5 — Arus, tegangan, dan rugi sepanjang penyulang: beban terpusat vs tersebar merata")


def gambar6():
    b = ""
    x0, x1, y0, y1 = 64, 630, 190, 26
    pen = [16, 25, 35, 50, 70, 95, 120, 150]
    X = lambda i: x0 + i / (len(pen) - 1) * (x1 - x0)
    dv = lambda A: SQ3 * I_JTR * L_JTR * (28.3 / A * PF_JTR + X_JTR * SIN_JTR) / 380 * 100
    rugi = lambda A: 3 * I_JTR ** 2 * 28.3 / A * L_JTR / 1000
    dmax = dv(16)
    Y = lambda v: y0 - v / dmax * (y0 - y1)
    for i, A in enumerate(pen):
        b += t(X(i), y0 + 16, f"{A}", 10.5, AX)
    for v in [0, 2.5, 5, 7.5, 10]:
        if v <= dmax:
            b += f'<line x1="{x0}" y1="{Y(v):.1f}" x2="{x1}" y2="{Y(v):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(v) + 4, f"{ind(v, 1)} %", 10.5, AX, "end")
    b += f'<line x1="{x0}" y1="{Y(5):.1f}" x2="{x1}" y2="{Y(5):.1f}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="5 4"/>' + t(x1 - 4, Y(5) - 5, "batas rancangan JTR 5 %", 9.5, "#ef4444", "end", "600")
    pts = " ".join(f"{X(i):.1f},{Y(dv(A)):.1f}" for i, A in enumerate(pen))
    b += f'<polyline points="{pts}" fill="none" stroke="#22d3ee" stroke-width="2.6"/>'
    for i, A in enumerate(pen):
        c = "#00e09e" if dv(A) <= 5 else "#ef4444"
        akhir = i == len(pen) - 1
        b += f'<circle cx="{X(i):.1f}" cy="{Y(dv(A)):.1f}" r="4" fill="{c}"/>' + t(X(i) - 4 if akhir else X(i) + 6, Y(dv(A)) + 16 if akhir else Y(dv(A)) - 8, f"{ind(dv(A), 1)} % · {ind(rugi(A), 1)} kW", 9, TX, "end" if akhir else "start", "600")
    b += t(28, 108, "ΔV", 10.5, AX) + t(347, 222, "penampang (mm², aluminium)", 10.5, AX)
    b += t(347, 240, f"JTR {ind(L_JTR * 1000, 0)} m, {ind(I_JTR, 0)} A pf {ind(PF_JTR, 1)}: penampang yang memenuhi 5 % dan rugi dayanya;", 10.5, AX)
    b += t(347, 254, "penampang lebih besar menekan rugi terus tetapi biaya kabel naik", 10.5, AX)
    return svg(660, 264, b, "Gambar 6 — Jatuh tegangan dan rugi JTR terhadap penampang penghantar")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-struktur">Struktur</a>
  <a href="#m-beban">Karakteristik Beban</a>
  <a href="#m-konfigurasi">Konfigurasi &amp; Keandalan</a>
  <a href="#m-gardu">Gardu Distribusi</a>
  <a href="#m-jatuh">Jatuh Tegangan &amp; Rugi</a>
  <a href="#m-rancang">Perancangan JTR</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="60" r="6" fill="none" stroke="rgba(0,224,158,.6)" stroke-width="1.5"/>
      <line x1="26" y1="60" x2="90" y2="60" stroke="rgba(0,229,255,.5)" stroke-width="1.5"/>
      <line x1="45" y1="60" x2="45" y2="110" stroke="rgba(0,229,255,.4)" stroke-width="1"/>
      <line x1="70" y1="60" x2="70" y2="140" stroke="rgba(0,229,255,.4)" stroke-width="1"/>
      <rect x="41" y="110" width="8" height="8" fill="rgba(255,179,0,.6)"/>
      <rect x="66" y="140" width="8" height="8" fill="rgba(255,179,0,.6)"/>
      <text x="16" y="44" fill="rgba(0,224,158,.55)" font-family="JetBrains Mono" font-size="8">GI</text>
      <text x="52" y="176" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">radial</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 150 L 30 140 L 45 150 L 60 100 L 75 95 L 90 130" stroke="rgba(239,68,68,.6)" stroke-width="1.6" fill="none"/>
      <line x1="10" y1="122" x2="90" y2="122" stroke="rgba(0,224,158,.6)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="12" y="80" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">kurva beban</text>
      <text x="56" y="116" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">P_rata</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="11">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">F_B = E/(P_maks·T)</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">F_rugi = 0,3F_B + 0,7F_B²</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">ΔV = √3·I·L·(r cos φ + x sin φ)</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">SAIDI · SAIFI</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">20 kV → 380/220 V</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">radial · loop · spindle</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">faktor keragaman ≥ 1</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">merata: ½ ΔV, ⅓ rugi</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Konsep dan Teori Dasar</span><br>
      <em>Sistem Distribusi</em><br>
      <span class="hl-amber">Tenaga Listrik</span>
    </h1>
    <p class="hero-sub">Dari gardu induk sampai stopkontak, sistem distribusi adalah bagian jaringan yang paling luas, paling banyak rugi, dan paling sering bersentuhan dengan pelanggan. Modul ini menata dasarnya: struktur JTM 20 kV dan JTR 380/220 V, cara membaca beban lewat faktor kebutuhan, keragaman, beban, dan rugi, konfigurasi radial, loop, dan spindle beserta indeks keandalannya, gardu distribusi dan pemilihan trafo, serta perhitungan jatuh tegangan dan rugi pada penyulang dan jaringan tegangan rendah, dengan sudut pandang insinyur yang merancang pasokan kawasan.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Konsep, prinsip, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Contoh, tabel, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Python, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">@@N_CELL@@</div><div class="stat-lbl">Cell Python</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — struktur
    isi = figure(1, "Kedudukan sistem distribusi dalam rantai pasokan tenaga listrik", "Sistem distribusi mengambil daya dari rel 20 kV gardu induk dan mengantarkannya ke pelanggan lewat dua tingkat: distribusi primer (JTM 20 kV) dan distribusi sekunder (JTR 380/220 V), dengan gardu distribusi sebagai penghubungnya.", gambar1())
    isi += formula(1, "Tegangan, Arus, dan Daya pada Jaringan Distribusi", r"S = \sqrt{3}\,V_L I, \qquad I_{TM} = \dfrac{S}{\sqrt{3}\times 20\,\text{kV}}, \qquad I_{TR} = \dfrac{S}{\sqrt{3}\times 400\,\text{V}} = 50\,I_{TM}",
                   rf"Trafo {ind(S_TRAFO, 0)} kVA berbeban {ind(S_BEBAN, 0)} kVA: arus sisi 20 kV \(= {ind(S_BEBAN, 0)}\times10^3/(\sqrt{{3}}\times20\times10^3) = {ind(S_BEBAN * 1000 / (SQ3 * 20000), 2)}\) A, arus sisi 400 V \(= {ind(S_BEBAN * 1000 / (SQ3 * 400), 1)}\) A. Daya yang sama, arus 50 kali lebih besar: itulah mengapa JTR pendek (≤ 500 m), berpenampang besar, dan tetap menjadi tempat rugi terbesar.",
                   "Distribusi primer memakai 20 kV karena arusnya kecil sehingga penyulang dapat menjangkau 10–20 km dengan jatuh tegangan dan rugi yang terkendali; distribusi sekunder memakai 380/220 V karena itulah tegangan peralatan pelanggan. Gardu distribusi adalah tempat 'pertukaran' keduanya, dan letaknya harus sedekat mungkin dengan pusat beban agar JTR sependek mungkin. Insinyur mesin bertemu sistem ini di gardu pelanggan (TM) atau di panel utama (TR) pabriknya.",
                   [("V_L", "Tegangan antar-saluran (V)"), ("I_{TM}, I_{TR}", "Arus di sisi tegangan menengah dan rendah (A)"), ("S", "Daya semu yang disalurkan (VA)")])
    isi += cards([
        ("🏗️", "Distribusi Primer", "Penyulang 20 kV dari GI: saluran udara (AAAC 70–240 mm², 4–8 MVA) di pinggiran, kabel tanah XLPE (150–300 mm²) di kota; panjang 5–25 km, ratusan gardu per penyulang.", None),
        ("🏠", "Distribusi Sekunder", "JTR 380/220 V dari gardu: kabel pilin (twisted) NFA2X 3×70+50 mm² di tiang, ≤ 500 m per jurusan, 4 jurusan per gardu, 50–150 rumah per gardu.", None),
        ("🔌", "Sambungan Rumah", "SR 1 fasa 2×10 mm² (≤ 900–5500 VA) atau 3 fasa 4×10–16 mm² (≥ 6600 VA), dari tiang ke APP (kWh-meter + MCB pembatas) pelanggan.", None),
        ("🏭", "Pelanggan TM", "Pabrik ≥ 200 kVA berlangganan 20 kV dengan gardu sendiri (kubikel, trafo 630–2000 kVA); membayar kVARh berlebih dan mengelola pf sendiri (Modul 5, 10).", None),
        ("📉", "Rugi Distribusi", "Rugi teknis distribusi 5–7 % dari energi (JTR 2–3 %, trafo 1–2 %, JTM 1–2 %) ditambah rugi non-teknis (pencurian, meter); sasaran PLN < 8 % total.", None),
        ("🔗", "Rantai Modul", "Modul 9 memberi parameter saluran, Modul 10 memberi kompensasi; modul ini memberi kerangka jaringannya, dan Modul 12 melanjutkan ke aliran daya, proteksi, dan pengembangan.", None),
    ])
    isi += tabel(["Tingkat jaringan", "Tegangan", "Penghantar khas", "Panjang khas", "Daya per unit", "Pemilik/pengelola"], [
        ["Transmisi", "150 / 500 kV", "ACSR 240–4×435 mm²", "50–500 km", "100–2000 MVA", "PLN UIT (Modul 7–9)"],
        ["Gardu induk", "150/20 kV", "trafo 30–60 MVA", "—", "30–60 MVA", "PLN UIT/UID"],
        ["JTM (penyulang)", "20 kV", "AAAC 150–240 / XLPE 240", "5–25 km", "4–10 MVA", "PLN UID/UP3"],
        ["Gardu distribusi", "20 kV/400 V", "trafo 25–630 kVA", "—", "25–630 kVA", "PLN ULP"],
        ["JTR (jurusan)", "380/220 V", "NFA2X 3×70+50", "≤ 500 m", "≤ 63 A/jurusan", "PLN ULP"],
        ["Sambungan rumah", "220 V / 380 V", "NFA2X 2×10 / 4×10", "≤ 30 m", "0,9–200 kVA", "PLN → APP pelanggan"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> makin ke hilir, tegangan makin rendah, unit makin kecil dan makin banyak: satu GI melayani ± 10 penyulang, satu penyulang ± 50 gardu, satu gardu ± 100 rumah. Kesalahan rancangan di hilir (JTR terlalu panjang, trafo terlalu kecil) yang terlihat langsung oleh pelanggan sebagai tegangan rendah dan pemadaman. Soal C5 memakai Persamaan (1).")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 memberi peta jaringan. Bagian 02 mengajarkan membaca beban: empat faktor (kebutuhan, keragaman, beban, rugi) yang menentukan ukuran semua peralatan. Bagian 03 membahas bentuk jaringan (radial, loop, spindle) dan cara mengukur keandalannya (SAIFI, SAIDI). Bagian 04 merancang gardu dan memilih trafo; Bagian 05–06 menghitung jatuh tegangan dan rugi pada penyulang dan JTR sampai memilih penampang. Animasi dan Python memakai angka contoh yang sama.")
    m += bagian(1, "m-struktur", "Struktur Sistem<br>Distribusi Tenaga Listrik",
                "Sistem distribusi dimulai di rel 20 kV gardu induk dan berakhir di kWh-meter pelanggan. Ia terdiri atas jaringan tegangan menengah (JTM) 20 kV, gardu distribusi, jaringan tegangan rendah (JTR) 380/220 V, dan sambungan rumah. Persamaan (1) mengingatkan mengapa dua tingkat tegangan itu diperlukan, dan Gambar 1 menempatkannya dalam rantai pasokan.",
                isi, "STRUKTUR DISTRIBUSI")

    # 02 — karakteristik beban
    isi = figure(2, "Kurva beban harian dua jenis pelanggan dan faktor bebannya", "Pelanggan rumah tangga berpuncak malam (18–20), komersial berpuncak siang (10–15). Rata-rata terhadap puncak adalah faktor beban; puncak yang tidak bersamaan membuat kebutuhan gabungan lebih kecil daripada jumlah puncak masing-masing: faktor keragaman.", gambar2())
    isi += formula(2, "Empat Faktor Beban", r"F_{keb} = \dfrac{P_{maks}}{P_{terhubung}}, \quad F_{krg} = \dfrac{\sum P_{maks,i}}{P_{maks,serempak}} \ge 1, \quad F_B = \dfrac{E}{P_{maks}\,T}, \quad F_{rugi} \approx 0{,}3F_B + 0{,}7F_B^2",
                   rf"Gardu contoh: beban terhubung {ind(TERHUBUNG, 0)} kW dengan \(F_{{keb}} = {ind(DF, 2)}\) → \(P_{{maks}} = {ind(P_MAKS, 1)}\) kW. Tiga kelompok berpuncak {ind(P_IND[0], 0)}, {ind(P_IND[1], 0)}, {ind(P_IND[2], 0)} kW dengan \(F_{{krg}} = {ind(FD, 1)}\) → serempak \({ind(sum(P_IND), 0)}/{ind(FD, 1)} = {ind(P_SEREMPAK, 1)}\) kW. Energi {ind(E_BULAN, 0)} kWh/bulan pada puncak {ind(P_MAKS_LF, 0)} kW: \(F_B = {ind(E_BULAN, 0)}/({ind(P_MAKS_LF, 0)}\times720) = {ind(LF, 2)}\). Faktor beban tahunan {ind(FB_TH, 2)} → \(F_{{rugi}} = 0{{,}}3\times{ind(FB_TH, 2)} + 0{{,}}7\times{ind(FB_TH, 2)}^2 = {ind(LOSSF, 4)}\).",
                   "Faktor kebutuhan menerjemahkan daya terpasang menjadi daya yang benar-benar ditarik (tidak semua alat menyala bersamaan); faktor keragaman menerjemahkan puncak tiap pelanggan menjadi puncak gabungan (puncak tidak bersamaan). Keduanya yang membuat trafo 100 kVA cukup untuk 80 rumah berdaya 1300 VA. Faktor beban mengukur seberapa 'rata' pemakaian; faktor rugi menerjemahkannya ke rugi rata-rata karena rugi ∝ I², dan selalu berada di antara F_B² dan F_B.",
                   [("P_{terhubung}", "Jumlah daya seluruh peralatan/pelanggan (kW)"), ("P_{maks,i}", "Kebutuhan maksimum tiap kelompok pada waktunya sendiri"), ("T", "Periode (jam): 720 sebulan, 8760 setahun")])
    isi += cards([
        ("🏠", "Rumah Tangga", "F_keb 0,4–0,6; F_krg antar-rumah 2–3; F_B 0,3–0,5; puncak malam 18–21 saat lampu, TV, AC, dan magic com bersamaan.", None),
        ("🏬", "Komersial", "F_keb 0,6–0,8; F_krg 1,3–1,5; F_B 0,4–0,6; puncak siang saat AC dan penerangan toko/kantor.", None),
        ("🏭", "Industri", "F_keb 0,7–0,9 (satu shift) sampai 0,95 (tiga shift); F_B 0,5–0,85; beban paling 'rata', paling disukai utilitas.", None),
        ("📈", "Kebutuhan Puncak", "Ukuran trafo, penyulang, dan GI ditentukan kebutuhan serempak puncak, bukan energi; pelanggan berfaktor beban rendah 'mahal' karena memakai kapasitas tetapi sedikit kWh.", None),
        ("🧮", "Faktor Rugi", "Beban puncak 100 kW dengan F_B 0,5 memakai energi 50 %, tetapi rugi rata-ratanya 0,325 × rugi puncak, bukan 0,5: rugi terkonsentrasi di jam puncak.", r"\(F_B^2 \le F_{rugi} \le F_B\)"),
        ("📋", "Peramalan", "Kebutuhan per pelanggan × jumlah pelanggan ÷ faktor keragaman = kebutuhan gardu; dari sini tumbuh 5–7 %/tahun untuk perencanaan Modul 12.", None),
    ])
    isi += tabel(["Kelompok pelanggan (PLN, khas)", "Daya per pelanggan", "F_keb", "F_krg antar-pelanggan", "kebutuhan per pelanggan saat puncak gardu", "F_B"],
                 [[nama, daya, ind(fk, 2), ind(fkr, 1), f"{ind(kw, 2)} kW", ind(fb, 2)] for nama, daya, fk, fkr, kw, fb in
                  [("R1 900 VA", "0,9 kVA", 0.55, 2.8, 0.9 * 0.55 * 0.9 / 2.8, 0.35), ("R1 1300 VA", "1,3 kVA", 0.5, 2.6, 1.3 * 0.5 * 0.9 / 2.6, 0.38), ("R1 2200 VA", "2,2 kVA", 0.5, 2.4, 2.2 * 0.5 * 0.9 / 2.4, 0.4),
                   ("B2 ruko 5500 VA", "5,5 kVA", 0.7, 1.6, 5.5 * 0.7 * 0.85 / 1.6, 0.5), ("I2 industri kecil 53 kVA", "53 kVA", 0.8, 1.3, 53 * 0.8 * 0.85 / 1.3, 0.6)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> 80 rumah 1300 VA tidak memerlukan 104 kVA melainkan ± 18 kW saat puncak gardu; tetapi 20 ruko sudah 41 kW. Angka kolom kelima yang dijumlahkan menjadi kebutuhan gardu dan menentukan trafo (Bagian 04). Soal C1–C4 memakai Persamaan (2).")
    m += bagian(2, "m-beban", "Karakteristik Beban:<br>Kebutuhan, Keragaman, Beban, dan Rugi",
                "Sebelum merancang apa pun, insinyur distribusi harus tahu berapa beban yang sebenarnya akan ditarik, bukan berapa yang terpasang. Empat faktor pada Persamaan (2) menjembatani keduanya dan menentukan ukuran trafo, penyulang, dan rugi tahunan; Gambar 2 memperlihatkan asal-usulnya pada kurva beban harian.",
                isi, "KARAKTERISTIK BEBAN")

    # 03 — konfigurasi & keandalan
    isi = figure(3, "Tiga konfigurasi jaringan tegangan menengah: radial, loop, dan spindle", "Radial: satu jalur, murah, satu gangguan memadamkan seluruh hilir. Loop: dua arah pasokan dengan titik normally open (NO); seksi gangguan diisolasi dan sisanya dipulihkan. Spindle: beberapa penyulang kerja ke gardu hubung (GH) ditambah penyulang ekspres tanpa beban sebagai cadangan, khas kabel tanah kota.", gambar3())
    isi += formula(3, "Indeks Keandalan Distribusi", r"SAIFI = \dfrac{\sum N_i}{N}, \qquad SAIDI = \dfrac{\sum N_i\,t_i}{N}, \qquad CAIDI = \dfrac{SAIDI}{SAIFI}, \qquad ENS = P_{rata}\,SAIDI",
                   rf"Rayon {PEL} pelanggan dalam setahun mencatat {ind(PEL_KALI, 0)} pelanggan-kali padam dan {ind(PEL_JAM, 0)} pelanggan-jam padam: \(SAIFI = {ind(PEL_KALI, 0)}/{PEL} = {ind(SAIFI, 2)}\) kali, \(SAIDI = {ind(PEL_JAM, 0)}/{PEL} = {ind(SAIDI, 2)}\) jam, \(CAIDI = {ind(CAIDI, 2)}\) jam per gangguan, \(ASAI = 1 - {ind(SAIDI, 2)}/8760 = {ind(ASAI * 100, 3)}\) %. Penyulang berbeban puncak {ind(P_MW_ENS, 1)} MW dengan \(F_B = {ind(FB_ENS, 2)}\): \(ENS = {ind(P_MW_ENS, 1)}\times{ind(FB_ENS, 2)}\times{ind(SAIDI, 2)} = {ind(ENS, 2)}\) MWh/tahun.",
                   "SAIFI mengukur seberapa sering pelanggan rata-rata padam, SAIDI seberapa lama; CAIDI lama rata-rata tiap pemadaman. Konfigurasi loop/spindle dan pemisah seksi (LBS, recloser) memperbaiki SAIDI (hilir dipulihkan lewat arah lain), sedangkan pengurangan SAIFI memerlukan pencegahan gangguan (pemangkasan pohon, kabel berisolasi, arrester) dan pengaman yang selektif. PLN melaporkan SAIDI/SAIFI per unit sebagai indikator kinerja utama.",
                   [("N_i, t_i", "Jumlah pelanggan padam dan lamanya pada kejadian ke-i"), ("N", "Jumlah pelanggan yang dilayani"), ("P_{rata}", "Beban rata-rata yang tak tersalurkan (MW)")])
    isi += cards([
        ("➡️", "Radial", "Pilihan baku saluran udara pinggiran kota; keandalan dinaikkan dengan recloser dan sectionalizer/LBS bermotor yang membagi penyulang menjadi seksi.", None),
        ("🔁", "Loop (Ring)", "Dua penyulang (bisa dari GI berbeda) bertemu di titik NO; setelah gangguan, LBS di kedua sisi seksi dibuka dan NO ditutup (manual ± 1 jam, otomatis/FLISR beberapa detik).", None),
        ("🌀", "Spindle", "Standar kabel tanah 20 kV PLN kota: sampai 6 penyulang kerja + 1 ekspres ke gardu hubung; gangguan satu penyulang diambil alih ekspres lewat GH.", None),
        ("🕸️", "Mesh / Grid TR", "JTR bertautan dari beberapa trafo (network) di pusat kota padat: keandalan tertinggi, proteksi paling rumit (network protector); jarang di Indonesia.", None),
        ("📐", "Pemisah Seksi", "Setiap LBS tambahan mengecilkan bagian yang padam lama; dengan n seksi, rata-rata hanya 1/n pelanggan yang menunggu perbaikan (Animasi 2 dan 4).", None),
        ("🎯", "Sasaran PLN", "Kota besar SAIDI < 5 jam dan SAIFI < 5 kali/pelanggan/tahun; pinggiran 10–20 jam; kawasan industri premium ≤ 1 jam dengan pasokan ganda.", None),
    ])
    isi += tabel(["Konfigurasi", "Sumber pasokan", "Pemulihan hilir saat gangguan", "SAIDI relatif", "Biaya relatif", "Penerapan"], [
        ["Radial tanpa seksi", "1", "menunggu perbaikan (2–4 jam)", "100 %", "1,0", "pedesaan, beban kecil"],
        ["Radial berseksi (n LBS)", "1", "hulu pulih ± 0,5 jam; hilir menunggu", "50–70 %", "1,1", "pinggiran kota, SUTM"],
        ["Loop dengan NO", "2", "hulu dan hilir pulih ± 0,5–1 jam", "20–30 %", "1,3", "kota, SUTM/SKTM"],
        ["Spindle + GH", "n + ekspres", "seluruh penyulang dialihkan ke ekspres", "15–25 %", "1,6", "kabel tanah kota besar"],
        ["Pasokan ganda pelanggan", "2 GI", "otomatis (ATS) < 1 menit", "< 5 %", "2+", "rumah sakit, data center, industri"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> keandalan dibeli dengan jalur dan saklar tambahan; rancangan yang benar memilih konfigurasi menurut nilai beban yang tak tersalurkan (ENS × harga kWh + kerugian pelanggan). Untuk pabrik, kerugian satu jam padam bisa jauh melebihi biaya penyulang kedua. Soal C10 dan C14 memakai Persamaan (3).")
    m += bagian(3, "m-konfigurasi", "Konfigurasi Jaringan<br>dan Indeks Keandalan",
                "Bentuk jaringan menentukan apa yang terjadi saat satu bagian rusak: pada radial seluruh hilir padam sampai perbaikan selesai, pada loop dan spindle sebagian besar pelanggan dipulihkan dari arah lain dalam hitungan menit. Gambar 3 membandingkan ketiganya, dan Persamaan (3) memberi ukuran keandalan yang dipakai PLN dan regulator: SAIFI, SAIDI, CAIDI, dan energi tak tersalurkan.",
                isi, "KONFIGURASI DAN KEANDALAN")

    # 04 — gardu distribusi
    isi = figure(4, "Susunan gardu distribusi portal dan pembebanan trafonya", f"Fuse cut-out dan arrester di sisi 20 kV, trafo {ind(S_TRAFO, 0)} kVA Dyn5 bertap ±2×2,5 %, PHB-TR dengan saklar utama dan NH-fuse per jurusan di sisi 400 V; beban puncak {ind(P_TRAFO, 0)} kW pf {ind(PF_TRAFO, 1)} = {ind(S_BEBAN, 0)} kVA berarti pembebanan {ind(PEMBEBANAN, 0)} %.", gambar4())
    isi += formula(4, "Pemilihan Trafo dan Pembebanan Gardu", r"P_{serempak} = \dfrac{n\,d}{F_{krg}}, \qquad S_{gardu} = \dfrac{P_{serempak}}{\cos\varphi}, \qquad \text{pembebanan} = \dfrac{S_{beban}}{S_{trafo}}\times100\,\%",
                   rf"Perumahan {N_RUMAH} rumah dengan kebutuhan maksimum {ind(D_RUMAH, 1)} kW per rumah, \(F_{{krg}} = {ind(FD_RUMAH, 1)}\), pf {ind(PF_RUMAH, 1)}: \(P = {N_RUMAH}\times{ind(D_RUMAH, 1)}/{ind(FD_RUMAH, 1)} = {ind(N_RUMAH * D_RUMAH / FD_RUMAH, 1)}\) kW, \(S = {ind(N_RUMAH * D_RUMAH / FD_RUMAH, 1)}/{ind(PF_RUMAH, 1)} = {ind(S_GARDU, 1)}\) kVA → trafo standar 100 kVA (pembebanan awal {ind(S_GARDU / 100 * 100, 0)} %, menyisakan ruang tumbuh 5 %/tahun selama ± 8 tahun). Gardu contoh {ind(S_TRAFO, 0)} kVA berbeban {ind(S_BEBAN, 0)} kVA: {ind(PEMBEBANAN, 0)} %.",
                   "Trafo distribusi dipilih dari deret standar (25, 50, 100, 160, 200, 250, 315, 400, 630 kVA) sehingga pembebanan awal 50–70 % dan pembebanan akhir ≤ 80–90 % saat beban tumbuh; di atas itu tegangan sekunder jatuh, rugi tembaga (∝ S²) melonjak, dan umur isolasi memendek. Trafo yang terlalu besar memboroskan rugi besi (P₀ tetap sepanjang tahun) dan biaya. Tap tanpa beban ±2×2,5 % dipakai untuk mengoreksi tegangan JTM rata-rata di lokasi gardu; tegangan sekunder tanpa beban 400 V agar setelah jatuh tegangan JTR masih ≥ 342 V (−10 %).",
                   [("n, d", "Jumlah pelanggan dan kebutuhan maksimum per pelanggan (kW)"), ("F_{krg}", "Faktor keragaman antar-pelanggan"), ("S_{trafo}", "Daya pengenal trafo (kVA)")])
    isi += cards([
        ("🏗️", "Jenis Gardu", "Gardu portal/cantol (tiang, ≤ 250 kVA, SUTM), gardu beton/kios (kubikel 20 kV + trafo ≤ 630 kVA, SKTM kota), gardu pelanggan TM.", None),
        ("🔥", "Rugi Trafo", "P₀ (besi, tetap) 0,2–0,6 kW dan P_k (tembaga, ∝ pembebanan²) 1–6 kW untuk 100–400 kVA; efisiensi maksimum saat P₀ = P_k, biasanya di pembebanan 40–60 %.", r"\(P_{rugi} = P_0 + P_k\left(\tfrac{S}{S_n}\right)^2\)"),
        ("⚖️", "Ketidakseimbangan", "Beban 1 fasa yang tidak merata antar-fasa menimbulkan arus netral, rugi tambahan, dan tegangan fasa timpang; pembagian SR per fasa dijaga seimbang (< 10–20 %).", None),
        ("🛡️", "Proteksi", "Sisi TM: fuse cut-out (2–3 × I_n trafo) + arrester; sisi TR: NH-fuse per jurusan (≤ 0,9 × KHA kabel) yang harus putus lebih dulu daripada fuse TM (selektivitas).", None),
        ("📏", "Letak Gardu", "Di pusat beban (titik berat beban), agar jurusan JTR ≤ 500 m dan jatuh tegangannya ≤ 5 %; gardu tambahan lebih murah daripada memperbesar JTR panjang.", None),
        ("🔧", "Pemeliharaan", "Ukur pembebanan dan tegangan per fasa saat puncak (Animasi 1), termografi sambungan, uji minyak; pembebanan > 80 % adalah pemicu penambahan gardu (sisip).", None),
    ])
    isi += tabel(["Trafo (kVA)", "I_n TR (A) pada 400 V", "P₀ (kW)", "P_k (kW)", "Rumah 1300 VA yang dapat dilayani*", "Jurusan JTR"],
                 [[str(s), ind(s * 1000 / (SQ3 * 400), 0), ind(p0, 2), ind(pk, 2), str(int(s * 0.7 * 0.9 / (1.3 * 0.5 * 0.9 / 2.6) // 1)), jur] for s, p0, pk, jur in
                  [(50, 0.19, 1.1, "1–2"), (100, 0.32, 1.75, "2–3"), (160, 0.46, 2.35, "3–4"), (250, 0.65, 3.25, "4"), (400, 0.93, 4.6, "4–6"), (630, 1.3, 6.5, "6–8")]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> *pada pembebanan 70 %, pf 0,9, kebutuhan puncak per rumah ≈ 0,225 kW (baris R1 1300 VA Bagian 02); trafo 100 kVA ≈ 280 rumah secara daya, tetapi jumlah rumah nyata dibatasi panjang JTR (≤ 500 m) sehingga 100–150 rumah per gardu lebih umum. Soal C5 dan C11 memakai Persamaan (4).")
    m += bagian(4, "m-gardu", "Gardu Distribusi<br>dan Pemilihan Trafo",
                "Gardu distribusi adalah unit terkecil sistem yang masih dirancang satu per satu: berapa kVA trafonya, berapa jurusannya, di mana letaknya. Persamaan (4) menurunkan ukuran trafo dari jumlah pelanggan lewat faktor keragaman, dan Gambar 4 memperlihatkan susunan gardu portal yang menjadi tulang punggung distribusi Indonesia.",
                isi, "GARDU DISTRIBUSI")

    # 05 — jatuh tegangan & rugi
    isi = figure(5, "Arus, tegangan, dan rugi sepanjang penyulang: beban terpusat vs tersebar merata", f"Bila beban terpusat di ujung, arus sama sepanjang saluran dan tegangan turun linear; bila tersebar merata, arus berkurang linear sehingga tegangan turun parabolik dengan jatuh total setengahnya dan rugi sepertiganya: {ind(RUGI_PY_TERPUSAT, 1)} → {ind(RUGI_PY, 1)} kW pada penyulang contoh.", gambar5())
    isi += formula(5, "Jatuh Tegangan dan Rugi pada Penyulang dan JTR", r"\Delta V_{LL} = \sqrt{3}\,I\,L\,(r\cos\varphi + x\sin\varphi), \qquad \Delta V_{1\varphi} = 2\,I\,r\,L, \qquad \text{merata: } \Delta V = \tfrac{1}{2}\Delta V_{terpusat},\ P_{rugi} = \tfrac{1}{3}(3I^2R) = I^2R",
                   rf"JTR tiga fasa kabel Al 4×50 mm² (r = {ind(R50, 3)}, x = {ind(X_JTR, 2)} Ω/km), {ind(L_JTR * 1000, 0)} m, beban terpusat {ind(I_JTR, 0)} A pf {ind(PF_JTR, 1)}: \(\Delta V = \sqrt{{3}}\times{ind(I_JTR, 0)}\times{ind(L_JTR, 2)}\times({ind(R50, 3)}\times{ind(PF_JTR, 1)} + {ind(X_JTR, 2)}\times{ind(SIN_JTR, 3)}) = {ind(DV_JTR, 1)}\) V = {ind(DV_JTR_PCT, 2)} %. Sambungan rumah 2×10 mm² (r = {ind(R10, 2)} Ω/km) {ind(L_SR * 1000, 0)} m, {ind(I_SR, 0)} A: \(\Delta V = 2\times{ind(I_SR, 0)}\times{ind(R10, 2)}\times{ind(L_SR, 2)} = {ind(DV_SR, 2)}\) V = {ind(DV_SR_PCT, 2)} %. Penyulang 20 kV {ind(L_PY, 0)} km beban merata {ind(I_PY, 0)} A: rugi \(= {ind(I_PY, 0)}^2\times{ind(R_PY * L_PY, 1)} = {ind(RUGI_PY, 1)}\) kW; energi rugi tahunan dengan \(F_{{rugi}} = {ind(F_RUGI_PY, 1)}\): \({ind(RUGI_PY, 1)}\times8760\times{ind(F_RUGI_PY, 1)} = {ind(E_RUGI_PY / 1000, 1)}\) MWh.",
                   "Rumus jatuh tegangan sama dengan Modul 6 dan 10, tetapi di JTR reaktansi kecil (x ≈ 0,08 Ω/km) sehingga suku r cos φ mendominasi, dan pada sambungan satu fasa arus mengalir pergi–pulang (fasa dan netral) sehingga panjangnya dihitung dua kali. Beban nyata di JTR tersebar (rumah demi rumah), sehingga faktor ½ untuk tegangan dan ⅓ untuk rugi lazim dipakai dalam rancangan; beban bertahap (beberapa titik) dihitung ruas demi ruas dengan arus kumulatif.",
                   [("r, x", "Resistansi dan reaktansi per km penghantar (Ω/km)"), ("L", "Panjang saluran (km)"), ("R", "Resistansi total r·L (Ω)")])
    isi += cards([
        ("📏", "Batas Tegangan", "SPLN 1:1995: pelanggan TR +5 %/−10 % (231–198 V); alokasi rancangan: JTM ≤ 5 %, trafo ≤ 3 %, JTR ≤ 4–5 %, SR ≤ 1–2 %; tap trafo mengangkat titik awal.", None),
        ("🧮", "Ruas demi Ruas", "JTR dengan beban di beberapa titik: arus tiap ruas = jumlah arus beban di hilirnya; ΔV total = Σ ruas (Soal C12).", None),
        ("⚡", "Kabel JTR", "NFA2X (Al pilin) 3×35+25: r 0,868; 3×50+35: 0,641; 3×70+50: 0,443; 3×95+70: 0,320 Ω/km; x ≈ 0,08 Ω/km untuk semua.", None),
        ("🔥", "Rugi JTR", "Arus besar pada tegangan rendah: JTR 300 m 100 A kabel 50 mm² merugi ± 1,9 kW (beban terpusat), 2 % dari 66 kW yang disalurkan; JTR panjang adalah sumber rugi terbesar.", None),
        ("📊", "Beban Tak Seimbang", "Arus netral I_N ≈ |I_R + a²I_S + aI_T| menambah jatuh tegangan pada fasa yang paling berat dan rugi I_N²R_N; keseimbangan adalah perbaikan termurah.", None),
        ("🔁", "Ke Modul 10", "Untuk penyulang 20 kV, kapasitor dan regulator (Modul 10) memperbaiki suku x sin φ dan profilnya; untuk JTR, yang bekerja adalah penampang, panjang, dan letak gardu.", None),
    ])
    isi += tabel(["Kabel JTR NFA2X (Al)", "r (Ω/km)", "KHA (A)", f"ΔV pada {ind(L_JTR * 1000, 0)} m, {ind(I_JTR, 0)} A pf {ind(PF_JTR, 1)} (terpusat)", "ΔV bila beban merata", "Rugi (terpusat, kW)"],
                 [[nama, ind(r_, 3), str(kha), f"{ind(SQ3 * I_JTR * L_JTR * (r_ * PF_JTR + X_JTR * SIN_JTR), 1)} V ({ind(SQ3 * I_JTR * L_JTR * (r_ * PF_JTR + X_JTR * SIN_JTR) / 380 * 100, 2)} %)", f"{ind(SQ3 * I_JTR * L_JTR * (r_ * PF_JTR + X_JTR * SIN_JTR) / 380 * 50, 2)} %", ind(3 * I_JTR ** 2 * r_ * L_JTR / 1000, 2)] for nama, r_, kha in
                  [("3×35+25 mm²", 0.868, 125), ("3×50+35 mm²", 0.641, 154), ("3×70+50 mm²", 0.443, 196), ("3×95+70 mm²", 0.320, 242)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> menaikkan penampang dari 35 ke 70 mm² memangkas jatuh tegangan dan rugi hampir separuh; pada arus 100 A, kabel 35 mm² sudah di atas KHA-nya. Kolom 'beban merata' memperlihatkan mengapa rancangan JTR memakai faktor ½. Soal C6–C9, C12, dan C13 memakai Persamaan (5).")
    m += bagian(5, "m-jatuh", "Jatuh Tegangan dan Rugi<br>pada Penyulang dan JTR",
                "Dua keluhan pelanggan yang paling nyata, tegangan rendah dan tagihan rugi PLN, dihitung dengan rumus yang sama: arus dikali impedansi. Persamaan (5) menuliskannya untuk JTR tiga fasa, sambungan satu fasa, dan beban yang tersebar merata; Gambar 5 memperlihatkan mengapa beban merata hanya menjatuhkan separuh tegangan dan sepertiga rugi dari beban terpusat.",
                isi, "JATUH TEGANGAN DAN RUGI")

    # 06 — perancangan JTR
    isi = figure(6, "Jatuh tegangan dan rugi JTR terhadap penampang penghantar", f"Untuk JTR {ind(L_JTR * 1000, 0)} m berbeban {ind(I_JTR, 0)} A pf {ind(PF_JTR, 1)}, penampang 50 mm² ke atas memenuhi batas 5 %; setiap kenaikan penampang menekan rugi tetapi dengan manfaat yang makin kecil terhadap biaya kabel.", gambar6())
    isi += formula(6, "Pemilihan Penampang dan Nilai Rugi Energi", r"A_{min} = \dfrac{\sqrt{3}\,I\cos\varphi\,\rho\,L}{\Delta V_{izin}}\ (\text{x diabaikan}), \qquad E_{rugi} = P_{rugi,puncak}\times8760\times F_{rugi}, \qquad \text{biaya rugi/tahun} = E_{rugi}\times\text{harga kWh}",
                   rf"JTR tembaga {ind(L_MIN, 0)} m, {ind(I_MIN, 0)} A pf {ind(PF_MIN, 2)}, batas {ind(DV_MIN_PCT, 0)} % ({ind(DV_MIN_PCT / 100 * 380, 0)} V): \(A_{{min}} = \sqrt{{3}}\times{ind(I_MIN, 0)}\times{ind(PF_MIN, 2)}\times{RHO_CU}\times{ind(L_MIN, 0)}/{ind(DV_MIN_PCT / 100 * 380, 0)} = {ind(A_MIN, 1)}\) mm² → 35 mm² (periksa juga KHA ≥ {ind(I_MIN, 0)} A). Penyulang contoh: rugi puncak {ind(RUGI_PY, 1)} kW × 8760 × {ind(F_RUGI_PY, 1)} = {ind(E_RUGI_PY, 0)} kWh/tahun ≈ Rp {ind(E_RUGI_PY * 1200 / 1e6, 0)} juta pada Rp 1.200/kWh.",
                   "Penampang JTR dipilih dari tiga syarat: kuat hantar arus (KHA ≥ arus puncak dengan cadangan pertumbuhan), jatuh tegangan (≤ 4–5 % pada beban puncak), dan ekonomi rugi (biaya kabel yang lebih besar dibandingkan nilai rugi energi selama umur kabel, 20–30 tahun). Di jaringan padat, syarat jatuh tegangan yang biasanya menentukan; di jaringan panjang pedesaan, memindahkan/menambah gardu sering lebih murah daripada memperbesar kabel.",
                   [("\\rho", "Resistivitas penghantar: Cu 0,0175, Al 0,0283 Ω·mm²/m"), ("\\Delta V_{izin}", "Jatuh tegangan antar-saluran yang diizinkan (V)"), ("A_{min}", "Luas penampang minimum (mm²)")])
    isi += cards([
        ("📏", "Tiga Syarat", "KHA (termal), jatuh tegangan (kualitas), dan rugi ekonomis (biaya); ambil penampang standar terbesar dari ketiganya, lalu periksa hubung singkat (Modul 12).", None),
        ("💰", "Ekonomi Rugi", "Nilai sekarang rugi 25 tahun sering melebihi harga kabel; standar PLN memilih 70 mm² sebagai penampang utama JTR meski KHA-nya berlebih untuk banyak jurusan.", None),
        ("📍", "Panjang vs Penampang", "ΔV ∝ L/A: menggandakan panjang menuntut menggandakan penampang; batas praktis jurusan 300–500 m, selebihnya gardu sisipan.", None),
        ("🔢", "Pertumbuhan", "Rancang untuk beban 8–10 tahun ke depan (pertumbuhan 5–7 %/tahun ≈ 1,5–2×); kabel sulit diganti, trafo mudah ditukar.", None),
        ("⚖️", "Keseimbangan Fasa", "Rancangan tiga fasa empat kawat hanya berlaku bila beban seimbang; bagi SR ke fasa R-S-T bergiliran dan ukur ulang setelah pelanggan bertambah.", None),
        ("🏭", "Di Pabrik", "Aturan yang sama untuk kabel dari panel utama ke mesin: PUIL membatasi ΔV total 5 % (penerangan 3 %); hitung KHA, ΔV, dan rugi seperti JTR mini.", None),
    ])
    isi += tabel(["Pilihan rancangan JTR (300 m, 100 A pf 0,9)", "ΔV terpusat", "ΔV merata", "Rugi puncak (kW)", "E_rugi/th (F_rugi 0,3)", "Keterangan"],
                 [[nama, f"{ind(dv_, 1)} %", f"{ind(dv_ / 2, 1)} %", ind(rg, 2), f"{ind(rg * 8760 * 0.3, 0)} kWh", ket] for nama, dv_, rg, ket in
                  [(n_, SQ3 * 100 * 0.3 * (r_ * 0.9 + 0.08 * math.sqrt(1 - 0.81)) / 380 * 100, 3 * 100 ** 2 * r_ * 0.3 / 1000, k_) for n_, r_, k_ in
                   [("Al 35 mm²", 0.868, "KHA terlampaui, ΔV > 5 %"), ("Al 50 mm²", 0.641, "ΔV merata memenuhi"), ("Al 70 mm² (standar)", 0.443, "aman, rugi rendah"), ("Al 95 mm²", 0.320, "rugi terendah, biaya +30 %")]] +
                  [("Bagi dua jurusan 150 m (Al 50)", SQ3 * 50 * 0.15 * (0.641 * 0.9 + 0.08 * math.sqrt(1 - 0.81)) / 380 * 100, 2 * 3 * 50 ** 2 * 0.641 * 0.15 / 1000, "ΔV ¼, rugi ½: seringkali termurah")]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> membagi jurusan (atau menambah gardu) memangkas jatuh tegangan empat kali lipat dan rugi separuh dengan kabel yang sama; sebelum memperbesar penampang, periksa dulu apakah letak gardu dan pembagian jurusan sudah optimum. Soal C9 dan C15 memakai Persamaan (6).")
    m += bagian(6, "m-rancang", "Perancangan JTR:<br>Penampang, Panjang, dan Nilai Rugi",
                "Rancangan JTR adalah kompromi tiga syarat: penghantar harus kuat mengalirkan arus, tegangan di ujung harus tetap dalam batas, dan rugi energinya harus murah dibandingkan harga kabel. Persamaan (6) menghitung penampang minimum dari batas jatuh tegangan dan nilai rugi tahunan; Gambar 6 memperlihatkan kurva ΔV dan rugi terhadap penampang untuk JTR contoh.",
                isi, "PERANCANGAN JTR")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Kurva Beban Harian Gabungan: Faktor Beban, Rugi, Kebutuhan, dan Keragaman", "cvKurvaBeban",
                     [("sl_kb_rumah", "v_kb_rumah", "Jumlah rumah (1,3 kW puncak)", 0, 400, 10, 120, "120"), ("sl_kb_ruko", "v_kb_ruko", "Jumlah ruko (5 kW puncak)", 0, 60, 1, 10, "10"), ("sl_kb_ind", "v_kb_ind", "Beban industri (kW puncak)", 0, 500, 10, 100, "100")],
                     "btnKurvaBeban", "toggleKurvaBeban", "kurvaBebanInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Area bertumpuk adalah beban rumah (cyan), ruko (kuning), dan industri (ungu) jam demi jam; garis merah jumlahnya, garis hijau putus rata-ratanya. Kotak kanan menghitung keempat faktor Persamaan (2).<br>Amati: (1) <strong style=\"color:var(--cyan)\">Hanya rumah</strong>: puncak malam, faktor beban rendah (± 0,55). (2) Tambahkan ruko dan industri: puncak siang dan malam saling mengisi, faktor beban dan keragaman naik, puncak gabungan lebih kecil daripada jumlah puncak. (3) Readout memberi trafo minimum pada pf 0,9. Soal C1–C4 dan C11.")
    isi += anim_panel(2, "amber", r"Konfigurasi Radial, Loop, dan Spindle saat Gangguan: Isolasi Seksi dan Pemulihan", "cvKonfigurasi",
                      [("sl_kf_mode", "v_kf_mode", "Konfigurasi (0 radial, 1 loop, 2 spindle)", 0, 2, 1, 0, "radial"), ("sl_kf_gangguan", "v_kf_gangguan", "Letak gangguan (fraksi panjang)", 0.02, 0.98, 0.02, 0.55, "55 %"), ("sl_kf_seksi", "v_kf_seksi", "Jumlah seksi (LBS)", 1, 8, 1, 4, "4")],
                      "btnKonfigurasi", "toggleKonfigurasi", "konfigurasiInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Tiga tahap berulang: gangguan (PMT trip, semua padam), isolasi (LBS di kedua sisi seksi gangguan dibuka, hulu pulih), pemulihan (hilir dipasok dari GI B lewat titik NO atau dari GH lewat penyulang ekspres). Hijau dipasok normal, cyan/kuning dipasok dari arah lain, abu-abu padam.<br>Amati: (1) <strong style=\"color:var(--amber)\">Radial</strong>: hilir tetap padam sampai perbaikan. (2) Ganti ke loop/spindle: hanya seksi gangguan yang menunggu. (3) Tambah seksi: bagian yang padam lama mengecil; readout menghitung SAIDI per kejadian. Soal C10 dan C14.")
    isi += anim_panel(3, "green", r"Profil Tegangan dan Rugi Jaringan Tegangan Rendah: Panjang, Arus, Penampang, dan Sebaran Beban", "cvProfilJTR",
                      [("sl_jt_l", "v_jt_l", "Panjang jurusan (m)", 100, 600, 10, 300, "300"), ("sl_jt_i", "v_jt_i", "Arus pangkal (A)", 20, 200, 5, 80, "80"), ("sl_jt_a", "v_jt_a", "Penampang Al (mm²)", 16, 150, 1, 70, "70"), ("sl_jt_pf", "v_jt_pf", "Faktor daya", 0.7, 1.0, 0.01, 0.9, "0.90"), ("sl_jt_sebar", "v_jt_sebar", "Sebaran beban (0 terpusat ujung, 1 merata)", 0, 1, 0.05, 1, "1.00")],
                      "btnProfilJTR", "toggleProfilJTR", "profilJTRInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Hijau profil tegangan sepanjang jurusan JTR (beban rumah berkedip di bawahnya), merah putus pembanding bila seluruh beban terpusat di ujung, garis merah batas −10 % (342 V).<br>Amati: (1) <strong style=\"color:var(--green)\">Sebaran 1 (merata)</strong>: profil parabola, ΔV setengah dan rugi sepertiga dari terpusat. (2) Perpanjang jurusan ke 600 m atau kecilkan penampang ke 35 mm²: batas terlampaui. (3) Turunkan pf: suku x sin φ kecil di JTR, efeknya sedikit dibandingkan Modul 10. Soal C6, C8, C12, C13, dan C15.")
    isi += anim_panel(4, "pink", r"Indeks Keandalan: SAIFI, SAIDI, CAIDI, ASAI, dan ENS terhadap Seksi dan Pasokan Alternatif", "cvKeandalan",
                      [("sl_kd_freq", "v_kd_freq", "Gangguan per tahun", 1, 12, 1, 6, "6"), ("sl_kd_durasi", "v_kd_durasi", "Lama perbaikan (jam)", 0.5, 6, 0.5, 2.5, "2.5"), ("sl_kd_seksi", "v_kd_seksi", "Jumlah seksi", 1, 6, 1, 1, "1"), ("sl_kd_loop", "v_kd_loop", "Pasokan alternatif (0 tidak, 1 ya)", 0, 1, 1, 0, "tidak"), ("sl_kd_pel", "v_kd_pel", "Jumlah pelanggan", 500, 5000, 100, 2000, "2000")],
                      "btnKeandalan", "toggleKeandalan", "keandalanInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Batang berwarna indeks penyulang Anda, batang abu-abu pembanding radial satu seksi; isolasi seksi diasumsikan 0,5 jam dan beban rata-rata 1,2 MW.<br>Amati: (1) <strong style=\"color:var(--pink)\">Tambah seksi</strong>: SAIDI turun, SAIFI tetap (PMT tetap trip). (2) Nyalakan pasokan alternatif: hilir pulih 0,5 jam, SAIDI turun tajam. (3) Kurangi gangguan per tahun (pemangkasan pohon, arrester): satu-satunya cara menurunkan SAIFI. Soal C10 dan C14.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 cari komposisi rumah/ruko/industri yang memberi faktor beban ≥ 0,7, lalu hitung faktor ruginya dengan Persamaan (2). Pada Animasi 3 atur 300 m, 100 A, pf 0,9, sebaran 0, dan bandingkan ΔV tiap penampang dengan tabel Bagian 05. Pada Animasi 4 cari jumlah seksi minimum agar SAIDI < 5 jam pada 6 gangguan/tahun.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Dasar Sistem Distribusi",
                "Susun kurva beban gabungan, jalankan gangguan pada jaringan radial, loop, dan spindle, geser panjang dan penampang JTR, lalu atur seksi dan pasokan alternatif penyulang, sambil mengamati faktor beban, pemulihan pasokan, profil tegangan, dan indeks keandalan. Empat animasi ini memvisualkan Persamaan (2)–(5).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (kW, kVA, %, V, kWh, jam, mm²) dan jumlah desimal yang diminta.")
    isi += kode("Cell 1 — Faktor Kebutuhan, Keragaman, Beban, dan Rugi dari Kurva Beban", f'''import numpy as np

# kurva beban per jam (kW) tiga kelompok pelanggan pada satu gardu
rumah = 120*1.3*np.array([.35,.3,.28,.28,.32,.45,.7,.65,.5,.45,.45,.5,.55,.5,.48,.5,.6,.85,1,.98,.9,.75,.55,.42])
ruko  = 10*5.0*np.array([.15,.12,.1,.1,.1,.15,.3,.55,.8,.95,1,1,.95,.98,1,.95,.9,.85,.8,.7,.55,.35,.25,.2])
ind   = 100*np.array([.45,.45,.45,.45,.45,.5,.7,.95,1,1,1,.95,.85,1,1,1,.95,.7,.5,.45,.45,.45,.45,.45])
total = rumah + ruko + ind
P_maks, E = total.max(), total.sum()
F_B = E/(P_maks*24); F_rugi = 0.3*F_B + 0.7*F_B**2
F_krg = (rumah.max() + ruko.max() + ind.max())/P_maks
print(f"P_maks = {{P_maks:.1f}} kW pada jam {{total.argmax()}}:00; energi {{E:.0f}} kWh/hari")
print(f"faktor beban = {{F_B:.4f}}, faktor rugi = {{F_rugi:.4f}} (batas F_B^2 = {{F_B**2:.4f}} .. F_B = {{F_B:.4f}})")
print(f"faktor keragaman antar-kelompok = {{F_krg:.4f}}; trafo minimum pada pf 0,9 = {{P_maks/0.9:.1f}} kVA")

# contoh Persamaan 2
print(f"P_maks gardu = {ind(DF, 2).replace(",", ".")} x {ind(TERHUBUNG, 0)} = {{{ind(DF, 2).replace(",", ".")}*{ind(TERHUBUNG, 0)}:.2f}} kW; serempak = (80+60+45)/1.4 = {{(80+60+45)/1.4:.4f}} kW")
print(f"F_B bulanan = 36000/(100*720) = {{36000/(100*720):.4f}}; F_rugi(0,55) = {{0.3*0.55+0.7*0.55**2:.5f}}")''')
    isi += kode("Cell 2 — Pemilihan Trafo Gardu dan Pembebanan", f'''import numpy as np

STANDAR = np.array([25, 50, 100, 160, 200, 250, 315, 400, 630])
def pilih_trafo(n, d_kw, F_krg, pf, beban_awal_maks=0.7):
    P = n*d_kw/F_krg; S = P/pf
    S_trafo = STANDAR[STANDAR >= S/beban_awal_maks][0]
    return P, S, S_trafo, S/S_trafo*100

for n, d, fk, pf in [(80, 1.3, 2.0, 0.9), (150, 1.3, 2.6, 0.9), (240, 1.3, 2.5, 0.9), (20, 5.0, 1.6, 0.85)]:
    P, S, St, pemb = pilih_trafo(n, d, fk, pf)
    print(f"{{n:4d}} pelanggan x {{d}} kW, F_krg {{fk}}: P = {{P:.2f}} kW, S = {{S:.2f}} kVA -> trafo {{St}} kVA (pembebanan awal {{pemb:.1f}} %)")

# gardu contoh {ind(S_TRAFO, 0)} kVA berbeban {ind(P_TRAFO, 0)} kW pf {ind(PF_TRAFO, 1)}
S = {ind(P_TRAFO, 0)}/{ind(PF_TRAFO, 1).replace(",", ".")}
print(f"S beban = {{S:.2f}} kVA, pembebanan = {{S/{ind(S_TRAFO, 0)}*100:.2f}} %, I_TR = {{S*1e3/(np.sqrt(3)*400):.1f}} A, I_TM = {{S*1e3/(np.sqrt(3)*20e3):.2f}} A")
P0, Pk = 0.65, 3.25   # rugi besi dan tembaga trafo 250 kVA (kW)
for pemb in [0.3, 0.5, 0.7, 0.9, 1.1]:
    print(f"pembebanan {{pemb*100:3.0f}} %: rugi trafo = {{P0 + Pk*pemb**2:.2f}} kW, efisiensi = {{(250*pemb*0.9)/(250*pemb*0.9 + P0 + Pk*pemb**2)*100:.2f}} %")''')
    isi += kode("Cell 3 — Jatuh Tegangan dan Rugi JTR: Terpusat, Merata, dan Bertahap", f'''import numpy as np
import matplotlib.pyplot as plt

KABEL = {{35: 0.868, 50: 0.641, 70: 0.443, 95: 0.320}}   # r (ohm/km) NFA2X Al; x = 0.08
x = 0.08
def dV_LL(I, L_km, r, pf): return np.sqrt(3)*I*L_km*(r*pf + x*np.sqrt(1 - pf**2))   # Persamaan 5

I, L, pf = {ind(I_JTR, 0)}, {ind(L_JTR, 2).replace(",", ".")}, {ind(PF_JTR, 1).replace(",", ".")}
for A, r in KABEL.items():
    dv = dV_LL(I, L, r, pf)
    print(f"Al {{A:3d}} mm2: dV terpusat = {{dv:6.2f}} V ({{dv/380*100:.2f}} %), merata = {{dv/2/380*100:.2f}} %, rugi terpusat = {{3*I**2*r*L/1e3:.3f}} kW, merata = {{I**2*r*L/1e3:.3f}} kW")
print(f"SR 1 fasa 2x10 mm2 40 m, 25 A: dV = {{2*25*1.83*0.04:.3f}} V = {{2*25*1.83*0.04/220*100:.3f}} %")

# beban bertahap: 50/40/30 A pada 80/160/240 m, kabel 50 mm2
r = KABEL[50]; arus = [50, 40, 30]; ruas = [0.08, 0.08, 0.08]
dv = 0; V = [380.0]
for k in range(3):
    I_ruas = sum(arus[k:]); dv += np.sqrt(3)*I_ruas*r*ruas[k]; V.append(380 - dv)
    print(f"ruas {{k+1}}: I = {{I_ruas}} A, dV kumulatif = {{dv:.3f}} V")
plt.figure(figsize=(7, 3.5)); plt.plot([0, 80, 160, 240], V, 'o-'); plt.axhline(380*0.95, ls=':', color='r', label='-5 %')
plt.xlabel('m'); plt.ylabel('V antar-saluran'); plt.legend(); plt.grid(True); plt.title('JTR beban bertahap'); plt.show()''')
    isi += kode("Cell 4 — Penyulang Beban Merata, Rugi Energi, Keandalan, dan Penampang Minimum", f'''import numpy as np

# penyulang 20 kV beban merata (Persamaan 5)
I, L, r, x, pf = {ind(I_M, 0)}, {ind(L_M, 0)}, 0.4, 0.35, {ind(PF_M, 1).replace(",", ".")}
Vf = 20e3/np.sqrt(3)
dV = 0.5*I*L*(r*pf + x*np.sqrt(1 - pf**2))
print(f"dV merata = {{dV:.2f}} V = {{dV/Vf*100:.4f}} % (terpusat {{2*dV/Vf*100:.4f}} %)")
I2, L2 = {ind(I_PY, 0)}, {ind(L_PY, 0)}
rugi = I2**2*r*L2/1e3
print(f"rugi merata {{L2}} km {{I2}} A = {{rugi:.2f}} kW (terpusat {{3*rugi:.2f}} kW); E_rugi = {{rugi*8760*{ind(F_RUGI_PY, 1).replace(",", ".")}:.0f}} kWh/th = Rp {{rugi*8760*{ind(F_RUGI_PY, 1).replace(",", ".")}*1200/1e6:.1f}} juta")

# keandalan (Persamaan 3)
N, plg_kali, plg_jam = {PEL}, {ind(PEL_KALI, 0)}, {ind(PEL_JAM, 0)}
SAIFI, SAIDI = plg_kali/N, plg_jam/N
print(f"SAIFI = {{SAIFI:.4f}} kali, SAIDI = {{SAIDI:.4f}} jam, CAIDI = {{SAIDI/SAIFI:.4f}} jam, ASAI = {{(1 - SAIDI/8760)*100:.4f}} %")
print(f"ENS = {ind(P_MW_ENS, 1).replace(",", ".")} MW x {ind(FB_ENS, 2).replace(",", ".")} x SAIDI = {{{ind(P_MW_ENS, 1).replace(",", ".")}*{ind(FB_ENS, 2).replace(",", ".")}*SAIDI:.4f}} MWh/tahun")

# penampang minimum (Persamaan 6)
I3, L3, pf3, dv_izin, rho = {ind(I_MIN, 0)}, {ind(L_MIN, 0)}, {ind(PF_MIN, 2).replace(",", ".")}, {ind(DV_MIN_PCT, 0)}/100*380, 0.0175
A = np.sqrt(3)*I3*pf3*rho*L3/dv_izin
print(f"A_min (Cu) = {{A:.4f}} mm2 -> standar 35 mm2; Al ({{0.0283}}): {{A*0.0283/0.0175:.2f}} mm2 -> 50 mm2")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: P_maks {ind(P_MAKS, 1)} kW, serempak {ind(P_SEREMPAK, 1)} kW, F_rugi {ind(LOSSF, 4)}, trafo {ind(S_GARDU, 1)} kVA → 100 kVA, ΔV JTR {ind(DV_JTR_PCT, 2)} %, SAIDI {ind(SAIDI, 2)} jam, A_min {ind(A_MIN, 1)} mm². Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: faktor-faktor beban dari kurva harian, pemilihan trafo dan pembebanan gardu, jatuh tegangan JTR terpusat, merata, dan bertahap, serta penyulang beban merata, keandalan, dan penampang minimum. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "T. Gönen", "Electric Power Distribution Engineering", ", Third Edition. CRC Press, 2014.", "Bab 2 (karakteristik beban: faktor kebutuhan, keragaman, beban, rugi), Bab 4–5 (distribusi primer dan sekunder, konfigurasi), Bab 9 (regulasi tegangan JTR): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab sistem distribusi: struktur, gardu, jatuh tegangan penyulang, dan rugi; pustaka utama RPS.")
    refs += pm_ref(3, "violet", "168,85,247", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 14 (sistem distribusi: konfigurasi, trafo distribusi, keandalan, dan indeks SAIFI/SAIDI).")
    refs += pm_ref(4, "green", "0,224,158", "Zuhal", "Dasar Tenaga Listrik dan Elektronika Daya", ". Gramedia, Jakarta.", "Bab jaringan distribusi dan gardu dalam bahasa mata kuliah ini; istilah JTM, JTR, gardu distribusi, dan SR.")
    refs += pm_ref(5, "pink", "236,72,153", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 5–6 (sistem distribusi dan keandalan) sebagai pengantar konseptual tanpa matematika berat.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk struktur sistem distribusi, karakteristik beban, konfigurasi dan keandalan, gardu distribusi, serta jatuh tegangan dan rugi JTR. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> SPLN 1:1995 (tegangan standar), SPLN 72:1987 (spesifikasi desain JTM dan JTR), dan SPLN 59:1985 (keandalan pada sistem distribusi 20 kV) memuat batas tegangan, ukuran kabel, dan definisi SAIDI/SAIFI yang dipakai PLN; IEEE Std 1366 mendefinisikan indeks keandalan distribusi secara internasional; PUIL 2011 membatasi jatuh tegangan instalasi pelanggan. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul {NOMOR} — {JUDUL_PANJANG} · Teknik Tenaga Listrik · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = f'''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">F_B = E/(P_maks·T)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">ΔV = √3·I·L·(r cos φ + x sin φ)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S = n·d/(F_krg·pf)</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">SAIDI = Σ N_i t_i / N</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">A_min = √3·I·cos φ·ρL/ΔV</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Dasar Sistem</em><br>Distribusi</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar faktor kebutuhan, keragaman, beban, dan rugi, pembebanan dan pemilihan trafo, jatuh tegangan JTR tiga fasa, satu fasa, dan bertahap, rugi penyulang beban merata, rugi energi tahunan, SAIDI dan ENS, serta penampang minimum penghantar. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Ciri utama jaringan distribusi <strong>radial</strong> adalah...",
     ["Setiap beban dipasok dari dua arah sehingga tidak pernah padam", "Memerlukan gardu hubung dan penyulang ekspres", "Setiap beban dipasok lewat satu jalur tanpa alternatif; paling murah dan sederhana, tetapi satu gangguan memadamkan seluruh hilirnya", "Hanya dipakai pada jaringan tegangan rendah"],
     "Jaringan radial"),
    ("Pada sistem <strong>loop (ring)</strong>, titik <em>normally open</em> (NO) berfungsi...",
     ["Memisahkan dua arah pasokan pada operasi normal, dan ditutup saat gangguan agar seksi di hilir gangguan dipasok dari arah lain", "Memutus penyulang secara otomatis saat hubung singkat", "Menghubungkan JTM ke JTR", "Mengatur tegangan seperti regulator"],
     "Titik NO pada loop"),
    ("Konfigurasi <strong>spindle</strong> pada jaringan kabel tanah 20 kV dicirikan oleh...",
     ["Semua penyulang berakhir di pelanggan tanpa cadangan", "Satu penyulang membentuk lingkar penuh kembali ke GI yang sama", "Jaringan tegangan rendah yang bertautan dari beberapa trafo", "Beberapa penyulang kerja menuju gardu hubung ditambah satu penyulang ekspres tanpa beban sebagai cadangan"],
     "Konfigurasi spindle"),
    ("Tegangan standar jaringan distribusi di Indonesia adalah...",
     ["JTM 6 kV dan JTR 220/127 V", "JTM 20 kV (tiga fasa) dan JTR 380/220 V (tiga fasa empat kawat)", "JTM 70 kV dan JTR 400/230 V", "JTM 150 kV dan JTR 380/220 V"],
     "Tegangan JTM dan JTR"),
    ("<strong>Faktor kebutuhan</strong> (demand factor) didefinisikan sebagai...",
     ["Energi dibagi daya maksimum kali waktu", "Jumlah kebutuhan maksimum individu dibagi kebutuhan serempak", "Kebutuhan maksimum dibagi beban terhubung total; nilainya ≤ 1 karena tidak semua peralatan menyala bersamaan", "Rugi rata-rata dibagi rugi puncak"],
     "Faktor kebutuhan"),
    ("<strong>Faktor keragaman</strong> (diversity factor) bernilai...",
     ["≥ 1, yaitu jumlah kebutuhan maksimum individu dibagi kebutuhan maksimum serempak, karena puncak tiap pelanggan tidak bersamaan", "≤ 1, yaitu kebutuhan serempak dibagi beban terhubung", "Selalu tepat 1 untuk pelanggan rumah tangga", "Negatif bila beban bersifat kapasitif"],
     "Faktor keragaman"),
    ("Hubungan <strong>faktor rugi</strong> (loss factor) dengan faktor beban F_B adalah...",
     ["Faktor rugi = F_B", "Faktor rugi = 1/F_B", "Faktor rugi = 1 − F_B", "F_B² ≤ faktor rugi ≤ F_B, karena rugi sebanding I²; rumus empiris 0,3F_B + 0,7F_B²"],
     "Faktor rugi"),
    ("<strong>SAIDI</strong> adalah...",
     ["Jumlah gangguan per tahun dibagi panjang penyulang", "Σ (jumlah pelanggan padam × lama padam) dibagi jumlah pelanggan yang dilayani: rata-rata jam padam per pelanggan per tahun", "Energi tak tersalurkan per tahun", "Rata-rata lama tiap gangguan"],
     "SAIDI"),
    ("Untuk beban yang tersebar <strong>merata</strong> sepanjang penyulang, dibandingkan beban yang sama terpusat di ujung...",
     ["Jatuh tegangan dan rugi sama besar", "Jatuh tegangan dua kali dan rugi tiga kali", "Jatuh tegangan ke ujung setengahnya dan rugi sepertiganya, karena arus berkurang linear sepanjang penyulang", "Jatuh tegangan sepertiga dan rugi setengah"],
     "Beban merata"),
    ("Fungsi <strong>gardu distribusi</strong> adalah...",
     ["Menurunkan 20 kV ke 400/231 V dengan trafo 25–630 kVA bertap tanpa beban, dilengkapi fuse cut-out dan arrester di sisi TM serta NH-fuse per jurusan di sisi TR", "Menaikkan 20 kV ke 150 kV untuk transmisi", "Menghubungkan dua GI lewat penyulang ekspres", "Mengompensasi daya reaktif penyulang"],
     "Gardu distribusi"),
]

COMP_EZ_LABELS = ["Kebutuhan maksimum dari faktor kebutuhan", "Kebutuhan serempak dari faktor keragaman", "Faktor beban bulanan", "Faktor rugi empiris", "Pembebanan trafo (%)",
                  "ΔV JTR tiga fasa √3·I·L·(r cos φ + x sin φ)", "ΔV % sambungan satu fasa (pergi–pulang)", "Rugi penyulang beban merata I²R", "Rugi energi tahunan", "SAIDI"]
COMP_HARD_LABELS = ["kVA serempak gardu (pemilihan trafo)", "ΔV JTR dua beban bertahap", "ΔV % beban merata penyulang 20 kV",
                    "Energi tak tersalurkan (ENS)", "Penampang minimum penghantar"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}
N_R, D_R, FD_R, PF_R = 240, 1.3, 2.5, 0.9
N_K, D_K, FD_K, PF_K = 20, 5.0, 1.6, 0.85
P_R = N_R * D_R / FD_R
P_K = N_K * D_K / FD_K
S_R, S_K = P_R / PF_R, P_K / PF_K
S_TOT = S_R + S_K
TRAFO_F = 250
PEMB_F = S_TOT / TRAFO_F * 100
N_JUR = 4
N_R_JUR = N_R // N_JUR
L_JUR = 0.32
I_JUR = N_R_JUR * D_R / FD_R * 1000 / (SQ3 * 380 * PF_R)
R70, XF = 0.443, 0.08
SINR = math.sqrt(1 - PF_R ** 2)
DV_JUR = 0.5 * SQ3 * I_JUR * L_JUR * (R70 * PF_R + XF * SINR)
DV_JUR_PCT = DV_JUR / 380 * 100
DV_JUR_50 = 0.5 * SQ3 * I_JUR * L_JUR * (0.641 * PF_R + XF * SINR) / 380 * 100
RUGI_JUR = I_JUR ** 2 * R70 * L_JUR / 1000
FREQ_F, DUR_F, ISO_F = 4, 2.5, 0.5
SAIDI_RAD = FREQ_F * DUR_F
SAIDI_LOOP = FREQ_F * (ISO_F + (DUR_F - ISO_F) / 4)   # 4 seksi, hanya seksi gangguan menunggu
P_AVG_F = S_TOT * 0.9 * 0.45 / 1000                     # MW rata-rata (F_B 0,45)
ENS_RAD, ENS_LOOP = P_AVG_F * SAIDI_RAD, P_AVG_F * SAIDI_LOOP

FQ_JUDUL = [
    f"Hitung kebutuhan serempak perumahan {N_R} rumah + {N_K} ruko dan pilih trafo gardunya: cukupkah satu gardu 250 kVA?",
    f"Rancang jurusan JTR terpanjang ({ind(L_JUR * 1000, 0)} m, {N_R_JUR} rumah merata): arus, jatuh tegangan, rugi, dan penampang kabel yang memenuhi 5 %.",
    "Penyulang 20 kV pemasok: radial berseksi atau loop? Hitung SAIDI dan ENS keduanya, lalu tentukan yang layak untuk kawasan ini.",
]
FQ_RINGKAS = [
    f"Kebutuhan maksimum per rumah {ind(D_R, 1)} kW dengan F_krg {ind(FD_R, 1)} pf {ind(PF_R, 1)}, ruko {ind(D_K, 0)} kW F_krg {ind(FD_K, 1)} pf {ind(PF_K, 2)}: P dan S tiap kelompok (Persamaan 2 dan 4), jumlah S, pembebanan trafo 250 kVA dan ruang pertumbuhan 6 %/tahun; pertimbangkan dua gardu.",
    f"Jurusan {ind(L_JUR * 1000, 0)} m dengan {N_R_JUR} rumah tersebar merata: arus pangkal dari kebutuhan serempak, ΔV merata = ½·√3·I·L·(r cos φ + x sin φ) (Persamaan 5) untuk NFA2X 3×50+35 dan 3×70+50; rugi merata I²R; bandingkan dengan batas 5 % dan KHA; pertimbangkan membagi jurusan.",
    f"Radial 1 seksi vs loop 4 seksi dengan {FREQ_F} gangguan/tahun, perbaikan {ind(DUR_F, 1)} jam, isolasi {ind(ISO_F, 1)} jam: SAIDI, SAIFI (sama), CAIDI, ENS (Persamaan 3) pada beban rata-rata; sasaran SAIDI < 5 jam; nilai ENS vs biaya penyulang kedua/LBS.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Pengembang membangun perumahan <b>{N_R} rumah (daya 1300 VA)</b> dan <b>{N_K} ruko (5500 VA)</b>. Dari data PLN, kebutuhan maksimum per rumah {ind(D_R, 1)} kW dengan faktor keragaman antar-rumah {ind(FD_R, 1)} pada pf {ind(PF_R, 1)}; per ruko {ind(D_K, 0)} kW dengan faktor keragaman {ind(FD_K, 1)} pada pf {ind(PF_K, 2)}. Hitung kebutuhan serempak (kW dan kVA) tiap kelompok dan totalnya (Persamaan 2 dan 4), lalu periksa pembebanan bila dipasang satu gardu 250 kVA. Dengan pertumbuhan 6 %/tahun, berapa tahun gardu itu bertahan sebelum 80 %? Bahas apakah satu gardu di tengah atau dua gardu 160 kVA lebih baik, mengingat batas panjang jurusan JTR.",
            ["P = n·d/F_krg", "S = P/pf", "pembebanan = S/S_trafo"],
            "Kebutuhan serempak total dan pembebanan trafo 250 kVA kira-kira...",
            [f"{ind(N_R * D_R + N_K * D_K, 0)} kW → {ind((N_R * D_R + N_K * D_K) / 0.9, 0)} kVA: trafo 250 kVA jauh tidak cukup", f"{ind(P_R + P_K, 1)} kW → {ind(S_TOT, 1)} kVA: pembebanan {ind(PEMB_F, 0)} %, cukup sekarang tetapi hampir tanpa ruang tumbuh", f"{ind(P_R, 1)} kW → {ind(S_R, 1)} kVA: ruko tidak perlu dihitung", f"{ind(P_R + P_K, 1)} kW → pembebanan {ind((P_R + P_K) / TRAFO_F * 100, 0)} % (kW langsung dibagi kVA)"],
            f"✅ Tepat! Rumah: \\(P = {N_R}\\times{ind(D_R, 1)}/{ind(FD_R, 1)} = {ind(P_R, 1)}\\) kW → \\({ind(S_R, 1)}\\) kVA; ruko: \\({N_K}\\times{ind(D_K, 0)}/{ind(FD_K, 1)} = {ind(P_K, 1)}\\) kW → \\({ind(S_K, 1)}\\) kVA; total {ind(S_TOT, 1)} kVA = {ind(PEMB_F, 0)} % dari 250 kVA. Pertumbuhan 6 %/tahun mencapai 80 % (200 kVA) dalam ≈ {ind(math.log(200 / S_TOT) / math.log(1.06), 1)} tahun bila belum, jadi hampir langsung; dua gardu 160 kVA (masing-masing ± {ind(S_TOT / 2, 0)} kVA, {ind(S_TOT / 2 / 160 * 100, 0)} %) memberi ruang tumbuh dan jurusan JTR lebih pendek.",
            "❌ Jangan menjumlahkan daya terpasang (VA) atau puncak individu: bagi dengan faktor keragaman, lalu ubah ke kVA dengan pf tiap kelompok sebelum membandingkan dengan daya trafo.",
            "Petunjuk: (1) Hitung P dan S rumah dan ruko. (2) Jumlahkan, hitung pembebanan 250 kVA dan tahun sampai 80 %. (3) Bandingkan satu gardu vs dua gardu dari sisi kVA dan panjang JTR.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Gardu melayani {N_JUR} jurusan JTR; jurusan terpanjang <b>{ind(L_JUR * 1000, 0)} m</b> memasok <b>{N_R_JUR} rumah</b> yang tersebar merata. Hitung arus pangkal jurusan dari kebutuhan serempak {N_R_JUR} rumah (Persamaan 4, pf {ind(PF_R, 1)}), lalu jatuh tegangan sampai ujung untuk beban merata (Persamaan 5, faktor ½) dengan kabel NFA2X 3×50+35 (r = 0,641) dan 3×70+50 (r = {ind(R70, 3)} Ω/km, x = {ind(XF, 2)}). Hitung pula rugi daya jurusan (faktor ⅓) dan bandingkan dengan batas rancangan 5 % dan KHA. Bila tidak memenuhi, usulkan pembagian jurusan atau penampang lain, dan taksir rugi energi tahunannya dengan faktor rugi 0,3.",
            ["I = P/(√3·V·pf)", "ΔV_merata = ½·√3·I·L·(r cos φ + x sin φ)", "rugi_merata = I²R"],
            f"Arus pangkal dan jatuh tegangan jurusan {ind(L_JUR * 1000, 0)} m dengan kabel 3×70+50 kira-kira...",
            [f"{ind(I_JUR * 2, 0)} A dan {ind(DV_JUR_PCT * 2, 1)} % (beban dianggap terpusat di ujung)", f"{ind(I_JUR, 0)} A dan {ind(DV_JUR_PCT * 2, 1)} %: melampaui 5 %", f"{ind(N_R_JUR * D_R * 1000 / (SQ3 * 380 * PF_R), 0)} A dan {ind(DV_JUR_PCT * N_R_JUR * D_R / (N_R_JUR * D_R / FD_R), 1)} % (tanpa faktor keragaman)", f"{ind(I_JUR, 0)} A dan {ind(DV_JUR_PCT, 2)} % (beban merata): memenuhi 5 %, rugi ≈ {ind(RUGI_JUR, 2)} kW; kabel 50 mm² memberi {ind(DV_JUR_50, 2)} %"],
            f"✅ Tepat! \\(P = {N_R_JUR}\\times{ind(D_R, 1)}/{ind(FD_R, 1)} = {ind(N_R_JUR * D_R / FD_R, 1)}\\) kW → \\(I = {ind(N_R_JUR * D_R / FD_R, 1)}\\times10^3/(\\sqrt{{3}}\\times380\\times{ind(PF_R, 1)}) = {ind(I_JUR, 1)}\\) A. Kabel 70: \\(\\Delta V = \\tfrac{{1}}{{2}}\\sqrt{{3}}\\times{ind(I_JUR, 1)}\\times{ind(L_JUR, 2)}\\times({ind(R70, 3)}\\times{ind(PF_R, 1)} + {ind(XF, 2)}\\times{ind(SINR, 3)}) = {ind(DV_JUR, 2)}\\) V = {ind(DV_JUR_PCT, 2)} %; kabel 50: {ind(DV_JUR_50, 2)} % (juga memenuhi). Rugi merata = \\({ind(I_JUR, 1)}^2\\times{ind(R70, 3)}\\times{ind(L_JUR, 2)} = {ind(RUGI_JUR, 2)}\\) kW → \\({ind(RUGI_JUR * 8760 * 0.3, 0)}\\) kWh/tahun. Standar PLN tetap 70 mm² karena pertumbuhan beban dan rugi 25 tahun.",
            "❌ Pakai kebutuhan serempak (dengan faktor keragaman), bukan daya terpasang, untuk arus pangkal; dan pakai faktor ½ karena beban tersebar merata sepanjang jurusan.",
            "Petunjuk: (1) Hitung P serempak dan I pangkal. (2) Hitung ΔV merata untuk 50 dan 70 mm², bandingkan dengan 5 % dan KHA. (3) Hitung rugi merata dan energi rugi tahunan; bahas pembagian jurusan.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Penyulang 20 kV yang memasok kawasan ini mengalami rata-rata <b>{FREQ_F} gangguan per tahun</b> dengan lama perbaikan {ind(DUR_F, 1)} jam. Dua pilihan: (a) radial tanpa seksi, semua pelanggan menunggu perbaikan; (b) loop 4 seksi dengan titik NO ke penyulang tetangga: isolasi {ind(ISO_F, 1)} jam, setelah itu hanya seksi gangguan (¼ pelanggan) yang menunggu sisa perbaikan. Hitung SAIDI, SAIFI, dan CAIDI keduanya (Persamaan 3), energi tak tersalurkan pada beban rata-rata {ind(P_AVG_F * 1000, 0)} kW (F_B 0,45), dan bandingkan dengan sasaran SAIDI < 5 jam. Bahas biaya: LBS bermotor dan penyulang penghubung vs nilai ENS dan kerugian ruko/pelanggan.",
            ["SAIDI = Σ N_i t_i / N", "SAIFI tetap = gangguan/tahun", "ENS = P_rata × SAIDI"],
            "SAIDI radial dan loop 4 seksi pada 4 gangguan/tahun kira-kira...",
            [f"Radial {ind(SAIDI_RAD, 1)} jam vs loop {ind(SAIDI_LOOP, 2)} jam; SAIFI keduanya {FREQ_F} kali; ENS {ind(ENS_RAD, 2)} → {ind(ENS_LOOP, 2)} MWh/tahun", f"Radial {ind(SAIDI_RAD, 1)} jam vs loop 0 jam karena loop tidak pernah padam", f"Radial {ind(SAIDI_RAD / 4, 1)} jam vs loop {ind(SAIDI_RAD, 1)} jam", f"Radial {ind(SAIDI_RAD, 1)} jam vs loop {ind(SAIDI_LOOP, 2)} jam, dan SAIFI loop turun menjadi 1 kali"],
            f"✅ Tepat! Radial: \\(SAIDI = {FREQ_F}\\times{ind(DUR_F, 1)} = {ind(SAIDI_RAD, 1)}\\) jam. Loop 4 seksi: tiap gangguan semua pelanggan padam {ind(ISO_F, 1)} jam, lalu ¼ pelanggan padam \\({ind(DUR_F, 1)} - {ind(ISO_F, 1)} = {ind(DUR_F - ISO_F, 1)}\\) jam lagi → per gangguan \\({ind(ISO_F, 1)} + {ind(DUR_F - ISO_F, 1)}/4 = {ind(ISO_F + (DUR_F - ISO_F) / 4, 3)}\\) jam, setahun {ind(SAIDI_LOOP, 2)} jam (< 5 jam, memenuhi). SAIFI tetap {FREQ_F} (PMT tetap trip; menurunkannya perlu recloser/pencegahan), CAIDI {ind(DUR_F, 1)} → {ind(SAIDI_LOOP / FREQ_F, 2)} jam. ENS: \\({ind(P_AVG_F, 3)}\\times{ind(SAIDI_RAD, 1)} = {ind(ENS_RAD, 2)}\\) → {ind(ENS_LOOP, 2)} MWh/tahun; nilai kWh-nya kecil, tetapi kerugian ruko dan citra layanan yang membenarkan LBS dan penyulang penghubung.",
            "❌ Loop tidak menghilangkan pemadaman (SAIFI tetap), ia mempersingkatnya: semua pelanggan padam selama isolasi, lalu hanya seksi gangguan yang menunggu perbaikan.",
            "Petunjuk: (1) Hitung SAIDI radial dan loop per gangguan lalu per tahun. (2) SAIFI, CAIDI, dan ENS keduanya. (3) Bandingkan dengan sasaran dan bahas biaya-manfaatnya.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">S = n·d/(F_krg·pf)</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">ΔV_merata = ½ ΔV_terpusat</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">SAIDI &lt; 5 jam?</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">250 kVA?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Perumahan Baru<br><em>Menunggu Listrik</em></h1>
    <p class="hero-sub">Sebuah perumahan {N_R} rumah dan {N_K} ruko akan disambung: berapa kVA gardunya, kabel apa untuk jurusan terpanjangnya, dan penyulang seperti apa yang memasoknya? Terapkan kosakata Pertemuan {PERTEMUAN} — faktor keragaman, pembebanan trafo, jatuh tegangan beban merata, SAIDI dan ENS — untuk merancangnya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">{N_R} Rumah + {N_K} Ruko —<br>Gardu, JTR, dan Penyulang Pemasoknya</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PERANCANGAN DISTRIBUSI KAWASAN PERUMAHAN</div>
    <p>
      Sebuah pengembang membangun <strong style="color:var(--amber)">perumahan {N_R} rumah (1300 VA)</strong> dan <strong style="color:var(--amber)">{N_K} ruko (5500 VA)</strong> di pinggiran kota, dipasok dari <strong style="color:var(--cyan)">penyulang 20 kV</strong> yang melewati jalan utama. Data PLN setempat: kebutuhan maksimum {ind(D_R, 1)} kW/rumah (F_krg {ind(FD_R, 1)}, pf {ind(PF_R, 1)}) dan {ind(D_K, 0)} kW/ruko (F_krg {ind(FD_K, 1)}, pf {ind(PF_K, 2)}); pertumbuhan 6 %/tahun.
    </p>
    <p style="margin-top:12px">
      Tata letak menuntut {N_JUR} jurusan JTR dari gardu, yang terpanjang <strong style="color:var(--pink)">{ind(L_JUR * 1000, 0)} m dengan {N_R_JUR} rumah merata</strong>. Penyulang pemasok saat ini radial tanpa seksi dengan {FREQ_F} gangguan/tahun berdurasi {ind(DUR_F, 1)} jam; pengembang meminta jaminan <strong style="color:var(--pink)">SAIDI &lt; 5 jam</strong> untuk kawasan rukonya.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung trafo, kabel jurusan, dan konfigurasi penyulangnya <strong style="color:var(--cyan)">sebelum</strong> PLN menerbitkan rencana sambungan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"{N_R} rumah × {ind(D_R, 1)} kW, F_krg {ind(FD_R, 1)}, pf {ind(PF_R, 1)}", "14,165,233", "cyan")}
{kartu(f"{N_K} ruko × {ind(D_K, 0)} kW, F_krg {ind(FD_K, 1)}, pf {ind(PF_K, 2)}", "14,165,233", "cyan")}
{kartu(f"Jurusan terpanjang {ind(L_JUR * 1000, 0)} m, {N_R_JUR} rumah merata", "14,165,233", "cyan")}
{kartu(f"Penyulang: {FREQ_F} gangguan/th × {ind(DUR_F, 1)} jam; sasaran SAIDI < 5 jam", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Setiap angka rancangan distribusi berawal dari satu pertanyaan: berapa beban yang <strong>benar-benar</strong> ditarik serempak? Dari situ lahir ukuran trafo, penampang kabel, dan bentuk penyulang. Forum ini mengajak Anda menjalani ketiganya berurutan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Denah pasokan kawasan: penyulang 20 kV → gardu {TRAFO_F} kVA → {N_JUR} jurusan JTR; profil tegangan jurusan terpanjang ({ind(L_JUR * 1000, 0)} m, beban merata) untuk kabel 50 dan 70 mm²</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Perumahan {N_R} rumah (1300 VA; {ind(D_R, 1)} kW/rumah, F_krg {ind(FD_R, 1)}, pf {ind(PF_R, 1)}) + {N_K} ruko (5500 VA; {ind(D_K, 0)} kW/ruko, F_krg {ind(FD_K, 1)}, pf {ind(PF_K, 2)}), pertumbuhan 6 %/tahun; {N_JUR} jurusan JTR, terpanjang {ind(L_JUR * 1000, 0)} m dengan {N_R_JUR} rumah merata (NFA2X 50 atau 70 mm²); penyulang 20 kV radial {FREQ_F} gangguan/th × {ind(DUR_F, 1)} jam vs loop 4 seksi (isolasi {ind(ISO_F, 1)} jam); sasaran SAIDI < 5 jam."
FORUM_CHIPS_LMS = [f"rumah = {N_R} × {ind(D_R, 1)} kW, F_krg {ind(FD_R, 1)}", f"ruko = {N_K} × {ind(D_K, 0)} kW, F_krg {ind(FD_K, 1)}", f"jurusan = {ind(L_JUR * 1000, 0)} m, {N_R_JUR} rumah merata", f"penyulang = {FREQ_F} gangguan/th × {ind(DUR_F, 1)} jam"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Denah pasokan perumahan dan profil tegangan jurusan JTR terpanjang (Pertemuan 12)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // kiri: denah
  const dx = 20, dw = Math.min(300, W * 0.42);
  ctx.strokeStyle = 'rgba(0,229,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(dx, 30); ctx.lineTo(dx + dw, 30); ctx.stroke();
  ctx.fillStyle = 'rgba(0,229,255,.9)'; ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'left'; ctx.fillText('penyulang 20 kV', dx, 22);
  const gx = dx + dw * 0.5; ctx.strokeStyle = 'rgba(168,85,247,.9)'; ctx.beginPath(); ctx.moveTo(gx, 30); ctx.lineTo(gx, 62); ctx.stroke();
  ctx.fillStyle = '#0b1220'; ctx.strokeStyle = 'rgba(168,85,247,.95)'; ctx.lineWidth = 1.6; ctx.fillRect(gx - 34, 62, 68, 26); ctx.strokeRect(gx - 34, 62, 68, 26);
  ctx.fillStyle = 'rgba(168,85,247,.95)'; ctx.textAlign = 'center'; ctx.fillText('gardu 250 kVA', gx, 79);
  const jur = [[-1.0, 0.7, '80 m'], [-0.35, 1.0, '200 m'], [0.35, 1.0, '250 m'], [1.0, 0.6, '320 m ← terpanjang']];
  jur.forEach(([dir, len, lab], i) => { const x1 = gx + dir * 20, x2 = gx + dir * dw * 0.48, y2 = 88 + 40 + i * 12; ctx.strokeStyle = i === 3 ? 'rgba(255,179,0,.95)' : 'rgba(0,224,158,.8)'; ctx.lineWidth = i === 3 ? 2.2 : 1.4; ctx.beginPath(); ctx.moveTo(gx, 88); ctx.lineTo(x2, y2); ctx.stroke(); for (let b = 1; b <= 4; b++) { const t = b / 4; ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(gx + (x2 - gx) * t - 3, 88 + (y2 - 88) * t - 3, 6, 6); } ctx.fillStyle = ctx.strokeStyle; ctx.font = '9px JetBrains Mono'; ctx.textAlign = dir < 0 ? 'right' : 'left'; ctx.fillText(lab, x2 + (dir < 0 ? -4 : 4), y2 + 3); });
  // kanan: profil tegangan jurusan 320 m beban merata
  const padL = dx + dw + 70, padR = 20, padT = 22, padB = 26, plotW = W - padL - padR, plotH = H - padT - padB;
  if (plotW < 80) return;
  const I = 60 * 1.3 / 2.5 * 1e3 / (Math.sqrt(3) * 380 * 0.9), L = 0.32, pf = 0.9, x = 0.08, n = 40;
  const prof = (r) => { const V = [380]; let v = 380; for (let s = 0; s < n; s++) { const pos = (s + 0.5) / n; v -= Math.sqrt(3) * I * (1 - pos) * (r * pf + x * Math.sqrt(1 - pf * pf)) * L / n; V.push(v); } return V; };
  const X = (i) => padL + i / n * plotW, Y = (v) => padT + plotH - (v - 340) / 45 * plotH;
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [342, 361, 380].forEach((v) => { ctx.fillText(v + ' V', padL - 4, Y(v) + 3); });
  ctx.strokeStyle = 'rgba(239,68,68,.6)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Y(361)); ctx.lineTo(padL + plotW, Y(361)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.fillText('gardu', padL, H - 8); ctx.fillText('ujung (320 m, 60 rumah merata, ' + I.toFixed(0) + ' A)', padL + plotW * 0.55, H - 8);
  [[0.641, 'rgba(255,179,0,1)', '50 mm²'], [0.443, 'rgba(0,224,158,1)', '70 mm²']].forEach(([r, warna, label]) => { const V = prof(r); ctx.strokeStyle = warna; ctx.lineWidth = 2.2; ctx.beginPath(); V.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); }); ctx.stroke(); ctx.fillStyle = warna; ctx.textAlign = 'right'; ctx.fillText(label + ': ujung ' + V[n].toFixed(1) + ' V (' + ((380 - V[n]) / 380 * 100).toFixed(2) + ' %)', padL + plotW - 4, Y(V[n]) - 6); });
  ctx.fillStyle = 'rgba(239,68,68,.8)'; ctx.textAlign = 'left'; ctx.fillText('batas rancangan 5 %', padL + 4, Y(361) - 4);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
