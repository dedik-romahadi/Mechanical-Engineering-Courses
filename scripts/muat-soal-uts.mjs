/**
 * UTS Matematika 4 dan Optimalisasi & Otomasi: mahasiswa yang kembali dengan
 * identitas tersimpan mendapat soalnya lagi.
 *
 * MASALAHNYA. Sejak bank soal kedua halaman itu dipindah ke server (#726,
 * 3 Agustus 2026) window.UTS_TF/MC/COMP_EZ/COMP_HARD baru terisi sesudah
 * _ensureUTSQuestionsLoaded() memanggil getExamQuestions. Dua pemanggil lama
 * tetap merender langsung lalu memasang flag "sudah dirender" tanpa syarat:
 *   - jaring aman init di akhir skrip modul (identitas tersimpan, +100 ms), dan
 *   - cabang auto-login _handleScheduleReady, tepat sesudah menjadwalkan
 *     _ensureUTSQuestionsLoaded() 100 ms kemudian.
 * renderUTSQuestions() return dini ("UTS questions not loaded yet") karena bank
 * belum ada, tetapi window._utsRenderedFlag tetap menjadi true. Loader lalu
 * berhenti di penjaganya — dari auto-login, saveIdentity, maupun
 * _setSessionPinHash (PIN dimasukkan ulang di tab baru) — sehingga
 * getExamQuestions tidak pernah dipanggil dan wadah soal kosong sampai
 * localStorage dibersihkan. Bila snapshot jadwal tiba sebelum
 * _activateDosenQuestionView, flag yang sama juga menahan tinjauan soal dosen.
 * Login baru tidak kena (saveIdentity memanggil loader sebelum flag terpasang).
 *
 * YANG DILAKUKAN (tiga blok bertanda, di luar penanda AI-CHAT-AGENT):
 *   FLAG      — renderUTSQuestions memasang window._utsRenderedFlag sendiri,
 *               tepat sesudah `_utsRendered = true;` (pola UTS Getaran/Sisken/
 *               TTL/CAD). Selama bank belum dimuat flag tetap false.
 *   AUTOLOGIN — cabang auto-login _handleScheduleReady hanya menjadwalkan
 *               _ensureUTSQuestionsLoaded() (+100 ms, seperti UTS lain); render
 *               langsung beserta flag-nya dibuang.
 *   INIT      — jaring aman init memanggil _ensureUTSQuestionsLoaded() untuk
 *               mahasiswa dengan identitas tersimpan (pola keenam UAS); cabang
 *               dosen (_activateDosenQuestionView +100 ms) tidak berubah.
 * Pasangan render→flag di _ensureUTSQuestionsLoaded (tepat sesudah bank diisi
 * dari respons server) dibiarkan: itu satu-satunya pasangan yang sah, sama
 * seperti di kesepuluh halaman ujian lain. Tinjauan soal dosen dan Mode Preview
 * tidak diubah (Preview tanpa identitas tidak pernah memanggil loader).
 *
 * CAKUPAN: hanya Engineering-Mathematics/Exam/UTS.html dan
 * Optimalisasi-dan-Automasi/Exam/UTS.html yang disunting. Kesepuluh
 * <Kursus>/Exam/UTS.html|UAS.html lain hanya diperiksa dengan aturan yang sama
 * dengan validate-public-security.mjs (periksaFlagRender; baris komentar `//`
 * diabaikan):
 *   1. render…Questions() yang langsung diikuti pemasangan flag render hanya
 *      boleh di dalam _ensure…QuestionsLoaded;
 *   2. flag render hanya boleh diberi nilai selain `false` di dalam
 *      render…Questions atau _ensure…QuestionsLoaded, minimal sekali;
 *   3. _ensure…QuestionsLoaded memanggil render…Questions() (bentuk
 *      pemasangan flag di loader tidak dikunci, boleh bersyarat).
 * Salinan konflik OneDrive (*-DEDIK-PC.html) tidak disentuh. Tidak ada
 * generator yang dibangun dari kedua halaman target (cad-exam/bangun.py
 * membaca TTL), jadi regenerasi tidak mengembalikan bug.
 *
 * Idempoten: blok yang sudah ada ditimpa di tempat; jalan kedua melaporkan
 * 0 halaman. Semua-atau-tidak-sama-sekali: ke-12 halaman diproses dan
 * diperiksa di memori lebih dulu (CR, aturan di atas, jumlah halaman), baru
 * sesudah semuanya lolos halaman yang berubah ditulis. Berkas ber-CR ditolak
 * (repo LF).
 *
 * Pakai:
 *   node scripts/muat-soal-uts.mjs            # terapkan
 *   node scripts/muat-soal-uts.mjs --periksa  # laporan saja; exit code 1 bila
 *                                             # ada halaman yang akan berubah
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const TARGET = new Set(["Engineering-Mathematics/Exam/UTS.html", "Optimalisasi-dan-Automasi/Exam/UTS.html"]);

// ── FLAG: renderUTSQuestions memasang flag sesudah render sukses ─────────────
const FLAG_AWAL = "  _utsRendered = true;\n";
const FLAG_EKOR = "  // Trigger reveal observer for new elements\n";
const RX_FLAG = /  \/\/ MUAT-SOAL-UTS:FLAG BEGIN[^\n]*\n[\s\S]*?  \/\/ MUAT-SOAL-UTS:FLAG END[^\n]*\n/;
const BLOK_FLAG = `  // MUAT-SOAL-UTS:FLAG BEGIN v1 — dipasang scripts/muat-soal-uts.mjs
  // _utsRenderedFlag dipasang HANYA di sini, sesudah kartu soal benar-benar
  // terender (pola UTS Getaran/Sisken/TTL/CAD). Selama window.UTS_TF belum
  // diisi getExamQuestions renderer return dini dan flag tetap false, jadi
  // _ensureUTSQuestionsLoaded masih bisa mengambil soal. Pemanggil di luar
  // loader itu tidak memasang flag sendiri.
  window._utsRenderedFlag = true;
  // MUAT-SOAL-UTS:FLAG END v1
`;

// ── AUTOLOGIN: _handleScheduleReady hanya menjadwalkan loader ────────────────
const AUTOLOGIN_LAMA = `      // Jaring aman: identity & sesi PIN sudah ada dari kunjungan sebelumnya.
      if (typeof window._ensureUTSQuestionsLoaded === 'function' && !window._utsRenderedFlag) {
        setTimeout(() => window._ensureUTSQuestionsLoaded(), 100);
      }
      // UTS: Render questions FIRST sebelum _loadScoredQuestions agar DOM ready
      if (typeof window.renderUTSQuestions === 'function' && !window._utsRenderedFlag) {
        try { window.renderUTSQuestions(); window._utsRenderedFlag = true; }
        catch(e) { console.error('renderUTSQuestions error:', e); }
      }
`;
const RX_AUTOLOGIN = /      \/\/ MUAT-SOAL-UTS:AUTOLOGIN BEGIN[^\n]*\n[\s\S]*?      \/\/ MUAT-SOAL-UTS:AUTOLOGIN END[^\n]*\n/;
const BLOK_AUTOLOGIN = `      // MUAT-SOAL-UTS:AUTOLOGIN BEGIN v1 — dipasang scripts/muat-soal-uts.mjs
      // Jaring aman: identity & sesi PIN sudah ada dari kunjungan sebelumnya.
      // Soal diambil dari server (getExamQuestions) lalu dirender DI DALAM
      // _ensureUTSQuestionsLoaded; flag render hanya terpasang sesudah render
      // sukses. Renderer sengaja tidak dipanggil langsung di sini: tanpa soal
      // ia return dini, dan flag yang dulu dipasang sesudahnya menahan loader
      // (juga dari saveIdentity dan _setSessionPinHash), sehingga mahasiswa
      // yang kembali tidak pernah mendapat soal.
      if (typeof window._ensureUTSQuestionsLoaded === 'function' && !window._utsRenderedFlag) {
        setTimeout(() => window._ensureUTSQuestionsLoaded(), 100);
      }
      // MUAT-SOAL-UTS:AUTOLOGIN END v1
`;

// ── INIT: jaring aman init memanggil loader (pola UAS) ───────────────────────
const INIT_KEPALA = "// ─── Init sequence (urutan penting) ───\n";
const INIT_EKOR = "setTimeout(window._loadScoredQuestions, 1200);\n";
const INIT_LAMA = `// UTS: render TF/MC/Comp HANYA setelah identity tersedia (untuk param NIM-based).
// renderUTSQuestions otomatis dipanggil dari saveIdentity() / auto-login flow.
// Untuk dosen/admin yang langsung masuk tanpa login (jika ada), juga di-render saat
// _loadScoredQuestions trigger.
initVisitor();
// Safety: jika ada returning user dengan identity sudah cached, render segera.
if (typeof getIdentity === 'function') {
  const _me = getIdentity();
  if (_me && _me.role === 'dosen' && typeof window._activateDosenQuestionView === 'function') {
    setTimeout(() => window._activateDosenQuestionView(), 100);
  } else if (_me && _me.nim && typeof renderUTSQuestions === 'function' && !window._utsRenderedFlag) {
    setTimeout(() => {
      try { renderUTSQuestions(); window._utsRenderedFlag = true; }
      catch(e) { console.error('renderUTSQuestions early error:', e); }
    }, 100);
  }
}
`;
const RX_INIT = /\/\/ MUAT-SOAL-UTS:INIT BEGIN[^\n]*\n[\s\S]*?\/\/ MUAT-SOAL-UTS:INIT END[^\n]*\n/;
const BLOK_INIT = `// MUAT-SOAL-UTS:INIT BEGIN v1 — dipasang scripts/muat-soal-uts.mjs
// UTS: fetch+render soal (server-gated, getExamQuestions) HANYA setelah
// identity + sesi PIN tersedia — pola UAS. _ensureUTSQuestionsLoaded dipanggil
// dari saveIdentity(), auto-login _handleScheduleReady, dan _setSessionPinHash()
// (PIN dimasukkan ulang di tab baru); dosen lewat _activateDosenQuestionView.
initVisitor();
// Safety: returning user dengan identity tersimpan — coba muat segera (no-op
// bila sesi PIN belum ada; dicoba lagi oleh _setSessionPinHash). Flag render
// tidak dipasang di sini: renderer memasangnya sendiri sesudah render sukses.
if (typeof getIdentity === 'function') {
  const _me = getIdentity();
  if (_me && _me.role === 'dosen' && typeof window._activateDosenQuestionView === 'function') {
    setTimeout(() => window._activateDosenQuestionView(), 100);
  } else if (_me && _me.nim && typeof window._ensureUTSQuestionsLoaded === 'function' && !window._utsRenderedFlag) {
    setTimeout(() => window._ensureUTSQuestionsLoaded(), 100);
  }
}
// MUAT-SOAL-UTS:INIT END v1
`;

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;
const barisDi = (s, i) => s.slice(0, i).split("\n").length;

/** Badan fungsi dari `awal` sampai "\n}\n" pertama (cara validate-public-security.mjs). */
function ambilFungsi(html, awal) {
  const i = html.indexOf(awal);
  const j = i < 0 ? -1 : html.indexOf("\n}\n", i);
  if (i < 0 || j < 0) throw new Error(`${awal} tidak ditemukan`);
  if (html.indexOf(awal, i + 1) >= 0) throw new Error(`${awal} muncul lebih dari sekali`);
  return { awal: i, akhir: j + 3 };
}

