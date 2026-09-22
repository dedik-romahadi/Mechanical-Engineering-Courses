# Konten Modul 1 Teknik Tenaga Listrik — Konsep Dasar Sistem Tenaga Listrik.
# Semua angka contoh dihitung di sini agar teks, tabel, dan gambar konsisten,
# dan sengaja tidak sama dengan varian soal parametrik mana pun.
import math

SQ3 = math.sqrt(3)


def ind(x, d=2):
    """Angka gaya Indonesia: koma desimal, titik ribuan."""
    s = f"{x:,.{d}f}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".")


# ─────────────────────────── helper SVG ───────────────────────────
BG = "#0a101f"
BOX = "#0e1628"
GRID = "#243653"
AX = "#94a3b8"
TX = "#e2e8f0"
MONO = "'JetBrains Mono',monospace"
SANS = "'Inter',system-ui,sans-serif"


def t(x, y, s, size=12, fill=TX, anchor="middle", weight="", fam=SANS):
    w = f' font-weight="{weight}"' if weight else ""
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-size="{size}" fill="{fill}"{w} font-family="{fam}">{s}</text>'


def arrow(x1, y1, x2, y2, color=AX, w=1.6):
    ang = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    px, py = 4.5 * math.sin(ang), -4.5 * math.cos(ang)
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
            f'<polygon points="{x2:.1f},{y2:.1f} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{color}"/>')


def box(x, y, w, h, lines, stroke, size=12.5):
    out = f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="9" fill="{BOX}" stroke="{stroke}" stroke-width="1.6"/>'
    n = len(lines)
    for i, ln in enumerate(lines):
        yy = y + h / 2 + (i - (n - 1) / 2) * (size + 3) + size / 3
        out += t(x + w / 2, yy, ln, size, TX if i == 0 else AX, weight="600" if i == 0 else "")
    return out


def svg(w, h, body, label):
    return (f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{label}" preserveAspectRatio="xMidYMid meet">'
            f'<rect x="0" y="0" width="{w}" height="{h}" fill="{BG}"/>{body}</svg>')


def figure(num, judul, keterangan, svg_markup):
    return f'''  <figure class="ilustrasi reveal">
    {svg_markup}
    <figcaption><strong>Gambar {num}</strong> — {judul}. {keterangan}</figcaption>
  </figure>
'''


def gambar1():
    b = ""
    w, h = 132, 52
    atas = [("Pembangkit", "generator 13,8 kV", "#f97316"), ("Trafo penaik", "13,8 → 150 kV", "#a855f7"),
            ("Transmisi", "SUTT/SUTET", "#22d3ee"), ("Gardu induk", "150 → 20 kV", "#0ea5e9")]
    xs = [24, 184, 344, 504]
    for (a, s, c), x in zip(atas, xs):
        b += box(x, 26, w, h, [a, s], c)
    for i in range(3):
        b += arrow(xs[i] + w, 52, xs[i + 1], 52)
    bawah = [("Beban", "230/400 V", "#00e09e"), ("Trafo distribusi", "20 kV → 400 V", "#a855f7"), ("Distribusi", "penyulang 20 kV", "#22d3ee")]
    xb = [184, 344, 504]
    for (a, s, c), x in zip(bawah, xb):
        b += box(x, 128, w, h, [a, s], c)
    b += arrow(570, 78, 570, 128)
    b += arrow(504, 154, 476, 154)
    b += arrow(344, 154, 316, 154)
    b += t(92, 150, "rugi di setiap tahap", 11.5, "#ef4444")
    b += t(92, 166, "(Persamaan 2)", 11, AX)
    b += t(330, 206, "Tegangan dinaikkan untuk menyalurkan, lalu diturunkan dekat pemakai", 12, AX)
    return svg(660, 218, b, "Gambar 1 — Rantai sistem tenaga listrik")


def gambar2():
    levels = [("TR 400 V", 0.4, "#00e09e"), ("TM 20 kV", 20, "#22d3ee"), ("TT 70 kV", 70, "#0ea5e9"),
              ("TT 150 kV", 150, "#a855f7"), ("TET 275 kV", 275, "#f97316"), ("TET 500 kV", 500, "#ef4444")]
    b = ""
    x0, x1 = 130, 620
    lmin, lmax = math.log10(0.1), math.log10(1000)
    X = lambda v: x0 + (math.log10(v) - lmin) / (lmax - lmin) * (x1 - x0)
    for v in [0.1, 1, 10, 100, 1000]:
        b += f'<line x1="{X(v):.1f}" y1="20" x2="{X(v):.1f}" y2="226" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(X(v), 244, (ind(v, 1) if v < 1 else ind(v, 0)) + " kV", 11, AX)
    for i, (nama, v, c) in enumerate(levels):
        y = 26 + i * 33
        b += t(x0 - 10, y + 16, nama, 12, TX, "end", "600")
        b += f'<rect x="{x0}" y="{y}" width="{X(v) - x0:.1f}" height="22" rx="4" fill="{c}" fill-opacity="0.75"/>'
    b += t(375, 262, "Skala logaritmik: setiap garis kisi berarti sepuluh kali lipat", 12, AX)
    return svg(660, 272, b, "Gambar 2 — Tingkat tegangan sistem tenaga listrik Indonesia")


def gambar3():
    b = ""
    x0, x1, yc, amp = 60, 640, 120, 80
    for k in range(9):
        xx = x0 + k * (x1 - x0) / 8
        b += f'<line x1="{xx:.1f}" y1="30" x2="{xx:.1f}" y2="210" stroke="{GRID}" stroke-width="0.7"/>'
    b += f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{AX}" stroke-width="1.2"/>'
    warna = [("R", "#ef4444", 0), ("S", "#f59e0b", -120), ("T", "#22d3ee", -240)]
    for nama, c, fase in warna:
        pts = []
        for i in range(241):
            th = i / 240 * 4 * math.pi
            x = x0 + i / 240 * (x1 - x0)
            y = yc - amp * math.sin(th + math.radians(fase))
            pts.append(f"{x:.1f},{y:.1f}")
        b += f'<polyline points="{" ".join(pts)}" fill="none" stroke="{c}" stroke-width="2.3"/>'
    for i, (nama, c, _) in enumerate(warna):
        b += f'<line x1="{80 + i * 90}" y1="18" x2="{102 + i * 90}" y2="18" stroke="{c}" stroke-width="3"/>'
        b += t(108 + i * 90, 22, f"fasa {nama}", 11.5, TX, "start")
    b += t(350, 234, "Dua siklus (40 ms pada 50 Hz); ketiga fasa bergeser 120° dan jumlah sesaatnya selalu nol", 12, AX)
    b += t(40, 124, "0", 11, AX, "end")
    return svg(660, 244, b, "Gambar 3 — Tegangan tiga fasa seimbang")


P_REF, PF_REF, R_REF = 100e6, 0.9, 5.0


def rugi_persen(v_kv):
    return P_REF * R_REF / ((v_kv * 1e3) ** 2 * PF_REF ** 2) * 100


def gambar4():
    b = ""
    x0, x1, y0, y1 = 60, 630, 214, 26
    vmin, vmax, pmax = 40, 500, 30
    X = lambda v: x0 + (v - vmin) / (vmax - vmin) * (x1 - x0)
    Y = lambda p: y0 - min(p, pmax) / pmax * (y0 - y1)
    for p in [0, 10, 20, 30]:
        b += f'<line x1="{x0}" y1="{Y(p):.1f}" x2="{x1}" y2="{Y(p):.1f}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(x0 - 8, Y(p) + 4, f"{p}%", 11, AX, "end")
    pts = " ".join(f"{X(v):.1f},{Y(rugi_persen(v)):.1f}" for v in range(vmin, vmax + 1, 4))
    b += f'<polyline points="{pts}" fill="none" stroke="#22d3ee" stroke-width="2.5"/>'
    for v in [70, 150, 275, 500]:
        p = rugi_persen(v)
        b += f'<circle cx="{X(v):.1f}" cy="{Y(p):.1f}" r="4.5" fill="#f97316"/>'
        b += t(X(v), Y(p) - 10, f"{v} kV: {ind(p, 2)}%", 11.5, "#f97316", "start" if v < 400 else "end")
        b += t(X(v), y0 + 16, f"{v}", 11, AX)
    b += t(345, 250, "Tegangan saluran (kV) — rugi saluran sebagai persen daya kirim 100 MW", 12, AX)
    return svg(660, 260, b, "Gambar 4 — Rugi saluran terhadap tegangan")


def gambar5():
    data = [(2, "PLTU/PLTG"), (4, "PLTD"), (6, "PLTD"), (8, ""), (12, "PLTA"), (24, "PLTA"), (40, "PLTA")]
    b = ""
    x0, x1, y0, y1 = 70, 630, 206, 30
    bw = (x1 - x0) / len(data)
    Y = lambda n: y0 - n / 3000 * (y0 - y1)
    for n in [0, 1000, 2000, 3000]:
        b += f'<line x1="{x0}" y1="{Y(n):.1f}" x2="{x1}" y2="{Y(n):.1f}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(x0 - 8, Y(n) + 4, f"{n}", 11, AX, "end")
    for i, (p, lab) in enumerate(data):
        n = 6000 / p
        x = x0 + i * bw + bw * 0.18
        b += f'<rect x="{x:.1f}" y="{Y(n):.1f}" width="{bw * 0.64:.1f}" height="{y0 - Y(n):.1f}" rx="4" fill="#a855f7" fill-opacity="0.8"/>'
        yl = Y(n) - 7
        for g in [1000, 2000, 3000]:
            if yl - 11 < Y(g) < yl + 3:
                yl = Y(g) + 10 if Y(g) + 10 <= Y(n) - 4 else Y(g) - 3
        b += t(x + bw * 0.32, yl, f"{n:.0f}", 11.5, TX)
        b += t(x + bw * 0.32, y0 + 16, f"p = {p}", 11.5, TX, weight="600")
        if lab:
            b += t(x + bw * 0.32, y0 + 31, lab, 10.5, AX)
    b += t(26, 118, "rpm", 11, AX)
    b += t(350, 256, "Putaran sinkron n = 120·f/p untuk f = 50 Hz", 12, AX)
    return svg(660, 266, b, "Gambar 5 — Putaran sinkron terhadap jumlah kutub")


# Profil beban harian contoh (MW) untuk Gambar 6.
PROFIL = [31, 29, 28, 28, 29, 32, 38, 44, 48, 50, 51, 52, 50, 50, 51, 52, 56, 66, 74, 76, 72, 62, 48, 37]


def gambar6():
    b = ""
    x0, x1, y0, y1 = 60, 630, 206, 30
    X = lambda h: x0 + h / 24 * (x1 - x0)
    Y = lambda p: y0 - p / 90 * (y0 - y1)
    for p in [0, 30, 60, 90]:
        b += f'<line x1="{x0}" y1="{Y(p):.1f}" x2="{x1}" y2="{Y(p):.1f}" stroke="{GRID}" stroke-width="0.7"/>'
        b += t(x0 - 8, Y(p) + 4, f"{p}", 11, AX, "end")
    for h in range(0, 25, 3):
        b += t(X(h), y0 + 16, f"{h:02d}", 11, AX)
    pts = [(X(0), Y(0))]
    for h, p in enumerate(PROFIL):
        pts += [(X(h), Y(p)), (X(h + 1), Y(p))]
    pts.append((X(24), Y(0)))
    b += f'<polygon points="{" ".join(f"{a:.1f},{c:.1f}" for a, c in pts)}" fill="#22d3ee" fill-opacity="0.14"/>'
    b += f'<polyline points="{" ".join(f"{a:.1f},{c:.1f}" for a, c in pts[1:-1])}" fill="none" stroke="#22d3ee" stroke-width="2.3"/>'
    rata, puncak = sum(PROFIL) / 24, max(PROFIL)
    b += f'<line x1="{x0}" y1="{Y(puncak):.1f}" x2="{x1}" y2="{Y(puncak):.1f}" stroke="#ef4444" stroke-width="1.3" stroke-dasharray="5 4"/>'
    b += f'<line x1="{x0}" y1="{Y(rata):.1f}" x2="{x1}" y2="{Y(rata):.1f}" stroke="#00e09e" stroke-width="1.3" stroke-dasharray="5 4"/>'
    b += t(x0 + 6, Y(puncak) - 6, f"puncak {puncak} MW", 11.5, "#ef4444", "start")
    b += t(x0 + 6, Y(rata) - 6, f"rata-rata {ind(rata, 2)} MW", 11.5, "#00e09e", "start")
    b += t(X(12), Y(18) + 4, f"LF = {ind(rata / puncak * 100, 1)}%", 12, TX, weight="700")
    b += t(345, 242, "Pukul (jam) — beban (MW) kawasan contoh selama satu hari", 12, AX)
    return svg(660, 252, b, "Gambar 6 — Kurva beban harian dan faktor beban")


