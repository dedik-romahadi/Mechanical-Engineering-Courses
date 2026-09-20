# Gambar acuan simbolik lima tugas Modul 9 Pemodelan CAD (Evaluasi Hasil Simulasi dan
# Analisis Kekuatan). Teks soal dirakit server per NIM, jadi gambar memakai simbol
# (F, L, b, h, d, W, P) yang sama dengan teks tugas, tanpa angka varian.
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import gambar_tugas, catatan, dim_h, dim_v, ext, sumbu2d, sumbu3d, iso, lingkar3d, poli, _panah, CY, AM, GR, VI, PK, RD, GN, BL, AX, TX, t  # noqa: E402,F401


def _dinding(x, y0, y1, arah=1):
    out = f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y1}" stroke="{AX}" stroke-width="2"/>'
    for yy in range(int(y0), int(y1), 8):
        out += f'<line x1="{x}" y1="{yy + 8}" x2="{x - 8 * arah}" y2="{yy}" stroke="{AX}" stroke-width="1"/>'
    return out


def _kantilever(F_lab, L_lab, h_lab, b_lab, warna_kontur=True):
    """Kantilever tampak samping (x–z) dengan jepitan kiri, beban ujung, dan kontur lentur."""
    x0, x1, y0, y1 = 60, 260, 90, 122
    body = ""
    if warna_kontur:
        nx, nz = 20, 6
        for i in range(nx):
            for j in range(nz):
                v = (1 - (i + 0.5) / nx) * abs((j + 0.5) / nz - 0.5) * 2
                r, g, b_ = (round(59 + (239 - 59) * v), round(130 + (68 - 130) * v), round(246 + (68 - 246) * v))
                body += f'<rect x="{x0 + (x1 - x0) * i / nx:.1f}" y="{y0 + (y1 - y0) * j / nz:.1f}" width="{(x1 - x0) / nx + 0.4:.1f}" height="{(y1 - y0) / nz + 0.4:.1f}" fill="rgb({r},{g},{b_})" opacity=".8"/>'
    body += f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{"none" if warna_kontur else "rgba(34,211,238,.16)"}" stroke="{CY}" stroke-width="1.8"/>'
    body += _dinding(x0, y0 - 12, y1 + 12)
    body += _panah(x1, 46, x1, y0 - 2, RD, 2) + t(x1 + 8, 64, F_lab, 12, RD, "start", "700")
    body += ext(x0, y1, x0, y1 + 30) + ext(x1, y1, x1, y1 + 30) + dim_h(x0, x1, y1 + 22, L_lab, atas=False)
    body += ext(x1, y0, x1 + 30, y0) + ext(x1, y1, x1 + 30, y1) + dim_v(x1 + 22, y0, y1, h_lab, kiri=False)
    body += t(x0 + 6, y1 + 50, f"lebar {b_lab} (searah Y, tegak lurus gambar)", 9.5, AX, "start")
    body += t(x0 + 4, y0 - 20, "σ_maks di serat terluar jepitan", 9.5, RD, "start", "600")
    return body


