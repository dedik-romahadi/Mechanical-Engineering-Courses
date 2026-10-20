/**
 * Praktik terbimbing 3 poin — Pemodelan CAD (kontrak dosen 19 Okt 2026: Tugas 45 + Forum 2 + Praktik 3).
 *
 * ATURAN (identik backend functions/index.js _aturanPraktikUntuk/_poinResmiModul, cad-praktik.js):
 * berlaku untuk modul CAD yang (1) punya kriteria praktik (PRAKTIK_BERKRITERIA: Modul 1–14; modul baru
 * ditambahkan nomornya di BERKRITERIA DAN di backend cad-praktik.js),
 * (2) waktu bukanya ≥ PRAKTIK_POIN_MULAI (2026-10-19T00:00:00+07:00 = sesudah Modul 5 dibuka, sebelum
 * Modul 6), dan (3) belum dikerjakan mahasiswa sebelum batas itu — pola yang sama dengan forum
 * (forumBukaMsMurni + bukti poinPertama/pointTimestamp tulisan server). Aturan praktik selalu bersama
 * aturan forum. Rumus:
 *   tugas = raw × 45/50, dasar = min(tugas + bonusKeaktifan, 45),
 *   resmi = dasar + forum (2 × pengali) + praktik (3 × pengali)   (maks 50)
 * Contoh: raw50+forum+praktik 50; tanpa praktik 47; raw40+forum+praktik 41; +keaktifan 46;
 * praktik terlambat 48,95; raw0+forum+praktik 5.
 *
 * DATA. praktik/pemodelan_cad/<pertemuan>/mhs_<NIM> = { waktu, pengali } — dibaca publik, ditulis HANYA
 * server (callable unggahPraktik sesudah berkas hasil praktik lolos kriteria). Berkas dikirim bertahap
 * (potongan praktikPotongBytes dari getModulProgress, ±6 MB) karena hasil FEM bisa ±60 MB.
 *
 * YANG DIPASANG (14 halaman CAD saja; semua bertanda, idempoten; jalan kedua melaporkan 0 halaman):
 *   PRAKTIK-POIN:CSS   <style id="praktik-poin-style"> di <head>
 *   PRAKTIK-POIN:KARTU #praktikKartu di akhir Bagian 09 (sebelum kotak centang bagian itu):
 *                      daftar syarat dari server + hasil pemeriksaan per syarat, pilih berkas
 *                      (.FCStd, + PDF bila wajib), Unggah & periksa, Periksa ulang
 *   PRAKTIK-POIN:BARIS #baris-praktik "Praktik terbimbing x/3 poin" sesudah #baris-forum
 *   PRAKTIK-POIN:DATA  sesudah HASIL-KEREN:DATA END (skrip modul yang sama dengan blok FORUM-POIN):
 *                      fungsi murni (PRAKTIK-POIN:MURNI), langganan praktik/<kursus>/<MODULE_ID> dan
 *                      DB_PATH, event progres-modul:diterapkan (praktikAturan/Poin/Syarat/…), unggah
 *                      bertahap, dan pembungkus window._forumSkorSaya (bilah skor), window._forumPipa
 *                      (tabel Hasil/Top Skor/statistik/grafik), window._forumRingkasEkspor (Export).
 *                      Tanpa aturan praktik ketiganya persis versi forum. Export TIDAK ditahan
 *                      (keputusan dosen 19 Okt 2026: wajib lewat nilai, bukan gerbang).
 *
 * URUTAN RANTAI: … → forum-poin.mjs → … → hasil-keren.mjs → praktik-poin.mjs → … → draft-modul.mjs.
 *
 * Pakai:
 *   node scripts/praktik-poin.mjs            # terapkan
 *   node scripts/praktik-poin.mjs --periksa  # laporan saja (kode keluar 1 bila ada yang berubah)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

export const KURSUS_FOLDER = "Pemodelan-Computer-Aided-Design";
export const PRAKTIK_POIN_MULAI = "2026-10-19T00:00:00+07:00";
// Modul yang punya kriteria praktik di backend (functions/modules/cad-praktik.js KRITERIA).
export const BERKRITERIA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const CSS = `<style id="praktik-poin-style">/* PRAKTIK-POIN:CSS v1 — dipasang scripts/praktik-poin.mjs */
#baris-praktik.aktif{color:#fcd34d;font-weight:700}
#baris-praktik.aktif::after{content:" ✓"}
.praktik-kartu{margin:22px 0 18px;padding:18px 20px;border-radius:14px;border:1px solid rgba(251,191,36,.35);background:rgba(251,191,36,.06);font-size:14px;line-height:1.6;color:var(--text,#e2e8f0)}
.praktik-kartu.pk-lolos{border-color:rgba(0,224,158,.45);background:rgba(0,224,158,.07)}
.praktik-kartu .pk-kepala{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:6px}
.praktik-kartu .pk-judul{font-weight:800;font-size:15px}
.praktik-kartu .pk-pil{margin-left:auto;padding:2px 10px;border-radius:999px;font-weight:800;font-size:13px;background:rgba(251,191,36,.18);color:#fde68a}
.praktik-kartu.pk-lolos .pk-pil{background:rgba(0,224,158,.18);color:#9ff3d2}
.praktik-kartu .pk-teks{margin:4px 0 10px;color:var(--muted,#94a3b8)}
.praktik-kartu .pk-syarat{margin:6px 0 12px;padding-left:0;list-style:none}
.praktik-kartu .pk-syarat li{display:flex;gap:8px;padding:5px 0;border-top:1px dashed rgba(148,163,184,.18);overflow-wrap:anywhere}
.praktik-kartu .pk-syarat li:first-child{border-top:none}
.praktik-kartu .pk-tanda{flex:0 0 1.4em;text-align:center}
.praktik-kartu .pk-info{display:block;font-size:12.5px;color:var(--muted,#94a3b8)}
.praktik-kartu li.pk-gagal .pk-info{color:#fca5a5}
.praktik-kartu .pk-berkas{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0}
.praktik-kartu .pk-pilih{flex:1 1 240px;display:flex;flex-direction:column;gap:4px;font-size:13px}
.praktik-kartu .pk-pilih input{max-width:100%;font-size:13px}
.praktik-kartu .pk-aksi{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.praktik-kartu .pk-aksi button{padding:8px 14px;border-radius:10px;border:1px solid rgba(251,191,36,.5);background:rgba(251,191,36,.14);color:#fde68a;font-weight:700;cursor:pointer}
.praktik-kartu .pk-aksi button:disabled{opacity:.5;cursor:not-allowed}
.praktik-kartu .pk-progres{height:6px;border-radius:6px;background:rgba(148,163,184,.18);overflow:hidden;margin-top:10px}
.praktik-kartu .pk-progres>div{height:100%;width:0;background:#fbbf24;transition:width .25s}
.praktik-kartu .pk-pesan{margin-top:8px;font-size:13px}
@media (max-width:640px){.praktik-kartu{padding:14px 14px}.praktik-kartu .pk-pil{margin-left:0}}
</style>
`;

const KARTU = (ind) => `\n${ind}<!-- PRAKTIK-POIN:KARTU BEGIN v1 — dipasang scripts/praktik-poin.mjs -->
${ind}<div class="praktik-kartu" id="praktikKartu" data-praktik-poin="kartu v1" style="display:none" aria-live="polite">
${ind}  <div class="pk-kepala"><span aria-hidden="true">📤</span><span class="pk-judul">Unggah hasil praktik (3 poin)</span><span class="pk-pil" id="praktikPil">0/3</span></div>
${ind}  <p class="pk-teks" id="praktikTeks"></p>
${ind}  <ul class="pk-syarat" id="praktikSyarat"></ul>
${ind}  <div class="pk-berkas" id="praktikBerkas">
${ind}    <label class="pk-pilih"><span>Berkas FreeCAD <b>.FCStd</b></span><input type="file" id="praktikFcstd" accept=".FCStd,.fcstd"></label>
${ind}    <label class="pk-pilih" id="praktikPilihPdf" style="display:none"><span>PDF lembar TechDraw <b>.pdf</b></span><input type="file" id="praktikPdf" accept=".pdf,application/pdf"></label>
${ind}  </div>
${ind}  <div class="pk-aksi" id="praktikAksi"><button type="button" id="praktikTombol">⬆ Unggah &amp; periksa</button><button type="button" id="praktikUlang">↻ Periksa ulang</button></div>
${ind}  <div class="pk-progres" id="praktikProgres" style="display:none"><div id="praktikBar"></div></div>
${ind}  <div class="pk-pesan" id="praktikPesan"></div>
${ind}</div>
${ind}<!-- PRAKTIK-POIN:KARTU END v1 -->`;

const BARIS = (ind) => `\n${ind}<div id="baris-praktik" data-praktik-poin="baris v1" style="display:none" title="Modul CAD yang dibuka sejak 19 Okt 2026 (Modul 6): nilai tugas diskalakan ×45/50, forum diskusi 2 poin, praktik terbimbing 3 poin">Praktik terbimbing: <span id="scorePraktik" style="color:#fbbf24">0</span>/3 poin</div>`;

const DATA = (n) => `// PRAKTIK-POIN:DATA BEGIN v1 — dipasang scripts/praktik-poin.mjs
// Praktik terbimbing 3 poin (Pemodelan CAD; kontrak dosen 19 Okt 2026; backend unggahPraktik,
// _aturanPraktikUntuk, _poinResmiModul). Modul berkriteria yang dibuka sejak PRAKTIK_POIN_MULAI dan
// belum dikerjakan sebelum batas itu memakai Tugas 45 + Forum 2 + Praktik 3. Blok ini memakai fungsi
// blok FORUM-POIN di skrip yang sama dan membungkus window._forumSkorSaya/_forumPipa/_forumRingkasEkspor;
// tanpa aturan praktik ketiganya persis versi forum.
const PRAKTIK_POIN = 3;
const PRAKTIK_POIN_MULAI = '${PRAKTIK_POIN_MULAI}';
const PRAKTIK_POIN_MULAI_MS = Date.parse(PRAKTIK_POIN_MULAI);
const PRAKTIK_NOMOR = ${n};
const PRAKTIK_BERKRITERIA = ${BERKRITERIA.includes(n) ? "true" : "false"};
// PRAKTIK-POIN:MURNI BEGIN
function praktikPoinRekMurni(rec) {
  if (!rec || typeof rec !== 'object') return 0;
  const p = Number(rec.pengali);
  return (p > 0 && p <= 1) ? PRAKTIK_POIN * p : 0;
}
function praktikBulatMurni(n) { return Math.round((Number(n) || 0) * 1e6) / 1e6; }
// Skor satu mahasiswa (bilah skor): raw = poin tugas mentah, bonus = keaktifan, forumPoin/praktikPoin = poin node.
function praktikSkorMurni(raw, bonus, forumPoin, praktikPoin, total) {
  const maks = total - 2 - PRAKTIK_POIN;
  const tugas = (Number(raw) || 0) * maks / total;
  return praktikBulatMurni(Math.min(tugas + (Number(bonus) || 0), maks) + (Number(forumPoin) || 0) + (Number(praktikPoin) || 0));
}
// Bukti pengerjaan sebelum PRAKTIK_POIN_MULAI (cermin backend _adaPengerjaanSebelumForum dengan batas praktik).
const PRAKTIK_ISO_BERZONA = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,3})?)?(Z|[+-]\\d{2}:\\d{2})$/;
function praktikPengerjaanLamaMurni(data, isSim) {
  if (!data || typeof data !== 'object') return false;
  for (const [kunci, v] of Object.entries(data)) {
    if (kunci.indexOf('mhs_') !== 0 || !v || typeof v !== 'object' || v.role !== 'student') continue;
    if (isSim(kunci.slice(4)) || isSim(String(v.nim))) continue;
    for (const s of [v.poinPertama, v.pointTimestamp]) {
      const t = (typeof s === 'string' && PRAKTIK_ISO_BERZONA.test(s)) ? Date.parse(s) : NaN;
      if (Number.isFinite(t) && t < PRAKTIK_POIN_MULAI_MS) return true;
    }
  }
  return false;
}
// Aturan praktik kelas (tabel Hasil): berkriteria, aturan forum aktif, waktu buka (ms) ≥ batas, tanpa pengerjaan lama.
function praktikAturanKelasMurni(berkriteria, forumAktif, bukaMs, pengerjaanLama) {
  return berkriteria === true && forumAktif === true && pengerjaanLama === false && Number.isFinite(bukaMs) && bukaMs >= PRAKTIK_POIN_MULAI_MS;
}
// Daftar kunjungan (tabel Hasil, Top Skor, statistik): skala tugas 45/50 → keaktifan (batas 45) → forum + praktik.
function praktikTerapkanMurni(list, modulForum, modulAktif, modulPraktik, roster, total, isSim, terapkanAktif) {
  const maks = total - 2 - PRAKTIK_POIN;
  const fp = (rec) => { const x = Number(rec && rec.pengali); return (x > 0 && x <= 1) ? 2 * x : 0; };
  const skala = (list || []).map((v) => {
    if (!v || v.role === 'dosen' || v.role === 'guest') return v;
    const asli = Number(v.points) || 0;
    return Object.assign({}, v, { points: asli * maks / total, poinMentah: asli });
  });
  const ada = new Set();
  const out = terapkanAktif(skala, modulAktif, roster, total, isSim, maks).map((v) => {
    if (!v || v.role === 'dosen' || v.role === 'guest') return v;
    ada.add(String(v.nim));
    const f = fp((modulForum || {})['mhs_' + v.nim]);
    const p = praktikPoinRekMurni((modulPraktik || {})['mhs_' + v.nim]);
    return Object.assign({}, v, { points: praktikBulatMurni((Number(v.points) || 0) + f + p), poinForum: f, poinPraktik: p, forumAturan: true, praktikAturan: true });
  });
  // Poin forum/praktik tanpa kunjungan (mis. kunjungan direset): tetap tampil.
  const kunci = new Set(Object.keys(modulForum || {}).concat(Object.keys(modulPraktik || {})));
  for (const k of kunci) {
    if (k.indexOf('mhs_') !== 0) continue;
    const nim = k.slice(4);
    const f = fp((modulForum || {})[k]);
    const p = praktikPoinRekMurni((modulPraktik || {})[k]);
    if (!(f + p) || ada.has(nim) || isSim(nim)) continue;
    const s = (roster || []).find((x) => String(x.nim) === nim);
    if (!s) continue;
    const w = ((modulPraktik || {})[k] || (modulForum || {})[k] || {}).waktu;
    out.push({ nama: s.nama, nim: nim, role: 'student', timestamp: w, lastVisit: w, visitCount: 0,
      points: praktikBulatMurni(f + p), poinMentah: 0, poinForum: f, poinPraktik: p, forumAturan: true, praktikAturan: true, tanpaKunjungan: true });
  }
  return out;
}
// PRAKTIK-POIN:MURNI END
let _praktikModul = {};
let _praktikPengerjaanLama = null;
let _praktikServer = { kunci: '', aturan: null, poin: 0, pengali: null, waktu: null, simulasi: false, jenis: ['fcstd'],
  potong: 6 * 1048576, maksMB: { fcstd: 100, pdf: 20 }, syarat: [], berkas: {}, periksa: null };
let _praktikBackendLama = false;
let _praktikKerja = { sibuk: false, pesan: '', kelas: '', progres: -1 };
let _praktikCallable = null;
function praktikAturanKelas() {
  try { return praktikAturanKelasMurni(PRAKTIK_BERKRITERIA, forumAturanAktif(), forumBukaMsMurni(_forumJadwalMentah), _praktikPengerjaanLama); } catch (e) { return false; }
}
function _praktikServerSaya(me) { return !!me && _praktikServer.kunci === _forumKunci(me) && typeof _praktikServer.aturan === 'boolean'; }
// Untuk diri sendiri putusan server (getModulProgress/unggahPraktik) didahulukan; selalu bersama aturan forum.
function _praktikAturanSaya() {
  const me = _forumSaya();
  if (!_forumAturanSaya()) return false;
  if (_praktikServerSaya(me)) return _praktikServer.aturan;
  if (_praktikBackendLama || _forumBackendLama) return false;
  return praktikAturanKelas();
}
function _praktikInfoSaya() {
  const me = _forumSaya();
  if (!me) return { poin: 0, pengali: null };
  const rec = _praktikModul['mhs_' + me.nim];
  const p = praktikPoinRekMurni(rec);
  if (p > 0) return { poin: p, pengali: Number(rec.pengali), waktu: rec.waktu };
  if (_praktikServerSaya(me) && _praktikServer.poin > 0) return { poin: _praktikServer.poin, pengali: _praktikServer.pengali, waktu: _praktikServer.waktu, simulasi: _praktikServer.simulasi };
  return { poin: 0, pengali: null };
}
(function () {
  const asliSkor = window._forumSkorSaya;
  window._forumSkorSaya = function (raw, bonus) {
    const t = (typeof asliSkor === 'function') ? asliSkor.apply(this, arguments) : null;
    const baris = document.getElementById('baris-praktik');
    if (t === null || !_praktikAturanSaya()) { if (baris) baris.style.display = 'none'; return t; }
    const info = _praktikInfoSaya();
    if (baris) {
      baris.style.display = '';
      baris.classList.toggle('aktif', info.poin > 0);
      const s = document.getElementById('scorePraktik');
      if (s) s.textContent = _forumFmt(info.poin);
    }
    return praktikSkorMurni(raw, bonus, _forumInfoSaya().poin, info.poin, _keaktifanTotal());
  };
  const asliPipa = window._forumPipa;
  window._forumPipa = function (mentah) {
    if (!forumAturanAktif() || !praktikAturanKelas()) return asliPipa(mentah);
    return praktikTerapkanMurni(mentah, _forumModul, _keaktifanModul, _praktikModul, masterStudents, _keaktifanTotal(), isSimulasiNim, keaktifanTerapkanMurni);
  };
  const asliEkspor = window._forumRingkasEkspor;
  window._forumRingkasEkspor = function (gaya) {
    const dasar = (typeof asliEkspor === 'function') ? asliEkspor(gaya) : '';
    if (!dasar || !_praktikAturanSaya()) return dasar;
    const t = _forumFmt(_praktikInfoSaya().poin) + '/' + PRAKTIK_POIN;
    return dasar + (gaya === 'teks' ? ' &nbsp;·&nbsp; Praktik terbimbing: ' + t : '<span class="score-mini">🛠 Praktik terbimbing: <strong>' + t + '</strong></span>');
  };
})();
function _praktikEl(id) { return document.getElementById(id); }
function _praktikUkuran(b) { const mb = (Number(b) || 0) / 1048576; return mb >= 1 ? (Math.round(mb * 10) / 10).toString().replace('.', ',') + ' MB' : Math.max(1, Math.round((Number(b) || 0) / 1024)) + ' KB'; }
function _praktikWaktu(iso) {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '';
}
function _praktikRender() {
  const kartu = _praktikEl('praktikKartu');
  if (!kartu) return;
  const me = _forumSaya();
  const tampil = me ? _praktikAturanSaya() : praktikAturanKelas();
  if (!tampil) { kartu.style.display = 'none'; return; }
  kartu.style.display = '';
  const info = _praktikInfoSaya();
  const lolos = info.poin > 0;
  kartu.classList.toggle('pk-lolos', lolos);
  const pil = _praktikEl('praktikPil');
  if (pil) pil.textContent = (me ? _forumFmt(info.poin) : '0') + '/' + PRAKTIK_POIN;
  const pdf = (_praktikServer.jenis || []).indexOf('pdf') >= 0;
  const teks = _praktikEl('praktikTeks');
  const namaFc = 'Latihan' + PRAKTIK_NOMOR + '_' + (me ? me.nim : 'NIM') + '.FCStd';
  if (teks) {
    if (!me) {
      teks.innerHTML = 'Mahasiswa mengunggah hasil akhir praktik di atas (<b>Latihan' + PRAKTIK_NOMOR + '_NIM.FCStd</b>, ditambah PDF lembar TechDraw bila rekamannya sampai TechDraw). Server memeriksa berkas terhadap hasil video; lolos = 3 poin (×0,65 bila lewat tenggat). Nilai modul: Tugas 45 + Forum 2 + Praktik 3.';
    } else if (lolos) {
      teks.innerHTML = '✅ Praktik lolos: <b>' + _forumFmt(info.poin) + '/' + PRAKTIK_POIN + ' poin</b>' + (info.pengali && info.pengali < 1 ? ' — terlambat (×' + _forumFmt(info.pengali) + ')' : ' — tepat waktu')
        + (info.waktu ? ' · ' + escH(_praktikWaktu(info.waktu)) : '') + (info.simulasi ? ' · akun simulasi: tidak disimpan' : '') + '. Berkasnya dikunci; poin ini tetap.';
    } else {
      teks.innerHTML = 'Unggah hasil akhir praktik sesuai video: <b>' + escH(namaFc) + '</b> (simpan dari FreeCAD lewat File → Save As dengan nama itu; mengganti nama di Explorer tidak cukup)'
        + (pdf ? ' dan <b>PDF lembar TechDraw</b> (File → Export PDF)' : '') + '. Server memeriksa setiap syarat di bawah. Belum sesuai? Perbaiki modelnya lalu unggah lagi — tanpa batas dan tanpa penalti. Lolos sesudah tenggat dikali 0,65.';
    }
  }
  const ul = _praktikEl('praktikSyarat');
  if (ul) {
    const hasil = {};
    const per = _praktikServer.periksa;
    for (const r of ((per && per.rincian) || [])) hasil[r.id] = r;
    const daftar = (_praktikServer.syarat && _praktikServer.syarat.length) ? _praktikServer.syarat : [];
    const tambahan = ((per && per.rincian) || []).filter((r) => !daftar.some((s) => s.id === r.id));
    ul.innerHTML = daftar.concat(tambahan).map((s) => {
      const r = hasil[s.id];
      const kelas = lolos ? 'pk-ok' : (r ? (r.ok ? 'pk-ok' : 'pk-gagal') : 'pk-belum');
      const tanda = lolos ? '✅' : (r ? (r.ok ? '✅' : '❌') : '▫️');
      const keterangan = !lolos && r && r.info ? '<span class="pk-info">' + escH(r.info) + '</span>' : '';
      return '<li class="' + kelas + '"><span class="pk-tanda" aria-hidden="true">' + tanda + '</span><span>' + escH(s.teks || r.teks || s.id) + keterangan + '</span></li>';
    }).join('');
    ul.style.display = daftar.length || tambahan.length ? '' : 'none';
  }
  const bisaUnggah = !!me && !lolos && !window._previewMode;
  const berkas = _praktikEl('praktikBerkas');
  const aksi = _praktikEl('praktikAksi');
  if (berkas) berkas.style.display = bisaUnggah ? '' : 'none';
  if (aksi) aksi.style.display = bisaUnggah ? '' : 'none';
  const pilihPdf = _praktikEl('praktikPilihPdf');
  if (pilihPdf) pilihPdf.style.display = pdf ? '' : 'none';
  const tombol = _praktikEl('praktikTombol');
  const ulang = _praktikEl('praktikUlang');
  if (tombol) tombol.disabled = _praktikKerja.sibuk;
  if (ulang) ulang.disabled = _praktikKerja.sibuk || !(_praktikServer.berkas && _praktikServer.berkas.fcstd);
  const prog = _praktikEl('praktikProgres');
  if (prog) prog.style.display = _praktikKerja.progres >= 0 ? '' : 'none';
  const bar = _praktikEl('praktikBar');
  if (bar) bar.style.width = Math.max(0, Math.min(100, _praktikKerja.progres)) + '%';
  const pesan = _praktikEl('praktikPesan');
  if (pesan) {
    let isi = _praktikKerja.pesan;
    const b = _praktikServer.berkas || {};
    if (!isi && me && !lolos && (b.fcstd || b.pdf)) {
      isi = 'Tersimpan di server: ' + [b.fcstd, b.pdf].filter(Boolean).map((x) => escH(x.namaBerkas) + ' (' + _praktikUkuran(x.size) + ')').join(', ')
        + (pdf && !b.pdf ? ' · PDF belum diunggah' : '') + '.';
    }
    pesan.innerHTML = isi || '';
    pesan.style.color = _praktikKerja.kelas === 'galat' ? '#fca5a5' : '';
  }
}
function _praktikSegarkan() {
  try { _forumSegarkan(); } catch (e) { console.warn('[Praktik] segarkan gagal:', e); }
  _praktikRender();
}
function _praktikTerapkanHasil(me, r) {
  if (!r || typeof r !== 'object') return;
  if (r.berkas && r.berkas.jenis) _praktikServer.berkas = Object.assign({}, _praktikServer.berkas, { [r.berkas.jenis]: r.berkas });
  if (Array.isArray(r.rincian) && (r.rincian.length || r.lolos)) _praktikServer.periksa = { lolos: r.lolos === true, rincian: r.rincian, diperiksaPada: new Date().toISOString() };
  if (r.lolos === true) {
    _praktikServer.poin = Number(r.praktikPoin) || 0;
    _praktikServer.pengali = (r.pengali === null || r.pengali === undefined) ? null : Number(r.pengali);
    _praktikServer.waktu = r.waktu || null;
    _praktikServer.simulasi = r.simulasi === true;
  }
}
function _praktikBase64(blob) {
  return new Promise((res, rej) => {
    const f = new FileReader();
    f.onload = () => res(String(f.result).split(',')[1] || '');
    f.onerror = () => rej(new Error('Gagal membaca berkas'));
    f.readAsDataURL(blob);
  });
}
function _praktikSesi() {
  const a = new Uint8Array(12);
  (window.crypto || {}).getRandomValues ? window.crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.floor(Math.random() * 256); });
  return Array.from(a, (x) => x.toString(16).padStart(2, '0')).join('');
}
function _praktikPanggil(data) {
  if (!_praktikCallable) _praktikCallable = httpsCallable(_functions, 'unggahPraktik', { timeout: 300000 });
  return _praktikCallable(data).then((r) => (r && r.data) || {});
}
const _praktikGalatTetap = /invalid-argument|failed-precondition|unauthenticated|permission-denied|not-found|resource-exhausted/;
async function _praktikKirim(me, jenis, file, mulai, total) {
  const P = Number(_praktikServer.potong) || 6 * 1048576;
  const jumlah = Math.max(1, Math.ceil(file.size / P));
  const sesi = _praktikSesi();
  let r = null;
  for (let ke = 0; ke < jumlah; ke += 1) {
    const dataBase64 = await _praktikBase64(file.slice(ke * P, (ke + 1) * P));
    for (let coba = 0; ; coba += 1) {
      try {
        r = await _praktikPanggil({ modulId: window.MODUL_ID, nim: String(me.nim), nama: me.nama || '', pinHash: window._sessionPinHash,
          aksi: 'potong', jenis, namaBerkas: file.name, sesi, ke, jumlah, ukuran: file.size, dataBase64 });
        break;
      } catch (e) {
        if (coba >= 2 || _praktikGalatTetap.test(String((e && e.code) || ''))) throw e;
        await new Promise((ok) => setTimeout(ok, 1500 * (coba + 1)));
      }
    }
    const terkirim = mulai + Math.min(file.size, (ke + 1) * P);
    _praktikKerja.progres = Math.round(terkirim / total * 100);
    _praktikKerja.pesan = (ke < jumlah - 1 ? '⏳ Mengunggah ' : '⏳ Memeriksa ') + escH(file.name) + ' — ' + _praktikUkuran(terkirim) + ' dari ' + _praktikUkuran(total) + (ke < jumlah - 1 ? '…' : ' (pemeriksaan bisa sampai 1 menit)…');
    _praktikRender();
  }
  return r;
}
async function _praktikUnggah() {
  const me = _forumSaya();
  if (_praktikKerja.sibuk) return;
  if (!me || !window._sessionPinHash) { _praktikKerja = { sibuk: false, pesan: '⚠ Masuk sebagai mahasiswa (NIM + PIN) untuk mengunggah.', kelas: 'galat', progres: -1 }; _praktikRender(); return; }
  const pdfWajib = (_praktikServer.jenis || []).indexOf('pdf') >= 0;
  const fFc = (_praktikEl('praktikFcstd') || {}).files ? _praktikEl('praktikFcstd').files[0] : null;
  const fPdf = pdfWajib && (_praktikEl('praktikPdf') || {}).files ? _praktikEl('praktikPdf').files[0] : null;
  const maks = _praktikServer.maksMB || { fcstd: 100, pdf: 20 };
  const salah = [];
  if (!fFc && !fPdf) salah.push('pilih berkas ' + (pdfWajib ? '.FCStd dan/atau PDF' : '.FCStd') + ' terlebih dahulu');
  if (fFc && !/\\.fcstd$/i.test(fFc.name)) salah.push('berkas FreeCAD harus berekstensi .FCStd (simpan lewat Ctrl+S, bukan Export)');
  if (fFc && fFc.size > maks.fcstd * 1048576) salah.push('ukuran .FCStd melebihi ' + maks.fcstd + ' MB');
  if (fPdf && !/\\.pdf$/i.test(fPdf.name)) salah.push('PDF harus berekstensi .pdf');
  if (fPdf && fPdf.size > maks.pdf * 1048576) salah.push('ukuran PDF melebihi ' + maks.pdf + ' MB');
  if (salah.length) { _praktikKerja = { sibuk: false, pesan: '⚠ ' + salah.join('; ') + '.', kelas: 'galat', progres: -1 }; _praktikRender(); return; }
  const total = (fFc ? fFc.size : 0) + (fPdf ? fPdf.size : 0);
  _praktikKerja = { sibuk: true, pesan: '⏳ Menyiapkan unggahan…', kelas: '', progres: 0 };
  _praktikRender();
  try {
    let mulai = 0;
    let r = null;
    for (const [jenis, f] of [['fcstd', fFc], ['pdf', fPdf]]) {
      if (!f) continue;
      r = await _praktikKirim(me, jenis, f, mulai, total);
      _praktikTerapkanHasil(me, r);
      mulai += f.size;
    }
    const lolos = r && r.lolos === true;
    const menunggu = r && Array.isArray(r.menunggu) ? r.menunggu : [];
    _praktikKerja = { sibuk: false, kelas: lolos ? '' : 'galat', progres: -1,
      pesan: lolos ? '✅ Lolos: ' + _forumFmt(r.praktikPoin) + '/' + PRAKTIK_POIN + ' poin praktik' + (r.simulasi ? ' (akun simulasi: tidak disimpan)' : '') + '.'
        : (menunggu.indexOf('pdf') >= 0 && !(r.rincian || []).some((x) => !x.ok && x.id !== 'pdf') ? 'Berkas .FCStd sesuai; unggah PDF lembar TechDraw untuk menyelesaikan.' : '❌ Belum sesuai: perbaiki syarat bertanda ❌ lalu unggah lagi.') };
    ['praktikFcstd', 'praktikPdf'].forEach((id) => { const el = _praktikEl(id); if (el) el.value = ''; });
  } catch (e) {
    console.warn('[Praktik] unggah gagal:', e && e.code, e && e.message);
    _praktikKerja = { sibuk: false, pesan: '⚠ ' + escH((e && e.message) || 'Unggah gagal') + (/unavailable|deadline|internal/.test(String(e && e.code)) ? ' — coba lagi.' : ''), kelas: 'galat', progres: -1 };
  }
  _praktikSegarkan();
}
async function _praktikPeriksaUlang() {
  const me = _forumSaya();
  if (_praktikKerja.sibuk || !me || !window._sessionPinHash) return;
  _praktikKerja = { sibuk: true, pesan: '⏳ Memeriksa berkas tersimpan…', kelas: '', progres: -1 };
  _praktikRender();
  try {
    const r = await _praktikPanggil({ modulId: window.MODUL_ID, nim: String(me.nim), pinHash: window._sessionPinHash, aksi: 'periksa' });
    _praktikTerapkanHasil(me, r);
    _praktikKerja = { sibuk: false, pesan: r.lolos ? '✅ Lolos.' : '❌ Belum sesuai: lihat syarat bertanda ❌.', kelas: r.lolos ? '' : 'galat', progres: -1 };
  } catch (e) {
    _praktikKerja = { sibuk: false, pesan: '⚠ ' + escH((e && e.message) || 'Pemeriksaan gagal'), kelas: 'galat', progres: -1 };
  }
  _praktikSegarkan();
}
(function () {
  const t = _praktikEl('praktikTombol');
  if (t) t.addEventListener('click', () => { _praktikUnggah(); });
  const u = _praktikEl('praktikUlang');
  if (u) u.addEventListener('click', () => { _praktikPeriksaUlang(); });
})();
// Progres server diterapkan (PROGRES-MODUL v2): getModulProgress membawa praktikAturan/Poin/Syarat/Berkas/Periksa.
window.addEventListener('progres-modul:diterapkan', (ev) => {
  const d = ev && ev.detail;
  const me = _forumSaya();
  if (!d || !d.ok || !me) return;
  const p = d.progres || {};
  if (typeof p.praktikAturan === 'boolean') {
    _praktikServer = { kunci: _forumKunci(me), aturan: p.praktikAturan, poin: Number(p.praktikPoin) || 0,
      pengali: (p.praktikPengali === null || p.praktikPengali === undefined) ? null : Number(p.praktikPengali),
      waktu: p.praktikWaktu || null, simulasi: p.simulasi === true, jenis: Array.isArray(p.praktikJenis) ? p.praktikJenis : ['fcstd'],
      potong: Number(p.praktikPotongBytes) || 6 * 1048576, maksMB: p.praktikMaksMB || { fcstd: 100, pdf: 20 },
      syarat: Array.isArray(p.praktikSyarat) ? p.praktikSyarat : [], berkas: p.praktikBerkas || {}, periksa: p.praktikPeriksa || null };
  } else {
    // Backend tanpa fitur praktik: kode ekspor server masih Tugas 48 + Forum 2.
    _praktikBackendLama = true;
  }
  _praktikSegarkan();
});
onValue(ref(db, 'praktik/' + FORUM_KURSUS + '/' + MODULE_ID), (snap) => {
  const me = _forumSaya();
  const tadi = me ? praktikPoinRekMurni(_praktikModul['mhs_' + me.nim]) : 0;
  _praktikModul = snap.val() || {};
  // Node milik sendiri dihapus (reset modul / cabutPoinPraktik): poin di memori tidak berlaku lagi.
  if (me && tadi > 0 && !(praktikPoinRekMurni(_praktikModul['mhs_' + me.nim]) > 0) && _praktikServer.kunci === _forumKunci(me)) {
    _praktikServer.poin = 0; _praktikServer.pengali = null; _praktikServer.periksa = null;
  }
  _praktikSegarkan();
}, (err) => console.warn('[Praktik] baca gagal:', err && err.message));
onValue(ref(db, DB_PATH), (snap) => {
  _praktikPengerjaanLama = praktikPengerjaanLamaMurni(snap.val(), isSimulasiNim);
  _praktikSegarkan();
}, (err) => console.warn('[Praktik] baca kunjungan gagal:', err && err.message));
onValue(ref(db, SCHEDULE_PATH), () => { _praktikRender(); }, () => {});
// PRAKTIK-POIN:DATA END v1
`;

const RX_CSS = /<style id="praktik-poin-style">[\s\S]*?<\/style>\n/;
const RX_KARTU = /\n[ \t]*<!-- PRAKTIK-POIN:KARTU BEGIN v\d+[^\n]*-->[\s\S]*?<!-- PRAKTIK-POIN:KARTU END v\d+ -->/;
const RX_BARIS = /\n[ \t]*<div id="baris-praktik"[^\n]*<\/div>/g;
const RX_DATA = /\/\/ PRAKTIK-POIN:DATA BEGIN[\s\S]*?\/\/ PRAKTIK-POIN:DATA END v\d+\n/;
const ANKER_DATA = /\/\/ HASIL-KEREN:DATA END v\d+\n/;
const hitung = (s, sub) => s.split(sub).length - 1;

/** Isi <script> yang memuat indeks i. */
function skripPemuat(html, i) {
  const a = html.lastIndexOf("<script", i);
  const z = html.indexOf("</script>", i);
  if (a < 0 || z < 0 || html.lastIndexOf("</script>", i) > a) throw new Error("blok DATA tidak berada di dalam <script>");
  return html.slice(a, z);
}

/** Pasang semua blok pada teks halaman CAD Modul n (murni; dipakai juga validator). */
export function pasang(html, n) {
  if (html.includes("\r")) throw new Error("berkas memuat CR");
  // 1. CSS
  if (RX_CSS.test(html)) html = html.replace(RX_CSS, () => CSS);
  else { const i = html.indexOf("</head>"); if (i < 0) throw new Error("</head> tidak ada"); html = html.slice(0, i) + CSS + html.slice(i); }
  // 2. Kartu: akhir Bagian 09 (#m-praktik), tepat sebelum kotak centang bagian itu.
  html = html.replace(RX_KARTU, "");
  {
    const a = html.indexOf('<div class="section" id="m-praktik">');
    if (a < 0) throw new Error("#m-praktik tidak ditemukan");
    const z = html.indexOf('<div class="section"', a + 10);
    const potong = html.slice(a, z < 0 ? html.length : z);
    const m = [...potong.matchAll(/\n([ \t]*)<label class="pm-centang"/g)];
    if (m.length !== 1) throw new Error(`kotak centang Bagian 09 muncul ${m.length}x, harusnya 1`);
    const j = a + m[0].index;
    html = html.slice(0, j) + KARTU(m[0][1]) + html.slice(j);
  }
  // 3. Baris bilah skor sesudah #baris-forum
  html = html.replace(RX_BARIS, "");
  {
    const m = [...html.matchAll(/\n([ \t]*)<div id="baris-forum"[^\n]*<\/div>/g)];
    if (m.length !== 1) throw new Error(`#baris-forum muncul ${m.length}x, harusnya 1 (jalankan forum-poin.mjs dulu)`);
    const j = m[0].index + m[0][0].length;
    html = html.slice(0, j) + BARIS(m[0][1]) + html.slice(j);
  }
  // 4. DATA sesudah HASIL-KEREN:DATA END (skrip modul yang sama dengan FORUM-POIN)
  html = html.replace(RX_DATA, "");
  {
    const m = html.match(ANKER_DATA);
    if (!m || hitung(html, m[0]) !== 1) throw new Error("HASIL-KEREN:DATA END tidak ditemukan tepat sekali (jalankan hasil-keren.mjs dulu)");
    const j = html.indexOf(m[0]) + m[0].length;
    html = html.slice(0, j) + DATA(n) + html.slice(j);
    const skrip = skripPemuat(html, j);
    for (const dep of ["// FORUM-POIN:DATA BEGIN v4", "function forumAturanAktif()", "function _forumSaya()", "function _forumInfoSaya()", "function _forumSegarkan()",
      "function forumBukaMsMurni(", "let _forumJadwalMentah", "let _forumBackendLama", "const FORUM_KURSUS = 'pemodelan_cad';", "window._forumPipa = function",
      "window._forumSkorSaya = function", "window._forumRingkasEkspor = function", "const _functions = getFunctions(", "httpsCallable", "function escH("]) {
      if (!skrip.includes(dep)) throw new Error(`skrip modul tempat blok DATA tidak memuat ${dep}`);
    }
  }
  for (const [t, k] of [["PRAKTIK-POIN:CSS v1", 1], ['data-praktik-poin="kartu v1"', 1], ['data-praktik-poin="baris v1"', 1],
    ["PRAKTIK-POIN:DATA BEGIN v1", 1], ["PRAKTIK-POIN:DATA END v1", 1], ['id="praktikKartu"', 1], ['id="scorePraktik"', 1], [`const PRAKTIK_NOMOR = ${n};`, 1]]) {
    if (hitung(html, t) !== k) throw new Error(`penanda ${t} muncul ${hitung(html, t)}x, harusnya ${k}`);
  }
  return html;
}

export const HALAMAN = Array.from({ length: 14 }, (_, i) => ({ n: i + 1, rel: `${KURSUS_FOLDER}/Modul/Modul-${i + 1}.html` }));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let ubah = 0;
  const hasil = [];
  for (const { n, rel } of HALAMAN) {
    const f = path.join(root, rel);
    const awal = fs.readFileSync(f, "utf8");
    let baru;
    try { baru = pasang(awal, n); } catch (e) { throw new Error(`${rel}: ${e.message}`); }
    if (baru !== awal) { ubah += 1; hasil.push([f, baru]); }
  }
  if (!periksa) for (const [f, h] of hasil) fs.writeFileSync(f, h);
  console.log(`praktik-poin: ${ubah} dari ${HALAMAN.length} halaman CAD ${periksa ? "akan diperbarui" : "diperbarui"} (PRAKTIK-POIN v1)`);
  if (periksa && ubah) process.exitCode = 1;
}
