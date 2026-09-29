/**
 * Draft UTS/UAS: kode komputasi, tautan Google Drive, dan angka bacaan CAD yang
 * belum dikirim tersimpan per ujian per NIM di localStorage dan pulih setelah
 * muat ulang (Pedoman §6.3). Berlaku untuk ke-12 <Kursus>/Exam/UTS.html|UAS.html.
 *
 * MASALAHNYA (ditemukan 29 September 2026). Draft ujian tidak pernah tersimpan
 * maupun dipulihkan di ke-12 halaman:
 *   1. `_draftKey()` (skrip klasik) membaca `LOCAL_IDENTITY` dan `MODULE_ID`,
 *      padahal keduanya `const` milik `<script type="module">`. Lingkup module
 *      tidak terlihat dari skrip klasik → ReferenceError → `catch` → null, jadi
 *      `_saveDraft`/`_loadDraft` langsung `return` pada setiap panggilan.
 *   2. Soal kini datang dari callable `getExamQuestions` sesudah PIN, sehingga
 *      kolom kode (`code-cN`) / angka (`nilai-cN`) belum ada saat `_markLoaded`
 *      memanggil `_loadDraft` — draft yang dimuat saat itu tidak punya tempat.
 *      (Kerangka CAD sudah menjadwalkan `_loadDraft` 200 ms sesudah render;
 *      course lain tidak.)
 *   3. `checkExportReady` → `_saveDraft` yang berjalan sebelum kartu soal ada
 *      (mis. dari `_markLoaded` bila ada soal yang sudah dinilai) menulis draft
 *      dengan `code: {}` / `nilai: {}` dan menimpa draft yang belum dimuat.
 *   4. Kolom kode ujian tidak punya `oninput` (onCodeInput tidak pernah
 *      dipanggil) dan tautan Drive hanya disimpan bila ekspor "siap", jadi
 *      ketikan tidak tersimpan walau kuncinya benar.
 *   (v2) Penjaga v1 memakai `_firebaseStateLoaded === true` sebagai tanda siap.
 *      Nilai itu sudah true dari pemuatan TANPA sesi PIN (tab baru sebelum PIN,
 *      form login sesudah Keluar), sehingga sesudah PIN draft lama mengisi kolom
 *      kode soal yang sudah dinilai sebelum kode ledger datang dan menutupinya.
 *
 * YANG DIPASANG (dua blok, sama persis di ke-12 halaman, tanpa token course):
 *   (a) `// DRAFT-UJIAN:KUNCI BEGIN vN` … `END vN` — MENJADI ISI
 *       `function _draftKey() { … }` (seluruh isi lama diganti). Kunci
 *       `draft_ujian_<window.EXAM_ID>_<NIM>`; NIM dari `getIdentityLocal()`
 *       (kunci identitasnya diperiksa sama dengan LOCAL_IDENTITY). Hanya peran
 *       `student` (termasuk akun simulasi) dengan sesi PIN (`_sessionPinHash`) di
 *       luar Mode Preview; dosen, tamu, Preview → null. Penanda sengaja DI DALAM
 *       fungsi: generator CAD (`scripts/cad-exam/bangun.py`) memotong dari
 *       `function _draftKey() {` sampai `window._draftKey  = _draftKey;` dan
 *       menulis ulang draf versi lamanya, sehingga blok ini hilang utuh (tanpa
 *       penanda yatim) dan dipasang lagi oleh skrip ini.
 *   (b) `<!-- DRAFT-UJIAN:PENJAGA BEGIN vN -->` `<script>` klasik
 *       `<!-- DRAFT-UJIAN:PENJAGA END vN -->` tepat sebelum
 *       `<!-- ── FIREBASE + VISITOR SYSTEM … -->` (skrip module). Saat parsing ia
 *       membungkus `window._saveDraft`/`window._loadDraft` (panggilan polos di
 *       halaman ikut memakai pembungkus karena fungsi global klasik adalah
 *       properti window):
 *         - muat hanya bila kunci ada, kartu soal sudah ada (kolom `code-cN` /
 *           `nilai-cN`), dan data Firebase sudah dimuat UNTUK KUNCI ITU: tanda
 *           siapnya adalah `_loadDraft()` di akhir `_markLoaded`
 *           (`_loadScoredQuestions`, sesudah `_firebaseStateLoaded = true`) yang
 *           berjalan saat kunci — identitas + sesi PIN — sudah ada. Pemuatan
 *           Firebase tanpa kunci (tab baru sebelum PIN dimasukkan, form login
 *           sesudah Keluar) tidak dihitung: `getJawabanSaya` belum bisa dipanggil
 *           tanpa sesi PIN, jadi kode ledger soal yang sudah dinilai belum ada di
 *           kolomnya, dan draft yang mengisi kolom kosong itu lebih dulu menutupi
 *           kode ledger (pemulihan visual hanya mengisi kolom kosong) — juga di
 *           HTML ekspor. `_loadDraft` yang dijadwalkan perender sendiri (CAD,
 *           `setTimeout(_loadDraft, 200)`) diabaikan — selama perender berjalan
 *           `window._loadDraft` fungsi kosong — jadi bukan tanda siap. Jaring
 *           10 detik (Firebase menggantung) tidak memanggil `_loadDraft` dan
 *           tidak dihitung;
 *         - kolom soal yang sudah terkunci (dinilai, `disabled`) tidak diisi
 *           draft: isinya dikembalikan sesudah `_loadDraft` asli. Kode ledger
 *           yang datang belakangan (`getJawabanSaya` > 2,5 detik) tetap mengisi
 *           kolom kosong itu, dan angka CAD yang dinilai tidak diisi draft;
 *         - sesudah muat, gabungan draft + isian yang sudah ada disimpan sekali;
 *         - simpan hanya sesudah draft kunci itu dimuat (bila belum: muat dulu;
 *           bila tidak bisa dimuat — kartu belum ada / Firebase belum siap —
 *           TIDAK menulis). Tidak ada lagi `code: {}` yang menimpa draft;
 *         - `renderUTSQuestions`/`renderUASQuestions` dibungkus: 250 ms sesudah
 *           render (sesudah pemulihan ulang visual dari cache 150 ms) draft
 *           dimuat bila Firebase kunci itu sudah siap; bila belum, `_markLoaded`
 *           berikutnya yang memuatnya;
 *         - setiap `input` pada kolom `code-cN`, `nilai-cN`, atau `gdrive-…`
 *           menyimpan draft.
 *       `window._draftSudahDimuat()` melaporkan status (dipakai uji).
 *       Prasyarat halaman (diperiksa sebelum memasang): `_markLoaded` persis
 *       bentuk MARK_LOADED, satu-satunya pemanggil `_loadDraft` lain hanya
 *       JADWAL_RENDER di perender, dan perender menjadwalkan pemulihan ulang
 *       visual 150 ms — urutan di atas bergantung pada ketiganya.
 *
 * YANG SENGAJA TIDAK DILAKUKAN
 *   - Badan `_saveDraft`/`_loadDraft`/`checkExportReady`/perender tidak
 *     disunting (dua ragam: 10 halaman kode+Drive, 2 halaman CAD angka bacaan).
 *     Cabang lain menyunting perender UTS Math4/Opto (muat-soal-uts.mjs) dan
 *     pemulihan visual CAD (jawaban-privat.mjs ANGKA-CAD); blok ini hanya
 *     membungkus properti window-nya.
 *   - Tidak ada migrasi: kunci lama `<slug>_draft_<uts|uas>_<nim>` tidak pernah
 *     tertulis (fungsi kunci lama selalu null), jadi tidak dibaca/dihapus.
 *   - Draft tidak dihapus saat Keluar (sama dengan draft modul); tanpa sesi PIN
 *     draft tidak dibaca maupun ditulis.
 *
 * REGENERASI. UTS/UAS CAD dibangun dari kerangka TTL; blok PENJAGA ikut
 * terwaris, blok KUNCI dibuang generator. Jalankan skrip ini SESUDAH
 * `bangun.py` dan penyuntik lain; `--periksa` sesudahnya harus 0. Templat
 * tidak memuat token yang ditolak penjaga `wajib_kosong` generator CAD.
 *
 * Blok AI-CHAT-AGENT tidak disentuh (diperiksa identik sebelum/sesudah).
 * Salinan konflik OneDrive (*-DEDIK-PC.html) tidak termasuk.
 *
 * Idempoten: blok bertanda versi apa pun diganti di tempat; jalan kedua
 * melaporkan 0 halaman. Akhir baris berkas (LF/CRLF) dipertahankan.
 *
 * Pakai:
 *   node scripts/draft-ujian.mjs            # terapkan
 *   node scripts/draft-ujian.mjs --periksa  # laporan saja; keluar 1 bila ada yang akan berubah
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const VERSI_KUNCI = "v1";
export const VERSI_PENJAGA = "v2";   // v2: tanda siap Firebase per kunci + kolom terkunci tidak diisi draft
export const KUNCI_AWAL = `  // DRAFT-UJIAN:KUNCI BEGIN ${VERSI_KUNCI} — dipasang scripts/draft-ujian.mjs (Pedoman §6.3)`;
export const KUNCI_AKHIR = `  // DRAFT-UJIAN:KUNCI END ${VERSI_KUNCI}`;
export const PENJAGA_AWAL = `<!-- DRAFT-UJIAN:PENJAGA BEGIN ${VERSI_PENJAGA} — dipasang scripts/draft-ujian.mjs (Pedoman §6.3) -->`;
export const PENJAGA_AKHIR = `<!-- DRAFT-UJIAN:PENJAGA END ${VERSI_PENJAGA} -->`;
export const JANGKAR = "<!-- ── FIREBASE + VISITOR SYSTEM (identik dengan Modul-1) ── -->\n<script type=\"module\">";
export const RX_PENJAGA = /<!-- DRAFT-UJIAN:PENJAGA BEGIN v\d+[^>]*-->[\s\S]*?<!-- DRAFT-UJIAN:PENJAGA END v\d+ -->/g;
export const AWAL_FUNGSI = "function _draftKey() {";

/** Seluruh fungsi `_draftKey` sesudah dipasang (isi = blok KUNCI). */
export const KUNCI = `${AWAL_FUNGSI}
${KUNCI_AWAL}
  // Kunci draft UTS/UAS: draft_ujian_<EXAM_ID>_<NIM>. Skrip klasik ini tidak
  // bisa membaca konstanta skrip module (dulu ReferenceError → null, sehingga
  // draft tidak pernah tersimpan maupun dipulihkan); yang dipakai window.EXAM_ID
  // dan getIdentityLocal(). Hanya mahasiswa (termasuk akun simulasi) dengan sesi
  // PIN; dosen, tamu, dan Mode Preview → null. Penjaga muat/simpan: blok
  // DRAFT-UJIAN:PENJAGA sebelum skrip module.
  try {
    if (window._previewMode || !window._sessionPinHash) return null;
    var ujian = window.EXAM_ID;
    if (typeof ujian !== 'string' || !ujian) return null;
    var me = typeof getIdentityLocal === 'function' ? getIdentityLocal() : null;
    if (!me || me.role !== 'student' || !me.nim) return null;
    return 'draft_ujian_' + ujian + '_' + String(me.nim);
  } catch (e) { return null; }
${KUNCI_AKHIR}
}`;