def gambar():
    out = []
    # T1 kantilever b × 20, σ_maks teoretis
    body = _kantilever("F", "L", "h = 20", "b")
    body += catatan(["Body: Sketch YZ b × h → Pad L (searah X)", "FEM: Fixed muka x = 0, Force F (−Z)", "  di muka ujung, mesh Gmsh orde 2, solve", "baca: σ_maks = 6·F·L/(b·h²) (teoretis)", "  bandingkan von Mises FEM di jepitan"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — kantilever b × 20 berbeban ujung: tegangan lentur maksimum vs von Mises FEM"))
    # T2 kantilever S235, SF
    body = _kantilever("F", "L", "h", "b = 20")
    body += t(160, 54, "σ_y = 250 MPa (S235)", 10, AM, "middle", "600")
    body += catatan(["Kantilever L × 20 × h, baja S235", "FEM statik seperti Tugas 1", "σ_maks = 6·F·L/(b·h²)", "baca: SF = σ_y / σ_maks", "  = σ_y·b·h² / (6·F·L)", "  (catat SF versi FEM di dokumen)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — kantilever S235: faktor keamanan terhadap luluh"))
    # T3 tumpuan sederhana beban tengah, δ vs L/250
    xa, xb, yb = 50, 270, 120
    body = ""
    for xx in (xa, xb):
        body += f'<polygon points="{xx},{yb + 8} {xx - 10},{yb + 26} {xx + 10},{yb + 26}" fill="none" stroke="{AX}" stroke-width="1.5"/>'
    body += f'<circle cx="{xb}" cy="{yb + 30}" r="3" fill="none" stroke="{AX}" stroke-width="1"/>'
    body += f'<rect x="{xa}" y="{yb - 8}" width="{xb - xa}" height="16" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="1.8"/>'
    body += f'<line x1="{(xa + xb) / 2}" y1="{yb - 8}" x2="{(xa + xb) / 2}" y2="{yb + 8}" stroke="{TX}" stroke-width="1" stroke-dasharray="3 2"/>'
    pts = [(xa + (xb - xa) * k / 40, yb + 8 + 28 * math.sin(math.pi * k / 40)) for k in range(41)]
    body += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="{GR}" stroke-width="2" stroke-dasharray="6 4"/>'
    body += _panah((xa + xb) / 2, 50, (xa + xb) / 2, yb - 10, RD, 2) + t((xa + xb) / 2 + 8, 68, "F", 12, RD, "start", "700")
    body += _panah((xa + xb) / 2 + 30, yb + 8, (xa + xb) / 2 + 30, yb + 36, GR, 1.2) + t((xa + xb) / 2 + 36, yb + 30, "δ", 11, GR, "start", "700")
    body += ext(xa, yb + 26, xa, yb + 62) + ext(xb, yb + 26, xb, yb + 62) + dim_h(xa, xb, yb + 54, "L", atas=False)
    body += t(xa, 36, "sendi", 9.5, AX, "middle") + t(xb, 36, "rol (z = 0, x bebas)", 9.5, AX, "middle")
    body += t(xa + 4, yb - 16, "rusuk tengah muka atas (sketsa dibagi di L/2)", 9, AX, "start")
    body += t(xa + 4, 200, "penampang b × h = 30 × 20 (tetap)", 9.5, AM, "start", "600")
    body += catatan(["Sketch XZ L × h, garis atas 2 ruas", "  → Pad b; Displacement pada rusuk", "  bawah kedua ujung, Force F di", "  rusuk tengah muka atas, solve", "baca: δ = F·L³/(48·E·I), I = b·h³/12", "  bandingkan Displacement FEM & L/250"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — balok tumpuan sederhana beban tengah: defleksi vs batas L/250", h=236))
    # T4 pelat berlubang tarik
    px0, px1, py0, py1 = 90, 270, 70, 160
    cx, cy, rr = (px0 + px1) / 2, (py0 + py1) / 2, 20
    body = f'<rect x="{px0}" y="{py0}" width="{px1 - px0}" height="{py1 - py0}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="1.8"/>'
    body += f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="#0a101f" stroke="{VI}" stroke-width="1.8"/>'
    body += t(cx, cy + 4, "⌀d", 10.5, VI, "middle", "600")
    body += f'<line x1="{cx}" y1="{py0}" x2="{cx}" y2="{py1}" stroke="{AX}" stroke-width=".8" stroke-dasharray="4 3"/>'
    for tanda in (-1, 1):
        pts = [(cx, cy + tanda * rr)]
        for k in range(16):
            rho = rr + (cy - py0 - rr) * k / 15
            s = (1 + (rr / rho) ** 2 / 2 + 3 * (rr / rho) ** 4 / 2) / 3
            pts.append((cx + 26 * s, cy + tanda * rho))
        pts.append((cx, cy + tanda * (cy - py0)))
        body += f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="rgba(239,68,68,.35)" stroke="{RD}" stroke-width="1.2"/>'
    body += _panah(px0, cy, 44, cy, AM, 2) + t(38, cy + 4, "F", 12, AM, "end", "700")
    body += _panah(px1, cy, 316, cy, AM, 2) + t(322, cy + 4, "F", 12, AM, "start", "700")
    body += ext(px0, py0, 70, py0) + ext(px0, py1, 70, py1) + dim_v(76, py0, py1, "W = 60")
    body += ext(px0, py1, px0, py1 + 30) + ext(px1, py1, px1, py1 + 30) + dim_h(px0, px1, py1 + 22, "180", atas=False)
    body += t(cx, py0 - 12, "σ_maks = Kt·σ_nom di tepi lubang", 10, RD, "middle", "600")
    body += t(cx, 218, "tebal t = 5 (tetap) · lubang di pusat pelat", 9.5, AX, "middle")
    body += catatan(["Pad 60 × 180 × 5, Pocket ⌀d di pusat", "FEM: Fixed x = 0, Force F (+X) di", "  x = 180, mesh ≈ 1 mm di lubang", "Kt = 3,00 − 3,13r + 3,66r² − 1,53r³,", "  r = d/W; σ_nom = F/((W − d)·t)", "baca: σ_maks = Kt·σ_nom (teoretis)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — pelat berlubang tarik: konsentrasi tegangan Kt·σ_nom vs von Mises FEM", h=236))
    # T5 kolom sendi–sendi, tekuk Euler
    cx, yt, yb = 120, 50, 200
    body = f'<line x1="{cx}" y1="{yt}" x2="{cx}" y2="{yb}" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="4 4"/>'
    pts = [(cx + 22 * math.sin(math.pi * k / 40), yb - (yb - yt) * k / 40) for k in range(41)]
    body += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="{CY}" stroke-width="6" stroke-linecap="round"/>'
    for yy in (yt, yb):
        body += f'<circle cx="{cx}" cy="{yy}" r="4" fill="{AX}"/>'
    body += f'<line x1="{cx - 30}" y1="{yb + 6}" x2="{cx + 30}" y2="{yb + 6}" stroke="{AX}" stroke-width="2"/>'
    body += _panah(cx, 14, cx, yt - 6, AM, 2.2) + t(cx + 10, 30, "P (tekan, −Z)", 11, AM, "start", "700")
    body += t(cx + 30, (yt + yb) / 2 + 4, "tekuk sumbu lemah", 9.5, PK, "start", "600")
    body += ext(cx, yt, cx - 46, yt) + ext(cx, yb, cx - 46, yb) + dim_v(cx - 40, yt, yb, "L")
    body += t(cx, yb + 24, "sendi bawah: x = y = z = 0", 9, AX, "middle") + t(cx + 12, yt + 4, "sendi atas: x = y = 0, z bebas", 9, AX, "start")
    # penampang kecil
    sx, sy = 236, 150
    body += f'<rect x="{sx}" y="{sy}" width="44" height="22" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="1.5"/>'
    body += dim_h(sx, sx + 44, sy - 8, "b = 20") + dim_v(sx + 52, sy, sy + 22, "h", kiri=False)
    body += t(sx + 22, sy + 40, "penampang (I = 20·h³/12)", 9, AX, "middle")
    body += catatan(["Sketch XY 20 × h → Pad L (searah Z)", "FEM: SolverCalculiX, Analysis type", "  Buckling; Displacement sendi pada", "  rusuk bawah/atas; Force 1000 N (−Z)", "baca: P_cr = π²·E·I/L² (Euler)", "  bandingkan buckling factor × 1000 N"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — kolom sendi–sendi 20 × h: beban kritis Euler vs CalculiX Buckling", h=240))
    return out


if __name__ == "__main__":
    for i, s in enumerate(gambar(), 1):
        print(i, len(s))
