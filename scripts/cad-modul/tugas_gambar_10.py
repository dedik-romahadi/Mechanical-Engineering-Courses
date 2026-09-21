# Gambar acuan simbolik lima tugas Modul 10 Pemodelan CAD (Optimasi Desain Pasca-Simulasi).
# Simbol (F, L, b, h_req, a, b, t, r₁, r₂, tᵣ, d, h_Al, B, H, t_f, t_w) mengikuti teks tugas
# backend; angka varian tiap NIM tidak muncul di sini. Dipakai tugas_gambar.tugas_gambar(10).
import math
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import AM, AX, BL, CY, GN, GR, PK, RD, TX, VI, _panah, catatan, dim_h, dim_v, ext, gambar_tugas, iso, lingkar3d, poli, sumbu2d, sumbu3d, t  # noqa: E402,F401


def _geser(bag, teks, dx, dy):
    """Geser <text> berisi tepat `teks` (keluaran helper bersama, mis. sumbu3d/dim_h) sejauh (dx, dy)."""
    return re.sub(rf'<text x="([\d.\-]+)" y="([\d.\-]+)"([^>]*)>{re.escape(teks)}</text>',
                  lambda m: f'<text x="{float(m.group(1)) + dx:.1f}" y="{float(m.group(2)) + dy:.1f}"{m.group(3)}>{teks}</text>', bag, count=1)


def _jepit(x, y1, y2):
    out = f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" stroke="{AX}" stroke-width="1.8"/>'
    for yy in range(int(y1), int(y2), 9):
        out += f'<line x1="{x}" y1="{yy}" x2="{x - 8}" y2="{yy + 8}" stroke="{AX}" stroke-width="1"/>'
    return out


def _dim_v_lab(x, y1, y2, label, y_lab, warna=AM):
    """Dimensi tegak seperti dim_v(kiri=False), tetapi label (kanan garis) pada ketinggian y_lab —
    dipakai bila tengah garis dimensi tertimpa garis sumbu."""
    out = f'<line x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="1"/>'
    out += f'<polygon points="{x:.1f},{y1:.1f} {x - 3:.1f},{y1 + 7:.1f} {x + 3:.1f},{y1 + 7:.1f}" fill="{warna}"/>'
    out += f'<polygon points="{x:.1f},{y2:.1f} {x - 3:.1f},{y2 - 7:.1f} {x + 3:.1f},{y2 - 7:.1f}" fill="{warna}"/>'
    return out + t(x + 6, y_lab, label, 11, warna, "start", "600")


