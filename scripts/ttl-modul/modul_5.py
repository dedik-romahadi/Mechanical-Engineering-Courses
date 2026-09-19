# Konten Modul 5 Teknik Tenaga Listrik — Daya pada Jaringan Listrik AC
# (Sub-CPMK 2.2, Pertemuan 5). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 5
PERTEMUAN = 5
SUB_CPMK = "2.2"
JUDUL = "Daya pada Jaringan Listrik AC"
JUDUL_PANJANG = "Daya pada Jaringan Listrik AC"
JUDUL_EKSPOR = "Daya pada Jaringan Listrik AC"

# ─────────────────────────── angka contoh ───────────────────────────
F = 50.0
W_ = 2 * math.pi * F
V_RMS = 240.0
V_M = V_RMS * math.sqrt(2)                                     # 339,4 V
R_Z, XL_Z = 9.0, 12.0                                           # beban RL contoh (Bagian 02–03)
Z_Z = math.hypot(R_Z, XL_Z)
PHI_Z = math.degrees(math.atan2(XL_Z, R_Z))
I_Z = V_RMS / Z_Z
P_Z, Q_Z, S_Z = V_RMS * I_Z * math.cos(math.radians(PHI_Z)), V_RMS * I_RMS if False else V_RMS * I_Z * math.sin(math.radians(PHI_Z)), V_RMS * I_Z
L_RLC, C_RLC = 0.050, 150e-6                                    # RLC seri contoh
XL_RLC, XC_RLC = W_ * L_RLC, 1 / (W_ * C_RLC)
X_RLC = XL_RLC - XC_RLC
Z_RLC = math.hypot(R_Z, X_RLC)
I_RLC = V_RMS / Z_RLC
PHI_RLC = math.degrees(math.atan2(X_RLC, R_Z))
F_RES = 1 / (2 * math.pi * math.sqrt(L_RLC * C_RLC))
P_PF, PF1, PF2, VL_PF = 60.0, 0.75, 0.95, 400.0                 # perbaikan pf (Bagian 04)
TAN1, TAN2 = math.tan(math.acos(PF1)), math.tan(math.acos(PF2))
Q1_PF, Q2_PF = P_PF * TAN1, P_PF * TAN2
QC_PF = Q1_PF - Q2_PF
S1_PF, S2_PF = math.hypot(P_PF, Q1_PF), math.hypot(P_PF, Q2_PF)
I1_PF, I2_PF = S1_PF * 1000 / (math.sqrt(3) * VL_PF), S2_PF * 1000 / (math.sqrt(3) * VL_PF)
C_PF = QC_PF * 1000 / (W_ * VL_PF ** 2) * 1e6                   # kapasitor tunggal setara (µF) pada 400 V
C_PF_D = C_PF / 3                                               # per fasa bila bank Δ
PA, PFA, PB, PFB = 15.0, 0.8, 5.0, 0.9                          # daya kompleks dua beban (Bagian 04)
QA, QB = PA * math.tan(math.acos(PFA)), -PB * math.tan(math.acos(PFB))
P_AB, Q_AB = PA + PB, QA + QB
S_AB = math.hypot(P_AB, Q_AB)
PF_AB = P_AB / S_AB
VL3, RY, XY = 400.0, 10.0, 7.5                                  # beban Y (Bagian 05–06)
VP3 = VL3 / math.sqrt(3)
ZY = math.hypot(RY, XY)
IY = VP3 / ZY
PFY = RY / ZY
P3, Q3, S3 = 3 * IY ** 2 * RY, 3 * IY ** 2 * XY, 3 * VP3 * IY
RD, XD = 30.0, 15.0                                             # beban Δ
ZD = math.hypot(RD, XD)
IPD = VL3 / ZD
ILD = math.sqrt(3) * IPD
P3D = 3 * IPD ** 2 * RD


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    x0, x1, y0 = 50, 470, 112
    A = 78
    X = lambda th: x0 + th / (4 * math.pi) * (x1 - x0)
    b += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{AX}" stroke-width="1.2"/><line x1="{x0}" y1="24" x2="{x0}" y2="200" stroke="{AX}" stroke-width="1.2"/>'
    for d in (0, 180, 360, 540, 720):
        b += t(X(math.radians(d)), 214, f"{d}°", 10.5, AX)
    pts_v = " ".join(f"{X(i / 200 * 4 * math.pi):.1f},{y0 - A * math.sin(i / 200 * 4 * math.pi):.1f}" for i in range(201))
    pts_i = " ".join(f"{X(i / 200 * 4 * math.pi):.1f},{y0 - 0.6 * A * math.sin(i / 200 * 4 * math.pi - math.radians(PHI_Z)):.1f}" for i in range(201))
    b += f'<polyline points="{pts_v}" fill="none" stroke="#f59e0b" stroke-width="2.4"/><polyline points="{pts_i}" fill="none" stroke="#22d3ee" stroke-width="2.2"/>'
    b += f'<line x1="{x0}" y1="{y0 - A:.1f}" x2="{x1}" y2="{y0 - A:.1f}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 4"/>' + t(x1 + 6, y0 - A + 4, f"V_m = {ind(V_M, 1)} V", 10.5, "#f59e0b", "start", "600")
    b += f'<line x1="{x0}" y1="{y0 - A / math.sqrt(2):.1f}" x2="{x1}" y2="{y0 - A / math.sqrt(2):.1f}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="5 3"/>' + t(x1 + 6, y0 - A / math.sqrt(2) + 4, f"V_rms = {ind(V_RMS, 0)} V", 10.5, "#ec4899", "start", "600")
    b += t(x1 + 6, y0 - 0.6 * A + 22, f"i(t) tertinggal φ = {ind(PHI_Z, 1)}°", 10.5, "#22d3ee", "start", "600")
    b += f'<line x1="{X(math.pi / 2):.1f}" y1="{y0 - A:.1f}" x2="{X(math.pi / 2 + math.radians(PHI_Z)):.1f}" y2="{y0 - A:.1f}" stroke="#a855f7" stroke-width="2"/>' + t((X(math.pi / 2) + X(math.pi / 2 + math.radians(PHI_Z))) / 2, y0 - A - 8, "φ", 11, "#a855f7", "middle", "700")
    b += t(260, 236, f"v(t) = {ind(V_M, 1)} sin(ωt), i(t) = {ind(I_Z * math.sqrt(2), 2)} sin(ωt − {ind(PHI_Z, 1)}°); ω = 2π·50 = {ind(W_, 1)} rad/s; satu periode = 20 ms", 11.5, AX)
    return svg(660, 246, b, "Gambar 1 — Tegangan dan arus sinusoidal: nilai puncak, nilai rms, dan beda fasa")


def gambar2():
    b = t(150, 22, "Segitiga impedansi seri RL", 12, TX, "middle", "700")
    ox, oy, sk = 60, 170, 9.0
    b += arrow(ox, oy, ox + R_Z * sk, oy, "#22d3ee", 2.4) + t(ox + R_Z * sk / 2, oy + 16, f"R = {ind(R_Z, 0)} Ω", 11, "#22d3ee", "middle", "600")
    b += arrow(ox + R_Z * sk, oy, ox + R_Z * sk, oy - XL_Z * sk, "#f59e0b", 2.4) + t(ox + R_Z * sk + 8, oy - XL_Z * sk / 2, f"X_L = {ind(XL_Z, 0)} Ω", 11, "#f59e0b", "start", "600")
    b += arrow(ox, oy, ox + R_Z * sk, oy - XL_Z * sk, "#00e09e", 2.8) + t(ox + 22, oy - XL_Z * sk / 2 - 14, f"|Z| = {ind(Z_Z, 0)} Ω", 11.5, "#00e09e", "start", "700")
    b += f'<path d="M {ox + 30} {oy} A 30 30 0 0 0 {ox + 30 * math.cos(math.radians(PHI_Z)):.1f} {oy - 30 * math.sin(math.radians(PHI_Z)):.1f}" fill="none" stroke="#a855f7" stroke-width="1.6"/>' + t(ox + 40, oy - 12, f"φ = {ind(PHI_Z, 1)}°", 10.5, "#a855f7", "start", "600")
    b += t(150, 206, "Z = R + jX_L = |Z|∠φ;  tan φ = X_L/R", 11, AX)
    b += t(480, 22, "Diagram fasor beban RL", 12, TX, "middle", "700")
    cx, cy, r = 480, 118, 70
    b += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GRID}" stroke-width="1"/>'
    b += arrow(cx, cy, cx + r, cy, "#f59e0b", 2.6) + t(cx + r + 6, cy + 4, f"V = {ind(V_RMS, 0)}∠0° V", 11, "#f59e0b", "start", "600")
    ia = math.radians(-PHI_Z)
    b += arrow(cx, cy, cx + 0.75 * r * math.cos(ia), cy - 0.75 * r * math.sin(ia), "#22d3ee", 2.6) + t(cx + 0.75 * r * math.cos(ia) + 6, cy - 0.75 * r * math.sin(ia) + 12, f"I = {ind(I_Z, 0)}∠−{ind(PHI_Z, 1)}° A", 11, "#22d3ee", "start", "600")
    b += f'<path d="M {cx + 28} {cy} A 28 28 0 0 1 {cx + 28 * math.cos(ia):.1f} {cy - 28 * math.sin(ia):.1f}" fill="none" stroke="#a855f7" stroke-width="1.6"/>' + t(cx + 34, cy + 22, "φ", 11, "#a855f7", "start", "700")
    b += t(480, 206, "Arus tertinggal φ dari tegangan (induktif); fasor berputar ω rad/s", 11, AX)
    return svg(660, 220, b, "Gambar 2 — Impedansi dan fasor beban RL")


def gambar3():
    b = ""
    ox, oy, sk = 90, 190, 0.042
    b += arrow(ox, oy, ox + P_Z * sk, oy, "#22d3ee", 2.8) + t(ox + P_Z * sk / 2, oy + 18, f"P = {ind(P_Z, 0)} W", 12, "#22d3ee", "middle", "700")
    b += arrow(ox + P_Z * sk, oy, ox + P_Z * sk, oy - Q_Z * sk, "#f59e0b", 2.8) + t(ox + P_Z * sk + 10, oy - Q_Z * sk / 2 + 4, f"Q = {ind(Q_Z, 0)} VAR", 12, "#f59e0b", "start", "700")
    b += arrow(ox, oy, ox + P_Z * sk, oy - Q_Z * sk, "#00e09e", 3) + t(ox + 20, oy - Q_Z * sk / 2 - 16, f"S = {ind(S_Z, 0)} VA", 12.5, "#00e09e", "start", "700")
    b += f'<path d="M {ox + 36} {oy} A 36 36 0 0 0 {ox + 36 * math.cos(math.radians(PHI_Z)):.1f} {oy - 36 * math.sin(math.radians(PHI_Z)):.1f}" fill="none" stroke="#a855f7" stroke-width="1.8"/>' + t(ox + 46, oy - 12, f"φ = {ind(PHI_Z, 1)}°, pf = {ind(math.cos(math.radians(PHI_Z)), 2)}", 11, "#a855f7", "start", "600")
    for i, (judul, isi, c) in enumerate([("Daya aktif P (W)", "kerja nyata: panas, cahaya, putaran motor", "#22d3ee"), ("Daya reaktif Q (VAR)", "bolak-balik ke medan magnet/listrik; rata-rata nol", "#f59e0b"),
                                          ("Daya semu S (VA)", "V·I; ukuran trafo, kabel, dan generator", "#00e09e"), ("Faktor daya cos φ", "P/S; 1 = seluruh arus menghasilkan kerja", "#a855f7")]):
        y = 30 + i * 44
        b += f'<rect x="420" y="{y}" width="222" height="36" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>'
        b += t(428, y + 15, judul, 11.5, TX, "start", "600") + t(428, y + 29, isi, 9, AX, "start")
    b += t(230, 224, f"Beban RL Gambar 2 pada {ind(V_RMS, 0)} V: S² = P² + Q² → {ind(S_Z, 0)}² = {ind(P_Z, 0)}² + {ind(Q_Z, 0)}²", 11.5, AX)
    return svg(660, 236, b, "Gambar 3 — Segitiga daya beban RL")


