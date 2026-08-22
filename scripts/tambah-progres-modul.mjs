/**
 * Progres modul berurutan (permintaan dosen, 22 Agustus 2026).
 *
 * Pada 56 halaman modul (4 course x 14):
 *   1. Blok "Daftar Periksa Sebelum Lanjut" (centang lokal Sisken) dihapus,
 *      beserta fungsi siskenCentang-nya. Kartu "Salah Kaprah" di bagian yang
 *      sama tetap dipertahankan.
 *   2. Di AKHIR tiap bagian materi (div.section, kecuali "Daftar Pustaka")
 *      disisipkan kotak centang pernyataan "Saya sudah mempelajari dan
 *      memahami bagian ini". Hanya kotak berikutnya yang aktif: centang harus
 *      urut dari bagian pertama, tidak bisa lompat. Disimpan di server lewat
 *      callable setModulCentang (server juga menolak yang tidak urut).
 *   3. Tab Tugas, Forum, dan Hasil terkunci sampai semua kotak dicentang.
 *   4. Saat login, callable checkModulAccess memeriksa modul sebelumnya:
 *      centang lengkap + tugas selesai + forum selesai. Bila belum, halaman
 *      ditutup overlay kunci dengan rincian yang kurang dan tautan ke modul
 *      sebelumnya. Modul 1 selalu terbuka.
 *   5. Jawaban forum disimpan ke server (saveModulForum) setiap kali berubah
 *      (debounce), dan dipulihkan saat login, sehingga "forum selesai"
 *      terdefinisi di server.
 *
 * Dosen, Mode Preview, dan akun simulasi tidak digerbang (kotak bisa
 * dicentang bebas, tidak disimpan). UTS/UAS tidak disentuh.
 *
 * Runtime ditulis sebagai <script type="module"> karena instance Firebase
 * Functions halaman hidup di module script; getApp() mengambil app yang sama.
 *
 * Idempoten lewat penanda PROGRES-MODUL; blok lama diganti, kotak centang
 * yang sudah ada tidak digandakan.
 *
 * Pakai:
 *   node scripts/tambah-progres-modul.mjs            # terapkan
 *   node scripts/tambah-progres-modul.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const PENANDA_AWAL = "<!-- PROGRES-MODUL: awal -->";
const PENANDA_AKHIR = "<!-- PROGRES-MODUL: akhir -->";

// 1. Blok daftar periksa Sisken (h3 + div.sisken-periksa) dan fungsinya.
const RX_DAFTAR_PERIKSA = /\n  <h3 class="reveal"[^>]*>Daftar Periksa Sebelum Lanjut<\/h3>\n  <div class="sisken-periksa reveal" id="periksa-\d+">[\s\S]*?\n  <\/div>(?=\n<\/div>)/;
const RX_SISKEN_CENTANG_JS = /\nwindow\.siskenCentang=function\(n,i\)\{[\s\S]*?\n\};?(?=\n)/;

// 2. Kotak centang di akhir bagian.
const RX_SECTION_AWAL = /<div class="section" id="(m-[a-z0-9-]+)">/g;
function judulBagian(html) {
  const m = /<h2 class="section-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/.exec(html);
  return m ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/\s*:\s*/g, ": ").trim() : "";
}
// Cari indeks penutup </div> yang seimbang untuk div yang dibuka di `mulai`.
function akhirDiv(html, mulai) {
  const rx = /<div\b|<\/div>/g;
  rx.lastIndex = mulai;
  let dalam = 0, m;
  while ((m = rx.exec(html))) {
    if (m[0] === "<div") dalam += 1;
    else { dalam -= 1; if (dalam === 0) return m.index; }
  }
  return -1;
}
function kotakCentang(i, judul) {
  const j = judul.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `\n  <label class="pm-centang" data-pm="${i}">`
    + `<input type="checkbox" disabled aria-describedby="pm-status-${i}">`
    + `<span class="pm-teks">Saya sudah mempelajari dan memahami bagian ini${j ? ` — <b>${j}</b>` : ""}.</span>`
    + `<em class="pm-status" id="pm-status-${i}"></em></label>\n`;
}

