# Konten Modul 9 Teknik Tenaga Listrik — Pemodelan Saluran Transmisi
# (Sub-CPMK 4.2, Pertemuan 10). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja berbeda dari varian soal.
import cmath
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 9
PERTEMUAN = 10
SUB_CPMK = "4.2"
JUDUL = "Pemodelan Saluran Transmisi"
JUDUL_PANJANG = "Pemodelan Saluran Transmisi"
JUDUL_EKSPOR = "Pemodelan Saluran Transmisi"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
W_ = 2 * math.pi * 50
K_C = 0.05563                                                  # 2π·ε0, µF/km
R_CM, D_M = 1.09, 6.0                                          # ACSR 240, susunan mendatar 6 m
GMD = D_M * 2 ** (1 / 3)
GMR = 0.7788 * R_CM / 100
L_KM = 0.2 * math.log(GMD / GMR)                               # mH/km
X_KM = W_ * L_KM / 1000
C_KM = K_C / math.log(GMD / (R_CM / 100))                      # µF/km
B_KM = W_ * C_KM * 1e-6                                        # S/km
ZC = math.sqrt(X_KM / B_KM)
BETA = math.sqrt(X_KM * B_KM)
SIL150 = 150 ** 2 / ZC
R_AC = 0.12                                                    # Ω/km pada 75 °C
S_BERKAS = 40.0
GMR_B = math.sqrt(GMR * S_BERKAS / 100)
RB = math.sqrt(R_CM / 100 * S_BERKAS / 100)
L_B = 0.2 * math.log(GMD / GMR_B)
C_B = K_C / math.log(GMD / RB)
ZC_B = math.sqrt(W_ * L_B / 1000 / (W_ * C_B * 1e-6))
# saluran 200 km, 150 kV
L_LINE = 200.0
Z_C = complex(R_AC * L_LINE, X_KM * L_LINE)
Y_C = complex(0, B_KM * L_LINE)
A_C = 1 + Y_C * Z_C / 2
C_ABCD = Y_C * (1 + Y_C * Z_C / 4)
P_LOAD, PF_LOAD, VLL = 60.0, 0.9, 132.0
VR = VLL * 1000 / SQ3
IR = cmath.rect(P_LOAD * 1e6 / (3 * VR * PF_LOAD), -math.acos(PF_LOAD))
VS_C = A_C * VR + Z_C * IR
IS_C = C_ABCD * VR + A_C * IR
VS_LL = abs(VS_C) * SQ3 / 1000
REG = (abs(VS_C) / abs(A_C) - VR) / VR * 100
# saluran panjang
GAMMA = cmath.sqrt(complex(R_AC, X_KM) * complex(0, B_KM))
ZC_CPLX = cmath.sqrt(complex(R_AC, X_KM) / complex(0, B_KM))
A_LONG = cmath.cosh(GAMMA * L_LINE)
B_LONG = ZC_CPLX * cmath.sinh(GAMMA * L_LINE)
L_LONG = 400.0
BL = BETA * L_LONG
FERRANTI = (1 / math.cos(BL) - 1) * 100
LAMBDA = 2 * math.pi / BETA
# π ekuivalen 400 km tanpa rugi
ZP = ZC * math.sin(BL)
YP2 = math.tan(BL / 2) / ZC


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def kumparan(x1, x2, y, c, label, dy=-12):
    n, w = 4, (x2 - x1) / 4
    d = " ".join(f"a {w / 2:.1f} {w / 2:.1f} 0 0 1 {w:.1f} 0" for _ in range(n))
    return f'<path d="M {x1} {y} {d}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t((x1 + x2) / 2, y + dy, label, 10.5, c, "middle", "600")


def res_h(x1, x2, y, c, label):
    return f'<rect x="{x1}" y="{y - 9}" width="{x2 - x1}" height="18" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t((x1 + x2) / 2, y - 14, label, 10.5, c, "middle", "600")


def kapasitor(x, y1, y2, c, label):
    ym = (y1 + y2) / 2
    return (kawat(x, y1, x, ym - 4) + kawat(x, ym + 4, x, y2) + f'<line x1="{x - 10}" y1="{ym - 4}" x2="{x + 10}" y2="{ym - 4}" stroke="{c}" stroke-width="2.4"/><line x1="{x - 10}" y1="{ym + 4}" x2="{x + 10}" y2="{ym + 4}" stroke="{c}" stroke-width="2.4"/>'
            + t(x + 14, ym + 4, label, 10.5, c, "start", "600"))


def gambar1():
    b = t(180, 22, "Susunan mendatar dan besaran geometrisnya", 12, TX, "middle", "700")
    cy = 100
    for i, (x, lab, c) in enumerate([(70, "a", "#ef4444"), (180, "b", "#f59e0b"), (290, "c", "#22d3ee")]):
        b += f'<circle cx="{x}" cy="{cy}" r="9" fill="{c}"/>' + t(x, cy - 18, lab, 12, c, "middle", "700")
    b += arrow(80, cy + 26, 170, cy + 26, "#94a3b8", 1.2) + arrow(170, cy + 26, 80, cy + 26, "#94a3b8", 1.2) + t(125, cy + 42, f"D = {ind(D_M, 0)} m", 10.5, AX)
    b += arrow(190, cy + 26, 280, cy + 26, "#94a3b8", 1.2) + arrow(280, cy + 26, 190, cy + 26, "#94a3b8", 1.2) + t(235, cy + 42, f"D = {ind(D_M, 0)} m", 10.5, AX)
    b += arrow(70, cy + 60, 290, cy + 60, "#94a3b8", 1.2) + arrow(290, cy + 60, 70, cy + 60, "#94a3b8", 1.2) + t(180, cy + 76, f"2D = {ind(2 * D_M, 0)} m", 10.5, AX)
    b += t(180, 206, f"GMD = ∛(D·D·2D) = {ind(GMD, 3)} m", 11, TX, "middle", "600") + t(180, 222, f"GMR = 0,7788·r = {ind(GMR * 100, 3)} cm (r = {ind(R_CM, 2)} cm)", 10.5, AX)
    b += t(500, 22, "Dari geometri ke parameter per km", 12, TX, "middle", "700")
    for i, (judul, isi, c) in enumerate([("Induktansi", f"L = 0,2 ln(GMD/GMR) = {ind(L_KM, 4)} mH/km", "#f59e0b"), ("Reaktansi seri", f"x = 2πf·L = {ind(X_KM, 4)} Ω/km", "#a855f7"),
                                          ("Kapasitansi", f"C = 0,05563/ln(GMD/r) = {ind(C_KM * 1000, 3)} nF/km", "#22d3ee"), ("Suseptansi shunt", f"b = 2πf·C = {ind(B_KM * 1e6, 3)} µS/km", "#00e09e")]):
        y = 40 + i * 44
        b += f'<rect x="380" y="{y}" width="260" height="36" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>' + t(390, y + 15, judul, 11, TX, "start", "600") + t(390, y + 29, isi, 9.5, AX, "start")
    b += t(500, 222, f"Z_c = √(x/b) = {ind(ZC, 0)} Ω · SIL 150 kV = {ind(SIL150, 1)} MW", 10.5, "#ec4899", "middle", "600")
    return svg(660, 236, b, "Gambar 1 — Geometri konduktor dan parameter saluran per kilometer")


def gambar2():
    b = t(165, 22, "Konduktor tunggal", 12, TX, "middle", "700") + t(495, 22, "Berkas dua (s = 40 cm)", 12, TX, "middle", "700")
    b += f'<circle cx="165" cy="90" r="12" fill="#94a3b8"/>' + t(165, 120, f"r = {ind(R_CM, 2)} cm · GMR = {ind(GMR * 100, 3)} cm", 10, AX)
    b += f'<circle cx="470" cy="90" r="12" fill="#94a3b8"/><circle cx="520" cy="90" r="12" fill="#94a3b8"/>' + arrow(482, 110, 508, 110, "#94a3b8", 1) + t(495, 124, "s = 40 cm", 9.5, AX)
    b += t(495, 140, f"GMR_b = √(GMR·s) = {ind(GMR_B * 100, 2)} cm · r_b = √(r·s) = {ind(RB * 100, 2)} cm", 10, AX)
    for x, L_, C_, Zc_ in [(165, L_KM, C_KM, ZC), (495, L_B, C_B, ZC_B)]:
        b += t(x, 166, f"L = {ind(L_, 4)} mH/km", 10.5, "#f59e0b", "middle", "600") + t(x, 182, f"C = {ind(C_ * 1000, 3)} nF/km", 10.5, "#22d3ee", "middle", "600") + t(x, 198, f"Z_c = {ind(Zc_, 0)} Ω · SIL 150 kV = {ind(22500 / Zc_, 1)} MW", 10.5, "#ec4899", "middle", "600")
    b += t(330, 226, f"Berkas menurunkan L {ind((1 - L_B / L_KM) * 100, 0)} % dan menaikkan C {ind((C_B / C_KM - 1) * 100, 0)} %: Z_c turun, SIL naik, gradien permukaan turun", 11, AX)
    return svg(660, 236, b, "Gambar 2 — Pengaruh konduktor berkas pada L, C, dan Z_c")


def gambar3():
    b = t(330, 22, f"Nominal-π saluran {ind(L_LINE, 0)} km, 150 kV: Z = R + jX, Y = jB", 12, TX, "middle", "700")
    b += kawat(60, 100, 120, 100) + res_h(120, 190, 100, "#22d3ee", f"R = {ind(Z_C.real, 0)} Ω") + kawat(190, 100, 210, 100) + kumparan(210, 300, 100, "#f59e0b", f"jX = j{ind(Z_C.imag, 1)} Ω") + kawat(300, 100, 600, 100) + kawat(60, 180, 600, 180)
    b += kapasitor(100, 100, 180, "#a855f7", f"jB/2 = j{ind(B_KM * L_LINE / 2 * 1e6, 0)} µS") + kapasitor(560, 100, 180, "#a855f7", f"jB/2")
    b += f'<circle cx="60" cy="100" r="4" fill="#00e09e"/><circle cx="600" cy="100" r="4" fill="#ec4899"/>' + t(60, 88, "V_S, I_S", 10.5, "#00e09e", "middle", "700") + t(600, 88, "V_R, I_R", 10.5, "#ec4899", "middle", "700")
    b += t(330, 208, f"A = D = 1 + YZ/2 = {ind(A_C.real, 4)} + j{ind(A_C.imag, 4)} (|A| = {ind(abs(A_C), 4)});  B = Z;  C = Y(1 + YZ/4) = j{ind(C_ABCD.imag * 1e6, 2)} µS (+{ind(C_ABCD.real * 1e6, 2)} µS)", 11, AX)
    b += t(330, 226, f"Beban {ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)} pada 132 kV → V_S = {ind(VS_LL, 1)} kV, I_S = {ind(abs(IS_C), 1)} A; regulasi {ind(REG, 1)} %", 11, AX)
    return svg(660, 238, b, "Gambar 3 — Model nominal-π dan konstanta ABCD-nya")


