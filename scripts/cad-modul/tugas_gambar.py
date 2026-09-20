# Gambar ilustrasi tugas pemodelan (T1–T5) tiap modul CAD. Teks soal dirakit server per
# NIM, jadi gambar memakai simbol (a, b, r, θ, …) yang sama dengan teks soal, bukan angka.
# Dipakai bangun-modul-1.py dan bangun.py: tugas_gambar(N) → daftar 5 SVG.
import math
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import AX, TX, svg, t  # noqa: E402

CY = "#22d3ee"
AM = "#f59e0b"
GR = "#00e09e"
VI = "#a855f7"
PK = "#ec4899"
RD = "#ef4444"
GN = "#22c55e"
BL = "#3b82f6"


def _panah(x1, y1, x2, y2, warna, w=1):
    ang = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - 7 * math.cos(ang), y2 - 7 * math.sin(ang)
    px, py = 3 * math.sin(ang), -3 * math.cos(ang)
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{warna}" stroke-width="{w}"/>'
            f'<polygon points="{x2:.1f},{y2:.1f} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{warna}"/>')


def dim_h(x1, x2, y, label, warna=AM, atas=True):
    """Dimensi mendatar antara x1..x2 pada garis y; label di atas garis."""
    out = f'<line x1="{x1:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y:.1f}" stroke="{warna}" stroke-width="1"/>'
    out += f'<polygon points="{x1:.1f},{y:.1f} {x1 + 7:.1f},{y - 3:.1f} {x1 + 7:.1f},{y + 3:.1f}" fill="{warna}"/>'
    out += f'<polygon points="{x2:.1f},{y:.1f} {x2 - 7:.1f},{y - 3:.1f} {x2 - 7:.1f},{y + 3:.1f}" fill="{warna}"/>'
    out += t((x1 + x2) / 2, y - 5 if atas else y + 13, label, 11, warna, "middle", "600")
    return out


def dim_v(x, y1, y2, label, warna=AM, kiri=True):
    """Dimensi tegak antara y1..y2 (y1 < y2) pada garis x; label di kiri garis."""
    out = f'<line x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="1"/>'
    out += f'<polygon points="{x:.1f},{y1:.1f} {x - 3:.1f},{y1 + 7:.1f} {x + 3:.1f},{y1 + 7:.1f}" fill="{warna}"/>'
    out += f'<polygon points="{x:.1f},{y2:.1f} {x - 3:.1f},{y2 - 7:.1f} {x + 3:.1f},{y2 - 7:.1f}" fill="{warna}"/>'
    out += t(x - 6 if kiri else x + 6, (y1 + y2) / 2 + 4, label, 11, warna, "end" if kiri else "start", "600")
    return out


def ext(x1, y1, x2, y2, warna=AM):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width=".7" stroke-dasharray="3 2"/>'


def sumbu2d(ox, oy, lx=44, ly=44):
    return (_panah(ox, oy, ox + lx, oy, RD, 1.2) + _panah(ox, oy, ox, oy - ly, GN, 1.2)
            + t(ox + lx + 6, oy + 13, "X", 10, RD, "start", "700") + t(ox - 4, oy - ly - 4, "Y", 10, GN, "end", "700")
            + f'<circle cx="{ox}" cy="{oy}" r="2.5" fill="{TX}"/>' + t(ox - 4, oy + 14, "(0, 0)", 9, AX, "end"))


def catatan(baris, x=330, y0=40, warna=TX):
    return "".join(t(x, y0 + i * 18, s, 11, warna if i == 0 else AX, "start", "600" if i == 0 else "") for i, s in enumerate(baris))


def gambar_tugas(body, label, w=520, h=230):
    return svg(w, h, body, label)


