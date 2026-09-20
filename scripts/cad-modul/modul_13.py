# Konten Modul 13 Pemodelan CAD — Prinsip Desain Berkelanjutan dalam CAD (Sub-CPMK 5.1:
# siklus hidup dan 3R; pemilihan material dan massa minimum; efisiensi proses dan
# pemanfaatan material; daur ulang dan pembongkaran; jejak material/energi/CO₂ dari model;
# lightweighting; Spreadsheet jejak). Angka contoh dihitung di sini agar teks, tabel, dan
# gambar konsisten, dan sengaja tidak sama dengan varian tugas parametrik mana pun
# (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, TX, anim_panel, arrow, bagian, box, cards, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 13
JUDUL = "Prinsip Desain Berkelanjutan dalam CAD"
JUDUL_PANJANG = "Prinsip Desain Berkelanjutan dalam CAD"
JUDUL_EKSPOR = "Desain Berkelanjutan dalam CAD"

# ─────────────────────────── angka contoh ───────────────────────────
# massa jenis (g/mm³), modulus (MPa), energi terkandung (MJ/kg), faktor emisi (kg CO₂/kg)
RHO_ST, RHO_AL, RHO_TI, RHO_MG, RHO_CF = 7.85e-3, 2.70e-3, 4.50e-3, 1.80e-3, 1.60e-3
E_ST, E_AL, E_TI, E_MG, E_CF = 210000, 70000, 110000, 45000, 70000
EE_ST, EE_AL, EE_ALR, EE_TI, EE_MG, EE_CF = 25, 200, 12, 550, 320, 300
FC_ST, FC_AL, FC_ALR, FC_TI, FC_MG, FC_CF = 2.0, 12.0, 1.2, 35.0, 20.0, 25.0

MAT = [("Baja S235", E_ST, RHO_ST, EE_ST, FC_ST, "#22d3ee"),
       ("Aluminium 6061", E_AL, RHO_AL, EE_AL, FC_AL, "#f59e0b"),
       ("Titanium Ti-6Al-4V", E_TI, RHO_TI, EE_TI, FC_TI, "#a855f7"),
       ("Magnesium AZ31", E_MG, RHO_MG, EE_MG, FC_MG, "#ec4899"),
       ("CFRP searah", E_CF, RHO_CF, EE_CF, FC_CF, "#00e09e")]

# Bagian 02 — balok rangka rak dengan kekakuan lentur sama
L_BM, B_BM, H_BM = 700, 60, 28


def tinggi_setara(E):
    """Tinggi penampang agar E·I sama dengan balok baja acuan (lebar b tetap)."""
    return H_BM * (E_ST / E) ** (1 / 3)


def massa_setara(E, rho):
    return rho * L_BM * B_BM * tinggi_setara(E)


H_BM_I = [tinggi_setara(E) for _, E, _, _, _, _ in MAT]
M_BM = [massa_setara(E, rho) for _, E, rho, _, _, _ in MAT]
M_BM_MAKS = max(M_BM)
IDX_M = [E ** (1 / 3) / (rho * 1000) for _, E, rho, _, _, _ in MAT]

# Bagian 02 — pelat dudukan aluminium berlubang (contoh Persamaan 1)
A_PL, B_PL, T_PL, D_PL = 90, 50, 6, 20
V_PL = A_PL * B_PL * T_PL - math.pi * D_PL ** 2 * T_PL / 4
M_PL = RHO_AL * V_PL

# Bagian 03 — braket L dipesin dari billet
A_BI, B_BI, C_BI, T_BI = 120, 60, 80, 25
V_PART = B_BI * (A_BI * T_BI + (C_BI - T_BI) * T_BI)
V_BILLET = A_BI * B_BI * C_BI
U_BI = 100 * V_PART / V_BILLET

# Bagian 05 — rakitan dudukan: pelat baja + blok aluminium
A_JK, B_JK, T_JK = 400, 250, 20
C_JK, H_JK = 100, 60
V_JK_ST = A_JK * B_JK * T_JK
V_JK_AL = C_JK * C_JK * H_JK
M_JK_ST = RHO_ST * V_JK_ST / 1000          # kg
M_JK_AL = RHO_AL * V_JK_AL / 1000          # kg
E_JK_ST, E_JK_AL = EE_ST * M_JK_ST, EE_AL * M_JK_AL
CO2_JK_ST, CO2_JK_AL = FC_ST * M_JK_ST, FC_AL * M_JK_AL
M_JK, E_JK, CO2_JK = M_JK_ST + M_JK_AL, E_JK_ST + E_JK_AL, CO2_JK_ST + CO2_JK_AL
# iterasi perbaikan (Bagian 07)
CO2_JK_R = CO2_JK_ST + FC_ALR * M_JK_AL                       # blok aluminium daur ulang
T_JK2 = 14
M_JK_ST2 = RHO_ST * A_JK * B_JK * T_JK2 / 1000
CO2_JK_T = FC_ST * M_JK_ST2 + CO2_JK_AL                       # pelat ditipiskan
CO2_JK_RT = FC_ST * M_JK_ST2 + FC_ALR * M_JK_AL               # gabungan
M_JK2 = M_JK_ST2 + M_JK_AL

# Bagian 06 — tabung aluminium (contoh Persamaan 6)
D_TB, DI_TB, L_TB = 60, 45, 400
V_TB = math.pi / 4 * (D_TB ** 2 - DI_TB ** 2) * L_TB
M_TB = RHO_AL * V_TB / 1000                                   # kg
E_TB, CO2_TB = EE_AL * M_TB, FC_AL * M_TB

# Bagian 06 — housing baja dijadikan cangkang (contoh Persamaan 5)
A_CG, B_CG, H_CG, T_CG = 160, 120, 80, 5
V_SOLID = A_CG * B_CG * H_CG
V_CAV = (A_CG - 2 * T_CG) * (B_CG - 2 * T_CG) * (H_CG - T_CG)
V_SHELL = V_SOLID - V_CAV
M_SOLID, M_SHELL = RHO_ST * V_SOLID, RHO_ST * V_SHELL
HEMAT_CG = 100 * (1 - V_SHELL / V_SOLID)