def gambar4():
    b = t(170, 22, f"Sebelum: pf {ind(PF1, 2)}", 12, "#ef4444", "middle", "700") + t(490, 22, f"Sesudah: pf {ind(PF2, 2)}", 12, "#00e09e", "middle", "700")
    sk = 2.6
    for ox, Q, S, c, I in [(60, Q1_PF, S1_PF, "#ef4444", I1_PF), (380, Q2_PF, S2_PF, "#00e09e", I2_PF)]:
        oy = 190
        b += f'<polygon points="{ox},{oy} {ox + P_PF * sk:.1f},{oy} {ox + P_PF * sk:.1f},{oy - Q * sk:.1f}" fill="{c}" fill-opacity=".12"/>'
        b += arrow(ox, oy, ox + P_PF * sk, oy, "#22d3ee", 2.4) + t(ox + P_PF * sk / 2, oy + 16, f"P = {ind(P_PF, 0)} kW", 11, "#22d3ee", "middle", "600")
        b += arrow(ox + P_PF * sk, oy, ox + P_PF * sk, oy - Q * sk, c, 2.2) + t(ox + P_PF * sk + 8, oy - Q * sk / 2 + 4, f"Q = {ind(Q, 1)} kVAR", 11, c, "start", "600")
        b += arrow(ox, oy, ox + P_PF * sk, oy - Q * sk, c, 2.6) + t(ox + 10, oy - Q * sk / 2 - 12, f"S = {ind(S, 1)} kVA", 11, c, "start", "700")
        b += t(ox + P_PF * sk / 2, oy - Q * sk - 12 if Q * sk > 60 else oy - 70, f"I_L = {ind(I, 1)} A", 11, TX, "middle", "600")
    b += arrow(60 + P_PF * sk + 60, 190 - Q1_PF * sk, 60 + P_PF * sk + 60, 190 - Q2_PF * sk, "#a855f7", 2.6) + t(60 + P_PF * sk + 68, 190 - (Q1_PF + Q2_PF) * sk / 2 + 4, f"Q_C = {ind(QC_PF, 1)} kVAR", 11, "#a855f7", "start", "700")
    b += t(330, 224, f"Kapasitor paralel memasok {ind(QC_PF, 1)} kVAR secara lokal: P tetap, S turun {ind((1 - S2_PF / S1_PF) * 100, 0)}%, arus saluran turun dari {ind(I1_PF, 1)} A ke {ind(I2_PF, 1)} A", 11.5, AX)
    return svg(660, 236, b, "Gambar 4 — Perbaikan faktor daya dengan kapasitor paralel")


def gambar5():
    b = t(160, 22, "Hubungan bintang (Y)", 12, TX, "middle", "700") + t(500, 22, "Hubungan segitiga (Δ)", 12, TX, "middle", "700")
    # Y
    cx, cy = 160, 120
    for ang, lab, c in [(90, "a", "#ef4444"), (210, "b", "#f59e0b"), (330, "c", "#22d3ee")]:
        ex, ey = cx + 70 * math.cos(math.radians(ang)), cy - 70 * math.sin(math.radians(ang))
        mx, my = cx + 35 * math.cos(math.radians(ang)), cy - 35 * math.sin(math.radians(ang))
        b += f'<line x1="{cx}" y1="{cy}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{AX}" stroke-width="2"/>'
        b += f'<rect x="{mx - 9:.1f}" y="{my - 9:.1f}" width="18" height="18" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>'
        b += f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="4" fill="{c}"/>' + t(ex + 12 * math.cos(math.radians(ang)), ey - 12 * math.sin(math.radians(ang)) + 4, lab, 12, c, "middle", "700")
    b += f'<circle cx="{cx}" cy="{cy}" r="4" fill="{AX}"/>' + t(cx + 10, cy + 14, "n", 11, AX, "start", "600")
    b += t(160, 206, "V_L = √3·V_fasa (∠30°);  I_L = I_fasa", 11.5, TX) + t(160, 224, f"{ind(VL3, 0)} V saluran → {ind(VP3, 1)} V per fasa", 11, AX)
    # Δ
    cx, cy = 500, 128
    pts = [(cx + 70 * math.cos(math.radians(a)), cy - 70 * math.sin(math.radians(a))) for a in (90, 210, 330)]
    for i, (lab, c) in enumerate([("a", "#ef4444"), ("b", "#f59e0b"), ("c", "#22d3ee")]):
        (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % 3]
        b += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{AX}" stroke-width="2"/>'
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        b += f'<rect x="{mx - 9:.1f}" y="{my - 9:.1f}" width="18" height="18" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>'
        ang = (90, 210, 330)[i]
        b += f'<circle cx="{x1:.1f}" cy="{y1:.1f}" r="4" fill="{c}"/>' + t(x1 + 12 * math.cos(math.radians(ang)), y1 - 12 * math.sin(math.radians(ang)) + 4, lab, 12, c, "middle", "700")
    b += t(500, 206, "V_L = V_fasa;  I_L = √3·I_fasa (∠30°)", 11.5, TX) + t(500, 224, f"Z = {ind(RD, 0)} + j{ind(XD, 0)} Ω per fasa → I_fasa {ind(IPD, 2)} A, I_L {ind(ILD, 2)} A", 11, AX)
    return svg(660, 236, b, "Gambar 5 — Hubungan bintang dan segitiga pada beban tiga fasa seimbang")


