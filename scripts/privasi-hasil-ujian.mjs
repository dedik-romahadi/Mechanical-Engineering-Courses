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
 *   3. renderVisitors — tepat sesudah cabang mahasiswa (yang tetap sama):
 *      selain dosen terverifikasi berhenti dengan placeholder. Daftar online
 *      tamu kini tidak pernah diisi di sumbernya; pembersih defensif
 *      buka-asisten-ujian.mjs tetap dipertahankan.
 *   4. updateLeaderboard — baris pertama: selain dosen terverifikasi papan dan
 *      statistik dikosongkan lalu return.
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
 * Idempoten: keempat sisipan dibatasi penanda PRIVASI-HASIL-UJIAN dan ditimpa
 * di tempat bila sudah ada; baris isDosen diganti sekali. Jalan kedua
 * melaporkan 0 halaman.
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
const BLOK_JS = `// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN v1 — dipasang scripts/privasi-hasil-ujian.mjs ═══
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
  // SATU-SATUNYA aturan "dosen" halaman ujian. Dipakai _applyRoleVisibility
  // (tombol Reset, banner jadwal, #visitorFab) dan gerbang data kelas di bawah,
  // jadi keduanya tidak bisa menyimpang.
  return !!(me && me.role === 'dosen' && typeof me.nama === 'string' && me.nama.toLowerCase() === 'dedik romahadi');
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
  const sudah = tableEl.childElementCount === 1 && tableEl.firstElementChild.getAttribute('data-privasi-hasil') === 'tanpa-data-kelas';
  if (!sudah) {
    tableEl.innerHTML = '<div data-privasi-hasil="tanpa-data-kelas" style="padding:48px 28px;text-align:center;color:#94a3b8">'
      + '<div style="font-size:48px;margin-bottom:16px">🔐</div>'
      + '<h3 style="color:#fff;font-size:1.2rem;margin-bottom:8px">Data Kelas Khusus Dosen</h3>'
      + '<p style="font-size:.85rem;line-height:1.6">Data kelas hanya tersedia untuk dosen. Masuk sebagai mahasiswa untuk melihat nilai Anda sendiri.</p>'
      + '</div>';
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
// ═══ PRIVASI-HASIL-UJIAN:JS END v1 ═══
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

  // Penjaga hasil: tiap blok tepat sekali dan di tempatnya.
  for (const [rx, label] of [[RX_JS, "js"], [RX_PERAN, "peran"], [RX_RENDER, "render"], [RX_LB, "leaderboard"]]) {
    if (hitungRx(html, rx) !== 1) throw new Error(`blok ${label} harus tepat 1x`);
  }
  if (html.includes(DOSEN_LAMA)) throw new Error("aturan dosen lama tertinggal di _applyRoleVisibility");
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
