# Konten Modul 10 Teknik Tenaga Listrik — Kompensasi dalam Sistem Distribusi
# (Sub-CPMK 5.1, Pertemuan 11). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 10
PERTEMUAN = 11
SUB_CPMK = "5.1"
JUDUL = "Kompensasi dalam Sistem Distribusi"
JUDUL_PANJANG = "Kompensasi dalam Sistem Distribusi"
JUDUL_EKSPOR = "Kompensasi Sistem Distribusi"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
W_ = 2 * math.pi * 50
tanpf = lambda pf: math.tan(math.acos(pf))
VLL = 20.0
VF = VLL * 1000 / SQ3
# penyulang contoh: 8 km AAAC 150, beban terpusat di ujung 4 MW pf 0,8
L_KM, R_KM, X_KM = 8.0, 0.4, 0.35
R_L, X_L = R_KM * L_KM, X_KM * L_KM
P_LOAD, PF1, PF2 = 4.0, 0.8, 0.95
I1 = P_LOAD * 1e6 / (SQ3 * VLL * 1e3 * PF1)
I2 = P_LOAD * 1e6 / (SQ3 * VLL * 1e3 * PF2)
QC = P_LOAD * 1e3 * (tanpf(PF1) - tanpf(PF2))              # kVAR
Q1 = P_LOAD * 1e3 * tanpf(PF1)
DV1 = I1 * (R_L * PF1 + X_L * math.sin(math.acos(PF1)))
DV2 = I2 * (R_L * PF2 + X_L * math.sin(math.acos(PF2)))
LOSS1 = 3 * I1 ** 2 * R_L / 1000
LOSS2 = 3 * I2 ** 2 * R_L / 1000
DV_RISE = QC * 1e3 * X_L / (VLL * 1e3) ** 2 * 100          # %
IC = QC / (SQ3 * VLL)
LSF = 0.35
E_HEMAT = (LOSS1 - LOSS2) * 8760 * LSF
# beban merata: aturan 2/3
I_MERATA, PF_M = 240.0, 0.8
IQ_M = I_MERATA * math.sin(math.acos(PF_M))
Q_M = SQ3 * VLL * IQ_M
QC_23 = 2 / 3 * Q_M
LOSSQ_M = 3 * IQ_M ** 2 * R_L / 3 / 1000                    # rugi akibat arus reaktif, beban merata = 1/3 × I²R
# regulator
V_REL, STEP = 19.4, 0.625 / 100 * VLL
V_UJUNG = 18.9
N_STEP = (VLL - V_REL) / STEP
N_LOG = math.log(19.8 / V_UJUNG) / math.log(1.00625)
# bank kapasitor
C_D = QC * 1e3 / (3 * W_ * (VLL * 1e3) ** 2) * 1e6


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def kapasitor(x, y1, y2, c, label):
    ym = (y1 + y2) / 2
    return (kawat(x, y1, x, ym - 4) + kawat(x, ym + 4, x, y2) + f'<line x1="{x - 10}" y1="{ym - 4}" x2="{x + 10}" y2="{ym - 4}" stroke="{c}" stroke-width="2.4"/><line x1="{x - 10}" y1="{ym + 4}" x2="{x + 10}" y2="{ym + 4}" stroke="{c}" stroke-width="2.4"/>'
            + t(x + 14, ym + 4, label, 10.5, c, "start", "600"))


def gambar1():
    b = ""
    ox, oy, sk = 60, 180, 0.04
    xp, yq1, yq2 = ox + P_LOAD * 1e3 * sk, oy - Q1 * sk, oy - (Q1 - QC) * sk
    b += arrow(ox, oy, xp, oy, "#22d3ee", 2.8) + t((ox + xp) / 2, oy + 18, f"P = {ind(P_LOAD, 0)} MW", 11.5, "#22d3ee", "middle", "700")
    b += arrow(xp, oy, xp, yq1, "#ef4444", 2.4) + arrow(ox, oy, xp, yq1, "#ef4444", 2.4) + arrow(ox, oy, xp, yq2, "#00e09e", 2.8)
    b += arrow(xp + 16, yq1, xp + 16, yq2, "#a855f7", 2.6) + t(xp + 24, (yq1 + yq2) / 2 + 4, f"Q_C = {ind(QC, 0)} kVAR", 11, "#a855f7", "start", "700")
    yb = (oy + yq1) / 2 + 6                                  # S₁ di kiri sisi miringnya
    xs = ox + (oy - yb) * (xp - ox) / (oy - yq1) - 8
    b += t(xs, yb - 13, f"S₁ = {ind(P_LOAD * 1e3 / PF1, 0)} kVA", 10.5, "#ef4444", "end", "600") + t(xs, yb, f"I = {ind(I1, 0)} A", 10.5, "#ef4444", "end", "600")
    b += t(xp + 8, yq2 + 20, f"S₂ = {ind(P_LOAD * 1e3 / PF2, 0)} kVA", 10.5, "#00e09e", "start", "600") + t(xp + 8, yq2 + 33, f"I = {ind(I2, 0)} A", 10.5, "#00e09e", "start", "600")
    b += t(xp + 8, oy - 6, f"Q₁ = {ind(Q1, 0)} kVAR", 11, "#ef4444", "start", "600")
    for i, (judul, isi, c) in enumerate([("Arus penyulang", f"{ind(I1, 0)} → {ind(I2, 0)} A (−{ind((1 - I2 / I1) * 100, 0)} %)", "#22d3ee"), ("Rugi 3I²R", f"{ind(LOSS1, 0)} → {ind(LOSS2, 0)} kW (−{ind((1 - LOSS2 / LOSS1) * 100, 0)} %)", "#f59e0b"),
                                          ("Jatuh tegangan", f"{ind(DV1 / VF * 100, 1)} → {ind(DV2 / VF * 100, 1)} %", "#00e09e"), ("Kapasitas trafo terbebas", f"{ind(P_LOAD * 1e3 / PF1 - P_LOAD * 1e3 / PF2, 0)} kVA", "#a855f7")]):
        y = 30 + i * 44
        b += f'<rect x="420" y="{y}" width="228" height="36" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>' + t(430, y + 15, judul, 11, TX, "start", "600") + t(430, y + 29, isi, 9.5, AX, "start")
    b += t(330, 222, f"Penyulang 20 kV, {ind(L_KM, 0)} km (R = {ind(R_L, 1)} Ω, X = {ind(X_L, 1)} Ω): beban {ind(P_LOAD, 0)} MW pf {ind(PF1, 1)} → {ind(PF2, 2)} dengan kapasitor {ind(QC, 0)} kVAR di ujung", 11, AX)
    return svg(660, 232, b, "Gambar 1 — Segitiga daya penyulang sebelum dan sesudah kapasitor shunt")


def gambar2():
    b = t(330, 22, f"Penyulang 20 kV, {ind(L_KM, 0)} km, beban terpusat di ujung", 12, TX, "middle", "700")
    b += kawat(40, 90, 80, 90) + kawat(80, 90, 80, 70) + kawat(80, 70, 80, 110)
    b += f'<rect x="90" y="80" width="90" height="20" rx="3" fill="{BOX}" stroke="#22d3ee" stroke-width="2"/>' + t(135, 74, f"R = {ind(R_L, 1)} Ω", 10.5, "#22d3ee", "middle", "600") + kawat(80, 90, 90, 90) + kawat(180, 90, 200, 90)
    n, w = 4, 22
    d = " ".join(f"a {w / 2:.1f} {w / 2:.1f} 0 0 1 {w:.1f} 0" for _ in range(n))
    b += f'<path d="M 200 90 {d}" fill="none" stroke="#f59e0b" stroke-width="2.2"/>' + t(244, 74, f"X = {ind(X_L, 1)} Ω", 10.5, "#f59e0b", "middle", "600") + kawat(288, 90, 520, 90) + kawat(40, 170, 520, 170)
    b += f'<rect x="500" y="110" width="20" height="40" rx="3" fill="{BOX}" stroke="#ef4444" stroke-width="2"/>' + kawat(510, 90, 510, 110) + kawat(510, 150, 510, 170) + t(510, 190, f"{ind(P_LOAD, 0)} MW, pf {ind(PF1, 1)}", 10, TX, "middle", "600")
    b += kapasitor(400, 90, 170, "#a855f7", f"C {ind(QC, 0)} kVAR")
    b += f'<circle cx="40" cy="90" r="4" fill="#00e09e"/>' + t(40, 76, "gardu 20 kV", 10, "#00e09e", "middle", "700")
    b += arrow(300, 76, 380, 76, "#ef4444", 1.6) + t(340, 66, f"I₁ = {ind(I1, 0)} A → I₂ = {ind(I2, 0)} A", 10, "#ef4444", "middle", "600")
    b += arrow(385, 100, 385, 140, "#a855f7", 1.6) + t(377, 124, f"I_C = {ind(IC, 1)} A", 9.5, "#a855f7", "end", "600")
    b += t(330, 214, f"ΔV sebelum = {ind(I1, 0)}({ind(R_L, 1)}·{ind(PF1, 1)} + {ind(X_L, 1)}·{ind(math.sin(math.acos(PF1)), 2)}) = {ind(DV1, 0)} V ({ind(DV1 / VF * 100, 1)} %); sesudah {ind(DV2, 0)} V ({ind(DV2 / VF * 100, 1)} %); kenaikan oleh kapasitor ≈ Q_C·X/V² = {ind(DV_RISE, 2)} %", 10.5, AX)
    return svg(660, 226, b, "Gambar 2 — Jatuh tegangan penyulang dan kenaikan tegangan oleh kapasitor")


def gambar3():
    b = ""
    x0, x1, y0, y1 = 64, 620, 196, 26
    X = lambda p: x0 + p * (x1 - x0)
    Y = lambda v: y0 - v * (y0 - y1)
    for p in [0, 0.25, 0.5, 0.75, 1.0]:
        b += f'<line x1="{X(p):.1f}" y1="{y1}" x2="{X(p):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(p), y0 + 16, f"{p * 100:.0f} %", 10.5, AX)
    for v in [0, 0.25, 0.5, 0.75, 1.0]:
        b += t(x0 - 8, Y(v) + 4, f"{v * 100:.0f} %", 10.5, AX, "end")

    def reduksi(c, p):
        n = 200
        s0 = sum(((1 - (i + 0.5) / n)) ** 2 for i in range(n)) / n
        s = sum(((1 - (i + 0.5) / n) - (c if (i + 0.5) / n < p else 0)) ** 2 for i in range(n)) / n
        return 1 - s / s0
    for c, col, lab in [(1 / 3, "#94a3b8", "C = 1/3 I_Q"), (2 / 3, "#00e09e", "C = 2/3 I_Q (optimum)"), (1.0, "#f59e0b", "C = I_Q")]:
        pts = " ".join(f"{X(i / 50):.1f},{Y(max(0, reduksi(c, i / 50))):.1f}" for i in range(51))
        b += f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="{2.6 if c == 2 / 3 else 1.8}"/>'
        yy = y1 + 14 + 14 * [1 / 3, 2 / 3, 1.0].index(c)
        b += f'<line x1="{x0 + 8}" y1="{yy - 4}" x2="{x0 + 26}" y2="{yy - 4}" stroke="{col}" stroke-width="2.4"/>' + t(x0 + 32, yy, lab, 10, col, "start", "600")
    b += f'<circle cx="{X(2 / 3):.1f}" cy="{Y(8 / 9):.1f}" r="6" fill="#00e09e"/>' + t(X(2 / 3) - 10, Y(8 / 9) - 12, "2/3 panjang, 8/9 = 88,9 %", 10.5, "#00e09e", "end", "700")
    b += t(x0 - 8, y1 - 8, "Δrugi", 10.5, AX, "end") + t(340, 232, "Beban merata: pengurangan rugi reaktif terhadap letak kapasitor untuk tiga ukuran;", 11, AX)
    b += t(340, 246, "kapasitor 2/3 I_Q di 2/3 panjang memberi maksimum 8/9", 11, AX)
    return svg(660, 256, b, "Gambar 3 — Aturan dua-pertiga: pengurangan rugi terhadap ukuran dan letak kapasitor")