/** Blok AI-CHAT-AGENT (HTML) — harus identik sebelum/sesudah. */
const blokAi = (html) => html.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || [];

/**
 * Aturan flag render — sama dengan periksaFlagRender di
 * validate-public-security.mjs (ubah keduanya bersama). Baris komentar `//`
 * diabaikan.
 */
function periksaFlagRender(html, jenis) {
  const pemuat = ambilFungsi(html, `async function _ensure${jenis}QuestionsLoaded() {`);
  const perender = ambilFungsi(html, `function render${jenis}Questions() {`);
  const di = (r, i) => i >= r.awal && i < r.akhir;
  const komentar = (i) => /(?:^|[^:])\/\//.test(html.slice(html.lastIndexOf("\n", i - 1) + 1, i));
  const kode = (rx) => [...html.matchAll(rx)].filter((m) => !komentar(m.index));
  for (const m of kode(/(?<![\w$])render(U[TA]S)Questions\s*(?:\?\.\s*)?\(\s*\)\s*;?\s*(?:window\.)?_u[ta]sRenderedFlag\s*=\s*true\b/g)) {
    if (di(pemuat, m.index)) continue;
    throw new Error(`baris ${barisDi(html, m.index)}: render${m[1]}Questions() langsung diikuti pemasangan flag render di luar _ensure${jenis}QuestionsLoaded ("${m[0].replace(/\s+/g, " ")}")`);
  }
  let dipasang = 0;
  for (const m of kode(/(?<![\w$])_u[ta]sRenderedFlag\s*=(?!=)(?!\s*false\b)/g)) {
    if (di(pemuat, m.index) || di(perender, m.index)) { dipasang += 1; continue; }
    throw new Error(`baris ${barisDi(html, m.index)}: flag render dipasang di luar render${jenis}Questions/_ensure${jenis}QuestionsLoaded`);
  }
  if (dipasang === 0) throw new Error(`flag render tidak pernah dipasang di render${jenis}Questions maupun _ensure${jenis}QuestionsLoaded`);
  if (!kode(/(?<![\w$])render(U[TA]S)Questions\s*(?:\?\.\s*)?\(\s*\)/g).some((m) => m[1] === jenis && di(pemuat, m.index))) {
    throw new Error(`_ensure${jenis}QuestionsLoaded harus memanggil render${jenis}Questions() sesudah soal dimuat`);
  }
}

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

