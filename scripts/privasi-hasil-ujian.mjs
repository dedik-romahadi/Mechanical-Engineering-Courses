/**
 * Data kelas di 12 halaman UTS/UAS hanya dirender untuk dosen terverifikasi.
 *
 * MASALAHNYA. renderVisitors memilih jalurnya dengan
 * `_isStudent = _me && _me.nim && _me.role !== 'dosen'`: mahasiswa mendapat
 * kartu "Nilai Anda", SELAIN itu dianggap dosen. Tamu di layar login dan
 * "Mode Preview (Tanpa Login)" tidak punya identitas mahasiswa, jadi keduanya
 * masuk jalur dosen dan tab Hasil terisi tabel kelas lengkap (nama, NIM, status
 * Terlambat/Bolos/Tepat Waktu, poin, kunjungan, waktu akses), papan Top Skor/
 * Top Akses, statistik kelas, serta daftar mahasiswa online (#vpList, #vpBadge,
 * #fabCount). Mahasiswa yang sedang ujian cukup membuka tab kedua dalam Mode
 * Preview untuk melihat status dan nilai seluruh kelas — bertentangan dengan
 * aturan "UTS/UAS PRIVACY" (mahasiswa hanya melihat nilai sendiri).
 * updateLeaderboard juga dipanggil fetchMasterStudents untuk SIAPA PUN, jadi
 * papan peringkat terisi di DOM bahkan untuk mahasiswa (tersembunyi, tetapi
 * nama/NIM/poin teman ada di halaman).
 *
 * YANG DILAKUKAN (di luar penanda AI-CHAT-AGENT dan ASISTEN-UJIAN-MAHASISWA):
 *   1. JS — sesudah blok ASISTEN-UJIAN-MAHASISWA:JS (fungsi
 *      _kosongkanRosterUjian dari sana dipakai ulang):
 *      - _dosenUjianTerverifikasi(me): SATU-SATUNYA aturan dosen halaman ujian
 *        (role 'dosen' dan nama 'dedik romahadi', huruf besar/kecil bebas);
 *      - _dataKelasUjianBoleh(): aturan itu, dan tidak pernah dalam Mode Preview;
 *      - _tampilkanHasilTanpaDataKelas(): placeholder netral di tab Hasil,
 *        papan peringkat dan judul tabel disembunyikan, isi papan/statistik/
 *        daftar online DIBUANG dari DOM (bukan sekadar disembunyikan);
 *      - _pulihkanTataHasilDosen(): jalur dosen menampilkan lagi papan dan
 *        judul tabel yang sempat disembunyikan;
 *      - _segarkanHasilUjian(): render ulang dari data terakhir
 *        (latestVisitors, onlinePresence).
 *   2. _applyRoleVisibility — `isDosen` memakai _dosenUjianTerverifikasi(me),
 *      sehingga aturan tombol Reset/banner jadwal/#visitorFab dan aturan data
 *      kelas tidak bisa menyimpang; di akhir fungsi _segarkanHasilUjian()
 *      dipanggil, jadi dosen yang baru login dari layar tamu/Preview langsung
 *      melihat data kelas (tidak menunggu event RTDB berikutnya atau interval
 *      30 detik), dan logout paksa langsung membuang data kelas dari DOM.
 *   2c. enterPreviewMode — tepat sesudah `window._previewMode = true;`
 *      _segarkanHasilUjian() dipanggil. Tanpa ini, data kelas yang sudah
 *      dirender untuk identitas dosen tersimpan (dosen memilih "← Pilih peran
 *      lain" lalu "Mode Preview") tetap terlihat dalam Preview sampai render
 *      berikutnya (event jadwal/RTDB atau interval 30 detik).
 *   3. renderVisitors — tepat sesudah cabang mahasiswa (yang tetap sama):
 *      selain dosen terverifikasi berhenti dengan placeholder. Daftar online
 *      tamu kini tidak pernah diisi di sumbernya; pembersih defensif
 *      buka-asisten-ujian.mjs tetap dipertahankan.
 *   4. updateLeaderboard — baris pertama: selain dosen terverifikasi papan dan
 *      statistik dikosongkan lalu return.
 *
 * TAMBAHAN v2 (26 September 2026, lanjutan PR yang sama):
 *   5. AUTOLOGIN — _handleScheduleReady dulu memakai aturan dosen sendiri,
 *      `_isDosen = me.nama.toLowerCase() === 'dedik romahadi'` (nama saja, tanpa
 *      role), untuk melewati gerbang jam mulai dan penambahan kunjungan. Kini
 *      `_isDosen = _dosenUjianTerverifikasi(me)`, dan identitas tersimpan yang
 *      bukan dosen terverifikasi maupun mahasiswa ber-NIM
 *      (_identitasUjianDikenal: sisa format lama {nama:'Dedik Romahadi'} tanpa
 *      role, atau {role:'dosen'} bernama lain) tidak dipulihkan otomatis —
 *      layar login tetap tampil, tanpa #visitorFab dan tanpa lewati gerbang jam
 *      mulai. Dulu identitas seperti itu setengah-login: overlay hilang, 👥 FAB
 *      muncul membuka panel online kosong, soal tertahan "Menunggu identitas
 *      NIM", tanpa tombol Reset.
 *   6. PEMILIH — pemilih peran (Mahasiswa/Dosen/Preview) hanya dilewati untuk
 *      identitas yang memang dipulihkan AUTOLOGIN; identitas lain melihatnya
 *      seperti tamu (dosen dengan identitas lama bisa langsung memilih Dosen).
 *   7. SOAL-DOSEN — _activateDosenQuestionView (tinjauan soal hanya-baca dosen)
 *      memakai _dosenUjianTerverifikasi, bukan `role === 'dosen'` saja.
 *      _previewGuard/_previewExportGuard SENGAJA tetap berbasis role: keduanya
 *      MEMBATASI (soal hanya-baca, ekspor mati), bukan membuka fitur dosen,
 *      sehingga identitas {role:'dosen'} bernama lain tetap tidak bisa menjawab.
 *   8. MASTER — fetchMasterStudents dulu memanggil updateLeaderboard kedua kali
 *      dengan `_scheduleExpired` yang tidak pernah didefinisikan (selalu false),
 *      menimpa statistik yang baru dihitung benar oleh renderVisitors:
 *      "Jumlah Absen" dosen tidak menghitung mahasiswa Bolos sampai event RTDB
 *      berikutnya atau interval 30 detik. Panggilan itu dibuang; renderVisitors
 *      (baris di atasnya) sudah memanggil updateLeaderboard dengan schedExpired
 *      dari jadwal saat ini.
 *   9. Placeholder — ajakannya mengikuti konteks: tamu "Masuk sebagai
 *      mahasiswa…", Mode Preview (tidak punya formulir login) "Keluar dari Mode
 *      Preview (tombol Keluar Preview di banner atas), lalu masuk sebagai
 *      mahasiswa…".
 *
 * TAMBAHAN v3 (26 September 2026, temuan tinjauan): dua jalur lain yang
 * MEMBUKA fitur dosen masih memakai `role === 'dosen'` saja.
 *  10. GERBANG-SOAL — _updateUTSAccessGate/_updateUASAccessGate: `isDosen`
 *      menampilkan wadah soal dan menyembunyikan banner kunci. Kini dari
 *      _dosenUjianTerverifikasi; identitas {role:'dosen'} bernama lain
 *      mengikuti cabang non-mahasiswa, seperti tamu (tampilannya sama — wadah
 *      soalnya memang kosong).
 *  11. MUAT-SOAL — _ensureUTSQuestionsLoaded/_ensureUASQuestionsLoaded:
 *      `isDosenNow` mengirim permintaan soal mode dosen (tanpa NIM/PIN; server
 *      menagih klaim admin). Kini dari _dosenUjianTerverifikasi; identitas lain
 *      menunggu sesi PIN mahasiswa seperti biasa.
 *   Pemeriksaan role yang tersisa tidak membuka apa pun: penjaga yang
 *   membatasi (_previewGuard/_previewExportGuard), penentu mahasiswa
 *   (`role !== 'dosen'`), pengalih saveIdentity/init yang hanya memanggil
 *   _activateDosenQuestionView (bergerbang SOAL-DOSEN), dan penjaga N=0
 *   renderer soal (hanya menggambar soal yang sudah dimuat MUAT-SOAL).
 *
 * Mahasiswa tidak berubah: kartu "Nilai Anda", Asisten Dosen, dan daftar
 * online tersembunyi persis seperti sebelumnya. Tampilan dosen juga sama.
 * RTDB visitors/presence tetap terbaca publik; ini penjaga UI, bukan batas
 * keamanan (Pedoman §7.8).
 *
 * Jangkar penyuntik lain tidak disentuh: kecualikan-akun-simulasi.mjs
 * (`function updateLeaderboard(visitors, schedExpired){` tetap utuh, baris
 * `const mhs=...`, baris pertama renderVisitors, `tableEl.innerHTML=
 * masterStudents...`), buka-asisten-ujian.mjs (keempat bloknya), dan teks wajib
 * validate-public-security.mjs ('<h3>👥 Mahasiswa Online</h3>',
 * "onlineVisited.length+' online'", 'Belum ada mahasiswa online.', dst.).
 * Bagian yang tidak boleh berisi "\n}\n" (validator memakainya sebagai akhir
 * renderVisitors) memang berindentasi.
 *
 * UTS/UAS Pemodelan CAD dibangkitkan dari UTS/UAS Teknik Tenaga Listrik oleh
 * scripts/cad-exam/bangun.py; sisipan di sini tidak memuat string yang dijaga
 * generator itu, sehingga hasil bangun ulang identik dengan hasil skrip ini.
 *
 * CAKUPAN: <Kursus>/Exam/UTS.html dan UAS.html (12 halaman). Halaman modul
 * sengaja tidak disentuh (papan peringkat modul memang untuk mahasiswa), begitu
 * pula salinan konflik OneDrive (*-DEDIK-PC.html).
 *
 * Idempoten: kesebelas sisipan (JS, PERAN, PREVIEW, RENDER, LEADERBOARD,
 * AUTOLOGIN, PEMILIH, SOAL-DOSEN, MASTER, GERBANG-SOAL, MUAT-SOAL) dibatasi
 * penanda PRIVASI-HASIL-UJIAN dan ditimpa di tempat bila sudah ada; baris
 * isDosen _applyRoleVisibility diganti sekali. Jalan kedua melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/privasi-hasil-ujian.mjs            # terapkan
 *   node scripts/privasi-hasil-ujian.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

// ── 1. Fungsi bantu (sesudah blok ASISTEN-UJIAN-MAHASISWA:JS) ────────────────
const RX_JANGKAR_JS = /\/\/ ═══ ASISTEN-UJIAN-MAHASISWA:JS END[^\n]*\n/;
const RX_JS = /\/\/ ═══ PRIVASI-HASIL-UJIAN:JS BEGIN[^\n]*\n[\s\S]*?\/\/ ═══ PRIVASI-HASIL-UJIAN:JS END[^\n]*\n/;
const BLOK_JS = `// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN v3 — dipasang scripts/privasi-hasil-ujian.mjs ═══
// Data kelas halaman UTS/UAS — tabel tab Hasil (nama, NIM, status
// Terlambat/Bolos/Tepat Waktu, poin, kunjungan, waktu akses), papan Top Skor/
// Top Akses, statistik kelas, dan daftar mahasiswa online — hanya dirender
// untuk dosen terverifikasi. Tamu di layar login dan Mode Preview mendapat
// placeholder netral; mahasiswa tetap hanya melihat kartu nilainya sendiri.
// Dulu "bukan mahasiswa" diperlakukan sebagai dosen, sehingga mahasiswa yang
// sedang ujian bisa membuka tab kedua dalam Mode Preview dan melihat status
// serta nilai seluruh kelas. RTDB visitors/presence tetap terbaca publik: ini
// penjaga UI, bukan batas keamanan (Pedoman §7.8).
function _dosenUjianTerverifikasi(me) {
  // SATU-SATUNYA aturan "dosen" halaman ujian untuk semua yang MEMBUKA fitur
  // dosen: _applyRoleVisibility (tombol Reset, banner jadwal, #visitorFab),
  // auto-login jadwal (_handleScheduleReady), tinjauan soal dosen
  // (_activateDosenQuestionView), gerbang wadah soal (_update…AccessGate),
  // permintaan soal mode dosen (_ensure…QuestionsLoaded), dan gerbang data
  // kelas di bawah, jadi semuanya tidak bisa menyimpang. Pemeriksaan role yang
  // tersisa tidak membuka apa pun: penjaga yang MEMBATASI (_previewGuard,
  // _previewExportGuard: soal hanya-baca, ekspor mati), penentu mahasiswa, dan
  // pengalih ke _activateDosenQuestionView.
  return !!(me && me.role === 'dosen' && typeof me.nama === 'string' && me.nama.toLowerCase() === 'dedik romahadi');
}
function _identitasUjianDikenal(me) {
  // Identitas tersimpan yang dipulihkan otomatis: dosen terverifikasi, atau
  // mahasiswa ber-NIM (aturan isStudent yang sama dengan _applyRoleVisibility
  // dan renderVisitors). Selain itu — sisa format lama {nama:'Dedik Romahadi'}
  // tanpa role, {role:'dosen'} bernama lain — diperlakukan seperti tamu.
  return _dosenUjianTerverifikasi(me) || !!(me && me.nim && me.role !== 'dosen');
}
function _dataKelasUjianBoleh() {
  // Mode Preview tidak pernah melihat data kelas, apa pun identitas yang
  // kebetulan tersimpan di localStorage.
  if (window._previewMode) return false;
  const me = (typeof getIdentity === 'function') ? getIdentity() : null;
  return _dosenUjianTerverifikasi(me);
}
function _judulTabelHasilUjian(tableEl) {
  // Baris judul kolom (No/Nama/NIM/Status/...) tepat di atas #visitorTableBody;
  // dikenali dengan cara yang sama seperti cabang mahasiswa renderVisitors.
  const judul = tableEl ? tableEl.previousElementSibling : null;
  return (judul && judul.style && judul.textContent.toUpperCase().includes('STATUS')) ? judul : null;
}
function _kosongkanPapanKelasUjian() {
  // Papan Top Skor/Top Akses dan statistik kelas: isinya dibuang dari DOM.
  for (const id of ['rajinList', 'santaiList']) {
    const el = document.getElementById(id);
    if (el && el.innerHTML) el.innerHTML = '';
  }
  for (const id of ['statTotalMhs', 'statHadir', 'statAbsen', 'statLate']) {
    const el = document.getElementById(id);
    if (el && el.textContent !== '—') el.textContent = '—';
  }
}
function _tampilkanHasilTanpaDataKelas() {
  // Tamu / Mode Preview: tidak ada data mahasiswa lain di mana pun di DOM.
  _kosongkanRosterUjian();          // daftar online, badge, jumlah (buka-asisten-ujian.mjs)
  _kosongkanPapanKelasUjian();
  const lb = document.getElementById('leaderboardPanel');
  if (lb && lb.style.display !== 'none') lb.style.display = 'none';
  const tableEl = document.getElementById('visitorTableBody');
  const judul = _judulTabelHasilUjian(tableEl);
  if (judul && judul.style.display !== 'none') judul.style.display = 'none';
  if (!tableEl) return;
  // Ajakan mengikuti konteks: Mode Preview tidak punya formulir login — jalan
  // keluarnya tombol "Keluar Preview" di banner atas (memuat ulang halaman).
  const ajakan = window._previewMode ? 'preview' : 'tamu';
  const kartu = tableEl.firstElementChild;
  const sudah = tableEl.childElementCount === 1 && kartu.getAttribute('data-privasi-hasil') === 'tanpa-data-kelas' && kartu.getAttribute('data-ajakan') === ajakan;
  if (!sudah) {
    tableEl.innerHTML = '<div data-privasi-hasil="tanpa-data-kelas" data-ajakan="' + ajakan + '" style="padding:48px 28px;text-align:center;color:#94a3b8">'
      + '<div style="font-size:48px;margin-bottom:16px">🔐</div>'
      + '<h3 style="color:#fff;font-size:1.2rem;margin-bottom:8px">Data Kelas Khusus Dosen</h3>'
      + '<p style="font-size:.85rem;line-height:1.6">Data kelas hanya tersedia untuk dosen. '
      + (ajakan === 'preview'
        ? 'Keluar dari Mode Preview (tombol <strong>Keluar Preview</strong> di banner atas), lalu masuk sebagai mahasiswa untuk melihat nilai Anda sendiri.'
        : 'Masuk sebagai mahasiswa untuk melihat nilai Anda sendiri.')
      + '</p></div>';
  }
}
function _pulihkanTataHasilDosen() {
  // Jalur dosen: papan peringkat dan judul tabel yang sempat disembunyikan untuk
  // tamu/Preview (atau oleh cabang mahasiswa sebelum logout paksa) tampil lagi.
  // Judul tabel ber-inline display:flex di markup ke-12 halaman.
  const lb = document.getElementById('leaderboardPanel');
  if (lb && lb.style.display === 'none') lb.style.display = '';
  const judul = _judulTabelHasilUjian(document.getElementById('visitorTableBody'));
  if (judul && judul.style.display === 'none') judul.style.display = 'flex';
}
function _segarkanHasilUjian() {
  // Render ulang tab Hasil dan daftar online dari data terakhir begitu peran
  // berubah (login dosen dari layar tamu, logout paksa), tanpa menunggu event
  // RTDB berikutnya atau interval 30 detik.
  let data;
  try { data = latestVisitors; } catch (e) { return; }   // skrip belum selesai dievaluasi; render pertama datang dari listener RTDB
  try {
    renderVisitors(Array.isArray(data) ? data : []);
  } catch (e) { console.warn('[Privasi hasil ujian] render ulang gagal:', e); }
}
// ═══ PRIVASI-HASIL-UJIAN:JS END v3 ═══
`;

// ── 2. _applyRoleVisibility: aturan dosen tunggal + render ulang ─────────────
const DOSEN_LAMA = "  const isDosen = !!(me && me.role === 'dosen' && me.nama && me.nama.toLowerCase() === 'dedik romahadi');\n";
const DOSEN_BARU = "  const isDosen = _dosenUjianTerverifikasi(me);   // PRIVASI-HASIL-UJIAN: aturan dosen tunggal, sama dengan gerbang data kelas\n";
const RX_JANGKAR_PERAN = /(  \/\/ ASISTEN-UJIAN-MAHASISWA:PERAN END[^\n]*\n)(\}\nwindow\._applyRoleVisibility = _applyRoleVisibility;\n)/;
const RX_PERAN = /  \/\/ PRIVASI-HASIL-UJIAN:PERAN BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:PERAN END[^\n]*\n/;
const BLOK_PERAN = `  // PRIVASI-HASIL-UJIAN:PERAN BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // Peran baru langsung berlaku di tab Hasil dan daftar online: dosen yang baru
  // login dari layar tamu/Preview langsung melihat data kelas, sedangkan logout
  // paksa (jadwal dihapus) langsung membuangnya dari DOM.
  _segarkanHasilUjian();
  // PRIVASI-HASIL-UJIAN:PERAN END v1
`;

// ── 2c. enterPreviewMode: render ulang begitu Preview aktif ──────────────────
// Identitas dosen yang tersimpan sudah merender data kelas lengkap; tanpa ini
// tabel, papan, statistik, dan daftar online itu tetap TERLIHAT dalam Mode
// Preview sampai render berikutnya (event jadwal/RTDB atau interval 30 detik).
const JANGKAR_PREVIEW = "window.enterPreviewMode = async function() {\n  await signOut(_auth).catch(() => {});\n  window._previewMode = true;\n";
const RX_PREVIEW = /  \/\/ PRIVASI-HASIL-UJIAN:PREVIEW BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:PREVIEW END[^\n]*\n/;
const BLOK_PREVIEW = `  // PRIVASI-HASIL-UJIAN:PREVIEW BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // Mode Preview berlaku seketika di tab Hasil dan daftar online: data kelas
  // yang sudah dirender untuk identitas dosen tersimpan dibuang dari DOM
  // sekarang, bukan pada event RTDB berikutnya atau interval 30 detik.
  _segarkanHasilUjian();
  // PRIVASI-HASIL-UJIAN:PREVIEW END v1
`;

// ── 3. renderVisitors: gerbang sesudah cabang mahasiswa ──────────────────────
const JANGKAR_RENDER = "    // Skip rest of dosen-only rendering\n    return;\n  }\n";
const RX_RENDER = /  \/\/ PRIVASI-HASIL-UJIAN:RENDER BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:RENDER END[^\n]*\n/;
const BLOK_RENDER = `  // PRIVASI-HASIL-UJIAN:RENDER BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // Bukan mahasiswa BUKAN berarti dosen. Tamu di layar login dan Mode Preview
  // berhenti di sini dengan placeholder netral; tabel kelas, papan peringkat,
  // statistik, dan daftar online di bawah hanya untuk dosen terverifikasi
  // (_dosenUjianTerverifikasi, aturan yang sama dengan _applyRoleVisibility).
  if (!_dataKelasUjianBoleh()) {
    _tampilkanHasilTanpaDataKelas();
    return;
  }
  _pulihkanTataHasilDosen();
  // PRIVASI-HASIL-UJIAN:RENDER END v1
`;

// ── 4. updateLeaderboard: gerbang di baris pertama ───────────────────────────
const JANGKAR_LB = "function updateLeaderboard(visitors, schedExpired){\n";
const RX_LB = /  \/\/ PRIVASI-HASIL-UJIAN:LEADERBOARD BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:LEADERBOARD END[^\n]*\n/;
const BLOK_LB = `  // PRIVASI-HASIL-UJIAN:LEADERBOARD BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // fetchMasterStudents memanggil fungsi ini untuk SIAPA PUN; papan Top Skor/
  // Top Akses dan statistik kelas hanya diisi untuk dosen terverifikasi.
  if (!_dataKelasUjianBoleh()) { _kosongkanPapanKelasUjian(); return; }
  // PRIVASI-HASIL-UJIAN:LEADERBOARD END v1
`;

// ── 5. _handleScheduleReady: auto-login memakai aturan dosen tunggal ─────────
// Blok auto-login adalah ekor fungsi (dicek di bawah), jadi `return` di sini
// hanya melewatkan pemulihan sesi — tidak ada langkah lain yang terlompati.
const AUTOLOGIN_LAMA = "      const _isDosen = me.nama.toLowerCase() === 'dedik romahadi';\n";
const RX_AUTOLOGIN = /      \/\/ PRIVASI-HASIL-UJIAN:AUTOLOGIN BEGIN[^\n]*\n[\s\S]*?      \/\/ PRIVASI-HASIL-UJIAN:AUTOLOGIN END[^\n]*\n/;
const BLOK_AUTOLOGIN = `      // PRIVASI-HASIL-UJIAN:AUTOLOGIN BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
      // Aturan dosen tunggal halaman (_dosenUjianTerverifikasi: role 'dosen' DAN
      // nama dosen pengampu), bukan lagi nama saja. Identitas yang bukan dosen
      // terverifikasi dan bukan mahasiswa ber-NIM (sisa format lama tanpa role,
      // {role:'dosen'} bernama lain) tidak dipulihkan: layar login tetap tampil,
      // tanpa #visitorFab dan tanpa melewati gerbang jam mulai.
      const _isDosen = _dosenUjianTerverifikasi(me);
      if (!_identitasUjianDikenal(me)) return;
      // PRIVASI-HASIL-UJIAN:AUTOLOGIN END v1
`;
const EKOR_AUTOLOGIN = "      }, 800);\n    }\n  }\n}\n";

// ── 6. Pemilih peran: hanya dilewati untuk identitas yang dipulihkan ─────────
const JANGKAR_PEMILIH = "// Auto-hide picker untuk returning user\ndocument.addEventListener('DOMContentLoaded', () => {\n  setTimeout(() => {\n    if (typeof getIdentity === 'function') {\n      const _me = getIdentity();\n";
const SESUDAH_PEMILIH = "      if (_me && _me.nama && _me.role !== 'guest') {\n        const rc = document.getElementById('roleChooserOverlay');\n        if (rc) rc.classList.add('hidden');\n      }\n    }\n  }, 100);\n});\n";
const RX_PEMILIH = /      \/\/ PRIVASI-HASIL-UJIAN:PEMILIH BEGIN[^\n]*\n[\s\S]*?      \/\/ PRIVASI-HASIL-UJIAN:PEMILIH END[^\n]*\n/;
const BLOK_PEMILIH = `      // PRIVASI-HASIL-UJIAN:PEMILIH BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
      // Pemilih peran hanya dilewati untuk identitas yang dipulihkan auto-login
      // (_identitasUjianDikenal). Identitas lain melihatnya seperti tamu, jadi
      // dosen dengan identitas format lama bisa langsung memilih "Dosen".
      if (!_identitasUjianDikenal(_me)) return;
      // PRIVASI-HASIL-UJIAN:PEMILIH END v1
`;

// ── 7. _activateDosenQuestionView: tinjauan soal hanya untuk dosen terverifikasi
const SOAL_AWAL = "async function _activateDosenQuestionView() {\n  const me = getIdentity();\n";
const SOAL_LAMA = "  if (!me || me.role !== 'dosen') return;\n";
const RX_SOAL = /  \/\/ PRIVASI-HASIL-UJIAN:SOAL-DOSEN BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:SOAL-DOSEN END[^\n]*\n/;
const BLOK_SOAL = `  // PRIVASI-HASIL-UJIAN:SOAL-DOSEN BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // Tinjauan soal dosen memakai aturan dosen tunggal halaman. Identitas
  // {role:'dosen'} bernama lain tidak mengaktifkan mode ini; penjaga jawaban
  // (_previewGuard/_previewExportGuard) tetap berbasis role, jadi identitas
  // seperti itu tetap hanya-baca.
  if (!_dosenUjianTerverifikasi(me)) return;
  // PRIVASI-HASIL-UJIAN:SOAL-DOSEN END v1
`;

// ── 8. fetchMasterStudents: buang panggilan updateLeaderboard ber-_scheduleExpired
const MASTER_AWAL = "      if (typeof renderVisitors === 'function' && typeof latestVisitors !== 'undefined') {\n        renderVisitors(latestVisitors || []);\n      }\n";
const MASTER_LAMA = "      if (typeof updateLeaderboard === 'function' && typeof latestVisitors !== 'undefined') {\n        updateLeaderboard(latestVisitors || [], typeof _scheduleExpired !== 'undefined' ? _scheduleExpired : false);\n      }\n";
const MASTER_AKHIR = "    } catch(e) { console.warn('[Visitor] Re-render after master load failed:', e); }\n";
const RX_MASTER = /      \/\/ PRIVASI-HASIL-UJIAN:MASTER BEGIN[^\n]*\n[\s\S]*?      \/\/ PRIVASI-HASIL-UJIAN:MASTER END[^\n]*\n/;
const BLOK_MASTER = `      // PRIVASI-HASIL-UJIAN:MASTER BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
      // renderVisitors di atas sudah memanggil updateLeaderboard dengan
      // schedExpired dari jadwal saat ini (jalur dosen). Panggilan kedua di sini
      // dulu membaca variabel jadwal-berakhir yang tidak pernah didefinisikan
      // (selalu false), sehingga "Jumlah Absen" dosen tertimpa tanpa mahasiswa
      // Bolos sampai render berikutnya. Panggilan itu sengaja dibuang.
      // PRIVASI-HASIL-UJIAN:MASTER END v1
`;

// ── 10. _update…AccessGate: wadah soal dan banner kunci ─────────────────────
// Jangkar: awal fungsi sampai baris isStudent; baris isDosen role-saja diganti blok.
const RX_GERBANG_AWAL = /function _update(?:UTS|UAS)AccessGate\(\) \{\n  try \{\n    const state = _(?:uts|uas)ScheduleState\(\);\n    const me = \(typeof getIdentity === 'function'\) \? getIdentity\(\) : null;\n    const isStudent = me && me\.nim && me\.role !== 'dosen';\n/;
const GERBANG_LAMA = "    const isDosen = me && me.role === 'dosen';\n";
const RX_GERBANG = /    \/\/ PRIVASI-HASIL-UJIAN:GERBANG-SOAL BEGIN[^\n]*\n[\s\S]*?    \/\/ PRIVASI-HASIL-UJIAN:GERBANG-SOAL END[^\n]*\n/;
const BLOK_GERBANG = `    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
    // Wadah soal selalu tampil dan banner kunci disembunyikan hanya untuk dosen
    // terverifikasi (aturan dosen tunggal). Identitas {role:'dosen'} bernama
    // lain mengikuti cabang non-mahasiswa di bawah, seperti tamu.
    const isDosen = _dosenUjianTerverifikasi(me);
    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL END v1
`;

// ── 11. _ensure…QuestionsLoaded: permintaan soal mode dosen ──────────────────
const RX_MUAT_AWAL = /async function _ensure(?:UTS|UAS)QuestionsLoaded\(\) \{\n  if \([^\n]*\) return;\n  const me = getIdentity\(\);\n  if \(!me\) return;\n/;
const MUAT_LAMA = "  const isDosenNow = me.role === 'dosen';\n";
const MUAT_SESUDAH = "  if (!isDosenNow && (!me.nim || !window._sessionPinHash)) return;";
const RX_MUAT = /  \/\/ PRIVASI-HASIL-UJIAN:MUAT-SOAL BEGIN[^\n]*\n[\s\S]*?  \/\/ PRIVASI-HASIL-UJIAN:MUAT-SOAL END[^\n]*\n/;
const BLOK_MUAT = `  // PRIVASI-HASIL-UJIAN:MUAT-SOAL BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs
  // Permintaan soal mode dosen (tanpa NIM/PIN; server menagih klaim admin)
  // hanya untuk dosen terverifikasi. Identitas lain menunggu sesi PIN
  // mahasiswa seperti biasa.
  const isDosenNow = _dosenUjianTerverifikasi(me);
  // PRIVASI-HASIL-UJIAN:MUAT-SOAL END v1
`;
const escRx = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

/** Ganti blok bertanda di tempat, atau sisipkan lewat fungsi `sisip` bila belum ada. */
function pasang(html, rx, blok, label, catatan, sisip) {
  const ada = hitungRx(html, rx);
  if (ada > 1) throw new Error(`blok ${label} muncul ${ada}x, harusnya 1`);
  if (ada === 1) {
    const baru = html.replace(rx, () => blok);
    if (baru !== html) catatan.push(`${label}-diperbarui`);
    return baru;
  }
  catatan.push(label);
  return sisip(html);
}

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];

  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
  if (!html.includes("function _kosongkanRosterUjian()")) {
    throw new Error("blok ASISTEN-UJIAN-MAHASISWA belum terpasang; jalankan dulu scripts/buka-asisten-ujian.mjs");
  }

  // 1. Fungsi bantu sesudah blok ASISTEN-UJIAN-MAHASISWA:JS.
  html = pasang(html, RX_JS, BLOK_JS, "js", catatan, (h) => {
    const n = hitungRx(h, RX_JANGKAR_JS);
    if (n !== 1) throw new Error(`penanda ASISTEN-UJIAN-MAHASISWA:JS END muncul ${n}x, harusnya 1`);
    return h.replace(RX_JANGKAR_JS, (m) => m + BLOK_JS);
  });

  // 2a. Aturan dosen tunggal di _applyRoleVisibility.
  if (html.includes(DOSEN_LAMA)) {
    if (hitung(html, DOSEN_LAMA) !== 1) throw new Error("baris isDosen _applyRoleVisibility muncul lebih dari sekali");
    html = html.replace(DOSEN_LAMA, () => DOSEN_BARU);
    catatan.push("isDosen");
  }
  if (hitung(html, DOSEN_BARU) !== 1) throw new Error("baris isDosen _applyRoleVisibility tidak ditemukan tepat sekali");

  // 2b. Render ulang di akhir _applyRoleVisibility.
  html = pasang(html, RX_PERAN, BLOK_PERAN, "peran", catatan, (h) => {
    const n = hitungRx(h, RX_JANGKAR_PERAN);
    if (n !== 1) throw new Error(`akhir _applyRoleVisibility (sesudah ASISTEN-UJIAN-MAHASISWA:PERAN END) muncul ${n}x, harusnya 1`);
    return h.replace(RX_JANGKAR_PERAN, (m, a, b) => a + BLOK_PERAN + b);
  });

  // 2c. Render ulang tepat sesudah Mode Preview dinyalakan.
  html = pasang(html, RX_PREVIEW, BLOK_PREVIEW, "preview", catatan, (h) => {
    const n = hitung(h, JANGKAR_PREVIEW);
    if (n !== 1) throw new Error(`awal enterPreviewMode (signOut lalu _previewMode = true) muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_PREVIEW, () => JANGKAR_PREVIEW + BLOK_PREVIEW);
  });

  // 3. renderVisitors: gerbang sesudah cabang mahasiswa.
  html = pasang(html, RX_RENDER, BLOK_RENDER, "render", catatan, (h) => {
    const n = hitung(h, JANGKAR_RENDER);
    if (n !== 1) throw new Error(`penutup cabang mahasiswa renderVisitors muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_RENDER, () => JANGKAR_RENDER + "\n" + BLOK_RENDER);
  });

  // 4. updateLeaderboard: gerbang di baris pertama.
  html = pasang(html, RX_LB, BLOK_LB, "leaderboard", catatan, (h) => {
    const n = hitung(h, JANGKAR_LB);
    if (n !== 1) throw new Error(`definisi updateLeaderboard muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_LB, () => JANGKAR_LB + BLOK_LB);
  });

  // 5. Auto-login jadwal: aturan dosen tunggal + identitas tak dikenal tidak dipulihkan.
  html = pasang(html, RX_AUTOLOGIN, BLOK_AUTOLOGIN, "autologin", catatan, (h) => {
    const n = hitung(h, AUTOLOGIN_LAMA);
    if (n !== 1) throw new Error(`aturan dosen nama-saja di auto-login _handleScheduleReady muncul ${n}x, harusnya 1`);
    return h.replace(AUTOLOGIN_LAMA, () => BLOK_AUTOLOGIN);
  });

  // 6. Pemilih peran untuk pengunjung kembali.
  html = pasang(html, RX_PEMILIH, BLOK_PEMILIH, "pemilih", catatan, (h) => {
    const n = hitung(h, JANGKAR_PEMILIH + SESUDAH_PEMILIH);
    if (n !== 1) throw new Error(`penyembunyi pemilih peran (DOMContentLoaded) muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_PEMILIH, () => JANGKAR_PEMILIH + BLOK_PEMILIH);
  });

  // 7. Tinjauan soal dosen.
  html = pasang(html, RX_SOAL, BLOK_SOAL, "soal-dosen", catatan, (h) => {
    const n = hitung(h, SOAL_AWAL + SOAL_LAMA);
    if (n !== 1) throw new Error(`awal _activateDosenQuestionView (role 'dosen' saja) muncul ${n}x, harusnya 1`);
    return h.replace(SOAL_AWAL + SOAL_LAMA, () => SOAL_AWAL + BLOK_SOAL);
  });

  // 8. fetchMasterStudents: panggilan updateLeaderboard ber-_scheduleExpired dibuang.
  html = pasang(html, RX_MASTER, BLOK_MASTER, "master", catatan, (h) => {
    const n = hitung(h, MASTER_AWAL + MASTER_LAMA + MASTER_AKHIR);
    if (n !== 1) throw new Error(`render ulang sesudah roster dimuat (fetchMasterStudents) muncul ${n}x, harusnya 1`);
    return h.replace(MASTER_AWAL + MASTER_LAMA + MASTER_AKHIR, () => MASTER_AWAL + BLOK_MASTER + MASTER_AKHIR);
  });

  // 10. Gerbang wadah soal (_update…AccessGate).
  html = pasang(html, RX_GERBANG, BLOK_GERBANG, "gerbang-soal", catatan, (h) => {
    const m = h.match(new RegExp(RX_GERBANG_AWAL.source + escRx(GERBANG_LAMA), "g")) || [];
    if (m.length !== 1) throw new Error(`awal _update…AccessGate dengan isDosen role-saja muncul ${m.length}x, harusnya 1`);
    return h.replace(m[0], () => m[0].slice(0, -GERBANG_LAMA.length) + BLOK_GERBANG);
  });

  // 11. Permintaan soal mode dosen (_ensure…QuestionsLoaded).
  html = pasang(html, RX_MUAT, BLOK_MUAT, "muat-soal", catatan, (h) => {
    const m = h.match(new RegExp(RX_MUAT_AWAL.source + escRx(MUAT_LAMA), "g")) || [];
    if (m.length !== 1) throw new Error(`awal _ensure…QuestionsLoaded dengan isDosenNow role-saja muncul ${m.length}x, harusnya 1`);
    return h.replace(m[0], () => m[0].slice(0, -MUAT_LAMA.length) + BLOK_MUAT);
  });

  // Penjaga hasil: tiap blok tepat sekali dan di tempatnya.
  for (const [rx, label] of [[RX_JS, "js"], [RX_PERAN, "peran"], [RX_PREVIEW, "preview"], [RX_RENDER, "render"], [RX_LB, "leaderboard"],
    [RX_AUTOLOGIN, "autologin"], [RX_PEMILIH, "pemilih"], [RX_SOAL, "soal-dosen"], [RX_MASTER, "master"],
    [RX_GERBANG, "gerbang-soal"], [RX_MUAT, "muat-soal"]]) {
    if (hitungRx(html, rx) !== 1) throw new Error(`blok ${label} harus tepat 1x`);
  }
  if (html.includes(AUTOLOGIN_LAMA) || /toLowerCase\(\) === 'dedik romahadi'/.test(html.replace(/function _dosenUjianTerverifikasi\(me\) \{[\s\S]*?\n\}\n/, ""))) {
    throw new Error("aturan dosen nama-saja masih tertinggal di luar _dosenUjianTerverifikasi");
  }
  {
    const i = html.indexOf("function _handleScheduleReady");
    const j = i < 0 ? -1 : html.indexOf("\n}\n", i);
    const fn = j < 0 ? "" : html.slice(i, j + 3);
    const b = fn.indexOf("      // PRIVASI-HASIL-UJIAN:AUTOLOGIN BEGIN");
    // Blok auto-login (tempat `return` baru) harus di dalam cabang auto-login
    // yang menjadi ekor fungsi: tidak ada langkah sesudahnya yang terlompati.
    if (b < 0 || !fn.endsWith(EKOR_AUTOLOGIN) || fn.lastIndexOf("\n  if (overlay && !overlay.classList.contains('hidden')) {\n") > b) {
      throw new Error("blok AUTOLOGIN tidak di cabang auto-login yang menjadi ekor _handleScheduleReady");
    }
  }
  if (hitung(html, JANGKAR_PEMILIH + BLOK_PEMILIH + SESUDAH_PEMILIH) !== 1) throw new Error("blok PEMILIH tidak tepat sebelum penyembunyi pemilih peran");
  if (hitung(html, SOAL_AWAL + BLOK_SOAL) !== 1 || html.includes(SOAL_AWAL + SOAL_LAMA)) throw new Error("blok SOAL-DOSEN tidak di baris pertama _activateDosenQuestionView");
  if (hitung(html, MASTER_AWAL + BLOK_MASTER + MASTER_AKHIR) !== 1 || html.includes("_scheduleExpired")) {
    throw new Error("panggilan updateLeaderboard ber-_scheduleExpired masih tertinggal di fetchMasterStudents");
  }
  if (html.indexOf(JANGKAR_PREVIEW) + JANGKAR_PREVIEW.length !== html.indexOf("  // PRIVASI-HASIL-UJIAN:PREVIEW BEGIN")) {
    throw new Error("render ulang Mode Preview tidak tepat sesudah window._previewMode = true di enterPreviewMode");
  }
  if (html.includes(DOSEN_LAMA)) throw new Error("aturan dosen lama tertinggal di _applyRoleVisibility");
  if (html.includes(GERBANG_LAMA) || html.includes(MUAT_LAMA)) throw new Error("isDosen/isDosenNow role-saja tertinggal di gerbang wadah soal atau pemuat soal");
  {
    const g = html.match(RX_GERBANG_AWAL);
    if (!g || g.index + g[0].length !== html.indexOf("    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL BEGIN")) {
      throw new Error("blok GERBANG-SOAL tidak tepat sesudah baris isStudent _update…AccessGate");
    }
    const m = html.match(RX_MUAT_AWAL);
    const b = m ? m.index + m[0].length : -1;
    if (b !== html.indexOf("  // PRIVASI-HASIL-UJIAN:MUAT-SOAL BEGIN") || !html.startsWith(BLOK_MUAT + MUAT_SESUDAH, b)) {
      throw new Error("blok MUAT-SOAL tidak tepat menggantikan isDosenNow di awal _ensure…QuestionsLoaded");
    }
  }
  const rv = html.indexOf("function renderVisitors(visitors){");
  const gerbang = html.indexOf("  // PRIVASI-HASIL-UJIAN:RENDER BEGIN");
  const dosen = html.indexOf("  document.getElementById('fabCount').textContent=onlineVisited.length;\n");
  if (rv < 0 || !(rv < gerbang && gerbang < dosen) || html.indexOf(JANGKAR_RENDER, rv) + JANGKAR_RENDER.length + 1 !== gerbang) {
    throw new Error("gerbang data kelas tidak tepat sesudah cabang mahasiswa renderVisitors");
  }
  if (html.indexOf(JANGKAR_LB) + JANGKAR_LB.length !== html.indexOf("  // PRIVASI-HASIL-UJIAN:LEADERBOARD BEGIN")) {
    throw new Error("gerbang papan peringkat tidak di baris pertama updateLeaderboard");
  }

  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const nama of ["UTS.html", "UAS.html"]) {
    const p = path.join(root, kursus.name, "Exam", nama);
    if (fs.existsSync(p)) berkas.push(p);
  }
}
if (!berkas.length) throw new Error("tidak ada halaman <Kursus>/Exam/UTS.html|UAS.html");

let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  let h;
  try { h = proses(f); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} dari ${berkas.length} halaman ujian ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
