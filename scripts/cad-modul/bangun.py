# Membangun Pemodelan-Computer-Aided-Design/Modul/Modul-N.html (N ≥ 2) dari Modul-1.html
# course ini (yang sudah memuat semua lapisan injektor dan kartu tugas berkas) dan
# konten modul_N.py + animasi/modul-N.js.
#
# Pakai (dari root repo):  python scripts/cad-modul/bangun.py 2
# Lalu jalankan injektor progres (kotak centang) dan validator:
#   node scripts/tambah-progres-modul.mjs
#   node scripts/validate-public-security.mjs && node scripts/validate-all-course-modern-design.mjs
#
# Yang diganti dari kerangka: identitas (judul, nomor modul/pertemuan, kunci
# localStorage, MODUL_ID, nama berkas ekspor), subnav, hero, seluruh materi, hero dan
# PG tugas, label tugas pemodelan (ekspor), halaman forum beserta salinan LMS dan
# kanvasnya, skrip animasi, jajak forum, dan gambar acuan tiap kartu tugas. Tab Setup
# FreeCAD dan Setup Python dibuang (hanya ada di Modul 1). Kartu tugas T1–T5 tetap
# (teksnya dirakit server per NIM). Skrip ini juga
# menautkan modul di beranda, menaikkan hitungan validator, mendaftarkan modul di
# Admin/berkas-tugas.html, dan menyelaraskan catatan CLAUDE.md/Pedoman.
import importlib
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
REPO = SCR.parent.parent
N = int(sys.argv[1])
assert N >= 2, "Modul 1 dibangun oleh bangun-modul-1.py"
K = importlib.import_module(f"modul_{N}")
assert K.NOMOR == N
P = N if N <= 7 else N + 1   # Pertemuan 8 = UTS
COURSE_DIR = REPO / "Pemodelan-Computer-Aided-Design"
SUMBER = COURSE_DIR / "Modul" / "Modul-1.html"
TUJUAN = COURSE_DIR / "Modul" / f"Modul-{N}.html"
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
JUDUL_M1 = "Pengenalan FreeCAD dan Menggambar 2D"
ganti(f"<title>Modul 1 — {JUDUL_M1} | Pemodelan CAD</title>", f"<title>Modul {N} — {K.JUDUL} | Pemodelan CAD</title>")
ganti("PEMODELANCAD // M1", f"PEMODELANCAD // M{N}")
ganti("Masuk ke Pertemuan 1 →", f"Masuk ke Pertemuan {P} →")
ganti("⏰ Hitung Mundur — Deadline Pertemuan 1", f"⏰ Hitung Mundur — Deadline Pertemuan {P}")
ganti("const MODULE_ID = 'pertemuan-1';", f"const MODULE_ID = 'pertemuan-{P}';")
ganti("const PERTEMUAN = 'pertemuan-1';", f"const PERTEMUAN = 'pertemuan-{P}';")
ganti("const RELATED_MODULES = ['forum-1','tugas-1'];", f"const RELATED_MODULES = ['forum-{N}','tugas-{N}'];")
ganti("const MODUL_ID = 'pemodelan_cad-modul-1';", f"const MODUL_ID = 'pemodelan_cad-modul-{N}';")
ganti("const _PIN_SESSION_KEY = 'pemodelan_cad_modul_1_pinhash';", f"const _PIN_SESSION_KEY = 'pemodelan_cad_modul_{N}_pinhash';")
ganti("'pemodelan_cad_identity_pertemuan-1'", f"'pemodelan_cad_identity_pertemuan-{P}'", 2)
ganti("'Tugas1_' + nim + '_PemodelanCAD.html'", f"'Tugas{N}_' + nim + '_PemodelanCAD.html'")
ganti("Versi Word/PDF Modul 1 Pemodelan CAD belum dibuat", f"Versi Word/PDF Modul {N} Pemodelan CAD belum dibuat")
ganti("alert('Versi PDF Modul 1 Pemodelan CAD belum tersedia.", f"alert('Versi PDF Modul {N} Pemodelan CAD belum tersedia.")
for a, b in [("Pertemuan 1 &nbsp;·&nbsp; Hasil &amp; Kehadiran", f"Pertemuan {P} &nbsp;·&nbsp; Hasil &amp; Kehadiran"),
             ("yang telah mengakses Pertemuan 1.", f"yang telah mengakses Pertemuan {P}."),
             ("Hasil Pertemuan 1 · Pemodelan CAD", f"Hasil Pertemuan {P} · Pemodelan CAD"),
             ("<title>Tugas 1 — ${esc(name)}</title>", f"<title>Tugas {N} — ${{esc(name)}}</title>"),
             ('<span class="h1-num">Tugas 1</span>', f'<span class="h1-num">Tugas {N}</span>'),
             (f'<span class="h1-topic">{JUDUL_M1}</span>', f'<span class="h1-topic">{K.JUDUL_EKSPOR}</span>'),
             (f'<div class="footer-tag">Tugas 1 — {JUDUL_M1}</div>', f'<div class="footer-tag">Tugas {N} — {K.JUDUL_EKSPOR}</div>'),
             ("&#128172; Forum Diskusi &#8212; Pertemuan 1</div>", f"&#128172; Forum Diskusi &#8212; Pertemuan {P}</div>"),
             (f"Forum Diskusi Pertemuan 1 &mdash; <span style=\"color:#a855f7;font-weight:700\">{JUDUL_M1}</span>", f"Forum Diskusi Pertemuan {P} &mdash; <span style=\"color:#a855f7;font-weight:700\">{K.JUDUL_EKSPOR}</span>"),
             (f'<div style="font-size:.82rem;color:#94a3b8;">{JUDUL_M1} &middot; Pemodelan CAD', f'<div style="font-size:.82rem;color:#94a3b8;">{K.JUDUL_EKSPOR} &middot; Pemodelan CAD'),
             ("// Modul-1 Pemodelan CAD — universal 50-poin", f"// Modul-{N} Pemodelan CAD — universal 50-poin"),
             (f"  // Tugas pemodelan 6 poin (c1..c3) — {JUDUL_M1}", f"  // Tugas pemodelan 6 poin (c1..c3) — {K.JUDUL_PANJANG}"),
             ("  // Tugas pemodelan 11 poin (c4..c5) — pelat berlubang dan profil L", f"  // Tugas pemodelan 11 poin (c4..c5) — {K.JUDUL_PANJANG}"),
             (f"/* ── Floating formulas ({JUDUL_M1}) ── */", f"/* ── Floating formulas ({K.JUDUL_PANJANG}) ── */"),
             ("Fast Learning (LMS UMB) → Tugas Pertemuan 1", f"Fast Learning (LMS UMB) → Tugas Pertemuan {P}"),
             ("Fast Learning (LMS UMB) → Forum Pertemuan 1", f"Fast Learning (LMS UMB) → Forum Pertemuan {P}"),
             ("<h4>Petunjuk Pengerjaan Tugas 1</h4>", f"<h4>Petunjuk Pengerjaan Tugas {N}</h4>"),
             ("Cara Submit Tugas 1</div>", f"Cara Submit Tugas {N}</div>"),
             (f"· Tugas 1 — {JUDUL_M1} · Pemodelan CAD", f"· Tugas {N} — {K.JUDUL_PANJANG} · Pemodelan CAD"),
             (f"· Forum 1 — {JUDUL_M1} · Pemodelan CAD", f"· Forum {N} — {K.JUDUL_PANJANG} · Pemodelan CAD")]:
    ganti(a, b)

