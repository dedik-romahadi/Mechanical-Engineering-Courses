# Konten Modul 6 Pemodelan CAD — Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D
# (Sub-CPMK 2.4: pandangan standar dan isometrik, navigasi kamera, proyeksi ortogonal vs
# perspektif, metode proyeksi sudut pertama/ketiga dan TechDraw ProjectionGroup, potongan
# dan clipping plane, gaya tampilan/warna/material/transparansi, bacaan BoundBox, luas
# muka, dan luas potongan). Angka contoh dihitung di sini agar teks, tabel, dan gambar
# konsisten, dan sengaja tidak sama dengan varian tugas parametrik mana pun (bank tugas
# ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from tugas_gambar import AM, BL, CY, GN, GR, PK, RD, _panah, dim_h, dim_v, ext  # noqa: E402

NOMOR = 6
JUDUL = "Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D"
JUDUL_PANJANG = "Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D"
JUDUL_EKSPOR = "Sudut Pandang dan Proyeksi 3D"

# ─────────────────────────── angka contoh ───────────────────────────
A_T, B_T, H_T, HN_T = 120, 60, 80, 24                    # balok bertakik: lebar, kedalaman, tinggi, tinggi takik
A_DEPAN = A_T * H_T - (A_T / 2) * HN_T                   # luas muka depan = 8160
A_I, B_I, C_I = 100, 60, 40                              # balok untuk isometrik dan diagonal ruang
DIAG = math.sqrt(A_I ** 2 + B_I ** 2 + C_I ** 2)         # 123,288
K_ISO = math.sqrt(2 / 3)                                 # faktor pemendekan isometrik 0,8165
A_R, B_R, TH_R = 120, 80, 30                             # balok diputar θ terhadap Z (di luar rentang varian tugas)
XLEN = A_R * math.cos(math.radians(TH_R)) + B_R * math.sin(math.radians(TH_R))   # 143,923
YLEN = A_R * math.sin(math.radians(TH_R)) + B_R * math.cos(math.radians(TH_R))   # 129,282
A_S, B_S, H_S, D_S = 120, 70, 40, 24                     # balok berlubang untuk potongan A-A
A_POTONG = H_S * (A_S - D_S)                             # 3840
E_S = 10                                                 # bidang potong bergeser 10 mm dari pusat lubang
W_S = 2 * math.sqrt((D_S / 2) ** 2 - E_S ** 2)           # lebar celah 13,27
A_W, H1_W, H2_W, B_W = 90, 60, 30, 50                    # baji: alas, tinggi kiri, tinggi kanan, kedalaman
L_MIRING = math.sqrt(A_W ** 2 + (H1_W - H2_W) ** 2)      # 94,868
A_MIRING = B_W * L_MIRING                                # 4743,42
H_OBJ, F_CAM, D_DEKAT, D_JAUH = 80, 80, 200, 260         # kamera perspektif: h' = h·f/D
H_DEKAT, H_JAUH = H_OBJ * F_CAM / D_DEKAT, H_OBJ * F_CAM / D_JAUH
# Praktik terbimbing (Bagian 09): balok bertingkat berlubang. Teks langkah dan gambar7 memakai konstanta yang sama.
BT_A, BT_H, BT_NA, BT_NH = 120, 80, 60, 30              # profil tangga XZ: lebar, tinggi, anak tangga lebar × tinggi (dibuang di kanan-atas)
BT_B, BT_D, BT_SKALA = 60, 20, "1:2"                     # Pad (kedalaman), ⌀ lubang tembus di muka atas tingkat rendah, skala lembar


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s, az=35, el=28):
    a, e = math.radians(az), math.radians(el)
    x1 = x * math.cos(a) - y * math.sin(a)
    y1 = x * math.sin(a) + y * math.cos(a)
    return cx + s * x1, cy - s * (z * math.cos(e) + y1 * math.sin(e))


