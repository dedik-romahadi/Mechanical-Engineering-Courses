# Menyegarkan Teknik-Tenaga-Listrik/Modul/Modul-1.html dari modul_1.py + animasi/modul-1.js.
#
# Modul 1 TTL dibangun sekali dari kerangka Sisken (bangun-modul-1-dari-sisken.py, kini tidak
# berjalan lagi di main) dan sejak itu menjadi KERANGKA Modul 2–14 dan modul CAD, sehingga tidak
# bisa dibangun ulang dari nol. Skrip ini mengganti, di tempat, wilayah yang isinya berasal dari
# modul_1.py dengan keluaran terbarunya — subnav, hero, materi (kotak centang dibuang lalu dipasang
# ulang tambah-progres-modul.mjs), hero dan PG tugas, halaman forum, salinan forum LMS, skrip
# animasi, label ekspor, dan rumus overlay login (modul_1.RUMUS_LOGIN, dipasang el.innerHTML) —
# dengan jangkar yang sama dengan bangun.py. Sumber yang tidak berubah menghasilkan halaman yang
# identik (diuji pada origin/main 28a2a7ca, 3 Oktober 2026).
#
# Pakai (dari root repo):
#   python scripts/ttl-modul/segarkan-modul-1.py            tulis halaman
#   python scripts/ttl-modul/segarkan-modul-1.py --periksa  lapor saja; kode keluar 1 bila berubah
# Sesudah menulis: node scripts/tambah-progres-modul.mjs (kotak centang), lalu injektor urutan
# kanonik Pedoman §2/§17.1 dan bangun.py 2..14 (Modul 2–14 mewarisi kerangka ini).
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
import modul_1 as K  # noqa: E402
from pustaka import koma_katex  # noqa: E402

REPO = SCR.parent.parent
HALAMAN = REPO / "Teknik-Tenaga-Listrik" / "Modul" / "Modul-1.html"
CENTANG = re.compile(r'\n\s*<label class="pm-centang"[^\n]*</label>')
asli = HALAMAN.read_text(encoding="utf-8")
s = CENTANG.sub("", asli)


def ganti_re(pola, pengganti, n=1, flags=re.S):
    global s
    s, c = re.subn(pola, pengganti, s, flags=flags)
    assert c == n, f"regex {pola[:70]!r}: {c}x, harap {n}x"


def potong(awal, akhir, baru):
    global s
    assert s.count(awal) == 1, f"awal {awal[:60]!r} {s.count(awal)}x"
    i = s.index(awal)
    j = s.index(akhir, i) + len(akhir)
    s = s[:i] + baru + s[j:]


# ── subnav, hero, materi ──
potong('<div id="modulSubnav" class="subnav-bar show">', "</div>", K.SUBNAV)
materi = K.materi()
hitung = {"@@N_BAGIAN@@": len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi)),
          "@@N_ANIMASI@@": len(re.findall(r'class="anim-title">Animasi \d', materi)),
          "@@N_CELL@@": materi.count('class="code-wrap')}
hero = K.HERO
for kunci, nilai in hitung.items():
    assert hero.count(kunci) == 1, kunci
    hero = hero.replace(kunci, str(nilai))
i = s.index('<div class="hero academic-hero" data-tab="modul" data-module-number="01">')
j = s.index("<!-- COUNTDOWN -->", i)
s = s[:i] + hero + "\n\n" + s[j:]
i = s.index("<!-- ═══ BAGIAN 01 — ")
akhir_modul = s.index("</div><!-- end page-modul -->")
j = s.rindex("</footer>", 0, akhir_modul) + len("</footer>")
s = s[:i] + materi + s[j:]          # Modul-1 tanpa baris kosong sesudah </footer> (beda dengan bangun.py)

# ── tugas ──
i = s.index('<div class="hero" data-tab="tugas" style="min-height:60vh">')
j = s.index('\n\n<div class="section">', i)
s = s[:i] + K.TUGAS_HERO + s[j:]
i = s.index("  <!-- ─── PILIHAN GANDA ─── -->")
j = s.index("  <!-- ─── KOMPUTASI EASY/MEDIUM ─── -->", i)
s = s[:i] + K.mc_block() + "\n" + s[j:]

