# Membangun Pemodelan-Computer-Aided-Design/Modul/Modul-1.html dari kerangka
# Teknik-Tenaga-Listrik/Modul/Modul-1.html (halaman modul terlengkap yang sudah
# memuat semua lapisan injektor), lalu mengganti identitas, konten, tugas
# (kartu unggah berkas FreeCAD + angka bacaan menggantikan editor Python),
# forum, animasi, halaman Setup (FreeCAD + Setup Python), gambar acuan tiap kartu
# tugas (tugas_gambar.py), ekspor, dan registry chat.
#
# Pakai (dari root repo):  python scripts/cad-modul/bangun-modul-1.py
# Lalu jalankan injektor progres (kotak centang) dan validator:
#   node scripts/tambah-progres-modul.mjs
#   node scripts/validate-public-security.mjs && node scripts/validate-all-course-modern-design.mjs
#
# Modul 2 dst CAD kelak dibangun dari Modul-1.html CAD ini dengan pola bangun.py TTL.
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
import modul_1 as K  # noqa: E402
from setup_python import SETUP_PYTHON_PAGE  # noqa: E402

REPO = SCR.parent.parent
SUMBER = REPO / "Teknik-Tenaga-Listrik" / "Modul" / "Modul-1.html"
TUJUAN = REPO / "Pemodelan-Computer-Aided-Design" / "Modul" / "Modul-1.html"
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

# ── 1. Identitas (jangkar TTL, sebelum penggantian global) ──
JUDUL_TTL = "Konsep Dasar Sistem Tenaga Listrik"
ganti(f"<title>Modul 1 — {JUDUL_TTL} | Teknik Tenaga Listrik</title>", f"<title>Modul 1 — {K.JUDUL} | Pemodelan CAD</title>")
ganti("TENAGALISTRIK // M1", "PEMODELANCAD // M1")
# Tautan Modul-Word/PDF dikosongkan lagi (kerangkanya menunjuk PDF TTL); sesudah skrip ini
# jalan, jalankan ulang `python scripts/cad-modul/pasang-tautan-pdf.py` supaya tombol
# "Export PDF" kembali menunjuk Modul-Word/Modul-1-*.pdf dan penandanya hilang.
ganti_re(r"const MODUL_PDF_URL = '[^']*';", "const MODUL_PDF_URL = '';")
ganti_re(r"const MODUL_PDF_FILENAME = '[^']*';", "const MODUL_PDF_FILENAME = '';")
ganti('<button class="nav-tab" id="tab-setup" onclick="switchTab(\'setup\')">🐍 Setup Python</button>',
      '<button class="nav-tab" id="tab-setup" onclick="switchTab(\'setup\')">🧊 Setup FreeCAD</button>')

# ── 2. Subnav, hero, materi ──
potong('<div id="modulSubnav" class="subnav-bar show">', "</div>", K.SUBNAV)
i = s.index('<div class="hero academic-hero" data-tab="modul" data-module-number="01">')
j = s.index("<!-- COUNTDOWN -->", i)
s = s[:i] + K.HERO + "\n\n" + s[j:]
materi = K.materi()
n_bagian = len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi))
n_animasi = len(re.findall(r'class="anim-title">Animasi \d', materi))
assert (n_bagian, n_animasi) == (9, 4), (n_bagian, n_animasi)
for kunci, nilai in (("@@N_BAGIAN@@", n_bagian), ("@@N_ANIMASI@@", n_animasi)):
    ganti(kunci, str(nilai))
i = s.index("<!-- ═══ BAGIAN 01 — ")
akhir_modul = s.index("</div><!-- end page-modul -->")
j = s.rindex("</footer>", 0, akhir_modul) + len("</footer>")
s = s[:i] + materi + "\n" + s[j:]

# ── 3. Tugas: hero, petunjuk, PG, kartu tugas berkas, tautan Drive opsional ──
i = s.index('<div class="hero" data-tab="tugas" style="min-height:60vh">')
j = s.index('\n\n<div class="section">', i)
s = s[:i] + K.TUGAS_HERO + s[j:]
potong('  <div class="warn-box">\n    <div class="warn-icon">📓</div>', "  <!-- ─── PILIHAN GANDA ─── -->", K.PETUNJUK_HTML + "\n", sertakan_akhir=False)
i = s.index("  <!-- ─── PILIHAN GANDA ─── -->")
j = s.index("  <!-- ─── KOMPUTASI EASY/MEDIUM ─── -->", i)
s = s[:i] + K.mc_block(K.MC) + "\n" + s[j:]
potong("  <!-- ─── KOMPUTASI EASY/MEDIUM ─── -->", "  <!-- GOOGLE DRIVE LINK -->", K.tugas_block(), sertakan_akhir=False)
potong("  <!-- GOOGLE DRIVE LINK -->", "\n</div><!-- end section -->", K.GDRIVE_HTML, sertakan_akhir=False)
ganti('<div>Komp E/M: <span id="scoreCompEz" style="color:var(--amber)">0</span>/20 poin</div>',
      '<div>Tugas 1–3: <span id="scoreCompEz" style="color:var(--amber)">0</span>/18 poin</div>')
ganti('<div>Komp Hard: <span id="scoreCompHard" style="color:var(--pink)">0</span>/20 poin</div>',
      '<div>Tugas 4–5: <span id="scoreCompHard" style="color:var(--pink)">0</span>/22 poin</div>')
ganti("Isi semua jawaban dan link Google Drive, lalu klik", "Jawab semua soal dan kirim kelima tugas pemodelan, lalu klik")
ganti("parts.push(emptyCompEz.length + ' soal komputasi belum diisi');", "parts.push(emptyCompEz.length + ' tugas pemodelan T1–T3 belum dikirim');")
ganti("parts.push(emptyCompHard.length + ' soal komputasi Hard belum diisi');", "parts.push(emptyCompHard.length + ' tugas pemodelan T4–T5 belum dikirim');")