def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _garis(x1, y1, x2, y2, stroke, w=1, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _arsir(x0, y0, w, h, warna, jarak=7):
    """Garis arsir 45° di dalam persegi panjang (x0, y0, w, h) tanpa memakai <rect>."""
    out = ""
    c = -h
    while c < w:
        xa, ya = x0 + c, y0 + h
        xb, yb = x0 + c + h, y0
        if xa < x0:
            ya = y0 + h - (x0 - xa)
            xa = x0
        if xb > x0 + w:
            yb = y0 + (xb - (x0 + w))
            xb = x0 + w
        if xb > xa:
            out += _garis(xa, ya, xb, yb, warna, 0.8)
        c += jarak
    return out


def gambar1():
    b = ""
    cx, cy, s = 175, 170, 1.4
    a, bb, h = 80, 50, 40
    dasar = [_iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [_iso(x, y, h, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    b += _poli([dasar[3], dasar[2], atas[2], atas[3]], "rgba(148,163,184,.06)", "rgba(148,163,184,.4)", 0.8)
    b += _poli([dasar[0], dasar[3], atas[3], atas[0]], "rgba(148,163,184,.06)", "rgba(148,163,184,.4)", 0.8)
    b += _poli([dasar[0], dasar[1], atas[1], atas[0]], "rgba(34,211,238,.16)", "#22d3ee", 1.3)
    b += _poli([dasar[1], dasar[2], atas[2], atas[1]], "rgba(168,85,247,.16)", "#a855f7", 1.3)
    b += _poli(atas, "rgba(245,158,11,.18)", "#f59e0b", 1.4)
    panah = [("Depan (1)", (a / 2, -34, h / 2), (a / 2, 0, h / 2), "#22d3ee", "start", (10, 6), ""),
             ("Atas (2)", (a / 2, bb / 2, h + 36), (a / 2, bb / 2, h), "#f59e0b", "middle", (0, -8), ""),
             ("Kanan (3)", (a + 36, bb / 2, h / 2), (a, bb / 2, h / 2), "#a855f7", "start", (8, 4), ""),
             ("Belakang (4)", (a / 2, bb + 40, h / 2), (a / 2, bb, h / 2), AX, "end", (-8, -3), "4 3"),
             ("Bawah (5)", (a / 2, bb / 2, -34), (a / 2, bb / 2, 0), AX, "middle", (0, 16), "4 3"),
             ("Kiri (6)", (-36, bb / 2, h / 2), (0, bb / 2, h / 2), AX, "end", (-8, 4), "4 3")]
    for nama, ekor, kepala, warna, anchor, (dx, dy), dash in panah:
        p0, p1 = _iso(*ekor, cx, cy, s), _iso(*kepala, cx, cy, s)
        if dash:
            b += _garis(p0[0], p0[1], p1[0], p1[1], warna, 1.2, dash)
        else:
            b += arrow(p0[0], p0[1], p1[0], p1[1], warna, 1.8)
        b += t(p0[0] + dx, p0[1] + dy, nama, 11, warna, anchor, "600")
    b += t(452, 48, "Tombol angka pada tampilan 3D:", 11, TX, "start", "600")
    b += t(452, 66, "0 isometrik · 1 depan · 2 atas · 3 kanan", 10, AX, "start")
    b += t(452, 82, "4 belakang · 5 bawah · 6 kiri", 10, AX, "start")
    b += t(452, 110, "Fit: V, F (semua) · V, S (seleksi)", 10.5, "#00e09e", "start")
    b += t(452, 126, "Navigation cube: klik muka, rusuk, sudut,", 10, AX, "start")
    b += t(452, 142, "atau panah putar 45° / 90°", 10, AX, "start")
    b += t(452, 170, "Kamera: V, O ortografik · V, P perspektif", 10.5, "#f59e0b", "start")
    b += t(452, 186, "Gaya navigasi: Preferences → Navigation", 10, AX, "start")
    b += teks2(340, 228, "Enam pandangan standar memandang balok dari enam arah sumbu; Depan (XZ), Atas (XY), dan Kanan (YZ) menjadi tiga pandangan utama gambar teknik", 11, AX, maks=76)
    return svg(680, 252, b, "Gambar 1 — Enam pandangan standar dan tombol navigasi tampilan 3D")


def gambar2():
    b = ""
    # panel kiri: ortografik
    b += t(160, 26, "Ortografik (V, O)", 12, "#22d3ee", "middle", "600")
    b += _garis(120, 60, 120, 210, AX, 1.2, "5 3")
    b += t(120, 52, "bidang gambar", 9.5, AX, "middle")
    for x, warna, nama, dy in [(222, "#22d3ee", "muka dekat", 190), (276, "#f59e0b", "muka jauh", 82)]:
        b += _garis(x, 95, x, 175, warna, 3)
        b += t(x, dy, nama, 9.5, warna, "middle")
        for y in (95, 175):
            b += _garis(x, y, 123, y, warna, 0.8, "4 3")
    b += _garis(120, 95, 120, 175, "#00e09e", 4)
    b += t(112, 139, "h′ = h", 10.5, "#00e09e", "end", "600")
    # keterangan garis proyeksi di antara kedua garis proyeksi (dulu di kiri bidang gambar, menempel "h′ = h")
    b += t(172, 126, "garis proyeksi", 9.5, AX, "middle")
    b += t(172, 140, "sejajar sumbu", 9.5, AX, "middle")
    b += t(172, 154, "pandang", 9.5, AX, "middle")
    b += t(160, 232, "ukuran tampak tidak bergantung jarak", 10, AX, "middle")
    # panel tengah pemisah
    b += _garis(330, 40, 330, 240, GRID, 1)
    # panel kanan: perspektif
    b += t(500, 26, "Perspektif (V, P)", 12, "#f59e0b", "middle", "600")
    ex, ey = 386, 135
    b += f'<circle cx="{ex}" cy="{ey}" r="4" fill="#ec4899"/>'
    b += t(ex, 152, "mata E", 9.5, "#ec4899", "middle", "600")
    b += _garis(450, 60, 450, 210, AX, 1.2, "5 3")
    b += t(450, 52, "bidang gambar", 9.5, AX, "middle")
    hasil = []
    for x, warna, nama, dx in [(540, "#22d3ee", "muka dekat", 6), (610, "#f59e0b", "muka jauh", 6)]:
        b += _garis(x, 95, x, 175, warna, 3)
        b += t(x + dx, 139, nama, 9.5, warna, "start")
        tt = (450 - ex) / (x - ex)
        ya, yb = ey + (95 - ey) * tt, ey + (175 - ey) * tt
        for y in (95, 175):
            b += _garis(ex, ey, x, y, warna, 0.8, "4 3")
        hasil.append((ya, yb, warna))
    b += _garis(450, hasil[0][0], 450, hasil[0][1], "#22d3ee", 4)
    b += _garis(446, hasil[1][0], 446, hasil[1][1], "#f59e0b", 4)
    b += t(438, 96, "h′ dekat", 9.5, "#22d3ee", "end")
    b += t(438, 110, "> h′ jauh", 9.5, "#f59e0b", "end")
    b += _garis(ex, 222, 450, 222, AX, 0.8)
    b += t(415, 234, "f", 10.5, AX, "middle", "600")
    b += _garis(ex, 246, 540, 246, AX, 0.8)
    b += t(460, 258, "D (mata → muka dekat)", 9.5, AX, "middle")
    b += t(560, 232, "h′ = h · f / D", 11, "#00e09e", "start", "600")
    b += teks2(340, 276, "Ortografik memproyeksikan dengan garis sejajar (ukuran dapat dibandingkan); perspektif memproyeksikan ke satu titik mata, benda jauh mengecil", 11, AX, maks=76)
    return svg(680, 300, b, "Gambar 2 — Proyeksi ortografik dan perspektif pada kamera tampilan 3D")


def _tiga_pandangan(px, py, metode, sk):
    """Tiga pandangan balok bertakik (skala sk) pada panel dengan sudut kiri-atas (px, py); metode 0 = sudut pertama, 1 = sudut ketiga."""
    a, bb, H, hn = A_T * sk, B_T * sk, H_T * sk, HN_T * sk
    jarak = 22                                # dulu 16: label pandangan terjepit 3 px dari pandangan berikutnya
    out = ""
    if metode:
        atas_y, depan_y = py + 18, py + 18 + bb + jarak
        depan_x, kanan_x = px + 70, px + 70 + a + jarak
    else:
        depan_y, atas_y = py + 18, py + 18 + H + jarak
        kanan_x, depan_x = px + 40, px + 40 + bb + jarak
    atas_x = depan_x
    # depan (profil bertakik)
    prof = [(0, 0), (a, 0), (a, H - hn), (a / 2, H - hn), (a / 2, H), (0, H)]
    out += _poli([(depan_x + x, depan_y + H - z) for x, z in prof], "rgba(34,211,238,.16)", "#22d3ee", 1.6)
    out += t(depan_x + a / 2, depan_y + H + 13, "Depan", 9.5, "#22d3ee", "middle", "600")
    # atas (persegi panjang + rusuk takik)
    out += _poli([(atas_x, atas_y), (atas_x + a, atas_y), (atas_x + a, atas_y + bb), (atas_x, atas_y + bb)], "rgba(245,158,11,.14)", "#f59e0b", 1.6)
    out += _garis(atas_x + a / 2, atas_y, atas_x + a / 2, atas_y + bb, "#f59e0b", 1)
    out += t(atas_x + a / 2, atas_y + bb + 13, "Atas", 9.5, "#f59e0b", "middle", "600")
    # kanan (persegi panjang + rusuk takik)
    out += _poli([(kanan_x, depan_y), (kanan_x + bb, depan_y), (kanan_x + bb, depan_y + H), (kanan_x, depan_y + H)], "rgba(168,85,247,.14)", "#a855f7", 1.6)
    out += _garis(kanan_x, depan_y + hn, kanan_x + bb, depan_y + hn, "#a855f7", 1)
    out += t(kanan_x + bb / 2, depan_y + H + 13, "Kanan", 9.5, "#a855f7", "middle", "600")
    return out


def _simbol_iso(x, y, metode):
    """Simbol metode proyeksi ISO: kerucut terpancung (ujung kecil di kiri) dan pandangan ujungnya."""
    out = ""
    trap = [(x, y - 7), (x + 22, y - 11), (x + 22, y + 11), (x, y + 7)]
    ling_x = x + 44 if metode == 0 else x - 22
    trap_x = 0 if metode == 0 else 22
    out += _poli([(px + trap_x, py) for px, py in trap], "none", TX, 1.2)
    out += f'<circle cx="{ling_x:.1f}" cy="{y}" r="11" fill="none" stroke="{TX}" stroke-width="1.2"/>'
    out += f'<circle cx="{ling_x:.1f}" cy="{y}" r="7" fill="none" stroke="{TX}" stroke-width="1.2"/>'
    return out


def gambar3():
    b = ""
    b += t(165, 26, "Sudut pertama (ISO-E, first angle)", 12, "#22d3ee", "middle", "600")
    b += t(515, 26, "Sudut ketiga (ISO-A, third angle)", 12, "#a855f7", "middle", "600")
    b += _garis(340, 36, 340, 250, GRID, 1)
    b += _tiga_pandangan(20, 40, 0, 0.55)
    b += _tiga_pandangan(370, 40, 1, 0.55)
    b += _simbol_iso(232, 110, 0)
    b += _simbol_iso(606, 110, 1)                # dulu lingkarannya 2 px dari pandangan Kanan
    b += t(246, 138, "simbol", 9, AX, "middle")
    b += t(606, 138, "simbol", 9, AX, "middle")
    b += t(165, 222, "Atas di BAWAH Depan · Kanan di KIRI Depan", 10, AX, "middle")
    b += t(515, 222, "Atas di ATAS Depan · Kanan di KANAN Depan", 10, AX, "middle")
    b += t(165, 240, "Eropa, Indonesia (SNI), ISO bawaan", 9.5, AX, "middle")
    b += t(515, 240, "Amerika Serikat, Kanada, Jepang", 9.5, AX, "middle")
    b += teks2(340, 272, f"Balok bertakik {A_T} × {B_T} × {H_T} yang sama dalam dua metode proyeksi: pandangan identik, susunan berbeda; Projection Type pada TechDraw mengaturnya", 11, AX, maks=76)
    return svg(680, 296, b, "Gambar 3 — Susunan tiga pandangan pada metode proyeksi sudut pertama dan sudut ketiga")


def gambar4():
    b = ""
    cx, cy, s = 190, 205, 1.1
    a, bb, c = A_I, B_I, C_I
    P = lambda x, y, z: _iso(x, y, z, cx, cy, s, 45, 35.264)
    dasar = [P(x, y, 0) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [P(x, y, c) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    b += _poli([dasar[0], dasar[1], atas[1], atas[0]], "rgba(34,211,238,.12)", "#22d3ee", 1.2)
    b += _poli([dasar[1], dasar[2], atas[2], atas[1]], "rgba(34,211,238,.08)", "#22d3ee", 1.2)
    b += _poli(atas, "rgba(34,211,238,.20)", "#22d3ee", 1.4)
    o, d = P(0, 0, 0), P(a, bb, c)
    b += _garis(o[0], o[1], d[0], d[1], "#ec4899", 1.6, "6 3")
    b += f'<circle cx="{o[0]:.1f}" cy="{o[1]:.1f}" r="3" fill="#ec4899"/><circle cx="{d[0]:.1f}" cy="{d[1]:.1f}" r="3" fill="#ec4899"/>'
    b += t(d[0] + 8, d[1] - 4, "(a, b, c)", 9.5, "#ec4899", "start")
    b += t(o[0] + 8, o[1] + 14, "(0, 0, 0)", 9.5, "#ec4899", "start")
    b += t(300, 110, "d = √(a² + b² + c²)", 10.5, "#ec4899", "start", "600")
    # sudut sumbu 30° terhadap mendatar
    b += _garis(o[0] - 60, o[1], o[0] + 90, o[1], AX, 0.7, "3 3")
    b += f'<path d="M {o[0] + 36:.1f} {o[1]:.1f} A 36 36 0 0 0 {o[0] + 36 * math.cos(math.radians(30)):.1f} {o[1] - 36 * math.sin(math.radians(30)):.1f}" fill="none" stroke="#f59e0b" stroke-width="1"/>'
    b += f'<path d="M {o[0] - 36:.1f} {o[1]:.1f} A 36 36 0 0 1 {o[0] - 36 * math.cos(math.radians(30)):.1f} {o[1] - 36 * math.sin(math.radians(30)):.1f}" fill="none" stroke="#f59e0b" stroke-width="1"/>'
    b += t(o[0] + 44, o[1] + 12, "30°", 9.5, "#f59e0b", "start")
    b += t(o[0] - 44, o[1] + 12, "30°", 9.5, "#f59e0b", "end")
    ma = ((dasar[0][0] + dasar[1][0]) / 2, (dasar[0][1] + dasar[1][1]) / 2)
    mb = ((dasar[0][0] + dasar[3][0]) / 2, (dasar[0][1] + dasar[3][1]) / 2)
    mc = ((dasar[1][0] + atas[1][0]) / 2, (dasar[1][1] + atas[1][1]) / 2)
    b += t(ma[0] + 18, ma[1] + 14, f"a = {a}", 10.5, "#22d3ee", "middle", "600")     # geser kanan: bebas dari busur 30°
    b += t(mb[0] - 16, mb[1] - 6, f"b = {bb}", 10.5, "#22d3ee", "end", "600")
    b += t(mc[0] + 8, mc[1] + 4, f"c = {c}", 10.5, "#22d3ee", "start", "600")
    b += t(440, 50, "Isometrik sejati:", 11, "#f59e0b", "start", "600")
    b += t(440, 68, "sumbu X dan Y 30° dari mendatar, Z tegak", 10, AX, "start")
    b += t(440, 84, "ketiga sumbu berjarak 120°, pemendekan sama", 10, AX, "start")
    b += t(440, 100, f"k = cos 35,26° = √(2/3) ≈ {ind(K_ISO, 3)}", 10.5, TX, "start")
    b += t(440, 128, "Gambar isometrik (TechDraw): skala penuh,", 10, AX, "start")
    b += t(440, 144, f"rusuk {a} digambar {a}, bukan {ind(a * K_ISO, 1)}", 10, AX, "start")
    b += t(440, 172, f"diagonal ruang balok {a} × {bb} × {c}:", 10.5, TX, "start")
    b += t(440, 190, f"d = √({a}² + {bb}² + {c}²) = {ind(DIAG, 3)} mm", 10.5, "#00e09e", "start")
    b += t(440, 216, "Std Measure Distance: dua sudut berlawanan", 10, AX, "start")
    b += t(440, 232, "Python: Shape.BoundBox.DiagonalLength", 10, AX, "start")
    b += teks2(340, 262, "Proyeksi isometrik memandang balok sepanjang diagonal ruangnya; ketiga rusuk memendek dengan faktor yang sama sehingga ukuran tetap dapat dibandingkan", 11, AX, maks=76)
    return svg(680, 286, b, "Gambar 4 — Proyeksi isometrik balok, faktor pemendekan, dan diagonal ruang")


def gambar5():
    b = ""
    sk = 1.3
    ox, oy = 40, 60
    a, bb, h, d = A_S * sk, B_S * sk, H_S * sk, D_S * sk
    # pandangan atas dengan garis potong A-A
    b += _poli([(ox, oy), (ox + a, oy), (ox + a, oy + bb), (ox, oy + bb)], "rgba(34,211,238,.14)", "#22d3ee", 1.6)
    b += f'<circle cx="{ox + a / 2:.1f}" cy="{oy + bb / 2:.1f}" r="{d / 2:.1f}" fill="#0a101f" stroke="#22d3ee" stroke-width="1.6"/>'
    yA = oy + bb / 2
    b += _garis(ox - 22, yA, ox + a + 22, yA, "#ec4899", 1.2, "10 3 2 3")
    for x in (ox - 22, ox + a + 22):
        b += arrow(x, yA - 24, x, yA - 6, "#ec4899", 1.4)
        b += t(x, yA - 30, "A", 11, "#ec4899", "middle", "700")
    b += t(ox + a / 2, oy - 10, f"a = {A_S}", 10, "#f59e0b", "middle", "600")
    b += t(ox + a + 30, oy + bb / 2 + 4, f"b = {B_S}", 10, "#f59e0b", "start", "600")
    b += t(ox + a / 2 + d / 2 + 4, oy + bb / 2 - d / 2 - 2, f"⌀d = {D_S}", 9.5, "#a855f7", "start", "600")
    b += t(ox + a / 2, oy + bb + 18, "Pandangan atas (Top) dan garis potong A-A", 10, AX, "middle")
    # potongan A-A: dua bagian diarsir
    ox2, oy2 = 308, 74
    kiri, kanan = (a - d) / 2, (a - d) / 2
    for x0, w in [(ox2, kiri), (ox2 + kiri + d, kanan)]:
        b += _poli([(x0, oy2), (x0 + w, oy2), (x0 + w, oy2 + h), (x0, oy2 + h)], "rgba(0,224,158,.10)", "#00e09e", 1.6)
        b += _arsir(x0, oy2, w, h, "rgba(0,224,158,.7)")
    b += t(ox2 + a / 2, oy2 - 12, "Potongan A-A", 11, "#00e09e", "middle", "600")
    b += t(ox2 - 8, oy2 + h / 2 + 4, f"h = {H_S}", 10, "#f59e0b", "end", "600")
    # "celah d" lebih lebar daripada celahnya (menempel kedua tepi arsir), jadi diletakkan tepat di bawah celah
    b += t(ox2 + kiri + d / 2, oy2 + h + 13, "celah d", 9, "#a855f7", "middle")
    b += t(ox2 + a / 2, oy2 + h + 28, "A = h · (a − d)", 10.5, TX, "middle")
    b += t(ox2 + a / 2, oy2 + h + 46, f"= {H_S} × ({A_S} − {D_S}) = {ind(A_POTONG, 0)} mm²", 10.5, "#00e09e", "middle")
    b += t(480, 178, "TechDraw Section View:", 10.5, "#ec4899", "start", "600")
    b += t(480, 194, "pilih pandangan → Insert Section View", 9.5, AX, "start")
    b += t(480, 208, "panah = arah pandang; muka diarsir", 9.5, AX, "start")
    b += t(480, 228, "Python: sh.slice(App.Vector(0,1,0), b/2)", 9.5, AX, "start")
    b += t(480, 242, "→ wire; Part.Face(w).Area", 9.5, AX, "start")
    b += teks2(340, 270, "Bidang potong melalui pusat lubang membelah penampang a × h menjadi dua bagian diarsir; luas totalnya h·(a − d), diperiksa dengan slice di Python", 11, AX, maks=76)
    return svg(680, 294, b, "Gambar 5 — Section View A-A balok berlubang dan luas penampang potongan")


def gambar6():
    b = ""
    s = 1.2
    ox, oy = 130, 222
    a, bb, th = A_R, B_R, math.radians(TH_R)
    R = lambda x, y: (ox + s * (x * math.cos(th) - y * math.sin(th)), oy - s * (x * math.sin(th) + y * math.cos(th)))
    asli = [(ox, oy), (ox + s * a, oy), (ox + s * a, oy - s * bb), (ox, oy - s * bb)]
    b += _poli(asli, "none", "rgba(148,163,184,.35)", 1, "5 4")
    putar = [R(x, y) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    b += _poli(putar, "rgba(34,211,238,.16)", "#22d3ee", 2)
    xs, ys = [p[0] for p in putar], [p[1] for p in putar]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    b += _poli([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], "none", "#f59e0b", 1.4, "7 4")
    b += f'<path d="M {ox + 46} {oy} A 46 46 0 0 0 {ox + 46 * math.cos(th):.1f} {oy - 46 * math.sin(th):.1f}" fill="none" stroke="#ec4899" stroke-width="1.3"/>'
    b += t(ox + 54, oy - 12, "θ", 12, "#ec4899", "start", "700")
    b += f'<circle cx="{ox}" cy="{oy}" r="2.5" fill="{TX}"/>'
    b += t(ox - 6, oy + 13, "(0, 0)", 9, AX, "end")
    ma = ((putar[0][0] + putar[1][0]) / 2, (putar[0][1] + putar[1][1]) / 2)
    mb = ((putar[0][0] + putar[3][0]) / 2, (putar[0][1] + putar[3][1]) / 2)
    b += t(ma[0] + 10, ma[1] + 10, "a", 11, "#22d3ee", "middle", "600")
    b += t(mb[0] - 10, mb[1] + 2, "b", 11, "#22d3ee", "end", "600")
    b += _garis(x0, y1 + 20, x1, y1 + 20, "#f59e0b", 1)
    b += _garis(x0, y1 + 14, x0, y1 + 26, "#f59e0b", 1) + _garis(x1, y1 + 14, x1, y1 + 26, "#f59e0b", 1)
    b += t((x0 + x1) / 2, y1 + 34, "XLength = a·cosθ + b·sinθ", 10.5, "#f59e0b", "middle", "600")
    # YLength digeser ke kanan agar garisnya tidak berimpit dengan tepi kanan kotak posisi semula (x = ox + s·a)
    b += _garis(x1 + 28, y0, x1 + 28, y1, "#f59e0b", 1)
    b += _garis(x1 + 22, y0, x1 + 34, y0, "#f59e0b", 1) + _garis(x1 + 22, y1, x1 + 34, y1, "#f59e0b", 1)
    b += t(x1 + 34, (y0 + y1) / 2 + 4, "YLength", 10, "#f59e0b", "start", "600")
    b += t(ox + s * a * 0.54, oy + 14, "posisi semula (putus)", 9, AX, "middle")     # bebas dari tanda ujung XLength
    b += t(440, 48, "Shape.BoundBox setelah Placement:", 11, "#f59e0b", "start", "600")
    b += t(440, 66, "kotak selalu sejajar sumbu global X, Y, Z", 10, AX, "start")
    b += t(440, 82, "sehingga membesar saat benda diputar", 10, AX, "start")
    b += t(440, 110, "XLength = a·cosθ + b·sinθ", 10.5, TX, "start")
    b += t(440, 128, f"= {a}·cos {TH_R}° + {bb}·sin {TH_R}° = {ind(XLEN, 3)}", 10.5, "#00e09e", "start")
    b += t(440, 146, f"YLength = a·sinθ + b·cosθ = {ind(YLEN, 3)}", 10.5, "#00e09e", "start")
    b += t(440, 164, "ZLength = tinggi Pad (tidak berubah)", 10, AX, "start")
    b += t(440, 192, "XLength terbesar √(a² + b²) saat tan θ = b/a", 10, AX, "start")
    b += t(440, 220, "Tampilan: properti Bounding box (tab View)", 10, AX, "start")
    b += t(440, 236, "optimalBoundingBox(): kotak ketat", 10, AX, "start")
    b += teks2(340, 274, "Kotak pembatas mengikuti sumbu global, bukan benda; alas a × b yang diputar θ menempati kotak (a·cosθ + b·sinθ) × (a·sinθ + b·cosθ)", 11, AX, maks=76)
    return svg(680, 298, b, "Gambar 6 — Kotak pembatas (BoundBox) balok yang diputar θ terhadap sumbu Z")


def _kepala(xt, yt, ux, uy, warna=AM):
    """Kepala panah dimensi (panjang 7, lebar 6) berujung di (xt, yt), menunjuk searah vektor satuan (ux, uy)."""
    bx, by = xt - 7 * ux, yt - 7 * uy
    return f'<polygon points="{xt:.1f},{yt:.1f} {bx - 3 * uy:.1f},{by + 3 * ux:.1f} {bx + 3 * uy:.1f},{by - 3 * ux:.1f}" fill="{warna}"/>'


def _arsir45(x0, y0, x1, y1, warna=GR, jarak=6):
    """Arsiran 45° berfase global (x + y = k·jarak) yang dipotong ke persegi panjang [x0, x1] × [y0, y1]:
    beberapa persegi panjang bersebelahan membentuk satu pola arsir yang menyambung."""
    out = ""
    k = math.ceil((x0 + y0) / jarak)
    while k * jarak < x1 + y1:
        c = k * jarak
        xa, xb = max(x0, c - y1), min(x1, c - y0)
        if xb - xa > 0.5:
            out += f'<line x1="{xa:.1f}" y1="{c - xa:.1f}" x2="{xb:.1f}" y2="{c - xb:.1f}" stroke="{warna}" stroke-opacity=".75" stroke-width=".8"/>'
        k += 1
    return out


def _putus(x1, y1, x2, y2, pola, gaya):
    """Garis putus/rantai sebagai segmen eksplisit dalam satu <path>. Pengurai SVG MuPDF (generator Word)
    mengabaikan stroke-dasharray, sehingga garis tersembunyi akan tercetak utuh seperti rusuk tampak."""
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L
    d, pos, i = "", 0.0, 0
    while pos < L - 0.2:
        seg = pola[i % len(pola)]
        if i % 2 == 0:
            e = min(pos + seg, L)
            d += f"M{x1 + ux * pos:.1f} {y1 + uy * pos:.1f}L{x1 + ux * e:.1f} {y1 + uy * e:.1f}"
        pos += seg
        i += 1
    return f'<path d="{d}" fill="none" {gaya}/>'


def _poli7(pts, warna=CY, isi=".10", w=1.6):
    return '<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="{warna}" fill-opacity="{isi}" stroke="{warna}" stroke-width="{w}"/>'


def gambar7():
    """Gambar kerja target praktik terbimbing (Bagian 09): lembar A4 sudut ketiga berisi pandangan Depan, Atas, Kanan,
    potongan A-A, dan isometrik, dengan konstanta BT_* yang juga dipakai teks langkah 1-7."""
    b = ""
    A, H, NA, NH, B, D = BT_A, BT_H, BT_NA, BT_NH, BT_B, BT_D
    zr, xs = H - NH, A - NA                   # tinggi tingkat rendah, x tepi anak tangga
    hd = B / 2                                # pusat lubang pada bidang A-A (langkah 5 & 7: slice di tengah kedalaman)
    hx = xs + NA / 2                          # posisi X lubang hanya ilustrasi: langkah 1 tidak memberinya, jadi tidak didimensi
    k = 1.2                                   # px per mm untuk pandangan ortografik
    X = lambda x: 80 + x * k                  # pandangan Depan dan Atas
    Z = lambda z: 250 - z * k                 # pandangan Depan, Kanan, dan A-A
    DT = lambda d: 112 - d * k                # pandangan Atas: d = 0 tepi depan (dekat pandangan Depan)
    DR = lambda d: 284 + d * k                # pandangan Kanan: d = 0 tepi kiri
    XS = lambda x: 544 - x * k                # potongan A-A dilihat ke arah −Y: sumbu X terbalik
    prof = [(0, 0), (A, 0), (A, zr), (xs, zr), (xs, H), (0, H)]
    tersembunyi = ((4, 3), f'stroke="{CY}" stroke-opacity=".85" stroke-width="1"')     # garis tersembunyi
    sumbu = ((8, 3, 2, 3), f'stroke="{RD}" stroke-width=".9"')                          # garis sumbu (rantai)
    garis = lambda x1, y1, x2, y2, jenis: _putus(x1, y1, x2, y2, *jenis)
    b += f'<rect x="6" y="6" width="668" height="348" fill="none" stroke="{GRID}" stroke-width="1.2"/>'
    # ── Depan (dari −Y) ──
    b += _poli7([(X(x), Z(z)) for x, z in prof])
    for xx in (hx - D / 2, hx + D / 2):
        b += garis(X(xx), Z(0), X(xx), Z(zr), tersembunyi)
    b += garis(X(hx), Z(0) + 6, X(hx), Z(zr) - 6, sumbu)
    b += ext(X(0), Z(0) + 3, X(0), Z(0) + 28) + ext(X(A), Z(0) + 3, X(A), Z(0) + 28) + dim_h(X(0), X(A), Z(0) + 22, str(A))
    b += ext(X(0) - 3, Z(0), X(0) - 28, Z(0)) + ext(X(0) - 3, Z(H), X(0) - 28, Z(H)) + dim_v(X(0) - 22, Z(H), Z(0), str(H))
    yt = Z(H) - 16
    b += ext(X(xs), Z(H) - 3, X(xs), yt - 6) + ext(X(A), Z(zr) - 3, X(A), yt - 6) + dim_h(X(xs), X(A), yt, str(NA))
    xr = X(A) + 18
    b += ext(X(xs) + 3, Z(H), xr + 6, Z(H)) + ext(X(A) + 3, Z(zr), xr + 6, Z(zr)) + dim_v(xr, Z(H), Z(zr), str(NH), kiri=False)
    b += t(X(A / 2), Z(0) + 44, "Depan (dari −Y)", 10.5, AX, "middle", "600")
    # ── Atas (di atas Depan, sudut ketiga) ──
    b += _poli7([(X(0), DT(0)), (X(A), DT(0)), (X(A), DT(B)), (X(0), DT(B))])
    b += f'<line x1="{X(xs):.1f}" y1="{DT(0):.1f}" x2="{X(xs):.1f}" y2="{DT(B):.1f}" stroke="{CY}" stroke-width="1.2"/>'
    rl = D / 2 * k
    b += f'<circle cx="{X(hx):.1f}" cy="{DT(hd):.1f}" r="{rl:.1f}" fill="#0a101f" stroke="{CY}" stroke-width="1.6"/>'
    b += garis(X(hx), DT(hd) - rl - 7, X(hx), DT(hd) + rl + 7, sumbu)
    # garis potong A-A: rantai tipis, ujung tebal, panah menunjuk arah pandang (−Y = ke bawah pada pandangan Atas)
    ya = DT(hd)
    b += garis(X(0), ya, X(A), ya, ((10, 3, 2, 3), f'stroke="{PK}" stroke-width=".9"'))
    for xa, xb in ((X(0) - 10, X(0)), (X(A), X(A) + 10)):
        b += f'<line x1="{xa:.1f}" y1="{ya:.1f}" x2="{xb:.1f}" y2="{ya:.1f}" stroke="{PK}" stroke-width="2.4"/>'
        xm = (xa + xb) / 2
        b += _panah(xm, ya - 18, xm, ya - 2, PK, 1.4) + t(xm, ya - 24, "A", 11, PK, "middle", "700")
    # 30: bidang A-A (= pusat lubang) dari tepi depan; 60 (kedalaman) ada di pandangan Kanan
    xd = X(0) - 22
    b += ext(X(0) - 3, DT(0), xd - 6, DT(0)) + ext(X(0) - 13, ya, xd - 6, ya) + dim_v(xd, ya, DT(0), f"{B // 2}")
    # diameter lubang: garis diameter miring 60°, diteruskan ke luar tepi belakang
    ang = math.radians(60)
    q0 = (X(hx) - rl * math.cos(ang), ya + rl * math.sin(ang))
    q1 = (X(hx) + rl * math.cos(ang), ya - rl * math.sin(ang))
    q2 = (X(hx) + (ya - DT(B) + 10) / math.tan(ang), DT(B) - 10)
    b += f'<line x1="{q0[0]:.1f}" y1="{q0[1]:.1f}" x2="{q2[0]:.1f}" y2="{q2[1]:.1f}" stroke="{AM}" stroke-width="1"/>'
    b += f'<line x1="{q2[0]:.1f}" y1="{q2[1]:.1f}" x2="{q2[0] + 10:.1f}" y2="{q2[1]:.1f}" stroke="{AM}" stroke-width="1"/>'
    b += _kepala(q0[0], q0[1], -math.cos(ang), math.sin(ang)) + _kepala(q1[0], q1[1], math.cos(ang), -math.sin(ang))
    b += t(q2[0] + 14, q2[1] + 4, f"⌀{D}", 11, AM, "start", "600")
    b += t(X(0) + 2, DT(0) + 18, "Atas", 10.5, AX, "start", "600")
    # ── Kanan (di kanan Depan) ──
    b += _poli7([(DR(0), Z(0)), (DR(B), Z(0)), (DR(B), Z(H)), (DR(0), Z(H))])
    b += f'<line x1="{DR(0):.1f}" y1="{Z(zr):.1f}" x2="{DR(B):.1f}" y2="{Z(zr):.1f}" stroke="{CY}" stroke-width="1.2"/>'
    for dd in (hd - D / 2, hd + D / 2):
        b += garis(DR(dd), Z(0), DR(dd), Z(zr), tersembunyi)
    b += garis(DR(hd), Z(0) + 6, DR(hd), Z(zr) - 6, sumbu)
    b += ext(DR(0), Z(0) + 3, DR(0), Z(0) + 28) + ext(DR(B), Z(0) + 3, DR(B), Z(0) + 28) + dim_h(DR(0), DR(B), Z(0) + 22, str(B))
    b += t(DR(B / 2), Z(0) + 44, "Kanan", 10.5, AX, "middle", "600")
    # ── Potongan A-A (bidang y = tengah kedalaman, dilihat ke −Y) ──
    kiri = [(XS(A), Z(0)), (XS(hx + D / 2), Z(0)), (XS(hx + D / 2), Z(zr)), (XS(A), Z(zr))]
    kanan = [(XS(hx - D / 2), Z(0)), (XS(0), Z(0)), (XS(0), Z(H)), (XS(xs), Z(H)), (XS(xs), Z(zr)), (XS(hx - D / 2), Z(zr))]
    b += _poli7(kiri, GR, ".10", 1.6) + _poli7(kanan, GR, ".10", 1.6)
    b += _arsir45(XS(A), Z(zr), XS(hx + D / 2), Z(0))
    b += _arsir45(XS(hx - D / 2), Z(zr), XS(xs), Z(0)) + _arsir45(XS(xs), Z(H), XS(0), Z(0))
    b += garis(XS(hx), Z(0) + 6, XS(hx), Z(zr) - 6, sumbu)
    b += t(XS(A / 2), Z(H) - 10, "A-A (dilihat ke arah −Y)", 10.5, PK, "middle", "700")
    # ── Isometrik, Direction (1, −1, 1): Depan di kiri-bawah, Kanan di kanan ──
    si, cx, cy = 0.8, 548, 112
    P = lambda x, d, z: _iso(d, -x, z, cx, cy, si, 45, 35.264)
    b += _poli7([P(0, 0, H), P(xs, 0, H), P(xs, B, H), P(0, B, H)], CY, ".22", 1.2)
    b += _poli7([P(xs, 0, zr), P(xs, B, zr), P(xs, B, H), P(xs, 0, H)], CY, ".14", 1.2)
    b += _poli7([P(xs, 0, zr), P(A, 0, zr), P(A, B, zr), P(xs, B, zr)], CY, ".22", 1.2)
    el = [P(hx + D / 2 * math.cos(u / 36 * 2 * math.pi), hd + D / 2 * math.sin(u / 36 * 2 * math.pi), zr) for u in range(36)]
    b += '<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in el) + f'" fill="#0a101f" stroke="{CY}" stroke-width="1"/>'
    b += _poli7([P(A, 0, 0), P(A, B, 0), P(A, B, zr), P(A, 0, zr)], CY, ".14", 1.2)
    b += _poli7([P(x, 0, z) for x, z in prof], CY, ".10", 1.2)
    b += t(598, 28, "Isometrik (1, −1, 1)", 10.5, AX, "middle", "600")
    o = (482, 104)
    for (vx, vd, vz), warna, nama in [((1, 0, 0), RD, "X"), ((0, 1, 0), GN, "Y"), ((0, 0, 1), BL, "Z")]:
        p, q = P(26 * vx, 26 * vd, 26 * vz), P(0, 0, 0)
        e = (o[0] + (p[0] - q[0]) / si * 0.9, o[1] + (p[1] - q[1]) / si * 0.9)
        b += _panah(o[0], o[1], e[0], e[1], warna, 1.4)
        b += t(e[0] + (5 if vz == 0 else 0), e[1] + (12 if vx else (-4 if vz else -2)), nama, 10, warna, "start" if vz == 0 else "middle", "700")
    # ── kepala gambar: judul, skala, satuan, simbol sudut ketiga ──
    for x, y, w, h in [(400, 282, 160, 24), (400, 306, 80, 40), (480, 306, 80, 40), (560, 282, 104, 64)]:
        b += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#0e1628" stroke="{AX}" stroke-width="1"/>'
    b += t(480, 298, "Balok bertingkat", 11, TX, "middle", "700")
    b += t(440, 331, f"Skala {BT_SKALA}", 10.5, TX, "middle", "600")
    b += t(520, 331, "Satuan: mm", 10.5, TX, "middle", "600")
    b += _simbol_iso(606, 304, 1)
    b += t(612, 336, "Sudut ketiga", 10, AX, "middle")
    return svg(680, 360, b, "Gambar 7 — Gambar kerja balok bertingkat untuk praktik terbimbing")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-pandangan">Pandangan Standar</a>
  <a href="#m-kamera">Ortografik &amp; Perspektif</a>
  <a href="#m-proyeksi">Metode Proyeksi</a>
  <a href="#m-isometrik">Isometrik</a>
  <a href="#m-potongan">Potongan</a>
  <a href="#m-tampilan">Gaya Tampilan</a>
  <a href="#m-baca">BoundBox &amp; Luas</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,70 60,50 80,62 40,82" fill="rgba(255,179,0,.12)" stroke="rgba(255,179,0,.55)" stroke-width="1.4"/>
      <polygon points="20,70 40,82 40,126 20,114" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.2"/>
      <polygon points="40,82 80,62 80,106 40,126" fill="rgba(124,77,255,.12)" stroke="rgba(124,77,255,.55)" stroke-width="1.2"/>
      <line x1="50" y1="20" x2="50" y2="44" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <line x1="8" y1="150" x2="30" y2="130" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/>
      <line x1="96" y1="92" x2="84" y2="86" stroke="rgba(124,77,255,.6)" stroke-width="1.2"/>
      <rect x="14" y="160" width="30" height="20" fill="none" stroke="rgba(148,163,184,.5)" stroke-width="1"/>
      <rect x="14" y="184" width="30" height="14" fill="none" stroke="rgba(148,163,184,.5)" stroke-width="1"/>
      <rect x="48" y="160" width="14" height="20" fill="none" stroke="rgba(148,163,184,.5)" stroke-width="1"/>
      <text x="50" y="212" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">1 · 2 · 3</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,60 86,60 86,110 14,110" fill="rgba(0,229,255,.10)" stroke="rgba(0,229,255,.5)" stroke-width="1.3"/>
      <line x1="14" y1="110" x2="86" y2="60" stroke="rgba(0,229,255,.35)" stroke-width=".8"/>
      <line x1="24" y1="110" x2="86" y2="70" stroke="rgba(0,229,255,.35)" stroke-width=".8"/>
      <line x1="34" y1="110" x2="86" y2="80" stroke="rgba(0,229,255,.35)" stroke-width=".8"/>
      <line x1="44" y1="110" x2="86" y2="90" stroke="rgba(0,229,255,.35)" stroke-width=".8"/>
      <line x1="54" y1="110" x2="86" y2="100" stroke="rgba(0,229,255,.35)" stroke-width=".8"/>
      <line x1="6" y1="40" x2="94" y2="40" stroke="rgba(239,68,68,.6)" stroke-width="1" stroke-dasharray="6 2 2 2"/>
      <text x="8" y="34" fill="rgba(239,68,68,.7)" font-family="JetBrains Mono" font-size="8">A</text>
      <text x="86" y="34" fill="rgba(239,68,68,.7)" font-family="JetBrains Mono" font-size="8">A</text>
      <polygon points="30,150 70,130 90,142 50,162" fill="none" stroke="rgba(255,179,0,.5)" stroke-width="1.2" stroke-dasharray="4 2"/>
      <polygon points="30,150 50,162 50,196 30,184" fill="none" stroke="rgba(255,179,0,.5)" stroke-width="1.2" stroke-dasharray="4 2"/>
      <polygon points="50,162 90,142 90,176 50,196" fill="none" stroke="rgba(255,179,0,.5)" stroke-width="1.2" stroke-dasharray="4 2"/>
      <text x="50" y="212" text-anchor="middle" fill="rgba(255,179,0,.6)" font-family="JetBrains Mono" font-size="8">BoundBox</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="06">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">0 → isometrik</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">h′ = h·f/D</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">First / Third angle</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">k = √(2/3) ≈ 0,816</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Section A-A</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">BoundBox.XLength</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">√(a² + b² + c²)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">a·cosθ + b·sinθ</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 6 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Sudut Pandang</span><br>
      <em>dan Proyeksi:</em><br>
      <span class="hl-amber">Tampilan 3D yang Terbaca</span>
    </h1>
    <p class="hero-sub">Model 3D baru berguna bila dapat dilihat dan dibaca dengan benar: enam pandangan standar dan isometrik, kamera ortografik dan perspektif, metode proyeksi sudut pertama dan ketiga pada TechDraw Projection Group, potongan dan clipping plane untuk melihat bagian dalam, serta gaya tampilan, warna, material, dan transparansi. Setiap tampilan disertai besaran yang dapat dibaca dari model (luas muka, diagonal ruang, kotak pembatas, luas potongan) sehingga gambar kerja dapat diperiksa dari angka; tugasnya lima model FreeCAD berlembar TechDraw dengan satu bacaan geometri tiap model.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Pandangan, kamera, dan metode proyeksi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>FreeCAD + TechDraw, diskusi, dan tugas</small></div>
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

    # 01 — Pandangan standar dan navigasi
    isi = figure(1, "Enam pandangan standar dan tombol navigasi tampilan 3D", "Depan (1), Atas (2), dan Kanan (3) adalah tiga pandangan utama gambar teknik; Belakang, Bawah, dan Kiri melengkapinya, dan tombol 0 memberi isometrik. V lalu F memasukkan seluruh model ke layar.", gambar1())
    isi += tabel(["Pandangan (View → Standard views)", "Tombol", "Arah pandang", "Bidang yang tampak"],
                 [["<strong>Isometric</strong>", "0", "Sepanjang diagonal ruang (−1, 1, −1) ke pusat", "Tiga muka sekaligus"],
                  ["<strong>Front</strong> (Depan)", "1", "Dari −Y menuju +Y", "XZ: lebar dan tinggi"],
                  ["<strong>Top</strong> (Atas)", "2", "Dari +Z menuju −Z", "XY: lebar dan kedalaman"],
                  ["<strong>Right</strong> (Kanan)", "3", "Dari +X menuju −X", "YZ: kedalaman dan tinggi"],
                  ["Rear · Bottom · Left", "4 · 5 · 6", "Kebalikan Front, Top, Right", "Muka yang tersembunyi pada 1–3"],
                  ["Fit all · Fit selection", "V, F · V, S", "Kamera menjauh/mendekat, arah tetap", "Seluruh model / objek terpilih"],
                  ["Dimetric · Trimetric", "View → Standard views → Axonometric", "Dua atau tiga faktor pemendekan berbeda", "Alternatif isometrik"]])
    isi += cards([
        ("🧭", "Navigation cube", "Kubus di sudut kanan-atas tampilan 3D: klik muka untuk pandangan standar, klik rusuk atau sudut untuk pandangan miring, panah lengkung memutar 45° atau 90°, dan menu klik-kanan mengatur ortografik/perspektif serta ukuran kubus.", "klik muka · rusuk · sudut"),
        ("🖱️", "Gaya navigasi", "Edit → Preferences → Display → Navigation: CAD (bawaan), Blender, Gesture, TouchPad, OpenInventor, Maya, Revit. Gaya menentukan tombol tetikus untuk pan, zoom, rotate; rotasi berporos pada titik kursor bila diaktifkan.", "CAD · Blender · Gesture"),
        ("🎥", "Pan, zoom, rotate (gaya CAD)", "Tetikus tengah = pan; tengah + kiri (atau Ctrl + kanan) = rotate; roda = zoom ke kursor; klik tengah dua kali = pusatkan titik itu. Shift + roda memperhalus zoom; tombol kiri hanya memilih.", "tengah · roda · kiri"),
        ("📌", "Menyimpan pandangan", "View → Freeze display menyimpan dan memanggil kembali beberapa sudut pandang (Save views); dari Python, <code>Gui.ActiveDocument.ActiveView.getCamera()</code> dan <code>setCamera()</code> menyimpan kamera sebagai teks.", "Freeze display"),
    ])
    isi += tabel(["Aksi", "Gaya CAD (bawaan)", "Gaya Blender", "Gaya Gesture (layar sentuh)"],
                 [["Pilih", "Klik kiri", "Klik kiri", "Ketuk"],
                  ["Pan (geser)", "Tekan roda/tengah + geser", "Shift + tengah + geser", "Dua jari geser / kanan + geser"],
                  ["Rotate (putar)", "Tengah + kiri + geser (atau Ctrl + kanan)", "Tengah + geser", "Kiri + geser"],
                  ["Zoom", "Roda; Ctrl + Shift + roda halus", "Roda", "Cubit dua jari / roda"],
                  ["Pusatkan pada titik", "Klik tengah dua kali", "Klik tengah dua kali", "Ketuk dua kali"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 mengunci pandangan standar dan navigasi. Bagian 02 membedakan dua kamera (ortografik untuk kerja, perspektif untuk presentasi). Bagian 03–04 memindahkan pandangan ke kertas: metode proyeksi dan Projection Group (Tugas 1), isometrik dan diagonal ruang (Tugas 2). Bagian 05 membuka bagian dalam dengan potongan (Tugas 4), Bagian 06 mengatur gaya tampilan dan kotak pembatas (Tugas 3), Bagian 07 merangkum bacaan angka (termasuk pandangan bantu Tugas 5), dan Bagian 08–09 menutup dengan Python serta praktik TechDraw.")
    m += bagian(1, "m-pandangan", "Pandangan Standar dan Navigasi:<br>View Cube, Standard Views, Fit", "Sebelum menggambar, pemodel harus dapat melihat modelnya dari arah yang tepat dengan cepat. Bagian ini merangkum enam pandangan standar dan isometrik, tombol angka dan Fit, Navigation cube, gaya navigasi, dan cara menyimpan sudut pandang.", isi, "PANDANGAN STANDAR DAN NAVIGASI")

    # 02 — Ortografik vs perspektif
    isi = figure(2, "Proyeksi ortografik dan perspektif pada kamera tampilan 3D", f"Dua muka setinggi h = {H_OBJ} mm pada jarak berbeda: kamera ortografik memproyeksikan keduanya sama tinggi, kamera perspektif (jarak bidang gambar f = {F_CAM}) memproyeksikan muka dekat setinggi {ind(H_DEKAT, 1)} dan muka jauh {ind(H_JAUH, 1)} satuan layar.", gambar2())
    isi += formula(1, "Ukuran Tampak pada Kamera Perspektif dan Ortografik", r"h' = h\,\frac{f}{D} \ \ (\text{perspektif}), \qquad h' = h \ \ (\text{ortografik, skala tetap})",
                   r"\(h\) = tinggi benda &nbsp;·&nbsp; \(f\) = jarak titik mata ke bidang gambar &nbsp;·&nbsp; \(D\) = jarak titik mata ke benda. Contoh " + f"h = {H_OBJ}, f = {F_CAM}: D = {D_DEKAT} → h′ = {ind(H_DEKAT, 1)}; D = {D_JAUH} → h′ = {ind(H_JAUH, 1)}" + r".",
                   "Pada perspektif ukuran tampak berbanding terbalik dengan jarak, seperti mata manusia dan kamera foto; dua rusuk yang sama panjang tampak berbeda bila jaraknya berbeda. Pada ortografik semua garis proyeksi sejajar sehingga ukuran tampak hanya bergantung skala tampilan; karena itu ortografik adalah kamera kerja teknik, dan perspektif dipakai untuk presentasi atau render.",
                   [("h'", "Tinggi tampak pada bidang gambar"), ("h", "Tinggi benda (mm)"), ("f", "Jarak mata ke bidang gambar (mm)"), ("D", "Jarak mata ke benda (mm)")])
    isi += cards([
        ("📐", "Kamera ortografik", "View → Orthographic view (V, O). Garis proyeksi sejajar; rusuk sejajar tampak sejajar dan ukuran tidak berubah dengan jarak. Bawaan FreeCAD dan pilihan untuk memodelkan, memilih rusuk, dan membandingkan ukuran di layar.", "V, O"),
        ("👁️", "Kamera perspektif", "View → Perspective view (V, P). Garis proyeksi bertemu di titik mata; benda jauh mengecil dan rusuk sejajar tampak bertemu di titik hilang. Sudut pandang (height angle) sekitar 45° meniru mata; makin besar makin dramatis.", "V, P"),
        ("🔍", "Zoom pada dua kamera", "Ortografik: zoom mengubah skala tampilan (kamera tidak bergerak). Perspektif: zoom memindahkan kamera mendekat/menjauh, sehingga bentuk tampak ikut berubah; Fit all pada perspektif mengatur jarak, bukan skala.", "skala vs jarak"),
        ("🧱", "Mengukur di layar", "Ukuran di layar bukan ukuran benda pada kedua kamera: pakai Std Measure (Distance, Angle, Area) atau Python. Pada perspektif, dua rusuk sama panjang bahkan tampak berbeda.", "Std Measure"),
    ])
    isi += anim_panel(1, "cyan", "Kamera ortografik vs perspektif: balok yang berputar", "cvKamera",
                      [("sl_km_jarak", "v_km_jarak", "Jarak kamera D (mm)", 150, 600, 10, 250, "250"),
                       ("sl_km_a", "v_km_a", "Panjang balok a (mm)", 40, 140, 1, 100, "100"),
                       ("sl_km_el", "v_km_el", "Elevasi kamera (°)", 0, 60, 1, 25, "25")],
                      "btnKamera", "toggleKamera", "kameraInfo",
                      "<strong>Cara membaca:</strong> balok yang sama diputar di depan dua kamera. Kiri (ortografik): rusuk sejajar tetap sejajar dan muka depan-belakang sama besar. Kanan (perspektif): muka yang dekat kamera tampak lebih besar; perkecil D untuk memperkuat efeknya, perbesar D untuk mendekati ortografik. PAUSE menahan sudut putar.")
    isi += kotak("warning-box", "⚠️ <strong>Jangan mengukur dari tampilan perspektif:</strong> dua lubang berdiameter sama tampak berbeda bila jaraknya ke kamera berbeda, dan rusuk sejajar tampak bertemu. Kembalikan ke ortografik (V, O) sebelum membandingkan ukuran, dan ambil angka dari Std Measure atau Python, bukan dari layar.")
    m += bagian(2, "m-kamera", "Ortografik dan Perspektif:<br>Dua Kamera dalam Satu Tampilan", "FreeCAD menyediakan dua kamera dengan perilaku berbeda. Bagian ini menjelaskan proyeksi sejajar dan proyeksi ke titik mata, rumus ukuran tampak, perilaku zoom, dan mengapa ortografik menjadi kamera kerja teknik.", isi, "ORTOGRAFIK VS PERSPEKTIF")

    # 03 — Metode proyeksi dan TechDraw ProjectionGroup
    isi = figure(3, "Susunan tiga pandangan pada metode proyeksi sudut pertama dan sudut ketiga", f"Balok bertakik {A_T} × {B_T} × {H_T} yang sama menghasilkan pandangan Depan, Atas, dan Kanan yang identik pada kedua metode; yang berbeda hanya letaknya. Simbol kerucut terpancung pada kepala gambar memberi tahu bengkel metode mana yang dipakai.", gambar3())
    isi += tabel(["Aspek", "Sudut pertama (first angle, ISO-E)", "Sudut ketiga (third angle, ISO-A)"],
                 [["Letak bidang proyeksi", "Benda di antara pengamat dan bidang", "Bidang di antara pengamat dan benda"],
                  ["Pandangan atas", "Di <strong>bawah</strong> pandangan depan", "Di <strong>atas</strong> pandangan depan"],
                  ["Pandangan kanan", "Di <strong>kiri</strong> pandangan depan", "Di <strong>kanan</strong> pandangan depan"],
                  ["Simbol", "Kerucut terpancung lalu dua lingkaran", "Dua lingkaran lalu kerucut terpancung"],
                  ["Pemakaian", "Eropa, Indonesia (SNI ISO), bawaan ISO", "Amerika Serikat, Kanada, Jepang"],
                  ["TechDraw", "Projection Group → Projection Type: First Angle", "Projection Type: Third Angle (Default mengikuti Preferences → TechDraw)"]])
    isi += formula(2, "Skala Gambar dan Panjang Sebenarnya pada Pandangan Bantu", r"L_{kertas} = s\,L_{benda}, \qquad L_{miring} = \sqrt{a^{2} + (h_1 - h_2)^{2}}, \quad A_{miring} = b\,L_{miring}",
                   r"\(s\) = skala (1:2 → \(s = 0{,}5\)) &nbsp;·&nbsp; \(a\) = alas trapesium, \(h_1, h_2\) = tinggi kiri dan kanan, \(b\) = kedalaman Pad. Contoh baji " + f"a = {A_W}, h₁ = {H1_W}, h₂ = {H2_W}, b = {B_W}" + r": \(L_{miring} = " + ind(L_MIRING, 3) + r"\), \(A_{miring} = " + ind(A_MIRING, 2) + r"\) mm².",
                   "Pandangan standar hanya memperlihatkan ukuran sebenarnya untuk muka yang sejajar bidang proyeksi; muka miring tampak memendek (pada pandangan atas, muka miring baji tampak selebar a, padahal panjangnya L_miring). Pandangan bantu (auxiliary view) memproyeksikan tegak lurus muka miring sehingga ukuran dan luasnya sebenarnya; pada model 3D, Face.Area langsung memberi luas sebenarnya.",
                   [("s", "Skala gambar (tanpa satuan)"), ("L_{kertas}, L_{benda}", "Panjang pada kertas dan pada benda (mm)"), ("a, h_1, h_2", "Alas dan dua tinggi trapesium baji (mm)"), ("b", "Kedalaman Pad (mm)"), ("A_{miring}", "Luas sebenarnya muka miring (mm²)")])
    isi += anim_panel(2, "amber", "Tiga pandangan dari satu benda: proyeksi bergerak ke bidang gambar", "cvTigaPandangan",
                      [("sl_tp_a", "v_tp_a", "Lebar balok a (mm)", 60, 160, 1, 120, "120"),
                       ("sl_tp_H", "v_tp_H", "Tinggi balok H (mm)", 30, 120, 1, 80, "80"),
                       ("sl_tp_hn", "v_tp_hn", "Tinggi takik h_n (mm)", 5, 50, 1, 24, "24"),
                       ("sl_tp_metode", "v_tp_metode", "Metode (0 sudut pertama · 1 sudut ketiga)", 0, 1, 1, 1, "sudut ketiga")],
                      "btnTigaPandangan", "toggleTigaPandangan", "tigaPandanganInfo",
                      "<strong>Cara membaca:</strong> balok bertakik di kiri diproyeksikan bergantian ke pandangan Depan, Atas, dan Kanan (garis proyeksi bergerak). Ubah metode untuk melihat susunan berpindah: Atas ke bawah dan Kanan ke kiri pada sudut pertama. Luas muka depan a·H − (a/2)·h_n dihitung di bawah; PAUSE menahan satu pandangan.")
    isi += tabel(["Langkah TechDraw", "Perintah", "Catatan"],
                 [["1. Lembar", "TechDraw → Insert Page using Template (A4/A3 Landscape ISO)", "Kepala gambar memuat kolom skala dan metode proyeksi"],
                  ["2. Pandangan utama + sekunder", "Pilih Body → Insert Projection Group", "Panel Tasks: arah Front (Current view / X, Y, Z), centang Top, Right, Left, Bottom, dan pandangan aksonometri"],
                  ["3. Skala", "Scale Type: Page / Automatic / Custom", "Custom 1:2 → Scale 0,5; semua pandangan grup mengikuti"],
                  ["4. Metode proyeksi", "Projection Type: First / Third Angle", "Default mengikuti Preferences → TechDraw → General"],
                  ["5. Pandangan bantu / potongan", "Insert View (Direction) · Insert Section View", "Direction = normal muka miring; Section dari pandangan induk"],
                  ["6. Dimensi dan anotasi", "Length, Diameter, Angle; Insert Annotation", "Dimensi membaca model 3D, bukan gambar; skala tidak mengubah nilai"],
                  ["7. Ekspor", "Export Page as PDF / SVG / DXF", "PDF untuk bengkel; DXF bila akan dipesin"]])
    isi += kotak("info-box", "<strong>🧭 Memilih arah Depan:</strong> pandangan depan sebaiknya memperlihatkan bentuk paling khas benda dengan garis tersembunyi paling sedikit, biasanya muka terpanjang pada posisi kerja. Pada Tugas 1 muka depan adalah profil bertakik pada bidang XZ; jadikan Front direction menghadap bidang itu sebelum menambah Top dan Right agar susunan pandangan bermakna.")
    m += bagian(3, "m-proyeksi", "Metode Proyeksi dan<br>TechDraw Projection Group", "Gambar kerja memindahkan model ke kertas lewat tiga pandangan yang susunannya diatur metode proyeksi. Bagian ini membahas sudut pertama dan ketiga, skala, pandangan bantu untuk muka miring, dan langkah Projection Group di TechDraw.", isi, "METODE PROYEKSI DAN TECHDRAW")

    # 04 — Isometrik dan aksonometri
    isi = figure(4, "Proyeksi isometrik balok, faktor pemendekan, dan diagonal ruang", f"Balok {A_I} × {B_I} × {C_I} dipandang sepanjang diagonal ruangnya: sumbu X dan Y miring 30° dari mendatar, Z tegak, dan setiap rusuk memendek dengan faktor √(2/3) ≈ {ind(K_ISO, 3)}. Diagonal ruang (0, 0, 0)–(a, b, c) = {ind(DIAG, 3)} mm.", gambar4())
    isi += formula(3, "Faktor Pemendekan Isometrik dan Diagonal Ruang", r"k = \cos 35{,}264^\circ = \sqrt{\tfrac{2}{3}} \approx 0{,}816, \qquad d = \sqrt{a^{2} + b^{2} + c^{2}}",
                   r"\(k\) = rasio panjang tampak terhadap panjang sebenarnya untuk rusuk sejajar sumbu &nbsp;·&nbsp; \(d\) = diagonal ruang balok \(a \times b \times c\). Contoh " + f"{A_I} × {B_I} × {C_I}" + r": \(d = " + ind(DIAG, 3) + r"\) mm; rusuk " + str(A_I) + r" tampak " + ind(A_I * K_ISO, 1) + r".",
                   "Isometrik memandang kubus tepat sepanjang diagonal ruangnya, sehingga tiga sumbu membentuk sudut 120° dan memendek sama besar; sudut pandang terhadap tiap sumbu adalah 35,264° = arctan(1/√2). Gambar isometrik teknik biasanya digambar skala penuh (isometric drawing) agar mudah diukur; itulah yang dilakukan TechDraw. Diagonal ruang adalah jarak terjauh dua titik balok dan sama dengan BoundBox.DiagonalLength.",
                   [("k", "Faktor pemendekan isometrik"), ("d", "Diagonal ruang (mm)"), ("a, b, c", "Panjang, lebar, tinggi balok (mm)")])
    isi += cards([
        ("🔷", "Isometrik", "Ketiga sumbu berjarak 120°, faktor pemendekan sama (0,816). Satu klik: tombol 0 atau muka kubus navigasi di sudut. TechDraw: centang pandangan aksonometri (FrontTopRight dsb.) pada Projection Group.", "3 sumbu 120°"),
        ("🔶", "Dimetrik", "Dua sumbu memendek sama, sumbu ketiga berbeda (mis. 1 : 1 : ½). Memberi kesan lebih alami untuk benda panjang; View → Standard views → Axonometric → Dimetric.", "2 faktor"),
        ("🔸", "Trimetrik", "Ketiga faktor pemendekan berbeda; paling fleksibel, paling jarang untuk gambar teknik. Tersedia pada menu Axonometric yang sama.", "3 faktor"),
        ("📏", "Isometric drawing vs projection", "Proyeksi isometrik sejati memendekkan 0,816; gambar isometrik teknik (TechDraw, sketsa tangan) memakai skala penuh sehingga tampak 1,22 kali lebih besar. Ukuran tetap dibaca dari model, bukan dari gambar.", "0,816 vs 1,0"),
    ])
    isi += tabel(["Jenis aksonometri", "Sudut sumbu (dari mendatar)", "Faktor pemendekan", "Di FreeCAD"],
                 [["Isometrik", "30° · 30° · tegak", f"{ind(K_ISO, 3)} · {ind(K_ISO, 3)} · {ind(K_ISO, 3)}", "Tombol 0; TechDraw iso view"],
                  ["Dimetrik (umum)", "7° · 42° · tegak", "1 · 1 · ½ (pendekatan)", "Axonometric → Dimetric"],
                  ["Trimetrik", "Bebas (mis. 12° · 23°)", "Tiga nilai berbeda", "Axonometric → Trimetric"],
                  ["Pandangan bebas", "Hasil rotasi tetikus", "Bergantung arah kamera", "Gui.ActiveDocument.ActiveView.getViewDirection()"]])
    isi += kotak("tip-box", "💡 <strong>Membaca diagonal ruang (Tugas 2):</strong> Std Measure → Distance lalu klik dua vertex yang berlawanan (0, 0, 0) dan (a, b, c); atau Python <code>Body.Shape.BoundBox.DiagonalLength</code>. Pada tampilan isometrik kedua vertex itu berimpit di tengah gambar (pandangan tepat sepanjang diagonal), jadi pilih vertex pada pandangan lain atau putar sedikit kamera.")
    m += bagian(4, "m-isometrik", "Isometrik dan Aksonometri:<br>Foreshortening dan Diagonal Ruang", "Pandangan isometrik memperlihatkan tiga muka sekaligus dengan pemendekan yang sama. Bagian ini menurunkan faktor 0,816 dan sudut 120°, membedakan gambar isometrik dari proyeksinya, mengenalkan dimetrik dan trimetrik, dan mengaitkannya dengan diagonal ruang balok.", isi, "ISOMETRIK DAN AKSONOMETRI")

    # 05 — Potongan dan clipping plane
    isi = figure(5, "Section View A-A balok berlubang dan luas penampang potongan", f"Balok {A_S} × {B_S} × {H_S} berlubang ⌀{D_S} dipotong bidang y = b/2 melalui pusat lubang: penampang {A_S} × {H_S} terbelah celah selebar d, luas totalnya h·(a − d) = {ind(A_POTONG, 0)} mm².", gambar5())
    isi += formula(4, "Luas Penampang Potongan Balok Berlubang", r"A_{potong} = h\,(a - w), \qquad w = 2\sqrt{r^{2} - e^{2}} \ \ (e < r), \qquad e = 0 \Rightarrow A_{potong} = h\,(a - d)",
                   r"\(a, h\) = lebar dan tinggi balok &nbsp;·&nbsp; \(r = d/2\) = radius lubang &nbsp;·&nbsp; \(e\) = jarak bidang potong ke pusat lubang &nbsp;·&nbsp; \(w\) = lebar celah pada bidang itu. Contoh " + f"{A_S} × {H_S}, ⌀{D_S}: e = 0 → A = {ind(A_POTONG, 0)}; e = {E_S} → w = {ind(W_S, 2)}, A = {ind(H_S * (A_S - W_S), 1)}" + r" mm².",
                   "Bidang potong sejajar XZ memotong balok menjadi persegi panjang a × h; bila bidang mengenai lubang, celah selebar tali busur w hilang dari penampang. Tepat di pusat lubang w = d (celah terlebar, luas terkecil); di luar lubang (e ≥ r) penampang utuh a·h. Python slice memberi wire penampang yang luasnya diperiksa Part.Face(w).Area, cara memeriksa Tugas 4.",
                   [("A_{potong}", "Luas penampang potongan (mm²)"), ("a, h", "Lebar dan tinggi balok (mm)"), ("d, r", "Diameter dan radius lubang (mm)"), ("e", "Jarak bidang potong ke pusat lubang (mm)"), ("w", "Lebar celah lubang pada bidang potong (mm)")])
    isi += tabel(["Alat", "Tempat", "Yang dihasilkan", "Mengubah model?"],
                 [["<strong>Section View</strong>", "TechDraw → Insert Section View (dari pandangan induk)", "Pandangan 2D potongan dengan garis potong A-A, panah arah, arsiran (Hatch)", "Tidak"],
                  ["<strong>Complex Section</strong>", "TechDraw → Insert Complex Section", "Potongan berbelok (offset) mengikuti sketsa garis potong", "Tidak"],
                  ["<strong>Clipping plane</strong>", "View → Clipping plane (Ctrl+kanan pada kubus)", "Tampilan 3D terpotong sementara; bisa XYZ atau bidang bebas", "Tidak (tampilan saja)"],
                  ["<strong>Cross-sections</strong>", "Part → Cross-sections", "Kurva (wire) irisan pada satu atau banyak bidang sejajar", "Tidak (objek baru)"],
                  ["<strong>Shape.slice</strong>", "Python: <code>sh.slice(arah, jarak)</code>", "Daftar wire irisan; luas lewat Part.Face(w).Area", "Tidak"],
                  ["<strong>Pocket / Boolean Cut</strong>", "Part Design / Part", "Model benar-benar terpotong", "Ya — hanya bila memang dirancang begitu"]])
    isi += anim_panel(3, "green", "Bidang potong bergeser: luas potongan balok berlubang", "cvPotong",
                      [("sl_pt_a", "v_pt_a", "Lebar balok a (mm)", 60, 160, 1, 120, "120"),
                       ("sl_pt_h", "v_pt_h", "Tinggi balok h (mm)", 10, 80, 1, 40, "40"),
                       ("sl_pt_d", "v_pt_d", "Diameter lubang d (mm)", 6, 50, 1, 24, "24"),
                       ("sl_pt_y", "v_pt_y", "Posisi bidang potong y₀/b (saat PAUSE)", 0.05, 0.95, 0.01, 0.5, "0,50")],
                      "btnPotong", "togglePotong", "potongInfo",
                      "<strong>Cara membaca:</strong> garis potong A-A pada pandangan atas (kiri) bergerak maju-mundur; penampang di kanan mengikuti: utuh a·h di luar lubang, terbelah celah w = 2√(r² − e²) saat mengenai lubang, dan tersempit h·(a − d) tepat di pusat. PAUSE lalu geser y₀/b untuk menempatkan bidang sendiri.")
    isi += kotak("warning-box", "⚠️ <strong>Clipping plane bukan potongan:</strong> ia hanya menyembunyikan sebagian tampilan dan tidak tersimpan di gambar. Jangan memotong model dengan Pocket hanya untuk melihat isinya; pakai clipping plane atau transparansi (Bagian 06) untuk melihat, dan Section View untuk menggambar. Pada Section View, arah panah menentukan bagian mana yang tetap terlihat di balik bidang potong.")
    m += bagian(5, "m-potongan", "Potongan dan Clipping Plane:<br>Melihat Bagian Dalam Benda", "Lubang, rongga, dan dinding dalam tidak terlihat pada pandangan luar. Bagian ini membahas Section View TechDraw, Cross-sections dan slice di Part/Python, clipping plane sebagai alat lihat sementara, dan luas penampang potongan sebagai angka yang diperiksa.", isi, "POTONGAN DAN CLIPPING PLANE")

    # 06 — Gaya tampilan, warna, material, transparansi
    isi = tabel(["Gaya gambar (View → Draw style)", "Yang tampak", "Kapan dipakai"],
                [["<strong>As is</strong>", "Mengikuti Display Mode tiap objek", "Bawaan"],
                 ["<strong>Flat lines</strong>", "Muka berwarna + rusuk hitam", "Pemodelan sehari-hari (paling jelas)"],
                 ["<strong>Shaded</strong>", "Muka berwarna tanpa rusuk", "Presentasi, tangkapan layar"],
                 ["<strong>Wireframe</strong>", "Hanya rusuk, tembus pandang", "Melihat rongga dalam dan tumpang tindih"],
                 ["<strong>Hidden line</strong>", "Rusuk terlihat + rusuk tersembunyi putus-putus", "Memeriksa garis tersembunyi seperti gambar teknik"],
                 ["<strong>No shading</strong>", "Muka warna rata tanpa cahaya", "Membandingkan warna material"],
                 ["<strong>Points</strong>", "Hanya vertex", "Memeriksa titik sketsa/mesh"]])
    isi += cards([
        ("🎨", "Warna dan Appearance", "Klik kanan objek → Appearance: warna muka (Shape color), rusuk (Line color), titik, lebar garis, dan Material tampilan (ambient, diffuse, specular, emissive, shininess). Pada FreeCAD 1.0 warna muka tersimpan pada properti ShapeAppearance.", "Appearance"),
        ("🧪", "Material (FreeCAD 1.0)", "Tab Data Body → Material: memilih bahan dari pustaka (baja, aluminium, ABS, …) yang membawa massa jenis dan tampilan sekaligus; Std Measure dan FEM membaca massa jenisnya. Editor material menambah bahan baru.", "ρ + tampilan"),
        ("🫧", "Transparansi", "Tab View → Transparency 0–100 (atau klik kanan → Transparency). Rongga, lubang tembus, dan komponen di dalam terlihat tanpa memotong model; kombinasikan dengan Flat lines agar rusuk tetap tegas.", "0–100 %"),
        ("📦", "Bounding box tampilan", "Tab View → Bounding box (True) menggambar kotak pembatas sejajar sumbu global di sekeliling objek, yang membesar saat objek diputar lewat Placement; angkanya dibaca dari Shape.BoundBox (Tugas 3).", "View → Bounding box"),
    ])
    isi += anim_panel(4, "violet", "Kotak pembatas balok yang diputar θ: BoundBox.XLength", "cvBoundBox",
                      [("sl_bb_a", "v_bb_a", "Panjang alas a (mm)", 40, 140, 1, 120, "120"),
                       ("sl_bb_b", "v_bb_b", "Lebar alas b (mm)", 20, 100, 1, 80, "80"),
                       ("sl_bb_theta", "v_bb_theta", "Sudut putar θ (°, saat PAUSE)", 0, 90, 1, 30, "30")],
                      "btnBoundBox", "toggleBoundBox", "boundBoxInfo",
                      "<strong>Cara membaca:</strong> alas balok (tampak atas) diputar 0°–90° terhadap sumbu Z di titik asal; kotak putus-putus adalah Bounding box tampilan yang selalu sejajar sumbu global. Grafik kanan menggambar XLength = a·cosθ + b·sinθ: naik sampai √(a² + b²) saat tan θ = b/a, lalu turun ke b pada 90°. PAUSE lalu geser θ untuk membaca satu sudut.")
    isi += tabel(["Render sederhana", "Perintah", "Catatan"],
                [["Tangkapan layar", "Tools → Save picture (Std ViewScreenShot)", "Ukuran piksel bebas, latar transparan/putih, pilih perspektif + Shaded untuk presentasi"],
                 ["Cahaya dan latar", "Preferences → Display → 3D View / Colors", "Headlight, backlight, latar gradien atau polos"],
                 ["Bayangan", "View → Draw style → Shadow", "Bayangan jatuh dan pencahayaan lembut langsung di tampilan 3D"],
                 ["Render Workbench (addon)", "Render → Project (Cycles, LuxCore, POV-Ray, Appleseed)", "Render fotorealistik dengan material dan kamera perspektif; opsional"],
                 ["Ekspor untuk presentasi", "File → Export → glTF / OBJ / PDF 3D", "Model dilihat di peramban atau pemirsa 3D lain"]])
    isi += kotak("tip-box", "💡 <strong>Tampilan untuk rapat dengan bengkel:</strong> gunakan Flat lines, warna berbeda per komponen, transparansi 50–70 % pada rumah/casing, kamera perspektif hanya untuk tangkapan layar presentasi, dan simpan pandangan kerja (Freeze display) agar setiap orang melihat sudut yang sama. Untuk gambar kerja tetap pakai lembar TechDraw ortografik.")
    m += bagian(6, "m-tampilan", "Gaya Tampilan, Warna, Material,<br>Transparansi, dan Render Sederhana", "Tampilan yang tepat mempercepat pemeriksaan model dan komunikasi. Bagian ini merangkum draw style, Appearance dan Material FreeCAD 1.0, transparansi, kotak pembatas tampilan yang membesar saat benda diputar, dan render sederhana untuk laporan.", isi, "GAYA TAMPILAN DAN RENDER")

    # 07 — Bacaan: BoundBox, Face.Area, luas potongan
    isi = figure(6, "Kotak pembatas (BoundBox) balok yang diputar θ terhadap sumbu Z", f"Alas {A_R} × {B_R} diputar {TH_R}°: kotak pembatas sejajar sumbu global membesar menjadi XLength = a·cosθ + b·sinθ = {ind(XLEN, 3)} dan YLength = a·sinθ + b·cosθ = {ind(YLEN, 3)} mm; ZLength tetap.", gambar6())
    isi += formula(5, "Kotak Pembatas Setelah Rotasi dan Luas Muka Bertakik", r"X_{Length} = a\cos\theta + b\sin\theta, \quad Y_{Length} = a\sin\theta + b\cos\theta \ \ (0^\circ \le \theta \le 90^\circ); \qquad A_{depan} = a\,H - \tfrac{a}{2}\,h_n",
                   r"\(a, b\) = sisi alas &nbsp;·&nbsp; \(\theta\) = sudut Placement terhadap Z &nbsp;·&nbsp; \(H\) = tinggi balok, \(h_n\) = tinggi takik selebar \(a/2\). Contoh " + f"{A_R} × {B_R}, θ = {TH_R}°: XLength = {ind(XLEN, 3)}; balok bertakik {A_T} × {H_T}, takik {A_T // 2} × {HN_T}: A_depan = {ind(A_DEPAN, 0)}" + r" mm².",
                   "Kotak pembatas adalah kotak sejajar sumbu global yang memuat seluruh benda; sudut-sudut alas yang diputar memberi x terbesar a·cosθ dan terkecil −b·sinθ, selisihnya XLength. Luas muka depan balok bertakik adalah luas profil sketsanya sendiri: persegi panjang a × H dikurangi takik (a/2) × h_n, yang sama dengan Face.Area muka itu.",
                   [("X_{Length}, Y_{Length}", "Ukuran kotak pembatas searah X dan Y global (mm)"), ("a, b", "Sisi alas balok (mm)"), (r"\theta", "Sudut rotasi Placement terhadap Z"), ("A_{depan}", "Luas muka depan (mm²)"), ("H, h_n", "Tinggi balok dan tinggi takik (mm)")])
    isi += tabel(["Bacaan", "Std Measure", "Python console", "Tugas"],
                 [["Luas satu muka", "Area (klik muka)", "<code>Shape.Faces[i].Area</code>; pilih muka lewat <code>normalAt(0,0)</code>", "T1 (muka depan), T5 (muka miring)"],
                  ["Jarak dua vertex / diagonal ruang", "Distance (klik dua vertex)", "<code>Shape.BoundBox.DiagonalLength</code>", "T2"],
                  ["Kotak pembatas setelah Placement", "— (tampilan Bounding box)", "<code>Shape.BoundBox.XLength / YLength / ZLength</code>", "T3"],
                  ["Luas potongan pada bidang", "— (Section View + Hatch)", "<code>sum(Part.Face(w).Area for w in sh.slice(arah, jarak))</code>", "T4"],
                  ["Panjang sebenarnya rusuk miring", "Distance (dua vertex rusuk)", "<code>Edge.Length</code>", "T5 (pemeriksaan)"],
                  ["Volume dan massa", "Volume; Material", "<code>Shape.Volume</code>, ρ·V", "Modul 5"]])
    isi += kotak("tip-box", "💡 <strong>Indeks muka bisa berubah:</strong> <code>Faces[5]</code> pada satu komputer belum tentu muka yang sama di komputer lain setelah recompute. Pilih muka dari sifatnya: normalnya (<code>f.normalAt(0,0)</code>), luasnya (<code>max(..., key=lambda f: f.Area)</code>), atau titik beratnya (<code>f.CenterOfMass</code>). BoundBox mengikuti Placement objek (koordinat global), sedangkan dimensi sketsa tetap lokal; <code>optimalBoundingBox()</code> memberi kotak ketat tanpa pelebaran toleransi.")
    m += bagian(7, "m-baca", "Bacaan Tampilan:<br>BoundBox, Face.Area, dan Luas Potongan", "Setiap pandangan pada modul ini memiliki angka yang dapat dibaca dari model. Bagian ini memetakan lima bacaan tugas ke Std Measure dan Python: luas muka, diagonal ruang, kotak pembatas setelah rotasi, luas potongan, dan luas sebenarnya muka miring.", isi, "BACAAN BOUNDBOX DAN LUAS")

    # 08 — Python console
    isi = kode("Python console — balok, kotak pembatas, diagonal ruang, dan pandangan standar", f'''import FreeCAD as App, FreeCADGui as Gui, Part
doc = App.newDocument("Latihan6")
a, b, c = {A_I}, {B_I}, {C_I}
balok = doc.addObject("Part::Box", "Balok")
balok.Length, balok.Width, balok.Height = a, b, c
doc.recompute()
bb = balok.Shape.BoundBox
print(f"BoundBox: X {{bb.XLength:.3f}}  Y {{bb.YLength:.3f}}  Z {{bb.ZLength:.3f}} mm")
print(f"Diagonal ruang = {{bb.DiagonalLength:.3f}} mm  (rumus {{(a*a + b*b + c*c) ** 0.5:.3f}})")   # {ind(DIAG, 3)}
v = Gui.ActiveDocument.ActiveView
v.viewIsometric(); v.fitAll()                      # sama dengan tombol 0 lalu V, F
print(f"arah pandang isometrik = {{v.getViewDirection()}}")   # vektor satuan menuju benda
v.setCameraType("Perspective")                     # V, P  (kembali: "Orthographic" = V, O)
print(f"kamera: {{v.getCameraType()}}")
v.viewFront()                                      # tombol 1: dari -Y menuju +Y''', "Python (FreeCAD)")
    isi += kode("Python console — rotasi Placement, BoundBox.XLength, dan gaya tampilan", f'''import FreeCAD as App, math
doc = App.ActiveDocument
a, b, th = {A_R}, {B_R}, {TH_R}
balok = doc.getObject("Balok")
balok.Length, balok.Width = a, b
balok.Placement = App.Placement(App.Vector(0, 0, 0), App.Rotation(App.Vector(0, 0, 1), th))   # putar th derajat terhadap Z
doc.recompute()
bb, r = balok.Shape.BoundBox, math.radians(th)
print(f"XLength = {{bb.XLength:.3f}}  (rumus a*cos + b*sin = {{a*math.cos(r) + b*math.sin(r):.3f}})")   # {ind(XLEN, 3)}
print(f"YLength = {{bb.YLength:.3f}}  (rumus a*sin + b*cos = {{a*math.sin(r) + b*math.cos(r):.3f}})")   # {ind(YLEN, 3)}
print(f"ZLength = {{bb.ZLength:.3f}}  (tidak berubah)")
ob = balok.Shape.optimalBoundingBox()                 # kotak ketat tanpa pelebaran toleransi
print(f"optimal: {{ob.XLength:.3f}} x {{ob.YLength:.3f}} x {{ob.ZLength:.3f}}")
vo = balok.ViewObject
vo.BoundingBox = True                                 # gambar kotak pembatas di tampilan 3D
vo.Transparency = 60                                  # tembus pandang 60 %
vo.DisplayMode = "Flat Lines"                         # muka berwarna + rusuk
vo.ShapeAppearance = (App.Material(DiffuseColor=(0.13, 0.83, 0.93)),)   # warna muka (FreeCAD 1.0)''', "Python (FreeCAD)")
    isi += kode("Python console — luas potongan (slice), luas muka depan, dan luas muka miring baji", f'''import FreeCAD as App, Part
V = App.Vector
a, b, h, d = {A_S}, {B_S}, {H_S}, {D_S}
sh = Part.makeBox(a, b, h).cut(Part.makeCylinder(d/2, h, V(a/2, b/2, 0)))
irisan = sh.slice(V(0, 1, 0), b/2)                    # wire potongan pada bidang y = b/2
A_pot = sum(Part.Face(w).Area for w in irisan)
print(f"Luas potongan A-A = {{A_pot:.2f}} mm^2  (rumus h*(a-d) = {{h*(a-d):.2f}})")   # {ind(A_POTONG, 2)}
e = {E_S}                                                # bidang digeser e dari pusat lubang
A_geser = sum(Part.Face(w).Area for w in sh.slice(V(0, 1, 0), b/2 + e))
print(f"Bidang y = b/2 + {{e}}: A = {{A_geser:.2f}}  (rumus h*(a - 2*sqrt(r^2-e^2)) = {{h*(a - 2*((d/2)**2 - e*e)**0.5):.2f}})")   # {ind(H_S * (A_S - W_S), 2)}
depan = [f for f in sh.Faces if abs(abs(f.normalAt(0, 0).y) - 1) < 1e-6]   # muka dengan normal sejajar Y (depan & belakang)
print(f"Luas muka depan balok = {{depan[0].Area:.2f}} mm^2  (a*h = {{a*h}})")
# baji: trapesium XZ (0,0)-(a2,0)-(a2,h2)-(0,h1) di-Pad b2 searah Y
a2, h1, h2, b2 = {A_W}, {H1_W}, {H2_W}, {B_W}
prof = Part.Face(Part.makePolygon([V(0,0,0), V(a2,0,0), V(a2,0,h2), V(0,0,h1), V(0,0,0)]))
baji = prof.extrude(V(0, b2, 0))
miring = [f for f in baji.Faces if 0.01 < abs(f.normalAt(0, 0).z) < 0.99][0]   # satu-satunya muka bernormal miring
L = (a2**2 + (h1 - h2)**2) ** 0.5
print(f"Luas muka miring = {{miring.Area:.2f}} mm^2  (rumus b*L = {{b2*L:.2f}}, L = {{L:.3f}})")   # {ind(A_MIRING, 2)}
Part.show(sh, "BalokBerlubang"); Part.show(baji, "Baji")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (diagonal ruang " + ind(DIAG, 3) + " mm, XLength " + ind(XLEN, 3) + " mm, luas potongan " + ind(A_POTONG, 2) + " mm², luas muka miring " + ind(A_MIRING, 2) + " mm²). Tugas meminta model dibuat dengan Part Design (Body, Sketch, Pad, Pocket) dan lembar TechDraw yang tersimpan di berkas .FCStd; Part API di sini hanya untuk memeriksa rumus dan membaca angka.")
    m += bagian(8, "m-python", "Python Console:<br>Membaca Tampilan dan Geometri", "Cell pertama membaca kotak pembatas dan diagonal ruang lalu mengendalikan kamera (isometrik, Fit, perspektif); cell kedua memutar Placement dan membaca XLength serta mengatur transparansi dan warna; cell ketiga menghitung luas potongan lewat slice, luas muka depan, dan luas muka miring baji.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Model balok bertingkat berlubang", f"Body → Sketch XZ: profil tangga 6 titik ({BT_A} lebar, {BT_H} tinggi; anak tangga {BT_NA} × {BT_NH} dibuang di kanan-atas), fully constrained → Pad {BT_B}. Sketch di muka atas tingkat rendah: lingkaran ⌀{BT_D} → Pocket Through all."),
               ("2", "Pandangan dan kamera", "Tekan 0, 1, 2, 3 lalu V, F; bandingkan V, O dan V, P dengan memutar model (Navigation cube). Simpan sudut kerja lewat View → Freeze display → Save views."),
               ("3", "Lembar dan Projection Group", f"TechDraw → Insert Page using Template (A4 Landscape ISO). Pilih Body → Insert Projection Group: Front dari arah −Y, centang Top dan Right, Projection Type Third Angle, Scale Custom {BT_SKALA}. Geser grup ke tengah lembar."),
               ("4", "Pandangan isometrik", "Pada Projection Group centang FrontTopRight (iso) atau Insert View dengan Direction (1, −1, 1). Perhatikan rusuk digambar skala penuh, bukan 0,816."),
               ("5", "Section View A-A", "Pilih pandangan Top → Insert Section View: bidang melalui pusat lubang sejajar X, arah panah ke −Y, nama A. Tambahkan Hatch pada muka potongan dan periksa bagian di balik bidang."),
               ("6", "Dimensi, simbol, ekspor", "Beri dimensi Length pada lebar dan tinggi, Diameter pada lubang; tulis metode proyeksi dan skala pada kepala gambar (simbol kerucut terpancung). Export Page as PDF."),
               ("7", "Bacaan dan simpan", f"Di Python: luas muka depan (Face.Area), BoundBox.DiagonalLength, luas potongan lewat slice pada bidang tengah kedalaman, y = (BoundBox.YMin + BoundBox.YMax)/2 = −{BT_B // 2} (Pad dari sketsa XZ mengarah ke −Y); putar Body 25° terhadap Z dan baca XLength, lalu kembalikan ke 0°. Ctrl+S → <code>Latihan6_NIM.FCStd</code> (lembar TechDraw ikut tersimpan).")]
    isi = figure(7, "Gambar kerja target praktik: balok bertingkat berlubang",
                 f"Satuan mm; lembar A4 sudut ketiga skala {BT_SKALA} (langkah 3 dan 6). Balok dari langkah 1: profil tangga {BT_A} × {BT_H} dengan anak tangga {BT_NA} × {BT_NH} dibuang di kanan-atas, Pad {BT_B}, dan lubang ⌀{BT_D} tembus di muka atas tingkat rendah. Isometrik memakai arah (1, −1, 1) (langkah 4); potongan A-A melalui pusat lubang, {BT_B // 2} dari muka depan, dilihat ke arah −Y (langkah 5) sehingga kiri-kanannya terbalik terhadap pandangan Depan.",
                 gambar7())
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
                 [["Projection Group kosong / tidak muncul", "Tidak ada objek terpilih, atau yang dipilih fitur (Pad), bukan Body", "Pilih Body di pohon lalu Insert Projection Group"],
                  ["Pandangan terlalu besar atau keluar lembar", "Scale Type Page/Automatic tidak cocok", "Scale Type Custom, isi 0,5 untuk 1:2; geser grup"],
                  ["Pandangan Atas muncul di bawah Depan", "Projection Type First Angle (bawaan ISO)", "Ubah Projection Type atau Preferences → TechDraw → General"],
                  ["Section View kosong atau tidak diarsir", "Bidang potong tidak memotong benda; Hatch belum ditambahkan", "Geser Section Plane ke pusat lubang; pilih muka potongan → Hatch"],
                  ["Angka dimensi berbeda dari model", "Mengukur di layar atau pada perspektif", "Dimensi TechDraw membaca model; pakai Std Measure di 3D"],
                  ["BoundBox tidak sama dengan ukuran sketsa", "Body memiliki Placement (rotasi/translasi)", "Baca BoundBox setelah recompute; itu memang ukuran global"],
                  ["Faces[i] menunjuk muka lain", "Indeks muka berubah setelah recompute", "Pilih muka dari normal, luas, atau titik berat"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) satu Body dengan pohon fitur sesuai permintaan dan sketsa fully constrained; (2) satu lembar TechDraw berisi pandangan yang diminta (Projection Group / isometrik / Section View / pandangan bantu) dengan skala yang benar; (3) angka dibaca dari model (Std Measure atau Python), sesuai jumlah desimal yang diminta; (4) Placement Body kembali nol kecuali tugas memintanya diputar (Tugas 3); (5) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Gambar Kerja Balok Bertingkat", "Tujuh langkah berikut membangun balok bertingkat berlubang, menyusun lembar TechDraw dengan tiga pandangan, isometrik, dan potongan A-A, lalu membaca angkanya lewat Python; ditutup tabel gejala dan daftar periksa.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab multiview drawings, axonometric projection (isometrik, dimetrik, trimetrik), section views, dan auxiliary views; dasar Bagian 02–05.")
    refs += pm_ref(2, "amber", "249,115,22", "F. E. Giesecke, A. Mitchell, H. C. Spencer, I. L. Hill, J. T. Dygdon, J. E. Novak &amp; S. Lockhart", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Metode proyeksi sudut pertama dan ketiga, simbol ISO, skala, potongan, dan pandangan bantu untuk panjang sebenarnya.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Std View commands (Standard views, Orthographic/Perspective, Clipping plane), Navigation Cube, TechDraw Workbench (ProjectionGroup, SectionView, Hatch), Part Cross-sections, TopoShape (BoundBox, slice)", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, properti tampilan, dan API yang dipakai di cell Python dan tugas.")
    refs += pm_ref(4, "green", "0,224,158", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab drawings (views, sections, auxiliary views, scale) dan display states; konsep yang sama pada TechDraw FreeCAD.")
    refs += pm_ref(5, "pink", "236,72,153", "International Organization for Standardization", "ISO 5456-2: Technical drawings — Projection methods — Part 2: Orthographic representations; ISO 128-3: Views, sections and cuts", ". ISO, 1996/2022 (diadopsi sebagai SNI ISO).", "Aturan susunan pandangan sudut pertama/ketiga, simbol metode proyeksi, garis potong, dan arsiran.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi pandangan standar, kamera, metode proyeksi, isometrik, potongan, dan bacaan geometri tampilan. Dokumentasi Std View, TechDraw, dan TopoShape adalah pendamping wajib karena nama perintah dan properti mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Std ViewIsometric/ViewFront, Std OrthographicCamera/PerspectiveCamera, Navigation Cube, Mouse navigation, Std ToggleClipPlane, TechDraw ProjectionGroup/SectionView/Hatch/View (Direction), Part CrossSections, dan Part TopoShape (BoundBox, slice, Face.Area). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 6 — Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Projection Group 1:2</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">√(a² + b² + c²)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">BoundBox.XLength</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Section A-A</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">Face.Area</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 6 · Sudut Pandang, Proyeksi, dan Tampilan 3D</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 6</span><br><em>Gambar Kerja</em><br>dari Model 3D</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang pandangan standar, kamera ortografik dan perspektif, metode proyeksi, Projection Group, isometrik, Section View, clipping plane, transparansi, dan BoundBox, ditambah 5 tugas pemodelan: balok bertakik dengan tiga pandangan skala 1:2, balok dengan pandangan isometrik, balok yang diputar θ, balok berlubang dengan potongan A-A, dan baji dengan pandangan bantu. Setiap tugas mengunggah berkas .FCStd (Body + lembar TechDraw) dan mengisi satu bacaan geometri. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Menekan tombol <strong>0</strong> pada tampilan 3D FreeCAD (View → Standard views) menghasilkan...",
     ["Pandangan depan (Front)", "Pandangan atas (Top)", "Pandangan isometrik (Isometric)", "Fit all: seluruh model memenuhi layar"],
     "Tombol 0"),
    ("Perbedaan mendasar kamera <strong>ortografik</strong> dan <strong>perspektif</strong> pada tampilan 3D adalah...",
     ["Ortografik: garis proyeksi sejajar sehingga ukuran tampak tidak bergantung jarak; perspektif: garis proyeksi menuju satu titik mata sehingga benda jauh tampak lebih kecil", "Ortografik hanya untuk model 2D; perspektif untuk model 3D", "Ortografik menyembunyikan garis tersembunyi; perspektif menampilkannya", "Tidak ada perbedaan selain nama menu"],
     "Ortografik vs perspektif"),
    ("Pada metode proyeksi <strong>sudut ketiga</strong> (third angle, ISO-A), pandangan atas diletakkan...",
     ["Di bawah pandangan depan", "Di kiri pandangan depan", "Di kanan pandangan depan", "Di atas pandangan depan"],
     "Letak pandangan atas (third angle)"),
    ("<strong>Projection Group</strong> pada TechDraw berguna untuk...",
     ["Mengelompokkan beberapa lembar (Page) dalam satu berkas", "Membuat pandangan utama (Front) beserta pandangan sekunder (Top, Right, isometrik, …) dari satu objek dengan skala dan metode proyeksi yang sama, tersusun otomatis", "Menggabungkan beberapa Body menjadi satu solid", "Menyimpan pengaturan kamera tampilan 3D"],
     "Fungsi Projection Group"),
    ("Pada proyeksi isometrik sejati, rusuk yang sejajar sumbu tampak...",
     ["Lebih panjang 1,22 kali panjang aslinya", "Sama persis dengan panjang aslinya", "Setengah panjang aslinya", "Memendek menjadi sekitar 0,816 kali panjang aslinya, dengan ketiga sumbu berjarak 120°"],
     "Pemendekan isometrik"),
    ("<strong>Section View</strong> A-A pada TechDraw menampilkan...",
     ["Potongan benda oleh bidang potong: muka yang terpotong diarsir dan bagian di balik bidang tetap terlihat sesuai arah panah", "Pandangan dari arah sembarang tanpa memotong benda", "Bidang sketsa yang dipakai fitur Pad", "Salinan pandangan depan dengan skala berbeda"],
     "Arti Section View"),
    ("Perbedaan <strong>Clipping plane</strong> (View → Clipping plane) dan <strong>Section View</strong> adalah...",
     ["Clipping plane memotong model secara permanen; Section View hanya tampilan", "Keduanya menghasilkan objek gambar 2D pada lembar TechDraw", "Clipping plane hanya memotong tampilan 3D sementara tanpa mengubah model; Section View adalah objek gambar 2D pada lembar TechDraw", "Clipping plane hanya bekerja pada objek Part, bukan Part Design"],
     "Clipping plane vs Section View"),
    ("Cara paling cepat melihat rongga dalam benda pada tampilan 3D <em>tanpa</em> mengubah model adalah...",
     ["Membuat Pocket setengah benda lalu membatalkannya", "Menaikkan Transparency objek (tab View) atau memakai draw style Wireframe / clipping plane", "Mengekspor model ke STL lalu membukanya kembali", "Mengubah satuan dokumen menjadi meter"],
     "Melihat rongga dalam"),
    ("Balok beralas a × b diputar θ (0° < θ < 90°) terhadap sumbu Z lewat Placement. <code>Shape.BoundBox.XLength</code> menjadi...",
     ["Tetap a, karena kotak pembatas ikut berputar bersama benda", "a + b untuk semua θ", "√(a² + b²) untuk semua θ", "a·cos θ + b·sin θ, karena kotak pembatas selalu sejajar sumbu global"],
     "BoundBox setelah rotasi"),
    ("Pada Python, <code>sh.slice(App.Vector(0,1,0), y0)</code> mengembalikan...",
     ["Volume bagian benda di bawah y = y0", "Daftar wire hasil perpotongan solid dengan bidang y = y0; luas potongan dihitung dari Part.Face(w).Area", "Dua solid hasil pemotongan benda", "Bidang potong sebagai objek baru di dokumen"],
     "Arti Shape.slice"),
]

TUGAS_LABELS = ["Balok bertakik + Projection Group 1:2 — luas muka depan (mm²)", "Balok + pandangan isometrik — diagonal ruang (mm)", "Balok diputar θ — BoundBox.XLength (mm)",
                "Balok berlubang + Section View A-A — luas potongan (mm²)", "Baji + pandangan bantu — luas muka miring (mm²)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 2, 3: 3}

FQ_JUDUL = [
    "Bagaimana memilih metode proyeksi, skala, dan susunan Projection Group agar gambar dudukan pelana terbaca sama oleh dua bengkel?",
    "Kapan memakai Section View, clipping plane, atau pandangan bantu untuk nozzle dan pelat pengaku miring?",
    "Bagaimana tampilan 3D (isometrik, transparansi, warna, BoundBox) membantu rapat dengan bengkel dan penentuan bahan baku?",
]
FQ_RINGKAS = [
    "Tetapkan metode proyeksi (sudut pertama vs ketiga) beserta simbolnya, satu skala untuk semua pandangan grup, dan arah Front yang paling informatif; jelaskan salah baca yang terjadi bila simbol tidak ada.",
    "Bedakan potongan yang digambar (Section View A-A dengan arah panah dan arsiran), potongan tampilan (clipping plane), dan pandangan bantu untuk luas sebenarnya pelat miring dengan Persamaan (2) dan (4).",
    "Susun tampilan 3D untuk rapat (isometrik, Flat lines, transparansi, warna per komponen) dan tentukan ukuran bahan baku dari BoundBox setelah Placement dengan Persamaan (5).",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Biro gambar PT Bejana Karya Nusantara menyiapkan gambar kerja dudukan pelana (saddle) bejana horizontal ⌀1.200 mm: pelat pelana melengkung, pelat badan tebal 12 mm dengan takik kabel di sudut atas, dan pelat dasar 400 × 200 mm. Gambar dikirim ke dua bengkel: bengkel Surabaya terbiasa sudut ketiga, bengkel Cikarang memakai sudut pertama, dan gambar pertama tanpa simbol metode proyeksi membuat pelat badan dilas terbalik. Tentukan metode proyeksi dan simbolnya (Bagian 03), arah Front, skala satu grup pandangan (1:5 pada A3), dan susunan Depan/Atas/Kanan dengan Projection Group; jelaskan bagaimana salah baca itu terjadi.",
            ["dudukan pelana ⌀1.200", "pelat badan 12 mm, takik atas", "sudut pertama vs ketiga"],
            "Pada metode proyeksi sudut pertama (first angle, ISO-E), pandangan atas diletakkan...",
            ["Di atas pandangan depan", "Di bawah pandangan depan", "Di kanan pandangan depan", "Bebas, asalkan skalanya sama"],
            "✅ Tepat! Pada sudut pertama benda berada di antara pengamat dan bidang proyeksi, sehingga pandangan atas jatuh di bawah pandangan depan dan pandangan kanan di kiri; sudut ketiga membaliknya. Simbol kerucut terpancung pada kepala gambar mencegah bengkel menebak.",
            "❌ Di atas pandangan depan adalah susunan sudut ketiga; di kanan adalah letak pandangan kiri pada sudut pertama; letak tidak boleh bebas. Lihat Gambar 3 dan Animasi 2.",
            "Petunjuk: (1) Pilih metode dan gambarkan simbolnya. (2) Tetapkan arah Front dan skala grup. (3) Jelaskan susunan pandangan dan asal salah baca.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Nozzle N3 ⌀200 menembus dinding bejana dengan pelat penguat (reinforcing pad) ⌀400 × 12 dan las dalam yang tidak terlihat dari luar; pelat pengaku (gusset) di bawah nozzle miring: alas 300 mm, tinggi kiri 250 mm, tinggi kanan 90 mm, tebal 10 mm. Bengkel meminta gambar yang memperlihatkan las dalam dan ukuran sebenarnya pelat miring, sementara estimator menghitung luas gusset dari pandangan depan sehingga bahan kurang sekitar 8 %. Tentukan alat yang tepat (Bagian 05: Section View A-A dengan arah panah dan arsiran vs clipping plane) dan pandangan bantu untuk gusset (Bagian 03), lalu hitung luas sebenarnya gusset dengan Persamaan (2) dan luas potongan pad berlubang dengan Persamaan (4).",
            ["nozzle ⌀200, pad ⌀400 × 12", "gusset 300 / 250 / 90 × 10", "Section A-A · pandangan bantu"],
            "Luas sebenarnya pelat pengaku miring (gusset) diperoleh dari...",
            ["Pandangan depan, karena skalanya 1:1", "Pandangan atas dikalikan cos sudut kemiringan", "Pandangan bantu yang tegak lurus muka miring (atau Face.Area pada model 3D)", "Menjumlahkan luas pandangan depan dan pandangan atas"],
            "✅ Tepat! Muka miring tampak memendek pada semua pandangan standar; hanya pandangan bantu tegak lurus muka itu (atau Face.Area di model 3D) yang memberi ukuran sebenarnya b·√(a² + (h₁ − h₂)²).",
            "❌ Pandangan depan dan atas memendekkan muka miring; mengalikan cos atau menjumlahkan luas dua pandangan bukan cara yang benar. Lihat Persamaan (2) dan Tugas 5.",
            "Petunjuk: (1) Bedakan Section View dan clipping plane untuk las dalam. (2) Tentukan arah pandangan bantu gusset. (3) Hitung luas gusset dan luas potongan pad.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Sebelum fabrikasi, biro gambar mengadakan rapat daring dengan bengkel dan pembeli memakai model 3D FreeCAD: rakitan pelana, nozzle, pad, dan gusset harus terbaca oleh orang yang tidak membaca gambar teknik, dan bagian pembelian meminta ukuran bahan baku pelat dan balok untuk komponen yang pada model diposisikan miring (Placement diputar) agar sesuai bejana. Susun tampilan rapat (Bagian 01, 04, 06: isometrik, Flat lines, transparansi pada dinding bejana, warna per komponen, pandangan tersimpan) dan tentukan ukuran bahan baku dari BoundBox setelah Placement dengan Persamaan (5), serta jelaskan kapan BoundBox justru menyesatkan.",
            ["rapat daring model 3D", "transparansi dinding bejana", "BoundBox → bahan baku"],
            "Untuk memperlihatkan las dalam nozzle pada tampilan 3D saat rapat tanpa mengubah model, cara yang tepat adalah...",
            ["Menghapus setengah model dengan Pocket lalu menyimpannya", "Mengekspor ke STL dan memotongnya di perangkat lunak lain", "Membuat Body baru berisi setengah model", "Mengaktifkan clipping plane (View → Clipping plane) atau menaikkan Transparency; model tetap utuh"],
            "✅ Tepat! Clipping plane dan transparansi hanya mengubah tampilan; model dan gambar kerja tidak berubah, dan pandangan itu dapat disimpan untuk rapat berikutnya.",
            "❌ Pocket, Body baru, atau STL yang dipotong mengubah geometri yang akan difabrikasi. Lihat kotak peringatan pada Bagian 05 dan kartu Transparansi pada Bagian 06.",
            "Petunjuk: (1) Susun tampilan rapat dan simpan pandangannya. (2) Hitung BoundBox komponen yang diputar. (3) Jelaskan kapan bahan baku tidak boleh diambil dari BoundBox.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">First / Third angle</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Section A-A</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">skala 1:5</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">BoundBox</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 6 · Sudut Pandang dan Proyeksi</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Gambar Kerja<br><em>yang Terbaca di Bengkel</em></h1>
    <p class="hero-sub">Biro gambar PT Bejana Karya Nusantara menyiapkan gambar kerja multi-pandangan dan potongan dudukan pelana, nozzle, dan pelat pengaku bejana untuk dua bengkel dengan kebiasaan proyeksi berbeda. Terapkan Pertemuan 6: metode proyeksi dan Projection Group, Section View dan pandangan bantu, serta tampilan 3D dan BoundBox, agar gambar dibaca sama oleh semua pihak.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PT Bejana Karya Nusantara —<br>Gambar Kerja Dudukan dan Nozzle Bejana</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS GAMBAR KERJA</div>
    <p>
      <strong style="color:var(--amber)">Biro gambar PT Bejana Karya Nusantara</strong> menyiapkan gambar kerja <strong style="color:var(--cyan)">bejana horizontal ⌀1.200 mm</strong>: dua <strong>dudukan pelana</strong> (pelat badan 12 mm dengan takik kabel di sudut atas, pelat dasar 400 × 200), <strong>nozzle N3 ⌀200</strong> dengan pelat penguat ⌀400 × 12 dan las dalam, serta <strong>pelat pengaku miring</strong> 300 / 250 / 90 × 10 mm. Gambar dipesin dan dilas oleh dua bengkel: Surabaya terbiasa sudut ketiga, Cikarang memakai sudut pertama.
    </p>
    <p style="margin-top:12px">
      Gambar pertama bermasalah: <strong style="color:var(--cyan)">tanpa simbol metode proyeksi</strong> sehingga pelat badan dilas terbalik, skala 1:2 dan 1:5 bercampur dalam satu grup, las dalam nozzle tidak tergambar (hanya tangkapan layar clipping plane), dan luas pelat miring dihitung dari pandangan depan sehingga bahan kurang sekitar 8 %. Bagian pembelian juga meminta ukuran bahan baku komponen yang di model diposisikan miring.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur gambar kerja</strong>: metode proyeksi dan Projection Group, potongan dan pandangan bantu, tampilan 3D untuk rapat, dan bacaan BoundBox untuk bahan baku.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Pelana: badan 12 mm, dasar 400 × 200", "14,165,233", "cyan")}
{kartu("Nozzle ⌀200 + pad ⌀400 × 12, las dalam", "14,165,233", "cyan")}
{kartu("Gusset miring 300 / 250 / 90 × 10", "14,165,233", "cyan")}
{kartu("Dua bengkel · dua metode proyeksi · A3 1:5", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Pelat yang terbalik, las yang tidak tergambar, dan bahan yang kurang berasal dari tiga hal: metode proyeksi yang tidak dinyatakan, potongan yang diganti tangkapan layar, dan luas yang dibaca dari pandangan yang memendekkan. Forum ini mengajak Anda membereskan ketiganya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Gambar kerja dudukan pelana: tiga pandangan sudut ketiga, potongan A-A pelat berlubang, dan isometrik untuk rapat</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Biro gambar PT Bejana Karya Nusantara menyiapkan gambar kerja bejana horizontal &oslash;1.200 mm: dua dudukan pelana (pelat badan 12 mm bertakik, pelat dasar 400 &times; 200), nozzle N3 &oslash;200 dengan pelat penguat &oslash;400 &times; 12 dan las dalam, serta pelat pengaku miring 300 / 250 / 90 &times; 10 mm, untuk dua bengkel: Surabaya terbiasa sudut ketiga, Cikarang sudut pertama. Gambar pertama tanpa simbol metode proyeksi membuat pelat badan dilas terbalik, skala bercampur, las dalam hanya tangkapan layar clipping plane, dan luas pelat miring dihitung dari pandangan depan sehingga bahan kurang 8 %. Susun metode proyeksi dan Projection Group, Section View dan pandangan bantu, tampilan 3D untuk rapat, dan bacaan BoundBox untuk bahan baku."
FORUM_CHIPS_LMS = ["pelana: badan 12 mm, dasar 400 × 200", "nozzle ⌀200 + pad ⌀400 × 12, las dalam", "gusset miring 300 / 250 / 90 × 10", "dua bengkel · dua metode · A3 1:5"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Gambar kerja dudukan pelana: tiga pandangan sudut ketiga, potongan A-A, isometrik (Pertemuan 6)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const poli = (pts, isi, garis, lebar) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); if (isi) { ctx.fillStyle = isi; ctx.fill(); } ctx.strokeStyle = garis; ctx.lineWidth = lebar || 1.2; ctx.stroke(); };
  const P = (p, cx, cy, s) => { const a = 35 * Math.PI / 180, e = 28 * Math.PI / 180; const x1 = p[0] * Math.cos(a) - p[1] * Math.sin(a), y1 = p[0] * Math.sin(a) + p[1] * Math.cos(a); return [cx + s * x1, cy - s * (p[2] * Math.cos(e) + y1 * Math.sin(e))]; };
  // pelat badan pelana: profil bertakik a × H (takik a/2 × hn di kanan-atas), tebal b, lubang ⌀d di tengah
  const a = 60, Hh = 40, hn = 12, b = 14, d = 10;
  const prof = [[0, 0], [a, 0], [a, Hh - hn], [a / 2, Hh - hn], [a / 2, Hh], [0, Hh]];
  const kolom = W / 3, s = Math.min(kolom / 150, (H - 70) / 100);
  ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  // kolom 1: tiga pandangan sudut ketiga (Atas di atas Depan, Kanan di kanan Depan)
  { const cx = kolom * 0.5, top = 34, gap = 8 * s;
    const dx = cx - (a + b + 8) * s / 2, dy = top + (b + 8) * s;
    poli([[dx, dy], [dx + a * s, dy], [dx + a * s, dy + b * s], [dx, dy + b * s]].map(p => p), 'rgba(245,158,11,.14)', '#f59e0b');
    ctx.strokeStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(dx + a * s / 2, dy); ctx.lineTo(dx + a * s / 2, dy + b * s); ctx.stroke();
    const fy = dy + b * s + gap;
    poli(prof.map(([x, z]) => [dx + x * s, fy + (Hh - z) * s]), 'rgba(34,211,238,.16)', '#22d3ee');
    const kx = dx + a * s + gap;
    poli([[kx, fy], [kx + b * s, fy], [kx + b * s, fy + Hh * s], [kx, fy + Hh * s]], 'rgba(168,85,247,.14)', '#a855f7');
    ctx.strokeStyle = '#a855f7'; ctx.beginPath(); ctx.moveTo(kx, fy + hn * s); ctx.lineTo(kx + b * s, fy + hn * s); ctx.stroke();
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('Atas · Depan · Kanan (sudut ketiga, 1:5)', cx, H - 10); }
  // kolom 2: potongan A-A pelat dasar berlubang (dua bagian diarsir)
  { const cx = kolom * 1.5, cy = H * 0.5, w = 70 * s, h = 22 * s, celah = 14 * s;
    const x0 = cx - w / 2, y0 = cy - h / 2;
    [[x0, (w - celah) / 2], [x0 + (w - celah) / 2 + celah, (w - celah) / 2]].forEach(([xs, ws]) => {
      poli([[xs, y0], [xs + ws, y0], [xs + ws, y0 + h], [xs, y0 + h]], 'rgba(0,224,158,.10)', '#00e09e', 1.4);
      ctx.save(); ctx.beginPath(); ctx.rect(xs, y0, ws, h); ctx.clip(); ctx.strokeStyle = 'rgba(0,224,158,.7)'; ctx.lineWidth = 0.8;
      for (let c = -h; c < ws; c += 6) { ctx.beginPath(); ctx.moveTo(xs + c, y0 + h); ctx.lineTo(xs + c + h, y0); ctx.stroke(); }
      ctx.restore(); });
    ctx.strokeStyle = '#ec4899'; ctx.setLineDash([8, 3, 2, 3]); ctx.beginPath(); ctx.moveTo(x0 - 16, y0 - 22); ctx.lineTo(x0 + w + 16, y0 - 22); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ec4899'; ctx.fillText('A', x0 - 16, y0 - 28); ctx.fillText('A', x0 + w + 16, y0 - 28);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('Potongan A-A: luas = h·(a − d)', cx, H - 10); }
  // kolom 3: isometrik pelat badan bertakik (untuk rapat)
  { const cx = kolom * 2.5 - 24 * s, cy = H * 0.74, F0 = prof.map(([x, z]) => [x, 0, z]), F1 = prof.map(([x, z]) => [x, b, z]);
    poli(F1.map(p => P(p, cx, cy, s)), 'rgba(34,211,238,.06)', 'rgba(34,211,238,.35)', 0.8);
    for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; poli([F0[i], F0[j], F1[j], F1[i]].map(p => P(p, cx, cy, s)), 'rgba(34,211,238,.10)', 'rgba(34,211,238,.6)', 1); }
    poli(F0.map(p => P(p, cx, cy, s)), 'rgba(34,211,238,.22)', '#22d3ee', 1.4);
    const bb = F0.concat(F1).map(p => P(p, cx, cy, s)); const xs = bb.map(p => p[0]), ys = bb.map(p => p[1]);
    ctx.strokeStyle = '#f59e0b'; ctx.setLineDash([5, 3]); ctx.strokeRect(Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) - Math.min(...xs) + 8, Math.max(...ys) - Math.min(...ys) + 8); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('Isometrik + BoundBox untuk rapat', kolom * 2.5, H - 10); }
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ metode proyeksi + skala pada kepala gambar; potongan digambar, bukan tangkapan layar clipping plane', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