# ─────────────────────────── helper HTML ───────────────────────────
def notasi(pairs):
    spans = "".join(f'<span class="anim-var nw{i % 5}"><span class="rumus-notasi">\\({a}\\)</span><span>{b}</span></span>' for i, (a, b) in enumerate(pairs))
    return f'<div class="anim-var-list" aria-label="Arti tiap notasi">{spans}</div>'


def formula(no, label, latex, desc, penjelasan, pairs):
    return f'''  <div class="formula-block reveal">
    <div class="formula-label">{label}</div>
    <div class="formula-main">\\({latex}\\)<span class="formula-number">({no})</span></div>
    <div class="formula-desc">{desc}</div>
  </div>
  <div class="tip-box reveal rumus-jelas">
    <strong>📐 Persamaan ({no})</strong> — {penjelasan}
    {notasi(pairs)}
  </div>
'''


def cards(items, pairs=None):
    out = '  <div class="cards reveal">\n'
    for icon, judul, isi, rumus in items:
        f = f'\n      <div class="formula">{rumus}</div>' if rumus else ""
        out += f'''    <div class="card">
      <div class="card-icon">{icon}</div>
      <h3>{judul}</h3>
      <p>{isi}</p>{f}
    </div>
'''
    out += "  </div>\n"
    if pairs:
        out += f'  <div class="tip-box reveal rumus-jelas"><strong>🔤 Arti notasi:</strong>\n    {notasi(pairs)}\n  </div>\n'
    return out


def tabel(header, rows):
    th = "".join(f"<th>{h}</th>" for h in header)
    body = "\n".join("        <tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'''  <div class="tbl-wrap reveal">
    <table>
      <thead>
        <tr>{th}</tr>
      </thead>
      <tbody>
{body}
      </tbody>
    </table>
  </div>
'''


def kotak(kelas, isi, style=""):
    st = f' style="{style}"' if style else ""
    return f'  <div class="{kelas} reveal"{st}>\n    {isi}\n  </div>\n'


def bagian(no, sid, judul, desc, isi, komentar):
    return f'''<!-- ═══ BAGIAN {no:02d} — {komentar} ═══ -->
<hr class="divider"{' style="margin-top:64px"' if no == 1 else ''}>
<div class="section" id="{sid}">
  <div class="section-label reveal">Bagian {no:02d}</div>
  <h2 class="section-title reveal">{judul}</h2>
  <p class="section-desc reveal">{desc}</p>
{isi}</div>

'''


def anim_panel(nomor, warna, judul, canvas, sliders, tombol, toggle, info, cara):
    ctrl = ""
    for sid, vid, label, mn, mx, step, val, tampil in sliders:
        ctrl += f'''        <div class="ctrl-group">
          <label>{label} — <span class="ctrl-val" id="{vid}">{tampil}</span></label>
          <input type="range" id="{sid}" min="{mn}" max="{mx}" step="{step}" value="{val}">
        </div>
'''
    return f'''  <div class="anim-panel reveal">
    <div class="anim-header">
      <div class="anim-dot" style="background:var(--{warna})"></div>
      <span class="anim-title">Animasi {nomor} — {judul}</span>
    </div>
    <div class="anim-body">
      <canvas id="{canvas}" height="280"></canvas>
      <div class="ctrl-row">
{ctrl}        <button class="btn-anim" id="{tombol}" onclick="{toggle}()">⏸ PAUSE</button>
      </div>
      <div id="{info}" style="margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--green)"></div>
      <div class="tip-box" style="margin-top:16px">
        {cara}
      </div>
    </div>
  </div>

'''


def kode(judul, baris):
    """Blok kode Python dengan pewarnaan sederhana seperti modul acuan."""
    import html
    import re
    kw = {"import", "as", "for", "in", "print", "True", "False", "def", "return", "zip", "max", "sum"}
    out = []
    for ln in baris.split("\n"):
        esc = html.escape(ln, quote=False)
        if "#" in ln:
            i = esc.index("#")
            badan, kom = esc[:i], esc[i:]
        else:
            badan, kom = esc, ""
        parts = re.split(r"(f?'[^']*'|f?\"[^\"]*\")", badan)
        warna = []
        for j, part in enumerate(parts):
            if j % 2 == 1:
                warna.append(f'<span class="st">{part}</span>')
                continue
            part = re.sub(r"\b(\d+(?:\.\d+)?(?:e\d+)?)\b", r'<span class="nm">\1</span>', part)
            part = re.sub(r"\b(" + "|".join(sorted(kw, key=len, reverse=True)) + r")\b", r'<span class="kw">\1</span>', part)
            part = re.sub(r"\.(\w+)\(", r'.<span class="fn">\1</span>(', part)
            warna.append(part)
        out.append("".join(warna) + (f'<span class="cm">{kom}</span>' if kom else ""))
    isi = "\n".join(out)
    return f'''  <div class="code-wrap reveal">
    <div class="code-header">
      <div class="code-dots"><span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span></div>
      <span class="code-label">{judul}</span>
      <span class="code-lang">Python</span>
      <button class="code-copy" onclick="cpC(this)">📋 Copy</button>
    </div>
    <pre>{isi}</pre>
  </div>

'''


def pm_ref(no, warna, rgb, penulis, judul, terbit, catatan):
    return f'''    <div class="reference-card" style="display:flex;gap:16px;padding:18px 22px;background:rgba({rgb},.05);border:1px solid rgba({rgb},.15);border-left:3px solid var(--{warna});border-radius:10px;align-items:flex-start">
      <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--{warna});flex-shrink:0;min-width:32px">[{no}]</span>
      <div style="font-size:14px;line-height:1.7">
        {penulis}. <em style="color:#fff">{judul}</em>{terbit}
        <br><span style="color:var(--muted);font-size:13px">{catatan}</span>
      </div>
    </div>
