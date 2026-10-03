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

// Kata yang memang ditulis kecil (lambang, nama alat) tidak dikapitalkan.
const TETAP_KECIL = new Set(["scipy", "eig", "tanh", "sigmoid", "dt", "de", "exp",
  "ln", "log", "rms", "ipynb", "fuzzy"]);

/**
 * Huruf pertama teks tampilan menjadi kapital; lambang matematika dibiarkan.
 * Sumber tunggal untuk seluruh generator: dipakai panel rumus, chip notasi,
 * kotak penjelasan, dan mesin ilustrasi — supaya aturannya mustahil berbeda.
 */
export function kapitalAwal(t) {
  const s = String(t);
  // Istilah bertanda hubung/en dash ("on–off") dihitung satu kata supaya ikut
  // dikapitalkan; ambang tiga huruf menjaga lambang pendek tetap huruf kecil.
  const kata = s.match(/^([a-zà-ÿ][a-zà-ÿ–-]{2,})\b/);
  if (!kata || TETAP_KECIL.has(kata[1])) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SIMBOL = [
  // Penguatan dan waktu tala ditulis bersubskrip seperti pada Modul 1.
  [/(?<![A-Za-z0-9\\])Kp(?![A-Za-z0-9])/g, "K_p"], [/(?<![A-Za-z0-9\\])Ki(?![A-Za-z0-9])/g, "K_i"], [/(?<![A-Za-z0-9\\])Kd(?![A-Za-z0-9])/g, "K_d"], [/(?<![A-Za-z0-9\\])Ku(?![A-Za-z0-9])/g, "K_u"],
  [/(?<![A-Za-z0-9\\])Kt(?![A-Za-z0-9])/g, "K_t"], [/(?<![A-Za-z0-9\\])Ti(?![A-Za-z0-9])/g, "T_i"], [/(?<![A-Za-z0-9\\])Td(?![A-Za-z0-9])/g, "T_d"], [/(?<![A-Za-z0-9\\])Tu(?![A-Za-z0-9])/g, "T_u"],
  [/(?<![A-Za-z0-9\\])Mp(?![A-Za-z0-9])/g, "M_p"], [/(?<![A-Za-z0-9\\])ess(?![A-Za-z0-9])/g, "e_{ss}"],
  [/\btau_cl\b/g, "\\tau_{cl}"],
  [/(?<![A-Za-z0-9\\])wn(?![A-Za-z0-9])/g, "\\omega_n"],
  [/(?<![A-Za-z0-9\\])wd(?![A-Za-z0-9])/g, "\\omega_d"],
  // wc (frekuensi silang) dan Kv tampil "wc"/"Kv" miring seperti perkalian dua huruf.
  [/(?<![A-Za-z0-9\\])wc(?![A-Za-z0-9])/g, "\\omega_c"],
  [/(?<![A-Za-z0-9\\])Kv(?![A-Za-z0-9])/g, "K_v"],
  // min(...)/max(...) sebagai fungsi ditulis tegak (\min, \max); subskrip _min/_max tidak tersentuh.
  [/(?<![A-Za-z0-9\\_{])min(?=\s*\()/g, "\\min"],
  [/(?<![A-Za-z0-9\\_{])max(?=\s*\()/g, "\\max"],
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
  // eta HARUS setelah beta/theta/zeta agar tidak memakan ekor kata itu.
  [/(?<![A-Za-z0-9\\])eta(?![A-Za-z0-9])/g, "\\eta"],
  // Sisa kata sqrt/exp yang tidak berkurung tetap diubah menjadi perintah.
  // Lookbehind mencegah \sqrt hasil pengubahan sebelumnya tergandakan
  // menjadi \\sqrt, yang membuat KaTeX menolak seluruh ekspresi.
  [/(?<!\\)\bsqrt\b/g, "\\sqrt"],
];

const PENGGANTI = [
  // "<<"/">>" ASCII tampil sebagai dua tanda "< <" — tulis \ll/\gg.
  [/<</g, "\\ll "],
  [/>>/g, "\\gg "],
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

// Ruas yang tetap berupa kalimat tidak melewati KaTeX, jadi lambangnya ditulis
// memakai huruf Yunani langsung. Tanpa ini, "zeta mengatur bentuk" akan tampil
// apa adanya sebagai kata "zeta" di samping rumus yang sudah memakai ζ.
const LAMBANG_PROSA = [
  [/(?<![A-Za-z0-9_])zeta(?![A-Za-z0-9_])/g, "ζ"],
  [/(?<![A-Za-z0-9_])omega(?![A-Za-z0-9_])/g, "ω"],
  [/(?<![A-Za-z0-9_])wn(?![A-Za-z0-9_])/g, "ωₙ"],
  [/(?<![A-Za-z0-9_])wd(?![A-Za-z0-9_])/g, "ωd"],
  [/(?<![A-Za-z0-9_])tau(?![A-Za-z0-9_])/g, "τ"],
  [/(?<![A-Za-z0-9_])eta(?![A-Za-z0-9_])/g, "η"],
  [/(?<![A-Za-z0-9_])pi(?![A-Za-z0-9_])/g, "π"],
  [/(?<![A-Za-z0-9_])mu(?![A-Za-z0-9_])/g, "μ"],
  [/(?<![A-Za-z0-9_])Delta(?![A-Za-z0-9_])/g, "Δ"],
  [/(?<![A-Za-z0-9_])M_p(?![A-Za-z0-9_])/g, "Mₚ"],
  [/(?<![A-Za-z0-9_])e_ss(?![A-Za-z0-9_])/g, "eₛₛ"],
];

function teksProsa(teks, esc) {
  // Panah dan pertidaksamaan ASCII pada kalimat ditulis dengan glyph aslinya.
  // Dilakukan sebelum esc supaya polanya tidak berubah menjadi entitas HTML.
  let hasil = String(teks)
    .replace(/<=>/g, "⇔").replace(/<->/g, "↔")
    .replace(/->/g, "→").replace(/=>/g, "⇒")
    .replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/\+\/-/g, "±");
  hasil = esc(hasil);
  for (const [pola, ganti] of LAMBANG_PROSA) hasil = hasil.replace(pola, ganti);
  return hasil;
}

// Kata yang merupakan lambang matematika walau berdiri sendiri di tengah
// kalimat keterangan — dirender KaTeX agar tidak tampil mentah seperti "Kt".
const LAMBANG_KATA = new Set(["Kp", "Ki", "Kd", "Ku", "Kt", "Ti", "Td", "Tu",
  "Mp", "ess", "wn", "wd", "tau", "zeta", "omega", "pi", "mu", "alpha", "beta",
  "theta", "Delta", "dt", "dx", "dy"]);

function tokenMatematis(tok) {
  const inti = tok.replace(/[.,;:]+$/, "");
  if (!inti) return false;
  if (LAMBANG_KATA.has(inti)) return true;
  if (/^[A-Za-z]$/.test(inti)) return true;                    // huruf tunggal: I, K, L
  if (/[_^]/.test(inti)) return true;                          // u_nyata, s^2
  if (/^[-+*/=<>()]+$|^\+=$|^->$/.test(inti)) return true;     // operator murni
  if (/[=*/^]|->|\+=/.test(inti) && /[A-Za-z0-9)]/.test(inti)) return true; // Kt*(u_nyata
  return false;
}

/**
 * Keterangan di samping/di belakang persamaan sering masih menyimpan potongan
 * matematika ("atau I += Kt*(u_nyata - u_minta)"). Deretan token matematis
 * dibungkus \( \) lewat tokenLatex yang SAMA dengan persamaan utamanya;
 * kata biasa tetap prosa. Deretan yang hanya berisi operator (mis. "->" di
 * antara dua kata) dibiarkan sebagai teks agar panah kalimat tidak berubah
 * menjadi rumus palsu.
 */
function prosaBerlambang(teks, esc) {
  const token = String(teks).trim().split(/\s+/).filter(Boolean);
  const keluar = [];
  let run = [];
  const tuang = () => {
    if (!run.length) return;
    const gabung = run.join(" ");
    // Deretan tanpa operand (hanya "->" atau "-" di antara kata) tetap teks.
    const adaOperand = /[A-Za-z0-9]/.test(gabung.replace(/[-+*/=<>()^_.,;:\s]+/g, ""));
    if (!adaOperand) {
      keluar.push(teksProsa(gabung, esc));
    } else {
      const ekorTanda = gabung.match(/[.,;:]+$/)?.[0] ?? "";
      const inti = ekorTanda ? gabung.slice(0, -ekorTanda.length) : gabung;
      keluar.push(`\\(${tokenLatex(inti)}\\)${esc(ekorTanda)}`);
    }
    run = [];
  };
  for (const tok of token) {
    if (tokenMatematis(tok)) {
      run.push(tok);
      // Tanda baca di ujung token menutup deretan — "mentok," berhenti di koma.
      if (/[.,;:]$/.test(tok)) tuang();
    } else {
      tuang();
      keluar.push(teksProsa(tok, esc));
    }
  }
  tuang();
  return keluar.join(" ");
}

// Nama fungsi yang tidak punya perintah LaTeX sendiri ditulis tegak supaya
// tidak terbaca sebagai perkalian antarhuruf.
const FUNGSI_TEGAK = ["mean", "std", "rms", "var", "cov", "sat", "sign", "round", "Re", "Im"];

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
  // \u0004 = koma desimal yang diamankan tokenLatex, bagian dari angka.
  while (i > 0 && /[A-Za-z0-9_.\\\u0004]/.test(t[i - 1])) i -= 1;
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
  else {
    // Koma polos bukan bagian operand (dulu "T/2, dengan" menjadi \frac{T}{2,});
    // koma desimal sudah diamankan sebagai \u0004.
    while (i < t.length && /[A-Za-z0-9.\u0004]/.test(t[i])) i += 1;
    // Argumen fungsi menempel pada namanya: Y(s)/U(s) harus mengambil "U(s)"
    // utuh sebagai penyebut, bukan "U" saja yang menyisakan "(s)" di luar.
    if (t[i] === "(") { const p = pasanganKurung(t, i); if (p >= 0) i = p + 1; }
  }
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

// Diekspor supaya chip notasi pada penjelasan persamaan (enrich) memakai
// konverter YANG SAMA dengan persamaannya — format identik karena konstruksi,
// bukan karena disiplin menulis.
export function tokenLatex(teks) {
  // Kurung kurawal yang memang ada di teks asal (mis. "L{f*g}" atau himpunan
  // "{t_r, t_s}") diamankan lebih dulu. Kalau tidak, kurawal yang nanti
  // dihasilkan sendiri oleh pengubahan pangkat dan pecahan ikut terlolos.
  let t = teks.replace(/\{/g, "\u0001").replace(/\}/g, "\u0002");

  // Tampilan KaTeX (3 Oktober 2026): (1) koma desimal "5,236" diamankan (dikembalikan sebagai {,} agar KaTeX tidak
  // menyisipkan spasi tanda baca, dan \frac tidak memotong "5,|236/0,9148");
  // (2) % polos adalah komentar KaTeX yang menelan sisa rumus -> \%;
  // (3) akar Unicode √( -> sqrt( agar menjadi \sqrt{..};
  // (4) "7 x 7" -> \times; (5) |u|max -> |u|_{max};
  // (6) satuan waktu/frekuensi sesudah angka ditulis tegak (5 rad/s), garis miringnya diamankan — HANYA untuk
  //     nilai sebuah ruas (angka tepat sesudah =, ≈, ~, <, >, ≤, ≥) yang satuannya menutup ruas itu (akhir, koma,
  //     titik koma, kurung tutup, atau disusul prosa). "G(s) = 1/(2 s + 1)" dan "e^(-0,5 s)" memuat peubah
  //     Laplace s, bukan detik.
  // Koma di antara dua bilangan bulat dalam interval [0,1] dan parameter distribusi N(0,1)/U(0,1) adalah pemisah,
  // bukan koma desimal: ditulis "[0, 1]" (spasi sesudah koma) sebelum koma desimal diamankan.
  t = t.replace(/(\[|\b[NU]\()(-?\d+),(-?\d+)(?=[\])])/g, "$1$2, $3");
  t = t.replace(/(\d),(?=\d)/g, "$1\u0004");
  t = t.replace(/(?<!\\)%/g, "\\%");
  // (7) rentang angka "10–20": en dash tidak punya metrik fon KaTeX di mode matematika -> 10\text{–}20.
  t = t.replace(/(\d)\s*–\s*(?=\d)/g, "$1\\text{–}");
  t = t.replace(/√\(/g, " sqrt(");
  t = t.replace(/(\d)\s+x\s+(\d)/g, "$1 \\times $2");
  t = t.replace(/\|([^|]+)\|(maks|max|min)(?![A-Za-z])/g, "|$1|_{$2}");
  t = t.replace(/((?:=|≈|~|<|>|≤|≥)\s*-?\d[\d.\u0004]*)\s+(rad\/s|rad|ms|s|Hz)(?=\s*(?:$|[,;)\]])|\s+[A-Za-z]{3,})/g,
    (m, a, s) => `${a}\\ \\text{${s.replace("/", "\u0003")}}`);

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
  // ^-1 dulu hanya menaikkan tanda minus ("(sI-A)⁻1").
  t = t.replace(/\^(-?[A-Za-z0-9]{2,}|-[A-Za-z0-9])/g, "^{$1}");

  // Pecahan.
  t = t.replace(/\bd([A-Za-z])\s*\/\s*d([A-Za-z])\b/g, "\\frac{d$1}{d$2}");
  t = t.replace(/\s+\/\s*\(/g, "/(");
  t = pecahanBerkurung(t);
  t = pecahanSederhana(t);

  // Kata biasa yang menyelip di antara lambang (mis. "pada", "uji") ditulis
  // tegak lewat \text{} supaya tidak tampil sebagai perkalian antarhuruf.
  // Ambang tiga huruf: kata Indonesia pendek ("uji", "dan") pun bukan
  // perkalian; lambang tiga huruf yang sah sudah tersaring KATA_MATEMATIKA.
  // Diferensial sesudah integral dipisah spasi tipis ("∫e dt" dulu tampil "∫edt").
  if (/∫|\\int/.test(t)) t = t.replace(/([A-Za-z0-9)²}])\s+d([a-z])(?![A-Za-z])/g, "$1\\,d$2");

  // Kata berhubung ("kira-kira") satu \text; kata di dalam argumen \frac
  // ("1/bandwidth") ikut tegak; label linguistik dua huruf kapital yang berdiri
  // sendiri di antara spasi (IF, PK, NK) juga teks.
  t = t.replace(/(^|[^\\A-Za-z_{])([A-Za-z]{3,}(?:-[A-Za-z]{3,})*)(?![A-Za-z}-])/g, (cocok, depan, kata) => (
    KATA_MATEMATIKA.has(kata.toLowerCase()) ? cocok : `${depan}\\text{${kata}}`
  ));
  t = t.replace(/(\\frac\{|\}\{)([A-Za-z]{3,})(?=\})/g, (cocok, depan, kata) => (
    KATA_MATEMATIKA.has(kata.toLowerCase()) ? cocok : `${depan}\\text{${kata}}`
  ));
  t = t.replace(/(^|\s)([A-Z]{2})(?=\s+[A-Za-z\\]|\s*;)/g, "$1\\text{$2}");

  // Frasa kata beruntun digabung dalam satu \text supaya spasinya terjaga —
  // mode matematika menelan spasi antarperintah, sehingga "frekuensi sampling"
  // pernah tampil menyatu sebagai "frekuensisampling".
  for (let ulang = 0; ulang < 6; ulang += 1) {
    t = t.replace(/\\text\{([^{}]*)\} +\\text\{([^{}]*)\}/g, "\\text{$1 $2}");
  }
  // Kata terakhir frasa di ujung argumen ("1/(1 + tak hingga)") ikut ke \text yang sama.
  t = t.replace(/\\text\{([^{}]*)\} +([A-Za-z]{3,})(?=\})/g, (cocok, isi, kata) => (
    KATA_MATEMATIKA.has(kata.toLowerCase()) ? cocok : `\\text{${isi} ${kata}}`));
  // Spasi di sisi \text{} yang menempel ke lambang/angka dipindah ke DALAM
  // \text — di luar, mode matematika menelannya ("Y(s)]padas=p_i", "BilaG", "ζkira").
  const OP_SPASI = "to|approx|cdot|times|Rightarrow|Leftarrow|Leftrightarrow|leftrightarrow|le|ge|ne|pm|mp|in|ll|gg|sim|equiv|quad|qquad";
  const OP_SET = new Set(OP_SPASI.split("|"));
  t = t.replace(/(\\[A-Za-z]+|[A-Za-z0-9)\]}'|²³\u0002])\s+\\text\{(?! )/g, (cocok, kiri) => (
    kiri.startsWith("\\") && OP_SET.has(kiri.slice(1)) ? cocok : `${kiri}\\text{ `));
  t = t.replace(new RegExp(String.raw`\\text\{([^{}]*[^{} ])\}\s+(?=[A-Za-z0-9(|\u0001]|\\(?!(?:${OP_SPASI})(?![A-Za-z])))`, "g"), "\\text{$1 }");

  // Kurawal asal dikembalikan dalam bentuk yang dikenali KaTeX.
  t = t.replace(/\u0001/g, "\\{").replace(/\u0002/g, "\\}");
  t = t.replace(/\u0003/g, "/").replace(/\u0004/g, "{,}");
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
  let kepala = token.slice(0, batas).join(" ").trim();
  const sisaToken = token.slice(batas);
  // Kurung yang terbuka di kepala harus dibawa sampai penutupnya — tanpa ini,
  // "eksperimen = {model, parameter, ...}" terpotong di tengah himpunan.
  const hitung = (s, c) => s.split(c).length - 1;
  while (sisaToken.length
      && (hitung(kepala, "{") > hitung(kepala, "}") || hitung(kepala, "(") > hitung(kepala, ")"))) {
    kepala += ` ${sisaToken.shift()}`;
  }
  kepala = kepala.replace(/[,;:]$/, "");
  const ekor = sisaToken.join(" ").trim();
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
// Perintah LaTeX struktural yang bukan notasi (tidak butuh penjelasan arti).
const STRUKTUR_LATEX = new Set(["frac", "sqrt", "left", "right", "cdot", "quad",
  "qquad", "to", "sum", "int", "lim", "infty", "Rightarrow", "Leftrightarrow",
  "leftrightarrow", "pm", "mp", "gg", "ll", "approx", "sim", "le", "ge", "ne",
  "neq", "text", "mathrm", "operatorname", "dots", "ldots", "cdots", "times",
  "min", "max", "log", "ln", "exp", "cos", "sin", "dot", "underbrace", "overline"]);

