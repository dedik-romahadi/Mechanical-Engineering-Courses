# Konten Modul 14 Teknik Tenaga Listrik — Metode Analisis Aliran Daya (Load Flow)
# (Sub-CPMK 7.2, Pertemuan 15). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja berbeda dari varian soal.
import cmath
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 14
PERTEMUAN = 15
SUB_CPMK = "7.2"
JUDUL = "Metode Analisis Aliran Daya (Load Flow)"
JUDUL_PANJANG = "Metode Analisis Aliran Daya (Load Flow)"
JUDUL_EKSPOR = "Analisis Aliran Daya"

# ─────────────────────────── angka contoh ───────────────────────────
DEG = math.pi / 180
# sistem tiga bus contoh: bus 1 slack 1∠0; bus 2 PQ 0,8 + j0,4; bus 3 PQ 0,6 + j0,3; saluran j0,1 / j0,25 / j0,2 (tanpa R)
Z12, Z13, Z23 = 0.1j, 0.25j, 0.2j
Y12, Y13, Y23 = 1 / Z12, 1 / Z13, 1 / Z23
YBUS = [[Y12 + Y13, -Y12, -Y13], [-Y12, Y12 + Y23, -Y23], [-Y13, -Y23, Y13 + Y23]]
S_LOAD = [None, complex(0.8, 0.4), complex(0.6, 0.3)]


def gauss_seidel(n_iter, alpha=1.0):
    V = [1 + 0j, 1 + 0j, 1 + 0j]
    hist = [(abs(V[1]), abs(V[2]))]
    for _ in range(n_iter):
        for i in (1, 2):
            s = sum(YBUS[i][j] * V[j] for j in range(3) if j != i)
            v_new = ((-S_LOAD[i]).conjugate() / V[i].conjugate() - s) / YBUS[i][i]
            V[i] = V[i] + alpha * (v_new - V[i])
        hist.append((abs(V[1]), abs(V[2])))
    return V, hist


V_GS1, HIST1 = gauss_seidel(1)
V_GS, HIST = gauss_seidel(40)
V2F, V3F = V_GS[1], V_GS[2]
# aliran dan rugi (tanpa R rugi = 0; sudut)
I12 = (V_GS[0] - V2F) * Y12
I13 = (V_GS[0] - V3F) * Y13
I23 = (V2F - V3F) * Y23
S12 = V_GS[0] * I12.conjugate()
S13 = V_GS[0] * I13.conjugate()
S23 = V2F * I23.conjugate()
S_SLACK = S12 + S13
# dua bus contoh
V1_2B, V2_2B, X_2B, D_2B = 1.0, 0.96, 0.2, 12.0
P_2B = V1_2B * V2_2B * math.sin(D_2B * DEG) / X_2B
Q2_2B = (V1_2B * V2_2B * math.cos(D_2B * DEG) - V2_2B ** 2) / X_2B
# rugi dengan R
Z_R = complex(0.02, 0.1)
V2_R = cmath.rect(0.96, -12 * DEG)
I_R = (1 - V2_R) / Z_R
LOSS_R = abs(I_R) ** 2 * Z_R.real * 100
S1_R = 1 * I_R.conjugate()
# Newton–Raphson dua bus tanpa rugi: P = sin δ / X (V = 1)
P_NR, X_NR = 1.2, 0.3
NR = [0.0]
for _ in range(6):
    d = NR[-1]
    dd = (P_NR - math.sin(d * DEG) / X_NR) / (math.cos(d * DEG) / X_NR) / DEG
    NR.append(d + dd)
    if abs(P_NR - math.sin(NR[-1] * DEG) / X_NR) < 1e-9:
        break
D_EXACT = math.asin(P_NR * X_NR) / DEG
# DC power flow tiga bus
B22 = 1 / 0.1 + 1 / 0.2
B23 = -1 / 0.2
B33 = 1 / 0.25 + 1 / 0.2
DETB = B22 * B33 - B23 ** 2
P2_DC, P3_DC = -0.8, -0.6
D2_DC = (P2_DC * B33 - B23 * P3_DC) / DETB / DEG
D3_DC = (B22 * P3_DC - B23 * P2_DC) / DETB / DEG
# konvergensi linear contoh
R_CONV, E0_CONV, EPS_CONV = 0.6, 0.1, 1e-4
K_CONV = math.log(EPS_CONV / E0_CONV) / math.log(R_CONV)


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def bus_node(x, y, label, c, sub=""):
    b = f'<circle cx="{x}" cy="{y}" r="13" fill="{BOX}" stroke="{c}" stroke-width="2.2"/>' + t(x, y + 4, label, 11, c, "middle", "700")
    if sub:
        b += t(x, y + 30, sub, 9.5, AX)
    return b


def fmtc(z, d=3):
    return f"{ind(z.real, d)} {'−' if z.imag < 0 else '+'} j{ind(abs(z.imag), d)}"


def gambar1():
    b = t(330, 18, "Sistem tiga bus contoh dan jenis busnya", 12, TX, "middle", "700")
    bx, by = [110, 330, 220], [70, 70, 170]
    b += kawat(bx[0], by[0], bx[1], by[1], "#22d3ee", 2.4) + t(220, 60, "z₁₂ = j0,10", 10, "#22d3ee", "middle", "600")
    b += kawat(bx[0], by[0], bx[2], by[2], "#22d3ee", 2.4) + t(140, 130, "z₁₃ = j0,25", 10, "#22d3ee", "middle", "600")
    b += kawat(bx[1], by[1], bx[2], by[2], "#22d3ee", 2.4) + t(300, 130, "z₂₃ = j0,20", 10, "#22d3ee", "middle", "600")
    b += f'<circle cx="60" cy="{by[0]}" r="12" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + t(60, by[0] + 4, "G", 10, "#00e09e", "middle", "700") + kawat(72, by[0], bx[0] - 13, by[0], "#00e09e", 1.8)
    b += bus_node(bx[0], by[0], "1", "#00e09e", "slack: |V| = 1, δ = 0") + bus_node(bx[1], by[1], "2", "#f59e0b", "PQ: 0,8 + j0,4") + bus_node(bx[2], by[2], "3", "#f59e0b", "PQ: 0,6 + j0,3")
    b += kawat(bx[1], by[1] + 13, bx[1], by[1] + 36, "#f59e0b", 1.4) + f'<polygon points="{bx[1] - 6},{by[1] + 36} {bx[1] + 6},{by[1] + 36} {bx[1]},{by[1] + 46}" fill="#f59e0b"/>'
    b += kawat(bx[2] + 13, by[2], bx[2] + 36, by[2], "#f59e0b", 1.4) + f'<polygon points="{bx[2] + 36},{by[2] - 6} {bx[2] + 36},{by[2] + 6} {bx[2] + 46},{by[2]}" fill="#f59e0b"/>'
    # tabel jenis bus kanan
    baris = [("Jenis bus", "Diketahui", "Dicari", "Contoh", TX), ("Slack / swing", "|V|, δ (= 0)", "P, Q", "bus 1: GI/pembangkit acuan", "#00e09e"), ("PV / generator", "P, |V|", "Q, δ", "pembangkit ber-AVR", "#a855f7"), ("PQ / beban", "P, Q", "|V|, δ", "bus 2, 3: gardu beban", "#f59e0b")]
    for i, (a, bb, c, d, col) in enumerate(baris):
        y = 44 + i * 30
        b += f'<rect x="400" y="{y}" width="248" height="26" rx="5" fill="{BOX}" stroke="{col if i else GRID}" stroke-width="1.2"/>' + t(406, y + 17, a, 9.5, col, "start", "700") + t(500, y + 17, bb, 9, TX, "start") + t(560, y + 17, c, 9, TX, "start") + t(600, y + 17, d, 8, AX, "start")
    b += t(330, 212, "Tiap bus mempunyai 4 besaran (P, Q, |V|, δ); dua diketahui, dua dicari → sistem n bus: 2(n − 1) persamaan nonlinear (PQ: P dan Q; PV: P saja + 1 tak diketahui δ)", 10, AX)
    b += t(330, 228, "Contoh: 3 bus dengan 2 bus PQ → 4 persamaan (P₂, Q₂, P₃, Q₃) untuk 4 tak diketahui (|V₂|, δ₂, |V₃|, δ₃)", 10, AX)
    return svg(660, 238, b, "Gambar 1 — Sistem tiga bus contoh dan klasifikasi bus aliran daya")


def gambar2():
    b = t(330, 18, "Menyusun Y_bus dengan aturan inspeksi (sistem contoh, tanpa R)", 12, TX, "middle", "700")
    b += t(110, 48, "y₁₂ = 1/j0,10 = −j10", 10, "#22d3ee", "start", "600") + t(110, 64, "y₁₃ = 1/j0,25 = −j4", 10, "#22d3ee", "start", "600") + t(110, 80, "y₂₃ = 1/j0,20 = −j5", 10, "#22d3ee", "start", "600")
    b += t(110, 104, "Y_ii = Σ y terhubung ke bus i", 10, "#f59e0b", "start", "600") + t(110, 120, "Y_ij = −y_ij (0 bila tak terhubung)", 10, "#00e09e", "start", "600") + t(110, 136, "simetris; tanpa shunt: Σ baris = 0", 10, AX, "start")
    # matriks
    mx, my, cw, rh = 330, 44, 100, 34
    b += t(mx - 10, my + 60, "Y_bus =", 11, TX, "end", "700")
    for i in range(3):
        for j in range(3):
            v = YBUS[i][j]
            col = "#f59e0b" if i == j else "#00e09e"
            b += f'<rect x="{mx + j * cw}" y="{my + i * rh}" width="{cw - 4}" height="{rh - 4}" rx="4" fill="{BOX}" stroke="{col}" stroke-width="1.2"/>' + t(mx + j * cw + cw / 2 - 2, my + i * rh + rh / 2 + 4, f"{'−' if v.imag < 0 else '+'}j{ind(abs(v.imag), 0)}", 11, col, "middle", "700")
    b += t(mx + 148, my + 118, "Y₁₁ = −j(10 + 4) = −j14; Y₂₂ = −j(10 + 5) = −j15; Y₃₃ = −j(4 + 5) = −j9", 9.5, AX)
    b += t(330, 190, "Dengan R: y = 1/(R + jX) = (R − jX)/(R² + X²) → elemen kompleks G + jB; dengan kapasitansi saluran: tambahkan jB/2 tiap ujung ke elemen diagonal", 10, AX)
    b += t(330, 206, "Y_bus jarang (sparse): bus hanya terhubung ke beberapa tetangga; itulah yang membuat sistem ribuan bus dapat diselesaikan", 10, AX)
    return svg(660, 216, b, "Gambar 2 — Matriks admitansi bus sistem contoh")


def gambar3():
    b = ""
    x0, x1, y0, y1 = 64, 630, 190, 26
    X = lambda d: x0 + d / 90 * (x1 - x0)
    pmax = V1_2B * V2_2B / X_2B
    Y = lambda p: y0 - (p + 1.2) / (pmax + 1.2) * (y0 - y1)
    for d in [0, 30, 60, 90]:
        b += f'<line x1="{X(d):.1f}" y1="{y1}" x2="{X(d):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(d), y0 + 16, f"{d}°", 10.5, AX)
    for p in [-1, 0, 1, 2, 3, 4]:
        if -1.2 <= p <= pmax:
            b += f'<line x1="{x0}" y1="{Y(p):.1f}" x2="{x1}" y2="{Y(p):.1f}" stroke="{GRID if p else AX}" stroke-width="{0.7 if p else 1}"/>' + t(x0 - 8, Y(p) + 4, f"{p}", 10.5, AX, "end")
    pP = " ".join(f"{X(k):.1f},{Y(V1_2B * V2_2B * math.sin(k * DEG) / X_2B):.1f}" for k in range(91))
    pQ = " ".join(f"{X(k):.1f},{Y((V1_2B * V2_2B * math.cos(k * DEG) - V2_2B ** 2) / X_2B):.1f}" for k in range(91))
    b += f'<polyline points="{pP}" fill="none" stroke="#00e09e" stroke-width="2.6"/>' + t(X(55), Y(V1_2B * V2_2B * math.sin(55 * DEG) / X_2B) - 12, "P₁₂ = V₁V₂ sin δ/X", 10.5, "#00e09e", "middle", "600")
    b += f'<polyline points="{pQ}" fill="none" stroke="#f59e0b" stroke-width="2.4"/>' + t(X(60), Y((V1_2B * V2_2B * math.cos(60 * DEG) - V2_2B ** 2) / X_2B) + 16, "Q₂ = (V₁V₂ cos δ − V₂²)/X", 10.5, "#f59e0b", "middle", "600")
    b += f'<circle cx="{X(D_2B):.1f}" cy="{Y(P_2B):.1f}" r="5" fill="#00e09e"/>' + t(X(D_2B) + 8, Y(P_2B) - 6, f"δ = {ind(D_2B, 0)}°: P = {ind(P_2B, 3)}", 10, TX, "start", "600")
    b += f'<circle cx="{X(D_2B):.1f}" cy="{Y(Q2_2B):.1f}" r="5" fill="#f59e0b"/>' + t(X(D_2B) + 8, Y(Q2_2B) + 14, f"Q₂ = {ind(Q2_2B, 3)}", 10, TX, "start", "600")
    b += f'<line x1="{X(90):.1f}" y1="{Y(pmax):.1f}" x2="{X(90):.1f}" y2="{y0}" stroke="#ef4444" stroke-width="1" stroke-dasharray="4 3"/>' + t(X(88), Y(pmax) - 6, f"P_maks = V₁V₂/X = {ind(pmax, 2)}", 9.5, "#ef4444", "end", "600")
    b += t(28, 108, "pu", 10.5, AX) + t(347, 228, f"Dua bus, V₁ = 1, |V₂| = {ind(V2_2B, 2)}, X = {ind(X_2B, 1)} pu: P mengikuti sin δ (batas statis di 90°), Q mengikuti cos δ dan |V|²; Q₂ negatif berarti bus 2 harus memasok Q ke saluran", 10.5, AX)
    return svg(660, 238, b, "Gambar 3 — Persamaan aliran daya dua bus: P–δ dan Q–δ")


