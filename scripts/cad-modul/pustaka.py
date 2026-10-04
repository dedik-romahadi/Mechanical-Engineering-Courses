# Pustaka bersama generator modul Pemodelan CAD (salinan dari scripts/ttl-modul/pustaka.py): helper SVG, blok HTML,
# panel animasi, blok kode, kartu pustaka, dan blok Tugas/Forum. Dipakai modul_N.py.
import math
import re

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


# ─── Notasi rumus pada teks SVG ───
# Penanda yang sama dengan teks HTML modul: R<sub>L</sub>, e<sup>−t/τ</sup>. SVG tidak mengenal
# <sub>/<sup>, jadi t() mengubahnya menjadi <tspan>: subskrip/superskrip berukuran 0,72× dan
# digeser dengan dy (bukan baseline-shift, yang diabaikan MuPDF saat gambar dirender untuk
# Modul-Word), ukuran hurufnya mutlak (persen "bocor" ke teks sesudahnya di MuPDF), dan setiap
# potongan sesudahnya dibungkus <tspan dy> yang mengembalikan garis dasar. Hanya teks yang
# memuat penanda yang diubah, jadi nama berkas, alias Spreadsheet, dan kode tetap apa adanya.
_PENANDA = re.compile(r"<(sub|sup)>(.*?)</\1>", re.S)
SUB_SKALA, SUB_MIN, SUB_TURUN, SUP_NAIK = 0.72, 8, 0.22, 0.38


class Kode(str):
    """Teks SVG berupa kode yang diketik (alias/ekspresi Spreadsheet, nama variabel): apa adanya,
    tanpa konversi subskrip, bertanda data-kode="1" sehingga validator notasi melewatinya."""


def tanpa_penanda(s):
    """Teks tampak tanpa penanda <sub>/<sup> (untuk menghitung panjang baris teks2)."""
    return _PENANDA.sub(r"\2", s)


def teks_aria(s):
    """aria-label (atribut, tanpa markup): subskrip ditulis menempel (R<sub>L</sub> → RL), pangkat
    dengan ^ (E<sup>1/3</sup> → E^(1/3)) agar tidak terbaca sebagai angka biasa."""
    return _PENANDA.sub(lambda m: m.group(2) if m.group(1) == "sub" else
                        "^" + (m.group(2) if len(m.group(2)) == 1 else f"({m.group(2)})"), s)


def _g(v):
    return f"{round(v, 1):g}"


def rumus_svg(s, size):
    """'V<sub>k</sub> = V·R<sub>k</sub>' → isi <text> ber-<tspan> (subskrip/superskrip)."""
    if "<su" not in s:
        return s
    kecil = max(size * SUB_SKALA, min(size * 0.9, SUB_MIN))   # tidak di bawah 8 unit bila teksnya lebih besar (ponsel)
    out, pos, kembali = [], 0, 0.0
    for m in _PENANDA.finditer(s):
        sebelum = s[pos:m.start()]
        if sebelum:
            out.append(f'<tspan dy="{_g(kembali)}">{sebelum}</tspan>' if kembali else sebelum)
            kembali = 0.0
        geser = round(size * (SUB_TURUN if m.group(1) == "sub" else -SUP_NAIK), 1)
        out.append(f'<tspan dy="{_g(geser + kembali)}" font-size="{_g(kecil)}">{m.group(2)}</tspan>')
        kembali = -geser
        pos = m.end()
    sisa = s[pos:]
    if sisa:
        out.append(f'<tspan dy="{_g(kembali)}">{sisa}</tspan>' if kembali else sisa)
    hasil = "".join(out)
    assert "<sub" not in hasil and "<sup" not in hasil and "</su" not in hasil, f"penanda rumus tidak seimbang: {s!r}"
    return hasil


_TEKS_MENTAH = re.compile(r'(<text\b[^>]*\bfont-size="([\d.]+)"[^>]*>)(.*?)(</text>)', re.S)


def rumus_mentah(markup):
    """SVG yang ditulis langsung (mis. HERO_SCHEMATIC_*): penanda <sub>/<sup> di tiap <text> → tspan."""
    return _TEKS_MENTAH.sub(lambda m: m.group(1) + rumus_svg(m.group(3), float(m.group(2))) + m.group(4), markup)


