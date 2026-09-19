# Konten Modul 7 Teknik Tenaga Listrik — Reaktansi dan Impedansi di Sistem
# Tenaga Listrik (Sub-CPMK 3.2, Pertemuan 7). Angka contoh dihitung di sini agar
# teks, tabel, dan gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 7
PERTEMUAN = 7
SUB_CPMK = "3.2"
JUDUL = "Reaktansi dan Impedansi di Sistem Tenaga Listrik"
JUDUL_PANJANG = "Reaktansi dan Impedansi di Sistem Tenaga Listrik"
JUDUL_EKSPOR = "Reaktansi dan Impedansi Sistem Tenaga"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
S_B = 100.0                                                   # basis sistem (MVA)
# generator contoh
SG, VG, XG2, XG1, XGS = 100.0, 13.8, 0.18, 0.28, 1.4          # MVA, kV, X″, X′, X_s (pu rating)
ZB_G = VG ** 2 / SG
IB_G = SG * 1e6 / (SQ3 * VG * 1e3)
XG2_OHM = XG2 * ZB_G
ISC_G = IB_G / XG2                                            # A, hubung singkat terminal
SSC_G = SG / XG2
# trafo contoh
ST, XT_PCT = 80.0, 12.0
XT_PU = XT_PCT / 100 * S_B / ST                               # pada basis 100 MVA
VSC_T = XT_PCT / 100 * 150.0                                  # tegangan hubung singkat (kV) sisi 150 kV
ISC_T_N = 1 / (XT_PCT / 100)                                  # kelipatan I_n
# saluran contoh
VL_L, XL_OHM = 150.0, 35.0
ZB_L = VL_L ** 2 / S_B
XL_PU = XL_OHM / ZB_L
# reduksi
X_A = XG2 * S_B / SG                                          # generator pada basis 100 (sama)
X_B = X_A + XT_PU
X_C = X_B + XL_PU
SSC_A, SSC_B, SSC_C = S_B / X_A, S_B / X_B, S_B / X_C
ISC_A = SSC_A / (SQ3 * VG)                                    # kA
ISC_B = SSC_B / (SQ3 * 150.0)
# konversi basis contoh: trafo 80 MVA, 13.8/150 kV pada basis 100 MVA & 138 kV? gunakan generator 100 MVA 13.8 kV → basis 13.2 kV
XG2_NEWV = XG2 * (S_B / SG) * (VG / 13.2) ** 2
# Y–Δ contoh
ZA, ZBB, ZC = 3.0, 6.0, 9.0
NUM = ZA * ZBB + ZBB * ZC + ZC * ZA
ZAB, ZBC, ZCA = NUM / ZC, NUM / ZA, NUM / ZBB
# generator paralel contoh
XG2B = 0.25
X_PAR = XG2 * XG2B / (XG2 + XG2B)
X_PAR_T = X_PAR + XT_PU
SSC_PAR = S_B / X_PAR_T
# rel 20 kV via trafo 60 MVA 10 % dari sumber 2000 MVA
SSRC, ST2, XT2 = 2000.0, 60.0, 0.10
X_SRC = S_B / SSRC
X_T2 = XT2 * S_B / ST2
SSC_20 = S_B / (X_SRC + X_T2)
ISC_20 = SSC_20 / (SQ3 * 20.0)


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def reaktor(x1, x2, y, c, label, dy=-12):
    n, w = 4, (x2 - x1) / 4
    d = " ".join(f"a {w / 2:.1f} {w / 2:.1f} 0 0 1 {w:.1f} 0" for _ in range(n))
    return f'<path d="M {x1} {y} {d}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t((x1 + x2) / 2, y + dy, label, 10.5, c, "middle", "600")


def rel(x, y1, y2, c, label):
    return kawat(x, y1, x, y2, c, 5) + t(x, y1 - 8, label, 10.5, c, "middle", "700")


def generator(x, y, c, label):
    return f'<circle cx="{x}" cy="{y}" r="14" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x, y + 4, "G", 12, c, "middle", "700") + t(x, y + 30, label, 10, c, "middle", "600")


def gambar1():
    b = ""
    x0, x1, y0, y1 = 64, 630, 200, 26
    tmax, imax = 3.0, 1 / XG2 * 1.15
    X = lambda tt: x0 + tt / tmax * (x1 - x0)
    Y = lambda i: y0 - i / imax * (y0 - y1)
    for tt in [0, 0.5, 1, 1.5, 2, 2.5, 3]:
        b += f'<line x1="{X(tt):.1f}" y1="{y1}" x2="{X(tt):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(tt), y0 + 16, f"{tt:g} s", 10.5, AX)
    for i, c, lab in [(1 / XG2, "#ec4899", f"I″ = 1/X″ = {ind(1 / XG2, 2)} pu"), (1 / XG1, "#f59e0b", f"I′ = 1/X′ = {ind(1 / XG1, 2)} pu"), (1 / XGS, "#00e09e", f"I = 1/X_s = {ind(1 / XGS, 2)} pu")]:
        b += f'<line x1="{x0}" y1="{Y(i):.1f}" x2="{x1}" y2="{Y(i):.1f}" stroke="{c}" stroke-width="1.2" stroke-dasharray="5 4"/>' + t(x0 + 6, Y(i) - 5, lab, 10.5, c, "start", "600")
    env = lambda tt: (1 / XG2 - 1 / XG1) * math.exp(-tt / 0.03) + (1 / XG1 - 1 / XGS) * math.exp(-tt / 1.0) + 1 / XGS
    pts = " ".join(f"{X(i / 300 * tmax):.1f},{Y(env(i / 300 * tmax)):.1f}" for i in range(301))
    b += f'<polyline points="{pts}" fill="none" stroke="#22d3ee" stroke-width="2.6"/>'
    b += t(X(0.12), Y(env(0.12)) - 10, "selubung arus rms", 10.5, "#22d3ee", "start", "600")
    b += t(28, 112, "I (pu)", 10.5, AX)
    b += t(347, 230, f"Generator {ind(SG, 0)} MVA/{ind(VG, 1)} kV: X″ = {ind(XG2, 2)}, X′ = {ind(XG1, 2)}, X_s = {ind(XGS, 1)} pu; T″ ≈ 0,03 s, T′ ≈ 1 s. PMT harus memutus arus yang masih dekat nilai subtransien", 11.5, AX)
    return svg(660, 240, b, "Gambar 1 — Selubung arus hubung singkat generator: subtransien, transien, tunak")


def gambar2():
    b = t(165, 22, "Uji hubung singkat trafo", 12, TX, "middle", "700")
    b += kawat(40, 70, 90, 70) + reaktor(90, 170, 70, "#a855f7", f"X_T = {ind(XT_PCT, 0)} %") + kawat(170, 70, 230, 70) + kawat(230, 70, 230, 150) + kawat(40, 150, 230, 150) + kawat(40, 70, 40, 90) + kawat(40, 130, 40, 150)
    b += f'<circle cx="40" cy="110" r="16" fill="{BOX}" stroke="#f59e0b" stroke-width="2"/>' + t(40, 114, "V", 11, "#f59e0b", "middle", "700") + t(22, 114, f"{ind(VSC_T, 0)} kV", 10.5, "#f59e0b", "end", "600")
    b += arrow(110, 96, 160, 96, "#00e09e", 1.8) + t(135, 110, "I_n", 11, "#00e09e", "middle", "600")
    b += t(230, 170, "sekunder dihubung singkat", 10.5, AX, "end")
    b += t(165, 196, f"{ind(XT_PCT, 0)} % dari 150 kV sudah mengalirkan I_n", 11, TX) + t(165, 212, f"→ I_sc terminal ≈ {ind(ISC_T_N, 2)} × I_n", 11, AX)
    b += t(495, 22, "Refleksi impedansi lewat rasio", 12, TX, "middle", "700")
    b += kawat(360, 110, 400, 110) + f'<circle cx="418" cy="110" r="16" fill="none" stroke="#a855f7" stroke-width="2"/><circle cx="442" cy="110" r="16" fill="none" stroke="#a855f7" stroke-width="2"/>' + kawat(460, 110, 500, 110)
    b += t(430, 84, "13,8 / 150 kV", 10.5, "#a855f7", "middle", "600")
    b += t(380, 140, f"Z_base 13,8 kV = {ind(VG ** 2 / S_B, 3)} Ω", 10.5, "#f59e0b", "middle", "600") + t(560, 140, f"Z_base 150 kV = {ind(ZB_L, 0)} Ω", 10.5, "#22d3ee", "middle", "600")
    b += t(495, 164, f"X_T = {ind(XT_PU, 4)} pu di kedua sisi (basis 100 MVA)", 11, TX)
    b += t(495, 182, f"= {ind(XT_PU * VG ** 2 / S_B, 4)} Ω sisi 13,8 kV = {ind(XT_PU * ZB_L, 2)} Ω sisi 150 kV", 10.5, AX)
    b += t(495, 212, "rasio (150/13,8)² = 118×: itulah yang dihapus per unit", 10.5, AX)
    return svg(660, 226, b, "Gambar 2 — Impedansi transformator: uji hubung singkat dan refleksi antar-sisi")


def gambar3():
    b = ""
    kartu = [("Pilih basis", f"S_base = {ind(S_B, 0)} MVA (satu untuk seluruh sistem)\nV_base = tegangan nominal tiap zona (13,8 / 150 kV), berbanding rasio trafo", "#22d3ee"),
             ("Turunkan basis lain", f"Z_base = kV²/MVA → {ind(ZB_G, 3)} Ω (13,8 kV), {ind(ZB_L, 0)} Ω (150 kV)\nI_base = S/(√3·V) → {ind(IB_G, 0)} A (13,8 kV), {ind(S_B * 1e6 / (SQ3 * 150e3), 0)} A (150 kV)", "#f59e0b"),
             ("Nyatakan tiap alat", f"generator {ind(XG2, 2)} pu (rating = basis); trafo {ind(XT_PCT, 0)} % @{ind(ST, 0)} MVA → {ind(XT_PU, 4)} pu\nsaluran {ind(XL_OHM, 0)} Ω/{ind(ZB_L, 0)} Ω = {ind(XL_PU, 4)} pu", "#a855f7"),
             ("Hitung, lalu kembalikan", f"X_th rel C = {ind(X_C, 4)} pu → S_sc = 100/{ind(X_C, 4)} = {ind(SSC_C, 0)} MVA\nI_sc = {ind(SSC_C, 0)}/(√3·150) = {ind(SSC_C / (SQ3 * 150), 3)} kA", "#00e09e")]
    for i, (judul, isi, c) in enumerate(kartu):
        y = 22 + i * 52
        b += f'<rect x="20" y="{y}" width="620" height="44" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.4"/>'
        b += f'<circle cx="42" cy="{y + 22}" r="12" fill="{c}"/>' + t(42, y + 26, str(i + 1), 12, "#0a101f", "middle", "700")
        b += t(64, y + 16, judul, 11.5, TX, "start", "700")
        for j, baris in enumerate(isi.split("\n")):
            b += t(64 + (0 if j == 0 else 0), y + 16 + 13 * (j + 1) - (0 if j else 0), baris, 9.5, AX, "start")
    return svg(660, 236, b, "Gambar 3 — Empat langkah perhitungan per unit pada sistem contoh")


def gambar4():
    b = t(160, 22, "Bintang (Y)", 12, TX, "middle", "700") + t(500, 22, "Segitiga (Δ)", 12, TX, "middle", "700")
    cx, cy, r = 160, 120, 68
    pts = [(cx, cy - r), (cx - r * 0.87, cy + r * 0.5), (cx + r * 0.87, cy + r * 0.5)]
    warna = ["#ef4444", "#f59e0b", "#22d3ee"]
    for i, ((x, y), Z, lab) in enumerate(zip(pts, [ZA, ZBB, ZC], ["a", "b", "c"])):
        b += kawat(cx, cy, x, y)
        mx, my = (cx + x) / 2, (cy + y) / 2
        b += f'<rect x="{mx - 20:.1f}" y="{my - 9:.1f}" width="40" height="18" rx="3" fill="{BOX}" stroke="{warna[i]}" stroke-width="1.8"/>' + t(mx, my + 4, f"Z_{lab} {ind(Z, 0)}", 9.5, warna[i], "middle", "600")
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="{warna[i]}"/>' + t(x + (0 if i == 0 else (-12 if i == 1 else 12)), y - 10 if i == 0 else y + 18, lab, 12, warna[i], "middle", "700")
    b += f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{AX}"/>'
    b += t(160, 212, "Z_Δ = (Z_aZ_b + Z_bZ_c + Z_cZ_a) / Z_lawan", 10.5, AX)
    cx2 = 500
    pts2 = [(cx2, cy - r), (cx2 - r * 0.87, cy + r * 0.5), (cx2 + r * 0.87, cy + r * 0.5)]
    for (i, j, Z, lab) in [(0, 1, ZAB, "Z_ab"), (1, 2, ZBC, "Z_bc"), (2, 0, ZCA, "Z_ca")]:
        (x1, y1), (x2, y2) = pts2[i], pts2[j]
        b += kawat(x1, y1, x2, y2)
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        b += f'<rect x="{mx - 28:.1f}" y="{my - 9:.1f}" width="56" height="18" rx="3" fill="{BOX}" stroke="#00e09e" stroke-width="1.8"/>' + t(mx, my + 4, f"{lab} {ind(Z, 1)}", 9.5, "#00e09e", "middle", "600")
    for i, ((x, y), lab) in enumerate(zip(pts2, ["a", "b", "c"])):
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="{warna[i]}"/>' + t(x + (0 if i == 0 else (-12 if i == 1 else 12)), y - 10 if i == 0 else y + 18, lab, 12, warna[i], "middle", "700")
    b += t(500, 212, "Z_Y = Z_ab·Z_ca / (Z_ab + Z_bc + Z_ca), dst.", 10.5, AX)
    b += t(330, 232, f"Contoh: Y (3, 6, 9 Ω) ⇔ Δ ({ind(ZAB, 0)}, {ind(ZBC, 0)}, {ind(ZCA, 1)} Ω); pemeriksaan a–b dengan c terbuka: {ind(ZA + ZBB, 0)} Ω = {ind(ZAB * (ZBC + ZCA) / (ZAB + ZBC + ZCA), 2)} Ω", 11, AX)
    return svg(660, 242, b, "Gambar 4 — Transformasi bintang–segitiga")