'''


# ─────────────────────────── angka contoh ───────────────────────────
ETA_CONTOH = 0.38 * 0.985 * 0.965 * 0.93 * 100
P3_CONTOH = SQ3 * 380 * 25 * 0.85 / 1000
I5_CONTOH = 6.25e6 / (SQ3 * 20e3 * 0.9)
I5_LV = 6.25e6 / (SQ3 * 400 * 0.9)
T8_CONTOH = 250e6 / 0.985 / (2 * math.pi * 3000 / 60) / 1000
LF_CONTOH = 820 / 24 / 45 * 100
CF_CONTOH = 4200 / (3 * 8760) * 100
BLOK = [(6, 25.0), (11, 45.0), (5, 70.0), (2, 35.0)]
E_BLOK = sum(d * p for d, p in BLOK)


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-pengertian">Pengertian</a>
  <a href="#m-bagian">Bagian Sistem</a>
  <a href="#m-besaran">Daya &amp; Faktor Daya</a>
  <a href="#m-rugi">Rugi Saluran</a>
  <a href="#m-pembangkit">Pembangkit</a>
  <a href="#m-beban">Kurva Beban</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-tren">Tren</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="30" r="12" fill="none" stroke="rgba(0,229,255,.5)" stroke-width="1.5"/>
      <text x="22" y="34" text-anchor="middle" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="11">G</text>
      <line x1="34" y1="30" x2="46" y2="30" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <circle cx="53" cy="30" r="7" fill="none" stroke="rgba(124,77,255,.5)" stroke-width="1.4"/>
      <circle cx="62" cy="30" r="7" fill="none" stroke="rgba(124,77,255,.5)" stroke-width="1.4"/>
      <line x1="69" y1="30" x2="82" y2="30" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <polyline points="70,150 78,60 86,150" fill="none" stroke="rgba(255,179,0,.45)" stroke-width="1.4"/>
      <line x1="66" y1="80" x2="90" y2="80" stroke="rgba(255,179,0,.45)" stroke-width="1.4"/>
      <line x1="68" y1="100" x2="88" y2="100" stroke="rgba(255,179,0,.4)" stroke-width="1.2"/>
      <line x1="73" y1="115" x2="83" y2="130" stroke="rgba(255,179,0,.35)" stroke-width="1"/>
      <line x1="83" y1="115" x2="73" y2="130" stroke="rgba(255,179,0,.35)" stroke-width="1"/>
      <path d="M 10 80 Q 38 92 66 80" fill="none" stroke="rgba(0,224,158,.4)" stroke-width="1.2"/>
      <rect x="10" y="170" width="30" height="22" rx="3" fill="none" stroke="rgba(0,224,158,.45)" stroke-width="1.4"/>
      <text x="25" y="185" text-anchor="middle" fill="rgba(0,224,158,.5)" font-family="JetBrains Mono" font-size="8">beban</text>
      <text x="6" y="60" fill="rgba(148,163,184,.5)" font-family="JetBrains Mono" font-size="8">150 kV</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <polyline points="10,110 20,70 30,70 40,110 50,150 60,150 70,110 80,70 90,70" fill="none" stroke="rgba(239,68,68,.5)" stroke-width="1.5" stroke-linejoin="round"/>
      <polyline points="10,80 20,70 30,100 40,140 50,150 60,120 70,80 80,70 90,100" fill="none" stroke="rgba(245,158,11,.45)" stroke-width="1.4" stroke-linejoin="round"/>
      <polyline points="10,140 20,150 30,120 40,80 50,70 60,100 70,140 80,150 90,120" fill="none" stroke="rgba(34,211,238,.45)" stroke-width="1.4" stroke-linejoin="round"/>
      <line x1="10" y1="110" x2="92" y2="110" stroke="rgba(148,163,184,.4)" stroke-width="1.2"/>
      <text x="12" y="58" fill="rgba(239,68,68,.55)" font-family="JetBrains Mono" font-size="8">R</text>
      <text x="26" y="58" fill="rgba(245,158,11,.55)" font-family="JetBrains Mono" font-size="8">S</text>
      <text x="40" y="58" fill="rgba(34,211,238,.55)" font-family="JetBrains Mono" font-size="8">T</text>
      <text x="36" y="176" fill="rgba(148,163,184,.45)" font-family="JetBrains Mono" font-size="8">50 Hz</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="01">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">P = √3·V·I·cos φ</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">E = P·t</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">f = p·n/120</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">P_rugi = 3·I²·R</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">I = P/(√3·V·cos φ)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">LF = P_rata/P_puncak</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">η = η₁·η₂·η₃</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">CF = E/(P·8760)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 1 &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Konsep Dasar</span><br>
      <em>Sistem Tenaga</em><br>
      <span class="hl-amber">Listrik</span>
    </h1>
    <p class="hero-sub">Membangun kosakata dan alat hitung pertama mata kuliah ini: pengertian dan peran sistem tenaga listrik, rantai pembangkitan–transmisi–distribusi–beban beserta tingkat tegangannya, daya satu dan tiga fasa, alasan transmisi bertegangan tinggi, generator dan frekuensi, kurva beban, hingga arah perkembangan sistem tenaga listrik Indonesia.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Konsep, prinsip, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Contoh, tabel, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Python, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">@@N_CELL@@</div><div class="stat-lbl">Cell Python</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01
    isi = figure(1, "Rantai sistem tenaga listrik", "Energi dibangkitkan pada belasan kilovolt, dinaikkan untuk transmisi, diturunkan di gardu induk menjadi 20 kV, lalu diturunkan lagi menjadi 230/400 V untuk pemakai; setiap tahap menyumbang rugi.", gambar1())
    isi += formula(1, "Energi Listrik dan Biaya Pemakaian", r"E = P \cdot t, \qquad \text{Biaya} = E \times \text{tarif}",
                   r"\(P\) = daya (kW) &nbsp;·&nbsp; \(t\) = lama pemakaian (jam) &nbsp;·&nbsp; \(E\) = energi (kWh). Tagihan listrik menghitung \(E\), bukan \(P\): pompa 1,5 kW yang menyala 5 jam sehari selama 30 hari memakai \(E = 225\) kWh.",
                   "Daya menyatakan laju pemakaian energi, sedangkan energi adalah jumlah yang terpakai selama waktu tertentu. Alat berdaya besar yang menyala sebentar bisa lebih murah daripada alat berdaya kecil yang menyala terus-menerus.",
                   [("E", "Energi listrik (kWh atau MWh)"), ("P", "Daya aktif (W, kW, atau MW)"), ("t", "Lama pemakaian (jam)"), (r"\text{tarif}", "Harga energi per kWh (Rp/kWh)")])
    isi += cards([
        ("🏭", "Pembangkitan", "Mengubah energi primer (batubara, gas, air, panas bumi, surya, angin) menjadi energi listrik melalui generator. Di sinilah peran teknik mesin paling besar: boiler, turbin, dan sistem pendingin menentukan efisiensi pembangkit.", "energi primer → listrik"),
        ("🗼", "Transmisi", "Menyalurkan daya dalam jumlah besar dan jarak jauh pada tegangan tinggi (70–500 kV), dari pembangkit ke gardu induk di dekat pusat beban.", r"\(V\) tinggi → \(I\) kecil"),
        ("🔌", "Distribusi", "Membagikan daya dari gardu induk ke pelanggan melalui jaringan tegangan menengah 20 kV, lalu jaringan tegangan rendah 230/400 V.", "20 kV → 230/400 V"),
        ("💡", "Pemanfaatan (Beban)", "Motor, pemanas, pendingin, penerangan, dan peralatan elektronik. Karakter beban, yaitu besar, waktu pemakaian, dan faktor dayanya, menentukan ukuran seluruh sistem di hulunya.", r"\(P = V I \cos\varphi\)"),
        ("⚖️", "Keseimbangan Daya", "Energi listrik hampir tidak disimpan dalam jumlah besar, sehingga pembangkitan harus selalu mengikuti beban. Bila beban melonjak lebih cepat daripada pembangkit menambah daya, putaran generator melambat dan frekuensi turun.", r"\(P_{bangkit} = P_{beban} + P_{rugi}\)"),
        ("📏", "Mutu dan Keandalan", "Pelanggan menuntut tegangan dan frekuensi yang stabil serta pasokan tanpa padam. Mutu diukur dari penyimpangan tegangan dan frekuensi serta seberapa sering dan lama gangguan terjadi.", r"\(f \approx 50\) Hz"),
    ], [("V", "Tegangan"), ("I", "Arus"), (r"\cos\varphi", "Faktor daya"), ("P_{bangkit}", "Daya yang dibangkitkan"), ("P_{beban}", "Daya yang dipakai beban"), ("P_{rugi}", "Rugi daya di jaringan"), ("f", "Frekuensi sistem")])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> Stasiun Pearl Street milik Thomas Edison di New York (1882) memasok listrik arus searah (DC) untuk penerangan dalam radius sekitar satu mil saja, karena rugi pada tegangan rendah terlalu besar untuk jarak jauh. Sistem arus bolak-balik (AC) yang dikembangkan Nikola Tesla dan George Westinghouse memecahkan masalah itu: dengan transformator, tegangan dapat dinaikkan untuk transmisi lalu diturunkan kembali di dekat pemakai. PLTA Niagara Falls, yang mulai beroperasi pada 1895 dan mengirim daya ke Buffalo sejak 1896, mengukuhkan AC sebagai standar dunia. Di Indonesia, berdirinya Jawatan Listrik dan Gas pada 27 Oktober 1945 kini diperingati sebagai Hari Listrik Nasional.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Mata Kuliah Ini:</strong> Pertemuan 1–2 memberi <em>kosakata</em>: bagian dan komponen sistem. Pertemuan 3–5 memberi <em>alat hitung</em>: jaringan DC dan AC, daya satu dan tiga fasa. Pertemuan 6–7 dan 9–10 membawa alat itu ke <em>saluran transmisi</em>: aliran daya, transien, reaktansi, dan pemodelan. Pertemuan 11–13 membahas <em>sistem distribusi</em>, kompensasi, dan peralatannya. Pertemuan 14–15 menyatukan semuanya lewat <em>single line diagram</em> dan <em>analisis aliran daya</em>. Jika kosakata di modul ini kuat, pertemuan-pertemuan berikutnya jauh lebih mudah diikuti.")
    m += bagian(1, "m-pengertian", "Apa Itu<br>Sistem Tenaga Listrik?",
                "Sistem tenaga listrik (STL) adalah rangkaian fasilitas yang membangkitkan, menyalurkan, dan membagikan energi listrik dari pusat pembangkit sampai ke peralatan pemakai, dengan tegangan dan frekuensi yang terjaga. Karena energi listrik hampir tidak disimpan dalam jumlah besar, setiap saat daya yang dibangkitkan harus sama dengan daya yang dipakai ditambah rugi-rugi di jaringan. Mata kuliah ini membahas cara kerja, perhitungan, dan perancangan sistem tersebut. Hubungan paling dasarnya, energi sebagai daya dikali waktu, dirangkum dalam Persamaan (1). Gambar 1 memperlihatkan rantai sistemnya.",
                isi, "APA ITU SISTEM TENAGA LISTRIK")

    # 02
    isi = figure(2, "Tingkat tegangan sistem tenaga listrik Indonesia", "Dari tegangan rendah 400 V sampai tegangan ekstra tinggi 500 kV, rentangnya lebih dari seribu kali lipat; setiap lompatan tingkat tegangan dilakukan transformator.", gambar2())
    isi += formula(2, "Efisiensi Berantai dari Bahan Bakar ke Konsumen", r"\eta_{total} = \eta_{p} \cdot \eta_{trf} \cdot \eta_{t} \cdot \eta_{d}",
                   rf"\(\eta_p\) = efisiensi pembangkit &nbsp;·&nbsp; \(\eta_{{trf}}\) = transformator &nbsp;·&nbsp; \(\eta_t\) = transmisi &nbsp;·&nbsp; \(\eta_d\) = distribusi. Contoh: PLTU 38%, transformator 98,5%, transmisi 96,5%, dan distribusi 93% memberi \(\eta_{{total}} \approx {ind(ETA_CONTOH, 2)}\%\).",
                   "Efisiensi tahap-tahap yang tersusun seri dikalikan, bukan dijumlahkan. Tahap dengan efisiensi paling rendah, hampir selalu pembangkit termal, paling menentukan hasil akhir; memperbaiki satu persen di sana jauh lebih berarti daripada di transformator.",
                   [(r"\eta_{total}", "Efisiensi total: energi sampai konsumen dibagi energi bahan bakar"), (r"\eta_{p}", "Efisiensi pembangkit (termal atau konversi)"), (r"\eta_{trf}", "Efisiensi transformator"), (r"\eta_{t}", "Efisiensi saluran transmisi"), (r"\eta_{d}", "Efisiensi jaringan distribusi")])
    isi += cards([
        ("⚙️", "Generator dan Trafo Penaik", "Generator pembangkit besar menghasilkan tegangan belasan kilovolt (misalnya 13,8–24 kV). Transformator penaik (step-up) di pembangkit menaikkan tegangan ini ke tingkat transmisi.", None),
        ("🗼", "Saluran Transmisi", "SUTT (70 dan 150 kV) dan SUTET (275 dan 500 kV) mengalirkan ratusan megawatt melintasi pulau. Di Jawa–Bali, tulang punggungnya adalah jaringan 500 kV.", None),
        ("🏢", "Gardu Induk (GI)", "Menurunkan tegangan transmisi menjadi tegangan distribusi primer 20 kV, sekaligus tempat pemutus tenaga (PMT), rel (busbar), dan relai proteksi berada.", None),
        ("📦", "Jaringan Tegangan Menengah", "Penyulang (feeder) 20 kV berupa saluran udara atau kabel tanah membawa daya ke kawasan pemukiman dan industri. Pelanggan industri besar dapat berlangganan langsung pada tegangan ini.", None),
        ("🔋", "Trafo Distribusi dan JTR", "Trafo tiang atau gardu beton menurunkan 20 kV menjadi 230/400 V. Jaringan tegangan rendah (JTR) lalu menyambung ke rumah, toko, dan bengkel.", None),
        ("🏠", "Sambungan Pelanggan", "Kabel sambungan rumah, kWh meter, dan pembatas daya (MCB) adalah titik terakhir sebelum energi dipakai. Batas daya langganan dalam VA ditentukan di sini.", None),
    ])
    isi += tabel(["Kelompok", "Tegangan nominal", "Contoh penggunaan", "Komponen khas"], [
        ["Tegangan ekstra tinggi (TET)", "500 kV; 275 kV", "Tulang punggung Jawa–Bali; interkoneksi Sumatra", "SUTET, GITET"],
        ["Tegangan tinggi (TT)", "150 kV; 70 kV", "Transmisi antarkota dan antarkawasan", "SUTT, gardu induk"],
        ["Tegangan menengah (TM)", "20 kV", "Penyulang distribusi, pelanggan industri", "JTM, gardu distribusi"],
        ["Tegangan rendah (TR)", "230/400 V", "Rumah, toko, bengkel kecil", "JTR, kWh meter"],
        ["Tegangan generator", "6–24 kV", "Terminal generator pembangkit", "Generator, trafo penaik"],
    ])
    isi += kotak("info-box", "<strong>⚠️ Kesalahan Umum:</strong> menyamakan <em>gardu induk</em> dengan <em>gardu distribusi</em>. Gardu induk bekerja di sisi transmisi (misalnya 150/20 kV) dan melayani puluhan penyulang; gardu distribusi bekerja di sisi 20 kV/400 V dan melayani satu lingkungan. Salah membedakan keduanya membuat perhitungan arus meleset puluhan hingga ratusan kali lipat, sebab tegangannya berbeda jauh.")
    isi += kotak("tip-box", "💡 <strong>Satuan yang Sering Tertukar:</strong> kV (kilovolt, tegangan), kVA (kilovolt-ampere, daya semu yang menjadi batas langganan dan rating trafo), kW (daya aktif), dan kWh (energi). Rumah dengan langganan 1300 VA pada faktor daya 0,9 hanya dapat memakai daya aktif sekitar 1170 W sekaligus.")
    m += bagian(2, "m-bagian", "Bagian-Bagian Sistem<br>dan Tingkat Tegangan",
                "Energi listrik menempuh perjalanan panjang dan berganti tingkat tegangan beberapa kali sebelum sampai ke stopkontak. Setiap pergantian dilakukan transformator, dan setiap tahap menyumbang rugi. Mengenali tahap-tahap ini beserta tegangan kerjanya adalah dasar membaca diagram sistem tenaga pada pertemuan-pertemuan berikutnya. Karena rugi di setiap tahap saling mengali, efisiensi totalnya dituliskan pada Persamaan (2). Gambar 2 membandingkan tingkat tegangannya.",
                isi, "BAGIAN SISTEM DAN TINGKAT TEGANGAN")

    # 03
    isi = figure(3, "Tegangan tiga fasa seimbang", "Tiga tegangan sinus sama besar yang saling bergeser 120° menjadi dasar hampir semua jaringan tenaga listrik; di Indonesia fasanya lazim diberi label R, S, dan T.", gambar3())
    isi += formula(3, "Daya Aktif Satu Fasa", r"P = V \cdot I \cdot \cos\varphi",
                   r"\(V\) dan \(I\) adalah nilai efektif (rms). Pemanas 230 V yang menarik 5,5 A pada \(\cos\varphi = 1\) menyerap \(P = 1265\) W; beban lain dengan arus sama tetapi \(\cos\varphi = 0{,}8\) hanya menyerap 1012 W daya aktif.",
                   "Faktor daya adalah bagian dari \\(V \\cdot I\\) yang benar-benar menjadi kerja atau panas. Sisanya berpindah bolak-balik antara sumber dan medan magnet atau listrik pada beban: tetap membebani kabel, tetapi tidak menghasilkan kerja.",
                   [("P", "Daya aktif (W)"), ("V", "Tegangan efektif (V)"), ("I", "Arus efektif (A)"), (r"\cos\varphi", "Faktor daya, 0 sampai 1"), (r"\varphi", "Sudut geser fasa antara tegangan dan arus")])
    isi += cards([
        ("⚡", "Tegangan (V)", "Beda potensial yang mendorong muatan. Pada sistem AC yang tercantum di papan nama adalah nilai efektif (rms), yaitu nilai puncak dibagi √2: 230 V rms berpuncak sekitar 325 V.", r"\(V_{rms} = V_m/\sqrt{2}\)"),
        ("〰️", "Arus (I)", "Aliran muatan yang memanaskan penghantar sebanding \\(I^2R\\). Ukuran kabel, rating pemutus, dan rugi saluran semuanya ditentukan oleh arus, bukan oleh daya.", r"\(P_{panas} = I^2 R\)"),
        ("📐", "Daya Aktif, Reaktif, dan Semu", "Daya aktif \\(P\\) (W) menghasilkan kerja; daya reaktif \\(Q\\) (VAR) membangun medan magnet motor dan trafo; daya semu \\(S\\) (VA) adalah gabungan keduanya dan menentukan ukuran peralatan.", r"\(S^2 = P^2 + Q^2\)"),
        ("🧭", "Faktor Daya", "Perbandingan \\(P/S\\). Beban resistif murni seperti pemanas bernilai 1; motor induksi berbeban ringan dapat turun di bawah 0,7. Pelanggan golongan tertentu dikenai biaya kelebihan daya reaktif bila faktor dayanya di bawah 0,85.", r"\(\cos\varphi = P/S\)"),
        ("🔺", "Sistem Tiga Fasa", "Tiga tegangan sama besar yang bergeser 120°. Dengan tiga atau empat kawat, sistem ini mengirim daya tiga kali lipat satu fasa dan menghasilkan medan putar untuk motor induksi.", r"\(V_L = \sqrt{3}\, V_f\)"),
        ("🏷️", "Fasa R, S, T dan Netral", "Di Indonesia ketiga fasa lazim diberi label R, S, T dengan penghantar netral N. Tegangan antarfasa 400 V dan tegangan fasa–netral 230 V: perbandingannya tepat \\(\\sqrt{3}\\).", None),
    ], [(r"V_{rms}", "Tegangan efektif"), ("V_m", "Tegangan puncak"), ("P_{panas}", "Daya yang berubah menjadi panas"), ("R", "Resistansi penghantar"), ("S", "Daya semu (VA)"), ("Q", "Daya reaktif (VAR)"), ("V_L", "Tegangan antarfasa"), ("V_f", "Tegangan fasa–netral")])
    isi += formula(4, "Daya Aktif Tiga Fasa Seimbang", r"P = \sqrt{3} \cdot V_L \cdot I_L \cdot \cos\varphi",
                   rf"\(V_L\) = tegangan antarfasa &nbsp;·&nbsp; \(I_L\) = arus saluran. Motor 380 V yang menarik 25 A pada \(\cos\varphi = 0{{,}}85\) menyerap \(P = \sqrt{{3}} \times 380 \times 25 \times 0{{,}}85 \approx {ind(P3_CONTOH, 2)}\) kW.",
                   "Faktor \\(\\sqrt{3}\\) muncul karena tegangan antarfasa \\(\\sqrt{3}\\) kali tegangan fasa, sedangkan daya total tiga kali daya per fasa: \\(3 V_f I_L \\cos\\varphi = \\sqrt{3}\\, V_L I_L \\cos\\varphi\\). Rumus ini berlaku untuk hubungan bintang maupun delta selama bebannya seimbang.",
                   [("P", "Daya aktif total ketiga fasa (W)"), ("V_L", "Tegangan antarfasa (V)"), ("I_L", "Arus saluran (A)"), (r"\cos\varphi", "Faktor daya beban")])
    rows = []
    for alat, v, fasa, i, pf in [("Setrika/pemanas", 230, 1, 4.5, 1.0), ("Pompa air rumah", 230, 1, 5.0, 0.85), ("AC split 1 PK", 230, 1, 4.0, 0.90),
                                 ("Motor induksi 7,5 kW (bengkel)", 380, 3, 15.0, 0.85), ("Kompresor pabrik", 380, 3, 60.0, 0.88)]:
        p = (SQ3 if fasa == 3 else 1) * v * i * pf
        rows.append([alat, f"{v} V {'3φ' if fasa == 3 else '1φ'}", f"{ind(i, 1)} A", ind(pf, 2), f"{ind(p / 1000, 2)} kW"])
    isi += tabel(["Peralatan", "Tegangan", "Arus", r"\(\cos\varphi\)", "Daya aktif"], rows)
    isi += kotak("info-box", "<strong>📌 Yang Sering Disalahpahami:</strong> rating trafo dan genset dinyatakan dalam kVA, bukan kW, karena pemanasannya ditentukan arus, dan arus ditentukan daya semu. Genset 100 kVA yang melayani beban berfaktor daya 0,8 hanya boleh memikul 80 kW daya aktif, walaupun mesin dieselnya sanggup lebih.")
    m += bagian(3, "m-besaran", "Tegangan, Arus,<br>Daya, dan Faktor Daya",
                "Tiga besaran menentukan hampir semua perhitungan di mata kuliah ini: tegangan \\(V\\), arus \\(I\\), dan faktor daya \\(\\cos\\varphi\\). Pada arus bolak-balik, tegangan dan arus dapat bergeser fasa, sehingga tidak seluruh hasil kali \\(V \\cdot I\\) menjadi kerja nyata. Daya satu fasa dituliskan pada Persamaan (3) dan daya tiga fasa pada Persamaan (4). Bentuk gelombang tiga fasa diperlihatkan Gambar 3.",
                isi, "TEGANGAN, ARUS, DAYA")

    # 04
    isi = figure(4, "Rugi saluran terhadap tegangan", "Untuk daya 100 MW, faktor daya 0,9, dan resistansi 5 Ω per fasa, rugi turun sebanding kuadrat tegangan: dari belasan persen pada 70 kV menjadi seperempat persen pada 500 kV.", gambar4())
    isi += formula(5, "Arus Saluran Tiga Fasa", r"I_L = \dfrac{P}{\sqrt{3}\, V_L \cos\varphi}",
                   rf"Beban 6,25 MW pada 20 kV dan \(\cos\varphi = 0{{,}}9\) menarik \(I_L \approx {ind(I5_CONTOH, 1)}\) A. Beban yang sama pada 400 V akan menarik sekitar {ind(I5_LV, 0)} A, arus yang mustahil dialirkan kabel biasa.",
                   "Arus berbanding terbalik dengan tegangan: tegangan 50 kali lebih tinggi berarti arus 50 kali lebih kecil. Inilah alasan penyulang ke kawasan industri memakai 20 kV, bukan tegangan rendah.",
                   [("I_L", "Arus saluran (A)"), ("P", "Daya aktif yang disalurkan (W)"), ("V_L", "Tegangan antarfasa (V)"), (r"\cos\varphi", "Faktor daya")])
    isi += formula(6, "Rugi Daya pada Saluran Tiga Fasa", r"P_{rugi} = 3 I_L^2 R = \dfrac{P^2 R}{V_L^2 \cos^2\varphi}",
                   r"\(R\) = resistansi per fasa (Ω). Bentuk kanan diperoleh dengan mensubstitusikan Persamaan (5): untuk \(P\), \(R\), dan \(\cos\varphi\) tetap, rugi berbanding terbalik dengan \(V_L^2\). Menaikkan tegangan dua kali memangkas rugi menjadi seperempatnya.",
                   "Kuadrat pada arus membuat rugi sangat sensitif: arus naik 10% menaikkan rugi 21%. Faktor daya yang buruk ikut menaikkan arus, sehingga perbaikan faktor daya juga menurunkan rugi, topik yang dibahas pada Pertemuan 11.",
                   [("P_{rugi}", "Rugi daya total ketiga fasa (W)"), ("I_L", "Arus saluran (A)"), ("R", "Resistansi penghantar per fasa (Ω)"), ("P", "Daya yang disalurkan (W)"), ("V_L", "Tegangan antarfasa (V)"), (r"\cos\varphi", "Faktor daya")])
    rows = []
    for v in [20, 70, 150, 275, 500]:
        i = P_REF / (SQ3 * v * 1e3 * PF_REF)
        pr = 3 * i * i * R_REF
        ket = {20: "tidak layak: rugi melebihi daya kirim", 70: "terlalu boros untuk 100 MW", 150: "wajar untuk transmisi regional", 275: "efisien untuk jarak jauh", 500: "tulang punggung antarwilayah"}[v]
        rows.append([f"{v} kV", f"{ind(i, 1)} A", f"{ind(pr / 1e6, 2)} MW", f"{ind(pr / P_REF * 100, 2)}%", ket])
    isi += tabel([r"\(V_L\)", r"\(I_L\)", r"\(P_{rugi}\)", "Rugi (% dari 100 MW)", "Keterangan"], rows)
    isi += cards([
        ("🧱", "Isolasi dan Jarak Bebas", "Semakin tinggi tegangan, semakin panjang rentengan isolator, semakin lebar jarak antarkonduktor, dan semakin tinggi menara. Biaya konstruksi naik tajam.", None),
        ("🌩️", "Korona", "Pada tegangan ekstra tinggi, udara di sekitar konduktor dapat terionisasi (korona) sehingga menimbulkan rugi, bunyi desis, dan gangguan radio. Konduktor berkas (bundle) dipakai untuk menekannya.", None),
        ("🏗️", "Trafo di Kedua Ujung", "Setiap kenaikan tegangan menuntut transformator penaik dan penurun berkapasitas besar, lengkap dengan pemutus dan proteksi bertegangan tinggi.", None),
        ("🛣️", "Ruang Bebas Saluran", "Saluran bertegangan tinggi memerlukan jalur bebas bangunan di bawahnya. Pembebasan lahan sering menjadi kendala terbesar pembangunan SUTET.", None),
    ])
    isi += kotak("tip-box", "💡 <strong>Aturan Praktis:</strong> tingkat tegangan dipilih sebagai kompromi antara rugi, yang turun sebanding \\(1/V^2\\), dan biaya peralatan, yang naik bersama tegangan. Makin besar daya dan makin jauh jaraknya, makin tinggi tegangan yang ekonomis. Soal C11 meminta Anda menghitung tegangan minimum dari batas rugi, sedangkan C15 menghitung penghematan energi rugi per tahun bila tegangan dinaikkan.")
    m += bagian(4, "m-rugi", "Mengapa Transmisi<br>Memakai Tegangan Tinggi?",
                "Menyalurkan daya berarti mengalirkan arus melalui penghantar yang memiliki resistansi, dan setiap ampere menimbulkan panas \\(I^2R\\). Untuk daya yang sama, menaikkan tegangan mengecilkan arus, sehingga rugi turun sebanding kuadratnya. Arus saluran dihitung dengan Persamaan (5) dan rugi dayanya dengan Persamaan (6). Gambar 4 memperlihatkan betapa curamnya penurunan rugi itu.",
                isi, "RUGI SALURAN DAN TEGANGAN TINGGI")

    # 05
    isi = figure(5, "Putaran sinkron terhadap jumlah kutub", "Untuk menghasilkan 50 Hz, generator 2 kutub harus berputar 3000 rpm, sedangkan generator PLTA dengan puluhan kutub cukup berputar ratusan rpm mengikuti turbin air yang lambat.", gambar5())
    isi += formula(7, "Frekuensi Generator Sinkron", r"f = \dfrac{p \cdot n}{120}",
                   r"\(p\) = jumlah kutub (genap) &nbsp;·&nbsp; \(n\) = putaran (rpm) &nbsp;·&nbsp; \(f\) = frekuensi (Hz). Untuk \(f = 50\) Hz: generator 2 kutub harus berputar 3000 rpm, 4 kutub 1500 rpm, dan generator PLTA 40 kutub cukup 150 rpm.",
                   "Setiap pasang kutub yang melewati satu kumparan menghasilkan satu siklus tegangan. Turbin uap dan gas yang cepat memakai sedikit kutub; turbin air yang lambat memakai banyak kutub agar tetap menghasilkan 50 Hz.",
                   [("f", "Frekuensi tegangan (Hz)"), ("p", "Jumlah kutub rotor (selalu genap)"), ("n", "Putaran rotor (rpm)")])
    isi += formula(8, "Daya Poros, Torsi, dan Kecepatan Sudut", r"P_{mek} = T \cdot \omega, \qquad \omega = \dfrac{2\pi n}{60}, \qquad P_{listrik} = \eta_g\, P_{mek}",
                   rf"Generator 2 kutub 50 Hz berputar 3000 rpm atau \(\omega \approx 314{{,}}16\) rad/s. Untuk membangkitkan 250 MW dengan efisiensi generator 98,5%, turbin harus memberi torsi sekitar {ind(T8_CONTOH, 2)} kN·m.",
                   "Inilah jembatan antara mekanika dan tenaga listrik: daya listrik yang diminta beban muncul sebagai torsi lawan pada poros turbin. Bila beban naik tiba-tiba sementara uap atau air belum ditambah, torsi lawan melebihi torsi turbin dan rotor melambat.",
                   [("P_{mek}", "Daya mekanik poros (W)"), ("T", "Torsi poros (N·m)"), (r"\omega", "Kecepatan sudut (rad/s)"), ("n", "Putaran (rpm)"), (r"\eta_g", "Efisiensi generator"), ("P_{listrik}", "Daya listrik keluaran generator (W)")])
    isi += cards([
        ("🔥", "PLTU (Uap)", "Batubara atau biomassa memanaskan boiler; uap memutar turbin 3000 rpm. Efisiensi termalnya sekitar 33–40%. Andal untuk beban dasar, tetapi lambat menaikkan daya dan beremisi tinggi.", None),
        ("💨", "PLTG dan PLTGU", "Turbin gas dapat dinyalakan dalam hitungan menit sehingga cocok memikul beban puncak. Gas buangnya dapat dipakai membangkitkan uap (siklus kombinasi) dengan efisiensi mencapai 50–60%.", None),
        ("💧", "PLTA (Air)", "Energi potensial air memutar turbin berputaran rendah dengan efisiensi konversi sekitar 85–90%. Dayanya dapat diatur cepat, sehingga PLTA waduk sering dipakai menjaga frekuensi.", None),
        ("🌋", "PLTP (Panas Bumi)", "Uap dari perut bumi memutar turbin. Potensi panas bumi Indonesia termasuk yang terbesar di dunia, dan pembangkitnya stabil untuk memikul beban dasar.", None),
        ("☀️", "PLTS (Surya)", "Panel fotovoltaik mengubah cahaya langsung menjadi listrik DC yang lalu diubah inverter menjadi AC. Tanpa bagian berputar, keluarannya mengikuti cuaca dan hilang pada malam hari.", None),
        ("🛢️", "PLTD (Diesel)", "Mesin diesel memutar generator 4 kutub pada 1500 rpm. Mahal per kWh karena bahan bakar solar, tetapi mudah dipasang, sehingga masih banyak melayani pulau-pulau kecil.", None),
    ])
    isi += tabel(["Pembangkit", "Penggerak", "Putaran khas", "Kutub (50 Hz)", "Peran dalam sistem"], [
        ["PLTU", "Turbin uap", "3000 rpm", "2", "Beban dasar"],
        ["PLTGU", "Turbin gas + turbin uap", "3000 rpm", "2", "Beban menengah hingga puncak"],
        ["PLTA", "Turbin air", "100–600 rpm", "10–60", "Pengatur frekuensi, beban puncak"],
        ["PLTD", "Mesin diesel", "1500 rpm (juga 1000/750)", "4 (6/8)", "Sistem kecil, cadangan"],
        ["PLTB", "Turbin angin", "bervariasi", "— (melalui konverter)", "Energi terbarukan intermiten"],
    ])
    isi += kotak("info-box", "<strong>📌 Mengapa Frekuensi Menjadi Penanda Keseimbangan:</strong> seluruh generator dalam satu sistem berputar serempak (sinkron). Energi kinetik rotor-rotor inilah penyangga pertama ketika beban berubah. Beban naik → rotor melambat → frekuensi turun → pengatur (governor) turbin menambah uap, gas, atau air. Karena itu operator sistem memantau frekuensi detik demi detik: frekuensi yang jatuh jauh di bawah 50 Hz menandakan pembangkitan kurang dan dapat memicu pelepasan beban otomatis.")
    m += bagian(5, "m-pembangkit", "Pembangkit, Generator Sinkron,<br>dan Frekuensi",
                "Hampir seluruh listrik dunia dibangkitkan generator sinkron yang diputar turbin atau mesin. Kecepatan putar dan jumlah kutub generator menentukan frekuensi, dan frekuensi seluruh sistem yang saling terhubung bernilai sama. Hubungan kutub, putaran, dan frekuensi dituliskan pada Persamaan (7), sedangkan hubungan daya poros dengan torsi turbin pada Persamaan (8). Gambar 5 membandingkan putaran sinkron untuk berbagai jumlah kutub.",
                isi, "PEMBANGKIT DAN FREKUENSI")

    # 06
    isi = figure(6, "Kurva beban harian dan faktor beban", "Beban rendah dini hari, naik bersama aktivitas kerja, dan memuncak menjelang malam; jarak antara garis rata-rata dan garis puncak menunjukkan kapasitas yang hanya terpakai beberapa jam.", gambar6())
    isi += formula(9, "Faktor Beban (Load Factor)", r"LF = \dfrac{P_{rata}}{P_{puncak}} = \dfrac{E_{periode}}{P_{puncak} \cdot T}",
                   rf"\(E_{{periode}}\) = energi dalam periode \(T\) (jam). Sistem yang menyalurkan 820 MWh sehari dengan beban puncak 45 MW mempunyai \(P_{{rata}} \approx {ind(820 / 24, 2)}\) MW dan \(LF \approx {ind(LF_CONTOH, 2)}\%\).",
                   "Faktor beban yang tinggi berarti kurva beban datar: pembangkit dan jaringan terpakai merata sepanjang hari, sehingga biaya investasi per kWh lebih rendah. Faktor beban yang rendah berarti banyak kapasitas hanya dipakai beberapa jam saat puncak.",
                   [("LF", "Faktor beban"), ("P_{rata}", "Beban rata-rata (MW)"), ("P_{puncak}", "Beban puncak (MW)"), ("E_{periode}", "Energi dalam periode yang ditinjau (MWh)"), ("T", "Lama periode (jam), 24 untuk harian")])
    isi += formula(10, "Faktor Kapasitas Pembangkit", r"CF = \dfrac{E_{tahunan}}{P_{terpasang} \times 8760}",
                   rf"8760 adalah jumlah jam dalam setahun. PLTS 3 MWp yang menghasilkan 4200 MWh per tahun mempunyai \(CF \approx {ind(CF_CONTOH, 2)}\%\), sedangkan PLTU beban dasar dapat mencapai 70–80% bila dioperasikan terus-menerus.",
                   "Faktor kapasitas membandingkan energi yang benar-benar dihasilkan dengan energi seandainya pembangkit bekerja penuh sepanjang tahun. Nilai rendah pada PLTS bukan tanda kerusakan; matahari memang hanya bersinar efektif beberapa jam sehari.",
                   [("CF", "Faktor kapasitas"), ("E_{tahunan}", "Energi yang dihasilkan dalam setahun (MWh)"), ("P_{terpasang}", "Kapasitas terpasang (MW atau MWp)")])
    isi += cards([
        ("🌙", "Beban Dasar (Base Load)", "Bagian beban yang selalu ada sepanjang hari. Dipikul pembangkit yang murah per kWh tetapi lambat mengubah daya, seperti PLTU dan PLTP.", None),
        ("🌆", "Beban Puncak (Peak Load)", "Lonjakan beberapa jam, di banyak sistem PLN sekitar pukul 17.00–22.00. Dipikul pembangkit yang cepat dinyalakan, seperti PLTG, PLTA waduk, dan kini baterai.", None),
        ("📊", "Faktor Diversitas", "Tidak semua peralatan menyala bersamaan. Jumlah beban puncak masing-masing pelanggan selalu lebih besar daripada beban puncak gabungannya; itulah alasan trafo distribusi tidak perlu seukuran jumlah seluruh beban yang dilayaninya.", None),
        ("🧮", "Faktor Rugi (Loss Factor)", "Karena rugi sebanding \\(I^2\\), rugi rata-rata tidak sama dengan rugi pada beban rata-rata. Energi rugi tahunan dihitung dari rugi pada beban puncak dikali 8760 jam dan faktor rugi.", r"\(E_{rugi} = P_{rugi,puncak} \times 8760 \times LsF\)"),
    ], [("E_{rugi}", "Energi rugi tahunan (MWh)"), ("P_{rugi,puncak}", "Rugi daya pada beban puncak (MW)"), ("LsF", "Faktor rugi (loss factor), 0 sampai 1")])
    rows, jam = [], 0
    for d, p in BLOK:
        rows.append([f"{jam:02d}.00–{jam + d:02d}.00", f"{d} jam", f"{ind(p, 0)} MW", f"{ind(d * p, 0)} MWh"])
        jam += d
    rows.append(["<strong>Jumlah</strong>", "<strong>24 jam</strong>", f"puncak {ind(max(p for _, p in BLOK), 0)} MW", f"<strong>{ind(E_BLOK, 0)} MWh</strong>"])
    isi += tabel(["Periode", "Durasi", "Beban", "Energi"], rows)
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> beban rata-rata = {ind(E_BLOK, 0)} MWh / 24 jam ≈ {ind(E_BLOK / 24, 2)} MW, sehingga faktor beban ≈ {ind(E_BLOK / 24, 2)} / 70 ≈ {ind(E_BLOK / 24 / 70 * 100, 2)}%. Pola kurva bertingkat ini dipakai soal C13; bedanya, angka setiap periode di soal Anda diturunkan dari NIM.")
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> industri membayar tagihan berdasarkan energi (kWh) dan, untuk golongan tertentu, tarif waktu beban puncak (WBP) yang lebih mahal daripada luar waktu beban puncak (LWBP). Menggeser proses berat seperti pengisian tangki, pengecoran, atau pengisian baterai forklift ke luar jam puncak menaikkan faktor beban pabrik dan menurunkan biaya tanpa mengurangi produksi.")
    m += bagian(6, "m-beban", "Kurva Beban, Faktor Beban,<br>dan Faktor Kapasitas",
                "Beban listrik tidak pernah konstan. Ia rendah dini hari, naik saat industri dan kantor bekerja, dan memuncak menjelang malam ketika penerangan dan peralatan rumah tangga menyala bersamaan. Bentuk kurva ini menentukan berapa kapasitas pembangkit yang harus tersedia dan seberapa efisien kapasitas itu terpakai. Dua ukurannya dituliskan pada Persamaan (9) dan (10). Gambar 6 memperlihatkan contoh kurva beban harian.",
                isi, "KURVA BEBAN")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Aliran Energi dari Bahan Bakar ke Konsumen \(\eta_{total} = \eta_p\,\eta_{trf}\,\eta_t\,\eta_d\)", "cvRantai",
                     [("sl_ra_p", "v_ra_p", "Efisiensi pembangkit (%)", 25, 60, 0.5, 38, "38.0"), ("sl_ra_t", "v_ra_t", "Efisiensi transmisi (%)", 90, 99.5, 0.1, 96.5, "96.5"), ("sl_ra_d", "v_ra_d", "Efisiensi distribusi (%)", 85, 99, 0.1, 93, "93.0")],
                     "btnRantai", "toggleRantai", "rantaiInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Lebar pita menyatakan energi yang tersisa pada tiap tahap, dimulai dari 100 satuan energi bahan bakar; pita merah yang turun adalah rugi di tahap itu. Transformator dianggap 98,5%.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Pita menyempit paling tajam di pembangkit</strong>, karena sebagian besar energi bahan bakar terbuang sebagai panas di kondensor dan cerobong. (2) Menaikkan efisiensi pembangkit dari 38% ke 45% menambah energi sampai konsumen jauh lebih banyak daripada menaikkan efisiensi distribusi dengan besar yang sama. (3) Bandingkan angka pada readout dengan hasil soal C6 dan C12.")
    isi += anim_panel(2, "amber", r"Rugi Saluran terhadap Tegangan \(P_{rugi} = P^2R/(V_L^2\cos^2\varphi)\)", "cvRugi",
                      [("sl_ru_p", "v_ru_p", "Daya disalurkan P (MW)", 10, 300, 5, 100, "100"), ("sl_ru_r", "v_ru_r", "Resistansi R (Ω/fasa)", 1, 20, 0.5, 5, "5.0"), ("sl_ru_v", "v_ru_v", "Tegangan V_L (kV)", 20, 500, 5, 150, "150")],
                      "btnRugi", "toggleRugi", "rugiInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kurva menyatakan rugi saluran sebagai persen daya kirim untuk setiap tegangan (faktor daya 0,9); garis tegak adalah tingkat tegangan standar dan garis merah adalah batas rugi 3%. Titik berdenyut menandai tegangan pilihan Anda.<br>Amati: (1) <strong style=\"color:var(--amber)\">Menggandakan tegangan memangkas rugi menjadi seperempat</strong>. (2) Menggandakan daya pada tegangan yang sama menggandakan persentase rugi, karena rugi sebanding \\(P^2\\). (3) Cari tegangan terendah yang masih di bawah garis 3%; itulah yang dihitung soal C11.")
    isi += anim_panel(3, "violet", r"Tegangan Tiga Fasa Seimbang dan Fasornya \(v_R + v_S + v_T = 0\)", "cvFasa",
                      [("sl_fa_f", "v_fa_f", "Frekuensi f (Hz)", 45, 55, 0.5, 50, "50.0"), ("sl_fa_v", "v_fa_v", "Tegangan fasa V_f (V rms)", 100, 300, 5, 230, "230")],
                      "btnFasa", "toggleFasa", "fasaInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Di kiri, tiga fasor berputar dengan jarak 120°; proyeksi vertikal ujung setiap fasor adalah nilai sesaat tegangannya, yang tergambar sebagai gelombang di kanan. Putarannya diperlambat agar dapat diikuti mata.<br>Amati: (1) Pada setiap saat, jumlah ketiga tegangan <strong style=\"color:var(--violet)\">tepat nol</strong> (garis putih mendatar), sebab itulah beban tiga fasa seimbang tidak memerlukan arus netral. (2) Nilai puncak adalah \\(\\sqrt{2}\\) kali nilai rms. (3) Menaikkan frekuensi memperpendek periode \\(T = 1/f\\).")
    isi += anim_panel(4, "green", r"Kurva Beban Harian, Faktor Beban, dan Cadangan \(LF = P_{rata}/P_{puncak}\)", "cvBeban",
                      [("sl_be_puncak", "v_be_puncak", "Beban puncak malam (MW)", 40, 120, 1, 80, "80"), ("sl_be_dasar", "v_be_dasar", "Beban dasar dini hari (MW)", 10, 60, 1, 30, "30"), ("sl_be_kap", "v_be_kap", "Kapasitas terpasang (MW)", 60, 200, 5, 120, "120")],
                      "btnBeban", "toggleBeban", "bebanInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Kurva biru adalah beban setiap jam, garis hijau beban rata-rata, garis merah beban puncak, dan garis jingga kapasitas pembangkit terpasang. Kursor tegak menyapu 24 jam.<br>Amati: (1) <strong style=\"color:var(--green)\">Menaikkan beban dasar tanpa mengubah puncak menaikkan faktor beban</strong>, karena kurva menjadi lebih datar. (2) Faktor kapasitas selalu lebih kecil daripada faktor beban bila kapasitas terpasang melebihi beban puncak. (3) Jika garis merah menyentuh garis jingga, cadangan habis dan sistem rawan padam saat satu pembangkit gangguan.")
    isi += anim_panel(5, "pink", r"Generator Sinkron: Jumlah Kutub, Putaran, dan Frekuensi \(f = p\,n/120\)", "cvGen",
                      [("sl_ge_p", "v_ge_p", "Jumlah kutub p", 2, 48, 2, 4, "4"), ("sl_ge_n", "v_ge_n", "Putaran n (rpm)", 100, 3600, 10, 1500, "1500")],
                      "btnGen", "toggleGen", "genInfo",
                      "<strong>📊 Cara Membaca Animasi 5:</strong> Di kiri, rotor dengan kutub utara (merah) dan selatan (biru) berputar di dalam stator; di kanan, gelombang tegangan yang terinduksi pada satu kumparan stator. Warna readout hijau berarti frekuensi berada dalam ±0,5 Hz dari 50 Hz.<br>Amati: (1) Setiap <strong style=\"color:var(--pink)\">pasang kutub</strong> yang lewat menghasilkan satu siklus penuh. (2) Dengan 2 kutub, 50 Hz baru tercapai pada 3000 rpm; dengan 40 kutub cukup 150 rpm. (3) Genset 4 kutub yang melambat ke 1450 rpm menghasilkan sekitar 48,3 Hz; itulah yang dihitung soal C7.")
    isi += kotak("info-box", "<strong>🔍 Latihan Mandiri:</strong> atur Animasi 2 pada 100 MW dan 5 Ω/fasa, lalu catat rugi pada 70, 150, 275, dan 500 kV. Bandingkan hasilnya dengan tabel di Bagian 04; keduanya harus sama. Setelah itu gandakan resistansi dan jelaskan dengan Persamaan (6) mengapa persentase rugi ikut berlipat dua.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Sistem Tenaga Listrik",
                "Geser parameter dan amati langsung bagaimana efisiensi setiap tahap, tegangan saluran, frekuensi, bentuk kurva beban, dan jumlah kutub generator mengubah perilaku sistem. Lima animasi ini adalah jembatan antara Persamaan (1)–(10) dan intuisi teknik yang Anda perlukan saat mengerjakan tugas.",
                isi, "ANIMASI")

    # 08 — tren
    isi = cards([
        ("🔗", "Sistem Interkoneksi Jawa–Madura–Bali", "Pembangkit dan beban terbesar di Indonesia saling terhubung melalui jaringan 500 kV. Gangguan di satu titik dapat merambat luas, sehingga koordinasi operasi dan proteksi sangat penting.", None),
        ("🏝️", "Sistem Terisolasi", "Banyak pulau dilayani sistem kecil berbasis PLTD dengan biaya per kWh jauh lebih tinggi daripada di Jawa. Menggantinya dengan PLTS dan baterai menjadi salah satu upaya utama mengurangi pemakaian solar.", None),
        ("🌱", "Transisi Energi", "Kebijakan Energi Nasional menargetkan porsi energi baru dan terbarukan 23% pada 2025, dan pemerintah menetapkan target emisi nol bersih (net zero emission) pada 2060.", None),
        ("📡", "Jaringan Cerdas (Smart Grid)", "Sensor, meter pintar, dan komunikasi data memungkinkan operator memantau dan mengatur jaringan secara waktu nyata, termasuk mengintegrasikan PLTS atap milik pelanggan.", None),
        ("🚗", "Kendaraan Listrik", "Pengisian kendaraan listrik menambah beban baru yang waktunya dapat diatur. Bila diisi larut malam di luar jam puncak, kendaraan listrik justru dapat menaikkan faktor beban sistem.", None),
        ("🔋", "Penyimpanan Energi", "Baterai dan PLTA pompa (pumped storage) menyimpan energi saat berlebih dan melepasnya saat puncak, sehingga mengimbangi sifat intermiten PLTS dan PLTB.", None),
    ])
    isi += tabel(["Tantangan", "Penyebab", "Arah solusi teknis"], [
        ["Keluaran PLTS dan PLTB berfluktuasi", "Cuaca, awan, dan kecepatan angin", "Baterai, pembangkit fleksibel, prakiraan cuaca"],
        ["Susut jaringan", r"Rugi \(I^2R\) serta susut nonteknis", "Tegangan lebih tinggi, perbaikan faktor daya, meter pintar"],
        ["Frekuensi mudah berubah pada sistem kecil", "Inersia rotor generator yang kecil", "Pengatur cepat, baterai, pelepasan beban otomatis"],
        ["Beban puncak menjelang malam", "Pola pemakaian rumah tangga", "Tarif waktu pemakaian, penyimpanan energi"],
    ])
    isi += kotak("info-box", "<strong>🔧 Peran Lulusan Teknik Mesin:</strong> sebagian besar mesin di sistem tenaga adalah mesin fluida dan termal: boiler, turbin uap, turbin gas, turbin air, mesin diesel, pompa, kompresor, dan sistem pendingin. Di sisi pemakaian, motor listrik menyerap hampir separuh listrik dunia. Memahami sisi listriknya membuat insinyur mesin mampu merancang, mengoperasikan, dan mengefisienkan sistem secara utuh, bukan hanya salah satu sisinya.")
    isi += kotak("tip-box", "💡 <strong>Menghubungkan ke Pertemuan Berikutnya:</strong> Pertemuan 2 membedah komponen-komponen yang disebut di modul ini, lengkap dengan spesifikasi dan fungsinya. Pertemuan 3–5 memberi alat hitung jaringan DC dan AC yang diperlukan untuk menganalisis setiap bagian itu secara kuantitatif. Modul 1 adalah peta jalannya.")
    m += bagian(8, "m-tren", "Sistem Tenaga Listrik Indonesia<br>dan Arah Perkembangannya",
                "Indonesia adalah negara kepulauan, sehingga sistem tenaga listriknya terdiri atas satu sistem besar yang saling terhubung di Jawa–Madura–Bali dan banyak sistem yang lebih kecil di pulau-pulau lain. Di atas kerangka itu berlangsung tiga perubahan besar: bauran energi terbarukan, jaringan cerdas, dan elektrifikasi transportasi serta industri. Memahami arah ini membantu menempatkan setiap perhitungan di mata kuliah ini dalam konteks nyata.",
                isi, "TREN SISTEM TENAGA LISTRIK")

    # 09 — Python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Instal sekali saja dengan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">pip install numpy matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>, jadi pastikan hasil akhirnya benar-benar dicetak dengan angka desimal secukupnya, bukan hanya digambar sebagai grafik.")
    isi += kode("Cell 1 — Besaran Dasar: Daya, Energi, Biaya, dan Arus Saluran", '''import numpy as np