# ── 4. Forum ──
i = s.index('<div class="page" id="page-forum">')
j = s.index("  <!-- Export & Submit -->", i)
s = s[:i] + K.forum_page() + s[j:]
hash_baru = ", ".join(f"{n}: '{ah(f'{n}_{idx}')}'" for n, idx in K.FORUM_POLL_BENAR.items())
ganti_re(r"window\._forumPollAnswerHashes = \{[^}]*\};", lambda m: "window._forumPollAnswerHashes = {" + hash_baru + "};")

a = s.index("&#128203; Skenario: ")
b = s.index("${ans3}", a)
blok = s[a:b]
blok, c = re.subn(r"&#128203; Skenario: [^<]*", "&#128203; Skenario: Bengkel Karya Logam &mdash; 40 Braket dalam Tiga Ukuran", blok, count=1)
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

# ── 5. Skor, tugas berkas (JS), dan ekspor ──
SCORE_JS = '''// Modul-1 Pemodelan CAD — universal 50-poin: 10 PG × 1 + 3 tugas pemodelan × 6 + 2 tugas pemodelan × 11.
// Kartu tugas memakai kunci c1..c5 di server (type comp); "Easy" = T1–T3, "Hard" = T4–T5.
const SCORE_CONFIG = {
  MC_COUNT:       10,
  MC_POINT:       1,
  COMP_EZ_COUNT:  3,
  COMP_EZ_POINT:  6,
  COMP_HARD_COUNT: 2,
  COMP_HARD_POINT: 11,
  CONSOLATION_THRESHOLD: 12,   // 10 PG + 5 tugas = 15 soal; konsolasi server setelah ≥ 12 dicoba
  CONSOLATION_POINT:     1,
  get MC_TOTAL()       { return this.MC_COUNT * this.MC_POINT; },           // 10
  get COMP_EZ_TOTAL()  { return this.COMP_EZ_COUNT * this.COMP_EZ_POINT; }, // 18
  get COMP_HARD_TOTAL(){ return this.COMP_HARD_COUNT * this.COMP_HARD_POINT; }, // 22
  get TOTAL()          { return this.MC_TOTAL + this.COMP_EZ_TOTAL + this.COMP_HARD_TOTAL; } // 50
};
window.SCORE_CONFIG = SCORE_CONFIG;'''
i = s.index("// Modul-1 Teknik Tenaga Listrik (Konsep Dasar) — universal 50-poin")
j = s.index("window.SCORE_CONFIG = SCORE_CONFIG;", i) + len("window.SCORE_CONFIG = SCORE_CONFIG;")
s = s[:i] + SCORE_JS + s[j:]
ganti("// Helper: deteksi apakah qId termasuk Comp Hard (C11–C15)", "// Helper: deteksi apakah qId termasuk tugas 11 poin (T4–T5 = c4, c5)")
ganti("  return !!(m && parseInt(m[1], 10) >= 11 && parseInt(m[1], 10) <= 15);", "  return !!(m && parseInt(m[1], 10) >= 4 && parseInt(m[1], 10) <= 5);")