def gambar6():
    b = ""
    x0, x1, yv, ya = 50, 630, 70, 176
    Av, Ap = 34, 40
    X = lambda th: x0 + th / (4 * math.pi) * (x1 - x0)
    b += f'<line x1="{x0}" y1="{yv}" x2="{x1}" y2="{yv}" stroke="{AX}" stroke-width="1"/><line x1="{x0}" y1="{ya}" x2="{x1}" y2="{ya}" stroke="{AX}" stroke-width="1"/>'
    phi = math.radians(math.degrees(math.acos(PFY)))
    for p, c in enumerate(["#ef4444", "#f59e0b", "#22d3ee"]):
        pts = " ".join(f"{X(i / 240 * 4 * math.pi):.1f},{yv - Av * math.sin(i / 240 * 4 * math.pi - p * 2 * math.pi / 3):.1f}" for i in range(241))
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2"/>'
        pp = " ".join(f"{X(i / 240 * 4 * math.pi):.1f},{ya - Ap * (math.sin(i / 240 * 4 * math.pi - p * 2 * math.pi / 3) * math.sin(i / 240 * 4 * math.pi - p * 2 * math.pi / 3 - phi)) / (1.5 * PFY):.1f}" for i in range(241))
        b += f'<polyline points="{pp}" fill="none" stroke="{c}" stroke-width="1.2" stroke-opacity=".6"/>'
    ytot = ya - Ap * (1.5 * PFY) / (1.5 * PFY)
    b += f'<line x1="{x0}" y1="{ytot:.1f}" x2="{x1}" y2="{ytot:.1f}" stroke="#00e09e" stroke-width="2.8"/>' + t(x0 + 6, ytot - 6, f"p_a + p_b + p_c = P = {ind(P3 / 1000, 2)} kW, konstan", 11, "#00e09e", "start", "700")
    b += t(x0 + 6, yv - Av - 6, "v_a, v_b, v_c: sama besar, berselisih 120°", 11, TX, "start", "600")
    b += t(x0 + 6, ya - Ap - 8, "daya sesaat tiap fasa berayun pada 100 Hz", 10.5, AX, "start")
    b += t(340, 230, f"Beban Y {ind(RY, 0)} + j{ind(XY, 1)} Ω pada {ind(VL3, 0)} V: I = {ind(IY, 2)} A, pf = {ind(PFY, 2)}; daya total tidak berdenyut, itulah keunggulan tiga fasa untuk motor", 11.5, AX)
    return svg(660, 240, b, "Gambar 6 — Tegangan tiga fasa dan daya sesaat total yang konstan")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-sinus">Sinusoid &amp; Fasor</a>
  <a href="#m-impedansi">Impedansi</a>
  <a href="#m-daya">P, Q, S</a>
  <a href="#m-faktordaya">Faktor Daya</a>
  <a href="#m-tigafasa">Tiga Fasa</a>
  <a href="#m-dayatigafasa">Daya 3 Fasa</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="110" x2="92" y2="110" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <path d="M 8 110 C 18 60, 28 60, 38 110 S 58 160, 68 110 S 88 60, 92 80" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.6"/>
      <path d="M 8 120 C 18 80, 28 70, 38 118 S 58 158, 68 118 S 88 78, 92 90" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <text x="6" y="40" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">v(t)</text>
      <text x="6" y="190" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">i(t) ∠−φ</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="14" y1="160" x2="80" y2="160" stroke="rgba(0,229,255,.6)" stroke-width="1.8"/>
      <line x1="80" y1="160" x2="80" y2="90" stroke="rgba(255,179,0,.6)" stroke-width="1.8"/>
      <line x1="14" y1="160" x2="80" y2="90" stroke="rgba(0,224,158,.7)" stroke-width="2"/>
      <text x="38" y="176" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">P</text>
      <text x="86" y="128" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">Q</text>
      <text x="30" y="112" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">S</text>
      <text x="26" y="154" fill="rgba(168,85,247,.6)" font-family="JetBrains Mono" font-size="8">φ</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="05">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">V_rms = V_m/√2</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">Z = R + j(X_L − X_C)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">S = V·I* = P + jQ</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">pf = cos φ = P/S</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">P = √3·V_L·I_L·cos φ</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">V_L = √3·V_fasa</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">S² = P² + Q²</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Daya pada</span><br>
      <em>Jaringan</em><br>
      <span class="hl-amber">Listrik AC</span>
    </h1>
    <p class="hero-sub">Hampir seluruh tenaga listrik dibangkitkan, disalurkan, dan dipakai dalam bentuk arus bolak-balik. Modul ini membangun bahasa AC yang dipakai sisa mata kuliah: nilai rms dan fasor, impedansi, tiga macam daya (P, Q, S) beserta faktor daya, daya kompleks dan perbaikan faktor daya dengan kapasitor, lalu sistem tiga fasa seimbang bintang dan segitiga, semuanya pada motor, trafo, dan panel yang dijumpai insinyur mesin setiap hari.</p>
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

    # 01 — sinusoid & fasor
    isi = figure(1, "Tegangan dan arus sinusoidal: nilai puncak, nilai rms, dan beda fasa", f"Tegangan {ind(V_RMS, 0)} V rms berpuncak {ind(V_M, 1)} V; arus beban induktif mencapai puncaknya {ind(PHI_Z, 1)}° (sekitar {ind(PHI_Z / 360 * 20, 2)} ms) setelah tegangan. Nilai rms adalah yang tertera di pelat nama dan yang dibaca voltmeter.", gambar1())
    isi += formula(1, "Sinusoid dan Nilai Efektif (rms)", r"v(t) = V_m \sin(\omega t), \qquad \omega = 2\pi f, \qquad V_{rms} = \dfrac{V_m}{\sqrt{2}} \approx 0{,}707\,V_m",
                   rf"Jaringan 50 Hz: \(\omega = {ind(W_, 1)}\) rad/s, periode 20 ms. Tegangan '{ind(V_RMS, 0)} V' berarti rms; puncaknya \({ind(V_RMS, 0)}\sqrt{{2}} = {ind(V_M, 1)}\) V, angka yang menentukan isolasi. Nilai rms adalah nilai DC yang memberi pemanasan \(I^2R\) yang sama.",
                   "Semua rumus daya Modul 3–4 tetap berlaku pada AC asalkan tegangan dan arus dinyatakan dalam rms dan beda fasanya diperhitungkan. Karena itu seluruh modul ini memakai nilai rms kecuali disebut lain.",
                   [("V_m", "Nilai puncak (V)"), ("\\omega", "Frekuensi sudut (rad/s)"), ("f", "Frekuensi (Hz); 50 Hz di Indonesia"), ("V_{rms}", "Nilai efektif (V)")])
    isi += formula(2, "Fasor dan Beda Fasa", r"v(t) = V_m\sin(\omega t) \;\leftrightarrow\; \mathbf{V} = V_{rms}\angle 0^\circ, \qquad i(t) = I_m\sin(\omega t - \varphi) \;\leftrightarrow\; \mathbf{I} = I_{rms}\angle{-\varphi}",
                   rf"Gambar 1: \(\mathbf{{V}} = {ind(V_RMS, 0)}\angle0^\circ\) V dan \(\mathbf{{I}} = {ind(I_Z, 0)}\angle{{-{ind(PHI_Z, 1)}^\circ}}\) A. Sudut negatif berarti arus <em>tertinggal</em> (lagging, khas beban induktif seperti motor); sudut positif berarti <em>mendahului</em> (leading, kapasitif).",
                   "Fasor adalah bilangan kompleks yang menyimpan besar rms dan sudut fasa; dengannya rangkaian AC dihitung dengan aljabar biasa, bukan persamaan diferensial. Semua fasor dalam satu rangkaian berputar dengan ω yang sama, jadi yang penting hanya beda sudut di antara mereka.",
                   [("\\mathbf{V}, \\mathbf{I}", "Fasor tegangan dan arus (rms∠sudut)"), ("\\varphi", "Sudut fasa arus terhadap tegangan"), ("I_m", "Arus puncak (A)")])
    isi += cards([
        ("〰️", "Mengapa AC", "Tegangan AC mudah diubah trafo (Modul 1–2) sehingga transmisi bertegangan tinggi dan pemakaian bertegangan rendah dimungkinkan; generator sinkron dan motor induksi juga paling sederhana dalam AC.", None),
        ("📏", "rms vs Puncak vs Rata-rata", "Rata-rata sinusoid nol; rms-nya 0,707 puncak; rata-rata setengah gelombang 0,637 puncak. Meter biasa menampilkan rms; osiloskop menampilkan bentuk gelombang dengan puncaknya.", r"\(V_{rms} = 0{,}707\,V_m\)"),
        ("🧭", "Tanda Sudut", "Konvensi modul ini: tegangan sebagai acuan 0°; arus induktif ∠−φ (tertinggal), kapasitif ∠+φ (mendahului). Kata 'tertinggal' selalu tentang arus terhadap tegangan.", None),
        ("🔁", "Frekuensi Sistem", "50 Hz di Indonesia dan Eropa, 60 Hz di Amerika; kecepatan motor induksi 4 kutub 1500 rpm (50 Hz) vs 1800 rpm (60 Hz). Reaktansi ikut berubah bersama f (Bagian 02).", r"\(n_s = 120f/p\)"),
        ("🧮", "Bilangan Kompleks", "Bentuk polar \\(A\\angle\\theta\\) untuk kali/bagi, bentuk rektangular \\(a + jb\\) untuk tambah/kurang; \\(j = \\sqrt{-1}\\) (huruf i dipakai untuk arus). Python: <code>complex</code> dan <code>cmath</code>.", r"\(A\angle\theta = A e^{j\theta}\)"),
        ("⚠️", "Menjumlahkan Sinusoid", "Dua tegangan 100 V yang berbeda fasa 120° tidak berjumlah 200 V melainkan 100 V; jumlahkan sebagai fasor, bukan sebagai bilangan biasa. Inilah inti sistem tiga fasa (Bagian 05).", None),
    ])
    isi += tabel(["Besaran pada jaringan 230 V / 50 Hz", "Nilai", "Keterangan"], [
        ["Tegangan rms", "230 V", "yang tertera dan yang diukur voltmeter"],
        ["Tegangan puncak", f"{ind(230 * math.sqrt(2), 1)} V", "menentukan tegangan isolasi dan kapasitor"],
        ["Tegangan puncak-ke-puncak", f"{ind(2 * 230 * math.sqrt(2), 1)} V", "yang terlihat pada osiloskop"],
        ["Frekuensi sudut ω", f"{ind(W_, 2)} rad/s", "2π·50"],
        ["Periode", "20 ms", "1/f; setengah periode 10 ms"],
        ["Kecepatan sinkron 4 kutub", "1500 rpm", "120·50/4"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> 'perang arus' 1880-an antara sistem DC Edison dan AC Westinghouse–Tesla dimenangkan AC karena trafo. Charles Proteus Steinmetz (1893) memperkenalkan metode fasor dan bilangan kompleks yang mengubah analisis AC dari kalkulus menjadi aljabar, dan simbol j untuk √−1 adalah warisannya. Sistem tiga fasa dirintis Dolivo-Dobrovolsky dan Tesla pada 1888–1891; jalur Lauffen–Frankfurt 1891 (175 km, 15 kV, tiga fasa) membuktikannya dan sejak itu menjadi baku dunia.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01–02 adalah bahasa: rms, fasor, impedansi. Bagian 03–04 adalah inti tenaga: tiga macam daya, faktor daya, dan cara memperbaikinya. Bagian 05–06 membawa semuanya ke sistem tiga fasa yang dipakai industri. Animasi (07) memutar fasor secara langsung, dan Python (08) memakai bilangan kompleks agar seluruh hitungan menjadi beberapa baris.")
    m += bagian(1, "m-sinus", "Sinusoid, Nilai rms,<br>dan Fasor",
                "Arus bolak-balik berubah arah seratus kali tiap detik, tetapi rangkaian tenaga tidak dianalisis titik demi titik: cukup dua angka per besaran, nilai efektif dan sudut fasanya. Persamaan (1) mendefinisikan nilai rms dan Persamaan (2) memperkenalkan fasor, dua alat yang memungkinkan hukum Ohm dan Kirchhoff dari Modul 3–4 dipakai lagi pada AC. Gambar 1 memperlihatkan hubungannya.",
                isi, "SINUSOID DAN FASOR")

    # 02 — impedansi
    isi = figure(2, "Impedansi dan fasor beban RL", f"Resistansi {ind(R_Z, 0)} Ω seri reaktansi induktif {ind(XL_Z, 0)} Ω memberi impedansi {ind(Z_Z, 0)} Ω∠{ind(PHI_Z, 1)}°; pada {ind(V_RMS, 0)} V mengalir {ind(I_Z, 0)} A yang tertinggal {ind(PHI_Z, 1)}°.", gambar2())
    isi += formula(3, "Impedansi Elemen dan Rangkaian Seri", r"X_L = \omega L = 2\pi f L, \qquad X_C = \dfrac{1}{\omega C}, \qquad \mathbf{Z} = R + j(X_L - X_C) = |Z|\angle\varphi, \quad \tan\varphi = \dfrac{X_L - X_C}{R}",
                   rf"Beban RL Gambar 2: \(|Z| = \sqrt{{{ind(R_Z, 0)}^2 + {ind(XL_Z, 0)}^2}} = {ind(Z_Z, 0)}\) Ω, \(\varphi = \arctan({ind(XL_Z, 0)}/{ind(R_Z, 0)}) = {ind(PHI_Z, 1)}^\circ\). Ditambah C = 150 µF seri: \(X_C = {ind(XC_RLC, 2)}\) Ω, \(X = {ind(XL_RLC, 2)} - {ind(XC_RLC, 2)} = {ind(X_RLC, 2)}\) Ω (kapasitif), \(|Z| = {ind(Z_RLC, 2)}\) Ω, arus <em>mendahului</em> {ind(-PHI_RLC, 1)}°. Resonansi (\(X = 0\)) terjadi pada \(f = 1/(2\pi\sqrt{{LC}}) = {ind(F_RES, 1)}\) Hz.",
                   "Impedansi adalah 'resistansi kompleks': bagian nyata R mengubah energi menjadi panas, bagian khayal X menyimpan lalu mengembalikannya. Induktor (kumparan motor, trafo, saluran) menahan perubahan arus dan membuat arus tertinggal; kapasitor sebaliknya. Keduanya saling meniadakan dalam seri, itulah dasar kompensasi reaktif.",
                   [("X_L, X_C", "Reaktansi induktif dan kapasitif (Ω)"), ("L, C", "Induktansi (H) dan kapasitansi (F)"), ("\\mathbf{Z}", "Impedansi kompleks (Ω)"), ("\\varphi", "Sudut impedansi = sudut beda fasa arus terhadap tegangan")])
    isi += formula(4, "Hukum Ohm AC dan Arus Beban", r"\mathbf{I} = \dfrac{\mathbf{V}}{\mathbf{Z}} = \dfrac{V}{|Z|}\angle{-\varphi}, \qquad \mathbf{V}_R = \mathbf{I}R, \quad \mathbf{V}_L = j X_L \mathbf{I}, \quad \mathbf{V}_C = -j X_C \mathbf{I}",
                   rf"\(\mathbf{{I}} = {ind(V_RMS, 0)}\angle0^\circ / {ind(Z_Z, 0)}\angle{ind(PHI_Z, 1)}^\circ = {ind(I_Z, 0)}\angle{{-{ind(PHI_Z, 1)}^\circ}}\) A. Tegangan pada R: \({ind(I_Z * R_Z, 0)}\) V, pada L: \({ind(I_Z * XL_Z, 0)}\) V; jumlah <em>fasornya</em> \(\sqrt{{{ind(I_Z * R_Z, 0)}^2 + {ind(I_Z * XL_Z, 0)}^2}} = {ind(V_RMS, 0)}\) V, bukan {ind(I_Z * R_Z + I_Z * XL_Z, 0)} V.",
                   "KVL dan KCL berlaku pada fasor: jumlah tegangan seri adalah jumlah vektor. Tegangan pada induktor mendahului arusnya 90° dan pada kapasitor tertinggal 90°, sehingga keduanya 'tegak lurus' terhadap tegangan resistor. Impedansi seri dijumlahkan, paralel digabung seperti resistor, tetapi dalam bilangan kompleks.",
                   [("\\mathbf{V}_R, \\mathbf{V}_L, \\mathbf{V}_C", "Fasor tegangan tiap elemen (V)"), ("j", "Operator putar 90°")])
    isi += cards([
        ("🧲", "Induktor", "Kumparan motor, trafo, reaktor, dan saluran panjang. \\(X_L\\) naik bersama frekuensi; pada DC nol. Arus tertinggal 90° pada induktor murni.", r"\(X_L = 2\pi f L\)"),
        ("🔋", "Kapasitor", "Bank kapasitor, kabel bawah tanah, filter. \\(X_C\\) turun bersama frekuensi; pada DC tak hingga (terbuka). Arus mendahului 90° pada kapasitor murni.", r"\(X_C = 1/(2\pi f C)\)"),
        ("🔥", "Resistor", "Pemanas, lampu pijar, dan bagian rugi setiap alat. Arus sefasa dengan tegangan; hanya R yang menyerap daya rata-rata.", r"\(\varphi = 0\)"),
        ("⚙️", "Motor Induksi", "Terlihat dari jaringan sebagai R + jX_L dengan φ 25–45° (pf 0,7–0,9) pada beban penuh, lebih buruk saat beban ringan; itulah sumber utama kVAR industri.", None),
        ("🎯", "Resonansi", "Saat \\(X_L = X_C\\) impedansi seri tinggal R: arus maksimum, tegangan pada L dan C bisa jauh melampaui sumber. Diwaspadai pada bank kapasitor dengan harmonik.", r"\(f_0 = \dfrac{1}{2\pi\sqrt{LC}}\)"),
        ("📐", "Paralel", "\\(1/\\mathbf{Z}_{par} = \\sum 1/\\mathbf{Z}_k\\); kebalikan impedansi disebut admitansi \\(\\mathbf{Y}\\) (siemens). Beban-beban pada satu rel paralel, jadi arus totalnya adalah jumlah fasor arus.", r"\(\mathbf{Y} = 1/\mathbf{Z}\)"),
    ])
    isi += tabel(["Rangkaian seri pada 240 V, 50 Hz", "X (Ω)", "|Z| (Ω)", "φ", "I (A)", "Sifat"], [
        [f"R {ind(R_Z, 0)} Ω", "0", ind(R_Z, 2), "0°", ind(V_RMS / R_Z, 2), "resistif"],
        [f"R {ind(R_Z, 0)} Ω + L {ind(XL_Z / W_ * 1000, 1)} mH", ind(XL_Z, 2), ind(Z_Z, 2), f"{ind(PHI_Z, 1)}°", ind(I_Z, 2), "induktif, arus tertinggal"],
        [f"R {ind(R_Z, 0)} Ω + C 150 µF", ind(-XC_RLC, 2), ind(math.hypot(R_Z, XC_RLC), 2), f"−{ind(math.degrees(math.atan2(XC_RLC, R_Z)), 1)}°", ind(V_RMS / math.hypot(R_Z, XC_RLC), 2), "kapasitif, arus mendahului"],
        [f"R {ind(R_Z, 0)} Ω + L 50 mH + C 150 µF", ind(X_RLC, 2), ind(Z_RLC, 2), f"{ind(PHI_RLC, 1)}°", ind(I_RLC, 2), "kapasitif (X_C > X_L)"],
        [f"sama, pada f = {ind(F_RES, 1)} Hz (resonansi)", "0", ind(R_Z, 2), "0°", ind(V_RMS / R_Z, 2), "arus maksimum"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> menambah kapasitor seri pada beban RL justru <em>menaikkan</em> arus (baris 4 vs baris 2) karena X_C meniadakan sebagian X_L; pada resonansi arus mencapai maksimum V/R. Pada sistem tenaga kapasitor dipasang <em>paralel</em> (Bagian 04), yang menurunkan arus saluran; keduanya sama-sama 'kompensasi reaktif' tetapi efeknya berlawanan. Soal C2, C3, dan C11 memakai Persamaan (3)–(4).")
    m += bagian(2, "m-impedansi", "Impedansi:<br>R, L, dan C pada AC",
                "Pada AC, kumparan dan kapasitor ikut menahan arus tanpa membuang energi, dan tahanannya bergantung frekuensi. Ketiga elemen digabung dalam satu besaran kompleks, impedansi, pada Persamaan (3), sehingga hukum Ohm kembali berlaku dalam bentuk fasor pada Persamaan (4). Gambar 2 memperlihatkan segitiga impedansi dan diagram fasor beban RL yang dipakai sepanjang modul ini.",
                isi, "IMPEDANSI")

    # 03 — P Q S
    isi = figure(3, "Segitiga daya beban RL", f"Beban {ind(Z_Z, 0)} Ω∠{ind(PHI_Z, 1)}° pada {ind(V_RMS, 0)} V menarik {ind(I_Z, 0)} A: daya semu {ind(S_Z, 0)} VA terurai menjadi daya aktif {ind(P_Z, 0)} W yang benar-benar bekerja dan daya reaktif {ind(Q_Z, 0)} VAR yang hanya berayun.", gambar3())
    isi += formula(5, "Daya Aktif, Reaktif, dan Semu", r"P = V I\cos\varphi = I^2 R, \qquad Q = V I\sin\varphi = I^2 X, \qquad S = V I = \sqrt{P^2 + Q^2}",
                   rf"Gambar 3: \(P = {ind(V_RMS, 0)}\times{ind(I_Z, 0)}\times\cos{ind(PHI_Z, 1)}^\circ = {ind(P_Z, 0)}\) W (= \({ind(I_Z, 0)}^2\times{ind(R_Z, 0)}\)), \(Q = {ind(Q_Z, 0)}\) VAR (= \({ind(I_Z, 0)}^2\times{ind(XL_Z, 0)}\)), \(S = {ind(S_Z, 0)}\) VA. Satuannya sengaja dibedakan (W, VAR, VA) walau dimensinya sama, supaya jelas mana yang bekerja dan mana yang hanya membebani.",
                   "Daya sesaat \\(p(t) = v(t)i(t)\\) berayun pada 100 Hz (Animasi 1). Rata-ratanya adalah P, yang dibayar sebagai kWh. Bagian yang berayun dengan rata-rata nol adalah Q: energi yang bolak-balik antara sumber dan medan magnet motor atau trafo. Q tidak menghasilkan kerja, tetapi arusnya nyata: memanaskan kabel, memenuhi trafo, dan menjatuhkan tegangan.",
                   [("P", "Daya aktif/nyata (W)"), ("Q", "Daya reaktif (VAR); positif induktif, negatif kapasitif"), ("S", "Daya semu (VA)"), ("V, I", "Tegangan dan arus rms"), ("\\varphi", "Sudut beda fasa")])
    isi += formula(6, "Faktor Daya dan Segitiga Daya", r"\text{pf} = \cos\varphi = \dfrac{P}{S}, \qquad Q = P\tan\varphi, \qquad S^2 = P^2 + Q^2",
                   rf"Gambar 3: pf = \({ind(P_Z, 0)}/{ind(S_Z, 0)} = {ind(math.cos(math.radians(PHI_Z)), 2)}\) tertinggal. Motor 15 kW pada pf 0,8: \(S = 18{{,}}75\) kVA, \(Q = 15\tan(36{{,}}87^\circ) = 11{{,}}25\) kVAR; trafo dan kabelnya harus dirancang untuk 18,75 kVA, bukan 15 kW.",
                   "Faktor daya adalah 'efisiensi pemakaian arus': pada pf 0,8, 20% kapasitas trafo dan kabel dipakai untuk arus yang tidak bekerja. PLN membatasi pf pelanggan industri (≥ 0,85) dan menagih kelebihan kVARh; itulah sebabnya faktor daya adalah persoalan uang, bukan sekadar teori.",
                   [("\\text{pf}", "Faktor daya; 'tertinggal' bila induktif"), ("\\tan\\varphi", "Perbandingan Q terhadap P")])
    isi += cards([
        ("⚡", "P: yang Dibayar", "kWh-meter mengukur P·t. Motor 15 kW yang berjalan 8 jam memakai 120 kWh berapa pun faktor dayanya.", r"\(E = P\,t\)"),
        ("🔄", "Q: yang Membebani", "Arus reaktif memenuhi kabel, trafo, dan generator tanpa membayar. Utilitas menagih kVARh berlebih dan membatasi pf minimum.", r"\(Q = P\tan\varphi\)"),
        ("📦", "S: Ukuran Peralatan", "Trafo, generator, UPS, dan kabel dinilai dalam kVA karena pemanasannya bergantung arus, bukan pada pf beban.", r"\(S = VI\)"),
        ("⚙️", "Motor Beban Ringan", "Motor induksi yang bekerja jauh di bawah dayanya punya pf buruk (0,4–0,6) karena Q magnetisasinya tetap sementara P kecil. Motor yang terlalu besar adalah sumber kVAR terbesar di pabrik.", None),
        ("💡", "Beban Elektronik", "Catu daya komputer, lampu LED, dan VSD menarik arus tak sinusoidal; faktor dayanya turun oleh harmonik, bukan hanya oleh φ. Diperbaiki dengan filter, bukan kapasitor biasa.", None),
        ("🧮", "Tanda Q", "Beban induktif menyerap Q (+); kapasitor 'menyerap' Q negatif, alias memasok Q. Generator dapat memasok keduanya dengan mengatur eksitasi.", None),
    ])
    isi += tabel(["Beban (satu fasa, 230 V)", "P (kW)", "pf", "S (kVA)", "Q (kVAR)", "I (A)"],
                 [[nama, ind(p, 1), ind(pf, 2), ind(p / pf, 2), ind(p * math.tan(math.acos(pf)), 2), ind(p * 1000 / pf / 230, 1)] for nama, p, pf in
                  [("Pemanas resistif", 2.0, 1.0), ("Motor 2 kW beban penuh", 2.0, 0.85), ("Motor 2 kW beban 25%", 0.5, 0.55), ("Lampu neon lama (balast magnetik)", 0.4, 0.5), ("Las trafo AC", 5.0, 0.6)]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> pemanas dan motor berdaya sama 2 kW, tetapi motor menarik 18% lebih banyak arus; motor yang sama pada beban seperempat tetap menarik lebih dari separuh arusnya hanya untuk magnetisasi. Las trafo 5 kW pada pf 0,6 menarik 36 A: itulah alasan sekring bengkel las 'terlalu cepat putus'. Soal C4–C7 memakai Persamaan (5)–(6).")
    m += bagian(3, "m-daya", "Daya Aktif, Reaktif,<br>dan Semu",
                "Pada DC daya hanya satu: V·I. Pada AC, beda fasa antara arus dan tegangan memecahnya menjadi bagian yang bekerja dan bagian yang hanya berayun bolak-balik, dan keduanya bersama-sama menentukan arus yang harus dipikul kabel dan trafo. Persamaan (5) mendefinisikan P, Q, dan S; Persamaan (6) mengikat ketiganya lewat faktor daya dan segitiga daya pada Gambar 3.",
                isi, "P, Q, DAN S")

    # 04 — daya kompleks & perbaikan faktor daya
    isi = figure(4, "Perbaikan faktor daya dengan kapasitor paralel", f"Beban {ind(P_PF, 0)} kW pada pf {ind(PF1, 2)} memerlukan {ind(S1_PF, 1)} kVA dan {ind(I1_PF, 1)} A (tiga fasa {ind(VL_PF, 0)} V). Kapasitor {ind(QC_PF, 1)} kVAR menaikkan pf ke {ind(PF2, 2)}: daya aktif tidak berubah, arus turun ke {ind(I2_PF, 1)} A.", gambar4())
    isi += formula(7, "Daya Kompleks dan Penjumlahan Beban", r"\mathbf{S} = \mathbf{V}\,\mathbf{I}^* = P + jQ = S\angle\varphi, \qquad \mathbf{S}_{total} = \sum_k \mathbf{S}_k = \sum P_k + j\sum Q_k",
                   rf"Dua beban paralel: A = {ind(PA, 0)} kW pf {ind(PFA, 1)} tertinggal (\(Q_A = +{ind(QA, 2)}\) kVAR), B = {ind(PB, 0)} kW pf {ind(PFB, 1)} mendahului (\(Q_B = {ind(QB, 2)}\) kVAR). Total: \(P = {ind(P_AB, 0)}\) kW, \(Q = {ind(Q_AB, 2)}\) kVAR, \(S = {ind(S_AB, 2)}\) kVA, pf = {ind(PF_AB, 3)} tertinggal. Daya kompleks dijumlahkan, daya semu <em>tidak</em>: \({ind(PA / PFA, 2)} + {ind(PB / PFB, 2)} \ne {ind(S_AB, 2)}\).",
                   "Konjugat \\(\\mathbf{I}^*\\) membalik tanda sudut arus, sehingga arus tertinggal menghasilkan Q positif. Daya kompleks adalah cara paling ringkas menghitung banyak beban: jumlahkan P dan Q masing-masing, lalu hitung S dan pf total. Beban kapasitif (Q negatif) mengurangi Q induktif beban lain: inilah prinsip perbaikan faktor daya.",
                   [("\\mathbf{S}", "Daya kompleks (VA)"), ("\\mathbf{I}^*", "Konjugat kompleks fasor arus"), ("\\mathbf{S}_k", "Daya kompleks beban ke-k")])
    isi += formula(8, "Perbaikan Faktor Daya dengan Kapasitor", r"Q_C = P\,(\tan\varphi_1 - \tan\varphi_2), \qquad C = \dfrac{Q_C}{\omega V^2} \;(\text{satu fasa}), \qquad C_{\Delta,\,per\ fasa} = \dfrac{Q_C}{3\,\omega V_L^2}",
                   rf"Gambar 4: \(\tan\varphi_1 = {ind(TAN1, 4)}\) (pf {ind(PF1, 2)}), \(\tan\varphi_2 = {ind(TAN2, 4)}\) (pf {ind(PF2, 2)}); \(Q_C = {ind(P_PF, 0)}({ind(TAN1, 4)} - {ind(TAN2, 4)}) = {ind(QC_PF, 2)}\) kVAR. Bank Δ pada {ind(VL_PF, 0)} V, 50 Hz: \(C = {ind(QC_PF * 1000, 0)}/(3\times{ind(W_, 1)}\times{ind(VL_PF, 0)}^2) = {ind(C_PF_D, 1)}\) µF per fasa. Arus saluran turun {ind((1 - I2_PF / I1_PF) * 100, 1)}%, rugi kabel turun {ind((1 - (I2_PF / I1_PF) ** 2) * 100, 1)}%.",
                   "Kapasitor memasok Q induktif beban 'dari sebelah', sehingga jaringan hanya perlu mengirim P dan sisa Q. Sasaran praktis pf 0,90–0,95; jangan 1,0 apalagi mendahului: kapasitor berlebih menaikkan tegangan saat beban ringan dan beresonansi dengan harmonik. Bank kapasitor industri dipasang bertahap (step) dengan pengendali otomatis.",
                   [("Q_C", "Daya reaktif kapasitor (VAR)"), ("\\varphi_1, \\varphi_2", "Sudut sebelum dan sesudah perbaikan"), ("C", "Kapasitansi (F)"), ("V_L", "Tegangan saluran (V)")])
    isi += cards([
        ("🏭", "Di Mana Dipasang", "Terpusat di panel utama (murah, mudah dikendalikan) atau langsung di terminal motor besar (mengurangi arus kabel cabang juga). Keduanya lazim dipadukan.", None),
        ("💰", "Nilai Uangnya", "Denda kVARh, kapasitas trafo yang 'bebas' (Gambar 4 melepaskan hampir 17 kVA), rugi kabel turun kuadrat arus, dan tegangan di ujung jaringan naik. Balik modal bank kapasitor biasanya di bawah dua tahun.", None),
        ("⚠️", "Kelebihan Kompensasi", "pf mendahului menaikkan tegangan (efek Ferranti lokal), memicu resonansi dengan harmonik VSD, dan dapat merusak motor yang diputus bersama kapasitornya (eksitasi sendiri).", None),
        ("🔁", "Beban Berubah", "Q beban berubah sepanjang hari; pengendali pf otomatis menyambung–memutus step kapasitor. Tanpa itu pf bisa mendahului di malam hari.", None),
        ("🌀", "Harmonik", "Kapasitor menurunkan impedansi pada frekuensi tinggi dan 'menghisap' harmonik; pada pabrik dengan banyak VSD dipakai kapasitor bereaktor (detuned) atau filter aktif.", None),
        ("🔌", "Motor Sinkron", "Motor sinkron ber-eksitasi lebih memasok Q seperti kapasitor sambil menggerakkan beban; dipakai pada kompresor dan pompa besar sebagai 'kondensor sinkron'.", None),
    ])
    isi += tabel(["Sasaran pf (beban 60 kW dari pf 0,75)", "Q_C (kVAR)", "S sesudah (kVA)", "I sesudah (A, 400 V)", "Penurunan arus"],
                 [[f"{pf:.2f}", ind(P_PF * (TAN1 - math.tan(math.acos(pf))), 1), ind(P_PF / pf, 1), ind(P_PF / pf * 1000 / (math.sqrt(3) * VL_PF), 1), ind((1 - 0.75 / pf) * 100, 1) + "%"] for pf in [0.80, 0.85, 0.90, 0.95, 1.00]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> dari pf 0,75 ke 0,90 diperlukan 24 kVAR dan arus turun 17%; dari 0,90 ke 1,00 diperlukan 29 kVAR tambahan hanya untuk 10% penurunan lagi. Manfaat kapasitor menurun cepat mendekati pf 1, sementara risikonya naik; itulah sebabnya sasaran praktis berhenti di 0,90–0,95. Soal C8, C12, dan C13 memakai Persamaan (7)–(8).")
    m += bagian(4, "m-faktordaya", "Daya Kompleks dan<br>Perbaikan Faktor Daya",
                "Menyatukan P dan Q dalam satu bilangan kompleks membuat beban-beban dapat dijumlahkan seperti fasor, dan langsung memperlihatkan bahwa kapasitor dapat 'membatalkan' daya reaktif motor. Persamaan (7) mendefinisikan daya kompleks dan Persamaan (8) menghitung kapasitor yang diperlukan untuk menaikkan faktor daya, keputusan investasi yang paling sering diminta dari insinyur di pabrik. Gambar 4 memperlihatkan hasilnya.",
                isi, "DAYA KOMPLEKS DAN FAKTOR DAYA")

    # 05 — tiga fasa
    isi = figure(5, "Hubungan bintang dan segitiga pada beban tiga fasa seimbang", f"Bintang: tegangan saluran {ind(VL3, 0)} V memberi {ind(VP3, 1)} V pada tiap fasa, arus saluran sama dengan arus fasa. Segitiga: tiap fasa langsung mendapat {ind(VL3, 0)} V, arus saluran √3 kali arus fasa.", gambar5())
    isi += formula(9, "Hubungan Bintang (Y) dan Segitiga (Δ)", r"\text{Y: } V_L = \sqrt{3}\,V_{fasa},\; I_L = I_{fasa} \qquad\qquad \Delta: V_L = V_{fasa},\; I_L = \sqrt{3}\,I_{fasa}",
                   rf"Beban Y {ind(RY, 0)} + j{ind(XY, 1)} Ω pada {ind(VL3, 0)} V: \(V_{{fasa}} = {ind(VL3, 0)}/\sqrt{{3}} = {ind(VP3, 1)}\) V, \(I = {ind(VP3, 1)}/{ind(ZY, 1)} = {ind(IY, 2)}\) A. Beban Δ {ind(RD, 0)} + j{ind(XD, 0)} Ω pada tegangan yang sama: \(I_{{fasa}} = {ind(VL3, 0)}/{ind(ZD, 2)} = {ind(IPD, 2)}\) A, \(I_L = \sqrt{{3}}\times{ind(IPD, 2)} = {ind(ILD, 2)}\) A. Beban Δ setara dengan beban Y berimpedansi \(Z_\Delta/3\).",
                   "Tiga tegangan sama besar berselisih 120° berjumlah nol, sehingga kawat netral sistem seimbang tidak berarus dan dapat ditiadakan (Δ) atau dikecilkan (Y). Faktor √3 muncul dari selisih dua fasor 120°: |1∠0° − 1∠−120°| = √3. Pelat nama motor '400 V Δ / 690 V Y' berarti kumparannya dirancang untuk 400 V per fasa.",
                   [("V_L, I_L", "Tegangan antar-saluran dan arus saluran"), ("V_{fasa}, I_{fasa}", "Tegangan dan arus pada satu elemen beban"), ("Z_\\Delta", "Impedansi per fasa beban segitiga")])
    isi += cards([
        ("🔌", "Tegangan Indonesia", "Tegangan rendah PLN: 380/220 V (kini 400/230 V): 380–400 V antar-saluran untuk motor tiga fasa, 220–230 V saluran–netral untuk beban rumah tangga satu fasa.", r"\(400/\sqrt{3} = 231\)"),
        ("⚙️", "Motor Y/Δ", "Starter bintang–segitiga menjalankan motor dalam Y (tegangan fasa 1/√3, arus start 1/3) lalu pindah ke Δ untuk kerja normal. Salah sambung Y pada motor Δ: torsi tinggal sepertiga.", None),
        ("⚖️", "Seimbang vs Tak Seimbang", "Beban seimbang cukup dihitung satu fasa lalu dikalikan tiga. Beban satu fasa yang tersebar tak merata menimbulkan arus netral dan tegangan tak seimbang yang memanaskan motor.", None),
        ("🔄", "Urutan Fasa", "a-b-c atau a-c-b menentukan arah putaran motor; membalik dua saluran membalik putaran. Diperiksa dengan phase sequence meter sebelum menyambung pompa atau kompresor.", None),
        ("📏", "Tegangan Fasa–Netral", "Voltmeter antara saluran dan netral membaca 230 V, antar-saluran 400 V. Beban satu fasa di pabrik disambung fasa–netral dan disebar merata pada ketiga fasa.", None),
        ("🧵", "Konduktor per kW", "Tiga fasa menyalurkan daya yang sama dengan tembaga sekitar 75% dari dua rangkaian satu fasa, dan tanpa netral pada beban seimbang: alasan ekonomis utama sistem tiga fasa.", None),
    ])
    isi += tabel(["Beban seimbang pada 400 V saluran", "V per fasa", "I per fasa", "I saluran", "P total"], [
        [f"Y, {ind(RY, 0)} + j{ind(XY, 1)} Ω", f"{ind(VP3, 1)} V", f"{ind(IY, 2)} A", f"{ind(IY, 2)} A", f"{ind(P3 / 1000, 2)} kW"],
        [f"Δ, {ind(RD, 0)} + j{ind(XD, 0)} Ω", f"{ind(VL3, 0)} V", f"{ind(IPD, 2)} A", f"{ind(ILD, 2)} A", f"{ind(P3D / 1000, 2)} kW"],
        [f"Δ yang sama disambung Y (salah)", f"{ind(VP3, 1)} V", f"{ind(VP3 / ZD, 2)} A", f"{ind(VP3 / ZD, 2)} A", f"{ind(3 * (VP3 / ZD) ** 2 * RD / 1000, 2)} kW (⅓)"],
        [f"Y yang sama disambung Δ (bahaya)", f"{ind(VL3, 0)} V", f"{ind(VL3 / ZY, 2)} A", f"{ind(math.sqrt(3) * VL3 / ZY, 2)} A", f"{ind(3 * (VL3 / ZY) ** 2 * RY / 1000, 2)} kW (3×)"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> beban yang sama menyerap daya tiga kali lebih besar dalam Δ daripada dalam Y, karena tegangan per fasanya √3 kali lipat dan daya sebanding kuadrat tegangan. Menyambung motor Y menjadi Δ pada tegangan yang sama memaksanya menyerap 3× daya dan arus: kumparan terbakar dalam hitungan menit. Soal C14–C15 memakai kedua hubungan ini.")
    m += bagian(5, "m-tigafasa", "Sistem Tiga Fasa Seimbang:<br>Bintang dan Segitiga",
                "Semua pembangkit, transmisi, dan motor industri memakai tiga fasa: tiga tegangan sama besar yang berselisih 120°. Persamaan (9) memberi dua cara menyambung beban, bintang dan segitiga, beserta hubungan √3 antara besaran saluran dan besaran fasa yang paling sering menjadi sumber salah hitung. Gambar 5 memperlihatkan keduanya.",
                isi, "TIGA FASA")

    # 06 — daya tiga fasa
    isi = figure(6, "Tegangan tiga fasa dan daya sesaat total yang konstan", f"Daya sesaat tiap fasa berayun pada 100 Hz, tetapi jumlah ketiganya tetap {ind(P3 / 1000, 2)} kW setiap saat. Inilah alasan motor tiga fasa bergetar jauh lebih halus daripada motor satu fasa.", gambar6())
    isi += formula(10, "Daya Tiga Fasa Seimbang", r"P = \sqrt{3}\,V_L I_L\cos\varphi = 3\,V_{fasa}I_{fasa}\cos\varphi, \qquad Q = \sqrt{3}\,V_L I_L\sin\varphi, \qquad S = \sqrt{3}\,V_L I_L, \qquad I_L = \dfrac{P}{\sqrt{3}\,V_L\cos\varphi}",
                   rf"Beban Y Gambar 6: \(P = \sqrt{{3}}\times{ind(VL3, 0)}\times{ind(IY, 2)}\times{ind(PFY, 2)} = {ind(P3, 0)}\) W, sama dengan \(3\times{ind(IY, 2)}^2\times{ind(RY, 0)}\). Motor 30 kW, pf 0,85, 400 V: \(I_L = 30000/(\sqrt{{3}}\times400\times0{{,}}85) = {ind(30000 / (math.sqrt(3) * 400 * 0.85), 1)}\) A, angka yang menentukan kabel dan pengaman.",
                   "Rumus √3·V_L·I_L·cos φ berlaku untuk Y maupun Δ, asalkan V_L dan I_L adalah besaran saluran; φ tetap sudut antara tegangan fasa dan arus fasa (bukan antara V_L dan I_L). Semua alat Bagian 03–04 (segitiga daya, perbaikan pf) berlaku pada total tiga fasa tanpa perubahan.",
                   [("V_L, I_L", "Tegangan saluran dan arus saluran (rms)"), ("\\cos\\varphi", "Faktor daya beban"), ("P, Q, S", "Daya total tiga fasa")])
    isi += cards([
        ("🔩", "Motor Industri", "Motor induksi tiga fasa 0,75–500 kW: pelat nama memberi V_L, I_L, pf, dan efisiensi. Daya masuk √3·V·I·pf, daya poros = daya masuk × η.", r"\(P_{poros} = \eta\,P_{in}\)"),
        ("🔥", "Tanur dan Las", "Tanur induksi dan las resistansi adalah beban tiga fasa berdaya besar dengan pf rendah; hampir selalu dilengkapi bank kapasitor sendiri.", None),
        ("📟", "Pengukuran", "Wattmeter tiga fasa atau metode dua wattmeter (Aron): P = W₁ + W₂, Q = √3(W₁ − W₂). kWh-meter industri mencatat kWh dan kVARh sekaligus.", r"\(P = W_1 + W_2\)"),
        ("🧯", "Pengaman dan Kabel", "Pemutus dan kabel dipilih dari I_L pada pf nyata; arus start motor 5–7× I_L nominal selama beberapa detik menentukan karakteristik pemutus (kurva D).", None),
        ("🔀", "Torsi Halus", "Karena p(t) total konstan, torsi motor tiga fasa tidak berdenyut; motor satu fasa memerlukan kapasitor start/run dan tetap bergetar 100 Hz.", None),
        ("🔗", "Ke Modul Berikut", "Aliran P dan Q pada saluran, jatuh tegangan, dan kompensasi reaktif (Modul 6) dibangun langsung dari Persamaan (7)–(10).", None),
    ])
    isi += tabel(["Motor tiga fasa 400 V (pelat nama)", "P poros (kW)", "η", "pf", "P masuk (kW)", "I_L (A)"],
                 [[nama, ind(p, 1), ind(eta, 2), ind(pf, 2), ind(p / eta, 2), ind(p / eta * 1000 / (math.sqrt(3) * 400 * pf), 1)] for nama, p, eta, pf in
                  [("Pompa 5,5 kW", 5.5, 0.86, 0.82), ("Kompresor 15 kW", 15, 0.90, 0.85), ("Konveyor 30 kW", 30, 0.92, 0.86), ("Blower 75 kW", 75, 0.94, 0.88), ("Penggiling 160 kW", 160, 0.95, 0.89)]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> arus saluran motor dihitung dari daya <em>masuk</em> (poros dibagi efisiensi) dan faktor daya, bukan dari daya poros saja; mengabaikan keduanya membuat kabel kekecilan 20–30%. Aturan kasar 400 V: sekitar 2 A per kW poros. Soal C9, C10, C14, dan C15 memakai Persamaan (9)–(10).")
    m += bagian(6, "m-dayatigafasa", "Daya Tiga Fasa<br>dan Penerapannya",
                "Setelah hubungan Y dan Δ dikuasai, daya tiga fasa dihitung dengan satu rumus untuk keduanya, dan seluruh segitiga daya serta perbaikan faktor daya dari Bagian 03–04 berlaku pada total tiga fasa. Persamaan (10) memberi P, Q, S, dan arus saluran; Gambar 6 memperlihatkan sifat paling berharga dari sistem tiga fasa: daya sesaat total yang konstan.",
                isi, "DAYA TIGA FASA")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Tegangan, Arus, dan Daya Sesaat \(p(t) = v(t)\,i(t)\) Satu Fasa", "cvFasor",
                     [("sl_fs_vm", "v_fs_vm", "Tegangan puncak V_m (V)", 100, 400, 0.2, 339.4, "339.4"), ("sl_fs_im", "v_fs_im", "Arus puncak I_m (A)", 1, 40, 0.2, 22.6, "22.6"), ("sl_fs_phi", "v_fs_phi", "Beda fasa φ (°, + tertinggal)", -90, 90, 1, 53, "53")],
                     "btnFasor", "toggleFasor", "fasorInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Kuning tegangan, biru arus, hijau daya sesaat (isian = energi ke beban; di bawah nol = energi kembali ke sumber); garis merah muda adalah P rata-rata, dan fasor kecil di kanan berputar bersama gelombangnya.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Pada φ = 0 daya tidak pernah negatif</strong>: semua energi bekerja. (2) Pada φ = 90° daya berayun simetris di sekitar nol: P = 0, semuanya Q. (3) Readout memberi P, Q, S, dan pf dari nilai rms. Soal C1 dan C4.")
    isi += anim_panel(2, "amber", r"Impedansi Seri RLC, Resonansi, dan Fasor \(\mathbf{V}\)–\(\mathbf{I}\) (sumber 240 V)", "cvImpedansi",
                      [("sl_im_r", "v_im_r", "R (Ω)", 1, 30, 0.5, 9, "9.0"), ("sl_im_l", "v_im_l", "L (mH)", 0, 200, 1, 50, "50"), ("sl_im_c", "v_im_c", "C (µF)", 20, 1000, 5, 150, "150"), ("sl_im_f", "v_im_f", "Frekuensi f (Hz)", 10, 100, 1, 50, "50")],
                      "btnImpedansi", "toggleImpedansi", "impedansiInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kiri: segitiga impedansi (biru R, kuning X_L, ungu −X_C, hijau Z). Kanan: fasor tegangan dan arus berputar beserta gelombangnya; panjang fasor arus mengikuti I.<br>Amati: (1) <strong style=\"color:var(--amber)\">Geser f sampai X_L = X_C</strong> (readout f_res): Z tinggal R, arus maksimum dan sefasa. (2) Di bawah f_res beban kapasitif (arus mendahului), di atasnya induktif. (3) Memperbesar C menurunkan X_C, bukan menaikkannya. Soal C2, C3, dan C11.")
    isi += anim_panel(3, "green", r"Segitiga Daya dan Perbaikan Faktor Daya \(Q_C = P(\tan\varphi_1 - \tan\varphi_2)\)", "cvSegitiga",
                      [("sl_sg_p", "v_sg_p", "Daya aktif P (kW)", 10, 200, 1, 60, "60"), ("sl_sg_pf1", "v_sg_pf1", "pf awal", 0.5, 0.95, 0.01, 0.75, "0.75"), ("sl_sg_pf2", "v_sg_pf2", "pf sasaran", 0.8, 1.0, 0.01, 0.95, "0.95")],
                      "btnSegitiga", "toggleSegitiga", "segitigaInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Segitiga merah adalah keadaan awal, hijau sesudah kapasitor; panah ungu adalah Q_C yang 'memotong' daya reaktif. Batang di kanan membandingkan arus saluran (400 V tiga fasa).<br>Amati: (1) <strong style=\"color:var(--green)\">P tidak berubah</strong>; hanya Q dan S yang turun. (2) Dari pf 0,9 ke 1,0 diperlukan Q_C hampir sebesar dari 0,75 ke 0,9, tetapi penurunan arusnya jauh lebih kecil. (3) Readout memberi kapasitansi per fasa untuk bank Δ. Soal C8, C12, dan C13.")
    isi += anim_panel(4, "pink", r"Sistem Tiga Fasa Seimbang: Fasor, Gelombang, dan Daya Sesaat Konstan", "cvTigaFasa",
                      [("sl_tf_vl", "v_tf_vl", "Tegangan saluran V_L (V)", 200, 700, 5, 400, "400"), ("sl_tf_il", "v_tf_il", "Arus saluran I_L (A)", 5, 60, 0.5, 18.5, "18.5"), ("sl_tf_pf", "v_tf_pf", "Faktor daya", 0.5, 1.0, 0.01, 0.8, "0.80")],
                      "btnTigaFasa", "toggleTigaFasa", "tigaFasaInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Kiri: fasor tegangan tiga fasa (tebal) dan arus (tipis) berputar; tengah: gelombang v_a, v_b, v_c; bawah: daya sesaat tiap fasa dan jumlahnya (garis hijau tebal).<br>Amati: (1) <strong style=\"color:var(--pink)\">Jumlah daya sesaat selalu datar</strong> berapa pun pf-nya, walau tiap fasa berayun. (2) Menurunkan pf memperbesar ayunan tiap fasa (lebih banyak Q) tanpa mengubah kedataran totalnya. (3) Readout memberi P, Q, S total dan impedansi Y setara. Soal C9, C10, dan C14.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 2 atur R = {ind(R_Z, 0)}, L = 50 mH, C = 150 µF, f = 50 Hz: |Z| harus {ind(Z_RLC, 2)} Ω dan arus mendahului {ind(-PHI_RLC, 1)}° seperti tabel Bagian 02; lalu naikkan f ke {ind(F_RES, 0)} Hz dan lihat resonansi. Pada Animasi 3 atur 60 kW, 0,75 → 0,95 dan cocokkan Q_C = {ind(QC_PF, 1)} kVAR dengan Gambar 4.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Jaringan AC",
                "Geser amplitudo, fasa, elemen R-L-C, faktor daya, dan besaran tiga fasa, lalu amati fasor yang berputar, daya sesaat yang berayun, segitiga daya yang menyusut oleh kapasitor, dan jumlah daya tiga fasa yang tetap datar. Empat animasi ini memvisualkan Persamaan (1)–(10).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>; bilangan kompleks bawaan Python (<code>1j</code>, <code>abs()</code>, <code>cmath.phase</code>) sudah cukup untuk fasor. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; pakai nilai rms, satuan sesuai label soal (W/kW, VAR/kVAR, µF), dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Nilai rms, Fasor, dan Impedansi Seri RLC", f'''import numpy as np, cmath

deg = np.pi/180
# ═══ Sinusoid dan rms (Persamaan 1) ═══
Vm, f = {ind(V_M, 1).replace(",", ".")}, 50.0
w = 2*np.pi*f
Vrms = Vm/np.sqrt(2)
print(f"V_rms = {{Vrms:.4f}} V; omega = {{w:.4f}} rad/s; periode = {{1000/f:.1f}} ms")

# ═══ Fasor sebagai bilangan kompleks (Persamaan 2–4) ═══
def fasor(besar, sudut_deg): return cmath.rect(besar, sudut_deg*deg)
def polar(z): return abs(z), cmath.phase(z)/deg

V = fasor(240, 0)
R, L, C = {ind(R_Z, 0)}.0, 50e-3, 150e-6
XL, XC = w*L, 1/(w*C)
Z_RL  = R + 1j*XL                       # beban RL Gambar 2 (tanpa C)
Z_RLC = R + 1j*(XL - XC)                # RLC seri
for nama, Z in [("RL", R + 1j*{ind(XL_Z, 0)}.0), ("RLC", Z_RLC)]:
    I = V/Z
    print(f"{{nama:4s}}: |Z| = {{abs(Z):.4f}} ohm, sudut = {{polar(Z)[1]:.3f}} deg, I = {{abs(I):.4f}} A pada {{polar(I)[1]:.3f}} deg")
print(f"X_L = {{XL:.4f}} ohm, X_C = {{XC:.4f}} ohm, f_res = {{1/(2*np.pi*np.sqrt(L*C)):.3f}} Hz")
# KVL fasor: V_R + V_L + V_C harus = V
I = V/Z_RLC
print(f"V_R + V_L + V_C = {{abs(I*R + I*1j*XL - I*1j*XC):.4f}} V (= 240)")''')
    isi += kode("Cell 2 — P, Q, S, Faktor Daya, dan Daya Kompleks Beberapa Beban", f'''import numpy as np

deg = np.pi/180
# ═══ Segitiga daya beban RL (Persamaan 5–6) ═══
V, I, phi = 240.0, {ind(I_Z, 0)}.0, {ind(PHI_Z, 2).replace(",", ".")}
P, Q, S = V*I*np.cos(phi*deg), V*I*np.sin(phi*deg), V*I
print(f"P = {{P:.2f}} W, Q = {{Q:.2f}} VAR, S = {{S:.2f}} VA, pf = {{P/S:.4f}}; cek S^2 = P^2 + Q^2: {{np.hypot(P, Q):.2f}}")

# ═══ Daya kompleks dua beban (Persamaan 7): kW dan kVAR ═══
def S_kompleks(P_kW, pf, tertinggal=True):
    Q = P_kW*np.tan(np.arccos(pf))
    return P_kW + 1j*(Q if tertinggal else -Q)

S_A = S_kompleks({ind(PA, 0)}, {ind(PFA, 1).replace(",", ".")}, True)     # induktif
S_B = S_kompleks({ind(PB, 0)}, {ind(PFB, 1).replace(",", ".")}, False)    # kapasitif (mendahului)
S_tot = S_A + S_B
print(f"S_A = {{S_A:.3f}} kVA, S_B = {{S_B:.3f}} kVA")
print(f"Total: P = {{S_tot.real:.4f}} kW, Q = {{S_tot.imag:.4f}} kVAR, S = {{abs(S_tot):.4f}} kVA, pf = {{S_tot.real/abs(S_tot):.4f}}")
print(f"Bukan jumlah kVA: {{abs(S_A) + abs(S_B):.4f}} kVA")''')
    isi += kode("Cell 3 — Perbaikan Faktor Daya: kVAR, Kapasitansi, dan Arus Saluran", f'''import numpy as np
import matplotlib.pyplot as plt

P, pf1, pf2, VL, f = {ind(P_PF, 0)}.0, {ind(PF1, 2).replace(",", ".")}, {ind(PF2, 2).replace(",", ".")}, {ind(VL_PF, 0)}.0, 50.0
tan1, tan2 = np.tan(np.arccos(pf1)), np.tan(np.arccos(pf2))
Qc = P*(tan1 - tan2)                                   # kVAR (Persamaan 8)
S1, S2 = P/pf1, P/pf2
I1, I2 = S1*1e3/(np.sqrt(3)*VL), S2*1e3/(np.sqrt(3)*VL)
C_delta = Qc*1e3/(3*2*np.pi*f*VL**2)*1e6               # uF per fasa, bank delta
print(f"Q_C = {{Qc:.4f}} kVAR; S: {{S1:.2f}} -> {{S2:.2f}} kVA; I_L: {{I1:.2f}} -> {{I2:.2f}} A ({{(1-I2/I1)*100:.1f}} % lebih kecil)")
print(f"Bank delta: C = {{C_delta:.2f}} uF per fasa; satu fasa 400 V setara: {{Qc*1e3/(2*np.pi*f*VL**2)*1e6:.2f}} uF")

pf = np.linspace(0.6, 1.0, 200)
plt.figure(figsize=(7, 4))
plt.plot(pf, P*(tan1 - np.tan(np.arccos(pf))), color='tab:purple', label='Q_C (kVAR)')
plt.plot(pf, P/pf*1e3/(np.sqrt(3)*VL), color='tab:green', label='I_L (A)')
plt.axvline(pf1, ls=':', color='tab:red'); plt.xlabel('pf sasaran'); plt.legend(); plt.grid(True); plt.title('Kapasitor vs arus saluran'); plt.show()''')
    isi += kode("Cell 4 — Tiga Fasa Seimbang: Y, Δ, Daya, dan Daya Sesaat Konstan", f'''import numpy as np
import matplotlib.pyplot as plt

VL = {ind(VL3, 0)}.0
# ═══ Beban Y (Persamaan 9–10) ═══
Z_Y = {ind(RY, 0)} + {ind(XY, 1).replace(",", ".")}j
V_fasa = VL/np.sqrt(3)
I_Y = V_fasa/abs(Z_Y)
pf = Z_Y.real/abs(Z_Y)
P = np.sqrt(3)*VL*I_Y*pf
print(f"Y : V_fasa = {{V_fasa:.3f}} V, I_L = I_fasa = {{I_Y:.4f}} A, pf = {{pf:.4f}}, P = {{P:.2f}} W (= 3 I^2 R = {{3*I_Y**2*Z_Y.real:.2f}}), Q = {{3*I_Y**2*Z_Y.imag:.2f}} VAR")

# ═══ Beban delta ═══
Z_D = {ind(RD, 0)} + {ind(XD, 0)}j
I_fasa = VL/abs(Z_D); I_L = np.sqrt(3)*I_fasa
print(f"D : I_fasa = {{I_fasa:.4f}} A, I_L = {{I_L:.4f}} A, P = {{3*I_fasa**2*Z_D.real:.2f}} W")

# ═══ Arus saluran motor dari pelat nama ═══
P_poros, eta, pf_m = 30e3, 0.92, 0.86
print(f"Motor 30 kW: P_masuk = {{P_poros/eta:.1f}} W, I_L = {{P_poros/eta/(np.sqrt(3)*VL*pf_m):.2f}} A")

# ═══ Daya sesaat tiga fasa ═══
t = np.linspace(0, 0.04, 800); w = 2*np.pi*50; phi = np.arccos(pf)
p = [np.sqrt(2)*V_fasa*np.sin(w*t - k*2*np.pi/3) * np.sqrt(2)*I_Y*np.sin(w*t - k*2*np.pi/3 - phi) for k in range(3)]
plt.figure(figsize=(8, 4))
for k in range(3): plt.plot(t*1e3, p[k], lw=1, label=f'p_{{"abc"[k]}}')
plt.plot(t*1e3, sum(p), lw=2.5, color='k', label='total'); plt.xlabel('t (ms)'); plt.ylabel('W'); plt.legend(); plt.grid(True); plt.show()
print(f"Total p(t): min {{sum(p).min():.2f}} W, maks {{sum(p).max():.2f}} W (konstan = P)")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: |Z| RLC {ind(Z_RLC, 2)} Ω, S total dua beban {ind(S_AB, 2)} kVA, Q_C = {ind(QC_PF, 2)} kVAR, dan I_L beban Y {ind(IY, 2)} A. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut memakai bilangan kompleks Python sebagai fasor sehingga seluruh perhitungan AC modul ini, dari impedansi sampai daya tiga fasa, menjadi beberapa baris. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya. Setiap perhitungan diberi nomor persamaan yang dipakainya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 2 (Fundamentals): fasor, daya sesaat, daya kompleks, faktor daya, dan rangkaian tiga fasa seimbang; rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "C. K. Alexander &amp; M. N. O. Sadiku", "Fundamentals of Electric Circuits", ", Seventh Edition. McGraw-Hill, 2021.", "Bab 9 (sinusoid dan fasor), Bab 11 (analisis daya AC, perbaikan faktor daya), Bab 12 (rangkaian tiga fasa) dengan banyak contoh.")
    refs += pm_ref(3, "violet", "168,85,247", "J. D. Irwin &amp; D. V. Kerns, Jr.", "Introduction to Electrical Engineering", ". Prentice Hall, 1995.", "Bab 5–6: rangkaian AC keadaan tunak dan daya AC; pustaka utama RPS.")
    refs += pm_ref(4, "green", "0,224,158", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 3: daya AC, daya reaktif, dan sistem tiga fasa dijelaskan secara konseptual untuk pembaca non-elektro.")
    refs += pm_ref(5, "pink", "236,72,153", "R. L. Boylestad", "Introductory Circuit Analysis", ", Thirteenth Edition. Pearson, 2016.", "Bab 13–15 (AC, fasor, respons elemen), Bab 19 (daya AC), Bab 23 (sistem polifasa).")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk fasor dan impedansi, daya aktif–reaktif–semu, perbaikan faktor daya, dan sistem tiga fasa seimbang. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> Peraturan Menteri ESDM tentang tarif tenaga listrik memuat ketentuan kelebihan pemakaian daya reaktif (kVARh) bagi pelanggan dengan faktor daya di bawah 0,85; katalog pabrikan kapasitor daya (mis. seri bank kapasitor 400 V) memberi tabel kVAR per step dan pengendali faktor daya otomatis. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V_rms = V_m/√2</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">S = V·I* = P + jQ</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">P = √3·V_L·I_L·cos φ</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">Z = R + j(X_L − X_C)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Daya pada</em><br>Jaringan Listrik AC</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar nilai rms, impedansi, arus beban AC, daya aktif–reaktif–semu, faktor daya dan perbaikannya, daya kompleks, serta beban tiga fasa bintang dan segitiga. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Nilai efektif (rms) tegangan sinusoidal berpuncak \\(V_m\\) adalah...",
     ["\\(V_m\\sqrt{2}\\)", "\\(V_m/\\sqrt{2}\\)", "\\(V_m/2\\)", "\\(0{,}637\\,V_m\\)"],
     "Nilai rms sinusoid"),
    ("Pada <strong>induktor murni</strong> yang dipasok tegangan sinusoidal, arusnya...",
     ["Sefasa dengan tegangan", "Mendahului tegangan 90°", "Mendahului tegangan 45°", "Tertinggal 90° dari tegangan"],
     "Fasa arus induktor"),
    ("<strong>Daya reaktif</strong> \\(Q\\) paling tepat digambarkan sebagai...",
     ["Daya yang bolak-balik antara sumber dan medan magnet/listrik beban, rata-ratanya nol, satuan VAR", "Daya yang diubah menjadi panas pada resistansi beban", "Daya yang hilang pada saluran karena \\(I^2R\\)", "Daya total yang dipasok sumber, satuan VA"],
     "Makna daya reaktif"),
    ("<strong>Faktor daya</strong> suatu beban sama dengan...",
     ["\\(Q/S\\)", "\\(S/P\\)", "\\(P/S = \\cos\\varphi\\)", "\\(P/Q\\)"],
     "Definisi faktor daya"),
    ("Hubungan pada <strong>segitiga daya</strong> adalah...",
     ["\\(S = P + Q\\)", "\\(S^2 = P^2 + Q^2\\)", "\\(S = P \\cdot Q\\)", "\\(P^2 = S^2 + Q^2\\)"],
     "Segitiga daya"),
    ("Memasang <strong>kapasitor paralel</strong> pada beban induktif akan...",
     ["Menaikkan daya aktif yang diserap beban", "Menaikkan daya reaktif yang ditarik dari jaringan", "Menaikkan arus saluran karena ada beban tambahan", "Menurunkan daya reaktif yang ditarik dari jaringan sehingga arus saluran turun, sedangkan P tetap"],
     "Efek kapasitor paralel"),
    ("<strong>Daya kompleks</strong> didefinisikan sebagai...",
     ["\\(\\mathbf{S} = \\mathbf{V}\\,\\mathbf{I}^* = P + jQ\\)", "\\(\\mathbf{S} = \\mathbf{V}\\,\\mathbf{I}\\)", "\\(\\mathbf{S} = \\mathbf{V}^2\\,\\mathbf{I}\\)", "\\(\\mathbf{S} = \\mathbf{I}^2/\\mathbf{V}\\)"],
     "Daya kompleks"),
    ("Pada beban tiga fasa seimbang terhubung <strong>bintang (Y)</strong>...",
     ["\\(V_L = V_{fasa}\\) dan \\(I_L = \\sqrt{3}\\,I_{fasa}\\)", "\\(V_L = 3\\,V_{fasa}\\) dan \\(I_L = I_{fasa}\\)", "\\(V_L = \\sqrt{3}\\,V_{fasa}\\) dan \\(I_L = I_{fasa}\\)", "\\(V_L = V_{fasa}/\\sqrt{3}\\) dan \\(I_L = I_{fasa}\\)"],
     "Hubungan bintang"),
    ("Daya aktif beban tiga fasa seimbang dalam besaran saluran adalah...",
     ["\\(3\\,V_L I_L\\cos\\varphi\\)", "\\(\\sqrt{3}\\,V_L I_L\\cos\\varphi\\)", "\\(V_L I_L\\cos\\varphi\\)", "\\(\\sqrt{3}\\,V_{fasa} I_{fasa}\\cos\\varphi\\)"],
     "Daya tiga fasa"),
    ("Keunggulan utama sistem tiga fasa seimbang dibanding satu fasa adalah...",
     ["Tegangannya otomatis lebih tinggi", "Tidak memerlukan kawat netral untuk beban apa pun", "Tidak ada daya reaktif", "Daya sesaat totalnya konstan (torsi motor halus) dan konduktornya lebih sedikit per kW"],
     "Keunggulan tiga fasa"),
]

COMP_EZ_LABELS = ["Nilai rms dari nilai puncak", "Magnitudo impedansi seri RL", "Arus beban RL", "Daya aktif P = VI cos φ", "Daya reaktif dari S dan pf",
                  "Sudut faktor daya dari P dan Q", "Daya reaktif motor Q = P tan φ", "kVAR kapasitor perbaikan pf", "Daya tiga fasa √3·V·I·cos φ", "Arus saluran tiga fasa dari P"]
COMP_HARD_LABELS = ["Arus rangkaian seri RLC 50 Hz", "Daya semu total dua beban (tertinggal + mendahului)", "Kapasitansi (µF) perbaikan faktor daya",
                    "Daya total beban Y dari impedansi per fasa", "Arus saluran beban Δ dari impedansi per fasa"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
P_BK, PF_BK, V_BK, S_TRAFO = 75.0, 0.72, 400.0, 100.0
S_BK = P_BK / PF_BK
Q_BK = P_BK * math.tan(math.acos(PF_BK))
I_BK = S_BK * 1000 / (math.sqrt(3) * V_BK)
PF_T = 0.95
QC_BK = P_BK * (math.tan(math.acos(PF_BK)) - math.tan(math.acos(PF_T)))
S_BK2 = P_BK / PF_T
I_BK2 = S_BK2 * 1000 / (math.sqrt(3) * V_BK)
C_BK = QC_BK * 1000 / (3 * W_ * V_BK ** 2) * 1e6
P_MOTOR, PF_MOTOR = 20.0, 0.8
P_BK3 = P_BK + P_MOTOR
Q_BK3 = Q_BK + P_MOTOR * math.tan(math.acos(PF_MOTOR)) - QC_BK
S_BK3 = math.hypot(P_BK3, Q_BK3)
PF_BK3 = P_BK3 / S_BK3
I_BK3 = S_BK3 * 1000 / (math.sqrt(3) * V_BK)

FQ_JUDUL = [
    "Hitung S, Q, dan arus saluran bengkel pada pf 0,72: mengapa trafo 100 kVA 'penuh' padahal bebannya baru 75 kW?",
    "Rancang bank kapasitor untuk pf 0,95: berapa kVAR, berapa µF per fasa, dan apa yang terjadi pada arus, trafo, dan denda?",
    "Setelah bank kapasitor terpasang, ditambah motor 20 kW pf 0,8: masih amankah trafo, dan mengapa tidak dikompensasi sampai pf 1,0?",
]
FQ_RINGKAS = [
    f"Beban bengkel {ind(P_BK, 0)} kW pada pf {ind(PF_BK, 2)}, {ind(V_BK, 0)} V tiga fasa, trafo {ind(S_TRAFO, 0)} kVA. Hitung S = P/pf, Q = P tan φ, dan I_L = S/(√3·V_L) (Persamaan 6 dan 10). Bandingkan S dengan kapasitas trafo dan jelaskan mengapa Q, bukan P, yang memenuhinya.",
    f"Sasaran pf {ind(PF_T, 2)}: Q_C = P(tan φ₁ − tan φ₂) (Persamaan 8), C per fasa bank Δ pada {ind(V_BK, 0)} V/50 Hz, S dan arus sesudahnya, kapasitas trafo yang terbebas, dan denda kVARh yang hilang. Sebutkan cara pemasangan (terpusat/step otomatis) dan risikonya.",
    f"Tambahkan motor {ind(P_MOTOR, 0)} kW pf {ind(PF_MOTOR, 1)} dengan bank kapasitor {ind(QC_BK, 1)} kVAR tetap: jumlahkan daya kompleks (Persamaan 7), hitung pf dan S baru, bandingkan lagi dengan {ind(S_TRAFO, 0)} kVA. Jelaskan mengapa kompensasi sampai pf 1,0 atau mendahului dihindari (tegangan naik, resonansi harmonik, eksitasi sendiri motor).",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Beban bengkel permesinan (mesin bubut, frais, kompresor: semuanya motor induksi) berjumlah {ind(P_BK, 0)} kW pada faktor daya rata-rata {ind(PF_BK, 2)} tertinggal, dipasok {ind(V_BK, 0)} V tiga fasa dari trafo langganan {ind(S_TRAFO, 0)} kVA. Hitung daya semu S, daya reaktif Q, dan arus saluran (Persamaan 6 dan 10). Bandingkan S dengan kapasitas trafo: apakah benar trafo sudah kelebihan beban walau dayanya 'baru' {ind(P_BK, 0)} kW? Jelaskan dengan segitiga daya bagian mana dari arus yang tidak menghasilkan kerja, dan mengapa PLN menagih kVARh bila pf di bawah 0,85.",
            ["S = P/pf", "Q = P·tan φ", "I_L = S/(√3·V_L)"],
            f"Pada pf {ind(PF_BK, 2)}, beban {ind(P_BK, 0)} kW memerlukan daya semu dan arus saluran sekitar...",
            [f"{ind(P_BK, 0)} kVA dan {ind(P_BK * 1000 / (math.sqrt(3) * V_BK), 0)} A: trafo masih longgar", f"{ind(P_BK * PF_BK, 1)} kVA dan {ind(P_BK * PF_BK * 1000 / (math.sqrt(3) * V_BK), 0)} A", f"{ind(S_BK, 1)} kVA dan {ind(I_BK, 0)} A: melampaui trafo {ind(S_TRAFO, 0)} kVA", f"{ind(S_BK, 1)} kVA dan {ind(S_BK * 1000 / V_BK, 0)} A"],
            f"✅ Tepat! \\(S = {ind(P_BK, 0)}/{ind(PF_BK, 2)} = {ind(S_BK, 2)}\\) kVA, \\(Q = {ind(P_BK, 0)}\\tan(\\arccos {ind(PF_BK, 2)}) = {ind(Q_BK, 1)}\\) kVAR, \\(I_L = {ind(S_BK, 2)}\\times10^3/(\\sqrt{{3}}\\times{ind(V_BK, 0)}) = {ind(I_BK, 1)}\\) A. Trafo {ind(S_TRAFO, 0)} kVA dipanaskan arus, bukan kW: ia sudah {ind(S_BK / S_TRAFO * 100, 0)}% terbebani, dan {ind(Q_BK, 0)} kVAR di antaranya hanya bolak-balik ke kumparan motor.",
            "❌ Trafo dinilai dalam kVA karena pemanasannya bergantung pada arus total, termasuk arus reaktif. Hitung \\(S = P/\\text{pf}\\) dulu, lalu \\(I_L = S/(\\sqrt{3}V_L)\\) dengan S dalam VA.",
            "Petunjuk: (1) Hitung S, Q, dan φ. (2) Hitung I_L dan bandingkan S dengan 100 kVA. (3) Jelaskan peran Q dan alasan denda kVARh.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Rancang bank kapasitor agar faktor daya bengkel naik ke {ind(PF_T, 2)} (Persamaan 8): hitung Q_C, kapasitansi per fasa bila bank disambung segitiga pada {ind(V_BK, 0)} V/50 Hz, daya semu dan arus saluran sesudahnya, serta kapasitas trafo yang terbebas. Bandingkan dengan Gambar 4 dan Animasi 3. Lalu bahas pemasangannya: satu bank tetap atau beberapa step dengan pengendali otomatis, dan apa risikonya bila bank tetap dibiarkan tersambung saat malam hari ketika hanya penerangan yang menyala.",
            ["Q_C = P(tan φ₁ − tan φ₂)", "C_Δ = Q_C/(3ωV_L²)", "S₂ = P/pf₂"],
            f"Untuk menaikkan pf dari {ind(PF_BK, 2)} ke {ind(PF_T, 2)}, bank kapasitor yang diperlukan dan arus saluran sesudahnya sekitar...",
            [f"{ind(QC_BK, 1)} kVAR; arus turun dari {ind(I_BK, 0)} A ke {ind(I_BK2, 0)} A dan S menjadi {ind(S_BK2, 1)} kVA", f"{ind(Q_BK, 1)} kVAR (seluruh Q beban); arus turun ke {ind(P_BK * 1000 / (math.sqrt(3) * V_BK), 0)} A", f"{ind(P_BK * (PF_T - PF_BK), 1)} kVAR; arus tidak berubah karena P tetap", f"{ind(QC_BK, 1)} kW; daya aktif beban turun sebesar itu"],
            f"✅ Tepat! \\(Q_C = {ind(P_BK, 0)}(\\tan\\varphi_1 - \\tan\\varphi_2) = {ind(P_BK, 0)}({ind(math.tan(math.acos(PF_BK)), 4)} - {ind(math.tan(math.acos(PF_T)), 4)}) \\approx {ind(QC_BK, 1)}\\) kVAR; bank Δ: \\(C = {ind(C_BK, 0)}\\) µF per fasa. Sesudahnya \\(S = {ind(S_BK2, 1)}\\) kVA (trafo {ind(S_BK2 / S_TRAFO * 100, 0)}%), \\(I_L = {ind(I_BK2, 1)}\\) A: {ind(S_BK - S_BK2, 1)} kVA kapasitas trafo terbebas tanpa mengurangi satu watt pun produksi.",
            "❌ Kapasitor tidak perlu menghilangkan seluruh Q, hanya selisih sampai pf sasaran; dan ia tidak mengubah P. Hitung \\(\\tan\\varphi\\) untuk kedua pf, lalu \\(Q_C = P(\\tan\\varphi_1 - \\tan\\varphi_2)\\).",
            "Petunjuk: (1) Hitung Q_C dan C per fasa. (2) Hitung S, I_L, dan kapasitas trafo yang terbebas. (3) Bahas step otomatis vs bank tetap dan risiko malam hari.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Setahun kemudian bengkel menambah mesin CNC dengan motor {ind(P_MOTOR, 0)} kW pada pf {ind(PF_MOTOR, 1)} tertinggal; bank kapasitor {ind(QC_BK, 1)} kVAR tidak diubah. Jumlahkan daya kompleks seluruh beban dan kapasitor (Persamaan 7): berapa pf dan S baru, dan apakah trafo {ind(S_TRAFO, 0)} kVA masih cukup? Lalu jawab usul pemilik: 'sekalian saja pasang kapasitor lebih banyak sampai pf 1,0, bahkan lebih'. Jelaskan dengan Bagian 04 mengapa kompensasi berlebih (pf mendahului) dihindari, dan susunan apa yang Anda rekomendasikan (tambah step, pengendali otomatis, kapasitor di terminal motor besar).",
            ["S_tot = ΣP + jΣQ", "pf = P/|S|", "Q_C berlebih → V naik"],
            f"Dengan motor {ind(P_MOTOR, 0)} kW pf {ind(PF_MOTOR, 1)} ditambahkan dan bank {ind(QC_BK, 1)} kVAR tetap, keadaan barunya sekitar...",
            [f"pf {ind(PF_T, 2)} tetap, S = {ind(P_BK3 / PF_T, 1)} kVA: trafo aman", f"P = {ind(P_BK3, 0)} kW, Q = {ind(Q_BK3, 1)} kVAR, pf ≈ {ind(PF_BK3, 2)}, S ≈ {ind(S_BK3, 1)} kVA: trafo kembali melampaui {ind(S_TRAFO, 0)} kVA", f"pf turun ke {ind(PF_BK, 2)} lagi karena motor baru membatalkan kapasitor", f"S = {ind(S_BK2 + P_MOTOR / PF_MOTOR, 1)} kVA (jumlah kVA masing-masing)"],
            f"✅ Tepat! \\(P = {ind(P_BK, 0)} + {ind(P_MOTOR, 0)} = {ind(P_BK3, 0)}\\) kW; \\(Q = {ind(Q_BK, 1)} + {ind(P_MOTOR * math.tan(math.acos(PF_MOTOR)), 1)} - {ind(QC_BK, 1)} = {ind(Q_BK3, 1)}\\) kVAR; \\(S = {ind(S_BK3, 1)}\\) kVA, pf = {ind(PF_BK3, 3)}. pf masih di atas 0,85 (tidak kena denda), tetapi S melampaui {ind(S_TRAFO, 0)} kVA: perlu step kapasitor tambahan ({ind(P_BK3 * (Q_BK3 / P_BK3 - math.tan(math.acos(PF_T))), 1)} kVAR untuk pf 0,95, S = {ind(P_BK3 / PF_T, 1)} kVA) atau trafo lebih besar. Kompensasi sampai pf 1,0 berisiko tegangan naik saat beban ringan, resonansi harmonik, dan eksitasi sendiri motor.",
            "❌ Jumlahkan daya kompleks, bukan kVA-nya: P dijumlahkan, Q dijumlahkan (kapasitor bertanda negatif), lalu \\(S = \\sqrt{P^2 + Q^2}\\). Bank kapasitor tetap tidak 'mengikuti' beban baru.",
            "Petunjuk: (1) Jumlahkan P dan Q semua beban dan kapasitor; hitung pf dan S. (2) Bandingkan dengan 100 kVA dan hitung tambahan kVAR untuk pf 0,95. (3) Jelaskan bahaya kompensasi berlebih dan rekomendasi susunannya.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">S = P/pf</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">I_L = S/(√3·V_L)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">100 kVA?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Trafo Penuh<br><em>Padahal Beban 75 kW</em></h1>
    <p class="hero-sub">Sebuah bengkel permesinan kena denda kVARh dan trafonya panas walau daya terpasang mesinnya jauh di bawah kapasitas trafo. Terapkan kosakata Pertemuan {PERTEMUAN} — segitiga daya, faktor daya, daya kompleks, kapasitor paralel, dan daya tiga fasa — untuk mendiagnosisnya dan merancang perbaikannya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Permesinan {ind(V_BK, 0)} V —<br>Denda kVARh dan Trafo yang Panas</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS DAYA PADA JARINGAN AC TIGA FASA</div>
    <p>
      Sebuah <strong style="color:var(--amber)">bengkel permesinan</strong> berlangganan daya tiga fasa <strong style="color:var(--cyan)">{ind(V_BK, 0)} V</strong> lewat trafo <strong style="color:var(--cyan)">{ind(S_TRAFO, 0)} kVA</strong>. Bebannya mesin bubut, frais, gergaji, dan kompresor, hampir semuanya motor induksi yang sering bekerja jauh di bawah dayanya, dengan jumlah daya aktif <strong>{ind(P_BK, 0)} kW</strong> pada faktor daya rata-rata <strong style="color:var(--pink)">{ind(PF_BK, 2)} tertinggal</strong>.
    </p>
    <p style="margin-top:12px">
      Keluhan pemilik: tagihan memuat <strong>denda kelebihan kVARh</strong> setiap bulan, trafo <strong>terasa panas</strong>, dan pemutus utama pernah trip padahal 'mesinnya cuma 75 kW dari 100 kVA'. Seorang penjual menawarkan <strong style="color:var(--amber)">bank kapasitor</strong>; pemilik bertanya berapa besar yang diperlukan, dan usul 'sekalian sampai pf 1,0'. Tahun depan bengkel berencana menambah mesin CNC dengan motor <strong>{ind(P_MOTOR, 0)} kW</strong>.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menjelaskan gejalanya dengan angka, merancang kapasitornya, dan menilai rencana perluasan <strong style="color:var(--cyan)">sebelum</strong> bengkel membeli apa pun.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Beban: {ind(P_BK, 0)} kW, pf {ind(PF_BK, 2)} tertinggal", "14,165,233", "cyan")}
{kartu(f"Pasokan: {ind(V_BK, 0)} V tiga fasa, 50 Hz", "14,165,233", "cyan")}
{kartu(f"Trafo: {ind(S_TRAFO, 0)} kVA", "14,165,233", "cyan")}
{kartu("Sasaran pf: 0,95; denda bila < 0,85", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Trafo yang panas bukan trafo yang rusak, dan denda kVARh bukan kesalahan tagihan: keduanya adalah arus reaktif yang nyata mengalir tanpa menghasilkan kerja. Forum ini mengajak Anda menghitung <strong>berapa</strong> arus itu, <strong>berapa kVAR</strong> kapasitor yang membatalkannya, dan <strong>mengapa</strong> kompensasi berlebih justru berbahaya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Daya semu bengkel pada tiga keadaan dibandingkan kapasitas trafo {ind(S_TRAFO, 0)} kVA: sekarang, sesudah bank kapasitor, dan sesudah motor CNC ditambahkan</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Bengkel permesinan {ind(V_BK, 0)} V tiga fasa, trafo {ind(S_TRAFO, 0)} kVA: beban motor-motor induksi {ind(P_BK, 0)} kW pada pf {ind(PF_BK, 2)} tertinggal. Keluhan: denda kVARh, trafo panas, pemutus utama pernah trip. Ditawarkan bank kapasitor (sasaran pf 0,95; pemilik usul 'sampai 1,0'); tahun depan ditambah motor CNC {ind(P_MOTOR, 0)} kW pf {ind(PF_MOTOR, 1)}."
FORUM_CHIPS_LMS = [f"beban = {ind(P_BK, 0)} kW, pf {ind(PF_BK, 2)}", f"pasokan = {ind(V_BK, 0)} V 3 fasa", f"trafo = {ind(S_TRAFO, 0)} kVA", "sasaran = pf 0,95"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Daya semu bengkel vs kapasitas trafo (Pertemuan 5)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const tanpf = (pf) => Math.tan(Math.acos(pf));
  const P = 75, pf1 = 0.72, pf2 = 0.95, trafo = 100, VL = 400;
  const Q1 = P * tanpf(pf1), Qc = P * (tanpf(pf1) - tanpf(pf2));
  const kasus = [
    ['sekarang (pf 0,72)', P, Q1, 'rgba(239,68,68,.85)'],
    ['+ kapasitor ' + Qc.toFixed(1) + ' kVAR', P, Q1 - Qc, 'rgba(0,224,158,.85)'],
    ['+ motor CNC 20 kW pf 0,8', P + 20, Q1 - Qc + 20 * tanpf(0.8), 'rgba(255,179,0,.85)'],
  ];
  const padL = 190, padR = 120, padT = 20, barH = 30, gap = 16, plotW = W - padL - padR, maks = 130;
  const X = (s) => padL + s / maks * plotW;
  ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + 3 * (barH + gap)); ctx.stroke();
  ctx.strokeStyle = 'rgba(236,72,153,.9)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(trafo), padT - 6); ctx.lineTo(X(trafo), padT + 3 * (barH + gap) + 4); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(236,72,153,.95)'; ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText('trafo ' + trafo + ' kVA', X(trafo), padT - 8);
  kasus.forEach(([label, Pk, Qk, warna], i) => {
    const S = Math.hypot(Pk, Qk), pf = Pk / S, I = S * 1e3 / (Math.sqrt(3) * VL), y = padT + i * (barH + gap);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(label, padL - 8, y + barH / 2 + 4);
    ctx.fillStyle = 'rgba(0,229,255,.6)'; ctx.fillRect(padL, y, X(Pk) - padL, barH);
    ctx.fillStyle = S > trafo ? 'rgba(239,68,68,.75)' : warna; ctx.fillRect(X(Pk), y, X(S) - X(Pk), barH);
    ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText('S ' + S.toFixed(1) + ' kVA · pf ' + pf.toFixed(2) + ' · ' + I.toFixed(0) + ' A' + (S > trafo ? ' ⚠' : ''), X(S) + 6, y + barH / 2 + 4);
    ctx.fillStyle = 'rgba(2,8,18,.9)'; ctx.fillText('P ' + Pk + ' kW', padL + 6, y + barH / 2 + 4);
  });
  ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('biru = daya aktif P; bagian berwarna = tambahan karena Q; merah bila melampaui trafo', W / 2, H - 8);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
