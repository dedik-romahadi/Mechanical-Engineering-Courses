/**
 * Kunci identitas skrip klasik = LOCAL_IDENTITY halaman, di ke-84 modul.
 *
 * MASALAHNYA. Tiap halaman modul menyimpan identitas login di localStorage
 * dengan kunci LOCAL_IDENTITY = `<slug>_identity_${MODULE_ID}`. Kunci itu
 * `const` di dalam <script type="module">, jadi TIDAK terlihat dari skrip
 * klasik halaman yang sama: `typeof LOCAL_IDENTITY` di sana selalu
 * 'undefined'. Karena itu skrip klasik menulis kuncinya sebagai literal —
 * getIdentityLocal(), cadangan identitas dan cadangan MODULE_ID di
 * _draftKey(), dan `const LK` lapisan friksi — dan literal itu harus diikutkan
 * setiap kali MODULE_ID berubah. Dua kali tidak diikutkan:
 *
 *   - Optimalisasi Modul 12–14 (sejak #285, 30 Mei 2026): MODULE_ID digeser
 *     ke pertemuan-13/-14/-15 (pertemuan 8 = UTS, jadi Modul n ≥ 8 memakai
 *     pertemuan n+1), tetapi keempat literal klasik tetap pertemuan-12/-13/-14
 *     = kunci identitas modul SEBELUMNYA. Blok PROGRES-MODUL
 *     (scripts/tambah-progres-modul.mjs) membaca identitas lewat
 *     getIdentityLocal(): tanpa login modul sebelumnya di peramban yang sama
 *     hasilnya null, sehingga getModulProgress/setModulCentang/saveModulForum
 *     tidak pernah dipanggil, tab Tugas/Forum/Hasil tidak terkunci, centang
 *     hanya tersimpan lokal, dan forum tidak tersimpan di server — lalu
 *     gerbang server Modul 13/14 (_cekAkses) membaca progres Modul 12/13 yang
 *     kosong dan menolak mahasiswa. Export Tugas/forum HTML ikut memakai
 *     identitas itu (NIM '-' atau identitas basi mahasiswa lain di komputer
 *     bersama), dan lapisan friksi tidak aktif. Kunci draf Modul 12 sama
 *     dengan kunci draf Modul 11.
 *   - Matematika 4 Modul 1–14 (sejak #257, 21 Mei 2026): LK friksi ditulis
 *     '${COURSE_ID}_identity_modul-N' dalam kutip tunggal — tidak
 *     diinterpolasi — sehingga lapisan friksi tidak pernah aktif. Cadangan
 *     MODULE_ID _draftKey Modul 1/2/3/5 sama-sama 'pertemuan-5' (satu kunci
 *     draf dipakai empat modul) dan Modul 6–14 'pertemuan-N', bukan 'modul-N'.
 *
 * YANG DILAKUKAN. Untuk tiap <Kursus>/Modul/Modul-N.html (tepat 84):
 *   1. Baca MODULE_ID dan LOCAL_IDENTITY (tepat sekali, di skrip module),
 *      turunkan K = LOCAL_IDENTITY, dan batalkan bila K bukan
 *      `<slug course>_identity_<MODULE_ID>` atau MODULE_ID melanggar aturan
 *      nomor (Modul 1–7 → pertemuan-N, Modul 8–14 → pertemuan-(N+1);
 *      Matematika 4 → modul-N).
 *   2. getIdentityLocal() yang membaca kunci selain K diganti blok
 *      KUNCI-IDENTITAS:LOKAL berisi fungsi yang membaca K.
 *   3. _draftKey() yang kunci efektifnya bukan
 *      `<slug>_draft_<MODULE_ID>_<nim>` (cadangan identitas ≠ K, cadangan
 *      MODULE_ID ≠ MODULE_ID) diganti blok KUNCI-IDENTITAS:DRAF: identitas dari
 *      getIdentityLocal(), kunci `<slug>_draft_<MODULE_ID>_` + NIM.
 *   4. `const LK = '…';` lapisan friksi yang bukan K diganti blok
 *      KUNCI-IDENTITAS:LK.
 *   5. Sesudahnya setiap literal kunci identitas utuh di skrip halaman harus
 *      sama dengan K; bila tidak, skrip berhenti (tempat baru yang belum
 *      dikenal — tangani dulu, jangan ditebak).
 * Halaman yang sudah benar tidak disentuh sama sekali. Blok yang sudah ada
 * dibangun ulang dari K halaman itu (idempoten; versi lama ikut diganti).
 * Tidak ada yang disunting di dalam penanda AI-CHAT-AGENT.
 *
 * YANG SENGAJA TIDAK DILAKUKAN.
 *   - Data localStorage lama tidak dimigrasi. Identitas di kunci lama adalah
 *     identitas sah modul lain (bisa milik NIM lain di komputer lab), jadi
 *     tidak dipindah maupun dihapus; mahasiswa cukup login sekali di modul
 *     itu. Centang mode bebas (pm_centang_bebas_<MODUL_ID>) sudah memakai
 *     MODUL_ID yang benar. Draf lama tidak dipindah karena di 83 dari 84
 *     halaman _markLoaded menjalankan checkExportReady/checkForumReady (yang
 *     memanggil _saveDraft dengan isi formulir saat itu) SEBELUM _loadDraft,
 *     sehingga draf di kunci mana pun tertimpa sebelum sempat dibaca —
 *     memindahkannya tidak berpengaruh, dan draf lama Opto Modul 13/14 yang
 *     kini berada di kunci Modul 12/13 tidak ikut termuat ke forum.
 *   - _draftKey bentuk lama yang memakai LOCAL_IDENTITY/MODULE_ID langsung
 *     (Getaran Modul 1, Sisken, TTL, CAD; ReferenceError yang ditelan
 *     sehingga draf tidak pernah tersimpan) tidak diubah: kuncinya tidak
 *     salah, drafnya mati, dan menghidupkannya mengubah perilaku course yang
 *     sedang berjalan — keputusan terpisah. Skrip ini hanya melaporkannya.
 *
 * Pakai:
 *   node scripts/samakan-kunci-identitas.mjs            # terapkan
 *   node scripts/samakan-kunci-identitas.mjs --periksa  # laporan saja; keluar 1 bila ada yang akan berubah
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const VERSI = "v1";
const SUMBER = "dipasang scripts/samakan-kunci-identitas.mjs";
const SLUG = {
  "Engineering-Mathematics": "math4",
  "Getaran-Mekanik": "getaran_mekanik",
  "Optimalisasi-dan-Automasi": "optoauto",
  "Sistem-Kendali-Cerdas": "sistem_kendali_cerdas",
  "Teknik-Tenaga-Listrik": "teknik_tenaga_listrik",
  "Pemodelan-Computer-Aided-Design": "pemodelan_cad",
};

/** MODULE_ID yang benar untuk Modul-N course itu (pertemuan 8 = UTS). */
function moduleIdHarap(slug, n) {
  if (slug === "math4") return `modul-${n}`;
  return `pertemuan-${n <= 7 ? n : n + 1}`;
}