function prosesTarget(awal) {
  let html = awal;
  const catatan = [];

  html = pasang(html, RX_FLAG, BLOK_FLAG, "flag", catatan, (h) => {
    const n = hitung(h, FLAG_AWAL + FLAG_EKOR);
    if (n !== 1) throw new Error(`\`_utsRendered = true;\` + komentar reveal observer (renderUTSQuestions) muncul ${n}x, harusnya 1`);
    return h.replace(FLAG_AWAL + FLAG_EKOR, () => FLAG_AWAL + BLOK_FLAG + FLAG_EKOR);
  });

  html = pasang(html, RX_AUTOLOGIN, BLOK_AUTOLOGIN, "autologin", catatan, (h) => {
    const n = hitung(h, AUTOLOGIN_LAMA);
    if (n !== 1) throw new Error(`render+flag auto-login _handleScheduleReady (teks lama) muncul ${n}x, harusnya 1`);
    return h.replace(AUTOLOGIN_LAMA, () => BLOK_AUTOLOGIN);
  });

  html = pasang(html, RX_INIT, BLOK_INIT, "init", catatan, (h) => {
    const n = hitung(h, INIT_KEPALA + INIT_LAMA + INIT_EKOR);
    if (n !== 1) throw new Error(`jaring aman init (teks lama, sebelum setTimeout(window._loadScoredQuestions, 1200)) muncul ${n}x, harusnya 1`);
    return h.replace(INIT_KEPALA + INIT_LAMA + INIT_EKOR, () => INIT_KEPALA + BLOK_INIT + INIT_EKOR);
  });

  // Penjaga hasil: tiap blok tepat sekali dan di tempatnya.
  for (const [rx, label] of [[RX_FLAG, "flag"], [RX_AUTOLOGIN, "autologin"], [RX_INIT, "init"]]) {
    if (hitungRx(html, rx) !== 1) throw new Error(`blok ${label} harus tepat 1x`);
  }
  {
    const r = ambilFungsi(html, "function renderUTSQuestions() {");
    const i = html.indexOf(FLAG_AWAL + BLOK_FLAG + FLAG_EKOR);
    if (i < r.awal || i >= r.akhir || hitung(html, FLAG_AWAL + BLOK_FLAG) !== 1) {
      throw new Error("blok FLAG tidak tepat sesudah `_utsRendered = true;` di renderUTSQuestions");
    }
  }
  {
    const f = ambilFungsi(html, "function _handleScheduleReady() {");
    const i = html.indexOf(BLOK_AUTOLOGIN);
    if (i < f.awal || i >= f.akhir) throw new Error("blok AUTOLOGIN tidak di dalam _handleScheduleReady");
    if (html.slice(f.awal, f.akhir).includes("renderUTSQuestions()")) throw new Error("_handleScheduleReady masih merender soal langsung");
    // Tetap di cabang auto-login: sesudah overlay disembunyikan.
    if (html.lastIndexOf("      overlay.classList.add('hidden');\n", i) < f.awal) throw new Error("blok AUTOLOGIN tidak di cabang auto-login _handleScheduleReady");
  }
  if (hitung(html, INIT_KEPALA + BLOK_INIT + INIT_EKOR) !== 1) {
    throw new Error("blok INIT tidak tepat di antara kepala init sequence dan setTimeout(window._loadScoredQuestions, 1200)");
  }
  if (html.includes(AUTOLOGIN_LAMA) || html.includes(INIT_LAMA)) throw new Error("teks lama AUTOLOGIN/INIT masih tertinggal");
  // Satu-satunya panggilan renderer ada di loader.
  {
    const loader = ambilFungsi(html, "async function _ensureUTSQuestionsLoaded() {");
    const panggil = [...html.matchAll(/renderUTSQuestions\(\);/g)];
    if (panggil.length !== 1 || panggil[0].index < loader.awal || panggil[0].index >= loader.akhir) {
      throw new Error(`renderUTSQuestions() harus hanya dipanggil dari _ensureUTSQuestionsLoaded, ditemukan ${panggil.length} panggilan`);
    }
  }
  // Tidak menyentuh blok AI-CHAT-AGENT.
  const aiLama = blokAi(awal);
  const aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) if (b.includes("MUAT-SOAL-UTS")) throw new Error("sisipan MUAT-SOAL-UTS jatuh di dalam blok AI-CHAT-AGENT");

  return { html, catatan };
}

