/**
 * Membuka Asisten Dosen untuk mahasiswa di 12 halaman UTS/UAS, sementara
 * daftar mahasiswa online tetap khusus dosen.
 *
 * MASALAHNYA. Blok AI (AI-CHAT-AGENT, dari repo backend) sudah memasang tab
 * "🤖 Asisten Dosen" di panel #visitorPanel halaman ujian sejak Agustus 2026,
 * tetapi satu-satunya pembuka panel itu, #visitorFab, disembunyikan dari
 * mahasiswa oleh aturan "UTS/UAS PRIVACY" di dua tempat: _applyRoleVisibility
 * (display:none + visibility:hidden) dan cabang mahasiswa renderVisitors (tiap
 * render RTDB dan tiap 30 detik). Aturan itu benar untuk tujuannya — panel
 * berisi roster mahasiswa online (nama, NIM, waktu akses, lencana
 * "Terlambat" yang membocorkan status poin) yang hanya untuk dosen — tetapi
 * ikut mengunci Asisten dari mahasiswa. Menampilkan tombolnya begitu saja
 * juga salah: render fase tamu (sebelum login) sudah mengisi #vpList dengan
 * nama/NIM mahasiswa lain, dan cabang mahasiswa tidak pernah mengosongkannya.
 *
 * YANG DILAKUKAN (di luar penanda AI-CHAT-AGENT; perilaku blok AI sendiri
 * diubah di backend frontend-integration/modul-ai-chat.js):
 *   1. CSS — blok <style> bertanda sebelum </head> pertama: kelas
 *      body.ujian-mahasiswa menyembunyikan tab pemilih mode, #vpModeKelas,
 *      #vpList, #vpBadge, dan #fabCount dengan !important (setMode('kelas')
 *      atau render apa pun tidak bisa memunculkannya lagi), dan menggeser
 *      #backToTop ke kiri tombol bisu karena tombol chat kini menutupinya.
 *   2. JS — fungsi _terapkanAsistenUjian(isStudent) dan _kosongkanRosterUjian()
 *      tepat sesudah `window._applyRoleVisibility = ...`: memasang/melepas kelas
 *      body, mengganti ikon/judul tombol menjadi "🤖 Asisten Dosen", mengganti
 *      judul panel (protokol data-judul-asli yang sama dengan blok AI),
 *      mengosongkan roster/badge/jumlah, lalu memanggil
 *      window.ModulAiAgent.terapkanPeran() bila ada.
 *   3. _applyRoleVisibility — cabang mahasiswa kini MENAMPILKAN #visitorFab
 *      (display flex + visibility visible) sebagai tombol Asisten; cabang dosen
 *      tidak berubah.
 *   4. renderVisitors — cabang mahasiswa tidak lagi menyembunyikan #visitorFab
 *      tetapi mengosongkan sisa roster fase tamu. Penyembunyian papan
 *      peringkat, kartu "Nilai Anda", dan `return` dini tetap persis sama, jadi
 *      #fabCount/#vpBadge/#vpList tetap hanya diisi di jalur dosen.
 *
 * Tidak pernah menambahkan .vp-chat / #vpChatList / sendChat ke halaman ujian:
 * RTDB chat/* menerima tulisan tanpa autentikasi, jadi hanya ketiadaan UI itu
 * yang mencegah chat antarmahasiswa selama ujian. Penguncian tutor materi
 * selama jendela UTS/UAS dan penolakan permintaan kunci jawaban tetap
 * ditegakkan backend (aiChat), bukan di sini.
 *
 * Jangkar penyuntik lain tidak disentuh: kecualikan-akun-simulasi.mjs (baris
 * pertama renderVisitors, updateLeaderboard, heartbeat), tambah-efek-jawaban.mjs
 * (RX_EXAM, blok EFEK-JAWABAN), ubah-friction.mjs (visibilitychange), dan
 * teks wajib validate-public-security.mjs ('<h3>👥 Mahasiswa Online</h3>',
 * "onlineVisited.length+' online'", dst.).
 *
 * UTS/UAS Pemodelan CAD dibangkitkan dari UTS/UAS Teknik Tenaga Listrik oleh
 * scripts/cad-exam/bangun.py; sisipan di sini tidak memuat string yang dijaga
 * generator itu, sehingga hasil bangun ulang identik dengan hasil skrip ini.
 *
 * CAKUPAN: <Kursus>/Exam/UTS.html dan UAS.html (12 halaman). Salinan konflik
 * OneDrive (*-DEDIK-PC.html) sengaja tidak disentuh.
 *
 * Idempoten: keempat sisipan dibatasi penanda ASISTEN-UJIAN-MAHASISWA dan
 * ditimpa di tempat bila sudah ada (isi terbaru tetap sampai, urutan tidak
 * bergeser); jalan kedua melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/buka-asisten-ujian.mjs            # terapkan
 *   node scripts/buka-asisten-ujian.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

// Sama dengan EXAM_STUDENT_TITLE di blok AI (modul-ai-chat.js). Judul lain
// membuat halaman dan blok AI saling membalik judul panel.
const JUDUL_ASISTEN = "🤖 Asisten Dosen";

// ── 1. CSS ───────────────────────────────────────────────────────────────────
const RX_CSS = /<!-- ASISTEN-UJIAN-MAHASISWA:CSS BEGIN[^>]*-->\n[\s\S]*?<!-- ASISTEN-UJIAN-MAHASISWA:CSS END[^>]*-->\n/;
const BLOK_CSS = `<!-- ASISTEN-UJIAN-MAHASISWA:CSS BEGIN v1 — dipasang scripts/buka-asisten-ujian.mjs -->
<style id="asistenUjianMahasiswaCss">
/* Halaman UTS/UAS, mahasiswa yang login (kelas dipasang _terapkanAsistenUjian):
   #visitorFab menjadi tombol "Asisten Dosen". Daftar mahasiswa online (nama,
   NIM, status terlambat) dan jumlahnya khusus dosen. !important: setMode('kelas')
   blok AI atau render halaman mana pun tidak bisa memunculkannya lagi. */
