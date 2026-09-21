# Konten Modul 2 Pemodelan CAD — Drafting dan Penyuntingan 2D: Trim, Extend,
# Offset, Layer, dan Dimensi (Sub-CPMK 1.2: fitur drafting dan editing, pengaturan
# layer dan dimensi, alat pemodelan dan alat bantu). Angka contoh dihitung di sini
# agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian
# tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from tugas_gambar import AM, CY, GN, GR, RD, _panah, ext  # noqa: E402

NOMOR = 2
JUDUL = "Drafting dan Penyuntingan 2D"
JUDUL_PANJANG = "Drafting dan Penyuntingan 2D: Trim, Extend, Offset, Layer, dan Dimensi"
JUDUL_EKSPOR = "Drafting dan Penyuntingan 2D"

# ─────────────────────────── angka contoh ───────────────────────────
A_C, B_C, T_C = 100, 60, 10
LUAS_OFS_LANCIP = (A_C + 2 * T_C) * (B_C + 2 * T_C)
LUAS_OFS_BULAT = A_C * B_C + 2 * T_C * (A_C + B_C) + math.pi * T_C ** 2
R_C, H_C = 35, 12
CHORD_C = 2 * math.sqrt(R_C ** 2 - H_C ** 2)
N_AR, R_AR, D_AR = 8, 50, 10
JARAK_AR = 2 * R_AR * math.sin(math.pi / N_AR)
R_LUAR_AR, R_POROS_AR = R_AR + 20, R_AR - 25   # praktik 09: radius kontur luar dan lubang poros flens
L_SUMBU_AR = 100                                # praktik 09: garis konstruksi sumbu X dan Y sepanjang ±L_SUMBU_AR
A_P, B_P, D_P, NX_P = 160, 90, 10, 4
LUAS_P = A_P * B_P - NX_P * math.pi * D_P ** 2 / 4
W_T, H_T, S_T = 140, 70, 40
SUDUT_T = math.degrees(math.atan2(H_T, S_T))


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    w, h = 150, 56
    tahap = [("Konstruksi", "garis & acuan", "#22d3ee"), ("Penyuntingan", "trim · extend · offset", "#f97316"),
             ("Pola & salinan", "array · mirror · clone", "#a855f7"), ("Anotasi", "dimensi, teks, layer", "#00e09e")]
    xs = [10, 180, 350, 520]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 40, w, h, [a, s], c, 11.5)
    for i in range(3):
        b += arrow(xs[i] + w, 68, xs[i + 1], 68)
    b += f'<path d="M {xs[3] + 75} 120 Q 340 168 {xs[0] + 75} 120" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += arrow(xs[0] + 77, 122, xs[0] + 75, 97, "#ef4444")
    b += t(340, 158, "revisi: geometri konstruksi diubah, hasil sunting dan dimensi mengikuti", 11.5, "#ef4444")
    b += t(340, 198, "Gambar 2D yang rapi lahir dari kontur kasar yang dipangkas, digeser, dan disalin secara sistematis", 11.5, AX)
    return svg(680, 212, b, "Gambar 1 — Alur drafting 2D di Draft Workbench")


def gambar2():
    b = ""
    for k, (judul, potong) in enumerate([("Sebelum: garis melintasi lingkaran", False), ("Sesudah Trimex: tali busur tersisa", True)]):
        ox = 40 + k * 330
        cx, cy, r = ox + 120, 130, 62
        b += t(ox + 120, 30, judul, 12, TX, "middle", "600")
        b += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="rgba(34,211,238,.08)" stroke="#22d3ee" stroke-width="1.8"/>'
        h = 22
        c = math.sqrt(r * r - h * h)
        y = cy - h
        if not potong:
            b += f'<line x1="{cx - 120}" y1="{y}" x2="{cx + 120}" y2="{y}" stroke="#f59e0b" stroke-width="2.4"/>'
            # label dua baris di luar lingkaran: kiri di atas ruas kiri, kanan di bawah ruas kanan
            b += t(cx - c - 4, y - 22, "klik di sini →", 9.5, "#f59e0b", "end") + t(cx - c - 4, y - 9, "ujung kiri dibuang", 9.5, "#f59e0b", "end")
            b += t(cx + c + 8, y + 15, "← klik di sini →", 9.5, "#f59e0b", "start") + t(cx + c + 8, y + 28, "ujung kanan dibuang", 9.5, "#f59e0b", "start")
        else:
            b += f'<line x1="{cx - 120}" y1="{y}" x2="{cx + 120}" y2="{y}" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="4 4"/>'
            b += f'<line x1="{cx - c:.1f}" y1="{y}" x2="{cx + c:.1f}" y2="{y}" stroke="#00e09e" stroke-width="2.6"/>'
            b += t(cx, y - 8, f"c = 2√(r² − h²)", 10.5, "#00e09e")
            b += f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{y}" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="3 3"/>'
            b += t(cx + 6, cy - h / 2 + 3, "h", 10, "#a855f7", "start")
        for px in (cx - c, cx + c):
            b += f'<circle cx="{px:.1f}" cy="{y}" r="3.5" fill="#00e09e"/>'
    b += t(340, 228, "Extend bekerja sebaliknya: ujung garis ditarik sampai objek batas terdekat", 10.5, AX)
    return svg(680, 240, b, "Gambar 2 — Trimex memotong garis pada perpotongan dengan objek batas")


def gambar3():
    b = ""
    s = 1.9
    ox, oy = 60, 210
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    a, bb, tt = A_C, B_C, T_C
    b += f'<rect x="{X(-tt)}" y="{Y(bb + tt)}" width="{(a + 2 * tt) * s}" height="{(bb + 2 * tt) * s}" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="6 4"/>'
    rx = tt * s
    b += f'<path d="M {X(-tt) + rx} {Y(bb + tt)} H {X(a + tt) - rx} A {rx} {rx} 0 0 1 {X(a + tt)} {Y(bb + tt) + rx} V {Y(-tt) - rx} A {rx} {rx} 0 0 1 {X(a + tt) - rx} {Y(-tt)} H {X(-tt) + rx} A {rx} {rx} 0 0 1 {X(-tt)} {Y(-tt) - rx} V {Y(bb + tt) + rx} A {rx} {rx} 0 0 1 {X(-tt) + rx} {Y(bb + tt)} Z" fill="none" stroke="#ec4899" stroke-width="1.4" stroke-dasharray="2 3"/>'
    b += f'<rect x="{X(0)}" y="{Y(bb)}" width="{a * s}" height="{bb * s}" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<rect x="{X(tt)}" y="{Y(bb - tt)}" width="{(a - 2 * tt) * s}" height="{(bb - 2 * tt) * s}" fill="none" stroke="#a855f7" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += t(X(a / 2), Y(bb / 2) + 4, f"{a} × {bb}", 11.5, TX)
    b += arrow(X(a), Y(bb / 2), X(a + tt), Y(bb / 2), "#f59e0b", 1.6)
    b += t(X(a + tt) + 6, Y(bb / 2) + 4, f"t = {tt}", 10.5, "#f59e0b", "start")
    b += t(345, 40, "Offset luar, sudut lancip (Draft Offset):", 11, "#f59e0b", "start")
    b += t(345, 58, f"A = (a + 2t)(b + 2t) = {ind(LUAS_OFS_LANCIP, 0)} mm²", 11, TX, "start")
    b += t(345, 86, "Offset luar, sudut membulat (makeOffset2D):", 11, "#ec4899", "start")
    b += t(345, 104, f"A = ab + 2t(a + b) + πt² = {ind(LUAS_OFS_BULAT, 2)} mm²", 11, TX, "start")
    b += t(345, 132, "Offset dalam:", 11, "#a855f7", "start")
    b += t(345, 150, f"A = (a − 2t)(b − 2t) = {ind((A_C - 2 * T_C) * (B_C - 2 * T_C), 0)} mm²", 11, TX, "start")
    b += t(340, 248, "Setiap sisi kontur baru berjarak tegak lurus t dari kontur asal; sudutnya lancip atau membulat tergantung alat", 11, AX)
    return svg(680, 260, b, "Gambar 3 — Offset kontur ke luar dan ke dalam")


def gambar4():
    b = ""
    # ortho array
    ox, oy = 30, 200
    s = 1.0
    b += t(150, 28, "OrthoArray 4 × 2", 12, TX, "middle", "600")
    b += f'<rect x="{ox}" y="{oy - 90}" width="240" height="90" rx="4" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1.6"/>'
    for i in range(4):
        for j in range(2):
            b += f'<circle cx="{ox + 48 * (i + 1)}" cy="{oy - 30 - 30 * j}" r="8" fill="#0a101f" stroke="#f59e0b" stroke-width="1.4"/>'
    b += arrow(ox + 48, oy + 14, ox + 96, oy + 14, "#f59e0b", 1.4)
    b += t(ox + 72, oy + 30, "interval X", 9.5, "#f59e0b")
    b += arrow(ox + 252, oy - 30, ox + 252, oy - 60, "#f59e0b", 1.4)
    b += t(ox + 262, oy - 42, "interval Y", 9.5, "#f59e0b", "start")
    # polar array
    cx, cy = 500, 128
    b += t(cx, 28, f"PolarArray n = {N_AR}, R = {R_AR}", 12, TX, "middle", "600")
    b += f'<circle cx="{cx}" cy="{cy}" r="82" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1.6"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="62" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="5 4"/>'
    pts = []
    for k in range(N_AR):
        th = 2 * math.pi * k / N_AR
        px, py = cx + 62 * math.cos(th), cy - 62 * math.sin(th)
        pts.append((px, py))
        b += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="7" fill="#0a101f" stroke="{"#00e09e" if k < 2 else "#f59e0b"}" stroke-width="1.4"/>'
    b += f'<line x1="{pts[0][0]:.1f}" y1="{pts[0][1]:.1f}" x2="{pts[1][0]:.1f}" y2="{pts[1][1]:.1f}" stroke="#00e09e" stroke-width="1.4"/>'
    b += t(cx + 62, cy - 62, f"2R·sin(π/n) = {ind(JARAK_AR, 3)}", 10, "#00e09e", "start")   # di luar lingkaran, di atas pasangan lubang hijau
    b += t(cx, cy + 4, "360°/n", 10, "#f59e0b")
    b += t(340, 252, "Array adalah satu objek parametrik: mengubah jumlah atau interval memperbarui seluruh salinan", 11, AX)
    return svg(680, 264, b, "Gambar 4 — Pola salinan: OrthoArray dan PolarArray")


