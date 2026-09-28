/**
 * Jawaban mahasiswa tidak lagi dibaca dari (atau ditulis ulang ke) record RTDB
 * publik; halaman memulihkannya lewat callable getJawabanSaya.
 *
 * MASALAHNYA. Rules RTDB memberi `.read: true` pada visitors/<course>,
 * <slot>, dan <kunci pengunjung>, dan izin baca RTDB menurun ke seluruh anak.
 * Ke-96 halaman modul/ujian mengunduh seluruh node slot untuk papan peringkat
 * dan tab Hasil, sehingga `selections` (huruf PG modul, boolean benar-salah dan
 * indeks PG ujian) dan `codes` (kode Python atau ringkasan berkas) milik teman
 * sekelas ikut terunduh bersama marker benar/salah (scoredQuestions) —
 * cukup untuk menyusun kunci jawaban modul, dan kunci ujian selama jendela
 * ujian. Ledger Firestore (tertutup untuk klien) sudah menyimpan setiap jawaban
 * yang dinilai (userAnswer, mcOrderVersion, codePreview), jadi salinan RTDB
 * hanyalah cache tampilan; penilaian tidak pernah membacanya. Backend
 * menyediakan callable getJawabanSaya (NIM + hash PIN, penguncian gagal PIN,
 * tanpa gerbang jadwal) lalu berhenti menulis, membersihkan, dan melarang
 * `selections`/`codes` di record publik.
 *
 * YANG DILAKUKAN (ke-84 modul dan ke-12 UTS/UAS, di luar penanda
 * AI-CHAT-AGENT; blok sengaja tanpa nama course dan nomor modul karena
 * generator TTL/CAD mengganti keduanya secara global):
 *   1. JAWABAN-PRIVAT:JEMBATAN (v2) — tepat sebelum
 *      `const _generateExportCodeCallable = …`: jembatan
 *      `window._getJawabanSayaCallable`, cache per NIM + hash PIN sesi,
 *      pemanggilan awal sesudah skrip modul selesai,
 *      `window._muatJawabanSaya(batasMs)` (tidak pernah menolak; menunggu
 *      paling lama 2,5 detik, hasil yang terlambat tetap diterapkan), dan
 *      `window._gabungJawabanSaya(data)` yang MEMBUANG selections/codes/
 *      mcOrderVersion record publik lalu mengisinya dari respons
 *      berdaftar-putih (pilihan, mcOrderVersion, kode, ringkasan berkas yang
 *      belum dinilai; scoreDelta ledger menang atas scoreDeltas RTDB). Halaman
 *      bertugas berkas (CAD) diberi tahu lewat `window._tandaiBerkasDiServer`
 *      bahwa berkas yang belum dinilai sudah ada di server, sehingga angka
 *      bisa dikirim tanpa unggah ulang. Kegagalan dibedakan menurut kode:
 *      sementara → dicoba lagi (otomatis 3 dan 10 detik, dan pada
 *      _loadScoredQuestions berikutnya); resource-exhausted (penguncian PIN
 *      per NIM + sumber — keluarga penilaian/soal, bukan kunci per NIM
 *      milik verifyPin)
 *      → pemberitahuan "coba lagi dalam N detik" lalu dicoba lagi sesudah
 *      `details.remainingSeconds`, sesi PIN tetap; unauthenticated → hash PIN
 *      sesi dibuang dan PIN diminta lagi; lainnya → di-cache per muat halaman.
 *   1b. JAWABAN-PRIVAT:HURUF-ASAL (modul saja) — sesudah JEMBATAN, sebelum
 *      urutan acak per NIM diterapkan: huruf kanonik tiap opsi PG
 *      (data-huruf-asal) untuk PILIHAN-PG-PULIH v3 (mcOrderVersion 0).
 *   2. JAWABAN-PRIVAT:IDENTITAS (v2) — tepat sebelum `function saveIdentity(`:
 *      `_identitasTanpaJawaban` (selections, codes, scoreDeltas, pinHash,
 *      pinSetAt dibuang; identitas ber-NIM mahasiswa selalu berperan
 *      'student'), pembersihan salinan identitas lama di localStorage,
 *      `_identitasLogin(rec, nama, nim)` (nama/NIM dari alur login, bukan dari
 *      record), dan `_tulisPengunjung(ref, rec, lama)` (record baru → set()
 *      field identitas + kunjungan; record lama → update() visitCount/lastVisit
 *      saja + hapus pinHash/pinSetAt — satu-satunya yang boleh diubah klien
 *      menurut rules create-only); saveIdentity menyimpan
 *      `_identitasTanpaJawaban(v)`.
 *   3. JAWABAN-PRIVAT:TUNGGU — di _loadScoredQuestions, `get(...)` record
 *      pengunjung menjadi `Promise.all([get(...), window._muatJawabanSaya()])`.
 *   4. JAWABAN-PRIVAT:GABUNG (v2) — tepat sesudah `const data = snap.val();`:
 *      `window._gabungJawabanSaya(data)`, sebelum PILIHAN-PG-PULIH (modul) atau
 *      `_cachedFirebaseData = data;` (ujian; ekspor ujian tetap membaca cache
 *      itu, dan hasil terlambat digabung ke cache lalu
 *      `_reapply<UTS|UAS>StateFromCache()`).
 *   5. Tulisan klien ke record pengunjung tidak lagi mengirim ulang record
 *      lama: penambah kunjungan auto-login (`set(… {...ex, …})`), PIN baru
 *      dengan record lama, verifikasi PIN Matematika 4 Modul 4–14, dan
 *      `_checkConsolationPoint` memakai `_tulisPengunjung`; `_awardCompHardPoint`
 *      lama di Optimalisasi Modul 4 (tidak dipanggil, menulis codes) menjadi
 *      cangkang kosong; `update` diimpor di halaman yang memakainya tanpa impor.
 *   6. Cadangan `freshRec` sesudah PERMISSION_DENIED di verifikasi PIN
 *      (set() ulang seluruh record dengan poin/marker salinan) dihapus: rules
 *      create-only selalu menolaknya; catatan kunjungan yang gagal kini hanya
 *      dicatat di console dan tidak menghalangi login.
 *   7. `saveIdentity(visitorRec|updated|newVisitor|newRecord)` di submitVisitor,
 *      submitPinSetup, dan submitPinVerify menjadi
 *      `saveIdentity(_identitasLogin(…, nama, nim))`: nama roster + NIM yang
 *      diketik (atau _pinFlow), peran 'student' — record visitors/ yang dulu
 *      bisa dibuat lebih dulu oleh siapa pun (peran dosen, nama/NIM palsu)
 *      tidak lagi menentukan identitas lokal.
 *   8. `_handleModulServerError` (modul) dan `_handleServerExamError` (ujian)
 *      menampilkan resource-exhausted sebagai penguncian PIN "coba lagi dalam
 *      N detik" (details.remainingSeconds), bukan galat koneksi.
 *
 * ROLLOUT. Backend men-deploy functions (getJawabanSaya) DAN rules RTDB
 * bersamaan, lalu halaman ini di-merge beberapa menit kemudian (DEPLOY.md
 * backend). Karena itu tidak ada lagi cadangan ke field publik: bila
 * getJawabanSaya gagal, pilihan tidak ditandai, kode hanya dari draft lokal,
 * dan ekspor memakai teks netral. Tulisan klien tidak pernah menghapus
 * `selections`/`codes` (hanya pinHash/pinSetAt lama).
 *
 * REGENERASI. TTL Modul 2–14 dibangun dari TTL Modul-1, CAD Modul-1 dari TTL
 * Modul-1, CAD 2–14 dari CAD Modul-1, UTS/UAS CAD dari UTS/UAS TTL: semuanya
 * mewarisi blok ini (JEMBATAN diletakkan SEBELUM pasangan baris
 * `_generateExportCodeCallable` yang dijadikan jangkar generator CAD). Jalankan
 * `--periksa` sesudah regenerasi, harus 0. Kait `_tandaiBerkasDiServer`
 * milik generator CAD (scripts/cad-modul/bangun-modul-1.py dan
 * scripts/cad-exam/kartu.py), bukan injektor ini.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html (84) dan <Kursus>/Exam/UTS|UAS.html (12).
 * Salinan konflik OneDrive (*-DEDIK-PC.html) dilewati.
 *
 * Idempoten: blok bertanda ditimpa di tempat; jalan kedua melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/jawaban-privat.mjs            # terapkan
 *   node scripts/jawaban-privat.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const PENANDA = "dipasang scripts/jawaban-privat.mjs";
const JANGKAR_JEMBATAN = "\nconst _generateExportCodeCallable = httpsCallable(_functions, 'generateExportCode');\n";
const JANGKAR_GET = "\n  get(ref(db, DB_PATH + '/' + key)).then(snap => {\n";
const JANGKAR_DATA = "\n    const data = snap.val();\n";
const SIMPAN_LAMA = "localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(v));";
const SIMPAN_BARU = "localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(_identitasTanpaJawaban(v)));";

function blokJembatan(jenis) {
  const ujian = jenis !== "Modul";
  const untuk = ujian ? "{ examId: EXAM_ID }" : "{ modulId: MODUL_ID }";
  const terlambat = ujian
    ? `// Hasil yang datang sesudah batas tunggu: digabung ke cache record lalu
// tampilan ujian dipulihkan ulang dari cache (ekspor juga membaca cache itu).
function _terapkanJawabanSayaTerlambat() {
  const cache = (typeof window._cachedFirebaseData === 'function') ? window._cachedFirebaseData() : null;
  if (!cache) return;   // _loadScoredQuestions belum selesai; ia akan menggabungkan sendiri
  window._gabungJawabanSaya(cache);
  if (typeof window._reapply${jenis}StateFromCache === 'function') window._reapply${jenis}StateFromCache();
}`
    : `// Hasil yang datang sesudah batas tunggu: pemulihan diulang (idempoten).
function _terapkanJawabanSayaTerlambat() {
  if (typeof window._loadScoredQuestions === 'function') window._loadScoredQuestions();
}`;
  const mintaPin = ujian
    ? `// Hash PIN sesi ditolak server: modal PIN ulang bawaan halaman ujian.
function _mintaPinLagiJawabanSaya(pesan) {
  if (typeof _promptPinReentry === 'function') _promptPinReentry(pesan);
}`
    : `// Hash PIN sesi ditolak server: modal PIN seperti auto-login di tab baru.
function _mintaPinLagiJawabanSaya(pesan) {
  let me = null;
  try { me = getIdentity(); } catch (e) {}
  if (!me || !me.nim || typeof _showPinInput !== 'function' || typeof window._callVerifyPin !== 'function') return;
  Promise.all([window._callVerifyPin(me.nim), get(ref(db, DB_PATH + '/' + sanitizeKey('mhs_' + me.nim)))]).then(([r, snap]) => {
    if (!r || !r.exists) { _beritahuJawabanSaya('⚠ PIN Anda sudah di-reset. Klik 🚪 Log Out, lalu masuk lagi dengan NIM untuk membuat PIN baru.'); return; }
    _pinFlow = { nama: me.nama, nim: me.nim, nowISO: new Date().toISOString(), existingPin: { pinHash: '\\u0001exists' },
      existingVisitor: snap.exists() ? snap.val() : null, schedOpen: typeof _isScheduleOpen === 'function' ? _isScheduleOpen() : true };
    _showPinInput(me.nama);
    const galat = document.getElementById('pinInputError');
    if (galat) { galat.textContent = '⚠ ' + pesan; galat.style.display = 'block'; }
  }).catch((e) => console.warn('[jawaban-saya] gagal meminta PIN ulang:', (e && (e.code || e.message)) || e));
}`;
  return `// JAWABAN-PRIVAT:JEMBATAN BEGIN v2 — ${PENANDA}
// Jawaban milik sendiri (pilihan PG/benar-salah, kode Python, ringkasan berkas
// tugas) HANYA dari ledger server lewat callable getJawabanSaya
// ({modulId|examId, nim, pinHash}). Record RTDB visitors/ terbaca publik
// (papan peringkat, tab Hasil), jadi selections/codes/mcOrderVersion di sana
// tidak pernah dipakai — juga saat callable gagal: isinya bisa sisa lama atau
// tanaman orang lain, dan functions + rules sudah aktif sebelum halaman ini
// terbit. Tanpa respons, pilihan tidak ditandai, kode hanya dari draft lokal,
// dan ekspor memakai teks netral. Dipanggil untuk tiap pasangan NIM + hash PIN
// sesi (tab baru tanpa PIN: sesudah verifikasi PIN), ditunggu
// _loadScoredQuestions paling lama 2,5 detik, dan hasil yang datang terlambat
// tetap diterapkan. Hanya field berdaftar-putih yang dipakai; kunci/penjelasan
// tidak pernah. scoreDelta ledger (ikut rescale) menang atas scoreDeltas RTDB
// untuk soal yang ada di respons.
// Kegagalan: sementara (internal, unavailable, deadline-exceeded, jaringan) →
// dicoba lagi otomatis 3 lalu 10 detik kemudian dan pada _loadScoredQuestions
// berikutnya; resource-exhausted (penguncian PIN per NIM + sumber, node yang
// sama dengan penilaian/soal, tidak dibagi verifyPin) → pemberitahuan
// "coba lagi dalam N detik", lalu dicoba lagi sesudah details.remainingSeconds,
// sesi PIN tetap; unauthenticated (mis. PIN dirotasi/dicabut dosen; pins/ tidak
// pernah dikosongkan) → hash PIN sesi dibuang (tidak diulang dengan hash yang
// sama: setiap percobaan ikut dihitung penguncian) dan PIN diminta lagi;
// not-found, invalid-argument, dan lainnya → di-cache sampai muat ulang.
window._getJawabanSayaCallable = httpsCallable(_functions, 'getJawabanSaya');
const _JAWABAN_SAYA_UNTUK = ${untuk};
const _JAWABAN_SAYA_TUNGGU_MS = 2500;
const _JAWABAN_SAYA_SEMENTARA = ['internal', 'unavailable', 'deadline-exceeded', 'unknown', 'aborted', 'cancelled', ''];
const _jawabanSaya = { kunci: null, hasil: null, janji: null, terlambat: false, ulangKe: 0, tunggu: null, pewaktu: null };
function _normalkanJawabanSaya(d) {
  if (!d || typeof d !== 'object') return null;
  const qSah = /^(?:tf|mc|ce|ch|c)\\d{1,2}$/;
  const h = { selections: {}, codes: {}, berkas: {}, mcOrderVersion: {}, scoreDeltas: {}, status: {} };
  const jawaban = (d.jawaban && typeof d.jawaban === 'object') ? d.jawaban : {};
  Object.keys(jawaban).forEach((qId) => {
    const j = jawaban[qId];
    if (!qSah.test(qId) || !j || typeof j !== 'object') return;
    const p = j.pilihan;
    if (j.tipe === 'mc' || j.tipe === 'tf') {
      if (typeof p === 'boolean') h.selections[qId] = p;
      else if (typeof p === 'string' && /^[A-D]$/i.test(p.trim())) h.selections[qId] = p.trim().toUpperCase();
      else if (typeof p === 'number' && Number.isInteger(p) && p >= 0 && p <= 9) h.selections[qId] = p;
      if (j.mcOrderVersion === 0 || j.mcOrderVersion === 1) h.mcOrderVersion[qId] = j.mcOrderVersion;
    } else if (j.tipe === 'comp' && typeof j.kode === 'string' && j.kode) {
      h.codes[qId] = j.kode.slice(0, 5000);
    }
    if (typeof j.scoreDelta === 'number' && Number.isFinite(j.scoreDelta)) h.scoreDeltas[qId] = j.scoreDelta;
    if (typeof j.status === 'string') h.status[qId] = j.status;
  });
  // Berkas yang sudah diunggah tetapi belum dinilai: hanya halaman bertugas
  // berkas (kartu berkas-status) yang memakainya.
  const berkas = (d.berkas && typeof d.berkas === 'object') ? d.berkas : {};
  if (typeof window._ringkasTugasCad === 'function') {
    Object.keys(berkas).forEach((qId) => {
      if (qSah.test(qId) && typeof berkas[qId] === 'string' && berkas[qId] && !h.codes[qId]) h.berkas[qId] = berkas[qId].slice(0, 5000);
    });
  }
  return h;
}
// Pemberitahuan kecil (klik untuk menutup) saat pemulihan tertunda.
function _beritahuJawabanSaya(teks) {
  try {
    let el = document.getElementById('jawabanSayaInfo');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jawabanSayaInfo';
      el.setAttribute('role', 'status');
      el.title = 'Klik untuk menutup';
      el.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,560px);padding:10px 14px;border-radius:10px;background:rgba(15,23,42,.96);border:1px solid rgba(251,191,36,.55);color:#fbbf24;font:13px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35);cursor:pointer';
      el.onclick = () => el.remove();
      document.body.appendChild(el);
    }
    el.textContent = teks;
  } catch (e) {}
}
function _tutupPemberitahuanJawabanSaya() {
  try { const el = document.getElementById('jawabanSayaInfo'); if (el) el.remove(); } catch (e) {}
}
${mintaPin}
${terlambat}
function _jadwalUlangJawabanSaya(ms) {
  clearTimeout(_jawabanSaya.pewaktu);
  _jawabanSaya.pewaktu = setTimeout(() => {
    _jawabanSaya.pewaktu = null;
    _jawabanSaya.tunggu = null;   // pewaktu ini dijadwalkan sesudah masa penguncian
    try { window._muatJawabanSaya(0, true); } catch (e) {}   // hasilnya diterapkan begitu datang
  }, ms);
}
function _gagalJawabanSaya(e, kunci, nim) {
  const kode = String((e && e.code) || '').replace(/^functions\\//, '');
  console.warn('[jawaban-saya] getJawabanSaya gagal (' + (kode || 'jaringan') + '); pilihan/kode tidak diambil dari record publik:', (e && e.message) || e);
  if (kode === 'unauthenticated') {
    if (window._sessionPinHash && window._sessionPinHash === String(kunci).split('|')[1]) {
      if (typeof window._setSessionPinHash === 'function') window._setSessionPinHash(null); else window._sessionPinHash = null;
      _mintaPinLagiJawabanSaya('Sesi PIN tidak berlaku lagi (PIN diganti atau di-reset). Masukkan PIN Anda untuk memulihkan jawaban dan melanjutkan.');
    }
    return;
  }
  if (kode === 'resource-exhausted') {
    const detik = Math.min(300, Math.max(1, Math.ceil(Number(e && e.details && e.details.remainingSeconds) || 60)));
    _jawabanSaya.kunci = null;
    _jawabanSaya.tunggu = { nim: String(nim), hingga: Date.now() + detik * 1000 };
    _beritahuJawabanSaya('⏳ Terlalu banyak percobaan PIN untuk NIM ini. Jawaban tersimpan dipulihkan otomatis — coba lagi dalam ' + detik + ' detik.');
    _jadwalUlangJawabanSaya(detik * 1000 + 500);
    return;
  }
  if (_JAWABAN_SAYA_SEMENTARA.includes(kode)) {
    _jawabanSaya.kunci = null;   // _loadScoredQuestions berikutnya mencoba lagi
    if (_jawabanSaya.ulangKe < 2) { _jawabanSaya.ulangKe += 1; _jadwalUlangJawabanSaya(_jawabanSaya.ulangKe === 1 ? 3000 : 10000); }
  }
}
window._muatJawabanSaya = function (batasMs, terapkan) {
  let me = null;
  try { me = getIdentity(); } catch (e) {}
  const pinHash = window._sessionPinHash;
  if (!me || !me.nim || me.role === 'dosen' || me.role === 'guest' || !pinHash
      || typeof window._getJawabanSayaCallable !== 'function') return Promise.resolve(null);
  const kunci = String(me.nim) + '|' + pinHash;
  if (_jawabanSaya.kunci !== kunci) {
    const t = _jawabanSaya.tunggu;
    if (t && t.nim === String(me.nim) && Date.now() < t.hingga) return Promise.resolve(null);   // penguncian PIN: pewaktu yang mencoba lagi
    _jawabanSaya.tunggu = null;
    _jawabanSaya.kunci = kunci;
    _jawabanSaya.hasil = null;
    _jawabanSaya.terlambat = !!terapkan;
    const nim = String(me.nim);
    const permintaan = Object.assign({ nim, pinHash }, _JAWABAN_SAYA_UNTUK);
    _jawabanSaya.janji = Promise.resolve()
      .then(() => window._getJawabanSayaCallable(permintaan))
      .then((r) => ({ h: _normalkanJawabanSaya(r && r.data) }), (e) => ({ e }))
      .then(({ h, e }) => {
        if (_jawabanSaya.kunci !== kunci) return null;   // identitas/PIN berganti selama menunggu
        if (e) { _gagalJawabanSaya(e, kunci, nim); return null; }
        _jawabanSaya.hasil = h;
        _jawabanSaya.ulangKe = 0;
        _tutupPemberitahuanJawabanSaya();
        if (h && _jawabanSaya.terlambat) { _jawabanSaya.terlambat = false; setTimeout(_terapkanJawabanSayaTerlambat, 0); }
        return h;
      });
  }
  if (_jawabanSaya.hasil) return Promise.resolve(_jawabanSaya.hasil);
  const janji = _jawabanSaya.janji;
  const batas = Number(batasMs) > 0 ? Number(batasMs) : _JAWABAN_SAYA_TUNGGU_MS;
  return new Promise((selesai) => {
    let habis = false;
    const t = setTimeout(() => { habis = true; _jawabanSaya.terlambat = true; selesai(null); }, batas);
    janji.then((h) => { if (habis) return; clearTimeout(t); selesai(h); });
  });
};
window._gabungJawabanSaya = function (data) {
  if (!data || typeof data !== 'object') return data;
  // Isi publik record tidak pernah menjadi jawaban (juga bila callable gagal).
  delete data.selections; delete data.codes; delete data.mcOrderVersion;
  const h = _jawabanSaya.hasil;
  let me = null;
  try { me = getIdentity(); } catch (e) {}
  if (!h || !me || String(_jawabanSaya.kunci).split('|')[0] !== String(me.nim)) return data;   // hanya milik identitas ini
  const isi = (field, ...sumber) => {
    const x = Object.assign({}, ...sumber);
    if (Object.keys(x).length) data[field] = x;
  };
  isi('selections', h.selections);
  isi('codes', h.berkas, h.codes);
  isi('mcOrderVersion', h.mcOrderVersion);
  // Poin per soal: ledger (sumber resmi, ikut rescale) untuk setiap soal di
  // respons; scoreDeltas RTDB hanya untuk soal lain. 0 pada jawaban benar/
  // partial berarti poinnya tak diketahui (entri cadangan tanpa scoreDeltas):
  // nilai RTDB, atau cadangan halaman bila tidak ada, yang dipakai.
  const delta = Object.assign({}, (data.scoreDeltas && typeof data.scoreDeltas === 'object') ? data.scoreDeltas : {});
  Object.keys(h.scoreDeltas).forEach((qId) => {
    const v = h.scoreDeltas[qId];
    if (v === 0 && (h.status[qId] === 'correct' || h.status[qId] === 'partial') && !Number.isFinite(Number(delta[qId]))) return;
    delta[qId] = v;
  });
  if (Object.keys(delta).length) data.scoreDeltas = delta;
  // Berkas CAD yang sudah terunggah tetapi belum dinilai: kartunya boleh
  // langsung dikirim tanpa unggah ulang (server memeriksa berkasnya sendiri).
  if (typeof window._tandaiBerkasDiServer === 'function') {
    Object.keys(h.berkas).forEach((qId) => { try { window._tandaiBerkasDiServer(qId); } catch (e) {} });
  }
  return data;
};
setTimeout(() => { try { window._muatJawabanSaya(); } catch (e) {} }, 0);   // mulai lebih awal bila sesi PIN tersimpan
// JAWABAN-PRIVAT:JEMBATAN END v2
`;
}

const BLOK_HURUF_ASAL = `// JAWABAN-PRIVAT:HURUF-ASAL BEGIN v1 — ${PENANDA}
// Huruf kanonik tiap opsi PG (urutan markup) dicatat sebelum urutan acak per
// NIM diterapkan, supaya pilihan berhuruf kanonik (mcOrderVersion 0, attempt
// sebelum acak per NIM terpasang) tetap bisa ditandai oleh PILIHAN-PG-PULIH v3.
document.querySelectorAll('.radio-group[id^="rg-mc"]').forEach((rg) => {
  const opsi = Array.from(rg.querySelectorAll('.radio-option'));
  if (opsi.some((o) => o.dataset.displayLetter || o.dataset.hurufAsal)) return;
  opsi.forEach((o, i) => { o.dataset.hurufAsal = String.fromCharCode(65 + i); });
});
// JAWABAN-PRIVAT:HURUF-ASAL END v1
`;

const BLOK_IDENTITAS = `// JAWABAN-PRIVAT:IDENTITAS BEGIN v2 — ${PENANDA}
// Identitas di localStorage hanya berisi data login (nama, NIM, peran,
// kunjungan): jawaban (selections, codes), scoreDeltas, dan sisa hash PIN lama
// (pinHash, pinSetAt) tidak ikut tersimpan di perangkat yang dipakai
// bergantian, dan salinan lama dibersihkan saat halaman dimuat. Identitas
// ber-NIM mahasiswa selalu berperan 'student', dan sesudah login nama/NIM
// diambil dari alur login (roster + NIM yang diketik, atau _pinFlow) lewat
// _identitasLogin — bukan dari record visitors/ yang dulu bisa dibuat lebih
// dulu oleh siapa pun dengan peran dosen atau nama/NIM palsu.
// Tulisan klien ke record pengunjung lewat _tulisPengunjung. Rules RTDB
// create-only: record baru → set() berisi field identitas + kunjungan saja
// (peran 'student', poin 0, tanpa marker); record yang sudah ada → update()
// hanya visitCount/lastVisit yang berubah, ditambah penghapusan pinHash/pinSetAt
// lama — satu-satunya yang boleh diubah klien. Klien tidak pernah mengirim
// ulang identitas, poin, marker, selections/codes, atau pinHash.
function _identitasTanpaJawaban(v) {
  if (!v || typeof v !== 'object') return v;
  const bersih = Object.assign({}, v);
  ['selections', 'codes', 'scoreDeltas', 'pinHash', 'pinSetAt'].forEach((k) => { delete bersih[k]; });
  if (/^[0-9]{1,20}$/.test(String(bersih.nim || '')) && bersih.role !== 'student') bersih.role = 'student';
  return bersih;
}
function _identitasLogin(rec, nama, nim) {
  return Object.assign({}, rec, { nama, nim: String(nim), role: 'student' });
}
try {
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const k = localStorage.key(i);
    if (!/_identity_/.test(String(k))) continue;
    let v = null;
    try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
    if (v && typeof v === 'object' && JSON.stringify(_identitasTanpaJawaban(v)) !== JSON.stringify(v)) {
      localStorage.setItem(k, JSON.stringify(_identitasTanpaJawaban(v)));
    }
  }
} catch (e) { /* localStorage tidak tersedia */ }
function _tulisPengunjung(r, rec, lama) {
  const bersih = _identitasTanpaJawaban(rec) || {};
  if (!lama || typeof lama !== 'object') {
    const baru = {};
    ['nama', 'nim', 'role', 'timestamp', 'lastVisit', 'visitCount', 'points', 'scoredQuestions'].forEach((k) => { if (bersih[k] !== undefined) baru[k] = bersih[k]; });
    return set(r, baru);
  }
  const patch = {};
  ['visitCount', 'lastVisit'].forEach((k) => {
    if (bersih[k] !== undefined && JSON.stringify(bersih[k]) !== JSON.stringify(lama[k])) patch[k] = bersih[k];
  });
  ['pinHash', 'pinSetAt'].forEach((k) => { if (Object.prototype.hasOwnProperty.call(lama, k)) patch[k] = null; });
  return Object.keys(patch).length ? update(r, patch) : Promise.resolve();
}
// JAWABAN-PRIVAT:IDENTITAS END v2
`;

const BLOK_TUNGGU = `  // JAWABAN-PRIVAT:TUNGGU BEGIN v1 — ${PENANDA}
  // Record RTDB publik (marker, poin, scoreDeltas) dan jawaban sendiri dari
  // getJawabanSaya ditunggu bersama (lihat JAWABAN-PRIVAT:JEMBATAN).
  Promise.all([get(ref(db, DB_PATH + '/' + key)), (typeof window._muatJawabanSaya === 'function' ? window._muatJawabanSaya() : null)]).then(([snap]) => {
  // JAWABAN-PRIVAT:TUNGGU END v1
`;

const BLOK_GABUNG = `    // JAWABAN-PRIVAT:GABUNG BEGIN v2 — ${PENANDA}
    // Pilihan, kode, dan ringkasan berkas milik sendiri dari getJawabanSaya
    // (ledger server) digabung ke data sebelum dipulihkan; selections/codes
    // yang tersisa di record publik dibuang lebih dulu, juga bila callable gagal.
    if (typeof window._gabungJawabanSaya === 'function') window._gabungJawabanSaya(data);
    else { delete data.selections; delete data.codes; delete data.mcOrderVersion; }
    // JAWABAN-PRIVAT:GABUNG END v2
`;

// Cadangan "freshRec" di submitPinVerify: sesudah update kunjungan ditolak
// (PERMISSION_DENIED), record ditulis ulang utuh dengan poin/marker salinan
// snapshot. Rules create-only selalu menolaknya; gagal kunjungan tidak lagi
// menghalangi login (seperti submitVisitor).
const RX_FRESHREC = /        \/\/ Fallback: kalau update gagal[^\n]*\n        if \((?:existingVisitor && )?writeErr && writeErr\.code === 'PERMISSION_DENIED'\) \{\n          const freshRec = \{\n[\s\S]*?\n        \} else \{\n          throw writeErr;\n        \}\n/g;
const TANPA_FRESHREC = `        // JAWABAN-PRIVAT: catatan kunjungan yang gagal tidak menghalangi login
        // (sesi PIN sudah sah). Tidak ada set() ulang seluruh record sebagai
        // cadangan: rules RTDB hanya mengizinkan klien MEMBUAT record, dan
        // poin/marker salinan snapshot bukan milik klien.
`;
// Identitas lokal sesudah login: nama/NIM dari alur login, peran 'student'.
const RX_SIMPAN_REKAMAN = /saveIdentity\((visitorRec|updated|newVisitor|newRecord)\);/g;
// nama + nim fungsi induk harus dari roster/NIM yang diketik atau _pinFlow.
const RX_NAMA_NIM_ALUR = /const \{[^}]*\bnama\b[^}]*\bnim\b[^}]*\} = _pinFlow;|const nim = document\.getElementById\('vNim'\)\.value\.trim\(\);[\s\S]*const nama = student\.nama;/;
// resource-exhausted = penguncian PIN (details.remainingSeconds), bukan galat koneksi.
const PIN_TERKUNCI_DETIK = "Math.max(1, Math.ceil(Number(err && err.details && err.details.remainingSeconds) || 60))";
const GALAT_MODUL_JANGKAR = "  else if (code === 'not-found')           msg = '⚠ Soal belum dikonfigurasi di server.';\n";
const GALAT_MODUL_BARU = `  else if (code === 'resource-exhausted')  msg = '⏳ Terlalu banyak percobaan PIN untuk NIM ini. Coba lagi dalam ' + ${PIN_TERKUNCI_DETIK} + ' detik.';   // penguncian PIN (JAWABAN-PRIVAT), bukan sesi kedaluwarsa\n`;
const GALAT_UJIAN_JANGKAR = "  } else if (code === 'not-found') {\n";
const GALAT_UJIAN_BARU = `  } else if (code === 'resource-exhausted') {
    // Penguncian PIN (JAWABAN-PRIVAT): bukan sesi kedaluwarsa — sesi PIN tetap.
    msg = '⏳ Terlalu banyak percobaan PIN untuk NIM ini. Coba lagi dalam ' + ${PIN_TERKUNCI_DETIK} + ' detik.';
`;

const BLOK_AWARD_HARD = `// JAWABAN-PRIVAT:AWARD-HARD BEGIN v1 — ${PENANDA}
// Penulis klien lama (tidak dipanggil) yang menulis ulang seluruh record
// beserta codes. Server (checkModulAnswer) satu-satunya penulis poin dan
// jawaban; cangkang kosong seperti penulis award lain.
window._awardCompHardPoint = function(_qId) { /* no-op (server-side) */ };
// JAWABAN-PRIVAT:AWARD-HARD END v1
`;

const rxBlok = (nama, indent) => new RegExp(`${indent}// JAWABAN-PRIVAT:${nama} BEGIN[^\\n]*\\n[\\s\\S]*?${indent}// JAWABAN-PRIVAT:${nama} END[^\\n]*\\n`, "g");
const RX = {
  JEMBATAN: rxBlok("JEMBATAN", ""),
  "HURUF-ASAL": rxBlok("HURUF-ASAL", ""),
  IDENTITAS: rxBlok("IDENTITAS", ""),
  TUNGGU: rxBlok("TUNGGU", "  "),
  GABUNG: rxBlok("GABUNG", "    "),
  "AWARD-HARD": rxBlok("AWARD-HARD", ""),
};

// Penambah kunjungan auto-login: set() seluruh record lama (+ selections/codes).
const RX_KUNJUNGAN = /set\((ref\(db, ?`\$\{DB_PATH\}\/\$\{_key\}`\)), (?:_stripLegacyPinFields\((\{ ?\.\.\.ex\b[^\n]*\})\)|(\{ ?\.\.\.ex\b[^\n]*\}))\);/g;
// set() record pengunjung dengan payload yang bisa berasal dari record lama.
const RX_SET_REKAMAN = /\bset\(ref\(db, DB_PATH \+ '\/' \+ key\), (visitorRec|newVisitor|updated|newRecord)\)/g;
const TULIS_REKAMAN = (v) => `_tulisPengunjung(ref(db, DB_PATH + '/' + key), ${v}, existingVisitor)`;
// existingVisitor harus terdeklarasi di fungsi induk.
const RX_EV_DEKLARASI = /(?:const|let)\s+existingVisitor\b|\{[^}]*\bexistingVisitor\b[^}]*\}\s*=\s*_pinFlow\b/;

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