body.ujian-mahasiswa #visitorPanel .vp-mode-tabs,
body.ujian-mahasiswa #vpModeKelas,
body.ujian-mahasiswa #vpList,
body.ujian-mahasiswa #vpBadge,
body.ujian-mahasiswa #fabCount{display:none !important}
/* #backToTop (right:32px, 48px) tertutup tombol chat (right:24px, 56px) begitu
   tombol itu tampil untuk mahasiswa. Geser ke kiri tombol bisu
   (.ej-tombol-bisu right:92px, 40px): 92 + 40 + 12 jarak = 144px; bottom 32px
   sejajar tombol bisu. Di layar <=480px tombol chat pindah ke 18px/18px dan
   tombol bisu tidak punya aturan ponsel (tetap 92px), jadi posisi yang sama
   tetap bebas tumpang tindih tanpa aturan @media tersendiri. */
body.ujian-mahasiswa #backToTop{right:144px}
</style>
<!-- ASISTEN-UJIAN-MAHASISWA:CSS END v1 -->
`;

// ── 2. Fungsi bantu (sesudah ekspor _applyRoleVisibility) ────────────────────
const JANGKAR_JS = "window._applyRoleVisibility = _applyRoleVisibility;\n";
const RX_JS = /\/\/ ═══ ASISTEN-UJIAN-MAHASISWA:JS BEGIN[^\n]*\n[\s\S]*?\/\/ ═══ ASISTEN-UJIAN-MAHASISWA:JS END[^\n]*\n/;
const BLOK_JS = `// ═══ ASISTEN-UJIAN-MAHASISWA:JS BEGIN v1 — dipasang scripts/buka-asisten-ujian.mjs ═══
// Mahasiswa yang login membuka Asisten Dosen lewat #visitorFab (tetap
// satu-satunya tombol chat); daftar mahasiswa online beserta jumlahnya tetap
// khusus dosen. Dua lapis penjaga: kelas body.ujian-mahasiswa (CSS !important)
// dan isi roster yang dikosongkan. Blok AI (AI-CHAT-AGENT) memasang lapisnya
// sendiri (body.vp-ujian-mhs) dan membuka panel langsung di mode Asisten.
// Halaman ujian sengaja tanpa Chat Kelas (tidak ada chat antarmahasiswa selama
// ujian); jangan menyalin markup/komposer chat kelas halaman modul ke sini.
function _kosongkanRosterUjian() {
  // Render fase tamu (sebelum login) sempat mengisi nama/NIM mahasiswa lain;
  // dibuang dari DOM, bukan sekadar disembunyikan.
  const list = document.getElementById('vpList');
  if (list && list.innerHTML) list.innerHTML = '';
  for (const id of ['vpBadge', 'fabCount']) {
    const el = document.getElementById(id);
    if (el && el.textContent) el.textContent = '';
  }
}
function _terapkanAsistenUjian(isStudent) {
  const mhs = !!isStudent;
  if (document.body) document.body.classList.toggle('ujian-mahasiswa', mhs);
  const fab = document.getElementById('visitorFab');
  if (fab) {
    // Ikon = simpul teks pertama tombol. Span #fabCount tidak diganti karena
    // cabang dosen renderVisitors menulis ke sana.
    const ikon = Array.prototype.find.call(fab.childNodes, (n) => n.nodeType === 3 && n.nodeValue.trim());
    if (mhs) {
      if (!fab.hasAttribute('data-title-asli')) {
        fab.setAttribute('data-title-asli', fab.getAttribute('title') || '');
        if (ikon) fab.setAttribute('data-ikon-asli', ikon.nodeValue);
      }
      fab.setAttribute('title', 'Asisten Dosen');
      fab.setAttribute('aria-label', 'Asisten Dosen');
      if (ikon) ikon.nodeValue = '🤖';
    } else if (fab.hasAttribute('data-title-asli')) {
      fab.setAttribute('title', fab.getAttribute('data-title-asli'));
      fab.removeAttribute('aria-label');
      if (ikon && fab.hasAttribute('data-ikon-asli')) ikon.nodeValue = fab.getAttribute('data-ikon-asli');
      fab.removeAttribute('data-title-asli');
      fab.removeAttribute('data-ikon-asli');
    }
  }
  // Judul panel: '<h3>👥 Mahasiswa Online</h3>' tetap di markup (dosen);
  // mahasiswa melihat judul Asisten. Protokol data-judul-asli sama dengan blok
  // AI supaya kedua lapis tidak saling membalik judul.
  const judul = '${JUDUL_ASISTEN}';
  const h3 = document.querySelector('#visitorPanel .vp-header h3');
  if (h3) {
    const asli = h3.getAttribute('data-judul-asli');
    if (mhs) {
      if (asli === null && h3.textContent !== judul) h3.setAttribute('data-judul-asli', h3.textContent);
      if (h3.textContent !== judul) h3.textContent = judul;
    } else if (asli !== null && h3.textContent !== asli) {
      h3.textContent = asli;
    }
  }
  if (mhs) _kosongkanRosterUjian();
  // Blok AI: mahasiswa langsung ke mode Asisten, dosen/tamu dipulihkan. Aman
  // sebelum blok terpasang (mengembalikan false; init-nya menerapkan peran sendiri).
  try {
    const agen = window.ModulAiAgent;
    if (agen && typeof agen.terapkanPeran === 'function') agen.terapkanPeran();
  } catch (e) { console.warn('[Asisten ujian] terapkanPeran gagal:', e); }
}
// ═══ ASISTEN-UJIAN-MAHASISWA:JS END v1 ═══
`;

// ── 3. _applyRoleVisibility: tombol untuk mahasiswa ──────────────────────────
const RX_PERAN_LAMA = new RegExp(
  [
    "  // U[TA]S PRIVACY: Sembunyikan visitor FAB \\(panel \"Mahasiswa\"\\) untuk mahasiswa",
    "  // Hanya dosen yang dapat melihat panel daftar mahasiswa real-time\\.",
    "  const visitorFab = document\\.getElementById\\('visitorFab'\\);",
    "  if \\(visitorFab\\) \\{",
    "    if \\(isStudent\\) \\{",
    "      visitorFab\\.style\\.display = 'none';",
    "      visitorFab\\.style\\.visibility = 'hidden';",
    "    \\} else if \\(isDosen\\) \\{",
    "      visitorFab\\.style\\.visibility = 'visible';",
    "      // display di-set oleh login flow \\(flex\\), tidak override di sini",
    "    \\}",
    "  \\}",
    "",
  ].join("\n"),
);
const RX_PERAN = /  \/\/ ASISTEN-UJIAN-MAHASISWA:PERAN BEGIN[^\n]*\n[\s\S]*?  \/\/ ASISTEN-UJIAN-MAHASISWA:PERAN END[^\n]*\n/;
const blokPeran = (jenis) => `  // ASISTEN-UJIAN-MAHASISWA:PERAN BEGIN v1 — dipasang scripts/buka-asisten-ujian.mjs
  // ${jenis} PRIVACY: daftar mahasiswa online (panel "Mahasiswa") hanya untuk dosen.
  // Mahasiswa yang login tetap mendapat #visitorFab, tetapi sebagai tombol
  // "Asisten Dosen": roster, badge, dan jumlah online disembunyikan dan
  // dikosongkan oleh _terapkanAsistenUjian (tepat di bawah fungsi ini).
  _terapkanAsistenUjian(isStudent);
  const visitorFab = document.getElementById('visitorFab');
  if (visitorFab) {
    if (isStudent) {
      visitorFab.style.display = 'flex';
      visitorFab.style.visibility = 'visible';
    } else if (isDosen) {
      visitorFab.style.visibility = 'visible';
      // display di-set oleh login flow (flex), tidak override di sini
    }
  }
  // ASISTEN-UJIAN-MAHASISWA:PERAN END v1
