# Gambar acuan simbolik lima tugas Modul 12 Pemodelan CAD (Identifikasi Masalah Desain dan
# Solusi Optimasi). Simbol (a₁, a₂, b, h, δ, D, ES, ei, w, p, Ls, ws, R, W, …) mengikuti teks
# tugas backend; angka varian tiap NIM dimuat server. Dipakai bangun.py lewat tugas_gambar.tugas_gambar(12).
import math
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import gambar_tugas, catatan, dim_h, dim_v, ext, sumbu2d, sumbu3d, iso, lingkar3d, poli, _panah, CY, AM, GR, VI, PK, RD, GN, BL, AX, TX, t  # noqa: E402,F401


def _geser(bag, teks, dx, dy):
    """Geser <text> berisi tepat `teks` (keluaran helper bersama, mis. sumbu3d/dim_h) sejauh (dx, dy)."""
    return re.sub(rf'<text x="([\d.\-]+)" y="([\d.\-]+)"([^>]*)>{re.escape(teks)}</text>',
                  lambda m: f'<text x="{float(m.group(1)) + dx:.1f}" y="{float(m.group(2)) + dy:.1f}"{m.group(3)}>{teks}</text>', bag, count=1)


def _garis(x1, y1, x2, y2, warna, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def _ling(cx, cy, r, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _balok(x0, y0, z0, a, b, h, cx, cy, s, isi, garis, isi_atas=None, w=1.1):
    """Balok iso: muka belakang dulu (x = x0 + a, y = y0 + b), lalu muka depan (y = y0), kiri (x = x0), dan atas."""
    P = lambda x, y, z: iso(x, y, z, cx, cy, s)  # noqa: E731
    out = poli([P(x0 + a, y0, z0), P(x0 + a, y0 + b, z0), P(x0 + a, y0 + b, z0 + h), P(x0 + a, y0, z0 + h)], isi, garis, w * 0.8)
    out += poli([P(x0, y0 + b, z0), P(x0 + a, y0 + b, z0), P(x0 + a, y0 + b, z0 + h), P(x0, y0 + b, z0 + h)], isi, garis, w * 0.8)
    out += poli([P(x0, y0, z0), P(x0 + a, y0, z0), P(x0 + a, y0, z0 + h), P(x0, y0, z0 + h)], isi, garis, w)
    out += poli([P(x0, y0, z0), P(x0, y0 + b, z0), P(x0, y0 + b, z0 + h), P(x0, y0, z0 + h)], isi, garis, w)
    out += poli([P(x0, y0, z0 + h), P(x0 + a, y0, z0 + h), P(x0 + a, y0 + b, z0 + h), P(x0, y0 + b, z0 + h)], isi_atas or isi, garis, w + 0.4)
    return out


def _silinder(cx0, cy0, z0, z1, r, cx, cy, s, isi, garis, n=32):
    out = ""
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        out += poli([iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z0, cx, cy, s), iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z0, cx, cy, s),
                     iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z1, cx, cy, s), iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z1, cx, cy, s)],
                    "rgba(148,163,184,.06)", garis, 0.5)
    out += poli(lingkar3d(cx0, cy0, z1, r, cx, cy, s, n), isi, garis, 1.4)
    return out


