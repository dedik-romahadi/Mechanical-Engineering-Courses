# Konten Modul 14 Pemodelan CAD — Optimasi Desain untuk Efisiensi dan Lingkungan (Sub-CPMK 5.2:
# formulasi optimasi; optimasi parametrik dengan Spreadsheet; studi parameter dengan Python;
# optimasi analitis klasik; perbandingan alternatif desain; kendala lingkungan; dokumentasi hasil).
# Angka contoh dihitung di sini agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama
# dengan varian tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 14
JUDUL = "Optimasi Desain untuk Efisiensi dan Lingkungan"
JUDUL_PANJANG = "Optimasi Desain untuk Efisiensi dan Lingkungan"
JUDUL_EKSPOR = "Optimasi Efisiensi dan Lingkungan"

# ─────────────────────────── angka contoh ───────────────────────────
E_ST, E_AL = 210000, 70000                 # MPa
RHO_ST, RHO_AL = 7.85e-6, 2.70e-6          # kg/mm³
FE_ST, FE_AL = 2.0, 12.0                   # kg CO₂ per kg bahan

# Bagian 02 & 04 — kaleng silinder tertutup bervolume tetap
V0 = 500000.0                               # mm³ (0,5 liter)
R_OPT = (V0 / (2 * math.pi)) ** (1 / 3)
H_OPT = 2 * R_OPT
A_OPT = 6 * math.pi * R_OPT ** 2


def a_kaleng(r):
    """Luas permukaan kaleng tertutup bervolume V0 sebagai fungsi jari-jari."""
    return 2 * math.pi * r * r + 2 * V0 / r


# Bagian 02 — kantilever aluminium dengan kendala defleksi (contoh sel h_req)
B_KA, F_KA, L_KA, D_KA = 25, 500, 450, 1.0
H_REQ_AL = (4 * F_KA * L_KA ** 3 / (E_AL * B_KA * D_KA)) ** (1 / 3)

# Bagian 03 — pelat kantilever baja dengan dua kendala (studi parameter)
B_P, F_P, L_P, S_IZIN, D_IZIN = 60, 3000, 500, 100, 1.0
T_SIGMA = math.sqrt(6 * F_P * L_P / (B_P * S_IZIN))
T_DELTA = (4 * F_P * L_P ** 3 / (E_ST * B_P * D_IZIN)) ** (1 / 3)
T_REQ = max(T_SIGMA, T_DELTA)


def sig_t(tt):
    return 6 * F_P * L_P / (B_P * tt ** 2)


def del_t(tt):
    return 4 * F_P * L_P ** 3 / (E_ST * B_P * tt ** 3)


def m_pelat(tt):
    """Massa pelat baja b × t × L dalam kg."""
    return RHO_ST * B_P * L_P * tt


# Bagian 04 & 05 — tabung pengganti poros pejal dengan momen inersia sama
DS, KR = 50.0, 0.75
D_O = DS / (1 - KR ** 4) ** 0.25
D_I = KR * D_O
RASIO_V = D_O ** 2 * (1 - KR ** 2) / DS ** 2

# Bagian 05 & 06 — lengan braket rak: tiga alternatif desain
B_R, L_R, F_R, D_R = 100, 700, 4000, 1.5


def h_kaku(E):
    """Tinggi minimum penampang b × h agar defleksi ujung tepat sama dengan D_R."""
    return (4 * F_R * L_R ** 3 / (E * B_R * D_R)) ** (1 / 3)


H_R_ST, H_R_AL = h_kaku(E_ST), h_kaku(E_AL)
M_R_ST = RHO_ST * B_R * L_R * H_R_ST
M_R_AL = RHO_AL * B_R * L_R * H_R_AL
CO2_R_ST, CO2_R_AL = FE_ST * M_R_ST, FE_AL * M_R_AL
FAKTOR_RUSUK = 0.60                         # pelat berusuk: massa 60 % pelat pejal pada I sama
M_R_RUSUK = FAKTOR_RUSUK * M_R_ST
CO2_R_RUSUK = FE_ST * M_R_RUSUK
IDX_ST = FE_ST * 7850 / E_ST ** (1 / 3)     # indeks lingkungan f·ρ/E^(1/3)
IDX_AL = FE_AL * 2700 / E_AL ** (1 / 3)

# Bagian 05 — matriks keputusan berbobot (Pugh berbobot, datum = alternatif A)
BOBOT = [("Massa terpasang", 0.25), ("Jejak CO₂ bahan", 0.25), ("Biaya bahan + proses", 0.20),
         ("Kemudahan pembuatan", 0.15), ("Tinggi terpasang", 0.15)]
SKOR_B = [1, 1, -1, -1, 0]                  # baja berusuk terhadap datum
SKOR_C = [1, -1, -1, 0, -1]                 # aluminium pejal terhadap datum
TOTAL_B = sum(w * s for (_, w), s in zip(BOBOT, SKOR_B))
TOTAL_C = sum(w * s for (_, w), s in zip(BOBOT, SKOR_C))


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    for i, (lines, c) in enumerate([(["Fungsi tujuan", "minimumkan f(x)"], "#22d3ee"),
                                    (["Variabel desain", "x = (r, h, t, bahan)"], "#f59e0b"),
                                    (["Kendala", "g(x) ≤ 0, h(x) = 0"], "#ec4899")]):
        b += box(18, 46 + i * 62, 196, 52, lines, c, 11.5)
    b += arrow(218, 72, 254, 104) + arrow(218, 134, 254, 134) + arrow(218, 196, 254, 172)
    ox, oy = 258, 222
    b += f'<rect x="{ox}" y="62" width="160" height="160" fill="none" stroke="{GRID}" stroke-width="1"/>'
    b += arrow(ox, oy, ox + 164, oy, AX, 1.2) + arrow(ox, oy, ox, 58, AX, 1.2)
    b += t(428, 236, "x₁", 10, AX, "start", "700") + t(ox - 6, 52, "x₂", 10, AX, "end", "700")
    layak = [(292, 222), (418, 222), (418, 132), (352, 80), (292, 150)]
    b += f'<polygon points="{" ".join(f"{x},{y}" for x, y in layak)}" fill="rgba(0,224,158,.12)" stroke="#00e09e" stroke-width="1.6" stroke-dasharray="6 3"/>'
    b += f'<line x1="400" y1="110" x2="326" y2="158" stroke="{AX}" stroke-width="1" stroke-dasharray="5 3"/>'
    b += arrow(360, 134, 328, 156, AX, 1.2)
    b += f'<circle cx="292" cy="150" r="5" fill="#f59e0b"/>'
    b += t(286, 144, "x*", 11, "#f59e0b", "end", "700")
    b += t(300, 112, "g₁(x) = 0", 10, "#ec4899", "start", "600")
    b += t(400, 150, "g₂(x) = 0", 10, "#ec4899", "end", "600")
    b += t(378, 100, "f menurun", 10, AX, "middle")
    b += t(362, 196, "ruang layak", 10, "#00e09e", "middle", "600")
    b += t(440, 52, "Bentuk baku (Persamaan 1):", 11, "#22d3ee", "start", "600")
    b += t(440, 70, "minimumkan f(x)", 11, TX, "start")
    b += t(440, 88, "terhadap g_i(x) ≤ 0, h_j(x) = 0", 10.5, TX, "start")
    b += t(440, 106, "dan x_L ≤ x ≤ x_U", 10.5, TX, "start")
    b += t(440, 132, "Contoh modul ini:", 11, "#f59e0b", "start", "600")
    b += t(440, 150, "f = luas · massa · jejak CO₂", 10.5, AX, "start")
    b += t(440, 168, "g = σ ≤ σ_izin, δ ≤ δ_izin", 10.5, AX, "start")
    b += t(440, 186, "h = volume kaleng tetap V₀", 10.5, AX, "start")
    b += t(440, 212, "Optimum di batas ruang layak", 10.5, "#00e09e", "start")
    b += teks2(340, 252, "Optimasi bukan menebak: fungsi tujuan, variabel, dan kendala ditulis dahulu, baru model dibuat parametrik", 11, AX, maks=94)
    return svg(680, 280, b, "Gambar 1 — Anatomi masalah optimasi desain: tujuan, variabel, kendala, ruang layak")


def gambar2():
    b = ""
    baris = [("alias", "isi sel"), ("V0", "500000"), ("r", "=(V0/(2*pi))^(1/3)"), ("h", "=2*r"), ("A", "=6*pi*r^2")]
    b += t(138, 40, "Spreadsheet (alias)", 11, "#22d3ee", "middle", "600")
    for i, (a_, c_) in enumerate(baris):
        y = 52 + i * 24
        isi = "rgba(34,211,238,.14)" if i == 0 else "#0e1628"
        b += f'<rect x="30" y="{y}" width="64" height="24" fill="{isi}" stroke="{GRID}" stroke-width="1"/>'
        b += f'<rect x="94" y="{y}" width="152" height="24" fill="{isi}" stroke="{GRID}" stroke-width="1"/>'
        b += t(62, y + 16, a_, 9.5, TX if i == 0 else "#f59e0b", "middle", "600")
        b += t(170, y + 16, c_, 9.5, TX if i == 0 else AX, "middle")
    b += arrow(250, 112, 288, 112, "#00e09e", 1.6)
    b += t(269, 104, "ekspresi", 9.5, "#00e09e", "middle")
    b += '<path d="M 296 74 V 182 A 44 14 0 0 0 384 182 V 74 Z" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    b += '<ellipse cx="340" cy="74" rx="44" ry="14" fill="rgba(34,211,238,.28)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<line x1="340" y1="74" x2="384" y2="74" stroke="#f59e0b" stroke-width="1"/>'
    b += t(362, 66, "r", 10.5, "#f59e0b", "middle", "700")
    b += f'<line x1="396" y1="74" x2="396" y2="182" stroke="#f59e0b" stroke-width="1"/>'
    b += t(402, 132, "h = 2r", 10.5, "#f59e0b", "start", "600")
    b += t(340, 206, "Sketch XY ⌀2r → Pad h", 9.5, AX, "middle")
    b += t(340, 222, f"V₀ = {ind(V0, 0)} mm³ (tetap)", 9.5, "#00e09e", "middle")
    b += t(452, 52, "Rantai parametrik:", 11, "#22d3ee", "start", "600")
    b += t(452, 70, "sel beralias → ekspresi pada", 10.5, TX, "start")
    b += t(452, 88, "konstrain sketsa dan Pad →", 10.5, TX, "start")
    b += t(452, 106, "recompute → Shape.Area", 10.5, TX, "start")
    b += t(452, 132, "Ubah satu sel, seluruh model", 10.5, AX, "start")
    b += t(452, 150, "dan bacaannya ikut berubah:", 10.5, AX, "start")
    b += t(452, 168, "itulah syarat iterasi optimasi", 10.5, AX, "start")
    b += t(452, 186, f"A minimum = {ind(A_OPT, 0)} mm²", 10.5, "#00e09e", "start")
    b += teks2(340, 252, "Satu sumber kebenaran: angka hanya ditulis di Spreadsheet, geometri mengikutinya lewat ekspresi", 11, AX, maks=94)
    return svg(680, 280, b, "Gambar 2 — Spreadsheet beralias mengendalikan geometri kaleng lewat ekspresi")


def gambar3():
    b = ""

    def X(tt):
        return 56 + (tt - 30) / 40 * 354

    def Y(v):
        return 220 - v / 3 * 160

    b += f'<rect x="56" y="60" width="{X(T_REQ) - 56:.1f}" height="160" fill="rgba(239,68,68,.08)"/>'
    b += f'<line x1="56" y1="56" x2="56" y2="220" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<line x1="52" y1="220" x2="410" y2="220" stroke="{AX}" stroke-width="1.2"/>'
    for v in (0, 1, 2, 3):
        b += f'<line x1="52" y1="{Y(v):.1f}" x2="56" y2="{Y(v):.1f}" stroke="{AX}" stroke-width="1"/>'
        b += t(50, Y(v) + 4, str(v), 10, AX, "end")
    for tt in (30, 40, 50, 60, 70):
        b += f'<line x1="{X(tt):.1f}" y1="220" x2="{X(tt):.1f}" y2="225" stroke="{AX}" stroke-width="1"/>'
        b += t(X(tt), 236, str(tt), 10, AX, "middle")
    pts_s = [(X(tt), Y(min(3, (T_SIGMA / tt) ** 2))) for tt in range(30, 71)]
    pts_d = [(X(tt), Y(min(3, (T_DELTA / tt) ** 3))) for tt in range(30, 71)]
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts_s)}" fill="none" stroke="#22d3ee" stroke-width="2.2"/>'
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts_d)}" fill="none" stroke="#00e09e" stroke-width="2.2"/>'
    b += f'<line x1="56" y1="{Y(1):.1f}" x2="410" y2="{Y(1):.1f}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="7 4"/>'
    for xx, c in ((X(T_SIGMA), "#22d3ee"), (X(T_DELTA), "#00e09e")):
        b += f'<line x1="{xx:.1f}" y1="60" x2="{xx:.1f}" y2="220" stroke="{c}" stroke-width="1" stroke-dasharray="5 3"/>'
    b += t(X(T_SIGMA), 54, f"t_σ = {ind(T_SIGMA, 2)}", 10, "#22d3ee", "middle", "600")
    b += t(X(T_DELTA), 54, f"t_δ = {ind(T_DELTA, 2)}", 10, "#00e09e", "middle", "600")
    b += t(140, 92, "tidak layak", 10, "#ef4444", "middle", "600")
    b += t(170, 116, "δ/δ_izin", 10, "#00e09e", "middle", "600")
    b += t(200, 200, "σ/σ_izin", 10, "#22d3ee", "middle", "600")
    b += t(320, 158, "kendala terpenuhi (≤ 1)", 10, AX, "middle")
    b += t(233, 252, "tebal t (mm)", 10, AX, "middle")
    b += t(452, 48, "Studi parameter (Bagian 03):", 11, "#22d3ee", "start", "600")
    b += t(452, 66, f"b = {B_P}, L = {L_P}, F = {ind(F_P, 0)} N", 10.5, TX, "start")
    b += t(452, 84, f"σ_izin = {S_IZIN} MPa, δ_izin = {ind(D_IZIN, 1)} mm", 10.5, TX, "start")
    b += t(452, 102, "sapu t, catat σ, δ, massa", 10.5, TX, "start")
    b += t(452, 128, f"t_σ = {ind(T_SIGMA, 3)} mm (tegangan)", 10.5, AX, "start")
    b += t(452, 146, f"t_δ = {ind(T_DELTA, 3)} mm (defleksi)", 10.5, AX, "start")
    b += t(452, 164, f"t_req = maks = {ind(T_REQ, 3)} mm", 10.5, "#00e09e", "start")
    b += t(452, 182, "kendala aktif: defleksi", 10.5, "#ec4899", "start")
    b += teks2(340, 268, "Dua kendala memberi dua tebal minimum; yang terbesar menentukan, dan itulah kendala aktif", 11, AX, maks=98)
    return svg(680, 280, b, "Gambar 3 — Studi parameter tebal pelat: dua kendala dan tebal minimum yang menentukan")


