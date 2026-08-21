/**
 * Efek perayaan benar/salah bergaya Duolingo pada tiap jawaban yang dikirim.
 *
 * Saat server menjawab, sebuah emoji muncul melayang di atas kotak umpan balik
 * soal itu: wajah senang memantul untuk benar, wajah berpikir untuk sebagian,
 * wajah sedih bergoyang untuk salah. Untuk jawaban benar, kartu soal ikut
 * berdenyut hijau dan beberapa konfeti kecil terlempar.
 *
 * EMOJI DIGAMBAR, BUKAN DIKETIK. Emoji font tampil datar dan berbeda di tiap
 * perangkat (Windows, Android, iOS menggambar wajah yang berlainan). Di sini
 * wajahnya SVG berlapis: gradien radial memberi volume bola, sorotan spekular
 * di kiri-atas memberi kesan kilap, bayangan elips lembut di bawah memberi
 * kesan melayang, dan pantulannya memakai kurva easing "overshoot" supaya
 * terasa punya bobot. Hasilnya sama di semua perangkat dan terlihat 3D.
 *
 * HANYA JAWABAN BARU. Jalur alreadyAnswered dan healed (pemulihan setelah
 * refresh) sudah `return` lebih dulu di kedua penerap hasil, jadi penyisipan
 * ditaruh tepat di blok "fresh attempt" — memuat ulang halaman tidak akan
 * memicu perayaan ulang.
 *
 * Gerak dihormati: pada prefers-reduced-motion emoji tetap muncul (ia membawa
 * informasi), tetapi tanpa pantulan, goyangan, dan konfeti.
 *
 * Idempoten lewat penanda EFEK-JAWABAN; blok lama diganti, bukan dilewati.
 *
 * Pakai:
 *   node scripts/tambah-efek-jawaban.mjs            # terapkan
 *   node scripts/tambah-efek-jawaban.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Wajah SVG. Tiga lapisan volume: bola bergradien radial (terang di kiri-atas,
// gelap di tepi kanan-bawah), cincin tepi gelap tipis agar bolanya "terangkat"
// dari latar, lalu sorotan spekular putih yang memberi kesan kilap.
function wajah(jenis) {
  const warna = {
    senang: ["#fff3a3", "#ffd43b", "#e0a800", "#7a5200"],
    sedih: ["#fff3a3", "#ffd43b", "#e0a800", "#7a5200"],
    pikir: ["#fff3a3", "#ffd43b", "#e0a800", "#7a5200"],
  }[jenis];
  const [terang, tengah, gelap, garis] = warna;
  const id = `ej-${jenis}`;
  const mulut = {
    senang: `<path d="M30 56 Q50 78 70 56" fill="#5a2d00"/><path d="M36 58 Q50 70 64 58" fill="#ff6b6b"/>`,
    sedih: `<path d="M32 70 Q50 54 68 70" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/><ellipse cx="72" cy="44" rx="4" ry="7" fill="#4fc3f7"><animate attributeName="cy" values="40;58" dur="1.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.1s" repeatCount="indefinite"/></ellipse>`,
    pikir: `<path d="M34 66 Q50 60 66 68" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="74" r="7" fill="${tengah}" stroke="${gelap}" stroke-width="2"/>`,
  }[jenis];
  const mata = {
    senang: `<path d="M28 42 Q36 32 44 42" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/><path d="M56 42 Q64 32 72 42" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/>`,
    sedih: `<ellipse cx="36" cy="42" rx="5" ry="7" fill="${garis}"/><ellipse cx="64" cy="42" rx="5" ry="7" fill="${garis}"/><path d="M26 32 L44 36" stroke="${garis}" stroke-width="4" stroke-linecap="round"/><path d="M74 32 L56 36" stroke="${garis}" stroke-width="4" stroke-linecap="round"/>`,
    pikir: `<ellipse cx="36" cy="44" rx="5" ry="6" fill="${garis}"/><ellipse cx="64" cy="40" rx="5" ry="6" fill="${garis}"/><path d="M28 30 Q36 26 44 32" stroke="${garis}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M56 28 Q64 20 72 26" stroke="${garis}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  }[jenis];
  const pipi = jenis === "senang"
    ? `<ellipse cx="24" cy="56" rx="8" ry="5" fill="#ff8a80" opacity=".55"/><ellipse cx="76" cy="56" rx="8" ry="5" fill="#ff8a80" opacity=".55"/>` : "";
  return `<svg viewBox="0 0 100 112" width="72" height="81" aria-hidden="true">`
    + `<defs>`
    + `<radialGradient id="${id}-bola" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="${terang}"/><stop offset=".55" stop-color="${tengah}"/><stop offset="1" stop-color="${gelap}"/></radialGradient>`
    + `<radialGradient id="${id}-kilap" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-bayang" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
    + `</defs>`
    + `<ellipse class="ej-bayang" cx="50" cy="104" rx="26" ry="6" fill="url(#${id}-bayang)"/>`
    + `<g class="ej-bola">`
    + `<circle cx="50" cy="50" r="46" fill="url(#${id}-bola)" stroke="${gelap}" stroke-width="1.5"/>`
    + `<ellipse cx="34" cy="28" rx="16" ry="10" fill="url(#${id}-kilap)" transform="rotate(-25 34 28)"/>`
    + pipi + mata + mulut
    + `</g></svg>`;
}

const BLOK = `<!-- EFEK-JAWABAN:START v1 -->
<style>
/* Panggung emoji: melayang di atas kotak umpan balik, tidak menggeser tata letak. */
.feedback{position:relative}
.ej-panggung{position:absolute;left:50%;top:-14px;transform:translate(-50%,-100%);pointer-events:none;z-index:5;filter:drop-shadow(0 10px 14px rgba(0,0,0,.28))}
.ej-panggung svg{display:block;overflow:visible}
/* Pantulan dengan overshoot supaya terasa berbobot, lalu lenyap pelan. */
@keyframes ejMuncul{0%{opacity:0;transform:translate(-50%,-60%) scale(.3)}55%{opacity:1;transform:translate(-50%,-112%) scale(1.12)}75%{transform:translate(-50%,-100%) scale(.96)}100%{opacity:1;transform:translate(-50%,-100%) scale(1)}}
@keyframes ejLenyap{to{opacity:0;transform:translateY(-22px) scale(.85)}}
@keyframes ejPantul{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes ejBayangPantul{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.78);opacity:.6}}
@keyframes ejGoyang{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes ejDenyutHijau{0%{box-shadow:0 0 0 0 rgba(0,224,158,.55)}100%{box-shadow:0 0 0 22px rgba(0,224,158,0)}}
@keyframes ejDenyutMerah{0%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}100%{box-shadow:0 0 0 18px rgba(239,68,68,0)}}
@keyframes ejKonfeti{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(540deg)}}
/* Muncul dan lenyap dipisah ke DUA elemen. Saat keduanya dipasang pada satu
   elemen sebagai daftar animasi, keyframe 0% ejMuncul (opacity 0, scale .3)
   tetap terpegang — diukur di browser: pada 900 ms opacity masih 0 dan
   transform masih scale(.3) meski kedua animasi "running". Dengan elemen
   terpisah tidak ada dua animasi yang memperebutkan properti yang sama. */
