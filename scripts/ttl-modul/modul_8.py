# Konten Modul 8 Teknik Tenaga Listrik — Sistem Tenaga Listrik Saluran Transmisi
# (Sub-CPMK 4.1, Pertemuan 9). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 8
PERTEMUAN = 9
SUB_CPMK = "4.1"
JUDUL = "Sistem Tenaga Listrik Saluran Transmisi"
JUDUL_PANJANG = "Sistem Tenaga Listrik Saluran Transmisi"
JUDUL_EKSPOR = "Saluran Transmisi"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
RHO_AL, ALPHA = 0.0282, 0.00403
P_EX, PF_EX, L_EX, R_KM = 300.0, 0.9, 120.0, 0.08                 # PLTU 300 MW, 120 km, ACSR
R_EX = R_KM * L_EX
TINGKAT = [70.0, 150.0, 275.0, 500.0]
def rugi(V, P=P_EX, pf=PF_EX, R=R_EX):
    I = P * 1e6 / (SQ3 * V * 1e3 * pf)
    return I, 3 * I ** 2 * R / 1e6
HASIL = {V: rugi(V) for V in TINGKAT}
A_ACSR = 240.0                                                    # mm² Al (ACSR 240/40)
R20 = RHO_AL * 1000 / A_ACSR
R75 = R20 * (1 + ALPHA * 55)
R_AC = R75 * 1.02
I_TERMAL = 600.0                                                  # A (ACSR 240 ≈ 600 A pada 75 °C)
P_TERMAL = SQ3 * 150 * I_TERMAL * 0.95 / 1000
# isolator
N_PIRING, K_ISO = 5, 0.11
def dist(n, k):
    V = [1.0]
    for m in range(1, n):
        V.append((1 + k) * V[m - 1] + k * sum(V[:m - 1]))
    return V
V_ISO = dist(N_PIRING, K_ISO)
EFF_ISO = sum(V_ISO) / (N_PIRING * max(V_ISO)) * 100
V_FASA_150 = 150 / SQ3
# andongan
W_KOND, SPAN, T_TARIK, H_MENARA = 9.0, 350.0, 25000.0, 30.0       # N/m, m, N, m
SAG = W_KOND * SPAN ** 2 / (8 * T_TARIK)
BEBAS = H_MENARA - SAG
PANJANG = SPAN + 8 * SAG ** 2 / (3 * SPAN)
SAG_PANAS = W_KOND * SPAN ** 2 / (8 * (T_TARIK - 4000))
# korona
R_KOR, D_KOR, M_KOR = 1.05, 500.0, 0.87
VC_KOR = 21.1 * M_KOR * R_KOR * math.log(D_KOR / R_KOR)
VF_150, VF_275 = 150 / SQ3, 275 / SQ3
R_EQ2 = math.sqrt(2 * R_KOR * 40)                                 # berkas 2, jarak 40 cm
VC_BERKAS = 21.1 * M_KOR * R_EQ2 * math.log(D_KOR / R_EQ2)
RUGI_KOR = 241 * 75 * math.sqrt(R_KOR / D_KOR) * (VF_275 - VC_KOR) ** 2 * 1e-5


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def gambar1():
    b = ""
    kolom = [("SUTT 70 / 150 kV", "menara baja kisi 25–40 m", "1 konduktor/fasa, ACSR 150–340 mm²", "10–12 piring/rentengan", "60–200 km, 100–500 MW", "#22d3ee"),
             ("SUTET 275 / 500 kV", "menara 45–70 m, dua sirkit", "berkas 2–4 × ACSR 300–430 mm²", "18–26 piring", "100–500 km, 1000–3000 MW", "#f59e0b"),
             ("SKTT 150 kV (kabel)", "kabel XLPE 1 inti, ditanam/laut", "tembaga 630–2000 mm²", "isolasi padat, C besar", "5–40 km, kota padat/laut", "#a855f7")]
    for i, (judul, a1, a2, a3, a4, c) in enumerate(kolom):
        x = 20 + i * 214
        b += f'<rect x="{x}" y="20" width="200" height="196" rx="10" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>'
        b += t(x + 100, 44, judul, 12.5, c, "middle", "700")
        # ikon menara sederhana / kabel
        if i < 2:
            hh = 60 if i == 0 else 78
            b += kawat(x + 100, 56, x + 100, 56 + hh, c, 2) + kawat(x + 100 - 22, 56 + hh, x + 100 + 22, 56 + hh, c, 2) + kawat(x + 100 - 14, 56 + hh * 0.55, x + 100 + 14, 56 + hh * 0.55, c, 1.6)
            b += kawat(x + 78, 56 + hh * 0.55, x + 78, 56 + hh * 0.55 + 10, c, 1) + kawat(x + 122, 56 + hh * 0.55, x + 122, 56 + hh * 0.55 + 10, c, 1)
        else:
            b += f'<rect x="{x + 40}" y="70" width="120" height="14" rx="7" fill="none" stroke="{c}" stroke-width="2"/>' + f'<rect x="{x + 60}" y="74" width="80" height="6" rx="3" fill="{c}" fill-opacity=".5"/>' + kawat(x + 30, 110, x + 170, 110, "#7c5a3a", 3)
        for j, baris in enumerate([a1, a2, a3, a4]):
            b += t(x + 100, 150 + j * 15, baris, 9.5, AX if j else TX, "middle", "600" if not j else "")
    b += t(330, 236, "Klasifikasi menurut tegangan dan konstruksi (SPLN/PLN): SUTT dan SUTET saluran udara, SKTT/SKLT kabel tanah/laut", 11, AX)
    return svg(660, 246, b, "Gambar 1 — Klasifikasi saluran transmisi di Indonesia")


def gambar2():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    X = lambda i: x0 + i / 3 * (x1 - x0)
    maks = HASIL[70.0][1]
    Y = lambda p: y0 - min(p, maks) / (maks * 1.1) * (y0 - y1)
    for i, V in enumerate(TINGKAT):
        I, loss = HASIL[V]
        c = "#ef4444" if loss > 0.1 * P_EX else ("#f59e0b" if loss > 0.03 * P_EX else "#00e09e")
        xb = X(i) + 30
        b += f'<rect x="{xb}" y="{Y(loss):.1f}" width="80" height="{y0 - Y(loss):.1f}" rx="4" fill="{c}" fill-opacity=".8"/>'
        b += t(xb + 40, Y(loss) - 8, f"{ind(loss, 1)} MW ({ind(loss / P_EX * 100, 1)} %)", 10.5, TX, "middle", "600")
        b += t(xb + 40, y0 + 16, f"{ind(V, 0)} kV", 11, AX) + t(xb + 40, y0 + 30, f"I = {ind(I, 0)} A", 10, AX)
    b += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{AX}" stroke-width="1.2"/>'
    b += t(330, 244, f"PLTU {ind(P_EX, 0)} MW, {ind(L_EX, 0)} km, ACSR 240 (R = {ind(R_KM, 2)} Ω/km): rugi 3I²R ∝ 1/V²; 70 dan 150 kV bahkan melampaui kemampuan termal satu konduktor", 11, AX)
    return svg(660, 254, b, "Gambar 2 — Rugi daya terhadap tingkat tegangan untuk daya dan konduktor yang sama")


def gambar3():
    b = t(150, 22, "Penampang ACSR 240/40", 12, TX, "middle", "700")
    cx, cy = 150, 112
    for r_, c in [(24, "#94a3b8"), (17, "#94a3b8")]:
        pass
    # untaian aluminium 2 lapis + inti baja 7 kawat
    for ring, n, rad, c in [(2, 24, 27, "#cbd5e1"), (1, 14, 17, "#cbd5e1"), (0, 6, 8, "#64748b")]:
        for i in range(n):
            ang = 2 * math.pi * i / n
            b += f'<circle cx="{cx + rad * math.cos(ang):.1f}" cy="{cy + rad * math.sin(ang):.1f}" r="4.6" fill="{c}" stroke="{BOX}" stroke-width="0.8"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="4.6" fill="#64748b" stroke="{BOX}" stroke-width="0.8"/>'
    b += t(150, 160, "aluminium (penghantar) · inti baja (kekuatan tarik)", 10, AX)
    b += t(150, 178, f"R₂₀ = ρ·1000/A = {ind(R20, 4)} Ω/km", 10.5, "#22d3ee", "middle", "600")
    b += t(150, 194, f"R₇₅ = R₂₀(1 + α·55) = {ind(R75, 4)} Ω/km; R_ac ≈ {ind(R_AC, 4)} Ω/km", 10.5, "#f59e0b", "middle", "600")
    # kanan: efek kulit dan berkas
    b += t(495, 22, "Efek kulit dan konduktor berkas", 12, TX, "middle", "700")
    b += f'<circle cx="420" cy="90" r="30" fill="{BOX}" stroke="#94a3b8" stroke-width="2"/>'
    for rr, a in [(30, 0.55), (26, 0.35), (22, 0.18), (18, 0.08)]:
        b += f'<circle cx="420" cy="90" r="{rr}" fill="#22d3ee" fill-opacity="{a}"/>'
    b += t(420, 136, "kerapatan arus AC memusat di kulit", 9.5, AX) + t(420, 150, "R_ac/R_dc ≈ 1,02–1,05 (50 Hz)", 9.5, AX)
    for (dx, dy) in [(-16, -16), (16, -16), (-16, 16), (16, 16)]:
        b += f'<circle cx="{570 + dx}" cy="{90 + dy}" r="7" fill="#94a3b8" stroke="{BOX}" stroke-width="1"/>'
    b += f'<circle cx="570" cy="90" r="34" fill="none" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="4 3"/>'
    b += t(570, 136, "berkas 4 × ACSR (SUTET 500 kV)", 9.5, AX) + t(570, 150, "r_eq besar: korona & X_L turun", 9.5, AX)
    b += t(330, 216, f"Kemampuan hantar arus ACSR 240 pada 75 °C ≈ {ind(I_TERMAL, 0)} A → {ind(P_TERMAL, 0)} MW pada 150 kV, pf 0,95; PLTU 300 MW butuh 2 sirkit atau tegangan lebih tinggi", 11, AX)
    return svg(660, 226, b, "Gambar 3 — Konduktor ACSR: penampang, resistansi, efek kulit, dan berkas")


def gambar4():
    b = ""
    x0, ytop = 120, 30
    dy = 34
    vmax = max(V_ISO)
    b += kawat(x0 - 40, ytop, x0 + 40, ytop, "#94a3b8", 4) + t(x0, ytop - 10, "lengan menara (0 V)", 10, AX)
    for i in range(N_PIRING):
        idx = N_PIRING - 1 - i
        y = ytop + dy * (i + 0.6)
        rel = V_ISO[idx] / vmax
        c = f"rgb({int(80 + 175 * rel)},{int(200 - 120 * rel)},120)"
        b += f'<ellipse cx="{x0}" cy="{y:.1f}" rx="26" ry="10" fill="{c}"/>' + kawat(x0, y + 10, x0, y + dy * 0.6, "#94a3b8", 2)
        b += t(x0 + 36, y + 4, f"piring {idx + 1}: {ind(V_ISO[idx] / sum(V_ISO) * V_FASA_150, 2)} kV ({ind(V_ISO[idx] / sum(V_ISO) * 100, 1)} %)", 10, TX, "start", "600")
    b += kawat(x0, ytop + dy * N_PIRING + 4, x0 + 70, ytop + dy * N_PIRING + 4, "#f59e0b", 3) + t(x0 + 76, ytop + dy * N_PIRING + 8, f"konduktor 150 kV ({ind(V_FASA_150, 1)} kV fasa)", 10, "#f59e0b", "start", "600")
    # kanan: kapasitansi
    bx = 430
    b += t(bx + 80, 22, "Mengapa tidak merata?", 12, TX, "middle", "700")
    for i in range(3):
        y = 50 + i * 42
        b += f'<rect x="{bx}" y="{y}" width="40" height="14" rx="3" fill="{BOX}" stroke="#22d3ee" stroke-width="1.6"/>' + t(bx + 20, y + 11, "C", 9, "#22d3ee", "middle", "600")
        b += kawat(bx + 20, y + 14, bx + 20, y + 42, "#94a3b8", 1.5) if i < 2 else ""
        b += kawat(bx + 40, y + 7, bx + 90, y + 7, "#94a3b8", 1.2) + f'<rect x="{bx + 90}" y="{y}" width="24" height="14" rx="3" fill="{BOX}" stroke="#a855f7" stroke-width="1.4"/>' + t(bx + 102, y + 11, "kC", 8.5, "#a855f7", "middle", "600") + kawat(bx + 114, y + 7, bx + 150, y + 7, "#94a3b8", 1.2)
    b += kawat(bx + 150, 40, bx + 150, 150, "#94a3b8", 3) + t(bx + 158, 100, "menara", 9.5, AX, "start")
    b += t(bx + 80, 176, "arus bocor lewat kC ke menara membuat", 9.5, AX) + t(bx + 80, 190, "arus C tidak sama: piring bawah paling terbebani", 9.5, AX)
    b += t(330, 228, f"k = {ind(K_ISO, 2)}, {N_PIRING} piring: piring terdekat konduktor {ind(max(V_ISO) / sum(V_ISO) * 100, 1)} % vs rata-rata {ind(100 / N_PIRING, 0)} %; efisiensi rentengan {ind(EFF_ISO, 1)} %; cincin perata (grading ring) menaikkannya", 11, AX)
    return svg(660, 238, b, "Gambar 4 — Distribusi tegangan pada rentengan isolator piring")