def poli(pts, fill, stroke, w=1.8, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def sumbu3d(cx, cy, s, L=40):
    o = iso(0, 0, 0, cx, cy, s)
    out = ""
    for v, c, n in [((L, 0, 0), RD, "X"), ((0, L, 0), GN, "Y"), ((0, 0, L), BL, "Z")]:
        p = iso(*v, cx, cy, s)
        out += _panah(o[0], o[1], p[0], p[1], c, 1.2) + t(p[0] + 4, p[1] - 3, n, 9, c, "start", "700")
    return out


def lingkar3d(cx0, cy0, z, r, cx, cy, s, n=36):
    return [iso(cx0 + r * math.cos(k / n * 2 * math.pi), cy0 + r * math.sin(k / n * 2 * math.pi), z, cx, cy, s) for k in range(n)]


# ═══════════════════════════ Modul 1 ═══════════════════════════
def _m1():
    out = []
    # T1 persegi panjang
    ox, oy = 70, 180
    a, b = 200, 100
    body = sumbu2d(ox, oy)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += ext(ox, oy - b, ox, oy - b - 22) + ext(ox + a, oy - b, ox + a, oy - b - 22) + dim_h(ox, ox + a, oy - b - 14, "a")
    body += ext(ox + a, oy, ox + a + 24, oy) + ext(ox + a, oy - b, ox + a + 24, oy - b) + dim_v(ox + a + 16, oy - b, oy, "b", kiri=False)
    body += catatan(["Draft Rectangle (Top/XY)", "sudut kiri-bawah di (0, 0)", "Make Face = true", "baca: properti Area"], 330)
    out.append(gambar_tugas(body, "Tugas 1 — persegi panjang a × b"))
    # T2 busur
    cx0, cy0, r = 150, 150, 100
    th = 120
    body = sumbu2d(cx0, cy0, 60, 60)
    body += f'<circle cx="{cx0}" cy="{cy0}" r="{r}" fill="none" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="4 4"/>'
    ex, ey = cx0 + r * math.cos(math.radians(th)), cy0 - r * math.sin(math.radians(th))
    body += f'<path d="M {cx0 + r} {cy0} A {r} {r} 0 0 0 {ex:.1f} {ey:.1f}" fill="none" stroke="{CY}" stroke-width="2.6"/>'
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0 + r}" y2="{cy0}" stroke="{AM}" stroke-width="1"/>'
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{AM}" stroke-width="1" stroke-dasharray="4 3"/>'
    body += t(cx0 + r / 2 + 6, cy0 + 14, "r", 11, AM, "middle", "600")
    body += f'<path d="M {cx0 + 34} {cy0} A 34 34 0 0 0 {cx0 + 34 * math.cos(math.radians(th)):.1f} {cy0 - 34 * math.sin(math.radians(th)):.1f}" fill="none" stroke="{PK}" stroke-width="1.2"/>'
    body += t(cx0 + 30, cy0 - 30, "θ", 12, PK, "middle", "700")
    body += t(cx0 + r + 4, cy0 - 6, "0°", 9.5, AX, "start") + t(ex - 6, ey - 8, "θ", 9.5, AX, "end")
    body += catatan(["Draft Arc, pusat (0, 0)", "radius r, dari 0° ke θ", "berlawanan arah jarum jam", "baca: Shape.Length (busur)"], 330)
    out.append(gambar_tugas(body, "Tugas 2 — busur lingkaran r, sudut 0°…θ"))
    # T3 poligon
    cx0, cy0, R, n = 150, 125, 90, 7
    body = f'<circle cx="{cx0}" cy="{cy0}" r="{R}" fill="none" stroke="rgba(245,158,11,.5)" stroke-width="1" stroke-dasharray="4 3"/>'
    pts = [(cx0 + R * math.cos(math.pi / 2 + k * 2 * math.pi / n), cy0 - R * math.sin(math.pi / 2 + k * 2 * math.pi / n)) for k in range(n)]
    body += poli(pts, "rgba(34,211,238,.16)", CY, 2)
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{pts[0][0]:.1f}" y2="{pts[0][1]:.1f}" stroke="{AM}" stroke-width="1"/>'
    body += t(cx0 + 8, cy0 - R / 2, "R", 11, AM, "start", "600")
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2.5" fill="{TX}"/>' + t(cx0 + 5, cy0 + 14, "(0, 0)", 9, AX, "start")
    for k, (px, py) in enumerate(pts):
        body += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3" fill="{AM}"/>'
    body += catatan(["Draft Polygon, pusat (0, 0)", "n sisi (sesuai soal), radius R", "DrawMode Inscribed (bawaan):", "  sudut tepat pada lingkaran R", "baca: properti Area"], 330)
    out.append(gambar_tugas(body, "Tugas 3 — poligon beraturan n sisi, radius R"))
    # T4 pelat berlubang
    ox, oy, a, b, d = 60, 170, 240, 110, 30
    body = sumbu2d(ox, oy, 36, 36)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    for fx in (0.25, 0.75):
        body += f'<circle cx="{ox + fx * a:.1f}" cy="{oy - b / 2:.1f}" r="{d / 2}" fill="#0a101f" stroke="{CY}" stroke-width="2"/>'
        body += f'<line x1="{ox + fx * a:.1f}" y1="{oy - b / 2 - d:.1f}" x2="{ox + fx * a:.1f}" y2="{oy - b / 2 + d:.1f}" stroke="{RD}" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    body += f'<line x1="{ox + a * 0.25 - d}" y1="{oy - b / 2}" x2="{ox + a * 0.75 + d}" y2="{oy - b / 2}" stroke="{RD}" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    body += dim_h(ox, ox + a, oy - b - 14, "a") + ext(ox, oy - b, ox, oy - b - 22) + ext(ox + a, oy - b, ox + a, oy - b - 22)
    body += dim_h(ox, ox + a / 4, oy + 20, "a/4", atas=False) + dim_h(ox, ox + 3 * a / 4, oy + 42, "3a/4", atas=False)
    body += dim_v(ox + a + 16, oy - b, oy, "b", kiri=False) + dim_v(ox - 14, oy - b, oy - b / 2, "b/2")
    body += t(ox + a * 0.75 + d / 2 + 6, oy - b / 2 - d / 2 - 4, "⌀d", 11, VI, "start", "600")
    body += catatan(["Rectangle a × b + 2 Circle ⌀d", "pusat (a/4, b/2) & (3a/4, b/2)", "Part → Boolean → Cut", "baca: Area face hasil Cut"], 340, 40)
    out.append(gambar_tugas(body, "Tugas 4 — pelat a × b dengan dua lubang ⌀d", h=236))
    # T5 profil L
    ox, oy, W, H, tt = 70, 190, 200, 140, 40
    pts = [(ox, oy), (ox + W, oy), (ox + W, oy - tt), (ox + tt, oy - tt), (ox + tt, oy - H), (ox, oy - H)]
    body = sumbu2d(ox, oy, 30, 30)
    body += poli(pts, "rgba(34,211,238,.16)", CY, 2)
    body += dim_h(ox, ox + W, oy + 18, "W", atas=False) + dim_v(ox - 14, oy - H, oy, "H")
    body += dim_v(ox + W + 14, oy - tt, oy, "t", kiri=False) + dim_h(ox, ox + tt, oy - H - 12, "t")
    gx, gy = ox + 73, oy - 43
    body += f'<circle cx="{gx}" cy="{gy}" r="4.5" fill="{GR}" stroke="#fff" stroke-width="1"/>' + t(gx + 8, gy - 6, "G (x̄, ȳ)", 10.5, GR, "start", "600")
    for (px, py), lab in zip(pts, ["(0, 0)", "(W, 0)", "(W, t)", "(t, t)", "(t, H)", "(0, H)"]):
        if lab == "(t, t)":
            body += t(px + 6, py + 14, lab, 8.5, AX, "start")
        elif lab != "(0, 0)":
            body += t(px + (6 if px > ox + 10 else -6), py + (-6 if py < oy - 10 else 14), lab, 8.5, AX, "start" if px > ox + 10 else "end")
    body += catatan(["Draft Wire tertutup, Make Face", "6 titik searah jarum jam", "baca: Shape.CenterOfMass.x", "(koordinat x titik berat)"], 340, 40)
    out.append(gambar_tugas(body, "Tugas 5 — profil L dan titik beratnya"))
    return out