def gambar4():
    b = t(330, 22, "Kaskade dua-port: [V_S; I_S] = [A B; C D] × [V_R; I_R], dan perkalian matriks untuk seri", 11.5, TX, "middle", "700")
    for i, (lab, x, c, nilai) in enumerate([("Saluran 1", 90, "#22d3ee", "[A₁ B₁; C₁ D₁]"), ("Trafo / kompensator", 300, "#f59e0b", "[A₂ B₂; C₂ D₂]"), ("Saluran 2", 510, "#a855f7", "[A₃ B₃; C₃ D₃]")]):
        b += f'<rect x="{x - 70}" y="60" width="140" height="70" rx="10" fill="{BOX}" stroke="{c}" stroke-width="1.8"/>' + t(x, 88, lab, 11.5, c, "middle", "700") + t(x, 110, nilai, 11, TX, "middle", "600")
        if i < 2:
            b += arrow(x + 76, 95, x + 134, 95, "#94a3b8", 1.6)
    b += f'<circle cx="14" cy="95" r="4" fill="#00e09e"/>' + t(14, 80, "kirim", 9.5, "#00e09e") + kawat(18, 95, 20, 95) + f'<circle cx="646" cy="95" r="4" fill="#ec4899"/>' + t(646, 80, "terima", 9.5, "#ec4899")
    b += t(330, 160, "[A B; C D]_total = [A₁ B₁; C₁ D₁] · [A₂ B₂; C₂ D₂] · [A₃ B₃; C₃ D₃]  (urutan dari kirim ke terima)", 11, "#00e09e", "middle", "600")
    b += t(330, 182, "Trafo ideal a:1 → [a 0; 0 1/a];  impedansi seri Z → [1 Z; 0 1];  admitansi shunt Y → [1 0; Y 1]", 10.5, AX)
    b += t(330, 200, "Pemeriksaan tiap tahap: AD − BC = 1 (resiprokal); saluran simetris: A = D", 10.5, AX)
    b += t(330, 222, f"Contoh: saluran {ind(L_LINE, 0)} km + trafo 150/20 kV 60 MVA 10 % dihitung sebagai satu matriks, lalu V_S dari V_R dan I_R rel 20 kV", 10.5, AX)
    return svg(660, 234, b, "Gambar 4 — Konstanta ABCD dan kaskade elemen sistem")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    lmax = 600.0
    X = lambda l: x0 + l / lmax * (x1 - x0)
    Y = lambda a: y0 - (a - 0.6) / 0.45 * (y0 - y1)
    for l in [0, 100, 200, 300, 400, 500, 600]:
        b += f'<line x1="{X(l):.1f}" y1="{y1}" x2="{X(l):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(l), y0 + 16, f"{l} km", 10.5, AX)
    for a in [0.6, 0.7, 0.8, 0.9, 1.0]:
        b += t(x0 - 8, Y(a) + 4, f"{ind(a, 1)}", 10.5, AX, "end")
    pts_l = " ".join(f"{X(l):.1f},{Y(math.cos(BETA * l)):.1f}" for l in range(0, 601, 10))
    pts_p = " ".join(f"{X(l):.1f},{Y(1 - X_KM * l * B_KM * l / 2):.1f}" for l in range(0, 601, 10))
    b += f'<polyline points="{pts_l}" fill="none" stroke="#00e09e" stroke-width="2.4"/>' + t(X(320), Y(math.cos(BETA * 320)) - 10, "A = cos(βℓ) (parameter tersebar)", 10.5, "#00e09e", "start", "600")
    b += f'<polyline points="{pts_p}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4"/>' + t(X(430), Y(1 - X_KM * 430 * B_KM * 430 / 2) + 16, "A = 1 − xbℓ²/2 (nominal-π)", 10.5, "#f59e0b", "start", "600")
    b += f'<line x1="{X(250):.1f}" y1="{y1}" x2="{X(250):.1f}" y2="{y0}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 4"/>' + t(X(250) + 4, y1 + 12, "batas praktis nominal-π ± 250 km", 9.5, "#ec4899", "start")
    b += t(28, 110, "|A|", 10.5, AX)
    b += t(347, 232, f"β = √(xb) = {ind(BETA * 1000, 3)}×10⁻³ rad/km (λ = {ind(LAMBDA, 0)} km); pada {ind(L_LONG, 0)} km βℓ = {ind(BL, 3)} rad, A = {ind(math.cos(BL), 4)}, dan V_R tanpa beban = V_S/A (+{ind(FERRANTI, 1)} %)", 11, AX)
    return svg(660, 242, b, "Gambar 5 — Konstanta A terhadap panjang saluran: nominal-π vs parameter tersebar")


