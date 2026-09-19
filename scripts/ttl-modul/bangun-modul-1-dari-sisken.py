# Skrip sekali pakai yang membangun Modul 1 TTL dari kerangka Sisken Modul 1 (14 Sep 2026).
# Disimpan sebagai jejak; Modul 2 dst dibangun oleh bangun.py dari Modul-1.html TTL.
# Membangun Teknik-Tenaga-Listrik/Modul/Modul-1.html dari kerangka Sisken Modul 1
# (halaman modul terbaru yang sudah memuat semua lapisan injektor), lalu mengganti
# identitas, konten, tugas, forum, animasi, dan ekspor. Semua jangkar dihitung.
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
import modul_1 as K  # noqa: E402

REPO = SCR.parent.parent
SUMBER = REPO / "Sistem-Kendali-Cerdas" / "Modul" / "Modul-1.html"
TUJUAN = REPO / "Teknik-Tenaga-Listrik" / "Modul" / "Modul-1.html"
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


def potong(awal, akhir, baru, sertakan_akhir=True, dari=0):
    """Ganti s[awal .. akhir] (jangkar unik sesudah `dari`)."""
    global s
    assert s.count(awal) == 1, f"awal {awal[:60]!r} {s.count(awal)}x"
    i = s.index(awal, dari)
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


assert (ah("1_1"), ah("2_2"), ah("3_0")) == ("1vcm311", "qcan6f", "fm86uu"), "hash jajak tidak cocok dengan halaman acuan"

# ── 1. Identitas halaman ──
ganti("<title>Modul 1 — Pengantar Sistem Kontrol Cerdas | Sistem Kendali Cerdas</title>",
      "<title>Modul 1 — Konsep Dasar Sistem Tenaga Listrik | Teknik Tenaga Listrik</title>")
ganti("SISKENCERDAS // M1", "TENAGALISTRIK // M1")
potong('<div id="modulSubnav" class="subnav-bar show">', "</div>", K.SUBNAV)

# ── 2. Hero + materi ──
i = s.index('<div class="hero academic-hero" data-tab="modul" data-module-number="01">')
j = s.index("<!-- COUNTDOWN -->", i)
s = s[:i] + K.HERO + "\n\n" + s[j:]
materi = K.materi()
n_bagian = len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi))
n_animasi = len(re.findall(r'class="anim-title">Animasi \d', materi))
n_cell = materi.count('class="code-wrap')
assert (n_bagian, n_animasi, n_cell) == (9, 5, 4), (n_bagian, n_animasi, n_cell)
for kunci, nilai in (("@@N_BAGIAN@@", n_bagian), ("@@N_ANIMASI@@", n_animasi), ("@@N_CELL@@", n_cell)):
    ganti(kunci, str(nilai))
i = s.index("<!-- ═══ BAGIAN 01 — APA ITU SISTEM KONTROL ═══ -->")
akhir_modul = s.index("</div><!-- end page-modul -->")
j = s.rindex("</footer>", 0, akhir_modul) + len("</footer>")
s = s[:i] + materi + "\n" + s[j:]

# ── 3. Tugas ──
i = s.index('<div class="hero" data-tab="tugas" style="min-height:60vh">')
j = s.index('\n\n<div class="section">', i)
s = s[:i] + K.TUGAS_HERO + s[j:]
i = s.index("  <!-- ─── PILIHAN GANDA ─── -->")
j = s.index("  <!-- ─── KOMPUTASI EASY/MEDIUM ─── -->", i)
s = s[:i] + K.mc_block() + "\n" + s[j:]
ganti("<strong>kode implementasi Python (Bagian 08 Modul)</strong>", "<strong>kode implementasi Python (Bagian 09 Modul)</strong>")
ganti("seperti yang dijelaskan di Modul (Bagian 08)", "seperti yang dijelaskan di Modul (Bagian 09)")