def gambar5():
    b = ""
    layers = [("Dimensi", "#00e09e", "tipis, teks 3,5 mm", 0), ("Teks & simbol", "#a855f7", "anotasi", 1),
              ("Kontur", "#22d3ee", "garis tebal 0,5–0,7", 2), ("Sumbu & tersembunyi", "#f59e0b", "putus-putus / rantai", 3), ("Konstruksi", "#64748b", "disembunyikan saat cetak", 4)]
    for nama, c, ket, i in layers:
        y = 30 + i * 40
        b += f'<polygon points="60,{y + 30} 220,{y} 380,{y + 30} 220,{y + 60}" fill="{c}" fill-opacity="0.18" stroke="{c}" stroke-width="1.4"/>'
        b += t(400, y + 34, nama, 12, c, "start", "600")
        b += t(400, y + 50, ket, 10, AX, "start")
        b += f'<rect x="560" y="{y + 24}" width="14" height="14" rx="3" fill="{c}" fill-opacity=".25" stroke="{c}"/>'
        b += t(600, y + 35, "👁" if i < 4 else "—", 11, c if i < 4 else AX, "start")
    b += teks2(340, 262, "Satu objek hanya berada di satu layer; layer menetapkan warna, tebal, dan gaya garis semua anggotanya", 11, AX, maks=70)
    return svg(680, 288, b, "Gambar 5 — Susunan layer gambar kerja 2D")


