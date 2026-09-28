/**
 * Halaman modul: pilihan PG yang sudah dijawab dipulihkan setelah muat ulang,
 * dan Export HTML tidak lagi melaporkan jawaban BENAR sebagai "pilihan salah".
 *
 * MASALAHNYA. Setelah halaman dimuat ulang, _loadScoredQuestions memulihkan
 * status PG dari marker RTDB (`mcN` benar, `mcN_mc_used` salah): mcAnswered/
 * mcScores diisi dan grup radio dikunci, tetapi opsi yang dipilih mahasiswa
 * tidak ditandai (komentar "PHASE 3 — … Sementara skip" di 56 halaman dan
 * ragam ASCII-nya "PHASE 3 - …" di Optimalisasi Modul 1–3, 5–14; ragam "v12.1"
 * berbasis onclick `, this, true)` di Matematika 4 Modul 1–3, 5–7 dan Getaran
 * Mekanik Modul 8–14; ragam MC_HINTS di Matematika 4 Modul 4; ragam onclick
 * `, true)` di Optimalisasi Modul 4 — tiga ragam terakhir tidak pernah cocok
 * karena kunci tidak lagi ada di klien). Akibatnya tidak ada
 * `.radio-option.selected` maupun `.correct-ans`, dan fallback ekspor
 *   selectedText = isCorrect && correctOpt ? correctOpt.textContent.trim()
 *                                          : '(Sudah dijawab, tetapi pilihan salah)';
 * mencetak "pilihan salah" untuk jawaban benar (poin 1, ✓).
 *
 * YANG DILAKUKAN (dua sisipan bertanda, sama persis di ke-84 halaman):
 *   1. PILIHAN-PG-PULIH — tepat sesudah `const data = snap.val();` di
 *      _loadScoredQuestions. Huruf yang dikirim ke checkModulAnswer sudah
 *      disimpan server di RTDB `selections[mcN]`: huruf POSISI terlihat pada
 *      course ber-PG acak per NIM (Sisken, Teknik Tenaga Listrik, Pemodelan
 *      CAD; `mcOrderVersion: 1`) dan huruf kanonik markup pada Matematika 4,
 *      Getaran Mekanik, dan Optimalisasi. Opsi yang dipilih mendapat
 *      `.selected` ditambah `.correct-ans` (benar) atau `.wrong-ans` (salah).
 *      Opsi benar untuk jawaban salah TIDAK diungkap (server hanya
 *      mengembalikan kuncinya saat submit). Pada course acak urutan per NIM
 *      diterapkan dulu (shuffleMCOptions idempoten) lalu opsi dicari lewat
 *      `data-display-letter`; bila urutan acak belum bisa diterapkan, opsi
 *      tidak ditandai. Record lama tanpa selections, atau bernilai angka pada
 *      course acak, dibiarkan (ekspor memakai teks netral di bawah). Status
 *      mcAnswered/mcScores, kunci grup, opacity, dan teks umpan balik tidak
 *      disentuh — itu tetap tugas perulangan marker di bawahnya.
 *      v2 (28 September 2026): pada course acak, huruf posisi hanya dipercaya
 *      bila `timestamp` record (kunjungan pertama; rules RTDB melarang klien
 *      mengubahnya, backend mengisinya sekali) >= 2026-08-09T00:00:00Z. Modul
 *      Sisken terbit 5 Agustus 2026 dengan onclick kanonik (6b8db6a8) dan
 *      acak per NIM baru terpasang 8 Agustus 2026 ±17:14 +08:00 (22057ba0,
 *      "Attempt lama tetap sah"; backend `mcOrderVersion`), jadi record yang
 *      lebih tua bisa menyimpan huruf KANONIK — sekitar 3 dari 4 akan menandai
 *      opsi yang salah, dan jawaban benar lalu diekspor dengan teks opsi
 *      keliru ber-✓.
 *      Record RTDB tidak mencatat jenis hurufnya, jadi record seperti itu
 *      (juga yang timestamp-nya hilang/tak terbaca) tidak ditandai dan
 *      ekspornya memakai teks netral, yang tidak pernah salah. TTL (mulai
 *      14 September) dan CAD (20 September) tidak terdampak. Batasnya
 *      sengaja jatuh ±15 jam sesudah deploy (tab lama yang masih terbuka).
 *   2. PILIHAN-PG-EKSPOR — fallback ekspor saat teks pilihan tidak diketahui:
 *      benar → "(Sudah dijawab benar — teks pilihan tidak tersedia)", salah →
 *      tetap "(Sudah dijawab, tetapi pilihan salah)", belum dijawab tidak
 *      berubah. Logika ✓/✗ dan poin tidak berubah.
 *
 * Blok AI-CHAT-AGENT tidak disentuh (diperiksa: isinya identik sebelum/
 * sesudah). Halaman ujian tidak termasuk (sudah memulihkan selections sendiri).
 *
 * REGENERASI. Generator TTL membangun Modul-1 dari Sisken Modul-1 dan Modul
 * 2–14 dari TTL Modul-1; CAD membangun Modul-1 dari TTL Modul-1 dan Modul 2–14
 * dari CAD Modul-1; enrich-sisken-modules.mjs menyunting Sisken di tempat dan
 * sisken-export-html.mjs menyalin ekor ekspor dari Sisken Modul-1. Semuanya
 * mewarisi kedua blok ini; jalankan `--periksa` sesudah regenerasi, harus 0.
 * Karena itu blok sengaja tidak memuat nama/ID course maupun nomor modul:
 * generator TTL/CAD mengganti `sistem_kendali_cerdas`/`teknik_tenaga_listrik`
 * dan "Tugas 1" secara global, sehingga jenis course dikenali dari markup
 * (huruf di onclick vs data-display-letter), sama seperti selectMC.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html (84 halaman). Salinan konflik OneDrive
 * (*-DEDIK-PC.html) dilewati.
 *
 * Idempoten: blok bertanda ditimpa di tempat bila sudah ada; jalan kedua
 * melaporkan 0 halaman.
 *
 * Pakai:
 *   node scripts/pulihkan-pilihan-pg.mjs            # terapkan
 *   node scripts/pulihkan-pilihan-pg.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const JANGKAR_DATA = "\n    const data = snap.val();\n";
const AWAL_RESTORE = "window._loadScoredQuestions = function() {";
const GET_RESTORE = "get(ref(db, DB_PATH + '/' + key)).then(snap => {";

const BLOK_PULIH = `    // PILIHAN-PG-PULIH BEGIN v2 — dipasang scripts/pulihkan-pilihan-pg.mjs
    // Pilihan PG yang sudah dijawab dipulihkan dari RTDB selections[mcN], yaitu
    // huruf yang dulu dikirim selectMC ke checkModulAnswer: huruf kanonik di
    // onclick bila markup membawanya, selain itu huruf posisi terlihat
    // (data-display-letter) dari urutan acak per NIM. Benar → .selected +
    // .correct-ans; salah → .selected + .wrong-ans tanpa mengungkap opsi benar.
    // Record lama tanpa selections dibiarkan; ekspor memakai teks netral.
    // Huruf posisi hanya dipercaya bila kunjungan pertama record (timestamp,
    // tidak bisa diubah klien) jatuh sesudah urutan acak per NIM pertama kali
    // terpasang (8 Agustus 2026): record yang lebih tua bisa menyimpan huruf
    // kanonik, dan jenis hurufnya tidak tercatat, jadi tidak ditandai.
    try {
      const pgPilihan = (data.selections && typeof data.selections === 'object') ? data.selections : {};
      const pgMulai = Date.parse(String(data.timestamp || ''));
      const pgHurufPosisiSah = Number.isFinite(pgMulai) && pgMulai >= Date.parse('2026-08-09T00:00:00Z');
      const pgStatus = {};
      String(data.scoredQuestions || '').split(',').forEach((m) => {
        if (/^mc\\d+$/.test(m)) pgStatus[m] = 'benar';
        else if (/^mc\\d+_mc_used$/.test(m)) pgStatus[m.replace(/_mc_used$/, '')] = 'salah';
      });
      // Urutan acak per NIM harus sudah terpasang sebelum huruf posisi dicocokkan
      // (idempoten; no-op pada course tanpa acak).
      if (Object.keys(pgStatus).length && typeof window.shuffleMCOptions === 'function') window.shuffleMCOptions();
      const pgHurufOnclick = (o) => {
        const m = /selectMC\\(\\s*'[^']+'\\s*,\\s*this\\s*,\\s*'([A-D])'\\s*\\)/.exec(o.getAttribute('onclick') || '');
        return m ? m[1] : null;
      };
      Object.keys(pgStatus).forEach((qId) => {
        const rg = document.getElementById('rg-' + qId);
        if (!rg) return;
        const opsi = Array.from(rg.querySelectorAll('.radio-option'));
        const kanonik = opsi.length > 0 && opsi.every((o) => pgHurufOnclick(o));
        if (!kanonik && !pgHurufPosisiSah) return;
        const nilai = pgPilihan[qId];
        let huruf = null;
        if (typeof nilai === 'string' && /^[A-D]$/i.test(nilai.trim())) huruf = nilai.trim().toUpperCase();
        else if (kanonik && typeof nilai === 'number' && Number.isInteger(nilai) && nilai >= 0 && nilai < 4) huruf = String.fromCharCode(65 + nilai);
        if (!huruf) return;
        const pilihan = kanonik
          ? opsi.find((o) => pgHurufOnclick(o) === huruf)
          : opsi.find((o) => o.dataset && o.dataset.displayLetter === huruf);
        if (!pilihan) return;
        const benar = pgStatus[qId] === 'benar';
        opsi.forEach((o) => { if (o !== pilihan) o.classList.remove('selected', 'wrong-ans'); });
        pilihan.classList.remove(benar ? 'wrong-ans' : 'correct-ans');
        pilihan.classList.add('selected', benar ? 'correct-ans' : 'wrong-ans');
      });
    } catch (e) { console.warn('[pilihan-pg] gagal memulihkan pilihan PG:', e); }
    // PILIHAN-PG-PULIH END v2
`;

const TERNARY_LAMA = `      selectedText = isCorrect && correctOpt
        ? correctOpt.textContent.trim()
        : '(Sudah dijawab, tetapi pilihan salah)';
`;
const BLOK_EKSPOR = `      // PILIHAN-PG-EKSPOR BEGIN v1 — dipasang scripts/pulihkan-pilihan-pg.mjs
      // Teks pilihan tidak diketahui (record lama tanpa selections): jawaban
      // benar tidak boleh dilaporkan sebagai "pilihan salah".
      selectedText = isCorrect && correctOpt
        ? correctOpt.textContent.trim()
        : (isCorrect
          ? '(Sudah dijawab benar — teks pilihan tidak tersedia)'
          : '(Sudah dijawab, tetapi pilihan salah)');
      // PILIHAN-PG-EKSPOR END v1
`;

const RX_BLOK_PULIH = /    \/\/ PILIHAN-PG-PULIH BEGIN[^\n]*\n[\s\S]*?    \/\/ PILIHAN-PG-PULIH END[^\n]*\n/;
const RX_BLOK_EKSPOR = /      \/\/ PILIHAN-PG-EKSPOR BEGIN[^\n]*\n[\s\S]*?      \/\/ PILIHAN-PG-EKSPOR END[^\n]*\n/;
// Bentuk lama yang menyesatkan (dipakai juga oleh validate-public-security.mjs).
const RX_TERNARY_LAMA = /isCorrect\s*&&\s*correctOpt\s*\?\s*correctOpt\.textContent\.trim\(\)\s*:\s*'\(Sudah dijawab, tetapi pilihan salah\)'/;

const hitung = (s, sub) => s.split(sub).length - 1;
const hitungRx = (s, rx) => (s.match(new RegExp(rx.source, "g")) || []).length;

/** Isi seluruh blok AI-CHAT-AGENT (HTML) — harus identik sebelum/sesudah. */
function blokAi(html) {
  return html.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || [];
}

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];
  if (html.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");

  // ── 1) Pemulihan pilihan PG di _loadScoredQuestions ──
  const adaPulih = hitungRx(html, RX_BLOK_PULIH);
  if (adaPulih > 1) throw new Error(`blok PILIHAN-PG-PULIH muncul ${adaPulih}x, harusnya 1`);
  if (adaPulih === 1) {
    const baru = html.replace(RX_BLOK_PULIH, () => BLOK_PULIH);
    if (baru !== html) catatan.push("pulih diperbarui");
    html = baru;
  } else {
    const n = hitung(html, JANGKAR_DATA);
    if (n !== 1) throw new Error(`jangkar \`const data = snap.val();\` muncul ${n}x, harusnya 1`);
    const i = html.indexOf(JANGKAR_DATA) + JANGKAR_DATA.length;
    html = html.slice(0, i) + BLOK_PULIH + html.slice(i);
    catatan.push("pulih dipasang");
  }

  // ── 2) Fallback teks ekspor ──
  const adaEkspor = hitungRx(html, RX_BLOK_EKSPOR);
  if (adaEkspor > 1) throw new Error(`blok PILIHAN-PG-EKSPOR muncul ${adaEkspor}x, harusnya 1`);
  if (adaEkspor === 1) {
    const baru = html.replace(RX_BLOK_EKSPOR, () => BLOK_EKSPOR);
    if (baru !== html) catatan.push("ekspor diperbarui");
    html = baru;
  } else {
    const n = hitung(html, TERNARY_LAMA);
    if (n !== 1) throw new Error(`fallback ekspor lama ("pilihan salah") muncul ${n}x, harusnya 1`);
    html = html.replace(TERNARY_LAMA, () => BLOK_EKSPOR);
    catatan.push("ekspor diganti");
  }

  // ── Penjaga hasil ──
  if (RX_TERNARY_LAMA.test(html)) throw new Error("fallback ekspor lama yang menyesatkan masih tertinggal");
  if (hitung(html, JANGKAR_DATA + BLOK_PULIH) !== 1) throw new Error("blok PILIHAN-PG-PULIH harus tepat sesudah `const data = snap.val();`");
  {
    // Jangkar harus berada di _loadScoredQuestions yang sesungguhnya (definisi
    // yang membaca record RTDB), bukan di fungsi lain.
    const j = html.indexOf(JANGKAR_DATA);
    const d = html.lastIndexOf(AWAL_RESTORE, j);
    if (d < 0 || !html.slice(d, j).includes(GET_RESTORE)) throw new Error("`const data = snap.val();` tidak berada di _loadScoredQuestions");
  }
  {
    // Blok ekspor harus di dalam perakitan mcData (cabang mcAnswered).
    const k = html.indexOf("      // PILIHAN-PG-EKSPOR BEGIN");
    const pra = html.slice(Math.max(0, k - 400), k);
    if (!pra.includes("} else if (mcAnswered[id]) {") || !pra.includes("isCorrect    = (mcScores[id] || 0) > 0;")) {
      throw new Error("blok PILIHAN-PG-EKSPOR tidak berada di cabang mcAnswered perakitan mcData");
    }
  }
  const aiLama = blokAi(awal), aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) {
    if (b.includes("PILIHAN-PG-")) throw new Error("sisipan PILIHAN-PG jatuh di dalam blok AI-CHAT-AGENT");
  }

  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dir = path.join(root, kursus.name, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const nama of fs.readdirSync(dir)) {
    if (/^Modul-\d+\.html$/.test(nama)) berkas.push(path.join(dir, nama));
  }
}
if (berkas.length !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${berkas.length}`);

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
console.log(`${n} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
