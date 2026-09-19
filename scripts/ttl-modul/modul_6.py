# Konten Modul 6 Teknik Tenaga Listrik — Aliran Daya dan Transien pada Saluran
# Transmisi serta Kompensasi Reaktif (Sub-CPMK 3.1, Pertemuan 6). Angka contoh
# dihitung di sini agar teks, tabel, dan gambar konsisten, dan sengaja berbeda dari
# varian soal.
import cmath
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 6
PERTEMUAN = 6
SUB_CPMK = "3.1"
JUDUL = "Aliran Daya dan Transien pada Saluran Transmisi"
JUDUL_PANJANG = "Aliran Daya dan Transien pada Saluran Transmisi serta Kompensasi Reaktif"
JUDUL_EKSPOR = "Aliran Daya dan Transien Saluran Transmisi"

# ─────────────────────────── angka contoh ───────────────────────────
W_ = 2 * math.pi * 50
SQ3 = math.sqrt(3)
# saluran menengah contoh (Bagian 01–03): 132 kV, 150 km
VLL, L_KM, R_KM, X_KM, B_KM = 132.0, 150.0, 0.1, 0.4, 3e-6
R_L, X_L, B_L = R_KM * L_KM, X_KM * L_KM, B_KM * L_KM
P_LOAD, PF_LOAD = 60.0, 0.9
VR = VLL * 1000 / SQ3
I_R = P_LOAD * 1e6 / (3 * VR * PF_LOAD)
PHI = math.acos(PF_LOAD)
IR_C = cmath.rect(I_R, -PHI)
Z_C = complex(R_L, X_L)
Y_C = complex(0, B_L)
A_C = 1 + Y_C * Z_C / 2
VS_C = A_C * VR + Z_C * IR_C
VS_LL = abs(VS_C) * SQ3 / 1000
DELTA = math.degrees(cmath.phase(VS_C))
VR_NL = abs(VS_C) / abs(A_C)
REG_PI = (VR_NL - VR) / VR * 100
# saluran pendek (tanpa Y) untuk perbandingan
VS_SHORT = VR + Z_C * IR_C
VS_SHORT_LL = abs(VS_SHORT) * SQ3 / 1000
DV_APPROX = I_R * (R_L * PF_LOAD + X_L * math.sin(PHI))
LOSS_MW = 3 * I_R ** 2 * R_L / 1e6
ETA = P_LOAD / (P_LOAD + LOSS_MW) * 100
# SIL & Ferranti
L_H, C_F = 1.2e-3, 0.0095e-6
ZC_SURJA = math.sqrt(L_H / C_F)
SIL = VLL ** 2 / ZC_SURJA
FERRANTI = (1 / abs(A_C) - 1) * 100         # kenaikan V_R tanpa beban bila V_S tetap
# kompensasi shunt (Bagian 04): kapasitor ujung terima pf 0,9 → 0,98
PF2 = 0.98
QC_SH = P_LOAD * (math.tan(PHI) - math.tan(math.acos(PF2)))
I_R2 = P_LOAD * 1e6 / (3 * VR * PF2)
IR2_C = cmath.rect(I_R2, -math.acos(PF2))
VS2_C = A_C * VR + Z_C * IR2_C
VS2_LL = abs(VS2_C) * SQ3 / 1000
LOSS2_MW = 3 * I_R2 ** 2 * R_L / 1e6
# kompensasi seri (Bagian 05): 220 kV, X = 80 Ω, 40 %
V_SER, X_SER, K_SER = 220.0, 80.0, 0.40
PM0 = V_SER ** 2 / X_SER
PM1 = V_SER ** 2 / (X_SER * (1 - K_SER))
P_OP = 400.0
D0 = math.degrees(math.asin(P_OP / PM0))
D1 = math.degrees(math.asin(P_OP / PM1))
# gelombang berjalan (Bagian 06): 200 kV, 400 Ω → 50 Ω
V_SURJA, Z1_S, Z2_S = 200.0, 400.0, 50.0
RHO = (Z2_S - Z1_S) / (Z1_S + Z2_S)
TAU = 2 * Z2_S / (Z1_S + Z2_S)
V_CEPAT = 1 / math.sqrt(L_H * C_F) / 1000   # km/s


# ─────────────────────────── gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def res_h(x1, x2, y, c, label):
    return f'<rect x="{x1}" y="{y - 9}" width="{x2 - x1}" height="18" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t((x1 + x2) / 2, y - 14, label, 10.5, c, "middle", "600")


def kumparan(x1, x2, y, c, label):
    n, w = 4, (x2 - x1) / 4
    d = " ".join(f"a {w / 2:.1f} {w / 2:.1f} 0 0 1 {w:.1f} 0" for _ in range(n))
    return f'<path d="M {x1} {y} {d}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t((x1 + x2) / 2, y - 14, label, 10.5, c, "middle", "600")


def kapasitor(x, y1, y2, c, label):
    ym = (y1 + y2) / 2
    return (kawat(x, y1, x, ym - 4) + kawat(x, ym + 4, x, y2) + f'<line x1="{x - 10}" y1="{ym - 4}" x2="{x + 10}" y2="{ym - 4}" stroke="{c}" stroke-width="2.4"/><line x1="{x - 10}" y1="{ym + 4}" x2="{x + 10}" y2="{ym + 4}" stroke="{c}" stroke-width="2.4"/>'
            + t(x + 14, ym + 4, label, 10.5, c, "start", "600"))


def gambar1():
    b = t(120, 22, "Pendek (< 80 km)", 11.5, TX, "middle", "700") + t(360, 22, "Menengah (80–250 km): nominal-π", 11.5, TX, "middle", "700") + t(580, 22, "Panjang (> 250 km)", 11.5, TX, "middle", "700")
    # pendek
    b += kawat(30, 70, 60, 70) + res_h(60, 110, 70, "#22d3ee", "R") + kawat(110, 70, 125, 70) + kumparan(125, 185, 70, "#f59e0b", "X") + kawat(185, 70, 215, 70) + kawat(30, 150, 215, 150)
    b += f'<circle cx="30" cy="70" r="3.5" fill="#00e09e"/><circle cx="215" cy="70" r="3.5" fill="#ec4899"/>' + t(30, 58, "V_S", 10.5, "#00e09e", "middle", "600") + t(215, 58, "V_R", 10.5, "#ec4899", "middle", "600")
    b += t(120, 176, "V_S = V_R + I·Z", 11, AX)
    # menengah
    b += kawat(250, 70, 290, 70) + res_h(290, 335, 70, "#22d3ee", "R") + kawat(335, 70, 350, 70) + kumparan(350, 410, 70, "#f59e0b", "X") + kawat(410, 70, 470, 70) + kawat(250, 150, 470, 150)
    b += kapasitor(275, 70, 150, "#a855f7", "Y/2") + kapasitor(445, 70, 150, "#a855f7", "Y/2")
    b += f'<circle cx="250" cy="70" r="3.5" fill="#00e09e"/><circle cx="470" cy="70" r="3.5" fill="#ec4899"/>'
    b += t(360, 176, "V_S = A·V_R + B·I_R;  A = 1 + YZ/2, B = Z", 11, AX)
    # panjang
    for i in range(3):
        x = 500 + i * 50
        b += kawat(x, 70, x + 8, 70) + res_h(x + 8, x + 24, 70, "#22d3ee", "") + kumparan(x + 26, x + 46, 70, "#f59e0b", "") + kapasitor(x + 48, 70, 150, "#a855f7", "")
    b += kawat(646, 70, 650, 70) + kawat(500, 150, 650, 150) + f'<circle cx="500" cy="70" r="3.5" fill="#00e09e"/><circle cx="650" cy="70" r="3.5" fill="#ec4899"/>'
    b += t(580, 176, "parameter tersebar: cosh γl, Z_c sinh γl", 11, AX)
    b += t(330, 206, f"Contoh modul: 132 kV, {ind(L_KM, 0)} km, r = {ind(R_KM, 1)} Ω/km, x = {ind(X_KM, 1)} Ω/km, b = {ind(B_KM * 1e6, 0)} µS/km → R = {ind(R_L, 0)} Ω, X = {ind(X_L, 0)} Ω, B = {ind(B_L * 1e6, 0)} µS", 11.5, AX)
    return svg(660, 218, b, "Gambar 1 — Tiga model saluran transmisi menurut panjangnya")


def gambar2():
    ox, oy = 60, 168
    sk = 260 / abs(VS_C)
    P2 = lambda z: (ox + z.real * sk, oy - z.imag * sk)
    pR, pS = P2(complex(VR, 0)), P2(VS_C)
    vRr = VR + Z_C.real * IR_C
    pRr = P2(vRr)
    b = arrow(ox, oy, pR[0], pR[1], "#22d3ee", 2.6) + t((ox + pR[0]) / 2, oy + 16, f"V_R = {ind(VR / 1000, 2)} kV ∠0°", 11, "#22d3ee", "middle", "600")
    b += arrow(pR[0], pR[1], pRr[0], pRr[1], "#f59e0b", 2) + t(pRr[0] + 4, pRr[1] + 14, "I·R", 10.5, "#f59e0b", "start", "600")
    b += arrow(pRr[0], pRr[1], P2(VR + Z_C * IR_C)[0], P2(VR + Z_C * IR_C)[1], "#a855f7", 2) + t(P2(VR + Z_C * IR_C)[0] + 6, P2(VR + Z_C * IR_C)[1] + 2, "j·I·X", 10.5, "#a855f7", "start", "600")
    b += arrow(ox, oy, pS[0], pS[1], "#00e09e", 2.8) + t(ox + 30, pS[1] - 10, f"V_S = {ind(abs(VS_C) / 1000, 2)} kV ∠{ind(DELTA, 1)}°", 11.5, "#00e09e", "start", "700")
    skI = 260 / abs(VS_C) * VR / I_R * 0.4
    pI = (ox + IR_C.real * skI, oy - IR_C.imag * skI)
    b += arrow(ox, oy, pI[0], pI[1], "#ef4444", 2) + t(pI[0] + 6, pI[1] + 12, f"I_R = {ind(I_R, 0)} A ∠−{ind(math.degrees(PHI), 1)}°", 10.5, "#ef4444", "start", "600")
    b += f'<path d="M {ox + 40} {oy} A 40 40 0 0 0 {ox + 40 * math.cos(math.radians(DELTA)):.1f} {oy - 40 * math.sin(math.radians(DELTA)):.1f}" fill="none" stroke="#00e09e" stroke-width="1.4"/>' + t(ox + 46, oy - 8, "δ", 11, "#00e09e", "start", "700")
    for i, (judul, isi, c) in enumerate([("Jatuh tegangan", f"|V_S| − |V_R| = {ind((abs(VS_C) - VR) / 1000, 2)} kV/fasa ({ind((abs(VS_C) / VR - 1) * 100, 1)}%)", "#a855f7"), ("Sudut daya δ", f"{ind(DELTA, 1)}°: membawa P = {ind(P_LOAD, 0)} MW", "#00e09e"),
                                          ("Rugi saluran", f"3I²R = {ind(LOSS_MW, 2)} MW → η = {ind(ETA, 1)}%", "#f59e0b"), ("Pendekatan", f"ΔV ≈ I(R cos φ + X sin φ) = {ind(DV_APPROX / 1000, 2)} kV", "#22d3ee")]):
        y = 30 + i * 40
        b += f'<rect x="420" y="{y}" width="228" height="32" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>' + t(428, y + 13, judul, 11, TX, "start", "600") + t(428, y + 26, isi, 9, AX, "start")
    b += t(330, 208, f"Saluran {ind(L_KM, 0)} km memasok {ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)} pada 132 kV: tegangan kirim harus {ind(VS_LL, 1)} kV (model π) agar ujung terima tetap 132 kV", 11.5, AX)
    return svg(660, 220, b, "Gambar 2 — Diagram fasor tegangan kirim saluran berbeban induktif")


def gambar3():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    Pmax = 120
    X = lambda p: x0 + p / Pmax * (x1 - x0)
    Y = lambda v: y0 - (v - 110) / 40 * (y0 - y1)
    for v in [110, 120, 130, 140, 150]:
        b += f'<line x1="{x0}" y1="{Y(v):.1f}" x2="{x1}" y2="{Y(v):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(v) + 4, f"{v} kV", 10.5, AX, "end")
    for p in [0, 30, 60, 90, 120]:
        b += t(X(p), y0 + 16, f"{p} MW", 10.5, AX)
    for pf, c, lab in [(0.8, "#ef4444", "pf 0,8 tertinggal"), (0.9, "#f59e0b", "pf 0,9"), (1.0, "#00e09e", "pf 1,0"), (-0.9, "#22d3ee", "pf 0,9 mendahului")]:
        pts = []
        for i in range(0, 121, 4):
            pfa = abs(pf)
            I = i * 1e6 / (3 * VR * pfa) if i else 0
            ang = -math.acos(pfa) if pf > 0 else math.acos(pfa)
            vs = abs(A_C * VR + Z_C * cmath.rect(I, ang)) * SQ3 / 1000
            pts.append(f"{X(i):.1f},{Y(vs):.1f}")
        b += f'<polyline points="{" ".join(pts)}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t(x1 + 4, float(pts[-1].split(",")[1]) + 4, lab, 9.5, c, "start", "600")
    b += f'<line x1="{x0}" y1="{Y(132):.1f}" x2="{x1}" y2="{Y(132):.1f}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="5 4"/>' + t(x0 + 6, Y(132) - 6, "V_R = 132 kV (dijaga)", 10.5, "#ec4899", "start")
    b += t(28, 110, "V_S", 11, AX)
    b += t(347, 234, f"Tegangan kirim yang diperlukan agar ujung terima tetap 132 kV, terhadap beban: makin buruk pf, makin curam; pf mendahului bahkan menurunkan V_S", 11.5, AX)
    return svg(660, 244, b, "Gambar 3 — Tegangan kirim terhadap beban dan faktor daya (saluran contoh)")


