# Konten Modul 3 Pemodelan CAD — Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek
# (Sub-CPMK 2.1: menggambar garis, lingkaran, bentuk dasar; pengukuran dan penentuan
# posisi objek; mengedit objek 2D dengan rotate, scale, move). Angka contoh dihitung di
# sini agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian
# tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)
from tugas_gambar import AM, CY, GN, GR, PK, RD, VI, _panah, dim_h, dim_v, ext  # noqa: E402

NOMOR = 3
JUDUL = "Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek"
JUDUL_PANJANG = "Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek"
JUDUL_EKSPOR = "Bentuk Dasar 2D, Pengukuran, dan Transformasi"

# ─────────────────────────── angka contoh ───────────────────────────
DX_C, DY_C = 80, 45
PINDAH_C = math.hypot(DX_C, DY_C)
L_C, TH_C = 100, 40
CHORD_C = 2 * L_C * math.sin(math.radians(TH_C / 2))
N_H, R_H, K_H = 6, 40, 1.5
A_IN = N_H * R_H ** 2 * math.sin(2 * math.pi / N_H) / 2
A_CIRC = N_H * R_H ** 2 * math.tan(math.pi / N_H)
A_SKALA = K_H ** 2 * A_IN
W_PNL, H_PNL = 300, 200         # praktik 09: batas panel, sudut kiri-bawahnya di titik asal (0, 0)
PX_H, PY_H = 60, 60             # praktik 09: pusat heksagon induk
ROT_H, ROT2_H = 30, 90          # praktik 09: Rotate (Copy) induk di pusatnya sendiri; Rotate salinan pertama di (0, 0)
A_T, C_T, H_T = 120, 40, 70
G_T = ((A_T + C_T) / 3, H_T / 3)
CG_T = math.hypot(C_T - G_T[0], H_T - G_T[1])
DABC_T = abs(A_T * H_T) / math.sqrt((C_T - A_T) ** 2 + H_T ** 2)
SUDUT_B = math.degrees(math.atan2(H_T, A_T - C_T))
A_R, B_R, TH_R = 120, 40, 30
YMAX_R = A_R * math.sin(math.radians(TH_R)) + B_R * math.cos(math.radians(TH_R))
XMIN_R = -B_R * math.sin(math.radians(TH_R))


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = ""
    alat = [("Line", "2 titik"), ("Wire", "≥ 3 titik, Close"), ("Rectangle", "2 sudut"), ("Circle", "pusat + radius"),
            ("Arc", "pusat, r, sudut"), ("Polygon", "pusat, n, R"), ("Ellipse", "kotak pembatas"), ("Point", "1 koordinat")]
    for i, (nama, masuk) in enumerate(alat):
        x = 6 + i * 84
        b += f'<rect x="{x}" y="22" width="80" height="118" rx="10" fill="#0e1628" stroke="#243653" stroke-width="1.2"/>'
        cx, cy = x + 40, 62
        c = ["#22d3ee", "#22d3ee", "#22d3ee", "#f59e0b", "#f59e0b", "#a855f7", "#a855f7", "#00e09e"][i]
        if nama == "Line":
            b += f'<line x1="{cx - 22}" y1="{cy + 16}" x2="{cx + 22}" y2="{cy - 16}" stroke="{c}" stroke-width="2.2"/>'
        elif nama == "Wire":
            b += f'<polyline points="{cx - 24},{cy + 14} {cx - 8},{cy - 16} {cx + 8},{cy + 8} {cx + 24},{cy - 12}" fill="none" stroke="{c}" stroke-width="2.2"/>'
        elif nama == "Rectangle":
            b += f'<rect x="{cx - 24}" y="{cy - 14}" width="48" height="28" fill="rgba(34,211,238,.15)" stroke="{c}" stroke-width="2"/>'
        elif nama == "Circle":
            b += f'<circle cx="{cx}" cy="{cy}" r="20" fill="rgba(245,158,11,.12)" stroke="{c}" stroke-width="2"/>'
        elif nama == "Arc":
            b += f'<path d="M {cx + 20} {cy} A 20 20 0 0 0 {cx - 14:.1f} {cy - 14.1:.1f}" fill="none" stroke="{c}" stroke-width="2.2"/><circle cx="{cx}" cy="{cy}" r="2" fill="{c}"/>'
        elif nama == "Polygon":
            pts = " ".join(f"{cx + 21 * math.cos(math.pi / 2 + kk * math.pi / 3):.1f},{cy - 21 * math.sin(math.pi / 2 + kk * math.pi / 3):.1f}" for kk in range(6))
            b += f'<polygon points="{pts}" fill="rgba(168,85,247,.14)" stroke="{c}" stroke-width="2"/>'
        elif nama == "Ellipse":
            b += f'<ellipse cx="{cx}" cy="{cy}" rx="24" ry="14" fill="rgba(168,85,247,.14)" stroke="{c}" stroke-width="2"/>'
        else:
            b += f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{c}"/><line x1="{cx - 10}" y1="{cy}" x2="{cx + 10}" y2="{cy}" stroke="{c}" stroke-width="1"/><line x1="{cx}" y1="{cy - 10}" x2="{cx}" y2="{cy + 10}" stroke="{c}" stroke-width="1"/>'
        b += t(cx, 108, nama, 11, TX, "middle", "600")
        b += t(cx, 126, masuk, 8.5, AX)
    b += t(340, 168, "Semua bentuk dasar Draft lahir dari titik-titik yang diketik atau di-snap pada bidang kerja aktif", 11.5, AX)
    return svg(680, 180, b, "Gambar 1 — Bentuk dasar Draft Workbench dan masukan yang dimintanya")


def gambar2():
    b = ""
    for k, (judul, mode, c) in enumerate([("inscribed (bawaan)", "in", "#22d3ee"), ("circumscribed", "circ", "#a855f7")]):
        cx, cy, R = 170 + k * 340, 128, 72
        b += t(cx, 28, f"DrawMode {judul}", 12, TX, "middle", "600")
        b += f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="5 4"/>'
        rad = R if mode == "in" else R / math.cos(math.pi / N_H)
        rot = math.pi / 2 if mode == "in" else math.pi / 2 + math.pi / N_H
        pts = " ".join(f"{cx + rad * math.cos(rot + kk * 2 * math.pi / N_H):.1f},{cy - rad * math.sin(rot + kk * 2 * math.pi / N_H):.1f}" for kk in range(N_H))
        b += f'<polygon points="{pts}" fill="{c}" fill-opacity=".14" stroke="{c}" stroke-width="2"/>'
        b += f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy - R}" stroke="#f59e0b" stroke-width="1.2"/>'
        b += t(cx + 8, cy - R / 2, f"R = {R_H}", 10.5, "#f59e0b", "start")
        b += t(cx, cy + R + 26, "titik sudut pada lingkaran" if mode == "in" else "sisi menyinggung lingkaran", 10.5, AX)
        b += t(cx, cy + R + 44, f"A = {ind(A_IN, 2)} mm²" if mode == "in" else f"A = {ind(A_CIRC, 2)} mm²", 11, c, "middle", "600")
    b += t(340, 266, f"Untuk n = {N_H} dan R = {R_H}: luas circumscribed / inscribed = 1/cos²(30°) = {ind(A_CIRC / A_IN, 4)}", 11, AX)
    return svg(680, 278, b, "Gambar 2 — Dua DrawMode Draft Polygon pada lingkaran radius yang sama")


def gambar3():
    b = ""
    s = 1.6
    ox, oy = 70, 210
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    a, bb = 100, 40
    # Garis grid diputus di belakang dua label Base (seperti garis bantu yang diputus di belakang teks):
    # kotak bebas (x0, y0, x1, y1) mengelilingi label (lebar ±55 px dan ±66 px) dengan kelonggaran ±6 px
    # agar tetap bebas bila fon web Inter (sedikit lebih lebar dari fon sistem) yang dipakai.
    l1 = (X(a) - 6, Y(9) + 4)                                  # Base (0, 0, 0): rata kanan
    l2 = (X(DX_C + a / 2), Y(DY_C + bb / 2) + 4)               # Base (DX, DY, 0): rata tengah
    bebas = [(l1[0] - 62, l1[1] - 11, l1[0] + 3, l1[1] + 4), (l2[0] - 39, l2[1] - 11, l2[0] + 39, l2[1] + 5)]

    def ruas(a0, a1, lubang):                                  # selang [a0, a1] dikurangi selang-selang lubang
        out, p = [], a0
        for c0, c1 in sorted(lubang):
            if c1 > p and c0 < a1:
                if c0 > p:
                    out.append((p, c0))
                p = max(p, c1)
        return out + ([(p, a1)] if p < a1 else [])
    for gx in range(0, 261, 20):
        for y0, y1 in ruas(Y(110), Y(0), [(k[1], k[3]) for k in bebas if k[0] <= X(gx) <= k[2]]):
            b += f'<line x1="{X(gx)}" y1="{y0:g}" x2="{X(gx)}" y2="{y1:g}" stroke="{GRID}" stroke-width="0.6"/>'
    for gy in range(0, 111, 20):
        for x0, x1 in ruas(X(0), X(260), [(k[0], k[2]) for k in bebas if k[1] <= Y(gy) <= k[3]]):
            b += f'<line x1="{x0:g}" y1="{Y(gy)}" x2="{x1:g}" y2="{Y(gy)}" stroke="{GRID}" stroke-width="0.6"/>'
    b += arrow(X(0), Y(0), X(268), Y(0), "#ef4444", 1.6)
    b += arrow(X(0), Y(0), X(0), Y(118), "#22c55e", 1.6)
    b += t(X(270), Y(0) + 4, "X", 11, "#ef4444", "start", "700")
    b += t(X(0) - 6, Y(120), "Y", 11, "#22c55e", "end", "700")
    b += f'<rect x="{X(0)}" y="{Y(bb)}" width="{a * s}" height="{bb * s}" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<rect x="{X(DX_C)}" y="{Y(bb + DY_C)}" width="{a * s}" height="{bb * s}" fill="rgba(0,224,158,.10)" stroke="#00e09e" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += arrow(X(0), Y(0), X(DX_C), Y(DY_C), "#00e09e", 1.8)
    b += t(X(0) + 16, 26, f"Placement.Base bergeser v = ({DX_C}, {DY_C}) → |v| = √({DX_C}² + {DY_C}²) = {ind(PINDAH_C, 3)} mm", 11, "#00e09e", "start", "600")
    b += t(*l1, "Base (0, 0, 0)", 10, TX, "end")
    b += t(*l2, f"Base ({DX_C}, {DY_C}, 0)", 10, "#00e09e")
    b += teks2(340, 238, "Koordinat global diukur dari titik asal dokumen; koordinat relatif (Relative) diukur dari titik yang terakhir diklik", 11, AX, maks=70)
    return svg(680, 264, b, "Gambar 3 — Placement.Base dan vektor pindah Draft Move")


