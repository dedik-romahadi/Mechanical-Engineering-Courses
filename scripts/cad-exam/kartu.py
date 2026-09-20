# Kartu tugas unggah berkas untuk halaman ujian Pemodelan CAD:
# CSS, skrip klasik (pilih/unggah/kirim), dan perakit kartu di renderUTSQuestions.
#
# Polanya menyalin kartu tugas yang SUDAH JALAN di
# Pemodelan-Computer-Aided-Design/Modul/Modul-5.html, dengan dua perbedaan yang
# wajib diperhatikan:
#   • unggahBerkasTugas dipanggil dengan `examId` (bukan `modulId`);
#   • penilaian lewat `checkExamAnswer` + `_applyServerExamResult`, bukan
#     checkModulAnswer, sehingga penguncian satu-kesempatan memakai jalur ujian.

# ── CSS: menggantikan blok "Pyodide Python Runner" pada kerangka ────────────
CSS = """/* ── Tugas pemodelan CAD: unggah berkas .FCStd + angka bacaan (menggantikan editor Python) ── */
.comp-code-wrap{margin-top:16px}
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
.run-btn{margin-top:12px;padding:9px 24px;border-radius:10px;border:1px solid rgba(14,165,233,.4);background:rgba(14,165,233,.1);color:var(--cyan);font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.run-btn:hover:not(:disabled){background:rgba(14,165,233,.2);box-shadow:0 4px 16px rgba(14,165,233,.15)}
.run-btn:disabled{opacity:.5;cursor:not-allowed}
.run-btn.running{animation:btnPulse .8s ease-in-out infinite}
@keyframes btnPulse{0%,100%{opacity:1}50%{opacity:.5}}"""


# ── Skrip klasik: pengganti seluruh blok Pyodide + runAndCheck ──────────────
def is_hard(rakitan_qid):
    """Definisi window._isHardComp — dipasang SEBELUM SECTION_TOTALS memakainya."""
    badan = (f"  return qId === '{rakitan_qid}';" if rakitan_qid
             else "  return false;   // UTS tidak punya tugas berbobot rakitan")
    return ("// Tugas rakitan (bobot tipe lebih besar) dibedakan dari sub-model biasa.\n"
            "// Didefinisikan lebih awal karena SECTION_TOTALS di bawah memanggilnya.\n"
            "window._isHardComp = function(qId) {\n" + badan + "\n};")