// ── Blok bertanda ──────────────────────────────────────────────────────────
function blokLokal(K) {
  return `// KUNCI-IDENTITAS:LOKAL BEGIN ${VERSI} — ${SUMBER}
// Kunci ini wajib sama dengan LOCAL_IDENTITY skrip module halaman ini
// (\`<slug>_identity_\${MODULE_ID}\`). Const skrip module tidak terlihat dari
// skrip klasik, jadi kuncinya ditulis sebagai literal; blok PROGRES-MODUL,
// Export Tugas, forum HTML, dan _draftKey membaca identitas lewat fungsi ini.
// validate-public-security.mjs menagih kesamaannya di ke-84 modul.
function getIdentityLocal() {
  try { return JSON.parse(localStorage.getItem('${K}')); } catch(e) { return null; }
}
// KUNCI-IDENTITAS:LOKAL END ${VERSI}
`;
}
function blokDraf(K) {
  const awalan = K.replace("_identity_", "_draft_") + "_";
  return `// KUNCI-IDENTITAS:DRAF BEGIN ${VERSI} — ${SUMBER}
// Kunci draf per NIM = <slug>_draft_<MODULE_ID>_<nim>, identitas dari
// getIdentityLocal() (kunci LOCAL_IDENTITY). Bentuk lama memeriksa
// \`typeof LOCAL_IDENTITY\`/\`typeof MODULE_ID\`, yang di skrip klasik selalu
// 'undefined', sehingga literal cadangannya yang terpakai.
function _draftKey() {
  try {
    const me = getIdentityLocal();
    if (!me || !me.nim || me.role === 'dosen') return null;
    return '${awalan}' + me.nim;   // per-NIM, course-scoped
  } catch(e) { return null; }
}
// KUNCI-IDENTITAS:DRAF END ${VERSI}
`;
}
function blokLk(K) {
  return `  // KUNCI-IDENTITAS:LK BEGIN ${VERSI} — ${SUMBER}
  // Sama dengan LOCAL_IDENTITY skrip module halaman ini (dijaga validator).
  const LK = '${K}';
  // KUNCI-IDENTITAS:LK END ${VERSI}
`;
}
const RX_BLOK = (nama, indent) => new RegExp(`${indent}// KUNCI-IDENTITAS:${nama} BEGIN v\\d+[^\\n]*\\n[\\s\\S]*?${indent}// KUNCI-IDENTITAS:${nama} END v\\d+[^\\n]*\\n`, "g");

