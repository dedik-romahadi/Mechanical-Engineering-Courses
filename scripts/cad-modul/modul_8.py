# Konten Modul 8 Pemodelan CAD — Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik
# (Sub-CPMK 3.1; Pertemuan 9 — Pertemuan 8 adalah UTS). FEM Workbench FreeCAD 1.0 dengan
# solver CalculiX: Analysis, material, mesh Gmsh, tumpuan & beban, analisis statik,
# termal, dan frekuensi, divalidasi rumus analitis. Angka contoh dihitung di sini agar
# teks, tabel, gambar, dan kode konsisten, dan sengaja tidak sama dengan varian tugas
# parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 8
JUDUL = "Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik"
JUDUL_PANJANG = "Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik"
JUDUL_EKSPOR = "Simulasi Kinerja Komponen (FEM)"

# ─────────────────────────── angka contoh ───────────────────────────
L_E, B_E, H_E, F_E = 180, 30, 15, 500          # kantilever contoh (mm, N)
E_MPA, NU, RHO = 210000, 0.30, 7850             # baja: MPa, -, kg/m³
RHO_G = 7.85e-3                                 # g/mm³
K_BAJA, ALPHA = 50, 12e-6                       # W/(m·K), 1/K
V_E = L_E * B_E * H_E
M_E = RHO_G * V_E
I_E = B_E * H_E ** 3 / 12
DELTA_E = F_E * L_E ** 3 / (3 * E_MPA * I_E)
SIGMA_E = 6 * F_E * L_E / (B_E * H_E ** 2)
F_T, A_T = 13500, B_E * H_E                     # batang tarik contoh
SIGMA_T = F_T / A_T
EPS_T = SIGMA_T / E_MPA
DL_T = EPS_T * L_E
DT_E = 80                                       # beda suhu contoh (K)
Q_E = K_BAJA * (A_T * 1e-6) * DT_E / (L_E / 1000)
BETA = [1.875104, 4.694091, 7.854757]
C_GEL = math.sqrt(E_MPA * 1e6 / (12 * RHO))     # √(E/(12ρ)) m/s
F_MODE = [bn * bn / (2 * math.pi) * (H_E / 1000) * C_GEL / (L_E / 1000) ** 2 for bn in BETA]
N_EL = {sz: int(L_E / sz * H_E / sz * B_E / sz * 6) for sz in (10, 5, 2.5)}   # taksiran elemen tet


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _garis(x1, y1, x2, y2, c, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"{d}/>'


def _dinding(x, y0, y1, sisi=-1):
    """Tumpuan jepit: garis tebal + arsir miring di sisi kiri (sisi=-1)."""
    b = _garis(x, y0, x, y1, TX, 2.2)
    for yy in range(int(y0), int(y1), 8):
        b += _garis(x, yy + 8, x + sisi * 8, yy, AX, 0.9)
    return b


def _warna_suhu(f):
    """Warna gradien merah (panas, f=1) → biru (dingin, f=0)."""
    r, g, bl = int(60 + 190 * f), int(80 + 40 * (1 - abs(2 * f - 1))), int(240 - 190 * f)
    return f"rgb({r},{g},{bl})"


def gambar1():
    b = ""
    w, h = 100, 54
    tahap = [("Geometri", "Part Box / Body", "#22d3ee"), ("Analysis", "material E, ν, ρ, k", "#f59e0b"), ("Mesh", "Gmsh tet10", "#a855f7"),
             ("Tumpuan &amp; Beban", "Fixed · Force · T", "#ec4899"), ("Solver CalculiX", ".inp → ccx → .frd", "#00e09e"), ("Hasil &amp; Validasi", "δ, σ, T, f₁ vs rumus", "#22d3ee")]
    xs = [10, 122, 234, 346, 458, 570]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 34, w, h, [a, s], c, 11)
    for i in range(5):
        b += arrow(xs[i] + w, 61, xs[i + 1], 61)
    # panah iterasi dari Hasil kembali ke Mesh
    b += f'<path d="M 620 88 V 112 H 284 V 92" fill="none" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="5 3"/>'
    b += arrow(284, 96, 284, 90, "#ef4444")
    b += t(452, 124, "belum konvergen → perhalus mesh, ulangi", 10, "#ef4444", "middle")
    b += t(40, 144, "Pohon Analysis di dokumen:", 11, TX, "start", "600")
    for i, s_ in enumerate(["Analysis", "  ├ CalculiXCcxTools (solver)", "  ├ MaterialSolid (baja)", "  ├ FEMMeshGmsh", "  ├ ConstraintFixed · ConstraintForce", "  └ CCX_Results ← hasil yang dibaca"]):
        b += t(40, 160 + i * 14, s_, 10, "#00e09e" if i == 5 else AX, "start")
    b += t(452, 150, "Persamaan yang diselesaikan:", 11, TX, "start", "600")
    b += t(452, 168, "[K]{u} = {F}  (statik)", 10.5, "#22d3ee", "start")
    b += t(452, 184, "[K_T]{T} = {Q}  (termal tunak)", 10.5, "#f59e0b", "start")
    b += t(452, 200, "([K] − ω²[M]){φ} = 0  (frekuensi)", 10.5, "#a855f7", "start")
    b += t(452, 216, "u = perpindahan simpul → ε → σ", 10, AX, "start")
    b += teks2(340, 246, "Simulasi bukan langkah tunggal: model dibagi menjadi elemen, dibebani, diselesaikan, lalu hasilnya diuji terhadap rumus sebelum dipercaya", 11, AX, maks=76)
    return svg(680, 272, b, "Gambar 1 — Alur analisis elemen hingga di FEM Workbench dan pohon Analysis")


def gambar2():
    b = ""
    # kiri: kontainer Analysis sebagai kotak besar berisi objek
    b += f'<rect x="14" y="30" width="270" height="190" rx="10" fill="rgba(245,158,11,.06)" stroke="#f59e0b" stroke-width="1.4"/>'
    b += t(149, 50, "Analysis (kontainer)", 12, "#f59e0b", "middle", "700")
    objek = [("MaterialSolid", "E · ν · ρ · k · α · c", "#22d3ee"), ("FEMMeshGmsh", "tet4 / tet10, ukuran", "#a855f7"), ("Constraint*", "Fixed · Force · Temperature", "#ec4899"), ("SolverCcxTools", "static · frequency · thermomech", "#00e09e")]
    for i, (a, s, c) in enumerate(objek):
        b += box(28, 62 + i * 38, 242, 32, [a, s], c, 10)
    # kanan: pipeline CalculiX
    xs = [330, 456, 582]
    for (a, s, c), x in zip([("berkas .inp", "simpul, elemen,", "#22d3ee"), ("ccx (CalculiX)", "menyusun [K],", "#00e09e"), ("berkas .frd", "u, σ, T, mode", "#a855f7")], xs):
        b += box(x, 40, 86, 50, [a, s], c, 10.5)
    b += t(373, 106, "material, beban", 9.5, AX, "middle") + t(499, 106, "menyelesaikan", 9.5, AX, "middle") + t(625, 106, "→ CCX_Results", 9.5, AX, "middle")
    b += arrow(416, 65, 456, 65) + arrow(542, 65, 582, 65)
    b += t(452, 140, "Analysis Type pada solver:", 11, TX, "start", "600")
    for i, (a, c) in enumerate([("static — [K]{u} = {F}, hasil u, ε, σ", "#22d3ee"), ("frequency — mode & f_n (perlu ρ)", "#a855f7"), ("thermomech — suhu T dan ekspansi", "#f59e0b"), ("buckling — beban kritis (Modul 9)", "#ec4899")]):
        b += t(452, 158 + i * 16, a, 10, c, "start")
    b += t(452, 226, "Solver lain: Elmer, Mystran, Z88", 9.5, AX, "start")
    b += teks2(340, 250, "FEM Workbench mengumpulkan semua masukan dalam Analysis; CalculiX yang dijalankan dari FreeCAD membaca .inp dan mengembalikan .frd", 11, AX, maks=76)
    return svg(680, 276, b, "Gambar 2 — Objek FEM Workbench di dalam Analysis dan jalur solver CalculiX")


def gambar3():
    b = ""
    # dua mesh tampak samping: kasar dan halus
    for k, (judul, n, c) in enumerate([("mesh kasar (h ≈ 10 mm)", 2, "#22d3ee"), ("mesh halus (h ≈ 3,3 mm)", 6, "#00e09e")]):
        ox, oy = 20, 46 + k * 96
        Lw, Hh = 300, 50
        b += t(ox + Lw / 2, oy - 8, judul, 10.5, c, "middle", "600")
        nx, ny = n * 6, n
        dx, dy = Lw / nx, Hh / ny
        for i in range(nx):
            for j in range(ny):
                x0, y0 = ox + i * dx, oy + j * dy
                b += f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{dx:.1f}" height="{dy:.1f}" fill="rgba(34,211,238,.06)" stroke="{c}" stroke-width=".7"/>'
                b += _garis(x0, y0, x0 + dx, y0 + dy, c, 0.5)
        b += _dinding(ox, oy - 4, oy + Hh + 4)
        b += arrow(ox + Lw, oy - 18, ox + Lw, oy - 2, "#ef4444")
        b += t(ox + Lw + 6, oy - 8, "F", 10, "#ef4444", "start", "700")
    # elemen tet4 vs tet10 di kanan
    for k, (nm, orde, c) in enumerate([("tet4 (orde 1)", 1, "#22d3ee"), ("tet10 (orde 2)", 2, "#f59e0b")]):
        cx, cy = 400 + k * 130, 84
        p = [(cx - 34, cy + 26), (cx + 34, cy + 26), (cx + 4, cy - 30), (cx - 6, cy + 4)]
        b += _poli([p[0], p[1], p[2]], "rgba(34,211,238,.08)", c, 1.3)
        b += _garis(p[0][0], p[0][1], p[3][0], p[3][1], c, 1.1, "3 2") + _garis(p[1][0], p[1][1], p[3][0], p[3][1], c, 1.1, "3 2") + _garis(p[2][0], p[2][1], p[3][0], p[3][1], c, 1.1, "3 2")
        for q in p:
            b += f'<circle cx="{q[0]:.1f}" cy="{q[1]:.1f}" r="3" fill="{c}"/>'
        if orde == 2:
            for i in range(4):
                for j in range(i + 1, 4):
                    b += f'<circle cx="{(p[i][0] + p[j][0]) / 2:.1f}" cy="{(p[i][1] + p[j][1]) / 2:.1f}" r="2.4" fill="#0a101f" stroke="{c}" stroke-width="1.2"/>'
        b += t(cx, cy + 44, nm, 10.5, c, "middle", "600")
        b += t(cx, cy + 58, "4 simpul, linear" if orde == 1 else "10 simpul, kuadratik", 9.5, AX, "middle")
    b += t(452, 166, "Konvergensi (kantilever lentur):", 11, TX, "start", "600")
    b += t(452, 184, "tet4 terlalu kaku → δ terlalu kecil", 10, "#22d3ee", "start")
    b += t(452, 200, "tet10 halus → δ mendekati rumus", 10, "#f59e0b", "start")
    b += t(452, 216, f"contoh: {N_EL[10]:,} / {N_EL[5]:,} / {N_EL[2.5]:,} elemen".replace(",", "."), 10, AX, "start")
    b += t(452, 232, "(ukuran 10 / 5 / 2,5 mm, taksiran)", 9.5, AX, "start")
    b += teks2(340, 262, "Mesh yang makin halus dan orde 2 mengubah jawaban FEM mendekati nilai analitis; berhenti memperhalus saat perubahan hasil &lt; 2%", 11, AX, maks=76)
    return svg(680, 288, b, "Gambar 3 — Mesh kasar dan halus pada kantilever serta elemen tet4 dan tet10")