// Tahap 1 — di memori saja: baca, proses, dan periksa ke-12 halaman. Galat apa
// pun (berkas ber-CR, aturan flag render, jangkar hilang, jumlah halaman)
// menghentikan skrip sebelum satu berkas pun ditulis.
let total = 0;
const tulis = [];
const rekap = {};
for (const kursus of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!kursus.isDirectory()) continue;
  for (const jenis of ["UTS", "UAS"]) {
    const f = path.join(root, kursus.name, "Exam", `${jenis}.html`);
    if (!fs.existsSync(f)) continue;
    total += 1;
    const rel = path.relative(root, f).split(path.sep).join("/");
    try {
      const awal = fs.readFileSync(f, "utf8");
      if (awal.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
      if (!TARGET.has(rel)) {
        if (awal.includes("MUAT-SOAL-UTS")) throw new Error("penanda MUAT-SOAL-UTS di luar cakupan skrip ini");
        periksaFlagRender(awal, jenis);
        continue;
      }
      const h = prosesTarget(awal);
      periksaFlagRender(h.html, jenis);
      if (h.html === awal) continue;
      tulis.push({ f, html: h.html });
      for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
    } catch (e) {
      throw new Error(`${rel}: ${e.message}`);
    }
  }
}
if (total !== 12) throw new Error(`harap 12 halaman <Kursus>/Exam/UTS.html|UAS.html, ditemukan ${total}`);
const hilang = [...TARGET].filter((rel) => !fs.existsSync(path.join(root, rel)));
if (hilang.length) throw new Error(`halaman target tidak ada: ${hilang.join(", ")}`);

// Tahap 2 — semua lolos: tulis halaman yang berubah.
if (!periksa) for (const { f, html } of tulis) fs.writeFileSync(f, html);
console.log(`${tulis.length} dari ${total} halaman ujian ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
if (periksa && tulis.length > 0) process.exitCode = 1;
