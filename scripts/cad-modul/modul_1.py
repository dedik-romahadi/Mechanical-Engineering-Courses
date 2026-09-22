# Konten Modul 1 Pemodelan CAD — Pengenalan FreeCAD dan Menggambar 2D
# (Sub-CPMK 1.1: antarmuka dan alat dasar CAD, pengaturan workspace dan perintah
# dasar, menggambar objek 2D dan manajemen berkas). Semua angka contoh dihitung di
# sini agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama dengan
# varian tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from tugas_gambar import AM, CY, GN, RD, _panah, dim_h, dim_v, ext, tugas_gambar_html  # noqa: E402

NOMOR = 1
JUDUL = "Pengenalan FreeCAD dan Menggambar 2D"
JUDUL_PANJANG = "Pengenalan FreeCAD dan Menggambar 2D"
JUDUL_EKSPOR = "Pengenalan FreeCAD dan Menggambar 2D"
COURSE = "Pemodelan CAD"

# ─────────────────────────── angka contoh ───────────────────────────
A_CONTOH, B_CONTOH = 120, 60            # pelat contoh (mm)
D_CONTOH = 16                           # diameter lubang contoh
LUBANG_CONTOH = math.pi * D_CONTOH ** 2 / 4
LUAS_BERSIH_CONTOH = A_CONTOH * B_CONTOH - 2 * LUBANG_CONTOH
R_BUSUR, TH_BUSUR = 35, 120
BUSUR_CONTOH = R_BUSUR * math.radians(TH_BUSUR)
N_POLI, R_POLI = 6, 40
POLI_CONTOH = N_POLI * R_POLI ** 2 * math.sin(2 * math.pi / N_POLI) / 2
W_L, H_L, T_L = 100, 80, 15
A1_L, A2_L = W_L * T_L, (H_L - T_L) * T_L
XB_L = (A1_L * W_L / 2 + A2_L * T_L / 2) / (A1_L + A2_L)
YB_L = (A1_L * T_L / 2 + A2_L * (H_L + T_L) / 2) / (A1_L + A2_L)


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    w, h = 120, 54
    tahap = [("Kebutuhan", "spesifikasi", "#f97316"), ("Konsep", "sketsa ide", "#a855f7"),
             ("Model CAD", "parametrik, FCStd", "#22d3ee"), ("Turunan", "gambar, CAM, CAE", "#0ea5e9"),
             ("Produksi", "mesin, las, cetak", "#00e09e")]
    xs = [12, 144, 276, 408, 540]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 40, w, h, [a, s], c, 11.5)
    for i in range(4):
        b += arrow(xs[i] + w, 67, xs[i + 1], 67)
    b += f'<path d="M {xs[3] + 60} 120 Q 335 170 {xs[1] + 60} 120" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += arrow(xs[1] + 62, 122, xs[1] + 60, 96, "#ef4444")
    b += t(335, 158, "revisi: ubah dimensi di model, turunan ikut diperbarui", 11.5, "#ef4444")
    b += t(335, 200, "Model CAD adalah sumber tunggal geometri; dokumen lain diturunkan darinya", 12, AX)
    return svg(670, 214, b, "Gambar 1 — Posisi model CAD dalam alur perancangan")


def gambar2():
    b = ""
    b += f'<rect x="14" y="14" width="642" height="262" rx="8" fill="#0e1628" stroke="#334155" stroke-width="1.4"/>'
    b += f'<rect x="14" y="14" width="642" height="20" rx="8" fill="#152038"/>'
    b += t(30, 28, "File  Edit  View  Tools  Macro  Windows  Help", 10.5, TX, "start")
    b += f'<rect x="14" y="36" width="642" height="24" fill="#111a2f"/>'
    for i, nama in enumerate(["Draft ▾", "Line", "Polyline", "Rectangle", "Circle", "Arc", "Polygon", "Snap"]):
        x = 26 + i * 76
        c = "#22d3ee" if i == 0 else "#243653"
        b += f'<rect x="{x}" y="40" width="66" height="16" rx="4" fill="{"rgba(34,211,238,.18)" if i == 0 else "#0e1628"}" stroke="{c}" stroke-width="1"/>'
        b += t(x + 33, 51.5, nama, 9.5, "#22d3ee" if i == 0 else AX)
    b += t(70, 74, "pemilih workbench", 9.5, "#22d3ee")
    # Combo view
    b += f'<rect x="20" y="82" width="170" height="150" rx="6" fill="#0a1224" stroke="#243653"/>'
    b += t(105, 96, "Combo View — tab Model", 10, TX, "middle", "600")
    for i, s in enumerate(["📄 Latihan1", "  ▸ Rectangle", "  ▸ Circle", "  ▸ Cut"]):
        b += t(30, 114 + i * 14, s, 9.5, AX if i else TX, "start")
    b += f'<line x1="26" y1="170" x2="184" y2="170" stroke="#243653"/>'
    b += t(30, 184, "Property view", 9.5, "#f59e0b", "start", "600")
    b += t(30, 198, "Data: Length = 120 mm", 9.2, AX, "start")
    b += t(30, 211, "Data: Height = 60 mm", 9.2, AX, "start")
    b += t(30, 224, "View: Line Color …", 9.2, AX, "start")
    # 3D view
    b += f'<rect x="198" y="82" width="452" height="150" rx="6" fill="#050b18" stroke="#243653"/>'
    b += t(424, 96, "Jendela 3D (tampilan model)", 10, TX, "middle", "600")
    b += f'<polygon points="300,200 420,200 420,150 300,150" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="1.5"/>'
    b += f'<circle cx="330" cy="175" r="9" fill="#050b18" stroke="#f59e0b" stroke-width="1.4"/><circle cx="390" cy="175" r="9" fill="#050b18" stroke="#f59e0b" stroke-width="1.4"/>'
    b += f'<line x1="214" y1="220" x2="254" y2="220" stroke="#ef4444" stroke-width="1.6"/><line x1="214" y1="220" x2="214" y2="185" stroke="#22c55e" stroke-width="1.6"/><line x1="214" y1="220" x2="236" y2="204" stroke="#3b82f6" stroke-width="1.6"/>'
    b += t(256, 224, "X", 9, "#ef4444", "start"); b += t(210, 182, "Y", 9, "#22c55e", "end"); b += t(240, 202, "Z", 9, "#3b82f6", "start")
    b += f'<rect x="592" y="92" width="48" height="48" rx="5" fill="#0e1628" stroke="#334155"/>'
    b += t(616, 120, "Top", 9, AX); b += t(616, 154, "kubus navigasi", 8.5, AX)
    # Python console / report
    b += f'<rect x="20" y="238" width="630" height="34" rx="6" fill="#0a1224" stroke="#243653"/>'
    b += t(30, 252, ">>> App.ActiveDocument.Cut.Shape.Area", 9.5, "#00e09e", "start")
    b += t(30, 265, f"{LUAS_BERSIH_CONTOH:.2f}      ← Python console (View → Panels → Python console)", 9.5, AX, "start")
    b += t(335, 292, "Status bar: koordinat kursor, mode navigasi, dan pratinjau perintah", 11, AX)
    return svg(670, 304, b, "Gambar 2 — Tata letak jendela FreeCAD 1.0")


def gambar3():
    b = ""
    kelompok = [("2D & sketsa", ["Draft", "Sketcher"], "Modul 1–4", "#22d3ee"),
                ("Pemodelan 3D", ["Part Design", "Part"], "Modul 5–7", "#f97316"),
                ("Analisis & rakitan", ["FEM", "Assembly"], "Modul 9–12", "#a855f7"),
                ("Dokumentasi & optimasi", ["TechDraw", "Spreadsheet"], "Modul 13–14", "#00e09e")]
    for i, (judul, wb, modul, c) in enumerate(kelompok):
        x = 16 + i * 162
        b += f'<rect x="{x}" y="22" width="150" height="150" rx="10" fill="#0e1628" stroke="{c}" stroke-width="1.6"/>'
        b += t(x + 75, 44, judul, 12, TX, "middle", "600")
        for j, nama in enumerate(wb):
            b += f'<rect x="{x + 18}" y="{60 + j * 36}" width="114" height="26" rx="6" fill="rgba(255,255,255,.03)" stroke="{c}" stroke-opacity=".6"/>'
            b += t(x + 75, 77 + j * 36, nama, 11.5, c)
        b += t(x + 75, 152, modul, 10.5, AX)
    b += t(335, 196, "Satu dokumen .FCStd dapat disentuh banyak workbench; objeknya tetap satu pohon dokumen", 11.5, AX)
    return svg(670, 208, b, "Gambar 3 — Workbench yang dipakai sepanjang mata kuliah")


def _iso(x, y, z, cx=330, cy=150, s=1.35):
    # proyeksi isometrik sederhana untuk gambar statis
    return cx + (x - y) * math.cos(math.radians(30)) * s, cy + (x + y) * math.sin(math.radians(30)) * s - z * s


def gambar4():
    b = ""
    L = 90

    def poly(pts, fill, stroke):
        p = " ".join(f"{px:.1f},{py:.1f}" for px, py in pts)
        return f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"/>'
    b += poly([_iso(0, 0, 0), _iso(L, 0, 0), _iso(L, L, 0), _iso(0, L, 0)], "rgba(34,211,238,.16)", "#22d3ee")
    b += poly([_iso(0, 0, 0), _iso(L, 0, 0), _iso(L, 0, L), _iso(0, 0, L)], "rgba(249,115,22,.10)", "#f97316")
    b += poly([_iso(0, 0, 0), _iso(0, L, 0), _iso(0, L, L), _iso(0, 0, L)], "rgba(168,85,247,.10)", "#a855f7")
    a, bb = 60, 36
    b += poly([_iso(12, 12, 0), _iso(12 + a, 12, 0), _iso(12 + a, 12 + bb, 0), _iso(12, 12 + bb, 0)], "rgba(0,224,158,.35)", "#00e09e")
    for v, c, n in [((130, 0, 0), "#ef4444", "X"), ((0, 130, 0), "#22c55e", "Y"), ((0, 0, 92), "#3b82f6", "Z")]:
        x2, y2 = _iso(*v)
        x1, y1 = _iso(0, 0, 0)
        b += arrow(x1, y1, x2, y2, c, 1.8)
        b += t(x2 + (8 if n != "Y" else -10), y2 + (4 if n != "Z" else -6), n, 12, c, "middle", "700")
    tx, ty = _iso(L, 0, 0)                     # di bawah sudut kanan bidang Top, di antara tepi bidang dan sumbu X
    b += t(tx - 12, ty + 30, "Top (XY)", 11, "#22d3ee", "start")
    tx, ty = _iso(L, 0, L)
    b += t(tx + 8, ty, "Front (XZ)", 11, "#f97316", "start")
    tx, ty = _iso(0, L, L)
    b += t(tx - 8, ty, "Side (YZ)", 11, "#a855f7", "end")
    tx, ty = _iso(12 + a, 12 + bb, 0)          # label di bawah persegi hijau, di dalam bidang Top (bebas dari tepi bidang)
    b += t(_iso(0, 0, 0)[0], ty + 12, "(12, 12) pada Top", 10, "#00e09e", "middle")
    b += teks2(330, 288, "Koordinat (u, v) yang diketik di Draft ditafsirkan pada bidang kerja aktif; Placement menyimpan posisi dan rotasinya di ruang global", 11, AX)
    return svg(660, 314, b, "Gambar 4 — Sistem koordinat global dan tiga bidang kerja Draft")