# ═══════════════════════════ Modul 2 ═══════════════════════════
def _m2():
    out = []
    # T1 offset
    ox, oy, a, b, tt = 80, 180, 180, 90, 22
    body = f'<circle cx="{ox}" cy="{oy}" r="2.5" fill="{TX}"/>' + t(ox + 6, oy - 6, "(0, 0)", 9, AX, "start")
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += f'<rect x="{ox - tt}" y="{oy - b - tt}" width="{a + 2 * tt}" height="{b + 2 * tt}" fill="none" stroke="{AM}" stroke-width="1.8" stroke-dasharray="6 4"/>'
    body += dim_h(ox, ox + a, oy - b - tt - 14, "a") + dim_v(ox + a + tt + 16, oy - b, oy, "b", kiri=False)
    body += dim_v(ox + a * 0.6, oy, oy + tt, "t", kiri=False)
    body += catatan(["Rectangle a × b di (0, 0)", "Draft Offset ke LUAR sejauh t,", "mode Copy → kontur (a+2t)×(b+2t)", "baca: Area kontur hasil offset"], 330)
    out.append(gambar_tugas(body, "Tugas 1 — offset persegi panjang sejauh t"))
    # T2 trimex
    cx0, cy0, r, hh = 150, 130, 88, 32
    c = math.sqrt(r * r - hh * hh)
    body = f'<circle cx="{cx0}" cy="{cy0}" r="{r}" fill="rgba(34,211,238,.08)" stroke="{CY}" stroke-width="2"/>'
    body += f'<line x1="{cx0 - 140}" y1="{cy0 - hh}" x2="{cx0 + 140}" y2="{cy0 - hh}" stroke="rgba(148,163,184,.35)" stroke-width="1" stroke-dasharray="4 4"/>'
    body += f'<line x1="{cx0 - c:.1f}" y1="{cy0 - hh}" x2="{cx0 + c:.1f}" y2="{cy0 - hh}" stroke="{GR}" stroke-width="2.6"/>'
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2.5" fill="{TX}"/>' + t(cx0 + 5, cy0 + 13, "(0, 0)", 9, AX, "start")
    body += dim_v(cx0 + 4, cy0 - hh, cy0, "h", kiri=False)
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0 - r * 0.7:.1f}" y2="{cy0 + r * 0.714:.1f}" stroke="{AM}" stroke-width="1"/>' + t(cx0 - r * 0.4, cy0 + r * 0.55, "r", 11, AM, "end", "600")
    body += t(cx0, cy0 - hh - 8, "ruas tersisa (tali busur)", 9.5, GR, "middle")
    body += t(cx0 - 125, cy0 - hh + 14, "dipotong", 8.5, RD, "start") + t(cx0 + 125, cy0 - hh + 14, "dipotong", 8.5, RD, "end")
    body += catatan(["Circle r, pusat (0, 0)", "Line mendatar y = h dari x = −80…80", "Draft Trimex: potong kedua ujung", "  di perpotongan dengan lingkaran", "baca: Shape.Length ruas tersisa"], 320)
    out.append(gambar_tugas(body, "Tugas 2 — trim garis oleh lingkaran"))
    # T3 polar array
    cx0, cy0, R, n, d = 150, 125, 85, 8, 18
    body = f'<circle cx="{cx0}" cy="{cy0}" r="{R}" fill="none" stroke="rgba(245,158,11,.5)" stroke-width="1" stroke-dasharray="4 3"/>'
    for k in range(n):
        px, py = cx0 + R * math.cos(k * 2 * math.pi / n), cy0 - R * math.sin(k * 2 * math.pi / n)
        body += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{d / 2}" fill="#0a101f" stroke="{GR if k == 0 else CY}" stroke-width="2"/>'
    p0 = (cx0 + R, cy0)
    p1 = (cx0 + R * math.cos(2 * math.pi / n), cy0 - R * math.sin(2 * math.pi / n))
    body += f'<line x1="{p0[0]}" y1="{p0[1]}" x2="{p1[0]:.1f}" y2="{p1[1]:.1f}" stroke="{PK}" stroke-width="1.6"/>' + t(p1[0] + 10, p1[1] - 4, "jarak tetangga", 9.5, PK, "start", "600")
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0 + R}" y2="{cy0}" stroke="{AM}" stroke-width="1"/>' + t(cx0 + R / 2, cy0 - 6, "R", 11, AM, "middle", "600")
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2.5" fill="{TX}"/>' + t(cx0 - 5, cy0 + 14, "(0, 0)", 9, AX, "end")
    body += t(cx0 + R + d / 2 + 4, cy0 + 14, "⌀d (induk)", 9.5, GR, "start")
    body += catatan(["Circle ⌀d berpusat di (R, 0)", "Draft PolarArray: n salinan, 360°,", "  pusat (0, 0, 0)", "baca: Std Measure Distance antara", "  dua pusat lubang bertetangga"], 320)
    out.append(gambar_tugas(body, "Tugas 3 — pola lubang PolarArray"))
    # T4 ortho array
    ox, oy, a, b, nx, d = 60, 180, 250, 95, 4, 22
    body = sumbu2d(ox, oy, 30, 30)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    jarak = a / (nx + 1)
    for k in range(nx):
        body += f'<circle cx="{ox + jarak * (k + 1):.1f}" cy="{oy - b / 2}" r="{d / 2}" fill="#0a101f" stroke="{GR if k == 0 else CY}" stroke-width="2"/>'
    body += dim_h(ox, ox + a, oy - b - 14, "a") + dim_v(ox + a + 16, oy - b, oy, "b", kiri=False)
    body += dim_h(ox, ox + jarak, oy + 16, "a/(n+1)", atas=False) + dim_h(ox + jarak, ox + 2 * jarak, oy + 16, "a/(n+1)", atas=False)
    body += dim_v(ox - 14, oy - b, oy - b / 2, "b/2")
    body += catatan(["Rectangle a × b, Circle ⌀d induk", "  di (a/(n+1), b/2)", "OrthoArray: n lubang sebaris,", "  interval X = a/(n+1)", "Cut (Rectangle − Array); baca: Area"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — pelat dengan deret lubang OrthoArray", h=236))
    # T5 trapesium berlayer
    ox, oy, W, H, s_ = 70, 180, 220, 110, 70
    pts = [(ox, oy), (ox + W, oy), (ox + W - s_, oy - H), (ox, oy - H)]
    body = sumbu2d(ox, oy, 30, 30)
    body += poli(pts, "rgba(34,211,238,.16)", CY, 2)
    body += dim_h(ox, ox + W, oy + 18, "W", atas=False) + dim_v(ox - 14, oy - H, oy, "H") + dim_h(ox + W - s_, ox + W, oy - H - 12, "s")
    rr = 40
    th = math.atan2(H, s_)
    body += f'<path d="M {ox + W - rr} {oy} A {rr} {rr} 0 0 1 {ox + W - rr * math.cos(th):.1f} {oy - rr * math.sin(th):.1f}" fill="none" stroke="{PK}" stroke-width="1.4"/>'
    body += t(ox + W - rr - 8, oy - 14, "θ", 12, PK, "end", "700")
    body += t(ox + W - s_ / 2 + 14, oy - H / 2, "sisi miring", 9.5, AX, "start")
    body += catatan(["Layer Kontur: Draft Wire tertutup", "  (0,0)→(W,0)→(W−s,H)→(0,H)", "Layer Dimensi: dimensi W, H,", "  dan ANGULAR alas–sisi miring", "baca: nilai sudut θ (°)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — trapesium berlayer dengan dimensi angular"))
    return out


# ═══════════════════════════ Modul 3 ═══════════════════════════
def _m3():
    out = []
    # T1 move copy
    ox, oy, a, b, dx, dy = 60, 190, 130, 70, 110, 80
    body = sumbu2d(ox, oy, 30, 30)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += f'<rect x="{ox + dx}" y="{oy - b - dy}" width="{a}" height="{b}" fill="rgba(0,224,158,.12)" stroke="{GR}" stroke-width="1.8" stroke-dasharray="6 4"/>'
    body += _panah(ox, oy, ox + dx, oy - dy, GR, 1.6)
    body += t(ox + dx / 2 + 12, oy - dy / 2 + 4, "jarak = √(dx² + dy²)", 10, GR, "start", "600")
    body += dim_h(ox, ox + dx, oy + 18, "dx", atas=False) + dim_v(ox + dx + a + 14, oy - b - dy, oy - dy, "dy", kiri=False)
    body += t(ox + a * 0.7, oy - b * 0.3 + 4, "a × b", 11, CY, "middle", "600") + dim_v(ox - 14, oy - b, oy, "b")
    body += catatan(["Rectangle a × b di (0, 0)", "Draft Move, mode Copy,", "  vektor (dx, dy) relatif", "baca: jarak sudut asal ke", "  sudut salinan (Measure Distance)"], 350, 40)
    out.append(gambar_tugas(body, "Tugas 1 — Move (Copy) persegi panjang"))
    # T2 rotate copy
    cx0, cy0, L, th = 90, 170, 200, 50
    ex, ey = cx0 + L * math.cos(math.radians(th)), cy0 - L * math.sin(math.radians(th))
    body = sumbu2d(cx0, cy0, 30, 30)
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0 + L}" y2="{cy0}" stroke="{CY}" stroke-width="2.6"/>'
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{AM}" stroke-width="2.6"/>'
    body += f'<line x1="{cx0 + L}" y1="{cy0}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{GR}" stroke-width="1.6" stroke-dasharray="5 3"/>'
    body += f'<path d="M {cx0 + 50} {cy0} A 50 50 0 0 0 {cx0 + 50 * math.cos(math.radians(th)):.1f} {cy0 - 50 * math.sin(math.radians(th)):.1f}" fill="none" stroke="{PK}" stroke-width="1.3"/>'
    body += t(cx0 + 58, cy0 - 18, "θ", 12, PK, "start", "700")
    body += t(cx0 + L / 2, cy0 + 16, "L (garis asal)", 10, CY, "middle") + t(ex + 8, ey + 4, "salinan diputar", 10, AM, "start")
    body += t((cx0 + L + ex) / 2 + 10, (cy0 + ey) / 2 + 4, "jarak ujung", 10, GR, "start", "600")
    for px, py in [(cx0 + L, cy0), (ex, ey)]:
        body += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.5" fill="{GR}"/>'
    body += catatan(["Line (0, 0) → (L, 0)", "Draft Rotate, Copy: pusat (0, 0),", "  sudut acuan 0°, rotasi θ", "baca: jarak kedua ujung bebas", "  = 2·L·sin(θ/2)"], 350, 40)
    out.append(gambar_tugas(body, "Tugas 2 — Rotate (Copy) garis di titik asal"))
    # T3 scale copy
    cx0, cy0, R, k = 150, 125, 55, 1.6
    for rad, c, fill in [(R * k, AM, "none"), (R, CY, "rgba(34,211,238,.16)")]:
        pts = [(cx0 + rad * math.cos(math.pi / 2 + j * math.pi / 3), cy0 - rad * math.sin(math.pi / 2 + j * math.pi / 3)) for j in range(6)]
        body_piece = poli(pts, fill, c, 2, "6 4" if c == AM else "")
        body = body_piece if c == AM else body + body_piece
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2.5" fill="{TX}"/>' + t(cx0 + 5, cy0 + 13, "(0, 0)", 9, AX, "start")
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0}" y2="{cy0 - R}" stroke="{CY}" stroke-width="1"/>' + t(cx0 - 6, cy0 - R / 2, "R", 11, CY, "end", "600")
    body += t(cx0 + R * k * 0.6, cy0 - R * k * 0.75, "k·R", 11, AM, "start", "600")
    body += catatan(["Polygon 6 sisi, inscribed,", "  radius R, pusat (0, 0), Make Face", "Draft Scale, Copy: pusat (0, 0),", "  faktor seragam k (Uniform)", "baca: Area heksagon hasil skala"], 330)
    out.append(gambar_tugas(body, "Tugas 3 — Scale (Copy) heksagon"))
    # T4 segitiga + lingkaran di titik berat
    ox, oy, a, c, h, r = 60, 195, 240, 90, 130, 18
    A, B, C = (ox, oy), (ox + a, oy), (ox + c, oy - h)
    G = ((A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3)
    body = sumbu2d(ox, oy, 30, 30)
    body += poli([A, B, C], "rgba(34,211,238,.16)", CY, 2)
    body += f'<circle cx="{G[0]:.1f}" cy="{G[1]:.1f}" r="{r}" fill="rgba(245,158,11,.2)" stroke="{AM}" stroke-width="2"/>'
    body += f'<circle cx="{G[0]:.1f}" cy="{G[1]:.1f}" r="3" fill="{GR}"/>' + t(G[0], G[1] + r + 12, "G = titik berat", 9.5, GR, "middle", "600")
    body += f'<line x1="{C[0]}" y1="{C[1]}" x2="{G[0]:.1f}" y2="{G[1]:.1f}" stroke="{GR}" stroke-width="1.4" stroke-dasharray="4 3"/>'
    body += t(B[0] + 6, B[1] + 14, "B (a, 0)", 9.5, AX, "end") + t(C[0], C[1] - 8, "C (c, h)", 9.5, AX, "middle") + t(A[0] - 4, A[1] + 26, "A", 9.5, AX, "end")
    body += t(G[0] + r + 4, G[1] - 4, "r", 10.5, AM, "start", "600")
    body += catatan(["Draft Wire A–B–C tertutup, Make Face", "Circle radius r berpusat TEPAT di G", "  (Shape.CenterOfMass / rata-rata", "  A, B, C; atau Draft Point + snap)", "baca: jarak C ke pusat lingkaran"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — lingkaran di titik berat segitiga"))
    # T5 rotasi persegi panjang
    ox, oy, a, b, th = 100, 200, 200, 70, 30
    rad = math.radians(th)
    pts = [(0, 0), (a, 0), (a, b), (0, b)]
    rot = [(ox + x * math.cos(rad) - y * math.sin(rad), oy - (x * math.sin(rad) + y * math.cos(rad))) for x, y in pts]
    body = sumbu2d(ox, oy, 30, 30)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="none" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="5 4"/>'
    body += poli(rot, "rgba(34,211,238,.16)", CY, 2)
    ymax = oy - (a * math.sin(rad) + b * math.cos(rad))
    xmin = ox - b * math.sin(rad)
    body += f'<line x1="{xmin - 20}" y1="{ymax:.1f}" x2="{ox + a * math.cos(rad) + 20:.1f}" y2="{ymax:.1f}" stroke="{GR}" stroke-width="1.2" stroke-dasharray="5 3"/>'
    body += t(ox + a * math.cos(rad) + 24, ymax + 4, "YMax", 11, GR, "start", "600")
    body += f'<path d="M {ox + 50} {oy} A 50 50 0 0 0 {ox + 50 * math.cos(rad):.1f} {oy - 50 * math.sin(rad):.1f}" fill="none" stroke="{PK}" stroke-width="1.3"/>' + t(ox + 56, oy - 14, "θ", 12, PK, "start", "700")
    body += t(ox + a / 2 + 40, oy + 28, "posisi semula a × b (putus)", 9.5, AX, "middle")
    body += catatan(["Rectangle a × b di (0, 0), Make Face", "Draft Rotate TANPA Copy: pusat (0, 0),", "  rotasi θ (sudut kiri-bawah tetap)", "baca: Shape.BoundBox.YMax", "  = a·sin θ + b·cos θ"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — persegi panjang diputar θ dan kotak pembatasnya", h=240))
    return out


# ═══════════════════════════ Modul 4 ═══════════════════════════
def _m4():
    out = []
    # T1 profil poros bertingkat
    ox, oy = 60, 180
    ls, hs = [70, 90, 60], [40, 62, 48]
    xs = [ox]
    for l in ls:
        xs.append(xs[-1] + l)
    pts = [(ox, oy), (ox, oy - hs[0]), (xs[1], oy - hs[0]), (xs[1], oy - hs[1]), (xs[2], oy - hs[1]), (xs[2], oy - hs[2]), (xs[3], oy - hs[2]), (xs[3], oy)]
    body = poli(pts, "rgba(34,211,238,.16)", CY, 2)
    body += f'<line x1="{ox - 10}" y1="{oy}" x2="{xs[3] + 10}" y2="{oy}" stroke="{RD}" stroke-width=".8" stroke-dasharray="8 3 2 3"/>'
    for i, lab in enumerate(["l₁", "l₂", "l₃"]):
        body += dim_h(xs[i], xs[i + 1], oy + 18, lab, atas=False)
    for i, lab in enumerate(["h₁", "h₂", "h₃"]):
        body += dim_v((xs[i] + xs[i + 1]) / 2, oy - hs[i], oy, lab, GR, kiri=False)
    body += t(ox - 6, oy + 12, "(0, 0)", 9, AX, "end") + t(xs[3] + 14, oy + 4, "sumbu poros", 9, RD, "start")
    body += catatan(["Draft Wire 8 titik (Make Face)", "Layer Dimensi: 3 dimensi", "  BERANTAI l₁, l₂, l₃ + 3 vertikal", "baca: Area profil = Σ lᵢ·hᵢ"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — setengah profil poros bertingkat dengan dimensi berantai"))
    # T2 sektor
    cx0, cy0, r, th = 110, 190, 150, 55
    ex, ey = cx0 + r * math.cos(math.radians(th)), cy0 - r * math.sin(math.radians(th))
    body = f'<path d="M {cx0} {cy0} L {cx0 + r} {cy0} A {r} {r} 0 0 0 {ex:.1f} {ey:.1f} Z" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    am = math.radians(th / 2)
    body += f'<line x1="{cx0}" y1="{cy0}" x2="{cx0 + r * math.cos(am):.1f}" y2="{cy0 - r * math.sin(am):.1f}" stroke="{AM}" stroke-width="1"/>' + t(cx0 + r * math.cos(am) + 4, cy0 - r * math.sin(am) + 16, "R (dimensi radius)", 10, AM, "start", "600")
    body += f'<path d="M {cx0 + 44} {cy0} A 44 44 0 0 0 {cx0 + 44 * math.cos(math.radians(th)):.1f} {cy0 - 44 * math.sin(math.radians(th)):.1f}" fill="none" stroke="{PK}" stroke-width="1.4"/>' + t(cx0 + 52, cy0 - 14, "θ (angular)", 10.5, PK, "start", "700")
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2.5" fill="{TX}"/>' + t(cx0 - 4, cy0 + 14, "(0, 0)", 9, AX, "end")
    body += catatan(["Draft Arc r, 0°…θ, pusat (0, 0)", "+ 2 Line radial → Upgrade → face", "Dimensi RADIUS pada busur (R…)", "Dimensi ANGULAR dua garis radial", "baca: Area sektor = ½·r²·θ"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — sektor lingkaran dengan dimensi R dan angular"))
    # T3 pelat tiga lubang baseline
    ox, oy, a, b, d = 60, 176, 230, 120, 18
    L1, L2, L3 = (ox + 35, oy - 35), (ox + 120, oy - 95), (ox + 205, oy - 95)
    body = sumbu2d(ox, oy, 24, 24)
    body += f'<rect x="{ox}" y="{oy - b}" width="{a}" height="{b}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    for (px, py), lab in zip([L1, L2, L3], ["L1", "L2", "L3"]):
        body += f'<circle cx="{px}" cy="{py}" r="{d / 2}" fill="#0a101f" stroke="{CY}" stroke-width="2"/>' + t(px, py - d / 2 - 4, lab, 9, AX, "middle")
    body += f'<line x1="{L1[0]}" y1="{L1[1]}" x2="{L3[0]}" y2="{L3[1]}" stroke="{GR}" stroke-width="1.4" stroke-dasharray="4 3"/>' + t((L1[0] + L3[0]) / 2 + 8, (L1[1] + L3[1]) / 2 + 12, "jarak L1–L3", 10, GR, "start", "600")
    body += dim_h(ox, L1[0], oy + 16, "x₁", atas=False) + dim_h(ox, L2[0], oy + 30, "x₂", atas=False) + dim_h(ox, L3[0], oy + 44, "x₃", atas=False)
    body += dim_v(ox - 14, L1[1], oy, "y₁") + dim_v(ox - 28, L3[1], oy, "y₃")
    body += t(ox + a - 6, oy - 8, "3 × ⌀d tembus", 9.5, VI, "end", "600")
    body += catatan(["Rectangle + 3 Circle ⌀d", "  (L1, L2, L3)", "Dimensi BASELINE X dan Y", "  dari sudut kiri-bawah; ⌀d", "Draft Text “3 × ⌀d tembus”", "baca: jarak pusat L1 ke L3"], 334, 36)
    out.append(gambar_tugas(body, "Tugas 3 — pelat tiga lubang dengan dimensi baseline dan teks", h=250))
    # T4 slot
    ox, oy, L, d = 90, 130, 200, 60
    r = d / 2
    body = f'<path d="M {ox} {oy - r} H {ox + L} A {r} {r} 0 0 1 {ox + L} {oy + r} H {ox} A {r} {r} 0 0 1 {ox} {oy - r} Z" fill="rgba(0,224,158,.14)" stroke="{GR}" stroke-width="2.2"/>'
    body += f'<rect x="{ox}" y="{oy - r}" width="{L}" height="{d}" fill="none" stroke="rgba(148,163,184,.35)" stroke-width="1" stroke-dasharray="4 3"/>'
    for px in (ox, ox + L):
        body += f'<circle cx="{px}" cy="{oy}" r="{r}" fill="none" stroke="rgba(148,163,184,.35)" stroke-width="1" stroke-dasharray="4 3"/>' + f'<circle cx="{px}" cy="{oy}" r="2.5" fill="{TX}"/>'
    body += t(ox - 6, oy + 14, "(0, 0)", 9, AX, "end")
    body += dim_h(ox, ox + L, oy - r - 16, "L") + dim_h(ox - r, ox + L + r, oy + r + 24, "L + d", atas=False)
    body += f'<line x1="{ox + L}" y1="{oy}" x2="{ox + L + r * math.cos(0.6):.1f}" y2="{oy + r * math.sin(0.6):.1f}" stroke="{AM}" stroke-width="1"/>' + t(ox + L + r * math.cos(0.6) + 4, oy + r * math.sin(0.6) + 8, "R = d/2", 10.5, AM, "start", "600")
    body += catatan(["Rectangle L × d (sumbu y = 0)", "+ 2 Circle ⌀d di (0,0) & (L,0)", "Part → Boolean → Union (Fuse)", "Dimensi L, L + d, R;", "  AnnotationStyle “ISO-A4”", "baca: Area slot"], 334, 40)
    out.append(gambar_tugas(body, "Tugas 4 — slot (obround) hasil Fuse dengan gaya ISO-A4"))
    # T5 pelat chamfer + label + TechDraw
    ox, oy, a, b, c, d = 50, 195, 210, 120, 40, 34
    pts = [(ox, oy), (ox + a, oy), (ox + a, oy - b + c), (ox + a - c, oy - b), (ox, oy - b)]
    body = sumbu2d(ox, oy, 24, 24)
    body += poli(pts, "rgba(34,211,238,.16)", CY, 2)
    body += f'<circle cx="{ox + a / 2}" cy="{oy - b / 2}" r="{d / 2}" fill="#0a101f" stroke="{CY}" stroke-width="2"/>'
    body += dim_h(ox, ox + a, oy + 18, "a", atas=False) + dim_v(ox - 14, oy - b, oy, "b") + dim_h(ox + a - c, ox + a, oy - b - 12, "c") + dim_v(ox + a + 14, oy - b, oy - b + c, "c", kiri=False)
    body += t(ox + a / 2 + d / 2 + 5, oy - b / 2 + 4, "⌀d", 10.5, VI, "start", "600")
    body += f'<polyline points="{ox + a - c / 2 + 4},{oy - b + c / 2 - 4} {ox + a - c - 30},{oy - b - 30} {ox + a - c - 60},{oy - b - 30}" fill="none" stroke="{GR}" stroke-width="1"/>' + t(ox + a - c - 64, oy - b - 26, "Label “C… × 45°”", 9.5, GR, "end", "600")
    rr = 26
    body += f'<path d="M {ox + a - rr} {oy - b + c} A {rr} {rr} 0 0 1 {ox + a - rr * 0.707:.1f} {oy - b + c - rr * 0.707:.1f}" fill="none" stroke="{PK}" stroke-width="1.2"/>' + t(ox + a - rr - 6, oy - b + c - 10, "45°", 9.5, PK, "end", "700")
    body += f'<rect x="372" y="140" width="88" height="62" fill="rgba(255,255,255,.03)" stroke="{AX}" stroke-width="1"/><rect x="384" y="150" width="46" height="26" fill="rgba(34,211,238,.15)" stroke="{CY}"/>' + t(416, 194, "TechDraw A4", 9, AX, "middle")
    body += catatan(["Wire a × b, chamfer c × 45°", "Circle ⌀d di (a/2, b/2) → Cut", "Dimensi a, b, c, 45°, ⌀d", "Label berpanah ke chamfer", "TechDraw A4 + 1 View", "baca: Area face pelat"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — pelat berpinggul dengan label dan lembar TechDraw", h=246))
    return out


# ═══════════════════════════ Modul 5 ═══════════════════════════
def _m5():
    out = []
    # T1 balok Pad
    cx, cy, s = 150, 180, 1.1
    a, b, h = 120, 80, 60
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, h, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = sumbu3d(cx, cy, s, 50)
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    body += poli(dasar, "rgba(245,158,11,.14)", AM, 1.4, "5 3")
    p = iso(a / 2, -6, 0, cx, cy, s)
    body += t(p[0], p[1] + 14, "Sketch XY: a × b", 10, AM, "middle", "600")
    p = iso(a, 0, h / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "Pad h", 11, CY, "start", "600")
    p = iso(a / 2, 0, 0, cx, cy, s)
    q = iso(a, b / 2, 0, cx, cy, s)
    body += t(q[0] + 12, q[1] + 4, "b", 11, AM, "start", "600")
    body += catatan(["Body → Sketch (XY) persegi panjang", "  a × b, fully constrained, sudut di (0,0)", "Pad: Length h", "baca: Body.Shape.Volume = a·b·h"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — balok Pad a × b × h"))
    # T2 bus Revolution
    cx, cy, s = 140, 185, 1.15
    ri, ro, h = 30, 60, 90
    n = 40
    body = ""
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        body += poli([iso(ro * math.cos(t0), ro * math.sin(t0), 0, cx, cy, s), iso(ro * math.cos(t1), ro * math.sin(t1), 0, cx, cy, s), iso(ro * math.cos(t1), ro * math.sin(t1), h, cx, cy, s), iso(ro * math.cos(t0), ro * math.sin(t0), h, cx, cy, s)], "rgba(34,211,238,.07)", "rgba(34,211,238,.25)", 0.6)
    body += poli(lingkar3d(0, 0, h, ro, cx, cy, s), "rgba(34,211,238,.2)", CY, 1.4) + poli(lingkar3d(0, 0, h, ri, cx, cy, s), "#0a101f", CY, 1.2)
    prof = [iso(x, 0, z, cx, cy, s) for x, z in [(ri, 0), (ro, 0), (ro, h), (ri, h)]]
    body += poli(prof, "rgba(245,158,11,.35)", AM, 2)
    z0, z1 = iso(0, 0, -10, cx, cy, s), iso(0, 0, h + 18, cx, cy, s)
    body += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="{RD}" stroke-width="1.2" stroke-dasharray="8 3 2 3"/>' + t(z1[0] + 6, z1[1], "sumbu Z", 9.5, RD, "start")
    p = iso(ro + 4, 0, h / 2, cx, cy, s)
    body += t(p[0] + 6, p[1] - 16, "profil XZ", 10, AM, "start", "600")
    p = iso(ri, 0, 0, cx, cy, s); q = iso(ro, 0, 0, cx, cy, s)
    body += t(p[0], p[1] + 16, "rᵢ", 10.5, AM, "middle", "600") + t(q[0] + 8, q[1] + 16, "rₒ", 10.5, AM, "middle", "600")
    p = iso(ro, 0, h, cx, cy, s); q = iso(ro, 0, 0, cx, cy, s)
    body += t((iso(ri, 0, h / 2, cx, cy, s)[0] + iso(ro, 0, h / 2, cx, cy, s)[0]) / 2, (p[1] + q[1]) / 2 + 4, "h", 11, TX, "middle", "700")
    body += catatan(["Body → Sketch (XZ): persegi panjang", "  rᵢ…rₒ × h (tidak memotong sumbu)", "Revolution 360° terhadap sumbu Z", "baca: Volume = π(rₒ² − rᵢ²)·h"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — bus berongga dari Revolution"))
    # T3 siku pipa
    cx, cy, s = 150, 200, 1.3
    R, r = 90, 14
    n = 16
    body = ""
    for i in range(n):
        t0 = i / n * math.pi / 2
        ring = []
        for k in range(14):
            ph = k / 14 * 2 * math.pi
            ring.append(iso(R * math.cos(t0) + r * math.cos(ph) * math.cos(t0), r * math.sin(ph), R * math.sin(t0) + r * math.cos(ph) * math.sin(t0), cx, cy, s))
        body += poli(ring, "rgba(34,211,238,.10)", "rgba(34,211,238,.4)", 0.8)
    ujung = [iso(R + r * math.cos(k / 24 * 2 * math.pi), r * math.sin(k / 24 * 2 * math.pi), 0, cx, cy, s) for k in range(24)]
    body += poli(ujung, "rgba(245,158,11,.35)", AM, 1.8)
    jalur = [iso(R * math.cos(k / 40 * math.pi / 2), 0, R * math.sin(k / 40 * math.pi / 2), cx, cy, s) for k in range(41)]
    body += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in jalur)}" fill="none" stroke="{PK}" stroke-width="1.6" stroke-dasharray="6 4"/>'
    o = iso(0, 0, 0, cx, cy, s); e1 = iso(R, 0, 0, cx, cy, s)
    body += f'<line x1="{o[0]:.1f}" y1="{o[1]:.1f}" x2="{e1[0]:.1f}" y2="{e1[1]:.1f}" stroke="{AX}" stroke-width=".8" stroke-dasharray="3 3"/>' + t((o[0] + e1[0]) / 2, (o[1] + e1[1]) / 2 + 14, "R", 11, PK, "middle", "600")
    body += f'<circle cx="{o[0]:.1f}" cy="{o[1]:.1f}" r="2.5" fill="{TX}"/>' + t(o[0] - 5, o[1] + 12, "(0, 0)", 9, AX, "end")
    body += t(e1[0] + r * s + 6, e1[1] + 4, "profil ⌀2r (XY)", 10, AM, "start", "600")
    p = iso(R * 0.72, 0, R * 0.72, cx, cy, s)
    body += t(p[0] + 8, p[1] - 8, "lintasan busur (XZ)", 10, PK, "start", "600")
    body += catatan(["Sketch lintasan (XZ): busur ¼", "  lingkaran radius R, pusat (0,0),", "  dari (R,0) ke (0,R)", "Sketch profil (XY): Circle r di (R, 0)", "Additive Pipe (profil sepanjang busur)", "baca: Volume = πr² × (πR/2)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — siku pipa dari Additive Pipe", h=240))
    # T4 balok berlubang + fillet
    cx, cy, s = 150, 185, 1.05
    a, b, h, d, f = 140, 90, 50, 30, 18
    def kont(z):
        pts = []
        for (px, py, sx, sy, a0) in [(f, 0, 1, 1, math.pi * 1.5), (a - f, f, 1, 1, 0), (a - f, b - f, 1, 1, math.pi * 0.5), (f, b - f, 1, 1, math.pi)]:
            pass
        # kontur persegi panjang dengan sudut dibulatkan radius f
        segs = [(a - f, f, -math.pi / 2, 0), (a - f, b - f, 0, math.pi / 2), (f, b - f, math.pi / 2, math.pi), (f, f, math.pi, 1.5 * math.pi)]
        for (ccx, ccy, a0, a1) in segs:
            for k in range(7):
                ang = a0 + (a1 - a0) * k / 6
                pts.append(iso(ccx + f * math.cos(ang), ccy + f * math.sin(ang), z, cx, cy, s))
        return pts
    bawah, atas = kont(0), kont(h)
    body = sumbu3d(cx, cy, s, 46)
    for i in range(len(bawah)):
        j = (i + 1) % len(bawah)
        body += poli([bawah[i], bawah[j], atas[j], atas[i]], "rgba(34,211,238,.08)", "rgba(34,211,238,.45)", 0.7)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.6)
    body += poli(lingkar3d(a / 2, b / 2, h, d / 2, cx, cy, s), "#0a101f", VI, 1.4)
    p = iso(a / 2, b / 2, h, cx, cy, s)
    body += f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{p[0] - 40:.1f}" y2="52" stroke="{VI}" stroke-width=".8" stroke-dasharray="3 2"/>' + t(p[0] - 44, 56, "Pocket ⌀d", 10, VI, "end", "600")
    p = iso(a, 0, h / 2, cx, cy, s)
    body += t(p[0] + 10, p[1] + 4, "Fillet f (rusuk vertikal)", 10, GR, "start", "600")
    p = iso(a / 2, -4, 0, cx, cy, s)
    body += t(p[0], p[1] + 16, "Sketch XY: a × b → Pad h", 10, AM, "middle", "600")
    body += catatan(["Sketch (XY) a × b → Pad h", "Sketch di muka atas: Circle ⌀d", "  di (a/2, b/2) → Pocket Through all", "Fillet radius f pada 4 rusuk VERTIKAL", "baca: Body.Shape.Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — balok berlubang dengan fillet rusuk vertikal", h=236))
    # T5 poros bertingkat + chamfer
    cx, cy, s = 130, 205, 1.0
    R1, R2, L1, L2, c = 24, 40, 60, 90, 8
    body = ""
    for (rr, z0, z1) in [(R1, 0, L1), (R2, L1, L1 + L2 - c)]:
        for i in range(40):
            t0, t1 = i / 40 * 2 * math.pi, (i + 1) / 40 * 2 * math.pi
            body += poli([iso(rr * math.cos(t0), rr * math.sin(t0), z0, cx, cy, s), iso(rr * math.cos(t1), rr * math.sin(t1), z0, cx, cy, s), iso(rr * math.cos(t1), rr * math.sin(t1), z1, cx, cy, s), iso(rr * math.cos(t0), rr * math.sin(t0), z1, cx, cy, s)], "rgba(34,211,238,.07)", "rgba(34,211,238,.25)", 0.6)
        body += poli(lingkar3d(0, 0, z1, rr, cx, cy, s), "rgba(34,211,238,.18)", CY, 1.2)
    body += poli(lingkar3d(0, 0, L1 + L2, R2 - c, cx, cy, s), "rgba(34,211,238,.25)", PK, 1.6)
    prof = [iso(x, 0, z, cx, cy, s) for x, z in [(0, 0), (R1, 0), (R1, L1), (R2, L1), (R2, L1 + L2 - c), (R2 - c, L1 + L2), (0, L1 + L2)]]
    body += poli(prof, "rgba(245,158,11,.30)", AM, 2)
    z0, z1 = iso(0, 0, -10, cx, cy, s), iso(0, 0, L1 + L2 + 16, cx, cy, s)
    body += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="{RD}" stroke-width="1.2" stroke-dasharray="8 3 2 3"/>' + t(z1[0] - 6, z1[1], "sumbu Z", 9.5, RD, "end")
    p = iso(R2 + 2, 0, L1 + L2 - c / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] - 4, "Chamfer c × 45°", 10, PK, "start", "600")
    p = iso(R1, 0, L1 / 2, cx, cy, s); q = iso(R2, 0, L1 + L2 / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "⌀d₁ × L₁", 10, AM, "start", "600") + t(q[0] + 8, q[1] + 4, "⌀d₂ × L₂", 10, AM, "start", "600")
    body += catatan(["Sketch (XZ): setengah profil tertutup", "  menempel sumbu Z (x = 0)", "Revolution 360° → poros pejal", "Chamfer c pada rusuk ujung atas", "baca: Body.Shape.Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — poros bertingkat dari satu Revolution dengan chamfer ujung", h=250))
    return out


def tugas_gambar(N):
    """Lima SVG gambar acuan tugas modul N. Modul 1-5 di berkas ini; Modul 6 dst di tugas_gambar_N.py (fungsi gambar())."""
    if N >= 6:
        import importlib
        return importlib.import_module(f"tugas_gambar_{N}").gambar()
    return {1: _m1, 2: _m2, 3: _m3, 4: _m4, 5: _m5}[N]()


def tugas_gambar_html(N):
    """Pembungkus untuk kartu tugas: <div class="tugas-gambar" id="gambar-cK">svg + keterangan</div>."""
    out = []
    for k, s in enumerate(tugas_gambar(N), 1):
        lab = re.sub(r"^Tugas \d+ — ", "", re.search(r'aria-label="([^"]*)"', s).group(1))
        out.append(f'<div class="tugas-gambar" id="gambar-c{k}">{s}<div class="tugas-gambar-ket">📐 Gambar acuan: {lab}. Simbol mengikuti teks tugas; angka dimensi milik Anda muncul setelah masuk.</div></div>')
    return out


if __name__ == "__main__":
    for N in [int(x) for x in sys.argv[1:]] or [1, 2, 3, 4, 5]:
        for i, s in enumerate(tugas_gambar(N), 1):
            print(N, i, len(s))