def gambar4():
    b = ""
    modes = [("Length", "panjang satu edge", "#22d3ee"), ("Distance", "jarak dua elemen (vertex, edge, face)", "#00e09e"),
             ("Angle", "sudut dua edge/face", "#a855f7"), ("Area", "luas face", "#f59e0b"), ("Radius", "radius lingkaran/busur", "#ec4899")]
    for i, (nama, ket, c) in enumerate(modes):
        y = 30 + i * 40
        b += f'<rect x="24" y="{y}" width="150" height="30" rx="7" fill="rgba(255,255,255,.03)" stroke="{c}" stroke-width="1.4"/>'
        b += t(99, y + 19, nama, 11.5, c, "middle", "600")
        b += t(190, y + 19, ket, 10.5, TX, "start")
    b += f'<rect x="420" y="30" width="236" height="190" rx="8" fill="#0a1224" stroke="#243653"/>'
    b += t(538, 50, "Python console", 11, TX, "middle", "600")
    baris = ["obj.Shape.Length", "obj.Shape.Area", "obj.Shape.CenterOfMass", "obj.Shape.BoundBox.YMax", "v.distToShape(edge)[0]", "u.getAngle(v)  # radian"]
    for i, s_ in enumerate(baris):
        b += t(432, 74 + i * 24, ">>> " + s_, 9.6, "#00e09e" if i < 4 else "#f59e0b", "start")
    b += teks2(340, 246, "Std Measure untuk pemeriksaan cepat di layar; Python console untuk angka berpresisi penuh dan besaran yang tidak ada di GUI", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 4 — Mode Std Measure dan padanannya di Python console")


def gambar6():
    b = ""
    s = 1.05
    for k, (judul, c) in enumerate([("Move", "#00e09e"), ("Rotate", "#f59e0b"), ("Scale", "#a855f7")]):
        ox = 40 + k * 220
        oy = 190
        X = lambda x, ox=ox: ox + x * s
        Y = lambda y: oy - y * s
        b += t(ox + 80, 26, judul, 12, c, "middle", "700")
        b += f'<rect x="{X(0)}" y="{Y(30)}" width="{80 * s}" height="{30 * s}" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="1.8"/>'
        if judul == "Move":
            b += f'<rect x="{X(60)}" y="{Y(30 + 60)}" width="{80 * s}" height="{30 * s}" fill="none" stroke="{c}" stroke-width="1.6" stroke-dasharray="5 3"/>'
            b += arrow(X(0), Y(0), X(60), Y(60), c, 1.6)
            b += t(X(0), Y(0) + 22, "titik acuan → tujuan", 9.5, c, "start")
        elif judul == "Rotate":
            th = math.radians(35)
            pts = [(0, 0), (80, 0), (80, 30), (0, 30)]
            rp = " ".join(f"{X(x * math.cos(th) - y * math.sin(th)):.1f},{Y(x * math.sin(th) + y * math.cos(th)):.1f}" for x, y in pts)
            b += f'<polygon points="{rp}" fill="none" stroke="{c}" stroke-width="1.6" stroke-dasharray="5 3"/>'
            b += f'<path d="M {X(40)} {Y(0)} A 40 40 0 0 0 {X(40 * math.cos(th)):.1f} {Y(40 * math.sin(th)):.1f}" fill="none" stroke="{c}" stroke-width="1.2"/>'
            b += t(X(46), Y(14), "θ", 11, c, "start", "700")
            b += t(X(0) - 4, Y(0) + 12, "pusat", 9.5, c, "start")
        else:
            b += f'<rect x="{X(0)}" y="{Y(30 * 1.6)}" width="{80 * 1.6 * s}" height="{30 * 1.6 * s}" fill="none" stroke="{c}" stroke-width="1.6" stroke-dasharray="5 3"/>'
            b += t(X(6), Y(56), "k = 1,6 → luas × 2,56", 9.5, c, "start")
            b += t(X(0) - 4, Y(0) + 12, "pusat", 9.5, c, "start")
        b += f'<circle cx="{X(0)}" cy="{Y(0)}" r="3" fill="#e2e8f0"/>'
    b += t(340, 238, "Ketiganya meminta titik acuan/pusat lebih dulu; opsi Copy menyalin alih-alih memindahkan objek asal", 11, AX)
    return svg(680, 250, b, "Gambar 6 — Tiga transformasi Draft: Move, Rotate, dan Scale")


def gambar5():
    b = ""
    s = 1.9
    ox, oy = 60, 214
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    A, B, C = (0, 0), (A_T, 0), (C_T, H_T)
    b += f'<polygon points="{X(0)},{Y(0)} {X(A_T)},{Y(0)} {X(C_T)},{Y(H_T)}" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    for p, q in [((0, 0), ((A_T + C_T) / 2, H_T / 2)), ((A_T, 0), (C_T / 2, H_T / 2)), ((C_T, H_T), (A_T / 2, 0))]:
        b += f'<line x1="{X(p[0])}" y1="{Y(p[1])}" x2="{X(q[0])}" y2="{Y(q[1])}" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="3 3"/>'
    b += f'<circle cx="{X(G_T[0])}" cy="{Y(G_T[1])}" r="5" fill="#00e09e" stroke="#fff" stroke-width="1.2"/>'
    b += f'<line x1="{X(C_T)}" y1="{Y(H_T)}" x2="{X(G_T[0])}" y2="{Y(G_T[1])}" stroke="#00e09e" stroke-width="1.6"/>'
    b += f'<line x1="{X(G_T[0])}" y1="{Y(G_T[1])}" x2="{X(96)}" y2="{Y(44)}" stroke="#00e09e" stroke-width=".8" stroke-dasharray="3 2"/>'
    b += t(X(98), Y(44) + 4, f"G ({ind(G_T[0], 3)}, {ind(G_T[1], 3)})", 10.5, "#00e09e", "start")
    bx, by = C_T - A_T, H_T
    tt = ((0 - A_T) * bx) / (bx * bx + by * by)
    F = (A_T + tt * bx, tt * by)
    b += f'<line x1="{X(0)}" y1="{Y(0)}" x2="{X(F[0])}" y2="{Y(F[1])}" stroke="#f59e0b" stroke-width="1.6"/>'
    b += t(X(29) + 18, Y(30) - 5, "d", 11, "#f59e0b", "middle", "700")        # kanan garis d, di atas median dari B
    rr = 26
    thB = math.atan2(H_T, A_T - C_T)
    b += f'<path d="M {X(A_T) - rr} {Y(0)} A {rr} {rr} 0 0 0 {X(A_T) - rr * math.cos(thB):.1f} {Y(0) - rr * math.sin(thB):.1f}" fill="none" stroke="#a855f7" stroke-width="1.2"/>'
    b += t(X(A_T) - rr - 28, Y(0) - 6, "∠B", 10.5, "#a855f7", "end", "700")   # di dalam sudut B, di antara AB dan median dari B
    b += t(X(0) - 10, Y(0) + 12, "A (0, 0)", 10, TX, "start")
    b += t(X(A_T) + 4, Y(0) + 12, f"B ({A_T}, 0)", 10, TX, "start")
    b += t(X(C_T), Y(H_T) - 8, f"C ({C_T}, {H_T})", 10, TX)
    b += t(440, 40, "Titik berat G = rata-rata tiga", 10.5, TX, "start")
    b += t(440, 56, "titik sudut; ketiga median", 10.5, TX, "start")
    b += t(440, 72, "berpotongan di G.", 10.5, TX, "start")
    b += t(440, 90, f"CG = {ind(CG_T, 3)} mm", 10.5, "#00e09e", "start", "600")
    b += t(440, 116, "Jarak A ke garis BC = |a·h| / |BC|", 10.5, TX, "start")
    b += t(440, 132, "(kaki tegak lurus d; Measure Distance).", 10.5, TX, "start")
    b += t(440, 150, f"d(A, BC) = {ind(DABC_T, 3)} mm", 10.5, "#f59e0b", "start", "600")
    b += t(440, 176, "Sudut B = arctan(h / (a − c))", 10.5, TX, "start")
    b += t(440, 194, f"∠B = {ind(SUDUT_B, 3)}°", 10.5, "#a855f7", "start", "600")
    return svg(680, 240, b, "Gambar 5 — Titik berat, jarak titik–garis, dan sudut pada segitiga")


def _putus(pts, pola=(8, 3, 2, 3)):
    """Garis putus/rantai sebagai potongan-potongan path nyata di sepanjang polyline pts.

    MuPDF (generator Modul-Word) mengabaikan stroke-dasharray sehingga garis putus-putus
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
    """Gambar kerja praktik terbimbing (bagian 09): panel heksagon dengan tiga transformasi, pandangan atas Top (XY).

    Ukuran memakai konstanta yang sama dengan teks langkah 1–5 (W_PNL, H_PNL, N_H, R_H, PX_H, PY_H,
    DX_C, DY_C, ROT_H, ROT2_H, K_H), jadi gambar dan langkah tidak dapat berbeda angka. Orientasi
    heksagon mengikuti Draft Polygon FreeCAD: titik sudut pertama searah sumbu +X dari pusatnya.
    """
    s, ox, oy = 1.3, 208, 308                   # skala px/mm; titik asal (0, 0) = sudut kiri-bawah panel
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s

    def heks(cxw, cyw, R, rot):                  # titik sudut heksagon (px); rot = sudut titik sudut pertama (°)
        return [(X(cxw + R * math.cos(math.radians(rot + 360 * k / N_H))), Y(cyw + R * math.sin(math.radians(rot + 360 * k / N_H)))) for k in range(N_H)]

    def poli(pts, warna, isi, w=2):
        return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{warna}" fill-opacity="{isi}" stroke="{warna}" stroke-width="{w}"/>'
    mx, my = PX_H + DX_C, PY_H + DY_C            # pusat salinan Move
    c2, s2 = math.cos(math.radians(ROT2_H)), math.sin(math.radians(ROT2_H))
    gx, gy = mx * c2 - my * s2, mx * s2 + my * c2  # pusat salinan Move setelah Rotate ROT2_H° terhadap (0, 0)
    h0, h1 = heks(PX_H, PY_H, R_H, 0), heks(mx, my, R_H, 0)
    h2, h3, h4 = heks(PX_H, PY_H, R_H, ROT_H), heks(PX_H, PY_H, K_H * R_H, 0), heks(gx, gy, R_H, ROT2_H)
    b = f'<rect x="{X(0):.1f}" y="{Y(H_PNL):.1f}" width="{W_PNL * s:.1f}" height="{H_PNL * s:.1f}" fill="{AX}" fill-opacity=".04" stroke="{AX}" stroke-width="1.4"/>'
    b += poli(h3, VI, ".08", 1.8) + poli(h0, CY, ".16") + poli(h2, PK, ".08", 1.8) + poli(h1, GR, ".14")
    b += f'<path d="{_putus(h4 + h4[:1], (7, 4))}" fill="none" stroke="{GR}" stroke-width="1.8"/>'
    # Rotate ROT2_H° salinan Move terhadap sudut panel (0, 0): busur lintasan pusatnya (langkah 4)
    rr, a0 = math.hypot(mx, my), math.degrees(math.atan2(my, mx))
    busur = [(X(rr * math.cos(math.radians(a0 + ROT2_H * k / 60))), Y(rr * math.sin(math.radians(a0 + ROT2_H * k / 60)))) for k in range(61)]
    b += f'<path d="{_putus(busur[:-3], (7, 4))}" fill="none" stroke="{GR}" stroke-width="1.2"/>' + _panah(*busur[-4], *busur[-1], GR, 1.2)
    b += t(X(gx), Y(gy - R_H) + 18, f"hasil Rotate {ROT2_H}°", 10.5, GR, "middle", "600") + t(X(gx), Y(gy - R_H) + 33, "pusat (0, 0)", 10.5, GR, "middle")
    # vektor Move (langkah 3) dan titik pusat
    b += _panah(X(PX_H), Y(PY_H), X(mx) - 3, Y(my) + 2, GR, 1.2)
    b += f'<circle cx="{X(PX_H):.1f}" cy="{Y(PY_H):.1f}" r="2.5" fill="{TX}"/><circle cx="{X(mx):.1f}" cy="{Y(my):.1f}" r="2.5" fill="{TX}"/>'
    b += t(X(mx + R_H) + 8, Y(my) + 4, "Move (Copy)", 10.5, GR, "start", "600")
    # ukuran panel (langkah 1)
    b += ext(X(0), Y(0) + 4, X(0), Y(0) + 32) + ext(X(W_PNL), Y(0) + 4, X(W_PNL), Y(0) + 32)
    b += dim_h(X(0), X(W_PNL), Y(0) + 26, f"{W_PNL}")
    b += ext(X(W_PNL) + 4, Y(H_PNL), X(W_PNL) + 30, Y(H_PNL)) + ext(X(W_PNL) + 4, Y(0), X(W_PNL) + 30, Y(0))
    b += dim_v(X(W_PNL) + 24, Y(H_PNL), Y(0), f"{H_PNL}", kiri=False)
    # pusat induk dari titik asal lalu vektor Move, berantai (langkah 2–3)
    b += ext(X(0), Y(H_PNL) - 4, X(0), Y(H_PNL) - 28) + ext(X(PX_H), Y(PY_H) - 6, X(PX_H), Y(H_PNL) - 28) + ext(X(mx), Y(my) - 6, X(mx), Y(H_PNL) - 28)
    b += dim_h(X(0), X(PX_H), Y(H_PNL) - 22, f"{PX_H}") + dim_h(X(PX_H), X(mx), Y(H_PNL) - 22, f"{DX_C}")
    b += ext(X(0) - 4, Y(0), X(0) - 28, Y(0)) + ext(X(PX_H) - 6, Y(PY_H), X(0) - 28, Y(PY_H)) + ext(X(mx) - 6, Y(my), X(0) - 28, Y(my))
    b += dim_v(X(0) - 22, Y(PY_H), Y(0), f"{PY_H}") + dim_v(X(0) - 22, Y(my), Y(PY_H), f"{DY_C}")
    # radius induk: pusat → titik sudut 240° (inscribed: titik sudut pada lingkaran R_H)
    vx, vy = h0[4]
    b += _panah(X(PX_H), Y(PY_H), vx, vy, AM, 1)
    b += t(X(PX_H) + 9, (Y(PY_H) + vy) / 2 - 0.5, f"R{R_H}", 11, AM, "middle", "600")
    # sudut Rotate (Copy): titik sudut kedua induk (av) → titik sudut padanannya pada salinan (av + ROT_H)
    ra, av = 70 * s, 360 / N_H
    for a_ in (av, av + ROT_H):
        p0 = (X(PX_H + (R_H + 2) * math.cos(math.radians(a_))), Y(PY_H + (R_H + 2) * math.sin(math.radians(a_))))
        p1 = (X(PX_H) + (ra + 6) * math.cos(math.radians(a_)), Y(PY_H) - (ra + 6) * math.sin(math.radians(a_)))
        b += ext(*p0, *p1)
    P = lambda r_, a_: (X(PX_H) + r_ * math.cos(math.radians(a_)), Y(PY_H) - r_ * math.sin(math.radians(a_)))
    (x0, y0), (x1, y1) = P(ra, av), P(ra, av + ROT_H)
    b += f'<path d="M {x0:.1f} {y0:.1f} A {ra:.1f} {ra:.1f} 0 0 0 {x1:.1f} {y1:.1f}" fill="none" stroke="{AM}" stroke-width="1"/>'
    d7 = math.degrees(7 / ra)
    for a_ujung, a_dasar in ((av, av + d7), (av + ROT_H, av + ROT_H - d7)):
        (tx, ty), (bx, by) = P(ra, a_ujung), P(ra, a_dasar)
        ux, uy = 3 * math.cos(math.radians(a_dasar)), -3 * math.sin(math.radians(a_dasar))
        b += f'<polygon points="{tx:.1f},{ty:.1f} {bx + ux:.1f},{by + uy:.1f} {bx - ux:.1f},{by - uy:.1f}" fill="{AM}"/>'
    lx, ly = P(ra + 13, av + ROT_H / 2)
    b += t(lx, ly + 4, f"{ROT_H}°", 11, AM, "middle", "600")
    # nama objek dengan garis penunjuk ke bagian yang hanya dimiliki objek itu
    kx = X(mx) - 16
    for (px_, py_), baris, warna, yy in ((h3[0], [f"Scale (Copy), k = {K_H}"], VI, Y(PY_H) + 10), (h2[5], ["Rotate (Copy)"], PK, Y(PY_H) + 28),
                                         (h0[5], ["Polygon induk,", f"{N_H} sisi, inscribed"], CY, Y(PY_H) + 46)):
        b += f'<line x1="{kx - 3:.1f}" y1="{yy - 4:.1f}" x2="{px_:.1f}" y2="{py_:.1f}" stroke="{warna}" stroke-width="1"/><circle cx="{px_:.1f}" cy="{py_:.1f}" r="2.2" fill="{warna}"/>'
        b += "".join(t(kx, yy + 15 * i, teks, 10.5, warna, "start", "600") for i, teks in enumerate(baris))
    # titik asal dan arah sumbu
    b += _panah(X(0), Y(0), X(0) + 36, Y(0), RD, 1.6) + _panah(X(0), Y(0), X(0), Y(0) - 36, GN, 1.6)
    b += t(X(0) + 40, Y(0) + 15, "X", 11, RD, "start", "700") + t(X(0) - 7, Y(0) - 32, "Y", 11, GN, "end", "700")
    b += f'<circle cx="{X(0):.1f}" cy="{Y(0):.1f}" r="3" fill="{TX}"/>' + t(X(0) - 8, Y(0) + 17, "(0, 0)", 10.5, TX, "end", "600")
    b += t(664, 22, "Satuan: mm", 10.5, AX, "end")
    return svg(680, 352, b, "Gambar 7 — Gambar kerja panel heksagon dengan tiga transformasi")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-bentuk">Bentuk Dasar</a>
  <a href="#m-poligon">Poligon</a>
  <a href="#m-posisi">Posisi</a>
  <a href="#m-ukur">Pengukuran</a>
  <a href="#m-move">Move</a>
  <a href="#m-rotate">Rotate</a>
  <a href="#m-scale">Scale</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,179,0,.4)" stroke-width="1" stroke-dasharray="3 2"/>
      <rect x="18" y="110" width="44" height="22" fill="none" stroke="rgba(0,229,255,.45)" stroke-width="1.3"/>
      <rect x="38" y="140" width="44" height="22" fill="none" stroke="rgba(0,224,158,.5)" stroke-width="1.2" stroke-dasharray="3 2"/>
      <line x1="18" y1="132" x2="38" y2="162" stroke="rgba(0,224,158,.6)" stroke-width="1.2"/>
      <line x1="14" y1="200" x2="86" y2="200" stroke="rgba(124,77,255,.55)" stroke-width="1"/>
      <text x="50" y="196" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">|v|</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,80 86,80 44,30" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <circle cx="48" cy="63" r="3" fill="rgba(0,224,158,.7)"/>
      <line x1="44" y1="30" x2="48" y2="63" stroke="rgba(0,224,158,.6)" stroke-width="1"/>
      <line x1="20" y1="150" x2="80" y2="150" stroke="rgba(0,229,255,.5)" stroke-width="1.6"/>
      <line x1="20" y1="150" x2="70" y2="112" stroke="rgba(255,179,0,.6)" stroke-width="1.6"/>
      <path d="M 44 150 A 24 24 0 0 0 39 136" fill="none" stroke="rgba(124,77,255,.6)" stroke-width="1"/>
      <text x="50" y="146" fill="rgba(124,77,255,.65)" font-family="JetBrains Mono" font-size="8">θ</text>
      <text x="50" y="205" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">2L·sin(θ/2)</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="03">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Draft → Move</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">|v| = √(dx² + dy²)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">Rotate θ</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">A' = k²·A</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">CenterOfMass</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Std Measure</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">inscribed · circumscribed</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">BoundBox.YMax</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 3 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Bentuk Dasar,</span><br>
      <em>Pengukuran, &amp;</em><br>
      <span class="hl-amber">Transformasi</span>
    </h1>
    <p class="hero-sub">Pertemuan ini menuntaskan kosakata 2D: bentuk dasar Draft dan masukan yang dimintanya, dua DrawMode poligon, koordinat global dan relatif serta Placement, pengukuran dengan Std Measure dan Python console, lalu tiga transformasi Move, Rotate, dan Scale beserta rumus untuk memeriksa hasilnya. Tugasnya lima model 2D FreeCAD yang menguji posisi, ukuran, dan transformasi dengan angka bacaan.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Bentuk, posisi, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
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

    # 01 — Bentuk dasar
    isi = figure(1, "Bentuk dasar Draft Workbench dan masukan yang dimintanya", "Setiap alat meminta titik-titik tertentu pada panel Tasks; angka yang diketik selalu lebih presisi daripada klik, dan snap menjembatani keduanya.", gambar1())
    isi += tabel(["Alat", "Masukan", "Properti penting", "Catatan"],
                 [["Line", "Titik awal, titik akhir", "Length, Start, End", "Objek Wire dua titik; Continue untuk merangkai"],
                  ["Wire (Polyline)", "Rangkaian titik; Close menutup", "Length, Closed, MakeFace, Area", "Undo titik terakhir dengan tombol Undo di panel"],
                  ["Rectangle", "Dua sudut berlawanan atau sudut + Length/Height", "Length, Height, Area, MakeFace", "Rows/Columns membuat kisi persegi"],
                  ["Circle", "Pusat, radius (atau diameter)", "Radius, Area, FirstAngle, LastAngle", "Tombol Diameter mengubah masukan"],
                  ["Arc", "Pusat, radius, sudut awal, sudut akhir", "FirstAngle, LastAngle", "Arc by 3 points: tiga titik pada busur"],
                  ["Polygon", "Pusat, jumlah sisi, radius", "FacesNumber, Radius, DrawMode, Area", "DrawMode inscribed (bawaan) atau circumscribed"],
                  ["Ellipse", "Dua sudut kotak pembatas", "MajorRadius, MinorRadius, Area", "Sumbu selalu sejajar bidang kerja"],
                  ["Point", "Satu koordinat", "X, Y, Z", "Titik acuan yang dapat di-snap"],
                  ["B-spline / Bézier", "Titik kendali", "Points, Closed", "Kontur bebas; dibahas pada modul lanjut"]])
    isi += cards([
        ("📏", "Line dan Wire", "Line adalah satu ruas; Wire merangkai banyak ruas dalam satu objek dan bisa ditutup menjadi face. Wire yang tertutup adalah bahan baku Cut, Offset, dan Pad pada modul-modul berikutnya.", "Close → face"),
        ("⭕", "Circle dan Arc", "Circle penuh mempunyai Area; Arc adalah Circle dengan FirstAngle dan LastAngle. Radius bisa diketik setelah pusat diklik, atau diambil dari titik kedua.", "pusat + radius"),
        ("📍", "Point", "Draft Point menaruh titik pada koordinat yang diketik. Ia menjadi jangkar snap untuk pusat rotasi, pusat lingkaran, atau titik berat tanpa garis bantu.", "acuan snap"),
        ("🧩", "Rectangle dan Polygon", "Keduanya menghasilkan face langsung bila Make Face aktif; Rectangle mengenal Rows/Columns, Polygon mengenal DrawMode yang menentukan arti radiusnya.", ""),
    ])
    m += bagian(1, "m-bentuk", "Bentuk Dasar 2D:<br>Garis, Lingkaran, dan Kawan-kawannya", "Semua gambar 2D dirangkai dari beberapa bentuk dasar. Bagian ini merangkum alat Draft pembentuk objek, masukan yang dimintanya, dan properti yang kelak dibaca saat memeriksa hasil.", isi, "BENTUK DASAR 2D")

    # 02 — Poligon dua mode
    isi = figure(2, "Dua DrawMode Draft Polygon pada lingkaran radius yang sama", f"Inscribed (bawaan) menempatkan titik sudut pada lingkaran radius R; circumscribed membuat sisi menyinggung lingkaran itu sehingga poligonnya lebih besar.", gambar2())
    isi += formula(1, "Luas Poligon Beraturan pada Dua DrawMode", r"A_{in} = \tfrac{1}{2}\,nR^{2}\sin\!\left(\tfrac{2\pi}{n}\right), \qquad A_{circ} = nR^{2}\tan\!\left(\tfrac{\pi}{n}\right)",
                   r"\(n\) = jumlah sisi &nbsp;·&nbsp; \(R\) = radius lingkaran acuan. Contoh heksagon \(R = " + str(R_H) + r"\): \(A_{in} = " + ind(A_IN, 2) + r"\), \(A_{circ} = " + ind(A_CIRC, 2) + r"\) mm².",
                   "Pada mode inscribed, R adalah jarak pusat ke titik sudut; pada mode circumscribed, R adalah jarak pusat ke tengah sisi (apotema). Rasio keduanya 1/cos²(π/n) mengecil menuju 1 saat n membesar, karena kedua poligon sama-sama mendekati lingkaran.",
                   [("A_{in}", "Luas poligon inscribed (mm²)"), ("A_{circ}", "Luas poligon circumscribed (mm²)"), ("n", "Jumlah sisi"), ("R", "Radius lingkaran acuan (mm)")])
    isi += anim_panel(1, "cyan", "Draft Polygon: inscribed vs circumscribed", "cvBentuk",
                      [("sl_bt_n", "v_bt_n", "Jumlah sisi n", 3, 12, 1, 6, "6"),
                       ("sl_bt_R", "v_bt_R", "Radius acuan R (mm)", 20, 60, 1, 40, "40"),
                       ("sl_bt_mode", "v_bt_mode", "DrawMode (0 inscribed · 1 circumscribed · 2 keduanya)", 0, 2, 1, 2, "keduanya")],
                      "btnBentuk", "toggleBentuk", "bentukInfo",
                      "<strong>Cara membaca:</strong> lingkaran putus-putus adalah lingkaran acuan radius R. Poligon biru (inscribed) menyentuh lingkaran di titik sudut, poligon ungu (circumscribed) menyentuhnya di tengah sisi. Naikkan n dan perhatikan kedua luas merapat ke πR².")
    isi += kotak("warning-box", "⚠️ <strong>Modul 1 Tugas 3 dan seterusnya memakai mode bawaan (inscribed).</strong> Bila Anda mengubah DrawMode ke circumscribed, luas yang dibaca menjadi lebih besar dan tidak cocok dengan kunci. Periksa properti DrawMode di tab Data sebelum membaca Area.")
    m += bagian(2, "m-poligon", "Poligon Beraturan:<br>Inscribed dan Circumscribed", "Radius pada Draft Polygon punya dua arti tergantung DrawMode. Bagian ini menjelaskan keduanya dengan rumus luas, sekaligus meluruskan mode yang dipakai tugas.", isi, "POLIGON DUA MODE")

    # 03 — Posisi dan koordinat
    isi = figure(3, "Placement.Base dan vektor pindah Draft Move", f"Persegi panjang dipindah-salin sejauh v = ({DX_C}, {DY_C}); Placement.Base salinannya bergeser sebesar v dan jaraknya |v| = {ind(PINDAH_C, 3)} mm.", gambar3())
    isi += formula(2, "Panjang Vektor Pindah dan Jarak Dua Titik", r"|\vec{v}| = \sqrt{\Delta x^{2} + \Delta y^{2}}",
                   r"\(\Delta x, \Delta y\) = selisih koordinat dua titik (atau komponen vektor pindah). Contoh \((" + str(DX_C) + ", " + str(DY_C) + r")\): \(|\vec{v}| = " + ind(PINDAH_C, 3) + r"\) mm.",
                   "Draft Move memindahkan objek sejauh vektor dari titik acuan ke titik tujuan; sudut kiri-bawah persegi panjang asal dan salinannya berjarak persis |v|. Std Measure Distance antara dua vertex yang bersesuaian membaca angka yang sama.",
                   [(r"|\vec{v}|", "Panjang vektor / jarak (mm)"), (r"\Delta x", "Komponen X (mm)"), (r"\Delta y", "Komponen Y (mm)")])
    isi += cards([
        ("🌐", "Global vs relatif", "Panel Tasks Draft punya kotak <em>Relative</em>: bila aktif, koordinat diukur dari titik yang terakhir diklik; bila tidak, dari titik asal dokumen. <em>Global</em> mengabaikan bidang kerja yang diputar.", "Relative · Global"),
        ("📍", "Placement", "Setiap objek Draft menyimpan <em>Placement.Base</em> (posisi asal lokal) dan <em>Placement.Rotation</em> (sumbu dan sudut). Move mengubah Base; Rotate mengubah Rotation, dan juga Base bila pusatnya bukan asal lokal.", "Base + Rotation"),
        ("🎯", "Titik acuan", "Alat transformasi selalu bertanya “dari titik mana?”. Pilih titik yang mudah di-snap (sudut, pusat, Draft Point) supaya vektor pindah dan pusat rotasi pasti.", ""),
        ("🧮", "Titik berat sebagai posisi", "Titik berat segitiga adalah rata-rata tiga titik sudut. Untuk menempatkan objek tepat di titik berat, ketik koordinat hasil hitung atau taruh Draft Point di sana lalu snap.", "((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3)"),
    ])
    m += bagian(3, "m-posisi", "Penentuan Posisi:<br>Koordinat, Placement, dan Titik Acuan", "Posisi objek di FreeCAD adalah angka, bukan kesan mata. Bagian ini membahas koordinat global dan relatif, properti Placement, cara memilih titik acuan, dan rumus jarak yang dipakai untuk memeriksanya.", isi, "PENENTUAN POSISI")

    # 04 — Pengukuran
    isi = figure(4, "Mode Std Measure dan padanannya di Python console", "Std Measure (FreeCAD 1.0) menampilkan hasil ukur di jendela 3D; Python console memberi angka berpresisi penuh dan besaran seperti titik berat dan kotak pembatas.", gambar4())
    isi += figure(5, "Titik berat, jarak titik–garis, dan sudut pada segitiga", f"Segitiga A(0,0), B({A_T},0), C({C_T},{H_T}): titik berat G, jarak CG, jarak A ke garis BC, dan sudut di B; ketiganya terukur dengan Std Measure atau Python.", gambar5())
    isi += formula(3, "Titik Berat Segitiga dan Jarak Titik ke Garis", r"G = \left(\tfrac{x_A + x_B + x_C}{3},\ \tfrac{y_A + y_B + y_C}{3}\right), \qquad d(A, BC) = \frac{|a\,h|}{\sqrt{(c - a)^{2} + h^{2}}}",
                   r"Untuk \(A(0,0)\), \(B(a,0)\), \(C(c,h)\). Contoh \(a = " + str(A_T) + r", c = " + str(C_T) + r", h = " + str(H_T) + r"\): \(G = (" + ind(G_T[0], 3) + ", " + ind(G_T[1], 3) + r")\), \(CG = " + ind(CG_T, 3) + r"\), \(d(A, BC) = " + ind(DABC_T, 3) + r"\) mm.",
                   "Shape.CenterOfMass face segitiga mengembalikan G; Std Measure Distance dari vertex ke edge mengembalikan jarak tegak lurus. Kedua rumus ini memeriksa apakah lingkaran pada Tugas 4 benar-benar berpusat di titik berat.",
                   [("G", "Titik berat (mm, mm)"), ("d(A, BC)", "Jarak tegak lurus A ke garis BC (mm)"), ("a", "Panjang alas AB (mm)"), ("c, h", "Koordinat titik C (mm)")])
    isi += tabel(["Besaran", "Std Measure", "Python console", "Catatan"],
                 [["Panjang edge / keliling", "Length", "<code>obj.Shape.Length</code>", "Wire tertutup → keliling"],
                  ["Jarak dua elemen", "Distance (vertex–vertex, vertex–edge)", "<code>Part.Vertex(p).distToShape(edge)[0]</code>", "Jarak terpendek (tegak lurus bila mungkin)"],
                  ["Sudut", "Angle (dua edge)", "<code>u.getAngle(v)</code> → radian", "Kalikan 180/π"],
                  ["Luas", "Area (face)", "<code>obj.Shape.Area</code>", "Butuh Make Face"],
                  ["Radius", "Radius (lingkaran/busur)", "<code>obj.Radius</code>", ""],
                  ["Titik berat", "—", "<code>obj.Shape.CenterOfMass</code>", "Vector (x, y, z)"],
                  ["Kotak pembatas", "—", "<code>obj.Shape.BoundBox</code> (XMin, XMax, YMin, YMax)", "Berubah setelah Rotate"]])
    isi += anim_panel(2, "green", "Pengukuran segitiga: titik berat, jarak titik–garis, dan sudut", "cvUkur",
                      [("sl_uk_a", "v_uk_a", "Alas a (mm)", 80, 160, 1, 120, "120"),
                       ("sl_uk_c", "v_uk_c", "Koordinat x titik C (mm)", 0, 100, 1, 40, "40"),
                       ("sl_uk_h", "v_uk_h", "Tinggi h (mm)", 40, 110, 1, 70, "70")],
                      "btnUkur", "toggleUkur", "ukurInfo",
                      "<strong>Cara membaca:</strong> animasi bergantian menyorot tiga pengukuran: jarak C ke titik berat G, jarak tegak lurus A ke garis BC, dan sudut di B. Geser c ke kanan dan lihat G bergeser sepertiga langkah, sesuai rata-rata tiga titik.")
    m += bagian(4, "m-ukur", "Pengukuran:<br>Std Measure dan Python Console", "Memeriksa hasil gambar berarti mengukurnya. Bagian ini memetakan mode Std Measure dan padanan Python-nya, lalu memakai segitiga sebagai latihan mengukur titik berat, jarak, dan sudut.", isi, "PENGUKURAN")

    # 05 — Move
    isi = figure(6, "Tiga transformasi Draft: Move, Rotate, dan Scale", "Ketiganya meminta titik acuan atau pusat, lalu vektor, sudut, atau faktor; dengan Copy aktif, objek asal tetap dan salinannya yang ditransformasi.", gambar6())
    isi += tabel(["Langkah Draft Move", "Masukan", "Tips"],
                 [["1. Pilih objek (boleh banyak)", "Klik / Ctrl+klik, atau pilih dulu lalu tekan Move", "Pilih di pohon dokumen agar tidak salah objek"],
                  ["2. Titik acuan", "Klik atau ketik koordinat", "Snap Endpoint pada sudut kiri-bawah"],
                  ["3. Titik tujuan", "Klik atau ketik; Relative aktif → vektor (dx, dy)", "Ketik dx ⏎ dy ⏎ 0 ⏎"],
                  ["Opsi Copy (Alt)", "Salinan dibuat, asal tetap", "Pola tidak beraturan; pola beraturan pakai Array"],
                  ["Opsi Subelement", "Memindah titik sudut wire saja", "Menyunting bentuk tanpa menggambar ulang"]])
    isi += kotak("info-box", "<strong>Move vs mengubah Placement:</strong> mengetik Placement.Base di tab Data memberi hasil yang sama dengan Move tanpa Copy, dan lebih pasti untuk posisi absolut. Move unggul saat titik acuannya geometris (sudut, pusat) dan saat perlu menyalin. Keduanya tidak mengubah geometri lokal objek: Length dan Area tetap.")
    m += bagian(5, "m-move", "Move:<br>Memindah dan Menyalin dengan Vektor", "Move adalah transformasi paling sering dipakai. Bagian ini mengurai langkahnya, opsi Copy dan Subelement, serta hubungannya dengan properti Placement.", isi, "MOVE")

    # 06 — Rotate
    isi = formula(4, "Rotasi Titik dan Jarak Kedua Ujung", r"x' = x\cos\theta - y\sin\theta,\quad y' = x\sin\theta + y\cos\theta, \qquad d = 2L\sin\!\left(\tfrac{\theta}{2}\right)",
                  r"\((x, y)\) = titik semula terhadap pusat rotasi &nbsp;·&nbsp; \(\theta\) = sudut rotasi (berlawanan jarum jam positif). Untuk garis sepanjang \(L\) dari pusat, jarak kedua ujung bebas setelah diputar \(\theta\) adalah \(d\). Contoh \(L = " + str(L_C) + r"\), \(\theta = " + str(TH_C) + r"^\circ\): \(d = " + ind(CHORD_C, 3) + r"\) mm.",
                  "Draft Rotate menerapkan rumus rotasi pada setiap titik objek terhadap pusat yang dipilih. Ujung bebas garis asal dan salinannya berada pada lingkaran radius L, sehingga jaraknya adalah tali busur dengan sudut pusat θ. Untuk persegi panjang a × b yang diputar di sudutnya, titik tertinggi adalah sudut kanan-atas semula: YMax = a·sin θ + b·cos θ.",
                  [("x', y'", "Koordinat setelah rotasi (mm)"), (r"\theta", "Sudut rotasi (derajat/radian)"), ("d", "Jarak kedua ujung bebas (mm)"), ("L", "Panjang garis dari pusat (mm)")])
    isi += tabel(["Langkah Draft Rotate", "Masukan", "Catatan"],
                 [["1. Pilih objek", "Klik / pohon dokumen", ""],
                  ["2. Pusat rotasi", "Klik atau ketik koordinat", "Draft Point membantu pusat yang tidak ada geometrinya"],
                  ["3. Sudut acuan (awal)", "Ketik 0 atau klik titik", "Sudut diukur dari sumbu X bidang kerja"],
                  ["4. Sudut rotasi (akhir)", "Ketik sudut atau klik titik", "Besar putaran = akhir − awal; positif berlawanan jarum jam"],
                  ["Opsi Copy", "Salinan diputar, asal tetap", "Tugas 2 memakai Copy; Tugas 5 tanpa Copy"]])
    isi += anim_panel(3, "amber", "Rotate: garis diputar di titik asal, jarak kedua ujung bebas", "cvPutar",
                      [("sl_pt_L", "v_pt_L", "Panjang garis L (mm)", 50, 150, 1, 100, "100"),
                       ("sl_pt_th", "v_pt_th", "Sudut rotasi θ (°)", 5, 120, 1, 40, "40°")],
                      "btnPutar", "togglePutar", "putarInfo",
                      "<strong>Cara membaca:</strong> garis kuning diputar bolak-balik sampai θ (PAUSE untuk menahan di θ). Tali busur hijau antara kedua ujung bebas mengikuti d = 2L·sin(θ/2): pada θ = 60° jaraknya sama dengan L, pada θ = 180° dua kali L.")
    m += bagian(6, "m-rotate", "Rotate:<br>Memutar terhadap Pusat", "Rotasi ditentukan pusat, sudut acuan, dan sudut rotasi. Bagian ini memberi rumus rotasi titik, tali busur antar-ujung, dan titik tertinggi persegi panjang yang diputar, lengkap dengan langkah alatnya.", isi, "ROTATE")

    # 07 — Scale
    isi = formula(5, "Pengaruh Skala Seragam pada Panjang dan Luas", r"L' = k\,L, \qquad A' = k^{2}A",
                  r"\(k\) = faktor skala seragam (X = Y). Contoh heksagon inscribed \(R = " + str(R_H) + r"\) diskalakan \(k = " + ind(K_H, 1) + r"\): \(A' = " + ind(K_H ** 2, 2) + r" \times " + ind(A_IN, 2) + " = " + ind(A_SKALA, 2) + r"\) mm².",
                  "Draft Scale mengalikan jarak setiap titik dari pusat skala dengan k; panjang berlipat k, luas berlipat k². Faktor X ≠ Y menghasilkan skala tidak seragam (lingkaran menjadi elips), yang jarang dipakai pada gambar teknik.",
                  [("L', A'", "Panjang dan luas setelah skala"), ("k", "Faktor skala seragam"), ("L, A", "Panjang dan luas semula")])
    isi += tabel(["Langkah Draft Scale", "Masukan", "Catatan"],
                 [["1. Pilih objek", "Klik / pohon dokumen", ""],
                  ["2. Pusat skala", "Klik atau ketik", "Titik yang tidak bergerak"],
                  ["3. Faktor X, Y (Z)", "Panel Tasks; centang Uniform", "Faktor < 1 memperkecil"],
                  ["Opsi Copy", "Salinan diskalakan, asal tetap", "Tugas 3 memakai Copy"],
                  ["Opsi Modify subelements", "Menyekalakan titik-titik wire", "Untuk Draft Wire/Line saja"],
                  ["Opsi Create a clone", "Hasilnya objek Clone berskala", "Mengikuti perubahan objek asal"]])
    isi += anim_panel(4, "violet", "Move, Rotate, Scale pada satu persegi panjang", "cvTransform",
                      [("sl_tf_dx", "v_tf_dx", "Move: dx (mm)", 0, 120, 1, 80, "80"),
                       ("sl_tf_dy", "v_tf_dy", "Move: dy (mm)", 0, 80, 1, 45, "45"),
                       ("sl_tf_th", "v_tf_th", "Rotate: θ (°) di titik asal", 0, 90, 1, 30, "30°"),
                       ("sl_tf_k", "v_tf_k", "Scale: faktor k di titik asal", 0.5, 2.5, 0.05, 1.5, "1,50")],
                      "btnTransform", "toggleTransform", "transformInfo",
                      "<strong>Cara membaca:</strong> persegi panjang biru 100 × 40 mm ditransformasi tiga cara bergantian (PAUSE untuk melihat ketiganya sekaligus). Kotak pembatas hasil rotasi (garis putus kuning) menunjukkan YMax = a·sin θ + b·cos θ, angka yang diminta Tugas 5.")
    m += bagian(7, "m-scale", "Scale:<br>Memperbesar dan Memperkecil", "Skala mengubah ukuran tanpa mengubah bentuk. Bagian ini memberi rumus panjang dan luas berskala, langkah alat Scale, dan animasi yang menggabungkan ketiga transformasi.", isi, "SCALE")

    # 08 — Python console
    isi = kode("Python console — bentuk dasar dan dua DrawMode poligon", f'''import FreeCAD as App, Draft, math
doc = App.newDocument("Latihan3")
V = App.Vector
garis = Draft.make_line(V(0, 0, 0), V({L_C}, 0, 0))
ling  = Draft.make_circle({R_H})                                   # pusat (0,0), radius {R_H}
hexin = Draft.make_polygon({N_H}, radius={R_H}, inscribed=True)     # bawaan: sudut pada lingkaran
hexci = Draft.make_polygon({N_H}, radius={R_H}, inscribed=False)    # sisi menyinggung lingkaran
for o in (hexin, hexci): o.MakeFace = True
doc.recompute()
print(f"Inscribed    = {{hexin.Shape.Area:.2f}} mm^2  (rumus {{{N_H}*{R_H}**2*math.sin(2*math.pi/{N_H})/2:.2f}})")
print(f"Circumscribed= {{hexci.Shape.Area:.2f}} mm^2  (rumus {{{N_H}*{R_H}**2*math.tan(math.pi/{N_H}):.2f}})")''', "Python (FreeCAD)")
    isi += kode("Python console — Move, Rotate, Scale dengan salinan dan pengukurannya", f'''import FreeCAD as App, Draft, math
doc = App.ActiveDocument
V = App.Vector
r = Draft.make_rectangle({A_R}, {B_R}); r.MakeFace = True
doc.recompute()
salin = Draft.move(r, V({DX_C}, {DY_C}, 0), copy=True)                     # Move (Copy)
putar = Draft.rotate(r, {TH_R}, center=V(0, 0, 0), axis=V(0, 0, 1), copy=True)   # Rotate (Copy) {TH_R} derajat
skala = Draft.scale(r, scale=V({K_H}, {K_H}, 1), center=V(0, 0, 0), copy=True)   # Scale (Copy) k = {K_H}
doc.recompute()
print(f"Jarak sudut asal-salinan = {{(salin.Placement.Base - r.Placement.Base).Length:.3f}} mm")   # {ind(PINDAH_C, 3)}
bb = putar.Shape.BoundBox
print(f"Setelah rotasi: XMin = {{bb.XMin:.3f}}, YMax = {{bb.YMax:.3f}} mm")   # {ind(XMIN_R, 3)}, {ind(YMAX_R, 3)}
print(f"Luas berskala = {{skala.Shape.Area:.2f}} mm^2 (k^2 x {A_R * B_R} = {{{K_H}**2*{A_R * B_R}:.2f}})")''', "Python (FreeCAD)")
    isi += kode("Python console — segitiga: titik berat, jarak titik–garis, sudut", f'''import FreeCAD as App, Draft, Part, math
doc = App.ActiveDocument
V = App.Vector
A, B, C = V(0, 0, 0), V({A_T}, 0, 0), V({C_T}, {H_T}, 0)
tri = Draft.make_wire([A, B, C], closed=True, face=True)
doc.recompute()
G = tri.Shape.CenterOfMass                       # sama dengan (A + B + C) / 3
print(f"G = ({{G.x:.3f}}, {{G.y:.3f}}), jarak CG = {{(C - G).Length:.3f}} mm")        # ({ind(G_T[0], 3)}, {ind(G_T[1], 3)}), {ind(CG_T, 3)}
lingkaran = Draft.make_circle(9, placement=App.Placement(G, App.Rotation()))   # lingkaran di titik berat
edgeBC = Part.Edge(Part.LineSegment(B, C))
print(f"Jarak A ke BC = {{Part.Vertex(A).distToShape(edgeBC)[0]:.3f}} mm")             # {ind(DABC_T, 3)}
print(f"Sudut di B = {{math.degrees((A - B).getAngle(C - B)):.3f}} deg")               # {ind(SUDUT_B, 3)}
doc.recompute()''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (heksagon inscribed " + ind(A_IN, 2) + " mm², jarak pindah " + ind(PINDAH_C, 3) + " mm, YMax " + ind(YMAX_R, 3) + " mm, jarak CG " + ind(CG_T, 3) + " mm). Tugas meminta hasil lewat alat GUI (Move, Rotate, Scale, Point) agar berkas Anda memuat objek-objek itu; Python console dipakai untuk memeriksa angkanya.")
    m += bagian(8, "m-python", "Python Console:<br>Memeriksa Posisi dan Transformasi", "Draft.move, Draft.rotate, dan Draft.scale adalah padanan skrip dari tiga alat transformasi. Tiga cell berikut membuat bentuk dasar, mentransformasinya, dan membaca angka yang sama dengan yang diminta tugas.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Siapkan dokumen", f"Ctrl+N, workbench Draft, working plane Top (XY), satuan mm. Gambar Draft Rectangle {W_PNL} × {H_PNL} mm sebagai batas panel (layer Konstruksi bila mau)."),
               ("2", "Heksagon induk", f"Draft Polygon {N_H} sisi, DrawMode inscribed, radius {R_H} mm, pusat ({PX_H}, {PY_H}), Make Face. Baca Area = {ind(A_IN, 2)} mm² di tab Data."),
               ("3", "Salin dengan Move", f"Draft Move (Copy) dari pusat heksagon ke ({PX_H} + {DX_C}, {PY_H} + {DY_C}). Std Measure Distance antara kedua pusat harus {ind(PINDAH_C, 3)} mm."),
               ("4", "Putar salinan", f"Draft Rotate (Copy) heksagon induk {ROT_H}° dengan pusat di pusatnya sendiri: hasilnya heksagon “bergigi” yang tumpang tindih; lalu Rotate lagi salinan pertama {ROT2_H}° dengan pusat sudut panel (0, 0) dan amati Placement.Base-nya berubah."),
               ("5", "Skala", f"Draft Scale (Copy) heksagon induk k = {K_H} dengan pusat di pusatnya. Baca Area = {ind(A_SKALA, 2)} mm² dan pastikan pusatnya tidak bergeser."),
               ("6", "Ukur dan periksa", f"Std Measure Angle antara sisi heksagon asal dan hasil rotasi {ROT_H}°; Python console: BoundBox tiap objek untuk memastikan semuanya di dalam panel {W_PNL} × {H_PNL}."),
               ("7", "Simpan", "V lalu F, Ctrl+S → <code>Latihan3_NIM.FCStd</code>. Buka pohon dokumen: pastikan ada objek Rectangle, Polygon, dan salinan hasil Move/Rotate/Scale.")]
    isi = figure(7, "Benda kerja praktik terbimbing: panel heksagon dengan tiga transformasi", "Pandangan atas pada bidang Top (XY), satuan mm. Sudut kiri-bawah panel berada di titik asal (0, 0). Panel dibuat pada langkah 1, heksagon induk pada langkah 2 (satu titik sudutnya searah sumbu +X, seperti keluaran Draft Polygon), salinan Move pada langkah 3, salinan Rotate pada langkah 4, dan salinan Scale pada langkah 5. Heksagon bergaris putus di luar panel adalah posisi salinan Move setelah diputar terhadap titik asal (0, 0) pada langkah 4.", gambar7())
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
                 [["Objek asal ikut hilang setelah Move/Rotate/Scale", "Copy tidak dicentang", "Ctrl+Z, centang Copy (atau tahan Alt) sebelum mengeklik tujuan"],
                  ["Salinan bergeser bukan sejauh (dx, dy)", "Relative tidak aktif: koordinat dibaca global", "Aktifkan Relative, atau ketik koordinat tujuan global = acuan + vektor"],
                  ["Sudut rotasi terbalik arah", "Sudut acuan tidak 0 atau sudut negatif", "Ketik sudut acuan 0, sudut rotasi positif (berlawanan jarum jam)"],
                  ["Luas hasil skala bukan k² kali", "Faktor X dan Y berbeda (Uniform tidak dicentang)", "Centang Uniform, isi X = Y = k"],
                  ["Luas poligon lebih besar dari rumus", "DrawMode circumscribed", "Ubah DrawMode ke inscribed di tab Data"],
                  ["Pusat lingkaran tidak di titik berat", "Koordinat G dibulatkan", "Ketik G dengan 3 desimal atau snap ke Draft Point di G"],
                  ["BoundBox.YMax tidak sesuai", "Rotasi dilakukan dengan pusat bukan (0,0)", "Ulangi Rotate dengan pusat tepat di titik asal"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) bidang kerja Top (XY), satuan mm; (2) transformasi dilakukan dengan alat Draft (Move/Rotate/Scale), bukan mengetik ulang koordinat, agar objek salinan tampak di pohon dokumen; (3) Copy sesuai permintaan tiap tugas; (4) DrawMode poligon inscribed; (5) angka dibaca dengan 3 desimal untuk jarak dan YMax; (6) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Panel Heksagon dengan Tiga Transformasi", "Tujuh langkah berikut memakai bentuk dasar, pengukuran, dan ketiga transformasi pada satu panel: heksagon induk digandakan dengan Move, diputar, dan diskalakan, lalu diperiksa dengan Std Measure dan BoundBox.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab sketsa 2D (entitas dasar, hubungan geometris) dan transformasi sketsa (move, rotate, scale, copy).")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: alat ukur (Measure) dan penempatan geometri dengan koordinat presisi.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Draft Line/Circle/Polygon/Point, Draft Move/Rotate/Scale, Std Measure", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, opsi Copy/Relative/Uniform, DrawMode Polygon, dan API Draft.move/rotate/scale.")
    refs += pm_ref(4, "green", "0,224,158", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab geometri 2D: konstruksi poligon, titik berat, dan transformasi koordinat.")
    refs += pm_ref(5, "pink", "236,72,153", "F. E. Giesecke dkk.", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Konstruksi geometris dasar (garis, lingkaran, poligon) dan pengukuran pada gambar teknik.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi bentuk dasar 2D, penentuan posisi, pengukuran, dan transformasi. Dokumentasi Draft Workbench adalah pendamping wajib karena opsi alat transformasi mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Draft Polygon (DrawMode), Draft Move/Rotate/Scale (opsi Copy, Subelement, Uniform), Std Measure (mode ukur FreeCAD 1.0), dan Part TopoShape (CenterOfMass, BoundBox, distToShape). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 3 — Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Draft → Move</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Rotate θ</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Scale k</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">CenterOfMass</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">BoundBox</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 3 · Bentuk Dasar 2D, Pengukuran, dan Transformasi</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 3</span><br><em>Mengukur &amp;</em><br>Mentransformasi</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang bentuk dasar, DrawMode poligon, Std Measure, Placement, dan alat Move/Rotate/Scale, ditambah 5 tugas pemodelan 2D: salinan Move, salinan Rotate, salinan Scale heksagon, lingkaran di titik berat segitiga, dan persegi panjang yang diputar (kotak pembatas). Setiap tugas mengunggah berkas .FCStd dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Perbedaan <strong>Draft Line</strong> dan <strong>Draft Wire (Polyline)</strong> adalah...",
     ["Line satu ruas dua titik; Wire rangkaian beberapa ruas dalam satu objek yang dapat ditutup menjadi face", "Line hanya untuk garis mendatar; Wire untuk garis miring", "Line menghasilkan face; Wire tidak", "Tidak ada perbedaan, keduanya nama lain alat yang sama"],
     "Line vs Wire"),
    ("Saat membuat <strong>Draft Circle</strong>, setelah pusat ditentukan, angka yang diketik pada panel Tasks adalah...",
     ["Sudut awal busur", "Jumlah sisi", "Radius (atau diameter bila tombol Diameter aktif)", "Panjang keliling"],
     "Masukan Draft Circle"),
    ("<strong>DrawMode inscribed</strong> (bawaan) pada Draft Polygon berarti...",
     ["Sisi-sisi poligon menyinggung lingkaran radius R dari luar", "Titik-titik sudut poligon terletak tepat pada lingkaran radius R", "Poligon digambar tanpa lingkaran acuan", "Radius diukur dari sudut ke tengah sisi"],
     "Arti DrawMode inscribed"),
    ("Alat FreeCAD 1.0 yang menampilkan jarak, sudut, radius, atau luas elemen langsung di jendela 3D adalah...",
     ["Draft Dimension", "Selection view", "Report view", "Std Measure (ikon penggaris)"],
     "Alat ukur di jendela 3D"),
    ("<strong>Draft Move</strong> dengan opsi Copy aktif akan...",
     ["Memindahkan objek asal dan menghapus salinannya", "Menggandakan objek pada tempat yang sama", "Membuat salinan pada posisi tujuan dan meninggalkan objek asal di tempatnya", "Memindahkan hanya titik sudut objek"],
     "Move dengan Copy"),
    ("Pada <strong>Draft Rotate</strong>, tiga masukan yang diminta berturut-turut adalah...",
     ["Pusat rotasi, sudut acuan (awal), sudut rotasi (akhir)", "Sudut rotasi, pusat rotasi, faktor skala", "Titik awal, titik akhir, jumlah salinan", "Sumbu X, sumbu Y, sumbu Z"],
     "Masukan Draft Rotate"),
    ("<strong>Draft Scale</strong> dengan faktor seragam k mengubah luas objek 2D menjadi...",
     ["k kali luas semula", "Tetap sama", "k/2 kali luas semula", "k² kali luas semula"],
     "Pengaruh skala pada luas"),
    ("Properti <strong>Placement.Base</strong> sebuah objek Draft menyatakan...",
     ["Panjang objek", "Posisi titik asal lokal objek dalam koordinat global", "Warna garis objek", "Jumlah titik sudut"],
     "Arti Placement.Base"),
    ("Untuk menempatkan sebuah titik tepat pada perpotongan dua garis konstruksi, snap yang dipakai adalah...",
     ["Midpoint", "Grid", "Intersection", "Center"],
     "Snap perpotongan"),
    ("<strong>Draft Point</strong> berguna untuk...",
     ["Menandai koordinat acuan (pusat rotasi, titik berat) yang dapat di-snap tanpa garis bantu", "Menghitung luas objek", "Mengubah satuan dokumen", "Mengunci objek dari penyuntingan"],
     "Kegunaan Draft Point"),
]

TUGAS_LABELS = ["Move (Copy) persegi panjang — jarak sudut asal–salinan (mm)", "Rotate (Copy) garis di titik asal — jarak ujung bebas (mm)", "Scale (Copy) heksagon — luas hasil skala (mm²)",
                "Lingkaran di titik berat segitiga — jarak C ke pusat (mm)", "Persegi panjang diputar — YMax kotak pembatas (mm)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 3}

FQ_JUDUL = [
    "Bagaimana membangun pola heksagon tiga ukuran dari satu induk dengan Move, Rotate, dan Scale?",
    "Pengukuran apa yang memastikan jarak pola dan batas panel sebelum berkas dikirim ke router?",
    "Pusat transformasi mana yang benar agar pola tidak melompat keluar panel saat diputar atau diskalakan?",
]
FQ_RINGKAS = [
    "Rancang urutan membuat pola heksagon tiga ukuran (k = 1; 1,5; 2) dan tiga orientasi (0°, 15°, 30°) dari satu heksagon induk memakai Move/Rotate/Scale dengan Copy, dan bandingkan dengan Array. Hitung luas tiap ukuran dengan A' = k²A.",
    "Sebutkan pengukuran yang wajib (jarak antar-pusat, jarak ke tepi panel, sudut rotasi) beserta alatnya (Std Measure, BoundBox, Draft Point) dan jelaskan cara memastikan tidak ada pola yang melewati batas panel 1200 × 600 mm.",
    "Bandingkan rotasi/skala dengan pusat di pusat heksagon dan dengan pusat di sudut panel; jelaskan pengaruhnya pada Placement.Base dan mengapa pusat transformasi harus dipilih sebelum mengeklik.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Panel dekoratif memuat heksagon dalam tiga ukuran (faktor 1; 1,5; 2 dari induk R = 40 mm) dan tiga orientasi (0°, 15°, 30°). Rancang urutan pembuatannya dari satu heksagon induk memakai Draft Move, Rotate, dan Scale dengan Copy (Bagian 05–07), hitung luas tiap ukuran dengan Persamaan (5), dan jelaskan kapan Array lebih tepat daripada salinan manual.",
            ["induk R = 40", "k = 1 · 1,5 · 2", "0° · 15° · 30°"],
            "Heksagon induk berluas A diskalakan seragam dengan faktor 1,5. Luas hasilnya adalah...",
            ["1,5 A", "3 A", "2,25 A", "0,75 A"],
            "✅ Tepat! Skala seragam k mengalikan setiap panjang dengan k, sehingga luas berlipat k² = 2,25. Untuk faktor 2, luasnya 4A: alur router yang dipotong menjadi empat kali lebih luas.",
            "❌ Luas adalah hasil kali dua panjang; bila keduanya berlipat k, luas berlipat k². Lihat Persamaan (5) dan Animasi 4.",
            "Petunjuk: (1) Urutkan Move/Rotate/Scale dengan Copy dari satu induk. (2) Hitung luas tiga ukuran. (3) Bandingkan dengan Array untuk pola beraturan.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Operator router CNC meminta jaminan bahwa pusat pola bertetangga berjarak minimal 90 mm dan tidak ada pola yang melewati tepi panel 1200 × 600 mm. Sebutkan pengukuran yang wajib dilakukan dan alatnya (Bagian 04): Std Measure Distance/Angle, Shape.BoundBox, Draft Point sebagai acuan, dan jelaskan cara memeriksa seluruh pola sekaligus lewat Python console.",
            ["jarak ≥ 90 mm", "panel 1200 × 600", "BoundBox tiap pola"],
            "Alat yang paling tepat untuk memastikan jarak antara pusat dua pola bertetangga tepat 90 mm adalah...",
            ["Std Measure mode Distance antara kedua pusat (atau Python: selisih Placement.Base)", "Menghitung kotak grid di layar", "Draft Dimension radius", "Zoom sampai kedua pola tampak bersentuhan"],
            "✅ Tepat! Distance mengukur jarak dua elemen dengan presisi penuh; padanannya di Python adalah panjang selisih vektor pusat. Grid dan zoom hanya perkiraan visual, Dimension radius mengukur lingkaran, bukan jarak.",
            "❌ Menghitung kotak grid dan zoom hanya perkiraan; Dimension radius mengukur radius, bukan jarak dua titik. Lihat tabel pengukuran pada Bagian 04.",
            "Petunjuk: (1) Daftarkan pengukuran wajib. (2) Pasangkan tiap pengukuran dengan Std Measure atau Python. (3) Jelaskan pemeriksaan batas panel dengan BoundBox.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Seorang pekerja memutar heksagon 30° dengan pusat rotasi di sudut panel (0, 0) alih-alih di pusat heksagon, sehingga pola melompat jauh. Bandingkan kedua pilihan pusat (Bagian 03 dan 06): apa yang terjadi pada Placement.Base, kapan masing-masing benar, dan bagaimana memakai Draft Point atau snap Center agar pusat transformasi pasti sebelum mengeklik.",
            ["pusat = heksagon", "pusat = sudut panel", "Placement.Base"],
            "Agar heksagon berputar 30° di tempatnya tanpa bergeser, pusat rotasi harus berada di...",
            ["Titik asal dokumen (0, 0)", "Sudut kiri-bawah panel", "Titik mana pun, hasilnya sama", "Pusat heksagon itu sendiri"],
            "✅ Tepat! Rotasi memutar setiap titik mengelilingi pusat yang dipilih; hanya pusat heksagon yang tidak bergerak sehingga Placement.Base tetap. Pusat di (0, 0) memutar pusat heksagon pada lingkaran berjari-jari jaraknya ke asal, itulah lompatan yang terlihat.",
            "❌ Pusat rotasi menentukan titik yang diam. Titik asal atau sudut panel membuat seluruh heksagon berpindah pada lingkaran; hanya pusat heksagon yang membuatnya berputar di tempat. Lihat Persamaan (4) dan Animasi 4.",
            "Petunjuk: (1) Bandingkan hasil kedua pusat. (2) Jelaskan perubahan Placement.Base. (3) Usulkan cara memastikan pusat dengan Draft Point atau snap Center.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">panel 1200 × 600</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">k = 1 · 1,5 · 2</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">0° · 15° · 30°</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">jarak ≥ 90 mm</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 3 · Bentuk Dasar 2D, Pengukuran, dan Transformasi</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Panel Dekoratif<br><em>untuk Router CNC</em></h1>
    <p class="hero-sub">Sebuah studio interior memesan panel kayu dengan pola heksagon dalam beberapa ukuran dan orientasi. Terapkan kosakata Pertemuan 3: bentuk dasar, pengukuran, dan transformasi Move/Rotate/Scale, untuk menyusun berkas yang benar bagi operator router.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Studio Ruang Kayu —<br>Pola Heksagon Tiga Ukuran, Tiga Orientasi</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS TRANSFORMASI 2D</div>
    <p>
      <strong style="color:var(--amber)">Studio interior Ruang Kayu</strong> memesan <strong style="color:var(--cyan)">panel dekoratif 1200 × 600 mm</strong> dari multipleks 12 mm yang akan dialur dengan <strong>router CNC</strong> (mata pisau ⌀6 mm). Pola panel adalah <strong>heksagon beraturan</strong> dari satu induk berjari-jari 40 mm dalam <strong style="color:var(--cyan)">tiga ukuran</strong> (faktor 1; 1,5; 2) dan <strong style="color:var(--cyan)">tiga orientasi</strong> (0°, 15°, 30°), tersebar tidak beraturan tetapi dengan jarak antar-pusat minimal 90 mm.
    </p>
    <p style="margin-top:12px">
      Percobaan pertama gagal: beberapa heksagon <strong>melompat keluar panel</strong> karena diputar dengan pusat di sudut panel, dan dua pola yang diskalakan <strong>saling bertabrakan</strong> karena luasnya tidak diperhitungkan. Operator router meminta berkas yang setiap polanya sudah terukur.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur transformasi dan pengukuran</strong>: cara menggandakan induk dengan Move/Rotate/Scale, pengukuran yang wajib sebelum kirim, dan pemilihan pusat transformasi yang benar.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Panel: 1200 × 600 mm, multipleks 12 mm", "14,165,233", "cyan")}
{kartu("Induk: heksagon R = 40 mm", "14,165,233", "cyan")}
{kartu("Ukuran k = 1 · 1,5 · 2; orientasi 0° · 15° · 30°", "14,165,233", "cyan")}
{kartu("Syarat: jarak pusat ≥ 90 mm, di dalam panel", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Pola yang melompat dan pola yang bertabrakan sama-sama lahir dari transformasi yang tidak diukur. Forum ini mengajak Anda memilih pusat transformasi dengan sadar dan memeriksa hasilnya dengan angka sebelum berkas meninggalkan studio.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Satu heksagon induk digandakan dengan Move, Rotate, dan Scale menjadi pola panel; garis hijau adalah jarak antar-pusat yang diukur</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Studio interior Ruang Kayu memesan panel dekoratif 1200 &times; 600 mm (multipleks 12 mm, router CNC &oslash;6 mm) berpola heksagon dari satu induk R = 40 mm dalam tiga ukuran (faktor 1; 1,5; 2) dan tiga orientasi (0&deg;, 15&deg;, 30&deg;), jarak antar-pusat minimal 90 mm. Percobaan pertama gagal: pola melompat keluar panel karena diputar dengan pusat di sudut panel, dan pola berskala saling bertabrakan. Susun prosedur transformasi (Move/Rotate/Scale dengan Copy), pengukuran wajib (Std Measure, BoundBox), dan pemilihan pusat transformasi."
FORUM_CHIPS_LMS = ["panel = 1200 × 600 mm", "induk = heksagon R 40 mm", "k = 1 · 1,5 · 2; 0° · 15° · 30°", "syarat = jarak pusat ≥ 90 mm"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Pola heksagon tiga ukuran dan tiga orientasi dari satu induk (Pertemuan 3)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const sk = Math.min((W - 40) / 1200, (H - 40) / 600), ox = (W - 1200 * sk) / 2, oy = H - (H - 600 * sk) / 2;
  const X = (x) => ox + x * sk, Y = (y) => oy - y * sk;
  ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(X(0), Y(600), 1200 * sk, 600 * sk);
  const pola = [[120, 120, 1, 0], [300, 400, 1.5, 15], [520, 160, 2, 30], [760, 420, 1, 30], [900, 150, 1.5, 0], [1080, 380, 2, 15], [560, 470, 1, 15]];
  const hex = (cx, cy, k, th) => { const p = []; for (let i = 0; i < 6; i++) { const a = (th + 90 + i * 60) * Math.PI / 180; p.push([cx + 40 * k * Math.cos(a), cy + 40 * k * Math.sin(a)]); } return p; };
  pola.forEach(([cx, cy, k, th], i) => {
    const p = hex(cx, cy, k, th);
    ctx.fillStyle = i === 0 ? 'rgba(0,224,158,.22)' : 'rgba(34,211,238,.14)'; ctx.strokeStyle = i === 0 ? '#00e09e' : '#22d3ee'; ctx.lineWidth = 1.6;
    ctx.beginPath(); p.forEach((q, j) => j ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,.9)'; ctx.beginPath(); ctx.arc(X(cx), Y(cy), 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(226,232,240,.8)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText('k' + k + ' · ' + th + '°', X(cx), Y(cy) - 40 * k * sk - 5);
  });
  const [a, b] = [pola[0], pola[1]];
  ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(b[0]), Y(b[1])); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#00e09e'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('d = ' + Math.hypot(b[0] - a[0], b[1] - a[1]).toFixed(1) + ' mm', X((a[0] + b[0]) / 2) + 6, Y((a[1] + b[1]) / 2));
  ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('■ induk (hijau) → salinan Move/Rotate/Scale · panel 1200 × 600', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
