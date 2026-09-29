import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { uraiSkripInline, deklarasiLeksikal, pemakaian, fungsiTingkatAtas, panggilanTingkatAtas, namaGlobal, presenceSaatMuat, presenceAutoLogin } from "./pemindai-deklarasi.mjs";

const root = process.cwd();
const courseRoots = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas", "Teknik-Tenaga-Listrik", "Pemodelan-Computer-Aided-Design"];
const forbiddenBackendArtifacts = [
  "functions",
  ".firebaserc",
  "firebase.json",
  "database.rules.json",
  "firestore.rules",
  "firestore.indexes.json",
  path.join(".github", "workflows", "firebase-deploy-pilot.yml"),
];
for (const artifact of forbiddenBackendArtifacts) {
  const full = path.join(root, artifact);
  const containsFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
    .some((entry) => entry.isFile() || (entry.isDirectory() && containsFiles(path.join(dir, entry.name))));
  const present = fs.existsSync(full)
    && (!fs.statSync(full).isDirectory() || containsFiles(full));
  if (present) {
    throw new Error(`Backend artifact must stay in the private repository: ${artifact}`);
  }
}
// Naskah ujian resmi (format BOP) berkepala "SOAL INI BERSIFAT RAHASIA — HARUS
// DIKEMBALIKAN" dan memuat soal lengkap. Berkas itu pernah tersimpan di sini,
// di <Mata-Kuliah>/Exam/ dan Unduhan-Gabungan/Exam-Gabungan-*.pdf, sehingga
// dapat diunduh siapa pun tanpa autentikasi. Tempatnya sekarang di repo
// backend yang privat. Unduhan gabungan modul dan RPS tetap boleh publik —
// yang dilarang hanya naskah ujiannya.
for (const course of courseRoots) {
  const examDir = path.join(root, course, "Exam");
  if (!fs.existsSync(examDir)) continue;
  for (const name of fs.readdirSync(examDir)) {
    if (/\.(pdf|docx?)$/i.test(name)) {
      throw new Error(`${course}/Exam/${name}: naskah ujian harus tetap di repositori privat`);
    }
  }
}
const unduhan = path.join(root, "Unduhan-Gabungan");
if (fs.existsSync(unduhan)) {
  for (const name of fs.readdirSync(unduhan)) {
    if (/^Exam-Gabungan-/i.test(name)) {
      throw new Error(`Unduhan-Gabungan/${name}: naskah ujian harus tetap di repositori privat`);
    }
  }
}

const htmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "Slides" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full);
    else if (entry.name.endsWith(".html") || entry.name.endsWith(".htm")) htmlFiles.push(full);
  }
}
// Mata kuliah yang sejauh ini baru punya halaman Silabus/OBE (belum ada Modul
// dan Exam). Halamannya tetap dipindai sintaks dan autentikasinya, tetapi tidak
// dimasukkan ke courseRoots karena pemeriksaan di bawah mewajibkan Exam/UTS.html
// dan Exam/UAS.html. Pindahkan ke courseRoots begitu modul dan ujiannya ada.
// Pemodelan CAD pindah ke courseRoots pada 20 September 2026 setelah Modul 1-14
// dan UTS/UAS-nya terbit; daftar ini sengaja dibiarkan ada untuk course berikutnya.
const obeOnlyRoots = [];
for (const course of [...courseRoots, ...obeOnlyRoots]) {
  collectHtml(path.join(root, course));
}
for (const name of fs.readdirSync(path.join(root, "Admin"))) {
  if (name.endsWith(".html")) htmlFiles.push(path.join(root, "Admin", name));
}

// Berkas yang di-gitignore tidak pernah ikut ter-deploy: _site disusun dari isi
// repositori, bukan dari isi folder kerja. Yang muncul di sini adalah salinan
// konflik OneDrive ("<nama>-<NAMA-PC>.html") — snapshot lama yang isinya sudah
// basi. Memindainya hanya membuat pemeriksaan gagal di mesin lokal sementara CI
// tetap hijau, jadi berkas seperti itu dilewati. Tetap dilaporkan supaya tidak
// menumpuk diam-diam.
function pisahkanTerabaikan(files) {
  if (!files.length) return { dipakai: files, diabaikan: [] };
  // git check-ignore menolak path absolut bergaya Windows ("fatal: Invalid
  // path '/c'"), jadi kirim path relatif repo dengan pemisah garis miring.
  const relatif = files.map((f) => path.relative(root, f).split(path.sep).join("/"));
  const hasil = spawnSync("git", ["check-ignore", "--stdin"], {
    cwd: root, input: relatif.join("\n"), encoding: "utf8",
  });
  // status 0 = ada yang terabaikan, 1 = tidak ada. Selain itu git tidak dapat
  // menjawab (bukan repo, git tak terpasang) — jangan sampai itu melemahkan
  // pemeriksaan, jadi seluruh berkas tetap dipindai.
  // Salinan, bukan array yang sama: pemanggil mengosongkan htmlFiles sebelum
  // mengisinya lagi dari `dipakai` (dulu di luar repo git tidak ada yang dipindai).
  if (hasil.status !== 0 && hasil.status !== 1) return { dipakai: files.slice(), diabaikan: [] };
  const terabaikan = new Set((hasil.stdout || "").split("\n")
    .map((baris) => baris.trim()).filter(Boolean)
    .map((baris) => path.resolve(root, baris)));
  return {
    dipakai: files.filter((f) => !terabaikan.has(path.resolve(f))),
    diabaikan: files.filter((f) => terabaikan.has(path.resolve(f))),
  };
}
const { dipakai, diabaikan } = pisahkanTerabaikan(htmlFiles);
if (diabaikan.length) {
  console.warn(`Peringatan: ${diabaikan.length} berkas HTML dilewati karena di-gitignore dan tidak pernah ter-deploy:`);
  for (const f of diabaikan) console.warn(`  ${path.relative(root, f)}`);
}
htmlFiles.length = 0;
htmlFiles.push(...dipakai);

// Angka penalti terlambat dari rollout lama (0,7/30% dan 0,8/20%). Server
// memakai 0,65 (potongan 35%) untuk semua course (Pedoman §5.1–§5.2); halaman
// Math4/Getaran/Opto dan Pengantar-nya masih menyebut angka lama sampai
// 27 September 2026 (scripts/penalti-35.mjs, pola yang sama).
const RX_PENALTI_LAMA = [
  /(?:dikurangi|dipotong|potongan|dipangkas)\s*(?:<[^>]{0,120}>\s*)?(?:20|30)\s*%/i,
  /\bmultiplier\s+0\.[78]\b/i,
  /_isPastDeadline\(\)\s*\?\s*0\.[78]\b/,
  /×\s?0[.,]7\b/,
  /\bdikali\s+0[.,][78]\b/i,
];

