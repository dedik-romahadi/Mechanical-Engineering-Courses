# Konten Modul 3 Teknik Tenaga Listrik — Daya pada Jaringan Listrik DC dengan Satu
# Sumber Tegangan (Sub-CPMK 1.3, Pertemuan 3). Angka contoh dihitung di sini agar
# teks, tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 3
PERTEMUAN = 3
SUB_CPMK = "1.3"
JUDUL = "Daya pada Jaringan DC Satu Sumber"
JUDUL_PANJANG = "Daya pada Jaringan Listrik DC dengan Satu Sumber Tegangan"
JUDUL_EKSPOR = "Daya pada Jaringan DC Satu Sumber"

# ─────────────────────────── angka contoh ───────────────────────────
RHO_CU = 0.0172
V_REF, R1_REF, R2_REF, R3_REF = 48.0, 4.0, 12.0, 6.0        # jaringan contoh Bagian 03
RP_REF = R2_REF * R3_REF / (R2_REF + R3_REF)
RT_REF = R1_REF + RP_REF
I_REF = V_REF / RT_REF
V1_REF, VP_REF = I_REF * R1_REF, I_REF * RP_REF
I2_REF, I3_REF = VP_REF / R2_REF, VP_REF / R3_REF
E_BAT, R_BAT = 12.6, 0.05                                   # baterai contoh Bagian 05
P_MAKS = E_BAT ** 2 / (4 * R_BAT)
I_KAB, L_KAB, A_KAB = 25.0, 30.0, 6.0                        # kabel contoh Bagian 06
DV_KAB = 2 * RHO_CU * L_KAB * I_KAB / A_KAB
ETA_KAB = 48 * I_KAB / (48 * I_KAB + I_KAB * DV_KAB) * 100
A_MIN = 2 * RHO_CU * L_KAB * I_KAB / (0.03 * 48)


def p_beban(RL, E=24.0, r=1.0):
    return E * E * RL / (r + RL) ** 2


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    # sumber, kawat, resistor
    b += f'<line x1="120" y1="60" x2="120" y2="106" stroke="{AX}" stroke-width="2"/><line x1="120" y1="134" x2="120" y2="180" stroke="{AX}" stroke-width="2"/>'
    b += '<line x1="100" y1="112" x2="140" y2="112" stroke="#f59e0b" stroke-width="4"/><line x1="110" y1="128" x2="130" y2="128" stroke="#f59e0b" stroke-width="4"/>'
    b += t(88, 124, "V", 14, "#f59e0b", "end", "700")
    b += f'<line x1="120" y1="60" x2="420" y2="60" stroke="{AX}" stroke-width="2"/><line x1="120" y1="180" x2="420" y2="180" stroke="{AX}" stroke-width="2"/>'
    b += f'<line x1="420" y1="60" x2="420" y2="90" stroke="{AX}" stroke-width="2"/><line x1="420" y1="150" x2="420" y2="180" stroke="{AX}" stroke-width="2"/>'
    b += f'<rect x="404" y="90" width="32" height="60" rx="4" fill="{BOX}" stroke="#22d3ee" stroke-width="2.2"/>'
    b += t(446, 124, "R", 14, "#22d3ee", "start", "700")
    b += arrow(200, 60, 260, 60, "#00e09e", 2.2) + t(230, 50, "I", 13, "#00e09e", "middle", "700")
    b += arrow(470, 96, 470, 144, "#a855f7", 1.8) + t(482, 124, "V = I·R", 12, "#a855f7", "start", "600")
    b += t(270, 210, "P = V·I = I²·R = V²/R", 13, TX, "middle", "700")
    for i, (judul, isi, c) in enumerate([("Tegangan V", "beda potensial yang mendorong muatan (volt)", "#f59e0b"), ("Arus I", "laju aliran muatan (ampere)", "#00e09e"),
                                          ("Resistansi R", "hambatan terhadap aliran (ohm)", "#22d3ee"), ("Daya P", "laju energi yang diubah (watt)", "#a855f7")]):
        y = 40 + i * 44
        b += f'<rect x="520" y="{y}" width="130" height="36" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>'
        b += t(528, y + 15, judul, 11.5, TX, "start", "600") + t(528, y + 29, isi, 9, AX, "start")
    return svg(660, 226, b, "Gambar 1 — Rangkaian DC satu sumber, satu beban")


def gambar2():
    b = ""
    # seri (kiri)
    b += t(165, 26, "Seri: arus sama, tegangan terbagi", 12, TX, "middle", "700")
    b += f'<line x1="40" y1="70" x2="290" y2="70" stroke="{AX}" stroke-width="2"/><line x1="40" y1="70" x2="40" y2="150" stroke="{AX}" stroke-width="2"/><line x1="40" y1="150" x2="290" y2="150" stroke="{AX}" stroke-width="2"/><line x1="290" y1="70" x2="290" y2="150" stroke="{AX}" stroke-width="2"/>'
    for i, (x, c) in enumerate([(90, "#22d3ee"), (165, "#a855f7"), (240, "#00e09e")]):
        b += f'<rect x="{x - 20}" y="60" width="40" height="20" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x, 52, f"R{i + 1}", 11, c, "middle", "600")
    b += '<line x1="30" y1="104" x2="50" y2="104" stroke="#f59e0b" stroke-width="4"/><line x1="35" y1="118" x2="45" y2="118" stroke="#f59e0b" stroke-width="4"/>'
    b += t(165, 176, "R_seri = R₁ + R₂ + R₃", 12, TX)
    b += t(165, 194, "V_k = V · R_k / R_seri", 11, AX)
    # paralel (kanan)
    b += t(495, 26, "Paralel: tegangan sama, arus terbagi", 12, TX, "middle", "700")
    b += f'<line x1="370" y1="60" x2="620" y2="60" stroke="{AX}" stroke-width="2"/><line x1="370" y1="160" x2="620" y2="160" stroke="{AX}" stroke-width="2"/><line x1="370" y1="60" x2="370" y2="160" stroke="{AX}" stroke-width="2"/>'
    for i, (x, c) in enumerate([(450, "#22d3ee"), (530, "#a855f7"), (610, "#00e09e")]):
        b += f'<line x1="{x}" y1="60" x2="{x}" y2="88" stroke="{AX}" stroke-width="2"/><line x1="{x}" y1="132" x2="{x}" y2="160" stroke="{AX}" stroke-width="2"/>'
        b += f'<rect x="{x - 10}" y="88" width="20" height="44" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x + 16, 114, f"R{i + 1}", 11, c, "start", "600")
    b += '<line x1="360" y1="104" x2="380" y2="104" stroke="#f59e0b" stroke-width="4"/><line x1="365" y1="118" x2="375" y2="118" stroke="#f59e0b" stroke-width="4"/>'
    b += t(495, 184, "1/R_par = 1/R₁ + 1/R₂ + 1/R₃", 12, TX)
    b += t(495, 202, "I_k = V / R_k", 11, AX)
    return svg(660, 212, b, "Gambar 2 — Hubungan seri dan paralel")


def gambar3():
    b = ""
    b += f'<line x1="60" y1="60" x2="60" y2="190" stroke="{AX}" stroke-width="2"/><line x1="60" y1="60" x2="240" y2="60" stroke="{AX}" stroke-width="2"/><line x1="60" y1="190" x2="560" y2="190" stroke="{AX}" stroke-width="2"/>'
    b += '<line x1="45" y1="118" x2="75" y2="118" stroke="#f59e0b" stroke-width="4"/><line x1="52" y1="132" x2="68" y2="132" stroke="#f59e0b" stroke-width="4"/>' + t(36, 128, f"{ind(V_REF, 0)} V", 12, "#f59e0b", "end", "700")
    b += f'<rect x="150" y="50" width="60" height="20" rx="3" fill="{BOX}" stroke="#22d3ee" stroke-width="2"/>' + t(180, 42, f"R₁ = {ind(R1_REF, 0)} Ω", 11, "#22d3ee", "middle", "600")
    b += f'<line x1="240" y1="60" x2="340" y2="60" stroke="{AX}" stroke-width="2"/>'
    b += f'<circle cx="340" cy="60" r="5" fill="#ef4444"/>' + t(340, 46, "simpul A", 11, "#ef4444", "middle", "600")
    b += f'<line x1="340" y1="60" x2="340" y2="190" stroke="{AX}" stroke-width="0"/>'
    b += f'<line x1="340" y1="60" x2="440" y2="60" stroke="{AX}" stroke-width="2"/><line x1="440" y1="60" x2="440" y2="80" stroke="{AX}" stroke-width="2"/><line x1="440" y1="130" x2="440" y2="190" stroke="{AX}" stroke-width="2"/>'
    b += f'<rect x="430" y="80" width="20" height="50" rx="3" fill="{BOX}" stroke="#a855f7" stroke-width="2"/>' + t(458, 108, f"R₂ = {ind(R2_REF, 0)} Ω", 11, "#a855f7", "start", "600")
    b += f'<line x1="440" y1="60" x2="560" y2="60" stroke="{AX}" stroke-width="2"/><line x1="560" y1="60" x2="560" y2="80" stroke="{AX}" stroke-width="2"/><line x1="560" y1="130" x2="560" y2="190" stroke="{AX}" stroke-width="2"/>'
    b += f'<rect x="550" y="80" width="20" height="50" rx="3" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + t(578, 108, f"R₃ = {ind(R3_REF, 0)} Ω", 11, "#00e09e", "start", "600")
    b += arrow(90, 60, 130, 60, "#00e09e", 2) + t(110, 80, f"I = {ind(I_REF, 2)} A", 11, "#00e09e", "middle", "600")
    b += t(490, 172, f"I₂ = {ind(I2_REF, 2)} A", 10.5, "#a855f7", "middle") + t(610, 172, f"I₃ = {ind(I3_REF, 2)} A", 10.5, "#00e09e", "middle")
    b += t(340, 215, f"KCL di simpul A: I = I₂ + I₃ = {ind(I2_REF, 2)} + {ind(I3_REF, 2)} = {ind(I_REF, 2)} A;  KVL: {ind(V_REF, 0)} = {ind(V1_REF, 2)} + {ind(VP_REF, 2)} V", 11.5, AX)
    return svg(660, 226, b, "Gambar 3 — Jaringan seri–paralel dan hukum Kirchhoff")