# ── 4. Forum ──
i = s.index('<div class="page" id="page-forum">')
j = s.index("  <!-- Export & Submit -->", i)
s = s[:i] + K.forum_page() + s[j:]
hash_baru = ", ".join(f"{n}: '{ah(f'{n}_{idx}')}'" for n, idx in K.FORUM_POLL_BENAR.items())
ganti("window._forumPollAnswerHashes = {1: '1vcm311', 2: 'qcan6f', 3: 'fm86uu'};", "window._forumPollAnswerHashes = {" + hash_baru + "};")

# Salinan forum untuk LMS (HTML inline).
a = s.index("&#128203; Skenario: Oven Konveyor yang Suhunya Tidak Pernah Diam")
b = s.index("${ans3}", a)
blok = s[a:b]
blok = blok.replace("&#128203; Skenario: Oven Konveyor yang Suhunya Tidak Pernah Diam", "&#128203; Skenario: Pulau yang Bergantung pada Solar", 1)
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

# Kanvas forum + penangan resize (tidak lagi memanggil fungsi animasi Sisken).
i = s.index("// FORUM CANVAS — Visualisasi suhu oven konveyor")
i = s.rfind("\n", 0, s.rfind("\n", 0, i)) + 1
akhir = "  drawStep(); drawLoop(); drawBlock(); drawDesign(); drawOnOff(); drawForumCanvas();\n});"
j = s.index(akhir, i) + len(akhir)
KANVAS_FORUM = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Kurva beban harian pulau, kapasitas PLTD, dan profil PLTS (Pertemuan 1)
// Beban diskalakan agar puncak 4,2 MW dan rata-rata 2,5 MW, sesuai skenario forum.
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const padL = 46, padR = 20, padT = 18, padB = 28;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  _grid(ctx, padL, padT, plotW, plotH, 12, 4, '#062018');

  const mentah = [2.0, 1.9, 1.8, 1.8, 1.9, 2.0, 2.2, 2.4, 2.5, 2.6, 2.6, 2.6, 2.5, 2.5, 2.5, 2.4, 2.6, 3.4, 4.2, 4.1, 3.9, 3.3, 2.7, 2.2];
  const rataMentah = mentah.reduce((x, y) => x + y, 0) / 24, puncakMentah = Math.max(...mentah);
  const skala = (4.2 - 2.5) / (puncakMentah - rataMentah), geser = 2.5 - skala * rataMentah;
  const beban = mentah.map((v) => geser + skala * v);
  const yMax = 7;
  const sx = (h) => padL + (h / 24) * plotW;
  const sy = (v) => padT + plotH - (v / yMax) * plotH;

  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [0, 2, 4, 6].forEach((v) => ctx.fillText(v + ' MW', padL - 5, sy(v) + 3));
  ctx.textAlign = 'center';
  [0, 6, 12, 18, 24].forEach((h) => ctx.fillText(String(h).padStart(2, '0') + '.00', sx(h), padT + plotH + 16));
  ctx.textAlign = 'left';

  // Profil PLTS 3 MWp (cerah), puncak sekitar pukul 12.00
  ctx.fillStyle = 'rgba(250,204,21,.18)'; ctx.strokeStyle = 'rgba(250,204,21,.9)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(sx(6), sy(0));
  for (let i = 0; i <= 120; i++) { const h = 6 + (i / 120) * 12; const v = 2.4 * Math.pow(Math.max(0, Math.sin(Math.PI * (h - 6) / 12)), 1.4); ctx.lineTo(sx(h), sy(v)); }
  ctx.lineTo(sx(18), sy(0)); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Kapasitas PLTD
  ctx.strokeStyle = 'rgba(249,115,22,.85)'; ctx.lineWidth = 1.5; ctx.setLineDash([7, 4]);
  ctx.beginPath(); ctx.moveTo(padL, sy(6)); ctx.lineTo(padL + plotW, sy(6)); ctx.stroke(); ctx.setLineDash([]);

  // Beban per jam (tangga)
  ctx.fillStyle = 'rgba(34,211,238,.12)'; ctx.beginPath(); ctx.moveTo(sx(0), sy(0));
  beban.forEach((v, h) => { ctx.lineTo(sx(h), sy(v)); ctx.lineTo(sx(h + 1), sy(v)); });
  ctx.lineTo(sx(24), sy(0)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,1)'; ctx.lineWidth = 2.2; ctx.beginPath();
  beban.forEach((v, h) => { h ? ctx.lineTo(sx(h), sy(v)) : ctx.moveTo(sx(h), sy(v)); ctx.lineTo(sx(h + 1), sy(v)); });
  ctx.stroke();

  // Rata-rata dan puncak
  ctx.strokeStyle = 'rgba(0,224,158,.8)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padL, sy(2.5)); ctx.lineTo(padL + plotW, sy(2.5)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(sx(18.5), sy(4.2), 4, 0, Math.PI * 2); ctx.fill();

  ctx.font = '10px JetBrains Mono';
  ctx.fillStyle = 'rgba(249,115,22,.95)'; ctx.fillText('kapasitas PLTD 6 MW', padL + 6, sy(6) - 5);
  ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.fillText('puncak 4,2 MW', sx(18.5) + 7, sy(4.2) - 4);
  ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.fillText('rata-rata 2,5 MW', padL + 6, sy(2.5) - 5);
  ctx.fillStyle = 'rgba(34,211,238,.95)'; ctx.fillText('■ beban pulau', padL + plotW - 250, padT + 12);
  ctx.fillStyle = 'rgba(250,204,21,.95)'; ctx.fillText('■ keluaran PLTS 3 MWp (hari cerah)', padL + plotW - 160, padT + 12);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