// Kanvas 2D tidak mengenal properti khusus CSS: warna 'var(--amber)' tidak
// terurai. addColorStop melempar DOMException bernama "SyntaxError" (Getaran
// Modul-10, drawMuRatio, sampai 28 September 2026: animasi hanya menggambar
// kisi kosong), sedangkan fillStyle/strokeStyle/shadowColor diam-diam memakai
// warna sebelumnya (Getaran Modul-13/14). `node --check` di bawah hanya
// memeriksa sintaks JavaScript, dan galat ini baru terjadi saat skrip berjalan
// di peramban, jadi pola teksnya ditolak di sini. Pakai warna hex yang sama
// dengan variabel CSS-nya (atau baca lewat getComputedStyle).
const RX_WARNA_KANVAS_VAR = /(?:\.addColorStop\(\s*[^,()]+,\s*|\b(?:fillStyle|strokeStyle|shadowColor)\s*=\s*)(['"`])\s*var\(--/;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mec-security-"));
let authPages = 0;
let checkedScripts = 0;
try {
  for (const file of htmlFiles) {
    const relative = path.relative(root, file);
    const source = fs.readFileSync(file, "utf8");
    if (/57ae60d1|ADMIN_PW_HASH|adminPwHash/.test(source)) throw new Error(`${relative}: legacy admin hash remains`);
    for (const rx of RX_PENALTI_LAMA) {
      const lama = source.match(rx);
      if (lama) throw new Error(`${relative}: late-penalty text from the old rollout ("${lama[0]}"); the server multiplier is 0.65 (35%) — run node scripts/penalti-35.mjs`);
    }
    {
      const warna = RX_WARNA_KANVAS_VAR.exec(source);
      if (warna) {
        const baris = source.slice(0, warna.index).split("\n").length;
        throw new Error(`${relative}:${baris}: canvas colour uses a CSS variable (${source.slice(warna.index, warna.index + 60).split("\n")[0]}…); canvas cannot resolve var(--…) — addColorStop throws, fillStyle/strokeStyle keep the previous colour`);
      }
    }
    if (source.includes("createAdminSession")) authPages += 1;

    const scripts = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
    for (let i = 0; i < scripts.length; i += 1) {
      const attrs = scripts[i][1];
      const body = scripts[i][2];
      if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
      const module = /type\s*=\s*["']module["']/i.test(attrs);
      const tempFile = path.join(tmp, `${checkedScripts}.${module ? "mjs" : "js"}`);
      fs.writeFileSync(tempFile, body, "utf8");
      const check = spawnSync(process.execPath, ["--check", tempFile], { encoding: "utf8" });
      if (check.status !== 0) throw new Error(`${relative} inline script ${i + 1}:\n${check.stderr}`);
      checkedScripts += 1;
    }
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (authPages !== 108) throw new Error(`Expected 108 admin-auth pages (96 Modul/Exam + 6 OBE + 6 Admin), got ${authPages}`);
for (const course of courseRoots) {
  const uas = fs.readFileSync(path.join(root, course, "Exam", "UAS.html"), "utf8");
  if (/const UAS_(TF|MC|COMP_EZ|COMP_HARD)\s*=\s*\[/.test(uas)) throw new Error(`${course}: static UAS bank returned to HTML`);
  for (const required of ["firebase-auth.js", "browserSessionPersistence", "signOut(_auth)", "getExamQuestions"]) {
    if (!uas.includes(required)) throw new Error(`${course}: UAS missing ${required}`);
  }
  for (const required of ["function onCopy", "function onVisibility", "function onPrintScreen", "patchScreenCapture", "frictionWatermark"]) {
    if (!uas.includes(required)) throw new Error(`${course}: UAS anti-copy/capture control missing ${required}`);
  }
  if (/document\.body\.style\.(?:filter|opacity)|classList\.(?:add|toggle)\(['"](?:blur|blurred)/.test(uas)) {
    throw new Error(`${course}: tab switch must not blur or hide the exam page`);
  }

  if (course === "Getaran-Mekanik") {
    for (const required of [
      "Number.isInteger(window._uasServerN)",
      "window._uasServerN = Number.isInteger(d.N) ? d.N : null",
      "window.getIdentity = getIdentity",
    ]) {
      if (!uas.includes(required)) throw new Error(`${course}: UAS NIM parameter binding missing ${required}`);
    }
  }

  for (const examName of ["UTS.html", "UAS.html"]) {
    const exam = fs.readFileSync(path.join(root, course, "Exam", examName), "utf8");
    const relative = `${course}/Exam/${examName}`;
    for (const required of [
      "Batas Akhir (WIB / UTC+7)",
      "timeZone: 'Asia/Jakarta'",
      "function _wibStringToDate(s)",
      "Date.UTC(+m[1], +m[2]-1, +m[3], +m[4]-7, +m[5])",
      "const dueDate=_wibStringToDate(due)",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: WIB lock missing ${required}`);
    }
    if (/const dueDate\s*=\s*new Date\(due\)/.test(exam)) {
      throw new Error(`${relative}: schedule input depends on browser timezone`);
    }
    // Lapisan friksi membaca identitas halaman INI (LOCAL_IDENTITY =
    // `<slug>_identity_${MODULE_ID}`). Empat UAS sempat membaca kunci UTS:
    // mahasiswa yang login di UAS lolos dari blokir salin/watermark/penghitung
    // tab, sementara identitas UTS yang tertinggal di komputer lab dipakai
    // sebagai watermark. Diperbaiki scripts/ubah-friction.mjs (butir 5).
    {
      const slug = /\nconst LOCAL_IDENTITY = `([a-z0-9_]+)_identity_\$\{MODULE_ID\}`;\n/.exec(exam);
      const modul = /\nconst MODULE_ID = '(uts|uas)';\n/.exec(exam);
      const lk = [...exam.matchAll(/\n {2}const LK = '([^']+)';\n/g)];
      if (!slug || !modul || lk.length !== 1) {
        throw new Error(`${relative}: LOCAL_IDENTITY, MODULE_ID, or the friction identity key (LK) not found exactly once`);
      }
      if (modul[1] !== examName.slice(0, 3).toLowerCase()) {
        throw new Error(`${relative}: MODULE_ID '${modul[1]}' does not match the page`);
      }
      const expected = `${slug[1]}_identity_${modul[1]}`;
      if (lk[0][1] !== expected) {
        throw new Error(`${relative}: friction layer reads identity key '${lk[0][1]}', expected '${expected}' (this page's LOCAL_IDENTITY)`);
      }
    }
    for (const required of [
      "Masuk &amp; Lihat Soal",
      "window._dosenQuestionView = false",
      "window._activateDosenQuestionView = _activateDosenQuestionView",
      "window.switchTab('uts')",
      "setTimeout(() => window._activateDosenQuestionView(), 50)",
      "setTimeout(() => window._activateDosenQuestionView(), 100)",
      "DOSEN · SOAL HANYA-BACA",
      "const isDosenView = !!(me && me.role === 'dosen')",
      "Mode Dosen: soal hanya-baca; jawaban dan poin tidak dicatat.",
      "Mode Dosen: Export HTML mahasiswa dinonaktifkan.",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: lecturer question view missing ${required}`);
    }
    // Tinjauan soal dosen memuat soal lewat loader (getExamQuestions), di UTS
    // maupun UAS. Dulu UTS cukup memuat teks `window.renderUTSQuestions()`,
    // yang juga ada di dalam loader, sehingga tuntutan ini tidak menjaga apa pun.
    const lecturerLoader = `await window._ensure${examName.slice(0, 3)}QuestionsLoaded()`;
    if (!exam.includes(lecturerLoader)) {
      throw new Error(`${relative}: lecturer question loader missing ${lecturerLoader}`);
    }
    if (examName === "UAS.html" && !exam.includes("await _auth.authStateReady()")) {
      throw new Error(`${relative}: lecturer UAS view does not wait for restored admin auth`);
    }
    // Flag "soal sudah dirender" (window._utsRenderedFlag/_uasRenderedFlag) hanya
    // sesudah render sukses (29 September 2026, scripts/muat-soal-uts.mjs,
    // Pedoman §7.9). UTS Math4/Opto dulu merender langsung lalu memasang flag di
    // jaring aman init dan di auto-login _handleScheduleReady, sebelum soal
    // diambil: renderer return dini (window.UTS_TF belum ada) tetapi flag
    // terpasang, sehingga _ensureUTSQuestionsLoaded — juga dari saveIdentity dan
    // _setSessionPinHash — tidak pernah memanggil getExamQuestions untuk
    // mahasiswa yang kembali. Aturannya ada di periksaFlagRender (di bawah).
    periksaFlagRender(exam, examName.slice(0, 3), relative);
    if (examName === "UAS.html") {
      for (const required of [
        ">Atur Jadwal UAS</h2>",
        "function _todayAtWibString(hour, minute)",
        "function _hasEditableUasSchedule(schedule)",
        "if(_hasEditableUasSchedule(currentSchedule))",
        "function _adminAuthErrorText()",
        "errEl.textContent = _adminAuthErrorText()",
        "Terlalu banyak percobaan, coba lagi dalam",
        "scheduleDuration').value='180'",
        "scheduleDue').value=_todayAtWibString(19, 30)",
        "scheduleExtension').value='120'",
      ]) {
        if (!exam.includes(required)) throw new Error(`${relative}: UAS default schedule missing ${required}`);
      }
    }
  }
}

const resetQuestionPage = fs.readFileSync(path.join(root, "Admin", "reset-soal.html"), "utf8");
for (const required of [
  "Exam (UTS/UAS)",
  "resetExamQuestion",
  "examId: targetId",
  "currentQIds()",
  "courseEl.value === 'optoauto' && modulEl.value === 'uts'",
  "id=\"allQuestions\"",
  "function setAllQuestions(checked)",
  "allQuestionsEl.indeterminate",
  "SEMUA ${qIds.length} SOAL",
]) {
  if (!resetQuestionPage.includes(required)) throw new Error(`Admin/reset-soal.html missing exam reset control: ${required}`);
}

// periksaPenjagaForum: sub-blok acuan (halaman pertama), jumlah halaman, dan
// hasil sandbox per isi runtime (84 halaman berbagi runtime yang sama).
const penjagaForum = { acuan: null, acuanDari: null, halaman: 0, sandbox: new Map() };
const PF_AWAL = "<!-- PROGRES-MODUL: awal -->";
const PF_AKHIR = "<!-- PROGRES-MODUL: akhir -->";
const RX_PF_SUB = /\n {2}\/\/ PROGRES-MODUL:PENJAGA-FORUM BEGIN (v\d+)[^\n]*\n[\s\S]*?\n {2}\/\/ PROGRES-MODUL:PENJAGA-FORUM END \1\n/g;
let kunciIdentitasModul = 0;
// Blok PILIHAN-POLL-FORUM (periksaPilihanPoll): pola dan isi unik untuk sandbox.
const RX_BLOK_POLL = /<!-- PILIHAN-POLL-FORUM:BEGIN v\d+[^>]*-->[\s\S]*?<!-- PILIHAN-POLL-FORUM:END v\d+ -->/g;
const blokPollUnik = new Map();
for (const course of courseRoots) {
  for (let modulNo = 1; modulNo <= 14; modulNo += 1) {
    const relative = `${course}/Modul/Modul-${modulNo}.html`;
    const modul = fs.readFileSync(path.join(root, relative), "utf8");
    for (const required of [
      "window._hidePreviewAssessmentTabs = function()",
      "['tab-tugas', 'tab-forum', 'page-tugas', 'page-forum']",
      "el.style.setProperty('display', 'none', 'important')",
      "if (window._previewMode && (tab === 'tugas' || tab === 'forum')) tab = 'modul'",
      "window._hidePreviewAssessmentTabs()",
      "soal dan diskusi hanya tersedia setelah login",
      ">🚪 Log Out</button>",
    ]) {
      if (!modul.includes(required)) throw new Error(`${relative}: module contract missing ${required}`);
    }
    if (modul.includes(">🔄 Ganti Peran</button>")) {
      throw new Error(`${relative}: legacy Ganti Peran label must be Log Out`);
    }
    // Poin partial dipulihkan dari server (RTDB scoreDeltas), bukan dipatok
    // di client. Fallback terikat sejarah course: 1 untuk tiga course lama,
    // 0,5 untuk Sistem Kendali Cerdas.
    for (const required of [
      "const restoredDelta = (qId, fallback) =>",
      "data.scoreDeltas && data.scoreDeltas[qId]",
    ]) {
      if (!modul.includes(required)) {
        throw new Error(`${relative}: official per-question score restoration missing ${required}`);
      }
    }
    if (!/compScores\[baseId\]\s*=\s*restoredDelta\(baseId, (?:0\.5|1)\);/.test(modul)) {
      throw new Error(`${relative}: fallback partial credit harus 0.5 atau 1`);
    }
    // Statistik "Absen" tab Hasil tepat sejak roster dimuat
    // (scripts/leaderboard-modul-sekali.mjs, 26 September 2026): fetchMasterStudents
    // dulu memanggil updateLeaderboard kedua kali dengan variabel jadwal-berakhir
    // yang tidak pernah didefinisikan (selalu false), menimpa statistik benar
    // dari renderVisitors. updateLeaderboard kini hanya dipanggil dari
    // renderVisitors, di tingkat teratas badannya.
    if (modul.includes("_scheduleExpired")) throw new Error(`${relative}: undefined _scheduleExpired is used again (module Absen stats go stale after the roster loads)`);
    if ((modul.match(/updateLeaderboard\(/g) || []).length !== 2) {
      throw new Error(`${relative}: updateLeaderboard must only be defined once and called once (from renderVisitors); run node scripts/leaderboard-modul-sekali.mjs`);
    }
    if (!ambilFungsi(modul, "function renderVisitors(visitors){", relative).includes("\n  updateLeaderboard(visitors, schedExpired);\n")) {
      throw new Error(`${relative}: renderVisitors must call updateLeaderboard(visitors, schedExpired) at the top level of its body`);
    }
    {
      const fm = ambilFungsi(modul, "function fetchMasterStudents(", relative);
      if (!fm.includes("        renderVisitors(latestVisitors || []);\n      }\n      // LEADERBOARD-MODUL-SEKALI BEGIN")) {
        throw new Error(`${relative}: fetchMasterStudents must re-render through renderVisitors right before the LEADERBOARD-MODUL-SEKALI block`);
      }
    }
    // Pilihan PG dipulihkan setelah muat ulang (v3: hanya dari getJawabanSaya
    // lewat blok JAWABAN-PRIVAT:GABUNG, tanpa field RTDB publik), dan Export HTML
    // tidak melaporkan jawaban BENAR sebagai "pilihan salah"
    // (scripts/pulihkan-pilihan-pg.mjs, 28–29 September 2026).
    periksaPilihanPg(modul, relative);
    // Forum tidak pernah dikirim sebelum progres server diterapkan
    // (scripts/tambah-progres-modul.mjs, PROGRES-MODUL:PENJAGA-FORUM, 29 September 2026).
    await periksaPenjagaForum(modul, relative);
    // Kunci identitas skrip klasik (getIdentityLocal, _draftKey, LK friksi) =
    // LOCAL_IDENTITY halaman (scripts/samakan-kunci-identitas.mjs, 29 September 2026).
    periksaKunciIdentitasModul(modul, relative, course, modulNo);
    kunciIdentitasModul += 1;
    // Pilihan quick check Forum tersimpan (hanya lewat saveModulPoll) dan
    // dipulihkan (scripts/simpan-pilihan-poll.mjs v2).
    periksaPilihanPoll(modul, relative);
  }
}
if (penjagaForum.halaman !== 84) throw new Error(`Expected 84 modul pages with PROGRES-MODUL:PENJAGA-FORUM, found ${penjagaForum.halaman}`);
await ujiMutasiPenjagaForum();
if (kunciIdentitasModul !== 84) throw new Error(`Expected 84 module pages with a checked classic identity key, found ${kunciIdentitasModul}`);
ujiMutasiKunciIdentitas();

for (const course of courseRoots) {
  for (const examName of ["UTS.html", "UAS.html"]) {
    const relative = `${course}/Exam/${examName}`;
    const exam = fs.readFileSync(path.join(root, relative), "utf8");
    for (const required of [
      "onDisconnect",
      "const PRESENCE_PATH = `presence/",
      "const HEARTBEAT_MS = 20000",
      "const ONLINE_THRESHOLD_MS = 45000",
      "onlinePresence = snap.val() || {}",
      "const onlineVisited = visited.filter",
      "onlineVisited.length+' online'",
      "Belum ada mahasiswa online.",
      "window.addEventListener('beforeunload', _cleanupPresence)",
      "<h3>👥 Mahasiswa Online</h3>",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: online-only exam panel missing ${required}`);
    }
    if (exam.includes("vpBadge').textContent=visited.length+' orang'")) {
      throw new Error(`${relative}: exam panel still counts historical visitors`);
    }

    for (const required of [
      "function formatPoints(pts)",
      "Math.round((value + Number.EPSILON) * 100) / 100",
      "window.formatPoints = formatPoints",
      "set('scoreDetail',   formatPoints(total) + ' / 100 poin')",
      "formatPoints(res.scoreDelta)",
      "formatPoints(exportPoints)",
      "formatPoints(d.pts)",
      "formatPoints(pts)",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: point display formatter missing ${required}`);
    }
    // UTS/UAS Pemodelan CAD tidak memakai soal benar-salah sama sekali (20 PG +
    // tugas unggah model), jadi mesin skor TF memang tidak ada di halamannya.
    // Syarat TF hanya ditagih pada ujian yang benar-benar punya bagian itu.
    const punyaTF = exam.includes("SCORE_CONFIG.TF_POINT");
    for (const required of [
      "const restoredDelta = (qId, fallback) =>",
      "data.scoreDeltas && data.scoreDeltas[qId]",
      ...(punyaTF ? ["tfScores[qId] = restoredDelta(qId, getQPoints(qId, SCORE_CONFIG.TF_POINT))"] : []),
      "mcScores[qId] = restoredDelta(qId, getQPoints(qId, SCORE_CONFIG.MC_POINT))",
      "const partialPts = restoredDelta(baseId, ",
      "compScores[baseId]   = partialPts",
      "const officialDeltas = _r.data.scoreDeltas",
      "_cachedFirebaseData.scoreDeltas = officialDeltas",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: official per-question score restoration missing ${required}`);
    }
    // Fallback partial credit terikat sejarah tiap course: 1 untuk tiga course
    // lama, 0,5 untuk Sistem Kendali Cerdas. Nilai lain = salah tampil.
    if (!/const partialPts = restoredDelta\(baseId, (?:0\.5|1)\);/.test(exam)) {
      throw new Error(`${relative}: fallback partial credit harus 0.5 atau 1`);
    }
    for (const forbidden of [
      /\+ res\.scoreDelta \+/,
      /\+ compScores\[qId\] \+/,
      /Poin \(server\): <strong>\$\{exportPoints\}/,
      /\$\{d\.pts\}<\/span>/,
      /Math\.round\(d\.pts\s*\*\s*100\)/,
      /Math\.round\(total\s*\*\s*100\)/,
    ]) {
      if (forbidden.test(exam)) throw new Error(`${relative}: raw point display remains: ${forbidden}`);
    }
  }
}

// Asisten Dosen untuk mahasiswa di UTS/UAS (scripts/buka-asisten-ujian.mjs,
// 26 September 2026). #visitorFab tetap satu-satunya tombol chat: bagi
// mahasiswa yang login ia membuka Asisten Dosen, sedangkan daftar mahasiswa
// online (nama, NIM, waktu akses, lencana "Terlambat") beserta jumlahnya tetap
// khusus dosen ("UTS/UAS PRIVACY"). RTDB visitors/presence dapat dibaca publik,
// jadi privasi ini murni tanggung jawab UI dan dijaga di sini. Chat Kelas tidak
// boleh ada di halaman ujian: RTDB chat/* menerima tulisan tanpa autentikasi,
// sehingga hanya ketiadaan UI-nya yang mencegah chat antarmahasiswa saat ujian.
// Blok AI (AI-CHAT-AGENT) dikecualikan dari pemeriksaan chat karena memuat
// logika varian modulnya sendiri; blok itu diperiksa di repo backend.
const RX_BLOK_AI = /<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/;
let examAsisten = 0;
for (const course of courseRoots) {
  for (const examName of ["UTS.html", "UAS.html"]) {
    const relative = `${course}/Exam/${examName}`;
    const exam = fs.readFileSync(path.join(root, relative), "utf8");
    for (const required of [
      "<!-- ASISTEN-UJIAN-MAHASISWA:CSS BEGIN",
      "// ═══ ASISTEN-UJIAN-MAHASISWA:JS BEGIN",
      "  // ASISTEN-UJIAN-MAHASISWA:PERAN BEGIN",
      "    // ASISTEN-UJIAN-MAHASISWA:RENDER BEGIN",
      "function _terapkanAsistenUjian(isStudent)",
      "function _kosongkanRosterUjian()",
      "document.body.classList.toggle('ujian-mahasiswa', mhs)",
      "fab.setAttribute('aria-label', 'Asisten Dosen')",
      "if (agen && typeof agen.terapkanPeran === 'function') agen.terapkanPeran();",
      "if (list && list.innerHTML) list.innerHTML = '';",
      "for (const id of ['vpBadge', 'fabCount'])",
      "  _terapkanAsistenUjian(isStudent);\n  const visitorFab = document.getElementById('visitorFab');\n  if (visitorFab) {\n    if (isStudent) {\n      visitorFab.style.display = 'flex';\n      visitorFab.style.visibility = 'visible';\n",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: student Asisten launcher missing ${required.split("\n")[0]}`);
    }
    // Formulir login tidak menyimpan PIN setelah login berhasil, dan NIM ikut
    // dibuang saat logout paksa tanpa jadwal (komputer lab dipakai bergantian).
    for (const required of [
      "function _bersihkanFormLoginUjian(adaIdentitas)",
      "for (const id of ['vPin', 'pinSetupInput1', 'pinSetupInput2', 'pinInputField'])",
      "tombol.getAttribute('aria-busy') === 'true' && typeof window.selesaiMuat === 'function') window.selesaiMuat(tombol);",
      "const nim = document.getElementById('vNim');\n    if (nim && nim.value) nim.value = '';",
      "  _bersihkanFormLoginUjian(isStudent || isDosen);\n  _terapkanAsistenUjian(isStudent);\n",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: login form hygiene missing ${required.split("\n")[0]}`);
    }
    for (const required of [
      "body.ujian-mahasiswa #visitorPanel .vp-mode-tabs,",
      "body.ujian-mahasiswa #vpModeKelas,",
      "body.ujian-mahasiswa #vpList,",
      "body.ujian-mahasiswa #vpBadge,",
      "body.ujian-mahasiswa #fabCount{display:none !important}",
      "body.ujian-mahasiswa #backToTop{right:144px}",
      // Panel tertutup keluar dari urutan Tab (chip tak terlihat tidak bisa dikirim).
      "body.ujian-mahasiswa #visitorPanel:not(.open){visibility:hidden;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .25s,visibility 0s linear .3s}",
      // Ponsel: halaman tidak lebih lebar dari layar, tombol tetap di kanan tetap terlihat.
      "@media(max-width:600px){.comp-header{flex-wrap:wrap}.comp-pts{flex-shrink:1}}",
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: student roster-hiding CSS missing ${required}`);
    }
    if (exam.indexOf("<!-- ASISTEN-UJIAN-MAHASISWA:CSS BEGIN") > exam.indexOf("</head>")) {
      throw new Error(`${relative}: student roster-hiding CSS must sit in the document <head>`);
    }
    if (exam.includes("visitorFab.style.display = 'none';\n      visitorFab.style.visibility = 'hidden';")) {
      throw new Error(`${relative}: _applyRoleVisibility still hides the only chat button from students`);
    }

    // renderVisitors: cabang mahasiswa hanya membuang sisa roster lalu return;
    // #fabCount/#vpBadge/#vpList hanya diisi jalur dosen sesudah return itu.
    const rvMulai = exam.indexOf("function renderVisitors(visitors){");
    const cabang = rvMulai < 0 ? -1 : exam.indexOf("\n  if (_isStudent) {\n", rvMulai);
    const PENUTUP_CABANG = "    // Skip rest of dosen-only rendering\n    return;\n  }\n";
    const cabangAkhir = cabang < 0 ? -1 : exam.indexOf(PENUTUP_CABANG, cabang);
    const rvAkhir = cabangAkhir < 0 ? -1 : exam.indexOf("\n}\n", cabangAkhir);
    if (rvMulai < 0 || cabang < 0 || cabangAkhir < 0 || rvAkhir < 0) {
      throw new Error(`${relative}: renderVisitors student branch with early return not found`);
    }
    const cabangMhs = exam.slice(cabang, cabangAkhir);
    if (!cabangMhs.includes("    _kosongkanRosterUjian();\n")) {
      throw new Error(`${relative}: renderVisitors student branch does not clear the guest-phase roster`);
    }
    if (/getElementById\(['"](?:visitorFab|fabCount|vpBadge|vpList)['"]\)|onlineVisited/.test(cabangMhs)) {
      throw new Error(`${relative}: renderVisitors student branch touches the online roster or the chat button`);
    }
    for (const isiDosen of [
      "  document.getElementById('fabCount').textContent=onlineVisited.length;\n",
      "  document.getElementById('vpBadge').textContent=onlineVisited.length+' online';\n",
      "const listEl=document.getElementById('vpList')",
    ]) {
      const i = exam.indexOf(isiDosen, cabangAkhir);
      if (i < 0 || i > rvAkhir || exam.indexOf(isiDosen) < cabangAkhir) {
        throw new Error(`${relative}: ${isiDosen.trim()} must stay on the lecturer path after the student return`);
      }
    }
    const blokAi = exam.match(RX_BLOK_AI);
    const aiMulai = blokAi ? blokAi.index : -1;
    const aiAkhir = blokAi ? aiMulai + blokAi[0].length : -1;
    // Blok AI harus sudah membawa mode mahasiswa-ujian dari backend
    // (frontend-integration/modul-ai-chat.js, cabang feat/asisten-ujian-mahasiswa
    // dan sesudahnya). CSS di atas menyembunyikan tab Online bagi mahasiswa;
    // blok yang lebih tua tetap di mode 'kelas', sehingga panel mahasiswa buntu
    // tanpa Asisten padahal pemeriksaan lain hijau. Terjadi bila apply-ai-chat.js
    // dijalankan dari checkout backend yang lebih tua.
    for (const required of [
      "function terapkanPeran()",
      'var EXAM_STUDENT_CLASS = "vp-ujian-mhs";',
      "injectStyle(state.doc, EXAM_STYLE_ID, EXAM_CSS);",
      "function forgetExamStudentHistory(keepKey)",
    ]) {
      if (!blokAi || !blokAi[0].includes(required)) {
        throw new Error(`${relative}: AI block predates student exam mode (missing ${required}); re-apply apply-ai-chat.js from an up-to-date backend checkout`);
      }
    }
    const jsMulai = exam.indexOf("// ═══ ASISTEN-UJIAN-MAHASISWA:JS BEGIN");
    const jsAkhir = exam.indexOf("// ═══ ASISTEN-UJIAN-MAHASISWA:JS END");
    if (jsAkhir < jsMulai) throw new Error(`${relative}: ASISTEN-UJIAN-MAHASISWA:JS block is not closed`);
    if (/onlineVisited|onlinePresence|\bvisited\b|visitMap/.test(exam.slice(jsMulai, jsAkhir))) {
      throw new Error(`${relative}: student Asisten helper must only clear the roster, never fill it`);
    }
    for (const m of exam.matchAll(/getElementById\(['"](fabCount|vpBadge|vpList)['"]\)/g)) {
      const di = m.index;
      const sah = (di > aiMulai && di < aiAkhir) || (di > jsMulai && di < jsAkhir) || (di > cabangAkhir && di < rvAkhir);
      if (!sah) throw new Error(`${relative}: #${m[1]} is written outside the lecturer path of renderVisitors`);
    }

    const tanpaBlokAi = exam.replace(RX_BLOK_AI, "");
    for (const forbidden of ["vp-chat", "vpChatList", "vpChatInput", "sendChat"]) {
      if (tanpaBlokAi.includes(forbidden)) throw new Error(`${relative}: exam page must not carry class chat (${forbidden})`);
    }
    examAsisten += 1;
  }
}
if (examAsisten !== 12) throw new Error(`Expected 12 UTS/UAS pages with the student Asisten launcher, found ${examAsisten}`);

// Data kelas UTS/UAS hanya untuk dosen terverifikasi (scripts/privasi-hasil-ujian.mjs,
// 26 September 2026). Tabel tab Hasil (nama, NIM, status Terlambat/Bolos/Tepat
// Waktu, poin, kunjungan, waktu akses), papan Top Skor/Top Akses, statistik
// kelas, dan daftar online dulu dirender untuk SIAPA PUN yang bukan mahasiswa —
// termasuk tamu di layar login dan Mode Preview, sehingga mahasiswa yang sedang
// ujian cukup membuka tab kedua dalam Mode Preview untuk melihat status dan
// nilai seluruh kelas. Pemeriksaan di bawah menagih gerbangnya secara teks DAN
// menjalankan renderVisitors/updateLeaderboard halaman itu sendiri di sandbox
// (DOM tiruan) untuk tamu, Preview, mahasiswa, dan dosen.
const PENUTUP_CABANG_MHS = "    // Skip rest of dosen-only rendering\n    return;\n  }\n";
const DATA_UJI = {
  peers: [
    { nim: "41399000011", nama: "BUDI PEERLATE", points: 5, visitCount: 3 },
    { nim: "41399000012", nama: "CITRA PEERONLINE", points: 0, visitCount: 1 },
    { nim: "41399000013", nama: "DODI PEERTOP", points: 10, visitCount: 2 },
  ],
  student: { nim: "41300000001", nama: "TES MAHASISWA SATU" },
};
const RX_DATA_TEMAN = /peerlate|peeronline|peertop|4139900001\d|roster only|41300000099/i;
// Ajakan placeholder mengikuti konteks: tamu bisa langsung masuk sebagai
// mahasiswa, sedangkan Mode Preview tidak punya formulir login (jalan keluarnya
// tombol "Keluar Preview" di banner). Kalimat pertama placeholder sama untuk
// keduanya; di sumber halaman ajakan ditulis sebagai literal terpisah.
const PLACEHOLDER_AWAL = "Data kelas hanya tersedia untuk dosen. ";
const AJAKAN_TAMU = "Masuk sebagai mahasiswa untuk melihat nilai Anda sendiri.";
const AJAKAN_PREVIEW = "Keluar dari Mode Preview (tombol <strong>Keluar Preview</strong> di banner atas), lalu masuk sebagai mahasiswa untuk melihat nilai Anda sendiri.";
function ambilFungsi(exam, awal, relative) {
  const i = exam.indexOf(awal);
  const j = i < 0 ? -1 : exam.indexOf("\n}\n", i);
  if (i < 0 || j < 0) throw new Error(`${relative}: ${awal} not found`);
  return exam.slice(i, j + 3);
}
/**
 * Flag render halaman ujian (Pedoman §7.9). Baris komentar `//` diabaikan.
 *  1. render…Questions() yang langsung diikuti pemasangan flag render (spasi
 *     dan pindah baris bebas, juga `?.()`, dengan atau tanpa `window.`, UTS/UAS
 *     campuran) hanya boleh di dalam _ensure…QuestionsLoaded — bentuk persis
 *     bug UTS Math4/Opto.
 *  2. Flag render hanya boleh diberi nilai selain `false` di dalam
 *     render…Questions (sesudah render sukses) atau _ensure…QuestionsLoaded
 *     (sesudah bank soal diisi dari respons server), dan minimal sekali di
 *     sana. Aturan ini menangkap bentuk lain bug yang sama: flag sesudah
 *     try/catch, komentar di antara render dan flag, `?.()`.
 *  3. _ensure…QuestionsLoaded memanggil render…Questions(). Bentuk pemasangan
 *     flag di loader sengaja tidak dikunci (boleh bersyarat).
 * scripts/muat-soal-uts.mjs memakai aturan yang sama (periksaFlagRender) untuk
 * memeriksa hasilnya; ubah keduanya bersama.
 */
function periksaFlagRender(exam, jenis, relative) {
  const rentang = (awal) => {
    const i = exam.indexOf(awal);
    const j = i < 0 ? -1 : exam.indexOf("\n}\n", i);
    if (i < 0 || j < 0) throw new Error(`${relative}: ${awal} not found`);
    if (exam.indexOf(awal, i + 1) >= 0) throw new Error(`${relative}: ${awal} appears more than once`);
    return [i, j + 3];
  };
  const pemuat = rentang(`async function _ensure${jenis}QuestionsLoaded() {`);
  const perender = rentang(`function render${jenis}Questions() {`);
  const di = ([a, b], i) => i >= a && i < b;
  const baris = (i) => exam.slice(0, i).split("\n").length;
  const sebarisSesudah = (i) => exam.slice(i, exam.indexOf("\n", i) < 0 ? undefined : exam.indexOf("\n", i)).trim();
  // Di baris komentar: teks sebelum kecocokan pada barisnya memuat `//` (bukan `://` URL).
  const komentar = (i) => /(?:^|[^:])\/\//.test(exam.slice(exam.lastIndexOf("\n", i - 1) + 1, i));
  const kode = (rx) => [...exam.matchAll(rx)].filter((m) => !komentar(m.index));

  for (const m of kode(/(?<![\w$])render(U[TA]S)Questions\s*(?:\?\.\s*)?\(\s*\)\s*;?\s*(?:window\.)?_u[ta]sRenderedFlag\s*=\s*true\b/g)) {
    if (di(pemuat, m.index)) continue;
    throw new Error(`${relative}:${baris(m.index)}: rendered flag set right after render${m[1]}Questions() outside _ensure${jenis}QuestionsLoaded ("${m[0].replace(/\s+/g, " ")}"); the renderer returns early while the questions are not loaded yet, and the flag then stops _ensure${jenis}QuestionsLoaded (auto-login, saveIdentity, _setSessionPinHash) from ever calling getExamQuestions — set the flag inside the renderer after a successful render and call the loader instead (node scripts/muat-soal-uts.mjs)`);
  }
  let dipasang = 0;
  for (const m of kode(/(?<![\w$])_u[ta]sRenderedFlag\s*=(?!=)(?!\s*false\b)/g)) {
    if (di(pemuat, m.index) || di(perender, m.index)) {
      dipasang += 1;
      continue;
    }
    throw new Error(`${relative}:${baris(m.index)}: rendered flag assigned outside render${jenis}Questions/_ensure${jenis}QuestionsLoaded ("${sebarisSesudah(m.index)}"); set it only in the renderer after a successful render or in the loader after getExamQuestions answered, otherwise it can be true before any question exists and the loader never fetches them (Pedoman §7.9)`);
  }
  if (dipasang === 0) {
    throw new Error(`${relative}: rendered flag (_utsRenderedFlag/_uasRenderedFlag) is never set in render${jenis}Questions or _ensure${jenis}QuestionsLoaded`);
  }
  if (!kode(/(?<![\w$])render(U[TA]S)Questions\s*(?:\?\.\s*)?\(\s*\)/g).some((m) => m[1] === jenis && di(pemuat, m.index))) {
    throw new Error(`${relative}: _ensure${jenis}QuestionsLoaded must call render${jenis}Questions() after loading the questions`);
  }
}
/**
 * Halaman modul: kunci identitas yang dibaca skrip KLASIK = LOCAL_IDENTITY
 * halaman (§6.7; scripts/samakan-kunci-identitas.mjs). LOCAL_IDENTITY dan
 * MODULE_ID adalah const skrip module, jadi tidak terlihat dari skrip klasik
 * (`typeof LOCAL_IDENTITY` di sana selalu 'undefined') dan skrip klasik
 * menulis kuncinya sebagai literal: getIdentityLocal() — dipakai blok
 * PROGRES-MODUL, Export Tugas, dan forum HTML —, cadangan identitas dan
 * cadangan MODULE_ID di _draftKey(), dan `const LK` lapisan friksi.
 * Optimalisasi Modul 12–14 membaca kunci modul SEBELUMNYA sejak MODULE_ID
 * digeser ke pertemuan n+1 (#285, 30 Mei 2026): progres, gerbang, forum
 * server, dan friksi mati bagi mahasiswa yang tidak login di modul
 * sebelumnya pada peramban yang sama. LK Matematika 4 ditulis
 * '${COURSE_ID}_identity_modul-N' dalam kutip tunggal (tidak diinterpolasi),
 * sehingga friksinya tidak pernah aktif. Sama seperti pemeriksaan LK ujian
 * (§8), tetapi untuk ke-84 modul, dan juga menagih aturan nomor MODULE_ID
 * (Modul 1–7 → pertemuan-N, Modul 8–14 → pertemuan-(N+1) karena pertemuan 8
 * = UTS; Matematika 4 → modul-N).
 */
function periksaKunciIdentitasModul(modul, relative, course, modulNo) {
  const saran = "; run node scripts/samakan-kunci-identitas.mjs";
  const slug = {
    "Engineering-Mathematics": "math4",
    "Getaran-Mekanik": "getaran_mekanik",
    "Optimalisasi-dan-Automasi": "optoauto",
    "Sistem-Kendali-Cerdas": "sistem_kendali_cerdas",
    "Teknik-Tenaga-Listrik": "teknik_tenaga_listrik",
    "Pemodelan-Computer-Aided-Design": "pemodelan_cad",
  }[course];
  if (!slug) throw new Error(`${relative}: unknown course for the identity-key check`);
  const blok = [...modul.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => !/\bsrc\s*=/.test(m[1]))
    .map((m) => ({ awal: m.index + m[0].indexOf(">") + 1, isi: m[2], module: /type\s*=\s*["']module["']/i.test(m[1]) }));
  const diModule = (i) => blok.some((b) => b.module && i >= b.awal && i < b.awal + b.isi.length);
  const satu = (rx, apa) => {
    const m = [...modul.matchAll(rx)];
    if (m.length !== 1) throw new Error(`${relative}: ${apa} found ${m.length}x, expected once`);
    if (!diModule(m[0].index)) throw new Error(`${relative}: ${apa} must be declared in the page's <script type="module">`);
    return m[0][1];
  };
  const mid = satu(/\nconst MODULE_ID = '([^'\n]+)';/g, "const MODULE_ID");
  const harapMid = slug === "math4" ? `modul-${modulNo}` : `pertemuan-${modulNo <= 7 ? modulNo : modulNo + 1}`;
  if (mid !== harapMid) {
    throw new Error(`${relative}: MODULE_ID '${mid}', expected '${harapMid}' (Modul 1–7 → pertemuan-N, Modul 8–14 → pertemuan-(N+1) because meeting 8 is the UTS; Math4 uses modul-N)`);
  }
  let K = satu(/\nconst LOCAL_IDENTITY = `([^`\n]+)`;/g, "const LOCAL_IDENTITY").split("${MODULE_ID}").join(mid);
  if (K.includes("${COURSE_ID}")) K = K.split("${COURSE_ID}").join(satu(/\nconst COURSE_ID = '([^'\n]+)';/g, "const COURSE_ID"));
  if (K !== `${slug}_identity_${mid}`) throw new Error(`${relative}: LOCAL_IDENTITY resolves to '${K}', expected '${slug}_identity_${mid}'`);
  // Kunci identitas UTUH (bukan awalan '<slug>_identity_' + variabel) yang
  // tertulis di SEMUA skrip inline halaman, di luar baris komentar — harus K:
  //   - literal kutip tunggal/ganda/backtick; '${COURSE_ID}_identity_…' dalam
  //     kutip tunggal tidak diinterpolasi, jadi tertangkap apa adanya;
  //   - gabungan dua literal ('<slug>_identity_' + 'pertemuan-12');
  //   - templat backtick ber-${…}: di skrip module ${MODULE_ID}/${COURSE_ID}
  //     diganti nilainya (sisa ${…} = kunci dinamis, dilewati seperti
  //     '<slug>_identity_' + mid); di skrip KLASIK ditolak, karena const skrip
  //     module tidak terlihat di sana (ReferenceError atau kunci salah).
  let courseId = null;
  const nilaiCourseId = () => (courseId ??= satu(/\nconst COURSE_ID = '([^'\n]+)';/g, "const COURSE_ID"));
  const bukanKomentar = (js) => js.split("\n").filter((b) => { const t = b.trim(); return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")); });
  const literal = (js, module = false) => {
    const out = [];
    for (const baris of bukanKomentar(js)) {
      for (const m of baris.matchAll(/(['"`])([A-Za-z0-9_.-]*_identity_)\1\s*\+\s*(['"`])([A-Za-z0-9_.-]+)\3/g)) out.push(m[2] + m[4]);
      for (const m of baris.matchAll(/(['"`])([A-Za-z0-9_${}.-]*_identity_[A-Za-z0-9_${}.-]+)\1/g)) {
        let x = m[2];
        if (m[1] === "`" && x.includes("${")) {
          if (!module) continue;   // templat di skrip klasik ditolak di bawah
          x = x.split("${MODULE_ID}").join(mid);
          if (x.includes("${COURSE_ID}")) x = x.split("${COURSE_ID}").join(nilaiCourseId());
          if (x.includes("${")) continue;   // kunci dinamis
        }
        out.push(x);
      }
      if (!module) {
        for (const m of baris.matchAll(/`[^`\n]*_identity_[^`\n]*`/g)) {
          if (m[0].includes("${")) throw new Error(`${relative}: classic script builds an identity key from a template (${m[0]}); module consts are not visible there, write the literal '${K}'${saran}`);
        }
      }
    }
    return out;
  };
  for (const b of blok) {
    for (const x of literal(b.isi, b.module)) {
      if (x !== K) throw new Error(`${relative}: ${b.module ? "module" : "classic"} script reads identity key '${x}', expected '${K}' (this page's LOCAL_IDENTITY)${saran}`);
    }
  }
  // getIdentityLocal/_draftKey: satu deklarasi saja dan tidak ditimpa. Deklarasi
  // fungsi yang lebih akhir, atau `window.getIdentityLocal = …`, menggantikan
  // fungsi yang diperiksa di bawah tanpa terlihat oleh pemeriksaan literal.
  // Satu-satunya penugasan yang sah: `window._draftKey = _draftKey;`.
  for (const nama of ["getIdentityLocal", "_draftKey"]) {
    let def = 0;
    for (const b of blok) {
      for (const baris of bukanKomentar(b.isi)) {
        def += (baris.match(new RegExp(`\\bfunction\\s+${nama}\\b`, "g")) || []).length;
        if (new RegExp(`\\b${nama}\\s*=(?!=)`).test(baris) && !(nama === "_draftKey" && /^\s*window\._draftKey\s*=\s*_draftKey;\s*$/.test(baris))) {
          throw new Error(`${relative}: ${nama} is reassigned (${baris.trim().slice(0, 120)}); pages read the identity key only through the single classic ${nama}()${saran}`);
        }
      }
    }
    if (def !== 1) throw new Error(`${relative}: ${nama} declared ${def}x in inline scripts, expected once${saran}`);
  }
  const klasik = (i) => blok.some((b) => !b.module && i >= b.awal && i < b.awal + b.isi.length);
  const fungsiKlasik = (nama) => {
    const kepala = `\nfunction ${nama}() {`;
    const n = modul.split(kepala).length - 1;
    if (n !== 1) throw new Error(`${relative}: ${kepala.trim()} found ${n}x, expected once${saran}`);
    const i = modul.indexOf(kepala) + 1;
    if (!klasik(i)) throw new Error(`${relative}: ${nama}() must stay in a classic script (PROGRES-MODUL calls it as a global)`);
    const j = modul.indexOf("\n}\n", i);
    return modul.slice(i, j + 3);
  };
  // getIdentityLocal: sumber identitas PROGRES-MODUL, Export Tugas, forum HTML.
  {
    const f = fungsiKlasik("getIdentityLocal");
    const lit = literal(f);
    if (!f.includes("localStorage.getItem(") || !lit.length || lit.some((x) => x !== K)) {
      throw new Error(`${relative}: getIdentityLocal() must read localStorage '${K}' (this page's LOCAL_IDENTITY)${saran}`);
    }
  }
  // _draftKey: kunci draf efektif `<slug>_draft_<MODULE_ID>_<nim>`. Tepat satu
  // `return` selain `return null`, dalam salah satu bentuk yang dikenal:
  //   '<slug>_draft_<MODULE_ID>_' + me.nim         blok KUNCI-IDENTITAS:DRAF, Math4 M4, Opto M4
  //   '<slug>_draft_' + moduleId + '_' + me.nim    bentuk lama; moduleId = cadangan literal
  //   '<slug>_draft_' + MODULE_ID + '_' + me.nim   bentuk mati (ReferenceError di skrip klasik)
  // Gabungan literal lain ('<slug>_draft_' + 'pertemuan-12_'), templat backtick,
  // atau return kedua ditolak.
  {
    const f = fungsiKlasik("_draftKey").split("\n").filter((b) => !b.trim().startsWith("//")).join("\n");
    for (const m of f.matchAll(/\(typeof MODULE_ID !== 'undefined'\) \? MODULE_ID : '([^'\n]+)'/g)) {
      if (m[1] !== mid) throw new Error(`${relative}: _draftKey falls back to MODULE_ID '${m[1]}' (always used in a classic script), expected '${mid}'${saran}`);
    }
    for (const m of f.matchAll(/'([a-z0-9_]+)_draft_([^'\n]*)'/g)) {
      if (m[1] !== slug || (m[2] !== "" && m[2] !== `${mid}_`)) {
        throw new Error(`${relative}: _draftKey builds '${m[1]}_draft_${m[2]}…', expected '${slug}_draft_${mid}_<nim>'${saran}`);
      }
    }
    const bentuk = [`'${slug}_draft_${mid}_' + me.nim`, `'${slug}_draft_' + moduleId + '_' + me.nim`, `'${slug}_draft_' + MODULE_ID + '_' + me.nim`];
    const kembali = [...f.matchAll(/\breturn\b\s*([^;\n]*);/g)].map((m) => m[1].trim()).filter((r) => r !== "null");
    if (kembali.length !== 1 || !bentuk.includes(kembali[0])) {
      throw new Error(`${relative}: _draftKey returns ${kembali.map((r) => `\`${r}\``).join(" / ") || "nothing"}, expected ${bentuk[0]}${saran}`);
    }
    if (kembali[0] === bentuk[1] && f.split(`const moduleId = (typeof MODULE_ID !== 'undefined') ? MODULE_ID : '${mid}';`).length !== 2) {
      throw new Error(`${relative}: _draftKey uses moduleId without the single fallback '${mid}'${saran}`);
    }
  }
  // LK lapisan friksi (bentuk yang sama dengan pemeriksaan LK ujian §8).
  {
    const lk = [...modul.matchAll(/\n {2}const LK = '([^'\n]*)';\n/g)];
    if (lk.length !== 1) throw new Error(`${relative}: friction identity key (LK) found ${lk.length}x, expected once`);
    if (!klasik(lk[0].index)) throw new Error(`${relative}: friction identity key (LK) must be in the classic friction script`);
    if (lk[0][1] !== K) throw new Error(`${relative}: friction layer reads identity key '${lk[0][1]}', expected '${K}' (this page's LOCAL_IDENTITY)${saran}`);
  }
}
/**
 * Uji mutasi pemeriksaan di atas: salinan halaman yang dirusak dengan cara
 * yang pernah terjadi (literal Opto Modul 12 sebelum #285 diikutkan, LK
 * Matematika 4 tanpa interpolasi, cadangan draf 'pertemuan-5', MODULE_ID tanpa
 * geseran n+1) harus ditolak, sedangkan halaman aslinya lolos. Kasus berpola
 * (elemen kelima) juga menagih ALASAN penolakannya, supaya kasus itu terbukti
 * ditangkap pemeriksaan yang dimaksud, bukan kebetulan oleh pemeriksaan lain:
 * kunci dalam templat backtick, gabungan literal, templat ber-${…} di skrip
 * klasik, penimpaan getIdentityLocal/_draftKey, dan bentuk return _draftKey
 * lain (temuan tinjauan 29 September 2026).
 */
function ujiMutasiKunciIdentitas() {
  const LK_OPTO12 = "  // KUNCI-IDENTITAS:LK END v1\n";
  const sisip = (s) => LK_OPTO12 + s;
  const kasus = [
    ["Optimalisasi-dan-Automasi", 12, "'optoauto_draft_pertemuan-13_' + me.nim", "'optoauto_draft_' + 'pertemuan-12_' + me.nim", /_draftKey returns/],
    ["Optimalisasi-dan-Automasi", 12, "'optoauto_draft_pertemuan-13_' + me.nim", "`optoauto_draft_pertemuan-12_` + me.nim", /_draftKey returns/],
    ["Optimalisasi-dan-Automasi", 12, "'optoauto_draft_pertemuan-13_' + me.nim", "`optoauto_draft_pertemuan-12_${me.nim}`", /_draftKey returns/],
    ["Optimalisasi-dan-Automasi", 12, "'optoauto_draft_pertemuan-13_' + me.nim; ", "(window._drafLain || 'optoauto_draft_pertemuan-13_') + me.nim; ", /_draftKey returns/],
    ["Getaran-Mekanik", 12, "'getaran_mekanik_draft_' + moduleId + '_' + me.nim", "'getaran_mekanik_draft_' + 'pertemuan-12' + '_' + me.nim", /_draftKey returns/],
    ["Optimalisasi-dan-Automasi", 12, LK_OPTO12, sisip("  const _idLain = localStorage.getItem(`optoauto_identity_pertemuan-12`);\n"), /classic script reads identity key 'optoauto_identity_pertemuan-12'/],
    ["Optimalisasi-dan-Automasi", 12, LK_OPTO12, sisip("  const _idGabung = localStorage.getItem('optoauto_identity_' + 'pertemuan-12');\n"), /classic script reads identity key 'optoauto_identity_pertemuan-12'/],
    ["Optimalisasi-dan-Automasi", 12, LK_OPTO12, sisip("  const _idTpl = localStorage.getItem(`optoauto_identity_${MODULE_ID}`);\n"), /classic script builds an identity key from a template/],
    ["Optimalisasi-dan-Automasi", 12, LK_OPTO12, sisip("  window.getIdentityLocal = function () { try { return JSON.parse(localStorage.getItem(`optoauto_identity_pertemuan-13`)); } catch (e) { return null; } };\n"), /getIdentityLocal is reassigned/],
    ["Optimalisasi-dan-Automasi", 12, LK_OPTO12, sisip("  function getIdentityLocal() { return null; }\n"), /getIdentityLocal declared 2x/],
    ["Engineering-Mathematics", 1, "\nwindow._draftKey  = _draftKey;\n", "\nwindow._draftKey  = function () { return null; };\n", /_draftKey is reassigned/],
    ["Optimalisasi-dan-Automasi", 12, "localStorage.getItem('optoauto_identity_pertemuan-13')", "localStorage.getItem('optoauto_identity_pertemuan-12')"],
    ["Optimalisasi-dan-Automasi", 12, "\n  const LK = 'optoauto_identity_pertemuan-13';\n", "\n  const LK = 'optoauto_identity_pertemuan-12';\n"],
    ["Optimalisasi-dan-Automasi", 12, "'optoauto_draft_pertemuan-13_'", "'optoauto_draft_pertemuan-12_'"],
    ["Optimalisasi-dan-Automasi", 12, "\nconst MODULE_ID = 'pertemuan-13';", "\nconst MODULE_ID = 'pertemuan-12';"],
    ["Engineering-Mathematics", 1, "\n  const LK = 'math4_identity_modul-1';\n", "\n  const LK = '${COURSE_ID}_identity_modul-1';\n"],
    ["Engineering-Mathematics", 1, "'math4_draft_modul-1_'", "'math4_draft_pertemuan-5_'"],
    ["Getaran-Mekanik", 12, "? MODULE_ID : 'pertemuan-13'", "? MODULE_ID : 'pertemuan-12'"],
    ["Getaran-Mekanik", 12, "? LOCAL_IDENTITY : 'getaran_mekanik_identity_pertemuan-13'", "? LOCAL_IDENTITY : 'getaran_mekanik_identity_pertemuan-12'"],
    ["Pemodelan-Computer-Aided-Design", 1, "localStorage.getItem('pemodelan_cad_identity_pertemuan-1')", "localStorage.getItem('pemodelan_cad_identity_pertemuan-2')"],
  ];
  for (const [course, n, asli, rusak, alasan] of kasus) {
    const relative = `${course}/Modul/Modul-${n}.html`;
    const modul = fs.readFileSync(path.join(root, relative), "utf8");
    if (modul.split(asli).length !== 2) throw new Error(`${relative}: identity-key mutation test anchor not found exactly once: ${asli.trim()}`);
    let galat = null;
    try { periksaKunciIdentitasModul(modul.replace(asli, () => rusak), relative, course, n); } catch (e) { galat = e; }
    if (!galat) throw new Error(`${relative}: identity-key check accepted a mutated page (${rusak.trim()})`);
    if (alasan && !alasan.test(galat.message)) throw new Error(`${relative}: identity-key mutation (${rusak.trim()}) rejected for another reason: ${galat.message}`);
  }
}
function ambilBlok(exam, awal, akhir, relative) {
  const i = exam.indexOf(awal);
  const j = i < 0 ? -1 : exam.indexOf(akhir, i);
  if (i < 0 || j < 0) throw new Error(`${relative}: block ${awal} not found`);
  return exam.slice(i, exam.indexOf("\n", j) + 1);
}
/**
 * Halaman modul: pilihan quick check Forum (scripts/simpan-pilihan-poll.mjs,
 * 29 September 2026; v2 sesudah tinjauan hari yang sama). Tiap halaman wajib
 * memuat tepat satu blok PILIHAN-POLL-FORUM tepat sesudah
 * `<!-- PROGRES-MODUL: akhir -->`, dan PROGRES-MODUL wajib mengirim event
 * 'progres-modul:diterapkan' (ok:true sebagai pernyataan terakhir
 * terapkanProgres — sesudah forumSiap(p) PENJAGA-FORUM dan checkForumReady —,
 * ok:false langsung sesudah forumGagal(e, d) saat getModulProgress gagal;
 * urutannya juga diuji di sandbox runtime periksaPenjagaForum). saveModulForum (versi lama maupun sekarang) menulis
 * tiga teks forum kosong bila dipanggil tanpa `jawaban`, dan fungsi backend
 * diperbarui satu per satu saat deploy atau bisa di-rollback, jadi: pilihan
 * poll HANYA lewat callable terpisah saveModulPoll (backend tanpa callable itu
 * menjawab NOT_FOUND tanpa menulis); `pilihanPoll` dan `saveModulPoll` hanya
 * ada di blok itu, tepat satu panggilan di kirim() tanpa `jawaban`;
 * saveModulForum hanya dari simpanForum PROGRES-MODUL dengan `d.jawaban = j`
 * dan tidak disebut sama sekali di luar PROGRES-MODUL (termasuk blok ini);
 * penanda `bisaPoll` ditetapkan ulang dari setiap respons getModulProgress.
 * Perilakunya diuji lagi di sandbox (simulasiPilihanPoll). RX_BLOK_POLL dan
 * blokPollUnik dideklarasikan sebelum perulangan halaman modul.
 */
function periksaPilihanPoll(modul, relative) {
  const saran = "; jalankan node scripts/tambah-progres-modul.mjs lalu node scripts/simpan-pilihan-poll.mjs";
  const hitungDi = (s, sub) => s.split(sub).length - 1;
  const blok = modul.match(RX_BLOK_POLL) || [];
  if (blok.length !== 1) throw new Error(`${relative}: expected exactly one PILIHAN-POLL-FORUM block, found ${blok.length}${saran}`);
  if (hitungDi(modul, "PILIHAN-POLL-FORUM:BEGIN") !== 1 || hitungDi(modul, "PILIHAN-POLL-FORUM:END") !== 1) {
    throw new Error(`${relative}: stray PILIHAN-POLL-FORUM marker${saran}`);
  }
  if (!/<!-- PROGRES-MODUL: akhir -->\r?\n<!-- PILIHAN-POLL-FORUM:BEGIN v2 /.test(modul)) {
    throw new Error(`${relative}: PILIHAN-POLL-FORUM v2 must directly follow <!-- PROGRES-MODUL: akhir -->${saran}`);
  }
  const pmAwal = modul.indexOf("<!-- PROGRES-MODUL: awal -->"), pmAkhir = modul.indexOf("<!-- PROGRES-MODUL: akhir -->");
  const pm = modul.slice(pmAwal, pmAkhir);
  if (hitungDi(pm, "new CustomEvent('progres-modul:diterapkan'") !== 1 || hitungDi(pm, "kabarkan({ ok: true, progres: p });") !== 1 || hitungDi(pm, "kabarkan({ ok: false });") !== 1) {
    throw new Error(`${relative}: PROGRES-MODUL must dispatch 'progres-modul:diterapkan' (ok:true after terapkanProgres, ok:false when getModulProgress fails)${saran}`);
  }
  // Titik kait bersama PENJAGA-FORUM (#968): ok:true pernyataan terakhir terapkanProgres —
  // sesudah forumSiap(p) (pernyataan pertama, ditagih periksaPenjagaForum), textarea terisi,
  // dan checkForumReady — sehingga tab Forum sudah terbuka saat pilihan dipulihkan; ok:false
  // langsung sesudah forumGagal(e, d) di catch getModulProgress.
  if (!pm.includes("\n    if (typeof window.checkForumReady === 'function') try { window.checkForumReady(); } catch (e) {}\n    kabarkan({ ok: true, progres: p });\n  }\n  function muatProgres() {")
    || !pm.includes("\n      forumGagal(e, d);\n      kabarkan({ ok: false });\n    });\n")) {
    throw new Error(`${relative}: PROGRES-MODUL must dispatch ok:true as the last statement of terapkanProgres (after forumSiap and checkForumReady) and ok:false right after forumGagal(e, d)${saran}`);
  }
  const isi = blok[0];
  const luar = modul.replace(isi, "");
  for (const nama of ["pilihanPoll", "saveModulPoll"]) {
    if (luar.includes(nama)) throw new Error(`${relative}: ${nama} outside the PILIHAN-POLL-FORUM block`);
  }
  const diLuarPm = modul.slice(0, pmAwal) + modul.slice(pmAkhir);
  if (diLuarPm.includes("saveModulForum")) {
    throw new Error(`${relative}: saveModulForum referenced outside PROGRES-MODUL (it writes three empty forum answers when called without jawaban; poll choices go through saveModulPoll)`);
  }
  if (hitungDi(pm, "saveModulForum") !== 1 || !/\n    d\.jawaban = j;\r?\n    panggil\('saveModulForum', d\)/.test(pm)) {
    throw new Error(`${relative}: PROGRES-MODUL simpanForum must call saveModulForum only with d.jawaban = j`);
  }
  if (hitungDi(isi, "'saveModulPoll'") !== 1) throw new Error(`${relative}: PILIHAN-POLL-FORUM must call saveModulPoll exactly once`);
  const k0 = isi.indexOf("  function kirim() {");
  const kirim = k0 < 0 ? "" : isi.slice(k0, isi.indexOf("\n  }\n", k0));
  if (!/^ {2}function kirim\(\) \{\r?\n {4}if \(!bisaPoll \|\| berhenti \|\| !aktif\(\)\) return;/.test(kirim)
    || !kirim.includes("panggil('saveModulPoll', { modulId: window.MODUL_ID, nim: String(me.nim), pinHash: pin, pilihanPoll: baru })")
    || /jawaban/.test(kirim.replace(/\/\/[^\n]*/g, ""))
    || !/\.catch\(function \(e\) \{[\s\S]*?\n {6}berhenti = true;/.test(kirim)) {
    throw new Error(`${relative}: PILIHAN-POLL-FORUM must send poll choices only via saveModulPoll (gated by bisaPoll, no jawaban, any error stops the session)`);
  }
  if (!isi.includes("      bisaPoll = peta !== null;") || isi.includes("bisaPoll = true") || !isi.includes("      var peta = petaServer(d.progres);\n")) {
    throw new Error(`${relative}: PILIHAN-POLL-FORUM must re-evaluate bisaPoll from every getModulProgress response (forumPoll present)`);
  }
  if (!blokPollUnik.has(isi)) blokPollUnik.set(isi, relative);
}

/**
 * Sandbox node:vm untuk blok PILIHAN-POLL-FORUM: DOM tiruan (3 poll × 4 opsi),
 * voteForum/checkForumReady tiruan halaman, pembungkus PROGRES-MODUL tiruan,
 * callable tiruan, localStorage yang bisa dibawa ke "muat ulang" berikutnya.
 * Menagih: backend lama (respons tanpa forumPoll) → nol panggilan; backend
 * baru → satu saveModulPoll per pilihan, payload tepat, tanpa jawaban, tidak
 * pernah saveModulForum; klik sebelum respons progres diantre; pemulihan dari
 * server (server menang) dan localStorage lewat voteForum halaman tanpa memicu
 * penyimpanan teks forum; unggah pilihan lokal sekali; rilis miring
 * (getModulProgress baru, saveModulPoll belum ada → NOT_FOUND: berhenti, tidak
 * ada callable lain, diunggah pada muat berikutnya); rollback di tengah sesi
 * (respons tanpa forumPoll mematikan panggilan); reset dosen (kunci yang
 * pernah dikonfirmasi lalu hilang dari server tidak dipulihkan/diunggah);
 * bentuk localStorage v1; ok:false lalu ok:true; galat PIN; Mode Preview
 * inert; dosen hanya DOM; tombol Copy Forum: dilepas hanya bila forumSelesai +
 * teks lengkap + peramban ini belum pernah melihat forum belum selesai.
 */
async function simulasiPilihanPoll(isi, relative) {
  const modul = [...isi.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  const klasik = [...isi.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (modul.length !== 1 || klasik.length !== 1) throw new Error(`${relative}: PILIHAN-POLL-FORUM must hold one classic and one module script`);
  const badan = modul[0][1].replace(/^import [^\n]*\n/gm, "");
  if (/^\s*import\b/m.test(badan)) throw new Error(`${relative}: PILIHAN-POLL-FORUM import not stripped for the sandbox`);
  const KUNCI_LS = "forum_poll_uji-sandbox_41300000001";
  const buat = (opsi = {}) => {
    const log = [], panggilan = [], simpan = opsi.simpan || new Map(), el = {}, pendengar = {};
    const elemen = (id, tambahan) => (el[id] = Object.assign({ id, dataset: {}, style: {}, textContent: "", value: "", disabled: true,
      appendChild(c) { this.textContent += c.textContent; } }, tambahan));
    const polls = [1, 2, 3].map((n) => {
      const p = elemen("fp" + n);
      p.opsi = [0, 1, 2, 3].map((k) => ({ style: {}, getAttribute: (a) => (a === "onclick" ? `voteForum(${n},this,${k})` : null) }));
      p.querySelectorAll = (sel) => (sel === "[onclick]" ? p.opsi : []);
      return p;
    });
    for (const id of ["ans-fq1", "ans-fq2", "ans-fq3"]) elemen(id, { value: opsi.teks || "" });
    elemen("btn-copy-forum");
    elemen("forum-blocked-msg", { textContent: "⚠ awal" });
    const respons = opsi.respons || {};
    const tolak = (nama) => (typeof opsi.tolak === "string" ? opsi.tolak : (opsi.tolak || {})[nama]);
    const sb = {
      __log: log,
      console: { warn: (...a) => log.push("warn " + a.map(String).join(" ")), log() {} },
      localStorage: { getItem: (k) => (simpan.has(k) ? simpan.get(k) : null), setItem: (k, v) => simpan.set(k, String(v)) },
      document: {
        getElementById: (id) => el[id] || null,
        querySelectorAll: (sel) => (sel === '.poll-opts[id^="fp"]' ? polls : []),
        createElement: () => ({ style: {}, textContent: "" }),
      },
      addEventListener: (t, f) => { (pendengar[t] = pendengar[t] || []).push(f); },
      getIdentityLocal: () => (opsi.me === undefined ? { nama: "TES", nim: "41300000001", role: "student" } : opsi.me),
      MODUL_ID: "uji-sandbox",
      _sessionPinHash: "ab".repeat(32),
      _previewMode: !!opsi.preview,
      FORUM_MIN_WORDS: 30,
      countWords: (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length,
      getApp: () => ({}),
      getFunctions: () => ({}),
      httpsCallable: (fx, nama) => (data) => {
        panggilan.push({ nama, data: JSON.parse(JSON.stringify(data)) });
        if (tolak(nama)) return Promise.reject(Object.assign(new Error("tolak"), { code: tolak(nama) }));
        return Promise.resolve({ data: typeof respons[nama] === "function" ? respons[nama](data) : (respons[nama] || {}) });
      },
    };
    sb.window = sb;
    vm.createContext(sb);
    vm.runInContext(`function voteForum(n, opt, idx) {
      var p = document.getElementById('fp' + n); if (p.dataset.done) return;
      p.dataset.done = '1'; opt.style.borderColor = 'x'; __log.push('vote ' + n + ':' + idx);
      if (typeof checkForumReady === 'function') checkForumReady();
    }
    function checkForumReady() { __log.push('cekAsli'); document.getElementById('btn-copy-forum').disabled = true; }`, sb);
    vm.runInContext(klasik[0][1], sb);
    // Pembungkus PROGRES-MODUL tiruan: setiap panggilan lewat sini menjadwalkan simpan teks forum.
    vm.runInContext("(function () { var a = window.checkForumReady; window.checkForumReady = function () { __log.push('simpanTeksDijadwalkan'); return a.apply(this, arguments); }; })();", sb);
    vm.runInContext(`'use strict';\n${badan}`, sb, { filename: `${relative}#PILIHAN-POLL-FORUM` });
    const kabar = (detail) => (pendengar["progres-modul:diterapkan"] || []).forEach((f) => f({ detail }));
    const klik = (n, k) => sb.voteForum(n, polls[n - 1].opsi[k], k);
    const ls = () => JSON.parse(simpan.get(KUNCI_LS) || "{}");
    const lokal = () => ls().pilihan || {};
    const dipilih = () => polls.map((p) => (p.dataset.done ? p.opsi.findIndex((o) => o.style.borderColor === "x") : null));
    return { sb, log, panggilan, polls, el, simpan, kabar, klik, ls, lokal, dipilih };
  };
  const salah = (s, pesan, bukti) => { throw new Error(`${relative}: PILIHAN-POLL-FORUM (${s}) ${pesan}: ${JSON.stringify(bukti).slice(0, 300)}`); };
  const diam = () => tunggu(0).then(() => tunggu(0));
  const sama = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const pollSaja = (p) => p.nama === "saveModulPoll" && !Object.prototype.hasOwnProperty.call(p.data, "jawaban")
    && sama(Object.keys(p.data).sort(), ["modulId", "nim", "pilihanPoll", "pinHash"]);
  const tanpaCallableTeks = (s, label) => { if (s.panggilan.some((p) => p.nama !== "saveModulPoll")) salah(label, "called a callable other than saveModulPoll", s.panggilan); };
  // Server tiruan kontrak saveModulPoll: pilihan pertama final, respons = peta akhir.
  const serverBaru = (awal) => { const peta = Object.assign({}, awal || {}); return { peta, saveModulPoll: (d) => { for (const k of Object.keys(d.pilihanPoll)) if (!(k in peta)) peta[k] = d.pilihanPoll[k]; return { forumPoll: Object.assign({}, peta) }; } }; };

  // 1. Backend lama: respons tanpa forumPoll → tidak ada panggilan sama sekali.
  {
    const s = buat();
    s.kabar({ ok: true, progres: { centang: 1, forum: {}, forumSelesai: false } });
    s.klik(1, 2); s.klik(2, 0);
    await diam();
    if (s.panggilan.length) salah("backend lama", "called a callable", s.panggilan);
    if (!sama(s.lokal(), { 1: 2, 2: 0 }) || !sama(s.ls().diServer, [])) salah("backend lama", "choices not kept (unconfirmed) in localStorage", s.ls());
  }
  // 2. Backend baru: satu saveModulPoll per pilihan, tanpa jawaban; poll terkunci tidak memanggil lagi.
  {
    const srv = serverBaru();
    const s = buat({ respons: { saveModulPoll: srv.saveModulPoll } });
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: {} } });
    s.klik(3, 1);
    await diam();
    if (s.panggilan.length !== 1 || !pollSaja(s.panggilan[0]) || !sama(s.panggilan[0].data.pilihanPoll, { 3: 1 })) salah("backend baru", "expected one saveModulPoll {3:1}", s.panggilan);
    if (!sama(s.ls().diServer, ["3"])) salah("backend baru", "server-confirmed key not recorded", s.ls());
    s.klik(3, 2);
    await diam();
    if (s.panggilan.length !== 1) salah("backend baru", "second click on a locked poll called again", s.panggilan);
    tanpaCallableTeks(s, "backend baru");
  }
  // 3. Klik sebelum respons progres → diantre; server menang; unggah sekali; pemulihan tanpa simpan teks.
  {
    const srv = serverBaru({ 1: 3 });
    const s = buat({ respons: { saveModulPoll: srv.saveModulPoll } });
    s.simpan.set(KUNCI_LS, '{"pilihan":{"1":0,"2":1}}');
    s.klik(3, 2);
    await diam();
    if (s.panggilan.length) salah("klik sebelum progres", "called before getModulProgress answered", s.panggilan);
    s.log.length = 0;
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: { 1: 3 } } });
    await diam();
    if (!s.log.includes("vote 1:3") || !s.log.includes("vote 2:1")) salah("pulih", "server/localStorage choices not restored through voteForum", s.log);
    if (s.log.includes("simpanTeksDijadwalkan")) salah("pulih", "restoring polls scheduled a forum text save", s.log);
    if (!sama(s.lokal(), { 1: 3, 2: 1, 3: 2 })) salah("pulih", "server choice must win in localStorage", s.ls());
    if (s.panggilan.length !== 1 || !pollSaja(s.panggilan[0]) || !sama(s.panggilan[0].data.pilihanPoll, { 2: 1, 3: 2 })) salah("unggah lokal", "expected one upload of local-only choices", s.panggilan);
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: { 1: 3, 2: 1, 3: 2 } } });
    await diam();
    if (s.panggilan.length !== 1) salah("event ulang", "repeated progress event uploaded again", s.panggilan);
  }
  // 4. Rilis miring: getModulProgress sudah memuat forumPoll, saveModulPoll belum ada (NOT_FOUND).
  {
    const simpan = new Map();
    const s = buat({ simpan, tolak: { saveModulPoll: "functions/not-found" } });
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: true, forumPoll: {} } });
    s.klik(1, 1);
    await diam();
    s.klik(2, 3);
    await diam();
    if (s.panggilan.length !== 1 || s.panggilan[0].nama !== "saveModulPoll") salah("rilis miring", "expected exactly one saveModulPoll attempt, then stop", s.panggilan);
    if (!sama(s.lokal(), { 1: 1, 2: 3 }) || !sama(s.ls().diServer, [])) salah("rilis miring", "choices must stay unconfirmed in localStorage", s.ls());
    // Muat berikutnya, saveModulPoll sudah ada: diunggah sekali.
    const srv = serverBaru();
    const t = buat({ simpan, respons: { saveModulPoll: srv.saveModulPoll } });
    t.kabar({ ok: true, progres: { forum: {}, forumSelesai: true, forumPoll: {} } });
    await diam();
    if (t.panggilan.length !== 1 || !sama(t.panggilan[0].data.pilihanPoll, { 1: 1, 2: 3 }) || !sama(t.dipilih(), [1, 3, null])) salah("rilis miring, muat ulang", "expected restore + one upload", { p: t.panggilan, d: t.dipilih() });
    tanpaCallableTeks(t, "rilis miring");
  }
  // 5. Rollback di tengah sesi: respons berikutnya tanpa forumPoll mematikan panggilan.
  {
    const srv = serverBaru();
    const s = buat({ respons: { saveModulPoll: srv.saveModulPoll } });
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: {} } });
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false } });
    s.klik(1, 0);
    await diam();
    if (s.panggilan.length) salah("rollback", "called after a response without forumPoll", s.panggilan);
    const u = buat({ tolak: "functions/internal" });
    u.kabar({ ok: true, progres: { forumPoll: {} } });
    u.klik(1, 0); await diam(); u.klik(2, 0); await diam();
    if (u.panggilan.length !== 1) salah("galat lain", "kept calling after an error", u.panggilan);
    const v = buat({ respons: { saveModulPoll: () => ({ ok: true }) } });
    v.kabar({ ok: true, progres: { forumPoll: {} } });
    v.klik(1, 0); await diam(); v.klik(2, 0); await diam();
    if (v.panggilan.length !== 1 || !sama(v.ls().diServer, [])) salah("respons tanpa forumPoll", "must not be treated as saved; stop", { p: v.panggilan, ls: v.ls() });
  }
  // 6. Reset dosen: kunci terkonfirmasi yang hilang dari server tidak dipulihkan/diunggah; kunci belum terkonfirmasi tetap diunggah.
  {
    const srv = serverBaru();
    const s = buat({ respons: { saveModulPoll: srv.saveModulPoll } });
    s.simpan.set(KUNCI_LS, '{"pilihan":{"1":2,"2":1},"diServer":["1"]}');
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: {} } });
    await diam();
    if (!sama(s.dipilih(), [null, 1, null])) salah("reset", "reset key restored or local key lost", s.dipilih());
    if (s.panggilan.length !== 1 || !sama(s.panggilan[0].data.pilihanPoll, { 2: 1 })) salah("reset", "expected upload of the unconfirmed key only", s.panggilan);
    if (!sama(s.lokal(), { 2: 1 }) || !sama(s.ls().diServer, ["2"])) salah("reset", "reset key must leave localStorage", s.ls());
    // Backend lama/gagal: tidak bisa tahu soal reset → pulih dari localStorage apa adanya.
    const t = buat();
    t.simpan.set(KUNCI_LS, '{"pilihan":{"1":2},"diServer":["1"]}');
    t.kabar({ ok: false });
    await diam();
    if (!sama(t.dipilih(), [2, null, null]) || t.panggilan.length) salah("progres gagal", "expected restore from localStorage without callables", { d: t.dipilih(), p: t.panggilan });
  }
  // 7. Bentuk localStorage v1 {"1":idx}; ok:false lalu ok:true; progres gagal tanpa callable/simpan teks; galat PIN.
  {
    const srv = serverBaru();
    const s = buat({ respons: { saveModulPoll: srv.saveModulPoll } });
    s.simpan.set(KUNCI_LS, '{"2":3}');
    s.kabar({ ok: false });
    await diam();
    if (!s.log.includes("vote 2:3") || s.panggilan.length || s.log.includes("simpanTeksDijadwalkan")) salah("progres gagal", "expected restore from localStorage without callables/text saves", { log: s.log, p: s.panggilan });
    s.kabar({ ok: true, progres: { forum: {}, forumSelesai: false, forumPoll: {} } });
    await diam();
    if (s.panggilan.length !== 1 || !sama(s.panggilan[0].data.pilihanPoll, { 2: 3 }) || s.log.filter((x) => x === "vote 2:3").length !== 1) salah("ok:false lalu ok:true", "expected one upload, no second restore", { log: s.log, p: s.panggilan });
    const t = buat({ tolak: "functions/unauthenticated" });
    t.kabar({ ok: true, progres: { forumPoll: {} } });
    t.klik(1, 0); await diam(); t.klik(2, 0); await diam();
    if (t.panggilan.length !== 1) salah("unauthenticated", "kept calling after a PIN error", t.panggilan);
  }
  // 8. Mode Preview inert; dosen hanya DOM.
  {
    const s = buat({ preview: true });
    s.kabar({ ok: true, progres: { forumPoll: {} } });
    s.klik(1, 1);
    await diam();
    if (s.polls[0].dataset.done || s.simpan.size || s.panggilan.length) salah("preview", "poll reacted or stored", { done: s.polls[0].dataset.done, ls: [...s.simpan.keys()], p: s.panggilan });
    const d = buat({ me: { nama: "DOSEN", role: "dosen" } });
    d.kabar({ ok: true, progres: { forumPoll: {} } });
    d.klik(1, 1);
    await diam();
    if (!d.polls[0].dataset.done || d.simpan.size || d.panggilan.length) salah("dosen", "expected DOM-only behaviour", { done: d.polls[0].dataset.done, ls: [...d.simpan.keys()], p: d.panggilan });
  }
  // 9. Tombol Copy Forum: lepas hanya bila forumSelesai + teks lengkap + peramban ini belum pernah melihat forum belum selesai.
  {
    const teks = Array.from({ length: 30 }, (_, i) => "k" + i).join(" ");
    const s = buat({ teks });
    s.kabar({ ok: true, progres: { forumSelesai: true } });
    if (s.el["btn-copy-forum"].disabled !== false || !/quick check belum dipilih/.test(s.el["forum-blocked-msg"].textContent)) salah("forumSelesai", "copy button must stay enabled with a soft note", { btn: s.el["btn-copy-forum"].disabled, msg: s.el["forum-blocked-msg"].textContent });
    s.sb.checkForumReady();
    if (s.el["btn-copy-forum"].disabled !== false) salah("forumSelesai", "checkForumReady disabled the button again", s.el["btn-copy-forum"].disabled);
    // Pengiriman pertama di peramban ini: forum belum selesai saat dimuat...
    const simpan = new Map();
    const t = buat({ teks, simpan });
    t.kabar({ ok: true, progres: { forumSelesai: false } });
    t.sb.checkForumReady();
    if (t.el["btn-copy-forum"].disabled !== true || t.el["forum-blocked-msg"].textContent !== "⚠ awal") salah("pengiriman pertama", "empty polls must still block the first submission", t.el["forum-blocked-msg"].textContent);
    if (JSON.parse(simpan.get(KUNCI_LS) || "{}").forumBelumSelesai !== true) salah("pengiriman pertama", "forumBelumSelesai not recorded", [...simpan]);
    // ...lalu teks tersimpan otomatis (forumSelesai true) dan halaman dimuat ulang: tetap menunggu poll.
    const u = buat({ teks, simpan });
    u.kabar({ ok: true, progres: { forumSelesai: true } });
    u.sb.checkForumReady();
    if (u.el["btn-copy-forum"].disabled !== true || u.el["forum-blocked-msg"].textContent !== "⚠ awal") salah("muat ulang sesudah simpan otomatis", "empty polls must keep blocking after a reload", { btn: u.el["btn-copy-forum"].disabled, msg: u.el["forum-blocked-msg"].textContent });
    const w = buat({ teks: "pendek" });
    w.kabar({ ok: true, progres: { forumSelesai: true } });
    if (w.el["btn-copy-forum"].disabled !== true) salah("forumSelesai, teks pendek", "word minimum must still apply", w.el["btn-copy-forum"].disabled);
  }
}
/**
 * Halaman modul: blok PILIHAN-PG-PULIH (pemulihan pilihan PG dari
 * data.selections — sejak v3 hanya diisi getJawabanSaya lewat blok
 * JAWABAN-PRIVAT:GABUNG, tanpa field RTDB publik) dan PILIHAN-PG-EKSPOR (teks
 * fallback ekspor) dari scripts/pulihkan-pilihan-pg.mjs. Selain penanda dan
 * letaknya, kedua blok halaman itu dijalankan di sandbox node:vm dengan DOM
 * tiruan: course kanonik (huruf di onclick), course acak per NIM
 * (data-display-letter setelah shuffleMCOptions), acak yang belum bisa
 * diterapkan, record lama tanpa selections, (v2) record course acak tanpa
 * mcOrderVersion yang kunjungan pertamanya sebelum acak per NIM terpasang
 * (timestamp < 2026-08-09, hilang, atau rusak) — huruf yang tersimpan di sana
 * bisa kanonik, jadi tidak boleh ditandai — dan (v3) mcOrderVersion dari ledger:
 * 1 = huruf posisi (dipercaya berapa pun timestamp-nya), 0 = huruf kanonik
 * (course acak: data-huruf-asal yang dicatat blok JAWABAN-PRIVAT:HURUF-ASAL
 * sebelum opsi diacak; tanpa catatan itu tidak ditandai).
 */
function periksaPilihanPg(modul, relative) {
  const saran = "; jalankan node scripts/pulihkan-pilihan-pg.mjs";
  if (/isCorrect\s*&&\s*correctOpt\s*\?\s*correctOpt\.textContent\.trim\(\)\s*:\s*'\(Sudah dijawab, tetapi pilihan salah\)'/.test(modul)) {
    throw new Error(`${relative}: fallback Export HTML lama melaporkan jawaban PG benar sebagai "pilihan salah"${saran}`);
  }
  // PULIH v3 (mcOrderVersion dari ledger; penjaga timestamp v2 bila tidak ada); EKSPOR tetap v1.
  for (const penanda of ["// PILIHAN-PG-PULIH BEGIN", "// PILIHAN-PG-PULIH END", "// PILIHAN-PG-EKSPOR BEGIN", "// PILIHAN-PG-EKSPOR END",
    "// PILIHAN-PG-PULIH BEGIN v3", "// PILIHAN-PG-PULIH END v3", "// PILIHAN-PG-EKSPOR BEGIN v1", "// PILIHAN-PG-EKSPOR END v1"]) {
    const n = modul.split(penanda).length - 1;
    if (n !== 1) throw new Error(`${relative}: penanda ${penanda} muncul ${n}x, harusnya 1${saran}`);
  }
  if (!/\n    const data = snap\.val\(\);\n    \/\/ JAWABAN-PRIVAT:GABUNG BEGIN[^\n]*\n(?:    \/\/[^\n]*\n)*    if \(typeof window\._gabungJawabanSaya === 'function'\) window\._gabungJawabanSaya\(data\);\n    else \{ delete data\.selections; delete data\.codes; delete data\.mcOrderVersion; \}\n    \/\/ JAWABAN-PRIVAT:GABUNG END v2\n    \/\/ PILIHAN-PG-PULIH BEGIN v3/.test(modul)) {
    throw new Error(`${relative}: blok PILIHAN-PG-PULIH harus tepat sesudah \`const data = snap.val();\` dan blok JAWABAN-PRIVAT:GABUNG di _loadScoredQuestions${saran} (dan scripts/jawaban-privat.mjs)`);
  }
  if (!modul.includes("    } else if (mcAnswered[id]) {\n      isCorrect    = (mcScores[id] || 0) > 0;\n      // PILIHAN-PG-EKSPOR BEGIN v1")) {
    throw new Error(`${relative}: blok PILIHAN-PG-EKSPOR harus berada di cabang mcAnswered perakitan mcData${saran}`);
  }
  const pulih = ambilBlok(modul, "    // PILIHAN-PG-PULIH BEGIN v3", "    // PILIHAN-PG-PULIH END v3", relative);
  const ekspor = ambilBlok(modul, "      // PILIHAN-PG-EKSPOR BEGIN v1", "      // PILIHAN-PG-EKSPOR END v1", relative);

  const jalankan = ({ acakDiterapkan = false, hurufOnclick = false, stempelAsal = false, data, ulang = 1 }) => {
    const grup = {};
    for (let q = 1; q <= 4; q += 1) {
      grup[`mc${q}`] = ["A", "B", "C", "D"].map((h) => {
        const kelas = new Set();
        const onclick = hurufOnclick ? `selectMC('mc${q}',this,'${h}')` : `selectMC('mc${q}',this)`;
        return {
          asal: h, kelas, dataset: {},
          classList: { add: (...k) => k.forEach((x) => kelas.add(x)), remove: (...k) => k.forEach((x) => kelas.delete(x)), contains: (k) => kelas.has(k) },
          getAttribute: (n) => (n === "onclick" ? onclick : null),
        };
      });
    }
    // Tiruan blok JAWABAN-PRIVAT:HURUF-ASAL: huruf kanonik (urutan markup)
    // dicatat sebelum opsi diacak.
    if (stempelAsal) for (const opsi of Object.values(grup)) opsi.forEach((o, i) => { o.dataset.hurufAsal = String.fromCharCode(65 + i); });
    const semua = () => Object.values(grup).flat();
    const win = {};
    // Tiruan shuffleMCOptions: urutan terlihat dibalik, huruf posisi di data-display-letter.
    win.shuffleMCOptions = () => {
      if (!acakDiterapkan) return false;
      if (semua().some((o) => o.dataset.displayLetter)) return true;
      for (const opsi of Object.values(grup)) { opsi.reverse(); opsi.forEach((o, i) => { o.dataset.displayLetter = String.fromCharCode(65 + i); }); }
      return true;
    };
    const doc = {
      getElementById: (id) => { const q = id.replace(/^rg-/, ""); return grup[q] ? { querySelectorAll: () => grup[q].slice() } : null; },
    };
    // ulang > 1: _loadScoredQuestions dipanggil lagi (mis. sesudah login) — hasilnya harus sama.
    for (let k = 0; k < ulang; k += 1) {
      vm.runInNewContext(`(function (data) {\n${pulih}\n})(data);`, {
        window: win, document: doc, data,
        console: { warn: (...a) => { throw new Error(`blok PILIHAN-PG-PULIH melempar: ${a.map(String).join(" ")}`); } },
      });
    }
    const ringkas = {};
    for (const [q, opsi] of Object.entries(grup)) ringkas[q] = opsi.map((o) => `${o.asal}:${[...o.kelas].sort().join("+")}`).join(" ");
    return ringkas;
  };
  const harap = (nama, hasil, ekspektasi) => {
    for (const [q, h] of Object.entries(ekspektasi)) {
      if (hasil[q] !== h) throw new Error(`${relative}: PILIHAN-PG-PULIH (${nama}) ${q} = "${hasil[q]}", harap "${h}"`);
    }
  };
  harap("kanonik", jalankan({
    hurufOnclick: true, ulang: 2,
    data: { scoredQuestions: "mc1,mc2_mc_used,mc3,mc4_mc_used,c1_comp", selections: { mc1: "B", mc2: "c", mc3: 2 } },
  }), {
    mc1: "A: B:correct-ans+selected C: D:",
    mc2: "A: B: C:selected+wrong-ans D:",
    mc3: "A: B: C:correct-ans+selected D:",
    mc4: "A: B: C: D:",
  });
  // Course kanonik tidak bergantung pada timestamp: record sebelum 9 Agustus 2026 tetap ditandai.
  harap("kanonik, record sebelum acak per NIM", jalankan({
    hurufOnclick: true,
    data: { timestamp: "2026-08-06T00:00:00.000Z", scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "D", mc2: "A" } },
  }), { mc1: "A: B: C: D:correct-ans+selected", mc2: "A:selected+wrong-ans B: C: D:" });
  const ACAK_SAH = "2026-09-20T01:00:00.000Z";
  harap("acak per NIM", jalankan({
    acakDiterapkan: true, ulang: 2,
    data: { timestamp: ACAK_SAH, scoredQuestions: "mc1,mc2_mc_used,mc3", selections: { mc1: "A", mc2: "D", mc3: 1 } },
  }), {
    mc1: "D:correct-ans+selected C: B: A:",
    mc2: "D: C: B: A:selected+wrong-ans",
    mc3: "D: C: B: A:",
  });
  harap("acak per NIM, tepat di batas 2026-08-09T00:00:00Z", jalankan({
    acakDiterapkan: true,
    data: { timestamp: "2026-08-09T00:00:00.000Z", scoredQuestions: "mc1", selections: { mc1: "B" } },
  }), { mc1: "D: C:correct-ans+selected B: A:" });
  // Record course acak yang lebih tua dari acak per NIM (Sisken 5–8 Agustus 2026)
  // bisa menyimpan huruf KANONIK: tidak ditandai, ekspor memakai teks netral.
  for (const [nama, timestamp] of [
    ["acak per NIM, record sebelum acak", "2026-08-06T00:00:00Z"],
    ["acak per NIM, sedetik sebelum batas", "2026-08-08T23:59:59.999Z"],
    ["acak per NIM, tanpa timestamp", undefined],
    ["acak per NIM, timestamp rusak", "kemarin"],
  ]) {
    harap(nama, jalankan({
      acakDiterapkan: true, ulang: 2,
      data: { timestamp, scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "A", mc2: "B" } },
    }), { mc1: "D: C: B: A:", mc2: "D: C: B: A:" });
  }
  harap("acak belum diterapkan", jalankan({
    acakDiterapkan: false,
    data: { timestamp: ACAK_SAH, scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "A", mc2: "B" } },
  }), { mc1: "A: B: C: D:", mc2: "A: B: C: D:" });
  harap("record lama tanpa selections", jalankan({
    hurufOnclick: true, data: { scoredQuestions: "mc1,mc2_mc_used" },
  }), { mc1: "A: B: C: D:", mc2: "A: B: C: D:" });
  // v3: mcOrderVersion dari ledger (getJawabanSaya). 1 = huruf posisi, dipercaya
  // walau timestamp record lebih tua dari batas; 0 = huruf kanonik, dicari lewat
  // data-huruf-asal pada course acak. mc3 tanpa entri → penjaga timestamp v2.
  harap("acak per NIM, mcOrderVersion 1/0 dari ledger", jalankan({
    acakDiterapkan: true, stempelAsal: true, ulang: 2,
    data: {
      timestamp: "2026-08-06T00:00:00Z", scoredQuestions: "mc1,mc2_mc_used,mc3,mc4",
      selections: { mc1: "A", mc2: "B", mc3: "C", mc4: "d" }, mcOrderVersion: { mc1: 1, mc2: 0, mc4: 0 },
    },
  }), {
    mc1: "D:correct-ans+selected C: B: A:",
    mc2: "D: C: B:selected+wrong-ans A:",
    mc3: "D: C: B: A:",
    mc4: "D:correct-ans+selected C: B: A:",
  });
  harap("acak per NIM, mcOrderVersion 0 tanpa catatan huruf asal", jalankan({
    acakDiterapkan: true,
    data: { timestamp: ACAK_SAH, scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "A", mc2: "B" }, mcOrderVersion: { mc1: 0, mc2: 0 } },
  }), { mc1: "D: C: B: A:", mc2: "D: C: B: A:" });
  harap("acak per NIM, mcOrderVersion 1 tetapi acak belum diterapkan", jalankan({
    acakDiterapkan: false, stempelAsal: true,
    data: { timestamp: ACAK_SAH, scoredQuestions: "mc1", selections: { mc1: "A" }, mcOrderVersion: { mc1: 1 } },
  }), { mc1: "A: B: C: D:" });
  harap("kanonik, mcOrderVersion dari ledger", jalankan({
    hurufOnclick: true, stempelAsal: true,
    data: { timestamp: "2026-08-06T00:00:00Z", scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "C", mc2: "A" }, mcOrderVersion: { mc1: 0, mc2: 1 } },
  }), { mc1: "A: B: C:correct-ans+selected D:", mc2: "A:selected+wrong-ans B: C: D:" });

  const teksEkspor = (isCorrect, correctOpt) => vm.runInNewContext(
    `(function (isCorrect, correctOpt) {\n  let selectedText;\n${ekspor}  return selectedText;\n})(isCorrect, correctOpt)`,
    { isCorrect, correctOpt },
  );
  for (const [isCorrect, correctOpt, harapTeks] of [
    [true, null, "(Sudah dijawab benar — teks pilihan tidak tersedia)"],
    [false, null, "(Sudah dijawab, tetapi pilihan salah)"],
    [true, { textContent: " (B) Opsi benar " }, "(B) Opsi benar"],
    [false, { textContent: " (B) Opsi benar " }, "(Sudah dijawab, tetapi pilihan salah)"],
  ]) {
    const hasil = teksEkspor(isCorrect, correctOpt);
    if (hasil !== harapTeks) throw new Error(`${relative}: PILIHAN-PG-EKSPOR isCorrect=${isCorrect} correctOpt=${!!correctOpt} → "${hasil}", harap "${harapTeks}"`);
  }
}
/**
 * PROGRES-MODUL:PENJAGA-FORUM (scripts/tambah-progres-modul.mjs, 29 September
 * 2026). saveModulForum menimpa ketiga jawaban forum sekaligus. Sebelum penjaga
 * ini, simpanForum mengirim fq1–fq3 KOSONG bila getModulProgress lebih lambat
 * dari ±2 detik (cold start), gagal, atau modul terkunci overlay prasyarat,
 * sehingga forum di server tertimpa kosong dan forumSelesai=false (gerbang
 * modul berikutnya ikut terkunci). Diperiksa per halaman:
 *   - sub-blok penjaga tepat 1x di dalam PROGRES-MODUL, tepat sesudah
 *     `var forumDimuat = false;`, identik di 84 halaman, dan satu-satunya
 *     deklarasi forumTerakhir (baseline tidak boleh direset ke '');
 *   - kaitnya: forumSiap(p) pernyataan pertama terapkanProgres, mulaiMuatForum()
 *     di muatProgres sesudah cek pinHash (dan hitungan centang mode bebas
 *     dibuang sebelum cek itu), forumDitolak() sebelum tampilkanKunci,
 *     forumGagal(e, d) di catch, `if (!bolehKirimForum(j)) return;` di
 *     simpanForum sebelum panggilan saveModulForum, dan forumTertahan() di
 *     kunciTab serta pembungkus switchTab (tab Forum terkunci sebelum 'siap');
 *   - saveModulForum dipanggil tepat 1x di PROGRES-MODUL (simpanForum, dengan
 *     jawaban); blok PILIHAN-POLL-FORUM v2 tidak menyebut saveModulForum sama
 *     sekali (pilihan quick check lewat saveModulPoll);
 *   - sandbox node:vm: (a) sub-blok sendiri — status belum/memuat/ditolak/gagal
 *     menolak kiriman, siap + tiga field kosong menolak, baseline = forum server
 *     (tanpa gema), sesi baru mereset (kecuali PIN baru untuk NIM yang sama
 *     sesudah 'siap'), coba ulang 3/10/30 detik hanya untuk galat sementara,
 *     coba ulang atas permintaan berjeda, galat sesi lama diabaikan, hash PIN
 *     sesi tidak disentuh; (b) runtime PROGRES-MODUL utuh dengan Firebase/DOM
 *     tiruan dan pewaktu virtual — cold start, mahasiswa baru, gagal lalu
 *     pulih, coba ulang habis lalu tab Forum memuat ulang, gagal lalu centang
 *     lengkap, akses ditolak, PIN terkunci, sesi PIN tidak berlaku, galat sesi
 *     lama, PIN ulang di halaman yang sama, jendela sebelum muatProgres,
 *     centang mode bebas di localStorage, Forum yang terlanjur terbuka, dan
 *     kiriman forum gagal lalu dicoba ulang.
 * ujiMutasiPenjagaForum: salinan halaman yang dirusak harus ditolak.
 */