TUGAS_JS = r'''// ═══ TUGAS PEMODELAN CAD ═══
// Berkas .FCStd diunggah ke server lewat callable unggahBerkasTugas (disimpan di
// bucket privat + metadata Firestore), lalu angka bacaan FreeCAD dikirim ke
// checkModulAnswer; server menolak penilaian bila berkas belum ada dan membekukan
// ringkasan berkas ke ledger. Klien tidak punya kunci/toleransi.
const berkasTerunggah = {};   // qId → {namaBerkas, size, sha256, uploadedAt, versi}
const berkasSyarat = {};      // qId → {ekstensi:[...], maksMB} dari getModulQuestions
window.berkasTerunggah = berkasTerunggah;
function _escCad(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _fmtKB(b) { return (Number(b || 0) / 1024).toFixed(1) + ' KB'; }
function _parseNilai(v) {
  let t = String(v || '').trim().replace(/\s+/g, '');
  if (!t) return null;
  if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');   // 1.234,56
  else t = t.replace(',', '.');                                                        // 1234,56
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function _setBerkasStatus(qId, html, warna) {
  const el = document.getElementById('berkas-status-' + qId); if (!el) return;
  el.innerHTML = html; el.style.color = warna || 'var(--muted)';
}
function _refreshTugasBtn(qId) {
  const btn = document.getElementById('sub-' + qId); if (!btn || compAnswered[qId]) return;
  const inp = document.getElementById('nilai-' + qId);
  const siap = !!berkasTerunggah[qId] && _parseNilai(inp && inp.value) !== null;
  btn.disabled = !siap; btn.style.opacity = siap ? '1' : '.5';
}
function _tampilBerkas(qId) {
  const b = berkasTerunggah[qId]; if (!b) return;
  _setBerkasStatus(qId, '📎 <strong>' + _escCad(b.namaBerkas) + '</strong> · ' + _fmtKB(b.size) + ' · SHA-256 ' + _escCad(String(b.sha256 || '').slice(0, 16)) + '… · v' + (b.versi || 1) + (b.uploadedAt ? ' · ' + _escCad(String(b.uploadedAt).replace('T', ' ').slice(0, 16)) : ''), 'var(--green)');
  _refreshTugasBtn(qId);
}
window._terapkanSyaratBerkas = function(qId, berkas) {
  if (!berkas) return;
  berkasSyarat[qId] = berkas;
  const inp = document.getElementById('berkas-' + qId);
  if (inp && Array.isArray(berkas.ekstensi)) inp.setAttribute('accept', berkas.ekstensi.join(','));
  const lbl = document.getElementById('berkas-syarat-' + qId);
  if (lbl) lbl.textContent = '(' + (berkas.ekstensi || ['.FCStd']).join(', ') + ', maks ' + (berkas.maksMB || 8) + ' MB)';
};
window._kunciTugasCad = function(qId) {
  ['nilai-', 'berkas-', 'unggah-'].forEach((p) => { const el = document.getElementById(p + qId); if (el) { el.disabled = true; el.style.opacity = '.6'; } });
};
window._ringkasTugasCad = function(qId) {
  const b = berkasTerunggah[qId];
  const st = document.getElementById('berkas-status-' + qId);
  const inp = document.getElementById('nilai-' + qId);
  let teks = b ? ('📎 ' + b.namaBerkas + ' · ' + _fmtKB(b.size) + ' · SHA-256 ' + String(b.sha256 || '').slice(0, 16) + '…') : (st ? st.textContent.trim() : '');
  if (inp && inp.value) teks += (teks ? '\n' : '') + 'Angka bacaan: ' + inp.value;
  return teks;
};
function pilihBerkas(qId) {
  const inp = document.getElementById('berkas-' + qId);
  const btn = document.getElementById('unggah-' + qId);
  const f = inp && inp.files && inp.files[0];
  if (!f) { if (btn) btn.disabled = true; return; }
  const syarat = berkasSyarat[qId] || { ekstensi: ['.FCStd'], maksMB: 8 };
  const ext = '.' + String(f.name.split('.').pop() || '').toLowerCase();
  const boleh = (syarat.ekstensi || ['.FCStd']).map((e) => String(e).toLowerCase()).includes(ext);
  const maks = (Number(syarat.maksMB) || 8) * 1048576;
  if (!boleh) { _setBerkasStatus(qId, '⚠ Ekstensi harus ' + (syarat.ekstensi || ['.FCStd']).join(', ') + ' (simpan lewat Ctrl+S di FreeCAD, bukan Export).', 'var(--amber)'); btn.disabled = true; return; }
  if (f.size > maks) { _setBerkasStatus(qId, '⚠ Ukuran ' + _fmtKB(f.size) + ' melebihi batas ' + (syarat.maksMB || 8) + ' MB.', 'var(--amber)'); btn.disabled = true; return; }
  _setBerkasStatus(qId, 'Siap diunggah: ' + _escCad(f.name) + ' (' + _fmtKB(f.size) + '). Klik ⬆ Unggah.', 'var(--text)');
  btn.disabled = false;
}
function _bacaBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => rej(new Error('Gagal membaca berkas'));
    r.readAsDataURL(file);
  });
}
async function unggahBerkas(qId) {
  if (window._previewGuard(qId)) return;
  const fb = document.getElementById('fb-' + qId);
  if (!_firebaseStateLoaded) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⏳ Memuat data jawaban Anda sebelumnya... Tunggu sebentar.'; } return; }
  if (compAnswered[qId]) { if (fb) { fb.className = 'feedback wrong'; fb.textContent = '🔒 Tugas ini sudah dikirim; berkas tidak dapat diganti.'; } return; }
  const me = typeof window.getIdentity === 'function' ? window.getIdentity() : null;
  if (!me || !me.nim || !window._sessionPinHash) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Masuk sebagai mahasiswa (NIM + PIN) untuk mengunggah berkas.'; } return; }
  const inp = document.getElementById('berkas-' + qId);
  const f = inp && inp.files && inp.files[0];
  if (!f) { _setBerkasStatus(qId, '⚠ Pilih berkas .FCStd terlebih dahulu.', 'var(--amber)'); return; }
  const btn = document.getElementById('unggah-' + qId);
  btn.disabled = true; btn.textContent = '⏳ Mengunggah...';
  _setBerkasStatus(qId, '⏳ Mengunggah ' + _escCad(f.name) + ' ke server...', 'var(--muted)');
  try {
    if (typeof window._unggahBerkasCallable !== 'function') throw new Error('Callable unggah belum siap, silakan refresh halaman.');
    const dataBase64 = await _bacaBase64(f);
    const r = await window._unggahBerkasCallable({ modulId: MODUL_ID, qId, nim: me.nim, nama: me.nama, pinHash: window._sessionPinHash, namaBerkas: f.name, dataBase64 });
    const d = (r && r.data) || {};
    berkasTerunggah[qId] = { namaBerkas: d.namaBerkas || f.name, size: d.size || f.size, sha256: d.sha256 || '', uploadedAt: d.uploadedAt || new Date().toISOString(), versi: d.versi || 1 };
    _tampilBerkas(qId);
    if (typeof _saveDraft === 'function') _saveDraft();
    if (fb) { fb.className = 'feedback correct'; fb.textContent = '✅ Berkas terunggah (v' + (d.versi || 1) + '). Isikan angka bacaan dari FreeCAD, lalu klik ▶ Kirim & Validasi.'; }
  } catch (err) {
    const pesan = (err && err.message) ? err.message : 'Gagal mengunggah berkas';
    _setBerkasStatus(qId, '❌ ' + _escCad(pesan), 'var(--pink)');
    if (fb) { fb.className = 'feedback wrong'; fb.textContent = '❌ Unggah gagal: ' + pesan; }
  } finally {
    btn.textContent = '⬆ Unggah'; btn.disabled = false;
  }
}
function onNilaiInput(qId) {
  _refreshTugasBtn(qId);
  checkExportReady();
  if (typeof _saveDraft === 'function') _saveDraft();
}
async function kirimTugas(qId) {
  if (window._previewGuard(qId)) return;
  const fb = document.getElementById('fb-' + qId);
  if (!_firebaseStateLoaded) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⏳ Memuat data jawaban Anda sebelumnya... Tunggu sebentar.'; } return; }
  if (compAnswered[qId]) {
    if (fb) {
      if (compScores[qId] >= (window._isHardComp(qId) ? SCORE_CONFIG.COMP_HARD_POINT : SCORE_CONFIG.COMP_EZ_POINT)) { fb.className = 'feedback correct'; fb.textContent = '✅ Sudah dijawab benar, dan poin telah tercatat.'; }
      else if (compScores[qId] > 0) { fb.className = 'feedback warn'; fb.textContent = '△ Partial credit sudah tercatat (+' + compScores[qId] + ' poin), jadi tidak bisa retry.'; }
      else { fb.className = 'feedback wrong'; fb.textContent = '🔒 Tugas ini sudah dikunci, tidak ada kesempatan ulang.'; }
    }
    return;
  }
  const btn = document.getElementById('sub-' + qId);
  const inp = document.getElementById('nilai-' + qId);
  const nilai = _parseNilai(inp && inp.value);
  if (!berkasTerunggah[qId]) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Unggah berkas .FCStd terlebih dahulu.'; } return; }
  if (nilai === null) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Isikan angka bacaan dari FreeCAD (mis. 3200,5).'; } return; }
  if (!confirm('Kirim T' + qId.slice(1) + ' dengan berkas "' + berkasTerunggah[qId].namaBerkas + '" dan angka ' + inp.value.trim() + '?\nSetelah dikirim, berkas dan angka tidak dapat diubah lagi (satu kesempatan).')) return;

  compAnswered[qId] = true;                       // optimistic lock — server adalah authority
  btn.disabled = true; btn.textContent = '⏳ Memvalidasi...'; btn.classList.remove('running');
  if (fb) { fb.className = 'feedback warn'; fb.textContent = '⏳ Memvalidasi jawaban ke server...'; }
  try {
    if (typeof window._callCheckModulAnswer !== 'function') throw new Error('Callable belum siap, silakan refresh halaman.');
    const res = await window._callCheckModulAnswer(qId, nilai, '', [nilai], [nilai]);
    btn.textContent = (res && (res.correct || res.status === 'correct')) ? '✓ Selesai' : '✗ Terkunci';
    window._kunciTugasCad(qId);
    if (inp) {
      if (res && res.correct) inp.style.borderColor = 'rgba(0,224,158,.5)';
      else if (res && res.status === 'partial') inp.style.borderColor = 'rgba(251,191,36,.3)';
      else inp.style.borderColor = 'rgba(239,68,68,.25)';
    }
    _applyModulServerResult(qId, res, 'comp', btn, fb, null);
    if (typeof _saveDraft === 'function') _saveDraft();
  } catch (err) {
    compAnswered[qId] = false;
    btn.textContent = '▶ Kirim & Validasi';
    ['nilai-', 'berkas-', 'unggah-'].forEach((p) => { const el = document.getElementById(p + qId); if (el) { el.disabled = false; el.style.opacity = '1'; } });
    _refreshTugasBtn(qId);
    _handleModulServerError(err, qId, fb);
  }
}
window.pilihBerkas = pilihBerkas; window.unggahBerkas = unggahBerkas; window.onNilaiInput = onNilaiInput; window.kirimTugas = kirimTugas;

// Alias kompatibilitas untuk _loadScoredQuestions (signature lama diabaikan)
function checkComp(qId) { kirimTugas(qId); }'''
i = s.index("async function runAndCheck(qId, difficulty) {")
akhir = "function checkComp(qId) { runAndCheck(qId, 'easy'); }"
j = s.index(akhir, i) + len(akhir)
s = s[:i] + TUGAS_JS + s[j:]