/** Isi seluruh blok AI-CHAT-AGENT (HTML) — harus identik sebelum/sesudah. */
function blokAi(html) {
  return html.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || [];
}

/** Indeks `)` penutup panggilan yang `(`-nya di posisi i (string literal dilompati). */
function tutupPanggilan(s, i) {
  let d = 0;
  for (let k = i; k < s.length; k += 1) {
    const c = s[k];
    if (c === "'" || c === '"' || c === "`") {
      for (k += 1; k < s.length && s[k] !== c; k += 1) if (s[k] === "\\") k += 1;
      continue;
    }
    if (c === "(") d += 1;
    else if (c === ")") { d -= 1; if (d === 0) return k; }
  }
  return -1;
}

/** Pasang/timpa satu blok bertanda; `sisip(html)` dipakai bila belum ada. */
function pasangBlok(html, nama, isi, sisip, catatan) {
  const n = hitungRx(html, RX[nama]);
  if (n > 1) throw new Error(`blok JAWABAN-PRIVAT:${nama} muncul ${n}x, harusnya 1`);
  if (n === 1) {
    const baru = html.replace(new RegExp(RX[nama].source), () => isi);
    if (baru !== html) catatan.push(`${nama.toLowerCase()} diperbarui`);
    return baru;
  }
  catatan.push(`${nama.toLowerCase()} dipasang`);
  return sisip(html);
}

