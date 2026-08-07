/**
 * Mengubah rumus yang ditulis apa adanya pada data materi menjadi LaTeX.
 *
 * Kolom rumus di sisken-materi.mjs ditulis dalam bentuk ASCII biasa, misalnya
 * "T(s) = wn^2/(s^2 + 2*z*wn*s + wn^2)". Modul 1 menampilkan persamaan sebagai
 * matematika tersusun lewat KaTeX, jadi ruas yang memang persamaan diubah ke
 * LaTeX lalu dibungkus \( \). Ruas yang sebenarnya kalimat biasa — misalnya
 * "urutan baca: nilai akhir -> kecepatan" — sengaja dibiarkan sebagai teks
 * supaya tidak berubah menjadi rumus palsu.
 */

const SIMBOL = [
  // Penguatan dan waktu tala ditulis bersubskrip seperti pada Modul 1.
  [/(?<![A-Za-z0-9\\])Kp(?![A-Za-z0-9])/g, "K_p"], [/(?<![A-Za-z0-9\\])Ki(?![A-Za-z0-9])/g, "K_i"], [/(?<![A-Za-z0-9\\])Kd(?![A-Za-z0-9])/g, "K_d"], [/(?<![A-Za-z0-9\\])Ku(?![A-Za-z0-9])/g, "K_u"],
  [/(?<![A-Za-z0-9\\])Kt(?![A-Za-z0-9])/g, "K_t"], [/(?<![A-Za-z0-9\\])Ti(?![A-Za-z0-9])/g, "T_i"], [/(?<![A-Za-z0-9\\])Td(?![A-Za-z0-9])/g, "T_d"], [/(?<![A-Za-z0-9\\])Tu(?![A-Za-z0-9])/g, "T_u"],
  [/(?<![A-Za-z0-9\\])Mp(?![A-Za-z0-9])/g, "M_p"], [/(?<![A-Za-z0-9\\])ess(?![A-Za-z0-9])/g, "e_{ss}"],
  [/\btau_cl\b/g, "\\tau_{cl}"],
  [/(?<![A-Za-z0-9\\])wn(?![A-Za-z0-9])/g, "\\omega_n"],
  [/(?<![A-Za-z0-9\\])wd(?![A-Za-z0-9])/g, "\\omega_d"],
  [/(?<![A-Za-z0-9\\])omega(?![A-Za-z0-9])/g, "\\omega"],
  [/(?<![A-Za-z0-9\\])tau(?![A-Za-z0-9])/g, "\\tau"],
  [/(?<![A-Za-z0-9\\])pi(?![A-Za-z0-9])/g, "\\pi"],
  [/(?<![A-Za-z0-9\\])zeta(?![A-Za-z0-9])/g, "\\zeta"],
  [/(?<![A-Za-z0-9\\])Delta(?![A-Za-z0-9])/g, "\\Delta"],
  [/(?<![A-Za-z0-9\\])Sigma(?![A-Za-z0-9])/g, "\\Sigma"],
  [/(?<![A-Za-z0-9\\])inf(?![A-Za-z0-9])/g, "\\infty"],
  [/(?<![A-Za-z0-9\\])det(?![A-Za-z0-9])/g, "\\det"],
  [/(?<![A-Za-z0-9\\])ln(?![A-Za-z0-9])/g, "\\ln"],
  [/(?<![A-Za-z0-9\\])log10(?![A-Za-z0-9])/g, "\\log_{10}"],
  [/(?<![A-Za-z0-9\\])log(?![A-Za-z0-9])/g, "\\log"],
  [/(?<![A-Za-z0-9\\])sin(?![A-Za-z0-9])/g, "\\sin"],
  [/(?<![A-Za-z0-9\\])cos(?![A-Za-z0-9])/g, "\\cos"],
  [/(?<![A-Za-z0-9\\])tan(?![A-Za-z0-9])/g, "\\tan"],
  [/(?<![A-Za-z0-9\\])lim(?![A-Za-z0-9])/g, "\\lim"],
  [/(?<![A-Za-z0-9\\])sum(?![A-Za-z0-9])/g, "\\sum"],
  [/(?<![A-Za-z0-9\\])mu(?![A-Za-z0-9])/g, "\\mu"],
  [/(?<![A-Za-z0-9\\])alpha(?![A-Za-z0-9])/g, "\\alpha"],
  [/(?<![A-Za-z0-9\\])beta(?![A-Za-z0-9])/g, "\\beta"],
  [/(?<![A-Za-z0-9\\])theta(?![A-Za-z0-9])/g, "\\theta"],
  // Sisa kata sqrt/exp yang tidak berkurung tetap diubah menjadi perintah.
  // Lookbehind mencegah \sqrt hasil pengubahan sebelumnya tergandakan
  // menjadi \\sqrt, yang membuat KaTeX menolak seluruh ekspresi.
  [/(?<!\\)\bsqrt\b/g, "\\sqrt"],
];