# Pemuat teks tugas parametrik: 5 tugas, syarat berkas ikut diterapkan.
ganti("if (questions.length !== 15) throw new Error('Server tidak mengembalikan 15 soal.');", "if (questions.length !== 5) throw new Error('Server tidak mengembalikan 5 tugas.');")
ganti("if (!/^c(?:1[0-5]|[1-9])$/.test(question.id)) throw new Error('qId soal tidak valid.');", "if (!/^c[1-5]$/.test(question.id)) throw new Error('qId tugas tidak valid.');")
ganti("""      text.textContent = question.text || '';
      hint.textContent = '💡 ' + (question.hint || 'Kerjakan dengan Python dan tampilkan hasil akhir.');
      input.textContent = question.inputLabel || 'print() hasil akhir';""",
      """      text.textContent = question.text || '';
      hint.textContent = '💡 ' + (question.hint || 'Kerjakan di FreeCAD lalu baca angkanya dari model.');
      input.textContent = question.inputLabel || 'Angka bacaan dari FreeCAD';
      if (question.berkas && typeof window._terapkanSyaratBerkas === 'function') window._terapkanSyaratBerkas(question.id, question.berkas);""")
ganti("    for (let n = 1; n <= 15; n += 1) {\n      const text = document.getElementById('text-c' + n);", "    for (let n = 1; n <= 5; n += 1) {\n      const text = document.getElementById('text-c' + n);")

# Pemulihan dari RTDB: codes/<qId> berisi ringkasan berkas yang dinilai server.
ganti("""    if (data.codes && typeof data.codes === 'object') {
      Object.keys(data.codes).forEach(qId => {
        const ta = document.getElementById('code-' + qId);
        if (ta && !ta.value && typeof data.codes[qId] === 'string') {
          ta.value = data.codes[qId];
        }
      });
    }""",
      """    if (data.codes && typeof data.codes === 'object') {
      Object.keys(data.codes).forEach(qId => {
        const st = document.getElementById('berkas-status-' + qId);
        if (st && typeof data.codes[qId] === 'string') { st.textContent = data.codes[qId]; st.style.color = 'var(--green)'; }
      });
    }""")
ganti("    });\n    updateScore();\n    _markLoaded();   // PEDOMAN §18.2",
      "    });\n    Object.keys(compAnswered).forEach((q) => { if (compAnswered[q] && typeof window._kunciTugasCad === 'function') window._kunciTugasCad(q); });\n    updateScore();\n    _markLoaded();   // PEDOMAN §18.2")

