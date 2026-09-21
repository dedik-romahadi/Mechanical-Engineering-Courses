# Gambar acuan simbolik tugas pemodelan T1–T5 Modul 7 Pemodelan CAD (Proyek Gabungan 2D dan
# 3D, Blok, dan Sub-Assembly). Teks soal dirakit server per NIM, jadi gambar memakai simbol
# (W, H, t, L, a₁, b₁, h, D, d₀, d_b, n, k, …) yang sama dengan teks soal, bukan angka varian.
# Dipakai bangun.py lewat tugas_gambar.tugas_gambar(7) → gambar().
import math
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from tugas_gambar import (AM, AX, BL, CY, GN, GR, PK, RD, TX, VI, _panah, catatan, dim_h, dim_v, ext, gambar_tugas, iso,  # noqa: E402,F401
                          lingkar3d, poli, sumbu2d, sumbu3d, t)


def _geser(bag, teks, dx, dy):
    """Geser <text> berisi tepat `teks` (keluaran helper bersama, mis. sumbu3d) sejauh (dx, dy)."""
    return re.sub(rf'<text x="([\d.\-]+)" y="([\d.\-]+)"([^>]*)>{re.escape(teks)}</text>',
                  lambda m: f'<text x="{float(m.group(1)) + dx:.1f}" y="{float(m.group(2)) + dy:.1f}"{m.group(3)}>{teks}</text>', bag, count=1)


def _sil(cx0, cy0, z0, z1, r, cx, cy, s, warna, fill="rgba(34,211,238,.07)", n=32):
    out = ""
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        out += poli([iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z0, cx, cy, s), iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z0, cx, cy, s),
                     iso(cx0 + r * math.cos(t1), cy0 + r * math.sin(t1), z1, cx, cy, s), iso(cx0 + r * math.cos(t0), cy0 + r * math.sin(t0), z1, cx, cy, s)],
                    fill, "rgba(34,211,238,.25)", 0.6)
    out += poli(lingkar3d(cx0, cy0, z1, r, cx, cy, s, n), "rgba(34,211,238,.2)", warna, 1.3)
    return out