# ── 2. Subnav, hero, materi ──
potong('<div id="modulSubnav" class="subnav-bar show">', "</div>", K.SUBNAV)
i = s.index('<div class="hero academic-hero" data-tab="modul" data-module-number="01">')
j = s.index("<!-- COUNTDOWN -->", i)
s = s[:i] + K.HERO + "\n\n" + s[j:]
materi = K.materi()
n_bagian = len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi))
n_animasi = len(re.findall(r'class="anim-title">Animasi \d', materi))
for kunci, nilai in (("@@N_BAGIAN@@", n_bagian), ("@@N_ANIMASI@@", n_animasi)):
    ganti(kunci, str(nilai))
i = s.index("<!-- ═══ BAGIAN 01 — ")
akhir_modul = s.index("</div><!-- end page-modul -->")
j = s.rindex("</footer>", 0, akhir_modul) + len("</footer>")
s = s[:i] + materi + "\n" + s[j:]

# ── 3. Tugas: hero dan PG (kartu tugas T1–T5 tetap; teksnya dari server) ──
i = s.index('<div class="hero" data-tab="tugas" style="min-height:60vh">')
j = s.index('\n\n<div class="section">', i)
s = s[:i] + K.TUGAS_HERO + s[j:]
# gambar acuan tiap kartu tugas (simbolik; angka dimuat per NIM) diganti milik modul ini
from tugas_gambar import tugas_gambar_html  # noqa: E402
for k_, g_ in enumerate(tugas_gambar_html(N), 1):
    ganti_re(rf'<div class="tugas-gambar" id="gambar-c{k_}">[\s\S]*?<div class="tugas-gambar-ket">[^<]*</div>\s*</div>', lambda m, g_=g_: g_)