def gambar6():
    b = ""
    b += f'<rect x="24" y="24" width="250" height="196" rx="10" fill="#0e1628" stroke="#22d3ee" stroke-width="1.6"/>'
    b += t(149, 46, "Latihan1.FCStd  (arsip ZIP)", 12, TX, "middle", "600")
    isi = [("Document.xml", "objek & properti"), ("GuiDocument.xml", "tampilan, kamera"),
           ("PartShape.brp", "geometri BREP"), ("Rectangle.brp · Cut.brp", "…"), ("thumbnails/Thumbnail.png", "pratinjau"),
           ("Latihan1.FCBak", "cadangan (luar arsip)")]
    for i, (n, k) in enumerate(isi):
        y = 68 + i * 24
        c = "#f59e0b" if i == 5 else ("#22d3ee" if i < 2 else AX)
        b += t(40, y, ("📄 " if i < 5 else "🗂 ") + n, 10.5, c, "start")
        b += t(266, y, k, 9, AX, "end")
    b += f'<rect x="326" y="24" width="316" height="196" rx="10" fill="#0e1628" stroke="#00e09e" stroke-width="1.6"/>'
    b += t(484, 46, "Alur menyimpan yang aman", 12, TX, "middle", "600")
    langkah = ["Ctrl+S — simpan .FCStd (sumber tunggal)", "Save As — nama baru bila ganti versi", "Save a Copy — salinan tanpa memindah dokumen",
               "Revert — kembali ke keadaan tersimpan", "Export (STEP/DXF/SVG) — turunan, bukan sumber", "Nama: Tugas1_NIM_T1.FCStd"]
    for i, s in enumerate(langkah):
        y = 70 + i * 24
        b += f'<circle cx="344" cy="{y - 4}" r="8" fill="rgba(0,224,158,.15)" stroke="#00e09e"/>'
        b += t(344, y - 0.5, str(i + 1), 9.5, "#00e09e", "middle", "700")
        b += t(360, y, s, 10.5, TX if i < 5 else "#f59e0b", "start")
    b += arrow(274, 122, 326, 122, AX)
    b += t(333, 244, "Berkas turunan (DXF, STEP, PDF) tidak menyimpan riwayat parametrik; simpan selalu .FCStd-nya", 11, AX)
    return svg(666, 256, b, "Gambar 6 — Isi berkas .FCStd dan alur penyimpanan")


def gambar5():
    b = ""
    s = 2.2
    ox, oy = 90, 224
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    pts = [(0, 0), (W_L, 0), (W_L, T_L), (T_L, T_L), (T_L, H_L), (0, H_L)]
    b += '<polygon points="' + " ".join(f"{X(x):.1f},{Y(y):.1f}" for x, y in pts) + '" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<rect x="{X(0)}" y="{Y(T_L)}" width="{W_L * s}" height="{T_L * s}" fill="rgba(249,115,22,.18)" stroke="#f97316" stroke-dasharray="5 3"/>'
    b += f'<rect x="{X(0)}" y="{Y(H_L)}" width="{T_L * s}" height="{(H_L - T_L) * s}" fill="rgba(168,85,247,.18)" stroke="#a855f7" stroke-dasharray="5 3"/>'
    b += f'<circle cx="{X(W_L / 2)}" cy="{Y(T_L / 2)}" r="4" fill="#f97316"/>'
    b += t(X(W_L / 2) + 8, Y(T_L / 2) + 4, f"A₁ = {ind(A1_L, 0)} mm²", 10, "#f97316", "start")
    b += f'<circle cx="{X(T_L / 2)}" cy="{Y((H_L + T_L) / 2)}" r="4" fill="#a855f7"/>'
    b += t(X(T_L) + 8, Y((H_L + T_L) / 2) + 4, f"A₂ = {ind(A2_L, 0)} mm²", 10.5, "#a855f7", "start")
    b += f'<circle cx="{X(XB_L)}" cy="{Y(YB_L)}" r="5.5" fill="#00e09e" stroke="#fff" stroke-width="1.2"/>'
    b += t(X(XB_L) + 10, Y(YB_L) - 8, f"titik berat ({ind(XB_L, 2)}, {ind(YB_L, 2)})", 11, "#00e09e", "start", "600")
    b += t(X(W_L / 2), oy + 16, f"W = {W_L} mm", 10.5, AX)
    b += t(X(0) - 10, Y(H_L / 2), f"H = {H_L}", 10.5, AX, "end")
    b += t(X(T_L + 4), Y(H_L) - 6, f"t = {T_L}", 10, AX, "start")
    b += t(450, 60, "Shape.CenterOfMass mengembalikan", 11, TX, "start")
    b += t(450, 78, "Vector (x, y, z) titik berat face;", 11, TX, "start")
    b += t(450, 96, "untuk face datar, itu sama dengan", 11, TX, "start")
    b += t(450, 114, "rata-rata luas Persamaan (5).", 11, TX, "start")
    b += t(450, 132, f"x̄₁ = {ind(W_L / 2, 0)}; x̄₂ = {ind(T_L / 2, 1)} (pusat bagian)", 10.5, AX, "start")
    b += t(450, 150, f"x̄ = ({ind(A1_L, 0)}·{ind(W_L / 2, 0)} + {ind(A2_L, 0)}·{ind(T_L / 2, 1)})", 10.5, AX, "start")
    b += t(450, 168, f"     / ({ind(A1_L, 0)} + {ind(A2_L, 0)}) = {ind(XB_L, 3)} mm", 10.5, "#00e09e", "start")
    return svg(670, 250, b, "Gambar 5 — Titik berat profil L sebagai gabungan dua persegi panjang")


def _putus(pts, pola=(8, 3, 2, 3)):
    """Garis sumbu (rantai) sebagai potongan-potongan path nyata di sepanjang polyline pts.

    MuPDF (generator Modul-Word) mengabaikan stroke-dasharray sehingga garis rantai
    tercetak utuh; potongan manual ini tetap putus-putus di peramban maupun di Word.
    """
    d, k, sisa = [], 0, pola[0]
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        L, pos = math.hypot(x2 - x1, y2 - y1), 0.0
        while L - pos > 1e-6:
            step = min(sisa, L - pos)
            if k % 2 == 0:
                a, c = pos / L, (pos + step) / L
                d.append(f"M {x1 + (x2 - x1) * a:.1f} {y1 + (y2 - y1) * a:.1f} L {x1 + (x2 - x1) * c:.1f} {y1 + (y2 - y1) * c:.1f}")
            pos += step
            sisa -= step
            if sisa <= 1e-6:
                k = (k + 1) % len(pola)
                sisa = pola[k]
    return " ".join(d)


