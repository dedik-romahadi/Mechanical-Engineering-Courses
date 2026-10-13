/**
 * Forum 2 poin — forum diskusi modul bernilai 2 dari 50 poin (kontrak disetujui dosen 13 Okt 2026).
 *
 * ATURAN. Berlaku per modul (amandemen v3, 13 Okt 2026; identik backend _aturanForumUntuk):
 * aktif HANYA bila
 *   (1) jadwal mentah settings/<kursus>/<pertemuan>/schedule ada dan waktu bukanya >= FORUM_POIN_MULAI
 *       (2026-10-15T00:00:00+07:00; batas khusus per kursus di MULAI_KURSUS — Pemodelan CAD mulai
 *       Pertemuan 5, 2026-10-12T12:00:00+07:00, permintaan dosen 13 Okt 2026; identik backend
 *       FORUM_POIN_MULAI_KURSUS). Waktu buka = forumBukaMsMurni(jadwal), cermin backend
 *       _moduleOpenMs (= evalSchedule mode modul = _normalizeModuleScheduleWib halaman): `start`
 *       wajib string; due (WIB "YYYY-MM-DDTHH:MM") - duration hari bila keduanya sah, selain itu
 *       `start`; DAN
 *   (2) modul BELUM DIKERJAKAN mahasiswa sebelum batas: tidak ada record di visitors/<kursus>/<pertemuan>
 *       (kunci mhs_*, role 'student', bukan akun simulasi — NIM dari kunci maupun field nim) dengan
 *       `poinPertama` ATAU `pointTimestamp` berbentuk ISO lengkap berzona dan < FORUM_POIN_MULAI
 *       (forumPengerjaanLamaMurni, identik backend _adaPengerjaanSebelumForum). Kedua field hanya
 *       ditulis server (aturan RTDB menolak tulisan klien; poinPertama dibekukan server pada pengerjaan
 *       pertama). Modul yang sudah dikerjakan sebelum 15 Okt 2026 tetap beraturan lama walau dosen
 *       kemudian mengubah jadwalnya (Atur Jadwal menulis start = due - durasi). `timestamp` (akses
 *       pertama) TIDAK dipakai: halaman menulisnya juga saat login sebelum modul dibuka, dan klien tanpa
 *       auth bisa membuat record bertimestamp bebas (satu tanaman akan mengunci satu kelas).
 *   Selama data kunjungan belum diterima halaman memakai aturan lama (untuk diri sendiri putusan
 *   server didahulukan). Selain itu ATURAN LAMA persis: resmi = min(raw + bonusKeaktifan, 50).
 * ATURAN BARU (FORUM_POIN = 2, tugasMaks = total - 2 = 48):
 *   tugas = raw x 48/50 (poin soal 1/2/4 dan kunci tidak berubah)
 *   dasar = min(tugas + bonusKeaktifan, 48)          (bonus keaktifan tetap 10% x 50 = 5)
 *   forum = 2 x pengali bila node forum ada, else 0   (pengali 1 tepat waktu, 0,65 terlambat)
 *   resmi = dasar + forum (maks 50)
 * Contoh: raw50 tanpa forum 48; raw50+forum 50; raw40+forum 40,4; raw40+forum+aktif 45,4;
 * raw50+forum terlambat 49,3; raw46+aktif+forum 50; raw0+forum 2.
 *
 * DATA. forum/<kursus>/<pertemuan>/mhs_<NIM> = { waktu, pengali } — dibaca publik, ditulis
 * HANYA server (callable klaimPoinForum, Admin SDK) sesudah memeriksa jawaban forum yang
 * tersimpan (saveModulForum): >= 30 kata, >= 15 kata unik, rasio unik >= 0,4 per jawaban, dan
 * tidak ada dua jawaban (hampir) sama. Node "lengket": tidak dihitung ulang walau jawaban
 * disunting; hanya dicabut admin (cabutPoinForum) atau reset modul. Kode ekspor dan rekap OBE
 * dihitung backend dengan rumus yang sama (_poinResmiModul).
 *
 * YANG DIPASANG (semua bertanda, idempoten; jalan kedua melaporkan 0 halaman):
 *   FORUM-POIN:CSS    <style id="forum-poin-style"> di <head>
 *   FORUM-POIN:PANEL  #forumPoinStatus sesudah #forum-blocked-msg (panel status tab Forum):
 *                     "Poin forum x/2" atau alasan kurang per jawaban (rincian server)
 *   FORUM-POIN:BARIS  #baris-forum "Forum diskusi x/2 poin" sesudah #baris-keaktifan di bilah
 *                     skor (tersembunyi di modul aturan lama)
 *   FORUM-POIN:SKOR   updateScore: total = window._forumSkorSaya(...) bila aturan baru aktif,
 *                     selain itu rumus lama apa adanya
 *   FORUM-POIN:EKSPOR ringkasan Export HTML: "Forum diskusi x/2" (aturan baru saja)
 *   FORUM-POIN:DATA   (v4) skrip modul sesudah blok KEAKTIFAN-KELAS:DATA (v5+): langganan publik
 *                     forum/<kursus>/<MODULE_ID>, fungsi murni forumTerapkanMurni (tabel Hasil,
 *                     Top Skor, statistik lewat window._forumPipa -> _keaktifanHitung),
 *                     forumSkorMurni (bilah skor), klaim klaimPoinForum sesudah progres server
 *                     diterapkan dan sesudah forum tersimpan (mahasiswa & akun simulasi; tidak
 *                     untuk dosen/Mode Preview), serta gerbang Export (menunggu poin forum).
 *                     v2: aturan dari jadwal MENTAH + data kunjungan mentah (langganan sendiri ke
 *                     SCHEDULE_PATH dan DB_PATH); alasan klaim 'dicabut' (cabutPoinForum) tampil
 *                     di panel Forum dan di-cache seperti 'kurang' (klaim ulang hanya bila teks
 *                     tersimpan berubah / event forum-tersimpan); gerbang Export menyebut alasannya.
 *                     v4: FORUM_POIN_MULAI per kursus (MULAI_KURSUS; CAD mulai Pertemuan 5).
 *                     v3: penguncian aturan lama dari bukti PENGERJAAN tulisan server (poinPertama /
 *                     pointTimestamp ISO berzona), bukan `timestamp` kunjungan — identik backend.
 *
 * Kunci kursus RTDB dibaca dari DB_PATH halaman (Matematika 4 lewat COURSE_ID), sama dengan
 * keaktifan-kelas.mjs. Jalankan SESUDAH scripts/keaktifan-kelas.mjs (butuh DATA v5).
 *
 * Pakai:
 *   node scripts/forum-poin.mjs            # terapkan
 *   node scripts/forum-poin.mjs --periksa  # laporan saja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const periksa = process.argv.includes("--periksa");

const CSS = `<style id="forum-poin-style">/* FORUM-POIN:CSS v1 — dipasang scripts/forum-poin.mjs */
#baris-forum.aktif{color:#6ee7b7;font-weight:700}
#baris-forum.aktif::after{content:" ✓"}
.forum-poin-status{flex-basis:100%;margin-top:2px;padding:10px 14px;border-radius:10px;font-size:13px;line-height:1.55;text-align:left;border:1px solid rgba(148,163,184,.3);background:rgba(148,163,184,.08);color:#e2e8f0}
.forum-poin-status b{font-weight:800}
.forum-poin-status.fp-ok{border-color:rgba(0,224,158,.45);background:rgba(0,224,158,.10);color:#9ff3d2}
.forum-poin-status.fp-kurang{border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.08);color:#fde68a}
</style>
`;

const PANEL = (ind) => `\n${ind}<div id="forumPoinStatus" class="forum-poin-status" data-forum-poin="panel v1" style="display:none" aria-live="polite"></div>`;
// Batas mulai aturan forum per kursus (slug RTDB); kursus lain FORUM_POIN_MULAI bawaan.
const MULAI_BAWAAN = "2026-10-15T00:00:00+07:00";
const MULAI_KURSUS = { pemodelan_cad: "2026-10-12T12:00:00+07:00" };
const MULAI_TEKS = { pemodelan_cad: "Pertemuan 5 (12 Okt 2026)" };
const mulaiKursus = (k) => MULAI_KURSUS[k] || MULAI_BAWAAN;
const BARIS = (ind, kursus) => `\n${ind}<div id="baris-forum" data-forum-poin="baris v1" style="display:none" title="Modul yang dibuka sejak ${MULAI_TEKS[kursus] || "15 Okt 2026"}: nilai tugas diskalakan ×48/50, forum diskusi 2 poin">Forum diskusi: <span id="scoreForum" style="color:#34d399">0</span>/2 poin</div>`;
const EKSPOR_MINI = "${(typeof window._forumRingkasEkspor === 'function') ? window._forumRingkasEkspor('mini') : ''}";
const EKSPOR_TEKS = "${(typeof window._forumRingkasEkspor === 'function') ? window._forumRingkasEkspor('teks') : ''}";
// Sisipan ringkasan ekspor keaktifan (scripts/keaktifan-kelas.mjs) — 82 halaman.
const EKSPOR_AKTIF = "${(typeof window._bonusKeaktifanSaya === 'function' && window._bonusKeaktifanSaya() > 0) ? '<span class=\"score-mini\">🔥 Keaktifan kelas: <strong>+' + _fmtPts(window._bonusKeaktifanSaya()) + '</strong></span>' : ''}";
// Ringkasan satu baris (Matematika 4 Modul 4, Opto Modul 4).
const RX_EKSPOR_TEKS = /(<div class="score-detail" style="margin-top:6px">Poin: \$\{_fmtPts\(total\)\}[^\n]*?)(<\/div>)/g;

const SKOR = (ind, mentah, asli) => `\n${ind}// FORUM-POIN:SKOR v1 — aturan forum 2 poin (scripts/forum-poin.mjs); null = aturan lama (rumus di bawah, tidak berubah).\n${ind}const _forumTotal = (typeof window._forumSkorSaya === 'function') ? window._forumSkorSaya(${mentah}, _bonusAktif) : null;\n${ind}const total = _forumTotal !== null ? _forumTotal : ${asli};\n`;
// Baris total keaktifan (v4/v5): const total = Math.min(mc + X + Y + _bonusAktif, CAP);
const RX_TOTAL = /\n([ \t]*)const total = (Math\.min\((mc \+ \w+ \+ \w+) \+ _bonusAktif, [^\n]*\));\n/g;
const RX_SKOR_BLOK = /\n([ \t]*)\/\/ FORUM-POIN:SKOR v\d+[^\n]*\n[ \t]*const _forumTotal = [^\n]*\n[ \t]*const total = _forumTotal !== null \? _forumTotal : ([^\n]*);\n/g;

const DATA = (kursus) => `// FORUM-POIN:DATA BEGIN v4 — dipasang scripts/forum-poin.mjs
// Aturan "forum 2 poin" (kontrak dosen 13 Okt 2026) untuk modul yang dibuka sejak FORUM_POIN_MULAI:
// tugas diskalakan x(total-2)/total, bonus keaktifan dibatasi total-2, forum diskusi = 2 x pengali
// bila node forum/<kursus>/<pertemuan>/mhs_<NIM> ada ({waktu, pengali}; dibaca publik, ditulis hanya
// server lewat klaimPoinForum). Amandemen 13 Okt 2026 (identik backend _aturanForumUntuk): waktu buka
// dari jadwal MENTAH seperti _moduleOpenMs/evalSchedule mode modul (v2), dan modul yang sudah DIKERJAKAN
// mahasiswa (bukan simulasi) sebelum FORUM_POIN_MULAI — bukti poinPertama/pointTimestamp tulisan server,
// bukan timestamp kunjungan — tetap aturan lama (v3).
// Modul tanpa jadwal, dibuka lebih awal, atau sudah dikerjakan sebelum batas: aturan lama persis
// (keaktifanTerapkanMurni 5 argumen, bilah skor lama).
const FORUM_POIN_MULAI = '${mulaiKursus(kursus)}';
const FORUM_POIN_MULAI_MS = Date.parse(FORUM_POIN_MULAI);
const FORUM_POIN = 2;
const FORUM_KURSUS = '${kursus}';
// Waktu buka modul (ms) dari jadwal mentah RTDB; NaN bila 'start' bukan string atau kosong. Cermin _moduleOpenMs
// backend dan _normalizeModuleScheduleWib halaman: due WIB - duration hari bila keduanya sah.
function forumBukaMsMurni(jadwal) {
  if (!jadwal || typeof jadwal !== 'object' || typeof jadwal.start !== 'string' || !jadwal.start) return NaN;
  const m = typeof jadwal.due === 'string' ? jadwal.due.match(/^(\\d{4})-(\\d{2})-(\\d{2})T((?:[01]\\d|2[0-3])):([0-5]\\d)$/) : null;
  const dueMs = m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 7, +m[5]) : NaN;
  const hari = Number(jadwal.duration);
  if (Number.isFinite(dueMs) && Number.isFinite(hari) && hari > 0) return dueMs - hari * 24 * 60 * 60 * 1000;
  return new Date(jadwal.start).getTime();
}
// Waktu ISO lengkap BERZONA (ms) atau NaN; string lain diabaikan supaya hasil tidak bergantung zona
// waktu browser (cermin backend FORUM_ISO_BERZONA/_msIsoBerzona).
const FORUM_ISO_BERZONA = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,3})?)?(Z|[+-]\\d{2}:\\d{2})$/;
function forumMsIsoBerzona(s) { return (typeof s === 'string' && FORUM_ISO_BERZONA.test(s)) ? Date.parse(s) : NaN; }
// Sudah ada PENGERJAAN mahasiswa sebelum FORUM_POIN_MULAI? Cermin backend _adaPengerjaanSebelumForum:
// kunci mhs_*, role student, bukan akun simulasi (NIM kunci maupun field nim), dan poinPertama ATAU
// pointTimestamp (hanya ditulis server) ISO berzona < batas. timestamp/lastVisit (tulisan klien) tidak
// dihitung. data = snapshot mentah visitors/<kursus>/<pertemuan>.
function forumPengerjaanLamaMurni(data, isSim) {
  if (!data || typeof data !== 'object') return false;
  for (const [kunci, v] of Object.entries(data)) {
    if (kunci.indexOf('mhs_') !== 0 || !v || typeof v !== 'object' || v.role !== 'student') continue;
    if (isSim(kunci.slice(4)) || isSim(String(v.nim))) continue;
    for (const t of [forumMsIsoBerzona(v.poinPertama), forumMsIsoBerzona(v.pointTimestamp)]) {
      if (Number.isFinite(t) && t < FORUM_POIN_MULAI_MS) return true;
    }
  }
  return false;
}
// jadwal = nilai mentah schedule; pengerjaanLama = hasil forumPengerjaanLamaMurni (true -> aturan lama).
function forumAturanBaruMurni(jadwal, pengerjaanLama) {
  if (pengerjaanLama === true) return false;
  const ms = forumBukaMsMurni(jadwal);
  return Number.isFinite(ms) && ms >= FORUM_POIN_MULAI_MS;
}
function forumPoinRekMurni(rec) {
  if (!rec || typeof rec !== 'object') return 0;
  const p = Number(rec.pengali);
  return (p > 0 && p <= 1) ? FORUM_POIN * p : 0;
}
function forumBulatMurni(n) { return Math.round((Number(n) || 0) * 1e6) / 1e6; }
// Skor satu mahasiswa (bilah skor): raw = poin tugas mentah (PG + tugas), bonus = keaktifan.
function forumSkorMurni(raw, bonus, forumPoin, total) {
  const maks = total - FORUM_POIN;
  const tugas = (Number(raw) || 0) * maks / total;
  return forumBulatMurni(Math.min(tugas + (Number(bonus) || 0), maks) + (Number(forumPoin) || 0));
}
// Daftar kunjungan (tabel Hasil, Top Skor, statistik). Urutan aturan baru: skala tugas ->
// keaktifan (batas total-2, parameter ke-6 keaktifanTerapkanMurni) -> poin forum. Aturan lama:
// keaktifanTerapkanMurni 5 argumen persis. Data mentah tidak diubah di tempat.
function forumTerapkanMurni(list, modulForum, modulAktif, roster, total, isSim, aturanBaru, terapkanAktif) {
  if (!aturanBaru) return terapkanAktif(list, modulAktif, roster, total, isSim);
  const maks = total - FORUM_POIN;
  const skala = (list || []).map((v) => {
    if (!v || v.role === 'dosen' || v.role === 'guest') return v;
    const asli = Number(v.points) || 0;
    return Object.assign({}, v, { points: asli * maks / total, poinMentah: asli });
  });
  const ada = new Set();
  const out = terapkanAktif(skala, modulAktif, roster, total, isSim, maks).map((v) => {
    if (!v || v.role === 'dosen' || v.role === 'guest') return v;
    ada.add(String(v.nim));
    const f = forumPoinRekMurni((modulForum || {})['mhs_' + v.nim]);
    return Object.assign({}, v, { points: forumBulatMurni((Number(v.points) || 0) + f), poinForum: f, forumAturan: true });
  });
  // Poin forum tanpa kunjungan (mis. kunjungan direset): tetap tampil dengan poin forumnya.
  for (const [kunci, rec] of Object.entries(modulForum || {})) {
    if (kunci.indexOf('mhs_') !== 0) continue;
    const nim = kunci.slice(4);
    const f = forumPoinRekMurni(rec);
    if (!f || ada.has(nim) || isSim(nim)) continue;
    const s = (roster || []).find((x) => String(x.nim) === nim);
    if (!s) continue;
    out.push({ nama: s.nama, nim: nim, role: 'student', timestamp: rec.waktu, lastVisit: rec.waktu, visitCount: 0,
      points: forumBulatMurni(f), poinMentah: 0, poinForum: f, forumAturan: true, tanpaKunjungan: true });
  }
  return out;
}
let _forumModul = {};
let _forumKlaim = { kunci: '', hasil: null, sibuk: false, ulang: false, galat: '', teks: '' };
let _forumServer = { kunci: '', aturan: null, poin: 0, pengali: null };
let _forumDiblok = false;
let _forumKlaimCallable = null;
// Jadwal mentah (SCHEDULE_PATH) dan putusan pengerjaan lama (data kunjungan DB_PATH) — langganan blok ini.
// _forumPengerjaanLama null = data kunjungan belum diterima (aturan lama sampai jelas).
let _forumJadwalMentah = null;
let _forumPengerjaanLama = null;
// Teks forum yang TERSIMPAN di server (getModulProgress p.forum / detail.jawaban event
// forum-tersimpan): server memeriksa teks ini, bukan isi textarea (draf bisa belum terkirim).
let _forumTeksServer = null;
// Backend belum memuat aturan forum (getModulProgress sukses tanpa forumAturan boolean): kode
// ekspor server masih aturan lama -> halaman ikut aturan lama, gerbang Export tidak menahan.
let _forumBackendLama = false;
// Callable klaimPoinForum belum ter-deploy (not-found/unimplemented): klaim mustahil -> gerbang
// Export dibuka (fail-open); aturan skor tetap mengikuti putusan getModulProgress.
let _forumKlaimTiada = false;
function _forumFmt(n) { const r = Math.round((Number(n) || 0) * 100) / 100; return String(r); }
function forumAturanAktif() {
  if (_forumBackendLama || _forumPengerjaanLama !== false) return false;
  try { return forumAturanBaruMurni(_forumJadwalMentah, _forumPengerjaanLama); } catch (e) { return false; }
}
// Mahasiswa & akun simulasi yang login; dosen, tamu, dan Mode Preview tidak.
function _forumSaya() {
  const me = (typeof getIdentityLocal === 'function') ? getIdentityLocal() : null;
  return (me && me.role === 'student' && me.nim && !window._previewMode) ? me : null;
}
function _forumKunci(me) { return String(window.MODUL_ID || MODULE_ID) + '|' + String(me.nim); }
// Untuk bilah skor/ekspor/gerbang diri sendiri, putusan server (klaim atau getModulProgress) didahulukan.
function _forumAturanSaya() {
  const me = _forumSaya();
  if (me) {
    const k = _forumKunci(me);
    if (_forumKlaim.kunci === k && _forumKlaim.hasil && typeof _forumKlaim.hasil.aktif === 'boolean') return _forumKlaim.hasil.aktif;
    if (_forumServer.kunci === k && typeof _forumServer.aturan === 'boolean') return _forumServer.aturan;
  }
  return forumAturanAktif();
}
function _forumInfoSaya() {
  const me = _forumSaya();
  if (!me) return { poin: 0, pengali: null };
  const rec = _forumModul['mhs_' + me.nim];
  const f = forumPoinRekMurni(rec);
  if (f > 0) return { poin: f, pengali: Number(rec.pengali) };
  const k = _forumKunci(me);
  const h = _forumKlaim.kunci === k ? _forumKlaim.hasil : null;
  if (h && h.aktif && Number(h.forumPoin) > 0) return { poin: Number(h.forumPoin), pengali: Number(h.pengali) || null, simulasi: !!h.simulasi };
  if (_forumServer.kunci === k && _forumServer.poin > 0) return { poin: _forumServer.poin, pengali: _forumServer.pengali };
  return { poin: 0, pengali: null };
}
// Dipanggil updateScore (FORUM-POIN:SKOR): null = aturan lama (baris forum disembunyikan).
window._forumSkorSaya = function (raw, bonus) {
  const baris = document.getElementById('baris-forum');
  if (!_forumAturanSaya()) { if (baris) baris.style.display = 'none'; return null; }
  const info = _forumInfoSaya();
  if (baris) {
    baris.style.display = '';
    baris.classList.toggle('aktif', info.poin > 0);
    const s = document.getElementById('scoreForum');
    if (s) s.textContent = _forumFmt(info.poin);
  }
  return forumSkorMurni(raw, bonus, info.poin, _keaktifanTotal());
};
// Dipakai _keaktifanHitung (KEAKTIFAN-KELAS:DATA v5) untuk tabel Hasil, Top Skor, statistik.
window._forumPipa = function (mentah) {
  return forumTerapkanMurni(mentah, _forumModul, _keaktifanModul, masterStudents, _keaktifanTotal(), isSimulasiNim, forumAturanAktif(), keaktifanTerapkanMurni);
};
// Ringkasan Export HTML (FORUM-POIN:EKSPOR): kosong pada aturan lama.
window._forumRingkasEkspor = function (gaya) {
  if (!_forumAturanSaya()) return '';
  const t = _forumFmt(_forumInfoSaya().poin) + '/' + FORUM_POIN;
  return gaya === 'teks' ? ' &nbsp;·&nbsp; Forum diskusi: ' + t : '<span class="score-mini">💬 Forum diskusi: <strong>' + t + '</strong></span>';
};
function _forumWajibEkspor() { return !_forumKlaimTiada && !_forumBackendLama && !!_forumSaya() && _forumAturanSaya() && !(_forumInfoSaya().poin > 0); }
// Alasan gerbang Export (selalu diawali "Forum diskusi" supaya bagian lama dapat diganti).
function _forumAlasanEkspor() {
  const me = _forumSaya();
  const sama = !!me && _forumKlaim.kunci === _forumKunci(me);
  const h = sama ? _forumKlaim.hasil : null;
  if (h && h.alasan === 'dicabut') return 'Forum diskusi: poin forum (' + FORUM_POIN + ' poin) dicabut dosen — perbaiki/ubah jawaban forum di tab Forum lalu simpan untuk dinilai ulang';
  if (h && h.alasan === 'kurang') return 'Forum diskusi belum memenuhi syarat poin forum (' + _forumRincianTeks(h.rincian) + ') — perbaiki jawaban di tab Forum';
  if (h && h.alasan === 'belum-dibuka') return 'Forum diskusi: modul belum dibuka, poin forum belum dapat diklaim';
  if (sama && _forumKlaim.sibuk) return 'Forum diskusi: poin forum sedang diperiksa server…';
  if (sama && _forumKlaim.galat) return 'Forum diskusi: poin forum belum dapat diperiksa (' + _forumKlaim.galat + ') — muat ulang halaman untuk mencoba lagi';
  return 'Forum diskusi belum lengkap: poin forum (' + FORUM_POIN + ' poin) belum diklaim — lengkapi ketiga jawaban di tab Forum';
}
function _forumGerbangEkspor() {
  if (!_forumWajibEkspor()) return;
  _forumDiblok = true;
  const btn = document.getElementById('btn-score-export');
  if (btn) { if (typeof _setBtnState === 'function') _setBtnState(btn, false); else btn.disabled = true; }
  const msg = document.getElementById('export-blocked-msg');
  if (!msg) return;
  // Bagian forum sebelumnya diganti alasan terkini; bagian lain dari checkExportReady dipertahankan.
  const bagian = String(msg.textContent || '').replace(/^⚠\\s*/, '').split(' · ').filter((x) => x && x.indexOf('Forum diskusi') !== 0);
  bagian.push(_forumAlasanEkspor());
  msg.textContent = '⚠ ' + bagian.join(' · ');
}
function _forumNamaJawaban(x) { return String(x).replace(/fq(\\d)/g, 'Q$1'); }
function _forumTeksMirip(x) {
  if (Array.isArray(x)) return x.map(_forumNamaJawaban).join(' & ');
  if (x && typeof x === 'object') {
    const a = x.a || x.dari || x.satu || x.kiri, b = x.b || x.ke || x.dua || x.kanan;
    if (a && b) return _forumNamaJawaban(a) + ' & ' + _forumNamaJawaban(b);
    return _forumNamaJawaban(JSON.stringify(x));
  }
  return _forumNamaJawaban(x);
}
function _forumRincianTeks(r) {
  const out = [];
  ['fq1', 'fq2', 'fq3'].forEach((k, i) => {
    const x = r && r[k];
    if (!x || x.ok) return;
    const why = [];
    if (Number(x.kata) < 30) why.push((Number(x.kata) || 0) + ' kata (min 30)');
    if (Number(x.unik) < 15) why.push((Number(x.unik) || 0) + ' kata berbeda (min 15)');
    if (Number(x.rasio) < 0.4) why.push('kata berbeda ' + Math.round((Number(x.rasio) || 0) * 100) + '% (min 40%)');
    out.push('Q' + (i + 1) + ': ' + (why.join(', ') || 'belum memenuhi syarat'));
  });
  const m = r && r.mirip;
  if (Array.isArray(m) && m.length) out.push('jawaban sama/hampir sama: ' + m.map(_forumTeksMirip).join('; '));
  return out.join(' · ') || 'jawaban belum memenuhi syarat';
}
function _forumPanel() {
  const el = document.getElementById('forumPoinStatus');
  if (!el) return;
  const me = _forumSaya();
  if (!(me ? _forumAturanSaya() : forumAturanAktif())) { el.style.display = 'none'; el.innerHTML = ''; return; }
  const total = _keaktifanTotal();
  let kelas = 'info', isi;
  if (!me) {
    isi = '💬 Forum diskusi modul ini bernilai <b>' + FORUM_POIN + ' poin</b> (nilai tugas diskalakan ×' + (total - FORUM_POIN) + '/' + total + '). Poin diklaim otomatis setelah ketiga jawaban mahasiswa tersimpan dan memenuhi syarat.';
  } else {
    const info = _forumInfoSaya();
    const sama = _forumKlaim.kunci === _forumKunci(me);
    const h = sama ? _forumKlaim.hasil : null;
    if (info.poin > 0) {
      kelas = 'ok';
      isi = '✅ Poin forum <b>' + _forumFmt(info.poin) + '/' + FORUM_POIN + '</b>' + (info.pengali && info.pengali < 1 ? ' — terlambat (×' + _forumFmt(info.pengali) + ')' : ' — tepat waktu')
        + (info.simulasi ? ' · akun simulasi: tidak disimpan' : '') + '. Poin ini tetap walau jawaban disunting.';
    } else if (sama && _forumKlaim.sibuk) {
      isi = '⏳ Memeriksa poin forum…';
    } else if (h && h.alasan === 'belum-dibuka') {
      kelas = 'kurang'; isi = '⏳ Poin forum <b>0/' + FORUM_POIN + '</b> — modul belum dibuka.';
    } else if (h && h.alasan === 'dicabut') {
      kelas = 'kurang'; isi = '⚠ Poin forum dicabut dosen — perbaiki/ubah jawaban forum lalu simpan untuk dinilai ulang (saat ini <b>0/' + FORUM_POIN + '</b>).';
    } else if (h && h.alasan === 'kurang') {
      kelas = 'kurang'; isi = '💬 Poin forum <b>0/' + FORUM_POIN + '</b> — belum memenuhi syarat: ' + escH(_forumRincianTeks(h.rincian)) + '.';
    } else if (_forumKlaimTiada) {
      isi = '💬 Poin forum <b>0/' + FORUM_POIN + '</b> — pemeriksaan poin forum belum tersedia di server; Export tidak ditahan karenanya.';
    } else if (sama && _forumKlaim.galat) {
      kelas = 'kurang'; isi = '⚠ Poin forum belum dapat diperiksa (' + escH(_forumKlaim.galat) + '). Ubah jawaban atau muat ulang halaman untuk mencoba lagi.';
    } else {
      isi = '💬 Poin forum <b>0/' + FORUM_POIN + '</b> — tiap jawaban minimal 30 kata dengan minimal 15 kata berbeda (≥ 40% dari jumlah kata), dan ketiga jawaban tidak boleh sama atau hampir sama. Poin diklaim otomatis setelah jawaban tersimpan.';
    }
  }
  el.className = 'forum-poin-status fp-' + kelas;
  el.style.display = '';
  el.innerHTML = isi;
}
function _forumSegarkan() {
  try { _keaktifanSegarkan(); } catch (e) { console.warn('[Forum] segarkan gagal:', e); }
  _forumPanel();
  // Gerbang Export: hanya menonaktifkan; checkExportReady asli dipanggil lagi hanya bila
  // gerbang ini pernah menahan dan kini terbuka (menghindari _saveDraft sebelum halaman siap).
  if (_forumWajibEkspor()) _forumGerbangEkspor();
  else if (_forumDiblok) { _forumDiblok = false; if (typeof window.checkExportReady === 'function') { try { window.checkExportReady(); } catch (e) {} } }
}
function _forumTeksLokal() {
  const t = {};
  ['fq1', 'fq2', 'fq3'].forEach((id) => { const ta = document.getElementById('ans-' + id); t[id] = ta ? String(ta.value || '') : ''; });
  return t;
}
function _forumTeksNormal(j) {
  const t = {};
  ['fq1', 'fq2', 'fq3'].forEach((id) => { t[id] = (j && typeof j[id] === 'string') ? j[id] : ''; });
  return t;
}
function _forumCukupLokal(t) {
  return ['fq1', 'fq2', 'fq3'].every((id) => String(t[id] || '').trim().split(/\\s+/).filter((w) => w.length > 0).length >= 30);
}
// klaimPoinForum({modulId, nim, pinHash}): server memeriksa forum tersimpan dan menulis node
// "tulis bila belum ada" (akun simulasi: dihitung tanpa ditulis). Tidak dipanggil bila node sudah ada.
// paksa = true (forum baru tersimpan): lewati penahan "kurang untuk teks yang sama".
async function _forumKlaimJalankan(paksa) {
  const me = _forumSaya();
  if (!me || _forumKlaimTiada || !_forumAturanSaya()) return;
  const k = _forumKunci(me);
  if (_forumKlaim.kunci !== k) _forumKlaim = { kunci: k, hasil: null, sibuk: false, ulang: false, galat: '', teks: '' };
  if (_forumInfoSaya().poin > 0) { _forumPanel(); return; }
  if (!window._sessionPinHash) return;
  const st = _forumKlaim;
  if (st.sibuk) { st.ulang = true; st.ulangPaksa = st.ulangPaksa || paksa === true; return; }
  // Hemat panggilan: server baru ditanya bila ketiga jawaban TERSIMPAN (bila belum diketahui: isi
  // halaman) >= 30 kata dan teksnya berubah sejak jawaban "kurang"/"dicabut" terakhir (kriteria
  // lengkap dan sidik pencabutan tetap diputuskan server dari dokumen tersimpan).
  const teks = _forumTeksServer || _forumTeksLokal();
  const kunciTeks = JSON.stringify(_forumTeksNormal(teks));
  const kurangLama = !!(st.hasil && (st.hasil.alasan === 'kurang' || st.hasil.alasan === 'dicabut'));
  if (!_forumCukupLokal(teks)) {
    // Rincian "kurang" milik teks lain sudah basi: tampilkan syarat umum.
    if (kurangLama && st.teks !== kunciTeks) { st.hasil = null; st.teks = ''; }
    _forumPanel(); return;
  }
  if (paksa !== true && kurangLama && st.teks === kunciTeks) { _forumPanel(); return; }
  st.sibuk = true; st.galat = '';
  _forumPanel();
  try {
    if (!_forumKlaimCallable) _forumKlaimCallable = httpsCallable(_functions, 'klaimPoinForum');
    const r = await _forumKlaimCallable({ modulId: window.MODUL_ID, nim: String(me.nim), pinHash: window._sessionPinHash });
    st.hasil = (r && r.data) || {};
    // Penanda teks hanya dicatat sesudah server menjawab "kurang"/"dicabut" untuk teks tersimpan itu.
    st.teks = (st.hasil.alasan === 'kurang' || st.hasil.alasan === 'dicabut') ? kunciTeks : '';
  } catch (e) {
    const kode = String((e && e.code) || '');
    st.galat = (e && e.message) || 'koneksi';
    st.hasil = null; st.teks = '';
    console.warn('[Forum] klaimPoinForum gagal:', kode, st.galat);
    // Callable belum ter-deploy: gerbang Export dibuka (fail-open), klaim tidak dicoba lagi.
    if (/(^|\\/)(not-found|unimplemented)$/.test(kode)) _forumKlaimTiada = true;
  } finally {
    st.sibuk = false;
    _forumSegarkan();
    if (st.ulang && st === _forumKlaim) { const p = st.ulangPaksa === true; st.ulang = false; st.ulangPaksa = false; setTimeout(() => _forumKlaimJalankan(p), 400); }
  }
}
// Progres server diterapkan (PROGRES-MODUL v2): getModulProgress membawa forumAturan/forumPoin/forumPengali.
window.addEventListener('progres-modul:diterapkan', (ev) => {
  const d = ev && ev.detail;
  const me = _forumSaya();
  if (!d || !d.ok || !me) return;
  const p = d.progres || {};
  if (p.forum && typeof p.forum === 'object') _forumTeksServer = _forumTeksNormal(p.forum);
  if (typeof p.forumAturan === 'boolean') {
    _forumServer = { kunci: _forumKunci(me), aturan: p.forumAturan, poin: Number(p.forumPoin) || 0, pengali: (p.forumPengali === null || p.forumPengali === undefined) ? null : Number(p.forumPengali) };
  } else {
    // Backend lama (tanpa field forumAturan): kode ekspor server masih aturan lama.
    _forumBackendLama = true;
  }
  _forumSegarkan();
  _forumKlaimJalankan();
});
// Forum tersimpan di server (event penjaga forum PROGRES-MODUL v2, detail.jawaban = teks
// yang benar-benar tersimpan): klaim ulang dengan teks itu, melewati penahan "kurang".
window.addEventListener('progres-modul:forum-tersimpan', (ev) => {
  const j = ev && ev.detail && ev.detail.jawaban;
  if (j && typeof j === 'object') _forumTeksServer = _forumTeksNormal(j);
  setTimeout(() => _forumKlaimJalankan(true), 300);
});
onValue(ref(db, 'forum/' + FORUM_KURSUS + '/' + MODULE_ID), (snap) => {
  const me = _forumSaya();
  const tadi = me ? forumPoinRekMurni(_forumModul['mhs_' + me.nim]) : 0;
  _forumModul = snap.val() || {};
  // Node milik sendiri dihapus (resetModulAttempts / cabutPoinForum): hasil klaim & getModulProgress
  // di memori tidak lagi berlaku -> poin forum 0, gerbang Export kembali menahan.
  let hilang = false;
  if (me && tadi > 0 && !(forumPoinRekMurni(_forumModul['mhs_' + me.nim]) > 0)) {
    const k = _forumKunci(me);
    if (_forumKlaim.kunci === k) { _forumKlaim.hasil = null; _forumKlaim.teks = ''; }
    if (_forumServer.kunci === k) { _forumServer.poin = 0; _forumServer.pengali = null; }
    hilang = true;
  }
  _forumSegarkan();
  // Node dicabut dosen saat halaman terbuka: tanya server sekali agar alasan 'dicabut' tampil.
  if (hilang) setTimeout(() => _forumKlaimJalankan(true), 300);
}, (err) => console.warn('[Forum] baca gagal:', err && err.message));
// Gerbang Export: checkExportReady/exportTugasHtml (skrip klasik) dibungkus; aturan lama tidak berubah.
(function () {
  const cek = window.checkExportReady;
  if (typeof cek === 'function') window.checkExportReady = function () {
    const r = cek.apply(this, arguments);
    try { _forumGerbangEkspor(); } catch (e) {}
    return r;
  };
  const ekspor = window.exportTugasHtml;
  if (typeof ekspor === 'function') window.exportTugasHtml = function () {
    if (_forumWajibEkspor()) { alert(_forumAlasanEkspor() + '. Export ditahan sampai poin forum tercatat.'); return; }
    return ekspor.apply(this, arguments);
  };
})();
// Jadwal dapat berubah (dosen mengatur ulang) dan pengerjaan lama menentukan aturan: keduanya dibaca
// MENTAH lewat langganan publik yang sama dengan halaman; tampilan disegarkan bila putusan berubah.
let _forumTandaAturan = '';
function _forumAturanBerubah() {
  const t = String(forumAturanAktif()) + '|' + String(forumBukaMsMurni(_forumJadwalMentah)) + '|' + String(_forumPengerjaanLama);
  if (t === _forumTandaAturan) return;
  _forumTandaAturan = t;
  _forumSegarkan();
  _forumKlaimJalankan();
}
onValue(ref(db, SCHEDULE_PATH), (snap) => {
  const v = snap.val();
  _forumJadwalMentah = (v && typeof v === 'object') ? v : null;
  _forumAturanBerubah();
}, (err) => console.warn('[Forum] baca jadwal gagal:', err && err.message));
onValue(ref(db, DB_PATH), (snap) => {
  _forumPengerjaanLama = forumPengerjaanLamaMurni(snap.val(), isSimulasiNim);
  _forumAturanBerubah();
}, (err) => console.warn('[Forum] baca kunjungan gagal:', err && err.message));
// FORUM-POIN:DATA END v4
`;

const RX_CSS = /<style id="forum-poin-style">[\s\S]*?<\/style>\n/;
const RX_PANEL = /\n[ \t]*<div id="forumPoinStatus"[^\n]*<\/div>/g;
const RX_BARIS = /\n[ \t]*<div id="baris-forum"[^\n]*<\/div>/g;
const RX_DATA = /\/\/ FORUM-POIN:DATA BEGIN[\s\S]*?\/\/ FORUM-POIN:DATA END v\d+\n/;
// Toleran versi (v5+; 13 Okt 2026): yang dibutuhkan blok ini adalah tanda tangan
// keaktifanTerapkanMurni (parameter `batas`) dan pipa _keaktifanHitung -> window._forumPipa
// (keduanya diperiksa di proses()), bukan tampilan papan; perubahan tampilan KEAKTIFAN-KELAS
// (mis. DATA v6: pil bonus pertemuan ini) tidak perlu menyentuh skrip ini.
const ANKER_DATA = /\/\/ KEAKTIFAN-KELAS:DATA END v\d+\n/;
const KEAKTIFAN_PIPA = "function _keaktifanHitung() {\n  if (typeof window._forumPipa === 'function') {";

const hitung = (s, sub) => s.split(sub).length - 1;

/** Kunci kursus RTDB dari DB_PATH halaman (Matematika 4 memakai konstanta COURSE_ID). */
function kursusHalaman(html) {
  const m = html.match(/const DB_PATH = `visitors\/([^/`]+)\/\$\{MODULE_ID\}`;/);
  if (!m) throw new Error("DB_PATH tidak ditemukan");
  if (m[1] === "${COURSE_ID}") {
    const c = html.match(/const COURSE_ID\s*=\s*['"]([a-z0-9_]+)['"]/);
    if (!c) throw new Error("COURSE_ID tidak ditemukan");
    return c[1];
  }
  if (!/^[a-z0-9_]+$/.test(m[1])) throw new Error(`kursus DB_PATH tidak wajar: ${m[1]}`);
  return m[1];
}

/** Isi <script> yang memuat indeks i (untuk memastikan blok DATA satu skrip dengan dependensinya). */
function skripPemuat(html, i) {
  const a = html.lastIndexOf("<script", i);
  const z = html.indexOf("</script>", i);
  if (a < 0 || z < 0 || html.lastIndexOf("</script>", i) > a) throw new Error("blok DATA tidak berada di dalam <script>");
  return html.slice(a, z);
}

function proses(rel) {
  const f = path.join(root, rel);
  let html = fs.readFileSync(f, "utf8");
  const awal = html;
  if (html.includes("\r")) throw new Error("berkas memuat CR");
  const kursus = kursusHalaman(html);

  // 1. CSS di <head>
  if (RX_CSS.test(html)) html = html.replace(RX_CSS, () => CSS);
  else { const i = html.indexOf("</head>"); if (i < 0) throw new Error("</head> tidak ada"); html = html.slice(0, i) + CSS + html.slice(i); }

  // 2. Panel tab Forum: sesudah #forum-blocked-msg
  html = html.replace(RX_PANEL, "");
  {
    const m = [...html.matchAll(/\n([ \t]*)<div id="forum-blocked-msg"[^\n]*<\/div>/g)];
    if (m.length !== 1) throw new Error(`#forum-blocked-msg muncul ${m.length}x, harusnya 1`);
    const j = m[0].index + m[0][0].length;
    html = html.slice(0, j) + PANEL(m[0][1]) + html.slice(j);
  }

  // 3. Bilah skor: baris "Forum diskusi" sesudah #baris-keaktifan
  html = html.replace(RX_BARIS, "");
  {
    const m = [...html.matchAll(/\n([ \t]*)<div id="baris-keaktifan">[^\n]*<\/div>/g)];
    if (m.length !== 1) throw new Error(`#baris-keaktifan muncul ${m.length}x, harusnya 1 (jalankan keaktifan-kelas.mjs dulu)`);
    const j = m[0].index + m[0][0].length;
    html = html.slice(0, j) + BARIS(m[0][1], kursus) + html.slice(j);
  }

  // 4. updateScore: total lewat window._forumSkorSaya (rumus lama dipertahankan apa adanya)
  html = html.replace(RX_SKOR_BLOK, (_, ind, asli) => `\n${ind}const total = ${asli};\n`);
  {
    const m = [...html.matchAll(RX_TOTAL)];
    if (m.length !== 1) throw new Error(`baris total keaktifan di updateScore muncul ${m.length}x, harusnya 1`);
    const [utuh, ind, asli, mentah] = m[0];
    const pembuka = html.lastIndexOf("function updateScore(", m[0].index);
    if (pembuka < 0 || m[0].index - pembuka > 1500) throw new Error("baris total tidak berada di updateScore");
    html = html.slice(0, m[0].index) + SKOR(ind, mentah, asli) + html.slice(m[0].index + utuh.length);
  }

  // 5. Ringkasan Export HTML
  html = html.split(EKSPOR_MINI).join("").split(EKSPOR_TEKS).join("");
  if (hitung(html, EKSPOR_AKTIF) === 1) html = html.replace(EKSPOR_AKTIF, () => EKSPOR_AKTIF + EKSPOR_MINI);
  else {
    const m = html.match(RX_EKSPOR_TEKS);
    if (!m || m.length !== 1) throw new Error("ringkasan Export HTML (keaktifan / score-detail Poin:) tidak ditemukan tepat sekali");
    html = html.replace(RX_EKSPOR_TEKS, (_, a, b) => a + EKSPOR_TEKS + b);
  }

  // 6. Blok DATA sesudah KEAKTIFAN-KELAS:DATA v5+ (skrip modul yang sama; jangkar toleran versi)
  html = html.replace(RX_DATA, "");
  {
    const m = html.match(ANKER_DATA);
    if (!m || (html.match(new RegExp(ANKER_DATA.source, "g")) || []).length !== 1) throw new Error("KEAKTIFAN-KELAS:DATA END tidak ditemukan tepat sekali (jalankan keaktifan-kelas.mjs dulu)");
    if (!html.includes("function keaktifanTerapkanMurni(list, modul, roster, total, isSim, batas) {")) throw new Error("keaktifanTerapkanMurni belum v5+ (parameter batas)");
    if (hitung(html, KEAKTIFAN_PIPA) !== 1) throw new Error("_keaktifanHitung belum memakai window._forumPipa (KEAKTIFAN-KELAS:DATA v5+)");
    const j = html.indexOf(m[0]) + m[0].length;
    html = html.slice(0, j) + DATA(kursus) + html.slice(j);
    const skrip = skripPemuat(html, j);
    for (const dep of ["const SCHEDULE_PATH = ", "const DB_PATH = ", "const isSimulasiNim = ", "const _functions = getFunctions(", "httpsCallable", "const MODULE_ID = ", "function escH(", "onValue"]) {
      if (!skrip.includes(dep)) throw new Error(`skrip modul tempat blok DATA tidak memuat ${dep}`);
    }
  }

  // penjaga
  for (const [tanda, n] of [["FORUM-POIN:CSS v1", 1], ['data-forum-poin="panel v1"', 1], ['data-forum-poin="baris v1"', 1], ["FORUM-POIN:SKOR v1", 1], ["FORUM-POIN:DATA BEGIN v4", 1], ["FORUM-POIN:DATA END v4", 1], ["window._forumRingkasEkspor(", 1], ['id="forumPoinStatus"', 1], ['id="baris-forum"', 1], ['id="scoreForum"', 1]]) {
    if (hitung(html, tanda) !== n) throw new Error(`penanda ${tanda} muncul ${hitung(html, tanda)}x, harusnya ${n}`);
  }
  if (hitung(html, `const FORUM_KURSUS = '${kursus}';`) !== 1) throw new Error("FORUM_KURSUS tidak sama dengan DB_PATH");
  if (hitung(html, `const FORUM_POIN_MULAI = '${mulaiKursus(kursus)}';`) !== 1) throw new Error("FORUM_POIN_MULAI tidak sesuai kursus");
  return html === awal ? null : html;
}

// Semua halaman <Kursus>/Modul/Modul-N.html (salinan konflik OneDrive *-DEDIK-PC tidak cocok pola).
const HALAMAN = [];
for (const k of fs.readdirSync(root, { withFileTypes: true })) {
  if (!k.isDirectory()) continue;
  const dir = path.join(root, k.name, "Modul");
  if (!fs.existsSync(dir)) continue;
  for (const nama of fs.readdirSync(dir)) if (/^Modul-\d+\.html$/.test(nama)) HALAMAN.push(`${k.name}/Modul/${nama}`);
}
if (HALAMAN.length !== 84) throw new Error(`harap 84 halaman modul, ditemukan ${HALAMAN.length}`);

let n = 0;
for (const rel of HALAMAN.sort()) {
  let h;
  try { h = proses(rel); } catch (e) { throw new Error(`${rel}: ${e.message}`); }
  if (h === null) continue;
  n += 1;
  if (!periksa) fs.writeFileSync(path.join(root, rel), h);
}
console.log(`${n} dari ${HALAMAN.length} halaman ${periksa ? "akan diperbarui" : "diperbarui"} (FORUM-POIN DATA v4)`);