def gambar():
    out = []
    # T1 — kantilever: tinggi h_req dari σ_izin (Spreadsheet)
    x0, x1, yt, yb = 50, 250, 120, 150
    body = _jepit(x0, yt - 14, yb + 14)
    body += f'<rect x="{x0}" y="{yt}" width="{x1 - x0}" height="{yb - yt}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += _panah(240, 80, 240, yt - 4, AM, 1.6) + t(248, 90, "F", 11, AM, "start", "700")
    body += ext(x0, yb, x0, yb + 30) + ext(x1, yb, x1, yb + 30) + dim_h(x0, x1, yb + 24, "L", atas=False)
    # penampang b × h_req
    sx, sy, sw, sh = 268, 118, 24, 34
    body += f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="rgba(245,158,11,.18)" stroke="{AM}" stroke-width="1.6"/>'
    body += t(sx + sw / 2, sy + sh + 14, "b", 10.5, AM, "middle", "600") + t(sx + sw + 4, sy + sh / 2 + 4, "h_req", 10.5, AM, "start", "600")
    body += t(150, 104, "σ_maks = 6·F·L/(b·h²) ≤ σ_izin", 10, RD, "middle", "600")
    body += t(50, 40, "Spreadsheet (alias):", 10, GR, "start", "600") + t(50, 54, "F, L, b, sigma_izin → h_req", 9.5, AX, "start")
    body += t(150, 206, "penampang b × h_req", 9.5, AX, "middle")  # di bawah label L, bukan di garis dimensi
    body += catatan(["Spreadsheet alias F, L, b,", "  sigma_izin (angka tanpa satuan)", "sel h_req = √(6·F·L/(b·σ_izin))", "Sketch YZ b × h → ekspresi", "  =Spreadsheet.h_req; Pad L", "baca: nilai sel h_req (mm)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — tinggi minimum kantilever h_req dari tegangan izin (Spreadsheet)"))
    # T2 — pelat + rusuk segitiga
    cx, cy, s = 130, 185, 1.5
    a, bb, tt, r1, r2, tr = 110, 80, 10, 45, 40, 8
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    body = _geser(_geser(sumbu3d(cx, cy, s, 30), "Y", -12, 12), "X", 0, 12)  # label sumbu di luar pelat
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    tri0 = [iso(x, 0, z, cx, cy, s) for x, z in [(0, tt), (r1, tt), (0, tt + r2)]]
    tri1 = [iso(x, tr, z, cx, cy, s) for x, z in [(0, tt), (r1, tt), (0, tt + r2)]]
    body += poli([tri0[1], tri1[1], tri1[2], tri0[2]], "rgba(245,158,11,.18)", AM, 1.2)
    body += poli([tri0[2], tri1[2], tri1[0], tri0[0]], "rgba(245,158,11,.12)", AM, 1.0)
    body += poli(tri0, "rgba(245,158,11,.35)", AM, 1.8)
    p = iso(a / 2, -8, 0, cx, cy, s)
    body += t(p[0], p[1] + 16, "a", 11, CY, "middle", "700")
    p = iso(a + 6, bb / 2, 0, cx, cy, s)
    body += t(p[0] + 10, p[1] - 2, "b", 11, CY, "start", "700")
    p = iso(a + 4, 0, tt / 2, cx, cy, s)
    body += t(p[0] + 6, p[1] + 4, "t", 11, CY, "start", "700")
    p = iso(r1 / 2, -4, tt, cx, cy, s)
    body += t(p[0] - 6, p[1] - 6, "r₁", 10.5, AM, "middle", "700")
    p = iso(0, -6, tt + r2 / 2, cx, cy, s)
    body += t(p[0] - 14, p[1], "r₂", 10.5, AM, "end", "700")  # kiri rusuk tegak & panah sumbu Z
    p = iso(0, tr / 2, tt + r2 + 4, cx, cy, s)
    body += t(p[0] + 2, p[1] - 12, "tᵣ", 10.5, AM, "middle", "700")
    body += catatan(["Sketch XY a × b → Pad t (pelat)", "Sketch XZ (y = 0): segitiga", "  (0, t), (r₁, t), (0, t + r₂)", "Pad tebal tᵣ ke dalam pelat", "  (Reversed bila keluar)", "baca: Body.Shape.Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — pelat a × b × t dengan rusuk segitiga r₁ × r₂ tebal tᵣ", h=240))
    # T3 — pelat tiga lubang LinearPattern
    ox, oy, aw, bh, r = 40, 196, 250, 120, 14
    body = sumbu2d(ox, oy, 26, 26)
    body += f'<rect x="{ox}" y="{oy - bh}" width="{aw}" height="{bh}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    for k, fx in enumerate((0.25, 0.5, 0.75)):
        body += f'<circle cx="{ox + fx * aw:.1f}" cy="{oy - bh / 2:.1f}" r="{r}" fill="#0a101f" stroke="{GR if k == 0 else VI}" stroke-width="2"/>'
    body += f'<line x1="{ox + 0.25 * aw - 24}" y1="{oy - bh / 2}" x2="{ox + 0.75 * aw + 24}" y2="{oy - bh / 2}" stroke="{RD}" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    body += ext(ox, oy - bh, ox, oy - bh - 22) + ext(ox + aw, oy - bh, ox + aw, oy - bh - 22) + dim_h(ox, ox + aw, oy - bh - 14, "a")
    body += dim_v(ox + aw + 16, oy - bh, oy, "b", kiri=False)
    body += dim_h(ox, ox + 0.25 * aw, oy + 18, "a/4", atas=False) + dim_h(ox + 0.25 * aw, ox + 0.75 * aw, oy + 18, "a/2 (Overall Length)", atas=False)
    body += t(ox + 0.25 * aw, oy - bh / 2 - r - 6, "⌀d (induk)", 10, GR, "middle", "600")
    body += t(ox + 0.5 * aw + 4, oy - bh + 14, "Pocket → LinearPattern ×3", 9.5, VI, "middle")
    body += catatan(["Sketch XY a × b → Pad t", "Sketch muka atas: Circle ⌀d", "  di (a/4, b/2) → Pocket Through all", "LinearPattern arah X: Overall", "  Length a/2, Occurrences 3", "baca: massa = 7,85×10⁻³ × Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — pelat a × b × t dengan tiga lubang ⌀d pola linear", h=240))
    # T4 — substitusi baja → aluminium, kekakuan sama
    x0, x1 = 50, 250
    body = _jepit(x0, 46, 100) + _jepit(x0, 116, 182)
    body += f'<rect x="{x0}" y="60" width="{x1 - x0}" height="24" fill="rgba(148,163,184,.18)" stroke="{AX}" stroke-width="1.8"/>'
    body += f'<rect x="{x0}" y="128" width="{x1 - x0}" height="36" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += _panah(240, 28, 240, 56, AM, 1.4) + t(247, 40, "F", 10.5, AM, "start", "700")
    body += _panah(240, 96, 240, 124, AM, 1.4) + t(247, 108, "F", 10.5, AM, "start", "700")
    body += t(140, 54, "baja: E_st, tinggi h, lebar b", 9.5, AX, "middle")
    body += t(140, 108, "aluminium: E_Al, tinggi h_Al", 9.5, CY, "middle") + t(140, 121, "= h·(E_st/E_Al)^(1/3)", 9.5, CY, "middle")
    body += dim_v(262, 60, 84, "h", AX, kiri=False) + dim_v(262, 128, 164, "h_Al", CY, kiri=False)
    body += ext(x0, 164, x0, 188) + ext(x1, 164, x1, 188) + dim_h(x0, x1, 182, "L", atas=False)
    body += t(150, 215, "E_st·I_st = E_Al·I_Al → δ sama", 10, GR, "middle", "600")
    body += catatan(["Spreadsheet: L, b, h, E_st, E_Al,", "  h_Al = h*pow(E_st/E_Al; 1/3)", "Sketch YZ b × h_Al (ekspresi", "  =Spreadsheet.h_Al) → Pad L", "kekakuan lentur E·I sama", "baca: massa = 2,70×10⁻³ × Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — kantilever baja diganti aluminium dengan kekakuan lentur sama"))
    # T5 — profil I berpusat di titik asal
    cx, cy, B2, H2, tf, tw = 150, 125, 60, 85, 16, 7
    pts = [(-B2, -H2), (B2, -H2), (B2, -H2 + tf), (tw, -H2 + tf), (tw, H2 - tf), (B2, H2 - tf), (B2, H2), (-B2, H2), (-B2, H2 - tf), (-tw, H2 - tf), (-tw, -H2 + tf), (-B2, -H2 + tf)]
    body = poli([(cx + x, cy + y) for x, y in pts], "rgba(34,211,238,.18)", CY, 2)
    body += f'<line x1="{cx - B2 - 26}" y1="{cy}" x2="{cx + B2 + 40}" y2="{cy}" stroke="{RD}" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    body += f'<line x1="{cx}" y1="{cy - H2 - 30}" x2="{cx}" y2="{cy + H2 + 22}" stroke="{GN}" stroke-width="1" stroke-dasharray="8 3 2 3"/>'
    body += t(cx + B2 + 44, cy - 4, "X", 10, RD, "start", "700") + t(cx + 6, cy - H2 - 22, "Y", 10, GN, "start", "700")
    body += f'<circle cx="{cx}" cy="{cy}" r="2.5" fill="{TX}"/>' + t(cx + tw + 4, cy + 14, "(0, 0)", 9, AX, "start")  # di luar garis tepi badan
    body += f'<line x1="{cx - B2}" y1="{cy - H2 - 12}" x2="{cx + B2}" y2="{cy - H2 - 12}" stroke="{AM}" stroke-width="1"/>'
    body += t(cx - 30, cy - H2 - 17, "B", 11, AM, "middle", "600")
    # garis dimensi H digeser keluar agar tidak mencoret "(t_w/2, H/2 − t_f)"; label H di paruh bawah (tengahnya garis sumbu X)
    body += ext(cx + B2, cy - H2, cx + B2 + 30, cy - H2) + ext(cx + B2, cy + H2, cx + B2 + 30, cy + H2)
    body += _dim_v_lab(cx + B2 + 24, cy - H2, cy + H2, "H", cy + H2 / 2 + 4)
    body += t(cx - B2 - 6, cy - H2 + tf - 3, "t_f", 10.5, AM, "end", "600")
    body += t(cx + tw + 4, cy + 40, "t_w", 10.5, AM, "start", "600")
    body += t(cx + B2 + 4, cy - H2 - 4, "(B/2, H/2)", 9, AX, "start")
    body += t(cx + tw + 4, cy - H2 + tf + 12, "(t_w/2, H/2 − t_f)", 9, AX, "start")
    body += t(cx - B2 - 4, cy + H2 + 14, "(−B/2, −H/2)", 9, AX, "start")
    body += catatan(["Sketch XY: profil I 12 garis,", "  Symmetric terhadap titik asal", "sudut (±B/2, ±H/2) dan", "  (±t_w/2, ±(H/2 − t_f)); Pad 100", "baca: Part.Face(Wires[0])", "  .MatrixOfInertia.A11 = I_x"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — profil I simetris berpusat di titik asal dan momen inersia I_x", h=246))
    return out


if __name__ == "__main__":
    for i, s_ in enumerate(gambar(), 1):
        print(10, i, len(s_))