# Draft lokal: angka bacaan + metadata berkas yang sudah terunggah (per NIM).
ganti("""    // Save all 15 code textarea contents (Pedoman §15.4c — textarea = volatile DOM state)
    for (let i = 1; i <= 15; i++) {
      const ta = document.getElementById('code-c' + i);
      if (ta && ta.value) draft.code['c' + i] = ta.value;
    }""",
      """    // Angka bacaan 5 tugas + metadata berkas yang sudah terunggah (belum tentu dikirim)
    for (let i = 1; i <= 5; i++) {
      const inp = document.getElementById('nilai-c' + i);
      if (inp && inp.value) draft.code['c' + i] = inp.value;
    }
    draft.berkas = window.berkasTerunggah || {};""")
ganti("""    // Restore 15 code textareas
    if (draft.code && typeof draft.code === 'object') {
      for (let i = 1; i <= 15; i++) {
        const id = 'c' + i;
        const ta = document.getElementById('code-' + id);
        if (ta && !ta.value && draft.code[id]) ta.value = draft.code[id];
      }
    }""",
      """    // Restore angka bacaan dan metadata berkas untuk tugas yang belum dikirim
    for (let i = 1; i <= 5; i++) {
      const id = 'c' + i;
      if (compAnswered[id]) continue;
      const inp = document.getElementById('nilai-' + id);
      if (inp && !inp.value && draft.code && draft.code[id]) inp.value = draft.code[id];
      if (draft.berkas && draft.berkas[id] && draft.berkas[id].namaBerkas && window.berkasTerunggah) {
        window.berkasTerunggah[id] = draft.berkas[id];
        if (typeof _tampilBerkas === 'function') _tampilBerkas(id);
      }
      if (typeof _refreshTugasBtn === 'function') _refreshTugasBtn(id);
    }""")
ganti("  const gdriveOk = gdriveVal.length > 10 && (gdriveVal.startsWith('https://drive.google.com') || gdriveVal.startsWith('http'));",
      "  // Tautan Drive opsional di course ini: berkas resmi sudah di server saat diunggah.\n  const gdriveOk = !gdriveVal || (gdriveVal.length > 10 && (gdriveVal.startsWith('https://drive.google.com') || gdriveVal.startsWith('http')));")

# Ekspor HTML: judul PG, definisi tugas, ringkasan berkas menggantikan kode Python.
mc_titles = "const MC_QUESTIONS = [\n" + ",\n".join("      " + json.dumps(t, ensure_ascii=False).replace('"', "'") for _, _, t in K.MC) + "\n    ];"
ganti_re(r"const MC_QUESTIONS = \[\n.*?\n    \];", lambda m: mc_titles)
ez = "const compEzDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 1}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.TUGAS_LABELS[:3])) + "\n    ];"
ganti_re(r"const compEzDefs = \[\n.*?\n    \];", lambda m: ez)
hd = "const compHardDefs = [\n" + ",\n".join(f"      {{ id:'c{i + 4}', label:'{lab}', q:'' }}" for i, lab in enumerate(K.TUGAS_LABELS[3:])) + "\n    ];"
ganti_re(r"const compHardDefs = \[\n.*?\n    \];", lambda m: hd)
ganti("  // Comp E/M definitions (c1..c10) — Konsep Dasar Sistem Tenaga Listrik", "  // Tugas pemodelan 6 poin (c1..c3) — Pengenalan FreeCAD dan Menggambar 2D")
ganti("  // Comp Hard definitions (c11..c15) — Perancangan sistem tenaga listrik", "  // Tugas pemodelan 11 poin (c4..c5) — pelat berlubang dan profil L")
ganti("""  const compEzData = compEzDefs.map(d => {
    const ta = document.getElementById('code-' + d.id);
    const fullQ = _getCompFullQ(d.id) || d.q;
    return { ...d, q: fullQ, code: ta ? ta.value.trim() : '', pts: compScores[d.id] || 0 };
  });""",
      """  const compEzData = compEzDefs.map(d => {
    const fullQ = _getCompFullQ(d.id) || d.q;
    return { ...d, q: fullQ, code: window._ringkasTugasCad ? window._ringkasTugasCad(d.id) : '', pts: compScores[d.id] || 0 };
  });""")
ganti("""  const compHardData = compHardDefs.map(d => {
    const ta = document.getElementById('code-' + d.id);
    const fullQ = _getCompFullQ(d.id) || d.q;
    return { ...d, q: fullQ, code: ta ? ta.value.trim() : '', pts: compScores[d.id] || 0 };
  });""",
      """  const compHardData = compHardDefs.map(d => {
    const fullQ = _getCompFullQ(d.id) || d.q;
    return { ...d, q: fullQ, code: window._ringkasTugasCad ? window._ringkasTugasCad(d.id) : '', pts: compScores[d.id] || 0 };
  });""")
ganti("    const numText = id.toUpperCase();\n    const nums = document.querySelectorAll('.comp-num');", "    const numText = 'T' + id.slice(1);\n    const nums = document.querySelectorAll('.comp-num');")
ganti_re(r"<span>Bagian B — Komputasi Easy/Medium \(", "<span>Bagian B — Tugas Pemodelan 1–3 (")
ganti_re(r"<span>Bagian C — Komputasi Hard \(", "<span>Bagian C — Tugas Pemodelan 4–5 (")
ganti('<th style="width:55%">Kode Python</th>', '<th style="width:55%">Berkas FreeCAD &amp; angka bacaan</th>', 2)
ganti("        <td>C${i+1}</td>", "        <td>T${i+1}</td>")
ganti("          <td>C${i+11}</td>", "          <td>T${i+4}</td>")
ganti_re(r"\$\{esc\(d\.code\|\|'\(belum di[^']*'\)\}", lambda m: "${esc(d.code||'(belum diunggah)')}", 2)
ganti("<span>File Jawaban Jupyter Notebook (.ipynb)</span>", "<span>Tautan cadangan Google Drive (opsional)</span>")
ganti("<!-- COMP E/M TABLE — 10 soal -->", "<!-- TUGAS PEMODELAN 1–3 — 3 tugas @6 poin -->")
ganti("<!-- COMP HARD TABLE — 5 soal @4 poin -->", "<!-- TUGAS PEMODELAN 4–5 — 2 tugas @11 poin -->")

