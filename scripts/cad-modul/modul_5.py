# Konten Modul 5 Pemodelan CAD — Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep
# (Sub-CPMK 2.3: perintah extrude, revolve, sweep; pemodelan 3D berbasis sketsa 2D;
# modifikasi objek 3D dengan pocket, fillet, chamfer). Angka contoh dihitung di sini
# agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama dengan varian tugas
# parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 5
JUDUL = "Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep"
JUDUL_PANJANG = "Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep"
JUDUL_EKSPOR = "Pemodelan 3D Berbasis Sketsa"

# ─────────────────────────── angka contoh ───────────────────────────
A_P, B_P, H_P, D_P = 80, 50, 25, 16
V_PAD = (A_P * B_P - math.pi * D_P ** 2 / 4) * H_P
RI, RO, H_R = 12, 24, 36
V_BUS = math.pi * (RO ** 2 - RI ** 2) * H_R
R_PIPA, R_LINTASAN = 6, 40
V_SIKU = math.pi * R_PIPA ** 2 * (math.pi * R_LINTASAN / 2)
F_C = 10
LUAS_FILLET = (4 - math.pi) * F_C ** 2
V_BALOK_FILLET = (A_P * B_P - LUAS_FILLET - math.pi * D_P ** 2 / 4) * H_P
D1, D2, L1, L2, C_CH = 24, 36, 30, 45, 2.5
V_POROS = math.pi * (D1 / 2) ** 2 * L1 + math.pi * (D2 / 2) ** 2 * L2
V_CHAMFER = math.pi * C_CH ** 2 * (D2 / 2 - C_CH / 3)
RHO_BAJA = 7.85


# ─────────────────────────── gambar ───────────────────────────
def _iso(x, y, z, cx, cy, s):
    az, el = math.radians(35), math.radians(28)
    x1 = x * math.cos(az) - y * math.sin(az)
    y1 = x * math.sin(az) + y * math.cos(az)
    return cx + s * x1, cy - s * (z * math.cos(el) + y1 * math.sin(el))


def _poli(pts, fill, stroke, w=1.4):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"/>'


def gambar1():
    b = ""
    w, h = 124, 54
    tahap = [("Body", "wadah satu solid", "#22d3ee"), ("Sketch", "profil terkonstrain", "#f59e0b"), ("Fitur aditif", "Pad, Revolve, Pipe", "#a855f7"),
             ("Fitur subtraktif", "Pocket, Groove", "#ec4899"), ("Dressing", "Fillet, Chamfer", "#00e09e")]
    xs = [10, 142, 274, 406, 538]
    for (a, s, c), x in zip(tahap, xs):
        b += box(x, 36, w, h, [a, s], c, 11.5)
    for i in range(4):
        b += arrow(xs[i] + w, 63, xs[i + 1], 63)
    b += t(340, 118, "Pohon fitur Body:", 11, TX, "start", "600")
    for i, s_ in enumerate(["Body", "  ├ Origin (XY, XZ, YZ, X, Y, Z)", "  ├ Sketch → Pad", "  ├ Sketch001 → Pocket", "  └ Fillet   ← Tip (hasil akhir)"]):
        b += t(340, 136 + i * 16, s_, 10, "#00e09e" if i == 4 else AX, "start")
    b += t(60, 130, "Setiap fitur bekerja pada", 10.5, AX, "start")
    b += t(60, 146, "hasil fitur sebelumnya;", 10.5, AX, "start")
    b += t(60, 162, "mengubah sketsa awal", 10.5, AX, "start")
    b += t(60, 178, "menghitung ulang semuanya.", 10.5, AX, "start")
    b += t(340, 222, "Model 3D berbasis sketsa: profil 2D + operasi = solid; riwayatnya tersimpan dan dapat disunting kapan saja", 11, AX)
    return svg(680, 234, b, "Gambar 1 — Alur pemodelan berbasis sketsa dan pohon fitur Body")