def gambar5():
    b = ""
    y = 100
    b += generator(40, y - 34, "#f59e0b", f"G1 {ind(XG2, 2)}") + generator(40, y + 34, "#f59e0b", f"G2 {ind(XG2B, 2)}")
    for yy, X in [(y - 34, XG2), (y + 34, XG2B)]:
        b += kawat(54, yy, 80, yy) + reaktor(80, 140, yy, "#f59e0b", f"j{ind(X, 2)}") + kawat(140, yy, 200, yy) + kawat(200, yy, 200, y)
    b += rel(200, y - 50, y + 50, "#22d3ee", "rel A · 13,8 kV")
    b += kawat(200, y, 250, y) + reaktor(250, 330, y, "#a855f7", f"T j{ind(XT_PU, 3)}") + kawat(330, y, 380, y)
    b += rel(380, y - 50, y + 50, "#22d3ee", "rel B · 150 kV")
    b += kawat(380, y, 430, y) + reaktor(430, 520, y, "#00e09e", f"saluran j{ind(XL_PU, 4)}") + kawat(520, y, 570, y)
    b += rel(570, y - 50, y + 50, "#22d3ee", "rel C")
    for x, X, S in [(200, X_PAR, S_B / X_PAR), (380, X_PAR_T, S_B / X_PAR_T), (570, X_PAR_T + XL_PU, S_B / (X_PAR_T + XL_PU))]:
        b += t(x, y + 66, f"X_th = {ind(X, 4)} pu", 10, TX, "middle", "600") + t(x, y + 80, f"S_sc = {ind(S, 0)} MVA", 10, "#00e09e", "middle", "600")
    b += t(330, 206, f"Basis 100 MVA. Dua generator paralel: {ind(XG2, 2)}‖{ind(XG2B, 2)} = {ind(X_PAR, 4)} pu; tiap rel ke kanan menambah reaktansi seri sehingga MVA hubung singkat mengecil", 11, AX)
    return svg(660, 218, b, "Gambar 5 — Diagram reaktansi per unit dan reduksi ke ekuivalen Thevenin tiap rel")