def gambar4():
    b = ""

    def X(r):
        return 60 + (r - 20) / 60 * 340

    def Y(a):
        return 220 - (a - 30000) / 30000 * 160

    b += f'<line x1="60" y1="56" x2="60" y2="220" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<line x1="56" y1="220" x2="406" y2="220" stroke="{AX}" stroke-width="1.2"/>'
    for a_ in (30000, 40000, 50000, 60000):
        b += f'<line x1="56" y1="{Y(a_):.1f}" x2="60" y2="{Y(a_):.1f}" stroke="{AX}" stroke-width="1"/>'
        b += t(54, Y(a_) + 4, ind(a_, 0), 10, AX, "end")
    for r_ in (20, 40, 60, 80):
        b += f'<line x1="{X(r_):.1f}" y1="220" x2="{X(r_):.1f}" y2="225" stroke="{AX}" stroke-width="1"/>'
        b += t(X(r_), 236, str(r_), 10, AX, "middle")
    pts = [(X(r_), Y(min(60000, a_kaleng(r_)))) for r_ in range(20, 81)]
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#22d3ee" stroke-width="2.4"/>'
    xr, yr = X(R_OPT), Y(A_OPT)
    b += f'<line x1="{xr:.1f}" y1="{yr:.1f}" x2="{xr:.1f}" y2="220" stroke="#00e09e" stroke-width="1" stroke-dasharray="5 3"/>'
    b += f'<line x1="60" y1="{yr:.1f}" x2="{xr:.1f}" y2="{yr:.1f}" stroke="#00e09e" stroke-width="1" stroke-dasharray="5 3"/>'
    b += f'<circle cx="{xr:.1f}" cy="{yr:.1f}" r="5" fill="#00e09e"/>'
    b += t(204, 190, f"A* = {ind(A_OPT, 0)} mm²", 10, "#00e09e", "start", "600")
    b += t(xr, 252, f"r* = {ind(R_OPT, 2)} mm", 10, "#f59e0b", "middle", "600")
    b += t(300, 96, "A(r) = 2πr² + 2V₀/r", 10.5, TX, "middle", "600")
    b += t(300, 118, "h* = 2r*", 10, "#f59e0b", "middle", "600")
    b += t(452, 48, "Optimasi analitis (Persamaan 2):", 11, "#22d3ee", "start", "600")
    b += t(452, 66, "dA/dr = 4πr − 2V₀/r² = 0", 10.5, TX, "start")
    b += t(452, 84, "r* = (V₀/(2π))^(1/3)", 10.5, TX, "start")
    b += t(452, 102, "h* = 2r*, A* = 6π·r*²", 10.5, TX, "start")
    b += t(452, 128, f"V₀ = {ind(V0, 0)} mm³:", 10.5, AX, "start")
    b += t(452, 146, f"r* = {ind(R_OPT, 2)} mm, h* = {ind(H_OPT, 2)} mm", 10.5, AX, "start")
    b += t(452, 164, f"A* = {ind(A_OPT, 2)} mm²", 10.5, "#00e09e", "start")
    b += t(452, 182, "tinggi = diameter: kaleng ideal", 10.5, "#ec4899", "start")
    b += teks2(340, 266, "Kurva tujuan datar di sekitar optimum: menyimpang sedikit dari r* hampir tidak menaikkan luas", 11, AX, maks=98)
    return svg(680, 280, b, "Gambar 4 — Kaleng tertutup dengan luas permukaan minimum pada volume tetap")


def gambar5():
    b = ""
    kolom = [("Kriteria (bobot)", 24, 136), ("A — baja pejal", 160, 88), ("B — baja berusuk", 248, 88), ("C — aluminium", 336, 88)]
    isi = [
        ("Massa terpasang (0,25)", f"{ind(M_R_ST, 1)} kg", f"+ {ind(M_R_RUSUK, 1)} kg", f"+ {ind(M_R_AL, 1)} kg"),
        ("Jejak CO₂ (0,25)", f"{ind(CO2_R_ST, 0)} kg", f"+ {ind(CO2_R_RUSUK, 0)} kg", f"− {ind(CO2_R_AL, 0)} kg"),
        ("Biaya bahan (0,20)", "acuan", "−", "−"),
        ("Kemudahan buat (0,15)", "acuan", "−", "0"),
        ("Tinggi terpasang (0,15)", f"{ind(H_R_ST, 1)} mm", f"0 {ind(H_R_ST, 1)} mm", f"− {ind(H_R_AL, 1)} mm"),
    ]
    for j, (judul, x, w) in enumerate(kolom):
        b += f'<rect x="{x}" y="46" width="{w}" height="26" fill="rgba(34,211,238,.14)" stroke="{GRID}" stroke-width="1"/>'
        b += t(x + w / 2, 63, judul, 9.5, TX, "middle", "600")
        for i, row in enumerate(isi):
            y = 72 + i * 26
            b += f'<rect x="{x}" y="{y}" width="{w}" height="26" fill="#0e1628" stroke="{GRID}" stroke-width="1"/>'
            warna = TX if j == 0 else ("#00e09e" if row[j].startswith("+") else ("#ef4444" if row[j].startswith("−") else AX))
            b += t(x + w / 2, y + 17, row[j], 9.5, warna, "middle", "600" if j == 0 else "")
        b += f'<rect x="{x}" y="202" width="{w}" height="26" fill="rgba(245,158,11,.12)" stroke="{GRID}" stroke-width="1"/>'
        total = ["Skor berbobot", "0,00 (datum)", f"+{ind(TOTAL_B, 2)} ✅", ind(TOTAL_C, 2)]
        b += t(x + w / 2, 219, total[j], 9.5, "#f59e0b" if j != 0 else TX, "middle", "700")
    b += t(452, 52, "Matriks keputusan (Pers. 6):", 11, "#22d3ee", "start", "600")
    b += t(452, 70, "S_j = Σ w_i · s_ij", 11, TX, "start")
    b += t(452, 88, "s = +1 lebih baik, 0 sama,", 10.5, TX, "start")
    b += t(452, 106, "−1 lebih buruk dari datum A", 10.5, TX, "start")
    b += t(452, 132, "Bobot dijumlahkan = 1,00", 10.5, AX, "start")
    b += t(452, 150, "Pemenang: B (baja berusuk)", 10.5, "#00e09e", "start")
    b += t(452, 168, "C ringan tetapi CO₂ 3× lipat", 10.5, "#ec4899", "start")
    b += teks2(340, 258, "Alternatif dinilai terhadap satu datum agar perbandingan adil; bobot ditetapkan sebelum angka dilihat", 11, AX, maks=96)
    return svg(680, 280, b, "Gambar 5 — Matriks keputusan berbobot untuk tiga alternatif lengan braket")


