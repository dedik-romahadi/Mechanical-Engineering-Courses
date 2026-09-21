# Gambar acuan simbolik lima tugas Modul 14 Pemodelan CAD (Optimasi Desain untuk Efisiensi
# dan Lingkungan). Simbol (V₀, r, h, F, L, b, h_req, δ_izin, d_s, d_o, d_i, k, σ_izin, t_req,
# f, ρ) mengikuti teks tugas backend; angka varian tiap NIM tidak muncul di sini.
# Dipakai tugas_gambar.tugas_gambar(14).
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import AM, AX, BL, CY, GN, GR, PK, RD, TX, VI, _panah, catatan, dim_h, dim_v, ext, gambar_tugas, iso, lingkar3d, poli, sumbu2d, sumbu3d, t  # noqa: E402,F401


def _jepit(x, y1, y2):
    out = f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" stroke="{AX}" stroke-width="1.8"/>'
    for yy in range(int(y1), int(y2), 9):
        out += f'<line x1="{x}" y1="{yy}" x2="{x - 8}" y2="{yy + 8}" stroke="{AX}" stroke-width="1"/>'
    return out


def gambar():
    out = []
    # T1 — kaleng silinder tertutup dengan luas permukaan minimum
    cx, ytop, ybot, rx, ry = 150, 60, 178, 52, 16
    body = f'<path d="M {cx - rx} {ytop} V {ybot} A {rx} {ry} 0 0 0 {cx + rx} {ybot} V {ytop} Z" fill="rgba(34,211,238,.14)" stroke="{CY}" stroke-width="2"/>'
    body += f'<ellipse cx="{cx}" cy="{ytop}" rx="{rx}" ry="{ry}" fill="rgba(34,211,238,.28)" stroke="{CY}" stroke-width="2"/>'
    body += f'<line x1="{cx}" y1="{ytop}" x2="{cx + rx}" y2="{ytop}" stroke="{AM}" stroke-width="1"/>'
    body += f'<circle cx="{cx}" cy="{ytop}" r="2.5" fill="{TX}"/>'
    body += t(cx + rx / 2 - 12, ytop - 3, "r", 11, AM, "middle", "700")  # di antara bibir elips dan garis jari-jari
    body += ext(cx + rx, ytop, cx + rx + 34, ytop) + ext(cx + rx, ybot, cx + rx + 34, ybot)
    body += dim_v(cx + rx + 26, ytop, ybot, "h = 2r", kiri=False)
    body += t(cx, 31, "volume V₀ ditetapkan (mm³)", 9.5, GR, "middle")  # di atas label r
    body += t(cx, 212, "luas A = 2πr² + 2πrh = 6πr²", 9.5, AX, "middle")
    body += catatan(["Spreadsheet alias:", "  V0 (mm³, angka polos)", "  r = (V0/(2*pi))^(1/3)", "  h = 2*r  (hasil optimasi)", "Sketch XY: Circle pusat (0,0),", "  Radius = Spreadsheet.r", "Pad Length = Spreadsheet.h", "baca: Shape.Area (mm²)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — kaleng silinder tertutup bervolume tetap dengan luas permukaan minimum", h=240))
    # T2 — kantilever aluminium: tinggi minimum dari kendala defleksi
    x0, x1, yt, yb = 50, 250, 112, 146
    body = _jepit(x0, yt - 14, yb + 14)
    body += f'<rect x="40" y="40" width="30" height="34" fill="rgba(245,158,11,.18)" stroke="{AM}" stroke-width="1.6"/>'
    body += t(55, 88, "b", 10.5, AM, "middle", "600") + t(74, 60, "h_req", 10.5, AM, "start", "600")
    body += t(150, 92, "penampang b × h_req (Sketch YZ)", 9.5, AX, "middle")
    body += f'<rect x="{x0}" y="{yt}" width="{x1 - x0}" height="{yb - yt}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += _panah(240, 74, 240, yt - 4, AM, 1.6) + t(248, 86, "F", 11, AM, "start", "700")
    body += f'<path d="M {x0} 129 Q 170 129 {x1} 160" fill="none" stroke="{VI}" stroke-width="1.6" stroke-dasharray="5 3"/>'
    body += dim_v(x1 + 12, yt, yb, "h_req", CY, kiri=False)
    body += t(150, 180, "defleksi ujung δ ≤ δ_izin (kendala)", 9.5, VI, "middle")
    body += ext(x0, yb, x0, 202) + ext(x1, 160, x1, 202) + dim_h(x0, x1, 196, "L", atas=False)
    body += catatan(["Spreadsheet alias F, L, b, E,", "  d_izin (aluminium E = 70000)", "sel h_req =", "  (4*F*L^3/(E*b*d_izin))^(1/3)", "Sketch YZ b × h_req, kedua", "  dimensi berekspresi → Pad L", "baca: nilai sel h_req (mm)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — kantilever aluminium: tinggi minimum dari kendala defleksi", h=240))
    # T3 — tabung pengganti poros pejal dengan momen inersia sama
    cy = 118
    body = f'<circle cx="95" cy="{cy}" r="45" fill="rgba(148,163,184,.26)" stroke="{AX}" stroke-width="2"/>'
    body += f'<circle cx="225" cy="{cy}" r="55" fill="rgba(0,224,158,.22)" stroke="{GR}" stroke-width="2"/>'
    body += f'<circle cx="225" cy="{cy}" r="41" fill="#0a101f" stroke="{GR}" stroke-width="1.8"/>'
    body += f'<line x1="50" y1="{cy}" x2="140" y2="{cy}" stroke="{RD}" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    body += f'<line x1="165" y1="{cy}" x2="285" y2="{cy}" stroke="{RD}" stroke-width=".7" stroke-dasharray="6 2 2 2"/>'
    body += _panah(145, cy, 166, cy, GR, 1.6) + t(155, cy - 22, "I sama", 9.5, GR, "middle", "600")
    body += t(95, 176, "⌀d_s (pejal)", 10, AX, "middle", "600")
    body += t(225, 192, "⌀d_o (luar)", 10, GR, "middle", "600")
    body += t(225, cy - 4, "⌀d_i", 10, GR, "middle", "600")  # di atas garis sumbu merah
    body += t(160, 212, "k = d_i/d_o diberikan di soal", 9.5, AM, "middle")
    body += catatan(["Spreadsheet alias d_s, k", "sel d_o = d_s/(1 − k^4)^(1/4)", "sel d_i = k*d_o", "Sketch XY: dua lingkaran", "  sepusat ⌀d_o dan ⌀d_i", "  (berekspresi) → Pad 100", "bandingkan Shape.Volume", "baca: nilai sel d_o (mm)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — tabung berongga pengganti poros pejal dengan momen inersia sama", h=240))
    # T4 — pelat kantilever dengan dua kendala sekaligus
    x0, x1, yt, yb = 50, 250, 124, 150
    body = _jepit(x0, yt - 14, yb + 14)
    body += t(150, 48, "σ_maks = 6·F·L/(b·t²) ≤ σ_izin", 10, RD, "middle", "600")
    body += t(150, 70, "δ = 4·F·L³/(E·b·t³) ≤ δ_izin", 10, VI, "middle", "600")
    body += t(150, 92, "t_req = maks(t_σ, t_δ)", 10, AM, "middle", "700")
    body += f'<rect x="{x0}" y="{yt}" width="{x1 - x0}" height="{yb - yt}" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += _panah(240, 104, 240, yt - 4, AM, 1.6) + t(248, 116, "F", 11, AM, "start", "700")
    body += dim_v(x1 + 12, yt, yb, "t_req", CY, kiri=False)
    body += t(150, 172, "lebar b tegak lurus bidang gambar", 9.5, AX, "middle")
    body += ext(x0, yb, x0, 200) + ext(x1, yb, x1, 200) + dim_h(x0, x1, 194, "L", atas=False)
    body += catatan(["Spreadsheet alias F, L, b, E,", "  s_izin, d_izin (baja)", "t_sigma = (6*F*L/(b*s_izin))^(1/2)", "t_delta =", "  (4*F*L^3/(E*b*d_izin))^(1/3)", "t_req = max(t_sigma; t_delta)", "Sketch YZ b × t_req → Pad L", "baca: nilai sel t_req (mm)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — pelat kantilever dengan kendala tegangan dan defleksi sekaligus", h=240))
    # T5 — pilihan material berjejak karbon terkecil pada kekakuan sama
    x0, x1 = 50, 250
    body = _jepit(x0, 42, 96) + _jepit(x0, 106, 174)
    body += f'<rect x="{x0}" y="56" width="{x1 - x0}" height="26" fill="rgba(148,163,184,.20)" stroke="{AX}" stroke-width="1.8"/>'
    body += f'<rect x="{x0}" y="120" width="{x1 - x0}" height="40" fill="rgba(34,211,238,.16)" stroke="{CY}" stroke-width="2"/>'
    body += _panah(238, 26, 238, 52, AM, 1.4) + t(245, 38, "F", 10.5, AM, "start", "700")
    body += _panah(238, 90, 238, 116, AM, 1.4) + t(245, 102, "F", 10.5, AM, "start", "700")
    body += dim_v(262, 56, 82, "h_St", AX, kiri=False)
    body += dim_v(262, 120, 160, "h_Al", CY, kiri=False)
    body += t(140, 102, "kekakuan sama: E_st·I_st = E_Al·I_Al", 9.5, GR, "middle")
    body += ext(x0, 160, x0, 196) + ext(x1, 160, x1, 196) + dim_h(x0, x1, 190, "L", atas=False)
    body += t(140, 222, "jejak CO₂ = f × ρ × b·L·h", 9.5, AM, "middle", "600")
    body += catatan(["Spreadsheet alias F, L, b,", "  d_izin; tiap material:", "  h = (4*F*L^3/(E*b*d_izin))", "       ^(1/3)", "  massa = rho*b*L*h  (kg)", "  CO2 = f*massa", "modelkan balok ALUMINIUM", "  b × h_Al → Pad L", "baca: jejak CO₂ Al (kg)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 5 — pilihan material berjejak karbon terkecil pada kekakuan lentur sama", h=246))
    return out


if __name__ == "__main__":
    for i, s_ in enumerate(gambar(), 1):
        print(14, i, len(s_))