function pfAmbilFungsi(teks, awal, relative) {
  const i = teks.indexOf(awal);
  const j = i < 0 ? -1 : teks.indexOf("\n  }\n", i);
  if (i < 0 || j < 0 || teks.indexOf(awal, i + 1) >= 0) throw new Error(`${relative}: PROGRES-MODUL must define ${awal.trim()} exactly once`);
  return teks.slice(i, j + 4);
}
async function periksaPenjagaForum(modul, relative) {
  const saran = "; jalankan node scripts/tambah-progres-modul.mjs";
  const hitungDi = (s, sub) => s.split(sub).length - 1;
  if (hitungDi(modul, PF_AWAL) !== 1 || hitungDi(modul, PF_AKHIR) !== 1) throw new Error(`${relative}: PROGRES-MODUL markers must appear exactly once${saran}`);
  const a = modul.indexOf(PF_AWAL), z = modul.indexOf(PF_AKHIR);
  if (z < a) throw new Error(`${relative}: PROGRES-MODUL markers out of order${saran}`);
  const pm = modul.slice(a, z);
  const luarPm = modul.slice(0, a) + modul.slice(z);
  if (luarPm.includes("PENJAGA-FORUM")) throw new Error(`${relative}: PENJAGA-FORUM marker outside PROGRES-MODUL${saran}`);
  const sub = pm.match(RX_PF_SUB) || [];
  if (sub.length !== 1 || hitungDi(pm, "PROGRES-MODUL:PENJAGA-FORUM BEGIN") !== 1 || hitungDi(pm, "PROGRES-MODUL:PENJAGA-FORUM END") !== 1) {
    throw new Error(`${relative}: PROGRES-MODUL must contain exactly one PROGRES-MODUL:PENJAGA-FORUM sub-block (forum is never saved before server progress is applied)${saran}`);
  }
  const blok = sub[0];
  if (!pm.includes("\n  var forumDimuat = false;" + blok)) throw new Error(`${relative}: PENJAGA-FORUM must directly follow \`var forumDimuat = false;\`${saran}`);
  if (penjagaForum.acuan === null) { penjagaForum.acuan = blok; penjagaForum.acuanDari = relative; }
  else if (blok !== penjagaForum.acuan) throw new Error(`${relative}: PENJAGA-FORUM differs from ${penjagaForum.acuanDari} (the sub-block must be identical on all 84 pages)${saran}`);
  for (const wajib of [
    "var statusForum = 'belum',", "forumTerakhir = null;",
    "function mulaiMuatForum() {", "function forumSiap(p) {", "function forumDitolak() {", "function forumGagal(e, d) {",
    "function forumCobaLagi() {", "function forumTertahan() {", "function bolehKirimForum(j) {",
  ]) {
    if (hitungDi(blok, wajib) < 1) throw new Error(`${relative}: PENJAGA-FORUM missing ${wajib}${saran}`);
  }
  if (/_sessionPinHash/.test(blok)) throw new Error(`${relative}: PENJAGA-FORUM must not touch window._sessionPinHash (the PIN re-prompt belongs to JAWABAN-PRIVAT)${saran}`);
  const pmTanpaSub = pm.replace(blok, "\n");
  if (/\bvar\b[^;\n]*\bforumTerakhir\b/.test(pmTanpaSub)) throw new Error(`${relative}: forumTerakhir must only be declared inside PENJAGA-FORUM (a later \`var … forumTerakhir = ''\` resets the server baseline)${saran}`);
  for (const nama of ["mulaiMuatForum", "forumSiap", "forumDitolak", "forumGagal", "forumCobaLagi", "forumTertahan", "tahanForum", "bolehKirimForum", "statusForum", "jedaForum"]) {
    if (new RegExp(`function ${nama}\\b|var ${nama}\\b|\\b${nama}\\s*=[^=]`).test(pmTanpaSub)) throw new Error(`${relative}: ${nama} must only be defined inside PENJAGA-FORUM${saran}`);
  }
  // Kait di runtime.
  if (!pm.includes("\n  function terapkanProgres(p) {\n    forumSiap(p);\n") || hitungDi(pmTanpaSub, "forumSiap(") !== 1) {
    throw new Error(`${relative}: terapkanProgres must call forumSiap(p) as its first statement (before the textareas are filled and before checkForumReady)${saran}`);
  }
  const muat = pfAmbilFungsi(pm, "\n  function muatProgres() {", relative);
  const iPin = muat.indexOf("if (!d.pinHash) {"), iMulai = muat.indexOf("\n    mulaiMuatForum();\n"), iPanggil = muat.indexOf("panggil('getModulProgress'");
  if (!(iPin >= 0 && iMulai > iPin && iPanggil > iMulai) || hitungDi(pmTanpaSub, "mulaiMuatForum(") !== 1) {
    throw new Error(`${relative}: muatProgres must call mulaiMuatForum() after the pinHash check and before getModulProgress${saran}`);
  }
  const iBebas = muat.indexOf("\n    if (bebas) { bebas = false; centang = 0; }\n");
  if (!(iBebas >= 0 && iBebas < iPin)) {
    throw new Error(`${relative}: muatProgres must drop the free-mode tick count (\`if (bebas) { bebas = false; centang = 0; }\`) before the pinHash check (a lecturer/Preview count in localStorage must not unlock a student's tabs)${saran}`);
  }
  if (!muat.includes("{ forumDitolak(); tampilkanKunci(p.akses.prasyarat); return; }") || hitungDi(pmTanpaSub, "forumDitolak(") !== 1) {
    throw new Error(`${relative}: muatProgres must call forumDitolak() before tampilkanKunci when access is denied${saran}`);
  }
  const iCatch = muat.indexOf("}).catch(function (e) {");
  if (iCatch < 0 || !muat.slice(iCatch).includes("\n      forumGagal(e, d);\n") || hitungDi(pmTanpaSub, "forumGagal(") !== 1) {
    throw new Error(`${relative}: muatProgres must call forumGagal(e, d) in the getModulProgress catch${saran}`);
  }
  // Tab Forum terkunci sebelum 'siap': kunciTab dan pembungkus switchTab memakai forumTertahan().
  const kunciTab = pfAmbilFungsi(pm, "\n  function kunciTab(kunci) {", relative);
  if (!kunciTab.includes("var tahan = forumTertahan();") || !kunciTab.includes("var k = kunci || (t === 'forum' && tahan);")
    || !pm.includes("\n      if (kunciCentang || (tab === 'forum' && forumTertahan())) {\n") || hitungDi(pm, "var ulang = forumCobaLagi();") !== 1) {
    throw new Error(`${relative}: kunciTab and the switchTab wrapper must lock the Forum tab while forumTertahan() (before server progress is applied)${saran}`);
  }
  const simpan = pfAmbilFungsi(pm, "\n  function simpanForum() {", relative);
  const iIsi = simpan.indexOf("['fq1', 'fq2', 'fq3'].forEach("), iBoleh = simpan.indexOf("\n    if (!bolehKirimForum(j)) return;\n");
  const iKirim = simpan.indexOf("panggil('saveModulForum'"), iTerakhir = simpan.indexOf("if (kunci === forumTerakhir) return;");
  if (!(iIsi >= 0 && iBoleh > iIsi && iKirim > iBoleh && iTerakhir > iBoleh) || hitungDi(pmTanpaSub, "bolehKirimForum(") !== 1) {
    throw new Error(`${relative}: simpanForum must return early with \`if (!bolehKirimForum(j)) return;\` before saveModulForum${saran}`);
  }
  // Satu-satunya kiriman teks forum: simpanForum di PROGRES-MODUL.
  if (hitungDi(pm, "saveModulForum") !== 1 || hitungDi(simpan, "panggil('saveModulForum', d)") !== 1 || !simpan.includes("\n    d.jawaban = j;\n")) {
    throw new Error(`${relative}: PROGRES-MODUL must call saveModulForum exactly once, from simpanForum with d.jawaban = j${saran}`);
  }
  // Blok PILIHAN-POLL-FORUM v2 menyimpan pilihan quick check lewat callable terpisah
  // saveModulPoll, jadi di luar PROGRES-MODUL (termasuk blok poll) saveModulForum tidak
  // boleh disebut sama sekali: panggilan tanpa jawaban menulis tiga teks kosong di backend lama.
  if (luarPm.includes("saveModulForum")) throw new Error(`${relative}: saveModulForum referenced outside PROGRES-MODUL (PILIHAN-POLL-FORUM uses saveModulPoll); forum text may only be sent by the guarded simpanForum`);
  // Perilaku (sandbox), sekali per isi PROGRES-MODUL.
  if (!penjagaForum.sandbox.has(pm)) {
    let galat = null;
    try { ujiSubBlokPenjagaForum(blok, relative); await simulasiPenjagaForum(pm, relative); } catch (e) { galat = e; }
    penjagaForum.sandbox.set(pm, galat);
  }
  const galat = penjagaForum.sandbox.get(pm);
  if (galat) throw new Error(`${galat.message.startsWith(relative) ? "" : relative + ": "}${galat.message}`);
  penjagaForum.halaman += 1;
}
/** (a) Sub-blok penjaga sendiri, dengan dasar/mhsAktif/muatProgres/toast palsu dan pewaktu virtual. */
function ujiSubBlokPenjagaForum(blok, relative) {
  const gagal = (pesan) => { throw new Error(`${relative}: PENJAGA-FORUM sandbox: ${pesan}`); };
  const HASH_B = "b".repeat(64), HASH_C = "c".repeat(64);   // hash rekaan, bukan PIN siapa pun
  const ctx = { sesi: { nim: "41300000123", pinHash: HASH_B }, aktif: true, toast: [], muat: 0, jam: 0, id: 0, timer: [], window: { _sessionPinHash: HASH_B } };
  const f = vm.runInNewContext(`(function () {
  function dasar() { return { modulId: 'uji-modul-2', nim: ctx.sesi.nim, pinHash: ctx.sesi.pinHash }; }
  function mhsAktif() { return ctx.aktif; }
  function muatProgres() { ctx.muat += 1; }
  function toast(m) { ctx.toast.push(String(m)); }
  function setTimeout(fn, ms) { ctx.id += 1; ctx.timer.push({ id: ctx.id, at: ctx.jam + (Number(ms) || 0), fn: fn }); return ctx.id; }
  function clearTimeout(id) { for (var i = 0; i < ctx.timer.length; i += 1) if (ctx.timer[i].id === id) { ctx.timer.splice(i, 1); return; } }
${blok}
  return { mulaiMuatForum: mulaiMuatForum, forumSiap: forumSiap, forumDitolak: forumDitolak, forumGagal: forumGagal, bolehKirimForum: bolehKirimForum,
    forumCobaLagi: forumCobaLagi, forumTertahan: forumTertahan, status: function () { return statusForum; }, baseline: function () { return forumTerakhir; } };
})()`, { ctx, window: ctx.window });
  const majukan = (ms) => {
    const akhir = ctx.jam + ms;
    for (;;) {
      ctx.timer.sort((x, y) => x.at - y.at || x.id - y.id);
      const t = ctx.timer[0];
      if (!t || t.at > akhir) break;
      ctx.timer.shift(); ctx.jam = t.at; t.fn();
    }
    ctx.jam = akhir;
  };
  const J = (a, b, c) => ({ fq1: a, fq2: b, fq3: c });
  const teks = J("jawaban satu", "", "");
  const boleh = (j) => f.bolehKirimForum(j);
  if (f.status() !== "belum" || boleh(teks) || !f.forumTertahan()) gagal("status awal harus 'belum', menolak kiriman, dan menahan tab Forum");
  ctx.aktif = false;
  if (f.forumTertahan() || f.forumCobaLagi()) gagal("dosen/Preview (bukan mahasiswa aktif) tidak boleh ditahan maupun memuat progres");
  ctx.aktif = true;
  f.mulaiMuatForum();
  if (f.status() !== "memuat" || boleh(teks) || !f.forumTertahan() || f.forumCobaLagi()) gagal("status 'memuat' harus menolak kiriman, menahan tab Forum, dan tidak memuat ulang atas permintaan");
  f.forumDitolak();
  if (f.status() !== "ditolak" || boleh(teks) || f.forumCobaLagi()) gagal("status 'ditolak' harus menolak kiriman (overlay prasyarat yang memeriksa ulang)");
  f.mulaiMuatForum();
  // Galat sementara: coba ulang otomatis 3/10/30 detik, lalu berhenti.
  const kode = ["unavailable", "internal", "deadline-exceeded"];
  for (let i = 0; i < 3; i += 1) {
    const jeda = [3000, 10000, 30000][i];
    f.forumGagal({ code: "functions/" + kode[i], message: "gagal sementara" });
    if (f.status() !== "gagal" || boleh(teks) || !f.forumTertahan()) gagal("status 'gagal' harus menolak kiriman dan menahan tab Forum");
    if (f.forumCobaLagi()) gagal("selama coba ulang otomatis terjadwal, membuka tab Forum tidak boleh menambah panggilan");
    majukan(jeda - 1);
    if (ctx.muat !== i) gagal(`coba ulang ke-${i + 1} terlalu cepat (harus ${jeda} ms)`);
    majukan(1);
    if (ctx.muat !== i + 1) gagal(`coba ulang ke-${i + 1} harus ${jeda} ms dan memanggil muatProgres()`);
    f.mulaiMuatForum();
    if (f.status() !== "memuat") gagal("coba ulang harus kembali ke 'memuat'");
  }
  f.forumGagal({ code: "functions/unavailable", message: "gagal sementara" });
  majukan(600000);
  if (ctx.muat !== 3 || !ctx.toast.some((m) => /muat ulang halaman/i.test(m))) gagal("sesudah 3 kali coba ulang otomatis harus berhenti dan memberi tahu (buka tab Forum / muat ulang halaman)");
  // Coba ulang atas permintaan (tab Forum dibuka, centang dijawab server): langsung, lalu berjeda 15 detik.
  if (!f.forumCobaLagi() || ctx.muat !== 4) gagal("sesudah coba ulang otomatis habis, membuka tab Forum harus memuat ulang progres");
  f.mulaiMuatForum(); f.forumGagal({ code: "functions/unavailable", message: "gagal sementara" });
  if (f.forumCobaLagi() || ctx.muat !== 4) gagal("coba ulang atas permintaan harus berjeda 15 detik");
  majukan(15000);
  if (!f.forumCobaLagi() || ctx.muat !== 5) gagal("sesudah jeda 15 detik coba ulang atas permintaan harus diizinkan lagi");
  f.mulaiMuatForum(); f.forumGagal({ code: "functions/unavailable", message: "gagal sementara" });
  // Sesi baru (NIM|pinHash lain) sebelum 'siap': status, baseline, jeda, dan jatah coba ulang direset.
  ctx.sesi.pinHash = HASH_C;
  f.mulaiMuatForum();
  if (f.status() !== "memuat" || f.baseline() !== null) gagal("sesi baru harus mereset status dan baseline");
  f.forumGagal({ code: "functions/unauthenticated", message: "PIN salah, silakan login ulang" }, { nim: ctx.sesi.nim, pinHash: HASH_B });
  if (f.status() !== "memuat") gagal("galat getModulProgress milik sesi lama tidak boleh mengubah status sesi baru");
  // Penguncian PIN: tanpa coba ulang otomatis; atas permintaan baru sesudah masa kunci.
  const m0 = ctx.muat;
  f.forumGagal({ code: "functions/resource-exhausted", message: "Terlalu banyak percobaan PIN. Coba lagi dalam 42 detik.", details: { remainingSeconds: 42 } }, { nim: ctx.sesi.nim, pinHash: HASH_C });
  majukan(41000);
  if (f.status() !== "gagal" || ctx.muat !== m0 || f.forumCobaLagi()) gagal("resource-exhausted tidak boleh dicoba ulang (otomatis maupun atas permintaan) sebelum masa kunci habis");
  majukan(1000);
  if (!f.forumCobaLagi() || ctx.muat !== m0 + 1) gagal("sesudah masa kunci PIN habis, membuka tab Forum harus memuat ulang progres");
  f.mulaiMuatForum();
  f.forumGagal({ code: "functions/unavailable", message: "gagal sementara" });
  majukan(3000);
  if (ctx.muat !== m0 + 2) gagal("sesi baru harus mendapat jatah coba ulang otomatis baru (3000 ms)");
  f.mulaiMuatForum();
  // Sesi PIN tidak berlaku: tanpa coba ulang (hash basi = percobaan PIN salah), hash tidak disentuh.
  f.forumGagal({ code: "functions/unauthenticated", message: "PIN salah, silakan login ulang" });
  majukan(600000);
  if (ctx.muat !== m0 + 2 || f.forumCobaLagi()) gagal("unauthenticated tidak boleh dicoba ulang, otomatis maupun atas permintaan");
  if (ctx.window._sessionPinHash !== HASH_B) gagal("PENJAGA-FORUM tidak boleh mengubah hash PIN sesi (permintaan PIN ulang milik JAWABAN-PRIVAT)");
  // PIN dimasukkan lagi (sesi baru): mulai memuat lagi.
  ctx.sesi.pinHash = "e".repeat(64);
  f.mulaiMuatForum();
  if (f.status() !== "memuat") gagal("PIN baru sesudah sesi tidak berlaku harus memuat ulang");
  // Siap: baseline = forum server (urutan kunci sama dengan simpanForum), tiga field kosong ditolak.
  f.forumSiap({ forum: { fq1: "a", fq3: 7 } });
  if (f.status() !== "siap" || f.forumTertahan()) gagal("forumSiap harus membuat status 'siap' dan membuka tab Forum");
  if (f.baseline() !== JSON.stringify(J("a", "", ""))) gagal(`baseline harus JSON forum server dalam urutan fq1,fq2,fq3 (dapat ${f.baseline()})`);
  if (boleh(J("", "", "")) || boleh(J("  ", "\n\t", " "))) gagal("tiga jawaban kosong tidak boleh dikirim");
  if (!boleh(J("a", "", "")) || !boleh(J("", "", "x"))) gagal("status 'siap' dengan teks harus boleh dikirim");
  const mSiap = ctx.muat;
  f.forumGagal({ code: "functions/unavailable" }); f.forumDitolak(); f.mulaiMuatForum(); majukan(600000);
  if (f.status() !== "siap" || f.forumCobaLagi() || ctx.muat !== mSiap) gagal("sesudah 'siap', galat/penolakan/muat ulang pada sesi yang sama tidak boleh mengubah status");
  f.forumSiap({ forum: { fq1: "lain" } });
  if (f.baseline() !== JSON.stringify(J("a", "", ""))) gagal("forumSiap kedua pada sesi yang sama tidak boleh mengganti baseline");
  // PIN sesi baru untuk NIM yang sama: tetap 'siap' dengan baseline yang sama (suntingan tidak menunggu lagi).
  ctx.sesi.pinHash = "f".repeat(64);
  f.mulaiMuatForum();
  if (f.status() !== "siap" || f.baseline() !== JSON.stringify(J("a", "", "")) || f.forumTertahan()) gagal("PIN sesi baru untuk NIM yang sama harus mempertahankan 'siap' dan baseline");
  // NIM lain: mulai dari awal.
  ctx.sesi.nim = "41300000999";
  f.mulaiMuatForum();
  if (f.status() !== "memuat" || f.baseline() !== null || !f.forumTertahan()) gagal("NIM lain harus mereset status dan baseline serta menahan tab Forum");
  const f2 = vm.runInNewContext(`(function () { function dasar() { return { nim: '1', pinHash: 'x' }; } function mhsAktif() { return true; } function muatProgres() {} function toast() {} function setTimeout() { return 0; } function clearTimeout() {}
${blok}
  forumSiap({}); return forumTerakhir; })()`, { window: {} });
  if (f2 !== JSON.stringify(J("", "", ""))) gagal("forumSiap tanpa forum server harus memberi baseline tiga string kosong");
}
/** (b) Runtime PROGRES-MODUL utuh: Firebase/DOM tiruan, pewaktu virtual. */
async function simulasiPenjagaForum(pm, relative) {
  const s0 = pm.indexOf('<script type="module">'), s1 = s0 < 0 ? -1 : pm.indexOf("</script>", s0);
  if (s0 < 0 || s1 < 0) throw new Error(`${relative}: PROGRES-MODUL module script not found`);
  const kode = pm.slice(s0 + '<script type="module">'.length, s1).replace(/^import \{[^}]*\} from "https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+";\r?\n/gm, "");
  if (/^\s*import\b/m.test(kode)) throw new Error(`${relative}: PROGRES-MODUL sandbox: unexpected import`);
  const HASH = "d".repeat(64), HASH2 = "a".repeat(64);   // hash rekaan, bukan PIN siapa pun
  const KATA = (p) => Array.from({ length: 35 }, (_, i) => p + i).join(" ");
  const SERVER = { fq1: KATA("satu"), fq2: KATA("dua"), fq3: KATA("tiga") };
  const alir = async () => { for (let i = 0; i < 6; i += 1) await new Promise((r) => setImmediate(r)); };
  const buat = (opsi = {}) => {
    let jam = 0, idT = 0, toastEl = null;
    const timer = [], panggilan = [], tertunda = [], tabDibuka = [], gagalSimpan = [], kabar = [];
    const kelas = () => { const s = new Set(); return { toggle: (k, v) => ((v === undefined ? !s.has(k) : v) ? s.add(k) : s.delete(k)), add: (...k) => k.forEach((x) => s.add(x)), remove: (...k) => k.forEach((x) => s.delete(x)), contains: (k) => s.has(k) }; };
    const kotak = [0, 1].map(() => {
      const input = { checked: false, disabled: true, ubah: null, addEventListener: (jenis, fn) => { if (jenis === "change") input.ubah = fn; } }, st = { textContent: "" };
      return { input, classList: kelas(), querySelector: (q) => (q === "input" ? input : st), scrollIntoView() {} };
    });
    const el = {};
    for (const t of ["tugas", "forum", "hasil"]) el["tab-" + t] = { classList: kelas(), setAttribute() {}, title: "" };
    for (const q of ["fq1", "fq2", "fq3"]) el["ans-" + q] = { value: "" };
    el["page-forum"] = { classList: kelas() };
    if (opsi.forumTerbuka) el["page-forum"].classList.add("active");
    const tombol = () => { const b = { disabled: false, textContent: "", klik: [], addEventListener: (jenis, fn) => { if (jenis === "click") b.klik.push(fn); } }; return b; };
    const document = {
      querySelectorAll: (q) => (q === ".pm-centang" ? kotak.slice() : []),
      getElementById: (id) => el[id] || null,
      createElement: () => {
        const e = { id: "", className: "", classList: kelas(), style: {}, innerHTML: "", textContent: "", tombol: {},
          querySelector: (q) => (e.tombol[q] = e.tombol[q] || tombol()), remove() { if (el[e.id] === e) delete el[e.id]; } };
        return e;
      },
      body: { appendChild: (e) => { if (e.id) el[e.id] = e; if (e.className === "pm-toast") toastEl = e; } },
    };
    const win = {
      MODUL_ID: "uji-modul-2", _sessionPinHash: HASH, _previewMode: false,
      getIdentityLocal: () => ({ nama: "UJI", nim: "41300000123", role: "student" }),
      switchTab(tab) { tabDibuka.push(tab); el["page-forum"].classList.toggle("active", tab === "forum"); },
      checkForumReady() { return true; }, _loadScoredQuestions() {},
      localStorage: { getItem: () => (opsi.bebasLokal === undefined ? null : String(opsi.bebasLokal)), setItem() {} }, location: { pathname: "/uji", reload() {} },
      console: { warn() {}, log() {}, error() {} }, document,
      setTimeout: (fn, ms) => { idT += 1; timer.push({ id: idT, at: jam + (Number(ms) || 0), fn }); return idT; },
      clearTimeout: (id) => { const i = timer.findIndex((t) => t.id === id); if (i >= 0) timer.splice(i, 1); },
      getApp: () => ({}), getFunctions: () => ({}),
      // Kait 'progres-modul:diterapkan' untuk PILIHAN-POLL-FORUM: keadaan tab Forum dan textarea saat dikirim.
      CustomEvent: function (jenis, init) { this.type = jenis; this.detail = init && init.detail; },
      dispatchEvent: (ev) => { kabar.push({ jenis: ev.type, ok: ev.detail && ev.detail.ok, progres: !!(ev.detail && ev.detail.progres), forumTerkunci: el["tab-forum"].classList.contains("pm-terkunci"), fq1: el["ans-fq1"].value }); return true; },
      httpsCallable: (fx, nama) => (data) => {
        panggilan.push({ nama, data: JSON.parse(JSON.stringify(data)), jam });
        if (nama === "saveModulForum") {
          if (gagalSimpan.length) { const e = new Error("gagal simpan"); e.code = gagalSimpan.shift(); return Promise.reject(e); }
          return Promise.resolve({ data: { forumSelesai: false } });
        }
        if (nama !== "getModulProgress") return Promise.resolve({ data: {} });
        return new Promise((res, rej) => tertunda.push({ res: (d) => res({ data: d }), rej }));
      },
    };
    win.window = win;
    vm.runInNewContext(kode, win);
    const majukan = async (ms) => {
      const akhir = jam + ms;
      for (;;) {
        await alir();
        timer.sort((x, y) => x.at - y.at || x.id - y.id);
        const t = timer[0];
        if (!t || t.at > akhir) break;
        timer.shift(); jam = t.at; t.fn();
      }
      jam = akhir; await alir();
    };
    const ketik = (q, v) => { el["ans-" + q].value = v; win.checkForumReady(); };
    return {
      win, el, panggilan, majukan, ketik, tabDibuka, gagalSimpan, kabar,
      simpan: () => panggilan.filter((p) => p.nama === "saveModulForum"),
      progres: () => panggilan.filter((p) => p.nama === "getModulProgress").length,
      terkunci: (t) => el["tab-" + t].classList.contains("pm-terkunci"),
      toast: () => (toastEl ? String(toastEl.textContent) : ""),
      centangKotak: async (i) => { const input = kotak[i].input; input.checked = true; input.ubah({ target: input }); await alir(); },
      jawab: async (d) => { const t = tertunda.shift(); if (!t) throw new Error(`${relative}: PROGRES-MODUL sandbox: no pending getModulProgress`); t.res(d); await alir(); },
      tolak: async (code, message, details) => { const t = tertunda.shift(); if (!t) throw new Error(`${relative}: PROGRES-MODUL sandbox: no pending getModulProgress`); const e = new Error(message || code); e.code = code; if (details) e.details = details; t.rej(e); await alir(); },
    };
  };
  const gagal = (skenario, pesan) => { throw new Error(`${relative}: PROGRES-MODUL sandbox (${skenario}): ${pesan}`); };
  const ringkas = (s) => JSON.stringify(s.simpan().map((p) => ["fq1", "fq2", "fq3"].map((q) => String((p.data.jawaban || {})[q] || "").split(" ").filter(Boolean).length).join("/")));
  const PRAS = { n: 1, centangLengkap: true, centang: 9, total: 9, tugasSelesai: true, soalDicoba: 15, totalSoal: 15, forumSelesai: false };
  const LENGKAP = { centang: 2, total: 2, akses: { boleh: true }, forum: SERVER, forumSelesai: true };
  const bukaForum = (s) => { const n = s.tabDibuka.length; s.win.switchTab("forum"); return s.tabDibuka.length > n && s.tabDibuka[s.tabDibuka.length - 1] === "forum"; };
  {
    // Cold start: pemicu checkForumReady lain (mis. _loadDraft) datang saat getModulProgress belum menjawab.
    const s = buat(), nama = "cold start";
    s.win._loadScoredQuestions();
    if (s.progres() !== 1) gagal(nama, "login harus memanggil getModulProgress");
    if (!s.terkunci("forum") || bukaForum(s)) gagal(nama, "the Forum tab must stay locked while getModulProgress is pending");
    s.win.checkForumReady(); await s.majukan(2000);
    s.ketik("fq1", "draf lokal"); await s.majukan(2000);
    s.ketik("fq1", ""); await s.majukan(2000);
    if (s.simpan().length) gagal(nama, `saveModulForum sent before getModulProgress was applied ${ringkas(s)}`);
    if (s.kabar.length) gagal(nama, "'progres-modul:diterapkan' dispatched before getModulProgress was applied");
    await s.jawab(LENGKAP);
    await s.majukan(5000);
    if (s.kabar.length !== 1 || s.kabar[0].jenis !== "progres-modul:diterapkan" || s.kabar[0].ok !== true || !s.kabar[0].progres || s.kabar[0].forumTerkunci || s.kabar[0].fq1 !== SERVER.fq1) {
      gagal(nama, `exactly one {ok:true, progres} must be dispatched after progress is applied (Forum tab open, textareas restored): ${JSON.stringify(s.kabar)}`);
    }
    if (["fq1", "fq2", "fq3"].some((q) => s.el["ans-" + q].value !== SERVER[q])) gagal(nama, "forum server harus dipulihkan ke textarea");
    if (s.simpan().length) gagal(nama, `server forum echoed back unchanged ${ringkas(s)}`);
    if (s.terkunci("forum") || !bukaForum(s)) gagal(nama, "the Forum tab must open once progress is applied");
    s.ketik("fq2", SERVER.fq2 + " tambahan"); await s.majukan(2000);
    const k = s.simpan();
    if (k.length !== 1 || k[0].data.jawaban.fq1 !== SERVER.fq1 || k[0].data.jawaban.fq2 !== SERVER.fq2 + " tambahan" || k[0].data.jawaban.fq3 !== SERVER.fq3) gagal(nama, `an edit after progress was applied must be sent once with all three answers ${ringkas(s)}`);
    s.win.checkForumReady(); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, "unchanged text must not be sent again");
    s.el["ans-fq1"].value = ""; s.el["ans-fq2"].value = ""; s.ketik("fq3", ""); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, `three empty answers must never be sent (they would wipe the server forum) ${ringkas(s)}`);
  }
  {
    // Mahasiswa baru: forum server kosong → tidak ada kiriman kosong; mengetik tetap terkirim.
    const s = buat(), nama = "mahasiswa baru";
    s.win._loadScoredQuestions();
    await s.jawab({ centang: 2, total: 2, akses: { boleh: true }, forum: {}, forumSelesai: false });
    s.win.checkForumReady(); await s.majukan(3000);
    if (s.simpan().length) gagal(nama, `three empty answers were sent ${ringkas(s)}`);
    s.ketik("fq1", "jawaban pertama saya"); await s.majukan(2000);
    if (s.simpan().length !== 1 || s.simpan()[0].data.jawaban.fq1 !== "jawaban pertama saya") gagal(nama, `typing after progress was applied must be sent ${ringkas(s)}`);
  }
  {
    // Galat sementara → berhenti tanpa kiriman, coba ulang 3 detik, lalu pulih tanpa gema.
    const s = buat(), nama = "gagal lalu pulih";
    s.win._loadScoredQuestions();
    await s.tolak("functions/unavailable", "UNAVAILABLE");
    if (JSON.stringify(s.kabar.map((k) => k.ok)) !== "[false]") gagal(nama, `a failed getModulProgress must dispatch {ok:false} once: ${JSON.stringify(s.kabar)}`);
    s.win.checkForumReady(); await s.majukan(1600);
    if (s.simpan().length || s.progres() !== 1) gagal(nama, `nothing may be sent while progress failed ${ringkas(s)}`);
    await s.majukan(1500);
    if (s.progres() !== 2) gagal(nama, "a transient getModulProgress error must be retried after 3 s");
    await s.jawab(LENGKAP);
    await s.majukan(5000);
    if (JSON.stringify(s.kabar.map((k) => k.ok)) !== "[false,true]" || s.kabar[1].forumTerkunci) gagal(nama, `the successful retry must dispatch {ok:true} with the Forum tab open: ${JSON.stringify(s.kabar)}`);
    if (s.simpan().length || s.el["ans-fq3"].value !== SERVER.fq3) gagal(nama, `after the retry the server forum must be restored without an echo ${ringkas(s)}`);
    s.ketik("fq3", "teks baru"); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, "typing after the retry must be sent");
  }
  {
    // Coba ulang habis (3/10/30 detik) → berhenti tanpa kiriman; tab Forum tetap terkunci dan
    // membukanya memuat ulang progres, sesudah itu suntingan terkirim.
    const s = buat(), nama = "coba ulang habis";
    s.win._loadScoredQuestions();
    for (const jeda of [3000, 10000, 30000]) { await s.tolak("functions/internal", "INTERNAL"); await s.majukan(jeda); }
    await s.tolak("functions/deadline-exceeded", "DEADLINE"); s.win.checkForumReady(); await s.majukan(120000);
    if (s.progres() !== 4 || s.simpan().length) gagal(nama, `expected 4 getModulProgress calls and no save (got ${s.progres()}, ${ringkas(s)})`);
    if (!s.terkunci("forum") || bukaForum(s)) gagal(nama, "the Forum tab must stay locked while progress failed");
    if (s.progres() !== 5) gagal(nama, "opening the locked Forum tab after the retries ran out must load progress again");
    await s.jawab(LENGKAP); await s.majukan(5000);
    if (s.terkunci("forum") || !bukaForum(s) || s.simpan().length) gagal(nama, `after progress loads the Forum tab must open without an echo ${ringkas(s)}`);
    s.ketik("fq1", SERVER.fq1 + " revisi"); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, "an edit after the recovery must be sent");
  }
  {
    // Progres gagal, lalu semua bagian dicentang (setModulCentang sukses): tab Forum tidak terbuka
    // tanpa progres; centang yang dijawab server memuat ulang progres, lalu jawaban terkirim.
    const s = buat(), nama = "gagal lalu centang lengkap";
    s.win._loadScoredQuestions();
    for (const jeda of [3000, 10000, 30000]) { await s.tolak("functions/unavailable", "UNAVAILABLE"); await s.majukan(jeda); }
    await s.tolak("functions/internal", "INTERNAL"); await s.majukan(60000);
    if (s.progres() !== 4) gagal(nama, `expected 4 getModulProgress calls (got ${s.progres()})`);
    await s.centangKotak(0); await s.centangKotak(1);
    if (s.panggilan.filter((p) => p.nama === "setModulCentang").length !== 2 || s.terkunci("tugas")) gagal(nama, "ticking every section must unlock Tugas");
    if (s.progres() !== 5) gagal(nama, "a tick answered by the server must load progress again while progress failed");
    if (!s.terkunci("forum") || bukaForum(s)) gagal(nama, "the Forum tab must stay locked until progress is applied, even with every section ticked");
    await s.jawab({ centang: 2, total: 2, akses: { boleh: true }, forum: {}, forumSelesai: false }); await s.majukan(3000);
    if (s.terkunci("forum") || !bukaForum(s) || s.simpan().length) gagal(nama, `the Forum tab must open after progress is applied, without sending empty answers ${ringkas(s)}`);
    s.ketik("fq1", KATA("baru")); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, `typing after the recovery must be sent ${ringkas(s)}`);
  }
  {
    // Penguncian PIN: tanpa coba ulang otomatis; tab Forum baru memuat ulang sesudah masa kunci.
    const s = buat(), nama = "PIN terkunci";
    s.win._loadScoredQuestions();
    await s.tolak("functions/resource-exhausted", "Terlalu banyak percobaan PIN. Coba lagi dalam 42 detik.", { remainingSeconds: 42 });
    s.win.checkForumReady(); await s.majukan(5000);
    if (bukaForum(s) || s.progres() !== 1 || s.simpan().length) gagal(nama, `must not retry nor save during the PIN lock (got ${s.progres()} getModulProgress, ${ringkas(s)})`);
    if (s.win._sessionPinHash !== HASH) gagal(nama, "resource-exhausted must keep the session PIN hash");
    await s.majukan(40000);
    if (bukaForum(s) || s.progres() !== 2) gagal(nama, "after the PIN lock, opening the Forum tab must load progress again");
  }
  {
    // Sesi PIN tidak berlaku: tanpa coba ulang (hash basi = percobaan PIN salah), hash sesi tidak
    // disentuh (JAWABAN-PRIVAT yang meminta PIN ulang); PIN baru memuat ulang progres.
    const s = buat(), nama = "sesi PIN tidak berlaku";
    s.win._loadScoredQuestions();
    await s.tolak("functions/unauthenticated", "PIN salah, silakan login ulang");
    s.win.checkForumReady(); await s.majukan(20000);
    if (bukaForum(s)) gagal(nama, "the Forum tab must stay locked");
    await s.majukan(120000);
    if (s.progres() !== 1 || s.simpan().length) gagal(nama, `must not retry nor save (got ${s.progres()} getModulProgress, ${ringkas(s)})`);
    if (s.win._sessionPinHash !== HASH) gagal(nama, "the progress guard must not drop the session PIN hash (JAWABAN-PRIVAT shows the PIN prompt and clears sessionStorage)");
    s.win._sessionPinHash = HASH2; s.win._loadScoredQuestions();
    if (s.progres() !== 2) gagal(nama, "a new PIN session must load progress again");
    await s.jawab(LENGKAP); await s.majukan(3000);
    if (s.terkunci("forum") || s.simpan().length) gagal(nama, `after the new PIN the Forum tab must open without an echo ${ringkas(s)}`);
  }
  {
    // Galat sesi lama (PIN diganti selama getModulProgress lama tertunda) tidak mengganggu sesi baru.
    const s = buat(), nama = "galat sesi lama";
    s.win._loadScoredQuestions();
    s.win._sessionPinHash = HASH2; s.win._loadScoredQuestions();
    await s.tolak("functions/unauthenticated", "PIN salah, silakan login ulang");
    if (s.win._sessionPinHash !== HASH2) gagal(nama, "a stale unauthenticated error must not drop the new session PIN hash");
    await s.jawab(LENGKAP); await s.majukan(3000);
    if (s.terkunci("forum")) gagal(nama, "a stale error must not keep the new session from becoming ready");
    s.ketik("fq3", SERVER.fq3 + " revisi"); await s.majukan(2000);
    if (s.simpan().length !== 1 || s.simpan()[0].data.pinHash !== HASH2) gagal(nama, `an edit must be sent with the new session ${ringkas(s)}`);
  }
  {
    // PIN diminta ulang di halaman yang sama (NIM sama): tab Forum tidak dikunci lagi, dan suntingan
    // yang belum terkirim selama hash kosong dikirim sesudah progres sesi baru diterapkan.
    const s = buat(), nama = "PIN ulang di halaman yang sama";
    s.win._loadScoredQuestions();
    await s.jawab(LENGKAP); await s.majukan(3000);
    s.win._sessionPinHash = null;
    s.ketik("fq2", SERVER.fq2 + " revisi"); await s.majukan(3000);
    if (s.simpan().length) gagal(nama, "nothing can be sent without a PIN session");
    s.win._sessionPinHash = HASH2; s.win._loadScoredQuestions();
    if (s.progres() !== 2 || s.terkunci("forum")) gagal(nama, "a new PIN for the same NIM must reload progress without locking the Forum tab again");
    await s.jawab(LENGKAP); await s.majukan(2000);
    const k = s.simpan();
    if (k.length !== 1 || k[0].data.jawaban.fq2 !== SERVER.fq2 + " revisi" || k[0].data.pinHash !== HASH2) gagal(nama, `the unsent edit must be sent once after progress is applied ${ringkas(s)}`);
  }
  {
    // Jendela sebelum muatProgres (overlay login sudah tertutup, _loadScoredQuestions belum jalan).
    const s = buat(), nama = "jendela sebelum muatProgres";
    if (!s.terkunci("forum") || bukaForum(s)) gagal(nama, "the Forum tab must be locked for a student before progress is loaded");
    if (s.progres() !== 1) gagal(nama, "opening the Forum tab before muatProgres must load progress");
    await s.jawab(LENGKAP); await s.majukan(3000);
    if (s.terkunci("forum") || !bukaForum(s) || s.simpan().length) gagal(nama, `the Forum tab must open after progress is applied ${ringkas(s)}`);
  }
  {
    // Hitungan centang mode bebas (dosen/Preview) di localStorage tidak membuka tab mahasiswa.
    const s = buat({ bebasLokal: 2 }), nama = "centang mode bebas di localStorage";
    s.win._loadScoredQuestions();
    if (!s.terkunci("tugas") || !s.terkunci("forum") || bukaForum(s)) gagal(nama, "a free-mode tick count must not unlock a student's tabs while progress loads");
    await s.jawab({ centang: 0, total: 2, akses: { boleh: true }, forum: SERVER, forumSelesai: true }); await s.majukan(3000);
    if (!s.terkunci("forum") || s.simpan().length) gagal(nama, `the server tick count (0/2) must keep the tabs locked ${ringkas(s)}`);
  }
  {
    // Tab Forum yang terlanjur terbuka ditutup sampai forum server diterapkan.
    const s = buat({ forumTerbuka: true }), nama = "Forum yang terlanjur terbuka";
    if (s.el["page-forum"].classList.contains("active") || s.tabDibuka[s.tabDibuka.length - 1] !== "modul") gagal(nama, "an open Forum page must be closed while progress is not applied");
  }
  {
    // Kiriman forum gagal: diberitahukan, galat sementara dicoba ulang dengan isi terbaru.
    const s = buat(), nama = "kiriman forum gagal";
    s.win._loadScoredQuestions();
    await s.jawab(LENGKAP); await s.majukan(3000);
    s.gagalSimpan.push("functions/unavailable");
    s.ketik("fq1", SERVER.fq1 + " revisi"); await s.majukan(2000);
    if (s.simpan().length !== 1 || !/belum tersimpan/i.test(s.toast())) gagal(nama, "a failed forum save must be reported to the student");
    await s.majukan(3000);
    if (s.simpan().length !== 2 || s.simpan()[1].data.jawaban.fq1 !== SERVER.fq1 + " revisi") gagal(nama, `a transient save failure must be retried after 3 s ${ringkas(s)}`);
    await s.majukan(60000);
    if (s.simpan().length !== 2) gagal(nama, `a successful retry must not be followed by more saves ${ringkas(s)}`);
    s.gagalSimpan.push("functions/unauthenticated");
    s.ketik("fq1", SERVER.fq1 + " revisi dua"); await s.majukan(60000);
    if (s.simpan().length !== 3) gagal(nama, `an unauthenticated save failure must not be retried automatically ${ringkas(s)}`);
  }
  {
    // Akses ditolak (overlay prasyarat): modul ini tidak pernah mengirim forum.
    const s = buat(), nama = "akses ditolak";
    s.win._loadScoredQuestions();
    await s.jawab({ centang: 0, total: 2, akses: { boleh: false, prasyarat: PRAS }, forum: SERVER, forumSelesai: true });
    if (!s.el.pmKunci) gagal(nama, "the prerequisite overlay must be shown");
    if (s.kabar.length) gagal(nama, `denied access must not dispatch 'progres-modul:diterapkan': ${JSON.stringify(s.kabar)}`);
    s.win.checkForumReady(); await s.majukan(3000);
    s.ketik("fq1", "teks"); await s.majukan(60000);
    if (s.simpan().length) gagal(nama, `a locked module sent saveModulForum ${ringkas(s)}`);
    // "Periksa lagi" sukses: overlay ditutup, progres diterapkan, lalu kiriman berjalan normal.
    const periksa = s.el.pmKunci.tombol["#pmPeriksa"];
    if (!periksa || periksa.klik.length !== 1) gagal(nama, "the overlay must offer Periksa lagi");
    s.ketik("fq1", "");
    periksa.klik[0]();
    if (s.progres() !== 2) gagal(nama, "Periksa lagi must ask getModulProgress again");
    await s.jawab(LENGKAP);
    await s.majukan(5000);
    if (s.el.pmKunci || s.simpan().length || s.el["ans-fq2"].value !== SERVER.fq2) gagal(nama, `after Periksa lagi the overlay must close and the server forum be restored without an echo ${ringkas(s)}`);
    if (JSON.stringify(s.kabar.map((k) => k.ok)) !== "[true]") gagal(nama, `Periksa lagi must dispatch {ok:true} once: ${JSON.stringify(s.kabar)}`);
    s.ketik("fq2", SERVER.fq2 + " revisi"); await s.majukan(2000);
    if (s.simpan().length !== 1) gagal(nama, "after Periksa lagi an edit must be sent");
  }
}
/**
 * Uji mutasi periksaPenjagaForum: tiap salinan rusak harus ditolak, halaman
 * aslinya lolos (dicek lewat perulangan halaman di atas). Kecuali kasus "satu
 * byte", pembanding antarhalaman dimatikan supaya yang menolak adalah
 * pemeriksaan kait atau sandbox, bukan sekadar "berbeda dari halaman lain".
 * PENJAGA_FORUM_MUTASI=1 mencetak alasan penolakan tiap kasus.
 */