def gambar4():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    X = lambda tt: x0 + tt / 24 * (x1 - x0)
    Y = lambda q: y0 - q / 4000 * (y0 - y1)
    P = lambda tt: 1500 + 2500 * math.exp(-((tt - 13) / 4.5) ** 2) + (600 if 7 <= tt <= 18 else 0)
    Q = lambda tt: 0.75 * P(tt) + 200
    Qcap = lambda tt: 600 + (1200 if 8 <= tt < 18 else 0)
    for tt in range(0, 25, 4):
        b += f'<line x1="{X(tt):.1f}" y1="{y1}" x2="{X(tt):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(tt), y0 + 16, f"{tt}:00", 10.5, AX)
    for q in [0, 1000, 2000, 3000, 4000]:
        b += t(x0 - 8, Y(q) + 4, f"{q}", 10.5, AX, "end")
    pts_q = " ".join(f"{X(i / 4):.1f},{Y(Q(i / 4)):.1f}" for i in range(97))
    pts_c = " ".join(f"{X(i / 4):.1f},{Y(Qcap(i / 4)):.1f}" for i in range(97))
    pts_n = " ".join(f"{X(i / 4):.1f},{Y(max(0, Q(i / 4) - Qcap(i / 4))):.1f}" for i in range(97))
    b += f'<polygon points="{X(0):.1f},{Y(0):.1f} {pts_n} {X(24):.1f},{Y(0):.1f}" fill="#f59e0b" fill-opacity=".18"/>'
    b += f'<polyline points="{pts_q}" fill="none" stroke="#ef4444" stroke-width="2.2"/>' + t(X(13), Y(Q(13)) - 8, "Q beban", 10.5, "#ef4444", "middle", "600")
    b += f'<polyline points="{pts_c}" fill="none" stroke="#00e09e" stroke-width="2.4"/>' + t(X(12.5), Y(1800) - 21, "Q kapasitor: tetap 600 +", 10, "#00e09e", "middle", "600") + t(X(12.5), Y(1800) - 8, "switched 1200 kVAR (08–18)", 10, "#00e09e", "middle", "600")
    b += t(X(20), Y(600) + 16, "Q dari jaringan (arsir)", 10, "#f59e0b", "middle", "600")
    b += t(x0 - 8, y1 - 8, "kVAR", 10.5, AX, "end") + t(347, 232, "Kurva harian penyulang industri: kapasitor tetap sebesar Q malam, switched menutup selisih siang;", 11, AX)
    b += t(347, 246, "tanpa switching Q malam negatif (tegangan lebih)", 11, AX)
    return svg(660, 256, b, "Gambar 4 — Kapasitor tetap dan switched mengikuti kurva beban harian")


def gambar5():
    b = t(330, 22, "Regulator tegangan bertingkat (autotrafo ±10 %, 32 tingkat)", 12, TX, "middle", "700")
    b += kawat(40, 100, 200, 100) + f'<circle cx="230" cy="100" r="26" fill="{BOX}" stroke="#a855f7" stroke-width="2"/>' + t(230, 104, "REG", 11, "#a855f7", "middle", "700") + kawat(256, 100, 620, 100)
    for i in range(6):
        x = 300 + i * 60
        b += kawat(x, 100, x, 124) + f'<rect x="{x - 8}" y="124" width="16" height="16" rx="2" fill="{BOX}" stroke="#ef4444" stroke-width="1.5"/>'
    b += f'<circle cx="40" cy="100" r="4" fill="#00e09e"/>' + t(40, 86, f"rel {ind(V_REL, 1)} kV", 10, "#00e09e", "middle", "700")
    b += t(230, 60, f"tingkat +{math.ceil(N_STEP)} → {ind(V_REL + math.ceil(N_STEP) * STEP, 2)} kV", 10.5, "#a855f7", "middle", "600")
    b += t(638, 86, f"ujung {ind(V_UJUNG, 1)} → {ind(V_UJUNG * 1.00625 ** math.ceil(N_LOG), 2)} kV", 10, "#ef4444", "end", "600")
    b += t(330, 170, f"tanpa regulator: rel {ind(V_REL, 1)} kV, ujung {ind(V_UJUNG, 1)} kV (−{ind((1 - V_UJUNG / 20) * 100, 1)} %); regulator {math.ceil(N_LOG)} tingkat (5/8 % = 125 V per tingkat)", 10.5, AX)
    b += t(330, 184, f"mengangkat seluruh hilir ≈ {ind((1.00625 ** math.ceil(N_LOG) - 1) * 100, 1)} %", 10.5, AX)
    b += t(330, 204, "LDC (line drop compensation): regulator mengatur tegangan di titik pusat beban, bukan di terminalnya,", 10.5, AX)
    b += t(330, 218, "dengan meniru jatuh R dan X dari arus terukur", 10.5, AX)
    return svg(660, 228, b, "Gambar 5 — Regulator tegangan bertingkat pada pangkal penyulang")