# ── 6. Animasi materi ──
i = s.index('<script id="ttl-modul-1-animations">')
j = s.index("</script>", i) + len("</script>")
js = (SCR / "animasi" / "dasar.js").read_text(encoding="utf-8") + "\n" + (SCR / "animasi" / "modul-1.js").read_text(encoding="utf-8")
s = s[:i] + '<script id="cad-modul-1-animations">\n' + js + "</script>" + s[j:]

# ── 7. Halaman Setup → FreeCAD; tab Pembagian Kelompok dibuang; Pyodide dibuang ──
potong('<div class="page" id="page-setup">', "</div><!-- end page-setup -->", K.SETUP_PAGE)
# ── 7a. Tab Setup Python (Miniconda + VS Code + freecadcmd) mendampingi Setup FreeCAD ──
ganti('<button class="nav-tab" id="tab-setup" onclick="switchTab(\'setup\')">🧊 Setup FreeCAD</button>',
      '<button class="nav-tab" id="tab-setup" onclick="switchTab(\'setup\')">🧊 Setup FreeCAD</button>\n    <button class="nav-tab" id="tab-python" onclick="switchTab(\'python\')">🐍 Setup Python</button>')
ganti("</div><!-- end page-setup -->", "</div><!-- end page-setup -->\n\n" + SETUP_PYTHON_PAGE)
m_css = re.search(r"<style>\n/\* CSS variables scoped untuk Setup Python tab \*/\n#page-setup \{[\s\S]*?</style>", s)
assert m_css, "blok CSS Setup tidak ditemukan"
css_py = "\n<style>\n/* Salinan CSS Setup untuk tab Setup Python (#page-python) */" + m_css.group(0)[len("<style>\n/* CSS variables scoped untuk Setup Python tab */"):].replace("#page-setup", "#page-python")
s = s[:m_css.end()] + css_py + s[m_css.end():]
ganti(".page#page-setup,.page#page-kelompok,.score-bar .btn-export,", ".page#page-setup,.page#page-python,.page#page-kelompok,.score-bar .btn-export,")
ganti_re(r'\s*<button class="nav-tab" id="tab-kelompok"[\s\S]*?</button>', "")
ganti_re(r'\s*<div class="page[^"]*" id="page-kelompok">[\s\S]*?<!-- end page-kelompok -->', "")


def saring_style(m):
    isi = m.group(0)[:400]
    return "" if re.search(r"^\s*#page-kelompok\s*\{", isi, re.M) else m.group(0)


s = re.sub(r"<style[^>]*>[\s\S]*?</style>", saring_style, s)
s = re.sub(r"\s*<!--\s*═+\s*PAGE: PEMBAGIAN KELOMPOK[\s\S]*?-->", "", s)
assert 'id="page-kelompok"' not in s
ganti('<script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>\n', "")
s, n_pyo = re.subn(r'\n(?:<!-- Pyodide Status Bar -->\n)?<div id="pyodide-status">\s*<div id="pyodide-dot"></div>\s*<span id="pyodide-status-text">[^<]*</span>\s*</div>\n', "\n", s)
assert n_pyo >= 1, n_pyo
assert 'id="pyodide-status"' not in s
# Pemanasan Pyodide (skrip TTL) dibuang: halaman CAD tidak memuat pyodide.js, jadi
# panggilan getPyodide() hanya menghasilkan galat konsol "loadPyodide is not defined".
ganti("    setTimeout(() => getPyodide().catch(err => console.error('[Modul] Pyodide preload failed:', err)), 500);\n", "")
ganti_re(r"\n// Warm-up: load Pyodide as soon as tugas tab is opened\ndocument\.addEventListener\('DOMContentLoaded', \(\) => \{\n  // Pre-load silently after small delay\n  setTimeout\(\(\) => \{\n    if \(document\.getElementById\('page-tugas'\)\?\.classList\.contains\('active'\)\) getPyodide\(\);\n  \}, 2000\);\n\}\);\n", "\n")
ganti('<span class="score-mini">Komp E/M: <strong>', '<span class="score-mini">Tugas 1–3: <strong>')
ganti('<span class="score-mini">Komp Hard: <strong>', '<span class="score-mini">Tugas 4–5: <strong>')
CSS_TUGAS = '''<style id="cad-tugas-style">
/* Kartu tugas pemodelan CAD: unggah berkas + angka bacaan (menggantikan editor Python) */
.berkas-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}
.berkas-input{flex:1;min-width:220px;background:#020a18;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#a8c0e0}
.berkas-input::file-selector-button{background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.35);color:var(--cyan);border-radius:8px;padding:6px 12px;margin-right:12px;font-family:inherit;font-size:12px;cursor:pointer}
.berkas-btn{background:rgba(0,224,158,.12);border:1px solid rgba(0,224,158,.4);color:var(--green);border-radius:10px;padding:10px 18px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
.berkas-btn:hover:not(:disabled){background:rgba(0,224,158,.22)}
.berkas-btn:disabled{opacity:.45;cursor:not-allowed}
.berkas-status{margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);line-height:1.6;word-break:break-word}
.nilai-input{width:100%;margin-top:8px;background:#020a18;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-family:'JetBrains Mono',monospace;font-size:14px;color:#e2e8f0;outline:none;transition:border-color .2s}
.nilai-input:focus{border-color:rgba(249,115,22,.5)}
.nilai-input:disabled{opacity:.6}
.tugas-gambar{margin:12px 0 4px}
.tugas-gambar svg{width:100%;max-width:560px;height:auto;display:block;margin:0 auto;border-radius:10px;border:1px solid var(--border)}
.tugas-gambar-ket{font-size:11.5px;color:var(--muted);text-align:center;margin-top:6px;line-height:1.5}
</style>
</head>'''
ganti("</style>\n</head>", "</style>\n" + CSS_TUGAS)

