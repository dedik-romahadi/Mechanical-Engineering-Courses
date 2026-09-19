# Membangun Teknik-Tenaga-Listrik/Modul/Modul-N.html (N ≥ 2) dari Modul-1.html
# course ini (yang sudah memuat semua lapisan injektor) dan konten modul_N.py.
#
# Pakai (dari root repo):  python scripts/ttl-modul/bangun.py 2
# Lalu jalankan injektor progres (kotak centang) dan validator:
#   node scripts/tambah-progres-modul.mjs
#   node scripts/validate-public-security.mjs && node scripts/validate-all-course-modern-design.mjs
#
# Yang diganti dari kerangka: identitas (judul, nomor modul/pertemuan, kunci
# localStorage, MODUL_ID, nama berkas ekspor), subnav, hero, seluruh materi,
# hero dan PG tugas, halaman forum beserta salinan LMS dan kanvasnya, skrip
# animasi, label ekspor, dan jajak forum. Tab Setup Python dan Pembagian
# Kelompok dibuang (hanya ada di Modul 1), mengikuti pola Sisken Modul 2–14.
import importlib
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
REPO = SCR.parent.parent
N = int(sys.argv[1])
assert N >= 2, "Modul 1 dibangun oleh bangun-modul-1-dari-sisken.py"
K = importlib.import_module(f"modul_{N}")
assert K.NOMOR == N
P = N if N <= 7 else N + 1   # Pertemuan 8 = UTS

SUMBER = REPO / "Teknik-Tenaga-Listrik" / "Modul" / "Modul-1.html"
TUJUAN = REPO / "Teknik-Tenaga-Listrik" / "Modul" / f"Modul-{N}.html"
s = SUMBER.read_text(encoding="utf-8")


