/**
 * Draft materi modul: kode komputasi, tautan Google Drive, teks Forum, serta
 * angka bacaan dan metadata berkas Pemodelan CAD yang belum dikirim tersimpan
 * per modul per NIM di localStorage dan pulih setelah muat ulang (Pedoman
 * §6.3). Berlaku untuk ke-84 <Kursus>/Modul/Modul-N.html.
 *
 * MASALAHNYA (ditemukan 29 September 2026). Pedoman §6.3 dan registry chat AI
 * backend (pemulihanSetelahRefresh) menjanjikan draft di browser per NIM, tetapi:
 *   1. `_draftKey()` (skrip klasik) di 43 halaman (Getaran Modul 1, Sisken,
 *      Teknik Tenaga Listrik, Pemodelan CAD) membaca LOCAL_IDENTITY dan
 *      MODULE_ID, padahal keduanya `const` milik `<script type="module">`:
 *      ReferenceError → `catch` → null, jadi draft tidak pernah tersimpan
 *      (termasuk angka bacaan dan metadata unggahan CAD).
 *   2. Kunci draft yang hidup memakai literal cadangan per halaman, dan
 *      Matematika 4 Modul 1/2/3/5 sempat berbagi satu kunci (sebagian dibenahi
 *      blok KUNCI-IDENTITAS:DRAF #970 — blok itu kini DIGANTI blok di bawah).
 *   3. Di halaman yang kuncinya hidup, draft dikosongkan setiap muat ulang:
 *      `_markLoaded` → checkExportReady()/checkForumReady() → `_saveDraft()`
 *      menulis textarea yang masih kosong SEBELUM `_loadDraft()` membacanya.
 *      Jalur lain yang sama: terapkanProgres (PROGRES-MODUL), pemulihan kirim
 *      ulang CAD (`_bukaKirimUlangCad`), DOMContentLoaded Sisken 2–14, dan jaring
 *      10 detik.
 *
 * YANG DIPASANG (dua blok, sama persis di ke-84 halaman, tanpa token course):
 *   (a) `// DRAFT-MODUL:KUNCI BEGIN vN` … `END vN` — MENJADI ISI
 *       `function _draftKey() { … }` (seluruh fungsi lama diganti; bila fungsi
 *       itu dibungkus blok KUNCI-IDENTITAS:DRAF, bloknya ikut dibuang). Kunci
 *       `draft_modul_<window.MODUL_ID>_<NIM>` tanpa literal course/nomor, jadi
 *       tahan regenerasi generator TTL/CAD/Sisken; NIM dari `getIdentityLocal()`
 *       (kuncinya dijaga samakan-kunci-identitas.mjs = LOCAL_IDENTITY). Hanya
 *       peran `student` (termasuk akun simulasi) dengan sesi PIN
 *       (`_sessionPinHash`) di luar Mode Preview; dosen, tamu, Preview, dan
 *       sesi tanpa PIN → null (draft tidak dibaca maupun ditulis).
 *   (b) `<!-- DRAFT-MODUL:PENJAGA BEGIN vN -->` `<script>` klasik
 *       `<!-- DRAFT-MODUL:PENJAGA END vN -->` tepat sebelum
 *       `<!-- PROGRES-MODUL: awal -->` (jadi sebelum blok PROGRES-MODUL dan
 *       sebelum PILIHAN-POLL-FORUM, yang berada sesudah
 *       `<!-- PROGRES-MODUL: akhir -->`). Saat parsing ia membungkus
 *       `window._saveDraft`/`window._loadDraft` (panggilan polos di halaman —
 *       checkExportReady, checkForumReady, onCodeInput, onNilaiInput,
 *       unggahBerkas, kirimTugas, `_markLoaded` — ikut memakai pembungkus karena
 *       fungsi global klasik adalah properti window):
 *         - muat hanya bila kunci ada dan SESI itu (kunci + hash PIN sesi)
 *           (1) sudah dimuat datanya: `_loadDraft()` dari `_markLoaded`
 *           (`_loadScoredQuestions`, sesudah `_firebaseStateLoaded = true`) yang
 *           berjalan dengan sesi itu — sesudah marker dan kode ledger
 *           (`getJawabanSaya`) diterapkan, sehingga draft hanya mengisi kolom yang
 *           masih kosong; dan (2) sudah DITERIMA SERVER: event
 *           `progres-modul:diterapkan` {ok:true} dengan sesi itu (getModulProgress
 *           memeriksa PIN NIM itu, `_autentikasiMhs`). Syarat (2) ditambahkan di v2:
 *           hash PIN sesi (sessionStorage per tab) tidak terikat NIM, jadi sesudah
 *           mahasiswa A Keluar, auto-login identitas mahasiswa B di tab yang sama
 *           membawa hash A — v1 memuat draft B tanpa PIN B bila getJawabanSaya
 *           lebih lambat daripada batas tunggunya (setara gerbang `kartuAda()`
 *           DRAFT-UJIAN: kartu soal hanya datang dari getExamQuestions ber-PIN).
 *           Kolom kode/angka soal yang sudah dinilai (`compAnswered`) dikembalikan
 *           sesudah `_loadDraft` asli: kode ledger yang datang terlambat (> batas
 *           tunggu 2,5 detik) tetap mengisi kolom kosongnya, bukan draft.
 *           Pemuatan tanpa sesi PIN (tab baru sebelum PIN) dan jaring 10 detik
 *           tidak dihitung. Ragam yang `_markLoaded`-nya fungsi klasik global
 *           (tanpa `_loadDraft` di jalur tanpa record/gagal) dibungkus juga:
 *           `window._markLoaded` yang ada saat parsing mencatat sesi siap;
 *         - simpan hanya sesudah draft kunci itu dimuat (bila belum: muat dulu;
 *           bila belum bisa dimuat TIDAK menulis). Tidak ada lagi textarea
 *           kosong yang menimpa draft; sesudah muat pertama, gabungan draft +
 *           isian yang sudah ada disimpan sekali;
 *         - forum server menang atas draft, kecuali suntingan yang BELUM
 *           TERKIRIM: saat draft pertama kali dimuat (forum server sudah
 *           diketahui dari event yang sama), per jawaban fqN: draft ≠ '' dan ≠
 *           server dan ≠ salinan tersinkron terakhir (`<kunci>_sinkron`, ditulis
 *           dari forum server dan dari event `progres-modul:forum-tersimpan`
 *           sesudah saveModulForum sukses) → draft dipakai (textarea yang masih =
 *           server/kosong diisi draft, lalu dikirim PROGRES-MODUL); selain itu
 *           textarea yang masih = draft diisi teks server — juga teks kosong bila
 *           server punya catatan forum (jawaban yang sengaja dikosongkan di
 *           perangkat lain). Textarea yang sudah diubah pengguna tidak disentuh.
 *           Sesudah penyelarasan itu teks Forum draft = isi textarea. Simpanan
 *           berikutnya hanya mengambil teks Forum dari textarea yang DISUNTING DI
 *           TAB INI (event `input`; tanda dilepas sesudah kiriman sukses); jawaban
 *           lain mempertahankan teks draft yang sudah tersimpan. Tanpa itu tab
 *           kedua yang masih memuat teks lama menimpa draft lewat simpanan kode/
 *           Drive/checkExportReady, lalu teks lama itu terbaca sebagai "belum
 *           terkirim" dan dikirim menimpa forum yang lebih baru. Kiriman forum tetap
 *           hanya lewat simpanForum PROGRES-MODUL (PENJAGA-FORUM);
 *         - tugas CAD yang berkasnya diketahui server (`berkasDiServer`: terunggah
 *           tetapi belum dinilai, atau dibuka lagi untuk kirim ulang): metadata
 *           berkas dari draft tidak dipasang — `berkasTerunggah[qId]` dan kartu
 *           `berkas-status-qId` dikembalikan ke keadaan sebelum `_loadDraft` asli,
 *           dan metadata draft yang terpasang pada pemuatan sebelumnya (ringkasan
 *           server datang terlambat) dibuang. Server menilai berkas terbaru di
 *           `tugasBerkas`, jadi kartu dan konfirmasi kirim tidak boleh menyebut
 *           berkas lama dari draft;
 *         - NIM mahasiswa berganti tanpa muat ulang (logout paksa karena jadwal
 *           dihapus atau PIN kosong, lalu NIM lain masuk di tab yang sama): pada
 *           `_markLoaded` atau progres pertama NIM baru, kolom draft dikosongkan
 *           dan halaman dimuat ulang — isian NIM sebelumnya tidak masuk draft
 *           maupun forum NIM baru;
 *         - setiap `input` pada `code-cN`, `nilai-cN`, `gdrive-link`, atau
 *           `ans-fqN` menyimpan draft (beberapa kolom kode tidak punya
 *           `oninput`).
 *       `window._draftSudahDimuat()` melaporkan status (dipakai uji).
 *       Prasyarat halaman (diperiksa sebelum memasang): fungsi draft, kunci,
 *       identitas, dan `let _firebaseStateLoaded` di skrip klasik sebelum
 *       PROGRES-MODUL; `window.MODUL_ID = MODUL_ID;` di skrip module;
 *       pemanggil `_loadDraft` hanya `_markLoaded` (daftar tetap), karena
 *       pemanggil lain akan terbaca sebagai tanda Firebase siap; tidak ada
 *       penugasan `_saveDraft`/`_loadDraft`/`window._markLoaded` di skrip module
 *       mana pun (ditunda, jadi berjalan SESUDAH PENJAGA di mana pun letaknya)
 *       maupun di skrip klasik sesudah PENJAGA.
 *
 * YANG SENGAJA TIDAK DILAKUKAN
 *   - Badan `_saveDraft`/`_loadDraft`/`checkForumReady`/`checkExportReady`
 *     tidak disunting (lima ragam simpan/muat, tujuh ragam forum, lima ragam
 *     ekspor). Generator CAD Modul 1 berjangkar pada teks simpan/muat kerangka
 *     TTL. Ragam simpan Matematika 4 Modul 4 memang tanpa kode komputasi.
 *   - Tidak ada migrasi: kunci lama (`<slug>_draft_<MODULE_ID>_<nim>`) tidak
 *     dibaca dan tidak dihapus. Di 43 halaman kuncinya tidak pernah tertulis, di
 *     halaman lain draft dikosongkan setiap muat, dan kunci bersama/bergeser
 *     (Matematika 4 Modul 1/2/3/5, Optimalisasi 11/12 dan 13/14) tidak bisa
 *     dipastikan milik modul mana.
 *   - Draft tidak dihapus saat Keluar (sama dengan draft ujian); tanpa sesi
 *     PIN yang diterima server draft tidak dibaca maupun ditulis. Konsekuensinya:
 *     selama getModulProgress gagal (galat sementara dicoba ulang 3/10/30 detik
 *     oleh PENJAGA-FORUM, atau akses ditolak sampai "Periksa lagi") draft belum
 *     dimuat dan ketikan belum tersimpan sebagai draft; draft yang ada tetap utuh.
 *   - Pilihan quick check memakai kuncinya sendiri (simpan-pilihan-poll.mjs).
 *   - Matematika 4 Modul 4: komentar kepala "DRAFT PERSISTENCE" yang masih
 *     menyebut kunci lama `math4_draft_modul-4_<NIM>` diganti teks kunci baru
 *     (KOMENTAR_KUNCI_LAMA); kunci lama `<slug>_draft_<modul|pertemuan>-N_`
 *     tidak boleh tersebut lagi di halaman modul mana pun.
 *
 * REGENERASI. Generator TTL/CAD dan rantai Sisken mewarisi kedua blok dari
 * halaman sumbernya. Jalankan skrip ini PALING AKHIR (sesudah
 * samakan-kunci-identitas.mjs, tambah-progres-modul.mjs, dan
 * simpan-pilihan-poll.mjs); `--periksa` sesudahnya harus 0. Templat tidak
 * memuat token yang dihitung generator ("Modul 1 ", "pertemuan-1", nama/ID
 * course, literal kunci identitas).
 *
 * Blok AI-CHAT-AGENT tidak disentuh (diperiksa identik sebelum/sesudah).
 * Salinan konflik OneDrive (*-DEDIK-PC.html) tidak termasuk.
 *
 * Idempoten: blok bertanda versi apa pun diganti di tempat; jalan kedua
 * melaporkan 0 halaman. Akhir baris berkas (LF/CRLF) dipertahankan.
 *
 * Pakai:
 *   node scripts/draft-modul.mjs            # terapkan
 *   node scripts/draft-modul.mjs --periksa  # laporan saja; keluar 1 bila ada yang akan berubah
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const VERSI_KUNCI = "v1";
export const VERSI_PENJAGA = "v2";   // v2: sesi diterima server, Forum hanya dari suntingan tab ini, berkas CAD server, NIM berganti → muat ulang
export const KUNCI_AWAL = `  // DRAFT-MODUL:KUNCI BEGIN ${VERSI_KUNCI} — dipasang scripts/draft-modul.mjs (Pedoman §6.3)`;
export const KUNCI_AKHIR = `  // DRAFT-MODUL:KUNCI END ${VERSI_KUNCI}`;
export const PENJAGA_AWAL = `<!-- DRAFT-MODUL:PENJAGA BEGIN ${VERSI_PENJAGA} — dipasang scripts/draft-modul.mjs (Pedoman §6.3) -->`;
export const PENJAGA_AKHIR = `<!-- DRAFT-MODUL:PENJAGA END ${VERSI_PENJAGA} -->`;
export const JANGKAR = "<!-- PROGRES-MODUL: awal -->";
export const RX_PENJAGA = /<!-- DRAFT-MODUL:PENJAGA BEGIN v\d+[^>]*-->[\s\S]*?<!-- DRAFT-MODUL:PENJAGA END v\d+ -->/g;
export const AWAL_FUNGSI = "function _draftKey() {";
export const EVENT_TERSIMPAN = "progres-modul:forum-tersimpan";

/** Seluruh fungsi `_draftKey` sesudah dipasang (isi = blok KUNCI). */
export const KUNCI = `${AWAL_FUNGSI}
${KUNCI_AWAL}
  // Kunci draft materi: draft_modul_<MODUL_ID>_<NIM>. Skrip klasik ini tidak
  // bisa membaca konstanta skrip module (bentuk lama → ReferenceError → null,
  // atau literal cadangan yang bisa sama antarhalaman); yang dipakai
  // window.MODUL_ID dan getIdentityLocal(). Hanya mahasiswa (termasuk akun
  // simulasi) dengan sesi PIN; dosen, tamu, dan Mode Preview → null. Penjaga
  // muat/simpan: blok DRAFT-MODUL:PENJAGA sebelum PROGRES-MODUL.
  try {
    if (window._previewMode || !window._sessionPinHash) return null;
    var modul = window.MODUL_ID;
    if (typeof modul !== 'string' || !modul) return null;
    var me = typeof getIdentityLocal === 'function' ? getIdentityLocal() : null;
    if (!me || me.role !== 'student' || !me.nim) return null;
    return 'draft_modul_' + modul + '_' + String(me.nim);
  } catch (e) { return null; }
${KUNCI_AKHIR}
}`;