export const PENJAGA = `${PENJAGA_AWAL}
<script>
// Draft UTS/UAS (kode komputasi, tautan Google Drive, angka bacaan CAD) —
// scripts/draft-ujian.mjs. _saveDraft/_loadDraft halaman dibungkus saat parsing,
// sebelum skrip module berjalan; panggilan polos di halaman (checkExportReady,
// _markLoaded, onNilaiInput, …) ikut memakai pembungkus ini.
//  • Muat hanya bila ada kunci (_draftKey), kartu soal sudah dirender (kolom
//    code-cN / nilai-cN; soal datang dari getExamQuestions sesudah PIN), dan
//    data Firebase sudah dimuat UNTUK KUNCI ITU: _loadDraft() dari _markLoaded
//    (akhir _loadScoredQuestions) yang berjalan saat identitas + sesi PIN sudah
//    ada. Pemuatan tanpa sesi PIN (tab baru sebelum PIN, form login sesudah
//    Keluar) tidak dihitung: kode ledger soal yang dinilai belum diterapkan, dan
//    draft yang mengisi kolom kosong lebih dulu akan menutupinya.
//  • Perender UTS/UAS dibungkus: draft dimuat 250 ms sesudah render (sesudah
//    pemulihan ulang visual dari cache, 150 ms). _loadDraft yang dijadwalkan
//    perender sendiri (CAD) diabaikan — bukan tanda Firebase siap.
//  • Kolom soal yang sudah terkunci (dinilai; disabled) tidak diisi draft.
//  • Tidak ada tulisan sebelum draft kunci itu dimuat: simpanan sebelum kartu ada
//    (mis. checkExportReady dari _markLoaded) dulu menimpa draft dengan isi kosong.
//  • Setiap ketikan di kolom kode, tautan Drive, atau angka bacaan menyimpan draft.
(function () {
  var simpanAsli = window._saveDraft, muatAsli = window._loadDraft;
  if (typeof simpanAsli !== 'function' || typeof muatAsli !== 'function') return;
  var KOLOM = 'textarea[id^="code-c"], input[id^="nilai-c"]';
  var dimuatUntuk = null, siapUntuk = null;
  function kunci() { try { return typeof _draftKey === 'function' ? _draftKey() : null; } catch (e) { return null; } }
  function fbSiap() { try { return typeof _firebaseStateLoaded !== 'undefined' && _firebaseStateLoaded === true; } catch (e) { return false; } }
  function kartuAda() { return !!document.querySelector(KOLOM); }
  function muat() {
    var k = kunci();
    if (!k || siapUntuk !== k || !kartuAda()) return;
    var terkunci = [];
    try { document.querySelectorAll(KOLOM).forEach(function (el) { if (el.disabled) terkunci.push([el, el.value]); }); } catch (e) {}
    dimuatUntuk = k;   // ditandai SEBELUM asli: checkExportReady di dalamnya boleh menyimpan
    try { return muatAsli.apply(this, arguments); }
    finally {
      terkunci.forEach(function (x) { if (x[0].value !== x[1]) x[0].value = x[1]; });   // soal yang dinilai: bukan dari draft
      try { simpanAsli(); } catch (e) {}   // gabungan draft + isian yang sudah ada
    }
  }
  function muatSesudahFirebase() {
    var k = kunci();
    if (k && fbSiap()) siapUntuk = k;   // _markLoaded dengan kunci ini: marker & kode ledger sudah diterapkan
    return muat.apply(this, arguments);
  }
  function simpan() {
    var k = kunci();
    if (!k) return;
    if (dimuatUntuk !== k) { muat(); if (dimuatUntuk !== k) return; }
    return simpanAsli.apply(this, arguments);
  }
  window._loadDraft = muatSesudahFirebase;
  window._saveDraft = simpan;
  window._draftSudahDimuat = function () { var k = kunci(); return !!k && dimuatUntuk === k; };
  function abaikan() {}
  ['renderUTSQuestions', 'renderUASQuestions'].forEach(function (nama) {
    var asli = window[nama];
    if (typeof asli !== 'function') return;
    window[nama] = function () {
      window._loadDraft = abaikan;   // jadwal _loadDraft milik perender: dimuat di bawah
      try { return asli.apply(this, arguments); }
      finally {
        window._loadDraft = muatSesudahFirebase;
        setTimeout(function () { try { muat(); } catch (e) {} }, 250);
      }
    };
  });
  document.addEventListener('input', function (e) {
    var t = e && e.target, id = t && typeof t.id === 'string' ? t.id : '';
    if (!t || !/^(?:TEXTAREA|INPUT)$/.test(t.tagName || '') || !/^(?:code-c\\d{1,2}|nilai-c\\d{1,2}|gdrive-\\w+)$/.test(id)) return;
    try { simpan(); } catch (x) {}
  }, true);
})();
</script>
${PENJAGA_AKHIR}`;