def ganti(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, f"jangkar {a[:70]!r}: {c}x, harap {n}x"
    s = s.replace(a, b)


def ganti_re(pola, pengganti, n=1, flags=re.S):
    global s
    s, c = re.subn(pola, pengganti, s, flags=flags)
    assert c == n, f"regex {pola[:70]!r}: {c}x, harap {n}x"


def potong(awal, akhir, baru, sertakan_akhir=True):
    global s
    assert s.count(awal) == 1, f"awal {awal[:60]!r} {s.count(awal)}x"
    i = s.index(awal)
    j = s.index(akhir, i)
    if sertakan_akhir:
        j += len(akhir)
    s = s[:i] + baru + s[j:]


def ah(teks):
    h = 5381
    for ch in teks + "mEKsP9k4tQ2":
        h = (((h << 5) & 0xFFFFFFFF) + h + ord(ch)) & 0xFFFFFFFF
    digit = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        h, r = divmod(h, 36)
        out = digit[r] + out
        if h == 0:
            return out


# ── 0. Kotak centang progres dibuang; injektor menyisipkan ulang sesuai bagian baru ──
s, n_centang = re.subn(r'\n\s*<label class="pm-centang"[^\n]*</label>', "", s)
assert n_centang >= 5, n_centang

# ── 1. Identitas ber-angka (dilakukan pada kerangka, sebelum konten baru masuk) ──
JUDUL_M1 = "Konsep Dasar Sistem Tenaga Listrik"
ganti(f"<title>Modul 1 — {JUDUL_M1} | Teknik Tenaga Listrik</title>", f"<title>Modul {N} — {K.JUDUL_PANJANG} | Teknik Tenaga Listrik</title>")
ganti("TENAGALISTRIK // M1", f"TENAGALISTRIK // M{N}")
ganti("Masuk ke Pertemuan 1 →", f"Masuk ke Pertemuan {P} →")
ganti("⏰ Hitung Mundur — Deadline Pertemuan 1", f"⏰ Hitung Mundur — Deadline Pertemuan {P}")
ganti("const MODULE_ID = 'pertemuan-1';", f"const MODULE_ID = 'pertemuan-{P}';")
ganti("const PERTEMUAN = 'pertemuan-1';", f"const PERTEMUAN = 'pertemuan-{P}';")
ganti("const RELATED_MODULES = ['forum-1','tugas-1'];", f"const RELATED_MODULES = ['forum-{N}','tugas-{N}'];")
ganti("const MODUL_ID = 'teknik_tenaga_listrik-modul-1';", f"const MODUL_ID = 'teknik_tenaga_listrik-modul-{N}';")
ganti("const _PIN_SESSION_KEY = 'teknik_tenaga_listrik_modul_1_pinhash';", f"const _PIN_SESSION_KEY = 'teknik_tenaga_listrik_modul_{N}_pinhash';")
ganti("'teknik_tenaga_listrik_identity_pertemuan-1'", f"'teknik_tenaga_listrik_identity_pertemuan-{P}'", 2)
ganti("'Tugas1_' + nim + '_TeknikTenagaListrik.html'", f"'Tugas{N}_' + nim + '_TeknikTenagaListrik.html'")
ganti("Versi Word/PDF Modul 1 Teknik Tenaga Listrik belum dibuat", f"Versi Word/PDF Modul {N} Teknik Tenaga Listrik belum dibuat")
ganti("alert('Versi PDF Modul 1 Teknik Tenaga Listrik belum tersedia.", f"alert('Versi PDF Modul {N} Teknik Tenaga Listrik belum tersedia.")
# Tab Hasil, ekspor tugas, dan salinan forum LMS: nomor pertemuan/tugas/forum generik.
for a, b in [("Pertemuan 1 &nbsp;·&nbsp; Hasil &amp; Kehadiran", f"Pertemuan {P} &nbsp;·&nbsp; Hasil &amp; Kehadiran"),
             ("yang telah mengakses Pertemuan 1.", f"yang telah mengakses Pertemuan {P}."),
             ("Hasil Pertemuan 1 · Teknik Tenaga Listrik", f"Hasil Pertemuan {P} · Teknik Tenaga Listrik"),
             ("<title>Tugas 1 — ${esc(name)}</title>", f"<title>Tugas {N} — ${{esc(name)}}</title>"),
             ('<span class="h1-num">Tugas 1</span>', f'<span class="h1-num">Tugas {N}</span>'),
             (f'<span class="h1-topic">{JUDUL_M1}</span>', f'<span class="h1-topic">{K.JUDUL_EKSPOR}</span>'),
             (f'<div class="footer-tag">Tugas 1 — {JUDUL_M1}</div>', f'<div class="footer-tag">Tugas {N} — {K.JUDUL_EKSPOR}</div>'),
             ("&#128172; Forum Diskusi &#8212; Pertemuan 1</div>", f"&#128172; Forum Diskusi &#8212; Pertemuan {P}</div>"),
             (f"Forum Diskusi Pertemuan 1 &mdash; <span style=\"color:#a855f7;font-weight:700\">{JUDUL_M1}</span>", f"Forum Diskusi Pertemuan {P} &mdash; <span style=\"color:#a855f7;font-weight:700\">{K.JUDUL_EKSPOR}</span>"),
             (f'<div style="font-size:.82rem;color:#94a3b8;">{JUDUL_M1} &middot; Teknik Tenaga Listrik', f'<div style="font-size:.82rem;color:#94a3b8;">{K.JUDUL_EKSPOR} &middot; Teknik Tenaga Listrik'),
             ("// Modul-1 Teknik Tenaga Listrik (Konsep Dasar) — universal 50-poin", f"// Modul-{N} Teknik Tenaga Listrik — universal 50-poin"),
             (f"// Comp E/M definitions (c1..c10) — {JUDUL_M1}", f"// Comp E/M definitions (c1..c10) — {K.JUDUL_PANJANG}"),
             (f"/* ── Floating formulas ({JUDUL_M1}) ── */", f"/* ── Floating formulas ({K.JUDUL_PANJANG}) ── */")]:
    ganti(a, b)
for a, b in [("Fast Learning (LMS UMB) → Tugas Pertemuan 1", f"Fast Learning (LMS UMB) → Tugas Pertemuan {P}"),
             ("Fast Learning (LMS UMB) → Forum Pertemuan 1", f"Fast Learning (LMS UMB) → Forum Pertemuan {P}"),
             ("<h4>Petunjuk Pengerjaan Tugas 1</h4>", f"<h4>Petunjuk Pengerjaan Tugas {N}</h4>"),
             ("Cara Submit Tugas 1</div>", f"Cara Submit Tugas {N}</div>"),
             (f"· Tugas 1 — {JUDUL_M1} · Teknik Tenaga Listrik", f"· Tugas {N} — {K.JUDUL_PANJANG} · Teknik Tenaga Listrik"),
             (f"· Forum 1 — {JUDUL_M1} · Teknik Tenaga Listrik", f"· Forum {N} — {K.JUDUL_PANJANG} · Teknik Tenaga Listrik")]:
    ganti(a, b)
assert f"Modul {N}" not in s.split('<div class="page active" id="page-modul">')[0] or True

# ── 2. Subnav, hero, materi ──
potong('<div id="modulSubnav" class="subnav-bar show">', "</div>", K.SUBNAV)
i = s.index('<div class="hero academic-hero" data-tab="modul" data-module-number="01">')
j = s.index("<!-- COUNTDOWN -->", i)
s = s[:i] + K.HERO + "\n\n" + s[j:]
materi = K.materi()
n_bagian = len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi))
n_animasi = len(re.findall(r'class="anim-title">Animasi \d', materi))
n_cell = materi.count('class="code-wrap')
for kunci, nilai in (("@@N_BAGIAN@@", n_bagian), ("@@N_ANIMASI@@", n_animasi), ("@@N_CELL@@", n_cell)):
    ganti(kunci, str(nilai))