export const PENJAGA = `${PENJAGA_AWAL}
<script>
// Draft materi (kode komputasi, tautan Google Drive, teks Forum, angka bacaan dan
// berkas tugas FreeCAD) — scripts/draft-modul.mjs. _saveDraft/_loadDraft halaman
// dibungkus saat parsing, sebelum skrip module berjalan; panggilan polos di halaman
// (checkExportReady, checkForumReady, _markLoaded, onCodeInput, …) ikut memakai
// pembungkus ini.
//  • Muat hanya bila ada kunci (_draftKey) dan SESI itu (kunci + hash PIN sesi)
//    (1) sudah dimuat datanya: _loadDraft() dari _markLoaded (akhir
//    _loadScoredQuestions), jadi marker dan kode ledger sudah diterapkan dan draft
//    hanya mengisi kolom kosong; kolom soal yang sudah dinilai (compAnswered) tidak
//    diisi draft; dan (2) sudah diterima server: event progres-modul:diterapkan
//    {ok:true} (getModulProgress memeriksa PIN NIM itu). Hash PIN sesi tidak terikat
//    NIM: sesudah Keluar, auto-login NIM lain di tab yang sama membawa hash lama.
//    Tanpa sesi PIN dan jaring 10 detik tidak dihitung. _markLoaded klasik global
//    (bila ada) dibungkus.
//  • Tidak ada tulisan sebelum draft kunci itu dimuat: dulu _saveDraft dari
//    check*Ready menimpa draft dengan kolom kosong sebelum _loadDraft membacanya.
//  • Forum: server menang, kecuali suntingan yang belum terkirim (draft ≠ server
//    dan ≠ salinan tersinkron <kunci>_sinkron). Sesudah muat pertama, simpanan
//    hanya mengambil teks Forum dari textarea yang disunting di tab ini; jawaban
//    lain mempertahankan teks draft yang tersimpan (tab lain yang masih memuat
//    teks lama tidak menimpanya). Kiriman tetap hanya lewat simpanForum
//    PROGRES-MODUL sesudah progres diterapkan.
//  • Tugas CAD yang berkasnya diketahui server (berkasDiServer): ringkasan berkas
//    server yang berlaku, bukan metadata berkas dari draft.
//  • NIM mahasiswa berganti tanpa muat ulang (logout paksa, lalu NIM lain masuk di
//    tab yang sama): kolom draft dikosongkan dan halaman dimuat ulang.
//  • Setiap ketikan di kolom kode, tautan Drive, angka bacaan, atau Forum disimpan.
(function () {
  var simpanAsli = window._saveDraft, muatAsli = window._loadDraft;
  if (typeof simpanAsli !== 'function' || typeof muatAsli !== 'function') return;
  var FQ = ['fq1', 'fq2', 'fq3'], KOLOM = 'textarea[id^="code-c"], input[id^="nilai-c"]';
  var dimuatUntuk = null, draftAwal = null, sesiFb = null, sesiSah = null;
  var serverUntuk = null, forumServer = null, forumAda = false;
  var kotor = {}, berkasDraft = {}, pemilik = null, berganti = false;
  function kunci() { if (berganti) return null; try { return typeof _draftKey === 'function' ? _draftKey() : null; } catch (e) { return null; } }
  function sesi(k) { return k ? k + '|' + String(window._sessionPinHash) : null; }
  function fbSiap() { try { return typeof _firebaseStateLoaded !== 'undefined' && _firebaseStateLoaded === true; } catch (e) { return false; } }
  function teks(v) { return typeof v === 'string' ? v : ''; }
  function baca(k) { try { var d = JSON.parse(localStorage.getItem(k) || 'null'); return d && typeof d === 'object' ? d : null; } catch (e) { return null; } }
  function tulis(k, d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) {} }
  function tulisSinkron(k, f) { tulis(k + '_sinkron', { fq1: teks(f && f.fq1), fq2: teks(f && f.fq2), fq3: teks(f && f.fq3) }); }
  // NIM mahasiswa yang data dan isiannya ada di halaman ini. NIM lain tanpa muat ulang:
  // isian lama tidak boleh masuk draft maupun forum NIM itu — kosongkan, muat ulang.
  function pemilikSama() {
    if (berganti) return false;
    var n = null;
    try { var me = typeof getIdentityLocal === 'function' ? getIdentityLocal() : null; if (me && me.role === 'student' && me.nim) n = String(me.nim); } catch (e) {}
    if (!n) return true;
    if (pemilik === null) pemilik = n;
    if (pemilik === n) return true;
    berganti = true;
    try {
      document.querySelectorAll(KOLOM).forEach(function (el) { el.value = ''; });
      ['gdrive-link', 'ans-fq1', 'ans-fq2', 'ans-fq3'].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
      var bt = window.berkasTerunggah;
      if (bt && typeof bt === 'object') Object.keys(bt).forEach(function (q) { delete bt[q]; });
    } catch (e) {}
    try { location.reload(); } catch (e) {}
    return false;
  }
  // _saveDraft halaman menulis ulang objek draft dari DOM. Teks Forum yang tidak disunting di
  // tab ini diambil dari draft tersimpan (lama): dipasang sesaat di textarea selama simpanan
  // (sinkron, tanpa event; seleksi dikembalikan), jadi setiap tulisan membawa teks yang benar.
  function simpanDgnForum(lama, diri, argumen) {
    var tukar = [];
    try {
      if (lama) FQ.forEach(function (q) {
        var ta = document.getElementById('ans-' + q);
        if (!ta || kotor[q] || typeof lama[q] !== 'string' || ta.value === lama[q]) return;
        tukar.push([ta, ta.value, document.activeElement === ta, ta.selectionStart, ta.selectionEnd]);
        ta.value = lama[q];
      });
    } catch (e) {}
    try { return simpanAsli.apply(diri, argumen || []); }
    finally {
      tukar.forEach(function (x) { x[0].value = x[1]; if (x[2]) { try { x[0].setSelectionRange(x[3], x[4]); } catch (e) {} } });
    }
  }
  // Muat pertama untuk kunci ini (forum server sudah diketahui dari event yang sama).
  function selaraskan(k) {
    var snap = baca(k + '_sinkron'), berubah = false;
    FQ.forEach(function (q) {
      var ta = document.getElementById('ans-' + q);
      if (!ta) return;
      var lokal = teks(draftAwal && draftAwal[q]), srv = teks(forumServer[q]);
      if (lokal !== '' && lokal !== srv && !(snap && snap[q] === lokal)) {   // belum terkirim
        if ((ta.value === srv || ta.value === '') && ta.value !== lokal) { ta.value = lokal; berubah = true; }
        if (ta.value === lokal) kotor[q] = true;
      } else if (ta.value === lokal && lokal !== srv && (srv !== '' || forumAda)) { ta.value = srv; berubah = true; }
    });
    tulisSinkron(k, forumServer);
    return berubah;
  }
  function muat() {
    var k = kunci(), s = sesi(k);
    if (!k || sesiFb !== s || sesiSah !== s) return;
    var pertama = dimuatUntuk !== k;
    if (pertama) draftAwal = baca(k);   // potret SEBELUM ada tulisan untuk kunci ini
    // Kolom soal yang sudah dinilai (compAnswered) bukan dari draft: kode/angka ledger
    // yang datang terlambat (getJawabanSaya > batas tunggu) tetap mengisi kolom kosongnya.
    var dinilai = [];
    try {
      if (typeof compAnswered === 'object' && compAnswered) {
        document.querySelectorAll(KOLOM).forEach(function (el) {
          if (compAnswered[el.id.replace(/^[a-z]+-/, '')]) dinilai.push([el, el.value]);
        });
      }
    } catch (e) {}
    // Tugas CAD yang berkasnya diketahui server (terunggah belum dinilai, atau dibuka lagi
    // untuk kirim ulang): ringkasan server berlaku, bukan metadata berkas draft (bisa lebih
    // lama: diunggah ulang dari perangkat atau tab lain).
    var bt = window.berkasTerunggah, sebelum = {}, diServer = [];
    if (!bt || typeof bt !== 'object') bt = null;
    try {
      if (bt && typeof berkasDiServer === 'object' && berkasDiServer) {
        Object.keys(berkasDiServer).forEach(function (q) {
          if (!berkasDiServer[q]) return;
          if (bt[q] && bt[q] === berkasDraft[q]) delete bt[q];   // dipasang draft pada pemuatan sebelumnya
          var st = document.getElementById('berkas-status-' + q);
          diServer.push([q, st, st ? st.innerHTML : '', st ? st.style.color : '']);
        });
      }
      if (bt) Object.keys(bt).forEach(function (q) { sebelum[q] = bt[q]; });
    } catch (e) {}
    dimuatUntuk = k;   // ditandai SEBELUM asli: check*Ready di dalamnya boleh menyimpan
    try { return muatAsli.apply(this, arguments); }
    finally {
      dinilai.forEach(function (x) { if (x[0].value !== x[1]) x[0].value = x[1]; });
      try {
        diServer.forEach(function (x) {
          if (Object.prototype.hasOwnProperty.call(sebelum, x[0])) bt[x[0]] = sebelum[x[0]]; else delete bt[x[0]];
          if (x[1] && x[1].innerHTML !== x[2]) { x[1].innerHTML = x[2]; x[1].style.color = x[3]; }
          if (typeof _refreshTugasBtn === 'function') _refreshTugasBtn(x[0]);
        });
        if (bt) Object.keys(bt).forEach(function (q) { if (bt[q] !== sebelum[q]) berkasDraft[q] = bt[q]; });
      } catch (e) {}
      var berubah = pertama && !!forumServer && selaraskan(k);
      try { simpanDgnForum(pertama ? null : baca(k)); } catch (e) {}   // gabungan draft + isian yang sudah ada
      if (berubah && typeof window.checkForumReady === 'function') { try { window.checkForumReady(); } catch (e) {} }
    }
  }
  function muatSesudahFirebase() {
    if (pemilikSama()) {
      var k = kunci();
      if (k && fbSiap()) sesiFb = sesi(k);   // _markLoaded dengan sesi ini: marker & kode ledger sudah diterapkan
    }
    return muat.apply(this, arguments);
  }
  function simpan() {
    var k = kunci();
    if (!k) return;
    if (dimuatUntuk !== k) { muat(); if (dimuatUntuk !== k) return; }
    return simpanDgnForum(baca(k), this, arguments);
  }
  window._loadDraft = muatSesudahFirebase;
  window._saveDraft = simpan;
  window._draftSudahDimuat = function () { var k = kunci(); return !!k && dimuatUntuk === k; };
  var tandaiAsli = window._markLoaded;
  if (typeof tandaiAsli === 'function') {
    window._markLoaded = function () {
      var r = tandaiAsli.apply(this, arguments);
      try { muatSesudahFirebase(); } catch (e) {}
      return r;
    };
  }
  // getModulProgress (NIM + hash PIN sesi ini) sudah memeriksa PIN di server.
  window.addEventListener('progres-modul:diterapkan', function (e) {
    var d = e && e.detail;
    if (!d || d.ok !== true || !d.progres || !pemilikSama()) return;
    var k = kunci();
    if (!k) return;
    if (serverUntuk !== k) {
      var f = d.progres.forum;
      forumAda = !!f && typeof f === 'object' && Object.keys(f).length > 0;
      if (!forumAda) f = {};
      forumServer = { fq1: teks(f.fq1), fq2: teks(f.fq2), fq3: teks(f.fq3) };
      serverUntuk = k;
    }
    sesiSah = sesi(k);
    muat();
  });
  window.addEventListener('${EVENT_TERSIMPAN}', function (e) {
    var k = kunci(), j = e && e.detail && e.detail.jawaban;
    if (!k || !j || typeof j !== 'object') return;
    tulisSinkron(k, j);
    FQ.forEach(function (q) { var ta = document.getElementById('ans-' + q); if (ta && ta.value === teks(j[q])) kotor[q] = false; });
  });
  document.addEventListener('input', function (e) {
    var t = e && e.target, id = t && typeof t.id === 'string' ? t.id : '';
    if (!/^(?:code-c\\d{1,2}|nilai-c\\d{1,2}|gdrive-link|ans-fq[1-3])$/.test(id)) return;
    if (id.indexOf('ans-') === 0) kotor[id.slice(4)] = true;
    try { simpan(); } catch (x) {}
  }, true);
})();
</script>
${PENJAGA_AKHIR}`;