def gambar2():
    b = ""
    cx, cy, s = 120, 205, 1.9
    a, bb, h = A_P, B_P, H_P
    # sketsa di bidang XY (datar)
    dasar = [_iso(x, y, 0, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    atas = [_iso(x, y, h, cx, cy, s) for x, y in [(0, 0), (a, 0), (a, bb), (0, bb)]]
    for i, j in [(0, 1), (1, 2), (2, 3), (3, 0)]:
        b += _poli([dasar[i], dasar[j], atas[j], atas[i]], "rgba(34,211,238,.10)", "rgba(34,211,238,.6)", 1.1)
    b += _poli(atas, "rgba(34,211,238,.22)", "#22d3ee", 1.8)
    b += _poli(dasar, "rgba(245,158,11,.12)", "#f59e0b", 1.6)
    ling = [_iso(a / 2 + D_P / 2 * math.cos(k / 36 * 2 * math.pi), bb / 2 + D_P / 2 * math.sin(k / 36 * 2 * math.pi), h, cx, cy, s) for k in range(36)]
    b += _poli(ling, "#0a101f", "#ec4899", 1.4)
    p = _iso(a, 0, h / 2, cx, cy, s)
    b += t(p[0] + 10, p[1] + 4, f"Pad h = {h}", 10.5, "#22d3ee", "start")
    b += t(dasar[0][0], dasar[0][1] + 18, f"Sketch {a} × {bb} (XY)", 10.5, "#f59e0b", "middle")
    p = _iso(a / 2, bb / 2, h, cx, cy, s)
    b += f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{p[0] + 60:.1f}" y2="56" stroke="#ec4899" stroke-width=".8" stroke-dasharray="3 2"/>'
    b += t(p[0] + 64, 60, f"Pocket ⌀{D_P} through all", 10.5, "#ec4899", "start")
    b += t(452, 60, "Pad (aditif):", 11, "#22d3ee", "start", "600")
    b += t(452, 78, "Length h · Symmetric · Reversed", 10, AX, "start")
    b += t(452, 108, "Pocket (subtraktif):", 11, "#ec4899", "start", "600")
    b += t(452, 126, "Dimension · Through all · Up to face", 10, AX, "start")
    b += t(452, 156, f"V = (a·b − πd²/4)·h", 11, TX, "start")
    b += t(452, 174, f"= {ind(V_PAD, 1)} mm³ = {ind(V_PAD / 1000, 3)} cm³", 11, "#00e09e", "start")
    b += t(452, 192, f"massa baja ≈ {ind(V_PAD / 1000 * RHO_BAJA, 1)} g", 10.5, AX, "start")
    b += t(340, 246, "Pad menebalkan sketsa searah normal bidangnya; Pocket memotong dari sketsa pada muka solid", 11, AX)
    return svg(680, 258, b, "Gambar 2 — Pad dari sketsa XY dan Pocket lubang tembus")


def gambar3():
    b = ""
    cx, cy, s = 200, 190, 2.3
    ri, ro, h = RI, RO, H_R
    n = 48
    for i in range(n):
        t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        pts = [_iso(ro * math.cos(t0), ro * math.sin(t0), 0, cx, cy, s), _iso(ro * math.cos(t1), ro * math.sin(t1), 0, cx, cy, s),
               _iso(ro * math.cos(t1), ro * math.sin(t1), h, cx, cy, s), _iso(ro * math.cos(t0), ro * math.sin(t0), h, cx, cy, s)]
        b += _poli(pts, "rgba(34,211,238,.08)", "rgba(34,211,238,.25)", 0.6)
    atas = [_iso(ro * math.cos(k / n * 2 * math.pi), ro * math.sin(k / n * 2 * math.pi), h, cx, cy, s) for k in range(n)]
    dalam = [_iso(ri * math.cos(k / n * 2 * math.pi), ri * math.sin(k / n * 2 * math.pi), h, cx, cy, s) for k in range(n)]
    b += _poli(atas, "rgba(34,211,238,.20)", "#22d3ee", 1.4)
    b += _poli(dalam, "#0a101f", "#22d3ee", 1.2)
    prof = [_iso(x, 0, z, cx, cy, s) for x, z in [(ri, 0), (ro, 0), (ro, h), (ri, h)]]
    b += _poli(prof, "rgba(245,158,11,.35)", "#f59e0b", 2)
    z0, z1 = _iso(0, 0, -8, cx, cy, s), _iso(0, 0, h + 16, cx, cy, s)
    b += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="8 3 2 3"/>'
    b += t(z1[0] + 6, z1[1], "sumbu Z", 10, "#ef4444", "start")
    p = _iso(ro + 6, 0, h / 2, cx, cy, s)
    b += t(p[0] + 4, p[1], "profil XZ", 10.5, "#f59e0b", "start")
    b += t(470, 56, "Revolution:", 11, "#f59e0b", "start", "600")
    b += t(470, 74, "profil tertutup + sumbu, sudut 0–360°", 10, AX, "start")
    b += t(470, 104, f"V = π(r_o² − r_i²)·h", 11, TX, "start")
    b += t(470, 122, f"= π({ro}² − {ri}²)·{h} = {ind(V_BUS, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(470, 152, "Pappus: V = 2π·ȳ·A", 11, TX, "start")
    b += t(470, 170, f"ȳ = {(ri + ro) / 2:g}, A = {(ro - ri) * h} → {ind(2 * math.pi * (ri + ro) / 2 * (ro - ri) * h, 1)}", 10.5, "#00e09e", "start")
    b += teks2(340, 246, "Benda putar lahir dari setengah profil pada XZ yang diputar terhadap sumbu Z; profil boleh menempel sumbu (pejal), tidak boleh memotongnya", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 3 — Revolution profil XZ menjadi bus berongga")


def gambar4():
    b = ""
    cx, cy, s = 210, 210, 2.6
    R, r = R_LINTASAN, R_PIPA
    n = 24
    # lintasan busur di bidang XZ (y = 0)
    for i in range(n):
        t0, t1 = i / n * math.pi / 2, (i + 1) / n * math.pi / 2
        c0 = (R * math.cos(t0), 0, R * math.sin(t0))
        c1 = (R * math.cos(t1), 0, R * math.sin(t1))
        # tabung: lingkaran profil tegak lurus lintasan
        ring = []
        for k in range(16):
            ph = k / 16 * 2 * math.pi
            # bidang normal ke tangen: gunakan vektor radial (cos t, 0, sin t) dan y
            rad0 = (math.cos(t0), 0, math.sin(t0))
            p = (c0[0] + r * (math.cos(ph) * rad0[0]), r * math.sin(ph), c0[2] + r * (math.cos(ph) * rad0[2]))
            ring.append(_iso(*p, cx, cy, s))
        b += _poli(ring, "rgba(34,211,238,.10)", "rgba(34,211,238,.35)", 0.7)
    ujung = []
    for k in range(24):
        ph = k / 24 * 2 * math.pi
        ujung.append(_iso(R + r * math.cos(ph), r * math.sin(ph), 0, cx, cy, s))
    b += _poli(ujung, "rgba(245,158,11,.35)", "#f59e0b", 1.8)
    jalur = [_iso(R * math.cos(k / 40 * math.pi / 2), 0, R * math.sin(k / 40 * math.pi / 2), cx, cy, s) for k in range(41)]
    b += f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in jalur)}" fill="none" stroke="#ec4899" stroke-width="1.6" stroke-dasharray="6 4"/>'
    p = _iso(R + 4, 0, -6, cx, cy, s)
    b += t(p[0], p[1] + 12, f"profil ⌀{2 * r} (XY)", 10.5, "#f59e0b", "middle")
    p = _iso(0, 0, R, cx, cy, s)
    b += t(p[0], p[1] - r * s - 12, f"lintasan busur R{R} (XZ)", 10.5, "#ec4899", "middle")
    b += t(452, 56, "Additive Pipe (sweep):", 11, "#ec4899", "start", "600")
    b += t(452, 74, "profil tertutup + lintasan (sketsa/edge)", 10, AX, "start")
    b += t(452, 104, "Pappus: V = A_profil × s_titik berat", 10.5, TX, "start")
    b += t(452, 122, f"= πr² × (πR/2)", 10.5, TX, "start")
    b += t(452, 140, f"= {ind(V_SIKU, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(452, 170, "Loft: ≥ 2 profil → solid transisi", 10, AX, "start")
    b += teks2(340, 246, "Sweep menyapu profil sepanjang lintasan; untuk lintasan busur bidang, volumenya = luas profil × panjang busur titik berat", 11, AX, maks=70)
    return svg(680, 272, b, "Gambar 4 — Additive Pipe: siku pipa dari profil lingkaran dan lintasan busur")


def gambar5():
    b = ""
    # penampang fillet vs chamfer
    for k, (judul, mode, c) in enumerate([("Fillet R (bulat)", "f", "#22d3ee"), ("Chamfer C (miring)", "c", "#a855f7")]):
        ox, oy, s = 70 + k * 300, 190, 1.4
        a, bb, f = 100, 60, 18
        X = lambda x, ox=ox: ox + x * s
        Y = lambda y: oy - y * s
        b += t(ox + a * s / 2, 30, judul, 12, c, "middle", "600")
        b += f'<rect x="{X(0)}" y="{Y(bb)}" width="{a * s}" height="{bb * s}" fill="none" stroke="rgba(148,163,184,.4)" stroke-width="1" stroke-dasharray="5 4"/>'
        if mode == "f":
            d = f"M {X(f)} {Y(0)} H {X(a - f)} A {f * s} {f * s} 0 0 0 {X(a)} {Y(f)} V {Y(bb - f)} A {f * s} {f * s} 0 0 0 {X(a - f)} {Y(bb)} H {X(f)} A {f * s} {f * s} 0 0 0 {X(0)} {Y(bb - f)} V {Y(f)} A {f * s} {f * s} 0 0 0 {X(f)} {Y(0)} Z"
        else:
            d = f"M {X(f)} {Y(0)} H {X(a - f)} L {X(a)} {Y(f)} V {Y(bb - f)} L {X(a - f)} {Y(bb)} H {X(f)} L {X(0)} {Y(bb - f)} V {Y(f)} Z"
        b += f'<path d="{d}" fill="rgba(34,211,238,.14)" stroke="{c}" stroke-width="2"/>'
        hilang = (4 - math.pi) * f ** 2 if mode == "f" else 2 * f ** 2
        b += t(ox + a * s / 2, oy + 26, f"hilang per penampang = {'(4 − π)f²' if mode == 'f' else '2f²'} = {ind(hilang, 1)} mm²", 10, "#ef4444")
        b += t(ox + a * s / 2, oy + 44, f"(a = {a}, b = {bb}, f = {f})", 9.5, AX)
    b += teks2(340, 262, "Fillet dan chamfer adalah fitur dressing: dibuat terakhir, mengurangi volume sebesar luas yang hilang dikalikan panjang rusuk", 11, AX, maks=70)
    return svg(680, 288, b, "Gambar 5 — Penampang balok setelah Fillet dan Chamfer pada rusuk vertikal")


def gambar6():
    b = ""
    cx, cy, s = 190, 230, 1.9
    R1, R2 = D1 / 2, D2 / 2
    n = 40
    # poros bertingkat sebagai tumpukan cincin (iso)
    for (rr, z0, z1) in [(R1, 0, L1), (R2, L1, L1 + L2)]:
        for i in range(n):
            t0, t1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
            pts = [_iso(rr * math.cos(t0), rr * math.sin(t0), z0, cx, cy, s), _iso(rr * math.cos(t1), rr * math.sin(t1), z0, cx, cy, s),
                   _iso(rr * math.cos(t1), rr * math.sin(t1), z1, cx, cy, s), _iso(rr * math.cos(t0), rr * math.sin(t0), z1, cx, cy, s)]
            b += _poli(pts, "rgba(34,211,238,.08)", "rgba(34,211,238,.25)", 0.6)
        b += _poli([_iso(rr * math.cos(k / n * 2 * math.pi), rr * math.sin(k / n * 2 * math.pi), z1, cx, cy, s) for k in range(n)], "rgba(34,211,238,.20)", "#22d3ee", 1.3)
    # profil setengah pada XZ
    prof = [_iso(x, 0, z, cx, cy, s) for x, z in [(0, 0), (R1, 0), (R1, L1), (R2, L1), (R2, L1 + L2), (0, L1 + L2)]]
    b += _poli(prof, "rgba(245,158,11,.30)", "#f59e0b", 2)
    z0, z1 = _iso(0, 0, -8, cx, cy, s), _iso(0, 0, L1 + L2 + 14, cx, cy, s)
    b += f'<line x1="{z0[0]:.1f}" y1="{z0[1]:.1f}" x2="{z1[0]:.1f}" y2="{z1[1]:.1f}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="8 3 2 3"/>'
    p = _iso(R2 + 2, 0, L1 + L2, cx, cy, s)
    b += t(p[0] + 6, p[1] - 6, f"chamfer C{C_CH:g} × 45°", 10, "#ec4899", "start")
    b += t(450, 50, "Satu Revolution dari setengah profil:", 11, "#f59e0b", "start", "600")
    b += t(450, 68, f"⌀{D1} × {L1} dan ⌀{D2} × {L2} searah Z", 10, AX, "start")
    b += t(450, 98, "V = πR₁²L₁ + πR₂²L₂ − V_chamfer", 11, TX, "start")
    b += t(450, 116, f"= {ind(V_POROS, 1)} − {ind(V_CHAMFER, 2)}", 10.5, AX, "start")
    b += t(450, 134, f"= {ind(V_POROS - V_CHAMFER, 1)} mm³", 10.5, "#00e09e", "start")
    b += t(450, 164, "V_chamfer (Pappus, cincin segitiga):", 11, TX, "start")
    b += t(450, 182, f"π·c²·(R₂ − c/3) = {ind(V_CHAMFER, 2)} mm³", 10.5, "#00e09e", "start")
    b += teks2(340, 258, "Poros bertingkat dibuat sekali putar; chamfer ujung membuang cincin bersayap segitiga yang volumenya dihitung teorema Pappus", 11, AX, maks=70)
    return svg(680, 284, b, "Gambar 6 — Poros bertingkat: Revolution setengah profil dan chamfer ujung")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-fitur">Fitur &amp; Body</a>
  <a href="#m-sketcher">Sketcher</a>
  <a href="#m-pad">Pad &amp; Pocket</a>
  <a href="#m-revolve">Revolution</a>
  <a href="#m-sweep">Sweep &amp; Loft</a>
  <a href="#m-dressing">Fillet &amp; Chamfer</a>
  <a href="#m-baca">Volume &amp; Massa</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,60 62,40 82,52 38,72" fill="rgba(0,229,255,.12)" stroke="rgba(0,229,255,.55)" stroke-width="1.4"/>
      <polygon points="18,60 38,72 38,120 18,108" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.2"/>
      <polygon points="38,72 82,52 82,100 38,120" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1.2"/>
      <ellipse cx="60" cy="56" rx="9" ry="4" fill="none" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <line x1="14" y1="150" x2="14" y2="196" stroke="rgba(34,197,94,.5)" stroke-width="1.4"/>
      <line x1="14" y1="196" x2="60" y2="196" stroke="rgba(239,68,68,.5)" stroke-width="1.4"/>
      <line x1="14" y1="196" x2="40" y2="176" stroke="rgba(59,130,246,.5)" stroke-width="1.4"/>
      <text x="50" y="212" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">Pad h</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="30" ry="10" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.3"/>
      <ellipse cx="50" cy="40" rx="14" ry="5" fill="none" stroke="rgba(0,229,255,.4)" stroke-width="1"/>
      <line x1="20" y1="40" x2="20" y2="90" stroke="rgba(0,229,255,.45)" stroke-width="1.2"/>
      <line x1="80" y1="40" x2="80" y2="90" stroke="rgba(0,229,255,.45)" stroke-width="1.2"/>
      <path d="M 20 90 A 30 10 0 0 0 80 90" fill="none" stroke="rgba(0,229,255,.45)" stroke-width="1.2"/>
      <line x1="50" y1="20" x2="50" y2="110" stroke="rgba(239,68,68,.55)" stroke-width="1" stroke-dasharray="6 2 2 2"/>
      <rect x="64" y="40" width="16" height="50" fill="rgba(255,179,0,.2)" stroke="rgba(255,179,0,.6)" stroke-width="1"/>
      <path d="M 20 170 A 40 40 0 0 1 60 130" fill="none" stroke="rgba(124,77,255,.6)" stroke-width="6" stroke-linecap="round"/>
      <text x="50" y="205" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">V = A·s</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="05">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Sketch → Pad</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">V = A·h</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">Revolution 360°</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">V = 2π·ȳ·A</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">Additive Pipe</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Shape.Volume</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">(4 − π)f²</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">m = ρ·V</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 5 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dari Sketsa</span><br>
      <em>ke Solid:</em><br>
      <span class="hl-amber">Pad, Revolve, Sweep</span>
    </h1>
    <p class="hero-sub">Pertemuan pertama pemodelan 3D: Body dan pohon fitur Part Design, sketsa terkonstrain penuh sebagai fondasi, Pad dan Pocket untuk menebalkan dan memotong, Revolution untuk benda putar, Additive Pipe untuk menyapu profil sepanjang lintasan, lalu Fillet dan Chamfer sebagai penyelesaian. Setiap bentuk disertai rumus volume (termasuk teorema Pappus) sehingga hasil model dapat diperiksa dari angka Shape.Volume; tugasnya lima solid FreeCAD dengan bacaan volume.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Fitur, sketsa, dan rumus volume</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Tabel, gambar, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>FreeCAD, diskusi, dan tugas</small></div>
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

    # 01 — Fitur dan Body
    isi = figure(1, "Alur pemodelan berbasis sketsa dan pohon fitur Body", "Body menampung satu solid yang dibangun berurutan: sketsa menjadi Pad/Revolution/Pipe, dipotong Pocket, lalu diselesaikan Fillet/Chamfer; fitur terakhir (Tip) adalah hasil yang ditampilkan.", gambar1())
    isi += cards([
        ("🧊", "Body", "Wadah Part Design untuk satu solid tunggal. Semua fitur di dalamnya menyatu; benda kedua memerlukan Body kedua. Origin Body menyediakan bidang XY, XZ, YZ, dan sumbu X, Y, Z untuk menempelkan sketsa.", "1 Body = 1 solid"),
        ("✏️", "Fitur berbasis sketsa", "Pad, Pocket, Revolution, Groove, Additive/Subtractive Pipe dan Loft semuanya berangkat dari profil sketsa 2D tertutup. Profil yang baik (tertutup, tidak tumpang tindih, terkonstrain) adalah separuh pekerjaan.", "Sketch → fitur"),
        ("🎀", "Fitur dressing", "Fillet, Chamfer, Draft, dan Thickness menyunting solid yang sudah ada tanpa sketsa. Dibuat paling akhir agar rusuk yang dipilih tidak berubah oleh fitur berikutnya.", "terakhir"),
        ("🌳", "Pohon fitur parametrik", "Mengubah dimensi sketsa awal menghitung ulang seluruh fitur di bawahnya. FreeCAD 1.0 mengikat fitur ke geometri dengan nama stabil (topological naming) sehingga fillet tidak hilang saat sketsa berubah.", "recompute"),
    ])
    isi += tabel(["Workbench", "Alat pembentuk solid", "Kapan dipakai di kelas"],
                 [["<strong>Part Design</strong>", "Body, Sketch, Pad, Pocket, Revolution, Groove, Pipe, Loft, Fillet, Chamfer", "Modul 5–7: komponen tunggal berbasis sketsa (utama)"],
                  ["<strong>Part</strong>", "Primitif (Box, Cylinder), Extrude, Revolve, Sweep, Boolean (Cut/Fuse/Common)", "Memeriksa rumus lewat Python; gabungan objek lepas"],
                  ["<strong>Sketcher</strong>", "Geometri dan konstrain sketsa", "Dipakai dari dalam Part Design"],
                  ["<strong>Draft</strong>", "Objek 2D (Modul 1–4)", "Profil 2D bisa dipakai Part Extrude, tetapi Pad membutuhkan Sketch"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 mengunci fondasi (sketsa terkonstrain). Bagian 03–05 adalah tiga cara membuat solid dari sketsa: Pad/Pocket (Tugas 1 dan 4), Revolution (Tugas 2 dan 5), dan Pipe (Tugas 3). Bagian 06 menyelesaikan tepi (Fillet pada Tugas 4, Chamfer pada Tugas 5), Bagian 07 membaca volume dan massa, dan Bagian 08–09 menutup dengan Python serta praktik braket.")
    m += bagian(1, "m-fitur", "Pemodelan Berbasis Fitur:<br>Body dan Pohon Fitur", "Solid di Part Design tidak digambar, melainkan dibangun bertahap dari sketsa dan operasi. Bagian ini memperkenalkan Body, jenis fitur, dan pohon fitur parametrik yang menjadi cara kerja seluruh sisa semester.", isi, "FITUR DAN BODY")

    # 02 — Sketcher
    isi = tabel(["Konstrain Sketcher", "Ikon / pintasan", "Arti", "Mengurangi DOF"],
                [["Coincident", "C", "Dua titik berimpit (ujung garis bertemu)", "2"],
                 ["Point on object", "O", "Titik berada pada garis/lingkaran", "1"],
                 ["Horizontal / Vertical", "H / V", "Garis sejajar sumbu X / Y sketsa", "1"],
                 ["Parallel / Perpendicular", "P / N", "Dua garis sejajar / tegak lurus", "1"],
                 ["Tangent", "T", "Garis menyinggung lingkaran/busur", "1"],
                 ["Equal", "E", "Dua garis sama panjang / dua lingkaran sama radius", "1"],
                 ["Symmetric", "S", "Dua titik simetris terhadap garis/titik", "2"],
                 ["Horizontal / Vertical distance", "L / I", "Jarak mendatar / tegak (dimensi)", "1"],
                 ["Distance", "K", "Jarak dua titik atau panjang garis", "1"],
                 ["Radius / Diameter", "Shift+R / D", "Ukuran lingkaran/busur", "1"],
                 ["Angle", "A", "Sudut dua garis", "1"],
                 ["Lock", "K (titik)", "Mengunci koordinat titik", "2"]])
    isi += cards([
        ("🟩", "Fully constrained", "Sketsa terkunci penuh: seluruh geometri hijau, 0 derajat kebebasan. Sketsa yang kurang terkonstrain masih bisa bergeser dan membuat fitur ikut berubah tanpa sengaja; yang berlebih (merah) bertentangan.", "DOF = 0"),
        ("📎", "Menempel ke titik asal", "Jangkarkan satu sudut/pusat ke titik asal sketsa (Coincident dengan origin) atau kunci koordinatnya; tanpa jangkar, sketsa yang terkonstrain penuh pun masih bisa digeser sebagai satu kesatuan.", "origin"),
        ("📐", "Bidang sketsa", "Saat membuat Sketch di Body kosong, pilih XY (tampak atas), XZ (depan; untuk Revolution terhadap Z), atau YZ. Pada solid yang sudah ada, klik muka rata lalu Sketch menempel di muka itu.", "XY · XZ · YZ · face"),
        ("🧱", "Geometri konstruksi", "Mode Construction (biru) membuat garis bantu dan sumbu revolusi yang tidak ikut menjadi profil; profil harus tertutup dan tidak tumpang tindih.", "biru = bantu"),
    ])
    isi += anim_panel(1, "cyan", "Sketsa terkonstrain: derajat kebebasan turun ke nol", "cvSketsa",
                      [("sl_sk_w", "v_sk_w", "Lebar w (mm)", 40, 140, 1, 80, "80"),
                       ("sl_sk_h", "v_sk_h", "Tinggi h (mm)", 20, 100, 1, 50, "50")],
                      "btnSketsa", "toggleSketsa", "sketsaInfo",
                      "<strong>Cara membaca:</strong> empat garis lepas bergoyang (16 DOF). Setiap langkah konstrain mengurangi kebebasan; sketsa berhenti bergoyang dan menghijau saat DOF = 0. Urutan yang sama Anda lakukan di Sketcher: geometri → coincident → arah → jangkar ke origin → dimensi.")
    isi += kotak("warning-box", "⚠️ <strong>Kesalahan yang menggagalkan Pad:</strong> profil terbuka (ada ujung yang tidak coincident), dua profil saling memotong, garis konstruksi ikut membentuk profil, atau sketsa kosong karena geometri dibuat di sketsa lain. Solver Sketcher menampilkan pesan di panel Tasks; baca sebelum menutup sketsa.")
    m += bagian(2, "m-sketcher", "Sketcher:<br>Profil Terkonstrain sebagai Fondasi", "Fitur 3D hanya sebaik sketsanya. Bagian ini merangkum konstrain geometris dan dimensi, arti fully constrained, pemilihan bidang sketsa, dan geometri konstruksi.", isi, "SKETCHER")

    # 03 — Pad dan Pocket
    isi = figure(2, "Pad dari sketsa XY dan Pocket lubang tembus", f"Persegi panjang {A_P} × {B_P} di-Pad {H_P} mm, lalu lingkaran ⌀{D_P} pada muka atas di-Pocket through all; volumenya (a·b − πd²/4)·h = {ind(V_PAD, 1)} mm³.", gambar2())
    isi += formula(1, "Volume Hasil Pad dan Pocket", r"V = A_{profil}\,h, \qquad V_{balok\ berlubang} = \left(a\,b - \tfrac{\pi d^{2}}{4}\right) h",
                   r"\(A_{profil}\) = luas profil sketsa &nbsp;·&nbsp; \(h\) = panjang Pad &nbsp;·&nbsp; \(d\) = diameter lubang Pocket tembus. Contoh " + f"{A_P} × {B_P} × {H_P}, ⌀{D_P}" + r": \(V = " + ind(V_PAD, 2) + r"\) mm³.",
                   "Pad adalah prisma: luas alas dikali tinggi. Pocket tembus membuang prisma lain dengan alas lingkaran, sehingga volume bersih adalah selisih keduanya. Shape.Volume pada Body membaca hasil ini langsung, cara memeriksa Tugas 1 dan 4.",
                   [("V", "Volume solid (mm³)"), ("A_{profil}", "Luas profil sketsa (mm²)"), ("h", "Panjang Pad (mm)"), ("d", "Diameter Pocket (mm)")])
    isi += tabel(["Parameter Pad / Pocket", "Pilihan", "Catatan"],
                 [["Type", "Dimension · To last · To first · Up to face · Two dimensions", "Pocket Through all menembus seluruh solid"],
                  ["Length", "Angka (mm)", "Arah normal bidang sketsa; Reversed membalik"],
                  ["Symmetric to plane", "Centang", "Setengah panjang ke tiap sisi bidang sketsa"],
                  ["Taper angle", "Sudut (°)", "Sisi miring (draft) untuk cetakan"],
                  ["Sketch pada muka", "Klik muka rata → Sketch", "Pocket lubang biasanya disketsa di muka atas Pad"]])
    isi += anim_panel(2, "amber", "Pad dan Pocket: balok berlubang tumbuh setinggi h", "cvPad",
                      [("sl_pd_a", "v_pd_a", "Panjang sketsa a (mm)", 50, 120, 1, 80, "80"),
                       ("sl_pd_b", "v_pd_b", "Lebar sketsa b (mm)", 30, 90, 1, 50, "50"),
                       ("sl_pd_h", "v_pd_h", "Panjang Pad h (mm)", 5, 60, 1, 25, "25"),
                       ("sl_pd_d", "v_pd_d", "Diameter Pocket d (mm)", 4, 28, 1, 16, "16")],
                      "btnPad", "togglePad", "padInfo",
                      "<strong>Cara membaca:</strong> balok naik-turun mengikuti panjang Pad (PAUSE untuk menahan di h maksimum); lubang Pocket menembus dari muka atas. Volume dan massa baja di kanan mengikuti Persamaan (1) secara langsung.")
    m += bagian(3, "m-pad", "Pad dan Pocket:<br>Menebalkan dan Memotong dari Sketsa", "Pad adalah fitur 3D pertama yang dibuat setiap pemodel. Bagian ini membahas parameternya, Pocket sebagai kebalikannya, sketsa di muka solid, dan rumus volume prisma untuk memeriksa hasil.", isi, "PAD DAN POCKET")

    # 04 — Revolution
    isi = figure(3, "Revolution profil XZ menjadi bus berongga", f"Persegi panjang ({RI}…{RO}) × {H_R} pada bidang XZ diputar 360° terhadap sumbu Z; volumenya π(r_o² − r_i²)h = {ind(V_BUS, 1)} mm³, sama dengan teorema Pappus.", gambar3())
    isi += formula(2, "Volume Benda Putar dan Teorema Pappus", r"V = \pi\left(r_o^{2} - r_i^{2}\right)h, \qquad V = 2\pi\,\bar{y}\,A \ \ (\text{Pappus})",
                   r"\(r_i, r_o\) = radius dalam dan luar &nbsp;·&nbsp; \(h\) = tinggi &nbsp;·&nbsp; \(\bar{y}\) = jarak titik berat profil ke sumbu &nbsp;·&nbsp; \(A\) = luas profil. Contoh: \(V = " + ind(V_BUS, 2) + r"\) mm³.",
                   "Teorema Pappus berlaku untuk profil apa pun: volume benda putar = luas profil × keliling lintasan titik beratnya (2πȳ). Untuk poros bertingkat, cukup menjumlahkan silinder tiap tingkat; untuk profil rumit, Shape.Volume dan Shape.CenterOfMass profil memberi ȳ dan A.",
                   [("V", "Volume benda putar (mm³)"), ("r_i, r_o", "Radius dalam dan luar (mm)"), ("h", "Tinggi (mm)"), (r"\bar{y}", "Jarak titik berat profil ke sumbu (mm)"), ("A", "Luas profil (mm²)")])
    isi += tabel(["Parameter Revolution", "Pilihan", "Catatan"],
                 [["Axis", "Vertical/Horizontal sketch axis · Base X/Y/Z axis · garis konstruksi", "Profil tidak boleh memotong sumbu"],
                  ["Angle", "0–360°", "Sudut < 360° menghasilkan sektor benda putar"],
                  ["Symmetric / Reversed", "Centang", "Arah putar"],
                  ["Groove", "Revolution subtraktif", "Alur melingkar pada poros (mis. alur ring)"],
                  ["Bidang sketsa", "XZ dengan sumbu Z sebagai sumbu", "Menghasilkan benda putar tegak; profil menempel sumbu → pejal"]])
    isi += anim_panel(3, "green", "Revolution: profil XZ diputar mengelilingi sumbu Z", "cvRevolve",
                      [("sl_rv_ri", "v_rv_ri", "Radius dalam r_i (mm)", 0, 30, 1, 12, "12"),
                       ("sl_rv_ro", "v_rv_ro", "Radius luar r_o (mm)", 10, 50, 1, 24, "24"),
                       ("sl_rv_h", "v_rv_h", "Tinggi h (mm)", 10, 60, 1, 36, "36")],
                      "btnRevolve", "toggleRevolve", "revolveInfo",
                      "<strong>Cara membaca:</strong> profil kuning pada bidang XZ disapu mengelilingi sumbu Z dari 0° sampai 360° (PAUSE menahan bentuk penuh). Volume sebanding sudut; pada 360° sama dengan Persamaan (2), dan teorema Pappus memberi angka yang sama lewat ȳ dan A.")
    m += bagian(4, "m-revolve", "Revolution:<br>Benda Putar dari Setengah Profil", "Poros, bus, flens, dan roda adalah benda putar: satu setengah profil pada bidang XZ diputar terhadap sumbu. Bagian ini membahas sumbu, sudut, Groove, dan teorema Pappus sebagai rumus volume universal benda putar.", isi, "REVOLUTION")

    # 05 — Sweep dan Loft
    isi = figure(4, "Additive Pipe: siku pipa dari profil lingkaran dan lintasan busur", f"Lingkaran ⌀{2 * R_PIPA} pada XY disapu sepanjang busur seperempat lingkaran R{R_LINTASAN} pada XZ; volumenya πr² × (πR/2) = {ind(V_SIKU, 1)} mm³ (Pappus).", gambar4())
    isi += formula(3, "Volume Sapuan (Sweep) Sepanjang Lintasan", r"V = A_{profil}\,s_{G}, \qquad V_{siku} = \pi r^{2}\cdot\frac{\pi R}{2}",
                   r"\(A_{profil}\) = luas profil &nbsp;·&nbsp; \(s_G\) = panjang lintasan yang ditempuh titik berat profil; untuk busur seperempat lingkaran radius \(R\), \(s_G = \pi R/2\). Contoh \(r = " + str(R_PIPA) + r"\), \(R = " + str(R_LINTASAN) + r"\): \(V = " + ind(V_SIKU, 2) + r"\) mm³.",
                   "Sweep adalah generalisasi Pad (lintasan lurus) dan Revolution (lintasan lingkaran): profil digeser sepanjang lintasan sambil tetap tegak lurus padanya. Teorema Pappus memberi volumenya asalkan profil tidak memotong dirinya sendiri di tikungan (radius lintasan > radius profil).",
                   [("V", "Volume sapuan (mm³)"), ("A_{profil}", "Luas profil (mm²)"), ("s_G", "Panjang lintasan titik berat (mm)"), ("r, R", "Radius profil dan radius lintasan (mm)")])
    isi += tabel(["Fitur", "Masukan", "Catatan"],
                 [["<strong>Additive Pipe</strong> (sweep)", "Sketsa profil + lintasan (sketsa/edge/wire); Add Edge", "Mode Standard/Frenet/Fixed/Auxiliary mengatur orientasi profil; Frenet untuk heliks"],
                  ["<strong>Subtractive Pipe</strong>", "Sama, memotong solid", "Alur/kanal melengkung"],
                  ["<strong>Additive Loft</strong>", "Dua sketsa profil atau lebih pada bidang berbeda", "Transisi bentuk (bulat ke persegi); Ruled = sisi lurus"],
                  ["<strong>Helix (Additive)</strong>", "Pitch, tinggi, radius", "Ulir dan pegas (Modul 7)"]])
    isi += kotak("info-box", "<strong>🧭 Lintasan dan profil pada bidang yang tepat:</strong> untuk siku pipa Tugas 3, lintasan busur digambar pada bidang XZ dan profil lingkaran pada bidang XY yang memuat ujung awal busur, sehingga profil tegak lurus lintasan. Bila profil tidak tegak lurus, Pipe tetap jadi tetapi volumenya menyimpang dari rumus Pappus.")
    m += bagian(5, "m-sweep", "Additive Pipe dan Loft:<br>Menyapu Profil Sepanjang Lintasan", "Pipa, selang, pegangan, dan saluran melengkung dibuat dengan sweep. Bagian ini membahas Additive Pipe dan Loft, syarat profil dan lintasan, dan rumus Pappus untuk volume sapuan.", isi, "SWEEP DAN LOFT")

    # 06 — Fillet dan Chamfer
    isi = figure(5, "Penampang balok setelah Fillet dan Chamfer pada rusuk vertikal", "Fillet radius f membuang (4 − π)f² dari penampang, chamfer sama kaki membuang 2f²; dikalikan tinggi Pad, itulah volume yang hilang.", gambar5())
    isi += figure(6, "Poros bertingkat: Revolution setengah profil dan chamfer ujung", f"Dua tingkat ⌀{D1} × {L1} dan ⌀{D2} × {L2} dibuat sekali putar; chamfer C{C_CH:g} pada rusuk ujung membuang cincin bersayap segitiga sebesar π·c²·(R − c/3) = {ind(V_CHAMFER, 2)} mm³.", gambar6())
    isi += formula(4, "Volume yang Hilang oleh Fillet dan Chamfer", r"V_{fillet} = (4 - \pi)f^{2}\,h \ \ (4\ \text{rusuk vertikal}), \qquad V_{chamfer\ ujung} = \pi c^{2}\left(R - \tfrac{c}{3}\right)",
                   r"\(f\) = radius fillet &nbsp;·&nbsp; \(h\) = panjang rusuk vertikal &nbsp;·&nbsp; \(c\) = ukuran chamfer sama kaki pada rusuk lingkaran radius \(R\). Contoh " + f"f = {F_C}, h = {H_P}" + r": \(V_{fillet} = " + ind(LUAS_FILLET * H_P, 2) + r"\) mm³; " + f"c = {C_CH:g}, R = {D2 / 2:g}" + r": \(V_{chamfer} = " + ind(V_CHAMFER, 2) + r"\) mm³.",
                   "Fillet mengganti sudut persegi f × f dengan seperempat lingkaran; selisihnya (1 − π/4)f² per sudut. Chamfer 45° pada rusuk lingkaran membuang cincin bersayap segitiga; teorema Pappus memberi volumenya: luas segitiga c²/2 dikali keliling lintasan titik beratnya 2π(R − c/3). Kedua suku ini yang membedakan Tugas 4 dan 5 dari sekadar balok dan silinder.",
                   [("f", "Radius fillet (mm)"), ("h", "Panjang rusuk yang difillet (mm)"), ("c", "Ukuran chamfer (mm)"), ("R", "Radius rusuk lingkaran (mm)")])
    isi += tabel(["Fitur dressing", "Masukan", "Tips"],
                 [["Fillet", "Pilih rusuk (Ctrl+klik) atau muka; Radius", "Buat setelah semua Pad/Pocket; radius < setengah sisi terpendek"],
                  ["Chamfer", "Rusuk; Type Equal distance / Two distances / Distance and angle", "Chamfer ujung poros memudahkan pemasangan bantalan"],
                  ["Draft", "Muka; sudut; bidang netral", "Kemiringan sisi untuk cetakan"],
                  ["Thickness", "Muka yang dibuang; tebal", "Mengubah solid menjadi cangkang (shell)"]])
    isi += anim_panel(4, "violet", "Fillet dan Chamfer: penampang yang hilang di sudut", "cvFillet",
                      [("sl_fl_a", "v_fl_a", "Panjang a (mm)", 40, 120, 1, 80, "80"),
                       ("sl_fl_b", "v_fl_b", "Lebar b (mm)", 30, 90, 1, 50, "50"),
                       ("sl_fl_f", "v_fl_f", "Radius fillet / ukuran chamfer f (mm)", 2, 20, 1, 10, "10"),
                       ("sl_fl_mode", "v_fl_mode", "Jenis (0 fillet · 1 chamfer)", 0, 1, 1, 0, "fillet")],
                      "btnFillet", "toggleFillet", "filletInfo",
                      "<strong>Cara membaca:</strong> penampang balok kehilangan empat sudut (merah) yang ukurannya berdenyut mengikuti f (PAUSE menahan f maksimum). Fillet membuang (4 − π)f², chamfer 2f²; keduanya dikalikan tinggi Pad menjadi volume yang hilang, suku kedua pada rumus Tugas 4.")
    m += bagian(6, "m-dressing", "Fillet dan Chamfer:<br>Menyelesaikan Tepi Solid", "Tepi tajam dibulatkan atau dipinggul sebagai langkah terakhir. Bagian ini membahas Fillet, Chamfer, dan fitur dressing lain beserta rumus volume yang hilang, termasuk chamfer pada rusuk lingkaran lewat teorema Pappus.", isi, "FILLET DAN CHAMFER")

    # 07 — Volume dan massa
    isi = tabel(["Besaran 3D", "Std Measure", "Python console", "Satuan"],
                [["Volume", "Volume (pilih solid)", "<code>Body.Shape.Volume</code>", "mm³ (÷1000 → cm³)"],
                 ["Luas permukaan", "Area (pilih muka; solid = jumlah)", "<code>Body.Shape.Area</code>", "mm²"],
                 ["Titik berat", "—", "<code>Body.Shape.CenterOfMass</code>", "mm"],
                 ["Kotak pembatas", "—", "<code>Body.Shape.BoundBox</code>", "mm"],
                 ["Massa", "— (tab Data: Material pada 1.0)", "<code>ρ × Volume</code>", "g bila ρ g/cm³ dan V cm³"],
                 ["Momen inersia", "—", "<code>Body.Shape.MatrixOfInertia</code>", "mm⁵ (÷ρ untuk massa)"]])
    isi += formula(5, "Massa dari Volume Model", r"m = \rho\,V, \qquad V[\text{cm}^{3}] = \frac{V[\text{mm}^{3}]}{1000}",
                   r"\(\rho\) = massa jenis bahan (baja 7,85; aluminium 2,70; kuningan 8,5 g/cm³). Contoh balok berlubang " + f"{ind(V_PAD, 1)}" + r" mm³ dari baja: \(m = " + ind(V_PAD / 1000 * RHO_BAJA, 1) + r"\) g.",
                   "Volume dari model adalah dasar taksiran berat, biaya bahan, dan beban rakitan. FreeCAD 1.0 memungkinkan menetapkan Material pada Body sehingga massa tampil otomatis; tanpa itu, kalikan sendiri ρ dengan volume dalam cm³.",
                   [("m", "Massa (g)"), (r"\rho", "Massa jenis (g/cm³)"), ("V", "Volume (cm³)")])
    isi += kotak("tip-box", "💡 <strong>Membaca Body, bukan fitur:</strong> <code>Body.Shape</code> selalu menunjuk fitur Tip (hasil akhir). Membaca <code>Pad.Shape.Volume</code> pada model yang sudah di-Pocket dan di-Fillet memberi volume sebelum pemotongan, bukan volume akhir. Std Measure Volume dengan memilih Body juga membaca Tip.")
    m += bagian(7, "m-baca", "Membaca Volume, Luas, dan Massa:<br>Angka yang Diperiksa Tugas", "Model 3D memberi besaran yang tidak bisa diukur dari gambar 2D. Bagian ini memetakan cara membaca volume, luas permukaan, titik berat, dan massa, serta jebakan membaca fitur alih-alih Body.", isi, "VOLUME DAN MASSA")

    # 08 — Python console
    isi = kode("Python console — Body, Sketch persegi panjang terkonstrain, Pad, dan Pocket", f'''import FreeCAD as App, Part, Sketcher
doc = App.newDocument("Latihan5")
V = App.Vector
body = doc.addObject("PartDesign::Body", "Body")
sk = body.newObject("Sketcher::SketchObject", "Sketch")
sk.AttachmentSupport = (doc.getObject("XY_Plane"), [""]); sk.MapMode = "FlatFace"
a, b, h = {A_P}, {B_P}, {H_P}
p = [V(0,0,0), V(a,0,0), V(a,b,0), V(0,b,0)]
for i in range(4): sk.addGeometry(Part.LineSegment(p[i], p[(i+1)%4]), False)
for i in range(4): sk.addConstraint(Sketcher.Constraint("Coincident", i, 2, (i+1)%4, 1))
sk.addConstraint(Sketcher.Constraint("Horizontal", 0)); sk.addConstraint(Sketcher.Constraint("Horizontal", 2))
sk.addConstraint(Sketcher.Constraint("Vertical", 1)); sk.addConstraint(Sketcher.Constraint("Vertical", 3))
sk.addConstraint(Sketcher.Constraint("Coincident", 0, 1, -1, 1))          # sudut ke titik asal (-1 = root point)
sk.addConstraint(Sketcher.Constraint("DistanceX", 0, 1, 0, 2, a))
sk.addConstraint(Sketcher.Constraint("DistanceY", 1, 1, 1, 2, b))
pad = body.newObject("PartDesign::Pad", "Pad"); pad.Profile = sk; pad.Length = h
doc.recompute()
print(f"Sketsa DOF = {{sk.solve()}}  (0 = fully constrained)")
print(f"Volume Pad = {{body.Shape.Volume:.2f}} mm^3  (a*b*h = {{a*b*h}})")                       # {A_P * B_P * H_P}
sk2 = body.newObject("Sketcher::SketchObject", "Sketch001")
sk2.AttachmentSupport = (pad, ["Face6"]); sk2.MapMode = "FlatFace"      # muka atas Pad (periksa nama muka di GUI)
sk2.addGeometry(Part.Circle(V(a/2, b/2, 0), V(0,0,1), {D_P / 2}), False)
pocket = body.newObject("PartDesign::Pocket", "Pocket"); pocket.Profile = sk2; pocket.Type = 1   # 1 = Through all
doc.recompute()
print(f"Volume setelah Pocket = {{body.Shape.Volume:.2f}} mm^3  (rumus {{(a*b - 3.14159265*{D_P}**2/4)*h:.2f}})")   # {ind(V_PAD, 2)}''', "Python (FreeCAD)")
    isi += kode("Python console — memeriksa rumus Revolution, Pipe, dan Fillet dengan Part API", f'''import FreeCAD as App, Part, math
V = App.Vector
# Bus berongga: profil XZ ({RI}..{RO}) x {H_R} diputar terhadap Z
prof = Part.Face(Part.makePolygon([V({RI},0,0), V({RO},0,0), V({RO},0,{H_R}), V({RI},0,{H_R}), V({RI},0,0)]))
bus = prof.revolve(V(0,0,0), V(0,0,1), 360)
print(f"Bus = {{bus.Volume:.2f}} mm^3 (rumus {{math.pi*({RO}**2-{RI}**2)*{H_R}:.2f}})")                      # {ind(V_BUS, 2)}
# Siku pipa: profil lingkaran r = {R_PIPA} di ({R_LINTASAN},0,0) pada XY, lintasan busur R = {R_LINTASAN} pada XZ
busur = Part.Wire(Part.ArcOfCircle(Part.Circle(V(0,0,0), V(0,1,0), {R_LINTASAN}), 0, math.pi/2).toShape())
profil = Part.Wire(Part.makeCircle({R_PIPA}, V({R_LINTASAN},0,0), V(0,0,1)))
siku = busur.makePipeShell([profil], True, True)     # solid=True, frenet=True
print(f"Siku = {{siku.Volume:.2f}} mm^3 (Pappus {{math.pi*{R_PIPA}**2*math.pi*{R_LINTASAN}/2:.2f}})")            # {ind(V_SIKU, 2)}
# Balok berlubang + fillet 4 rusuk vertikal
balok = Part.makeBox({A_P}, {B_P}, {H_P}).cut(Part.makeCylinder({D_P / 2}, {H_P}, V({A_P / 2}, {B_P / 2}, 0)))
tegak = [e for e in balok.Edges if abs(e.Vertexes[0].X - e.Vertexes[1].X) < 1e-6 and abs(e.Vertexes[0].Y - e.Vertexes[1].Y) < 1e-6 and e.Length > {H_P} - 1e-6]
fil = balok.makeFillet({F_C}, tegak)
print(f"Balok fillet = {{fil.Volume:.2f}} mm^3 (rumus {{({A_P}*{B_P}-(4-math.pi)*{F_C}**2-math.pi*{D_P}**2/4)*{H_P}:.2f}})")   # {ind(V_BALOK_FILLET, 2)}''', "Python (FreeCAD)")
    isi += kode("Python console — poros bertingkat, chamfer ujung, dan massa", f'''import FreeCAD as App, Part, math
V = App.Vector
R1, R2, L1, L2, c = {D1 / 2}, {D2 / 2}, {L1}, {L2}, {C_CH}
prof = Part.Face(Part.makePolygon([V(0,0,0), V(R1,0,0), V(R1,0,L1), V(R2,0,L1), V(R2,0,L1+L2), V(0,0,L1+L2), V(0,0,0)]))
poros = prof.revolve(V(0,0,0), V(0,0,1), 360)
atas = [e for e in poros.Edges if e.Curve.__class__.__name__ == "Circle" and abs(e.Vertexes[0].Z - (L1+L2)) < 1e-6 and abs(e.Curve.Radius - R2) < 1e-6]
akhir = poros.makeChamfer(c, atas)
print(f"Poros = {{poros.Volume:.2f}}, setelah chamfer = {{akhir.Volume:.2f}} mm^3")
print(f"Rumus: {{math.pi*R1**2*L1 + math.pi*R2**2*L2:.2f}} - {{math.pi*c**2*(R2-c/3):.2f}} = {{math.pi*R1**2*L1 + math.pi*R2**2*L2 - math.pi*c**2*(R2-c/3):.2f}}")   # {ind(V_POROS - V_CHAMFER, 2)}
rho = {RHO_BAJA}                                            # g/cm^3 baja
print(f"Massa baja = {{akhir.Volume/1000*rho:.1f}} g; titik berat z = {{akhir.CenterOfMass.z:.2f}} mm")
Part.show(akhir, "PorosChamfer")''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (balok berlubang " + ind(V_PAD, 2) + " mm³, bus " + ind(V_BUS, 2) + " mm³, siku " + ind(V_SIKU, 2) + " mm³, balok fillet " + ind(V_BALOK_FILLET, 2) + " mm³, poros chamfer " + ind(V_POROS - V_CHAMFER, 2) + " mm³). Tugas meminta model dibuat dengan alat Part Design (Body, Sketch, Pad, Revolution, Pipe, Pocket, Fillet, Chamfer) agar pohon fiturnya ada di berkas; Part API di sini hanya untuk memeriksa rumus.")
    m += bagian(8, "m-python", "Python Console:<br>Membangun dan Memeriksa Solid", "Cell pertama membangun Body, sketsa terkonstrain, Pad, dan Pocket lewat API Part Design; dua cell berikutnya memeriksa rumus Revolution, Pipe, Fillet, dan Chamfer dengan Part API, lalu menghitung massa.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Body dan sketsa dasar", "Part Design → Create body → Create sketch → XY. Gambar profil L braket: polyline 6 titik (80 × 60, tebal 12), konstrain coincident, H/V, jangkar ke origin, dimensi sampai Fully constrained. Close."),
               ("2", "Pad", "Pad Length 40 mm. Baca Body.Shape.Volume di Python console dan bandingkan dengan luas profil × 40."),
               ("3", "Lubang", "Klik muka atas kaki mendatar → Create sketch → dua lingkaran ⌀9 (konstrain Diameter, posisi dari tepi) → Pocket Through all. Volume berkurang 2 × π·4,5² × 12."),
               ("4", "Fillet dalam", "Pilih rusuk dalam siku L (satu rusuk sepanjang 40 mm) → Fillet R6. Volume bertambah? Tidak: fillet dalam justru menambah bahan; hitung selisihnya lewat Shape.Volume."),
               ("5", "Chamfer luar", "Pilih dua rusuk luar ujung kaki → Chamfer 2 mm. Periksa pohon fitur: Sketch, Pad, Sketch001, Pocket, Fillet, Chamfer; Tip = Chamfer."),
               ("6", "Ubah parameter", "Buka Sketch, ubah tebal 12 → 15, Close, recompute: semua fitur mengikuti tanpa dibuat ulang. Kembalikan ke 12."),
               ("7", "Massa dan simpan", "Hitung massa aluminium (ρ = 2,70 g/cm³) dari Volume/1000; V lalu F; Ctrl+S → <code>Latihan5_NIM.FCStd</code>.")]
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
                 [["Pad gagal: “Sketch is not closed / has self-intersections”", "Ujung garis tidak coincident, atau dua profil bersilangan", "Perbesar tampilan sudut; tambah Coincident; hapus garis ganda"],
                  ["Pad jadi tetapi volume 0 atau aneh", "Profil ganda (dua kontur tumpang tindih)", "Satu profil tertutup per sketsa, atau kontur terpisah tanpa tumpang tindih"],
                  ["Sketsa bergeser saat diklik", "Belum fully constrained / tidak dijangkar ke origin", "Tambah konstrain sampai hijau; Coincident sudut ke origin"],
                  ["Revolution gagal: “profile crosses axis”", "Profil memotong sumbu", "Geser profil agar menempel/menjauh dari sumbu"],
                  ["Pipe terpuntir atau tipis", "Profil tidak tegak lurus lintasan, atau r ≥ R", "Profil pada bidang yang memuat ujung lintasan; radius profil lebih kecil dari radius busur"],
                  ["Fillet gagal", "Radius terlalu besar untuk rusuk yang dipilih", "Kecilkan radius; fillet rusuk terpendek terakhir"],
                  ["Volume Pad tidak berubah setelah Pocket", "Membaca Pad.Shape, bukan Body.Shape", "Baca Body.Shape.Volume (Tip)"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) satu Body dengan pohon fitur sesuai permintaan (Sketch → Pad/Revolution/Pipe → Pocket → Fillet/Chamfer); (2) semua sketsa fully constrained; (3) bidang sketsa benar (XY untuk Pad, XZ untuk Revolution terhadap Z); (4) volume dibaca dari Body (Tip), 2 desimal; (5) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Braket L Tiga Dimensi", "Tujuh langkah berikut membangun braket siku 3D lengkap dengan Pad, Pocket, Fillet, dan Chamfer, menunjukkan sifat parametrik pohon fitur, dan menghitung massanya; ditutup tabel gejala dan perbaikan.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab sketch-based features (extrude, revolve, sweep, loft) dan fillet/chamfer; konsep yang sama pada Part Design FreeCAD.")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: alur sketch → feature, fully constrained sketch, dan pohon fitur parametrik.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: PartDesign Workbench (Body, Pad, Pocket, Revolution, AdditivePipe, Fillet, Chamfer), Sketcher Workbench", " (wiki.freecad.org), 2024–2026.", "Acuan nama fitur, parameter, dan API Part Design/Sketcher yang dipakai di cell Python.")
    refs += pm_ref(4, "green", "0,224,158", "G. R. Bertoline, E. N. Wiebe, N. W. Hartman &amp; W. A. Ross", "Fundamentals of Graphics Communication", ", 6th ed. McGraw-Hill, 2011.", "Bab solid modeling: fitur berbasis sketsa, operasi sweep, dan pohon fitur.")
    refs += pm_ref(5, "pink", "236,72,153", "R. C. Hibbeler", "Engineering Mechanics: Statics", ", 14th ed. Pearson, 2016.", "Teorema Pappus–Guldinus untuk volume benda putar dan sapuan, serta titik berat gabungan.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi pemodelan berbasis fitur, Sketcher, Pad/Revolution/Pipe, Fillet/Chamfer, dan rumus volume. Dokumentasi Part Design dan Sketcher adalah pendamping wajib karena parameter fitur mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki PartDesign Body/Pad/Pocket/Revolution/AdditivePipe/Fillet/Chamfer, Sketcher Constraints (daftar konstrain dan pintasan), Sketcher scripting, dan Part TopoShape (Volume, CenterOfMass). Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi rumus untuk memeriksa hasilnya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 5 — Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Sketch → Pad</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Revolution</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">Additive Pipe</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Fillet · Chamfer</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">Shape.Volume</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 5 · Pemodelan 3D Berbasis Sketsa</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 5</span><br><em>Solid Pertama</em><br>di Part Design</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang Body, Sketcher, Pad, Pocket, Revolution, Pipe, Fillet, dan Chamfer, ditambah 5 tugas pemodelan 3D: balok Pad, bus Revolution, siku pipa Additive Pipe, balok berlubang dengan fillet rusuk, dan poros bertingkat dengan chamfer ujung. Setiap tugas mengunggah berkas .FCStd (Body dengan pohon fitur) dan mengisi volume solid akhir. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Fungsi <strong>Body</strong> pada Part Design adalah...",
     ["Menyimpan pengaturan satuan dokumen", "Wadah satu solid tunggal yang dibangun dari fitur-fitur berurutan (Sketch → Pad → Pocket …)", "Mengelompokkan beberapa solid lepas menjadi rakitan", "Lembar gambar untuk mencetak model"],
     "Fungsi Body"),
    ("Sketsa yang <strong>terkonstrain penuh</strong> (fully constrained) ditandai dengan...",
     ["Geometri berwarna merah dan pesan konflik", "Geometri berwarna putih dan masih bisa digeser", "Seluruh geometri hijau, pesan “Fully constrained”, 0 derajat kebebasan, tidak dapat digeser", "Sketsa tertutup otomatis oleh FreeCAD"],
     "Tanda fully constrained"),
    ("<strong>Pad</strong> pada Part Design berfungsi untuk...",
     ["Menebalkan (extrude) sketsa tertutup menjadi solid aditif dengan panjang tertentu", "Memutar sketsa mengelilingi sumbu", "Membulatkan rusuk solid", "Memotong solid dengan bidang"],
     "Fungsi Pad"),
    ("<strong>Pocket</strong> dengan tipe Through all akan...",
     ["Menebalkan sketsa ke dua arah", "Membuat salinan solid", "Memutar sketsa 360°", "Memotong profil sketsa menembus seluruh solid (subtraktif)"],
     "Pocket Through all"),
    ("<strong>Revolution</strong> memerlukan...",
     ["Dua sketsa pada bidang berbeda", "Sketsa profil tertutup dan sumbu putar (sumbu sketsa, garis konstruksi, atau sumbu Body) yang tidak dipotong profil", "Lintasan busur dan profil lingkaran", "Solid yang sudah ada untuk dipotong"],
     "Syarat Revolution"),
    ("<strong>Additive Pipe</strong> (sweep) memerlukan...",
     ["Hanya satu sketsa profil", "Dua profil pada bidang sejajar", "Sketsa profil tertutup dan lintasan (sketsa/edge) yang dilewati profil", "Sumbu putar dan sudut"],
     "Syarat Additive Pipe"),
    ("Perbedaan <strong>Fillet</strong> dan <strong>Chamfer</strong> adalah...",
     ["Fillet membulatkan rusuk dengan permukaan berjari-jari r; Chamfer memotong rusuk dengan bidang miring", "Fillet untuk rusuk luar saja; Chamfer untuk rusuk dalam saja", "Fillet menambah volume; Chamfer selalu mengurangi luas permukaan", "Tidak ada perbedaan selain nama"],
     "Fillet vs Chamfer"),
    ("Volume solid hasil pemodelan dibaca dari...",
     ["Properti Length pada Pad", "Shape.Volume di Python console (mm³) atau Std Measure mode Volume pada Body", "Jumlah titik pada sketsa", "Properti Radius pada Fillet"],
     "Membaca volume"),
    ("Perbedaan <strong>Part Extrude</strong> dan <strong>PartDesign Pad</strong> adalah...",
     ["Extrude hanya untuk lingkaran; Pad untuk persegi", "Extrude menghasilkan solid lebih presisi", "Extrude bekerja pada objek apa pun tanpa Body dan menghasilkan objek terpisah; Pad harus di dalam Body dan menyatu dengan solid Body", "Pad hanya tersedia pada FreeCAD versi lama"],
     "Extrude vs Pad"),
    ("Sketsa pada bidang <strong>XZ</strong> yang di-Revolution terhadap sumbu vertikal sketsa (sumbu Z) menghasilkan...",
     ["Balok persegi", "Prisma segitiga", "Solid yang identik dengan Pad", "Benda putar yang simetris terhadap sumbu Z (poros, bus, flens)"],
     "Hasil Revolution pada XZ"),
]

TUGAS_LABELS = ["Pad persegi panjang — volume (mm³)", "Revolution bus berongga (XZ) — volume (mm³)", "Additive Pipe siku pipa — volume (mm³)",
                "Pad + Pocket + Fillet rusuk vertikal — volume (mm³)", "Revolution poros bertingkat + Chamfer ujung — volume (mm³)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 1, 3: 0}

FQ_JUDUL = [
    "Bagaimana alur Body–Sketch–Pad–Pocket untuk braket billet, dan mengapa sketsa harus terkonstrain penuh?",
    "Kapan memakai Revolution, Pad, atau Pipe untuk bus, dudukan, dan siku pipa pada rakitan ini?",
    "Bagaimana urutan fillet/chamfer dan taksiran massa dari Shape.Volume menentukan biaya bahan?",
]
FQ_RINGKAS = [
    "Susun pohon fitur braket dari billet aluminium: sketsa L terkonstrain penuh, Pad, sketsa lubang di muka, Pocket through all. Jelaskan akibat sketsa yang kurang terkonstrain saat pelanggan mengubah tebal.",
    "Pasangkan tiap komponen dengan fitur yang tepat (bus → Revolution profil XZ, dudukan → Pad, siku → Additive Pipe) dan hitung volume masing-masing dengan Persamaan (1)–(3).",
    "Tentukan urutan Fillet/Chamfer terhadap Pocket, hitung volume yang hilang dengan Persamaan (4), dan taksir massa aluminium (ρ = 2,70) serta biaya bahan dari Shape.Volume.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Braket dudukan motor dipesin dari billet aluminium 6061 dengan CNC 3-sumbu: profil L 120 × 90 mm tebal 15, lebar 60 mm, empat lubang ⌀9. Susun pohon fitur Part Design-nya (Bagian 01–03): sketsa apa pada bidang mana, konstrain apa saja sampai fully constrained, Pad berapa, sketsa lubang di muka mana, Pocket tipe apa. Jelaskan apa yang terjadi bila sketsa L tidak dijangkar ke origin ketika pelanggan meminta tebal 15 → 18 mm.",
            ["L 120 × 90 × 15, lebar 60", "4 × ⌀9 through all", "fully constrained"],
            "Syarat sketsa agar Pad berhasil dan model tetap benar saat dimensinya diubah adalah...",
            ["Sketsa boleh terbuka asalkan digambar rapi", "Sketsa cukup diberi warna hijau secara manual", "Profil tertutup tanpa tumpang tindih dan terkonstrain penuh (0 DOF), dijangkar ke titik asal", "Sketsa harus dibuat di Draft Workbench"],
            "✅ Tepat! Pad membutuhkan profil tertutup, dan konstrain penuh menjamin perubahan satu dimensi tidak menggeser geometri lain; jangkar ke origin mencegah seluruh profil bergeser sebagai satu kesatuan. Warna hijau adalah hasil, bukan sebab.",
            "❌ Profil terbuka menggagalkan Pad; warna hijau tidak bisa diatur manual; Draft bukan syarat. Lihat Bagian 02 dan Animasi 1.",
            "Petunjuk: (1) Tulis pohon fitur berurutan. (2) Daftarkan konstrain sketsa L. (3) Jelaskan akibat sketsa kurang terkonstrain saat tebal diubah.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Rakitan yang sama memuat bus perunggu ⌀30/⌀20 × 40, dudukan balok 80 × 50 × 25 berlubang ⌀16, dan siku pipa pendingin ⌀12 dengan radius lintasan 40 mm. Pasangkan tiap komponen dengan fitur yang tepat (Bagian 03–05), sebutkan bidang sketsa dan sumbunya, dan hitung volume masing-masing dengan Persamaan (1), (2), dan (3). Jelaskan mengapa bus tidak dibuat dengan Pad dua lingkaran.",
            ["bus ⌀30/⌀20 × 40", "dudukan 80 × 50 × 25, ⌀16", "siku ⌀12, R40"],
            "Bus berongga ⌀30/⌀20 × 40 mm paling tepat dimodelkan dengan...",
            ["Pad dari sketsa dua lingkaran sepusat pada XY setinggi 40", "Revolution profil persegi panjang (10…15) × 40 pada bidang XZ terhadap sumbu Z", "Additive Pipe lingkaran ⌀30 sepanjang garis 40 mm", "Loft antara dua lingkaran"],
            "✅ Tepat! Bus adalah benda putar: satu setengah profil pada XZ diputar terhadap Z memberi bentuk lengkap dan mudah ditambah chamfer atau alur (Groove). Pad dua lingkaran juga menghasilkan volume yang sama, tetapi fitur benda putar lain (chamfer ujung, alur) lebih alami pada Revolution.",
            "❌ Pad dua lingkaran memberi volume yang sama tetapi bukan cara kerja benda putar; Pipe sepanjang garis lurus adalah Pad yang berbelit; Loft untuk transisi bentuk. Lihat Bagian 04.",
            "Petunjuk: (1) Pasangkan komponen dengan fitur dan bidang sketsanya. (2) Hitung tiga volume. (3) Jelaskan pilihan Revolution untuk bus.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Pelanggan meminta fillet R6 pada rusuk vertikal dudukan dan chamfer C2 pada ujung bus, lalu taksiran berat total untuk menghitung biaya aluminium Rp 60.000/kg dan perunggu Rp 180.000/kg. Tentukan urutan fitur dressing terhadap Pocket (Bagian 06), hitung volume yang hilang dengan Persamaan (4), taksir massa dengan Persamaan (5) (ρ Al 2,70; perunggu 8,8 g/cm³), dan jelaskan mengapa membaca Pad.Shape.Volume memberi angka yang salah.",
            ["fillet R6 · chamfer C2", "ρ Al 2,70 · perunggu 8,8", "Body.Shape.Volume"],
            "Taksiran massa komponen yang benar diperoleh dari...",
            ["ρ × Body.Shape.Volume (Tip), dengan volume mm³ dibagi 1000 menjadi cm³", "ρ × Pad.Shape.Volume, karena Pad adalah fitur utama", "Jumlah panjang semua rusuk × ρ", "Luas sketsa × ρ tanpa tinggi"],
            "✅ Tepat! Body.Shape menunjuk fitur Tip (hasil akhir setelah Pocket, Fillet, Chamfer); massa = ρ·V dengan satuan disamakan. Pad.Shape masih memuat bahan yang sudah dibuang Pocket dan Fillet.",
            "❌ Pad.Shape belum memperhitungkan Pocket/Fillet; panjang rusuk dan luas sketsa bukan volume. Lihat kotak “Membaca Body, bukan fitur” pada Bagian 07.",
            "Petunjuk: (1) Tetapkan urutan dressing setelah Pocket. (2) Hitung volume hilang fillet/chamfer. (3) Taksir massa dan biaya dari Body.Shape.Volume.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">billet Al 6061</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Body → Pad → Pocket</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">V = 2π·ȳ·A</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">m = ρ·V</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 5 · Pemodelan 3D Berbasis Sketsa</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Dari Billet<br><em>ke Komponen 3D</em></h1>
    <p class="hero-sub">Bengkel Karya Logam naik kelas: pesanan kini berupa komponen 3D yang dipesin CNC dari billet, bukan lagi pelat potong laser. Terapkan Pertemuan 5: Body, sketsa terkonstrain, Pad, Revolution, Pipe, dressing, dan taksiran massa, untuk menyusun model yang siap dipesin dan dihargai.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Bengkel Karya Logam —<br>Rakitan Dudukan Motor dari Billet</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PEMODELAN 3D</div>
    <p>
      <strong style="color:var(--amber)">Bengkel Karya Logam</strong> menerima pesanan <strong style="color:var(--cyan)">12 set rakitan dudukan motor</strong> yang dipesin CNC 3-sumbu dari billet: <strong>braket L aluminium 6061</strong> (120 × 90 × 15 mm, lebar 60, empat lubang ⌀9), <strong>dudukan balok</strong> 80 × 50 × 25 mm berlubang ⌀16 dengan fillet R6 pada rusuk vertikal, <strong>bus perunggu</strong> ⌀30/⌀20 × 40 mm dengan chamfer C2, dan <strong>siku pipa pendingin</strong> ⌀12 mm berlintasan busur R40.
    </p>
    <p style="margin-top:12px">
      Operator CNC meminta <strong style="color:var(--cyan)">model 3D (.FCStd/STEP)</strong>, bukan gambar 2D, dan bagian penjualan meminta <strong>taksiran berat tiap komponen</strong> untuk menghitung harga bahan (aluminium Rp 60.000/kg, perunggu Rp 180.000/kg). Percobaan pertama gagal: Pad braket ditolak karena sketsa terbuka, bus dibuat dari dua lingkaran sehingga chamfer sulit ditambahkan, dan berat ditaksir dari Pad sebelum lubang dan fillet.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">prosedur pemodelan 3D</strong>: pohon fitur tiap komponen, pemilihan Pad/Revolution/Pipe, urutan dressing, dan taksiran massa dari volume model.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Braket L Al 120 × 90 × 15, 4 × ⌀9", "14,165,233", "cyan")}
{kartu("Dudukan 80 × 50 × 25, ⌀16, fillet R6", "14,165,233", "cyan")}
{kartu("Bus perunggu ⌀30/⌀20 × 40, chamfer C2", "14,165,233", "cyan")}
{kartu("Siku ⌀12, R40 · 12 set · harga per kg", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Pad yang gagal, bus yang salah cara, dan berat yang meleset berasal dari tiga hal: sketsa yang tidak terkonstrain, fitur yang tidak cocok dengan bentuk, dan volume yang dibaca dari fitur yang salah. Forum ini mengajak Anda membereskan ketiganya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Empat komponen rakitan dan fitur pembentuknya: Pad, Pad + Pocket + Fillet, Revolution + Chamfer, Additive Pipe</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Bengkel Karya Logam menerima pesanan 12 set rakitan dudukan motor yang dipesin CNC dari billet: braket L aluminium 120 &times; 90 &times; 15 mm (lebar 60, 4 &times; &oslash;9), dudukan balok 80 &times; 50 &times; 25 berlubang &oslash;16 dengan fillet R6, bus perunggu &oslash;30/&oslash;20 &times; 40 dengan chamfer C2, dan siku pipa &oslash;12 berlintasan busur R40. Operator CNC meminta model 3D; penjualan meminta taksiran berat untuk harga bahan. Percobaan pertama gagal: sketsa terbuka, bus dari dua lingkaran, berat ditaksir dari Pad sebelum lubang/fillet. Susun pohon fitur tiap komponen, pilihan Pad/Revolution/Pipe, urutan dressing, dan taksiran massa dari Body.Shape.Volume."
FORUM_CHIPS_LMS = ["braket L Al 120 × 90 × 15, 4 × ⌀9", "dudukan 80 × 50 × 25, ⌀16, fillet R6", "bus ⌀30/⌀20 × 40, chamfer C2", "siku ⌀12 R40 · 12 set"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Empat komponen rakitan dudukan motor dan fitur pembentuknya (Pertemuan 5)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const P = (p, cx, cy, s) => { const a = 35 * Math.PI / 180, e = 28 * Math.PI / 180; const x1 = p[0] * Math.cos(a) - p[1] * Math.sin(a), y1 = p[0] * Math.sin(a) + p[1] * Math.cos(a); return [cx + s * x1, cy - s * (p[2] * Math.cos(e) + y1 * Math.sin(e))]; };
  const poli = (pts, cx, cy, s, isi, garis) => { ctx.beginPath(); pts.map(p => P(p, cx, cy, s)).forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); if (isi) { ctx.fillStyle = isi; ctx.fill(); } ctx.strokeStyle = garis; ctx.lineWidth = 1.2; ctx.stroke(); };
  const kolom = W / 4, s = Math.min(kolom / 170, (H - 60) / 110);
  const nama = ['Braket L — Pad', 'Dudukan — Pad+Pocket+Fillet', 'Bus — Revolution+Chamfer', 'Siku — Additive Pipe'];
  for (let k = 0; k < 4; k++) {
    const cx = kolom * (k + 0.5), cy = H * 0.72;
    if (k === 0) { const pr = [[0, 0], [60, 0], [60, 15], [15, 15], [15, 45], [0, 45]]; const b0 = pr.map(p => [p[0], p[1], 0]), b1 = pr.map(p => [p[0], p[1], 30]); for (let i = 0; i < 6; i++) poli([b0[i], b0[(i + 1) % 6], b1[(i + 1) % 6], b1[i]], cx - 30 * s, cy, s, 'rgba(34,211,238,.10)', 'rgba(34,211,238,.6)'); poli(b1, cx - 30 * s, cy, s, 'rgba(34,211,238,.22)', '#22d3ee'); }
    if (k === 1) { const b0 = [[0, 0, 0], [50, 0, 0], [50, 32, 0], [0, 32, 0]], b1 = b0.map(p => [p[0], p[1], 16]); for (let i = 0; i < 4; i++) poli([b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]], cx - 25 * s, cy, s, 'rgba(34,211,238,.10)', 'rgba(34,211,238,.6)'); poli(b1, cx - 25 * s, cy, s, 'rgba(34,211,238,.22)', '#22d3ee'); const l = []; for (let i = 0; i < 24; i++) l.push([25 + 6 * Math.cos(i / 24 * 6.283), 16 + 6 * Math.sin(i / 24 * 6.283), 16]); poli(l, cx - 25 * s, cy, s, '#020812', '#f59e0b'); }
    if (k === 2) { const n = 28; for (let i = 0; i < n; i++) { const t0 = i / n * 6.283, t1 = (i + 1) / n * 6.283; poli([[15 * Math.cos(t0), 15 * Math.sin(t0), 0], [15 * Math.cos(t1), 15 * Math.sin(t1), 0], [15 * Math.cos(t1), 15 * Math.sin(t1), 40], [15 * Math.cos(t0), 15 * Math.sin(t0), 40]], cx, cy, s, 'rgba(34,211,238,.08)', 'rgba(34,211,238,.3)'); } const a = [], d = []; for (let i = 0; i < n; i++) { a.push([15 * Math.cos(i / n * 6.283), 15 * Math.sin(i / n * 6.283), 40]); d.push([10 * Math.cos(i / n * 6.283), 10 * Math.sin(i / n * 6.283), 40]); } poli(a, cx, cy, s, 'rgba(34,211,238,.2)', '#22d3ee'); poli(d, cx, cy, s, '#020812', '#22d3ee'); }
    if (k === 3) { const n = 14; for (let i = 0; i < n; i++) { const t0 = i / n * 1.5708; const ring = []; for (let j = 0; j < 12; j++) { const ph = j / 12 * 6.283; ring.push([40 * Math.cos(t0) + 6 * Math.cos(ph) * Math.cos(t0), 6 * Math.sin(ph), 40 * Math.sin(t0) + 6 * Math.cos(ph) * Math.sin(t0)]); } poli(ring, cx - 20 * s, cy + 10 * s, s, 'rgba(34,211,238,.10)', 'rgba(34,211,238,.4)'); } }
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText(nama[k], cx, H - 10);
  }
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ massa tiap komponen = ρ × Body.Shape.Volume (Tip), bukan dari Pad', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
