# Konten Modul 4 Pemodelan CAD — Dimensi, Anotasi, dan Format Gambar Teknik
# (Sub-CPMK 2.2: perintah dimensi linear/angular/radius, penambahan teks dan anotasi,
# pengaturan format dimensi dan layer; ditutup dengan lembar gambar TechDraw).
# Angka contoh dihitung di sini agar teks, tabel, dan gambar konsisten, dan sengaja
# tidak sama dengan varian tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel)

NOMOR = 4
JUDUL = "Dimensi, Anotasi, dan Format Gambar Teknik"
JUDUL_PANJANG = "Dimensi, Anotasi, dan Format Gambar Teknik"
JUDUL_EKSPOR = "Dimensi, Anotasi, dan Format Gambar Teknik"

# ─────────────────────────── angka contoh ───────────────────────────
L_P = [25, 35, 30]
H_P = [12, 18, 14]
LUAS_PROFIL = sum(l * h for l, h in zip(L_P, H_P))
R_S, TH_S = 40, 60
LUAS_SEKTOR = 0.5 * R_S ** 2 * math.radians(TH_S)
L_SL, D_SL = 60, 16
LUAS_SLOT = 2 * (D_SL / 2) * L_SL + math.pi * (D_SL / 2) ** 2
A_C, B_C, C_C, D_C = 120, 70, 15, 20
LUAS_CHAMFER = A_C * B_C - C_C ** 2 / 2 - math.pi * D_C ** 2 / 4
N_CH, T_CH = 4, 0.2


# ─────────────────────────── gambar ───────────────────────────
def _dim(x1, y1, x2, y2, teks, warna, ofs, size=10):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * ofs, dx / L * ofs
    ux, uy = dx / L, dy / L
    out = f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x1 + nx * 1.15:.1f}" y2="{y1 + ny * 1.15:.1f}" stroke="{warna}" stroke-width="1"/>'
    out += f'<line x1="{x2:.1f}" y1="{y2:.1f}" x2="{x2 + nx * 1.15:.1f}" y2="{y2 + ny * 1.15:.1f}" stroke="{warna}" stroke-width="1"/>'
    out += f'<line x1="{x1 + nx:.1f}" y1="{y1 + ny:.1f}" x2="{x2 + nx:.1f}" y2="{y2 + ny:.1f}" stroke="{warna}" stroke-width="1"/>'
    for px, py, s in ((x1 + nx, y1 + ny, 1), (x2 + nx, y2 + ny, -1)):
        out += f'<polygon points="{px:.1f},{py:.1f} {px + s * ux * 8 - uy * 3:.1f},{py + s * uy * 8 + ux * 3:.1f} {px + s * ux * 8 + uy * 3:.1f},{py + s * uy * 8 - ux * 3:.1f}" fill="{warna}"/>'
    mx, my = (x1 + x2) / 2 + nx * 1.35, (y1 + y2) / 2 + ny * 1.35
    ang = math.degrees(math.atan2(dy, dx))
    if ang > 90 or ang < -90:
        ang += 180
    out += f'<text x="{mx:.1f}" y="{my + 3.5:.1f}" text-anchor="middle" font-size="{size}" fill="{warna}" font-family="\'JetBrains Mono\',monospace" transform="rotate({ang:.1f} {mx:.1f} {my:.1f})">{teks}</text>'
    return out


def gambar1():
    b = ""
    s = 2.2
    ox, oy = 110, 210
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    a, bb, c, d = A_C, B_C, C_C, D_C
    pts = [(0, 0), (a, 0), (a, bb - c), (a - c, bb), (0, bb)]
    b += '<polygon points="' + " ".join(f"{X(x):.1f},{Y(y):.1f}" for x, y in pts) + '" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<circle cx="{X(a / 2)}" cy="{Y(bb / 2)}" r="{d / 2 * s}" fill="#0a101f" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<line x1="{X(a / 2) - d * s}" y1="{Y(bb / 2)}" x2="{X(a / 2) + d * s}" y2="{Y(bb / 2)}" stroke="#ef4444" stroke-width=".8" stroke-dasharray="8 3 2 3"/>'
    b += f'<line x1="{X(a / 2)}" y1="{Y(bb / 2) - d * s}" x2="{X(a / 2)}" y2="{Y(bb / 2) + d * s}" stroke="#ef4444" stroke-width=".8" stroke-dasharray="8 3 2 3"/>'
    b += _dim(X(0), Y(0), X(a), Y(0), str(a), "#00e09e", 26)
    b += _dim(X(0), Y(bb), X(0), Y(0), str(bb), "#00e09e", 30)
    b += _dim(X(0), Y(bb), X(a / 2), Y(bb), f"{a // 2}", "#00e09e", -26)
    b += _dim(X(a), Y(bb - c), X(a - c), Y(bb), f"C{c}", "#f59e0b", -16, 9)
    ang = -math.pi / 4
    b += f'<line x1="{X(a / 2) + d / 2 * s * math.cos(ang):.1f}" y1="{Y(bb / 2) + d / 2 * s * math.sin(ang):.1f}" x2="{X(a / 2) + (d / 2 * s + 34) * math.cos(ang):.1f}" y2="{Y(bb / 2) + (d / 2 * s + 34) * math.sin(ang):.1f}" stroke="#a855f7" stroke-width="1"/>'
    b += t(X(a / 2) + (d / 2 * s + 40) * math.cos(ang), Y(bb / 2) + (d / 2 * s + 40) * math.sin(ang) + 4, f"⌀{d} tembus", 10.5, "#a855f7", "start")
    rr = c * s * 0.9
    b += f'<path d="M {X(a) - rr:.1f} {Y(bb - c):.1f} A {rr} {rr} 0 0 1 {X(a) - rr * 0.707:.1f} {Y(bb - c) - rr * 0.707:.1f}" fill="none" stroke="#ec4899" stroke-width="1.2"/>'
    b += t(X(a) - rr * 1.9, Y(bb - c) - rr * 0.9, "45°", 10, "#ec4899")
    b += t(490, 60, "Satu gambar kerja memuat:", 11.5, TX, "start", "600")
    for i, (kk, v) in enumerate([("hijau", "dimensi linear (ukuran & posisi)"), ("kuning", "dimensi aligned pada sisi miring"), ("ungu", "diameter ⌀ dengan leader"), ("merah muda", "dimensi angular 45°"), ("merah", "garis sumbu lubang (layer Sumbu)")]):
        b += t(490, 84 + i * 20, f"• {kk}: {v}", 10.5, AX, "start")
    b += t(340, 244, f"Pelat {a} × {bb}, chamfer C{c}, lubang ⌀{d}: luas bersih {ind(LUAS_CHAMFER, 2)} mm² — angka yang diperiksa server pada Tugas 5", 11, AX)
    return svg(680, 256, b, "Gambar 1 — Gambar kerja 2D beranotasi lengkap")


def gambar2():
    b = ""
    s = 1.55
    for k, (judul, mode, warna) in enumerate([("Dimensi berantai (chain)", "chain", "#f59e0b"), ("Dimensi baseline (dari satu acuan)", "base", "#00e09e")]):
        ox, oy = 40, 96 + k * 120
        X = lambda x, ox=ox: ox + x * s
        Y = lambda y, oy=oy: oy - y * s
        b += t(ox, oy - 62, judul, 11.5, warna, "start", "600")
        b += f'<rect x="{X(0)}" y="{Y(20)}" width="{N_CH * 30 * s}" height="{20 * s}" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1.6"/>'
        for i in range(1, N_CH):
            b += f'<circle cx="{X(i * 30)}" cy="{Y(10)}" r="{4 * s}" fill="#0a101f" stroke="#22d3ee" stroke-width="1.4"/>'
        if mode == "chain":
            for i in range(N_CH):
                b += _dim(X(i * 30), Y(20), X((i + 1) * 30), Y(20), f"30±{T_CH}", warna, 14, 9)
            b += t(X(N_CH * 30) + 14, Y(10) + 4, f"keseluruhan ±{N_CH * T_CH:.1f}", 10.5, "#ef4444", "start")
        else:
            for i in range(1, N_CH + 1):
                b += _dim(X(0), Y(20), X(i * 30), Y(20), f"{i * 30}±{T_CH}", warna, 8 + i * 9, 8.5)
            b += t(X(N_CH * 30) + 14, Y(10) + 4, f"tiap fitur ±{T_CH}", 10.5, "#00e09e", "start")
    b += t(340, 258, "Baseline dipakai bila posisi tiap fitur penting (lubang baut); chain bila jarak antar-fitur yang penting (alur bertingkat)", 11, AX)
    return svg(680, 270, b, "Gambar 2 — Dimensi berantai menumpuk toleransi, baseline tidak")


