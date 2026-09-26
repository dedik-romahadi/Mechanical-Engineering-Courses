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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mec-security-"));
let authPages = 0;
let checkedScripts = 0;
try {
  for (const file of htmlFiles) {
    const relative = path.relative(root, file);
    const source = fs.readFileSync(file, "utf8");
    if (/57ae60d1|ADMIN_PW_HASH|adminPwHash/.test(source)) throw new Error(`${relative}: legacy admin hash remains`);
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
    const lecturerLoader = examName === "UAS.html"
      ? "await window._ensureUASQuestionsLoaded()"
      : "window.renderUTSQuestions()";
    if (!exam.includes(lecturerLoader)) {
      throw new Error(`${relative}: lecturer question loader missing ${lecturerLoader}`);
    }
    if (examName === "UAS.html" && !exam.includes("await _auth.authStateReady()")) {
      throw new Error(`${relative}: lecturer UAS view does not wait for restored admin auth`);
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

const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-slides.yml"), "utf8");
if (/rsync -a \\\r?\n\s+--exclude='.git'/.test(workflow)) throw new Error("Pages workflow still copies repository root");
for (const required of ["Allowlist frontend publik", "Tolak artefak sensitif", "_site/functions", "*answers.js", "*questions.js"]) {
  if (!workflow.includes(required)) throw new Error(`Pages workflow missing ${required}`);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${checkedScripts} inline scripts, and Pages security gates.`);
