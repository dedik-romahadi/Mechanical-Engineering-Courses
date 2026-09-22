# Konten Modul 2 Teknik Tenaga Listrik — Komponen-Komponen Sistem Tenaga Listrik
# (Sub-CPMK 1.2, Pertemuan 2). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja tidak sama dengan varian soal parametrik mana pun.
import math

from pustaka import (SQ3, AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, teks2,
                     fq, ind, kode, kotak, mc_block, notasi, pm_ref, svg, t, tabel)

NOMOR = 2
PERTEMUAN = 2
SUB_CPMK = "1.2"
JUDUL = "Komponen Sistem Tenaga Listrik"
JUDUL_PANJANG = "Komponen-Komponen Sistem Tenaga Listrik"
JUDUL_EKSPOR = "Komponen Sistem Tenaga Listrik"

# ─────────────────────────── angka contoh ───────────────────────────
S_TRAFO, P_FE, P_CU = 630.0, 1.0, 6.0          # kVA, kW, kW — trafo contoh bagian 03
X_OPT = math.sqrt(P_FE / P_CU)
ETA_OPT = X_OPT * S_TRAFO * 0.85 / (X_OPT * S_TRAFO * 0.85 + 2 * P_FE) * 100
ETA_FL = S_TRAFO * 0.85 / (S_TRAFO * 0.85 + P_FE + P_CU) * 100
I2_630 = S_TRAFO * 1e3 / (SQ3 * 400)
VR_CONTOH = 1.0 * 0.8 + 5.5 * 0.6                # R 1%, X 5,5%, pf 0,8
R_ACSR = 0.0282 * 12000 / 240                    # 240 mm², 12 km
ISC_150 = 2200 / (SQ3 * 150)                     # kA, S_sc 2200 MVA
IN_GI = 30e3 / (SQ3 * 20)                        # A, trafo GI 30 MVA sisi 20 kV
ISC_GI = IN_GI / 0.115 / 1000                    # kA, Z 11,5%
K1, K2 = 1000 / 5, 1600 / 7                      # paralel contoh Gambar 6
BEBAN_PAR = 2200.0
B1, B2 = BEBAN_PAR * K1 / (K1 + K2), BEBAN_PAR * K2 / (K1 + K2)


def eta_x(x, pf=0.85):
    out = x * S_TRAFO * pf
    return out / (out + P_FE + x * x * P_CU) * 100


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    rantai = [("G", "generator", "#f97316"), ("Trafo penaik", "13,8 → 150 kV", "#a855f7"), ("PMT", "pemutus tenaga", "#ef4444"),
              ("Rel 150 kV", "busbar GI", "#22d3ee"), ("Saluran", "SUTT/SUTET", "#0ea5e9")]
    w, h, x = 112, 46, 16
    for i, (a, s, c) in enumerate(rantai):
        b += box(x, 24, w, h, [a, s], c, 12)
        if i < len(rantai) - 1:
            b += arrow(x + w, 47, x + w + 16, 47)
        x += w + 16
    b += arrow(x - 16 - w / 2, 70, x - 16 - w / 2, 104)
    bawah = [("Beban", "motor, pemanas", "#00e09e"), ("Trafo distribusi", "20 kV → 400 V", "#a855f7"), ("Penyulang", "JTM 20 kV", "#22d3ee"),
             ("Rel 20 kV", "busbar + PMT", "#ef4444"), ("Trafo penurun", "150 → 20 kV", "#a855f7")]
    x = 16
    for i, (a, s, c) in enumerate(bawah):
        b += box(x, 104, w, h, [a, s], c, 12)
        if i < len(bawah) - 1:
            b += arrow(x + w + 16, 127, x + w, 127)
        x += w + 16
    b += t(330, 176, "Setiap kotak punya papan nama (nameplate): rating daya, tegangan, arus, dan impedansi", 12, AX)
    return svg(660, 186, b, "Gambar 1 — Komponen utama dari pembangkit ke beban")


def gambar2():
    b = ""
    cx, cy = 200, 118
    b += f'<circle cx="{cx}" cy="{cy}" r="96" fill="{BOX}" stroke="#94a3b8" stroke-width="10"/>'
    for i in range(12):
        a = i * math.pi / 6
        b += f'<rect x="{cx + 86 * math.cos(a) - 5:.1f}" y="{cy + 86 * math.sin(a) - 5:.1f}" width="10" height="10" fill="#f59e0b" transform="rotate({i * 30} {cx + 86 * math.cos(a):.1f} {cy + 86 * math.sin(a):.1f})"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="58" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>'
    for i, (warna, lab) in enumerate([("#ef4444", "U"), ("#3b82f6", "S"), ("#ef4444", "U"), ("#3b82f6", "S")]):
        a0, a1 = i * math.pi / 2 - 0.55, i * math.pi / 2 + 0.55
        p0 = (cx + 58 * math.cos(a0), cy + 58 * math.sin(a0))
        p1 = (cx + 58 * math.cos(a1), cy + 58 * math.sin(a1))
        b += f'<path d="M{cx},{cy} L{p0[0]:.1f},{p0[1]:.1f} A58,58 0 0 1 {p1[0]:.1f},{p1[1]:.1f} Z" fill="{warna}" fill-opacity="0.85"/>'
        b += t(cx + 40 * math.cos(i * math.pi / 2), cy + 40 * math.sin(i * math.pi / 2) + 4, lab, 12, "#fff", weight="700")
    b += f'<circle cx="{cx}" cy="{cy}" r="10" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>'
    b += teks2(cx, 238, "stator (kumparan jangkar) dan rotor 4 kutub (kumparan medan)", 11.5, AX, maks=36)
    for i, (judul, isi, c) in enumerate([("Stator", "kumparan tiga fasa, tempat tegangan diinduksi", "#f59e0b"),
                                          ("Rotor", "kutub magnet yang diputar penggerak mula", "#ef4444"),
                                          ("Sistem eksitasi", "arus DC ke kumparan medan mengatur tegangan (AVR)", "#22d3ee"),
                                          ("Governor", "mengatur uap/air/bahan bakar → putaran dan frekuensi", "#00e09e"),
                                          ("Pendingin", "udara, hidrogen, atau air untuk membuang panas rugi", "#a855f7")]):
        y = 26 + i * 42
        b += f'<rect x="352" y="{y}" width="290" height="34" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>'
        b += t(362, y + 15, judul, 12, TX, "start", "600")
        b += t(362, y + 28, isi, 10.5, AX, "start")
    return svg(660, 262, b, "Gambar 2 — Bagian utama generator sinkron")


def gambar3():
    b = ""
    x0, x1, y0, y1 = 64, 630, 206, 26
    xmax, emin, emax = 1.25, 96.0, 100.0
    X = lambda x: x0 + x / xmax * (x1 - x0)
    Y = lambda e: y0 - (max(e, emin) - emin) / (emax - emin) * (y0 - y1)
    for e in [96, 97, 98, 99, 100]:
        b += f'<line x1="{x0}" y1="{Y(e):.1f}" x2="{x1}" y2="{Y(e):.1f}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(x0 - 8, Y(e) + 4, f"{e}%", 11, AX, "end")
    for x in [0.25, 0.5, 0.75, 1.0, 1.25]:
        b += t(X(x), y0 + 16, f"{int(x * 100)}%", 11, AX)
    pts = " ".join(f"{X(x):.1f},{Y(eta_x(x)):.1f}" for x in [i / 100 for i in range(2, 126)])
    b += f'<polyline points="{pts}" fill="none" stroke="#00e09e" stroke-width="2.4"/>'
    b += f'<line x1="{X(1):.1f}" y1="{y1}" x2="{X(1):.1f}" y2="{y0}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="4 4"/>'
    b += t(X(1) + 4, y1 + 12, "beban penuh", 11, "#ef4444", "start")
    b += f'<circle cx="{X(X_OPT):.1f}" cy="{Y(eta_x(X_OPT)):.1f}" r="5" fill="#ec4899"/>'
    b += t(X(X_OPT) + 8, Y(eta_x(X_OPT)) - 8, f"η maks {ind(ETA_OPT, 2)}% pada {ind(X_OPT * 100, 1)}% beban", 11.5, "#ec4899", "start")
    b += t(345, 240, f"Trafo {ind(S_TRAFO, 0)} kVA, P_Fe = {ind(P_FE, 1)} kW, P_Cu = {ind(P_CU, 1)} kW, cos φ = 0,85 — efisiensi terhadap beban", 12, AX)
    return svg(660, 250, b, "Gambar 3 — Kurva efisiensi transformator terhadap beban")


ACSR = [("70", 240, 0.41), ("150", 385, 0.19), ("240", 530, 0.12), ("400", 720, 0.07)]


def gambar4():
    b = ""
    x0, x1, y0, y1 = 70, 600, 206, 30
    bw = (x1 - x0) / len(ACSR)
    Y = lambda a: y0 - a / 800 * (y0 - y1)
    for a in [0, 200, 400, 600, 800]:
        b += f'<line x1="{x0}" y1="{Y(a):.1f}" x2="{x1}" y2="{Y(a):.1f}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(x0 - 8, Y(a) + 4, f"{a}", 11, AX, "end")
    for i, (mm, amp, r) in enumerate(ACSR):
        x = x0 + i * bw + bw * 0.2
        b += f'<rect x="{x:.1f}" y="{Y(amp):.1f}" width="{bw * 0.6:.1f}" height="{y0 - Y(amp):.1f}" rx="4" fill="#22d3ee" fill-opacity="0.8"/>'
        yl = Y(amp) - 7
        for g in [200, 400, 600, 800]:
            if yl - 11 < Y(g) < yl + 3:
                yl = Y(g) + 10 if Y(g) + 10 <= Y(amp) - 4 else Y(g) - 3
        b += t(x + bw * 0.3, yl, f"{amp} A", 11.5, TX)
        b += t(x + bw * 0.3, y0 + 16, f"ACSR {mm} mm²", 11.5, TX, weight="600")
        b += t(x + bw * 0.3, y0 + 31, f"≈ {ind(r, 2)} Ω/km", 10.5, AX)
    b += t(26, 118, "A", 11, AX)
    b += t(335, 256, "Kemampuan hantar arus (kira-kira, udara 30 °C) naik bersama luas penampang; resistansi per km turun", 11.5, AX)
    return svg(660, 266, b, "Gambar 4 — Konduktor ACSR: kemampuan hantar arus dan resistansi")