i = s.index("  <!-- ─── PILIHAN GANDA ─── -->")
j = s.index("  <!-- ─── TUGAS PEMODELAN (BERKAS FREECAD) ─── -->", i)
s = s[:i] + K.mc_block(K.MC) + "\n" + s[j:]

# ── 4. Forum ──
i = s.index('<div class="page" id="page-forum">')
j = s.index("  <!-- Export & Submit -->", i)
s = s[:i] + K.forum_page() + s[j:]
hash_baru = ", ".join(f"{n}: '{ah(f'{n}_{idx}')}'" for n, idx in K.FORUM_POLL_BENAR.items())
ganti_re(r"window\._forumPollAnswerHashes = \{[^}]*\};", lambda m: "window._forumPollAnswerHashes = {" + hash_baru + "};")

a = s.index("&#128203; Skenario: ")
b = s.index("${ans3}", a)
blok = s[a:b]
blok, c = re.subn(r"&#128203; Skenario: [^<]*", "&#128203; Skenario: " + K.JUDUL_PANJANG, blok, count=1)
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

i = s.index("// FORUM CANVAS — ")
i = s.rfind("\n", 0, s.rfind("\n", 0, i)) + 1
akhir = "window.addEventListener('resize', () => {\n  drawForumCanvas();\n});"
j = s.index(akhir, i) + len(akhir)
s = s[:i] + K.FORUM_KANVAS + s[j:]

# ── 5. Ekspor tugas ──
mc_titles = "const MC_QUESTIONS = [\n" + ",\n".join("      " + json.dumps(t, ensure_ascii=False).replace('"', "'") for _, _, t in K.MC) + "\n    ];"
ganti_re(r"const MC_QUESTIONS = \[\n.*?\n    \];", lambda m: mc_titles)
ez = "const compEzDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 1}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.TUGAS_LABELS[:3])) + "\n    ];"
ganti_re(r"const compEzDefs = \[\n.*?\n    \];", lambda m: ez)
hd = "const compHardDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 4}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.TUGAS_LABELS[3:])) + "\n    ];"
ganti_re(r"const compHardDefs = \[\n.*?\n    \];", lambda m: hd)

# ── 6. Animasi materi ──
i = s.index('<script id="cad-modul-1-animations">')
j = s.index("</script>", i) + len("</script>")
js = (SCR / "animasi" / "dasar.js").read_text(encoding="utf-8") + "\n" + (SCR / "animasi" / f"modul-{N}.js").read_text(encoding="utf-8")
s = s[:i] + f'<script id="cad-modul-{N}-animations">\n' + js + "</script>" + s[j:]