`;

// ── 4. renderVisitors: cabang mahasiswa ──────────────────────────────────────
const RENDER_LAMA = `    // Hide visitor FAB (panel "Mahasiswa")
    const fab = document.getElementById('visitorFab');
    if (fab) fab.style.display = 'none';
`;
const RX_RENDER = /    \/\/ ASISTEN-UJIAN-MAHASISWA:RENDER BEGIN[^\n]*\n[\s\S]*?    \/\/ ASISTEN-UJIAN-MAHASISWA:RENDER END[^\n]*\n/;
const BLOK_RENDER = `    // ASISTEN-UJIAN-MAHASISWA:RENDER BEGIN v1 — dipasang scripts/buka-asisten-ujian.mjs
    // #visitorFab TIDAK disembunyikan lagi: bagi mahasiswa ia tombol Asisten
    // Dosen (_applyRoleVisibility). Roster online tetap khusus dosen — sisa
    // daftar, badge, dan jumlah dari render fase tamu dibuang di sini, dan
    // cabang ini tetap berakhir dengan return sebelum jalur dosen mengisinya.
    _kosongkanRosterUjian();
    // ASISTEN-UJIAN-MAHASISWA:RENDER END v1
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
  const jenis = path.basename(berkas, ".html");          // "UTS" | "UAS"
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];

  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
  if (!html.includes("<h3>👥 Mahasiswa Online</h3>") || !html.includes('id="visitorFab"') || !html.includes('id="vpList"')) {
    throw new Error("panel mahasiswa online (#visitorFab/#vpList) tidak ditemukan");
  }

  // 1. CSS sebelum </head> pertama (yang lain ada di dalam templat ekspor JS).
  html = pasang(html, RX_CSS, BLOK_CSS, "css", catatan, (h) => {
    const i = h.indexOf("</head>");
    const b = h.indexOf("<body");
    if (i < 0 || b < 0 || i > b) throw new Error("</head> dokumen tidak ditemukan sebelum <body>");
    return h.slice(0, i) + BLOK_CSS + h.slice(i);
  });

  // 2. Fungsi bantu sesudah ekspor _applyRoleVisibility.
  html = pasang(html, RX_JS, BLOK_JS, "js", catatan, (h) => {
    const n = hitung(h, JANGKAR_JS);
    if (n !== 1) throw new Error(`jangkar ekspor _applyRoleVisibility muncul ${n}x, harusnya 1`);
    return h.replace(JANGKAR_JS, () => JANGKAR_JS + BLOK_JS);
  });

  // 3. _applyRoleVisibility.
  html = pasang(html, RX_PERAN, blokPeran(jenis), "peran", catatan, (h) => {
    const n = hitungRx(h, RX_PERAN_LAMA);
    if (n !== 1) throw new Error(`blok ${jenis} PRIVACY di _applyRoleVisibility muncul ${n}x, harusnya 1`);
    return h.replace(RX_PERAN_LAMA, () => blokPeran(jenis));
  });

  // 4. renderVisitors, cabang mahasiswa.
  html = pasang(html, RX_RENDER, BLOK_RENDER, "render", catatan, (h) => {
    const n = hitung(h, RENDER_LAMA);
    if (n !== 1) throw new Error(`penyembunyi #visitorFab di renderVisitors muncul ${n}x, harusnya 1`);
    return h.replace(RENDER_LAMA, () => BLOK_RENDER);
  });

  // Penjaga hasil: bentuk lama hilang, tiap blok tepat sekali, tanpa chat kelas.
  if (RX_PERAN_LAMA.test(html) || html.includes(RENDER_LAMA)) throw new Error("bentuk lama penyembunyi #visitorFab tertinggal");
  for (const [rx, label] of [[RX_CSS, "css"], [RX_JS, "js"], [RX_PERAN, "peran"], [RX_RENDER, "render"]]) {
    if (hitungRx(html, rx) !== 1) throw new Error(`blok ${label} harus tepat 1x`);
  }
  const tanpaBlokAi = html.replace(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g, "");
  for (const terlarang of ["vp-chat", "vpChatList", "vpChatInput", "sendChat"]) {
    if (tanpaBlokAi.includes(terlarang)) throw new Error(`halaman ujian memuat ${terlarang} (chat kelas dilarang di UTS/UAS)`);
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
