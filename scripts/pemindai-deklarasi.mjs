/**
 * Pemindai leksikal ringan untuk skrip inline halaman modul/ujian (tanpa
 * dependensi; repo ini tidak memasang parser JS). Dipakai BERSAMA oleh
 * scripts/validate-public-security.mjs dan scripts/deklarasi-chat-modul.mjs,
 * supaya validator dan injector sepakat soal "dideklarasikan di tingkat
 * teratas", "fungsi tingkat teratas", dan "nama global" — tinjauan 29 September
 * 2026 menemukan injector (regex kolom 0) dan validator (kedalaman kurung)
 * berselisih: deklarasi ber-indentasi atau `let a = [], b = [];` lolos
 * validator, lalu injector menyisipkan `let` kedua dan berhenti di node --check.
 *
 * Semua fungsi bekerja pada kode yang komentar, string, templat (di luar
 * `${…}`), dan regex-nya sudah dikosongkan (kodeTanpaLiteral: panjang dan
 * baris tetap, jadi posisi tetap sama dengan teks aslinya) dan kedalaman kurung
 * per posisi (kedalamanKurung). "Tingkat teratas" = kedalaman kurung 0.
 */

const KATA_SEBELUM_REGEX = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "instanceof", "yield", "await"]);
const RX_AI = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g;
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Isi komentar, string, templat (di luar ${…}), dan regex menjadi spasi; panjang dan baris tetap. */
export function kodeTanpaLiteral(code) {
  const out = code.split("");
  const n = code.length;
  const kosongkan = (a, b) => { for (let k = a; k < b && k < n; k += 1) if (out[k] !== "\n") out[k] = " "; };
  const tumpukan = [];   // kedalaman kurawal tiap ${…} templat yang sedang terbuka
  let akhir = "";        // karakter bermakna terakhir
  let kata = "";         // kata terakhir bila `akhir` bagian dari pengenal
  const templat = (i) => {
    let j = i;
    while (j < n) {
      if (code[j] === "\\") { kosongkan(j, j + 2); j += 2; continue; }
      if (code[j] === "`") return j + 1;
      if (code[j] === "$" && code[j + 1] === "{") { tumpukan.push(0); return j + 2; }
      kosongkan(j, j + 1); j += 1;
    }
    return n;
  };
  let i = 0;
  while (i < n) {
    const c = code[i], d = code[i + 1];
    if (c === "/" && d === "/") { const j = code.indexOf("\n", i); const e = j < 0 ? n : j; kosongkan(i, e); i = e; continue; }
    if (c === "/" && d === "*") { const j = code.indexOf("*/", i + 2); const e = j < 0 ? n : j + 2; kosongkan(i, e); i = e; continue; }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n && code[j] !== c && code[j] !== "\n") j += code[j] === "\\" ? 2 : 1;
      kosongkan(i + 1, j); i = j + 1; akhir = "a"; kata = ""; continue;
    }
    if (c === "`") { i = templat(i + 1); akhir = "a"; kata = ""; continue; }
    if (c === "/" && (akhir === "" || /[(,=:[!&|?{};+\-*%<>~^]/.test(akhir) || KATA_SEBELUM_REGEX.has(kata))) {
      let j = i + 1, kelas = false;
      while (j < n && code[j] !== "\n") {
        if (code[j] === "\\") { j += 2; continue; }
        if (kelas) { if (code[j] === "]") kelas = false; } else if (code[j] === "[") kelas = true; else if (code[j] === "/") break;
        j += 1;
      }
      kosongkan(i + 1, j); j += 1;
      while (j < n && /[a-z]/i.test(code[j])) j += 1;
      i = j; akhir = "a"; kata = ""; continue;
    }
    if (tumpukan.length && c === "{") tumpukan[tumpukan.length - 1] += 1;
    if (tumpukan.length && c === "}") {
      if (tumpukan[tumpukan.length - 1] === 0) { tumpukan.pop(); i = templat(i + 1); akhir = "a"; kata = ""; continue; }
      tumpukan[tumpukan.length - 1] -= 1;
    }
    if (/[\w$]/.test(c)) { kata = /[\w$]/.test(akhir) ? kata + c : c; akhir = c; }
    else if (!/\s/.test(c)) { akhir = c; kata = ""; }
    i += 1;
  }
  return out.join("");
}