def gambar4():
    b = t(165, 22, "Tanpa kompensasi", 12, "#ef4444", "middle", "700") + t(495, 22, f"Kapasitor shunt {ind(QC_SH, 1)} MVAR di ujung terima", 12, "#00e09e", "middle", "700")
    for ox, VS_, I_, loss_, c, lab in [(40, VS_LL, I_R, LOSS_MW, "#ef4444", f"pf {ind(PF_LOAD, 2)}"), (370, VS2_LL, I_R2, LOSS2_MW, "#00e09e", f"pf {ind(PF2, 2)}")]:
        b += kawat(ox, 80, ox + 40, 80) + res_h(ox + 40, ox + 85, 80, "#22d3ee", f"R {ind(R_L, 0)} Ω") + kawat(ox + 85, 80, ox + 100, 80) + kumparan(ox + 100, ox + 160, 80, "#f59e0b", f"X {ind(X_L, 0)} Ω") + kawat(ox + 160, 80, ox + 250, 80) + kawat(ox, 160, ox + 250, 160)
        b += f'<circle cx="{ox}" cy="80" r="4" fill="#00e09e"/>' + t(ox, 66, f"V_S = {ind(VS_, 1)} kV", 10.5, "#00e09e", "middle", "700")
        b += f'<circle cx="{ox + 250}" cy="80" r="4" fill="#ec4899"/>' + t(ox + 250, 66, "V_R = 132 kV", 10.5, "#ec4899", "middle", "700")
        b += f'<rect x="{ox + 205}" y="100" width="22" height="40" rx="3" fill="{BOX}" stroke="#ef4444" stroke-width="2"/>' + t(ox + 216, 156, f"{ind(P_LOAD, 0)} MW, {lab}", 9.5, TX, "middle", "600")
        b += arrow(ox + 15, 100, ox + 15, 140, c, 1.6) + t(ox + 22, 124, f"I = {ind(I_, 0)} A", 10, c, "start", "600")
        b += t(ox + 125, 190, f"rugi 3I²R = {ind(loss_, 2)} MW", 10.5, c, "middle", "600")
        if ox > 100:
            b += kapasitor(ox + 240, 80, 160, "#a855f7", "")
            b += t(ox + 246, 124, "C", 10.5, "#a855f7", "start", "700")
    b += t(330, 216, f"Kapasitor memasok {ind(QC_SH, 1)} MVAR dari {ind(P_LOAD * math.tan(PHI), 1)} MVAR yang diminta beban: arus saluran turun {ind((1 - I_R2 / I_R) * 100, 0)}%, V_S yang diperlukan turun dari {ind(VS_LL, 1)} ke {ind(VS2_LL, 1)} kV", 11.5, AX)
    return svg(660, 226, b, "Gambar 4 — Kompensasi shunt: kapasitor di ujung terima")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    X = lambda d: x0 + d / 180 * (x1 - x0)
    Y = lambda p: y0 - p / (PM1 * 1.1) * (y0 - y1)
    for d in [0, 30, 60, 90, 120, 150, 180]:
        b += f'<line x1="{X(d):.1f}" y1="{y1}" x2="{X(d):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(d), y0 + 16, f"{d}°", 10.5, AX)
    for p in [0, 250, 500, 750, 1000]:
        b += t(x0 - 8, Y(p) + 4, f"{p}", 10.5, AX, "end")
    for Pm, c, lab in [(PM0, "#94a3b8", f"tanpa kompensasi: P_maks = {ind(PM0, 0)} MW"), (PM1, "#00e09e", f"kompensasi seri {ind(K_SER * 100, 0)}%: P_maks = {ind(PM1, 0)} MW")]:
        pts = " ".join(f"{X(d):.1f},{Y(Pm * math.sin(math.radians(d))):.1f}" for d in range(0, 181, 3))
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2.4"/>' + t(X(95), Y(Pm) - 8, lab, 10.5, c, "start", "600")
    b += f'<line x1="{x0}" y1="{Y(P_OP):.1f}" x2="{x1}" y2="{Y(P_OP):.1f}" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="5 4"/>' + t(x0 + 6, Y(P_OP) - 6, f"P = {ind(P_OP, 0)} MW", 10.5, "#f59e0b", "start", "600")
    b += f'<circle cx="{X(D0):.1f}" cy="{Y(P_OP):.1f}" r="5" fill="#94a3b8"/>' + t(X(D0) + 8, Y(P_OP) + 16, f"δ = {ind(D0, 1)}°", 10.5, "#94a3b8", "start", "600")
    b += f'<circle cx="{X(D1):.1f}" cy="{Y(P_OP):.1f}" r="5" fill="#00e09e"/>' + t(X(D1) - 8, Y(P_OP) + 16, f"δ = {ind(D1, 1)}°", 10.5, "#00e09e", "end", "600")
    b += t(28, 110, "MW", 11, AX)
    b += t(347, 234, f"Saluran {ind(V_SER, 0)} kV, X = {ind(X_SER, 0)} Ω: kapasitor seri {ind(K_SER * 100, 0)}% menaikkan P_maks {ind((PM1 / PM0 - 1) * 100, 0)}% dan memperkecil sudut daya untuk beban yang sama", 11.5, AX)
    return svg(660, 244, b, "Gambar 5 — Kurva P–δ dan kompensasi seri")


