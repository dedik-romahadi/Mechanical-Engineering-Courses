// Memperkuat pemuatan roster di tab Pembagian Kelompok (Modul 1 setiap course).
//
// Masalah: renderGroups() mengambil ../Attributes/students.json satu kali, tanpa
// memeriksa status HTTP dan tanpa percobaan ulang. Satu kegagalan sesaat (koneksi
// putus, CDN Pages yang belum selesai memperbarui berkas, atau halaman dibuka dari
// berkas lokal) langsung menampilkan "Gagal memuat data mahasiswa", dan baru dicoba
// lagi bila mahasiswa berpindah tab.
//
// Perbaikan (penanda KELOMPOK-TANGGUH, idempoten):
//   • _pkAmbilRoster(url): cek r.ok, tiga percobaan dengan jeda dan parameter anti-cache;
//   • pesan gagal menyebut penyebabnya dan menyediakan tombol "Coba lagi";
//   • halaman yang dibuka lewat file:// diberi tahu untuk membuka versi situs.
//
// Pakai: node scripts/perkuat-pembagian-kelompok.mjs [--periksa]
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const periksa = process.argv.includes("--periksa");
const PENANDA = "KELOMPOK-TANGGUH";

const HELPER = `// ── ${PENANDA}: roster kelompok dimuat dengan cek HTTP dan percobaan ulang ──
function _pkAmbilRoster(sumber, ke) {
  ke = ke || 0;
  const url = sumber + (ke ? (sumber.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now() : '');
  return fetch(url, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .catch(err => {
      if (ke >= 2) throw err;
      return new Promise(res => setTimeout(res, 800 * (ke + 1))).then(() => _pkAmbilRoster(sumber, ke + 1));
    });
}
function _pkPesanGagal(err) {
  const lokal = location.protocol === 'file:';
  const sebab = lokal
    ? 'Halaman dibuka dari berkas lokal, sehingga browser memblokir pembacaan daftar mahasiswa. Buka modul lewat situs kuliah (https://dedik-romahadi.github.io/Mechanical-Engineering-Courses/).'
    : 'Periksa koneksi internet, lalu klik Coba lagi.';
  return '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#fb7185">⚠ Gagal memuat data mahasiswa. ' + sebab +
    '<div style="margin-top:8px;font-size:12px;color:#94a3b8;font-family:\\'JetBrains Mono\\',monospace">' + String((err && err.message) || err).replace(/</g, '&lt;') + '</div>' +
    (lokal ? '' : '<button type="button" onclick="renderGroups._loaded=true;renderGroups()" style="margin-top:14px;padding:8px 18px;border-radius:8px;border:1px solid rgba(251,113,133,.5);background:rgba(251,113,133,.12);color:#fda4af;cursor:pointer;font-weight:600">↻ Coba lagi</button>') +
    '</div>';
}
`;

const AWAL = /function renderGroups\(\) \{\n  fetch\((STUDENTS_JSON(?:_KELOMPOK)?), \{ cache: 'no-store' \}\)\n    \.then\(r => r\.json\(\)\)\n/g;
const PESAN = /if \(c\) c\.innerHTML = '<div style="grid-column:1\/-1;text-align:center;padding:40px;color:#fb7185">⚠ Gagal memuat data mahasiswa\.[^'\n]*<\/div>';/g;

const berkas = fs.readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, "Modul", "Modul-1.html")))
  .map((d) => path.join(root, d.name, "Modul", "Modul-1.html"));

let diubah = 0;
for (const file of berkas) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("function renderGroups() {")) continue;
  if (html.includes(PENANDA)) { console.log(`  ${rel}: sudah`); continue; }
  const nAwal = (html.match(AWAL) || []).length;
  const nPesan = (html.match(PESAN) || []).length;
  if (nAwal !== 1 || nPesan !== 1) {
    throw new Error(`${rel}: jangkar renderGroups tidak ditemukan tepat sekali (awal ${nAwal}, pesan ${nPesan})`);
  }
  html = html
    .replace(AWAL, (_, konstanta) => HELPER + `function renderGroups() {\n  _pkAmbilRoster(${konstanta})\n`)
    .replace(PESAN, "if (c) c.innerHTML = _pkPesanGagal(err);");
  diubah += 1;
  console.log(`  ${rel}: ${periksa ? "akan diperkuat" : "diperkuat"}`);
  if (!periksa) fs.writeFileSync(file, html, "utf8");
}
console.log(`${diubah} halaman ${periksa ? "akan " : ""}diperbarui (${PENANDA}).`);