// 3. CSS + runtime.
const BLOK = `${PENANDA_AWAL}
<style>
.pm-centang{display:flex;align-items:center;gap:16px;margin:32px 0 8px;padding:18px 22px;border:2px solid rgba(0,224,158,.45);border-radius:16px;background:linear-gradient(135deg,rgba(0,224,158,.14),rgba(34,211,238,.10));box-shadow:0 0 0 1px rgba(0,224,158,.12),0 10px 30px rgba(0,0,0,.28);color:#eaf2ff;font-size:17px;line-height:1.55;cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s}
.pm-centang:hover{border-color:rgba(0,224,158,.75);box-shadow:0 0 0 1px rgba(0,224,158,.25),0 12px 34px rgba(0,224,158,.18)}
.pm-centang input{width:26px;height:26px;margin:0;accent-color:#00e09e;flex:none;cursor:pointer}
.pm-centang input:disabled{cursor:not-allowed}
.pm-centang .pm-teks b{color:#7ff5cf;font-weight:800}
.pm-centang.pm-selesai{border-color:#00e09e;background:linear-gradient(135deg,rgba(0,224,158,.26),rgba(34,211,238,.16));box-shadow:0 0 0 1px rgba(0,224,158,.35),0 10px 30px rgba(0,224,158,.18)}
.pm-centang.pm-selesai .pm-teks{color:#ffffff}
.pm-centang.pm-nonaktif{opacity:.5;cursor:not-allowed;border-style:dashed;background:rgba(148,163,184,.06);box-shadow:none}
.pm-centang .pm-status{margin-left:auto;flex:none;font:700 12px 'JetBrains Mono',monospace;font-style:normal;white-space:nowrap;padding:6px 12px;border-radius:999px;background:rgba(0,224,158,.16);color:#9ff3d2;border:1px solid rgba(0,224,158,.35)}
.pm-centang.pm-selesai .pm-status{background:#00e09e;color:#04261b;border-color:#00e09e}
.pm-centang.pm-nonaktif .pm-status{background:rgba(148,163,184,.12);color:#94a3b8;border-color:rgba(148,163,184,.3)}
@media(max-width:640px){.pm-centang{flex-wrap:wrap;font-size:15.5px;padding:16px}.pm-centang .pm-status{margin-left:42px}}
.nav-tab.pm-terkunci{opacity:.45;cursor:not-allowed;position:relative}
.nav-tab.pm-terkunci::after{content:' 🔒';font-size:10px}
.pm-kunci-modal{max-width:520px!important;text-align:left!important}
.pm-kunci-modal h2{text-align:center}
.pm-kunci-modal ul{list-style:none;padding:0;margin:14px 0 18px;display:grid;gap:8px}
.pm-kunci-modal li{padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font-size:.9rem;color:#cbd5e1}
.pm-kunci-modal li.ok{border-color:rgba(0,224,158,.35);color:#9ff3d2}
.pm-kunci-modal li.kurang{border-color:rgba(251,113,133,.35);color:#fecdd3}
.pm-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:9500;background:rgba(15,23,42,.95);border:1px solid rgba(148,163,184,.35);color:#e2e8f0;padding:10px 16px;border-radius:10px;font-size:.85rem;box-shadow:0 12px 32px rgba(0,0,0,.45);opacity:0;transition:opacity .25s;pointer-events:none;max-width:min(92vw,520px);text-align:center}
.pm-toast.tampil{opacity:1}
</style>
<script type="module">
import { getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-functions.js";
(function () {
  var SIM_NIMS = new Set(['41399999901']);
  var TAB_TERKUNCI = ['tugas', 'forum', 'hasil'];
  var fx = null;
  function panggil(nama, data) {
    if (!fx) fx = getFunctions(getApp(), 'asia-southeast1');
    return httpsCallable(fx, nama)(data).then(function (r) { return (r && r.data) || {}; });
  }
  function identitas() { try { return typeof getIdentityLocal === 'function' ? getIdentityLocal() : null; } catch (e) { return null; } }
  // Hanya mahasiswa sungguhan yang digerbang.
  function mhsAktif() {
    var me = identitas();
    return !!(me && me.role === 'student' && me.nim && !SIM_NIMS.has(String(me.nim)) && !window._previewMode);
  }
  function dasar() {
    var me = identitas();
    return { modulId: window.MODUL_ID, nim: me && String(me.nim), pinHash: window._sessionPinHash };
  }
  var nomorModul = (function () { var m = /-modul-(\\d+)$/.exec(String(window.MODUL_ID || '')); return m ? Number(m[1]) : 1; })();

  var kotak = Array.prototype.slice.call(document.querySelectorAll('.pm-centang'));
  var total = kotak.length;
  var centang = 0;          // jumlah bagian yang sudah dicentang (berurutan)
  var KUNCI_BEBAS = 'pm_centang_bebas_' + String(window.MODUL_ID || location.pathname);
  function muatBebas() { try { var v = parseInt(localStorage.getItem(KUNCI_BEBAS), 10); return Number.isFinite(v) ? Math.max(0, Math.min(total, v)) : 0; } catch (e) { return 0; } }
  var bebas = true;         // dosen/preview/simulasi: tidak digerbang, tidak disimpan
  var sibuk = false;

  var toastEl = null, toastTimer = null;
  function toast(pesan, lama) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'pm-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = pesan; toastEl.classList.add('tampil');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('tampil'); }, lama || 3200);
  }

  function render() {
    kotak.forEach(function (el, i) {
      var cb = el.querySelector('input'), st = el.querySelector('.pm-status');
      var selesai = i < centang, giliran = i === centang;
      cb.checked = selesai;
      // Berurutan untuk SEMUA peran: hanya kotak giliran yang aktif. Pada mode
      // bebas (dosen/preview/simulasi) kotak terakhir boleh dibatalkan untuk uji coba.
      cb.disabled = bebas ? !(giliran || i === centang - 1) : !giliran;
      el.classList.toggle('pm-selesai', selesai);
      el.classList.toggle('pm-nonaktif', !selesai && !giliran);
      if (st) st.textContent = selesai ? '✓ dipahami' : (giliran ? 'bagian ' + (i + 1) + ' dari ' + total : 'selesaikan bagian sebelumnya');
    });
    // Tab Tugas/Forum/Hasil terkunci untuk SEMUA peran sampai centang lengkap
    // (permintaan dosen, 22 Agu 2026). Mode bebas diingat di localStorage.
    kunciTab(centang < total);
    if (bebas) { try { localStorage.setItem(KUNCI_BEBAS, String(centang)); } catch (e) {} }
  }
  function kunciTab(kunci) {
    TAB_TERKUNCI.forEach(function (t) {
      var b = document.getElementById('tab-' + t); if (!b) return;
      b.classList.toggle('pm-terkunci', kunci);
      b.setAttribute('aria-disabled', kunci ? 'true' : 'false');
      b.title = kunci ? 'Centang semua bagian materi dulu (' + centang + '/' + total + ')' : '';
    });
  }
  // switchTab adalah fungsi global klasik; dibungkus agar tab terkunci tidak bisa dibuka lewat cara lain.
  var switchAsli = window.switchTab;
  if (typeof switchAsli === 'function') {
    window.switchTab = function (tab) {
      if (centang < total && TAB_TERKUNCI.indexOf(tab) >= 0) {
        toast('🔒 Tab ' + tab.charAt(0).toUpperCase() + tab.slice(1) + ' terbuka setelah semua bagian materi dicentang (' + centang + '/' + total + ').');
        return;
      }
      return switchAsli.apply(this, arguments);
    };
  }

  kotak.forEach(function (el, i) {
    el.querySelector('input').addEventListener('change', function (ev) {
      var cb = ev.target;
      if (bebas) {
        if (cb.checked && i === centang) centang = i + 1;
        else if (!cb.checked && i === centang - 1) centang = i;
        render(); return;
      }
      if (!cb.checked) { cb.checked = true; return; }           // tidak bisa dibatalkan
      if (i !== centang || sibuk) { cb.checked = i < centang; return; }
      sibuk = true; cb.disabled = true;
      var d = dasar(); d.index = i; d.total = total;
      panggil('setModulCentang', d).then(function (r) {
        centang = Number(r.centang) || (i + 1);
        render();
        if (centang >= total) toast('🎉 Semua bagian materi sudah dipahami. Tab Tugas, Forum, dan Hasil kini terbuka.', 4500);
        else { var next = kotak[centang]; if (next) next.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }).catch(function (e) {
        cb.checked = false;
        toast('⚠ ' + ((e && e.message) || 'Gagal menyimpan centang. Coba lagi.'));
        if (/login ulang/i.test(String(e && e.message))) window._sessionPinHash = null;
      }).finally(function () { sibuk = false; render(); });
    });
  });

  // Overlay kunci bila modul sebelumnya belum lengkap.
  function tampilkanKunci(pras) {
    var ov = document.createElement('div');
    ov.className = 'visitor-overlay'; ov.style.zIndex = '100001';
    var n = pras.n;
    var baris = function (ok, teks) { return '<li class="' + (ok ? 'ok' : 'kurang') + '">' + (ok ? '✅ ' : '❌ ') + teks + '</li>'; };
    ov.innerHTML = '<div class="visitor-modal pm-kunci-modal">'
      + '<div style="font-size:2.6rem;text-align:center;margin-bottom:8px">🔒</div>'
      + '<h2>Modul ' + nomorModul + ' belum bisa dibuka</h2>'
      + '<p class="sub" style="text-align:center">Selesaikan <strong>Modul ' + n + '</strong> lebih dulu. Materi dipelajari berurutan.</p>'
      + '<ul>'
      + baris(pras.centangLengkap, 'Centang pemahaman materi Modul ' + n + ': ' + pras.centang + ' / ' + (pras.total || '?') + ' bagian')
      + baris(pras.tugasSelesai, 'Tugas Modul ' + n + ': ' + pras.soalDicoba + ' / ' + pras.totalSoal + ' soal dikerjakan')
      + baris(pras.forumSelesai, 'Forum Modul ' + n + ': 3 jawaban diskusi (≥ 30 kata)')
      + '</ul>'
      + '<a class="v-btn-primary" style="display:block;text-decoration:none;text-align:center" href="Modul-' + n + '.html">📖 Buka Modul ' + n + ' →</a>'
      + '<button class="v-btn-cancel" type="button" id="pmKeluar">🚪 Keluar</button>'
      + '</div>';
    document.body.appendChild(ov);
    var fab = document.getElementById('visitorFab'); if (fab) fab.style.display = 'none';
    ov.querySelector('#pmKeluar').addEventListener('click', function () {
      if (typeof window._switchRole === 'function') window._switchRole(); else location.reload();
    });
  }

  var forumDimuat = false;
  function muatProgres() {
    if (!mhsAktif()) { bebas = true; centang = muatBebas(); render(); return; }
    var d = dasar();
    if (!d.pinHash) { bebas = false; render(); return; }   // sesi PIN belum ada: tetap terkunci sampai login ulang
    bebas = false; render();
    panggil('getModulProgress', d).then(function (p) {
      if (p.akses && p.akses.boleh === false && p.akses.prasyarat) { tampilkanKunci(p.akses.prasyarat); return; }
      centang = Math.min(total, Number(p.centang) || 0);
      render();
      if (!forumDimuat && p.forum) {
        forumDimuat = true;
        ['fq1', 'fq2', 'fq3'].forEach(function (id) {
          var ta = document.getElementById('ans-' + id);
          if (ta && !ta.value && typeof p.forum[id] === 'string' && p.forum[id]) ta.value = p.forum[id];
        });
        if (typeof window.checkForumReady === 'function') try { window.checkForumReady(); } catch (e) {}
      }
    }).catch(function (e) {
      console.warn('[progres-modul] gagal memuat progres:', e && e.message);
      toast('⚠ Gagal memuat progres materi: ' + ((e && e.message) || 'koneksi'));
    });
  }
  // _loadScoredQuestions dipanggil di ketiga jalur login (PIN baru, verifikasi PIN,
  // auto-login); dibungkus supaya progres ikut dimuat tanpa menyentuh jalur itu.
  var loadAsli = window._loadScoredQuestions;
  window._loadScoredQuestions = function () {
    try { muatProgres(); } catch (e) { console.warn('[progres-modul]', e); }
    return typeof loadAsli === 'function' ? loadAsli.apply(this, arguments) : undefined;
  };

  // Forum → server (debounce), hanya mahasiswa sungguhan.
  var forumTimer = null, forumTerakhir = '';
  function simpanForum() {
    if (!mhsAktif()) return;
    var j = {};
    ['fq1', 'fq2', 'fq3'].forEach(function (id) { var ta = document.getElementById('ans-' + id); j[id] = ta ? ta.value : ''; });
    var kunci = JSON.stringify(j);
    if (kunci === forumTerakhir) return;
    var d = dasar(); if (!d.pinHash) return;
    d.jawaban = j;
    panggil('saveModulForum', d).then(function (r) {
      forumTerakhir = kunci;
      if (r.forumSelesai) toast('💾 Jawaban forum tersimpan di server — forum modul ini selesai.');
    }).catch(function (e) { console.warn('[progres-modul] forum:', e && e.message); });
  }
  var forumAsli = window.checkForumReady;
  if (typeof forumAsli === 'function') {
    window.checkForumReady = function () {
      var r = forumAsli.apply(this, arguments);
      clearTimeout(forumTimer); forumTimer = setTimeout(simpanForum, 1500);
      return r;
    };
  }

  centang = muatBebas();
  render();
})();
</script>
${PENANDA_AKHIR}`;