def skrip(rakitan_qid, pre="uts"):
    """rakitan_qid: qId tugas rakitan ('c11' pada UAS) atau None (UTS).
    pre: awalan penanda jadwal halaman ('uts'/'uas') — kerangka UAS memakai
    _uasScheduleState, jadi namanya tidak boleh dipatok."""
    return ("""// ═══════════════════════════════════════════════════════════════════════════
// TUGAS PEMODELAN — UNGGAH BERKAS .FCStd + ANGKA BACAAN
// ═══════════════════════════════════════════════════════════════════════════
// Tidak ada Python di browser pada ujian ini. Mahasiswa memodelkan di FreeCAD,
// mengunggah dokumen .FCStd lewat callable `unggahBerkasTugas` (dengan `examId`,
// BUKAN `modulId`), lalu mengirim satu angka bacaan geometri ke `checkExamAnswer`.
// Server menolak angka bila berkasnya belum terunggah, jadi urutan itu dipaksa
// juga di sini: tombol Kirim baru aktif setelah berkas ada DAN angka terisi.
let compAnswered = {}, compScores = {};
const berkasTerunggah = {};   // qId → {namaBerkas, size, sha256, uploadedAt, versi}
const berkasSyarat = {};      // qId → {ekstensi:[...], maksMB, label} dari getExamQuestions
window.berkasTerunggah = berkasTerunggah;

function _escCad(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _fmtKB(b) { return (Number(b || 0) / 1024).toFixed(1) + ' KB'; }

// Terima "3200,5" maupun "3200.5" dan "1.234,56" (format ribuan Indonesia).
function _parseNilai(v) {
  let t = String(v || '').trim().replace(/\\s+/g, '');
  if (!t) return null;
  if (/^-?\\d{1,3}(\\.\\d{3})+,\\d+$/.test(t)) t = t.replace(/\\./g, '').replace(',', '.');   // 1.234,56
  else t = t.replace(',', '.');                                                            // 1234,56
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
window._parseNilai = _parseNilai;

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
// Syarat berkas (ekstensi + batas ukuran) datang dari server bersama teks soal.
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
window._bukaTugasCad = function(qId) {
  ['nilai-', 'berkas-', 'unggah-'].forEach((p) => { const el = document.getElementById(p + qId); if (el) { el.disabled = false; el.style.opacity = '1'; } });
  _refreshTugasBtn(qId);
};
// Ringkasan berkas + angka untuk laporan ekspor HTML.
window._ringkasTugasCad = function(qId) {
  const b = berkasTerunggah[qId];
  const st = document.getElementById('berkas-status-' + qId);
  const inp = document.getElementById('nilai-' + qId);
  let teks = b ? ('📎 ' + b.namaBerkas + ' · ' + _fmtKB(b.size) + ' · SHA-256 ' + String(b.sha256 || '').slice(0, 16) + '…') : (st ? st.textContent.trim() : '');
  if (inp && inp.value) teks += (teks ? '\\n' : '') + 'Angka bacaan: ' + inp.value;
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
  if (!boleh) { _setBerkasStatus(qId, '⚠ Ekstensi harus ' + (syarat.ekstensi || ['.FCStd']).join(', ') + ' (simpan lewat Ctrl+S di FreeCAD, bukan Export).', 'var(--amber)'); if (btn) btn.disabled = true; return; }
  if (f.size > maks) { _setBerkasStatus(qId, '⚠ Ukuran ' + _fmtKB(f.size) + ' melebihi batas ' + (syarat.maksMB || 8) + ' MB.', 'var(--amber)'); if (btn) btn.disabled = true; return; }
  _setBerkasStatus(qId, 'Siap diunggah: ' + _escCad(f.name) + ' (' + _fmtKB(f.size) + '). Klik ⬆ Unggah.', 'var(--text)');
  if (btn) btn.disabled = false;
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
  if (typeof _utsScheduleState === 'function' && _utsScheduleState() === 'before-start') {
    if (fb) { fb.className = 'feedback warn'; fb.textContent = '🔒 Akses ujian belum dibuka.'; }
    return;
  }
  if (compAnswered[qId]) { if (fb) { fb.className = 'feedback wrong'; fb.textContent = '🔒 Tugas ini sudah dikirim; berkas tidak dapat diganti.'; } return; }
  const me = typeof window.getIdentity === 'function' ? window.getIdentity() : null;
  if (!me || !me.nim || !window._sessionPinHash) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Masuk sebagai mahasiswa (NIM + PIN) untuk mengunggah berkas.'; } return; }
  const inp = document.getElementById('berkas-' + qId);
  const f = inp && inp.files && inp.files[0];
  if (!f) { _setBerkasStatus(qId, '⚠ Pilih berkas .FCStd terlebih dahulu.', 'var(--amber)'); return; }
  const btn = document.getElementById('unggah-' + qId);
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Mengunggah...'; }
  _setBerkasStatus(qId, '⏳ Mengunggah ' + _escCad(f.name) + ' ke server...', 'var(--muted)');
  try {
    if (typeof window._unggahBerkasCallable !== 'function') throw new Error('Callable unggah belum siap, silakan refresh halaman.');
    const dataBase64 = await _bacaBase64(f);
    // PENTING: ujian memakai examId. Mengirim modulId akan ditolak server.
    const r = await window._unggahBerkasCallable({ examId: window.EXAM_ID, qId, nim: me.nim, nama: me.nama, pinHash: window._sessionPinHash, namaBerkas: f.name, dataBase64 });
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
    if (btn) { btn.textContent = '⬆ Unggah'; btn.disabled = false; }
  }
}
function onNilaiInput(qId) {
  _refreshTugasBtn(qId);
  if (typeof checkExportReady === 'function') checkExportReady();
  if (typeof _saveDraft === 'function') _saveDraft();
}
async function kirimTugas(qId) {
  if (window._previewGuard(qId)) return;
  const fb = document.getElementById('fb-' + qId);
  if (!_firebaseStateLoaded) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⏳ Memuat data jawaban Anda sebelumnya... Tunggu sebentar.'; } return; }
  if (typeof _utsScheduleState === 'function' && _utsScheduleState() === 'before-start') {
    if (fb) { fb.className = 'feedback warn'; fb.textContent = '🔒 Akses ujian belum dibuka.'; }
    return;
  }
  if (compAnswered[qId] || _answeredQ.has(qId + '_comp') || _answeredQ.has(qId + '_comp_used')) {
    if (fb && fb.textContent.trim() === '') { fb.className = 'feedback wrong'; fb.textContent = '🔒 Tugas ini sudah dikirim, jadi TIDAK ADA KESEMPATAN ULANG.'; }
    return;
  }
  const btn = document.getElementById('sub-' + qId);
  const inp = document.getElementById('nilai-' + qId);
  const nilai = _parseNilai(inp && inp.value);
  if (!berkasTerunggah[qId]) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Unggah berkas .FCStd terlebih dahulu — server menolak angka tanpa bukti model.'; } return; }
  if (nilai === null) { if (fb) { fb.className = 'feedback warn'; fb.textContent = '⚠ Isikan angka bacaan dari FreeCAD (mis. 3200,5).'; } return; }
  if (!confirm('Kirim tugas ' + qId.toUpperCase() + ' dengan berkas "' + berkasTerunggah[qId].namaBerkas + '" dan angka ' + inp.value.trim() + '?\\nSetelah dikirim, berkas dan angka tidak dapat diubah lagi (satu kesempatan).')) return;

  compAnswered[qId] = true;                       // kunci optimistis — server tetap otoritas
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Memvalidasi...'; btn.classList.add('running'); }
  if (fb) { fb.className = 'feedback warn'; fb.textContent = '⏳ Memvalidasi jawaban ke server...'; }
  try {
    const res = await window._callCheckExamAnswer(qId, nilai, '', [nilai], [nilai]);
    window._kunciTugasCad(qId);
    // Status kartu ikut mencatat poin resmi dari server, supaya mahasiswa tahu
    // berkasnya sudah diterima walau angka bacaannya belum cocok.
    if (res && res.status === 'partial') {
      _setBerkasStatus(qId, '△ Berkas diterima, tetapi angka bacaan belum cocok — partial +' + formatPoints(res.scoreDelta) + ' poin.', 'var(--amber)');
    } else if (res && res.correct) {
      _setBerkasStatus(qId, '✅ Berkas dan angka bacaan diterima — +' + formatPoints(res.scoreDelta) + ' poin.', 'var(--green)');
    }
    if (inp) {
      if (res && res.correct) inp.style.borderColor = 'rgba(0,224,158,.5)';
      else if (res && res.status === 'partial') inp.style.borderColor = 'rgba(251,191,36,.3)';
      else inp.style.borderColor = 'rgba(239,68,68,.25)';
    }
    _applyServerExamResult(qId, res, 'comp', btn, fb);
    if (typeof _saveDraft === 'function') _saveDraft();
  } catch (err) {
    compAnswered[qId] = false;
    if (btn) { btn.textContent = '▶ Kirim & Validasi'; btn.classList.remove('running'); }
    window._bukaTugasCad(qId);
    _handleServerExamError(err, qId, fb);
  }
}
window.pilihBerkas = pilihBerkas; window.unggahBerkas = unggahBerkas;
window.onNilaiInput = onNilaiInput; window.kirimTugas = kirimTugas;

// Alias kompatibilitas untuk pemanggil lama (_loadScoredQuestions).
function checkComp(qId) { kirimTugas(qId); }
""").replace("_utsScheduleState", f"_{pre}ScheduleState")