# ── 8. Callable unggah, pengacakan PG, rumus melayang login/hasil ──
ganti("const _generateExportCodeCallable = httpsCallable(_functions, 'generateExportCode');\nwindow._generateExportCodeCallable = _generateExportCodeCallable;",
      "const _generateExportCodeCallable = httpsCallable(_functions, 'generateExportCode');\nwindow._generateExportCodeCallable = _generateExportCodeCallable;\n"
      "// Unggah berkas FreeCAD tugas (Pemodelan CAD): dipakai unggahBerkas() di skrip klasik.\nwindow._unggahBerkasCallable = httpsCallable(_functions, 'unggahBerkasTugas');")
ganti("const modulMatch = /^(?:sistem_kendali_cerdas|teknik_tenaga_listrik)-modul-(\\d+)$/.exec(modulId);",
      "const modulMatch = /^(?:sistem_kendali_cerdas|teknik_tenaga_listrik|pemodelan_cad)-modul-(\\d+)$/.exec(modulId);")
ganti("// Urutan opsi PG Sisken dan Teknik Tenaga Listrik diacak deterministik per NIM.", "// Urutan opsi PG Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD diacak deterministik per NIM.")
RUMUS_LOGIN = """const formulas = [
    { t: 'Draft → Rectangle',             s: 13 },
    { t: 'A = n·R²·sin(2π/n)/2',          s: 12 },
    { t: 's = r·θ',                       s: 14 },
    { t: 'Shape.Area',                    s: 13 },
    { t: 'Part → Cut',                    s: 13 },
    { t: 'V, F = Fit all',                s: 12 },
    { t: 'Top · Front · Side',            s: 12 },
    { t: '.FCStd = ZIP',                  s: 13 },
    { t: 'x̄ = ΣAᵢx̄ᵢ / ΣAᵢ',               s: 11 },
    { t: 'Placement (x, y, z)',           s: 12 },
    { t: 'CenterOfMass',                  s: 12 },
  ];"""
ganti_re(r"const formulas = \[\n    \{ t: 'P = V·I·cos φ',.*?\n  \];", lambda m: RUMUS_LOGIN)
ganti_re(r"/\* ── Floating formulas \([^)\n]*\) ── \*/", lambda m: "/* ── Floating formulas (Pengenalan FreeCAD dan Menggambar 2D) ── */")
ganti('--dur:18s;--del:4s">P = √3·V·I·cos φ</span>', '--dur:18s;--del:4s">Draft → Rectangle</span>')
ganti('--dur:20s;--del:8s">f = p·n/120</span>', '--dur:20s;--del:8s">Shape.Area</span>')
ganti('--dur:16s;--del:11s">E = P·t</span>', '--dur:16s;--del:11s">.FCStd</span>')

# ── 9. Chat asisten: tambah course CAD, lindungi daftar course lain dari penggantian global ──
i = s.index("  var MODULE_TOPICS = {")
j = s.index("  /** Nama modul aktif dari MODUL_ID halaman. Tanpa jaringan. */", i)
chat = s[i:j]
TOPIK = ["Pengenalan FreeCAD dan Menggambar 2D", "Drafting dan Penyuntingan 2D: Trim, Extend, Offset, Layer, Dimensi",
         "Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek", "Dimensi, Anotasi, dan Format Gambar Teknik",
         "Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep", "Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D",
         "Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly", "Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik",
         "Evaluasi Hasil Simulasi dan Analisis Kekuatan", "Optimasi Desain Pasca-Simulasi", "Perakitan Komponen dan Analisis Sistem",
         "Identifikasi Masalah Desain dan Solusi Optimasi", "Prinsip Desain Berkelanjutan dalam CAD", "Optimasi Desain untuk Efisiensi dan Lingkungan"]
# Sejak widget chat diseragamkan di 96 halaman (PR #938, dari apply-ai-chat.js di backend),
# kerangka TTL sudah memuat CAD dan bloknya identik byte demi byte dengan halaman CAD; blok itu
# dipakai apa adanya. Penyisipan di bawah hanya untuk kerangka lama yang belum memuat CAD —
# dulu ia menambah kunci "pemodelan_cad" kedua lalu gagal assert.
if '"pemodelan_cad": [' not in chat:
    blok_topik = '    "pemodelan_cad": [\n' + "".join(f'      "{t_}",\n' for t_ in TOPIK) + "    ],\n  };\n\n  var COURSE_NAMES"
    assert chat.count("    ],\n  };\n\n  var COURSE_NAMES") == 1
    chat = chat.replace("    ],\n  };\n\n  var COURSE_NAMES", "    ],\n" + blok_topik)
    assert chat.count('    "teknik_tenaga_listrik": "Teknik Tenaga Listrik",\n  };') == 1
    chat = chat.replace('    "teknik_tenaga_listrik": "Teknik Tenaga Listrik",\n  };', '    "teknik_tenaga_listrik": "Teknik Tenaga Listrik",\n    "pemodelan_cad": "Pemodelan CAD",\n  };')
    a_ = "/^(getaran-mekanik|math4|optoauto|sistem_kendali_cerdas|teknik_tenaga_listrik)-modul-(\\d{1,2})$/"
    assert chat.count(a_) == 1
    chat = chat.replace(a_, "/^(getaran-mekanik|math4|optoauto|sistem_kendali_cerdas|teknik_tenaga_listrik|pemodelan_cad)-modul-(\\d{1,2})$/")