# ═══ Beban satu fasa (Persamaan 3) ═══
V, I, pf = 230.0, 5.5, 1.0            # tegangan (V), arus (A), faktor daya
P1 = V * I * pf                        # daya aktif (W)
print(f"Daya satu fasa      P  = {P1:.4f} W")

# ═══ Energi dan biaya bulanan (Persamaan 1) ═══
P_kW, jam, hari, tarif = 1.5, 5, 30, 1444.70
E = P_kW * jam * hari                  # kWh
print(f"Energi sebulan      E  = {E:.4f} kWh")
print(f"Biaya sebulan       Rp = {E * tarif:.2f}")

# ═══ Motor tiga fasa (Persamaan 4) ═══
VL, IL, pf3 = 380.0, 25.0, 0.85
P3 = np.sqrt(3) * VL * IL * pf3 / 1000   # kW
print(f"Daya tiga fasa      P  = {P3:.4f} kW")

# ═══ Arus saluran penyulang 20 kV (Persamaan 5) ═══
P_MW, VL_kV, pf_s = 6.25, 20.0, 0.9
IL_s = P_MW * 1e6 / (np.sqrt(3) * VL_kV * 1e3 * pf_s)
print(f"Arus saluran        IL = {IL_s:.4f} A")''')
    isi += kode("Cell 2 — Rugi Saluran terhadap Tegangan dan Tegangan Minimum", '''import numpy as np