# ── Perakit kartu di renderUTSQuestions (skrip klasik) ──────────────────────
KARTU_JS = """// Helper: rakit kartu tugas unggah (sub-model atau rakitan)
function _buildTugasCard(q, num, data, sectionLetter, isRakitan) {
  const card = document.createElement('div');
  card.className = 'comp-card reveal' + (isRakitan ? ' comp-hard' : '');
  const points = formatPoints(getQPoints(q.id, isRakitan ? 6 : 2));
  const rgb = isRakitan ? '236,72,153' : '249,115,22';
  const warna = isRakitan ? 'pink' : 'amber';
  const syarat = q.berkas || { ekstensi: ['.FCStd'], maksMB: 8 };
  const N = (typeof window.getN === 'function') ? window.getN() : 0;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  card.id = 'card-' + q.id;
  card.innerHTML = `
    <div class="comp-header">
      <div class="comp-num">${sectionLetter}${String(num).padStart(2, '0')}</div>
      <div class="comp-q">
        <div class="tf-nim-badge" style="background:rgba(${rgb},.1);border-color:rgba(${rgb},.3);color:var(--${warna});margin-bottom:10px">📐 Parameter dari NIM Anda · N = ${N}</div>
        ${data.text}
        <span class="tf-tag tf-tag-nim" style="margin-left:8px;background:rgba(${rgb},.12);border-color:rgba(${rgb},.25);color:var(--${warna})">Tugas model · Modul ${q.modul}</span>
      </div>
      <div class="comp-pts">${points} poin<span style="color:var(--${warna});font-size:11px;margin-left:6px">partial bila berkas ada</span></div>
    </div>
    <div class="comp-hint"><strong style="color:var(--violet)">💡 Petunjuk Pengerjaan di FreeCAD:</strong><br><pre style="margin-top:6px;color:var(--cyan);font-family:'JetBrains Mono',monospace;font-size:12px;white-space:pre-wrap;line-height:1.5">${esc(data.hint || 'Kerjakan di FreeCAD lalu baca angkanya dari model.')}</pre></div>
    <div class="comp-code-wrap">
      <div class="input-label"><span class="col-badge col-badge-code">FreeCAD</span> Berkas model <span id="berkas-syarat-${q.id}" style="color:var(--muted);font-size:10px">(${esc((syarat.ekstensi || ['.FCStd']).join(', '))}, maks ${Number(syarat.maksMB) || 8} MB)</span></div>
      <div class="berkas-row">
        <input type="file" class="berkas-input" id="berkas-${q.id}" accept="${esc((syarat.ekstensi || ['.FCStd']).join(','))}" onchange="pilihBerkas('${q.id}')">
        <button class="berkas-btn" id="unggah-${q.id}" onclick="unggahBerkas('${q.id}')" disabled>⬆ Unggah</button>
      </div>
      <div class="berkas-status" id="berkas-status-${q.id}">Belum ada berkas terunggah.</div>
      <div class="input-label" style="margin-top:14px"><span class="col-badge col-badge-ans">Angka</span> <span id="input-${q.id}">${esc(data.inputLabel || 'Angka bacaan dari FreeCAD')}</span></div>
      <input type="text" inputmode="decimal" class="nilai-input" id="nilai-${q.id}" placeholder="Salin angka dari FreeCAD, mis. 3200,5 atau 3200.5" oninput="onNilaiInput('${q.id}')" autocomplete="off">
    </div>
    <button class="comp-submit run-btn" id="sub-${q.id}" onclick="kirimTugas('${q.id}')" disabled style="opacity:.5">▶ Kirim &amp; Validasi</button>
    <div class="feedback" id="fb-${q.id}"></div>
  `;
  if (typeof window._terapkanSyaratBerkas === 'function') window._terapkanSyaratBerkas(q.id, q.berkas);
  return card;
}
"""