# ── 7. Tab Setup FreeCAD dan Setup Python dibuang (hanya Modul 1) ──
ganti_re(r'\s*<button class="nav-tab" id="tab-setup"[\s\S]*?</button>', "")
ganti_re(r'\s*<div class="page[^"]*" id="page-setup">[\s\S]*?<!-- end page-setup -->', "")
ganti_re(r'\s*<button class="nav-tab" id="tab-python"[\s\S]*?</button>', "")
ganti_re(r'\s*<div class="page[^"]*" id="page-python">[\s\S]*?<!-- end page-python -->', "")


def saring_style(m):
    isi = m.group(0)[:400]
    return "" if re.search(r"CSS variables scoped untuk Setup Python|Salinan CSS Setup untuk tab Setup Python|^\s*#page-(?:setup|python)\s*\{", isi, re.M) else m.group(0)


s = re.sub(r"<style[^>]*>[\s\S]*?</style>", saring_style, s)
s = re.sub(r"\s*<!--\s*═+\s*PAGE: SETUP PYTHON[\s\S]*?-->", "", s)
assert 'id="page-setup"' not in s and 'id="page-python"' not in s

TUJUAN.write_text(s, encoding="utf-8", newline="")
print(f"Modul-{N} CAD ditulis: {len(s)} karakter; bagian {n_bagian}, animasi {n_animasi}; pertemuan {P}; hash jajak {hash_baru}")

# ── 8. Sisa istilah Modul 1 (untuk ditinjau) ──
awal_chat, akhir_chat = s.index("  var MODULE_TOPICS = {"), s.index("  /** Nama modul aktif dari MODUL_ID halaman.")
tanpa_chat = s[:awal_chat] + s[akhir_chat:]
for kata in [JUDUL_M1, "braket", "Karya Logam", "cvNavigasi", "drawNavigasi", "Modul 1 ", "Pertemuan 1 ", "Tugas 1 ", "Forum 1 ", "pertemuan-1", "Tugas1_", "Setup FreeCAD"]:
    hits = [m.start() for m in re.finditer(re.escape(kata), tanpa_chat)]
    if hits:
        contoh = " | ".join(tanpa_chat[max(0, h - 50):h + 50].replace("\n", "⏎") for h in hits[:3])
        print(f"  sisa '{kata}': {len(hits)}x — {contoh[:400]}")

# ── 9. Beranda, Admin, validator, dokumen ──
idx = REPO / "index.html"
h = idx.read_text(encoding="utf-8")
awal = h.index('<nav class="moduls" aria-label="Modul Pemodelan CAD">')
akhir_nav = h.index("</nav>", awal)
tautan = f'          <a href="Pemodelan-Computer-Aided-Design/Modul/Modul-{N}.html" title="{K.JUDUL}">{N}</a>\n'
if f"Modul-{N}.html" not in h[awal:akhir_nav]:
    h = h[:akhir_nav - len("        ")] + tautan + h[akhir_nav - len("        "):] if h[akhir_nav - 8:akhir_nav] == "        " else h[:akhir_nav] + tautan + h[akhir_nav:]
    idx.write_text(h, encoding="utf-8", newline="")
    print(f"index.html: tautan Modul {N} CAD ditambahkan")

adm = REPO / "Admin" / "berkas-tugas.html"
t_ = adm.read_text(encoding="utf-8")
m_ = re.search(r"const MODUL_TERBIT = \{ pemodelan_cad: \[([0-9, ]*)\] \};", t_)
assert m_, "MODUL_TERBIT tidak ditemukan"
terbit = sorted({int(x) for x in m_.group(1).split(",") if x.strip()} | {N})
t_ = t_.replace(m_.group(0), "const MODUL_TERBIT = { pemodelan_cad: [" + ", ".join(map(str, terbit)) + "] };")
adm.write_text(t_, encoding="utf-8", newline="")

v = REPO / "scripts" / "validate-all-course-modern-design.mjs"
t_ = v.read_text(encoding="utf-8")
t_, c = re.subn(r'"Pemodelan-Computer-Aided-Design": \d+', f'"Pemodelan-Computer-Aided-Design": {max(terbit)}', t_)
assert c == 1
total = 70 + max(terbit)
t_, c = re.subn(r"if \(files !== \d+\) failures\.push\(`jumlah modul \$\{files\}, seharusnya \d+`\);", f"if (files !== {total}) failures.push(`jumlah modul ${{files}}, seharusnya {total}`);", t_)
assert c == 1
v.write_text(t_, encoding="utf-8", newline="")

