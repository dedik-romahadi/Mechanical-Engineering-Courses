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
 *         - (v3) yang tersimpan HANYA isian mahasiswa yang belum dinilai atau
 *           belum terkirim. Tulisan `_saveDraft` halaman disaring SEBELUM sampai
 *           ke localStorage: selama `_saveDraft` asli berjalan
 *           `Storage.prototype.setItem` dibungkus sesaat, sehingga objek yang
 *           ditulis halaman dari DOM diganti objek tersaring (badan fungsi halaman
 *           tidak disunting; tulisan localStorage lain di dalamnya dibuang). Kolom
 *           kode/angka: soal ber-`compAnswered` tidak pernah ikut; kolom yang
 *           DIKETIK di tab ini (event `input`) diambil dari DOM, kolom lain
 *           mempertahankan isi draft tersimpan — jadi kode/angka ledger
 *           (`getJawabanSaya`), angka kiriman terakhir tugas yang dibuka lagi
 *           (`JAWABAN-PRIVAT:ANGKA-CAD`), dan isian tab lain yang masih memuat
 *           teks lama tidak pernah masuk draft; tautan Drive sama. Metadata
 *           berkas CAD: `berkasTerunggah` + metadata draft yang masih ditahan,
 *           tanpa tugas ber-`compAnswered` dan tanpa berkas yang sudah dikirim; angka
 *           yang sudah dikirim juga tidak pernah ikut (butir KIRIMAN v5 di bawah — v3
 *           masih menyimpan keduanya untuk tugas yang dibuka lagi, karena `compAnswered`
 *           kembali false; v4 hanya di tab yang menerima respons). Kode soal yang
 *           dinilai di TAB LAIN (v5, pengumuman BroadcastChannel) dianggap dinilai juga.
 *           Teks Forum hanya bila berbeda dari
 *           teks server yang diketahui tab itu (suntingan belum terkirim),
 *           bersama `forumBasis` = SIDIK (hash 53-bit) teks server tempat
 *           suntingan itu dibuat, bukan teks server itu sendiri. Draft tanpa isi
 *           dihapus. Salinan `<kunci>_sinkron` v2 (berisi teks server) dihapus
 *           saat draft dimuat. Draft TIDAK dihapus saat Keluar (isian yang belum
 *           terkirim milik mahasiswa), tetapi tidak pernah berisi jawaban ledger
 *           maupun teks server;
 *         - forum, gabung 3-arah saat draft pertama kali dimuat (forum server
 *           sudah diketahui dari event yang sama), per jawaban fqN yang
 *           draftnya ≠ '' dan ≠ server: sidik server = `forumBasis` draft →
 *           suntingan BELUM TERKIRIM (server belum berubah sejak suntingan dibuat)
 *           → textarea yang masih = server/kosong diisi draft, ditandai disunting,
 *           lalu dikirim PROGRES-MODUL sesudah progres diterapkan; sidik berbeda →
 *           server berubah di perangkat/tab lain → SERVER MENANG: textarea yang
 *           masih = draft diisi teks server, draft jawaban itu dibuang, dan
 *           catatan lembut `#dm-catatan-fqN` muncul di bawah textarea (hilang saat
 *           jawaban itu diketik). Draft tanpa `forumBasis` (hanya dibuat tangan/
 *           uji) dianggap belum terkirim hanya bila server belum punya catatan
 *           forum sama sekali. Textarea yang sudah diubah pengguna tidak disentuh.
 *           (v2 memakai salinan tersinkron: draft lama yang belum terkirim di
 *           perangkat 1 menimpa suntingan yang lebih baru dari perangkat 2 dan
 *           bisa membalik forumSelesai true → false — temuan verifikasi 30
 *           September 2026.) Sesudah muat, simpanan hanya mengambil teks Forum
 *           dari textarea yang DISUNTING DI TAB INI (event `input`; tanda dilepas
 *           sesudah kiriman sukses, dan event `progres-modul:forum-tersimpan`
 *           memperbarui teks server yang diketahui tab itu, jadi teks yang sudah
 *           terkirim keluar dari draft); jawaban lain mempertahankan draft
 *           tersimpan. Kiriman forum tetap hanya lewat simpanForum PROGRES-MODUL
 *           (PENJAGA-FORUM);
 *         - tugas CAD (v3): metadata berkas dari draft dipakai hanya sesudah
 *           `getJawabanSaya` untuk NIM + hash PIN sesi itu SELESAI dan diterapkan
 *           (panggilannya dicatat lewat pembungkus `window._getJawabanSayaCallable`
 *           — accessor yang dipasang PENJAGA sebelum skrip module JEMBATAN
 *           menugaskannya — dan `_markLoaded` sesudahnya, yang berjalan sesudah
 *           `_gabungJawabanSaya` menandai `berkasDiServer` dan kartu berkas), dan
 *           hanya bila server tidak punya berkas tugas itu (`berkasDiServer`) atau
 *           sidik SHA-256 metadata draft sama dengan ringkasan server di kartu
 *           `berkas-status-qId`. Sebelum itu metadata ditahan di memori (tetap
 *           ikut tersimpan) — tidak dipasang di `berkasTerunggah`, jadi kartu,
 *           konfirmasi kirim, dan ekspor tidak menyebut berkas lama selama
 *           `getJawabanSaya` lebih lambat dari batas tunggunya 2,5 detik; bila
 *           server punya berkas lain, metadata draft dibuang. Unggahan di tab itu
 *           selalu menang. Server menilai berkas terbaru di `tugasBerkas`;
 *         - tugas CAD yang DIKIRIM lalu dibuka lagi (v4, disempurnakan v5; temuan verifikasi putaran 1,
 *           30 September 2026: sesudah kiriman yang dinilai salah, `_bukaKirimUlangCad`
 *           mengembalikan `compAnswered` ke false sementara tanda "diketik" masih ada,
 *           sehingga angka yang dikirim dan metadata berkas yang dinilai tetap di draft —
 *           juga sesudah Log Out dan muat ulang — dan metadata itu dipakai lagi karena
 *           SHA-256-nya sama dengan ringkasan LEDGER di kartu, padahal server menilai
 *           unggahan terbaru dari perangkat lain). Sesudah muat ulang, metadata draft untuk
 *           tugas ber-`_cadSudahKirim` dibuang (tidak dipasang): kartu tugas itu memuat
 *           ringkasan ledger berkas yang sudah dinilai, dan server tidak melaporkan unggahan
 *           yang belum dinilai untuk tugas ber-ledger, jadi tidak bisa dipastikan metadata
 *           draft itu berkas terbaru — kesamaan SHA-256 dengan ringkasan ledger justru berarti
 *           berkas yang sudah dinilai. Konfirmasi kirim menyebut "yang terakhir diunggah"
 *           (server menilai berkas terbaru);
 *         - KIRIMAN (v5; temuan verifikasi putaran 2, 30 September 2026: v4 hanya mengenali
 *           kiriman lewat `_bukaKirimUlangCad(…, true)` di tab yang MENERIMA respons, jadi
 *           angka yang dikirim tetap di draft — juga sesudah muat ulang dan Log Out — bila
 *           respons hilang/galat sesudah server menilai, bila tab dimuat ulang saat menilai,
 *           atau bila tab/perangkat lain yang mengirim; kode soal yang dinilai di tab lain juga
 *           kembali lewat simpanan kolom lain): PENJAGA membungkus
 *           `window._callCheckModulAnswer` lewat accessor (skrip module menugaskannya sesudah
 *           PENJAGA; janjinya diteruskan apa adanya). Tugas berkas: begitu dikirim, angka dan
 *           berkas KIRIMAN ITU keluar dari draft tersimpan (selama menunggu `compAnswered`
 *           hanya kunci optimistis `kirimTugas`, jadi angka lain tugas itu — mis. dari tab
 *           lain — tetap, dan tulisan sesudah hasil ditunda sampai kelanjutan halaman
 *           selesai); hasil dinilai (juga `bisaUlang`) atau TAK PASTI (galat
 *           deadline-exceeded/internal/unknown/aborted/cancelled/data-loss/jaringan, yang bisa
 *           terjadi sesudah server menilai) → angka (bilangan, `_parseNilai`) dan sidik berkas
 *           (nama|SHA-256|waktu unggah|versi) itu dicatat TERKIRIM dan tidak pernah tersimpan
 *           lagi; ditolak sebelum dinilai (failed-precondition, invalid-argument, unavailable,
 *           unauthenticated, … — bukan attempt) → sesudah catch halaman isian kolom itu kembali
 *           ke draft. Saat draft dimuat, angka draft yang sama dengan angka kiriman terakhir di
 *           ledger (`getJawabanSaya` sesi ini, `jawaban[q].angka` — yang juga diisi ANGKA-CAD,
 *           dicatat pembungkus `_getJawabanSayaCallable`) atau dengan kiriman yang dicatat tidak
 *           mengisi kolom dan keluar dari draft (getJawabanSaya terlambat: pada muat
 *           berikutnya). Ketikan tab ini yang sama dengan angka terkirim memberi jalan pada isi
 *           draft tersimpan yang belum dikirim (angka baru dari tab lain tidak hilang). Hasil
 *           dinilai/tak pasti diumumkan ke tab lain peramban ini lewat BroadcastChannel (di
 *           memori, tidak ada yang ditulis ke localStorage): soal final → dianggap dinilai di tab
 *           itu (`compAnswered` tab lain), angka/sidik berkas → terkirim. Angka dan berkas yang
 *           diketik/diunggah SESUDAH kiriman terakhir tersimpan seperti biasa; angka draft yang
 *           berbeda dari angka ledger tetap mengisi kolom kosong tugas yang dibuka lagi. Batas:
 *           ledger hanya membawa attempt terakhir, jadi angka draft yang sama dengan attempt
 *           lebih lama dari perangkat lain baru keluar bila diketik ulang atau dikirim lagi;
 *         - NIM mahasiswa berganti tanpa muat ulang (logout paksa karena jadwal
 *           dihapus atau PIN kosong, lalu NIM lain masuk di tab yang sama): pada
 *           `_markLoaded` atau progres pertama NIM baru, kolom draft dikosongkan
 *           dan halaman dimuat ulang — isian NIM sebelumnya tidak masuk draft
 *           maupun forum NIM baru;
 *         - setiap `input` pada `code-cN`, `nilai-cN`, `gdrive-link`, atau
 *           `ans-fqN` menyimpan draft (beberapa kolom kode tidak punya
 *           `oninput`).
 *       `window._draftSudahDimuat()` melaporkan status (dipakai uji).
 *       Akun simulasi menulis draft seperti mahasiswa — disengaja, supaya alur
 *       draft bisa diuji dengan akun itu (isinya tetap tersaring seperti di atas).
 *       Prasyarat halaman (diperiksa sebelum memasang): fungsi draft, kunci,
 *       identitas, dan `let _firebaseStateLoaded` di skrip klasik sebelum
 *       PROGRES-MODUL; di halaman bertugas berkas (CAD)
 *       `window.berkasTerunggah = berkasTerunggah;` di skrip klasik sebelum
 *       PROGRES-MODUL (PENJAGA memasang pembungkus getJawabanSaya hanya bila
 *       objek itu sudah ada) dan `window._getJawabanSayaCallable =` di skrip
 *       module; juga `window._cadSudahKirim = {};` tepat sekali dan (v5) di dalam
 *       `kirimTugas` (skrip klasik) kunci optimistis `compAnswered[qId] = true;` SEBELUM
 *       satu-satunya panggilan penilaian `window._callCheckModulAnswer(qId, nilai, …)`;
 *       di semua halaman (v5) `window._callCheckModulAnswer = ` tepat sekali, di skrip
 *       module, tanpa penugasan lain, dan semua panggilannya lewat `window.`;
 *       `window.MODUL_ID = MODUL_ID;` di skrip module;
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
 *   - Draft tidak dihapus saat Keluar (sama dengan draft ujian; isinya hanya
 *     isian yang belum dinilai/terkirim, lihat v3 di atas); tanpa sesi
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
export const VERSI_PENJAGA = "v5";   // v2: sesi diterima server, Forum hanya dari suntingan tab ini, NIM berganti → muat ulang; v3: draft tersaring (tanpa jawaban dinilai/teks server), Forum gabung 3-arah (sidik basis server), berkas CAD sesudah getJawabanSaya; v4: tugas CAD yang dinilai lalu dibuka lagi — angka yang dikirim & berkas yang dinilai keluar dari draft, metadata draft tugas itu tidak dipakai; v5: kiriman dikenali di _callCheckModulAnswer (juga respons hilang/galat, muat ulang saat menilai), angka = angka ledger getJawabanSaya dibuang saat muat, hasil penilaian diumumkan ke tab lain (BroadcastChannel)
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
//  • Yang tersimpan HANYA isian mahasiswa yang belum dinilai atau belum terkirim:
//    tulisan _saveDraft halaman disaring sebelum sampai ke localStorage. Kode/angka
//    soal yang sudah dinilai (compAnswered) tidak ikut; kolom yang diketik di tab ini
//    diambil dari DOM, kolom lain mempertahankan draft tersimpan (kode/angka ledger dan
//    angka kiriman terakhir tidak pernah masuk draft). Teks Forum hanya bila berbeda
//    dari teks server, bersama sidik (hash) teks server tempat suntingan itu dibuat —
//    bukan teks server itu sendiri. Draft tanpa isi dihapus; draft tetap ada sesudah
//    Keluar (isian yang belum terkirim milik mahasiswa).
//  • Forum, gabung 3-arah saat draft dimuat: sidik server = basis draft → suntingan
//    belum terkirim, dipulihkan lalu dikirim PROGRES-MODUL sesudah progres diterapkan;
//    sidik berbeda (server berubah di perangkat atau tab lain) → server menang, draft
//    jawaban itu dibuang dan catatan muncul di bawah textarea. Sesudah muat, simpanan
//    hanya mengambil teks Forum dari textarea yang disunting di tab ini; jawaban lain
//    mempertahankan draft tersimpan. Kiriman tetap hanya lewat simpanForum
//    PROGRES-MODUL sesudah progres diterapkan.
//  • Tugas CAD: metadata berkas dari draft dipakai hanya sesudah getJawabanSaya NIM +
//    PIN sesi ini selesai dan diterapkan, dan hanya bila server tidak punya berkas
//    tugas itu atau sidik SHA-256-nya sama dengan ringkasan server di kartu. Sebelum
//    itu ditahan: kartu, konfirmasi kirim, dan ekspor tidak menyebut berkas lama.
//    Tugas yang sudah dikirim: angka dan berkasnya keluar dari draft begitu dikirim, dan tidak
//    tersimpan lagi bila hasilnya dinilai atau tak pasti (respons hilang, batas waktu); angka
//    yang sama dengan angka kiriman terakhir di ledger (getJawabanSaya) dibuang saat draft
//    dimuat, jadi juga sesudah kiriman dari tab/perangkat lain atau muat ulang saat menilai.
//    Hanya ketikan/unggahan sesudahnya yang tersimpan. Metadata draft tugas yang dibuka lagi
//    tidak dipakai sesudah muat ulang — kartunya memuat ringkasan ledger berkas yang dinilai.
//  • Hasil penilaian diumumkan ke tab lain peramban ini (BroadcastChannel, di memori): soal
//    yang dinilai di tab lain tidak dikembalikan ke draft oleh simpanan tab ini.
//  • NIM mahasiswa berganti tanpa muat ulang (logout paksa, lalu NIM lain masuk di
//    tab yang sama): kolom draft dikosongkan dan halaman dimuat ulang.
//  • Setiap ketikan di kolom kode, tautan Drive, angka bacaan, atau Forum disimpan.
//  • Akun simulasi menulis draft seperti mahasiswa (disengaja: alur draft bisa diuji).
(function () {
  var simpanAsli = window._saveDraft, muatAsli = window._loadDraft;
  if (typeof simpanAsli !== 'function' || typeof muatAsli !== 'function') return;
  var FQ = ['fq1', 'fq2', 'fq3'], KOLOM = 'textarea[id^="code-c"], input[id^="nilai-c"]';
  var dimuatUntuk = null, draftAwal = null, sesiFb = null, sesiSah = null;
  var serverUntuk = null, forumServer = null, forumAda = false;
  var kotor = {}, diketik = {}, dibuang = {}, pemilik = null, berganti = false;
  var berkasDraft = {}, berkasTunda = {}, jsSelesai = {}, berkasSiap = null;
  // Kiriman (v5): angka tugas berkas yang sudah dikirim, sidik berkas yang dinilai, angka kiriman terakhir di
  // ledger (getJawabanSaya per NIM + hash PIN sesi), dan soal yang dinilai final di tab lain peramban ini.
  var BERKAS = !!window.berkasTerunggah && typeof window.berkasTerunggah === 'object';
  var angkaKirim = {}, terkirim = {}, angkaLedger = {}, dinilaiLain = {}, berjalan = {}, kanal = null;
  function kunci() { if (berganti) return null; try { return typeof _draftKey === 'function' ? _draftKey() : null; } catch (e) { return null; } }
  function sesi(k) { return k ? k + '|' + String(window._sessionPinHash) : null; }
  function fbSiap() { try { return typeof _firebaseStateLoaded !== 'undefined' && _firebaseStateLoaded === true; } catch (e) { return false; } }
  function teks(v) { return typeof v === 'string' ? v : ''; }
  function baca(k) { try { var d = JSON.parse(localStorage.getItem(k) || 'null'); return d && typeof d === 'object' ? d : null; } catch (e) { return null; } }
  function nimSaya() { try { var me = typeof getIdentityLocal === 'function' ? getIdentityLocal() : null; return me && me.role === 'student' && me.nim ? String(me.nim) : null; } catch (e) { return null; } }
  function sesiJs() { var n = nimSaya(); return n ? n + '|' + String(window._sessionPinHash) : null; }
  // Dinilai: compAnswered tab ini, atau (v5) dinilai final di tab lain. Selama kiriman tugas berkas berjalan,
  // compAnswered hanya kunci optimistis halaman: yang disaring angka & berkas kiriman itu saja (berjalan).
  function dinilai(q) {
    if (dinilaiLain[q]) return true;
    if (berjalan[q]) return false;
    try { return typeof compAnswered === 'object' && !!compAnswered && !!compAnswered[q]; } catch (e) { return false; }
  }
  // Tugas berkas yang sudah pernah dikirim dan dinilai, lalu dibuka lagi untuk kirim ulang.
  function sudahKirim(q) { try { var s = window._cadSudahKirim; return !!s && typeof s === 'object' && !!s[q]; } catch (e) { return false; } }
  function sidikBerkas(x) { return x && typeof x === 'object' ? [x.namaBerkas, x.sha256, x.uploadedAt, x.versi].join('|') : ''; }
  // Angka tugas berkas yang SUDAH DIKIRIM (v5): kiriman tab ini (juga yang sedang dinilai) atau tab lain yang dinilai
  // atau hasilnya tak pasti, dan angka kiriman terakhir di ledger sesi ini (getJawabanSaya — sama dengan yang diisi
  // ANGKA-CAD). Dibandingkan sebagai bilangan (_parseNilai halaman: 4321,5 = 4321.5), jadi berlaku juga bila respons
  // kiriman tidak sampai.
  function angkaTerkirim(q, v) {
    if (!BERKAS || typeof v !== 'string' || !v) return false;
    var n = null, l = angkaLedger[sesiJs()], j = berjalan[q];
    try { n = typeof _parseNilai === 'function' ? _parseNilai(v) : null; } catch (e) {}
    if (typeof n !== 'number' || !isFinite(n)) return false;
    return (angkaKirim[q] || []).indexOf(n) >= 0 || (!!j && j.n === n) || (!!l && l[q] === n);
  }
  function berkasTerkirim(q, x) { var s = sidikBerkas(x), j = berjalan[q]; return (!!terkirim[q] && !!terkirim[q][s]) || (!!j && !!j.b && j.b === s); }
  function catatKirim(q, n, b) {
    if (typeof n === 'number' && isFinite(n)) { var a = angkaKirim[q] = angkaKirim[q] || []; if (a.indexOf(n) < 0) a.push(n); }
    if (b) (terkirim[q] = terkirim[q] || {})[b] = true;
    delete berkasTunda[q];   // metadata draft yang masih ditahan diunggah sebelum kiriman ini: dinilai atau tergantikan
  }
  // Sidik 53-bit (cyrb53) teks Forum server: basis suntingan draft tanpa menyimpan teks itu.
  function sidik(t) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, s = teks(t);
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'c53:' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  // Catatan lembut di bawah textarea Forum yang draftnya dikalahkan server.
  function catatan(q, tampil) {
    try {
      var id = 'dm-catatan-' + q, el = document.getElementById(id), ta = document.getElementById('ans-' + q);
      if (!tampil) { if (el && el.parentNode) el.parentNode.removeChild(el); return; }
      if (el || !ta || !ta.parentNode) return;
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'status');
      el.style.cssText = 'margin:6px 0 0;font-size:.8rem;line-height:1.45;color:#94a3b8';
      el.textContent = 'ℹ Jawaban ini sudah diperbarui dari perangkat atau tab lain, jadi suntingan lama di perangkat ini yang belum terkirim tidak dipakai.';
      ta.parentNode.insertBefore(el, ta.nextSibling);
    } catch (e) {}
  }
  // NIM mahasiswa yang data dan isiannya ada di halaman ini. NIM lain tanpa muat ulang:
  // isian lama tidak boleh masuk draft maupun forum NIM itu — kosongkan, muat ulang.
  function pemilikSama() {
    if (berganti) return false;
    var n = nimSaya();
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
  // Isi draft yang boleh tersimpan: d = objek tulisan _saveDraft halaman (dari DOM),
  // lama = draft tersimpan. Hanya isian mahasiswa yang belum dinilai atau belum terkirim.
  function saring(d, lama) {
    lama = lama || {};
    var o = { gdrive: teks(diketik.gdrive ? d.gdrive : lama.gdrive) }, ada = !!o.gdrive, basis = {};
    var lb = lama.forumBasis && typeof lama.forumBasis === 'object' ? lama.forumBasis : {};
    FQ.forEach(function (q) {
      var t = '', b = null, srv = forumServer ? teks(forumServer[q]) : null;
      if (kotor[q]) { t = teks(d[q]); b = srv === null ? null : sidik(srv); }
      else if (!dibuang[q]) { t = teks(lama[q]); b = typeof lb[q] === 'string' ? lb[q] : null; }
      if (t === srv) t = '';   // sama dengan teks server: bukan suntingan, tidak disimpan
      o[q] = t;
      if (t) { ada = true; if (b) basis[q] = b; }
    });
    if (Object.keys(basis).length) o.forumBasis = basis;
    if (d.code && typeof d.code === 'object') {
      var lk = lama.code && typeof lama.code === 'object' ? lama.code : {}, kode = {};
      Object.keys(d.code).concat(Object.keys(lk)).forEach(function (q) {
        if (!/^c\\d{1,2}$/.test(q) || dinilai(q) || kode[q]) return;
        var v = teks(diketik[q] ? d.code[q] : lk[q]);
        // Angka yang sudah dikirim tidak pernah tersimpan; ketikan tab ini yang sama dengan kiriman itu memberi
        // jalan pada isi draft tersimpan yang belum dikirim (mis. angka baru dari tab lain).
        if (v && angkaTerkirim(q, v)) v = diketik[q] && !angkaTerkirim(q, teks(lk[q])) ? teks(lk[q]) : '';
        if (v) { kode[q] = v; ada = true; }
      });
      o.code = kode;
    }
    if (d.berkas && typeof d.berkas === 'object') {
      var bk = {};
      Object.keys(d.berkas).concat(Object.keys(berkasTunda)).forEach(function (q) {
        var x = Object.prototype.hasOwnProperty.call(d.berkas, q) ? d.berkas[q] : berkasTunda[q];
        if (!bk[q] && x && typeof x === 'object' && x.namaBerkas && !dinilai(q) && !berkasTerkirim(q, x)) { bk[q] = x; ada = true; }
      });
      o.berkas = bk;
    }
    if (typeof d.savedAt === 'string') o.savedAt = d.savedAt;
    return ada ? o : null;
  }
  function tulisDraft(st, k, v, setAsli) {
    var d = null;
    try { d = JSON.parse(v); } catch (e) {}
    if (!d || typeof d !== 'object') return;
    var o = saring(d, baca(k));
    if (o) setAsli.call(st, k, JSON.stringify(o)); else st.removeItem(k);
  }
  // _saveDraft asli dijalankan dengan setItem localStorage dibungkus sesaat: objek draft
  // disaring sebelum ditulis; tulisan localStorage lain di dalamnya dibuang.
  function simpanTersaring(k, diri, argumen) {
    var P = typeof Storage === 'function' ? Storage.prototype : null, setAsli = P && P.setItem;
    if (typeof setAsli !== 'function') return;
    P.setItem = function (kk, v) {
      if (this === localStorage) return kk === k ? tulisDraft(this, k, String(v), setAsli) : undefined;
      return setAsli.apply(this, arguments);
    };
    try { return simpanAsli.apply(diri, argumen || []); }
    finally { P.setItem = setAsli; }
  }
  // Muat pertama untuk kunci ini (forum server sudah diketahui dari event yang sama):
  // gabung 3-arah per jawaban antara draft, basis draft (sidik), dan teks server.
  function selaraskan() {
    var berubah = false, lb = draftAwal && draftAwal.forumBasis && typeof draftAwal.forumBasis === 'object' ? draftAwal.forumBasis : {};
    FQ.forEach(function (q) {
      var ta = document.getElementById('ans-' + q);
      if (!ta) return;
      var lokal = teks(draftAwal && draftAwal[q]), srv = teks(forumServer[q]);
      if (lokal === '' || lokal === srv) return;
      var belum = typeof lb[q] === 'string' ? lb[q] === sidik(srv) : !forumAda;
      if (belum) {   // server belum berubah sejak suntingan dibuat: belum terkirim
        if ((ta.value === srv || ta.value === '') && ta.value !== lokal) { ta.value = lokal; berubah = true; }
        if (ta.value === lokal) kotor[q] = true;
      } else {   // server berubah di perangkat/tab lain: server menang
        dibuang[q] = true;
        if (ta.value === lokal) { ta.value = srv; berubah = true; }
        catatan(q, true);
      }
    });
    return berubah;
  }
  // Metadata berkas dari draft: 'pakai' | 'tahan' (getJawabanSaya sesi ini belum diterapkan) | 'buang'.
  function shaKartu(x) { var m = /SHA-256 ([0-9a-f]{16})/i.exec(String(x || '')); return m ? m[1].toLowerCase() : null; }
  // Tugas yang dibuka lagi: kartunya memuat ringkasan ledger berkas yang SUDAH dinilai, dan server tidak
  // melaporkan unggahan yang belum dinilai untuk tugas ber-ledger, jadi metadata draft tidak bisa dipastikan
  // berkas terbaru (juga bila SHA-256-nya sama dengan ringkasan ledger itu) → dibuang.
  function nasibBerkas(q, meta, kartuTeks) {
    if (dinilai(q) || sudahKirim(q)) return 'buang';
    if (!berkasSiap || berkasSiap !== sesiJs()) return 'tahan';
    var diServer = false;
    try { diServer = typeof berkasDiServer === 'object' && !!berkasDiServer && !!berkasDiServer[q]; } catch (e) {}
    if (!diServer) return 'pakai';
    var a = shaKartu(kartuTeks), b = String((meta && meta.sha256) || '').slice(0, 16).toLowerCase();
    return a && a === b ? 'pakai' : 'buang';
  }
  function aturBerkas(bt, sebelum, kartu) {
    var segar = function (q) { if (typeof _refreshTugasBtn === 'function') { try { _refreshTugasBtn(q); } catch (e) {} } };
    var pulih = function (x) { if (x && x[0] && x[0].innerHTML !== x[1]) { x[0].innerHTML = x[1]; x[0].style.color = x[2]; } };
    Object.keys(bt).forEach(function (q) {
      var x = bt[q], lama = sebelum[q], kt = kartu[q];
      if (x === lama) return;   // tidak dipasang _loadDraft asli kali ini
      if (lama && lama !== berkasDraft[q]) { bt[q] = lama; pulih(kt); segar(q); return; }   // unggahan di tab ini menang
      var n = nasibBerkas(q, x, kt ? kt[1] : '');
      if (n === 'pakai') { berkasDraft[q] = x; delete berkasTunda[q]; return; }
      if (n === 'tahan') { berkasTunda[q] = x; if (lama) bt[q] = lama; else delete bt[q]; }
      else { delete berkasTunda[q]; delete bt[q]; }
      pulih(kt); segar(q);
    });
  }
  function muat() {
    var k = kunci(), s = sesi(k);
    if (!k || sesiFb !== s || sesiSah !== s) return;
    var pertama = dimuatUntuk !== k;
    if (pertama) {
      draftAwal = baca(k);   // potret SEBELUM ada tulisan untuk kunci ini
      try { localStorage.removeItem(k + '_sinkron'); } catch (e) {}   // salinan teks server (v2)
    }
    var dr = pertama ? draftAwal : baca(k);
    // Kolom soal yang sudah dinilai (compAnswered) bukan dari draft: kode/angka ledger
    // yang datang terlambat (getJawabanSaya > batas tunggu) tetap mengisi kolom kosongnya.
    // Juga (v5) kolom tugas berkas yang angka draftnya sudah dikirim (= angka ledger sesi ini atau
    // kiriman yang dicatat): kolom itu milik ANGKA-CAD, dan angka itu keluar dari draft di bawah.
    var tetap = [];
    try {
      document.querySelectorAll(KOLOM).forEach(function (el) {
        var q = el.id.replace(/^[a-z]+-/, '');
        if (dinilai(q) || (dr && dr.code && typeof dr.code === 'object' && angkaTerkirim(q, dr.code[q]))) tetap.push([el, el.value, q]);
      });
    } catch (e) {}
    // Tugas CAD: metadata berkas yang dipasang _loadDraft asli diputuskan sesudahnya.
    var bt = window.berkasTerunggah, sebelum = {}, kartu = {};
    if (!bt || typeof bt !== 'object') bt = null;
    try {
      if (bt) {
        Object.keys(bt).forEach(function (q) { sebelum[q] = bt[q]; });
        Object.keys(dr && dr.berkas && typeof dr.berkas === 'object' ? dr.berkas : {}).forEach(function (q) {
          var st = document.getElementById('berkas-status-' + q);
          kartu[q] = [st, st ? st.innerHTML : '', st ? st.style.color : ''];
        });
      }
    } catch (e) {}
    dimuatUntuk = k;   // ditandai SEBELUM asli: check*Ready di dalamnya boleh menyimpan
    try { return muatAsli.apply(this, arguments); }
    finally {
      tetap.forEach(function (x) {
        if (x[0].value === x[1]) return;
        x[0].value = x[1];
        if (/^nilai-/.test(x[0].id) && typeof _refreshTugasBtn === 'function') { try { _refreshTugasBtn(x[2]); } catch (e) {} }
      });
      try { if (bt) aturBerkas(bt, sebelum, kartu); } catch (e) {}
      var berubah = pertama && !!forumServer && selaraskan();
      try { simpanTersaring(k, null, []); } catch (e) {}   // gabungan draft + isian, tersaring
      dibuang = {};
      if (berubah && typeof window.checkForumReady === 'function') { try { window.checkForumReady(); } catch (e) {} }
    }
  }
  function muatSesudahFirebase() {
    if (pemilikSama()) {
      var k = kunci();
      if (k && fbSiap()) {
        sesiFb = sesi(k);   // _markLoaded dengan sesi ini: marker & kode ledger sudah diterapkan
        var j = sesiJs();
        if (j && jsSelesai[j]) berkasSiap = j;   // ringkasan berkas getJawabanSaya sesi ini ikut diterapkan
      }
    }
    return muat.apply(this, arguments);
  }
  function simpan() {
    var k = kunci();
    if (!k) return;
    if (dimuatUntuk !== k) { muat(); if (dimuatUntuk !== k) return; }
    return simpanTersaring(k, this, arguments);
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
  // Halaman bertugas berkas: getJawabanSaya (JAWABAN-PRIVAT:JEMBATAN, skrip module yang
  // menugaskan window._getJawabanSayaCallable sesudah skrip ini) yang selesai untuk NIM +
  // hash PIN sesi dicatat bersama angka kiriman terakhir tiap tugas di ledger (v5); hasilnya
  // tidak diubah.
  function catatLedger(sj, x) {
    var j = x && x.data && x.data.jawaban, a = {};
    if (j && typeof j === 'object') {
      Object.keys(j).forEach(function (q) {
        var v = j[q];
        if (/^c\\d{1,2}$/.test(q) && v && typeof v === 'object' && typeof v.angka === 'number' && isFinite(v.angka)) a[q] = v.angka;
      });
    }
    angkaLedger[sj] = a;
  }
  if (BERKAS) {
    try {
      var bungkusJs = function (fn) {
        if (typeof fn !== 'function') return fn;
        return function (p) {
          var r = fn.apply(this, arguments), sj = p && p.nim ? String(p.nim) + '|' + String(p.pinHash) : null;
          if (sj) Promise.resolve(r).then(function (x) { jsSelesai[sj] = true; try { catatLedger(sj, x); } catch (e) {} }, function () {});
          return r;
        };
      };
      var jsKini = bungkusJs(window._getJawabanSayaCallable);
      Object.defineProperty(window, '_getJawabanSayaCallable', { configurable: true, enumerable: true,
        get: function () { return jsKini; }, set: function (fn) { jsKini = bungkusJs(fn); } });
    } catch (e) {}
  }
  // Penilaian soal kode dan tugas berkas (v5): window._callCheckModulAnswer (skrip module menugaskannya
  // sesudah skrip ini) dibungkus lewat accessor; janjinya diteruskan apa adanya.
  //  - Tugas berkas: begitu dikirim angka dan berkasnya (yang SAMA dengan kiriman itu) keluar dari draft
  //    tersimpan, jadi muat ulang atau tab ditutup saat menunggu tidak meninggalkannya; selama menunggu
  //    compAnswered hanya kunci optimistis, jadi angka lain (mis. diketik di tab lain) tetap. Hasil dinilai
  //    (juga dibuka lagi untuk kirim ulang) atau TAK PASTI (galat yang bisa terjadi sesudah server menilai:
  //    batas waktu, jaringan, internal) → angka & sidik berkas itu dicatat terkirim dan tidak tersimpan lagi;
  //    ditolak sebelum dinilai (bukan attempt) → sesudah catch halaman isian kolom itu kembali ke draft.
  //  - Hasil dinilai/tak pasti diumumkan ke tab lain peramban ini (BroadcastChannel, di memori; tidak ada yang
  //    ditulis ke localStorage): soal yang dinilai final dianggap dinilai di tab itu juga, angka/berkas yang
  //    dikirim dicatat terkirim. Perangkat lain: angka ledger getJawabanSaya sesudah muat ulang.
  var TAK_PASTI = ['deadline-exceeded', 'internal', 'unknown', 'aborted', 'cancelled', 'data-loss', ''];
  function tulisSekarang() { var k = kunci(); if (k && dimuatUntuk === k) { try { simpanTersaring(k, null, []); } catch (e) {} } }
  // Sesudah kelanjutan halaman (catch kirimTugas / _bukaKirimUlangCad): saat hasil diterima compAnswered masih
  // kunci optimistis, jadi tulisan saat itu akan membuang angka lain tugas itu (mis. dari tab lain).
  function nanti(f) { try { setTimeout(f, 0); } catch (x) { f(); } }
  function selesaiKirim(ki, final) {
    if (ki.cad) { if (berjalan[ki.q] === ki) delete berjalan[ki.q]; catatKirim(ki.q, ki.n, ki.b); }
    try { if (kanal && ki.k) kanal.postMessage({ k: ki.k, q: ki.q, n: ki.n, b: ki.b, final: final }); } catch (e) {}
    if (ki.cad) nanti(tulisSekarang);
  }
  function gagalKirim(ki, e) {
    if (!ki.cad) return;   // soal kode: tidak ada yang dikeluarkan sebelum hasil
    var kode = String((e && e.code) || '').replace(/^functions\\//, '');
    if (TAK_PASTI.indexOf(kode) >= 0) { selesaiKirim(ki, false); return; }
    if (berjalan[ki.q] === ki) delete berjalan[ki.q];
    nanti(function () { diketik[ki.q] = true; tulisSekarang(); });
  }
  function bungkusKirim(fn) {
    if (typeof fn !== 'function' || fn.__draftModul) return fn;
    var w = function (q, jawab) {
      if (typeof q !== 'string' || !/^c\\d{1,2}$/.test(q)) return fn.apply(this, arguments);
      var cad = BERKAS && !!document.getElementById('nilai-' + q) && typeof jawab === 'number' && isFinite(jawab);
      var bt = window.berkasTerunggah, x = cad ? ((bt && bt[q]) || berkasTunda[q]) : null;
      var ki = { k: kunci(), q: q, n: cad ? jawab : null, b: x && typeof x === 'object' ? sidikBerkas(x) : '', cad: cad };
      if (cad) { berjalan[q] = ki; tulisSekarang(); }
      var r;
      try { r = fn.apply(this, arguments); } catch (e) { try { gagalKirim(ki, e); } catch (x2) {} throw e; }
      Promise.resolve(r).then(function (res) { try { selesaiKirim(ki, !(res && res.bisaUlang)); } catch (e) {} },
        function (e) { try { gagalKirim(ki, e); } catch (x2) {} });
      return r;
    };
    w.__draftModul = true;
    return w;
  }
  try {
    var kirimKini = bungkusKirim(window._callCheckModulAnswer);
    Object.defineProperty(window, '_callCheckModulAnswer', { configurable: true, enumerable: true,
      get: function () { return kirimKini; }, set: function (fn) { kirimKini = bungkusKirim(fn); } });
  } catch (e) {}
  try {
    if (typeof BroadcastChannel === 'function') {
      kanal = new BroadcastChannel('draft-modul-kiriman');
      kanal.onmessage = function (e) {
        var m = e && e.data, k = kunci();
        if (!m || typeof m !== 'object' || !k || m.k !== k || typeof m.q !== 'string' || !/^c\\d{1,2}$/.test(m.q)) return;
        if (m.final === true) dinilaiLain[m.q] = true;
        if (BERKAS && (typeof m.n === 'number' || (typeof m.b === 'string' && m.b))) catatKirim(m.q, m.n, typeof m.b === 'string' ? m.b : '');
      };
    }
  } catch (e) { kanal = null; }
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
  // Kiriman forum sukses: teks itu kini teks server yang diketahui tab ini (basis suntingan
  // berikutnya) dan keluar dari draft.
  window.addEventListener('${EVENT_TERSIMPAN}', function (e) {
    var k = kunci(), j = e && e.detail && e.detail.jawaban;
    if (!k || !j || typeof j !== 'object' || serverUntuk !== k) return;
    forumServer = { fq1: teks(j.fq1), fq2: teks(j.fq2), fq3: teks(j.fq3) };
    forumAda = true;
    FQ.forEach(function (q) { var ta = document.getElementById('ans-' + q); if (ta && ta.value === forumServer[q]) kotor[q] = false; });
    if (dimuatUntuk === k) { try { simpanTersaring(k, null, []); } catch (x) {} }
  });
  document.addEventListener('input', function (e) {
    var t = e && e.target, id = t && typeof t.id === 'string' ? t.id : '';
    var m = /^(?:code|nilai)-(c\\d{1,2})$/.exec(id);
    if (m) diketik[m[1]] = true;
    else if (id === 'gdrive-link') diketik.gdrive = true;
    else if (/^ans-fq[1-3]$/.test(id)) { kotor[id.slice(4)] = true; catatan(id.slice(4), false); }
    else return;
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

/** Halaman bertugas berkas (CAD): objek metadata berkas global dan penugasan callable getJawabanSaya. */
export const BERKAS_GLOBAL = "window.berkasTerunggah = berkasTerunggah;";
export const PANGGIL_JS = "window._getJawabanSayaCallable = ";
/** Halaman bertugas berkas: pembuka kirim ulang (diuji validator), kirimTugas, dan catatan tugas terkirim. */
export const BUKA_GLOBAL = "window._bukaKirimUlangCad = function(qId, poin, baru) {";
export const AWAL_KIRIM = "async function kirimTugas(qId) {";
export const SUDAH_KIRIM_GLOBAL = "window._cadSudahKirim = {};";
/** v5: penilaian (semua halaman) dibungkus lewat accessor; di kirimTugas kunci optimistis mendahului panggilan penilaian angka. */
export const PANGGIL_NILAI = "window._callCheckModulAnswer = ";
export const DEFINISI_NILAI = "function _callCheckModulAnswer(";
export const KUNCI_OPTIMIS = "compAnswered[qId] = true;";
export const KIRIM_NILAI = "const res = await window._callCheckModulAnswer(qId, nilai, '', [nilai], [nilai]);";

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
  // Halaman bertugas berkas (CAD): PENJAGA mencatat getJawabanSaya yang selesai hanya bila
  // window.berkasTerunggah sudah ada saat ia diparse, lewat accessor yang dilewati penugasan
  // callable JEMBATAN di skrip module (ditunda, jadi sesudah PENJAGA).
  if (/\bberkasTerunggah\b/.test(tanpaPenjaga)) {
    const bi = html.indexOf(BERKAS_GLOBAL), tb = skripPelingkup(html, bi);
    if (hitung(html, BERKAS_GLOBAL) !== 1 || tb === null || /type\s*=\s*["']module["']/i.test(tb) || bi > jangkar) {
      throw new Error(`halaman bertugas berkas: \`${BERKAS_GLOBAL}\` harus tepat sekali, di skrip klasik sebelum PROGRES-MODUL`);
    }
    const ci = html.indexOf(PANGGIL_JS);
    if (hitung(html, PANGGIL_JS) !== 1 || !/type\s*=\s*["']module["']/i.test(skripPelingkup(html, ci) || "")) {
      throw new Error(`halaman bertugas berkas: \`${PANGGIL_JS}\` harus tepat sekali, di skrip module (JAWABAN-PRIVAT:JEMBATAN)`);
    }
    // v5: kiriman tugas dikenali di pembungkus window._callCheckModulAnswer: kirimTugas (skrip klasik) memasang
    // kunci optimistis compAnswered SEBELUM satu-satunya panggilan penilaian angka, sehingga tulisan draft saat
    // kiriman berjalan tidak lagi memuat angka/berkas tugas itu.
    const ki = html.indexOf(AWAL_KIRIM), kj = ki < 0 ? -1 : akhirFungsi(html, ki), bk = html.indexOf(KIRIM_NILAI);
    const ko = ki < 0 ? -1 : html.indexOf(KUNCI_OPTIMIS, ki);
    if (hitung(tanpaPenjaga, AWAL_KIRIM) !== 1 || hitung(tanpaPenjaga, KIRIM_NILAI) !== 1 || !(ki < ko && ko < bk && bk < kj)
      || /type\s*=\s*["']module["']/i.test(skripPelingkup(html, ki) || "module")) {
      throw new Error(`halaman bertugas berkas: \`${AWAL_KIRIM}\` (skrip klasik) harus memasang \`${KUNCI_OPTIMIS}\` sebelum satu-satunya \`${KIRIM_NILAI}\``);
    }
    if (hitung(tanpaPenjaga, SUDAH_KIRIM_GLOBAL) !== 1) throw new Error(`halaman bertugas berkas: \`${SUDAH_KIRIM_GLOBAL}\` harus tepat sekali`);
  }
  // v5 (semua halaman): PENJAGA membungkus window._callCheckModulAnswer lewat accessor saat diparse. Fungsinya
  // didefinisikan dan ditugaskan di skrip module (ditunda → lewat setter), tanpa penugasan lain, dan semua
  // panggilannya lewat `window.` (panggilan polos di skrip module melewati pembungkus).
  const pi = html.indexOf(PANGGIL_NILAI), di = html.indexOf(DEFINISI_NILAI);
  if (hitung(tanpaPenjaga, PANGGIL_NILAI) !== 1 || !/type\s*=\s*["']module["']/i.test(skripPelingkup(html, pi) || "")
    || hitung(tanpaPenjaga, DEFINISI_NILAI) !== 1 || !/type\s*=\s*["']module["']/i.test(skripPelingkup(html, di) || "")
    || (tanpaPenjaga.match(/\b_callCheckModulAnswer\s*=(?!=)/g) || []).length !== 1) {
    throw new Error(`\`${DEFINISI_NILAI}\` dan \`${PANGGIL_NILAI}\` harus tepat sekali, di skrip module, tanpa penugasan lain (pembungkus DRAFT-MODUL:PENJAGA)`);
  }
  if ((tanpaPenjaga.match(/_callCheckModulAnswer\s*\(/g) || []).length
    !== (tanpaPenjaga.match(/\bwindow\._callCheckModulAnswer\s*\(/g) || []).length + hitung(tanpaPenjaga, DEFINISI_NILAI)) {
    throw new Error("`_callCheckModulAnswer(` harus dipanggil lewat `window.` (pembungkus DRAFT-MODUL:PENJAGA)");
  }
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