def gambar6():
    b = ""
    x1, x2, yb = 60, 260, 150
    b += f'<line x1="{x1}" y1="{yb}" x2="{x2}" y2="{yb}" stroke="#22d3ee" stroke-width="2.4"/>'
    b += f'<line x1="{x1}" y1="{yb}" x2="{x1}" y2="{yb + 6}" stroke="#22d3ee" stroke-width="2.4"/><line x1="{x2}" y1="{yb}" x2="{x2}" y2="{yb + 6}" stroke="#22d3ee" stroke-width="2.4"/>'
    yd = yb - 60
    b += f'<line x1="{x1}" y1="{yb - 8}" x2="{x1}" y2="{yd - 10}" stroke="#00e09e" stroke-width="1"/><line x1="{x2}" y1="{yb - 8}" x2="{x2}" y2="{yd - 10}" stroke="#00e09e" stroke-width="1"/>'
    b += f'<line x1="{x1}" y1="{yd}" x2="{x2}" y2="{yd}" stroke="#00e09e" stroke-width="1"/>'
    b += f'<polygon points="{x1},{yd} {x1 + 12},{yd - 4} {x1 + 12},{yd + 4}" fill="#00e09e"/><polygon points="{x2},{yd} {x2 - 12},{yd - 4} {x2 - 12},{yd + 4}" fill="#00e09e"/>'
    b += t((x1 + x2) / 2, yd - 8, "140", 13, "#00e09e", "middle", "700")
    for x, y, s in [(30, yd - 30, "garis perpanjangan (ExtLines)"), (290, yd + 4, "garis dimensi + panah (ArrowType, ArrowSize)"), (290, yd - 22, "teks nilai (FontSize, Decimals, ShowUnit)"), (290, yb + 4, "geometri yang diukur (objek acuan)")]:
        b += t(x, y, s, 10, AX if x > 100 else "#00e09e", "start")
    b += f'<line x1="{x1 - 6}" y1="{yd - 26}" x2="{x1}" y2="{yd - 8}" stroke="#00e09e" stroke-width=".8"/>'
    # angular
    cx, cy = 612, 150
    b += f'<line x1="{cx - 80}" y1="{cy}" x2="{cx}" y2="{cy}" stroke="#22d3ee" stroke-width="2"/>'
    th = math.radians(SUDUT_T)
    b += f'<line x1="{cx}" y1="{cy}" x2="{cx - 80 * math.cos(th):.1f}" y2="{cy - 80 * math.sin(th):.1f}" stroke="#22d3ee" stroke-width="2"/>'
    rr = 36
    b += f'<path d="M {cx - rr} {cy} A {rr} {rr} 0 0 0 {cx - rr * math.cos(th):.1f} {cy - rr * math.sin(th):.1f}" fill="none" stroke="#a855f7" stroke-width="1.2"/>'
    b += t(cx - 52, cy - 22, f"{ind(SUDUT_T, 3)}°", 11, "#a855f7", "middle", "700")
    b += t(cx - 40, cy + 28, "angular: dua garis, satu busur", 10, AX)
    b += teks2(340, 240, "Dimensi terikat ke geometri: nilai diperbarui saat titik acuannya bergeser; gaya diatur lewat properti atau preferensi Draft", 11, AX, maks=70)
    return svg(680, 266, b, "Gambar 6 — Anatomi Draft Dimension linear dan angular")


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
    """Gambar kerja praktik terbimbing (bagian 09): flens pelat delapan baut, pandangan atas bidang Top (XY).

    Ukuran memakai konstanta yang sama dengan teks langkah 2–4 dan 6 (R_AR, D_AR, N_AR, R_LUAR_AR,
    R_POROS_AR, L_SUMBU_AR), jadi gambar dan langkah tidak dapat berbeda angka. Kontur luar dan
    lubang poros diberi ukuran radius seperti yang diketik pada langkah 3.
    """
    s, cx, cy = 1.75, 215, 186                  # skala px/mm; titik asal (0, 0) = pusat flens

    def P(r_px, sudut):                          # titik pada jari-jari r_px (px), sudut dari sumbu +X berlawanan jarum jam
        return cx + r_px * math.cos(math.radians(sudut)), cy - r_px * math.sin(math.radians(sudut))
    rl, rj, rp, rb, L = R_LUAR_AR * s, R_AR * s, R_POROS_AR * s, D_AR / 2 * s, L_SUMBU_AR * s
    b = f'<circle cx="{cx}" cy="{cy}" r="{rl:.1f}" fill="{CY}" fill-opacity=".12" stroke="{CY}" stroke-width="2"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="{rp:.1f}" fill="#0a101f" stroke="{CY}" stroke-width="2"/>'
    for k in range(N_AR):
        hx, hy = P(rj, 360 * k / N_AR)
        b += f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{rb:.1f}" fill="#0a101f" stroke="{GR if k == 0 else CY}" stroke-width="2"/>'
    # geometri konstruksi (langkah 2): lingkaran jarak dan garis sumbu X, Y dari −L sampai +L
    lingkar = [P(rj, 3 * k) for k in range(121)]
    kons = _putus(lingkar) + " " + _putus([(cx - L, cy), (cx + L - 7, cy)]) + " " + _putus([(cx, cy + L), (cx, cy - L + 7)])
    b += f'<path d="{kons}" fill="none" stroke="{AX}" stroke-width="1"/>'
    b += _panah(cx + L - 8, cy, cx + L, cy, RD, 1.4) + _panah(cx, cy - L + 8, cx, cy - L, GN, 1.4)
    b += t(cx + L + 7, cy + 5, "X", 11, RD, "start", "700") + t(cx + 8, cy - L + 9, "Y", 11, GN, "start", "700")
    b += f'<line x1="{cx - L:.1f}" y1="{cy - 5}" x2="{cx - L:.1f}" y2="{cy + 5}" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<line x1="{cx - 5}" y1="{cy + L:.1f}" x2="{cx + 5}" y2="{cy + L:.1f}" stroke="{AX}" stroke-width="1.2"/>'
    b += t(cx - L, cy - 9, f"−{L_SUMBU_AR}", 10.5, AX, "middle", "600") + t(cx + L - 4, cy - 9, f"{L_SUMBU_AR}", 10.5, AX, "middle", "600")
    b += t(cx - 8, cy - L + 9, f"{L_SUMBU_AR}", 10.5, AX, "end", "600") + t(cx - 8, cy + L + 4, f"−{L_SUMBU_AR}", 10.5, AX, "end", "600")
    b += f'<circle cx="{cx}" cy="{cy}" r="2.5" fill="{TX}"/>' + t(cx + 4, cy + 13, "(0, 0)", 10, TX, "start")

    def jari(r_px, sudut, label):                # ukuran radius: penunjuk dari luar flens ke lingkaran, arah ke pusat
        px, py = P(r_px, sudut)
        qx, qy = P(rl + 22, sudut)
        kiri = math.cos(math.radians(sudut)) < 0
        ux = qx - 12 if kiri else qx + 12
        return (_panah(qx, qy, px, py, AM, 1) + f'<line x1="{qx:.1f}" y1="{qy:.1f}" x2="{ux:.1f}" y2="{qy:.1f}" stroke="{AM}" stroke-width="1"/>'
                + t(ux - 4 if kiri else ux + 4, qy + 4, label, 11, AM, "end" if kiri else "start", "600"))
    b += jari(rl, 112.5, f"R{R_LUAR_AR}") + jari(rj, 157.5, f"R{R_AR}") + jari(rp, 202.5, f"R{R_POROS_AR}")
    # sudut antara dua sumbu lubang bertetangga (langkah 6); sumbu lubang 0° berimpit dengan garis sumbu X
    a1, ra = 360 / N_AR, rl + 20
    b += ext(*P(rj + rb + 3, a1), *P(ra + 6, a1))
    (x0, y0), (x1, y1) = P(ra, 0), P(ra, a1)
    b += f'<path d="M {x0:.1f} {y0:.1f} A {ra:.1f} {ra:.1f} 0 0 0 {x1:.1f} {y1:.1f}" fill="none" stroke="{AM}" stroke-width="1"/>'
    d7 = math.degrees(7 / ra)
    for a_ujung, a_dasar in ((0, d7), (a1, a1 - d7)):
        (tx, ty), (bx, by) = P(ra, a_ujung), P(ra, a_dasar)
        ux, uy = 3 * math.cos(math.radians(a_dasar)), -3 * math.sin(math.radians(a_dasar))
        b += f'<polygon points="{tx:.1f},{ty:.1f} {bx + ux:.1f},{by + uy:.1f} {bx - ux:.1f},{by - uy:.1f}" fill="{AM}"/>'
    lx, ly = P(ra + 14, a1 / 2)
    b += t(lx, ly + 4, f"{ind(360 / N_AR, 0)}°", 11, AM, "middle", "600")
    # lubang baut: satu keterangan untuk seluruh pola (langkah 4)
    hx, hy = P(rj, -a1)
    (px, py), (qx, qy) = (hx + rb * math.cos(math.radians(-a1)), hy - rb * math.sin(math.radians(-a1))), P(rl + 26, -a1)
    b += _panah(qx, qy, px, py, AM, 1) + f'<line x1="{qx:.1f}" y1="{qy:.1f}" x2="{qx + 14:.1f}" y2="{qy:.1f}" stroke="{AM}" stroke-width="1"/>'
    b += t(qx + 18, qy + 4, f"{N_AR}× ⌀{D_AR} pada PCD {2 * R_AR}", 11, AM, "start", "600")
    b += t(qx + 18, qy + 24, f"PolarArray: {N_AR} salinan, 360°, pusat (0, 0, 0)", 10.5, AX, "start")
    # lubang induk yang disalin PolarArray
    ix, iy = P(rj, 0)
    b += f'<circle cx="{ix:.1f}" cy="{iy:.1f}" r="2" fill="{GR}"/>'
    b += f'<line x1="{ix + 2:.1f}" y1="{iy + 2:.1f}" x2="{cx + rl + 6:.1f}" y2="{cy + 13:.1f}" stroke="{GR}" stroke-width="1"/>'
    b += t(cx + rl + 9, cy + 17, f"({R_AR}, 0)", 10.5, GR, "start", "600")
    # keterangan layer dan PolarArray
    b += t(664, 22, "Satuan: mm", 10.5, AX, "end")
    kx = 474
    b += t(kx, 56, "Layer", 10.5, TX, "start", "600")
    b += f'<line x1="{kx}" y1="{72}" x2="{kx + 28}" y2="{72}" stroke="{CY}" stroke-width="2"/>' + t(kx + 38, 76, "Kontur", 10.5, AX, "start")
    b += f'<path d="{_putus([(kx, 92), (kx + 28, 92)], (6, 3, 2, 3))}" fill="none" stroke="{AX}" stroke-width="1"/>' + t(kx + 38, 96, "Konstruksi", 10.5, AX, "start")
    b += f'<line x1="{kx}" y1="{112}" x2="{kx + 28}" y2="{112}" stroke="{AM}" stroke-width="1"/>'
    b += f'<polygon points="{kx},112 {kx + 7},109 {kx + 7},115" fill="{AM}"/><polygon points="{kx + 28},112 {kx + 21},109 {kx + 21},115" fill="{AM}"/>'
    b += t(kx + 38, 116, "Dimensi", 10.5, AX, "start")
    return svg(680, 376, b, "Gambar 7 — Gambar kerja flens pelat delapan baut")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-alur">Alur Drafting</a>
  <a href="#m-trimex">Trim &amp; Extend</a>
  <a href="#m-offset">Offset</a>
  <a href="#m-array">Array &amp; Salinan</a>
  <a href="#m-layer">Layer</a>
  <a href="#m-dimensi">Dimensi</a>
  <a href="#m-bantu">Alat Bantu</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="30" width="64" height="40" rx="2" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <rect x="10" y="22" width="80" height="56" rx="2" fill="none" stroke="rgba(255,179,0,.45)" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="50" cy="130" r="30" fill="none" stroke="rgba(0,229,255,.45)" stroke-width="1.3"/>
      <line x1="10" y1="118" x2="90" y2="118" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="2 3"/>
      <line x1="24" y1="118" x2="76" y2="118" stroke="rgba(0,224,158,.6)" stroke-width="1.8"/>
      <line x1="14" y1="190" x2="86" y2="190" stroke="rgba(124,77,255,.55)" stroke-width="1"/>
      <text x="50" y="186" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">140</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="70" r="36" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.2"/>
      <circle cx="50" cy="70" r="26" fill="none" stroke="rgba(255,179,0,.4)" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="76" cy="70" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="68.4" cy="51.6" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="50" cy="44" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="31.6" cy="51.6" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="24" cy="70" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="31.6" cy="88.4" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="50" cy="96" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <circle cx="68.4" cy="88.4" r="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <rect x="14" y="140" width="72" height="12" rx="2" fill="rgba(0,224,158,.15)" stroke="rgba(0,224,158,.5)" stroke-width="1"/>
      <rect x="14" y="158" width="72" height="12" rx="2" fill="rgba(124,77,255,.15)" stroke="rgba(124,77,255,.5)" stroke-width="1"/>
      <rect x="14" y="176" width="72" height="12" rx="2" fill="rgba(0,229,255,.15)" stroke="rgba(0,229,255,.5)" stroke-width="1"/>
      <text x="50" y="206" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">layer</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Draft → Trimex</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">c = 2√(r² − h²)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">Offset t</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">2R·sin(π/n)</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">PolarArray</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Layer · Dimension</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">θ = arctan(H/s)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">Snap ⟂ · ∩</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 2 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Drafting &amp;</span><br>
      <em>Penyuntingan</em><br>
      <span class="hl-amber">Objek 2D</span>
    </h1>
    <p class="hero-sub">Pertemuan ini mengubah kontur kasar menjadi gambar kerja yang rapi: memotong dan memperpanjang dengan Trimex, membuat kontur sejajar dengan Offset, menyalin pola dengan Array dan Mirror, menata objek dalam layer, memasang dimensi linear dan angular yang mengikuti geometri, serta memanfaatkan snap dan mode konstruksi. Tugasnya lima model 2D FreeCAD yang menguji setiap alat itu dengan angka bacaan.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Alat sunting, layer, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
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

    # 01 — Alur drafting
    isi = figure(1, "Alur drafting 2D di Draft Workbench", "Geometri konstruksi dibuat lebih dulu, lalu dipangkas dan digeser, disalin menjadi pola, dan terakhir diberi dimensi serta ditata dalam layer; revisi pada langkah awal mengalir ke langkah berikutnya.", gambar1())
    isi += cards([
        ("📐", "Konstruksi", "Garis, lingkaran, dan busur acuan yang belum tentu menjadi bagian gambar akhir. Dibuat cepat dan kasar; ketelitiannya datang dari snap dan koordinat, bukan dari tangan.", ""),
        ("✂️", "Penyuntingan", "Trimex memotong/memperpanjang, Offset membuat kontur sejajar, Join/Split dan Upgrade/Downgrade mengubah struktur objek. Inilah tahap yang membedakan CAD dari menggambar ulang.", "trim · extend · offset"),
        ("🔁", "Pola dan salinan", "Array (ortho, polar, path), Mirror, dan Clone menggandakan satu objek menjadi banyak dengan aturan; ubah induknya, salinannya ikut.", "1 objek → n salinan"),
        ("🏷️", "Anotasi dan organisasi", "Dimensi dan teks membuat gambar terbaca oleh orang lain; layer memisahkan kontur, sumbu, dimensi, dan konstruksi agar gambar bisa dicetak dan diekspor dengan benar.", ""),
    ])
    isi += tabel(["Kebutuhan gambar", "Cara lama (gambar ulang)", "Alat Draft"],
                 [["Garis kelebihan panjang di perpotongan", "Hapus dan gambar ulang segmen", "Trimex: klik bagian yang dibuang"],
                  ["Kontur sejajar (clearance, tebal dinding)", "Ukur tiap sisi lalu gambar lagi", "Offset dengan jarak t, sudut otomatis"],
                  ["Delapan lubang baut melingkar", "Hitung koordinat delapan pusat", "PolarArray n = 8, satu lubang induk"],
                  ["Sisi simetris kiri–kanan", "Gambar dua kali", "Mirror terhadap sumbu simetri"],
                  ["Ukuran berubah setelah revisi", "Ubah teks dimensi manual (rawan salah)", "Dimension terikat geometri, nilai diperbarui"],
                  ["Cetak tanpa garis konstruksi", "Hapus garis bantu (hilang selamanya)", "Layer Konstruksi disembunyikan"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02–04 adalah <em>alat sunting</em> (Trimex, Offset, Array dan kawan-kawannya) yang langsung dipakai Tugas 1–4. Bagian 05–06 mengurus <em>organisasi dan anotasi</em> (layer, dimensi) untuk Tugas 5. Bagian 07 merangkum alat bantu yang membuat semua alat di atas presisi, dan Bagian 08–09 menutup dengan Python console serta praktik terbimbing flens pelat.")
    m += bagian(1, "m-alur", "Alur Drafting 2D:<br>dari Kontur Kasar ke Gambar Rapi", "Gambar kerja 2D yang baik dibangun bertahap. Bagian ini memetakan empat tahap drafting di FreeCAD dan menunjukkan alat Draft mana yang menggantikan kebiasaan menggambar ulang.", isi, "ALUR DRAFTING 2D")

    # 02 — Trim & Extend
    isi = figure(2, "Trimex memotong garis pada perpotongan dengan objek batas", "Klik pada bagian garis yang ingin dibuang; Draft mencari objek batas terdekat pada sisi itu. Bila garis belum menyentuh batas, Trimex justru memperpanjangnya (extend).", gambar2())
    isi += tabel(["Alat", "Cara pakai", "Catatan"],
                 [["<strong>Trimex</strong> (trim)", "Pilih garis/busur, gerakkan kursor ke bagian yang mau dibuang, klik", "Batas = objek Draft/Part apa pun yang memotong; tahan Shift untuk membatasi ke satu arah"],
                  ["<strong>Trimex</strong> (extend)", "Pilih garis, gerakkan kursor melewati ujungnya ke arah objek batas, klik", "Ujung ditarik sampai perpotongan pertama"],
                  ["<strong>Trimex</strong> (extrude)", "Pilih wire tertutup, geser tegak lurus bidangnya", "Menghasilkan solid; bahasan Modul 5"],
                  ["<strong>Split</strong>", "Pilih wire, klik titik pemisah", "Wire menjadi dua wire"],
                  ["<strong>Join</strong>", "Pilih beberapa wire yang ujungnya bertemu", "Menjadi satu wire"],
                  ["<strong>Upgrade / Downgrade</strong>", "Pilih objek, tekan alat", "Garis → wire → face, dan sebaliknya; Downgrade face menjadi wire, wire menjadi garis-garis"]])
    isi += formula(1, "Panjang Tali Busur Hasil Trim", r"c = 2\sqrt{r^{2} - h^{2}}",
                   r"\(r\) = radius lingkaran batas &nbsp;·&nbsp; \(h\) = jarak garis dari pusat lingkaran &nbsp;·&nbsp; \(c\) = panjang ruas garis di dalam lingkaran. Contoh \(r = " + str(R_C) + r"\), \(h = " + str(H_C) + r"\): \(c = " + ind(CHORD_C, 3) + r"\) mm.",
                   "Trimex memotong garis tepat pada titik potongnya dengan lingkaran; ruas yang tersisa adalah tali busur. Rumus ini memeriksa apakah Trimex memakai batas yang benar: bila hasil Shape.Length tidak cocok, kemungkinan garis terpotong oleh objek lain yang kebetulan melintas.",
                   [("c", "Panjang tali busur (mm)"), ("r", "Radius lingkaran (mm)"), ("h", "Jarak garis ke pusat (mm)")])
    isi += anim_panel(2, "amber", "Trimex: garis dipotong lingkaran menjadi tali busur", "cvTrim",
                      [("sl_tr_r", "v_tr_r", "Radius lingkaran r (mm)", 20, 60, 1, 35, "35"),
                       ("sl_tr_h", "v_tr_h", "Jarak garis dari pusat h (mm)", 0, 40, 1, 12, "12")],
                      "btnTrim", "toggleTrim", "trimInfo",
                      "<strong>Cara membaca:</strong> animasi mengulang tiga keadaan: garis penuh, ujung kiri dipotong, lalu ujung kanan dipotong. Panjang ruas yang tersisa mengikuti Persamaan (1); geser <em>h</em> mendekati <em>r</em> dan lihat tali busur mengecil sampai garis hanya menyinggung lingkaran.")
    isi += kotak("warning-box", "⚠️ <strong>Kesalahan umum Trimex:</strong> (1) mengeklik bagian yang ingin <em>disimpan</em>, padahal Draft membuang bagian yang diklik; (2) objek batas belum ada di bidang kerja yang sama; (3) garis hasil trim masih objek Line yang sama, jadi Shape.Length yang dibaca adalah panjang baru, bukan panjang semula.")
    m += bagian(2, "m-trimex", "Trim dan Extend<br>dengan Draft Trimex", "Trimex adalah pisau dan penarik garis Draft: memotong bagian yang melewati objek lain dan memperpanjang ujung sampai objek batas. Bagian ini menjelaskan cara memilih sisi yang dibuang, alat pendamping Split/Join/Upgrade, dan rumus untuk memeriksa hasilnya.", isi, "TRIM DAN EXTEND")

    # 03 — Offset
    isi = figure(3, "Offset kontur ke luar dan ke dalam", f"Persegi panjang {A_C} × {B_C} mm di-offset {T_C} mm: Draft Offset menjaga sudut lancip, sedangkan makeOffset2D bawaan Part memberi sudut membulat berjari-jari t.", gambar3())
    isi += formula(2, "Luas Kontur Hasil Offset Persegi Panjang", r"A_{lancip} = (a + 2t)(b + 2t), \qquad A_{bulat} = ab + 2t(a + b) + \pi t^{2}",
                   r"\(a, b\) = sisi persegi panjang &nbsp;·&nbsp; \(t\) = jarak offset ke luar (negatif untuk ke dalam pada rumus pertama). Contoh " + f"{A_C} × {B_C}, t = {T_C}" + r": \(A_{lancip} = " + ind(LUAS_OFS_LANCIP, 0) + r"\), \(A_{bulat} = " + ind(LUAS_OFS_BULAT, 2) + r"\) mm².",
                   "Offset menambah pita selebar t di sekeliling kontur. Dengan sudut lancip, pita di sudut berbentuk persegi t × t (empat buah = 4t²); dengan sudut membulat, keempat sudut bersama-sama membentuk satu lingkaran penuh berjari-jari t (πt²). Selisih keduanya adalah (4 − π)t².",
                   [("A", "Luas kontur hasil offset (mm²)"), ("a, b", "Sisi kontur asal (mm)"), ("t", "Jarak offset (mm)")])
    isi += tabel(["Opsi Draft Offset", "Arti", "Kapan dipakai"],
                 [["Copy (Alt)", "Kontur asal dipertahankan, hasil offset menjadi objek baru", "Tebal dinding, clearance, kontur luar–dalam (Tugas 1)"],
                  ["OCC mode (C)", "Offset dengan kernel Part: sudut membulat, wire terbuka ditutup", "Kontur yang perlu radius di sudut"],
                  ["Bind (B)", "Kontur asal dan hasil offset digabung menjadi satu face pita", "Langsung mendapat cincin/pita berongga"],
                  ["Symmetric (S)", "Offset ke dua arah sekaligus", "Alur/slot selebar 2t"],
                  ["Sisi (arah kursor)", "Kursor di luar → offset ke luar, di dalam → ke dalam", "Perhatikan pratinjau sebelum klik"]])
    isi += anim_panel(1, "cyan", "Offset kontur: luas dan keliling mengikuti jarak t", "cvOffset",
                      [("sl_of_a", "v_of_a", "Panjang a (mm)", 60, 160, 1, 100, "100"),
                       ("sl_of_b", "v_of_b", "Lebar b (mm)", 30, 100, 1, 60, "60"),
                       ("sl_of_t", "v_of_t", "Jarak offset maksimum t (mm)", 1, 20, 0.5, 10, "10,0")],
                      "btnOffset", "toggleOffset", "offsetInfo",
                      "<strong>Cara membaca:</strong> pita offset mengembang dan menyusut secara berkala (PAUSE untuk menahan pada t maksimum). Kontur luar (kuning) memakai sudut lancip seperti Draft Offset; kontur dalam (ungu) lenyap bila t melebihi setengah sisi terpendek, keadaan yang di FreeCAD menghasilkan geometri terbalik atau kosong.")
    m += bagian(3, "m-offset", "Offset:<br>Kontur Sejajar Berjarak Tetap", "Offset menghasilkan kontur yang setiap sisinya berjarak tegak lurus t dari kontur asal. Bagian ini membahas arah, mode salinan dan pengikatan, perbedaan sudut lancip dan membulat, serta rumus luas untuk memeriksa hasilnya.", isi, "OFFSET")

    # 04 — Array dan salinan
    isi = figure(4, "Pola salinan: OrthoArray dan PolarArray", f"OrthoArray menyalin pada kisi dengan interval X dan Y; PolarArray menyalin {N_AR} kali mengelilingi pusat pada lingkaran jarak (PCD) berjari-jari {R_AR} mm.", gambar4())
    isi += tabel(["Alat", "Masukan utama", "Hasil"],
                 [["<strong>OrthoArray</strong>", "Jumlah X/Y/Z, interval X/Y/Z", "Satu objek Array parametrik (Link array bila diaktifkan)"],
                  ["<strong>PolarArray</strong>", "Jumlah salinan, sudut polar (360°), pusat", "Pola melingkar; sudut antar-salinan = sudut/n"],
                  ["<strong>CircularArray</strong>", "Jarak radial, jarak tangensial, jumlah lapis", "Pola lingkaran konsentris"],
                  ["<strong>PathArray</strong>", "Objek + wire lintasan, jumlah", "Salinan disebar sepanjang lintasan"],
                  ["<strong>Mirror</strong>", "Objek + dua titik sumbu cermin", "Salinan cermin (objek Mirror, terikat asal)"],
                  ["<strong>Clone</strong>", "Objek", "Salinan yang mengikuti perubahan asal; boleh diskalakan"],
                  ["<strong>Move / Rotate / Scale</strong>", "Titik acuan, tujuan/sudut/faktor; opsi Copy", "Objek dipindah atau disalin (bahasan lanjut Modul 3)"]])
    isi += formula(3, "Jarak Antar-Pusat pada Pola Melingkar", r"d_{tetangga} = 2R\sin\!\left(\frac{\pi}{n}\right)",
                   r"\(R\) = radius lingkaran jarak (setengah PCD) &nbsp;·&nbsp; \(n\) = jumlah salinan pada 360°. Contoh \(n = " + str(N_AR) + r"\), \(R = " + str(R_AR) + r"\): \(d = " + ind(JARAK_AR, 3) + r"\) mm.",
                   "Dua pusat bertetangga membentuk segitiga sama kaki dengan dua sisi R dan sudut puncak 2π/n; alasnya adalah jarak tetangga. Angka ini yang diperiksa pemeriksa flens dengan jangka sorong, dan yang diminta Tugas 3.",
                   [("d_{tetangga}", "Jarak dua pusat bertetangga (mm)"), ("R", "Radius lingkaran jarak (mm)"), ("n", "Jumlah salinan")])
    isi += formula(4, "Luas Bersih Pelat dengan Deret Lubang", r"A_{bersih} = a\,b - n\,\frac{\pi d^{2}}{4}",
                   r"\(a, b\) = ukuran pelat &nbsp;·&nbsp; \(n\) = jumlah lubang hasil array &nbsp;·&nbsp; \(d\) = diameter lubang. Contoh pelat " + f"{A_P} × {B_P}" + r" dengan " + str(NX_P) + r" lubang ⌀" + str(D_P) + r": \(A = " + ind(LUAS_P, 2) + r"\) mm².",
                   "Karena Array adalah satu objek, Part Cut cukup dilakukan sekali dengan Array sebagai tool. Rumus ini sama dengan Persamaan (4) Modul 1, hanya jumlah lubangnya kini ditentukan parameter array.",
                   [("A_{bersih}", "Luas face hasil Cut (mm²)"), ("a, b", "Panjang dan lebar pelat (mm)"), ("n", "Jumlah lubang"), ("d", "Diameter lubang (mm)")])
    isi += anim_panel(3, "green", "PolarArray: pola lubang baut pada lingkaran jarak", "cvArray",
                      [("sl_ar_n", "v_ar_n", "Jumlah lubang n", 3, 16, 1, 8, "8"),
                       ("sl_ar_R", "v_ar_R", "Radius lingkaran jarak R (mm)", 30, 80, 1, 50, "50"),
                       ("sl_ar_d", "v_ar_d", "Diameter lubang d (mm)", 4, 20, 1, 10, "10")],
                      "btnArray", "toggleArray", "arrayInfo",
                      "<strong>Cara membaca:</strong> lubang induk (hijau) disalin satu per satu mengelilingi pusat sambil pola berputar perlahan. Jarak tetangga mengikuti Persamaan (3): menambah n memperkecil jarak walaupun R tetap; menambah R memperbesar jarak untuk n yang sama.")
    m += bagian(4, "m-array", "Array, Mirror, dan Clone:<br>Satu Objek Menjadi Pola", "Pola lubang, gigi, dan fitur berulang tidak digambar satu per satu. Bagian ini membahas alat pemodelan Draft yang menggandakan objek dengan aturan, beserta rumus jarak dan luas yang dipakai untuk memeriksa hasilnya.", isi, "ARRAY DAN SALINAN")

    # 05 — Layer
    isi = figure(5, "Susunan layer gambar kerja 2D", "Setiap layer membawa warna, tebal, dan gaya garis untuk anggotanya; layer konstruksi disembunyikan saat mencetak atau mengekspor.", gambar5())
    isi += cards([
        ("🗂️", "Draft Layer", "Draft → Layer membuat objek Layer di dalam LayerContainer. Seret objek ke layer di pohon dokumen, atau pilih layer aktif (klik dua kali) sebelum menggambar; satu objek hanya boleh di satu layer.", ""),
        ("🎨", "Properti tampilan", "Line Color, Line Width, Draw Style (Solid, Dashed, Dotted, Dashdot), Shape Color, dan Transparency layer menimpa properti anggotanya selama <em>Override Line/Shape Color</em> aktif.", "override"),
        ("👁️", "Visibilitas", "Spasi pada layer menyembunyikan semua anggotanya sekaligus; berguna untuk mematikan konstruksi dan dimensi saat memeriksa kontur.", "Spasi"),
        ("📤", "Ekspor DXF", "Ekspor DXF membawa nama layer, sehingga operator laser/plasma dapat memilih layer Kontur saja dan mengabaikan Dimensi.", "DXF layer"),
    ])
    isi += tabel(["Layer", "Isi", "Warna & tebal (saran)", "Gaya garis"],
                 [["Kontur", "Garis tepi benda, lubang", "Putih/cyan, 0,5–0,7 mm", "Solid"],
                  ["Sumbu", "Garis sumbu lubang dan simetri", "Merah, 0,25 mm", "Dashdot (rantai)"],
                  ["Tersembunyi", "Tepi yang tertutup", "Kuning, 0,35 mm", "Dashed"],
                  ["Dimensi", "Draft Dimension, garis perpanjangan", "Hijau, 0,25 mm", "Solid, teks 3,5 mm"],
                  ["Teks & simbol", "Catatan, tanda pengerjaan", "Ungu, 0,25 mm", "Solid"],
                  ["Konstruksi", "Garis bantu, lingkaran acuan", "Abu-abu, 0,18 mm", "Dotted; disembunyikan saat cetak"]])
    isi += kotak("info-box", "<strong>📏 Konvensi ISO 128:</strong> garis tebal (kontur tampak) kira-kira dua kali garis tipis (dimensi, perpanjangan, arsir); garis putus-putus untuk tepi tersembunyi; garis rantai tipis untuk sumbu. Draft tidak memaksakan standar ini, tetapi layer membuatnya mudah dijaga: atur sekali pada layer, semua anggotanya mengikuti.")
    m += bagian(5, "m-layer", "Layer:<br>Menata Gambar Agar Terbaca", "Gambar yang semua garisnya sama warna dan sama tebal sulit dibaca dan salah diekspor. Bagian ini membahas Draft Layer, properti yang dibawanya, konvensi layer gambar teknik, dan pengaruhnya pada ekspor DXF.", isi, "LAYER")

    # 06 — Dimensi
    isi = figure(6, "Anatomi Draft Dimension linear dan angular", "Dimensi linear membaca jarak dua titik, dimensi angular membaca sudut dua garis; keduanya terikat ke geometri sehingga nilainya berubah bersama model.", gambar6())
    isi += tabel(["Jenis dimensi Draft", "Cara membuat", "Yang diukur"],
                 [["Linear (horizontal/vertikal)", "Klik dua titik, geser garis dimensi mendatar/tegak", "Proyeksi jarak pada sumbu X atau Y"],
                  ["Aligned", "Klik dua titik, geser sejajar segmen", "Jarak langsung dua titik"],
                  ["Edge", "Pilih satu edge, tekan Dimension", "Panjang edge; terikat ke edge itu"],
                  ["Radius / Diameter", "Pilih lingkaran/busur, tekan Dimension (ubah Diameter di properti)", "R atau ⌀"],
                  ["Angular", "Pilih dua garis, tempatkan busur dimensi", "Sudut antara dua garis (°)"],
                  ["Label", "Draft Label: teks berpanah ke objek", "Nama, posisi, panjang, luas objek acuan"]])
    isi += formula(5, "Sudut Sisi Miring terhadap Alas", r"\theta = \arctan\!\left(\frac{H}{s}\right)",
                   r"\(H\) = tinggi profil &nbsp;·&nbsp; \(s\) = selisih mendatar antara ujung alas dan ujung atas sisi miring. Contoh \(H = " + str(H_T) + r"\), \(s = " + str(S_T) + r"\): \(\theta = " + ind(SUDUT_T, 3) + r"^\circ\).",
                   "Dimensi angular Draft mengembalikan sudut yang sama dengan rumus ini, dalam derajat. Bila nilai yang tampil adalah pelengkapnya (180° − θ), busur dimensi ditempatkan pada sisi yang salah; geser titik penempatannya.",
                   [(r"\theta", "Sudut alas–sisi miring (derajat)"), ("H", "Tinggi profil (mm)"), ("s", "Selisih mendatar sisi miring (mm)")])
    isi += cards([
        ("🔤", "Properti dimensi", "FontSize (tinggi teks), Decimals, ShowUnit, ArrowType dan ArrowSize, ExtLines (panjang garis perpanjangan), DimOvershoot. Nilai bawaan diatur di Preferences → Draft → Visual settings.", ""),
        ("🔗", "Terikat geometri", "Dimension yang dibuat dengan mengklik titik/edge objek menyimpan tautan (Support). Mengubah objek memperbarui dimensi; dimension yang dibuat pada titik kosong tidak mengikuti apa pun.", "Support"),
        ("✏️", "Nilai override", "Properti Override menampilkan teks lain (mis. toleransi “40 ±0,1”) tanpa mengubah nilai terukur; pakai dengan hati-hati agar gambar tidak berbohong.", "40 ±0,1"),
    ])
    isi += anim_panel(4, "violet", "Dimensi parametrik pada profil trapesium", "cvDimensi",
                      [("sl_dm_w", "v_dm_w", "Lebar alas W (mm)", 80, 200, 1, 140, "140"),
                       ("sl_dm_h", "v_dm_h", "Tinggi H (mm)", 30, 110, 1, 70, "70"),
                       ("sl_dm_s", "v_dm_s", "Selisih mendatar maksimum s (mm)", 5, 90, 1, 40, "40")],
                      "btnDimensi", "toggleDimensi", "dimensiInfo",
                      "<strong>Cara membaca:</strong> sisi miring bergoyang (s berubah) dan semua dimensi ikut berubah tanpa disentuh: itulah dimensi yang terikat geometri. Sudut angular mengikuti Persamaan (5); bandingkan dengan Tugas 5 yang meminta angka ini untuk varian N Anda.")
    m += bagian(6, "m-dimensi", "Dimensi:<br>Anotasi yang Mengikuti Geometri", "Dimensi mengubah gambar menjadi instruksi produksi. Bagian ini membahas jenis Draft Dimension, propertinya, keterikatan pada geometri, dan rumus sudut yang dipakai Tugas 5.", isi, "DIMENSI")

    # 07 — Alat bantu
    isi = tabel(["Snap", "Menempel ke", "Kegunaan khas"],
                [["Endpoint", "Ujung garis/busur", "Menyambung garis tanpa celah"],
                 ["Midpoint", "Titik tengah segmen", "Sumbu simetri, pusat lubang di tengah sisi"],
                 ["Center", "Pusat lingkaran/busur", "Menempatkan lubang sepusat, pusat PolarArray"],
                 ["Perpendicular", "Titik tegak lurus pada garis lain", "Tebal dinding, tinggi profil"],
                 ["Intersection", "Perpotongan dua objek", "Titik potong garis konstruksi"],
                 ["Extension", "Perpanjangan garis lain", "Menyejajarkan ujung dengan objek lain"],
                 ["Parallel / Ortho", "Arah sejajar objek / sumbu", "Garis lurus mendatar/tegak"],
                 ["Grid", "Titik kisi", "Sketsa cepat dengan kelipatan 10 mm"],
                 ["Working plane", "Bidang kerja aktif", "Semua titik dipaksa ke bidang"]])
    isi += cards([
        ("🧲", "Toolbar Snap", "Aktifkan hanya snap yang diperlukan; terlalu banyak snap membuat kursor melompat ke titik yang tidak diinginkan. Tombol utama Snap Lock mematikan semuanya sementara.", "Snap Lock"),
        ("▦", "Grid", "Draft ToggleGrid menampilkan kisi bidang kerja; jarak dan jumlah garis utama diatur di Preferences → Draft → Grid and snapping. Grid membantu orientasi, snap Grid membuatnya presisi.", "10 mm"),
        ("🏗️", "Construction mode", "Tombol Construction pada toolbar Draft: objek berikutnya masuk grup Construction dengan warna khusus. Ideal untuk lingkaran jarak, garis sumbu sementara, dan titik acuan.", ""),
        ("📐", "Working plane", "Semua tugas modul ini di Top (XY). Bila objek tampak miring atau koordinat tidak masuk akal, periksa tombol working plane lebih dulu.", "Top (XY)"),
        ("⌨️", "Masukan koordinat", "Angka tetap lebih presisi daripada snap: ketik X ⏎ Y ⏎ Z ⏎ di panel Tasks; centang Relative untuk koordinat relatif, Global untuk koordinat global.", "X ⏎ Y ⏎ Z"),
        ("🔍", "Selection view", "View → Panels → Selection view menampilkan nama objek dan sub-elemen yang terpilih, berguna sebelum Trimex dan Cut agar objek yang dipilih benar.", ""),
    ])
    isi += kotak("tip-box", "💡 <strong>Urutan yang menghemat waktu:</strong> nyalakan Construction mode → gambar lingkaran jarak dan sumbu → matikan Construction mode → gambar satu lubang dengan snap Center/Intersection → PolarArray → sembunyikan grup Construction. Geometri akhir bersih, acuan tetap tersimpan untuk revisi.")
    m += bagian(7, "m-bantu", "Alat Bantu:<br>Snap, Grid, dan Mode Konstruksi", "Presisi CAD datang dari alat bantu, bukan dari tangan yang mantap. Bagian ini merangkum snap yang dipakai sehari-hari, grid dan bidang kerja, mode konstruksi, dan masukan koordinat.", isi, "ALAT BANTU")

    # 08 — Python console
    isi = kode("Python console — offset persegi panjang dan luasnya", f'''import FreeCAD as App, Draft, Part
doc = App.newDocument("Latihan2")
r = Draft.make_rectangle({A_C}, {B_C})          # {A_C} x {B_C} mm, sudut di (0, 0)
r.MakeFace = True
doc.recompute()
t = {T_C}
lancip  = r.Shape.makeOffset2D(t, 2)     # join=2: sudut lancip (intersection), seperti Draft Offset polyline
bulat   = r.Shape.makeOffset2D(t, 0)     # join=0: sudut membulat berjari-jari t
print(f"Luas offset lancip = {{Part.Face(lancip).Area:.2f}} mm^2")   # (a+2t)(b+2t) = {ind(LUAS_OFS_LANCIP, 2)}
print(f"Luas offset bulat  = {{Part.Face(bulat).Area:.2f}} mm^2")   # ab + 2t(a+b) + pi t^2 = {ind(LUAS_OFS_BULAT, 2)}
Part.show(lancip, "OffsetLancip")        # tampilkan hasil sebagai objek Part''', "Python (FreeCAD)")
    isi += kode("Python console — polar array lubang dan jarak tetangga", f'''import FreeCAD as App, Draft, math
doc = App.ActiveDocument
V = App.Vector
lubang = Draft.make_circle({D_AR / 2:g}, placement=App.Placement(V({R_AR}, 0, 0), App.Rotation()))   # d = {D_AR} di (R, 0)
pola = Draft.make_polar_array(lubang, number={N_AR}, angle=360, center=V(0, 0, 0))
doc.recompute()
n, R = {N_AR}, {R_AR}
print(f"Jarak tetangga = {{2 * R * math.sin(math.pi / n):.3f}} mm")     # {ind(JARAK_AR, 3)}
print(f"Luas seluruh lubang = {{pola.Shape.Area:.2f}} mm^2")          # n * pi d^2 / 4 = {ind(N_AR * math.pi * D_AR ** 2 / 4, 2)}
# Ortho array 1 baris x {NX_P} kolom untuk pelat {A_P} x {B_P}:
plat = Draft.make_rectangle({A_P}, {B_P}); plat.MakeFace = True
jarak = {A_P} / ({NX_P} + 1)
induk = Draft.make_circle({D_P / 2:g}, placement=App.Placement(V(jarak, {B_P / 2:g}, 0), App.Rotation()))
deret = Draft.make_ortho_array(induk, v_x=V(jarak, 0, 0), v_y=V(0, {B_P}, 0), v_z=V(0, 0, 1), n_x={NX_P}, n_y=1, n_z=1)
doc.recompute()
print(f"Luas bersih = {{plat.Shape.cut(deret.Shape).Area:.2f}} mm^2")   # {ind(LUAS_P, 2)}''', "Python (FreeCAD)")
    isi += kode("Python console — layer, dimensi, dan sudut sisi miring", f'''import FreeCAD as App, Draft, math
doc = App.ActiveDocument
V = App.Vector
W, H, s = {W_T}, {H_T}, {S_T}
profil = Draft.make_wire([V(0, 0, 0), V(W, 0, 0), V(W - s, H, 0), V(0, H, 0)], closed=True, face=True)
kontur = Draft.make_layer(name="Kontur", line_color=(0.13, 0.83, 0.93), line_width=2.0)
dimensi = Draft.make_layer(name="Dimensi", line_color=(0.0, 0.88, 0.62), line_width=1.0)
kontur.Group = [profil]                                             # objek masuk layer Kontur
d1 = Draft.make_linear_dimension(V(0, 0, 0), V(W, 0, 0), V(W / 2, -15, 0))       # alas
d2 = Draft.make_linear_dimension(V(0, 0, 0), V(0, H, 0), V(-15, H / 2, 0))       # tinggi
dimensi.Group = [d1, d2]
doc.recompute()
alas, miring = V(-1, 0, 0), V(-s, H, 0)                            # dua arah dari sudut kanan-bawah
print(f"Sudut alas-sisi miring = {{math.degrees(alas.getAngle(miring)):.3f}} deg")   # arctan(H/s) = {ind(SUDUT_T, 3)}
print(f"Dimensi alas = {{d1.Distance:.2f}} mm, tinggi = {{d2.Distance:.2f}} mm")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell di atas dan cocokkan angkanya dengan komentar (offset lancip " + ind(LUAS_OFS_LANCIP, 0) + " mm², jarak tetangga " + ind(JARAK_AR, 3) + " mm, luas bersih " + ind(LUAS_P, 2) + " mm², sudut " + ind(SUDUT_T, 3) + "°). Tugas meminta hasil lewat alat GUI (Draft Offset, Trimex, Array, Dimension) agar berkas Anda memuat objek-objek itu; Python console berguna untuk memeriksa angkanya.")
    m += bagian(8, "m-python", "Python Console:<br>Memeriksa Hasil Penyuntingan", "Setiap alat Draft punya padanan API Python. Tiga cell berikut membuat offset, array, layer, dan dimensi lewat skrip, lalu membaca angka yang sama dengan yang diminta tugas, sebagai alat periksa sebelum mengunggah berkas.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Siapkan dokumen", "Ctrl+N, workbench Draft, working plane Top (XY), satuan mm. Buat layer Kontur, Dimensi, dan Konstruksi (Draft → Layer, ganti nama di properti Label)."),
               ("2", "Acuan konstruksi", f"Nyalakan Construction mode. Draft Circle radius {R_AR} mm di titik asal sebagai lingkaran jarak (PCD {2 * R_AR}), dan dua Draft Line sumbu X dan Y sepanjang ±{L_SUMBU_AR} mm. Matikan Construction mode."),
               ("3", "Kontur flens", f"Draft Circle radius {R_LUAR_AR} mm (kontur luar) dan radius {R_POROS_AR} mm (lubang poros) di titik asal, Make Face aktif. Masukkan keduanya ke layer Kontur."),
               ("4", "Lubang baut", f"Draft Circle ⌀{D_AR} berpusat di ({R_AR}, 0) memakai snap Intersection lingkaran jarak dan sumbu X. Draft → PolarArray: {N_AR} salinan, 360°, pusat (0, 0, 0)."),
               ("5", "Potong", "Part → Boolean → Cut: kontur luar − lubang poros, lalu hasilnya − Array. Sembunyikan objek antara (Spasi); periksa Shape.Area di Python console."),
               ("6", "Dimensi", f"Pada layer Dimensi: Draft Dimension diameter kontur luar dan lubang poros, radius lingkaran jarak (dari layer Konstruksi), dan angular 360°/{N_AR} = {ind(360 / N_AR, 0)}° antara dua sumbu lubang bertetangga."),
               ("7", "Simpan dan periksa", "Sembunyikan layer Konstruksi, V lalu F, Ctrl+S → <code>Latihan2_NIM.FCStd</code>. Coba File → Export → DXF dan buka kembali untuk melihat layer-nya terbawa.")]
    isi = figure(7, "Benda kerja praktik terbimbing: flens pelat delapan baut", "Pandangan atas pada bidang Top (XY), satuan mm. Pusat flens berada di titik asal (0, 0). Lingkaran jarak dan garis sumbu dibuat pada langkah 2, kontur luar dan lubang poros pada langkah 3 (keduanya diketik sebagai radius), lubang induk berwarna hijau dan PolarArray pada langkah 4, sedangkan sudut antarsumbu lubang adalah dimensi angular langkah 6.", gambar7())
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
                 [["Trimex memotong sisi yang salah", "Klik pada bagian yang ingin disimpan", "Ctrl+Z, klik pada bagian yang ingin dibuang"],
                  ["Offset menghasilkan kontur di dalam padahal ingin di luar", "Kursor berada di dalam kontur saat mengetik jarak", "Geser kursor ke luar dulu, baru ketik jarak"],
                  ["Luas offset tidak cocok dengan (a + 2t)(b + 2t)", "Mode OCC (sudut membulat) aktif", "Matikan OCC, atau pakai rumus sudut membulat"],
                  ["PolarArray hanya membuat 1 salinan", "Number of elements masih 1 atau sudut 0", "Isi jumlah dan sudut 360 sebelum OK"],
                  ["Cut menghasilkan objek kosong", "Array bukan face (lingkaran induk Make Face false)", "Aktifkan Make Face pada lingkaran induk, recompute"],
                  ["Dimensi angular menampilkan 180° − θ", "Busur dimensi ditempatkan di sisi luar sudut", "Pindahkan titik penempatan ke dalam sudut"],
                  ["Objek tidak masuk layer", "Diseret ke LayerContainer, bukan ke layer", "Seret tepat ke nama layer, atau set layer aktif sebelum menggambar"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) bidang kerja Top (XY) dan satuan mm; (2) objek hasil Offset/Array/Trimex memang ada di pohon dokumen (bukan digambar ulang manual); (3) Make Face aktif pada kontur yang luasnya dibaca; (4) layer Kontur dan Dimensi ada untuk Tugas 5; (5) angka disalin dengan desimal secukupnya (jarak tetangga dan sudut minimal 3 desimal); (6) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Flens Pelat Delapan Baut", "Tujuh langkah berikut memakai seluruh alat modul ini pada satu gambar: konstruksi, kontur, PolarArray, Cut, dimensi, dan layer, ditutup dengan ekspor DXF percobaan serta tabel gejala dan perbaikan.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab sketsa 2D, trim/extend/offset, pola (pattern), dan mirror; konsep yang sama diterapkan lewat Draft Workbench.")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: penyuntingan sketsa, dimensi, dan pengelolaan gaya garis pada gambar kerja.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Draft Trimex, Offset, Array tools, Layer, Dimension, Snap", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, opsi, properti, dan API Python (Draft.make_polar_array, make_ortho_array, make_layer, make_linear_dimension).")
    refs += pm_ref(4, "green", "0,224,158", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab konstruksi geometri dan dimensi: dasar rumus tali busur, offset, dan pola melingkar.")
    refs += pm_ref(5, "pink", "236,72,153", "F. E. Giesecke dkk.", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Konvensi jenis dan tebal garis (ISO 128) serta aturan pendimensian yang diterjemahkan menjadi layer dan gaya Draft Dimension.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi penyuntingan 2D, pola salinan, layer, dan dimensi. Dokumentasi Draft Workbench adalah pendamping wajib saat berlatih karena nama opsi dan pintasan mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Draft Workbench (daftar alat dan pintasan), Draft Preferences (grid, snap, gaya dimensi), dan Draft DXF (pengaturan ekspor/impor DXF). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini menjelaskan alasan dan cara memeriksanya dengan angka.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 2 — Drafting dan Penyuntingan 2D · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Draft → Offset</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Trimex</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">PolarArray</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Dimension ∠</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">Layer</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 2 · Drafting dan Penyuntingan 2D</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 2</span><br><em>Menyunting</em><br>Objek 2D</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang Trimex, Offset, Array, layer, dimensi, dan snap, ditambah 5 tugas pemodelan 2D: offset persegi panjang, trim garis oleh lingkaran, pola lubang PolarArray, pelat dengan deret lubang OrthoArray, dan profil trapesium berlayer dengan dimensi angular. Setiap tugas mengunggah berkas .FCStd dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Fungsi utama alat <strong>Draft Trimex</strong> adalah...",
     ["Menggabungkan dua wire menjadi satu objek", "Memotong (trim) atau memperpanjang (extend) garis/busur sampai batas objek lain", "Menyalin objek ke layer lain", "Mengubah skala objek terhadap titik acuan"],
     "Fungsi Draft Trimex"),
    ("Hasil <strong>Draft Offset</strong> sebuah kontur tertutup sejauh t ke arah luar adalah...",
     ["Kontur yang sama dengan warna berbeda", "Kontur yang diputar sebesar t derajat", "Kontur yang digeser t mm searah sumbu X", "Kontur baru yang setiap sisinya berjarak tegak lurus t mm dari kontur asal"],
     "Arti Draft Offset"),
    ("Kegunaan <strong>Draft Layer</strong> adalah...",
     ["Mengelompokkan objek dengan properti tampilan bersama (warna, tebal, gaya garis) dan visibilitas yang dapat dimatikan sekaligus", "Menyimpan riwayat undo dokumen", "Membagi dokumen menjadi beberapa berkas", "Mengunci satuan dokumen"],
     "Kegunaan Draft Layer"),
    ("Jenis <strong>Draft Dimension</strong> untuk mengukur sudut antara dua garis adalah...",
     ["Linear", "Radius", "Angular", "Diameter"],
     "Dimensi untuk sudut"),
    ("Snap <strong>Perpendicular</strong> pada Draft menempelkan titik yang sedang dibuat ke...",
     ["Titik tengah segmen", "Posisi tegak lurus pada garis lain dari titik sebelumnya", "Pusat lingkaran", "Titik kisi (grid)"],
     "Snap Perpendicular"),
    ("<strong>Draft PolarArray</strong> menghasilkan...",
     ["Salinan objek sepanjang garis lurus dengan interval tetap", "Salinan cermin objek terhadap sebuah sumbu", "Salinan objek pada titik-titik kisi X dan Y", "n salinan objek mengelilingi sebuah pusat dengan sudut yang sama"],
     "Hasil PolarArray"),
    ("Perbedaan <strong>Draft Clone</strong> dari salinan biasa (Copy) adalah...",
     ["Clone tetap terikat pada objek asal: bila asal diubah, clone ikut berubah", "Clone berdiri sendiri dan tidak terpengaruh objek asal", "Clone hanya dapat dibuat dari lingkaran", "Clone otomatis pindah ke layer baru"],
     "Clone vs Copy"),
    ("Menerapkan <strong>Draft Upgrade</strong> pada beberapa garis yang membentuk kontur tertutup akan...",
     ["Menghapus garis-garis tersebut", "Memecahnya menjadi titik-titik", "Menggabungkannya menjadi satu wire, lalu face bila diulang", "Mengubahnya menjadi dimensi"],
     "Hasil Draft Upgrade"),
    ("<strong>Construction mode</strong> pada Draft berguna karena...",
     ["Objek yang dibuat masuk ke grup Construction dengan warna khusus dan tidak tercampur dengan geometri akhir", "Semua objek terkunci dari penyuntingan", "Dokumen memakai lebih sedikit memori", "Satuan dipaksa menjadi inci"],
     "Construction mode"),
    ("Nilai yang ditampilkan <strong>Draft Dimension</strong> pada FreeCAD...",
     ["Harus diketik manual setiap kali", "Tetap sama walaupun geometrinya diubah", "Bergantung pada tingkat zoom tampilan", "Diambil dari geometri yang diukur dan diperbarui otomatis bila geometri berubah"],
     "Sifat nilai Draft Dimension"),
]

TUGAS_LABELS = ["Offset persegi panjang — luas kontur luar (mm²)", "Trimex garis oleh lingkaran — panjang tali busur (mm)", "PolarArray lubang flens — jarak antar-pusat (mm)",
                "Pelat dengan deret lubang OrthoArray (Cut) — luas bersih (mm²)", "Profil trapesium berlayer — sudut dimensi angular (°)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}

FQ_JUDUL = [
    "Susun urutan alat Draft untuk menggambar flens: mana yang konstruksi, mana yang disunting?",
    "Layer dan jenis garis apa yang harus ada agar operator laser dan pemeriksa membaca gambar yang sama?",
    "Dimensi mana yang wajib dicantumkan, dan bagaimana menjaga agar nilainya tidak berbohong setelah revisi?",
]
FQ_RINGKAS = [
    "Rancang urutan pembuatan flens 8 lubang di Draft: acuan konstruksi, kontur, PolarArray, Cut, dan periksa jarak tetangga dengan Persamaan (3). Jelaskan mengapa lubang tidak digambar delapan kali.",
    "Usulkan susunan layer (kontur, sumbu, dimensi, konstruksi) beserta warna dan gaya garisnya, dan jelaskan mana yang diekspor ke DXF untuk laser dan mana yang untuk pemeriksa.",
    "Tentukan dimensi wajib flens (diameter luar, lubang poros, PCD, jumlah dan diameter lubang, sudut) dan jelaskan peran dimensi yang terikat geometri serta bahaya nilai Override saat PCD direvisi.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Flens memiliki kontur luar ⌀190, lubang poros ⌀50, dan delapan lubang baut ⌀10 pada lingkaran jarak (PCD) ⌀100. Susun urutan alat Draft yang Anda pakai (Bagian 01, 04, 07): apa yang dibuat dalam Construction mode, kontur mana yang digambar langsung, bagaimana PolarArray dan Cut dipakai, dan bagaimana Anda memeriksa jarak antar-lubang dengan Persamaan (3). Jelaskan mengapa delapan lubang tidak digambar satu per satu.",
            ["PCD ⌀100 · 8 lubang", "Construction → PolarArray → Cut", "d = 2R·sin(π/8)"],
            "Untuk membuat delapan lubang baut yang tersebar merata pada lingkaran jarak, alat Draft yang paling tepat adalah...",
            ["Menggambar delapan Draft Circle dengan koordinat yang dihitung manual", "PolarArray dari satu lubang induk dengan 8 salinan pada 360°", "OrthoArray 4 × 2 dengan interval sama dengan diameter PCD", "Mirror lubang induk empat kali terhadap sumbu X dan Y"],
            "✅ Tepat! PolarArray menempatkan delapan salinan pada sudut 45° yang sama tepat, tetap satu objek parametrik (ubah jumlah atau PCD, semua salinan ikut), dan cukup satu Cut. Jarak tetangganya 2·50·sin(22,5°) = 38,268 mm.",
            "❌ Menggambar manual rawan salah koordinat, OrthoArray membuat kisi bukan lingkaran, dan Mirror hanya memberi 4 lubang simetris. Pola melingkar adalah pekerjaan PolarArray (Bagian 04).",
            "Petunjuk: (1) Sebutkan acuan konstruksi (lingkaran jarak, sumbu). (2) Urutkan kontur, PolarArray, dan Cut. (3) Hitung jarak tetangga dan jelaskan keuntungan array dibanding menggambar berulang.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Gambar flens ini dibaca dua pihak: operator laser cutting yang hanya butuh kontur (DXF) dan pemeriksa yang membaca dimensi, sumbu, dan catatan. Usulkan susunan layer beserta warna dan gaya garisnya (Bagian 05), jelaskan layer mana yang disembunyikan saat ekspor DXF untuk laser dan mengapa garis konstruksi tidak boleh ikut, serta bagaimana konvensi tebal garis ISO 128 dijaga lewat layer.",
            ["Kontur · Sumbu · Dimensi · Konstruksi", "DXF = layer Kontur", "tebal 0,5 vs tipis 0,25"],
            "Layer yang seharusnya disembunyikan (tidak diekspor) saat mengirim DXF ke operator laser cutting adalah...",
            ["Kontur, karena operator hanya perlu dimensi", "Semua layer kecuali Dimensi", "Sumbu saja; konstruksi tetap dikirim sebagai acuan", "Konstruksi dan Dimensi, karena mesin potong hanya membaca kontur yang akan dipotong"],
            "✅ Tepat! Mesin potong menafsirkan setiap garis sebagai lintasan potong; garis konstruksi dan dimensi yang ikut terkirim akan dipotong juga. Kontur (dan bila perlu sumbu sebagai penanda) yang dikirim, sisanya disembunyikan lewat layer.",
            "❌ Kontur justru satu-satunya yang wajib dikirim ke laser; dimensi dan konstruksi hanya berguna bagi manusia. Lihat kartu Ekspor DXF pada Bagian 05.",
            "Petunjuk: (1) Daftarkan layer dan gaya garisnya. (2) Bedakan kebutuhan operator laser dan pemeriksa. (3) Jelaskan peran layer dalam menjaga konvensi ISO 128.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Pelanggan mungkin mengubah PCD dari ⌀100 menjadi ⌀110 setelah gambar dibuat. Tentukan dimensi yang wajib ada pada gambar flens (Bagian 06), jelaskan mengapa dimensi harus dibuat dengan mengklik geometri (terikat) dan bukan pada titik kosong, dan uraikan apa yang terjadi pada dimensi berisi nilai Override ketika PCD direvisi. Sertakan cara memeriksa bahwa semua dimensi masih benar setelah revisi.",
            ["⌀190 · ⌀50 · PCD ⌀100 · 8×⌀10", "dimensi terikat geometri", "Override = risiko"],
            "Berkas gambar yang aman terhadap revisi PCD adalah yang dimensinya...",
            ["Dibuat dengan mengklik titik/edge geometri sehingga nilainya diperbarui otomatis saat PCD berubah", "Diketik manual sebagai teks agar tidak berubah-ubah", "Menggunakan Override untuk semua nilai supaya rapi", "Dibuat pada titik kosong yang sejajar dengan geometri"],
            "✅ Tepat! Dimension yang terikat (Support ke titik/edge) mengikuti geometri, sehingga revisi PCD memperbarui nilai PCD, jarak tetangga, dan sudut sekaligus. Override hanya untuk catatan toleransi, dan harus diperiksa ulang setiap revisi.",
            "❌ Teks manual, Override menyeluruh, dan dimensi pada titik kosong sama-sama tidak mengikuti geometri: setelah revisi, gambar menampilkan angka lama. Lihat kartu Terikat geometri dan Nilai override pada Bagian 06.",
            "Petunjuk: (1) Daftarkan dimensi wajib flens. (2) Jelaskan dimensi terikat vs bebas. (3) Uraikan risiko Override saat revisi dan cara memeriksanya.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">PCD ⌀100 · 8 × ⌀10</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">layer Kontur → DXF</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">2R·sin(π/8)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">dimensi terikat</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 2 · Drafting dan Penyuntingan 2D</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Gambar Kerja Flens<br><em>yang Dibaca Dua Pihak</em></h1>
    <p class="hero-sub">Bengkel Karya Logam kini menerima pesanan flens pelat untuk sambungan pipa. Gambarnya harus dipotong laser dan diperiksa inspektor. Terapkan alat Pertemuan 2: konstruksi, PolarArray, layer, dan dimensi terikat, untuk menyusun gambar yang benar bagi keduanya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Flens Delapan Baut —<br>Satu Gambar untuk Laser dan Inspektor</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS DRAFTING 2D</div>
    <p>
      Setelah braket pada pertemuan lalu, <strong style="color:var(--amber)">Bengkel Karya Logam</strong> menerima pesanan <strong style="color:var(--cyan)">24 flens pelat baja 8 mm</strong> untuk sambungan pipa: kontur luar <strong>⌀190 mm</strong>, lubang poros <strong>⌀50 mm</strong>, dan <strong>delapan lubang baut ⌀10 mm</strong> pada lingkaran jarak (PCD) <strong>⌀100 mm</strong>.
    </p>
    <p style="margin-top:12px">
      Gambar akan dipakai <strong style="color:var(--cyan)">dua pihak</strong>: operator laser cutting yang meminta berkas DXF berisi kontur saja, dan inspektor QC yang memeriksa PCD, jarak antar-lubang, dan sudut memakai gambar berdimensi. Pesanan pertama sempat ditolak karena garis konstruksi ikut terpotong laser dan dimensi PCD di gambar tidak sama dengan modelnya setelah revisi.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur drafting</strong> di FreeCAD: urutan alat Draft, susunan layer, dan aturan pendimensian yang membuat satu berkas .FCStd melayani laser dan inspektor sekaligus, serta tahan terhadap revisi PCD.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Flens: ⌀190, poros ⌀50, tebal 8", "14,165,233", "cyan")}
{kartu("8 lubang ⌀10 pada PCD ⌀100", "14,165,233", "cyan")}
{kartu("Pesanan: 24 unit", "14,165,233", "cyan")}
{kartu("Keluaran: DXF laser + gambar QC", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Garis konstruksi yang ikut terpotong dan dimensi yang tidak diperbarui adalah dua gejala dari satu penyebab: gambar yang tidak ditata dalam layer dan dimensi yang tidak terikat geometri. Forum ini mengajak Anda merancang tata kerjanya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Flens dengan PolarArray delapan lubang: lapisan kontur (kiri) untuk laser, lapisan dimensi dan sumbu (kanan) untuk inspektor</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Bengkel Karya Logam menerima pesanan 24 flens pelat baja 8 mm: kontur luar &oslash;190 mm, lubang poros &oslash;50 mm, delapan lubang baut &oslash;10 mm pada PCD &oslash;100 mm. Gambar dipakai operator laser (DXF kontur saja) dan inspektor QC (PCD, jarak lubang, sudut). Pesanan pertama ditolak karena garis konstruksi ikut terpotong dan dimensi PCD tidak diperbarui setelah revisi. Susun prosedur drafting di FreeCAD: urutan alat Draft, susunan layer, dan aturan pendimensian yang tahan revisi."
FORUM_CHIPS_LMS = ["flens = ⌀190, poros ⌀50, tebal 8", "8 lubang ⌀10 pada PCD ⌀100", "pesanan = 24 unit", "keluaran = DXF laser + gambar QC"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Flens delapan baut: lapisan kontur (laser) dan lapisan dimensi (inspektor) (Pertemuan 2)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const Rl = 95, Rp = 25, Rpcd = 50, d = 10, n = 8;
  const sk = (H - 40) / (2 * Rl);
  [[W * 0.27, false], [W * 0.73, true]].forEach(([cx, anot]) => {
    const cy = H / 2 + 6;
    ctx.fillStyle = 'rgba(34,211,238,.10)'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, Rl * sk, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#020812'; ctx.beginPath(); ctx.arc(cx, cy, Rp * sk, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const th = i * 2 * Math.PI / n;
      ctx.beginPath(); ctx.arc(cx + Rpcd * sk * Math.cos(th), cy - Rpcd * sk * Math.sin(th), d / 2 * sk, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    if (anot) {
      ctx.strokeStyle = 'rgba(239,68,68,.8)'; ctx.lineWidth = 1; ctx.setLineDash([8, 3, 2, 3]);
      ctx.beginPath(); ctx.moveTo(cx - (Rl + 8) * sk, cy); ctx.lineTo(cx + (Rl + 8) * sk, cy); ctx.moveTo(cx, cy - (Rl + 8) * sk); ctx.lineTo(cx, cy + (Rl + 8) * sk); ctx.stroke();
      ctx.strokeStyle = 'rgba(245,158,11,.8)'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(cx, cy, Rpcd * sk, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - Rl * sk, cy - (Rl + 14) * sk); ctx.lineTo(cx + Rl * sk, cy - (Rl + 14) * sk); ctx.stroke();
      ctx.fillStyle = '#00e09e'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('⌀190', cx, cy - (Rl + 16) * sk - 3); ctx.fillText('PCD ⌀100 · 8 × ⌀10', cx, cy + (Rl + 8) * sk + 14);
      ctx.fillText('45°', cx + Rpcd * sk * 0.55, cy - Rpcd * sk * 0.35);
      ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('gambar QC: layer Kontur + Sumbu + Dimensi', cx, 16);
    } else {
      ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('DXF laser: layer Kontur saja', cx, 16);
    }
  });
  ctx.textAlign = 'left';
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