def gambar6():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 36
    pfs = [0.6, 0.7, 0.8, 0.9, 0.95, 1.0]
    X = lambda i: x0 + i / (len(pfs) - 1) * (x1 - x0)
    lossrel = lambda pf: (0.6 / pf) ** 2 * 100
    Y = lambda v: y0 - v / 100 * (y0 - y1)
    for i, pf in enumerate(pfs):
        b += t(X(i), y0 + 16, f"{ind(pf, 2)}", 10.5, AX)
    for v in [0, 25, 50, 75, 100]:
        b += f'<line x1="{x0}" y1="{Y(v):.1f}" x2="{x1}" y2="{Y(v):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(v) + 4, f"{v} %", 10.5, AX, "end")
    pts = " ".join(f"{X(i):.1f},{Y(lossrel(pf)):.1f}" for i, pf in enumerate(pfs))
    b += f'<polyline points="{pts}" fill="none" stroke="#f59e0b" stroke-width="2.6"/>'
    for i, pf in enumerate(pfs):
        b += f'<circle cx="{X(i):.1f}" cy="{Y(lossrel(pf)):.1f}" r="4" fill="#f59e0b"/>' + t(X(i), Y(lossrel(pf)) - 10, f"{ind(lossrel(pf), 0)} %", 10, TX, "middle", "600")
    pts2 = " ".join(f"{X(i):.1f},{Y(0.6 / pf * 100):.1f}" for i, pf in enumerate(pfs))
    b += f'<polyline points="{pts2}" fill="none" stroke="#22d3ee" stroke-width="2" stroke-dasharray="5 4"/>' + t(X(4), Y(0.6 / 0.95 * 100) + 16, "arus relatif ∝ 1/pf", 10, "#22d3ee", "middle", "600")
    b += t(X(1), Y(lossrel(0.7)) + 20, "rugi relatif ∝ 1/pf²", 10, "#f59e0b", "middle", "600")
    b += t(347, 232, "Untuk P tetap: arus turun berbanding terbalik pf, rugi berbanding terbalik kuadratnya;", 11, AX)
    b += t(347, 246, "dari 0,6 ke 0,95 rugi tinggal 40 %", 11, AX)
    return svg(660, 256, b, "Gambar 6 — Arus dan rugi penyulang relatif terhadap faktor daya (P tetap)")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-masalah">Beban Reaktif</a>
  <a href="#m-kapasitor">Kapasitor Shunt</a>
  <a href="#m-tegangan">Jatuh &amp; Naik Tegangan</a>
  <a href="#m-penempatan">Penempatan</a>
  <a href="#m-regulator">Regulator</a>
  <a href="#m-praktik">Ekonomi &amp; Praktik</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="100" x2="90" y2="100" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="70" y1="100" x2="70" y2="124" stroke="rgba(168,85,247,.6)" stroke-width="1.2"/><line x1="62" y1="124" x2="78" y2="124" stroke="rgba(168,85,247,.7)" stroke-width="1.8"/><line x1="62" y1="130" x2="78" y2="130" stroke="rgba(168,85,247,.7)" stroke-width="1.8"/><line x1="70" y1="130" x2="70" y2="150" stroke="rgba(168,85,247,.6)" stroke-width="1.2"/>
      <rect x="84" y="104" width="10" height="24" rx="2" fill="none" stroke="rgba(239,68,68,.6)" stroke-width="1.5"/>
      <text x="20" y="92" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">I ↓</text>
      <text x="44" y="164" fill="rgba(168,85,247,.6)" font-family="JetBrains Mono" font-size="8">Q_C</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="160" x2="90" y2="160" stroke="rgba(148,163,184,.4)" stroke-width="1"/>
      <path d="M 10 80 L 90 130" stroke="rgba(239,68,68,.6)" stroke-width="1.6"/>
      <path d="M 10 80 L 60 100 L 62 88 L 90 104" stroke="rgba(0,224,158,.7)" stroke-width="1.6" fill="none"/>
      <text x="14" y="70" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">V sepanjang penyulang</text>
      <text x="58" y="122" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">+C</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">ΔV ≈ I(R cos φ + X sin φ)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">ΔV_naik ≈ Q_C·X/V²</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">aturan 2/3</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">rugi ∝ 1/pf²</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">5/8 % per tingkat</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">Q_C ∝ V²</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">E = ΔP·8760·F_rugi</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Kompensasi</span><br>
      <em>dalam Sistem</em><br>
      <span class="hl-amber">Distribusi</span>
    </h1>
    <p class="hero-sub">Penyulang distribusi 20 kV membawa beban motor-motor industri dan rumah tangga yang menarik daya reaktif; arus reaktif itu memanaskan kabel, menjatuhkan tegangan di ujung penyulang, dan memenuhi trafo gardu. Modul ini menghitung berapa kapasitor yang diperlukan, di mana memasangnya, berapa rugi dan jatuh tegangan yang berkurang, kapan kapasitor harus dilepas, dan bagaimana regulator tegangan bertingkat melengkapinya, dengan sudut pandang insinyur yang mengelola pasokan kawasan industri.</p>
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

    # 01 — beban reaktif di penyulang
    isi = figure(1, "Segitiga daya penyulang sebelum dan sesudah kapasitor shunt", f"Beban {ind(P_LOAD, 0)} MW pf {ind(PF1, 1)} menarik {ind(Q1, 0)} kVAR dan {ind(I1, 0)} A dari penyulang; kapasitor {ind(QC, 0)} kVAR memasok sebagian besar Q itu di tempat sehingga arus turun ke {ind(I2, 0)} A, rugi turun {ind((1 - LOSS2 / LOSS1) * 100, 0)} %, dan {ind(P_LOAD * 1e3 / PF1 - P_LOAD * 1e3 / PF2, 0)} kVA kapasitas trafo terbebas.", gambar1())
    isi += formula(1, "Daya Reaktif Beban dan Arus Penyulang", r"Q = P\tan\varphi, \qquad I = \dfrac{P}{\sqrt{3}\,V_L\cos\varphi} = \sqrt{I_P^2 + I_Q^2}, \qquad I_Q = \dfrac{Q}{\sqrt{3}\,V_L}",
                   rf"Penyulang contoh: \(Q_1 = {ind(P_LOAD, 0)}\times10^3\times\tan({ind(math.degrees(math.acos(PF1)), 1)}^\circ) = {ind(Q1, 0)}\) kVAR; \(I_1 = {ind(P_LOAD, 0)}\times10^6/(\sqrt{{3}}\times20\times10^3\times{ind(PF1, 1)}) = {ind(I1, 1)}\) A, terdiri atas \(I_P = {ind(I1 * PF1, 1)}\) A yang bekerja dan \(I_Q = {ind(I1 * math.sin(math.acos(PF1)), 1)}\) A yang hanya bolak-balik. Modul 5 membahas ini untuk satu pelanggan; di sini untuk seluruh penyulang.",
                   "Komponen reaktif arus tidak menghasilkan kWh tetapi ikut memanaskan konduktor (∝ I²), menjatuhkan tegangan lewat reaktansi (X·I_Q), dan memakan kapasitas trafo (kVA). Utilitas memandangnya sebagai rugi teknis dan kapasitas yang hilang; itulah alasan PLN memasang kapasitor di gardu dan penyulang, di samping mendenda pelanggan berfaktor daya rendah.",
                   [("I_P, I_Q", "Komponen aktif dan reaktif arus (A)"), ("V_L", "Tegangan penyulang antar-saluran (V)"), ("\\varphi", "Sudut faktor daya beban gabungan")])
    isi += cards([
        ("🏭", "Sumber kVAR", "Motor induksi (pf 0,7–0,85), lampu neon balast magnetik, las, tanur induksi, dan trafo distribusi yang setengah kosong (arus magnetisasi 1–3 % kVA).", None),
        ("📉", "Tiga Akibat", "Rugi I²R lebih besar, jatuh tegangan X·I_Q di ujung penyulang, dan kapasitas trafo/penyulang termakan kVA yang tidak membayar.", None),
        ("💸", "Sisi Utilitas", "PLN membayar rugi teknis dari energi yang dibangkitkan tetapi tidak terjual (± 8 % di distribusi); kapasitor penyulang adalah investasi pengurang rugi termurah.", None),
        ("👤", "Sisi Pelanggan", "Pelanggan ≥ 200 kVA membayar kVARh berlebih bila pf < 0,85 (Modul 5); kapasitor di panel pelanggan menghilangkan denda sekaligus membantu penyulang.", None),
        ("🌙", "Beban Berubah", "Q malam bisa sepertiga Q siang; kapasitor yang cukup untuk siang berlebih di malam hari dan menaikkan tegangan: alasan kapasitor switched (Bagian 04).", None),
        ("🔗", "Rantai Modul", "Modul 5 memberi segitiga daya, Modul 6 memberi jatuh tegangan I(R cos φ + X sin φ), Modul 9 memberi parameter penyulang; modul ini menggabungkan ketiganya.", None),
    ])
    isi += tabel(["Beban penyulang 20 kV", "P (MW)", "pf", "S (kVA)", "I (A)", "I_Q (A)"],
                 [[nama, ind(p, 1), ind(pf, 2), ind(p * 1e3 / pf, 0), ind(p * 1e6 / (SQ3 * 20e3 * pf), 0), ind(p * 1e6 / (SQ3 * 20e3 * pf) * math.sin(math.acos(pf)), 0)] for nama, p, pf in
                  [("Kawasan industri siang", 4.0, 0.80), ("Kawasan industri malam", 1.5, 0.72), ("Perumahan malam", 3.0, 0.92), ("Campuran siang", 3.5, 0.85), ("Tanur induksi", 2.0, 0.65)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> tanur induksi 2 MW menarik arus reaktif hampir sama dengan kawasan industri 4 MW; faktor daya, bukan hanya besar beban, yang menentukan arus reaktif yang harus dilayani penyulang. Soal C1–C3 memakai Persamaan (1).")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 menetapkan masalah: arus reaktif di penyulang. Bagian 02–03 memberi obatnya dan efeknya: kapasitor shunt, rugi, jatuh dan kenaikan tegangan. Bagian 04 menjawab 'berapa dan di mana' (aturan 2/3, tetap vs switched). Bagian 05 menambahkan alat kedua, regulator tegangan, dan Bagian 06 menghitung nilai uangnya beserta jebakan praktiknya. Animasi dan Python memakai penyulang contoh yang sama.")
    m += bagian(1, "m-masalah", "Beban Reaktif<br>di Penyulang Distribusi",
                "Penyulang 20 kV yang memasok kawasan industri melihat gabungan ratusan motor sebagai satu beban berfaktor daya 0,7–0,85. Arus reaktifnya bukan milik satu pelanggan melainkan beban bersama seluruh penyulang, dan Persamaan (1) memisahkannya dari arus yang bekerja. Gambar 1 memperlihatkan segitiga daya penyulang contoh yang dipakai sepanjang modul.",
                isi, "BEBAN REAKTIF")

    # 02 — kapasitor shunt
    isi = formula(2, "Kapasitor Shunt: Ukuran, Arus, dan Rugi", r"Q_C = P(\tan\varphi_1 - \tan\varphi_2), \qquad I_2 = I_1\dfrac{\cos\varphi_1}{\cos\varphi_2}, \qquad P_{rugi,2} = P_{rugi,1}\left(\dfrac{\cos\varphi_1}{\cos\varphi_2}\right)^2",
                   rf"Penyulang contoh: \(Q_C = {ind(P_LOAD * 1e3, 0)}(\tan{ind(math.degrees(math.acos(PF1)), 1)}^\circ - \tan{ind(math.degrees(math.acos(PF2)), 1)}^\circ) = {ind(QC, 0)}\) kVAR; \(I_2 = {ind(I1, 1)}\times{ind(PF1, 1)}/{ind(PF2, 2)} = {ind(I2, 1)}\) A; rugi \(3I^2R\): \({ind(LOSS1, 1)}\) → \({ind(LOSS2, 1)}\) kW ({ind((1 - LOSS2 / LOSS1) * 100, 1)} % lebih kecil). Rumus ini menganggap seluruh Q beban berada di titik kapasitor (beban terpusat).",
                   "Kapasitor shunt adalah sumber daya reaktif lokal: arus reaktif beban kini berputar antara kapasitor dan motor di ujung penyulang, tidak lagi melewati penyulang dan trafo. Daya aktif tidak berubah, sehingga seluruh penurunan arus adalah penurunan I_Q; rugi turun kuadratis karena rugi ∝ I². Kapasitor tegangan menengah dijual per unit 100–400 kVAR yang dirangkai menjadi bank 600–3000 kVAR di tiang atau gardu.",
                   [("\\varphi_1, \\varphi_2", "Sudut sebelum dan sesudah kompensasi"), ("I_1, I_2", "Arus penyulang sebelum dan sesudah (A)"), ("P_{rugi}", "Rugi tembaga penyulang 3I²R (W)")])
    isi += figure(6, "Arus dan rugi penyulang relatif terhadap faktor daya (P tetap)", f"Untuk daya aktif yang sama, arus berbanding terbalik pf dan rugi berbanding terbalik kuadratnya: dari pf 0,6 ke 0,95 rugi tinggal 40 %, dan dari 0,8 ke 0,95 tinggal {ind((0.8 / 0.95) ** 2 * 100, 0)} %.", gambar6())
    isi += cards([
        ("🔩", "Bank Tiang", "Bank 300–1200 kVAR tiga unit kapasitor dengan sekring dan saklar, dipasang di tiang penyulang; kapasitor switched dilengkapi pengendali dan sakelar vakum.", None),
        ("🏢", "Bank Gardu", "Bank 3–10 MVAR di rel 20 kV gardu induk: membebaskan trafo 150/20 kV dan sistem hulu, tetapi tidak mengurangi rugi penyulang (arus reaktif tetap lewat penyulang).", None),
        ("⚙️", "Di Terminal Motor", "Kapasitor di terminal motor besar (pelanggan) mengurangi arus di seluruh jalur; batas ukurannya ≈ 90 % kVAR magnetisasi motor agar tidak self-excitation saat motor dilepas.", None),
        ("🧮", "Q ∝ V²", "Kapasitor 1000 kVAR pada 19 kV hanya memberi 903 kVAR; pada tegangan rendah, saat paling dibutuhkan, kapasitor paling lemah. Regulator (Bagian 05) menutupinya.", r"\(Q_C = V^2\,\omega C\)"),
        ("🔥", "Harmonik", "Kapasitor beresonansi dengan induktansi sistem pada frekuensi f_r = f√(S_sc/Q_C); bila dekat harmonik ke-5/7 dari VSD, arus harmonik membesar; pakai reaktor detuning.", r"\(f_r = 50\sqrt{S_{sc}/Q_C}\)"),
        ("🛡️", "Proteksi Bank", "Sekring per unit, relai ketidakseimbangan netral (unit gagal), dan resistor pelepas muatan (tegangan sisa < 50 V dalam 5 menit) adalah perangkat baku bank kapasitor.", None),
    ])
    isi += tabel(["Penyulang contoh (4 MW, R = 3,2 Ω)", "pf", "Q dari jaringan (kVAR)", "I (A)", "Rugi (kW)", "Kapasitas trafo terpakai (kVA)"],
                 [[nama, ind(pf, 2), ind(P_LOAD * 1e3 * tanpf(pf), 0), ind(P_LOAD * 1e6 / (SQ3 * 20e3 * pf), 0), ind(3 * (P_LOAD * 1e6 / (SQ3 * 20e3 * pf)) ** 2 * R_L / 1000, 0), ind(P_LOAD * 1e3 / pf, 0)] for nama, pf in
                  [("Tanpa kapasitor", 0.80), ("Kapasitor 1000 kVAR", P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 1000)), (f"Kapasitor {ind(QC, 0)} kVAR", 0.95), ("Kapasitor 3000 kVAR (pf 1)", 1.0)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> dari pf 0,8 ke 0,95 rugi turun 89 kW dengan 1685 kVAR; dari 0,95 ke 1,0 hanya turun 14 kW lagi dengan 1315 kVAR tambahan. Manfaat kapasitor menurun cepat mendekati pf 1, sementara risiko tegangan lebih dan resonansi naik: sasaran praktis 0,90–0,95. Soal C1–C3 dan C12 memakai Persamaan (2).")
    m += bagian(2, "m-kapasitor", "Kapasitor Shunt:<br>Ukuran, Arus, dan Rugi",
                "Kapasitor yang dipasang paralel dengan beban memasok daya reaktif dari tempat terdekat, sehingga arus yang melewati penyulang dan trafo tinggal komponen aktifnya ditambah sisa reaktif. Persamaan (2) menghitung ukurannya dan dua akibat langsungnya, arus dan rugi, dan Gambar 6 memperlihatkan mengapa rugi turun jauh lebih cepat daripada arus.",
                isi, "KAPASITOR SHUNT")

    # 03 — tegangan
    isi = figure(2, "Jatuh tegangan penyulang dan kenaikan tegangan oleh kapasitor", f"Beban di ujung penyulang menjatuhkan {ind(DV1 / VF * 100, 1)} % lewat R dan X; kapasitor {ind(QC, 0)} kVAR mengurangi komponen reaktif arus sehingga jatuh tegangan tinggal {ind(DV2 / VF * 100, 1)} %, setara kenaikan Q_C·X/V² ≈ {ind(DV_RISE, 2)} % di titik kapasitor.", gambar2())
    isi += formula(3, "Jatuh Tegangan dan Kenaikan Tegangan oleh Kapasitor", r"\Delta V \approx I(R\cos\varphi + X\sin\varphi) = I_P R + I_Q X, \qquad \Delta V_{naik} \approx I_C X = \dfrac{Q_C\,X}{V_L^2}\ (\text{pu})",
                   rf"Penyulang contoh: \(\Delta V_1 = {ind(I1, 1)}({ind(R_L, 1)}\times{ind(PF1, 1)} + {ind(X_L, 1)}\times{ind(math.sin(math.acos(PF1)), 2)}) = {ind(DV1, 0)}\) V/fasa = {ind(DV1 / VF * 100, 2)} % (ujung {ind((1 - DV1 / VF) * 20, 2)} kV). Kapasitor {ind(QC, 0)} kVAR: \(I_C = {ind(IC, 1)}\) A, \(\Delta V_{{naik}} = {ind(IC, 1)}\times{ind(X_L, 1)} = {ind(IC * X_L, 0)}\) V = {ind(DV_RISE, 2)} %; jatuh tegangan sesudahnya \({ind(DV2, 0)}\) V = {ind(DV2 / VF * 100, 2)} %.",
                   "Kapasitor 'menaikkan' tegangan dengan menghapus jatuh tegangan reaktif I_Q·X; besarnya sebanding kVAR dan reaktansi dari sumber ke titik kapasitor. Karena itu kapasitor di ujung penyulang panjang menaikkan tegangan jauh lebih banyak daripada di rel gardu (X ≈ 0). Kenaikan ini terjadi juga saat beban ringan: kapasitor tetap yang terlalu besar membuat tegangan malam melampaui batas +5 %.",
                   [("I_P, I_Q", "Komponen aktif dan reaktif arus (A)"), ("I_C", "Arus kapasitor (A)"), ("X", "Reaktansi dari sumber ke titik kapasitor (Ω)")])
    isi += cards([
        ("📏", "Batas Tegangan", "SPLN: tegangan pelanggan −10 %/+5 % dari 220 V; penyulang 20 kV dijaga 19–21 kV agar setelah trafo distribusi dan kabel rumah masih dalam batas.", None),
        ("📐", "R vs X", "Penyulang udara: X ≈ R (0,35 vs 0,4 Ω/km), jadi kapasitor menghapus sekitar separuh jatuh tegangan; kabel tanah: X ≪ R, kapasitor kurang efektif menaikkan tegangan.", None),
        ("🔺", "Beban Merata", "Untuk beban tersebar merata, jatuh tegangan total = setengah jatuh tegangan beban terpusat yang sama di ujung (arus berkurang linear sepanjang penyulang).", r"\(\Delta V_{merata} = \tfrac{1}{2}\Delta V_{ujung}\)"),
        ("🌙", "Tegangan Lebih Malam", "Kapasitor 1685 kVAR tetap pada beban malam 1,5 MW pf 0,72 (Q 1450 kVAR) membalik pf menjadi mendahului dan menaikkan tegangan ujung; perlu switching.", None),
        ("⚡", "Flicker", "Beban berfluktuasi (las, tanur busur) menimbulkan kedip; kapasitor shunt tidak menyelesaikannya, perlu SVC/STATCOM atau kapasitor seri.", None),
        ("🔁", "Profil Penyulang", "Tegangan turun sepanjang penyulang; kapasitor 'melompatkan' profil ke atas di titiknya dan mendatarkan bagian hulu (Animasi 1).", None),
    ])
    isi += tabel(["Letak kapasitor 1685 kVAR (penyulang 8 km)", "X ke titik (Ω)", "Kenaikan di titik (%)", "Kenaikan di ujung (%)", "Pengurangan rugi"],
                 [[nama, ind(x_, 2), ind(QC * 1e3 * x_ / (20e3) ** 2 * 100, 2), ind(QC * 1e3 * x_ / (20e3) ** 2 * 100, 2), red] for nama, x_, red in
                  [("Rel gardu 20 kV", 0.0, "tidak ada di penyulang"), ("4 km (tengah)", X_KM * 4, "separuh (beban di ujung)"), ("8 km (ujung, di beban)", X_L, "penuh"), ("Terminal motor pelanggan", X_L + 0.3, "penuh + kabel pelanggan")]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> untuk beban terpusat di ujung, kapasitor di beban memberi kenaikan tegangan dan pengurangan rugi terbesar; di rel gardu ia hanya membantu sistem hulu. Beban merata mengubah kesimpulan ini menjadi aturan dua-pertiga (Bagian 04). Soal C4–C6 dan C11 memakai Persamaan (3).")
    m += bagian(3, "m-tegangan", "Jatuh Tegangan dan<br>Kenaikan Tegangan oleh Kapasitor",
                "Keluhan yang paling sering sampai ke utilitas bukan rugi, melainkan tegangan ujung penyulang yang rendah di jam puncak. Persamaan (3) menghubungkan jatuh tegangan dengan komponen reaktif arus dan memperlihatkan bagaimana kapasitor 'mengangkat' tegangan sebanding kVAR dan reaktansi hulu; Gambar 2 memberi angkanya untuk penyulang contoh.",
                isi, "JATUH DAN NAIK TEGANGAN")

    # 04 — penempatan
    isi = figure(3, "Aturan dua-pertiga: pengurangan rugi terhadap ukuran dan letak kapasitor", "Untuk beban tersebar merata, satu kapasitor sebesar dua-pertiga arus reaktif yang dipasang pada dua-pertiga panjang penyulang memberi pengurangan rugi reaktif maksimum 8/9; kapasitor yang terlalu besar atau terlalu jauh justru menambah rugi.", gambar3())
    isi += formula(4, "Aturan Dua-Pertiga dan Beberapa Kapasitor", r"\text{beban merata, 1 kapasitor: } Q_C = \tfrac{2}{3}Q_{beban}\ \text{pada } \tfrac{2}{3}\ell,\ \Delta P_{maks} = \tfrac{8}{9}P_{rugi,Q}; \qquad n\ \text{kapasitor: tiap } \tfrac{2}{2n+1}Q_{beban}\ \text{pada } \tfrac{2k}{2n+1}\ell",
                   rf"Penyulang beban merata dengan arus pangkal {ind(I_MERATA, 0)} A pf {ind(PF_M, 1)}: \(I_Q = {ind(IQ_M, 0)}\) A, \(Q_{{beban}} = \sqrt{{3}}\times20\times{ind(IQ_M, 0)} = {ind(Q_M, 0)}\) kVAR; kapasitor optimum \(2/3\times{ind(Q_M, 0)} = {ind(QC_23, 0)}\) kVAR pada {ind(2 / 3 * L_KM, 2)} km. Rugi akibat arus reaktif (beban merata = ⅓ I_Q²R) = {ind(LOSSQ_M, 1)} kW → berkurang {ind(8 / 9 * LOSSQ_M, 1)} kW. Dua kapasitor: masing-masing 2/5 Q pada 1/5 dan 3/5 panjang (total 4/5, pengurangan 24/25).",
                   "Pada beban merata, arus reaktif berkurang linear dari pangkal ke ujung; kapasitor yang terlalu dekat pangkal tidak 'menjangkau' arus di hilir, yang terlalu dekat ujung membuat arus kapasitif berlebih di hulu. Titik dua-pertiga menyeimbangkan keduanya. Beban nyata campuran merata dan terpusat; program penempatan kapasitor (capacitor placement) mengoptimalkan ukuran dan letak berdasarkan profil beban tiap penyulang, tetapi aturan 2/3 tetap menjadi penaksir awal yang baik.",
                   [("Q_{beban}", "Daya reaktif total penyulang (kVAR)"), ("P_{rugi,Q}", "Rugi yang disebabkan komponen reaktif arus"), ("n, k", "Jumlah kapasitor dan indeks kapasitor ke-k")])
    isi += figure(4, "Kapasitor tetap dan switched mengikuti kurva beban harian", "Kapasitor tetap 600 kVAR sebesar daya reaktif malam, kapasitor switched 1200 kVAR disambung 08:00–18:00 saat industri beroperasi; daya reaktif dari jaringan (arsir) tetap positif sepanjang hari sehingga tegangan tidak melampaui batas atas.", gambar4())
    isi += cards([
        ("📌", "Tetap (Fixed)", "Ukuran ≈ Q minimum (malam); murah, tanpa kendali. Terlalu besar → tegangan lebih dan pf mendahului saat beban ringan.", None),
        ("🔀", "Switched", "Sakelar vakum + pengendali: kendali waktu (jam kerja), tegangan (masuk bila V < 19,4 kV), arus/VAR, atau suhu; sering dipadukan.", None),
        ("📍", "Beban Terpusat", "Bila sebagian besar Q ada di satu pelanggan besar di ujung, kapasitor di dekat pelanggan itu (bukan 2/3) yang optimum; aturan 2/3 hanya untuk beban merata.", None),
        ("🧮", "Optimasi", "Fungsi sasaran: nilai penghematan rugi + kapasitas − biaya kapasitor; kendala tegangan 19–21 kV sepanjang hari; diselesaikan per penyulang dengan data SCADA.", None),
        ("⚖️", "Rugi vs Tegangan", "Kapasitor untuk rugi (2/3) dan untuk tegangan (di ujung) berbeda letaknya; bila tegangan ujung yang menjadi masalah, geser ke hilir atau tambah regulator.", None),
        ("🔁", "Penyulang Berubah", "Manuver jaringan memindahkan beban antar-penyulang; kapasitor tetap di titik tetap sementara bebannya berpindah, satu lagi alasan kendali otomatis.", None),
    ])
    isi += tabel(["Kapasitor pada beban merata (Q_beban = 100 %)", "Ukuran tiap unit", "Letak", "Total kVAR", "Pengurangan rugi reaktif maks"], [
        ["1 unit", "2/3", "2/3 ℓ", "66,7 %", "88,9 %"],
        ["2 unit", "2/5", "2/5 ℓ dan 4/5 ℓ", "80,0 %", "96,0 %"],
        ["3 unit", "2/7", "2/7, 4/7, 6/7 ℓ", "85,7 %", "98,0 %"],
        ["1 unit di ujung (salah letak)", "2/3", "ℓ", "66,7 %", "66,7 %"],
        ["1 unit 100 % di 2/3 ℓ (terlalu besar)", "1", "2/3 ℓ", "100 %", "66,7 %"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> unit kedua dan ketiga hanya menambah pengurangan rugi 7 % dan 2 %; hampir seluruh manfaat sudah diambil satu kapasitor yang tepat ukuran dan letaknya. Dua baris terakhir memperlihatkan harga salah letak dan salah ukuran: manfaat jatuh ke 2/3. Soal C7, C8, dan C13 memakai Persamaan (4).")
    m += bagian(4, "m-penempatan", "Penempatan dan Ukuran:<br>Aturan Dua-Pertiga, Tetap dan Switched",
                "Berapa kVAR dan di kilometer ke berapa? Untuk beban yang tersebar merata jawabannya klasik: dua-pertiga daya reaktif pada dua-pertiga panjang, seperti dirumuskan Persamaan (4) dan diperlihatkan Gambar 3. Kapan kapasitor harus dilepas dijawab kurva beban harian pada Gambar 4: sebagian tetap, sebagian disambung mengikuti jam kerja.",
                isi, "PENEMPATAN KAPASITOR")

    # 05 — regulator
    isi = figure(5, "Regulator tegangan bertingkat pada pangkal penyulang", f"Rel gardu {ind(V_REL, 1)} kV dan ujung penyulang {ind(V_UJUNG, 1)} kV: regulator ±10 % dengan 32 tingkat (5/8 % per tingkat) menaikkan seluruh tegangan hilir {math.ceil(N_LOG)} tingkat sehingga ujung kembali ≥ 19,8 kV; dengan LDC, titik yang diatur adalah pusat beban, bukan terminal regulator.", gambar5())
    isi += formula(5, "Regulator Tegangan Bertingkat, Tap Trafo, dan LDC", r"V_{out} = V_{in}\,(1 + 0{,}00625\,n), \ n = -16\ldots+16; \qquad n = \dfrac{\ln(V_{target}/V)}{\ln 1{,}00625}; \qquad V_{LDC} = V_{out} - I(R_{set}\cos\varphi + X_{set}\sin\varphi)",
                   rf"Rel {ind(V_REL, 1)} kV → 20 kV: \(n = (20 - {ind(V_REL, 1)})/0{{,}}125 = {ind(N_STEP, 1)}\) → {math.ceil(N_STEP)} tingkat. Ujung {ind(V_UJUNG, 1)} → 19,8 kV: \(n = \ln(19{{,}}8/{ind(V_UJUNG, 1)})/\ln 1{{,}}00625 = {ind(N_LOG, 2)}\) → {math.ceil(N_LOG)} tingkat, dan rel ikut naik ke {ind(V_REL * 1.00625 ** math.ceil(N_LOG), 2)} kV (harus ≤ 21 kV). Trafo distribusi 20 kV/400 V bertap ±2×2,5 % (tanpa beban) menyelesaikan sisanya per gardu.",
                   "Regulator adalah autotrafo dengan tap yang berubah sendiri (OLTC) mengikuti tegangan; ia menggeser seluruh profil tegangan hilir naik-turun tanpa mengubah rugi, berbeda dari kapasitor yang mengubah arus. LDC (line drop compensation) membuat regulator 'melihat' tegangan di pusat beban: pada beban berat ia menaikkan tegangan lebih banyak, pada beban ringan lebih sedikit, sehingga pelanggan dekat gardu tidak kelebihan tegangan. Kapasitor dan regulator saling melengkapi: kapasitor untuk rugi dan Q, regulator untuk profil tegangan.",
                   [("n", "Nomor tingkat (positif menaikkan)"), ("V_{target}", "Tegangan yang diinginkan di titik regulasi"), ("R_{set}, X_{set}", "Setelan LDC yang meniru impedansi ke pusat beban")])
    isi += cards([
        ("🎚️", "OLTC Trafo GI", "Trafo 150/20 kV bertap ±10 % on-load: mengatur rel 20 kV seluruh gardu; pengendali AVR dengan setpoint, bandwidth ±1,25 %, dan tunda waktu 30–60 s.", None),
        ("📍", "Regulator Penyulang", "Regulator satu fasa 32 tingkat dipasang di tengah penyulang panjang (> 15 km) yang ujungnya tidak terjangkau OLTC gardu; ketiga fasa diatur terpisah.", None),
        ("🧭", "Zona Regulasi", "Tiap regulator memegang satu zona; regulator hilir harus lebih 'sabar' (tunda lebih lama) agar tidak berebut dengan hulu (hunting).", None),
        ("🔁", "Kapasitor + Regulator", "Kapasitor switched yang masuk menaikkan tegangan; regulator lalu menurunkan tap: keduanya harus dikoordinasi lewat setelan dan tunda waktu.", None),
        ("🌞", "PLTS Atap", "Pembangkit tersebar di siang hari membalik aliran daya dan menaikkan tegangan ujung; regulator dengan LDC klasik bisa salah arah, memerlukan mode dua arah.", None),
        ("💡", "Sisi Pelanggan", "Stabilizer/AVR di pabrik adalah regulator yang sama dalam skala kecil; jauh lebih murah menyelesaikannya di penyulang untuk semua pelanggan.", None),
    ])
    isi += tabel(["Alat pengatur tegangan", "Rentang", "Langkah", "Waktu tanggap", "Mengubah rugi?", "Letak"], [
        ["OLTC trafo 150/20 kV", "±10 %", "1,25 % (17 tap)", "30–60 s", "tidak", "gardu induk"],
        ["Regulator bertingkat", "±10 %", "0,625 % (32 tingkat)", "30–60 s", "tidak", "tengah penyulang"],
        ["Kapasitor switched", "+1–3 % di titiknya", "per bank", "menit", "ya (turun)", "2/3 penyulang / beban"],
        ["Tap trafo distribusi", "±5 %", "2,5 %", "manual (tanpa beban)", "tidak", "gardu distribusi"],
        ["SVC / STATCOM", "±ΔQ dinamis", "kontinu", "ms", "ya", "pelanggan flicker / rel GI"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> hanya kapasitor (dan kompensator dinamis) yang sekaligus menurunkan rugi; regulator dan tap hanya memindahkan profil tegangan. Rancangan penyulang yang baik memakai kapasitor untuk Q dan rugi, lalu regulator untuk sisa masalah tegangan. Soal C9, C10, dan C14 memakai Persamaan (5).")
    m += bagian(5, "m-regulator", "Regulator Tegangan<br>Bertingkat dan Tap Trafo",
                "Kapasitor mengurangi jatuh tegangan tetapi tidak dapat mengaturnya; untuk penyulang panjang dengan beban yang berubah sepanjang hari diperlukan alat yang benar-benar menggeser tegangan: regulator bertingkat dan tap transformator. Persamaan (5) menghitung tingkat yang diperlukan dan memperkenalkan kompensasi jatuh tegangan (LDC); Gambar 5 memperlihatkan kedudukannya di penyulang.",
                isi, "REGULATOR TEGANGAN")

    # 06 — ekonomi & praktik
    isi = formula(6, "Nilai Ekonomi Kompensasi", r"E_{hemat} = \Delta P_{puncak}\times8760\times F_{rugi}, \qquad F_{rugi} \approx 0{,}3F_B + 0{,}7F_B^2, \qquad \text{kapasitas terbebas} = S_1 - S_2 = P\left(\dfrac{1}{\cos\varphi_1} - \dfrac{1}{\cos\varphi_2}\right)",
                   rf"Penyulang contoh: \(\Delta P = {ind(LOSS1, 1)} - {ind(LOSS2, 1)} = {ind(LOSS1 - LOSS2, 1)}\) kW; dengan faktor rugi {ind(LSF, 2)}, \(E = {ind(LOSS1 - LOSS2, 1)}\times8760\times{ind(LSF, 2)} = {ind(E_HEMAT / 1000, 0)}\) MWh/tahun (≈ Rp {ind(E_HEMAT * 1200 / 1e6, 0)} juta pada Rp 1.200/kWh). Kapasitas trafo terbebas {ind(P_LOAD * 1e3 / PF1 - P_LOAD * 1e3 / PF2, 0)} kVA; harga bank {ind(QC, 0)} kVAR ± Rp 300–400 juta: balik modal 2–3 tahun dari penghematan rugi saja.",
                   "Faktor rugi menerjemahkan rugi puncak menjadi rugi rata-rata sepanjang tahun: beban tidak selalu puncak, dan rugi ∝ I² membuat rugi rata-rata jauh di bawah rugi puncak. Manfaat kedua, kapasitas trafo dan penyulang yang terbebas, sering lebih bernilai daripada rugi karena menunda investasi trafo baru bertahun-tahun.",
                   [("F_{rugi}", "Faktor rugi (loss factor) tahunan"), ("F_B", "Faktor beban tahunan"), ("S_1, S_2", "Daya semu sebelum dan sesudah (kVA)")])
    isi += cards([
        ("💰", "Tiga Manfaat", "Penghematan energi rugi, kapasitas trafo/penyulang terbebas (menunda investasi), dan tegangan pelanggan lebih baik (kurang keluhan, motor lebih dingin).", None),
        ("📉", "Penurunan Manfaat", "Setiap kVAR berikutnya menghemat lebih sedikit; optimum ekonomi biasanya di pf 0,9–0,95 penyulang, bukan 1,0.", None),
        ("⚠️", "Feroresonansi", "Kapasitor di penyulang yang diputus satu fasa (sekring putus) dapat beresonansi dengan trafo tanpa beban: tegangan lebih merusak; hindari kapasitor di hilir sekring satu fasa.", None),
        ("🔊", "Switching Transien", "Menyambung bank kapasitor menimbulkan lonjakan arus dan tegangan (inrush, back-to-back) yang mengganggu VSD pelanggan; sakelar sinkron atau reaktor pembatas menjinakkannya.", None),
        ("📡", "Pemantauan", "Pengendali modern melaporkan status, kVAR, dan tegangan lewat SCADA; VVO (volt-VAR optimization) mengoordinasi seluruh kapasitor dan regulator penyulang.", None),
        ("🔗", "Ke Modul Berikut", "Modul 11–12 membahas struktur sistem distribusi dan aliran dayanya; kompensasi di sini menjadi salah satu peralatan yang dimodelkan di sana.", None),
    ])
    isi += tabel(["Penyulang contoh: pilihan kompensasi", "Q_C (kVAR)", "Letak", "Rugi puncak (kW)", "Hemat (MWh/th)", "ΔV ujung (%)"],
                 [[nama, ind(q, 0), letak, ind(rugi, 0), ind((LOSS1 - rugi) * 8760 * LSF / 1000, 0), ind(dv, 1)] for nama, q, letak, rugi, dv in
                  [("Tanpa kapasitor", 0, "—", LOSS1, DV1 / VF * 100),
                   ("1000 kVAR tetap di ujung", 1000, "8 km", 3 * (P_LOAD * 1e6 / (SQ3 * 20e3) / (P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 1000))) ** 2 * R_L / 1000, (P_LOAD * 1e6 / (SQ3 * 20e3) / (P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 1000))) * (R_L * P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 1000) + X_L * (Q1 - 1000) / math.hypot(P_LOAD * 1e3, Q1 - 1000)) / VF * 100),
                   (f"{ind(QC, 0)} kVAR (600 tetap + switched) di ujung", QC, "8 km", LOSS2, DV2 / VF * 100),
                   ("3000 kVAR tetap di ujung (berlebih)", 3000, "8 km", 3 * (P_LOAD * 1e6 / (SQ3 * 20e3) / (P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 3000))) ** 2 * R_L / 1000, (P_LOAD * 1e6 / (SQ3 * 20e3) / (P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 3000))) * (R_L * P_LOAD * 1e3 / math.hypot(P_LOAD * 1e3, Q1 - 3000) + X_L * (Q1 - 3000) / math.hypot(P_LOAD * 1e3, Q1 - 3000)) / VF * 100)]])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> di pabrik, keputusan kompensasi sama persis dalam skala lebih kecil: bank kapasitor otomatis di panel utama (untuk denda kVARh dan kapasitas trafo) dan kapasitor tetap di terminal motor besar (untuk kabel dan tegangan start). Dua jebakan yang sama juga berlaku: resonansi harmonik dengan VSD dan self-excitation motor yang dilepas bersama kapasitornya. Soal C12 dan C15 memakai Persamaan (6) dan perhitungan bank kapasitor.")
    m += bagian(6, "m-praktik", "Nilai Ekonomi<br>dan Jebakan Praktik",
                "Kompensasi adalah keputusan investasi: berapa rupiah yang dihemat dari rugi dan kapasitas, dibandingkan harga bank kapasitor, dan risiko apa yang ikut dibeli. Persamaan (6) menghitung nilai tahunannya lewat faktor rugi, dan tabel di bagian ini membandingkan beberapa pilihan pada penyulang contoh, termasuk yang berlebihan.",
                isi, "EKONOMI DAN PRAKTIK")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Profil Tegangan dan Rugi Penyulang Beban Merata dengan Satu Kapasitor", "cvPenyulang",
                     [("sl_py_l", "v_py_l", "Panjang penyulang (km)", 4, 20, 1, 10, "10"), ("sl_py_i", "v_py_i", "Arus pangkal (A)", 50, 400, 10, 200, "200"), ("sl_py_pf", "v_py_pf", "Faktor daya beban", 0.6, 1.0, 0.01, 0.8, "0.80"), ("sl_py_qc", "v_py_qc", "Kapasitor Q_C (kVAR)", 0, 5000, 100, 1500, "1500"), ("sl_py_pos", "v_py_pos", "Letak kapasitor (fraksi panjang)", 0, 1, 0.01, 0.67, "0.67")],
                     "btnPenyulang", "togglePenyulang", "penyulangInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Merah profil tegangan tanpa kapasitor, hijau dengan kapasitor (garis ungu letaknya); garis merah putus-putus batas 19 kV. Readout memberi rugi kedua keadaan dan ukuran optimum aturan 2/3.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Geser kapasitor ke ujung</strong>: tegangan ujung naik paling tinggi, tetapi rugi tidak minimum. (2) Atur Q_C dan letak sesuai readout 2/3: rugi minimum. (3) Q_C terlalu besar membuat profil naik di atas 20 kV (tegangan lebih). Soal C4–C8.")
    isi += anim_panel(2, "amber", r"Aturan Dua-Pertiga: Pengurangan Rugi terhadap Ukuran, Letak, dan Sebaran Beban", "cvDuaPertiga",
                      [("sl_dp_c", "v_dp_c", "Ukuran kapasitor (fraksi I_Q)", 0.1, 1.2, 0.01, 0.67, "0.67"), ("sl_dp_lam", "v_dp_lam", "Sebaran beban λ (1 merata, 0 terpusat ujung)", 0, 1, 0.05, 1.0, "1.00")],
                      "btnDuaPertiga", "toggleDuaPertiga", "duaPertigaInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kurva pengurangan rugi reaktif terhadap letak kapasitor untuk beberapa ukuran; kurva hijau tebal adalah ukuran yang Anda pilih, titik berkedip optimumnya.<br>Amati: (1) <strong style=\"color:var(--amber)\">Beban merata, ukuran 2/3</strong>: optimum di 67 % dengan 88,9 %. (2) Geser λ ke 0 (beban terpusat di ujung): optimum bergeser ke ujung dengan ukuran 100 %. (3) Ukuran > 1 selalu lebih buruk: arus kapasitif berlebih. Soal C7, C8, dan C13.")
    isi += anim_panel(3, "green", r"Kurva Beban Harian: Kapasitor Tetap + Switched dan Faktor Daya di Titik Sambung", "cvHarian",
                      [("sl_hr_qf", "v_hr_qf", "Kapasitor tetap (kVAR)", 0, 2000, 50, 600, "600"), ("sl_hr_qs", "v_hr_qs", "Kapasitor switched (kVAR)", 0, 3000, 50, 1200, "1200"), ("sl_hr_on", "v_hr_on", "Jam masuk", 0, 23, 1, 8, "8"), ("sl_hr_off", "v_hr_off", "Jam lepas", 1, 24, 1, 18, "18")],
                      "btnHarian", "toggleHarian", "harianInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Merah Q beban penyulang industri sepanjang hari, hijau Q kapasitor (tetap + switched), arsir kuning Q yang masih diambil dari jaringan; titik berjalan menunjukkan jam dan pf saat itu (merah bila pf mendahului).<br>Amati: (1) <strong style=\"color:var(--green)\">Naikkan kapasitor tetap ke 1800 kVAR</strong>: malam hari Q negatif, tegangan naik. (2) Pilih jam switching yang menutup puncak siang tanpa menyisakan Q negatif. (3) Readout memberi jam mendahului per hari. Soal C1 dan C12.")
    isi += anim_panel(4, "pink", r"Regulator Tegangan Bertingkat dengan LDC pada Penyulang 12 km", "cvRegulator",
                      [("sl_rg_vs", "v_rg_vs", "Tegangan sumber (pu dari 20 kV)", 0.92, 1.05, 0.01, 0.98, "0.98"), ("sl_rg_i", "v_rg_i", "Arus pangkal (A)", 50, 400, 10, 250, "250"), ("sl_rg_set", "v_rg_set", "Setpoint titik regulasi (pu)", 0.95, 1.05, 0.005, 1.0, "1.000"), ("sl_rg_ldc", "v_rg_ldc", "Titik regulasi LDC (fraksi panjang)", 0, 1, 0.05, 0.5, "0.50")],
                      "btnRegulator", "toggleRegulator", "regulatorInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Merah profil tanpa regulator, hijau dengan regulator di pangkal yang memilih tingkat (5/8 %, ±16) agar tegangan di titik LDC (garis ungu) sama dengan setpoint; garis merah putus-putus batas 19 dan 21 kV.<br>Amati: (1) <strong style=\"color:var(--pink)\">Naikkan arus pangkal</strong>: regulator menambah tingkat, seluruh profil terangkat, tetapi pangkal dapat melampaui 21 kV. (2) Geser LDC ke ujung: ujung tepat di setpoint, pangkal terlalu tinggi; ke pangkal: ujung tetap rendah. (3) Tegangan sumber rendah + beban berat dapat melampaui 16 tingkat. Soal C9, C10, dan C14.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur 8 km, 144 A (setara 4 MW pf 0,8 di ujung tidak persis merata, tetapi bandingkan kecenderungannya), lalu cari Q_C dan letak yang membuat rugi minimum dan bandingkan dengan aturan 2/3 di readout. Pada Animasi 3 atur tetap {ind(QC * 0.36, 0)} dan switched {ind(QC * 0.64, 0)} kVAR dan periksa tidak ada jam mendahului.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Kompensasi Distribusi",
                "Geser ukuran dan letak kapasitor, sebaran beban, jadwal switching, dan setelan regulator, lalu amati profil tegangan penyulang, rugi, faktor daya sepanjang hari, dan tingkat regulator yang dipilih. Empat animasi ini memvisualkan Persamaan (1)–(5).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (kVAR, A, kW, V, %, kWh, µF) dan jumlah desimal yang diminta.")
    isi += kode("Cell 1 — Kapasitor Shunt: Q_C, Arus, Rugi, dan Kapasitas Terbebas", f'''import numpy as np

tanpf = lambda pf: np.tan(np.arccos(pf))
P, pf1, pf2, VL, R = {ind(P_LOAD, 0)}e6, {ind(PF1, 1).replace(",", ".")}, {ind(PF2, 2).replace(",", ".")}, 20e3, {ind(R_L, 1).replace(",", ".")}
Qc = P*(tanpf(pf1) - tanpf(pf2))/1e3                          # kVAR (Persamaan 2)
I1, I2 = P/(np.sqrt(3)*VL*pf1), P/(np.sqrt(3)*VL*pf2)
L1, L2 = 3*I1**2*R/1e3, 3*I2**2*R/1e3                          # kW
print(f"Q_C = {{Qc:.2f}} kVAR; I: {{I1:.1f}} -> {{I2:.1f}} A ({{(1-I2/I1)*100:.1f}} %); rugi: {{L1:.1f}} -> {{L2:.1f}} kW ({{(1-L2/L1)*100:.1f}} %)")
print(f"Kapasitas terbebas = {{P/1e3/pf1 - P/1e3/pf2:.0f}} kVA")
for pf in [0.6, 0.7, 0.8, 0.9, 0.95, 1.0]:
    I = P/(np.sqrt(3)*VL*pf)
    print(f"pf {{pf:.2f}}: I = {{I:6.1f}} A, rugi = {{3*I**2*R/1e3:6.1f}} kW, rugi relatif thd pf 0,6 = {{(0.6/pf)**2*100:5.1f}} %")''')
    isi += kode("Cell 2 — Jatuh Tegangan, Kenaikan oleh Kapasitor, dan Profil Penyulang Beban Merata", f'''import numpy as np
import matplotlib.pyplot as plt

VL, R, X = 20e3, {ind(R_L, 1).replace(",", ".")}, {ind(X_L, 1).replace(",", ".")}
Vf = VL/np.sqrt(3)
def dV(I, pf, R, X): return I*(R*pf + X*np.sqrt(1 - pf**2))   # Persamaan 3
I1, I2 = {ind(I1, 2).replace(",", ".")}, {ind(I2, 2).replace(",", ".")}
print(f"dV sebelum = {{dV(I1, {ind(PF1, 1).replace(",", ".")}, R, X):.1f}} V ({{dV(I1, {ind(PF1, 1).replace(",", ".")}, R, X)/Vf*100:.2f}} %), sesudah = {{dV(I2, {ind(PF2, 2).replace(",", ".")}, R, X):.1f}} V ({{dV(I2, {ind(PF2, 2).replace(",", ".")}, R, X)/Vf*100:.2f}} %)")
Qc = {ind(QC, 1).replace(",", ".")}e3
print(f"kenaikan oleh kapasitor = Qc*X/V^2 = {{Qc*X/VL**2*100:.3f}} %  (I_C = {{Qc/(np.sqrt(3)*VL):.1f}} A)")

# profil beban merata 10 km, 200 A pf 0,8, kapasitor di posisi p
r, x, L, I0, pf = 0.4, 0.35, 10.0, 200.0, 0.8
Ip, Iq = I0*pf, I0*np.sqrt(1 - pf**2)
def profil(Qc_kvar, p, n=100):
    Ic = Qc_kvar/(np.sqrt(3)*20); V = [Vf]
    for s in range(n):
        pos = s/n; iq = Iq*(1 - pos) - (Ic if pos < p else 0); ip = Ip*(1 - pos)
        V.append(V[-1] - (r*L/n*ip + x*L/n*iq))
    return np.array(V)/Vf
xk = np.linspace(0, L, 101)
plt.figure(figsize=(8, 4))
for Qc_k, p, lab in [(0, 0, 'tanpa C'), (1500, 0.67, '1500 kVAR @ 2/3'), (1500, 1.0, '1500 kVAR @ ujung')]:
    V = profil(Qc_k, p); plt.plot(xk, V*20, label=f'{{lab}}: ujung {{V[-1]*20:.2f}} kV')
plt.axhline(19, ls=':', color='r'); plt.xlabel('km'); plt.ylabel('kV'); plt.legend(); plt.grid(True); plt.title('Profil tegangan penyulang'); plt.show()''')
    isi += kode("Cell 3 — Aturan Dua-Pertiga dan Pengurangan Rugi terhadap Ukuran dan Letak", f'''import numpy as np

def reduksi_rugi(c, p, lam=1.0, n=400):
    """Pengurangan rugi reaktif relatif: kapasitor c (fraksi I_Q) di posisi p; beban I_Q(x) = 1 - lam*x."""
    xk = (np.arange(n) + 0.5)/n
    iq0 = 1 - lam*xk
    iq = iq0 - np.where(xk < p, c, 0)
    return 1 - np.sum(iq**2)/np.sum(iq0**2)

for c in [1/3, 1/2, 2/3, 1.0]:
    p_grid = np.linspace(0, 1, 201)
    red = [reduksi_rugi(c, p) for p in p_grid]
    k = int(np.argmax(red))
    print(f"C = {{c:.3f}} I_Q: optimum di {{p_grid[k]*100:5.1f}} % panjang, pengurangan {{red[k]*100:5.1f}} %")
print(f"Teori: 2/3 di 2/3 -> 8/9 = {{8/9*100:.1f}} %")

# penyulang contoh beban merata (Persamaan 4)
I0, pf, VL, R = {ind(I_MERATA, 0)}.0, {ind(PF_M, 1).replace(",", ".")}, 20.0, {ind(R_L, 1).replace(",", ".")}
Iq = I0*np.sqrt(1 - pf**2); Q = np.sqrt(3)*VL*Iq
print(f"I_Q = {{Iq:.1f}} A, Q_beban = {{Q:.0f}} kVAR, kapasitor optimum = {{2/3*Q:.0f}} kVAR; rugi reaktif merata = I_Q^2 R = {{Iq**2*R/1e3:.2f}} kW -> berkurang {{8/9*Iq**2*R/1e3:.2f}} kW")
print(f"Dua kapasitor: masing-masing {{2/5*Q:.0f}} kVAR di 20 % dan 60 % -> pengurangan {{24/25*100:.0f}} %")''')
    isi += kode("Cell 4 — Regulator Bertingkat, Penghematan Energi Tahunan, dan Bank Kapasitor", f'''import numpy as np

# regulator (Persamaan 5)
V_rel, V_ujung, step = {ind(V_REL, 1).replace(",", ".")}, {ind(V_UJUNG, 1).replace(",", ".")}, 0.00625
n_rel = (20 - V_rel)/(step*20)
n_ujung = np.log(19.8/V_ujung)/np.log(1 + step)
print(f"rel {{V_rel}} -> 20 kV: n = {{n_rel:.2f}} -> {{int(np.ceil(n_rel))}} tingkat; ujung {{V_ujung}} -> 19,8 kV: n = {{n_ujung:.2f}} -> {{int(np.ceil(n_ujung))}} tingkat (rel menjadi {{V_rel*(1+step)**np.ceil(n_ujung):.2f}} kV)")
print(f"tap trafo +2,5 %: V2 = {{19.5e3/(50*1.025):.1f}} V; tap -2,5 %: {{19.5e3/(50*0.975):.1f}} V (V1 = 19,5 kV)")

# ekonomi (Persamaan 6)
L1, L2, F_beban = {ind(LOSS1, 2).replace(",", ".")}, {ind(LOSS2, 2).replace(",", ".")}, 0.5
F_rugi = 0.3*F_beban + 0.7*F_beban**2
E = (L1 - L2)*8760*F_rugi
print(f"faktor rugi = {{F_rugi:.3f}}; hemat = {{E/1e3:.1f}} MWh/tahun = Rp {{E*1200/1e6:.0f}} juta/tahun @ Rp 1.200/kWh")

# bank kapasitor delta 20 kV
Qc, VL, w = {ind(QC, 1).replace(",", ".")}e3, 20e3, 2*np.pi*50
print(f"bank {{Qc/1e3:.0f}} kVAR: I = {{Qc/(np.sqrt(3)*VL):.2f}} A; C per fasa (delta) = {{Qc/(3*w*VL**2)*1e6:.3f}} uF; pada 19 kV hanya memberi {{Qc/1e3*(19/20)**2:.0f}} kVAR")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: Q_C = {ind(QC, 0)} kVAR, rugi {ind(LOSS1, 0)} → {ind(LOSS2, 0)} kW, ΔV {ind(DV1 / VF * 100, 1)} → {ind(DV2 / VF * 100, 1)} %, kapasitor optimum {ind(QC_23, 0)} kVAR, dan {math.ceil(N_LOG)} tingkat regulator. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: ukuran kapasitor dan efeknya pada arus dan rugi, jatuh tegangan dan profil penyulang, aturan dua-pertiga dengan pemeriksaan numerik, serta regulator, ekonomi, dan bank kapasitor. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "T. Gönen", "Electric Power Distribution Engineering", ", Third Edition. CRC Press, 2014.", "Bab 8 (application of capacitors to distribution systems: aturan 2/3, tetap vs switched, ekonomi) dan Bab 9 (regulasi tegangan distribusi): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "W. H. Kersting", "Distribution System Modeling and Analysis", ", Fourth Edition. CRC Press, 2018.", "Bab regulator tegangan bertingkat dan LDC serta pemodelan kapasitor shunt pada analisis penyulang.")
    refs += pm_ref(3, "violet", "168,85,247", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 14 (distribusi: kompensasi kapasitor, regulasi tegangan, dan pembangkit tersebar).")
    refs += pm_ref(4, "green", "0,224,158", "Zuhal", "Dasar Tenaga Listrik dan Elektronika Daya", ". Gramedia, Jakarta.", "Bab perbaikan faktor daya dan pengaturan tegangan pada jaringan distribusi dalam bahasa mata kuliah ini.")
    refs += pm_ref(5, "pink", "236,72,153", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab sistem distribusi: kapasitor, regulator, dan rugi; pustaka utama RPS.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk kapasitor shunt pada penyulang, aturan dua-pertiga, kapasitor tetap dan switched, regulator tegangan bertingkat, dan ekonomi kompensasi. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> SPLN 1:1995 (tegangan standar) dan SPLN tentang kapasitor pada jaringan tegangan menengah memuat batas tegangan dan ketentuan pemasangan; IEEE Std 1036 (guide for application of shunt power capacitors) memuat pedoman ukuran, switching, dan proteksi bank; katalog pabrikan kapasitor tegangan menengah memberi unit 100–400 kVAR beserta pengendali otomatis. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Q_C = P(tan φ₁ − tan φ₂)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">ΔV_naik ≈ Q_C·X/V²</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">2/3 Q pada 2/3 ℓ</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">n = ln(V_t/V)/ln 1,00625</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">E = ΔP·8760·F_rugi</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Kompensasi</em><br>Sistem Distribusi</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar kVAR perbaikan faktor daya, penurunan arus dan rugi, jatuh dan kenaikan tegangan, aturan dua-pertiga, kapasitor tetap dan switched, regulator bertingkat, tap trafo, penghematan energi, dan bank kapasitor. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Tujuan utama memasang <strong>kapasitor shunt</strong> pada penyulang distribusi adalah...",
     ["Menaikkan daya aktif yang dapat dijual", "Menurunkan frekuensi sistem", "Menaikkan resistansi penyulang", "Memasok daya reaktif beban secara lokal sehingga arus reaktif penyulang, rugi, dan jatuh tegangan berkurang serta kapasitas trafo terbebas"],
     "Tujuan kapasitor shunt"),
    ("Kenaikan tegangan di titik pemasangan kapasitor shunt dapat ditaksir dengan...",
     ["\\(\\Delta V \\approx Q_C R/V^2\\)", "\\(\\Delta V \\approx Q_C X/V^2\\), dengan X reaktansi dari sumber ke titik kapasitor", "\\(\\Delta V \\approx Q_C/(V I)\\)", "\\(\\Delta V \\approx V^2/(Q_C X)\\)"],
     "Kenaikan tegangan oleh kapasitor"),
    ("Menurut <strong>aturan dua-pertiga</strong>, untuk penyulang berbeban merata satu kapasitor optimum berukuran...",
     ["2/3 arus reaktif total, dipasang pada 2/3 panjang penyulang", "Seluruh arus reaktif, dipasang di ujung", "1/3 arus reaktif, dipasang di pangkal", "1/2 arus reaktif, dipasang di tengah"],
     "Aturan dua-pertiga"),
    ("Kapasitor <strong>switched</strong> (bersakelar) diperlukan karena...",
     ["Kapasitor tetap tidak dapat memasok daya reaktif", "Kapasitor tetap hanya bekerja pada siang hari", "Daya reaktif beban berubah sepanjang hari; kapasitor yang cukup untuk siang menjadi berlebih di malam hari dan menaikkan tegangan", "Kapasitor switched lebih murah daripada kapasitor tetap"],
     "Kapasitor switched"),
    ("Bila daya aktif tetap dan faktor daya penyulang dinaikkan dari 0,7 ke 0,95, rugi daya penyulang...",
     ["Tetap, karena daya aktif tidak berubah", "Turun sebanding pf, menjadi 74 %", "Naik karena kapasitor menambah arus", "Turun kuadratis (∝ 1/pf²), menjadi sekitar 54 % dari semula"],
     "Rugi vs pf"),
    ("<strong>Regulator tegangan bertingkat</strong> pada penyulang adalah...",
     ["Kapasitor seri yang mengubah reaktansi", "Autotrafo bertap ±10 % dalam 32 tingkat (5/8 % per tingkat) yang berubah otomatis mengikuti tegangan", "Reaktor shunt yang menyerap daya reaktif", "Trafo distribusi dengan tap manual ±5 %"],
     "Regulator bertingkat"),
    ("<strong>Line drop compensation</strong> (LDC) pada regulator berfungsi...",
     ["Mengatur tegangan di pusat beban yang jauh dengan meniru jatuh tegangan R dan X penyulang dari arus yang diukur", "Mengurangi rugi penyulang", "Menyambung kapasitor secara otomatis", "Memutus penyulang saat hubung singkat"],
     "LDC"),
    ("Kapasitor <strong>seri</strong> jarang dipakai pada sistem distribusi karena...",
     ["Tidak mampu menaikkan tegangan", "Harganya jauh lebih mahal daripada kapasitor shunt", "Risiko feroresonansi, tegangan lebih saat hubung singkat, dan proteksi yang rumit; dipakai hanya untuk beban berfluktuasi tertentu", "Hanya bekerja pada tegangan tinggi"],
     "Kapasitor seri di distribusi"),
    ("Daya reaktif yang diberikan kapasitor berubah terhadap tegangan sebagai...",
     ["Tidak bergantung tegangan", "Berbanding terbalik tegangan", "Sebanding tegangan", "Sebanding kuadrat tegangan: pada tegangan 10 % di bawah nominal kapasitor hanya memberi 81 % kVAR-nya"],
     "Q_C ∝ V²"),
    ("Kapasitor yang dipasang <strong>di rel gardu induk 20 kV</strong>, dibandingkan di dekat beban pada penyulang...",
     ["Lebih efektif menurunkan rugi penyulang", "Membebaskan trafo dan sistem hulu, tetapi tidak menurunkan rugi maupun jatuh tegangan sepanjang penyulang", "Menaikkan tegangan ujung penyulang lebih banyak", "Tidak berpengaruh sama sekali"],
     "Letak kapasitor"),
]

COMP_EZ_LABELS = ["kVAR perbaikan faktor daya penyulang", "Arus sesudah pf naik (P tetap)", "Rugi sesudah pf naik (∝ 1/pf²)", "Jatuh tegangan penyulang I(R cos φ + X sin φ)", "Kenaikan tegangan Q_C·X/V²",
                  "Ukuran kapasitor untuk kenaikan target", "Kapasitor optimum aturan 2/3", "Pengurangan rugi 8/9", "Tingkat regulator (linear)", "Tegangan sekunder pada tap +2,5 %"]
COMP_HARD_LABELS = ["ΔV sebelum dan sesudah kompensasi (%)", "Penghematan energi tahunan (kWh)", "Dua kapasitor optimum (2/5 masing-masing)",
                    "Tingkat regulator logaritmik", "Arus dan C per fasa bank Δ"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
LF, RF_KM, XF_KM = 12.0, 0.4, 0.35
RF, XF = RF_KM * LF, XF_KM * LF
PF_MW, PFF = 6.0, 0.78
I_F = PF_MW * 1e6 / (SQ3 * 20e3 * PFF)
IQ_F = I_F * math.sin(math.acos(PFF))
Q_F = SQ3 * 20 * IQ_F
DV_F = I_F * (RF * PFF + XF * math.sin(math.acos(PFF))) / 2          # beban merata: 1/2
LOSS_F = 3 * I_F ** 2 * RF / 3 / 1000                                  # beban merata: 1/3
V_UJUNG_F = (VF - DV_F) * SQ3 / 1000
QC_F = 2 / 3 * Q_F
POS_F = 2 / 3 * LF
IC_F = QC_F / (SQ3 * 20)
LOSSQ_F = 3 * IQ_F ** 2 * RF / 3 / 1000
LOSS_F2 = LOSS_F - 8 / 9 * LOSSQ_F
DV_RISE_F = IC_F * XF_KM * POS_F                                       # V per fasa di titik kapasitor (X hulu)
V_UJUNG_F2 = (VF - DV_F + DV_RISE_F) * SQ3 / 1000
Q_MALAM = 0.35 * Q_F
V_NIGHT_RISE = (QC_F - Q_MALAM) * 1e3 * XF_KM * POS_F / (20e3) ** 2 * 100
N_REG = math.log(19.8 / V_UJUNG_F) / math.log(1.00625)

FQ_JUDUL = [
    "Hitung arus, daya reaktif, jatuh tegangan, dan rugi penyulang kawasan industri 12 km: mengapa ujungnya di bawah 19 kV?",
    "Rancang kapasitor dengan aturan dua-pertiga: ukuran, letak, tegangan ujung, dan rugi sesudahnya; berapa yang harus switched?",
    "Regulator di pangkal atau kapasitor? Bandingkan keduanya untuk tegangan ujung dan rugi, lalu susun urutan pemasangan yang tepat.",
]
FQ_RINGKAS = [
    f"Penyulang 20 kV {ind(LF, 0)} km (r {ind(RF_KM, 1)}, x {ind(XF_KM, 2)} Ω/km) berbeban merata {ind(PF_MW, 0)} MW pf {ind(PFF, 2)}: arus pangkal, I_Q, Q_beban (Persamaan 1); jatuh tegangan beban merata = ½ I(R cos φ + X sin φ) dan rugi = ⅓ · 3I²R (Persamaan 3 dan Modul 6); tegangan ujung terhadap batas 19 kV.",
    f"Aturan 2/3 (Persamaan 4): Q_C = 2/3 Q_beban di 2/3 panjang; kenaikan tegangan di titik dan ujung (I_C·X hulu, Persamaan 3); rugi sesudahnya (pengurangan 8/9 rugi reaktif); Q malam ≈ 35 % → bagian tetap vs switched agar tidak ada tegangan lebih malam.",
    f"Regulator bertingkat (Persamaan 5): tingkat untuk mengangkat ujung {ind(V_UJUNG_F, 2)} → 19,8 kV dan tegangan pangkal yang dihasilkan; regulator tidak mengubah rugi; kapasitor mengubah rugi dan tegangan; urutan: kapasitor 2/3 dulu, regulator/LDC untuk sisa; koordinasi tunda waktu.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Penyulang 20 kV <b>{ind(LF, 0)} km</b> (AAAC 150: r = {ind(RF_KM, 1)} Ω/km, x = {ind(XF_KM, 2)} Ω/km) memasok kawasan industri dengan beban yang tersebar merata sepanjang penyulang, total <b>{ind(PF_MW, 0)} MW pada pf {ind(PFF, 2)}</b> di jam puncak. Rel gardu dijaga 20 kV. Hitung arus pangkal dan komponen reaktifnya, daya reaktif beban (Persamaan 1), jatuh tegangan sampai ujung (untuk beban merata = setengah jatuh tegangan beban terpusat, Persamaan 3), tegangan ujung, dan rugi penyulang (beban merata = sepertiga 3I²R). Bandingkan tegangan ujung dengan batas 19 kV dan jelaskan peran arus reaktif di dalamnya.",
            ["I = P/(√3·V·pf)", "ΔV_merata = ½·I(R cos φ + X sin φ)", "rugi_merata = ⅓·3I²R"],
            f"Tegangan ujung penyulang dan rugi puncaknya kira-kira...",
            [f"{ind(20 - 2 * DV_F * SQ3 / 1000, 2)} kV dan {ind(3 * LOSS_F, 0)} kW (seolah beban terpusat di ujung)", f"20 kV dan 0 kW, karena beban tersebar", f"{ind(V_UJUNG_F, 2)} kV (ΔV {ind(DV_F / VF * 100, 1)} %) dan {ind(LOSS_F, 0)} kW: di bawah 19 kV, sebagian besar ΔV dari X·I_Q", f"{ind(V_UJUNG_F, 2)} kV dan {ind(LOSS_F, 0)} kW, tetapi arus reaktif tidak berperan pada tegangan"],
            f"✅ Tepat! \\(I = {ind(PF_MW, 0)}\\times10^6/(\\sqrt{{3}}\\times20\\times10^3\\times{ind(PFF, 2)}) = {ind(I_F, 1)}\\) A, \\(I_Q = {ind(IQ_F, 1)}\\) A, \\(Q = {ind(Q_F, 0)}\\) kVAR. R = {ind(RF, 1)} Ω, X = {ind(XF, 1)} Ω: \\(\\Delta V = \\tfrac{{1}}{{2}}\\times{ind(I_F, 1)}({ind(RF, 1)}\\times{ind(PFF, 2)} + {ind(XF, 1)}\\times{ind(math.sin(math.acos(PFF)), 3)}) = {ind(DV_F, 0)}\\) V/fasa = {ind(DV_F / VF * 100, 2)} % → ujung {ind(V_UJUNG_F, 2)} kV; suku X·I_Q menyumbang {ind(XF * math.sin(math.acos(PFF)) / (RF * PFF + XF * math.sin(math.acos(PFF))) * 100, 0)} %. Rugi = ⅓ × 3 × {ind(I_F, 1)}² × {ind(RF, 1)} = {ind(LOSS_F, 0)} kW.",
            "❌ Untuk beban tersebar merata, jatuh tegangan sampai ujung adalah setengah dan rugi sepertiga dari kasus beban terpusat di ujung (arus berkurang linear sepanjang penyulang). Hitung I dulu, lalu terapkan faktor ½ dan ⅓.",
            "Petunjuk: (1) Hitung I, I_Q, Q. (2) Hitung ΔV (faktor ½), tegangan ujung, rugi (faktor ⅓). (3) Bandingkan dengan 19 kV dan pisahkan sumbangan R·I_P dan X·I_Q.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Rancang kapasitor dengan aturan dua-pertiga (Persamaan 4): ukuran Q_C dan letaknya. Hitung arus kapasitor, kenaikan tegangan di titik kapasitor dan di ujung (I_C dikali reaktansi hulu, Persamaan 3), tegangan ujung yang baru, dan rugi sesudahnya (pengurangan 8/9 dari rugi akibat arus reaktif). Daya reaktif malam hanya sekitar 35 % daya reaktif siang: bagi Q_C menjadi bagian tetap dan switched, dan hitung kenaikan tegangan malam bila seluruh Q_C dibiarkan tetap. Bahas pula unit kapasitor standar (300 kVAR) dan pengendali yang dipilih.",
            ["Q_C = 2/3 Q_beban di 2/3 ℓ", "ΔV_naik = I_C·X_hulu", "Δrugi = 8/9 rugi reaktif"],
            f"Kapasitor aturan 2/3 untuk penyulang ini dan tegangan ujung sesudahnya kira-kira...",
            [f"Q_C ≈ {ind(QC_F, 0)} kVAR di km {ind(POS_F, 0)}; ujung naik ke ≈ {ind(V_UJUNG_F2, 2)} kV, rugi turun ke ≈ {ind(LOSS_F2, 0)} kW; malam sebaiknya hanya ≈ {ind(Q_MALAM, 0)} kVAR tetap", f"Q_C ≈ {ind(Q_F, 0)} kVAR di ujung; pf menjadi 1 dan rugi nol", f"Q_C ≈ {ind(QC_F, 0)} kVAR di pangkal gardu; efeknya sama di mana pun", f"Q_C ≈ {ind(QC_F / 3, 0)} kVAR di km {ind(POS_F, 0)}"],
            f"✅ Tepat! \\(Q_C = \\tfrac{{2}}{{3}}\\times{ind(Q_F, 0)} = {ind(QC_F, 0)}\\) kVAR pada \\(\\tfrac{{2}}{{3}}\\times{ind(LF, 0)} = {ind(POS_F, 0)}\\) km; \\(I_C = {ind(IC_F, 1)}\\) A; kenaikan di titik = \\({ind(IC_F, 1)}\\times{ind(XF_KM, 2)}\\times{ind(POS_F, 0)} = {ind(DV_RISE_F, 0)}\\) V ({ind(DV_RISE_F / VF * 100, 2)} %), sama di ujung → ujung ≈ {ind(V_UJUNG_F2, 2)} kV. Rugi reaktif {ind(LOSSQ_F, 0)} kW berkurang 8/9 → rugi total ≈ {ind(LOSS_F2, 0)} kW. Malam Q ≈ {ind(Q_MALAM, 0)} kVAR: bila {ind(QC_F, 0)} kVAR tetap, kelebihan {ind(QC_F - Q_MALAM, 0)} kVAR menaikkan tegangan ≈ {ind(V_NIGHT_RISE, 1)} %; pilih tetap ≈ {ind(Q_MALAM, 0)} kVAR (mis. 2 × 300 + …) dan sisanya switched dengan kendali waktu/VAR.",
            "❌ Aturan 2/3 berlaku untuk beban merata: dua-pertiga daya reaktif di dua-pertiga panjang, bukan seluruh Q di ujung atau di pangkal. Kenaikan tegangan dihitung dari arus kapasitor dikali reaktansi dari gardu ke titik kapasitor.",
            "Petunjuk: (1) Hitung Q_C, letak, I_C. (2) Hitung kenaikan tegangan, ujung baru, rugi baru. (3) Bagi tetap/switched dari Q malam dan hitung risiko tegangan malam.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Manajer rayon mengusulkan memasang regulator tegangan bertingkat di pangkal penyulang sebagai ganti kapasitor. Hitung jumlah tingkat (Persamaan 5) untuk mengangkat tegangan ujung dari {ind(V_UJUNG_F, 2)} kV ke 19,8 kV dan tegangan pangkal yang dihasilkan (batas 21 kV); apakah rugi penyulang berubah? Bandingkan dengan kapasitor dari pertanyaan 2 dalam hal tegangan ujung, rugi, kapasitas trafo, dan biaya. Lalu susun urutan pemasangan yang tepat (kapasitor dulu atau regulator dulu), setelan LDC, dan koordinasi tunda waktu agar kapasitor switched dan regulator tidak saling 'berebut'.",
            ["n = ln(V_t/V)/ln 1,00625", "regulator: rugi tetap", "kapasitor: rugi turun"],
            f"Regulator di pangkal untuk mengangkat ujung ke 19,8 kV memerlukan kira-kira...",
            [f"{math.ceil(N_REG)} tingkat dan rugi turun {ind((1 - LOSS_F2 / LOSS_F) * 100, 0)} % seperti kapasitor", f"{math.ceil(N_REG)} tingkat (≈ {ind((1.00625 ** math.ceil(N_REG) - 1) * 100, 1)} %); pangkal menjadi ≈ {ind(20 * 1.00625 ** math.ceil(N_REG), 2)} kV, dan rugi TIDAK berubah karena arus reaktif tetap lewat penyulang", f"32 tingkat penuh; rugi naik dua kali", f"{math.ceil(N_REG)} tingkat; pangkal tetap 20 kV karena regulator hanya mengatur ujung"],
            f"✅ Tepat! \\(n = \\ln(19{{,}}8/{ind(V_UJUNG_F, 2)})/\\ln 1{{,}}00625 = {ind(N_REG, 2)}\\) → {math.ceil(N_REG)} tingkat; pangkal naik ke {ind(20 * 1.00625 ** math.ceil(N_REG), 2)} kV (masih < 21 kV). Arus penyulang tidak berubah sehingga rugi tetap {ind(LOSS_F, 0)} kW, sedangkan kapasitor menurunkannya ke {ind(LOSS_F2, 0)} kW dan membebaskan kapasitas trafo. Urutan yang benar: kapasitor 2/3 dulu (rugi dan sebagian tegangan), lalu regulator dengan LDC ke pusat beban untuk sisa tegangan; regulator diberi tunda lebih lama daripada kapasitor switched agar tidak hunting.",
            "❌ Regulator hanya menggeser profil tegangan; arus dan rugi penyulang tetap. Jumlah tingkat dari V·1,00625ⁿ = 19,8 kV, dan pangkal ikut naik dengan faktor yang sama.",
            "Petunjuk: (1) Hitung n dan tegangan pangkal. (2) Bandingkan rugi, kapasitas, biaya dengan kapasitor. (3) Susun urutan, LDC, dan koordinasi tunda waktu.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">ΔV = ½ I(R cos φ + X sin φ)</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Q_C = 2/3 Q di 2/3 ℓ</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">n = ln(V_t/V)/ln 1,00625</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">19 kV?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Penyulang Industri<br><em>yang Melorot</em></h1>
    <p class="hero-sub">Sebuah penyulang 20 kV sepanjang 12 km memasok kawasan industri dan tegangan ujungnya jatuh di bawah 19 kV setiap jam puncak. Terapkan kosakata Pertemuan {PERTEMUAN} — arus reaktif, kapasitor shunt, aturan dua-pertiga, tetap dan switched, regulator bertingkat — untuk mendiagnosis dan merancang perbaikannya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Penyulang 20 kV, {ind(LF, 0)} km, {ind(PF_MW, 0)} MW pf {ind(PFF, 2)} —<br>Kapasitor, Regulator, atau Keduanya?</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS KOMPENSASI PENYULANG DISTRIBUSI</div>
    <p>
      Sebuah <strong style="color:var(--amber)">penyulang 20 kV sepanjang {ind(LF, 0)} km</strong> (AAAC 150, r = {ind(RF_KM, 1)} Ω/km, x = {ind(XF_KM, 2)} Ω/km) memasok <strong style="color:var(--cyan)">kawasan industri</strong> dengan beban yang tersebar merata: <strong>{ind(PF_MW, 0)} MW pada pf {ind(PFF, 2)}</strong> di jam puncak dan sekitar 35 % daya reaktifnya di malam hari. Rel gardu induk dijaga 20 kV.
    </p>
    <p style="margin-top:12px">
      Keluhan: tegangan ujung penyulang <strong style="color:var(--pink)">di bawah 19 kV</strong> setiap siang (motor pelanggan panas, kontaktor lepas), dan rugi teknis penyulang tertinggi di rayon. Dua usulan bersaing: <strong style="color:var(--amber)">bank kapasitor di penyulang</strong> atau <strong style="color:var(--amber)">regulator tegangan bertingkat</strong> di pangkal.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung keadaan sekarang, merancang kompensasinya, dan menyusun urutan pemasangan <strong style="color:var(--cyan)">sebelum</strong> rayon membeli peralatan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Penyulang: {ind(LF, 0)} km, R {ind(RF, 1)} Ω, X {ind(XF, 1)} Ω", "14,165,233", "cyan")}
{kartu(f"Beban merata: {ind(PF_MW, 0)} MW, pf {ind(PFF, 2)}", "14,165,233", "cyan")}
{kartu("Q malam ≈ 35 % Q siang", "14,165,233", "cyan")}
{kartu("Batas: 19–21 kV", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Tegangan yang melorot dan rugi yang tinggi lahir dari arus yang sama: arus reaktif. Forum ini mengajak Anda menghitung <strong>berapa</strong> arus itu, <strong>berapa kVAR di kilometer berapa</strong> yang membatalkannya, dan <strong>kapan</strong> regulator masih diperlukan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Profil tegangan penyulang {ind(LF, 0)} km pada tiga keadaan: sekarang, dengan kapasitor aturan 2/3, dan dengan regulator di pangkal; pita merah muda = batas 19–21 kV</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Penyulang 20 kV {ind(LF, 0)} km (r {ind(RF_KM, 1)}, x {ind(XF_KM, 2)} Ω/km) memasok kawasan industri dengan beban merata {ind(PF_MW, 0)} MW pf {ind(PFF, 2)} (Q malam ≈ 35 %); rel gardu 20 kV; tegangan ujung < 19 kV di jam puncak dan rugi tertinggi di rayon. Usulan: bank kapasitor (aturan 2/3, tetap + switched) vs regulator bertingkat di pangkal; batas 19–21 kV."
FORUM_CHIPS_LMS = [f"penyulang = {ind(LF, 0)} km, R {ind(RF, 1)} Ω, X {ind(XF, 1)} Ω", f"beban merata = {ind(PF_MW, 0)} MW, pf {ind(PFF, 2)}", "Q malam ≈ 35 % Q siang", "batas = 19–21 kV"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Profil tegangan penyulang industri 12 km: sekarang, kapasitor 2/3, regulator (Pertemuan 11)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const L = 12, r = 0.4, x = 0.35, P = 6e6, pf = 0.78, Vf = 20e3 / Math.sqrt(3), n = 60;
  const I = P / (Math.sqrt(3) * 20e3 * pf), Ip = I * pf, Iq = I * Math.sqrt(1 - pf * pf);
  const Qc = 2 / 3 * Math.sqrt(3) * 20 * Iq, Ic = Qc / (Math.sqrt(3) * 20);
  const profil = (withC, gain) => { const V = [gain]; let v = gain; for (let s = 0; s < n; s++) { const pos = s / n; const iq = Iq * (1 - pos) - (withC && pos < 2 / 3 ? Ic : 0); v -= (r * L / n * Ip * (1 - pos) + x * L / n * iq) / Vf; V.push(v); } return V; };
  const V0 = profil(false, 1), V1 = profil(true, 1);
  const nReg = Math.ceil(Math.log(0.99 / V0[n]) / Math.log(1.00625)), V2 = profil(false, Math.pow(1.00625, nReg));
  const padL = 56, padR = 150, padT = 16, padB = 26, plotW = W - padL - padR, plotH = H - padT - padB;
  const X = (i) => padL + i / n * plotW, Y = (v) => padT + plotH - (v - 0.9) / 0.18 * plotH;
  ctx.fillStyle = 'rgba(236,72,153,.10)'; ctx.fillRect(padL, Y(1.05), plotW, Y(0.95) - Y(1.05));
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [0.9, 0.95, 1.0, 1.05].forEach((v) => ctx.fillText((v * 20).toFixed(0) + ' kV', padL - 5, Y(v) + 3));
  ctx.textAlign = 'center'; ctx.fillText('gardu', padL, H - 8); ctx.fillText('ujung (12 km)', padL + plotW, H - 8);
  [[V0, 'rgba(239,68,68,1)', 'sekarang'], [V1, 'rgba(0,224,158,1)', 'kapasitor ' + Qc.toFixed(0) + ' kVAR @ 8 km'], [V2, 'rgba(255,179,0,1)', 'regulator +' + nReg + ' tingkat']].forEach(([V, warna, label]) => {
    ctx.strokeStyle = warna; ctx.lineWidth = 2.2; ctx.beginPath(); V.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); }); ctx.stroke();
    ctx.fillStyle = warna; ctx.textAlign = 'left'; ctx.fillText(label + ': ujung ' + (V[n] * 20).toFixed(2) + ' kV', X(n) + 6, Y(V[n]) + 3);
  });
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
