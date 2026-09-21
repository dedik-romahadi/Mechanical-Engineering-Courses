# Gambar acuan simbolik lima tugas Modul 8 Pemodelan CAD (FEM Workbench + CalculiX):
# kantilever statik (massa), kantilever defleksi δ, batang tarik σ = F/A, batang termal
# q = kAΔT/L, kantilever frekuensi f₁. Simbol mengikuti teks tugas backend; angka
# varian per NIM tidak digambar. Dipakai tugas_gambar.tugas_gambar(8) / periksa_*.py.
import math
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import (AM, AX, BL, CY, GN, GR, PK, RD, TX, VI, _panah, catatan, dim_h, dim_v, ext, gambar_tugas,  # noqa: E402,F401
                          iso, lingkar3d, poli, sumbu2d, sumbu3d, t)


def _geser(bag, teks, dx, dy):
    """Geser <text> berisi tepat `teks` (keluaran helper bersama, mis. sumbu3d) sejauh (dx, dy)."""
    return re.sub(rf'<text x="([\d.\-]+)" y="([\d.\-]+)"([^>]*)>{re.escape(teks)}</text>',
                  lambda m: f'<text x="{float(m.group(1)) + dx:.1f}" y="{float(m.group(2)) + dy:.1f}"{m.group(3)}>{teks}</text>', bag, count=1)


def _dinding(x, y0, y1):
    """Tumpuan jepit 2D: garis tebal + arsir miring di sisi kiri."""
    out = f'<line x1="{x:.1f}" y1="{y0:.1f}" x2="{x:.1f}" y2="{y1:.1f}" stroke="{TX}" stroke-width="2.2"/>'
    for yy in range(int(y0), int(y1), 8):
        out += f'<line x1="{x:.1f}" y1="{yy + 8:.1f}" x2="{x - 8:.1f}" y2="{yy:.1f}" stroke="{AX}" stroke-width=".9"/>'
    return out