import matplotlib.pyplot as plt

P, pf, R = 100e6, 0.9, 5.0             # W, faktor daya, ohm per fasa
V_kV = np.array([20, 70, 150, 275, 500])
IL = P / (np.sqrt(3) * V_kV * 1e3 * pf)
P_rugi = 3 * IL**2 * R                 # W (Persamaan 6)
for v, i, pr in zip(V_kV, IL, P_rugi):
    print(f"{v:4d} kV  IL = {i:9.2f} A  rugi = {pr/1e6:8.3f} MW ({pr/P*100:7.3f} %)")

# Tegangan minimum agar rugi <= 3% dari P:  P^2 R / (V^2 cos^2) = k P
k = 0.03
V_min = np.sqrt(P * R / (k * pf**2))
print(f"Tegangan minimum untuk rugi 3% = {V_min/1e3:.4f} kV")

V = np.linspace(40, 500, 400)
persen = P * R / ((V * 1e3)**2 * pf**2) * 100
plt.figure(figsize=(8, 4))
plt.plot(V, persen)
plt.axhline(3, ls='--', color='tab:red', label='batas 3%')
plt.ylim(0, 20); plt.xlabel('Tegangan saluran (kV)'); plt.ylabel('Rugi (% dari P)')
plt.title('Rugi turun sebanding 1/V^2'); plt.grid(True); plt.legend(); plt.show()''')
    isi += kode("Cell 3 — Kurva Beban Bertingkat, Faktor Beban, Faktor Kapasitas, dan Energi Rugi", '''import numpy as np