def gambar4():
    b = ""
    x0, x1, y0, y1 = 64, 630, 190, 26
    n = 12
    X = lambda k: x0 + k / n * (x1 - x0)
    vmin = 0.80
    Y = lambda v: y0 - (v - vmin) / (1.01 - vmin) * (y0 - y1)
    for k in range(0, n + 1, 2):
        b += f'<line x1="{X(k):.1f}" y1="{y1}" x2="{X(k):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(k), y0 + 16, f"it {k}", 10.5, AX)
    for v in [0.8, 0.85, 0.9, 0.95, 1.0]:
        b += f'<line x1="{x0}" y1="{Y(v):.1f}" x2="{x1}" y2="{Y(v):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(v) + 4, f"{ind(v, 2)}", 10.5, AX, "end")
    h = HIST[: n + 1]
    p2 = " ".join(f"{X(k):.1f},{Y(max(vmin, v[0])):.1f}" for k, v in enumerate(h))
    p3 = " ".join(f"{X(k):.1f},{Y(max(vmin, v[1])):.1f}" for k, v in enumerate(h))
    b += f'<polyline points="{p2}" fill="none" stroke="#22d3ee" stroke-width="2.4"/>' + f'<polyline points="{p3}" fill="none" stroke="#f59e0b" stroke-width="2.4"/>'
    for k, v in enumerate(h):
        b += f'<circle cx="{X(k):.1f}" cy="{Y(max(vmin, v[0])):.1f}" r="3.5" fill="#22d3ee"/><circle cx="{X(k):.1f}" cy="{Y(max(vmin, v[1])):.1f}" r="3.5" fill="#f59e0b"/>'
    b += f'<line x1="{x0}" y1="{Y(abs(V2F)):.1f}" x2="{x1}" y2="{Y(abs(V2F)):.1f}" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4 3"/>' + t(x1 - 4, Y(abs(V2F)) - 5, f"|V₂| → {ind(abs(V2F), 4)}", 10, "#22d3ee", "end", "600")
    b += f'<line x1="{x0}" y1="{Y(abs(V3F)):.1f}" x2="{x1}" y2="{Y(abs(V3F)):.1f}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 3"/>' + t(x1 - 4, Y(abs(V3F)) + 14, f"|V₃| → {ind(abs(V3F), 4)}", 10, "#f59e0b", "end", "600")
    b += t(28, 108, "pu", 10.5, AX) + t(347, 228, f"Gauss–Seidel sistem contoh dari V = 1∠0: iterasi 1 memberi |V₂| = {ind(HIST[1][0], 4)}, |V₃| = {ind(HIST[1][1], 4)}; konvergen linear ke {ind(abs(V2F), 4)} dan {ind(abs(V3F), 4)} pu dalam ± 10 iterasi", 10.5, AX)
    return svg(660, 238, b, "Gambar 4 — Konvergensi tegangan bus pada iterasi Gauss–Seidel sistem contoh")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 64, 630, 190, 26
    dmin, dmax = -5, 60
    X = lambda d: x0 + (d - dmin) / (dmax - dmin) * (x1 - x0)
    pmax = 1 / X_NR
    Y = lambda p: y0 - p / (pmax * 1.05) * (y0 - y1)
    f = lambda d: math.sin(d * DEG) / X_NR
    for d in [0, 15, 30, 45, 60]:
        b += f'<line x1="{X(d):.1f}" y1="{y1}" x2="{X(d):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(d), y0 + 16, f"{d}°", 10.5, AX)
    for p in [0, 1, 2, 3]:
        if p <= pmax * 1.05:
            b += t(x0 - 8, Y(p) + 4, f"{p}", 10.5, AX, "end")
    pts = " ".join(f"{X(dmin + (dmax - dmin) * k / 100):.1f},{Y(max(0, f(dmin + (dmax - dmin) * k / 100))):.1f}" for k in range(101))
    b += f'<polyline points="{pts}" fill="none" stroke="#22d3ee" stroke-width="2.4"/>' + t(X(50), Y(f(50)) - 12, "P(δ) = sin δ/X", 10.5, "#22d3ee", "middle", "600")
    b += f'<line x1="{x0}" y1="{Y(P_NR):.1f}" x2="{x1}" y2="{Y(P_NR):.1f}" stroke="#00e09e" stroke-width="1.4" stroke-dasharray="6 4"/>' + t(x0 + 6, Y(P_NR) - 6, f"P terjadwal = {ind(P_NR, 1)}", 10, "#00e09e", "start", "600")
    for k in range(len(NR) - 1):
        d, dn = NR[k], NR[k + 1]
        b += f'<line x1="{X(d):.1f}" y1="{Y(f(d)):.1f}" x2="{X(dn):.1f}" y2="{Y(P_NR):.1f}" stroke="#f59e0b" stroke-width="1.6"/>' + f'<circle cx="{X(d):.1f}" cy="{Y(f(d)):.1f}" r="4" fill="#f59e0b"/>' + t(X(d) + (8 if k == 0 else -8), Y(f(d)) + (-8 if k == 0 else 14), f"δ⁽{k}⁾ = {ind(d, 2)}°", 9.5, "#f59e0b", "start" if k == 0 else "end", "600")
        b += f'<line x1="{X(dn):.1f}" y1="{Y(P_NR):.1f}" x2="{X(dn):.1f}" y2="{Y(f(dn)):.1f}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2"/>'
    b += f'<circle cx="{X(D_EXACT):.1f}" cy="{Y(P_NR):.1f}" r="5" fill="#00e09e"/>' + t(X(D_EXACT) + 8, Y(P_NR) + 14, f"solusi δ = {ind(D_EXACT, 4)}°", 10, "#00e09e", "start", "600")
    b += t(28, 108, "pu", 10.5, AX) + t(347, 228, f"Newton–Raphson: dari δ⁽⁰⁾ = 0 garis singgung (Jacobian) menuju P terjadwal: {' → '.join(ind(d, 3) + '°' for d in NR)}; kesalahan dikuadratkan tiap langkah", 10.5, AX)
    return svg(660, 238, b, "Gambar 5 — Iterasi Newton–Raphson pada masalah dua bus: garis singgung menuju solusi")


