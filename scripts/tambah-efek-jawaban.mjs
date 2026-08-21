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
// Tiap status punya warna bola sendiri supaya bedanya terbaca sekilas, bukan
// hanya dari ekspresi: emas untuk benar, kuning-jingga untuk sebagian, biru
// keabuan untuk salah. Lapisannya: bola bergradien radial, cincin tepi gelap,
// kilap spekular, DAN pantulan cahaya lingkungan di bawah (rim light) supaya
// bolanya tidak terlihat "ditempel" — itulah yang membuatnya tampak 3D.
function wajah(jenis) {
  const warna = {
    senang: ["#fff7b3", "#ffd43b", "#e09a00", "#6b4300", "#ffb300"],
    pikir: ["#fff3c4", "#ffc857", "#e08a00", "#6b4300", "#ff9f1c"],
    sedih: ["#e3f2ff", "#a9cdee", "#5c8fc2", "#21405e", "#7fb3e6"],
  }[jenis];
  const [terang, tengah, gelap, garis, rim] = warna;
  const id = `ej-${jenis}`;

  // Mata berkedip lewat SMIL: skala-Y mengecil sesaat tiap ~3 detik. Untuk
  // senang, mata melengkung bahagia yang "mengecil" saat berkedip; untuk yang
  // lain, bola mata yang menutup.
  const kedip = `<animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;1 1;1 .08;1 1;1 1" keyTimes="0;.9;.93;.96;1" dur="3.2s" repeatCount="indefinite"/>`;
  const mata = {
    senang: `<g transform="translate(36 42)"><g><path d="M-8 0 Q0 -10 8 0" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/>${kedip}</g></g>`
      + `<g transform="translate(64 42)"><g><path d="M-8 0 Q0 -10 8 0" fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"/>${kedip}</g></g>`,
    pikir: `<g transform="translate(36 44)"><g><ellipse rx="5.5" ry="6.5" fill="${garis}"/><circle cx="-1.8" cy="-2.2" r="1.8" fill="#fff"/>${kedip}</g></g>`
      + `<g transform="translate(64 40)"><g><ellipse rx="5.5" ry="6.5" fill="${garis}"/><circle cx="-1.8" cy="-2.2" r="1.8" fill="#fff"/>${kedip}</g></g>`
      + `<path d="M27 30 Q36 25 45 31" stroke="${garis}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M55 27 Q64 18 73 25" stroke="${garis}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    sedih: `<g transform="translate(36 43)"><g><ellipse rx="5.5" ry="7" fill="${garis}"/><circle cx="-1.8" cy="-2.5" r="1.8" fill="#fff"/>${kedip}</g></g>`
      + `<g transform="translate(64 43)"><g><ellipse rx="5.5" ry="7" fill="${garis}"/><circle cx="-1.8" cy="-2.5" r="1.8" fill="#fff"/>${kedip}</g></g>`
      + `<path d="M26 31 L44 36" stroke="${garis}" stroke-width="4" stroke-linecap="round"/><path d="M74 31 L56 36" stroke="${garis}" stroke-width="4" stroke-linecap="round"/>`,
  }[jenis];

  // Mulut "bernapas": bentuknya bergerak halus lewat SMIL pada atribut d.
  const mulut = {
    senang: `<path fill="#5a2d00"><animate attributeName="d" values="M30 56 Q50 78 70 56;M29 55 Q50 82 71 55;M30 56 Q50 78 70 56" dur="1.4s" repeatCount="indefinite"/></path>`
      + `<path d="M37 59 Q50 70 63 59" fill="#ff6b6b"/>`
      + `<path d="M40 57 Q50 62 60 57" fill="#fff" opacity=".9"/>`,
    pikir: `<path fill="none" stroke="${garis}" stroke-width="5" stroke-linecap="round"><animate attributeName="d" values="M34 66 Q50 60 66 68;M34 67 Q50 62 66 66;M34 66 Q50 60 66 68" dur="2.2s" repeatCount="indefinite"/></path>`
      + `<circle cx="76" cy="76" r="7" fill="${tengah}" stroke="${gelap}" stroke-width="2"/>`,
    // Menangis: mulut terbuka bergetar, plus air mata mengalir dari KEDUA mata
    // (dua tetes per mata, bergantian) — bukan satu tetes kecil seperti sebelumnya.
    sedih: `<path fill="#3a1c00" stroke="${garis}" stroke-width="3" stroke-linejoin="round"><animate attributeName="d" values="M38 70 Q50 60 62 70 Q50 80 38 70;M37 71 Q50 59 63 71 Q50 82 37 71;M38 70 Q50 60 62 70 Q50 80 38 70" dur=".7s" repeatCount="indefinite"/></path>`
      + `<path d="M42 70 Q50 64 58 70" fill="#ff8a80" opacity=".85"/>`
      + ["32", "40", "60", "68"].map((x, i) =>
        `<ellipse cx="${x}" cy="50" rx="3.5" ry="6" fill="#4fc3f7" stroke="#1e88e5" stroke-width=".8">`
        + `<animate attributeName="cy" values="48;80" dur="1.1s" begin="${(i * 0.28).toFixed(2)}s" repeatCount="indefinite"/>`
        + `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.7;1" dur="1.1s" begin="${(i * 0.28).toFixed(2)}s" repeatCount="indefinite"/>`
        + `</ellipse>`).join("")
      // genangan air mata di dasar bola
      + `<ellipse cx="50" cy="93" rx="14" ry="3" fill="#4fc3f7" opacity=".45"><animate attributeName="rx" values="10;16;10" dur="1.4s" repeatCount="indefinite"/></ellipse>`,
  }[jenis];

  const pipi = jenis === "senang"
    ? `<ellipse cx="23" cy="57" rx="8" ry="5" fill="#ff8a80" opacity=".55"/><ellipse cx="77" cy="57" rx="8" ry="5" fill="#ff8a80" opacity=".55"/>` : "";

  // Bintang berkilau hanya untuk benar: empat bintang kecil berkedip bergantian.
  const bintang = jenis === "senang"
    ? [[8, 18, 0], [92, 24, .35], [12, 86, .7], [90, 80, 1.05]].map(([x, y, d]) =>
      `<path transform="translate(${x} ${y})" d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" fill="#fff">`
      + `<animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="${d}s" repeatCount="indefinite"/>`
      + `<animateTransform attributeName="transform" type="scale" additive="sum" values=".4;1.2;.4" dur="1.4s" begin="${d}s" repeatCount="indefinite"/></path>`).join("")
    : "";

  // Jempol untuk benar: tangan terangkat di kanan-bawah bola, muncul dengan
  // "pop" lalu mengangguk kecil. Digambar bersih (bukan emoji font) supaya
  // warnanya serasi dengan bola dan sama di semua perangkat.
  const jempol = jenis === "senang"
    ? `<g class="ej-jempol" transform="translate(78 70)">`
      + `<animateTransform attributeName="transform" type="translate" additive="sum" values="0 14;0 -3;0 0" keyTimes="0;.6;1" dur=".5s" begin=".35s" fill="freeze"/>`
      + `<g><animateTransform attributeName="transform" type="rotate" values="-8;8;-8" dur="1.1s" begin=".9s" repeatCount="3"/>`
      // kepalan
      + `<rect x="-9" y="-2" width="16" height="15" rx="5" fill="${tengah}" stroke="${garis}" stroke-width="2.2"/>`
      // garis jari
      + `<path d="M-9 3 H7 M-9 8 H7" stroke="${garis}" stroke-width="1.6" opacity=".6"/>`
      // ibu jari terangkat
      + `<path d="M-2 -2 C-2 -8 -1 -14 3 -14 C7 -14 8 -9 7 -4 L7 -2" fill="${tengah}" stroke="${garis}" stroke-width="2.2" stroke-linejoin="round"/>`
      // kilap kecil di jempol
      + `<ellipse cx="2.5" cy="-9" rx="2" ry="3" fill="#fff" opacity=".55"/>`
      + `</g></g>`
    : "";

  return `<svg viewBox="0 0 100 112" width="72" height="81" aria-hidden="true">`
    + `<defs>`
    + `<radialGradient id="${id}-bola" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="${terang}"/><stop offset=".5" stop-color="${tengah}"/><stop offset="1" stop-color="${gelap}"/></radialGradient>`
    + `<radialGradient id="${id}-kilap" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-rim" cx="50%" cy="100%" r="55%"><stop offset="0" stop-color="${rim}" stop-opacity=".75"/><stop offset="1" stop-color="${rim}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-bayang" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
    + `</defs>`
    // Cincin pancar: gelombang yang melebar dari belakang bola saat muncul.
    + `<circle class="ej-pancar" cx="50" cy="50" r="46" fill="none" stroke="${rim}" stroke-width="3"/>`
    + `<ellipse class="ej-bayang" cx="50" cy="104" rx="26" ry="6" fill="url(#${id}-bayang)"/>`
    + `<g class="ej-bola">`
    + `<circle cx="50" cy="50" r="46" fill="url(#${id}-bola)" stroke="${gelap}" stroke-width="1.5"/>`
    + `<ellipse cx="50" cy="74" rx="34" ry="16" fill="url(#${id}-rim)"/>`
    + `<ellipse cx="33" cy="27" rx="16" ry="10" fill="url(#${id}-kilap)" transform="rotate(-25 33 27)"/>`
    + pipi + mata + mulut
    + `</g>`
    + bintang
    + jempol
    + `</svg>`;
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
/* Cincin pancar: melebar dan memudar dari belakang bola, dua kali saat muncul. */
@keyframes ejPancar{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.9);opacity:0}}
.ej-pancar{transform-box:fill-box;transform-origin:center;opacity:0;animation:ejPancar 1.1s ease-out .15s 2}
.ej-denyut-benar{animation:ejDenyutHijau .9s ease-out;border-radius:inherit}
.ej-denyut-salah{animation:ejDenyutMerah .7s ease-out;border-radius:inherit}
.ej-konfeti{position:absolute;left:50%;top:-20px;width:8px;height:8px;border-radius:2px;pointer-events:none;z-index:4;animation:ejKonfeti 1s cubic-bezier(.2,.8,.4,1) forwards}
/* Tombol bisu: kecil, di SEBELAH KIRI tombol chat (.visitor-fab 56px di
   right:24px/bottom:24px), bukan di bawahnya — di pojok yang sama keduanya
   tumpang tindih. right = 24 + 56 + 12 jarak = 92px; bottom = 24 + (56-40)/2
   = 32px supaya pusatnya sejajar dengan pusat tombol chat. Tetap di bawah
   panel chat (bottom:92px) dan overlay login (z-index 100000+). */
.ej-tombol-bisu{position:fixed;right:92px;bottom:32px;z-index:9000;width:40px;height:40px;border-radius:50%;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.82);color:#fff;font-size:18px;line-height:1;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);backdrop-filter:blur(6px);transition:transform .15s ease,opacity .2s ease;opacity:.85}
.ej-tombol-bisu:hover{transform:scale(1.08);opacity:1}
.ej-tombol-bisu[aria-pressed="true"]{opacity:.55}
@media (prefers-reduced-motion:reduce){
  .ej-panggung{animation:none;opacity:1;transform:translate(-50%,-100%)}
  .ej-isi{animation:ejLenyap .4s ease-in 2.4s forwards}
  .ej-senang .ej-bola,.ej-senang .ej-bayang,.ej-sedih .ej-bola,.ej-pikir .ej-bola,.ej-pancar{animation:none}
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

  /* ── Efek suara ─────────────────────────────────────────────────────────
     Disintesis lewat Web Audio API, bukan berkas audio: tanpa unduhan, tanpa
     aset yang perlu di-deploy, tanpa urusan lisensi. AudioContext dibuat malas
     pada perayaan pertama — selalu SESUDAH gestur kirim, sehingga tidak kena
     blokir autoplay browser. Volume rendah dan nadanya singkat; untuk salah
     dipilih dua nada turun yang lembut, bukan bunyi keras yang mempermalukan
     di ruang kelas. Tombol bisu tersimpan di localStorage supaya mahasiswa di
     tempat umum bisa mematikannya sekali untuk semua halaman. */
  var KUNCI_BISU = 'lms_suara_bisu';
  var ctxAudio = null;
  function bisu() { try { return localStorage.getItem(KUNCI_BISU) === '1'; } catch (e) { return false; } }
  function ambilCtx() {
    if (ctxAudio) return ctxAudio;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctxAudio = new AC(); } catch (e) { return null; }
    return ctxAudio;
  }
  // Satu nada: osilator sinus + envelope ADSR sederhana, lewat gain supaya
  // tidak ada "klik" di awal/akhir.
  function nada(ctx, freq, mulai, durasi, vol, jenis) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = jenis || 'sine'; o.frequency.setValueAtTime(freq, mulai);
    g.gain.setValueAtTime(0.0001, mulai);
    g.gain.exponentialRampToValueAtTime(vol, mulai + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);
    o.connect(g); g.connect(ctx.destination);
    o.start(mulai); o.stop(mulai + durasi + 0.02);
  }
  var SUARA = {
    // "ding" naik: C6 → E6, khas nada berhasil
    correct: function (ctx, t) { nada(ctx, 1046.5, t, 0.14, 0.16); nada(ctx, 1318.5, t + 0.11, 0.22, 0.18); },
    // satu nada netral pendek
    partial: function (ctx, t) { nada(ctx, 784.0, t, 0.16, 0.13, 'triangle'); },
    // dua nada turun yang lembut
    wrong:   function (ctx, t) { nada(ctx, 392.0, t, 0.14, 0.12, 'triangle'); nada(ctx, 311.1, t + 0.13, 0.22, 0.12, 'triangle'); }
  };
  window.bunyikanJawaban = function (status) {
    if (bisu() || !SUARA[status]) return;
    var ctx = ambilCtx(); if (!ctx) return;
    var jalankan = function () { try { SUARA[status](ctx, ctx.currentTime + 0.01); } catch (e) {} };
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().then(jalankan, function () {}); else jalankan();
  };
  window.setBisuSuara = function (nilai) {
    try { localStorage.setItem(KUNCI_BISU, nilai ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('.ej-tombol-bisu').forEach(function (b) {
      b.setAttribute('aria-pressed', nilai ? 'true' : 'false');
      b.title = nilai ? 'Suara jawaban: mati (klik untuk nyalakan)' : 'Suara jawaban: nyala (klik untuk matikan)';
      b.textContent = nilai ? '🔇' : '🔊';
    });
  };
  // Tombol bisu kecil di pojok kanan-bawah; dipasang sekali saat halaman siap.
  function pasangTombolBisu() {
    if (document.querySelector('.ej-tombol-bisu')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ej-tombol-bisu'; b.setAttribute('aria-label', 'Suara efek jawaban');
    b.addEventListener('click', function () { window.setBisuSuara(!bisu()); if (!bisu()) window.bunyikanJawaban('partial'); });
    document.body.appendChild(b);
    window.setBisuSuara(bisu());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasangTombolBisu); else pasangTombolBisu();

  /**
   * Rayakan hasil di atas kotak umpan balik. \`status\`: correct|partial|wrong.
   * Aman dipanggil berkali-kali: perayaan sebelumnya pada kotak yang sama dibuang.
   */
  window.rayakanJawaban = function (fb, status) {
    if (!fb || !WAJAH[status]) return;
    window.bunyikanJawaban(status);
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