def gambar7():
    """Gambar kerja praktik terbimbing (bagian 09): pelat berlubang, pandangan atas bidang Top (XY).

    Ukuran memakai konstanta yang sama dengan teks langkah 3–4 (A_CONTOH, B_CONTOH, D_CONTOH),
    termasuk bentuk tulisannya (pusat A/4 dan 3A/4, radius D/2), jadi gambar dan langkah tidak
    dapat berbeda angka.
    """
    s, ox, oy = 3.6, 120, 272                   # skala px/mm; titik asal (0, 0) = sudut kiri-bawah pelat
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    rp = D_CONTOH / 2 * s                       # jari-jari lubang (px)
    lubang = [(A_CONTOH // 4, B_CONTOH // 2), (3 * A_CONTOH // 4, B_CONTOH // 2)]
    (x1, yl), (x2, _) = lubang
    b = f'<rect x="{X(0):.1f}" y="{Y(B_CONTOH):.1f}" width="{A_CONTOH * s:.1f}" height="{B_CONTOH * s:.1f}" fill="{CY}" fill-opacity=".12" stroke="{CY}" stroke-width="2"/>'
    for cx, cy in lubang:
        b += f'<circle cx="{X(cx):.1f}" cy="{Y(cy):.1f}" r="{rp:.1f}" fill="#0a101f" stroke="{CY}" stroke-width="2"/>'
        sumbu = _putus([(X(cx) - rp - 6, Y(cy)), (X(cx) + rp + 6, Y(cy))]) + " " + _putus([(X(cx), Y(cy) - rp - 5), (X(cx), Y(cy) + rp + 6)])
        b += f'<path d="{sumbu}" fill="none" stroke="{RD}" stroke-width=".8"/>'
        b += t(X(cx), Y(cy) - rp - 13, f"({cx}, {cy})", 10.5, CY, "middle", "600")
    # ukuran pelat (langkah 3)
    b += ext(X(0), Y(B_CONTOH) - 4, X(0), Y(B_CONTOH) - 30) + ext(X(A_CONTOH), Y(B_CONTOH) - 4, X(A_CONTOH), Y(B_CONTOH) - 30)
    b += dim_h(X(0), X(A_CONTOH), Y(B_CONTOH) - 24, f"{A_CONTOH}")
    b += ext(X(A_CONTOH) + 4, Y(B_CONTOH), X(A_CONTOH) + 32, Y(B_CONTOH)) + ext(X(A_CONTOH) + 4, Y(0), X(A_CONTOH) + 32, Y(0))
    b += dim_v(X(A_CONTOH) + 26, Y(B_CONTOH), Y(0), f"{B_CONTOH}", kiri=False)
    # pusat lubang diukur dari titik asal (langkah 4)
    b += ext(X(0), Y(0) + 4, X(0), Y(0) + 62)
    b += ext(X(x1), Y(yl) + rp + 7, X(x1), Y(0) + 36) + ext(X(x2), Y(yl) + rp + 7, X(x2), Y(0) + 62)
    b += dim_h(X(0), X(x1), Y(0) + 30, f"{x1}") + dim_h(X(0), X(x2), Y(0) + 56, f"{x2}")
    b += ext(X(x1) - rp - 7, Y(yl), X(0) - 32, Y(yl)) + ext(X(0) - 4, Y(0), X(0) - 32, Y(0))
    b += dim_v(X(0) - 26, Y(yl), Y(0), f"{yl}")
    # radius lubang: garis penunjuk 45° ke tepi lubang kanan, berlaku untuk kedua lubang
    ca = math.cos(math.radians(45))
    px, py = X(x2) + rp * ca, Y(yl) - rp * ca
    qx, qy = X(x2) + (rp + 24) * ca, Y(yl) - (rp + 24) * ca
    b += _panah(qx, qy, px, py, AM, 1) + f'<line x1="{qx:.1f}" y1="{qy:.1f}" x2="{qx + 12:.1f}" y2="{qy:.1f}" stroke="{AM}" stroke-width="1"/>'
    b += t(qx + 16, qy + 4, f"2× R{D_CONTOH / 2:g}", 11, AM, "start", "600")
    # titik asal dan arah sumbu (langkah 3: sudut pertama 0, 0, 0)
    b += _panah(X(0), Y(0), X(0) + 40, Y(0), RD, 1.6) + _panah(X(0), Y(0), X(0), Y(0) - 40, GN, 1.6)
    b += t(X(0) + 44, Y(0) - 6, "X", 11, RD, "start", "700") + t(X(0) + 7, Y(0) - 42, "Y", 11, GN, "start", "700")
    b += f'<circle cx="{X(0):.1f}" cy="{Y(0):.1f}" r="3" fill="{TX}"/>' + t(X(0) - 8, Y(0) + 17, "(0, 0)", 10.5, TX, "end", "600")
    b += t(664, 22, "Satuan: mm", 10.5, AX, "end") + t(664, 334, "Pandangan atas, bidang Top (XY)", 10.5, AX, "end")
    return svg(680, 346, b, f"Gambar 7 — Gambar kerja pelat {A_CONTOH} × {B_CONTOH} dengan dua lubang")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-cad">CAD &amp; FreeCAD</a>
  <a href="#m-antarmuka">Antarmuka</a>
  <a href="#m-workbench">Workbench</a>
  <a href="#m-navigasi">Navigasi</a>
  <a href="#m-koordinat">Bidang Kerja</a>
  <a href="#m-draft">Menggambar 2D</a>
  <a href="#m-properti">Properti Geometri</a>
  <a href="#m-berkas">Berkas</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,60 62,40 82,52 38,72" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <polygon points="18,60 38,72 38,120 18,108" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.2"/>
      <polygon points="38,72 82,52 82,100 38,120" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.2"/>
      <circle cx="60" cy="86" r="7" fill="none" stroke="rgba(255,179,0,.5)" stroke-width="1.3"/>
      <line x1="14" y1="150" x2="14" y2="196" stroke="rgba(34,197,94,.5)" stroke-width="1.4"/>
      <line x1="14" y1="196" x2="60" y2="196" stroke="rgba(239,68,68,.5)" stroke-width="1.4"/>
      <line x1="14" y1="196" x2="40" y2="176" stroke="rgba(59,130,246,.5)" stroke-width="1.4"/>
      <text x="64" y="199" fill="rgba(239,68,68,.55)" font-family="JetBrains Mono" font-size="8">X</text>
      <text x="8" y="146" fill="rgba(34,197,94,.55)" font-family="JetBrains Mono" font-size="8">Y</text>
      <text x="42" y="172" fill="rgba(59,130,246,.55)" font-family="JetBrains Mono" font-size="8">Z</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="40" width="72" height="40" rx="3" fill="none" stroke="rgba(0,224,158,.45)" stroke-width="1.4"/>
      <circle cx="32" cy="60" r="7" fill="none" stroke="rgba(255,179,0,.45)" stroke-width="1.2"/>
      <circle cx="68" cy="60" r="7" fill="none" stroke="rgba(255,179,0,.45)" stroke-width="1.2"/>
      <line x1="14" y1="30" x2="86" y2="30" stroke="rgba(148,163,184,.45)" stroke-width="1"/>
      <text x="50" y="26" text-anchor="middle" fill="rgba(148,163,184,.5)" font-family="JetBrains Mono" font-size="8">120</text>
      <polyline points="14,110 14,180 40,180 40,130 60,130 60,180 86,180 86,110" fill="none" stroke="rgba(124,77,255,.5)" stroke-width="1.4"/>
      <text x="50" y="205" text-anchor="middle" fill="rgba(124,77,255,.55)" font-family="JetBrains Mono" font-size="8">.FCStd</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="01">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Draft → Rectangle</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">A = n·R²·sin(2π/n)/2</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">.FCStd = ZIP</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">s = r·θ</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Shape.Area</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">V, F = Fit all</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">Top · Front · Side</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">x̄ = ΣAᵢx̄ᵢ / ΣAᵢ</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 1 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Pengenalan</span><br>
      <em>FreeCAD</em><br>
      <span class="hl-amber">&amp; Menggambar 2D</span>
    </h1>
    <p class="hero-sub">Pertemuan pembuka mata kuliah ini memperkenalkan cara berpikir CAD parametrik lewat FreeCAD 1.0: mengenal antarmuka dan workbench, menavigasi pandangan 3D, mengatur bidang kerja dan satuan, menggambar objek 2D dengan Draft Workbench, membaca luas, panjang, dan titik berat langsung dari model, serta mengelola berkas .FCStd dengan tertib. Tugasnya berupa lima model 2D yang diunggah dalam bentuk berkas FreeCAD.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Antarmuka, perintah, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
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

    # 01 — CAD dan FreeCAD
    isi = figure(1, "Posisi model CAD dalam alur perancangan", "Sketsa ide diterjemahkan menjadi model parametrik; gambar kerja, program pemesinan (CAM), dan analisis (CAE) diturunkan dari model yang sama sehingga satu revisi dimensi menjalar ke seluruh dokumen.", gambar1())
    isi += cards([
        ("🧭", "CAD", "Computer Aided Design: perancangan berbantuan komputer. Geometri produk dinyatakan sebagai model digital yang dapat diukur, diubah, dianalisis, dan dikirim ke mesin produksi, bukan sekadar gambar.", ""),
        ("🔗", "Parametrik", "Setiap bentuk dibangun dari fitur yang menyimpan parameternya (panjang, radius, jumlah lubang). Mengubah satu parameter memperbarui seluruh geometri yang bergantung padanya.", "a/4 → lubang ikut bergeser"),
        ("🌳", "Pohon Fitur", "Riwayat pembuatan model disimpan berurutan: sketsa → pad → lubang → fillet. Riwayat itulah yang membuat model bisa disunting kembali kapan saja.", ""),
        ("🧊", "BREP", "Boundary representation: solid disimpan sebagai kumpulan face, edge, dan vertex yang saling berbatas. Dari BREP inilah luas, volume, dan titik berat dihitung.", "face · edge · vertex"),
        ("🆓", "FreeCAD 1.0", "Pemodel parametrik sumber terbuka (LGPL) untuk Windows, macOS, dan Linux. Versi 1.0 (November 2024) membawa Assembly bawaan, penyelesaian masalah topological naming, dan Sketcher yang lebih matang.", ""),
        ("🏭", "Peran Teknik Mesin", "Model CAD menjadi bahasa bersama antara perancang, analis, dan produksi: dari gambar kerja braket sederhana hingga simulasi tegangan dan program CNC.", ""),
    ])
    isi += tabel(["Aspek", "Sketsa tangan / gambar 2D biasa", "Model CAD parametrik"],
                 [["Mengubah satu dimensi", "Gambar ulang bagian yang terpengaruh", "Ubah satu angka; geometri terkait diperbarui otomatis"],
                  ["Luas, volume, titik berat", "Dihitung manual dari rumus", "Dibaca langsung dari properti Shape"],
                  ["Konsistensi antar-pandangan", "Rawan tidak sinkron", "Semua pandangan diturunkan dari satu model"],
                  ["Dipakai ulang", "Sulit; sering digambar ulang", "Salin, ubah parameter, jadi varian baru"],
                  ["Ke produksi", "Perlu diterjemahkan operator", "Ekspor DXF/STEP/STL langsung ke mesin"]])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> Sketchpad karya Ivan Sutherland (1963) memperkenalkan gambar interaktif dengan konstrain; AutoCAD (1982) membawa CAD 2D ke komputer pribadi; Pro/ENGINEER (1987) mempopulerkan pemodelan parametrik berbasis fitur yang kini menjadi standar (SolidWorks, Inventor, Fusion 360, FreeCAD). FreeCAD dimulai Jürgen Riegel tahun 2002 di atas kernel geometri Open CASCADE dan mencapai versi 1.0 pada 2024.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Mata Kuliah Ini:</strong> Pertemuan 1–4 membangun <em>keterampilan 2D</em> (Draft dan Sketcher, dimensi, anotasi). Pertemuan 5–7 masuk ke <em>pemodelan 3D</em> (Part Design: pad, revolve, sweep) dan proyek gabungan. Setelah UTS, model dipakai untuk <em>simulasi, perakitan, dan optimasi</em>. Setiap tugas modul menghasilkan berkas .FCStd yang diunggah langsung di halaman ini dan diperiksa lewat angka bacaan dari FreeCAD.")
    m += bagian(1, "m-cad", "Apa Itu CAD<br>dan Mengapa FreeCAD", "CAD mengubah gambar menjadi model yang dapat diukur dan disunting. Bagian ini menempatkan model CAD dalam alur perancangan, menjelaskan arti parametrik, dan memperkenalkan FreeCAD 1.0 sebagai alat yang dipakai sepanjang semester.", isi, "APA ITU CAD")

    # 02 — Antarmuka
    isi = figure(2, "Tata letak jendela FreeCAD 1.0", "Toolbar dan pemilih workbench di atas; Combo View (pohon dokumen dan properti) di kiri; jendela 3D di tengah dengan kubus navigasi; Python console dan Report view di bawah.", gambar2())
    isi += tabel(["Panel", "Isi", "Cara membuka bila tersembunyi"],
                 [["Tree view", "Pohon dokumen: daftar objek dan hierarkinya (Body, Sketch, Cut, …)", "View → Panels → Tree view"],
                  ["Property view", "Tab <strong>Data</strong> (geometri: Length, Radius, Placement) dan <strong>View</strong> (warna, garis, visibilitas)", "View → Panels → Property view"],
                  ["Tasks", "Dialog perintah yang sedang berjalan: masukan koordinat Draft, konstrain Sketcher", "Otomatis saat perintah aktif"],
                  ["Jendela 3D", "Tampilan model; kubus navigasi di pojok untuk pandangan baku", "Selalu ada; Ctrl+Tab berpindah dokumen"],
                  ["Python console", "Baris perintah untuk membaca properti dan menjalankan skrip", "View → Panels → Python console"],
                  ["Report view", "Pesan, peringatan, dan galat dari perintah", "View → Panels → Report view"],
                  ["Status bar", "Koordinat kursor, mode navigasi, pratinjau seleksi", "View → Status bar"]])
    isi += cards([
        ("🧩", "Combo View", "Dalam tata letak bawaan, Tree view dan Property view digabung pada tab <em>Model</em>, sedangkan dialog perintah muncul pada tab <em>Tasks</em>. Bila panel tertutup tak sengaja, pulihkan lewat View → Panels.", ""),
        ("🖱️", "Seleksi", "Klik memilih objek atau sub-elemen (face, edge, vertex); Ctrl+klik menambah seleksi; klik area kosong membatalkan. Nama yang terpilih tampil di status bar dan Selection view.", "Ctrl + klik"),
        ("⌨️", "Perintah dasar", "Ctrl+N dokumen baru, Ctrl+S simpan, Ctrl+Z/Ctrl+Y batal/ulang, Delete hapus, Spasi sembunyikan/tampilkan objek terpilih, Esc batalkan perintah.", "Spasi = toggle visibilitas"),
    ])
    isi += kotak("warning-box", "⚠️ <strong>Kesalahan umum:</strong> panel hilang karena terseret keluar, lalu dianggap FreeCAD rusak. Tidak perlu memasang ulang; buka View → Panels dan centang panel yang hilang, atau Tools → Preferences → General → <em>Reset</em> tata letak.")
    m += bagian(2, "m-antarmuka", "Antarmuka<br>FreeCAD", "Sebelum menggambar, kenali tempat setiap informasi berada: objek di pohon dokumen, angka di Property view, dialog di Tasks, dan pesan di Report view. Bagian ini memetakan seluruh panel yang akan dipakai.", isi, "ANTARMUKA FREECAD")

    # 03 — Workbench dan workspace
    isi = figure(3, "Workbench yang dipakai sepanjang mata kuliah", "Setiap workbench memuat alat untuk satu jenis pekerjaan; dokumen yang sama dapat dibuka bergantian di beberapa workbench.", gambar3())
    isi += tabel(["Workbench", "Kegunaan", "Dipakai pada"],
                 [["<strong>Draft</strong>", "Menggambar 2D pada bidang kerja: garis, persegi panjang, lingkaran, busur, poligon, teks, dimensi; menyunting (move, rotate, scale, offset, trimex)", "Modul 1–4"],
                  ["<strong>Sketcher</strong>", "Sketsa 2D terkonstrain (dimensi dan hubungan geometris) sebagai dasar fitur 3D", "Modul 3–5"],
                  ["<strong>Part Design</strong>", "Pemodelan solid berbasis fitur: Pad, Pocket, Revolution, Sweep, Fillet, Chamfer", "Modul 5–7"],
                  ["<strong>Part</strong>", "Primitif dan operasi Boolean (Cut, Fuse, Common) pada bentuk apa pun, termasuk face 2D", "Modul 1 (Cut), 5–7"],
                  ["<strong>TechDraw</strong>", "Gambar kerja: proyeksi, potongan, dimensi, kepala gambar, ekspor PDF/DXF", "Modul 4, 13"],
                  ["<strong>Spreadsheet</strong>", "Parameter desain terpusat yang diikat ke dimensi lewat ekspresi", "Modul 13–14"],
                  ["<strong>FEM</strong>", "Simulasi tegangan, termal, dan modal dengan CalculiX", "Modul 9–11"],
                  ["<strong>Assembly</strong>", "Perakitan komponen dengan joint (bawaan sejak 1.0)", "Modul 12"]])
    isi += kotak("info-box", "<strong>🛠️ Pengaturan workspace yang dipakai di kelas</strong> (Edit → Preferences): <em>General → Units</em>: <strong>Standard (mm/kg/s/degree)</strong>, desimal 2–4; <em>Navigation → 3D View</em>: gaya navigasi <strong>CAD</strong>, orbit <em>Turntable</em>; <em>General → General</em>: bahasa boleh Indonesia atau Inggris, tetapi nama perintah pada modul ini mengikuti antarmuka Inggris agar sama dengan dokumentasi; <em>Display → Part/Part Design</em>: tampilkan grid bila perlu. Simpan preferensi sekali; ia berlaku untuk semua dokumen.")
    isi += anim_panel(1, "cyan", "Navigasi pandangan 3D: azimut, elevasi, zoom", "cvNavigasi",
                      [("sl_nv_az", "v_nv_az", "Azimut (putar sekeliling Z)", 0, 360, 1, 35, "35°"),
                       ("sl_nv_el", "v_nv_el", "Elevasi (miring)", -80, 80, 1, 30, "30°"),
                       ("sl_nv_zoom", "v_nv_zoom", "Zoom", 0.5, 2.5, 0.05, 1.2, "1,20×")],
                      "btnNavigasi", "toggleNavigasi", "navigasiInfo",
                      "<strong>Cara membaca:</strong> braket L diputar otomatis (PAUSE untuk menghentikan). Geser <em>elevasi</em> ke 80° untuk mendekati pandangan <em>Top</em> (tombol 2 di FreeCAD), ke 0° untuk <em>Front</em> (tombol 1), dan biarkan sekitar 30° untuk isometrik (tombol 0). Zoom hanya mengubah skala tampilan, bukan ukuran model: dimensi tetap 100 × 80 mm.")
    m += bagian(3, "m-workbench", "Workbench dan<br>Pengaturan Workspace", "FreeCAD menata alatnya dalam workbench. Bagian ini menunjukkan workbench mana yang dipakai di tiap pertemuan dan pengaturan preferensi yang perlu disamakan sebelum mengerjakan tugas.", isi, "WORKBENCH DAN WORKSPACE")

    # 04 — Navigasi dan perintah dasar
    isi = tabel(["Aksi", "Gaya navigasi CAD (mouse)", "Keyboard / alternatif"],
                [["Pilih", "Klik kiri", "Ctrl+klik menambah seleksi"],
                 ["Zoom", "Roda mouse", "Ctrl + roda untuk langkah halus; V lalu F: Fit all"],
                 ["Pan (geser)", "Tahan tombol tengah, geser", "Ctrl + tombol kanan"],
                 ["Putar (rotate)", "Tahan tengah, lalu tekan kiri dan geser", "Ctrl + tombol kanan... atau kubus navigasi"],
                 ["Pandangan baku", "Klik sisi kubus navigasi", "0 isometrik · 1 Front · 2 Top · 3 Right · 4 Rear · 5 Bottom · 6 Left"],
                 ["Ortografis / perspektif", "View → Orthographic / Perspective", "V lalu O / V lalu P"],
                 ["Menu konteks", "Klik kanan pada objek", "Set colors, Hide, Toggle navigation"]])
    isi += tabel(["Pintasan", "Fungsi", "Catatan"],
                 [["Ctrl+N / Ctrl+O / Ctrl+S", "Dokumen baru / buka / simpan", "Ctrl+Shift+S: Save As"],
                  ["Ctrl+Z / Ctrl+Y", "Batalkan / ulangi", "Riwayat tak terbatas dalam sesi"],
                  ["Delete", "Hapus objek terpilih", "Objek turunan (mis. Cut) ikut terpengaruh"],
                  ["Spasi", "Sembunyikan/tampilkan objek terpilih", "Objek tersembunyi tetap ada di dokumen"],
                  ["Esc", "Batalkan perintah yang berjalan", "Juga membatalkan seleksi"],
                  ["Ctrl+Tab", "Berpindah antar dokumen terbuka", ""],
                  ["Ctrl+Shift+R", "Refresh (recompute) dokumen", "Wajib setelah mengubah properti lewat skrip"]])
    isi += kotak("tip-box", "💡 <strong>Pola kerja yang sehat:</strong> setiap kali menyelesaikan satu objek, tekan <strong>V lalu F</strong> agar seluruh model terlihat, periksa namanya di pohon dokumen, lalu <strong>Ctrl+S</strong>. Tiga refleks kecil ini menghindarkan model yang “hilang” (padahal hanya di luar layar) dan pekerjaan yang lenyap saat FreeCAD tertutup.")
    m += bagian(4, "m-navigasi", "Navigasi Pandangan<br>dan Perintah Dasar", "Mengendalikan kamera dengan lancar adalah syarat bekerja cepat di CAD. Bagian ini merangkum gaya navigasi CAD, pandangan baku, dan pintasan yang dipakai setiap hari.", isi, "NAVIGASI DAN PERINTAH DASAR")

    # 05 — Koordinat dan bidang kerja
    isi = figure(4, "Sistem koordinat global dan tiga bidang kerja Draft", "Draft menggambar pada bidang kerja aktif; angka yang diketik di panel Tasks adalah koordinat pada bidang itu, sedangkan Placement objek menyimpan posisi globalnya.", gambar4())
    isi += formula(1, "Jarak Dua Titik pada Bidang Kerja", r"d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
                   r"\(d\) = jarak (mm) &nbsp;·&nbsp; \((x_1, y_1)\), \((x_2, y_2)\) = koordinat dua titik pada bidang kerja. Dipakai untuk memeriksa panjang segmen Draft Line atau jarak antar-pusat lubang.",
                   "Rumus Pythagoras yang sama dipakai FreeCAD saat menampilkan panjang segmen di panel Tasks. Bila hasil <em>Shape.Length</em> tidak sama dengan hitungan tangan, biasanya titik akhir tersangkut ke titik snap yang tidak diinginkan.",
                   [("d", "Jarak antara dua titik (mm)"), ("x_1, y_1", "Koordinat titik pertama"), ("x_2, y_2", "Koordinat titik kedua")])
    isi += cards([
        ("📐", "Bidang kerja (working plane)", "Draft → <em>Working plane</em>: Top (XY), Front (XZ), Side (YZ), atau <em>Auto</em> yang mengikuti pandangan; dapat juga diambil dari face objek. Semua tugas Modul 1 memakai <strong>Top (XY)</strong>.", "Top · Front · Side"),
        ("🧲", "Snap dan grid", "Snap menempelkan kursor ke titik penting: endpoint, midpoint, center, perpendicular, intersection. Grid Draft (jarak baku 1 mm × 10 garis) membantu menempatkan objek; matikan snap yang mengganggu lewat toolbar Snap.", ""),
        ("📍", "Placement", "Setiap objek punya properti <em>Placement</em>: Base (posisi x, y, z) dan Rotation (sumbu dan sudut). Menggeser objek mengubah Placement, bukan geometri dasarnya.", "Base + Rotation"),
        ("⌨️", "Memasukkan koordinat", "Pada panel Tasks, ketik X, tekan Enter, ketik Y, Enter, Z, Enter. Centang <em>Relative</em> agar koordinat dihitung dari titik sebelumnya, atau matikan untuk koordinat global.", "X ⏎ Y ⏎ Z ⏎"),
    ])
    isi += anim_panel(2, "amber", "Bidang kerja Draft dan pemetaan koordinat", "cvBidang",
                      [("sl_bd_plane", "v_bd_plane", "Bidang kerja (0 Top · 1 Front · 2 Side)", 0, 2, 1, 0, "Top (XY)"),
                       ("sl_bd_a", "v_bd_a", "Panjang a (mm)", 40, 110, 1, 80, "80"),
                       ("sl_bd_b", "v_bd_b", "Lebar b (mm)", 20, 100, 1, 50, "50")],
                      "btnBidang", "toggleBidang", "bidangInfo",
                      "<strong>Cara membaca:</strong> persegi panjang yang sama (a × b) digambar pada bidang yang berbeda. Koordinat 2D yang Anda ketik tidak berubah, tetapi posisi globalnya berubah mengikuti bidang. Inilah sebabnya tugas selalu menyebut bidang kerja yang harus aktif.")
    m += bagian(5, "m-koordinat", "Sistem Koordinat<br>dan Bidang Kerja", "Semua objek 2D di Draft hidup pada sebuah bidang kerja. Bagian ini menjelaskan hubungan koordinat bidang kerja dengan koordinat global, peran Placement, serta snap dan grid yang membantu menempatkan titik dengan tepat.", isi, "KOORDINAT DAN BIDANG KERJA")

    # 06 — Menggambar 2D dengan Draft
    isi = tabel(["Alat Draft", "Masukan di panel Tasks", "Hasil dan properti penting"],
                [["Line", "Dua titik (klik atau ketik koordinat)", "Objek Wire dua titik; <em>Length</em>, <em>Start</em>, <em>End</em>"],
                 ["Polyline (Wire)", "Rangkaian titik; <em>Close</em> menutup kontur", "Wire; bila tertutup dan <em>Make Face</em> aktif → face dengan <em>Area</em>"],
                 ["Rectangle", "Dua sudut berlawanan, atau sudut + Length/Height", "Rectangle: <em>Length</em>, <em>Height</em>, <em>Area</em>, <em>Make Face</em>"],
                 ["Circle", "Pusat + radius", "Circle: <em>Radius</em>, <em>Area</em>; sudut awal/akhir 0–360°"],
                 ["Arc", "Pusat, radius, sudut awal, sudut akhir", "Circle dengan <em>FirstAngle</em>/<em>LastAngle</em>; panjang lewat Shape.Length"],
                 ["Polygon", "Pusat, jumlah sisi, radius; DrawMode <em>inscribed</em> (bawaan: titik sudut pada lingkaran) atau <em>circumscribed</em> (sisi menyinggung lingkaran)", "Polygon: <em>FacesNumber</em>, <em>Radius</em>, <em>Area</em>"],
                 ["Ellipse / B-spline / Bézier", "Sumbu / titik kendali", "Kurva halus untuk kontur bebas"],
                 ["Move · Rotate · Scale · Offset · Trimex", "Pilih objek, lalu titik acuan", "Menyunting objek yang sudah ada (dibahas Modul 2–3)"]])
    isi += formula(2, "Luas Poligon Beraturan", r"A = \tfrac{1}{2}\, n\, R^{2} \sin\!\left(\tfrac{2\pi}{n}\right)",
                   r"\(n\) = jumlah sisi &nbsp;·&nbsp; \(R\) = radius lingkaran luar (circumscribed) &nbsp;·&nbsp; \(A\) = luas (mm²). Contoh heksagon \(R = 40\) mm: \(A = " + ind(POLI_CONTOH, 2) + r"\) mm².",
                   "Poligon beraturan adalah n segitiga sama kaki dengan dua sisi R dan sudut puncak 2π/n. Draft Polygon memakai DrawMode <em>inscribed</em> sebagai bawaan (titik-titik sudut tepat pada lingkaran radius R), sesuai rumus ini; bila DrawMode diubah ke <em>circumscribed</em>, sisi poligon menyinggung lingkaran dan luasnya lebih besar, n·R²·tan(π/n).",
                   [("A", "Luas poligon (mm²)"), ("n", "Jumlah sisi"), ("R", "Radius lingkaran luar (mm)")])
    isi += formula(3, "Panjang Busur Lingkaran", r"s = r\,\theta, \qquad \theta \text{ dalam radian}",
                   r"\(r\) = radius busur &nbsp;·&nbsp; \(\theta\) = sudut pusat. Contoh \(r = " + str(R_BUSUR) + r"\) mm, \(\theta = " + str(TH_BUSUR) + r"^\circ = " + ind(math.radians(TH_BUSUR), 4) + r"\) rad: \(s = " + ind(BUSUR_CONTOH, 3) + r"\) mm.",
                   "Draft Arc menyimpan sudut dalam derajat (FirstAngle, LastAngle), sedangkan rumus memakai radian; kalikan derajat dengan π/180. Shape.Length pada busur mengembalikan s ini, bukan keliling lingkaran penuh.",
                   [("s", "Panjang busur (mm)"), ("r", "Radius (mm)"), (r"\theta", "Sudut pusat (rad)")])
    isi += formula(4, "Luas Bersih Pelat Berlubang", r"A_{bersih} = a\,b - \sum_i \tfrac{\pi}{4} d_i^{2}",
                   r"\(a, b\) = panjang dan lebar pelat &nbsp;·&nbsp; \(d_i\) = diameter tiap lubang. Contoh pelat " + f"{A_CONTOH} × {B_CONTOH}" + r" mm dengan dua lubang ⌀" + str(D_CONTOH) + r": \(A_{bersih} = " + ind(LUAS_BERSIH_CONTOH, 2) + r"\) mm².",
                   "Part → Boolean → Cut membuang face lingkaran dari face persegi panjang; luas hasilnya persis rumus ini. Bila lubang keluar dari tepi pelat, luas yang terbuang lebih kecil dari πd²/4 dan rumus tidak lagi berlaku.",
                   [("A_{bersih}", "Luas face hasil Cut (mm²)"), ("a, b", "Panjang dan lebar pelat (mm)"), ("d_i", "Diameter lubang ke-i (mm)")])
    isi += anim_panel(3, "green", "Primitif Draft: persegi panjang, lingkaran, poligon", "cvDraft",
                      [("sl_dr_bentuk", "v_dr_bentuk", "Bentuk (0 Rectangle · 1 Circle · 2 Polygon)", 0, 2, 1, 0, "Rectangle"),
                       ("sl_dr_a", "v_dr_a", "a: panjang / diameter (mm)", 30, 160, 1, 100, "100"),
                       ("sl_dr_b", "v_dr_b", "b: lebar persegi panjang (mm)", 20, 120, 1, 60, "60"),
                       ("sl_dr_n", "v_dr_n", "n: jumlah sisi poligon", 3, 12, 1, 6, "6")],
                      "btnDraft", "toggleDraft", "draftInfo",
                      "<strong>Cara membaca:</strong> goresan digambar segmen demi segmen seperti Draft; angka <em>Area</em> dan <em>Shape.Length</em> di atas kanvas adalah nilai yang akan Anda baca di FreeCAD untuk bentuk yang sama. Bandingkan dengan Persamaan (2) untuk poligon dan πr² untuk lingkaran.")
    isi += kotak("warning-box", "⚠️ <strong>Make Face:</strong> properti Area hanya ada bila objek berupa face. Untuk Rectangle, Circle, Polygon, dan Wire tertutup, pastikan <em>Make Face = true</em> di tab Data. Wire terbuka tidak punya luas, dan Shape.Length pada face tertutup adalah kelilingnya.")
    m += bagian(6, "m-draft", "Menggambar Objek 2D<br>dengan Draft Workbench", "Draft adalah papan gambar 2D FreeCAD. Bagian ini membahas alat pembentuk objek 2D, cara memasukkan ukuran dengan tepat, serta rumus luas dan panjang yang dipakai untuk memeriksa hasil gambar.", isi, "MENGGAMBAR 2D DENGAN DRAFT")

    # 07 — Membaca properti geometri
    isi = figure(5, "Titik berat profil L sebagai gabungan dua persegi panjang", f"Profil L {W_L} × {H_L} mm dengan tebal {T_L} mm dibagi menjadi dua persegi panjang; titik berat gabungan adalah rata-rata tertimbang luas.", gambar5())
    isi += formula(5, "Titik Berat Gabungan Beberapa Luasan", r"\bar{x} = \frac{\sum_i A_i\,\bar{x}_i}{\sum_i A_i}, \qquad \bar{y} = \frac{\sum_i A_i\,\bar{y}_i}{\sum_i A_i}",
                   r"\(A_i\) = luas bagian ke-i &nbsp;·&nbsp; \((\bar{x}_i, \bar{y}_i)\) = titik berat bagian itu. Contoh profil L di atas: \(\bar{x} = " + ind(XB_L, 3) + r"\) mm, \(\bar{y} = " + ind(YB_L, 3) + r"\) mm.",
                   "FreeCAD menghitung titik berat langsung dari face (Shape.CenterOfMass). Rumus ini berguna untuk memeriksa angka tersebut dan menjadi dasar sifat penampang (momen inersia) yang dipakai pada mata kuliah mekanika.",
                   [(r"\bar{x}, \bar{y}", "Koordinat titik berat gabungan (mm)"), ("A_i", "Luas bagian ke-i (mm²)"), (r"\bar{x}_i, \bar{y}_i", "Titik berat bagian ke-i (mm)")])
    isi += tabel(["Besaran", "Lewat antarmuka", "Lewat Python console"],
                 [["Panjang, lebar, radius", "Tab Data: Length, Height, Radius", "<code>obj.Length</code>, <code>obj.Radius</code>"],
                  ["Luas face", "Tab Data: <strong>Area</strong> (objek Draft ber-face) atau Std Measure → Area", "<code>obj.Shape.Area</code>"],
                  ["Keliling / panjang busur", "Std Measure → Length (pilih edge)", "<code>obj.Shape.Length</code>"],
                  ["Volume solid", "Std Measure → Volume", "<code>obj.Shape.Volume</code>"],
                  ["Titik berat", "— (tidak ada di GUI)", "<code>obj.Shape.CenterOfMass</code> → Vector(x, y, z)"],
                  ["Kotak pembatas", "—", "<code>obj.Shape.BoundBox</code> (XLength, YLength, ZLength)"],
                  ["Jarak dua elemen", "Std Measure → Distance", "<code>edge1.distToShape(edge2)</code>"]])
    isi += kotak("info-box", "<strong>🧪 Std Measure (FreeCAD 1.0):</strong> alat ukur terpadu di toolbar (ikon penggaris) dengan mode Length, Distance, Angle, Area, Radius, dan Volume. Pilih modenya, klik elemen, dan hasilnya tampil di jendela 3D. Python console tetap diperlukan untuk titik berat dan untuk mencatat angka dengan presisi penuh.")
    isi += kode("Python console — membuat persegi panjang dan membaca luas", f'''import FreeCAD as App, Draft
doc = App.newDocument("Latihan1")
r = Draft.make_rectangle({A_CONTOH}, {B_CONTOH})     # panjang searah X, lebar searah Y (mm), sudut di (0, 0)
r.MakeFace = True
doc.recompute()                          # wajib: properti Shape dihitung saat recompute
print(f"Luas     = {{r.Shape.Area:.2f}} mm^2")   # {A_CONTOH} x {B_CONTOH} = {ind(A_CONTOH * B_CONTOH, 2)}
print(f"Keliling = {{r.Shape.Length:.2f}} mm")''', "Python (FreeCAD)")
    isi += kode("Python console — busur dan poligon beraturan", f'''import FreeCAD as App, Draft, math
doc = App.ActiveDocument
c = Draft.make_circle({R_BUSUR}, startangle=0, endangle={TH_BUSUR})   # busur r = {R_BUSUR} mm, 0-{TH_BUSUR} derajat
p = Draft.make_polygon({N_POLI}, radius={R_POLI})                    # heksagon, radius lingkaran luar {R_POLI} mm
doc.recompute()
print(f"Panjang busur = {{c.Shape.Length:.3f}} mm  (rumus r*theta = {{{R_BUSUR}*math.radians({TH_BUSUR}):.3f}})")
print(f"Luas poligon  = {{p.Shape.Area:.2f}} mm^2 (rumus = {{{N_POLI}*{R_POLI}**2*math.sin(2*math.pi/{N_POLI})/2:.2f}})")''', "Python (FreeCAD)")
    isi += kode("Python console — titik berat, kotak pembatas, dan daftar objek", f'''import FreeCAD as App, Draft
doc = App.ActiveDocument
V = App.Vector
titik = [V(0, 0, 0), V({W_L}, 0, 0), V({W_L}, {T_L}, 0), V({T_L}, {T_L}, 0), V({T_L}, {H_L}, 0), V(0, {H_L}, 0)]
w = Draft.make_wire(titik, closed=True, face=True)        # profil L tertutup ber-face
doc.recompute()
cm = w.Shape.CenterOfMass
print(f"Luas = {{w.Shape.Area:.2f}} mm^2, titik berat = ({{cm.x:.3f}}, {{cm.y:.3f}})")   # ({ind(XB_L, 3)}, {ind(YB_L, 3)})
bb = w.Shape.BoundBox
print(f"Kotak pembatas {{bb.XLength:.1f}} x {{bb.YLength:.1f}} mm")
for o in doc.Objects:                                     # semua objek pada pohon dokumen
    luas = round(o.Shape.Area, 2) if hasattr(o, "Shape") else "-"
    print(o.Name, o.TypeId, luas)''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell di atas pada Python console FreeCAD dan pastikan angkanya sama dengan yang tercetak di komentar (luas " + ind(A_CONTOH * B_CONTOH, 2) + " mm², busur " + ind(BUSUR_CONTOH, 3) + " mm, heksagon " + ind(POLI_CONTOH, 2) + " mm², titik berat x̄ = " + ind(XB_L, 3) + " mm). Bila berbeda, periksa satuan (Preferences → Units) dan pastikan <em>doc.recompute()</em> sudah dipanggil.")
    m += bagian(7, "m-properti", "Membaca Properti<br>Geometri dari Model", "Keunggulan CAD adalah angka yang langsung tersedia dari model. Bagian ini menunjukkan cara membaca luas, panjang, titik berat, dan kotak pembatas lewat antarmuka maupun Python console, disertai rumus untuk memeriksanya.", isi, "MEMBACA PROPERTI GEOMETRI")

    # 08 — Manajemen berkas
    isi = figure(6, "Isi berkas .FCStd dan alur penyimpanan", "Berkas FreeCAD adalah arsip ZIP berisi XML dokumen dan geometri BREP; berkas turunan (DXF, STEP) hanya memuat geometri tanpa riwayat.", gambar6())
    isi += tabel(["Format", "Ekstensi", "Kegunaan", "Parametrik?"],
                 [["FreeCAD Standard", ".FCStd", "Sumber tunggal: objek, riwayat, tampilan", "Ya"],
                  ["STEP (AP214/AP242)", ".step / .stp", "Tukar solid antar-CAD (SolidWorks, Inventor, Fusion)", "Tidak (geometri saja)"],
                  ["IGES", ".iges / .igs", "Tukar permukaan/kurva, format lama", "Tidak"],
                  ["STL", ".stl", "Mesh segitiga untuk cetak 3D", "Tidak"],
                  ["DXF", ".dxf", "Gambar 2D untuk laser/plasma cutting dan AutoCAD", "Tidak"],
                  ["SVG", ".svg", "Gambar 2D vektor untuk dokumen dan web", "Tidak"],
                  ["PDF (TechDraw)", ".pdf", "Gambar kerja siap cetak", "Tidak"]])
    isi += cards([
        ("💾", "Simpan sering, satu sumber", "Ctrl+S menulis .FCStd; FreeCAD membuat cadangan .FCBak (jumlahnya diatur di Preferences → General → Document). Ekspor DXF/STEP dilakukan <em>dari</em> .FCStd, bukan menggantikannya.", ""),
        ("🏷️", "Penamaan", "Nama berkas yang konsisten memudahkan pemeriksaan: <code>Tugas1_NIM_T3.FCStd</code>. Hindari spasi dan karakter khusus; server tugas hanya menerima huruf, angka, titik, garis bawah, dan tanda hubung.", "Tugas1_NIM_T3.FCStd"),
        ("🔄", "Revert dan versi", "File → Revert membuang perubahan sejak simpan terakhir. Untuk varian desain, Save As dengan nama baru (v2, v3) agar versi lama tetap bisa dibuka.", ""),
        ("🗜️", "Arsip ZIP", "Karena .FCStd adalah ZIP, ia bisa dibuka pengarsip apa pun untuk melihat Document.xml. Server tugas memeriksa tanda ini untuk menolak berkas lain yang hanya diganti ekstensinya.", "Document.xml"),
    ])
    isi += anim_panel(4, "violet", "Model parametrik: pelat berlubang yang mengikuti dimensi", "cvParametrik",
                      [("sl_pm_a", "v_pm_a", "Panjang pelat a (mm)", 100, 220, 1, 150, "150"),
                       ("sl_pm_b", "v_pm_b", "Lebar pelat b (mm)", 50, 120, 1, 70, "70"),
                       ("sl_pm_d", "v_pm_d", "Diameter lubang d (mm)", 8, 30, 1, 16, "16")],
                      "btnParametrik", "toggleParametrik", "parametrikInfo",
                      "<strong>Cara membaca:</strong> pusat lubang diikat ke a/4 dan 3a/4, sehingga mengubah <em>a</em> memindahkan lubang tanpa digambar ulang; pohon dokumen di kanan menunjukkan objek mana yang dihitung ulang. Luas Cut001 mengikuti Persamaan (4) dan menjadi pola Tugas 4.")
    m += bagian(8, "m-berkas", "Manajemen Berkas<br>dan Format Pertukaran", "Model yang baik tidak berguna bila berkasnya tercecer. Bagian ini menjelaskan isi .FCStd, alur simpan yang aman, penamaan, dan format ekspor yang dipakai bengkel dan CAD lain.", isi, "MANAJEMEN BERKAS")

    # 09 — Praktik terbimbing
    langkah = [("1", "Siapkan dokumen", "File → New (Ctrl+N). Pilih workbench <strong>Draft</strong>. Periksa Preferences → General → Units = Standard (mm). Tekan <strong>2</strong> untuk pandangan Top."),
               ("2", "Atur bidang kerja", "Toolbar Draft → tombol working plane → pilih <strong>Top (XY)</strong>. Pastikan snap <em>endpoint</em> dan <em>center</em> aktif, snap lain boleh dimatikan."),
               ("3", "Gambar pelat", f"Draft → Rectangle. Ketik 0 ⏎ 0 ⏎ 0 ⏎ untuk sudut pertama, lalu masukkan Length {A_CONTOH} dan Height {B_CONTOH} pada panel Tasks. Di tab Data, pastikan <em>Make Face = true</em>."),
               ("4", "Gambar lubang", f"Draft → Circle. Pusat ({A_CONTOH // 4}, {B_CONTOH // 2}) radius {D_CONTOH / 2:g}; ulangi untuk pusat ({3 * A_CONTOH // 4}, {B_CONTOH // 2}). Nama objek: Circle dan Circle001."),
               ("5", "Buang lubang", "Pindah ke workbench <strong>Part</strong>. Pilih Rectangle, Ctrl+klik Circle → Part → Boolean → Cut. Pilih Cut, Ctrl+klik Circle001 → Cut lagi. Hasil: Cut001."),
               ("6", "Baca luas", f"Buka Python console: <code>App.ActiveDocument.Cut001.Shape.Area</code> → {ind(LUAS_BERSIH_CONTOH, 2)} mm². Bandingkan dengan Persamaan (4)."),
               ("7", "Simpan dan periksa", "Ctrl+S → <code>Latihan1_NIM.FCStd</code>. Buka berkas dengan pengarsip ZIP dan pastikan ada Document.xml. Berkas seperti inilah yang diunggah pada tab Tugas.")]
    isi = figure(7, "Benda kerja praktik terbimbing: pelat berlubang", "Pandangan atas pada bidang Top (XY), satuan mm. Sudut kiri-bawah pelat berada di titik asal (0, 0); ukuran pelat diketik pada langkah 3, pusat dan radius kedua lubang pada langkah 4, lalu kedua lubang dibuang dengan Cut pada langkah 5.", gambar7())
    isi += '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["Properti Area tidak ada", "Make Face = false atau wire tidak tertutup", "Set Make Face = true; pada Polyline pilih Close"],
                  ["Angka luas 100× lebih besar/kecil", "Satuan preferensi cm atau inci", "Preferences → General → Units → Standard (mm/kg/s)"],
                  ["Objek digambar di bidang lain", "Working plane Auto mengikuti pandangan", "Tetapkan Top (XY) sebelum menggambar"],
                  ["Cut menghasilkan objek kosong", "Urutan seleksi terbalik (tool dulu, base kemudian)", "Pilih base (Rectangle) dulu, lalu tool (Circle)"],
                  ["Lubang tidak terpotong", "Lingkaran bukan face (Make Face false)", "Aktifkan Make Face pada Circle sebelum Cut"],
                  ["Berkas ditolak saat unggah", "Ekstensi bukan .FCStd atau berkas bukan arsip FreeCAD", "Simpan lewat Ctrl+S (bukan Export); nama tanpa spasi"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah tugas:</strong> (1) bidang kerja Top (XY); (2) satuan mm; (3) semua objek ber-face; (4) angka bacaan disalin dari FreeCAD dengan minimal dua desimal, memakai titik atau koma; (5) berkas .FCStd tersimpan lewat Ctrl+S dan namanya tanpa spasi; (6) berkas dan angka dikirim untuk varian <strong>N</strong> Anda sendiri, karena setiap tugas memuat angka yang berbeda per NIM.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Pelat Berlubang", "Tujuh langkah berikut merangkai seluruh bagian sebelumnya menjadi satu model 2D lengkap, dari dokumen baru sampai berkas yang siap diunggah, disertai tabel gejala dan perbaikan untuk kesalahan yang paling sering terjadi.", isi, "PRAKTIK TERBIMBING")

    # Pustaka
    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: Bab 1–4 tentang antarmuka, sketsa 2D, dan konsep pemodelan parametrik berbasis fitur; konsepnya berlaku sama di FreeCAD.")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: alur kerja sketsa–fitur–gambar kerja dan manajemen berkas proyek CAD.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Getting started, Draft Workbench, Std Measure", " (wiki.freecad.org), 2024–2026.", "Dokumentasi resmi yang menjadi acuan nama perintah, properti, dan API Python pada modul ini.")
    refs += pm_ref(4, "green", "0,224,158", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab 1–3: peran CAD dalam proses desain, sistem koordinat, dan dasar pemodelan geometri.")
    refs += pm_ref(5, "pink", "236,72,153", "F. E. Giesecke dkk.", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Dasar gambar teknik (proyeksi, dimensi, anotasi) yang menjadi standar keluaran model CAD pada Modul 2–4.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi pengenalan CAD, antarmuka dan workbench, bidang kerja, menggambar 2D, pembacaan properti geometri, dan manajemen berkas. Dokumentasi FreeCAD daring adalah pendamping wajib saat berlatih.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> unduhan resmi FreeCAD 1.0 (freecad.org/downloads), manual FreeCAD (wiki.freecad.org/Manual), dan daftar putar video tutorial CAD yang tercantum pada RPS mata kuliah. Video membantu melihat urutan klik; modul ini memberi alasan di balik tiap langkah dan cara memeriksa hasilnya dengan angka.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 1 — Pengenalan FreeCAD dan Menggambar 2D · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Draft → Rectangle</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Shape.Area</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Part → Cut</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">CenterOfMass</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">.FCStd</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 1 · Pengenalan FreeCAD dan Menggambar 2D</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 1</span><br><em>Menggambar 2D</em><br>di FreeCAD</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang antarmuka, workbench, navigasi, dan berkas FreeCAD, ditambah 5 tugas pemodelan 2D dengan Draft Workbench (persegi panjang, busur, poligon, pelat berlubang, profil L). Setiap tugas pemodelan mengunggah berkas .FCStd dan mengisi satu angka bacaan dari FreeCAD. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

PETUNJUK_HTML = '''  <div class="warn-box">
    <div class="warn-icon">🧊</div>
    <div>
      <h4>Petunjuk Pengerjaan Tugas 1</h4>
      <p>Kerjakan lima tugas pemodelan di <strong>FreeCAD 1.0</strong> (Draft Workbench, bidang kerja Top/XY, satuan mm) sesuai angka pada <strong>varian N Anda</strong> yang muncul setelah login. Untuk tiap tugas: simpan model sebagai <strong>.FCStd</strong> (Ctrl+S, bukan Export), klik <strong>⬆ Unggah</strong>, isikan <strong>angka bacaan</strong> dari FreeCAD (Area, Shape.Length, atau CenterOfMass), lalu klik <strong>▶ Kirim &amp; Validasi</strong>. Berkas boleh diganti selama tugas belum dikirim; setelah dikirim, berkas dan angka terkunci. Berkas yang terunggah tanpa angka yang benar mendapat partial 0,5 poin.</p>
    </div>
  </div>

  <div style="background:rgba(14,165,233,.05);border:1px solid rgba(14,165,233,.2);border-left:4px solid var(--cyan);border-radius:12px;padding:18px 24px;margin-bottom:32px;display:flex;align-items:flex-start;gap:14px">
    <span style="font-size:24px;flex-shrink:0">📤</span>
    <div>
      <div style="font-weight:700;color:var(--cyan);margin-bottom:4px">Cara Submit Tugas 1</div>
      <p style="font-size:14px;color:var(--text)">Jawab semua pilihan ganda, unggah dan kirim kelima tugas pemodelan, lalu klik <strong>📄 Export HTML</strong>, unduh file-nya dan <strong style="color:var(--cyan)">submit ke Fast Learning (LMS UMB) → Tugas Pertemuan 1</strong>. Tautan Google Drive bersifat opsional (cadangan berkas); berkas .FCStd resmi Anda sudah tersimpan di server saat diunggah.</p>
    </div>
  </div>
'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Pernyataan yang paling tepat tentang <strong>FreeCAD</strong> adalah...",
     ["Pemodel CAD 3D parametrik sumber terbuka yang berjalan di Windows, macOS, dan Linux", "Aplikasi menggambar raster 2D seperti pengolah foto", "Perangkat lunak berbayar milik satu vendor yang hanya tersedia untuk Windows", "Penampil model 3D yang tidak dapat menyunting geometri"],
     "Pengertian FreeCAD"),
    ("Dalam FreeCAD, <strong>workbench</strong> adalah...",
     ["Nama lain untuk berkas proyek yang sedang dibuka", "Bidang kerja tempat objek 2D digambar", "Kumpulan alat dan perintah untuk satu jenis pekerjaan yang dapat ditukar lewat pemilih workbench", "Jendela pratinjau hasil cetak gambar kerja"],
     "Pengertian workbench"),
    ("Workbench yang dirancang untuk <strong>menggambar objek 2D</strong> seperti garis, persegi panjang, lingkaran, dan poligon pada bidang kerja adalah...",
     ["Part Design", "Draft", "FEM", "Spreadsheet"],
     "Workbench untuk menggambar 2D"),
    ("Panel yang memuat <strong>pohon dokumen</strong> (daftar objek) beserta <strong>properti Data/View</strong> objek yang dipilih adalah...",
     ["Report view", "Python console", "Status bar", "Combo View (tab Model: Tree view dan Property view)"],
     "Panel pohon dokumen dan properti"),
    ("Pada gaya navigasi <strong>CAD</strong>, menggulir roda mouse (scroll) di jendela 3D berfungsi untuk...",
     ["Memperbesar/memperkecil pandangan (zoom)", "Memutar pandangan (rotate)", "Menggeser pandangan (pan)", "Memilih semua objek"],
     "Fungsi roda mouse pada navigasi CAD"),
    ("Perintah <strong>Fit all</strong> (pintasan keyboard V lalu F) berguna untuk...",
     ["Menyimpan tampilan sebagai gambar PNG", "Menghapus objek yang tidak terpakai", "Mengatur zoom dan posisi kamera agar seluruh objek terlihat penuh di layar", "Mengunci objek agar tidak dapat disunting"],
     "Fungsi Fit all"),
    ("Format berkas <strong>asli (native)</strong> dokumen FreeCAD adalah...",
     [".dwg", ".FCStd", ".stl", ".sldprt"],
     "Format berkas asli FreeCAD"),
    ("Secara teknis, berkas <strong>.FCStd</strong> adalah...",
     ["Berkas teks biasa berisi daftar koordinat", "Gambar bitmap terkompresi", "Basis data SQLite", "Arsip ZIP yang memuat Document.xml, GuiDocument.xml, dan berkas bentuk .brp"],
     "Isi berkas .FCStd"),
    ("Sistem satuan tampilan FreeCAD (misalnya mm) diatur melalui...",
     ["Edit → Preferences → General → Units", "View → Panels → Units", "File → Export → Units", "Tools → Addon Manager"],
     "Pengaturan satuan"),
    ("Pada Draft Workbench, <strong>working plane</strong> (bidang kerja) menentukan...",
     ["Warna latar jendela 3D", "Urutan objek pada pohon dokumen", "Bidang tempat objek 2D digambar dan koordinat titiknya ditafsirkan (Top/XY, Front/XZ, Side/YZ)", "Ukuran kertas gambar kerja TechDraw"],
     "Arti working plane"),
]

# Label singkat tugas pemodelan untuk ekspor dan panel skor (teks lengkap dari server per NIM).
TUGAS_LABELS = ["Persegi panjang Draft — luas (mm²)", "Busur lingkaran Draft — panjang busur (mm)", "Poligon beraturan Draft — luas (mm²)",
                "Pelat berlubang (Part Cut) — luas bersih (mm²)", "Profil L (Draft Wire) — koordinat x titik berat (mm)"]
TUGAS_POIN = [6, 6, 6, 11, 11]


def tugas_block():
    out = '''  <!-- ─── TUGAS PEMODELAN (BERKAS FREECAD) ─── -->
  <div class="q-section">
    <div style="background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.2);border-left:4px solid var(--amber);border-radius:12px;padding:16px 22px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px">
      <span style="font-size:20px;flex-shrink:0">⚠️</span>
      <div>
        <div style="font-weight:700;color:var(--amber);margin-bottom:6px;font-size:14px">Sebelum klik ▶ Kirim &amp; Validasi</div>
        <p style="font-size:13px;color:var(--muted);margin:0;line-height:1.7">Pastikan berkas <strong style="color:var(--text)">.FCStd sudah terunggah</strong> (status hijau di kartu) dan <strong style="color:var(--text)">angka bacaan disalin dari FreeCAD</strong> untuk varian N Anda. Setiap tugas hanya punya <strong style="color:var(--text)">satu kesempatan kirim</strong>; berkas masih boleh diganti sebelum dikirim.</p>
      </div>
    </div>
    <div class="q-type-badge badge-comp">🧊 BAGIAN B — Tugas Pemodelan FreeCAD · 5 Tugas · 6/6/6/11/11 Poin · Berkas .FCStd + Angka Bacaan</div>

    <div class="ref-params" id="parametric-modul-note">
<strong style="color:var(--cyan)">Tugas parametrik per NIM.</strong>
<span style="font-size:13px;color:var(--muted);margin-top:6px;display:block">Masuk sebagai mahasiswa untuk memuat dimensi milik Anda. Teks tugas dirakit server dan tidak disimpan di halaman publik.</span>
</div>
'''
    gambar_html = tugas_gambar_html(NOMOR)
    for i, (label, poin) in enumerate(zip(TUGAS_LABELS, TUGAS_POIN), 1):
        qid = f"c{i}"
        gambar = gambar_html[i - 1]
        hard = " comp-hard" if poin > 6 else ""
        out += f'''
    <!-- TUGAS {i} -->
    <div class="comp-card{hard} reveal" id="card-{qid}">
      <div class="comp-header">
        <div class="comp-num">T{i}</div>
        <div class="comp-q" id="text-{qid}">🔒 Masuk untuk memuat tugas parametrik T{i}.</div>
        <div class="comp-pts">{poin} poin</div>
      </div>
      <div class="comp-hint" id="hint-{qid}">💡 Petunjuk akan dimuat bersama tugas.</div>
      {gambar}
      <div class="comp-code-wrap">
        <div class="input-label"><span class="col-badge col-badge-code">FreeCAD</span> Berkas model <span id="berkas-syarat-{qid}" style="color:var(--muted);font-size:10px">(.FCStd, maks 8 MB)</span></div>
        <div class="berkas-row">
          <input type="file" class="berkas-input" id="berkas-{qid}" accept=".FCStd" onchange="pilihBerkas('{qid}')">
          <button class="berkas-btn" id="unggah-{qid}" onclick="unggahBerkas('{qid}')" disabled>⬆ Unggah</button>
        </div>
        <div class="berkas-status" id="berkas-status-{qid}">Belum ada berkas terunggah.</div>
        <div class="input-label" style="margin-top:14px"><span class="col-badge col-badge-ans">Angka</span> <span id="input-{qid}">Angka bacaan dari FreeCAD</span></div>
        <input type="text" inputmode="decimal" class="nilai-input" id="nilai-{qid}" placeholder="Salin angka dari FreeCAD, mis. 3200,5 atau 3200.5" oninput="onNilaiInput('{qid}')" autocomplete="off">
      </div>
      <button class="comp-submit run-btn" id="sub-{qid}" onclick="kirimTugas('{qid}')" disabled style="opacity:.5">▶ Kirim &amp; Validasi</button>
      <div class="feedback" id="fb-{qid}"></div>
    </div>
'''
    out += "  </div>\n\n"
    return out


GDRIVE_HTML = '''  <!-- GOOGLE DRIVE LINK (opsional) -->
  <div style="background:var(--surface);border:1px solid rgba(0,224,158,.25);border-radius:16px;padding:24px 28px;margin-top:8px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <span style="font-size:22px">🔗</span>
      <div>
        <div style="font-weight:700;color:var(--green);font-size:15px">Link Google Drive — Cadangan Berkas FreeCAD (opsional)</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px">Berkas <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">.FCStd</code> resmi Anda sudah tersimpan di server saat diunggah. Bila ingin, tempelkan tautan folder Google Drive berisi salinannya sebagai cadangan; kolom ini tidak wajib untuk Export HTML.</div>
      </div>
    </div>
    <input
      id="gdrive-link"
      type="url"
      placeholder="https://drive.google.com/drive/folders/... (opsional)"
      oninput="checkExportReady()"
      style="width:100%;padding:13px 16px;background:#020a18;border:1px solid rgba(0,224,158,.3);border-radius:10px;color:var(--green);font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color .2s"
    >
    <div id="gdrive-feedback" style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);margin-top:8px"></div>
  </div>
'''

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 1, 3: 0}