// ── Pembantu ───────────────────────────────────────────────────────────────
const hitung = (s, sub) => s.split(sub).length - 1;

/** Rentang <script> inline: {awal, akhir (indeks isi), module}. */
function skrip(html) {
  const out = [];
  const rx = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html))) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    const awal = m.index + m[0].indexOf(">") + 1;
    out.push({ awal, akhir: awal + m[2].length, module: /type\s*=\s*["']module["']/i.test(m[1]) });
  }
  return out;
}
function rentangAi(html) {
  const out = [];
  const rx = /<!-- AI-CHAT-AGENT:BEGIN[^>]*-->/g;
  let m;
  while ((m = rx.exec(html))) {
    const z = html.indexOf("<!-- AI-CHAT-AGENT:END", m.index);
    out.push([m.index, z < 0 ? html.length : z]);
  }
  return out;
}

/** Badan fungsi klasik `function <nama>() {` sampai "\n}\n" (tepat satu definisi). */
function fungsi(html, nama) {
  const kepala = `function ${nama}() {`;
  const n = hitung(html, "\n" + kepala);
  if (n !== 1) throw new Error(`${kepala} muncul ${n}x, harusnya 1`);
  const i = html.indexOf("\n" + kepala) + 1;
  const j = html.indexOf("\n}\n", i);
  if (j < 0) throw new Error(`penutup ${kepala} tidak ditemukan`);
  return { awal: i, akhir: j + 3, teks: html.slice(i, j + 3) };
}

/** Literal kunci identitas utuh (bukan awalan) dalam kutip tunggal/ganda, di luar baris komentar. */
function literalIdentitas(js) {
  const out = [];
  for (const baris of js.split("\n")) {
    const t = baris.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    for (const m of baris.matchAll(/(['"])([A-Za-z0-9_${}.-]*_identity_[A-Za-z0-9_${}.-]+)\1/g)) out.push(m[2]);
  }
  return out;
}

function proses(berkas, kursus, n) {
  const asli = fs.readFileSync(berkas, "utf8");
  const crlf = asli.includes("\r\n");
  let html = crlf ? asli.replace(/\r\n/g, "\n") : asli;
  if (html.includes("\r")) throw new Error("berkas memuat CR tunggal");
  const awal = html;
  const catatan = [];
  const slug = SLUG[kursus];

  // 1. K dari skrip module.
  const blokSkrip = skrip(html);
  const diModule = (i) => blokSkrip.some((b) => b.module && i >= b.awal && i < b.akhir);
  const satu = (rx, apa) => {
    const m = [...html.matchAll(rx)];
    if (m.length !== 1) throw new Error(`${apa} muncul ${m.length}x, harusnya 1`);
    if (!diModule(m[0].index)) throw new Error(`${apa} tidak berada di <script type="module">`);
    return m[0][1];
  };
  const mid = satu(/\nconst MODULE_ID = '([^'\n]+)';/g, "const MODULE_ID");
  const tpl = satu(/\nconst LOCAL_IDENTITY = `([^`\n]+)`;\n/g, "const LOCAL_IDENTITY");
  let K = tpl.split("${MODULE_ID}").join(mid);
  if (K.includes("${COURSE_ID}")) K = K.split("${COURSE_ID}").join(satu(/\nconst COURSE_ID = '([^'\n]+)';/g, "const COURSE_ID"));
  const midHarap = moduleIdHarap(slug, n);
  if (mid !== midHarap) throw new Error(`MODULE_ID '${mid}', harusnya '${midHarap}'`);
  if (K !== `${slug}_identity_${mid}`) throw new Error(`LOCAL_IDENTITY '${K}', harusnya '${slug}_identity_${mid}'`);

  // 2. getIdentityLocal.
  {
    const rx = RX_BLOK("LOKAL", "");
    const ada = (html.match(rx) || []).length;
    if (ada > 1) throw new Error(`blok KUNCI-IDENTITAS:LOKAL muncul ${ada}x`);
    if (ada === 1) {
      const baru = html.replace(rx, () => blokLokal(K));
      if (baru !== html) catatan.push("lokal-diperbarui");
      html = baru;
    } else {
      const f = fungsi(html, "getIdentityLocal");
      const lit = literalIdentitas(f.teks);
      if (!lit.length || !f.teks.includes("localStorage.getItem(")) throw new Error("getIdentityLocal tanpa literal kunci identitas yang dikenal");
      if (lit.some((x) => x !== K)) {
        html = html.slice(0, f.awal) + blokLokal(K) + html.slice(f.akhir);
        catatan.push(`getIdentityLocal ${[...new Set(lit)].join("/")}→${K}`);
      }
    }
  }

  // 3. _draftKey.
  let drafMati = false;
  {
    const rx = RX_BLOK("DRAF", "");
    const ada = (html.match(rx) || []).length;
    if (ada > 1) throw new Error(`blok KUNCI-IDENTITAS:DRAF muncul ${ada}x`);
    if (ada === 1) {
      const baru = html.replace(rx, () => blokDraf(K));
      if (baru !== html) catatan.push("draf-diperbarui");
      html = baru;
    } else {
      const f = fungsi(html, "_draftKey");
      const kode = f.teks.split("\n").filter((b) => !b.trim().startsWith("//")).join("\n");
      const litId = literalIdentitas(f.teks);
      const cadMid = [...kode.matchAll(/\(typeof MODULE_ID !== 'undefined'\) \? MODULE_ID : '([^'\n]+)'/g)].map((m) => m[1]);
      const drafUtuh = [...kode.matchAll(/'([a-z0-9_]+)_draft_([^'\n]+)_'/g)];
      const drafAwalan = [...kode.matchAll(/'([a-z0-9_]+)_draft_'/g)].map((m) => m[1]);
      // Bentuk lama tanpa literal: LOCAL_IDENTITY/MODULE_ID dipakai langsung dari
      // skrip klasik → ReferenceError yang ditelan catch → draf tidak pernah ada.
      drafMati = /localStorage\.getItem\(LOCAL_IDENTITY\)/.test(kode) && !/typeof LOCAL_IDENTITY/.test(kode);
      const dikenal = drafMati || litId.length || drafUtuh.length || cadMid.length;
      if (!dikenal) throw new Error("_draftKey berbentuk tak dikenal");
      const salah = litId.some((x) => x !== K)
        || cadMid.some((x) => x !== mid)
        || drafUtuh.some((m) => m[1] !== slug || m[2] !== mid)
        || drafAwalan.some((s) => s !== slug);
      if (salah) {
        html = html.slice(0, f.awal) + blokDraf(K) + html.slice(f.akhir);
        const lama = [...new Set([...litId.filter((x) => x !== K), ...cadMid.filter((x) => x !== mid).map((x) => "MODULE_ID:" + x)])];
        catatan.push(`_draftKey ${lama.join("/")}→${K.replace("_identity_", "_draft_")}_<nim>`);
      }
    }
  }

  // 4. LK lapisan friksi.
  {
    const rx = RX_BLOK("LK", "  ");
    const ada = (html.match(rx) || []).length;
    if (ada > 1) throw new Error(`blok KUNCI-IDENTITAS:LK muncul ${ada}x`);
    if (ada === 1) {
      const baru = html.replace(rx, () => blokLk(K));
      if (baru !== html) catatan.push("lk-diperbarui");
      html = baru;
    } else {
      const m = [...html.matchAll(/\n  const LK = '([^'\n]*)';\n/g)];
      if (m.length !== 1) throw new Error(`const LK lapisan friksi muncul ${m.length}x, harusnya 1`);
      if (m[0][1] !== K) {
        const i = m[0].index + 1, j = m[0].index + m[0][0].length;
        html = html.slice(0, i) + blokLk(K) + html.slice(j);
        catatan.push(`LK ${m[0][1]}→${K}`);
      }
    }
  }

  // 5. Penjaga hasil.
  const skripAkhir = skrip(html);
  for (const b of skripAkhir) {
    for (const x of literalIdentitas(html.slice(b.awal, b.akhir))) {
      if (x !== K) throw new Error(`literal kunci identitas '${x}' ≠ LOCAL_IDENTITY '${K}' di tempat yang belum dikenal skrip ini`);
    }
  }
  for (const nama of ["LOKAL", "DRAF", "LK"]) {
    const nBlok = (html.match(RX_BLOK(nama, nama === "LK" ? "  " : "")) || []).length;
    if (nBlok > 1) throw new Error(`blok KUNCI-IDENTITAS:${nama} muncul ${nBlok}x`);
  }
  for (const kepala of ["\nfunction getIdentityLocal() {", "\nfunction _draftKey() {", "\n  const LK = '"]) {
    if (hitung(html, kepala) !== 1) throw new Error(`${kepala.trim()} muncul ${hitung(html, kepala)}x sesudah penyuntikan, harusnya 1`);
  }
  if (!html.includes(`\n  const LK = '${K}';\n`)) throw new Error("LK lapisan friksi belum sama dengan LOCAL_IDENTITY");
  if (!literalIdentitas(fungsi(html, "getIdentityLocal").teks).every((x) => x === K)) throw new Error("getIdentityLocal belum membaca LOCAL_IDENTITY");
  if (html !== awal) {
    // Tidak ada perubahan di dalam blok AI-CHAT-AGENT (dibandingkan per rentang).
    const ra = rentangAi(awal), rb = rentangAi(html);
    if (ra.length !== rb.length || ra.some(([a, z], i) => awal.slice(a, z) !== html.slice(rb[i][0], rb[i][1]))) {
      throw new Error("suntingan menyentuh blok AI-CHAT-AGENT");
    }
    // Setiap blok baru berada di skrip klasik.
    for (const m of html.matchAll(/\/\/ KUNCI-IDENTITAS:[A-Z]+ BEGIN/g)) {
      const b = skripAkhir.find((s) => m.index >= s.awal && m.index < s.akhir);
      if (!b || b.module) throw new Error("blok KUNCI-IDENTITAS harus berada di skrip klasik");
    }
  }

  if (html === awal) return { html: null, catatan, drafMati };
  return { html: crlf ? html.replace(/\n/g, "\r\n") : html, catatan, drafMati };
}

const berkas = [];
for (const kursus of Object.keys(SLUG)) {
  const dir = path.join(root, kursus, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const nama of fs.readdirSync(dir)) {
    const m = /^Modul-(\d+)\.html$/.exec(nama);
    if (m) berkas.push({ f: path.join(dir, nama), kursus, n: Number(m[1]) });
  }
}
if (berkas.length !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${berkas.length}`);

let ubah = 0;
const rinci = [];
const drafMati = [];
for (const b of berkas.sort((x, y) => x.f.localeCompare(y.f))) {
  const rel = path.relative(root, b.f).split(path.sep).join("/");
  let h;
  try { h = proses(b.f, b.kursus, b.n); }
  catch (e) { throw new Error(`${rel}: ${e.message}`); }
  if (h.drafMati) drafMati.push(rel);
  if (!h.html) continue;
  ubah += 1;
  rinci.push(`  ${rel}: ${h.catatan.join("; ")}`);
  if (!periksa) fs.writeFileSync(b.f, h.html);
}
console.log(`${ubah} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}.`);
for (const r of rinci) console.log(r);
if (drafMati.length) {
  console.log(`Catatan: ${drafMati.length} halaman memakai _draftKey bentuk lama tanpa literal (LOCAL_IDENTITY langsung dari skrip klasik; draf tidak pernah tersimpan) — dibiarkan, lihat komentar kepala skrip.`);
}
if (periksa && ubah > 0) process.exitCode = 1;