def gambar6():
    b = ""
    x0, x1, y0 = 40, 630, 130
    xj = 380
    b += kawat(x0, y0, x1, y0, AX, 1.6) + f'<line x1="{xj}" y1="40" x2="{xj}" y2="200" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="5 4"/>'
    b += t(210, 218, f"saluran udara Z₁ = {ind(Z1_S, 0)} Ω", 11, AX) + t(505, 218, f"kabel Z₂ = {ind(Z2_S, 0)} Ω", 11, AX) + t(xj, 34, "sambungan", 10.5, "#f59e0b", "middle", "600")
    sk = 70 / V_SURJA
    def pulsa(xc, amp, w, c, lo, hi):
        pts = [f"{max(lo, xc - w):.1f},{y0}"]
        for i in range(41):
            xx = xc - w + 2 * w * i / 40
            if lo <= xx <= hi:
                pts.append(f"{xx:.1f},{y0 - amp * sk * math.exp(-((xx - xc) / (w * 0.4)) ** 2):.1f}")
        pts.append(f"{min(hi, xc + w):.1f},{y0}")
        return f'<polygon points="{" ".join(pts)}" fill="{c}" fill-opacity=".75"/>'
    b += pulsa(150, V_SURJA, 60, "#22d3ee", x0, xj) + t(150, 44, f"datang {ind(V_SURJA, 0)} kV →", 10.5, "#22d3ee", "middle", "600")
    b += pulsa(300, RHO * V_SURJA, 60, "#ef4444", x0, xj) + t(300, 200, f"← pantul ρV = {ind(RHO * V_SURJA, 1)} kV", 10.5, "#ef4444", "middle", "600")
    b += pulsa(470, TAU * V_SURJA, 30, "#00e09e", xj, x1) + t(470, 44, f"diteruskan τV = {ind(TAU * V_SURJA, 1)} kV →", 10.5, "#00e09e", "middle", "600")
    b += t(330, 238, f"ρ = (Z₂ − Z₁)/(Z₁ + Z₂) = {ind(RHO, 3)}, τ = 2Z₂/(Z₁ + Z₂) = {ind(TAU, 3)}; kecepatan rambat di udara ≈ {ind(V_CEPAT / 1000, 0)}×10³ km/s, di kabel sekitar separuhnya", 11.5, AX)
    return svg(660, 248, b, "Gambar 6 — Gelombang berjalan di sambungan saluran udara ke kabel")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-model">Model Saluran</a>
  <a href="#m-aliran">Aliran Daya</a>
  <a href="#m-regulasi">Regulasi &amp; Efisiensi</a>
  <a href="#m-shunt">Kompensasi Shunt</a>
  <a href="#m-seri">Kompensasi Seri</a>
  <a href="#m-transien">Transien</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="90" x2="92" y2="90" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="8" y1="150" x2="92" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <rect x="20" y="84" width="18" height="12" rx="2" fill="none" stroke="rgba(0,229,255,.55)" stroke-width="1.5"/>
      <path d="M 44 90 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.5"/>
      <line x1="14" y1="90" x2="14" y2="116" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/><line x1="8" y1="116" x2="20" y2="116" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="8" y1="122" x2="20" y2="122" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="14" y1="122" x2="14" y2="150" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/>
      <line x1="86" y1="90" x2="86" y2="116" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/><line x1="80" y1="116" x2="92" y2="116" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="80" y1="122" x2="92" y2="122" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="86" y1="122" x2="86" y2="150" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/>
      <text x="6" y="76" fill="rgba(0,224,158,.55)" font-family="JetBrains Mono" font-size="8">V_S</text>
      <text x="80" y="76" fill="rgba(236,72,153,.55)" font-family="JetBrains Mono" font-size="8">V_R</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="150" x2="90" y2="150" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <path d="M 10 150 C 30 150, 34 60, 44 60 C 54 60, 58 150, 90 150" fill="none" stroke="rgba(0,229,255,.6)" stroke-width="1.6"/>
      <path d="M 60 150 C 66 150, 68 120, 72 120 C 76 120, 78 150, 84 150" fill="none" stroke="rgba(0,224,158,.6)" stroke-width="1.4"/>
      <line x1="56" y1="40" x2="56" y2="160" stroke="rgba(255,179,0,.5)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="14" y="52" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">V →</text>
      <text x="62" y="112" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">τV</text>
      <text x="40" y="180" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">Z₁ | Z₂</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="06">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">V_S = A·V_R + B·I_R</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">ΔV ≈ I(R cos φ + X sin φ)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">P = V_S·V_R·sin δ / X</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">VR = (V_nl − V_fl)/V_fl</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Z_c = √(L/C)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">SIL = V²/Z_c</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">X_eff = X(1 − k)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">τ = 2Z₂/(Z₁ + Z₂)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Aliran Daya</span><br>
      <em>dan Transien</em><br>
      <span class="hl-amber">Saluran Transmisi</span>
    </h1>
    <p class="hero-sub">Saluran transmisi bukan kawat ideal: resistansinya membuang daya, induktansinya menjatuhkan tegangan dan membatasi daya yang dapat dikirim, dan kapasitansinya menaikkan tegangan saat beban ringan. Modul ini membangun model saluran pendek, menengah, dan panjang, menghitung aliran daya, regulasi, dan efisiensi, merancang kompensasi reaktif shunt dan seri, lalu menutup dengan gelombang berjalan yang menentukan bagaimana surja petir dan switching merambat dan dipantulkan.</p>
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

    # 01 — model saluran
    isi = figure(1, "Tiga model saluran transmisi menurut panjangnya", "Saluran pendek cukup R dan X seri; saluran menengah menambahkan kapasitansi ke tanah sebagai dua kapasitor di ujung (nominal-π); saluran panjang memakai parameter tersebar. Ketiganya dapat dituliskan sebagai konstanta ABCD.", gambar1())
    isi += formula(1, "Parameter Saluran dan Model Pendek", r"Z = (r + jx)\,\ell, \qquad Y = jb\,\ell, \qquad \text{pendek: } \mathbf{V}_S = \mathbf{V}_R + \mathbf{I}\,Z, \quad \mathbf{I}_S = \mathbf{I}_R",
                   rf"Saluran contoh 132 kV, {ind(L_KM, 0)} km: r = {ind(R_KM, 1)} Ω/km, x = {ind(X_KM, 1)} Ω/km, b = {ind(B_KM * 1e6, 0)} µS/km → \(Z = {ind(R_L, 0)} + j{ind(X_L, 0)}\) Ω, \(Y = j{ind(B_L * 1e6, 0)}\) µS. Reaktansi seri empat kali resistansinya: pada saluran tinggi, X yang menentukan jatuh tegangan dan batas daya, bukan R.",
                   "Parameter per kilometer bergantung penampang konduktor (r), jarak antar-fasa dan jari-jari konduktor (x dan b); Modul 7 menurunkannya. Saluran pendek (< 80 km atau tegangan ≤ 70 kV) mengabaikan kapasitansi karena arus pengisiannya kecil dibanding arus beban.",
                   [("r, x, b", "Resistansi, reaktansi, suseptansi per km"), ("\\ell", "Panjang saluran (km)"), ("Z, Y", "Impedansi seri dan admitansi shunt total"), ("\\mathbf{V}_S, \\mathbf{V}_R", "Fasor tegangan kirim dan terima per fasa")])
    isi += formula(2, "Model Nominal-π dan Konstanta ABCD", r"\mathbf{V}_S = A\,\mathbf{V}_R + B\,\mathbf{I}_R, \quad \mathbf{I}_S = C\,\mathbf{V}_R + D\,\mathbf{I}_R; \qquad A = D = 1 + \tfrac{YZ}{2}, \quad B = Z, \quad C = Y\left(1 + \tfrac{YZ}{4}\right)",
                   rf"Saluran contoh: \(A = 1 + j{ind(B_L * 1e6, 0)}\times10^{{-6}}({ind(R_L, 0)} + j{ind(X_L, 0)})/2 = {ind(A_C.real, 4)} + j{ind(A_C.imag, 5)}\), \(|A| = {ind(abs(A_C), 4)}\). Untuk saluran pendek \(A = 1\), \(B = Z\), \(C = 0\). Saluran panjang: \(A = \cosh\gamma\ell\), \(B = Z_c\sinh\gamma\ell\), dengan \(\gamma = \sqrt{{zy}}\); nominal-π adalah pendekatannya yang baik sampai ±250 km.",
                   "ABCD adalah cara baku menyatakan jaringan dua-port apa pun (saluran, trafo, kompensator) sehingga dapat dirangkai dengan perkalian matriks. |A| < 1 pada saluran berkapasitansi adalah sumber efek Ferranti: tanpa beban, V_R = V_S/|A| > V_S.",
                   [("A, B, C, D", "Konstanta rangkaian umum (A, D tanpa satuan; B ohm; C siemens)"), ("\\gamma", "Konstanta propagasi (per km)"), ("Z_c", "Impedansi karakteristik (Ω)")])
    isi += cards([
        ("📏", "Pendek: < 80 km", "Distribusi 20 kV, subtransmisi 70 kV, dan saluran 150 kV yang pendek. Hanya Z seri; arus kirim = arus terima. Cukup untuk hampir semua persoalan pabrik dan kawasan.", r"\(A = 1,\ B = Z\)"),
        ("📐", "Menengah: 80–250 km", "Saluran 150–275 kV antar-gardu induk. Nominal-π (Y dibagi dua di ujung) atau nominal-T. Efek Ferranti sudah terasa saat beban ringan.", r"\(A = 1 + YZ/2\)"),
        ("🌐", "Panjang: > 250 km", "Saluran 500 kV Jawa–Bali. Persamaan gelombang dengan cosh dan sinh; kompensasi reaktif hampir selalu diperlukan. Modul ini menyentuhnya lewat Z_c dan SIL.", r"\(A = \cosh\gamma\ell\)"),
        ("🔌", "Kabel Tanah/Laut", "Kapasitansinya 20–50 kali saluran udara: arus pengisian besar, Z_c rendah (30–60 Ω), panjang AC terbatas puluhan km. Itulah sebabnya kabel laut panjang memakai HVDC.", None),
        ("🧮", "Per Unit", "Praktik industri menyatakan Z dan Y dalam per-unit terhadap MVA dan kV dasar (Modul 7); rumus modul ini tidak berubah, hanya satuannya.", None),
        ("🌡️", "Batas Termal", "Selain jatuh tegangan dan kestabilan, arus saluran dibatasi suhu konduktor (andongan bertambah). Tiga batas ini menentukan 'kapasitas' saluran.", None),
    ])
    isi += tabel(["Tegangan / jenis", "r (Ω/km)", "x (Ω/km)", "b (µS/km)", "Z_c (Ω)", "SIL (MW)"], [
        ["20 kV distribusi (AAAC 150 mm²)", "0,22", "0,35", "3,3", "≈ 325", "≈ 1,2"],
        ["70 kV subtransmisi", "0,15", "0,42", "2,7", "≈ 395", "≈ 12"],
        ["150 kV udara", "0,08", "0,40", "2,9", "≈ 370", "≈ 61"],
        ["500 kV udara (berkas 4)", "0,02", "0,28", "4,2", "≈ 260", "≈ 960"],
        ["150 kV kabel XLPE", "0,04", "0,12", "60", "≈ 45", "≈ 500"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> jalur tiga fasa Lauffen–Frankfurt (1891, 175 km) dibangun sebelum ada teori saluran; Charles Steinmetz dan Oliver Heaviside (persamaan telegraf, 1880-an) memberi alat yang kini dipakai. Konsep impedansi surja dan SIL dari studi telepon jarak jauh diterapkan pada tenaga oleh insinyur GE dan Westinghouse pada 1920-an, ketika saluran 220 kV pertama di California memperlihatkan efek Ferranti dan tegangan lebih switching yang tidak terduga.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 memberi model; Bagian 02–03 memakai model itu untuk aliran daya, jatuh tegangan, regulasi, dan efisiensi (pertanyaan sehari-hari operator). Bagian 04–05 adalah obatnya: kompensasi shunt dan seri. Bagian 06 pindah dari keadaan tunak ke transien mikrodetik: gelombang berjalan. Animasi memutar fasor, profil tegangan, kurva P–δ, dan gelombang; Python menyelesaikan semuanya dengan bilangan kompleks.")
    m += bagian(1, "m-model", "Model Saluran:<br>Pendek, Menengah, Panjang",
                "Sebelum aliran daya dapat dihitung, saluran harus diwakili rangkaian: resistansi dan induktansi seri yang menahan arus, serta kapasitansi ke tanah yang menarik arus pengisian. Seberapa banyak dari ketiganya yang perlu dipakai bergantung panjang saluran, dan Persamaan (1)–(2) memberi tiga tingkat model beserta bentuk umum ABCD-nya. Gambar 1 memperlihatkan ketiganya.",
                isi, "MODEL SALURAN")

    # 02 — aliran daya & jatuh tegangan
    isi = figure(2, "Diagram fasor tegangan kirim saluran berbeban induktif", f"Beban {ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)} pada ujung terima 132 kV menarik {ind(I_R, 0)} A; jatuh tegangan I·R sejajar arus dan j·I·X tegak lurus arus, sehingga tegangan kirim menjadi {ind(VS_LL, 1)} kV dan mendahului {ind(DELTA, 1)}°.", gambar2())
    isi += formula(3, "Jatuh Tegangan pada Saluran Berbeban", r"\mathbf{V}_S = \mathbf{V}_R + \mathbf{I}(R + jX), \qquad \Delta V = |\mathbf{V}_S| - |\mathbf{V}_R| \approx I\,(R\cos\varphi + X\sin\varphi)",
                   rf"Saluran contoh sebagai saluran pendek: \(I = {ind(P_LOAD, 0)}\times10^6/(\sqrt{{3}}\times132\times10^3\times{ind(PF_LOAD, 1)}) = {ind(I_R, 1)}\) A; \(\Delta V \approx {ind(I_R, 1)}({ind(R_L, 0)}\times{ind(PF_LOAD, 1)} + {ind(X_L, 0)}\times{ind(math.sin(PHI), 3)}) = {ind(DV_APPROX / 1000, 2)}\) kV/fasa; eksak (fasor) \(|V_S| = {ind(abs(VS_SHORT) / 1000, 2)}\) kV/fasa = {ind(VS_SHORT_LL, 1)} kV antar-saluran; model π memberi {ind(VS_LL, 1)} kV karena kapasitor ujung terima ikut memasok sebagian arus reaktif.",
                   "Suku X sin φ biasanya dominan: beban induktif (sin φ > 0) menjatuhkan tegangan lewat reaktansi, beban kapasitif (sin φ < 0) justru menaikkannya. Itulah dua kesimpulan praktis: perbaiki faktor daya beban, atau pasang kapasitor di ujung terima, dan tegangan ujung naik tanpa mengubah saluran.",
                   [("\\Delta V", "Jatuh tegangan per fasa (V)"), ("I", "Arus saluran (A)"), ("\\varphi", "Sudut faktor daya beban (+ tertinggal)")])
    isi += formula(4, "Aliran Daya Aktif dan Reaktif Melalui Reaktansi", r"P = \dfrac{V_S V_R}{X}\sin\delta, \qquad Q_R = \dfrac{V_S V_R\cos\delta - V_R^2}{X}, \qquad P_{maks} = \dfrac{V_S V_R}{X}\ (\delta = 90^\circ)",
                   rf"Dengan V dalam kV antar-saluran dan X dalam Ω, P langsung dalam MW. Saluran contoh (R diabaikan): \(P_{{maks}} = 132\times{ind(VS_LL, 1)}/{ind(X_L, 0)} = {ind(132 * VS_LL / X_L, 0)}\) MW; beban {ind(P_LOAD, 0)} MW berarti \(\sin\delta = {ind(P_LOAD * X_L / (132 * VS_LL), 3)}\), \(\delta \approx {ind(math.degrees(math.asin(P_LOAD * X_L / (132 * VS_LL))), 1)}^\circ\), sesuai Gambar 2.",
                   "Dua fakta paling penting sistem tenaga tersembunyi di sini: daya aktif mengalir dari tegangan yang <em>mendahului</em> ke yang tertinggal (sudut δ), sedangkan daya reaktif mengalir dari tegangan yang <em>lebih tinggi</em> ke yang lebih rendah. Batas δ = 90° adalah batas kestabilan statis; praktik menjaga δ di bawah ±30–40° (Bagian 05).",
                   [("\\delta", "Sudut daya: sudut V_S terhadap V_R"), ("X", "Reaktansi seri saluran (Ω)"), ("Q_R", "Daya reaktif yang diterima ujung terima")])
    isi += cards([
        ("➡️", "P Mengikuti Sudut", "Generator yang 'didorong' turbin memajukan sudut rotornya, dan daya mengalir ke rel yang tertinggal. Sudut daya adalah 'tekanan' aliran P.", r"\(P \propto \sin\delta\)"),
        ("⬆️", "Q Mengikuti Tegangan", "Menaikkan eksitasi generator menaikkan tegangannya, dan Q mengalir keluar. Q sulit dikirim jauh karena setiap X memakannya (I²X); Q harus dipasok dekat beban.", r"\(Q \propto \Delta|V|\)"),
        ("📉", "Beban Induktif", "Motor dan trafo menarik Q melalui saluran, sehingga X sin φ menjatuhkan tegangan. Tegangan ujung terima 'melorot' di jam puncak beban industri.", None),
        ("📈", "Beban Kapasitif", "Kabel panjang, saluran tanpa beban, bank kapasitor berlebih: sin φ negatif, tegangan ujung naik, bisa melampaui batas isolasi peralatan (Bagian 04).", None),
        ("🧭", "Konvensi", "Semua fasor per fasa, V_R acuan 0°; untuk antar-saluran kalikan √3. Arus positif keluar dari ujung terima menuju beban; Q positif induktif.", None),
        ("🖥️", "Aliran Daya Sistem", "Pada jaringan bersimpul banyak, Persamaan (4) ditulis untuk tiap cabang dan diselesaikan iteratif (Newton–Raphson); itulah program load flow pada Pertemuan 15.", None),
    ])
    isi += tabel(["Beban di ujung terima (132 kV)", "I (A)", "ΔV pendekatan (kV/fasa)", "|V_S| model π (kV)", "δ", "Rugi (MW)"],
                 [[f"{p:g} MW, pf {pf:.2f}{' mendahului' if pf < 0 else ''}",
                   ind(p * 1e6 / (3 * VR * abs(pf)), 0),
                   ind(p * 1e6 / (3 * VR * abs(pf)) * (R_L * abs(pf) + X_L * math.sin(math.acos(abs(pf))) * (1 if pf > 0 else -1)) / 1000, 2),
                   ind(abs(A_C * VR + Z_C * cmath.rect(p * 1e6 / (3 * VR * abs(pf)), -math.acos(abs(pf)) if pf > 0 else math.acos(abs(pf)))) * SQ3 / 1000, 1),
                   ind(math.degrees(cmath.phase(A_C * VR + Z_C * cmath.rect(p * 1e6 / (3 * VR * abs(pf)), -math.acos(abs(pf)) if pf > 0 else math.acos(abs(pf))))), 1) + "°",
                   ind(3 * (p * 1e6 / (3 * VR * abs(pf))) ** 2 * R_L / 1e6, 2)] for p, pf in [(30, 0.9), (60, 0.9), (60, 0.8), (60, 1.0), (60, -0.9), (100, 0.9)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> pada 60 MW, mengubah pf dari 0,8 ke 1,0 menurunkan tegangan kirim yang diperlukan hampir 8 kV; pf 0,9 mendahului (misalnya dengan kapasitor di ujung terima) bahkan membuat V_S di bawah V_R. Rugi hanya bergantung arus, jadi ikut turun bersama perbaikan pf. Soal C2, C6, dan C11 memakai Persamaan (3); soal C9 memakai Persamaan (4).")
    m += bagian(2, "m-aliran", "Aliran Daya dan<br>Jatuh Tegangan",
                "Begitu saluran diberi beban, tegangan di kedua ujungnya tidak lagi sama: besarnya berbeda karena jatuh tegangan pada R dan X, dan sudutnya berbeda karena daya aktif yang mengalir. Persamaan (3) menghitung jatuh tegangan dari arus beban dan faktor dayanya, dan Persamaan (4) memperlihatkan hubungan yang menjadi jantung sistem tenaga: P mengalir mengikuti sudut, Q mengikuti selisih tegangan. Gambar 2 memperlihatkan fasornya untuk saluran contoh.",
                isi, "ALIRAN DAYA")

    # 03 — regulasi & efisiensi
    isi = figure(3, "Tegangan kirim terhadap beban dan faktor daya (saluran contoh)", "Untuk menjaga ujung terima tetap 132 kV, tegangan kirim harus dinaikkan seiring beban; kemiringannya ditentukan faktor daya. Beban mendahului berjalan sebaliknya: kapasitansi beban 'mengangkat' tegangan ujung.", gambar3())
    isi += formula(5, "Regulasi Tegangan", r"VR = \dfrac{|V_{R,nl}| - |V_{R,fl}|}{|V_{R,fl}|}\times100\%, \qquad V_{R,nl} = \dfrac{|V_S|}{|A|}\ (\text{pendek: } V_{R,nl} = |V_S|)",
                   rf"Saluran contoh dengan V_S dijaga {ind(VS_LL, 1)} kV: tanpa beban \(V_R = {ind(VS_LL, 1)}/{ind(abs(A_C), 4)} = {ind(VR_NL * SQ3 / 1000, 1)}\) kV, beban penuh 132 kV → \(VR = {ind(REG_PI, 1)}\%\). Batas praktis regulasi saluran transmisi ±5% (tap trafo dan kompensasi mengambil sisanya); distribusi 20 kV sering sampai 10%.",
                   "Regulasi mengukur seberapa 'lembek' saluran: seberapa jauh tegangan ujung berayun antara malam tanpa beban dan siang beban puncak. Regulasi kecil berarti X kecil, pf beban baik, atau ada kompensasi. Regulasi negatif mungkin terjadi pada beban mendahului atau saluran panjang (Ferranti).",
                   [("V_{R,nl}", "Tegangan terima tanpa beban (V_S tetap)"), ("V_{R,fl}", "Tegangan terima beban penuh"), ("|A|", "Magnitudo konstanta A (< 1 bila ada kapasitansi)")])
    isi += formula(6, "Rugi dan Efisiensi Penyaluran", r"P_{rugi} = 3\,I^2 R, \qquad \eta = \dfrac{P_R}{P_R + P_{rugi}}\times100\% = \dfrac{P_R}{P_S}\times100\%",
                   rf"Saluran contoh: \(P_{{rugi}} = 3\times{ind(I_R, 1)}^2\times{ind(R_L, 0)} = {ind(LOSS_MW, 2)}\) MW, \(\eta = {ind(P_LOAD, 0)}/({ind(P_LOAD, 0)} + {ind(LOSS_MW, 2)}) = {ind(ETA, 1)}\%\). Pada pf 0,8 rugi menjadi \({ind(3 * (P_LOAD * 1e6 / (3 * VR * 0.8)) ** 2 * R_L / 1e6, 2)}\) MW; rugi sebanding \(1/\text{{pf}}^2\) untuk P yang sama.",
                   "Rugi transmisi PLN nasional sekitar 2–3%, distribusi 6–8%; setiap persen pada sistem 30 GW adalah ratusan megawatt yang harus dibangkitkan tanpa dibayar. Menaikkan tegangan (I turun) dan memperbaiki pf (I turun) adalah dua cara menekannya, persis seperti kabel DC di Modul 3.",
                   [("P_{rugi}", "Rugi tembaga tiga fasa (W)"), ("P_R, P_S", "Daya terima dan daya kirim (W)"), ("\\eta", "Efisiensi penyaluran")])
    isi += cards([
        ("🎚️", "Tap Trafo (OLTC)", "Trafo gardu induk mengubah tap ±10% secara otomatis mengikuti tegangan rel; menutupi regulasi saluran sepanjang hari tanpa menyentuh saluran.", None),
        ("🧮", "Rugi Sebanding I²", "Menggandakan beban menggandakan arus dan melipatempatkan rugi; itulah alasan jam puncak sangat mahal bagi utilitas dan tarif beban puncak lebih tinggi.", r"\(P_{rugi} \propto I^2\)"),
        ("⚡", "Rugi Korona", "Pada saluran ≥ 275 kV, medan listrik permukaan konduktor mengionkan udara; rugi korona bertambah saat hujan. Konduktor berkas menekannya (Modul 7).", None),
        ("🌡️", "Suhu Konduktor", "R naik ±0,4%/°C; konduktor 75 °C di siang panas mempunyai R 20% lebih besar daripada tabel 20 °C. Pemeriksaan rugi memakai R pada suhu kerja.", None),
        ("📊", "Faktor Rugi", "Rugi energi setahun dihitung dari kurva beban: faktor rugi ≈ 0,3·FB + 0,7·FB² dengan FB faktor beban; rugi puncak tidak berlangsung sepanjang tahun.", None),
        ("💰", "Nilai Ekonomi", "Menaikkan efisiensi 1% pada saluran 60 MW menghemat ±5 GWh/tahun; pertimbangan yang menentukan penampang konduktor dan tegangan sistem (Kelvin's law).", None),
    ])
    isi += tabel(["Kasus (60 MW, 132 kV, saluran contoh)", "I (A)", "V_S diperlukan (kV)", "Regulasi", "Rugi (MW)", "η"], [
        [f"pf {ind(PF_LOAD, 1)} tertinggal", ind(I_R, 0), ind(VS_LL, 1), ind(REG_PI, 1) + "%", ind(LOSS_MW, 2), ind(ETA, 2) + "%"],
        [f"pf {ind(PF2, 2)} (kapasitor {ind(QC_SH, 1)} MVAR)", ind(I_R2, 0), ind(VS2_LL, 1), ind((abs(VS2_C) / abs(A_C) - VR) / VR * 100, 1) + "%", ind(LOSS2_MW, 2), ind(P_LOAD / (P_LOAD + LOSS2_MW) * 100, 2) + "%"],
        ["pf 1,0", ind(P_LOAD * 1e6 / (3 * VR), 0), ind(abs(A_C * VR + Z_C * (P_LOAD * 1e6 / (3 * VR))) * SQ3 / 1000, 1), ind((abs(A_C * VR + Z_C * (P_LOAD * 1e6 / (3 * VR))) / abs(A_C) - VR) / VR * 100, 1) + "%", ind(3 * (P_LOAD * 1e6 / (3 * VR)) ** 2 * R_L / 1e6, 2), ind(P_LOAD / (P_LOAD + 3 * (P_LOAD * 1e6 / (3 * VR)) ** 2 * R_L / 1e6) * 100, 2) + "%"],
        ["tanpa beban (V_S = 132 kV)", "0", "132,0", f"V_R = {ind(132 / abs(A_C), 1)} kV (Ferranti +{ind(FERRANTI, 1)}%)", "0", "—"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> memperbaiki pf beban dari 0,9 ke 0,98 memangkas regulasi hampir setengah dan rugi 16% tanpa mengubah saluran. Baris terakhir memperlihatkan efek Ferranti kecil pada saluran 150 km; pada saluran 400 km efeknya bisa di atas 10%. Soal C3–C5, C12, dan C13 memakai Persamaan (5)–(6).")
    m += bagian(3, "m-regulasi", "Regulasi Tegangan<br>dan Efisiensi Saluran",
                "Dua angka merangkum kinerja sebuah saluran: seberapa jauh tegangan ujungnya berayun antara tanpa beban dan beban penuh (regulasi), dan seberapa besar daya yang hilang di sepanjang jalan (efisiensi). Persamaan (5) dan (6) mendefinisikan keduanya; Gambar 3 memperlihatkan bagaimana faktor daya beban mengubah tegangan kirim yang diperlukan.",
                isi, "REGULASI DAN EFISIENSI")

    # 04 — kompensasi shunt
    isi = figure(4, "Kompensasi shunt: kapasitor di ujung terima", f"Beban {ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)} meminta {ind(P_LOAD * math.tan(PHI), 1)} MVAR dari saluran; kapasitor {ind(QC_SH, 1)} MVAR di ujung terima memasok sebagian besarnya secara lokal sehingga arus saluran dan tegangan kirim yang diperlukan turun.", gambar4())
    isi += formula(7, "Kapasitor Shunt, Efek Ferranti, dan SIL", r"Q_C = P(\tan\varphi_1 - \tan\varphi_2), \qquad \dfrac{V_{R,nl}}{V_S} = \dfrac{1}{|A|} \approx \dfrac{1}{1 - \omega^2 LC\ell^2/2}, \qquad Z_c = \sqrt{\dfrac{L}{C}}, \quad SIL = \dfrac{V_L^2}{Z_c}",
                   rf"Gambar 4: \(Q_C = {ind(P_LOAD, 0)}(\tan{ind(math.degrees(PHI), 1)}^\circ - \tan{ind(math.degrees(math.acos(PF2)), 1)}^\circ) = {ind(QC_SH, 1)}\) MVAR; V_S turun dari {ind(VS_LL, 1)} ke {ind(VS2_LL, 1)} kV. Saluran contoh: \(Z_c = \sqrt{{1{{,}}2\,\text{{mH}}/9{{,}}5\,\text{{nF}}}} = {ind(ZC_SURJA, 0)}\) Ω, \(SIL = 132^2/{ind(ZC_SURJA, 0)} = {ind(SIL, 0)}\) MW: beban {ind(P_LOAD, 0)} MW berada di atas SIL, sehingga saluran 'menyerap' Q dan tegangan turun.",
                   "Kapasitansi saluran membangkitkan Q (∝ V²), induktansinya menyerap Q (∝ I²). Pada beban = SIL keduanya seimbang dan profil tegangan rata; di bawah SIL saluran menjadi sumber Q dan tegangan naik (Ferranti, perlu <em>reaktor</em> shunt); di atas SIL saluran menyerap Q dan tegangan turun (perlu <em>kapasitor</em> shunt). Kompensasi shunt mengatur tegangan, bukan menaikkan batas daya secara langsung.",
                   [("Q_C", "Daya reaktif kapasitor shunt (VAR)"), ("V_{R,nl}", "Tegangan terima tanpa beban"), ("Z_c", "Impedansi surja / karakteristik (Ω)"), ("SIL", "Surge impedance loading (W)")])
    isi += cards([
        ("🔋", "Kapasitor Shunt", "Bank kapasitor di gardu induk dan penyulang, disambung bertahap saat beban naik. Murah, tetapi Q-nya jatuh ∝ V² justru saat tegangan rendah.", r"\(Q_C \propto V^2\)"),
        ("🧲", "Reaktor Shunt", "Kumparan besar di ujung saluran 500 kV untuk menyerap Q kapasitansi saluran saat beban ringan; disambung malam hari, dilepas siang.", None),
        ("⚙️", "SVC dan STATCOM", "Kompensator statis berbasis tiristor/konverter yang memasok atau menyerap Q dalam milidetik; menjaga tegangan saat gangguan dan beban tanur busur.", None),
        ("🔄", "Kondensor Sinkron", "Motor sinkron tanpa beban dengan eksitasi variabel: Q dua arah, tahan tegangan rendah. Kembali populer untuk menopang jaringan bertenaga surya/angin.", None),
        ("📍", "Di Mana Memasang", "Sedekat mungkin ke beban reaktif: Q yang dikirim jauh membuang tegangan (X·I_Q) dan rugi. Kompensasi di gardu beban jauh lebih efektif daripada di pembangkit.", None),
        ("⚠️", "Tegangan Lebih", "Kapasitor yang tetap tersambung saat beban lepas, atau saluran panjang tanpa beban, menaikkan tegangan di atas 1,1 pu dan merusak isolasi; itulah alasan reaktor dan pengendali otomatis.", None),
    ])
    isi += tabel(["Kondisi saluran contoh (V_S = 132 kV)", "Beban terhadap SIL", "V_R (kV)", "Tindakan"], [
        ["Tanpa beban", "0", ind(132 / abs(A_C), 1), "reaktor shunt bila > 1,05 pu"],
        [f"Beban = SIL ≈ {ind(SIL, 0)} MW, pf 1", "1", "≈ 132", "tidak perlu kompensasi"],
        [f"{ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)}", ind(P_LOAD / SIL, 2), ind(132 / (VS_LL / 132), 1), f"kapasitor shunt {ind(QC_SH, 0)} MVAR → V_R ≈ {ind(132 / (VS2_LL / 132), 1)} kV"],
        ["100 MW pf 0,9", ind(100 / SIL, 2), ind(132 / (abs(A_C * VR + Z_C * cmath.rect(100e6 / (3 * VR * 0.9), -PHI)) * SQ3 / 1000 / 132), 1), "kapasitor + tap trafo, atau kompensasi seri"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> tegangan ujung terima 'melorot' seiring beban di atas SIL; kapasitor shunt mengembalikannya ke ±5%. Perhatikan bahwa kapasitor shunt tidak menaikkan P_maks = V_SV_R/X (Persamaan 4) secara langsung: ia menaikkan V_R, dan lewat itulah daya yang dapat disalurkan bertambah. Untuk menaikkan batas daya secara langsung, X harus dikecilkan: kompensasi seri (Bagian 05). Soal C7, C8, dan C10 memakai Persamaan (7).")
    m += bagian(4, "m-shunt", "Kompensasi Shunt:<br>Kapasitor, Reaktor, dan SIL",
                "Karena Q sulit dikirim jauh, cara paling murah menjaga tegangan ujung saluran adalah memasok Q di tempat: kapasitor shunt saat beban berat, reaktor shunt saat saluran hampir kosong. Persamaan (7) merangkum ketiganya bersama dua konsep yang menjelaskan kapan masing-masing diperlukan: efek Ferranti dan surge impedance loading. Gambar 4 memperlihatkan pengaruh kapasitor pada saluran contoh.",
                isi, "KOMPENSASI SHUNT")

    # 05 — kompensasi seri
    isi = figure(5, "Kurva P–δ dan kompensasi seri", f"Saluran {ind(V_SER, 0)} kV, X = {ind(X_SER, 0)} Ω dapat menyalurkan paling banyak {ind(PM0, 0)} MW; kapasitor seri {ind(K_SER * 100, 0)}% menaikkannya ke {ind(PM1, 0)} MW dan memperkecil sudut daya beban {ind(P_OP, 0)} MW dari {ind(D0, 1)}° ke {ind(D1, 1)}°.", gambar5())
    isi += formula(8, "Kompensasi Seri dan Batas Transfer Daya", r"X_{eff} = X_L - X_C = X_L(1 - k), \qquad P_{maks} = \dfrac{V_S V_R}{X_L(1 - k)}, \qquad \sin\delta = \dfrac{P\,X_{eff}}{V_S V_R}",
                   rf"Gambar 5: \(P_{{maks}} = 220^2/80 = {ind(PM0, 0)}\) MW tanpa kompensasi; dengan \(k = {ind(K_SER, 1)}\), \(X_{{eff}} = {ind(X_SER * (1 - K_SER), 0)}\) Ω dan \(P_{{maks}} = {ind(PM1, 0)}\) MW. Beban {ind(P_OP, 0)} MW: \(\delta\) turun dari {ind(D0, 1)}° ke {ind(D1, 1)}°, cadangan kestabilan naik dari {ind((1 - P_OP / PM0) * 100, 0)}% ke {ind((1 - P_OP / PM1) * 100, 0)}%.",
                   "Kapasitor seri 'memendekkan' saluran secara elektrik: jatuh tegangan reaktif dan sudut daya berkurang, batas daya naik, dan pembagian aliran antar-saluran paralel dapat diatur. Derajat kompensasi praktis 25–70%; lebih dari itu menimbulkan risiko resonansi subsinkron dengan poros turbin dan persoalan proteksi. Kapasitor seri dilindungi MOV dan celah percik karena arus hubung singkat melewatinya.",
                   [("k", "Derajat kompensasi X_C/X_L"), ("X_{eff}", "Reaktansi seri efektif (Ω)"), ("\\delta", "Sudut daya operasi")])
    isi += cards([
        ("🎯", "Kapan Dipakai", "Saluran panjang 275–500 kV yang batas dayanya ditentukan kestabilan, bukan termal: Jawa–Bali 500 kV, interkoneksi Sumatera. Lebih murah daripada saluran baru.", None),
        ("📏", "Sudut Daya Aman", "Operator menjaga δ sekitar 30° pada beban puncak agar ada cadangan menghadapi gangguan; kompensasi seri adalah cara menurunkan δ tanpa mengurangi P.", r"\(\delta \lesssim 30^\circ\)"),
        ("⚖️", "Pembagian Beban", "Dua saluran paralel berbagi P berbanding terbalik X; kapasitor seri pada salah satunya 'menarik' lebih banyak aliran, alat pengatur aliran daya yang sederhana.", r"\(P_k \propto 1/X_k\)"),
        ("🌀", "Resonansi Subsinkron", "X_L dan X_C seri membentuk resonansi listrik di bawah 50 Hz yang dapat berpasangan dengan mode puntir poros turbin–generator (kecelakaan Mohave 1970–71); dibatasi lewat k dan filter.", None),
        ("🛡️", "Proteksi Kapasitor", "Saat hubung singkat, arus besar menaikkan tegangan kapasitor; MOV paralel dan celah percik membypass-nya dalam mikrodetik, lalu disambung kembali.", None),
        ("🔌", "FACTS", "TCSC (kapasitor seri terkendali tiristor) dan UPFC mengubah X_eff atau sudut secara dinamis; generasi lanjutan dari kompensasi seri tetap.", None),
    ])
    isi += tabel(["Derajat kompensasi k", "X_eff (Ω)", "P_maks (MW)", f"δ pada {ind(P_OP, 0)} MW", "Cadangan"],
                 [[f"{k * 100:.0f}%", ind(X_SER * (1 - k), 0), ind(V_SER ** 2 / (X_SER * (1 - k)), 0), ind(math.degrees(math.asin(P_OP / (V_SER ** 2 / (X_SER * (1 - k))))), 1) + "°", ind((1 - P_OP / (V_SER ** 2 / (X_SER * (1 - k)))) * 100, 0) + "%"] for k in [0, 0.2, 0.4, 0.6, 0.7]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> dari 40% ke 70% kompensasi, P_maks naik dua kali lipat lagi, tetapi risiko resonansi subsinkron dan tegangan lebih pada kapasitor ikut naik; rancangan praktis berhenti di 50–70%. Soal C9 dan C14 memakai Persamaan (8).")
    m += bagian(5, "m-seri", "Kompensasi Seri dan<br>Batas Transfer Daya",
                "Persamaan (4) menetapkan bahwa daya maksimum yang dapat melewati saluran berbanding terbalik dengan reaktansi serinya. Kapasitor yang dipasang seri membatalkan sebagian reaktansi itu: batas daya naik, sudut daya turun, dan saluran yang sama dapat memikul lebih banyak dengan kestabilan yang lebih baik. Persamaan (8) menghitungnya, Gambar 5 memperlihatkan kurva P–δ sebelum dan sesudah.",
                isi, "KOMPENSASI SERI")

    # 06 — transien gelombang berjalan
    isi = figure(6, "Gelombang berjalan di sambungan saluran udara ke kabel", f"Surja {ind(V_SURJA, 0)} kV yang tiba dari saluran udara ({ind(Z1_S, 0)} Ω) ke kabel ({ind(Z2_S, 0)} Ω) hanya diteruskan {ind(TAU * V_SURJA, 1)} kV; sisanya dipantulkan negatif. Sebaliknya, dari kabel ke saluran udara tegangan diteruskan hampir dua kali lipat.", gambar6())
    isi += formula(9, "Gelombang Berjalan: Impedansi Surja dan Kecepatan Rambat", r"Z_c = \sqrt{\dfrac{L}{C}}, \qquad v = \dfrac{1}{\sqrt{LC}}, \qquad v_{\text{surja}}(t) = Z_c\, i_{\text{surja}}(t)",
                   rf"Saluran udara: \(Z_c = \sqrt{{1{{,}}2\times10^{{-3}}/9{{,}}5\times10^{{-9}}}} = {ind(ZC_SURJA, 0)}\) Ω, \(v = 1/\sqrt{{LC}} \approx {ind(V_CEPAT / 1000, 0)}\times10^3\) km/s (mendekati cahaya); kabel: \(Z_c\) 30–60 Ω, \(v\) sekitar setengahnya karena isolasi berpermitivitas tinggi. Surja {ind(V_SURJA, 0)} kV membawa arus \({ind(V_SURJA, 0)}/{ind(ZC_SURJA, 0)} = {ind(V_SURJA * 1000 / ZC_SURJA, 0)}\) A.",
                   "Petir dan pensaklaran menimbulkan perubahan dalam mikrodetik; pada skala waktu itu saluran bukan rangkaian terkumpul melainkan medium rambat. Tegangan dan arus surja merambat bersama dengan perbandingan tetap Z_c, dan sampai ada perubahan impedansi (ujung, sambungan, trafo) gelombang tidak 'tahu' apa yang ada di depannya.",
                   [("Z_c", "Impedansi surja (Ω), sama dengan impedansi karakteristik tanpa rugi"), ("v", "Kecepatan rambat (km/s)"), ("L, C", "Induktansi dan kapasitansi per satuan panjang")])
    isi += formula(10, "Pantulan dan Transmisi di Titik Diskontinuitas", r"\rho = \dfrac{Z_2 - Z_1}{Z_1 + Z_2}, \qquad \tau = 1 + \rho = \dfrac{2Z_2}{Z_1 + Z_2}, \qquad V_{pantul} = \rho V, \quad V_{teruskan} = \tau V",
                   rf"Gambar 6: \(\rho = ({ind(Z2_S, 0)} - {ind(Z1_S, 0)})/({ind(Z1_S, 0)} + {ind(Z2_S, 0)}) = {ind(RHO, 3)}\), \(\tau = {ind(TAU, 3)}\): diteruskan {ind(TAU * V_SURJA, 1)} kV, dipantulkan {ind(RHO * V_SURJA, 1)} kV. Ujung terbuka (\(Z_2 \to \infty\)): \(\rho = 1\), tegangan berlipat dua; ujung hubung singkat: \(\rho = -1\), tegangan nol dan arus berlipat dua; beban \(Z_2 = Z_c\): tanpa pantulan.",
                   "Dua akibat praktis: (1) trafo (impedansi surja ribuan ohm) di ujung saluran melihat hampir dua kali tegangan surja, sehingga arester dipasang tepat di terminalnya; (2) kabel di depan gardu 'meredam' surja dari saluran udara, tetapi surja yang memasuki saluran udara dari kabel justru diperbesar. Arester surja adalah Z_2 tak linear yang menjadi kecil saat tegangan melampaui ambangnya.",
                   [("\\rho", "Koefisien pantul tegangan"), ("\\tau", "Koefisien transmisi tegangan"), ("Z_1, Z_2", "Impedansi surja sebelum dan sesudah sambungan (Ω)")])
    isi += cards([
        ("⚡", "Surja Petir", "Sambaran 10–30 kA pada Z_c/2 (dua arah) menimbulkan jutaan volt; kawat tanah dan pentanahan menara menangkapnya, arester memotong yang tersisa.", r"\(V = I\,Z_c/2\)"),
        ("🔀", "Surja Switching", "Menutup pemutus pada saluran kosong memantulkan gelombang di ujung terbuka: 2 pu, dengan muatan sisa bisa 3 pu. Penentu isolasi saluran ≥ 500 kV; ditekan resistor pra-sisip.", None),
        ("🛡️", "Arester (MOV)", "Varistor ZnO: impedansi tinggi pada tegangan normal, sangat rendah di atas ambang. Dipasang sedekat mungkin ke trafo karena tiap meter kawat menambah L·di/dt.", None),
        ("📡", "Diagram Lattice", "Pantulan berulang di dua ujung digambarkan diagram kisi (Bewley): tiap pantulan dikalikan ρ ujungnya, dijumlahkan pada waktu tiba. Cell 4 menirunya.", None),
        ("🔌", "Trafo di Ujung", "Z_surja trafo ≫ Z_c saluran: ρ ≈ +1, tegangan terminal ≈ 2V datang; muka gelombang curam menekan isolasi lilitan pertama, alasan BIL (basic insulation level).", None),
        ("🛰️", "Lokasi Gangguan", "Pemantau gelombang berjalan mengukur selisih waktu tiba di dua ujung (v ≈ 300 m/µs) untuk menentukan titik gangguan dalam ratusan meter.", r"\(x = \tfrac{\ell - v\,\Delta t}{2}\)"),
    ])
    isi += tabel(["Diskontinuitas (Z₁ → Z₂)", "ρ", "τ", f"V teruskan dari {ind(V_SURJA, 0)} kV", "Catatan"], [
        [f"Udara {ind(Z1_S, 0)} Ω → kabel {ind(Z2_S, 0)} Ω", ind(RHO, 3), ind(TAU, 3), f"{ind(TAU * V_SURJA, 1)} kV", "kabel meredam surja"],
        [f"Kabel {ind(Z2_S, 0)} Ω → udara {ind(Z1_S, 0)} Ω", ind(-RHO, 3), ind(2 * Z1_S / (Z1_S + Z2_S), 3), f"{ind(2 * Z1_S / (Z1_S + Z2_S) * V_SURJA, 1)} kV", "surja diperbesar"],
        ["Udara → ujung terbuka", "1", "2", f"{ind(2 * V_SURJA, 0)} kV", "tegangan berlipat dua"],
        ["Udara → hubung singkat", "−1", "0", "0 kV", "arus berlipat dua"],
        [f"Udara → beban {ind(Z1_S, 0)} Ω", "0", "1", f"{ind(V_SURJA, 0)} kV", "tanpa pantulan (matched)"],
        ["Udara → trafo (≈ 5000 Ω)", ind((5000 - Z1_S) / (5000 + Z1_S), 3), ind(2 * 5000 / (5000 + Z1_S), 3), f"{ind(2 * 5000 / (5000 + Z1_S) * V_SURJA, 0)} kV", "arester wajib di terminal"],
    ])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> motor dan VSD di pabrik melihat surja yang sama: kabel motor panjang dengan inverter PWM (muka gelombang < 1 µs) memantulkan gelombang di terminal motor (Z_motor ≫ Z_kabel) sehingga tegangan lilitan mencapai 2 pu, penyebab kerusakan isolasi motor 'baru'. Obatnya sama dengan sistem transmisi: reaktor/filter dv/dt, kabel lebih pendek, atau motor berisolasi inverter-duty. Soal C10 dan C15 memakai Persamaan (9)–(10).")
    m += bagian(6, "m-transien", "Transien Saluran:<br>Gelombang Berjalan",
                "Pada frekuensi 50 Hz saluran ratusan kilometer dapat diwakili beberapa elemen terkumpul, tetapi petir dan pensaklaran berubah dalam mikrodetik, ketika sinyal baru merambat ratusan meter. Di sana saluran berperilaku sebagai medium gelombang dengan impedansi surja dan kecepatan rambat pada Persamaan (9), dan setiap perubahan impedansi memantulkan sebagian gelombang menurut Persamaan (10). Gambar 6 memperlihatkan kasus paling umum: dari saluran udara ke kabel.",
                isi, "TRANSIEN")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Diagram Fasor Saluran Pendek \(\mathbf{V}_S = \mathbf{V}_R + \mathbf{I}(R + jX)\) pada 66 kV", "cvFasorSaluran",
                     [("sl_fl_p", "v_fl_p", "Beban P (MW)", 0, 40, 0.5, 18, "18.0"), ("sl_fl_pf", "v_fl_pf", "Faktor daya beban", 0.6, 1.0, 0.01, 0.8, "0.80"), ("sl_fl_r", "v_fl_r", "R saluran (Ω)", 1, 30, 0.5, 9, "9.0"), ("sl_fl_x", "v_fl_x", "X saluran (Ω)", 5, 60, 0.2, 25.2, "25.2")],
                     "btnFasorSaluran", "toggleFasorSaluran", "fasorSaluranInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Biru V_R (acuan), merah arus beban, kuning jatuh tegangan I·R (sejajar arus), ungu j·I·X (tegak lurus arus), hijau V_S hasilnya; batang di kanan membandingkan tegangan antar-saluran kedua ujung.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Menurunkan pf memutar arus ke bawah</strong> dan membuat j·I·X hampir sejajar V_R: jatuh tegangan membesar. (2) Pada pf 1, j·I·X tegak lurus V_R dan hanya sedikit menambah panjang V_S. (3) Readout memberi ΔV pendekatan, regulasi, rugi, dan sudut δ. Soal C2, C6, dan C13.")
    isi += anim_panel(2, "amber", r"Profil Tegangan Sepanjang Saluran 132 kV: Beban Berat, SIL, dan Efek Ferranti", "cvProfil",
                      [("sl_pr_l", "v_pr_l", "Panjang saluran (km)", 50, 400, 10, 150, "150"), ("sl_pr_p", "v_pr_p", "Beban P (MW)", 0, 120, 5, 60, "60"), ("sl_pr_pf", "v_pr_pf", "Faktor daya beban", 0.7, 1.0, 0.01, 0.9, "0.90"), ("sl_pr_qc", "v_pr_qc", "Kapasitor shunt ujung terima (MVAR)", 0, 60, 2, 0, "0")],
                      "btnProfil", "toggleProfil", "profilInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kurva hijau adalah tegangan sepanjang saluran (kirim di kiri, terima di kanan) bila tegangan kirim dijaga 132 kV, dihitung dari 30 segmen π; garis merah putus-putus batas ±5 %.<br>Amati: (1) <strong style=\"color:var(--amber)\">Atur beban 0 MW dan panjang 300–400 km</strong>: tegangan ujung terima naik di atas kirim (efek Ferranti). (2) Beban di sekitar SIL (readout) memberi profil hampir rata. (3) Tambahkan kapasitor shunt pada beban berat dan lihat ujung terima terangkat kembali. Soal C7, C11, dan C12.")
    isi += anim_panel(3, "green", r"Kurva \(P\)–\(\delta\), Kompensasi Seri, dan Cadangan Kestabilan", "cvTransfer",
                      [("sl_tr_v", "v_tr_v", "Tegangan kedua ujung (kV)", 132, 500, 1, 220, "220"), ("sl_tr_x", "v_tr_x", "Reaktansi saluran X (Ω)", 20, 200, 1, 80, "80"), ("sl_tr_k", "v_tr_k", "Derajat kompensasi seri (%)", 0, 75, 1, 40, "40"), ("sl_tr_p", "v_tr_p", "Daya yang disalurkan (MW)", 50, 1500, 10, 400, "400")],
                      "btnTransfer", "toggleTransfer", "transferInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Kurva abu-abu P = V² sin δ/X tanpa kompensasi, hijau dengan kapasitor seri; garis kuning adalah daya beban, dan titik biru berayun di sekitar sudut operasinya.<br>Amati: (1) <strong style=\"color:var(--green)\">Naikkan k</strong>: puncak kurva naik dan titik operasi bergeser ke kiri (δ lebih kecil, lebih stabil). (2) Naikkan P sampai melampaui puncak: tidak ada titik operasi, sistem lepas sinkron. (3) Menggandakan tegangan melipatempatkan P_maks: alasan transmisi 500 kV. Soal C9 dan C14.")
    isi += anim_panel(4, "pink", r"Gelombang Berjalan: Pantulan dan Transmisi di Sambungan \(Z_1 \to Z_2\)", "cvGelombang",
                      [("sl_gw_v", "v_gw_v", "Tegangan surja datang (kV)", 20, 500, 5, 150, "150"), ("sl_gw_z1", "v_gw_z1", "Z₁ saluran udara (Ω)", 100, 600, 5, 380, "380"), ("sl_gw_z2", "v_gw_z2", "Z₂ sesudah sambungan (Ω)", 5, 5000, 5, 45, "45")],
                      "btnGelombang", "toggleGelombang", "gelombangInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Pulsa biru merambat ke kanan dan tiba di sambungan (garis kuning); pulsa merah adalah pantulan yang kembali, hijau yang diteruskan (lebih lambat bila Z₂ kabel).<br>Amati: (1) <strong style=\"color:var(--pink)\">Z₂ = 45 Ω (kabel)</strong>: pantulan negatif besar, transmisi kecil. (2) Naikkan Z₂ ke 5000 Ω (trafo): transmisi mendekati dua kali tegangan datang. (3) Z₂ = Z₁: tidak ada pantulan. Soal C10 dan C15.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 2 atur 150 km, 60 MW, pf 0,90 tanpa kapasitor dan cocokkan V_R dengan Bagian 03 (V_S 132 kV → V_R ≈ {ind(132 / (VS_LL / 132), 1)} kV); tambahkan kapasitor sampai V_R kembali ±132 kV dan bandingkan MVAR-nya dengan {ind(QC_SH, 0)} MVAR pada Gambar 4. Pada Animasi 4 atur Z₁ = 400, Z₂ = 50 dan cocokkan τ = {ind(TAU, 3)} dengan Gambar 6.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Saluran Transmisi",
                "Geser beban, faktor daya, panjang saluran, kompensasi, dan impedansi surja, lalu amati fasor tegangan kirim, profil tegangan sepanjang saluran, kurva P–δ, dan gelombang yang dipantulkan di sambungan. Empat animasi ini memvisualkan Persamaan (1)–(10).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>; bilangan kompleks Python (<code>1j</code>) dipakai sebagai fasor. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan pada label soal (V per fasa vs kV antar-saluran, W vs MW, µF) dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Saluran Pendek: Fasor V_S, Jatuh Tegangan, Regulasi, dan Efisiensi", f'''import numpy as np, cmath

VLL, L = {ind(VLL, 0)}e3, {ind(L_KM, 0)}.0                      # V antar-saluran, km
r, x = {ind(R_KM, 1).replace(",", ".")}, {ind(X_KM, 1).replace(",", ".")}                                # ohm/km
R, X = r*L, x*L
P, pf = {ind(P_LOAD, 0)}e6, {ind(PF_LOAD, 1).replace(",", ".")}
V_R = VLL/np.sqrt(3) + 0j                          # acuan 0 deg, per fasa
I = P/(3*abs(V_R)*pf) * cmath.exp(-1j*np.arccos(pf))   # tertinggal
V_S = V_R + I*(R + 1j*X)                            # Persamaan 1 & 3
dV_pendekatan = abs(I)*(R*pf + X*np.sin(np.arccos(pf)))
print(f"I = {{abs(I):.2f}} A; V_S = {{abs(V_S)/1e3:.3f}} kV/fasa = {{abs(V_S)*np.sqrt(3)/1e3:.3f}} kV LL, delta = {{np.degrees(cmath.phase(V_S)):.3f}} deg")
print(f"dV eksak = {{(abs(V_S)-abs(V_R))/1e3:.3f}} kV/fasa; pendekatan I(R cos + X sin) = {{dV_pendekatan/1e3:.3f}} kV/fasa")
rugi = 3*abs(I)**2*R
print(f"Regulasi (pendek) = {{(abs(V_S)-abs(V_R))/abs(V_R)*100:.3f}} %; rugi = {{rugi/1e6:.4f}} MW; eta = {{P/(P+rugi)*100:.4f}} %")''')
    isi += kode("Cell 2 — Saluran Menengah Nominal-π: ABCD, V_S, Regulasi, dan Efek Ferranti", f'''import numpy as np, cmath

VLL, R, X, B = {ind(VLL, 0)}e3, {ind(R_L, 0)}.0, {ind(X_L, 0)}.0, {ind(B_L * 1e6, 0)}e-6      # ohm, ohm, siemens (total)
Z, Y = R + 1j*X, 1j*B
A = 1 + Y*Z/2;  Bc = Z;  C = Y*(1 + Y*Z/4);  D = A          # Persamaan 2
print(f"A = {{A:.5f}} (|A| = {{abs(A):.5f}}), B = {{Bc}}, C = {{C:.3e}} S; cek AD - BC = {{A*D - Bc*C:.6f}}")

def ujung_kirim(P_MW, pf, tertinggal=True):
    V_R = VLL/np.sqrt(3) + 0j
    I_R = P_MW*1e6/(3*abs(V_R)*pf) * cmath.exp((-1j if tertinggal else 1j)*np.arccos(pf))
    V_S = A*V_R + Bc*I_R;  I_S = C*V_R + D*I_R
    return V_S, I_S, I_R

for P_MW, pf in [(30, 0.9), ({ind(P_LOAD, 0)}, {ind(PF_LOAD, 1).replace(",", ".")}), ({ind(P_LOAD, 0)}, 1.0), (100, 0.9)]:
    V_S, I_S, I_R = ujung_kirim(P_MW, pf)
    V_R_nl = abs(V_S)/abs(A)                                 # Persamaan 5
    VR_pct = (V_R_nl - VLL/np.sqrt(3))/(VLL/np.sqrt(3))*100
    P_S = 3*(V_S*np.conj(I_S)).real
    print(f"{{P_MW:4d}} MW pf {{pf:.2f}}: V_S = {{abs(V_S)*np.sqrt(3)/1e3:.3f}} kV, delta = {{np.degrees(cmath.phase(V_S)):.2f}} deg, regulasi = {{VR_pct:.3f}} %, eta = {{P_MW*1e6/P_S*100:.3f}} %")
print(f"Tanpa beban (V_S = 132 kV): V_R = {{132/abs(A):.3f}} kV -> Ferranti +{{(1/abs(A)-1)*100:.3f}} %")''')
    isi += kode("Cell 3 — Kompensasi Shunt dan Seri: Q_C, SIL, dan Kurva P–δ", f'''import numpy as np
import matplotlib.pyplot as plt

# ═══ Kapasitor shunt di ujung terima (Persamaan 7) ═══
P, pf1, pf2 = {ind(P_LOAD, 0)}.0, {ind(PF_LOAD, 1).replace(",", ".")}, {ind(PF2, 2).replace(",", ".")}
Qc = P*(np.tan(np.arccos(pf1)) - np.tan(np.arccos(pf2)))
print(f"Q_C = {{Qc:.3f}} MVAR; arus saluran turun {{(1 - pf1/pf2)*100:.1f}} %")
L_km, C_km = 1.2e-3, 0.0095e-6
Zc = np.sqrt(L_km/C_km);  SIL = 132**2/Zc
print(f"Z_c = {{Zc:.2f}} ohm, SIL = {{SIL:.2f}} MW; beban {{P:.0f}} MW = {{P/SIL:.2f}} SIL")

# ═══ Kompensasi seri (Persamaan 8) ═══
V, X = {ind(V_SER, 0)}.0, {ind(X_SER, 0)}.0
for k in [0, 0.2, 0.4, 0.6]:
    Xeff = X*(1 - k);  Pmax = V**2/Xeff
    print(f"k = {{k:.1f}}: X_eff = {{Xeff:.1f}} ohm, P_maks = {{Pmax:.1f}} MW, delta(400 MW) = {{np.degrees(np.arcsin(400/Pmax)):.2f}} deg")

d = np.linspace(0, 180, 361)
plt.figure(figsize=(7, 4))
for k in [0, 0.4]: plt.plot(d, V**2/(X*(1-k))*np.sin(np.radians(d)), label=f'k = {{k}}')
plt.axhline(400, ls=':', color='tab:orange'); plt.xlabel('delta (deg)'); plt.ylabel('P (MW)'); plt.legend(); plt.grid(True); plt.title('Kurva P-delta'); plt.show()''')
    isi += kode("Cell 4 — Gelombang Berjalan: Pantulan, Transmisi, dan Diagram Kisi Sederhana", f'''import numpy as np

# ═══ Impedansi surja dan koefisien (Persamaan 9–10) ═══
L_km, C_km = 1.2e-3, 0.0095e-6
Zc = np.sqrt(L_km/C_km); v = 1/np.sqrt(L_km*C_km)           # ohm, km/s
print(f"Z_c = {{Zc:.2f}} ohm, v = {{v/1e3:.1f}} x10^3 km/s = {{v/1e3:.1f}} m/us")

def koef(Z1, Z2):
    rho = (Z2 - Z1)/(Z1 + Z2);  return rho, 1 + rho
V = {ind(V_SURJA, 0)}.0
for nama, Z1, Z2 in [("udara->kabel", {ind(Z1_S, 0)}, {ind(Z2_S, 0)}), ("kabel->udara", {ind(Z2_S, 0)}, {ind(Z1_S, 0)}), ("udara->terbuka", {ind(Z1_S, 0)}, 1e12), ("udara->trafo", {ind(Z1_S, 0)}, 5000)]:
    rho, tau = koef(Z1, Z2)
    print(f"{{nama:15s}}: rho = {{rho:+.4f}}, tau = {{tau:.4f}}, V_pantul = {{rho*V:+.2f}} kV, V_teruskan = {{tau*V:.2f}} kV")

# ═══ Diagram kisi: kabel 2 km (Z_c 50, v 150 m/us) antara saluran udara (400) dan trafo (5000) ═══
Z1, Zk, Z3, panjang, v_k = 400.0, 50.0, 5000.0, 2000.0, 150.0     # m, m/us
rho_a, tau_a = koef(Z1, Zk)          # masuk kabel
rho_t = (Z3 - Zk)/(Z3 + Zk)          # pantul di trafo
rho_b = (Z1 - Zk)/(Z1 + Zk)          # pantul kembali di sambungan (dilihat dari kabel)
T = panjang/v_k                      # waktu tempuh satu arah (us)
V_trafo, gel = 0.0, tau_a*V
for n in range(6):
    V_trafo += gel*(1 + rho_t)       # tiba di trafo: tegangan = datang + pantul
    print(f"t = {{T*(2*n+1):6.2f}} us: gelombang tiba {{gel:8.3f}} kV -> V_trafo kumulatif = {{V_trafo:8.3f}} kV")
    gel = gel*rho_t*rho_b            # pulang-pergi sekali
print(f"Menuju nilai tunak 2*{{tau_a:.3f}}*V/(1 - rho_t*rho_b) ... = {{tau_a*V*(1+rho_t)/(1 - rho_t*rho_b):.2f}} kV")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: V_S model π {ind(VS_LL, 1)} kV, regulasi {ind(REG_PI, 1)}%, Q_C {ind(QC_SH, 1)} MVAR, P_maks {ind(PM1, 0)} MW pada k = 0,4, dan τ = {ind(TAU, 3)}. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut menyelesaikan seluruh saluran contoh modul ini: saluran pendek dan nominal-π dengan fasor, kompensasi shunt dan seri, serta gelombang berjalan dengan diagram kisi sederhana. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 5 (model saluran, ABCD, regulasi, SIL, kompensasi) dan Bab 12 (transien: gelombang berjalan, pantulan, diagram kisi): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "J. J. Grainger &amp; W. D. Stevenson, Jr.", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 6 (hubungan arus dan tegangan pada saluran transmisi): penurunan nominal-π, saluran panjang, dan kompensasi reaktif.")
    refs += pm_ref(3, "violet", "168,85,247", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 5 (kinerja saluran, kompensasi shunt dan seri) dengan contoh MATLAB yang mudah dialihkan ke Python.")
    refs += pm_ref(4, "green", "0,224,158", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik Jilid 2: Saluran Transmisi", ", Cetakan 7. Pradnya Paramita, 2004.", "Karakteristik saluran transmisi, jatuh tegangan, dan gelombang berjalan dengan praktik Indonesia/Jepang; pustaka pendukung RPS.")
    refs += pm_ref(5, "pink", "236,72,153", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 6: aliran daya, daya reaktif, dan kestabilan dijelaskan secara konseptual sebagai jembatan ke Pertemuan 15.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk model saluran, aliran daya, regulasi dan efisiensi, kompensasi reaktif, dan transien gelombang berjalan. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> Aturan Jaringan Sistem Tenaga Listrik Jawa–Madura–Bali (Grid Code) memuat batas tegangan operasi (±5 % pada 150/500 kV) dan ketentuan faktor daya; RUPTL PLN memuat data saluran dan kompensasi reaktif yang direncanakan. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V_S = A·V_R + B·I_R</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">ΔV ≈ I(R cos φ + X sin φ)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">P_maks = V²/X(1 − k)</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Z_c = √(L/C)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">τ = 2Z₂/(Z₁ + Z₂)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Aliran Daya dan</em><br>Transien Saluran</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar impedansi saluran, tegangan kirim, rugi dan efisiensi, regulasi, arus pengisian, kapasitor shunt, batas transfer daya, kompensasi seri, model nominal-π, dan gelombang berjalan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Model <strong>saluran pendek</strong> (kurang dari sekitar 80 km)...",
     ["Hanya memakai R dan X seri; kapasitansi ke tanah diabaikan", "Memakai kapasitansi di kedua ujung (nominal-π)", "Memakai parameter tersebar dengan cosh dan sinh", "Mengabaikan reaktansi dan hanya memakai resistansi"],
     "Model saluran pendek"),
    ("<strong>Regulasi tegangan</strong> saluran didefinisikan sebagai...",
     ["\\((V_S - V_R)/V_S \\times 100\\%\\) pada beban penuh", "Selisih tegangan kirim dan terima dibagi jatuh tegangan", "\\((V_{R,\\text{tanpa beban}} - V_{R,\\text{beban penuh}})/V_{R,\\text{beban penuh}} \\times 100\\%\\)", "Perbandingan daya terima terhadap daya kirim"],
     "Definisi regulasi tegangan"),
    ("<strong>Kapasitor seri</strong> pada saluran transmisi berfungsi untuk...",
     ["Menyerap daya reaktif kapasitansi saluran saat beban ringan", "Mengurangi reaktansi seri efektif sehingga batas transfer daya naik dan jatuh tegangan reaktif berkurang", "Menaikkan resistansi saluran agar arus hubung singkat turun", "Menggantikan trafo pengatur tegangan"],
     "Fungsi kapasitor seri"),
    ("<strong>Kapasitor shunt</strong> yang dipasang di ujung terima saluran akan...",
     ["Menaikkan arus saluran karena menambah beban", "Menurunkan tegangan ujung terima", "Menaikkan batas kestabilan dengan mengecilkan X", "Memasok daya reaktif secara lokal sehingga arus reaktif saluran turun dan tegangan ujung terima naik"],
     "Fungsi kapasitor shunt"),
    ("<strong>Efek Ferranti</strong> adalah keadaan ketika...",
     ["Tegangan ujung terima lebih tinggi daripada tegangan kirim pada saluran panjang berbeban ringan, akibat arus pengisian kapasitansi", "Tegangan ujung terima jatuh tajam pada beban induktif berat", "Arus hubung singkat naik karena kapasitor seri", "Frekuensi sistem naik saat beban lepas"],
     "Efek Ferranti"),
    ("<strong>Impedansi surja</strong> suatu saluran adalah...",
     ["\\(\\sqrt{LC}\\) per km", "\\(R + jX\\) total saluran", "\\(\\sqrt{L/C}\\), tidak bergantung panjang saluran", "\\(1/\\sqrt{LC}\\)"],
     "Impedansi surja"),
    ("Saluran yang dibebani tepat sebesar <strong>SIL</strong> (surge impedance loading)...",
     ["Berada pada batas kestabilannya", "Mempunyai profil tegangan rata karena Q kapasitansi tepat sama dengan Q induktansi", "Tidak mengalami rugi daya", "Mengalami efek Ferranti maksimum"],
     "Makna SIL"),
    ("Gelombang tegangan surja yang tiba di <strong>ujung saluran terbuka</strong>...",
     ["Diteruskan seluruhnya tanpa pantulan", "Dipantulkan dengan tanda terbalik sehingga tegangan ujung nol", "Diserap sebagai panas", "Dipantulkan sama tanda sehingga tegangan ujung menjadi dua kali tegangan datang"],
     "Pantulan di ujung terbuka"),
    ("Daya aktif yang mengalir melalui saluran bereaktansi \\(X\\) antara dua rel bersudut \\(\\delta\\) adalah...",
     ["\\(P = V_S V_R \\sin\\delta / X\\)", "\\(P = V_S V_R \\cos\\delta / X\\)", "\\(P = (V_S - V_R)^2 / X\\)", "\\(P = V_S^2 / X\\)"],
     "Aliran daya aktif"),
    ("<strong>Reaktor shunt</strong> dipasang pada saluran transmisi panjang untuk...",
     ["Menaikkan tegangan ujung terima pada beban puncak", "Memperbaiki faktor daya beban industri", "Menyerap kelebihan daya reaktif kapasitansi saluran pada beban ringan sehingga tegangan lebih ditekan", "Menaikkan batas transfer daya"],
     "Fungsi reaktor shunt"),
]

COMP_EZ_LABELS = ["Impedansi seri saluran |Z| = L√(r² + x²)", "Tegangan kirim saluran pendek (pf 1)", "Rugi saluran tiga fasa 3I²R", "Efisiensi dari P terima dan P rugi", "Regulasi tegangan",
                  "Jatuh tegangan pendekatan I(R cos φ + X sin φ)", "Arus pengisian saluran", "Kapasitansi bank shunt (µF)", "Daya maksimum V²/X", "Impedansi surja √(L/C)"]
COMP_HARD_LABELS = ["Tegangan kirim saluran nominal-π (ABCD)", "Regulasi tegangan saluran nominal-π", "Efisiensi saluran 132 kV dari beban dan pf",
                    "Daya sesudah kompensasi seri k", "Tegangan surja yang diteruskan ke kabel"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
VF_LL, LF, RF_KM, XF_KM = 66.0, 60.0, 0.15, 0.42
RF, XF = RF_KM * LF, XF_KM * LF
PF_MW, PFF = 18.0, 0.8
VRF = VF_LL * 1000 / SQ3
IF_ = PF_MW * 1e6 / (3 * VRF * PFF)
PHIF = math.acos(PFF)
VSF = VRF + complex(RF, XF) * cmath.rect(IF_, -PHIF)
VSF_LL = abs(VSF) * SQ3 / 1000
REGF = (VSF_LL - VF_LL) / VF_LL * 100
LOSSF = 3 * IF_ ** 2 * RF / 1e6
ETAF = PF_MW / (PF_MW + LOSSF) * 100
PFF2 = 0.95
QCF = PF_MW * (math.tan(PHIF) - math.tan(math.acos(PFF2)))
IF2 = PF_MW * 1e6 / (3 * VRF * PFF2)
VSF2 = VRF + complex(RF, XF) * cmath.rect(IF2, -math.acos(PFF2))
VSF2_LL = abs(VSF2) * SQ3 / 1000
LOSSF2 = 3 * IF2 ** 2 * RF / 1e6
CF_UF = QCF * 1e6 / (W_ * (VF_LL * 1000) ** 2) * 1e6
VSURJA_F, Z1F, Z2F = 150.0, 380.0, 45.0
RHOF = (Z2F - Z1F) / (Z1F + Z2F)
TAUF = 2 * Z2F / (Z1F + Z2F)

FQ_JUDUL = [
    "Hitung tegangan kirim, regulasi, rugi, dan efisiensi saluran 70 kV ke pabrik: mengapa tegangan pabrik 'melorot' saat produksi penuh?",
    "Rancang kapasitor shunt di gardu pabrik agar tegangan kembali normal: berapa MVAR, berapa µF, dan apa yang berubah pada rugi dan regulasi?",
    "Surja petir 150 kV memasuki kabel gardu pabrik: berapa yang diteruskan, apa yang terjadi di trafo, dan di mana arester harus dipasang?",
]
FQ_RINGKAS = [
    f"Saluran {ind(VF_LL, 0)} kV (nominal 70 kV) sepanjang {ind(LF, 0)} km, r = {ind(RF_KM, 2)} Ω/km, x = {ind(XF_KM, 2)} Ω/km, memasok pabrik {ind(PF_MW, 0)} MW pf {ind(PFF, 1)} pada tegangan terima {ind(VF_LL, 0)} kV. Hitung I, V_S (fasor, Persamaan 3), regulasi (Persamaan 5), rugi dan efisiensi (Persamaan 6). Jelaskan mengapa tegangan pabrik jatuh saat beban naik, dan berapa V_S yang diperlukan.",
    f"Kapasitor shunt di rel pabrik agar pf {ind(PFF, 1)} → {ind(PFF2, 2)}: Q_C = P(tan φ₁ − tan φ₂) (Persamaan 7), kapasitansi bank Y pada {ind(VF_LL, 0)} kV, lalu I, V_S, regulasi, dan rugi sesudahnya. Bandingkan dengan Gambar 4 dan Animasi 2; bahas step otomatis dan risiko tegangan lebih saat pabrik libur.",
    f"Surja {ind(VSURJA_F, 0)} kV dari saluran udara (Z_c {ind(Z1F, 0)} Ω) masuk kabel gardu (Z_c {ind(Z2F, 0)} Ω): ρ, τ, tegangan diteruskan dan dipantulkan (Persamaan 10); lalu pantulan di trafo (Z ≫ Z_c) yang menggandakan tegangan. Tentukan letak arester (terminal trafo) dan jelaskan peran kabel sebagai peredam.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Sebuah pabrik pengolahan kayu dipasok saluran udara 70 kV sepanjang {ind(LF, 0)} km (r = {ind(RF_KM, 2)} Ω/km, x = {ind(XF_KM, 2)} Ω/km) dari gardu induk. Pada produksi penuh pabrik menyerap {ind(PF_MW, 0)} MW pada pf {ind(PFF, 1)} tertinggal dan tegangan di rel pabrik terukur {ind(VF_LL, 0)} kV, padahal gardu induk mengirim sekitar 73 kV. Dengan model saluran pendek (Persamaan 1 dan 3): hitung arus, tegangan kirim (fasor), regulasi (Persamaan 5), rugi, dan efisiensi (Persamaan 6). Jelaskan dengan diagram fasor mengapa suku X sin φ yang dominan, dan mengapa tegangan pulih di malam hari.",
            ["I = P/(√3·V_L·pf)", "V_S = V_R + I(R + jX)", "η = P/(P + 3I²R)"],
            f"Untuk mempertahankan {ind(VF_LL, 0)} kV di pabrik pada beban penuh, tegangan kirim dan efisiensi saluran sekitar...",
            [f"{ind(VF_LL, 0)} kV dan 100%: saluran pendek tidak menjatuhkan tegangan", f"{ind(VF_LL + IF_ * RF * SQ3 / 1000, 1)} kV (hanya I·R) dan {ind(ETAF, 1)}%", f"{ind(VSF_LL, 1)} kV (regulasi {ind(REGF, 1)}%) dan η ≈ {ind(ETAF, 1)}%", f"{ind(VSF_LL, 1)} kV dan η ≈ {ind(PFF * 100, 0)}% (sama dengan pf)"],
            f"✅ Tepat! \\(I = {ind(PF_MW, 0)}\\times10^6/(\\sqrt{{3}}\\times{ind(VF_LL, 0)}\\times10^3\\times{ind(PFF, 1)}) = {ind(IF_, 1)}\\) A; \\(R = {ind(RF, 0)}\\) Ω, \\(X = {ind(XF, 1)}\\) Ω; \\(|V_S| = {ind(abs(VSF) / 1000, 2)}\\) kV/fasa = {ind(VSF_LL, 1)} kV antar-saluran (δ = {ind(math.degrees(cmath.phase(VSF)), 1)}°). Regulasi \\(({ind(VSF_LL, 1)} - {ind(VF_LL, 0)})/{ind(VF_LL, 0)} = {ind(REGF, 1)}\\%\\); rugi \\(3\\times{ind(IF_, 1)}^2\\times{ind(RF, 0)} = {ind(LOSSF, 2)}\\) MW, η = {ind(ETAF, 1)}%. Suku \\(X\\sin\\varphi = {ind(XF * math.sin(PHIF), 1)}\\) Ω mengalahkan \\(R\\cos\\varphi = {ind(RF * PFF, 1)}\\) Ω.",
            "❌ Jatuh tegangan bukan hanya I·R: pada beban induktif suku X sin φ justru dominan, dan efisiensi tidak sama dengan faktor daya. Hitung fasor \\(V_S = V_R + I(R + jX)\\) dengan arus tertinggal, lalu rugi \\(3I^2R\\).",
            "Petunjuk: (1) Hitung I, R, X, dan V_S sebagai fasor. (2) Hitung regulasi, rugi, dan efisiensi. (3) Jelaskan dominasi X sin φ dan pemulihan tegangan malam hari.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Sebagai obatnya, dirancang bank kapasitor shunt di rel {ind(VF_LL, 0)} kV pabrik agar faktor daya naik ke {ind(PFF2, 2)}. Hitung Q_C (Persamaan 7), kapasitansi per fasa bila bank terhubung bintang pada {ind(VF_LL, 0)} kV/50 Hz, lalu arus, tegangan kirim yang diperlukan, regulasi, dan rugi sesudahnya. Bandingkan dengan Gambar 4 dan Animasi 2. Bahas: mengapa kapasitor lebih baik dipasang di pabrik daripada di gardu induk, bagaimana bank dibagi menjadi step otomatis, dan apa yang terjadi bila seluruh bank tetap tersambung saat pabrik libur (tegangan lebih, efek Ferranti lokal).",
            ["Q_C = P(tan φ₁ − tan φ₂)", "C_Y = Q_C/(ω·V_L²)", "ΔV ≈ I(R cos φ + X sin φ)"],
            f"Bank kapasitor untuk pf {ind(PFF, 1)} → {ind(PFF2, 2)} dan pengaruhnya pada tegangan kirim yang diperlukan sekitar...",
            [f"{ind(QCF, 1)} MVAR (≈ {ind(CF_UF, 1)} µF/fasa Y); V_S turun dari {ind(VSF_LL, 1)} ke {ind(VSF2_LL, 1)} kV, rugi turun {ind((1 - LOSSF2 / LOSSF) * 100, 0)}%", f"{ind(PF_MW * math.tan(PHIF), 1)} MVAR (seluruh Q beban); V_S menjadi tepat {ind(VF_LL, 0)} kV", f"{ind(QCF, 1)} MW; daya pabrik turun sebesar itu", f"{ind(QCF, 1)} MVAR; V_S tidak berubah karena P tetap"],
            f"✅ Tepat! \\(Q_C = {ind(PF_MW, 0)}(\\tan{ind(math.degrees(PHIF), 1)}^\\circ - \\tan{ind(math.degrees(math.acos(PFF2)), 1)}^\\circ) = {ind(QCF, 2)}\\) MVAR; \\(C = {ind(QCF, 2)}\\times10^6/(2\\pi\\cdot50\\cdot({ind(VF_LL, 0)}\\times10^3)^2) = {ind(CF_UF, 2)}\\) µF per fasa (Y). Arus turun ke {ind(IF2, 1)} A, \\(V_S\\) yang diperlukan {ind(VSF2_LL, 1)} kV (regulasi {ind((VSF2_LL - VF_LL) / VF_LL * 100, 1)}%), rugi {ind(LOSSF2, 2)} MW. Q dipasok di tempat, tidak lagi 'diseret' {ind(LF, 0)} km melalui X.",
            "❌ Kapasitor hanya perlu memasok selisih Q sampai pf sasaran, dan ia mengubah V_S lewat berkurangnya arus reaktif (suku X sin φ), bukan lewat P. Hitung \\(Q_C = P(\\tan\\varphi_1 - \\tan\\varphi_2)\\) lalu ulangi fasor V_S dengan pf baru.",
            "Petunjuk: (1) Hitung Q_C dan C per fasa. (2) Hitung I, V_S, regulasi, dan rugi sesudahnya. (3) Bahas letak pemasangan, step otomatis, dan risiko saat libur.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Pabrik dipasok lewat kabel tanah 800 m (Z_c ≈ {ind(Z2F, 0)} Ω) dari tiang akhir saluran udara (Z_c ≈ {ind(Z1F, 0)} Ω) ke trafo pabrik (impedansi surja efektif ≈ 5000 Ω). Sambaran petir menimbulkan surja {ind(VSURJA_F, 0)} kV di saluran udara. Hitung koefisien pantul dan transmisi di sambungan udara–kabel (Persamaan 10), tegangan yang masuk kabel, lalu apa yang terjadi saat gelombang itu tiba di trafo (ρ ≈ +1) dan kembali ke sambungan (diagram kisi, Cell 4). Berapa lama gelombang menempuh kabel (v ≈ 150 m/µs)? Tentukan di mana arester harus dipasang dan jelaskan mengapa 'kabel meredam surja' hanya benar sebagian.",
            ["ρ = (Z₂ − Z₁)/(Z₁ + Z₂)", "τ = 2Z₂/(Z₁ + Z₂)", "t = ℓ/v"],
            f"Surja {ind(VSURJA_F, 0)} kV dari saluran udara {ind(Z1F, 0)} Ω yang memasuki kabel {ind(Z2F, 0)} Ω diteruskan sebesar sekitar...",
            [f"{ind(VSURJA_F, 0)} kV, karena tegangan tidak berubah di sambungan", f"{ind(TAUF * VSURJA_F, 1)} kV (τ = {ind(TAUF, 3)}); sisanya dipantulkan {ind(RHOF * VSURJA_F, 1)} kV, lalu hampir digandakan lagi di trafo", f"{ind(VSURJA_F * Z2F / Z1F, 1)} kV (perbandingan Z₂/Z₁)", f"{ind(2 * VSURJA_F, 0)} kV, karena kabel bertindak seperti ujung terbuka"],
            f"✅ Tepat! \\(\\rho = ({ind(Z2F, 0)} - {ind(Z1F, 0)})/({ind(Z1F, 0)} + {ind(Z2F, 0)}) = {ind(RHOF, 3)}\\), \\(\\tau = {ind(TAUF, 3)}\\): masuk kabel {ind(TAUF * VSURJA_F, 1)} kV, dipantulkan {ind(RHOF * VSURJA_F, 1)} kV ke saluran udara. Di trafo (\\(\\rho \\approx +0{{,}}98\\)) tegangan terminal melonjak ke ≈ {ind(2 * 5000 / (5000 + Z2F) * TAUF * VSURJA_F, 0)} kV setelah {ind(800 / 150, 1)} µs, lalu pantulan bolak-balik di kabel menaikkannya bertahap. Arester harus di terminal trafo; kabel memang meredam muka gelombang pertama, tetapi tidak melindungi trafo dari penggandaan di ujungnya.",
            "❌ Tegangan di sambungan tidak tetap dan tidak sebanding Z₂/Z₁: yang diteruskan adalah \\(\\tau V\\) dengan \\(\\tau = 2Z_2/(Z_1 + Z_2)\\), kurang dari 1 bila Z₂ < Z₁. Kabel bukan ujung terbuka; trafo di ujung kabellah yang mendekati ujung terbuka.",
            "Petunjuk: (1) Hitung ρ, τ, tegangan diteruskan dan dipantulkan. (2) Hitung waktu tempuh dan tegangan di trafo (pantulan +1) serta pantulan berikutnya. (3) Tentukan letak arester dan nilai peredaman kabel.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V_S = V_R + I(R + jX)</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">τ = 2Z₂/(Z₁ + Z₂)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">70 kV, 60 km</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Pabrik di Ujung<br><em>Saluran 70 kV</em></h1>
    <p class="hero-sub">Sebuah pabrik pengolahan kayu di ujung saluran 70 kV sepanjang 60 km mengeluh tegangannya melorot saat produksi penuh dan pernah kehilangan trafo karena petir. Terapkan kosakata Pertemuan {PERTEMUAN} — fasor tegangan kirim, regulasi, efisiensi, kapasitor shunt, dan gelombang berjalan — untuk mendiagnosis dan merancang perbaikannya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Saluran 70 kV, {ind(LF, 0)} km —<br>Tegangan Melorot dan Petir</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS ALIRAN DAYA DAN TRANSIEN SALURAN</div>
    <p>
      Sebuah <strong style="color:var(--amber)">pabrik pengolahan kayu</strong> dipasok saluran udara <strong style="color:var(--cyan)">70 kV sepanjang {ind(LF, 0)} km</strong> (r = {ind(RF_KM, 2)} Ω/km, x = {ind(XF_KM, 2)} Ω/km) dari gardu induk, lalu kabel tanah 800 m ke trafo pabrik. Pada produksi penuh pabrik menyerap <strong>{ind(PF_MW, 0)} MW pada pf {ind(PFF, 1)} tertinggal</strong> (gergaji, pengering, kompresor) dan tegangan di rel pabrik hanya <strong style="color:var(--pink)">{ind(VF_LL, 0)} kV</strong>, sedangkan gardu induk mengirim sekitar 73 kV.
    </p>
    <p style="margin-top:12px">
      Keluhan: motor <strong>lambat dan panas</strong> di jam produksi penuh, tegangan <strong>pulih sendiri</strong> di malam hari, dan tahun lalu <strong>trafo pabrik rusak</strong> setelah badai petir walau 'sudah lewat kabel tanah'. Konsultan mengusulkan <strong style="color:var(--amber)">bank kapasitor shunt</strong> di rel pabrik dan menanyakan letak <strong style="color:var(--amber)">arester</strong> yang benar.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menjelaskan kedua gejala itu dengan angka dan menilai usulan konsultan <strong style="color:var(--cyan)">sebelum</strong> pabrik mengeluarkan biaya.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Saluran: {ind(LF, 0)} km, R = {ind(RF, 0)} Ω, X = {ind(XF, 1)} Ω", "14,165,233", "cyan")}
{kartu(f"Beban: {ind(PF_MW, 0)} MW, pf {ind(PFF, 1)}, V_R = {ind(VF_LL, 0)} kV", "14,165,233", "cyan")}
{kartu(f"Kabel: 800 m, Z_c ≈ {ind(Z2F, 0)} Ω; udara Z_c ≈ {ind(Z1F, 0)} Ω", "14,165,233", "cyan")}
{kartu(f"Surja petir: {ind(VSURJA_F, 0)} kV; trafo Z ≈ 5000 Ω", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Tegangan yang melorot bukan gardu induk yang lemah, dan trafo yang rusak bukan kabel yang gagal meredam: keduanya adalah sifat saluran yang dapat dihitung. Forum ini mengajak Anda menghitung <strong>berapa</strong> jatuh tegangannya, <strong>berapa MVAR</strong> kapasitor yang mengembalikannya, dan <strong>di mana</strong> gelombang petir digandakan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Tegangan kirim yang diperlukan dan rugi saluran pada tiga keadaan: produksi penuh pf {ind(PFF, 1)}, sesudah kapasitor {ind(QCF, 1)} MVAR (pf {ind(PFF2, 2)}), dan malam hari (beban ringan)</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Pabrik pengolahan kayu di ujung saluran udara 70 kV sepanjang {ind(LF, 0)} km (r {ind(RF_KM, 2)} Ω/km, x {ind(XF_KM, 2)} Ω/km) + kabel 800 m (Z_c {ind(Z2F, 0)} Ω) ke trafo: beban {ind(PF_MW, 0)} MW pf {ind(PFF, 1)}, tegangan rel pabrik {ind(VF_LL, 0)} kV saat produksi penuh (kirim ≈ 73 kV), pulih di malam hari; trafo pernah rusak oleh surja petir {ind(VSURJA_F, 0)} kV. Usulan: bank kapasitor shunt (pf 0,95) dan penentuan letak arester."
FORUM_CHIPS_LMS = [f"saluran = {ind(LF, 0)} km, R {ind(RF, 0)} Ω, X {ind(XF, 1)} Ω", f"beban = {ind(PF_MW, 0)} MW, pf {ind(PFF, 1)}", f"V_R = {ind(VF_LL, 0)} kV, kirim ≈ 73 kV", f"surja = {ind(VSURJA_F, 0)} kV; Z_c {ind(Z1F, 0)} → {ind(Z2F, 0)} Ω"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Tegangan kirim dan rugi saluran 70 kV pada tiga keadaan (Pertemuan 6)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const R = 9, X = 25.2, VLL = 66, VR = VLL * 1e3 / Math.sqrt(3);
  const kasus = [['produksi penuh, pf 0,80', 18, 0.80, 'rgba(239,68,68,.85)'], ['+ kapasitor shunt, pf 0,95', 18, 0.95, 'rgba(0,224,158,.85)'], ['malam hari, 3 MW pf 0,85', 3, 0.85, 'rgba(0,229,255,.85)']];
  const padL = 200, padR = 20, padT = 20, barH = 28, gap = 16, plotW = W - padL - padR;
  const vmin = 60, vmax = 78, X_ = v => padL + (v - vmin) / (vmax - vmin) * plotW;
  ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X_(VLL), padT - 4); ctx.lineTo(X_(VLL), padT + 3 * (barH + gap)); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.85)'; ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText('V_R = 66 kV', X_(VLL), padT - 8);
  ctx.strokeStyle = 'rgba(255,179,0,.8)'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X_(70), padT - 4); ctx.lineTo(X_(70), padT + 3 * (barH + gap)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,179,0,.9)'; ctx.fillText('nominal 70 kV', X_(70), padT - 8);
  kasus.forEach(([label, P, pf, warna], i) => {
    const I = P * 1e6 / (3 * VR * pf), phi = Math.acos(pf);
    const re = VR + I * (R * Math.cos(phi) + X * Math.sin(phi)), im = I * (X * Math.cos(phi) - R * Math.sin(phi));
    const VS = Math.hypot(re, im) * Math.sqrt(3) / 1e3, rugi = 3 * I * I * R / 1e6, y = padT + i * (barH + gap);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(label, padL - 8, y + barH / 2 + 4);
    ctx.fillStyle = warna; ctx.fillRect(X_(VLL), y, X_(VS) - X_(VLL), barH);
    ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText('V_S ' + VS.toFixed(1) + ' kV · I ' + I.toFixed(0) + ' A · rugi ' + rugi.toFixed(2) + ' MW', X_(VS) + 6, y + barH / 2 + 4);
  });
  ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('panjang batang = jatuh tegangan sepanjang saluran (V_S − V_R) agar rel pabrik tetap 66 kV', W / 2, H - 8);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