// Blok identik di ke-12 halaman dan diwarisi generator CAD dari kerangka TTL:
// tanpa token course, tanpa literal slot, tanpa konstanta skrip module, dan
// tanpa token yang ditolak `wajib_kosong` scripts/cad-exam/bangun.py.
export const TOKEN_TERLARANG = [
  /math4|getaran|optoauto|sisken|sistem_kendali|kendali_cerdas|pemodelan|tenaga_listrik|tenaga-listrik|tenaga listrik/i,
  /'(?:uts|uas)'|"(?:uts|uas)"|_(?:uts|uas)_/i, /_identity_/, /_draft_'/, /\bLOCAL_IDENTITY\b/, /\bMODULE_ID\b/, /\bPERTEMUAN\b/,
  /pyodide/i, /runAndCheck\(/, /code-textarea/, /stdout-box/, /onCodeInput/, /tfAnswered|tfScores|selectTF|checkTF/,
  /container-tf/, /U[TA]S_TF/, /tf-card/, /tfopts-/, /BENAR \(TRUE\)|SALAH \(FALSE\)/, /TENAGALISTRIK|GETARANMESIN/,
  /gdrive-link|gdrive-feedback/,
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

// Isi _draftKey yang dikenali untuk diganti: ragam lama (kunci dari konstanta
// skrip module, 12 halaman per 29 Sep 2026) atau blok KUNCI versi apa pun.
export const RX_KUNCI_LAMA = /^function _draftKey\(\) \{\s*try \{\s*const me = JSON\.parse\(localStorage\.getItem\(LOCAL_IDENTITY\) \|\| 'null'\);\s*if \(!me \|\| !me\.nim \|\| me\.role === 'dosen'\) return null;\s*return '[a-z0-9_]+_draft_' \+ MODULE_ID \+ '_' \+ me\.nim;[^\n]*\s*\} catch\(e\) \{ return null; \}\s*\}$/;
export const RX_KUNCI_BLOK = /^function _draftKey\(\) \{\n {2}\/\/ DRAFT-UJIAN:KUNCI BEGIN v\d+[^\n]*\n[\s\S]*\n {2}\/\/ DRAFT-UJIAN:KUNCI END v\d+\n\}$/;

/** `_markLoaded` di `_loadScoredQuestions` (identik di ke-12 halaman, 29 Sep 2026). */
export const MARK_LOADED = [
  "  const _markLoaded = () => {",
  "    _firebaseStateLoaded = true;",
  "    if (typeof checkExportReady === 'function') checkExportReady();",
  "    if (typeof checkForumReady === 'function') checkForumReady();",
  "    if (typeof _loadDraft === 'function') _loadDraft();   // PEDOMAN §15.4 draft AFTER Firebase",
  "  };",
].join("\n");
/** Jadwal muat draft di akhir perender UTS/UAS CAD (kerangka generator). */
export const JADWAL_RENDER = "if (typeof _loadDraft === 'function') setTimeout(_loadDraft, 200);";

/** Prasyarat halaman ujian; mengembalikan ringkasan ragam. `html` sudah LF. */
export function prasyarat(html) {
  for (const [nama, n] of [
    [AWAL_FUNGSI, 1], ["function _saveDraft() {", 1], ["function _loadDraft() {", 1],
    ["window._saveDraft = _saveDraft;", 1], ["window._loadDraft = _loadDraft;", 1],
    ["function getIdentityLocal(", 1], ["let _firebaseStateLoaded", 1],
    ["const EXAM_ID = '", 1], ["window.EXAM_ID = EXAM_ID;", 1], [JANGKAR, 1],
  ]) {
    const c = hitung(html, nama);
    if (c !== n) throw new Error(`\`${nama.split("\n")[0]}\` muncul ${c}x, harusnya ${n}`);
  }
  const perender = ["UTS", "UAS"].filter((j) => html.includes(`function render${j}Questions(`));
  if (perender.length !== 1) throw new Error(`perender soal render(UTS|UAS)Questions: ${perender.length}, harap 1`);
  const nPerender = `function render${perender[0]}Questions(`;
  const ekspor = `window.render${perender[0]}Questions = render${perender[0]}Questions;`;
  if (hitung(html, nPerender) !== 1 || hitung(html, ekspor) !== 1) throw new Error(`\`${nPerender}\`/\`${ekspor}\` harus tepat sekali`);
  const jangkar = html.indexOf(JANGKAR);
  for (const f of [AWAL_FUNGSI, "function _saveDraft() {", "function _loadDraft() {", "function getIdentityLocal(", "let _firebaseStateLoaded",
    "window._saveDraft = _saveDraft;", "window._loadDraft = _loadDraft;", nPerender, ekspor]) {
    const i = html.indexOf(f);
    const tag = skripPelingkup(html, i);
    if (tag === null || /type\s*=\s*["']module["']/i.test(tag)) throw new Error(`\`${f}\` harus berada di skrip klasik (global)`);
    if (i > jangkar) throw new Error(`\`${f}\` harus sebelum skrip module (${JANGKAR.split("\n")[0]})`);
  }
  const ei = html.indexOf("window.EXAM_ID = EXAM_ID;");
  const tagEi = skripPelingkup(html, ei);
  if (!tagEi || !/type\s*=\s*["']module["']/i.test(tagEi) || ei < jangkar) throw new Error("`window.EXAM_ID = EXAM_ID;` harus di skrip module sesudah jangkar");
  // _saveDraft/_loadDraft memanggil _draftKey() polos (pembungkus & kunci baru berlaku).
  for (const f of ["function _saveDraft() {", "function _loadDraft() {"]) {
    const i = html.indexOf(f), j = akhirFungsi(html, i);
    if (j < 0 || !/\bconst key = _draftKey\(\);/.test(html.slice(i, j))) throw new Error(`\`${f}\` tidak memanggil _draftKey() polos`);
  }
  // getIdentityLocal membaca kunci identitas yang sama dengan LOCAL_IDENTITY.
  const slot = (html.match(/const MODULE_ID = '([a-z]+)';/) || [])[1];
  const li = (html.match(/const LOCAL_IDENTITY = `([a-z0-9_]+)\$\{MODULE_ID\}`;/) || [])[1];
  const gi = html.indexOf("function getIdentityLocal("), giAkhir = akhirFungsi(html, gi);
  const giKunci = [...html.slice(gi, giAkhir).matchAll(/localStorage\.getItem\('([^']+)'\)/g)].map((m) => m[1]);
  if (!slot || !li || giKunci.length !== 1 || giKunci[0] !== li + slot) {
    throw new Error(`getIdentityLocal membaca ${JSON.stringify(giKunci)}, harusnya kunci LOCAL_IDENTITY '${li}${slot}'`);
  }
  const i = html.indexOf(AWAL_FUNGSI), j = akhirFungsi(html, i);
  const fungsi = html.slice(i, j + 1);
  if (!RX_KUNCI_LAMA.test(fungsi) && !RX_KUNCI_BLOK.test(fungsi)) throw new Error("_draftKey berbentuk tak dikenal (bukan ragam lama maupun blok DRAFT-UJIAN:KUNCI)");
  // Tanda "Firebase siap untuk kunci ini" PENJAGA = _loadDraft() dari _markLoaded
  // (skrip module, sesudah marker & kode ledger diterapkan). Pemanggil _loadDraft
  // lain akan terbaca sebagai tanda itu, kecuali jadwal di perender (diabaikan:
  // fungsi kosong selama perender berjalan) — jadi daftarnya dikunci di sini.
  const ml = html.indexOf(MARK_LOADED);
  if (hitung(html, MARK_LOADED) !== 1) throw new Error(`\`_markLoaded\` (_loadScoredQuestions) muncul ${hitung(html, MARK_LOADED)}x dalam bentuk MARK_LOADED, harusnya 1`);
  if (ml < jangkar || !/type\s*=\s*["']module["']/i.test(skripPelingkup(html, ml) || "")) throw new Error("`_markLoaded` harus di skrip module sesudah jangkar");
  const pi = html.indexOf(nPerender), pj = akhirFungsi(html, pi);
  const badanPerender = html.slice(pi, pj + 1);
  const ulangVisual = `setTimeout(() => window._reapply${perender[0]}StateFromCache(), 150);`;
  if (hitung(badanPerender, ulangVisual) !== 1) throw new Error(`perender harus menjadwalkan \`${ulangVisual}\` tepat sekali (draft dimuat 250 ms sesudah render, sesudah pemulihan ulang visual)`);
  const jadwalRender = hitung(html, JADWAL_RENDER);
  if (jadwalRender > 1 || hitung(badanPerender, JADWAL_RENDER) !== jadwalRender) throw new Error(`\`${JADWAL_RENDER}\` hanya boleh sekali, di dalam perender`);
  const boleh = new Set(["function _loadDraft() {", "window._loadDraft = _loadDraft;", MARK_LOADED.split("\n")[4].trim(), JADWAL_RENDER]);
  const asing = html.replace(RX_PENJAGA, "").split("\n").map((b) => b.trim())
    .filter((b) => /\b_loadDraft\b/.test(b) && !/^(?:\/\/|\*|\/\*)/.test(b) && !boleh.has(b));
  if (asing.length) throw new Error(`pemanggil _loadDraft tak dikenal (akan terbaca sebagai tanda Firebase siap): ${asing[0].slice(0, 120)}`);
  return { perender: perender[0], cad: html.includes('class="nilai-input"'), jadwalRender: jadwalRender === 1 };
}

export function proses(awal) {
  const eol = awal.includes("\r\n") ? "\r\n" : "\n";
  const lf = awal.replace(/\r\n/g, "\n");
  const catatan = [];
  const info = prasyarat(lf);
  let html = lf;

  // (a) KUNCI: seluruh fungsi _draftKey diganti templat.
  const i = html.indexOf(AWAL_FUNGSI), j = akhirFungsi(html, i);
  const lama = html.slice(i, j + 1);
  if (lama !== KUNCI) { html = html.slice(0, i) + KUNCI + html.slice(j + 1); catatan.push(RX_KUNCI_BLOK.test(lama) ? "kunci-diperbarui" : "kunci-dipasang"); }

  // (b) PENJAGA: tepat sebelum jangkar skrip module.
  const blokLama = html.match(RX_PENJAGA) || [];
  if (blokLama.length > 1) throw new Error(`blok DRAFT-UJIAN:PENJAGA muncul ${blokLama.length}x, harusnya 1`);
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
  catatan.push(info.cad ? "ragam-cad" : "ragam-kode");

  // ── Penjaga hasil ──
  for (const [s, n] of [[KUNCI_AWAL, 1], [KUNCI_AKHIR, 1], [PENJAGA_AWAL, 1], [PENJAGA_AKHIR, 1], [KUNCI, 1], [PENJAGA + "\n" + JANGKAR, 1]]) {
    if (hitung(html, s) !== n) throw new Error(`hasil: \`${s.split("\n")[0]}\` harus tepat ${n}x`);
  }
  if (/DRAFT-UJIAN:(?:KUNCI|PENJAGA) (?:BEGIN|END)/.test(html.replace(KUNCI, "").replace(PENJAGA, ""))) throw new Error("hasil: penanda DRAFT-UJIAN yatim");
  const aiLama = blokAi(lf), aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) if (b.includes("DRAFT-UJIAN")) throw new Error("blok DRAFT-UJIAN jatuh di dalam blok AI-CHAT-AGENT");
  prasyarat(html);

  const keluar = eol === "\n" ? html : html.replace(/\n/g, eol);
  return keluar === awal ? null : { html: keluar, catatan };
}

/** Ke-12 halaman <Kursus>/Exam/UTS.html|UAS.html (bukan salinan konflik OneDrive). */
export function halamanUjian() {
  const out = [];
  for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
    if (!kursus.isDirectory()) continue;
    for (const jenis of ["UTS", "UAS"]) {
      const f = path.join(root, kursus.name, "Exam", `${jenis}.html`);
      if (fs.existsSync(f)) out.push(f);
    }
  }
  return out.sort();
}

for (const blok of [KUNCI, PENJAGA]) {
  for (const rx of TOKEN_TERLARANG) {
    if (rx.test(blok)) throw new Error(`templat DRAFT-UJIAN memuat token terlarang ${rx}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const periksa = process.argv.includes("--periksa");
  const berkas = halamanUjian();
  if (berkas.length !== 12) throw new Error(`harap 12 halaman <Kursus>/Exam/UTS.html|UAS.html, ditemukan ${berkas.length}`);
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
  console.log(`${hasil.length} dari ${berkas.length} halaman ujian ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
  if (periksa && hasil.length > 0) process.exitCode = 1;
}
