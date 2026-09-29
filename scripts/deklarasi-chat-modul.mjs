/**
 * Halaman modul: keadaan Chat Kelas & presence dideklarasikan, handler chat
 * diekspos ke window, dan listener chat dipasang di init sequence.
 *
 * MASALAHNYA. Kode Chat Kelas dan daftar online modul ada di skrip
 * `<script type="module">` — strict mode, jadi menugasi pengenal yang tidak
 * dideklarasikan melempar ReferenceError. Unggahan manual Getaran Mekanik
 * Modul-4 (commit 6811c36e, 28 April 2026) menghapus empat baris yang masih
 * ada di ke-83 modul lain:
 *   let onlineUsers = [];   let chatMessages = [];   let _lastSentAt = 0;
 *   window.sendChat=sendChat; window.onChatInput=onChatInput; window.onChatKey=onChatKey;
 * beserta pemanggilan `initChat();` (+ presence 1,5 detik) di init sequence;
 * sebagai gantinya presence + chat dipasang di auto-login `_handleScheduleReady`
 * (identitas tersimpan) dan di login baru mahasiswa. Akibatnya setiap snapshot
 * presence (`onlineUsers = Object.entries(data)`) dan chat (`chatMessages = …`)
 * melempar "is not defined", daftar online dan chat tidak pernah tergambar,
 * handler inline #vpChatInput/#vpChatSend (oninput/onkeydown/onclick, cakupan
 * global) melempar atau tidak melakukan apa-apa, tombol kirim tetap nonaktif,
 * dan tamu serta dosen yang baru login (jalur login dosen hanya memanggil
 * initPresence) tidak memasang listener chat.
 *
 * YANG DILAKUKAN (tiga blok bertanda, di skrip module yang memuat
 * `function initChat()` di tingkat teratas, di luar penanda AI-CHAT-AGENT; HANYA
 * bila bagiannya memang tidak ada — halaman yang sudah benar tidak disentuh):
 *   VAR    — `let` untuk setiap pengenal keadaan yang dipakai skrip itu tanpa
 *            deklarasi di tingkat teratasnya, tepat sesudah
 *            `let currentSchedule = null;` (letak dan nilai awal persis
 *            Getaran Modul-3; mendahului semua pemakaian, jadi aman dari TDZ).
 *   EKSPOR — `window.F=F` untuk sendChat/onChatInput/onChatKey yang belum ada
 *            di cakupan global (di luar blok AI), tepat sesudah
 *            `window.submitVisitor=submitVisitor;window.togglePanel=togglePanel;`.
 *            Blok AI-CHAT-AGENT membungkus window.sendChat/onChatKey yang harus
 *            sudah ada; blok itu sendiri tidak disunting (sumbernya di backend
 *            frontend-integration/modul-ai-chat.js).
 *   INIT   — `initChat();` tepat sesudah `initVisitor();` di init sequence,
 *            seperti Modul-3, ditambah timer presence 1,5 detik HANYA bila
 *            presence identitas tersimpan belum dipasang di tempat lain: tidak
 *            ada di init sequence dan tidak di auto-login `_handleScheduleReady`.
 *            Getaran Modul-4 memasangnya di auto-login, jadi timer itu tidak
 *            ditambahkan (v1 menambahkannya: initPresence jalan dua kali bagi
 *            mahasiswa yang kembali — dua pendengar visibilitychange dan
 *            tulisan heartbeat ganda; diperbaiki v2, 29 September 2026).
 * Bila bagian aslinya kelak kembali (unggahan ulang yang benar), blok yang
 * menjadi berlebih dibuang, jadi `let` tidak pernah ganda (SyntaxError).
 *
 * DETEKSI memakai scripts/pemindai-deklarasi.mjs, pemindai yang sama dengan
 * validate-public-security.mjs: komentar/string/regex dikosongkan, "tingkat
 * teratas" = kedalaman kurung 0 (bukan kolom 0), deklarator sesudah koma dan
 * pola destrukturisasi dihitung. Jadi halaman yang lolos validator tidak
 * pernah mendapat `let` kedua. Yang tidak dapat diperbaiki otomatis dihentikan
 * dengan pesan jelas: deklarasi `const` (listener menugasinya ulang) dan nama
 * yang hanya dideklarasikan di cakupan global (skrip klasik/window) — `let` di
 * skrip module akan membayanginya, jadi pindahkan deklarasinya dengan tangan.
 *
 * CAKUPAN: <Kursus>/Modul/Modul-N.html (84 halaman); saat ini hanya Getaran
 * Mekanik Modul-4 yang berubah. UTS/UAS tidak punya Chat Kelas (§6.8) dan
 * hanya diperiksa validate-public-security.mjs. Salinan konflik OneDrive
 * (*-DEDIK-PC.html) dilewati. Getaran ditulis tangan; generator TTL/CAD
 * membangun modul dari Modul-1 course-nya dan rantai Sisken mempertahankan
 * skrip module, yang ketiganya sudah lengkap, jadi `--periksa` sesudah
 * regenerasi harus 0.
 *
 * Idempoten: blok ditimpa di tempat; jalan kedua melaporkan 0 halaman.
 * Semua-atau-tidak-sama-sekali: ke-84 halaman diproses dan diperiksa di memori
 * lebih dulu (CR, jangkar, letak, blok AI tidak berubah, sintaks skrip yang
 * berubah), baru sesudah semuanya lolos halaman yang berubah ditulis. Berkas
 * ber-CR ditolak (repo LF, .gitattributes eol=lf).
 *
 * Pakai:
 *   node scripts/deklarasi-chat-modul.mjs            # terapkan
 *   node scripts/deklarasi-chat-modul.mjs --periksa  # laporan saja; exit code 1
 *                                                    # bila ada halaman yang akan berubah
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  uraiSkripInline, deklarasiLeksikal, pemakaian, fungsiTingkatAtas, panggilanTingkatAtas, namaGlobal, presenceSaatMuat, presenceAutoLogin,
} from "./pemindai-deklarasi.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const PENANDA = "DEKLARASI-CHAT-MODUL";
const VERSI = "v2";
const KEADAAN = [["onlineUsers", "[]"], ["chatMessages", "[]"], ["_lastSentAt", "0"]];
const HANDLER = ["sendChat", "onChatInput", "onChatKey"];
const JANGKAR = {
  VAR: "\nlet currentSchedule = null;\n",
  EKSPOR: "\nwindow.submitVisitor=submitVisitor;window.togglePanel=togglePanel;\n",
  INIT: "\ninitVisitor();\n",
};
const PRESENCE_INIT = "  if (me && (me.role === 'student' || me.role === 'dosen')) initPresence();\n";
const RX_BLOK = (nama) => new RegExp(`// ${PENANDA}:${nama} BEGIN[^\\n]*\\n[\\s\\S]*?// ${PENANDA}:${nama} END[^\\n]*\\n`, "g");
const RX_AI = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g;
const hitung = (s, sub) => s.split(sub).length - 1;

function blok(nama, keterangan, isi) {
  return `// ${PENANDA}:${nama} BEGIN ${VERSI} — dipasang scripts/deklarasi-chat-modul.mjs\n`
    + keterangan.map((k) => `// ${k}\n`).join("")
    + isi
    + `// ${PENANDA}:${nama} END ${VERSI}\n`;
}

/** Skrip halaman: semua skrip inline + skrip module Chat Kelas (tepat satu, di luar blok AI). */
function urai(html) {
  const skrip = uraiSkripInline(html);
  const cocok = skrip.filter((s) => s.module && !s.dalamAi && s.seimbang && fungsiTingkatAtas(s.kode, s.dalam).has("initChat"));
  if (cocok.length !== 1) {
    const takSeimbang = skrip.filter((s) => s.module && !s.dalamAi && !s.seimbang).length;
    throw new Error(`skrip module ber-\`function initChat()\` di tingkat teratas di luar blok AI ada ${cocok.length}, harusnya 1${takSeimbang ? ` (${takSeimbang} skrip module tidak dapat diurai: kurung tak seimbang sesudah komentar/string dikosongkan)` : ""}`);
  }
  for (const s of skrip) if (!s.dalamAi && !s.seimbang) throw new Error("skrip inline yang kurungnya tak seimbang sesudah komentar/string dikosongkan — pemindai tidak dapat menentukan tingkat teratas");
  return { skrip, chat: cocok[0] };
}