def gambar5():
    b = ""
    b += f'<rect x="40" y="52" width="580" height="8" rx="2" fill="#f59e0b"/>'
    b += t(330, 44, "REL (BUSBAR) 20 kV", 12, "#f59e0b", weight="700")
    bays = [("Masuk dari trafo", 100, "#a855f7"), ("Penyulang 1", 260, "#22d3ee"), ("Penyulang 2", 400, "#22d3ee"), ("Kopel / cadangan", 540, "#94a3b8")]
    for nama, x, c in bays:
        b += f'<line x1="{x}" y1="60" x2="{x}" y2="88" stroke="{AX}" stroke-width="1.6"/>'
        b += f'<line x1="{x - 10}" y1="88" x2="{x + 10}" y2="104" stroke="{TX}" stroke-width="1.8"/>'   # PMS
        b += t(x + 16, 100, "PMS", 10, AX, "start")
        b += f'<line x1="{x}" y1="104" x2="{x}" y2="122" stroke="{AX}" stroke-width="1.6"/>'
        b += f'<rect x="{x - 12}" y="122" width="24" height="24" fill="{BOX}" stroke="#ef4444" stroke-width="1.8"/>'   # PMT
        b += f'<line x1="{x - 7}" y1="127" x2="{x + 7}" y2="141" stroke="#ef4444" stroke-width="1.6"/><line x1="{x + 7}" y1="127" x2="{x - 7}" y2="141" stroke="#ef4444" stroke-width="1.6"/>'
        b += t(x + 18, 138, "PMT", 10, "#ef4444", "start")
        b += f'<line x1="{x}" y1="146" x2="{x}" y2="164" stroke="{AX}" stroke-width="1.6"/>'
        b += f'<circle cx="{x}" cy="172" r="8" fill="none" stroke="#0ea5e9" stroke-width="1.6"/>'   # CT
        b += t(x + 14, 176, "CT", 10, "#0ea5e9", "start")
        b += f'<line x1="{x}" y1="180" x2="{x}" y2="204" stroke="{AX}" stroke-width="1.6"/>'
        b += t(x, 220, nama, 11, c, weight="600")
    b += f'<circle cx="590" cy="76" r="7" fill="none" stroke="#00e09e" stroke-width="1.6"/><circle cx="590" cy="84" r="7" fill="none" stroke="#00e09e" stroke-width="1.6"/>'
    b += t(604, 84, "PT", 10, "#00e09e", "start")
    b += t(330, 246, "Satu bay: pemisah (PMS) – pemutus tenaga (PMT) – trafo arus (CT); trafo tegangan (PT) mengukur tegangan rel", 11.5, AX)
    return svg(660, 256, b, "Gambar 5 — Susunan bay pada rel tunggal gardu induk")