# Kurva beban bertingkat: (durasi jam, beban MW)
blok = [(6, 25.0), (11, 45.0), (5, 70.0), (2, 35.0)]
E_hari = sum(d * p for d, p in blok)        # MWh
P_puncak = max(p for _, p in blok)
P_rata = E_hari / 24
LF = P_rata / P_puncak * 100                # Persamaan 9
print(f"Energi harian    = {E_hari:.4f} MWh")
print(f"Beban rata-rata  = {P_rata:.4f} MW")
print(f"Faktor beban     = {LF:.4f} %")

# Faktor kapasitas (Persamaan 10)
P_terpasang, E_tahun = 3.0, 4200.0          # MWp, MWh per tahun
CF = E_tahun / (P_terpasang * 8760) * 100
print(f"Faktor kapasitas = {CF:.4f} %")

# Energi rugi tahunan dari rugi pada beban puncak dan faktor rugi
P_rugi_puncak, LsF = 0.30, 0.45             # MW, faktor rugi
E_rugi = P_rugi_puncak * 8760 * LsF
print(f"Energi rugi      = {E_rugi:.4f} MWh per tahun")''')
    isi += kode("Cell 4 — Efisiensi Berantai, Kebutuhan Batubara, dan Torsi Turbin", '''import numpy as np

