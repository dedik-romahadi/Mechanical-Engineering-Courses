/**
 * Keaktifan di kelas — centang dosen per mahasiswa di tab Hasil modul (+10 nilai).
 *
 * PERMINTAAN DOSEN (13 Oktober 2026). Di tab Hasil, dosen dapat mencentang mahasiswa yang
 * aktif di kelas. Centang menambah 10 nilai (= 5 dari 50 poin modul; nilai tetap maksimal
 * 100). Mahasiswa melihat status aktif dirinya dan temannya; papan "Keaktifan di Kelas"
 * tampil di samping Top Skor dan Top Akses. Percobaan di Pemodelan CAD Modul 1 dahulu,
 * lalu diterapkan ke semua modul bila sudah disetujui (tambahkan halaman ke HALAMAN).
 *
 * DATA. keaktifan/<kursus>/<pertemuan>/mhs_<NIM> = { aktif: true, waktu } — dibaca publik,
 * ditulis/dihapus hanya sesi admin dosen (database.rules.json backend; sesi dibuat saat
 * dosen login di halaman ini). Bonus disimpan TERPISAH dari visitors/.../points dan
 * dijumlahkan saat dibaca: halaman ini menerapkannya pada data kunjungan sebelum
 * renderVisitors (tabel, Top Skor, statistik ikut memakai poin efektif); backend memakai
 * aturan yang sama untuk kode ekspor dan rekap OBE.
 *
 * YANG DIPASANG (semua bertanda, idempoten; jalan kedua melaporkan 0 halaman):
 *   KEAKTIFAN-KELAS:CSS    <style> di <head>: lencana "Aktif", sakelar dosen, kartu papan
 *   KEAKTIFAN-KELAS:KARTU  kartu "Keaktifan di Kelas" sesudah kartu Top Akses (kisi 3 kolom);
 *                          v2: semua mahasiswa aktif, urut nama, tanpa peringkat/medali
 *   KEAKTIFAN-KELAS:DATA   skrip modul: langganan keaktifan/, penerapan bonus, hiasan baris,
 *                          sakelar dosen, papan peringkat, window._bonusKeaktifanSaya
 *   + data-nim pada baris tabel Hasil, latestVisitors melewati _keaktifanTerapkan,
 *     baris "Keaktifan kelas" di bilah skor (updateScore) dan ringkasan ekspor HTML.
 *
 * Pakai:
 *   node scripts/keaktifan-kelas.mjs            # terapkan
 *   node scripts/keaktifan-kelas.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

// Halaman yang memakai fitur ini dan kunci kursus RTDB-nya.
const HALAMAN = {
  "Pemodelan-Computer-Aided-Design/Modul/Modul-1.html": "pemodelan_cad",
};

const CSS = `<style id="keaktifan-kelas-style">/* KEAKTIFAN-KELAS:CSS v2 — dipasang scripts/keaktifan-kelas.mjs */
.lencana-aktif{display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:2px 10px 2px 7px;border-radius:999px;font-size:.68rem;font-weight:800;letter-spacing:.04em;color:#fff;white-space:nowrap;background:linear-gradient(135deg,#f97316,#ec4899 55%,#8b5cf6);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 4px 14px rgba(236,72,153,.32);animation:la-denyut 2.4s ease-in-out infinite}
.lencana-aktif .la-api{display:inline-block;transform-origin:50% 90%;animation:la-api 1.3s ease-in-out infinite}
.lencana-aktif .la-plus{font-weight:700;opacity:.85;font-size:.62rem}
@keyframes la-denyut{0%,100%{box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 4px 14px rgba(236,72,153,.32)}50%{box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 6px 22px rgba(236,72,153,.62)}}
@keyframes la-api{0%,100%{transform:scale(1) rotate(-5deg)}50%{transform:scale(1.2) rotate(5deg)}}
.vt-row.vt-aktif{background:linear-gradient(90deg,rgba(236,72,153,.08),rgba(139,92,246,.03) 55%,transparent)!important;border-left-color:#ec4899!important}
.saklar-aktif{position:relative;display:inline-flex;align-items:center;gap:6px;margin-top:6px;margin-left:8px;cursor:pointer;font-size:.68rem;font-weight:700;color:#cbd5e1;user-select:none;vertical-align:middle}
.saklar-aktif input{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.saklar-aktif .sa-jalur{position:relative;width:30px;height:16px;border-radius:999px;background:#334155;border:1px solid #475569;transition:background .2s,border-color .2s;flex-shrink:0}
.saklar-aktif .sa-bulat{position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:#e2e8f0;transition:transform .2s}
.saklar-aktif input:checked+.sa-jalur{background:linear-gradient(135deg,#f97316,#ec4899);border-color:#ec4899}
.saklar-aktif input:checked+.sa-jalur .sa-bulat{transform:translateX(14px)}
.saklar-aktif input:focus-visible+.sa-jalur{outline:2px solid #f9a8d4;outline-offset:2px}
.saklar-aktif input:disabled+.sa-jalur{opacity:.5}
.kartu-aktif{position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(249,115,22,.07),rgba(236,72,153,.08) 50%,rgba(139,92,246,.08));border:1px solid rgba(236,72,153,.28);border-radius:14px;padding:14px 16px}
.kartu-aktif::before{content:"";position:absolute;top:-50px;right:-40px;width:130px;height:130px;background:radial-gradient(circle,rgba(236,72,153,.22),transparent 70%);pointer-events:none}
.kartu-aktif .ka-judul{position:relative;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;background:linear-gradient(90deg,#fb923c,#f472b6,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
.kartu-aktif .ka-jumlah{display:inline-block;padding:2px 8px;border-radius:8px;font-size:.68rem;font-weight:700;white-space:nowrap;color:#fbcfe8;background:rgba(236,72,153,.16)}
.kartu-aktif .ka-kaki{position:relative;margin-top:8px;font-size:.66rem;color:#94a3b8}
.kartu-aktif .ka-daftar{max-height:240px;overflow-y:auto;margin-right:-6px;padding-right:6px;scrollbar-width:thin;scrollbar-color:rgba(236,72,153,.45) transparent}
.kartu-aktif .ka-baris{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.kartu-aktif .ka-baris:last-child{border-bottom:none}
.kartu-aktif .ka-ikon{font-size:.95rem;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(249,115,22,.45))}
#baris-keaktifan.aktif{color:#f9a8d4;font-weight:700}
#baris-keaktifan.aktif::after{content:" 🔥"}
@media (prefers-reduced-motion:reduce){.lencana-aktif,.lencana-aktif .la-api{animation:none}}
</style>
`;

const KARTU = `
        <!-- KEAKTIFAN-KELAS:KARTU BEGIN v1 — dipasang scripts/keaktifan-kelas.mjs -->
        <div class="kartu-aktif">
          <div class="ka-judul">🙋 Keaktifan di Kelas</div>
          <div id="aktifList" style="position:relative;font-size:.8rem;color:#e2e8f0;min-height:60px;">⏳ Memuat...</div>
        </div>
        <!-- KEAKTIFAN-KELAS:KARTU END v1 -->`;

const DATA = (kursus) => `// KEAKTIFAN-KELAS:DATA BEGIN v2 — dipasang scripts/keaktifan-kelas.mjs
// Centang dosen "aktif di kelas" per mahasiswa per pertemuan (+10 nilai = 10% skala modul,
// nilai tetap maksimal 100). keaktifan/<kursus>/<pertemuan>/mhs_<NIM> = {aktif:true, waktu}:
// dibaca publik, ditulis hanya sesi admin dosen. Bonus dijumlahkan ke poin saat data
// kunjungan dibaca (tabel Hasil, Top Skor, statistik); backend memakai aturan yang sama
// untuk kode ekspor dan rekap OBE.
const KEAKTIFAN_KURSUS = '${kursus}';
const KEAKTIFAN_BONUS_FRAKSI = 0.1;
function keaktifanTerapkanMurni(list, modul, roster, total, isSim) {
  const bonus = total * KEAKTIFAN_BONUS_FRAKSI;
  const ada = new Set();
  const out = (list || []).map((v) => {
    if (!v || v.role === 'dosen' || v.role === 'guest') return v;
    ada.add(String(v.nim));
    const rec = (modul || {})['mhs_' + v.nim];
    if (!rec || rec.aktif !== true) return v;
    const asli = Number(v.points) || 0;
    return Object.assign({}, v, { points: Math.min(asli + bonus, total), poinTanpaKeaktifan: asli, aktifKelas: true });
  });
  // Dicentang tetapi belum pernah membuka modul: tetap tampil dengan bonusnya.
  for (const [kunci, rec] of Object.entries(modul || {})) {
    if (!rec || rec.aktif !== true || kunci.indexOf('mhs_') !== 0) continue;
    const nim = kunci.slice(4);
    if (ada.has(nim) || isSim(nim)) continue;
    const s = (roster || []).find((x) => String(x.nim) === nim);
    if (!s) continue;
    out.push({ nama: s.nama, nim: nim, role: 'student', timestamp: rec.waktu, lastVisit: rec.waktu, visitCount: 0,
      points: Math.min(bonus, total), poinTanpaKeaktifan: 0, aktifKelas: true, tanpaKunjungan: true });
  }
  return out;
}
let _keaktifanKursus = {};
let _keaktifanModul = {};
let _visitorsMentah = [];
let _visitorsDiterima = false;
function _keaktifanTotal() { return (window.SCORE_CONFIG && Number(window.SCORE_CONFIG.TOTAL)) || 50; }
function _keaktifanTerapkan(list) {
  _visitorsMentah = list || [];
  _visitorsDiterima = true;
  return keaktifanTerapkanMurni(_visitorsMentah, _keaktifanModul, masterStudents, _keaktifanTotal(), isSimulasiNim);
}
function _keaktifanAktif(nim) { const r = _keaktifanModul['mhs_' + nim]; return !!(r && r.aktif === true); }
window._bonusKeaktifanSaya = function () {
  const me = (typeof getIdentityLocal === 'function') ? getIdentityLocal() : null;
  if (!me || me.role !== 'student' || !me.nim) return 0;
  return _keaktifanAktif(me.nim) ? _keaktifanTotal() * KEAKTIFAN_BONUS_FRAKSI : 0;
};
function _keaktifanSegarkan() {
  // Render ulang hanya sesudah data kunjungan pertama tiba (hindari tabel kosong sesaat).
  if (_visitorsDiterima) {
    latestVisitors = keaktifanTerapkanMurni(_visitorsMentah, _keaktifanModul, masterStudents, _keaktifanTotal(), isSimulasiNim);
    try { renderVisitors(latestVisitors); } catch (e) { console.warn('[Keaktifan] render gagal:', e); }
  }
  _keaktifanKartu();
  _keaktifanHias();
  if (typeof window.updateScore === 'function') { try { window.updateScore(); } catch (e) {} }
}
function _keaktifanKartu() {
  const el = document.getElementById('aktifList');
  if (!el) return;
  if (!masterStudents.length) { el.innerHTML = '<span style="color:#64748b;font-size:.75rem;">Memuat data mahasiswa...</span>'; return; }
  const hitung = {};
  for (const node of Object.values(_keaktifanKursus || {})) {
    for (const [k, rec] of Object.entries(node || {})) {
      if (!rec || rec.aktif !== true || k.indexOf('mhs_') !== 0) continue;
      const nim = k.slice(4);
      if (isSimulasiNim(nim)) continue;
      const h = hitung[nim] || (hitung[nim] = { n: 0, awal: String(rec.waktu || '') });
      h.n += 1;
      if (String(rec.waktu || '') < h.awal) h.awal = String(rec.waktu || '');
    }
  }
  // Semua mahasiswa yang pernah dicentang di kursus ini, urut nama (tanpa peringkat/medali;
  // permintaan dosen 13 Okt 2026). Jumlah pertemuan aktif tetap ditampilkan per baris.
  const daftar = Object.entries(hitung)
    .map(([nim, h]) => ({ nim, n: h.n, s: masterStudents.find((x) => String(x.nim) === nim) }))
    .filter((x) => x.s)
    .sort((a, b) => String(a.s.nama).localeCompare(String(b.s.nama), 'id'));
  const ini = Object.keys(_keaktifanModul || {}).filter((k) => _keaktifanAktif(k.slice(4)) && !isSimulasiNim(k.slice(4))).length;
  if (!daftar.length) { el.innerHTML = '<span style="color:#64748b;font-size:.75rem;">Belum ada data.</span>'; return; }
  el.innerHTML = '<div class="ka-daftar">' + daftar.map((x) => '<div class="ka-baris"><span class="ka-ikon">🔥</span><div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escH(x.s.nama) + '</div><div style="font-size:.65rem;color:#64748b;font-family:monospace;">' + escH(x.nim) + '</div></div><span class="ka-jumlah">' + x.n + '× aktif</span></div>').join('') + '</div>'
    + '<div class="ka-kaki"><b style="color:#f9a8d4">' + daftar.length + '</b> mahasiswa aktif · pertemuan ini: <b style="color:#f9a8d4">' + ini + '</b> · +10 nilai per pertemuan</div>';
}
function _keaktifanHias() {
  const body = document.getElementById('visitorTableBody');
  if (!body) return;
  const dosen = !!(_auth && _auth.currentUser);
  body.querySelectorAll('.vt-row[data-nim]').forEach((row) => {
    const nim = row.getAttribute('data-nim');
    const aktif = _keaktifanAktif(nim);
    row.classList.toggle('vt-aktif', aktif);
    const nameEl = row.querySelector('.vt-name');
    if (!nameEl || !nameEl.parentElement) return;
    const wadah = nameEl.parentElement;
    let lencana = wadah.querySelector('.lencana-aktif');
    if (aktif && !lencana) {
      lencana = document.createElement('span');
      lencana.className = 'lencana-aktif';
      lencana.title = 'Aktif di kelas: +10 nilai';
      lencana.innerHTML = '<span class="la-api">🔥</span>Aktif<span class="la-plus">+10</span>';
      nameEl.insertAdjacentElement('afterend', lencana);
    } else if (!aktif && lencana) lencana.remove();
    let saklar = wadah.querySelector('.saklar-aktif');
    if (dosen && !saklar) {
      saklar = document.createElement('label');
      saklar.className = 'saklar-aktif';
      saklar.title = 'Tandai aktif di kelas (+10 nilai)';
      saklar.innerHTML = '<input type="checkbox" aria-label="Aktif di kelas"><span class="sa-jalur"><span class="sa-bulat"></span></span><span>Aktif di kelas</span>';
      saklar.querySelector('input').addEventListener('change', (e) => _keaktifanUbah(nim, e.target.checked, e.target));
      wadah.appendChild(saklar);
    } else if (!dosen && saklar) saklar.remove();
    if (saklar) saklar.querySelector('input').checked = aktif;
    // Dicentang tanpa pernah membuka modul: kolom kunjungan "—", bukan "1x".
    const v = (latestVisitors || []).find((x) => x && String(x.nim) === nim);
    if (v && v.tanpaKunjungan) {
      const sel = Array.prototype.find.call(row.children, (c) => /^\\d+x$/.test(c.textContent.trim()));
      if (sel) sel.textContent = '—';
    }
  });
}
async function _keaktifanUbah(nim, aktif, input) {
  if (!(_auth && _auth.currentUser)) {
    alert('Login sebagai dosen dahulu untuk menandai keaktifan.');
    input.checked = !aktif;
    return;
  }
  const r = ref(db, 'keaktifan/' + KEAKTIFAN_KURSUS + '/' + MODULE_ID + '/' + sanitizeKey('mhs_' + nim));
  input.disabled = true;
  try {
    if (aktif) await set(r, { aktif: true, waktu: new Date().toISOString() });
    else await remove(r);
  } catch (e) {
    input.checked = !aktif;
    alert('Gagal menyimpan keaktifan (' + ((e && e.message) || e) + '). Sesi dosen berlaku 2 jam; login ulang lalu coba lagi.');
  } finally {
    input.disabled = false;
  }
}
onValue(ref(db, 'keaktifan/' + KEAKTIFAN_KURSUS), (snap) => {
  _keaktifanKursus = snap.val() || {};
  _keaktifanModul = _keaktifanKursus[MODULE_ID] || {};
  _keaktifanSegarkan();
}, (err) => console.warn('[Keaktifan] baca gagal:', err && err.message));
// Roster dimuat sesudah data kunjungan: terapkan ulang sekali agar baris "dicentang tanpa
// kunjungan" ikut tampil, lalu hias ulang setiap kali tabel dirender atau sesi dosen berubah.
const _keaktifanTungguRoster = setInterval(() => {
  if (!masterStudents.length) return;
  clearInterval(_keaktifanTungguRoster);
  _keaktifanSegarkan();
}, 500);
(function () {
  const body = document.getElementById('visitorTableBody');
  if (body) new MutationObserver(() => _keaktifanHias()).observe(body, { childList: true });
  if (_auth && typeof _auth.onAuthStateChanged === 'function') _auth.onAuthStateChanged(() => _keaktifanHias());
})();
// KEAKTIFAN-KELAS:DATA END v2
`;

const SKOR_BARIS = `<div>Tugas 4–5: <span id="scoreCompHard" style="color:var(--pink)">0</span>/22 poin</div>`;
const SKOR_AKTIF = `\n      <div id="baris-keaktifan">Keaktifan kelas: <span id="scoreAktif" style="color:#f472b6">0</span>/5 poin</div>`;
const TOTAL_LAMA = `  const total = mc + ezComp + hardComp;`;
const TOTAL_BARU = `  // KEAKTIFAN-KELAS: bonus centang dosen (+10 nilai), total tetap dibatasi skala modul.
  const _bonusAktif = (typeof window._bonusKeaktifanSaya === 'function') ? window._bonusKeaktifanSaya() : 0;
  const total = Math.min(mc + ezComp + hardComp + _bonusAktif, SCORE_CONFIG.TOTAL);`;
const SET_LAMA = `  set('scoreCompHard', _fmtPts(hardComp));`;
const SET_BARU = `${SET_LAMA}
  set('scoreAktif',    _fmtPts(_bonusAktif));
  { const _ba = document.getElementById('baris-keaktifan'); if (_ba) _ba.classList.toggle('aktif', _bonusAktif > 0); }`;
const EKSPOR_LAMA = '<span class="score-mini">Tugas 4–5: <strong>${_fmtPts(compHard)}/${SCORE_CONFIG.COMP_HARD_TOTAL}</strong></span>';
const EKSPOR_BARU = EKSPOR_LAMA + "${(typeof window._bonusKeaktifanSaya === 'function' && window._bonusKeaktifanSaya() > 0) ? '<span class=\"score-mini\">🔥 Keaktifan kelas: <strong>+' + _fmtPts(window._bonusKeaktifanSaya()) + '</strong></span>' : ''}";
const GRID_LAMA = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:16px 20px 8px;';
const GRID_BARU = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:16px 20px 8px;';
const SANTAI = '<div id="santaiList" style="font-size:.8rem;color:#e2e8f0;min-height:60px;">⏳ Memuat...</div>\n        </div>';
const BARIS_LAMA = 'return `<div class="vt-row${absenClass}" style="${rowBg}">';
const BARIS_BARU = 'return `<div class="vt-row${absenClass}" data-nim="${escH(String(s.nim))}" style="${rowBg}">';
const LV_LAMA = 'latestVisitors=data ? Object.values(data) : [];renderVisitors(latestVisitors);';
const LV_BARU = 'latestVisitors=_keaktifanTerapkan(data ? Object.values(data) : []);renderVisitors(latestVisitors);';

const RX_CSS = /<style id="keaktifan-kelas-style">[\s\S]*?<\/style>\n/;
const RX_KARTU = /\n {8}<!-- KEAKTIFAN-KELAS:KARTU BEGIN[\s\S]*?KEAKTIFAN-KELAS:KARTU END v\d+ -->/;
const RX_DATA = /\/\/ KEAKTIFAN-KELAS:DATA BEGIN[\s\S]*?\/\/ KEAKTIFAN-KELAS:DATA END v\d+\n/;

const hitung = (s, sub) => s.split(sub).length - 1;

function proses(rel, kursus) {
  const f = path.join(root, rel);
  let html = fs.readFileSync(f, "utf8");
  const awal = html;
  if (html.includes("\r")) throw new Error("berkas memuat CR");
  const satu = (lama, baru, sudahTanda) => {
    if (html.includes(sudahTanda)) return;
    const n = hitung(html, lama);
    if (n !== 1) throw new Error(`jangkar muncul ${n}x, harusnya 1: ${lama.slice(0, 60)}`);
    html = html.replace(lama, () => baru);
  };
  // CSS
  if (RX_CSS.test(html)) html = html.replace(RX_CSS, () => CSS);
  else { const i = html.indexOf("</head>"); if (i < 0) throw new Error("</head> tidak ada"); html = html.slice(0, i) + CSS + html.slice(i); }
  // kartu papan
  satu(GRID_LAMA, GRID_BARU, GRID_BARU);
  if (RX_KARTU.test(html)) html = html.replace(RX_KARTU, () => KARTU);
  else { if (hitung(html, SANTAI) !== 1) throw new Error("kartu Top Akses tidak ditemukan"); html = html.replace(SANTAI, () => SANTAI + KARTU); }
  // tabel, data kunjungan
  satu(BARIS_LAMA, BARIS_BARU, BARIS_BARU);
  if (!html.includes(LV_BARU)) {
    if (hitung(html, LV_LAMA) !== 2) throw new Error(`latestVisitors=... muncul ${hitung(html, LV_LAMA)}x, harusnya 2`);
    html = html.split(LV_LAMA).join(LV_BARU);
  }
  if (hitung(html, LV_LAMA) !== 0 || hitung(html, LV_BARU) !== 2) throw new Error("penugasan latestVisitors harus melewati _keaktifanTerapkan (2x)");
  // skrip data
  if (RX_DATA.test(html)) html = html.replace(RX_DATA, () => DATA(kursus));
  else {
    const a = "let latestVisitors=[];\n";
    if (hitung(html, a) !== 1) throw new Error("let latestVisitors=[] tidak unik");
    html = html.replace(a, () => a + DATA(kursus));
  }
  // bilah skor + ekspor
  satu(SKOR_BARIS, SKOR_BARIS + SKOR_AKTIF, 'id="baris-keaktifan"');
  satu(TOTAL_LAMA, TOTAL_BARU, "const _bonusAktif =");
  satu(SET_LAMA + "\n", SET_BARU + "\n", "set('scoreAktif',");
  satu(EKSPOR_LAMA, EKSPOR_BARU, "🔥 Keaktifan kelas: <strong>+");
  // penjaga
  for (const tanda of ["KEAKTIFAN-KELAS:CSS v2", "KEAKTIFAN-KELAS:KARTU BEGIN v1", "KEAKTIFAN-KELAS:DATA BEGIN v2", 'id="aktifList"', 'data-nim="${escH(String(s.nim))}"']) {
    if (hitung(html, tanda) !== 1) throw new Error(`penanda ${tanda} muncul ${hitung(html, tanda)}x`);
  }
  return html === awal ? null : html;
}

let n = 0;
for (const [rel, kursus] of Object.entries(HALAMAN)) {
  let h;
  try { h = proses(rel, kursus); } catch (e) { throw new Error(`${rel}: ${e.message}`); }
  if (h === null) continue;
  n += 1;
  if (!periksa) fs.writeFileSync(path.join(root, rel), h);
}
console.log(`${n} dari ${Object.keys(HALAMAN).length} halaman ${periksa ? "akan diperbarui" : "diperbarui"}`);