def gambar():
    out = []
    # ── T1 — dua balok saling masuk sejauh δ (Part Common) ──
    cx, cy, s = 118, 176, 1.02
    a1, a2, b, h, dl = 110, 90, 70, 50, 16
    P = lambda x, y, z: iso(x, y, z, cx, cy, s)  # noqa: E731
    body = _geser(_geser(sumbu3d(cx, cy, s, 36), "X", -2, -2), "Z", 0, 4)  # label sumbu lepas dari rusuk balok A
    body += _balok(0, 0, 0, a1, b, h, cx, cy, s, "rgba(34,211,238,.10)", "rgba(34,211,238,.7)", "rgba(34,211,238,.2)")
    body += _balok(a1 - dl, 0, 0, a2, b, h, cx, cy, s, "rgba(245,158,11,.10)", "rgba(245,158,11,.75)", "rgba(245,158,11,.18)")
    body += _balok(a1 - dl, 0, 0, dl, b, h, cx, cy, s, "rgba(239,68,68,.38)", RD, "rgba(239,68,68,.5)", 1.4)
    p = P(a1 / 2 - 22, b / 2, h)
    body += t(p[0], p[1] + 4, "A", 12, CY, "middle", "700")
    p = P(a1 - dl + a2 / 2 + 18, b / 2, h)
    body += t(p[0] - 4, p[1] + 4, "B", 12, AM, "middle", "700")  # lepas dari rusuk tegak belakang B
    p = P(a1 - dl / 2, b / 2, h)
    body += _garis(p[0], p[1], p[0] + 14, 44, RD, 0.9, "3 2") + t(p[0] + 18, 40, "irisan A ∩ B = δ·b·h", 10, RD, "start", "600")
    p = P(a1 / 2, -6, 0)
    body += t(p[0], p[1] + 15, "a₁", 11, CY, "middle", "600")
    p = P(a1 - dl + a2 / 2 + 10, -6, 0)
    body += t(p[0], p[1] + 15, "a₂", 11, AM, "middle", "600")
    p = P(-6, b / 2, 0)
    body += t(p[0] - 4, p[1] + 10, "b", 11, AM, "end", "600")
    p = P(0, b, h / 2)  # rusuk tegak kiri-belakang: di luar balok, jauh dari label sumbu
    body += t(p[0] - 6, p[1] + 4, "h", 11, AM, "end", "600")
    p = P(a1 - dl / 2, -4, 0)
    body += t(p[0] + 4, p[1] + 30, "δ", 12, RD, "middle", "700")
    body += catatan(["Part Box A (a₁ × b × h) di origin", "Part Box B digeser x = a₁ − δ", "Part → Boolean → Common (A, B)", "baca: Common.Shape.Volume", "  = δ·b·h"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — dua balok saling masuk sejauh δ dan volume Part Common"))

    # ── T2 — fit lubang–poros: cincin (lubang maks) + poros (min) sesumbu ──
    cx, cy, s = 140, 178, 1.0
    ro, rh, rs, hz, hs = 58, 36, 29, 22, 52
    body = _silinder(0, 0, 0, hz, ro, cx, cy, s, "rgba(34,211,238,.20)", CY)
    body += poli(lingkar3d(0, 0, hz, rh, cx, cy, s), "#0a101f", CY, 1.2)
    body += poli(lingkar3d(0, 0, hz, rs, cx, cy, s), "rgba(245,158,11,.35)", AM, 1.2)
    body += _silinder(0, 0, hz, hs, rs, cx, cy, s, "rgba(245,158,11,.35)", AM)
    z0, z1 = iso(0, 0, -12, cx, cy, s), iso(0, 0, hs + 16, cx, cy, s)
    body += _garis(z0[0], z0[1], z1[0], z1[1], RD, 1.1, "8 3 2 3") + t(z1[0] + 8, z1[1] - 2, "sesumbu (Z)", 9.5, RD, "start")
    p = iso(ro, 0, hz / 2, cx, cy, s)
    body += t(p[0] + 16, p[1] + 10, "cincin: lubang", 10, CY, "start", "600") + t(p[0] + 16, p[1] + 25, "⌀D + ES/1000 (maks)", 10, CY, "start")
    p = iso(0, 0, hs, cx, cy, s)
    body += t(p[0] - 56, p[1] - 30, "poros ⌀D + ei/1000 (min)", 10, AM, "middle", "600")  # lepas dari label sesumbu (Z)
    p = iso(0, -(rh + rs) / 2, hz, cx, cy, s)
    body += _garis(p[0], p[1], p[0] - 30, p[1] + 34, GR, 0.9, "3 2") + t(p[0] - 30, p[1] + 48, "celah radial", 10, GR, "middle", "600") + t(p[0] - 30, p[1] + 63, "= c_maks / 2", 10, GR, "middle")
    body += catatan(["Body 1: cincin, lubang ⌀(D + ES/1000)", "Body 2: poros ⌀(D + ei/1000), ei < 0", "  sesumbu, konstrain Diameter 4 desimal", "c_maks = ⌀lubang maks − ⌀poros min", "baca: c_maks = (ES − ei)/1000 (mm)"], 306, 40)  # pita x 200..330 kosong
    out.append(gambar_tugas(body, "Tugas 2 — fit lubang–poros pada ukuran batas dan kelonggaran maksimum", h=250))

    # ── T3 — rumah berdinding tipis: Pad a × b × h, Pocket (a − 2w) × (b − 2w) sedalam p ──
    cx, cy, s = 148, 186, 1.0
    a, b, h, w, p_ = 130, 85, 60, 12, 40
    P = lambda x, y, z: iso(x, y, z, cx, cy, s)  # noqa: E731
    body = _geser(sumbu3d(cx, cy, s, 34), "X", -2, -2)  # label X lepas dari rusuk depan
    body += poli([P(a, 0, 0), P(a, b, 0), P(a, b, h), P(a, 0, h)], "rgba(34,211,238,.08)", "rgba(34,211,238,.6)", 0.9)
    body += poli([P(0, b, 0), P(a, b, 0), P(a, b, h), P(0, b, h)], "rgba(34,211,238,.08)", "rgba(34,211,238,.6)", 0.9)
    body += poli([P(w, w, h - p_), P(a - w, w, h - p_), P(a - w, b - w, h - p_), P(w, b - w, h - p_)], "rgba(168,85,247,.20)", VI, 1)
    body += poli([P(a - w, w, h - p_), P(a - w, b - w, h - p_), P(a - w, b - w, h), P(a - w, w, h)], "rgba(168,85,247,.10)", VI, 0.9)
    body += poli([P(w, b - w, h - p_), P(a - w, b - w, h - p_), P(a - w, b - w, h), P(w, b - w, h)], "rgba(168,85,247,.10)", VI, 0.9)
    body += poli([P(0, 0, 0), P(a, 0, 0), P(a, 0, h), P(0, 0, h)], "rgba(34,211,238,.10)", CY, 1.1)
    body += poli([P(0, 0, 0), P(0, b, 0), P(0, b, h), P(0, 0, h)], "rgba(34,211,238,.10)", CY, 1.1)
    for (x0, y0, x1, y1) in [(0, 0, a, w), (0, b - w, a, b), (0, w, w, b - w), (a - w, w, a, b - w)]:
        body += poli([P(x0, y0, h), P(x1, y0, h), P(x1, y1, h), P(x0, y1, h)], "rgba(34,211,238,.24)", CY, 1.2)
    p = P(a / 2, -6, 0)
    body += t(p[0], p[1] + 15, "a", 11, AM, "middle", "600")
    p = P(-6, b / 2, 0)
    body += t(p[0] - 4, p[1] + 10, "b", 11, AM, "end", "600")
    p = P(0, b, h / 2)  # rusuk tegak kiri-belakang: di luar rumah, jauh dari label sumbu
    body += t(p[0] - 6, p[1] + 4, "h", 11, AM, "end", "600")
    p = P(a - w / 2, 0, h)
    body += _garis(p[0], p[1], p[0] + 12, p[1] - 12, GR, 0.9, "3 2") + t(p[0] + 15, p[1] - 14, "dinding w", 10, GR, "start", "600")  # jauh dari kolom catatan
    p = P(a - w, b - w, h - p_ / 2)
    body += t(p[0] + 8, p[1] + 4, "p", 11, VI, "start", "700")
    p = P(a / 2, b / 2, h - p_)
    body += _garis(p[0], p[1], p[0] - 30, 46, VI, 0.9, "3 2") + t(p[0] - 30, 42, "Pocket (a − 2w) × (b − 2w)", 10, VI, "middle", "600")
    body += catatan(["Sketch XY a × b → Pad h", "Sketch muka atas: (a−2w) × (b−2w)", "  berpusat → Pocket Dimension p", "dinding w, dasar h − p", "  (metrik DFM)", "baca: V = a·b·h − (a−2w)(b−2w)·p"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — rumah berdinding tipis dari Pad dan Pocket berpusat", h=236))

    # ── T4 — pelat a × b dengan slot obround (Ls, ws) di pusat: jarak tepi e arah X ──
    ox, oy = 160, 118
    a, b, Ls, ws = 250, 112, 118, 30
    x0, y0 = ox - a / 2, oy - b / 2
    r = ws / 2
    c1x, c2x = ox - Ls / 2, ox + Ls / 2
    body = f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{a}" height="{b}" fill="rgba(34,211,238,.14)" stroke="{CY}" stroke-width="2"/>'
    body += f'<path d="M {c1x:.1f} {oy - r:.1f} H {c2x:.1f} A {r} {r} 0 0 1 {c2x:.1f} {oy + r:.1f} H {c1x:.1f} A {r} {r} 0 0 1 {c1x:.1f} {oy - r:.1f} Z" fill="#0a101f" stroke="{VI}" stroke-width="2"/>'
    body += _garis(c1x - r - 14, oy, c2x + r + 14, oy, RD, 0.7, "6 2 2 2")
    body += _ling(c1x, oy, 2.2, VI, "none") + _ling(c2x, oy, 2.2, VI, "none")
    body += ext(x0, y0, x0, y0 - 24) + ext(x0 + a, y0, x0 + a, y0 - 24) + dim_h(x0, x0 + a, y0 - 16, "a")
    body += ext(x0 + a, y0, x0 + a + 26, y0) + ext(x0 + a, y0 + b, x0 + a + 26, y0 + b) + dim_v(x0 + a + 18, y0, y0 + b, "b", kiri=False)
    body += ext(c1x, oy, c1x, oy - r - 20, VI) + ext(c2x, oy, c2x, oy - r - 20, VI) + dim_h(c1x, c2x, oy - r - 13, "Ls", VI)
    body += ext(c2x + r, oy - r, c2x + r + 30, oy - r, VI) + ext(c2x + r, oy + r, c2x + r + 30, oy + r, VI) + dim_v(c2x + r + 22, oy - r, oy + r, "ws", VI, kiri=False)
    body += ext(c1x - r, oy + r, c1x - r, y0 + b + 30, GR) + ext(x0, y0 + b, x0, y0 + b + 30, GR) + dim_h(x0, c1x - r, y0 + b + 22, "e", GR, atas=False)
    body += _ling(ox, oy, 2.5, TX, "none") + t(ox, oy + r + 14, "(0, 0) pusat pelat & slot", 9, AX, "middle")
    body += t(x0 + 6, y0 + 14, "Pad t", 9.5, CY, "start")
    body += catatan(["Sketch XY a × b simetris origin", "  → Pad t", "Slot obround di pusat:", "  Ls (pusat–pusat), lebar ws,", "  searah X → Pocket Through all",
                     "e = ujung busur slot →", "  tepi pendek pelat", "baca: e = (a − (Ls + ws))/2 (arah X)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — pelat dengan slot obround dan jarak tepi e arah X"))

    # ── T5 — lengan R × w berputar terhadap ujungnya dekat dinding sejauh W ──
    ox, oy = 118, 136
    R, w, W = 100, 26, 140
    th = math.atan2(w / 2, R)
    rc = math.hypot(R, w / 2)

    def rot(x, y):
        xr = x * math.cos(-th) - y * math.sin(-th)
        yr = x * math.sin(-th) + y * math.cos(-th)
        return ox + xr, oy - yr

    lengan = [rot(0, -w / 2), rot(R, -w / 2), rot(R, w / 2), rot(0, w / 2)]
    body = _ling(ox, oy, rc, "none", PK, 1, "5 4")
    body += f'<rect x="{ox + W:.1f}" y="{oy - 100:.1f}" width="14" height="200" fill="rgba(148,163,184,.25)" stroke="{AX}" stroke-width="1.2"/>'
    for k in range(10):
        yy = oy - 96 + k * 20
        body += _garis(ox + W, yy + 10, ox + W + 14, yy - 4, AX, 0.6)
    body += poli(lengan, "rgba(34,211,238,.18)", CY, 2)
    body += _garis(ox, oy, ox + rc, oy, AX, 0.7, "4 3")
    body += _ling(ox, oy, 4, TX, "none") + t(ox - 4, oy + 27, "sumbu (0, 0)", 9, AX, "end")  # di bawah dimensi w
    body += _ling(ox + rc, oy, 3.5, PK, "none")
    body += ext(ox + rc, oy + 4, ox + rc, oy + 46, GR) + ext(ox + W, oy + 100, ox + W, oy + 118, GR) + _geser(dim_h(ox + rc, ox + W, oy + 40, "c_min", GR, atas=False), "c_min", 0, 2)
    body += ext(ox, oy - 4, ox, oy - 112) + ext(ox + W, oy - 100, ox + W, oy - 112) + dim_h(ox, ox + W, oy - 108, "W")
    body += t(ox + W + 7, oy - 118, "dinding", 9.5, AX, "middle")
    p = rot(R * 0.5, w / 2 + 12)
    body += t(p[0], p[1], "R", 11, AM, "middle", "600")
    q0, q1 = rot(0, -w / 2), rot(0, w / 2)
    body += dim_v(ox - 16, q1[1], q0[1], "w")
    body += f'<path d="M {ox + 40:.1f} {oy:.1f} A 40 40 0 0 1 {rot(40, 0)[0]:.1f} {rot(40, 0)[1]:.1f}" fill="none" stroke="{PK}" stroke-width="1.2"/>'
    body += t(ox + 46, oy + 14, "θ*", 10.5, PK, "start", "700")
    # label di luar lingkaran sapuan, kiri dinding, dengan garis penunjuk ke titik sudut terjauh
    body += _garis(ox + W - 20, oy - 68, ox + rc + 2, oy - 5, PK, 0.8, "3 2") + t(ox + W - 6, oy - 72, "sudut terjauh", 9.5, PK, "end")
    body += catatan(["Lengan: Sketch (0, −w/2)…(R, w/2)", "  → Pad; sumbu putar Z di origin", "Dinding: Part Box, muka di x = W", "Sudut lengan menyapu lingkaran", "  berjari-jari √(R² + (w/2)²)", "baca: c_min = W − √(R² + (w/2)²)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — lengan berputar dekat dinding dan jarak bebas minimum", h=258))
    return out


if __name__ == "__main__":
    for i, s_ in enumerate(gambar(), 1):
        print(12, i, len(s_))
