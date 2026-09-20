# Gambar acuan simbolik tugas T1–T5 Modul 6 Pemodelan CAD (Sudut Pandang, Proyeksi, dan
# Manajemen Tampilan 3D). Simbol (a, b, c, H, hₙ, θ, d, h₁, h₂) mengikuti teks tugas backend;
# angka varian dimuat per NIM. Dipakai tugas_gambar.tugas_gambar(6) → gambar().
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import (AM, AX, BL, CY, GN, GR, PK, RD, TX, VI, _panah, catatan, dim_h, dim_v, ext, gambar_tugas, iso,  # noqa: E402,F401
                          lingkar3d, poli, sumbu2d, sumbu3d, t)


def _garis(x1, y1, x2, y2, warna, w=1, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def _prisma(prof, b, cx, cy, s, isi_depan="rgba(34,211,238,.20)", garis=CY, muka_khusus=None):
    """Prisma dari profil XZ (daftar (x, z)) yang di-Pad sejauh b searah Y; muka_khusus = (indeks rusuk profil, fill, stroke)."""
    F0 = [iso(x, 0, z, cx, cy, s) for x, z in prof]
    F1 = [iso(x, b, z, cx, cy, s) for x, z in prof]
    n = len(prof)
    out = poli(F1, "rgba(34,211,238,.06)", "rgba(34,211,238,.35)", 0.8)
    for i in range(n):
        j = (i + 1) % n
        if muka_khusus and i == muka_khusus[0]:
            out += poli([F0[i], F0[j], F1[j], F1[i]], muka_khusus[1], muka_khusus[2], 1.6)
        else:
            out += poli([F0[i], F0[j], F1[j], F1[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1)
    out += poli(F0, isi_depan, garis, 1.6)
    return out, F0, F1


def gambar():
    out = []
    # ── T1: balok bertakik → Projection Group Front/Top/Right 1:2; luas muka depan ──
    cx, cy, s = 120, 190, 1.0
    a, b, H, hn = 130, 70, 80, 26
    prof = [(0, 0), (a, 0), (a, H - hn), (a / 2, H - hn), (a / 2, H), (0, H)]
    body, F0, F1 = _prisma(prof, b, cx, cy, s, "rgba(245,158,11,.22)", AM)
    body += sumbu3d(cx - 8, cy + 26, 0.8, 30)
    p = iso(a / 2, 0, 0, cx, cy, s)
    body += t(p[0] + 6, p[1] + 16, "a", 11, AM, "middle", "600")
    p = iso(0, 0, H / 2, cx, cy, s)
    body += t(p[0] - 8, p[1] + 4, "H", 11, AM, "end", "600")
    p = iso(a, 0, H - hn / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "hₙ", 11, PK, "start", "600")
    p = iso(3 * a / 4, 0, H - hn, cx, cy, s)
    body += t(p[0] + 2, p[1] - 6, "a/2", 10, PK, "middle", "600")
    p = iso(a, b / 2, 0, cx, cy, s)
    body += t(p[0] + 10, p[1] + 6, "b", 11, AM, "start", "600")
    body += t(150, 222, "muka depan = bidang sketsa XZ (kuning)", 9.5, AM, "middle")
    body += catatan(["Sketch (XZ) profil bertakik 6 titik", "  → Pad b (takik tembus kedalaman)", "TechDraw: Page + Projection Group", "  Front / Top / Right, skala 1:2", "baca: luas muka depan (XZ)", "  = a·H − (a/2)·hₙ"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 1 — balok bertakik dengan tiga pandangan TechDraw dan luas muka depan", h=240))

    # ── T2: balok a × b × c + pandangan isometrik; diagonal ruang ──
    cx, cy, s = 120, 185, 1.0
    a, b, c = 120, 70, 60
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, c, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = ""
    for i, j in [(2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.06)", "rgba(34,211,238,.35)", 0.8)
    for i, j in [(0, 1), (1, 2)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.6)
    o, q = dasar[0], atas[2]
    body += _garis(o[0], o[1], q[0], q[1], PK, 1.8, "6 3")
    body += f'<circle cx="{o[0]:.1f}" cy="{o[1]:.1f}" r="3" fill="{PK}"/><circle cx="{q[0]:.1f}" cy="{q[1]:.1f}" r="3" fill="{PK}"/>'
    body += t(o[0] + 8, o[1] + 14, "(0, 0, 0)", 9, PK, "start")
    body += t(q[0] + 8, q[1] - 4, "(a, b, c)", 9, PK, "start")
    body += t((o[0] + q[0]) / 2 - 12, (o[1] + q[1]) / 2 - 2, "d", 12, PK, "end", "700")
    p = iso(a / 2, 0, 0, cx, cy, s)
    body += t(p[0] + 4, p[1] + 16, "a", 11, AM, "middle", "600")
    p = iso(a, b / 2, 0, cx, cy, s)
    body += t(p[0] + 10, p[1] + 6, "b", 11, AM, "start", "600")
    p = iso(0, 0, c / 2, cx, cy, s)
    body += t(p[0] - 8, p[1] + 4, "c", 11, AM, "end", "600")
    body += sumbu3d(cx - 60, cy + 24, 0.8, 30)
    body += catatan(["Sketch (XY) a × b → Pad c", "TechDraw: Page + Projection Group", "  Front + satu pandangan isometrik", "baca: diagonal ruang (0,0,0)–(a,b,c)", "  = √(a² + b² + c²)", "  Measure Distance / DiagonalLength"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 2 — balok dengan pandangan isometrik dan diagonal ruang"))

    # ── T3: balok diputar θ terhadap Z; BoundBox.XLength (tampak atas) ──
    ox, oy, a, b, th = 90, 200, 140, 80, 30
    rad = math.radians(th)
    R = lambda x, y: (ox + x * math.cos(rad) - y * math.sin(rad), oy - (x * math.sin(rad) + y * math.cos(rad)))
    body = poli([(ox, oy), (ox + a, oy), (ox + a, oy - b), (ox, oy - b)], "none", "rgba(148,163,184,.4)", 1, "5 4")
    putar = [R(x, y) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body += poli(putar, "rgba(34,211,238,.16)", CY, 2)
    xs, ys = [p[0] for p in putar], [p[1] for p in putar]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    body += poli([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], "none", AM, 1.4, "7 4")
    body += f'<path d="M {ox + 40} {oy} A 40 40 0 0 0 {ox + 40 * math.cos(rad):.1f} {oy - 40 * math.sin(rad):.1f}" fill="none" stroke="{PK}" stroke-width="1.3"/>'
    body += t(ox + 46, oy - 10, "θ", 12, PK, "start", "700")
    body += f'<circle cx="{ox}" cy="{oy}" r="2.5" fill="{TX}"/>' + t(ox - 6, oy + 12, "(0, 0)", 9, AX, "end")
    ma = ((putar[0][0] + putar[1][0]) / 2, (putar[0][1] + putar[1][1]) / 2)
    mb = ((putar[0][0] + putar[3][0]) / 2, (putar[0][1] + putar[3][1]) / 2)
    body += t(ma[0] + 8, ma[1] + 12, "a", 11, CY, "middle", "600")
    body += t(mb[0] - 10, mb[1] + 4, "b", 11, CY, "end", "600")
    body += ext(x0, y1, x0, y1 + 26) + ext(x1, y1, x1, y1 + 26) + dim_h(x0, x1, y1 + 20, "XLength", atas=False)
    body += ext(x1, y0, x1 + 28, y0) + ext(x1, y1, x1 + 28, y1) + dim_v(x1 + 22, y0, y1, "YLength", kiri=False)
    body += t(ox + a * 0.55, oy + 13, "posisi semula (putus)", 9, AX, "middle")
    body += catatan(["Sketch (XY) a × b → Pad c", "Body → Placement: Axis (0, 0, 1),", "  Angle θ (putar terhadap Z)", "baca: Shape.BoundBox.XLength", "  = a·cosθ + b·sinθ", "  (kotak sejajar sumbu global)"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 3 — balok diputar θ terhadap Z dan kotak pembatasnya (tampak atas)", h=246))

    # ── T4: balok berlubang + Section View A-A pada y = b/2; luas potongan ──
    cx, cy, s = 120, 195, 1.0
    a, b, h, d = 130, 80, 50, 28
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, h, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = ""
    for i, j in [(2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.06)", "rgba(34,211,238,.35)", 0.8)
    for i, j in [(0, 1), (1, 2)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.6)
    body += poli(lingkar3d(a / 2, b / 2, h, d / 2, cx, cy, s), "#0a101f", VI, 1.4)
    bidang = [iso(x, b / 2, z, cx, cy, s) for x, z in [(-10, -6), (a + 10, -6), (a + 10, h + 10), (-10, h + 10)]]
    body += poli(bidang, "rgba(236,72,153,.12)", PK, 1.3, "6 3")
    p0, p1 = iso(0, b / 2, h, cx, cy, s), iso(a, b / 2, h, cx, cy, s)
    body += _garis(p0[0], p0[1], p1[0], p1[1], PK, 1.2, "8 3 2 3")
    body += t(bidang[0][0] - 6, bidang[0][1] + 4, "A", 11, PK, "end", "700")
    body += t(bidang[1][0] + 6, bidang[1][1] + 4, "A", 11, PK, "start", "700")
    p = iso(a / 2, 0, 0, cx, cy, s)
    body += t(p[0] + 4, p[1] + 16, "a", 11, AM, "middle", "600")
    p = iso(a, 0, h / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "h", 11, AM, "start", "600")
    p = iso(a, b / 2, h, cx, cy, s)
    body += t(p[0] + 8, p[1] - 8, "b", 11, AM, "start", "600")
    p = iso(a / 2, b / 2, h, cx, cy, s)
    body += t(p[0] + 18, p[1] - 6, "⌀d", 10.5, VI, "start", "600")
    body += t(130, 224, "bidang potong A-A pada y = b/2 (merah muda)", 9.5, PK, "middle")
    body += catatan(["Sketch (XY) a × b → Pad h", "Circle ⌀d di (a/2, b/2) → Pocket", "  Through all (lubang tembus)", "TechDraw: Top → Section View A-A", "  bidang y = b/2 (pusat lubang)", "baca: luas potongan = h·(a − d)"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 4 — balok berlubang dengan Section View A-A dan luas potongan", h=240))

    # ── T5: baji dari trapesium XZ → Pad b; pandangan bantu; luas muka miring ──
    cx, cy, s = 110, 195, 1.0
    a, h1, h2, b = 120, 80, 35, 70
    prof = [(0, 0), (a, 0), (a, h2), (0, h1)]
    body, F0, F1 = _prisma(prof, b, cx, cy, s, "rgba(34,211,238,.18)", CY, (2, "rgba(245,158,11,.26)", AM))
    L = math.sqrt(a ** 2 + (h1 - h2) ** 2)
    nx, nz = (h1 - h2) / L, a / L
    pc = (a / 2, b / 2, (h1 + h2) / 2)
    p0 = iso(*pc, cx, cy, s)
    p1 = iso(pc[0] + 30 * nx, pc[1], pc[2] + 30 * nz, cx, cy, s)
    body += _panah(p0[0], p0[1], p1[0], p1[1], GR, 1.6)
    body += t(p1[0] + 6, p1[1] - 2, "arah pandangan bantu", 9.5, GR, "start", "600")
    body += t(p1[0] + 6, p1[1] + 11, "(normal muka miring)", 9, GR, "start")
    p = iso(a / 2, 0, 0, cx, cy, s)
    body += t(p[0] + 4, p[1] + 16, "a", 11, AM, "middle", "600")
    p = iso(0, 0, h1 / 2, cx, cy, s)
    body += t(p[0] - 8, p[1] + 4, "h₁", 11, AM, "end", "600")
    p = iso(a, 0, h2 / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "h₂", 11, AM, "start", "600")
    p = iso(a, b / 2, 0, cx, cy, s)
    body += t(p[0] + 6, p[1] + 14, "b", 11, AM, "start", "600")
    body += t(120, 222, "muka miring (kuning) = b × L, L = panjang sebenarnya", 9.5, AM, "middle")
    body += catatan(["Sketch (XZ) trapesium (0,0)→(a,0)", "  →(a,h₂)→(0,h₁) → Pad b", "TechDraw: Front + pandangan bantu", "  (Direction ⟂ muka miring)", "baca: luas muka miring = b·L", "  L = √(a² + (h₁ − h₂)²)"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 5 — baji dengan pandangan bantu dan luas sebenarnya muka miring", h=240))
    return out


if __name__ == "__main__":
    for i, sv in enumerate(gambar(), 1):
        print(6, i, len(sv))