/** Deklarasi tingkat teratas & pemakaian pengenal `x` di skrip `s`. */
function keadaan(s, x) {
  const milik = deklarasiLeksikal(s.kode, s.dalam).filter((d) => d.nama === x);
  return { atas: milik.filter((d) => d.kedalaman === 0), pakai: pemakaian(s.kode, x, new Set(milik.map((d) => d.pos))) };
}

function proses(awal) {
  if (awal.includes("\r")) throw new Error("berkas memuat CR; repo ini LF (.gitattributes eol=lf)");
  for (const b of awal.match(RX_AI) || []) if (b.includes(PENANDA)) throw new Error(`penanda ${PENANDA} di dalam blok AI-CHAT-AGENT`);
  for (const nama of ["VAR", "EKSPOR", "INIT"]) {
    const n = (awal.match(RX_BLOK(nama)) || []).length;
    if (n > 1) throw new Error(`blok ${PENANDA}:${nama} muncul ${n}x, harusnya paling banyak 1`);
  }
  if (hitung(awal, `// ${PENANDA}:`) !== 2 * ["VAR", "EKSPOR", "INIT"].reduce((t, nama) => t + (awal.match(RX_BLOK(nama)) || []).length, 0)) {
    throw new Error(`penanda ${PENANDA} yatim (BEGIN/END tidak berpasangan)`);
  }

  // Dasar: halaman tanpa blok kita. Yang hilang dihitung dari dasar ini, jadi
  // jalan ulang menghasilkan blok yang sama, dan blok yang sudah tidak perlu
  // (bagian aslinya kembali) ikut terbuang.
  let html = awal;
  for (const nama of ["VAR", "EKSPOR", "INIT"]) html = html.replace(RX_BLOK(nama), "");
  const { skrip: semua, chat: s } = urai(html);
  const skrip = html.slice(s.mulai, s.akhir);
  const global = namaGlobal(semua);

  for (const [nama, jangkar] of Object.entries(JANGKAR)) {
    if (hitung(skrip, jangkar) !== 1) throw new Error(`jangkar ${nama} ${JSON.stringify(jangkar.trim())} di skrip chat muncul ${hitung(skrip, jangkar)}x, harusnya 1`);
    if (hitung(html, jangkar) !== 1) throw new Error(`jangkar ${nama} ${JSON.stringify(jangkar.trim())} muncul lagi di luar skrip chat`);
    if (s.dalam[skrip.indexOf(jangkar) + 1] !== 0) throw new Error(`jangkar ${nama} ${JSON.stringify(jangkar.trim())} tidak di tingkat teratas skrip chat`);
  }

  const catatan = [];
  const sisip = {};
  // VAR — pengenal yang dipakai skrip ini tanpa deklarasi tingkat teratas.
  {
    const hilang = [];
    for (const [x, v] of KEADAAN) {
      const { atas, pakai } = keadaan(s, x);
      if (!pakai.length) continue;
      if (atas.some((d) => d.jenis === "const")) throw new Error(`${x} dideklarasikan const di tingkat teratas skrip chat, padahal listener menugasinya ulang — ganti menjadi let dengan tangan`);
      if (atas.length) continue;
      if (global.has(x)) throw new Error(`${x} hanya dideklarasikan di cakupan global (skrip klasik atau window.${x}); pindahkan deklarasinya ke skrip module chat dengan tangan — injector tidak menyisipkan let yang membayangi nama global itu`);
      hilang.push([x, v]);
    }
    if (hilang.length) {
      sisip.VAR = blok("VAR", [
        "Keadaan Chat Kelas & presence milik skrip module ini (strict mode):",
        "listener presence/chat dan sendChat menugasinya, jadi tanpa deklarasi",
        "di sini halaman melempar ReferenceError (pola Getaran Modul-3).",
      ], hilang.map(([x, v]) => `let ${x} = ${v};\n`).join(""));
      catatan.push(...hilang.map(([x]) => `let ${x}`));
    }
  }
  // EKSPOR — fungsi chat skrip module yang belum ada di cakupan global (di luar blok AI).
  {
    const fungsi = fungsiTingkatAtas(s.kode, s.dalam);
    const hilang = HANDLER.filter((f) => fungsi.has(f) && !global.has(f));
    if (hilang.length) {
      sisip.EKSPOR = blok("EKSPOR", [
        "Handler inline #vpChatInput/#vpChatSend (oninput/onkeydown/onclick)",
        "berjalan di cakupan global dan tidak melihat fungsi skrip module; blok",
        "AI-CHAT-AGENT membungkus window.sendChat/onChatKey yang harus sudah ada.",
      ], hilang.map((f) => `window.${f}=${f};`).join(" ") + "\n");
      catatan.push(...hilang.map((f) => `window.${f}`));
    }
  }
  // INIT — listener chat dipasang untuk semua peran, seperti ke-83 modul lain;
  // presence identitas tersimpan hanya bila belum dipasang di tempat lain.
  if (!panggilanTingkatAtas(s.kode, s.dalam, "initChat").length) {
    const keterangan = [
      "Listener chat untuk semua peran, seperti modul lain. Tanpa ini tamu tidak",
      "pernah melihat chat, dan dosen yang baru login (jalur itu hanya memanggil",
      "initPresence) baru melihatnya sesudah memuat ulang halaman.",
    ];
    let isi = "// Init Chat listener (always — even guests/dosen can see messages)\ninitChat();\n";
    if (presenceAutoLogin(s.kode, s.dalam).length) {
      keterangan.push(
        "Presence TIDAK dipasang di sini: auto-login _handleScheduleReady sudah",
        "memanggil initPresence untuk identitas tersimpan; timer kedua membuatnya",
        "jalan dua kali (pendengar visibilitychange & tulisan heartbeat ganda).",
      );
      catatan.push("presence lewat auto-login");
    } else if (!presenceSaatMuat(s.kode, s.dalam).length) {
      isi += "// Init Presence system after small delay (waits for identity)\nsetTimeout(() => {\n  const me = getIdentity();\n" + PRESENCE_INIT + "}, 1500);\n";
      catatan.push("presence 1,5 dtk");
    }
    sisip.INIT = blok("INIT", keterangan, isi);
    catatan.push("initChat()");
  }

  // Sisipkan dari belakang ke depan supaya offset jangkar lain tetap benar.
  const urut = Object.keys(sisip).map((nama) => ({ nama, pos: s.mulai + skrip.indexOf(JANGKAR[nama]) + JANGKAR[nama].length })).sort((a, b) => b.pos - a.pos);
  for (const { nama, pos } of urut) html = html.slice(0, pos) + sisip[nama] + html.slice(pos);

  // ── Penjaga hasil (aturan yang sama dengan validate-public-security.mjs) ──
  const { skrip: semua2, chat: s2 } = urai(html);
  const global2 = namaGlobal(semua2);
  for (const [x] of KEADAAN) {
    const { atas, pakai } = keadaan(s2, x);
    if (!pakai.length) continue;
    if (atas.length !== 1 || atas[0].jenis === "const") throw new Error(`${x}: deklarasi let/var tingkat teratas di skrip chat ada ${atas.length}, harusnya 1`);
    if (pakai[0] < atas[0].pos) throw new Error(`${x} dipakai sebelum deklarasinya`);
  }
  const fungsi2 = fungsiTingkatAtas(s2.kode, s2.dalam);
  for (const f of HANDLER) if (fungsi2.has(f) && !global2.has(f)) throw new Error(`${f} belum diekspos ke window di luar blok AI`);
  if (!panggilanTingkatAtas(s2.kode, s2.dalam, "initChat").length) throw new Error("initChat(); di tingkat teratas skrip chat tidak ada");
  if (presenceAutoLogin(s2.kode, s2.dalam).length && presenceSaatMuat(s2.kode, s2.dalam).length) {
    throw new Error("initPresence dipasang dua kali untuk identitas tersimpan (auto-login _handleScheduleReady dan init sequence) — buang salah satunya dengan tangan");
  }
  const aiLama = awal.match(RX_AI) || [];
  const aiBaru = html.match(RX_AI) || [];
  if (aiLama.length !== aiBaru.length || aiLama.some((b, i) => b !== aiBaru[i])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  // Di luar skrip chat tidak ada yang berubah.
  const sLama = urai(awal).chat;
  if (awal.slice(0, sLama.mulai) !== html.slice(0, s2.mulai) || awal.slice(sLama.akhir) !== html.slice(s2.akhir)) {
    throw new Error("perubahan jatuh di luar skrip module chat");
  }

  if (html === awal) return null;
  // Sintaks skrip yang berubah (module) diperiksa node --check.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "deklarasi-chat-"));
  try {
    const f = path.join(tmp, "skrip.mjs");
    fs.writeFileSync(f, html.slice(s2.mulai, s2.akhir), "utf8");
    const cek = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    if (cek.status !== 0) throw new Error(`skrip module hasil sisipan tidak lolos node --check:\n${cek.stderr}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return { html, catatan: catatan.length ? catatan : ["blok dirapikan"] };
}

// Tahap 1 — di memori saja.
const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dir = path.join(root, kursus.name, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const nama of fs.readdirSync(dir)) if (/^Modul-\d+\.html$/.test(nama)) berkas.push(path.join(dir, nama));
}
if (berkas.length !== 84) throw new Error(`harap 84 halaman <Kursus>/Modul/Modul-N.html, ditemukan ${berkas.length}`);
const tulis = [];
for (const f of berkas.sort()) {
  const rel = path.relative(root, f).split(path.sep).join("/");
  let h;
  try { h = proses(fs.readFileSync(f, "utf8")); }
  catch (e) { throw new Error(`${rel}: ${e.message}`); }
  if (h) tulis.push({ f, rel, ...h });
}

// Tahap 2 — semua lolos: tulis halaman yang berubah.
if (!periksa) for (const { f, html } of tulis) fs.writeFileSync(f, html);
for (const { rel, catatan } of tulis) console.log(`  ${rel}: ${catatan.join(", ")}`);
console.log(`${tulis.length} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}`);
if (periksa && tulis.length > 0) process.exitCode = 1;