/**
 * Ekstrak token NOTASI dari sebuah rumus ASCII: perintah LaTeX non-struktural
 * (\zeta, \tau, ...) plus pengenal (RMSE, e_{ss}, K, x'). Dipakai perakit
 * legenda notasi kartu/tabel dan auditnya — satu pengekstrak untuk keduanya
 * supaya legenda dan audit mustahil berbeda pendapat.
 */
export function tokenNotasi(rumusAscii, namaDikenal = new Set()) {
  // Hanya segmen yang benar-benar TAMPIL sebagai matematika; ekor prosa pada
  // ruas ("... lalu ulangi pada dt/2") tidak menghasilkan token.
  const rendered = rumusLatex(rumusAscii, (x) => String(x));
  const latex = [...rendered.matchAll(/\\\((.+?)\\\)/g)].map((m) => m[1]).join(" ");
  return ekstrakNotasiLatex(latex, namaDikenal);
}

// Inti pengekstrak, menerima LaTeX langsung — dipakai tokenNotasi (rumus ASCII
// generator) dan halaman tulisan tangan yang rumusnya sudah berupa LaTeX.
// Nama tegak yang tetap notasi berarti dan punya chip legenda sendiri: tokenLatex menulis Re(…) sebagai
// \operatorname{Re} dan kata di argumen \frac ("1/bandwidth") sebagai \text{bandwidth}, padahal keduanya
// dijelaskan NOTASI_KAMUS (bagian nyata, lebar pita). Keputusan dosen 3 Oktober 2026: chip-nya dipertahankan.
// Nilainya bentuk tampil chip (legendaNotasi di enrich), tegak seperti di rumusnya — "\(bandwidth\)" polos
// tampil miring sebagai perkalian sembilan huruf.
export const NOTASI_TEGAK = new Map([["Re", "\\operatorname{Re}"], ["bandwidth", "\\text{bandwidth}"]]);

