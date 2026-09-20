# Gambar acuan simbolik lima tugas rakitan Modul 11 Pemodelan CAD (Perakitan Komponen dan
# Analisis Sistem). Simbol (a, b, t, d, D, r, l, θ, C, …) mengikuti teks tugas backend;
# angka varian tiap NIM dimuat server. Dipakai bangun.py lewat tugas_gambar.tugas_gambar(11).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import gambar_tugas, catatan, dim_h, dim_v, ext, sumbu2d, sumbu3d, iso, lingkar3d, poli, _panah, CY, AM, GR, VI, PK, RD, GN, BL, AX, TX, t  # noqa: E402,F401


def _silinder(cx0, cy0, z0, z1, r, cx, cy, s, isi, garis, n=32):
    out = ""
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        out += poli([iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z0, cx, cy, s), iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z0, cx, cy, s),
                     iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z1, cx, cy, s), iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z1, cx, cy, s)],
                    "rgba(148,163,184,.06)", garis, 0.5)
    out += poli(lingkar3d(cx0, cy0, z1, r, cx, cy, s, n), isi, garis, 1.4)
    return out


def _garis(x1, y1, x2, y2, warna, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def _ling(cx, cy, r, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def gambar():
    out = []
    # T1 — pelat + pin (Fixed joint)
    cx, cy, s = 140, 178, 1.0
    a, b, tt, dp, Lp = 150, 100, 20, 26, 70
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = sumbu3d(cx, cy, s, 44)
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    body += _silinder(a / 2, b / 2, tt, tt + Lp, dp / 2, cx, cy, s, "rgba(245,158,11,.30)", AM)
    p = iso(a / 2, b / 2, tt + Lp, cx, cy, s)
    body += t(p[0] + dp / 2 * s + 6, p[1] - 4, "⌀d_pin", 10.5, AM, "start", "600")
    p = iso(a / 2 + dp / 2, b / 2, tt + Lp / 2, cx, cy, s)
    body += t(p[0] + 16, p[1] + 4, "L_pin", 10.5, AM, "start", "600")
    p = iso(a, 0, tt / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "t", 11, CY, "start", "700")
    p = iso(a / 2, -6, 0, cx, cy, s)
    body += t(p[0] - 4, p[1] + 16, "a", 11, CY, "middle", "700")
    p = iso(a, b / 2, 0, cx, cy, s)
    body += t(p[0] + 14, p[1] + 12, "b", 11, CY, "start", "700")
    p = iso(a / 2, b / 2, tt, cx, cy, s)
    body += _garis(p[0], p[1], p[0] - 52, 62, GR, 0.8, "3 2") + t(p[0] - 56, 60, "Fixed joint", 10, GR, "end", "600") + t(p[0] - 56, 74, "pusat muka atas", 9.5, AX, "end")
    body += catatan(["Body pelat a × b × t (Pad)", "Body pin ⌀d_pin × L_pin (Pad)", "Assembly: pelat grounded,", "  Insert Link, Fixed joint pin", "  di pusat muka atas pelat", "baca: V_pelat + V_pin (mm³)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — rakitan pelat dan pin dengan Fixed joint", h=240))
    # T2 — poros di lubang (Cylindrical joint), penampang + iso kecil
    cx0, cy0 = 120, 122
    R, rr = 60, 50
    body = f'<rect x="{cx0 - 88}" y="{cy0 - 88}" width="176" height="176" fill="rgba(148,163,184,.08)" stroke="{AX}" stroke-width="1.2"/>'
    body += _ling(cx0, cy0, R, "#0a101f", CY, 1.8)
    body += _ling(cx0, cy0, rr, "rgba(245,158,11,.25)", AM, 1.8)
    body += _ling(cx0, cy0, 2.5, TX, TX, 1)
    ang = -0.7
    body += _panah(cx0 + rr * math.cos(ang), cy0 + rr * math.sin(ang), cx0 + R * math.cos(ang), cy0 + R * math.sin(ang), GR, 1.2)
    body += t(cx0 + R * math.cos(ang) + 8, cy0 + R * math.sin(ang) - 2, "c", 11, GR, "start", "700")
    body += _garis(cx0 - R, cy0, cx0 + R, cy0, CY, 0.8, "4 3") + t(cx0, cy0 - R - 8, "⌀D (lubang bus)", 10.5, CY, "middle", "600")
    body += _garis(cx0 - rr, cy0 + 22, cx0 + rr, cy0 + 22, AM, 0.8, "4 3") + t(cx0, cy0 + 36, "⌀d (poros)", 10.5, AM, "middle", "600")
    body += t(cx0, cy0 + 106, "bus 40 × 40 × 30, grounded", 9.5, AX, "middle")
    body += t(cx0 + 96, cy0 - 78, "sumbu bersama", 9.5, VI, "start", "600") + _garis(cx0, cy0, cx0 + 92, cy0 - 84, VI, 0.8, "3 2")
    body += catatan(["Body bus: balok berlubang ⌀D", "  (Pad + Pocket Through all)", "Body poros pejal ⌀d × 60", "Assembly: bus grounded,", "  Cylindrical joint sesumbu", "baca: c = (D − d)/2, 4 desimal"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — poros di dalam lubang dengan Cylindrical joint (kelonggaran radial)", h=240))
    # T3 — pelat + boss, pusat massa gabungan (tampak samping XZ)
    ox, oz, s2 = 46, 196, 1.3
    a, tt, dB, hB = 150, 20, 40, 60
    X = lambda x: ox + x * s2
    Z = lambda z: oz - z * s2
    body = sumbu2d(ox - 20, oz, 30, 30)
    body += f'<rect x="{X(0)}" y="{Z(tt)}" width="{a * s2}" height="{tt * s2}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="1.8"/>'
    body += f'<rect x="{X(a / 2 - dB / 2)}" y="{Z(tt + hB)}" width="{dB * s2}" height="{hB * s2}" fill="rgba(245,158,11,.20)" stroke="{AM}" stroke-width="1.8"/>'
    zbar = 24
    g1, g2, g = (X(a / 2), Z(tt / 2)), (X(a / 2), Z(tt + hB / 2)), (X(a / 2), Z(zbar))
    for (px, py, c) in [(g1[0], g1[1], CY), (g2[0], g2[1], AM)]:
        body += _ling(px, py, 3.5, "#0a101f", c, 1.4) + _garis(px - 7, py, px + 7, py, c, 1) + _garis(px, py - 7, px, py + 7, c, 1)
    body += _ling(g[0], g[1], 4.5, GR, "#0a101f", 1.2)
    body += t(g2[0] + dB / 2 * s2 + 6, g2[1] + 4, "G₂ (t + h_B/2)", 9.5, AM, "start", "600")
    body += t(g[0] - dB / 2 * s2 - 6, g[1] + 4, "G (z̄)", 10, GR, "end", "700")
    body += t(X(0) - 6, g1[1] + 4, "G₁ (t/2)", 9.5, CY, "end", "600")
    body += t(X(a / 2), Z(tt + hB) - 8, "⌀d_B", 10.5, AM, "middle", "600")
    body += dim_v(X(a) + 16, Z(tt + hB), Z(tt), "h_B", AM, kiri=False)
    body += dim_v(X(a) + 16, Z(tt), Z(0), "t", CY, kiri=False)
    body += dim_h(X(0), X(a), Z(0) + 20, "a", CY, atas=False)
    body += _garis(g[0], g[1], X(a) + 44, g[1], GR, 0.8, "3 2") + _garis(X(a) + 4, Z(0), X(a) + 44, Z(0), GR, 0.8, "3 2")
    body += _panah(X(a) + 40, Z(0), X(a) + 40, g[1], GR, 1.2) + t(X(a) + 46, (Z(0) + g[1]) / 2 + 4, "z̄", 10.5, GR, "start", "700")
    body += catatan(["Body pelat a × b × t (z = 0…t)", "Body boss ⌀d_B × h_B", "Fixed joint: boss sesumbu di", "  pusat pelat, alas di z = t", "bahan sama (ρ seragam)", "baca: CenterOfMass.z gabungan"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — pusat massa gabungan rakitan pelat dan boss", h=240))
    # T4 — engkol-peluncur
    ox, oy, s4 = 66, 150, 1.55
    r, l, th = 40, 115, math.radians(55)
    ax_, ay_ = ox + r * s4 * math.cos(th), oy - r * s4 * math.sin(th)
    xB = r * math.cos(th) + math.sqrt(l * l - (r * math.sin(th)) ** 2)
    bx_ = ox + xB * s4
    body = _garis(ox - 40, oy + 14, ox + (l + r) * s4 + 20, oy + 14, "rgba(148,163,184,.6)", 1.4)
    for k in range(20):
        x0 = ox - 36 + k * 14
        body += _garis(x0, oy + 14, x0 - 6, oy + 22, "rgba(148,163,184,.35)", 1)
    body += _garis(ox - 40, oy, ox + (l + r) * s4 + 20, oy, "rgba(148,163,184,.3)", 1, "5 4")
    body += _ling(ox, oy, r * s4, "none", "rgba(245,158,11,.35)", 1, "4 4")
    body += f'<rect x="{bx_ - 16}" y="{oy - 12}" width="32" height="26" rx="3" fill="rgba(168,85,247,.25)" stroke="{VI}" stroke-width="1.6"/>'
    body += _garis(ax_, ay_, bx_, oy, CY, 5) + _garis(ox, oy, ax_, ay_, AM, 6)
    for (px, py) in [(ox, oy), (ax_, ay_), (bx_, oy)]:
        body += _ling(px, py, 4.5, "#0a101f", TX, 1.6)
    body += t(ox - 8, oy + 14, "O", 10.5, TX, "end", "700") + t(ax_ - 4, ay_ - 10, "A", 10.5, TX, "end", "700") + t(bx_ + 6, oy - 18, "B", 10.5, TX, "start", "700")
    body += t((ox + ax_) / 2 - 12, (oy + ay_) / 2, "r", 11.5, AM, "end", "700")
    body += t((ax_ + bx_) / 2, (ay_ + oy) / 2 - 12, "l", 11.5, CY, "middle", "700")
    body += f'<path d="M {ox + 24} {oy} A 24 24 0 0 0 {ox + 24 * math.cos(th):.1f} {oy - 24 * math.sin(th):.1f}" fill="none" stroke="{GR}" stroke-width="1.2"/>' + t(ox + 32, oy - 10, "θ", 10.5, GR, "start", "700")
    y_dim = oy + 44
    body += ext(ox, oy + 18, ox, y_dim + 6, GR) + ext(bx_, oy + 18, bx_, y_dim + 6, GR)
    body += dim_h(ox, bx_, y_dim, "x", GR, atas=False)
    body += t(ox, oy - r * s4 - 10, "dasar grounded (rel X)", 9.5, AX, "start")
    body += t(bx_ + 22, oy + 4, "Slider", 9.5, VI, "start", "600")
    body += catatan(["Dasar (grounded): sumbu engkol", "  di titik asal O, rel searah X", "Revolute di O, A, B; Slider B", "Kunci θ engkol (batas sudut)", "baca: x = jarak O → pin B", "  sepanjang X (3 desimal)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — mekanisme engkol-peluncur: posisi peluncur x pada sudut θ", h=236))
    # T5 — sabuk dua puli
    c1x, c2x, cy5 = 62, 232, 112
    r1, r2 = 26, 56
    C5 = c2x - c1x
    beta = math.asin((r2 - r1) / C5)
    pts = []
    n = 30
    a0, a1 = math.pi / 2 + beta, 3 * math.pi / 2 - beta
    for k in range(n + 1):
        ang = a0 + (a1 - a0) * k / n
        pts.append((c1x + r1 * math.cos(ang), cy5 - r1 * math.sin(ang)))
    a0, a1 = -math.pi / 2 - beta, math.pi / 2 + beta
    for k in range(n + 1):
        ang = a0 + (a1 - a0) * k / n
        pts.append((c2x + r2 * math.cos(ang), cy5 - r2 * math.sin(ang)))
    body = poli(pts, "none", VI, 2.4)
    body += _ling(c1x, cy5, r1, "rgba(34,211,238,.15)", CY, 1.5) + _ling(c2x, cy5, r2, "rgba(245,158,11,.15)", AM, 1.5)
    body += _ling(c1x, cy5, 2.5, TX, TX, 1) + _ling(c2x, cy5, 2.5, TX, TX, 1)
    body += t(c1x - 6, cy5 + 14, "O", 9.5, AX, "end") + t(c1x, cy5 + r1 + 16, "⌀D₁ (grounded)", 10, CY, "middle", "600")
    body += t(c2x, cy5 + r2 + 16, "⌀D₂", 10.5, AM, "middle", "700")
    body += t((c1x + c2x) / 2, cy5 - r2 - 24, "L = Σ busur + garis singgung", 10, VI, "middle", "600")
    body += t((c1x + c2x) / 2, cy5 - r2 - 10, "sabuk: Sketch XY", 10, AX, "middle")
    y_dim = cy5 + r2 + 40
    body += ext(c1x, cy5 + 6, c1x, y_dim + 6) + ext(c2x, cy5 + r2 + 22, c2x, y_dim + 6)
    body += dim_h(c1x, c2x, y_dim, "C", GR, atas=False)
    body += catatan(["Puli ⌀D₁ grounded, sumbu di O", "Puli ⌀D₂: Distance/Placement,", "  jarak sumbu C searah X", "Sketch sabuk (XY): 2 busur +", "  2 garis singgung luar", "baca: Shape.Length sabuk"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — transmisi sabuk dua puli: panjang sabuk L", h=236))
    return out


if __name__ == "__main__":
    for i, s in enumerate(gambar(), 1):
        print(11, i, len(s))