def gambar4():
    b = ""
    x0, x1, y0, y1 = 64, 630, 206, 26
    Imax, Pmax = 60, 40 * 60
    X = lambda i: x0 + i / Imax * (x1 - x0)
    Y = lambda p: y0 - p / Pmax * (y0 - y1)
    for p in [0, 600, 1200, 1800, 2400]:
        b += f'<line x1="{x0}" y1="{Y(p):.1f}" x2="{x1}" y2="{Y(p):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(p) + 4, f"{p}", 11, AX, "end")
    for i in [0, 15, 30, 45, 60]:
        b += t(X(i), y0 + 16, f"{i} A", 11, AX)
    R = 0.12
    pts_b = " ".join(f"{X(i):.1f},{Y(48 * i):.1f}" for i in range(0, 61, 2))
    pts_r = " ".join(f"{X(i):.1f},{Y(i * i * R):.1f}" for i in range(0, 61, 2))
    b += f'<polyline points="{pts_b}" fill="none" stroke="#00e09e" stroke-width="2.4"/>' + t(X(52), Y(48 * 52) - 10, "P_beban = 48·I", 11.5, "#00e09e", "end", "600")
    b += f'<polyline points="{pts_r}" fill="none" stroke="#ef4444" stroke-width="2.4"/>' + t(X(58), Y(58 * 58 * R) - 10, "P_rugi = I²·R", 11.5, "#ef4444", "end", "600")
    b += t(28, 118, "W", 11, AX)
    b += t(347, 244, f"Beban 48 V dan saluran R = {ind(R, 2)} Ω: rugi tumbuh kuadrat, sehingga efisiensi turun saat arus naik", 12, AX)
    return svg(660, 254, b, "Gambar 4 — Daya beban dan rugi saluran terhadap arus")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 64, 630, 206, 26
    E, r = 24.0, 1.0
    RLmax, Pmax = 5.0, E * E / (4 * r)
    X = lambda RL: x0 + RL / RLmax * (x1 - x0)
    Y = lambda p: y0 - p / (Pmax * 1.1) * (y0 - y1)
    Ye = lambda e: y0 - e / 100 * (y0 - y1)
    for k in range(5):
        y = y0 - (y0 - y1) * k / 4
        b += f'<line x1="{x0}" y1="{y:.1f}" x2="{x1}" y2="{y:.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, y + 4, f"{ind(Pmax * 1.1 * k / 4, 0)} W", 10.5, "#00e09e", "end") + t(x1 + 8, y + 4, f"{25 * k}%", 10.5, "#f59e0b", "start")
    for k in range(6):
        b += t(X(k * r), y0 + 16, f"{k}r", 11, AX)
    pts = " ".join(f"{X(RL):.1f},{Y(p_beban(RL, E, r)):.1f}" for RL in [i / 100 for i in range(2, 501, 4)])
    b += f'<polyline points="{pts}" fill="none" stroke="#00e09e" stroke-width="2.4"/>'
    pts = " ".join(f"{X(RL):.1f},{Ye(RL / (r + RL) * 100):.1f}" for RL in [i / 100 for i in range(2, 501, 4)])
    b += f'<polyline points="{pts}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4"/>'
    b += f'<line x1="{X(r):.1f}" y1="{y1}" x2="{X(r):.1f}" y2="{y0}" stroke="#ec4899" stroke-width="1.3" stroke-dasharray="4 4"/>'
    b += f'<circle cx="{X(r):.1f}" cy="{Y(Pmax):.1f}" r="5" fill="#ec4899"/>' + t(X(r) + 8, Y(Pmax) - 8, f"R_L = r: P_maks = {ind(Pmax, 0)} W, η = 50%", 11.5, "#ec4899", "start", "600")
    b += t(X(3.6), Ye(78) - 8, "η = R_L/(r+R_L)", 11, "#f59e0b", "start", "600")
    b += t(347, 244, f"E = {ind(E, 0)} V, r = {ind(r, 0)} Ω: daya beban (hijau) memuncak saat R_L = r, tetapi efisiensi (jingga) baru tinggi bila R_L ≫ r", 12, AX)
    return svg(660, 254, b, "Gambar 5 — Transfer daya maksimum dan efisiensi terhadap R_L")