s = s[:i] + KANVAS_FORUM + s[j:]

# Pindah ke tab Modul: gambar ulang hanya animasi yang dijeda (yang berjalan
# memperbarui lebar kanvasnya sendiri; memanggilnya lagi menggandakan loop).
ganti("    setTimeout(() => { drawStep(); drawLoop(); drawBlock(); drawDesign(); drawOnOff(); }, 200);",
      "    setTimeout(() => { if (typeof window._ttlGambarUlang === 'function') window._ttlGambarUlang(); }, 200);")

# Rumus melayang di overlay login (peninggalan Getaran) diganti rumus tenaga listrik.
RUMUS_LOGIN = """const formulas = [
    { t: 'P = V·I·cos φ',                 s: 13 },
    { t: 'P = √3·V_L·I_L·cos φ',          s: 12 },
    { t: 'E = P·t',                       s: 14 },
    { t: 'I_L = P/(√3·V_L·cos φ)',        s: 11 },
    { t: 'P_rugi = 3·I²·R',               s: 13 },
    { t: 'f = p·n/120',                   s: 14 },
    { t: 'ω = 2π·n/60',                   s: 13 },
    { t: 'T = P_mek/ω',                   s: 13 },
    { t: 'η = η_p·η_trf·η_t·η_d',         s: 11 },
    { t: 'LF = P_rata/P_puncak',          s: 12 },
    { t: 'CF = E/(P·8760)',               s: 12 },
  ];"""
ganti_re(r"const formulas = \[\n    \{ t: 'mẍ \+ cẋ \+ kx = 0',.*?\n  \];", lambda m: RUMUS_LOGIN)
ganti_re(r"/\* ── Floating physics formulas \([^)\n]*\) ── \*/", lambda m: "/* ── Floating formulas (Konsep Dasar Sistem Tenaga Listrik) ── */")
ganti("// Urutan opsi PG Sisken diacak deterministik per NIM.", "// Urutan opsi PG Sisken dan Teknik Tenaga Listrik diacak deterministik per NIM.")

# ── 5. Ekspor tugas ──
mc_titles = "const MC_QUESTIONS = [\n" + ",\n".join("      " + json.dumps(t, ensure_ascii=False).replace('"', "'") for _, _, t in K.MC) + "\n    ];"
ganti_re(r"const MC_QUESTIONS = \[\n.*?\n    \];", lambda m: mc_titles)
ez = "const compEzDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 1}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_EZ_LABELS)) + "\n    ];"
ganti_re(r"const compEzDefs = \[\n.*?\n    \];", lambda m: ez)
hd = "const compHardDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 11}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.COMP_HARD_LABELS)) + "\n    ];"
ganti_re(r"const compHardDefs = \[\n.*?\n    \];", lambda m: hd)
ganti("// Comp Hard definitions (c11..c15) — Perancangan gain & spesifikasi orde dua", "// Comp Hard definitions (c11..c15) — Perancangan sistem tenaga listrik")