FQ_JUDUL = [
    "Mengapa bengkel perlu beralih dari sketsa tangan ke CAD parametrik?",
    "Workbench dan alur kerja apa yang tepat untuk braket 2D sampai berkas DXF?",
    "Bagaimana mengelola berkas dan versi agar 40 braket tidak salah potong?",
]
FQ_RINGKAS = [
    "Bandingkan sketsa tangan dan model CAD parametrik dari sisi akurasi, kecepatan revisi, dan pemakaian ulang untuk pesanan braket dengan tiga varian ukuran. Sebutkan satu risiko bila tetap memakai sketsa tangan.",
    "Rancang urutan kerja di FreeCAD: workbench, bidang kerja, alat Draft, cara memeriksa luas dan jarak lubang, dan ekspor ke DXF untuk laser cutting. Jelaskan mengapa .FCStd tetap disimpan meski yang dikirim ke operator adalah DXF.",
    "Usulkan skema penamaan berkas, cara membuat varian ukuran dari satu model parametrik, dan langkah cadangan. Jelaskan apa yang hilang bila bengkel hanya menyimpan berkas DXF.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Bengkel selama ini menggambar braket dengan sketsa tangan berskala. Bandingkan sketsa tangan dengan model CAD parametrik (Bagian 01) dari sisi <em>akurasi dimensi</em>, <em>kecepatan revisi</em> saat pelanggan mengubah ukuran, dan <em>pemakaian ulang</em> untuk tiga varian braket. Sebutkan pula satu risiko nyata pada pesanan 40 unit bila sketsa tangan dipertahankan.",
            ["3 varian ukuran", "revisi = ubah parameter", "sketsa tangan vs .FCStd"],
            "Keunggulan utama pemodelan parametrik dibanding gambar 2D biasa adalah...",
            ["Gambar dapat diberi warna dan bayangan", "Berkasnya berukuran lebih kecil", "Mengubah satu parameter memperbarui geometri yang bergantung padanya secara otomatis", "Tidak memerlukan komputer dengan kartu grafis"],
            "✅ Tepat! Inilah inti parametrik: dimensi disimpan sebagai parameter fitur, sehingga varian braket 120, 150, dan 180 mm cukup dibuat dengan mengubah satu angka; lubang yang diikat ke a/4 dan 3a/4 ikut bergeser (lihat Animasi 4).",
            "❌ Warna, ukuran berkas, dan kebutuhan perangkat keras bukan pembeda utama. Pembedanya adalah <em>hubungan</em> antar-dimensi yang tersimpan di model, sehingga perubahan menjalar otomatis. Lihat kembali Bagian 01 dan Animasi 4.",
            "Petunjuk: (1) Bandingkan akurasi, revisi, dan pemakaian ulang. (2) Kaitkan dengan tiga varian ukuran braket. (3) Sebutkan satu risiko pada pesanan 40 unit.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Braket berupa pelat 2D dengan dua lubang. Susun alur kerja di FreeCAD: workbench yang dipakai, bidang kerja, urutan alat Draft (Bagian 06), cara memeriksa luas dan jarak lubang (Bagian 07), lalu ekspor ke DXF untuk operator laser cutting (Bagian 08). Jelaskan mengapa berkas .FCStd tetap harus disimpan walaupun yang dikirim ke operator adalah DXF.",
            ["Draft · Top (XY)", "Rectangle + Circle + Cut", "Shape.Area · DXF"],
            "Format berkas yang lazim diminta operator laser cutting untuk kontur 2D adalah...",
            [".FCStd, karena memuat riwayat parametrik", ".dxf, gambar vektor 2D yang dibaca mesin potong dan CAD lain", ".stl, mesh segitiga untuk cetak 3D", ".png, gambar raster hasil tangkapan layar"],
            "✅ Tepat! DXF adalah format vektor 2D yang dipahami mesin laser/plasma dan CAD lain. Ia hanya memuat geometri: karena itu .FCStd tetap disimpan sebagai sumber yang bisa direvisi, dan DXF diekspor ulang setiap kali model berubah.",
            "❌ .FCStd tidak dibaca mesin potong, .stl adalah mesh untuk cetak 3D, dan .png hanya gambar raster tanpa ukuran presisi. Lihat tabel format pada Bagian 08.",
            "Petunjuk: (1) Sebutkan workbench dan bidang kerja. (2) Urutkan alat Draft dan Part Cut. (3) Jelaskan cara memeriksa luas dan jarak lubang, lalu ekspor DXF dan alasan menyimpan .FCStd.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Pesanan 40 braket terdiri dari tiga varian ukuran, dan pelanggan mungkin merevisi lagi. Usulkan skema penamaan berkas, cara menurunkan tiga varian dari satu model parametrik (Save As atau parameter), langkah cadangan (Bagian 08), serta apa yang hilang bila bengkel hanya menyimpan DXF hasil ekspor.",
            ["Braket_v2_L150.FCStd", "Save As per varian", "cadangan .FCBak"],
            "Berkas yang harus dijadikan sumber utama dan dicadangkan oleh bengkel adalah...",
            [".FCStd, karena menyimpan objek, parameter, dan riwayat pembuatan model", ".dxf, karena itulah yang dikirim ke mesin potong", ".pdf gambar kerja, karena mudah dibuka semua orang", ".stl, karena ukurannya paling kecil"],
            "✅ Tepat! Hanya .FCStd yang menyimpan parameter dan riwayat; DXF, PDF, dan STL adalah turunan yang bisa dibuat ulang kapan saja dari sumbernya, tetapi tidak sebaliknya.",
            "❌ DXF, PDF, dan STL hanya memuat geometri akhir tanpa parameter; bila hanya itu yang disimpan, revisi ukuran berarti menggambar ulang dari awal. Lihat Gambar 6 dan tabel format Bagian 08.",
            "Petunjuk: (1) Usulkan skema penamaan. (2) Jelaskan cara membuat tiga varian dari satu model. (3) Sebutkan langkah cadangan dan kerugian bila hanya menyimpan DXF.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">sketsa → .FCStd → DXF</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">a/4 · 3a/4</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Braket_v2_L150</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">40 unit · 3 varian</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 1 · Pengenalan FreeCAD dan Menggambar 2D</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Dari Sketsa Tangan<br><em>ke Model CAD</em></h1>
    <p class="hero-sub">Sebuah bengkel fabrikasi kecil menerima pesanan braket dalam tiga varian ukuran dan mempertimbangkan pindah ke FreeCAD. Terapkan kosakata Pertemuan 1: parametrik, workbench, bidang kerja, properti geometri, dan manajemen berkas, untuk menilai rencana mereka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Karya Logam —<br>Pesanan 40 Braket dalam Tiga Ukuran</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PEMODELAN CAD</div>
    <p>
      <strong style="color:var(--amber)">Bengkel fabrikasi Karya Logam</strong> (lima pekerja, satu mesin laser cutting sewaan) menerima pesanan <strong style="color:var(--cyan)">40 braket siku dari pelat baja 6 mm</strong> untuk rak gudang. Pelanggan meminta <strong>tiga varian panjang</strong> (120, 150, dan 180 mm) dengan lebar dan lubang baut yang sama, dan sudah dua kali mengubah ukuran sejak pesanan pertama.
    </p>
    <p style="margin-top:12px">
      Selama ini gambar dibuat <strong style="color:var(--cyan)">sketsa tangan berskala</strong> lalu dipindah manual ke mesin: dua batch pertama <strong>salah jarak lubang</strong> dan harus dipotong ulang. Operator laser meminta berkas <strong style="color:var(--cyan)">DXF</strong>. Pemilik bengkel mempertimbangkan FreeCAD karena gratis dan berjalan di laptop kantor yang biasa saja, tetapi ragu apakah pekerjanya sanggup.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul 1, Anda diminta menyusun <strong style="color:var(--cyan)">rencana kerja awal</strong>: mengapa perlu CAD parametrik, alur kerja di FreeCAD untuk braket 2D sampai DXF, dan tata kelola berkas agar revisi berikutnya tidak lagi menyebabkan salah potong.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Pesanan: 40 braket, 3 varian", "14,165,233", "cyan")}
{kartu("Panjang: 120 / 150 / 180 mm", "14,165,233", "cyan")}
{kartu("Pelat baja 6 mm, 2 lubang baut", "14,165,233", "cyan")}
{kartu("Keluaran: DXF untuk laser cutting", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Salah jarak lubang dan revisi yang lambat bukan dua masalah yang terpisah. Forum ini mengajak Anda menjelaskan <strong>di mana</strong> kesalahan muncul, <strong>mengapa</strong> model parametrik mencegahnya, dan <strong>bagaimana</strong> berkas dikelola agar tiga varian tetap konsisten.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Tiga varian braket dari satu model parametrik: panjang berubah, lebar dan lubang mengikuti aturan yang sama</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Bengkel fabrikasi Karya Logam menerima pesanan 40 braket siku pelat baja 6 mm untuk rak gudang dalam tiga varian panjang (120, 150, 180 mm) dengan lebar dan lubang baut yang sama; pelanggan sudah dua kali mengubah ukuran. Gambar selama ini berupa sketsa tangan dan dua batch pertama salah jarak lubang. Operator laser cutting meminta berkas DXF. Pemilik mempertimbangkan FreeCAD dan meminta rencana kerja awal: alasan CAD parametrik, alur kerja braket 2D sampai DXF, dan tata kelola berkas."
FORUM_CHIPS_LMS = ["pesanan = 40 braket, 3 varian", "panjang = 120/150/180 mm", "pelat 6 mm, 2 lubang baut", "keluaran = DXF laser cutting"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Tiga varian braket dari satu model parametrik (Pertemuan 1)
// Panjang 120/150/180 mm; lebar 60 mm; lubang ⌀10 di 1/4 dan 3/4 panjang.
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const varian = [120, 150, 180], b = 60, d = 10;
  const kolom = W / 3, sk = Math.min((kolom - 40) / 190, (H - 70) / 80);
  varian.forEach((a, i) => {
    const ox = i * kolom + (kolom - a * sk) / 2, oy = H - 34;
    ctx.fillStyle = 'rgba(34,211,238,.14)'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.rect(ox, oy - b * sk, a * sk, b * sk); ctx.fill(); ctx.stroke();
    [a / 4, 3 * a / 4].forEach((x) => {
      ctx.fillStyle = '#020812'; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ox + x * sk, oy - b / 2 * sk, d / 2 * sk, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.fillStyle = 'rgba(245,158,11,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText('a = ' + a + ' mm', ox + a * sk / 2, oy - b * sk - 8);
    ctx.fillStyle = 'rgba(148,163,184,.85)';
    ctx.fillText('lubang di a/4 dan 3a/4  ·  luas ' + (a * b - 2 * Math.PI * d * d / 4).toFixed(0) + ' mm²', ox + a * sk / 2, oy + 16);
  });
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ satu model .FCStd → tiga varian: ubah Length, lubang mengikuti', 14, 18);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""

# ─────────────────────────── SETUP FREECAD ───────────────────────────
SETUP_PAGE = f'''<div class="page" id="page-setup">

<section class="sp-hero">
  <div class="sp-hero-inner">
    <div class="sp-badge">🧊 SETUP GUIDE · PEMODELAN CAD</div>
    <h1 class="sp-h1">Setup <span class="hl">FreeCAD 1.0</span><br>untuk Pemodelan CAD</h1>
    <p class="sp-sub">Pemasangan dari nol sampai model pertama: unduh FreeCAD 1.0, samakan preferensi satuan dan navigasi dengan kelas, kenali panel utama, uji dengan satu persegi panjang, lalu simpan berkas .FCStd yang siap diunggah.</p>
    <div class="sp-chips">
      <div class="sp-chip"><span class="dot"></span>Windows / macOS / Linux</div>
      <div class="sp-chip"><span class="dot"></span>~15 menit</div>
      <div class="sp-chip"><span class="dot"></span>Draft · Part · Python console</div>
    </div>
  </div>
</section>

<div class="sp-wrap">
  <div class="sp-timeline">

    <!-- ── PESAN DOSEN ── -->
    <div class="sp-step">
      <div class="sp-dot s1">👋</div>
      <div class="sp-card">
        <div class="sp-bar s1"></div>
        <div class="sp-head">
          <div class="sp-icon">👨‍🏫</div>
          <div><div class="sp-label">Pesan Dosen</div><div class="sp-title">Halo Mahasiswa Pemodelan CAD!</div></div>
        </div>
        <div class="sp-body">
          <p>Seluruh tugas mata kuliah ini dikerjakan di <strong>FreeCAD 1.0</strong>, perangkat lunak CAD parametrik sumber terbuka yang gratis dan berjalan di laptop biasa. Ikuti lima langkah di bawah sekali saja; setelah itu setiap pertemuan tinggal membuka FreeCAD, memodelkan, dan mengunggah berkas .FCStd di tab Tugas. Pengaturan satuan dan navigasi sengaja disamakan agar angka yang Anda baca sama dengan yang diperiksa server.</p>
        </div>
      </div>
    </div>

    <!-- ── STEP 1: UNDUH ── -->
    <div class="sp-step">
      <div class="sp-dot s1">1</div>
      <div class="sp-card">
        <div class="sp-bar s1"></div>
        <div class="sp-head">
          <div class="sp-icon">📦</div>
          <div><div class="sp-label">Langkah 1</div><div class="sp-title">Unduh dan Pasang FreeCAD 1.0</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">FreeCAD tersedia untuk tiga sistem operasi tanpa lisensi. Spesifikasi minimal: 8 GB RAM, kartu grafis dengan OpenGL 3.3 (grafis terintegrasi cukup), dan 2 GB ruang disk.</p>
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li>Buka → <a href="https://www.freecad.org/downloads.php" target="_blank" rel="noopener">freecad.org/downloads</a> dan pilih versi <strong>1.0</strong> (bukan development/weekly).</li>
            <li><strong>Windows:</strong> unduh installer <code>.exe</code> (atau <code>.7z</code> portabel bila tidak punya hak admin), jalankan, biarkan lokasi bawaan.</li>
            <li><strong>macOS:</strong> unduh <code>.dmg</code>, seret FreeCAD ke Applications; izinkan pada System Settings → Privacy &amp; Security bila diminta.</li>
            <li><strong>Linux:</strong> unduh <code>.AppImage</code>, beri izin eksekusi (<code>chmod +x</code>), lalu jalankan.</li>
            <li>Buka FreeCAD; pada Start page pilih <strong>Part Design</strong> atau langsung tutup halaman mulai.</li>
          </ol>
          <div class="sp-cb" style="margin-top:1rem;">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Help → About FreeCAD</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># Pastikan versi yang terpasang 1.0.x (contoh keluaran Help → About → Copy to clipboard)</span>
Version: 1.0.0
OCC version: 7.8.1
Python 3.11.x, Qt 5.15.x / 6.x</pre></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 2: PREFERENSI ── -->
    <div class="sp-step">
      <div class="sp-dot s2">2</div>
      <div class="sp-card">
        <div class="sp-bar s2"></div>
        <div class="sp-head">
          <div class="sp-icon">⚙️</div>
          <div><div class="sp-label">Langkah 2</div><div class="sp-title">Samakan Preferensi dengan Kelas</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">Buka <strong>Edit → Preferences</strong> dan atur:</p>
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li><strong>General → Units:</strong> User system = <code>Standard (mm/kg/s/degree)</code>, Number of decimals = <code>4</code>.</li>
            <li><strong>Navigation → 3D View:</strong> Navigation style = <code>CAD</code>, Orbit style = <code>Turntable</code>.</li>
            <li><strong>General → General:</strong> bahasa boleh Indonesia atau Inggris; modul memakai istilah antarmuka Inggris.</li>
            <li><strong>General → Document:</strong> aktifkan <em>Create backup files</em> (2–3 berkas) dan <em>Save thumbnail</em>.</li>
            <li>Klik <strong>Apply → OK</strong>; preferensi berlaku untuk semua dokumen.</li>
          </ol>
          <p style="margin-top:1rem;font-size:.85rem;color:var(--sp-t3)"><strong style="color:var(--sp-c4)">⚠ Penting:</strong> satuan yang berbeda (cm atau inci) membuat angka Area dan Length berbeda dari kunci server walaupun modelnya benar.</p>
        </div>
      </div>
    </div>

    <!-- ── STEP 3: ANTARMUKA ── -->
    <div class="sp-step">
      <div class="sp-dot s3">3</div>
      <div class="sp-card">
        <div class="sp-bar s3"></div>
        <div class="sp-head">
          <div class="sp-icon">🧩</div>
          <div><div class="sp-label">Langkah 3</div><div class="sp-title">Kenali Panel dan Workbench Draft</div></div>
        </div>
        <div class="sp-body">
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li>Tekan <strong>Ctrl+N</strong> untuk dokumen baru.</li>
            <li>Pada pemilih workbench (kotak drop-down di toolbar) pilih <strong>Draft</strong>; toolbar Line, Rectangle, Circle, Polygon akan muncul.</li>
            <li>Buka <strong>View → Panels</strong> dan pastikan <em>Combo View</em> (atau Tree view + Property view), <em>Report view</em>, dan <em>Python console</em> tercentang.</li>
            <li>Pada toolbar Draft, klik tombol <em>working plane</em> dan pilih <strong>Top (XY)</strong>; tekan <strong>2</strong> untuk pandangan atas.</li>
            <li>Coba navigasi: roda mouse untuk zoom, tahan tombol tengah untuk pan, tengah + kiri untuk memutar, lalu <strong>V</strong> lalu <strong>F</strong> untuk Fit all.</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- ── STEP 4: UJI ── -->
    <div class="sp-step">
      <div class="sp-dot s4">4</div>
      <div class="sp-card">
        <div class="sp-bar s4"></div>
        <div class="sp-head">
          <div class="sp-icon">🧪</div>
          <div><div class="sp-label">Langkah 4</div><div class="sp-title">Uji Model Pertama — Hello FreeCAD!</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">Gambar satu persegi panjang lewat antarmuka: <strong>Draft → Rectangle</strong>, ketik <code>0</code> ⏎ <code>0</code> ⏎ <code>0</code> ⏎ untuk sudut pertama, lalu masukkan Length <code>100</code> dan Height <code>50</code>. Pilih objek Rectangle di pohon dokumen dan lihat tab <strong>Data</strong>: properti <em>Area</em> harus menunjukkan <strong>5000 mm²</strong>. Kemudian jalankan cell berikut di Python console untuk membaca angka yang sama lewat skrip:</p>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Python console FreeCAD</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-kw">import</span> FreeCAD <span class="sp-kw">as</span> App
doc = App.ActiveDocument
r = doc.getObject(<span class="sp-str">"Rectangle"</span>)
r.MakeFace = <span class="sp-kw">True</span>
doc.recompute()
<span class="sp-kw">print</span>(<span class="sp-str">f"Hello FreeCAD! Area = {{r.Shape.Area:.2f}} mm^2, keliling = {{r.Shape.Length:.2f}} mm"</span>)
<span class="sp-cm"># Keluaran yang diharapkan: Area = 5000.00 mm^2, keliling = 300.00 mm</span></pre></div>
          </div>
          <p style="margin-top:1rem;font-size:.9rem;">✅ Jika tercetak <strong>Area = 5000.00 mm^2</strong> → setup Anda <strong style="color:var(--sp-c2)">SUKSES</strong>! Satuan, workbench, dan console sudah siap untuk tugas pemodelan.</p>
        </div>
      </div>
    </div>

    <!-- ── STEP 5: SIMPAN ── -->
    <div class="sp-step">
      <div class="sp-dot s5">5</div>
      <div class="sp-card">
        <div class="sp-bar s5"></div>
        <div class="sp-head">
          <div class="sp-icon">💾</div>
          <div><div class="sp-label">Langkah 5</div><div class="sp-title">Simpan .FCStd dan Uji Unggah</div></div>
        </div>
        <div class="sp-body">
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li>Tekan <strong>Ctrl+S</strong>, beri nama <code>Latihan_NIM.FCStd</code> (tanpa spasi), simpan di folder khusus mata kuliah ini.</li>
            <li>Buka berkas itu dengan pengarsip ZIP (klik kanan → Open with → 7-Zip/WinRAR/Archive Utility): harus ada <code>Document.xml</code>. Itulah tanda yang diperiksa server saat unggah.</li>
            <li>Berkas <code>.FCBak</code> yang muncul di folder yang sama adalah cadangan otomatis; jangan diunggah.</li>
            <li>Di tab <strong>Tugas</strong>, setiap kartu tugas punya tombol <strong>⬆ Unggah</strong> untuk berkas .FCStd (maks 8 MB) dan kolom angka bacaan; berkas boleh diganti sampai Anda menekan <strong>▶ Kirim &amp; Validasi</strong>.</li>
          </ol>
          <p style="margin-top:1rem;font-size:.9rem;">Sekarang Anda siap mengerjakan tugas pemodelan CAD. Materi Modul 1 menjelaskan setiap perintah yang baru saja dipakai.</p>
        </div>
      </div>
    </div>

  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Setup FreeCAD 1.0 untuk Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>
</div><!-- end page-setup -->'''