i = s.index("<!-- ═══ BAGIAN 01 — ")
akhir_modul = s.index("</div><!-- end page-modul -->")
j = s.rindex("</footer>", 0, akhir_modul) + len("</footer>")
s = s[:i] + materi + "\n" + s[j:]

# ── 3. Tugas ──
i = s.index('<div class="hero" data-tab="tugas" style="min-height:60vh">')
j = s.index('\n\n<div class="section">', i)
s = s[:i] + K.TUGAS_HERO + s[j:]
i = s.index("  <!-- ─── PILIHAN GANDA ─── -->")
j = s.index("  <!-- ─── KOMPUTASI EASY/MEDIUM ─── -->", i)
s = s[:i] + K.mc_block(K.MC) + "\n" + s[j:]

# ── 4. Forum ──
i = s.index('<div class="page" id="page-forum">')
j = s.index("  <!-- Export & Submit -->", i)
s = s[:i] + K.forum_page() + s[j:]
hash_baru = ", ".join(f"{n}: '{ah(f'{n}_{idx}')}'" for n, idx in K.FORUM_POLL_BENAR.items())
ganti_re(r"window\._forumPollAnswerHashes = \{[^}]*\};", lambda m: "window._forumPollAnswerHashes = {" + hash_baru + "};")

# Salinan forum untuk LMS (HTML inline) — judul skenario, teks, chip, judul dan ringkasan pertanyaan.
a = s.index("&#128203; Skenario: ")
b = s.index("${ans3}", a)
blok = s[a:b]
blok, c = re.subn(r"&#128203; Skenario: [^<]*", "&#128203; Skenario: " + K.FORUM_SKENARIO_LMS.split(".")[0].split(" dipasok")[0].strip() if False else "&#128203; Skenario: " + K.JUDUL_PANJANG, blok, count=1)
assert c == 1
blok, c = re.subn(r'(<div style="font-size:\.88rem;color:#475569;margin-bottom:10px;line-height:1\.65;">)([^\n]*?)(</div>)', lambda m: m.group(1) + K.FORUM_SKENARIO_LMS + m.group(3), blok, count=1)
assert c == 1, "teks skenario LMS"
chips = iter(K.FORUM_CHIPS_LMS)
blok, c = re.subn(r'(<div style="display:inline-block;[^"]*">)([^<]*)(</div>)', lambda m: m.group(1) + next(chips) + m.group(3), blok)
assert c == 4, f"chip LMS {c}"
for n, warna in ((1, "#a855f7"), (2, "#0ea5e9"), (3, "#00e09e")):
    blok, c = re.subn(r'(<span style="display:inline-block;background:' + warna + r';color:#fff;[^>]*>' + str(n) + r'</span>)([^\n]*?)(</h3>)',
                      lambda m, n=n: m.group(1) + K.FQ_JUDUL[n - 1] + m.group(3), blok, count=1)
    assert c == 1, f"judul LMS {n}"