assert chat.count('"pemodelan_cad": [') == 1, "blok topik chat CAD harus tepat satu"
s = s[:i] + "@@CHAT@@" + s[j:]
SHUFFLE_ANCHOR = "const modulMatch = /^(?:sistem_kendali_cerdas|teknik_tenaga_listrik|pemodelan_cad)-modul-(\\d+)$/.exec(modulId);"
ganti(SHUFFLE_ANCHOR, "@@SHUFFLE@@")
ganti("// Urutan opsi PG Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD diacak deterministik per NIM.", "@@SHUFFLE_KOMENTAR@@")

# ── 10. Penggantian global identitas course ──
for lama, baru in [(JUDUL_TTL, K.JUDUL), ("Teknik Tenaga Listrik", "Pemodelan CAD"), ("TEKNIK TENAGA LISTRIK", "PEMODELAN CAD"),
                   ("TeknikTenagaListrik", "PemodelanCAD"), ("teknik_tenaga_listrik", "pemodelan_cad"), ("teknik tenaga listrik", "pemodelan CAD")]:
    s = s.replace(lama, baru)
ganti("@@CHAT@@", chat)
ganti("@@SHUFFLE@@", SHUFFLE_ANCHOR)
ganti("@@SHUFFLE_KOMENTAR@@", "// Urutan opsi PG Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD diacak deterministik per NIM.")

TUJUAN.parent.mkdir(parents=True, exist_ok=True)
TUJUAN.write_text(s, encoding="utf-8", newline="")
print(f"Modul-1 CAD ditulis: {len(s)} karakter; bagian {n_bagian}, animasi {n_animasi}; hash jajak {hash_baru}")

# ── 11. Sisa istilah kerangka TTL/Python (untuk ditinjau) ──
awal_chat, akhir_chat = s.index("  var MODULE_TOPICS = {"), s.index("  /** Nama modul aktif dari MODUL_ID halaman.")
tanpa_chat = s[:awal_chat] + s[akhir_chat:]
for kata in ["listrik", "Listrik", "PLTU", "PLTD", "pulau", "Jupyter", "Pyodide", "pyodide", "Python", "numpy", ".ipynb", "code-c", "cvRantai", "drawRantai",
             "Komputasi", "Komp E/M", "Comp Hard", "tenaga", "kWh", "Kelompok"]:
    hits = [m.start() for m in re.finditer(re.escape(kata), tanpa_chat)]
    if hits:
        contoh = " | ".join(tanpa_chat[max(0, h - 45):h + 45].replace("\n", "⏎") for h in hits[:3])
        print(f"  sisa '{kata}': {len(hits)}x — {contoh[:330]}")

# ── 12. Roster, beranda, validator ──
roster = REPO / "Pemodelan-Computer-Aided-Design" / "Attributes" / "students.json"
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
awal_kartu = h.index("<h2>Pemodelan Computer Aided Design (CAD)</h2>")
lama_kartu = '<p class="soon">Modul sedang disiapkan.</p>'
pos = h.find(lama_kartu, awal_kartu)
nav = ('<nav class="moduls" aria-label="Modul Pemodelan CAD">\n'
       '          <a href="Pemodelan-Computer-Aided-Design/Modul/Modul-1.html" title="Pengenalan FreeCAD dan menggambar 2D">1</a>\n'
       '        </nav>')
if pos >= 0 and pos - awal_kartu < 600:
    h = h[:pos] + nav + h[pos + len(lama_kartu):]
    idx.write_text(h, encoding="utf-8", newline="")
    print("index.html: tautan Modul 1 CAD ditambahkan")

v = REPO / "scripts" / "validate-all-course-modern-design.mjs"
t_ = v.read_text(encoding="utf-8")
for lama, baru in [('const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik"];',
                    'const courses = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];'),
                   ('const moduleCount = { "Teknik-Tenaga-Listrik": 14 };', 'const moduleCount = { "Teknik-Tenaga-Listrik": 14, "Pemodelan-Computer-Aided-Design": 1 };'),
                   ("if (files !== 70) failures.push(`jumlah modul ${files}, seharusnya 70`);", "if (files !== 71) failures.push(`jumlah modul ${files}, seharusnya 71`);")]:
    if lama in t_:
        t_ = t_.replace(lama, baru)
    else:  # sudah dimigrasi (bangun.py menaikkan hitungannya untuk modul berikutnya)
        assert baru in t_ or re.search(r'"Pemodelan-Computer-Aided-Design": \d+', t_), lama[:60]
v.write_text(t_, encoding="utf-8", newline="")

v = REPO / "scripts" / "validate-public-security.mjs"
t_ = v.read_text(encoding="utf-8")
for lama, baru in [("if (authPages !== 91) throw new Error(`Expected 91 admin-auth pages (80 Modul/Exam + 6 OBE + 5 Admin), got ${authPages}`);",
                    "if (authPages !== 93) throw new Error(`Expected 93 admin-auth pages (81 Modul/Exam + 6 OBE + 6 Admin), got ${authPages}`);"),
                   ("if (previewGuarded !== 70) throw new Error(`Expected 70 modul pages with a guarded export button, found ${previewGuarded}`);",
                    "if (previewGuarded !== 71) throw new Error(`Expected 71 modul pages with a guarded export button, found ${previewGuarded}`);")]:
    if lama in t_:
        t_ = t_.replace(lama, baru)
    else:  # sudah dimigrasi
        assert baru in t_ or re.search(r"\(\d+ Modul/Exam \+ 6 OBE \+ 6 Admin\)", t_), lama[:60]
v.write_text(t_, encoding="utf-8", newline="")
print("validator diperbarui")