function sisipSebelum(html, jangkar, isi, nama) {
  const n = hitung(html, jangkar);
  if (n !== 1) throw new Error(`jangkar ${nama} muncul ${n}x, harusnya 1`);
  const i = html.indexOf(jangkar) + 1;   // jangkar diawali "\n"
  return html.slice(0, i) + isi + html.slice(i);
}

function proses(berkas) {
  const rel = path.relative(root, berkas).replace(/\\/g, "/");
  const jenis = /\/Exam\/UTS\.html$/.test(rel) ? "UTS" : /\/Exam\/UAS\.html$/.test(rel) ? "UAS" : "Modul";
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];
  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");

  // ── 1) Jembatan callable + cache (sebelum pasangan baris ekspor, jangkar generator CAD) ──
  html = pasangBlok(html, "JEMBATAN", blokJembatan(jenis), (h) => sisipSebelum(h, JANGKAR_JEMBATAN, blokJembatan(jenis), "`const _generateExportCodeCallable = …`"), catatan);
  if (jenis === "Modul") {
    html = pasangBlok(html, "HURUF-ASAL", BLOK_HURUF_ASAL, (h) => {
      const akhir = /\/\/ JAWABAN-PRIVAT:JEMBATAN END[^\n]*\n/.exec(h);
      const i = akhir.index + akhir[0].length;
      return h.slice(0, i) + BLOK_HURUF_ASAL + h.slice(i);
    }, catatan);
  } else if (hitungRx(html, RX["HURUF-ASAL"])) {
    throw new Error("blok HURUF-ASAL hanya untuk halaman modul");
  }

  // ── 2) Identitas tanpa jawaban + penulis record pengunjung ──
  html = pasangBlok(html, "IDENTITAS", BLOK_IDENTITAS, (h) => {
    const n = hitung(h, "\nfunction saveIdentity(");
    if (n !== 1) throw new Error(`\`function saveIdentity(\` muncul ${n}x, harusnya 1`);
    const i = h.indexOf("\nfunction saveIdentity(") + 1;
    return h.slice(0, i) + BLOK_IDENTITAS + h.slice(i);
  }, catatan);
  if (hitung(html, SIMPAN_LAMA) === 1) { html = html.replace(SIMPAN_LAMA, () => SIMPAN_BARU); catatan.push("saveIdentity tanpa jawaban"); }
  if (hitung(html, SIMPAN_BARU) !== 1) throw new Error("saveIdentity harus menyimpan _identitasTanpaJawaban(v) tepat sekali");
  if (hitung(html, "localStorage.setItem(LOCAL_IDENTITY,") !== 1) throw new Error("localStorage.setItem(LOCAL_IDENTITY, …) di luar saveIdentity");
  {
    const s = html.indexOf(SIMPAN_BARU), f = html.lastIndexOf("function saveIdentity(", s);
    if (f < 0 || s - f > 60) throw new Error("penyimpan identitas tidak berada di baris pertama saveIdentity");
  }

  // ── 3–4) Tunggu callable bersama record, gabungkan sebelum pemulihan ──
  html = pasangBlok(html, "TUNGGU", BLOK_TUNGGU, (h) => {
    const n = hitung(h, JANGKAR_GET);
    if (n !== 1) throw new Error(`jangkar \`get(ref(db, DB_PATH + '/' + key)).then(snap => {\` muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_GET, () => "\n" + BLOK_TUNGGU);
  }, catatan);
  html = pasangBlok(html, "GABUNG", BLOK_GABUNG, (h) => {
    const n = hitung(h, JANGKAR_DATA);
    if (n !== 1) throw new Error(`jangkar \`const data = snap.val();\` muncul ${n}x, harusnya 1`);
    const i = h.indexOf(JANGKAR_DATA) + JANGKAR_DATA.length;
    return h.slice(0, i) + BLOK_GABUNG + h.slice(i);
  }, catatan);

  // ── 5) Tulisan klien ke record pengunjung ──
  {
    let n = 0;
    html = html.replace(RX_KUNJUNGAN, (m, r, a, b) => { n += 1; return `_tulisPengunjung(${r}, ${a || b}, ex);`; });
    if (n) catatan.push(`kunjungan×${n}`);
  }
  {
    let n = 0, galat = null;
    html = html.replace(RX_SET_REKAMAN, (m, v, off, s) => {
      const f = [...s.slice(0, off).matchAll(/\n(?:async )?function \w+\(/g)].pop();
      if (!f || !RX_EV_DEKLARASI.test(s.slice(f.index, off))) galat = galat || `existingVisitor tidak terdeklarasi sebelum set(…, ${v})`;
      n += 1;
      return TULIS_REKAMAN(v);
    });
    if (galat) throw new Error(galat);
    if (n) catatan.push(`rekaman×${n}`);
  }
  {
    // _checkConsolationPoint: set(nodeRef, [_stripLegacyPinFields(]Object.assign({}, state, {…})[)])
    const f = html.indexOf("function _checkConsolationPoint(nodeRef, state) {");
    if (f < 0) throw new Error("_checkConsolationPoint tidak ditemukan");
    const s = html.indexOf("set(nodeRef, ", f);
    const ujungFungsi = html.indexOf("\n}\n", f);
    if (s >= 0 && s < ujungFungsi) {
      const tutup = tutupPanggilan(html, s + 3);
      let isi = html.slice(s + "set(nodeRef, ".length, tutup);
      const strip = /^_stripLegacyPinFields\(([\s\S]*)\)$/.exec(isi);
      if (strip) isi = strip[1];
      if (!/^Object\.assign\(\{\}, state, \{[\s\S]*\}\)$/.test(isi)) throw new Error(`bentuk set(nodeRef, …) konsolasi tidak dikenal: ${isi.slice(0, 60)}`);
      html = html.slice(0, s) + `_tulisPengunjung(nodeRef, ${isi}, state)` + html.slice(tutup + 1);
      catatan.push("konsolasi");
    }
  }
  if (hitungRx(html, RX["AWARD-HARD"]) === 1) {
    const baru = html.replace(new RegExp(RX["AWARD-HARD"].source), () => BLOK_AWARD_HARD);
    if (baru !== html) catatan.push("award-hard diperbarui");
    html = baru;
  } else if (html.includes("window._awardCompHardPoint = function(qId) {")) {
    const i = html.indexOf("window._awardCompHardPoint = function(qId) {");
    const j = html.indexOf("\n}\n", i);
    const lama = html.slice(i, j + 3);
    if (!/set\(nodeRef, updated\)/.test(lama) || !/codes: codes/.test(lama)) throw new Error("_awardCompHardPoint lama berbentuk tak dikenal");
    html = html.slice(0, i) + BLOK_AWARD_HARD + html.slice(j + 3);
    catatan.push("award-hard");
  }
  if (html.includes("_tulisPengunjung(")) {
    const rxImpor = /import \{([^}]*)\} from "https:\/\/www\.gstatic\.com\/firebasejs\/12\.11\.0\/firebase-database\.js";/;
    const m = rxImpor.exec(html);
    if (!m) throw new Error("impor firebase-database tidak ditemukan");
    const nama = m[1].split(",").map((x) => x.trim());
    if (!nama.includes("set")) throw new Error("impor firebase-database tanpa set");
    if (!nama.includes("update")) {
      html = html.replace(rxImpor, (x, daftar) => x.replace(`{${daftar}}`, `{${daftar.replace(/\s*$/, "")}, update }`));
      catatan.push("impor update");
    }
  }

  // ── 6) Tanpa cadangan freshRec di verifikasi PIN ──
  {
    let n = 0;
    html = html.replace(RX_FRESHREC, () => { n += 1; return TANPA_FRESHREC; });
    if (n) catatan.push(`freshRec×${n}`);
  }

  // ── 7) Identitas lokal sesudah login dari alur login, bukan dari record ──
  {
    let n = 0, galat = null;
    html = html.replace(RX_SIMPAN_REKAMAN, (m, v, off, s) => {
      const f = [...s.slice(0, off).matchAll(/\n(?:async )?function (\w+)\(/g)].pop();
      if (!f || !["submitVisitor", "submitPinSetup", "submitPinVerify"].includes(f[1]) || !RX_NAMA_NIM_ALUR.test(s.slice(f.index, off))) {
        galat = galat || `saveIdentity(${v}) di luar alur login yang mengikat nama/nim dari roster atau _pinFlow`;
      }
      n += 1;
      return `saveIdentity(_identitasLogin(${v}, nama, nim));`;
    });
    if (galat) throw new Error(galat);
    if (n) catatan.push(`identitas-login×${n}`);
  }

  // ── 8) resource-exhausted = penguncian PIN di penangan galat penilaian ──
  if (jenis === "Modul") {
    if (!html.includes("  else if (code === 'resource-exhausted')")) {
      if (hitung(html, GALAT_MODUL_JANGKAR) !== 1) throw new Error("jangkar cabang not-found _handleModulServerError tidak tepat sekali");
      html = html.replace(GALAT_MODUL_JANGKAR, () => GALAT_MODUL_BARU + GALAT_MODUL_JANGKAR);
      catatan.push("galat-pin-terkunci");
    }
  } else if (!html.includes("  } else if (code === 'resource-exhausted') {")) {
    if (hitung(html, GALAT_UJIAN_JANGKAR) !== 1) throw new Error("jangkar cabang not-found _handleServerExamError tidak tepat sekali");
    html = html.replace(GALAT_UJIAN_JANGKAR, () => GALAT_UJIAN_BARU + GALAT_UJIAN_JANGKAR);
    catatan.push("galat-pin-terkunci");
  }

  // ── Penjaga hasil ──
  for (const nama of ["JEMBATAN", "IDENTITAS", "TUNGGU", "GABUNG", ...(jenis === "Modul" ? ["HURUF-ASAL"] : [])]) {
    if (hitungRx(html, RX[nama]) !== 1) throw new Error(`blok JAWABAN-PRIVAT:${nama} harus tepat sekali`);
  }
  if (hitung(html, blokJembatan(jenis) + (jenis === "Modul" ? BLOK_HURUF_ASAL : "") + JANGKAR_JEMBATAN.slice(1)) !== 1) {
    throw new Error("blok JEMBATAN (+ HURUF-ASAL di modul) harus tepat sebelum `const _generateExportCodeCallable = …`");
  }
  if (hitung(html, "window._getJawabanSayaCallable = httpsCallable(_functions, 'getJawabanSaya');") !== 1) throw new Error("jembatan getJawabanSaya harus tepat sekali");
  if (hitung(html, JANGKAR_DATA + BLOK_GABUNG) !== 1) throw new Error("blok GABUNG harus tepat sesudah `const data = snap.val();`");
  if (hitung(html, BLOK_TUNGGU + "    if (!snap.exists())") !== 1 && hitung(html, BLOK_TUNGGU + "    // Exit path 2:") !== 1) {
    throw new Error("blok TUNGGU harus membuka callback pemulihan (_loadScoredQuestions)");
  }
  {
    // TUNGGU dan GABUNG di _loadScoredQuestions yang sama, dan di skrip modul
    // yang sama dengan JEMBATAN/IDENTITAS (impor get/set/update, getIdentity).
    const t = html.indexOf("  // JAWABAN-PRIVAT:TUNGGU BEGIN"), g = html.indexOf("    // JAWABAN-PRIVAT:GABUNG BEGIN");
    const d = html.lastIndexOf("window._loadScoredQuestions = function", t);
    if (d < 0 || g < t || html.slice(t, g).includes("\n};\n")) throw new Error("TUNGGU/GABUNG tidak berada di _loadScoredQuestions yang sama");
    const skrip = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].find((x) => x.index < t && t < x.index + x[0].length);
    if (!skrip || !/type="module"/.test(skrip[1])) throw new Error("_loadScoredQuestions tidak berada di <script type=\"module\">");
    const a = skrip.index, b = skrip.index + skrip[0].length;
    for (const [nama, teks] of [["JEMBATAN", "// JAWABAN-PRIVAT:JEMBATAN BEGIN"], ["IDENTITAS", "// JAWABAN-PRIVAT:IDENTITAS BEGIN"], ["impor database", "firebase-database.js\";"], ["getIdentity", "function getIdentity("]]) {
      const k = html.indexOf(teks);
      if (k < a || k > b) throw new Error(`${nama} tidak berada di skrip modul yang sama dengan _loadScoredQuestions`);
    }
    const id = jenis === "Modul" ? "const MODUL_ID = " : "const EXAM_ID = ";
    const k = html.indexOf(id, a);
    if (k < 0 || k > html.indexOf("// JAWABAN-PRIVAT:JEMBATAN BEGIN")) throw new Error(`${id.trim()} harus terdeklarasi sebelum blok JEMBATAN`);
    if (jenis === "Modul") {
      const acak = html.indexOf("\nif (typeof shuffleMCOptions === 'function') shuffleMCOptions();", a);
      if (acak >= 0 && acak < html.indexOf("// JAWABAN-PRIVAT:HURUF-ASAL BEGIN")) throw new Error("HURUF-ASAL harus berjalan sebelum urutan acak per NIM diterapkan");
    } else if (!html.includes(`window._reapply${jenis}StateFromCache = function`) || !html.includes("window._cachedFirebaseData = () => _cachedFirebaseData;")) {
      throw new Error(`_reapply${jenis}StateFromCache/_cachedFirebaseData tidak ditemukan`);
    }
    if (jenis !== "Modul" && hitung(html, JANGKAR_DATA + BLOK_GABUNG + "    _cachedFirebaseData = data;") !== 1) throw new Error("GABUNG ujian harus tepat sebelum `_cachedFirebaseData = data;`");
    // Permintaan PIN ulang dari JEMBATAN (unauthenticated): modul memakai
    // _pinFlow/_showPinInput/sanitizeKey skrip yang sama, ujian _promptPinReentry.
    const pinSkrip = jenis === "Modul"
      ? [["let _pinFlow", "\nlet _pinFlow = "], ["_showPinInput", "\nfunction _showPinInput("], ["sanitizeKey", "\nfunction sanitizeKey("], ["_isScheduleOpen", "\nfunction _isScheduleOpen("]]
      : [["_promptPinReentry", "\nasync function _promptPinReentry("]];
    for (const [nama, teks] of pinSkrip) {
      const k = html.indexOf(teks);
      if (k < a || k > b || hitung(html, teks) !== 1) throw new Error(`${nama} harus tepat sekali di skrip modul yang sama dengan blok JEMBATAN`);
    }
  }
  if (new RegExp(RX_KUNJUNGAN.source).test(html)) throw new Error("penambah kunjungan set(…{...ex…}) masih tersisa");
  if (/\bset\(ref\(db, DB_PATH \+ '\/' \+ key\),/.test(html)) throw new Error("set() record pengunjung selain lewat _tulisPengunjung masih tersisa");
  if (html.includes("freshRec")) throw new Error("cadangan freshRec (set() ulang seluruh record) masih tersisa");
  if (hitung(html, TANPA_FRESHREC) > 1) throw new Error("catatan pengganti freshRec muncul lebih dari sekali");
  {
    const sisa = [...html.matchAll(/\bsaveIdentity\((?!_identitasLogin\()([A-Za-z_$][\w$]*)\);/g)].map((m) => m[1]);
    if (sisa.length) throw new Error(`saveIdentity(${sisa.join(", ")}) menyimpan record apa adanya — pakai _identitasLogin(…, nama, nim)`);
  }
  if (jenis === "Modul" ? hitung(html, GALAT_MODUL_BARU + GALAT_MODUL_JANGKAR) !== 1 : hitung(html, GALAT_UJIAN_BARU + GALAT_UJIAN_JANGKAR) !== 1) {
    throw new Error("cabang resource-exhausted penangan galat penilaian harus tepat sekali, tepat sebelum cabang not-found");
  }
  if (/\bset\(nodeRef\b/.test(html)) throw new Error("set(nodeRef, …) masih tersisa");
  if (/\bset\(ref\(db, ?`\$\{DB_PATH\}\/\$\{_key\}`\)/.test(html)) throw new Error("set() record pengunjung auto-login masih tersisa");
  const aiLama = blokAi(awal), aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) if (b.includes("JAWABAN-PRIVAT") || b.includes("getJawabanSaya")) throw new Error("sisipan JAWABAN-PRIVAT jatuh di dalam blok AI-CHAT-AGENT");

  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dirModul = path.join(root, kursus.name, "Modul");
  if (fs.existsSync(dirModul)) for (const nama of fs.readdirSync(dirModul)) if (/^Modul-\d+\.html$/.test(nama)) berkas.push(path.join(dirModul, nama));
  const dirUjian = path.join(root, kursus.name, "Exam");
  if (fs.existsSync(dirUjian)) for (const nama of fs.readdirSync(dirUjian)) if (/^(?:UTS|UAS)\.html$/.test(nama)) berkas.push(path.join(dirUjian, nama));
}
if (berkas.length !== 96) throw new Error(`harap 96 halaman (84 <Kursus>/Modul/Modul-N.html + 12 <Kursus>/Exam/UTS|UAS.html), ditemukan ${berkas.length}`);

let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  let h;
  try { h = proses(f); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c.replace(/×\d+$/, "")] = (rekap[c.replace(/×\d+$/, "")] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} dari ${berkas.length} halaman modul/ujian ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