/** Kedalaman kurung ({[ sebelum tiap posisi; `seimbang` false bila kurung tidak berpasangan. */
export function kedalamanKurung(kode) {
  const dalam = new Int32Array(kode.length + 1);
  let k = 0, min = 0;
  for (let i = 0; i < kode.length; i += 1) {
    dalam[i] = k;
    const c = kode[i];
    if (c === "{" || c === "(" || c === "[") k += 1;
    else if (c === "}" || c === ")" || c === "]") { k -= 1; if (k < min) min = k; }
  }
  dalam[kode.length] = k;
  return { dalam, seimbang: k === 0 && min === 0 };
}

/**
 * Semua pengikatan let/var/const: [{ nama, pos, jenis, kedalaman }], `kedalaman`
 * = kedalaman kata kuncinya (0 = tingkat teratas). Menangani beberapa
 * deklarator dalam satu pernyataan (`let a = [], b = [];`), pola
 * destrukturisasi larik/objek (bersarang, nilai bawaan, rest, kunci terhitung),
 * dan akhir pernyataan tanpa titik koma (ASI: baris baru sesudah token penutup
 * ekspresi, lalu pengenal). Pola yang tidak dapat diurai berhenti diam-diam;
 * pemakainya lalu melihat pengenal itu sebagai TIDAK dideklarasikan (gagal
 * keras, tidak pernah meloloskan).
 */