v = REPO / "scripts" / "validate-public-security.mjs"
t_ = v.read_text(encoding="utf-8")
# 82 = 70 modul course lain + 10 exam course lain + 2 exam Pemodelan CAD;
# ditambah nomor modul CAD terakhir, 6 OBE, dan 6 Admin.
t_, c = re.subn(r"if \(authPages !== \d+\) throw new Error\(`Expected \d+ admin-auth pages \(\d+ Modul/Exam \+ 6 OBE \+ 6 Admin\), got \$\{authPages\}`\);",
                f"if (authPages !== {82 + max(terbit) + 12}) throw new Error(`Expected {82 + max(terbit) + 12} admin-auth pages ({82 + max(terbit)} Modul/Exam + 6 OBE + 6 Admin), got ${{authPages}}`);", t_)
assert c == 1
t_, c = re.subn(r"if \(previewGuarded !== \d+\) throw new Error\(`Expected \d+ modul pages with a guarded export button, found \$\{previewGuarded\}`\);",
                f"if (previewGuarded !== {total}) throw new Error(`Expected {total} modul pages with a guarded export button, found ${{previewGuarded}}`);", t_)
assert c == 1
v.write_text(t_, encoding="utf-8", newline="")

cl = REPO / "CLAUDE.md"
t_ = cl.read_text(encoding="utf-8")
t_, c = re.subn(r"`pemodelan_cad-modul-N` \(terbit: Modul 1(?:–\d+)?; tugas berkas FreeCAD\)", f"`pemodelan_cad-modul-N` (terbit: Modul 1–{max(terbit)}; tugas berkas FreeCAD)", t_)
assert c == 1, "baris course CAD di CLAUDE.md"
t_, c = re.subn(r"Total berkas HTML utama: \*\*\d+ modul \+ 10 exam \+ 6 OBE\*\*\. Pemodelan CAD: Modul 1(?:–\d+)?\nterbit",
                f"Total berkas HTML utama: **{total} modul + 10 exam + 6 OBE**. Pemodelan CAD: Modul 1–{max(terbit)}\nterbit", t_)
assert c == 1, "total berkas di CLAUDE.md"
cl.write_text(t_, encoding="utf-8", newline="")

pd = REPO / "Pedoman-Modul.md"
t_ = pd.read_text(encoding="utf-8")
t_, c = re.subn(r"- \d+ modul: 14 per course aktif \+ Modul 1–14 Teknik Tenaga Listrik \+ Modul 1(?:–\d+)? Pemodelan CAD;",
                f"- {total} modul: 14 per course aktif + Modul 1–14 Teknik Tenaga Listrik + Modul 1–{max(terbit)} Pemodelan CAD;", t_)
assert c == 1, "inventaris modul di Pedoman"
t_, c = re.subn(r"\d+ halaman berautentikasi admin \(\d+ Modul/Exam \+ 6 OBE \+ 6 Admin\)", f"{82 + max(terbit) + 12} halaman berautentikasi admin ({82 + max(terbit)} Modul/Exam + 6 OBE + 6 Admin)", t_)
assert c == 1, "hitungan autentikasi di Pedoman"
t_, c = re.subn(r"Hitungan: \d+ modul dengan tombol ekspor terjaga dan \d+ halaman ber-autentikasi \(\d+ Modul/Exam \+ 6 OBE \+ 6 Admin\)\.",
                f"Hitungan: {total} modul dengan tombol ekspor terjaga dan {82 + max(terbit) + 12} halaman ber-autentikasi ({82 + max(terbit)} Modul/Exam + 6 OBE + 6 Admin).", t_)
assert c == 1, "hitungan CAD di Pedoman"
pd.write_text(t_, encoding="utf-8", newline="")
print(f"beranda, Admin, validator, dan dokumen diperbarui (modul CAD terbit: {terbit})")
