# Pustaka bersama generator modul Pemodelan CAD (salinan dari scripts/ttl-modul/pustaka.py): helper SVG, blok HTML,
# panel animasi, blok kode, kartu pustaka, dan blok Tugas/Forum. Dipakai modul_N.py.
import math

SQ3 = math.sqrt(3)


def ind(x, d=2):
    """Angka gaya Indonesia: koma desimal, titik ribuan."""
    s = f"{x:,.{d}f}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".")


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


def kode(judul, baris, lang="Python"):
    """Blok kode Python dengan pewarnaan sederhana seperti modul acuan (label bahasa bisa diganti)."""
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
      <span class="code-lang">{lang}</span>
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


def mc_block(MC):
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


def nama_berkas_word(nomor, judul):
    """Nama berkas Modul-Word tanpa ekstensi: Modul-N-Judul-Dengan-Tanda-Hubung."""
    import re
    import unicodedata
    s = unicodedata.normalize("NFKD", judul).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-")
    return f"Modul-{nomor}-{s}"
