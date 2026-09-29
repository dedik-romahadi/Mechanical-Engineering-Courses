import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";

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
    // Flag "soal sudah dirender" hanya sesudah render sukses (29 September 2026,
    // scripts/muat-soal-uts.mjs, Pedoman §7.9). UTS Math4/Opto dulu merender
    // langsung lalu memasang flag di jaring aman init dan di auto-login
    // _handleScheduleReady, sebelum soal diambil: renderer return dini
    // (window.UTS_TF belum ada) tetapi flag terpasang, sehingga
    // _ensureUTSQuestionsLoaded — juga dari saveIdentity dan _setSessionPinHash —
    // tidak pernah memanggil getExamQuestions untuk mahasiswa yang kembali.
    // Satu-satunya pasangan render→flag yang sah ada di _ensure…QuestionsLoaded,
    // tepat sesudah bank soal diisi dari respons server. Spasi dan pindah baris
    // bebas, dengan atau tanpa `window.`, kombinasi UTS/UAS campuran ikut.
    {
      const jenis = examName.slice(0, 3);
      const awalPemuat = `async function _ensure${jenis}QuestionsLoaded() {`;
      const pemuat = ambilFungsi(exam, awalPemuat, relative);
      const mulaiPemuat = exam.indexOf(awalPemuat);
      let diPemuat = 0;
      for (const m of exam.matchAll(/renderU[TA]SQuestions\s*\(\s*\)\s*;?\s*(?:window\.)?_u[ta]sRenderedFlag\s*=\s*true\b/g)) {
        if (m.index >= mulaiPemuat && m.index < mulaiPemuat + pemuat.length) {
          diPemuat += 1;
          continue;
        }
        const baris = exam.slice(0, m.index).split("\n").length;
        throw new Error(`${relative}:${baris}: rendered flag set right after render${jenis}Questions() outside _ensure${jenis}QuestionsLoaded ("${m[0].replace(/\s+/g, " ")}"); the renderer returns early while the questions are not loaded yet, and the flag then stops _ensure${jenis}QuestionsLoaded (auto-login, saveIdentity, _setSessionPinHash) from ever calling getExamQuestions — set the flag inside the renderer after a successful render and call the loader instead (node scripts/muat-soal-uts.mjs)`);
      }
      if (diPemuat !== 1) {
        throw new Error(`${relative}: _ensure${jenis}QuestionsLoaded must render the questions and set the rendered flag exactly once after loading them, found ${diPemuat}`);
      }
    }
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
  }
}

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
function ambilBlok(exam, awal, akhir, relative) {
  const i = exam.indexOf(awal);
  const j = i < 0 ? -1 : exam.indexOf(akhir, i);
  if (i < 0 || j < 0) throw new Error(`${relative}: block ${awal} not found`);
  return exam.slice(i, exam.indexOf("\n", j) + 1);
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
// HURUF-ASAL + GABUNG + PILIHAN-PG-PULIH.
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

async function periksaJawabanPrivat(page, relative, jenis) {
  const saran = "; jalankan node scripts/jawaban-privat.mjs";
  const modul = jenis === "Modul";
  const versi = { JEMBATAN: "v2", IDENTITAS: "v2", TUNGGU: "v1", GABUNG: "v2", ...(modul ? { "HURUF-ASAL": "v1" } : {}) };
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
  if (!page.includes("  Promise.all([get(ref(db, DB_PATH + '/' + key)), (typeof window._muatJawabanSaya === 'function' ? window._muatJawabanSaya() : null)]).then(([snap]) => {\n  // JAWABAN-PRIVAT:TUNGGU END v1\n")
    || page.includes("get(ref(db, DB_PATH + '/' + key)).then(snap => {")) {
    throw new Error(`${relative}: _loadScoredQuestions harus menunggu record RTDB dan getJawabanSaya bersama (blok TUNGGU)${saran}`);
  }
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

const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-slides.yml"), "utf8");
if (/rsync -a \\\r?\n\s+--exclude='.git'/.test(workflow)) throw new Error("Pages workflow still copies repository root");
for (const required of ["Allowlist frontend publik", "Tolak artefak sensitif", "_site/functions", "*answers.js", "*questions.js"]) {
  if (!workflow.includes(required)) throw new Error(`Pages workflow missing ${required}`);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${checkedScripts} inline scripts, and Pages security gates.`);