def gambar4():
    b = ""
    # kantilever: Fixed kiri, Force ujung
    ox, oy, Lw, Hh = 40, 60, 240, 28
    b += f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="1.6"/>'
    b += _dinding(ox, oy - 8, oy + Hh + 8)
    b += arrow(ox + Lw - 6, oy - 30, ox + Lw - 6, oy - 2, "#ef4444", 1.8)
    b += t(ox + Lw + 6, oy - 16, "Force F (−Z)", 10, "#ef4444", "start", "600")
    b += t(ox - 8, oy + Hh + 22, "Fixed: u = 0", 10, "#ec4899", "start", "600")
    b += t(ox + Lw / 2, oy + Hh + 22, "kantilever L × b × h", 10, AX, "middle")
    # batang tarik
    oy2 = 138
    b += f'<rect x="{ox}" y="{oy2}" width="{Lw}" height="{Hh}" fill="rgba(0,224,158,.12)" stroke="#00e09e" stroke-width="1.6"/>'
    b += _dinding(ox, oy2 - 8, oy2 + Hh + 8)
    b += arrow(ox + Lw + 2, oy2 + Hh / 2, ox + Lw + 40, oy2 + Hh / 2, "#ef4444", 1.8)
    b += t(ox + Lw + 44, oy2 + Hh / 2 + 4, "F (+X)", 10, "#ef4444", "start", "600")
    b += t(ox + Lw / 2, oy2 + Hh + 22, "batang tarik: σ = F/A seragam", 10, AX, "middle")
    # tekanan pada muka atas (pressure)
    oy3 = 216
    b += f'<rect x="{ox}" y="{oy3}" width="{Lw}" height="{Hh}" fill="rgba(168,85,247,.12)" stroke="#a855f7" stroke-width="1.6"/>'
    b += _dinding(ox, oy3 - 8, oy3 + Hh + 8)
    for i in range(7):
        xx = ox + 24 + i * 34
        b += arrow(xx, oy3 - 22, xx, oy3 - 2, "#a855f7", 1.1)
    b += t(ox + Lw + 8, oy3 + 4, "Pressure p (MPa)", 10, "#a855f7", "start", "600")
    b += t(ox + Lw / 2, oy3 + Hh + 22, "beban terbagi: gaya = p × luas muka", 10, AX, "middle")
    b += t(452, 50, "Constraint = tumpuan atau beban:", 11, TX, "start", "600")
    for i, (a, c) in enumerate([("Fixed — semua u = 0 pada muka", "#ec4899"), ("Displacement — u tertentu / arah", "#ec4899"), ("Force — gaya total pada muka (N)", "#ef4444"), ("Pressure — tekanan pada muka (MPa)", "#a855f7"), ("Self weight — gravitasi ρ·g", "#f59e0b"), ("Temperature — suhu muka (K)", "#f59e0b"), ("Heat flux — fluks kalor (W/m²)", "#f59e0b")]):
        b += t(452, 70 + i * 16, a, 10, c, "start")
    b += t(452, 190, "Force dibagi rata ke simpul muka;", 10, AX, "start")
    b += t(452, 206, "arah normal muka, Reversed membalik", 10, AX, "start")
    b += t(452, 230, "Satuan CalculiX: mm · N · MPa · K", 10, "#00e09e", "start")
    b += teks2(340, 282, "Tumpuan yang salah adalah kesalahan FEM paling umum: Fixed pada satu muka ujung cukup untuk kantilever; batang tarik memerlukan gaya searah sumbu", 11, AX, maks=76)
    return svg(680, 308, b, "Gambar 4 — Jenis tumpuan dan beban pada kantilever, batang tarik, dan muka bertekanan")


def gambar5():
    b = ""
    ox, oy, Lw, Hh = 40, 72, 280, 22
    sk = Lw / L_E
    # balok tak terdeformasi (putus) dan terdeformasi (kurva tebal)
    b += f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="none" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="5 4"/>'
    b += _dinding(ox, oy - 8, oy + Hh + 8)
    faktor = 40 / DELTA_E   # skala tampilan agar δ ≈ 40 px
    pts_atas, pts_bawah = [], []
    for i in range(41):
        x = L_E * i / 40
        y = F_E * x * x * (3 * L_E - x) / (6 * E_MPA * I_E) * faktor
        pts_atas.append((ox + x * sk, oy + y))
        pts_bawah.append((ox + x * sk, oy + Hh + y))
    b += _poli(pts_atas + pts_bawah[::-1], "rgba(34,211,238,.16)", "#22d3ee", 1.6)
    b += arrow(ox + Lw, oy - 34, ox + Lw, oy - 4, "#ef4444", 1.8)
    b += t(ox + Lw + 6, oy - 20, "F", 11, "#ef4444", "start", "700")
    b += _garis(ox + Lw + 14, oy + Hh, ox + Lw + 14, oy + Hh + 40, "#00e09e", 1)
    b += t(ox + Lw + 20, oy + Hh + 24, "δ", 12, "#00e09e", "start", "700")
    b += t(ox + 6, oy - 14, "σ maks di tumpuan", 10, "#f59e0b", "start", "600")
    b += f'<circle cx="{ox + 3}" cy="{oy - 2}" r="4" fill="rgba(245,158,11,.5)" stroke="#f59e0b"/>'
    # diagram momen
    my = 196
    b += _garis(ox, my, ox + Lw, my, AX, 1)
    b += _poli([(ox, my), (ox, my - 46), (ox + Lw, my)], "rgba(245,158,11,.18)", "#f59e0b", 1.3)
    b += t(ox + 8, my - 50, "M(x) = F·(L − x)", 10, "#f59e0b", "start", "600")
    b += t(ox + Lw + 6, my + 4, "x = L", 9.5, AX, "start")
    b += t(ox - 4, my + 14, "x = 0", 9.5, AX, "start")
    b += t(452, 50, "Kantilever contoh:", 11, TX, "start", "600")
    b += t(452, 68, f"L = {L_E}, b = {B_E}, h = {H_E} mm, F = {F_E} N", 10, AX, "start")
    b += t(452, 84, f"I = b·h³/12 = {ind(I_E, 1)} mm⁴", 10, AX, "start")
    b += t(452, 110, "δ = F·L³/(3·E·I)", 11, "#22d3ee", "start")
    b += t(452, 128, f"= {ind(DELTA_E, 4)} mm", 10.5, "#00e09e", "start")
    b += t(452, 154, "σ = M·c/I = 6·F·L/(b·h²)", 11, "#f59e0b", "start")
    b += t(452, 172, f"= {ind(SIGMA_E, 1)} MPa (di tumpuan)", 10.5, "#00e09e", "start")
    b += t(452, 198, "FEM tet10 halus: selisih &lt; 2–5%", 10, AX, "start")
    b += t(452, 214, "kesalahan = |FEM − rumus|/rumus", 10, AX, "start")
    b += teks2(340, 248, "Defleksi ujung dan tegangan di tumpuan punya rumus tertutup; keduanya menjadi tolok ukur apakah Analysis, mesh, dan beban sudah benar", 11, AX, maks=76)
    return svg(680, 274, b, "Gambar 5 — Kantilever terdefleksi, diagram momen, dan rumus validasi δ dan σ")