# ── 6. Animasi materi ──
i = s.index('<script id="sisken-modul-1-animations">')
j = s.index("</script>", i) + len("</script>")
s = s[:i] + '<script id="ttl-modul-1-animations">\n' + (SCR / "animasi" / "modul-1.js").read_text(encoding="utf-8") + "</script>" + s[j:]

# ── 7. PDF modul belum tersedia ──
ganti("const MODUL_PDF_URL = '../Modul-Word/Modul-1-Pengantar-Sistem-Kontrol-Cerdas.pdf';\nconst MODUL_PDF_FILENAME = 'Modul-1-Pengantar-Sistem-Kontrol-Cerdas.pdf';",
      "// Versi Word/PDF Modul 1 Teknik Tenaga Listrik belum dibuat; tombol memberi tahu, bukan mengunduh berkas 404.\nconst MODUL_PDF_URL = '';\nconst MODUL_PDF_FILENAME = '';")
ganti("  const btn = document.getElementById('navExportPdf');\n  if (btn && btn.disabled) return;\n  const a = document.createElement('a');",
      "  const btn = document.getElementById('navExportPdf');\n  if (btn && btn.disabled) return;\n  if (!MODUL_PDF_URL) { alert('Versi PDF Modul 1 Teknik Tenaga Listrik belum tersedia. Silakan pelajari modul langsung di halaman ini.'); return; }\n  const a = document.createElement('a');")

# ── 8. Chat asisten: tambah course TTL, lindungi daftar Sisken dari penggantian global ──
i = s.index("  var MODULE_TOPICS = {")
j = s.index("  /** Nama modul aktif dari MODUL_ID halaman. Tanpa jaringan. */", i)
chat = s[i:j]
TOPIK = ["Konsep-Konsep Dasar Sistem Tenaga Listrik", "Komponen-Komponen Sistem Tenaga Listrik", "Daya pada Jaringan DC Satu Sumber",
         "Daya pada Jaringan DC Dua Sumber atau Lebih", "Daya pada Jaringan Listrik AC", "Aliran Daya, Transien & Kompensasi Reaktif Saluran Transmisi",
         "Reaktansi & Impedansi di Sistem Tenaga Listrik", "Sistem Tenaga Listrik Saluran Transmisi", "Pemodelan Saluran Transmisi",
         "Kompensasi dalam Sistem Distribusi", "Sistem Distribusi Tenaga Listrik", "Aliran Daya, Peralatan & Pengembangan Sistem Distribusi",
         "Metode Single Line Diagram", "Metode Analisis Aliran Daya (Load Flow)"]
blok_topik = '    "teknik_tenaga_listrik": [\n' + "".join(f'      "{t_}",\n' for t_ in TOPIK) + "    ],\n  };\n\n  var COURSE_NAMES"
assert chat.count("    ],\n  };\n\n  var COURSE_NAMES") == 1
chat = chat.replace("    ],\n  };\n\n  var COURSE_NAMES", "    ],\n" + blok_topik)
assert chat.count('    "sistem_kendali_cerdas": "Sistem Kendali Cerdas",\n  };') == 1
chat = chat.replace('    "sistem_kendali_cerdas": "Sistem Kendali Cerdas",\n  };', '    "sistem_kendali_cerdas": "Sistem Kendali Cerdas",\n    "teknik_tenaga_listrik": "Teknik Tenaga Listrik",\n  };')
a_ = "/^(getaran-mekanik|math4|optoauto|sistem_kendali_cerdas)-modul-(\\d{1,2})$/"
assert chat.count(a_) == 1
chat = chat.replace(a_, "/^(getaran-mekanik|math4|optoauto|sistem_kendali_cerdas|teknik_tenaga_listrik)-modul-(\\d{1,2})$/")
s = s[:i] + "@@CHAT@@" + s[j:]
ganti("  const courses = ['math4', 'sistem_kendali_cerdas', 'optoauto'];", "@@MIGRASI@@")