const PENGGANTI = [
  [/<=>/g, "\\Leftrightarrow"],
  [/<->/g, "\\leftrightarrow"],
  // Spasi di belakang perlu supaya perintah tidak menempel pada lambang
  // berikutnya, mis. "s->inf" jangan menjadi \toinf.
  [/=>/g, "\\Rightarrow "],
  [/->/g, "\\to "],
  [/<=/g, "\\le "],
  [/>=/g, "\\ge "],
  [/!=/g, "\\ne "],
  [/\+\/-/g, "\\pm"],
  [/~/g, "\\approx"],
  [/\*/g, " \\cdot "],
];

// Kata yang tampak seperti kata Indonesia tetapi sebenarnya lambang matematika.
const KATA_MATEMATIKA = new Set([
  "exp", "sqrt", "sin", "cos", "tan", "ln", "log", "det", "lim", "sum", "max", "min",
  "tau", "pi", "inf", "wn", "wd", "zeta", "integral",
]);

// Nama fungsi yang tidak punya perintah LaTeX sendiri ditulis tegak supaya
// tidak terbaca sebagai perkalian antarhuruf.
const FUNGSI_TEGAK = ["mean", "std", "rms", "var", "cov", "sat", "sign", "round"];

/** Kembalikan indeks kurung tutup yang berpasangan dengan kurung buka di `i`. */
function pasanganKurung(t, i) {
  let dalam = 0;
  for (let j = i; j < t.length; j += 1) {
    if (t[j] === "(") dalam += 1;
    else if (t[j] === ")") { dalam -= 1; if (dalam === 0) return j; }
  }
  return -1;
}

/**
 * Ubah `nama(...)` menjadi bentuk LaTeX, termasuk ketika isinya masih memuat
 * kurung lagi seperti exp(-pi*z/sqrt(1-z^2)). Pola regex biasa gagal di situ
 * karena ia berhenti pada kurung tutup yang pertama ditemui.
 */
function fungsiBerkurung(t, nama, bungkus) {
  let hasil = "";
  let i = 0;
  for (;;) {
    const k = t.indexOf(`${nama}(`, i);
    if (k < 0) return hasil + t.slice(i);
    // Harus berdiri sebagai kata sendiri, bukan ekor pengenal lain.
    if (k > 0 && /[A-Za-z0-9_\\]/.test(t[k - 1])) {
      hasil += t.slice(i, k + nama.length + 1);
      i = k + nama.length + 1;
      continue;
    }
    const tutup = pasanganKurung(t, k + nama.length);
    if (tutup < 0) return hasil + t.slice(i);
    hasil += t.slice(i, k) + bungkus(t.slice(k + nama.length + 1, tutup));
    i = tutup + 1;
  }
}