def gambar6():
    b = ""
    x0, x1 = 90, 600
    X = lambda m: x0 + m / L_KAB * (x1 - x0)
    for m in [0, 10, 20, 30]:
        b += f'<line x1="{X(m):.1f}" y1="30" x2="{X(m):.1f}" y2="170" stroke="{GRID}" stroke-width="0.7"/>' + t(X(m), 186, f"{m} m", 11, AX)
    for A, c, y_off in [(6, "#ef4444", 0), (16, "#00e09e", 0)]:
        dv = 2 * RHO_CU * L_KAB * I_KAB / A
        Y = lambda v: 160 - (v - 42) / 7 * 120
        b += f'<line x1="{X(0)}" y1="{Y(48):.1f}" x2="{X(L_KAB):.1f}" y2="{Y(48 - dv):.1f}" stroke="{c}" stroke-width="2.6"/>'
        b += t(X(L_KAB) + 6, Y(48 - dv) + 4, f"{A} mm²: {ind(48 - dv, 2)} V (−{ind(dv / 48 * 100, 1)}%)", 11, c, "start", "600")
    for v in [42, 44, 46, 48]:
        Y = 160 - (v - 42) / 7 * 120
        b += t(x0 - 8, Y + 4, f"{v} V", 11, AX, "end")
    b += f'<line x1="{x0}" y1="{160 - (46.56 - 42) / 7 * 120:.1f}" x2="{x1}" y2="{160 - (46.56 - 42) / 7 * 120:.1f}" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="5 4"/>' + t(x0 + 6, 160 - (46.56 - 42) / 7 * 120 - 6, "batas −3% = 46,56 V", 11, "#f59e0b", "start")
    b += t(345, 212, f"Beban {ind(I_KAB, 0)} A pada 48 V, {ind(L_KAB, 0)} m: kabel 6 mm² melampaui batas jatuh tegangan 3%, kabel 16 mm² memenuhinya", 12, AX)
    return svg(660, 222, b, "Gambar 6 — Tegangan sepanjang kabel DC untuk dua penampang")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-ohm">Hukum Ohm</a>
  <a href="#m-seriparalel">Seri–Paralel</a>
  <a href="#m-kirchhoff">Kirchhoff</a>
  <a href="#m-energi">Daya &amp; Efisiensi</a>
  <a href="#m-transfer">Transfer Daya</a>
  <a href="#m-kabel">Kabel DC</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="40" x2="20" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="20" y1="40" x2="80" y2="40" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="20" y1="150" x2="80" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="80" y1="40" x2="80" y2="70" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="80" y1="120" x2="80" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <rect x="73" y="70" width="14" height="50" rx="2" fill="none" stroke="rgba(0,229,255,.55)" stroke-width="1.5"/>
      <line x1="10" y1="90" x2="30" y2="90" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <line x1="14" y1="100" x2="26" y2="100" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <text x="8" y="80" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">V</text>
      <text x="90" y="98" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">R</text>
      <text x="44" y="34" fill="rgba(0,224,158,.55)" font-family="JetBrains Mono" font-size="8">I →</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 190 C 20 60, 34 44, 46 48 C 62 54, 78 100, 90 130" fill="none" stroke="rgba(0,224,158,.5)" stroke-width="1.6"/>
      <line x1="12" y1="190" x2="12" y2="30" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <line x1="12" y1="190" x2="92" y2="190" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <circle cx="46" cy="48" r="3" fill="rgba(236,72,153,.7)"/>
      <text x="52" y="44" fill="rgba(236,72,153,.6)" font-family="JetBrains Mono" font-size="8">R_L = r</text>
      <text x="40" y="206" fill="rgba(148,163,184,.45)" font-family="JetBrains Mono" font-size="8">R_L</text>
      <text x="4" y="24" fill="rgba(0,224,158,.55)" font-family="JetBrains Mono" font-size="8">P</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="03">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">V = I·R</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">P = I²·R = V²/R</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">ΣI_simpul = 0</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">ΣV_loop = 0</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">1/R_par = Σ 1/R_k</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">P_maks = E²/(4r)</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">V_t = E − I·r</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">ΔV = I·ρ·2L/A</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Daya pada</span><br>
      <em>Jaringan DC</em><br>
      <span class="hl-amber">Satu Sumber</span>
    </h1>
    <p class="hero-sub">Alat hitung paling dasar mata kuliah ini: hukum Ohm, hubungan seri dan paralel, hukum Kirchhoff, daya dan energi, rugi dan efisiensi, sumber nyata dengan hambatan dalam, transfer daya maksimum, sampai pemilihan kabel DC dari jatuh tegangan. Dipakai langsung pada sistem baterai, PLTS off-grid, kendaraan listrik, dan panel DC, dan menjadi fondasi analisis jaringan AC pada pertemuan berikutnya.</p>
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

    # 01 — Ohm & daya
    isi = figure(1, "Rangkaian DC satu sumber, satu beban", "Sumber tegangan mendorong arus melalui beban beresistansi R; tegangan pada beban, arus, dan daya saling terkait lewat hukum Ohm.", gambar1())
    isi += formula(1, "Hukum Ohm", r"V = I\,R \qquad\Leftrightarrow\qquad I = \dfrac{V}{R}",
                   r"Pemanas DC 8 Ω pada 48 V menarik \(I = 48/8 = 6\) A. Resistansi penghantar bergantung bahan dan ukurannya: \(R = \rho L/A\) (Modul 2, Persamaan 8), dan naik sekitar 0,4% per °C untuk tembaga dan aluminium.",
                   "Hukum Ohm berlaku untuk penghantar dan beban resistif (pemanas, lampu pijar, kabel). Motor, baterai yang diisi, dan elektronika daya bukan resistor murni, tetapi pada satu titik kerja tetap dapat diwakili resistansi setara.",
                   [("V", "Tegangan pada elemen (V)"), ("I", "Arus melalui elemen (A)"), ("R", "Resistansi elemen (Ω)")])
    isi += formula(2, "Daya pada Beban Resistif", r"P = V\,I = I^2 R = \dfrac{V^2}{R}",
                   r"Ketiga bentuk setara lewat hukum Ohm; pilih yang besarannya diketahui. Pemanas 8 Ω pada 48 V: \(P = 48^2/8 = 288\) W, atau \(6^2\times8 = 288\) W. Energi yang terpakai selama \(t\) jam adalah \(E = P\,t\) (Wh).",
                   "Bentuk \\(I^2R\\) menjelaskan mengapa rugi kabel tumbuh cepat: arus dua kali lipat, panas empat kali lipat. Bentuk \\(V^2/R\\) menjelaskan mengapa lampu 12 V yang dipasang pada 24 V terbakar: dayanya empat kali lipat.",
                   [("P", "Daya (W)"), ("V", "Tegangan (V)"), ("I", "Arus (A)"), ("R", "Resistansi (Ω)")])
    isi += cards([
        ("🔋", "Sumber Tegangan", "Baterai, catu daya, panel surya melalui pengendali muatan, atau generator DC. Modul ini membahas satu sumber; dua sumber atau lebih dibahas Modul 4.", r"\(E\) (ggl)"),
        ("🔌", "Beban Resistif", "Pemanas, lampu pijar, elemen las, rem resistif. Arus dan tegangannya sebanding; dayanya seluruhnya menjadi panas atau cahaya.", r"\(P = V^2/R\)"),
        ("🧵", "Penghantar", "Kabel dan rel punya resistansi kecil tetapi tidak nol; pada arus besar ia menimbulkan jatuh tegangan dan rugi yang harus diperhitungkan.", r"\(R = \rho L/A\)"),
        ("📏", "Konvensi Arah", "Arus konvensional mengalir dari kutub positif ke negatif di luar sumber. Tanda hasil hitung yang negatif berarti arah sebenarnya berlawanan dengan yang diandaikan.", None),
        ("⚡", "Energi dan Tagihan", "Pemakaian energi \\(E = P\\,t\\) dalam Wh atau kWh; baterai dinilai dalam Ah (arus × jam) yang bila dikalikan tegangan menjadi Wh.", r"\(E = P\,t\)"),
        ("🌡️", "Suhu", "Resistansi kabel naik bersama suhu, sehingga kabel yang panas makin boros; itulah alasan tabel kabel memberi kemampuan hantar arus pada suhu tertentu.", None),
    ], [("E", "Gaya gerak listrik sumber (V)"), (r"\rho", "Resistivitas (Ω·mm²/m)"), ("L", "Panjang (m)"), ("A", "Luas penampang (mm²)"), ("t", "Waktu (jam)")])
    isi += tabel(["Beban DC", "Tegangan", "Daya", "Arus", "Resistansi setara"], [
        ["Lampu LED kendaraan", "12 V", "18 W", "1,5 A", "8 Ω"],
        ["Pemanas air PLTS", "48 V", "800 W", "16,67 A", "2,88 Ω"],
        ["Motor bor 48 V (titik kerja)", "48 V", "600 W", "12,5 A", "3,84 Ω"],
        ["Elemen las DC", "36 V", "5400 W", "150 A", "0,24 Ω"],
        ["Pengisi daya EV 400 V", "400 V", "50 kW", "125 A", "3,2 Ω"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> Georg Simon Ohm menerbitkan hubungan tegangan–arus–resistansi pada 1827 dan sempat dicemooh, sampai Royal Society menganugerahinya Copley Medal pada 1841. Gustav Kirchhoff, saat masih mahasiswa pada 1845, merumuskan dua hukum jaringan yang menyusul di Bagian 03. Kedua hukum ini cukup untuk menyelesaikan seluruh rangkaian resistif, dan tetap menjadi dasar perangkat lunak analisis aliran daya yang dipakai di Pertemuan 15.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01–03 adalah alat: hukum Ohm, seri–paralel, dan Kirchhoff. Bagian 04–06 memakainya pada persoalan tenaga: rugi dan efisiensi, sumber nyata dan transfer daya, serta kabel DC. Setiap persamaan diberi nomor dan dipakai lagi di animasi (Bagian 07), cell Python (Bagian 08), dan tugas.")
    m += bagian(1, "m-ohm", "Hukum Ohm,<br>Daya, dan Energi",
                "Jaringan DC dengan satu sumber adalah laboratorium paling sederhana untuk memahami tenaga listrik: tidak ada fasa, tidak ada reaktansi, hanya tegangan, arus, resistansi, dan daya. Semua perhitungan modul ini dan Modul 4 dibangun dari dua hubungan: hukum Ohm pada Persamaan (1) dan daya pada Persamaan (2). Gambar 1 memperlihatkan rangkaian dasarnya.",
                isi, "HUKUM OHM DAN DAYA")

    # 02 — seri paralel
    isi = figure(2, "Hubungan seri dan paralel", "Dalam hubungan seri arus sama dan tegangan terbagi; dalam hubungan paralel tegangan sama dan arus terbagi. Setiap jaringan resistif dapat direduksi bertahap dengan dua aturan ini.", gambar2())
    isi += formula(3, "Resistansi Seri dan Pembagi Tegangan", r"R_{seri} = R_1 + R_2 + \cdots + R_n, \qquad V_k = V\,\dfrac{R_k}{R_{seri}}",
                   r"Tiga resistor 4, 12, dan 6 Ω seri pada 48 V: \(R_{seri} = 22\) Ω, \(I = 2{,}18\) A, dan tegangan pada resistor 12 Ω adalah \(48 \times 12/22 \approx 26{,}2\) V. Resistor terbesar mendapat tegangan terbesar.",
                   "Arus yang sama melewati setiap elemen seri, jadi tegangan terbagi sebanding resistansi. Inilah alasan kabel panjang (resistansi seri dengan beban) 'merampas' sebagian tegangan sumber sebelum sampai ke beban.",
                   [("R_{seri}", "Resistansi ekuivalen seri (Ω)"), ("R_k", "Resistor ke-k"), ("V_k", "Tegangan pada resistor ke-k"), ("V", "Tegangan total")])
    isi += formula(4, "Resistansi Paralel dan Pembagi Arus", r"\dfrac{1}{R_{par}} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \cdots, \qquad I_1 = I\,\dfrac{R_2}{R_1 + R_2}\;(\text{dua cabang})",
                   rf"Resistor 12 Ω dan 6 Ω paralel: \(R_{{par}} = 12\times6/18 = {ind(RP_REF, 0)}\) Ω, lebih kecil daripada resistor terkecilnya. Dua cabang: \(R_{{par}} = R_1R_2/(R_1+R_2)\); arus lebih besar mengalir ke cabang beresistansi lebih kecil.",
                   "Tegangan yang sama pada setiap cabang paralel membuat arus tiap cabang bebas satu sama lain: menambah beban paralel tidak mengubah arus beban yang sudah ada, hanya menambah arus total dari sumber. Itulah cara semua beban rumah dan pabrik dihubungkan.",
                   [("R_{par}", "Resistansi ekuivalen paralel (Ω)"), ("R_1, R_2", "Resistor cabang"), ("I", "Arus total masuk"), ("I_1", "Arus cabang 1")])
    isi += cards([
        ("➡️", "Seri", "Satu jalur arus. Putus di satu titik memadamkan semuanya (lampu hias lama). Resistansi total selalu lebih besar daripada yang terbesar.", r"\(R_{seri} > \max R_k\)"),
        ("⫴", "Paralel", "Banyak jalur arus dengan tegangan sama. Resistansi total lebih kecil daripada yang terkecil; beban dapat ditambah tanpa mengganggu beban lain.", r"\(R_{par} < \min R_k\)"),
        ("🪜", "Reduksi Bertahap", "Gabungkan bagian yang jelas seri atau paralel, ganti dengan satu resistor, ulangi sampai tinggal satu; lalu bekerja mundur untuk mendapatkan arus dan tegangan tiap elemen.", None),
        ("⚖️", "Dua Resistor Sama", "Dua resistor R paralel memberi R/2; n resistor sama paralel memberi R/n. Cara cepat menaksir resistansi kabel ganda atau baterai paralel.", r"\(R/n\)"),
        ("🔋", "Baterai Seri–Paralel", "Sel seri menjumlahkan tegangan, sel paralel menjumlahkan kapasitas (Ah). Paket baterai EV 400 V adalah ratusan sel seri, masing-masing beberapa sel paralel.", None),
        ("⚠️", "Jebakan Umum", "Menjumlahkan resistansi paralel seperti seri, atau mengambil kebalikan hanya sekali. Periksa: hasil paralel harus lebih kecil daripada resistor terkecil.", None),
    ])
    isi += tabel(["Susunan", "Resistansi ekuivalen", "Arus dari 48 V", "Daya total"], [
        ["4 Ω seri 12 Ω seri 6 Ω", "22 Ω", ind(48 / 22, 3) + " A", ind(48 * 48 / 22, 1) + " W"],
        ["4 Ω ‖ 12 Ω ‖ 6 Ω", ind(1 / (1 / 4 + 1 / 12 + 1 / 6), 3) + " Ω", ind(48 * (1 / 4 + 1 / 12 + 1 / 6), 3) + " A", ind(48 * 48 * (1 / 4 + 1 / 12 + 1 / 6), 1) + " W"],
        ["4 Ω seri (12 Ω ‖ 6 Ω)", ind(RT_REF, 3) + " Ω", ind(I_REF, 3) + " A", ind(48 * I_REF, 1) + " W"],
        ["(4 Ω seri 12 Ω) ‖ 6 Ω", ind(16 * 6 / 22, 3) + " Ω", ind(48 / (16 * 6 / 22), 3) + " A", ind(48 * 48 / (16 * 6 / 22), 1) + " W"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> resistor yang sama memberi daya total yang sangat berbeda tergantung susunannya, dari 105 W (seri) sampai 1152 W (paralel). Sumber 48 V yang sama 'melihat' beban yang berbeda. Saat merancang rangkaian pemanas atau lampu, susunan menentukan daya total sekaligus arus yang harus disediakan sumber dan kabelnya.")
    m += bagian(2, "m-seriparalel", "Hubungan Seri<br>dan Paralel",
                "Beban di dunia nyata jarang sendirian: pemanas, lampu, dan motor dipasang paralel pada rel yang sama, dan kabel menuju mereka seri dengan bebannya. Dua aturan penggabungan pada Persamaan (3) dan (4) memungkinkan jaringan apa pun direduksi menjadi satu resistor ekuivalen, lalu dibuka kembali untuk mendapatkan arus dan tegangan setiap elemen. Gambar 2 membandingkan keduanya.",
                isi, "SERI DAN PARALEL")

    # 03 — Kirchhoff
    isi = figure(3, "Jaringan seri–paralel dan hukum Kirchhoff", f"Sumber {ind(V_REF, 0)} V memasok R₁ = {ind(R1_REF, 0)} Ω yang seri dengan R₂ = {ind(R2_REF, 0)} Ω ‖ R₃ = {ind(R3_REF, 0)} Ω; arus terbagi di simpul A menurut KCL, dan tegangan terbagi mengelilingi loop menurut KVL.", gambar3())
    isi += formula(5, "Hukum Arus Kirchhoff (KCL)", r"\sum I_{masuk} = \sum I_{keluar} \qquad\text{pada setiap simpul}",
                   rf"Di simpul A pada Gambar 3, arus \(I = {ind(I_REF, 3)}\) A terbagi menjadi \(I_2 = {ind(I2_REF, 3)}\) A dan \(I_3 = {ind(I3_REF, 3)}\) A; jumlahnya tepat \(I\). Muatan tidak menumpuk di simpul.",
                   "KCL adalah kekekalan muatan: apa yang masuk harus keluar. Ia dipakai setiap kali beban dijumlahkan pada satu rel (arus rel = jumlah arus penyulang, Modul 2 soal C9) dan menjadi dasar metode nodal pada Modul 4.",
                   [("I_{masuk}", "Arus yang menuju simpul"), ("I_{keluar}", "Arus yang meninggalkan simpul")])
    isi += formula(6, "Hukum Tegangan Kirchhoff (KVL)", r"\sum_{loop} V = 0 \qquad\Leftrightarrow\qquad E = \sum I_k R_k",
                   rf"Mengelilingi loop luar Gambar 3: \({ind(V_REF, 0)} = I R_1 + V_{{par}} = {ind(V1_REF, 2)} + {ind(VP_REF, 2)}\) V. Jumlah kenaikan tegangan (sumber) sama dengan jumlah jatuh tegangan (beban dan kabel).",
                   "KVL adalah kekekalan energi per satuan muatan. Bentuk praktisnya: tegangan sumber = jatuh tegangan kabel pergi + tegangan beban + jatuh tegangan kabel pulang, rumus yang dipakai di Bagian 06 untuk memilih kabel.",
                   [("V", "Tegangan tiap elemen dalam loop, bertanda"), ("E", "Ggl sumber"), ("I_k, R_k", "Arus dan resistansi elemen ke-k")])
    isi += cards([
        ("🔵", "Simpul", "Titik pertemuan dua kawat atau lebih. Kawat tanpa resistansi menyatukan titik-titik menjadi satu simpul dengan tegangan sama.", None),
        ("🔁", "Loop", "Lintasan tertutup mana pun melalui elemen rangkaian. KVL berlaku untuk setiap loop, termasuk yang tidak memuat sumber.", None),
        ("🧮", "Langkah Penyelesaian", "Reduksi ke satu resistor → arus sumber → tegangan tiap blok (pembagi tegangan) → arus tiap cabang (pembagi arus) → daya tiap elemen. Periksa dengan KCL dan KVL.", None),
        ("✅", "Pemeriksaan Daya", "Daya sumber \\(E\\,I\\) harus sama dengan jumlah \\(I_k^2 R_k\\) seluruh elemen. Selisih berarti ada salah hitung.", r"\(E I = \sum I_k^2 R_k\)"),
        ("🧭", "Tanda", "Tetapkan arah arus sembarang, lalu ikuti loop: melewati resistor searah arus berarti jatuh tegangan (−IR), melewati sumber dari − ke + berarti naik (+E).", None),
        ("🔀", "Bukan Seri, Bukan Paralel", "Jembatan (bridge) dan jaringan bersilang tidak dapat direduksi seri–paralel; di sana KCL dan KVL dipakai langsung sebagai persamaan simultan (Modul 4).", None),
    ])
    isi += tabel(["Elemen (Gambar 3)", "Arus (A)", "Tegangan (V)", "Daya (W)"], [
        [f"R₁ = {ind(R1_REF, 0)} Ω", ind(I_REF, 3), ind(V1_REF, 2), ind(I_REF * V1_REF, 2)],
        [f"R₂ = {ind(R2_REF, 0)} Ω", ind(I2_REF, 3), ind(VP_REF, 2), ind(I2_REF * VP_REF, 2)],
        [f"R₃ = {ind(R3_REF, 0)} Ω", ind(I3_REF, 3), ind(VP_REF, 2), ind(I3_REF * VP_REF, 2)],
        ["<strong>Sumber 48 V</strong>", ind(I_REF, 3), "48", f"<strong>{ind(48 * I_REF, 2)}</strong>"],
    ])
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> jumlah daya ketiga resistor ({ind(I_REF * V1_REF + I2_REF * VP_REF + I3_REF * VP_REF, 2)} W) sama dengan daya sumber ({ind(48 * I_REF, 2)} W): pemeriksaan energi yang selalu layak dilakukan. Soal C12 memakai jaringan seperti ini dengan angka dari NIM Anda.")
    m += bagian(3, "m-kirchhoff", "Hukum Kirchhoff<br>dan Reduksi Jaringan",
                "Dua hukum Kirchhoff menyatakan hal yang sederhana, yaitu muatan tidak hilang di simpul dan energi tidak hilang mengelilingi loop, tetapi bersama hukum Ohm keduanya cukup untuk menyelesaikan jaringan resistif apa pun. Untuk jaringan satu sumber, reduksi seri–paralel biasanya sudah cukup, dan Kirchhoff dipakai untuk memeriksa hasilnya. KCL dituliskan pada Persamaan (5) dan KVL pada Persamaan (6). Gambar 3 memberi contoh yang dipakai sepanjang bagian ini.",
                isi, "HUKUM KIRCHHOFF")

    # 04 — daya, rugi, efisiensi
    isi = figure(4, "Daya beban dan rugi saluran terhadap arus", "Daya beban naik linear dengan arus, rugi saluran naik kuadrat; pada arus besar rugi menjadi bagian yang berarti dan efisiensi turun.", gambar4())
    isi += formula(7, "Efisiensi Penyaluran DC", r"\eta = \dfrac{P_{beban}}{P_{beban} + I^2 R_{sal}} = \dfrac{V_{beban}}{V_{beban} + I R_{sal}}",
                   r"\(R_{sal}\) = resistansi total saluran pergi-pulang. Beban 48 V berarus 40 A melalui saluran 0,12 Ω: \(P_{beban} = 1920\) W, \(P_{rugi} = 40^2\times0{,}12 = 192\) W, \(\eta = 1920/2112 \approx 90{,}9\%\).",
                   "Bentuk kedua memperlihatkan bahwa efisiensi penyaluran sama dengan perbandingan tegangan beban terhadap tegangan sumber. Menaikkan tegangan sistem (12 → 48 → 400 V) menurunkan arus untuk daya yang sama, sehingga rugi kuadratik jatuh drastis, alasan yang sama dengan transmisi AC bertegangan tinggi di Modul 1.",
                   [(r"\eta", "Efisiensi penyaluran"), ("P_{beban}", "Daya yang diterima beban (W)"), ("I", "Arus saluran (A)"), ("R_{sal}", "Resistansi saluran pergi-pulang (Ω)"), ("V_{beban}", "Tegangan di beban (V)")])
    isi += cards([
        ("🔥", "Rugi Joule", "Setiap ampere yang melewati resistansi mengubah energi menjadi panas sebesar \\(I^2R\\). Pada kabel, panas ini terbuang; pada pemanas, itulah gunanya.", r"\(P = I^2 R\)"),
        ("📉", "Jatuh Tegangan", "Kabel seri dengan beban 'merampas' tegangan \\(IR_{sal}\\); beban menerima kurang dari tegangan sumber. Motor dan lampu bekerja di bawah spesifikasinya.", r"\(V_{beban} = E - IR_{sal}\)"),
        ("⬆️", "Tegangan Lebih Tinggi", "Untuk daya sama, menggandakan tegangan membagi dua arus dan membagi empat rugi. Sistem PLTS rumah bergeser dari 12 V ke 48 V; EV memakai 400–800 V.", r"\(P_{rugi} \propto 1/V^2\)"),
        ("🧾", "Energi Rugi", "Rugi daya kecil yang berlangsung ribuan jam menjadi energi besar: kabel 100 W rugi selama 8 jam/hari setahun membuang hampir 300 kWh.", r"\(E_{rugi} = P_{rugi}\,t\)"),
        ("🎯", "Sasaran Rancangan", "Praktik lazim: jatuh tegangan kabel ≤ 3% pada cabang dan ≤ 5% total dari sumber ke beban terjauh; efisiensi kabel ≥ 95%.", None),
        ("🔋", "Efisiensi Baterai", "Baterai pun punya hambatan dalam; saat diisi dan dikosongkan sebagian energi hilang sebagai panas \\(I^2 r\\). Pengisian cepat berarti rugi lebih besar.", None),
    ])
    isi += tabel(["Tegangan sistem", "Arus untuk 2,4 kW", "Rugi pada R_sal = 0,12 Ω", "Efisiensi"], [
        [f"{v} V", ind(2400 / v, 1) + " A", ind((2400 / v) ** 2 * 0.12, 1) + " W", ind(2400 / (2400 + (2400 / v) ** 2 * 0.12) * 100, 2) + "%"] for v in [12, 24, 48, 96, 400]
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> daya beban dan kabel sama, hanya tegangan sistem yang berubah. Pada 12 V, 2,4 kW memerlukan 200 A dan rugi 4,8 kW, lebih besar daripada bebannya sendiri; pada 48 V rugi tinggal 300 W; pada 400 V hampir tak terasa. Inilah alasan sistem daya besar tidak pernah berjalan pada tegangan rendah, dan pilihan tegangan adalah keputusan pertama dalam merancang sistem DC.")
    m += bagian(4, "m-energi", "Daya, Rugi,<br>dan Efisiensi Penyaluran",
                "Sumber harus memasok daya beban ditambah semua rugi di antaranya. Pada jaringan DC, rugi hampir seluruhnya adalah rugi Joule pada kabel, yang berbanding kuadrat arus. Efisiensi penyaluran dituliskan pada Persamaan (7), dan Gambar 4 memperlihatkan mengapa arus besar begitu mahal.",
                isi, "DAYA DAN EFISIENSI")

    # 05 — sumber nyata & transfer daya maksimum
    isi = figure(5, "Transfer daya maksimum dan efisiensi terhadap R_L", "Daya ke beban memuncak saat resistansi beban sama dengan hambatan dalam sumber, tetapi pada titik itu separuh daya terbuang di dalam sumber; sistem tenaga bekerja jauh di kanan titik ini.", gambar5())
    isi += formula(8, "Sumber Nyata: Tegangan Terminal", r"V_t = E - I\,r, \qquad I_{sc} = \dfrac{E}{r}",
                   rf"Baterai 12,6 V dengan hambatan dalam {ind(R_BAT, 2)} Ω: saat memasok 60 A, \(V_t = 12{{,}}6 - 60\times{ind(R_BAT, 2)} = 9{{,}}6\) V; arus hubung singkatnya \(12{{,}}6/{ind(R_BAT, 2)} = 252\) A. Tegangan terminal turun linear terhadap arus.",
                   "Tidak ada sumber yang ideal: baterai, panel surya, dan generator semuanya 'melemah' saat dibebani. Hambatan dalam yang kecil (baterai starter mobil: miliohm) berarti tegangan stabil dan arus hubung singkat sangat besar, ratusan sampai ribuan ampere.",
                   [("V_t", "Tegangan terminal berbeban (V)"), ("E", "Ggl, tegangan tanpa beban (V)"), ("I", "Arus beban (A)"), ("r", "Hambatan dalam sumber (Ω)"), ("I_{sc}", "Arus hubung singkat (A)")])
    isi += formula(9, "Transfer Daya Maksimum", r"P_L = \dfrac{E^2 R_L}{(r + R_L)^2}, \qquad P_{L,maks} = \dfrac{E^2}{4r}\ \text{ saat } R_L = r, \qquad \eta = \dfrac{R_L}{r + R_L}",
                   rf"Sumber 24 V, r = 1 Ω: \(P_{{L,maks}} = 24^2/4 = 144\) W pada \(R_L = 1\) Ω dengan efisiensi hanya 50%. Baterai 12,6 V/{ind(R_BAT, 2)} Ω contoh: \(P_{{maks}} = {ind(P_MAKS, 0)}\) W pada 126 A, jauh di luar arus kerja normalnya.",
                   "Teorema ini penting untuk sinyal dan antena, tetapi pada sistem tenaga justru dihindari: kita ingin efisiensi tinggi, jadi beban dibuat jauh lebih besar daripada hambatan dalam (\\(R_L \\gg r\\)). Titik \\(R_L = r\\) lebih berguna sebagai batas: arus beban tidak boleh mendekati \\(E/2r\\).",
                   [("P_L", "Daya ke beban (W)"), ("R_L", "Resistansi beban (Ω)"), ("r", "Hambatan dalam sumber (Ω)"), ("E", "Ggl sumber (V)"), (r"\eta", "Efisiensi penyaluran")])
    isi += cards([
        ("🔋", "Baterai", "Ggl bergantung kimia dan keadaan muatan (Li-ion 3,6–4,2 V/sel); hambatan dalam naik saat dingin dan saat baterai menua. Regulasi tegangan yang buruk adalah tanda baterai lemah.", None),
        ("☀️", "Panel Surya", "Bukan sumber tegangan tetap: kurva I–V-nya melengkung, dengan titik daya maksimum (MPP) yang dicari pengendali MPPT, penerapan langsung gagasan transfer daya maksimum.", None),
        ("⚙️", "Generator DC", "Tegangan terminal turun bersama beban karena resistansi jangkar dan reaksi jangkar; regulasinya dinyatakan (\\(E - V_t\\))/\\(V_t\\).", r"\(VR = (E - V_t)/V_t\)"),
        ("🛠️", "Pengukuran r", "Ukur tegangan tanpa beban (E) dan tegangan pada arus beban diketahui: \\(r = (E - V_t)/I\\). Cara praktis menilai baterai di lapangan.", r"\(r = (E - V_t)/I\)"),
        ("🚗", "Starter Mobil", "Motor starter menarik 150–300 A; baterai dengan r 10 mΩ turun 1,5–3 V saat start, itulah sebabnya lampu meredup sesaat.", None),
        ("⚠️", "Hubung Singkat", "Arus \\(E/r\\) pada baterai besar mencapai ribuan ampere; kabel dapat meleleh dalam hitungan detik. Sekring dan pemutus DC wajib dipasang sedekat mungkin ke baterai.", None),
    ])
    isi += tabel(["Arus beban (A)", "V terminal (V)", "P beban (W)", "P rugi dalam (W)", "Efisiensi"],
                 [[f"{i}", ind(E_BAT - i * R_BAT, 2), ind((E_BAT - i * R_BAT) * i, 1), ind(i * i * R_BAT, 1), ind((E_BAT - i * R_BAT) / E_BAT * 100, 1) + "%"] for i in [10, 30, 60, 126, 200]])
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> baterai 12,6 V/{ind(R_BAT, 2)} Ω memberi daya terbesar pada 126 A, tetapi efisiensinya tinggal 50% dan separuh energi memanaskan baterai. Pada 30 A efisiensi 88%; itulah wilayah kerja yang wajar. Soal C11 dan C15 memakai kedua sudut pandang ini: daya maksimum dan efisiensi.")
    m += bagian(5, "m-transfer", "Sumber Nyata dan<br>Transfer Daya Maksimum",
                "Setiap sumber punya hambatan dalam, sehingga tegangan terminalnya turun saat dibebani dan sebagian daya hilang di dalam sumber itu sendiri. Dari sini lahir dua hasil penting: tegangan terminal pada Persamaan (8) dan teorema transfer daya maksimum pada Persamaan (9), yang sekaligus menunjukkan mengapa sistem tenaga tidak pernah dioperasikan pada titik daya maksimum. Gambar 5 memperlihatkan kedua kurvanya.",
                isi, "SUMBER NYATA DAN TRANSFER DAYA")

    # 06 — kabel DC
    isi = figure(6, "Tegangan sepanjang kabel DC untuk dua penampang", f"Beban {ind(I_KAB, 0)} A pada 48 V sejauh {ind(L_KAB, 0)} m: kabel 6 mm² menjatuhkan {ind(DV_KAB, 2)} V ({ind(DV_KAB / 48 * 100, 1)}%), melampaui batas 3%; kabel 16 mm² memenuhinya.", gambar6())
    isi += formula(10, "Jatuh Tegangan dan Penampang Kabel DC", r"\Delta V = I\,\rho\,\dfrac{2L}{A} \qquad\Rightarrow\qquad A_{min} = \dfrac{2\,\rho\,L\,I}{\Delta V_{maks}}",
                   rf"Faktor 2 karena arus pergi dan pulang. Tembaga \(\rho = 0{{,}}0172\) Ω·mm²/m. Beban {ind(I_KAB, 0)} A, {ind(L_KAB, 0)} m, batas 3% dari 48 V (= 1,44 V): \(A_{{min}} = 2\times0{{,}}0172\times{ind(L_KAB, 0)}\times{ind(I_KAB, 0)}/1{{,}}44 \approx {ind(A_MIN, 1)}\) mm², jadi dipilih 25 mm² (ukuran standar di atasnya).",
                   "Dua syarat menentukan kabel: kemampuan hantar arus (agar tidak panas) dan jatuh tegangan (agar beban menerima tegangan cukup). Pada DC tegangan rendah dan jarak puluhan meter, jatuh tegangan hampir selalu yang menentukan, dan hasilnya sering jauh lebih tebal daripada yang diduga.",
                   [(r"\Delta V", "Jatuh tegangan pergi-pulang (V)"), ("I", "Arus beban (A)"), (r"\rho", "Resistivitas (Ω·mm²/m)"), ("L", "Panjang satu arah (m)"), ("A", "Luas penampang (mm²)"), (r"\Delta V_{maks}", "Batas jatuh tegangan yang diizinkan (V)")])
    isi += cards([
        ("☀️", "PLTS Off-Grid", "Panel → pengendali muatan → baterai 12/24/48 V → beban. Kabel panel dan kabel beban dihitung terpisah; batas 3% per bagian.", None),
        ("🚗", "Kendaraan Listrik", "Paket 400–800 V menurunkan arus kabel utama; tetapi jaringan 12 V untuk lampu dan elektronika masih memakai puluhan ampere dan kabel tebal.", None),
        ("🖥️", "Pusat Data DC", "Distribusi 48 V DC (dan kini 380 V DC) ke rak server menghilangkan tahap konversi AC–DC berulang dan menaikkan efisiensi beberapa persen.", None),
        ("⚡", "Pengelasan DC", "Arus 100–300 A pada 20–40 V: kabel las 35–70 mm². Kabel yang terlalu panjang dan tipis membuat busur tidak stabil karena tegangan jatuh.", None),
        ("🏭", "Panel Kontrol 24 V DC", "Sensor dan aktuator PLC berarus kecil, tetapi puluhan cabang pada satu catu daya: KCL menjumlahkan arusnya, kabel utama harus cukup.", None),
        ("🔌", "Sambungan dan Terminal", "Sambungan longgar menambah resistansi seri kecil yang, pada arus besar, memanas dan menjadi sumber kebakaran; \\(I^2R\\) berlaku juga pada terminal.", None),
    ])
    isi += tabel(["Kabel Cu", "R pergi-pulang 30 m", "ΔV pada 25 A", "ΔV (%)", "Rugi (W)", "Memenuhi 3%?"],
                 [[f"{A} mm²", ind(2 * RHO_CU * 30 / A, 4) + " Ω", ind(2 * RHO_CU * 30 * 25 / A, 2) + " V", ind(2 * RHO_CU * 30 * 25 / A / 48 * 100, 2), ind(25 * 2 * RHO_CU * 30 * 25 / A, 1), "✓" if 2 * RHO_CU * 30 * 25 / A <= 1.44 else "✗"] for A in [4, 6, 10, 16, 25, 35]])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> saat memasang mesin bertenaga DC (bor, pompa, kompresor 48 V di bengkel bertenaga surya) atau pengisi daya, dua pertanyaan menentukan: berapa arusnya dan berapa jauh dari sumber. Tabel di atas menunjukkan bahwa memindahkan beban 30 m jauhnya mengubah kabel dari 6 mm² menjadi 25 mm². Mendekatkan sumber, menaikkan tegangan, atau memperbesar kabel adalah tiga cara yang selalu tersedia.")
    m += bagian(6, "m-kabel", "Kabel DC: Jatuh Tegangan<br>dan Pemilihan Penampang",
                "Semua hukum di atas bertemu pada satu keputusan praktis: seberapa tebal kabel dari sumber ke beban. Kabel adalah resistor seri dengan beban; ia menjatuhkan tegangan dan membuang daya, dan keduanya berbanding lurus dengan panjang serta berbanding terbalik dengan penampang. Persamaan (10) menghitung jatuh tegangan dan penampang minimum. Gambar 6 membandingkan dua penampang untuk beban yang sama.",
                isi, "KABEL DC")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Jaringan Seri–Paralel: Reduksi, Arus, dan Tegangan \(R_1 + (R_2 \parallel R_3)\)", "cvSeriParalel",
                     [("sl_sp_v", "v_sp_v", "Tegangan sumber V (V)", 12, 96, 1, 48, "48"), ("sl_sp_r1", "v_sp_r1", "R₁ seri (Ω)", 0.5, 20, 0.5, 4, "4.0"), ("sl_sp_r2", "v_sp_r2", "R₂ paralel (Ω)", 1, 40, 0.5, 12, "12.0"), ("sl_sp_r3", "v_sp_r3", "R₃ paralel (Ω)", 1, 40, 0.5, 6, "6.0")],
                     "btnSeriParalel", "toggleSeriParalel", "seriParalelInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Titik-titik bergerak menggambarkan arus; makin rapat, makin besar arusnya. Readout menunjukkan hasil reduksi dan pemeriksaan KCL/KVL.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Memperkecil R₃ menarik lebih banyak arus ke cabangnya</strong> dan memperkecil R_par, sehingga arus total naik dan tegangan pada R₁ ikut naik. (2) V₁ + V_par selalu sama dengan V (KVL) dan I₂ + I₃ selalu sama dengan I (KCL). (3) Soal C12 memakai jaringan ini.")
    isi += anim_panel(2, "amber", r"Transfer Daya Maksimum dan Efisiensi terhadap \(R_L\)", "cvTransfer",
                      [("sl_td_e", "v_td_e", "Ggl sumber E (V)", 6, 48, 1, 24, "24"), ("sl_td_r", "v_td_r", "Hambatan dalam r (Ω)", 0.1, 3, 0.05, 1.0, "1.00")],
                      "btnTransfer", "toggleTransfer", "transferInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kurva hijau adalah daya beban, kurva jingga putus-putus efisiensi, sumbu mendatar R_L dalam kelipatan r; titik-titik menyapu R_L dari kecil ke besar.<br>Amati: (1) <strong style=\"color:var(--amber)\">Daya memuncak tepat di R_L = r</strong> dengan nilai E²/4r, dan efisiensi di sana 50%. (2) Memperkecil r menaikkan puncak daya dengan cepat (∝ 1/r). (3) Di R_L = 4r efisiensi sudah 80% walau daya tinggal 64% dari puncak; sistem tenaga memilih wilayah ini. Soal C11 dan C15.")
    isi += anim_panel(3, "green", r"Jatuh Tegangan Kabel DC dan Pemilihan Penampang \(\Delta V = I\rho\,2L/A\)", "cvKabel",
                      [("sl_kb_i", "v_kb_i", "Arus beban I (A)", 5, 100, 1, 25, "25"), ("sl_kb_l", "v_kb_l", "Panjang satu arah L (m)", 5, 100, 1, 30, "30"), ("sl_kb_b", "v_kb_b", "Batas jatuh tegangan (%)", 1, 8, 0.5, 3, "3.0")],
                      "btnKabel", "toggleKabel", "kabelInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Setiap batang adalah jatuh tegangan untuk satu ukuran kabel tembaga standar pada sistem 48 V; batang merah melampaui batas, hijau adalah ukuran terkecil yang memenuhi.<br>Amati: (1) <strong style=\"color:var(--green)\">Menggandakan panjang menggandakan jatuh tegangan</strong>, dan penampang yang diperlukan ikut berlipat. (2) Batas 3% pada 48 V hanya 1,44 V, sangat ketat dibanding pada 400 V. (3) Readout memberi penampang minimum hasil Persamaan (10); soal C10 dan C13 memakainya.")
    isi += anim_panel(4, "pink", r"Sumber Nyata: Tegangan Terminal dan Daya terhadap Arus \(V_t = E - Ir\)", "cvSumber",
                      [("sl_sn_e", "v_sn_e", "Ggl E (V)", 6, 60, 0.2, 12.6, "12.6"), ("sl_sn_r", "v_sn_r", "Hambatan dalam r (Ω)", 0.005, 0.5, 0.005, 0.05, "0.050"), ("sl_sn_imax", "v_sn_imax", "Rentang arus tampilan (A)", 20, 400, 10, 120, "120")],
                      "btnSumber", "toggleSumber", "sumberInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Garis biru adalah tegangan terminal yang turun linear terhadap arus; kurva hijau putus-putus adalah daya yang diterima beban.<br>Amati: (1) <strong style=\"color:var(--pink)\">Memperbesar r membuat garis tegangan lebih curam</strong>; sumber 'lemah' cepat kehilangan tegangan. (2) Daya beban memuncak di I = E/2r (setengah arus hubung singkat), titik yang sama dengan R_L = r. (3) Readout menampilkan arus hubung singkat E/r, angka yang menentukan sekring di dekat baterai. Soal C8.")
    isi += kotak("info-box", "<strong>🔍 Latihan Mandiri:</strong> pada Animasi 3 atur 25 A, 30 m, batas 3%: kabel yang dipilih harus 25 mm², sesuai Bagian 06. Naikkan batas ke 5% dan lihat kabel mana yang kini cukup. Lalu pada Animasi 2 cari R_L yang memberi efisiensi 90% dan bandingkan dayanya dengan puncak.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Jaringan DC",
                "Geser parameter dan amati langsung bagaimana arus terbagi di jaringan seri–paralel, di mana daya beban memuncak dan berapa efisiensinya, bagaimana panjang dan penampang kabel menentukan jatuh tegangan, serta bagaimana sumber nyata melemah saat dibebani. Empat animasi ini menghubungkan Persamaan (1)–(10) dengan keputusan rancangan yang nyata.",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; cetak dengan angka desimal secukupnya dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Hukum Ohm, Daya, Energi, dan Sumber Nyata", '''import numpy as np

# ═══ Hukum Ohm dan daya (Persamaan 1–2) ═══
V, R = 48.0, 8.0
I = V / R
print(f"I = {I:.4f} A;  P = V*I = {V*I:.4f} W = I^2 R = {I**2*R:.4f} W = V^2/R = {V**2/R:.4f} W")

# ═══ Energi dan biaya ═══
jam, hari, tarif = 5, 30, 1444.70
E_kWh = V * I * jam * hari / 1000
print(f"Energi sebulan = {E_kWh:.4f} kWh;  biaya = Rp {E_kWh*tarif:,.2f}")

# ═══ Sumber nyata (Persamaan 8) ═══
E_ggl, r = 12.6, 0.05
for I_beban in [10, 30, 60, 126]:
    Vt = E_ggl - I_beban * r
    print(f"I = {I_beban:4d} A -> V_t = {Vt:.3f} V, P_beban = {Vt*I_beban:.1f} W, rugi dalam = {I_beban**2*r:.1f} W")
print(f"Arus hubung singkat = {E_ggl/r:.1f} A")''')
    isi += kode("Cell 2 — Reduksi Seri–Paralel dan Pemeriksaan Kirchhoff", '''import numpy as np

def seri(*R):     return sum(R)                     # Persamaan 3
def paralel(*R):  return 1 / sum(1/r for r in R)    # Persamaan 4

V, R1, R2, R3 = 48.0, 4.0, 12.0, 6.0
R_par = paralel(R2, R3)
R_tot = seri(R1, R_par)
I = V / R_tot
V1, V_par = I * R1, I * R_par                        # pembagi tegangan
I2, I3 = V_par / R2, V_par / R3                       # arus cabang
print(f"R_par = {R_par:.4f} ohm, R_total = {R_tot:.4f} ohm, I = {I:.4f} A")
print(f"V1 = {V1:.4f} V, V_par = {V_par:.4f} V  -> KVL: V1 + V_par = {V1 + V_par:.4f} V")
print(f"I2 = {I2:.4f} A, I3 = {I3:.4f} A     -> KCL: I2 + I3 = {I2 + I3:.4f} A")
P = {"R1": I**2*R1, "R2": I2**2*R2, "R3": I3**2*R3}
print(f"Daya tiap resistor: {P};  jumlah = {sum(P.values()):.4f} W = V*I = {V*I:.4f} W")''')
    isi += kode("Cell 3 — Efisiensi Penyaluran, Transfer Daya Maksimum, dan Kurva P_L(R_L)", '''import numpy as np
import matplotlib.pyplot as plt

# Efisiensi penyaluran (Persamaan 7)
V_beban, I, R_sal = 48.0, 40.0, 0.12
P_beban, P_rugi = V_beban * I, I**2 * R_sal
print(f"P_beban = {P_beban:.1f} W, P_rugi = {P_rugi:.1f} W, eta = {P_beban/(P_beban+P_rugi)*100:.4f} %")

# Transfer daya maksimum (Persamaan 9)
E, r = 24.0, 1.0
RL = np.linspace(0.05, 6, 400)
P_L = E**2 * RL / (r + RL)**2
eta = RL / (r + RL) * 100
print(f"P_maks = E^2/(4r) = {E**2/(4*r):.4f} W pada R_L = {r} ohm (eta = 50 %)")
print(f"Pada R_L = 4r: P_L = {E**2*4*r/(5*r)**2:.4f} W, eta = {4/5*100:.1f} %")

fig, ax1 = plt.subplots(figsize=(8, 4))
ax1.plot(RL, P_L, color='tab:green', label='P_L'); ax1.set_xlabel('R_L (ohm)'); ax1.set_ylabel('P_L (W)')
ax2 = ax1.twinx(); ax2.plot(RL, eta, '--', color='tab:orange', label='eta'); ax2.set_ylabel('eta (%)')
ax1.axvline(r, ls=':', color='tab:red'); plt.title('Transfer daya maksimum vs efisiensi'); plt.grid(True); plt.show()''')
    isi += kode("Cell 4 — Jatuh Tegangan Kabel DC dan Pemilihan Penampang", '''import numpy as np

rho_Cu = 0.0172                        # ohm mm^2 / m
V_sistem, I, L = 48.0, 25.0, 30.0      # V, A, m (satu arah)
batas = 0.03
dV_maks = batas * V_sistem
A_min = 2 * rho_Cu * L * I / dV_maks   # Persamaan 10
print(f"dV_maks = {dV_maks:.4f} V;  A_min = {A_min:.4f} mm^2")

standar = np.array([1.5, 2.5, 4, 6, 10, 16, 25, 35, 50])
cukup = standar[standar >= A_min]
print(f"Kabel dipilih = {cukup[0]} mm^2" if cukup.size else "Perlu kabel > 50 mm^2 atau tegangan lebih tinggi")

for A in [6, 16, 25]:
    dV = 2 * rho_Cu * L * I / A
    print(f"{A:3.0f} mm^2: dV = {dV:.4f} V ({dV/V_sistem*100:.2f} %), rugi = {I*dV:.2f} W, eta = {V_sistem*I/(V_sistem*I+I*dV)*100:.3f} %")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan angka di Bagian 03–06: I = {ind(I_REF, 3)} A pada jaringan contoh, P_maks = 144 W untuk sumber 24 V/1 Ω, dan kabel 25 mm² untuk 25 A sejauh 30 m. Cell 2–4 memuat pola penyelesaian soal Hard C11–C15; pahami langkahnya, jangan hanya menyalin angkanya.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut adalah fondasi kode untuk mengerjakan tugas. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya. Setiap perhitungan diberi nomor persamaan yang dipakainya supaya dapat ditelusuri kembali ke materi.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "C. K. Alexander &amp; M. N. O. Sadiku", "Fundamentals of Electric Circuits", ", Seventh Edition. McGraw-Hill, 2021.", "Bab 1–2 (hukum dasar, seri–paralel), Bab 4 (transfer daya maksimum): rujukan utama Modul 3 dan 4.")
    refs += pm_ref(2, "amber", "249,115,22", "J. D. Irwin &amp; D. V. Kerns, Jr.", "Introduction to Electrical Engineering", ". Prentice Hall, 1995.", "Bab 1–3: hukum Ohm, Kirchhoff, dan daya pada rangkaian DC; pustaka utama RPS.")
    refs += pm_ref(3, "violet", "168,85,247", "R. L. Boylestad", "Introductory Circuit Analysis", ", Thirteenth Edition. Pearson, 2016.", "Bab 5–7: rangkaian seri, paralel, dan seri–paralel dengan banyak contoh bertahap.")
    refs += pm_ref(4, "green", "0,224,158", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 1: besaran dasar listrik dan rugi Joule dalam konteks sistem tenaga.")
    refs += pm_ref(5, "pink", "236,72,153", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 2: tinjauan rangkaian dan daya sebagai jembatan ke jaringan AC pada Modul 5.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk hukum Ohm dan Kirchhoff, jaringan seri–paralel, transfer daya maksimum, dan rugi penyaluran DC. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> tabel kemampuan hantar arus kabel dari PUIL 2011 (SNI 0225) dan katalog pabrikan kabel memberi batas arus per penampang untuk berbagai cara pemasangan; simulator rangkaian daring (mis. Falstad) berguna untuk memeriksa hasil reduksi seri–paralel. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V = I·R</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">1/R_par = Σ 1/R_k</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">P_maks = E²/(4r)</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">V_t = E − I·r</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">ΔV = I·ρ·2L/A</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Jaringan DC</em><br>Satu Sumber</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar hukum Ohm dan daya, seri–paralel, pembagi tegangan dan arus, sumber nyata, efisiensi penyaluran, transfer daya maksimum, dan pemilihan kabel DC. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Menurut <strong>hukum Ohm</strong>, arus yang mengalir melalui resistor...",
     ["Sebanding dengan resistansi dan berbanding terbalik dengan tegangan", "Sebanding dengan tegangan dan berbanding terbalik dengan resistansi", "Tidak bergantung pada tegangan", "Sebanding dengan kuadrat tegangan"],
     "Hukum Ohm"),
    ("Daya yang diubah menjadi panas pada resistor \\(R\\) yang dialiri arus \\(I\\) pada tegangan \\(V\\) dapat ditulis...",
     ["\\(P = V/I\\) saja", "\\(P = I/R\\)", "\\(P = V \\cdot R\\)", "\\(P = V\\,I = I^2 R = V^2/R\\)"],
     "Bentuk-bentuk daya resistor"),
    ("Resistansi ekuivalen beberapa resistor yang dihubungkan <strong>paralel</strong> selalu...",
     ["Lebih kecil daripada resistor terkecilnya", "Lebih besar daripada resistor terbesarnya", "Sama dengan jumlah semua resistor", "Sama dengan rata-rata resistor"],
     "Resistansi paralel"),
    ("<strong>Hukum arus Kirchhoff (KCL)</strong> menyatakan bahwa pada setiap simpul...",
     ["Tegangan semua cabang sama dengan nol", "Arus terbesar mengalir ke cabang beresistansi terbesar", "Jumlah arus yang masuk sama dengan jumlah arus yang keluar", "Daya yang masuk selalu lebih besar daripada yang keluar"],
     "KCL"),
    ("<strong>Hukum tegangan Kirchhoff (KVL)</strong> menyatakan bahwa...",
     ["Tegangan pada semua resistor paralel berbeda-beda", "Jumlah aljabar tegangan mengelilingi lintasan tertutup sama dengan nol", "Tegangan sumber selalu lebih kecil daripada tegangan beban", "Arus mengelilingi loop selalu nol"],
     "KVL"),
    ("Dalam rangkaian <strong>seri</strong> dengan satu sumber...",
     ["Tegangan pada setiap resistor sama", "Arus terbagi sebanding resistansi", "Resistor terkecil mendapat tegangan terbesar", "Arus sama di setiap resistor dan tegangan terbagi sebanding resistansi"],
     "Sifat rangkaian seri"),
    ("Daya yang diserap beban dari sumber ber-ggl \\(E\\) dengan hambatan dalam \\(r\\) mencapai <strong>maksimum</strong> ketika...",
     ["\\(R_L = r\\)", "\\(R_L = 0\\)", "\\(R_L\\) sebesar mungkin", "\\(R_L = 2r\\)"],
     "Syarat transfer daya maksimum"),
    ("Pada keadaan transfer daya maksimum, efisiensi penyaluran daya dari sumber ke beban adalah...",
     ["100%", "75%", "50%", "25%"],
     "Efisiensi saat transfer daya maksimum"),
    ("Tegangan terminal baterai <strong>turun</strong> saat arus beban naik karena...",
     ["Ggl baterai berubah mengikuti beban", "Jatuh tegangan \\(I\\,r\\) pada hambatan dalam baterai", "Beban paralel selalu menurunkan ggl", "Arus beban mengalir berlawanan arah dengan ggl"],
     "Tegangan terminal vs beban"),
    ("Jatuh tegangan pada kabel DC ke sebuah beban akan <strong>berkurang</strong> bila...",
     ["Panjang kabel diperbesar", "Arus beban diperbesar", "Penampang kabel diperkecil", "Penampang kabel diperbesar atau panjangnya diperpendek"],
     "Faktor jatuh tegangan kabel"),
]

COMP_EZ_LABELS = ["Arus dari hukum Ohm", "Daya P = I²R", "Arus rangkaian seri", "Resistansi paralel tiga resistor", "Pembagi tegangan",
                  "Pembagi arus dua cabang", "Energi lampu DC sebulan", "Tegangan terminal sumber nyata", "Efisiensi penyaluran DC", "Jatuh tegangan kabel pergi-pulang"]
COMP_HARD_LABELS = ["Transfer daya maksimum E²/(4r)", "Daya pada R₃ dalam jaringan seri–paralel", "Penampang kabel minimum untuk ΔV ≤ 3%",
                    "Tegangan beban paralel di ujung saluran", "Efisiensi R_L/(r + R_L)"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
P_BENGKEL = 600 + 200 + 480
I_BENGKEL = P_BENGKEL / 48
DV_6 = 2 * RHO_CU * 25 * I_BENGKEL / 6
DV_16 = 2 * RHO_CU * 25 * I_BENGKEL / 16
DV_BAT = I_BENGKEL * 0.04
V_LAMPU_6 = 48 - DV_BAT - DV_6
V_LAMPU_16 = 48 - DV_BAT - DV_16

FQ_JUDUL = [
    "Hitung arus total dan jatuh tegangan sampai ke lampu: mengapa lampu meredup saat bor dan pompa menyala?",
    "Bandingkan tiga jalan keluar: kabel 16 mm², memindahkan baterai, atau menaikkan tegangan sistem ke 96 V",
    "Perlukah beban 'dicocokkan' dengan hambatan dalam baterai agar dayanya maksimum? Jelaskan dengan efisiensi",
]
FQ_RINGKAS = [
    "Jumlahkan daya bor, lampu, dan pompa (KCL) lalu hitung arus pada 48 V. Hitung jatuh tegangan pada hambatan dalam baterai 0,04 Ω dan pada kabel 6 mm² sepanjang 25 m (pergi-pulang), lalu tegangan yang sampai ke lampu dan persentase penurunannya.",
    "Hitung jatuh tegangan dengan kabel 16 mm², dengan kabel 6 mm² tetapi jarak 8 m, dan dengan sistem 96 V (arus setengah) pada kabel 6 mm². Bandingkan ketiganya dari sisi ΔV, rugi daya, biaya, dan kepraktisan.",
    "Hitung daya maksimum yang bisa diberikan baterai (E²/4r) dan arusnya, lalu efisiensi pada titik itu. Bandingkan dengan arus kerja bengkel dan jelaskan mengapa sistem tenaga tidak dirancang pada titik transfer daya maksimum.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Jumlahkan daya ketiga beban dan hitung arus total pada 48 V (KCL, Persamaan 2 dan 5). Lalu hitung dua jatuh tegangan: pada hambatan dalam baterai (0,04 Ω, Persamaan 8) dan pada kabel 6 mm² sepanjang 25 m pergi-pulang (Persamaan 10). Berapa tegangan yang benar-benar sampai ke lampu, dan berapa persen penurunannya dari 48 V? Jelaskan mengapa lampu terang lagi begitu bor dimatikan.",
            ["I = ΣP / V", "ΔV_bat = I·r", "ΔV_kabel = I·ρ·2L/A"],
            "Jatuh tegangan pada kabel 6 mm² sepanjang 25 m (pergi-pulang) saat ketiga beban menyala adalah sekitar...",
            ["0,38 V, dapat diabaikan", "1,44 V, tepat pada batas 3%", f"{ind(DV_6, 2)} V, sekitar {ind(DV_6 / 48 * 100, 0)}% dari 48 V", "12,8 V, separuh tegangan sistem"],
            f"✅ Tepat! \\(I = {P_BENGKEL}/48 \\approx {ind(I_BENGKEL, 2)}\\) A; \\(\\Delta V = {ind(I_BENGKEL, 2)}\\times0{{,}}0172\\times50/6 \\approx {ind(DV_6, 2)}\\) V. Ditambah \\(I r = {ind(DV_BAT, 2)}\\) V di baterai, lampu hanya menerima \\(\\approx {ind(V_LAMPU_6, 1)}\\) V: jauh di bawah 46,56 V (batas 3%). Saat bor mati arus turun dan tegangan pulih.",
            "❌ Ingat faktor 2 untuk kabel pergi-pulang, dan arus totalnya bukan arus lampu saja: KCL menjumlahkan arus bor, lampu, dan pompa pada kabel yang sama. Hitung \\(I = \\Sigma P/V\\) dulu, lalu \\(\\Delta V = I\\rho(2L)/A\\).",
            "Petunjuk: (1) Hitung arus total dari jumlah daya. (2) Hitung ΔV baterai dan ΔV kabel. (3) Hitung tegangan di lampu dan persentase penurunannya; jelaskan gejala redup.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Ada tiga usulan: (a) mengganti kabel dengan 16 mm², (b) memindahkan baterai ke dalam bengkel sehingga kabel tinggal 8 m, atau (c) menaikkan tegangan sistem ke 96 V (arus menjadi setengah untuk daya yang sama) dengan kabel 6 mm² tetap. Hitung jatuh tegangan dan rugi daya kabel untuk ketiganya (Persamaan 7 dan 10), lalu bandingkan dari sisi teknis dan praktis: biaya tembaga, keamanan, ketersediaan peralatan 96 V, dan pekerjaan yang diperlukan.",
            ["ΔV ∝ L/A", "ΔV ∝ I ∝ 1/V", "rugi = I·ΔV"],
            "Dengan kabel diganti 16 mm² (jarak tetap 25 m), jatuh tegangan kabel menjadi sekitar...",
            [f"{ind(DV_16, 2)} V, sudah di bawah batas 3% (1,44 V)", "Tetap sama, karena arus tidak berubah", f"{ind(DV_6, 2)} V, sama seperti sebelumnya", "Nol, karena kabel 16 mm² tidak beresistansi"],
            f"✅ Tepat! \\(\\Delta V = {ind(I_BENGKEL, 2)}\\times0{{,}}0172\\times50/16 \\approx {ind(DV_16, 2)}\\) V ({ind(DV_16 / 48 * 100, 1)}%), memenuhi batas 3% walau hambatan dalam baterai masih menambah {ind(DV_BAT, 2)} V. Memperpendek kabel ke 8 m atau menaikkan tegangan ke 96 V memberi efek serupa lewat jalur yang berbeda.",
            "❌ Jatuh tegangan berbanding terbalik dengan penampang: kabel 16 mm² menjatuhkan 6/16 dari nilai kabel 6 mm². Kabel tebal tetap beresistansi, hanya lebih kecil. Hitung ulang dengan A = 16 mm².",
            "Petunjuk: (1) Hitung ΔV dan rugi untuk kabel 16 mm², untuk jarak 8 m, dan untuk 96 V. (2) Bandingkan biaya dan kepraktisan. (3) Beri rekomendasi dengan alasan.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Seorang teman berpendapat: 'agar daya maksimum, resistansi beban bengkel harus disamakan dengan hambatan dalam baterai 0,04 Ω'. Hitung daya maksimum itu (Persamaan 9), arus yang mengalir, dan efisiensinya, lalu bandingkan dengan arus kerja bengkel sekitar {ind(I_BENGKEL, 0)} A. Jelaskan mengapa pendapat itu keliru untuk sistem tenaga, dan kapan teorema transfer daya maksimum justru berguna (misalnya pada MPPT panel surya).",
            ["P_maks = E²/(4r)", "I = E/(2r)", "η = R_L/(r+R_L)"],
            "Pada transfer daya maksimum (R_L = r = 0,04 Ω), baterai 48 V akan mengalirkan arus dan bekerja pada efisiensi...",
            ["600 A pada efisiensi 100%", "600 A pada efisiensi 50%, dengan 14,4 kW terbuang di dalam baterai", f"{ind(I_BENGKEL, 0)} A pada efisiensi 95%", "0 A, karena beban sama dengan hambatan dalam"],
            "✅ Tepat! \\(I = E/2r = 48/0{,}08 = 600\\) A dan \\(P_{maks} = 48^2/(4\\times0{,}04) = 14{,}4\\) kW ke beban, tetapi 14,4 kW lainnya memanaskan baterai (η = 50%). Kabel dan baterai akan rusak. Sistem tenaga bekerja pada \\(R_L \\gg r\\): arus puluhan ampere dengan efisiensi di atas 95%.",
            "❌ Pada \\(R_L = r\\) separuh daya terbuang di hambatan dalam, sehingga efisiensinya hanya 50%, dan arusnya \\(E/2r\\), ratusan ampere untuk baterai ber-r kecil. Hitung dulu \\(I = E/2r\\).",
            "Petunjuk: (1) Hitung P_maks, I, dan η pada R_L = r. (2) Bandingkan dengan arus kerja bengkel. (3) Jelaskan mengapa sistem tenaga memilih R_L ≫ r, dan sebutkan kapan teorema ini berguna.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">I = ΣP/V</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">ΔV = I·ρ·2L/A</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">V_t = E − I·r</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">6 mm² → 16 mm²?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Lampu Bengkel<br><em>yang Meredup</em></h1>
    <p class="hero-sub">Sebuah bengkel desa bertenaga surya 48 V DC mengeluh lampunya meredup setiap kali bor dan pompa menyala. Terapkan kosakata Pertemuan {PERTEMUAN} — KCL, jatuh tegangan kabel, hambatan dalam baterai, dan transfer daya — untuk mendiagnosis penyebabnya dan menilai usulan perbaikannya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Bertenaga Surya 48 V —<br>Mengapa Lampu Meredup?</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS JARINGAN DC SATU SUMBER</div>
    <p>
      Sebuah <strong style="color:var(--amber)">bengkel las dan bubut di desa</strong> memakai PLTS off-grid: panel surya mengisi <strong style="color:var(--cyan)">bank baterai 48 V</strong> (ggl 48 V, hambatan dalam 0,04 Ω) yang diletakkan di rumah panel, <strong style="color:var(--pink)">25 meter</strong> dari bengkel. Kabel ke bengkel adalah tembaga <strong>6 mm²</strong>. Bebannya: bor duduk 600 W, lampu LED 200 W, dan pompa air 480 W, semuanya 48 V DC dan dipasang paralel pada satu panel di bengkel.
    </p>
    <p style="margin-top:12px">
      Keluhan: lampu <strong>terang saat sendirian, meredup jelas begitu bor dan pompa menyala</strong>, dan pompa terasa lemah. Tiga usulan masuk: <strong>(a)</strong> mengganti kabel dengan <strong style="color:var(--amber)">16 mm²</strong>, <strong>(b)</strong> memindahkan baterai ke dalam bengkel (kabel tinggal 8 m), atau <strong>(c)</strong> menaikkan tegangan sistem ke <strong style="color:var(--amber)">96 V</strong>. Seorang teman malah mengusulkan 'mencocokkan' beban dengan hambatan dalam baterai supaya dayanya maksimum.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menjelaskan gejalanya dengan angka dan menilai usulan-usulan itu <strong style="color:var(--cyan)">sebelum</strong> bengkel mengeluarkan biaya.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Baterai: 48 V, r = 0,04 Ω", "14,165,233", "cyan")}
{kartu("Kabel: Cu 6 mm², 25 m", "14,165,233", "cyan")}
{kartu(f"Beban: {P_BENGKEL} W paralel", "14,165,233", "cyan")}
{kartu("Batas rancangan: ΔV ≤ 3%", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Lampu yang meredup bukan lampu yang rusak: ia hanya menerima tegangan lebih rendah karena berbagi kabel dengan beban lain. Forum ini mengajak Anda menghitung <strong>berapa</strong> tegangan yang benar-benar sampai, <strong>usulan mana</strong> yang paling masuk akal, dan <strong>mengapa</strong> teorema transfer daya maksimum tidak boleh dipakai di sini.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Tegangan dari ggl baterai ke terminal, lalu sepanjang kabel ke bengkel, untuk kabel 6 mm² dan 16 mm² saat ketiga beban menyala</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Bengkel desa bertenaga PLTS off-grid: bank baterai 48 V (ggl 48 V, r = 0,04 Ω) berjarak 25 m dari bengkel, kabel Cu 6 mm². Beban paralel: bor 600 W, lampu LED 200 W, pompa 480 W (total {P_BENGKEL} W). Lampu meredup saat bor dan pompa menyala. Usulan: (a) kabel 16 mm², (b) baterai dipindah ke bengkel (8 m), (c) sistem 96 V; ada pula usul 'mencocokkan' beban dengan hambatan dalam baterai."
FORUM_CHIPS_LMS = ["baterai = 48 V, r 0,04 Ω", "kabel = Cu 6 mm², 25 m", f"beban = {P_BENGKEL} W paralel", "batas = ΔV 3%"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Profil tegangan dari baterai ke bengkel (Pertemuan 3)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const padL = 56, padR = 150, padT = 16, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const E = 48, r = 0.04, I = 1280 / 48, rho = 0.0172, L = 25;
  const Vt = E - I * r;
  const vMin = 40, vMax = 49;
  const sy = (v) => padT + plotH - (v - vMin) / (vMax - vMin) * plotH;
  const sx = (m) => padL + plotW * 0.2 + m / L * plotW * 0.8;
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [40, 42, 44, 46, 48].forEach((v) => ctx.fillText(v + ' V', padL - 5, sy(v) + 3));
  ctx.textAlign = 'center';
  ctx.fillText('ggl', padL + plotW * 0.02, H - 8); ctx.fillText('terminal', sx(0), H - 8); ctx.fillText('bengkel (25 m)', sx(L), H - 8);
  // batas 3%
  ctx.strokeStyle = 'rgba(255,179,0,.8)'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(padL, sy(46.56)); ctx.lineTo(padL + plotW, sy(46.56)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,179,0,.9)'; ctx.fillText('batas 3% = 46,56 V', padL + 6, sy(46.56) - 5);
  const profil = [[6, 'rgba(239,68,68,1)', '6 mm²'], [16, 'rgba(0,224,158,1)', '16 mm²']];
  profil.forEach(([A, warna, label]) => {
    const dV = 2 * rho * L * I / A, vB = Vt - dV;
    ctx.strokeStyle = warna; ctx.lineWidth = 2.4; ctx.beginPath();
    ctx.moveTo(padL + plotW * 0.02, sy(E)); ctx.lineTo(sx(0), sy(Vt)); ctx.lineTo(sx(L), sy(vB)); ctx.stroke();
    ctx.fillStyle = warna; ctx.beginPath(); ctx.arc(sx(L), sy(vB), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(label + ': ' + vB.toFixed(2) + ' V (−' + ((E - vB) / E * 100).toFixed(1) + '%)', sx(L) + 8, sy(vB) + 4);
  });
  ctx.fillStyle = 'rgba(148,163,184,.85)';
  ctx.fillText('I = ' + I.toFixed(2) + ' A; ΔV baterai = ' + (I * r).toFixed(2) + ' V', padL + 6, padT + 12);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