def gambar3():
    b = ""
    # sektor
    cx, cy, R = 150, 150, 92
    th = math.radians(TH_S)
    b += f'<path d="M {cx} {cy} L {cx + R} {cy} A {R} {R} 0 0 0 {cx + R * math.cos(th):.1f} {cy - R * math.sin(th):.1f} Z" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    am = th / 2
    b += f'<line x1="{cx}" y1="{cy}" x2="{cx + R * math.cos(am):.1f}" y2="{cy - R * math.sin(am):.1f}" stroke="#f97316" stroke-width="1"/>'
    b += t(cx + R * 0.55 * math.cos(am) + 6, cy - R * 0.55 * math.sin(am) - 4, f"R{R_S}", 10.5, "#f97316", "start")
    ra = 30
    b += f'<path d="M {cx + ra} {cy} A {ra} {ra} 0 0 0 {cx + ra * math.cos(th):.1f} {cy - ra * math.sin(th):.1f}" fill="none" stroke="#ec4899" stroke-width="1.2"/>'
    b += t(cx + ra * 1.2, cy - ra * 0.5, f"{TH_S}°", 10.5, "#ec4899", "start")
    b += t(cx + 10, cy + 40, f"sektor: ½·R²·θ = {ind(LUAS_SEKTOR, 2)} mm²", 10.5, TX, "start")
    # slot
    ox, oy, s = 400, 128, 2.6
    r = D_SL / 2
    b += f'<path d="M {ox} {oy - r * s} H {ox + L_SL * s} A {r * s} {r * s} 0 0 1 {ox + L_SL * s} {oy + r * s} H {ox} A {r * s} {r * s} 0 0 1 {ox} {oy - r * s} Z" fill="rgba(0,224,158,.12)" stroke="#00e09e" stroke-width="2"/>'
    b += _dim(ox, oy, ox + L_SL * s, oy, str(L_SL), "#f59e0b", -(r * s + 22), 9.5)
    b += _dim(ox - r * s, oy + r * s, ox + (L_SL + r) * s, oy + r * s, str(L_SL + D_SL), "#f59e0b", 20, 9.5)
    b += f'<line x1="{ox + L_SL * s}" y1="{oy}" x2="{ox + L_SL * s + r * s * math.cos(-0.7):.1f}" y2="{oy + r * s * math.sin(-0.7):.1f}" stroke="#f97316" stroke-width="1"/>'
    b += t(ox + L_SL * s + r * s * math.cos(-0.7) + 4, oy + r * s * math.sin(-0.7) - 4, f"R{r:g}", 10.5, "#f97316", "start")
    b += t(ox + L_SL * s / 2, oy + r * s + 44, f"slot: 2·r·L + π·r² = {ind(LUAS_SLOT, 2)} mm²", 10.5, TX)
    b += t(340, 258, "Busur tidak penuh didimensi dengan R; lingkaran penuh dengan ⌀; sudut dengan °; slot dengan jarak pusat dan panjang total", 11, AX)
    return svg(680, 270, b, "Gambar 3 — Radius, sudut, dan slot pada sektor dan alur obround")


def gambar4():
    b = ""
    items = [("Draft Text", "teks bebas beberapa baris di satu titik; tanpa panah", "#22d3ee", 40),
             ("Draft Label", "teks + garis penunjuk (leader) berpanah ke titik/objek target; jenis Custom, Name, Length, Area, Position…", "#00e09e", 118),
             ("Draft ShapeString", "teks sebagai geometri (wire) dari font TrueType: bisa dipotong, diekstrusi, atau diukir", "#a855f7", 196)]
    for nama, ket, c, y in items:
        b += f'<rect x="24" y="{y - 22}" width="150" height="44" rx="8" fill="rgba(255,255,255,.03)" stroke="{c}" stroke-width="1.4"/>'
        b += t(99, y + 4, nama, 11.5, c, "middle", "600")
        b += t(190, y - 2, ket[:62], 10, TX, "start")
        b += t(190, y + 14, ket[62:], 10, TX, "start")
    # contoh label
    b += f'<rect x="470" y="150" width="120" height="50" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1.6"/>'
    b += f'<line x1="590" y1="150" x2="575" y2="165" stroke="#22d3ee" stroke-width="1.6"/>'
    b += f'<polyline points="583,158 620,110 660,110" fill="none" stroke="#00e09e" stroke-width="1"/>'
    b += f'<polygon points="583,158 592,152 590,161" fill="#00e09e"/>'
    b += t(660, 104, "C15 × 45°", 11, "#00e09e", "end", "600")
    b += t(600, 224, "Label dengan leader ke sisi chamfer", 10, AX, "middle")
    b += t(340, 254, "Teks menjelaskan yang tidak tergambar: jumlah lubang, pengerjaan, bahan, toleransi umum, dan catatan produksi", 11, AX)
    return svg(680, 266, b, "Gambar 4 — Tiga alat teks dan anotasi Draft")


def gambar5():
    b = ""
    b += f'<rect x="60" y="20" width="330" height="230" fill="#0e1628" stroke="#e2e8f0" stroke-width="1.6"/>'
    b += f'<rect x="70" y="30" width="310" height="210" fill="none" stroke="#475569" stroke-width="1"/>'
    # view
    b += f'<rect x="120" y="60" width="150" height="90" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1.6"/>'
    b += f'<circle cx="195" cy="105" r="16" fill="#0e1628" stroke="#22d3ee" stroke-width="1.6"/>'
    b += _dim(120, 150, 270, 150, "120", "#00e09e", 18, 9)
    b += _dim(120, 60, 120, 150, "70", "#00e09e", -18, 9)
    b += t(195, 170, "View (skala 1:2)", 9.5, AX)
    # title block
    b += f'<rect x="210" y="195" width="170" height="45" fill="rgba(255,255,255,.03)" stroke="#94a3b8" stroke-width="1"/>'
    b += f'<line x1="210" y1="210" x2="380" y2="210" stroke="#94a3b8" stroke-width=".8"/><line x1="210" y1="225" x2="380" y2="225" stroke="#94a3b8" stroke-width=".8"/>'
    b += f'<line x1="295" y1="195" x2="295" y2="240" stroke="#94a3b8" stroke-width=".8"/>'
    for x, y, s_ in [(214, 206, "PELAT DUDUKAN"), (299, 206, "Skala 1:2"), (214, 221, "Bahan: S235 t=8"), (299, 221, "Tol. umum ±0,2"), (214, 236, "Digambar: NIM"), (299, 236, "A4 · No. 04-01")]:
        b += t(x, y, s_, 7.5, TX, "start")
    b += t(225, 250 + 16, "Lembar A4 TechDraw: template + View + dimensi + kepala gambar", 10.5, AX)
    tahap = [("1", "TechDraw → Page Default (A4)", "#22d3ee"), ("2", "Pilih objek 2D/3D → Insert View", "#00e09e"), ("3", "Atur Scale, Rotation, posisi view", "#f59e0b"),
             ("4", "Dimensi TechDraw / teks kepala gambar", "#a855f7"), ("5", "Export → PDF / DXF / SVG", "#ec4899")]
    for i, (no, teks, c) in enumerate(tahap):
        y = 40 + i * 40
        b += f'<circle cx="430" cy="{y}" r="11" fill="rgba(255,255,255,.03)" stroke="{c}" stroke-width="1.4"/>'
        b += t(430, y + 4, no, 10.5, c, "middle", "700")
        b += t(450, y + 4, teks, 10.5, TX, "start")
    return svg(680, 280, b, "Gambar 5 — Dari model ke lembar gambar TechDraw")


