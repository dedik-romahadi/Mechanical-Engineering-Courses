# Konten Modul 11 Pemodelan CAD — Perakitan Komponen dan Analisis Sistem
# (Sub-CPMK 4.1: Assembly Workbench FreeCAD 1.0, joint dan derajat kebebasan, mekanisme
# engkol-peluncur, tabrakan/kelonggaran, BOM dan gambar rakitan, massa dan pusat massa
# rakitan, transmisi sabuk). Angka contoh dihitung di sini agar teks, tabel, dan gambar
# konsisten, dan sengaja tidak sama dengan varian tugas parametrik mana pun (bank tugas
# ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 11
JUDUL = "Perakitan Komponen dan Analisis Sistem"
JUDUL_PANJANG = "Perakitan Komponen dan Analisis Sistem"
JUDUL_EKSPOR = "Perakitan Komponen dan Analisis Sistem"

# ─────────────────────────── angka contoh ───────────────────────────
A_P, B_P, T_P = 120, 70, 15                      # pelat dasar contoh (mm)
D_PIN, L_PIN = 10, 50                            # pin contoh
V_PELAT = A_P * B_P * T_P
V_PIN = math.pi / 4 * D_PIN ** 2 * L_PIN
V_RAKIT = V_PELAT + V_PIN
RHO_BAJA = 7.85
RHO_AL = 2.70
D_LUB, D_POR = 25, 24.94                         # lubang bus dan poros contoh
C_RAD = (D_LUB - D_POR) / 2
D_BOSS, H_BOSS = 30, 40                          # boss contoh di atas pelat
V_BOSS = math.pi / 4 * D_BOSS ** 2 * H_BOSS
Z_BAR = (V_PELAT * T_P / 2 + V_BOSS * (T_P + H_BOSS / 2)) / (V_PELAT + V_BOSS)
R_ENG, L_BAT, TH_ENG = 25, 90, 60                # engkol-peluncur contoh
X_PEL = R_ENG * math.cos(math.radians(TH_ENG)) + math.sqrt(L_BAT ** 2 - (R_ENG * math.sin(math.radians(TH_ENG))) ** 2)
PHI_BAT = math.degrees(math.asin(R_ENG * math.sin(math.radians(TH_ENG)) / L_BAT))
D1_P, D2_P, C_P = 75, 150, 250                   # transmisi sabuk contoh
L_SABUK = 2 * C_P + math.pi * (D1_P + D2_P) / 2 + (D2_P - D1_P) ** 2 / (4 * C_P)
BETA_P = math.asin((D2_P - D1_P) / (2 * C_P))
L_SABUK_TEPAT = 2 * math.sqrt(C_P ** 2 - ((D2_P - D1_P) / 2) ** 2) + math.pi * (D1_P + D2_P) / 2 + (D2_P - D1_P) * BETA_P
I_SABUK = D2_P / D1_P
N1_RPM = 1450


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _garis(x1, y1, x2, y2, warna, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def _ling(cx, cy, r, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def gambar1():
    b = ""
    w, h = 124, 54
    tahap = [("Create Assembly", "wadah rakitan", "#22d3ee"), ("Insert Link", "App::Link komponen", "#f59e0b"), ("Grounded part", "acuan diam", "#a855f7"),
             ("Create Joint", "Fixed · Revolute · …", "#ec4899"), ("Solve & gerak", "DOF sisa = gerak", "#00e09e")]
    xs = [10, 142, 274, 406, 538]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 36, w, h, [a, s], c, 11.5)
    for i in range(4):
        b += arrow(xs[i] + w, 63, xs[i + 1], 63)
    b += t(340, 118, "Pohon dokumen rakitan:", 11, TX, "start", "600")
    for i, s_ in enumerate(["Assembly", "  ├ Joints (GroundedJoint, Fixed, Revolute …)", "  ├ Pelat (App::Link → Body pelat)  ⚓ grounded", "  ├ Pin (App::Link → Body pin)", "  └ Placement tiap link = hasil solver"]):
        b += t(340, 136 + i * 16, s_, 10, "#00e09e" if i == 4 else AX, "start")
    b += t(60, 130, "Komponen tetap Body/Part sendiri;", 10.5, AX, "start")
    b += t(60, 146, "rakitan hanya menyimpan tautan,", 10.5, AX, "start")
    b += t(60, 162, "Placement, dan joint. Mengubah", 10.5, AX, "start")
    b += t(60, 178, "Body memperbarui seluruh rakitan.", 10.5, AX, "start")
    b += t(340, 222, "Rakitan = komponen (link) + satu acuan diam + joint yang mengurangi derajat kebebasan sampai tersisa gerak yang diinginkan", 11, AX)
    return svg(680, 234, b, "Gambar 1 — Alur kerja Assembly Workbench 1.0 dan pohon dokumen rakitan")


def gambar2():
    b = ""
    data = [("Fixed", "0 DOF", ["kaku, ikut", "komponen lain"], "#22d3ee"),
            ("Revolute", "1 R", ["engsel, pin", "engkol"], "#f59e0b"),
            ("Cylindrical", "1 R + 1 T", ["poros dalam", "bus"], "#a855f7"),
            ("Slider", "1 T", ["peluncur", "pada rel"], "#ec4899"),
            ("Ball", "3 R", ["sendi bola,", "rod end"], "#00e09e"),
            ("Distance", "5 DOF", ["jarak tetap", "antar acuan"], "#ef4444")]
    for k, (nama, dof, ket, c) in enumerate(data):
        cx = 60 + k * 112
        b += t(cx, 30, nama, 11.5, c, "middle", "600")
        cy = 108
        if nama == "Fixed":
            b += f'<rect x="{cx - 34}" y="{cy - 14}" width="34" height="28" rx="3" fill="rgba(34,211,238,.18)" stroke="{c}" stroke-width="1.5"/>'
            b += f'<rect x="{cx}" y="{cy - 14}" width="34" height="28" rx="3" fill="rgba(34,211,238,.18)" stroke="{c}" stroke-width="1.5"/>'
            b += _garis(cx, cy - 26, cx, cy + 26, c, 2)
            b += f'<rect x="{cx - 7}" y="{cy - 36}" width="14" height="10" rx="2" fill="{c}"/>'
        elif nama == "Revolute":
            b += f'<rect x="{cx - 40}" y="{cy - 10}" width="46" height="20" rx="3" fill="rgba(245,158,11,.15)" stroke="{c}" stroke-width="1.5"/>'
            b += f'<rect x="{cx - 6}" y="{cy - 10}" width="46" height="20" rx="3" fill="rgba(245,158,11,.15)" stroke="{c}" stroke-width="1.5" transform="rotate(-35 {cx} {cy})"/>'
            b += _ling(cx, cy, 6, "#0a101f", c, 2)
            b += f'<path d="M {cx - 22} {cy - 30} A 36 36 0 0 1 {cx + 22} {cy - 30}" fill="none" stroke="{c}" stroke-width="1.4"/>'
            b += f'<polygon points="{cx + 22},{cy - 30} {cx + 14},{cy - 34} {cx + 18},{cy - 25}" fill="{c}"/>'
        elif nama == "Cylindrical":
            b += f'<rect x="{cx - 40}" y="{cy - 16}" width="80" height="32" rx="4" fill="rgba(168,85,247,.12)" stroke="{c}" stroke-width="1.2"/>'
            b += f'<rect x="{cx - 52}" y="{cy - 7}" width="104" height="14" rx="7" fill="rgba(168,85,247,.35)" stroke="{c}" stroke-width="1.5"/>'
            b += _garis(cx - 58, cy, cx + 58, cy, c, 1, "6 3")
            b += f'<path d="M {cx + 30} {cy - 30} A 14 14 0 0 1 {cx + 52} {cy - 22}" fill="none" stroke="{c}" stroke-width="1.4"/>'
            b += f'<polygon points="{cx + 52},{cy - 22} {cx + 44},{cy - 24} {cx + 50},{cy - 30}" fill="{c}"/>'
            b += f'<polygon points="{cx - 58},{cy + 28} {cx - 46},{cy + 24} {cx - 46},{cy + 32}" fill="{c}"/>' + _garis(cx - 46, cy + 28, cx - 20, cy + 28, c, 1.4)
        elif nama == "Slider":
            b += f'<rect x="{cx - 46}" y="{cy + 6}" width="92" height="10" fill="rgba(236,72,153,.15)" stroke="{c}" stroke-width="1.2"/>'
            b += f'<rect x="{cx - 16}" y="{cy - 16}" width="32" height="22" rx="3" fill="rgba(236,72,153,.35)" stroke="{c}" stroke-width="1.5"/>'
            b += f'<polygon points="{cx + 46},{cy - 28} {cx + 36},{cy - 32} {cx + 36},{cy - 24}" fill="{c}"/>' + _garis(cx + 8, cy - 28, cx + 36, cy - 28, c, 1.4)
            b += f'<polygon points="{cx - 46},{cy - 28} {cx - 36},{cy - 32} {cx - 36},{cy - 24}" fill="{c}"/>' + _garis(cx - 36, cy - 28, cx - 8, cy - 28, c, 1.4)
        elif nama == "Ball":
            b += f'<path d="M {cx - 22} {cy + 4} A 22 22 0 0 0 {cx + 22} {cy + 4} L {cx + 22} {cy + 22} L {cx - 22} {cy + 22} Z" fill="rgba(0,224,158,.15)" stroke="{c}" stroke-width="1.5"/>'
            b += _ling(cx, cy, 14, "rgba(0,224,158,.35)", c, 1.5)
            b += _garis(cx, cy, cx + 20, cy - 34, c, 3)
            b += f'<ellipse cx="{cx}" cy="{cy}" rx="26" ry="8" fill="none" stroke="{c}" stroke-width="1" stroke-dasharray="3 3"/>'
            b += f'<ellipse cx="{cx}" cy="{cy}" rx="8" ry="26" fill="none" stroke="{c}" stroke-width="1" stroke-dasharray="3 3"/>'
        else:
            b += _ling(cx - 30, cy, 12, "rgba(239,68,68,.15)", c, 1.5) + _ling(cx + 30, cy, 12, "rgba(239,68,68,.15)", c, 1.5)
            b += _garis(cx - 18, cy, cx + 18, cy, c, 1.2) + _garis(cx - 18, cy - 5, cx - 18, cy + 5, c, 1.2) + _garis(cx + 18, cy - 5, cx + 18, cy + 5, c, 1.2)
            b += t(cx, cy - 8, "d", 10, c, "middle", "600")
        b += t(cx, 178, dof, 10.5, c, "middle", "700")
        for i, s_ in enumerate(ket):
            b += t(cx, 196 + i * 14, s_, 9.5, AX, "middle")
    b += teks2(340, 236, "Setiap joint menghilangkan sebagian dari 6 derajat kebebasan komponen bebas; yang tersisa adalah gerak yang boleh dilakukan komponen", 11, AX, maks=70)
    return svg(680, 266, b, "Gambar 2 — Jenis joint Assembly 1.0 dan derajat kebebasan yang tersisa")


def gambar3():
    b = ""
    ox, oy, s = 96, 176, 1.55
    r, l, th = R_ENG, L_BAT, math.radians(TH_ENG)
    ax_, ay_ = ox + r * s * math.cos(th), oy - r * s * math.sin(th)
    bx_ = ox + X_PEL * s
    # rel dan arsir dasar
    b += _garis(ox - 50, oy + 16, ox + (L_BAT + R_ENG) * s + 40, oy + 16, "rgba(148,163,184,.6)", 1.4)
    for k in range(18):
        x0 = ox - 46 + k * 15
        b += _garis(x0, oy + 16, x0 - 7, oy + 26, "rgba(148,163,184,.35)", 1)
    b += _garis(ox - 50, oy, ox + (L_BAT + R_ENG) * s + 40, oy, "rgba(148,163,184,.3)", 1, "5 4")
    # lingkaran lintasan engkol
    b += _ling(ox, oy, r * s, "none", "rgba(245,158,11,.35)", 1, "4 4")
    # peluncur
    b += f'<rect x="{bx_ - 18}" y="{oy - 14}" width="36" height="30" rx="3" fill="rgba(168,85,247,.25)" stroke="#a855f7" stroke-width="1.6"/>'
    # batang dan engkol
    b += _garis(ax_, ay_, bx_, oy, "#22d3ee", 5)
    b += _garis(ox, oy, ax_, ay_, "#f59e0b", 6)
    for (px, py) in [(ox, oy), (ax_, ay_), (bx_, oy)]:
        b += _ling(px, py, 4.5, "#0a101f", TX, 1.6)
    b += t(ox - 10, oy + 12, "O", 11, TX, "end", "700")
    b += t(ax_ - 4, ay_ - 10, "A", 11, TX, "end", "700")
    b += t(bx_ + 4, oy - 20, "B", 11, TX, "start", "700")
    # label r, l, θ, φ
    b += t((ox + ax_) / 2 - 12, (oy + ay_) / 2 - 2, "r", 12, "#f59e0b", "end", "700")
    b += t((ax_ + bx_) / 2, (ay_ + oy) / 2 - 12, "l", 12, "#22d3ee", "middle", "700")
    b += f'<path d="M {ox + 22} {oy} A 22 22 0 0 0 {ox + 22 * math.cos(th):.1f} {oy - 22 * math.sin(th):.1f}" fill="none" stroke="#00e09e" stroke-width="1.2"/>'
    b += t(ox + 30, oy - 12, "θ", 11, "#00e09e", "start", "700")
    b += f'<path d="M {bx_ - 28} {oy} A 28 28 0 0 1 {bx_ - 28 * math.cos(math.radians(PHI_BAT)):.1f} {oy - 28 * math.sin(math.radians(PHI_BAT)):.1f}" fill="none" stroke="#ec4899" stroke-width="1.2"/>'
    b += t(bx_ - 36, oy - 8, "φ", 11, "#ec4899", "end", "700")
    # dimensi x
    y_dim = oy + 44
    b += _garis(ox, oy + 20, ox, y_dim + 6, "#00e09e", 0.8, "3 2") + _garis(bx_, oy + 20, bx_, y_dim + 6, "#00e09e", 0.8, "3 2")
    b += arrow(ox, y_dim, bx_, y_dim, "#00e09e", 1.2) + arrow(bx_, y_dim, ox, y_dim, "#00e09e", 1.2)
    b += t((ox + bx_) / 2, y_dim - 5, "x", 11, "#00e09e", "middle", "700")
    # catatan kanan
    b += t(400, 50, "Engkol r: Revolute di O (dasar)", 11, "#f59e0b", "start", "600")
    b += t(400, 68, "Batang l: Revolute di A dan B", 11, "#22d3ee", "start", "600")
    b += t(400, 86, "Peluncur: Slider searah X", 11, "#a855f7", "start", "600")
    b += t(400, 114, "x = r·cos θ + √(l² − r²·sin² θ)", 11, TX, "start")
    b += t(400, 132, "sin φ = r·sin θ / l", 10.5, AX, "start")
    b += t(400, 158, f"contoh r = {R_ENG}, l = {L_BAT}, θ = {TH_ENG}°:", 10.5, AX, "start")
    b += t(400, 176, f"x = {ind(X_PEL, 3)} mm, φ = {ind(PHI_BAT, 2)}°", 10.5, "#00e09e", "start")
    b += t(400, 194, f"x ∈ [l − r, l + r] = [{L_BAT - R_ENG}, {L_BAT + R_ENG}]", 10.5, AX, "start")
    b += t(400, 212, f"langkah = 2r = {2 * R_ENG} mm", 10.5, AX, "start")
    b += teks2(340, 246, "Satu sudut engkol menentukan seluruh posisi mekanisme (1 DOF); solver Assembly menempatkan batang dan peluncur sesuai geometri segitiga OAB", 11, AX, maks=70)
    return svg(680, 262, b, "Gambar 3 — Geometri engkol-peluncur: r, l, θ, dan posisi peluncur x")


def gambar4():
    b = ""
    for k, (judul, R, rr, warna) in enumerate([("Kelonggaran c > 0", 42, 36, "#00e09e"), ("Interferensi c < 0", 36, 42, "#ef4444")]):
        cx, cy = 118 + k * 200, 120
        b += t(cx, 30, judul, 11.5, warna, "middle", "600")
        b += f'<rect x="{cx - 62}" y="{cy - 62}" width="124" height="124" fill="rgba(148,163,184,.08)" stroke="{AX}" stroke-width="1.2"/>'
        if k == 0:
            b += _ling(cx, cy, R, "#0a101f", "#22d3ee", 1.6)
            b += _ling(cx, cy, rr, "rgba(245,158,11,.25)", "#f59e0b", 1.6)
            b += arrow(cx + rr * math.cos(0.6), cy - rr * math.sin(0.6), cx + R * math.cos(0.6), cy - R * math.sin(0.6), "#00e09e", 1.2)
            b += t(cx + R + 4, cy - 30, "c", 11, "#00e09e", "start", "700")
        else:
            b += _ling(cx, cy, rr, "rgba(239,68,68,.30)", "#ef4444", 1.6)
            b += _ling(cx, cy, R, "rgba(245,158,11,.25)", "#22d3ee", 1.6, "4 3")
            b += t(cx, cy - rr - 8, "tumpang tindih", 10, "#ef4444", "middle", "600")
        b += t(cx, cy + 84, "⌀D lubang (bus)", 10, "#22d3ee", "middle")
        b += t(cx, cy + 98, "⌀d poros", 10, "#f59e0b", "middle")
    b += t(430, 50, "Cylindrical joint: sesumbu,", 11, TX, "start", "600")
    b += t(430, 68, "sisa 2 DOF (putar + geser)", 10.5, AX, "start")
    b += t(430, 96, "c = (D − d)/2", 11, TX, "start")
    b += t(430, 114, "Std Measure Distance antara", 10.5, AX, "start")
    b += t(430, 130, "dua muka silinder sesumbu = c", 10.5, AX, "start")
    b += t(430, 158, f"contoh D = {D_LUB}, d = {ind(D_POR, 2)}:", 10.5, AX, "start")
    b += t(430, 176, f"c = {ind(C_RAD, 3)} mm (celah ⌀ {ind(2 * C_RAD, 2)})", 10.5, "#00e09e", "start")
    b += t(430, 204, "c < 0 → Part Common ≠ 0:", 10.5, "#ef4444", "start")
    b += t(430, 220, "volume interferensi, solver gagal", 10.5, AX, "start")
    b += teks2(340, 244, "Kelonggaran radial dibaca langsung dari model; nilai negatif berarti komponen saling menembus dan harus dikoreksi sebelum joint dibuat", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 4 — Kelonggaran radial poros di dalam lubang dan tanda interferensi")


def gambar5():
    b = ""
    # lembar TechDraw
    b += f'<rect x="20" y="24" width="352" height="222" fill="rgba(255,255,255,.03)" stroke="{AX}" stroke-width="1.2"/>'
    b += f'<rect x="20" y="212" width="352" height="34" fill="rgba(255,255,255,.02)" stroke="{AX}" stroke-width=".8"/>'
    b += t(30, 234, "RAKITAN DUDUKAN PIN  ·  A4  ·  1:2", 9.5, AX, "start")
    b += t(362, 234, "Lembar 1/1", 9.5, AX, "end")
    cx, cy, s = 150, 160, 1.0
    a, bb, tt = 120, 70, 15
    dasar = [_iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [_iso(x, y, tt, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        b += _poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.20)", "#22d3ee", 1.6)
    n = 28
    for (px, py, rr, hh, warna) in [(30, 35, 5, 50, "#f59e0b"), (90, 35, 5, 50, "#f59e0b"), (60, 35, 15, 40, "#a855f7")]:
        for i in range(n):
            t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
            b += _poli([_iso(px + rr * math.cos(t0), py + rr * math.sin(t0), tt, cx, cy, s), _iso(px + rr * math.cos(t1), py + rr * math.sin(t1), tt, cx, cy, s),
                        _iso(px + rr * math.cos(t1), py + rr * math.sin(t1), tt + hh, cx, cy, s), _iso(px + rr * math.cos(t0), py + rr * math.sin(t0), tt + hh, cx, cy, s)],
                       "rgba(148,163,184,.08)", warna, 0.5)
        b += _poli([_iso(px + rr * math.cos(k / n * 2 * math.pi), py + rr * math.sin(k / n * 2 * math.pi), tt + hh, cx, cy, s) for k in range(n)], "rgba(245,158,11,.25)", warna, 1.2)
    # balloon
    for (px, py, z, no, bx_, by_) in [(a, 10, tt, "1", 300, 150), (90, 35, tt + 50, "2", 262, 56), (60, 35, tt + 40, "3", 96, 60)]:
        p = _iso(px, py, z, cx, cy, s)
        b += _garis(p[0], p[1], bx_, by_, TX, 0.9) + _ling(p[0], p[1], 2, TX, TX, 1)
        b += _ling(bx_, by_, 10, "#0a101f", "#00e09e", 1.4) + t(bx_, by_ + 4, no, 10, "#00e09e", "middle", "700")
    # tabel BOM
    x0, y0, w_, rh = 396, 40, 268, 22
    b += f'<rect x="{x0}" y="{y0}" width="{w_}" height="{rh * 4}" fill="rgba(0,224,158,.04)" stroke="#00e09e" stroke-width="1.2"/>'
    for i in range(1, 4):
        b += _garis(x0, y0 + rh * i, x0 + w_, y0 + rh * i, "rgba(0,224,158,.4)", 0.8)
    kolom = [(x0 + 8, "No"), (x0 + 40, "Nama komponen"), (x0 + 168, "Jml"), (x0 + 206, "Bahan")]
    for x, s_ in kolom:
        b += t(x, y0 + 15, s_, 10, "#00e09e", "start", "700")
    baris = [("1", "Pelat dasar 120 × 70 × 15", "1", "S235"), ("2", "Pin ⌀10 × 50", "2", "C45"), ("3", "Boss ⌀30 × 40", "1", "S235")]
    for i, row in enumerate(baris):
        for (x, _), s_ in zip(kolom, row):
            b += t(x, y0 + rh * (i + 1) + 15, s_, 10, TX if i == 0 else AX, "start")
    b += t(396, 150, "Balloon ↔ nomor baris BOM", 10.5, TX, "start", "600")
    b += t(396, 168, "Assembly → Bill of Materials", 10.5, AX, "start")
    b += t(396, 184, "(Spreadsheet: nama, jumlah)", 10.5, AX, "start")
    b += t(396, 200, "TechDraw: View rakitan + Balloon", 10.5, AX, "start")
    b += t(396, 216, "+ Section View untuk pin di lubang", 10.5, AX, "start")
    b += teks2(340, 264, "Gambar rakitan menampilkan semua komponen pada posisinya dengan balloon bernomor; BOM mendaftar nomor, nama, jumlah, dan bahan", 11, AX, maks=70)
    return svg(680, 290, b, "Gambar 5 — Gambar rakitan TechDraw dengan balloon dan tabel BOM")


def gambar6():
    b = ""
    # kiri: pusat massa gabungan (tampak samping XZ)
    s = 1.4
    ox, oz = 30, 212
    X = lambda x: ox + x * s
    Z = lambda z: oz - z * s
    xm = X(A_P / 2)
    b += t(xm, 40, "Pusat massa gabungan", 11.5, "#22d3ee", "middle", "600")
    b += f'<rect x="{X(0)}" y="{Z(T_P)}" width="{A_P * s}" height="{T_P * s}" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width="1.6"/>'
    b += f'<rect x="{X(A_P / 2 - D_BOSS / 2)}" y="{Z(T_P + H_BOSS)}" width="{D_BOSS * s}" height="{H_BOSS * s}" fill="rgba(245,158,11,.18)" stroke="#f59e0b" stroke-width="1.6"/>'
    g1, g2, g = (xm, Z(T_P / 2)), (xm, Z(T_P + H_BOSS / 2)), (xm, Z(Z_BAR))
    for (px, py, c) in [(g1[0], g1[1], "#22d3ee"), (g2[0], g2[1], "#f59e0b")]:
        b += _ling(px, py, 3.5, "#0a101f", c, 1.4) + _garis(px - 7, py, px + 7, py, c, 1) + _garis(px, py - 7, px, py + 7, c, 1)
    b += _ling(g[0], g[1], 4.5, "#00e09e", "#0a101f", 1.2)
    b += t(X(0) - 6, g1[1] + 4, "G₁", 10, "#22d3ee", "end", "700")
    b += t(X(A_P / 2 + D_BOSS / 2) + 6, g2[1] + 4, "G₂", 10, "#f59e0b", "start", "700")
    b += _garis(X(A_P) + 4, Z(0), X(A_P) + 28, Z(0), AX, 0.8, "3 2") + _garis(g[0], g[1], X(A_P) + 34, g[1], "#00e09e", 0.8, "3 2")
    b += arrow(X(A_P) + 22, Z(0), X(A_P) + 22, g[1], "#00e09e", 1.2)
    b += t(X(A_P) + 16, (Z(0) + g[1]) / 2 + 5, "z̄", 10.5, "#00e09e", "end", "700")
    b += t(X(A_P) + 38, g[1] + 4, "G (z̄)", 10, "#00e09e", "start", "700")
    b += t(xm, Z(T_P + H_BOSS) - 8, f"boss ⌀{D_BOSS} × {H_BOSS}", 10, "#f59e0b", "middle")
    b += t(xm, 230, f"pelat {A_P} × {B_P} × {T_P}", 10, "#22d3ee", "middle")
    b += t(xm, 248, f"z̄ = (V₁z₁ + V₂z₂)/(V₁ + V₂) = {ind(Z_BAR, 2)} mm", 10, "#00e09e", "middle")
    # kanan: transmisi sabuk terbuka
    b += t(505, 40, "Transmisi sabuk terbuka", 11.5, "#a855f7", "middle", "600")
    sk = 0.6
    c1x, c2x, cy = 430, 430 + C_P * sk, 150
    r1, r2 = D1_P / 2 * sk, D2_P / 2 * sk
    beta = math.asin((r2 - r1) / (C_P * sk))
    pts = []
    n = 30
    a0, a1 = math.pi / 2 + beta, 3 * math.pi / 2 - beta
    for k in range(n + 1):
        ang = a0 + (a1 - a0) * k / n
        pts.append((c1x + r1 * math.cos(ang), cy - r1 * math.sin(ang)))
    a0, a1 = -math.pi / 2 - beta, math.pi / 2 + beta
    for k in range(n + 1):
        ang = a0 + (a1 - a0) * k / n
        pts.append((c2x + r2 * math.cos(ang), cy - r2 * math.sin(ang)))
    b += _poli(pts, "none", "#a855f7", 2.4)
    b += _ling(c1x, cy, r1, "rgba(34,211,238,.15)", "#22d3ee", 1.4) + _ling(c2x, cy, r2, "rgba(245,158,11,.15)", "#f59e0b", 1.4)
    b += _ling(c1x, cy, 3, TX, TX, 1) + _ling(c2x, cy, 3, TX, TX, 1)
    b += t(c1x, cy + r1 + 16, "⌀D₁", 10.5, "#22d3ee", "middle", "700")
    b += t(c2x, cy + r2 + 16, "⌀D₂", 10.5, "#f59e0b", "middle", "700")
    y_dim = 232
    b += _garis(c1x, cy + 6, c1x, y_dim + 6, AX, 0.8, "3 2") + _garis(c2x, cy + 6, c2x, y_dim + 6, AX, 0.8, "3 2")
    b += arrow(c1x, y_dim, c2x, y_dim, "#00e09e", 1.2) + arrow(c2x, y_dim, c1x, y_dim, "#00e09e", 1.2)
    b += t((c1x + c2x) / 2, y_dim - 5, "C", 10.5, "#00e09e", "middle", "700")
    b += t(505, 62, "L = 2C + π(D₁ + D₂)/2 + (D₂ − D₁)²/(4C)", 10, TX, "middle")
    b += t(505, 80, f"contoh D₁ = {D1_P}, D₂ = {D2_P}, C = {C_P}:", 10, AX, "middle")
    b += t(505, 96, f"L ≈ {ind(L_SABUK, 2)} mm, i = D₂/D₁ = {I_SABUK:g}", 10, "#00e09e", "middle")
    b += t(505, 250, "sabuk ungu = 2 busur lilit + 2 garis singgung", 10, AX, "middle")
    return svg(680, 264, b, "Gambar 6 — Pusat massa gabungan pelat dan boss serta geometri transmisi sabuk dua puli")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-assembly">Assembly 1.0</a>
  <a href="#m-joint">Joint &amp; DOF</a>
  <a href="#m-insert">Komponen &amp; Ground</a>
  <a href="#m-mekanisme">Mekanisme</a>
  <a href="#m-clearance">Tabrakan &amp; Clearance</a>
  <a href="#m-bom">BOM &amp; Gambar</a>
  <a href="#m-analisis">Massa &amp; Sabuk</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="120" x2="92" y2="120" stroke="rgba(148,163,184,.45)" stroke-width="1.2"/>
      <circle cx="26" cy="120" r="18" fill="none" stroke="rgba(255,179,0,.35)" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="26" y1="120" x2="38" y2="106" stroke="rgba(255,179,0,.8)" stroke-width="3" stroke-linecap="round"/>
      <line x1="38" y1="106" x2="78" y2="120" stroke="rgba(0,229,255,.7)" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="70" y="112" width="18" height="16" rx="2" fill="rgba(124,77,255,.3)" stroke="rgba(124,77,255,.7)" stroke-width="1.2"/>
      <circle cx="26" cy="120" r="3" fill="#0a101f" stroke="rgba(226,232,240,.8)" stroke-width="1"/>
      <circle cx="38" cy="106" r="3" fill="#0a101f" stroke="rgba(226,232,240,.8)" stroke-width="1"/>
      <circle cx="78" cy="120" r="3" fill="#0a101f" stroke="rgba(226,232,240,.8)" stroke-width="1"/>
      <text x="50" y="160" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">Revolute · Slider</text>
      <text x="50" y="176" text-anchor="middle" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">F = 1 DOF</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="60" r="12" fill="none" stroke="rgba(0,229,255,.6)" stroke-width="1.3"/>
      <circle cx="66" cy="60" r="24" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.3"/>
      <line x1="30" y1="48" x2="66" y2="36" stroke="rgba(124,77,255,.7)" stroke-width="1.6"/>
      <line x1="30" y1="72" x2="66" y2="84" stroke="rgba(124,77,255,.7)" stroke-width="1.6"/>
      <rect x="18" y="130" width="64" height="12" fill="rgba(0,229,255,.15)" stroke="rgba(0,229,255,.5)" stroke-width="1"/>
      <rect x="40" y="104" width="20" height="26" fill="rgba(255,179,0,.2)" stroke="rgba(255,179,0,.6)" stroke-width="1"/>
      <circle cx="50" cy="128" r="3.5" fill="rgba(0,230,118,.9)"/>
      <text x="50" y="165" text-anchor="middle" fill="rgba(0,230,118,.6)" font-family="JetBrains Mono" font-size="8">z̄ = ΣVᵢzᵢ/ΣVᵢ</text>
      <text x="50" y="205" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">L = 2C + π(D₁+D₂)/2</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="11">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Insert Link</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">F = 3(n − 1) − 2j₁</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">Revolute · Slider</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">x = r cos θ + √(l² − r² sin² θ)</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">c = (D − d)/2</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">CenterOfMass</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">L = 2C + π(D₁ + D₂)/2</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">Balloon · BOM</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 12 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dari Komponen</span><br>
      <em>ke Rakitan:</em><br>
      <span class="hl-amber">Joint, Gerak, Analisis</span>
    </h1>
    <p class="hero-sub">Komponen yang selesai dimodelkan harus dirakit dan dianalisis sebagai sistem. Pertemuan ini memakai Assembly Workbench FreeCAD 1.0: memasukkan komponen sebagai link, menetapkan acuan diam (grounded), memilih joint yang tepat menurut derajat kebebasan, menggerakkan mekanisme engkol-peluncur, memeriksa tabrakan dan kelonggaran, menyusun BOM dan gambar rakitan dengan balloon, lalu membaca massa total, pusat massa, dan geometri transmisi sabuk dari model; tugasnya lima rakitan FreeCAD dengan satu angka bacaan tiap rakitan.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Link, grounding, joint, dan DOF</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Mekanisme, clearance, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Rakitan FreeCAD, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — Assembly Workbench 1.0
    isi = figure(1, "Alur kerja Assembly Workbench 1.0 dan pohon dokumen rakitan", "Rakitan dibuat lima langkah: Create Assembly, Insert Link komponen, tetapkan satu komponen grounded, buat joint antar acuan geometri, lalu solve. Pohon dokumen hanya menyimpan link, Placement, dan joint; geometri tetap milik Body asal.", gambar1())
    isi += cards([
        ("🧩", "Assembly container", "Objek Assembly::AssemblyObject (turunan Part container) menampung link ke komponen, grup Joints, dan hasil solver. Satu dokumen boleh memuat beberapa Assembly; sebuah Assembly boleh dimasukkan ke Assembly lain sebagai sub-assembly.", "1 Assembly = 1 rakitan"),
        ("🔗", "App::Link, bukan salinan", "Insert Link merujuk Body/Part asli (dalam dokumen yang sama atau berkas .FCStd lain). Mengubah sketsa komponen memperbarui semua rakitan yang memakainya; berkas tetap ringan karena geometri tidak digandakan.", "rujuk, jangan gandakan"),
        ("⚓", "Grounded part", "Satu komponen dikunci ke sistem koordinat rakitan (GroundedJoint) sebagai acuan diam. Tanpa acuan, solver tidak punya pegangan: komponen bisa melayang bersama meski semua joint terpenuhi.", "1 acuan diam"),
        ("🧮", "Solver Ondsel", "FreeCAD 1.0 memakai solver Ondsel (OndselSolver) yang memecahkan semua joint sekaligus dan mengizinkan gerak dinamis: komponen yang masih punya DOF dapat diseret dengan mouse (Move part) atau dianimasikan.", "solve → Placement"),
    ])
    isi += tabel(["Perintah Assembly 1.0", "Fungsi", "Catatan penggunaan"],
                 [["<strong>Create Assembly</strong>", "Membuat wadah rakitan aktif", "Objek Assembly + grup Joints dibuat otomatis"],
                  ["<strong>Insert Link</strong>", "Memasukkan komponen sebagai App::Link", "Dari dokumen aktif atau dokumen lain yang terbuka; klik berulang menambah salinan link"],
                  ["<strong>Toggle grounded</strong>", "Mengunci/melepas komponen acuan", "Klik kanan link → Toggle grounded; membuat GroundedJoint di grup Joints"],
                  ["<strong>Create Joint</strong> (Fixed, Revolute, Cylindrical, Slider, Ball, Distance, Parallel, Perpendicular, Angle, RackPinion, Screw, Gears, Belt)", "Menghubungkan dua acuan (JCS) pada dua komponen", "Klik muka/rusuk/titik komponen pertama lalu kedua; Offset dan Rotation menggeser acuan"],
                  ["<strong>Solve Assembly</strong>", "Menghitung ulang Placement semua link", "Otomatis setelah joint dibuat; Ctrl+Shift+S bila perlu"],
                  ["<strong>Move part</strong>", "Menyeret komponen yang masih punya DOF", "Memperlihatkan gerak mekanisme secara interaktif"],
                  ["<strong>Bill of Materials</strong>", "Menghasilkan Spreadsheet daftar komponen", "Kolom nama, jumlah, deskripsi; dasar BOM gambar rakitan"],
                  ["<strong>Export ASMT</strong>", "Mengekspor rakitan ke format ASMT", "Untuk simulasi dinamika lanjutan di luar FreeCAD"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 menjelaskan joint dan derajat kebebasan sebagai bahasa perakitan. Bagian 03 memasukkan komponen dan menetapkan acuan diam (Tugas 1 dan 3). Bagian 04 menggerakkan mekanisme engkol-peluncur (Tugas 4), Bagian 05 memeriksa tabrakan dan kelonggaran (Tugas 2), Bagian 06 menyusun BOM dan gambar rakitan, dan Bagian 07 membaca massa, pusat massa, serta geometri sabuk (Tugas 3 dan 5). Bagian 08–09 menutup dengan Python dan praktik engkol-peluncur.")
    m += bagian(1, "m-assembly", "Assembly Workbench 1.0:<br>Rakitan sebagai Kumpulan Tautan", "FreeCAD 1.0 membawa Assembly Workbench bawaan: komponen dimasukkan sebagai link, satu komponen menjadi acuan diam, dan joint mengikat sisanya. Bagian ini memperkenalkan objek, perintah, dan cara berpikir merakit.", isi, "ASSEMBLY WORKBENCH")

    # 02 — Joint dan DOF
    isi = figure(2, "Jenis joint Assembly 1.0 dan derajat kebebasan yang tersisa", "Komponen bebas punya 6 derajat kebebasan (3 translasi + 3 rotasi). Fixed menghapus semuanya; Revolute menyisakan satu rotasi; Cylindrical satu rotasi dan satu translasi sesumbu; Slider satu translasi; Ball tiga rotasi; Distance hanya mengunci jarak.", gambar2())
    isi += tabel(["Joint", "Acuan yang disamakan", "DOF sisa", "Contoh pasangan mesin"],
                 [["<strong>Fixed</strong>", "Titik asal + orientasi JCS", "0", "Pin dipres pada pelat, baut yang dianggap kaku (Tugas 1, 3)"],
                  ["<strong>Revolute</strong>", "Titik asal + sumbu Z", "1 rotasi", "Engsel, pin engkol, poros pada bantalan aksial-tetap (Tugas 4)"],
                  ["<strong>Cylindrical</strong>", "Sumbu Z saja", "1 rotasi + 1 translasi", "Poros di dalam bus, piston di silinder (Tugas 2)"],
                  ["<strong>Slider</strong>", "Sumbu Z + orientasi", "1 translasi", "Peluncur pada rel, meja mesin (Tugas 4)"],
                  ["<strong>Ball</strong>", "Titik asal saja", "3 rotasi", "Sendi bola, rod end, tuas persneling"],
                  ["<strong>Distance</strong>", "Jarak antar acuan", "5", "Dua puli berjarak C, roda menyentuh lantai (Tugas 5)"],
                  ["<strong>Parallel / Perpendicular / Angle</strong>", "Arah sumbu", "4", "Pelat sejajar, sudut antar lengan"],
                  ["<strong>RackPinion / Screw / Gears / Belt</strong>", "Hubungan gerak dua joint", "kopling gerak", "Rasio putaran roda gigi, ulir, sabuk"]])
    isi += formula(1, "Derajat Kebebasan Mekanisme Bidang (Grübler–Kutzbach)", r"F = 3\,(n - 1) - 2\,j_1 - j_2",
                   r"\(n\) = jumlah batang termasuk dasar &nbsp;·&nbsp; \(j_1\) = jumlah pasangan satu-DOF (Revolute, Slider) &nbsp;·&nbsp; \(j_2\) = pasangan dua-DOF. Engkol-peluncur: \(n = 4\), \(j_1 = 4\) → \(F = 9 - 8 = 1\).",
                   "Sebelum menambah joint, hitung berapa DOF yang ingin disisakan. Mekanisme dengan F = 1 cukup digerakkan satu penggerak (motor pada engkol); F = 0 adalah struktur kaku (rakitan pin–pelat); F < 0 berarti joint berlebih (over-constrained) dan solver akan mengeluh atau memaksa geometri. Pada Assembly 1.0, DOF sisa tampak dari komponen yang masih bisa diseret dengan Move part.",
                   [("F", "Derajat kebebasan mekanisme"), ("n", "Jumlah batang termasuk dasar"), ("j_1", "Pasangan satu-DOF (engsel, peluncur)"), ("j_2", "Pasangan dua-DOF (cam, silinder bidang)")])
    isi += anim_panel(1, "cyan", "Engkol-peluncur: Revolute + Slider menyisakan satu DOF", "cvEngkol",
                      [("sl_ek_r", "v_ek_r", "Jari-jari engkol r (mm)", 10, 45, 1, 25, "25"),
                       ("sl_ek_l", "v_ek_l", "Panjang batang l (mm)", 50, 140, 1, 90, "90"),
                       ("sl_ek_th", "v_ek_th", "Sudut engkol θ saat PAUSE (°)", 0, 360, 1, 60, "60")],
                      "btnEngkol", "toggleEngkol", "engkolInfo",
                      "<strong>Cara membaca:</strong> engkol (jingga) berputar pada Revolute O, batang (biru) mengikuti lewat Revolute A dan B, peluncur (ungu) hanya bisa bergeser pada rel (Slider). Satu sudut θ menentukan seluruh posisi: itulah F = 1. Grafik kanan memplot x(θ); PAUSE lalu geser θ untuk membaca posisi tertentu.")
    isi += kotak("warning-box", "⚠️ <strong>Joint berlebih:</strong> menambah Fixed pada komponen yang sudah diikat Revolute + Slider membuat F < 0; solver Ondsel menampilkan peringatan dan mekanisme berhenti bergerak. Bila komponen tidak bergerak saat Move part padahal seharusnya bisa, periksa apakah ada joint ganda pada pasangan yang sama atau komponen tanpa sengaja di-grounded.")
    m += bagian(2, "m-joint", "Joint dan Derajat Kebebasan:<br>Bahasa Perakitan", "Setiap joint menghapus sebagian derajat kebebasan komponen. Bagian ini memetakan jenis joint Assembly 1.0, DOF yang tersisa, rumus Grübler untuk mekanisme, dan jebakan joint berlebih.", isi, "JOINT DAN DOF")

    # 03 — Memasukkan komponen dan grounding
    isi = tabel(["Langkah", "Perintah", "Yang terjadi di pohon dokumen"],
                [["1. Siapkan komponen", "Part Design Body (atau Part) per komponen, boleh di berkas terpisah", "Body tetap di luar Assembly"],
                 ["2. Buat rakitan", "Assembly → Create Assembly", "Assembly + Joints dibuat"],
                 ["3. Masukkan", "Insert Link → pilih Body", "App::Link di dalam Assembly, Placement awal = titik asal"],
                 ["4. Acuan diam", "Klik kanan link pelat → Toggle grounded", "GroundedJoint pada link itu"],
                 ["5. Ikat", "Create Joint → pilih acuan komponen A lalu B", "Objek joint di grup Joints; solver memindahkan komponen yang tidak grounded"],
                 ["6. Atur posisi tepat", "Properti joint Offset / Rotation, atau Placement link", "Ekspresi boleh merujuk Spreadsheet (mis. C = Spreadsheet.C)"]])
    isi += cards([
        ("📎", "Link vs Clone vs Copy", "App::Link (Assembly) merujuk objek asli; Draft Clone menyalin bentuk parametrik dengan skala; Copy memutus hubungan. Rakitan selalu memakai link agar perubahan komponen mengalir ke semua rakitan.", "Link → hidup"),
        ("📂", "Komponen dari berkas lain", "Buka berkas komponen, lalu Insert Link dari dokumen rakitan memilih objek di dokumen lain; FreeCAD menyimpan tautan berkas relatif. Pindahkan berkas bersama-sama agar tautan tidak putus.", "xlink"),
        ("📍", "Placement dan JCS", "Setiap link punya Placement (Base, Rotation) terhadap koordinat Assembly. Joint bekerja pada JCS (joint coordinate system) yang ditempatkan otomatis di pusat muka/rusuk/titik yang diklik; Offset dan Rotation joint menggeser JCS itu.", "Placement = hasil solver"),
        ("🧱", "Sub-assembly", "Assembly yang sudah jadi dapat dimasukkan ke Assembly lain (Insert Link pada objek Assembly). Joint internalnya tetap; terhadap induknya ia bersikap seperti satu komponen kaku kecuali dibiarkan fleksibel.", "rakitan di dalam rakitan"),
    ])
    isi += anim_panel(2, "amber", "Placement komponen menggeser pusat massa rakitan", "cvPusatMassa",
                      [("sl_pm_x", "v_pm_x", "Posisi boss x_B saat PAUSE (mm)", 15, 105, 1, 60, "60"),
                       ("sl_pm_d", "v_pm_d", "Diameter boss d_B (mm)", 10, 50, 1, 30, "30"),
                       ("sl_pm_h", "v_pm_h", "Tinggi boss h_B (mm)", 10, 70, 1, 40, "40")],
                      "btnPusatMassa", "togglePusatMassa", "pusatMassaInfo",
                      "<strong>Cara membaca:</strong> pelat 120 × 70 × 15 grounded; boss dipindah lewat Placement (Fixed joint dengan Offset). Tanda G₁ dan G₂ adalah pusat massa tiap komponen, G hijau adalah pusat massa gabungan yang bergeser mengikuti boss: x̄ mengikuti posisi, z̄ mengikuti tinggi dan volume boss (Persamaan (4)).")
    isi += kotak("info-box", "<strong>🧭 Urutan yang aman:</strong> masukkan komponen acuan dulu, ground-kan, baru masukkan komponen lain satu per satu dan langsung beri joint. Memasukkan sepuluh komponen sekaligus tanpa joint membuat semuanya bertumpuk di titik asal dan sulit dipilih; gunakan Move part untuk menjauhkan sementara sebelum memilih acuan joint.")
    m += bagian(3, "m-insert", "Memasukkan Komponen dan Grounding:<br>Link, Placement, Acuan Diam", "Rakitan dimulai dari komponen yang dimasukkan sebagai link dan satu acuan diam. Bagian ini menguraikan langkah, perbedaan link dengan salinan, komponen dari berkas lain, Placement dan JCS, serta sub-assembly.", isi, "KOMPONEN DAN GROUNDING")

    # 04 — Mekanisme dan gerak
    isi = figure(3, "Geometri engkol-peluncur: r, l, θ, dan posisi peluncur x", f"Engkol r = {R_ENG} berputar di O, batang l = {L_BAT} menghubungkan A ke pin peluncur B yang hanya bergeser pada sumbu X. Pada θ = {TH_ENG}°, x = {ind(X_PEL, 3)} mm dan batang miring φ = {ind(PHI_BAT, 2)}°.", gambar3())
    isi += formula(2, "Posisi Peluncur pada Mekanisme Engkol-Peluncur", r"x = r\cos\theta + \sqrt{l^{2} - r^{2}\sin^{2}\theta}, \qquad \sin\varphi = \frac{r\sin\theta}{l}",
                   r"\(r\) = jari-jari engkol (jarak sumbu O ke pin A) &nbsp;·&nbsp; \(l\) = panjang batang (pin A ke pin B) &nbsp;·&nbsp; \(\theta\) = sudut engkol dari sumbu X &nbsp;·&nbsp; \(\varphi\) = kemiringan batang. Contoh " + f"r = {R_ENG}, l = {L_BAT}, θ = {TH_ENG}°" + r": \(x = " + ind(X_PEL, 3) + r"\) mm.",
                   "Proyeksi engkol ke sumbu X adalah r cos θ; sisanya adalah proyeksi batang √(l² − (r sin θ)²) dari segitiga siku-siku dengan tinggi r sin θ. Posisi terjauh x = l + r pada θ = 0° dan terdekat x = l − r pada θ = 180°, sehingga langkah peluncur = 2r. Angka ini yang dibaca dari rakitan Tugas 4 setelah sudut engkol dikunci.",
                   [("x", "Posisi pin peluncur dari O (mm)"), ("r", "Jari-jari engkol (mm)"), ("l", "Panjang batang penghubung (mm)"), (r"\theta", "Sudut engkol terhadap sumbu X"), (r"\varphi", "Sudut kemiringan batang")])
    isi += tabel(["Sudut engkol θ", "Posisi x", "Keterangan", f"Contoh r = {R_ENG}, l = {L_BAT}"],
                 [["0°", "l + r", "Titik mati luar (peluncur terjauh)", f"{L_BAT + R_ENG} mm"],
                  ["90°", "√(l² − r²)", "Batang paling miring", f"{ind(math.sqrt(L_BAT ** 2 - R_ENG ** 2), 3)} mm"],
                  ["180°", "l − r", "Titik mati dalam (peluncur terdekat)", f"{L_BAT - R_ENG} mm"],
                  ["270°", "√(l² − r²)", "Simetris dengan 90°", f"{ind(math.sqrt(L_BAT ** 2 - R_ENG ** 2), 3)} mm"],
                  ["langkah", "2r", "Jarak tempuh peluncur per putaran", f"{2 * R_ENG} mm"]])
    isi += tabel(["Cara menggerakkan rakitan", "Perintah 1.0", "Kegunaan"],
                 [["Seret dengan mouse", "Move part (drag komponen ber-DOF)", "Meraba gerak, mencari posisi tabrakan"],
                  ["Kunci sudut", "Properti Revolute: Enable Angle Min/Max = θ", "Menetapkan posisi tertentu untuk diukur (Tugas 4)"],
                  ["Batas gerak", "Enable Length Min/Max pada Slider", "Meniru stopper rel"],
                  ["Kopling gerak", "Joint Gears / Belt / RackPinion antara dua Revolute/Slider", "Rasio putaran puli, roda gigi, rak-pinion"],
                  ["Skrip", "Placement link diubah dalam loop Python (Bagian 08)", "Tabel posisi x(θ) atau animasi otomatis"]])
    isi += anim_panel(3, "green", "Transmisi sabuk dua puli: panjang sabuk dan rasio putaran", "cvSabuk",
                      [("sl_sb_d1", "v_sb_d1", "Diameter puli penggerak D₁ (mm)", 40, 120, 1, 75, "75"),
                       ("sl_sb_d2", "v_sb_d2", "Diameter puli yang digerakkan D₂ (mm)", 80, 240, 1, 150, "150"),
                       ("sl_sb_c", "v_sb_c", "Jarak pusat C (mm)", 150, 400, 1, 250, "250")],
                      "btnSabuk", "toggleSabuk", "sabukInfo",
                      "<strong>Cara membaca:</strong> puli kecil berputar n₁ = 1450 rpm, puli besar mengikuti dengan rasio i = D₂/D₁ (joint Belt pada Assembly 1.0 menyalin gerak ini). Panjang sabuk terbuka mengikuti Persamaan (5); geser C dan lihat suku 2C mendominasi, sedangkan selisih diameter menambah suku (D₂ − D₁)²/(4C) dan mengurangi sudut lilit puli kecil.")
    isi += kotak("tip-box", "💡 <strong>Mengunci sudut engkol untuk diukur:</strong> pada properti joint Revolute engkol–dasar, centang Enable Angle Min dan Enable Angle Max lalu isi keduanya dengan θ; solve. Cara lain: ubah Placement.Rotation link engkol lalu solve; solver memindahkan batang dan peluncur. Bacalah x dari Placement.Base.x link peluncur (bila pin di titik asal lokalnya) atau Std Measure Distance titik asal → pusat pin.")
    m += bagian(4, "m-mekanisme", "Mekanisme dan Gerak:<br>Engkol-Peluncur dan Transmisi", "Rakitan dengan DOF tersisa adalah mekanisme. Bagian ini menurunkan posisi peluncur dari sudut engkol, menampilkan posisi khusus dan langkah, cara menggerakkan dan mengunci rakitan, serta transmisi sabuk sebagai kopling gerak dua puli.", isi, "MEKANISME DAN GERAK")

    # 05 — Tabrakan dan clearance
    isi = figure(4, "Kelonggaran radial poros di dalam lubang dan tanda interferensi", f"Kiri: poros ⌀{ind(D_POR, 2)} di dalam lubang ⌀{D_LUB} menyisakan celah radial c = (D − d)/2 = {ind(C_RAD, 3)} mm yang dibaca Std Measure Distance. Kanan: bila d > D, kedua bentuk tumpang tindih; Part Common menghasilkan volume interferensi dan joint Cylindrical tetap bisa dibuat tetapi fisiknya mustahil.", gambar4())
    isi += formula(3, "Kelonggaran Radial dan Celah Diameter", r"c = \frac{D - d}{2}, \qquad c_{\text{diameter}} = D - d",
                   r"\(D\) = diameter lubang &nbsp;·&nbsp; \(d\) = diameter poros &nbsp;·&nbsp; \(c\) = kelonggaran radial (satu sisi). Contoh " + f"D = {D_LUB}, d = {ind(D_POR, 2)}" + r": \(c = " + ind(C_RAD, 3) + r"\) mm.",
                   "Kelonggaran radial adalah jarak terdekat antara permukaan poros dan dinding lubang ketika keduanya sesumbu, persis yang diukur Std Measure Distance antara dua muka silinder. Nilai positif berarti suaian longgar (poros bebas berputar), nol berarti pas, negatif berarti interferensi (suaian sesak atau kesalahan model). Tugas 2 membaca c dari rakitan Cylindrical joint dengan empat desimal.",
                   [("c", "Kelonggaran radial (mm)"), ("D", "Diameter lubang (mm)"), ("d", "Diameter poros (mm)"), (r"c_{\text{diameter}}", "Celah total pada diameter (mm)")])
    isi += tabel(["Pemeriksaan", "Alat di FreeCAD 1.0", "Bacaan", "Kapan dipakai"],
                 [["Jarak terdekat dua komponen", "Std Measure Distance (pilih dua muka/rusuk)", "mm; 0 bila bersentuhan", "Kelonggaran poros-lubang, celah lengan–rangka"],
                  ["Volume tumpang tindih", "Part → Boolean → Common pada dua bentuk link", "mm³; > 0 berarti interferensi", "Uji tabrakan pada posisi tertentu"],
                  ["Jarak minimum skrip", "<code>shapeA.distToShape(shapeB)[0]</code>", "mm dan pasangan titik terdekat", "Loop banyak posisi θ (Bagian 08)"],
                  ["Kesehatan geometri", "Part → Check geometry", "Daftar kesalahan solid", "Sebelum Boolean/joint bila solver menolak"],
                  ["Batas gerak", "Enable Length/Angle Min-Max pada joint", "Gerak berhenti di batas", "Meniru stopper agar tidak menabrak"],
                  ["Visual", "Transparansi + Section cutting (View)", "Pengamatan", "Melihat pin di dalam lubang, celah bantalan"]])
    isi += anim_panel(4, "violet", "Kelonggaran poros-lubang: dari longgar ke interferensi", "cvClearance",
                      [("sl_cl_D", "v_cl_D", "Diameter lubang D (mm)", 20, 40, 0.1, 25, "25,0"),
                       ("sl_cl_d", "v_cl_d", "Diameter poros d saat PAUSE (mm)", 19.5, 40.5, 0.01, 24.94, "24,94")],
                      "btnClearance", "toggleClearance", "clearanceInfo",
                      "<strong>Cara membaca:</strong> celah antara poros (jingga) dan lubang (biru) diperbesar 300× agar terlihat; saat berjalan, diameter poros berdenyut ±0,08 mm di sekitar nilai slider sehingga celah berubah dari kelonggaran (hijau) menjadi interferensi (merah). Angka c = (D − d)/2 mengikuti Persamaan (3); Part Common bernilai nol hanya saat c ≥ 0.")
    isi += kotak("warning-box", "⚠️ <strong>Joint tidak memeriksa tabrakan:</strong> solver hanya memenuhi persamaan joint; poros ⌀25,02 tetap bisa diberi Cylindrical joint di lubang ⌀25 tanpa peringatan. Pemeriksaan interferensi adalah tugas pemodel: Part Common atau distToShape pada posisi kritis (titik mati, sudut ekstrem), bukan hanya pada posisi awal.")
    m += bagian(5, "m-clearance", "Tabrakan dan Clearance:<br>Memastikan Komponen Tidak Saling Menembus", "Rakitan yang benar secara joint belum tentu benar secara fisik. Bagian ini membahas kelonggaran radial poros-lubang, alat pemeriksa jarak dan volume tumpang tindih, serta kebiasaan menguji posisi kritis mekanisme.", isi, "TABRAKAN DAN CLEARANCE")

    # 06 — BOM dan gambar rakitan
    isi = figure(5, "Gambar rakitan TechDraw dengan balloon dan tabel BOM", "Lembar A4 memuat pandangan isometrik rakitan pelat, dua pin, dan boss dengan balloon 1–3; tabel BOM di kanan mendaftar nomor, nama, jumlah, dan bahan. Nomor balloon dan nomor baris BOM harus sama.", gambar5())
    isi += tabel(["Kolom BOM", "Isi", "Sumber di FreeCAD"],
                 [["No", "Nomor butir = nomor balloon", "Urutan baris Spreadsheet BOM"],
                  ["Nama komponen", "Label Body/Part yang dirujuk link", "Assembly → Bill of Materials (kolom Name)"],
                  ["Jumlah", "Banyaknya link ke komponen yang sama", "Kolom Quantity (link identik dihitung otomatis)"],
                  ["Bahan", "Material Body (tab Data → Material pada 1.0)", "Kolom tambahan Spreadsheet, atau properti Material"],
                  ["Massa", "ρ × Volume tiap komponen", "Spreadsheet: =Volume × ρ, atau Python (Bagian 08)"],
                  ["Keterangan", "Standar (DIN/ISO), ukuran nominal, perlakuan", "Diisi manual"]])
    isi += cards([
        ("🎈", "Balloon", "TechDraw → Balloon: klik pada komponen dalam pandangan, lalu geser lingkaran nomor. Nomor mengikuti baris BOM; balloon yang menunjuk komponen sama cukup satu.", "nomor ↔ BOM"),
        ("📋", "Spreadsheet BOM", "Assembly → Bill of Materials membuat Spreadsheet berisi nama dan jumlah setiap komponen unik; TechDraw → Spreadsheet View menempelkannya ke lembar gambar sebagai tabel.", "Assembly → BOM"),
        ("🔪", "Pandangan potong rakitan", "TechDraw Section View pada rakitan memperlihatkan pin di dalam lubang dan bantalan pada poros; arsir tiap komponen dibedakan arah/skalanya agar batas komponen terlihat.", "Section A-A"),
        ("💥", "Exploded view", "Tampilan terurai dibuat dengan Placement sementara (Std → Exploded view pada 1.0, atau menggeser link) untuk menunjukkan urutan pemasangan; balloon lebih mudah dipasang pada pandangan ini.", "urutan pasang"),
    ])
    isi += kotak("tip-box", "💡 <strong>Pandangan rakitan di TechDraw:</strong> pilih objek Assembly (bukan Body satu per satu) saat Insert View agar seluruh komponen tergambar pada Placement rakitannya. Bila pandangan kosong, pastikan link sudah di-solve dan objek Assembly yang dipilih, bukan grup Joints.")
    m += bagian(6, "m-bom", "BOM dan Gambar Rakitan:<br>Balloon, Daftar Komponen, Potongan", "Rakitan harus bisa dikomunikasikan ke bengkel dan pembelian. Bagian ini membahas gambar rakitan TechDraw dengan balloon, Spreadsheet BOM dari Assembly, pandangan potong rakitan, dan tampilan terurai.", isi, "BOM DAN GAMBAR RAKITAN")

    # 07 — Analisis sistem: massa, pusat massa, sabuk
    isi = figure(6, "Pusat massa gabungan pelat dan boss serta geometri transmisi sabuk dua puli", f"Kiri: pelat {A_P} × {B_P} × {T_P} dan boss ⌀{D_BOSS} × {H_BOSS} berbahan sama; pusat massa gabungan G berada pada z̄ = {ind(Z_BAR, 2)} mm, di antara G₁ (z = {ind(T_P / 2, 1)}) dan G₂ (z = {ind(T_P + H_BOSS / 2, 1)}). Kanan: sabuk terbuka pada puli ⌀{D1_P} dan ⌀{D2_P} berjarak C = {C_P}; L ≈ {ind(L_SABUK, 2)} mm.", gambar6())
    isi += formula(4, "Massa Total dan Pusat Massa Rakitan", r"m = \sum_i \rho_i V_i, \qquad \bar{z} = \frac{\sum_i V_i\,z_i}{\sum_i V_i}\ \ (\rho\ \text{sama}), \qquad \bar{z}_{pelat+boss} = \frac{V_1\,\tfrac{t}{2} + V_2\left(t + \tfrac{h_B}{2}\right)}{V_1 + V_2}",
                   r"\(V_i, z_i\) = volume dan koordinat pusat massa tiap komponen (pada Placement rakitan) &nbsp;·&nbsp; \(t\) = tebal pelat &nbsp;·&nbsp; \(h_B\) = tinggi boss. Contoh: \(V_1 = " + ind(V_PELAT, 0) + r"\), \(V_2 = " + ind(V_BOSS, 1) + r"\) → \(\bar{z} = " + ind(Z_BAR, 3) + r"\) mm; massa baja rakitan pelat + pin " + f"{A_P} × {B_P} × {T_P}, ⌀{D_PIN} × {L_PIN}" + r": \(m = " + ind(V_RAKIT / 1000 * RHO_BAJA, 1) + r"\) g.",
                   "Pusat massa rakitan adalah rata-rata pusat massa komponen tertimbang massanya; untuk bahan seragam cukup tertimbang volume. Di FreeCAD, Part.makeCompound dari Shape tiap link (yang sudah memuat Placement) memberi CenterOfMass gabungan langsung; bila bahan berbeda, hitung Σρ·V·z / Σρ·V dari CenterOfMass tiap link. Angka ini menentukan pemilihan motor, keseimbangan, dan titik angkat rakitan.",
                   [("m", "Massa total rakitan (g)"), (r"\rho_i", "Massa jenis komponen i (g/cm³)"), ("V_i", "Volume komponen i (mm³)"), ("z_i", "Koordinat z pusat massa komponen i (mm)"), (r"\bar{z}", "Pusat massa gabungan (mm)")])
    isi += formula(5, "Panjang Sabuk Terbuka dan Rasio Putaran", r"L = 2C + \frac{\pi\,(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^{2}}{4C}, \qquad i = \frac{n_1}{n_2} = \frac{D_2}{D_1}",
                   r"\(C\) = jarak pusat puli &nbsp;·&nbsp; \(D_1, D_2\) = diameter puli penggerak dan yang digerakkan &nbsp;·&nbsp; \(n\) = putaran (rpm). Contoh " + f"D₁ = {D1_P}, D₂ = {D2_P}, C = {C_P}" + r": \(L = " + ind(L_SABUK, 2) + r"\) mm (panjang singgung tepat " + ind(L_SABUK_TEPAT, 2) + r" mm), \(i = " + f"{I_SABUK:g}" + r"\), \(n_2 = " + ind(N1_RPM / I_SABUK, 0) + r"\) rpm dari \(n_1 = 1450\).",
                   "Sabuk terbuka terdiri atas dua garis singgung (masing-masing ≈ C) dan dua busur lilit (jumlahnya ≈ setengah keliling kedua puli); suku ketiga mengoreksi kemiringan garis singgung akibat selisih diameter. Pada rakitan, sketsa sabuk dengan konstrain Tangent memberi panjang tepat lewat Shape.Length; rumus pendekatan berselisih kurang dari 0,1 mm untuk C yang wajar, itulah bacaan Tugas 5.",
                   [("L", "Panjang sabuk (mm)"), ("C", "Jarak pusat puli (mm)"), ("D_1, D_2", "Diameter puli (mm)"), ("i", "Rasio putaran"), ("n_1, n_2", "Putaran puli (rpm)")])
    isi += tabel(["Besaran rakitan", "Std Measure / GUI", "Python console", "Dipakai untuk"],
                 [["Volume total", "Volume tiap link dijumlahkan", "<code>sum(l.Shape.Volume for l in links)</code>", "Massa, biaya bahan (Tugas 1)"],
                  ["Pusat massa gabungan", "—", "<code>Part.makeCompound([l.Shape …]).CenterOfMass</code>", "Keseimbangan, titik angkat (Tugas 3)"],
                  ["Kelonggaran", "Distance dua muka silinder", "<code>a.distToShape(b)[0]</code>", "Suaian poros-lubang (Tugas 2)"],
                  ["Posisi komponen", "Distance titik asal → pusat pin", "<code>link.Placement.Base</code>", "Posisi peluncur (Tugas 4)"],
                  ["Panjang sabuk", "Length tiap edge sketsa", "<code>sketch.Shape.Length</code>", "Pemilihan sabuk standar (Tugas 5)"],
                  ["Kotak pembatas", "—", "<code>compound.BoundBox</code>", "Ruang pemasangan, kemasan"]])
    isi += cards([
        ("⚖️", "Massa total", f"Jumlah ρ·V tiap link. Rakitan pelat {A_P} × {B_P} × {T_P} + pin ⌀{D_PIN} × {L_PIN} dari baja: V = {ind(V_RAKIT, 1)} mm³ → m ≈ {ind(V_RAKIT / 1000 * RHO_BAJA, 1)} g; dari aluminium hanya {ind(V_RAKIT / 1000 * RHO_AL, 1)} g.", "m = Σρ·V"),
        ("🎯", "Pusat massa", "Semakin tinggi dan besar boss, semakin naik z̄; pada mekanisme berputar, pusat massa yang jauh dari sumbu menimbulkan gaya tak seimbang yang harus dilawan penyeimbang (counterweight).", "z̄ = ΣVz/ΣV"),
        ("🔄", "Rasio transmisi", "i = D₂/D₁ = n₁/n₂: puli besar berputar lebih lambat dengan torsi lebih besar. Joint Belt pada Assembly 1.0 mengopling dua Revolute dengan rasio ini.", "i = D₂/D₁"),
        ("📏", "Pemilihan sabuk", "Panjang L dari model dibulatkan ke panjang sabuk standar terdekat; selisihnya diserap dengan menggeser C (pengencang). Kemiringan singgung mengurangi sudut lilit puli kecil → cek ≥ 120°.", "L → standar"),
    ])
    m += bagian(7, "m-analisis", "Analisis Sistem:<br>Massa, Pusat Massa, dan Transmisi Sabuk", "Rakitan memberi besaran yang tidak dimiliki komponen tunggal: massa total, pusat massa gabungan, dan hubungan gerak antar komponen. Bagian ini merumuskan dan membaca ketiganya dari model, termasuk panjang sabuk dan rasio putaran dua puli.", isi, "ANALISIS SISTEM")

    # 08 — Python console
    isi = kode("Python console — rakitan pelat + pin lewat App::Link dan Placement, volume total, pusat massa", f'''import FreeCAD as App, Part
doc = App.newDocument("Latihan11")
V = App.Vector
# Dua komponen (di GUI: Body Part Design; di sini Part.makeBox/makeCylinder agar ringkas)
pelat = doc.addObject("Part::Feature", "Pelat"); pelat.Shape = Part.makeBox({A_P}, {B_P}, {T_P})
pin = doc.addObject("Part::Feature", "Pin"); pin.Shape = Part.makeCylinder({D_PIN / 2}, {L_PIN})
asm = doc.addObject("Assembly::AssemblyObject", "Assembly")           # wadah rakitan (Assembly Workbench 1.0)
lp = asm.newObject("App::Link", "LinkPelat"); lp.LinkedObject = pelat  # = Insert Link
ln = asm.newObject("App::Link", "LinkPin"); ln.LinkedObject = pin
ln.Placement = App.Placement(V({A_P / 2}, {B_P / 2}, {T_P}), App.Rotation())   # pin berdiri di pusat muka atas (= Fixed joint + Offset)
doc.recompute()
bentuk = [l.Shape for l in (lp, ln)]                                  # Shape link sudah memuat Placement rakitan
print(f"V total = {{sum(s.Volume for s in bentuk):.2f}} mm^3")          # {ind(V_RAKIT, 2)}
comp = Part.makeCompound(bentuk)
print(f"Pusat massa gabungan = ({{comp.CenterOfMass.x:.3f}}, {{comp.CenterOfMass.y:.3f}}, {{comp.CenterOfMass.z:.3f}})")
print(f"Massa baja = {{comp.Volume/1000*{RHO_BAJA}:.1f}} g; BoundBox = {{comp.BoundBox}}")
# Grounding dan joint dibuat di GUI (Toggle grounded, Create Joint); solver mengisi Placement seperti baris di atas''', "Python (FreeCAD)")
    isi += kode("Python console — posisi peluncur x(θ) dan menggerakkan rakitan lewat Placement link", f'''import FreeCAD as App, math
r, l = {R_ENG}, {L_BAT}
def x_peluncur(th):
    s = r * math.sin(math.radians(th))
    return r * math.cos(math.radians(th)) + math.sqrt(l*l - s*s)
for th in (0, {TH_ENG}, 90, 180):
    print(f"theta = {{th:3d}} deg -> x = {{x_peluncur(th):8.3f}} mm")      # 115.000  {ind(X_PEL, 3).replace(",", ".")}  {ind(math.sqrt(L_BAT ** 2 - R_ENG ** 2), 3).replace(",", ".")}  65.000
# Rakitan yang sudah dibuat di GUI: LinkEngkol (pin O di titik asal lokal), LinkBatang (pin A di titik asal lokal), LinkPeluncur
doc = App.ActiveDocument
engkol, batang, peluncur = (doc.getObject(n) for n in ("LinkEngkol", "LinkBatang", "LinkPeluncur"))
for th in range(0, 361, 30):                                          # satu putaran engkol, langkah 30 derajat
    phi = math.degrees(math.asin(r * math.sin(math.radians(th)) / l))
    engkol.Placement = App.Placement(App.Vector(0, 0, 0), App.Rotation(App.Vector(0, 0, 1), th))
    batang.Placement = App.Placement(App.Vector(r*math.cos(math.radians(th)), r*math.sin(math.radians(th)), 0), App.Rotation(App.Vector(0, 0, 1), -phi))
    peluncur.Placement.Base = App.Vector(x_peluncur(th), 0, 0)
    doc.recompute()
    print(f"{{th:3d}} deg: x = {{peluncur.Placement.Base.x:8.3f}}, phi = {{phi:6.2f}} deg")
print(f"Langkah peluncur = {{(l + r) - (l - r)}} mm = 2r")                 # {2 * R_ENG}
# Dengan joint Assembly cukup mengunci sudut Revolute engkol (AngleMin = AngleMax = theta) lalu solve; solver melakukan baris di atas''', "Python (FreeCAD)")
    isi += kode("Python console — kelonggaran poros-lubang, volume interferensi, dan panjang sabuk", f'''import FreeCAD as App, Part, math
V = App.Vector
D, d = {D_LUB}.0, {D_POR}
bus = Part.makeBox(40, 40, 30).cut(Part.makeCylinder(D/2, 30, V(20, 20, 0)))   # balok berlubang tembus
poros = Part.makeCylinder(d/2, 60, V(20, 20, -15))                           # poros sesumbu (Cylindrical joint)
jarak = bus.distToShape(poros)[0]
print(f"Kelonggaran radial = {{jarak:.4f}} mm  (rumus (D-d)/2 = {{(D-d)/2:.4f}})")   # {ind(C_RAD, 4)}
irisan = bus.common(poros)
print(f"Volume interferensi = {{irisan.Volume:.3f}} mm^3  (0 = tidak bertabrakan)")
# Sabuk terbuka dua puli: panjang singgung sebenarnya vs rumus pendekatan
D1, D2, C = {D1_P}, {D2_P}, {C_P}
beta = math.asin((D2 - D1) / (2*C))                                          # kemiringan garis singgung
L_tepat = 2*math.sqrt(C**2 - ((D2-D1)/2)**2) + math.pi*(D1+D2)/2 + (D2-D1)*beta
L_dekat = 2*C + math.pi*(D1+D2)/2 + (D2-D1)**2/(4*C)
print(f"L tepat = {{L_tepat:.3f}}, L pendekatan = {{L_dekat:.3f}} mm, i = {{D2/D1:.2f}}")   # {ind(L_SABUK_TEPAT, 3)} / {ind(L_SABUK, 3)}
print(f"Sudut lilit puli kecil = {{180 - 2*math.degrees(beta):.2f}} deg (>= 120 disarankan)")
# Di rakitan: sketsa sabuk (2 lingkaran konstruksi + 2 garis Tangent + 2 busur) -> App.ActiveDocument.SketchSabuk.Shape.Length''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (volume rakitan " + ind(V_RAKIT, 2) + " mm³, x pada θ = " + str(TH_ENG) + "° = " + ind(X_PEL, 3) + " mm, kelonggaran " + ind(C_RAD, 4) + " mm, sabuk " + ind(L_SABUK, 3) + " mm). Tugas meminta rakitan dibuat dengan Assembly Workbench (Insert Link, grounded, joint) agar grup Joints ada di berkas; Placement dan Part API di sini hanya untuk memeriksa angka bacaan.")
    m += bagian(8, "m-python", "Python Console:<br>Link, Placement, dan Pemeriksaan Rakitan", "Cell pertama membangun rakitan pelat–pin lewat App::Link dan Placement lalu membaca volume total dan pusat massa; cell kedua menghitung x(θ) dan menggerakkan engkol-peluncur; cell ketiga memeriksa kelonggaran, interferensi, dan panjang sabuk.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Komponen", "Buat empat Body di satu dokumen: dasar (pelat 200 × 60 × 10 dengan alur rel), engkol (pelat tebal 6 dengan dua lubang ⌀8 berjarak 25), batang (pelat tebal 6 dengan dua lubang ⌀8 berjarak 90), peluncur (blok 30 × 20 × 20 berlubang ⌀8). Pusat lubang pertama tiap komponen di titik asalnya."),
               ("2", "Rakitan dan acuan", "Assembly → Create Assembly. Insert Link keempat Body. Klik kanan link dasar → Toggle grounded. Move part untuk menjauhkan komponen agar mudah dipilih."),
               ("3", "Joint engkol", "Create Joint → Revolute: klik lubang engkol pertama lalu lubang poros pada dasar (titik asal). Engkol kini berputar bebas: coba seret dengan Move part."),
               ("4", "Joint batang dan peluncur", "Revolute lubang engkol kedua ↔ lubang batang pertama; Revolute lubang batang kedua ↔ lubang peluncur; Slider muka bawah peluncur ↔ alur rel dasar (sumbu X). Solve: seret engkol, peluncur bergerak bolak-balik (F = 1)."),
               ("5", "Kunci dan ukur", "Pada Revolute engkol–dasar aktifkan Angle Min = Angle Max = 60° → solve. Std Measure Distance titik asal → pusat lubang peluncur; bandingkan dengan Persamaan (2): " + ind(X_PEL, 3) + " mm untuk r = 25, l = 90."),
               ("6", "Clearance dan tabrakan", "Buka kunci sudut, seret engkol ke 0° dan 180°; Part Common antara batang dan dasar harus bervolume nol. Std Measure Distance pin ⌀8 terhadap lubang peluncur memberi kelonggaran radial."),
               ("7", "BOM, massa, simpan", "Assembly → Bill of Materials; TechDraw: Insert View pada Assembly + Balloon 1–4 + Spreadsheet View BOM. Python: makeCompound seluruh link → Volume dan CenterOfMass. Ctrl+S → <code>Latihan11_NIM.FCStd</code>.")]
    isi = '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["Semua komponen melayang bersama saat Move part", "Tidak ada komponen grounded", "Toggle grounded pada dasar"],
                  ["Komponen tidak mau bergerak padahal seharusnya bisa", "Joint ganda / Fixed tak sengaja / dua komponen grounded", "Hapus joint berlebih; hitung F dengan Persamaan (1)"],
                  ["Joint dibuat tetapi komponen terbalik (pin menembus ke bawah)", "Arah sumbu Z JCS berlawanan", "Tombol Flip pada dialog joint, atau Rotation 180° pada Offset"],
                  ["Solver gagal / peringatan over-constrained", "Joint saling bertentangan (mis. Revolute + Slider pada pasangan sama)", "Hapus salah satu; sisakan joint sesuai DOF yang diinginkan"],
                  ["Peluncur bergeser miring, bukan searah X", "Slider dibuat pada muka yang tidak sejajar rel", "Pilih rusuk/alur rel sebagai acuan Slider; periksa sumbu JCS"],
                  ["Batang menabrak dasar pada θ tertentu", "Panjang batang/engkol atau posisi rel tidak cocok", "Ubah dimensi sketsa komponen; uji ulang Part Common di titik mati"],
                  ["Volume rakitan hanya satu komponen", "Shape dibaca dari Body, bukan link, atau compound satu objek", "makeCompound dari Shape semua link"],
                  ["Pandangan TechDraw kosong", "Yang dipilih grup Joints / link belum di-solve", "Pilih objek Assembly, solve, lalu Insert View"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) objek Assembly memuat link semua komponen dan grup Joints berisi joint yang diminta; (2) tepat satu komponen grounded (kecuali diminta lain); (3) DOF sisa sesuai (Tugas 1–3, 5: 0 atau seperti diminta; Tugas 4: 1 lalu dikunci pada θ); (4) angka bacaan diambil setelah solve dan dalam satuan mm dengan jumlah desimal yang diminta; (5) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi, komponen dari berkas lain ikut diunggah bila ada.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Rakitan Engkol-Peluncur", "Tujuh langkah berikut membangun mekanisme engkol-peluncur lengkap: komponen, rakitan dan acuan diam, empat joint, penguncian sudut dan pengukuran posisi, uji clearance dan tabrakan, BOM dan massa; ditutup tabel gejala dan daftar periksa.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: Assembly Workbench (Create Assembly, Insert Link, Toggle Grounded, Create Joint, Bill of Materials), App Link, Std Measure", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, jenis joint, properti Offset/Rotation/Angle Min-Max, dan API App::Link/Placement yang dipakai di cell Python.")
    refs += pm_ref(2, "amber", "249,115,22", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab assemblies (mates, degrees of freedom, in-context design, BOM, exploded views); konsepnya sama pada Assembly FreeCAD.")
    refs += pm_ref(3, "violet", "168,85,247", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: bab assembly constraints/joints, grounded component, interference check, balloon dan parts list.")
    refs += pm_ref(4, "green", "0,224,158", "R. L. Norton", "Design of Machinery", ", 6th ed. McGraw-Hill, 2020.", "Derajat kebebasan (Grübler–Kutzbach), analisis posisi mekanisme engkol-peluncur, dan keseimbangan massa berputar.")
    refs += pm_ref(5, "pink", "236,72,153", "R. G. Budynas &amp; J. K. Nisbett", "Shigley's Mechanical Engineering Design", ", 11th ed. McGraw-Hill, 2020.", "Suaian dan kelonggaran poros-lubang, geometri transmisi sabuk terbuka (panjang sabuk, sudut lilit, rasio putaran).")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi perakitan: dokumentasi Assembly Workbench 1.0 sebagai acuan perintah dan joint, dua buku CAD komersial untuk konsep rakitan, buku kinematika untuk DOF dan mekanisme, serta buku elemen mesin untuk suaian dan sabuk.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Assembly Workbench (daftar joint dan propertinya), Assembly CreateJoint*, Assembly BillOfMaterials, App Link, Std Measure, TechDraw Balloon dan Spreadsheet View, serta Part TopoShape (Volume, CenterOfMass, distToShape, common). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 11 — Perakitan Komponen dan Analisis Sistem · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = '''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Insert Link</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Fixed · Cylindrical</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Revolute + Slider</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">c = (D − d)/2</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">CenterOfMass</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 12 · Perakitan Komponen dan Analisis Sistem</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 11</span><br><em>Lima Rakitan</em><br>di Assembly Workbench</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang Assembly container, link, grounded part, jenis joint dan DOF, mekanisme, kelonggaran, BOM, dan pusat massa, ditambah 5 tugas rakitan: pelat + pin dengan Fixed joint (volume total), poros di dalam lubang dengan Cylindrical joint (kelonggaran radial), pelat + boss (pusat massa gabungan), engkol-peluncur dengan Revolute dan Slider (posisi peluncur), dan transmisi sabuk dua puli (panjang sabuk). Setiap tugas mengunggah berkas .FCStd (dokumen rakitan dengan link dan joint) dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Pada Assembly Workbench FreeCAD 1.0, <strong>Assembly container</strong> berfungsi sebagai...",
     ["Lembar gambar untuk mencetak rakitan", "Body tunggal yang menyatukan semua komponen menjadi satu solid", "Wadah rakitan yang menampung tautan (link) ke komponen, grup Joints, dan hasil solver", "Spreadsheet daftar komponen"],
     "Fungsi Assembly container"),
    ("<strong>Grounded part</strong> pada rakitan adalah...",
     ["Komponen yang disembunyikan dari tampilan", "Komponen yang dikunci terhadap sistem koordinat rakitan sehingga menjadi acuan diam bagi solver", "Komponen yang disalin ke semua sub-assembly", "Komponen dengan massa terbesar"],
     "Arti grounded part"),
    ("<strong>Revolute joint</strong> menyisakan derajat kebebasan...",
     ["1 (rotasi terhadap satu sumbu)", "2 (rotasi dan translasi sepanjang sumbu)", "3 (rotasi bebas ke segala arah)", "0 (kaku)"],
     "DOF Revolute"),
    ("<strong>Cylindrical joint</strong> menyisakan...",
     ["0 DOF (kaku)", "1 rotasi saja", "3 rotasi", "1 rotasi + 1 translasi sepanjang sumbu yang sama"],
     "DOF Cylindrical"),
    ("<strong>Insert Link</strong> memasukkan komponen ke rakitan sebagai...",
     ["Salinan geometri lepas (copy) yang tidak terhubung", "App::Link yang merujuk Body/Part asli sehingga perubahan komponen langsung terpantul di rakitan", "Pandangan TechDraw", "Mesh STL"],
     "Arti Insert Link"),
    ("Mekanisme engkol-peluncur (dasar, engkol, batang, peluncur; 3 Revolute + 1 Slider) menurut rumus Grübler memiliki DOF...",
     ["0, sehingga tidak dapat bergerak", "3, sehingga perlu tiga penggerak", "1, sehingga satu penggerak (sudut engkol) menentukan seluruh posisi", "4, satu untuk tiap batang"],
     "DOF engkol-peluncur"),
    ("Kelonggaran radial poros ⌀d di dalam lubang ⌀D adalah...",
     ["c = (D − d)/2", "c = D − d", "c = (D + d)/2", "c = D·d"],
     "Rumus kelonggaran radial"),
    ("<strong>Balloon</strong> pada gambar rakitan TechDraw berfungsi untuk...",
     ["Menandai dimensi panjang", "Menampilkan skala gambar", "Memberi nama berkas", "Memberi nomor butir yang merujuk baris BOM (daftar komponen)"],
     "Fungsi Balloon"),
    ("Pusat massa gabungan rakitan dua komponen berbahan sama dihitung dari...",
     ["Rata-rata sederhana pusat massa keduanya", "Rata-rata pusat massa tiap komponen tertimbang volumenya: z̄ = (V₁z₁ + V₂z₂)/(V₁ + V₂)", "Pusat massa komponen terbesar saja", "Titik asal rakitan"],
     "Pusat massa gabungan"),
    ("Jika jarak pusat C dua puli bertambah 10 mm (D₁ dan D₂ tetap), panjang sabuk terbuka...",
     ["Bertambah ≈ 10 mm", "Tetap, karena diameter puli tidak berubah", "Bertambah ≈ 20 mm (suku 2C), sedikit dikurangi karena suku (D₂ − D₁)²/(4C) mengecil", "Berkurang 20 mm"],
     "Panjang sabuk vs C"),
]

TUGAS_LABELS = ["Rakitan pelat + pin (Fixed) — volume total (mm³)", "Poros di lubang (Cylindrical) — kelonggaran radial (mm)", "Pelat + boss — pusat massa z̄ (mm)",
                "Engkol-peluncur (Revolute + Slider) — posisi x (mm)", "Sabuk dua puli — panjang sabuk L (mm)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 3}

FQ_JUDUL = [
    "Bagaimana menyusun rakitan pendorong engkol-peluncur agar solver hanya menyisakan satu DOF?",
    "Bagaimana membuktikan pin, bus, dan lengan pendorong tidak bertabrakan sepanjang langkah?",
    "Bagaimana BOM, massa total, pusat massa, dan sabuk penggerak menentukan motor dan rangka?",
]
FQ_RINGKAS = [
    "Tetapkan komponen grounded, daftar joint (Revolute/Slider) tiap pasangan, hitung F dengan Persamaan (1), dan tentukan langkah pendorong dari r; jelaskan akibat joint berlebih.",
    "Hitung kelonggaran radial pin–bus dengan Persamaan (3), rancang uji Part Common/distToShape pada posisi kritis (θ = 0°, 90°, 180°), dan tentukan batas gerak joint.",
    "Susun BOM dan balloon, hitung massa total dan pusat massa rakitan dengan Persamaan (4), lalu panjang sabuk dan rasio dengan Persamaan (5) untuk memilih motor dan sabuk standar.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Modul pendorong kotak memakai engkol r = 40 mm, batang 160 mm, dan peluncur pada rel rangka; motor memutar engkol lewat puli. Susun rakitannya di Assembly 1.0 (Bagian 01–04): komponen mana yang grounded, joint apa pada tiap pasangan (dasar–engkol, engkol–batang, batang–peluncur, peluncur–rel), berapa DOF menurut Persamaan (1), dan berapa langkah pendorong. Jelaskan apa yang terjadi bila teknisi menambahkan Fixed joint pada peluncur “agar tidak goyang”.",
            ["r = 40, l = 160", "3 Revolute + 1 Slider", "F = 1"],
            "Agar mekanisme engkol-peluncur dapat digerakkan solver dengan satu penggerak, DOF sisanya harus...",
            ["0 (semua komponen terkunci)", "3 atau lebih agar leluasa", "1 (Grübler: 3(n − 1) − 2j₁ = 1), dengan rangka sebagai grounded part", "Tidak perlu diperiksa, solver mengatur sendiri"],
            "✅ Tepat! Empat batang dengan empat pasangan satu-DOF memberi F = 1: satu sudut engkol menentukan seluruh posisi, dan rangka grounded menjadi acuan. Fixed tambahan membuat F = 0 (over-constrained) sehingga mekanisme mati.",
            "❌ F = 0 berarti struktur kaku, F ≥ 3 berarti gerak tak terkendali, dan solver tidak mengubah DOF yang Anda tetapkan lewat joint. Lihat Bagian 02 dan Animasi 1.",
            "Petunjuk: (1) Tentukan grounded part dan daftar joint. (2) Hitung F dan langkah 2r. (3) Jelaskan akibat Fixed tambahan pada peluncur.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Pin engkol ⌀12 dipasang pada bus perunggu berlubang ⌀12,04; lengan pendorong bergerak 3 mm dari pemandu (guide) rangka pada posisi awal. Prototipe pertama macet di titik mati luar. Hitung kelonggaran radial pin–bus (Bagian 05, Persamaan (3)), rancang uji tabrakan lengan–pemandu pada θ = 0°, 90°, 180° dengan Part Common atau distToShape, dan usulkan batas gerak (Angle/Length Min-Max) yang mencegah lengan menyentuh pemandu.",
            ["pin ⌀12 · bus ⌀12,04", "celah 3 mm ke pemandu", "uji θ = 0°, 90°, 180°"],
            "Cara memastikan lengan pendorong tidak menabrak pemandu sepanjang langkah adalah...",
            ["Menggerakkan mekanisme ke beberapa θ kritis dan memeriksa Part Common / distToShape antara lengan dan pemandu (volume 0, jarak > 0)", "Melihat sekilas tampilan isometrik pada posisi awal", "Memperbesar semua lubang 1 mm", "Menghapus pemandu dari rakitan"],
            "✅ Tepat! Joint tidak memeriksa tabrakan; volume tumpang tindih nol dan jarak minimum positif pada posisi kritis (titik mati, batang paling miring) adalah bukti yang bisa dipertanggungjawabkan.",
            "❌ Tampilan sekilas pada satu posisi tidak membuktikan apa pun, membesarkan lubang merusak suaian, dan menghapus pemandu bukan solusi. Lihat Bagian 05 dan Animasi 4.",
            "Petunjuk: (1) Hitung c = (D − d)/2 pin–bus. (2) Tulis prosedur uji tabrakan di tiga posisi. (3) Usulkan batas gerak joint.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Manajer proyek meminta gambar rakitan dengan balloon dan BOM untuk pembelian, massa total dan pusat massa modul untuk memilih motor dan menempatkan kaki rangka, serta panjang sabuk dari puli motor ⌀60 ke puli engkol ⌀180 berjarak 250 mm. Susun BOM (Bagian 06), hitung massa dan pusat massa dari model (Bagian 07, Persamaan (4)), lalu panjang sabuk dan rasio putaran dengan Persamaan (5); jelaskan mengapa pusat massa yang jauh dari sumbu engkol mengganggu.",
            ["balloon + BOM", "Σρ·V · CenterOfMass", "⌀60 → ⌀180, C = 250"],
            "Massa total dan pusat massa rakitan paling tepat dibaca dari...",
            ["Body komponen terbesar saja", "Placement objek Assembly", "Jumlah panjang sabuk dan jumlah komponen", "Jumlah ρᵢ·Vᵢ tiap link dan rata-rata pusat massa tertimbang (Part.makeCompound(...).CenterOfMass untuk bahan seragam)"],
            "✅ Tepat! Massa adalah jumlah ρ·V semua link pada Placement rakitannya, dan pusat massa gabungan adalah rata-rata tertimbang massa; makeCompound dari Shape tiap link membacanya langsung untuk bahan seragam.",
            "❌ Komponen terbesar saja mengabaikan yang lain, Placement Assembly bukan besaran massa, dan panjang sabuk tidak berkaitan. Lihat Bagian 07 dan Animasi 2.",
            "Petunjuk: (1) Susun BOM dengan nomor balloon. (2) Hitung m dan z̄ rakitan. (3) Hitung L dan i sabuk, lalu jelaskan efek pusat massa terhadap getaran.")
    kartu = lambda teks, rgb, warna: f'      <div style="background:rgba({rgb},.05);border:1px solid rgba({rgb},.15);border-radius:10px;padding:12px 16px;font-family:\'JetBrains Mono\',monospace;font-size:13px;color:var(--{warna})">{teks}</div>'
    return f'''<div class="page" id="page-forum">
<div class="hero" data-tab="forum" style="min-height:55vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1c" d="" fill="none" stroke="rgba(0,230,118,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2c" d="" fill="none" stroke="rgba(124,77,255,.08)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">lini pengemasan</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Revolute + Slider</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">F = 1</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">Σρ·V · CenterOfMass</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 12 · Perakitan Komponen dan Analisis Sistem</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Dari Komponen<br><em>ke Modul Pendorong</em></h1>
    <p class="hero-sub">Bengkel Sinar Otomasi merakit modul pendorong kotak (pusher) berbasis engkol-peluncur untuk lini pengemasan. Terapkan Pertemuan 12: link dan grounded part, joint dan DOF, uji clearance dan tabrakan, BOM dan gambar rakitan, serta massa, pusat massa, dan sabuk penggerak, untuk menyusun rakitan yang bergerak benar dan siap dibeli komponennya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Sinar Otomasi —<br>Modul Pendorong Kotak Lini Pengemasan</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PERAKITAN</div>
    <p>
      <strong style="color:var(--amber)">Bengkel Sinar Otomasi</strong> memenangkan pesanan <strong style="color:var(--cyan)">6 unit modul pendorong kotak</strong> untuk lini pengemasan biskuit: motor 1450 rpm memutar puli ⌀60 yang menggerakkan puli engkol ⌀180 lewat sabuk (jarak pusat 250 mm); engkol r = 40 mm dan batang 160 mm menggerakkan peluncur pendorong pada rel rangka; pin engkol ⌀12 berputar dalam bus perunggu ⌀12,04; lengan pendorong bergerak 3 mm dari pemandu rangka.
    </p>
    <p style="margin-top:12px">
      Prototipe pertama gagal: rakitan FreeCAD dibuat dengan menggeser komponen satu per satu tanpa joint sehingga <strong style="color:var(--cyan)">gerak tidak bisa disimulasikan</strong>, teknisi menambahkan Fixed joint pada peluncur “agar tidak goyang” sehingga mekanisme mati, lengan pendorong <strong>menabrak pemandu di titik mati luar</strong>, dan bagian pembelian menerima daftar komponen tanpa nomor balloon sehingga salah memesan jumlah bus.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur perakitan dan analisis sistem</strong>: struktur rakitan dan joint dengan DOF yang benar, uji clearance dan tabrakan pada posisi kritis, BOM bernomor balloon, serta massa, pusat massa, dan panjang sabuk dari model untuk pemilihan motor dan sabuk standar.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Engkol r = 40, batang 160, rel searah X", "14,165,233", "cyan")}
{kartu("Pin ⌀12 · bus ⌀12,04 · pemandu 3 mm", "14,165,233", "cyan")}
{kartu("Puli ⌀60 → ⌀180, C = 250, 1450 rpm", "14,165,233", "cyan")}
{kartu("6 unit · BOM + balloon · massa & pusat massa", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Gerak yang tidak bisa disimulasikan, mekanisme yang mati, tabrakan di titik mati, dan salah pesan komponen berasal dari empat hal: tanpa joint, joint berlebih, tanpa uji clearance, dan BOM tanpa balloon. Forum ini mengajak Anda membereskan keempatnya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Modul pendorong: puli motor → sabuk → puli engkol → engkol-peluncur → pendorong kotak pada konveyor</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Bengkel Sinar Otomasi merakit 6 unit modul pendorong kotak untuk lini pengemasan: motor 1450 rpm memutar puli &oslash;60 yang menggerakkan puli engkol &oslash;180 lewat sabuk (jarak pusat 250 mm); engkol r = 40 mm dan batang 160 mm menggerakkan peluncur pendorong pada rel rangka; pin engkol &oslash;12 berputar dalam bus perunggu &oslash;12,04; lengan pendorong 3 mm dari pemandu rangka. Prototipe pertama gagal: rakitan FreeCAD tanpa joint sehingga gerak tidak bisa disimulasikan, Fixed joint tambahan pada peluncur mematikan mekanisme, lengan menabrak pemandu di titik mati luar, dan BOM tanpa balloon membuat salah pesan jumlah bus. Susun struktur rakitan dan joint dengan DOF yang benar, uji clearance dan tabrakan pada posisi kritis, BOM bernomor balloon, serta massa, pusat massa, dan panjang sabuk dari model."
FORUM_CHIPS_LMS = ["engkol r = 40, batang 160, rel X", "pin ⌀12 · bus ⌀12,04 · pemandu 3 mm", "puli ⌀60 → ⌀180, C = 250, 1450 rpm", "6 unit · BOM + balloon · pusat massa"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Modul pendorong kotak: puli motor, sabuk, engkol-peluncur, konveyor (Pertemuan 12)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const s = Math.min(W / 700, H / 180);
  const X = x => W * 0.5 + (x - 350) * s, Y = y => H * 0.5 + (y - 90) * s;
  const garis = (x1, y1, x2, y2, w, lw) => { ctx.strokeStyle = w; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); };
  const ling = (x, y, r, isi, garisW) => { ctx.beginPath(); ctx.arc(X(x), Y(y), Math.max(0.1, r * s), 0, Math.PI * 2); if (isi) { ctx.fillStyle = isi; ctx.fill(); } if (garisW) { ctx.strokeStyle = garisW; ctx.lineWidth = 1.2; ctx.stroke(); } };
  // rangka (grounded) dan konveyor
  ctx.fillStyle = 'rgba(148,163,184,.12)'; ctx.fillRect(X(40), Y(150), 620 * s, 12 * s);
  ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1; ctx.strokeRect(X(40), Y(150), 620 * s, 12 * s);
  for (let i = 0; i < 9; i++) ling(400 + i * 32, 148, 5, 'rgba(34,211,238,.15)', 'rgba(34,211,238,.6)');
  garis(392, 140, 660, 140, 'rgba(34,211,238,.5)', 1.2);
  // puli motor kecil dan puli engkol besar dengan sabuk
  const m = [90, 60], e = [200, 90], r1 = 14, r2 = 40;
  const beta = Math.asin((r2 - r1) / Math.hypot(e[0] - m[0], e[1] - m[1])), ang = Math.atan2(e[1] - m[1], e[0] - m[0]);
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.beginPath();
  for (const sg of [1, -1]) { const a = ang + sg * (Math.PI / 2 + beta); ctx.moveTo(X(m[0] + r1 * Math.cos(a)), Y(m[1] + r1 * Math.sin(a))); ctx.lineTo(X(e[0] + r2 * Math.cos(a)), Y(e[1] + r2 * Math.sin(a))); }
  ctx.stroke();
  ling(m[0], m[1], r1, 'rgba(34,211,238,.18)', '#22d3ee'); ling(e[0], e[1], r2, 'rgba(245,158,11,.15)', '#f59e0b');
  ling(m[0], m[1], 2.5, '#e2e8f0'); ling(e[0], e[1], 2.5, '#e2e8f0');
  // engkol-peluncur: engkol r = 24 (skala gambar), batang, peluncur di rel y = 90
  const r = 24, l = 100, th = -0.9;
  const A = [e[0] + r * Math.cos(th), e[1] + r * Math.sin(th)];
  const xB = e[0] + r * Math.cos(th) + Math.sqrt(l * l - (r * Math.sin(th)) ** 2);
  garis(A[0], A[1], xB, e[1], '#22d3ee', 4); garis(e[0], e[1], A[0], A[1], '#f59e0b', 5);
  ctx.fillStyle = 'rgba(168,85,247,.3)'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.4;
  ctx.fillRect(X(xB - 14), Y(e[1] - 12), 28 * s, 24 * s); ctx.strokeRect(X(xB - 14), Y(e[1] - 12), 28 * s, 24 * s);
  ling(e[0], e[1], 3, '#0a101f', '#e2e8f0'); ling(A[0], A[1], 3, '#0a101f', '#e2e8f0'); ling(xB, e[1], 3, '#0a101f', '#e2e8f0');
  // lengan pendorong dan kotak di konveyor
  garis(xB + 14, e[1], xB + 60, e[1], '#a855f7', 3); garis(xB + 60, e[1] - 14, xB + 60, e[1] + 14, '#a855f7', 3);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(0,224,158,.18)'; ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1.2; ctx.fillRect(X(xB + 70 + i * 60), Y(114), 40 * s, 24 * s); ctx.strokeRect(X(xB + 70 + i * 60), Y(114), 40 * s, 24 * s); }
  ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('puli motor ⌀60', X(m[0]), Y(m[1] - 22)); ctx.fillText('puli engkol ⌀180 · Revolute', X(e[0]), Y(e[1] + 54));
  ctx.fillText('peluncur · Slider', X(xB), Y(e[1] + 28)); ctx.fillText('kotak pada konveyor', X(xB + 130), Y(150 + 24));
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ rangka grounded · 3 Revolute + 1 Slider → F = 1 · langkah pendorong = 2r · uji clearance di titik mati', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