/** Awal operand yang berakhir tepat sebelum indeks `akhir`. */
function awalOperand(t, akhir) {
  const bukaPasangan = (kanan, buka, tutup) => {
    let dalam = 0;
    for (let j = kanan; j >= 0; j -= 1) {
      if (t[j] === tutup) dalam += 1;
      else if (t[j] === buka) { dalam -= 1; if (dalam === 0) return j; }
    }
    return -1;
  };
  let i = akhir;
  if (t[i - 1] === "}") { const b = bukaPasangan(i - 1, "{", "}"); if (b < 0) return i; i = b; }
  else if (t[i - 1] === ")") { const b = bukaPasangan(i - 1, "(", ")"); if (b < 0) return i; i = b; }
  while (i > 0 && /[A-Za-z0-9_.\\]/.test(t[i - 1])) i -= 1;
  // Pangkat dan subskrip menempel pada basisnya, jadi basisnya ikut diambil.
  if (i > 0 && (t[i - 1] === "^" || t[i - 1] === "_")) return awalOperand(t, i - 1);
  return i;
}

/**
 * Ubah `pembilang/(penyebut)` menjadi \frac. Pembilang diambil utuh beserta
 * pangkatnya — tanpa ini, wn^2/(...) terbaca sebagai wn pangkat pecahan.
 */
function pecahanBerkurung(t) {
  let hasil = t;
  for (let putaran = 0; putaran < 12; putaran += 1) {
    const k = hasil.indexOf("/(");
    if (k < 0) break;
    const tutup = pasanganKurung(hasil, k + 1);
    if (tutup < 0) break;
    const mulai = awalOperand(hasil, k);
    const pembilang = hasil.slice(mulai, k).trim();
    const penyebut = hasil.slice(k + 2, tutup).trim();
    if (!pembilang) break;
    hasil = `${hasil.slice(0, mulai)}\\frac{${pembilang}}{${penyebut}}${hasil.slice(tutup + 1)}`;
  }
  return hasil;
}

/** Akhir operand yang dimulai pada indeks `mulai`. */
function akhirOperand(t, mulai) {
  let i = mulai;
  const ambilKurawal = () => {
    let dalam = 0;
    for (; i < t.length; i += 1) {
      if (t[i] === "{") dalam += 1;
      else if (t[i] === "}") { dalam -= 1; if (dalam === 0) { i += 1; return; } }
    }
  };
  if (t[i] === "\\") {
    i += 1;
    while (i < t.length && /[A-Za-z]/.test(t[i])) i += 1;
    // Perintah berargumen seperti \sqrt{...} membawa kurawalnya.
    if (t[i] === "{") ambilKurawal();
  }
  else if (t[i] === "(") { const p = pasanganKurung(t, i); return p < 0 ? -1 : p + 1; }
  else { while (i < t.length && /[A-Za-z0-9.,]/.test(t[i])) i += 1; }
  // Subskrip atau pangkat yang menempel ikut terbawa.
  while (i < t.length && (t[i] === "_" || t[i] === "^")) {
    i += 1;
    if (t[i] === "{") {
      let dalam = 0;
      for (; i < t.length; i += 1) {
        if (t[i] === "{") dalam += 1;
        else if (t[i] === "}") { dalam -= 1; if (dalam === 0) { i += 1; break; } }
      }
    } else { while (i < t.length && /[A-Za-z0-9]/.test(t[i])) i += 1; }
  }
  return i;
}

/**
 * Ubah garis miring sederhana `a/b` menjadi \frac, mengikuti cara Modul 1
 * menuliskan pecahan. Hanya dijalankan ketika kedua ruasnya berupa satu
 * operand utuh, supaya urutan operasi tidak berubah.
 */
