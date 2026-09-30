/**
 * Halaman modul: pilihan QUICK CHECK di tab Forum disimpan per mahasiswa per
 * modul dan dipulihkan saat halaman dimuat (laporan mahasiswa Pemodelan CAD
 * Modul 2, 29 September 2026).
 *
 * MASALAHNYA. Jajak quick check Forum (`.poll-opts` id fp1..fp3, opsi
 * `onclick="voteForum(n,this,idx)"`, benar/salah dicek lewat hash) hanya
 * menandai DOM: voteForum memasang `dataset.done`, mengunci opsi, mewarnai opsi
 * terpilih, dan menampilkan umpan balik fpNr/fpNw — tanpa menyimpan apa pun.
 * Setelah muat ulang semua poll kosong lagi, status forum menjadi "PG: 0/N
 * dipilih" + "⚠ N pilihan ganda belum dipilih", dan checkForumReady membuat
 * allFilled=false sehingga tombol "📋 Copy Forum (kode HTML)" mati sampai poll
 * dipilih ulang. Teks diskusi sendiri sudah pulih dari server (PROGRES-MODUL).
 * Quick check tidak dinilai; server menghitung forumSelesai hanya dari tiga
 * jawaban ≥ 30 kata.
 *
 * YANG DIPASANG. Satu blok bertanda PILIHAN-POLL-FORUM tepat sesudah
 * `<!-- PROGRES-MODUL: akhir -->` (tepat sebelum `</body>`), sama persis di
 * ke-84 halaman:
 *   - skrip klasik kecil yang menangkap checkForumReady ASLI halaman saat
 *     parsing, sebelum skrip module (termasuk PROGRES-MODUL) membungkusnya;
 *   - satu skrip module yang:
 *     1. membungkus window.voteForum. Mahasiswa aktif (peran student, termasuk
 *        akun simulasi; bukan Mode Preview) → pilihan baru ditulis ke
 *        localStorage `forum_poll_<MODUL_ID>_<nim>` =
 *        {"pilihan":{"1":idx,…},"diServer":["1",…],"forumBelumSelesai":true}
 *        (kunci khusus: objek draft forum ditulis ulang utuh dari DOM oleh
 *        _saveDraft, jadi tidak bisa ditumpangi — saat blok ini dibuat
 *        _draftKey juga mati di 43 halaman dan draft kosong lagi saat muat
 *        ulang, keduanya diperbaiki scripts/draft-modul.mjs; bentuk datar
 *        {"1":idx} dari v1 tetap dibaca),
 *        lalu dikirim ke server lewat callable TERPISAH `saveModulPoll`
 *        `{modulId, nim, pinHash, pilihanPoll}`. (v1 memakai mode poll-saja
 *        callable teks forum; versi lama callable itu menulis tiga teks kosong
 *        bila `jawaban` tidak ada, dan fungsi-fungsi backend diperbarui satu
 *        per satu saat deploy — selisih 2–11 detik di log nyata — atau bisa
 *        di-rollback, sehingga penanda kemampuan dari getModulProgress tidak
 *        menjamin versi callable teks. Backend tanpa saveModulPoll menjawab
 *        NOT_FOUND tanpa menulis apa pun.) Panggilan hanya dibuat bila respons
 *        getModulProgress TERAKHIR memuat kunci `forumPoll` (ditetapkan ulang
 *        setiap respons; sekadar menghemat panggilan). Galat apa pun atau
 *        respons tanpa forumPoll menghentikan panggilan di sesi itu; pilihan
 *        tetap di localStorage dan diunggah sekali pada muat berikutnya.
 *        Mode Preview: poll tidak bereaksi (Forum memang disembunyikan) dan
 *        tidak ada yang disimpan. Dosen/tamu: perilaku lama (hanya DOM).
 *     2. mendengarkan event 'progres-modul:diterapkan' dari PROGRES-MODUL (kait
 *        v2 scripts/tambah-progres-modul.mjs). Sumber pilihan: `forumPoll`
 *        server lebih dulu (server menang, localStorage diselaraskan, kunci
 *        dicatat di `diServer`), lalu localStorage. Kunci yang pernah
 *        dikonfirmasi server tetapi kini tidak ada di `forumPoll` dianggap
 *        DIRESET (dosen menghapus field forumPoll): dibuang dari localStorage,
 *        tidak dipulihkan, tidak diunggah ulang. Tampilan dipulihkan dengan
 *        memanggil voteForum halaman sendiri — hasilnya persis seperti klik:
 *        dataset.done, opsi terkunci, warna hijau/pink, umpan balik fpNr/fpNw,
 *        statistik "PG N/N". Selama pemulihan checkForumReady memakai fungsi
 *        asli halaman (tanpa penyimpanan forum ber-debounce PROGRES-MODUL), jadi
 *        pemulihan tidak pernah mengirim teks forum. Pilihan lokal yang belum
 *        dikonfirmasi server diunggah sekali. Gagal memuat progres ({ok:false})
 *        → pulih dari localStorage saja, tanpa panggilan. Bersama
 *        PROGRES-MODUL:PENJAGA-FORUM (#968): {ok:true} dikirim sebagai
 *        pernyataan terakhir terapkanProgres, jadi tepat saat tab Forum
 *        mahasiswa terbuka; {ok:false} dikirim sesudah forumGagal pada setiap
 *        kegagalan (juga coba ulang otomatis 3/10/30 detik) dan bisa disusul
 *        {ok:true}.
 *     3. membungkus window.checkForumReady paling luar (keputusan dosen): poll
 *        yang belum dipilih tetap wajib untuk pengiriman PERTAMA forum. Tombol
 *        Copy Forum hanya dilepaskan (catatan lembut di #forum-blocked-msg)
 *        bila getModulProgress melaporkan forumSelesai, ketiga jawaban ≥
 *        FORUM_MIN_WORDS, dan peramban ini BELUM pernah melihat forum modul itu
 *        belum selesai (`forumBelumSelesai`, ditulis setiap kali respons
 *        melaporkan forumSelesai false). Jadi yang dibebaskan hanya forum yang
 *        sudah lengkap sebelum blok ini ada (pilihan lamanya memang hilang) atau
 *        yang dilengkapi di perangkat lain; forum yang dilengkapi di peramban
 *        ini (teks tersimpan otomatis 1,5 detik sesudah lengkap) tetap menunggu
 *        poll walau halaman dimuat ulang.
 *   Server (backend saveModulPoll) memegang pilihan pertama: kunci poll yang
 *   sudah ada tidak ditimpa, sama seperti UI yang terkunci setelah sekali pilih.
 *
 * Opsi dicari lewat atribut onclick (bukan posisi), jadi blok tidak bergantung
 * pada jumlah poll: Matematika 4, Getaran Mekanik, dan Optimalisasi punya 2
 * (fp1–fp2), Sisken, Teknik Tenaga Listrik, dan Pemodelan CAD 3.
 *
 * REGENERASI. Generator TTL membangun Modul-1 dari Sisken Modul-1 dan Modul
 * 2–14 dari TTL Modul-1; CAD membangun Modul-1 dari TTL Modul-1 dan Modul 2–14
 * dari CAD Modul-1; enrich-sisken-modules.mjs menyunting Sisken di tempat.
 * Semuanya mewarisi blok ini. Karena generator TTL/CAD mengganti nama/ID
 * course, "Modul 1 ", "Pertemuan 1 ", "Tugas 1 ", "pertemuan-1", dan hash
 * `window._forumPollAnswerHashes = {…}` dengan hitungan pasti, blok sengaja
 * tidak memuat token itu, nomor modul, `function voteForum(`, maupun literal
 * `voteForum(<n>,this,<k>)` (dihitung validate-sisken-forum.mjs dan
 * periksa_modul.py). Jalankan sesudah tambah-progres-modul.mjs; `--periksa`
 * sesudah regenerasi harus 0.
 *
 * Blok AI-CHAT-AGENT tidak disentuh (diperiksa: identik sebelum/sesudah).
 * Halaman ujian (voteForum mati tanpa markup poll) dan salinan konflik OneDrive
 * (*-DEDIK-PC.html) tidak termasuk.
 *
 * Idempoten: blok bertanda (versi apa pun) diganti di tempat; jalan kedua
 * melaporkan 0 halaman. Akhir baris berkas (LF/CRLF) dipertahankan.
 *
 * Pakai:
 *   node scripts/simpan-pilihan-poll.mjs            # terapkan
 *   node scripts/simpan-pilihan-poll.mjs --periksa  # laporan saja; keluar 1 bila ada yang akan berubah
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const VERSI = "v2";
const AWAL = `<!-- PILIHAN-POLL-FORUM:BEGIN ${VERSI} — dipasang scripts/simpan-pilihan-poll.mjs -->`;
const AKHIR = `<!-- PILIHAN-POLL-FORUM:END ${VERSI} -->`;
const RX_BLOK = /<!-- PILIHAN-POLL-FORUM:BEGIN v\d+[^>]*-->[\s\S]*?<!-- PILIHAN-POLL-FORUM:END v\d+ -->/g;
const PM_AWAL = "<!-- PROGRES-MODUL: awal -->";
const PM_AKHIR = "<!-- PROGRES-MODUL: akhir -->";
const KAIT = "progres-modul:diterapkan";

const BLOK = `${AWAL}
<script>
// Quick check Forum (scripts/simpan-pilihan-poll.mjs): checkForumReady ASLI
// halaman ditangkap saat parsing, sebelum skrip module membungkusnya, supaya
// pemulihan pilihan tidak memicu penyimpanan teks forum (PROGRES-MODUL).
window._pollForumAsli = { cek: window.checkForumReady };
</script>
<script type="module">
import { getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-functions.js";
(function () {
  var voteDalam = window.voteForum;
  var cekLuar = window.checkForumReady;
  var cekAsli = (window._pollForumAsli && typeof window._pollForumAsli.cek === 'function') ? window._pollForumAsli.cek : null;
  if (typeof voteDalam !== 'function') return;
  var RX_OPSI = /voteForum\\(\\s*(\\d+)\\s*,\\s*this\\s*,\\s*(\\d+)\\s*\\)/;
  var punya = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  var fx = null;
  function panggil(nama, data) {
    if (!fx) fx = getFunctions(getApp(), 'asia-southeast1');
    return httpsCallable(fx, nama)(data).then(function (r) { return (r && r.data) || {}; });
  }
  function identitas() { try { return typeof getIdentityLocal === 'function' ? getIdentityLocal() : null; } catch (e) { return null; } }
  // Sama dengan mhsAktif() PROGRES-MODUL: mahasiswa + akun simulasi, bukan preview.
  function aktif() {
    var me = identitas();
    return !!(me && me.role === 'student' && me.nim && window.MODUL_ID && !window._previewMode);
  }
  function kunciLokal() { var me = identitas(); return 'forum_poll_' + String(window.MODUL_ID) + '_' + String(me && me.nim); }
  function sah(k, v) { return /^[1-3]$/.test(k) && typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 9; }
  function bersihkan(o) {
    var r = {};
    if (o && typeof o === 'object' && !Array.isArray(o)) Object.keys(o).forEach(function (k) { if (sah(k, o[k])) r[k] = o[k]; });
    return r;
  }
  // localStorage: {pilihan: {"1": idx}, diServer: ["1"] (dikonfirmasi server),
  // forumBelumSelesai: true (peramban ini pernah melihat forum belum selesai)}.
  // Bentuk datar {"1": idx} (v1) dibaca sebagai pilihan yang belum dikonfirmasi.
  function bacaLokal() {
    var o = null;
    try { o = JSON.parse(localStorage.getItem(kunciLokal()) || 'null'); } catch (e) { o = null; }
    if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
    var datar = !punya(o, 'pilihan');
    var pilihan = bersihkan(datar ? o : o.pilihan);
    var diServer = (!datar && Array.isArray(o.diServer)) ? o.diServer.filter(function (k, i, a) { return punya(pilihan, k) && a.indexOf(k) === i; }) : [];
    return { pilihan: pilihan, diServer: diServer, forumBelumSelesai: !datar && o.forumBelumSelesai === true };
  }
  function tulisLokal(o) { try { localStorage.setItem(kunciLokal(), JSON.stringify(o)); } catch (e) {} }
  // Peta forumPoll sah dari respons server, atau null (backend tanpa saveModulPoll).
  function petaServer(o) {
    return (o && typeof o === 'object' && punya(o, 'forumPoll') && o.forumPoll && typeof o.forumPoll === 'object' && !Array.isArray(o.forumPoll)) ? bersihkan(o.forumPoll) : null;
  }

  var bisaPoll = false;            // respons getModulProgress TERAKHIR memuat forumPoll
  var forumSelesaiServer = false;  // forumSelesai dari respons getModulProgress terakhir
  var dikonfirmasi = {};           // pilihan yang diketahui tersimpan di server (sesi ini)
  var memulihkan = false, berhenti = false, kirimJalan = false, kirimLagi = false;

  // Peta forumPoll LENGKAP dari server (getModulProgress / saveModulPoll). Server
  // menang; kunci yang pernah dikonfirmasi tetapi kini tidak ada = direset dosen.
  function serap(server) {
    var l = bacaLokal(), ubah = false;
    l.diServer = l.diServer.filter(function (k) {
      if (punya(server, k)) return true;
      delete l.pilihan[k]; ubah = true; return false;
    });
    dikonfirmasi = {};
    Object.keys(server).forEach(function (k) {
      dikonfirmasi[k] = server[k];
      if (l.pilihan[k] !== server[k]) { l.pilihan[k] = server[k]; ubah = true; }
      if (l.diServer.indexOf(k) < 0) { l.diServer.push(k); ubah = true; }
    });
    if (ubah) tulisLokal(l);
  }
  // Hanya lewat callable pilihan poll (bukan callable teks forum): backend yang
  // belum mengenalnya menjawab NOT_FOUND tanpa menulis apa pun.
  function kirim() {
    if (!bisaPoll || berhenti || !aktif()) return;
    if (kirimJalan) { kirimLagi = true; return; }
    var l = bacaLokal(), baru = {}, ada = false;
    Object.keys(l.pilihan).forEach(function (k) {
      if (!punya(dikonfirmasi, k) && l.diServer.indexOf(k) < 0) { baru[k] = l.pilihan[k]; ada = true; }
    });
    var me = identitas(), pin = window._sessionPinHash;
    if (!ada || !pin) return;
    kirimJalan = true;
    panggil('saveModulPoll', { modulId: window.MODUL_ID, nim: String(me.nim), pinHash: pin, pilihanPoll: baru }).then(function (r) {
      var peta = petaServer(r);
      if (peta) serap(peta);
      else berhenti = true;   // respons di luar kontrak: jangan dianggap tersimpan
    }).catch(function (e) {
      // Tanpa coba ulang di sesi ini: setiap panggilan melewati PIN + penguncian
      // per NIM, dan backend tanpa saveModulPoll menjawab NOT_FOUND. Pilihan tetap
      // di localStorage dan diunggah sekali pada muat berikutnya.
      berhenti = true;
      console.warn('[poll-forum] gagal menyimpan pilihan quick check:', e && (e.code || e.message));
    }).finally(function () {
      kirimJalan = false;
      if (kirimLagi) { kirimLagi = false; kirim(); }
    });
  }

  function cariOpsi(p, n, idx) {
    var opsi = p.querySelectorAll('[onclick]');
    for (var i = 0; i < opsi.length; i++) {
      var m = RX_OPSI.exec(opsi[i].getAttribute('onclick') || '');
      if (m && m[1] === String(n) && Number(m[2]) === idx) return opsi[i];
    }
    return null;
  }
  // Tampilan dipulihkan lewat voteForum halaman sendiri (persis seperti klik).
  function pulihkan(pilihan) {
    memulihkan = true;
    try {
      Object.keys(pilihan).forEach(function (n) {
        var p = document.getElementById('fp' + n);
        if (!p || p.dataset.done) return;
        var opt = cariOpsi(p, n, pilihan[n]);
        if (opt) voteDalam.call(window, Number(n), opt, pilihan[n]);
      });
    } catch (e) { console.warn('[poll-forum] gagal memulihkan pilihan quick check:', e); }
    finally { memulihkan = false; }
  }

  // Keputusan dosen: poll kosong tidak mematikan tombol Copy Forum bila forum
  // sudah lengkap di server SEBELUM peramban ini melihatnya belum selesai
  // (quick check tidak dinilai); pengiriman pertama tetap menunggu poll.
  function lunakkan() {
    if (!forumSelesaiServer || !aktif() || bacaLokal().forumBelumSelesai) return;
    var sisa = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.poll-opts[id^="fp"]'), function (p) { if (!p.dataset.done) sisa++; });
    if (!sisa) return;
    var minimal = typeof FORUM_MIN_WORDS === 'number' ? FORUM_MIN_WORDS : 30;
    var hitung = typeof countWords === 'function' ? countWords : function (s) { return String(s || '').trim().split(/\\s+/).filter(Boolean).length; };
    var lengkap = ['ans-fq1', 'ans-fq2', 'ans-fq3'].every(function (id) { var ta = document.getElementById(id); return !!ta && hitung(ta.value) >= minimal; });
    if (!lengkap) return;
    var btn = document.getElementById('btn-copy-forum');
    if (!btn) return;
    if (typeof window._setBtnState === 'function') window._setBtnState(btn, true);
    else { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    var pesan = document.getElementById('forum-blocked-msg');
    if (pesan) {
      var catatan = document.createElement('span');
      catatan.style.color = 'var(--muted, #94a3b8)';
      catatan.textContent = 'ℹ ' + sisa + ' quick check belum dipilih (tidak dinilai) — forum Anda sudah tersimpan di server, tombol tetap aktif.';
      pesan.textContent = '';
      pesan.appendChild(catatan);
    }
  }

  window.voteForum = function (n, opt, idx) {
    if (window._previewMode) return;   // Mode Preview: quick check tidak bereaksi dan tidak disimpan
    var p = document.getElementById('fp' + n);
    var sebelum = !!(p && p.dataset.done);
    var r = voteDalam.apply(this, arguments);
    var k = String(n), v = Number(idx);
    if (!memulihkan && !sebelum && p && p.dataset.done && sah(k, v) && aktif()) {
      var l = bacaLokal();
      if (l.diServer.indexOf(k) < 0) { l.pilihan[k] = v; tulisLokal(l); }   // server menang atas kunci terkonfirmasi
      kirim();
    }
    return r;
  };
  if (typeof cekLuar === 'function') {
    window.checkForumReady = function () {
      var r = (memulihkan && cekAsli) ? cekAsli.apply(this, arguments) : cekLuar.apply(this, arguments);
      try { lunakkan(); } catch (e) { console.warn('[poll-forum]', e); }
      return r;
    };
  }

  window.addEventListener('${KAIT}', function (ev) {
    if (!aktif()) return;
    var d = (ev && ev.detail) || {};
    if (d.ok && d.progres && typeof d.progres === 'object') {
      forumSelesaiServer = d.progres.forumSelesai === true;
      if (d.progres.forumSelesai === false) {
        var l = bacaLokal();
        if (!l.forumBelumSelesai) { l.forumBelumSelesai = true; tulisLokal(l); }
      }
      var peta = petaServer(d.progres);
      bisaPoll = peta !== null;   // ditetapkan ulang setiap respons (rollback functions)
      if (peta) serap(peta);
    }
    pulihkan(bacaLokal().pilihan);
    kirim();
    try { lunakkan(); } catch (e) { console.warn('[poll-forum]', e); }
  });
})();
</script>
${AKHIR}`;

// Blok diwarisi generator TTL/CAD yang mengganti token ini dengan hitungan pasti.
const TOKEN_TERLARANG = [
  /Modul \d/, /Pertemuan \d/, /Tugas \d/, /Forum \d/, /pertemuan-\d/i, /Tugas\d_/, /modul-\d/i, /modul_\d/i,
  /_forumPollAnswerHashes/, /window\._pa\b/, /function voteForum\(/, /voteForum\(\d/,
  /math4|getaran|optoauto|sistem_kendali|kendali_cerdas|pemodelan|tenaga_listrik|tenaga listrik/i, /#page-(?:setup|python|kelompok)/,
];
for (const rx of TOKEN_TERLARANG) {
  if (rx.test(BLOK)) throw new Error(`blok PILIHAN-POLL-FORUM memuat token terlarang ${rx}`);
}
// Teks forum hanya disimpan PROGRES-MODUL (dengan jawaban); blok ini tidak boleh menyebut callable itu sama sekali.
if (BLOK.includes("saveModulForum")) throw new Error("blok PILIHAN-POLL-FORUM tidak boleh memuat saveModulForum — pilihan poll hanya lewat saveModulPoll");
if (BLOK.split("'saveModulPoll'").length !== 2) throw new Error("blok PILIHAN-POLL-FORUM harus memanggil saveModulPoll tepat sekali");

const hitung = (s, sub) => s.split(sub).length - 1;

/** Isi seluruh blok AI-CHAT-AGENT (HTML) — harus identik sebelum/sesudah. */
function blokAi(html) {
  return html.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || [];
}