def gambar6():
    b = ""
    b += t(200, 36, "Kekakuan lentur sama (E·I tetap): h ∝ E^(−1/3)", 10.5, TX, "middle", "600")
    s = 0.9
    b += f'<line x1="30" y1="190" x2="252" y2="190" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<rect x="40" y="{190 - H_R_ST * s:.1f}" width="90" height="{H_R_ST * s:.1f}" fill="rgba(148,163,184,.20)" stroke="{AX}" stroke-width="1.8"/>'
    b += f'<rect x="150" y="{190 - H_R_AL * s:.1f}" width="90" height="{H_R_AL * s:.1f}" fill="rgba(34,211,238,.18)" stroke="#22d3ee" stroke-width="1.8"/>'
    b += t(85, 208, f"baja h = {ind(H_R_ST, 2)} mm", 9.5, AX, "middle")
    b += t(195, 208, f"aluminium h = {ind(H_R_AL, 2)} mm", 9.5, "#22d3ee", "middle")
    b += t(140, 226, f"penampang b × h (b = {B_R} mm)", 9.5, AX, "middle")
    b += f'<line x1="300" y1="46" x2="300" y2="190" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<line x1="296" y1="190" x2="430" y2="190" stroke="{AX}" stroke-width="1.2"/>'
    hb = 140 * CO2_R_ST / CO2_R_AL
    b += f'<rect x="312" y="{190 - hb:.1f}" width="44" height="{hb:.1f}" fill="rgba(148,163,184,.30)" stroke="{AX}" stroke-width="1.6"/>'
    b += f'<rect x="378" y="50" width="44" height="140" fill="rgba(239,68,68,.28)" stroke="#ef4444" stroke-width="1.6"/>'
    b += t(334, 190 - hb + 18, ind(CO2_R_ST, 0), 10, TX, "middle", "700")
    b += t(400, 70, ind(CO2_R_AL, 0), 10, TX, "middle", "700")
    b += t(334, 206, "baja", 9.5, AX, "middle")
    b += t(400, 206, "aluminium", 9.5, "#ef4444", "middle")
    b += t(360, 226, "jejak CO₂ (kg)", 9.5, "#00e09e", "middle")
    b += t(452, 48, "Jejak bahan (Persamaan 5):", 11, "#22d3ee", "start", "600")
    b += t(452, 66, "C = f · ρ · V = f · ρ · b·L·h", 10.5, TX, "start")
    b += t(452, 84, "kekakuan sama → C ∝ f·ρ/E^(1/3)", 10, TX, "start")
    b += t(452, 110, f"baja: {ind(M_R_ST, 1)} kg → {ind(CO2_R_ST, 1)} kg CO₂", 10.5, AX, "start")
    b += t(452, 128, f"alu: {ind(M_R_AL, 1)} kg → {ind(CO2_R_AL, 1)} kg CO₂", 10.5, AX, "start")
    b += t(452, 154, f"indeks baja {ind(IDX_ST, 0)} vs alu {ind(IDX_AL, 0)}", 10.5, "#ec4899", "start")
    b += t(452, 172, f"baja {ind(CO2_R_AL / CO2_R_ST, 2)}× lebih rendah", 10.5, "#00e09e", "start")
    b += teks2(340, 252, "Lebih ringan belum tentu lebih hijau: faktor emisi per kg mengalahkan penghematan massa", 11, AX, maks=96)
    return svg(680, 280, b, "Gambar 6 — Jejak CO₂ baja versus aluminium pada kekakuan lentur yang sama")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-formulasi">Formulasi</a>
  <a href="#m-spreadsheet">Spreadsheet</a>
  <a href="#m-studi">Studi Parameter</a>
  <a href="#m-analitis">Optimum Analitis</a>
  <a href="#m-alternatif">Alternatif</a>
  <a href="#m-lingkungan">Kendala Lingkungan</a>
  <a href="#m-dokumentasi">Dokumentasi</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="26" ry="9" fill="rgba(0,229,255,.18)" stroke="rgba(0,229,255,.6)" stroke-width="1.4"/>
      <path d="M 24 52 V 140 A 26 9 0 0 0 76 140 V 52" fill="rgba(0,229,255,.10)" stroke="rgba(0,229,255,.55)" stroke-width="1.4"/>
      <line x1="50" y1="52" x2="76" y2="52" stroke="rgba(255,179,0,.8)" stroke-width="1.2"/>
      <line x1="86" y1="52" x2="86" y2="140" stroke="rgba(255,179,0,.8)" stroke-width="1.2"/>
      <text x="50" y="170" text-anchor="middle" fill="rgba(255,179,0,.8)" font-family="JetBrains Mono" font-size="8">h* = 2r*</text>
      <text x="50" y="205" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">A = 6πr²</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 16 58 Q 46 168 84 122" fill="none" stroke="rgba(0,229,255,.55)" stroke-width="1.6"/>
      <circle cx="52" cy="144" r="4" fill="rgba(0,224,158,.8)"/>
      <line x1="16" y1="150" x2="88" y2="150" stroke="rgba(239,68,68,.45)" stroke-width="1" stroke-dasharray="5 3"/>
      <rect x="28" y="176" width="44" height="14" fill="rgba(255,179,0,.2)" stroke="rgba(255,179,0,.6)" stroke-width="1"/>
      <text x="50" y="187" text-anchor="middle" fill="rgba(255,179,0,.8)" font-family="JetBrains Mono" font-size="7">=Spreadsheet.t</text>
      <text x="50" y="210" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">min f(x)</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">min f(x) s.t. g(x) ≤ 0</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">r* = (V₀/2π)^(1/3)</span>
    <span class="ff" style="left:34%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">h_req = (4FL³/Ebδ)^(1/3)</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">t_req = maks(t_σ, t_δ)</span>
    <span class="ff" style="left:66%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">d_o = d_s/(1−k⁴)^(1/4)</span>
    <span class="ff" style="left:84%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">CO₂ = f·ρ·V</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">S_j = Σ w_i·s_ij</span>
    <span class="ff" style="left:60%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">f·ρ/E^(1/3)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 15 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Desain Terbaik</span><br>
      <em>bukan yang Pertama,</em><br>
      <span class="hl-amber">melainkan yang Teroptimasi</span>
    </h1>
    <p class="hero-sub">Pertemuan penutup semester menyatukan semua yang sudah dipelajari menjadi satu keputusan: menuliskan fungsi tujuan, variabel desain, dan kendala; membuat model yang bisa diiterasi lewat Spreadsheet dan ekspresi; menyapu parameter dengan Python; membandingkan hasilnya dengan optimum analitis klasik; menimbang alternatif dengan matriks keputusan; lalu memasukkan massa, energi, dan jejak CO₂ sebagai kendala yang setara dengan kekuatan. Tugasnya lima model parametrik dengan bacaan luas minimum, tinggi minimum, diameter tabung, tebal minimum, dan jejak karbon.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Tujuan, kendala, optimum, jejak</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi optimasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Spreadsheet, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — Formulasi optimasi
    isi = figure(1, "Anatomi masalah optimasi desain", "Tiga masukan wajib — fungsi tujuan, variabel desain, dan kendala — membentuk ruang layak; optimum hampir selalu berada di batasnya, tepat pada kendala yang aktif.", gambar1())
    isi += cards([
        ("🎯", "Fungsi tujuan f(x)", "Satu besaran yang diminimumkan atau dimaksimumkan: luas permukaan, massa, defleksi, biaya, atau jejak CO₂. Bila ada dua tujuan, salah satunya dijadikan kendala (mis. minimumkan massa dengan CO₂ ≤ batas).", "min f(x)"),
        ("🎚️", "Variabel desain x", "Dimensi atau pilihan yang boleh diubah: jari-jari, tinggi, tebal, jumlah rusuk, material. Di FreeCAD, setiap variabel menjadi satu sel beralias di Spreadsheet.", "x = (r, h, t, …)"),
        ("⛔", "Kendala g dan h", "Pertidaksamaan (σ ≤ σ_izin, δ ≤ δ_izin, massa ≤ target) dan persamaan (volume kaleng tetap V₀). Kendala memotong ruang desain menjadi ruang layak.", "g(x) ≤ 0, h(x) = 0"),
        ("📍", "Kendala aktif", "Optimum jarang di tengah ruang layak: memperkecil tujuan selalu mendorong desain ke batas. Kendala yang “tersentuh” di titik optimum disebut aktif dan menentukan ukuran akhir.", "g(x*) = 0"),
    ])
    isi += formula(1, "Bentuk Baku Masalah Optimasi Desain", r"\min_{\mathbf{x}} \ f(\mathbf{x}) \quad \text{dengan} \quad g_i(\mathbf{x}) \le 0,\ \ h_j(\mathbf{x}) = 0,\ \ \mathbf{x}_L \le \mathbf{x} \le \mathbf{x}_U",
                   r"\(f\) = fungsi tujuan (luas, massa, CO₂) &nbsp;·&nbsp; \(\mathbf{x}\) = vektor variabel desain &nbsp;·&nbsp; \(g_i\) = kendala pertidaksamaan (tegangan, defleksi, massa) &nbsp;·&nbsp; \(h_j\) = kendala persamaan (volume tetap) &nbsp;·&nbsp; \(\mathbf{x}_L, \mathbf{x}_U\) = batas bawah dan atas variabel (ruang pasang, ukuran pelat pasaran).",
                   "Menuliskan ketiga bagian ini lebih dahulu mencegah pekerjaan yang mubazir. Tanpa fungsi tujuan, “lebih baik” tidak terdefinisi; tanpa kendala, jawabannya selalu nol (tebal nol, massa nol); tanpa batas variabel, optimum bisa jatuh pada ukuran yang tidak ada di pasar. Semua tugas modul ini adalah bentuk baku ini dengan satu variabel bebas, sehingga optimumnya dapat dicari secara analitis maupun dengan sapuan parameter.",
                   [("f(\\mathbf{x})", "Fungsi tujuan yang diminimumkan (mm², kg, kg CO₂)"), ("\\mathbf{x}", "Variabel desain (mm, pilihan material)"), ("g_i(\\mathbf{x})", "Kendala pertidaksamaan (—)"), ("h_j(\\mathbf{x})", "Kendala persamaan (—)"), ("\\mathbf{x}_L, \\mathbf{x}_U", "Batas bawah dan atas variabel (mm)")])
    isi += tabel(["Kasus modul ini", "Fungsi tujuan", "Variabel desain", "Kendala", "Bagian"],
                 [["Kaleng silinder tertutup", "luas permukaan A (bahan pelat)", "r (dan h yang mengikutinya)", f"volume tetap V₀ = {ind(V0, 0)} mm³", "02 dan 04"],
                  ["Kantilever aluminium", "massa ∝ tinggi h", "h", "defleksi ujung δ ≤ δ_izin", "02"],
                  ["Pelat kantilever baja", "massa ∝ tebal t", "t", "σ ≤ σ_izin <em>dan</em> δ ≤ δ_izin", "03"],
                  ["Poros: pejal atau tabung", "volume bahan", "d_o (dengan k = d_i/d_o tetap)", "momen inersia I sama", "04 dan 05"],
                  ["Lengan braket rak", "jejak CO₂ bahan", "material dan h", "kekakuan E·I sama, ruang pasang", "05 dan 06"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 membuat model yang <em>bisa</em> diiterasi (Spreadsheet dan ekspresi, dasar semua tugas), Bagian 03 menyapu parameter dengan Python untuk menemukan nilai minimum yang memenuhi kendala (Tugas 4), Bagian 04 menghitung optimum secara analitis agar sapuan bisa diperiksa (Tugas 1, 2, 3), Bagian 05 memilih di antara alternatif yang sama-sama layak, Bagian 06 memasukkan jejak lingkungan ke dalam keputusan (Tugas 5), dan Bagian 07–09 menutup dengan dokumentasi, Python, serta praktik.")
    m += bagian(1, "m-formulasi", "Formulasi Optimasi:<br>Tujuan, Variabel, dan Kendala", "Optimasi dimulai jauh sebelum model dibuka: dengan menuliskan apa yang diminimumkan, apa yang boleh diubah, dan apa yang tidak boleh dilanggar. Bagian ini menetapkan bentuk baku itu dan menunjukkan mengapa optimum selalu bersandar pada kendala.", isi, "FORMULASI OPTIMASI")

    # 02 — Optimasi parametrik dengan Spreadsheet
    isi = figure(2, "Spreadsheet beralias mengendalikan geometri lewat ekspresi", f"Sel V0, r, h, dan A diberi alias; radius sketsa dan panjang Pad mengambil nilainya lewat ekspresi <code>=Spreadsheet.r</code> dan <code>=Spreadsheet.h</code>. Mengubah V₀ menghitung ulang seluruh model, dan Shape.Area langsung memberi luas minimum {ind(A_OPT, 2)} mm².", gambar2())
    isi += tabel(["Sel", "Alias", "Isi", "Nilai untuk contoh", "Dipakai oleh"],
                 [["B1", "V0", str(int(V0)), f"{ind(V0, 0)} mm³", "sel r"],
                  ["B2", "r", "<code>=(V0 / (2 * pi))^(1/3)</code>", f"{ind(R_OPT, 4)} mm", "konstrain Radius sketsa"],
                  ["B3", "h", "<code>=2 * r</code>", f"{ind(H_OPT, 4)} mm", "Length pada Pad"],
                  ["B4", "A", "<code>=6 * pi * r^2</code>", f"{ind(A_OPT, 2)} mm²", "pembanding Shape.Area"],
                  ["B6", "d_izin", str(ind(D_KA, 1)), f"{ind(D_KA, 1)} mm", "sel h_req"],
                  ["B7", "h_req", "<code>=(4 * F * L^3 / (E * b * d_izin))^(1/3)</code>", f"{ind(H_REQ_AL, 3)} mm", "tinggi sketsa kantilever"]])
    isi += formula(2, "Tinggi atau Tebal Minimum dari Kendala Defleksi", r"\delta = \frac{F L^{3}}{3EI} = \frac{4FL^{3}}{E\,b\,h^{3}} \le \delta_{izin} \quad\Rightarrow\quad h_{req} = \left(\frac{4FL^{3}}{E\,b\,\delta_{izin}}\right)^{1/3}",
                   r"Kantilever penampang persegi panjang \(b \times h\) dengan \(I = bh^{3}/12\); \(F\) beban ujung, \(L\) panjang, \(E\) modulus elastisitas. Contoh aluminium \(E = " + ind(E_AL, 0) + r"\) MPa, \(b = " + str(B_KA) + r"\) mm, \(F = " + str(F_KA) + r"\) N, \(L = " + str(L_KA) + r"\) mm, \(\delta_{izin} = " + ind(D_KA, 1) + r"\) mm: \(h_{req} = " + ind(H_REQ_AL, 3) + r"\) mm.",
                   "Karena massa balok sebanding dengan h sedangkan defleksi sebanding dengan 1/h³, tinggi terkecil yang masih memenuhi δ_izin adalah desain bermassa minimum untuk kendala itu: kendala defleksi aktif tepat di h_req. Menaikkan h sedikit di atas h_req hanya menambah massa; menurunkannya sedikit langsung melanggar kendala. Di Spreadsheet, tulis pangkat pecahan sebagai ^(1/3) dan lepas satuan (angka polos) agar ekspresi menerima pangkat tersebut.",
                   [("h_{req}", "Tinggi minimum penampang (mm)"), ("F, L", "Beban ujung (N) dan panjang (mm)"), ("E", "Modulus elastisitas (MPa)"), ("b", "Lebar penampang (mm)"), ("\\delta_{izin}", "Defleksi ujung maksimum (mm)")])
    isi += cards([
        ("🏷️", "Alias sebelum ekspresi", "Klik kanan sel → Properties → Alias. Nama tanpa spasi, huruf besar-kecil dibedakan. Alias dibuat lebih dahulu; ekspresi yang menunjuk alias yang belum ada akan merah.", "Set alias"),
        ("ƒ", "Ikat konstrain ke sel", "Pada konstrain Radius atau Length, klik ikon f(x) lalu tulis <code>Spreadsheet.r</code>. Nilai berubah biru dan terkunci; hanya Spreadsheet yang boleh mengubahnya.", "=Spreadsheet.r"),
        ("🧮", "Fungsi yang tersedia", "sqrt, pow(x; y), cbrt, abs, min, max, ceil, floor, round, pi, sin/cos (derajat). Pemisah argumen mengikuti lokal (; atau ,). Pangkat pecahan: <code>^(1/3)</code>.", "pow(V0/(2*pi); 1/3)"),
        ("🔄", "Recompute setelah edit", "Ctrl+R (Std Refresh) menghitung ulang dokumen. Bacaan Shape.Area atau Shape.Volume yang diambil sebelum recompute masih memakai geometri lama — sumber kesalahan tersering.", "Ctrl+R"),
    ])
    isi += anim_panel(1, "cyan", "Kaleng tertutup: luas permukaan terhadap jari-jari pada volume tetap", "cvKaleng",
                      [("sl_kl_V", "v_kl_V", "Volume V₀ (mL)", 200, 1500, 50, 500, "500"),
                       ("sl_kl_r", "v_kl_r", "Jari-jari r (mm)", 20, 90, 1, 43, "43")],
                      "btnKaleng", "toggleKaleng", "kalengInfo",
                      "<strong>Cara membaca:</strong> jari-jari menyapu kiri–kanan sementara tinggi menyesuaikan diri agar volume tetap V₀ (PAUSE menahan nilai slider r). Kurva di kanan adalah A(r) = 2πr² + 2V₀/r; titik hijau adalah minimumnya di r* = (V₀/2π)^(1/3), tempat tinggi kaleng tepat sama dengan diameternya. Perhatikan kurva yang datar di sekitar minimum: salah 2–3 mm hampir tidak menambah bahan.")
    isi += kotak("warning-box", "⚠️ <strong>Ekspresi melingkar:</strong> sel Spreadsheet boleh dibaca oleh fitur, tetapi sel <em>tidak boleh</em> membaca properti fitur yang bergantung pada sel itu sendiri (mis. <code>Pad.Length</code> yang sudah terikat <code>=Spreadsheet.h</code>). FreeCAD akan menolak dengan pesan <em>cyclic dependency</em> dan seluruh dokumen berhenti menghitung. Bacaan hasil (Shape.Area, Shape.Volume) dibaca lewat Python console atau Std Measure, bukan dimasukkan kembali ke sel yang mengendalikan geometri.")
    m += bagian(2, "m-spreadsheet", "Optimasi Parametrik:<br>Spreadsheet, Alias, dan Ekspresi", "Model yang tidak bisa dihitung ulang tidak bisa dioptimasi. Bagian ini membangun rantai sel beralias → ekspresi → geometri untuk kaleng bervolume tetap dan kantilever berkendala defleksi, lengkap dengan aturan penulisan pangkat pecahan.", isi, "SPREADSHEET PARAMETRIK")

    # 03 — Studi parameter dengan Python
    isi = figure(3, "Studi parameter tebal pelat dengan dua kendala", f"Pelat kantilever baja {B_P} mm × t × {L_P} mm memikul {ind(F_P, 0)} N: kendala tegangan menuntut t ≥ {ind(T_SIGMA, 3)} mm dan kendala defleksi menuntut t ≥ {ind(T_DELTA, 3)} mm; daerah merah tidak layak, sehingga t_req = {ind(T_REQ, 3)} mm dengan kendala defleksi sebagai kendala aktif.", gambar3())
    isi += formula(3, "Dua Kendala, Dua Batas, Satu Tebal Minimum", r"t_{\sigma} = \sqrt{\frac{6FL}{b\,\sigma_{izin}}}, \qquad t_{\delta} = \left(\frac{4FL^{3}}{E\,b\,\delta_{izin}}\right)^{1/3}, \qquad t_{req} = \max\left(t_{\sigma},\, t_{\delta}\right)",
                   r"\(t_\sigma\) dari \(\sigma_{maks} = 6FL/(bt^{2}) \le \sigma_{izin}\) &nbsp;·&nbsp; \(t_\delta\) dari \(\delta = 4FL^{3}/(Ebt^{3}) \le \delta_{izin}\). Contoh baja \(b = " + str(B_P) + r"\), \(F = " + ind(F_P, 0) + r"\) N, \(L = " + str(L_P) + r"\) mm, \(\sigma_{izin} = " + str(S_IZIN) + r"\) MPa, \(\delta_{izin} = " + ind(D_IZIN, 1) + r"\) mm: \(t_\sigma = " + ind(T_SIGMA, 3) + r"\), \(t_\delta = " + ind(T_DELTA, 3) + r"\), \(t_{req} = " + ind(T_REQ, 3) + r"\) mm.",
                   "Desain harus memenuhi semua kendala sekaligus, jadi tebal minimum adalah yang terbesar di antara semua batas — bukan rata-ratanya. Kendala yang menghasilkan nilai terbesar disebut kendala aktif; kendala lainnya longgar dan tidak memengaruhi ukuran akhir. Karena t_δ tumbuh dengan L³ sedangkan t_σ hanya dengan L^(1/2), balok panjang hampir selalu dikendalikan defleksi, sementara balok pendek berbeban besar dikendalikan tegangan.",
                   [("t_{\\sigma}", "Tebal minimum dari kendala tegangan (mm)"), ("t_{\\delta}", "Tebal minimum dari kendala defleksi (mm)"), ("t_{req}", "Tebal minimum yang memenuhi keduanya (mm)"), ("\\sigma_{izin}, \\delta_{izin}", "Tegangan dan defleksi izin (MPa, mm)")])
    baris = []
    for tt in (35, 40, 45, 50, 55, 60):
        s_, d_ = sig_t(tt), del_t(tt)
        baris.append([f"{tt}", ind(s_, 1), "✅" if s_ <= S_IZIN else "❌", ind(d_, 3), "✅" if d_ <= D_IZIN else "❌", ind(m_pelat(tt), 2), "layak" if s_ <= S_IZIN and d_ <= D_IZIN else "tidak layak"])
    isi += tabel(["Tebal t (mm)", "σ_maks (MPa)", "≤ 100?", "δ ujung (mm)", "≤ 1,0?", "Massa (kg)", "Status"], baris)
    isi += cards([
        ("🔁", "Sapu, jangan tebak", "Loop Python mengatur sel atau properti, memanggil <code>doc.recompute()</code>, lalu membaca Shape. Setiap putaran menghasilkan satu baris data; nilai minimum yang berstatus layak adalah jawaban.", "for t in range(...)"),
        ("♻️", "Recompute wajib", "Tanpa <code>doc.recompute()</code>, Shape yang dibaca masih geometri sebelum perubahan. Gejalanya khas: seluruh baris tabel memberi angka yang sama persis.", "doc.recompute()"),
        ("🗂️", "Simpan hasilnya", "Kumpulkan hasil ke daftar lalu tulis ke Spreadsheet atau berkas CSV. Tabel ini adalah bukti bahwa desain akhir memang minimum, bukan sekadar angka yang kebetulan lolos.", "rows.append(...)"),
        ("🎯", "Perhalus di sekitar optimum", "Sapuan kasar (langkah 5 mm) menemukan daerahnya; sapuan halus (langkah 0,1 mm) menemukan nilainya. Bandingkan hasil akhir dengan rumus analitis Persamaan (3) sebagai pemeriksa.", "langkah 5 → 0,1"),
    ])
    isi += anim_panel(2, "amber", "Sapuan tebal pelat: dua kendala dan massa minimum", "cvBalokMassa",
                      [("sl_bm_F", "v_bm_F", "Beban ujung F (N)", 500, 6000, 100, 3000, "3000"),
                       ("sl_bm_L", "v_bm_L", "Panjang L (mm)", 200, 800, 25, 500, "500"),
                       ("sl_bm_d", "v_bm_d", "Defleksi izin δ_izin (mm)", 0.4, 3, 0.1, 1, "1,0")],
                      "btnBalokMassa", "toggleBalokMassa", "balokMassaInfo",
                      "<strong>Cara membaca:</strong> tebal pelat menyapu dari tipis ke tebal (PAUSE menahan tebal pada t_req). Dua batang di kanan adalah rasio σ/σ_izin dan δ/δ_izin: selama salah satunya di atas garis merah 1,0, desain belum layak. Garis hijau menandai t_req = maks(t_σ, t_δ); ubah L dan lihat bagaimana kendala aktif berpindah dari tegangan ke defleksi.")
    isi += kotak("info-box", "<strong>🐍 Dua cara menyapu parameter:</strong> (1) mengubah <em>sel Spreadsheet</em> dengan <code>sh.set(\"B5\", \"12\")</code> lalu <code>doc.recompute()</code> — seluruh rantai ekspresi ikut terhitung dan paling mirip dengan cara mahasiswa mengerjakannya di GUI; (2) mengubah <em>properti fitur</em> langsung, mis. <code>doc.Pad.Length = 12</code>, yang lebih cepat tetapi memutus ikatan ekspresi bila properti itu sudah terikat ke Spreadsheet. Untuk tugas modul ini pakai cara pertama: pohon fitur dan ekspresinya harus tetap ada di berkas .FCStd yang diunggah.")
    m += bagian(3, "m-studi", "Studi Parameter dengan Python:<br>Menyapu, Menghitung Ulang, Mencatat", "Bila rumus tertutup tidak tersedia, jawaban dicari dengan sapuan: ubah satu variabel, hitung ulang model, baca hasilnya, catat. Bagian ini menyusun sapuan tebal pelat dengan dua kendala sekaligus dan menunjukkan cara menemukan kendala yang aktif.", isi, "STUDI PARAMETER PYTHON")

    # 04 — Optimasi analitis klasik
    isi = figure(4, "Kaleng tertutup dengan luas permukaan minimum", f"Untuk volume tetap {ind(V0, 0)} mm³, luas A(r) = 2πr² + 2V₀/r mencapai minimum {ind(A_OPT, 2)} mm² pada r* = {ind(R_OPT, 2)} mm dengan h* = 2r* = {ind(H_OPT, 2)} mm — tinggi persis sama dengan diameter.", gambar4())
    isi += formula(4, "Kaleng Silinder Tertutup: Luas Minimum pada Volume Tetap", r"A(r) = 2\pi r^{2} + \frac{2V_0}{r}, \qquad \frac{dA}{dr} = 4\pi r - \frac{2V_0}{r^{2}} = 0 \ \Rightarrow\ r^{*} = \left(\frac{V_0}{2\pi}\right)^{1/3},\ \ h^{*} = 2r^{*},\ \ A^{*} = 6\pi r^{*2}",
                   r"Kendala persamaan \(V_0 = \pi r^{2} h\) dipakai untuk menghilangkan \(h\) dari fungsi tujuan, sehingga tersisa satu variabel bebas. Contoh \(V_0 = " + ind(V0, 0) + r"\) mm³: \(r^{*} = " + ind(R_OPT, 4) + r"\) mm, \(h^{*} = " + ind(H_OPT, 4) + r"\) mm, \(A^{*} = " + ind(A_OPT, 2) + r"\) mm².",
                   "Inilah pola optimasi analitis klasik: pakai kendala persamaan untuk mengurangi jumlah variabel, lalu samakan turunan fungsi tujuan dengan nol. Hasilnya, h* = 2r* — proporsi yang sama untuk semua ukuran kaleng, dan mudah diperiksa di FreeCAD lewat Shape.Area. Kaleng minuman nyata lebih ramping daripada ini karena biaya tutup atas berbeda dari dinding dan karena genggaman tangan ikut menjadi kendala: contoh bagus bahwa optimum matematis harus selalu diuji terhadap kendala yang tidak tertulis.",
                   [("A", "Luas permukaan kaleng tertutup (mm²)"), ("V_0", "Volume yang ditetapkan (mm³)"), ("r^{*}", "Jari-jari optimum (mm)"), ("h^{*}", "Tinggi optimum (mm)")])
    isi += formula(5, "Tabung Pengganti Poros Pejal dengan Momen Inersia Sama", r"\frac{\pi d_o^{4}\left(1 - k^{4}\right)}{64} = \frac{\pi d_s^{4}}{64} \ \Rightarrow\ d_o = \frac{d_s}{\left(1 - k^{4}\right)^{1/4}}, \qquad \frac{V_{tabung}}{V_{pejal}} = \frac{d_o^{2}\left(1 - k^{2}\right)}{d_s^{2}}",
                   r"\(k = d_i/d_o\) = rasio diameter dalam terhadap luar (tetap) &nbsp;·&nbsp; \(d_s\) = diameter poros pejal yang digantikan. Contoh \(d_s = " + ind(DS, 0) + r"\) mm, \(k = " + ind(KR, 2) + r"\): \(d_o = " + ind(D_O, 3) + r"\) mm, \(d_i = " + ind(D_I, 3) + r"\) mm, rasio volume \(= " + ind(RASIO_V, 4) + r"\) (hemat " + ind((1 - RASIO_V) * 100, 1) + r" %).",
                   "Momen inersia tumbuh dengan pangkat empat jarak ke sumbu, sehingga bahan di dekat sumbu hampir tidak menyumbang kekakuan. Mengosongkan inti dan memperbesar diameter luar sedikit saja mengembalikan I yang sama dengan bahan jauh lebih sedikit. Batasnya bukan matematika melainkan manufaktur dan tekuk lokal: dinding yang terlalu tipis mudah penyok, sukar dilas, dan menaikkan biaya. Karena itu k biasanya dibatasi 0,6–0,8 untuk poros baja.",
                   [("d_o, d_i", "Diameter luar dan dalam tabung (mm)"), ("d_s", "Diameter poros pejal semula (mm)"), ("k", "Rasio d_i/d_o (—)"), ("I", "Momen inersia penampang (mm⁴)")])
    isi += tabel(["Kasus klasik", "Fungsi tujuan", "Kendala", "Hasil optimum", "Bukti di FreeCAD"],
                 [["Kaleng silinder tertutup", "luas permukaan A", "volume V₀ tetap", "h* = 2r*, A* = 6πr*²", "<code>Body.Shape.Area</code>"],
                  ["Kaleng tanpa tutup atas", "luas A = πr² + 2V₀/r", "volume V₀ tetap", "h* = r* (setengah kasus tertutup)", "Shape.Area muka terpilih"],
                  ["Balok massa minimum", "massa ∝ h", "δ ≤ δ_izin", f"h_req = (4FL³/(Ebδ))^(1/3) = {ind(H_REQ_AL, 3)} mm", "<code>Shape.Volume</code> × ρ"],
                  ["Pelat dua kendala", "massa ∝ t", "σ ≤ σ_izin dan δ ≤ δ_izin", f"t_req = maks = {ind(T_REQ, 3)} mm", "Spreadsheet <code>max(…; …)</code>"],
                  ["Tabung vs poros pejal", "volume bahan", "I sama", f"d_o = d_s/(1 − k⁴)^(1/4) = {ind(D_O, 3)} mm", "bandingkan Shape.Volume"]])
    isi += anim_panel(3, "green", "Tabung berongga menggantikan poros pejal dengan kekakuan sama", "cvTabung",
                      [("sl_tb_ds", "v_tb_ds", "Diameter poros pejal d_s (mm)", 20, 80, 1, 50, "50"),
                       ("sl_tb_k", "v_tb_k", "Rasio k = d_i/d_o", 0, 0.9, 0.05, 0.75, "0,75")],
                      "btnTabung", "toggleTabung", "tabungInfo",
                      "<strong>Cara membaca:</strong> lingkaran kiri adalah poros pejal ⌀d_s; lingkaran kanan adalah tabung yang tumbuh sampai momen inersianya persis sama (PAUSE menahan ukuran akhir). Batang di kanan membandingkan luas penampang — dan karena panjangnya sama, itu juga rasio volume dan massanya. Naikkan k dan lihat penghematan bahan bertambah sementara diameter luar hanya sedikit membesar.")
    isi += kotak("tip-box", "💡 <strong>Memeriksa optimum analitis di model:</strong> buat sel <code>A_rumus</code> berisi <code>=6*pi*r^2</code> dan bandingkan dengan <code>Body.Shape.Area</code> di Python console. Selisih lebih dari 0,1 % hampir selalu berarti sketsa belum <em>fully constrained</em>, ada muka ganda akibat Boolean, atau Pad memakai panjang lama karena belum recompute. Untuk kaleng, luas Shape mencakup dinding dan <em>kedua</em> tutup; bila hasilnya kira-kira 2πrh saja, berarti Pad menghasilkan permukaan terbuka, bukan solid.")
    m += bagian(4, "m-analitis", "Optimasi Analitis Klasik:<br>Kaleng, Balok, dan Tabung", "Beberapa masalah desain punya jawaban tertutup yang elegan dan berlaku untuk semua ukuran. Bagian ini menurunkan tiga di antaranya — luas kaleng minimum, tinggi balok minimum, dan tabung pengganti poros pejal — sebagai pembanding bagi hasil sapuan parameter.", isi, "OPTIMUM ANALITIS")

    # 05 — Perbandingan alternatif desain
    isi = figure(5, "Matriks keputusan berbobot untuk tiga alternatif lengan braket", f"Lengan rak {B_R} mm × h × {L_R} mm memikul {ind(F_R, 0)} N dengan defleksi ujung maksimum {ind(D_R, 1)} mm. Ketiganya layak secara kekuatan dan kekakuan, tetapi berbeda pada massa, jejak CO₂, biaya, kemudahan pembuatan, dan tinggi terpasang; skor berbobot memilih alternatif B.", gambar5())
    isi += formula(6, "Skor Berbobot Matriks Keputusan (Pugh Berbobot)", r"S_j = \sum_{i=1}^{n} w_i\,s_{ij}, \qquad \sum_{i=1}^{n} w_i = 1, \qquad s_{ij} \in \{-1,\, 0,\, +1\}",
                   r"\(w_i\) = bobot kriteria ke-\(i\) (ditetapkan sebelum angka dilihat) &nbsp;·&nbsp; \(s_{ij}\) = penilaian alternatif ke-\(j\) terhadap datum: +1 lebih baik, 0 setara, −1 lebih buruk. Contoh modul ini: \(S_B = " + ind(TOTAL_B, 2) + r"\) dan \(S_C = " + ind(TOTAL_C, 2) + r"\) terhadap datum \(S_A = 0\).",
                   "Matriks keputusan memaksa perbandingan yang adil: semua alternatif dinilai terhadap satu desain acuan (datum) pada kriteria yang sama. Karena bobot ditetapkan lebih dahulu, keputusan tidak bisa “disetir” setelah angka keluar. Bila dua alternatif berselisih tipis, lakukan uji kepekaan: ubah bobot ±0,05 dan lihat apakah pemenangnya berganti — bila ya, kriteria itulah yang harus diukur lebih teliti sebelum diputuskan.",
                   [("S_j", "Skor berbobot alternatif ke-j (—)"), ("w_i", "Bobot kriteria ke-i (—)"), ("s_{ij}", "Penilaian terhadap datum (−1, 0, +1)"), ("n", "Jumlah kriteria (—)")])
    isi += tabel(["Alternatif", "Tinggi h (mm)", "Massa (kg)", "Jejak CO₂ (kg)", "Catatan manufaktur", "Skor berbobot"],
                 [["A — pelat baja pejal (datum)", ind(H_R_ST, 2), ind(M_R_ST, 2), ind(CO2_R_ST, 1), "satu Pad, paling sederhana", "0,00"],
                  ["B — pelat baja berusuk", f"{ind(H_R_ST, 2)} (I setara)", ind(M_R_RUSUK, 2), ind(CO2_R_RUSUK, 1), "butuh rusuk las/pemesinan", f"+{ind(TOTAL_B, 2)}"],
                  ["C — pelat aluminium pejal", ind(H_R_AL, 2), ind(M_R_AL, 2), ind(CO2_R_AL, 1), "mudah dipesin, tinggi bertambah", ind(TOTAL_C, 2)]])
    isi += cards([
        ("⚖️", "Datum yang jujur", "Pilih desain yang sudah pernah dibuat sebagai datum, bukan yang paling disukai. Semua kolom dibandingkan terhadapnya sehingga tanda + dan − punya arti yang sama di setiap baris.", "s = +1 / 0 / −1"),
        ("📊", "Bobot dulu, angka kemudian", "Sepakati bobot bersama pemangku kepentingan sebelum hasil simulasi dibuka. Jumlah bobot 1,00 agar skor dapat dibandingkan antarproyek.", "Σ w = 1,00"),
        ("🔍", "Uji kepekaan", "Geser bobot ±0,05 dan periksa apakah pemenangnya bertahan. Keputusan yang berubah karena pergeseran kecil berarti belum cukup data, bukan berarti kedua desain setara.", "Δw = ±0,05"),
        ("📝", "Catat alasan penilaian", "Setiap tanda − harus punya kalimat alasannya (mis. “rusuk menuntut satu operasi las tambahan”). Tanpa alasan, matriks berubah menjadi selera yang berangka.", "alasan per sel"),
    ])
    isi += kotak("info-box", "<strong>🧱 Tiga alternatif itu di FreeCAD:</strong> jangan membuat tiga dokumen terpisah. Buat satu Spreadsheet berisi alias <code>E</code>, <code>rho</code>, <code>f_co2</code>, lalu tiga kolom nilai untuk baja pejal, baja berusuk, dan aluminium; sel <code>h</code>, <code>massa</code>, dan <code>CO2</code> menghitung ketiganya berdampingan. Model 3D cukup dibuat untuk alternatif yang menang, sedangkan dua lainnya cukup diwakili angka di Spreadsheet — itulah gunanya model parametrik: alternatif dievaluasi tanpa harus digambar semuanya.")
    m += bagian(5, "m-alternatif", "Perbandingan Alternatif Desain:<br>Matriks Keputusan Berbobot", "Sering kali lebih dari satu desain memenuhi semua kendala. Bagian ini membandingkan tiga alternatif lengan braket dengan kriteria dan bobot yang disepakati lebih dahulu, lalu menghitung skor berbobotnya terhadap satu datum.", isi, "ALTERNATIF DESAIN")

    # 06 — Kendala lingkungan dalam fungsi tujuan
    isi = figure(6, "Jejak CO₂ baja versus aluminium pada kekakuan lentur yang sama", f"Untuk kekakuan yang sama, lengan aluminium harus {ind(H_R_AL / H_R_ST, 2)}× lebih tinggi ({ind(H_R_AL, 2)} mm) tetapi hanya bermassa {ind(M_R_AL, 2)} kg dibanding {ind(M_R_ST, 2)} kg. Meski begitu, faktor emisinya enam kali lipat, sehingga jejaknya {ind(CO2_R_AL, 0)} kg CO₂ melawan {ind(CO2_R_ST, 0)} kg CO₂ untuk baja.", gambar6())
    isi += formula(7, "Jejak Karbon Bahan dan Indeks Lingkungan untuk Kekakuan Sama", r"C = f\,\rho\,V = f\,\rho\,b\,L\,h, \qquad h \propto E^{-1/3} \ \Rightarrow\ C \propto \frac{f\,\rho}{E^{1/3}}",
                   r"\(f\) = faktor emisi bahan (kg CO₂ per kg) &nbsp;·&nbsp; \(\rho\) = massa jenis &nbsp;·&nbsp; \(V\) = volume dari <code>Shape.Volume</code>. Baja: \(f = " + ind(FE_ST, 1) + r"\), \(\rho = 7850\) kg/m³ → indeks " + ind(IDX_ST, 0) + r"; aluminium: \(f = " + ind(FE_AL, 1) + r"\), \(\rho = 2700\) → indeks " + ind(IDX_AL, 0) + r". Makin kecil indeks, makin rendah jejaknya pada kekakuan yang sama.",
                   "Kendala lingkungan masuk ke perhitungan dengan cara yang sama seperti tegangan dan defleksi: sebagai angka yang dihitung dari model. Karena massa pada kekakuan sama sebanding dengan ρ/E^(1/3), maka jejaknya sebanding dengan f·ρ/E^(1/3) — indeks material Ashby dengan faktor emisi. Aluminium menang telak pada massa (baik untuk kendaraan yang bergerak), tetapi kalah pada jejak bahan untuk komponen diam seperti rak. Bila komponen ikut bergerak atau umurnya panjang, energi pemakaian harus ikut dihitung dan kesimpulannya bisa berbalik.",
                   [("C", "Jejak karbon bahan (kg CO₂)"), ("f", "Faktor emisi bahan (kg CO₂/kg)"), ("\\rho", "Massa jenis (kg/m³ atau kg/mm³)"), ("V", "Volume komponen (mm³)"), ("E", "Modulus elastisitas (MPa)")])
    isi += tabel(["Material", "E (MPa)", "ρ (kg/m³)", "f (kg CO₂/kg)", "h untuk E·I sama (mm)", "Massa (kg)", "Jejak CO₂ (kg)", "Indeks f·ρ/E^(1/3)"],
                 [["Baja S235", ind(E_ST, 0), "7.850", ind(FE_ST, 1), ind(H_R_ST, 2), ind(M_R_ST, 2), ind(CO2_R_ST, 1), ind(IDX_ST, 0)],
                  ["Baja S235 (30 % daur ulang)", ind(E_ST, 0), "7.850", "1,4", ind(H_R_ST, 2), ind(M_R_ST, 2), ind(1.4 * M_R_ST, 1), ind(1.4 * 7850 / E_ST ** (1 / 3), 0)],
                  ["Aluminium 6061 (primer)", ind(E_AL, 0), "2.700", ind(FE_AL, 1), ind(H_R_AL, 2), ind(M_R_AL, 2), ind(CO2_R_AL, 1), ind(IDX_AL, 0)],
                  ["Aluminium 6061 (daur ulang)", ind(E_AL, 0), "2.700", "2,3", ind(H_R_AL, 2), ind(M_R_AL, 2), ind(2.3 * M_R_AL, 1), ind(2.3 * 2700 / E_AL ** (1 / 3), 0)]])
    isi += anim_panel(4, "violet", "Jejak CO₂ dua material terhadap beban pada kekakuan sama", "cvJejak",
                      [("sl_jj_F", "v_jj_F", "Beban ujung F (N)", 1000, 8000, 250, 4000, "4000"),
                       ("sl_jj_L", "v_jj_L", "Panjang lengan L (mm)", 300, 1000, 25, 700, "700"),
                       ("sl_jj_b", "v_jj_b", "Lebar b (mm)", 50, 200, 10, 100, "100")],
                      "btnJejak", "toggleJejak", "jejakInfo",
                      "<strong>Cara membaca:</strong> beban menyapu naik-turun (PAUSE menahan nilai slider F). Untuk setiap beban, tinggi h masing-masing material dihitung agar defleksinya sama, lalu massa dan jejak CO₂-nya dibandingkan. Perhatikan bahwa batang massa dan batang CO₂ memberi pemenang yang berbeda: aluminium selalu lebih ringan, baja selalu lebih rendah jejaknya untuk kekakuan yang sama.")
    isi += kotak("warning-box", "⚠️ <strong>Batas klaim “ramah lingkungan”:</strong> angka di modul ini hanya mencakup <em>jejak bahan</em> (produksi material per kg). Jejak sebenarnya juga memuat proses pemesinan, transportasi, pemakaian, dan akhir masa pakai. Aluminium daur ulang memangkas faktor emisinya sampai seperlima, sedangkan baja daur ulang memangkas sekitar 30 %; karena itu pilihan material tidak boleh diklaim rendah karbon tanpa menyebut asal bahannya. Sebutkan batas sistem yang dipakai di laporan (Bagian 07) agar klaimnya dapat diperiksa.")
    m += bagian(6, "m-lingkungan", "Kendala Lingkungan:<br>Massa, Energi, dan Jejak CO₂", "Efisiensi bahan bukan lagi bonus, melainkan kriteria yang diminta pelanggan. Bagian ini memasukkan jejak karbon ke dalam perhitungan sebagai besaran yang dihitung dari volume model, dan menunjukkan mengapa desain paling ringan belum tentu paling rendah jejaknya.", isi, "KENDALA LINGKUNGAN")

    # 07 — Dokumentasi hasil optimasi
    isi = tabel(["Bagian laporan optimasi", "Isi minimum", "Sumber di FreeCAD", "Mengapa diperlukan"],
                [["Rumusan masalah", "fungsi tujuan, variabel, kendala, batas", "Spreadsheet: baris alias dan nilainya", "menjelaskan apa yang dioptimasi dan apa yang tidak"],
                 ["Model parametrik", "pohon fitur, ekspresi yang mengikat konstrain", "Model tree + tab Data (nilai biru)", "membuktikan desain dapat diiterasi ulang"],
                 ["Tabel iterasi", "satu baris per percobaan: variabel, σ, δ, massa, CO₂", "Spreadsheet baris 10 ke bawah / CSV Python", "menunjukkan optimum, bukan tebakan yang beruntung"],
                 ["Verifikasi", "rumus analitis vs bacaan model (selisih %)", "Python console: Shape.Area, Shape.Volume", "menangkap salah satuan dan sketsa yang belum terkunci"],
                 ["Matriks keputusan", "kriteria, bobot, skor, alasan tiap tanda", "Spreadsheet lembar kedua", "membuat pilihan akhir dapat ditelusuri"],
                 ["Gambar kerja", "pandangan, dimensi kritis, toleransi, catatan bahan", "TechDraw: Page, ProjectionGroup, Dimension", "menyerahkan hasil ke bengkel tanpa salah tafsir"]])
    isi += cards([
        ("📄", "TechDraw untuk desain terpilih", "Buat Page, ProjectionGroup tiga pandangan, lalu beri dimensi pada variabel hasil optimasi (h_req, t_req, d_o). Dimensi TechDraw mengambil nilai dari model, jadi ikut berubah bila Spreadsheet diperbarui.", "Insert Dimension"),
        ("🔢", "Cantumkan angka bacaannya", "Tulis luas, volume, massa, dan jejak CO₂ hasil akhir di kolom catatan gambar. Inilah angka yang diminta pada kartu tugas dan yang akan diperiksa pembaca.", "A · V · m · CO₂"),
        ("🧾", "Batas sistem yang jujur", "Sebutkan faktor emisi yang dipakai, asal bahan (primer atau daur ulang), dan apa yang tidak dihitung. Klaim lingkungan tanpa batas sistem tidak dapat diperiksa.", "f = 2,0 / 12,0"),
        ("💾", "Simpan yang bisa dibuka lagi", "Satu berkas .FCStd berisi Spreadsheet, Body, dan halaman TechDraw. Ekspor PDF untuk lampiran, tetapi berkas sumber tetap yang diunggah agar ekspresinya dapat diperiksa.", "Ctrl+S · .FCStd"),
    ])
    isi += kotak("tip-box", "💡 <strong>Tabel iterasi yang baik:</strong> kolom pertama nomor iterasi, lalu semua variabel desain, lalu semua besaran hasil (σ, δ, massa, CO₂), lalu satu kolom status (layak / tidak) dan satu kolom keputusan (“lanjut”, “ditolak: δ melebihi batas”). Baris terakhir adalah desain terpilih dan ditandai. Tabel seperti ini sekaligus menjawab pertanyaan penguji yang paling sering muncul: “bagaimana Anda tahu tidak ada desain yang lebih baik?”")
    m += bagian(7, "m-dokumentasi", "Dokumentasi Hasil Optimasi:<br>Tabel Iterasi, TechDraw, dan Laporan", "Optimasi yang tidak terdokumentasi tidak dapat dipertahankan. Bagian ini menyusun isi minimum laporan optimasi: rumusan masalah, model parametrik, tabel iterasi, verifikasi, matriks keputusan, dan gambar kerja desain terpilih.", isi, "DOKUMENTASI HASIL")

    # 08 — Python console
    isi = kode("Python console — Spreadsheet beralias untuk kaleng bervolume tetap dan bacaan luas", f'''import FreeCAD as App, Part, math
doc = App.newDocument("Latihan14")
sh = doc.addObject("Spreadsheet::Sheet", "Spreadsheet")
sel = [("V0", "{int(V0)}"), ("r", "=(V0 / (2 * pi))^(1/3)"), ("h", "=2 * r"), ("A", "=6 * pi * r^2")]
for baris, (alias, nilai) in enumerate(sel, start=1):
    sh.set(f"A{{baris}}", alias); sh.set(f"B{{baris}}", nilai); sh.setAlias(f"B{{baris}}", alias)
doc.recompute()                                           # tanpa ini, sel rumus masih kosong
r, h, A = float(sh.get("r")), float(sh.get("h")), float(sh.get("A"))
print(f"r* = {{r:.4f}} mm, h* = {{h:.4f}} mm, A rumus = {{A:.2f}} mm2")   # {ind(R_OPT, 4)}, {ind(H_OPT, 4)}, {ind(A_OPT, 2)}
kaleng = Part.makeCylinder(r, h)
print(f"Volume model {{kaleng.Volume:.1f}} mm3 (target {int(V0)}), Shape.Area {{kaleng.Area:.2f}} mm2")
for rr in (30, 36, 43, 50, 60):
    print(f"r = {{rr:3d}}: A = {{2*math.pi*rr**2 + 2*{int(V0)}/rr:9.1f}} mm2")   # terkecil di sekitar r*''', "Python (FreeCAD)")
    isi += kode("Python console — sapuan tebal pelat dengan dua kendala: kendala aktif dan massa minimum", f'''import math
F, L, b, E = {F_P}, {L_P}, {B_P}, {E_ST}
s_izin, d_izin, rho = {S_IZIN}, {D_IZIN}, 7.85e-6                 # MPa, mm, kg/mm3
t_sigma = math.sqrt(6*F*L/(b*s_izin))
t_delta = (4*F*L**3/(E*b*d_izin))**(1/3)
t_req = max(t_sigma, t_delta)
print(f"t_sigma {{t_sigma:.3f}}  t_delta {{t_delta:.3f}}  t_req {{t_req:.3f}} mm")   # {ind(T_SIGMA, 3)} {ind(T_DELTA, 3)} {ind(T_REQ, 3)}
print("  t     sigma      delta     massa   status")
for tb in [35, 40, 45, 50, 55, 60]:
    sg = 6*F*L/(b*tb**2); dl = 4*F*L**3/(E*b*tb**3); ms = rho*b*L*tb
    ok = "layak" if sg <= s_izin and dl <= d_izin else "tidak"
    print(f"{{tb:3d}}  {{sg:8.2f}}  {{dl:9.4f}}  {{ms:7.3f}}  {{ok}}")
aktif = "defleksi" if t_delta >= t_sigma else "tegangan"
print(f"Kendala aktif: {{aktif}}, massa minimum {{rho*b*L*t_req:.3f}} kg")   # {ind(m_pelat(T_REQ), 3)} kg''', "Python (FreeCAD)")
    isi += kode("Python console — tabung pengganti poros pejal dan perbandingan jejak CO2 dua material", f'''import FreeCAD as App, Part, math
ds, k = {DS}, {KR}
do = ds/(1 - k**4)**0.25; di = k*do
pejal = Part.makeCylinder(ds/2, 100)
tabung = Part.makeCylinder(do/2, 100).cut(Part.makeCylinder(di/2, 100))
I_p, I_t = math.pi*ds**4/64, math.pi*(do**4 - di**4)/64
print(f"do {{do:.3f}} mm, di {{di:.3f}} mm; I pejal {{I_p:.0f}} vs tabung {{I_t:.0f}} mm4")   # {ind(D_O, 3)}, {ind(D_I, 3)}
print(f"Volume tabung/pejal {{tabung.Volume/pejal.Volume:.4f}} (hemat {{100*(1-tabung.Volume/pejal.Volume):.1f}} persen)")   # {ind(RASIO_V, 4)}
F, L, b, d_izin = {F_R}, {L_R}, {B_R}, {D_R}
for nama, E, rho, f_co2 in [("baja", {E_ST}, 7.85e-6, {FE_ST}), ("aluminium", {E_AL}, 2.70e-6, {FE_AL})]:
    h = (4*F*L**3/(E*b*d_izin))**(1/3); massa = rho*b*L*h
    print(f"{{nama:10s}} h {{h:6.2f}} mm, massa {{massa:6.2f}} kg, CO2 {{f_co2*massa:7.2f}} kg")
Part.show(tabung, "TabungKakuSama")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (r* " + ind(R_OPT, 4) + " mm, A* " + ind(A_OPT, 2) + " mm², t_σ " + ind(T_SIGMA, 3) + " mm, t_δ " + ind(T_DELTA, 3) + " mm, d_o " + ind(D_O, 3) + " mm, rasio volume " + ind(RASIO_V, 4) + "). Tugas tetap meminta model dibuat lewat GUI dengan Spreadsheet beralias, Sketch berekspresi, dan Pad/Pocket sehingga pohon fiturnya tersimpan di berkas .FCStd; Part API di cell ini hanya alat pemeriksa rumus, bukan pengganti model.")
    m += bagian(8, "m-python", "Python Console:<br>Spreadsheet, Sapuan Parameter, dan Pembanding", "Cell pertama membangun Spreadsheet beralias untuk kaleng lewat API dan membaca luasnya; cell kedua menyapu tebal pelat terhadap dua kendala dan menunjuk kendala aktif; cell ketiga membandingkan tabung dengan poros pejal serta jejak CO₂ dua material pada kekakuan sama.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Rumuskan masalahnya", "Tulis di lembar pertama Spreadsheet: fungsi tujuan (massa dan jejak CO₂ lengan braket), variabel desain (material dan tinggi h), kendala (δ ≤ 1,5 mm pada F = 4.000 N, L = 700 mm, b = 100 mm), serta batas variabel (h ≤ 90 mm karena ruang pasang). Beri alias F, L, b, d_izin, E, rho, f_co2."),
               ("2", "Bangun model parametrik", "Body baru: Sketch YZ persegi panjang b × h dengan kedua konstrain terikat ekspresi <code>=Spreadsheet.b</code> dan <code>=Spreadsheet.h</code>, lalu Pad <code>=Spreadsheet.L</code>. Pastikan sketsa fully constrained dan nilai konstrain berwarna biru."),
               ("3", "Hitung tinggi dari kendala", "Tambahkan sel <code>h = (4*F*L^3/(E*b*d_izin))^(1/3)</code>. Ctrl+R, lalu catat h, Shape.Volume, massa = rho × Volume, dan CO2 = f_co2 × massa untuk baja sebagai iterasi 0 (datum)."),
               ("4", "Sapu parameter", "Jalankan cell kedua Bagian 08 dengan angka kasus ini untuk menyapu h dari 30 sampai 90 mm; tandai h terkecil yang masih memenuhi δ ≤ 1,5 mm dan cocokkan dengan nilai sel h. Selisih di atas 0,5 % berarti ada satuan yang salah."),
               ("5", "Bandingkan alternatif", "Kolom kedua Spreadsheet: aluminium (E 70.000, ρ 2.700, f 12,0). Kolom ketiga: baja berusuk dengan massa 60 % pelat pejal pada I setara. Hitung h, massa, dan CO₂ ketiganya berdampingan."),
               ("6", "Matriks keputusan", "Lembar kedua: lima kriteria dengan bobot 0,25 / 0,25 / 0,20 / 0,15 / 0,15, nilai −1, 0, +1 terhadap datum baja pejal, lalu skor berbobot Persamaan (6). Tulis satu kalimat alasan untuk setiap tanda − yang diberikan."),
               ("7", "Dokumentasikan dan simpan", "TechDraw: Page + tiga pandangan desain pemenang, dimensi pada h dan b, catatan berisi massa, jejak CO₂, dan faktor emisi yang dipakai. Ctrl+S → <code>Latihan14_NIM.FCStd</code>.")]
    isi = '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["Ekspresi merah: <em>Invalid expression</em> pada pangkat pecahan", "Sel memakai satuan (mm) sehingga pangkat 1/3 ditolak", "Tulis angka polos tanpa satuan; pakai <code>^(1/3)</code> atau <code>pow(x; 1/3)</code>"],
                  ["<em>Unknown alias</em> walau sel terlihat ada", "Alias belum dibuat atau beda huruf besar-kecil", "Klik kanan sel → Properties → Alias; nama persis sama dengan yang dirujuk"],
                  ["Semua baris sapuan memberi angka identik", "<code>doc.recompute()</code> tidak dipanggil di dalam loop", "Panggil recompute setiap putaran sebelum membaca Shape"],
                  ["<em>Cyclic dependency</em> dan dokumen berhenti menghitung", "Sel membaca properti fitur yang sudah terikat ke sel itu", "Putus salah satu arah: bacaan hasil dibaca lewat Python/Std Measure, bukan dimasukkan ke sel pengendali"],
                  ["Shape.Area kaleng kira-kira separuh nilai rumus", "Pad menghasilkan permukaan terbuka, bukan solid", "Sketsa harus lingkaran tertutup; centang <em>Solid</em> pada Pad"],
                  [f"t_req hasil sapuan jauh di atas {ind(T_REQ, 1)} mm", "δ_izin atau E memakai satuan berbeda (m vs mm, GPa vs MPa)", "Samakan ke N, mm, MPa; periksa E = 210.000 MPa, bukan 210"],
                  ["Massa FreeCAD berbeda dari ρ × Volume", "Material Body belum diatur atau ρ dalam kg/m³", "Body → Material, atau hitung 7,85×10⁻⁶ kg/mm³ × Volume(mm³)"],
                  ["Skor matriks berubah-ubah tiap kali dihitung", "Bobot ditetapkan setelah melihat angka", "Sepakati bobot lebih dahulu, lalu uji kepekaan ±0,05"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) Spreadsheet berisi alias yang diminta tugas dan sel rumusnya (r/h/A, h_req, d_o, t_req, massa, CO2); (2) konstrain sketsa terikat ekspresi (nilai biru) dan sketsa fully constrained; (3) Body satu solid dengan pohon fitur sesuai tugas (Sketch → Pad, dua lingkaran sepusat untuk tabung); (4) angka bacaan diambil dari sel Spreadsheet atau Shape sesuai label, dengan jumlah desimal yang diminta; (5) satuan konsisten N–mm–MPa; (6) berkas tersimpan lewat Ctrl+S dengan nama tanpa spasi.")
    isi += kotak("info-box", "<strong>🎓 Penutup semester — Pertemuan 15:</strong> modul ini menutup rangkaian CPMK 5 (desain berkelanjutan dan optimasi): Modul 13 memperkenalkan siklus hidup, pemilihan material, dan jejak bahan (Sub-CPMK 5.1), sedangkan Modul 14 menjadikannya kriteria keputusan yang dihitung dari model parametrik (Sub-CPMK 5.2). Bersama CPMK 1–2 (sketsa, pemodelan, proyeksi), CPMK 3 (simulasi dan evaluasi), dan CPMK 4 (perakitan serta perbaikan desain), semuanya menjadi bahan <strong>Ujian Akhir Semester</strong>: siapkan ringkasan rumus tiap modul, satu berkas .FCStd contoh dari tiap CPMK, dan tabel iterasi terakhir Anda sebagai bahan belajar. Jangan lupa menuntaskan forum dan kelima tugas modul ini sebelum jadwal UAS dibuka.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Optimasi Lengan Braket dari Rumusan sampai Laporan", "Tujuh langkah berikut menjalankan satu putaran optimasi utuh pada lengan braket rak: merumuskan masalah, membangun model parametrik, menghitung tinggi dari kendala, menyapu parameter, membandingkan tiga alternatif, menyusun matriks keputusan, dan mendokumentasikannya di TechDraw.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: Spreadsheet Workbench, Expressions, PartDesign Pad/Pocket, TechDraw Workbench, Part TopoShape", " (wiki.freecad.org), 2024–2026.", "Acuan alias, sintaks ekspresi dan fungsi (pow, sqrt, max), pembacaan Shape.Area/Shape.Volume, dan pembuatan gambar kerja.")
    refs += pm_ref(2, "amber", "249,115,22", "J. S. Arora", "Introduction to Optimum Design", ", 4th ed. Academic Press, 2017.", "Bentuk baku masalah optimasi, kendala aktif, dan studi parameter; dasar Persamaan (1) serta Bagian 01–03.")
    refs += pm_ref(3, "violet", "168,85,247", "M. F. Ashby", "Materials Selection in Mechanical Design", ", 5th ed. Butterworth-Heinemann, 2017.", "Indeks material untuk kekakuan dan indeks jejak karbon f·ρ/E^(1/3) yang dipakai Bagian 06.")
    refs += pm_ref(4, "green", "0,224,158", "R. G. Budynas &amp; J. K. Nisbett", "Shigley's Mechanical Engineering Design", ", 11th ed. McGraw-Hill, 2020.", "Tegangan lentur, defleksi kantilever, dan momen inersia penampang lingkaran berongga (Persamaan 3 dan 5).")
    refs += pm_ref(5, "pink", "236,72,153", "D. G. Ullman", "The Mechanical Design Process", ", 6th ed. McGraw-Hill, 2018.", "Matriks keputusan Pugh berbobot, uji kepekaan bobot, dan dokumentasi keputusan desain (Bagian 05 dan 07).")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari bentuk baku masalah optimasi, optimasi parametrik di FreeCAD, optimum analitis klasik, pemilihan material dengan indeks jejak karbon, dan matriks keputusan. Dokumentasi Spreadsheet serta Expressions adalah pendamping wajib karena sintaks fungsi dan pemisah argumen mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Spreadsheet Workbench (alias, Set alias), Expressions (pow, sqrt, max, pemisah argumen), PartDesign Pad, TechDraw Page dan Dimension, serta Part TopoShape (Area, Volume). Basis data faktor emisi bahan (mis. ICE/Ecoinvent ringkasan kelas) dipakai hanya sebagai angka kelas; laporan nyata harus menyebutkan sumber dan batas sistemnya. Video tutorial pada daftar putar RPS memperlihatkan urutan klik, sedangkan modul ini memberi rumus untuk memeriksa hasil tiap iterasi.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 14 — Optimasi Desain untuk Efisiensi dan Lingkungan · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = '''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">A = 6π·r*²</span>
    <span class="ff" style="left:26%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">h_req = (4FL³/Ebδ)^(1/3)</span>
    <span class="ff" style="left:46%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">d_o = d_s/(1−k⁴)^(1/4)</span>
    <span class="ff" style="left:66%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">t_req = maks(t_σ, t_δ)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">CO₂ = f·ρ·V</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 15 · Optimasi Desain untuk Efisiensi dan Lingkungan</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 14</span><br><em>Lima Model</em><br>yang Dioptimasi</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang formulasi optimasi, Spreadsheet beralias, studi parameter, optimum analitis, matriks keputusan, dan jejak karbon, ditambah 5 tugas pemodelan parametrik: kaleng tertutup berluas minimum, tinggi minimum kantilever aluminium dari kendala defleksi, tabung pengganti poros pejal dengan kekakuan sama, tebal minimum pelat dengan dua kendala sekaligus, dan pemilihan material berjejak karbon terkecil. Setiap tugas mengunggah berkas .FCStd (Spreadsheet dan Body berekspresi) serta mengisi satu angka hasil optimasi. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Sebuah <strong>masalah optimasi desain</strong> dikatakan terumuskan lengkap bila memuat...",
     ["Hanya daftar dimensi yang boleh diubah", "Fungsi tujuan yang diminimumkan atau dimaksimumkan, variabel desain yang boleh diubah, dan kendala yang membatasi ruang layak", "Hanya kendala tegangan dan defleksi", "Hanya pilihan material dan proses pembuatan"],
     "Formulasi optimasi"),
    ("<strong>Alias</strong> pada Spreadsheet FreeCAD dipakai untuk...",
     ["Mengunci sel agar tidak dapat diedit siapa pun", "Mengubah satuan seluruh dokumen sekaligus", "Memberi nama sel (mis. V0, r, h_req) sehingga konstrain sketsa dan properti fitur dapat merujuknya lewat ekspresi =Spreadsheet.nama", "Menyalin isi sel ke dokumen FreeCAD lain"],
     "Alias Spreadsheet"),
    ("Kaleng silinder <strong>tertutup</strong> bervolume tetap V₀ memiliki luas permukaan terkecil bila...",
     ["r* = (V₀/(2π))^(1/3) dan h* = 2r*, sehingga tinggi sama dengan diameter dan A* = 6π·r*²", "r* = (V₀/π)^(1/3) dan h* = r*, sehingga tinggi sama dengan jari-jari", "r sekecil mungkin agar luas tutup mengecil", "h sekecil mungkin agar luas dinding mengecil"],
     "Kaleng luas minimum"),
    ("Urutan yang benar pada <strong>studi parameter dengan Python</strong> di FreeCAD adalah...",
     ["Membaca Shape, menetapkan nilai sel, lalu recompute", "Menetapkan nilai sel lalu langsung membaca Shape tanpa recompute", "Recompute sekali di awal lalu menyapu seluruh nilai", "Menetapkan nilai sel atau properti → doc.recompute() → membaca Shape (Volume, Area, BoundBox) → menyimpan hasilnya ke daftar atau CSV"],
     "Studi parameter Python"),
    ("Tinggi minimum kantilever persegi panjang (lebar b, beban ujung F, panjang L, modulus E) agar defleksi ujung tidak melebihi δ_izin adalah...",
     ["h_req = 6·F·L/(b·δ_izin)", "h_req = (4·F·L³/(E·b·δ_izin))^(1/3)", "h_req = √(4·F·L³/(E·b·δ_izin))", "h_req = E·b·δ_izin/(4·F·L³)"],
     "Tinggi minimum dari δ"),
    ("Poros pejal ⌀d_s diganti tabung dengan rasio k = d_i/d_o tanpa mengurangi <strong>momen inersia</strong>. Diameter luar tabung adalah...",
     ["d_o = d_s·(1 − k⁴)^(1/4)", "d_o = d_s/(1 − k²)^(1/2)", "d_o = d_s/(1 − k⁴)^(1/4), dan volumenya d_o²(1 − k²)/d_s² kali volume poros pejal", "d_o = d_s karena momen inersia hanya bergantung pada diameter luar"],
     "Tabung kekakuan sama"),
    ("<strong>Matriks keputusan Pugh</strong> membandingkan alternatif desain dengan cara...",
     ["Menilai tiap alternatif terhadap satu desain acuan (datum) per kriteria dengan +, 0, atau −, lalu menjumlahkannya (berbobot bila kriteria tidak sama penting)", "Menjumlahkan seluruh angka hasil simulasi tanpa bobot", "Memilih alternatif dengan massa terkecil tanpa kriteria lain", "Mengurutkan alternatif menurut biaya bahan saja"],
     "Matriks keputusan"),
    ("Pelat kantilever harus memenuhi kendala tegangan (memberi t_σ) <em>dan</em> kendala defleksi (memberi t_δ). Tebal minimum yang dipakai adalah...",
     ["Rata-rata t_σ dan t_δ", "Yang terkecil di antara keduanya agar massa minimum", "t_σ selalu, karena kekuatan lebih penting daripada kekakuan", "t_req = maks(t_σ, t_δ), karena kedua kendala harus terpenuhi sekaligus; kendala yang memberi nilai terbesar disebut kendala aktif"],
     "Dua kendala, satu tebal"),
    ("<strong>Jejak karbon bahan</strong> sebuah komponen dihitung dari...",
     ["Luas permukaan komponen dikalikan faktor emisi", "Jumlah fitur pada pohon model dikalikan faktor emisi", "Faktor emisi f (kg CO₂ per kg) dikalikan massa, dan massa = ρ × Shape.Volume dengan satuan yang disamakan", "Selisih volume billet dan volume komponen saja"],
     "Jejak karbon bahan"),
    ("Untuk <strong>kekakuan lentur yang sama</strong> (E·I tetap, lebar b tetap), lengan aluminium dibandingkan lengan baja...",
     ["Boleh lebih pendek karena aluminium lebih ringan", "Harus sekitar 1,44× lebih tinggi (h ∝ E^(−1/3)) sehingga massanya lebih kecil, tetapi jejak CO₂-nya belum tentu lebih kecil karena faktor emisinya jauh lebih besar", "Sama tinggi dan sama jejak karbonnya", "Harus 3× lebih tinggi karena modulusnya sepertiga"],
     "Aluminium vs baja"),
]

TUGAS_LABELS = ["Kaleng tertutup luas minimum — A (mm²)", "Kantilever aluminium — h_req (mm)", "Tabung kekakuan sama — d_o (mm)",
                "Pelat dua kendala — t_req (mm)", "Pilihan material — jejak CO₂ Al (kg)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}

FQ_JUDUL = [
    "Bagaimana menuliskan fungsi tujuan, variabel desain, dan kendala lengan braket rak ini, dan mengapa ukuran akhirnya selalu menempel pada kendala?",
    "Alternatif mana yang menang bila massa, jejak CO₂, biaya, kemudahan pembuatan, dan tinggi terpasang diberi bobot yang berbeda?",
    "Kapan aluminium benar-benar lebih ramah lingkungan, dan bagaimana kendala CO₂ dimasukkan tanpa membuat klaim yang tidak dapat diperiksa?",
]
FQ_RINGKAS = [
    "Susun bentuk baku Persamaan (1) untuk lengan braket rak: fungsi tujuan, variabel desain, kendala defleksi dan tegangan, serta batas ruang pasang; tentukan tinggi minimum dengan Persamaan (2) dan (3), lalu jelaskan mengapa optimum berada tepat di kendala aktif.",
    "Bandingkan pelat baja pejal, pelat baja berusuk, dan pelat aluminium dengan matriks keputusan berbobot Persamaan (6); tetapkan bobot lebih dahulu, hitung skornya, lalu uji kepekaan dengan menggeser bobot ±0,05 dan laporkan apakah pemenangnya bertahan.",
    "Hitung jejak CO₂ kedua material dengan Persamaan (7) pada kekakuan yang sama, bandingkan indeks f·ρ/E^(1/3), lalu tetapkan batas sistem perhitungan (bahan primer atau daur ulang, proses apa yang tidak dihitung) agar klaim rendah karbon dapat diperiksa pelanggan.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "PT Rakindo Sentosa membuat rak kantilever gudang. Satu lengan sepanjang 700 mm dengan lebar profil 100 mm harus memikul beban ujung 4.000 N dengan defleksi ujung maksimum 1,5 mm, dan ruang antar-tingkat membatasi tinggi profil ≤ 90 mm. Tim produksi terbiasa memilih tebal “yang tersedia di gudang” lalu mengujinya, sehingga separuh percobaan terbuang. Tuliskan masalah ini dalam bentuk baku Persamaan (1), tentukan tinggi minimumnya dengan Persamaan (2), dan jelaskan mengapa desain bermassa minimum selalu berada tepat pada kendala yang aktif (Bagian 01 dan 03).",
            ["L 700 mm · b 100 mm · F 4.000 N", "δ ≤ 1,5 mm · h ≤ 90 mm", "tujuan: massa & CO₂ minimum"],
            "Pada desain bermassa minimum yang dibatasi defleksi, tinggi profil yang dipilih adalah...",
            ["Tinggi terbesar yang masih muat di ruang pasang, agar aman", "Tinggi terkecil yang masih memenuhi δ ≤ δ_izin, yaitu h_req = (4FL³/(E·b·δ_izin))^(1/3)", "Tinggi rata-rata antara batas ruang dan h_req", "Tinggi yang kebetulan tersedia di gudang, lalu diuji"],
            "✅ Tepat! Massa sebanding dengan h sedangkan defleksi sebanding dengan 1/h³, sehingga menaikkan h di atas h_req hanya menambah bahan tanpa manfaat. Optimum berada tepat pada kendala defleksi: kendala itulah yang aktif.",
            "❌ Tinggi maksimum memang aman tetapi paling boros; rata-rata tidak punya dasar; memilih dari stok adalah kebiasaan yang justru ingin diganti. Lihat Persamaan (2) dan Gambar 3.",
            "Petunjuk: (1) Tulis f, x, g, dan batas variabel. (2) Hitung h_req dengan Persamaan (2). (3) Jelaskan arti kendala aktif dan periksa apakah h_req ≤ 90 mm.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Tiga alternatif lolos kendala: A pelat baja pejal (datum), B pelat baja berusuk dengan momen inersia setara tetapi massa sekitar 60 %, dan C pelat aluminium pejal yang harus 1,44× lebih tinggi. Rapat desain terpecah: bagian produksi menolak rusuk karena menambah satu operasi las, bagian pemasaran menginginkan aluminium karena terdengar modern, dan bagian keuangan hanya melihat biaya bahan. Susun matriks keputusan berbobot (Bagian 05) dengan lima kriteria — massa, jejak CO₂, biaya, kemudahan pembuatan, tinggi terpasang — lalu hitung skor tiap alternatif dan uji kepekaannya.",
            ["A pejal · B berusuk · C aluminium", "5 kriteria, Σ bobot = 1,00", "uji kepekaan Δw = ±0,05"],
            "Agar matriks keputusan tidak berubah menjadi selera yang berangka, syarat utamanya adalah...",
            ["Memberi bobot sama besar untuk semua kriteria", "Memilih datum dari alternatif yang paling disukai tim", "Menghitung ulang skor sampai alternatif favorit menang", "Menetapkan kriteria dan bobotnya sebelum angka hasil simulasi dibuka, menilai semua alternatif terhadap satu datum, dan menuliskan alasan setiap tanda + atau −"],
            "✅ Tepat! Bobot yang ditetapkan lebih dahulu mencegah keputusan “disetir” setelah angka keluar, datum tunggal membuat perbandingan adil, dan alasan tertulis membuat keputusan dapat ditelusuri di kemudian hari.",
            "❌ Bobot seragam mengabaikan prioritas nyata; datum favorit dan perhitungan ulang justru sumber bias yang ingin dihindari. Lihat Persamaan (6) dan Gambar 5.",
            "Petunjuk: (1) Tetapkan bobot dan alasannya. (2) Isi +1/0/−1 terhadap datum A. (3) Hitung S_j, lalu geser bobot ±0,05 dan laporkan apakah pemenangnya bertahan.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Pelanggan besar meminta label “rak rendah karbon” dan menganggap aluminium otomatis lebih hijau karena lebih ringan. Dengan kekakuan yang sama, lengan aluminium memang jauh lebih ringan, tetapi faktor emisi bahannya 12,0 kg CO₂/kg melawan 2,0 kg CO₂/kg untuk baja, dan pemasok menawarkan baja berkandungan daur ulang serta aluminium daur ulang dengan faktor emisi yang jauh lebih rendah. Hitung jejak kedua pilihan dengan Persamaan (7), bandingkan indeks f·ρ/E^(1/3), lalu susun pernyataan klaim beserta batas sistemnya (Bagian 06 dan 07).",
            ["f baja 2,0 · aluminium 12,0", "h ∝ E^(−1/3), massa ∝ ρ·h", "batas sistem: bahan saja"],
            "Untuk komponen rak yang diam dan berkekakuan sama, pilihan berjejak karbon bahan terkecil ditunjukkan oleh...",
            ["Indeks f·ρ/E^(1/3) terkecil, sehingga baja unggul meski jauh lebih berat daripada aluminium", "Massa terkecil, sehingga aluminium selalu unggul", "Modulus elastisitas terbesar, sehingga baja unggul tanpa perlu menghitung massa", "Harga bahan per kilogram terendah"],
            "✅ Tepat! Pada kekakuan sama, massa sebanding ρ/E^(1/3) sehingga jejaknya sebanding f·ρ/E^(1/3). Aluminium menang pada massa tetapi kalah telak pada jejak bahan karena faktor emisinya enam kali lipat — kecuali memakai aluminium daur ulang.",
            "❌ Massa terkecil tidak sama dengan jejak terkecil bila faktor emisinya berbeda jauh; modulus saja tidak menentukan massa; harga bukan ukuran emisi. Lihat Persamaan (7), Gambar 6, dan Animasi 4.",
            "Petunjuk: (1) Hitung h, massa, dan CO₂ kedua material. (2) Bandingkan indeks f·ρ/E^(1/3), termasuk versi daur ulang. (3) Tulis klaim beserta batas sistem dan apa yang tidak dihitung.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">rak kantilever gudang</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">min massa s.t. δ ≤ 1,5 mm</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">S_j = Σ w_i·s_ij</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">CO₂ = f·ρ·V</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 15 · Optimasi Desain untuk Efisiensi dan Lingkungan</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Tiga Alternatif,<br><em>Satu Keputusan</em></h1>
    <p class="hero-sub">PT Rakindo Sentosa harus memilih desain akhir lengan rak kantilever dari tiga alternatif yang sama-sama memenuhi kendala. Terapkan Pertemuan 15: rumuskan masalahnya, hitung ukuran minimum dari kendala aktif, bandingkan alternatif dengan matriks keputusan berbobot, dan masukkan jejak karbon sebagai kriteria yang dapat diperiksa.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PT Rakindo Sentosa —<br>Memilih Desain Akhir Lengan Rak</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS OPTIMASI DAN KEPUTUSAN DESAIN</div>
    <p>
      <strong style="color:var(--amber)">PT Rakindo Sentosa</strong> memproduksi <strong style="color:var(--cyan)">rak kantilever gudang</strong>. Satu lengan sepanjang <strong>700 mm</strong> dengan lebar profil <strong>100 mm</strong> memikul beban ujung <strong>4.000 N</strong>; defleksi ujung tidak boleh melebihi <strong>1,5 mm</strong> dan tinggi profil dibatasi <strong>90 mm</strong> oleh jarak antar-tingkat. Selama ini tebal dipilih dari stok gudang lalu diuji, sehingga separuh percobaan terbuang dan tidak ada catatan mengapa satu ukuran dipilih.
    </p>
    <p style="margin-top:12px">
      Tiga alternatif kini diajukan: <strong style="color:var(--cyan)">A pelat baja pejal</strong> (datum), <strong style="color:var(--cyan)">B pelat baja berusuk</strong> dengan momen inersia setara tetapi massa sekitar 60 %, dan <strong style="color:var(--cyan)">C pelat aluminium</strong> yang harus 1,44× lebih tinggi. Produksi menolak rusuk karena satu operasi las tambahan, pemasaran menginginkan aluminium, dan pelanggan besar meminta label <em>rak rendah karbon</em>.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">dasar keputusan</strong>: rumusan masalah yang jelas, ukuran minimum dari kendala aktif, matriks keputusan berbobot beserta uji kepekaannya, dan perhitungan jejak karbon dengan batas sistem yang jujur.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("L 700 · b 100 · F 4.000 N · δ ≤ 1,5 mm", "14,165,233", "cyan")}
{kartu("tinggi profil ≤ 90 mm (jarak tingkat)", "14,165,233", "cyan")}
{kartu("A pejal · B berusuk · C aluminium", "14,165,233", "cyan")}
{kartu("f = 2,0 (baja) vs 12,0 (aluminium)", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Percobaan yang terbuang, rapat yang berputar, dan klaim lingkungan yang tidak dapat diperiksa berasal dari satu hal yang sama: keputusan tanpa rumusan. Forum ini mengajak Anda menuliskannya lebih dahulu, lalu membiarkan angka yang memutuskan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Lengan rak kantilever: beban ujung, defleksi yang dibatasi, dan tiga alternatif penampang yang dibandingkan</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "PT Rakindo Sentosa memproduksi rak kantilever gudang. Satu lengan sepanjang 700 mm dengan lebar profil 100 mm memikul beban ujung 4.000 N; defleksi ujung maksimum 1,5 mm dan tinggi profil dibatasi 90 mm oleh jarak antar-tingkat. Selama ini tebal dipilih dari stok lalu diuji, sehingga separuh percobaan terbuang. Tiga alternatif diajukan: A pelat baja pejal (datum), B pelat baja berusuk (momen inersia setara, massa &plusmn; 60 %), dan C pelat aluminium yang harus 1,44&times; lebih tinggi. Produksi menolak rusuk karena satu operasi las tambahan, pemasaran menginginkan aluminium, dan pelanggan meminta label rak rendah karbon (f = 2,0 kg CO&#8322;/kg untuk baja vs 12,0 untuk aluminium). Susun rumusan masalah bentuk baku, hitung tinggi minimum dari kendala aktif, bandingkan ketiganya dengan matriks keputusan berbobot beserta uji kepekaan, lalu hitung jejak karbon dengan batas sistem yang jelas."
FORUM_CHIPS_LMS = ["L 700 · b 100 · F 4.000 N", "δ ≤ 1,5 mm · h ≤ 90 mm", "A pejal · B berusuk · C aluminium", "f 2,0 vs 12,0 kg CO₂/kg"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Lengan rak kantilever: kendala defleksi dan tiga alternatif penampang (Pertemuan 15)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const x0 = W * 0.08, x1 = W * 0.52, cy = H * 0.46, hb = 20;
  // kolom rak (kiri) dan lengan kantilever yang melendut
  ctx.fillStyle = 'rgba(148,163,184,.18)'; ctx.fillRect(x0 - 22, cy - 58, 18, 116);
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4; ctx.strokeRect(x0 - 22, cy - 58, 18, 116);
  ctx.beginPath(); ctx.moveTo(x0, cy - hb);
  for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(x0 + (x1 - x0) * u, cy - hb + 14 * (3 * u * u - u * u * u) / 2); }
  for (let i = 40; i >= 0; i--) { const u = i / 40; ctx.lineTo(x0 + (x1 - x0) * u, cy + hb + 14 * (3 * u * u - u * u * u) / 2); }
  ctx.closePath(); ctx.fillStyle = 'rgba(34,211,238,.14)'; ctx.fill(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke(); ctx.setLineDash([]);
  // beban ujung dan batas defleksi
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1 - 6, cy - 34); ctx.lineTo(x1 - 6, cy + 4); ctx.stroke();
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(x1 - 6, cy + 10); ctx.lineTo(x1 - 12, cy + 1); ctx.lineTo(x1, cy + 1); ctx.fill();
  ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b'; ctx.fillText('F = 4 000 N', x1 + 4, cy - 42);
  ctx.fillStyle = 'rgba(226,232,240,.85)'; ctx.fillText('L = 700 mm', (x0 + x1) / 2, cy + 52);
  ctx.fillStyle = '#ef4444'; ctx.fillText('δ ≤ 1,5 mm', x1 - 6, cy + 70);
  // tiga alternatif penampang di kanan
  const bx = W * 0.62, bw = W * 0.09, gap = W * 0.12;
  const alt = [['A baja pejal', 46, 'rgba(148,163,184,.30)', '#94a3b8'], ['B baja berusuk', 46, 'rgba(0,224,158,.25)', '#00e09e'], ['C aluminium', 66, 'rgba(239,68,68,.22)', '#ef4444']];
  alt.forEach(([nama, hh, isi, garis], i) => {
    const x = bx + i * gap, yb = cy + 30;
    ctx.fillStyle = isi; ctx.fillRect(x, yb - hh, bw, hh);
    ctx.strokeStyle = garis; ctx.lineWidth = 1.6; ctx.strokeRect(x, yb - hh, bw, hh);
    if (i === 1) { ctx.fillStyle = 'rgba(0,224,158,.55)'; ctx.fillRect(x + bw / 2 - 3, yb - hh - 18, 6, 18); }
    ctx.fillStyle = garis; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText(nama, x + bw / 2, yb + 14);
  });
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono';
  ctx.fillText('■ min massa & CO₂  s.t.  δ ≤ 1,5 mm · h ≤ 90 mm · matriks keputusan berbobot', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