def gambar6():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    X = lambda xk: x0 + xk / L_LONG * (x1 - x0)
    Y = lambda v: y0 - (v - 0.85) / 0.35 * (y0 - y1)
    for xk in [0, 100, 200, 300, 400]:
        b += f'<line x1="{X(xk):.1f}" y1="{y1}" x2="{X(xk):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(xk), y0 + 16, f"{xk} km", 10.5, AX)
    for v in [0.9, 1.0, 1.1, 1.2]:
        b += t(x0 - 8, Y(v) + 4, f"{ind(v, 1)} pu", 10.5, AX, "end")
    for rasio, c, lab in [(0.0, "#ef4444", "tanpa beban"), (0.5, "#22d3ee", "0,5 SIL"), (1.0, "#00e09e", "1,0 SIL (rata)"), (1.5, "#f59e0b", "1,5 SIL")]:
        IR_ = rasio / ZC
        V = lambda xk: math.hypot(math.cos(BETA * xk), ZC * IR_ * math.sin(BETA * xk))
        VS = V(L_LONG)
        pts = " ".join(f"{X(xk):.1f},{Y(V(xk) / VS):.1f}" for xk in [L_LONG - i * 8 for i in range(0, 51)])
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t(x1 + 4, Y(1 / VS) + 4, lab, 9.5, c, "start", "600")
    b += t(x0 + 6, y1 + 12, "V_S = 1 pu di kiri; jarak dari ujung kirim →", 10, AX, "start")
    b += t(347, 232, f"Saluran tanpa rugi {ind(L_LONG, 0)} km: V(x) = V_R cos βx + jZ_c I_R sin βx; di bawah SIL tegangan naik ke ujung terima, di atas SIL turun, pada SIL rata", 11, AX)
    return svg(660, 242, b, "Gambar 6 — Profil tegangan saluran panjang untuk beban di bawah, pada, dan di atas SIL")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-induktansi">R &amp; L</a>
  <a href="#m-kapasitansi">C &amp; Berkas</a>
  <a href="#m-pi">Nominal-π</a>
  <a href="#m-abcd">ABCD</a>
  <a href="#m-panjang">Saluran Panjang</a>
  <a href="#m-sil">Z_c, SIL, Profil</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="110" r="5" fill="rgba(239,68,68,.7)"/><circle cx="50" cy="110" r="5" fill="rgba(255,179,0,.7)"/><circle cx="80" cy="110" r="5" fill="rgba(0,229,255,.7)"/>
      <line x1="20" y1="130" x2="50" y2="130" stroke="rgba(148,163,184,.5)" stroke-width="1"/><line x1="50" y1="130" x2="80" y2="130" stroke="rgba(148,163,184,.5)" stroke-width="1"/>
      <text x="30" y="144" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">D</text><text x="60" y="144" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">D</text>
      <text x="14" y="90" fill="rgba(255,179,0,.6)" font-family="JetBrains Mono" font-size="8">L = 0,2 ln(GMD/GMR)</text>
      <text x="14" y="170" fill="rgba(0,229,255,.6)" font-family="JetBrains Mono" font-size="8">C = 2πε/ln(GMD/r)</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="90" x2="90" y2="90" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="10" y1="150" x2="90" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <rect x="36" y="84" width="28" height="12" rx="2" fill="none" stroke="rgba(0,229,255,.55)" stroke-width="1.5"/>
      <line x1="22" y1="90" x2="22" y2="114" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/><line x1="16" y1="114" x2="28" y2="114" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="16" y1="120" x2="28" y2="120" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="22" y1="120" x2="22" y2="150" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/>
      <line x1="78" y1="90" x2="78" y2="114" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/><line x1="72" y1="114" x2="84" y2="114" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="72" y1="120" x2="84" y2="120" stroke="rgba(168,85,247,.6)" stroke-width="1.6"/><line x1="78" y1="120" x2="78" y2="150" stroke="rgba(168,85,247,.5)" stroke-width="1.2"/>
      <text x="26" y="72" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">[A B; C D]</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">L = 0,2 ln(GMD/GMR)</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">C = 2πε₀/ln(GMD/r)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">A = 1 + YZ/2</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">γ = √(zy)</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Z_c = √(z/y)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">A = cosh γℓ</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">AD − BC = 1</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">SIL = V²/Z_c</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Pemodelan</span><br>
      <em>Saluran</em><br>
      <span class="hl-amber">Transmisi</span>
    </h1>
    <p class="hero-sub">Modul 6 memakai R, X, dan B saluran sebagai angka yang diketahui; modul ini menurunkannya dari geometri konduktor dan menara, lalu merakitnya menjadi model yang dapat dihitung: nominal-π dengan konstanta ABCD untuk saluran menengah, dan parameter tersebar dengan impedansi karakteristik dan konstanta propagasi untuk saluran panjang. Hasilnya adalah kemampuan meramalkan tegangan, arus, dan batas daya sebuah saluran hanya dari gambar rancangannya.</p>
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

    # 01 — R & L
    isi = figure(1, "Geometri konduktor dan parameter saluran per kilometer", f"ACSR 240 (r = {ind(R_CM, 2)} cm) pada susunan mendatar berjarak {ind(D_M, 0)} m: GMD = {ind(GMD, 2)} m dan GMR = {ind(GMR * 100, 3)} cm memberi L = {ind(L_KM, 3)} mH/km dan C = {ind(C_KM * 1000, 2)} nF/km; dari keduanya lahir Z_c ≈ {ind(ZC, 0)} Ω dan SIL {ind(SIL150, 0)} MW pada 150 kV.", gambar1())
    isi += formula(1, "Induktansi Saluran Tiga Fasa Tertransposisi", r"L = 2\times10^{-7}\ln\dfrac{GMD}{GMR}\ \text{H/m} = 0{,}2\ln\dfrac{GMD}{GMR}\ \text{mH/km}, \qquad GMD = \sqrt[3]{D_{ab}D_{bc}D_{ca}}, \qquad GMR = 0{,}7788\,r\ (\text{pejal})",
                   rf"Susunan mendatar D = {ind(D_M, 0)} m: \(GMD = \sqrt[3]{{{ind(D_M, 0)}\cdot{ind(D_M, 0)}\cdot{ind(2 * D_M, 0)}}} = {ind(GMD, 3)}\) m; \(GMR = 0{{,}}7788\times{ind(R_CM, 2)} = {ind(GMR * 100, 3)}\) cm; \(L = 0{{,}}2\ln({ind(GMD * 100, 1)}/{ind(GMR * 100, 3)}) = {ind(L_KM, 4)}\) mH/km; \(x = 2\pi\cdot50\cdot L = {ind(X_KM, 4)}\) Ω/km. Untuk ACSR berlapis, GMR diambil dari tabel pabrikan (sedikit berbeda dari 0,7788 r).",
                   "Induktansi lahir dari fluks magnet di sekeliling konduktor: makin jauh fasa lain (GMD besar), makin banyak fluks yang dilingkupi, makin besar L; makin besar konduktor (GMR besar), makin kecil L. Transposisi (menukar posisi fasa tiap sepertiga panjang) membuat ketiga fasa mempunyai L rata-rata yang sama sehingga cukup satu angka per fasa. Faktor 0,7788 = e^(−1/4) memasukkan fluks di dalam konduktor.",
                   [("GMD", "Jarak rata-rata geometris antar-fasa (m)"), ("GMR", "Jari-jari rata-rata geometris konduktor (m)"), ("D_{ab}, D_{bc}, D_{ca}", "Jarak antar-pasangan fasa (m)"), ("r", "Jari-jari luar konduktor (m)")])
    isi += formula(2, "Resistansi dan Impedansi Seri per Kilometer", r"z = r_{ac} + jx = r_{ac} + j\,2\pi f L\ \ \Omega/\text{km}, \qquad Z = z\,\ell",
                   rf"ACSR 240: \(r_{{ac}} \approx {ind(R_AC, 2)}\) Ω/km pada 75 °C (Modul 8), \(x = {ind(X_KM, 4)}\) Ω/km → \(z = {ind(R_AC, 2)} + j{ind(X_KM, 3)}\) Ω/km; untuk {ind(L_LINE, 0)} km, \(Z = {ind(Z_C.real, 0)} + j{ind(Z_C.imag, 1)}\) Ω. Perbandingan x/r ≈ {ind(X_KM / R_AC, 1)}: pada saluran tinggi reaktansi mendominasi, itulah sebabnya studi aliran daya dan hubung singkat sering mengabaikan R.",
                   "Resistansi ditentukan bahan dan penampang (Modul 8), reaktansi oleh geometri; keduanya hampir tidak bergantung tegangan. Karena jarak fasa tumbuh bersama tegangan, x per km untuk 150–500 kV hampir sama (0,3–0,45 Ω/km); yang berubah adalah berkas, yang menurunkannya.",
                   [("z", "Impedansi seri per km (Ω/km)"), ("r_{ac}", "Resistansi AC pada suhu kerja (Ω/km)"), ("\\ell", "Panjang saluran (km)")])
    isi += cards([
        ("📐", "Transposisi", "Tanpa transposisi fasa tengah susunan mendatar mempunyai L lebih kecil dan tegangan tak seimbang 1–2 %; saluran panjang ditransposisi di 1/3 dan 2/3 panjang.", None),
        ("🔢", "GMR dari Tabel", "ACSR berlapis: GMR ≈ 0,80–0,82 r karena inti baja tidak mengalirkan arus; tabel pabrikan memberi GMR (ft atau cm) dan x pada 1 ft spacing.", None),
        ("📏", "Metode 1 Meter", "Tabel lama memberi x_a (reaktansi pada jarak 1 m/1 ft) dan x_d (faktor jarak): x = x_a + x_d, hanya bentuk lain dari ln(GMD/GMR) = ln(1/GMR) + ln(GMD).", r"\(x = x_a + x_d\)"),
        ("🔁", "Dua Sirkit", "Menara dua sirkit yang berbagi menara: induktansi tiap sirkit turun sedikit oleh kopling; dihitung dengan GMD/GMR gabungan (self dan mutual).", None),
        ("🌍", "Lintasan Balik Tanah", "Untuk arus urutan nol (gangguan ke tanah) lintasan balik lewat tanah dengan kedalaman ekuivalen Carson ratusan meter: induktansi urutan nol 2–3 kali urutan positif.", None),
        ("🧮", "Satuan", "2×10⁻⁷ H/m = 0,2 mH/km = 0,3219 mH/mile; jangan mencampur GMD meter dengan GMR sentimeter tanpa mengonversi salah satunya.", None),
    ])
    isi += tabel(["Susunan (ACSR 240, r 1,09 cm)", "GMD (m)", "GMR (cm)", "L (mH/km)", "x (Ω/km)"], [
        [f"Mendatar D = {ind(D_M, 0)} m", ind(GMD, 3), ind(GMR * 100, 3), ind(L_KM, 4), ind(X_KM, 4)],
        ["Segitiga sama sisi D = 6 m", "6,000", ind(GMR * 100, 3), ind(0.2 * math.log(6 / GMR), 4), ind(W_ * 0.2 * math.log(6 / GMR) / 1000, 4)],
        ["Mendatar D = 4 m (70 kV)", ind(4 * 2 ** (1 / 3), 3), ind(GMR * 100, 3), ind(0.2 * math.log(4 * 2 ** (1 / 3) / GMR), 4), ind(W_ * 0.2 * math.log(4 * 2 ** (1 / 3) / GMR) / 1000, 4)],
        ["Mendatar D = 11 m (500 kV, 1 konduktor)", ind(11 * 2 ** (1 / 3), 3), ind(GMR * 100, 3), ind(0.2 * math.log(11 * 2 ** (1 / 3) / GMR), 4), ind(W_ * 0.2 * math.log(11 * 2 ** (1 / 3) / GMR) / 1000, 4)],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> jarak fasa yang hampir tiga kali lipat (4 → 11 m) hanya menaikkan x sekitar 15 %, karena logaritma. Reaktansi saluran hampir tidak dapat diturunkan dengan merapatkan fasa; yang efektif adalah memperbesar GMR lewat berkas (Bagian 02). Soal C1, C2, dan C11 memakai Persamaan (1)–(2).")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01–02 menurunkan z dan y per km dari geometri (R, L, C, berkas). Bagian 03–04 merakitnya menjadi nominal-π dan konstanta ABCD yang dapat dikaskade. Bagian 05 memperluas ke saluran panjang dengan γ dan Z_c, dan Bagian 06 memakai keduanya untuk SIL dan profil tegangan. Animasi memutar geometri dan panjang; Python menghitung semuanya dengan bilangan kompleks.")
    m += bagian(1, "m-induktansi", "Parameter dari Geometri:<br>Resistansi dan Induktansi",
                "Saluran transmisi tidak dibeli dengan label R, L, dan C; ketiganya harus dihitung dari bahan konduktor, jari-jarinya, dan jarak antar-fasa pada menara. Persamaan (1) menurunkan induktansi dari dua jarak rata-rata geometris, GMD dan GMR, dan Persamaan (2) menggabungkannya dengan resistansi Modul 8 menjadi impedansi seri per kilometer. Gambar 1 merangkum jalannya.",
                isi, "RESISTANSI DAN INDUKTANSI")

    # 02 — C & berkas
    isi = figure(2, "Pengaruh konduktor berkas pada L, C, dan Z_c", f"Membagi tiap fasa menjadi dua sub-konduktor berjarak 40 cm memperbesar GMR dan jari-jari efektif: L turun {ind((1 - L_B / L_KM) * 100, 0)} %, C naik {ind((C_B / C_KM - 1) * 100, 0)} %, Z_c turun dari {ind(ZC, 0)} ke {ind(ZC_B, 0)} Ω, dan SIL naik sebanding.", gambar2())
    isi += formula(3, "Kapasitansi Saluran dan Arus Pengisian", r"C = \dfrac{2\pi\varepsilon_0}{\ln(GMD/r)} = \dfrac{0{,}05563}{\ln(GMD/r)}\ \mu\text{F/km (fasa–netral)}, \qquad y = jb = j\,2\pi f C, \qquad I_C = \dfrac{V_L}{\sqrt{3}}\,b\,\ell",
                   rf"Susunan contoh: \(C = 0{{,}}05563/\ln({ind(GMD * 100, 1)}/{ind(R_CM, 2)}) = {ind(C_KM * 1000, 3)}\) nF/km; \(b = 2\pi\cdot50\cdot C = {ind(B_KM * 1e6, 3)}\) µS/km; {ind(L_LINE, 0)} km pada 150 kV menarik arus pengisian \({ind(150 / SQ3, 1)}\times10^3\times{ind(B_KM * L_LINE * 1e6, 1)}\times10^{{-6}} = {ind(150e3 / SQ3 * B_KM * L_LINE, 1)}\) A per fasa dan membangkitkan \({ind(150 ** 2 * B_KM * L_LINE, 2)}\) MVAR.",
                   "Kapasitansi memakai jari-jari luar r (muatan di permukaan), bukan GMR; selebihnya bentuknya cermin induktansi. Efek tanah menambah C sedikit (1–3 %) dan sering diabaikan pada saluran udara; pada kabel, isolasi berpermitivitas 2–4 dan jarak sangat dekat membuat C 20–50 kali lebih besar, sumber arus pengisian yang membatasi panjang kabel AC.",
                   [("\\varepsilon_0", "Permitivitas ruang hampa 8,854×10⁻¹² F/m"), ("r", "Jari-jari luar konduktor (m)"), ("b", "Suseptansi shunt per km (S/km)"), ("I_C", "Arus pengisian per fasa (A)")])
    isi += formula(4, "Konduktor Berkas: GMR dan Jari-jari Efektif", r"GMR_b = \sqrt[n]{n\,GMR\,s^{\,n-1}}, \qquad r_b = \sqrt[n]{n\,r\,s^{\,n-1}}, \qquad L = 0{,}2\ln\dfrac{GMD}{GMR_b}, \quad C = \dfrac{0{,}05563}{\ln(GMD/r_b)}",
                   rf"Berkas dua (s = 40 cm): \(GMR_b = \sqrt{{{ind(GMR * 100, 3)}\times40}} = {ind(GMR_B * 100, 2)}\) cm, \(r_b = \sqrt{{{ind(R_CM, 2)}\times40}} = {ind(RB * 100, 2)}\) cm → \(L = {ind(L_B, 4)}\) mH/km, \(C = {ind(C_B * 1000, 3)}\) nF/km. Untuk berkas 3 dan 4 (segitiga/bujur sangkar bersisi s) rumus akar-n yang sama berlaku.",
                   "Berkas adalah cara termurah 'membesarkan' konduktor secara elektrik tanpa menambah bahan: jari-jari efektif tumbuh dengan √(r·s), bukan dengan luas. Tiga akibatnya sekaligus menguntungkan saluran tinggi: reaktansi turun (batas daya naik, Modul 6), kapasitansi naik (Z_c turun, SIL naik), dan gradien permukaan turun (korona, Modul 8).",
                   [("n", "Jumlah sub-konduktor per fasa"), ("s", "Jarak antar sub-konduktor (m)"), ("GMR_b, r_b", "GMR dan jari-jari efektif berkas (m)")])
    isi += cards([
        ("⚡", "Arus Pengisian", "Saluran 500 kV 400 km membangkitkan ± 300 MVAR saat tanpa beban; itulah Q yang harus diserap reaktor shunt (Modul 6).", r"\(Q_C = V^2 b\,\ell\)"),
        ("🌍", "Efek Tanah", "Bayangan muatan di tanah menaikkan C fasa–netral 1–3 % untuk konduktor 10–20 m di atas tanah; diperhitungkan pada studi rinci dan pada kabel.", None),
        ("🔌", "Kabel", "XLPE 150 kV: C ≈ 0,2–0,3 µF/km (25–35 kali saluran udara); 40 km kabel menarik arus pengisian ratusan ampere, alasan batas panjang AC dan pilihan HVDC.", None),
        ("🔗", "Berkas 4 × 500 kV", "r_b ≈ 25–30 cm untuk sub-konduktor 1,4 cm berjarak 45 cm: seolah-olah satu konduktor berdiameter setengah meter. Z_c ≈ 230–260 Ω.", None),
        ("📡", "Kawat Tanah", "Kawat tanah yang ditanahkan sedikit menaikkan C dan menurunkan L urutan nol; diabaikan pada perhitungan urutan positif.", None),
        ("🧮", "Ketelitian", "Rumus per-km ini akurat ±2–3 % dibanding pengukuran; perbedaan terbesar datang dari GMR ACSR berlapis dan efek tanah, keduanya ada di tabel pabrikan.", None),
    ])
    isi += tabel(["Konfigurasi (GMD 7,56 m)", "GMR_eff (cm)", "r_eff (cm)", "L (mH/km)", "C (nF/km)", "Z_c (Ω)", "SIL 150 kV (MW)"], [
        ["1 × ACSR 240", ind(GMR * 100, 3), ind(R_CM, 2), ind(L_KM, 4), ind(C_KM * 1000, 3), ind(ZC, 0), ind(SIL150, 1)],
        ["2 × ACSR 240, s 40 cm", ind(GMR_B * 100, 2), ind(RB * 100, 2), ind(L_B, 4), ind(C_B * 1000, 3), ind(ZC_B, 0), ind(22500 / ZC_B, 1)],
        ["1 × ACSR 400 (r 1,43 cm)", ind(0.7788 * 1.43, 3), "1,43", ind(0.2 * math.log(GMD / (0.7788 * 0.0143)), 4), ind(K_C / math.log(GMD / 0.0143) * 1000, 3), ind(math.sqrt(W_ * 0.2 * math.log(GMD / (0.7788 * 0.0143)) / 1000 / (W_ * K_C / math.log(GMD / 0.0143) * 1e-6)), 0), ind(22500 / math.sqrt(W_ * 0.2 * math.log(GMD / (0.7788 * 0.0143)) / 1000 / (W_ * K_C / math.log(GMD / 0.0143) * 1e-6)), 1)],
        ["4 × ACSR 400, s 45 cm (GMD 15,1 m)", ind((4 * 0.7788 * 1.43 * 45 ** 3) ** 0.25, 2), ind((4 * 1.43 * 45 ** 3) ** 0.25, 2), ind(0.2 * math.log(15.1 / ((4 * 0.7788 * 1.43 * 45 ** 3) ** 0.25 / 100)), 4), ind(K_C / math.log(15.1 / ((4 * 1.43 * 45 ** 3) ** 0.25 / 100)) * 1000, 3), ind(math.sqrt(W_ * 0.2 * math.log(15.1 / ((4 * 0.7788 * 1.43 * 45 ** 3) ** 0.25 / 100)) / 1000 / (W_ * K_C / math.log(15.1 / ((4 * 1.43 * 45 ** 3) ** 0.25 / 100)) * 1e-6)), 0), "—"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> mengganti ACSR 240 dengan 400 (penampang +67 %) hanya menurunkan L 4 %, sedangkan berkas dua dari konduktor yang sama menurunkannya 28 %. Baris terakhir adalah konfigurasi SUTET 500 kV: Z_c di bawah 250 Ω sehingga SIL 500 kV melampaui 1000 MW. Soal C3, C4, dan C5 memakai Persamaan (3)–(4).")
    m += bagian(2, "m-kapasitansi", "Kapasitansi dan<br>Konduktor Berkas",
                "Di antara konduktor bertegangan dan tanah terbentang kapasitor raksasa yang menarik arus pengisian bahkan tanpa beban. Persamaan (3) menurunkan kapasitansi dari geometri yang sama dengan induktansi, dan Persamaan (4) memperlihatkan bagaimana konduktor berkas mengubah keduanya sekaligus. Gambar 2 membandingkan konduktor tunggal dengan berkas dua.",
                isi, "KAPASITANSI DAN BERKAS")

    # 03 — nominal π
    isi = figure(3, "Model nominal-π dan konstanta ABCD-nya", f"Saluran {ind(L_LINE, 0)} km, 150 kV: seluruh impedansi seri di tengah, separuh admitansi shunt di tiap ujung. Konstanta A = {ind(abs(A_C), 4)} (kurang dari satu) dan C mengandung suku YZ/4 yang muncul dari kapasitor ujung kirim.", gambar3())
    isi += formula(5, "Nominal-π: Persamaan Ujung Kirim", r"\mathbf{V}_S = \left(1 + \tfrac{YZ}{2}\right)\mathbf{V}_R + Z\,\mathbf{I}_R, \qquad \mathbf{I}_S = Y\left(1 + \tfrac{YZ}{4}\right)\mathbf{V}_R + \left(1 + \tfrac{YZ}{2}\right)\mathbf{I}_R",
                   rf"Saluran contoh: \(Z = {ind(Z_C.real, 0)} + j{ind(Z_C.imag, 1)}\) Ω, \(Y = j{ind(Y_C.imag * 1e6, 1)}\) µS; beban {ind(P_LOAD, 0)} MW pf {ind(PF_LOAD, 1)} pada 132 kV: \(I_R = {ind(abs(IR), 1)}\angle{{-{ind(math.degrees(math.acos(PF_LOAD)), 1)}^\circ}}\) A; \(V_S = {ind(VS_LL, 2)}\) kV, \(I_S = {ind(abs(IS_C), 1)}\) A (lebih kecil daripada I_R karena kapasitor memasok sebagian arus reaktif); regulasi {ind(REG, 2)} %.",
                   "Nominal-π adalah kompromi antara ketelitian dan kesederhanaan: ia mengumpulkan kapasitansi yang sebenarnya tersebar ke dua titik. Untuk saluran ≤ 250 km kesalahannya di bawah 1 %; di atas itu dipakai π-ekuivalen dengan parameter terkoreksi (Bagian 05). Nominal-T (Z dibagi dua, Y di tengah) setara secara ketelitian tetapi kurang praktis karena menambah simpul.",
                   [("Z, Y", "Impedansi seri dan admitansi shunt total (Ω, S)"), ("\\mathbf{V}_R, \\mathbf{I}_R", "Fasor ujung terima per fasa"), ("\\mathbf{V}_S, \\mathbf{I}_S", "Fasor ujung kirim per fasa")])
    isi += cards([
        ("📏", "Pendek: Y = 0", "Di bawah ±80 km, A = D = 1, B = Z, C = 0: V_S = V_R + Z·I_R (Modul 6). Kesalahan mengabaikan Y pada 80 km, 150 kV: ± 0,3 %.", None),
        ("📐", "Menengah: Y terkumpul", "80–250 km: nominal-π; kapasitor ujung terima menambah arus mendahului sebesar jB/2·V_R, mengurangi arus reaktif yang lewat Z.", None),
        ("🌐", "Panjang: tersebar", "> 250 km: nominal-π dengan Z′ dan Y′ terkoreksi dari cosh/sinh (Bagian 05); untuk 500 km kesalahan nominal-π mencapai 3–5 %.", None),
        ("🧮", "Kompleks", "Semua suku kompleks: A tidak lagi nyata bila R ≠ 0 (bagian khayal BR/2). Python <code>complex</code> menangani ini tanpa rumus terpisah.", None),
        ("🔁", "Kebalikannya", "Dari V_S dan I_S ke ujung terima: V_R = D·V_S − B·I_S, I_R = −C·V_S + A·I_S (matriks balik, memakai AD − BC = 1).", r"\(\mathbf{V}_R = D\mathbf{V}_S - B\mathbf{I}_S\)"),
        ("📊", "Regulasi & Efisiensi", "V_R,nl = |V_S|/|A|; P_S = 3 Re(V_S I_S*); η = P_R/P_S. Semua besaran Modul 6 langsung tersedia dari ABCD.", None),
    ])
    isi += tabel(["Model saluran contoh (200 km)", "A", "B (Ω)", "C (µS)", "V_S (kV) beban 60 MW", "I_S (A)"], [
        ["Pendek (Y = 0)", "1", f"{ind(Z_C.real, 0)} + j{ind(Z_C.imag, 1)}", "0", ind(abs(VR + Z_C * IR) * SQ3 / 1000, 2), ind(abs(IR), 1)],
        ["Nominal-π", f"{ind(A_C.real, 4)} + j{ind(A_C.imag, 4)}", f"{ind(Z_C.real, 0)} + j{ind(Z_C.imag, 1)}", f"j{ind(C_ABCD.imag * 1e6, 2)}", ind(VS_LL, 2), ind(abs(IS_C), 1)],
        ["Parameter tersebar", f"{ind(A_LONG.real, 4)} + j{ind(A_LONG.imag, 4)}", f"{ind(B_LONG.real, 1)} + j{ind(B_LONG.imag, 1)}", "—", ind(abs(A_LONG * VR + B_LONG * IR) * SQ3 / 1000, 2), "—"],
    ])
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> pada 200 km, nominal-π dan parameter tersebar memberi V_S yang berbeda hanya {ind(abs(VS_LL - abs(A_LONG * VR + B_LONG * IR) * SQ3 / 1000), 2)} kV, sedangkan model pendek menyimpang lebih dari 2 kV karena mengabaikan arus pengisian. Soal C6–C8 dan C12 memakai Persamaan (5).")
    m += bagian(3, "m-pi", "Model Nominal-π<br>Saluran Menengah",
                "Setelah z dan y per kilometer diketahui, saluran sepanjang ℓ dapat diwakili tiga elemen terkumpul: impedansi seri Z = zℓ di tengah dan dua kapasitor Y/2 di ujung. Persamaan (5) menuliskan hubungan ujung kirim–terima untuk model ini, dan Gambar 3 memperlihatkan rangkaian serta konstanta ABCD-nya untuk saluran contoh.",
                isi, "NOMINAL-π")

    # 04 — ABCD
    isi = figure(4, "Konstanta ABCD dan kaskade elemen sistem", "Setiap elemen dua-port (saluran, trafo, kompensator) diwakili matriks 2×2; elemen yang dirangkai seri diwakili perkalian matriksnya dalam urutan dari ujung kirim ke ujung terima. Pemeriksaan AD − BC = 1 berlaku pada tiap matriks dan hasil kalinya.", gambar4())
    isi += formula(6, "Konstanta Rangkaian Umum dan Kaskade", r"\begin{bmatrix}\mathbf{V}_S\\ \mathbf{I}_S\end{bmatrix} = \begin{bmatrix}A & B\\ C & D\end{bmatrix}\begin{bmatrix}\mathbf{V}_R\\ \mathbf{I}_R\end{bmatrix}, \qquad AD - BC = 1, \qquad \begin{bmatrix}A&B\\C&D\end{bmatrix}_{tot} = \prod_k \begin{bmatrix}A_k&B_k\\C_k&D_k\end{bmatrix}",
                   rf"Nominal-π contoh: \(A = D = {ind(A_C.real, 4)} + j{ind(A_C.imag, 4)}\), \(B = {ind(Z_C.real, 0)} + j{ind(Z_C.imag, 1)}\) Ω, \(C = j{ind(C_ABCD.imag * 1e6, 2)}\) µS; \(AD - BC = {ind((A_C * A_C - Z_C * C_ABCD).real, 5)} + j{ind((A_C * A_C - Z_C * C_ABCD).imag, 6)}\) ✓. Trafo 150/20 kV (a = 7,5) di ujung terima dengan reaktansi 20 Ω (sisi 150 kV): \([A\ B; C\ D]_{{trafo}} = [1\ j20; 0\ 1]\cdot[a\ 0; 0\ 1/a]\).",
                   "ABCD adalah 'bahasa antar-modul' sistem tenaga: saluran, trafo, reaktor, kapasitor seri, dan bahkan generator Thevenin ditulis dalam bentuk yang sama, lalu jalur dari pembangkit ke beban dihitung sebagai satu perkalian matriks. Elemen dasar: impedansi seri Z → [1 Z; 0 1], admitansi shunt Y → [1 0; Y 1], trafo ideal a:1 → [a 0; 0 1/a]. Dua saluran paralel digabung dengan rumus khusus (bukan perkalian).",
                   [("A", "Perbandingan tegangan tanpa beban (tanpa satuan)"), ("B", "Impedansi transfer, V_S/I_R saat V_R = 0 (Ω)"), ("C", "Admitansi transfer, I_S/V_R saat I_R = 0 (S)"), ("D", "Perbandingan arus hubung singkat (tanpa satuan)")])
    isi += cards([
        ("🔢", "Makna Fisik", "A = V_S/V_R tanpa beban (Ferranti bila |A| < 1); B = V_S/I_R saat terima dihubung singkat (impedansi hubung singkat); C = I_S/V_R tanpa beban (arus pengisian).", None),
        ("🔁", "Resiprokal", "AD − BC = 1 untuk jaringan pasif dua arah; pelanggaran kecil berarti salah hitung atau parameter yang tidak simetris.", r"\(AD - BC = 1\)"),
        ("⚖️", "Simetris", "Saluran seragam: A = D. Saluran + trafo di satu ujung: A ≠ D, dan itu wajar.", None),
        ("➕", "Paralel", "Dua dua-port paralel: A = (A₁B₂ + A₂B₁)/(B₁ + B₂), B = B₁B₂/(B₁ + B₂), dst.; dipakai untuk saluran dua sirkit.", None),
        ("💻", "Program", "Program aliran daya tidak memakai ABCD melainkan matriks admitansi rel Y_bus, tetapi π-ekuivalen tiap saluran diturunkan dari ABCD-nya.", None),
        ("🔗", "Ke Modul Berikut", "Kompensasi distribusi (Modul 10) dan aliran daya (Modul 14) memakai π-ekuivalen ini sebagai blok bangunan.", None),
    ])
    isi += tabel(["Elemen dua-port", "A", "B", "C", "D"], [
        ["Impedansi seri Z", "1", "Z", "0", "1"],
        ["Admitansi shunt Y", "1", "0", "Y", "1"],
        ["Trafo ideal a:1 (kirim:terima)", "a", "0", "0", "1/a"],
        ["Saluran pendek", "1", "Z", "0", "1"],
        ["Nominal-π", "1 + YZ/2", "Z", "Y(1 + YZ/4)", "1 + YZ/2"],
        ["Parameter tersebar", "cosh γℓ", "Z_c sinh γℓ", "sinh γℓ / Z_c", "cosh γℓ"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> nominal-π adalah deret Taylor orde rendah dari baris terakhir: cosh γℓ ≈ 1 + (γℓ)²/2 = 1 + YZ/2, sinh γℓ ≈ γℓ → Z_c γℓ = Z. Kaskade dua saluran nominal-π tidak sama dengan nominal-π saluran gabungan, satu lagi tanda bahwa model terkumpul hanyalah pendekatan. Soal C6 dan C8 memakai Persamaan (6).")
    m += bagian(4, "m-abcd", "Konstanta ABCD<br>dan Kaskade Elemen",
                "Empat bilangan kompleks cukup untuk mewakili saluran apa pun, dan bentuk yang sama mewakili transformator, reaktor, dan kompensator; elemen-elemen yang dirangkai seri cukup dikalikan matriksnya. Persamaan (6) mendefinisikan konstanta rangkaian umum beserta pemeriksaan wajibnya, dan Gambar 4 memperlihatkan kaskadenya.",
                isi, "KONSTANTA ABCD")

    # 05 — saluran panjang
    isi = figure(5, "Konstanta A terhadap panjang saluran: nominal-π vs parameter tersebar", f"Untuk parameter contoh (β = {ind(BETA * 1000, 3)}×10⁻³ rad/km) nominal-π mengikuti kurva cos(βℓ) dengan baik sampai ± 250 km, lalu makin menyimpang; pada {ind(L_LONG, 0)} km A = {ind(math.cos(BL), 4)} sehingga tegangan tanpa beban naik {ind(FERRANTI, 1)} %.", gambar5())
    isi += formula(7, "Saluran Panjang: Konstanta Propagasi dan Impedansi Karakteristik", r"\gamma = \sqrt{zy} = \alpha + j\beta\ (\text{per km}), \qquad Z_c = \sqrt{\dfrac{z}{y}}, \qquad \text{tanpa rugi: } \beta = \omega\sqrt{LC}, \ Z_c = \sqrt{\dfrac{L}{C}}, \ v = \dfrac{1}{\sqrt{LC}}, \ \lambda = \dfrac{2\pi}{\beta}",
                   rf"Saluran contoh (tanpa rugi): \(\beta = \sqrt{{{ind(X_KM, 4)}\times{ind(B_KM * 1e6, 3)}\times10^{{-6}}}} = {ind(BETA * 1000, 4)}\times10^{{-3}}\) rad/km, \(Z_c = \sqrt{{{ind(X_KM, 4)}/{ind(B_KM * 1e6, 3)}\times10^{{-6}}}} = {ind(ZC, 1)}\) Ω, \(\lambda = 2\pi/\beta = {ind(LAMBDA, 0)}\) km, \(v = \lambda f = {ind(LAMBDA * 50 / 1000, 0)}\times10^3\) km/s. Dengan R = {ind(R_AC, 2)} Ω/km: \(\gamma = {ind(GAMMA.real * 1000, 4)}\times10^{{-3}} + j{ind(GAMMA.imag * 1000, 4)}\times10^{{-3}}\) per km, \(Z_c = {ind(ZC_CPLX.real, 1)} {'-' if ZC_CPLX.imag < 0 else '+'} j{ind(abs(ZC_CPLX.imag), 1)}\) Ω.",
                   "Pada saluran panjang tegangan dan arus adalah gelombang: sebagian merambat ke ujung terima, sebagian dipantulkan, dan jumlahnya membentuk pola berdiri sepanjang saluran. β menyatakan pergeseran fasa per km (± 6° per 100 km pada 50 Hz), α redaman per km, dan Z_c perbandingan tegangan–arus gelombang berjalan (sama dengan impedansi surja Modul 6 untuk kasus tanpa rugi). Panjang gelombang ± 6000 km berarti saluran 300 km sudah 1/20 gelombang, cukup untuk membuat model terkumpul menyimpang.",
                   [("\\gamma", "Konstanta propagasi (per km)"), ("\\alpha, \\beta", "Konstanta redaman (Np/km) dan fasa (rad/km)"), ("Z_c", "Impedansi karakteristik (Ω)"), ("\\lambda, v", "Panjang gelombang (km) dan kecepatan rambat (km/s)")])
    isi += formula(8, "ABCD Saluran Panjang dan π-Ekuivalen", r"A = D = \cosh\gamma\ell, \quad B = Z_c\sinh\gamma\ell, \quad C = \dfrac{\sinh\gamma\ell}{Z_c}; \qquad Z' = Z_c\sinh\gamma\ell, \quad \dfrac{Y'}{2} = \dfrac{\tanh(\gamma\ell/2)}{Z_c}",
                   rf"Tanpa rugi, cosh(jβℓ) = cos βℓ dan sinh(jβℓ) = j sin βℓ. Saluran {ind(L_LONG, 0)} km: \(\beta\ell = {ind(BL, 4)}\) rad, \(A = \cos\beta\ell = {ind(math.cos(BL), 4)}\), \(Z' = jZ_c\sin\beta\ell = j{ind(ZP, 1)}\) Ω (nominal \(x\ell = {ind(X_KM * L_LONG, 1)}\) Ω), \(Y'/2 = j\tan(\beta\ell/2)/Z_c = j{ind(YP2 * 1e6, 1)}\) µS (nominal \(b\ell/2 = {ind(B_KM * L_LONG / 2 * 1e6, 1)}\) µS). π-ekuivalen adalah nominal-π dengan Z dan Y yang 'dikoreksi' sehingga tepat pada frekuensi dasar.",
                   "Fungsi hiperbolik dengan argumen kompleks dihitung mudah oleh Python (cmath). Dalam praktik, program memakai π-ekuivalen ini untuk setiap saluran, panjang atau pendek, sehingga satu rumus melayani semua; koreksinya kecil (< 1 %) untuk saluran pendek dan penting untuk saluran 500 kV ratusan kilometer.",
                   [("Z', Y'", "Impedansi seri dan admitansi shunt π-ekuivalen"), ("\\ell", "Panjang saluran (km)")])
    isi += cards([
        ("🌊", "Gelombang Berdiri", "V(x) = V_R cos βx + jZ_c I_R sin βx: kombinasi gelombang maju dan pantul; bentuknya tergantung beban (Bagian 06).", None),
        ("📉", "Redaman α", "R kecil memberi α ≈ r/(2Z_c) ≈ 1,5×10⁻⁴ Np/km: 400 km meredam ± 6 %; pada kabel dan saluran distribusi α jauh lebih besar.", r"\(\alpha \approx \dfrac{r}{2Z_c}\)"),
        ("🔁", "Seperempat Gelombang", "ℓ = λ/4 ≈ 1500 km: cos βℓ = 0, A = 0, tegangan terima tidak lagi dikendalikan V_S; batas praktis saluran AC tanpa kompensasi di bawah ± 600 km.", None),
        ("🧮", "Deret", "cosh γℓ = 1 + (γℓ)²/2 + (γℓ)⁴/24 + …: dua suku pertama = nominal-π; suku ketiga menjelaskan selisih ± 1 % pada 300 km.", None),
        ("📻", "Frekuensi Lain", "γ dan Z_c bergantung frekuensi; pada harmonik ke-5 βℓ lima kali lipat dan saluran 300 km sudah 'panjang'. Studi harmonik memakai model tersebar.", None),
        ("⚡", "Surja", "Untuk surja petir (µs) frekuensi efektif ratusan kHz: setiap saluran 'panjang'; itulah wilayah gelombang berjalan Modul 6 dengan Z_c yang sama.", None),
    ])
    isi += tabel(["Panjang (parameter contoh)", "βℓ (rad)", "A tersebar", "A nominal-π", "Selisih", "Ferranti (V_R/V_S − 1)"],
                 [[f"{l:.0f} km", ind(BETA * l, 4), ind(math.cos(BETA * l), 5), ind(1 - X_KM * l * B_KM * l / 2, 5), ind((1 - X_KM * l * B_KM * l / 2 - math.cos(BETA * l)) / math.cos(BETA * l) * 100, 2) + " %", ind((1 / math.cos(BETA * l) - 1) * 100, 2) + " %"] for l in [100, 200, 300, 400, 600]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> selisih nominal-π terhadap model tersebar tumbuh dengan pangkat empat panjang: 0,01 % pada 100 km, 1,4 % pada 600 km. Kolom terakhir adalah efek Ferranti murni dari kapasitansi: 400 km sudah menaikkan tegangan tanpa beban 9 %, alasan reaktor shunt pada SUTET (Modul 6). Soal C9, C13, C14, dan C15 memakai Persamaan (7)–(8).")
    m += bagian(5, "m-panjang", "Saluran Panjang:<br>γ, Z_c, dan Fungsi Hiperbolik",
                "Di atas ± 250 km, kapasitansi dan induktansi yang tersebar sepanjang saluran tidak lagi boleh dikumpulkan di ujung: tegangan dan arus berperilaku sebagai gelombang. Persamaan (7) memperkenalkan konstanta propagasi dan impedansi karakteristik, dan Persamaan (8) memberi konstanta ABCD eksak beserta π-ekuivalen yang menggantikan nominal-π; Gambar 5 memperlihatkan seberapa jauh nominal-π menyimpang.",
                isi, "SALURAN PANJANG")

    # 06 — SIL & profil
    isi = figure(6, "Profil tegangan saluran panjang untuk beban di bawah, pada, dan di atas SIL", f"Saluran tanpa rugi {ind(L_LONG, 0)} km dengan V_S = 1 pu: tanpa beban tegangan ujung terima naik {ind(FERRANTI, 1)} %, pada beban = SIL profil rata, dan pada 1,5 SIL tegangan ujung terima jatuh; beban terhadap SIL-lah yang menentukan arah, bukan besar mutlaknya.", gambar6())
    isi += formula(9, "Profil Tegangan Saluran Tanpa Rugi dan SIL", r"\mathbf{V}(x) = \mathbf{V}_R\cos\beta x + jZ_c\,\mathbf{I}_R\sin\beta x, \qquad SIL = \dfrac{V_L^2}{Z_c}, \qquad \text{beban} = SIL \Rightarrow |V(x)| = |V_R|\ \forall x",
                   rf"Saluran contoh: \(SIL = 150^2/{ind(ZC, 0)} = {ind(SIL150, 1)}\) MW (500 kV dengan berkas 4, Z_c ≈ 240 Ω: ± 1040 MW). Pada beban resistif tepat SIL, \(Z_c I_R = V_R\) sehingga \(|V(x)| = |V_R|\sqrt{{\cos^2\beta x + \sin^2\beta x}} = |V_R|\): tidak ada jatuh maupun kenaikan tegangan sepanjang saluran, dan Q yang dibangkitkan kapasitansi tepat sama dengan yang diserap induktansi di tiap titik.",
                   "SIL adalah 'beban alami' saluran: di bawahnya saluran menjadi sumber Q dan tegangan naik (perlu reaktor), di atasnya saluran menyerap Q dan tegangan turun (perlu kapasitor atau kompensasi seri, Modul 6). Saluran pendek dapat dibebani 2–3 SIL (batas termal), saluran 500 km hanya ± 1 SIL (batas tegangan dan kestabilan): kurva St. Clair merangkumnya.",
                   [("x", "Jarak dari ujung terima (km)"), ("Z_c", "Impedansi karakteristik (Ω)"), ("SIL", "Surge impedance loading (W)")])
    isi += cards([
        ("📈", "Di Bawah SIL", "Malam hari, saluran SUTET hampir kosong: Q kapasitansi berlebih, tegangan ujung naik 5–15 %; reaktor shunt disambung.", None),
        ("📉", "Di Atas SIL", "Siang puncak: saluran menyerap Q ∝ I², tegangan ujung turun; kapasitor shunt di gardu beban atau kompensasi seri.", None),
        ("⚖️", "Tepat SIL", "Profil rata dan Q netto nol; operator mengejar keadaan ini dengan menyalakan/mematikan reaktor dan kapasitor mengikuti beban.", None),
        ("🔗", "Berkas & SIL", "Berkas menurunkan Z_c: SIL 500 kV naik dari ± 850 MW (1 konduktor) ke ± 1050 MW (4 konduktor); sekaligus arus pengisian naik.", None),
        ("📏", "Kurva St. Clair", "Kemampuan praktis: 3 SIL (50 km) → 2 SIL (150 km) → 1,3 SIL (300 km) → 1 SIL (500 km) → 0,7 SIL (800 km); batas berturut-turut termal, tegangan, kestabilan.", None),
        ("🌐", "HVDC", "Pada DC tidak ada β maupun Q: tegangan turun linear oleh R saja, dan tidak ada SIL; alasan lain HVDC untuk > 600 km.", None),
    ])
    isi += tabel(["Beban (saluran contoh, 400 km, V_S = 1 pu)", "I_R (pu terhadap V_R/Z_c)", "V_R/V_S", "Keterangan"],
                 [[f"{r:.2f} SIL", ind(r, 2), ind(1 / math.hypot(math.cos(BL), r * math.sin(BL)), 4), "tegangan naik ke ujung (Ferranti)" if r < 0.98 else ("profil rata" if r < 1.02 else "tegangan turun ke ujung")] for r in [0.0, 0.5, 1.0, 1.5, 2.0]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> tanpa beban tegangan ujung terima 9 % lebih tinggi daripada kirim, pada 2 SIL 15 % lebih rendah; keduanya melampaui batas ±5 % sehingga saluran 400 km hampir selalu memerlukan kompensasi di kedua keadaan. Soal C10 memakai Persamaan (9).")
    m += bagian(6, "m-sil", "Impedansi Karakteristik, SIL,<br>dan Profil Tegangan",
                "Dua bilangan yang lahir dari model saluran panjang, Z_c dan SIL, merangkum perilaku sebuah saluran dalam satu kalimat: bebani tepat pada SIL dan tegangannya rata dari ujung ke ujung. Persamaan (9) menurunkan profil tegangan sepanjang saluran dan menjelaskan mengapa kompensasi reaktif Modul 6 diperlukan di kedua sisi SIL; Gambar 6 memperlihatkan profilnya.",
                isi, "SIL DAN PROFIL TEGANGAN")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Geometri Konduktor → \(L\), \(C\), \(x\), \(b\), dan \(Z_c\)", "cvGeometri",
                     [("sl_gm_d", "v_gm_d", "Jarak fasa berdekatan D (m)", 2, 14, 0.5, 6, "6.0"), ("sl_gm_r", "v_gm_r", "Jari-jari sub-konduktor r (cm)", 0.5, 2.5, 0.01, 1.09, "1.09"), ("sl_gm_n", "v_gm_n", "Sub-konduktor per fasa", 1, 4, 1, 1, "1"), ("sl_gm_s", "v_gm_s", "Jarak sub-konduktor s (cm)", 20, 60, 5, 40, "40")],
                     "btnGeometri", "toggleGeometri", "geometriInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Kiri: tiga fasa mendatar dengan GMD dan GMR yang dihitung; kanan: batang L, C, x, dan b per km, dengan Z_c dan SIL di readout.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Menggandakan D hanya menambah L sekitar 10 %</strong> (logaritma). (2) Menambah sub-konduktor menurunkan L dan menaikkan C sekaligus: Z_c turun, SIL naik. (3) Jari-jari konduktor berpengaruh lebih kecil daripada berkas. Soal C1–C5 dan C11.")
    isi += anim_panel(2, "amber", r"Konstanta \(A\) dan \(B\): Nominal-π vs Parameter Tersebar terhadap Panjang", "cvABCD",
                      [("sl_ab_x", "v_ab_x", "x (Ω/km)", 0.2, 0.6, 0.01, 0.42, "0.42"), ("sl_ab_b", "v_ab_b", "b (µS/km)", 1, 6, 0.1, 2.7, "2.70"), ("sl_ab_l", "v_ab_l", "Rentang panjang (km)", 200, 1500, 50, 600, "600"), ("sl_ab_ln", "v_ab_ln", "Panjang saluran ditinjau (km)", 20, 1500, 10, 200, "200")],
                      "btnABCD", "toggleABCD", "abcdInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Atas: A = cos(βℓ) (hijau) vs 1 − xbℓ²/2 (kuning putus-putus); bawah: |B| = Z_c sin(βℓ) (biru) vs xℓ (ungu). Garis merah muda adalah panjang yang ditinjau; readout memberi selisih persen keduanya.<br>Amati: (1) <strong style=\"color:var(--amber)\">Di bawah 250 km kedua kurva berimpit</strong>; di atas 500 km nominal-π terlalu 'pesimis' pada A dan terlalu besar pada B. (2) Menaikkan b (kabel, berkas) membuat penyimpangan muncul pada panjang lebih pendek. (3) Pada ℓ = λ/4 ≈ 1500 km, A → 0. Soal C6, C8, C13, dan C15.")
    isi += anim_panel(3, "green", r"Profil Tegangan Saluran Panjang terhadap Beban (kelipatan SIL)", "cvProfilPanjang",
                      [("sl_pp_l", "v_pp_l", "Panjang saluran (km)", 100, 800, 10, 400, "400"), ("sl_pp_zc", "v_pp_zc", "Z_c (Ω)", 200, 400, 5, 280, "280"), ("sl_pp_p", "v_pp_p", "Beban resistif (× SIL)", 0, 2.5, 0.05, 1.0, "1.00")],
                      "btnProfilPanjang", "toggleProfilPanjang", "profilPanjangInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Kurva adalah |V(x)| sepanjang saluran 500 kV tanpa rugi dengan V_S dijaga 1 pu; garis merah putus-putus batas ±5 %; titik berjalan menyusuri saluran.<br>Amati: (1) <strong style=\"color:var(--green)\">Atur beban tepat 1,00 SIL</strong>: profil rata berapa pun panjangnya. (2) Beban 0 pada 600–800 km: Ferranti melampaui 20 %. (3) Beban 2 SIL: ujung terima jatuh di bawah 0,9 pu, perlu kapasitor. Soal C10 dan C14.")
    isi += anim_panel(4, "pink", r"\(Z_c\), SIL, dan Ferranti untuk Berkas 1–4 Sub-konduktor", "cvSIL",
                      [("sl_sl_d", "v_sl_d", "Jarak fasa berdekatan D (m)", 4, 16, 0.5, 10, "10.0"), ("sl_sl_r", "v_sl_r", "Jari-jari sub-konduktor r (cm)", 0.8, 2.0, 0.01, 1.43, "1.43"), ("sl_sl_v", "v_sl_v", "Tegangan saluran (kV)", 150, 765, 5, 500, "500"), ("sl_sl_l", "v_sl_l", "Panjang untuk Ferranti (km)", 100, 800, 10, 350, "350")],
                      "btnSIL", "toggleSIL", "silInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Empat batang adalah SIL untuk 1–4 sub-konduktor per fasa (s = 45 cm) pada geometri yang sama; di tiap batang tertulis Z_c, x per km, dan kenaikan Ferranti untuk panjang yang dipilih.<br>Amati: (1) <strong style=\"color:var(--pink)\">Berkas 4 menaikkan SIL ± 30 %</strong> dibanding konduktor tunggal. (2) SIL ∝ V²: 765 kV memberi 2,3 kali SIL 500 kV pada Z_c sama. (3) Ferranti hampir tidak bergantung berkas karena β ≈ ω√(LC) hampir tetap (kecepatan cahaya). Soal C9 dan C10.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur D = 6 m, r = 1,09 cm, 1 sub-konduktor dan cocokkan L = {ind(L_KM, 4)} mH/km, C = {ind(C_KM * 1000, 3)} nF/km, Z_c ≈ {ind(ZC, 0)} Ω dengan Gambar 1; pada Animasi 2 atur x = {ind(X_KM, 2)}, b = {ind(B_KM * 1e6, 2)}, ℓ = {ind(L_LONG, 0)} km dan cocokkan A = {ind(math.cos(BL), 4)} dengan tabel Bagian 05.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Pemodelan Saluran",
                "Geser jarak fasa, jari-jari, jumlah sub-konduktor, panjang saluran, dan beban, lalu amati parameter per km, konstanta ABCD kedua model, profil tegangan sepanjang saluran, dan SIL. Empat animasi ini memvisualkan Persamaan (1)–(9).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code>, <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>, dan <code>cmath</code> bawaan untuk fungsi hiperbolik kompleks. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (mH/km, nF/km, µS, Ω, kV, MW) dan jumlah desimal yang diminta.")
    isi += kode("Cell 1 — Parameter Saluran dari Geometri: GMD, GMR, L, C, Berkas", f'''import numpy as np

def parameter(D_m, r_cm, n=1, s_cm=40.0, f=50.0):
    """Susunan mendatar berjarak D; kembalikan L (mH/km), C (nF/km), x (ohm/km), b (uS/km), Zc (ohm)."""
    GMD = D_m*np.cbrt(2)                                  # Persamaan 1
    GMR, r = 0.7788*r_cm/100, r_cm/100
    s = s_cm/100
    GMRb = GMR if n == 1 else (n*GMR*s**(n-1))**(1/n)     # Persamaan 4
    rb   = r   if n == 1 else (n*r*s**(n-1))**(1/n)
    L = 0.2*np.log(GMD/GMRb)                              # mH/km
    C = 0.05563/np.log(GMD/rb)*1000                       # nF/km (Persamaan 3)
    x, b = 2*np.pi*f*L/1000, 2*np.pi*f*C*1e-9*1e6         # ohm/km, uS/km
    return dict(GMD=GMD, GMRb=GMRb*100, rb=rb*100, L=L, C=C, x=x, b=b, Zc=np.sqrt(x/(b*1e-6)))

for n in [1, 2, 4]:
    p = parameter({ind(D_M, 0)}.0, {ind(R_CM, 2).replace(",", ".")}, n)
    print(f"berkas {{n}}: GMD = {{p['GMD']:.3f}} m, GMR_b = {{p['GMRb']:.3f}} cm, L = {{p['L']:.4f}} mH/km, C = {{p['C']:.3f}} nF/km, x = {{p['x']:.4f}} ohm/km, b = {{p['b']:.3f}} uS/km, Zc = {{p['Zc']:.1f}} ohm, SIL150 = {{150**2/p['Zc']:.1f}} MW")''')
    isi += kode("Cell 2 — Nominal-π dan Konstanta ABCD: V_S, I_S, Regulasi, Efisiensi", f'''import numpy as np, cmath

r_ac, x, b, L = {ind(R_AC, 2).replace(",", ".")}, {ind(X_KM, 4).replace(",", ".")}, {ind(B_KM * 1e6, 3).replace(",", ".")}e-6, {ind(L_LINE, 0)}.0
Z, Y = (r_ac + 1j*x)*L, 1j*b*L
A = 1 + Y*Z/2;  B = Z;  C = Y*(1 + Y*Z/4);  D = A          # Persamaan 5–6
print(f"A = {{A:.5f}}, B = {{B:.2f}} ohm, C = {{C*1e6:.3f}} uS; AD - BC = {{A*D - B*C:.6f}}")

VLL, P, pf = 132e3, {ind(P_LOAD, 0)}e6, {ind(PF_LOAD, 1).replace(",", ".")}
V_R = VLL/np.sqrt(3) + 0j
I_R = P/(3*abs(V_R)*pf)*cmath.exp(-1j*np.arccos(pf))
V_S = A*V_R + B*I_R;  I_S = C*V_R + D*I_R
P_S = 3*(V_S*np.conj(I_S)).real
print(f"V_S = {{abs(V_S)*np.sqrt(3)/1e3:.3f}} kV LL (delta {{np.degrees(cmath.phase(V_S)):.2f}} deg), I_S = {{abs(I_S):.1f}} A")
print(f"regulasi = {{(abs(V_S)/abs(A) - abs(V_R))/abs(V_R)*100:.3f}} %, efisiensi = {{P/P_S*100:.3f}} %")
# kaskade: trafo ideal 150/20 kV (a = 7.5) dengan reaktansi 20 ohm di ujung terima
M_line = np.array([[A, B], [C, D]]); a = 7.5
M_trafo = np.array([[1, 20j], [0, 1]]) @ np.array([[a, 0], [0, 1/a]])
M = M_line @ M_trafo
print(f"ABCD gabungan: A = {{M[0,0]:.4f}}, B = {{M[0,1]:.2f}}, C = {{M[1,0]*1e6:.2f}} uS, D = {{M[1,1]:.4f}}; AD - BC = {{np.linalg.det(M):.5f}}")''')
    isi += kode("Cell 3 — Saluran Panjang: γ, Z_c, cosh/sinh, π-Ekuivalen, dan Perbandingan dengan Nominal-π", f'''import numpy as np, cmath

r_ac, x, b = {ind(R_AC, 2).replace(",", ".")}, {ind(X_KM, 4).replace(",", ".")}, {ind(B_KM * 1e6, 3).replace(",", ".")}e-6
z, y = r_ac + 1j*x, 1j*b
gamma, Zc = cmath.sqrt(z*y), cmath.sqrt(z/y)                # Persamaan 7
print(f"gamma = {{gamma.real*1e3:.4f}}e-3 + j{{gamma.imag*1e3:.4f}}e-3 /km, Zc = {{Zc:.1f}} ohm, lambda = {{2*np.pi/gamma.imag:.0f}} km")
for L in [100, 200, 400, 600]:
    gl = gamma*L
    A, B_, C = cmath.cosh(gl), Zc*cmath.sinh(gl), cmath.sinh(gl)/Zc   # Persamaan 8
    Zpi, Ypi = z*L, y*L
    A_pi = 1 + Ypi*Zpi/2
    Zeq, Yeq2 = Zc*cmath.sinh(gl), cmath.tanh(gl/2)/Zc
    print(f"{{L:4d}} km: A = {{abs(A):.5f}} (nominal {{abs(A_pi):.5f}}), |B| = {{abs(B_):.2f}} (nominal {{abs(Zpi):.2f}}) ohm, Z' = {{Zeq:.2f}}, Y'/2 = {{Yeq2*1e6:.2f}} uS, Ferranti = {{(1/abs(A) - 1)*100:.2f}} %")''')
    isi += kode("Cell 4 — Profil Tegangan Saluran Tanpa Rugi terhadap Beban (× SIL)", f'''import numpy as np
import matplotlib.pyplot as plt

x, b, L, VLL = {ind(X_KM, 4).replace(",", ".")}, {ind(B_KM * 1e6, 3).replace(",", ".")}e-6, {ind(L_LONG, 0)}.0, 500.0
beta, Zc = np.sqrt(x*b), np.sqrt(x/b)
SIL = VLL**2/Zc
print(f"beta = {{beta*1e3:.4f}}e-3 rad/km, Zc = {{Zc:.1f}} ohm, SIL = {{SIL:.1f}} MW, beta*L = {{beta*L:.4f}} rad")
xk = np.linspace(0, L, 200)                                 # jarak dari ujung terima
plt.figure(figsize=(8, 4))
for rasio in [0, 0.5, 1.0, 1.5, 2.0]:
    I_R = rasio/Zc                                          # pu terhadap V_R = 1
    V = np.abs(np.cos(beta*xk) + 1j*Zc*I_R*np.sin(beta*xk))   # Persamaan 9
    V = V/V[-1]                                             # normalisasi V_S = 1 pu
    print(f"beban {{rasio:.1f}} SIL: V_R/V_S = {{V[0]:.4f}}")
    plt.plot(L - xk, V, label=f'{{rasio:.1f}} SIL')
plt.axhline(1.05, ls=':', color='r'); plt.axhline(0.95, ls=':', color='r')
plt.xlabel('jarak dari ujung kirim (km)'); plt.ylabel('|V| (pu)'); plt.legend(); plt.grid(True); plt.title('Profil tegangan saluran tanpa rugi'); plt.show()''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 01–06: L = {ind(L_KM, 4)} mH/km, C = {ind(C_KM * 1000, 3)} nF/km, V_S nominal-π {ind(VS_LL, 2)} kV, A(400 km) = {ind(math.cos(BL), 4)}, dan SIL 150 kV {ind(SIL150, 1)} MW. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: parameter dari geometri dan berkas, nominal-π dengan kaskade trafo, saluran panjang dengan fungsi hiperbolik kompleks, dan profil tegangan terhadap beban. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 4 (parameter saluran: induktansi, kapasitansi, GMD/GMR, berkas) dan Bab 5 (model pendek, menengah, panjang, ABCD, π-ekuivalen, SIL): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "J. J. Grainger &amp; W. D. Stevenson, Jr.", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 4–6: penurunan klasik induktansi dan kapasitansi saluran serta persamaan saluran panjang.")
    refs += pm_ref(3, "violet", "168,85,247", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 4–5 dengan fungsi MATLAB (gmd, lineperf) yang mudah dialihkan ke Python.")
    refs += pm_ref(4, "green", "0,224,158", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik Jilid 2: Saluran Transmisi", ", Cetakan 7. Pradnya Paramita, 2004.", "Konstanta saluran, rangkaian ekuivalen, dan tabel konduktor dalam praktik Indonesia/Jepang.")
    refs += pm_ref(5, "pink", "236,72,153", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab parameter dan model saluran transmisi; pustaka utama RPS.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk parameter saluran dari geometri, konduktor berkas, model nominal-π dan ABCD, saluran panjang, dan SIL. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> tabel karakteristik konduktor ACSR (GMR, resistansi, reaktansi pada jarak 1 ft/1 m) dari pabrikan dan IEC 61089; pustaka Python <code>pandapower</code> menyediakan tipe saluran standar beserta parameter per km untuk memeriksa hasil hitungan tangan. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">L = 0,2 ln(GMD/GMR)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">C = 0,05563/ln(GMD/r)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">A = 1 + YZ/2</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">A = cos βℓ</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">SIL = V²/Z_c</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Pemodelan</em><br>Saluran Transmisi</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar induktansi dan kapasitansi dari GMD/GMR, konduktor berkas, konstanta ABCD nominal-π, tegangan kirim dan regulasi, impedansi karakteristik, konstanta propagasi, Ferranti, dan π-ekuivalen. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Dalam rumus induktansi saluran, <strong>GMR</strong> (jari-jari rata-rata geometris, ≈ 0,7788 r untuk konduktor pejal) dipakai karena...",
     ["Ia sama dengan jari-jari luar konduktor", "Ia memasukkan efek kulit", "Ia memasukkan fluks magnet di dalam konduktor ke dalam perhitungan induktansi", "Ia memperhitungkan jarak ke tanah"],
     "Makna GMR"),
    ("Tujuan <strong>transposisi</strong> saluran tiga fasa adalah...",
     ["Menyamakan induktansi dan kapasitansi rata-rata ketiga fasa sepanjang saluran", "Mengurangi andongan konduktor", "Menaikkan tegangan kritis korona", "Menurunkan resistansi konduktor"],
     "Transposisi"),
    ("Rumus kapasitansi fasa–netral \\(C = 2\\pi\\varepsilon_0/\\ln(GMD/r)\\) memakai...",
     ["GMR konduktor, sama seperti induktansi", "Jarak konduktor ke tanah", "Diameter berkas", "Jari-jari luar konduktor r, karena muatan berada di permukaan"],
     "Jari-jari pada kapasitansi"),
    ("<strong>Konduktor berkas</strong> (bundle) pada saluran tegangan ekstra tinggi menyebabkan...",
     ["Induktansi naik dan kapasitansi turun", "Induktansi turun dan kapasitansi naik, sehingga Z_c turun dan SIL naik", "Keduanya tidak berubah, hanya ampacity naik", "Resistansi naik karena jumlah konduktor bertambah"],
     "Pengaruh berkas"),
    ("Pada model <strong>nominal-π</strong>, admitansi shunt saluran ditempatkan...",
     ["Seluruhnya di ujung kirim", "Seluruhnya di tengah saluran", "Setengah di ujung kirim dan setengah di ujung terima", "Tersebar merata sepanjang saluran"],
     "Nominal-π"),
    ("Untuk jaringan dua-port pasif dan resiprokal seperti saluran transmisi berlaku...",
     ["\\(AD - BC = 1\\)", "\\(A + D = 1\\)", "\\(AB = CD\\)", "\\(A = C\\)"],
     "Identitas ABCD"),
    ("<strong>Impedansi karakteristik</strong> saluran udara umumnya bernilai...",
     ["10–20 Ω", "1–5 kΩ", "5–10 Ω seperti kabel", "250–400 Ω, dan SIL = V²/Z_c"],
     "Nilai Z_c"),
    ("Konstanta \\(A\\) saluran panjang menurut model parameter tersebar adalah...",
     ["\\(A = 1 + YZ\\)", "\\(A = \\cosh\\gamma\\ell\\), yang magnitudonya kurang dari satu sehingga timbul efek Ferranti", "\\(A = Z_c\\sinh\\gamma\\ell\\)", "\\(A = e^{\\gamma\\ell}\\)"],
     "A saluran panjang"),
    ("Konstanta propagasi \\(\\gamma = \\sqrt{zy} = \\alpha + j\\beta\\); untuk saluran udara 50 Hz, β kira-kira...",
     ["1 rad/km", "0,1 rad/km", "1,06×10⁻³ rad/km, setara panjang gelombang ± 6000 km", "10⁻⁶ rad/km"],
     "Nilai β"),
    ("Memperbesar jarak antar-fasa (GMD) pada saluran akan...",
     ["Menaikkan induktansi dan menurunkan kapasitansi", "Menurunkan induktansi dan menaikkan kapasitansi", "Menaikkan keduanya", "Menurunkan keduanya"],
     "Pengaruh GMD"),
]

COMP_EZ_LABELS = ["Induktansi dari GMD/GMR", "Reaktansi induktif dari L", "Kapasitansi dari GMD/r (nF/km)", "Suseptansi shunt total (µS)", "Induktansi berkas dua",
                  "|A| nominal-π", "Tegangan kirim nominal-π", "|C| nominal-π (µS)", "Impedansi karakteristik √(x/b)", "SIL = V²/Z_c"]
COMP_HARD_LABELS = ["X_L dari susunan mendatar (GMD, GMR)", "Regulasi tegangan nominal-π (Z kompleks)", "A = cos(βℓ) parameter tersebar",
                    "V_R tanpa beban saluran 500 kV (Ferranti)", "|Z′| = Z_c sin(βℓ) π-ekuivalen"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
RF_CM, SF_CM, DF_M, NF = 1.43, 45.0, 12.0, 4
GMDF = DF_M * 2 ** (1 / 3)
GMRF = (NF * 0.7788 * RF_CM / 100 * (SF_CM / 100) ** (NF - 1)) ** (1 / NF)
RBF = (NF * RF_CM / 100 * (SF_CM / 100) ** (NF - 1)) ** (1 / NF)
LF_ = 0.2 * math.log(GMDF / GMRF)
CF_ = K_C / math.log(GMDF / RBF)
XF_, BF_ = W_ * LF_ / 1000, W_ * CF_ * 1e-6
ZCF = math.sqrt(XF_ / BF_)
BETAF = math.sqrt(XF_ * BF_)
SILF = 500 ** 2 / ZCF
LEN_F = 350.0
BLF = BETAF * LEN_F
A_LONG_F = math.cos(BLF)
A_PI_F = 1 - XF_ * LEN_F * BF_ * LEN_F / 2
VR_NL_F = 500 / A_LONG_F
P_F = 1500.0
RASIO_F = P_F / SILF
VR_LOAD_F = 1 / math.hypot(math.cos(BLF), RASIO_F * math.sin(BLF)) * 500

FQ_JUDUL = [
    "Hitung L, C, Z_c, dan SIL jalur 500 kV berkas 4 dari geometri menaranya: berapa beban 'alami' saluran ini?",
    "Bandingkan ABCD nominal-π dan parameter tersebar untuk 350 km, lalu hitung tegangan ujung terima tanpa beban: perlukah reaktor?",
    "Pada beban puncak 1500 MW (di atas SIL), berapa tegangan ujung terima dan kompensasi apa yang diperlukan?",
]
FQ_RINGKAS = [
    f"SUTET 500 kV berkas {NF} × ACSR (r = {ind(RF_CM, 2)} cm, s = {ind(SF_CM, 0)} cm), susunan mendatar D = {ind(DF_M, 0)} m. Hitung GMD, GMR_b, r_b (Persamaan 1 dan 4), L dan C (Persamaan 3), x dan b, lalu Z_c = √(x/b) dan SIL = 500²/Z_c (Persamaan 7 dan 9). Bandingkan dengan konduktor tunggal.",
    f"Saluran {ind(LEN_F, 0)} km: β = √(xb), βℓ; A tersebar = cos βℓ vs A nominal-π = 1 − xbℓ²/2 (Persamaan 5, 8); V_R tanpa beban = 500/|A| (Ferranti); MVAR yang harus diserap reaktor agar V_R ≤ 525 kV (Persamaan 3 dan Modul 6).",
    f"Beban {ind(P_F, 0)} MW ≈ {ind(RASIO_F, 2)} SIL (resistif) dengan V_S = 500 kV: profil V(x) dan V_R (Persamaan 9); bandingkan batas −5 %; kompensasi seri (Modul 6) vs kapasitor shunt vs saluran kedua; pengaruh berkas pada SIL.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"PLN merancang jalur <b>SUTET 500 kV</b> sepanjang {ind(LEN_F, 0)} km dengan konduktor berkas <b>{NF} × ACSR (r = {ind(RF_CM, 2)} cm, jarak sub-konduktor {ind(SF_CM, 0)} cm)</b> pada susunan mendatar berjarak <b>{ind(DF_M, 0)} m</b> antar-fasa. Dari geometri ini hitung GMD, GMR berkas, jari-jari efektif berkas (Persamaan 1 dan 4), induktansi dan kapasitansi per km (Persamaan 3), x dan b, lalu impedansi karakteristik dan SIL (Persamaan 7 dan 9). Ulangi untuk satu konduktor per fasa dan jelaskan mengapa SUTET selalu berkas (Modul 8 menambah alasan korona).",
            ["GMD = D·∛2", "GMR_b = ⁴√(4·GMR·s³)", "SIL = V²/Z_c"],
            "Impedansi karakteristik dan SIL jalur 500 kV berkas 4 ini sekitar...",
            [f"Z_c ≈ {ind(ZC, 0)} Ω, SIL ≈ {ind(250000 / ZC, 0)} MW (sama dengan konduktor tunggal)", f"Z_c ≈ {ind(ZCF * 2, 0)} Ω, SIL ≈ {ind(250000 / (ZCF * 2), 0)} MW", f"Z_c ≈ {ind(ZCF, 0)} Ω, SIL ≈ {ind(SILF, 0)} MW; berkas menurunkan Z_c ± 25 % dibanding konduktor tunggal", f"Z_c ≈ {ind(ZCF, 0)} Ω, tetapi SIL tidak dapat dihitung tanpa panjang saluran"],
            f"✅ Tepat! GMD = {ind(DF_M, 0)}·∛2 = {ind(GMDF, 2)} m; GMR_b = ⁴√(4×{ind(0.7788 * RF_CM, 3)}×{ind(SF_CM, 0)}³) = {ind(GMRF * 100, 2)} cm; r_b = {ind(RBF * 100, 2)} cm; L = 0,2 ln({ind(GMDF * 100, 0)}/{ind(GMRF * 100, 2)}) = {ind(LF_, 4)} mH/km, C = {ind(CF_ * 1000, 2)} nF/km; x = {ind(XF_, 4)} Ω/km, b = {ind(BF_ * 1e6, 3)} µS/km → \\(Z_c = {ind(ZCF, 1)}\\) Ω, \\(SIL = 500^2/{ind(ZCF, 1)} = {ind(SILF, 0)}\\) MW. Konduktor tunggal: Z_c ≈ {ind(math.sqrt(W_ * 0.2 * math.log(GMDF / (0.7788 * RF_CM / 100)) / 1000 / (W_ * K_C / math.log(GMDF / (RF_CM / 100)) * 1e-6)), 0)} Ω, SIL ≈ {ind(250000 / math.sqrt(W_ * 0.2 * math.log(GMDF / (0.7788 * RF_CM / 100)) / 1000 / (W_ * K_C / math.log(GMDF / (RF_CM / 100)) * 1e-6)), 0)} MW.",
            "❌ Berkas mengubah GMR dan jari-jari efektif dengan akar-n dari (n·r·sⁿ⁻¹), bukan dengan mengalikan n; hasilnya Z_c turun dan SIL naik. SIL hanya bergantung tegangan dan Z_c, bukan panjang.",
            "Petunjuk: (1) Hitung GMD, GMR_b, r_b. (2) Hitung L, C, x, b, Z_c, SIL. (3) Ulangi untuk konduktor tunggal dan bandingkan.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Dengan x dan b dari pertanyaan 1, hitung β = √(xb), βℓ untuk {ind(LEN_F, 0)} km, konstanta A menurut parameter tersebar (cos βℓ, Persamaan 8) dan menurut nominal-π (1 − xbℓ²/2, Persamaan 5); seberapa besar selisihnya? Lalu hitung tegangan ujung terima saat saluran diberi tegangan 500 kV dari satu ujung dan ujung lain terbuka (V_R = V_S/|A|). Bila batas operasi 525 kV (+5 %), berapa MVAR reaktor shunt kira-kira diperlukan untuk menyerap arus pengisian (Q_C ≈ V²·b·ℓ) sehingga tegangan turun ke batas? Bahas cara energisasi saluran dalam praktik.",
            ["β = √(xb)", "A = cos βℓ", "Q_C = V²·b·ℓ"],
            f"Tegangan ujung terima tanpa beban dan konstanta A untuk {ind(LEN_F, 0)} km adalah sekitar...",
            [f"A ≈ {ind(A_LONG_F, 3)} (nominal-π {ind(A_PI_F, 3)}); V_R ≈ {ind(VR_NL_F, 0)} kV (+{ind((VR_NL_F / 500 - 1) * 100, 1)} %), melampaui 525 kV → reaktor shunt", f"A = 1; V_R = 500 kV karena tanpa beban tidak ada jatuh tegangan", f"A ≈ {ind(A_LONG_F, 3)}; V_R ≈ {ind(500 * A_LONG_F, 0)} kV (lebih rendah dari kirim)", f"A ≈ {ind(A_LONG_F, 3)}; V_R ≈ {ind(VR_NL_F, 0)} kV, tetapi nominal-π memberi hasil yang sangat berbeda ({ind(1 / 0.85 * 500, 0)} kV)"],
            f"✅ Tepat! β = √({ind(XF_, 4)}×{ind(BF_ * 1e6, 3)}×10⁻⁶) = {ind(BETAF * 1000, 4)}×10⁻³ rad/km; βℓ = {ind(BLF, 4)} rad; A = cos βℓ = {ind(A_LONG_F, 4)} vs nominal-π {ind(A_PI_F, 4)} (selisih {ind((A_PI_F - A_LONG_F) / A_LONG_F * 100, 2)} %). V_R = 500/{ind(A_LONG_F, 4)} = {ind(VR_NL_F, 1)} kV: melampaui 525 kV. Arus pengisian membangkitkan Q ≈ 500²×{ind(BF_ * 1e6, 3)}×10⁻⁶×{ind(LEN_F, 0)} = {ind(500 ** 2 * BF_ * LEN_F, 0)} MVAR; reaktor ± 50–60 % darinya di kedua ujung menahan tegangan; saluran dienergisasi dengan reaktor tersambung.",
            "❌ Tanpa beban justru tegangan ujung terima NAIK (Ferranti) karena |A| < 1: V_R = V_S/|A|. Nominal-π masih cukup dekat pada 350 km (selisih < 1 %). Hitung βℓ lalu cos βℓ.",
            "Petunjuk: (1) Hitung β, βℓ, A kedua model. (2) Hitung V_R tanpa beban dan bandingkan 525 kV. (3) Taksir Q_C dan reaktor; bahas energisasi.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Pada beban puncak jalur ini harus membawa <b>{ind(P_F, 0)} MW</b> (dianggap resistif) dengan V_S dijaga 500 kV. Nyatakan beban dalam kelipatan SIL, lalu hitung tegangan ujung terima dari profil saluran tanpa rugi (Persamaan 9: V(x) = V_R cos βx + jZ_c I_R sin βx, normalisasi V_S = 1 pu; Cell 4). Apakah V_R masih di atas 475 kV (−5 %)? Bahas tiga pilihan: kapasitor shunt di gardu terima, kompensasi kapasitor seri 40 % (Modul 6: X_eff dan P_maks), atau sirkit kedua; dan jelaskan bagaimana berkas 4 sudah 'membantu' lewat SIL yang lebih tinggi.",
            ["beban/SIL", "V(x) = V_R cos βx + jZ_c I_R sin βx", "P_maks = V²/X_eff"],
            f"Pada beban {ind(P_F, 0)} MW dengan V_S = 500 kV, tegangan ujung terima kira-kira...",
            [f"500 kV, karena saluran tanpa rugi tidak menjatuhkan tegangan", f"≈ {ind(VR_LOAD_F, 0)} kV ({ind((VR_LOAD_F / 500 - 1) * 100, 1)} %): beban {ind(RASIO_F, 2)} SIL menurunkan tegangan di bawah −5 %, perlu kompensasi", f"≈ {ind(VR_NL_F, 0)} kV, sama seperti tanpa beban", f"≈ {ind(500 * RASIO_F, 0)} kV, sebanding kelipatan SIL"],
            f"✅ Tepat! Beban = {ind(P_F, 0)}/{ind(SILF, 0)} = {ind(RASIO_F, 2)} SIL → I_R = {ind(RASIO_F, 2)}·V_R/Z_c; \\(|V_S/V_R| = \\sqrt{{\\cos^2\\beta\\ell + ({ind(RASIO_F, 2)}\\sin\\beta\\ell)^2}} = {ind(1 / (VR_LOAD_F / 500), 4)}\\) → V_R = {ind(VR_LOAD_F, 1)} kV ({ind((VR_LOAD_F / 500 - 1) * 100, 1)} %), di bawah 475 kV. Kapasitor shunt di gardu terima mengangkat V_R; kompensasi seri 40 % menurunkan X_eff dan menaikkan P_maks (Modul 6); sirkit kedua membagi beban menjadi {ind(RASIO_F / 2, 2)} SIL per sirkit (mendekati profil rata).",
            "❌ Di atas SIL saluran menyerap daya reaktif dan tegangan ujung terima TURUN walau tanpa rugi resistif; Ferranti hanya terjadi di bawah SIL. Hitung rasio beban/SIL lalu V_R dari profil dengan sin βℓ dan cos βℓ.",
            "Petunjuk: (1) Nyatakan beban dalam SIL dan hitung V_R. (2) Bandingkan batas −5 %. (3) Bahas tiga pilihan kompensasi dan peran berkas.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">L = 0,2 ln(GMD/GMR_b)</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">A = cos βℓ</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">SIL = V²/Z_c</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">500 kV · 350 km</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Jalur SUTET<br><em>500 kV, 350 km</em></h1>
    <p class="hero-sub">Sebuah jalur SUTET 500 kV baru harus dirancang dari gambar menaranya: berapa parameter salurannya, berapa beban alaminya, apa yang terjadi saat dienergisasi tanpa beban, dan bagaimana tegangannya pada beban puncak. Terapkan kosakata Pertemuan {PERTEMUAN} — GMD/GMR, berkas, ABCD, γ dan Z_c, SIL — untuk menjawab ketiganya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">SUTET 500 kV Berkas 4, {ind(LEN_F, 0)} km —<br>Dari Geometri Menara ke Profil Tegangan</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PEMODELAN SALURAN TRANSMISI</div>
    <p>
      PLN merancang jalur <strong style="color:var(--amber)">SUTET 500 kV</strong> sepanjang <strong style="color:var(--cyan)">{ind(LEN_F, 0)} km</strong> dari pembangkit ke gardu induk pusat beban. Konduktor <strong>berkas {NF} × ACSR</strong> (r = {ind(RF_CM, 2)} cm, jarak sub-konduktor {ind(SF_CM, 0)} cm) pada susunan mendatar berjarak <strong>{ind(DF_M, 0)} m</strong>; resistansi diabaikan untuk studi tegangan.
    </p>
    <p style="margin-top:12px">
      Tim perencana meminta tiga hal: <strong>parameter saluran dan SIL</strong> dari geometri; perilaku saat <strong style="color:var(--pink)">dienergisasi tanpa beban</strong> (batas 525 kV) beserta kebutuhan reaktor; dan tegangan ujung terima pada <strong style="color:var(--amber)">beban puncak {ind(P_F, 0)} MW</strong> beserta pilihan kompensasinya.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung ketiganya dan memberi rekomendasi <strong style="color:var(--cyan)">sebelum</strong> rancangan gardu dan kompensasi ditetapkan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"500 kV, {ind(LEN_F, 0)} km, mendatar D = {ind(DF_M, 0)} m", "14,165,233", "cyan")}
{kartu(f"Berkas {NF} × ACSR: r {ind(RF_CM, 2)} cm, s {ind(SF_CM, 0)} cm", "14,165,233", "cyan")}
{kartu("Batas tegangan: 475–525 kV (±5 %)", "14,165,233", "cyan")}
{kartu(f"Beban puncak: {ind(P_F, 0)} MW", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Saluran yang sama menaikkan tegangan saat kosong dan menjatuhkannya saat penuh; keduanya diramalkan oleh empat bilangan yang lahir dari geometri menara. Forum ini mengajak Anda menghitung <strong>berapa</strong> bilangan itu, <strong>seberapa jauh</strong> tegangan berayun, dan <strong>kompensasi apa</strong> yang menjinakkannya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Profil tegangan jalur {ind(LEN_F, 0)} km (V_S = 500 kV) tanpa beban, pada SIL, dan pada beban puncak {ind(P_F, 0)} MW; pita merah muda = batas ±5 %</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Jalur SUTET 500 kV sepanjang {ind(LEN_F, 0)} km, berkas {NF} × ACSR (r {ind(RF_CM, 2)} cm, s {ind(SF_CM, 0)} cm), susunan mendatar D = {ind(DF_M, 0)} m, resistansi diabaikan. Persoalan: parameter saluran dan SIL dari geometri; tegangan ujung terima saat dienergisasi tanpa beban (batas 525 kV) dan kebutuhan reaktor; tegangan ujung terima pada beban puncak {ind(P_F, 0)} MW (batas 475 kV) dan pilihan kompensasi."
FORUM_CHIPS_LMS = [f"500 kV, {ind(LEN_F, 0)} km, D = {ind(DF_M, 0)} m", f"berkas {NF} × r {ind(RF_CM, 2)} cm, s {ind(SF_CM, 0)} cm", "batas = 475–525 kV", f"beban puncak = {ind(P_F, 0)} MW"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Profil tegangan jalur 500 kV 350 km pada tiga keadaan beban (Pertemuan 10)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // parameter berkas 4: D 12 m, r 1,43 cm, s 45 cm
  const GMD = 12 * Math.cbrt(2), GMR = Math.pow(4 * 0.7788 * 0.0143 * Math.pow(0.45, 3), 0.25), rb = Math.pow(4 * 0.0143 * Math.pow(0.45, 3), 0.25);
  const L = 0.2 * Math.log(GMD / GMR), C = 0.05563 / Math.log(GMD / rb), x = 2 * Math.PI * 50 * L / 1000, b = 2 * Math.PI * 50 * C * 1e-6;
  const Zc = Math.sqrt(x / b), beta = Math.sqrt(x * b), SIL = 250000 / Zc, len = 350;
  const padL = 56, padR = 130, padT = 16, padB = 26, plotW = W - padL - padR, plotH = H - padT - padB;
  const X = (xk) => padL + (1 - xk / len) * plotW, Y = (v) => padT + plotH - (v - 0.85) / 0.3 * plotH;
  ctx.fillStyle = 'rgba(236,72,153,.10)'; ctx.fillRect(padL, Y(1.05), plotW, Y(0.95) - Y(1.05));
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [0.9, 1.0, 1.1].forEach((v) => ctx.fillText((v * 500).toFixed(0) + ' kV', padL - 5, Y(v) + 3));
  ctx.textAlign = 'center'; ctx.fillText('kirim', padL, H - 8); ctx.fillText('terima (' + len + ' km)', padL + plotW, H - 8);
  const kasus = [[0, 'tanpa beban', 'rgba(239,68,68,1)'], [1, '1,0 SIL (' + SIL.toFixed(0) + ' MW)', 'rgba(0,224,158,1)'], [1500 / SIL, '1500 MW (' + (1500 / SIL).toFixed(2) + ' SIL)', 'rgba(255,179,0,1)']];
  kasus.forEach(([rasio, label, warna]) => {
    const IR = rasio / Zc; const V = (xk) => Math.hypot(Math.cos(beta * xk), Zc * IR * Math.sin(beta * xk)); const VS = V(len);
    ctx.strokeStyle = warna; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const xk = len * (1 - i / 60); const v = V(xk) / VS; i ? ctx.lineTo(X(xk), Y(v)) : ctx.moveTo(X(xk), Y(v)); } ctx.stroke();
    ctx.fillStyle = warna; ctx.textAlign = 'left'; ctx.fillText(label + ': V_R ' + (500 / VS).toFixed(0) + ' kV', X(0) + 6, Y(1 / VS) + 3);
  });
  ctx.fillStyle = 'rgba(148,163,184,.85)'; ctx.textAlign = 'left'; ctx.fillText('Z_c = ' + Zc.toFixed(0) + ' Ω · β = ' + (beta * 1e3).toFixed(3) + 'e-3 rad/km · βℓ = ' + (beta * len).toFixed(3), padL + 6, padT + 12);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
