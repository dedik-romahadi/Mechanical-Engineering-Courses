/**
 * Menyesuaikan lapisan friction di 64 halaman modul/exam:
 *
 *   1. Watermark NIM+nama dihapus.            (modul: ya — exam: lihat --exam)
 *   2. Panel "🔒 Mode Modul/Ujian Aktif" dihapus.
 *   3. Cetak diblokir juga lewat menu browser (@media print + beforeprint),
 *      melengkapi Ctrl+P yang sudah diblokir onKeyDown.
 *   4. Halaman modul ikut dikaburkan saat JENDELA kehilangan fokus (Alt+Tab,
 *      Snipping Tool), bukan hanya saat tab disembunyikan.
 *
 * BATAS YANG JUJUR. Tidak ada cara membuat halaman web "tidak bisa
 * di-screenshot": Print Screen, perekam layar, dan kamera ponsel berada di
 * luar jangkauan browser. Yang ada hanya penghalang dan pencatat; Pedoman §8
 * melarang klaim sebaliknya. Butir 4 sengaja TIDAK diterapkan pada exam:
 * validator dan Pedoman §8 melarang UAS memburamkan halaman saat kehilangan
 * fokus, sebab notifikasi sistem atau pindah jendela sebentar akan membuat
 * peserta kehilangan pandangan atas soal di tengah ujian.
 *
 * KENAPA WATERMARK EXAM DIPISAH. Watermark adalah satu-satunya alat atribusi
 * bila foto soal bocor keluar. Di modul (formatif) nilainya kecil; di UAS ia
 * kebijakan. Maka default skrip ini menyentuh exam untuk butir 2-3 saja, dan
 * hanya menghapus watermark exam bila dijalankan dengan --exam-watermark.
 *
 * Idempoten: setiap suntingan dikenali dari bentuk akhirnya, bukan penanda.
 *
 * Pakai:
 *   node scripts/ubah-friction.mjs                    # terapkan
 *   node scripts/ubah-friction.mjs --periksa          # laporan saja
 *   node scripts/ubah-friction.mjs --exam-watermark   # + hapus watermark exam
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const hapusWmExam = process.argv.includes("--exam-watermark");

// ── Potongan yang dihapus ─────────────────────────────────────────────────

// Pembuatan elemen watermark + notice di dalam renderWatermark(): dari
// `const text = escH(...)` sampai penutup blok notice. Bentuknya byte-identik
// di 56 modul dan 8 exam kecuali label dan judul notice.
const RX_RENDER_ISI = /\n    const text = escH\(`\$\{m\.nim\} · \$\{m\.nama\}`\);\n(?:    \/\/ Render watermark[^\n]*\n)?    const wm = document\.createElement\('div'\);\n[\s\S]*?    document\.body\.appendChild\(wm\);\n\n(?:    \/\/ Render small notice bar[^\n]*\n)?    if \(notice\)\{\n      notice\.classList\.add\('active'\);\n    \} else \{\n      const n = document\.createElement\('div'\);\n      n\.id = 'frictionNotice';\n[\s\S]*?      document\.body\.appendChild\(n\);\n    \}\n/;

// CSS watermark + notice (blok byte-identik di 64 halaman).
const RX_CSS_WM = /#frictionWatermark\{[^}]*\}\n#frictionWatermark\.active\{display:block;\}\n/;
const RX_CSS_NOTICE = /#frictionNotice\{[^}]*\}\n#frictionNotice\.active\{display:block;\}\n/;
// Pengecualian blur untuk notice tidak lagi relevan bila notice tiada.
const RX_CSS_BLUR_NOTICE = /body\.friction-blurred #frictionNotice,\n/;

// Pemasang ulang watermark di init(): listener storage/friction:render,
// pemanggilan awal, dan interval 1,5 detik.
const RX_INIT_WM = /    window\.addEventListener\('storage', renderWatermark\);\n    window\.addEventListener\('friction:render', renderWatermark\);\n/;
const RX_INIT_CALL = /    renderWatermark\(\);\n    setInterval\(renderWatermark, 1500\);\n/;

// Teks banner exam yang menyebut watermark.
const RX_BANNER_EXAM = /Konten ujian dilindungi dan memiliki watermark identitas\./g;

// ── Potongan yang ditambahkan ─────────────────────────────────────────────

const CSS_CETAK = `/* Cetak lewat menu browser diblokir: seluruh halaman dikosongkan saat print
   dan diganti satu baris pemberitahuan. Ctrl+P sudah dicegat onKeyDown; ini
   menutup jalur menu, ekstensi, dan "Simpan sebagai PDF". */