# Efisiensi berantai (Persamaan 2)
eta = {'pembangkit': 0.38, 'trafo': 0.985, 'transmisi': 0.965, 'distribusi': 0.93}
eta_total = np.prod(list(eta.values()))
print(f"Efisiensi total  = {eta_total*100:.4f} %")

# Kebutuhan batubara untuk energi konsumen tertentu (telusur mundur)
E_konsumen = 420.0                          # MWh per hari
eta_d, eta_t, eta_th = 0.93, 0.96, 0.35
E_bb_MJ = E_konsumen / (eta_d * eta_t * eta_th) * 3600   # 1 MWh = 3600 MJ
HV = 5000 * 4.1868 / 1000                   # MJ/kg (5000 kcal/kg)
m_ton = E_bb_MJ / HV / 1000
print(f"Batubara         = {m_ton:.4f} ton per hari")

# Torsi turbin untuk generator 2 kutub 50 Hz (Persamaan 7 dan 8)
p, f, P_listrik, eta_g = 2, 50, 250e6, 0.985
n = 120 * f / p                             # rpm
omega = 2 * np.pi * n / 60                  # rad/s
T = P_listrik / eta_g / omega               # N·m
print(f"n = {n:.0f} rpm, omega = {omega:.4f} rad/s, T = {T/1e3:.4f} kN·m")''')
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell di atas dan pastikan angkanya sesuai dengan yang dibahas di Bagian 02–06, misalnya daya motor tiga fasa ≈ " + ind(P3_CONTOH, 2) + " kW dan arus penyulang ≈ " + ind(I5_CONTOH, 1) + " A. Kalau sudah cocok, sebagian besar soal komputasi tinggal mengganti parameter atau menyusun ulang rumus yang sama. Cell 2–4 sudah memuat pola penyelesaian soal Hard C11–C15, maka pahami langkah-langkahnya, jangan hanya menyalin angkanya.")
    m += bagian(9, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut adalah fondasi kode yang dipakai untuk mengerjakan tugas. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya untuk bereksperimen. Kode ditulis eksplisit dan bertahap, bukan diringkas, supaya setiap langkah perhitungannya dapat Anda telusuri kembali ke persamaan di modul.",
                isi, "IMPLEMENTASI PYTHON")

    # Pustaka
    refs = pm_ref(1, "cyan", "14,165,233", "A. von Meier", "Electric Power Systems: A Conceptual Introduction", ". Wiley-IEEE Press, 2006.", "Bab 1–3: gambaran sistem tenaga, dasar listrik AC, dan generator dengan matematika ringan; bacaan pembuka yang sangat baik.")
    refs += pm_ref(2, "amber", "249,115,22", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 1–2: sejarah dan struktur sistem tenaga, daya kompleks, dan sistem tiga fasa seimbang.")
    refs += pm_ref(3, "violet", "168,85,247", "H. Saadat", "Power System Analysis", ". McGraw-Hill, 1999.", "Bab 1–2: pengantar sistem tenaga dan konsep daya yang dipakai hingga analisis aliran daya pada Pertemuan 15.")
    refs += pm_ref(4, "green", "0,224,158", "J. J. Grainger &amp; W. D. Stevenson Jr.", "Power System Analysis", ". McGraw-Hill, 1994.", "Rujukan klasik untuk konsep dasar, representasi sistem, dan besaran per unit.")
    refs += pm_ref(5, "pink", "236,72,153", "A. Arismunandar &amp; S. Kuwahara", "Buku Pegangan Teknik Tenaga Listrik, Jilid 2: Saluran Transmisi", " (Cet. 7). Pradnya Paramita, 2004.", "Rujukan berbahasa Indonesia untuk saluran transmisi dan tingkat tegangan yang dipakai di Indonesia.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti yang mendasari materi pengertian sistem tenaga listrik, tingkat tegangan, daya tiga fasa, rugi saluran, pembangkit, dan kurva beban. Dianjurkan memiliki akses ke setidaknya satu buku utama untuk pendalaman mandiri sepanjang semester.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> Statistik PLN dan dokumen RUPTL (Rencana Usaha Penyediaan Tenaga Listrik) memuat data kapasitas pembangkit, panjang jaringan, susut, dan beban puncak setiap sistem di Indonesia. Data ini berguna untuk menguji apakah angka hasil hitungan Anda masuk akal. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 1 — Konsep Dasar Sistem Tenaga Listrik · Teknik Tenaga Listrik · S1 Teknik Mesin · Universitas Mercu Buana</p>
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">P = √3·V·I·cos φ</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">P_rugi = 3·I²·R</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">f = p·n/120</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">T = P/ω</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">LF = P_rata/P_puncak</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 1 · Konsep Dasar Sistem Tenaga Listrik</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 1</span><br><em>Konsep Dasar</em><br>Tenaga Listrik</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar bagian sistem tenaga listrik, daya satu dan tiga fasa, rugi saluran, generator dan frekuensi, serta kurva beban. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Urutan aliran energi listrik dari sumber sampai pemakai pada <strong>sistem tenaga listrik</strong> adalah...",
     ["Distribusi → transmisi → pembangkitan → beban", "Pembangkitan → transmisi → distribusi → beban", "Pembangkitan → distribusi → beban → transmisi", "Transmisi → pembangkitan → beban → distribusi"],
     "Urutan pembangkitan–transmisi–distribusi–beban"),
    ("Alasan utama daya listrik disalurkan pada <strong>tegangan tinggi</strong> adalah...",
     ["Agar frekuensi sistem lebih stabil", "Agar faktor daya beban naik", "Agar arus saluran kecil sehingga rugi \\(I^2R\\) turun", "Agar penyaluran tidak memerlukan transformator"],
     "Alasan transmisi bertegangan tinggi"),
    ("Frekuensi nominal sistem tenaga listrik PLN di Indonesia adalah...",
     ["50 Hz", "60 Hz", "100 Hz", "25 Hz"],
     "Frekuensi nominal sistem PLN"),
    ("Tegangan nominal jaringan <strong>distribusi primer (tegangan menengah)</strong> yang umum dipakai PLN adalah...",
     ["380 V", "500 kV", "150 kV", "20 kV"],
     "Tegangan distribusi primer"),
    ("Satuan energi yang tercantum pada <strong>tagihan listrik</strong> pelanggan adalah...",
     ["kW", "kVA", "kWh", "kVAR"],
     "Satuan energi pada tagihan"),
    ("Daya aktif sistem tiga fasa seimbang dengan tegangan antarfasa \\(V_L\\), arus saluran \\(I_L\\), dan faktor daya \\(\\cos\\varphi\\) adalah...",
     ["\\(P = V_L I_L \\cos\\varphi\\)", "\\(P = \\sqrt{3}\\, V_L I_L \\cos\\varphi\\)", "\\(P = 3\\, V_L I_L\\)", "\\(P = \\sqrt{3}\\, V_L I_L \\sin\\varphi\\)"],
     "Rumus daya aktif tiga fasa"),
    ("Fungsi utama <strong>gardu induk</strong> dalam sistem tenaga listrik adalah...",
     ["Mengubah tingkat tegangan (misalnya 150 kV ke 20 kV) serta menjadi tempat pemutusan dan proteksi", "Membangkitkan energi listrik dari bahan bakar", "Mengukur pemakaian energi setiap rumah", "Menyimpan energi listrik untuk beban puncak"],
     "Fungsi gardu induk"),
    ("<strong>Faktor beban (load factor)</strong> didefinisikan sebagai...",
     ["Beban puncak dibagi beban rata-rata", "Beban rata-rata dibagi kapasitas terpasang", "Energi tahunan dibagi 8760 jam", "Beban rata-rata dibagi beban puncak"],
     "Definisi faktor beban"),
    ("Generator sinkron <strong>2 kutub</strong> yang terhubung ke sistem 50 Hz berputar pada kecepatan...",
     ["1500 rpm", "3000 rpm", "50 rpm", "6000 rpm"],
     "Putaran sinkron generator 2 kutub"),
    ("Tantangan utama mengintegrasikan <strong>PLTS dan PLTB</strong> dalam jumlah besar ke sistem tenaga listrik adalah...",
     ["Keluarannya berfluktuasi mengikuti cuaca sehingga memerlukan penyimpanan energi, cadangan fleksibel, dan jaringan cerdas", "Membuat frekuensi sistem berubah menjadi 60 Hz", "Tidak dapat dihubungkan ke jaringan tegangan menengah", "Selalu menurunkan faktor daya sistem menjadi nol"],
     "Tantangan integrasi PLTS dan PLTB"),
]


def mc_block():
    out = '''  <!-- ─── PILIHAN GANDA ─── -->
  <div class="q-section">
    <div class="q-type-badge badge-mc">🅐 BAGIAN A — Pilihan Ganda · 10 Soal · @1 Poin</div>
'''
    for i, (q, opsi, _) in enumerate(MC, 1):
        rows = "\n".join(f'        <div class="radio-option" onclick="selectMC(\'mc{i}\',this)"><div class="radio-circle"></div>({"ABCD"[k]}) &nbsp; {o}</div>' for k, o in enumerate(opsi))
        out += f'''
    <!-- MC {i} -->
    <div class="mc-card reveal">
      <div class="mc-header">
        <div class="mc-num">{i:02d}</div>
        <div class="mc-q">{q}</div>
        <div class="mc-pts">1 poin</div>
      </div>
      <div class="radio-group" id="rg-mc{i}">
{rows}
      </div>
      <button class="mc-submit" id="sub-mc{i}" onclick="checkMC('mc{i}')" disabled>Periksa Jawaban</button>
      <div class="feedback" id="fb-mc{i}"></div>
    </div>
'''
    out += "  </div>\n"
    return out


COMP_EZ_LABELS = ["Daya aktif satu fasa P = V·I·cos φ", "Energi dan biaya listrik bulanan", "Daya aktif motor tiga fasa", "Arus saluran penyulang 20 kV",
                  "Rugi daya saluran 3·I²·R", "Efisiensi berantai bahan bakar–konsumen", "Frekuensi generator f = p·n/120", "Faktor beban harian",
                  "Faktor kapasitas PLTS", "Rugi saluran sebagai persen daya kirim"]
COMP_HARD_LABELS = ["Tegangan saluran minimum untuk rugi ≤ 3%", "Kebutuhan batubara PLTU per hari", "Energi dan faktor beban kurva bertingkat",
                    "Torsi poros turbin–generator", "Penghematan energi rugi 20 kV → 70 kV"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 2, 3: 0}


def chip(teks, rgb, warna):
    return f'<span style="font-family:\'JetBrains Mono\',monospace;font-size:12px;background:rgba({rgb},.07);border:1px solid rgba({rgb},.18);color:var(--{warna});padding:6px 12px;border-radius:8px;">{teks}</span>'


def fq(n, rgb, warna, judul, isi, chips, poll_q, opsi, fb_r, fb_w, placeholder):
    ops = "\n".join(f'            <div class="p-opt" onclick="voteForum({n},this,{k})"><div class="p-circle"></div>{o}</div>' for k, o in enumerate(opsi))
    ch = "\n".join("          " + chip(c, rgb, warna) for c in chips)
    return f'''  <!-- Pertanyaan {n} -->
  <div class="fq-card reveal" id="fq{n}">
    <div class="fq-head" onclick="toggleFQ('fq{n}')">
      <div class="fq-num" style="background:rgba({rgb},.1);border:1px solid rgba({rgb},.2);color:var(--{warna})">{n:02d}</div>
      <h3>{judul}</h3>
      <span class="fq-arrow">›</span>
    </div>
    <div class="fq-body">
      <div class="fq-inner">
        <p style="color:var(--muted);font-size:14px;margin-bottom:12px">{isi}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
{ch}
        </div>

        <div class="poll">
          <div class="poll-q">QUICK CHECK — {poll_q}</div>
          <div class="poll-opts" id="fp{n}">
{ops}
          </div>
          <div class="p-fb r" id="fp{n}r">{fb_r}</div>
          <div class="p-fb w" id="fp{n}w">{fb_w}</div>
        </div>

        <textarea class="fq-textarea" id="ans-fq{n}" placeholder="Tulis jawaban diskusi Anda di sini (minimal 30 kata)...&#10;&#10;{placeholder}" oninput="checkForumReady()"></textarea>
        <div id="wc-fq{n}" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:6px;text-align:right;">0 / min 30 kata</div>
      </div>
    </div>
  </div>