/** Atribut tag <script> yang melingkupi indeks `i` (null bila di luar skrip). */
function skripPelingkup(html, i) {
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (m.index < i && i < m.index + m[0].length) return m[1];
  }
  return null;
}

function prasyarat(html) {
  for (const [nama, n] of [["function voteForum(", 1], ["function checkForumReady(", 1], [PM_AWAL, 1], [PM_AKHIR, 1],
    ['id="btn-copy-forum"', 1], ['id="forum-blocked-msg"', 1], ['id="forumPGStat"', 1], ["const MODUL_ID = '", 1]]) {
    const c = hitung(html, nama);
    if (c !== n) throw new Error(`\`${nama}\` muncul ${c}x, harusnya ${n}`);
  }
  const pmAwal = html.indexOf(PM_AWAL), pmAkhir = html.indexOf(PM_AKHIR);
  if (pmAkhir < pmAwal) throw new Error("penanda PROGRES-MODUL terbalik");
  for (const f of ["function voteForum(", "function checkForumReady("]) {
    const i = html.indexOf(f);
    const tag = skripPelingkup(html, i);
    if (tag === null || /type\s*=\s*["']module["']/i.test(tag)) throw new Error(`\`${f}\` harus berada di skrip klasik (global)`);
    if (i > pmAwal) throw new Error(`\`${f}\` harus didefinisikan sebelum blok PROGRES-MODUL`);
  }
  const pm = html.slice(pmAwal, pmAkhir);
  if (hitung(pm, `new CustomEvent('${KAIT}'`) !== 1 || hitung(pm, "kabarkan({ ok: true, progres: p });") !== 1 || hitung(pm, "kabarkan({ ok: false });") !== 1) {
    throw new Error(`kait '${KAIT}' belum ada di PROGRES-MODUL — jalankan dulu node scripts/tambah-progres-modul.mjs`);
  }
  // Poll: ≥ 2 grup fpN, masing-masing tepat 4 opsi voteForum(n,this,0..3).
  const poll = [...html.matchAll(/class="poll-opts" id="fp(\d)"/g)].map((m) => m[1]);
  if (poll.length < 2) throw new Error(`hanya ${poll.length} poll quick check (fpN) ditemukan`);
  for (const n of poll) {
    const opsi = [...html.matchAll(new RegExp(`voteForum\\(${n},this,(\\d)\\)`, "g"))].map((m) => m[1]).sort().join("");
    if (opsi !== "0123") throw new Error(`poll fp${n}: opsi voteForum(${n},this,k) = [${opsi}], harap 0123`);
    for (const s of ["r", "w"]) if (!html.includes(`id="fp${n}${s}"`)) throw new Error(`umpan balik fp${n}${s} tidak ada`);
  }
  return poll.length;
}

function proses(berkas) {
  const awal = fs.readFileSync(berkas, "utf8");
  const eol = awal.includes("\r\n") ? "\r\n" : "\n";
  const blok = BLOK.replace(/\n/g, eol);
  const catatan = [];
  const nPoll = prasyarat(awal);
  let html = awal;

  const lama = html.match(RX_BLOK) || [];
  if (lama.length > 1) throw new Error(`blok PILIHAN-POLL-FORUM muncul ${lama.length}x, harusnya 1`);
  const jangkar = PM_AKHIR + eol;
  const i = html.indexOf(PM_AKHIR);
  if (!html.startsWith(jangkar, i)) throw new Error("`<!-- PROGRES-MODUL: akhir -->` tidak diikuti baris baru");
  const posisi = i + jangkar.length;
  if (lama.length === 1) {
    const j = html.indexOf(lama[0]);
    if (j === posisi && html.startsWith(eol, j + lama[0].length)) {
      if (lama[0] !== blok) { html = html.slice(0, j) + blok + html.slice(j + lama[0].length); catatan.push("diperbarui"); }
    } else {
      // Blok tergeser dari tempatnya: buang lalu sisipkan ulang tepat sesudah PROGRES-MODUL.
      html = html.slice(0, j) + html.slice(j + lama[0].length + (html.startsWith(eol, j + lama[0].length) ? eol.length : 0));
      const k = html.indexOf(jangkar) + jangkar.length;
      html = html.slice(0, k) + blok + eol + html.slice(k);
      catatan.push("dipindahkan");
    }
  } else {
    html = html.slice(0, posisi) + blok + eol + html.slice(posisi);
    catatan.push("dipasang");
  }
  catatan.push(`poll×${nPoll}`);

  // ── Penjaga hasil ──
  if (hitung(html, AWAL) !== 1 || hitung(html, AKHIR) !== 1) throw new Error("blok PILIHAN-POLL-FORUM harus tepat sekali");
  if (!html.includes(jangkar + blok + eol)) throw new Error("blok PILIHAN-POLL-FORUM harus tepat sesudah `<!-- PROGRES-MODUL: akhir -->`");
  if (html.includes("pilihanPoll") && html.replace(blok, "").includes("pilihanPoll")) throw new Error("`pilihanPoll` muncul di luar blok PILIHAN-POLL-FORUM");
  if (html.replace(blok, "").includes("saveModulPoll")) throw new Error("`saveModulPoll` muncul di luar blok PILIHAN-POLL-FORUM");
  const aiLama = blokAi(awal), aiBaru = blokAi(html);
  if (aiLama.length !== aiBaru.length || aiLama.some((b, x) => b !== aiBaru[x])) throw new Error("blok AI-CHAT-AGENT berubah — dilarang");
  for (const b of aiBaru) if (b.includes("PILIHAN-POLL-FORUM")) throw new Error("blok PILIHAN-POLL-FORUM jatuh di dalam blok AI-CHAT-AGENT");

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

// Semua halaman diperiksa dulu; berkas baru ditulis bila tidak ada yang gagal.
const hasil = [];
const rekap = {};
for (const f of berkas.sort()) {
  let h;
  try { h = proses(f); }
  catch (e) { throw new Error(`${path.relative(root, f)}: ${e.message}`); }
  if (!h) continue;
  hasil.push([f, h.html]);
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
}
if (!periksa) for (const [f, html] of hasil) fs.writeFileSync(f, html);
const n = hasil.length;
console.log(`${n} dari ${berkas.length} halaman modul ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
if (periksa && n > 0) process.exitCode = 1;
