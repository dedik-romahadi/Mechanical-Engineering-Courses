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
  [/\bKp\b/g, "K_p"], [/\bKi\b/g, "K_i"], [/\bKd\b/g, "K_d"], [/\bKu\b/g, "K_u"],
  [/\bKt\b/g, "K_t"], [/\bTi\b/g, "T_i"], [/\bTd\b/g, "T_d"], [/\bTu\b/g, "T_u"],
  [/\btau_cl\b/g, "\\tau_{cl}"],
  [/\bwn\b/g, "\\omega_n"],
  [/\bwd\b/g, "\\omega_d"],
  [/\bomega\b/g, "\\omega"],
  [/\btau\b/g, "\\tau"],
  [/\bpi\b/g, "\\pi"],
  [/\bzeta\b/g, "\\zeta"],
  [/\bDelta\b/g, "\\Delta"],
  [/\bSigma\b/g, "\\Sigma"],
  [/\binf\b/g, "\\infty"],
  [/\bdet\b/g, "\\det"],
  [/\bln\b/g, "\\ln"],
  [/\blog10\b/g, "\\log_{10}"],
  [/\blog\b/g, "\\log"],
  [/\bsin\b/g, "\\sin"],
  [/\bcos\b/g, "\\cos"],
  [/\btan\b/g, "\\tan"],
  [/\blim\b/g, "\\lim"],
  [/\bsum\b/g, "\\sum"],
  [/\bmu\b/g, "\\mu"],
  [/\balpha\b/g, "\\alpha"],
  [/\bbeta\b/g, "\\beta"],
  [/\btheta\b/g, "\\theta"],
  // sqrt bersarang tidak tertangkap pola berkurung di tokenLatex, jadi kata
  // sisanya tetap diubah menjadi perintah supaya tampil sebagai tanda akar.
  [/\bsqrt\b/g, "\\sqrt"],
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
  "tau", "pi", "inf", "wn", "wd", "zeta", "integral", "impuls", "pole", "zero",
]);

function tokenLatex(teks) {
  // Kurung kurawal yang memang ada di teks asal (mis. "L{f*g}" atau himpunan
  // "{t_r, t_s}") diamankan lebih dulu. Kalau tidak, kurawal yang nanti
  // dihasilkan sendiri oleh pengubahan pangkat dan pecahan ikut terlolos.
  let t = teks.replace(/\{/g, "\u0001").replace(/\}/g, "\u0002");

  // Notasi turunan waktu pada model ruang keadaan: x_dot menjadi titik di atas.
  t = t.replace(/\b([A-Za-z])_dot\b/g, "\\dot{$1}");
  t = t.replace(/\b([A-Za-z])_ddot\b/g, "\\ddot{$1}");
  t = t.replace(/\bexp\(([^()]*)\)/g, "e^{$1}");
  t = t.replace(/\bsqrt\(([^()]*)\)/g, "\\sqrt{$1}");
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

  // Pecahan: hanya bentuk yang ruasnya jelas, supaya tidak salah membaca.
  t = t.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
  t = t.replace(/\bd([A-Za-z])\s*\/\s*d([A-Za-z])\b/g, "\\frac{d$1}{d$2}");
  // Pembilang sengaja tidak boleh memuat kurawal: kalau boleh, pasangan
  // kurawal hasil pengubahan pangkat ikut terbelah menjadi pecahan yang salah.
  t = t.replace(/([A-Za-z0-9_.]+)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");

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