// Blok identik di ke-84 halaman dan diwarisi generator TTL/CAD serta rantai
// Sisken: tanpa token course, tanpa nomor modul/pertemuan, tanpa literal kunci
// identitas maupun konstanta skrip module.
export const TOKEN_TERLARANG = [
  /Modul \d/, /Pertemuan \d/, /Tugas \d/, /Forum \d/, /pertemuan-\d/i, /Tugas\d_/, /modul-\d/i, /modul_\d/i,
  /math4|getaran|optoauto|sisken|sistem_kendali|kendali_cerdas|pemodelan|tenaga_listrik|tenaga-listrik|tenaga listrik/i,
  /_identity_/, /_draft_'/, /\bLOCAL_IDENTITY\b/, /\bMODULE_ID\b/, /\bPERTEMUAN\b/, /\bCOURSE_ID\b/,
  /_forumPollAnswerHashes/, /window\._pa\b/, /function voteForum\(/, /voteForum\(\d/, /saveModulForum/, /saveModulPoll/,
  /TENAGALISTRIK|GETARANMESIN|PEMODELANCAD/, /KUNCI-IDENTITAS/,
];

const hitung = (s, sub) => s.split(sub).length - 1;

/** Akhir fungsi yang dibuka pada `mulai` (indeks `}` penutup); lewati string & komentar. */
export function akhirFungsi(s, mulai) {
  let i = s.indexOf("{", mulai), d = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"' || c === "`") { const q = c; for (i++; i < s.length && s[i] !== q; i++) if (s[i] === "\\") i++; continue; }
    if (c === "/" && s[i + 1] === "/") { i = s.indexOf("\n", i); if (i < 0) return -1; continue; }
    if (c === "/" && s[i + 1] === "*") { i = s.indexOf("*/", i + 2) + 1; if (i <= 0) return -1; continue; }
    if (c === "{") d++;
    else if (c === "}") { d--; if (!d) return i; }
  }
  return -1;
}

/** Atribut tag <script> yang melingkupi indeks `i` (null bila di luar skrip). */
export function skripPelingkup(html, i) {
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (m.index < i && i < m.index + m[0].length) return m[1];
  }
  return null;
}

export function blokAi(html) {
  return html.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || [];
}

/**
 * Tanda tangan ragam `_draftKey` lama yang dikenali (29 September 2026): literal
 * kutip tunggal → 'X', spasi dirapatkan. K1 = isi blok KUNCI-IDENTITAS:DRAF
 * (#970; Matematika 4 kecuali Modul 4, Optimalisasi 12–14), K2 = Matematika 4
 * Modul 4, K3 = konstanta skrip module (mati; Getaran 1, Sisken, TTL, CAD),
 * K4 = cadangan `typeof` (Getaran 2–14, Optimalisasi 1–11 kecuali 4), K5 =
 * getIdentity() jembatan AI (Optimalisasi 4).
 */
export const RAGAM_KUNCI_LAMA = {
  K1: "function _draftKey() { try { const me = getIdentityLocal(); if (!me || !me.nim || me.role === 'X') return null; return 'X' + me.nim; // per-NIM, course-scoped } catch(e) { return null; } }",
  K2: "function _draftKey() { // Akses identity via getIdentityLocal (didefinisikan di atas) atau // langsung baca localStorage dengan window._LOCAL_IDENTITY_KEY let me = null; try { if (typeof getIdentityLocal === 'X') me = getIdentityLocal(); else { const lk = window._LOCAL_IDENTITY_KEY || 'X'; me = JSON.parse(localStorage.getItem(lk)); } } catch(e) { return null; } if (!me || !me.nim || me.role === 'X') return null; return 'X' + me.nim; }",
  K3: "function _draftKey() { try { const me = JSON.parse(localStorage.getItem(LOCAL_IDENTITY) || 'X'); if (!me || !me.nim || me.role === 'X') return null; return 'X' + MODULE_ID + 'X' + me.nim; // per-NIM, course-scoped } catch(e) { return null; } }",
  K4: "function _draftKey() { try { // LOCAL_IDENTITY didefinisikan di script type=\"module\" di bawah; saat fungsi ini // di-invoke dari event handler textarea, scope window sudah resolved. const key = (typeof LOCAL_IDENTITY !== 'X') ? LOCAL_IDENTITY : 'X'; const me = JSON.parse(localStorage.getItem(key) || 'X'); if (!me || !me.nim || me.role === 'X') return null; const moduleId = (typeof MODULE_ID !== 'X') ? MODULE_ID : 'X'; return 'X' + moduleId + 'X' + me.nim; // per-NIM, course-scoped } catch(e) { return null; } }",
  K5: "function _draftKey() { const me = (typeof getIdentity === 'X') ? getIdentity() : null; if (!me || !me.nim || me.role === 'X') return null; return 'X' + me.nim; }",
};
export const tandaTangan = (f) => f.replace(/'[^'\n]*'/g, "'X'").replace(/\s+/g, " ").trim();
export const RX_DRAF_LAMA = /\/\/ KUNCI-IDENTITAS:DRAF BEGIN v\d+[^\n]*\n[\s\S]*?\/\/ KUNCI-IDENTITAS:DRAF END v\d+[^\n]*\n/g;
export const RX_KUNCI_BLOK = /^function _draftKey\(\) \{\n {2}\/\/ DRAFT-MODUL:KUNCI BEGIN v\d+[^\n]*\n[\s\S]*\n {2}\/\/ DRAFT-MODUL:KUNCI END v\d+\n\}$/;

/**
 * Penugasan yang membuang pembungkus PENJAGA bila berjalan sesudahnya (skrip module
 * mana pun, skrip klasik sesudah PENJAGA): `window._saveDraft|_loadDraft|_markLoaded =`
 * dan `_saveDraft|_loadDraft =` polos (nama global).
 */
export const RX_TIMPA_DRAFT = /\bwindow\s*\.\s*_(?:saveDraft|loadDraft|markLoaded)\s*=(?!=)|(?<![\w$.])_(?:saveDraft|loadDraft)\s*=(?!=)/;

/**
 * Kunci draft lama yang masih tersebut di komentar halaman (29 September 2026: hanya
 * kepala "DRAFT PERSISTENCE" Matematika 4 Modul 4) — diganti teks kunci baru. Sesudah
 * itu RX_KUNCI_LAMA_DISEBUT tidak boleh cocok di halaman modul mana pun.
 */
export const KOMENTAR_KUNCI_LAMA = [
  ["//   Layer 2 (COMPLEMENTARY) — localStorage math4_draft_modul-4_<NIM>:",
    "//   Layer 2 (COMPLEMENTARY) — localStorage draft_modul_<MODUL_ID>_<NIM> (DRAFT-MODUL:KUNCI):"],
  ["// Key per-NIM (`math4_draft_modul-4_<NIM>`) mencegah leak antar mahasiswa",
    "// Key per-modul per-NIM (`draft_modul_<MODUL_ID>_<NIM>`) mencegah leak antar mahasiswa"],
];
export const RX_KUNCI_LAMA_DISEBUT = /\b[a-z0-9]+(?:_[a-z0-9]+)*_draft_(?:modul|pertemuan)-\d+_/;

/** `_markLoaded` const di `_loadScoredQuestions` (83 halaman) — satu-satunya pemanggil `_loadDraft`. */
export const PANGGIL_MUAT = "if (typeof _loadDraft === 'function') _loadDraft();";
/** Ragam `_markLoaded` klasik global: jalur sukses memanggil `window._loadDraft()` lalu `window._markLoaded()`. */
export const PANGGIL_MUAT_GLOBAL = "if (typeof window._loadDraft === 'function') window._loadDraft();";

/** Prasyarat halaman modul; mengembalikan ringkasan ragam. `html` sudah LF. */
export function prasyarat(html) {
  for (const [nama, n] of [
    [AWAL_FUNGSI, 1], ["function _saveDraft() {", 1], ["function _loadDraft() {", 1],
    ["function getIdentityLocal(", 1], ["let _firebaseStateLoaded", 1],
    ["const MODUL_ID = '", 1], ["window.MODUL_ID = MODUL_ID;", 1], [JANGKAR, 1], ["<!-- PROGRES-MODUL: akhir -->", 1],
    ['id="ans-fq1"', 1], ['id="ans-fq2"', 1], ['id="ans-fq3"', 1],
  ]) {
    const c = hitung(html, nama);
    if (c !== n) throw new Error(`\`${nama}\` muncul ${c}x, harusnya ${n}`);
  }
  const jangkar = html.indexOf(JANGKAR);
  const tanpaPenjaga = html.replace(RX_PENJAGA, "");
  const jangkarTp = tanpaPenjaga.indexOf(JANGKAR);
  // Fungsi global klasik = properti window; `window._saveDraft = _saveDraft;` (tidak ada di
  // semua halaman) hanya diperiksa letaknya bila ada.
  for (const f of [AWAL_FUNGSI, "function _saveDraft() {", "function _loadDraft() {", "function getIdentityLocal(", "let _firebaseStateLoaded",
    "window._saveDraft = _saveDraft;", "window._loadDraft = _loadDraft;"]) {
    const i = html.indexOf(f);
    if (i < 0 && f.startsWith("window.")) continue;
    if (hitung(html, f) > 1) throw new Error(`\`${f}\` muncul ${hitung(html, f)}x, harusnya paling banyak 1`);
    const tag = skripPelingkup(html, i);
    if (tag === null || /type\s*=\s*["']module["']/i.test(tag)) throw new Error(`\`${f}\` harus berada di skrip klasik (global)`);
    if (i > jangkar) throw new Error(`\`${f}\` harus sebelum blok PROGRES-MODUL`);
  }
  const mi = html.indexOf("window.MODUL_ID = MODUL_ID;");
  if (!/type\s*=\s*["']module["']/i.test(skripPelingkup(html, mi) || "")) throw new Error("`window.MODUL_ID = MODUL_ID;` harus di skrip module");
  // Sesudah jangkar tidak ada yang menulis ulang fungsi draft (pembungkus akan hilang).
  const ekor = tanpaPenjaga.slice(jangkarTp);
  if (/\bfunction\s+_(?:saveDraft|loadDraft|draftKey)\s*\(|\b(?:window\.)?_(?:saveDraft|loadDraft)\s*=(?!=)/.test(ekor)) {
    throw new Error("fungsi draft didefinisikan/ditimpa sesudah PROGRES-MODUL (pembungkus DRAFT-MODUL:PENJAGA akan hilang)");
  }
  // Skrip module DITUNDA: berjalan sesudah PENJAGA di mana pun letaknya, jadi penugasan
  // fungsi draft di skrip module mana pun (juga sebelum jangkar) membuang pembungkusnya,
  // sama seperti skrip klasik sesudah PENJAGA. Satu-satunya penugasan yang boleh:
  // ekspor `window._x = _x;` di skrip klasik sebelum PENJAGA.
  for (const m of tanpaPenjaga.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const modulSkrip = /type\s*=\s*["']module["']/i.test(m[1]);
    if (!modulSkrip && m.index < jangkarTp) continue;
    const t = RX_TIMPA_DRAFT.exec(m[2]);
    if (t) throw new Error(`fungsi draft ditimpa di skrip ${modulSkrip ? "module" : "klasik sesudah PROGRES-MODUL"} (\`${t[0].trim()}\`; pembungkus DRAFT-MODUL:PENJAGA akan hilang)`);
  }
  // _saveDraft/_loadDraft memanggil _draftKey() polos (pembungkus & kunci baru berlaku).
  for (const f of ["function _saveDraft() {", "function _loadDraft() {"]) {
    const i = html.indexOf(f), j = akhirFungsi(html, i);
    if (j < 0 || !/\bconst key = _draftKey\(\);/.test(html.slice(i, j))) throw new Error(`\`${f}\` tidak memanggil _draftKey() polos`);
  }
  // Ragam _draftKey yang dikenali.
  const i = html.indexOf(AWAL_FUNGSI), j = akhirFungsi(html, i);
  const fungsi = html.slice(i, j + 1);
  const draf = html.match(RX_DRAF_LAMA) || [];
  if (draf.length > 1) throw new Error(`blok KUNCI-IDENTITAS:DRAF muncul ${draf.length}x`);
  let ragam;
  if (RX_KUNCI_BLOK.test(fungsi)) ragam = "blok";
  else {
    ragam = Object.keys(RAGAM_KUNCI_LAMA).find((k) => RAGAM_KUNCI_LAMA[k] === tandaTangan(fungsi));
    if (!ragam) throw new Error("_draftKey berbentuk tak dikenal (bukan ragam K1–K5 maupun blok DRAFT-MODUL:KUNCI) — tangani dulu, jangan ditebak");
  }
  if (draf.length === 1 && (ragam !== "K1" || !draf[0].includes(fungsi))) throw new Error("blok KUNCI-IDENTITAS:DRAF tidak berisi _draftKey ragam K1");
  if (ragam === "K1" && draf.length !== 1) throw new Error("_draftKey ragam K1 di luar blok KUNCI-IDENTITAS:DRAF");
  // Tanda "Firebase siap untuk kunci ini" PENJAGA = _loadDraft() dari _markLoaded.
  // Pemanggil _loadDraft lain akan terbaca sebagai tanda itu — daftarnya dikunci.
  const global = html.includes("\nfunction _markLoaded() {");
  const tanpaKomentar = (b) => b.replace(/(^|\s)\/\/.*$/, "").trim();
  const boleh = new Set(["function _loadDraft() {", "window._loadDraft = _loadDraft;", tanpaKomentar(global ? PANGGIL_MUAT_GLOBAL : PANGGIL_MUAT)]);
  const asing = tanpaPenjaga.split("\n").map((b) => b.trim())
    .filter((b) => !/^(?:\/\/|\*|\/\*)/.test(b)).map(tanpaKomentar)
    .filter((b) => /\b_loadDraft\b/.test(b) && !boleh.has(b));
  if (asing.length) throw new Error(`pemanggil _loadDraft tak dikenal (akan terbaca sebagai tanda Firebase siap): ${asing[0].slice(0, 120)}`);
  if (global) {
    if (hitung(html, "window._markLoaded = _markLoaded;") !== 1 || hitung(html, PANGGIL_MUAT_GLOBAL) < 1) throw new Error("ragam _markLoaded global tanpa `window._markLoaded = _markLoaded;` / jalur sukses `window._loadDraft()`");
    const ml = html.indexOf("\nfunction _markLoaded() {");
    if (ml > jangkar || /type\s*=\s*["']module["']/i.test(skripPelingkup(html, ml) || "module")) throw new Error("_markLoaded global harus di skrip klasik sebelum PROGRES-MODUL");
  } else {
    if (hitung(html, "const _markLoaded = () => {") !== 1 || hitung(html, PANGGIL_MUAT) !== 1) throw new Error("`const _markLoaded = () => {` + panggilan `_loadDraft()`-nya harus tepat sekali");
    const ml = html.indexOf(PANGGIL_MUAT);
    if (!/type\s*=\s*["']module["']/i.test(skripPelingkup(html, ml) || "")) throw new Error("`_markLoaded` harus di skrip module (_loadScoredQuestions)");
  }
  return { ragam, markLoadedGlobal: global };
}

export function proses(awal) {
  const eol = awal.includes("\r\n") ? "\r\n" : "\n";
  const lf = awal.replace(/\r\n/g, "\n");
  if (lf.includes("\r")) throw new Error("berkas memuat CR tunggal");
  const catatan = [];
  const info = prasyarat(lf);
  let html = lf;

  // (a) KUNCI: seluruh fungsi _draftKey (beserta blok KUNCI-IDENTITAS:DRAF bila ada) diganti templat.
  if (info.ragam === "K1") {
    html = html.replace(RX_DRAF_LAMA, () => KUNCI + "\n");
    catatan.push("kunci-draf-diganti");
  } else {
    const i = html.indexOf(AWAL_FUNGSI), j = akhirFungsi(html, i);
    const lama = html.slice(i, j + 1);
    if (lama !== KUNCI) { html = html.slice(0, i) + KUNCI + html.slice(j + 1); catatan.push(info.ragam === "blok" ? "kunci-diperbarui" : `kunci-dipasang-${info.ragam}`); }
  }

  // (b) PENJAGA: tepat sebelum <!-- PROGRES-MODUL: awal -->.
  const blokLama = html.match(RX_PENJAGA) || [];
  if (blokLama.length > 1) throw new Error(`blok DRAFT-MODUL:PENJAGA muncul ${blokLama.length}x, harusnya 1`);
  const sisip = PENJAGA + "\n";
  if (blokLama.length === 1) {
    const k = html.indexOf(blokLama[0]);
    const tepat = html.startsWith("\n" + JANGKAR, k + blokLama[0].length);
    if (tepat) {
      if (blokLama[0] !== PENJAGA) { html = html.slice(0, k) + PENJAGA + html.slice(k + blokLama[0].length); catatan.push("penjaga-diperbarui"); }
    } else {
      html = html.slice(0, k) + html.slice(k + blokLama[0].length + (html.startsWith("\n", k + blokLama[0].length) ? 1 : 0));
      const a = html.indexOf(JANGKAR);
      html = html.slice(0, a) + sisip + html.slice(a);
      catatan.push("penjaga-dipindahkan");
    }
  } else {
    const a = html.indexOf(JANGKAR);
    html = html.slice(0, a) + sisip + html.slice(a);
    catatan.push("penjaga-dipasang");
  }
  if (info.markLoadedGlobal) catatan.push("markLoaded-global");

  // (c) Komentar yang masih menyebut kunci draft lama (Matematika 4 Modul 4).
  const sebelumKomentar = html;
  for (const [lama, baru] of KOMENTAR_KUNCI_LAMA) html = html.split(lama).join(baru);
  if (html !== sebelumKomentar) catatan.push("komentar-kunci-lama");

  // ── Penjaga hasil ──
  const sisaKunciLama = RX_KUNCI_LAMA_DISEBUT.exec(html);
  if (sisaKunciLama) throw new Error(`hasil: kunci draft lama masih tersebut (\`${sisaKunciLama[0]}…\`) — tambahkan ke KOMENTAR_KUNCI_LAMA, jangan disunting tangan`);
  for (const [s, n] of [[KUNCI_AWAL, 1], [KUNCI_AKHIR, 1], [PENJAGA_AWAL, 1], [PENJAGA_AKHIR, 1], [KUNCI, 1], [PENJAGA + "\n" + JANGKAR, 1]]) {
    if (hitung(html, s) !== n) throw new Error(`hasil: \`${s.split("\n")[0]}\` harus tepat ${n}x`);
  }
  if (/DRAFT-MODUL:(?:KUNCI|PENJAGA) (?:BEGIN|END)/.test(html.replace(KUNCI, "").replace(PENJAGA, ""))) throw new Error("hasil: penanda DRAFT-MODUL yatim");
  if (html.includes("KUNCI-IDENTITAS:DRAF")) throw new Error("hasil: blok KUNCI-IDENTITAS:DRAF masih ada");
  const aiLama = blokAi(lf), aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) if (b.includes("DRAFT-MODUL")) throw new Error("blok DRAFT-MODUL jatuh di dalam blok AI-CHAT-AGENT");
  const k = html.indexOf(KUNCI), tagK = skripPelingkup(html, k);
  if (tagK === null || /type\s*=\s*["']module["']/i.test(tagK)) throw new Error("hasil: blok KUNCI harus di skrip klasik");
  prasyarat(html);

  const keluar = eol === "\n" ? html : html.replace(/\n/g, eol);
  return keluar === awal ? null : { html: keluar, catatan };
}

/** Ke-84 halaman <Kursus>/Modul/Modul-N.html (bukan salinan konflik OneDrive). */
export function halamanModul() {
  const out = [];
  for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
    if (!kursus.isDirectory()) continue;
    const dir = path.join(root, kursus.name, "Modul");
    if (!fs.existsSync(dir)) continue;
    for (const nama of fs.readdirSync(dir)) if (/^Modul-\d+\.html$/.test(nama)) out.push(path.join(dir, nama));
  }
  return out.sort();
}

for (const blok of [KUNCI, PENJAGA]) {
  for (const rx of TOKEN_TERLARANG) {
    if (rx.test(blok)) throw new Error(`templat DRAFT-MODUL memuat token terlarang ${rx}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const periksa = process.argv.includes("--periksa");
  const berkas = halamanModul();
  if (berkas.length !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${berkas.length}`);
  // Semua halaman diperiksa dulu; berkas baru ditulis bila tidak ada yang gagal.
  const hasil = [];
  const rekap = {};
  for (const f of berkas) {
    let h;
    try { h = proses(fs.readFileSync(f, "utf8")); }
    catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
    if (!h) continue;
    hasil.push([f, h.html]);
    for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  }
  if (!periksa) for (const [f, html] of hasil) fs.writeFileSync(f, html);
  console.log(`${hasil.length} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
  if (periksa && hasil.length > 0) process.exitCode = 1;
}