def gambar6():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    X = lambda s: x0 + s / 3000 * (x1 - x0)
    Y = lambda i: y0 - i / 100 * (y0 - y1)
    for s in [0, 500, 1000, 1500, 2000, 2500, 3000]:
        b += f'<line x1="{X(s):.1f}" y1="{y1}" x2="{X(s):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(s), y0 + 16, f"{s}", 10.5, AX)
    for i in [0, 20, 40, 60, 80, 100]:
        b += t(x0 - 8, Y(i) + 4, f"{i} kA", 10.5, AX, "end")
    for kv, c in [(20, "#ef4444"), (70, "#f59e0b"), (150, "#22d3ee"), (500, "#00e09e")]:
        pts = " ".join(f"{X(s):.1f},{Y(min(100, s / (SQ3 * kv))):.1f}" for s in range(0, 3001, 50))
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2.2"/>'
        sl = min(3000, 100 * SQ3 * kv)
        b += t(X(sl) - 6 if sl < 3000 else x1 + 4, Y(min(100, sl / (SQ3 * kv))) + (14 if sl < 3000 else 4), f"{kv} kV", 10.5, c, "end" if sl < 3000 else "start", "600")
    for ka in [25, 40, 63]:
        b += f'<line x1="{x0}" y1="{Y(ka):.1f}" x2="{x1}" y2="{Y(ka):.1f}" stroke="#ec4899" stroke-width="1" stroke-dasharray="4 4"/>' + t(x1 - 4, Y(ka) - 4, f"PMT {ka} kA", 9.5, "#ec4899", "end")
    b += t(28, 110, "I_sc", 10.5, AX) + t(347, 230, "MVA hubung singkat (sumbu mendatar) → arus hubung singkat I_sc = S_sc/(√3·V) untuk empat tingkat tegangan; garis merah muda: kelas kapasitas pemutus", 11.5, AX)
    return svg(660, 240, b, "Gambar 6 — MVA hubung singkat, arus hubung singkat, dan kapasitas pemutus")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-generator">Reaktansi Generator</a>
  <a href="#m-trafo">Impedansi Trafo</a>
  <a href="#m-perunit">Per Unit</a>
  <a href="#m-ydelta">Y–Δ</a>
  <a href="#m-reduksi">Reduksi Jaringan</a>
  <a href="#m-mvasc">MVA Hubung Singkat</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="110" r="12" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.5"/>
      <text x="16" y="114" fill="rgba(255,179,0,.7)" font-family="JetBrains Mono" font-size="9">G</text>
      <line x1="32" y1="110" x2="42" y2="110" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <path d="M 42 110 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0" fill="none" stroke="rgba(0,229,255,.6)" stroke-width="1.5"/>
      <line x1="72" y1="110" x2="86" y2="110" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="86" y1="86" x2="86" y2="134" stroke="rgba(0,229,255,.7)" stroke-width="3"/>
      <text x="40" y="96" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">jX″</text>
      <text x="66" y="150" fill="rgba(236,72,153,.6)" font-family="JetBrains Mono" font-size="8">S_sc</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="60" x2="50" y2="105" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="50" y1="105" x2="20" y2="140" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="50" y1="105" x2="80" y2="140" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <circle cx="50" cy="60" r="3" fill="rgba(239,68,68,.7)"/><circle cx="20" cy="140" r="3" fill="rgba(255,179,0,.7)"/><circle cx="80" cy="140" r="3" fill="rgba(0,229,255,.7)"/>
      <path d="M 50 160 L 20 200 L 80 200 Z" fill="none" stroke="rgba(0,224,158,.55)" stroke-width="1.4"/>
      <text x="36" y="46" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">Y ⇄ Δ</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Z_base = kV²/MVA</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">X_pu = X_Ω / Z_base</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">X_baru = X(S_b/S_l)(V_l/V_b)²</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">S_sc = S_base / X_th</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Z_Δ = 3 Z_Y</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">I″ = 1/X″</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">I_base = S/(√3·V)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">I_sc = S_sc/(√3·V)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Reaktansi</span><br>
      <em>dan Impedansi</em><br>
      <span class="hl-amber">Sistem Tenaga</span>
    </h1>
    <p class="hero-sub">Setiap generator, transformator, dan saluran menahan arus lewat reaktansinya, dan gabungan reaktansi itulah yang menentukan seberapa besar arus hubung singkat, seberapa kaku tegangan sebuah rel, dan pemutus mana yang boleh dipasang. Modul ini membangun bahasa per unit yang menghapus rasio transformator, alat transformasi bintang–segitiga dan reduksi jaringan, lalu bermuara pada satu angka yang dipakai setiap studi proteksi: MVA hubung singkat.</p>
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

    # 01 — reaktansi generator
    isi = figure(1, "Selubung arus hubung singkat generator: subtransien, transien, tunak", f"Saat terminal generator dihubung singkat, arus rms mulai dari I″ = 1/X″ = {ind(1 / XG2, 2)} pu, meluruh dalam beberapa siklus ke I′ = 1/X′, lalu dalam sekitar satu detik ke nilai tunak 1/X_s. Tiga reaktansi, tiga rentang waktu.", gambar1())
    isi += formula(1, "Tiga Reaktansi Generator Sinkron", r"I'' = \dfrac{E''}{X_d''}, \qquad I' = \dfrac{E'}{X_d'}, \qquad I = \dfrac{E}{X_s}, \qquad X_d'' < X_d' < X_s",
                   rf"Generator contoh {ind(SG, 0)} MVA, {ind(VG, 1)} kV: \(X'' = {ind(XG2, 2)}\), \(X' = {ind(XG1, 2)}\), \(X_s = {ind(XGS, 1)}\) pu. Dengan tegangan pra-gangguan 1 pu, arus hubung singkat awal \({ind(1 / XG2, 2)}\) pu = \({ind(1 / XG2, 2)}\times{ind(IB_G, 0)} = {ind(ISC_G / 1000, 1)}\) kA, sedangkan tunaknya hanya \({ind(1 / XGS, 2)}\) pu, di bawah arus nominal!",
                   "Reaktansi subtransien X″ mencerminkan belitan peredam dan permukaan rotor yang menolak perubahan fluks mendadak (konstanta waktu T″ ≈ 0,02–0,05 s); X′ mencerminkan belitan medan (T′ ≈ 0,5–2 s); X_s adalah reaktansi keadaan tunak. Studi hubung singkat untuk memilih PMT memakai X″ (arus terbesar), studi kestabilan memakai X′, dan studi aliran daya memakai X_s. Praktis: X″ 0,10–0,25 pu, X′ 0,15–0,40 pu, X_s 1,0–2,0 pu pada rating generator.",
                   [("X_d'', X_d', X_s", "Reaktansi subtransien, transien, sinkron sumbu d (pu)"), ("E'', E', E", "Ggl di balik tiap reaktansi (≈ 1 pu tanpa beban)"), ("I'', I', I", "Arus hubung singkat rms pada tiap tahap (pu)")])
    isi += formula(2, "Basis Rating dan Reaktansi dalam Ohm", r"Z_{base} = \dfrac{(kV_{base})^2}{MVA_{base}}, \qquad I_{base} = \dfrac{S_{base}}{\sqrt{3}\,V_{base}}, \qquad X_\Omega = X_{pu}\,Z_{base}",
                   rf"Generator contoh: \(Z_{{base}} = {ind(VG, 1)}^2/{ind(SG, 0)} = {ind(ZB_G, 4)}\) Ω, \(I_{{base}} = {ind(SG, 0)}\times10^6/(\sqrt{{3}}\times{ind(VG, 1)}\times10^3) = {ind(IB_G, 1)}\) A; \(X'' = {ind(XG2, 2)}\times{ind(ZB_G, 4)} = {ind(XG2_OHM, 4)}\) Ω. Pabrik memberikan reaktansi dalam persen atau pu pada rating alat itu sendiri; konversi ke ohm (atau ke basis lain) adalah pekerjaan kita.",
                   "Reaktansi generator dalam ohm tampak kecil (sepersekian ohm), tetapi dibandingkan Z_base yang juga kecil ia bernilai 0,1–0,25 pu: bilangan pu-lah yang langsung memberi tahu 'berapa kali arus nominal' saat hubung singkat, tanpa perlu ohm sama sekali.",
                   [("Z_{base}", "Impedansi basis (Ω)"), ("I_{base}", "Arus basis (A)"), ("X_{pu}", "Reaktansi per unit pada basis yang dipakai")])
    isi += cards([
        ("⚡", "Arus Awal vs Tunak", "Arus hubung singkat generator turun seiring waktu: PMT yang membuka 3–5 siklus setelah gangguan memutus arus dekat nilai subtransien; relai harus disetel dengan nilai transien/tunak yang lebih kecil.", r"\(I'' \gg I\)"),
        ("🧲", "Belitan Peredam", "Batang peredam pada rotor (seperti sangkar motor induksi) menahan perubahan fluks sesaat: itulah asal X″ yang kecil dan arus awal yang besar.", None),
        ("📈", "Komponen DC", "Tergantung saat gangguan terjadi, arus asimetris dengan ofset DC menambah puncak awal sampai 1,6–1,8 kali; PMT dinilai dengan faktor asimetri ini.", None),
        ("🌀", "Motor Ikut Menyumbang", "Motor induksi besar berlaku sebagai generator sesaat saat tegangan runtuh (X″ ≈ 0,17 pu) dan menambah arus hubung singkat rel pabrik beberapa siklus pertama.", None),
        ("🔩", "Rating dan Basis", "X″ = 18 % pada pelat nama berarti 0,18 pu pada MVA dan kV generator itu; angka yang sama pada basis 100 MVA berubah sebanding rasio MVA (Bagian 03).", r"\(X_{pu} \propto S_{base}\)"),
        ("📐", "Sumbu d dan q", "Generator kutub menonjol mempunyai X_d dan X_q berbeda; untuk hubung singkat tiga fasa simetris cukup X_d″ dan X_d′ yang dipakai modul ini.", None),
    ])
    isi += tabel(["Reaktansi generator", "Nilai khas (pu rating)", "Konstanta waktu", "Dipakai untuk"], [
        ["Subtransien X″", "0,10 – 0,25", "T″ ≈ 0,02 – 0,05 s", "arus putus PMT, gaya elektrodinamik rel"],
        ["Transien X′", "0,15 – 0,40", "T′ ≈ 0,5 – 2 s", "kestabilan transien, setelan relai"],
        ["Sinkron X_s", "1,0 – 2,0", "—", "aliran daya, arus hubung singkat tunak"],
        [f"Contoh {ind(SG, 0)} MVA/{ind(VG, 1)} kV", f"{ind(XG2, 2)} / {ind(XG1, 2)} / {ind(XGS, 1)}", "0,03 s / 1 s", f"I″ = {ind(ISC_G / 1000, 1)} kA, I_tunak = {ind(IB_G / XGS / 1000, 2)} kA"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> teori reaktansi transien dan subtransien lahir dari analisis Park (1929) yang mengubah persamaan mesin sinkron ke sumbu d–q; sebelum itu arus hubung singkat generator hanya diketahui dari uji dan sering di bawah taksiran. Sistem per unit dipopulerkan insinyur AIEE pada 1920–1930-an ketika jaringan bertegangan bertingkat (2,4 → 13,8 → 138 kV) membuat perhitungan dalam ohm penuh kesalahan rasio. Papan analisis jaringan (network analyzer) 1930-an dan komputer digital 1950-an mengotomatiskan reduksi jaringan yang di sini dikerjakan tangan.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01–02 memberi angka mentah tiap alat: reaktansi generator dan trafo. Bagian 03 memberi bahasa yang menyatukannya, per unit. Bagian 04–05 adalah alat aljabar jaringan: transformasi Y–Δ dan reduksi ke Thevenin. Bagian 06 adalah tujuannya: MVA hubung singkat, kapasitas pemutus, dan kekakuan rel. Animasi memvisualkan tiap langkah dan Python mengerjakannya dalam beberapa baris.")
    m += bagian(1, "m-generator", "Reaktansi Generator:<br>Subtransien, Transien, Sinkron",
                "Hampir semua yang dibahas modul ini dimulai dari generator, sumber arus hubung singkat. Generator sinkron tidak diwakili satu reaktansi, melainkan tiga yang berlaku pada rentang waktu berbeda, dan yang terkecil di antaranya menentukan arus terbesar yang harus ditahan peralatan. Persamaan (1) memperkenalkan ketiganya dan Persamaan (2) menghubungkan angka pelat nama (pu) dengan ohm dan ampere; Gambar 1 memperlihatkan peluruhan arusnya.",
                isi, "REAKTANSI GENERATOR")

    # 02 — impedansi trafo
    isi = figure(2, "Impedansi transformator: uji hubung singkat dan refleksi antar-sisi", f"Impedansi {ind(XT_PCT, 0)} % berarti {ind(XT_PCT, 0)} % tegangan nominal sudah mengalirkan arus nominal saat sekunder dihubung singkat; dalam ohm angkanya berbeda {ind((150 / VG) ** 2, 0)} kali di kedua sisi, dalam per unit sama.", gambar2())
    isi += formula(3, "Impedansi Transformator dan Arus Hubung Singkatnya", r"Z_T(\%) = \dfrac{V_{sc}}{V_n}\times100 = Z_{T,pu}\times100, \qquad I_{sc,terminal} = \dfrac{I_n}{Z_{T,pu}}\ (\text{sumber tak berhingga})",
                   rf"Trafo contoh {ind(ST, 0)} MVA, 13,8/150 kV, \(X_T = {ind(XT_PCT, 0)}\%\): tegangan hubung singkat \({ind(XT_PCT, 0)}\%\times150 = {ind(VSC_T, 0)}\) kV; arus hubung singkat terminal sekunder maksimum \(I_n/{ind(XT_PCT / 100, 2)} = {ind(ISC_T_N, 2)}\,I_n\). Dengan sumber yang tidak tak berhingga, reaktansi sumber ditambahkan seri (Bagian 06) dan arusnya lebih kecil.",
                   "Impedansi trafo diukur dengan uji hubung singkat: sekunder dihubung singkat, primer dinaikkan perlahan sampai mengalir arus nominal; perbandingan tegangan itu terhadap nominal adalah Z%. Angka 4–6 % (distribusi) sampai 10–15 % (daya besar) adalah kompromi: kecil berarti regulasi tegangan baik tetapi arus hubung singkat besar; besar sebaliknya.",
                   [("Z_T", "Impedansi trafo (%, pu pada rating trafo)"), ("V_{sc}", "Tegangan hubung singkat (V)"), ("I_n", "Arus nominal trafo (A)")])
    isi += formula(4, "Refleksi Impedansi dan Kesetaraan Per Unit", r"Z_{primer} = a^2 Z_{sekunder}, \quad a = \dfrac{N_1}{N_2}; \qquad Z_{pu,primer} = Z_{pu,sekunder} \ \text{ bila } \dfrac{V_{base,1}}{V_{base,2}} = a",
                   rf"Trafo contoh pada basis 100 MVA: \(X_T = {ind(XT_PCT / 100, 2)}\times100/{ind(ST, 0)} = {ind(XT_PU, 4)}\) pu. Dalam ohm: \({ind(XT_PU, 4)}\times{ind(VG ** 2 / S_B, 4)} = {ind(XT_PU * VG ** 2 / S_B, 4)}\) Ω dilihat dari 13,8 kV, \({ind(XT_PU, 4)}\times{ind(ZB_L, 0)} = {ind(XT_PU * ZB_L, 2)}\) Ω dari 150 kV; perbandingannya \((150/13{{,}}8)^2 = {ind((150 / VG) ** 2, 1)}\).",
                   "Impedansi 'dipantulkan' melintasi trafo dengan kuadrat rasio belitan. Bila tegangan basis di kedua sisi dipilih berbanding rasio yang sama, faktor a² lenyap dan impedansi pu identik di kedua sisi: trafo ideal menghilang dari diagram, tinggal reaktansi bocornya. Inilah alasan utama sistem tenaga dihitung dalam per unit.",
                   [("a", "Rasio belitan N₁/N₂"), ("Z_{primer}, Z_{sekunder}", "Impedansi dilihat dari sisi primer/sekunder (Ω)"), ("V_{base,1}, V_{base,2}", "Tegangan basis di kedua zona")])
    isi += cards([
        ("🔬", "Uji Hubung Singkat", "Memberi Z% dan rugi tembaga; uji rangkaian terbuka memberi rugi besi dan arus magnetisasi. Keduanya tertera di laporan uji pabrik (FAT) setiap trafo.", None),
        ("⚖️", "Z% Kecil vs Besar", "4 % pada trafo distribusi: tegangan kaku, arus hubung singkat 25 I_n. 12 % pada trafo 150 kV: membatasi arus gangguan agar PMT 40 kA cukup.", r"\(I_{sc} = I_n/Z_{pu}\)"),
        ("🔁", "Paralel Trafo", "Dua trafo paralel berbagi beban berbanding terbalik Z% (Modul 2); Z% yang berbeda jauh membuat satu trafo kelebihan beban sebelum yang lain penuh.", r"\(S_k \propto 1/Z_k\)"),
        ("🎚️", "Tap Changer", "Mengubah rasio a mengubah tegangan basis efektif; dalam studi per unit, tap di luar nominal diwakili trafo ideal a:1 sisa (off-nominal tap) yang tidak lenyap.", None),
        ("🧊", "Reaktor Pembatas", "Bila arus hubung singkat rel melampaui PMT, reaktor seri (X ≈ 5–10 %) ditambahkan; perhitungannya persis menambah reaktansi seri pada Bagian 05.", None),
        ("🏭", "Trafo Pabrik", "Trafo 20 kV/400 V 1–2,5 MVA, Z 5–6 %: arus hubung singkat rel 400 V mencapai 30–60 kA; itulah asal rating PMT utama pabrik.", None),
    ])
    isi += tabel(["Trafo", "Z% khas", "I_sc terminal (sumber tak hingga)", "Regulasi tegangan", "Catatan"], [
        ["Distribusi 20 kV/400 V, 400 kVA – 2,5 MVA", "4 – 6 %", "17 – 25 × I_n", "kecil (±2–3 %)", "PMT 400 V 36–65 kA"],
        ["Gardu induk 150/20 kV, 30 – 60 MVA", "10 – 12,5 %", "8 – 10 × I_n", "sedang", "membatasi I_sc rel 20 kV"],
        ["IBT 500/150 kV, 500 MVA", "12 – 15 %", "7 – 8 × I_n", "sedang", "impedansi kadang dibuat tinggi sengaja"],
        [f"Contoh {ind(ST, 0)} MVA, 13,8/150 kV", f"{ind(XT_PCT, 0)} %", f"{ind(ISC_T_N, 2)} × I_n", "—", f"{ind(XT_PU, 4)} pu pada 100 MVA"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> makin besar trafo dan tegangannya, makin besar Z%-nya, bukan karena kualitas turun melainkan karena perancang sengaja membatasi arus hubung singkat sisi sekunder agar pemutus dan rel tetap terjangkau. Angka Z% adalah keputusan sistem, bukan sekadar sifat bahan. Soal C3, C5, dan C14 memakai Persamaan (3)–(4).")
    m += bagian(2, "m-trafo", "Impedansi Transformator<br>dan Refleksi Antar-Sisi",
                "Transformator meneruskan daya, tetapi reaktansi bocornya menahan arus hubung singkat dan menjatuhkan tegangan; angkanya tertera di pelat nama sebagai persen impedansi. Persamaan (3) menjelaskan makna persen itu lewat uji hubung singkat, dan Persamaan (4) memperlihatkan bagaimana impedansi tampak berbeda dari kedua sisi trafo, persoalan yang akan dilenyapkan sistem per unit. Gambar 2 memperlihatkan keduanya.",
                isi, "IMPEDANSI TRAFO")

    # 03 — per unit
    isi = figure(3, "Empat langkah perhitungan per unit pada sistem contoh", "Pilih satu basis daya untuk seluruh sistem dan tegangan basis per zona sesuai rasio trafo; turunkan Z_base dan I_base; nyatakan setiap alat pada basis itu; hitung dalam pu; kembalikan ke ampere dan MVA di akhir.", gambar3())
    isi += formula(5, "Definisi Per Unit dan Basis Turunan", r"\text{besaran}_{pu} = \dfrac{\text{besaran aktual}}{\text{basis}}, \qquad Z_{base} = \dfrac{(kV_{base})^2}{MVA_{base}}, \qquad I_{base} = \dfrac{MVA_{base}\times10^3}{\sqrt{3}\,kV_{base}}\ \text{A}",
                   rf"Basis sistem {ind(S_B, 0)} MVA. Zona 13,8 kV: \(Z_{{base}} = {ind(ZB_G, 4)}\) Ω, \(I_{{base}} = {ind(IB_G, 0)}\) A. Zona 150 kV: \(Z_{{base}} = {ind(ZB_L, 0)}\) Ω, \(I_{{base}} = {ind(S_B * 1e6 / (SQ3 * 150e3), 1)}\) A. Saluran {ind(XL_OHM, 0)} Ω → \({ind(XL_OHM, 0)}/{ind(ZB_L, 0)} = {ind(XL_PU, 4)}\) pu. Hanya dua basis yang dipilih bebas (S dan V); Z dan I mengikuti.",
                   "Per unit membuat semua angka sebanding: tegangan rel 0,95–1,05 pu berapa pun kV-nya, reaktansi generator 0,1–0,25 pu berapa pun MVA-nya, arus 1 pu = beban penuh. Kesalahan ratusan kali (lupa a²) tidak mungkin terjadi, dan √3 lenyap dari sebagian besar rumus tiga fasa karena sudah termuat dalam basis.",
                   [("MVA_{base}", "Basis daya tiga fasa, satu untuk seluruh sistem"), ("kV_{base}", "Basis tegangan antar-saluran per zona"), ("Z_{base}, I_{base}", "Basis turunan (Ω, A)")])
    isi += formula(6, "Konversi Basis", r"Z_{pu,baru} = Z_{pu,lama}\left(\dfrac{S_{base,baru}}{S_{base,lama}}\right)\left(\dfrac{V_{base,lama}}{V_{base,baru}}\right)^2",
                   rf"Trafo {ind(ST, 0)} MVA, {ind(XT_PCT, 0)} % ke basis 100 MVA (kV sama): \({ind(XT_PCT / 100, 2)}\times100/{ind(ST, 0)} = {ind(XT_PU, 4)}\) pu. Generator {ind(SG, 0)} MVA, {ind(VG, 1)} kV, X″ = {ind(XG2, 2)} pu bila zona basisnya ternyata 13,2 kV: \({ind(XG2, 2)}\times(100/100)\times(13{{,}}8/13{{,}}2)^2 = {ind(XG2_NEWV, 4)}\) pu. Faktor MVA sebanding lurus, faktor kV kuadrat terbalik: rating alat yang lebih kecil daripada basis membuat pu-nya membesar.",
                   "Setiap pabrik memberi impedansi pada rating alatnya sendiri, sedangkan studi memakai satu basis sistem (lazim 100 MVA); konversi basis adalah langkah yang paling sering dilupakan. Turunkan sendiri dari Z_Ω = Z_pu·kV²/MVA yang harus sama pada kedua basis, jangan hafalkan arah pecahannya.",
                   [("S_{base,lama}", "Biasanya rating alat (MVA)"), ("V_{base,lama}", "Tegangan rating alat (kV)"), ("S_{base,baru}, V_{base,baru}", "Basis sistem yang dipilih")])
    isi += cards([
        ("🎯", "Pilih Basis Sistem", "100 MVA hampir baku untuk transmisi; 10 MVA atau rating trafo utama untuk studi pabrik. Tegangan basis: nominal tiap zona, dihubungkan rasio trafo.", None),
        ("🧭", "Zona Tegangan", "Setiap trafo memisahkan dua zona; tegangan basis zona berikutnya = basis zona ini × rasio. Salah zona = salah a², kesalahan ratusan kali.", None),
        ("➕", "Yang Tidak Berubah", "Rumus KVL/KCL, Thevenin, seri–paralel, Y–Δ berlaku persis dalam pu; hanya satuannya hilang. Daya pu = V_pu·I_pu tanpa √3.", r"\(S_{pu} = V_{pu} I_{pu}\)"),
        ("🔙", "Kembali ke Aktual", "Di akhir: I = I_pu·I_base, S = S_pu·S_base, V = V_pu·V_base zona itu. Selalu tuliskan zona saat mengembalikan ke ampere.", None),
        ("📉", "Beban dalam pu", "Beban P + jQ MVA dibagi S_base; beban impedansi Z_Ω dibagi Z_base zona; motor: X″ pada rating sendiri dikonversi seperti generator.", None),
        ("💻", "Perangkat Lunak", "ETAP, DIgSILENT, dan PSS/E menyimpan data alat pada ratingnya dan mengonversi otomatis; memahami konversi ini yang membuat hasilnya bisa diperiksa dengan tangan.", None),
    ])
    isi += tabel(["Alat", "Data pelat nama", "Basis 100 MVA, zona", "X (pu)", "X (Ω) di zonanya"], [
        [f"Generator", f"{ind(SG, 0)} MVA, {ind(VG, 1)} kV, X″ {ind(XG2, 2)} pu", "13,8 kV", ind(X_A, 4), ind(X_A * ZB_G, 4)],
        [f"Trafo", f"{ind(ST, 0)} MVA, 13,8/150 kV, {ind(XT_PCT, 0)} %", "13,8 ↔ 150 kV", ind(XT_PU, 4), f"{ind(XT_PU * ZB_G, 4)} / {ind(XT_PU * ZB_L, 2)}"],
        [f"Saluran", f"{ind(XL_OHM, 0)} Ω pada 150 kV", "150 kV", ind(XL_PU, 4), ind(XL_OHM, 1)],
        ["Generator kedua", f"60 MVA, 13,8 kV, X″ 0,15 pu", "13,8 kV", ind(0.15 * 100 / 60, 4), ind(0.15 * 100 / 60 * ZB_G, 4)],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> generator kedua yang lebih kecil (60 MVA, X″ 0,15) tampak 'lebih lemah' dari yang pertama dalam pu basis 100 (0,25 vs 0,18) walau X″ ratingnya lebih kecil: pu pada basis sistem mengukur kontribusi terhadap sistem, bukan mutu alat. Soal C1–C6 dan C11 memakai Persamaan (5)–(6).")
    m += bagian(3, "m-perunit", "Sistem Per Unit:<br>Basis dan Konversinya",
                "Sebuah sistem tenaga memuat zona 13,8 kV, 150 kV, dan 20 kV yang dipisahkan transformator; menghitungnya dalam ohm berarti memantulkan setiap impedansi melintasi setiap trafo. Sistem per unit menyatakan semua besaran sebagai pecahan dari nilai basis yang dipilih sehingga rasio trafo lenyap dan angka semua alat menjadi sebanding. Persamaan (5) mendefinisikan basis dan Persamaan (6) mengonversi data pelat nama ke basis sistem; Gambar 3 merangkum prosedurnya.",
                isi, "SISTEM PER UNIT")

    # 04 — Y-Δ
    isi = figure(4, "Transformasi bintang–segitiga", f"Tiga impedansi bintang 3, 6, 9 Ω setara dengan segitiga {ind(ZAB, 0)}, {ind(ZBC, 0)}, {ind(ZCA, 1)} Ω: resistansi yang terlihat dari setiap pasangan terminal sama pada keduanya, sehingga salah satu dapat menggantikan yang lain dalam jaringan mana pun.", gambar4())
    isi += formula(7, "Transformasi Y → Δ dan Δ → Y", r"Z_{ab} = \dfrac{Z_aZ_b + Z_bZ_c + Z_cZ_a}{Z_c}\ (\text{dst. siklik}), \qquad Z_a = \dfrac{Z_{ab}Z_{ca}}{Z_{ab} + Z_{bc} + Z_{ca}}\ (\text{dst.}), \qquad \text{seimbang: } Z_\Delta = 3Z_Y",
                   rf"Gambar 4: \(\Sigma Z_iZ_j = 3\cdot6 + 6\cdot9 + 9\cdot3 = {ind(NUM, 0)}\); \(Z_{{ab}} = {ind(NUM, 0)}/9 = {ind(ZAB, 0)}\), \(Z_{{bc}} = {ind(NUM, 0)}/3 = {ind(ZBC, 0)}\), \(Z_{{ca}} = {ind(NUM, 0)}/6 = {ind(ZCA, 1)}\) Ω. Pemeriksaan: antara a dan b dengan c terbuka, Y memberi \(3 + 6 = 9\) Ω dan Δ memberi \({ind(ZAB, 0)} \parallel ({ind(ZBC, 0)} + {ind(ZCA, 1)}) = {ind(ZAB * (ZBC + ZCA) / (ZAB + ZBC + ZCA), 2)}\) Ω ✓.",
                   "Jaringan seperti jembatan atau rel yang dihubungkan tiga saluran (segitiga) tidak dapat direduksi seri–paralel; mengubah segitiga menjadi bintang (atau sebaliknya) membuka jalan. Rumusnya berlaku untuk impedansi kompleks apa pun; pada studi hubung singkat yang hanya memuat reaktansi, semuanya bilangan nyata dikali j. Untuk beban tiga fasa seimbang, Z_Δ = 3Z_Y adalah kasus khususnya (Modul 5).",
                   [("Z_a, Z_b, Z_c", "Impedansi cabang bintang dari simpul netral ke terminal"), ("Z_{ab}, Z_{bc}, Z_{ca}", "Impedansi cabang segitiga antar-terminal")])
    isi += cards([
        ("🔀", "Kapan Dipakai", "Tiga rel saling terhubung saluran (loop), jembatan pada jaringan distribusi ring, dan beban Δ pada studi hubung singkat: ubah ke Y agar seri dengan impedansi rel.", None),
        ("🧮", "Kebalikannya", "Kadang Y → Δ lebih berguna: tiga cabang yang bertemu di simpul yang tidak diperlukan (mis. netral trafo) dihilangkan dengan menggantinya segitiga antar-terminal.", None),
        ("⚖️", "Seimbang", "Bila ketiganya sama, Z_Δ = 3Z_Y: beban Δ 30 Ω per fasa setara Y 10 Ω per fasa; daya dan arus saluran identik.", r"\(Z_Y = Z_\Delta/3\)"),
        ("🔗", "Jembatan Wheatstone", "Empat resistor + galvanometer: tidak seri, tidak paralel; satu transformasi Δ → Y pada tiga resistor pertama meruntuhkannya menjadi seri–paralel.", None),
        ("🛰️", "Reduksi Kron", "Generalisasi Y–Δ untuk menghilangkan simpul mana pun dari matriks admitansi (eliminasi Gauss); inilah yang dilakukan program hubung singkat pada ratusan rel.", None),
        ("✅", "Pemeriksaan", "Resistansi antara dua terminal dengan terminal ketiga terbuka harus sama sebelum dan sesudah transformasi; pemeriksaan satu baris yang menangkap hampir semua salah hitung.", None),
    ])
    isi += tabel(["Contoh", "Y (Z_a, Z_b, Z_c)", "Δ (Z_ab, Z_bc, Z_ca)", "R a–b, c terbuka"], [
        ["Gambar 4", "3, 6, 9 Ω", f"{ind(ZAB, 0)}, {ind(ZBC, 0)}, {ind(ZCA, 1)} Ω", f"{ind(ZA + ZBB, 0)} Ω"],
        ["Seimbang", "10, 10, 10 Ω", "30, 30, 30 Ω", "20 Ω"],
        ["Reaktansi saluran (pu)", "j0,05, j0,08, j0,10", f"j{ind((0.05 * 0.08 + 0.08 * 0.1 + 0.1 * 0.05) / 0.1, 3)}, j{ind((0.05 * 0.08 + 0.08 * 0.1 + 0.1 * 0.05) / 0.05, 3)}, j{ind((0.05 * 0.08 + 0.08 * 0.1 + 0.1 * 0.05) / 0.08, 4)}", "j0,13"],
        ["Δ → Y", "Δ 12, 18, 15 Ω", f"Y {ind(12 * 15 / 45, 2)}, {ind(12 * 18 / 45, 2)}, {ind(18 * 15 / 45, 2)} Ω", f"{ind(12 * 15 / 45 + 12 * 18 / 45, 2)} Ω"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> kolom terakhir adalah pemeriksaan wajib: resistansi antar dua terminal tidak boleh berubah oleh transformasi. Soal C7, C8, dan C13 memakai Persamaan (7); soal Hard C13 menambahkan pemeriksaan itu sebagai langkah terakhir.")
    m += bagian(4, "m-ydelta", "Impedansi Ekuivalen:<br>Transformasi Bintang–Segitiga",
                "Seri dan paralel (Modul 3) menyelesaikan sebagian besar jaringan, tetapi tiga rel yang saling terhubung membentuk segitiga yang tidak seri maupun paralel. Transformasi bintang–segitiga pada Persamaan (7) menggantikan tiga impedansi dengan tiga impedansi lain yang setara dilihat dari terminalnya, sehingga reduksi dapat dilanjutkan. Gambar 4 memperlihatkan kedua bentuknya.",
                isi, "TRANSFORMASI Y–Δ")

    # 05 — reduksi jaringan
    isi = figure(5, "Diagram reaktansi per unit dan reduksi ke ekuivalen Thevenin tiap rel", f"Dua generator paralel, trafo, dan saluran digambar sebagai reaktansi pu pada basis 100 MVA; reaktansi Thevenin di tiap rel adalah gabungan semua jalur dari sumber ke rel itu, dan MVA hubung singkatnya 100/X_th.", gambar5())
    isi += formula(8, "Diagram Impedansi dan Reaktansi Thevenin Rel", r"X_{th} = \text{reaktansi dilihat dari rel gangguan dengan semua ggl dihubung singkat}; \qquad X_{seri} = \sum X_k, \quad \dfrac{1}{X_{par}} = \sum \dfrac{1}{X_k}",
                   rf"Gambar 5: generator {ind(XG2, 2)} ‖ {ind(XG2B, 2)} = \({ind(X_PAR, 4)}\) pu di rel A; + trafo {ind(XT_PU, 4)} → \({ind(X_PAR_T, 4)}\) pu di rel B; + saluran {ind(XL_PU, 4)} → \({ind(X_PAR_T + XL_PU, 4)}\) pu di rel C. Sistem satu generator (Bagian 03): rel C \(X_{{th}} = {ind(XG2, 2)} + {ind(XT_PU, 4)} + {ind(XL_PU, 4)} = {ind(X_C, 4)}\) pu.",
                   "Diagram impedansi adalah diagram satu garis yang setiap alatnya diganti reaktansi pu-nya (resistansi diabaikan pada studi hubung singkat tegangan tinggi, X/R ≫ 1). Semua generator diwakili ggl 1 pu di balik X″, dan karena semua ggl sama besar dan sefasa sebelum gangguan, mereka dapat digabung menjadi satu sumber: itulah alasan Thevenin di rel gangguan begitu sederhana.",
                   [("X_{th}", "Reaktansi Thevenin di rel gangguan (pu)"), ("X_k", "Reaktansi cabang (pu, satu basis)")])
    isi += cards([
        ("🗺️", "Diagram Satu Garis", "Tiga fasa seimbang digambar satu garis; generator lingkaran, trafo dua lingkaran, rel garis tebal, PMT kotak. Diagram impedansi adalah terjemahannya ke reaktansi pu.", None),
        ("🔋", "Ggl Digabung", "Sebelum gangguan semua generator ≈ 1∠0° pu (beban diabaikan), jadi sumber-sumber paralel dapat disatukan; reaktansinya diparalel seperti resistor.", r"\(E \approx 1\angle0^\circ\)"),
        ("🔀", "Loop Jaringan", "Jaringan bermata jala (loop) memerlukan Y–Δ (Bagian 04) atau matriks Z_bus; untuk jaringan radial cukup seri–paralel dari sumber ke rel.", None),
        ("⚖️", "Kontribusi Cabang", "Setelah X_th dan I_sc total didapat, arus tiap cabang dibagi berbanding terbalik reaktansinya (pembagi arus): menentukan arus yang lewat tiap PMT, bukan hanya di rel.", r"\(I_k = I_{sc}\dfrac{X_{par}}{X_k}\)"),
        ("📉", "Rel Makin Jauh", "Setiap trafo dan saluran menambah X seri: MVA hubung singkat turun dari pembangkit ke pelanggan (Gambar 5). Rel 400 V pabrik jauh lebih 'lemah' daripada rel 150 kV.", None),
        ("🧯", "Reaktor & Pemisahan Rel", "Dua cara menurunkan I_sc rel yang melampaui PMT: menambah reaktor seri, atau membuka kopel rel sehingga sumber tidak diparalel.", None),
    ])
    isi += tabel(["Rel (Gambar 5, basis 100 MVA)", "X_th (pu)", "S_sc (MVA)", "V (kV)", "I_sc (kA)"], [
        ["A (13,8 kV), dua generator", ind(X_PAR, 4), ind(S_B / X_PAR, 0), "13,8", ind(S_B / X_PAR / (SQ3 * 13.8), 2)],
        ["B (150 kV), + trafo", ind(X_PAR_T, 4), ind(SSC_PAR, 0), "150", ind(SSC_PAR / (SQ3 * 150), 3)],
        ["C (150 kV), + saluran", ind(X_PAR_T + XL_PU, 4), ind(S_B / (X_PAR_T + XL_PU), 0), "150", ind(S_B / (X_PAR_T + XL_PU) / (SQ3 * 150), 3)],
        ["A dengan G2 dilepas", ind(X_A, 4), ind(SSC_A, 0), "13,8", ind(ISC_A, 2)],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> memaralel generator kedua menaikkan MVA hubung singkat rel A hampir dua kali lipat, dan itulah dua sisi mata uang yang sama: rel menjadi kaku (baik untuk tegangan) tetapi PMT harus lebih besar. Soal C6, C9, dan C12 memakai Persamaan (8).")
    m += bagian(5, "m-reduksi", "Diagram Impedansi dan<br>Reduksi Jaringan",
                "Setelah setiap alat dinyatakan pada basis yang sama, seluruh sistem menjadi satu jaringan reaktansi yang dapat direduksi dengan alat Modul 3–4: seri, paralel, Y–Δ, dan Thevenin. Persamaan (8) merumuskan sasarannya, reaktansi Thevenin di rel yang ditinjau, dan Gambar 5 memperlihatkan bagaimana angka itu bertambah dari pembangkit ke ujung saluran.",
                isi, "REDUKSI JARINGAN")

    # 06 — MVA hubung singkat
    isi = figure(6, "MVA hubung singkat, arus hubung singkat, dan kapasitas pemutus", "Satu MVA hubung singkat menghasilkan arus yang sangat berbeda menurut tegangan: 1000 MVA berarti 29 kA pada 20 kV tetapi hanya 3,8 kA pada 150 kV. Kapasitas pemutus (25/40/63 kA) dibandingkan dengan arus, bukan MVA.", gambar6())
    isi += formula(9, "MVA dan Arus Hubung Singkat", r"S_{sc} = \dfrac{S_{base}}{X_{th,pu}}\ (V_{pra} = 1\text{ pu}), \qquad I_{sc} = \dfrac{S_{sc}}{\sqrt{3}\,V_L} = \dfrac{I_{base}}{X_{th,pu}}, \qquad X_{sumber,pu} = \dfrac{S_{base}}{S_{sc,sumber}}",
                   rf"Rel C contoh: \(S_{{sc}} = 100/{ind(X_C, 4)} = {ind(SSC_C, 0)}\) MVA, \(I_{{sc}} = {ind(SSC_C, 0)}/(\sqrt{{3}}\times150) = {ind(SSC_C / (SQ3 * 150), 3)}\) kA. Sebaliknya, PLN memberi 'MVA hubung singkat di titik sambung' (mis. {ind(SSRC, 0)} MVA di 150 kV): itu langsung menjadi \(X_{{sumber}} = 100/{ind(SSRC, 0)} = {ind(X_SRC, 3)}\) pu, sumber Thevenin untuk studi pabrik di hilirnya.",
                   "MVA hubung singkat adalah ukuran 'kekuatan' rel: makin besar, makin kecil X_th, makin kaku tegangan terhadap beban dan start motor, tetapi makin besar arus yang harus diputus PMT. Angka ini adalah antarmuka antara utilitas dan pelanggan: dengan satu angka, seluruh jaringan di hulu diwakili.",
                   [("S_{sc}", "MVA hubung singkat tiga fasa"), ("X_{th,pu}", "Reaktansi Thevenin rel (pu pada S_base)"), ("I_{sc}", "Arus hubung singkat rms simetris (kA bila MVA dan kV)"), ("S_{sc,sumber}", "MVA hubung singkat yang diberikan utilitas")])
    isi += formula(10, "MVA Hubung Singkat di Hilir Trafo dan Jatuh Tegangan Start Motor", r"X_{th,2} = \dfrac{S_{base}}{S_{sc,1}} + Z_{T,pu}\dfrac{S_{base}}{S_T}, \qquad S_{sc,2} = \dfrac{S_{base}}{X_{th,2}}, \qquad \Delta V_{start} \approx \dfrac{S_{start}}{S_{sc,2}}",
                   rf"Sumber {ind(SSRC, 0)} MVA di 150 kV, trafo {ind(ST2, 0)} MVA, {ind(XT2 * 100, 0)} %: \(X_{{th}} = {ind(X_SRC, 3)} + {ind(XT2, 2)}\times100/{ind(ST2, 0)} = {ind(X_SRC + X_T2, 4)}\) pu → \(S_{{sc}} = {ind(SSC_20, 0)}\) MVA, \(I_{{sc}} = {ind(ISC_20, 2)}\) kA di rel 20 kV: PMT 20 kV kelas 25 kA cukup. Motor 2 MW pf 0,85 dengan arus start 6× (S_start ≈ {ind(2 / 0.85 * 6, 1)} MVA) menjatuhkan tegangan rel sekitar \({ind(2 / 0.85 * 6, 1)}/{ind(SSC_20, 0)} = {ind(2 / 0.85 * 6 / SSC_20 * 100, 1)}\%\).",
                   "Dua keputusan rekayasa mesin yang paling sering bergantung pada angka ini: (1) kapasitas pemutus pada panel yang dibeli harus melampaui I_sc rel (dengan margin dan faktor asimetri), dan (2) motor besar hanya boleh distart langsung (DOL) bila jatuh tegangan startnya di bawah 10–15 %; bila tidak, perlu soft starter atau VSD. Keduanya dihitung dari X_th rel.",
                   [("S_{sc,1}, S_{sc,2}", "MVA hubung singkat di rel primer dan sekunder trafo"), ("Z_{T,pu}, S_T", "Impedansi (pu rating) dan rating trafo"), ("S_{start}", "Daya semu start motor (≈ 5–7 × rating)")])
    isi += cards([
        ("🧯", "Kapasitas Pemutus", "PMT dinilai dalam kA rms simetris (mis. 25, 31,5, 40, 50, 63 kA) pada tegangannya; I_sc rel × faktor keamanan harus di bawahnya. Menaikkan MVA sumber dapat membuat PMT lama tidak lagi memadai.", None),
        ("🔩", "Ketahanan Dinamis", "Rel dan penopangnya harus menahan gaya elektrodinamik puncak (∝ I_p²) selama beberapa siklus; nilai puncak ≈ 2,5 × I_sc rms untuk X/R tinggi.", r"\(F \propto I_p^2\)"),
        ("🚀", "Start Motor", "ΔV ≈ S_start/S_sc: rel 30 MVA_sc dengan motor 3 MVA start (500 kW) jatuh 10 %; lampu berkedip, kontaktor bisa lepas. Rel kuat atau soft starter.", r"\(\Delta V \approx S_{start}/S_{sc}\)"),
        ("🔌", "Pelanggan Besar", "PLN memberi MVA hubung singkat minimum dan maksimum di titik sambung; minimum untuk start motor dan flicker, maksimum untuk rating PMT.", None),
        ("🔥", "Busur Listrik", "Energi busur (arc flash) pada panel sebanding I_sc × waktu pemutusan; MVA_sc besar menuntut pemutusan cepat dan APD sesuai IEEE 1584.", None),
        ("🔗", "Ke Modul Berikut", "Modul 8–9 menurunkan parameter saluran (R, L, C dari geometri konduktor) yang di sini dianggap diketahui; studi hubung singkat tak simetris memerlukan komponen simetris.", None),
    ])
    isi += tabel(["Rel", "MVA_sc", "Tegangan", "I_sc (kA)", "PMT yang cukup", "Motor DOL maks (ΔV 10 %)"], [
        [f"Titik sambung PLN", ind(SSRC, 0), "150 kV", ind(SSRC / (SQ3 * 150), 2), "31,5 kA", "—"],
        [f"Rel 20 kV via trafo {ind(ST2, 0)} MVA {ind(XT2 * 100, 0)} %", ind(SSC_20, 0), "20 kV", ind(ISC_20, 2), "25 kA", f"S_start ≈ {ind(SSC_20 * 0.1, 0)} MVA (≈ {ind(SSC_20 * 0.1 / 6 * 0.85 * 1000, 0)} kW)"],
        ["Rel 400 V via trafo 2 MVA 6 %", ind(S_B / (S_B / SSC_20 + 0.06 * S_B / 2), 1), "0,4 kV", ind(S_B / (S_B / SSC_20 + 0.06 * S_B / 2) / (SQ3 * 0.4), 1), "50 kA", f"S_start ≈ {ind(S_B / (S_B / SSC_20 + 0.06 * S_B / 2) * 0.1, 1)} MVA (≈ {ind(S_B / (S_B / SSC_20 + 0.06 * S_B / 2) * 0.1 / 6 * 0.85 * 1000, 0)} kW)"],
        ["Rel 400 V via trafo 630 kVA 4 %", ind(S_B / (S_B / SSC_20 + 0.04 * S_B / 0.63), 1), "0,4 kV", ind(S_B / (S_B / SSC_20 + 0.04 * S_B / 0.63) / (SQ3 * 0.4), 1), "25 kA", f"S_start ≈ {ind(S_B / (S_B / SSC_20 + 0.04 * S_B / 0.63) * 0.1, 2)} MVA (≈ {ind(S_B / (S_B / SSC_20 + 0.04 * S_B / 0.63) * 0.1 / 6 * 0.85 * 1000, 0)} kW)"],
    ])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> sebelum membeli panel atau motor besar, dua angka harus diminta dari utilitas atau dihitung dari trafo: I_sc rel (untuk kapasitas pemutus) dan S_sc (untuk start motor). Tabel di atas memperlihatkan bahwa trafo 630 kVA pabrik kecil hanya 'kuat' sekitar 20 MVA di rel 400 V: motor 200 kW yang distart langsung sudah menjatuhkan tegangan 10 %. Soal C9, C10, C14, dan C15 memakai Persamaan (9)–(10).")
    m += bagian(6, "m-mvasc", "MVA Hubung Singkat<br>dan Kapasitas Pemutus",
                "Semua reaktansi yang dikumpulkan sepanjang modul ini bermuara pada satu angka per rel: MVA hubung singkat, kebalikan reaktansi Thevenin-nya. Angka itu menentukan arus yang harus diputus pemutus, gaya yang harus ditahan rel, dan jatuh tegangan saat motor besar distart. Persamaan (9) menghitungnya dari X_th dan Persamaan (10) meneruskannya ke hilir transformator; Gambar 6 menghubungkannya dengan kelas pemutus.",
                isi, "MVA HUBUNG SINGKAT")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Sistem Per Unit: Basis, \(Z_{base}\), \(I_{base}\), dan Konversi Ohm ↔ pu", "cvPerUnit",
                     [("sl_pu_s", "v_pu_s", "S_base (MVA)", 10, 500, 10, 100, "100"), ("sl_pu_kv", "v_pu_kv", "V_base (kV)", 10, 500, 1, 150, "150"), ("sl_pu_x", "v_pu_x", "Reaktansi saluran (Ω)", 1, 200, 0.5, 35, "35.0"), ("sl_pu_xpu", "v_pu_xpu", "X trafo pada ratingnya (pu)", 0.04, 0.2, 0.01, 0.12, "0.12"), ("sl_pu_s0", "v_pu_s0", "Rating trafo (MVA)", 10, 500, 10, 80, "80")],
                     "btnPerUnit", "togglePerUnit", "perUnitInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Kartu kiri menurunkan Z_base dan I_base dari basis yang dipilih; batang atas membandingkan reaktansi saluran (ohm) dengan Z_base (= 1 pu), batang bawah mengonversi X trafo dari basis ratingnya ke basis sistem.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Menggandakan S_base menggandakan semua nilai pu</strong> (Z_base setengahnya) tetapi tidak mengubah ohm. (2) Menaikkan V_base menurunkan pu saluran kuadratis. (3) Trafo kecil pada basis besar tampak 'besar' dalam pu. Soal C1–C6.")
    isi += anim_panel(2, "amber", r"Transformasi Bintang ↔ Segitiga dengan Pemeriksaan Terminal", "cvYDelta",
                      [("sl_yd_a", "v_yd_a", "Z_a (Ω)", 0.5, 20, 0.5, 3, "3.0"), ("sl_yd_b", "v_yd_b", "Z_b (Ω)", 0.5, 20, 0.5, 6, "6.0"), ("sl_yd_c", "v_yd_c", "Z_c (Ω)", 0.5, 20, 0.5, 9, "9.0")],
                      "btnYDelta", "toggleYDelta", "yDeltaInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kiri bintang dengan tiga cabang yang Anda atur, kanan segitiga setaranya; readout memuat pemeriksaan resistansi antar-terminal dengan terminal ketiga terbuka.<br>Amati: (1) <strong style=\"color:var(--amber)\">Memperkecil Z_c memperbesar Z_ab</strong>: cabang segitiga yang berseberangan dengan cabang bintang yang kecil menjadi besar. (2) Samakan ketiganya: Z_Δ = 3Z_Y. (3) Nilai pemeriksaan pada Y dan Δ selalu sama. Soal C7, C8, dan C13.")
    isi += anim_panel(3, "green", r"Reduksi Jaringan: Generator Paralel, Trafo, Saluran → \(X_{th}\) dan MVA Hubung Singkat Tiap Rel", "cvReduksi",
                      [("sl_rd_g1", "v_rd_g1", "X″ G1 (pu, 100 MVA)", 0.05, 0.6, 0.01, 0.18, "0.18"), ("sl_rd_g2", "v_rd_g2", "X″ G2 (pu, 100 MVA)", 0.05, 1.0, 0.01, 0.25, "0.25"), ("sl_rd_t", "v_rd_t", "X trafo (pu, 100 MVA)", 0.02, 0.5, 0.01, 0.15, "0.15"), ("sl_rd_l", "v_rd_l", "X saluran (pu, 100 MVA)", 0, 0.6, 0.005, 0.1556, "0.156")],
                      "btnReduksi", "toggleReduksi", "reduksiInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Diagram reaktansi dua generator paralel, trafo, dan saluran; di bawah tiap rel tertulis X_th dan MVA hubung singkatnya, dan titik merah berpindah menandai rel yang sedang 'diganggu'.<br>Amati: (1) <strong style=\"color:var(--green)\">Naikkan X″ G2 sampai 1,0</strong> (generator dilepas): S_sc rel A turun mendekati nilai satu generator. (2) Setiap unsur seri di kanan menurunkan S_sc rel berikutnya. (3) Readout mengembalikan MVA ke kA pada tegangan tiap rel. Soal C6, C9, C12, dan C14.")
    isi += anim_panel(4, "pink", r"Arus Hubung Singkat Generator: \(X''\), \(X'\), \(X_s\) dan Konstanta Waktunya", "cvHubungSingkat",
                      [("sl_hs_x2", "v_hs_x2", "X″ (pu)", 0.08, 0.4, 0.01, 0.18, "0.18"), ("sl_hs_x1", "v_hs_x1", "X′ (pu)", 0.1, 0.6, 0.01, 0.28, "0.28"), ("sl_hs_xd", "v_hs_xd", "X_s (pu)", 0.6, 2.5, 0.05, 1.4, "1.40"), ("sl_hs_t2", "v_hs_t2", "T″ (s)", 0.01, 0.1, 0.005, 0.03, "0.030"), ("sl_hs_t1", "v_hs_t1", "T′ (s)", 0.2, 3, 0.1, 1.0, "1.00")],
                      "btnHubungSingkat", "toggleHubungSingkat", "hubungSingkatInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Arus hubung singkat 50 Hz (biru) digambar bertahap di dalam selubungnya (merah muda putus-putus) yang meluruh dari I″ ke I′ lalu ke nilai tunak.<br>Amati: (1) <strong style=\"color:var(--pink)\">X″ kecil membuat lonjakan awal besar</strong> tetapi hanya beberapa siklus (T″). (2) Nilai tunak 1/X_s sering di bawah 1 pu: relai yang menunggu terlalu lama bisa tidak 'melihat' gangguan. (3) Readout memberi arus pada 3–5 siklus, saat PMT biasanya membuka. Soal C4 dan C15.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur 100 MVA, 150 kV, saluran 35 Ω: X_pu harus {ind(XL_PU, 4)} seperti Bagian 03. Pada Animasi 3 pakai nilai bawaan dan cocokkan X_th rel B = {ind(X_PAR_T, 4)} pu dan S_sc = {ind(SSC_PAR, 0)} MVA dengan Gambar 5; lalu lepaskan G2 (X″ = 1,0) dan lihat rel A melemah.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Reaktansi dan Impedansi",
                "Geser basis, reaktansi tiap alat, dan konstanta waktu generator, lalu amati bagaimana angka pu berubah, bagaimana bintang menjadi segitiga, bagaimana MVA hubung singkat menyusut dari pembangkit ke ujung saluran, dan bagaimana arus hubung singkat generator meluruh. Empat animasi ini memvisualkan Persamaan (1)–(10).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan pada label soal (pu, Ω, A, kA, MVA) dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Basis Per Unit, Konversi Basis, dan Reaktansi dalam Ohm", f'''import numpy as np

def z_base(kV, MVA):  return kV**2/MVA                    # ohm
def i_base(kV, MVA):  return MVA*1e6/(np.sqrt(3)*kV*1e3) # A
def konversi(Xpu, S_lama, V_lama, S_baru, V_baru):       # Persamaan 6
    return Xpu*(S_baru/S_lama)*(V_lama/V_baru)**2

S_base = {ind(S_B, 0)}.0
for zona, kV in [("13,8 kV", {ind(VG, 1).replace(",", ".")}), ("150 kV", 150.0), ("20 kV", 20.0)]:
    print(f"zona {{zona:8s}}: Z_base = {{z_base(kV, S_base):9.4f}} ohm, I_base = {{i_base(kV, S_base):9.2f}} A")

# generator {ind(SG, 0)} MVA {ind(VG, 1)} kV X'' = {ind(XG2, 2)}; trafo {ind(ST, 0)} MVA {ind(XT_PCT, 0)} %; saluran {ind(XL_OHM, 0)} ohm @150 kV
Xg = konversi({ind(XG2, 2).replace(",", ".")}, {ind(SG, 0)}, {ind(VG, 1).replace(",", ".")}, S_base, {ind(VG, 1).replace(",", ".")})
Xt = konversi({ind(XT_PCT / 100, 2).replace(",", ".")}, {ind(ST, 0)}, 150, S_base, 150)
Xl = {ind(XL_OHM, 0)}/z_base(150, S_base)
print(f"X_g = {{Xg:.4f}} pu ({{Xg*z_base({ind(VG, 1).replace(",", ".")}, S_base):.4f}} ohm), X_t = {{Xt:.4f}} pu, X_saluran = {{Xl:.4f}} pu")
print(f"X_t dalam ohm: {{Xt*z_base({ind(VG, 1).replace(",", ".")}, S_base):.4f}} ohm sisi 13,8 kV, {{Xt*z_base(150, S_base):.2f}} ohm sisi 150 kV (rasio {{(150/{ind(VG, 1).replace(",", ".")})**2:.1f}})")
print(f"Generator pada zona basis 13,2 kV: {{konversi({ind(XG2, 2).replace(",", ".")}, {ind(SG, 0)}, {ind(VG, 1).replace(",", ".")}, S_base, 13.2):.4f}} pu")''')
    isi += kode("Cell 2 — Transformasi Bintang–Segitiga dan Pemeriksaannya", f'''import numpy as np

def y_ke_delta(Za, Zb, Zc):                      # Persamaan 7
    s = Za*Zb + Zb*Zc + Zc*Za
    return s/Zc, s/Za, s/Zb                      # Zab, Zbc, Zca
def delta_ke_y(Zab, Zbc, Zca):
    s = Zab + Zbc + Zca
    return Zab*Zca/s, Zab*Zbc/s, Zbc*Zca/s       # Za, Zb, Zc

Za, Zb, Zc = {ind(ZA, 0)}.0, {ind(ZBB, 0)}.0, {ind(ZC, 0)}.0
Zab, Zbc, Zca = y_ke_delta(Za, Zb, Zc)
print(f"Y ({{Za}}, {{Zb}}, {{Zc}}) -> Delta ({{Zab:.4f}}, {{Zbc:.4f}}, {{Zca:.4f}})")
print(f"balik: {{delta_ke_y(Zab, Zbc, Zca)}}")
# pemeriksaan: resistansi a-b dengan c terbuka
R_ab_Y = Za + Zb
R_ab_D = Zab*(Zbc + Zca)/(Zab + Zbc + Zca)
print(f"R_ab (c terbuka): Y = {{R_ab_Y:.4f}}, Delta = {{R_ab_D:.4f}} -> {{'sama' if abs(R_ab_Y - R_ab_D) < 1e-9 else 'BEDA!'}}")
# bekerja juga untuk reaktansi kompleks
print("Delta j(12, 18, 15) -> Y", [f"{{z:.4f}}" for z in delta_ke_y(12j, 18j, 15j)])''')
    isi += kode("Cell 3 — Reduksi Jaringan Per Unit dan MVA Hubung Singkat Tiap Rel", f'''import numpy as np

S_base = {ind(S_B, 0)}.0
def par(*X): return 1/sum(1/x for x in X)
def sc(X_th, kV): return S_base/X_th, S_base/X_th/(np.sqrt(3)*kV)   # MVA, kA (Persamaan 9)

Xg1, Xg2, Xt, Xl = {ind(XG2, 2).replace(",", ".")}, {ind(XG2B, 2).replace(",", ".")}, {ind(XT_PU, 4).replace(",", ".")}, {ind(XL_PU, 4).replace(",", ".")}
X_A = par(Xg1, Xg2);  X_B = X_A + Xt;  X_C = X_B + Xl
for nama, X, kV in [("A", X_A, {ind(VG, 1).replace(",", ".")}), ("B", X_B, 150), ("C", X_C, 150)]:
    S, I = sc(X, kV)
    print(f"rel {{nama}}: X_th = {{X:.4f}} pu, S_sc = {{S:.1f}} MVA, I_sc = {{I:.3f}} kA @ {{kV}} kV")
# kontribusi tiap generator pada gangguan di rel A (pembagi arus)
S_A, I_A = sc(X_A, {ind(VG, 1).replace(",", ".")})
print(f"kontribusi G1 = {{I_A*X_A/Xg1:.3f}} kA, G2 = {{I_A*X_A/Xg2:.3f}} kA (jumlah {{I_A:.3f}} kA)")
# MVA hubung singkat di hilir trafo dari MVA sumber (Persamaan 10)
S_sc1, S_T, Z_T = {ind(SSRC, 0)}.0, {ind(ST2, 0)}.0, {ind(XT2, 2).replace(",", ".")}
X_th2 = S_base/S_sc1 + Z_T*S_base/S_T
print(f"rel 20 kV: X_th = {{X_th2:.4f}} pu, S_sc = {{S_base/X_th2:.1f}} MVA, I_sc = {{S_base/X_th2/(np.sqrt(3)*20):.2f}} kA")''')
    isi += kode("Cell 4 — Arus Hubung Singkat Generator: Selubung dan Nilai pada Saat Pemutusan", f'''import numpy as np
import matplotlib.pyplot as plt

S, kV = {ind(SG, 0)}.0, {ind(VG, 1).replace(",", ".")}
Xd2, Xd1, Xd = {ind(XG2, 2).replace(",", ".")}, {ind(XG1, 2).replace(",", ".")}, {ind(XGS, 1).replace(",", ".")}
Td2, Td1 = 0.03, 1.0
I_base = S*1e6/(np.sqrt(3)*kV*1e3)
I2, I1, I0 = 1/Xd2, 1/Xd1, 1/Xd                        # pu (Persamaan 1)
env = lambda t: (I2 - I1)*np.exp(-t/Td2) + (I1 - I0)*np.exp(-t/Td1) + I0
print(f"I_base = {{I_base:.1f}} A; I'' = {{I2:.3f}} pu = {{I2*I_base/1e3:.2f}} kA; I' = {{I1:.3f}} pu; I_tunak = {{I0:.3f}} pu = {{I0*I_base/1e3:.2f}} kA")
for siklus in [0, 3, 5, 50]:
    t = siklus/50
    print(f"t = {{siklus:2d}} siklus ({{t:.2f}} s): I_rms = {{env(t):.3f}} pu = {{env(t)*I_base/1e3:.2f}} kA")
print(f"MVA hubung singkat terminal (subtransien) = {{S/Xd2:.1f}} MVA")

t = np.linspace(0, 3, 6000)
plt.figure(figsize=(8, 4))
plt.plot(t, env(t)*np.sin(2*np.pi*50*t), lw=0.6, label='i(t) simetris')
plt.plot(t, env(t), 'r--', label='selubung'); plt.plot(t, -env(t), 'r--')
plt.xlabel('t (s)'); plt.ylabel('I (pu)'); plt.legend(); plt.grid(True); plt.title('Arus hubung singkat generator'); plt.show()''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 03–06: X saluran {ind(XL_PU, 4)} pu, Δ ({ind(ZAB, 0)}, {ind(ZBC, 0)}, {ind(ZCA, 1)}) Ω, S_sc rel B {ind(SSC_PAR, 0)} MVA, rel 20 kV {ind(SSC_20, 0)} MVA, dan I″ generator {ind(ISC_G / 1000, 2)} kA. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: basis dan konversi per unit, transformasi Y–Δ dengan pemeriksaannya, reduksi jaringan sampai MVA hubung singkat tiap rel, dan selubung arus hubung singkat generator. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 3 (transformator dan sistem per unit) dan Bab 7 (hubung singkat simetris: reaktansi generator, MVA hubung singkat): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "J. J. Grainger &amp; W. D. Stevenson, Jr.", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 1 (per unit), Bab 2 (transformator), Bab 10 (gangguan simetris) dengan penurunan klasik reaktansi transien.")
    refs += pm_ref(3, "violet", "168,85,247", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 3 (model dan per unit) dan Bab 9 (hubung singkat) dengan contoh numerik yang mudah dialihkan ke Python.")
    refs += pm_ref(4, "green", "0,224,158", "S. J. Chapman", "Electric Machinery Fundamentals", ", Fifth Edition. McGraw-Hill, 2012.", "Bab 4: reaktansi sinkron, transien, dan subtransien generator serta arus hubung singkat transiennya.")
    refs += pm_ref(5, "pink", "236,72,153", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik Jilid 3: Gardu Induk", ", Cetakan 7. Pradnya Paramita, 2004.", "Kapasitas pemutus, arus hubung singkat rel gardu induk, dan reaktor pembatas arus dalam praktik Indonesia/Jepang.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk reaktansi generator dan transformator, sistem per unit, transformasi Y–Δ, reduksi jaringan, dan MVA hubung singkat. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> IEC 60909 (perhitungan arus hubung singkat pada sistem AC tiga fasa) dan IEEE Std 141 (Red Book) memuat prosedur baku beserta faktor tegangan dan asimetri; data MVA hubung singkat titik sambung tersedia dari PLN untuk pelanggan tegangan menengah/tinggi. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Z_base = kV²/MVA</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">X_baru = X(S_b/S_l)(V_l/V_b)²</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S_sc = S_base/X_th</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Z_ab = ΣZ_iZ_j / Z_c</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">I_sc = S_sc/(√3·V)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Reaktansi dan</em><br>Impedansi Sistem</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar basis per unit, konversi basis, reaktansi generator dan trafo, transformasi bintang–segitiga, reduksi jaringan, MVA dan arus hubung singkat. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Tujuan utama menyatakan besaran sistem tenaga dalam <strong>per unit</strong> adalah...",
     ["Menghilangkan kebutuhan akan bilangan kompleks", "Menghapus rasio transformator dari perhitungan dan membuat impedansi alat berbagai ukuran bernilai serupa", "Menjadikan semua tegangan sama dengan 1 kV", "Menghindari pemakaian hukum Kirchhoff"],
     "Tujuan per unit"),
    ("Impedansi basis untuk basis daya tiga fasa dan tegangan antar-saluran adalah...",
     ["\\(Z_{base} = MVA_{base}/kV_{base}^2\\)", "\\(Z_{base} = kV_{base}/MVA_{base}\\)", "\\(Z_{base} = kV_{base}^2/MVA_{base}\\)", "\\(Z_{base} = \\sqrt{3}\\,kV_{base}/MVA_{base}\\)"],
     "Impedansi basis"),
    ("Mengonversi reaktansi per unit dari basis lama ke basis baru dilakukan dengan...",
     ["\\(X_{baru} = X_{lama}\\,(S_{baru}/S_{lama})\\,(V_{lama}/V_{baru})^2\\)", "\\(X_{baru} = X_{lama}\\,(S_{lama}/S_{baru})\\,(V_{baru}/V_{lama})^2\\)", "\\(X_{baru} = X_{lama}\\,(S_{baru}/S_{lama})\\)  selalu, berapa pun tegangannya", "\\(X_{baru} = X_{lama}\\,(V_{baru}/V_{lama})\\)"],
     "Konversi basis"),
    ("Di antara reaktansi generator sinkron, yang <strong>terkecil</strong> dan menentukan arus hubung singkat sesaat awal adalah...",
     ["Reaktansi sinkron \\(X_s\\)", "Reaktansi transien \\(X'\\)", "Reaktansi bocor stator", "Reaktansi subtransien \\(X''\\)"],
     "Reaktansi subtransien"),
    ("<strong>Impedansi transformator 10 %</strong> berarti...",
     ["Rugi trafo sebesar 10 % dayanya", "Sepuluh persen tegangan nominal pada primer sudah mengalirkan arus nominal saat sekunder dihubung singkat; arus hubung singkat terminal ≈ 10 × I_n", "Tegangan sekunder turun 10 % pada beban pf 1", "Trafo hanya boleh dibebani 90 %"],
     "Makna Z% trafo"),
    ("Rel dengan <strong>MVA hubung singkat besar</strong> berarti...",
     ["Reaktansi Thevenin-nya besar dan tegangannya mudah jatuh", "Rel itu tidak boleh dipasangi pemutus", "Reaktansi Thevenin-nya kecil: rel 'kuat', tegangannya kaku terhadap beban dan start motor, tetapi arus gangguannya besar", "Frekuensinya lebih stabil"],
     "Makna MVA hubung singkat"),
    ("Untuk tiga impedansi <strong>sama</strong>, hubungan bintang dan segitiga yang setara adalah...",
     ["\\(Z_\\Delta = 3Z_Y\\)", "\\(Z_\\Delta = Z_Y/3\\)", "\\(Z_\\Delta = \\sqrt{3}\\,Z_Y\\)", "\\(Z_\\Delta = Z_Y\\)"],
     "Y–Δ seimbang"),
    ("Dalam sistem per unit, impedansi transformator bernilai sama dilihat dari kedua sisinya karena...",
     ["Transformator tidak mempunyai reaktansi bocor", "Arus di kedua sisi sama", "Tegangan basis dipilih sama di seluruh sistem", "Tegangan basis di kedua sisi dipilih berbanding rasio belitan sehingga faktor \\(a^2\\) lenyap"],
     "Kesetaraan pu trafo"),
    ("Sumber <strong>rel tak berhingga</strong> (infinite bus) dimodelkan sebagai...",
     ["Sumber dengan reaktansi 1 pu", "Sumber bertegangan dan berfrekuensi tetap dengan impedansi nol (MVA hubung singkat tak berhingga)", "Sumber arus tetap", "Rel tanpa beban"],
     "Rel tak berhingga"),
    ("Kegunaan langsung angka MVA (atau kA) hubung singkat sebuah rel adalah...",
     ["Menentukan tarif listrik pelanggan", "Menentukan efisiensi trafo", "Memilih kapasitas pemutus (breaking capacity) PMT, ketahanan rel, dan menilai jatuh tegangan start motor", "Menentukan faktor daya beban"],
     "Kegunaan MVA hubung singkat"),
]

COMP_EZ_LABELS = ["Impedansi basis Z_base = kV²/MVA", "Arus basis I_base = S/(√3·V)", "Konversi basis MVA (kV tetap)", "Reaktansi generator dalam ohm", "Konversi basis MVA dan kV",
                  "Reaktansi seri total per unit", "Transformasi Y → Δ (Z_ab)", "Transformasi Δ → Y (Z_a)", "MVA hubung singkat S_base/X", "Arus hubung singkat dari MVA_sc"]
COMP_HARD_LABELS = ["Konversi basis lengkap sampai ohm", "Dua generator paralel + trafo → MVA_sc", "Δ → Y dengan terminal terbuka",
                    "MVA_sc rel 20 kV di hilir trafo", "Arus subtransien generator (kA)"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
S_BF = 100.0
SSRC_F, VF = 500.0, 20.0                                      # MVA sc PLN di 20 kV
ST_F, ZT_F = 2.0, 0.06
X_SRC_F = S_BF / SSRC_F
X_T_F = ZT_F * S_BF / ST_F
X_04 = X_SRC_F + X_T_F
SSC_04 = S_BF / X_04
ISC_04 = SSC_04 / (SQ3 * 0.4)
ISC_20F = SSRC_F / (SQ3 * VF)
P_MOT, PF_MOT, K_START = 300.0, 0.8, 6.0
S_START = P_MOT / PF_MOT * K_START / 1000                     # MVA
DV_START = S_START / SSC_04 * 100
ST2_F, ZT2_F = 1.6, 0.04
X_T2_F = ZT2_F * S_BF / ST2_F
X_PARF = X_T_F * X_T2_F / (X_T_F + X_T2_F)
X_04B = X_SRC_F + X_PARF
SSC_04B = S_BF / X_04B
ISC_04B = SSC_04B / (SQ3 * 0.4)
DV_START_B = S_START / SSC_04B * 100

FQ_JUDUL = [
    "Hitung MVA dan arus hubung singkat di rel 20 kV dan 400 V pabrik: cukupkah PMT 400 V kelas 50 kA?",
    "Motor kompresor 300 kW akan distart langsung (DOL): berapa jatuh tegangan rel 400 V, dan perlukah soft starter?",
    "Trafo kedua 1,6 MVA (4 %) diparalel untuk 'menguatkan' rel: apa akibatnya pada arus hubung singkat dan PMT lama?",
]
FQ_RINGKAS = [
    f"PLN memberi MVA hubung singkat {ind(SSRC_F, 0)} MVA di titik sambung 20 kV; trafo pabrik {ind(ST_F, 0)} MVA, 20/0,4 kV, Z {ind(ZT_F * 100, 0)} %. Dengan basis {ind(S_BF, 0)} MVA hitung X_sumber, X_trafo, X_th rel 400 V (Persamaan 9–10), S_sc dan I_sc di kedua rel, lalu bandingkan dengan PMT 400 V kelas 50 kA (dan faktor asimetri).",
    f"Motor {ind(P_MOT, 0)} kW pf {ind(PF_MOT, 1)} dengan arus start {ind(K_START, 0)}× menarik S_start ≈ {ind(S_START, 2)} MVA; ΔV ≈ S_start/S_sc (Persamaan 10). Hitung jatuh tegangan pada rel 400 V, bandingkan batas 10–15 %, dan bahas pilihan soft starter/VSD atau penguatan rel.",
    f"Trafo kedua {ind(ST2_F, 1)} MVA, Z {ind(ZT2_F * 100, 0)} % diparalel: X paralel (Persamaan 8), X_th baru, S_sc dan I_sc rel 400 V, jatuh tegangan start yang membaik, tetapi PMT 50 kA yang mungkin tidak lagi cukup; pembagian beban dua trafo ber-Z% berbeda (Modul 2).",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Sebuah pabrik pengolahan logam berlangganan 20 kV; PLN menyatakan MVA hubung singkat di titik sambung <b>{ind(SSRC_F, 0)} MVA</b>. Trafo pabrik <b>{ind(ST_F, 0)} MVA, 20/0,4 kV, Z = {ind(ZT_F * 100, 0)} %</b> memasok rel 400 V yang PMT utamanya berkapasitas <b>50 kA</b>. Dengan basis {ind(S_BF, 0)} MVA: hitung reaktansi sumber (Persamaan 9), reaktansi trafo pada basis itu (Persamaan 6), reaktansi Thevenin rel 400 V, lalu MVA dan arus hubung singkat di rel 20 kV dan 400 V (Persamaan 9–10). Apakah PMT 50 kA memadai? Bahas pula faktor asimetri dan sumbangan motor-motor pabrik.",
            ["X_sumber = S_base/S_sc", "X_T(basis) = Z%·S_base/S_T", "I_sc = S_sc/(√3·V)"],
            "MVA dan arus hubung singkat di rel 400 V pabrik adalah sekitar...",
            [f"{ind(SSRC_F, 0)} MVA dan {ind(SSRC_F / (SQ3 * 0.4), 0)} kA: trafo tidak membatasi arus", f"{ind(ST_F / ZT_F, 1)} MVA dan {ind(ST_F / ZT_F / (SQ3 * 0.4), 1)} kA: hanya impedansi trafo yang berperan", f"{ind(SSC_04, 1)} MVA dan {ind(ISC_04, 1)} kA: di bawah 50 kA, PMT memadai dengan margin", f"{ind(SSC_04, 1)} MVA dan {ind(SSC_04 / (SQ3 * 20), 2)} kA"],
            f"✅ Tepat! \\(X_{{sumber}} = 100/{ind(SSRC_F, 0)} = {ind(X_SRC_F, 2)}\\) pu; \\(X_T = 0{{,}}0{ind(ZT_F * 100, 0)}\\times100/{ind(ST_F, 0)} = {ind(X_T_F, 2)}\\) pu; \\(X_{{th}} = {ind(X_04, 2)}\\) pu → \\(S_{{sc}} = 100/{ind(X_04, 2)} = {ind(SSC_04, 2)}\\) MVA, \\(I_{{sc}} = {ind(SSC_04, 2)}/(\\sqrt{{3}}\\times0{{,}}4) = {ind(ISC_04, 1)}\\) kA di rel 400 V (di rel 20 kV {ind(ISC_20F, 2)} kA). PMT 50 kA cukup (margin ±10 %), tetapi sumbangan motor dan asimetri harus diperiksa.",
            "❌ Reaktansi sumber dan trafo dijumlahkan seri pada basis yang sama sebelum dibalik menjadi MVA; arus di rel 400 V dihitung dengan tegangan 0,4 kV, bukan 20 kV. Hitung \\(X_{th} = S_{base}/S_{sc,1} + Z_T S_{base}/S_T\\).",
            "Petunjuk: (1) Hitung X_sumber, X_T, X_th. (2) Hitung S_sc dan I_sc di kedua rel. (3) Bandingkan dengan PMT 50 kA; bahas asimetri dan sumbangan motor.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Pabrik akan memasang motor kompresor <b>{ind(P_MOT, 0)} kW, pf {ind(PF_MOT, 1)}</b> yang arus startnya <b>{ind(K_START, 0)} kali</b> arus nominal, dengan start langsung (DOL). Hitung daya semu start S_start ≈ {ind(K_START, 0)} × P/pf, lalu taksir jatuh tegangan rel 400 V saat start dengan ΔV ≈ S_start/S_sc (Persamaan 10) memakai S_sc dari pertanyaan 1. Bandingkan dengan batas praktis 10–15 %: bolehkah DOL? Bahas alternatif (soft starter, star–delta, VSD) dan apa yang terjadi pada lampu dan kontaktor di pabrik saat start.",
            ["S_start ≈ k·P/pf", "ΔV ≈ S_start/S_sc", "batas 10–15 %"],
            f"Jatuh tegangan rel 400 V saat motor {ind(P_MOT, 0)} kW distart langsung adalah sekitar...",
            [f"{ind(DV_START, 1)} % (S_start ≈ {ind(S_START, 2)} MVA terhadap S_sc ≈ {ind(SSC_04, 1)} MVA): masih di bawah batas 10 %", f"{ind(S_START / SSRC_F * 100, 2)} %: rel 400 V sekuat titik sambung 20 kV", f"{ind(P_MOT / 1000 / SSC_04 * 100, 1)} %: hanya daya nominal motor yang berperan", f"{ind(DV_START * 6, 0)} %: motor tidak mungkin distart"],
            f"✅ Tepat! \\(S_{{start}} = {ind(K_START, 0)}\\times{ind(P_MOT, 0)}/{ind(PF_MOT, 1)} = {ind(S_START * 1000, 0)}\\) kVA; \\(\\Delta V \\approx {ind(S_START, 2)}/{ind(SSC_04, 2)} = {ind(DV_START, 1)}\\%\\). DOL masih dapat diterima (batas 10 %), tetapi setiap start membuat lampu berkedip; motor berikutnya yang lebih besar akan memerlukan soft starter/VSD atau rel yang lebih kuat.",
            "❌ Yang menjatuhkan tegangan adalah daya semu start (6× nominal dibagi pf), dan yang menahannya adalah MVA hubung singkat rel 400 V (bukan titik sambung 20 kV). Hitung \\(S_{start}\\) dulu lalu bagi dengan \\(S_{sc}\\) rel 400 V.",
            "Petunjuk: (1) Hitung S_start. (2) Hitung ΔV terhadap S_sc rel 400 V dan bandingkan batas. (3) Bahas alternatif start dan dampak pada beban lain.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Untuk 'menguatkan' rel 400 V, diusulkan memaralel trafo kedua <b>{ind(ST2_F, 1)} MVA, Z = {ind(ZT2_F * 100, 0)} %</b> dengan trafo lama. Hitung reaktansi trafo kedua pada basis {ind(S_BF, 0)} MVA, reaktansi paralel kedua trafo (Persamaan 8), X_th baru, lalu S_sc dan I_sc rel 400 V serta jatuh tegangan start motor yang baru. Bandingkan I_sc dengan PMT 50 kA yang ada. Bahas pula pembagian beban dua trafo yang Z%-nya berbeda (Modul 2: S ∝ 1/Z%) dan apa yang harus dibeli bila rel benar-benar diperkuat.",
            ["X_par = X₁X₂/(X₁ + X₂)", "S_sc = S_base/X_th", "I_sc vs rating PMT"],
            f"Sesudah trafo kedua diparalel, arus hubung singkat rel 400 V menjadi sekitar...",
            [f"{ind(ISC_04, 1)} kA, tidak berubah karena sumber PLN sama", f"{ind(ISC_04B, 1)} kA (S_sc ≈ {ind(SSC_04B, 1)} MVA): melampaui PMT 50 kA, harus diganti kelas 63 kA atau lebih", f"{ind(ISC_04 + ISC_04B, 0)} kA (jumlah keduanya)", f"{ind(ISC_04 / 2, 1)} kA, karena arus terbagi dua trafo"],
            f"✅ Tepat! \\(X_{{T2}} = 0{{,}}0{ind(ZT2_F * 100, 0)}\\times100/{ind(ST2_F, 1)} = {ind(X_T2_F, 2)}\\) pu; \\(X_{{par}} = {ind(X_T_F, 1)}\\parallel{ind(X_T2_F, 1)} = {ind(X_PARF, 4)}\\) pu; \\(X_{{th}} = {ind(X_SRC_F, 1)} + {ind(X_PARF, 4)} = {ind(X_04B, 4)}\\) pu → \\(S_{{sc}} = {ind(SSC_04B, 1)}\\) MVA, \\(I_{{sc}} = {ind(ISC_04B, 1)}\\) kA. Start motor membaik (ΔV ≈ {ind(DV_START_B, 1)} %), tetapi PMT 50 kA tidak lagi cukup; rel dan kabel pun harus diperiksa. Beban terbagi ∝ 1/Z%: trafo 4 % memikul bagian lebih besar dari rasio MVA-nya.",
            "❌ Memaralel trafo memperkecil reaktansi (paralel), sehingga MVA hubung singkat NAIK, bukan tetap atau terbagi. Hitung \\(X_{par}\\) lalu \\(S_{sc} = S_{base}/X_{th}\\) dan bandingkan I_sc dengan rating PMT.",
            "Petunjuk: (1) Hitung X_T2, X_par, X_th baru. (2) Hitung S_sc, I_sc, ΔV start baru; bandingkan dengan 50 kA. (3) Bahas pembagian beban dan peralatan yang harus diganti.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">X_th = S_base/S_sc + Z_T·S_base/S_T</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">I_sc = S_sc/(√3·V)</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">ΔV ≈ S_start/S_sc</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">PMT 50 kA?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Seberapa Kuat<br><em>Rel 400 V Pabrik?</em></h1>
    <p class="hero-sub">Sebuah pabrik pengolahan logam harus memilih pemutus, memutuskan cara start motor kompresor besar, dan menilai usulan memaralel trafo kedua. Terapkan kosakata Pertemuan {PERTEMUAN} — reaktansi per unit, konversi basis, reduksi jaringan, MVA dan arus hubung singkat — untuk menjawab ketiganya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Gardu Pabrik 20 kV / 400 V —<br>PMT, Start Motor, dan Trafo Paralel</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS REAKTANSI DAN MVA HUBUNG SINGKAT</div>
    <p>
      Sebuah <strong style="color:var(--amber)">pabrik pengolahan logam</strong> berlangganan <strong style="color:var(--cyan)">20 kV</strong>; PLN menyatakan MVA hubung singkat di titik sambung <strong>{ind(SSRC_F, 0)} MVA</strong>. Gardu pabrik memakai trafo <strong style="color:var(--cyan)">{ind(ST_F, 0)} MVA, 20/0,4 kV, Z = {ind(ZT_F * 100, 0)} %</strong> yang memasok rel 400 V dengan PMT utama <strong>50 kA</strong>. Beban utama: mesin bubut, tanur perlakuan panas, dan kompresor.
    </p>
    <p style="margin-top:12px">
      Tiga persoalan muncul sekaligus: pemasok panel bertanya apakah <strong>PMT 50 kA</strong> cukup; bagian produksi ingin memasang motor kompresor <strong style="color:var(--pink)">{ind(P_MOT, 0)} kW</strong> dengan start langsung; dan seorang kontraktor mengusulkan memaralel <strong style="color:var(--amber)">trafo kedua {ind(ST2_F, 1)} MVA, Z {ind(ZT2_F * 100, 0)} %</strong> supaya rel 'lebih kuat'.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung ketiganya pada basis {ind(S_BF, 0)} MVA dan memberi rekomendasi <strong style="color:var(--cyan)">sebelum</strong> pabrik membeli apa pun.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Sumber PLN: {ind(SSRC_F, 0)} MVA_sc di 20 kV", "14,165,233", "cyan")}
{kartu(f"Trafo: {ind(ST_F, 0)} MVA, 20/0,4 kV, Z {ind(ZT_F * 100, 0)} %", "14,165,233", "cyan")}
{kartu("PMT 400 V: 50 kA", "14,165,233", "cyan")}
{kartu(f"Motor baru: {ind(P_MOT, 0)} kW, pf {ind(PF_MOT, 1)}, start {ind(K_START, 0)}×", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Rel yang 'kuat' bagi motor adalah rel yang 'berbahaya' bagi pemutus: keduanya diukur oleh angka yang sama, MVA hubung singkat. Forum ini mengajak Anda menghitung <strong>berapa</strong> angka itu, <strong>seberapa jauh</strong> tegangan jatuh saat motor distart, dan <strong>apa akibat</strong> memaralel trafo kedua.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Arus hubung singkat rel 400 V (batang) terhadap kapasitas PMT 50 kA: satu trafo dan dua trafo paralel; teks memuat jatuh tegangan start motor pada tiap keadaan</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Pabrik pengolahan logam berlangganan 20 kV (MVA hubung singkat PLN {ind(SSRC_F, 0)} MVA); trafo {ind(ST_F, 0)} MVA 20/0,4 kV Z {ind(ZT_F * 100, 0)} %, PMT rel 400 V 50 kA. Persoalan: cukupkah PMT; motor kompresor {ind(P_MOT, 0)} kW pf {ind(PF_MOT, 1)} start {ind(K_START, 0)}× akan distart langsung; usulan memaralel trafo kedua {ind(ST2_F, 1)} MVA Z {ind(ZT2_F * 100, 0)} %. Basis {ind(S_BF, 0)} MVA."
FORUM_CHIPS_LMS = [f"PLN = {ind(SSRC_F, 0)} MVA_sc di 20 kV", f"trafo = {ind(ST_F, 0)} MVA, Z {ind(ZT_F * 100, 0)} %", "PMT 400 V = 50 kA", f"motor = {ind(P_MOT, 0)} kW, start {ind(K_START, 0)}×"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Arus hubung singkat rel 400 V vs kapasitas PMT (Pertemuan 7)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const Sb = 100, Xsrc = Sb / 500, Xt1 = 0.06 * Sb / 2, Xt2 = 0.04 * Sb / 1.6, Sstart = 6 * 0.3 / 0.8, PMT = 50;
  const kasus = [
    ['satu trafo 2 MVA 6 %', Xsrc + Xt1, 'rgba(0,224,158,.85)'],
    ['dua trafo paralel (2 MVA 6 % ‖ 1,6 MVA 4 %)', Xsrc + Xt1 * Xt2 / (Xt1 + Xt2), 'rgba(255,179,0,.85)'],
    ['rel tak berhingga di 20 kV, satu trafo', Xt1, 'rgba(0,229,255,.85)'],
  ];
  const padL = 260, padR = 20, padT = 22, barH = 28, gap = 16, plotW = W - padL - padR, maks = 110;
  const X = (i) => padL + i / maks * plotW;
  ctx.strokeStyle = 'rgba(236,72,153,.9)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(PMT), padT - 6); ctx.lineTo(X(PMT), padT + 3 * (barH + gap) + 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(236,72,153,.95)'; ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText('PMT 50 kA', X(PMT), padT - 8);
  kasus.forEach(([label, Xth, warna], i) => {
    const Ssc = Sb / Xth, Isc = Ssc / (Math.sqrt(3) * 0.4), dV = Sstart / Ssc * 100, y = padT + i * (barH + gap);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(label, padL - 8, y + barH / 2 + 4);
    ctx.fillStyle = Isc > PMT ? 'rgba(239,68,68,.8)' : warna; ctx.fillRect(padL, y, X(Math.min(Isc, maks)) - padL, barH);
    ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(Isc.toFixed(1) + ' kA · ' + Ssc.toFixed(1) + ' MVA · ΔV start ' + dV.toFixed(1) + ' %' + (Isc > PMT ? ' ⚠' : ''), Math.min(X(Isc), X(maks) - 230) + 6, y + barH / 2 + 4);
  });
  ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('basis 100 MVA; X_th = X_sumber + X_trafo; I_sc = S_sc/(√3·0,4 kV); merah bila melampaui PMT', W / 2, H - 8);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