# ─────────────────────────── gambar ───────────────────────────
def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _garis(x1, y1, x2, y2, warna, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def gambar1():
    b = ""
    w, h = 120, 52
    tahap = [("Bahan mentah", "ekstraksi · e MJ/kg", "#22d3ee"),
             ("Produksi", "serpihan · energi", "#f59e0b"),
             ("Distribusi", "massa · transport", "#a855f7"),
             ("Pemakaian", "energi operasi", "#ec4899"),
             ("Akhir hayat", "daur ulang / TPA", "#00e09e")]
    xs = [8, 142, 276, 410, 544]
    for (judul, sub, c), x in zip(tahap, xs):
        b += box(x, 30, w, h, [judul, sub], c, 11)
    for i in range(4):
        b += arrow(xs[i] + w, 56, xs[i + 1], 56)
    b += f'<path d="M 604 82 V 104 H 114" fill="none" stroke="#00e09e" stroke-width="1.3" stroke-dasharray="6 4"/>'
    b += arrow(114, 104, 68, 86, "#00e09e", 1.3)
    b += t(360, 122, "Reuse · Remanufacture · Recycle menutup lingkaran", 11, "#00e09e", "middle", "600")
    tri = [("Reduce", "massa · serpihan · komponen", "#22d3ee"),
           ("Reuse", "komponen standar · App::Link", "#f59e0b"),
           ("Recycle", "mono-material · penandaan", "#00e09e")]
    for (judul, sub, c), x in zip(tri, [12, 238, 464]):
        b += box(x, 140, 204, 48, [judul, sub], c, 11)
    b += teks2(340, 212, "Keputusan pada model CAD (material, massa, bentuk, sambungan) mengunci sebagian besar dampak sepanjang siklus hidup", 11, AX, maks=76)
    return svg(680, 240, b, "Gambar 1 — Siklus hidup produk dan penerapan 3R pada tahap desain")


def gambar2():
    b = t(20, 24, f"Balok rangka {L_BM} × {B_BM} × {H_BM} mm (baja) diganti material lain dengan E·I sama", 11.5, TX, "start", "600")
    b += t(20, 42, "h_i = h·(E_baja/E_i)^(1/3) — panjang batang = massa balok", 10.5, AX, "start")
    y0 = 66
    for i, (nama, E, rho, ee, f, c) in enumerate(MAT):
        y = y0 + i * 26
        wb = 210 * M_BM[i] / M_BM_MAKS
        b += t(20, y + 4, nama, 10, c, "start", "600")
        b += f'<rect x="126" y="{y - 8:.1f}" width="{wb:.1f}" height="15" rx="3" fill="rgba(148,163,184,.10)" stroke="{c}" stroke-width="1.3"/>'
        b += t(126 + wb + 6, y + 4, f"{ind(M_BM[i], 0)} g · h = {ind(H_BM_I[i], 1)}", 10, AX, "start")
    b += t(452, 62, "Indeks massa balok lentur:", 11, TX, "start", "600")
    b += t(452, 80, "M = E^(1/3) / ρ — besar = ringan", 10, AX, "start")
    for i, (nama, E, rho, ee, f, c) in enumerate(MAT):
        b += t(452, 100 + i * 17, f"{nama.split()[0]} {ind(IDX_M[i], 2)}", 10, c, "start")
    b += t(20, 206, "penampang", 10, AX, "start")
    b += t(20, 222, "b × h_i", 10, AX, "start")
    sc = 1.5
    for i, (nama, E, rho, ee, f, c) in enumerate(MAT):
        cx = 160 + i * 120
        hh = H_BM_I[i] * sc
        b += f'<rect x="{cx - B_BM * sc / 2:.1f}" y="{250 - hh:.1f}" width="{B_BM * sc:.1f}" height="{hh:.1f}" fill="rgba(148,163,184,.10)" stroke="{c}" stroke-width="1.4"/>'
        b += t(cx, 266, f"{nama.split()[0][:4]} {ind(H_BM_I[i], 1)}", 9.5, c, "middle")
    b += teks2(340, 292, "Pada kekakuan lentur sama, tinggi penampang naik seperti E^(−1/3) tetapi massa mengikuti ρ/E^(1/3)", 11, AX, maks=76)
    return svg(680, 316, b, "Gambar 2 — Massa balok berkekakuan sama untuk lima material dan indeks E^(1/3)/ρ")


def gambar3():
    b = t(20, 24, f"Braket L {A_BI} × {C_BI} mm (tebal kaki {T_BI}, kedalaman {B_BI}) dipesin dari billet pejal", 11.5, TX, "start", "600")
    ox, oy, s = 52, 216, 1.65
    X = lambda x: ox + x * s          # noqa: E731
    Y = lambda z: oy - z * s          # noqa: E731
    b += f'<rect x="{X(0)}" y="{Y(C_BI)}" width="{A_BI * s:.1f}" height="{C_BI * s:.1f}" fill="rgba(148,163,184,.05)" stroke="{AX}" stroke-width="1.2" stroke-dasharray="6 4"/>'
    for k in range(18):
        xh = X(T_BI) + k * 11
        if xh < X(A_BI):
            b += _garis(xh, Y(T_BI), min(xh + 26, X(A_BI)), max(Y(T_BI) - 26, Y(C_BI)), "rgba(239,68,68,.35)", 1)
    b += _poli([(X(x), Y(z)) for x, z in [(0, 0), (A_BI, 0), (A_BI, T_BI), (T_BI, T_BI), (T_BI, C_BI), (0, C_BI)]],
               "rgba(34,211,238,.20)", "#22d3ee", 1.8)
    b += t(178, 126, "serpihan = (100 − U) %", 10.5, "#ef4444", "middle", "600")
    b += t(X(A_BI / 2), Y(T_BI / 2) + 4, "t", 11, "#22d3ee", "middle", "700")
    b += t(X(T_BI / 2), Y(C_BI * 0.7), "t", 11, "#22d3ee", "middle", "700")
    b += arrow(X(0), 238, X(A_BI), 238, "#f59e0b", 1.2) + arrow(X(A_BI), 238, X(0), 238, "#f59e0b", 1.2)
    b += t(X(A_BI / 2), 233, "a", 11, "#f59e0b", "middle", "600")
    b += arrow(268, Y(0), 268, Y(C_BI), "#f59e0b", 1.2) + arrow(268, Y(C_BI), 268, Y(0), "#f59e0b", 1.2)
    b += t(276, Y(C_BI / 2) + 4, "c", 11, "#f59e0b", "start", "600")
    b += t(X(A_BI / 2), 256, f"kedalaman b = {B_BI} mm (arah Y)", 10, AX, "middle")
    b += t(452, 64, "Pemanfaatan material:", 11, TX, "start", "600")
    b += t(452, 84, "V_part = b·(a·t + (c − t)·t)", 10, AX, "start")
    b += t(452, 102, "V_billet = a·b·c", 10, AX, "start")
    b += t(452, 124, f"V_part = {ind(V_PART, 0)} mm³", 10, "#22d3ee", "start")
    b += t(452, 142, f"V_billet = {ind(V_BILLET, 0)} mm³", 10, AX, "start")
    b += t(452, 164, f"U = {ind(U_BI, 3)} %", 11, "#00e09e", "start", "600")
    b += t(452, 182, f"serpihan = {ind(100 - U_BI, 3)} %", 10.5, "#ef4444", "start")
    b += teks2(340, 276, "Serpihan membawa energi terkandung dan jejak CO₂ penuh tanpa memberi fungsi apa pun pada produk", 11, AX, maks=76)
    return svg(680, 300, b, "Gambar 3 — Braket L dari billet: bagian yang menjadi serpihan dan pemanfaatan material U")


def gambar4():
    b = t(170, 26, "Dirancang untuk dibongkar (DfD)", 11.5, "#00e09e", "middle", "600")
    b += t(510, 26, "Sulit dibongkar", 11.5, "#ef4444", "middle", "600")
    b += f'<rect x="90" y="60" width="160" height="26" rx="3" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="1.5"/>'
    b += f'<rect x="90" y="96" width="160" height="26" rx="3" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="1.5"/>'
    for x in (122, 218):
        b += _garis(x, 52, x, 130, "#f59e0b", 2)
        b += f'<circle cx="{x}" cy="50" r="5" fill="none" stroke="#f59e0b" stroke-width="1.6"/>'
    b += t(170, 77, "Baja S235", 9.5, TX, "middle")
    b += t(170, 113, "Baja S235", 9.5, TX, "middle")
    for i, s_ in enumerate(["baut M8 — dapat dilepas kembali", "satu jenis material (mono-material)", "ditandai untuk pemilahan"]):
        b += t(170, 150 + i * 17, s_, 10, AX, "middle")
    b += f'<rect x="430" y="60" width="160" height="26" rx="3" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="1.5"/>'
    b += f'<rect x="430" y="88" width="160" height="10" fill="rgba(239,68,68,.25)" stroke="#ef4444" stroke-width="1.2"/>'
    b += f'<rect x="430" y="100" width="160" height="26" rx="3" fill="rgba(168,85,247,.16)" stroke="#a855f7" stroke-width="1.5"/>'
    b += f'<circle cx="510" cy="113" r="7" fill="rgba(245,158,11,.35)" stroke="#f59e0b" stroke-width="1.4"/>'
    b += t(510, 77, "Baja", 9.5, TX, "middle")
    b += t(605, 95, "lem", 9.5, "#ef4444", "start")
    b += t(430, 139, "plastik + insert logam", 9.5, "#a855f7", "start")
    for i, s_ in enumerate(["dilem dan diberi insert tertanam", "tiga material tercampur", "nilai daur ulang rendah"]):
        b += t(510, 158 + i * 17, s_, 10, AX, "middle")
    b += teks2(340, 214, "Jumlah jenis material dan cara menyambung menentukan biaya pemilahan di akhir hayat, bukan kekuatan rakitan saja", 11, AX, maks=76)
    return svg(680, 238, b, "Gambar 4 — Rakitan mono-material berbaut dibandingkan rakitan multi-material yang dilekatkan")


def gambar5():
    b = box(14, 54, 150, 56, ["Shape.Volume", "V (mm³) tiap Body"], "#22d3ee", 11)
    b += arrow(164, 82, 196, 82)
    b += box(196, 54, 150, 56, ["× ρ → massa", "m (kg) = ρ·V"], "#f59e0b", 11)
    b += arrow(346, 72, 386, 46)
    b += arrow(346, 92, 386, 118)
    b += box(386, 18, 176, 52, ["× e → energi", "E (MJ) = e·m"], "#a855f7", 11)
    b += box(386, 94, 176, 52, ["× f → jejak karbon", "CO₂ (kg) = f·m"], "#00e09e", 11)
    b += t(20, 176, f"Pelat baja {A_JK} × {B_JK} × {T_JK} mm: V = {ind(V_JK_ST, 0)} mm³ → m = {ind(M_JK_ST, 3)} kg → E = {ind(E_JK_ST, 1)} MJ · CO₂ = {ind(CO2_JK_ST, 3)} kg", 10.5, AX, "start")
    b += t(20, 196, f"Blok aluminium {C_JK} × {C_JK} × {H_JK} mm: V = {ind(V_JK_AL, 0)} mm³ → m = {ind(M_JK_AL, 3)} kg → E = {ind(E_JK_AL, 1)} MJ · CO₂ = {ind(CO2_JK_AL, 3)} kg", 10.5, AX, "start")
    b += t(20, 218, f"TOTAL rakitan: m = {ind(M_JK, 3)} kg · E = {ind(E_JK, 1)} MJ · jejak = {ind(CO2_JK, 3)} kg CO₂", 11, "#00e09e", "start", "600")
    b += teks2(340, 246, "Satu model CAD memberi tiga angka lingkungan sekaligus karena semuanya berangkat dari volume tiap Body", 11, AX, maks=76)
    return svg(680, 268, b, "Gambar 5 — Alur jejak material: dari Shape.Volume ke massa, energi terkandung, dan CO₂")


def gambar6():
    b = t(20, 24, f"Housing baja {A_CG} × {B_CG} × {H_CG} mm: pejal menjadi cangkang Thickness {T_CG} mm", 11.5, TX, "start", "600")
    s = 0.95
    aw, hh, tw = A_CG * s, H_CG * s, T_CG * s
    x1, x2, yb = 40, 300, 190
    b += f'<rect x="{x1}" y="{yb - hh:.1f}" width="{aw:.1f}" height="{hh:.1f}" fill="rgba(34,211,238,.22)" stroke="#22d3ee" stroke-width="1.8"/>'
    b += t(x1 + aw / 2, yb - hh / 2 + 4, "pejal", 11, TX, "middle", "600")
    b += _poli([(x2, yb - hh), (x2 + tw, yb - hh), (x2 + tw, yb - tw), (x2 + aw - tw, yb - tw), (x2 + aw - tw, yb - hh),
                (x2 + aw, yb - hh), (x2 + aw, yb), (x2, yb)], "rgba(0,224,158,.22)", "#00e09e", 1.8)
    b += t(x2 + aw / 2, yb - hh + 22, "muka atas dibuang", 10, "#00e09e", "middle")
    b += arrow(200, 150, 290, 150, "#f59e0b", 1.4)
    b += t(245, 140, "Thickness t", 10, "#f59e0b", "middle", "600")
    b += arrow(x1, 206, x1 + aw, 206, "#f59e0b", 1.1) + arrow(x1 + aw, 206, x1, 206, "#f59e0b", 1.1)
    b += t(x1 + aw / 2, 201, "a", 11, "#f59e0b", "middle", "600")
    b += arrow(30, yb, 30, yb - hh, "#f59e0b", 1.1) + arrow(30, yb - hh, 30, yb, "#f59e0b", 1.1)
    b += t(24, yb - hh / 2 + 4, "h", 11, "#f59e0b", "end", "600")
    b += arrow(268, 220, x2 + tw / 2, 178, "#00e09e", 1.2)
    b += t(262, 226, "dinding t", 10, "#00e09e", "end", "600")
    b += t(470, 60, "V_pejal = a·b·h", 10.5, AX, "start")
    b += t(470, 78, f"= {ind(V_SOLID, 0)} mm³ → {ind(M_SOLID, 0)} g", 10, "#22d3ee", "start")
    b += t(470, 100, "V_cangkang = a·b·h −", 10.5, AX, "start")
    b += t(470, 118, "(a − 2t)(b − 2t)(h − t)", 10.5, AX, "start")
    b += t(470, 136, f"= {ind(V_SHELL, 0)} mm³", 10, "#00e09e", "start")
    b += t(470, 158, f"massa = {ind(M_SHELL, 2)} g", 10.5, "#00e09e", "start", "600")
    b += t(470, 176, f"hemat {ind(HEMAT_CG, 1)} % massa", 10.5, "#f59e0b", "start")
    b += teks2(340, 250, "Cangkang membuang bahan di daerah bertegangan rendah: dimensi luar tetap, massa dan jejak turun tajam", 11, AX, maks=76)
    return svg(680, 272, b, "Gambar 6 — Penampang housing pejal dibandingkan cangkang hasil Thickness")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-siklus">Siklus Hidup</a>
  <a href="#m-material">Material</a>
  <a href="#m-proses">Serpihan</a>
  <a href="#m-daurulang">Daur Ulang</a>
  <a href="#m-jejak">Jejak CO&#8322;</a>
  <a href="#m-ringan">Lightweighting</a>
  <a href="#m-spreadsheet">Spreadsheet</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 52 A 24 24 0 1 1 26 76" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.6"/>
      <polygon points="26,70 26,84 15,77" fill="rgba(0,229,255,.55)"/>
      <rect x="34" y="60" width="32" height="18" fill="rgba(255,179,0,.18)" stroke="rgba(255,179,0,.6)" stroke-width="1.1"/>
      <rect x="18" y="122" width="64" height="10" fill="rgba(34,197,94,.25)" stroke="rgba(34,197,94,.6)" stroke-width="1"/>
      <rect x="18" y="140" width="40" height="10" fill="rgba(124,77,255,.25)" stroke="rgba(124,77,255,.6)" stroke-width="1"/>
      <rect x="18" y="158" width="22" height="10" fill="rgba(0,229,255,.25)" stroke="rgba(0,229,255,.6)" stroke-width="1"/>
      <text x="50" y="192" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">CO2 = f m</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="36" width="56" height="44" fill="none" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="4 3"/>
      <polygon points="22,80 78,80 78,68 36,68 36,36 22,36" fill="rgba(0,229,255,.18)" stroke="rgba(0,229,255,.6)" stroke-width="1.3"/>
      <path d="M 26 120 H 74 V 168 H 66 V 128 H 34 V 168 H 26 Z" fill="rgba(0,230,118,.18)" stroke="rgba(0,230,118,.6)" stroke-width="1.3"/>
      <line x1="26" y1="178" x2="74" y2="178" stroke="rgba(255,179,0,.5)" stroke-width="1"/>
      <text x="50" y="200" text-anchor="middle" fill="rgba(0,230,118,.6)" font-family="JetBrains Mono" font-size="8">shell t</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="13">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">m = &rho;&middot;V</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">E = e&middot;m</span>
    <span class="ff" style="left:34%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">CO&#8322; = &Sigma; f&rho;V</span>
    <span class="ff" style="left:49%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">U = V_part/V_billet</span>
    <span class="ff" style="left:66%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">E^(1/3)/&rho;</span>
    <span class="ff" style="left:84%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Thickness t</span>
    <span class="ff" style="left:11%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">Shape.Volume</span>
    <span class="ff" style="left:61%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">3R</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 14 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Desain</span><br>
      <em>Berkelanjutan:</em><br>
      <span class="hl-amber">Massa, Energi, CO&#8322;</span>
    </h1>
    <p class="hero-sub">Model CAD bukan hanya bentuk: volume tiap Body adalah pintu masuk ke massa, energi terkandung, dan jejak karbon. Modul ini menautkan siklus hidup dan 3R dengan angka yang benar-benar bisa dibaca dari FreeCAD — pemilihan material pada kekakuan sama, pemanfaatan material billet, cangkang Thickness, dan Spreadsheet jejak — lalu menutupnya dengan lima tugas pemodelan yang setiap angkanya berasal dari Shape.Volume.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Siklus hidup, material, jejak</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>FreeCAD, diskusi, dan tugas</small></div>
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

    # 01 — Siklus hidup dan 3R
    isi = figure(1, "Siklus hidup produk dan penerapan 3R pada tahap desain", "Lima tahap siklus hidup dan arus balik 3R; tiga kartu bawah menerjemahkan Reduce, Reuse, dan Recycle menjadi keputusan yang benar-benar dibuat di dalam berkas CAD.", gambar1())
    isi += cards([
        ("🌱", "Desain berkelanjutan", "Merancang agar fungsi tercapai dengan bahan, energi, dan limbah sekecil mungkin sepanjang umur produk — bukan menambahkan label hijau setelah produk jadi.", "fungsi ÷ dampak"),
        ("🔒", "80% terkunci di desain", "Pilihan material, massa, bentuk, dan cara menyambung ditetapkan pada tahap model. Setelah cetakan dibuat, biaya mengubahnya berlipat, sedangkan di CAD hanya beberapa klik.", "ubah sekarang, bukan nanti"),
        ("♻️", "3R yang terukur", "Reduce diukur dengan massa dan serpihan, Reuse dengan jumlah komponen unik, Recycle dengan jumlah jenis material dan jenis sambungan. Ketiganya terbaca dari pohon fitur dan rakitan.", "3R = angka, bukan slogan"),
        ("📏", "Batas modul ini", "Kita menghitung jejak bahan (cradle-to-gate): energi terkandung dan CO₂ material. Tahap pemakaian dan transport perlu data lapangan dan berada di luar cakupan berkas CAD.", "cradle-to-gate"),
    ])
    isi += tabel(["Tahap siklus hidup", "Yang ditentukan model CAD", "Angka yang dapat dibaca"],
                 [["<strong>Bahan mentah</strong>", "Jenis material dan volume tiap Body", "<code>ρ × Shape.Volume</code>, e (MJ/kg), f (kg CO₂/kg)"],
                  ["<strong>Produksi</strong>", "Proses dan bentuk: serpihan, tebal dinding, jumlah fitur", "U = V_part/V_billet, jumlah operasi"],
                  ["<strong>Distribusi</strong>", "Massa total dan kepadatan kemasan", "Massa rakitan, <code>Shape.BoundBox</code>"],
                  ["<strong>Pemakaian</strong>", "Massa yang harus digerakkan, kekakuan, umur", "Massa, pusat massa, hasil FEM (Modul 8–10)"],
                  ["<strong>Akhir hayat</strong>", "Jumlah jenis material dan cara menyambung", "Jumlah Body per material, jenis joint"]])
    isi += kotak("warning-box", "⚠️ <strong>Jangan mengklaim lebih dari yang dihitung:</strong> angka pada modul ini adalah jejak bahan, bukan LCA penuh menurut ISO 14040/14044 (yang menuntut data proses, transport, pemakaian, dan akhir hayat beserta batas sistemnya). Angka ini sangat berguna untuk <em>membandingkan dua alternatif desain</em> pada fungsi yang sama, tetapi tidak cukup untuk klaim pemasaran seperti “rendah karbon” tanpa verifikasi pihak ketiga.")
    m += bagian(1, "m-siklus", "Desain Berkelanjutan:<br>Siklus Hidup dan 3R", "Dampak lingkungan sebuah komponen sebagian besar sudah ditetapkan ketika sketsanya ditutup. Bagian ini memetakan lima tahap siklus hidup, menerjemahkan 3R menjadi keputusan model, dan menegaskan batas perhitungan yang boleh diklaim dari sebuah berkas CAD.", isi, "SIKLUS HIDUP DAN 3R")

    # 02 — Material dan massa minimum
    isi = figure(2, "Massa balok berkekakuan sama untuk lima material dan indeks E^(1/3)/ρ", f"Balok rangka {L_BM} × {B_BM} × {H_BM} mm dari baja ({ind(M_BM[0], 0)} g) diganti material lain dengan E·I sama: tinggi penampang naik, tetapi massa CFRP hanya {ind(M_BM[4], 0)} g karena indeks E^(1/3)/ρ-nya terbesar.", gambar2())
    isi += formula(1, "Massa Komponen dari Volume Model", r"m = \rho\,V, \qquad V_{pelat\ berlubang} = a\,b\,t - \frac{\pi d^{2}}{4}\,t",
                   r"\(\rho\) = massa jenis (g/mm³: baja 7,85 × 10⁻³; aluminium 2,70 × 10⁻³) &nbsp;·&nbsp; \(V\) = <code>Shape.Volume</code> Body (mm³). Contoh pelat aluminium " + f"{A_PL} × {B_PL} × {T_PL}" + r" mm berlubang ⌀" + f"{D_PL}" + r": \(V = " + ind(V_PL, 2) + r"\) mm³, \(m = " + ind(M_PL, 2) + r"\) g.",
                   "Seluruh angka lingkungan pada modul ini berangkat dari satu besaran: volume solid akhir. Karena itu volume wajib dibaca dari Body (fitur Tip), bukan dari Pad sebelum Pocket. Satuan harus dijaga: ρ dalam g/mm³ menghasilkan gram, ρ dalam kg/mm³ (7,85 × 10⁻⁶) menghasilkan kilogram. Persamaan ini yang dipakai Tugas 1.",
                   [("m", "Massa komponen (g)"), (r"\rho", "Massa jenis (g/mm³)"), ("V", "Volume Shape.Volume (mm³)"), ("a, b, t", "Panjang, lebar, tebal pelat (mm)"), ("d", "Diameter lubang (mm)")])
    isi += formula(2, "Massa Minimum pada Kekakuan Lentur Sama (Indeks Material)", r"E_1 I_1 = E_2 I_2 \ \Rightarrow\ h_2 = h_1\left(\frac{E_1}{E_2}\right)^{1/3}, \qquad m \propto \frac{\rho}{E^{1/3}} \ \Rightarrow\ M = \frac{E^{1/3}}{\rho}",
                   r"\(h\) = tinggi penampang (lebar \(b\) tetap) &nbsp;·&nbsp; \(M\) = indeks material balok lentur (besar = ringan). Contoh balok " + f"{L_BM} × {B_BM} × {H_BM}" + r" mm: baja \(m = " + ind(M_BM[0], 0) + r"\) g, aluminium \(h = " + ind(H_BM_I[1], 1) + r"\) mm dan \(m = " + ind(M_BM[1], 0) + r"\) g.",
                   "Mengganti material tanpa mengubah penampang adalah kesalahan klasik: kekakuan ikut berubah. Bandingkan pada fungsi yang sama, yaitu E·I tetap. Karena I ∝ h³, tinggi hanya perlu naik sebesar (E₁/E₂)^(1/3) sehingga massa mengikuti ρ/E^(1/3); material dengan indeks E^(1/3)/ρ terbesar memberi massa terkecil. Indeks ini juga alasan aluminium dan magnesium menang di rangka ringan meski modulusnya jauh di bawah baja.",
                   [("E", "Modulus elastisitas (MPa)"), ("I", "Momen inersia penampang (mm⁴)"), ("h", "Tinggi penampang (mm)"), (r"\rho", "Massa jenis (g/cm³)"), ("M", "Indeks material E^(1/3)/ρ")])
    isi += tabel(["Material", "ρ (g/cm³)", "E (MPa)", "e (MJ/kg)", "f (kg CO₂/kg)", "M = E^(1/3)/ρ", f"Massa balok setara (g)"],
                 [[f"<strong>{nama}</strong>", ind(rho * 1000, 2), ind(E, 0), ind(ee, 0), ind(f, 1), ind(IDX_M[i], 2), ind(M_BM[i], 0)]
                  for i, (nama, E, rho, ee, f, _) in enumerate(MAT)])
    isi += anim_panel(1, "cyan", "Material berkekakuan sama: tinggi naik, massa turun", "cvMaterial",
                      [("sl_mt_L", "v_mt_L", "Panjang balok L (mm)", 300, 900, 10, 700, "700"),
                       ("sl_mt_b", "v_mt_b", "Lebar penampang b (mm)", 30, 90, 1, 60, "60"),
                       ("sl_mt_h", "v_mt_h", "Tinggi baja acuan h (mm)", 15, 40, 1, 28, "28")],
                      "btnMaterial", "toggleMaterial", "materialInfo",
                      "<strong>Cara membaca:</strong> lima penampang di kiri memiliki kekakuan lentur yang sama persis; tingginya berbeda karena h ∝ E^(−1/3). Batang di kanan adalah massanya. Sorotan berpindah bergantian (PAUSE untuk menahan) sehingga terlihat bahwa penampang paling tinggi justru bukan yang paling berat.")
    isi += kotak("tip-box", "💡 <strong>Sebelum menyatakan satu material “lebih hijau”:</strong> samakan dulu fungsinya (kekakuan, kekuatan, atau umur), baru hitung massanya, lalu kalikan energi terkandung dan faktor emisi. Aluminium primer memiliki f enam kali baja; pada kekakuan sama massanya hanya sekitar separuh, sehingga jejaknya justru naik — kecuali memakai aluminium daur ulang. Ini yang dibahas pada Bagian 05 dan menjadi inti Forum modul ini.")
    m += bagian(2, "m-material", "Material dan Massa Minimum:<br>Indeks Material di Tangan Pemodel", "Massa adalah pengali setiap angka lingkungan, dan massa ditentukan oleh material bersama geometri. Bagian ini menghitung massa dari volume model, menetapkan cara membandingkan material secara adil pada kekakuan sama, dan memperkenalkan indeks E^(1/3)/ρ.", isi, "MATERIAL DAN MASSA MINIMUM")

    # 03 — Efisiensi proses dan pemanfaatan material
    isi = figure(3, "Braket L dari billet: bagian yang menjadi serpihan dan pemanfaatan material U", f"Braket L {A_BI} × {C_BI} mm (tebal kaki {T_BI}, kedalaman {B_BI}) bervolume {ind(V_PART, 0)} mm³ dipesin dari billet {ind(V_BILLET, 0)} mm³: hanya {ind(U_BI, 3)} % bahan menjadi produk, sisanya {ind(100 - U_BI, 3)} % menjadi serpihan.", gambar3())
    isi += formula(3, "Pemanfaatan Material (Material Utilization)", r"U = 100\,\frac{V_{part}}{V_{billet}}\ (\%), \qquad V_{serpihan} = V_{billet} - V_{part}",
                   r"\(V_{part}\) = volume komponen jadi (<code>Body.Shape.Volume</code>) &nbsp;·&nbsp; \(V_{billet}\) = volume bahan baku awal. Contoh braket L: \(U = 100 \times " + ind(V_PART, 0) + " / " + ind(V_BILLET, 0) + " = " + ind(U_BI, 3) + r"\) %.",
                   "Energi terkandung melekat pada seluruh bahan yang dibeli, bukan hanya yang tersisa pada produk. Serpihan memang dapat didaur ulang, tetapi kembali ke rantai dengan kerugian energi dan penurunan mutu. Karena itu bentuk yang mendekati bentuk akhir (near-net-shape), pelat tekuk, atau profil ekstrusi sering jauh lebih hemat daripada memesin balok pejal. Persamaan ini dipakai Tugas 3.",
                   [("U", "Pemanfaatan material (%)"), ("V_{part}", "Volume komponen jadi (mm³)"), ("V_{billet}", "Volume bahan baku (mm³)"), ("V_{serpihan}", "Volume yang terbuang (mm³)")])
    isi += tabel(["Proses", "Pemanfaatan material tipikal", "Catatan pemodelan"],
                 [["Pemesinan CNC dari billet pejal", "10–25 %", "Dekomposisi fitur menentukan sisa; billet dimodelkan sebagai Part Box pembanding"],
                  ["Pemesinan dari billet near-net-shape", "45–70 %", "Model awal mendekati bentuk akhir; hanya muka fungsional dipesin"],
                  ["Pelat potong laser + tekuk", "85–95 %", "Sheet Metal / Draft: bentangan menentukan sisa lembaran (nesting)"],
                  ["Ekstrusi profil + potong", "90–98 %", "Penampang tetap sepanjang L; Pad dari sketsa profil"],
                  ["Pengecoran / cetak injeksi", "95–99 %", "Tebal dinding merata, draft, dan sirip menggantikan pemesinan"],
                  ["Manufaktur aditif", "80–95 %", "Bahan penyangga dan serbuk tak terpakai masuk hitungan"]])
    isi += anim_panel(2, "amber", "Billet menjadi braket: serpihan dan U terbentuk", "cvBillet",
                      [("sl_bl_a", "v_bl_a", "Lebar billet a (mm)", 80, 160, 1, 120, "120"),
                       ("sl_bl_c", "v_bl_c", "Tinggi billet c (mm)", 50, 120, 1, 80, "80"),
                       ("sl_bl_t", "v_bl_t", "Tebal kaki t (mm)", 8, 40, 1, 25, "25")],
                      "btnBillet", "toggleBillet", "billetInfo",
                      "<strong>Cara membaca:</strong> bahan merah terkelupas bertahap seperti proses pemesinan sesungguhnya (PAUSE menahan pada kondisi akhir). Perhatikan bahwa menipiskan kaki t menurunkan massa produk, tetapi justru menurunkan U karena serpihan bertambah — dua sasaran yang harus ditimbang bersama.")
    isi += kotak("info-box", "<strong>🧭 Memodelkan pembanding billet:</strong> pada Tugas 3, billet dibuat sebagai objek terpisah (Part → Primitives → Box) berukuran kotak pembatas braket, lalu U dihitung dari dua <code>Shape.Volume</code>. Cara yang sama berlaku di industri: <code>Shape.BoundBox</code> braket memberi ukuran billet terkecil yang masih mungkin, sehingga U maksimum untuk bentuk itu dapat ditaksir sebelum bengkel menawar harga.")
    m += bagian(3, "m-proses", "Efisiensi Proses:<br>Pemanfaatan Material dan Serpihan", "Bahan yang dibeli tidak sama dengan bahan yang terpakai. Bagian ini mengukur selisihnya sebagai pemanfaatan material, membandingkan proses manufaktur, dan menunjukkan bahwa pilihan proses sering lebih menentukan daripada pilihan material.", isi, "PROSES DAN SERPIHAN")

    # 04 — Daur ulang dan pembongkaran
    isi = figure(4, "Rakitan mono-material berbaut dibandingkan rakitan multi-material yang dilekatkan", "Kiri: dua pelat baja disambung baut, ditandai jenis materialnya, dapat dilepas dan langsung masuk aliran daur ulang. Kanan: baja dilem pada plastik ber-insert logam — kuat, tetapi memerlukan pemisahan manual yang mahal.", gambar4())
    isi += tabel(["Material", "Hemat energi daur ulang", "Mutu setelah daur ulang", "Syarat dari sisi desain"],
                 [["<strong>Aluminium</strong>", "≈ 95 %", "Setara primer bila paduan tidak tercampur", "Pisahkan paduan; hindari insert baja tertanam"],
                  ["<strong>Baja</strong>", "60–74 %", "Sangat baik, rantai daur ulang mapan", "Hindari lapisan Zn/cat tebal yang tidak perlu"],
                  ["<strong>Tembaga / kuningan</strong>", "≈ 85 %", "Baik, nilai sisa tinggi", "Mudah dilepas dari rakitan (kabel, bus)"],
                  ["<strong>Termoplastik</strong>", "10–20 %", "Turun tiap siklus (downcycling)", "Satu jenis polimer per komponen; beri kode resin"],
                  ["<strong>CFRP / komposit</strong>", "&lt; 10 %", "Hanya serat pendek atau pemulihan energi", "Pakai hanya bila massa benar-benar menentukan"]])
    isi += cards([
        ("🔩", "Sambungan yang dapat dilepas", "Baut, snap-fit, dan pin lebih baik daripada lem struktural dan las bila komponen harus dipisahkan. Pada Assembly, joint Fixed dengan baut nyata memudahkan pembongkaran; lem tidak terlihat pada model tetapi menyulitkan di akhir hayat.", "baut > lem"),
        ("🧩", "Mono-material", "Satu komponen sedapat mungkin satu material. Insert logam pada plastik, sisipan karet, dan pelapis menurunkan nilai daur ulang seluruh komponen, bukan hanya bagian sisipannya.", "1 komponen = 1 material"),
        ("🏷️", "Penandaan material", "Tandai material pada model (properti Material FreeCAD 1.0) dan pada produk (kode resin, tanda baja). Tanda yang terbaca membuat pemilahan cepat dan murah.", "tandai di CAD dan produk"),
        ("🔁", "Umur dan perbaikan", "Komponen aus dibuat terpisah dan dapat diganti; bagian mahal dibuat bertahan lebih lama. Modul, bukan monolit — persis prinsip sub-assembly Modul 7 dan 11.", "modular, bukan monolit"),
    ])
    isi += kotak("warning-box", "⚠️ <strong>Yang tidak terlihat pada model:</strong> lem, pelapis, cat, dan perlakuan permukaan tidak menambah volume yang berarti sehingga luput dari perhitungan massa, tetapi justru merekalah yang paling sering menggagalkan daur ulang. Catat pilihan ini pada Spreadsheet jejak (Bagian 07) sebagai kolom tersendiri agar tidak “hilang” hanya karena tidak bervolume.")
    m += bagian(4, "m-daurulang", "Daur Ulang dan Pembongkaran:<br>Merancang untuk Akhir Hayat", "Produk yang tidak dapat dibongkar akan berakhir sebagai limbah campuran betapapun baik materialnya. Bagian ini membandingkan nilai daur ulang tiap material dan merumuskan Design for Disassembly menjadi empat keputusan yang dibuat di dalam berkas rakitan.", isi, "DAUR ULANG DAN DFD")

    # 05 — Jejak material, energi, CO₂
    isi = figure(5, "Alur jejak material: dari Shape.Volume ke massa, energi terkandung, dan CO₂", f"Rakitan dudukan (pelat baja {A_JK} × {B_JK} × {T_JK} mm dan blok aluminium {C_JK} × {C_JK} × {H_JK} mm) bermassa {ind(M_JK, 3)} kg: energi terkandung {ind(E_JK, 1)} MJ dan jejak karbon {ind(CO2_JK, 3)} kg CO₂ — seluruhnya berasal dari dua angka Shape.Volume.", gambar5())
    isi += formula(4, "Energi Terkandung dan Jejak Karbon Rakitan", r"E = e\,m = e\,\rho\,V, \qquad CO_2 = \sum_i f_i\,\rho_i\,V_i",
                   r"\(e\) = energi terkandung spesifik (MJ/kg) &nbsp;·&nbsp; \(f\) = faktor emisi (kg CO₂/kg) &nbsp;·&nbsp; \(V_i\) = volume Body ke-i (mm³). Contoh rakitan dudukan: \(CO_2 = " + ind(FC_ST, 1) + r" \times " + ind(M_JK_ST, 3) + r" + " + ind(FC_AL, 1) + r" \times " + ind(M_JK_AL, 3) + r" = " + ind(CO2_JK, 3) + r"\) kg.",
                   "Dua konstanta material mengubah volume menjadi angka lingkungan: energi terkandung e dan faktor emisi f. Keduanya berlaku per kilogram, jadi urutannya selalu volume → massa → jejak. Untuk rakitan, penjumlahan dilakukan per material, bukan per komponen, karena satu Body dapat memakai material berbeda dari tetangganya. Persamaan ini dipakai Tugas 2 dan Tugas 5.",
                   [("E", "Energi terkandung (MJ)"), ("e", "Energi spesifik material (MJ/kg)"), ("CO_2", "Jejak karbon (kg CO₂)"), ("f", "Faktor emisi (kg CO₂/kg)"), ("V_i", "Volume Body ke-i (mm³)")])
    isi += tabel(["Besaran", "Rumus", "Satuan yang harus dijaga", "Contoh rakitan dudukan"],
                 [["Volume", "<code>Body.Shape.Volume</code>", "mm³", f"{ind(V_JK_ST, 0)} + {ind(V_JK_AL, 0)} mm³"],
                  ["Massa", "m = ρ·V", "ρ kg/mm³ (7,85 × 10⁻⁶ · 2,7 × 10⁻⁶) → kg", f"{ind(M_JK_ST, 3)} + {ind(M_JK_AL, 3)} = {ind(M_JK, 3)} kg"],
                  ["Energi terkandung", "E = e·m", "MJ (e dalam MJ/kg)", f"{ind(E_JK_ST, 1)} + {ind(E_JK_AL, 1)} = {ind(E_JK, 1)} MJ"],
                  ["Jejak karbon", "CO₂ = f·m", "kg CO₂ (f dalam kg CO₂/kg)", f"{ind(CO2_JK_ST, 3)} + {ind(CO2_JK_AL, 3)} = {ind(CO2_JK, 3)} kg"],
                  ["Aluminium daur ulang", f"f = {ind(FC_ALR, 1)} menggantikan {ind(FC_AL, 1)}", "kg CO₂/kg", f"jejak rakitan menjadi {ind(CO2_JK_R, 3)} kg"]])
    isi += anim_panel(3, "green", "Jejak CO₂ dua material terhadap volume komponen", "cvJejak",
                      [("sl_jj_v", "v_jj_v", "Volume komponen V (cm³)", 100, 2000, 10, 600, "600"),
                       ("sl_jj_fst", "v_jj_fst", "Faktor emisi baja f (kg CO₂/kg)", 1, 4, 0.1, 2, "2,0"),
                       ("sl_jj_fal", "v_jj_fal", "Faktor emisi aluminium f (kg CO₂/kg)", 1, 16, 0.1, 12, "12,0")],
                      "btnJejak", "toggleJejak", "jejakInfo",
                      "<strong>Cara membaca:</strong> tiga garis adalah jejak CO₂ terhadap volume untuk baja, aluminium primer, dan aluminium daur ulang; penanda bergerak menyapu volume (PAUSE menahannya pada nilai slider). Pada volume sama aluminium primer selalu di atas baja, dan garis aluminium daur ulang turun ke bawah garis baja — itulah mengapa kandungan daur ulang lebih menentukan daripada nama materialnya.")
    isi += kotak("info-box", "<strong>📌 Angka acuan yang dipakai modul ini:</strong> baja e = " + f"{ind(EE_ST, 0)}" + " MJ/kg dan f = " + f"{ind(FC_ST, 1)}" + " kg CO₂/kg; aluminium primer e = " + f"{ind(EE_AL, 0)}" + " MJ/kg dan f = " + f"{ind(FC_AL, 1)}" + "; aluminium daur ulang f ≈ " + f"{ind(FC_ALR, 1)}" + ". Nilai sebenarnya bergantung pada bauran energi pabrik dan kandungan daur ulang, sehingga selalu cantumkan sumber datanya di Spreadsheet. Tugas memakai angka yang tertulis pada teks soal, bukan angka lain.")
    m += bagian(5, "m-jejak", "Jejak Material, Energi, dan CO&#8322;:<br>Angka Lingkungan dari Model", "Volume adalah satu-satunya besaran lingkungan yang benar-benar dimiliki berkas CAD; sisanya adalah perkalian konstanta. Bagian ini merangkai volume menjadi massa, energi terkandung, dan jejak karbon rakitan, lengkap dengan penjagaan satuan yang paling sering meleset.", isi, "JEJAK MATERIAL DAN CO2")

    # 06 — Lightweighting
    isi = figure(6, "Penampang housing pejal dibandingkan cangkang hasil Thickness", f"Housing baja {A_CG} × {B_CG} × {H_CG} mm pejal bermassa {ind(M_SOLID, 0)} g; setelah Thickness {T_CG} mm dengan muka atas dibuang, massanya {ind(M_SHELL, 2)} g — hemat {ind(HEMAT_CG, 1)} % tanpa mengubah dimensi luar.", gambar6())
    isi += formula(5, "Volume dan Massa Cangkang (Thickness)", r"V_{cangkang} = a\,b\,h - (a - 2t)(b - 2t)(h - t), \qquad m = \rho\,V_{cangkang}",
                   r"\(t\) = tebal dinding (mm), muka atas dibuang sehingga rongga setinggi \(h - t\). Contoh housing " + f"{A_CG} × {B_CG} × {H_CG}" + r" mm, \(t = " + f"{T_CG}" + r"\): \(V = " + ind(V_SHELL, 0) + r"\) mm³ dan \(m = " + ind(M_SHELL, 2) + r"\) g.",
                   "Bahan di tengah penampang hampir tidak memikul beban lentur maupun puntir, sehingga membuangnya menurunkan massa jauh lebih cepat daripada menurunkan kekakuan. Perhatikan bentuk rumusnya: rongga dihitung dengan (a − 2t) dan (b − 2t) karena dinding ada di dua sisi, tetapi dengan (h − t) karena hanya dasar yang tersisa. Persamaan ini dipakai Tugas 4.",
                   [("V_{cangkang}", "Volume cangkang (mm³)"), ("a, b, h", "Dimensi luar (mm)"), ("t", "Tebal dinding (mm)"), (r"\rho", "Massa jenis (g/mm³)")])
    isi += formula(6, "Volume dan Energi Terkandung Tabung Berongga", r"V = \frac{\pi}{4}\left(D^{2} - d^{2}\right)L, \qquad E = e\,\rho\,V",
                   r"\(D, d\) = diameter luar dan dalam (mm) &nbsp;·&nbsp; \(L\) = panjang (mm). Contoh tiang aluminium ⌀" + f"{D_TB}/⌀{DI_TB} × {L_TB}" + r" mm: \(V = " + ind(V_TB, 2) + r"\) mm³, \(m = " + ind(M_TB, 4) + r"\) kg, \(E = " + ind(E_TB, 3) + r"\) MJ.",
                   "Tabung adalah cangkang versi silindris: pada momen inersia yang sama, tabung jauh lebih ringan daripada batang pejal karena bahan berada jauh dari sumbu netral. Dalam FreeCAD, dua lingkaran sepusat dalam satu sketsa langsung menghasilkan profil cincin sehingga Pad menghasilkan tabung tanpa Boolean. Persamaan ini dipakai Tugas 2.",
                   [("V", "Volume tabung (mm³)"), ("D, d", "Diameter luar dan dalam (mm)"), ("L", "Panjang tabung (mm)"), ("E", "Energi terkandung (MJ)"), ("e", "Energi spesifik (MJ/kg)")])
    isi += tabel(["Strategi lightweighting", "Alat FreeCAD", "Penghematan tipikal", "Batas yang harus dijaga"],
                 [["Cangkang (shell)", "Part Design → Thickness", "60–85 % massa", "Tebal dinding minimum proses; Thickness gagal bila t terlalu besar"],
                  ["Tabung menggantikan batang pejal", "Sketsa dua lingkaran → Pad", "40–70 % massa pada I sama", "Tekuk lokal dinding tipis"],
                  ["Lubang penghemat massa", "Pocket + LinearPattern", "10–25 % massa", "Konsentrasi tegangan Kt di tepi lubang (Modul 09)"],
                  ["Rusuk menggantikan tebal merata", "Pad tipis + rusuk", "20–40 % massa pada δ sama", "Rusuk tipis rawan tekuk; sudut perlu fillet"],
                  ["Substitusi material", "Properti Material + ekspresi", "sampai 70 % massa", "Jejak belum tentu ikut turun (Bagian 05)"],
                  ["Mengurangi jumlah komponen", "Menggabungkan fitur dalam satu Body", "massa pengencang hilang", "Jangan mengorbankan kemudahan bongkar"]])
    isi += anim_panel(4, "violet", "Cangkang menipis: massa turun, dinding mendekati batas proses", "cvCangkang",
                      [("sl_cg_a", "v_cg_a", "Panjang a (mm)", 100, 220, 5, 160, "160"),
                       ("sl_cg_h", "v_cg_h", "Tinggi h (mm)", 40, 120, 5, 80, "80"),
                       ("sl_cg_t", "v_cg_t", "Tebal dinding t (mm)", 2, 12, 0.5, 5, "5,0")],
                      "btnCangkang", "toggleCangkang", "cangkangInfo",
                      "<strong>Cara membaca:</strong> penampang cangkang menipis dan menebal (PAUSE menahan pada nilai slider), sementara kurva di kanan menunjukkan massa terhadap tebal dinding. Perhatikan kurva yang melandai: menipiskan dinding dari 8 ke 5 mm menghemat jauh lebih banyak daripada dari 3 ke 2 mm, sementara risiko cacat proses justru melonjak.")
    isi += kotak("warning-box", "⚠️ <strong>Thickness gagal atau menghasilkan bentuk aneh?</strong> Pastikan Mode Skin, muka yang dibuang benar-benar terpilih, dan tebal lebih kecil dari setengah sisi terpendek serta lebih kecil dari radius fillet mana pun yang sudah ada. Bila model memiliki fillet kecil di sudut dalam, buat Thickness lebih dahulu lalu fillet setelahnya.")
    m += bagian(6, "m-ringan", "Lightweighting:<br>Cangkang, Tabung, dan Rusuk", "Setelah material dan proses ditetapkan, tuas terakhir adalah geometri: memindahkan bahan dari tempat yang tidak memikul beban. Bagian ini menghitung cangkang dan tabung, merangkum strategi lightweighting, dan menandai batas yang tidak boleh dilewati.", isi, "LIGHTWEIGHTING")

    # 07 — Spreadsheet jejak
    isi = tabel(["Sel", "Alias", "Isi", "Satuan"],
                [["B1", "<code>rho_st</code>", "7,85e-6", "kg/mm³"],
                 ["B2", "<code>rho_al</code>", "2,7e-6", "kg/mm³"],
                 ["B3", "<code>f_st</code>", f"{ind(FC_ST, 1)}", "kg CO₂/kg"],
                 ["B4", "<code>f_al</code>", f"{ind(FC_AL, 1)}", "kg CO₂/kg"],
                 ["B5", "<code>V_pelat</code>", "<code>=Pelat.Shape.Volume</code>", "mm³"],
                 ["B6", "<code>V_blok</code>", "<code>=Blok.Shape.Volume</code>", "mm³"],
                 ["B7", "<code>m_total</code>", "<code>=rho_st * V_pelat + rho_al * V_blok</code>", "kg"],
                 ["B8", "<code>co2_total</code>", "<code>=f_st * rho_st * V_pelat + f_al * rho_al * V_blok</code>", "kg CO₂"]])
    isi += cards([
        ("🔗", "Alias dua arah", "Sel beralias dapat dirujuk ekspresi properti model (<code>=Jejak.t_dinding</code>) dan sekaligus membaca model (<code>=Body.Shape.Volume</code>). Satu berkas berisi geometri sekaligus neraca jejaknya.", "=Jejak.co2_total"),
        ("🧮", "Satu sumber kebenaran", "Konstanta material ditulis sekali di Spreadsheet, tidak diketik ulang di tiap rumus. Mengganti f aluminium primer menjadi daur ulang cukup satu sel dan seluruh tabel ikut berubah.", "ubah 1 sel"),
        ("📊", "Tabel iterasi", "Simpan tiap alternatif sebagai satu baris: massa, energi, jejak, dan catatan. Inilah dokumentasi keputusan yang diminta pada laporan tugas dan pada audit pelanggan.", "1 alternatif = 1 baris"),
        ("🧾", "Sumber data", "Tulis sumber setiap konstanta (basis data material, laporan pemasok, tahun). Angka tanpa sumber tidak dapat dipertahankan saat ditanya pembeli.", "cantumkan sumber"),
    ])
    isi += tabel(["Alternatif rakitan dudukan", "Perubahan pada model", "Massa total (kg)", "Jejak (kg CO₂)"],
                 [["Awal — pelat baja " + f"{T_JK}" + " mm + blok aluminium primer", "—", ind(M_JK, 3), ind(CO2_JK, 3)],
                  ["Blok aluminium daur ulang", f"hanya konstanta f_al menjadi {ind(FC_ALR, 1)}", ind(M_JK, 3), ind(CO2_JK_R, 3)],
                  ["Pelat ditipiskan menjadi " + f"{T_JK2}" + " mm", "Pad pelat diubah lewat ekspresi", ind(M_JK2, 3), ind(CO2_JK_T, 3)],
                  ["Gabungan: pelat tipis + aluminium daur ulang", "dua perubahan di atas sekaligus", ind(M_JK2, 3), ind(CO2_JK_RT, 3)]])
    isi += kotak("tip-box", "💡 <strong>Urutan yang paling cepat memberi hasil:</strong> (1) benahi kandungan daur ulang material berfaktor emisi tinggi — sering menurunkan jejak paling besar tanpa menyentuh geometri; (2) kurangi massa lewat cangkang dan tabung; (3) perbaiki pemanfaatan material dengan mengubah proses; (4) baru pertimbangkan penggantian material, karena itulah perubahan yang paling banyak menuntut perhitungan ulang kekuatan.")
    m += bagian(7, "m-spreadsheet", "Spreadsheet Jejak:<br>Neraca yang Ikut Berubah bersama Model", "Perhitungan jejak yang ditulis di kertas akan basi begitu sketsa diubah. Bagian ini membangun Spreadsheet beralias yang membaca volume langsung dari Body, lalu memakainya untuk membandingkan empat alternatif desain dalam satu tabel iterasi.", isi, "SPREADSHEET JEJAK")

    # 08 — Python console
    isi = kode("Python console — tabel massa, energi terkandung, dan jejak CO₂ tiap Body", f'''import FreeCAD as App, Part
V = App.Vector
doc = App.newDocument("Jejak13")
pelat = Part.makeBox({A_JK}, {B_JK}, {T_JK})                            # pelat baja a x b x t
blok = Part.makeBox({C_JK}, {C_JK}, {H_JK}, V({(A_JK - C_JK) / 2}, {(B_JK - C_JK) / 2}, {T_JK}))       # blok aluminium di atas pelat
# nama, shape, rho (kg/mm3), e (MJ/kg), f (kg CO2/kg)
bahan = [("Pelat baja", pelat, 7.85e-6, {EE_ST}, {FC_ST}), ("Blok aluminium", blok, 2.7e-6, {EE_AL}, {FC_AL})]
m_tot = e_tot = c_tot = 0
for nama, sh, rho, e, f in bahan:
    m = rho * sh.Volume
    m_tot = m_tot + m; e_tot = e_tot + e * m; c_tot = c_tot + f * m
    print(f"{{nama:15s}} V = {{sh.Volume:9.0f}} mm3  m = {{m:7.3f}} kg  E = {{e*m:7.1f}} MJ  CO2 = {{f*m:7.3f}} kg")
print(f"TOTAL massa {{m_tot:.3f}} kg, energi {{e_tot:.1f}} MJ, jejak {{c_tot:.3f}} kg CO2")        # {ind(CO2_JK, 3)} kg CO2
Part.show(pelat, "Pelat"); Part.show(blok, "Blok")''', "Python (FreeCAD)")
    isi += kode("Python console — pemanfaatan material billet dan energi terkandung tabung", f'''import FreeCAD as App, Part, math
V = App.Vector
a, b, c, t = {A_BI}, {B_BI}, {C_BI}, {T_BI}
billet = Part.makeBox(a, b, c)
profil = Part.Face(Part.makePolygon([V(0,0,0), V(a,0,0), V(a,0,t), V(t,0,t), V(t,0,c), V(0,0,c), V(0,0,0)]))
braket = profil.extrude(V(0, b, 0))                       # Pad profil L sedalam b
U = 100 * braket.Volume / billet.Volume
print(f"V_braket = {{braket.Volume:.1f}} mm3, V_billet = {{billet.Volume:.1f}} mm3")
print(f"U = {{U:.3f}} %, serpihan = {{100-U:.3f}} %")                                  # {ind(U_BI, 3)} %
print(f"BoundBox braket = {{braket.BoundBox.XLength:.0f}} x {{braket.BoundBox.YLength:.0f}} x {{braket.BoundBox.ZLength:.0f}} mm")
# tabung aluminium D/d x L: volume, massa, energi terkandung
D, d, L = {D_TB}, {DI_TB}, {L_TB}
tabung = Part.makeCylinder(D/2, L).cut(Part.makeCylinder(d/2, L))
m = 2.7e-6 * tabung.Volume
print(f"tabung V = {{tabung.Volume:.2f}} mm3 (rumus {{math.pi/4*(D**2-d**2)*L:.2f}})")            # {ind(V_TB, 2)}
print(f"m = {{m:.4f}} kg, E = {{{EE_AL} * m:.3f}} MJ, CO2 = {{{FC_AL} * m:.3f}} kg")                 # {ind(E_TB, 3)} MJ''', "Python (FreeCAD)")
    isi += kode("Python console — cangkang Thickness, sapuan tebal dinding, dan substitusi material", f'''import FreeCAD as App, Part
a, b, h, t = {A_CG}, {B_CG}, {H_CG}, {T_CG}
kotak = Part.makeBox(a, b, h)
atas = [f for f in kotak.Faces if abs(f.CenterOfMass.z - h) < 1e-6]        # muka yang dibuang
cangkang = kotak.makeThickness(atas, -t, 1e-3)                             # tebal ke dalam (negatif)
print(f"V_pejal = {{kotak.Volume:.0f}}, V_cangkang = {{cangkang.Volume:.0f}} mm3")
print(f"rumus = {{a*b*h - (a-2*t)*(b-2*t)*(h-t):.0f}} mm3")                                   # {ind(V_SHELL, 0)}
print(f"massa cangkang = {{7.85e-3*cangkang.Volume:.2f}} g dari pejal {{7.85e-3*kotak.Volume:.2f}} g")   # {ind(M_SHELL, 2)} g
for tt in (3, 4, 5, 6, 8):
    v = a*b*h - (a-2*tt)*(b-2*tt)*(h-tt)
    print(f"  t = {{tt}} mm -> m = {{7.85e-3*v:8.2f}} g, hemat {{100*(1-v/(a*b*h)):5.1f}} %")
# material dengan kekakuan lentur sama: h_i = h*(E_baja/E_i)^(1/3)
L, bb, h0, E0, rho0 = {L_BM}, {B_BM}, {H_BM}, {E_ST}, 7.85e-3
for nama, E, rho in [("Baja", {E_ST}, 7.85e-3), ("Aluminium", {E_AL}, 2.70e-3), ("Titanium", {E_TI}, 4.50e-3), ("Magnesium", {E_MG}, 1.80e-3)]:
    hi = h0 * (E0/E) ** (1/3)
    print(f"{{nama:10s}} h = {{hi:5.2f}} mm, m = {{rho*L*bb*hi:8.1f}} g, indeks = {{E**(1/3)/(rho*1000):5.2f}}")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum mengerjakan tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (jejak rakitan " + ind(CO2_JK, 3) + " kg CO₂, U braket " + ind(U_BI, 3) + " %, tabung " + ind(V_TB, 2) + " mm³ dan " + ind(E_TB, 3) + " MJ, cangkang " + ind(V_SHELL, 0) + " mm³ dan " + ind(M_SHELL, 2) + " g). Tugas tetap meminta model dibangun dengan Part Design (Body, Sketch, Pad, Pocket, Thickness) dan Spreadsheet agar pohon fiturnya tersimpan di berkas; Part API di sini hanya alat pemeriksa rumus.")
    m += bagian(8, "m-python", "Python Console:<br>Tabel Massa dan Jejak Otomatis", "Cell pertama menyusun tabel massa, energi, dan jejak untuk setiap Body sekaligus; cell kedua menghitung pemanfaatan material billet dan energi terkandung tabung; cell ketiga membuat cangkang dengan Thickness, menyapu tebal dinding, dan membandingkan material pada kekakuan sama.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Body housing dan Spreadsheet", f"Buat Body: Sketch XY persegi panjang {A_CG} × {B_CG} (sudut kiri-bawah di titik asal, fully constrained) → Pad {H_CG} mm. Tambahkan Spreadsheet bernama <code>Jejak</code>, isi alias <code>rho_st</code>, <code>f_st</code>, <code>t_dinding</code> = {T_CG}."),
               ("2", "Massa pejal sebagai garis dasar", f"Di Python console: <code>Body.Shape.Volume</code> lalu massa = 7,85 × 10⁻³ × V. Catat sebagai baris pertama tabel iterasi ({ind(M_SOLID, 0)} g untuk ukuran contoh). Tanpa garis dasar, penghematan tidak dapat diklaim."),
               ("3", "Cangkang dengan Thickness", "Pilih muka ATAS → Part Design → Thickness, Thickness diikat ekspresi <code>=Jejak.t_dinding</code>, Mode Skin, arah ke dalam. Baca volume dan massa baru; bandingkan dengan Persamaan (5)."),
               ("4", "Sapuan tebal dinding", "Ubah <code>t_dinding</code> menjadi 8, 6, 5, 4, lalu 3 mm dan catat massanya tiap kali. Perhatikan kapan penghematan mulai melandai dan kapan Thickness mulai gagal."),
               ("5", "Neraca jejak", f"Tambahkan sel <code>V_body</code> = <code>=Body.Shape.Volume</code> dan <code>co2</code> = <code>=f_st * rho_st * V_body</code>. Ubah satu dimensi sketsa dan pastikan angka jejak ikut berubah tanpa mengetik ulang apa pun."),
               ("6", "Alternatif material", f"Duplikat baris tabel untuk aluminium: tinggi penampang disesuaikan agar kekakuan sama (Persamaan 2), ρ dan f diganti. Bandingkan massa dan jejaknya — perhatikan bahwa massa turun tetapi jejak dapat naik."),
               ("7", "Dokumentasi dan simpan", "Tulis kesimpulan satu paragraf pada sel catatan Spreadsheet: alternatif terpilih, penghematan massa, penghematan jejak, dan batas yang dijaga. Ctrl+S → <code>Latihan13_NIM.FCStd</code>.")]
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
                 [["Thickness gagal: “Resulting shape is invalid”", "Tebal lebih besar dari setengah sisi terpendek, atau fillet kecil sudah ada", "Kecilkan t; buat Thickness sebelum fillet; periksa muka yang dibuang"],
                  ["Massa cangkang sama dengan massa pejal", "Membaca <code>Pad.Shape.Volume</code>, bukan <code>Body.Shape.Volume</code> (Tip)", "Baca Body; Std Measure Volume dengan memilih Body"],
                  ["Jejak CO₂ meleset 1000 kali", "ρ dalam g/mm³ dipakai bersama f per kilogram", "Pakai ρ kg/mm³ (7,85 × 10⁻⁶) bila hasil diminta dalam kg"],
                  ["Angka Spreadsheet tidak berubah saat model diubah", "Sel berisi angka ketik, bukan ekspresi <code>=Body.Shape.Volume</code>", "Ganti menjadi ekspresi; recompute dokumen (F5)"],
                  ["U lebih besar dari 100 %", "V_billet diambil lebih kecil dari kotak pembatas komponen", "Billet minimal seukuran <code>Shape.BoundBox</code> braket"],
                  ["Massa aluminium lebih ringan tetapi jejak naik", "Faktor emisi aluminium primer enam kali baja", "Gunakan kandungan daur ulang; bandingkan pada fungsi yang sama"],
                  ["Volume tabung tidak sesuai rumus", "Dua lingkaran tidak sepusat atau profil bukan cincin", "Konstrain Coincident pusat ke origin; periksa profil sebelum Pad"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) satu Body per komponen dengan pohon fitur sesuai permintaan soal; (2) semua sketsa fully constrained; (3) angka bacaan diambil dari Body (Tip), bukan fitur perantara; (4) satuan sesuai <em>inputLabel</em> tugas (g, MJ, %, atau kg CO₂) dengan jumlah desimal yang diminta; (5) Spreadsheet memakai ekspresi, bukan angka ketik; (6) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Housing Ringan Berlabel Jejak", "Tujuh langkah berikut menjalankan satu siklus desain berkelanjutan lengkap: garis dasar massa, cangkang Thickness, sapuan tebal dinding, neraca jejak yang hidup di Spreadsheet, alternatif material, dan dokumentasi keputusan; ditutup tabel gejala dan perbaikan.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. F. Ashby", "Materials and the Environment: Eco-informed Material Choice", ", 2nd ed. Butterworth-Heinemann, 2013.", "Sumber energi terkandung, faktor emisi, dan cara membandingkan alternatif desain pada fungsi yang sama.")
    refs += pm_ref(2, "amber", "249,115,22", "M. F. Ashby", "Materials Selection in Mechanical Design", ", 5th ed. Butterworth-Heinemann, 2016.", "Indeks material untuk balok lentur (E^(1/3)/ρ) dan prosedur pemilihan material berbasis fungsi–kendala–tujuan.")
    refs += pm_ref(3, "violet", "168,85,247", "G. Boothroyd, P. Dewhurst &amp; W. A. Knight", "Product Design for Manufacture and Assembly", ", 3rd ed. CRC Press, 2011.", "Dasar DFMA dan Design for Disassembly: jumlah komponen, jenis sambungan, dan biaya bongkar pasang.")
    refs += pm_ref(4, "green", "0,224,158", "FreeCAD Community", "FreeCAD 1.0 Documentation: PartDesign Thickness, Spreadsheet Workbench, Material, Part TopoShape (Volume, BoundBox)", " (wiki.freecad.org), 2024–2026.", "Acuan parameter Thickness, alias dan ekspresi Spreadsheet, serta API volume yang dipakai pada cell Python.")
    refs += pm_ref(5, "pink", "236,72,153", "T. E. Graedel &amp; B. R. Allenby", "Industrial Ecology and Sustainable Engineering", ". Pearson, 2010.", "Kerangka siklus hidup, 3R, dan batas sistem yang membedakan jejak bahan dari LCA penuh ISO 14040/14044.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari indeks material, energi terkandung dan faktor emisi, desain untuk pembongkaran, serta alat FreeCAD yang dipakai menghitung jejak. Basis data material selalu berubah mengikuti bauran energi, jadi cantumkan edisi dan tahun sumber pada laporan Anda.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki PartDesign Thickness, Spreadsheet Workbench (alias dan ekspresi), Material, dan Part TopoShape; ringkasan ISO 14040/14044 untuk batas sistem LCA; basis data faktor emisi publik (mis. ICE dan laporan asosiasi logam) sebagai pembanding angka kelas.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 13 — Prinsip Desain Berkelanjutan dalam CAD · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">m = &rho;&middot;V</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">E = e&middot;m</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">U = V_part/V_billet</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Thickness t</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">CO&#8322; = &Sigma; f&rho;V</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 14 · Desain Berkelanjutan dalam CAD</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 13</span><br><em>Massa, Energi,</em><br>dan Jejak Karbon</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang siklus hidup dan 3R, indeks material, pemanfaatan material, daur ulang dan pembongkaran, cangkang Thickness, serta Spreadsheet jejak, ditambah 5 tugas pemodelan: pelat aluminium berlubang, tabung tiang rak, braket L dari billet, housing cangkang, dan rakitan dua material. Setiap tugas mengunggah berkas .FCStd dan mengisi satu angka yang diturunkan dari Shape.Volume. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Alasan utama prinsip berkelanjutan diterapkan sejak tahap <strong>desain/CAD</strong> adalah...",
     ["Perangkat lunak CAD mewajibkan pengisian data lingkungan sebelum berkas dapat disimpan",
      "Sekitar 80% dampak sepanjang siklus hidup sudah terkunci oleh keputusan desain (material, massa, bentuk, sambungan), sementara biaya mengubahnya masih kecil",
      "Dampak lingkungan hanya muncul pada tahap produksi sehingga cukup diurus oleh bengkel",
      "Perhitungan jejak baru sah dilakukan setelah produk dipakai satu tahun penuh"],
     "Mengapa mulai dari desain"),
    ("Penerapan <strong>3R</strong> yang paling tepat pada tahap pemodelan CAD adalah...",
     ["Reduce: massa, jumlah komponen, dan serpihan minimum; Reuse: komponen standar dan App::Link yang dipakai ulang; Recycle: mono-material yang mudah dipisahkan dan diberi tanda",
      "Reduce: memperkecil ukuran berkas .FCStd; Reuse: menyalin sketsa antar dokumen; Recycle: menghapus fitur lama dari pohon fitur",
      "Reduce: mengurangi jumlah gambar kerja; Reuse: memakai template lembar TechDraw; Recycle: mencetak bolak-balik",
      "Reduce: menurunkan resolusi tesselasi tampilan; Reuse: membuka kembali dokumen lama; Recycle: mengosongkan folder sementara"],
     "3R pada tahap CAD"),
    ("<strong>Energi terkandung</strong> (embodied energy) sebuah komponen dihitung dengan...",
     ["Menjumlahkan panjang seluruh rusuk model lalu dikalikan energi spesifik material",
      "Membagi volume model dengan massa jenis lalu dikalikan 1000",
      "Mengalikan massa komponen (ρ × Shape.Volume) dengan energi spesifik material e dalam MJ/kg",
      "Mengalikan luas permukaan Shape.Area dengan energi spesifik material"],
     "Menghitung energi terkandung"),
    ("Pada kekakuan lentur yang sama dengan lebar penampang tetap, material yang memberi <strong>massa balok terkecil</strong> adalah yang memiliki...",
     ["Massa jenis ρ terkecil, tanpa memperhatikan modulus elastisitas",
      "Modulus elastisitas E terbesar, tanpa memperhatikan massa jenis",
      "Rasio E/ρ (kekakuan spesifik tarik) terbesar",
      "Indeks E^(1/3)/ρ terbesar, karena h ∝ E^(−1/3) sehingga massa sebanding dengan ρ/E^(1/3)"],
     "Indeks material balok lentur"),
    ("<strong>Pemanfaatan material</strong> sebuah proses pemesinan dinyatakan sebagai...",
     ["100 × V_billet/V_part, yaitu berapa kali bahan baku lebih besar daripada komponen",
      "100 × V_part/V_billet, yaitu perbandingan volume komponen jadi terhadap volume bahan baku; sisanya menjadi serpihan",
      "100 × massa serpihan/massa billet, yaitu bagian yang dapat didaur ulang",
      "100 × luas permukaan komponen/luas permukaan billet"],
     "Pemanfaatan material U"),
    ("<strong>Design for Disassembly</strong> (DfD) menuntut...",
     ["Sambungan lem struktural pada semua bidang kontak agar rakitan sekaku mungkin",
      "Jenis material sebanyak mungkin agar tiap fungsi memperoleh material paling optimal",
      "Sambungan yang mudah dilepas (baut, snap-fit), jenis material sesedikit mungkin, dan penandaan material agar pemisahan di akhir hayat murah",
      "Seluruh komponen dilas penuh sehingga produk tidak perlu dibongkar selamanya"],
     "Design for Disassembly"),
    ("<strong>Jejak karbon material</strong> sebuah rakitan dihitung dari model CAD dengan...",
     ["Σ fᵢ × ρᵢ × Vᵢ: faktor emisi tiap material dikalikan massanya, dengan Vᵢ dibaca dari Shape.Volume tiap Body",
      "Faktor emisi rata-rata dikalikan volume total rakitan tanpa memperhatikan jenis material",
      "Faktor emisi dikalikan jumlah komponen dalam pohon rakitan",
      "Faktor emisi dikalikan luas permukaan total rakitan"],
     "Jejak karbon rakitan"),
    ("Fitur <strong>Thickness</strong> (shell) pada Part Design...",
     ["Menambahkan lapisan bahan di luar solid setebal t sehingga dimensi luar bertambah",
      "Memecah satu solid menjadi beberapa Body terpisah",
      "Mengubah satuan panjang dokumen menjadi milimeter",
      "Mengosongkan bagian dalam solid dan menyisakan dinding setebal t dengan muka terpilih dibuang; volume cangkang = V_luar − V_rongga"],
     "Fungsi Thickness"),
    ("Manfaat memberi <strong>alias</strong> pada sel Spreadsheet FreeCAD untuk perhitungan jejak adalah...",
     ["Angka pada sel otomatis dibulatkan menjadi dua desimal",
      "Sel menjadi hanya-baca sehingga nilainya tidak dapat diubah lagi",
      "Sel dapat dirujuk ekspresi properti model dan sel dapat membaca model (=Body.Shape.Volume), sehingga jejak ikut terhitung ulang saat model berubah",
      "Ukuran berkas .FCStd menjadi lebih kecil karena rumus disimpan sebagai teks"],
     "Alias Spreadsheet"),
    ("Dibandingkan aluminium primer, <strong>aluminium daur ulang</strong>...",
     ["Memerlukan energi produksi yang kira-kira sama sehingga jejaknya tidak berubah",
      "Hanya memerlukan sekitar 5–10% energi produksi primer, sehingga energi terkandung dan faktor emisinya turun drastis",
      "Memerlukan energi lebih besar karena harus dipisahkan dari paduan lain terlebih dahulu",
      "Tidak dapat dipakai untuk komponen struktural dalam bentuk apa pun"],
     "Aluminium daur ulang"),
]

TUGAS_LABELS = ["Pelat aluminium berlubang — massa (g)", "Tabung aluminium — energi terkandung (MJ)",
                "Braket L dari billet — pemanfaatan U (%)", "Housing cangkang Thickness — massa (g)",
                "Rakitan baja + aluminium — jejak CO₂ (kg)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 3}

FQ_JUDUL = [
    "Bagaimana menyusun neraca massa dan jejak CO₂ rak dari model CAD, dan volume mana yang sah dibaca?",
    "Rangka baja diganti aluminium: kapan jejak turun dan kapan justru naik pada kekakuan yang sama?",
    "Bagaimana menurunkan serpihan dan massa sekaligus tanpa melanggar kekuatan, lalu mendokumentasikannya?",
]
FQ_RINGKAS = [
    "Susun tabel massa, energi terkandung, dan jejak CO₂ untuk empat komponen rak dari Shape.Volume tiap Body, dan jelaskan mengapa volume harus dibaca dari Body (Tip) bukan dari Pad sebelum Pocket.",
    "Bandingkan rangka baja dan aluminium pada kekakuan lentur sama dengan Persamaan (2), lalu kalikan faktor emisinya. Tentukan pada syarat apa aluminium benar-benar menurunkan jejak.",
    "Pilih kombinasi perubahan proses dan geometri (pelat tekuk, cangkang Thickness, tabung) yang menurunkan serpihan dan massa, lalu susun tabel iterasi Spreadsheet sebagai dokumentasi keputusan.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Rak logam seri “Rakita 5” terdiri atas empat komponen: empat tiang tabung aluminium ⌀40/⌀32 × 1800 mm, lima papan baja 900 × 400 × 1,5 mm, delapan braket L aluminium yang dipesin dari billet, dan tiga puluh dua baut baja. Pembeli meminta neraca massa dan jejak karbon per unit rak. Susun tabelnya dari model CAD (Bagian 05): volume tiap Body, massa dengan ρ yang benar, energi terkandung, dan jejak CO₂ per material. Jelaskan mengapa membaca volume dari Pad sebelum Pocket membuat seluruh neraca meleset.",
            ["4 tiang ⌀40/⌀32 × 1800", "5 papan 900 × 400 × 1,5", "8 braket + 32 baut"],
            "Angka volume yang sah dipakai menghitung massa dan jejak tiap komponen adalah...",
            ["Properti Length pada fitur Pad, karena Pad menentukan panjang komponen",
             "Volume kotak pembatas Shape.BoundBox, karena itulah bahan yang dibeli",
             "Shape.Volume pada Body (fitur Tip), yaitu volume solid akhir setelah semua Pocket dan Thickness",
             "Jumlah luas seluruh muka Shape.Area dikalikan tebal rata-rata"],
            "✅ Tepat! Body.Shape selalu menunjuk fitur Tip, yaitu solid akhir. BoundBox berguna untuk menaksir billet pada perhitungan pemanfaatan material, tetapi bukan volume komponen; Length dan Area bukan volume sama sekali.",
            "❌ Length dan Area bukan volume; BoundBox adalah bahan baku, bukan produk. Lihat Persamaan (1) dan kotak pada Bagian 05.",
            "Petunjuk: (1) Daftarkan volume tiap Body. (2) Kalikan ρ dan f per material. (3) Jelaskan akibat membaca fitur perantara.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Bagian pemasaran mengusulkan seluruh rangka baja diganti aluminium supaya rak “lebih hijau dan lebih ringan”. Rangka harus sekaku sebelumnya. Gunakan Persamaan (2) untuk menetapkan tinggi penampang aluminium, hitung massanya, lalu kalikan faktor emisi (baja " + f"{ind(FC_ST, 1)}" + "; aluminium primer " + f"{ind(FC_AL, 1)}" + "; aluminium daur ulang " + f"{ind(FC_ALR, 1)}" + " kg CO₂/kg). Simpulkan usulan itu dengan angka, bukan dengan kesan, dan sebutkan syarat yang membuatnya benar.",
            ["E·I harus tetap", "f baja " + ind(FC_ST, 1) + " · Al primer " + ind(FC_AL, 1), "Al daur ulang " + ind(FC_ALR, 1)],
            "Pada kekakuan lentur sama, mengganti baja dengan aluminium primer biasanya membuat...",
            ["Massa turun sekitar setengah, tetapi jejak CO₂ naik karena faktor emisi aluminium primer sekitar enam kali baja",
             "Massa dan jejak keduanya turun sekitar setengah karena aluminium lebih ringan",
             "Massa naik karena penampang harus lebih tinggi, sehingga jejak ikut naik",
             "Massa dan jejak tidak berubah karena kekakuannya disamakan"],
            "✅ Tepat! Massa aluminium pada kekakuan sama sekitar 0,50 kali massa baja, tetapi f-nya enam kali; hasil kalinya kira-kira tiga kali jejak baja. Aluminium baru menang bila kandungan daur ulangnya tinggi, atau bila massa rendah memberi keuntungan lain sepanjang pemakaian.",
            "❌ Massa memang turun, tetapi jejak adalah massa × faktor emisi. Periksa kembali Persamaan (2) dan (4) serta Animasi 3.",
            "Petunjuk: (1) Hitung h dan massa aluminium. (2) Kalikan faktor emisi ketiga pilihan. (3) Sebutkan syarat aluminium benar-benar menurunkan jejak.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Braket rak saat ini dipesin dari billet dengan pemanfaatan material sekitar seperlima, sementara papan baja dinilai terlalu berat. Bengkel menawarkan pelat tekuk untuk braket dan menawarkan menipiskan papan dengan rusuk tepi. Tentukan kombinasi perubahan proses dan geometri yang menurunkan serpihan sekaligus massa (Bagian 03 dan 06), hitung perkiraan penghematannya, dan jelaskan batas yang tidak boleh dilanggar. Susun hasilnya sebagai tabel iterasi Spreadsheet seperti Bagian 07.",
            ["U braket ≈ 20 %", "pelat tekuk vs billet", "rusuk · cangkang · tabung"],
            "Langkah yang paling besar menurunkan bahan terbuang pada braket tersebut adalah...",
            ["Mengganti baja menjadi aluminium tanpa mengubah proses",
             "Menambah lubang penghemat massa pada braket hasil pemesinan",
             "Memperbesar billet agar pencekaman lebih aman",
             "Mengganti proses menjadi pelat potong laser yang ditekuk, sehingga pemanfaatan material naik dari sekitar 20 % menjadi 85–95 %"],
            "✅ Tepat! Perubahan proses mengubah pembagi U secara langsung: bentuk tekuk hampir tidak menyisakan serpihan, sedangkan lubang dan substitusi material hanya menggeser sedikit angka. Syaratnya, bentuk braket harus dapat dibentangkan dan radius tekuk dihormati.",
            "❌ Substitusi material dan lubang tidak mengubah besarnya serpihan pemesinan; memperbesar billet justru menurunkan U. Lihat tabel proses pada Bagian 03.",
            "Petunjuk: (1) Bandingkan U dua proses. (2) Hitung penghematan massa papan. (3) Tulis tabel iterasi dan batas prosesnya.")
    kartu = lambda teks, rgb, warna: f'      <div style="background:rgba({rgb},.05);border:1px solid rgba({rgb},.15);border-radius:10px;padding:12px 16px;font-family:\'JetBrains Mono\',monospace;font-size:13px;color:var(--{warna})">{teks}</div>'  # noqa: E731
    return f'''<div class="page" id="page-forum">
<div class="hero" data-tab="forum" style="min-height:55vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1c" d="" fill="none" stroke="rgba(0,230,118,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2c" d="" fill="none" stroke="rgba(124,77,255,.08)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">label rendah karbon</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">m = &rho;&middot;V</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">CO&#8322; = &Sigma; f&rho;V</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">U = V_part/V_billet</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 14 · Desain Berkelanjutan dalam CAD</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Rak Logam<br><em>Berlabel Karbon</em></h1>
    <p class="hero-sub">CV Rakita Logam ingin mencantumkan angka jejak karbon pada katalog raknya. Terapkan Pertemuan 14: neraca massa dari Shape.Volume, indeks material pada kekakuan sama, pemanfaatan material, cangkang dan tabung, serta Spreadsheet jejak, agar angka yang dicantumkan dapat dipertanggungjawabkan.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">CV Rakita Logam —<br>Rak Logam yang Ingin Berlabel Rendah Karbon</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS DESAIN BERKELANJUTAN</div>
    <p>
      <strong style="color:var(--amber)">CV Rakita Logam</strong> memproduksi rak dan meja logam. Pembeli dari jaringan ritel meminta <strong style="color:var(--cyan)">angka jejak karbon per unit</strong> untuk seri rak “Rakita 5”: empat tiang tabung aluminium ⌀40/⌀32 × 1800 mm, lima papan baja 900 × 400 × 1,5 mm, delapan braket L aluminium yang dipesin dari billet, dan tiga puluh dua baut baja.
    </p>
    <p style="margin-top:12px">
      Data yang ada saat ini simpang siur: berat katalog diambil dari taksiran lama, braket dipesin dari billet dengan <strong>pemanfaatan material sekitar seperlima</strong>, dan bagian pemasaran sudah terlanjur mengusulkan <strong style="color:var(--cyan)">mengganti seluruh rangka menjadi aluminium</strong> supaya terdengar lebih hijau. Belum ada seorang pun yang menghitung massa dari model, apalagi mengalikannya dengan faktor emisi.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur perhitungan jejak</strong>: volume mana yang dibaca, konstanta apa yang dipakai beserta sumbernya, alternatif desain apa yang dibandingkan, dan bagaimana hasilnya didokumentasikan agar tahan diaudit pembeli.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("4 tiang aluminium ⌀40/⌀32 × 1800", "14,165,233", "cyan")}
{kartu("5 papan baja 900 × 400 × 1,5", "14,165,233", "cyan")}
{kartu("8 braket L dari billet, U ≈ 20 %", "14,165,233", "cyan")}
{kartu("Target: angka jejak per unit rak", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Tiga masalah yang harus dibereskan: volume yang dibaca dari fitur yang salah, perbandingan material yang tidak menyamakan fungsi, dan serpihan pemesinan yang tidak pernah masuk hitungan. Forum ini membahas ketiganya dengan angka.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Empat komponen rak dan jejak karbonnya: tiang tabung, papan baja, braket dari billet, dan baut</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = ("CV Rakita Logam memproduksi rak logam seri &ldquo;Rakita 5&rdquo;: empat tiang tabung aluminium &oslash;40/&oslash;32 &times; 1800 mm, lima papan baja 900 &times; 400 &times; 1,5 mm, "
                      "delapan braket L aluminium yang dipesin dari billet dengan pemanfaatan material sekitar seperlima, dan 32 baut baja. Pembeli ritel meminta angka jejak karbon per unit rak, "
                      "sementara berat katalog masih taksiran lama dan bagian pemasaran sudah mengusulkan mengganti seluruh rangka menjadi aluminium agar terdengar lebih hijau. Susun prosedur perhitungannya: "
                      "volume mana yang dibaca dari model (Body/Tip), konstanta &rho;, e, dan f beserta sumbernya, perbandingan material pada kekakuan sama, perbaikan pemanfaatan material dan lightweighting, "
                      "serta tabel iterasi Spreadsheet sebagai dokumentasi keputusan.")
FORUM_CHIPS_LMS = ["4 tiang ⌀40/⌀32 × 1800", "5 papan baja 900 × 400 × 1,5", "8 braket dari billet, U ≈ 20 %", "target: jejak CO₂ per unit"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Empat komponen rak Rakita 5 dan jejak karbonnya (Pertemuan 14)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const kolom = W / 4;
  const nama = ['Tiang tabung Al (4×)', 'Papan baja (5×)', 'Braket L billet (8×)', 'Baut baja (32×)'];
  // massa (kg) dan faktor emisi tiap kelompok komponen — angka ilustrasi skenario
  const massa = [4 * 0.83, 5 * 4.24, 8 * 0.29, 32 * 0.012];
  const fem = [12.0, 2.0, 12.0, 2.0];
  const co2 = massa.map((m, i) => m * fem[i]);
  const maks = Math.max.apply(null, co2);
  for (let k = 0; k < 4; k++) {
    const cx = kolom * (k + 0.5), dasar = H - 34;
    const tinggi = Math.max(4, (co2[k] / maks) * (H - 86));
    const warna = fem[k] > 6 ? 'rgba(245,158,11,.75)' : 'rgba(34,211,238,.75)';
    ctx.fillStyle = warna.replace('.75', '.22'); ctx.fillRect(cx - 26, dasar - tinggi, 52, tinggi);
    ctx.strokeStyle = warna; ctx.lineWidth = 1.4; ctx.strokeRect(cx - 26, dasar - tinggi, 52, tinggi);
    ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText(co2[k].toFixed(1) + ' kg', cx, dasar - tinggi - 6);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '9px JetBrains Mono';
    ctx.fillText(nama[k], cx, H - 18);
    ctx.fillStyle = 'rgba(148,163,184,.8)';
    ctx.fillText('m = ' + massa[k].toFixed(2) + ' kg · f = ' + fem[k].toFixed(1), cx, H - 6);
  }
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ jejak tiap kelompok = f × ρ × Shape.Volume; total per unit rak = ' + co2.reduce((a, b) => a + b, 0).toFixed(1) + ' kg CO2', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
