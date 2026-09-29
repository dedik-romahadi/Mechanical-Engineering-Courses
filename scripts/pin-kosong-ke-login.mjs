/**
 * Auto-login tanpa PIN global: kembali ke form login mahasiswa, bukan "masuk"
 * tanpa sesi PIN.
 *
 * MASALAHNYA. Auto-login dari localStorage menyembunyikan overlay login lalu,
 * bila hash PIN sesi kosong (tab baru), memanggil `_pinAuthObj(me.nim)`
 * (callable `verifyPin`) dan `_tryMigrateLegacyPin`; modal PIN hanya muncul
 * bila PIN ADA. Bila slot `pins/mhs_<NIM>` kosong (mahasiswa belum pernah
 * membuat PIN global — mis. sesudah `strip-pin` — atau node-nya dihapus),
 * tidak ada yang ditampilkan: halaman tampak "masuk" tanpa hash PIN sesi, dan
 * setiap callable gagal ("pinHash tidak valid" / sesi PIN) sampai mahasiswa
 * menekan 🚪 Log Out sendiri.
 *
 * YANG DILAKUKAN. Di blok "PIN re-verify jika sessionStorage cleared" (satu per
 * halaman, 84 modul + 12 exam) disisipkan cabang `else` sesudah
 * `if (existingPin && existingPin.pinHash) { … _showPinInput … }`:
 * `verifyPin` menjawab exists:false dan migrasi PIN lama mengembalikan null →
 * identitas tersimpan dibuang, presence dibersihkan, sesi Firebase keluar
 * (seperti `choseMahasiswa`), dan form login mahasiswa (#visitorOverlay)
 * tampil lagi dengan NIM terisi dan penjelasan singkat. PIN baru dibuat lewat
 * alur login pertama yang sudah ada (`submitVisitor` → modal konfirmasi PIN),
 * jadi tetap diketik dua kali. Klien tetap tidak membaca `pins/`.
 * Hanya identitas mahasiswa (NIM angka, peran student) — identitas dosen
 * (`nim: 'DOSEN'`) tidak pernah punya `pins/` dan tidak disentuh. Galat
 * jaringan dan penguncian PIN (`verifyPin` melempar) tetap jatuh ke catch dan
 * tidak mengeluarkan siapa pun. Tidak dijalankan bila identitas sudah berganti
 * atau sesi PIN sudah terisi selama menunggu callable.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html dan <Kursus>/Exam/UTS.html|UAS.html
 * (bukan salinan konflik OneDrive *-DEDIK-PC.html) — tepat 96 halaman.
 * Jalankan ulang sesudah regenerasi halaman (generator CAD/TTL/Sisken
 * menyalin kerangka yang sudah memuat blok ini; jalan ulang memperbarui blok
 * bertanda ke versi skrip ini).
 *
 * Idempoten: blok bertanda `PIN-KOSONG-LOGIN BEGIN/END v1` ditulis ulang ke
 * versi terkini; halaman yang sudah sama tidak ditulis. Jalan kedua
 * melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/pin-kosong-ke-login.mjs            # terapkan
 *   node scripts/pin-kosong-ke-login.mjs --periksa  # laporan saja (exit 1 bila ada yang belum)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");
const VERSI = "v1";
const JANGKAR_BLOK = "// PIN re-verify jika sessionStorage cleared";

const PESAN =
  "⚠ Sesi tersimpan belum punya PIN, jadi Anda perlu masuk lagi. " +
  "Ketik NIM Anda dan PIN 6 digit baru lalu klik Masuk; PIN itu diminta sekali lagi untuk konfirmasi.";

/** Isi cabang else, tiap baris diberi indentasi `ind`. */
function blok(ind) {
  const baris = [
    `// PIN-KOSONG-LOGIN BEGIN ${VERSI} — dipasang scripts/pin-kosong-ke-login.mjs`,
    `// verifyPin: belum ada PIN global untuk NIM ini dan tidak ada PIN lama untuk`,
    `// dimigrasi. Tanpa cabang ini halaman tetap "masuk" tanpa hash PIN sesi dan`,
    `// setiap callable gagal sampai mahasiswa menekan Log Out. Identitas tersimpan`,
    `// dibuang dan form login mahasiswa tampil lagi; PIN baru dibuat lewat alur`,
    `// login pertama biasa (submitVisitor → modal konfirmasi PIN). NIM sengaja`,
    `// TIDAK diisikan: di komputer bersama, identitas basi milik mahasiswa lain`,
    `// akan mengundang orang berikutnya membuat PIN untuk slot kosong orang itu.`,
    `// Hanya identitas mahasiswa; galat jaringan/penguncian masuk catch di bawah.`,
    `const _kini = getIdentity();`,
    `if ((!me.role || me.role === 'student') && /^\\d+$/.test(String(me.nim || ''))`,
    `    && !window._sessionPinHash && _kini && _kini.nim === me.nim) {`,
    `  try { localStorage.removeItem(LOCAL_IDENTITY); } catch (e) {}`,
    `  try { if (typeof cleanupPresence === 'function') cleanupPresence(); else if (typeof _cleanupPresence === 'function') _cleanupPresence(); } catch (e) {}`,
    `  signOut(_auth).catch(() => {});`,
    `  const _rc = document.getElementById('roleChooserOverlay');`,
    `  if (_rc) _rc.classList.add('hidden');`,
    `  const _vo = document.getElementById('visitorOverlay');`,
    `  if (_vo) _vo.classList.remove('hidden');`,
    `  const _fab = document.getElementById('visitorFab');`,
    `  if (_fab) _fab.style.display = 'none';`,
    `  if (typeof _applyRoleVisibility === 'function') _applyRoleVisibility();`,
    `  const _vPin = document.getElementById('vPin');`,
    `  if (_vPin) _vPin.value = '';`,
    `  const _vNim = document.getElementById('vNim');`,
    `  if (_vNim) { _vNim.value = ''; setTimeout(() => _vNim.focus(), 50); }`,
    `  const _vErr = document.getElementById('vError');`,
    `  if (_vErr) { _vErr.textContent = ${JSON.stringify(PESAN)}; _vErr.style.display = 'block'; }`,
    `}`,
    `// PIN-KOSONG-LOGIN END ${VERSI}`,
  ];
  return baris.map((b) => ind + b).join("\n");
}