'''


FQ_JUDUL = [
    "Petakan bagian-bagian sistem tenaga listrik di pulau ini dan bandingkan dengan sistem interkoneksi Jawa–Bali",
    "Mengapa menaikkan tegangan penyulang dari 6 kV ke 20 kV dapat mengatasi tegangan rendah dan menghemat solar?",
    "Seberapa efektif PLTS 3 MWp menggantikan solar bila dilihat dari kurva bebannya?",
]
FQ_RINGKAS = [
    "Sebutkan unsur pembangkitan, penaikan tegangan, penyaluran, penurunan tegangan, dan beban pada pulau ini beserta tegangannya. Jelaskan satu perbedaan penting sistem terisolasi dibanding sistem interkoneksi Jawa&ndash;Madura&ndash;Bali.",
    "Hitung perbandingan arus dan rugi daya pada 6 kV dan 20 kV untuk daya, faktor daya, dan penghantar yang sama. Kaitkan penurunan arus dengan jatuh tegangan di ujung saluran dan dengan konsumsi solar PLTD.",
    "Hitung faktor beban sistem dan faktor kapasitas PLTD. Bandingkan jam produksi PLTS dengan jam beban puncak, lalu jelaskan peran baterai dan mengapa PLTD mungkin tetap diperlukan.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            "Sebutkan unsur <em>pembangkitan</em>, <em>penaikan tegangan</em>, <em>penyaluran</em>, <em>penurunan tegangan</em>, dan <em>beban</em> pada pulau ini (lihat Bagian 01 dan 02). Lalu jelaskan satu perbedaan penting antara sistem terisolasi seperti ini dan sistem interkoneksi Jawa–Madura–Bali, misalnya dalam hal cadangan daya atau kestabilan frekuensi (Bagian 05 dan 08).",
            ["pembangkitan → penyaluran → beban", "400 V → 6 kV → 400 V", "terisolasi ≠ interkoneksi"],
            "Komponen yang menaikkan tegangan keluaran generator PLTD dari 400 V ke tegangan penyulang adalah...",
            ["Kabel penyulang 9 km menuju kawasan cold storage", "Transformator penaik (step-up) di lokasi PLTD", "Trafo distribusi di kawasan cold storage", "Pemutus tenaga (PMT) pada rel PLTD"],
            "✅ Tepat! Tegangan dinaikkan oleh <strong>transformator penaik</strong> di sisi pembangkit, sama seperti trafo step-up pada PLTU besar. Trafo distribusi di kawasan selatan justru melakukan kebalikannya, yaitu menurunkan tegangan ke 400 V; kabel hanya menyalurkan, dan PMT hanya memutus atau menyambung.",
            "❌ Perhatikan arah perubahan tegangannya: dari 400 V <em>naik</em> ke tegangan penyulang. Hanya transformator yang dapat mengubah tingkat tegangan AC, dan yang dipasang di sisi pembangkit adalah trafo penaik. Lihat kembali Gambar 1 dan Bagian 02.",
            "Petunjuk: (1) Daftarkan bagian-bagian sistem pulau beserta tegangannya. (2) Bandingkan dengan rantai sistem Jawa–Bali. (3) Jelaskan satu konsekuensi dari sistem yang terisolasi.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            "Anggap daya yang disalurkan, faktor daya, dan penghantar tidak berubah. Gunakan Persamaan (5) dan (6) untuk menjelaskan berapa kali arus dan rugi daya berubah bila tegangan dinaikkan dari 6 kV ke 20 kV. Kaitkan juga penurunan arus dengan jatuh tegangan di ujung saluran, lalu jelaskan mengapa rugi yang lebih kecil berarti solar yang lebih sedikit.",
            ["I ∝ 1/V", "P_rugi ∝ 1/V²", "rugi → solar terbakar sia-sia"],
            "Dengan daya, faktor daya, dan penghantar yang sama, menaikkan tegangan dari 6 kV ke 20 kV membuat rugi daya saluran menjadi sekitar...",
            ["0,30 kali semula, turun sebanding tegangan", "3,33 kali semula", "0,09 kali semula, turun sebanding kuadrat tegangan", "Tetap, karena daya yang disalurkan sama"],
            "✅ Tepat! Arus turun menjadi \\(6/20 = 0{,}3\\) kali, dan rugi \\(3I^2R\\) turun sebanding kuadratnya: \\(0{,}3^2 = 0{,}09\\) kali. Rugi saluran berkurang sekitar 91%, sehingga lebih banyak energi dari solar yang terbakar benar-benar sampai ke pelanggan.",
            "❌ Ingat bahwa rugi sebanding <em>kuadrat</em> arus, dan arus berbanding terbalik dengan tegangan. Daya yang disalurkan memang sama, tetapi arus yang membawanya jauh lebih kecil. Lihat Persamaan (6) dan tabel di Bagian 04.",
            "Petunjuk: (1) Hitung perbandingan arus dan rugi pada 6 kV dan 20 kV. (2) Jelaskan hubungan arus dengan jatuh tegangan di ujung saluran. (3) Kaitkan penurunan rugi dengan konsumsi solar PLTD.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            "Hitung faktor beban sistem pulau dengan Persamaan (9) dan faktor kapasitas PLTD dengan Persamaan (10), dengan anggapan PLTD memikul seluruh beban. Lalu bandingkan jam produksi PLTS (sekitar 08.00–16.00) dengan jam beban puncak pada grafik forum di atas. Apakah PLTS saja cukup menggantikan PLTD pada malam hari, dan apa peran baterai dalam usulan tersebut?",
            ["LF = 2,5/4,2", "CF = 2,5/6", "puncak malam ≠ jam surya"],
            "Berapa faktor beban sistem pulau ini?",
            ["≈ 59,5%, beban rata-rata dibagi beban puncak", "≈ 168%, beban puncak dibagi beban rata-rata", "≈ 41,7%, beban rata-rata dibagi kapasitas PLTD", "≈ 70%, beban puncak dibagi kapasitas PLTD"],
            "✅ Tepat! \\(LF = 2{,}5/4{,}2 \\approx 59{,}5\\%\\). Nilai 41,7% adalah <strong>faktor kapasitas</strong> PLTD bila ia memikul seluruh beban, besaran yang berbeda karena pembaginya kapasitas terpasang, bukan beban puncak.",
            "❌ Faktor beban membandingkan beban rata-rata dengan beban <em>puncak</em> pada periode yang sama, sehingga nilainya tidak pernah melebihi 100%. Membagi dengan kapasitas PLTD menghasilkan faktor kapasitas, besaran yang lain. Lihat Persamaan (9) dan (10).",
            "Petunjuk: (1) Hitung faktor beban dan faktor kapasitas PLTD. (2) Bandingkan jam produksi PLTS dengan jam beban puncak. (3) Jelaskan peran baterai dan mengapa PLTD mungkin tetap diperlukan sebagai cadangan.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">P_rugi ∝ 1/V²</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">LF = P_rata/P_puncak</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">CF = E/(P·8760)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">PLTD → PLTS + baterai</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 1 · Konsep Dasar Sistem Tenaga Listrik</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Listrik untuk<br><em>Pulau Kecil</em></h1>
    <p class="hero-sub">Analisis sistem kelistrikan sebuah pulau yang masih bergantung pada PLTD. Terapkan kosakata Pertemuan 1 — bagian-bagian sistem, tegangan dan rugi saluran, serta faktor beban dan faktor kapasitas — untuk menilai usulan perbaikannya.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Pulau yang Bergantung pada Solar —<br>Menilai Usulan Perbaikan Sistem</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS SISTEM TENAGA LISTRIK</div>
    <p>
      Sebuah <strong style="color:var(--amber)">pulau berpenduduk sekitar 12.000 jiwa</strong> dilayani satu <strong style="color:var(--cyan)">PLTD berkapasitas 6 MW</strong> (generator 400 V) di pelabuhan sisi utara. Kawasan <strong>cold storage pengolahan ikan</strong>, beban terbesar di pulau itu, berada <strong style="color:var(--pink)">9 km di selatan</strong> dan dipasok melalui penyulang tiga fasa lama bertegangan <strong>6 kV</strong>.
    </p>
    <p style="margin-top:12px">
      Data sepekan terakhir menunjukkan <strong style="color:var(--cyan)">beban puncak 4,2 MW</strong> pada pukul 18.00–22.00 dan <strong style="color:var(--cyan)">beban rata-rata 2,5 MW</strong>. Pelanggan di ujung selatan sering mengeluh tegangan rendah, dan biaya solar menyedot sebagian besar anggaran operasi. Pemerintah daerah menerima dua usulan: <strong>(1)</strong> menaikkan tegangan penyulang ke <strong style="color:var(--amber)">20 kV</strong>, dan <strong>(2)</strong> membangun <strong style="color:var(--amber)">PLTS 3 MWp dengan baterai</strong>.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul 1, Anda diminta menilai kedua usulan itu memakai kerangka yang baru dipelajari, <strong style="color:var(--cyan)">sebelum</strong> analisis teknis rinci dilakukan pada pertemuan-pertemuan berikutnya.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu("PLTD: 6 MW, 400 V", "14,165,233", "cyan")}
{kartu("Beban puncak: 4,2 MW", "14,165,233", "cyan")}
{kartu("Beban rata-rata: 2,5 MW", "14,165,233", "cyan")}
{kartu("Penyulang: 6 kV, 9 km", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Keluhan tegangan rendah dan biaya solar yang tinggi bukan dua masalah yang terpisah. Forum ini mengajak Anda menjelaskan <strong>di mana</strong> energi hilang, <strong>mengapa</strong> tegangan penyulang berpengaruh besar, dan <strong>seberapa efektif</strong> PLTS menggantikan solar bila dilihat dari kurva bebannya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Kurva beban harian pulau terhadap kapasitas PLTD dan profil keluaran PLTS usulan; bandingkan jam beban puncak dengan jam PLTS berproduksi</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "Sebuah pulau dilayani PLTD 6 MW (generator 400 V). Kawasan cold storage 9 km di selatan dipasok penyulang tiga fasa 6 kV. Beban puncak 4,2 MW pada pukul 18.00&ndash;22.00 dan beban rata-rata 2,5 MW. Pelanggan di ujung selatan mengeluh tegangan rendah dan biaya solar tinggi. Usulan: menaikkan tegangan penyulang ke 20 kV dan membangun PLTS 3 MWp dengan baterai."
FORUM_CHIPS_LMS = ["PLTD = 6 MW, 400 V", "beban puncak = 4,2 MW", "beban rata-rata = 2,5 MW", "penyulang = 6 kV, 9 km"]


# ─────────────────────────── SETUP PYTHON ───────────────────────────
SETUP_PESAN = "Setup ini disusun agar kalian bisa langsung menghitung daya satu dan tiga fasa, rugi saluran, efisiensi, dan kurva beban, lalu memvisualisasikannya dalam grafik. Semua berjalan nyaman di <strong>VS Code + Jupyter Notebook</strong>."
SETUP_SUB = "Setup lengkap dari nol menggunakan Miniconda + VS Code untuk perhitungan daya dan rugi jaringan, analisis rangkaian DC dan AC, kurva beban, hingga analisis aliran daya pada akhir semester."
SETUP_LIB = "Library inti untuk komputasi sistem tenaga listrik: NumPy (array dan bilangan kompleks), SciPy (aljabar linear dan persamaan nonlinear), SymPy (analitik), Matplotlib (plot), pandas (data beban), dan Jupyter (notebook)."
SETUP_TEST = '''<span class="sp-kw">import</span> numpy <span class="sp-kw">as</span> np
<span class="sp-kw">import</span> matplotlib.pyplot <span class="sp-kw">as</span> plt

<span class="sp-cm"># Tegangan tiga fasa seimbang 230 V rms, 50 Hz</span>
Vf, f = 230.0, 50.0
t = np.linspace(0, 0.04, 800)
Vm = np.sqrt(2) * Vf
plt.figure(figsize=(8, 3))
<span class="sp-kw">for</span> nama, geser <span class="sp-kw">in</span> [(<span class="sp-str">'R'</span>, 0), (<span class="sp-str">'S'</span>, -120), (<span class="sp-str">'T'</span>, 120)]:
    plt.plot(t * 1000, Vm * np.sin(2 * np.pi * f * t + np.radians(geser)), label=nama)
plt.title(<span class="sp-str">f'Hello Power System! V_L = {np.sqrt(3) * Vf:.1f} V'</span>)
plt.xlabel(<span class="sp-str">'Waktu (ms)'</span>); plt.ylabel(<span class="sp-str">'Tegangan (V)'</span>)
plt.legend(); plt.grid(alpha=0.3); plt.tight_layout(); plt.show()'''