def gambar5():
    b = ""
    x0, x1, y0 = 60, 600, 180
    skY = 130 / (H_MENARA * 1.1)
    X = lambda x: x0 + x / SPAN * (x1 - x0)
    Y = lambda h: y0 - h * skY
    b += f'<rect x="{x0 - 30}" y="{y0}" width="{x1 - x0 + 60}" height="14" fill="#5a3f1e" fill-opacity=".5"/>' + kawat(x0 - 30, y0, x1 + 30, y0, "#b08050", 2)
    for x in (0, SPAN):
        b += kawat(X(x), y0, X(x), Y(H_MENARA), "#94a3b8", 4) + kawat(X(x) - 14, Y(H_MENARA), X(x) + 14, Y(H_MENARA), "#94a3b8", 3)
    for S_, c, lab in [(SAG, "#f59e0b", f"30 °C: S = {ind(SAG, 2)} m"), (SAG_PANAS, "#ef4444", f"75 °C (T turun): S = {ind(SAG_PANAS, 2)} m")]:
        pts = " ".join(f"{X(SPAN * i / 60):.1f},{Y(H_MENARA - 4 * S_ * (i / 60) * (1 - i / 60)):.1f}" for i in range(61))
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2.2"/>' + t(X(SPAN / 2) + 8, Y(H_MENARA - S_) + 14, lab, 10.5, c, "start", "600")
    b += kawat(X(SPAN / 2), Y(H_MENARA), X(SPAN / 2), Y(0), "#22d3ee", 1.2)
    b += t(X(SPAN / 2) - 8, Y(H_MENARA - SAG / 2), "S", 11, "#22d3ee", "end", "700") + t(X(SPAN / 2) - 8, Y(BEBAS / 2), f"bebas {ind(BEBAS, 1)} m", 10.5, "#00e09e", "end", "600")
    b += t(X(SPAN / 2), Y(H_MENARA) - 10, f"gawang L = {ind(SPAN, 0)} m", 11, TX, "middle", "600")
    b += t(x0 + 6, Y(H_MENARA) + 14, f"H = {ind(H_MENARA, 0)} m", 10.5, AX, "start")
    b += t(330, 214, f"S = wL²/(8T) = {ind(W_KOND, 0)}×{ind(SPAN, 0)}²/(8×{ind(T_TARIK / 1000, 0)} kN) = {ind(SAG, 2)} m; panjang konduktor {ind(PANJANG, 2)} m; jarak bebas minimum SUTT 150 kV: 8–9 m (jalan raya 15 m)", 11, AX)
    return svg(660, 224, b, "Gambar 5 — Andongan konduktor, gaya tarik, dan jarak bebas")