@media print{
  body > *{display:none !important;}
  body::before{content:"Halaman ini tidak dapat dicetak atau disimpan sebagai PDF.";display:block;padding:40px;font:16px/1.5 sans-serif;color:#000;}
}
`;

const JS_CETAK = `    window.addEventListener('beforeprint', () => {
      if (isStudent()) showToast('🔒 Mencetak halaman dinonaktifkan.');
    });
`;

// Modul saja: kabur saat JENDELA kehilangan fokus, bukan hanya tab hidden.
const JS_BLUR_JENDELA = `    // Kehilangan fokus jendela (Alt+Tab, Snipping Tool) tidak mengubah
    // visibilitas dokumen, jadi dipantau terpisah. Ditunda 250 ms supaya
    // fokus yang berpindah sebentar ke dialog browser tidak memicu.
    let _fokusTimer = null;
    window.addEventListener('blur', () => {
      if (!isStudent()) return;
      _fokusTimer = setTimeout(() => document.body.classList.add('friction-blurred'), 250);
    });
    window.addEventListener('focus', () => {
      clearTimeout(_fokusTimer);
      document.body.classList.remove('friction-blurred');
    });
`;

function proses(berkas) {
  const isExam = /[\\/]Exam[\\/]/.test(berkas);
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];

  const bolehHapusWm = !isExam || hapusWmExam;

  if (bolehHapusWm) {
    // 1+2. DOM watermark & notice
    if (RX_RENDER_ISI.test(html)) { html = html.replace(RX_RENDER_ISI, "\n"); catatan.push("dom-wm+notice"); }
    // Sisakan renderWatermark() sebagai fungsi kosong-aman: ia masih dipanggil
    // lewat lastSig; tanpa badan pembuat, ia hanya menyingkirkan sisa lama.
    if (RX_INIT_WM.test(html)) { html = html.replace(RX_INIT_WM, ""); catatan.push("init-listener"); }
    if (RX_INIT_CALL.test(html)) { html = html.replace(RX_INIT_CALL, "    renderWatermark();\n"); catatan.push("init-interval"); }
    if (RX_CSS_WM.test(html)) { html = html.replace(RX_CSS_WM, ""); catatan.push("css-wm"); }
    if (RX_CSS_NOTICE.test(html)) { html = html.replace(RX_CSS_NOTICE, ""); catatan.push("css-notice"); }
    if (RX_CSS_BLUR_NOTICE.test(html)) { html = html.replace(RX_CSS_BLUR_NOTICE, ""); catatan.push("css-blur-notice"); }
    if (isExam && RX_BANNER_EXAM.test(html)) {
      html = html.replace(RX_BANNER_EXAM, "Konten ujian dilindungi: salin, cetak, dan tangkapan layar dibatasi serta tercatat.");
      catatan.push("banner-exam");
    }
  } else if (isExam) {
    // Exam tanpa --exam-watermark: hanya panel notice yang dihapus.
    const RX_NOTICE_SAJA = /\n(?:    \/\/ Render small notice bar[^\n]*\n)?    if \(notice\)\{\n      notice\.classList\.add\('active'\);\n    \} else \{\n      const n = document\.createElement\('div'\);\n      n\.id = 'frictionNotice';\n[\s\S]*?      document\.body\.appendChild\(n\);\n    \}\n/;
    if (RX_NOTICE_SAJA.test(html)) { html = html.replace(RX_NOTICE_SAJA, "\n"); catatan.push("dom-notice"); }
    if (RX_CSS_NOTICE.test(html)) { html = html.replace(RX_CSS_NOTICE, ""); catatan.push("css-notice"); }
  }

  // 3. Blokir cetak (semua halaman)
  if (!html.includes("@media print{\n  body > *{display:none !important;}")) {
    // Disisipkan sebelum </style> milik blok friction (ditandai #frictionToast),
    // sama untuk modul dan exam — jangkar lama pada aturan blur sudah tidak
    // ada karena pengaburan dicabut.
    const idx = html.indexOf("#frictionToast{");
    const tutup = idx >= 0 ? html.indexOf("</style>", idx) : -1;
    if (tutup >= 0) { html = html.slice(0, tutup) + CSS_CETAK + html.slice(tutup); catatan.push("css-cetak"); }
  }
  if (!html.includes("addEventListener('beforeprint'")) {
    const jangkar = "    document.addEventListener('visibilitychange', onVisibility);\n";
    if (html.includes(jangkar)) { html = html.replace(jangkar, jangkar + JS_CETAK); catatan.push("js-cetak"); }
  }

  // 4. TIDAK ADA pengaburan sama sekali — dicabut atas permintaan dosen.
  //    Mahasiswa harus bolak-balik ke VS Code saat mengerjakan soal komputasi;
  //    halaman yang mengabur tiap kali jendela atau tab berpindah justru
  //    menghalangi pekerjaan, bukan kecurangan. Yang dicabut: handler
  //    blur/focus jendela (sempat ditambahkan), cabang blur di onVisibility
  //    (lama), dan CSS body.friction-blurred. Penghitung perpindahan tab dan
  //    toastnya tetap ada — itu pencatat, bukan penghalang.
  if (html.includes("window.addEventListener('blur'")) {
    html = html.replace(JS_BLUR_JENDELA, ""); catatan.push("cabut-blur-jendela");
  }
  const RX_BLUR_VISIBILITY = /      \/\/ Blur halaman setelah 200ms[^\n]*\n      \/\/ Screenshot via OS-level capture[^\n]*\n      _blurTimer = setTimeout\(\(\) => \{\n        document\.body\.classList\.add\('friction-blurred'\);\n      \}, 200\);\n/;
  if (RX_BLUR_VISIBILITY.test(html)) { html = html.replace(RX_BLUR_VISIBILITY, ""); catatan.push("cabut-blur-tab"); }
  const RX_UNBLUR_VISIBILITY = /      clearTimeout\(_blurTimer\);\n      document\.body\.classList\.remove\('friction-blurred'\);\n/;
  if (RX_UNBLUR_VISIBILITY.test(html)) { html = html.replace(RX_UNBLUR_VISIBILITY, ""); catatan.push("cabut-unblur-tab"); }
  if (html.includes("  let _blurTimer = null;\n")) { html = html.replace("  let _blurTimer = null;\n", ""); catatan.push("cabut-var-blur"); }
  // Dua aturan CSS blur tidak selalu bersebelahan (aturan cetak pernah
  // disisipkan di antaranya), jadi masing-masing dibuang sendiri.
  const RX_CSS_BLUR = /body\.friction-blurred\{filter:blur\(12px\);transition:filter \.3s ease;\}\n/;
  if (RX_CSS_BLUR.test(html)) { html = html.replace(RX_CSS_BLUR, ""); catatan.push("cabut-css-blur"); }
  const RX_CSS_BLUR_TOAST = /body\.friction-blurred #frictionToast\{filter:none;\}\n/;
  if (RX_CSS_BLUR_TOAST.test(html)) { html = html.replace(RX_CSS_BLUR_TOAST, ""); catatan.push("cabut-css-blur-toast"); }

  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Exam", "Modul"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) berkas.push(path.join(dir, f));
  }
}
let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  const h = proses(f);
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