export function deklarasiLeksikal(k, dalam) {
  const hasil = [];
  const n = k.length;
  const spasi = (i) => { while (i < n && /\s/.test(k[i])) i += 1; return i; };
  // Lewati ekspresi sampai `,`/`;` pada kedalaman relatif 0 atau penutup yang
  // tidak dibuka di dalamnya. `pernyataan`: baris baru mengakhiri ekspresi bila
  // token sebelumnya bisa mengakhiri ekspresi dan token sesudahnya pengenal.
  const ekspresi = (i, pernyataan) => {
    let d = 0, akhir = "";
    while (i < n) {
      const c = k[i];
      if (c === "\n" && pernyataan && d === 0 && /[\w$)\]}'"`]/.test(akhir)) {
        const j = spasi(i);
        if (j < n && /[A-Za-z_$]/.test(k[j])) return i;
      }
      if (c === "(" || c === "[" || c === "{") d += 1;
      else if (c === ")" || c === "]" || c === "}") { if (d === 0) return i; d -= 1; }
      else if (d === 0 && (c === "," || c === ";")) return i;
      if (!/\s/.test(c)) akhir = c;
      i += 1;
    }
    return i;
  };
  const pengenal = (i) => { const m = /[A-Za-z_$][\w$]*/y; m.lastIndex = i; const r = m.exec(k); return r ? r[0] : null; };
  const ikatan = (i, catat) => {
    i = spasi(i);
    if (k[i] === "[" || k[i] === "{") {
      const objek = k[i] === "{";
      const tutup = objek ? "}" : "]";
      i += 1;
      for (;;) {
        i = spasi(i);
        if (i >= n) return -1;
        if (k[i] === tutup) return i + 1;
        if (!objek && k[i] === ",") { i += 1; continue; }            // lubang larik
        if (k.startsWith("...", i)) { i = ikatan(i + 3, catat); if (i < 0) return -1; }
        else if (objek) {
          const awal = i;
          let singkat = null;
          if (k[i] === "[") { i = ekspresi(i + 1, false); if (k[i] !== "]") return -1; i += 1; }
          else if (k[i] === "'" || k[i] === '"') { const j = k.indexOf(k[i], i + 1); if (j < 0) return -1; i = j + 1; }
          else { const m = /[\w$]+/y; m.lastIndex = i; const r = m.exec(k); if (!r) return -1; if (/^[A-Za-z_$]/.test(r[0])) singkat = r[0]; i += r[0].length; }
          i = spasi(i);
          if (k[i] === ":") { i = ikatan(i + 1, catat); if (i < 0) return -1; }
          else if (singkat) catat(singkat, awal);
          else return -1;
        } else { i = ikatan(i, catat); if (i < 0) return -1; }
        i = spasi(i);
        if (k[i] === "=") i = spasi(ekspresi(i + 1, false));
        if (k[i] === ",") { i += 1; continue; }
        if (k[i] === tutup) return i + 1;
        return -1;
      }
    }
    const nama = pengenal(i);
    if (!nama) return -1;
    catat(nama, i);
    return i + nama.length;
  };
  for (const m of k.matchAll(/(?<![\w$.])(let|var|const)(?=[\s[{])/g)) {
    const kedalaman = dalam[m.index];
    const catat = (nama, pos) => hasil.push({ nama, pos, jenis: m[1], kedalaman });
    let i = m.index + m[1].length;
    for (;;) {
      i = ikatan(i, catat);
      if (i < 0) break;
      i = spasi(i);
      if (k[i] === "=") i = spasi(ekspresi(i + 1, true));
      if (k[i] !== ",") break;
      i += 1;
    }
  }
  return hasil;
}

/**
 * Posisi pemakaian `x` (bukan pengikatan di `ikat`, bukan akses anggota `a.x`
 * — spread `...x` tetap pemakaian —, bukan `typeof x`, bukan kunci objek
 * literal `{ x: … }`).
 */
export function pemakaian(k, x, ikat = new Set()) {
  const hasil = [];
  for (const m of k.matchAll(new RegExp(`(?<![\\w$])${esc(x)}(?![\\w$])`, "g"))) {
    const p = m.index;
    if (ikat.has(p)) continue;
    if (k[p - 1] === "." && !(k[p - 2] === "." && k[p - 3] === ".")) continue;
    const sebelum = k.slice(Math.max(0, p - 12), p);
    if (/typeof\s+$/.test(sebelum)) continue;
    if (/[{,]\s*$/.test(sebelum) && /^\s*:/.test(k.slice(p + x.length, p + x.length + 4))) continue;
    hasil.push(p);
  }
  return hasil;
}

/** Fungsi tingkat teratas: Map nama → posisi kata `function`. */
export function fungsiTingkatAtas(k, dalam) {
  const hasil = new Map();
  for (const m of k.matchAll(/(?<![\w$.])(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
    if (dalam[m.index] === 0 && !hasil.has(m[1])) hasil.set(m[1], m.index);
  }
  return hasil;
}

/** [awal, akhir) badan fungsi tingkat teratas `nama` (termasuk kurawalnya), atau null. */
export function badanFungsi(k, dalam, nama) {
  const pos = fungsiTingkatAtas(k, dalam).get(nama);
  if (pos === undefined) return null;
  let i = k.indexOf("(", pos);
  while (i < k.length && !(k[i] === "{" && dalam[i] === 0)) i += 1;
  if (i >= k.length) return null;
  let j = i + 1;
  while (j < k.length && !(k[j] === "}" && dalam[j] === 1)) j += 1;
  return j < k.length ? [i, j + 1] : null;
}

/** Posisi pernyataan panggilan `nama();` di tingkat teratas. */
export function panggilanTingkatAtas(k, dalam, nama) {
  return [...k.matchAll(new RegExp(`(?<![\\w$.])${esc(nama)}\\s*\\(\\s*\\)\\s*;`, "g"))].filter((m) => dalam[m.index] === 0).map((m) => m.index);
}

/**
 * Panggilan initPresence di init sequence (dijalankan saat halaman dimuat):
 * pernyataan tingkat teratas `initPresence();` atau rujukan initPresence di
 * dalam `setTimeout(…)` tingkat teratas (timer presence 1,5 detik modul).
 */
export function presenceSaatMuat(k, dalam) {
  const hasil = panggilanTingkatAtas(k, dalam, "initPresence");
  for (const m of k.matchAll(/(?<![\w$.])setTimeout\s*\(/g)) {
    if (dalam[m.index] !== 0) continue;
    const buka = m.index + m[0].length - 1;
    let tutup = buka + 1;
    while (tutup < k.length && !(k[tutup] === ")" && dalam[tutup] === 1)) tutup += 1;
    for (const p of pemakaian(k.slice(buka, tutup), "initPresence")) hasil.push(buka + p);
  }
  return hasil.sort((a, b) => a - b);
}

/**
 * Rujukan initPresence (bukan `typeof`) di badan `_handleScheduleReady`, yaitu
 * auto-login identitas tersimpan (Getaran Modul-4 memasang presence + chat di
 * sana). Modul lain memasang presence identitas tersimpan lewat init sequence.
 */
export function presenceAutoLogin(k, dalam) {
  const badan = badanFungsi(k, dalam, "_handleScheduleReady");
  return badan ? pemakaian(k.slice(badan[0], badan[1]), "initPresence").map((p) => badan[0] + p) : [];
}

/**
 * Skrip inline halaman (tanpa `src`): { mulai, akhir (isi skrip di halaman),
 * dalamAi, module, kode, dalam, seimbang }. Skrip di dalam blok AI-CHAT-AGENT
 * tidak diurai (kode/dalam null).
 */
export function uraiSkripInline(page) {
  const ai = [...page.matchAll(RX_AI)].map((m) => [m.index, m.index + m[0].length]);
  const hasil = [];
  for (const m of page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    const mulai = m.index + m[0].indexOf(">") + 1;
    const akhir = mulai + m[2].length;
    const dalamAi = ai.some(([a, b]) => mulai >= a && mulai < b);
    const module = /type\s*=\s*["']module["']/i.test(m[1]);
    if (dalamAi) { hasil.push({ mulai, akhir, dalamAi, module, kode: null, dalam: null, seimbang: true }); continue; }
    const kode = kodeTanpaLiteral(m[2]);
    const { dalam, seimbang } = kedalamanKurung(kode);
    hasil.push({ mulai, akhir, dalamAi, module, kode, dalam, seimbang });
  }
  return hasil;
}

/**
 * Nama yang ada di cakupan global halaman, di luar blok AI-CHAT-AGENT:
 * deklarasi tingkat teratas skrip klasik (let/const/var/class/function) dan
 * penugasan window/globalThis/self.X = … atau Object.assign(window, {…}) di
 * skrip mana pun. Handler inline on…="F()" hanya melihat nama-nama ini.
 */
export function namaGlobal(skrip) {
  const global = new Set();
  for (const s of skrip) {
    if (s.dalamAi) continue;
    if (!s.module) {
      for (const nama of fungsiTingkatAtas(s.kode, s.dalam).keys()) global.add(nama);
      for (const d of deklarasiLeksikal(s.kode, s.dalam)) if (d.kedalaman === 0) global.add(d.nama);
      for (const m of s.kode.matchAll(/(?<![\w$.])class\s+([A-Za-z_$][\w$]*)/g)) if (s.dalam[m.index] === 0) global.add(m[1]);
    }
    for (const m of s.kode.matchAll(/(?<![\w$.])(?:window|globalThis|self)\s*\.\s*([A-Za-z_$][\w$]*)\s*=(?![=>])/g)) global.add(m[1]);
    for (const m of s.kode.matchAll(/Object\.assign\(\s*window\s*,\s*\{([^}]*)\}/g)) for (const k of m[1].split(",")) { const nm = k.split(":")[0].trim(); if (nm) global.add(nm); }
  }
  return global;
}