def t(x, y, s, size=12, fill=TX, anchor="middle", weight="", fam=SANS):
    w = f' font-weight="{weight}"' if weight else ""
    if isinstance(s, Kode):
        return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-size="{size}" fill="{fill}"{w} font-family="{fam}" data-kode="1">{s}</text>'
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-size="{size}" fill="{fill}"{w} font-family="{fam}">{rumus_svg(s, size)}</text>'


def teks2(x, y, s, size=11, fill=AX, anchor="middle", maks=92, jarak=14):
    """Teks panjang dipecah otomatis pada spasi menjadi beberapa baris (≤ maks karakter)."""
    kata, baris, kini = s.split(" "), [], ""
    for k in kata:
        if kini and len(tanpa_penanda(kini)) + 1 + len(tanpa_penanda(k)) > maks:
            baris.append(kini)
            kini = k
        else:
            kini = (kini + " " + k).strip()
    if kini:
        baris.append(kini)
    return "".join(t(x, y + i * jarak, b, size, fill, anchor) for i, b in enumerate(baris))


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
    return (f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{teks_aria(label)}" preserveAspectRatio="xMidYMid meet">'
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


def pecah_rumus(latex):
    r"""Titik patah baris untuk rumus bernomor (.formula-main) yang panjang: di ponsel rumus yang tak bisa dipatah
    meluap dari kotaknya atau digulir mendatar, dan di layar lebih lebar nomor persamaan "(n)" (absolut di kanan)
    menimpa bagian yang melebihi kotak. \allowbreak tidak terlihat selama rumus muat satu baris; hanya di
    kedalaman nol (di luar kurawal, \left…\right, dan \begin…\end) karena KaTeX hanya mematahkan baris di sana.
      1. \qquad dan \quad disusul \allowbreak (pemisah antar-bagian rumus);
      2. "\ " (spasi tak terpatahkan KaTeX) disusul \allowbreak bila didahului koma atau diikuti \text{…} sepanjang
         >= 8 karakter (rumus + keterangan);
      3. \text{…} polos (tanpa kurawal/perintah di dalamnya): spasi di awal/ujungnya dikeluarkan menjadi "\ "
         (spasi di ujung \text{…} runtuh di ujung baris .base KaTeX, jadi tak boleh ada sebelum titik patah) dan
         yang lebih panjang dari 30 karakter dipecah per kelompok kata (12 karakter ke atas), disambung
         "\ \allowbreak". Prosa panjang tetap lebih baik di teks biasa (Pedoman §2 butir (17)-(21)); pemecahan
         ini hanya menjaga rumus lama yang sudah memuatnya agar tidak meluap."""
    out, i, n = [], 0, len(latex)
    dalam = lingkup = 0
    sudah = r"\s*\\allowbreak(?![A-Za-z])"
    while i < n:
        c = latex[i]
        if c == "{":
            dalam += 1
        elif c == "}":
            dalam -= 1
        elif c == "\\":
            cmd = re.match(r"\\(?:[A-Za-z]+|.)", latex[i:], re.S).group(0)
            if cmd in ("\\left", "\\begin"):
                lingkup += 1
            elif cmd in ("\\right", "\\end"):
                lingkup -= 1
            polos = dalam == 0 and lingkup == 0
            if polos and cmd in ("\\qquad", "\\quad"):
                out.append(cmd)
                i += len(cmd)
                if not re.match(sudah, latex[i:]):
                    out.append("\\allowbreak")
                continue
            if polos and cmd == "\\ ":
                out.append(cmd)
                i += len(cmd)
                teks = re.match(r"\s*\\text\{([^{}\\$%~]*)\}", latex[i:])
                if (out[-2:-1] == [","] or (teks and len(teks.group(1).strip()) >= 8)) and not re.match(sudah, latex[i:]):
                    out.append("\\allowbreak ")
                continue
            if polos and cmd == "\\text" and latex.startswith("{", i + len(cmd)):
                k = latex.find("}", i + len(cmd) + 1)
                isi = latex[i + len(cmd) + 1:k] if k > 0 else ""
                if k > 0 and isi.strip() and not re.search(r"[{\\$%~]", isi):
                    awal, akhir, inti = isi.startswith(" "), isi.endswith(" "), isi.strip()
                    kelompok, kini = [], ""
                    for kata in inti.split(" "):
                        kini = f"{kini} {kata}" if kini else kata
                        if len(inti) > 30 and len(kini) >= 12:
                            kelompok.append(kini)
                            kini = ""
                    if kini:
                        kelompok.append(kini)
                    if len(kelompok) > 1 or awal or akhir:
                        potongan = ("\\ \\allowbreak " if awal and out else "") + "\\ \\allowbreak ".join("\\text{" + g + "}" for g in kelompok)
                        i = k + 1
                        if akhir:
                            potongan += "\\ "
                            if not re.match(sudah, latex[i:]):
                                potongan += "\\allowbreak "
                        out.append(potongan)
                        continue
            out.append(cmd)
            i += len(cmd)
            continue
        out.append(c)
        i += 1
    return "".join(out)


def formula(no, label, latex, desc, penjelasan, pairs):
    return f'''  <div class="formula-block reveal">
    <div class="formula-label">{label}</div>
    <div class="formula-main">\\({pecah_rumus(latex)}\\)<span class="formula-number">({no})</span></div>
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


def opsi_teks(s):
    """Isi opsi PG/jajak dan tautan subnav (induknya display:flex). Bila memuat elemen (<sub>, <sup>, <code>,
    <strong>, …) atau KaTeX, isinya dibungkus SATU <span class="opsi-teks">: tanpa pembungkus tiap elemen
    menjadi flex item tersendiri — subskrip tidak turun, ada celah 10–12 px di tengah rumus, dan di layar
    sempit teks opsi terpotong. textContent tidak berubah (selectMC, kunci, ekspor tetap cocok)."""
    return f'<span class="opsi-teks">{s}</span>' if ("<" in s or "\\(" in s) else s


def chip(teks, rgb, warna):
    return f'<span style="font-family:\'JetBrains Mono\',monospace;font-size:12px;background:rgba({rgb},.07);border:1px solid rgba({rgb},.18);color:var(--{warna});padding:6px 12px;border-radius:8px;">{teks}</span>'


def fq(n, rgb, warna, judul, isi, chips, poll_q, opsi, fb_r, fb_w, placeholder):
    ops = "\n".join(f'            <div class="p-opt" onclick="voteForum({n},this,{k})"><div class="p-circle"></div>{opsi_teks(o)}</div>' for k, o in enumerate(opsi))
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
        rows = "\n".join(f'        <div class="radio-option" onclick="selectMC(\'mc{i}\',this)"><div class="radio-circle"></div>{opsi_teks("(" + "ABCD"[k] + ") &nbsp; " + o)}</div>' for k, o in enumerate(opsi))
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


# ── Koma desimal di KaTeX (fase D rencana perbaikan KaTeX, 4 Okt 2026; Pedoman §2 butir (21)) ──
# KaTeX memperlakukan koma sebagai tanda baca dan menambah spasi tipis sesudahnya, jadi
# "0,849" tampil "0, 849" (dan bercampur dengan konstanta 0{,}7788 yang ditulis manual di
# rumus yang sama). Dipanggil SEKALI pada HTML akhir sebelum ditulis: di dalam setiap
# segmen \( … \) teks tampil, "angka,angka" menjadi "angka{,}angka", kecuali di dalam
# perintah mode teks (\text{…} berkurawal bersarang pun, \textrm, \operatorname, …) dan di
# dalam subskrip _{…} (daftar indeks seperti \sigma_{1,2,3}, juga x_{\text{a} 1,2}); pangkat
# ^{0,02} dan isi \mathrm{…}/\mathbf{…} (mode matematika, koma tetap berspasi) ikut diubah.
# Koordinat/daftar ditulis berspasi "A(0, 0)" agar tidak ikut diubah (tampilan KaTeX-nya
# identik). Hanya simpul teks yang dirender auto-render halaman yang disentuh: tag dan
# atributnya, komentar HTML, blok AI-CHAT-AGENT, <script>, <style>, <noscript>, <template>,
# <textarea>, <pre>, <code>, <option>, dan elemen berkelas ff/float-formulas (ignoredTags
# dan ignoredClasses halaman) dilewati; segmen tidak melewati tag (auto-render bekerja per
# simpul teks). Idempoten: "0{,}849" tidak cocok lagi (juga angka sesudah {,}).
# buat-modul-word.py mengubah {,} kembali menjadi ",".
_KOMA_TOKEN = re.compile(
    r"<!-- AI-CHAT-AGENT:BEGIN|<!--|<([A-Za-z][\w-]*)\b([^>]*)>|<[/!?][^>]*>")
_KOMA_MENTAH = ("script", "style", "textarea", "noscript", "template")
_KOMA_BERSARANG = ("pre", "code")
_KOMA_KELAS = ("ff", "float-formulas")
_KOMA_SEG = re.compile(r"\\\(([^<]+?)\\\)")
_KOMA_MODE_TEKS = re.compile(
    r"\\(?:text(?:rm|bf|it|sf|tt|up|md|normal)?|emph|mbox|hbox|operatorname\*?)(?![A-Za-z])\s*\{")
_KOMA_ANGKA = re.compile(r"(?<![\d,])(?<!\{,\})(\d+),(\d+)")


def _ujung_elemen(html, i, tag):
    """Indeks sesudah penutup elemen `tag` yang dibuka di i (elemen bernama sama bersarang dihitung)."""
    rx = re.compile(r"<(/?)%s\b[^>]*>" % re.escape(tag), re.I)
    d = 0
    for m in rx.finditer(html, i):
        if m.group(1):
            d -= 1
            if d == 0:
                return m.end()
        elif not m.group(0).endswith("/>"):
            d += 1
    return len(html)


def _ujung_lewati(html, m):
    """Indeks sesudah token m; bila m membuka bagian yang tidak dirender, sesudah bagian itu."""
    t = m.group(0)
    if t.startswith("<!-- AI-CHAT-AGENT:BEGIN"):
        k = html.find("<!-- AI-CHAT-AGENT:END", m.end())
        k = html.find("-->", k) if k >= 0 else -1
        return len(html) if k < 0 else k + 3
    if t == "<!--":
        k = html.find("-->", m.end())
        return len(html) if k < 0 else k + 3
    tag = (m.group(1) or "").lower()
    if not tag:
        return m.end()
    if tag in _KOMA_MENTAH:
        k = html.lower().find("</" + tag, m.end())
        return len(html) if k < 0 else html.index(">", k) + 1
    if tag == "option":                                   # </option> boleh tidak ditulis
        n = re.compile(r"</option\s*>|<option\b|</select\s*>|</datalist\s*>", re.I).search(html, m.end())
        return len(html) if not n else (n.end() if n.group(0).lower().startswith("</option") else n.start())
    kelas = re.search(r"\bclass\s*=\s*\"([^\"]*)\"", m.group(2) or "", re.I)
    if tag in _KOMA_BERSARANG or (kelas and any(k in _KOMA_KELAS for k in kelas.group(1).split())):
        return _ujung_elemen(html, m.start(), tag)
    return m.end()


def _topeng_teks(s):
    """Isi perintah mode teks diganti spasi (kurawal bersarang dihitung); panjang dan kurawal luarnya tetap."""
    out = list(s)
    for m in _KOMA_MODE_TEKS.finditer(s):
        j, d = m.end() - 1, 0
        while j < len(s):
            if s[j] == "\\":
                j += 2
                continue
            if s[j] == "{":
                d += 1
            elif s[j] == "}":
                d -= 1
                if d == 0:
                    break
            j += 1
        for k in range(m.end(), min(j, len(s))):
            out[k] = " "
    return "".join(out)


def _di_subskrip(s, i):
    """True bila posisi i berada di dalam _{…} yang belum tertutup (\\{ dan \\} dilewati)."""
    tumpuk, k = [], 0
    while k < i:
        if s[k] == "\\":
            k += 2
            continue
        if s[k] == "{":
            tumpuk.append(k > 0 and s[k - 1] == "_")
        elif s[k] == "}" and tumpuk:
            tumpuk.pop()
        k += 1
    return any(tumpuk)


def _koma_segmen(m):
    isi = m.group(1)
    topeng = _topeng_teks(isi)
    out, pos = [], 0
    for n in _KOMA_ANGKA.finditer(topeng):
        if _di_subskrip(topeng, n.start()):
            continue
        out.append(isi[pos:n.end(1)] + "{,}" + isi[n.start(2):n.end(2)])
        pos = n.end()
    return "\\(" + "".join(out) + isi[pos:] + "\\)"


def koma_katex(html):
    """Koma desimal di dalam segmen KaTeX \\( … \\) ditulis {,} (lihat keterangan di atas)."""
    out, i = [], 0
    while True:
        m = _KOMA_TOKEN.search(html, i)
        if not m:
            break
        out.append(_KOMA_SEG.sub(_koma_segmen, html[i:m.start()]))
        akhir = _ujung_lewati(html, m)
        out.append(html[m.start():akhir])
        i = akhir
    out.append(_KOMA_SEG.sub(_koma_segmen, html[i:]))
    return "".join(out)