# ── forum + salinan LMS ──
i = s.index('<div class="page" id="page-forum">')
j = s.index("  <!-- Export & Submit -->", i)
s = s[:i] + K.forum_page() + s[j:]
a = s.index("&#128203; Skenario: ")
b = s.index("${ans3}", a)
blok = s[a:b]
blok, c = re.subn(r'(<div style="font-size:\.88rem;color:#475569;margin-bottom:10px;line-height:1\.65;">)([^\n]*?)(</div>)',
                  lambda m: m.group(1) + K.FORUM_SKENARIO_LMS + m.group(3), blok, count=1)
assert c == 1, "teks skenario LMS"
chips = iter(K.FORUM_CHIPS_LMS)
blok, c = re.subn(r'(<div style="display:inline-block;[^"]*">)([^<]*)(</div>)', lambda m: m.group(1) + next(chips) + m.group(3), blok)
assert c == 4, f"chip LMS {c}"
for n, warna in ((1, "#a855f7"), (2, "#0ea5e9"), (3, "#00e09e")):
    blok, c = re.subn(r'(<span style="display:inline-block;background:' + warna + r';color:#fff;[^>]*>' + str(n) + r'</span>)([^\n]*?)(</h3>)',
                      lambda m, n=n: m.group(1) + K.FQ_JUDUL[n - 1] + m.group(3), blok, count=1)
    assert c == 1, f"judul LMS {n}"
ringkas = iter(K.FQ_RINGKAS)
blok, c = re.subn(r'(<div style="font-size:\.82rem;color:#64748b;margin-bottom:14px;padding-left:40px;font-style:italic;">)([^\n]*?)(</div>)',
                  lambda m: m.group(1) + next(ringkas) + m.group(3), blok)
assert c == 3, f"ringkasan LMS {c}"
s = s[:a] + blok + s[b:]

# ── label ekspor ──
mc_titles = "const MC_QUESTIONS = [\n" + ",\n".join("      " + json.dumps(t, ensure_ascii=False).replace('"', "'") for _, _, t in K.MC) + "\n    ];"
ganti_re(r"const MC_QUESTIONS = \[\n.*?\n    \];", lambda m: mc_titles)
ez = "const compEzDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 1}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_EZ_LABELS)) + "\n    ];"
ganti_re(r"const compEzDefs = \[\n.*?\n    \];", lambda m: ez)
hd = "const compHardDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 11}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_HARD_LABELS)) + "\n    ];"
ganti_re(r"const compHardDefs = \[\n.*?\n    \];", lambda m: hd)

# ── skrip animasi materi ──
i = s.index('<script id="ttl-modul-1-animations">')
j = s.index("</script>", i) + len("</script>")
s = s[:i] + '<script id="ttl-modul-1-animations">\n' + (SCR / "animasi" / "modul-1.js").read_text(encoding="utf-8") + "</script>" + s[j:]

# ── rumus overlay login ──
ganti_re(r"const formulas = \[\n    \{ t: 'P = V·I·cos φ',.*?\n  \];", lambda m: K.RUMUS_LOGIN)
if "<sub>" in K.RUMUS_LOGIN or "<sup>" in K.RUMUS_LOGIN:
    s = s.replace("    el.textContent = f.t;\n", "    el.innerHTML = f.t;\n")
    assert s.count("    el.innerHTML = f.t;\n") == 1

s = koma_katex(s)
berubah = s != CENTANG.sub("", asli)
if "--periksa" in sys.argv:
    print(f"Modul-1 TTL {'AKAN BERUBAH' if berubah else 'sudah sesuai'} dengan modul_1.py")
    sys.exit(1 if berubah else 0)
if berubah:
    HALAMAN.write_text(s, encoding="utf-8", newline="")
    print("Modul-1 TTL disegarkan; jalankan node scripts/tambah-progres-modul.mjs untuk kotak centang.")
else:
    print("Modul-1 TTL sudah sesuai dengan modul_1.py (tidak ditulis).")