ringkas = iter(K.FQ_RINGKAS)
blok, c = re.subn(r'(<div style="font-size:\.82rem;color:#64748b;margin-bottom:14px;padding-left:40px;font-style:italic;">)([^\n]*?)(</div>)', lambda m: m.group(1) + next(ringkas) + m.group(3), blok)
assert c == 3, f"ringkasan LMS {c}"
s = s[:a] + blok + s[b:]

# Kanvas forum + penangan resize.
i = s.index("// FORUM CANVAS — ")
i = s.rfind("\n", 0, s.rfind("\n", 0, i)) + 1
akhir = "window.addEventListener('resize', () => {\n  drawForumCanvas();\n});"
j = s.index(akhir, i) + len(akhir)
s = s[:i] + K.FORUM_KANVAS + s[j:]

# ── 5. Ekspor tugas ──
mc_titles = "const MC_QUESTIONS = [\n" + ",\n".join("      " + json.dumps(t, ensure_ascii=False).replace('"', "'") for _, _, t in K.MC) + "\n    ];"
ganti_re(r"const MC_QUESTIONS = \[\n.*?\n    \];", lambda m: mc_titles)
ez = "const compEzDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 1}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_EZ_LABELS)) + "\n    ];"
ganti_re(r"const compEzDefs = \[\n.*?\n    \];", lambda m: ez)
hd = "const compHardDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 11}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_HARD_LABELS)) + "\n    ];"
ganti_re(r"const compHardDefs = \[\n.*?\n    \];", lambda m: hd)

# ── 6. Animasi materi ──
i = s.index('<script id="ttl-modul-1-animations">')
j = s.index("</script>", i) + len("</script>")
js = (SCR / "animasi" / "dasar.js").read_text(encoding="utf-8") + "\n" + (SCR / "animasi" / f"modul-{N}.js").read_text(encoding="utf-8")
s = s[:i] + f'<script id="ttl-modul-{N}-animations">\n' + js + "</script>" + s[j:]

# ── 7. Tab Setup Python dan Pembagian Kelompok dibuang (pola Sisken Modul 2–14) ──
for nama in ["setup", "kelompok"]:
    ganti_re(r'\s*<button class="nav-tab" id="tab-' + nama + r'"[\s\S]*?</button>', "")
    ganti_re(r'\s*<div class="page[^"]*" id="page-' + nama + r'">[\s\S]*?<!-- end page-' + nama + r' -->', "")


def saring_style(m):
    isi = m.group(0)[:400]
    milik_setup = re.search(r"CSS variables scoped untuk Setup Python|^\s*#page-setup\s*\{", isi, re.M)
    milik_kelompok = re.search(r"^\s*#page-kelompok\s*\{", isi, re.M)
    return "" if (milik_setup or milik_kelompok) else m.group(0)


s = re.sub(r"<style[^>]*>[\s\S]*?</style>", saring_style, s)
s = re.sub(r"\s*<!--\s*═+\s*PAGE: (SETUP PYTHON|PEMBAGIAN KELOMPOK)[\s\S]*?-->", "", s)
assert 'id="page-setup"' not in s and 'id="page-kelompok"' not in s

TUJUAN.write_text(s, encoding="utf-8", newline="")
print(f"Modul-{N} TTL ditulis: {len(s)} karakter; bagian {n_bagian}, animasi {n_animasi}, cell {n_cell}; pertemuan {P}; hash jajak {hash_baru}")

# ── 8. Sisa istilah Modul 1 (untuk ditinjau) ──
awal_chat, akhir_chat = s.index("  var MODULE_TOPICS = {"), s.index("  /** Nama modul aktif dari MODUL_ID halaman.")
tanpa_chat = s[:awal_chat] + s[akhir_chat:]
for kata in ["Konsep Dasar Sistem Tenaga", "pulau", "PLTD", "cvRantai", "drawRantai", "Modul 1 ", "Pertemuan 1 ", "Tugas 1 ", "Forum 1 ", "pertemuan-1", "Tugas1_"]:
    hits = [m.start() for m in re.finditer(re.escape(kata), tanpa_chat)]
    if hits:
        contoh = " | ".join(tanpa_chat[max(0, h - 50):h + 50].replace("\n", "⏎") for h in hits[:3])
        print(f"  sisa '{kata}': {len(hits)}x — {contoh[:400]}")