function proses(berkas) {
  let html = fs.readFileSync(berkas, "utf8");
  const awal = html;
  const catatan = [];

  if (RX_DAFTAR_PERIKSA.test(html)) { html = html.replace(RX_DAFTAR_PERIKSA, ""); catatan.push("hapus-daftar-periksa"); }
  if (RX_SISKEN_CENTANG_JS.test(html)) { html = html.replace(RX_SISKEN_CENTANG_JS, ""); catatan.push("hapus-siskenCentang"); }

  {
    // Kotak lama dibuang dulu supaya teks/pengecualian/indeks selalu mengikuti skrip ini.
    const RX_KOTAK_LAMA = /\n  <label class="pm-centang"[\s\S]*?<\/label>\n/g;
    html = html.replace(RX_KOTAK_LAMA, "");
    // Sisipkan dari belakang supaya indeks awal tidak bergeser.
    const bagian = [];
    let m;
    RX_SECTION_AWAL.lastIndex = 0;
    while ((m = RX_SECTION_AWAL.exec(html))) {
      const tutup = akhirDiv(html, m.index);
      if (tutup < 0) throw new Error(`${path.basename(berkas)}: penutup bagian ${m[1]} tidak ditemukan`);
      const judul = judulBagian(html.slice(m.index, tutup));
      // Dikecualikan: Daftar Pustaka, dan bagian orientasi "Posisi Anda dan Sisa
      // Waktu" (Sisken, bagian 01) — bukan materi (permintaan dosen, 22 Agu 2026).
      if (/daftar pustaka|posisi anda/i.test(judul)) continue;
      bagian.push({ id: m[1], tutup, judul });
    }
    if (bagian.length < 3) throw new Error(`${path.basename(berkas)}: hanya ${bagian.length} bagian materi terdeteksi`);
    for (let i = bagian.length - 1; i >= 0; i--) {
      const b = bagian[i];
      html = html.slice(0, b.tutup) + kotakCentang(i, b.judul) + html.slice(b.tutup);
    }
    catatan.push(`kotak×${bagian.length}`);
  }

  const a = html.indexOf(PENANDA_AWAL), z = html.indexOf(PENANDA_AKHIR);
  if (a >= 0 && z > a) {
    const lama = html.slice(a, z + PENANDA_AKHIR.length);
    if (lama !== BLOK) { html = html.slice(0, a) + BLOK + html.slice(z + PENANDA_AKHIR.length); catatan.push("runtime-diperbarui"); }
  } else {
    const i = html.lastIndexOf("</body>");
    if (i < 0) throw new Error(`${path.basename(berkas)}: </body> tidak ditemukan`);
    html = html.slice(0, i) + BLOK + "\n" + html.slice(i);
    catatan.push("runtime");
  }

  if (html === awal) return null;
  return { html, catatan };
}

const berkas = [];
for (const kursus of fs.readdirSync(root, { withFileTypes: true })) {
  if (!kursus.isDirectory()) continue;
  const dir = path.join(root, kursus.name, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (/^Modul-\d+\.html$/.test(f)) berkas.push(path.join(dir, f));
}
let n = 0;
const rekap = {};
for (const f of berkas.sort()) {
  const h = proses(f);
  if (!h) continue;
  n += 1;
  for (const c of h.catatan) rekap[c] = (rekap[c] || 0) + 1;
  if (!periksa) fs.writeFileSync(f, h.html);
}
console.log(`${n} halaman ${periksa ? "akan diperbarui" : "diperbarui"}: ${JSON.stringify(rekap)}`);