# ── 9. Penggantian global identitas course ──
for lama, baru in [("Pengantar Sistem Kontrol Cerdas", "Konsep Dasar Sistem Tenaga Listrik"), ("Pengantar Sistem Kontrol", "Konsep Dasar Sistem Tenaga Listrik"),
                   ("Sistem Kendali Cerdas", "Teknik Tenaga Listrik"), ("SISTEM KENDALI CERDAS", "TEKNIK TENAGA LISTRIK"),
                   ("SistemKendaliCerdas", "TeknikTenagaListrik"), ("sistem_kendali_cerdas", "teknik_tenaga_listrik"), ("2025/2026", "2026/2027")]:
    s = s.replace(lama, baru)
ganti("/^teknik_tenaga_listrik-modul-(\\d+)$/.exec(modulId)", "/^(?:sistem_kendali_cerdas|teknik_tenaga_listrik)-modul-(\\d+)$/.exec(modulId)")
ganti("@@CHAT@@", chat)
ganti("@@MIGRASI@@", "  const courses = ['math4', 'sistem_kendali_cerdas', 'optoauto'];")

# ── 10. Setup Python ──
ganti_re(r"<p>Setup ini disusun khusus agar.*?</p>", lambda m: "<p>" + K.SETUP_PESAN + "</p>")
ganti_re(r'<p class="sp-sub">.*?</p>', lambda m: '<p class="sp-sub">' + K.SETUP_SUB + "</p>")
ganti("NumPy · SciPy · SymPy · control", "NumPy · SciPy · Matplotlib · pandas")
ganti("Instal Library Sistem Kendali", "Instal Library Komputasi")
ganti_re(r'<p style="margin-bottom:1rem;">Library inti untuk komputasi sistem kendali:.*?</p>', lambda m: '<p style="margin-bottom:1rem;">' + K.SETUP_LIB + "</p>")
ganti('\n\n<span class="sp-cm"># Library kontrol sistem (untuk analisis MDOF / state-space)</span>\npip install control', "")
ganti(r"\;sisken\) environment", r"\;ttl\) environment")
ganti("Test Setup — Hello Vibration!", "Test Setup — Hello Power System!")
ganti_re(r'<span class="sp-kw">import</span> numpy <span class="sp-kw">as</span> np\n<span class="sp-kw">import</span> matplotlib\.pyplot <span class="sp-kw">as</span> plt\n\n<span class="sp-cm"># Respons step loop tertutup.*?plt\.tight_layout\(\); plt\.show\(\)</pre>',
         lambda m: K.SETUP_TEST + "</pre>")
ganti("Jika muncul kurva naik yang halus menuju setpoint", "Jika muncul tiga gelombang sinus yang saling bergeser")
ganti("Sekarang siap mengerjakan tugas sistem kendali.", "Sekarang siap mengerjakan tugas teknik tenaga listrik.")

# ── 11. Hero tab Hasil (rumus melayang peninggalan Getaran) ──
ganti(">ωₙ = √(k/m)</span>", ">P = √3·V·I·cos φ</span>")
ganti(">T = 2π/ωₙ</span>", ">f = p·n/120</span>")
ganti(">x(t) = A·cos(ωₙt+φ)</span>", ">E = P·t</span>")

TUJUAN.parent.mkdir(parents=True, exist_ok=True)
TUJUAN.write_text(s, encoding="utf-8", newline="")
print(f"Modul-1 TTL ditulis: {len(s)} karakter; bagian {n_bagian}, animasi {n_animasi}, cell {n_cell}; hash jajak {hash_baru}")