def _garis(x1, y1, x2, y2, c, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"{d}/>'


def _warna_suhu(f):
    r, g, bl = int(60 + 190 * f), int(80 + 40 * (1 - abs(2 * f - 1))), int(240 - 190 * f)
    return f"rgb({r},{g},{bl})"


def gambar():
    out = []
    # ── T1: kantilever iso L × b × h, Fixed di x = 0, Force F di ujung; bacaan massa ──
    cx, cy, s = 120, 170, 0.62
    a, b, h = 240, 48, 26
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, h, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = _geser(sumbu3d(46, 214, 0.5, 40), "Y", -2, 0)  # label Y lepas dari kepala panah Z
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    muka0 = [iso(0, y, z, cx, cy, s) for y, z in [(0, 0), (b, 0), (b, h), (0, h)]]
    body += poli(muka0, "rgba(236,72,153,.35)", PK, 1.6)
    p = iso(0, b / 2, h + 4, cx, cy, s)
    body += t(p[0] - 4, p[1] - 12, "Fixed (x = 0)", 10, PK, "end", "600")
    q0, q1 = iso(a - 14, b / 2, h + 40, cx, cy, s), iso(a - 14, b / 2, h + 1, cx, cy, s)
    body += _panah(q0[0], q0[1], q1[0], q1[1], RD, 1.6)
    body += t(q0[0] + 6, q0[1] + 6, "F (−Z)", 10.5, RD, "start", "700")
    p = iso(a / 2, -10, 0, cx, cy, s)
    body += t(p[0] + 2, p[1] + 16, "L (searah X)", 10, AM, "middle", "600")
    p = iso(a + 8, b / 2, 0, cx, cy, s)
    body += t(p[0] + 4, p[1] + 10, "b", 11, AM, "start", "600")
    p = iso(a + 6, 0, h / 2, cx, cy, s)
    body += t(p[0] + 6, p[1] + 2, "h", 11, AM, "start", "600")
    body += catatan(["Part Box L × b × h (Length = X)", "Analysis: baja E, ν, ρ = 7850", "Mesh Gmsh orde 2, Fixed x = 0", "Force F (−Z) di ujung, solver", "  CalculiX static → CCX_Results", "baca: m = 7,85×10⁻³ × V (g)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — kantilever L × b × h dengan Analysis statik dan bacaan massa"))

    # ── T2: kantilever L × 20 × 10 tampak samping, defleksi δ di ujung ──
    ox, oy, Lw, Hh = 60, 78, 220, 20
    body = f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="none" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="5 4"/>'
    body += _dinding(ox, oy - 10, oy + Hh + 10)
    dpx = 36
    pa = [(ox + Lw * i / 40, oy + (i / 40) ** 2 * (3 - i / 40) / 2 * dpx) for i in range(41)]
    pb = [(x, y + Hh) for x, y in pa]
    body += poli(pa + pb[::-1], "rgba(34,211,238,.16)", CY, 1.8)
    body += _panah(ox + Lw - 4, oy - 40, ox + Lw - 4, oy - 3, RD, 1.6)
    body += t(ox + Lw + 4, oy - 26, "F (−Z)", 10.5, RD, "start", "700")
    body += _garis(ox + Lw + 14, oy + Hh, ox + Lw + 14, oy + Hh + dpx, GR, 1)
    body += t(ox + Lw + 20, oy + Hh + dpx / 2 + 4, "δ", 12, GR, "start", "700")
    body += dim_h(ox, ox + Lw, oy + Hh + dpx + 24, "L", atas=False)
    body += ext(ox, oy + Hh + dpx, ox, oy + Hh + dpx + 32) + ext(ox + Lw, oy + Hh + dpx, ox + Lw, oy + Hh + dpx + 32)
    body += dim_v(ox - 16, oy, oy + Hh, "h = 10")
    body += t(ox + 10, oy - 16, "x = 0", 9.5, AX, "start") + t(ox + Lw / 2 - 6, oy + Hh + 32, "b = 20 (tegak lurus bidang)", 9.5, AX, "middle")
    body += t(ox + 8, oy + Hh + dpx + 4, "σ maks", 9.5, AM, "start", "600")
    body += catatan(["Box L × 20 × 10 mm (Length = X)", "Fixed muka x = 0; Force F (−Z)", "  di muka ujung bebas x = L", "Mesh Gmsh orde 2 ≤ 2,5 mm", "δ = F·L³/(3·E·I), I = b·h³/12", "E = 210000 MPa; baca: δ (mm)", "bandingkan: DisplacementLengths"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — kantilever L × 20 × 10 dan defleksi teoretis δ"))

    # ── T3: batang tarik L × 20 × 10, Force F arah +X; σ = F/A ──
    ox, oy, Lw, Hh = 60, 96, 200, 26
    body = _dinding(ox, oy - 12, oy + Hh + 12)
    body += f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="rgba(0,224,158,.14)" stroke="{GR}" stroke-width="2"/>'
    body += _panah(ox + Lw + 2, oy + Hh / 2, ox + Lw + 46, oy + Hh / 2, RD, 1.8)
    body += t(ox + Lw + 8, oy + Hh / 2 - 10, "F (+X)", 10.5, RD, "start", "700")
    for i in range(5):
        xx = ox + 30 + i * 36
        body += _garis(xx, oy + 4, xx, oy + Hh - 4, "rgba(0,224,158,.5)", 0.8, "2 2")
    body += t(ox + Lw / 2, oy - 6, "σ = F/A seragam", 10, GR, "middle", "600")  # di atas batang: tidak dicoret garis penanda σ
    body += dim_h(ox, ox + Lw, oy - 22, "L") + ext(ox, oy, ox, oy - 30) + ext(ox + Lw, oy, ox + Lw, oy - 30)
    body += t(ox + 10, oy + Hh + 18, "x = 0 (Fixed)", 9.5, PK, "start", "600") + t(ox + Lw - 4, oy + Hh + 18, "x = L", 9.5, AX, "end")
    # penampang
    px, py = 60, 150
    body += f'<rect x="{px}" y="{py}" width="40" height="20" fill="rgba(0,224,158,.14)" stroke="{GR}" stroke-width="1.4"/>'
    body += dim_h(px, px + 40, py + 34, "20", atas=False) + dim_v(px + 52, py, py + 20, "10", kiri=False)
    body += t(px + 90, py + 14, "penampang A = 20 × 10", 9.5, AX, "start")
    body += catatan(["Box L × 20 × 10 mm (Length = X)", "Fixed muka x = 0", "Force F arah +X di muka x = L", "  (Reversed bila panah ke dalam)", "σ = F/A, A = 20 × 10 = 200 mm²", "baca: σ (MPa, 3 desimal)", "FEM: von Mises ≈ seragam"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — batang tarik dengan gaya aksial F dan tegangan σ = F/A"))

    # ── T4: batang termal b × h × L, suhu T₀+ΔT di x = 0 dan T₀ di x = L ──
    ox, oy, Lw, Hh = 64, 76, 210, 30
    n = 26
    body = ""
    for i in range(n):
        body += f'<rect x="{ox + i * Lw / n:.1f}" y="{oy}" width="{Lw / n + 0.6:.1f}" height="{Hh}" fill="{_warna_suhu(1 - i / (n - 1))}" stroke="none"/>'
    body += f'<rect x="{ox}" y="{oy}" width="{Lw}" height="{Hh}" fill="none" stroke="{TX}" stroke-width="1.4"/>'
    body += t(ox - 6, oy + Hh / 2 - 4, "T₀ + ΔT", 10.5, RD, "end", "700") + t(ox - 6, oy + Hh / 2 + 10, "(x = 0)", 9, AX, "end")
    body += t(ox + Lw + 6, oy + Hh / 2 - 4, "T₀", 10.5, BL, "start", "700") + t(ox + Lw + 6, oy + Hh / 2 + 10, "(x = L)", 9, AX, "start")
    body += _panah(ox + 50, oy + Hh + 16, ox + Lw - 50, oy + Hh + 16, AM, 1.6)
    body += t(ox + Lw / 2, oy + Hh + 32, "q = k·A·ΔT/L", 10.5, AM, "middle", "700")
    body += dim_h(ox, ox + Lw, oy - 18, "L") + ext(ox, oy, ox, oy - 26) + ext(ox + Lw, oy, ox + Lw, oy - 26)
    px, py = 64, 150
    body += f'<rect x="{px}" y="{py}" width="44" height="24" fill="rgba(245,158,11,.12)" stroke="{AM}" stroke-width="1.4"/>'
    body += dim_h(px, px + 44, py + 38, "b", atas=False) + dim_v(px + 56, py, py + 24, "h", kiri=False)
    body += t(px + 94, py + 16, "penampang A = b × h", 9.5, AX, "start")
    body += catatan(["Box b × h × L (Length = X)", "Temperature: T₀ + ΔT di x = 0,", "  T₀ di x = L; k = 50 W/(m·K)", "Initial temperature T₀", "Solver: thermomech, steady state", "q = k·A·ΔT/L (A m², L m)", "baca: q (W, 3 desimal)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — batang dengan beda suhu ΔT antar ujung dan laju kalor q", h=236))

    # ── T5: kantilever L × 20 × h, mode getar pertama, f₁ ──
    ox, oy, Lw = 60, 120, 220
    body = _dinding(ox, oy - 54, oy + 54)
    body += _garis(ox, oy, ox + Lw, oy, "rgba(148,163,184,.45)", 1, "5 4")
    beta = 1.875104
    sig = (math.cosh(beta) + math.cos(beta)) / (math.sinh(beta) + math.sin(beta))
    for tanda, dash in ((1, ""), (-1, "4 3")):
        pts = []
        for i in range(41):
            xi = i / 40
            bx = beta * xi
            phi = math.cosh(bx) - math.cos(bx) - sig * (math.sinh(bx) - math.sin(bx))
            pts.append((ox + xi * Lw, oy - tanda * phi / 2 * 40))
        dd = f' stroke-dasharray="{dash}"' if dash else ""
        body += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="{VI}" stroke-width="2.4"{dd}/>'
    body += _garis(ox + Lw + 12, oy - 40, ox + Lw + 12, oy + 40, GR, 1, "3 2")
    body += t(ox + Lw + 6, oy - 46, "mode 1", 10, VI, "end", "600")  # di ujung atas bentuk mode, jauh dari kolom catatan
    body += dim_h(ox, ox + Lw, oy + 62, "L", atas=False) + ext(ox, oy + 40, ox, oy + 70) + ext(ox + Lw, oy + 40, ox + Lw, oy + 70)
    body += t(ox + 10, oy - 50, "Fixed x = 0, tanpa beban", 9.5, PK, "start", "600")
    body += t(ox + Lw / 2, oy + 90, "penampang 20 × h (h searah getar)", 9.5, AX, "middle")
    body += catatan(["Box L × 20 × h (Length = X)", "Fixed x = 0; tanpa beban", "material: E, ν, ρ = 7850 wajib", "Solver: frequency, 5 mode", "f₁ = (β₁²/2π)·√(EI/ρA)/L²", "β₁ = 1,875104; SI: L, h meter", "baca: f₁ (Hz, 2 desimal)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — kantilever L × 20 × h dan frekuensi alami pertama f₁", h=236))
    return out


if __name__ == "__main__":
    for i, s in enumerate(gambar(), 1):
        print(8, i, len(s))