async function ujiMutasiPenjagaForum() {
  const relative = "Pemodelan-Computer-Aided-Design/Modul/Modul-2.html";
  const modul = fs.readFileSync(path.join(root, relative), "utf8");
  const CFR = "if (typeof window.checkForumReady === 'function') try { window.checkForumReady(); } catch (e) {}\n";
  const kasus = [
    ["buang penjaga di simpanForum", [["\n    if (!bolehKirimForum(j)) return;\n", "\n"]]],
    ["buang forumSiap", [["\n    forumSiap(p);\n    centang =", "\n    centang ="]]],
    ["forumSiap sesudah checkForumReady", [["\n    forumSiap(p);\n    centang =", "\n    centang ="], [CFR, CFR + "      forumSiap(p);\n"]]],
    ["buang forumDitolak", [["{ forumDitolak(); tampilkanKunci(p.akses.prasyarat); return; }", "{ tampilkanKunci(p.akses.prasyarat); return; }"]]],
    ["buang forumGagal", [["\n      forumGagal(e, d);\n", "\n"]]],
    ["buang mulaiMuatForum", [["\n    mulaiMuatForum();\n", "\n"]]],
    ["baseline direset ke ''", [["\n  var forumTimer = null;\n", "\n  var forumTimer = null, forumTerakhir = '';\n"]]],
    ["penjaga selalu mengizinkan", [["function bolehKirimForum(j) { return statusForum === 'siap' && ", "function bolehKirimForum(j) { return true || "]]],
    ["tiga jawaban kosong boleh", [["&& !!(j.fq1.trim() || j.fq2.trim() || j.fq3.trim()); }", "&& true; }"]]],
    ["siap tanpa baseline server", [["forumTerakhir = JSON.stringify({ fq1: t(f.fq1), fq2: t(f.fq2), fq3: t(f.fq3) });", "forumTerakhir = '';"]]],
    ["PIN terkunci tanpa jeda", [["\n    if (k === 'resource-exhausted') {\n", "\n    if (false) {\n"]]],
    ["tanpa coba ulang", [["timerUlangForum = setTimeout(function () { timerUlangForum = null; try { muatProgres(); } catch (x) {} }", "timerUlangForum = setTimeout(function () { timerUlangForum = null; }"]]],
    ["hash PIN dibuang di forumGagal", [["\n      tahanForum(0);\n", "\n      tahanForum(0); window._sessionPinHash = null;\n"]]],
    ["sesi PIN tidak berlaku dicoba ulang", [["\n      tahanForum(0);\n", "\n      tahanForum(15000);\n"]]],
    ["galat sesi lama tidak diabaikan", [[" || (d && d.nim + '|' + d.pinHash !== sesiForum)", ""]]],
    ["PIN baru untuk NIM sama mengulang penantian", [["if (nimSama && statusForum === 'siap') return;", "if (false) return;"]]],
    ["tab Forum tidak dikunci", [["var k = kunci || (t === 'forum' && tahan);", "var k = kunci;"]]],
    ["switchTab Forum tidak ditahan", [["if (kunciCentang || (tab === 'forum' && forumTertahan())) {", "if (kunciCentang) {"]]],
    ["tab terkunci tanpa coba ulang", [["\n        var ulang = forumCobaLagi();\n", "\n        var ulang = false;\n"]]],
    ["centang tanpa coba ulang", [["render(); forumCobaLagi(); });", "render(); });"]]],
    ["centang mode bebas dipakai mahasiswa", [["\n    if (bebas) { bebas = false; centang = 0; }\n", "\n    bebas = false;\n"]]],
    ["Forum terbuka tidak ditutup", [["if (tahan && pf && pf.classList.contains('active')", "if (false && pf && pf.classList.contains('active')"]]],
    ["suntingan tertunda tidak dikirim", [["    // baseline tidak dikirim.\n    if (typeof window.checkForumReady === 'function') try { window.checkForumReady(); } catch (e) {}\n", "    // baseline tidak dikirim.\n"]]],
    ["kiriman gagal tanpa coba ulang", [["if (ulang) { clearTimeout(forumTimer);", "if (false) { clearTimeout(forumTimer);"]]],
    ["saveModulForum kedua tanpa penjaga", [["\n  var forumAsli = window.checkForumReady;\n", "\n  window.__kirimLangsung = function () { panggil('saveModulForum', dasar()); };\n  var forumAsli = window.checkForumReady;\n"]]],
    ["saveModulForum di luar PROGRES-MODUL", [[PF_AKHIR, PF_AKHIR + "\n<script>/* saveModulForum */</script>"]]],
    ["poll-saja lewat saveModulForum di PILIHAN-POLL-FORUM", [["panggil('saveModulPoll', {", "panggil('saveModulForum', {"]]],
    ["kait ok:true sebelum tab Forum terbuka dan textarea terisi", [["\n    kabarkan({ ok: true, progres: p });\n", "\n"], ["\n    forumSiap(p);\n    centang =", "\n    forumSiap(p);\n    kabarkan({ ok: true, progres: p });\n    centang ="]]],
    ["kait ok:false hilang", [["\n      kabarkan({ ok: false });\n", "\n"]]],
    ["tanpa sub-blok", [["  // PROGRES-MODUL:PENJAGA-FORUM BEGIN v1", "  // PROGRES-MODUL:PENJAGA-FORUM-LAMA BEGIN v1"]]],
    ["satu byte sub-blok berbeda", [["'gagal' (galat sementara dicoba ulang 3/10/30 dtk).", "'gagal' (galat sementara dicoba ulang 3/10/30 dtk)!"]], true],
  ];
  for (const [nama, ganti, bandingkan] of kasus) {
    let salinan = modul;
    for (const [asli, rusak] of ganti) {
      if (!salinan.includes(asli)) throw new Error(`${relative}: PENJAGA-FORUM mutation test anchor not found (${nama})`);
      salinan = salinan.replace(asli, () => rusak);
    }
    const simpan = { acuan: penjagaForum.acuan, acuanDari: penjagaForum.acuanDari, halaman: penjagaForum.halaman };
    if (!bandingkan) penjagaForum.acuan = null;
    let alasan = null;
    try { await periksaPenjagaForum(salinan, relative + " [mutasi]"); } catch (e) { alasan = e.message; }
    Object.assign(penjagaForum, simpan);
    if (!alasan) throw new Error(`${relative}: PENJAGA-FORUM check accepted a mutated page (${nama})`);
    if (process.env.PENJAGA_FORUM_MUTASI) console.log(`mutasi "${nama}" ditolak: ${alasan}`);
  }
}
/** Elemen teratas sebuah potongan HTML (tanpa parser DOM): atributnya terbaca lewat getAttribute. */
const TAG_KOSONG = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
function anakTeratas(html) {
  const anak = [];
  let dalam = 0;
  for (const [, tutup, tag, atr] of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    if (tutup) { dalam -= 1; continue; }
    if (dalam === 0) {
      const atribut = new Map([...atr.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((a) => [a[1].toLowerCase(), a[2] ?? a[3]]));
      anak.push({ tagName: tag.toUpperCase(), getAttribute: (n) => (atribut.has(n) ? atribut.get(n) : null) });
    }
    if (!TAG_KOSONG.has(tag.toLowerCase()) && !/\/\s*$/.test(atr)) dalam += 1;
  }
  return anak;
}
/** Jalankan renderVisitors/updateLeaderboard halaman di sandbox; kembalikan isi DOM tiruan. */
function simulasiHasilUjian(exam, relative) {
  const kode = [
    ambilFungsi(exam, "function renderVisitors(visitors){", relative),
    ambilFungsi(exam, "function updateLeaderboard(visitors, schedExpired){", relative),
    ambilBlok(exam, "// ═══ ASISTEN-UJIAN-MAHASISWA:JS BEGIN", "// ═══ ASISTEN-UJIAN-MAHASISWA:JS END", relative),
    ambilBlok(exam, "// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN", "// ═══ PRIVASI-HASIL-UJIAN:JS END", relative),
  ].join("\n");
  const el = {};
  const buat = (id, isi = {}) => (el[id] = { id, innerHTML: "", textContent: "", style: { display: "" }, ...isi });
  for (const id of ["leaderboardPanel", "fabCount", "vpBadge", "statLate", "vpList", "rajinList", "santaiList", "statTotalMhs", "statHadir", "statAbsen"]) buat(id);
  const judul = buat("(judul tabel)", { textContent: "No Nama NIM Status Poin (Nilai) Kunjungan Waktu Akses", style: { display: "flex" } });
  // #visitorTableBody meniru DOM sungguhan: innerHTML menentukan anak
  // teratasnya (childElementCount, firstElementChild.getAttribute), sehingga
  // pemeriksaan "kartu sudah terpasang" _tampilkanHasilTanpaDataKelas ikut
  // teruji (tamu→Preview harus mengganti ajakan). tulis menghitung penulisan.
  const tabel = buat("visitorTableBody", { previousElementSibling: judul, tulis: 0 });
  let isiTabel = "";
  Object.defineProperties(tabel, {
    innerHTML: { enumerable: true, get: () => isiTabel, set: (v) => { isiTabel = String(v); tabel.tulis += 1; } },
    childElementCount: { get: () => anakTeratas(isiTabel).length },
    firstElementChild: { get: () => anakTeratas(isiTabel)[0] || null },
  });
  const now = Date.now();
  const ts = new Date(now - 20 * 60000).toISOString();
  const visitors = [...DATA_UJI.peers, DATA_UJI.student].map((p) => ({ role: "student", timestamp: ts, lastVisit: ts, points: 0, visitCount: 1, ...p }));
  const presence = Object.fromEntries(DATA_UJI.peers.map((p) => [`mhs_${p.nim}`, { nim: p.nim, nama: p.nama, role: "student", lastSeen: now }]));
  const konteks = {
    identitas: null,
    window: { _previewMode: false },
    document: { getElementById: (id) => el[id] || null },
    console: { warn() {}, log() {}, error() {} },
    getIdentity: () => konteks.identitas,
    isSimulasiNim: () => false,
    isLate: () => false,
    pointsToScore: (p) => p,
    formatPoints: (p) => String(p),
    escH: (s) => String(s == null ? "" : s),
    masterStudents: [...DATA_UJI.peers, DATA_UJI.student, { nim: "41300000099", nama: "ROSTER ONLY" }].map(({ nim, nama }) => ({ nim, nama })),
    masterFetchDone: true,
    onlinePresence: presence,
    ONLINE_THRESHOLD_MS: 45000,
    currentSchedule: null,
    latestVisitors: visitors,
  };
  vm.createContext(konteks);
  try { vm.runInContext(kode, konteks, { filename: `${relative}#hasil-kelas` }); }
  catch (e) { throw new Error(`${relative}: renderVisitors/updateLeaderboard could not be loaded into the class-data sandbox: ${e.message}`); }
  const isiDom = () => Object.values(el).map((e) => `${e.innerHTML}\n${e.textContent}`).join("\n");
  const jalankan = (kodeJalan, label) => {
    try { vm.runInContext(kodeJalan, konteks); }
    catch (e) { throw new Error(`${relative}: class-data sandbox (${label}) threw ${e.message}; update simulasiHasilUjian if the page gained new dependencies`); }
  };
  return { el, konteks, isiDom, jalankan };
}
const IDENTITAS_DOSEN = { nama: "Dedik Romahadi", nim: "DOSEN", role: "dosen" };
let examPrivasiHasil = 0;
for (const course of courseRoots) {
  for (const examName of ["UTS.html", "UAS.html"]) {
    const relative = `${course}/Exam/${examName}`;
    const exam = fs.readFileSync(path.join(root, relative), "utf8");
    for (const required of [
      "// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN",
      "  // PRIVASI-HASIL-UJIAN:PERAN BEGIN",
      "  // PRIVASI-HASIL-UJIAN:PREVIEW BEGIN",
      "  // PRIVASI-HASIL-UJIAN:RENDER BEGIN",
      "  // PRIVASI-HASIL-UJIAN:LEADERBOARD BEGIN",
      "function _dosenUjianTerverifikasi(me) {\n",
      "  return !!(me && me.role === 'dosen' && typeof me.nama === 'string' && me.nama.toLowerCase() === 'dedik romahadi');\n",
      "function _dataKelasUjianBoleh() {\n  // Mode Preview tidak pernah melihat data kelas, apa pun identitas yang\n  // kebetulan tersimpan di localStorage.\n  if (window._previewMode) return false;\n",
      "  _kosongkanRosterUjian();          // daftar online, badge, jumlah (buka-asisten-ujian.mjs)\n  _kosongkanPapanKelasUjian();\n",
      "      // PRIVASI-HASIL-UJIAN:AUTOLOGIN BEGIN",
      "      // PRIVASI-HASIL-UJIAN:PEMILIH BEGIN",
      "  // PRIVASI-HASIL-UJIAN:SOAL-DOSEN BEGIN",
      "      // PRIVASI-HASIL-UJIAN:MASTER BEGIN",
      "    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL BEGIN",
      "  // PRIVASI-HASIL-UJIAN:MUAT-SOAL BEGIN",
      "function _identitasUjianDikenal(me) {\n",
      // Kartu tamu yang sudah terpasang diganti begitu masuk Mode Preview.
      "&& kartu.getAttribute('data-ajakan') === ajakan",
      PLACEHOLDER_AWAL,
      AJAKAN_TAMU,
      AJAKAN_PREVIEW,
    ]) {
      if (!exam.includes(required)) throw new Error(`${relative}: lecturer-only class data gate missing ${required.split("\n")[0]}`);
    }
    // Ajakan Mode Preview menunjuk tombol banner yang memang ada di halaman.
    if (!exam.includes('<button onclick="exitPreviewMode()"') || !exam.includes(">Keluar Preview</button>")) {
      throw new Error(`${relative}: the Mode Preview placeholder points to the banner's "Keluar Preview" button, which is missing`);
    }

    // SATU aturan dosen untuk seluruh halaman (lanjutan 26 September 2026).
    // Auto-login jadwal dulu memakai `me.nama.toLowerCase() === 'dedik romahadi'`
    // (nama saja, tanpa role) untuk melewati gerbang jam mulai; identitas
    // format lama {nama:'Dedik Romahadi'} atau {role:'dosen'} bernama lain jadi
    // setengah-login. Perbandingan nama dosen kini hanya boleh ada di
    // _dosenUjianTerverifikasi.
    {
      const aturanDosen = ambilFungsi(exam, "function _dosenUjianTerverifikasi(me) {", relative);
      const sisa = exam.replace(aturanDosen, "");
      const nama = /toLowerCase\(\)\s*===?\s*['"]dedik romahadi['"]/i.exec(sisa);
      if (nama) throw new Error(`${relative}: lecturer name comparison outside _dosenUjianTerverifikasi (one lecturer rule for the page): …${sisa.slice(Math.max(0, nama.index - 60), nama.index + 40).replace(/\n/g, "⏎")}…`);
      const jadwal = ambilFungsi(exam, "function _handleScheduleReady() {", relative);
      if (!jadwal.includes("\n      const _isDosen = _dosenUjianTerverifikasi(me);\n      if (!_identitasUjianDikenal(me)) return;\n") || (jadwal.match(/_isDosen\s*=/g) || []).length !== 1) {
        throw new Error(`${relative}: _handleScheduleReady auto-login must take _isDosen from _dosenUjianTerverifikasi and skip identities that are neither the verified lecturer nor a student`);
      }
      const soal = ambilFungsi(exam, "async function _activateDosenQuestionView() {", relative);
      const pertamaSoal = soal.split("\n").slice(2).find((b) => b.trim() && !b.trim().startsWith("//"));
      if (pertamaSoal !== "  if (!_dosenUjianTerverifikasi(me)) return;") {
        throw new Error(`${relative}: _activateDosenQuestionView must be gated by _dosenUjianTerverifikasi, found: ${pertamaSoal}`);
      }
      // Penjaga yang MEMBATASI (soal hanya-baca, ekspor mati) sengaja tetap
      // berbasis role: identitas {role:'dosen'} apa pun tidak bisa menjawab.
      if ((exam.match(/\n  const isDosenView = !!\(me && me\.role === 'dosen'\);\n  if \(!window\._previewMode && !isDosenView\) return false;\n/g) || []).length !== 2) {
        throw new Error(`${relative}: _previewGuard/_previewExportGuard must stay role-based (read-only for any 'dosen' identity)`);
      }
      // Gerbang wadah soal dan permintaan soal mode dosen juga MEMBUKA fitur
      // dosen, jadi memakai aturan tunggal (GERBANG-SOAL, MUAT-SOAL). Selain
      // kedua penjaga di atas, tidak ada variabel isDosen* yang diambil dari
      // `role === 'dosen'` saja.
      const jenis = examName.slice(0, 3);
      const gerbangSoal = ambilFungsi(exam, `function _update${jenis}AccessGate() {`, relative);
      if ((gerbangSoal.match(/\bisDosen\s*=/g) || []).length !== 1 || !gerbangSoal.includes("\n    const isDosen = _dosenUjianTerverifikasi(me);\n    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL END")) {
        throw new Error(`${relative}: _update${jenis}AccessGate must take isDosen from _dosenUjianTerverifikasi (PRIVASI-HASIL-UJIAN:GERBANG-SOAL)`);
      }
      const muatSoal = ambilFungsi(exam, `async function _ensure${jenis}QuestionsLoaded() {`, relative);
      if ((muatSoal.match(/\bisDosenNow\s*=/g) || []).length !== 1 || !muatSoal.includes("\n  const isDosenNow = _dosenUjianTerverifikasi(me);\n  // PRIVASI-HASIL-UJIAN:MUAT-SOAL END")) {
        throw new Error(`${relative}: _ensure${jenis}QuestionsLoaded must take isDosenNow from _dosenUjianTerverifikasi (PRIVASI-HASIL-UJIAN:MUAT-SOAL)`);
      }
      for (const m of exam.replace(RX_BLOK_AI, "").matchAll(/\b(_?isDosen\w*)\s*=\s*[^;\n]*\brole\s*===?\s*['"]dosen['"]/g)) {
        if (m[1] !== "isDosenView") throw new Error(`${relative}: ${m[1]} is taken from role === 'dosen' alone; anything that opens a lecturer feature must use _dosenUjianTerverifikasi`);
      }
      // Perilaku blok halaman itu sendiri untuk identitas asli, lama, dan rekaan.
      const blok = (awal, akhir) => ambilBlok(exam, awal, akhir, relative);
      const kodeAturan = ambilBlok(exam, "// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN", "// ═══ PRIVASI-HASIL-UJIAN:JS END", relative);
      const ctx = vm.createContext({ window: {}, document: { getElementById: () => null }, console: { warn() {} } });
      vm.runInContext(kodeAturan, ctx, { filename: `${relative}#aturan-dosen` });
      const autologin = vm.runInContext(`(function (me) {\n${blok("      // PRIVASI-HASIL-UJIAN:AUTOLOGIN BEGIN", "      // PRIVASI-HASIL-UJIAN:AUTOLOGIN END")}      return { isDosen: _isDosen };\n})`, ctx);
      const pemilih = vm.runInContext(`(function (_me) {\n${blok("      // PRIVASI-HASIL-UJIAN:PEMILIH BEGIN", "      // PRIVASI-HASIL-UJIAN:PEMILIH END")}      return 'sembunyikan-bila-perlu';\n})`, ctx);
      const tinjauSoal = vm.runInContext(`(function (me) {\n${blok("  // PRIVASI-HASIL-UJIAN:SOAL-DOSEN BEGIN", "  // PRIVASI-HASIL-UJIAN:SOAL-DOSEN END")}  return 'aktif';\n})`, ctx);
      const wadahSoal = vm.runInContext(`(function (me) {\n${blok("    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL BEGIN", "    // PRIVASI-HASIL-UJIAN:GERBANG-SOAL END")}    return isDosen;\n})`, ctx);
      const soalModeDosen = vm.runInContext(`(function (me) {\n${blok("  // PRIVASI-HASIL-UJIAN:MUAT-SOAL BEGIN", "  // PRIVASI-HASIL-UJIAN:MUAT-SOAL END")}  return isDosenNow;\n})`, ctx);
      const mhs = { nama: DATA_UJI.student.nama, nim: DATA_UJI.student.nim, role: "student" };
      for (const [label, me, dosen, dikenal] of [
        ["real lecturer", IDENTITAS_DOSEN, true, true],
        ["lecturer name in capitals", { ...IDENTITAS_DOSEN, nama: "DEDIK ROMAHADI" }, true, true],
        ["student", mhs, false, true],
        ["legacy student without role", { nama: mhs.nama, nim: mhs.nim }, false, true],
        ["legacy lecturer identity without role", { nama: "Dedik Romahadi" }, false, false],
        ["role-less identity with a NIM (a student everywhere on the page)", { nama: "Dedik Romahadi", nim: "DOSEN" }, false, true],
        ["crafted dosen with another name", { role: "dosen", nama: "X" }, false, false],
        ["crafted dosen with a student's NIM", { role: "dosen", nama: mhs.nama, nim: mhs.nim }, false, false],
        ["lecturer name with student role, no NIM", { nama: "Dedik Romahadi", role: "student" }, false, false],
      ]) {
        const a = autologin(me);
        if (dikenal ? !(a && a.isDosen === dosen) : a !== undefined) {
          throw new Error(`${relative}: auto-login for ${label} ${JSON.stringify(me)} should ${dikenal ? `restore the session with _isDosen=${dosen}` : "not restore the session"}, got ${JSON.stringify(a)}`);
        }
        if ((pemilih(me) === undefined) === dikenal) throw new Error(`${relative}: role picker for ${label} should ${dikenal ? "be skippable" : "stay visible"}`);
        if ((tinjauSoal(me) === "aktif") !== dosen) throw new Error(`${relative}: lecturer question view for ${label} should ${dosen ? "" : "not "}activate`);
        if (wadahSoal(me) !== dosen) throw new Error(`${relative}: question-container gate for ${label} should ${dosen ? "" : "not "}treat it as the lecturer`);
        if (soalModeDosen(me) !== dosen) throw new Error(`${relative}: lecturer-mode question fetch for ${label} should ${dosen ? "" : "not "}be sent`);
      }
    }

    // "Jumlah Absen" dosen sesudah roster dimuat: fetchMasterStudents dulu
    // memanggil updateLeaderboard kedua kali dengan variabel jadwal-berakhir
    // yang tidak pernah didefinisikan (selalu false), menimpa statistik benar
    // dari renderVisitors.
    if (exam.includes("_scheduleExpired")) throw new Error(`${relative}: undefined _scheduleExpired is used again (lecturer Absen stats go stale after the roster loads)`);
    if ((exam.match(/updateLeaderboard\(/g) || []).length !== 2) {
      throw new Error(`${relative}: updateLeaderboard must only be defined once and called once (from renderVisitors, with schedExpired from the current schedule)`);
    }

    // _applyRoleVisibility memakai aturan dosen yang sama dan merender ulang
    // tab Hasil begitu peran berubah (login dosen dari layar tamu/Preview).
    const peran = ambilFungsi(exam, "function _applyRoleVisibility() {", relative);
    if (!peran.includes("\n  const isDosen = _dosenUjianTerverifikasi(me);") || /toLowerCase\(\) === 'dedik romahadi'/.test(peran)) {
      throw new Error(`${relative}: _applyRoleVisibility must take isDosen from _dosenUjianTerverifikasi (one lecturer rule for the page)`);
    }
    if (!/\n  _segarkanHasilUjian\(\);\n  \/\/ PRIVASI-HASIL-UJIAN:PERAN END[^\n]*\n\}\n$/.test(peran)) {
      throw new Error(`${relative}: _applyRoleVisibility must end by re-rendering the Hasil tab (_segarkanHasilUjian) so a lecturer login shows class data at once`);
    }

    // enterPreviewMode merender ulang tepat sesudah flag Preview dinyalakan:
    // data kelas yang sudah dirender untuk identitas dosen tersimpan dibuang
    // seketika, bukan pada event RTDB berikutnya atau interval 30 detik.
    const AWAL_PREVIEW = "window.enterPreviewMode = async function() {\n  await signOut(_auth).catch(() => {});\n  window._previewMode = true;\n  // PRIVASI-HASIL-UJIAN:PREVIEW BEGIN";
    if (exam.split(AWAL_PREVIEW).length !== 2) {
      throw new Error(`${relative}: enterPreviewMode must re-render the Hasil tab right after window._previewMode = true (PRIVASI-HASIL-UJIAN:PREVIEW)`);
    }
    const blokPreview = ambilBlok(exam, "  // PRIVASI-HASIL-UJIAN:PREVIEW BEGIN", "  // PRIVASI-HASIL-UJIAN:PREVIEW END", relative);
    const kodePreview = blokPreview.split("\n").filter((b) => b.trim() && !b.trim().startsWith("//"));
    if (kodePreview.length !== 1 || kodePreview[0] !== "  _segarkanHasilUjian();") {
      throw new Error(`${relative}: PRIVASI-HASIL-UJIAN:PREVIEW must only call _segarkanHasilUjian(), found: ${kodePreview.join(" | ")}`);
    }

    // renderVisitors: gerbang tepat sesudah cabang mahasiswa, sebelum tulisan
    // data kelas apa pun.
    const rv = ambilFungsi(exam, "function renderVisitors(visitors){", relative);
    const akhirMhs = rv.indexOf(PENUTUP_CABANG_MHS);
    const GERBANG = "  if (!_dataKelasUjianBoleh()) {\n    _tampilkanHasilTanpaDataKelas();\n    return;\n  }\n  _pulihkanTataHasilDosen();\n";
    const gerbang = rv.indexOf(GERBANG);
    if (akhirMhs < 0 || gerbang < 0) {
      throw new Error(`${relative}: renderVisitors lecturer-only gate (_dataKelasUjianBoleh) missing after the student branch`);
    }
    const antara = rv.slice(akhirMhs + PENUTUP_CABANG_MHS.length, gerbang).split("\n").filter((b) => b.trim() && !b.trim().startsWith("//"));
    if (antara.length) throw new Error(`${relative}: code runs between the student branch and the lecturer-only gate: ${antara[0].trim()}`);
    for (const tulis of [
      "document.getElementById('fabCount').textContent=",
      "updateLeaderboard(visitors, schedExpired);",
      "document.getElementById('vpBadge').textContent=",
      "listEl.innerHTML=",
      "tableEl.innerHTML=masterStudents",
    ]) {
      const i = rv.indexOf(tulis, akhirMhs);
      if (i < 0 || i < gerbang) throw new Error(`${relative}: ${tulis} must stay behind the lecturer-only gate in renderVisitors`);
    }
    // updateLeaderboard: gerbang di baris pertama (fetchMasterStudents memanggilnya untuk siapa pun).
    const lb = ambilFungsi(exam, "function updateLeaderboard(visitors, schedExpired){", relative);
    const pernyataanPertama = lb.split("\n").slice(1).find((b) => b.trim() && !b.trim().startsWith("//"));
    if (pernyataanPertama !== "  if (!_dataKelasUjianBoleh()) { _kosongkanPapanKelasUjian(); return; }") {
      throw new Error(`${relative}: updateLeaderboard must start with the lecturer-only gate, found: ${pernyataanPertama}`);
    }
    const blokPrivasi = ambilBlok(exam, "// ═══ PRIVASI-HASIL-UJIAN:JS BEGIN", "// ═══ PRIVASI-HASIL-UJIAN:JS END", relative);
    if (/masterStudents|onlinePresence|onlineVisited|visitMap/.test(blokPrivasi)) {
      throw new Error(`${relative}: PRIVASI-HASIL-UJIAN helpers must only gate and clear class data, never read or fill it`);
    }

    // Perilaku, dijalankan dari kode halaman itu sendiri.
    const { el, konteks, isiDom, jalankan } = simulasiHasilUjian(exam, relative);
    const aturan = vm.runInContext("_dosenUjianTerverifikasi", konteks);
    for (const [me, harap] of [
      [IDENTITAS_DOSEN, true], [{ ...IDENTITAS_DOSEN, nama: "DEDIK ROMAHADI" }, true], [null, false], [{}, false],
      [{ ...IDENTITAS_DOSEN, role: "student" }, false], [{ ...IDENTITAS_DOSEN, nama: "Dosen Lain" }, false],
      [{ ...IDENTITAS_DOSEN, nama: 42 }, false], [{ nim: DATA_UJI.student.nim, nama: DATA_UJI.student.nama, role: "student" }, false],
    ]) {
      if (aturan(me) !== harap) throw new Error(`${relative}: _dosenUjianTerverifikasi(${JSON.stringify(me)}) should be ${harap}`);
    }
    const tanpaDataKelas = (label) => {
      const isi = isiDom();
      const bocor = isi.match(RX_DATA_TEMAN);
      if (bocor) throw new Error(`${relative}: ${label} still gets class data in the DOM (${bocor[0]})`);
      if (!el.visitorTableBody.innerHTML.includes(PLACEHOLDER_AWAL)) throw new Error(`${relative}: ${label} does not get the class-data placeholder`);
      // Ajakan sesuai konteks: Mode Preview tidak punya formulir login.
      const ajakan = konteks.window._previewMode ? AJAKAN_PREVIEW : AJAKAN_TAMU;
      if (!el.visitorTableBody.innerHTML.includes(PLACEHOLDER_AWAL + ajakan)) {
        throw new Error(`${relative}: ${label}: placeholder call to action should read "${ajakan}"`);
      }
      if (el.leaderboardPanel.style.display !== "none" || el["(judul tabel)"].style.display !== "none") throw new Error(`${relative}: ${label} still sees the leaderboard or the table header`);
      for (const id of ["vpList", "vpBadge", "fabCount", "rajinList", "santaiList"]) {
        if (`${el[id].innerHTML}${el[id].textContent}`.trim()) throw new Error(`${relative}: ${label} leaves #${id} filled`);
      }
    };
    const denganDataKelas = (label) => {
      const isi = isiDom();
      for (const perlu of ["41399000011", "41399000013", "41300000099"]) {
        if (!el.visitorTableBody.innerHTML.includes(perlu)) throw new Error(`${relative}: ${label}: lecturer class table lost ${perlu}`);
      }
      if (!/PEERONLINE/.test(el.vpList.innerHTML) || el.vpBadge.textContent !== "3 online" || String(el.fabCount.textContent) !== "3") {
        throw new Error(`${relative}: ${label}: lecturer online roster not rendered`);
      }
      if (!/PEERTOP/.test(el.rajinList.innerHTML) || !/PEER/.test(isi)) throw new Error(`${relative}: ${label}: lecturer leaderboard not rendered`);
      if (el.leaderboardPanel.style.display === "none" || el["(judul tabel)"].style.display !== "flex") throw new Error(`${relative}: ${label}: lecturer leaderboard/table header stay hidden`);
    };
    const render = (label) => jalankan("renderVisitors(latestVisitors); updateLeaderboard(latestVisitors, false);", label);

    // Tamu di layar login.
    render("guest"); tanpaDataKelas("guest");
    // Kartu placeholder: satu elemen bertanda, tidak ditulis ulang pada render
    // berikutnya dalam konteks yang sama (render tiap event RTDB / 30 detik).
    {
      const kartu = el.visitorTableBody.firstElementChild;
      if (el.visitorTableBody.childElementCount !== 1 || !kartu || kartu.getAttribute("data-privasi-hasil") !== "tanpa-data-kelas" || kartu.getAttribute("data-ajakan") !== "tamu") {
        throw new Error(`${relative}: guest placeholder must be one card marked data-privasi-hasil="tanpa-data-kelas" data-ajakan="tamu"`);
      }
      const tulis = el.visitorTableBody.tulis;
      render("guest (same card)");
      if (el.visitorTableBody.tulis !== tulis) throw new Error(`${relative}: guest placeholder is rewritten on every render (the already-rendered check never matches)`);
    }
    // Mode Preview, termasuk bila identitas dosen kebetulan tersimpan. Kartu
    // tamu yang sudah terpasang HARUS diganti ajakan Preview (data-ajakan
    // termasuk dalam pemeriksaan "kartu sudah terpasang").
    konteks.window._previewMode = true; render("preview"); tanpaDataKelas("preview (card switched from the guest card)");
    konteks.identitas = IDENTITAS_DOSEN; render("preview+dosen"); tanpaDataKelas("preview with a stored lecturer identity");
    konteks.window._previewMode = false;
    // Identitas 'dosen' yang bukan dosen pengampu.
    konteks.identitas = { ...IDENTITAS_DOSEN, nama: "Dosen Lain" }; render("other dosen"); tanpaDataKelas("unverified dosen identity");
    // Tamu → dosen login: _segarkanHasilUjian (dipanggil _applyRoleVisibility) langsung memunculkan data kelas.
    konteks.identitas = null; render("guest again"); tanpaDataKelas("guest (again)");
    konteks.identitas = IDENTITAS_DOSEN; jalankan("_segarkanHasilUjian();", "guest->dosen");
    denganDataKelas("guest -> lecturer login (_segarkanHasilUjian)");
    render("dosen"); denganDataKelas("lecturer");
    // "Jumlah Absen" dosen tepat sesudah roster dimuat: jalankan render ulang
    // fetchMasterStudents halaman itu sendiri dengan jadwal yang sudah berakhir.
    // Harus 5 total / 2 hadir (poin > 0) / 3 absen (Bolos: dua mahasiswa 0 poin
    // + ROSTER ONLY yang tidak pernah akses). Dulu panggilan kedua dengan
    // variabel yang tidak terdefinisi menimpanya menjadi 0 absen.
    konteks.currentSchedule = { start: new Date(Date.now() - 4 * 3600000).toISOString(), end: new Date(Date.now() - 3600000).toISOString(), extension: 120 };
    jalankan(ambilBlok(exam, "    // Bug fix (Apr 2026): trigger re-render setelah master list tersedia,", "    } catch(e) { console.warn('[Visitor] Re-render after master load failed:', e); }", relative), "roster loaded (fetchMasterStudents)");
    {
      const statistik = ["statTotalMhs", "statHadir", "statAbsen"].map((id) => String(el[id].textContent)).join("/");
      if (statistik !== "5/2/3") throw new Error(`${relative}: lecturer stats right after the roster loads (expired schedule) are ${statistik}, expected 5/2/3 (Total/Hadir/Absen)`);
    }
    denganDataKelas("lecturer after roster load");
    konteks.currentSchedule = null;
    // Dosen → Mode Preview (identitas dosen tetap tersimpan): blok PREVIEW
    // halaman itu sendiri langsung membuang data kelas yang sudah dirender.
    konteks.window._previewMode = true; jalankan(blokPreview, "lecturer->preview");
    tanpaDataKelas("lecturer -> Mode Preview (enterPreviewMode, before any new RTDB event)");
    konteks.window._previewMode = false; render("dosen again"); denganDataKelas("lecturer (again)");
    // Dosen → logout paksa (identitas dihapus): data kelas langsung dibuang.
    konteks.identitas = null; jalankan("_segarkanHasilUjian();", "forced logout"); tanpaDataKelas("after forced logout");
    // Mahasiswa: tetap hanya kartu nilai sendiri, papan peringkat tidak terisi.
    konteks.identitas = { nim: DATA_UJI.student.nim, nama: DATA_UJI.student.nama, role: "student" };
    render("student");
    const bocorMhs = isiDom().match(RX_DATA_TEMAN);
    if (bocorMhs) throw new Error(`${relative}: student gets class data in the DOM (${bocorMhs[0]})`);
    if (!el.visitorTableBody.innerHTML.includes("Nilai Anda") && !el.visitorTableBody.innerHTML.includes("Belum Ada Data")) {
      throw new Error(`${relative}: student no longer gets the own-score card`);
    }
    examPrivasiHasil += 1;
  }
}
if (examPrivasiHasil !== 12) throw new Error(`Expected 12 UTS/UAS pages with lecturer-only class data, found ${examPrivasiHasil}`);

// Label navbar halaman ujian = label course di ke-14 halaman modulnya
// (scripts/label-nav-ujian.mjs; CAD lewat scripts/cad-exam/bangun.py). UTS/UAS
// Sistem Kendali Cerdas, Teknik Tenaga Listrik, dan Pemodelan CAD sempat
// berlabel "GETARANMESIN // UTS" — sisa templat Getaran Mekanik yang ikut
// tersalin tanpa ada yang menagihnya.
const RX_NAV_BRAND = /<span class="nav-brand"><span class="pulse"><\/span><span>([A-Z0-9]+) \/\/ ([A-Z]+\d*)<\/span><\/span>/g;
let examNav = 0;
for (const course of courseRoots) {
  const modulDir = path.join(root, course, "Modul");
  const labels = new Set();
  for (const f of fs.readdirSync(modulDir).filter((x) => /^Modul-\d+\.html$/.test(x))) {
    const nav = [...fs.readFileSync(path.join(modulDir, f), "utf8").matchAll(RX_NAV_BRAND)];
    if (nav.length !== 1) throw new Error(`${course}/Modul/${f}: expected exactly one "<LABEL> // <n>" navbar brand, found ${nav.length}`);
    labels.add(nav[0][1]);
  }
  if (labels.size !== 1) throw new Error(`${course}: module navbar labels disagree (${[...labels].join(", ")})`);
  const label = [...labels][0];
  if (course !== "Getaran-Mekanik" && label === "GETARANMESIN") throw new Error(`${course}: navbar label is the Getaran Mekanik template leftover`);
  for (const kind of ["UTS", "UAS"]) {
    const relative = `${course}/Exam/${kind}.html`;
    const exam = fs.readFileSync(path.join(root, relative), "utf8");
    const nav = [...exam.matchAll(RX_NAV_BRAND)];
    if (nav.length !== 1 || nav[0][1] !== label || nav[0][2] !== kind) {
      throw new Error(`${relative}: navbar brand must read "${label} // ${kind}" like this course's modules, found ${nav.map((m) => `"${m[1]} // ${m[2]}"`).join(", ") || "none"} (run node scripts/label-nav-ujian.mjs)`);
    }
    if (course !== "Getaran-Mekanik" && exam.includes("GETARANMESIN")) throw new Error(`${relative}: Getaran Mekanik template label GETARANMESIN left on a non-Getaran exam page`);
    examNav += 1;
  }
}
if (examNav !== 12) throw new Error(`Expected 12 UTS/UAS pages with the course navbar label, found ${examNav}`);

const formatPointsForValidation = (pts) => {
  const value = Number(pts);
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
};
for (const [input, expected] of [[95.52861952861952, "95.53"], [9.6, "9.6"], [9, "9"], [-0.0001, "0"], [NaN, "0"]]) {
  const actual = formatPointsForValidation(input);
  if (actual !== expected) throw new Error(`Point formatter regression: ${String(input)} -> ${actual}, expected ${expected}`);
}

// Mode Preview memberi akses tanpa login, jadi tombol Export PDF modul harus mati
// di sana. Dulu tidak: identity lama tetap tersimpan di localStorage ketika
// pengunjung memilih preview lewat "Ganti Peran", sehingga _applyRoleVisibility
// menilainya "sudah login" dan modul bisa diunduh tanpa login sama sekali.
// Sengaja memindai SEMUA course (termasuk Sistem-Kendali-Cerdas, yang tidak masuk
// courseRoots di atas) supaya ke-56 halaman modul ikut terjaga.
const modulPages = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "Modul")))
  .flatMap((entry) => fs.readdirSync(path.join(root, entry.name, "Modul"))
    .filter((file) => /^Modul-\d+\.html$/.test(file))
    .map((file) => path.join(entry.name, "Modul", file)));
let previewGuarded = 0;
for (const relative of modulPages) {
  const page = fs.readFileSync(path.join(root, relative), "utf8");
  if (!page.includes("navExportPdf")) continue;
  if (!page.includes("_previewMode")) throw new Error(`${relative}: export button without preview mode`);
  for (const [needle, label] of [
    ["const loggedIn = !!(me && me.nama) && !window._previewMode;", "preview tidak dihitung sbg belum-login di _applyRoleVisibility"],
    ["_pmExportBtn.disabled = true;", "enterPreviewMode tidak mematikan tombol Export PDF"],
    ["if (window._previewMode) {\n    alert(", "exportModulPdf tanpa penjaga preview"],
  ]) {
    if (!page.includes(needle)) throw new Error(`${relative}: ${label}`);
  }
  previewGuarded += 1;
}
if (previewGuarded !== 84) throw new Error(`Expected 84 modul pages with a guarded export button, found ${previewGuarded}`);

// exportPoints/exportNilai adalah variabel LOKAL exportTugasHtml (diisi dari
// callable generateExportCode). Math4 Modul-4 sempat membacanya di
// updateScore (#626, 16 Juli 2026 — sampai 28 September 2026): setiap hasil
// server PG/komputasi berakhir ReferenceError, mahasiswa melihat "Koneksi/server
// error (exportPoints is not defined)", checkMC membatalkan kunci optimistik
// padahal jawaban sudah tercatat, dan panel skor tidak pernah terbarui. Setiap
// rujukan harus berada di badan exportTugasHtml: fungsi tingkat atas terdekat
// sebelum rujukan itu adalah exportTugasHtml, dan rujukan itu datang sesudah
// deklarasinya.
let eksporLokal = 0;
const halamanEkspor = [
  ...modulPages,
  ...courseRoots.flatMap((course) => ["UTS.html", "UAS.html"].map((f) => path.join(course, "Exam", f))),
];
for (const relative of halamanEkspor) {
  const page = fs.readFileSync(path.join(root, relative), "utf8");
  const deklarasi = [...page.matchAll(/\blet exportCode = '[^']*', exportPoints = 0, exportNilai = 0, /g)];
  if (deklarasi.length !== 1) throw new Error(`${relative}: expected one local exportPoints/exportNilai declaration in exportTugasHtml, found ${deklarasi.length}`);
  const fungsi = [...page.matchAll(/^(?:async\s+)?function\s+([\w$]+)\s*\(/gm)];
  for (const m of page.matchAll(/\bexport(?:Points|Nilai)\b/g)) {
    let induk = null;
    for (const f of fungsi) { if (f.index < m.index) induk = f[1]; else break; }
    if (induk !== "exportTugasHtml" || m.index < deklarasi[0].index) {
      const baris = page.slice(0, m.index).split("\n").length;
      throw new Error(`${relative}:${baris}: ${m[0]} is read outside exportTugasHtml (in ${induk || "top level"}); it is a local there, so this throws ReferenceError — compute the value locally like the other pages`);
    }
  }
  eksporLokal += 1;
}
if (eksporLokal !== 96) throw new Error(`Expected 96 modul/exam pages with a local export code, found ${eksporLokal}`);

// Keadaan Chat Kelas/presence dan handler chat di skrip module
// (scripts/deklarasi-chat-modul.mjs, 29 September 2026). Chat Kelas dan daftar
// online berjalan di <script type="module"> (strict mode), jadi menugasi
// pengenal yang tidak dideklarasikan melempar ReferenceError. Unggahan manual
// Getaran Modul-4 (6811c36e, 28 April 2026) membuang `let onlineUsers`,
// `let chatMessages`, `let _lastSentAt`, ekspor window.sendChat/onChatInput/
// onChatKey, dan `initChat();` di init sequence: setiap snapshot presence/chat
// melempar "onlineUsers/chatMessages is not defined", handler inline komposer
// chat melempar atau diam, dan tamu serta dosen yang baru login (jalur itu hanya
// memanggil initPresence) tidak memasang listener chat — lima bulan tanpa
// pemeriksaan yang gagal (node --check hanya sintaks).
// Di ke-96 halaman modul/ujian:
//   1. setiap pengenal keadaan chat/presence (PENGENAL_KEADAAN_CHAT) yang
//      dipakai sebuah skrip module punya tepat satu deklarasi let/var di
//      tingkat teratas skrip ITU (bukan const, bukan di skrip lain, bukan di
//      dalam fungsi, komentar, atau string), sebelum pemakaian pertamanya.
//      Deklarator sesudah koma (`let a = [], b = [];`), pola destrukturisasi,
//      dan indentasi dihitung sama seperti oleh injector. Nama yang hanya ada
//      di cakupan global (let/var skrip klasik, window.X) tidak melempar, tetapi
//      tetap ditolak sebagai aturan rumah (§6.5) dengan pesan tersendiri;
//   2. handler on*="F(…)" di HTML statis yang memanggil fungsi tingkat teratas
//      skrip module punya ekspor window.F di luar blok AI-CHAT-AGENT (handler
//      inline berjalan di cakupan global; blok AI hanya membungkus
//      window.sendChat/onChatKey yang sudah ada);
// dan di ke-84 modul skrip module chat memanggil `initChat();` di tingkat
// teratasnya, serta tidak memasang presence dua kali untuk identitas tersimpan:
// bila auto-login `_handleScheduleReady` sudah memanggil initPresence (Getaran
// Modul-4), init sequence tidak boleh memanggilnya lagi (timer presence
// 1,5 detik ke-83 modul lain) — tiap panggilan menambah pendengar
// visibilitychange dan tulisan heartbeat RTDB. Pemindaiannya memakai
// scripts/pemindai-deklarasi.mjs, pemindai yang sama dengan injector itu:
// komentar, string, templat, dan regex dikosongkan lebih dulu; skrip yang
// kurungnya tidak seimbang sesudah itu ditolak supaya pemeriksaan tidak
// melemah diam-diam. Aturan ini diuji mutasi di bawah pada Getaran Modul-3 dan
// UTS Getaran sebelum halaman dipindai.
const PENGENAL_KEADAAN_CHAT = ["onlineUsers", "chatMessages", "_lastSentAt", "onlinePresence"];
/** Skrip inline halaman lewat pemindai bersama; kurung tak seimbang → galat. */
function skripInlineTerurai(page, relative) {
  const hasil = uraiSkripInline(page);
  for (const s of hasil) {
    if (!s.seimbang) {
      throw new Error(`${relative}:${page.slice(0, s.mulai).split("\n").length}: pemindai deklarasi validator tidak dapat mengurai skrip inline ini (kurung tak seimbang sesudah komentar/string/regex dikosongkan); perbaiki kodeTanpaLiteral di scripts/pemindai-deklarasi.mjs, jangan lewati skripnya`);
    }
  }
  return hasil;
}
/** Daftar pelanggaran (kosong = lolos). `modul`: halaman Modul-N (menagih initChat() dan presence tunggal). */
function pelanggaranDeklarasiChat(page, relative, { modul }) {
  const galat = [];
  const baris = (pos) => page.slice(0, pos).split("\n").length;
  const skrip = skripInlineTerurai(page, relative);
  const global = namaGlobal(skrip);
  // 1. Pengenal keadaan chat/presence dideklarasikan di skrip module pemakainya.
  for (const s of skrip) {
    if (!s.module || s.dalamAi) continue;
    const deklarasi = deklarasiLeksikal(s.kode, s.dalam);
    for (const x of PENGENAL_KEADAAN_CHAT) {
      const milik = deklarasi.filter((d) => d.nama === x);
      const pakai = pemakaian(s.kode, x, new Set(milik.map((d) => d.pos)));
      if (!pakai.length) continue;
      const atas = milik.filter((d) => d.kedalaman === 0);
      const awal = `${relative}:${baris(s.mulai + pakai[0])}: ${x} dipakai di skrip module tanpa tepat satu deklarasi \`let ${x}\` di tingkat teratas skrip itu (ditemukan ${atas.length}${atas.some((d) => d.jenis === "const") ? ", const" : ""})`;
      if (!atas.length && global.has(x)) {
        galat.push(`${awal}; ${x} hanya ada di cakupan global (let/var skrip klasik atau window.${x}), jadi tidak melempar ReferenceError, tetapi keadaan chat/presence wajib milik skrip module pemakainya (Pedoman §6.5) — pindahkan deklarasinya ke sana dengan tangan (deklarasi-chat-modul.mjs menolak halaman ini agar tidak menyisipkan \`let\` yang membayangi nama global itu)`);
      } else if (!atas.length) {
        galat.push(`${awal}; strict mode → ReferenceError — jalankan node scripts/deklarasi-chat-modul.mjs`);
      } else if (atas.some((d) => d.jenis === "const")) {
        galat.push(`${awal}; const tidak dapat ditugasi ulang oleh listener (TypeError) — ganti menjadi \`let\` dengan tangan`);
      } else if (atas.length > 1) {
        galat.push(`${awal}; deklarasi ganda — sisakan satu`);
      } else if (pakai[0] < atas[0].pos) {
        galat.push(`${relative}:${baris(s.mulai + pakai[0])}: ${x} dipakai sebelum deklarasinya (baris ${baris(s.mulai + atas[0].pos)})`);
      }
    }
  }
  // 2. Handler inline statis → fungsi skrip module harus diekspos ke window di luar blok AI.
  const fnModul = new Set();
  for (const s of skrip) if (s.module && !s.dalamAi) for (const nama of fungsiTingkatAtas(s.kode, s.dalam).keys()) fnModul.add(nama);
  const html = page.replace(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g, (b) => b.replace(/[^\n]/g, " "))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (b) => b.replace(/[^\n]/g, " "));
  for (const a of html.matchAll(/\s(on[a-z]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const c of (a[2] ?? a[3]).matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (fnModul.has(c[1]) && !global.has(c[1])) galat.push(`${relative}:${baris(a.index + 1)}: ${a[1]}="…${c[1]}(…)" memanggil fungsi skrip module tanpa window.${c[1]} di luar blok AI-CHAT-AGENT (handler inline berjalan di cakupan global → ReferenceError) — jalankan node scripts/deklarasi-chat-modul.mjs`);
    }
  }
  // 3. Modul: listener chat dipasang di tingkat teratas skrip module chat, dan
  //    presence tidak dipasang dua kali untuk identitas tersimpan.
  if (modul) {
    const chat = skrip.filter((s) => s.module && !s.dalamAi && fungsiTingkatAtas(s.kode, s.dalam).has("initChat"));
    if (chat.length !== 1) galat.push(`${relative}: skrip module ber-\`function initChat()\` di tingkat teratas ada ${chat.length}, harusnya 1`);
    else {
      const s = chat[0];
      if (!panggilanTingkatAtas(s.kode, s.dalam, "initChat").length) {
        galat.push(`${relative}: skrip module chat tidak memanggil initChat(); di tingkat teratas (tamu dan dosen yang baru login tanpa listener chat) — jalankan node scripts/deklarasi-chat-modul.mjs`);
      }
      const autoLogin = presenceAutoLogin(s.kode, s.dalam);
      const muat = presenceSaatMuat(s.kode, s.dalam);
      if (autoLogin.length && muat.length) {
        galat.push(`${relative}:${baris(s.mulai + muat[0])}: initPresence dipasang dua kali untuk identitas tersimpan — oleh init sequence dan oleh auto-login _handleScheduleReady (baris ${baris(s.mulai + autoLogin[0])}); tiap panggilan menambah pendengar visibilitychange dan tulisan heartbeat — sisakan satu (blok DEKLARASI-CHAT-MODUL:INIT diatur node scripts/deklarasi-chat-modul.mjs)`);
      }
    }
  }
  return galat;
}
{
  // Uji mutasi aturan di atas: halaman benar lolos, tiap mutasi gagal dengan
  // pengenal yang tepat. Mutasi yang tidak berlaku (teks jangkar hilang)
  // menggagalkan validator, supaya uji ini tidak diam-diam kosong.
  const M3 = "Getaran-Mekanik/Modul/Modul-3.html";
  const UTS = "Getaran-Mekanik/Exam/UTS.html";
  const dasar = { [M3]: fs.readFileSync(path.join(root, M3), "utf8"), [UTS]: fs.readFileSync(path.join(root, UTS), "utf8") };
  const EKSPOR = "window.sendChat=sendChat; window.onChatInput=onChatInput; window.onChatKey=onChatKey;\n";
  const DEKL = "\nlet onlineUsers = [];\nlet chatMessages = [];\n";
  const AUTOLOGIN = "window._loadScoredQuestions(); }, 500);\n    }\n  }\n}\n\nfunction updateScheduleDisplay()";
  const PRESENCE_MUAT = "setTimeout(() => {\n  const me = getIdentity();\n  if (me && (me.role === 'student' || me.role === 'dosen')) initPresence();\n}, 1500);\n";
  const ubah = (rel, ...pasangan) => {
    let s = dasar[rel];
    for (let i = 0; i < pasangan.length; i += 2) {
      if (s.split(pasangan[i]).length !== 2) throw new Error(`uji mutasi deklarasi chat: jangkar ${JSON.stringify(pasangan[i].slice(0, 60))} tidak tepat sekali di ${rel}`);
      s = s.replace(pasangan[i], () => pasangan[i + 1]);
    }
    return s;
  };
  const autoLoginPresence = AUTOLOGIN.replace("}, 500);\n", "}, 500);\n      if (typeof initPresence === 'function') setTimeout(initPresence, 300);\n");
  const kasus = [
    ["tanpa let onlineUsers", M3, ["\nlet onlineUsers = [];", ""], /onlineUsers dipakai di skrip module tanpa.*ReferenceError/],
    ["tanpa let chatMessages", M3, ["\nlet chatMessages = [];", ""], /chatMessages dipakai di skrip module tanpa.*ReferenceError/],
    ["tanpa let _lastSentAt", M3, ["\nlet _lastSentAt = 0;", ""], /_lastSentAt dipakai di skrip module tanpa/],
    ["const onlineUsers", M3, ["\nlet onlineUsers = [];", "\nconst onlineUsers = [];"], /onlineUsers dipakai .*const.*TypeError/],
    ["const pada deklarator kedua", M3, [DEKL, "\nconst _uji = 1, onlineUsers = [];\nlet chatMessages = [];\n"], /onlineUsers dipakai .*const/],
    ["deklarasi ganda", M3, [DEKL, "\nvar onlineUsers = [];\nvar onlineUsers = [];\nlet chatMessages = [];\n"], /onlineUsers dipakai .*deklarasi ganda/],
    ["deklarasi di komentar", M3, ["\nlet onlineUsers = [];", "\n// let onlineUsers = [];"], /onlineUsers dipakai di skrip module tanpa/],
    ["deklarasi di string", M3, ["\nlet chatMessages = [];", "\nconst _uji = 'let chatMessages = [];';"], /chatMessages dipakai di skrip module tanpa/],
    ["deklarasi di dalam fungsi", M3, ["\nlet onlineUsers = [];", "\nfunction _uji() { let onlineUsers = []; return onlineUsers; }"], /onlineUsers dipakai di skrip module tanpa/],
    ["deklarasi sesudah pemakaian", M3, ["\nlet chatMessages = [];", "", EKSPOR, EKSPOR + "let chatMessages = [];\n"], /chatMessages dipakai sebelum deklarasinya/],
    ["deklarasi di skrip module lain", M3, ["\nlet onlineUsers = [];", "", "<!-- AI-CHAT-AGENT:BEGIN", "<script type=\"module\">let onlineUsers = [];</script>\n<!-- AI-CHAT-AGENT:BEGIN"], /onlineUsers dipakai di skrip module tanpa.*ReferenceError/],
    ["deklarasi hanya di skrip klasik", M3, ["\nlet onlineUsers = [];", "", "<!-- AI-CHAT-AGENT:BEGIN", "<script>let onlineUsers = [];</script>\n<!-- AI-CHAT-AGENT:BEGIN"], /onlineUsers hanya ada di cakupan global .*tidak melempar ReferenceError/],
    ["tanpa window.sendChat", M3, [EKSPOR, "window.onChatInput=onChatInput; window.onChatKey=onChatKey;\n"], /onclick="…sendChat\(…\)" memanggil fungsi skrip module/],
    ["tanpa window.onChatKey", M3, [EKSPOR, "window.sendChat=sendChat; window.onChatInput=onChatInput;\n"], /onkeydown="…onChatKey\(…\)"/],
    ["ekspor hanya di blok AI", M3, [EKSPOR, "window.sendChat=sendChat; window.onChatKey=onChatKey;\n", "<!-- AI-CHAT-AGENT:END", "<script>window.onChatInput=onChatInput;</script>\n<!-- AI-CHAT-AGENT:END"], /oninput="…onChatInput\(…\)"/],
    ["tanpa initChat()", M3, ["\ninitChat();\n", "\n"], /tidak memanggil initChat\(\); di tingkat teratas/],
    ["initChat() hanya di dalam fungsi", M3, ["\ninitChat();\n", "\nfunction _uji() { initChat(); }\n"], /tidak memanggil initChat\(\); di tingkat teratas/],
    ["presence ganda (auto-login + timer init)", M3, [AUTOLOGIN, autoLoginPresence], /initPresence dipasang dua kali untuk identitas tersimpan/],
    ["ujian tanpa let onlinePresence", UTS, ["let onlinePresence = {};", ""], /onlinePresence dipakai di skrip module tanpa/],
  ];
  // Bentuk deklarasi/presence yang sah: harus lolos (injector memakai pemindai yang sama).
  const sah = [
    ["var onlineUsers", M3, ["\nlet onlineUsers = [];", "\nvar onlineUsers = [];"]],
    ["deklarasi ber-indentasi", M3, ["\nlet onlineUsers = [];", "\n  let onlineUsers = [];"]],
    ["beberapa deklarator", M3, [DEKL, "\nlet onlineUsers = [], chatMessages = [];\n"]],
    ["beberapa deklarator lintas baris", M3, [DEKL, "\nlet onlineUsers = [],\n    chatMessages = [];\n"]],
    ["destrukturisasi larik", M3, [DEKL, "\nlet [onlineUsers, chatMessages] = [[], []];\n"]],
    ["destrukturisasi objek", M3, [DEKL, "\nlet { a: onlineUsers, chatMessages = [] } = { a: [] };\n"]],
    ["presence hanya lewat auto-login", M3, [AUTOLOGIN, autoLoginPresence, PRESENCE_MUAT, ""]],
  ];
  for (const rel of [M3, UTS]) {
    const g = pelanggaranDeklarasiChat(dasar[rel], rel, { modul: rel === M3 });
    if (g.length) throw new Error(`uji mutasi deklarasi chat: halaman dasar ${rel} harusnya lolos:\n${g.join("\n")}`);
  }
  for (const [nama, rel, pasangan] of sah) {
    const g = pelanggaranDeklarasiChat(ubah(rel, ...pasangan), rel, { modul: rel === M3 });
    if (g.length) throw new Error(`uji mutasi deklarasi chat: bentuk sah "${nama}" harusnya lolos:\n${g.join("\n")}`);
  }
  for (const [nama, rel, pasangan, harap] of kasus) {
    const g = pelanggaranDeklarasiChat(ubah(rel, ...pasangan), rel, { modul: rel === M3 });
    if (!g.some((x) => harap.test(x))) throw new Error(`uji mutasi deklarasi chat "${nama}" tidak tertangkap (${harap}); pelanggaran: ${JSON.stringify(g)}`);
  }
}
let deklarasiChat = 0, chatModul = 0;
for (const relative of halamanEkspor) {
  const page = fs.readFileSync(path.join(root, relative), "utf8");
  const modul = modulPages.includes(relative);
  const galat = pelanggaranDeklarasiChat(page, relative, { modul });
  if (galat.length) throw new Error(galat.join("\n"));
  deklarasiChat += 1;
  if (modul) chatModul += 1;
}
if (deklarasiChat !== 96 || chatModul !== 84) throw new Error(`Expected 96 modul/exam pages (84 with Chat Kelas) checked for chat/presence declarations, found ${deklarasiChat} (${chatModul})`);

// Jawaban mahasiswa (pilihan PG/benar-salah, kode, ringkasan berkas) tidak
// dibaca dari atau ditulis ulang ke record RTDB publik
// (scripts/jawaban-privat.mjs, 29 September 2026). Rules RTDB memberi
// `.read: true` pada visitors/<course>/<slot>/<kunci> dan izin baca menurun ke
// seluruh anak, sementara ke-96 halaman mengunduh seluruh node slot untuk papan
// peringkat: selections/codes teman sekelas + marker benar/salah membuka kunci
// jawaban. Pemulihan jawaban sendiri HANYA memakai callable getJawabanSaya
// (ledger server): field publik dibuang juga bila callable gagal (functions dan
// rules ter-deploy sebelum halaman, dan isi publik bisa ditanam orang lain).
// Diperiksa di ke-96 halaman: penanda dan letak blok, jembatan callable di luar
// blok AI, identitas localStorage tanpa field jawaban dan berperan 'student'
// untuk NIM mahasiswa, identitas login dari alur login (_identitasLogin),
// tidak ada tulisan klien yang mengirim ulang record lama (tanpa set() record
// maupun cadangan freshRec), cabang resource-exhausted di penangan galat
// penilaian, kait berkas CAD, lalu blok halaman itu sendiri dijalankan di
// sandbox node:vm — callable ada / tidak ada / belum ter-deploy / gagal
// sementara (dicoba lagi) / terkunci PIN (menunggu remainingSeconds tanpa
// memanggil, lalu dicoba lagi) / hash PIN ditolak (sesi dibuang, PIN diminta
// lagi) / lambat (batas tunggu bawaan ≤ 2,5 detik), tanpa PIN, dosen,
// identitas lain, akun simulasi, halaman bertugas berkas, penulis record
// pengunjung (rules create-only), dan (modul) pemulihan PG terpadu JEMBATAN +
// HURUF-ASAL + GABUNG + PILIHAN-PG-PULIH. Blok TUNGGU v2 (record RTDB dibaca
// sesudah penantian getJawabanSaya; snapshot yang lebih tua daripada marker
// benar yang sudah diketahui halaman dibaca ulang lalu dilewati) punya sandbox
// dan uji mutasi sendiri (periksaTungguPemulihan, ujiMutasiTunggu).
const FIELD_JAWABAN = ["selections", "codes", "scoreDeltas", "pinHash", "pinSetAt"];
const HASH_UJI = "a".repeat(64);   // hash rekaan untuk uji, bukan PIN siapa pun
const HASH_UJI_2 = "c".repeat(64);   // hash rekaan kedua (PIN baru), bukan PIN siapa pun
const NIM_UJI = "41300000123";
const MHS_UJI = { nama: "TES MAHASISWA SATU", nim: NIM_UJI, role: "student" };
const RESPONS_UJI = {
  jawaban: {
    mc1: { tipe: "mc", pilihan: "b", mcOrderVersion: 1, status: "correct", scoreDelta: 1, correctAnswer: "KUNCI-RAHASIA", explain: "PENJELASAN-RAHASIA" },
    mc2: { tipe: "mc", pilihan: "D", mcOrderVersion: 0, status: "wrong", scoreDelta: 0 },
    mc3: { tipe: "mc", pilihan: 2, status: "correct", scoreDelta: 1 },
    tf1: { tipe: "tf", pilihan: false, status: "wrong", scoreDelta: 0 },
    c1: { tipe: "comp", kode: "print(42)", status: "correct", scoreDelta: 2, explain: "PENJELASAN-RAHASIA" },
    c2: { tipe: "comp", status: "wrong", scoreDelta: 0, correctAnswer: 3.14159 },
    c3: { tipe: "comp", kode: "📎 dinilai.FCStd · 1.0 KB", status: "correct", scoreDelta: 6 },
    "mc1/../x": { tipe: "mc", pilihan: "A" },
  },
  berkas: { c3: "📎 lama.FCStd", c4: "📎 baru.FCStd · 2.0 KB · SHA-256 0123456789abcdef… · 2026-09-29T01:00:00Z" },
  kunci: { mc1: "C" },
};
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
/** Tunggu sampai f() benar (paling lama ms); uji pewaktu tidak bergantung pada selisih sempit. */
const sampai = async (f, ms = 3000) => { const t0 = Date.now(); while (!f() && Date.now() - t0 < ms) await tunggu(10); return f(); };
const salinJson = (x) => JSON.parse(JSON.stringify(x));

/** Indeks `)` penutup panggilan yang `(`-nya di posisi i (string literal dilompati). */
function tutupPanggilanUji(s, i) {
  let d = 0;
  for (let k = i; k < s.length; k += 1) {
    const c = s[k];
    if (c === "'" || c === '"' || c === "`") { for (k += 1; k < s.length && s[k] !== c; k += 1) if (s[k] === "\\") k += 1; continue; }
    if (c === "(") d += 1;
    else if (c === ")") { d -= 1; if (d === 0) return k; }
  }
  return -1;
}

/** DOM tiruan untuk pemberitahuan #jawabanSayaInfo (createElement/appendChild/remove). */
function domPemberitahuan(dasar = null) {
  const el = {};
  return Object.assign(Object.create(dasar), {
    _el: el,
    getElementById: (id) => el[id] || (dasar && dasar.getElementById ? dasar.getElementById(id) : null),
    createElement: () => {
      const x = { style: {}, attr: {}, textContent: "", setAttribute(k, v) { this.attr[k] = v; }, remove() { if (el[this.id] === this) delete el[this.id]; } };
      return x;
    },
    body: { appendChild: (x) => { el[x.id] = x; } },
  });
}

/**
 * Jalankan blok JEMBATAN halaman di sandbox dengan callable getJawabanSaya
 * tiruan. Pewaktu ≥ 1 detik dipercepat 100× (coba ulang 3/10 detik, penguncian
 * PIN, batas tunggu bawaan 2,5 detik) supaya 96 halaman tetap cepat diuji.
 * `galat`: { code, details, kali } — `kali` panggilan pertama gagal dengan kode
 * itu, sesudahnya berhasil; `gagal: true` = belum ter-deploy (not-found) selamanya.
 */
function sandboxJembatan(jembatan, jenis, opsi = {}) {
  const { respons = RESPONS_UJI, gagal = false, galat = null, tanpaCallable = false, tundaMs = 0, cad = false, dom = null, pinAda = true } = opsi;
  const panggilan = [], peringatan = [], tandai = [], mintaPin = [];
  const win = { _sessionPinHash: "pinHash" in opsi ? opsi.pinHash : HASH_UJI, _cache: null, _ulang: 0 };
  if (cad) { win._ringkasTugasCad = () => ""; win._tandaiBerkasDiServer = (q) => tandai.push(q); }
  win._loadScoredQuestions = () => { win._ulang += 1; };
  win._cachedFirebaseData = () => win._cache;
  win[`_reapply${jenis}StateFromCache`] = () => { win._ulang += 1; };
  win._setSessionPinHash = (h) => { win._sessionPinHash = h || null; };
  win._callVerifyPin = (nim, hash) => Promise.resolve({ exists: pinAda, valid: false, _tanya: [nim, hash || null] });
  const cepat = (ms) => (Number(ms) >= 1000 ? Math.ceil(Number(ms) / 100) : ms);
  const galatUji = gagal ? { code: "functions/not-found", kali: Infinity } : galat;
  const ctx = {
    window: win, document: dom, setTimeout: (fn, ms) => setTimeout(fn, cepat(ms)), clearTimeout,
    console: { warn: (...a) => peringatan.push(a.map(String).join(" ")) },
    _functions: {}, MODUL_ID: "uji-modul-x", EXAM_ID: "uji-ujian-x", db: {}, DB_PATH: "visitors/uji/slot-x",
    identitas: "me" in opsi ? opsi.me : MHS_UJI,
    ref: (d, p) => ({ path: p }), get: (r) => Promise.resolve({ exists: () => true, val: () => ({ nama: "REKAMAN", path: r.path }) }),
    sanitizeKey: (k) => String(k).replace(/[.#$[\]/]/g, "_"), _isScheduleOpen: () => true,
    _showPinInput: (nama) => mintaPin.push(["modal", nama]),
    _promptPinReentry: (pesan) => { mintaPin.push(["ulang", pesan]); return Promise.resolve(false); },
    httpsCallable: (fx, nama) => {
      if (tanpaCallable || nama !== "getJawabanSaya") return undefined;
      return (payload) => {
        panggilan.push(salinJson(payload));
        const ke = panggilan.length;
        return new Promise((ok, tolak) => setTimeout(() => (galatUji && ke <= (galatUji.kali ?? Infinity)
          ? tolak(Object.assign(new Error("galat uji " + galatUji.code), { code: galatUji.code, details: galatUji.details }))
          : ok({ data: salinJson(respons) })), cepat(tundaMs)));
      };
    },
  };
  ctx.getIdentity = () => ctx.identitas;
  vm.createContext(ctx);
  vm.runInContext(jembatan, ctx);
  return { win, ctx, panggilan, peringatan, tandai, mintaPin };
}

/**
 * JAWABAN-PRIVAT:TUNGGU v2 (29 September 2026). v1 membaca record RTDB
 * bersamaan dengan penantian getJawabanSaya (≤ 2,5 detik) lalu menerapkan
 * snapshot yang dibaca di AWAL penantian; halaman modul memanggil
 * _loadScoredQuestions dua kali saat dimuat, sehingga kiriman ulang tugas CAD
 * yang benar sesudah pemulihan pertama dibatalkan snapshot lama pemulihan kedua
 * (marker cN_comp_ulang → skor 6 → 0, kartu terbuka lagi). v2: getJawabanSaya
 * ditunggu dulu, record dibaca sesudahnya; snapshot yang tidak memuat marker
 * BENAR yang sudah diketahui halaman (window._answeredQ, NIM yang sama sejak
 * halaman dimuat) dibaca ulang tiap 750 ms paling banyak 4 kali, lalu
 * pemulihannya dilewati dengan _markLoaded(). Blok ke-96 halaman identik, jadi
 * sandbox dijalankan sekali per isi blok (`tanpaCache` untuk uji mutasi).
 */
const tungguSandbox = new Map();
const TUNGGU_EKOR = "  Promise.resolve().then(() => (typeof window._muatJawabanSaya === 'function' ? window._muatJawabanSaya() : null)).catch(() => null).then(() => _bacaRekaman(4)).then((snap) => {\n"
  + "    if (!snap) { if (typeof _markLoaded === 'function') _markLoaded(); else if (typeof window._markLoaded === 'function') window._markLoaded(); return; }\n"
  + "  // JAWABAN-PRIVAT:TUNGGU END v2\n";
async function periksaTungguPemulihan(page, relative, { tanpaCache = false } = {}) {
  const saran = "; jalankan node scripts/jawaban-privat.mjs";
  for (const ujung of ["BEGIN v2", "END v2"]) {
    const k = page.split(`// JAWABAN-PRIVAT:TUNGGU ${ujung}`).length - 1;
    if (k !== 1) throw new Error(`${relative}: penanda JAWABAN-PRIVAT:TUNGGU ${ujung} muncul ${k}x, harusnya 1${saran}`);
  }
  const blokTunggu = ambilBlok(page, "// JAWABAN-PRIVAT:TUNGGU BEGIN", "// JAWABAN-PRIVAT:TUNGGU END", relative);
  // Ekor blok membuka callback pemulihan halaman: snapshot null = dilewati.
  if (!blokTunggu.endsWith("\n" + TUNGGU_EKOR) || !page.includes("\n  " + blokTunggu)) {
    throw new Error(`${relative}: blok TUNGGU v2 harus diakhiri pembuka callback pemulihan \`…then(() => _bacaRekaman(4)).then((snap) => {\` dengan \`if (!snap) { …_markLoaded()…; return; }\`${saran}`);
  }
  if (/Promise\.all\(/.test(blokTunggu) || page.includes("get(ref(db, DB_PATH + '/' + key)).then(snap => {")) {
    throw new Error(`${relative}: record RTDB harus dibaca SESUDAH penantian getJawabanSaya, bukan bersamaan (Promise.all) atau tanpa blok TUNGGU${saran}`);
  }
  if (!tanpaCache && tungguSandbox.has(blokTunggu)) {
    const g = tungguSandbox.get(blokTunggu);
    if (g) throw new Error(`${relative}: ${g}`);
    return;
  }
  let galat = null;
  try { await sandboxTunggu(blokTunggu); } catch (e) { galat = e.message; }
  if (!tanpaCache) tungguSandbox.set(blokTunggu, galat);
  if (galat) throw new Error(`${relative}: ${galat}`);
}
/** Jalankan blok TUNGGU di _loadScoredQuestions tiruan (pewaktu dipercepat 100×). */
async function sandboxTunggu(blokTunggu) {
  const gagal = (skenario, pesan) => { throw new Error(`JAWABAN-PRIVAT:TUNGGU sandbox (${skenario}): ${pesan}`); };
  // Badan pemulihan tiruan: mencatat snapshot yang diterapkan, menambahkan
  // markernya ke _answeredQ seperti kode pemulihan halaman, lalu _markLoaded().
  const badan = "    hasil.diterapkan.push(snap.exists() ? snap.val() : null);\n"
    + "    String((snap.exists() && snap.val() && snap.val().scoredQuestions) || '').split(',').filter(Boolean).forEach((m) => window._answeredQ.add(m));\n"
    + "    _markLoaded();\n"
    + "  }).catch((e) => { hasil.galat.push(String((e && e.message) || e)); _markLoaded(); });\n";
  const kodeLokal = `(function (me, key) {\n  const _markLoaded = () => { hasil.termuat += 1; };\n  ${blokTunggu}${badan}})`;
  const kodeGlobal = `(function (me, key) {\n  ${blokTunggu}${badan}})`;   // ragam Matematika 4 Modul-4: window._markLoaded
  const buat = (globalMarkLoaded = false) => {
    const s = { baca: [], jeda: [], peringatan: [], rekaman: null, hasil: { termuat: 0, diterapkan: [], galat: [] }, win: { _answeredQ: new Set() } };
    if (globalMarkLoaded) s.win._markLoaded = () => { s.hasil.termuat += 1; };
    const ctx = vm.createContext({
      window: s.win, hasil: s.hasil, db: {}, DB_PATH: "visitors/uji/slot-x",
      ref: (d, p) => ({ path: p }),
      get: (r) => {
        s.baca.push(r.path);
        const v = typeof s.rekaman === "function" ? s.rekaman(s.baca.length) : s.rekaman;
        if (v instanceof Error) return Promise.reject(v);
        return Promise.resolve({ exists: () => v != null, val: () => (v == null ? null : salinJson(v)) });
      },
      setTimeout: (fn, ms) => { s.jeda.push(ms); return setTimeout(fn, Math.ceil(Number(ms || 0) / 100)); },
      console: { warn: (...a) => s.peringatan.push(a.map(String).join(" ")) },
    });
    const f = vm.runInContext(globalMarkLoaded ? kodeGlobal : kodeLokal, ctx);
    s.jalankan = async (me = MHS_UJI) => {
      const n = s.hasil.termuat;
      f(me, "mhs_" + me.nim);
      await sampai(() => s.hasil.termuat > n, 3000);
      await tunggu(15);   // tidak ada pembacaan/penerapan tambahan sesudah selesai
    };
    return s;
  };
  const cekJeda = (skenario, s, n) => {
    if (s.jeda.length !== n || s.jeda.some((ms) => !(Number(ms) >= 500 && Number(ms) <= 5000))) gagal(skenario, `jeda baca ulang ${JSON.stringify(s.jeda)}, harap ${n} jeda 500–5000 ms`);
  };
  const cekSelesai = (skenario, s, { baca, diterapkan }) => {
    if (s.hasil.termuat !== 1) gagal(skenario, `_markLoaded dipanggil ${s.hasil.termuat}x, harap 1x`);
    if (s.hasil.galat.length) gagal(skenario, `galat ${JSON.stringify(s.hasil.galat)}`);
    if (s.baca.length !== baca) gagal(skenario, `record RTDB dibaca ${s.baca.length}x, harap ${baca}x`);
    if (JSON.stringify(s.hasil.diterapkan) !== JSON.stringify(diterapkan)) gagal(skenario, `snapshot diterapkan ${JSON.stringify(s.hasil.diterapkan)}, harap ${JSON.stringify(diterapkan)}`);
  };

  // 1) Record dibaca SESUDAH penantian getJawabanSaya selesai: snapshot yang
  //    diterapkan memuat penilaian yang terjadi selama penantian.
  {
    const s = buat();
    let lepas = null;
    s.win._muatJawabanSaya = () => new Promise((r) => { lepas = r; });
    s.rekaman = { scoredQuestions: "mc1,c2_comp_ulang", scoreDeltas: { mc1: 1, c2: 0 } };
    const jalan = s.jalankan();
    await tunggu(20);
    if (!lepas) gagal("tunggu dulu", "window._muatJawabanSaya() tidak dipanggil");
    if (s.baca.length) gagal("tunggu dulu", "record RTDB dibaca sebelum penantian getJawabanSaya selesai (harus sesudahnya)");
    s.rekaman = { scoredQuestions: "mc1,c2_comp", scoreDeltas: { mc1: 1, c2: 6 } };
    lepas(null);
    await jalan;
    cekSelesai("tunggu dulu", s, { baca: 1, diterapkan: [{ scoredQuestions: "mc1,c2_comp", scoreDeltas: { mc1: 1, c2: 6 } }] });
  }
  // 2) Penantian tidak ada, melempar, atau menolak: record tetap dibaca dan diterapkan.
  for (const [nama, muat] of [["tanpa _muatJawabanSaya", undefined], ["_muatJawabanSaya melempar", () => { throw new Error("uji"); }],
    ["_muatJawabanSaya menolak", () => Promise.reject(new Error("uji"))], ["_muatJawabanSaya berhasil", () => Promise.resolve({ selections: {} })]]) {
    const s = buat();
    if (muat) s.win._muatJawabanSaya = muat;
    s.rekaman = { scoredQuestions: "mc1" };
    await s.jalankan();
    cekSelesai(nama, s, { baca: 1, diterapkan: [{ scoredQuestions: "mc1" }] });
    cekJeda(nama, s, 0);
  }
  // 3) Snapshot yang tidak memuat marker BENAR yang sudah diketahui halaman
  //    (penilaian di sesi ini; cache listener tertinggal) dibaca ulang sampai segar.
  for (const [penanda, basi] of [["c2_comp", 1], ["mc1", 1], ["tf1", 1], ["ce2_comp", 1], ["ch1_comp", 1], ["c12_comp", 1], ["mc10", 1], ["c2_comp", 3]]) {
    const nama = `snapshot tertinggal ${basi}x (${penanda})`;
    const s = buat();
    s.win._answeredQ = new Set(["mc9", penanda]);
    s.rekaman = (n) => (n <= basi ? { scoredQuestions: "mc9,c2_comp_ulang" } : { scoredQuestions: "mc9," + penanda });
    await s.jalankan();
    cekSelesai(nama, s, { baca: basi + 1, diterapkan: [{ scoredQuestions: "mc9," + penanda }] });
    cekJeda(nama, s, basi);
    if (s.peringatan.length) gagal(nama, `peringatan tak perlu: ${s.peringatan.join(" | ")}`);
  }
  // 4) Tetap lebih tua: 5 bacaan (4 ulang), pemulihan dilewati, halaman tetap
  //    termuat, peringatan di console — juga untuk _markLoaded global.
  for (const globalMarkLoaded of [false, true]) {
    const nama = `snapshot tertinggal terus${globalMarkLoaded ? ", window._markLoaded" : ""}`;
    const s = buat(globalMarkLoaded);
    s.win._answeredQ = new Set(["c2_comp"]);
    s.rekaman = { scoredQuestions: "c2_comp_ulang" };
    await s.jalankan();
    await tunggu(40);
    cekSelesai(nama, s, { baca: 5, diterapkan: [] });
    cekJeda(nama, s, 4);
    if (s.peringatan.length !== 1 || !/lebih tua/.test(s.peringatan[0])) gagal(nama, `harap satu console.warn "lebih tua", ditemukan ${JSON.stringify(s.peringatan)}`);
  }
  // 5) Marker salah/partial/kirim ulang bukan penanda umur (pemulihan hanya
  //    menambah; kirim ulang CAD mengganti marker itu), dan snapshot yang memuat
  //    semua marker benar langsung diterapkan.
  for (const [nama, diketahui, rekaman] of [
    ["marker salah/partial bukan penanda umur", ["c2_comp_ulang", "mc4_mc_used", "tf2_tf_used", "c3_comp_used", "c11_comp_partial", "ch1_comp_partial"], "c2_comp"],
    ["semua marker benar ada", ["mc1", "tf1", "c1_comp", "ce2_comp", "ch1_comp"], "mc1,tf1,c1_comp,ce2_comp,ch1_comp,mc2_mc_used"],
  ]) {
    const s = buat();
    s.win._answeredQ = new Set(diketahui);
    s.rekaman = { scoredQuestions: rekaman };
    await s.jalankan();
    cekSelesai(nama, s, { baca: 1, diterapkan: [{ scoredQuestions: rekaman }] });
  }
  // 6) Record belum ada: diterapkan (jalur mahasiswa baru); record hilang
  //    padahal halaman tahu marker benar (reset dosen) → dilewati.
  {
    const s = buat();
    await s.jalankan();
    cekSelesai("record belum ada", s, { baca: 1, diterapkan: [null] });
    const s2 = buat();
    s2.win._answeredQ = new Set(["mc1"]);
    await s2.jalankan();
    await tunggu(40);
    cekSelesai("record hilang, marker benar diketahui", s2, { baca: 5, diterapkan: [] });
  }
  // 7) Identitas halaman berganti tanpa muat ulang (localStorage tab lain):
  //    marker bercampur, pemeriksaan umur mati — juga saat kembali ke NIM awal.
  {
    const s = buat();
    const A = MHS_UJI, B = { nama: "LAIN", nim: "41300000999", role: "student" };
    s.rekaman = { scoredQuestions: "mc1,c2_comp" };
    await s.jalankan(A);
    if (s.win._nimPemulihan !== A.nim) gagal("identitas berganti", `NIM pemulihan pertama tidak dicatat (${s.win._nimPemulihan})`);
    s.rekaman = { scoredQuestions: "mc5" };
    await s.jalankan(B);
    s.rekaman = { scoredQuestions: "mc1,c2_comp" };
    await s.jalankan(A);
    await tunggu(40);
    if (s.baca.length !== 3 || JSON.stringify(s.hasil.diterapkan) !== JSON.stringify([{ scoredQuestions: "mc1,c2_comp" }, { scoredQuestions: "mc5" }, { scoredQuestions: "mc1,c2_comp" }]) || s.hasil.termuat !== 3) {
      gagal("identitas berganti", `dibaca ${s.baca.length}x, diterapkan ${JSON.stringify(s.hasil.diterapkan)}, termuat ${s.hasil.termuat}x (harap 3/3/3: marker NIM lain bukan penanda umur)`);
    }
  }
  // 8) Pembacaan RTDB gagal: jalur .catch halaman (_markLoaded), tanpa penerapan.
  {
    const s = buat();
    s.rekaman = new Error("PERMISSION_DENIED");
    await s.jalankan();
    if (s.hasil.termuat !== 1 || s.hasil.diterapkan.length || s.hasil.galat.length !== 1) gagal("get() menolak", `termuat ${s.hasil.termuat}, diterapkan ${s.hasil.diterapkan.length}, galat ${JSON.stringify(s.hasil.galat)}`);
  }
}

async function periksaJawabanPrivat(page, relative, jenis) {
  const saran = "; jalankan node scripts/jawaban-privat.mjs";
  const modul = jenis === "Modul";
  const versi = { JEMBATAN: "v2", IDENTITAS: "v2", TUNGGU: "v2", GABUNG: "v2", ...(modul ? { "HURUF-ASAL": "v1" } : {}) };
  for (const [n, v] of Object.entries(versi)) {
    for (const ujung of [`BEGIN ${v}`, `END ${v}`]) {
      const k = page.split(`// JAWABAN-PRIVAT:${n} ${ujung}`).length - 1;
      if (k !== 1) throw new Error(`${relative}: penanda JAWABAN-PRIVAT:${n} ${ujung} muncul ${k}x, harusnya 1${saran}`);
    }
  }
  if (!modul && page.includes("JAWABAN-PRIVAT:HURUF-ASAL")) throw new Error(`${relative}: blok HURUF-ASAL hanya untuk halaman modul`);
  for (const ai of page.match(/<!-- AI-CHAT-AGENT:BEGIN[\s\S]*?<!-- AI-CHAT-AGENT:END[^>]*-->/g) || []) {
    if (/JAWABAN-PRIVAT|getJawabanSaya/.test(ai)) throw new Error(`${relative}: sisipan JAWABAN-PRIVAT/getJawabanSaya di dalam blok AI-CHAT-AGENT`);
  }
  const blok = (n) => ambilBlok(page, `// JAWABAN-PRIVAT:${n} BEGIN`, `// JAWABAN-PRIVAT:${n} END`, relative);
  const jembatan = blok("JEMBATAN"), identitas = blok("IDENTITAS"), gabung = blok("GABUNG");

  // ── Letak dan bentuk ──
  if ((page.match(/getJawabanSaya'/g) || []).length !== 1 || !jembatan.includes("window._getJawabanSayaCallable = httpsCallable(_functions, 'getJawabanSaya');\n")) {
    throw new Error(`${relative}: jembatan window._getJawabanSayaCallable harus tepat sekali di blok JEMBATAN${saran}`);
  }
  if (!jembatan.includes(modul ? "const _JAWABAN_SAYA_UNTUK = { modulId: MODUL_ID };" : "const _JAWABAN_SAYA_UNTUK = { examId: EXAM_ID };")) {
    throw new Error(`${relative}: getJawabanSaya harus dipanggil dengan ${modul ? "modulId" : "examId"} saja${saran}`);
  }
  {
    const m = /const _JAWABAN_SAYA_TUNGGU_MS = (\d+);/.exec(jembatan);
    if (!m || Number(m[1]) > 2500) throw new Error(`${relative}: batas tunggu getJawabanSaya di _loadScoredQuestions harus ≤ 2500 ms (ditemukan ${m ? m[1] : "-"})${saran}`);
  }
  if (!new RegExp(`// JAWABAN-PRIVAT:${modul ? "HURUF-ASAL END v1" : "JEMBATAN END v2"}\\nconst _generateExportCodeCallable = httpsCallable\\(_functions, 'generateExportCode'\\);\\n`).test(page)) {
    throw new Error(`${relative}: blok JEMBATAN${modul ? " + HURUF-ASAL" : ""} harus tepat sebelum \`const _generateExportCodeCallable = …\` (jangkar generator CAD)${saran}`);
  }
  // Record RTDB dibaca sesudah penantian getJawabanSaya; snapshot yang lebih tua
  // daripada marker benar yang sudah diketahui halaman tidak diterapkan (TUNGGU v2).
  await periksaTungguPemulihan(page, relative);
  if (!gabung.includes("\n    if (typeof window._gabungJawabanSaya === 'function') window._gabungJawabanSaya(data);\n    else { delete data.selections; delete data.codes; delete data.mcOrderVersion; }\n")) {
    throw new Error(`${relative}: blok GABUNG harus memanggil window._gabungJawabanSaya(data) dan membuang selections/codes publik bila jembatan tidak ada${saran}`);
  }
  const lanjutGabung = modul ? "    // PILIHAN-PG-PULIH BEGIN" : "    _cachedFirebaseData = data;";
  if (!page.includes("\n    const data = snap.val();\n    " + gabung + lanjutGabung)) {
    throw new Error(`${relative}: blok GABUNG harus tepat sesudah \`const data = snap.val();\` dan sebelum ${modul ? "PILIHAN-PG-PULIH" : "`_cachedFirebaseData = data;`"}${saran}`);
  }
  {
    const t = page.indexOf("// JAWABAN-PRIVAT:TUNGGU BEGIN"), g = page.indexOf("// JAWABAN-PRIVAT:GABUNG BEGIN");
    const d = page.lastIndexOf("window._loadScoredQuestions = function", t);
    if (d < 0 || g < t || page.slice(d, g).includes("\n};\n")) throw new Error(`${relative}: blok TUNGGU/GABUNG harus di _loadScoredQuestions yang sama${saran}`);
  }
  if (modul) {
    const acak = page.indexOf("\nif (typeof shuffleMCOptions === 'function') shuffleMCOptions();");
    if (acak >= 0 && acak < page.indexOf("// JAWABAN-PRIVAT:HURUF-ASAL BEGIN")) throw new Error(`${relative}: HURUF-ASAL harus berjalan sebelum urutan acak per NIM diterapkan`);
  }
  // Tidak ada pembacaan data.selections/data.codes lain sebelum GABUNG membuangnya.
  {
    const t = page.indexOf("// JAWABAN-PRIVAT:TUNGGU BEGIN"), g = page.indexOf("// JAWABAN-PRIVAT:GABUNG BEGIN");
    if (/data\.(?:selections|codes)\b/.test(page.slice(t, g))) throw new Error(`${relative}: data.selections/data.codes dibaca sebelum blok GABUNG`);
  }

  // ── Penangan galat penilaian: resource-exhausted = penguncian PIN ──
  {
    const cabang = modul
      ? "  else if (code === 'resource-exhausted')  msg = '⏳ Terlalu banyak percobaan PIN untuk NIM ini. Coba lagi dalam ' + Math.max(1, Math.ceil(Number(err && err.details && err.details.remainingSeconds) || 60)) + ' detik.';   // penguncian PIN (JAWABAN-PRIVAT), bukan sesi kedaluwarsa\n  else if (code === 'not-found')"
      : "  } else if (code === 'resource-exhausted') {\n    // Penguncian PIN (JAWABAN-PRIVAT): bukan sesi kedaluwarsa — sesi PIN tetap.\n    msg = '⏳ Terlalu banyak percobaan PIN untuk NIM ini. Coba lagi dalam ' + Math.max(1, Math.ceil(Number(err && err.details && err.details.remainingSeconds) || 60)) + ' detik.';\n  } else if (code === 'not-found') {";
    if (page.split(cabang).length !== 2 || page.split("code === 'resource-exhausted'").length !== 2) {
      throw new Error(`${relative}: ${modul ? "_handleModulServerError" : "_handleServerExamError"} harus menampilkan resource-exhausted sebagai penguncian PIN (details.remainingSeconds), tepat sebelum cabang not-found${saran}`);
    }
  }

  // ── Kait berkas CAD: berkas terunggah yang belum dinilai bisa dikirim tanpa unggah ulang ──
  if (page.includes("window._ringkasTugasCad = function")) {
    for (const [nama, teks] of [
      ["kait", "window._tandaiBerkasDiServer = function(qId) {\n  if (compAnswered[qId]) return;\n  berkasDiServer[qId] = true;\n  _refreshTugasBtn(qId);\n"],
      ["tombol", "  const siap = (!!berkasTerunggah[qId] || !!berkasDiServer[qId]) && _parseNilai(inp && inp.value) !== null;\n"],
      ["gerbang kirim", "  if (!berkasTerunggah[qId] && !berkasDiServer[qId]) { if (fb) { fb.className = 'feedback warn';"],
      ["konfirmasi", "const namaB = berkasTerunggah[qId] ? berkasTerunggah[qId].namaBerkas : 'yang terakhir diunggah';"],
    ]) {
      if (page.split(teks).length !== 2) throw new Error(`${relative}: ${nama} berkas CAD belum dinilai (berkasDiServer/_tandaiBerkasDiServer) tidak ditemukan tepat sekali; jalankan generator CAD (bangun-modul-1.py / cad-exam/bangun.py)`);
    }
  }

  // ── Identitas localStorage tanpa field jawaban ──
  const simpan = (page.match(/localStorage\.setItem\(\s*(?:LOCAL_IDENTITY|LK)\b[^\n]*/g) || []);
  if (simpan.length !== 1 || simpan[0] !== "localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(_identitasTanpaJawaban(v)));"
    && !simpan[0].startsWith("localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(_identitasTanpaJawaban(v)));}")) {
    throw new Error(`${relative}: identitas localStorage hanya boleh disimpan saveIdentity lewat _identitasTanpaJawaban(v) (ditemukan: ${simpan.join(" | ")})${saran}`);
  }
  if (!/function saveIdentity\(v\)\s?\{\n?\s*localStorage\.setItem\(LOCAL_IDENTITY, JSON\.stringify\(_identitasTanpaJawaban\(v\)\)\);/.test(page)) {
    throw new Error(`${relative}: saveIdentity harus menyimpan _identitasTanpaJawaban(v) di baris pertamanya${saran}`);
  }
  // Identitas sesudah login: nama/NIM dari alur login, bukan salinan record visitors/.
  {
    const mentah = [...page.matchAll(/(?<!function )\bsaveIdentity\(\s*([A-Za-z_$][\w$]*)\s*\)/g)].map((m) => m[1]);
    if (mentah.length) throw new Error(`${relative}: saveIdentity(${mentah.join(", ")}) menyimpan record apa adanya — identitas login harus lewat _identitasLogin(…, nama, nim)${saran}`);
    const login = page.match(/saveIdentity\(_identitasLogin\((?:visitorRec|updated|newVisitor|newRecord), nama, nim\)\);/g) || [];
    if (login.length < 3) throw new Error(`${relative}: hanya ${login.length} saveIdentity(_identitasLogin(…)) (harap submitVisitor, PIN baru, verifikasi PIN)${saran}`);
  }

  // ── Tidak ada tulisan klien yang mengirim ulang record lama ──
  for (const m of page.matchAll(/\b(set|update)\(\s*(ref\(db,\s*(?:DB_PATH \+ '\/' \+ key|`\$\{DB_PATH\}\/\$\{_key\}`)\)|nodeRef)\s*,\s*([^\n]{0,40})/g)) {
    const [, op, , sisa] = m;
    if (op === "set" || !/^patch\)/.test(sisa)) {
      const baris = page.slice(0, m.index).split("\n").length;
      throw new Error(`${relative}:${baris}: ${op}() record pengunjung dengan payload "${sisa.trim()}" — tulisan klien harus lewat _tulisPengunjung (record baru → set; record lama → update kunjungan) atau patch kunjungan${saran}`);
    }
  }
  if (page.includes("freshRec")) throw new Error(`${relative}: cadangan freshRec (set() ulang seluruh record sesudah PERMISSION_DENIED) masih ada — rules create-only selalu menolaknya${saran}`);
  for (const m of page.matchAll(/const patch = \{[^}]*\}/g)) {
    if (/\.\.\.|\b(?:selections|codes|scoreDeltas|pinHash|pinSetAt)\b/.test(m[0])) throw new Error(`${relative}: patch kunjungan membawa field jawaban/PIN`);
  }
  for (const m of page.matchAll(/\bpatch\.(\w+)\s*=\s*([^;\n]*)/g)) {
    if (!["pinHash", "pinSetAt"].includes(m[1]) || m[2].trim() !== "null") throw new Error(`${relative}: patch.${m[1]} = ${m[2]} — patch kunjungan hanya boleh menghapus pinHash/pinSetAt lama`);
  }
  let tulisPengunjung = 0;
  for (const m of page.matchAll(/(?<!function )\b_tulisPengunjung\(/g)) {
    const tutup = tutupPanggilanUji(page, m.index + "_tulisPengunjung".length);
    const isi = page.slice(m.index, tutup + 1);
    if (!/, (?:ex|existingVisitor|state)\)$/.test(isi)) throw new Error(`${relative}: ${isi.slice(0, 80)}… — argumen ketiga _tulisPengunjung harus record lama (ex/existingVisitor/state)`);
    tulisPengunjung += 1;
  }
  if (tulisPengunjung < 3) throw new Error(`${relative}: hanya ${tulisPengunjung} tulisan lewat _tulisPengunjung (kunjungan auto-login, PIN baru, konsolasi)${saran}`);
  if (/_awardCompHardPoint = function\(qId\)|codes:\s*codes\b/.test(page)) throw new Error(`${relative}: penulis klien lama _awardCompHardPoint (menulis codes) masih ada${saran}`);
  if (!/import \{[^}]*\bupdate\b[^}]*\} from "https:\/\/www\.gstatic\.com\/firebasejs\/12\.11\.0\/firebase-database\.js";/.test(page)) {
    throw new Error(`${relative}: update belum diimpor dari firebase-database (dipakai _tulisPengunjung)${saran}`);
  }

  // ── Sandbox: identitas dan penulis record pengunjung ──
  {
    const lamaPenuh = { nama: "TES", nim: NIM_UJI, role: "student", timestamp: "2026-09-01T00:00:00Z", lastVisit: "2026-09-01T00:00:00Z", visitCount: 2, points: 5, scoredQuestions: "mc1,c1_comp",
      selections: { mc1: "A" }, codes: { c1: "print(1)" }, scoreDeltas: { mc1: 1 }, pinHash: "b".repeat(64), pinSetAt: "2026-01-01T00:00:00Z" };
    // Record "diduduki" lebih dulu oleh orang lain: peran dosen, nama/NIM palsu.
    const duduki = { nama: "Dedik Romahadi", nim: "41300000999", role: "dosen", timestamp: "2026-09-01T00:00:00Z", visitCount: 500, points: 0, scoredQuestions: "", consolationAwarded: true };
    const toko = new Map([
      ["uji_identity_a", JSON.stringify(lamaPenuh)],
      ["uji_identity_b", JSON.stringify({ nama: "TES", nim: NIM_UJI, role: "student" })],
      ["uji_identity_c", JSON.stringify({ nama: "TES", nim: NIM_UJI, role: "dosen" })],
      ["uji_identity_dosen", JSON.stringify({ nama: "Dedik Romahadi", nim: "DOSEN", role: "dosen" })],
      ["uji_draft_a", JSON.stringify({ selections: { mc1: "A" } })],
      ["uji_identity_rusak", "{"],
    ]);
    const localStorage = { get length() { return toko.size; }, key: (i) => [...toko.keys()][i] ?? null, getItem: (k) => (toko.has(k) ? toko.get(k) : null), setItem: (k, v) => { toko.set(k, String(v)); } };
    const tulis = [];
    const ctx = vm.createContext({
      localStorage,
      set: (r, v) => { tulis.push(["set", r, salinJson(v)]); return Promise.resolve(); },
      update: (r, v) => { tulis.push(["update", r, salinJson(v)]); return Promise.resolve(); },
    });
    vm.runInContext(identitas, ctx);
    const bersih = JSON.parse(toko.get("uji_identity_a"));
    if (FIELD_JAWABAN.some((f) => f in bersih) || bersih.nim !== NIM_UJI || bersih.visitCount !== 2) throw new Error(`${relative}: salinan identitas lama di localStorage tidak dibersihkan: ${toko.get("uji_identity_a")}`);
    if (JSON.parse(toko.get("uji_identity_c")).role !== "student") throw new Error(`${relative}: identitas ber-NIM mahasiswa berperan dosen di localStorage tidak dikembalikan ke 'student'`);
    if (toko.get("uji_identity_dosen") !== JSON.stringify({ nama: "Dedik Romahadi", nim: "DOSEN", role: "dosen" })) throw new Error(`${relative}: identitas dosen ikut diubah pembersih`);
    if (toko.get("uji_draft_a") !== JSON.stringify({ selections: { mc1: "A" } }) || toko.get("uji_identity_rusak") !== "{") throw new Error(`${relative}: pembersih identitas menyentuh kunci lain`);
    const id = salinJson(ctx._identitasTanpaJawaban(lamaPenuh));
    if (JSON.stringify(Object.keys(id)) !== JSON.stringify(["nama", "nim", "role", "timestamp", "lastVisit", "visitCount", "points", "scoredQuestions"])) throw new Error(`${relative}: _identitasTanpaJawaban → ${JSON.stringify(id)}`);
    const login = salinJson(ctx._identitasTanpaJawaban(ctx._identitasLogin({ ...duduki, visitCount: 500, lastVisit: "t" }, "TES MAHASISWA SATU", NIM_UJI)));
    if (login.nama !== "TES MAHASISWA SATU" || login.nim !== NIM_UJI || login.role !== "student") throw new Error(`${relative}: _identitasLogin mengambil identitas dari record (${JSON.stringify(login)})`);
    await ctx._tulisPengunjung("baru", { nama: "TES", nim: NIM_UJI, role: "student", timestamp: "t", lastVisit: "t", visitCount: 1, points: 0, scoredQuestions: "", selections: { mc1: "A" }, consolationAwarded: false }, null);
    await ctx._tulisPengunjung("kunjungan", { ...lamaPenuh, visitCount: 3, lastVisit: "2026-09-29T00:00:00Z" }, lamaPenuh);
    const tanpaPin = { ...lamaPenuh };
    delete tanpaPin.pinHash; delete tanpaPin.pinSetAt;
    await ctx._tulisPengunjung("tetap", { ...tanpaPin }, tanpaPin);
    await ctx._tulisPengunjung("konsolasi", Object.assign({}, lamaPenuh, { points: 1, pointTimestamp: "t2", consolationAwarded: true }), lamaPenuh);
    await ctx._tulisPengunjung("diduduki", ctx._identitasLogin({ ...duduki, visitCount: 501, lastVisit: "2026-09-29T00:00:00Z" }, "TES MAHASISWA SATU", NIM_UJI), duduki);
    const harap = JSON.stringify([
      ["set", "baru", { nama: "TES", nim: NIM_UJI, role: "student", timestamp: "t", lastVisit: "t", visitCount: 1, points: 0, scoredQuestions: "" }],
      ["update", "kunjungan", { visitCount: 3, lastVisit: "2026-09-29T00:00:00Z", pinHash: null, pinSetAt: null }],
      ["update", "konsolasi", { pinHash: null, pinSetAt: null }],
      ["update", "diduduki", { visitCount: 501, lastVisit: "2026-09-29T00:00:00Z" }],
    ]);
    if (JSON.stringify(tulis) !== harap) throw new Error(`${relative}: _tulisPengunjung menulis ${JSON.stringify(tulis)}, harap ${harap} (record lama: hanya visitCount/lastVisit + hapus pinHash/pinSetAt)`);
  }

  // ── Sandbox: jembatan getJawabanSaya ──
  const rekaman = () => ({ timestamp: "2026-09-20T01:00:00Z", scoredQuestions: "mc1,mc2_mc_used,mc3,tf1,c1_comp,c2_comp_used", selections: { mc9: "A" }, codes: { c9: "kode lama" }, mcOrderVersion: { mc9: 1 }, scoreDeltas: { mc1: 1, c1: 1.3 } });
  const tanpaPublik = () => { const { selections, codes, mcOrderVersion, ...r } = rekaman(); return r; };
  const cekTanpaPublik = (data, label) => {
    if (JSON.stringify(salinJson(data)) !== JSON.stringify(tanpaPublik())) throw new Error(`${relative}: ${label}: selections/codes publik tidak dibuang atau data lain berubah (${JSON.stringify(data)})`);
  };
  {
    // Callable ada: sekali per NIM + hash PIN; pilihan/kode HANYA dari respons
    // berdaftar-putih (sisa field publik mc9/c9 dibuang), scoreDelta ledger
    // menang atas RTDB (c1: 1.3 → 2).
    for (const cad of [false, true]) {
      const s = sandboxJembatan(jembatan, jenis, { cad });
      const h = await s.win._muatJawabanSaya(500);
      await s.win._muatJawabanSaya(500);
      if (!h) throw new Error(`${relative}: _muatJawabanSaya tidak mengembalikan hasil callable`);
      const harapPayload = JSON.stringify(modul ? { nim: NIM_UJI, pinHash: HASH_UJI, modulId: "uji-modul-x" } : { nim: NIM_UJI, pinHash: HASH_UJI, examId: "uji-ujian-x" });
      if (s.panggilan.length !== 1 || JSON.stringify(s.panggilan[0]) !== harapPayload) throw new Error(`${relative}: getJawabanSaya dipanggil ${JSON.stringify(s.panggilan)}, harap sekali dengan ${harapPayload}`);
      const data = salinJson(s.win._gabungJawabanSaya(rekaman()));
      const harap = {
        timestamp: "2026-09-20T01:00:00Z", scoredQuestions: "mc1,mc2_mc_used,mc3,tf1,c1_comp,c2_comp_used",
        scoreDeltas: { mc1: 1, c1: 2, mc2: 0, mc3: 1, tf1: 0, c2: 0, c3: 6 },
        selections: { mc1: "B", mc2: "D", mc3: 2, tf1: false },
        codes: cad ? { c4: RESPONS_UJI.berkas.c4, c1: "print(42)", c3: "📎 dinilai.FCStd · 1.0 KB" } : { c1: "print(42)", c3: "📎 dinilai.FCStd · 1.0 KB" },
        mcOrderVersion: { mc1: 1, mc2: 0 },
      };
      if (JSON.stringify(data) !== JSON.stringify(harap)) throw new Error(`${relative}: gabungan getJawabanSaya${cad ? " (halaman berkas)" : ""} = ${JSON.stringify(data)}, harap ${JSON.stringify(harap)}`);
      if (/KUNCI-RAHASIA|PENJELASAN-RAHASIA|3\.14159|\.\.\//.test(JSON.stringify(data))) throw new Error(`${relative}: field di luar daftar putih ikut tergabung`);
      if (JSON.stringify(s.tandai) !== JSON.stringify(cad ? ["c4"] : [])) throw new Error(`${relative}: kait _tandaiBerkasDiServer dipanggil untuk ${JSON.stringify(s.tandai)}, harap ${cad ? '["c4"]' : "tidak sama sekali"}`);
    }
    // scoreDelta 0 pada jawaban benar tanpa nilai RTDB (entri cadangan): poin
    // tak diketahui → cadangan halaman; dengan nilai RTDB → ledger 0 menang
    // (rescale ujian di luar jendela).
    {
      const s = sandboxJembatan(jembatan, jenis, { respons: { jawaban: {
        mc5: { tipe: "mc", pilihan: "A", mcOrderVersion: 0, status: "correct", scoreDelta: 0 },
        c7: { tipe: "comp", status: "correct", scoreDelta: 0 }, c8: { tipe: "comp", status: "wrong", scoreDelta: 0 } }, berkas: {} } });
      await s.win._muatJawabanSaya(500);
      const d = salinJson(s.win._gabungJawabanSaya({ scoredQuestions: "mc5,c7_comp,c8_comp_used", scoreDeltas: { c7: 2 } })).scoreDeltas;
      if (JSON.stringify(d) !== JSON.stringify({ c7: 0, c8: 0 })) throw new Error(`${relative}: scoreDelta 0 ledger/cadangan: ${JSON.stringify(d)}, harap {"c7":0,"c8":0}`);
    }
    // Belum ter-deploy (not-found) / tanpa jembatan: tanpa galat, field publik
    // dibuang (tidak ada cadangan publik), kegagalan di-cache, tanpa coba ulang.
    for (const [nama, opsi] of [["belum ter-deploy", { gagal: true }], ["tidak ada", { tanpaCallable: true }]]) {
      const s = sandboxJembatan(jembatan, jenis, opsi);
      const h1 = await s.win._muatJawabanSaya(500), h2 = await s.win._muatJawabanSaya(500);
      await tunggu(60);
      if (h1 !== null || h2 !== null) throw new Error(`${relative}: callable ${nama}: hasil bukan null`);
      cekTanpaPublik(s.win._gabungJawabanSaya(rekaman()), `callable ${nama}`);
      if (s.panggilan.length !== (opsi.gagal ? 1 : 0)) throw new Error(`${relative}: callable ${nama}: dipanggil ${s.panggilan.length}x (not-found harus di-cache per muat halaman)`);
      if (opsi.gagal && !s.peringatan.some((w) => /getJawabanSaya gagal/.test(w))) throw new Error(`${relative}: kegagalan getJawabanSaya tidak dilaporkan di console.warn`);
    }
    // Gagal sementara (internal): dicoba lagi otomatis, hasilnya diterapkan.
    {
      const s = sandboxJembatan(jembatan, jenis, { galat: { code: "functions/internal", kali: 1 } });
      const cache = rekaman(); s.win._cache = cache;
      if ((await s.win._muatJawabanSaya(500)) !== null) throw new Error(`${relative}: gagal sementara: hasil bukan null`);
      cekTanpaPublik(s.win._gabungJawabanSaya(cache), "gagal sementara");
      await sampai(() => s.panggilan.length >= 2 && s.win._ulang >= 1);
      await tunggu(20);
      if (s.panggilan.length !== 2) throw new Error(`${relative}: gagal sementara: getJawabanSaya dipanggil ${s.panggilan.length}x, harap 2x (coba ulang otomatis)`);
      if (s.win._ulang !== 1) throw new Error(`${relative}: gagal sementara: hasil coba ulang diterapkan ${s.win._ulang}x, harap 1x`);
      if (!modul && (cache.selections.mc1 !== "B" || cache.codes.c1 !== "print(42)")) throw new Error(`${relative}: gagal sementara: hasil coba ulang tidak digabung ke _cachedFirebaseData`);
    }
    // Gagal sementara terus-menerus: _loadScoredQuestions berikutnya memanggil
    // lagi, coba ulang otomatis berbatas (tidak berulang tanpa akhir).
    {
      const s = sandboxJembatan(jembatan, jenis, { galat: { code: "functions/unavailable", kali: Infinity } });
      await s.win._muatJawabanSaya(500);
      await s.win._muatJawabanSaya(500);
      if (s.panggilan.length < 2) throw new Error(`${relative}: gagal sementara: _muatJawabanSaya berikutnya tidak memanggil lagi (kegagalan sementara tidak boleh di-cache)`);
      // Stabil = tidak ada panggilan baru selama 300 ms (coba ulang terjadwal 30/100 ms, dipercepat).
      let n = s.panggilan.length, stabil = 0;
      for (let i = 0; i < 40 && stabil < 3; i += 1) { await tunggu(100); if (s.panggilan.length === n) stabil += 1; else { n = s.panggilan.length; stabil = 0; } }
      if (n > 5 || stabil < 3) throw new Error(`${relative}: gagal sementara terus-menerus: coba ulang otomatis tidak berbatas (${n} panggilan, belum berhenti)`);
      if (s.win._sessionPinHash !== HASH_UJI) throw new Error(`${relative}: gagal sementara mengakhiri sesi PIN`);
    }
    // Penguncian PIN (resource-exhausted): sesi PIN tetap, pemberitahuan "coba
    // lagi dalam N detik", tidak memanggil lagi selama terkunci, lalu dicoba lagi.
    {
      const dom = domPemberitahuan();
      const s = sandboxJembatan(jembatan, jenis, { galat: { code: "functions/resource-exhausted", details: { remainingSeconds: 3 }, kali: 1 }, dom });
      const cache = rekaman(); s.win._cache = cache;
      await s.win._muatJawabanSaya(500);
      if (s.win._sessionPinHash !== HASH_UJI) throw new Error(`${relative}: penguncian PIN mengakhiri sesi PIN (harus tetap)`);
      if (s.mintaPin.length) throw new Error(`${relative}: penguncian PIN diperlakukan sebagai sesi kedaluwarsa (PIN diminta lagi)`);
      const info = dom._el.jawabanSayaInfo;
      if (!info || !/coba lagi dalam 3 detik/.test(info.textContent) || info.attr.role !== "status") throw new Error(`${relative}: penguncian PIN tanpa pemberitahuan "coba lagi dalam 3 detik" (${info && info.textContent})`);
      if ((await s.win._muatJawabanSaya(500)) !== null || s.panggilan.length !== 1) throw new Error(`${relative}: getJawabanSaya dipanggil lagi selama terkunci (${s.panggilan.length}x)`);
      await sampai(() => s.panggilan.length >= 2 && s.win._ulang >= 1 && !dom._el.jawabanSayaInfo);
      if (s.panggilan.length !== 2 || s.win._ulang !== 1) throw new Error(`${relative}: sesudah remainingSeconds tidak dicoba lagi/diterapkan (panggil ${s.panggilan.length}x, terapkan ${s.win._ulang}x)`);
      if (dom._el.jawabanSayaInfo) throw new Error(`${relative}: pemberitahuan penguncian PIN tidak ditutup sesudah berhasil`);
    }
    // Hash PIN sesi ditolak (unauthenticated): sesi dibuang, PIN diminta lagi,
    // tidak diulang dengan hash yang sama; PIN baru → dipanggil lagi.
    for (const pinAda of [true, false]) {
      const dom = domPemberitahuan();
      const s = sandboxJembatan(jembatan, jenis, { galat: { code: "functions/unauthenticated", kali: 1 }, pinAda, dom });
      await s.win._muatJawabanSaya(500);
      await sampai(() => s.win._sessionPinHash === null && (s.mintaPin.length > 0 || !!dom._el.jawabanSayaInfo), 1000);
      if (s.win._sessionPinHash !== null) throw new Error(`${relative}: hash PIN sesi yang ditolak tidak dibuang`);
      if (modul) {
        if (pinAda && (JSON.stringify(s.mintaPin) !== JSON.stringify([["modal", MHS_UJI.nama]]) || !s.ctx._pinFlow || s.ctx._pinFlow.nim !== NIM_UJI || s.ctx._pinFlow.existingPin.pinHash !== "\u0001exists")) {
          throw new Error(`${relative}: hash ditolak: modal PIN tidak diminta dengan _pinFlow mahasiswa (${JSON.stringify(s.mintaPin)})`);
        }
        if (!pinAda && (s.mintaPin.length || !dom._el.jawabanSayaInfo || !/di-reset/.test(dom._el.jawabanSayaInfo.textContent))) throw new Error(`${relative}: PIN di-reset: harus memberi tahu (bukan meminta PIN)`);
      } else if (s.mintaPin.length !== 1 || s.mintaPin[0][0] !== "ulang") throw new Error(`${relative}: hash ditolak: _promptPinReentry tidak dipanggil (${JSON.stringify(s.mintaPin)})`);
      if ((await s.win._muatJawabanSaya(500)) !== null || s.panggilan.length !== 1) throw new Error(`${relative}: getJawabanSaya diulang dengan hash yang ditolak`);
      s.win._sessionPinHash = HASH_UJI_2;
      if (!(await s.win._muatJawabanSaya(500)) || s.panggilan.length !== 2 || s.panggilan[1].pinHash !== HASH_UJI_2) throw new Error(`${relative}: sesudah PIN baru getJawabanSaya tidak dipanggil lagi`);
      if (!pinAda || !modul) break;
    }
    // Tanpa sesi PIN (tab baru): tidak memanggil; sesudah verifikasi PIN: memanggil.
    {
      const s = sandboxJembatan(jembatan, jenis, { pinHash: null });
      if ((await s.win._muatJawabanSaya(500)) !== null || s.panggilan.length) throw new Error(`${relative}: getJawabanSaya dipanggil tanpa sesi PIN`);
      cekTanpaPublik(s.win._gabungJawabanSaya(rekaman()), "tanpa sesi PIN");
      s.win._sessionPinHash = HASH_UJI;
      if (!(await s.win._muatJawabanSaya(500)) || s.panggilan.length !== 1) throw new Error(`${relative}: getJawabanSaya tidak dipanggil sesudah verifikasi PIN`);
    }
    // Dosen, tamu, dan tanpa identitas: tidak memanggil.
    for (const me of [{ nama: "Dedik Romahadi", nim: "DOSEN", role: "dosen" }, { nama: "Tamu", role: "guest" }, null]) {
      const s = sandboxJembatan(jembatan, jenis, { me });
      await tunggu(5);
      if ((await s.win._muatJawabanSaya(500)) !== null || s.panggilan.length) throw new Error(`${relative}: getJawabanSaya dipanggil untuk identitas ${JSON.stringify(me)}`);
    }
    // Identitas berganti: hasil milik NIM lain tidak pernah digabung.
    {
      const s = sandboxJembatan(jembatan, jenis);
      await s.win._muatJawabanSaya(500);
      s.ctx.identitas = { nama: "LAIN", nim: "41300000999", role: "student" };
      cekTanpaPublik(s.win._gabungJawabanSaya(rekaman()), "jawaban NIM lain");
    }
    // Akun simulasi: respons kosong → tidak ada jawaban yang dipulihkan; marker
    // dan scoreDeltas record tetap.
    {
      const s = sandboxJembatan(jembatan, jenis, { respons: { jawaban: {}, berkas: {}, simulasi: true } });
      await s.win._muatJawabanSaya(500);
      cekTanpaPublik(s.win._gabungJawabanSaya(rekaman()), "akun simulasi");
    }
    // Callable lambat: batas tunggu habis → null; hasil terlambat tetap diterapkan
    // (modul: _loadScoredQuestions diulang; ujian: cache digabung lalu reapply).
    // Tanpa argumen, batas tunggu bawaan (≤ 2,5 dtk, dipercepat) lebih pendek dari
    // callable 8 detik.
    for (const [batas, tundaMs] of [[20, 120], [undefined, 8000]]) {
      const s = sandboxJembatan(jembatan, jenis, { tundaMs });
      const cache = rekaman(); cache.selections = {}; cache.codes = {};
      s.win._cache = cache;
      if ((await s.win._muatJawabanSaya(batas)) !== null) throw new Error(`${relative}: batas tunggu getJawabanSaya ${batas === undefined ? "bawaan" : batas + " ms"} tidak berlaku`);
      await sampai(() => s.win._ulang >= 1);
      await tunggu(30);
      if (s.win._ulang !== 1) throw new Error(`${relative}: hasil getJawabanSaya yang terlambat diterapkan ${s.win._ulang}x, harap 1x`);
      if (!modul && (cache.selections.mc1 !== "B" || cache.codes.c1 !== "print(42)")) throw new Error(`${relative}: hasil terlambat tidak digabung ke _cachedFirebaseData`);
      if (modul && Object.keys(cache.selections).length) throw new Error(`${relative}: modul tidak memakai cache ujian`);
    }
  }

  // ── Sandbox (modul): pemulihan PG terpadu JEMBATAN + HURUF-ASAL + GABUNG + PULIH ──
  if (modul) {
    const hurufAsal = blok("HURUF-ASAL");
    const pulih = ambilBlok(page, "    // PILIHAN-PG-PULIH BEGIN v3", "    // PILIHAN-PG-PULIH END v3", relative);
    const skenario = async (nama, { acak, respons, gagal = false, tanpaCallable = false, data, harap }) => {
      const grup = {};
      for (let q = 1; q <= 3; q += 1) {
        grup[`mc${q}`] = ["A", "B", "C", "D"].map((h) => {
          const kelas = new Set();
          const onclick = acak ? `selectMC('mc${q}',this)` : `selectMC('mc${q}',this,'${h}')`;
          return { asal: h, kelas, dataset: {}, classList: { add: (...k) => k.forEach((x) => kelas.add(x)), remove: (...k) => k.forEach((x) => kelas.delete(x)), contains: (k) => kelas.has(k) }, getAttribute: (n) => (n === "onclick" ? onclick : null) };
        });
      }
      const rg = (q) => ({ id: `rg-${q}`, querySelectorAll: () => grup[q].slice() });
      const dom = {
        getElementById: (id) => (grup[id.replace(/^rg-/, "")] ? rg(id.replace(/^rg-/, "")) : null),
        querySelectorAll: (sel) => (sel === '.radio-group[id^="rg-mc"]' ? Object.keys(grup).map(rg) : []),
      };
      const s = sandboxJembatan(jembatan, jenis, { respons, gagal, tanpaCallable, dom });
      s.win.shuffleMCOptions = () => {
        if (!acak) return false;
        if (Object.values(grup).flat().some((o) => o.dataset.displayLetter)) return true;
        for (const opsi of Object.values(grup)) { opsi.reverse(); opsi.forEach((o, i) => { o.dataset.displayLetter = String.fromCharCode(65 + i); }); }
        return true;
      };
      vm.runInContext(hurufAsal, s.ctx);
      await s.win._muatJawabanSaya(500);
      s.ctx.data = data;
      s.ctx.console.warn = (...a) => { throw new Error(`blok melempar: ${a.map(String).join(" ")}`); };
      vm.runInContext(`(function (data) {\n${gabung}\n${pulih}\n})(data);`, s.ctx);
      const hasil = {};
      for (const [q, opsi] of Object.entries(grup)) hasil[q] = opsi.map((o) => `${o.asal}:${[...o.kelas].sort().join("+")}`).join(" ");
      for (const [q, h] of Object.entries(harap)) if (hasil[q] !== h) throw new Error(`${relative}: pemulihan PG terpadu (${nama}) ${q} = "${hasil[q]}", harap "${h}"`);
    };
    const ledgerAcak = { jawaban: { mc1: { tipe: "mc", pilihan: "A", mcOrderVersion: 1, status: "correct", scoreDelta: 1 }, mc2: { tipe: "mc", pilihan: "B", mcOrderVersion: 0, status: "wrong", scoreDelta: 0 } }, berkas: {} };
    // Callable ada: record publik tanpa selections, atau dengan selections
    // tanaman orang lain (diabaikan; ledger yang menentukan).
    for (const selections of [undefined, { mc1: "C", mc2: "D", mc3: "A" }]) {
      await skenario(`acak, callable ada${selections ? ", selections publik tanaman" : ""}`, {
        acak: true, respons: ledgerAcak,
        data: { timestamp: "2026-08-06T00:00:00Z", scoredQuestions: "mc1,mc2_mc_used,mc3", ...(selections ? { selections } : {}) },
        harap: { mc1: "D:correct-ans+selected C: B: A:", mc2: "D: C: B:selected+wrong-ans A:", mc3: "D: C: B: A:" },
      });
    }
    await skenario("kanonik, callable ada", {
      acak: false, respons: { jawaban: { mc1: { tipe: "mc", pilihan: "c", mcOrderVersion: 0, status: "correct", scoreDelta: 1 } }, berkas: {} },
      data: { scoredQuestions: "mc1,mc2_mc_used" },
      harap: { mc1: "A: B: C:correct-ans+selected D:", mc2: "A: B: C: D:" },
    });
    // Callable gagal/belum ter-deploy: selections publik (sisa lama atau
    // tanaman) TIDAK dipakai — tidak ada yang ditandai, ekspor memakai teks netral.
    for (const [nama, opsi] of [["gagal", { gagal: true }], ["belum ter-deploy", { tanpaCallable: true }]]) {
      for (const acak of [true, false]) {
        await skenario(`${acak ? "acak" : "kanonik"}, callable ${nama}, selections publik`, {
          acak, ...opsi,
          data: { timestamp: "2026-09-20T01:00:00Z", scoredQuestions: "mc1,mc2_mc_used", selections: { mc1: "A", mc2: "B" }, mcOrderVersion: { mc1: 1, mc2: 1 } },
          harap: acak ? { mc1: "D: C: B: A:", mc2: "D: C: B: A:" } : { mc1: "A: B: C: D:", mc2: "A: B: C: D:" },
        });
      }
    }
  }
}
for (const [isi, relative] of blokPollUnik) await simulasiPilihanPoll(isi, relative);
if (blokPollUnik.size !== 1) throw new Error(`PILIHAN-POLL-FORUM blocks differ across module pages (${blokPollUnik.size} variants); rerun node scripts/simpan-pilihan-poll.mjs`);
let jawabanPrivat = 0;
{
  // Sandbox tiap halaman menunggu pewaktu (coba ulang, penguncian, batas
  // tunggu); 8 halaman sekaligus supaya validator tetap cepat tanpa membuat
  // selisih pewaktu uji terlalu rapat.
  const antrean = halamanEkspor.slice();
  const pekerja = async () => {
    for (let relative = antrean.shift(); relative !== undefined; relative = antrean.shift()) {
      const page = fs.readFileSync(path.join(root, relative), "utf8");
      const jenis = /[\\/]Exam[\\/]UTS\.html$/.test(relative) ? "UTS" : /[\\/]Exam[\\/]UAS\.html$/.test(relative) ? "UAS" : "Modul";
      await periksaJawabanPrivat(page, relative, jenis);
      jawabanPrivat += 1;
    }
  };
  await Promise.all(Array.from({ length: 8 }, pekerja));
}
if (jawabanPrivat !== 96) throw new Error(`Expected 96 modul/exam pages restoring answers through getJawabanSaya, found ${jawabanPrivat}`);
if (tungguSandbox.size !== 1) throw new Error(`Expected one JAWABAN-PRIVAT:TUNGGU block shared by the 96 pages, found ${tungguSandbox.size} variants`);
await ujiMutasiTunggu();

/**
 * Uji mutasi periksaTungguPemulihan: tiap salinan blok TUNGGU yang dirusak harus
 * ditolak (halaman aslinya lolos di perulangan di atas). TUNGGU_MUTASI=1 mencetak
 * alasan penolakan tiap kasus.
 */
async function ujiMutasiTunggu() {
  const relative = "Pemodelan-Computer-Aided-Design/Modul/Modul-2.html";
  const modul = fs.readFileSync(path.join(root, relative), "utf8");
  const BACA = "  const _bacaRekaman = (sisa) => get(ref(db, DB_PATH + '/' + key)).then((snap) => {\n";
  const kasus = [
    ["penanda v1", [["// JAWABAN-PRIVAT:TUNGGU BEGIN v2", "// JAWABAN-PRIVAT:TUNGGU BEGIN v1"], ["// JAWABAN-PRIVAT:TUNGGU END v2", "// JAWABAN-PRIVAT:TUNGGU END v1"]]],
    ["record dibaca bersamaan dengan penantian", [[BACA, "  const _bacaAwal = get(ref(db, DB_PATH + '/' + key));\n  const _bacaRekaman = (sisa) => (sisa === 4 ? _bacaAwal : get(ref(db, DB_PATH + '/' + key))).then((snap) => {\n"]]],
    ["getJawabanSaya tidak ditunggu", [["(typeof window._muatJawabanSaya === 'function' ? window._muatJawabanSaya() : null)).catch", "(typeof window._muatJawabanSaya === 'function' ? (window._muatJawabanSaya(), null) : null)).catch"]]],
    ["penantian yang menolak menghentikan pemulihan", [[".catch(() => null).then(() => _bacaRekaman(4))", ".then(() => _bacaRekaman(4))"]]],
    ["tanpa pemeriksaan umur", [["    if (!_snapLebihTua(snap)) return snap;\n", "    return snap;\n"]]],
    ["marker salah ikut menjadi penanda umur", [["/^(?:tf|mc|ce|ch|c)\\d{1,2}(?:_comp)?$/.test(m)", "/^(?:tf|mc|ce|ch|c)\\d{1,2}/.test(m)"]]],
    ["marker benar-salah tidak dikenali", [["/^(?:tf|mc|ce|ch|c)\\d{1,2}(?:_comp)?$/.test(m)", "/^(?:mc|ce|ch|c)\\d{1,2}(?:_comp)?$/.test(m)"]]],
    ["marker dua digit tidak dikenali", [["/^(?:tf|mc|ce|ch|c)\\d{1,2}(?:_comp)?$/.test(m)", "/^(?:tf|mc|ce|ch|c)\\d(?:_comp)?$/.test(m)"]]],
    ["baca ulang tanpa batas", [["    if (sisa > 0) return", "    if (sisa > -60) return"]]],
    ["baca ulang tanpa jeda", [["setTimeout(r, 750)", "setTimeout(r, 0)"]]],
    ["snapshot tua diterapkan sesudah batas", [["    console.warn('[jawaban-saya] record RTDB masih lebih tua daripada penilaian yang sudah diterima halaman; pemulihan ini dilewati, keadaan halaman dipertahankan.');\n    return null;\n", "    return snap;\n"]]],
    ["dilewati tanpa _markLoaded", [["    if (!snap) { if (typeof _markLoaded === 'function') _markLoaded(); else if (typeof window._markLoaded === 'function') window._markLoaded(); return; }\n", "    if (!snap) return;\n"]]],
    ["tanpa penjaga identitas", [["    if (window._nimPemulihan !== _nimPulih) return false;\n", ""]]],
    ["identitas bercampur tidak dimatikan", [["  else if (window._nimPemulihan !== _nimPulih) window._nimPemulihan = '*';\n", ""]]],
    ["record yang hilang dianggap segar", [["    const v = (snap && snap.exists()) ? snap.val() : null;\n", "    const v = (snap && snap.exists()) ? snap.val() : null;\n    if (!v) return false;\n"]]],
  ];
  for (const [nama, ganti] of kasus) {
    let salinan = modul;
    for (const [asli, rusak] of ganti) {
      if (!salinan.includes(asli)) throw new Error(`${relative}: JAWABAN-PRIVAT:TUNGGU mutation test anchor not found (${nama})`);
      salinan = salinan.replace(asli, () => rusak);
    }
    let alasan = null;
    try { await periksaTungguPemulihan(salinan, relative + " [mutasi]", { tanpaCache: true }); } catch (e) { alasan = e.message; }
    if (!alasan) throw new Error(`${relative}: JAWABAN-PRIVAT:TUNGGU check accepted a mutated page (${nama})`);
    if (process.env.TUNGGU_MUTASI) console.log(`mutasi TUNGGU "${nama}" ditolak: ${alasan}`);
  }
}

const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-slides.yml"), "utf8");
if (/rsync -a \\\r?\n\s+--exclude='.git'/.test(workflow)) throw new Error("Pages workflow still copies repository root");
for (const required of ["Allowlist frontend publik", "Tolak artefak sensitif", "_site/functions", "*answers.js", "*questions.js"]) {
  if (!workflow.includes(required)) throw new Error(`Pages workflow missing ${required}`);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${checkedScripts} inline scripts, and Pages security gates.`);