# ── 12. Sisa istilah dari kerangka lama (untuk ditinjau) ──
awal_chat, akhir_chat = s.index("  var MODULE_TOPICS = {"), s.index("  /** Nama modul aktif dari MODUL_ID halaman.")
tanpa_chat = s[:awal_chat] + s[akhir_chat:]
for kata in ["kontrol", "Kontrol", "oven", "Oven", "PID", "setpoint", "loop tertutup", "cvStep", "drawStep", "drawOnOff", "sisken", "Sisken", "SISKEN", "Laplace", "e_ss", "tau_cl", "Getaran", "ωₙ", "Kp"]:
    hits = [m.start() for m in re.finditer(re.escape(kata), tanpa_chat)]
    if hits:
        contoh = " | ".join(tanpa_chat[max(0, h - 50):h + 50].replace("\n", "⏎") for h in hits[:3])
        print(f"  sisa '{kata}': {len(hits)}x — {contoh[:400]}")

# ── 13. Roster, beranda, validator ──
roster = REPO / "Teknik-Tenaga-Listrik" / "Attributes" / "students.json"
r = roster.read_text(encoding="utf-8")
if "41399999901" not in r:
    akhir_baris = r.rstrip().rstrip("]").rstrip()
    assert akhir_baris.endswith("}")
    r = akhir_baris + ',\n  {"nim":"41399999901","nama":"SIMULASI MAHASISWA"}\n]\n'
    json.loads(r)
    roster.write_text(r, encoding="utf-8", newline="")
    print("roster: akun simulasi ditambahkan")

idx = REPO / "index.html"
h = idx.read_text(encoding="utf-8")
awal_kartu = h.index("<h2>Teknik Tenaga Listrik</h2>")
lama_kartu = '<p class="soon">Modul sedang disiapkan.</p>'
pos = h.find(lama_kartu, awal_kartu)
nav = ('<nav class="moduls" aria-label="Modul Teknik Tenaga Listrik">\n'
       '          <a href="Teknik-Tenaga-Listrik/Modul/Modul-1.html" title="Konsep-konsep dasar sistem tenaga listrik">1</a>\n'
       '        </nav>')
if lama_kartu in h[awal_kartu:awal_kartu + 600]:
    h = h[:pos] + nav + h[pos + len(lama_kartu):]
    idx.write_text(h, encoding="utf-8", newline="")
    print("index.html: tautan Modul 1 TTL ditambahkan")

v = REPO / "scripts" / "validate-public-security.mjs"
t_ = v.read_text(encoding="utf-8")
for lama, baru in [("if (authPages !== 75) throw new Error(`Expected 75 admin-auth pages (64 Modul/Exam + 6 OBE + 5 Admin), got ${authPages}`);",
                    "if (authPages !== 76) throw new Error(`Expected 76 admin-auth pages (65 Modul/Exam + 6 OBE + 5 Admin), got ${authPages}`);"),
                   ("if (previewGuarded !== 56) throw new Error(`Expected 56 modul pages with a guarded export button, found ${previewGuarded}`);",
                    "if (previewGuarded !== 57) throw new Error(`Expected 57 modul pages with a guarded export button, found ${previewGuarded}`);")]:
    if lama in t_:
        t_ = t_.replace(lama, baru)
    else:
        assert baru in t_, lama[:50]
v.write_text(t_, encoding="utf-8", newline="")

v = REPO / "scripts" / "validate-all-course-modern-design.mjs"
t_ = v.read_text(encoding="utf-8")
lama = 'const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas"];'
if lama in t_:
    t_ = t_.replace(lama, 'const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik"];\n'
                           '// Course yang dibangun bertahap hanya diperiksa sampai modul yang sudah terbit.\n'
                           'const moduleCount = { "Teknik-Tenaga-Listrik": 1 };')
    for a2, b2 in [("  for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {", "  for (let moduleNumber = 1; moduleNumber <= (moduleCount[course] || 14); moduleNumber += 1) {"),
                   ("if (files !== 56) failures.push(`jumlah modul ${files}, seharusnya 56`);", "if (files !== 57) failures.push(`jumlah modul ${files}, seharusnya 57`);"),
                   ("console.log(`Validated modern academic design on ${files} modules across 4 courses (${sections} sections).`);", "console.log(`Validated modern academic design on ${files} modules across ${courses.length} courses (${sections} sections).`);")]:
        assert t_.count(a2) == 1, a2[:50]
        t_ = t_.replace(a2, b2)
    v.write_text(t_, encoding="utf-8", newline="")
print("validator diperbarui")