const RX_BERTANDA = /^([ \t]*)\/\/ PIN-KOSONG-LOGIN BEGIN v\d+[^\n]*\n[\s\S]*?\/\/ PIN-KOSONG-LOGIN END v\d+$/m;
// Akhir blok if asli: baris _showPinInput, penutup if, lalu catch khas blok ini.
const RX_ASLI = /^([ \t]*)if \(typeof _showPinInput === 'function'\) _showPinInput\(me\.nama\);\n([ \t]*)\}\n([ \t]*\} catch \(e\) \{ console\.error\('\[Auto-login PIN reverify\]', e\); \})$/m;

function halaman() {
  const out = [];
  for (const k of fs.readdirSync(root, { withFileTypes: true })) {
    if (!k.isDirectory()) continue;
    const dm = path.join(root, k.name, "Modul");
    if (fs.existsSync(dm)) {
      for (const f of fs.readdirSync(dm)) if (/^Modul-\d+\.html$/.test(f)) out.push(path.join(dm, f));
    }
    for (const j of ["UTS", "UAS"]) {
      const f = path.join(root, k.name, "Exam", `${j}.html`);
      if (fs.existsSync(f)) out.push(f);
    }
  }
  return out;
}

let n = 0;
let total = 0;
for (const f of halaman()) {
  const rel = path.relative(root, f).split(path.sep).join("/");
  const html = fs.readFileSync(f, "utf8");
  if (!html.includes(JANGKAR_BLOK)) continue;
  total += 1;
  if (html.includes("\r")) throw new Error(`${rel}: berkas memuat CR; repo ini LF (.gitattributes eol=lf)`);
  const i = html.indexOf(JANGKAR_BLOK);
  if (html.indexOf(JANGKAR_BLOK, i + 1) !== -1) throw new Error(`${rel}: blok "${JANGKAR_BLOK}" lebih dari satu`);
  // Cari hanya di dalam blok re-verify (≤ 4000 karakter sesudah jangkar).
  const ujung = i + 4000;
  const bagian = html.slice(i, ujung);
  let baru;
  const t = bagian.match(RX_BERTANDA);
  if (t) {
    baru = html.slice(0, i) + bagian.replace(RX_BERTANDA, () => blok(t[1])) + html.slice(ujung);
  } else {
    const a = bagian.match(RX_ASLI);
    if (!a) throw new Error(`${rel}: pola akhir blok re-verify (_showPinInput → } → catch) tidak ditemukan`);
    const indTutup = a[2];
    const ganti = `${a[1]}if (typeof _showPinInput === 'function') _showPinInput(me.nama);\n${indTutup}} else {\n${blok(indTutup + "  ")}\n${indTutup}}\n${a[3]}`;
    baru = html.slice(0, i) + bagian.replace(RX_ASLI, () => ganti) + html.slice(ujung);
  }
  if (baru === html) continue;
  n += 1;
  if (!periksa) fs.writeFileSync(f, baru);
}
if (total !== 96) throw new Error(`harap 96 halaman (84 modul + 12 exam) berblok re-verify PIN, ditemukan ${total}`);
console.log(`${n} dari ${total} halaman ${periksa ? "belum memuat PIN-KOSONG-LOGIN " + VERSI : "diperbarui"}`);
if (periksa && n) process.exitCode = 1;