function pecahanSederhana(t) {
  let hasil = t;
  let mulaiCari = 0;
  for (let putaran = 0; putaran < 20; putaran += 1) {
    const k = hasil.indexOf("/", mulaiCari);
    if (k < 0) break;
    const awal = awalOperand(hasil, k);
    const akhir = akhirOperand(hasil, k + 1);
    const atas = hasil.slice(awal, k);
    const bawah = akhir < 0 ? "" : hasil.slice(k + 1, akhir);
    // Kedua ruas harus satu operand utuh tanpa tanda tambah, kurang, atau
    // spasi — kalau tidak, urutan operasinya bisa berubah arti.
    const layak = Boolean(atas) && Boolean(bawah)
      && !/[+\-\s]/.test(atas) && !/[+\-\s]/.test(bawah) && !atas.endsWith("\\");
    if (!layak) { mulaiCari = k + 1; continue; }
    hasil = `${hasil.slice(0, awal)}\\frac{${atas}}{${bawah}}${hasil.slice(akhir)}`;
    mulaiCari = awal + 6 + atas.length + bawah.length;
  }
  return hasil;
}

function tokenLatex(teks) {
  // Kurung kurawal yang memang ada di teks asal (mis. "L{f*g}" atau himpunan
  // "{t_r, t_s}") diamankan lebih dulu. Kalau tidak, kurawal yang nanti
  // dihasilkan sendiri oleh pengubahan pangkat dan pecahan ikut terlolos.
  let t = teks.replace(/\{/g, "\u0001").replace(/\}/g, "\u0002");

  // Notasi turunan waktu pada model ruang keadaan: x_dot menjadi titik di atas.
  t = t.replace(/\b([A-Za-z])_dot\b/g, "\\dot{$1}");
  t = t.replace(/\b([A-Za-z])_ddot\b/g, "\\ddot{$1}");
  t = fungsiBerkurung(t, "exp", (isi) => `e^{${isi}}`);
  t = fungsiBerkurung(t, "sqrt", (isi) => `\\sqrt{${isi}}`);
  for (const nama of FUNGSI_TEGAK) {
    t = fungsiBerkurung(t, nama, (isi) => `\\operatorname{${nama}}(${isi})`);
  }
  t = t.replace(/\bintegral_0\^inf\b/g, "\\int_0^{\\infty}");
  t = t.replace(/\bintegral\b/g, "\\int");
  t = t.replace(/\bL\u0001/g, "\\mathcal{L}\u0001");

  for (const [pola, ganti] of PENGGANTI) t = t.replace(pola, ganti);
  for (const [pola, ganti] of SIMBOL) t = t.replace(pola, ganti);

  // Subskrip dan pangkat lebih dari satu karakter perlu kurung kurawal.
  t = t.replace(/_\(([^()]*)\)/g, "_{$1}");
  t = t.replace(/_([A-Za-z0-9]{2,})/g, "_{$1}");
  t = t.replace(/\^\(([^()]*)\)/g, "^{$1}");
  t = t.replace(/\^(-?[A-Za-z0-9]{2,})/g, "^{$1}");

  // Pecahan.
  t = t.replace(/\bd([A-Za-z])\s*\/\s*d([A-Za-z])\b/g, "\\frac{d$1}{d$2}");
  t = t.replace(/\s+\/\s*\(/g, "/(");
  t = pecahanBerkurung(t);
  t = pecahanSederhana(t);

  // Kata biasa yang menyelip di antara lambang (mis. "pada", "pole") ditulis
  // tegak lewat \text{} supaya tidak tampil sebagai perkalian antarhuruf.
  t = t.replace(/(^|[^\\A-Za-z_{])([A-Za-z]{4,})(?![A-Za-z}])/g, (cocok, depan, kata) => (
    KATA_MATEMATIKA.has(kata.toLowerCase()) ? cocok : `${depan}\\text{${kata}}`
  ));

  // Kurawal asal dikembalikan dalam bentuk yang dikenali KaTeX.
  t = t.replace(/\u0001/g, "\\{").replace(/\u0002/g, "\\}");
  t = t.replace(/\\mathcal\{L\}/g, "\\mathcal{L}");
  return t.replace(/\s{2,}/g, " ").trim();
}

// Sebuah kata dianggap kata biasa bila panjangnya empat huruf atau lebih dan
// bukan lambang matematika yang memang ditulis dengan huruf.
function kataBiasa(token) {
  // Harus murni huruf. Token seperti Y(s)/U(s), Ki*e*T, atau tau_tercepat
  // memuat tanda hitung, jadi bagian dari persamaan meskipun berhuruf banyak.
  const cocok = token.match(/^([A-Za-z]{4,})[.,;:]?$/);
  return !!cocok && !KATA_MATEMATIKA.has(cocok[1].toLowerCase());
}

/**
 * Pisahkan ruas menjadi [bagian persamaan, bagian keterangan].
 * Penelusuran berhenti pada dua kata biasa berturut-turut, karena di situlah
 * persamaan biasanya sudah selesai dan kalimat penjelas dimulai.
 */
function pisahRumusDanKeterangan(teks) {
  const token = teks.split(/\s+/);
  let batas = token.length;
  let beruntun = 0;
  for (let i = 0; i < token.length; i += 1) {
    if (kataBiasa(token[i])) {
      beruntun += 1;
      if (beruntun === 2) { batas = i - 1; break; }
    } else {
      beruntun = 0;
    }
  }
  const kepala = token.slice(0, batas).join(" ").replace(/[,;:]$/, "").trim();
  const ekor = token.slice(batas).join(" ").trim();
  // Kepala baru layak disusun bila benar-benar mengandung tanda hitung.
  const layak = /[=^_]|[A-Za-z0-9)]\s*\/\s*[A-Za-z0-9(]|\+=|\bsqrt\b|\bexp\b|\bintegral\b/.test(kepala);
  return layak ? [kepala, ekor] : ["", teks];
}

function terlihatKalimat(teks) {
  const kata = (teks.match(/[A-Za-z]{4,}/g) || [])
    .filter((w) => !KATA_MATEMATIKA.has(w.toLowerCase()));
  const adaTandaHitung = /[=^_~]|\/|\bexp\b|\bsqrt\b|\bintegral\b/.test(teks);
  return kata.length >= 3 || !adaTandaHitung;
}

/**
 * Kembalikan potongan HTML: ruas persamaan sudah dibungkus \( \) untuk KaTeX,
 * ruas kalimat tetap sebagai teks yang sudah diamankan.
 */
export function rumusLatex(teks, esc) {
  const pemisah = ' <span style="color:var(--muted)">&nbsp;|&nbsp;</span> ';
  // Pemisah antarruas pada data ditulis dengan spasi di kedua sisi. Batang
  // tegak tanpa spasi berarti nilai mutlak, mis. |u|max, jadi tidak dipisah.
  return String(teks).split(/\s+\|\s+/).map((ruas) => {
    const bersih = ruas.trim();
    if (!bersih) return "";
    // Awalan penjelas seperti "Ziegler-Nichols:" atau "termal:" tetap teks.
    const cocok = bersih.match(/^([^:]{2,42}:)\s*(.+)$/);
    const pakaiAwalan = cocok && terlihatKalimat(cocok[1]);
    const awalan = pakaiAwalan ? cocok[1] : "";
    const inti = pakaiAwalan ? cocok[2] : bersih;
    // Banyak ruas berbentuk "persamaan lalu keterangan", mis.
    // "G(s) = Y(s)/U(s) pada kondisi awal nol". Bagian persamaannya disusun,
    // keterangannya tetap teks — kalau seluruh ruas dianggap kalimat, justru
    // persamaannya yang ikut tampil mentah.
    const [rumus, sisa] = pisahRumusDanKeterangan(inti);
    const depan = awalan ? esc(awalan) + " " : "";
    if (!rumus) return depan + esc(inti);
    const ekor = sisa ? " " + esc(sisa) : "";
    return depan + "\\(" + tokenLatex(rumus) + "\\)" + ekor;
  }).filter(Boolean).join(pemisah);
}