def gambar6():
    b = t(330, 18, "Hasil aliran daya sistem contoh: tegangan bus, aliran cabang, dan daya slack", 12, TX, "middle", "700")
    bx, by = [110, 330, 220], [70, 70, 170]
    b += kawat(bx[0], by[0], bx[1], by[1], "#22d3ee", 2.4) + kawat(bx[0], by[0], bx[2], by[2], "#22d3ee", 2.4) + kawat(bx[1], by[1], bx[2], by[2], "#22d3ee", 2.4)
    b += arrow(150, 58, 290, 58, "#00e09e", 1.6) + t(220, 50, f"S₁₂ = {fmtc(S12, 3)}", 9.5, "#00e09e", "middle", "600")
    b += arrow(130, 95, 200, 150, "#00e09e", 1.6) + t(120, 130, f"S₁₃ = {fmtc(S13, 3)}", 9.5, "#00e09e", "start", "600")
    b += arrow(310, 95, 240, 150, "#00e09e", 1.6) + t(330, 130, f"S₂₃ = {fmtc(S23, 3)}", 9.5, "#00e09e", "start", "600")
    b += bus_node(bx[0], by[0], "1", "#00e09e", f"1,0∠0°") + bus_node(bx[1], by[1], "2", "#f59e0b", f"{ind(abs(V2F), 4)}∠{ind(cmath.phase(V2F) / DEG, 2)}°") + bus_node(bx[2], by[2], "3", "#f59e0b", f"{ind(abs(V3F), 4)}∠{ind(cmath.phase(V3F) / DEG, 2)}°")
    kol = [("Daya slack (bus 1)", f"{fmtc(S_SLACK, 4)} pu"), ("Σ beban", f"{fmtc(S_LOAD[1] + S_LOAD[2], 2)} pu"), ("Rugi P (tanpa R)", f"{ind(S_SLACK.real - 1.4, 4)} pu"), ("Rugi Q (I²X saluran)", f"{ind(S_SLACK.imag - 0.7, 4)} pu"), ("Tegangan terendah", f"bus {2 if abs(V2F) < abs(V3F) else 3}: {ind(min(abs(V2F), abs(V3F)), 4)} pu"), ("Sudut terbesar", f"bus {2 if abs(cmath.phase(V2F)) > abs(cmath.phase(V3F)) else 3}: {ind(min(cmath.phase(V2F), cmath.phase(V3F)) / DEG, 2)}°")]
    for i, (k_, v_) in enumerate(kol):
        y = 40 + i * 28
        b += f'<rect x="400" y="{y}" width="248" height="24" rx="5" fill="{BOX}" stroke="{GRID}" stroke-width="1"/>' + t(406, y + 16, k_, 9.5, TX, "start", "600") + t(642, y + 16, v_, 9.5, "#22d3ee", "end")
    b += t(330, 222, "Dari tegangan bus dihitung arus cabang I_ij = (V_i − V_j) y_ij, aliran S_ij = V_i I_ij*, rugi S_ij + S_ji, dan pembebanan tiap saluran; inilah keluaran yang dipakai perencana", 10, AX)
    return svg(660, 232, b, "Gambar 6 — Keluaran aliran daya sistem contoh setelah konvergen")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-bus">Masalah &amp; Jenis Bus</a>
  <a href="#m-ybus">Matriks Y_bus</a>
  <a href="#m-persamaan">Persamaan Aliran Daya</a>
  <a href="#m-gs">Gauss–Seidel</a>
  <a href="#m-nr">Newton–Raphson</a>
  <a href="#m-hasil">Hasil &amp; Aplikasi</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="60" r="7" fill="none" stroke="rgba(0,224,158,.7)" stroke-width="1.5"/>
      <circle cx="75" cy="60" r="7" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1.5"/>
      <circle cx="50" cy="110" r="7" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1.5"/>
      <line x1="32" y1="60" x2="68" y2="60" stroke="rgba(0,229,255,.5)" stroke-width="1.2"/>
      <line x1="29" y1="66" x2="46" y2="104" stroke="rgba(0,229,255,.5)" stroke-width="1.2"/>
      <line x1="71" y1="66" x2="54" y2="104" stroke="rgba(0,229,255,.5)" stroke-width="1.2"/>
      <text x="50" y="150" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8" text-anchor="middle">Y_bus 3×3</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polyline points="10,150 25,120 40,105 55,98 70,95 85,94" fill="none" stroke="rgba(0,229,255,.6)" stroke-width="1.5"/>
      <polyline points="10,150 30,100 45,94 60,94" fill="none" stroke="rgba(255,179,0,.7)" stroke-width="1.5"/>
      <text x="14" y="80" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">GS vs NR</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="14">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">I = Y_bus·V</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">P_i = Σ|V_i||V_k||Y_ik| cos(θ_ik − δ_i + δ_k)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">V_i = (1/Y_ii)[(P_i − jQ_i)/V_i* − Σ Y_ik V_k]</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">[J][Δδ; Δ|V|] = [ΔP; ΔQ]</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">P = V₁V₂ sin δ/X</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">slack · PV · PQ</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">|ΔP| &lt; 10⁻⁴</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">[B'][δ] = [P]</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Metode Analisis</span><br>
      <em>Aliran Daya</em><br>
      <span class="hl-amber">(Load Flow)</span>
    </h1>
    <p class="hero-sub">Pertanyaan paling mendasar tentang sebuah jaringan adalah: pada beban dan pembangkitan tertentu, berapa tegangan tiap bus dan berapa daya yang mengalir di tiap saluran? Jawabannya tidak dapat dihitung langsung karena persamaannya nonlinear; ia dicari dengan iterasi. Modul penutup ini menyusun matriks admitansi bus, menurunkan persamaan aliran daya, menjalankan iterasi Gauss–Seidel dengan tangan dan Python, memperkenalkan Newton–Raphson dan aliran daya DC, lalu membaca hasilnya sebagaimana perencana dan operator sistem membacanya setiap hari.</p>
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

    # 01 — masalah & jenis bus
    isi = figure(1, "Sistem tiga bus contoh dan klasifikasi bus aliran daya", "Bus 1 slack (tegangan dan sudut ditetapkan, dayanya dihitung), bus 2 dan 3 PQ (beban ditetapkan, tegangan dan sudutnya dicari); tiga saluran tanpa rugi j0,10, j0,25, dan j0,20 pu. Sistem ini dipakai sepanjang modul untuk Y_bus, Gauss–Seidel, aliran daya DC, dan pembacaan hasil.", gambar1())
    isi += formula(1, "Masalah Aliran Daya dan Jenis Bus", r"\text{tiap bus: } (P_i, Q_i, |V_i|, \delta_i)\ \text{— 2 diketahui, 2 dicari}; \qquad \text{slack: } |V|, \delta = 0; \quad PV: P, |V|; \quad PQ: P, Q; \qquad \text{jumlah persamaan} = 2n_{PQ} + n_{PV}",
                   rf"Sistem contoh: 3 bus, 2 bus PQ → \(2\times2 = 4\) persamaan nonlinear (P₂, Q₂, P₃, Q₃) untuk 4 tak diketahui (|V₂|, δ₂, |V₃|, δ₃); bus 1 slack menyerap selisih: setelah konvergen \(S_1 = {fmtc(S_SLACK, 4)}\) pu untuk beban total {fmtc(S_LOAD[1] + S_LOAD[2], 2)} pu (selisih Q = rugi I²X saluran). Bus PV (pembangkit ber-AVR) menambah satu persamaan P dan satu tak diketahui δ; Q-nya dihitung dan diperiksa terhadap batas Q_min/Q_maks.",
                   "Aliran daya (load flow) menghitung keadaan tunak jaringan tiga fasa seimbang dalam per unit: masukan berupa topologi (Y_bus), beban P–Q tiap bus, dan pembangkitan P–|V|; keluaran tegangan kompleks tiap bus, dari mana aliran, rugi, dan pembebanan diturunkan. Karena rugi belum diketahui sebelum solusi, satu bus (slack) dibiarkan bebas menyeimbangkan daya; ia juga menjadi acuan sudut. Studi ini dijalankan untuk perencanaan (Modul 12), operasi harian, kontingensi N−1, dan penempatan kompensasi (Modul 10).",
                   [("n_{PQ}, n_{PV}", "Jumlah bus beban dan bus generator (selain slack)"), ("\\delta_i", "Sudut fasor tegangan bus i terhadap slack"), ("Q_{min}, Q_{maks}", "Batas daya reaktif generator pada bus PV")])
    isi += cards([
        ("🎯", "Bus Slack", "Biasanya pembangkit terbesar atau titik sambung ke jaringan luar; P dan Q-nya hasil, bukan masukan; hanya satu per sistem sinkron.", None),
        ("⚙️", "Bus PV", "Generator dengan AVR menjaga |V|; Q dihitung; bila Q keluar batas, bus beralih ke PQ dengan Q pada batas (|V| tidak lagi tertahan).", None),
        ("🏠", "Bus PQ", "Mayoritas bus: gardu beban dengan P, Q dari peramalan (Modul 11–12); PLTS/pembangkit kecil tanpa AVR juga dimodelkan PQ dengan P negatif.", None),
        ("📐", "Model Beban", "Daya konstan (baku), impedansi konstan, arus konstan, atau ZIP; beban daya konstan paling 'berat' pada tegangan rendah.", None),
        ("🌐", "Skala", "Sistem Jawa–Bali ± 1.500 bus, jaringan distribusi ribuan bus; Y_bus jarang (sparse) dan penyelesai sparse membuatnya sekejap.", None),
        ("🔗", "Rantai Modul", "Modul 13 memberi pu dan Y dari impedansi; Modul 12 memberi sweep radial (kasus khusus tanpa loop); modul ini menyelesaikan jaringan bertautan umum.", None),
    ])
    isi += tabel(["Bus sistem contoh", "Jenis", "Diketahui", "Dicari", "Hasil (Gambar 6)"],
                 [["1 (pembangkit/GI)", "slack", "|V| = 1,0, δ = 0°", "P₁, Q₁", f"{fmtc(S_SLACK, 4)} pu"], ["2 (beban)", "PQ", "P = 0,8, Q = 0,4", "|V₂|, δ₂", f"{ind(abs(V2F), 4)}∠{ind(cmath.phase(V2F) / DEG, 2)}°"], ["3 (beban)", "PQ", "P = 0,6, Q = 0,3", "|V₃|, δ₃", f"{ind(abs(V3F), 4)}∠{ind(cmath.phase(V3F) / DEG, 2)}°"]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> tiap baris menetapkan dua besaran dan mencari dua lainnya; jumlah tak diketahui sama dengan jumlah persamaan, tetapi persamaannya mengandung hasil kali tegangan dan fungsi sudut sehingga harus diiterasi (Bagian 04–05). Soal C9 memakai neraca daya slack.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 merumuskan masalah dan jenis bus, Bagian 02 menyusun Y_bus, Bagian 03 menurunkan persamaan aliran daya (dan bentuk dua busnya yang sederhana), Bagian 04 menyelesaikannya dengan Gauss–Seidel langkah demi langkah, Bagian 05 dengan Newton–Raphson, fast decoupled, dan aliran daya DC, lalu Bagian 06 membaca hasilnya. Sistem tiga bus contoh dipakai di semua bagian, animasi, dan Python.")
    m += bagian(1, "m-bus", "Masalah Aliran Daya<br>dan Klasifikasi Bus",
                "Setelah jaringan digambar (Modul 13) dan bebannya diramal (Modul 11–12), pertanyaan berikutnya: berapa tegangan tiap bus dan berapa daya yang mengalir di tiap saluran pada keadaan itu? Persamaan (1) menetapkan apa yang diketahui dan dicari di tiap bus; Gambar 1 memperkenalkan sistem tiga bus yang dipakai sepanjang modul.",
                isi, "MASALAH ALIRAN DAYA")

    # 02 — Ybus
    isi = figure(2, "Matriks admitansi bus sistem contoh", "Aturan inspeksi: elemen diagonal adalah jumlah admitansi semua cabang (dan shunt) yang terhubung ke bus itu, elemen luar-diagonal adalah negatif admitansi cabang antara kedua bus; untuk sistem contoh tanpa R semua elemen imajiner murni.", gambar2())
    isi += formula(2, "Matriks Admitansi Bus", r"\bar I = Y_{bus}\,\bar V, \qquad Y_{ii} = \sum_{k \ne i} y_{ik} + y_{sh,i}, \qquad Y_{ik} = -y_{ik}, \qquad y_{ik} = \dfrac{1}{R_{ik} + jX_{ik}}",
                   rf"Sistem contoh: \(y_{{12}} = 1/j0{{,}}1 = -j10\), \(y_{{13}} = -j4\), \(y_{{23}} = -j5\) → \(Y_{{11}} = -j14\), \(Y_{{22}} = -j15\), \(Y_{{33}} = -j9\), \(Y_{{12}} = j10\), \(Y_{{13}} = j4\), \(Y_{{23}} = j5\). Dengan R (mis. z₁₂ = 0,02 + j0,1): \(y_{{12}} = 1/(0{{,}}02 + j0{{,}}1) = {fmtc(1 / complex(0.02, 0.1), 3)}\) pu, |Y₁₂| = {ind(abs(1 / complex(0.02, 0.1)), 3)}. Kapasitansi saluran jB/2 = j0,03 di tiap ujung menambah j0,03 ke Y_ii tiap bus ujung.",
                   "Y_bus menghubungkan arus injeksi dan tegangan semua bus sekaligus; ia simetris (Y_ik = Y_ki bila tidak ada trafo pengubah fasa) dan jarang (elemen tak nol hanya untuk bus yang bertetangga). Trafo bertap t dimodelkan dengan π-ekuivalen yang mengubah Y_ii dan Y_ik dengan faktor 1/t dan 1/t²; kapasitor shunt menambah −jB_C... tepatnya +jB_C ke Y_ii. Matriks inilah 'topologi' yang dibaca semua perangkat lunak aliran daya.",
                   [("y_{ik}", "Admitansi cabang antara bus i dan k (pu)"), ("y_{sh,i}", "Admitansi shunt di bus i: kapasitansi saluran, kapasitor, reaktor"), ("\\bar I, \\bar V", "Vektor arus injeksi dan tegangan bus (kompleks)")])
    isi += cards([
        ("🔍", "Aturan Inspeksi", "Isi diagonal dengan jumlah admitansi terhubung, luar-diagonal dengan −y; tanpa shunt, jumlah tiap baris nol: pemeriksaan cepat.", None),
        ("🧮", "Dari Ohm ke Admitansi", "y = 1/(R + jX) = (R − jX)/(R² + X²): konduktansi G positif, suseptansi B negatif untuk cabang induktif.", None),
        ("⚡", "Shunt", "Kapasitansi saluran (+jB/2 tiap ujung), kapasitor bank (+jB_C), reaktor (−jB_L) hanya menyentuh elemen diagonal.", None),
        ("🔀", "Trafo Bertap", "Tap t di sisi i: Y_ii += y/t², Y_ik = −y/t, Y_kk += y; tap ±10 % mengubah Y sedikit tetapi mengubah aliran Q secara berarti.", None),
        ("💾", "Sparsity", "Sistem 1.000 bus, 1.500 cabang: hanya ± 4.000 dari 10⁶ elemen tak nol; penyimpanan dan faktorisasi sparse menjadikan NR praktis.", None),
        ("🔁", "Z_bus", "Kebalikan Y_bus (penuh, tidak jarang) dipakai untuk hubung singkat: Z_ii = X_th rel i (Modul 13).", None),
    ])
    isi += tabel(["Elemen Y_bus sistem contoh", "Susunan", "Nilai (pu)", "Dengan jB/2 = j0,03 tiap ujung", "Dengan R = 0,2X"],
                 [["Y₁₁", "y₁₂ + y₁₃", "−j14", f"−j{ind(14 - 0.06, 2)}", fmtc(1 / complex(0.02, 0.1) + 1 / complex(0.05, 0.25), 3)], ["Y₂₂", "y₁₂ + y₂₃", "−j15", f"−j{ind(15 - 0.06, 2)}", fmtc(1 / complex(0.02, 0.1) + 1 / complex(0.04, 0.2), 3)], ["Y₃₃", "y₁₃ + y₂₃", "−j9", f"−j{ind(9 - 0.06, 2)}", fmtc(1 / complex(0.05, 0.25) + 1 / complex(0.04, 0.2), 3)], ["Y₁₂ = Y₂₁", "−y₁₂", "j10", "j10", fmtc(-1 / complex(0.02, 0.1), 3)], ["Y₁₃ = Y₃₁", "−y₁₃", "j4", "j4", fmtc(-1 / complex(0.05, 0.25), 3)], ["Y₂₃ = Y₃₂", "−y₂₃", "j5", "j5", fmtc(-1 / complex(0.04, 0.2), 3)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> shunt hanya menggeser diagonal sedikit (arus pengisian kecil), resistansi menambahkan bagian nyata G pada semua elemen; keduanya diperlukan untuk aliran daya yang teliti tetapi diabaikan pada hubung singkat (Modul 13). Soal C1, C2, dan C11 memakai Persamaan (2).")
    m += bagian(2, "m-ybus", "Matriks Admitansi<br>Bus (Y_bus)",
                "Semua persamaan aliran daya bertumpu pada satu matriks yang merangkum topologi dan impedansi jaringan: Y_bus. Persamaan (2) memberi aturan inspeksi untuk menyusunnya langsung dari diagram impedansi, dan Gambar 2 mengerjakannya untuk sistem contoh.",
                isi, "MATRIKS Y_BUS")

    # 03 — persamaan aliran daya
    isi = figure(3, "Persamaan aliran daya dua bus: P–δ dan Q–δ", f"Untuk dua bus lewat saluran tanpa rugi, daya aktif mengikuti sinus sudut (maksimum V₁V₂/X = {ind(V1_2B * V2_2B / X_2B, 2)} pu pada 90°) dan daya reaktif mengikuti kosinus sudut dan kuadrat tegangan; pada δ = {ind(D_2B, 0)}° saluran contoh menyalurkan {ind(P_2B, 3)} pu dan bus 2 menerima Q₂ = {ind(Q2_2B, 3)} pu (negatif: bus 2 justru harus memasok Q).", gambar3())
    isi += formula(3, "Persamaan Aliran Daya", r"P_i = \sum_{k=1}^{n}|V_i||V_k||Y_{ik}|\cos(\theta_{ik} - \delta_i + \delta_k), \qquad Q_i = -\sum_{k=1}^{n}|V_i||V_k||Y_{ik}|\sin(\theta_{ik} - \delta_i + \delta_k); \qquad \text{dua bus tanpa rugi: } P = \dfrac{V_1V_2\sin\delta}{X},\ Q_2 = \dfrac{V_1V_2\cos\delta - V_2^2}{X}",
                   rf"Dua bus V₁ = 1, |V₂| = {ind(V2_2B, 2)}, X = {ind(X_2B, 1)}, δ = {ind(D_2B, 0)}°: \(P = 1\times{ind(V2_2B, 2)}\times\sin{ind(D_2B, 0)}^\circ/{ind(X_2B, 1)} = {ind(P_2B, 4)}\) pu; \(Q_2 = ({ind(V2_2B, 2)}\cos{ind(D_2B, 0)}^\circ - {ind(V2_2B, 2)}^2)/{ind(X_2B, 1)} = {ind(Q2_2B, 4)}\) pu. Koefisien sinkronisasi \(\partial P/\partial\delta = V_1V_2\cos\delta/X = {ind(V1_2B * V2_2B * math.cos(D_2B * DEG) / X_2B, 4)}\) pu/rad. Dengan R (z = 0,02 + j0,1, V₂ = 0,96∠−12°): \(I = (V_1 - V_2)/Z = {fmtc(I_R, 4)}\) pu, rugi \(|I|^2R = {ind(LOSS_R, 2)}\) MW pada dasar 100 MVA.",
                   "Daya injeksi tiap bus adalah jumlah hasil kali tegangannya dengan tegangan semua tetangga lewat elemen Y_bus; sinus dan kosinus sudut membuatnya nonlinear. Bentuk dua bus tanpa rugi memperlihatkan sifat pentingnya: P terutama diatur oleh perbedaan sudut δ, Q oleh perbedaan besar tegangan; inilah dasar decoupling P–δ / Q–V yang dipakai fast decoupled dan operator saat 'menaikkan tegangan dengan kapasitor, menaikkan aliran dengan sudut'. Batas statis δ = 90° adalah batas kestabilan sudut sistem.",
                   [("\\theta_{ik}", "Sudut elemen Y_ik (−90° untuk cabang reaktif murni)"), ("\\delta_i - \\delta_k", "Beda sudut tegangan antar-bus"), ("P_{maks}", "V₁V₂/X: batas daya statis saluran")])
    isi += cards([
        ("📐", "Bentuk Polar", "P_i dan Q_i sebagai fungsi |V| dan δ: bentuk baku Newton–Raphson; bentuk rektangular (e + jf) dipakai beberapa penyelesai.", None),
        ("↔️", "Decoupling", "∂P/∂δ dan ∂Q/∂|V| besar; ∂P/∂|V| dan ∂Q/∂δ kecil pada transmisi (X ≫ R): P–δ dan Q–V hampir terpisah; tidak berlaku di distribusi (R ≈ X).", None),
        ("📉", "Mismatch", "ΔP_i = P_i,terjadwal − P_i(V, δ); ΔQ_i serupa; iterasi selesai bila maks |ΔP|, |ΔQ| < ε (10⁻⁴ pu = 10 kW pada 100 MVA).", None),
        ("⚡", "Batas Statis", "Saluran panjang dengan X besar hanya mampu V₁V₂/X; kapasitor seri (Modul 10) menurunkan X dan menaikkan batas.", None),
        ("🔁", "Sudut dalam Praktik", "Beda sudut antar-GI 150 kV Jawa 5–30°; sudut besar berarti saluran berat dan margin kestabilan kecil.", None),
        ("🏭", "Di Pabrik", "Jaringan pabrik radial diselesaikan dengan sweep (Modul 12); aliran daya penuh diperlukan bila ada generator sendiri (kogenerasi) dan loop.", None),
    ])
    isi += tabel(["Dua bus (V₁ = 1, |V₂| = 0,96, X = 0,2)", "δ (°)", "P₁₂ (pu)", "Q₂ diterima (pu)", "∂P/∂δ (pu/rad)", "Catatan"],
                 [[f"kasus {i + 1}", ind(d, 0), ind(V1_2B * V2_2B * math.sin(d * DEG) / X_2B, 4), ind((V1_2B * V2_2B * math.cos(d * DEG) - V2_2B ** 2) / X_2B, 4), ind(V1_2B * V2_2B * math.cos(d * DEG) / X_2B, 4), ket] for i, (d, ket) in enumerate([(0, "tanpa aliran P; Q₂ = (V₂ − V₂²)/X: bus 2 menerima Q"), (12, "kasus contoh"), (30, "beban sedang"), (60, "mendekati batas; Jacobian mengecil"), (90, "P_maks; ∂P/∂δ = 0, NR singular")])])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> menaikkan δ menaikkan P tetapi menurunkan Q yang diterima bus 2 dan menurunkan kemiringan ∂P/∂δ; di 90° kemiringan nol sehingga Newton–Raphson tidak dapat melangkah: batas statis sekaligus batas konvergensi. Soal C3, C4, dan C10 memakai Persamaan (3).")
    m += bagian(3, "m-persamaan", "Persamaan<br>Aliran Daya",
                "Menggabungkan I = Y_bus V dengan S = V I* menghasilkan persamaan daya tiap bus dalam tegangan dan sudut semua bus: nonlinear, tetapi berstruktur jelas. Persamaan (3) menuliskannya dalam bentuk polar dan bentuk dua bus yang dapat dihitung dengan tangan; Gambar 3 memperlihatkan kurva P–δ dan Q–δ yang menjadi intuisi operator sistem.",
                isi, "PERSAMAAN ALIRAN DAYA")

    # 04 — Gauss–Seidel
    isi = figure(4, "Konvergensi tegangan bus pada iterasi Gauss–Seidel sistem contoh", f"Mulai dari tebakan datar 1∠0°, tiap iterasi memperbarui V₂ lalu V₃ dengan nilai terbaru; tegangan turun cepat pada iterasi pertama lalu merapat secara linear ke solusi |V₂| = {ind(abs(V2F), 4)} dan |V₃| = {ind(abs(V3F), 4)} pu.", gambar4())
    isi += formula(4, "Iterasi Gauss–Seidel", r"V_i^{(k+1)} = \dfrac{1}{Y_{ii}}\left[\dfrac{P_i - jQ_i}{V_i^{(k)*}} - \sum_{k<i}Y_{ik}V_k^{(k+1)} - \sum_{k>i}Y_{ik}V_k^{(k)}\right], \qquad V_i^{pakai} = V_i^{(k)} + \alpha\left(V_i^{(k+1)} - V_i^{(k)}\right)",
                   rf"Sistem contoh, iterasi 1 bus 2 (V₁ = V₃ = 1∠0): \(V_2^{{(1)}} = \frac{{1}}{{-j15}}\left[\frac{{-0{{,}}8 + j0{{,}}4}}{{1}} - (j10\times1 + j5\times1)\right] = \frac{{-0{{,}}8 - j14{{,}}6}}{{-j15}} = {fmtc(V_GS1[1], 4)}\) → \(|V_2^{{(1)}}| = {ind(abs(V_GS1[1]), 4)}\) pu; bus 3 memakai V₂ yang baru: \(V_3^{{(1)}} = {fmtc(V_GS1[2], 4)}\), |V₃| = {ind(abs(V_GS1[2]), 4)}. Setelah konvergen: V₂ = {ind(abs(V2F), 4)}∠{ind(cmath.phase(V2F) / DEG, 2)}°, V₃ = {ind(abs(V3F), 4)}∠{ind(cmath.phase(V3F) / DEG, 2)}°. Kesalahan yang menyusut dengan faktor r = {ind(R_CONV, 1)} per iterasi memerlukan \(k = \ln(10^{{-4}}/0{{,}}1)/\ln 0{{,}}6 = {ind(K_CONV, 1)}\) iterasi.",
                   "Gauss–Seidel menyelesaikan persamaan bus i untuk V_i dengan menganggap tegangan bus lain diketahui (nilai terbaru), lalu bergerak ke bus berikutnya; satu putaran seluruh bus = satu iterasi. Beban dimasukkan sebagai P_i + jQ_i negatif. Untuk bus PV, Q_i dihitung dulu dari tegangan saat ini, lalu |V_i| hasil dikembalikan ke nilai tetapnya (hanya sudutnya dipakai). Metode ini sederhana dan hemat memori tetapi konvergen linear: jumlah iterasi tumbuh dengan ukuran sistem; faktor percepatan α 1,4–1,7 mempersingkatnya.",
                   [("V_i^{(k)*}", "Konjugat tegangan bus i pada iterasi sebelumnya"), ("\\alpha", "Faktor percepatan (1 = tanpa percepatan; 1,4–1,7 lazim)"), ("P_i + jQ_i", "Injeksi bersih: pembangkitan − beban (beban murni → negatif)")])
    isi += cards([
        ("1️⃣", "Langkah", "Tebakan datar V = 1∠0 → hitung V₂ baru → hitung V₃ dengan V₂ baru → periksa mismatch → ulangi.", None),
        ("⚙️", "Bus PV", "Q_i = −Im{V_i* Σ Y_ik V_k}; periksa batas; V_i hasil diskalakan ke |V_i| tetap; bila Q keluar batas → perlakukan sebagai PQ.", None),
        ("🚀", "Percepatan", "α > 1 'melompat' searah perubahan; terlalu besar (> 1,8) berosilasi; nilai optimum bergantung sistem.", None),
        ("🐢", "Konvergensi Linear", "Kesalahan berkurang dengan faktor tetap tiap iterasi: 20–100 iterasi untuk sistem besar; tidak sensitif terhadap tebakan awal.", None),
        ("⚠️", "Gagal Konvergen", "Beban melampaui batas statis, X terlalu besar, atau data salah (satuan, tanda Q): iterasi menyimpang atau berosilasi; periksa data dulu.", None),
        ("📜", "Sejarah", "Metode pertama komputer digital (1950-an, Ward–Hale); masih dipakai untuk tebakan awal NR dan sistem kecil/pendidikan.", None),
    ])
    isi += tabel(["Iterasi (sistem contoh, α = 1)", "|V₂| (pu)", "|V₃| (pu)", "Δ|V₂| terhadap iterasi sebelumnya", "Keterangan"],
                 [[str(k), ind(HIST[k][0], 5), ind(HIST[k][1], 5), ("—" if k == 0 else f"{abs(HIST[k][0] - HIST[k - 1][0]):.1e}"), ket] for k, ket in [(0, "tebakan datar"), (1, "langkah terbesar"), (2, ""), (3, ""), (5, ""), (10, "≈ konvergen 10⁻⁴"), (20, "konvergen 10⁻⁶")]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> selisih antar-iterasi menyusut dengan rasio hampir tetap: itulah konvergensi linear. Untuk tugas, kerjakan iterasi 1 dengan tangan (bilangan kompleks) lalu biarkan Python melanjutkan. Soal C5, C6, C8, dan C13 memakai Persamaan (4).")
    m += bagian(4, "m-gs", "Metode<br>Gauss–Seidel",
                "Cara paling sederhana menyelesaikan persamaan nonlinear adalah menebak, menghitung ulang, dan mengulang sampai tidak berubah. Persamaan (4) menuliskan pembaruan tegangan bus Gauss–Seidel beserta faktor percepatannya, dan Gambar 4 memperlihatkan bagaimana tegangan sistem contoh merapat ke solusi iterasi demi iterasi.",
                isi, "GAUSS–SEIDEL")

    # 05 — Newton–Raphson
    isi = figure(5, "Iterasi Newton–Raphson pada masalah dua bus: garis singgung menuju solusi", f"Mencari δ agar sin δ/X = {ind(P_NR, 1)} pu (X = {ind(X_NR, 1)}): dari δ = 0, tiap langkah menarik garis singgung kurva P(δ) dan melompat ke titik potongnya dengan P terjadwal; kesalahan dikuadratkan tiap langkah sehingga {len(NR) - 1} iterasi cukup untuk ketelitian 10⁻⁹.", gambar5())
    isi += formula(5, "Newton–Raphson, Fast Decoupled, dan Aliran Daya DC", r"\begin{bmatrix}\Delta P\\ \Delta Q\end{bmatrix} = \begin{bmatrix}\partial P/\partial\delta & \partial P/\partial|V|\\ \partial Q/\partial\delta & \partial Q/\partial|V|\end{bmatrix}\begin{bmatrix}\Delta\delta\\ \Delta|V|\end{bmatrix}; \quad \text{FDLF: } \Delta P/|V| = B'\Delta\delta,\ \Delta Q/|V| = B''\Delta|V|; \quad \text{DC: } P = B'\delta",
                   rf"Dua bus: \(P(\delta) = \sin\delta/X\), \(J = \cos\delta/X\); dari δ⁽⁰⁾ = 0: Δδ = ({ind(P_NR, 1)} − 0)/(1/{ind(X_NR, 1)}) = {ind(P_NR * X_NR, 2)} rad = {ind(NR[1], 3)}°, lalu {ind(NR[2], 4)}°, {ind(NR[3], 4)}° → solusi {ind(D_EXACT, 4)}°. Aliran daya DC sistem contoh (bus 1 slack): \(B' = \begin{{bmatrix}}{ind(B22, 0)} & {ind(B23, 0)}\\ {ind(B23, 0)} & {ind(B33, 0)}\end{{bmatrix}}\), P = [−0,8; −0,6] → δ₂ = {ind(D2_DC, 3)}°, δ₃ = {ind(D3_DC, 3)}° (AC: {ind(cmath.phase(V2F) / DEG, 3)}° dan {ind(cmath.phase(V3F) / DEG, 3)}°).",
                   "Newton–Raphson melinearkan persamaan aliran daya di sekitar tebakan saat ini lewat matriks Jacobian, menyelesaikan sistem linear untuk koreksi Δδ dan Δ|V|, lalu memperbarui; konvergensinya kuadratis (3–6 iterasi berapa pun ukuran sistem) tetapi tiap iterasi membangun dan memfaktorkan Jacobian. Fast decoupled (Stott–Alsaç) memakai decoupling P–δ/Q–V dan matriks B', B'' tetap sehingga tiap iterasi sangat murah. Aliran daya DC melangkah lebih jauh: R diabaikan, |V| = 1, sin δ ≈ δ, sehingga P = B'δ linear tanpa iterasi; dipakai untuk kontingensi massal dan pasar listrik, tanpa informasi Q dan tegangan.",
                   [("J", "Matriks Jacobian (2n_PQ + n_PV persegi)"), ("B', B''", "Matriks suseptansi tetap (−Im Y_bus tanpa shunt / dengan shunt)"), ("\\Delta P, \\Delta Q", "Mismatch daya terjadwal − terhitung")])
    isi += cards([
        ("🧮", "Jacobian", "Empat blok turunan parsial; untuk cabang reaktif ∂P_i/∂δ_k = −|V_i||V_k||Y_ik| cos(θ_ik − δ_i + δ_k); dibangun ulang tiap iterasi.", None),
        ("⚡", "Konvergensi Kuadratis", "Kesalahan 10⁻¹ → 10⁻² → 10⁻⁴ → 10⁻⁸: tiga–lima iterasi; tetapi tebakan awal buruk atau sistem dekat batas dapat menyimpang.", None),
        ("🚀", "Fast Decoupled", "Iterasi P–δ dan Q–V bergantian dengan B', B'' yang difaktorkan sekali; 10–20 iterasi murah; baku untuk studi keamanan daring.", None),
        ("📏", "Aliran Daya DC", "Linear, selalu 'konvergen', kesalahan aliran 5–10 %; untuk faktor distribusi, kontingensi N−1 massal, dan perhitungan pasar/transfer.", None),
        ("🔁", "Kontrol Tambahan", "Batas Q generator, tap trafo otomatis, pertukaran area, dan HVDC dimasukkan sebagai persamaan/penyesuaian tambahan tiap iterasi.", None),
        ("💻", "Perangkat Lunak", "PSS/E, PowerFactory, ETAP, PowerWorld, dan pustaka terbuka (pandapower, MATPOWER, PyPSA) memakai NR/FDLF dengan matriks sparse.", None),
    ])
    isi += tabel(["Metode", "Tiap iterasi", "Jumlah iterasi", "Ketelitian", "Kelebihan", "Kekurangan"], [
        ["Gauss–Seidel", "sangat murah (n bus)", "20–200 (linear)", "penuh (AC)", "sederhana, hemat memori, tahan tebakan buruk", "lambat pada sistem besar"],
        ["Newton–Raphson", "mahal (Jacobian + faktorisasi)", "3–6 (kuadratis)", "penuh (AC)", "cepat, tidak tergantung ukuran, baku industri", "peka tebakan awal; Jacobian singular dekat batas"],
        ["Fast decoupled", "murah (B', B'' tetap)", "8–20", "penuh (AC)", "sangat cepat untuk transmisi", "lemah bila R/X tinggi (distribusi)"],
        ["Aliran daya DC", "satu penyelesaian linear", "1", "P dan δ saja (±5–10 %)", "tanpa iterasi, selalu ada solusi", "tanpa Q, tegangan, dan rugi"],
        ["Sweep radial (Modul 12)", "murah", "2–5", "penuh (AC)", "distribusi radial ribuan bus", "hanya jaringan tanpa loop"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> pilihan metode mengikuti pertanyaan: hasil operasi teliti → NR/FDLF; ribuan kontingensi dalam hitungan detik → DC; penyulang radial → sweep; sistem kecil untuk belajar → GS. Soal C12 dan C15 memakai Persamaan (5).")
    m += bagian(5, "m-nr", "Newton–Raphson, Fast Decoupled,<br>dan Aliran Daya DC",
                "Gauss–Seidel cukup untuk tiga bus, tetapi sistem ribuan bus memerlukan metode yang konvergen dalam beberapa langkah. Persamaan (5) memperkenalkan Newton–Raphson dengan matriks Jacobian, penyederhanaannya fast decoupled, dan bentuk linearnya aliran daya DC; Gambar 5 memperlihatkan geometri garis singgung yang membuat NR konvergen kuadratis.",
                isi, "NEWTON–RAPHSON")

    # 06 — hasil & aplikasi
    isi = figure(6, "Keluaran aliran daya sistem contoh setelah konvergen", f"Dari tegangan bus dihitung aliran tiap cabang dan daya slack: bus 1 memasok {fmtc(S_SLACK, 3)} pu untuk beban 1,4 + j0,7 pu; selisih daya reaktif adalah rugi I²X saluran. Tegangan terendah di bus {2 if abs(V2F) < abs(V3F) else 3} ({ind(min(abs(V2F), abs(V3F)), 4)} pu).", gambar6())
    isi += formula(6, "Aliran Cabang, Rugi, dan Neraca Daya", r"\bar I_{ik} = (\bar V_i - \bar V_k)\,y_{ik} + \bar V_i\,y_{sh}, \qquad \bar S_{ik} = \bar V_i\,\bar I_{ik}^{*}, \qquad \bar S_{rugi,ik} = \bar S_{ik} + \bar S_{ki}, \qquad P_{slack} = \sum P_{beban} + \sum P_{rugi} - \sum P_{gen}",
                   rf"Sistem contoh: \(I_{{12}} = (V_1 - V_2)y_{{12}} = {fmtc(I12, 4)}\) pu, \(S_{{12}} = V_1 I_{{12}}^* = {fmtc(S12, 4)}\) pu; \(S_{{13}} = {fmtc(S13, 4)}\), \(S_{{23}} = {fmtc(S23, 4)}\) pu; P slack \(= {ind(S_SLACK.real, 4)}\) pu (tanpa R rugi P = 0 hingga pembulatan), Q slack \(= {ind(S_SLACK.imag, 4)}\) pu (rugi Q = {ind(S_SLACK.imag - 0.7, 4)} pu). Dengan R = 0,02 pada saluran 1–2 dan V₂ = 0,96∠−12°: \(S_{{12}} = {fmtc(S1_R, 4)}\) pu, rugi {ind(LOSS_R, 2)} MW.",
                   "Tegangan bus hanyalah setengah jawaban; yang dibaca perencana adalah aliran tiap cabang dibandingkan kapasitasnya (pembebanan %), rugi total, tegangan di luar 0,95–1,05 pu, dan daya reaktif generator terhadap batasnya. Studi kontingensi mengulang aliran daya dengan satu elemen dilepas (N−1) untuk memastikan tidak ada beban lebih atau tegangan rendah; studi kompensasi menambah kapasitor di bus bertegangan rendah dan melihat hasilnya; studi pengembangan (Modul 12) memakainya untuk tahun-tahun mendatang.",
                   [("y_{sh}", "Setengah admitansi pengisian saluran di ujung i"), ("\\bar S_{ik}, \\bar S_{ki}", "Aliran dari i ke k dan dari k ke i (tanda berlawanan)"), ("P_{gen}", "Pembangkitan bus PV yang ditetapkan")])
    isi += cards([
        ("📊", "Laporan Baku", "Tabel bus (|V|, δ, P_gen, Q_gen, P_load, Q_load), tabel cabang (P, Q dari–ke, rugi, % pembebanan), ringkasan (total gen, beban, rugi, slack).", None),
        ("🚨", "Pelanggaran", "Tegangan < 0,95 atau > 1,05 pu; cabang > 100 % (atau > 80 % untuk cadangan N−1); Q generator di batas: pemicu tindakan.", None),
        ("🔁", "Kontingensi N−1", "Lepas satu saluran/trafo/generator, ulangi aliran daya; sistem harus tetap tanpa pelanggaran; ribuan kasus dengan DC lalu yang kritis dengan AC.", None),
        ("🔋", "Kompensasi", "Kapasitor di bus rendah (Modul 10): Q_load turun → |V| naik → rugi turun; aliran daya adalah alat menilainya sebelum membeli.", None),
        ("☀️", "Pembangkit Tersebar", "PLTS sebagai P negatif di bus PQ: siang hari aliran membalik, tegangan ujung naik; hosting capacity ditentukan dengan aliran daya berulang.", None),
        ("🏭", "Rangkuman Mata Kuliah", "Dari pembangkit (Modul 1–4) lewat transmisi (7–9) dan distribusi (10–12) ke SLD dan aliran daya (13–14): kini seluruh rantai dapat dihitung.", None),
    ])
    isi += tabel(["Cabang sistem contoh", "Dari → ke", "S kirim (pu)", "S terima (pu)", "|I| (pu)", "Rugi Q = I²X (pu)"],
                 [[nama, arah, fmtc(s, 4), fmtc(-(s - (abs(i_) ** 2 * x_) * 1j), 4), ind(abs(i_), 4), ind(abs(i_) ** 2 * x_, 4)] for nama, arah, s, i_, x_ in [("1–2", "1 → 2", S12, I12, 0.1), ("1–3", "1 → 3", S13, I13, 0.25), ("2–3", "2 → 3", S23, I23, 0.2)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> saluran 1–2 (reaktansi terkecil) membawa aliran terbesar: daya memilih jalur berimpedansi rendah, bukan jalur terpendek; rugi Q tiap cabang = |I|²X dan jumlahnya = Q slack − Q beban. Soal C7, C9, dan C14 memakai Persamaan (6).")
    m += bagian(6, "m-hasil", "Membaca Hasil<br>dan Aplikasi Aliran Daya",
                "Setelah iterasi konvergen, tegangan bus diterjemahkan menjadi aliran tiap cabang, rugi, dan daya slack, lalu dibandingkan dengan batas tegangan dan kapasitas: inilah keluaran yang dipakai operator, perencana, dan konsultan. Persamaan (6) memberi rumus aliran cabang dan neraca daya, dan Gambar 6 merangkum hasil sistem contoh.",
                isi, "HASIL DAN APLIKASI")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Menyusun Y_bus Tiga Bus dengan Aturan Inspeksi", "cvYbus",
                     [("sl_yb_x12", "v_yb_x12", "X saluran 1–2 (pu)", 0.05, 0.5, 0.01, 0.1, "0.10"), ("sl_yb_x13", "v_yb_x13", "X saluran 1–3 (pu)", 0.05, 0.5, 0.01, 0.25, "0.25"), ("sl_yb_x23", "v_yb_x23", "X saluran 2–3 (pu)", 0.05, 0.5, 0.01, 0.2, "0.20"), ("sl_yb_r", "v_yb_r", "Rasio R/X semua saluran", 0, 0.5, 0.05, 0, "0.00"), ("sl_yb_b", "v_yb_b", "Admitansi pengisian jB/2 tiap ujung (pu)", 0, 0.1, 0.01, 0, "0.00")],
                     "btnYbus", "toggleYbus", "ybusInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Kiri jaringan tiga bus dengan bus yang sedang 'diinspeksi' berkedip kuning dan cabang-cabangnya disorot; kanan matriks Y_bus 3×3 (diagonal kuning, luar-diagonal cyan) beserta besarnya.<br>Amati: (1) <strong style=\"color:var(--cyan)\">R/X = 0</strong>: semua elemen imajiner murni, jumlah baris nol. (2) Naikkan R/X: muncul bagian nyata (konduktansi). (3) Tambahkan jB/2: hanya diagonal berubah, jumlah baris tidak lagi nol. Soal C1, C2, dan C11.")
    isi += anim_panel(2, "amber", r"Persamaan Aliran Daya Dua Bus: P, Q, dan Rugi terhadap Sudut δ", "cvDuaBus",
                      [("sl_db_v2", "v_db_v2", "|V₂| (pu)", 0.85, 1.05, 0.01, 0.96, "0.96"), ("sl_db_x", "v_db_x", "X saluran (pu)", 0.05, 0.6, 0.01, 0.2, "0.20"), ("sl_db_r", "v_db_r", "R saluran (pu)", 0, 0.1, 0.005, 0.02, "0.020"), ("sl_db_dmax", "v_db_dmax", "Rentang δ (°)", 20, 90, 5, 40, "40")],
                      "btnDuaBus", "toggleDuaBus", "duaBusInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Hijau P kirim (tebal) dan terima (putus), kuning Q kirim dan terima, merah rugi (×10) terhadap sudut δ; garis vertikal berjalan menandai δ saat ini dengan nilainya.<br>Amati: (1) <strong style=\"color:var(--amber)\">R = 0</strong>: P kirim = P terima (tanpa rugi), Q₂ = (V₁V₂ cos δ − V₂²)/X. (2) Rentang 90°: P mencapai maksimum V₁V₂/X. (3) Turunkan |V₂|: Q₂ makin negatif (bus 2 harus memasok Q) — dasar kompensasi. Soal C3, C4, C7, dan C10.")
    isi += anim_panel(3, "green", r"Iterasi Gauss–Seidel pada Sistem Tiga Bus Contoh", "cvGaussSeidel",
                      [("sl_gs_p2", "v_gs_p2", "Beban P₂ (pu)", 0.1, 2.5, 0.05, 0.8, "0.80"), ("sl_gs_q2", "v_gs_q2", "Beban Q₂ (pu)", 0, 1.5, 0.05, 0.4, "0.40"), ("sl_gs_p3", "v_gs_p3", "Beban P₃ (pu)", 0.1, 2.0, 0.05, 0.6, "0.60"), ("sl_gs_alpha", "v_gs_alpha", "Faktor percepatan α", 0.6, 2.0, 0.05, 1.0, "1.00"), ("sl_gs_n", "v_gs_n", "Jumlah iterasi", 2, 40, 1, 12, "12")],
                      "btnGaussSeidel", "toggleGaussSeidel", "gaussSeidelInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Kurva |V₂| (cyan) dan |V₃| (kuning) tiap iterasi digambar bertahap; panel kanan mencatat mismatch |ΔP₂| dan iterasi saat toleransi 10⁻⁴ tercapai.<br>Amati: (1) <strong style=\"color:var(--green)\">α = 1</strong>: konvergensi linear ± 10 iterasi. (2) α = 1,5: lebih cepat; α = 1,9: berosilasi. (3) Naikkan beban P₂ ke > 2 pu: tegangan runtuh dan iterasi tidak konvergen (batas statis). Soal C5, C6, C8, C9, dan C13.")
    isi += anim_panel(4, "pink", r"Newton–Raphson vs Iterasi Titik-Tetap pada Masalah Dua Bus", "cvNewton",
                      [("sl_nr_p", "v_nr_p", "P terjadwal (pu)", 0.2, 4.0, 0.05, 1.2, "1.20"), ("sl_nr_x", "v_nr_x", "X saluran (pu)", 0.1, 0.6, 0.01, 0.3, "0.30"), ("sl_nr_d0", "v_nr_d0", "Tebakan awal δ⁽⁰⁾ (°)", -30, 80, 1, 0, "0"), ("sl_nr_v2", "v_nr_v2", "|V₂| (pu)", 0.85, 1.05, 0.01, 1.0, "1.00")],
                      "btnNewton", "toggleNewton", "newtonInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Kurva P(δ) cyan, target hijau putus; langkah Newton–Raphson digambar sebagai garis singgung kuning bertahap; panel kanan mencantumkan δ_k dan mismatch tiap langkah serta jumlah langkah iterasi titik-tetap (lambat) sebagai pembanding.<br>Amati: (1) <strong style=\"color:var(--pink)\">Konvergensi kuadratis</strong>: mismatch 10⁻¹ → 10⁻³ → 10⁻⁷. (2) Tebakan awal 70°: langkah melompat ke sisi lain karena Jacobian kecil. (3) P > V₂/X: tidak ada solusi, NR menyimpang. Soal C10 dan C12.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 3 atur beban 0,8 + j0,4 dan 0,6 + j0,3 dengan α = 1 dan cocokkan |V₂| iterasi 1 = {ind(HIST[1][0], 4)} dan nilai akhir {ind(abs(V2F), 4)} dengan Bagian 04; lalu cari α yang memberi konvergensi tercepat. Pada Animasi 4 atur P = 1,2, X = 0,3 dan cocokkan urutan δ dengan Gambar 5.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Aliran Daya",
                "Susun Y_bus sambil mengubah impedansi, putar sudut dua bus dan lihat P, Q, dan rugi, jalankan Gauss–Seidel dengan faktor percepatan berbeda, lalu bandingkan Newton–Raphson dengan iterasi titik-tetap. Empat animasi ini memvisualkan Persamaan (2)–(5) pada sistem contoh.",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (pu, MW, derajat) dan jumlah desimal yang diminta (banyak soal pu meminta 5 desimal).")
    isi += kode("Cell 1 — Menyusun Y_bus dan Persamaan Dua Bus", '''import numpy as np

def ybus(n, cabang, shunt=None):
    """cabang: daftar (i, k, z) dengan indeks bus 0..n-1; shunt: dict {bus: y_shunt}. Persamaan 2."""
    Y = np.zeros((n, n), dtype=complex)
    for i, k, z in cabang:
        y = 1/z; Y[i, i] += y; Y[k, k] += y; Y[i, k] -= y; Y[k, i] -= y
    for i, ys in (shunt or {}).items(): Y[i, i] += ys
    return Y

Y = ybus(3, [(0, 1, 0.1j), (0, 2, 0.25j), (1, 2, 0.2j)])
print(np.round(Y, 3))
print(f"|Y11| = {abs(Y[0,0]):.4f}, |Y12| = {abs(Y[0,1]):.4f}; jumlah baris 1 = {Y[0].sum():.4f} (nol tanpa shunt)")
Yr = ybus(3, [(0, 1, 0.02+0.1j), (0, 2, 0.05+0.25j), (1, 2, 0.04+0.2j)], {0: 0.06j, 1: 0.06j, 2: 0.06j})
print(f"dengan R dan charging: Y33 = {Yr[2,2]:.4f}, |Y33| = {abs(Yr[2,2]):.4f}")

# Persamaan 3: dua bus tanpa rugi
V1, V2, X = 1.0, 0.96, 0.2
for d in [0, 12, 30, 60, 90]:
    dr = np.radians(d)
    print(f"delta {d:2d} deg: P12 = {V1*V2*np.sin(dr)/X:.5f}, Q2 = {(V1*V2*np.cos(dr) - V2**2)/X:.5f}, dP/ddelta = {V1*V2*np.cos(dr)/X:.5f} pu/rad")''')
    isi += kode("Cell 2 — Gauss–Seidel Sistem Tiga Bus (dengan faktor percepatan)", '''import numpy as np
import matplotlib.pyplot as plt

Y = np.array([[-14j, 10j, 4j], [10j, -15j, 5j], [4j, 5j, -9j]])
S = np.array([0, -(0.8+0.4j), -(0.6+0.3j)])          # injeksi bersih; beban negatif; bus 0 slack
def gauss_seidel(Y, S, pq, n_iter=30, alpha=1.0, tol=1e-6):
    V = np.ones(len(S), dtype=complex); hist = [np.abs(V).copy()]
    for it in range(n_iter):
        for i in pq:                                                  # Persamaan 4
            s = sum(Y[i, k]*V[k] for k in range(len(S)) if k != i)
            v_new = (np.conj(S[i])/np.conj(V[i]) - s)/Y[i, i]
            V[i] = V[i] + alpha*(v_new - V[i])
        hist.append(np.abs(V).copy())
        I = Y @ V; dS = S[pq] - V[pq]*np.conj(I[pq])
        if np.max(np.abs(dS)) < tol: break
    return V, np.array(hist), it+1

V, hist, n = gauss_seidel(Y, S, [1, 2])
for i, v in enumerate(V): print(f"V{i+1} = {abs(v):.5f} < {np.degrees(np.angle(v)):.3f} deg")
print(f"konvergen dalam {n} iterasi; |V2| iterasi 1 = {hist[1][1]:.5f}, |V3| iterasi 1 = {hist[1][2]:.5f}")
for a in [1.0, 1.4, 1.6]:
    print(f"alpha {a}: {gauss_seidel(Y, S, [1, 2], alpha=a)[2]} iterasi")
plt.figure(figsize=(7, 3.5)); plt.plot(hist[:, 1], 'o-', label='|V2|'); plt.plot(hist[:, 2], 's-', label='|V3|'); plt.xlabel('iterasi'); plt.ylabel('pu'); plt.legend(); plt.grid(True); plt.show()''')
    isi += kode("Cell 3 — Newton–Raphson Dua Bus dan Aliran Daya DC Tiga Bus", '''import numpy as np

# NR dua bus tanpa rugi: cari delta agar sin(delta)/X = P (Persamaan 5)
P, X, d = 1.2, 0.3, np.radians(0.0)
for k in range(8):
    f = np.sin(d)/X; J = np.cos(d)/X; dP = P - f
    print(f"k={k}: delta = {np.degrees(d):9.5f} deg, P_calc = {f:.6f}, mismatch = {dP:.2e}, J = {J:.4f}")
    if abs(dP) < 1e-9: break
    d += dP/J
print(f"solusi eksak: {np.degrees(np.arcsin(P*X)):.5f} deg")

# satu iterasi NR soal: X = 0.25, delta0 = 10 deg, P = 0.9
d0, Xs, Ps = np.radians(10), 0.25, 0.9
print(f"delta(1) = {np.degrees(d0 + (Ps - np.sin(d0)/Xs)/(np.cos(d0)/Xs)):.4f} deg")

# aliran daya DC tiga bus (bus 1 slack): [B'][delta] = [P]
x12, x13, x23 = 0.1, 0.25, 0.2
Bp = np.array([[1/x12 + 1/x23, -1/x23], [-1/x23, 1/x13 + 1/x23]])
Pinj = np.array([-0.8, -0.6])
delta = np.linalg.solve(Bp, Pinj)
print(f"B' = {Bp.tolist()}; delta2 = {np.degrees(delta[0]):.4f} deg, delta3 = {np.degrees(delta[1]):.4f} deg")
print(f"aliran DC: P12 = {(0 - delta[0])/x12:.4f}, P13 = {(0 - delta[1])/x13:.4f}, P23 = {(delta[0] - delta[1])/x23:.4f} pu")''')
    isi += kode("Cell 4 — Aliran Cabang, Rugi, dan Neraca Daya dari Hasil Aliran Daya", '''import numpy as np

# tegangan hasil Cell 2 (sistem contoh, tanpa R)
Y = np.array([[-14j, 10j, 4j], [10j, -15j, 5j], [4j, 5j, -9j]])
S = np.array([0, -(0.8+0.4j), -(0.6+0.3j)]); V = np.ones(3, dtype=complex)
for it in range(40):
    for i in [1, 2]:
        s = sum(Y[i, k]*V[k] for k in range(3) if k != i); V[i] = (np.conj(S[i])/np.conj(V[i]) - s)/Y[i, i]
cab = [(0, 1, 0.1j), (0, 2, 0.25j), (1, 2, 0.2j)]
tot_rugi = 0
for i, k, z in cab:                                                  # Persamaan 6
    I = (V[i] - V[k])/z; Sik = V[i]*np.conj(I); Ski = V[k]*np.conj(-I); rugi = Sik + Ski; tot_rugi += rugi
    print(f"cabang {i+1}-{k+1}: I = {abs(I):.4f} pu, S{i+1}{k+1} = {Sik:.4f}, S{k+1}{i+1} = {Ski:.4f}, rugi = {rugi:.4f} pu")
I = Y @ V; S_slack = V[0]*np.conj(I[0])
print(f"daya slack = {S_slack:.4f} pu; beban total = {-(S[1] + S[2]):.2f}; rugi total = {tot_rugi:.4f} pu")

# soal: rugi saluran dengan R dari tegangan hasil
V1, V2, Z = 1+0j, 0.96*np.exp(1j*np.radians(-12)), 0.02+0.1j
I = (V1 - V2)/Z; print(f"I = {I:.4f} pu, P_rugi = {abs(I)**2*Z.real*100:.4f} MW, P12 = {(V1*np.conj(I)).real*100:.4f} MW")
# soal: iterasi konvergensi linear
print(f"k = ln(1e-4/0.1)/ln(0.6) = {np.log(1e-4/0.1)/np.log(0.6):.4f} iterasi")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: Y₁₁ = −j14, P₁₂ (12°) = {ind(P_2B, 4)}, |V₂| iterasi 1 = {ind(HIST[1][0], 4)}, hasil akhir {ind(abs(V2F), 4)}∠{ind(cmath.phase(V2F) / DEG, 2)}°, NR {ind(D_EXACT, 4)}°, δ₂ DC = {ind(D2_DC, 3)}°, S slack {fmtc(S_SLACK, 3)}. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: penyusunan Y_bus dan persamaan dua bus, Gauss–Seidel dengan faktor percepatan, Newton–Raphson dan aliran daya DC, serta aliran cabang dan neraca daya. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 6 (aliran daya: Y_bus, Gauss–Seidel, Newton–Raphson, fast decoupled dengan contoh numerik lengkap): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 6 (aliran daya: jenis bus, Y_bus, Gauss–Seidel, NR, aliran daya DC, kontrol) dengan PowerWorld.")
    refs += pm_ref(3, "violet", "168,85,247", "J. J. Grainger &amp; W. D. Stevenson", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 9 (aliran daya) dan Bab 7 (Y_bus, Z_bus) sebagai pendalaman matematis.")
    refs += pm_ref(4, "green", "0,224,158", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab aliran daya pengantar dengan sistem kecil; pustaka utama RPS.")
    refs += pm_ref(5, "pink", "236,72,153", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 6 (aliran daya secara konseptual: mengapa nonlinear, apa arti slack, bagaimana operator membacanya).")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk matriks admitansi, persamaan aliran daya, Gauss–Seidel, Newton–Raphson, fast decoupled, aliran daya DC, dan pembacaan hasil. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> pustaka terbuka <em>pandapower</em> (Python), <em>MATPOWER</em> (MATLAB/Octave), dan <em>PyPSA</em> memuat penyelesai NR/FDLF/DC beserta kasus uji IEEE 9, 14, 30, dan 118 bus yang dapat dipakai untuk latihan lanjutan; dokumentasi PSS/E dan PowerFactory menjelaskan pilihan metode dan kontrol dalam praktik utilitas. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Y_ii = Σ y_ik</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">V_i = (1/Y_ii)[(P − jQ)/V* − Σ Y_ik V_k]</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">P = V₁V₂ sin δ/X</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Δδ = ΔP/J</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">[B'][δ] = [P]</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Analisis</em><br>Aliran Daya</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar elemen Y_bus, persamaan dua bus (P, Q, Jacobian), iterasi Gauss–Seidel dengan bilangan kompleks, faktor percepatan, konvergensi, rugi dan aliran cabang dari tegangan hasil, daya slack, satu langkah Newton–Raphson, dan aliran daya DC tiga bus. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Tiga jenis bus dalam analisis aliran daya adalah...",
     ["Bus AC, bus DC, dan bus netral", "Bus pembangkit, bus transmisi, dan bus distribusi", "Bus primer, sekunder, dan tersier", "Slack (|V| dan δ diketahui; P, Q dihitung), PV (P dan |V| diketahui; Q, δ dihitung), dan PQ (P dan Q diketahui; |V|, δ dihitung)"],
     "Jenis bus"),
    ("Bus <strong>slack</strong> diperlukan karena...",
     ["Rugi jaringan baru diketahui setelah solusi, sehingga satu bus harus bebas menyeimbangkan pembangkitan dengan beban + rugi, sekaligus menjadi acuan sudut", "Semua generator harus mempunyai tegangan yang sama", "Beban selalu lebih besar daripada pembangkitan", "Y_bus tidak dapat disusun tanpa bus slack"],
     "Peran slack"),
    ("Aturan inspeksi untuk menyusun <strong>Y_bus</strong>:",
     ["Y_ii = jumlah impedansi cabang, Y_ij = impedansi cabang i–j", "Y_ii = 0, Y_ij = y_ij", "Y_ii = jumlah admitansi semua cabang (dan shunt) yang terhubung ke bus i; Y_ij = −y_ij (negatif admitansi cabang i–j)", "Y_ii = 1/Σ impedansi, Y_ij = 1/z_ij"],
     "Aturan inspeksi Y_bus"),
    ("Persamaan aliran daya harus diselesaikan secara iteratif karena...",
     ["Y_bus terlalu besar untuk dibalik", "Persamaannya nonlinear terhadap tegangan dan sudut (hasil kali |V_i||V_k| dan fungsi sinus/kosinus)", "Beban selalu berubah setiap detik", "Slack bus tidak diketahui"],
     "Nonlinearitas"),
    ("Metode <strong>Gauss–Seidel</strong> dicirikan oleh...",
     ["Matriks Jacobian yang dibangun tiap iterasi", "Konvergensi kuadratis dalam 3–5 iterasi", "Penyelesaian linear satu langkah", "Pembaruan tegangan bus satu per satu memakai nilai terbaru; sederhana dan hemat memori, tetapi konvergensi linear (lambat) dan sering perlu faktor percepatan"],
     "Gauss–Seidel"),
    ("Metode <strong>Newton–Raphson</strong> dicirikan oleh...",
     ["Melinearkan persamaan lewat matriks Jacobian dan konvergen kuadratis dalam 3–6 iterasi, tidak bergantung ukuran sistem; metode baku perangkat lunak", "Tidak memerlukan turunan", "Hanya berlaku untuk sistem radial", "Konvergensi linear yang lambat"],
     "Newton–Raphson"),
    ("<strong>Mismatch</strong> daya ΔP_i adalah...",
     ["Selisih daya antara dua bus yang bertetangga", "Rugi daya saluran i", "P_i terjadwal − P_i terhitung dari tegangan saat ini; iterasi berhenti bila maks |ΔP|, |ΔQ| < toleransi", "Daya yang dipasok bus slack"],
     "Mismatch dan konvergensi"),
    ("Pada bus <strong>PV</strong>, bila daya reaktif generator hasil hitung melampaui batas Q_maks...",
     ["Iterasi dihentikan karena tidak ada solusi", "Bus dialihkan menjadi PQ dengan Q = Q_maks dan |V| dilepas (tidak lagi tertahan)", "Tegangan bus dinaikkan agar Q turun", "Beban di bus itu dikurangi"],
     "Batas Q bus PV"),
    ("Asumsi <strong>aliran daya DC</strong> adalah...",
     ["Sistem memakai arus searah", "Semua bus PV", "Y_bus diagonal", "R diabaikan, |V| = 1 pu, sin δ ≈ δ, sehingga P = B'δ linear tanpa iterasi; cepat untuk kontingensi massal tetapi tanpa Q dan tegangan"],
     "Aliran daya DC"),
    ("Metode <strong>fast decoupled</strong> memanfaatkan...",
     ["Sifat sistem transmisi bahwa P peka terhadap δ dan Q peka terhadap |V|, sehingga Jacobian dipisah menjadi B' dan B'' tetap; tiap iterasi murah walau jumlahnya lebih banyak", "Resistansi yang jauh lebih besar daripada reaktansi", "Tegangan yang sama di semua bus", "Ketiadaan bus slack"],
     "Fast decoupled"),
]

COMP_EZ_LABELS = ["|Y₁₁| dari reaktansi cabang", "|Y₁₂| dari R + jX", "P₁₂ = V₁V₂ sin δ/X", "Q₂ saluran dua bus", "Satu iterasi Gauss–Seidel (|V₂⁽¹⁾|)",
                  "Faktor percepatan", "Rugi saluran dari V hasil (MW)", "Jumlah iterasi konvergensi linear", "Daya slack (neraca daya)", "Jacobian ∂P/∂δ"]
COMP_HARD_LABELS = ["|Y₃₃| dengan admitansi pengisian", "Satu iterasi Newton–Raphson (δ⁽¹⁾)", "Dua iterasi Gauss–Seidel (|V₂⁽²⁾|)",
                    "P₁₂ dari V₁·I* (MW)", "Aliran daya DC tiga bus (|δ₂|)"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 0, 2: 3, 3: 1}
# kawasan industri tiga bus: bus 1 GI (slack), bus 2 pabrik A (PQ 1,0 + j0,6), bus 3 pabrik B + PLTS (PQ 0,7 + j0,3); saluran j0,08, j0,16, j0,12
ZF12, ZF13, ZF23 = 0.08j, 0.16j, 0.12j
YF12, YF13, YF23 = 1 / ZF12, 1 / ZF13, 1 / ZF23
YF = [[YF12 + YF13, -YF12, -YF13], [-YF12, YF12 + YF23, -YF23], [-YF13, -YF23, YF13 + YF23]]
SF = [None, complex(1.0, 0.6), complex(0.7, 0.3)]


def gs_forum(n_iter, s_load=SF, alpha=1.0):
    V = [1 + 0j, 1 + 0j, 1 + 0j]
    for _ in range(n_iter):
        for i in (1, 2):
            s = sum(YF[i][j] * V[j] for j in range(3) if j != i)
            v_new = ((-s_load[i]).conjugate() / V[i].conjugate() - s) / YF[i][i]
            V[i] = V[i] + alpha * (v_new - V[i])
    return V


VF1 = gs_forum(1)
VFC = gs_forum(60)
IF12 = (1 - VFC[1]) * YF12
IF13 = (1 - VFC[2]) * YF13
IF23 = (VFC[1] - VFC[2]) * YF23
SF12 = 1 * IF12.conjugate()
SF13 = 1 * IF13.conjugate()
SF23 = VFC[1] * IF23.conjugate()
SF_SLACK = SF12 + SF13
# dengan kapasitor 0,4 pu di bus 2
SF_CAP = [None, complex(1.0, 0.2), complex(0.7, 0.3)]
VFCAP = gs_forum(60, SF_CAP)
# DC
BF22 = 1 / 0.08 + 1 / 0.12
BF23 = -1 / 0.12
BF33 = 1 / 0.16 + 1 / 0.12
DETF = BF22 * BF33 - BF23 ** 2
DF2 = (-1.0 * BF33 - BF23 * -0.7) / DETF / DEG
DF3 = (BF22 * -0.7 - BF23 * -1.0) / DETF / DEG

FQ_JUDUL = [
    "Susun Y_bus kawasan industri tiga bus dan tuliskan persamaan aliran daya bus 2 dan 3: berapa persamaan, berapa tak diketahui?",
    "Kerjakan iterasi pertama Gauss–Seidel untuk V₂ dan V₃ dengan tangan, lalu lanjutkan di Python sampai konvergen: berapa tegangan kedua pabrik?",
    "Baca hasilnya: bus mana yang di bawah 0,95 pu, berapa daya slack dan aliran tiap saluran, dan apakah kapasitor 0,4 pu di pabrik A menyelesaikan masalah?",
]
FQ_RINGKAS = [
    "Aturan inspeksi (Persamaan 2): y = 1/jX untuk j0,08, j0,16, j0,12 → Y_ii dan Y_ij; jenis bus (Persamaan 1): slack GI, PQ pabrik A dan B; 4 persamaan (P₂, Q₂, P₃, Q₃) untuk |V₂|, δ₂, |V₃|, δ₃; bentuk polar Persamaan 3.",
    f"Persamaan 4 dengan V⁽⁰⁾ = 1∠0: V₂⁽¹⁾ dari (−1,0 + j0,6)/1 − (Y₂₁ + Y₂₃)·1 dibagi Y₂₂; V₃⁽¹⁾ memakai V₂⁽¹⁾ baru; lanjutkan di Python (Cell 2) sampai |ΔS| < 10⁻⁶; catat jumlah iterasi dengan α = 1 dan 1,5.",
    "Persamaan 6: I_ij = (V_i − V_j)y_ij, S_ij = V_i I_ij*, S slack, rugi Q; bandingkan |V| dengan 0,95; ulangi aliran daya dengan Q₂ = 0,6 − 0,4 = 0,2 pu (kapasitor); bahas alternatif PLTS bus 3 sebagai PV/bus dengan P negatif dan aliran daya DC untuk sudut.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Sebuah kawasan industri dipasok dari <b>GI (bus 1, dianggap slack 1∠0° pu)</b> lewat dua saluran 20 kV ke <b>pabrik A (bus 2, beban 1,0 + j0,6 pu)</b> dan <b>pabrik B (bus 3, beban 0,7 + j0,3 pu)</b>; kedua pabrik juga terhubung langsung. Reaktansi saluran (dasar 10 MVA): z₁₂ = j0,08, z₁₃ = j0,16, z₂₃ = j0,12 pu; resistansi diabaikan. Susun Y_bus dengan aturan inspeksi (Persamaan 2), tetapkan jenis tiap bus (Persamaan 1), dan tuliskan persamaan aliran daya P dan Q untuk bus 2 dan 3 dalam bentuk polar (Persamaan 3). Berapa persamaan dan berapa tak diketahui? Mengapa GI dijadikan slack dan bukan pabrik?",
            ["y = 1/jX", "Y_ii = Σ y, Y_ij = −y_ij", "2 n_PQ persamaan"],
            "Elemen Y₂₂ dan jumlah persamaan/tak diketahui sistem ini adalah...",
            [f"Y₂₂ = −j({ind(1 / 0.08, 1)} + {ind(1 / 0.12, 3)}) = −j{ind(abs(YF[1][1]), 3)} pu; 4 persamaan (P₂, Q₂, P₃, Q₃) untuk 4 tak diketahui (|V₂|, δ₂, |V₃|, δ₃)", f"Y₂₂ = j(0,08 + 0,12) = j0,20 pu; 6 persamaan untuk 6 tak diketahui", f"Y₂₂ = −j{ind(1 / 0.08, 1)} pu (hanya saluran ke GI); 2 persamaan", f"Y₂₂ = −j{ind(abs(YF[1][1]), 3)} pu; 3 persamaan untuk 3 bus"],
            f"✅ Tepat! \\(y_{{12}} = -j{ind(1 / 0.08, 1)}\\), \\(y_{{13}} = -j{ind(1 / 0.16, 2)}\\), \\(y_{{23}} = -j{ind(1 / 0.12, 3)}\\) → \\(Y_{{11}} = -j{ind(abs(YF[0][0]), 3)}\\), \\(Y_{{22}} = -j{ind(abs(YF[1][1]), 3)}\\), \\(Y_{{33}} = -j{ind(abs(YF[2][2]), 3)}\\), \\(Y_{{12}} = j{ind(1 / 0.08, 1)}\\), \\(Y_{{13}} = j{ind(1 / 0.16, 2)}\\), \\(Y_{{23}} = j{ind(1 / 0.12, 3)}\\) pu. Bus 1 slack (GI: tegangan dijaga OLTC, daya menyesuaikan), bus 2 dan 3 PQ → 2 × 2 = 4 persamaan nonlinear untuk 4 tak diketahui. Pabrik tidak dapat menjadi slack karena tidak mempunyai pembangkit yang bebas mengatur P dan Q.",
            "❌ Elemen diagonal adalah jumlah admitansi (1/jX, bukan jX) semua cabang di bus itu; tiap bus PQ menyumbang dua persamaan (P dan Q) dan dua tak diketahui (|V| dan δ).",
            "Petunjuk: (1) Hitung y tiap cabang. (2) Isi Y_bus 3×3. (3) Tuliskan P₂, Q₂, P₃, Q₃ dan hitung jumlahnya.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Dengan tebakan datar V₂⁽⁰⁾ = V₃⁽⁰⁾ = 1∠0°, kerjakan iterasi pertama Gauss–Seidel (Persamaan 4) dengan tangan: V₂⁽¹⁾ = (1/Y₂₂)[(P₂ − jQ₂)/V₂⁽⁰⁾* − Y₂₁V₁ − Y₂₃V₃⁽⁰⁾] dengan P₂ + jQ₂ = −(1,0 + j0,6), lalu V₃⁽¹⁾ memakai V₂⁽¹⁾ yang baru. Lanjutkan di Python (Cell 2) sampai mismatch < 10⁻⁶ dan laporkan |V₂|, δ₂, |V₃|, δ₃ serta jumlah iterasi untuk α = 1 dan α = 1,5. Bahas mengapa iterasi kedua sudah berbeda dari yang pertama walau rumusnya sama.",
            ["V⁽⁰⁾ = 1∠0", "(P − jQ)/V* dengan beban negatif", "V₃ memakai V₂ terbaru"],
            "Hasil iterasi pertama dan tegangan konvergen pabrik A kira-kira...",
            [f"|V₂⁽¹⁾| = 1,0000 (tidak berubah karena tebakan sudah benar)", f"|V₂⁽¹⁾| = {ind(abs(VF1[1]) + 0.05, 4)}, konvergen ke {ind(abs(VFC[1]) + 0.05, 4)} pu", f"|V₂⁽¹⁾| = {ind(abs(VF1[1]), 4)}, konvergen ke {ind(abs(VFC[1]), 4)} pu tetapi δ₂ = 0°", f"|V₂⁽¹⁾| = {ind(abs(VF1[1]), 4)} (∠{ind(cmath.phase(VF1[1]) / DEG, 2)}°), konvergen ke {ind(abs(VFC[1]), 4)}∠{ind(cmath.phase(VFC[1]) / DEG, 2)}° pu; |V₃| → {ind(abs(VFC[2]), 4)} pu"],
            f"✅ Tepat! \\(V_2^{{(1)}} = \\frac{{1}}{{-j{ind(abs(YF[1][1]), 3)}}}\\left[(-1{{,}}0 + j0{{,}}6) - (j{ind(1 / 0.08, 1)} + j{ind(1 / 0.12, 3)})\\right] = {fmtc(VF1[1], 4)}\\) → |V₂⁽¹⁾| = {ind(abs(VF1[1]), 4)}∠{ind(cmath.phase(VF1[1]) / DEG, 2)}°; \\(V_3^{{(1)}} = \\frac{{1}}{{-j{ind(abs(YF[2][2]), 3)}}}\\left[(-0{{,}}7 + j0{{,}}3) - j{ind(1 / 0.16, 2)} - j{ind(1 / 0.12, 3)}V_2^{{(1)}}\\right] = {fmtc(VF1[2], 4)}\\). Konvergen: V₂ = {ind(abs(VFC[1]), 4)}∠{ind(cmath.phase(VFC[1]) / DEG, 2)}°, V₃ = {ind(abs(VFC[2]), 4)}∠{ind(cmath.phase(VFC[2]) / DEG, 2)}° pu. Iterasi kedua berbeda karena penyebut V₂* kini bukan 1 dan V₃ tetangga sudah berubah: itulah sifat iteratifnya.",
            "❌ Masukkan beban sebagai injeksi negatif (−P + jQ pada pembilang setelah konjugat), bagi dengan Y₂₂ = −j(…), dan pakai V₂ yang baru saat menghitung V₃.",
            "Petunjuk: (1) Hitung pembilang kompleks untuk bus 2, bagi Y₂₂. (2) Ulangi untuk bus 3 dengan V₂ baru. (3) Jalankan Cell 2 dengan Y dan S kawasan ini; bandingkan iterasi α = 1 dan 1,5.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Dari tegangan konvergen pertanyaan 2, hitung arus dan aliran daya tiap saluran (Persamaan 6), daya yang dipasok GI (slack), dan rugi daya reaktif total. Bus mana yang melanggar batas 0,95 pu? Manajemen pabrik A mengusulkan kapasitor <b>0,4 pu</b> (4 MVAR) di bus 2. Ulangi aliran daya dengan Q₂ = 0,6 − 0,4 = 0,2 pu dan laporkan tegangan baru kedua bus. Bahas juga: bila pabrik B memasang PLTS 0,5 pu di siang hari, bagaimana memodelkannya dan apa efeknya pada aliran saluran 1–3; dan taksir sudut bus dengan aliran daya DC (Persamaan 5) sebagai pembanding.",
            ["S_ij = V_i I_ij*", "batas 0,95 pu", "kapasitor: Q beban turun"],
            "Sebelum dan sesudah kapasitor 0,4 pu di bus 2, tegangan pabrik A kira-kira...",
            [f"{ind(abs(VFC[1]), 4)} → {ind(abs(VFC[1]), 4)} pu (kapasitor tidak mengubah tegangan, hanya Q)", f"{ind(abs(VFC[1]), 4)} → {ind(abs(VFCAP[1]), 4)} pu; pabrik B ikut naik {ind(abs(VFC[2]), 4)} → {ind(abs(VFCAP[2]), 4)} pu; daya slack {fmtc(SF_SLACK, 3)} pu sebelum kapasitor", f"{ind(abs(VFC[1]), 4)} → 1,05 pu (kapasitor menaikkan tegangan ke batas atas)", f"{ind(abs(VFC[1]), 4)} → {ind(abs(VFCAP[1]) - 0.03, 4)} pu; pabrik B turun"],
            f"✅ Tepat! Sebelum: \\(I_{{12}} = (V_1 - V_2)y_{{12}} = {fmtc(IF12, 4)}\\), \\(S_{{12}} = {fmtc(SF12, 4)}\\), \\(S_{{13}} = {fmtc(SF13, 4)}\\), \\(S_{{23}} = {fmtc(SF23, 4)}\\) pu; GI memasok {fmtc(SF_SLACK, 4)} pu untuk beban 1,7 + j0,9 (rugi Q = {ind(SF_SLACK.imag - 0.9, 4)} pu). Bus 2 ({ind(abs(VFC[1]), 4)}) dan bus 3 ({ind(abs(VFC[2]), 4)}) {'keduanya di bawah 0,95' if abs(VFC[1]) < 0.95 and abs(VFC[2]) < 0.95 else 'salah satunya di bawah 0,95'}. Dengan kapasitor 0,4 pu: V₂ = {ind(abs(VFCAP[1]), 4)}, V₃ = {ind(abs(VFCAP[2]), 4)} pu (bus tetangga ikut naik lewat saluran 2–3). PLTS 0,5 pu di bus 3 = injeksi P₃ = −0,7 + 0,5 = −0,2 pu (PQ dengan P mendekati nol) atau bus PV bila inverter mengatur tegangan: aliran 1–3 turun drastis, tegangan bus 3 naik. Aliran daya DC: δ₂ ≈ {ind(DF2, 2)}°, δ₃ ≈ {ind(DF3, 2)}° (AC: {ind(cmath.phase(VFC[1]) / DEG, 2)}°, {ind(cmath.phase(VFC[2]) / DEG, 2)}°).",
            "❌ Kapasitor mengurangi Q yang ditarik dari jaringan sehingga jatuh tegangan reaktif (X·I_Q) mengecil dan tegangan naik, juga di bus tetangga; hitung ulang aliran daya, jangan menebak.",
            "Petunjuk: (1) I dan S tiap saluran, S slack, rugi Q. (2) Bandingkan |V| dengan 0,95; ulangi dengan Q₂ = 0,2. (3) Modelkan PLTS dan hitung δ dengan DC.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Y_bus 3×3</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">V₂⁽¹⁾ = ?</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">|V| &lt; 0,95?</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">+ j0,4 pu</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Dua Pabrik,<br><em>Satu Gardu Induk</em></h1>
    <p class="hero-sub">Dua pabrik yang dipasok satu GI dan saling terhubung mengeluh tegangan rendah; sebelum membeli kapasitor, seseorang harus menjalankan aliran daya. Terapkan kosakata Pertemuan {PERTEMUAN} — jenis bus, Y_bus, Gauss–Seidel, mismatch, aliran cabang, aliran daya DC — untuk menyusun, menyelesaikan, dan membaca kasus ini dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">GI (slack) → Pabrik A (1,0 + j0,6) dan Pabrik B (0,7 + j0,3) —<br>Y_bus, Gauss–Seidel, dan Kapasitor</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS ALIRAN DAYA KAWASAN INDUSTRI TIGA BUS</div>
    <p>
      Sebuah <strong style="color:var(--amber)">GI 20 kV (bus 1)</strong> memasok <strong style="color:var(--cyan)">pabrik A (bus 2)</strong> lewat saluran j0,08 pu dan <strong style="color:var(--cyan)">pabrik B (bus 3)</strong> lewat saluran j0,16 pu; kedua pabrik terhubung langsung lewat saluran j0,12 pu (dasar 10 MVA, resistansi diabaikan). Beban puncak: pabrik A <strong>1,0 + j0,6 pu</strong>, pabrik B <strong>0,7 + j0,3 pu</strong>; GI menjaga 1,0∠0° pu.
    </p>
    <p style="margin-top:12px">
      Keluhan: <strong style="color:var(--pink)">tegangan kedua pabrik rendah</strong> saat puncak, motor-motor panas. Pabrik A mengusulkan kapasitor 4 MVAR (0,4 pu); pabrik B berencana memasang PLTS atap 5 MW (0,5 pu). Manajemen kawasan meminta <strong style="color:var(--pink)">studi aliran daya</strong> sebelum menyetujui keduanya.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menyusun Y_bus, menjalankan Gauss–Seidel (iterasi pertama dengan tangan, sisanya Python), dan membaca hasilnya <strong style="color:var(--cyan)">sebelum</strong> rapat pengelola kawasan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("saluran: j0,08 (1–2), j0,16 (1–3), j0,12 (2–3) pu", "14,165,233", "cyan")}
{kartu("bus 1 GI = slack 1∠0°", "14,165,233", "cyan")}
{kartu("bus 2 pabrik A: 1,0 + j0,6; bus 3 pabrik B: 0,7 + j0,3 pu", "14,165,233", "cyan")}
{kartu("usulan: kapasitor 0,4 pu di bus 2; PLTS 0,5 pu di bus 3", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Aliran daya adalah alat yang menjawab 'apa yang terjadi bila': bila beban naik, bila kapasitor dipasang, bila PLTS menyala. Forum ini mengajak Anda menjalani tiga langkahnya: menyusun, menyelesaikan, membaca.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Jaringan tiga bus kawasan industri dengan Y_bus-nya; kanan: tegangan bus hasil Gauss–Seidel sebelum dan sesudah kapasitor 0,4 pu di pabrik A</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Kawasan industri tiga bus (dasar 10 MVA, R diabaikan): bus 1 GI slack 1∠0°; bus 2 pabrik A beban 1,0 + j0,6 pu; bus 3 pabrik B beban 0,7 + j0,3 pu; saluran j0,08 (1–2), j0,16 (1–3), j0,12 (2–3) pu; tegangan pabrik rendah saat puncak; usulan kapasitor 0,4 pu di bus 2 dan PLTS 0,5 pu di bus 3; tugas: Y_bus + persamaan aliran daya, iterasi 1 Gauss–Seidel dengan tangan + Python sampai konvergen (α 1 dan 1,5), aliran cabang/slack/rugi, ulangi dengan kapasitor, model PLTS, sudut dengan aliran daya DC."
FORUM_CHIPS_LMS = ["saluran = j0,08 / j0,16 / j0,12 pu", "bus 1 = GI slack 1∠0°", "beban = A 1,0 + j0,6; B 0,7 + j0,3 pu", "usulan = kapasitor 0,4 pu (A); PLTS 0,5 pu (B)"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Jaringan tiga bus kawasan industri, Y_bus, dan tegangan Gauss–Seidel sebelum/sesudah kapasitor (Pertemuan 15)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const cx = { add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }, conj: (a) => [a[0], -a[1]], abs: (a) => Math.hypot(a[0], a[1]) };
  const y12 = [0, -1 / 0.08], y13 = [0, -1 / 0.16], y23 = [0, -1 / 0.12];
  const Y = [[cx.add(y12, y13), cx.mul([-1, 0], y12), cx.mul([-1, 0], y13)], [cx.mul([-1, 0], y12), cx.add(y12, y23), cx.mul([-1, 0], y23)], [cx.mul([-1, 0], y13), cx.mul([-1, 0], y23), cx.add(y13, y23)]];
  const gs = (S) => { let V = [[1, 0], [1, 0], [1, 0]]; for (let it = 0; it < 60; it++) { for (const i of [1, 2]) { let s = [0, 0]; for (let j = 0; j < 3; j++) if (j !== i) s = cx.add(s, cx.mul(Y[i][j], V[j])); V[i] = cx.div(cx.sub(cx.div(cx.conj(S[i]), cx.conj(V[i])), s), Y[i][i]); } } return V; };
  const V0 = gs([null, [-1.0, -0.6], [-0.7, -0.3]]), V1 = gs([null, [-1.0, -0.2], [-0.7, -0.3]]);
  // kiri: jaringan
  const bx = [60, 200, 130], by = [50, 50, 140];
  ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'center';
  const garis = (a, b, l, dx, dy) => { ctx.strokeStyle = 'rgba(0,229,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx[a], by[a]); ctx.lineTo(bx[b], by[b]); ctx.stroke(); ctx.fillStyle = 'rgba(0,229,255,.9)'; ctx.fillText(l, (bx[a] + bx[b]) / 2 + dx, (by[a] + by[b]) / 2 + dy); };
  garis(0, 1, 'j0,08', 0, -8); garis(0, 2, 'j0,16', -30, 4); garis(1, 2, 'j0,12', 30, 4);
  [['1 GI', 'rgba(0,224,158,.95)'], ['2 A', 'rgba(255,179,0,.95)'], ['3 B', 'rgba(255,179,0,.95)']].forEach(([l, c], i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx[i], by[i], 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#020812'; ctx.fillText(l.split(' ')[0], bx[i], by[i] + 4); ctx.fillStyle = c; ctx.fillText(l.split(' ')[1], bx[i], by[i] + (i === 2 ? 26 : -18)); });
  ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.textAlign = 'left'; ctx.fillText('Y_bus = −j[' + cx.abs(Y[0][0]).toFixed(2) + ', −' + cx.abs(Y[0][1]).toFixed(2) + ', −' + cx.abs(Y[0][2]).toFixed(2) + '; …; ' + cx.abs(Y[2][2]).toFixed(2) + ']', 20, 172);
  // kanan: batang tegangan
  const padL = Math.max(280, W * 0.45), padT = 22, padB = 30, plotW = W - padL - 20, plotH = H - padT - padB;
  if (plotW < 80) return;
  const X = (i) => padL + (i + 0.5) / 4 * plotW, Yv = (v) => padT + plotH - (v - 0.85) / 0.17 * plotH;
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right'; [0.85, 0.9, 0.95, 1.0].forEach((v) => ctx.fillText(v.toFixed(2), padL - 4, Yv(v) + 3));
  ctx.strokeStyle = 'rgba(239,68,68,.7)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Yv(0.95)); ctx.lineTo(padL + plotW, Yv(0.95)); ctx.stroke(); ctx.setLineDash([]);
  const bar = [['|V₂| sebelum', cx.abs(V0[1]), 'rgba(239,68,68,.9)'], ['|V₂| + C', cx.abs(V1[1]), 'rgba(0,224,158,.9)'], ['|V₃| sebelum', cx.abs(V0[2]), 'rgba(239,68,68,.9)'], ['|V₃| + C', cx.abs(V1[2]), 'rgba(0,224,158,.9)']];
  const bw = plotW / 4 * 0.6;
  bar.forEach(([l, v, c], i) => { ctx.fillStyle = c; ctx.fillRect(X(i) - bw / 2, Yv(v), bw, padT + plotH - Yv(v)); ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.textAlign = 'center'; ctx.fillText(l, X(i), H - 8); ctx.fillText(v.toFixed(4), X(i), Yv(v) - 5); });
  ctx.fillStyle = 'rgba(239,68,68,.85)'; ctx.textAlign = 'left'; ctx.fillText('batas 0,95 pu', padL + 4, Yv(0.95) - 4);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