export function ekstrakNotasiLatex(latex, namaDikenal = new Set()) {
  const hasil = [];
  const sudah = new Set();
  const tambah = (t) => { if (t && !sudah.has(t)) { sudah.add(t); hasil.push(t); } };
  // Bagian \text{...} adalah prosa di dalam matematika — bukan notasi, kecuali NOTASI_TEGAK yang dikenal
  // kamus: dilepas di tempatnya, jadi tertangkap langkah 5 di urutan yang sama seperti saat masih polos.
  let t = latex.replace(/\\(?:text|operatorname|mathrm)\{([^{}]*)\}/g, (m, isi) => (
    NOTASI_TEGAK.has(isi) && namaDikenal.has(isi) ? ` ${isi} ` : " "));
  // 1) Perintah non-struktural, beserta subskrip yang menempel (\tau_{cl}).
  t = t.replace(/\\([a-zA-Z]+)(_\{[^{}]*\}|_[A-Za-z0-9])?/g, (m, nama, sub) => {
    if (!STRUKTUR_LATEX.has(nama)) tambah(`\\${nama}${sub || ""}`);
    return " ";
  });
  // 2) Pengenal BERSUBSKRIP diambil utuh lebih dulu — isi kurawalnya bagian
  //    dari nama (e_{ss}, t_{90}), bukan token tersendiri.
  t = t.replace(/([A-Za-z]+)(_\{[^{}]*\}|_[A-Za-z0-9])/g, (m) => { tambah(m); return " "; });
  // 3) Huruf beraksen turunan (x', x'').
  t = t.replace(/[A-Za-z]'{1,2}/g, (m) => { tambah(m); return " "; });
  // 4) Huruf Yunani literal pada data (φ, α, μ_e, λ) beserta subskripnya,
  //    dan tanda transpose ᵀ. Σ literal adalah operator jumlah — struktural.
  t = t.replace(/[Α-ωᵀᵀᵀ](?:_\{[^{}]*\}|_[A-Za-z0-9])?/g, (m) => {
    if (m !== "Σ") tambah(m);
    return " ";
  });
  // 5) Deretan huruf: kata Indonesia penyambung di dalam matematika diabaikan;
  //    nama yang dikenal kamus (RMSE, Re, uji) diambil utuh; selain itu deretan
  //    seperti "Ax" adalah perkalian — dipecah per huruf.
  const ABAIKAN = new Set(["tak", "hingga", "dengan", "pada", "dan", "atau",
    "lalu", "bila", "untuk", "semua", "dgn", "thd", "per",
    // sintaks aturan & operator literal — bukan notasi yang butuh arti
    // (dibandingkan setelah toLowerCase, jadi ditulis huruf kecil)
    "if", "and", "then", "min", "max"]);
  t = t.replace(/[A-Za-z]{2,}/g, (run) => {
    if (ABAIKAN.has(run.toLowerCase())) return " ";
    if (namaDikenal.has(run)) tambah(run);
    else for (const ch of run) tambah(ch);
    return " ";
  });
  // 6) Huruf tunggal tersisa.
  t = t.replace(/[A-Za-z]/g, (ch) => { tambah(ch); return " "; });
  return hasil;
}

/**
 * Benar-tidaknya sebuah kolom rumus memuat PERSAMAAN (bukan sekadar lambang
 * yang menyelip di kalimat panduan). Dipakai enrich untuk memutuskan blok mana
 * yang dinomori dan validator untuk menuntut penjelasan — satu penentu untuk
 * keduanya supaya mustahil berbeda pendapat. Tanpa ini, kalimat panduan yang
 * kini merender lambangnya lewat KaTeX ikut tertagih nomor persamaan.
 */
export function adaPersamaanInti(teks) {
  return String(teks).split(/\s+\|\s+/).some((ruas) => {
    const bersih = ruas.trim();
    if (!bersih) return false;
    const cocok = bersih.match(/^([^:]{2,42}:)\s*(.+)$/);
    // Titik-dua milik operator := bukan label ("w := w - ..." jangan terbelah).
    const labelSatuKata = cocok && /^[a-z][a-z-]*:$/.test(cocok[1].trim()) && !cocok[2].startsWith("=");
    const pakaiAwalan = cocok && (labelSatuKata || (terlihatKalimat(cocok[1]) && !cocok[2].startsWith("=")));
    const inti = pakaiAwalan ? cocok[2] : bersih;
    return pisahRumusDanKeterangan(inti)[0] !== "";
  });
}

/**
 * Kapitalkan awal sebuah ruas yang sudah dirender. Ruas yang dibuka kata biasa
 * ditangani kapitalAwal; ruas yang dibuka kata tegak di dalam matematika
 * (mis. \(\text{simpul} = ...\)) dikapitalkan di dalam \text{} itu sendiri.
 */
function kapitalRuas(html) {
  const diMath = html.match(/^\\\(\\text\{([a-zà-ÿ])/);
  if (diMath) {
    const i = html.indexOf(diMath[1], 8);
    return html.slice(0, i) + diMath[1].toUpperCase() + html.slice(i + 1);
  }
  return kapitalAwal(html);
}

export function rumusLatex(teks, esc) {
  const pemisah = ' <span style="color:var(--muted)">&nbsp;|&nbsp;</span> ';
  // Pemisah antarruas pada data ditulis dengan spasi di kedua sisi. Batang
  // tegak tanpa spasi berarti nilai mutlak, mis. |u|max, jadi tidak dipisah.
  return String(teks).split(/\s+\|\s+/).map((ruas) => {
    const bersih = ruas.trim();
    if (!bersih) return "";
    // Awalan penjelas seperti "Ziegler-Nichols:" atau "termal:" tetap teks.
    const cocok = bersih.match(/^([^:]{2,42}:)\s*(.+)$/);
    // Satu kata huruf kecil bertitik-dua ("integral:", "termal:") adalah label
    // penjelas, bukan bagian rumus — tanpa ini "integral:" berubah menjadi ∫.
    // Titik-dua milik operator := bukan label ("w := w - ..." jangan terbelah).
    const labelSatuKata = cocok && /^[a-z][a-z-]*:$/.test(cocok[1].trim()) && !cocok[2].startsWith("=");
    const pakaiAwalan = cocok && (labelSatuKata || (terlihatKalimat(cocok[1]) && !cocok[2].startsWith("=")));
    const awalan = pakaiAwalan ? cocok[1] : "";
    const inti = pakaiAwalan ? cocok[2] : bersih;
    // Banyak ruas berbentuk "persamaan lalu keterangan", mis.
    // "G(s) = Y(s)/U(s) pada kondisi awal nol". Bagian persamaannya disusun,
    // keterangannya tetap teks — kalau seluruh ruas dianggap kalimat, justru
    // persamaannya yang ikut tampil mentah.
    const [rumus, sisa] = pisahRumusDanKeterangan(inti);
    const depan = awalan ? teksProsa(awalan, esc) + " " : "";
    // Keterangan dan ruas kalimat tetap prosa, tetapi potongan matematika di
    // dalamnya (mis. "atau I += Kt*(u_nyata - u_minta)") dirender KaTeX agar
    // tidak ada notasi tampil mentah.
    if (!rumus) return kapitalRuas(depan + prosaBerlambang(inti, esc));
    const ekor = sisa ? " " + prosaBerlambang(sisa, esc) : "";
    // kapitalAwal hanya menyentuh ruas yang DIMULAI kata biasa; ruas yang
    // dibuka \( atau tag HTML tidak cocok polanya, jadi aman dilewatkan.
    return kapitalRuas(depan + "\\(" + tokenLatex(rumus) + "\\)" + ekor);
  }).filter(Boolean).join(pemisah);
}

// ─── Notasi rumus di PROSA yang dirender apa adanya (tanpa KaTeX) ─────────────
// Laporan dosen 3 Oktober 2026: notasi seperti "V_k" atau "R_l" tampil mentah.
// Teks penjelasan Sisken ditulis dengan gaya ASCII ("wn", "Kp", "tau", "exp(-st)",
// "G*H", "e_ss"); di halaman itu tampil apa adanya, berdampingan dengan KaTeX yang
// menulis ω_n dan K_p bersubskrip. notasiTeks() mengubah SATU potong teks polos;
// rapikanNotasiHtml() menerapkannya hanya pada simpul teks HTML — tag, atribut,
// entitas, <script>/<style>/<pre>/<code>/<textarea>/<svg>, dan segmen KaTeX
// \( \) \[ \] $$ $$ tidak disentuh. Gambar SVG ditulis dengan penanda <sub>/<sup>
// di sisken-ilustrasi-data.mjs (rumusSvg), kanvas di sisken-animasi.mjs.
// Huruf z untuk rasio redaman tidak diubah otomatis (z juga peubah neuron dan zero);
// datanya ditulis ζ.
const NOTASI_LEKAT = [
  ["Kp", "K", "p"], ["Ki", "K", "i"], ["Kd", "K", "d"], ["Ku", "K", "u"],
  ["Tu", "T", "u"], ["Ti", "T", "i"], ["Td", "T", "d"], ["Ts", "T", "s"],
  ["Mp", "M", "p"], ["tr", "t", "r"], ["tp", "t", "p"], ["ts", "t", "s"], ["ess", "e", "ss"],
  ["wn", "ω", "n"], ["wd", "ω", "d"], ["ωn", "ω", "n"], ["ωd", "ω", "d"],
].map(([kata, dasar, indeks]) => [new RegExp(String.raw`(?<![\p{L}\p{N}_\\])` + kata + String.raw`(?![\p{L}\p{N}_])`, "gu"), `${dasar}<sub>${indeks}</sub>`]);
const NOTASI_YUNANI = [["tau", "τ"], ["zeta", "ζ"], ["eta", "η"], ["mu", "μ"], ["sigma", "σ"], ["omega", "ω"], ["Delta", "Δ"]]
  .map(([kata, huruf]) => [new RegExp(String.raw`(?<![\p{L}\p{N}_\\-])` + kata + String.raw`(?![\p{L}\p{N}_-])`, "gu"), huruf]);

export function notasiTeks(teks) {
  let s = String(teks);
  s = s.replace(/\+\/-/g, "±");
  // a*b → a·b; "u*(e)" (keluaran tegas u*) tetap: bintang sesudah huruf yang diikuti "(" bukan perkalian.
  s = s.replace(/(?<=[\p{L}\p{N}])\*(?=[\p{L}\p{N}])|(?<=\))\*(?=[\p{L}\p{N}(])/gu, "·");
  s = s.replace(/\bexp\(([^()]*)\)/g, (_, a) => `e<sup>${a.trim().replace(/^-/, "−")}</sup>`);
  s = s.replace(/\bsqrt\(([^()]*)\)/g, "√($1)");
  s = s.replace(/\|([^|<>]+)\|(maks|max|min)(?![\p{L}\p{N}_])/gu, "|$1|<sub>$2</sub>");
  for (const [rx, ganti] of NOTASI_LEKAT) s = s.replace(rx, ganti);
  for (const [rx, ganti] of NOTASI_YUNANI) s = s.replace(rx, ganti);
  // X_y, X_{..}, X_(..) — pengenal kode huruf kecil (≥3 huruf, mis. solve_ivp) dibiarkan.
  s = s.replace(/(?<![\p{L}\p{N}_@./\\-])(\p{L}[\p{L}′″]{0,2})_(\{[^{}<>]+\}|\([^()<>]+\)|[\p{L}\p{N}]+)/gu,
    (m, dasar, indeks) => (/^[a-z]{3,}$/.test(dasar) ? m : `${dasar}<sub>${indeks.replace(/^[{(]|[})]$/g, "")}</sub>`));
  // Pangkat ^(…) dengan kurung bersarang (e^(−πζ/√(1−ζ²))), lalu ^{…} dan ^x.
  for (let i = s.indexOf("^("); i >= 0; i = s.indexOf("^(", i + 1)) {
    const tutup = pasanganKurung(s, i + 1);
    if (tutup < 0) continue;
    s = `${s.slice(0, i)}<sup>${s.slice(i + 2, tutup)}</sup>${s.slice(tutup + 1)}`;
  }
  s = s.replace(/\^\{([^{}<>]*)\}|\^([\p{L}\p{N}]+)/gu, (m, b, c) => `<sup>${b ?? c}</sup>`);
  return s;
}

const LINDUNG_NOTASI = /<(script|style|pre|code|textarea|kbd|samp|svg)\b[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->|<[A-Za-z!/][^>]*>|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|&#?\w+;/gi;

export function rapikanNotasiHtml(html) {
  const s = String(html);
  let out = "";
  let pos = 0;
  for (const m of s.matchAll(LINDUNG_NOTASI)) {
    out += notasiTeks(s.slice(pos, m.index)) + m[0];
    pos = m.index + m[0].length;
  }
  return out + notasiTeks(s.slice(pos));
}