def gambar6():
    b = ""
    x0, x1, y0, y1 = 64, 630, 196, 26
    vmax = 220.0
    X = lambda v: x0 + v / vmax * (x1 - x0)
    pmax = 241 * 75 * math.sqrt(R_KOR / D_KOR) * (vmax - VC_KOR) ** 2 * 1e-5
    Y = lambda p: y0 - p / (pmax * 1.1) * (y0 - y1)
    for v in [0, 50, 100, 150, 200]:
        b += f'<line x1="{X(v):.1f}" y1="{y1}" x2="{X(v):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(v), y0 + 16, f"{v} kV", 10.5, AX)
    for Vc, c, lab in [(VC_KOR, "#ec4899", f"1 × r {ind(R_KOR, 2)} cm: V_c = {ind(VC_KOR, 1)} kV"), (VC_BERKAS, "#00e09e", f"berkas 2 (r_eq {ind(R_EQ2, 2)} cm): V_c = {ind(VC_BERKAS, 1)} kV")]:
        req = R_KOR if Vc == VC_KOR else R_EQ2
        pts = " ".join(f"{X(v):.1f},{Y(241 * 75 * math.sqrt(req / D_KOR) * max(0, v - Vc) ** 2 * 1e-5):.1f}" for v in [i * 2 for i in range(0, 111)])
        b += f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2.2"/>'
        b += f'<line x1="{X(Vc):.1f}" y1="{y1}" x2="{X(Vc):.1f}" y2="{y0}" stroke="{c}" stroke-width="1" stroke-dasharray="5 4"/>' + t(X(Vc) + 4, y1 + 12 + (0 if Vc == VC_KOR else 14), lab, 9.5, c, "start", "600")
    for Vf, lab, c in [(VF_150, "150 kV", "#22d3ee"), (VF_275, "275 kV", "#f59e0b")]:
        b += f'<line x1="{X(Vf):.1f}" y1="{y1}" x2="{X(Vf):.1f}" y2="{y0}" stroke="{c}" stroke-width="1.6"/>' + t(X(Vf) + 4, y0 - 8, f"V_fasa {lab} = {ind(Vf, 1)} kV", 9.5, c, "start", "600")
    b += t(28, 112, "kW/km", 10, AX)
    b += t(330, 234, f"Rugi korona Peek (cuaca cerah) terhadap tegangan fasa: konduktor tunggal aman di 150 kV tetapi berkorona di 275 kV ({ind(RUGI_KOR, 2)} kW/km/fasa); berkas 2 menaikkan V_c di atasnya", 11, AX)
    return svg(660, 244, b, "Gambar 6 — Tegangan kritis korona dan rugi korona: konduktor tunggal vs berkas")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-klasifikasi">Klasifikasi</a>
  <a href="#m-konduktor">Konduktor</a>
  <a href="#m-isolator">Menara &amp; Isolator</a>
  <a href="#m-andongan">Andongan</a>
  <a href="#m-korona">Korona</a>
  <a href="#m-tegangan">Pemilihan Tegangan</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="40" x2="50" y2="190" stroke="rgba(148,163,184,.6)" stroke-width="2"/>
      <line x1="20" y1="70" x2="80" y2="70" stroke="rgba(148,163,184,.6)" stroke-width="1.6"/>
      <line x1="24" y1="110" x2="76" y2="110" stroke="rgba(148,163,184,.6)" stroke-width="1.6"/>
      <line x1="30" y1="150" x2="70" y2="150" stroke="rgba(148,163,184,.6)" stroke-width="1.6"/>
      <line x1="20" y1="70" x2="20" y2="82" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/><line x1="80" y1="70" x2="80" y2="82" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/>
      <line x1="24" y1="110" x2="24" y2="122" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/><line x1="76" y1="110" x2="76" y2="122" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/>
      <line x1="30" y1="150" x2="30" y2="162" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/><line x1="70" y1="150" x2="70" y2="162" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/>
      <line x1="36" y1="190" x2="64" y2="190" stroke="rgba(148,163,184,.6)" stroke-width="2"/>
      <text x="40" y="34" fill="rgba(255,179,0,.6)" font-family="JetBrains Mono" font-size="8">GW</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 8 80 Q 50 140, 92 80" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.6"/>
      <line x1="8" y1="60" x2="8" y2="200" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="92" y1="60" x2="92" y2="200" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="50" y1="80" x2="50" y2="110" stroke="rgba(0,229,255,.5)" stroke-width="1" stroke-dasharray="3 2"/>
      <text x="54" y="100" fill="rgba(0,229,255,.6)" font-family="JetBrains Mono" font-size="8">S</text>
      <text x="30" y="212" fill="rgba(148,163,184,.5)" font-family="JetBrains Mono" font-size="8">gawang L</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="08">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">P_rugi = 3I²R ∝ 1/V²</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">R_T = R₂₀[1 + α(T − 20)]</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">S = wL²/(8T)</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">V_c = 21,1·m·δ·r·ln(D/r)</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">η_string = V/(n·V_maks)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">SUTT · SUTET · SKTT</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">R = ρL/A</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">P_termal = √3·V·I·pf</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Saluran</span><br>
      <em>Transmisi</em><br>
      <span class="hl-amber">Tenaga Listrik</span>
    </h1>
    <p class="hero-sub">Saluran transmisi adalah perangkat keras terbesar sistem tenaga: ribuan kilometer konduktor yang digantung pada menara, dipisahkan isolator, dan dibiarkan berayun di udara terbuka. Modul ini menjelaskan bagaimana saluran diklasifikasikan, bagaimana konduktor, menara, dan isolator dipilih, mengapa konduktor melengkung dan berdesis, dan bagaimana tingkat tegangan ditetapkan dari rugi daya dan kemampuan hantar arus, dengan sudut pandang insinyur mesin yang merancang struktur, gaya tarik, dan jarak bebasnya.</p>
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

    # 01 — klasifikasi
    isi = figure(1, "Klasifikasi saluran transmisi di Indonesia", "SUTT 70/150 kV menghubungkan gardu induk dan pembangkit menengah; SUTET 275/500 kV menjadi tulang punggung Jawa–Bali dan Sumatera; SKTT (kabel) dipakai di kota padat dan penyeberangan laut.", gambar1())
    isi += formula(1, "Rugi Daya dan Tegangan Transmisi", r"I = \dfrac{P}{\sqrt{3}\,V_L\cos\varphi}, \qquad P_{rugi} = 3I^2R = \dfrac{P^2 R}{V_L^2\cos^2\varphi} \;\propto\; \dfrac{1}{V_L^2}",
                   rf"PLTU {ind(P_EX, 0)} MW, {ind(L_EX, 0)} km, ACSR 240 (R = {ind(R_EX, 1)} Ω): pada 150 kV \(I = {ind(HASIL[150.0][0], 0)}\) A dan rugi \({ind(HASIL[150.0][1], 1)}\) MW ({ind(HASIL[150.0][1] / P_EX * 100, 1)} %); pada 275 kV \({ind(HASIL[275.0][1], 1)}\) MW; pada 500 kV \({ind(HASIL[500.0][1], 1)}\) MW ({ind(HASIL[500.0][1] / P_EX * 100, 1)} %). Setiap penggandaan tegangan membagi rugi empat.",
                   "Alasan seluruh klasifikasi ini adalah Persamaan (1): daya besar dan jarak jauh memaksa tegangan tinggi, karena rugi dan jatuh tegangan turun kuadratis terhadap tegangan sementara biaya menara dan isolasi naik jauh lebih lambat. Modul 1 memperkenalkannya; modul ini menghitung akibatnya pada perangkat keras.",
                   [("V_L", "Tegangan antar-saluran (V)"), ("R", "Resistansi total per fasa (Ω)"), ("P", "Daya yang disalurkan (W)")])
    isi += cards([
        ("🗼", "SUTT 70 / 150 kV", "Saluran Udara Tegangan Tinggi: menara kisi 25–40 m, satu konduktor per fasa, rentengan 10–12 piring; jaringan antar-gardu induk di seluruh provinsi.", None),
        ("🏔️", "SUTET 275 / 500 kV", "Saluran Udara Tegangan Ekstra Tinggi: menara 45–70 m, konduktor berkas 2–4, rentengan 18–26 piring; backbone Jawa–Bali 500 kV dan Sumatera 275 kV.", None),
        ("🌊", "SKTT / SKLT", "Saluran Kabel Tegangan Tinggi (tanah) dan Laut: XLPE 150 kV di Jakarta, Surabaya; kabel laut Jawa–Bali 150 kV dan Jawa–Madura; mahal, tetapi tak terlihat dan tahan cuaca.", None),
        ("⚡", "HVDC", "Untuk jarak > 600 km atau kabel laut > 50 km, arus searah lebih murah (tanpa reaktansi dan arus pengisian); interkoneksi Sumatera–Jawa direncanakan HVDC ±500 kV.", None),
        ("🏘️", "Distribusi 20 kV", "Bukan transmisi: jaringan tegangan menengah dari gardu induk ke trafo distribusi (Modul 11–12). Batas kelembagaan PLN: transmisi ≥ 70 kV.", None),
        ("🌏", "Standar Tegangan", "IEC 60038: 66/110/132/150/220/275/400/500 kV. Indonesia memakai 70, 150, 275, 500 kV; Malaysia 132/275/500; Eropa 110/220/400.", None),
    ])
    isi += tabel(["Kelas", "Tegangan (kV)", "Daya khas per sirkit", "Jarak khas", "Konduktor/fasa", "Contoh Indonesia"], [
        ["SUTT", "70", "20–60 MW", "20–80 km", "1 × ACSR 150–240", "sub-transmisi Jawa Tengah, Sulawesi"],
        ["SUTT", "150", "100–300 MW", "40–200 km", "1 × ACSR 240–340", "seluruh Indonesia"],
        ["SUTET", "275", "400–800 MW", "100–400 km", "2 × ACSR 240–340", "Sumatera (Sumbagut–Sumbagsel)"],
        ["SUTET", "500", "1000–3000 MW", "150–500 km", "4 × ACSR 340–430", "Jawa–Bali (Suralaya–Paiton)"],
        ["SKTT", "150", "100–250 MW", "5–40 km", "1 × Cu 630–2000 (XLPE)", "Jakarta, kabel laut Jawa–Bali"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> saluran transmisi tiga fasa pertama Lauffen–Frankfurt (1891) hanya 15 kV; saluran 110 kV muncul 1908, 220 kV 1923 (California), 380/400 kV 1952 (Swedia), 500 kV 1960-an, 765 kV 1969, dan 1000–1150 kV di Tiongkok dan Rusia. Indonesia memulai 150 kV pada 1960-an (Jawa) dan SUTET 500 kV Jawa–Bali pada 1984 (PLTU Suralaya). Setiap loncatan tegangan lahir dari persoalan yang sama: daya lebih besar, jarak lebih jauh, rugi yang harus ditekan.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 memberi peta jenis saluran. Bagian 02–03 adalah perangkat kerasnya: konduktor, menara, isolator. Bagian 04–05 adalah dua fenomena fisik yang menentukan rancangan: andongan (mekanika) dan korona (medan listrik). Bagian 06 menutup dengan keputusan sistem: tingkat tegangan dari rugi, kapasitas termal, dan biaya. Animasi dan Python menghitung tiap langkahnya.")
    m += bagian(1, "m-klasifikasi", "Klasifikasi Saluran:<br>SUTT, SUTET, SKTT",
                "Saluran transmisi dibedakan menurut tegangan dan konstruksinya, dan keduanya ditentukan oleh daya yang harus dibawa dan jarak yang harus ditempuh. Persamaan (1) mengulang alasan fisiknya dari Modul 1 dengan angka nyata: rugi daya turun kuadratis terhadap tegangan. Gambar 1 memperlihatkan tiga kelas saluran yang dipakai PLN.",
                isi, "KLASIFIKASI SALURAN")

    # 02 — konduktor
    isi = figure(2, "Rugi daya terhadap tingkat tegangan untuk daya dan konduktor yang sama", f"PLTU {ind(P_EX, 0)} MW sejauh {ind(L_EX, 0)} km dengan ACSR 240: pada 70 dan 150 kV rugi melampaui sepersepuluh daya dan arusnya melampaui kemampuan termal konduktor; 275 kV memberi rugi {ind(HASIL[275.0][1] / P_EX * 100, 1)} % dan 500 kV {ind(HASIL[500.0][1] / P_EX * 100, 1)} %.", gambar2())
    isi += formula(2, "Resistansi Konduktor: Bahan, Suhu, dan Efek Kulit", r"R_{20} = \dfrac{\rho\,\ell}{A}, \qquad R_T = R_{20}\,[1 + \alpha(T - 20)], \qquad R_{ac} \approx (1{,}02\ldots1{,}05)\,R_{dc}",
                   rf"ACSR 240/40 (Al {ind(A_ACSR, 0)} mm²): \(R_{{20}} = 0{{,}}0282\times1000/{ind(A_ACSR, 0)} = {ind(R20, 4)}\) Ω/km; pada suhu kerja 75 °C \(R_{{75}} = {ind(R20, 4)}(1 + 0{{,}}00403\times55) = {ind(R75, 4)}\) Ω/km (+22 %); dengan efek kulit \(R_{{ac}} \approx {ind(R_AC, 4)}\) Ω/km. Tabel katalog memberi R_ac pada 20 °C dan 75 °C; studi rugi memakai suhu kerja.",
                   "Aluminium dipilih karena rasio konduktivitas terhadap berat dan harga terbaik (tembaga dua kali lebih berat untuk resistansi sama); baja di inti ACSR memikul gaya tarik. Suhu konduktor bergantung arus dan cuaca, sehingga kemampuan hantar arus (ampacity) dinyatakan pada suhu maksimum yang diizinkan, lazimnya 75–90 °C, di atas itu andongan dan penuaan menjadi masalah.",
                   [("\\rho", "Resistivitas (Al 0,0282, Cu 0,0172 Ω·mm²/m)"), ("A", "Penampang penghantar efektif (mm²)"), ("\\alpha", "Koefisien suhu (Al 0,00403 /°C)"), ("R_{ac}", "Resistansi AC (efek kulit)")])
    isi += figure(3, "Konduktor ACSR: penampang, resistansi, efek kulit, dan berkas", f"Untaian aluminium mengalirkan arus, inti baja memikul tarikan. Efek kulit memusatkan arus AC di lapisan luar; konduktor berkas memperbesar jari-jari efektif sehingga korona dan reaktansi turun. ACSR 240 mampu ±{ind(I_TERMAL, 0)} A ≈ {ind(P_TERMAL, 0)} MW pada 150 kV.", gambar3())
    isi += cards([
        ("🧵", "ACSR", "Aluminium Conductor Steel Reinforced: baku SUTT/SUTET Indonesia (Hawk 240/40, Drake 403/65, Zebra 400/50). Kuat, ringan, murah; inti baja rawan korosi di pantai.", None),
        ("🪶", "AAAC dan ACCC", "AAAC (paduan Al) tanpa baja: lebih tahan korosi, dipakai di pesisir. ACCC (inti komposit karbon): andongan rendah, ampacity dua kali; untuk penguatan jalur lama (reconductoring).", None),
        ("🌡️", "Ampacity", "Ditentukan keseimbangan panas: pemanasan I²R + matahari = pendinginan konveksi + radiasi. Angin 0,6 m/s dan 40 °C sekitar memberi ACSR 240 sekitar 600 A; dynamic line rating memanfaatkan angin nyata.", r"\(I^2R + q_s = q_c + q_r\)"),
        ("🔁", "Efek Kulit", "Pada 50 Hz kedalaman kulit Al ≈ 12 mm; konduktor berdiameter 20–30 mm mengalami R_ac/R_dc 1,02–1,08. Pada arus DC efeknya nol, satu lagi keunggulan HVDC.", None),
        ("🔗", "Konduktor Berkas", "2–4 sub-konduktor berjarak 40–45 cm per fasa: jari-jari efektif besar → gradien permukaan (korona) dan X_L turun, ampacity naik. Baku untuk ≥ 275 kV.", r"\(r_{eq} = \sqrt[n]{n\,r\,s^{\,n-1}}\)"),
        ("🛠️", "Sambungan dan Klem", "Sambungan tekan (compression joint) dan klem gantung/tarik harus berkonduktivitas dan berkekuatan sama dengan konduktor; titik panas di sambungan adalah penyebab putus yang paling sering.", None),
    ])
    isi += tabel(["Konduktor ACSR", "Al/baja (mm²)", "Diameter (mm)", "R_dc 20 °C (Ω/km)", "R_ac 75 °C (Ω/km)", "Ampacity ±(A)", "Berat (kg/m)"], [
        ["Hawk 240/40", "242 / 39", "21,8", ind(0.0282 * 1000 / 242, 4), ind(0.0282 * 1000 / 242 * 1.2217 * 1.02, 4), "600", "0,98"],
        ["Zebra 400/50", "429 / 56", "28,6", ind(0.0282 * 1000 / 429, 4), ind(0.0282 * 1000 / 429 * 1.2217 * 1.03, 4), "830", "1,62"],
        ["Drake 403/65", "403 / 66", "28,1", ind(0.0282 * 1000 / 403, 4), ind(0.0282 * 1000 / 403 * 1.2217 * 1.03, 4), "900", "1,63"],
        ["Dove 327/43", "328 / 43", "23,5", ind(0.0282 * 1000 / 328, 4), ind(0.0282 * 1000 / 328 * 1.2217 * 1.02, 4), "730", "1,23"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> resistansi turun berbanding terbalik penampang, tetapi ampacity naik lebih lambat karena permukaan pendinginan hanya tumbuh sebanding diameter. Itulah alasan saluran besar memakai berkas beberapa konduktor sedang, bukan satu konduktor raksasa. Soal C3, C4, C10, dan C12 memakai Persamaan (2).")
    m += bagian(2, "m-konduktor", "Konduktor:<br>ACSR, Resistansi, dan Ampacity",
                "Konduktor adalah satu-satunya bagian saluran yang benar-benar menyalurkan daya; semua yang lain menahannya di udara. Persamaan (2) menghitung resistansinya dari bahan, penampang, suhu, dan frekuensi, dan Gambar 2–3 memperlihatkan dua batas yang selalu bertemu pada konduktor: rugi daya dan kemampuan hantar arus.",
                isi, "KONDUKTOR")

    # 03 — menara & isolator
    isi = figure(4, "Distribusi tegangan pada rentengan isolator piring", f"Kapasitansi tiap piring ke menara mengalirkan sebagian arus bocor sehingga tegangan tidak terbagi rata: pada {N_PIRING} piring dengan k = {ind(K_ISO, 2)}, piring terdekat konduktor memikul {ind(max(V_ISO) / sum(V_ISO) * 100, 1)} % tegangan, bukan {ind(100 / N_PIRING, 0)} %.", gambar4())
    isi += formula(3, "Distribusi Tegangan dan Efisiensi Rentengan", r"V_{m+1} = (1 + k)\,V_m + k\sum_{j<m} V_j, \qquad \eta_{string} = \dfrac{V_{string}}{n\,V_{maks}}\times100\%, \qquad k = \dfrac{C_{menara}}{C_{piring}}",
                   rf"Contoh {N_PIRING} piring, k = {ind(K_ISO, 2)}, saluran 150 kV (\(V_{{fasa}} = {ind(V_FASA_150, 1)}\) kV): tegangan dari piring terjauh ke terdekat konduktor {', '.join(ind(v / sum(V_ISO) * V_FASA_150, 2) for v in V_ISO)} kV; efisiensi \({ind(V_FASA_150, 1)}/({N_PIRING}\times{ind(max(V_ISO) / sum(V_ISO) * V_FASA_150, 2)}) = {ind(EFF_ISO, 1)}\%\). Pada rentengan panjang (24 piring, 500 kV) efisiensi jatuh ke 50–60 % tanpa cincin perata.",
                   "Piring terdekat konduktor selalu paling terbebani; ia yang lebih dulu tembus atau berkorona. Cincin perata (grading/corona ring) di ujung konduktor menambah kapasitansi ke konduktor sehingga arus bocor ke menara terimbangi dan distribusi merata. Isolator komposit (polimer) berkapasitansi lebih kecil dan lebih ringan, tetapi rentengan piring kaca/keramik tetap dominan karena mudah diperiksa piring demi piring.",
                   [("V_m", "Tegangan piring ke-m (m = 1 terjauh dari konduktor)"), ("k", "Perbandingan kapasitansi ke menara terhadap kapasitansi piring (0,08–0,15)"), ("n", "Jumlah piring")])
    isi += cards([
        ("🗼", "Menara Kisi (Lattice)", "Baja siku galvanis berbaut; ringan per meter tinggi, mudah diangkut ke medan sulit. Jenis: suspension (gantung, 80–90 % jalur), tension (tarik, di sudut dan ujung), transposition, dan menara sungai (sampai 120 m).", None),
        ("🏗️", "Tiang Baja Monopole", "Tiang bulat tunggal untuk kawasan padat dengan tapak sempit; lebih mahal per menara tetapi izin lahan lebih mudah. Umum di SUTT 150 kV perkotaan.", None),
        ("⚡", "Kawat Tanah", "Satu–dua kawat baja/OPGW di puncak menara memayungi konduktor dari petir (sudut perisai ≤ 30°); OPGW sekaligus serat optik telekomunikasi. Pentanahan menara < 10 Ω.", None),
        ("🍽️", "Isolator Piring", "Kaca (toughened) atau porselen, 146 × 255 mm, tegangan tembus 11 kV wet per piring; 150 kV memakai 10–12, 500 kV 24–26 (lebih banyak di daerah polusi/pantai).", None),
        ("🧪", "Polusi dan Jarak Rambat", "Debu garam dan industri membentuk lapisan konduktif saat lembap; jarak rambat (creepage) 16–31 mm/kV menurut kelas polusi menambah jumlah piring atau memakai piring anti-kabut.", r"\(L_{creep} \ge 25\ \text{mm/kV}\)"),
        ("🔩", "Perangkat Keras", "Klem gantung, klem tarik, peredam getaran (Stockbridge), spacer berkas, dan bola tanda; kegagalan mekanik sering bermula di sini, bukan di konduktor.", None),
    ])
    isi += tabel(["Tegangan saluran", "Piring per rentengan (bersih)", "Piring (polusi berat)", "Panjang rentengan", "Jarak fasa–menara", "Tinggi menara khas"], [
        ["70 kV", "5–6", "7–8", "0,9 m", "1,0 m", "22–28 m"],
        ["150 kV", "10–12", "13–15", "1,7 m", "1,6 m", "30–40 m"],
        ["275 kV", "16–18", "20–22", "2,7 m", "2,5 m", "40–50 m"],
        ["500 kV", "24–26", "28–32", "3,9 m", "3,8 m", "50–70 m"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> jumlah piring tidak sebanding tegangan karena distribusi tak merata dan syarat jarak rambat; itulah sebabnya 500 kV memerlukan lebih dari 3,3 kali piring 150 kV. Soal C5, C6, dan C13 memakai Persamaan (3).")
    m += bagian(3, "m-isolator", "Menara, Kawat Tanah,<br>dan Isolator",
                "Menara menahan konduktor di ketinggian yang aman, kawat tanah melindunginya dari petir, dan rentengan isolator memisahkan tegangan ratusan kilovolt dari baja yang ditanahkan. Isolator tampak sederhana tetapi menyimpan persoalan medan listrik yang rapi: tegangannya tidak terbagi rata, seperti dirumuskan Persamaan (3) dan diperlihatkan Gambar 4.",
                isi, "MENARA DAN ISOLATOR")

    # 04 — andongan
    isi = figure(5, "Andongan konduktor, gaya tarik, dan jarak bebas", f"Konduktor {ind(W_KOND, 0)} N/m pada gawang {ind(SPAN, 0)} m dengan tarikan {ind(T_TARIK / 1000, 0)} kN melengkung {ind(SAG, 2)} m di tengah; saat panas tarikan turun dan andongan bertambah ke {ind(SAG_PANAS, 2)} m, mendekati batas jarak bebas.", gambar5())
    isi += formula(4, "Andongan Parabola, Panjang Konduktor, dan Jarak Bebas", r"S = \dfrac{w\,L^2}{8\,T}, \qquad \ell \approx L + \dfrac{8S^2}{3L}, \qquad h_{bebas} = H - S \ \ge\ h_{min}",
                   rf"Gambar 5: \(S = {ind(W_KOND, 0)}\times{ind(SPAN, 0)}^2/(8\times{ind(T_TARIK, 0)}) = {ind(SAG, 3)}\) m; panjang konduktor \({ind(SPAN, 0)} + 8\times{ind(SAG, 2)}^2/(3\times{ind(SPAN, 0)}) = {ind(PANJANG, 2)}\) m; jarak bebas \({ind(H_MENARA, 0)} - {ind(SAG, 2)} = {ind(BEBAS, 2)}\) m terhadap syarat 8–9 m (SUTT 150 kV di atas tanah biasa). Pendekatan parabola berlaku bila S ≪ L; untuk gawang sungai > 1 km dipakai kurva katenari.",
                   "Andongan adalah persoalan mekanika: konduktor adalah kabel lentur yang beratnya sendiri, ditambah es atau tekanan angin, ditahan gaya tarik horizontal T. Makin kencang (T besar) makin kecil andongan, tetapi tegangan tarik konduktor dibatasi ±20–25 % kekuatan putusnya (EDS, everyday stress) agar tahan getaran aeolian. Suhu naik → konduktor memuai → T turun → S bertambah: keadaan suhu maksimum menentukan jarak bebas, keadaan suhu minimum/angin menentukan tarikan maksimum.",
                   [("w", "Berat konduktor per satuan panjang (N/m), termasuk es/angin"), ("L", "Panjang gawang (m)"), ("T", "Gaya tarik horizontal (N)"), ("H", "Tinggi titik gantung (m)"), ("h_{min}", "Jarak bebas minimum (m)")])
    isi += cards([
        ("📏", "Jarak Bebas Minimum", "SNI/PLN: SUTT 150 kV ≥ 8–9 m di atas tanah, 15 m di atas jalan raya, 9 m di atas bangunan tahan api; SUTET 500 kV ≥ 11–15 m. Diukur pada suhu konduktor maksimum.", None),
        ("🌡️", "Persamaan Keadaan", "Menghubungkan tarikan pada dua keadaan (suhu, beban) lewat pemuaian termal dan elastis; disebut sag–tension calculation, dihitung program (PLS-CADD) untuk tiap gawang.", None),
        ("🌬️", "Beban Angin", "Tekanan angin pada konduktor menambah beban resultan √(w² + w_angin²) dan mengayunkan rentengan; jarak fasa–menara dirancang pada ayunan maksimum.", None),
        ("🎵", "Getaran Aeolian", "Angin pelan 1–7 m/s menimbulkan getaran 5–100 Hz beramplitudo kecil yang melelahkan konduktor di klem; peredam Stockbridge dan EDS ≤ 20 % kekuatan putus mengendalikannya.", None),
        ("🌀", "Galloping", "Konduktor berlapis es beramplitudo meter pada frekuensi rendah; fasa bisa saling menyentuh. Di Indonesia jarang, tetapi ayunan akibat angin badai tetap diperhitungkan.", None),
        ("🔧", "Penarikan (Stringing)", "Saat pemasangan, andongan diatur dengan tabel sag pada suhu saat itu; kesalahan 0,5 m mengubah jarak bebas seumur saluran. Insinyur mesin sering menjadi pengawasnya.", None),
    ])
    isi += tabel(["Keadaan (ACSR 240, gawang 350 m)", "Beban w (N/m)", "Tarikan T (kN)", "Andongan S (m)", "Jarak bebas (H = 30 m)"], [
        ["Suhu 30 °C, tanpa angin", ind(W_KOND, 1), ind(T_TARIK / 1000, 0), ind(SAG, 2), ind(BEBAS, 2)],
        ["Suhu 75 °C (arus penuh)", ind(W_KOND, 1), ind((T_TARIK - 4000) / 1000, 0), ind(SAG_PANAS, 2), ind(H_MENARA - SAG_PANAS, 2)],
        ["Angin 40 m/s (resultan)", ind(math.hypot(W_KOND, 14.0), 1), ind(31.0, 0), ind(math.hypot(W_KOND, 14.0) * SPAN ** 2 / (8 * 31000), 2), "ayun ke samping"],
        ["Gawang 450 m, 30 °C", ind(W_KOND, 1), ind(T_TARIK / 1000, 0), ind(W_KOND * 450 ** 2 / (8 * T_TARIK), 2), ind(H_MENARA - W_KOND * 450 ** 2 / (8 * T_TARIK), 2)],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> andongan tumbuh kuadratis terhadap gawang: memperpanjang gawang dari 350 ke 450 m menambah andongan 65 %, sehingga menara harus lebih tinggi atau lebih rapat. Keadaan suhu maksimum (baris 2) yang menentukan jarak bebas, bukan keadaan pemasangan. Soal C7 dan C15 memakai Persamaan (4).")
    m += bagian(4, "m-andongan", "Andongan, Gaya Tarik,<br>dan Jarak Bebas",
                "Konduktor yang digantung antara dua menara melengkung di bawah beratnya sendiri; seberapa jauh ia melengkung menentukan tinggi menara, jarak bebas ke tanah, dan gaya yang harus ditahan menara serta klem. Persamaan (4) memberi hubungan andongan–gaya tarik dengan pendekatan parabola, dan Gambar 5 memperlihatkan bagaimana suhu mengubahnya.",
                isi, "ANDONGAN")

    # 05 — korona
    isi = figure(6, "Tegangan kritis korona dan rugi korona: konduktor tunggal vs berkas", f"Konduktor tunggal r = {ind(R_KOR, 2)} cm berkorona di atas {ind(VC_KOR, 0)} kV fasa: aman pada 150 kV, tetapi pada 275 kV membuang {ind(RUGI_KOR, 1)} kW/km/fasa. Berkas dua sub-konduktor menaikkan tegangan kritis ke {ind(VC_BERKAS, 0)} kV.", gambar6())
    isi += formula(5, "Tegangan Kritis Korona (Peek)", r"V_c = 21{,}1\,m\,\delta\,r\,\ln\dfrac{D}{r}\ \text{kV (rms, fasa–netral)}, \qquad \delta = \dfrac{3{,}92\,p}{273 + t}, \qquad r_{eq} = \sqrt[n]{n\,r\,s^{\,n-1}}",
                   rf"Konduktor tunggal r = {ind(R_KOR, 2)} cm, D = {ind(D_KOR, 0)} cm, m = {ind(M_KOR, 2)}, δ = 1: \(V_c = 21{{,}}1\times{ind(M_KOR, 2)}\times{ind(R_KOR, 2)}\times\ln({ind(D_KOR, 0)}/{ind(R_KOR, 2)}) = {ind(VC_KOR, 1)}\) kV. Tegangan fasa 150 kV = {ind(VF_150, 1)} kV (aman), 275 kV = {ind(VF_275, 1)} kV (korona). Berkas 2 × r dengan jarak 40 cm: \(r_{{eq}} = \sqrt{{2\times{ind(R_KOR, 2)}\times40}} = {ind(R_EQ2, 2)}\) cm → \(V_c = {ind(VC_BERKAS, 1)}\) kV.",
                   "Korona terjadi ketika gradien medan di permukaan konduktor melampaui kekuatan dielektrik udara (≈ 30 kV/cm puncak, 21,1 kV/cm rms pada kondisi standar); udara di sekitar konduktor terionisasi, memancarkan cahaya ungu, desis, ozon, dan gangguan radio. Faktor m (0,8–0,9 untuk konduktor berurat, 1 untuk halus) dan kerapatan udara δ (lebih rendah di dataran tinggi dan saat panas) menurunkan V_c; hujan dan embun menurunkannya lagi.",
                   [("m", "Faktor kondisi permukaan (0,8–1,0)"), ("\\delta", "Kerapatan udara relatif (p cmHg, t °C)"), ("r, D", "Jari-jari konduktor dan jarak antar-fasa (cm)"), ("r_{eq}", "Jari-jari efektif berkas n sub-konduktor berjarak s")])
    isi += formula(6, "Rugi Korona (Peek)", r"P_{korona} = \dfrac{241}{\delta}\,(f + 25)\sqrt{\dfrac{r}{D}}\,(V - V_c)^2\times10^{-5}\ \text{kW/km/fasa}",
                   rf"Konduktor tunggal pada 275 kV: \((V - V_c) = {ind(VF_275, 1)} - {ind(VC_KOR, 1)} = {ind(VF_275 - VC_KOR, 1)}\) kV; \(P = 241\times75\times\sqrt{{{ind(R_KOR, 2)}/{ind(D_KOR, 0)}}}\times{ind(VF_275 - VC_KOR, 1)}^2\times10^{{-5}} = {ind(RUGI_KOR, 2)}\) kW/km/fasa, atau \({ind(RUGI_KOR * 3 * 200, 0)}\) kW untuk 3 fasa × 200 km: kecil dibanding rugi tembaga, tetapi saat hujan bisa 5–10 kali dan gangguan radionya yang tidak dapat diterima.",
                   "Rumus Peek adalah pendekatan empiris untuk cuaca cerah; rancangan modern memakai batas gradien permukaan (≈ 16–17 kV/cm rms untuk SUTET) dan kriteria gangguan radio/audio. Cara menekan korona: perbesar jari-jari efektif (berkas), permukaan halus, cincin korona pada perangkat keras, dan hindari ujung tajam. Korona juga sengaja dimanfaatkan pada presipitator elektrostatik PLTU.",
                   [("f", "Frekuensi (Hz)"), ("V", "Tegangan fasa–netral operasi (kV rms)"), ("V_c", "Tegangan kritis korona (kV rms)")])
    isi += cards([
        ("💜", "Tanda-Tandanya", "Cahaya ungu redup di malam hari, desis atau derak, bau ozon, dan gangguan penerimaan radio AM di dekat saluran; semuanya bertambah saat hujan dan kabut.", None),
        ("📻", "Gangguan Radio dan Audio", "Kriteria rancangan SUTET sering ditentukan bukan oleh rugi, melainkan oleh radio interference (RI) dan audible noise (AN) di tepi ruang bebas; hujan menaikkan AN 10–20 dB.", None),
        ("🔗", "Berkas: Solusi Utama", "2 × 275 kV, 4 × 500 kV, 6–8 × 765 kV: jari-jari efektif besar menurunkan gradien permukaan dan sekaligus reaktansi seri (Modul 6, 9).", r"\(E_s \propto \dfrac{V}{r_{eq}\ln(D/r_{eq})}\)"),
        ("🏔️", "Ketinggian", "Kerapatan udara δ turun ±10 % per 1000 m; saluran di dataran tinggi berkorona pada tegangan lebih rendah, alasan V_c dikoreksi dengan δ.", None),
        ("🔩", "Perangkat Keras", "Klem, spacer, dan ujung rentengan diberi cincin korona; tetesan air di permukaan konduktor adalah sumber korona hujan yang tidak bisa dihilangkan, hanya dikurangi.", None),
        ("🧲", "Manfaat Korona", "Presipitator elektrostatik PLTU dan pembersih udara memakai korona untuk mengionkan partikel; pengecas listrik statis di mesin cetak juga.", None),
    ])
    isi += tabel(["Konfigurasi (D = 5 m, m = 0,87)", "r_eq (cm)", "V_c (kV fasa)", "V_c (kV saluran)", "Aman untuk"], [
        [f"1 × ACSR 240 (r {ind(R_KOR, 2)} cm)", ind(R_KOR, 2), ind(VC_KOR, 1), ind(VC_KOR * SQ3, 0), "150 kV"],
        ["1 × ACSR 400 (r 1,43 cm)", "1,43", ind(21.1 * M_KOR * 1.43 * math.log(D_KOR / 1.43), 1), ind(21.1 * M_KOR * 1.43 * math.log(D_KOR / 1.43) * SQ3, 0), "150–220 kV"],
        [f"2 × ACSR 240, s = 40 cm", ind(R_EQ2, 2), ind(VC_BERKAS, 1), ind(VC_BERKAS * SQ3, 0), "275 kV"],
        ["4 × ACSR 400, s = 45 cm (D = 11 m)", ind((4 * 1.43 * 45 ** 3) ** 0.25, 2), ind(21.1 * M_KOR * (4 * 1.43 * 45 ** 3) ** 0.25 * math.log(1100 / (4 * 1.43 * 45 ** 3) ** 0.25), 1), ind(21.1 * M_KOR * (4 * 1.43 * 45 ** 3) ** 0.25 * math.log(1100 / (4 * 1.43 * 45 ** 3) ** 0.25) * SQ3, 0), "500 kV"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> menggandakan penampang konduktor tunggal hanya menaikkan V_c sedikit, sedangkan membaginya menjadi berkas dua menaikkannya hampir dua kali: jari-jari efektif berkas tumbuh dengan akar jarak sub-konduktor, bukan dengan luas. Soal C8 dan C14 memakai Persamaan (5)–(6).")
    m += bagian(5, "m-korona", "Korona:<br>Tegangan Kritis dan Rugi",
                "Di atas tegangan tertentu udara di sekeliling konduktor mulai terionisasi: konduktor berpendar ungu, berdesis, membuang daya, dan mengganggu radio. Persamaan (5) memberi tegangan kritis menurut Peek beserta pengaruh permukaan, ketinggian, dan konduktor berkas, dan Persamaan (6) menaksir rugi dayanya; Gambar 6 memperlihatkan mengapa SUTET selalu memakai berkas.",
                isi, "KORONA")

    # 06 — pemilihan tegangan
    isi = formula(7, "Tegangan Transmisi Ekonomis (Empiris)", r"V_{ek} \approx 5{,}5\sqrt{\dfrac{L}{1{,}6} + \dfrac{P}{100}}\ \text{kV}\ (L\ \text{km}, P\ \text{kW}), \qquad \text{lalu dibulatkan ke tegangan standar}",
                   rf"PLTU {ind(P_EX, 0)} MW, {ind(L_EX, 0)} km: \(V_{{ek}} \approx 5{{,}}5\sqrt{{{ind(L_EX, 0)}/1{{,}}6 + {ind(P_EX * 1000, 0)}/100}} = {ind(5.5 * math.sqrt(L_EX / 1.6 + P_EX * 1000 / 100), 0)}\) kV → dibulatkan ke 275 kV (atau 150 kV dua sirkit bila jaringan setempat 150 kV). Rumus ini hanya penaksir awal; keputusan akhir dari perbandingan biaya seumur hidup.",
                   "Tegangan lebih tinggi menekan rugi (∝ 1/V²) dan menaikkan batas daya (∝ V², Modul 6), tetapi menaikkan biaya isolasi, menara, ruang bebas, trafo, dan pemutus. Titik optimum bergeser ke atas bersama daya dan jarak; jaringan yang sudah ada (150 kV di sebagian besar Indonesia) sering memaksa pilihan yang tidak optimum tetapi kompatibel.",
                   [("V_{ek}", "Tegangan ekonomis antar-saluran (kV)"), ("L", "Panjang saluran (km)"), ("P", "Daya yang disalurkan (kW)")])
    isi += formula(8, "Tiga Batas Kemampuan Saluran", r"P_{termal} = \sqrt{3}\,V_L I_{maks}\cos\varphi, \qquad P_{tegangan} \approx \dfrac{P\,\Delta V_{izin}}{\Delta V}, \qquad P_{stabilitas} = \dfrac{V_S V_R}{X}\sin\delta_{maks}",
                   rf"ACSR 240 pada 150 kV: \(P_{{termal}} = \sqrt{{3}}\times150\times{ind(I_TERMAL, 0)}\times0{{,}}95 = {ind(P_TERMAL, 0)}\) MW per sirkit. PLTU {ind(P_EX, 0)} MW pada 150 kV memerlukan dua sirkit dan tetap rugi {ind(HASIL[150.0][1] / 2, 0)} MW per sirkit; pada 275 kV berkas 2 × 240 (ampacity ±1100 A) satu sirkit sudah {ind(SQ3 * 275 * 1100 * 0.95 / 1000, 0)} MW dengan rugi {ind(HASIL[275.0][1], 1)} MW.",
                   "Saluran pendek dibatasi termal, saluran menengah oleh jatuh tegangan (regulasi ≤ 5–10 %), saluran panjang oleh kestabilan (δ ≤ 30–40°); ketiganya dihitung dengan alat Modul 6. Kurva St. Clair merangkumnya: kemampuan saluran dalam kelipatan SIL turun dari ±3 SIL (< 80 km) ke ±1 SIL (± 500 km).",
                   [("I_{maks}", "Ampacity konduktor (A)"), ("\\Delta V_{izin}", "Regulasi tegangan yang diizinkan"), ("\\delta_{maks}", "Sudut daya maksimum operasi")])
    isi += cards([
        ("💰", "Biaya Saluran", "SUTT 150 kV ± Rp 3–5 miliar/km, SUTET 500 kV ± Rp 10–15 miliar/km, SKTT 150 kV ± Rp 20–40 miliar/km (2020-an); ditambah biaya lahan, ruang bebas, dan kompensasi.", None),
        ("📉", "Nilai Rugi", "Rugi 10 MW sepanjang tahun = 88 GWh ≈ Rp 100 miliar/tahun; itulah alasan investasi tegangan lebih tinggi cepat kembali pada saluran berbeban tinggi.", r"\(E = P_{rugi}\times8760\)"),
        ("🔀", "Dua Sirkit", "Menara dua sirkit membawa dua saluran sejajar: kapasitas ganda, keandalan N−1, dan rugi per sirkit seperempat bila beban terbagi rata.", None),
        ("📏", "Ruang Bebas (ROW)", "SUTT 150 kV 20 m, SUTET 500 kV 60–70 m lebar; bangunan dan pohon dibatasi. Kendala sosial sering lebih menentukan daripada teknis.", None),
        ("🌐", "Kompatibilitas", "Tegangan baru berarti gardu induk, trafo, dan pemutus baru; itulah sebabnya jaringan bertahan pada beberapa tingkat baku dan lompatan tegangan jarang.", None),
        ("🔗", "Ke Modul Berikut", "Modul 9 menurunkan R, L, C saluran dari geometri konduktor (GMR, GMD) yang di modul ini hanya dipakai sebagai angka katalog.", None),
    ])
    isi += tabel(["PLTU 300 MW, 120 km", "Sirkit × konduktor", "I per konduktor (A)", "Rugi total (MW)", "Rugi (%)", "Cukup termal?"], [
        ["150 kV", "1 × ACSR 240", ind(HASIL[150.0][0], 0), ind(HASIL[150.0][1], 1), ind(HASIL[150.0][1] / P_EX * 100, 1), f"tidak (> {ind(I_TERMAL, 0)} A)"],
        ["150 kV", "2 sirkit × ACSR 240", ind(HASIL[150.0][0] / 2, 0), ind(HASIL[150.0][1] / 2, 1), ind(HASIL[150.0][1] / 2 / P_EX * 100, 1), "ya (margin tipis)"],
        ["275 kV", "1 × berkas 2 × ACSR 240", ind(HASIL[275.0][0] / 2, 0), ind(HASIL[275.0][1] / 2, 1), ind(HASIL[275.0][1] / 2 / P_EX * 100, 1), "ya"],
        ["500 kV", "1 × berkas 4 × ACSR 400", ind(HASIL[500.0][0] / 4, 0), ind(HASIL[500.0][1] * 0.0282 / 429 / (0.0282 / 240) / 4, 2), ind(HASIL[500.0][1] * 0.0282 / 429 / (0.0282 / 240) / 4 / P_EX * 100, 2), "ya (berlebih)"],
    ])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> insinyur mesin di proyek transmisi merancang dan mengawasi menara (struktur baja, pondasi), penarikan konduktor (tabel andongan, tarikan), perangkat keras, dan pengujian mekanis isolator; angka listrik pada tabel di atas menentukan berapa konduktor per fasa dan berapa berat yang harus dipikul menara. Soal C1, C2, C9–C12 memakai Persamaan (1), (7), dan (8).")
    m += bagian(6, "m-tegangan", "Pemilihan Tingkat Tegangan<br>dan Rugi Transmisi",
                "Semua bagian sebelumnya bertemu pada satu keputusan: pada tegangan berapa saluran dibangun. Persamaan (7) memberi penaksir empiris dari daya dan jarak, dan Persamaan (8) memeriksa tiga batas kemampuan saluran: termal, jatuh tegangan, dan kestabilan. Tabel di bagian ini mengulang contoh PLTU 300 MW untuk empat tingkat tegangan.",
                isi, "PEMILIHAN TEGANGAN")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Rugi Daya terhadap Tingkat Tegangan \(P_{rugi} = 3I^2R\)", "cvRugiTegangan",
                     [("sl_rt_p", "v_rt_p", "Daya P (MW)", 20, 1000, 10, 300, "300"), ("sl_rt_l", "v_rt_l", "Panjang saluran (km)", 10, 400, 10, 120, "120"), ("sl_rt_r", "v_rt_r", "Resistansi konduktor (Ω/km)", 0.02, 0.3, 0.005, 0.08, "0.080"), ("sl_rt_pf", "v_rt_pf", "Faktor daya", 0.7, 1.0, 0.01, 0.9, "0.90")],
                     "btnRugiTegangan", "toggleRugiTegangan", "rugiTeganganInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Empat batang adalah rugi daya pada 70, 150, 275, dan 500 kV untuk daya, panjang, dan konduktor yang sama; batang merah bila rugi melampaui 10 % daya. Di bawah tiap batang tertulis arus dan efisiensinya.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Menggandakan tegangan membagi rugi empat</strong>. (2) Menggandakan daya melipatempatkan rugi (I²). (3) Panjang dan resistansi konduktor bekerja linear. Soal C1, C2, C9, dan C11.")
    isi += anim_panel(2, "amber", r"Distribusi Tegangan pada Rentengan Isolator \(V_{m+1} = (1+k)V_m + k\sum V_j\)", "cvIsolator",
                      [("sl_is_n", "v_is_n", "Jumlah piring n", 3, 12, 1, 5, "5"), ("sl_is_k", "v_is_k", "Rasio kapasitansi k", 0.02, 0.3, 0.01, 0.11, "0.11"), ("sl_is_v", "v_is_v", "Tegangan saluran (kV)", 70, 500, 5, 150, "150")],
                      "btnIsolator", "toggleIsolator", "isolatorInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kiri: rentengan dari lengan menara (atas) ke konduktor (bawah), warna makin merah makin terbebani; kanan: tegangan tiap piring dengan piring 1 terdekat konduktor (merah) dan garis rata-rata hijau.<br>Amati: (1) <strong style=\"color:var(--amber)\">Menaikkan k memperburuk ketidakrataan</strong>: piring bawah menanggung makin banyak. (2) Menambah piring menurunkan efisiensi rentengan bila k tetap. (3) k → 0 (cincin perata) membuat semua batang sama. Soal C5, C6, dan C13.")
    isi += anim_panel(3, "green", r"Andongan, Gaya Tarik, Suhu, dan Jarak Bebas \(S = wL^2/8T\)", "cvAndongan",
                      [("sl_an_l", "v_an_l", "Gawang L (m)", 100, 800, 10, 350, "350"), ("sl_an_w", "v_an_w", "Berat konduktor w (N/m)", 3, 30, 0.5, 9, "9.0"), ("sl_an_t", "v_an_t", "Gaya tarik T pada 30 °C (kN)", 5, 80, 0.5, 25, "25.0"), ("sl_an_h", "v_an_h", "Tinggi titik gantung H (m)", 15, 70, 1, 30, "30"), ("sl_an_suhu", "v_an_suhu", "Suhu konduktor (°C)", 10, 90, 1, 30, "30")],
                      "btnAndongan", "toggleAndongan", "andonganInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Konduktor kuning menggantung antara dua menara; garis biru andongan S, garis hijau jarak bebas ke tanah (merah bila di bawah 8 m). Suhu di atas 30 °C menurunkan tarikan (pendekatan 0,4 kN/°C) dan menambah andongan.<br>Amati: (1) <strong style=\"color:var(--green)\">Menggandakan gawang melipatempatkan andongan</strong>. (2) Menaikkan suhu ke 75–90 °C (arus penuh) memakan jarak bebas 1–2 m. (3) Menaikkan T memperkecil S tetapi dibatasi kekuatan konduktor dan menara. Soal C7 dan C15.")
    isi += anim_panel(4, "pink", r"Korona: Tegangan Kritis Peek, Konduktor Berkas, dan Rugi", "cvKorona",
                      [("sl_ko_r", "v_ko_r", "Jari-jari sub-konduktor r (cm)", 0.5, 2.5, 0.05, 1.05, "1.05"), ("sl_ko_d", "v_ko_d", "Jarak antar-fasa D (cm)", 200, 1200, 10, 500, "500"), ("sl_ko_m", "v_ko_m", "Faktor permukaan m", 0.7, 1.0, 0.01, 0.87, "0.87"), ("sl_ko_v", "v_ko_v", "Tegangan saluran (kV)", 70, 500, 5, 150, "150"), ("sl_ko_n", "v_ko_n", "Sub-konduktor per berkas", 1, 4, 1, 1, "1")],
                      "btnKorona", "toggleKorona", "koronaInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Kurva merah muda adalah rugi korona Peek terhadap tegangan fasa; garis kuning tegangan kritis V_c, garis hijau/merah tegangan fasa operasi (berkedip merah bila berkorona). Ikon kanan memperlihatkan berkas.<br>Amati: (1) <strong style=\"color:var(--pink)\">Naikkan tegangan ke 275 kV dengan satu konduktor</strong>: berkorona; ubah berkas ke 2, V_c melompat di atasnya. (2) Permukaan kasar (m kecil) dan jarak fasa rapat menurunkan V_c. (3) Readout memberi gradien permukaan yang dipakai standar modern. Soal C8 dan C14.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur 300 MW, 120 km, 0,08 Ω/km, pf 0,9 dan cocokkan rugi 150 kV = {ind(HASIL[150.0][1], 1)} MW dengan Gambar 2; pada Animasi 3 atur 350 m, 9 N/m, 25 kN, 30 m dan cocokkan S = {ind(SAG, 2)} m dengan Gambar 5; pada Animasi 4 atur r 1,05 cm, D 500 cm, m 0,87, 150 kV dan cocokkan V_c = {ind(VC_KOR, 1)} kV.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Saluran Transmisi",
                "Geser daya, tegangan, jumlah piring, gawang, suhu, dan konfigurasi berkas, lalu amati rugi daya, distribusi tegangan isolator, andongan dan jarak bebas, serta tegangan kritis korona. Empat animasi ini memvisualkan Persamaan (1)–(6).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan pada label soal (MW, Ω/km, kV, m, mm², kW) dan jangan membulatkan di tengah perhitungan.")
    isi += kode("Cell 1 — Rugi Daya terhadap Tegangan dan Resistansi Konduktor", f'''import numpy as np

P, pf, L, r_km = {ind(P_EX, 0)}e6, {ind(PF_EX, 1).replace(",", ".")}, {ind(L_EX, 0)}.0, {ind(R_KM, 2).replace(",", ".")}
R = r_km*L
for VL in [70, 150, 275, 500]:
    I = P/(np.sqrt(3)*VL*1e3*pf)
    rugi = 3*I**2*R/1e6                                   # MW (Persamaan 1)
    print(f"{{VL:3d}} kV: I = {{I:7.1f}} A, rugi = {{rugi:7.2f}} MW ({{rugi/(P/1e6)*100:5.2f}} %), eta = {{P/1e6/(P/1e6 + rugi)*100:.2f}} %")

# resistansi ACSR 240/40 (Persamaan 2)
rho, alpha, A = 0.0282, 0.00403, {ind(A_ACSR, 0)}.0
R20 = rho*1000/A
R75 = R20*(1 + alpha*(75 - 20))
print(f"R20 = {{R20:.4f}} ohm/km, R75 = {{R75:.4f}} ohm/km (+{{(R75/R20-1)*100:.1f}} %), R_ac75 = {{R75*1.02:.4f}} ohm/km")
print(f"Daya termal 150 kV @ 600 A pf 0.95 = {{np.sqrt(3)*150*600*0.95/1e3:.1f}} MW")''')
    isi += kode("Cell 2 — Distribusi Tegangan Rentengan Isolator dan Efisiensinya", f'''import numpy as np

def rentengan(n, k, V_fasa):
    V = [1.0]                                              # Persamaan 3 (V1 = piring terjauh dari konduktor)
    for m in range(1, n):
        V.append((1 + k)*V[m-1] + k*sum(V[:m-1]))
    V = np.array(V)*V_fasa/sum(V)
    return V, V_fasa/(n*V.max())*100

V_fasa = 150/np.sqrt(3)
for n, k in [({N_PIRING}, {ind(K_ISO, 2).replace(",", ".")}), (10, 0.11), (10, 0.05), (24, 0.1)]:
    V, eta = rentengan(n, k, V_fasa if n < 20 else 500/np.sqrt(3))
    print(f"n = {{n:2d}}, k = {{k:.2f}}: piring terdekat konduktor {{V[-1]:6.2f}} kV ({{V[-1]/V.sum()*100:5.1f}} %), efisiensi {{eta:5.1f}} %")
V, eta = rentengan({N_PIRING}, {ind(K_ISO, 2).replace(",", ".")}, V_fasa)
print("tegangan tiap piring (dari menara ke konduktor):", np.round(V, 2))''')
    isi += kode("Cell 3 — Andongan, Panjang Konduktor, Jarak Bebas, dan Pengaruh Suhu", f'''import numpy as np
import matplotlib.pyplot as plt

w, L, T, H = {ind(W_KOND, 0)}.0, {ind(SPAN, 0)}.0, {ind(T_TARIK, 0)}.0, {ind(H_MENARA, 0)}.0   # N/m, m, N, m
S = w*L**2/(8*T)                                         # Persamaan 4
panjang = L + 8*S**2/(3*L)
print(f"S = {{S:.3f}} m, panjang konduktor = {{panjang:.2f}} m, jarak bebas = {{H - S:.2f}} m")
for T_k in [30e3, 25e3, 21e3, 18e3]:                     # tarikan turun saat suhu naik
    S_k = w*L**2/(8*T_k)
    print(f"T = {{T_k/1e3:4.0f}} kN -> S = {{S_k:.2f}} m, bebas = {{H - S_k:.2f}} m {{'OK' if H - S_k >= 8 else 'KURANG dari 8 m!'}}")

x = np.linspace(0, L, 200)
plt.figure(figsize=(8, 3.5))
for T_k, lab in [(25e3, '30 °C'), (21e3, '75 °C')]:
    S_k = w*L**2/(8*T_k); plt.plot(x, H - 4*S_k*(x/L)*(1 - x/L), label=f'T = {{T_k/1e3:.0f}} kN ({{lab}})')
plt.axhline(8, ls=':', color='r', label='jarak bebas min 8 m'); plt.ylim(0, H + 2)
plt.xlabel('x (m)'); plt.ylabel('tinggi (m)'); plt.legend(); plt.grid(True); plt.title('Andongan konduktor'); plt.show()''')
    isi += kode("Cell 4 — Korona: Tegangan Kritis Peek, Berkas, dan Rugi", f'''import numpy as np

def V_kritis(r, D, m=0.87, delta=1.0):                   # Persamaan 5, kV rms fasa-netral
    return 21.1*m*delta*r*np.log(D/r)
def r_eq(n, r, s=40.0):                                  # jari-jari efektif berkas
    return r if n == 1 else (n*r*s**(n-1))**(1/n)
def rugi_peek(V, Vc, r, D, f=50, delta=1.0):             # Persamaan 6, kW/km/fasa
    return 0.0 if V <= Vc else 241/delta*(f + 25)*np.sqrt(r/D)*(V - Vc)**2*1e-5

r, D = {ind(R_KOR, 2).replace(",", ".")}, {ind(D_KOR, 0)}.0
for VL in [150, 275]:
    Vf = VL/np.sqrt(3)
    for n in [1, 2]:
        re = r_eq(n, r); Vc = V_kritis(re, D)
        print(f"{{VL}} kV, berkas {{n}}: r_eq = {{re:.3f}} cm, V_c = {{Vc:6.2f}} kV, V_fasa = {{Vf:6.2f}} kV -> {{'KORONA' if Vf > Vc else 'aman'}}, rugi = {{rugi_peek(Vf, Vc, re, D):.3f}} kW/km/fasa")
# gradien permukaan (kriteria modern, kV/cm rms)
Vf = 275/np.sqrt(3); re = r_eq(2, r)
print(f"gradien permukaan 275 kV berkas 2 ≈ {{Vf/(re*np.log(D/re)):.2f}} kV/cm (batas praktis ±16–17)")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–05: rugi 150 kV {ind(HASIL[150.0][1], 1)} MW, R₇₅ = {ind(R75, 4)} Ω/km, efisiensi rentengan {ind(EFF_ISO, 1)} %, S = {ind(SAG, 2)} m, dan V_c = {ind(VC_KOR, 1)} kV. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: rugi terhadap tegangan dan resistansi konduktor, distribusi tegangan isolator, andongan dengan pengaruh suhu, dan korona dengan konduktor berkas. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik Jilid 2: Saluran Transmisi", ", Cetakan 7. Pradnya Paramita, 2004.", "Klasifikasi saluran, konduktor, isolator, menara, andongan, dan korona dengan praktik Indonesia/Jepang: rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 4 (parameter saluran: konduktor, resistansi, berkas, korona) dan Bab 5 (batas kemampuan saluran, kurva St. Clair).")
    refs += pm_ref(3, "violet", "168,85,247", "J. J. Grainger &amp; W. D. Stevenson, Jr.", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 4: jenis konduktor, resistansi, efek kulit, dan tabel karakteristik ACSR.")
    refs += pm_ref(4, "green", "0,224,158", "Zuhal", "Dasar Tenaga Listrik dan Elektronika Daya", ". Gramedia, Jakarta.", "Bab saluran transmisi: tegangan transmisi Indonesia, isolator, dan andongan dalam bahasa mata kuliah ini.")
    refs += pm_ref(5, "pink", "236,72,153", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab saluran transmisi udara: konstruksi mekanis, sag–tension, dan pemilihan tegangan; pustaka utama RPS.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk klasifikasi saluran, konduktor dan ampacity, menara dan isolator, andongan, korona, dan pemilihan tegangan. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> SPLN dan Peraturan Menteri ESDM tentang ruang bebas dan jarak bebas minimum SUTT/SUTET memuat angka jarak bebas resmi; katalog konduktor ACSR (mis. IEC 61089) memberi resistansi, ampacity, dan berat per jenis; IEEE Std 738 memuat metode perhitungan suhu konduktor. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">P_rugi ∝ 1/V²</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">R_T = R₂₀[1 + α(T − 20)]</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S = wL²/(8T)</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">V_c = 21,1·m·δ·r·ln(D/r)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">η = V/(n·V_maks)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Saluran</em><br>Transmisi</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar rugi terhadap tegangan, resistansi konduktor dan suhu, isolator dan efisiensi rentengan, andongan dan jarak bebas, korona, kapasitas termal, dan pemilihan penampang. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Tingkat tegangan <strong>SUTET</strong> yang dipakai di Indonesia adalah...",
     ["275 kV dan 500 kV; SUTT 70 kV dan 150 kV", "20 kV dan 70 kV", "150 kV saja", "765 kV dan 1000 kV"],
     "Klasifikasi tegangan Indonesia"),
    ("Pada konduktor <strong>ACSR</strong>, fungsi inti baja adalah...",
     ["Menghantarkan sebagian besar arus", "Mengurangi korona", "Menambah kapasitansi saluran", "Memikul gaya tarik, sedangkan untaian aluminium menghantarkan arus"],
     "Konduktor ACSR"),
    ("Tegangan pada rentengan isolator piring <strong>tidak terbagi rata</strong> karena...",
     ["Piring-piring mempunyai ukuran berbeda", "Kapasitansi tiap piring ke menara mengalihkan arus sehingga piring terdekat konduktor memikul tegangan terbesar", "Konduktor bergetar oleh angin", "Resistansi isolator naik saat hujan"],
     "Distribusi tegangan isolator"),
    ("<strong>Korona</strong> pada saluran transmisi adalah...",
     ["Arus bocor melalui permukaan isolator kotor", "Pemanasan konduktor oleh efek kulit", "Ionisasi udara di sekitar konduktor ketika gradien medan permukaan melampaui nilai kritis; ditekan dengan konduktor berkas", "Pantulan gelombang petir di ujung saluran"],
     "Korona"),
    ("Untuk daya dan konduktor yang sama, menaikkan tegangan transmisi dua kali lipat membuat rugi daya saluran...",
     ["Turun menjadi seperempat, karena P_rugi ∝ 1/V²", "Turun menjadi setengah", "Tetap, karena resistansinya sama", "Naik dua kali karena tegangan lebih tinggi"],
     "Rugi vs tegangan"),
    ("<strong>Efek kulit</strong> pada konduktor AC menyebabkan...",
     ["Resistansi AC lebih kecil daripada DC", "Arus terkonsentrasi di pusat konduktor", "Kapasitansi saluran bertambah", "Arus terkonsentrasi di permukaan sehingga R_ac lebih besar daripada R_dc"],
     "Efek kulit"),
    ("<strong>Kawat tanah</strong> (ground wire) di puncak menara berfungsi...",
     ["Menyalurkan arus netral beban", "Menangkap sambaran petir dan menyalurkannya ke pentanahan menara sebelum mengenai konduktor fasa", "Menahan menara agar tidak roboh", "Menyeimbangkan tegangan tiga fasa"],
     "Kawat tanah"),
    ("Ciri saluran kabel tanah tegangan tinggi (<strong>SKTT</strong>) dibanding saluran udara adalah...",
     ["Lebih murah dan lebih panjang jangkauannya", "Reaktansi seri jauh lebih besar", "Kapasitansi besar (arus pengisian), biaya 5–10 kali lipat, dan panjang AC yang terbatas; dipakai di kota padat dan penyeberangan", "Tidak memerlukan isolasi"],
     "Kabel tanah"),
    ("<strong>Andongan</strong> konduktor akan bertambah bila...",
     ["Suhu konduktor naik atau bebannya bertambah oleh es dan angin", "Gaya tarik dinaikkan", "Gawang diperpendek", "Konduktor diganti yang lebih ringan"],
     "Faktor andongan"),
    ("Tingkat tegangan transmisi yang <strong>ekonomis</strong> ditentukan terutama oleh...",
     ["Jenis isolator yang tersedia", "Frekuensi sistem", "Jumlah piring isolator", "Besar daya yang disalurkan dan jarak transmisi: makin besar keduanya, makin tinggi tegangannya"],
     "Pemilihan tegangan"),
]

COMP_EZ_LABELS = ["Rugi saluran 150 kV dari P, L, r", "Rugi pada 500 kV dari rugi 150 kV (∝ 1/V²)", "Resistansi konduktor Al per km", "Koreksi suhu R₇₅", "Tegangan rata-rata per piring",
                  "Efisiensi rentengan dari V_maks", "Andongan S = wL²/(8T)", "Tegangan kritis korona (Peek)", "Rugi saluran 275 kV", "Daya termal maksimum"]
COMP_HARD_LABELS = ["Efisiensi penyaluran 150 kV", "Penampang minimum untuk rugi ≤ 3 %", "Efisiensi rentengan 3 piring dari k",
                    "Rugi korona Peek total 3 fasa", "Jarak bebas dari andongan"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 1}
PF_F, LF, PFF = 300.0, 120.0, 0.9
R_KMF, AF = 0.12, 240.0                                          # ACSR 240 R_ac 75 °C ≈ 0,12 Ω/km
RF = R_KMF * LF
def rugi_f(V, sirkit=1):
    I = PF_F * 1e6 / (SQ3 * V * 1e3 * PFF) / sirkit
    return I, 3 * I ** 2 * RF / 1e6 * sirkit
I150, LOSS150 = rugi_f(150.0)
I150_2, LOSS150_2 = rugi_f(150.0, 2)
I275, LOSS275 = rugi_f(275.0)
ETA150, ETA150_2, ETA275 = (PF_F / (PF_F + x) * 100 for x in (LOSS150, LOSS150_2, LOSS275))
RK_F, DK_F, MK_F = 1.08, 600.0, 0.85
VC_F = 21.1 * MK_F * RK_F * math.log(DK_F / RK_F)
VF275 = 275 / SQ3
REQ_F = math.sqrt(2 * RK_F * 40)
VC_F2 = 21.1 * MK_F * REQ_F * math.log(DK_F / REQ_F)
W_F, SPAN_F, T_F = 9.0, 400.0, 30000.0
SAG_F = W_F * SPAN_F ** 2 / (8 * T_F)
H_JALAN = 15.0
H_MIN_F = H_JALAN + SAG_F

FQ_JUDUL = [
    "PLTU 300 MW sejauh 120 km: bandingkan rugi dan efisiensi pada 150 kV (satu dan dua sirkit) dan 275 kV. Tegangan mana yang layak?",
    "Pada 275 kV dengan satu ACSR 240 per fasa, apakah saluran berkorona? Rancang berkasnya.",
    "Menara di persilangan jalan raya: berapa andongan, tinggi titik gantung minimum, dan berapa piring isolator yang diperlukan?",
]
FQ_RINGKAS = [
    f"PLTU {ind(PF_F, 0)} MW pf {ind(PFF, 1)}, {ind(LF, 0)} km, ACSR 240 (R_ac 75 °C {ind(R_KMF, 2)} Ω/km, ampacity ±600 A). Hitung I, rugi 3I²R, dan η untuk 150 kV satu sirkit, 150 kV dua sirkit, dan 275 kV (Persamaan 1); periksa terhadap ampacity (Persamaan 8) dan rumus tegangan ekonomis (Persamaan 7).",
    f"275 kV, satu ACSR 240 (r = {ind(RK_F, 2)} cm), D = {ind(DK_F / 100, 0)} m, m = {ind(MK_F, 2)}, δ = 1: V_c Peek (Persamaan 5) vs V_fasa = {ind(VF275, 1)} kV; rugi korona (Persamaan 6); ulangi dengan berkas 2 (s = 40 cm) dan simpulkan konfigurasi konduktor.",
    f"Gawang {ind(SPAN_F, 0)} m di persilangan jalan raya (jarak bebas 15 m), ACSR 240 w = {ind(W_F, 0)} N/m, T = {ind(T_F / 1000, 0)} kN: andongan (Persamaan 4), tinggi titik gantung minimum, dan jumlah piring isolator 275 kV (rata-rata per piring ≤ 11 kV wet, faktor 1,3) beserta efisiensi rentengan (Persamaan 3).",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"PLTU baru <b>{ind(PF_F, 0)} MW</b> (pf {ind(PFF, 1)}) akan disalurkan sejauh <b>{ind(LF, 0)} km</b> ke gardu induk pusat beban. Jaringan setempat 150 kV, tetapi PLN menawarkan pilihan 275 kV. Konduktor yang tersedia ACSR 240 (R_ac pada 75 °C {ind(R_KMF, 2)} Ω/km, ampacity ±600 A). Hitung arus, rugi 3I²R, dan efisiensi (Persamaan 1) untuk tiga pilihan: 150 kV satu sirkit, 150 kV dua sirkit, dan 275 kV satu sirkit (berkas 2 × 240, ampacity ±1100 A). Periksa tiap pilihan terhadap ampacity (Persamaan 8) dan bandingkan dengan rumus tegangan ekonomis (Persamaan 7). Pilihan mana yang layak, dan apa harga yang dibayar untuk 275 kV (trafo, menara, ruang bebas)?",
            ["I = P/(√3·V·pf)", "P_rugi = 3I²R", "I ≤ ampacity?"],
            "Rugi daya dan kelayakan termal ketiga pilihan adalah sekitar...",
            [f"150 kV 1 sirkit: {ind(LOSS150, 0)} MW, layak; 275 kV: {ind(LOSS275, 0)} MW", f"150 kV 1 sirkit dan 2 sirkit sama-sama {ind(LOSS150, 0)} MW karena tegangannya sama", f"150 kV 1 sirkit: {ind(LOSS150, 0)} MW ({ind(LOSS150 / PF_F * 100, 0)} %) dan I = {ind(I150, 0)} A melampaui ampacity; 2 sirkit: {ind(LOSS150_2, 0)} MW; 275 kV: {ind(LOSS275, 1)} MW ({ind(LOSS275 / PF_F * 100, 1)} %)", f"275 kV: {ind(LOSS150, 0)} MW, lebih boros karena tegangannya lebih tinggi"],
            f"✅ Tepat! 150 kV satu sirkit: \\(I = {ind(PF_F, 0)}\\times10^6/(\\sqrt{{3}}\\times150\\times10^3\\times{ind(PFF, 1)}) = {ind(I150, 0)}\\) A > 600 A (tidak layak termal) dan rugi \\(3\\times{ind(I150, 0)}^2\\times{ind(RF, 1)} = {ind(LOSS150, 1)}\\) MW. Dua sirkit: {ind(I150_2, 0)} A per konduktor, rugi {ind(LOSS150_2, 1)} MW (η {ind(ETA150_2, 1)} %). 275 kV: {ind(I275, 0)} A, rugi {ind(LOSS275, 1)} MW (η {ind(ETA275, 1)} %). Rumus ekonomis memberi ≈ {ind(5.5 * math.sqrt(LF / 1.6 + PF_F * 1000 / 100), 0)} kV → 275 kV; harganya trafo 275/150 kV dan menara lebih tinggi.",
            "❌ Rugi bergantung pada arus tiap konduktor: pada tegangan sama, dua sirkit membagi arus dua dan rugi total dua (bukan sama), sedangkan tegangan lebih tinggi menurunkan arus dan rugi kuadratis. Hitung I dan periksa terhadap ampacity untuk tiap pilihan.",
            "Petunjuk: (1) Hitung I, rugi, η untuk tiga pilihan. (2) Periksa ampacity dan rumus V ekonomis. (3) Bandingkan harga yang harus dibayar 275 kV.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Bila dipilih 275 kV, konsultan awalnya menggambar satu ACSR 240 per fasa (r = {ind(RK_F, 2)} cm) dengan jarak antar-fasa {ind(DK_F / 100, 0)} m, permukaan berurat m = {ind(MK_F, 2)}, δ = 1. Hitung tegangan kritis korona menurut Peek (Persamaan 5) dan bandingkan dengan tegangan fasa {ind(VF275, 1)} kV; bila berkorona, taksir rugi korona per km per fasa dan totalnya untuk {ind(LF, 0)} km (Persamaan 6). Lalu ulangi dengan berkas dua sub-konduktor berjarak 40 cm (r_eq = √(2·r·s)) dan simpulkan konfigurasi konduktor yang harus dipakai. Bahas pula gangguan radio dan keadaan hujan.",
            ["V_c = 21,1·m·δ·r·ln(D/r)", "r_eq = √(2·r·s)", "P = 241(f+25)√(r/D)(V−V_c)²·10⁻⁵"],
            f"Untuk satu ACSR 240 pada 275 kV, tegangan kritis korona dan kesimpulannya adalah...",
            [f"V_c ≈ {ind(VC_F, 0)} kV fasa < V_fasa {ind(VF275, 1)} kV: berkorona; berkas 2 menaikkan V_c ke ≈ {ind(VC_F2, 0)} kV, di atas tegangan operasi", f"V_c ≈ {ind(VC_F * SQ3, 0)} kV fasa > {ind(VF275, 1)} kV: aman tanpa berkas", f"V_c ≈ {ind(VC_F, 0)} kV, tetapi korona tidak bergantung jumlah sub-konduktor", f"Korona tidak mungkin pada 275 kV karena D = {ind(DK_F / 100, 0)} m"],
            f"✅ Tepat! \\(V_c = 21{{,}}1\\times{ind(MK_F, 2)}\\times{ind(RK_F, 2)}\\times\\ln({ind(DK_F, 0)}/{ind(RK_F, 2)}) = {ind(VC_F, 1)}\\) kV < {ind(VF275, 1)} kV: berkorona, rugi ≈ \\({ind(241 * 75 * math.sqrt(RK_F / DK_F) * (VF275 - VC_F) ** 2 * 1e-5, 2)}\\) kW/km/fasa (≈ {ind(241 * 75 * math.sqrt(RK_F / DK_F) * (VF275 - VC_F) ** 2 * 1e-5 * 3 * LF, 0)} kW total, cuaca cerah). Berkas 2: \\(r_{{eq}} = \\sqrt{{2\\times{ind(RK_F, 2)}\\times40}} = {ind(REQ_F, 2)}\\) cm → \\(V_c = {ind(VC_F2, 1)}\\) kV: aman; itulah sebabnya SUTET selalu berkas.",
            "❌ V_c Peek adalah tegangan fasa–netral (bandingkan dengan 275/√3), dan jumlah sub-konduktor mengubah jari-jari efektif sehingga V_c ikut naik. Hitung ln(D/r) dengan r dan D dalam cm, lalu ulangi dengan r_eq berkas.",
            "Petunjuk: (1) Hitung V_c satu konduktor dan bandingkan dengan V_fasa. (2) Taksir rugi korona per km dan total. (3) Ulangi dengan berkas 2 dan simpulkan; bahas RI dan hujan.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Jalur 275 kV itu menyeberangi jalan raya dengan gawang <b>{ind(SPAN_F, 0)} m</b>. Konduktor ACSR 240 (w = {ind(W_F, 0)} N/m) ditarik {ind(T_F / 1000, 0)} kN pada keadaan suhu maksimum. Hitung andongan (Persamaan 4) dan tinggi titik gantung minimum agar jarak bebas di atas jalan raya {ind(H_JALAN, 0)} m terpenuhi; berapa tinggi menara bila rentengan isolator gantung dan lengan menambah ±4 m? Lalu tentukan jumlah piring isolator 275 kV: tegangan fasa {ind(VF275, 1)} kV dengan faktor keamanan 1,3 dibagi 11 kV per piring, dan hitung efisiensi rentengannya untuk k = 0,1 (Persamaan 3, Cell 2). Bahas mengapa jumlah piring di lapangan (18–20) lebih banyak daripada hasil hitung.",
            ["S = wL²/(8T)", "H ≥ h_min + S", "n ≈ 1,3·V_fasa/11"],
            f"Andongan dan tinggi titik gantung minimum di persilangan jalan raya adalah sekitar...",
            [f"S ≈ {ind(SAG_F / 4, 1)} m; H ≥ {ind(H_JALAN + SAG_F / 4, 1)} m", f"S ≈ {ind(SAG_F, 1)} m; H ≥ {ind(H_MIN_F, 1)} m (jalan raya 15 m + andongan), menara ≈ {ind(H_MIN_F + 4, 0)} m", f"S ≈ {ind(SAG_F * 2, 1)} m; H ≥ {ind(H_JALAN + SAG_F * 2, 1)} m", f"S = 0 karena tarikan {ind(T_F / 1000, 0)} kN membuat konduktor lurus"],
            f"✅ Tepat! \\(S = {ind(W_F, 0)}\\times{ind(SPAN_F, 0)}^2/(8\\times{ind(T_F, 0)}) = {ind(SAG_F, 2)}\\) m; titik gantung ≥ {ind(H_JALAN, 0)} + {ind(SAG_F, 2)} = {ind(H_MIN_F, 2)} m, menara ≈ {ind(H_MIN_F + 4, 0)} m dengan rentengan dan lengan. Piring: \\(1{{,}}3\\times{ind(VF275, 1)}/11 \\approx {ind(1.3 * VF275 / 11, 1)}\\) → 19 piring; efisiensi rentengan 19 piring dengan k = 0,1 hanya ± 50–55 %, sehingga cincin perata dan piring tambahan untuk polusi membuat jumlah lapangan 18–22.",
            "❌ Andongan tumbuh kuadratis terhadap gawang dan berbanding terbalik tarikan: dengan 400 m dan 30 kN nilainya beberapa meter, bukan nol dan bukan puluhan meter. Hitung S = wL²/(8T) dengan T dalam newton, lalu tambahkan ke jarak bebas jalan raya.",
            "Petunjuk: (1) Hitung S dan tinggi titik gantung minimum; taksir tinggi menara. (2) Hitung jumlah piring dan efisiensi rentengannya. (3) Jelaskan selisih dengan praktik lapangan.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">P_rugi = 3I²R</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">V_c = 21,1·m·δ·r·ln(D/r)</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S = wL²/(8T)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">150 atau 275 kV?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Jalur Baru<br><em>PLTU 300 MW</em></h1>
    <p class="hero-sub">Sebuah PLTU 300 MW harus disambungkan ke pusat beban sejauh 120 km: 150 kV atau 275 kV, satu konduktor atau berkas, dan seberapa tinggi menara di persilangan jalan raya. Terapkan kosakata Pertemuan {PERTEMUAN} — rugi terhadap tegangan, ampacity, korona Peek, andongan, dan isolator — untuk menjawab ketiganya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Jalur Transmisi PLTU {ind(PF_F, 0)} MW, {ind(LF, 0)} km —<br>Tegangan, Konduktor, dan Menara</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PERANCANGAN SALURAN TRANSMISI</div>
    <p>
      Sebuah <strong style="color:var(--amber)">PLTU {ind(PF_F, 0)} MW</strong> (pf {ind(PFF, 1)}) dibangun <strong style="color:var(--cyan)">{ind(LF, 0)} km</strong> dari gardu induk pusat beban. Jaringan setempat 150 kV; PLN menawarkan pilihan <strong style="color:var(--cyan)">150 kV atau 275 kV</strong>. Konduktor yang tersedia <strong>ACSR 240</strong> (R_ac 75 °C {ind(R_KMF, 2)} Ω/km, r = {ind(RK_F, 2)} cm, ampacity ±600 A), jarak antar-fasa {ind(DK_F / 100, 0)} m.
    </p>
    <p style="margin-top:12px">
      Tiga pertanyaan menunggu jawaban: tegangan mana yang <strong>layak dari sisi rugi dan termal</strong>; apakah satu konduktor per fasa pada 275 kV akan <strong style="color:var(--pink)">berkorona</strong>; dan berapa <strong>andongan serta tinggi menara</strong> pada gawang {ind(SPAN_F, 0)} m yang menyeberangi jalan raya (jarak bebas {ind(H_JALAN, 0)} m), beserta jumlah piring isolatornya.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung ketiganya dan memberi rekomendasi <strong style="color:var(--cyan)">sebelum</strong> rancangan dasar ditetapkan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"PLTU {ind(PF_F, 0)} MW, pf {ind(PFF, 1)}, {ind(LF, 0)} km", "14,165,233", "cyan")}
{kartu(f"ACSR 240: {ind(R_KMF, 2)} Ω/km, r {ind(RK_F, 2)} cm, ±600 A", "14,165,233", "cyan")}
{kartu(f"D = {ind(DK_F / 100, 0)} m, m = {ind(MK_F, 2)}, δ = 1", "14,165,233", "cyan")}
{kartu(f"Gawang jalan raya {ind(SPAN_F, 0)} m, bebas {ind(H_JALAN, 0)} m", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Tegangan yang lebih tinggi menekan rugi tetapi menuntut berkas, menara lebih tinggi, dan isolator lebih panjang: satu keputusan mengubah seluruh perangkat keras. Forum ini mengajak Anda menghitung <strong>berapa</strong> rugi tiap pilihan, <strong>apakah</strong> korona terjadi, dan <strong>seberapa tinggi</strong> menara harus dibangun.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Rugi daya dan arus per konduktor untuk tiga pilihan penyaluran PLTU {ind(PF_F, 0)} MW sejauh {ind(LF, 0)} km; merah bila arus melampaui ampacity konduktor</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"PLTU {ind(PF_F, 0)} MW (pf {ind(PFF, 1)}) sejauh {ind(LF, 0)} km ke gardu induk; pilihan 150 kV atau 275 kV; konduktor ACSR 240 (R_ac {ind(R_KMF, 2)} Ω/km, r {ind(RK_F, 2)} cm, ampacity ±600 A), D = {ind(DK_F / 100, 0)} m, m = {ind(MK_F, 2)}. Persoalan: rugi dan kelayakan termal tiap pilihan; korona pada 275 kV satu konduktor vs berkas 2; andongan dan tinggi menara pada gawang {ind(SPAN_F, 0)} m di atas jalan raya (bebas {ind(H_JALAN, 0)} m) serta jumlah piring isolator."
FORUM_CHIPS_LMS = [f"PLTU = {ind(PF_F, 0)} MW, {ind(LF, 0)} km", f"ACSR 240 = {ind(R_KMF, 2)} Ω/km, ±600 A", f"korona: r {ind(RK_F, 2)} cm, D {ind(DK_F / 100, 0)} m", f"gawang = {ind(SPAN_F, 0)} m, bebas {ind(H_JALAN, 0)} m"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Rugi dan arus tiga pilihan penyaluran PLTU 300 MW (Pertemuan 9)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const P = 300e6, pf = 0.9, R = 0.12 * 120;
  const kasus = [['150 kV · 1 sirkit · 1 × ACSR 240', 150, 1, 600], ['150 kV · 2 sirkit · 1 × ACSR 240', 150, 2, 600], ['275 kV · 1 sirkit · berkas 2 × 240', 275, 2, 1100]];
  const padL = 250, padR = 20, padT = 22, barH = 28, gap = 16, plotW = W - padL - padR, maks = 90;
  const X = (v) => padL + v / maks * plotW;
  kasus.forEach(([label, V, nk, amp], i) => {
    const Ikond = P / (Math.sqrt(3) * V * 1e3 * pf) / nk, rugi = 3 * Ikond * Ikond * R * nk / 1e6, y = padT + i * (barH + gap);
    const lewat = Ikond > amp;
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(label, padL - 8, y + barH / 2 + 4);
    ctx.fillStyle = lewat ? 'rgba(239,68,68,.85)' : (rugi / 300 > 0.05 ? 'rgba(255,179,0,.85)' : 'rgba(0,224,158,.85)'); ctx.fillRect(padL, y, X(Math.min(rugi, maks)) - padL, barH);
    ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(rugi.toFixed(1) + ' MW (' + (rugi / 300 * 100).toFixed(1) + ' %) · ' + Ikond.toFixed(0) + ' A/konduktor' + (lewat ? ' ⚠ > ' + amp + ' A' : ' ✓ ≤ ' + amp + ' A'), X(Math.min(rugi, maks)) + 6, y + barH / 2 + 4);
  });
  ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('rugi = 3I²R per sirkit dengan R = 0,12 Ω/km × 120 km; panjang batang = rugi (MW)', W / 2, H - 8);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