def gambar6():
    b = ""
    s = 2.4
    ox, oy = 70, 200
    X = lambda x: ox + x * s
    Y = lambda y: oy - y * s
    xs = [0]
    for l in L_P:
        xs.append(xs[-1] + l)
    pts = [(0, 0), (0, H_P[0]), (xs[1], H_P[0]), (xs[1], H_P[1]), (xs[2], H_P[1]), (xs[2], H_P[2]), (xs[3], H_P[2]), (xs[3], 0)]
    b += '<polygon points="' + " ".join(f"{X(x):.1f},{Y(y):.1f}" for x, y in pts) + '" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>'
    b += f'<line x1="{X(-6)}" y1="{Y(0)}" x2="{X(xs[3] + 6)}" y2="{Y(0)}" stroke="#ef4444" stroke-width=".9" stroke-dasharray="10 3 2 3"/>'
    for i, l in enumerate(L_P):
        b += _dim(X(xs[i]), Y(0), X(xs[i + 1]), Y(0), str(l), "#f59e0b", 26, 9.5)
    b += _dim(X(0), Y(0), X(xs[3]), Y(0), str(xs[3]), "#f59e0b", 48, 9.5)
    for i, h in enumerate(H_P):
        xm = (xs[i] + xs[i + 1]) / 2
        b += _dim(X(xs[i + 1]), Y(h), X(xs[i + 1]), Y(0), str(h), "#00e09e", -(14 + (2 - i) * 0), 9)
    b += t(X(xs[3]) + 20, Y(H_P[1]) + 4, f"luas = Σ lᵢ·hᵢ = {ind(LUAS_PROFIL, 0)} mm²", 10.5, TX, "start")
    b += t(340, 244, "Setengah profil poros bertingkat: panjang tingkat berantai (kuning), tinggi tiap tingkat vertikal (hijau), sumbu sebagai garis rantai merah", 11, AX)
    return svg(680, 256, b, "Gambar 6 — Pendimensian setengah profil poros bertingkat")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-fungsi">Fungsi Anotasi</a>
  <a href="#m-jenis">Jenis Dimensi</a>
  <a href="#m-aturan">Aturan ISO</a>
  <a href="#m-radius">Radius &amp; Sudut</a>
  <a href="#m-teks">Teks &amp; Label</a>
  <a href="#m-format">Format &amp; Layer</a>
  <a href="#m-techdraw">TechDraw</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="40" width="64" height="40" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.4"/>
      <line x1="18" y1="96" x2="82" y2="96" stroke="rgba(0,224,158,.6)" stroke-width="1"/>
      <polygon points="18,96 26,93 26,99" fill="rgba(0,224,158,.6)"/><polygon points="82,96 74,93 74,99" fill="rgba(0,224,158,.6)"/>
      <text x="50" y="92" text-anchor="middle" fill="rgba(0,224,158,.7)" font-family="JetBrains Mono" font-size="8">120</text>
      <circle cx="50" cy="150" r="18" fill="none" stroke="rgba(0,229,255,.45)" stroke-width="1.3"/>
      <line x1="63" y1="137" x2="84" y2="116" stroke="rgba(124,77,255,.6)" stroke-width="1"/>
      <text x="86" y="114" fill="rgba(124,77,255,.7)" font-family="JetBrains Mono" font-size="8">⌀36</text>
      <text x="50" y="205" text-anchor="middle" fill="rgba(255,179,0,.6)" font-family="JetBrains Mono" font-size="8">R · ⌀ · °</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="30" width="72" height="100" fill="none" stroke="rgba(226,232,240,.35)" stroke-width="1"/>
      <rect x="24" y="44" width="40" height="28" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.2"/>
      <rect x="40" y="104" width="46" height="26" fill="none" stroke="rgba(148,163,184,.45)" stroke-width=".8"/>
      <line x1="40" y1="112" x2="86" y2="112" stroke="rgba(148,163,184,.45)" stroke-width=".8"/>
      <line x1="40" y1="120" x2="86" y2="120" stroke="rgba(148,163,184,.45)" stroke-width=".8"/>
      <text x="50" y="160" text-anchor="middle" fill="rgba(0,224,158,.6)" font-family="JetBrains Mono" font-size="8">TechDraw A4</text>
      <line x1="14" y1="190" x2="86" y2="190" stroke="rgba(124,77,255,.55)" stroke-width="1"/>
      <text x="50" y="205" text-anchor="middle" fill="rgba(124,77,255,.6)" font-family="JetBrains Mono" font-size="8">Σ lᵢ·hᵢ</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="04">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Draft → Dimension</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">A = ½·r²·θ</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">R · ⌀ · °</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">chain vs baseline</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">AnnotationStyle</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">TechDraw A4</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">A = 2rL + πr²</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">Label · Text · ShapeString</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 4 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dimensi,</span><br>
      <em>Anotasi, &amp;</em><br>
      <span class="hl-amber">Format Gambar</span>
    </h1>
    <p class="hero-sub">Pertemuan ini mengubah model 2D menjadi gambar kerja yang bisa dibaca orang lain: jenis Draft Dimension (linear, aligned, radius, diameter, angular), aturan pendimensian ISO dan pilihan berantai atau baseline, teks dan label berpanah, gaya anotasi yang seragam, layer untuk anotasi, dan lembar gambar TechDraw siap cetak. Tugasnya lima model 2D beranotasi yang diperiksa lewat angka geometrinya.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Jenis dimensi, aturan, dan format</small></div><div class="road-arrow" aria-hidden="true">→</div>
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

    # 01 — Fungsi anotasi
    isi = figure(1, "Gambar kerja 2D beranotasi lengkap", "Pelat dengan chamfer dan lubang: dimensi linear menyatakan ukuran dan posisi, aligned untuk sisi miring, diameter dan angular untuk lubang dan chamfer, garis sumbu pada layer tersendiri.", gambar1())
    isi += cards([
        ("🗣️", "Gambar adalah bahasa", "Model CAD berisi geometri lengkap, tetapi pembuat benda tidak membaca model; ia membaca gambar. Dimensi, simbol, dan catatan mengubah geometri menjadi instruksi yang tidak berganda arti.", ""),
        ("📐", "Ukuran dan posisi", "Dua pertanyaan yang harus dijawab setiap gambar: seberapa besar tiap fitur (ukuran) dan di mana letaknya (posisi). Lubang butuh ⌀ dan dua koordinat pusat; chamfer butuh kaki dan sudut.", "ukuran + posisi"),
        ("🎯", "Fungsi menentukan toleransi", "Tidak semua ukuran sama penting. Jarak antar-lubang baut menentukan apakah benda bisa dipasang; toleransinya lebih ketat daripada tinggi keseluruhan. Cara mendimensi mengikuti fungsi, bukan kemudahan menggambar.", "±0,1 vs ±0,5"),
        ("🧭", "Parametrik sampai ke anotasi", "Draft Dimension terikat ke geometri: mengubah model memperbarui angka. Tetapi gaya, posisi, dan pilihan apa yang didimensi tetap keputusan penggambar; itulah isi modul ini.", ""),
    ])
    isi += tabel(["Pertanyaan pembuat benda", "Jawaban pada gambar", "Alat Draft"],
                 [["Seberapa panjang, lebar, tebal?", "Dimensi linear keseluruhan", "Dimension (horizontal/vertikal)"],
                  ["Di mana pusat lubang?", "Dimensi posisi dari acuan (baseline)", "Dimension + layer Sumbu"],
                  ["Seberapa besar lubang?", "⌀ dengan jumlah (3 × ⌀8)", "Dimension diameter + Text"],
                  ["Seberapa besar busur/fillet?", "R pada busur", "Dimension radius"],
                  ["Berapa sudut kemiringan?", "Dimensi angular (°)", "Dimension angular"],
                  ["Apa yang tidak tergambar?", "Catatan, bahan, toleransi umum", "Text, Label, kepala gambar TechDraw"]])
    m += bagian(1, "m-fungsi", "Anotasi:<br>Mengubah Geometri Menjadi Instruksi", "Gambar tanpa dimensi hanya ilustrasi. Bagian ini menempatkan dimensi, simbol, dan teks sebagai bahasa antara perancang dan pembuat benda, serta memetakan alat Draft untuk setiap pertanyaan yang harus dijawab gambar.", isi, "FUNGSI ANOTASI")

    # 02 — Jenis dimensi
    isi = figure(6, "Pendimensian setengah profil poros bertingkat", f"Tiga panjang tingkat didimensi berantai, tiga tinggi secara vertikal; luas profil Σ lᵢ·hᵢ = {ind(LUAS_PROFIL, 0)} mm² adalah angka pemeriksa pada Tugas 1.", gambar6())
    isi += tabel(["Jenis Draft Dimension", "Cara membuat", "Simbol / satuan", "Contoh pemakaian"],
                 [["Linear horizontal / vertikal", "Klik dua titik, geser garis dimensi mendatar atau tegak", "mm", "Panjang, lebar, posisi lubang"],
                  ["Aligned", "Klik dua titik, geser sejajar segmen", "mm", "Sisi miring, kaki chamfer"],
                  ["Edge", "Pilih satu edge lalu Dimension", "mm", "Panjang sisi tanpa mengklik titik"],
                  ["Radius", "Pilih busur, Dimension, geser keluar", "R", "Fillet, ujung slot, sektor"],
                  ["Diameter", "Pilih lingkaran, Dimension; properti Diameter = true", "⌀", "Lubang, poros"],
                  ["Angular", "Pilih dua garis, tempatkan busur", "°", "Chamfer, kemiringan, sektor"]])
    isi += formula(1, "Luas Profil Bertingkat (Pemeriksa Dimensi Berantai)", r"A = \sum_{i=1}^{n} l_i\,h_i",
                   r"\(l_i\) = panjang tingkat ke-i (dimensi berantai) &nbsp;·&nbsp; \(h_i\) = tinggi tingkat ke-i (dimensi vertikal). Contoh " + ", ".join(f"{l}×{h}" for l, h in zip(L_P, H_P)) + f": \\(A = {ind(LUAS_PROFIL, 0)}\\) mm².",
                   "Bila dimensi berantai dan tinggi pada gambar Anda benar, luas face yang dibaca FreeCAD harus sama dengan jumlah ini. Selisih menunjukkan titik profil yang salah, bukan dimensinya, karena Draft Dimension hanya membaca geometri.",
                   [("A", "Luas profil (mm²)"), ("l_i", "Panjang tingkat ke-i (mm)"), ("h_i", "Tinggi tingkat ke-i (mm)")])
    isi += anim_panel(1, "cyan", "Jenis Draft Dimension pada satu pelat", "cvJenis",
                      [("sl_jn_a", "v_jn_a", "Panjang pelat a (mm)", 80, 160, 1, 120, "120"),
                       ("sl_jn_b", "v_jn_b", "Lebar pelat b (mm)", 40, 100, 1, 70, "70"),
                       ("sl_jn_d", "v_jn_d", "Diameter lubang d (mm)", 8, 30, 1, 20, "20"),
                       ("sl_jn_c", "v_jn_c", "Kaki chamfer c (mm)", 5, 25, 1, 15, "15")],
                      "btnJenis", "toggleJenis", "jenisInfo",
                      "<strong>Cara membaca:</strong> lima jenis dimensi disorot bergantian (PAUSE menampilkan semuanya): linear untuk ukuran pelat, aligned untuk sisi chamfer, diameter dengan leader untuk lubang, angular untuk 45°, dan radius sebagai pembanding. Ubah geometri dan lihat semua angka mengikuti.")
    m += bagian(2, "m-jenis", "Jenis Draft Dimension:<br>Linear, Aligned, Radius, Diameter, Angular", "Draft menyediakan satu alat Dimension yang berubah perilaku sesuai apa yang dipilih. Bagian ini merinci keenam jenisnya, cara membuatnya, simbolnya, dan rumus untuk memeriksa profil bertingkat Tugas 1.", isi, "JENIS DIMENSI")

    # 03 — Aturan ISO
    isi = figure(2, "Dimensi berantai menumpuk toleransi, baseline tidak", f"Empat ruas 30 ±{T_CH}: pada dimensi berantai lubang terakhir boleh meleset ±{N_CH * T_CH:.1f}, pada baseline tiap lubang tetap ±{T_CH} dari acuan.", gambar2())
    isi += formula(2, "Akumulasi Toleransi pada Dimensi Berantai", r"t_{total} = \sum_{i=1}^{n} t_i \quad(\text{chain}), \qquad t_{fitur} = t_i \quad(\text{baseline})",
                   r"\(t_i\) = toleransi ruas ke-i &nbsp;·&nbsp; \(n\) = jumlah ruas. Contoh " + str(N_CH) + r" ruas ±" + str(T_CH) + r": chain \(\pm" + f"{N_CH * T_CH:.1f}" + r"\), baseline \(\pm" + str(T_CH) + r"\).",
                   "Setiap dimensi membawa toleransinya sendiri; pada rantai, posisi fitur terakhir adalah jumlah semua ruas sehingga penyimpangannya pun berjumlah. Baseline mengukur tiap fitur langsung dari acuan, sehingga penyimpangan tidak diwariskan. Pilih berdasarkan fungsi: posisi lubang baut → baseline; panjang tiap tingkat poros → chain.",
                   [("t_{total}", "Toleransi ukuran keseluruhan (mm)"), ("t_i", "Toleransi ruas ke-i (mm)"), ("n", "Jumlah ruas berantai")])
    isi += tabel(["Aturan (ISO 129-1)", "Penerapan di Draft", "Pelanggaran yang sering"],
                 [["Garis perpanjangan mulai dengan celah kecil dari kontur dan melewati garis dimensi sedikit", "Properti ExtLines dan DimOvershoot (AnnotationStyle)", "Garis perpanjangan menempel kontur atau berhenti tepat di panah"],
                  ["Garis dimensi berjarak dari kontur (≈ 8–10 mm kertas) dan antar-garis dimensi merata", "Seret garis dimensi saat menempatkan; jaga jarak sama untuk baseline", "Dimensi bertumpuk rapat, angka saling tindih"],
                  ["Angka di atas garis dimensi, terbaca dari bawah atau kanan", "Bawaan Draft; TextSpacing mengatur jarak", "Angka terbalik pada dimensi vertikal"],
                  ["Dimensi pada view yang paling jelas menampilkan bentuknya, tidak diulang", "Satu dimensi per ukuran", "Ukuran yang sama ditulis di dua tempat"],
                  ["Lingkaran penuh ⌀, busur R, sudut °", "Diameter = true pada lingkaran; radius untuk busur", "Lubang didimensi R"],
                  ["Ukuran fungsional diberi toleransi eksplisit; sisanya toleransi umum", "Override teks “40 ±0,1” atau catatan umum", "Semua ukuran bertoleransi ketat, biaya membengkak"],
                  ["Garis dimensi tidak boleh menjadi kontur dan tidak memotong dimensi lain", "Tempatkan dimensi di luar kontur", "Garis dimensi melintasi lubang"]])
    isi += anim_panel(2, "amber", "Chain vs baseline: akumulasi toleransi", "cvChain",
                      [("sl_ch_n", "v_ch_n", "Jumlah ruas n", 2, 6, 1, 4, "4"),
                       ("sl_ch_t", "v_ch_t", "Toleransi tiap ruas ±t (mm)", 0.05, 0.5, 0.05, 0.2, "±0,20"),
                       ("sl_ch_l", "v_ch_l", "Panjang ruas (mm)", 20, 50, 1, 30, "30")],
                      "btnChain", "toggleChain", "chainInfo",
                      "<strong>Cara membaca:</strong> dua pelat identik didimensi berantai (kuning) dan baseline (hijau). Angka merah menunjukkan posisi lubang terakhir yang bergoyang dalam batas toleransinya: pada chain goyangannya n kali lebih besar. Tambah n atau t dan lihat selisihnya melebar.")
    m += bagian(3, "m-aturan", "Aturan Pendimensian:<br>ISO 129 dan Pilihan Berantai atau Baseline", "Dimensi yang benar mengikuti kaidah agar tidak berganda arti dan tidak menumpuk toleransi. Bagian ini merangkum aturan ISO 129 yang dapat diterapkan di Draft dan menjelaskan kapan memakai chain, baseline, atau ordinat.", isi, "ATURAN PENDIMENSIAN")

    # 04 — Radius, diameter, sudut
    isi = figure(3, "Radius, sudut, dan slot pada sektor dan alur obround", f"Sektor R{R_S} sudut {TH_S}° dan slot L = {L_SL}, ⌀{D_SL}: keduanya didimensi dengan R, ⌀/°, dan jarak pusat, dan keduanya punya rumus luas untuk pemeriksaan.", gambar3())
    isi += formula(3, "Luas Sektor Lingkaran", r"A_{sektor} = \tfrac{1}{2}\,r^{2}\theta, \qquad \theta \text{ dalam radian}",
                   r"\(r\) = radius busur (dimensi R) &nbsp;·&nbsp; \(\theta\) = sudut pusat (dimensi angular). Contoh \(r = " + str(R_S) + r"\), \(\theta = " + str(TH_S) + r"^\circ\): \(A = " + ind(LUAS_SEKTOR, 2) + r"\) mm².",
                   "Sektor adalah pecahan lingkaran sebesar θ/2π; luasnya πr² dikalikan pecahan itu. Dimensi radius membaca r, dimensi angular membaca θ dalam derajat, sehingga keduanya menjadi pemeriksa Tugas 2.",
                   [("A_{sektor}", "Luas sektor (mm²)"), ("r", "Radius busur (mm)"), (r"\theta", "Sudut pusat (rad)")])
    isi += formula(4, "Luas Slot (Alur Obround)", r"A_{slot} = 2\,r\,L + \pi r^{2}",
                   r"\(r\) = radius ujung slot (setengah lebar) &nbsp;·&nbsp; \(L\) = jarak antar-pusat kedua ujung; panjang total \(L + 2r\). Contoh \(L = " + str(L_SL) + r"\), \(⌀" + str(D_SL) + r"\): \(A = " + ind(LUAS_SLOT, 2) + r"\) mm².",
                   "Slot adalah persegi panjang 2r × L ditambah dua setengah lingkaran. Pada gambar, slot didimensi dengan jarak pusat L dan lebar ⌀ (atau R pada satu ujung) plus panjang total sebagai dimensi acuan; Tugas 4 membangunnya dengan Fuse.",
                   [("A_{slot}", "Luas slot (mm²)"), ("r", "Radius ujung (mm)"), ("L", "Jarak antar-pusat (mm)")])
    isi += tabel(["Fitur", "Dimensi yang benar", "Catatan Draft"],
                 [["Lingkaran penuh / lubang", "⌀ (diameter), jumlah bila berulang: 4 × ⌀8", "Properti Diameter = true; teks “4 ×” lewat Override atau Text"],
                  ["Busur / fillet / ujung slot", "R (radius)", "Pilih busur; Draft menempatkan panah dari pusat ke busur"],
                  ["Sudut", "° dengan busur dimensi berpusat di perpotongan", "Pilih dua garis; angka di luar busur"],
                  ["Chamfer 45°", "C × 45° atau dua kaki + sudut", "Label “C15 × 45°” dengan leader"],
                  ["Slot", "Jarak pusat + ⌀ (atau R) + panjang total (acuan)", "Panjang total ditandai sebagai dimensi acuan (tanda kurung)"]])
    isi += anim_panel(3, "green", "Radius, diameter, sudut: sektor dan slot", "cvSektor",
                      [("sl_sk_r", "v_sk_r", "Radius sektor r (mm)", 20, 60, 1, 40, "40"),
                       ("sl_sk_th", "v_sk_th", "Sudut sektor θ (°)", 10, 150, 1, 60, "60°"),
                       ("sl_sk_L", "v_sk_L", "Jarak pusat slot L (mm)", 20, 100, 1, 60, "60"),
                       ("sl_sk_d", "v_sk_d", "Lebar slot d (mm)", 6, 30, 1, 16, "16")],
                      "btnSektor", "toggleSektor", "sektorInfo",
                      "<strong>Cara membaca:</strong> sektor (kiri) membuka-menutup mengikuti θ; luasnya sebanding θ (Persamaan 3). Slot (kanan) didimensi jarak pusat, panjang total, dan R ujung; luasnya mengikuti Persamaan (4). Kedua gambar memakai simbol yang benar: R untuk busur, ° untuk sudut.")
    m += bagian(4, "m-radius", "Radius, Diameter, dan Sudut:<br>Simbol dan Rumus Pemeriksanya", "Fitur melingkar dan miring punya simbol sendiri: R, ⌀, dan °. Bagian ini menetapkan mana yang dipakai untuk apa, dan memberi rumus luas sektor dan slot yang dipakai Tugas 2 dan 4.", isi, "RADIUS DIAMETER SUDUT")

    # 05 — Teks dan anotasi
    isi = figure(4, "Tiga alat teks dan anotasi Draft", "Text untuk catatan bebas, Label untuk teks berpanah ke fitur, ShapeString untuk teks yang menjadi geometri.", gambar4())
    isi += tabel(["Alat", "Masukan", "Properti penting", "Kegunaan khas"],
                 [["<strong>Draft Text</strong>", "Titik, lalu baris teks (Enter dua kali untuk selesai)", "Text (daftar baris), FontSize, Justification", "Catatan umum: bahan, tebal, toleransi umum"],
                  ["<strong>Draft Label</strong>", "Titik target, titik teks; jenis Custom/Name/Length/Area/Position", "CustomText, LabelType, StraightDirection, Distance, Target", "Callout: “C15 × 45°”, “3 × ⌀8 tembus”, luas otomatis"],
                  ["<strong>Draft ShapeString</strong>", "Teks, font TTF, ukuran", "String, FontFile, Size, Tracking", "Teks timbul/ukir, nomor part pada benda"],
                  ["<strong>Dimension Override</strong>", "Properti Override pada dimensi", "Override, ShowUnit, UnitOverride", "Toleransi “40 ±0,1”, dimensi acuan “(76)”"]])
    isi += cards([
        ("✍️", "Apa yang ditulis", "Jumlah fitur berulang (3 × ⌀8), pengerjaan (tembus, dibor lalu diream), bahan dan tebal pelat, toleransi umum (ISO 2768-m), dan sisi yang tidak tergambar (tebal 8).", "3 × ⌀8 tembus"),
        ("🎯", "Label yang mengikuti", "Label jenis Length/Area/Position membaca nilai dari objek target dan diperbarui otomatis; jenis Custom untuk teks bebas dengan panah.", "LabelType"),
        ("🔤", "Ukuran huruf", "ISO 3098: tinggi huruf 3,5 mm pada A4/A3 untuk dimensi dan catatan, 5–7 mm untuk judul. Atur lewat AnnotationStyle agar seragam.", "3,5 mm"),
    ])
    m += bagian(5, "m-teks", "Teks dan Anotasi:<br>Text, Label, dan ShapeString", "Yang tidak bisa dinyatakan dimensi ditulis. Bagian ini membandingkan tiga alat teks Draft, properti Override dimensi, dan apa saja yang lazim dituliskan pada gambar kerja.", isi, "TEKS DAN ANOTASI")

    # 06 — Format dan layer
    isi = tabel(["Properti gaya", "Arti", "Nilai lazim A4/A3", "Tempat mengatur"],
                [["FontName / FontSize", "Jenis dan tinggi huruf (mm kertas)", "Sans, 3,5", "AnnotationStyle; ViewObject dimensi"],
                 ["ArrowType / ArrowSize", "Bentuk (Dot, Circle, Arrow, Tick) dan ukuran panah", "Arrow, 2–3", "AnnotationStyle"],
                 ["Decimals", "Angka di belakang koma", "2 (0 untuk sudut bulat)", "AnnotationStyle; Preferences → Draft"],
                 ["ShowUnit / UnitOverride", "Menampilkan satuan atau memaksa satuan", "ShowUnit false (mm tersirat)", "AnnotationStyle"],
                 ["ExtLines / DimOvershoot / ExtOvershoot", "Panjang garis perpanjangan dan lewatannya", "1,2 mm", "AnnotationStyle"],
                 ["TextSpacing", "Jarak teks dari garis dimensi", "1 mm", "AnnotationStyle"],
                 ["LineColor / LineWidth", "Warna dan tebal garis dimensi", "Tipis (0,25)", "Layer Dimensi"]])
    isi += cards([
        ("🎨", "Draft AnnotationStyle", "Draft → Annotation styles… membuat gaya bernama (mis. ISO-A4) yang menyimpan semua properti di atas. Setiap dimensi/teks punya properti Annotation Style; mengubah gaya memperbarui semuanya.", "ISO-A4"),
        ("⚙️", "Preferences sebagai bawaan", "Edit → Preferences → Draft → Visual settings menetapkan nilai bawaan untuk dimensi baru; AnnotationStyle menimpanya per objek.", ""),
        ("🗂️", "Layer Dimensi", "Semua dimensi, teks, dan label pada layer Dimensi: garis tipis, warna seragam, dan bisa disembunyikan saat ekspor DXF untuk mesin potong (Modul 2).", "Spasi = sembunyikan"),
        ("🧊", "Ukuran di kertas, bukan di model", "FontSize 3,5 berarti 3,5 mm pada kertas TechDraw berskala 1:1. Bila View berskala 1:2, ukuran dimensi TechDraw diatur di halaman, bukan di Draft.", ""),
    ])
    isi += anim_panel(4, "violet", "Format dimensi: FontSize, ArrowSize, Decimals, ExtLines", "cvFormat",
                      [("sl_fm_font", "v_fm_font", "FontSize (mm)", 2, 7, 0.5, 3.5, "3,5"),
                       ("sl_fm_panah", "v_fm_panah", "ArrowSize (mm)", 1, 5, 0.5, 2, "2,0"),
                       ("sl_fm_dec", "v_fm_dec", "Decimals", 0, 4, 1, 2, "2"),
                       ("sl_fm_ext", "v_fm_ext", "ExtLines / overshoot (×)", 1, 2, 0.1, 1.2, "1,2")],
                      "btnFormat", "toggleFormat", "formatInfo",
                      "<strong>Cara membaca:</strong> nilai geometri 120,4567 mm tidak berubah; yang berubah hanya cara menampilkannya. Decimals 2 memberi “120.46”, Decimals 0 memberi “120”. Simpan kombinasi yang Anda pilih sebagai AnnotationStyle agar seluruh gambar seragam.")
    m += bagian(6, "m-format", "Format Dimensi dan Layer:<br>Seragam Lewat AnnotationStyle", "Gambar yang rapi memakai satu gaya untuk semua anotasi. Bagian ini merinci properti gaya dimensi, cara menyimpannya sebagai AnnotationStyle, dan peran layer Dimensi.", isi, "FORMAT DAN LAYER")

    # 07 — TechDraw
    isi = figure(5, "Dari model ke lembar gambar TechDraw", "Page memuat template A4 dengan kepala gambar; View memproyeksikan objek Draft/Part; dimensi dan teks ditambahkan pada lembar, lalu diekspor ke PDF atau DXF.", gambar5())
    isi += tabel(["Langkah TechDraw", "Perintah", "Catatan"],
                 [["Buat lembar", "TechDraw → Page Default (A4 landscape) atau Page using template", "Template SVG punya kolom kepala gambar yang bisa diisi (klik ikon di sudut)"],
                  ["Sisipkan view", "Pilih objek 2D/3D → Insert View", "Untuk objek Draft 2D pakai Insert Draft View / Insert View dengan arah Top"],
                  ["Atur skala", "Properti Scale (mis. 0.5 = 1:2), ScaleType Custom", "Tulis skala di kepala gambar"],
                  ["Dimensi lembar", "TechDraw Length/Radius/Diameter/Angle dimension", "Terikat ke view; alternatif: bawa Draft Dimension lewat Insert Draft View"],
                  ["Anotasi", "TechDraw Annotation / Balloon / Leader", "Catatan bahan, toleransi umum, nomor bagian"],
                  ["Ekspor", "TechDraw → Export page as PDF / SVG / DXF", "PDF untuk cetak dan LMS; DXF untuk mesin potong (kontur saja)"]])
    isi += kotak("info-box", "<strong>🧭 Draft atau TechDraw untuk dimensi?</strong> Draft Dimension hidup di ruang model (mm sebenarnya) dan dipakai saat model 2D itu sendiri adalah gambarnya, seperti tugas modul ini. TechDraw Dimension hidup di lembar kertas berskala dan dipakai untuk gambar kerja formal dari model 3D (Modul 5 dst). Keduanya parametrik; pilih sesuai keluaran: berkas .FCStd beranotasi, atau PDF/DXF berkepala gambar.")
    m += bagian(7, "m-techdraw", "Lembar Gambar TechDraw:<br>Template, View, dan Ekspor", "Gambar kerja formal butuh lembar berkepala gambar. Bagian ini memperkenalkan TechDraw secukupnya untuk membuat halaman A4, menyisipkan view model 2D, memberi dimensi lembar, dan mengekspor PDF/DXF.", isi, "TECHDRAW")

    # 08 — Python console
    isi = kode("Python console — dimensi linear, radius, dan gaya tampilan", f'''import FreeCAD as App, Draft
doc = App.newDocument("Latihan4")
V = App.Vector
plat = Draft.make_rectangle({A_C}, {B_C}); plat.MakeFace = True
lub = Draft.make_circle({D_C / 2:g}, placement=App.Placement(V({A_C / 2:g}, {B_C / 2:g}, 0), App.Rotation()))
doc.recompute()
d1 = Draft.make_linear_dimension(V(0, 0, 0), V({A_C}, 0, 0), V({A_C / 2:g}, -14, 0))     # panjang, garis dimensi 14 mm di bawah
d2 = Draft.make_linear_dimension(V(0, 0, 0), V(0, {B_C}, 0), V(-14, {B_C / 2:g}, 0))     # lebar
d3 = Draft.make_radial_dimension_obj(lub, 1, "diameter", V({A_C / 2 + 22:g}, {B_C / 2 + 22:g}, 0))   # diameter lubang
doc.recompute()
for d in (d1, d2, d3):                     # properti tampilan ada di ViewObject
    d.ViewObject.FontSize = 3.5
    d.ViewObject.ArrowSize = 2
    d.ViewObject.Decimals = 2
    d.ViewObject.ShowUnit = False
print(f"d1 = {{d1.Distance:.2f}}, d2 = {{d2.Distance:.2f}}, lubang = {{lub.Shape.BoundBox.XLength:.2f}}")   # {A_C}, {B_C}, {D_C}''', "Python (FreeCAD)")
    isi += kode("Python console — label berpanah, teks, dan layer Dimensi", f'''import FreeCAD as App, Draft
doc = App.ActiveDocument
V = App.Vector
lbl = Draft.make_label(target_point=V({A_C}, {B_C - C_C}, 0), placement=App.Placement(V({A_C + 20}, {B_C + 12}, 0), App.Rotation()),
                       custom_text="C{C_C} x 45 deg", label_type="Custom", distance=-8)
teks = Draft.make_text(["Bahan: S235, tebal 8", "Toleransi umum ISO 2768-m"], placement=App.Placement(V(0, -40, 0), App.Rotation()))
dimensi = Draft.make_layer(name="Dimensi", line_color=(0.0, 0.88, 0.62), line_width=1.0)
dimensi.Group = [o for o in doc.Objects if o.TypeId in ("App::FeaturePython",) and hasattr(o, "Distance") or o in (lbl, teks)]
doc.recompute()
print("Anggota layer Dimensi:", [o.Label for o in dimensi.Group])''', "Python (FreeCAD)")
    isi += kode("Python console — memeriksa luas profil, sektor, slot, dan pelat chamfer", f'''import FreeCAD as App, Draft, Part, math
doc = App.ActiveDocument
V = App.Vector
# Setengah profil poros bertingkat {L_P} x {H_P}
xs = [0, {L_P[0]}, {L_P[0] + L_P[1]}, {sum(L_P)}]; hs = {H_P}
pts = [V(0,0,0), V(0,hs[0],0), V(xs[1],hs[0],0), V(xs[1],hs[1],0), V(xs[2],hs[1],0), V(xs[2],hs[2],0), V(xs[3],hs[2],0), V(xs[3],0,0)]
profil = Draft.make_wire(pts, closed=True, face=True); doc.recompute()
print(f"Profil = {{profil.Shape.Area:.2f}} mm^2 (rumus {{sum(l*h for l,h in zip({L_P},hs)):.2f}})")   # {ind(LUAS_PROFIL, 2)}
# Sektor R{R_S}, {TH_S} derajat: busur + dua garis radial → face
busur = Draft.make_circle({R_S}, startangle=0, endangle={TH_S})
ujung = V({R_S}*math.cos(math.radians({TH_S})), {R_S}*math.sin(math.radians({TH_S})), 0)
sektor = Part.Face(Part.Wire([busur.Shape.Edges[0], Part.makeLine(ujung, V(0,0,0)), Part.makeLine(V(0,0,0), V({R_S},0,0))]))
print(f"Sektor = {{sektor.Area:.2f}} mm^2 (rumus {{0.5*{R_S}**2*math.radians({TH_S}):.2f}})")          # {ind(LUAS_SEKTOR, 2)}
# Slot L = {L_SL}, d = {D_SL}: persegi panjang + dua lingkaran → Fuse
r = {D_SL / 2:g}
slot = Part.makePlane({L_SL}, {D_SL}, V(0, -r, 0)).fuse([Part.makeCircle(r).__class__ and Part.Face(Part.Wire(Part.makeCircle(r))), Part.Face(Part.Wire(Part.makeCircle(r, V({L_SL},0,0))))])
print(f"Slot = {{slot.Area:.2f}} mm^2 (rumus {{2*r*{L_SL}+math.pi*r*r:.2f}})")                          # {ind(LUAS_SLOT, 2)}
# Pelat chamfer {A_C} x {B_C}, C{C_C}, lubang d{D_C}
pelat = Part.Face(Part.makePolygon([V(0,0,0), V({A_C},0,0), V({A_C},{B_C - C_C},0), V({A_C - C_C},{B_C},0), V(0,{B_C},0), V(0,0,0)]))
bersih = pelat.cut(Part.Face(Part.Wire(Part.makeCircle({D_C / 2:g}, V({A_C / 2:g},{B_C / 2:g},0)))))
print(f"Pelat chamfer = {{bersih.Area:.2f}} mm^2 (rumus {{{A_C}*{B_C}-{C_C}**2/2-math.pi*{D_C}**2/4:.2f}})")   # {ind(LUAS_CHAMFER, 2)}''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (profil " + ind(LUAS_PROFIL, 0) + " mm², sektor " + ind(LUAS_SEKTOR, 2) + " mm², slot " + ind(LUAS_SLOT, 2) + " mm², pelat chamfer " + ind(LUAS_CHAMFER, 2) + " mm²). Tugas meminta anotasi dibuat lewat alat GUI (Dimension, Text, Label, AnnotationStyle, TechDraw) agar berkas Anda memuatnya; Python console dipakai untuk memeriksa angka geometrinya.")
    m += bagian(8, "m-python", "Python Console:<br>Dimensi, Label, dan Angka Pemeriksa", "Draft.make_linear_dimension, make_radial_dimension_obj, make_label, dan make_text adalah padanan skrip alat anotasi. Tiga cell berikut membuat anotasi lewat skrip dan menghitung luas-luas yang diminta tugas.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Siapkan dokumen dan layer", "Ctrl+N, Draft, Top (XY), mm. Buat layer Kontur, Sumbu, dan Dimensi. Draft → Annotation styles… buat gaya ISO-A4: FontSize 3,5; ArrowSize 2; Decimals 2; ShowUnit off."),
               ("2", "Kontur dan lubang", f"Pada layer Kontur: Draft Wire pelat {A_C} × {B_C} dengan chamfer C{C_C} di sudut kanan-atas (lihat Gambar 1), Draft Circle ⌀{D_C} di ({A_C // 2}, {B_C // 2}), Part Cut. Pada layer Sumbu: dua Draft Line sumbu lubang, gaya Dashdot."),
               ("3", "Dimensi ukuran", f"Pada layer Dimensi: linear {A_C} (bawah) dan {B_C} (kiri), posisi lubang {A_C // 2} dan {B_C // 2} sebagai baseline dari sudut kiri-bawah, diameter ⌀{D_C}, dua kaki chamfer {C_C}, angular 45°. Terapkan gaya ISO-A4 pada semuanya."),
               ("4", "Teks dan label", f"Draft Label Custom “C{C_C} × 45°” berpanah ke sisi chamfer; Draft Text dua baris: bahan dan toleransi umum. Masukkan ke layer Dimensi."),
               ("5", "Periksa angka", f"Python console: App.ActiveDocument.Cut.Shape.Area → {ind(LUAS_CHAMFER, 2)} mm². Sembunyikan layer Dimensi (Spasi) dan pastikan kontur tetap bersih."),
               ("6", "Lembar TechDraw", "TechDraw → Page Default; pilih objek Cut → Insert View; Scale 1:1; isi kepala gambar (judul, bahan, skala, nama); tambahkan TechDraw Length dimension untuk membandingkan dengan Draft Dimension."),
               ("7", "Simpan dan ekspor", "Ctrl+S → <code>Latihan4_NIM.FCStd</code>; TechDraw → Export page as PDF sebagai latihan (PDF tidak diunggah, .FCStd yang diunggah).")]
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
                 [["Dimensi menampilkan 0 atau tidak muncul", "Dua titik yang diklik sama, atau garis dimensi belum ditempatkan", "Ulangi: dua titik berbeda lalu klik ketiga untuk posisi"],
                  ["Lubang tampil R bukan ⌀", "Properti Diameter false", "Set Diameter = true pada dimensi radial"],
                  ["Angka dimensi terlalu besar/kecil", "FontSize tidak seragam", "Terapkan AnnotationStyle ISO-A4 ke semua dimensi"],
                  ["Sudut angular menampilkan 135°", "Busur dimensi ditempatkan di sisi luar", "Pindahkan titik penempatan ke dalam sudut 45°"],
                  ["Label tanpa garis penunjuk", "Titik target dan titik teks sama", "Klik target di fitur, lalu titik teks agak jauh"],
                  ["Dimensi ikut terekspor ke DXF laser", "Dimensi tidak di layer Dimensi", "Pindahkan ke layer Dimensi dan sembunyikan saat ekspor"],
                  ["View TechDraw kosong", "Objek yang dipilih bukan face/solid, atau arah view salah", "Pilih objek Cut (face), Direction (0, 0, 1)"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) geometri tugas benar (luas cocok dengan rumus); (2) dimensi jenis yang diminta ada di pohon dokumen (Dimension, Dimension001, …) pada layer Dimensi; (3) simbol benar: ⌀ untuk lubang, R untuk busur, ° untuk sudut; (4) AnnotationStyle diterapkan bila diminta; (5) Text/Label bertuliskan seperti permintaan; (6) Tugas 5 memuat halaman TechDraw dengan satu View; (7) berkas .FCStd tersimpan lewat Ctrl+S, nama tanpa spasi.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Gambar Kerja Pelat Berpinggul", "Tujuh langkah berikut menyelesaikan satu gambar kerja lengkap: kontur dan lubang, layer, semua jenis dimensi dengan satu gaya, label dan teks, pemeriksaan angka, dan lembar TechDraw, ditutup tabel gejala dan perbaikan.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: bab drawing — dimensi, anotasi, dan gaya dimensi pada gambar kerja.")
    refs += pm_ref(2, "amber", "249,115,22", "B. Monroy &amp; R. A. Cook", "Autodesk Inventor 2021 Essentials Plus", ". Sybex, 2021.", "Rujukan utama RPS: pembuatan drawing sheet, dimension styles, dan title block.")
    refs += pm_ref(3, "violet", "168,85,247", "FreeCAD Community", "FreeCAD 1.0 Documentation: Draft Dimension, Draft Text/Label/ShapeString, Draft AnnotationStyleEditor, TechDraw Workbench", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, properti ViewObject dimensi, dan API make_linear_dimension/make_radial_dimension_obj/make_label.")
    refs += pm_ref(4, "green", "0,224,158", "F. E. Giesecke dkk.", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Bab dimensioning dan tolerancing: aturan penempatan, chain/baseline, simbol R dan ⌀.")
    refs += pm_ref(5, "pink", "236,72,153", "ISO 129-1:2018 &amp; ISO 3098-1", "Technical product documentation — Indication of dimensions and tolerances; Lettering", ". ISO, Geneva.", "Standar penulisan dimensi, garis perpanjangan, dan tinggi huruf yang diterjemahkan ke AnnotationStyle.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi jenis dimensi, aturan ISO, teks dan anotasi, gaya dimensi, dan lembar TechDraw. Dokumentasi Draft dan TechDraw adalah pendamping wajib karena nama properti mengikuti versi FreeCAD yang dipakai.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Draft Dimension (jenis dan properti), Draft AnnotationStyleEditor, Draft Label, TechDraw PageDefault/View/Dimensions, dan TechDraw Templates. Video tutorial pada daftar putar RPS memperlihatkan urutan klik; modul ini memberi aturan dan rumus untuk memeriksanya.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 4 — Dimensi, Anotasi, dan Format Gambar Teknik · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Draft → Dimension</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">chain · baseline</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">R · ⌀ · °</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">Label · Text</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">TechDraw</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 4 · Dimensi, Anotasi, dan Format Gambar Teknik</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 4</span><br><em>Gambar Kerja</em><br>Beranotasi</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang jenis dimensi, aturan ISO, teks dan label, AnnotationStyle, layer, dan TechDraw, ditambah 5 tugas pemodelan 2D beranotasi: profil poros bertingkat (dimensi berantai), sektor (radius dan angular), pelat tiga lubang (baseline dan teks), slot (Fuse, gaya ISO-A4), dan pelat chamfer dengan label serta lembar TechDraw. Setiap tugas mengunggah berkas .FCStd dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Kelemahan utama <strong>dimensi berantai (chain)</strong> dibanding baseline adalah...",
     ["Membutuhkan lebih banyak garis perpanjangan", "Tidak dapat dipakai pada objek Draft", "Angkanya selalu lebih besar", "Toleransi tiap ruas terakumulasi pada ukuran keseluruhan"],
     "Kelemahan dimensi berantai"),
    ("Lubang tembus pada pelat seharusnya didimensi dengan...",
     ["R (radius), karena lubang berbentuk busur", "⌀ (diameter), karena itulah yang diukur dan dibuat mata bor", "Sudut pusat 360°", "Panjang keliling lubang"],
     "Simbol dimensi lubang"),
    ("Menurut ISO 129, garis perpanjangan dan garis dimensi ditempatkan dengan cara...",
     ["Garis perpanjangan bercelah kecil dari kontur dan sedikit melewati garis dimensi; garis dimensi berjarak dari kontur; angka di atas garis dimensi", "Garis perpanjangan menempel kontur dan berhenti tepat di panah", "Garis dimensi digambar di dalam kontur benda", "Angka ditulis di bawah garis dimensi dan dicoret"],
     "Aturan garis perpanjangan"),
    ("Alat Draft yang menghasilkan teks dengan garis penunjuk (leader) berpanah ke sebuah fitur adalah...",
     ["Draft Text", "Draft ShapeString", "Draft Label", "Draft Dimension"],
     "Teks berpanah"),
    ("Kegunaan <strong>Draft AnnotationStyle</strong> adalah...",
     ["Mengubah satuan dokumen", "Menyimpan font, ukuran, panah, desimal, dan satuan sebagai gaya bernama yang diterapkan ke banyak dimensi dan teks sekaligus", "Mengunci dimensi agar tidak bisa diubah", "Mengekspor dimensi ke DXF"],
     "Kegunaan AnnotationStyle"),
    ("Properti <strong>Decimals</strong> dan <strong>ShowUnit</strong> pada Draft Dimension...",
     ["Mengubah panjang geometri yang diukur", "Hanya tersedia pada dimensi angular", "Mengatur warna garis dimensi", "Mengatur jumlah angka di belakang koma dan tampil/tidaknya satuan pada teks dimensi tanpa mengubah nilai geometrinya"],
     "Decimals dan ShowUnit"),
    ("Dimensi <strong>angular</strong> Draft menampilkan...",
     ["Sudut antara dua garis dalam derajat dengan busur berpusat di perpotongannya", "Panjang busur dalam mm", "Radius busur", "Jarak dua titik sepanjang garis miring"],
     "Tampilan dimensi angular"),
    ("Peran <strong>TechDraw Page</strong> dalam FreeCAD adalah...",
     ["Menyimpan kunci jawaban tugas", "Mengubah objek 2D menjadi solid", "Lembar gambar bertemplate (A4/A3, kepala gambar) tempat View proyeksi, dimensi, dan anotasi disusun lalu diekspor ke PDF/DXF/SVG", "Menghitung luas objek"],
     "Peran TechDraw Page"),
    ("Menempatkan semua dimensi dan teks pada layer <strong>Dimensi</strong> berguna karena...",
     ["Mengubah nilai dimensi menjadi lebih presisi", "Dapat disembunyikan sekaligus (misalnya saat ekspor DXF untuk mesin potong) dan gaya garisnya seragam", "Membuat dimensi terekspor ke STL", "Menggabungkan semua dimensi menjadi satu objek"],
     "Kegunaan layer Dimensi"),
    ("Notasi <strong>40 ±0,1</strong> pada gambar berarti...",
     ["Ukuran 40 dengan berat 0,1 kg", "Ukuran 40,1 tepat", "Ukuran boleh 40 atau 0,1", "Ukuran nominal 40 dengan batas 39,9 sampai 40,1"],
     "Arti toleransi ±"),
]

TUGAS_LABELS = ["Profil poros bertingkat + dimensi berantai — luas (mm²)", "Sektor lingkaran + dimensi R dan angular — luas (mm²)", "Pelat tiga lubang + baseline dan teks — jarak L1–L3 (mm)",
                "Slot Fuse + gaya ISO-A4 — luas (mm²)", "Pelat chamfer + label + TechDraw — luas bersih (mm²)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}

FQ_JUDUL = [
    "Mengapa gambar pelat dudukan ditolak subkontraktor, dan bagaimana memilih chain atau baseline?",
    "Simbol dan jenis dimensi apa yang wajib ada agar lubang, fillet, dan chamfer tidak salah dibaca?",
    "Bagaimana gaya, layer, dan lembar TechDraw menjamin gambar yang seragam dan siap kirim?",
]
FQ_RINGKAS = [
    "Analisis penolakan gambar: hitung akumulasi toleransi lima lubang berantai ±0,1 dengan Persamaan (2), lalu usulkan skema baseline dan dimensi mana yang tetap berantai. Jelaskan aturan ISO 129 yang dilanggar.",
    "Daftarkan dimensi wajib pelat dudukan (ukuran luar, posisi dan ⌀ lubang, R fillet, C chamfer dan 45°) dengan simbol yang benar, dan jelaskan teks/label yang menggantikan dimensi berulang.",
    "Usulkan AnnotationStyle (font, panah, desimal, satuan), susunan layer, dan langkah TechDraw (template, view, skala, kepala gambar, ekspor PDF/DXF) untuk paket gambar yang dikirim ke subkontraktor.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Gambar pelat dudukan mesin memakai dimensi berantai untuk lima lubang baut dengan toleransi ±0,1 tiap ruas; subkontraktor menolak karena lubang terakhir bisa meleset ±0,5 dan pola baut tidak masuk. Hitung akumulasinya dengan Persamaan (2), usulkan skema baseline dari satu acuan (sisi mana?), tentukan ukuran mana yang justru tetap berantai, dan sebutkan aturan ISO 129 yang dilanggar pada gambar itu (Bagian 03).",
            ["5 lubang, ±0,1 tiap ruas", "chain → ±0,5", "baseline dari satu acuan"],
            "Cara pendimensian yang mencegah toleransi posisi lubang baut terakumulasi adalah...",
            ["Dimensi berantai dengan toleransi lebih ketat pada tiap ruas", "Dimensi baseline: setiap lubang diukur dari satu acuan yang sama", "Tidak mencantumkan toleransi sama sekali", "Mendimensi hanya lubang pertama dan terakhir"],
            "✅ Tepat! Baseline mengukur setiap fitur dari acuan yang sama sehingga tiap lubang tetap ±0,1 dan tidak mewarisi penyimpangan lubang sebelumnya. Memperketat toleransi chain hanya menaikkan biaya, dan menghilangkan toleransi membuat gambar tidak terdefinisi.",
            "❌ Rantai selalu menjumlahkan penyimpangan; memperketatnya mahal, meniadakannya tidak terdefinisi, dan mendimensi dua lubang saja meninggalkan tiga lubang tanpa posisi. Lihat Persamaan (2) dan Animasi 2.",
            "Petunjuk: (1) Hitung akumulasi toleransi chain. (2) Rancang baseline dan tentukan acuannya. (3) Sebutkan ukuran yang tetap berantai dan aturan ISO yang dilanggar.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Pelat dudukan memiliki lima lubang baut ⌀9, dua fillet R6 di sudut, satu chamfer C5 × 45°, dan slot untuk kabel. Daftarkan dimensi wajib beserta simbolnya (Bagian 02 dan 04), jelaskan mengapa lubang tidak didimensi R dan slot didimensi jarak pusat, dan tunjukkan teks atau label mana yang menggantikan dimensi berulang (mis. “5 × ⌀9 tembus”).",
            ["5 × ⌀9", "R6 · C5 × 45°", "slot: L + ⌀"],
            "Lima lubang baut identik ⌀9 tembus paling tepat dianotasi dengan...",
            ["Lima dimensi R4,5 pada setiap lubang", "Lima dimensi ⌀9 pada setiap lubang", "Satu dimensi panjang keliling lubang", "Satu dimensi ⌀9 dengan catatan jumlah, “5 × ⌀9 tembus”, dan posisi tiap pusat"],
            "✅ Tepat! Fitur identik dianotasi sekali dengan jumlahnya, memakai ⌀ (bukan R) karena lubang dibuat mata bor berdiameter; posisi pusat tetap didimensi masing-masing (baseline). Gambar jadi ringkas tanpa kehilangan informasi.",
            "❌ Lubang dibuat dengan diameter, bukan radius, dan mengulang ⌀9 lima kali melanggar aturan “tidak diulang”. Keliling lubang bukan ukuran yang dibuat siapa pun. Lihat tabel Bagian 04 dan Bagian 05.",
            "Petunjuk: (1) Daftarkan dimensi wajib dengan simbol R/⌀/°. (2) Jelaskan alasan tiap simbol. (3) Tunjukkan teks/label pengganti dimensi berulang.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Paket gambar akan dikirim sebagai PDF (untuk subkontraktor) dan DXF kontur (untuk laser). Usulkan AnnotationStyle yang dipakai seluruh gambar (font, ukuran, panah, desimal, satuan), susunan layer, dan langkah TechDraw dari template A4 sampai ekspor (Bagian 06 dan 07). Jelaskan apa yang terjadi bila setiap dimensi diatur sendiri-sendiri, dan bagaimana memastikan DXF tidak memuat dimensi.",
            ["ISO-A4: 3,5 · panah 2 · 2 desimal", "layer Dimensi", "A4 → View → PDF"],
            "Yang menjamin seluruh dimensi dan teks pada gambar tampil seragam dan bisa diubah sekaligus adalah...",
            ["Satu AnnotationStyle bernama yang diterapkan ke semua dimensi dan teks", "Mengatur FontSize satu per satu dengan angka yang sama", "Menggambar dimensi lebih besar agar terlihat", "Mengekspor ke PDF, karena PDF menyeragamkan font"],
            "✅ Tepat! AnnotationStyle menyimpan font, panah, desimal, dan satuan sebagai satu gaya; mengubah gaya memperbarui semua anotasi yang memakainya. Mengatur satu per satu rawan tidak konsisten, dan PDF hanya merekam apa adanya.",
            "❌ Mengatur satu per satu tidak menjamin keseragaman saat ada perubahan, memperbesar dimensi tidak menyelesaikan format, dan PDF tidak mengubah gaya sumbernya. Lihat kartu AnnotationStyle pada Bagian 06.",
            "Petunjuk: (1) Tetapkan AnnotationStyle dan layer. (2) Urutkan langkah TechDraw sampai ekspor PDF/DXF. (3) Jelaskan cara memastikan DXF hanya memuat kontur.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">5 lubang ±0,1 → ±0,5</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">baseline</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">5 × ⌀9 tembus</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">ISO-A4 · PDF · DXF</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 4 · Dimensi, Anotasi, dan Format Gambar Teknik</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Gambar yang Ditolak<br><em>Subkontraktor</em></h1>
    <p class="hero-sub">Sebuah gambar pelat dudukan mesin dikembalikan subkontraktor karena toleransi lubang menumpuk, simbol salah, dan gaya tidak seragam. Terapkan kaidah Pertemuan 4: jenis dimensi, aturan ISO, anotasi, gaya, layer, dan TechDraw, untuk memperbaikinya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PT Mitra Presisi —<br>Pelat Dudukan Mesin yang Dikembalikan</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS GAMBAR KERJA</div>
    <p>
      <strong style="color:var(--amber)">PT Mitra Presisi</strong> memesan <strong style="color:var(--cyan)">30 pelat dudukan mesin</strong> dari pelat baja 10 mm ke subkontraktor pemesinan: pelat 260 × 180 mm, <strong>lima lubang baut ⌀9</strong> sebaris untuk memasang motor, dua <strong>fillet R6</strong>, satu <strong>chamfer C5 × 45°</strong> pada sudut kabel, dan satu slot lebar 12 mm.
    </p>
    <p style="margin-top:12px">
      Gambar pertama <strong style="color:var(--cyan)">dikembalikan</strong> dengan catatan: lubang baut didimensi berantai ±0,1 sehingga lubang kelima boleh meleset ±0,5 dan tidak masuk ke pola baut motor; lubang ditulis R4,5 dan bukan ⌀9; ukuran huruf berbeda-beda; garis dimensi masuk ke dalam kontur; dan berkas DXF untuk laser memuat garis dimensi yang ikut terpotong.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">revisi gambar</strong>: skema pendimensian yang benar, simbol dan anotasi yang tepat, gaya dan layer yang seragam, serta lembar TechDraw dan berkas ekspor yang siap dikirim.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("Pelat 260 × 180 × 10, 30 unit", "14,165,233", "cyan")}
{kartu("5 × ⌀9 sebaris, toleransi posisi ±0,1", "14,165,233", "cyan")}
{kartu("R6 · C5 × 45° · slot 12", "14,165,233", "cyan")}
{kartu("Keluaran: PDF subkontraktor + DXF laser", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Lima catatan penolakan itu berasal dari lima keputusan penggambar: cara mendimensi, simbol, gaya, penempatan, dan layer. Forum ini mengajak Anda memperbaiki masing-masing dengan alat Draft dan TechDraw yang tepat.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Pelat dudukan: kiri dimensi berantai (ditolak), kanan baseline dengan simbol dan gaya yang benar</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "PT Mitra Presisi memesan 30 pelat dudukan mesin 260 &times; 180 &times; 10 mm: lima lubang baut &oslash;9 sebaris (toleransi posisi &plusmn;0,1), dua fillet R6, chamfer C5 &times; 45&deg;, dan slot 12 mm. Gambar pertama dikembalikan subkontraktor: lubang didimensi berantai sehingga lubang kelima meleset &plusmn;0,5, lubang ditulis R4,5, ukuran huruf tidak seragam, garis dimensi masuk kontur, dan DXF laser memuat dimensi. Susun revisi: skema pendimensian (baseline), simbol dan anotasi, AnnotationStyle dan layer, serta lembar TechDraw dan ekspor PDF/DXF."
FORUM_CHIPS_LMS = ["pelat = 260 × 180 × 10, 30 unit", "5 × ⌀9, toleransi posisi ±0,1", "R6 · C5 × 45° · slot 12", "keluaran = PDF + DXF laser"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Pelat dudukan: dimensi berantai (ditolak) vs baseline dengan simbol benar (Pertemuan 4)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const dim = (x1, y1, x2, y2, teks, warna, ofs) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L * ofs, ny = dx / L * ofs;
    ctx.strokeStyle = warna; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + nx * 1.15, y1 + ny * 1.15); ctx.moveTo(x2, y2); ctx.lineTo(x2 + nx * 1.15, y2 + ny * 1.15); ctx.moveTo(x1 + nx, y1 + ny); ctx.lineTo(x2 + nx, y2 + ny); ctx.stroke();
    ctx.fillStyle = warna; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText(teks, (x1 + x2) / 2 + nx * 1.4, (y1 + y2) / 2 + ny * 1.4 + 3);
  };
  const sk = Math.min((W / 2 - 70) / 260, (H - 90) / 180);
  [[W * 0.25, 'CHAIN — ditolak', '#f59e0b', true], [W * 0.75, 'BASELINE — revisi', '#00e09e', false]].forEach(([cx, judul, warna, chain]) => {
    const ox = cx - 130 * sk, oy = H / 2 + 60 * sk;
    ctx.fillStyle = 'rgba(34,211,238,.10)'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.6; ctx.strokeRect(ox, oy - 180 * sk, 260 * sk, 180 * sk);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#020812'; ctx.beginPath(); ctx.arc(ox + (30 + i * 50) * sk, oy - 40 * sk, 4.5 * sk, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = warna; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center'; ctx.fillText(judul, cx, 16);
    if (chain) { for (let i = 0; i < 4; i++) dim(ox + (30 + i * 50) * sk, oy - 40 * sk, ox + (80 + i * 50) * sk, oy - 40 * sk, '50±0,1', warna, 18 * sk + 10); ctx.fillStyle = '#ef4444'; ctx.fillText('R4,5 ✗ · lubang ke-5 ±0,5', cx, oy + 18); }
    else { for (let i = 1; i <= 4; i++) dim(ox, oy - 40 * sk, ox + (30 + i * 50) * sk, oy - 40 * sk, (30 + i * 50) + '±0,1', warna, 10 * sk + 6 + i * 8); ctx.fillStyle = '#00e09e'; ctx.fillText('5 × ⌀9 tembus · ISO-A4 · layer Dimensi', cx, oy + 18); }
  });
  ctx.textAlign = 'left';
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