.ej-panggung{animation:ejMuncul .6s cubic-bezier(.34,1.56,.64,1) both}
.ej-isi{display:block;animation:ejLenyap .5s ease-in 2.6s forwards}
.ej-senang .ej-bola{transform-box:fill-box;transform-origin:center;animation:ejPantul .55s ease-in-out .6s 3}
.ej-senang .ej-bayang{transform-box:fill-box;transform-origin:center;animation:ejBayangPantul .55s ease-in-out .6s 3}
.ej-sedih .ej-bola{transform-box:fill-box;transform-origin:50% 90%;animation:ejGoyang .5s ease-in-out .6s 3}
.ej-pikir .ej-bola{transform-box:fill-box;transform-origin:center;animation:ejGoyang 1.1s ease-in-out .6s 2}
.ej-denyut-benar{animation:ejDenyutHijau .9s ease-out;border-radius:inherit}
.ej-denyut-salah{animation:ejDenyutMerah .7s ease-out;border-radius:inherit}
.ej-konfeti{position:absolute;left:50%;top:-20px;width:8px;height:8px;border-radius:2px;pointer-events:none;z-index:4;animation:ejKonfeti 1s cubic-bezier(.2,.8,.4,1) forwards}
@media (prefers-reduced-motion:reduce){
  .ej-panggung{animation:none;opacity:1;transform:translate(-50%,-100%)}
  .ej-isi{animation:ejLenyap .4s ease-in 2.4s forwards}
  .ej-senang .ej-bola,.ej-senang .ej-bayang,.ej-sedih .ej-bola,.ej-pikir .ej-bola{animation:none}
  .ej-denyut-benar,.ej-denyut-salah{animation:none}
  .ej-konfeti{display:none}
}
</style>
<script>
(function(){
  var WAJAH = {
    correct: ${JSON.stringify(wajah("senang"))},
    partial: ${JSON.stringify(wajah("pikir"))},
    wrong: ${JSON.stringify(wajah("sedih"))}
  };
  var KELAS = { correct: 'ej-senang', partial: 'ej-pikir', wrong: 'ej-sedih' };
  var WARNA_KONFETI = ['#00e09e','#ffd43b','#4fc3f7','#ff6b6b','#a855f7'];
  var diam = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Rayakan hasil di atas kotak umpan balik. \`status\`: correct|partial|wrong.
   * Aman dipanggil berkali-kali: perayaan sebelumnya pada kotak yang sama dibuang.
   */
  window.rayakanJawaban = function (fb, status) {
    if (!fb || !WAJAH[status]) return;
    var lama = fb.querySelector('.ej-panggung');
    if (lama) lama.remove();
    var p = document.createElement('div');
    p.className = 'ej-panggung ' + KELAS[status];
    // SVG dibungkus elemen dalam yang memegang animasi lenyap, terpisah dari
    // animasi muncul di panggung luar — lihat catatan pada CSS .ej-isi.
    p.innerHTML = '<span class="ej-isi">' + WAJAH[status] + '</span>';
    fb.appendChild(p);
    setTimeout(function(){ if (p.parentNode) p.remove(); }, 3300);

    // Denyut pada kartu soal terdekat supaya matanya tertarik ke soal yang benar.
    var kartu = fb.closest('.q-card, .question-card, .card, .task-card') || fb.parentElement;
    if (kartu && !diam) {
      var k = status === 'correct' ? 'ej-denyut-benar' : (status === 'wrong' ? 'ej-denyut-salah' : null);
      if (k) { kartu.classList.remove(k); void kartu.offsetWidth; kartu.classList.add(k);
        setTimeout(function(){ kartu.classList.remove(k); }, 1000); }
    }
    if (status === 'correct' && !diam) {
      for (var i = 0; i < 14; i++) {
        var c = document.createElement('i');
        c.className = 'ej-konfeti';
        var sudut = (Math.PI * 2) * (i / 14) + (Math.random() - .5) * .6;
        var jarak = 60 + Math.random() * 50;
        c.style.setProperty('--dx', Math.cos(sudut) * jarak + 'px');
        c.style.setProperty('--dy', (Math.sin(sudut) * jarak - 30) + 'px');
        c.style.background = WARNA_KONFETI[i % WARNA_KONFETI.length];
        c.style.animationDelay = (Math.random() * .12) + 's';
        fb.appendChild(c);
        (function(el){ setTimeout(function(){ if (el.parentNode) el.remove(); }, 1300); })(c);
      }
    }
  };
})();
</script>
<!-- EFEK-JAWABAN:END v1 -->
`;

// Titik sisip: awal blok "fresh attempt" pada kedua penerap hasil. Keduanya
// diawali `if (fb) {` tepat sesudah komentar penanda blok itu, dan jalur
// alreadyAnswered/healed sudah return di atasnya.
//
// Komentar penandanya ditulis dengan em-dash (—) di tiga course dan dengan
// tanda hubung ganda (--) di Optimalisasi & Otomasi, jadi dicocokkan lewat
// regex yang menerima keduanya — kalau tidak, ke-14 modul Opto terlewat.
//
// PENTING — dipanggil SESUDAH blok `if (fb) { … }` selesai, bukan di awalnya.
// Kotak .feedback berawal display:none dan baru tampil ketika className-nya
// diset di dalam blok itu. Emoji dijangkarkan di dalam kotak tersebut, jadi
// kalau dipanggil sebelum className diset, panggungnya dibuat di elemen yang
// masih tersembunyi dan berukuran 0×0 — tidak pernah terlihat pada jawaban
// pertama. Ini ketahuan dari pengukuran getBoundingClientRect di browser.
const PANGGIL = "  if (fb && typeof rayakanJawaban === 'function') rayakanJawaban(fb, status);\n";
// Modul: baris pertama sesudah blok if(fb) pada jalur fresh adalah komentar
// "Highlight correct option" — sama di keempat course, dan hanya muncul sekali
// di dalam _applyModulServerResult.
const RX_MODUL = /(\n)(  \/\/ Highlight correct option di DOM \(MC only\)\n)/g;
// Exam: baris pertama sesudah blok if(fb) pada jalur fresh adalah `if (sub) {`.
// Dijangkarkan lewat lookbehind pada penutup cabang wrong bertuliskan
// "Jawaban telah dikunci" (khas jalur fresh; alreadyAnswered memakai kalimat
// lain), supaya `if (sub) {` lain di halaman tidak ikut tersambar.
// Lima exam menyelipkan komentar "// Tombol & opsi visual lock" sebelum
// `if (sub) {`, tiga lainnya tidak — komentar itu dibuat opsional.
const RX_EXAM = /((?:UTS|UAS) murni, jadi jawaban benar tidak ditampilkan\)';\n    \}\n  \}\n\n)((?:  \/\/ Tombol & opsi visual lock\n)?  if \(sub\) \{)/g;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  // Sisipan lama dibuang dulu supaya idempoten dan supaya perubahan titik sisip
  // di versi berikutnya tidak menumpuk.
  // Bentuk lama (`if (typeof …`) dan baru (`if (fb && typeof …`) sama-sama
  // dibuang. Kalau hanya bentuk lama yang dikenali, jalan kedua di halaman
  // modul menggandakan pemanggilan — jangkar "Highlight" tetap cocok walau
  // sisipan barunya masih ada di atasnya.
  //
  // Yang dibuang HANYA baris pemanggilannya sendiri (indentasi + isi + newline
  // miliknya). Versi sebelumnya menelan newline SEBELUM baris itu, sehingga
  // baris kosong pemisah `}\n\n  if (sub) {` di exam ikut hilang — RX_EXAM
  // tak cocok lagi, sisip=0, dan kedelapan exam tak pernah diperbarui lagi.
  html = html.replace(/^[ \t]*if \((?:fb && )?typeof rayakanJawaban === 'function'\) rayakanJawaban\(fb, status\);\n/gm, "");
  html = html.replace(/<!-- EFEK-JAWABAN:START[\s\S]*?<!-- EFEK-JAWABAN:END[^>]*-->\n?/, "");

  let sisip = 0;
  // Kedua regex menangkap (sebelum)(sesudah); pemanggilan diselipkan di
  // antaranya sehingga teks asli di kedua sisi tidak berubah sama sekali.
  for (const rx of [RX_MODUL, RX_EXAM]) {
    html = html.replace(rx, (m, sebelum, sesudah) => { sisip += 1; return sebelum + PANGGIL + sesudah; });
  }
  if (!sisip) return null;
  if (!html.includes("</head>")) throw new Error(`${path.basename(berkas)}: tidak ada </head>`);
  html = html.replace("</head>", `${BLOK}</head>`);
  return html === awal ? null : { html, sisip };
}

const periksa = process.argv.includes("--periksa");
const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  for (const sub of ["Exam", "Modul"]) {
    const dir = path.join(root, kursus.name, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) berkas.push(path.join(dir, f));
  }
}
let n = 0;
let total = 0;
for (const f of berkas.sort()) {
  const hasil = proses(f);
  if (!hasil) continue;
  n += 1; total += hasil.sisip;
  if (!periksa) fs.writeFileSync(f, hasil.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}, ${total} titik perayaan.`);
