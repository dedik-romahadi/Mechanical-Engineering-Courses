# Gambar acuan simbolik lima tugas Modul 13 Pemodelan CAD (Prinsip Desain Berkelanjutan
# dalam CAD). Simbol (a, b, t, c, d, D, L, h_c, …) mengikuti teks tugas backend; angka
# varian tiap NIM dimuat server. Dipakai bangun.py lewat tugas_gambar.tugas_gambar(13).
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


def _kotak(x, y, w, h, fill, stroke, lw=1.8, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{lw}"{d}/>'


def gambar():
    out = []

    # ── T1 — pelat aluminium a × b × t berlubang ⌀d ──────────────────────────
    cx, cy, s = 132, 172, 0.95
    a, b, tt, d = 150, 95, 18, 36
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = sumbu3d(cx, cy, s, 40)
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    body += poli(lingkar3d(a / 2, b / 2, tt, d / 2, cx, cy, s), "#0a101f", AM, 1.6)
    p = iso(a / 2, b / 2, tt, cx, cy, s)
    body += _garis(p[0], p[1], p[0] + 34, p[1] - 44, AM, 0.8, "3 2") + t(p[0] + 38, p[1] - 46, "⌀d (Pocket Through all)", 10, AM, "start", "600")
    p = iso(a / 2, -4, 0, cx, cy, s)
    body += t(p[0] - 6, p[1] + 18, "a", 11.5, CY, "middle", "700")
    p = iso(a + 4, b / 2, 0, cx, cy, s)
    body += t(p[0] + 12, p[1] + 12, "b", 11.5, CY, "start", "700")
    p = iso(0, b, tt / 2, cx, cy, s)
    body += t(p[0] - 10, p[1] + 4, "t", 11.5, CY, "end", "700")
    body += catatan(["Body: Sketch XY a × b (sudut", "  kiri-bawah di titik asal)", "  → Pad t mm", "Sketch muka atas: ⌀d di pusat", "  → Pocket Through all", "baca: massa aluminium (g)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — pelat aluminium a × b × t dengan lubang tembus ⌀d", h=240))

    # ── T2 — tabung aluminium ⌀D/⌀d × L (energi terkandung) ──────────────────
    cx, cy, s = 128, 196, 1.05
    D, di, L = 62, 44, 120
    body = sumbu3d(cx, cy, s, 34)
    body += _silinder(0, 0, 0, L, D / 2, cx, cy, s, "rgba(34,211,238,.20)", CY)
    body += poli(lingkar3d(0, 0, L, di / 2, cx, cy, s), "#0a101f", AM, 1.6)
    p = iso(D / 2, 0, L, cx, cy, s)
    body += _garis(p[0], p[1], p[0] + 30, p[1] - 34, CY, 0.8, "3 2") + t(p[0] + 34, p[1] - 36, "⌀D (lingkaran luar)", 10, CY, "start", "600")
    p = iso(0, -di / 2, L, cx, cy, s)
    body += _garis(p[0], p[1], p[0] - 18, p[1] - 44, AM, 0.8, "3 2") + t(p[0] - 22, p[1] - 46, "⌀d (lingkaran dalam)", 10, AM, "end", "600")
    p0, p1 = iso(-D / 2 - 10, 0, 0, cx, cy, s), iso(-D / 2 - 10, 0, L, cx, cy, s)
    body += _panah(p0[0], p0[1], p1[0], p1[1], GR, 1.2) + _panah(p1[0], p1[1], p0[0], p0[1], GR, 1.2)
    body += t(p1[0] - 10, (p0[1] + p1[1]) / 2, "L (Pad arah Z)", 10.5, GR, "end", "600")
    body += t(cx, 224, "profil cincin: dua lingkaran sepusat dalam satu sketsa", 9.5, AX, "middle")
    body += catatan(["Body: Sketch XY dua lingkaran", "  sepusat di titik asal ⌀D, ⌀d", "  → Pad L mm searah Z", "V = (π/4)(D² − d²)·L", "m = ρ_Al·V, E = e·m (e MJ/kg)", "baca: energi terkandung (MJ)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — tabung aluminium ⌀D/⌀d × L dan energi terkandungnya", h=246))

    # ── T3 — braket L dari billet (pemanfaatan material) ─────────────────────
    ox, oy, s3 = 58, 206, 1.55
    a3, c3, t3 = 120, 80, 25
    X = lambda x: ox + x * s3      # noqa: E731
    Z = lambda z: oy - z * s3      # noqa: E731
    body = sumbu2d(ox - 24, oy, 28, 28)
    body += _kotak(X(0), Z(c3), a3 * s3, c3 * s3, "rgba(148,163,184,.05)", AX, 1.2, "6 4")
    for k in range(9):
        xh = X(t3) + 4 + k * 13
        if xh < X(a3) - 4:
            body += _garis(xh, Z(t3) - 4, min(xh + 22, X(a3) - 4), max(Z(t3) - 26, Z(c3) + 4), "rgba(239,68,68,.35)", 1)
    body += poli([(X(x), Z(z)) for x, z in [(0, 0), (a3, 0), (a3, t3), (t3, t3), (t3, c3), (0, c3)]], "rgba(34,211,238,.20)", CY, 1.8)
    body += t(X(a3 * 0.62), Z(c3 * 0.62), "serpihan", 10, RD, "middle", "600")
    body += t(X(a3 * 0.7), Z(t3 / 2) + 4, "t", 11, CY, "middle", "700")
    body += t(X(t3 / 2), Z(c3 * 0.78), "t", 11, CY, "middle", "700")
    body += ext(X(0), Z(0) + 4, X(0), oy + 28) + ext(X(a3), Z(0) + 4, X(a3), oy + 28)
    body += dim_h(X(0), X(a3), oy + 22, "a", AM, atas=False)
    body += dim_v(X(a3) + 22, Z(c3), Z(0), "c", AM, kiri=False)
    body += t(X(a3 / 2), 30, "profil L pada bidang XZ, di-Pad sedalam b", 10, AX, "middle")
    body += catatan(["Body: Sketch XZ profil L enam", "  titik (lebar a, tinggi c,", "  tebal kaki t) → Pad b (arah Y)", "Pembanding: Part → Box a × b × c", "U = 100·V_braket/V_billet", "baca: U (%, 3 desimal)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — braket L dipesin dari billet a × b × c: pemanfaatan material U", h=246))

    # ── T4 — housing baja dijadikan cangkang (Thickness) ─────────────────────
    ox4, oy4, s4 = 40, 196, 1.25
    a4, h4, t4 = 150, 90, 12
    X4 = lambda x: ox4 + x * s4    # noqa: E731
    Z4 = lambda z: oy4 - z * s4    # noqa: E731
    body = _kotak(X4(0), Z4(h4), a4 * s4, h4 * s4, "none", AX, 1.1, "5 4")
    body += poli([(X4(x), Z4(z)) for x, z in [(0, h4), (t4, h4), (t4, t4), (a4 - t4, t4), (a4 - t4, h4), (a4, h4), (a4, 0), (0, 0)]],
                 "rgba(0,224,158,.20)", GR, 1.8)
    body += t(X4(a4 / 2), Z4(h4) - 10, "muka atas dibuang", 10, GR, "middle", "600")
    body += _panah(X4(t4) + 6, Z4(h4) + 22, X4(0) + 2, Z4(h4) + 22, AM, 1.2)
    body += t(X4(t4) + 10, Z4(h4) + 26, "t (dinding)", 10, AM, "start", "600")
    body += ext(X4(0), Z4(0) + 4, X4(0), oy4 + 28) + ext(X4(a4), Z4(0) + 4, X4(a4), oy4 + 28)
    body += dim_h(X4(0), X4(a4), oy4 + 22, "a", AM, atas=False)
    body += dim_v(X4(a4) + 20, Z4(h4), Z4(0), "h", AM, kiri=False)
    body += t(X4(a4 / 2), 30, "penampang XZ; kedalaman b tetap, dasar setebal t", 10, AX, "middle")
    body += catatan(["Body: Sketch XY a × b → Pad h", "Part Design → Thickness:", "  muka ATAS dibuang, tebal t,", "  Mode Skin, arah ke dalam", "V = a·b·h − (a−2t)(b−2t)(h−t)", "baca: massa cangkang baja (g)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 4 — housing baja a × b × h dijadikan cangkang setebal t", h=246))

    # ── T5 — rakitan pelat baja + blok aluminium (jejak CO₂) ─────────────────
    cx, cy, s5 = 122, 178, 0.82
    a5, b5, t5, c5, hc5 = 165, 110, 16, 62, 52
    dasar = [iso(x, y, 0, cx, cy, s5) for x, y in [(0, 0), (a5, 0), (a5, b5), (0, b5)]]
    atas = [iso(x, y, t5, cx, cy, s5) for x, y in [(0, 0), (a5, 0), (a5, b5), (0, b5)]]
    body = sumbu3d(cx, cy, s5, 40)
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    x0, y0 = (a5 - c5) / 2, (b5 - c5) / 2
    bl0 = [iso(x, y, t5, cx, cy, s5) for x, y in [(x0, y0), (x0 + c5, y0), (x0 + c5, y0 + c5), (x0, y0 + c5)]]
    bl1 = [iso(x, y, t5 + hc5, cx, cy, s5) for x, y in [(x0, y0), (x0 + c5, y0), (x0 + c5, y0 + c5), (x0, y0 + c5)]]
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([bl0[i], bl0[j], bl1[j], bl1[i]], "rgba(245,158,11,.14)", "rgba(245,158,11,.7)", 1.1)
    body += poli(bl1, "rgba(245,158,11,.28)", AM, 1.8)
    p = iso(x0 + c5, y0 + c5 / 2, t5 + hc5, cx, cy, s5)
    body += _garis(p[0], p[1], p[0] + 26, p[1] - 30, AM, 0.8, "3 2") + t(p[0] + 30, p[1] - 32, "blok Al c × c × h_c", 10, AM, "start", "600")
    p = iso(a5 / 2, -4, 0, cx, cy, s5)
    body += t(p[0] - 6, p[1] + 18, "a", 11.5, CY, "middle", "700")
    p = iso(a5 + 4, b5 / 2, 0, cx, cy, s5)
    body += t(p[0] + 12, p[1] + 12, "b", 11.5, CY, "start", "700")
    p = iso(0, b5, t5 / 2, cx, cy, s5)
    body += t(p[0] - 10, p[1] + 4, "t", 11.5, CY, "end", "700")
    body += t(cx - 10, 224, "pelat baja (ρ_st, f_st) + blok aluminium (ρ_al, f_al)", 9.5, AX, "middle")
    body += catatan(["Body pelat: Sketch XY a × b", "  → Pad t (baja)", "Body blok: Sketch muka atas,", "  persegi c × c di pusat pelat", "  → Pad h_c (aluminium)", "Spreadsheet: Σ fᵢ·ρᵢ·Vᵢ", "baca: jejak CO₂ total (kg)"], 330, 34)
    out.append(gambar_tugas(body, "Tugas 5 — rakitan pelat baja dan blok aluminium: jejak CO₂ total", h=246))
    return out


if __name__ == "__main__":
    for i, s in enumerate(gambar(), 1):
        print(13, i, len(s))