def gambar6():
    b = ""
    # kiri atas: batang termal bergradien
    ox, oy, Lw, Hh = 40, 52, 260, 30
    n = 26
    for i in range(n):
        f = 1 - i / (n - 1)
        b += f'<rect x="{ox + i * Lw / n:.1f}" y="{oy}" width="{Lw / n + 0.6:.1f}" height="{Hh}" fill="{_warna_suhu(f)}" stroke="none"/>'
    b += f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="none" stroke="{TX}" stroke-width="1.2"/>'
    b += t(ox - 6, oy + Hh / 2 + 4, "T₁", 11, "#ef4444", "end", "700")
    b += t(ox + Lw + 6, oy + Hh / 2 + 4, "T₂", 11, "#3b82f6", "start", "700")
    b += arrow(ox + 60, oy + Hh + 16, ox + Lw - 60, oy + Hh + 16, "#f59e0b", 1.6)
    b += t(ox + Lw / 2, oy + Hh + 30, "q = k·A·ΔT/L (kalor mengalir T₁ → T₂)", 10, "#f59e0b", "middle", "600")
    # grafik T(x) linear
    gy = 140
    b += _garis(ox, gy, ox + Lw, gy, AX, 1) + _garis(ox, gy, ox, gy - 40, AX, 1)
    b += _garis(ox, gy - 38, ox + Lw, gy - 4, "#ef4444", 1.6)
    b += t(ox - 4, gy - 40, "T", 9.5, AX, "end") + t(ox + Lw + 4, gy + 4, "x", 9.5, AX, "start")
    b += t(ox + Lw / 2, gy + 14, "T(x) linear pada keadaan tunak", 9.5, AX, "middle")
    # kiri bawah: mode getar pertama kantilever
    my = 208
    sk = Lw / L_E
    b += _dinding(ox, my - 26, my + 26)
    b += _garis(ox, my, ox + Lw, my, "rgba(148,163,184,.4)", 1, "5 4")
    sig = (math.cosh(BETA[0]) + math.cos(BETA[0])) / (math.sinh(BETA[0]) + math.sin(BETA[0]))
    for tanda, dash in ((1, ""), (-1, "4 3")):
        pts = []
        for i in range(41):
            xi = i / 40
            bx = BETA[0] * xi
            phi = math.cosh(bx) - math.cos(bx) - sig * (math.sinh(bx) - math.sin(bx))
            pts.append((ox + xi * Lw, my - tanda * phi / 2 * 22))
        dd = f' stroke-dasharray="{dash}"' if dash else ""
        b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="#a855f7" stroke-width="1.8"{dd}/>'
    b += t(ox + Lw / 2, my + 38, "mode 1: lentur arah tebal h, β₁ = 1,8751", 10, "#a855f7", "middle", "600")
    b += t(452, 50, "Termal contoh:", 11, TX, "start", "600")
    b += t(452, 68, f"batang {B_E} × {H_E} × {L_E} mm, k = {K_BAJA}", 10, AX, "start")
    b += t(452, 84, f"ΔT = {DT_E} K → q = {ind(Q_E, 2)} W", 10.5, "#00e09e", "start")
    b += t(452, 100, "A = b·h (m²), L (m) — satuan SI", 9.5, AX, "start")
    b += t(452, 130, "Frekuensi contoh (kantilever):", 11, TX, "start", "600")
    b += t(452, 148, "f_n = (β_n²/2π)·√(EI/ρA)/L²", 10.5, "#a855f7", "start")
    for i, (fn, bn) in enumerate(zip(F_MODE, BETA)):
        b += t(452, 166 + i * 16, f"β{['₁', '₂', '₃'][i]} = {ind(bn, 4)} → f{['₁', '₂', '₃'][i]} = {ind(fn, 1)} Hz", 10, "#00e09e" if i == 0 else AX, "start")
    b += t(452, 222, "FEM: CCX_Mode1_Results → EigenmodeFrequency", 9.5, AX, "start")
    b += t(452, 238, "resonansi bila f putaran mesin ≈ f₁", 9.5, "#ef4444", "start")
    b += teks2(340, 276, "Termal tunak dan frekuensi memakai Analysis yang sama dengan statik; yang berubah hanya Analysis Type, constraint, dan properti material", 11, AX, maks=76)
    return svg(680, 302, b, "Gambar 6 — Hantaran kalor batang dan mode getar pertama kantilever")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-fem">FEM &amp; Alur</a>
  <a href="#m-workbench">Workbench &amp; CalculiX</a>
  <a href="#m-material">Material</a>
  <a href="#m-mesh">Mesh</a>
  <a href="#m-beban">Tumpuan &amp; Beban</a>
  <a href="#m-statik">Statik &amp; Validasi</a>
  <a href="#m-termal">Termal &amp; Frekuensi</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="30" x2="12" y2="90" stroke="rgba(226,232,240,.6)" stroke-width="2"/>
      <path d="M 12 45 L 88 45 L 88 60 L 12 60 Z" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.3"/>
      <path d="M 12 60 Q 60 62 88 84" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.4" stroke-dasharray="4 2"/>
      <line x1="84" y1="20" x2="84" y2="42" stroke="rgba(239,68,68,.7)" stroke-width="1.6"/>
      <polygon points="84,45 80,37 88,37" fill="rgba(239,68,68,.7)"/>
      <g stroke="rgba(0,229,255,.35)" stroke-width=".8" fill="none">
        <path d="M 12 120 H 88 V 150 H 12 Z M 31 120 V 150 M 50 120 V 150 M 69 120 V 150 M 12 135 H 88 M 12 120 L 31 150 M 31 120 L 50 150 M 50 120 L 69 150 M 69 120 L 88 150"/>
      </g>
      <text x="50" y="180" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">[K]{u} = {F}</text>
      <text x="50" y="196" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">δ = FL³/3EI</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="30" width="72" height="18" fill="rgba(239,68,68,.35)" stroke="rgba(226,232,240,.4)" stroke-width="1"/>
      <rect x="38" y="30" width="24" height="18" fill="rgba(255,179,0,.35)"/>
      <rect x="62" y="30" width="24" height="18" fill="rgba(59,130,246,.35)"/>
      <line x1="14" y1="70" x2="86" y2="70" stroke="rgba(148,163,184,.4)" stroke-width="1"/>
      <line x1="14" y1="58" x2="86" y2="68" stroke="rgba(255,179,0,.7)" stroke-width="1.4"/>
      <line x1="12" y1="110" x2="12" y2="170" stroke="rgba(226,232,240,.6)" stroke-width="2"/>
      <path d="M 12 140 Q 50 140 88 118" fill="none" stroke="rgba(124,77,255,.7)" stroke-width="1.6"/>
      <path d="M 12 140 Q 50 140 88 162" fill="none" stroke="rgba(124,77,255,.5)" stroke-width="1.4" stroke-dasharray="4 2"/>
      <text x="50" y="196" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">f₁ · q = kAΔT/L</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">[K]{{u}} = {{F}}</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">δ = FL³/3EI</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">σ = F/A</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">q = kAΔT/L</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">CalculiX .inp → .frd</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Gmsh tet10</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">f₁ = (β²/2π)√(EI/ρA)/L²</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">von Mises</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 9 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Simulasi Kinerja</span><br>
      <em>Komponen:</em><br>
      <span class="hl-amber">Tegangan, Termal, Getaran</span>
    </h1>
    <p class="hero-sub">Setelah UTS, model 3D mulai diuji, bukan hanya digambar. FEM Workbench FreeCAD 1.0 dengan solver CalculiX membagi komponen menjadi elemen hingga, memberinya material, tumpuan, dan beban, lalu menghitung perpindahan, tegangan, suhu, dan frekuensi alami. Setiap hasil dibandingkan dengan rumus balok, batang tarik, hukum Fourier, dan frekuensi kantilever agar simulasi dapat dipercaya; tugasnya lima berkas FreeCAD berisi Analysis lengkap dengan bacaan analitisnya.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Alur FEM, material, mesh, beban</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>CalculiX, diskusi, dan tugas</small></div>
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

    # 01 — FEM dan alur analisis
    isi = figure(1, "Alur analisis elemen hingga di FEM Workbench dan pohon Analysis", "Geometri diberi material, dibagi menjadi mesh, diberi tumpuan dan beban, diselesaikan CalculiX, lalu hasilnya divalidasi; bila belum konvergen, mesh diperhalus dan analisis diulang.", gambar1())
    isi += cards([
        ("🧩", "Diskretisasi", "Benda kontinu dibagi menjadi elemen kecil (tetrahedron) yang terhubung di simpul. Di dalam elemen, perpindahan dianggap mengikuti fungsi sederhana (linear atau kuadratik), sehingga masalah diferensial berubah menjadi sistem persamaan aljabar.", "kontinu → elemen"),
        ("⚖️", "Kesetimbangan", "Kekakuan tiap elemen dirakit menjadi matriks global [K]; gaya luar dan tumpuan membentuk {F} dan syarat batas; solver menyelesaikan [K]{u} = {F} untuk perpindahan simpul u, lalu menurunkan regangan ε dan tegangan σ.", "[K]{u} = {F}"),
        ("🎯", "Tiga jenis analisis", "Statik (u, σ akibat beban), termal (T dan q akibat beda suhu), dan frekuensi (mode getar dan f_n tanpa beban). FreeCAD 1.0 juga menyediakan buckling (Modul 9). Kinematika rakitan bukan urusan FEM, melainkan Assembly Workbench (Modul 11).", "static · thermomech · frequency"),
        ("🔍", "Validasi", "Hasil FEM tidak otomatis benar: mesh kasar, tumpuan keliru, atau satuan tertukar memberi angka yang meyakinkan tetapi salah. Selalu bandingkan dengan rumus tertutup (δ, σ, q, f₁) pada kasus sederhana sebelum menyimulasikan bentuk rumit.", "FEM vs rumus"),
    ])
    isi += tabel(["Jenis analisis", "Masukan khas", "Keluaran", "Rumus pembanding di modul ini"],
                 [["<strong>Statik linear</strong>", "E, ν; Fixed; Force/Pressure", "Perpindahan u, regangan, von Mises, tegangan utama", "δ = F·L³/(3·E·I); σ = F/A; σ = 6·F·L/(b·h²)"],
                  ["<strong>Termal tunak</strong>", "k (dan c, α); Temperature/Heat flux", "Suhu T tiap simpul, fluks kalor", "q = k·A·ΔT/L (Fourier)"],
                  ["<strong>Frekuensi</strong>", "E, ν, ρ; Fixed (tanpa beban)", "Frekuensi alami f_n dan bentuk mode", "f₁ = (β₁²/2π)·√(E·I/(ρ·A))/L²"],
                  ["<strong>Buckling</strong>", "E, ν; beban tekan", "Faktor beban kritis", "P_cr = π²·E·I/L² (Modul 9)"]])
    isi += formula(1, "Persamaan Kesetimbangan Elemen Hingga", r"[K]\{u\} = \{F\}, \qquad k_{batang} = \frac{E\,A}{L}",
                   r"\([K]\) = matriks kekakuan global (rakitan kekakuan elemen) &nbsp;·&nbsp; \(\{u\}\) = perpindahan simpul &nbsp;·&nbsp; \(\{F\}\) = gaya simpul. Untuk satu elemen batang aksial, kekakuannya \(E A / L\): contoh batang " + f"{B_E} × {H_E} × {L_E}" + r" mm baja: \(k = 210000 \times 450 / 180 = " + ind(E_MPA * A_T / L_E, 0) + r"\) N/mm.",
                   "Setiap elemen berperilaku seperti pegas multi-arah; menyambungkan ribuan pegas menghasilkan sistem persamaan besar yang diselesaikan solver. Perpindahan adalah hasil primer; tegangan diturunkan dari turunan perpindahan, sehingga tegangan lebih peka terhadap mesh daripada perpindahan. Itulah sebabnya validasi tegangan memerlukan mesh lebih halus daripada validasi defleksi.",
                   [("[K]", "Matriks kekakuan global (N/mm)"), (r"\{u\}", "Vektor perpindahan simpul (mm)"), (r"\{F\}", "Vektor gaya simpul (N)"), ("E, A, L", "Modulus, luas penampang, panjang elemen batang")])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 mengenalkan objek FEM Workbench dan solver CalculiX, Bagian 03–05 menyiapkan tiga masukan (material, mesh, tumpuan/beban), Bagian 06 menjalankan analisis statik dan membandingkannya dengan rumus balok (Tugas 1–3), Bagian 07 memperluas ke termal (Tugas 4) dan frekuensi (Tugas 5), lalu Bagian 08–09 menutup dengan Python ObjectsFem dan praktik kantilever.")
    m += bagian(1, "m-fem", "Metode Elemen Hingga:<br>Dari Model 3D ke Prediksi Kinerja", "Model CAD yang sudah benar geometrinya belum tentu kuat, kaku, dingin, atau bebas resonansi. Bagian ini memperkenalkan gagasan FEM, tiga jenis analisis yang dipakai di kelas, dan alur kerja lengkap dari geometri sampai validasi.", isi, "FEM DAN ALUR ANALISIS")

    # 02 — FEM Workbench dan CalculiX
    isi = figure(2, "Objek FEM Workbench di dalam Analysis dan jalur solver CalculiX", "Material, mesh, constraint, dan solver hidup di dalam kontainer Analysis; saat dijalankan, FreeCAD menulis .inp, memanggil ccx, dan membaca .frd menjadi CCX_Results.", gambar2())
    isi += tabel(["Objek", "Perintah toolbar FEM", "Isi / parameter penting", "Nama di pohon"],
                 [["Analysis", "Analysis container", "Wadah satu kasus; boleh lebih dari satu per dokumen", "<code>Analysis</code>"],
                  ["Solver", "Solver CalculiX Standard", "Analysis Type (static, frequency, thermomech, buckling, check); Eigenmodes Count; Thermo Mech Steady State", "<code>CalculiXCcxTools</code>"],
                  ["Material", "Material for solid", "Kartu material (Steel-Generic, AlMg3F24, ABS-Generic…) atau isian manual E, ν, ρ, k, α, c", "<code>MaterialSolid</code>"],
                  ["Mesh", "FEM mesh from shape by Gmsh / Netgen", "Shape, Element Order, Characteristic Length Max/Min, Mesh Regions", "<code>FEMMeshGmsh</code>"],
                  ["Constraint", "Constraint fixed / force / pressure / temperature / …", "References (muka, rusuk, titik) + nilai + arah", "<code>ConstraintFixed</code>, <code>ConstraintForce</code>"],
                  ["Result", "dibuat solver", "DisplacementLengths, vonMises, PrincipalMax, Temperature; Show result & Post pipeline", "<code>CCX_Results</code>, <code>CCX_Mode1_Results</code>"]])
    isi += cards([
        ("🧮", "CalculiX (ccx)", "Solver elemen hingga sumber terbuka karya G. Dhondt dengan format masukan bergaya Abaqus. FreeCAD menuliskan berkas .inp lengkap (simpul, elemen, material, *BOUNDARY, *CLOAD) ke direktori kerja, menjalankan ccx, lalu membaca .frd.", ".inp → ccx → .frd"),
        ("▶️", "Menjalankan solver", "Klik ganda CalculiXCcxTools → panel Tasks: Write .inp file → Run CalculiX. Log di panel menunjukkan “CalculiX done without error”. Tombol Run solver di toolbar melakukan keduanya sekaligus.", "Write · Run"),
        ("📊", "Membaca hasil", "Klik ganda CCX_Results → Show result: pilih Displacement Magnitude, von Mises, atau Temperature; geser Displacement factor untuk memperbesar deformasi tampilan. Tab Data memuat daftar angka tiap simpul.", "Show result"),
        ("🧪", "Post pipeline (VTK)", "Post pipeline from result menampilkan kontur berwarna dengan filter (Warp, Clip, Cut, Scalar clip) untuk melihat bagian dalam solid. Modul 9 membahas evaluasi hasil lebih dalam.", "Modul 9"),
    ])
    isi += kotak("info-box", "<strong>🧭 Satuan di balik layar:</strong> FreeCAD menulis .inp dalam mm, N, dan MPa (E = 210000), massa jenis dalam t/mm³ (7,85×10⁻⁹), suhu dalam K, dan konduktivitas dalam mW/(mm·K). Anda cukup memasukkan besaran berunit (mis. <code>\"210000 MPa\"</code>, <code>\"7850 kg/m^3\"</code>); konversi dilakukan otomatis. Hasil: perpindahan mm, tegangan MPa, suhu K, frekuensi Hz.")
    m += bagian(2, "m-workbench", "FEM Workbench dan Solver CalculiX:<br>Objek, Perintah, dan Jalur Berkas", "Semua yang dibutuhkan satu simulasi dikumpulkan dalam kontainer Analysis. Bagian ini memetakan objek-objeknya, perintah toolbar, cara menjalankan CalculiX, dan cara membaca hasilnya.", isi, "FEM WORKBENCH DAN CALCULIX")

    # 03 — Material dan properti
    isi = tabel(["Material (kartu FreeCAD)", "E (MPa)", "ν", "ρ (kg/m³)", "k (W/(m·K))", "α (10⁻⁶/K)", "σ_y (MPa)"],
                [["<strong>Steel-Generic</strong> (baja)", "210000", "0,30", "7850", "50", "12", "≈ 250 (S235)"],
                 ["<strong>AlMg3F24</strong> (aluminium)", "70000", "0,33", "2700", "237", "23", "≈ 180"],
                 ["<strong>Kuningan</strong> (CuZn37)", "100000", "0,34", "8400", "120", "20", "≈ 200"],
                 ["<strong>ABS-Generic</strong> (plastik)", "2300", "0,37", "1050", "0,2", "90", "≈ 40"],
                 ["<strong>Concrete-Generic</strong>", "32000", "0,17", "2400", "1,4", "10", "—"]])
    isi += cards([
        ("📏", "E dan ν (statik)", "Modulus elastisitas E menentukan kekakuan (δ ∝ 1/E); rasio Poisson ν menentukan penyusutan melintang. Untuk tegangan pada kasus statik tertentu (batang tarik, balok), σ tidak bergantung pada E, hanya δ yang bergantung.", "δ ∝ 1/E"),
        ("⚖️", "ρ (massa, getaran)", "Massa jenis dibutuhkan untuk Self weight dan analisis frekuensi (matriks massa [M]). Massa komponen sendiri dihitung dari ρ × Volume; kartu Steel memberi 7850 kg/m³ = 7,85×10⁻³ g/mm³.", "m = ρ·V"),
        ("🔥", "k, α, c (termal)", "Konduktivitas k mengatur laju kalor q; koefisien muai α mengubah ΔT menjadi regangan termal α·ΔT (tegangan termal bila ditahan); kalor jenis c hanya berperan pada analisis transien.", "q ∝ k"),
        ("🗂️", "Kartu vs manual", "Material for solid membuka pustaka kartu (.FCMat) FreeCAD 1.0; pilih kartu lalu periksa tab Material Properties. Nilai boleh disunting manual dan tersimpan di dokumen, sehingga berkas .FCStd membawa propertinya.", ".FCMat"),
    ])
    isi += formula(2, "Massa Komponen dari Volume Model", r"m = \rho\,V, \qquad m[\text{g}] = 7{,}85\times10^{-3}\,V[\text{mm}^{3}] \ \ (\text{baja})",
                   r"\(\rho\) = massa jenis &nbsp;·&nbsp; \(V\) = Shape.Volume. Contoh kantilever " + f"{L_E} × {B_E} × {H_E}" + r" mm: \(V = " + ind(V_E, 0) + r"\) mm³, \(m = " + ind(M_E, 2) + r"\) g.",
                   "Massa adalah bacaan pertama yang membuktikan material dan geometri sudah benar sebelum solver dijalankan; FreeCAD 1.0 menampilkannya di tab Data bila Material Body diisi. Angka ini juga masuk ke analisis frekuensi lewat matriks massa dan ke Self weight lewat ρ·g.",
                   [("m", "Massa (g)"), (r"\rho", "Massa jenis (g/mm³ atau kg/m³)"), ("V", "Volume solid (mm³)")])
    isi += kotak("warning-box", "⚠️ <strong>Properti kosong = solver gagal atau hasil nol:</strong> analisis frekuensi tanpa ρ menghasilkan pesan galat CalculiX atau frekuensi tak berhingga; analisis thermomech tanpa k tidak dapat ditulis ke .inp. Periksa tab Material Properties sebelum Run: E, ν, ρ selalu terisi; k, α, c wajib untuk termal.")
    m += bagian(3, "m-material", "Material dan Properti:<br>E, ν, ρ, k, α yang Dibaca Solver", "Solver hanya tahu material dari angka yang Anda berikan. Bagian ini membahas properti yang dibutuhkan tiap jenis analisis, kartu material FreeCAD 1.0, dan bacaan massa sebagai pemeriksaan pertama.", isi, "MATERIAL DAN PROPERTI")

    # 04 — Mesh
    isi = figure(3, "Mesh kasar dan halus pada kantilever serta elemen tet4 dan tet10", f"Kantilever contoh dibagi menjadi elemen tetrahedron; ukuran 10 / 5 / 2,5 mm memberi kira-kira {ind(N_EL[10], 0)} / {ind(N_EL[5], 0)} / {ind(N_EL[2.5], 0)} elemen. Tet10 menangkap lentur jauh lebih baik daripada tet4.", gambar3())
    isi += tabel(["Parameter mesh", "Gmsh", "Netgen", "Catatan"],
                 [["Shape", "objek Part/Body", "objek Part/Body", "Satu mesh per solid; rakitan perlu Compound"],
                  ["Element Order", "1st / <strong>2nd</strong>", "Second order (centang)", "Selalu 2nd untuk lentur dan tegangan"],
                  ["Ukuran elemen", "Characteristic Length Max / Min", "Max Size, Fineness", "Mulai ≈ h/2 (tebal terkecil ÷ 2), lalu perhalus"],
                  ["Mesh Regions", "Mesh region pada muka/rusuk", "—", "Halus di sudut, lubang, dan daerah tegangan tinggi"],
                  ["Elemen", "Tetrahedron (tet4/tet10); hexa opsional", "Tetrahedron", "Jumlah elemen tampil pada properti mesh"],
                  ["Menjalankan", "klik ganda → Apply", "klik ganda → OK", "Gmsh disertakan dalam paket FreeCAD 1.0"]])
    isi += anim_panel(1, "cyan", "Mesh makin halus (h-refinement) pada kantilever", "cvMesh",
                      [("sl_ms_n", "v_ms_n", "Jumlah elemen sepanjang tebal h", 1, 8, 1, 4, "4"),
                       ("sl_ms_orde", "v_ms_orde", "Orde elemen (1 tet4 · 2 tet10)", 1, 2, 1, 2, "2 (tet10)")],
                      "btnMesh", "toggleMesh", "infoMesh",
                      "<strong>Cara membaca:</strong> mesh kantilever bertambah halus dari 1 sampai n elemen sepanjang tebal (PAUSE menahan mesh terhalus). Kolom kanan menaksir jumlah elemen tet dan rasio δ_FEM/δ_teori: tet4 mendekati 1 perlahan (terlalu kaku), tet10 hampir langsung konvergen. Kurva ini ilustratif; angka sesungguhnya diperoleh dari praktik Bagian 09.")
    isi += cards([
        ("📐", "Aturan ukuran awal", "Ukuran elemen maksimum ≈ setengah tebal terkecil agar ada ≥ 2 elemen tet10 melintasi tebal (≥ 4 untuk tet4). Kantilever tebal 15 mm: mulai 7,5 mm, uji 5 dan 2,5 mm.", "≈ h/2"),
        ("📉", "Uji konvergensi", "Jalankan tiga mesh makin halus; bila δ atau σ maks berubah < 2% antar mesh, hasil dianggap konvergen. Tegangan konvergen lebih lambat daripada perpindahan.", "Δ < 2%"),
        ("🧊", "Orde 2 wajib untuk lentur", "Elemen linear (tet4) mengalami shear locking: kantilever terlalu kaku, δ terlalu kecil, σ terlalu rendah. Semua tugas modul ini memakai Element Order 2nd.", "tet10"),
        ("⏱️", "Biaya hitung", "Jumlah elemen ∝ 1/h³; memperhalus dua kali melipatgandakan elemen delapan kali. Gunakan Mesh Regions untuk menghaluskan daerah kritis saja.", "∝ 1/h³"),
    ])
    m += bagian(4, "m-mesh", "Mesh:<br>Membagi Solid Menjadi Elemen Hingga", "Kualitas jawaban FEM ditentukan mesh. Bagian ini membahas Gmsh dan Netgen, orde elemen, ukuran elemen awal, penghalusan lokal, dan uji konvergensi yang sederhana.", isi, "MESH")

    # 05 — Tumpuan dan beban
    isi = figure(4, "Jenis tumpuan dan beban pada kantilever, batang tarik, dan muka bertekanan", "Fixed mengunci muka tumpuan; Force memberi gaya total pada muka (dibagi rata ke simpul); Pressure memberi tekanan per luas; Temperature dan Heat flux dipakai analisis termal.", gambar4())
    isi += tabel(["Constraint", "Acuan", "Nilai dan satuan", "Dipakai pada tugas"],
                 [["<strong>Fixed</strong>", "Muka / rusuk / titik", "— (semua u = 0)", "T1–T5: muka ujung x = 0"],
                  ["<strong>Displacement</strong>", "Muka / rusuk / titik", "u_x, u_y, u_z (mm) atau kunci arah", "Simetri, tumpuan rol"],
                  ["<strong>Force</strong>", "Muka / rusuk / titik", "Gaya total (N) + arah normal/rusuk; Reversed", "T1, T2 (−Z), T3 (+X)"],
                  ["<strong>Pressure</strong>", "Muka", "Tekanan (MPa); Reversed = tarik", "Bejana, dudukan"],
                  ["<strong>Self weight</strong>", "seluruh model", "Arah gravitasi", "Rangka besar"],
                  ["<strong>Temperature</strong>", "Muka / rusuk / titik", "Suhu (K)", "T4: dua muka ujung"],
                  ["<strong>Initial temperature</strong>", "seluruh model", "Suhu awal (K)", "T4 (thermomech)"],
                  ["<strong>Heat flux</strong>", "Muka", "W/m² atau konveksi (h, T∞)", "Sirip pendingin"]])
    isi += cards([
        ("🧱", "Fixed", "Perpindahan nol pada seluruh simpul muka acuan: kantilever dijepit di muka ujung. Fixed pada muka yang salah (mis. muka bawah) mengubah kasus menjadi pelat terjepit dan membuat δ menyimpang jauh dari rumus.", "u = 0"),
        ("➡️", "Force", "Nilai adalah gaya TOTAL pada acuan, dibagi rata ke simpul-simpulnya. Arah mengikuti normal muka; centang Reversed bila panah menunjuk ke arah yang salah. Force pada rusuk atau titik menimbulkan tegangan lokal palsu (singularitas).", "N total"),
        ("🌡️", "Temperature", "Menetapkan suhu simpul pada acuan; analisis thermomech memerlukan Initial temperature dan Thermo Mech Steady State agar hasilnya keadaan tunak. Beda suhu dua muka ujung menghasilkan gradien linear.", "K"),
        ("🎛️", "Statik tertentu vs tak tentu", "Kantilever dan batang tarik adalah statik tertentu: tegangan tidak bergantung E. Tumpuan berlebih (dua ujung Fixed) mengubah distribusi gaya; validasi rumus hanya sah bila tumpuan meniru asumsi rumus.", "asumsi rumus"),
    ])
    isi += kotak("tip-box", "💡 <strong>Memilih muka dengan benar:</strong> pada Part Box, muka x = 0 dan x = L adalah dua muka ujung yang tegak lurus sumbu X (arahkan kursor sampai tooltip menampilkan Face1 … Face6; muka ujung sumbu X pada Box baru biasanya Face1 dan Face2). Constraint Force −Z pada muka ujung memberi beban lentur; +X memberi tarik aksial.")
    m += bagian(5, "m-beban", "Tumpuan dan Beban:<br>Constraint yang Meniru Kondisi Nyata", "Tumpuan dan beban adalah penerjemah antara komponen nyata dan model. Bagian ini membahas tiap jenis constraint, acuan geometrinya, satuan, dan jebakan yang membuat hasil menyimpang dari rumus.", isi, "TUMPUAN DAN BEBAN")

    # 06 — Statik dan validasi
    isi = figure(5, "Kantilever terdefleksi, diagram momen, dan rumus validasi δ dan σ", f"Kantilever {L_E} × {B_E} × {H_E} mm baja dengan F = {F_E} N: δ = {ind(DELTA_E, 4)} mm dan σ maks = {ind(SIGMA_E, 1)} MPa di tumpuan; FEM tet10 halus harus mendekati keduanya.", gambar5())
    isi += formula(3, "Defleksi Ujung Kantilever (Euler–Bernoulli)", r"\delta = \frac{F\,L^{3}}{3\,E\,I}, \qquad I = \frac{b\,h^{3}}{12}",
                   r"\(F\) = gaya di ujung bebas &nbsp;·&nbsp; \(L\) = panjang &nbsp;·&nbsp; \(E\) = modulus &nbsp;·&nbsp; \(I\) = momen inersia penampang (\(b\) lebar, \(h\) tebal searah beban). Contoh " + f"F = {F_E} N, L = {L_E}, b = {B_E}, h = {H_E}" + r": \(I = " + ind(I_E, 1) + r"\) mm⁴, \(\delta = " + ind(DELTA_E, 4) + r"\) mm.",
                   "Rumus ini mengabaikan deformasi geser, sehingga FEM (yang memuatnya) biasanya memberi δ sedikit lebih besar untuk balok pendek (L/h < 10); untuk L/h ≥ 10 selisihnya di bawah 2%. Kesalahan lebih dari 5% hampir selalu berarti tumpuan, arah beban, atau orde mesh keliru. Inilah bacaan Tugas 2.",
                   [(r"\delta", "Defleksi ujung bebas (mm)"), ("F", "Gaya ujung (N)"), ("L", "Panjang kantilever (mm)"), ("E", "Modulus elastisitas (MPa)"), ("I", "Momen inersia (mm⁴)")])
    isi += formula(4, "Tegangan Normal: Aksial dan Lentur", r"\sigma_{aksial} = \frac{F}{A}, \qquad \sigma_{lentur,\,maks} = \frac{M\,c}{I} = \frac{6\,F\,L}{b\,h^{2}}",
                   r"\(A = b\,h\) luas penampang &nbsp;·&nbsp; \(M = F\,L\) momen di tumpuan &nbsp;·&nbsp; \(c = h/2\). Contoh batang tarik " + f"F = {ind(F_T, 0)} N, A = {A_T}" + r" mm²: \(\sigma = " + ind(SIGMA_T, 1) + r"\) MPa, \(\varepsilon = \sigma/E = " + ind(EPS_T * 1e6, 1) + r"\) µm/m, \(\Delta L = " + ind(DL_T, 4) + r"\) mm; kantilever contoh: \(\sigma_{maks} = " + ind(SIGMA_E, 1) + r"\) MPa.",
                   "Pada batang tarik, von Mises FEM hampir seragam sama dengan F/A kecuali di dekat Fixed (efek Poisson yang ditahan). Pada kantilever, tegangan terbesar berada di serat atas/bawah muka tumpuan; von Mises di titik itu mendekati 6FL/(bh²) pada mesh halus, dan sudut tajam Fixed menimbulkan puncak lokal yang tidak konvergen (singularitas) yang harus diabaikan saat membandingkan. Tugas 3 memakai bentuk aksialnya.",
                   [(r"\sigma", "Tegangan normal (MPa)"), ("F", "Gaya (N)"), ("A", "Luas penampang (mm²)"), ("M", "Momen lentur (N·mm)"), ("b, h", "Lebar dan tebal penampang (mm)")])
    isi += anim_panel(2, "amber", "Defleksi kantilever terhadap gaya F (skala tampilan diperbesar)", "cvDefleksi",
                      [("sl_df_F", "v_df_F", "Gaya ujung F (N)", 50, 1000, 10, 500, "500"),
                       ("sl_df_L", "v_df_L", "Panjang L (mm)", 100, 300, 5, 180, "180"),
                       ("sl_df_b", "v_df_b", "Lebar b (mm)", 10, 40, 1, 30, "30"),
                       ("sl_df_h", "v_df_h", "Tebal h (mm)", 5, 25, 1, 15, "15")],
                      "btnDefleksi", "toggleDefleksi", "infoDefleksi",
                      "<strong>Cara membaca:</strong> gaya naik dari nol sampai F (PAUSE menahan pada F penuh); kurva lendutan mengikuti y(x) = F·x²(3L − x)/(6EI) dengan skala tampilan diperbesar. Kolom kanan memberi δ (Persamaan 3) dan σ maks (Persamaan 4): δ ∝ L³/h³, σ ∝ L/h². Bandingkan dengan hasil FEM Anda pada Tugas 2.")
    isi += tabel(["Besaran", "Rumus", "Contoh kantilever", "Bacaan di CCX_Results", "Selisih wajar"],
                 [["Defleksi ujung", "F·L³/(3·E·I)", f"{ind(DELTA_E, 4)} mm", "DisplacementLengths maks (Show result → Displacement Magnitude)", "< 2–5%"],
                  ["Tegangan lentur maks", "6·F·L/(b·h²)", f"{ind(SIGMA_E, 1)} MPa", "vonMises di serat atas/bawah muka tumpuan (abaikan puncak sudut)", "< 5–10%"],
                  ["Tegangan aksial", "F/A", f"{ind(SIGMA_T, 1)} MPa", "vonMises di tengah batang (seragam)", "< 1%"],
                  ["Pertambahan panjang", "F·L/(E·A)", f"{ind(DL_T, 4)} mm", "DisplacementLengths maks pada muka beban", "< 1%"],
                  ["Massa", "ρ·V", f"{ind(M_E, 2)} g", "Shape.Volume × ρ (bukan hasil solver)", "0"]])
    isi += kotak("info-box", "<strong>🧾 Kesalahan relatif:</strong> e = |hasil FEM − rumus| / rumus × 100%. Laporkan e bersama ukuran mesh dan orde elemen; e yang turun saat mesh diperhalus menandakan konvergensi, e yang tetap besar menandakan kesalahan model (tumpuan, beban, satuan). Modul 9 memakai e sebagai dasar evaluasi hasil dan faktor keamanan.")
    m += bagian(6, "m-statik", "Analisis Statik dan Validasi Analitis:<br>δ dan σ Dibandingkan dengan Rumus", "Kantilever dan batang tarik adalah dua kasus yang rumusnya tertutup dan mudah dimodelkan. Bagian ini menjalankan analisis statik pada keduanya dan menjadikan rumus balok serta F/A sebagai tolok ukur hasil FEM.", isi, "STATIK DAN VALIDASI")

    # 07 — Termal dan frekuensi
    isi = figure(6, "Hantaran kalor batang dan mode getar pertama kantilever", f"Batang {B_E} × {H_E} × {L_E} mm dengan ΔT = {DT_E} K menghantarkan q = {ind(Q_E, 2)} W (k = {K_BAJA}); kantilever yang sama bergetar pada f₁ = {ind(F_MODE[0], 1)} Hz, f₂ = {ind(F_MODE[1], 1)} Hz, f₃ = {ind(F_MODE[2], 1)} Hz.", gambar6())
    isi += formula(5, "Hantaran Kalor Tunak pada Batang (Hukum Fourier)", r"q = k\,A\,\frac{\Delta T}{L}, \qquad T(x) = T_{1} - \Delta T\,\frac{x}{L}",
                   r"\(k\) = konduktivitas termal (W/(m·K)) &nbsp;·&nbsp; \(A\) = luas penampang (m²) &nbsp;·&nbsp; \(\Delta T = T_1 - T_2\) beda suhu ujung (K) &nbsp;·&nbsp; \(L\) = panjang (m). Contoh " + f"{B_E} × {H_E} × {L_E}" + r" mm, \(k = 50\), \(\Delta T = " + str(DT_E) + r"\) K: \(A = 4{,}5\times10^{-4}\) m², \(q = " + ind(Q_E, 2) + r"\) W.",
                   "Pada keadaan tunak tanpa sumber kalor, suhu turun linear dari muka panas ke muka dingin dan fluks kalor q/A seragam. Analisis thermomech CalculiX menghasilkan medan T yang sama; laju kalornya dihitung dari k dan gradien. Perhatikan satuan: A dalam m² dan L dalam m agar q dalam watt. Inilah bacaan Tugas 4.",
                   [("q", "Laju hantaran kalor (W)"), ("k", "Konduktivitas termal (W/(m·K))"), ("A", "Luas penampang (m²)"), (r"\Delta T", "Beda suhu ujung (K)"), ("L", "Panjang batang (m)")])
    isi += anim_panel(3, "green", "Aliran kalor ΔT sepanjang batang (keadaan tunak)", "cvKalor",
                      [("sl_kl_dT", "v_kl_dT", "Beda suhu ΔT (K)", 10, 300, 5, 80, "80"),
                       ("sl_kl_L", "v_kl_L", "Panjang batang L (mm)", 100, 300, 5, 180, "180"),
                       ("sl_kl_k", "v_kl_k", "Konduktivitas k (W/(m·K))", 10, 400, 5, 50, "50")],
                      "btnKalor", "toggleKalor", "infoKalor",
                      "<strong>Cara membaca:</strong> batang 30 × 15 mm diberi suhu T₁ di kiri dan T₂ = T₁ − ΔT di kanan; warna dan grafik T(x) menunjukkan gradien linear, titik-titik yang bergerak menggambarkan fluks kalor yang lajunya sebanding q = kAΔT/L (PAUSE menahan). Geser k ke 237 (aluminium) atau 400 (tembaga) dan amati q berlipat.")
    isi += formula(6, "Frekuensi Alami Kantilever", r"f_{n} = \frac{\beta_{n}^{2}}{2\pi}\sqrt{\frac{E\,I}{\rho\,A}}\;\frac{1}{L^{2}}, \qquad \beta_{1} = 1{,}875104,\ \beta_{2} = 4{,}694091,\ \beta_{3} = 7{,}854757",
                   r"\(E\) dalam Pa, \(\rho\) dalam kg/m³, \(I = b h^{3}/12\) dan \(A = b h\) dalam m⁴ dan m², \(L\) dalam m. Karena \(I/A = h^{2}/12\), \(\sqrt{EI/(\rho A)} = h\sqrt{E/(12\rho)} = h \times " + ind(C_GEL, 1) + r"\) m/s untuk baja. Contoh kantilever " + f"{L_E} × {B_E} × {H_E}" + r" mm: \(f_1 = " + ind(F_MODE[0], 1) + r"\) Hz.",
                   "Analisis frequency menyelesaikan ([K] − ω²[M]){φ} = 0: tanpa beban, hanya kekakuan dan massa. Mode pertama adalah lentur pada arah tebal terkecil (arah lemah); mode kedua biasanya lentur pada arah lebar dengan rasio b/h, lalu mode kedua arah tebal pada β₂. FEM tet10 memberi f₁ dalam 1–2% dari rumus. Resonansi terjadi bila frekuensi eksitasi (putaran mesin ÷ 60) mendekati f_n. Inilah bacaan Tugas 5.",
                   [("f_n", "Frekuensi alami mode ke-n (Hz)"), (r"\beta_n", "Akar persamaan frekuensi kantilever"), ("E, \\rho", "Modulus (Pa) dan massa jenis (kg/m³)"), ("I, A", "Momen inersia (m⁴) dan luas (m²)"), ("L", "Panjang (m)")])
    isi += anim_panel(4, "violet", "Mode getar pertama kantilever (dan mode 2–3)", "cvGetar",
                      [("sl_gt_L", "v_gt_L", "Panjang L (mm)", 100, 300, 5, 180, "180"),
                       ("sl_gt_h", "v_gt_h", "Tebal h (mm)", 5, 25, 1, 15, "15"),
                       ("sl_gt_mode", "v_gt_mode", "Mode ke-n", 1, 3, 1, 1, "1")],
                      "btnGetar", "toggleGetar", "infoGetar",
                      "<strong>Cara membaca:</strong> kantilever baja lebar 30 mm bergetar pada bentuk mode ke-n (PAUSE menahan amplitudo maksimum); kolom kanan mencantumkan f₁–f₃ dari Persamaan (6). Perhatikan f ∝ h/L²: menebalkan balok menaikkan frekuensi, memanjangkannya menurunkan cepat. Bandingkan f₁ dengan EigenmodeFrequency pada Tugas 5.")
    isi += tabel(["Pengaturan", "Termal tunak (T4)", "Frekuensi (T5)", "Pengantar kinematik (Modul 11)"],
                 [["Analysis Type", "thermomech + Thermo Mech Steady State", "frequency, Eigenmodes Count 5", "— (bukan FEM)"],
                  ["Material wajib", "k (E, ν, ρ, α, c terisi)", "E, ν, ρ", "—"],
                  ["Constraint", "Temperature ×2 muka ujung + Initial temperature", "Fixed saja, tanpa beban", "Joint Assembly (Revolute, Slider)"],
                  ["Hasil", "CCX_Results → Temperature (Min/Max)", "CCX_Mode1_Results … Mode5 → EigenmodeFrequency", "Gerak mekanisme, jarak, tabrakan"],
                  ["Pembanding", "q = k·A·ΔT/L", "f_n = (β_n²/2π)·√(EI/ρA)/L²", "x = r·cosθ + √(l² − r²sin²θ)"]])
    isi += kotak("info-box", "<strong>🔗 Kinematik bukan FEM:</strong> pertanyaan “sejauh mana lengan bergerak” dan “apakah komponen bertabrakan saat berputar” dijawab Assembly Workbench FreeCAD 1.0 dengan joint dan solver kinematik (Modul 11), bukan CalculiX. FEM menjawab kekuatan, kekakuan, suhu, dan getaran komponen pada posisi tertentu; gabungan keduanya (posisi kritis dari kinematika → beban untuk FEM) adalah praktik industri.")
    m += bagian(7, "m-termal", "Analisis Termal dan Frekuensi:<br>Suhu, Laju Kalor, dan Mode Getar", "Dengan Analysis yang sama, mengganti Analysis Type membuka dua pertanyaan baru: seberapa cepat kalor mengalir dan pada frekuensi berapa komponen beresonansi. Bagian ini membahas keduanya beserta rumus pembandingnya, dan menempatkan kinematika pada tempatnya.", isi, "TERMAL DAN FREKUENSI")

    # 08 — Python console
    isi = kode("Python console — Analysis kantilever lengkap dengan ObjectsFem (statik)", f'''import FreeCAD as App, Part, ObjectsFem
doc = App.newDocument("Latihan8")
balok = doc.addObject("Part::Box", "Balok"); balok.Length, balok.Width, balok.Height = {L_E}, {B_E}, {H_E}
doc.recompute()
an = ObjectsFem.makeAnalysis(doc, "Analysis")
solver = ObjectsFem.makeSolverCalculiXCcxTools(doc, "CalculiXCcxTools"); an.addObject(solver)
solver.AnalysisType = "static"; solver.GeometricalNonlinearity = "linear"
mat = ObjectsFem.makeMaterialSolid(doc, "MaterialSolid"); an.addObject(mat)
m = mat.Material
m["Name"] = "Steel-Generic"; m["YoungsModulus"] = "{E_MPA} MPa"; m["PoissonRatio"] = "{NU:.2f}"
m["Density"] = "{RHO} kg/m^3"; m["ThermalConductivity"] = "{K_BAJA} W/m/K"
m["ThermalExpansionCoefficient"] = "12 um/m/K"; m["SpecificHeat"] = "500 J/kg/K"
mat.Material = m
jepit = ObjectsFem.makeConstraintFixed(doc, "ConstraintFixed"); an.addObject(jepit)
jepit.References = [(balok, "Face1")]                                # muka x = 0 (periksa nama muka di GUI)
gaya = ObjectsFem.makeConstraintForce(doc, "ConstraintForce"); an.addObject(gaya)
gaya.References = [(balok, "Face2")]; gaya.Force = "{F_E} N"           # muka x = L; 1.0: besaran berunit
gaya.Direction = (balok, ["Face6"]); gaya.Reversed = True              # normal muka atas dibalik → −Z
mesh = ObjectsFem.makeMeshGmsh(doc, "FEMMeshGmsh"); an.addObject(mesh)
mesh.Shape = balok; mesh.ElementOrder = "2nd"; mesh.CharacteristicLengthMax = "{H_E / 2} mm"
doc.recompute()
from femmesh.gmshtools import GmshTools
print(GmshTools(mesh).create_mesh() or "mesh Gmsh selesai")
print(f"Elemen: {{mesh.FemMesh.VolumeCount}}, simpul: {{mesh.FemMesh.NodeCount}}; massa = {{balok.Shape.Volume*{RHO_G}:.2f}} g")   # {ind(M_E, 2)} g''', "Python (FreeCAD)")
    isi += kode("Python console — menjalankan CalculiX dan membandingkan δ, σ dengan rumus", f'''from femtools import ccxtools
fea = ccxtools.FemToolsCcx(an, solver)
fea.update_objects(); fea.setup_working_dir(); fea.setup_ccx()
pesan = fea.check_prerequisites()
if pesan: print("Belum lengkap:", pesan)
else:
    fea.purge_results(); fea.write_inp_file(); fea.ccx_run(); fea.load_results()
    res = doc.getObject("CCX_Results")
    d_fem = max(res.DisplacementLengths); s_fem = max(res.vonMises)
    F, L, b, h, E = {F_E}, {L_E}, {B_E}, {H_E}, {E_MPA}
    I = b*h**3/12
    d_teori = F*L**3/(3*E*I)                                              # {ind(DELTA_E, 4)} mm
    s_teori = 6*F*L/(b*h**2)                                              # {ind(SIGMA_E, 1)} MPa
    print(f"delta FEM = {{d_fem:.4f}} mm, rumus = {{d_teori:.4f}} mm, selisih {{abs(d_fem-d_teori)/d_teori*100:.2f}} %")
    print(f"vonMises maks FEM = {{s_fem:.1f}} MPa, rumus lentur = {{s_teori:.1f}} MPa (puncak sudut Fixed boleh lebih tinggi)")
# batang tarik: ganti Force menjadi +X (Direction = muka ujung, Reversed=False) lalu jalankan ulang
A = {B_E}*{H_E}; print(f"sigma aksial rumus = {{{F_T}/A:.1f}} MPa; dL = {{{F_T}*{L_E}/({E_MPA}*A):.4f}} mm")   # {ind(SIGMA_T, 1)} MPa, {ind(DL_T, 4)} mm''', "Python (FreeCAD)")
    isi += kode("Python console — analisis termal tunak dan frekuensi pada Analysis yang sama", f'''import math
# ── termal: dua muka ujung diberi suhu, solver thermomech tunak ──
gaya.ViewObject.Visibility = False; an.removeObject(gaya)              # beban tidak dipakai
panas = ObjectsFem.makeConstraintTemperature(doc, "ConstraintTemperature"); an.addObject(panas)
panas.References = [(balok, "Face1")]; panas.Temperature = "{300 + DT_E} K"
dingin = ObjectsFem.makeConstraintTemperature(doc, "ConstraintTemperature001"); an.addObject(dingin)
dingin.References = [(balok, "Face2")]; dingin.Temperature = "300 K"
awal = ObjectsFem.makeConstraintInitialTemperature(doc, "ConstraintInitialTemperature"); an.addObject(awal)
awal.initialTemperature = "300 K"
solver.AnalysisType = "thermomech"; solver.ThermoMechSteadyState = True
k, A, L = {K_BAJA}, {B_E}*{H_E}*1e-6, {L_E}/1000                          # W/(m·K), m², m
print(f"q rumus = k*A*dT/L = {{k*A*{DT_E}/L:.3f}} W")                  # {ind(Q_E, 3)} W
# ── frekuensi: tanpa beban, cukup Fixed + rho ──
solver.AnalysisType = "frequency"; solver.EigenmodesCount = 5
E, rho, b, h = 2.1e11, {RHO}, {B_E}/1000, {H_E}/1000
I, A = b*h**3/12, b*h
for n, beta in enumerate([{BETA[0]}, {BETA[1]}, {BETA[2]}], 1):
    print(f"f{{n}} rumus = {{beta**2/(2*math.pi)*math.sqrt(E*I/(rho*A))/L**2:.1f}} Hz")   # {ind(F_MODE[0], 1)}, {ind(F_MODE[1], 1)}, {ind(F_MODE[2], 1)}
# setelah Run: [o.EigenmodeFrequency for o in doc.Objects if o.Name.startswith("CCX_Mode")]''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan cell pertama dan kedua; cocokkan massa " + ind(M_E, 2) + " g, δ rumus " + ind(DELTA_E, 4) + " mm, σ rumus " + ind(SIGMA_E, 1) + " MPa, lalu lihat selisih FEM-nya. Cell ketiga memberi q = " + ind(Q_E, 3) + " W dan f₁ = " + ind(F_MODE[0], 1) + " Hz untuk kantilever contoh. Tugas meminta Analysis dibangun lewat GUI FEM Workbench (atau skrip ini dengan angka Anda) dan hasil CalculiX tersimpan di berkas; angka yang dinilai adalah nilai analitisnya.")
    m += bagian(8, "m-python", "Python Console:<br>ObjectsFem dari Analysis sampai Hasil", "Cell pertama membangun Analysis kantilever lengkap dengan ObjectsFem dan mesh Gmsh; cell kedua menjalankan CalculiX dari Python dan membandingkan δ serta σ dengan rumus; cell ketiga mengubah Analysis Type menjadi termal dan frekuensi beserta rumus pembandingnya.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Geometri dan massa", f"Part → Box {L_E} × {B_E} × {H_E} mm (Length searah X). Baca Shape.Volume, hitung massa baja 7,85×10⁻³ × V = {ind(M_E, 2)} g; ini bacaan Tugas 1."),
               ("2", "Analysis dan material", "FEM Workbench → Analysis container → Material for solid → kartu Steel-Generic; periksa E = 210000 MPa, ν = 0,30, ρ = 7850 kg/m³, k = 50 W/(m·K)."),
               ("3", "Tumpuan dan beban", f"Constraint fixed → muka x = 0. Constraint force → muka x = L, {F_E} N, arah −Z (pilih muka atas sebagai arah, centang Reversed bila perlu). Perhatikan panah di 3D view."),
               ("4", "Mesh Gmsh", f"FEM mesh from shape by Gmsh → Element Order 2nd, Max element size {H_E / 2:g} mm → Apply. Catat jumlah elemen dan simpul di properti mesh."),
               ("5", "Solver statik", "Klik ganda CalculiXCcxTools → Analysis Type static → Write .inp file → Run CalculiX; tunggu “done without error”. Show result → Displacement Magnitude; baca nilai maksimum."),
               ("6", "Validasi dan konvergensi", f"δ rumus = {ind(DELTA_E, 4)} mm, σ rumus = {ind(SIGMA_E, 1)} MPa. Hitung kesalahan relatif; ulangi dengan mesh 5 dan 2,5 mm sampai perubahan < 2%. Coba Element Order 1st sekali untuk melihat tet4 yang terlalu kaku."),
               ("7", "Termal, frekuensi, simpan", f"Ganti beban dengan Temperature {300 + DT_E} K / 300 K + Initial temperature, Analysis Type thermomech (steady) → baca Temperature; lalu frequency (hapus constraint suhu) → f₁ ≈ {ind(F_MODE[0], 1)} Hz. Ctrl+S → <code>Latihan8_NIM.FCStd</code>.")]
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
                 [["Run CalculiX: “*ERROR … no material”/“density”", "Properti material kosong (ρ untuk frequency, k untuk thermomech)", "Buka MaterialSolid → isi properti; pilih kartu Steel-Generic"],
                  ["Hasil δ jauh lebih kecil dari rumus (−30…−60%)", "Element Order 1st (tet4) atau mesh terlalu kasar", "Element Order 2nd; ukuran ≤ h/2; uji konvergensi"],
                  ["δ jauh lebih besar / bentuk aneh", "Fixed pada muka yang salah atau Force di rusuk/titik", "Fixed pada muka ujung x = 0; Force pada muka ujung"],
                  ["Arah gaya terbalik (balok naik)", "Normal muka menghadap ke atas", "Centang Reversed atau pilih muka arah lain"],
                  ["von Mises sangat tinggi di sudut Fixed", "Singularitas sudut tajam (bukan fisik)", "Baca σ di serat tepi sedikit menjauh dari sudut; bandingkan dengan 6FL/bh²"],
                  ["Suhu seragam / tidak ada gradien", "Hanya satu Temperature constraint atau bukan steady state", "Dua constraint suhu di dua muka; Thermo Mech Steady State aktif"],
                  ["Frekuensi 0 Hz atau sangat kecil", "Tanpa Fixed (benda bebas: 6 mode kaku) atau ρ salah satuan", "Tambahkan Fixed; ρ = 7850 kg/m³"],
                  ["Mesh gagal / Gmsh tidak ditemukan", "Path Gmsh belum diatur (paket non-resmi)", "Edit → Preferences → FEM → Gmsh binary; paket resmi 1.0 sudah membawanya"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) satu Analysis berisi MaterialSolid (properti terisi), FEMMeshGmsh orde 2, constraint sesuai tugas, dan CalculiXCcxTools dengan Analysis Type yang benar; (2) hasil CCX_Results (atau CCX_Mode1_Results) ada di pohon setelah Run; (3) angka yang diisikan adalah nilai ANALITIS dengan desimal sesuai label, dihitung dari dimensi varian Anda; (4) selisih FEM terhadap rumus sudah Anda periksa (< 5%); (5) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Kantilever Statik, Termal, dan Frekuensi", "Tujuh langkah berikut membangun Analysis kantilever contoh dari geometri sampai validasi, menguji konvergensi mesh, lalu mengubahnya menjadi analisis termal dan frekuensi; ditutup tabel gejala dan daftar periksa.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: FEM Workbench (Analysis, Material, Mesh Gmsh/Netgen, Constraints, Solver CalculiX, Results, Post pipeline), FEM Tutorial, FEM Scripting", " (wiki.freecad.org), 2024–2026.", "Acuan nama objek, parameter solver, dan API ObjectsFem/femtools yang dipakai di cell Python.")
    refs += pm_ref(2, "amber", "249,115,22", "G. Dhondt", "CalculiX CrunchiX User's Manual, version 2.21", ". 2023 (dhondt.de).", "Rujukan solver: jenis analisis (static, frequency, heat transfer), format .inp/.frd, dan elemen C3D10.")
    refs += pm_ref(3, "violet", "168,85,247", "D. L. Logan", "A First Course in the Finite Element Method", ", 6th ed. Cengage, 2017.", "Dasar FEM: matriks kekakuan, perakitan [K]{u} = {F}, elemen batang dan balok, konvergensi mesh.")
    refs += pm_ref(4, "green", "0,224,158", "R. C. Hibbeler", "Mechanics of Materials", ", 10th ed. Pearson, 2017.", "Rumus pembanding: tegangan aksial F/A, lentur Mc/I, dan defleksi kantilever FL³/(3EI).")
    refs += pm_ref(5, "pink", "236,72,153", "S. S. Rao", "Mechanical Vibrations", ", 6th ed. Pearson, 2017; dan F. P. Incropera dkk., <em>Fundamentals of Heat and Mass Transfer</em>, 7th ed. Wiley, 2011.", "Frekuensi alami kantilever (β_n) dan hukum Fourier untuk hantaran kalor batang.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi FEM Workbench, solver CalculiX, dasar metode elemen hingga, dan rumus mekanika bahan, getaran, serta perpindahan kalor yang dipakai sebagai pembanding hasil simulasi.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki FEM Workbench, FEM CalculiX, FEM Mesh Gmsh, FEM Constraint Fixed/Force/Temperature, FEM Results, FEM Material, dan FEM Scripting (ObjectsFem); contoh bawaan di menu FEM → Examples (Cantilever Face Load, Thermomech Flow 1D, Frequency Cantilever) memperlihatkan Analysis lengkap yang bisa ditiru.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 8 — Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Analysis → CalculiX</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">δ = FL³/3EI</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">σ = F/A</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">q = kAΔT/L</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">f₁ (Hz)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 9 · Simulasi Kinerja Komponen</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 8</span><br><em>Simulasi Pertama</em><br>dengan CalculiX</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang FEM, FEM Workbench, CalculiX, material, mesh, tumpuan/beban, statik, termal, dan frekuensi, ditambah 5 tugas simulasi: massa kantilever (Analysis statik lengkap), defleksi kantilever vs rumus, tegangan batang tarik, laju hantaran kalor batang (thermomech), dan frekuensi alami pertama kantilever (frequency). Setiap tugas mengunggah berkas .FCStd berisi Analysis, mesh, dan hasil CalculiX, lalu mengisi angka analitis yang deterministik. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Inti <strong>metode elemen hingga</strong> (FEM) adalah...",
     ["Menggambar model 3D dengan lebih banyak fitur agar tampak realistis", "Mengukur tegangan langsung dengan sensor pada benda nyata", "Membagi benda menjadi elemen-elemen kecil bersimpul lalu menyelesaikan sistem persamaan [K]{u} = {F} untuk perpindahan simpul", "Menghitung volume dan massa dari Shape.Volume"],
     "Inti FEM"),
    ("Urutan <strong>alur analisis</strong> di FEM Workbench yang benar adalah...",
     ["Geometri → Analysis (material, mesh, tumpuan dan beban) → solver CalculiX → hasil dan validasi", "Solver → mesh → geometri → material", "Hasil → mesh → beban → geometri", "Mesh → hasil → material → solver"],
     "Alur analisis FEM"),
    ("Fungsi kontainer <strong>Analysis</strong> pada FEM Workbench adalah...",
     ["Menyimpan gambar TechDraw hasil simulasi", "Wadah yang mengelompokkan material, mesh, constraint, solver, dan hasil untuk satu kasus simulasi", "Menggantikan Body pada Part Design", "Mengubah satuan dokumen menjadi SI"],
     "Fungsi Analysis"),
    ("Solver <strong>CalculiX</strong> di FreeCAD bekerja dengan cara...",
     ["Menghitung langsung di dalam Sketcher", "Mengirim model ke layanan awan", "Membaca berkas .FCStd secara langsung", "FreeCAD menulis berkas masukan .inp, menjalankan program ccx, lalu membaca hasil .frd menjadi CCX_Results"],
     "Cara kerja CalculiX"),
    ("Properti material <strong>minimum</strong> untuk analisis statik linear adalah...",
     ["Konduktivitas termal dan kalor jenis", "Modulus elastisitas E dan rasio Poisson ν (massa jenis ρ diperlukan untuk berat sendiri dan frekuensi)", "Hanya massa jenis ρ", "Tegangan luluh dan kekerasan"],
     "Properti material statik"),
    ("Mesh Gmsh <strong>orde 2</strong> (tet10) dibandingkan orde 1 (tet4) untuk kasus lentur...",
     ["Lebih cepat tetapi jauh lebih tidak akurat", "Hanya berbeda pada warna tampilan", "Jauh lebih akurat karena simpul tengah rusuk menangkap gradien tegangan lentur; tet4 terlalu kaku (locking)", "Tidak dapat dipakai untuk solid"],
     "Tet10 vs tet4"),
    ("Perbedaan <strong>Constraint Fixed</strong> dan <strong>Constraint Displacement</strong> adalah...",
     ["Fixed mengunci semua derajat kebebasan (perpindahan nol) pada acuan; Displacement memberi nilai perpindahan tertentu atau mengunci arah tertentu saja", "Fixed hanya untuk muka, Displacement hanya untuk titik", "Fixed adalah beban, Displacement adalah tumpuan", "Tidak ada perbedaan"],
     "Fixed vs Displacement"),
    ("Defleksi ujung <strong>kantilever</strong> dengan beban titik F di ujung bebas menurut teori balok adalah...",
     ["δ = F·L/(E·A)", "δ = F·L²/(E·I)", "δ = 6·F·L/(b·h²)", "δ = F·L³/(3·E·I) dengan I = b·h³/12"],
     "Defleksi kantilever"),
    ("Pada <strong>analisis termal tunak</strong> (thermomech steady state) batang dengan suhu berbeda di kedua ujung...",
     ["Hasil FEM hanya berupa tegangan von Mises", "Suhu turun linear sepanjang batang dan laju kalor mengikuti q = k·A·ΔT/L (hukum Fourier)", "Konduktivitas termal k tidak berpengaruh", "Diperlukan Constraint Force di kedua ujung"],
     "Termal tunak"),
    ("<strong>Analisis frekuensi</strong> (Analysis Type = frequency) pada CalculiX...",
     ["Menghitung frekuensi alami dan bentuk mode tanpa beban luar; massa jenis ρ wajib terisi", "Memerlukan Constraint Force untuk menggetarkan model", "Menghasilkan suhu tiap simpul", "Hanya berlaku untuk batang tarik"],
     "Analisis frekuensi"),
]

TUGAS_LABELS = ["Kantilever Analysis statik — massa (g)", "Kantilever — defleksi teoretis δ (mm)", "Batang tarik — tegangan σ = F/A (MPa)",
                "Batang termal thermomech — laju kalor q (W)", "Kantilever frequency — f₁ (Hz)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}

FQ_JUDUL = [
    "Bagaimana menyusun Analysis braket agar hasil FEM-nya dapat dipercaya sebelum uji fisik?",
    "Bagaimana memvalidasi δ dan σ braket kantilever terhadap rumus, dan kapan selisihnya masih wajar?",
    "Apakah poros dekat knalpot aman secara termal dan bebas resonansi pada putaran kerja?",
]
FQ_RINGKAS = [
    "Rancang Analysis braket silinder hidrolik: material S355 dari kartu Steel, mesh Gmsh orde 2 dengan ukuran awal dan Mesh Region di lubang, Fixed pada muka baut, Force pada muka dudukan; sebutkan properti yang wajib terisi dan uji konvergensi tiga mesh.",
    "Sederhanakan braket sebagai kantilever, hitung δ dan σ maks dengan Persamaan (3)–(4), bandingkan dengan DisplacementLengths dan von Mises FEM, hitung kesalahan relatif, dan jelaskan sumber selisih (mesh, geser, singularitas sudut).",
    "Susun analisis thermomech (dua Temperature + Initial temperature) untuk poros dekat sumber panas dan analisis frequency untuk memeriksa f₁ terhadap frekuensi putaran mesin; tafsirkan q, gradien suhu, dan jarak aman dari resonansi.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Braket dudukan silinder hidrolik dari pelat S355 tebal 20 mm menerima gaya 18 kN dari silinder dan dibaut ke rangka lewat empat lubang ⌀17. Sebelumnya braket diuji fisik sampai patah (tiga prototipe, dua minggu). Susun Analysis-nya (Bagian 02–05): geometri dari Part Design, kartu material dan properti yang wajib terisi untuk statik, mesh Gmsh orde 2 dengan ukuran awal dan Mesh Region di sekitar lubang, Fixed pada muka lubang baut, Force 18 kN pada muka dudukan silinder, lalu rencana uji konvergensi tiga mesh. Jelaskan mengapa Force pada rusuk atau titik ditolak.",
            ["S355, tebal 20, 4 × ⌀17", "F = 18 kN pada muka dudukan", "mesh tet10 + Mesh Region"],
            "Masukan minimum agar analisis statik linear braket dapat dijalankan dan dipercaya adalah...",
            ["Material dengan σ_y saja dan mesh orde 1 yang sangat kasar", "Material dengan E dan ν, mesh orde 2 dengan uji konvergensi, Fixed pada muka baut, dan Force total pada muka (bukan rusuk/titik)", "Cukup geometri dan Force; tumpuan ditebak solver", "Temperature constraint di semua muka"],
            "✅ Tepat! Statik linear memerlukan E dan ν, mesh tet10 yang diuji konvergensinya, tumpuan pada muka yang benar-benar terikat, dan gaya total pada muka agar tidak timbul singularitas. σ_y baru dipakai saat menilai faktor keamanan (Modul 9).",
            "❌ Tanpa E dan ν solver gagal; mesh orde 1 kasar memberi braket yang terlalu kaku; tumpuan tidak pernah ditebak solver; Temperature untuk analisis termal. Lihat Bagian 03–05 dan Animasi 1.",
            "Petunjuk: (1) Daftarkan objek Analysis dan properti material. (2) Tentukan mesh awal, Mesh Region, dan tiga ukuran untuk konvergensi. (3) Jelaskan tumpuan dan beban beserta alasannya.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Untuk memeriksa Analysis sebelum bentuk rumitnya, insinyur menyederhanakan braket sebagai kantilever 160 × 40 × 20 mm baja (E = 210000 MPa) dengan gaya 18 kN di ujung. Hitung δ dan σ maks dengan Persamaan (3) dan (4) (Bagian 06), bandingkan dengan DisplacementLengths maks dan von Mises FEM pada tiga mesh, hitung kesalahan relatif tiap mesh, dan jelaskan mengapa von Mises di sudut Fixed melonjak tanpa konvergen sementara δ konvergen dengan cepat.",
            ["kantilever 160 × 40 × 20", "F = 18 kN, E = 210000", "e = |FEM − rumus|/rumus"],
            "Hasil FEM kantilever 160 × 40 × 20 mm dianggap tervalidasi bila...",
            ["von Mises di sudut Fixed sama persis dengan rumus", "δ FEM jauh lebih kecil dari rumus karena FEM lebih teliti", "δ FEM lebih besar 50% dari rumus", "δ FEM dalam ±5% dari F·L³/(3·E·I) dan σ di serat tepi dekat tumpuan mendekati 6·F·L/(b·h²), dengan e yang turun saat mesh diperhalus"],
            "✅ Tepat! Perpindahan konvergen cepat dan menjadi ukuran validasi utama; tegangan dibaca di serat tepi menjauh dari singularitas sudut. Kesalahan yang mengecil saat mesh diperhalus membuktikan model, bukan kebetulan.",
            "❌ Puncak di sudut Fixed adalah singularitas yang tidak konvergen; δ FEM yang jauh lebih kecil menandakan tet4/mesh kasar; 50% lebih besar menandakan tumpuan/beban salah. Lihat Bagian 06 dan Animasi 2.",
            "Petunjuk: (1) Hitung I, δ, σ maks dengan rumus. (2) Tabelkan FEM vs rumus untuk tiga mesh dan kesalahan relatifnya. (3) Jelaskan sumber selisih dan cara membaca σ yang benar.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Poros idler ⌀40 × 300 mm baja dipasang 120 mm dari pipa knalpot sehingga satu ujungnya bersuhu ±420 K sementara ujung lain 320 K, dan mesin bekerja pada 1500–3000 rpm. Susun analisis thermomech tunak (Bagian 07): dua Temperature constraint, Initial temperature, k = 50 W/(m·K); hitung q dengan Persamaan (5) memakai A = π·d²/4 dan tafsirkan gradien suhunya. Lalu susun analisis frequency dengan Fixed pada muka bantalan, bandingkan f₁ FEM dengan taksiran Persamaan (6) (I = π·d⁴/64, A = π·d²/4), dan nilai apakah frekuensi putaran 25–50 Hz cukup jauh dari f₁.",
            ["⌀40 × 300, ΔT = 100 K, k = 50", "thermomech + frequency", "1500–3000 rpm = 25–50 Hz"],
            "Agar analisis frequency poros memberi f₁ yang benar dan analisis thermomech memberi gradien suhu, yang wajib ada adalah...",
            ["frequency: ρ terisi dan Fixed tanpa beban; thermomech: k terisi, dua Temperature di dua ujung, Initial temperature, dan Thermo Mech Steady State aktif", "frequency: Force sebesar berat poros; thermomech: Pressure pada muka panas", "Keduanya cukup geometri dan mesh tanpa material", "frequency memerlukan Temperature, thermomech memerlukan ρ"],
            "✅ Tepat! Matriks massa memerlukan ρ dan mode hanya bermakna bila ada tumpuan; analisis termal tunak memerlukan k, dua suhu batas, suhu awal, dan mode steady state. Resonansi dinilai dengan membandingkan f_putaran = rpm/60 terhadap f₁.",
            "❌ Force dan Pressure tidak berperan pada frekuensi/termal; material selalu wajib; Temperature tidak dibutuhkan frequency dan ρ tidak dibutuhkan termal tunak. Lihat Bagian 07 dan Animasi 3–4.",
            "Petunjuk: (1) Daftarkan constraint dan properti tiap analisis. (2) Hitung q dan f₁ dengan rumus (satuan SI). (3) Nilai jarak f₁ dari 25–50 Hz dan usulkan perubahan bila terlalu dekat.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">braket S355 · 18 kN</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Analysis → CalculiX</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">δ = FL³/3EI</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">f₁ vs rpm/60</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 9 · Simulasi Kinerja Komponen</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Dari Uji Patah<br><em>ke Simulasi FEM</em></h1>
    <p class="hero-sub">PT Baja Nusantara Alat Berat selama ini menguji braket dan poros secara fisik sampai rusak: mahal dan lambat. Terapkan Pertemuan 9: Analysis, material, mesh, tumpuan dan beban, validasi statik terhadap rumus, serta analisis termal dan frekuensi, untuk menggantikan sebagian uji fisik dengan simulasi yang dapat dipercaya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PT Baja Nusantara Alat Berat —<br>FEM Sebelum Uji Fisik</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS SIMULASI KOMPONEN</div>
    <p>
      <strong style="color:var(--amber)">PT Baja Nusantara Alat Berat</strong> memproduksi <strong style="color:var(--cyan)">braket dan poros untuk ekskavator mini</strong>. Setiap desain baru diuji fisik sampai patah: <strong>braket dudukan silinder hidrolik</strong> (pelat S355 tebal 20 mm, empat lubang ⌀17, beban 18 kN) menghabiskan tiga prototipe dan dua minggu, sementara <strong>poros idler</strong> ⌀40 × 300 mm yang dipasang dekat knalpot (ujung 420 K, ujung lain 320 K; mesin 1500–3000 rpm) pernah bergetar keras di lapangan tanpa diketahui sebabnya.
    </p>
    <p style="margin-top:12px">
      Manajemen membeli lisensi apa pun asal terbukti; tim desain mengusulkan <strong style="color:var(--cyan)">FEM Workbench FreeCAD 1.0 dengan CalculiX</strong>. Percobaan pertama mengecewakan: braket “dua kali lebih kaku” dari uji fisik (mesh tet4 kasar), gaya diberikan pada satu titik sehingga von Mises melonjak tak masuk akal, analisis frekuensi gagal karena massa jenis kosong, dan analisis termal memberi suhu seragam karena hanya satu constraint suhu.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur simulasi yang tervalidasi</strong>: Analysis lengkap dengan material dan mesh yang benar, tumpuan dan beban yang meniru kondisi nyata, validasi δ dan σ terhadap rumus kantilever, serta analisis termal dan frekuensi poros.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Braket S355 t = 20, 4 × ⌀17, F = 18 kN", "14,165,233", "cyan")}
{kartu("Kantilever uji 160 × 40 × 20, E = 210000", "14,165,233", "cyan")}
{kartu("Poros ⌀40 × 300: 420 K → 320 K, k = 50", "14,165,233", "cyan")}
{kartu("1500–3000 rpm = 25–50 Hz · resonansi?", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Braket yang terlalu kaku, tegangan yang melonjak, frekuensi yang gagal, dan suhu yang seragam berasal dari empat hal: orde mesh, beban di titik, properti material kosong, dan constraint termal yang kurang. Forum ini mengajak Anda membereskan keempatnya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Empat analisis komponen alat berat: braket statik (mesh + defleksi), batang tarik σ = F/A, poros termal T₁ → T₂, poros frekuensi mode 1</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "PT Baja Nusantara Alat Berat memproduksi braket dan poros ekskavator mini dan selama ini menguji tiap desain secara fisik sampai patah. Braket dudukan silinder hidrolik (pelat S355 tebal 20 mm, 4 &times; &oslash;17, beban 18 kN) menghabiskan tiga prototipe; poros idler &oslash;40 &times; 300 mm dekat knalpot (420 K &rarr; 320 K; mesin 1500&ndash;3000 rpm) pernah bergetar keras tanpa diketahui sebabnya. Percobaan FEM pertama gagal: mesh tet4 kasar membuat braket dua kali lebih kaku, gaya di satu titik melonjakkan von Mises, analisis frekuensi gagal karena massa jenis kosong, dan analisis termal memberi suhu seragam. Susun Analysis lengkap (material, mesh orde 2 + konvergensi, tumpuan/beban pada muka), validasi &delta; dan &sigma; kantilever 160 &times; 40 &times; 20 mm terhadap rumus, lalu analisis thermomech dan frequency poros untuk menilai laju kalor dan jarak f&#8321; dari 25&ndash;50 Hz."
FORUM_CHIPS_LMS = ["braket S355 t = 20, 4 × ⌀17, F = 18 kN", "kantilever uji 160 × 40 × 20, E = 210000", "poros ⌀40 × 300: 420 K → 320 K, k = 50", "1500–3000 rpm = 25–50 Hz · resonansi?"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Empat analisis komponen alat berat: statik, tarik, termal, frekuensi (Pertemuan 9)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const kolom = W / 4;
  const nama = ['Braket — statik (δ, σ)', 'Batang tarik — σ = F/A', 'Poros — termal T₁ → T₂', 'Poros — frekuensi f₁'];
  const dinding = (x, y0, y1) => { ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.lineWidth = .8; ctx.strokeStyle = '#94a3b8'; for (let y = y0; y < y1; y += 7) { ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x - 6, y); ctx.stroke(); } };
  for (let k = 0; k < 4; k++) {
    const x0 = kolom * k + 26, Lw = kolom - 52, cy = H * 0.5, hh = 14;
    if (k === 0) { dinding(x0, cy - 26, cy + 26); ctx.strokeStyle = 'rgba(34,211,238,.35)'; ctx.lineWidth = .7; const nx = 10, ny = 2; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const xa = x0 + i * Lw / nx, ya = cy - hh + j * hh; ctx.strokeRect(xa, ya, Lw / nx, hh); ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xa + Lw / nx, ya + hh); ctx.stroke(); }
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const xi = i / 30; const y = xi * xi * (3 - xi) / 2 * 34; i ? ctx.lineTo(x0 + xi * Lw, cy - hh + y) : ctx.moveTo(x0, cy - hh); } ctx.stroke();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0 + Lw - 4, cy - 46); ctx.lineTo(x0 + Lw - 4, cy - hh - 3); ctx.stroke(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(x0 + Lw - 4, cy - hh); ctx.lineTo(x0 + Lw - 8, cy - hh - 8); ctx.lineTo(x0 + Lw, cy - hh - 8); ctx.fill(); ctx.font = "bold 10px 'JetBrains Mono'"; ctx.fillText('F', x0 + Lw + 2, cy - 36); }
    if (k === 1) { dinding(x0, cy - 22, cy + 22); ctx.fillStyle = 'rgba(0,224,158,.15)'; ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1.5; ctx.fillRect(x0, cy - hh / 2, Lw - 30, hh); ctx.strokeRect(x0, cy - hh / 2, Lw - 30, hh);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0 + Lw - 30, cy); ctx.lineTo(x0 + Lw - 4, cy); ctx.stroke(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(x0 + Lw, cy); ctx.lineTo(x0 + Lw - 8, cy - 4); ctx.lineTo(x0 + Lw - 8, cy + 4); ctx.fill();
      ctx.fillStyle = '#00e09e'; ctx.font = "10px 'JetBrains Mono'"; ctx.textAlign = 'center'; ctx.fillText('σ seragam', x0 + (Lw - 30) / 2, cy - 14); ctx.textAlign = 'left'; }
    if (k === 2) { const n = 24; for (let i = 0; i < n; i++) { const f = 1 - i / (n - 1); ctx.fillStyle = 'rgb(' + Math.round(60 + 190 * f) + ',' + Math.round(80 + 40 * (1 - Math.abs(2 * f - 1))) + ',' + Math.round(240 - 190 * f) + ')'; ctx.fillRect(x0 + i * Lw / n, cy - 9, Lw / n + .6, 18); }
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.strokeRect(x0, cy - 9, Lw, 18); ctx.fillStyle = '#ef4444'; ctx.font = "bold 10px 'JetBrains Mono'"; ctx.textAlign = 'right'; ctx.fillText('T₁', x0 - 4, cy + 4); ctx.fillStyle = '#3b82f6'; ctx.textAlign = 'left'; ctx.fillText('T₂', x0 + Lw + 4, cy + 4);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0 + 10, cy + 24); ctx.lineTo(x0 + Lw - 14, cy + 24); ctx.stroke(); ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(x0 + Lw - 8, cy + 24); ctx.lineTo(x0 + Lw - 16, cy + 20); ctx.lineTo(x0 + Lw - 16, cy + 28); ctx.fill(); ctx.font = "10px 'JetBrains Mono'"; ctx.fillText('q = kAΔT/L', x0 + 10, cy + 40); }
    if (k === 3) { dinding(x0, cy - 24, cy + 24); const b = 1.875104, sg = (Math.cosh(b) + Math.cos(b)) / (Math.sinh(b) + Math.sin(b)); [[1, '#a855f7', []], [-1, 'rgba(168,85,247,.6)', [4, 3]]].forEach(([s, w, d]) => { ctx.strokeStyle = w; ctx.lineWidth = 1.8; ctx.setLineDash(d); ctx.beginPath(); for (let i = 0; i <= 30; i++) { const xi = i / 30, bx = b * xi; const phi = Math.cosh(bx) - Math.cos(bx) - sg * (Math.sinh(bx) - Math.sin(bx)); const y = cy - s * phi / 2 * 22; i ? ctx.lineTo(x0 + xi * Lw, y) : ctx.moveTo(x0, cy); } ctx.stroke(); ctx.setLineDash([]); });
      ctx.fillStyle = '#a855f7'; ctx.font = "10px 'JetBrains Mono'"; ctx.textAlign = 'center'; ctx.fillText('mode 1 · f₁ vs rpm/60', x0 + Lw / 2, cy + 40); ctx.textAlign = 'left'; }
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText(nama[k], kolom * (k + 0.5), H - 10); ctx.textAlign = 'left';
  }
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ setiap hasil FEM dibandingkan dengan rumus: δ = FL³/3EI · σ = F/A · q = kAΔT/L · f₁ = (β²/2π)√(EI/ρA)/L²', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