def gambar6():
    b = ""
    x0, x1 = 150, 600
    X = lambda p: x0 + min(p, 130) / 130 * (x1 - x0)
    for p in [25, 50, 75, 100, 125]:
        for ya, yb in [(24, 36), (76, 96), (136, 152)]:
            b += f'<line x1="{X(p):.1f}" y1="{ya}" x2="{X(p):.1f}" y2="{yb}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(X(p), 168, f"{p}%", 11, AX)
    b += f'<line x1="{X(100):.1f}" y1="20" x2="{X(100):.1f}" y2="156" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="5 4"/>'
    for i, (nama, rating, beban, c) in enumerate([("T1 · 1000 kVA · Z 5%", 1000, B1, "#22d3ee"), ("T2 · 1600 kVA · Z 7%", 1600, B2, "#a855f7")]):
        y = 36 + i * 60
        p = beban / rating * 100
        b += f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="40" rx="6" fill="#1e293b"/>'
        b += f'<rect x="{x0}" y="{y}" width="{X(p) - x0:.1f}" height="40" rx="6" fill="{"#ef4444" if p > 100 else c}" fill-opacity="0.85"/>'
        b += t(x0 - 8, y + 18, nama.split(" · ")[0], 12, TX, "end", "600")
        b += t(x0 - 8, y + 32, " · ".join(nama.split(" · ")[1:]), 10.5, AX, "end")
        b += t(min(X(p), X(100)) - 8, y + 25, f"{ind(beban, 0)} kVA ({ind(p, 1)}%)", 11.5, TX, "end", "600")
    b += t(375, 196, f"Beban total {ind(BEBAN_PAR, 0)} kVA terbagi sebanding S/Z%: T1 lebih beban walau kapasitas gabungan 2600 kVA", 11.5, AX)
    return svg(660, 206, b, "Gambar 6 — Pembagian beban dua transformator paralel dengan impedansi berbeda")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-peta">Peta Komponen</a>
  <a href="#m-generator">Generator</a>
  <a href="#m-trafo">Transformator</a>
  <a href="#m-saluran">Saluran</a>
  <a href="#m-gardu">Gardu Induk</a>
  <a href="#m-distribusi">Distribusi</a>
  <a href="#m-nameplate">Nameplate</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="40" r="11" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.5"/>
      <text x="30" y="44" text-anchor="middle" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="10">G</text>
      <line x1="41" y1="40" x2="52" y2="40" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <circle cx="60" cy="40" r="7" fill="none" stroke="rgba(124,77,255,.55)" stroke-width="1.4"/>
      <circle cx="70" cy="40" r="7" fill="none" stroke="rgba(124,77,255,.55)" stroke-width="1.4"/>
      <line x1="77" y1="40" x2="90" y2="40" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="10" y1="90" x2="90" y2="90" stroke="rgba(255,179,0,.55)" stroke-width="3"/>
      <line x1="30" y1="90" x2="30" y2="130" stroke="rgba(148,163,184,.45)" stroke-width="1.4"/>
      <rect x="24" y="130" width="12" height="12" fill="none" stroke="rgba(239,68,68,.55)" stroke-width="1.4"/>
      <line x1="70" y1="90" x2="70" y2="130" stroke="rgba(148,163,184,.45)" stroke-width="1.4"/>
      <rect x="64" y="130" width="12" height="12" fill="none" stroke="rgba(239,68,68,.55)" stroke-width="1.4"/>
      <text x="8" y="84" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">rel 150 kV</text>
      <text x="40" y="196" fill="rgba(148,163,184,.5)" font-family="JetBrains Mono" font-size="8">PMT</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 190 C 30 60, 60 40, 90 38" fill="none" stroke="rgba(0,224,158,.5)" stroke-width="1.6"/>
      <line x1="12" y1="190" x2="12" y2="30" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <line x1="12" y1="190" x2="92" y2="190" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <circle cx="38" cy="50" r="3" fill="rgba(236,72,153,.7)"/>
      <text x="44" y="46" fill="rgba(236,72,153,.6)" font-family="JetBrains Mono" font-size="8">η maks</text>
      <text x="40" y="206" fill="rgba(148,163,184,.45)" font-family="JetBrains Mono" font-size="8">beban</text>
      <text x="4" y="24" fill="rgba(0,224,158,.55)" font-family="JetBrains Mono" font-size="8">η</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="02">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">S = √3·V·I</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">a = N₁/N₂ = V₁/V₂</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">P_rugi = P_Fe + x²·P_Cu</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">x_opt = √(P_Fe/P_Cu)</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">I_sc = I_n / Z_pu</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">R = ρ·L/A</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">VR ≈ R cos φ + X sin φ</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">S_i ∝ S_rating/Z%</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Komponen</span><br>
      <em>Sistem Tenaga</em><br>
      <span class="hl-amber">Listrik</span>
    </h1>
    <p class="hero-sub">Membedah satu per satu perangkat yang menyusun rantai pembangkitan–transmisi–distribusi: generator sinkron, transformator daya, konduktor dan isolator saluran, rel, pemutus tenaga, pemisah, trafo ukur, arester, sampai trafo distribusi dan kWh meter. Fokusnya pada fungsi tiap komponen, cara membaca spesifikasinya di papan nama, dan perhitungan rating, rugi, efisiensi, serta arus hubung singkat yang menentukan pemilihannya.</p>
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

    # 01 — peta komponen
    isi = figure(1, "Komponen utama dari pembangkit ke beban", "Generator membangkitkan, transformator mengubah tegangan, saluran dan penyulang menyalurkan, rel mempertemukan, dan pemutus tenaga melindungi; setiap komponen dipilih dari angka pada papan namanya.", gambar1())
    isi += formula(1, "Daya Semu, Rating, dan Arus Nominal", r"S = \sqrt{3}\, V_L\, I_L \qquad\Rightarrow\qquad I_n = \dfrac{S}{\sqrt{3}\, V_L}",
                   rf"Rating generator, transformator, dan rel dinyatakan dalam kVA atau MVA, karena pemanasannya ditentukan arus, bukan faktor daya beban. Trafo {ind(S_TRAFO, 0)} kVA, 20 kV/400 V mempunyai arus nominal sekunder \(I_n = {ind(S_TRAFO, 0)}\times10^3/(\sqrt{{3}}\times400) \approx {ind(I2_630, 1)}\) A.",
                   "Arus nominal adalah angka paling penting di papan nama: ia menentukan ukuran penghantar, setelan relai, dan rating pemutus di sekitar komponen itu. Melebihi arus nominal berarti melebihi suhu rancangan isolasi.",
                   [("S", "Daya semu pengenal (VA, kVA, MVA)"), ("V_L", "Tegangan antarfasa pengenal (V)"), ("I_L", "Arus saluran (A)"), ("I_n", "Arus nominal/pengenal (A)")])
    isi += cards([
        ("⚙️", "Generator Sinkron", "Mengubah daya mekanik penggerak mula menjadi daya listrik tiga fasa. Ratingnya dalam MVA pada faktor daya tertentu (lazim 0,8–0,85), tegangan terminal belasan kV.", r"\(P = S\cos\varphi\)"),
        ("🔁", "Transformator Daya", "Mengubah tingkat tegangan hampir tanpa rugi: penaik di pembangkit, penurun di gardu induk, dan trafo distribusi di dekat beban. Rating MVA/kVA, rasio tegangan, impedansi persen.", r"\(a = N_1/N_2\)"),
        ("🗼", "Saluran dan Penyulang", "Konduktor (ACSR, kabel tanah), isolator, menara/tiang, dan kawat tanah. Dipilih dari arus yang harus dialirkan, jatuh tegangan, dan kekuatan mekanis.", r"\(R = \rho L / A\)"),
        ("🟧", "Rel (Busbar)", "Batang tembaga/aluminium tempat pasokan dan penyulang bertemu di gardu induk. Ratingnya arus kontinu dan arus hubung singkat sesaat.", None),
        ("🔴", "Pemutus Tenaga (PMT)", "Memutus rangkaian berbeban maupun berarus gangguan. Rating: tegangan, arus kontinu, dan kemampuan pemutusan (kA) yang harus melebihi arus hubung singkat setempat.", r"\(I_{sc} \le I_{putus}\)"),
        ("🛡️", "Proteksi dan Pengukuran", "Trafo arus (CT), trafo tegangan (PT), relai, dan arester surja. Menurunkan besaran ke tingkat aman untuk alat ukur/relai dan membuang tegangan lebih petir ke tanah.", None),
    ], [("P", "Daya aktif (W)"), (r"\cos\varphi", "Faktor daya"), ("a", "Rasio transformasi"), ("N_1, N_2", "Jumlah lilitan primer dan sekunder"), (r"\rho", "Resistivitas bahan"), ("L", "Panjang penghantar"), ("A", "Luas penampang"), ("I_{sc}", "Arus hubung singkat"), ("I_{putus}", "Kemampuan pemutusan PMT")])
    isi += tabel(["Komponen", "Fungsi utama", "Besaran pada papan nama", "Contoh nilai"], [
        ["Generator sinkron", "Membangkitkan daya tiga fasa", "MVA, kV, cos φ, rpm, Hz", "250 MVA, 15,75 kV, 0,85, 3000 rpm"],
        ["Transformator daya", "Mengubah tegangan", "MVA, rasio kV, Z%, kelompok vektor", "60 MVA, 150/20 kV, 12%, YNyn0"],
        ["Konduktor ACSR", "Mengalirkan arus", "mm², A, Ω/km", "240 mm², 530 A, 0,12 Ω/km"],
        ["PMT", "Memutus arus beban dan gangguan", "kV, A, kA pemutusan", "24 kV, 1250 A, 25 kA"],
        ["Trafo arus (CT)", "Menurunkan arus untuk relai/meter", "rasio, kelas, burden", "600/5 A, 5P20, 15 VA"],
        ["Trafo distribusi", "20 kV → 400 V", "kVA, rasio, Z%", "400 kVA, 20/0,4 kV, 4%"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> transformator praktis pertama dibuat tim Ganz di Budapest (Zipernowsky, Bláthy, Déri) pada 1885, dan sejak itu tegangan dapat dinaikkan-diturunkan sesuka rancangan. Pemutus tenaga berkembang dari pemutus minyak (awal abad ke-20) ke pemutus udara hembus, lalu gas SF₆ sejak 1960-an yang kini mendominasi gardu induk tegangan tinggi, sementara pemutus vakum menguasai tegangan menengah 20 kV. Setiap lompatan teknologi ini memperkecil ukuran gardu dan memperbesar kemampuan pemutusan.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02–06 mengikuti aliran daya dari generator sampai beban; setiap bagian berakhir dengan angka yang biasa Anda temukan di papan nama dan cara memakainya. Bagian 07 mengajarkan membaca nameplate secara utuh. Perhitungan yang paling sering dipakai di tugas: arus nominal dari rating (Persamaan 1), efisiensi transformator terhadap beban (Persamaan 4–6), arus hubung singkat (Persamaan 9), dan pembagian beban trafo paralel (Persamaan 10).")
    m += bagian(1, "m-peta", "Peta Komponen<br>Sistem Tenaga Listrik",
                "Modul 1 memperlihatkan rantai pembangkitan–transmisi–distribusi sebagai kotak-kotak besar. Modul ini membuka kotak-kotak itu: perangkat apa saja di dalamnya, apa fungsi masing-masing, dan angka apa yang tertulis di papan namanya. Kosakata ini dipakai terus sampai analisis aliran daya di akhir semester. Hubungan paling dasar antara rating dan arus dituliskan pada Persamaan (1). Gambar 1 memperlihatkan peta komponennya.",
                isi, "PETA KOMPONEN")

    # 02 — generator
    isi = figure(2, "Bagian utama generator sinkron", "Rotor berkutub magnet diputar penggerak mula di dalam stator berkumparan tiga fasa; sistem eksitasi mengatur tegangan, governor mengatur putaran dan frekuensi, dan sistem pendingin membuang panas rugi.", gambar2())
    isi += formula(2, "Daya Aktif dan Reaktif dari Rating Generator", r"P = S\cos\varphi, \qquad Q = S\sin\varphi, \qquad P_{mek} = \dfrac{P}{\eta_g}",
                   r"Generator 250 MVA pada faktor daya 0,85 dapat mengeluarkan \(P = 212{,}5\) MW dan \(Q \approx 131{,}7\) MVAR sekaligus. Dengan efisiensi 98,5%, turbin harus memberi \(P_{mek} \approx 215{,}7\) MW pada poros.",
                   "Rating MVA dan faktor daya bersama-sama membatasi daya aktif dan reaktif yang boleh dikeluarkan. Daya reaktif lebih besar berarti arus medan lebih besar dan pemanasan rotor; itulah sebabnya generator punya kurva kemampuan (capability curve), bukan sekadar satu angka.",
                   [("P", "Daya aktif keluaran (W)"), ("Q", "Daya reaktif keluaran (VAR)"), ("S", "Rating daya semu (VA)"), (r"\cos\varphi", "Faktor daya pengenal"), ("P_{mek}", "Daya mekanik masukan poros (W)"), (r"\eta_g", "Efisiensi generator")])
    isi += cards([
        ("🧲", "Rotor dan Kumparan Medan", "Kutub magnet dibentuk arus DC pada kumparan medan. Rotor silinder (2–4 kutub) untuk turbin uap/gas yang cepat; rotor kutub tonjol (banyak kutub) untuk turbin air yang lambat.", r"\(f = pn/120\)"),
        ("🧵", "Stator dan Kumparan Jangkar", "Tiga kumparan yang bergeser 120° tempat tegangan diinduksi. Isolasinya menentukan tegangan terminal (6–24 kV) dan kelas suhu generator.", None),
        ("⚡", "Sistem Eksitasi dan AVR", "Pengatur tegangan otomatis (AVR) mengubah arus medan untuk menjaga tegangan terminal dan mengatur daya reaktif yang dikirim ke sistem.", r"\(V_t \leftarrow I_f\)"),
        ("🎛️", "Governor", "Mengatur katup uap, bahan bakar, atau air agar torsi turbin mengikuti beban listrik; dengannya frekuensi tetap 50 Hz. Respons governor dibahas lagi saat stabilitas.", r"\(P_{mek} = T\omega\)"),
        ("❄️", "Pendinginan", "Rugi 1–2% dari ratusan MW adalah beberapa megawatt panas. Generator kecil didinginkan udara, besar dengan hidrogen (konduktivitas panas tinggi, rugi gesek rendah) atau air di kumparan stator.", None),
        ("🔩", "Sisi Mekanik", "Poros, bantalan, kopling ke turbin, dan pondasi menanggung torsi ratusan kN·m serta gaya hubung singkat. Inilah wilayah insinyur mesin di pembangkit.", None),
    ], [("f", "Frekuensi (Hz)"), ("p", "Jumlah kutub"), ("n", "Putaran (rpm)"), ("V_t", "Tegangan terminal"), ("I_f", "Arus medan (eksitasi)"), ("T", "Torsi poros"), (r"\omega", "Kecepatan sudut")])
    isi += tabel(["Jenis pembangkit", "Rotor", "Kutub", "Putaran (50 Hz)", "Tegangan terminal", "Pendingin"], [
        ["PLTU/PLTGU besar", "silinder", "2", "3000 rpm", "15–24 kV", "hidrogen / air"],
        ["PLTG industri", "silinder", "2–4", "3000 / 1500 rpm", "6,3–11 kV", "udara"],
        ["PLTA", "kutub tonjol", "12–60", "100–500 rpm", "6,3–15 kV", "udara"],
        ["Genset diesel", "kutub tonjol", "4", "1500 rpm", "400 V", "udara"],
    ])
    isi += kotak("info-box", "<strong>⚠️ Kesalahan Umum:</strong> membaca rating generator 250 MVA sebagai \"250 MW\". Daya aktif maksimum yang boleh dikeluarkan adalah \\(S\\cos\\varphi\\), dan hanya bila turbinnya sanggup. Sebaliknya, generator yang dipaksa mengeluarkan daya reaktif besar pada faktor daya rendah bisa panas di rotor walau daya aktifnya jauh di bawah rating.")
    m += bagian(2, "m-generator", "Generator Sinkron:<br>Bagian dan Rating",
                "Generator sinkron adalah sumber hampir seluruh daya di sistem. Untuk insinyur mesin ia menarik dua kali: sisi mekaniknya (turbin, poros, bantalan, pendingin) dan sisi listriknya (tegangan, frekuensi, daya aktif dan reaktif) saling terkait lewat satu poros. Hubungan rating dengan daya keluaran dituliskan pada Persamaan (2). Gambar 2 memperlihatkan bagian-bagian utamanya.",
                isi, "GENERATOR SINKRON")

    # 03 — transformator
    isi = figure(3, "Kurva efisiensi transformator terhadap beban", "Rugi inti tetap sedangkan rugi tembaga naik sebanding kuadrat beban, sehingga efisiensi mencapai puncak pada beban sebagian, bukan pada beban penuh.", gambar3())
    isi += formula(3, "Rasio Transformasi", r"a = \dfrac{N_1}{N_2} = \dfrac{V_1}{V_2} = \dfrac{I_2}{I_1}",
                   r"Trafo 20 kV/400 V mempunyai \(a = 50\): tegangan turun 50 kali, arus naik 50 kali, sedangkan daya semu di kedua sisi sama (tanpa rugi). Trafo 3 fasa mengikuti rumus yang sama per fasa.",
                   "Transformator tidak mengubah daya, hanya menukar tegangan dengan arus. Karena itu arus sisi tegangan rendah selalu jauh lebih besar; ukuran terminal, kabel, dan pemutus di sisi 400 V jauh lebih besar daripada di sisi 20 kV.",
                   [("a", "Rasio transformasi"), ("N_1, N_2", "Lilitan primer dan sekunder"), ("V_1, V_2", "Tegangan primer dan sekunder"), ("I_1, I_2", "Arus primer dan sekunder")])
    isi += formula(4, "Rugi Transformator terhadap Beban", r"P_{rugi} = P_{Fe} + x^2 P_{Cu}, \qquad x = \dfrac{S_{beban}}{S_{rating}}",
                   rf"\(P_{{Fe}}\) = rugi inti (histeresis dan arus eddy), hampir tetap selama tegangan tetap; \(P_{{Cu}}\) = rugi tembaga pada beban penuh, berbanding \(I^2R\). Trafo {ind(S_TRAFO, 0)} kVA contoh: \(P_{{Fe}} = {ind(P_FE, 1)}\) kW, \(P_{{Cu}} = {ind(P_CU, 1)}\) kW.",
                   "Dua rugi ini berbeda watak: rugi inti dibayar 24 jam sehari walau trafo tanpa beban, rugi tembaga hanya saat berbeban. Trafo distribusi yang sebagian besar waktunya berbeban ringan dirancang dengan rugi inti kecil.",
                   [("P_{rugi}", "Rugi total (W)"), ("P_{Fe}", "Rugi inti / rugi besi (W)"), ("P_{Cu}", "Rugi tembaga beban penuh (W)"), ("x", "Fraksi beban terhadap rating"), ("S_{beban}", "Daya semu beban"), ("S_{rating}", "Daya semu pengenal")])
    isi += formula(5, "Efisiensi Transformator", r"\eta = \dfrac{x\,S\cos\varphi}{x\,S\cos\varphi + P_{Fe} + x^2 P_{Cu}}",
                   rf"Pada beban penuh (\(x = 1\)) dan \(\cos\varphi = 0{{,}}85\), trafo contoh mempunyai \(\eta = {ind(ETA_FL, 2)}\%\); pada setengah beban \(\eta = {ind(eta_x(0.5), 2)}\%\), lebih tinggi karena rugi tembaga tinggal seperempatnya.",
                   "Keluaran yang dihitung adalah daya aktif, jadi faktor daya beban ikut menentukan efisiensi: pada faktor daya rendah, rugi (yang bergantung arus) tetap tetapi daya aktif yang disalurkan lebih kecil.",
                   [(r"\eta", "Efisiensi"), ("x", "Fraksi beban"), ("S", "Rating daya semu"), (r"\cos\varphi", "Faktor daya beban"), ("P_{Fe}, P_{Cu}", "Rugi inti dan rugi tembaga beban penuh")])
    isi += formula(6, "Beban untuk Efisiensi Maksimum", r"x_{opt} = \sqrt{\dfrac{P_{Fe}}{P_{Cu}}} \qquad (\text{saat } x^2 P_{Cu} = P_{Fe})",
                   rf"Trafo contoh: \(x_{{opt}} = \sqrt{{{ind(P_FE, 1)}/{ind(P_CU, 1)}}} \approx {ind(X_OPT, 3)}\), yakni sekitar {ind(X_OPT * 100, 0)}% beban, dengan \(\eta_{{maks}} \approx {ind(ETA_OPT, 2)}\%\). Pada titik itu rugi total tepat \(2P_{{Fe}}\).",
                   "Efisiensi maksimum tercapai saat rugi yang tetap sama besar dengan rugi yang berubah, hasil menurunkan Persamaan (5) terhadap x. Perancang trafo distribusi sengaja menaruh titik ini di sekitar beban rata-rata harian, bukan di beban penuh.",
                   [("x_{opt}", "Fraksi beban dengan efisiensi tertinggi"), ("P_{Fe}", "Rugi inti"), ("P_{Cu}", "Rugi tembaga beban penuh")])
    isi += formula(7, "Regulasi Tegangan (Pendekatan Orde Pertama)", r"VR \approx R_{\%}\cos\varphi + X_{\%}\sin\varphi \qquad (\text{beban tertinggal})",
                   rf"\(R_\%\) dan \(X_\%\) adalah resistansi dan reaktansi ekuivalen pada basis rating. Trafo dengan \(R_\% = 1\), \(X_\% = 5{{,}}5\) pada beban penuh \(\cos\varphi = 0{{,}}8\) tertinggal mempunyai \(VR \approx 1\times0{{,}}8 + 5{{,}}5\times0{{,}}6 = {ind(VR_CONTOH, 1)}\%\).",
                   "Regulasi menyatakan seberapa jauh tegangan sekunder turun dari tanpa beban ke beban penuh. Reaktansi bocor (bagian terbesar dari Z%) yang menentukannya pada beban induktif; pada beban kapasitif tegangan justru bisa naik.",
                   [("VR", "Regulasi tegangan (%)"), ("R_\\%", "Resistansi ekuivalen (% basis rating)"), ("X_\\%", "Reaktansi ekuivalen (% basis rating)"), (r"\varphi", "Sudut faktor daya beban")])
    isi += cards([
        ("🧱", "Inti dan Belitan", "Inti baja silikon berlaminasi menekan rugi eddy; belitan tembaga/aluminium berisolasi kertas-minyak. Kelompok vektor (mis. Dyn5, YNyn0) menyatakan hubungan belitan dan geser fasa.", None),
        ("🛢️", "Minyak dan Pendinginan", "Minyak mengisolasi sekaligus membawa panas ke radiator. Kode ONAN (minyak-udara alami) sampai OFWF (minyak-air dipaksa) menyatakan cara pendinginan; rating bisa naik bila pendinginan dipaksa.", None),
        ("🎚️", "Tap Changer", "Mengubah jumlah lilitan sedikit demi sedikit (±2,5% per tap) untuk menjaga tegangan sekunder. OLTC dapat bekerja berbeban, off-load tap hanya saat trafo mati.", None),
        ("📏", "Impedansi Persen", "Z% adalah tegangan (dalam % rating) yang diperlukan untuk mengalirkan arus nominal saat sekunder dihubung singkat. Trafo distribusi 4–6%, trafo GI 10–15%. Angka ini membatasi arus hubung singkat.", r"\(I_{sc} = I_n / Z_{pu}\)"),
        ("🛡️", "Pengaman Trafo", "Relai Buchholz (gas), pengaman tekanan lebih, relai suhu minyak/belitan, dan relai diferensial. Trafo GI adalah aset termahal di gardu, sehingga proteksinya berlapis.", None),
        ("♻️", "Umur dan Suhu", "Umur isolasi kertas ditentukan suhu belitan: setiap kenaikan sekitar 6 °C di atas rancangan memangkas umur menjadi separuh. Pembebanan lebih boleh, tetapi dibayar dengan umur.", None),
    ], [("I_{sc}", "Arus hubung singkat"), ("I_n", "Arus nominal"), ("Z_{pu}", "Impedansi dalam per unit (Z%/100)")])
    isi += tabel(["Beban x", "Rugi inti (kW)", "Rugi tembaga (kW)", "P keluar (kW)", "η (%)"],
                 [[f"{int(x * 100)}%", ind(P_FE, 2), ind(x * x * P_CU, 2), ind(x * S_TRAFO * 0.85, 1), ind(eta_x(x), 2)] for x in [0.25, 0.408, 0.5, 0.75, 1.0, 1.25]])
    isi += kotak("info-box", f"<strong>📊 Cara Membaca Tabel di Atas:</strong> trafo {ind(S_TRAFO, 0)} kVA contoh paling efisien di sekitar 41% beban (baris kedua). Pada 125% beban efisiensi sudah turun dan, lebih penting, suhu belitan melampaui rancangan. Perhatikan bahwa selisih efisiensi tampak kecil (kurang dari 1%), tetapi untuk trafo yang bekerja 8760 jam setahun, 0,5% dari ratusan kW adalah puluhan MWh energi.")
    m += bagian(3, "m-trafo", "Transformator Daya:<br>Rasio, Rugi, Efisiensi, dan Impedansi",
                "Transformator adalah komponen yang membuat sistem AC unggul: tegangan dapat dinaikkan untuk transmisi dan diturunkan kembali di dekat beban. Empat angka di papan namanya paling sering dipakai insinyur: rating kVA, rasio tegangan, rugi (inti dan tembaga), dan impedansi persen. Rasio dituliskan pada Persamaan (3), rugi dan efisiensi pada Persamaan (4)–(6), dan regulasi tegangan pada Persamaan (7). Gambar 3 memperlihatkan kurva efisiensinya.",
                isi, "TRANSFORMATOR DAYA")

    # 04 — saluran
    isi = figure(4, "Konduktor ACSR: kemampuan hantar arus dan resistansi", "Penampang lebih besar mengalirkan arus lebih besar dengan resistansi per kilometer lebih kecil, tetapi lebih berat dan lebih mahal; pemilihan konduktor adalah kompromi antara rugi, jatuh tegangan, dan biaya.", gambar4())
    isi += formula(8, "Resistansi Penghantar", r"R = \rho\,\dfrac{L}{A}",
                   rf"\(\rho\) aluminium ≈ 0,0282 Ω·mm²/m (tembaga ≈ 0,0172). Penyulang 12 km dengan ACSR 240 mm²: \(R = 0{{,}}0282 \times 12000 / 240 \approx {ind(R_ACSR, 2)}\) Ω per fasa. Resistansi naik sekitar 0,4% per °C, jadi konduktor panas lebih boros.",
                   "Rugi \\(I^2R\\) dan jatuh tegangan \\(IR\\) keduanya berbanding lurus dengan R, sehingga memperbesar penampang memangkas keduanya sekaligus. Namun berat konduktor juga naik sebanding A, menuntut menara dan isolator yang lebih kuat.",
                   [("R", "Resistansi penghantar (Ω)"), (r"\rho", "Resistivitas bahan (Ω·mm²/m)"), ("L", "Panjang penghantar (m)"), ("A", "Luas penampang (mm²)")])
    isi += cards([
        ("🧬", "ACSR", "Aluminium Conductor Steel Reinforced: untaian aluminium pembawa arus di sekeliling inti baja penahan tarik. Standar saluran udara tegangan tinggi karena ringan, kuat, dan murah.", None),
        ("🧵", "Kabel Tanah (XLPE)", "Konduktor tembaga/aluminium berisolasi polietilena ikat silang, ditanam atau di terowongan. Bebas gangguan cuaca dan estetis, tetapi 5–10 kali lebih mahal dan sulit dicari gangguannya.", None),
        ("🥛", "Isolator", "Porselen, kaca, atau polimer yang memisahkan konduktor bertegangan dari menara. Jumlah piring dalam rentengan bertambah bersama tegangan: sekitar 10–12 piring untuk 150 kV, 25–30 untuk 500 kV.", None),
        ("🗼", "Menara dan Tiang", "Menara baja kisi untuk SUTT/SUTET, tiang beton atau baja untuk JTM 20 kV. Dirancang terhadap berat konduktor, tarikan, angin, dan andongan (sag) pada suhu tertinggi.", None),
        ("⛈️", "Kawat Tanah", "Kawat di puncak menara yang menangkap sambaran petir dan mengalirkannya ke tanah, kini sering berisi serat optik (OPGW) untuk komunikasi.", None),
        ("🌡️", "Kemampuan Hantar Arus", "Batas arus ditentukan suhu konduktor (lazim 75–90 °C) agar andongan dan kekuatan tetap aman. Nilainya bergantung suhu udara, angin, dan matahari, sehingga tabel pabrik memuat syarat lingkungannya.", None),
    ])
    isi += tabel(["Konduktor", "Penampang (mm²)", "Kira-kira arus kontinu (A)", "Kira-kira R (Ω/km, 20 °C)", "Pemakaian lazim"],
                 [[f"ACSR {mm}", mm, f"{amp}", ind(r, 2), pk] for (mm, amp, r), pk in zip(ACSR, ["JTM 20 kV pedesaan", "JTM 20 kV perkotaan", "SUTT 70–150 kV", "SUTT 150 kV / SUTET (berkas)"])])
    isi += kotak("tip-box", "💡 <strong>Aturan Praktis Pemilihan Konduktor:</strong> hitung arus puncak pada akhir umur layanan (beban tumbuh beberapa persen per tahun), pilih penampang yang kemampuan hantar arusnya di atas itu dengan cadangan, lalu periksa jatuh tegangan di ujung saluran (lazim dibatasi 5–10%). Soal C14 mengikuti alur ini: proyeksi beban 10 tahun ke depan sebelum memilih konduktor.")
    m += bagian(4, "m-saluran", "Saluran: Konduktor,<br>Isolator, dan Menara",
                "Saluran transmisi dan penyulang distribusi tersusun dari konduktor yang membawa arus, isolator yang memisahkannya dari struktur, serta menara atau tiang yang menopangnya. Pemilihan konduktor menentukan rugi dan jatuh tegangan sepanjang umur saluran. Resistansinya dihitung dengan Persamaan (8). Gambar 4 membandingkan beberapa ukuran ACSR.",
                isi, "SALURAN")

    # 05 — gardu induk
    isi = figure(5, "Susunan bay pada rel tunggal gardu induk", "Setiap penyulang dan pasokan masuk ke rel melalui satu bay: pemisah untuk isolasi saat perawatan, pemutus tenaga untuk memutus arus, dan trafo arus untuk relai dan pengukuran.", gambar5())
    isi += formula(9, "Arus Hubung Singkat dan Rating PMT", r"I_{sc} = \dfrac{S_{sc}}{\sqrt{3}\,V_L}, \qquad I_{sc,trafo} = \dfrac{I_n}{Z_{pu}}",
                   rf"Rel 150 kV dengan daya hubung singkat 2200 MVA: \(I_{{sc}} = 2200/(\sqrt{{3}}\times150) \approx {ind(ISC_150, 2)}\) kA. Trafo GI 30 MVA, 150/20 kV, Z 11,5%: \(I_n = {ind(IN_GI, 0)}\) A di sisi 20 kV, \(I_{{sc}} \approx {ind(IN_GI, 0)}/0{{,}}115 \approx {ind(ISC_GI, 2)}\) kA. PMT 20 kV di rel itu harus berkemampuan pemutusan lebih besar, misalnya 12,5 kA.",
                   "Daya hubung singkat menyatakan \"kekuatan\" sumber di suatu titik: makin besar, makin kecil impedansi sumber, makin besar arus gangguan. Impedansi transformator sengaja dibuat cukup besar untuk membatasi arus itu di sisi hilirnya sehingga PMT yang lebih murah dapat dipakai.",
                   [("I_{sc}", "Arus hubung singkat tiga fasa (A)"), ("S_{sc}", "Daya hubung singkat (VA)"), ("V_L", "Tegangan antarfasa (V)"), ("I_n", "Arus nominal transformator"), ("Z_{pu}", "Impedansi transformator per unit (Z%/100)")])
    isi += cards([
        ("🔴", "Pemutus Tenaga (PMT)", "Memutus rangkaian dalam beberapa siklus saat relai memerintah. Media pemadam busur: vakum (20 kV), SF₆ (70–500 kV). Rating kuncinya kemampuan pemutusan dalam kA.", None),
        ("⚪", "Pemisah (PMS)", "Saklar yang hanya boleh dibuka tanpa arus, memberi celah isolasi yang terlihat untuk keselamatan pekerja. Salah urutan membuka PMS berbeban menimbulkan busur api berbahaya.", None),
        ("🟦", "Trafo Arus (CT)", "Menurunkan ratusan-ribuan ampere menjadi 1 atau 5 A untuk relai dan meter. Sekunder CT tidak boleh terbuka saat primer berarus: tegangan induksinya berbahaya.", r"\(600/5\) A"),
        ("🟩", "Trafo Tegangan (PT)", "Menurunkan tegangan rel menjadi 100 atau 110 V untuk relai dan meter. Bersama CT ia mengukur daya dan energi yang lewat.", r"\(150\,\text{kV}/100\,\text{V}\)"),
        ("🧠", "Relai Proteksi", "Membandingkan besaran ukur dengan setelan (arus lebih, jarak, diferensial) lalu memerintah PMT membuka dalam puluhan milidetik. Koordinasinya dibahas pada Pertemuan 13.", None),
        ("⚡", "Arester Surja", "Varistor oksida logam yang menghantar hanya saat tegangan melonjak (petir, switching) sehingga surja dibuang ke tanah sebelum merusak isolasi trafo.", None),
    ])
    isi += tabel(["Rating PMT", "Tegangan", "Arus kontinu", "Kemampuan pemutusan", "Pemakaian"], [
        ["Vakum 24 kV", "20 kV", "630–2500 A", "16–31,5 kA", "bay penyulang dan trafo di sisi 20 kV"],
        ["SF₆ 170 kV", "150 kV", "1250–3150 A", "31,5–40 kA", "bay saluran dan trafo di GI 150 kV"],
        ["SF₆ 550 kV", "500 kV", "3150–4000 A", "40–63 kA", "GITET 500 kV"],
    ])
    isi += kotak("info-box", "<strong>📌 Yang Sering Disalahpahami:</strong> PMT bukan pengaman \"otomatis\" seperti MCB rumah. PMT hanya membuka bila relai memerintahkannya; relai membaca CT dan PT. Jadi tiga komponen ini selalu satu paket: tanpa CT relai buta, tanpa relai PMT tuli. Rating PMT pun dua macam: arus kontinu (yang dilewatkan terus-menerus) dan arus pemutusan (yang harus diputus sekali saat gangguan), dan angka kedua yang ratusan kali lebih besar.")
    m += bagian(5, "m-gardu", "Gardu Induk: Rel, PMT,<br>PMS, dan Peralatan Proteksi",
                "Gardu induk adalah simpul tempat saluran, transformator, dan penyulang bertemu pada rel, lengkap dengan pemutus, pemisah, trafo ukur, relai, dan arester. Komponen-komponen ini tidak menyalurkan daya, tetapi menentukan apakah gangguan di satu penyulang memadamkan seluruh kota atau cukup satu penyulang saja. Arus hubung singkat yang menentukan rating PMT dihitung dengan Persamaan (9). Gambar 5 memperlihatkan susunan satu bay.",
                isi, "GARDU INDUK")

    # 06 — distribusi & beban
    isi = figure(6, "Pembagian beban dua transformator paralel dengan impedansi berbeda", "Trafo dengan impedansi persen lebih kecil menarik bagian beban lebih besar dari jatah ratingnya, sehingga dapat lebih beban walau kapasitas gabungan masih cukup.", gambar6())
    isi += formula(10, "Pembagian Beban Transformator Paralel", r"S_i = S_{total}\;\dfrac{S_{r,i}/Z_{\%,i}}{\sum_j S_{r,j}/Z_{\%,j}}",
                   rf"T1 1000 kVA (Z 5%) dan T2 1600 kVA (Z 7%) memikul beban {ind(BEBAN_PAR, 0)} kVA: \(S_1/Z_1 = {ind(K1, 0)}\), \(S_2/Z_2 \approx {ind(K2, 1)}\), sehingga T1 memikul \(\approx {ind(B1, 0)}\) kVA ({ind(B1 / 10, 1)}% ratingnya, lebih beban) dan T2 \(\approx {ind(B2, 0)}\) kVA ({ind(B2 / 16, 1)}%).",
                   "Trafo paralel berbagi tegangan yang sama, jadi arus terbagi berbanding terbalik dengan impedansi (dalam ohm). Dinyatakan dalam persen pada basis masing-masing, beban terbagi sebanding rating dibagi Z%. Syarat paralel: rasio dan kelompok vektor sama, Z% mendekati.",
                   [("S_i", "Beban yang dipikul trafo ke-i"), ("S_{total}", "Beban total"), ("S_{r,i}", "Rating trafo ke-i"), ("Z_{\\%,i}", "Impedansi persen trafo ke-i")])
    isi += cards([
        ("📦", "Trafo Distribusi", "20 kV → 400/230 V, 50–630 kVA di tiang atau gardu beton. Rugi inti kecil karena berbeban ringan sebagian besar hari; impedansi 4–6%.", None),
        ("🔌", "Panel Hubung Bagi (PHB)", "Rel tegangan rendah dengan pemutus utama (ACB/MCCB) dan pemutus cabang. Kemampuan pemutusannya harus melebihi arus hubung singkat di sisi 400 V, yang bisa puluhan kA.", r"\(I_{sc} = I_n/Z_{pu}\)"),
        ("🔋", "Kapasitor Bank", "Memasok daya reaktif setempat sehingga faktor daya naik, arus turun, dan rugi jaringan berkurang. Dibahas rinci pada Pertemuan 11.", r"\(Q_c = P(\tan\varphi_1 - \tan\varphi_2)\)"),
        ("🔁", "Recloser dan Sectionalizer", "Pemutus otomatis di tengah penyulang yang mencoba menutup kembali setelah gangguan sementara (ranting, petir), memulihkan pasokan tanpa petugas.", None),
        ("🔥", "Fuse Cut-Out (FCO)", "Pengaman lebur di sisi 20 kV trafo tiang. Murah dan sederhana, tetapi harus diganti petugas setelah bekerja.", None),
        ("📟", "kWh Meter dan Pembatas", "Meter mengukur energi (dan pada pelanggan besar, daya reaktif dan beban puncak); MCB/pembatas menjaga daya langganan dalam VA.", None),
    ], [("I_{sc}", "Arus hubung singkat"), ("I_n", "Arus nominal"), ("Z_{pu}", "Impedansi per unit"), ("Q_c", "Daya reaktif kapasitor"), ("P", "Daya aktif beban"), (r"\varphi_1, \varphi_2", "Sudut faktor daya sebelum dan sesudah kompensasi")])
    isi += tabel(["Komponen 400 V", "Rating khas", "Yang menentukan pemilihannya"], [
        ["Trafo distribusi", "100–630 kVA, Z 4–6%", "beban puncak dengan cadangan, rugi inti (beban ringan), tegangan"],
        ["ACB/MCCB utama", "400–4000 A, 36–80 kA", "arus nominal trafo dan arus hubung singkat sisi 400 V"],
        ["Kabel utama", "NYY/NYFGbY 95–300 mm²", "arus nominal, jatuh tegangan, cara pemasangan"],
        ["Kapasitor bank", "50–500 kVAR, bertahap", "target faktor daya (≥ 0,85) dan pola beban"],
    ])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> beban terbesar di pabrik hampir selalu motor induksi: kompresor, pompa, blower, konveyor. Motor menarik arus start 5–7 kali arus nominal selama beberapa detik, sehingga trafo, kabel, dan pemutus harus menahannya tanpa trip. Saat merencanakan mesin baru, tanyakan tiga angka ke bagian listrik: sisa kapasitas trafo, arus hubung singkat di panel, dan faktor daya pabrik; ketiganya menentukan apakah mesin bisa langsung dipasang atau perlu tambahan komponen.")
    m += bagian(6, "m-distribusi", "Komponen Distribusi<br>dan Sisi Beban",
                "Di ujung rantai, daya masuk ke pabrik, gedung, dan rumah melalui trafo distribusi, panel hubung bagi, kabel, pemutus tegangan rendah, kapasitor, dan meter. Komponen inilah yang paling sering dijumpai insinyur mesin di lapangan. Salah satu persoalan klasiknya, membagi beban antara dua transformator yang bekerja paralel, dituliskan pada Persamaan (10). Gambar 6 memperlihatkan contohnya.",
                isi, "DISTRIBUSI DAN BEBAN")

    # 07 — nameplate & spesifikasi
    isi = cards([
        ("📛", "Rating Daya", "kVA/MVA untuk trafo dan generator, kW untuk motor, A untuk PMT dan rel. Nilai kontinu pada suhu lingkungan rancangan (lazim 40 °C); di lingkungan lebih panas rating diturunkan (derating).", None),
        ("🔤", "Tegangan dan Rasio", "Tegangan pengenal setiap sisi, tap yang tersedia (±2×2,5%), dan tingkat isolasi (BIL) yang menyatakan ketahanan terhadap surja petir.", None),
        ("📐", "Impedansi dan Rugi", "Z% (trafo), X_d (generator), rugi tanpa beban dan rugi beban penuh (W). Dari angka ini dihitung efisiensi, regulasi, dan arus hubung singkat.", None),
        ("🌡️", "Kelas Isolasi dan Suhu", "Kelas A (105 °C), E, B (130 °C), F (155 °C), H (180 °C): suhu tertinggi yang boleh dicapai isolasi. Kenaikan suhu (temperature rise) diukur di atas suhu lingkungan.", None),
        ("💧", "Pendinginan dan Proteksi Fisik", "Kode ONAN/ONAF/OFAF untuk trafo; IC untuk motor; IP (mis. IP54, IP65) untuk ketahanan terhadap debu dan air pada panel dan motor.", None),
        ("🔗", "Kelompok Vektor dan Frekuensi", "Dyn5, YNyn0, dan sejenisnya menyatakan hubungan belitan serta geser fasa; wajib sama untuk trafo paralel. Frekuensi 50 Hz; peralatan 60 Hz tidak boleh dipakai begitu saja.", None),
    ])
    isi += tabel(["Contoh papan nama trafo distribusi", "Nilai", "Dipakai untuk"], [
        ["Daya pengenal", "400 kVA", "arus nominal, cadangan beban"],
        ["Tegangan", "20 000 / 400 V, tap ±2×2,5%", "rasio, penyetelan tegangan"],
        ["Kelompok vektor", "Dyn5", "syarat paralel, sistem pentanahan"],
        ["Impedansi", "4,0%", "arus hubung singkat sisi 400 V ≈ 14,4 kA"],
        ["Rugi tanpa beban / rugi beban", "610 W / 4600 W", "efisiensi, x_opt ≈ 36%"],
        ["Pendinginan / kenaikan suhu", "ONAN / 60 K", "derating di lingkungan panas"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Papan Nama Trafo di Atas:</strong> arus nominal 400 V = 400 kVA/(√3·400 V) ≈ 577 A; arus hubung singkat ≈ 577/0,04 ≈ 14,4 kA, jadi ACB di panel harus berkemampuan pemutusan di atas itu (misalnya 25 kA). Efisiensi maksimum di √(610/4600) ≈ 36% beban, cocok dengan trafo perumahan yang beban rata-ratanya rendah. Semua angka ini turun dari Persamaan (1), (6), dan (9).")
    isi += kotak("info-box", "<strong>🔍 Latihan Mandiri:</strong> foto papan nama satu peralatan listrik di sekitar Anda (motor pompa, genset, trafo tiang, atau panel). Tulis setiap angka yang ada dan pasangkan dengan persamaan di modul ini: mana yang memberi arus nominal, mana yang memberi arus hubung singkat, mana yang menentukan derating. Peralatan yang tidak Anda kenali angkanya adalah peralatan yang belum Anda kuasai.")
    m += bagian(7, "m-nameplate", "Membaca Papan Nama<br>dan Spesifikasi Komponen",
                "Papan nama (nameplate) adalah ringkasan kontrak antara pabrik dan pemakai: batas-batas yang dijamin selama peralatan dioperasikan di dalamnya. Insinyur yang dapat membaca papan nama dapat menghitung arus, rugi, efisiensi, dan arus hubung singkat tanpa mengukur apa pun. Bagian ini merangkum besaran yang lazim tertulis dan persamaan yang memakainya.",
                isi, "NAMEPLATE")

    # 08 — animasi
    isi = anim_panel(1, "cyan", r"Rasio Belitan Transformator \(a = N_1/N_2 = V_1/V_2 = I_2/I_1\)", "cvRasio",
                     [("sl_rs_n1", "v_rs_n1", "Lilitan primer N₁", 400, 2400, 20, 1000, "1000"), ("sl_rs_n2", "v_rs_n2", "Lilitan sekunder N₂", 10, 400, 2, 50, "50"), ("sl_rs_s", "v_rs_s", "Beban S (kVA)", 10, 400, 5, 100, "100")],
                     "btnRasio", "toggleRasio", "rasioInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Primer 20 kV di kiri, sekunder di kanan; jumlah lingkaran lilitan sebanding N₁ dan N₂, partikel menggambarkan arus (makin cepat dan besar, makin besar arusnya).<br>Amati: (1) <strong style=\"color:var(--cyan)\">Memperbesar N₂ menaikkan V₂</strong> dan menurunkan I₂ untuk beban yang sama. (2) Hasil kali V·I di kedua sisi selalu sama dengan S beban: trafo menukar tegangan dengan arus, bukan mengubah daya. (3) Bandingkan hasil di readout dengan soal C1 dan C2.")
    isi += anim_panel(2, "amber", r"Kurva Efisiensi Transformator \(\eta(x)\) dan Titik \(x_{opt}\)", "cvEfisiensi",
                      [("sl_ef_fe", "v_ef_fe", "Rugi inti P_Fe (kW)", 0.3, 3, 0.05, 1.0, "1.00"), ("sl_ef_cu", "v_ef_cu", "Rugi tembaga beban penuh P_Cu (kW)", 1, 12, 0.1, 6.0, "6.00"), ("sl_ef_pf", "v_ef_pf", "Faktor daya beban", 0.5, 1, 0.01, 0.85, "0.85")],
                      "btnEfisiensi", "toggleEfisiensi", "efisiensiInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kurva hijau adalah efisiensi trafo 630 kVA terhadap fraksi beban; titik merah muda menandai beban efisiensi maksimum, titik biru menyapu beban dari kecil ke lebih beban.<br>Amati: (1) <strong style=\"color:var(--amber)\">Memperbesar rugi inti menggeser puncak ke beban lebih tinggi</strong>, memperbesar rugi tembaga menggesernya ke beban lebih rendah, sesuai \\(x_{opt}=\\sqrt{P_{Fe}/P_{Cu}}\\). (2) Menurunkan faktor daya menurunkan seluruh kurva, karena rugi tetap tetapi daya aktif yang disalurkan berkurang. (3) Soal C4, C11, dan C12 memakai kurva ini.")
    isi += anim_panel(3, "pink", r"Arus Hubung Singkat Trafo dan Pemilihan Rating PMT \(I_{sc} = I_n/Z_{pu}\)", "cvHubungSingkat",
                      [("sl_hs_s", "v_hs_s", "Rating trafo S (MVA)", 5, 150, 5, 60, "60"), ("sl_hs_z", "v_hs_z", "Impedansi Z (%)", 4, 20, 0.5, 12, "12.0"), ("sl_hs_v", "v_hs_v", "Tegangan sisi hilir (kV)", 6, 150, 1, 20, "20")],
                      "btnHubungSingkat", "toggleHubungSingkat", "hubungSingkatInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Batang merah adalah arus hubung singkat di sisi hilir trafo (sumber dianggap tak terhingga); batang di kanannya adalah rating pemutusan PMT yang tersedia di pasaran, dan yang hijau adalah rating terkecil yang masih di atas arus gangguan.<br>Amati: (1) <strong style=\"color:var(--pink)\">Memperbesar impedansi trafo menurunkan arus hubung singkat</strong>, itulah alasan trafo GI dibuat dengan Z 10–15%. (2) Menaikkan rating trafo pada Z tetap menaikkan arus gangguan sebanding. (3) Pada 6 kV arus gangguan jauh lebih besar daripada di 20 kV untuk MVA yang sama, sehingga peralatan tegangan rendah menghadapi arus gangguan terbesar. Soal C7 dan C8 memakai hubungan ini.")
    isi += anim_panel(4, "green", r"Pembagian Beban Dua Trafo Paralel \(S_i \propto S_{r,i}/Z_{\%,i}\)", "cvParalel",
                      [("sl_pr_z1", "v_pr_z1", "Z T1 (%) — rating 1000 kVA", 3, 10, 0.1, 5, "5.0"), ("sl_pr_s2", "v_pr_s2", "Rating T2 (kVA)", 500, 2500, 50, 1600, "1600"), ("sl_pr_z2", "v_pr_z2", "Z T2 (%)", 3, 10, 0.1, 7, "7.0"), ("sl_pr_tot", "v_pr_tot", "Beban total (kVA)", 500, 3500, 50, 2200, "2200")],
                      "btnParalel", "toggleParalel", "paralelInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Dua batang menunjukkan persentase pembebanan T1 dan T2; batang yang melewati garis 100% berkedip merah.<br>Amati: (1) <strong style=\"color:var(--green)\">Samakan Z% keduanya</strong>, maka beban terbagi tepat sebanding rating dan keduanya mencapai 100% bersamaan. (2) Beri T1 impedansi lebih kecil: ia menarik bagian lebih besar dan lebih beban lebih dulu, sementara T2 masih longgar. (3) Angka \"beban total maksimum\" di readout adalah batas sebelum salah satu trafo lebih beban, selalu di bawah jumlah rating bila Z% berbeda. Soal C13 memakai pembagian ini.")
    isi += kotak("info-box", "<strong>🔍 Latihan Mandiri:</strong> pada Animasi 3, atur trafo 30 MVA, Z 11,5%, sisi 20 kV, dan bandingkan arus hubung singkatnya dengan contoh di Bagian 05 (sekitar 7,5 kA). Lalu turunkan Z ke 6% dan catat PMT mana yang kini diperlukan. Terakhir, pada Animasi 4 cari Z T1 yang membuat T1 dan T2 mencapai 100% bersamaan pada beban 2600 kVA.")
    m += bagian(8, "m-animasi", "Animasi Interaktif<br>Komponen Sistem Tenaga Listrik",
                "Geser parameter dan amati langsung bagaimana lilitan menentukan tegangan dan arus trafo, bagaimana rugi inti dan tembaga membentuk kurva efisiensi, bagaimana impedansi trafo membatasi arus hubung singkat dan menentukan PMT, serta bagaimana dua trafo paralel berbagi beban. Empat animasi ini adalah jembatan antara Persamaan (1)–(10) dan keputusan pemilihan komponen di lapangan.",
                isi, "ANIMASI")

    # 09 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; cetak dengan angka desimal secukupnya dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Rating, Arus Nominal, dan Rasio Transformator", '''import numpy as np

# ═══ Arus nominal dari rating (Persamaan 1) ═══
S_kVA, V1, V2 = 630.0, 20e3, 400.0          # trafo 20 kV / 400 V
I1 = S_kVA * 1e3 / (np.sqrt(3) * V1)
I2 = S_kVA * 1e3 / (np.sqrt(3) * V2)
print(f"Arus nominal primer   I1 = {I1:.4f} A")
print(f"Arus nominal sekunder I2 = {I2:.4f} A")

# ═══ Rasio transformasi (Persamaan 3) ═══
N1, N2 = 1500, 30
a = N1 / N2
print(f"Rasio a = N1/N2 = {a:.4f};  V2 tanpa beban = {V1 / a:.4f} V")

# ═══ Daya semu yang diperlukan beban (Persamaan 2) ═══
P_beban, pf = 320.0, 0.82                   # kW, faktor daya
S_perlu = P_beban / pf
print(f"S yang diperlukan = {S_perlu:.4f} kVA  -> pilih rating standar di atasnya")

# ═══ Generator: daya mekanik yang diperlukan ═══
S_gen, pf_gen, eta_g = 3000.0, 0.8, 0.95    # kVA, -, -
P_mek = S_gen * pf_gen / eta_g
print(f"Daya mekanik penggerak mula = {P_mek:.4f} kW")''')
    isi += kode("Cell 2 — Kurva Efisiensi Transformator, Titik Optimum, dan Efisiensi Harian", '''import numpy as np
import matplotlib.pyplot as plt

S, P_Fe, P_Cu, pf = 630.0, 1.0, 6.0, 0.85   # kVA, kW, kW, -
def eta(x):                                  # Persamaan 5
    P_out = x * S * pf
    return P_out / (P_out + P_Fe + x**2 * P_Cu) * 100

x_opt = np.sqrt(P_Fe / P_Cu)                 # Persamaan 6
print(f"Efisiensi beban penuh  = {eta(1.0):.4f} %")
print(f"x_opt = {x_opt:.4f}  ->  eta_maks = {eta(x_opt):.4f} %")

# Efisiensi harian: (durasi jam, fraksi beban, faktor daya)
profil = [(8, 1.0, 0.8), (10, 0.5, 0.9), (6, 0.0, 1.0)]
E_out = sum(j * x * S * p for j, x, p in profil)        # kWh
E_rugi = 24 * P_Fe + sum(j * x**2 * P_Cu for j, x, _ in profil)
print(f"Efisiensi harian = {E_out / (E_out + E_rugi) * 100:.4f} %")

x = np.linspace(0.02, 1.25, 300)
plt.figure(figsize=(8, 4))
plt.plot(x * 100, eta(x))
plt.axvline(x_opt * 100, ls='--', color='tab:red', label=f'x_opt = {x_opt*100:.1f}%')
plt.xlabel('Beban (%)'); plt.ylabel('Efisiensi (%)'); plt.grid(True); plt.legend(); plt.show()''')
    isi += kode("Cell 3 — Arus Hubung Singkat dan Pemilihan Rating PMT", '''import numpy as np

# Rel 150 kV: dari daya hubung singkat (Persamaan 9)
S_sc, V = 2200.0, 150.0                     # MVA, kV
I_sc_rel = S_sc / (np.sqrt(3) * V)          # kA
print(f"I_sc rel 150 kV = {I_sc_rel:.4f} kA")

# Sisi 20 kV trafo GI: dari impedansi persen
S_trafo, V2, Z = 30.0, 20.0, 11.5           # MVA, kV, %
I_n = S_trafo * 1e3 / (np.sqrt(3) * V2)     # A
I_sc_20 = I_n / (Z / 100) / 1000            # kA
print(f"I_n = {I_n:.4f} A,  I_sc sisi 20 kV = {I_sc_20:.4f} kA")

# Pilih rating pemutusan PMT terkecil yang masih di atas I_sc
rating_pmt = np.array([8, 12.5, 16, 20, 25, 31.5, 40, 50])
cukup = rating_pmt[rating_pmt >= I_sc_20]
print(f"Rating PMT dipilih = {cukup[0]} kA" if cukup.size else "Tidak ada rating yang cukup")''')
    isi += kode("Cell 4 — Trafo Paralel, Regulasi Tegangan, dan Resistansi Konduktor", '''import numpy as np

# Pembagian beban trafo paralel (Persamaan 10)
rating = np.array([1000.0, 1600.0])         # kVA
Z_pct  = np.array([5.0, 7.0])               # %
S_total = 2200.0
k = rating / Z_pct
beban = S_total * k / k.sum()
for i, (r, b) in enumerate(zip(rating, beban), 1):
    print(f"T{i}: {b:.4f} kVA  ({b / r * 100:.2f} % dari rating)")

# Regulasi tegangan orde pertama (Persamaan 7)
R_pct, X_pct, pf = 1.0, 5.5, 0.8
VR = R_pct * pf + X_pct * np.sqrt(1 - pf**2)
print(f"Regulasi tegangan = {VR:.4f} %")

# Resistansi konduktor (Persamaan 8) dan jatuh tegangan
rho_Al, L_km, A_mm2 = 0.0282, 12.0, 240.0
R = rho_Al * L_km * 1000 / A_mm2
I = 180.0
dV_pct = np.sqrt(3) * I * R / 20e3 * 100
print(f"R = {R:.4f} ohm/fasa;  jatuh tegangan pada {I:.0f} A = {dV_pct:.4f} %")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan angka di Bagian 03–06: arus nominal sekunder trafo 630 kVA ≈ {ind(I2_630, 1)} A, efisiensi maksimum ≈ {ind(ETA_OPT, 2)}% pada {ind(X_OPT * 100, 0)}% beban, arus hubung singkat sisi 20 kV trafo GI ≈ {ind(ISC_GI, 2)} kA, dan T1 pada trafo paralel memikul ≈ {ind(B1, 0)} kVA. Cell 2–4 memuat pola penyelesaian soal Hard C11–C15; pahami langkahnya, jangan hanya menyalin angkanya.")
    m += bagian(9, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut adalah fondasi kode untuk mengerjakan tugas. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya. Setiap perhitungan ditulis bertahap dan diberi nomor persamaan yang dipakainya, supaya dapat Anda telusuri kembali ke materi.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 3 (transformator, per unit) dan Bab 4 (parameter saluran): rasio, impedansi persen, dan konduktor ACSR.")
    refs += pm_ref(2, "amber", "249,115,22", "S. J. Chapman", "Electric Machinery Fundamentals", ", Fifth Edition. McGraw-Hill, 2012.", "Bab 2 (transformator: rugi, efisiensi, regulasi, paralel) dan Bab 4 (generator sinkron: rating, kurva kemampuan).")
    refs += pm_ref(3, "violet", "168,85,247", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik, Jilid 3: Gardu Induk", " (Cet. 7). Pradnya Paramita, 2004.", "Rujukan berbahasa Indonesia untuk rel, PMT, PMS, trafo ukur, arester, dan tata letak gardu induk.")
    refs += pm_ref(4, "green", "0,224,158", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik, Jilid 2: Saluran Transmisi", " (Cet. 7). Pradnya Paramita, 2004.", "Konduktor, isolator, menara, dan kemampuan hantar arus saluran udara.")
    refs += pm_ref(5, "pink", "236,72,153", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 4–6: penjelasan konseptual generator, transformator, dan peralatan gardu tanpa matematika berat.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi komponen sistem tenaga listrik: generator, transformator, saluran, gardu induk, dan peralatan distribusi. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan di modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> katalog pabrikan (trafo distribusi, PMT, ACSR) memuat papan nama lengkap dengan rugi, impedansi, dan kemampuan hantar arus yang nyata; SPLN (Standar PLN) dan IEC 60076 (transformator) serta IEC 62271 (PMT) adalah standar yang menjadi acuan angka-angka itu. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">I_n = S/(√3·V)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">η = xS cos φ/(xS cos φ + P_Fe + x²P_Cu)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">I_sc = I_n/Z_pu</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">S_i ∝ S_r/Z%</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">VR ≈ R cos φ + X sin φ</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Komponen</em><br>Sistem Tenaga</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar rating dan arus nominal, rasio dan efisiensi transformator, generator, konduktor, arus hubung singkat dan pemilihan PMT, serta transformator paralel. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Fungsi <strong>transformator penaik</strong> (step-up) di pembangkit adalah...",
     ["Menurunkan tegangan generator agar aman bagi beban", "Mengubah arus bolak-balik generator menjadi arus searah", "Menaikkan tegangan generator ke tegangan transmisi agar arus dan rugi saluran kecil", "Menstabilkan frekuensi keluaran generator pada 50 Hz"],
     "Fungsi transformator penaik"),
    ("Rating transformator dan generator dinyatakan dalam <strong>kVA atau MVA</strong>, bukan kW, karena...",
     ["Pabrikan tidak mengetahui faktor daya beban sehingga daya aktif tidak dapat dijamin", "Pemanasan belitan ditentukan arus (dan tegangan), bukan faktor daya beban", "Daya reaktif tidak dapat disalurkan transformator", "Satuan kW hanya dipakai untuk peralatan arus searah"],
     "Rating dalam kVA/MVA"),
    ("Perbedaan pokok <strong>pemutus tenaga (PMT)</strong> dan <strong>pemisah (PMS)</strong> adalah...",
     ["PMT dipasang di sisi tegangan rendah, PMS di sisi tegangan tinggi", "PMS memutus arus gangguan, PMT hanya memberi celah isolasi", "PMT bekerja manual, PMS bekerja otomatis lewat relai", "PMT mampu memutus arus beban maupun arus hubung singkat; PMS hanya boleh dibuka tanpa arus"],
     "PMT vs PMS"),
    ("Rugi transformator yang <strong>hampir tetap</strong> dari tanpa beban sampai beban penuh adalah...",
     ["Rugi inti (histeresis dan arus eddy), karena bergantung tegangan dan frekuensi", "Rugi tembaga, karena arus primer selalu sama", "Rugi bocor fluks, karena bergantung beban", "Rugi dielektrik minyak, karena berbanding kuadrat arus"],
     "Rugi inti tetap"),
    ("Efisiensi transformator mencapai <strong>maksimum</strong> ketika...",
     ["Transformator dibebani penuh (x = 1)", "Rugi tembaga sama besar dengan rugi inti", "Faktor daya beban sama dengan nol", "Tegangan sekunder sama dengan tegangan primer"],
     "Syarat efisiensi maksimum"),
    ("Konduktor <strong>ACSR</strong> memakai inti baja karena...",
     ["Baja menghantarkan arus lebih baik daripada aluminium", "Baja mencegah korona pada tegangan tinggi", "Baja memberi kekuatan tarik sehingga rentang antarmenara bisa panjang, sementara aluminium menghantarkan arus", "Baja lebih ringan daripada aluminium"],
     "Inti baja ACSR"),
    ("Fungsi <strong>trafo arus (CT)</strong> di gardu induk adalah...",
     ["Memutus arus gangguan saat relai bekerja", "Memberi celah isolasi yang terlihat saat perawatan", "Menurunkan tegangan rel menjadi 100 V untuk meter", "Menurunkan arus primer yang besar menjadi 1 A atau 5 A untuk relai dan alat ukur"],
     "Fungsi trafo arus"),
    ("<strong>Impedansi persen (Z%)</strong> transformator berguna terutama untuk menentukan...",
     ["Arus hubung singkat di sisi hilir transformator", "Frekuensi kerja transformator", "Rugi inti transformator", "Jumlah lilitan primer dan sekunder"],
     "Kegunaan Z%"),
    ("Agar dua transformator dapat bekerja <strong>paralel</strong> dengan beban terbagi sebanding rating, syarat yang harus dipenuhi adalah...",
     ["Kedua transformator harus berasal dari pabrikan yang sama", "Rasio tegangan dan kelompok vektor sama serta impedansi persen mendekati", "Rating kVA kedua transformator harus persis sama", "Kedua transformator harus dipasang pada tiang yang sama"],
     "Syarat paralel transformator"),
    ("Komponen gardu induk yang menjadi <strong>titik simpul</strong> tempat pasokan dan seluruh penyulang bertemu adalah...",
     ["Arester surja", "Trafo tegangan (PT)", "Rel (busbar)", "Kawat tanah"],
     "Rel sebagai simpul"),
]

COMP_EZ_LABELS = ["Arus nominal sekunder trafo distribusi", "Tegangan sekunder dari rasio lilitan", "Daya semu S dari P dan cos φ", "Efisiensi trafo pada beban sebagian",
                  "Daya mekanik penggerak generator", "Resistansi konduktor aluminium", "Arus hubung singkat rel dari MVA_sc", "Arus hubung singkat sisi 20 kV dari Z% trafo",
                  "Arus rel dari tiga penyulang", "Jatuh tegangan penyulang (%)"]
COMP_HARD_LABELS = ["Efisiensi maksimum trafo (x_opt)", "Efisiensi harian (all-day) trafo", "Pembagian beban trafo paralel",
                    "Arus puncak tahun ke-10 untuk pemilihan konduktor", "Regulasi tegangan trafo orde pertama"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 1, 3: 3}
S_BUTUH_078 = 2.4 / 0.78 * 1000
S_BUTUH_095 = 2.4 / 0.95 * 1000
IN_3150 = 3150e3 / (SQ3 * 400)
ISC_3150 = IN_3150 / 0.065 / 1000
KP1, KP2 = 1600 / 6, 1600 / 5
BP2 = S_BUTUH_078 * KP2 / (KP1 + KP2)

FQ_JUDUL = [
    "Petakan komponen dari gardu induk sampai motor gergaji, lalu putuskan: cukupkah trafo 1600 kVA yang ada?",
    "Berapa arus hubung singkat di panel 400 V bila trafo diganti 3150 kVA, dan apa artinya bagi pemutus di panel?",
    "Kalau memilih opsi paralel 1600 kVA + 1600 kVA, trafo mana yang lebih dulu lebih beban, dan mengapa?",
]
FQ_RINGKAS = [
    "Daftarkan komponen dari GI 20 kV sampai motor: penyulang, FCO/PMT 20 kV, trafo, kabel, ACB/MCCB, kapasitor, motor. Hitung S yang diperlukan beban 2,4 MW pada cos φ 0,78 dan pada 0,95 setelah kapasitor, lalu bandingkan dengan 1600 kVA.",
    "Hitung arus nominal sisi 400 V trafo 3150 kVA dan arus hubung singkatnya dari Z 6,5% (sumber tak terhingga). Jelaskan syarat kemampuan pemutusan ACB utama dan MCCB cabang, serta mengapa angka ini jauh lebih besar daripada di sisi 20 kV.",
    "Bagi beban 3077 kVA antara T1 (1600 kVA, Z 6%) dan T2 (1600 kVA, Z 5%) memakai S/Z%. Tentukan trafo mana yang lebih beban dan berapa beban total maksimum tanpa ada yang lebih beban, lalu bandingkan dengan opsi trafo tunggal 3150 kVA.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Daftarkan komponen yang dilewati daya dari rel 20 kV gardu induk sampai motor gergaji, beserta fungsi tiap komponen (Bagian 01, 05, 06). Lalu hitung daya semu yang diperlukan beban 2,4 MW pada faktor daya 0,78 (Persamaan 1–2), dan sekali lagi bila faktor daya diperbaiki ke 0,95 dengan kapasitor. Bandingkan keduanya dengan rating 1600 kVA yang terpasang: apakah kapasitor saja cukup menyelamatkan trafo lama?",
            ["S = P/cos φ", "kapasitor → cos φ naik → S turun", "rating ≥ S + cadangan"],
            "Daya semu yang diperlukan beban 2,4 MW pada faktor daya 0,78 adalah sekitar...",
            ["1872 kVA, sehingga trafo 1600 kVA hampir cukup", "2400 kVA, sama dengan daya aktifnya", f"{ind(S_BUTUH_078, 0)} kVA, hampir dua kali rating trafo yang ada", "1248 kVA, sehingga trafo 1600 kVA masih longgar"],
            f"✅ Tepat! \\(S = 2{{,}}4/0{{,}}78 \\approx {ind(S_BUTUH_078 / 1000, 2)}\\) MVA. Bahkan setelah faktor daya diperbaiki ke 0,95, \\(S \\approx {ind(S_BUTUH_095 / 1000, 2)}\\) MVA, masih jauh di atas 1600 kVA. Kapasitor mengurangi kebutuhan, tetapi trafo tetap harus ditambah atau diganti.",
            "❌ Ingat \\(S = P/\\cos\\varphi\\): faktor daya 0,78 berarti daya semu <em>lebih besar</em> daripada daya aktif, bukan lebih kecil. Hitung ulang dengan 2,4 MW dibagi 0,78.",
            "Petunjuk: (1) Urutkan komponen dari GI ke motor beserta fungsinya. (2) Hitung S pada cos φ 0,78 dan 0,95. (3) Simpulkan apakah trafo 1600 kVA cukup, dengan atau tanpa kapasitor.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Hitung arus nominal sisi 400 V trafo 3150 kVA, lalu arus hubung singkatnya dari impedansi 6,5% dengan menganggap sumber 20 kV tak terhingga (Persamaan 9). Jelaskan apa yang harus dipenuhi ACB utama dan MCCB cabang di panel (kemampuan pemutusan), dan mengapa arus gangguan di sisi 400 V jauh lebih besar daripada di sisi 20 kV padahal dayanya sama (Bagian 05–06).",
            ["I_n = S/(√3·V)", "I_sc = I_n/Z_pu", "kemampuan pemutusan ≥ I_sc"],
            "Arus hubung singkat di terminal 400 V trafo 3150 kVA, Z 6,5% (sumber tak terhingga) adalah sekitar...",
            [f"{ind(IN_3150 / 1000, 2)} kA, sama dengan arus nominalnya", f"{ind(ISC_3150, 1)} kA, sehingga ACB utama harus berkemampuan pemutusan di atas itu", "6,5 kA, sesuai impedansi persennya", "2,05 kA, karena arus terbagi ke tiga fasa"],
            f"✅ Tepat! \\(I_n = 3150\\times10^3/(\\sqrt{{3}}\\times400) \\approx {ind(IN_3150, 0)}\\) A dan \\(I_{{sc}} = {ind(IN_3150, 0)}/0{{,}}065 \\approx {ind(ISC_3150 * 1000, 0)}\\) A ≈ {ind(ISC_3150, 1)} kA. ACB utama harus berkemampuan pemutusan di atas itu (misalnya 80 kA); MCCB cabang yang dekat panel juga menghadapi arus sebesar ini.",
            "❌ Arus hubung singkat adalah arus nominal <em>dibagi</em> impedansi per unit (0,065), jadi belasan kali arus nominal. Hitung dulu \\(I_n\\) di sisi 400 V, lalu bagi dengan 0,065.",
            "Petunjuk: (1) Hitung I_n sisi 400 V. (2) Hitung I_sc = I_n/Z_pu. (3) Jelaskan syarat kemampuan pemutusan ACB/MCCB dan mengapa sisi 400 V menghadapi arus gangguan terbesar.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Opsi B memparalelkan trafo lama T1 (1600 kVA, Z 6%) dengan trafo baru T2 (1600 kVA, Z 5%). Bagilah beban {ind(S_BUTUH_078, 0)} kVA (tanpa kapasitor) memakai Persamaan (10), tentukan trafo mana yang lebih beban, dan hitung beban total maksimum tanpa ada yang lebih beban. Bandingkan dengan opsi A (satu trafo 3150 kVA): mana yang Anda rekomendasikan, dengan alasan teknis dan praktis (cadangan saat perawatan, ruang, biaya)?",
            ["S_i ∝ S_r/Z%", "Z kecil → bagian lebih besar", "N-1: satu trafo dirawat"],
            f"Pada beban {ind(S_BUTUH_078, 0)} kVA, pembagian antara T1 (Z 6%) dan T2 (Z 5%) menghasilkan...",
            ["Keduanya tepat 50%, karena ratingnya sama", "T1 lebih beban, karena impedansinya lebih besar", "Keduanya di bawah 100%, karena kapasitas gabungan 3200 kVA", f"T2 memikul sekitar {ind(BP2, 0)} kVA ({ind(BP2 / 16, 0)}%), lebih beban, walau kapasitas gabungan 3200 kVA"],
            f"✅ Tepat! \\(S_1/Z_1 = {ind(KP1, 1)}\\), \\(S_2/Z_2 = {ind(KP2, 0)}\\); T2 memikul \\({ind(S_BUTUH_078, 0)}\\times{ind(KP2, 0)}/{ind(KP1 + KP2, 1)} \\approx {ind(BP2, 0)}\\) kVA, lebih beban, sementara T1 baru {ind((S_BUTUH_078 - BP2) / 16, 0)}%. Trafo dengan Z lebih kecil selalu menarik bagian lebih besar.",
            "❌ Rating sama tidak berarti beban terbagi sama: pembagian mengikuti \\(S_r/Z\\%\\), dan trafo dengan impedansi <em>lebih kecil</em> menarik bagian lebih besar. Hitung \\(S/Z\\) masing-masing lalu bagi bebannya.",
            "Petunjuk: (1) Bagi beban dengan S/Z%. (2) Tentukan yang lebih beban dan beban total maksimum. (3) Bandingkan opsi A dan B dari sisi teknis dan praktis, lalu beri rekomendasi.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">S = P/cos φ</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">I_sc = I_n/Z_pu</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S_i ∝ S_r/Z%</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">1600 → 3150 kVA?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Pabrik yang<br><em>Kekurangan Trafo</em></h1>
    <p class="hero-sub">Sebuah pabrik pengolahan kayu memperluas produksi dan trafonya tidak lagi cukup. Terapkan kosakata Pertemuan {PERTEMUAN} — rating dan arus nominal, impedansi persen dan arus hubung singkat, serta pembagian beban trafo paralel — untuk menilai dua usulan perbaikannya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Perluasan Pabrik Kayu —<br>Ganti Trafo atau Paralel?</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS KOMPONEN SISTEM TENAGA</div>
    <p>
      Sebuah <strong style="color:var(--amber)">pabrik pengolahan kayu</strong> dipasok dari penyulang 20 kV melalui satu <strong style="color:var(--cyan)">transformator 1600 kVA, 20 kV/400 V, Z 6%</strong>. Beban saat ini <strong>1,1 MW pada faktor daya 0,78</strong> (motor gergaji, blower, dan kompresor). Perluasan tahun depan menambah lini gergaji dan kiln pengering sehingga beban puncak menjadi <strong style="color:var(--pink)">2,4 MW</strong> dengan faktor daya yang sama.
    </p>
    <p style="margin-top:12px">
      Gardu induk memberi daya hubung singkat 350 MVA di rel 20 kV; PMT 20 kV di sisi pabrik berkemampuan pemutusan 12,5 kA. Dua usulan masuk: <strong>(A)</strong> mengganti trafo dengan <strong style="color:var(--amber)">3150 kVA, Z 6,5%</strong>, atau <strong>(B)</strong> menambah trafo <strong style="color:var(--amber)">1600 kVA, Z 5%</strong> yang diparalelkan dengan trafo lama. Bagian listrik juga mengusulkan kapasitor bank untuk menaikkan faktor daya ke 0,95.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menilai kedua usulan itu memakai kerangka yang baru dipelajari, <strong style="color:var(--cyan)">sebelum</strong> analisis rinci dilakukan pada pertemuan-pertemuan berikutnya.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Trafo ada: 1600 kVA, Z 6%", "14,165,233", "cyan")}
{kartu("Beban baru: 2,4 MW, cos φ 0,78", "14,165,233", "cyan")}
{kartu("Opsi A: 3150 kVA, Z 6,5%", "14,165,233", "cyan")}
{kartu("Opsi B: + 1600 kVA, Z 5%", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Kekurangan kapasitas dan arus hubung singkat yang membesar adalah dua sisi dari keputusan yang sama. Forum ini mengajak Anda menghitung <strong>berapa</strong> daya semu yang benar-benar diperlukan, <strong>seberapa besar</strong> arus gangguan yang harus diputus pemutus di panel, dan <strong>bagaimana</strong> dua trafo paralel berbagi beban.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Kebutuhan daya semu beban pada dua faktor daya dibandingkan dengan trafo terpasang dan kedua opsi; pada opsi B beban terbagi tidak merata</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Pabrik pengolahan kayu dipasok penyulang 20 kV lewat trafo 1600 kVA (20/0,4 kV, Z 6%). Beban kini 1,1 MW pada cos φ 0,78; perluasan menjadikannya 2,4 MW. GI memberi 350 MVA hubung singkat di 20 kV; PMT 20 kV 12,5 kA. Usulan A: ganti trafo 3150 kVA Z 6,5%. Usulan B: paralel dengan tambahan 1600 kVA Z 5%. Kapasitor bank diusulkan untuk menaikkan cos φ ke 0,95."
FORUM_CHIPS_LMS = ["trafo ada = 1600 kVA, Z 6%", "beban baru = 2,4 MW, cos φ 0,78", "opsi A = 3150 kVA, Z 6,5%", "opsi B = +1600 kVA, Z 5%"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Kebutuhan daya semu vs kapasitas trafo (Pertemuan 2)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const padL = 170, padR = 24, padT = 14, padB = 22;
  const plotW = W - padL - padR;
  const baris = [
    { label: 'Kebutuhan, cos φ 0,78', nilai: 2400 / 0.78, warna: 'rgba(239,68,68,.9)' },
    { label: 'Kebutuhan, cos φ 0,95', nilai: 2400 / 0.95, warna: 'rgba(249,115,22,.9)' },
    { label: 'Trafo ada 1600 kVA', nilai: 1600, warna: 'rgba(148,163,184,.8)' },
    { label: 'Opsi A 3150 kVA', nilai: 3150, warna: 'rgba(34,211,238,.9)' },
    { label: 'Opsi B 1600 + 1600 kVA', nilai: 3200, warna: 'rgba(168,85,247,.9)', bagi: [1600 / 6, 1600 / 5] },
  ];
  const maks = 3500, barH = (H - padT - padB) / baris.length, X = (v) => padL + v / maks * plotW;
  ctx.font = '10px JetBrains Mono';
  [1000, 2000, 3000].forEach((v) => { ctx.strokeStyle = 'rgba(148,163,184,.18)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(v), padT); ctx.lineTo(X(v), H - padB); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.textAlign = 'center'; ctx.fillText(v + ' kVA', X(v), H - 8); });
  baris.forEach((b, i) => {
    const y = padT + i * barH + barH * 0.18, h = barH * 0.64;
    ctx.textAlign = 'right'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(b.label, padL - 8, y + h / 2 + 4);
    if (b.bagi) {
      const beban = 2400 / 0.78, k = b.bagi, tot = k[0] + k[1];
      const s1 = beban * k[0] / tot, s2 = beban * k[1] / tot;
      ctx.fillStyle = 'rgba(168,85,247,.35)'; ctx.fillRect(X(0), y, X(1600) - X(0), h); ctx.fillRect(X(1600), y, X(3200) - X(1600), h);
      ctx.fillStyle = s1 > 1600 ? 'rgba(239,68,68,.9)' : b.warna; ctx.fillRect(X(0), y, X(s1) - X(0), h);
      ctx.fillStyle = s2 > 1600 ? 'rgba(239,68,68,.9)' : b.warna; ctx.fillRect(X(1600), y, X(1600 + s2) - X(1600), h);
      ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0';
      ctx.fillText('T1 ' + s1.toFixed(0) + ' kVA', X(0) + 6, y + h / 2 + 4);
      ctx.fillStyle = '#fca5a5'; ctx.fillText('T2 ' + s2.toFixed(0) + ' kVA (' + (s2 / 16).toFixed(0) + '%)', X(1600) + 6, y + h / 2 + 4);
    } else {
      ctx.fillStyle = b.warna; ctx.fillRect(X(0), y, X(b.nilai) - X(0), h);
      ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(b.nilai.toFixed(0) + ' kVA', X(b.nilai) + 6, y + h / 2 + 4);
    }
  });
  ctx.textAlign = 'left';
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