def gambar():
    out = []
    # ── T1: profil L Draft Wire → Part Extrude sepanjang L ──
    cx, cy, s = 150, 195, 1.3
    W, H, tt, L = 100, 70, 22, 50
    prof = [(0, 0), (W, 0), (W, tt), (tt, tt), (tt, H), (0, H)]
    bawah = [iso(x, y, 0, cx, cy, s) for x, y in prof]
    atas = [iso(x, y, L, cx, cy, s) for x, y in prof]
    body = _geser(_geser(sumbu3d(cx, cy, s, 40), "Z", 4, 0), "X", -2, -2)  # label sumbu lepas dari rusuk profil
    for i in range(6):
        j = (i + 1) % 6
        body += poli([bawah[i], bawah[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.22)", CY, 1.8)
    body += poli(bawah, "rgba(245,158,11,.14)", AM, 1.4, "5 3")
    p = iso(W / 2, -6, 0, cx, cy, s)
    body += t(p[0], p[1] + 14, "W", 11, AM, "middle", "600")
    p = iso(-6, H / 2, 0, cx, cy, s)
    body += t(p[0] - 4, p[1] + 4, "H", 11, AM, "end", "600")
    p = iso(W + 4, tt / 2, 0, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "t", 11, AM, "start", "600")  # lepas dari rusuk ujung kaki
    p = iso(W, 0, L / 2, cx, cy, s)
    body += t(p[0] + 10, p[1] + 4, "Extrude L", 10.5, CY, "start", "600")
    p = iso(tt / 2, H + 4, 0, cx, cy, s)
    body += t(p[0] - 10, p[1] - 6, "Draft Wire (XY)", 10, AM, "end", "600")
    body += catatan(["Draft Wire tertutup 6 titik (XY)", "  Make Face: W × H, tebal kaki t", "Part → Extrude: Normal, Length L", "  centang Create solid", "baca: Extrude.Shape.Volume", "  = L·(W·t + (H − t)·t)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 1 — profil L Draft Wire di-Extrude sepanjang L"))
    # ── T2: Loft ruled dua persegi panjang sepusat ──
    cx, cy, s = 150, 200, 1.25
    a1, b1, a2, b2, h = 100, 60, 50, 30, 80
    r1 = [(-a1 / 2, -b1 / 2), (a1 / 2, -b1 / 2), (a1 / 2, b1 / 2), (-a1 / 2, b1 / 2)]
    r2 = [(-a2 / 2, -b2 / 2), (a2 / 2, -b2 / 2), (a2 / 2, b2 / 2), (-a2 / 2, b2 / 2)]
    bawah = [iso(x, y, 0, cx, cy, s) for x, y in r1]
    atas = [iso(x, y, h, cx, cy, s) for x, y in r2]
    body = ""
    for i in range(4):
        j = (i + 1) % 4
        body += poli([bawah[i], bawah[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.24)", CY, 1.8)
    body += poli(bawah, "rgba(245,158,11,.14)", AM, 1.4, "5 3")
    z0, z1 = iso(0, 0, -8, cx, cy, s), iso(0, 0, h + 14, cx, cy, s)
    body += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="{RD}" stroke-width="1" stroke-dasharray="8 3 2 3"/>' + t(z1[0] + 6, z1[1] - 4, "sumbu Z", 9.5, RD, "start")
    p = iso(0, -b1 / 2 - 4, 0, cx, cy, s)
    body += t(p[0] + 16, p[1] + 14, "a₁ × b₁ (z = 0)", 10.5, AM, "middle", "600")  # lepas dari rusuk depan, >= 6 px dari tepi bawah
    p = iso(0, 0, h, cx, cy, s)
    body += t(p[0] - 30, p[1] - 28, "a₂ × b₂ (z = h)", 10.5, CY, "middle", "600")
    p = iso(a1 / 2, -b1 / 2, h / 2, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "h", 11, TX, "start", "700")
    p = iso(a1 / 2, b1 / 2, h / 2, cx, cy, s)
    body += t(p[0] + 14, p[1], "ruled", 10, AX, "start")
    body += catatan(["Sketch XY: a₁ × b₁ sepusat (0,0)", "Sketch XY offset z = h: a₂ × b₂", "  sepusat (Symmetric ke origin)", "Part → Loft: Create solid +", "  Ruled surface", "baca: Loft.Shape.Volume"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 2 — Loft ruled dua persegi panjang sepusat", h=240))
    # ── T3: balok → Thickness (cangkang terbuka atas) ──
    cx, cy, s = 150, 200, 1.15
    a, b, h, tt = 110, 70, 60, 8
    luar = [(0, 0), (a, 0), (a, b), (0, b)]
    dalam = [(tt, tt), (a - tt, tt), (a - tt, b - tt), (tt, b - tt)]
    lb = [iso(x, y, 0, cx, cy, s) for x, y in luar]
    la = [iso(x, y, h, cx, cy, s) for x, y in luar]
    db_ = [iso(x, y, tt, cx, cy, s) for x, y in dalam]
    da = [iso(x, y, h, cx, cy, s) for x, y in dalam]
    body = _geser(_geser(_geser(sumbu3d(cx, cy, s, 36), "X", 0, 12), "Y", 4, -10), "Z", 2, 2)  # label sumbu lepas dari rusuk cangkang
    for i in range(4):
        j = (i + 1) % 4
        body += poli([lb[i], lb[j], la[j], la[i]], "rgba(236,72,153,.10)", "rgba(236,72,153,.6)", 1.1)
    body += poli(db_, "rgba(236,72,153,.06)", "rgba(236,72,153,.35)", 0.8)
    for i in range(4):
        j = (i + 1) % 4
        body += poli([db_[i], db_[j], da[j], da[i]], "rgba(10,16,31,.6)", "rgba(236,72,153,.35)", 0.8)
    for i in range(4):
        j = (i + 1) % 4
        body += poli([la[i], la[j], da[j], da[i]], "rgba(236,72,153,.28)", PK, 1.3)
    p = iso(a / 2 + 10, -6, 0, cx, cy, s)  # agak ke kanan: tidak terbaca "X a" dengan label sumbu X
    body += t(p[0], p[1] + 14, "a", 11, AM, "middle", "600")
    p = iso(a + 6, b / 2, 0, cx, cy, s)
    body += t(p[0] + 8, p[1] + 4, "b", 11, AM, "start", "600")  # lepas dari rusuk tegak kanan
    p = iso(0, b, h / 2, cx, cy, s)  # rusuk tegak kiri-belakang: jauh dari label sumbu "Y"/"Z"
    body += t(p[0] - 6, p[1] + 4, "h", 11, AM, "end", "600")
    p = iso(a + 2, b / 2, h, cx, cy, s)
    body += t(p[0] + 6, p[1] - 4, "dinding t", 10.5, PK, "start", "600")
    p = iso(a / 2, b / 2, h, cx, cy, s)
    body += t(p[0], p[1] - 40, "muka atas dibuang", 10, PK, "middle", "600")
    body += catatan(["Body: Sketch XY a × b → Pad h", "Pilih MUKA ATAS → Thickness t", "  ke dalam (ukuran luar tetap),", "  Mode Skin", "baca: Body.Shape.Volume", "  = abh − (a−2t)(b−2t)(h−t)"], 330, 40)
    out.append(gambar_tugas(body, "Tugas 3 — balok dijadikan cangkang Thickness terbuka atas", h=236))
    # ── T4: flens cakram, lubang pusat, PolarPattern n lubang baut ──
    cx0, cy0 = 150, 125
    R, r0, rbc, rb, n = 95, 28, 64, 8, 5
    body = f'<circle cx="{cx0}" cy="{cy0}" r="{R}" fill="rgba(34,211,238,.14)" stroke="{CY}" stroke-width="2"/>'
    body += f'<circle cx="{cx0}" cy="{cy0}" r="{r0}" fill="#0a101f" stroke="{CY}" stroke-width="1.6"/>'
    # lingkaran baut putus-putus diberi celah 21°…44° di belakang label "360°/n" (seperti garis bantu yang diputus teks)
    g0, g1 = math.radians(44), math.radians(21)
    body += f'<path d="M {cx0 + rbc * math.cos(g0):.1f} {cy0 - rbc * math.sin(g0):.1f} A {rbc} {rbc} 0 1 0 {cx0 + rbc * math.cos(g1):.1f} {cy0 - rbc * math.sin(g1):.1f}" fill="none" stroke="{AM}" stroke-width="1" stroke-dasharray="5 4"/>'
    for i in range(n):
        ang = 2 * math.pi * i / n
        px, py = cx0 + rbc * math.cos(ang), cy0 - rbc * math.sin(ang)
        body += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rb}" fill="#0a101f" stroke="{GR if i == 0 else VI}" stroke-width="1.6"/>'
    a1 = 2 * math.pi / n
    body += f'<path d="M {cx0 + 40} {cy0} A 40 40 0 0 0 {cx0 + 40 * math.cos(a1):.1f} {cy0 - 40 * math.sin(a1):.1f}" fill="none" stroke="{PK}" stroke-width="1.2"/>'
    body += t(cx0 + 46, cy0 - 30, "360°/n", 10, PK, "start", "600")
    body += t(cx0, cy0 - R - 8, "⌀D (Pad h)", 10.5, CY, "middle", "600")
    body += t(cx0, cy0 + 14, "⌀d₀", 10, CY, "middle", "600")  # di bawah titik pusat
    # label lubang induk di luar bibir flens (dua baris) dengan garis penunjuk; label lingkaran baut di bawah flens
    body += f'<line x1="{cx0 + rbc + rb + 2}" y1="{cy0}" x2="{cx0 + R + 3}" y2="{cy0}" stroke="{GR}" stroke-width=".8" stroke-dasharray="3 2"/>'
    body += t(cx0 + R + 6, cy0 - 2, "n × ⌀d_b", 10, GR, "start", "600") + t(cx0 + R + 6, cy0 + 13, "(induk)", 10, GR, "start", "600")
    body += f'<line x1="{cx0}" y1="{cy0 + rbc + 2}" x2="{cx0}" y2="{cy0 + R + 7}" stroke="{AM}" stroke-width=".8" stroke-dasharray="3 2"/>'
    body += t(cx0, cy0 + R + 20, "lingkaran baut ⌀D_bc", 10, AM, "middle", "600")
    body += f'<circle cx="{cx0}" cy="{cy0}" r="2" fill="{TX}"/>'
    body += catatan(["Sketch XY: Circle ⌀D → Pad h", "Muka atas: Circle ⌀d₀ sepusat →", "  Pocket Through all", "Muka atas: Circle ⌀d_b pada", "  (D_bc/2, 0) → Pocket Through all", "  → PolarPattern n × 360° (sumbu Z)", "baca: Body.Shape.Volume"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 4 — flens dengan lubang pusat dan pola polar n lubang baut", h=256))
    # ── T5: pelat + boss + Draft Clone berskala k → Part Union ──
    cx, cy, s = 140, 205, 1.15
    a, b, tt, dB, hB, k = 140, 80, 12, 24, 20, 1.4
    dasar = [iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    atas = [iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, b), (0, b)]]
    body = ""
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        body += poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    body += poli(atas, "rgba(34,211,238,.18)", CY, 1.6)
    body += _sil(a / 4, b / 2, tt, tt + hB, dB / 2, cx, cy, s, AM)
    body += _sil(3 * a / 4, b / 2, tt, tt + k * hB, k * dB / 2, cx, cy, s, GR, "rgba(0,224,158,.07)")
    p = iso(a / 4, b / 2, tt + hB, cx, cy, s)
    body += t(p[0] - dB / 2 * s - 6, p[1] - 4, "Boss ⌀d_B × h_B", 10, AM, "end", "600")
    p = iso(3 * a / 4, b / 2, tt + k * hB, cx, cy, s)
    body += t(p[0], p[1] - 18, "Clone: Scale k", 10, GR, "middle", "600")
    p = iso(a / 2, -4, 0, cx, cy, s)
    body += t(p[0], p[1] + 20, "Pelat a × b × t", 10.5, CY, "middle", "600")
    p = iso(a / 4, b / 2, tt, cx, cy, s)
    body += t(p[0], p[1] + 18, "(a/4, b/2)", 9, AX, "middle")
    p = iso(3 * a / 4, b / 2, tt, cx, cy, s)
    body += t(p[0] - 8, p[1] + 20, "(3a/4, b/2)", 9, AX, "middle")
    body += catatan(["Body Pelat: a × b → Pad t", "Body Boss: ⌀d_B → Pad h_B,", "  Placement (a/4, b/2, t)", "Draft Clone Boss: Scale (k,k,k),", "  Placement (3a/4, b/2, t)", "Part → Boolean → Union ketiganya", "baca: Fusion.Shape.Volume"], 330, 36)
    out.append(gambar_tugas(body, "Tugas 5 — pelat, boss, dan Draft Clone berskala k disatukan Union", h=250))
    return out


if __name__ == "__main__":
    for i, s_ in enumerate(gambar(), 1):
        print(7, i, len(s_))
