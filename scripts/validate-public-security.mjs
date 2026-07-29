import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const courseRoots = ["Engineering-Mathematics", "Getaran-Mekanik", "Optimalisasi-dan-Automasi"];
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
const htmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "Slides" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
for (const course of courseRoots) {
  collectHtml(path.join(root, course));
}
for (const name of fs.readdirSync(path.join(root, "Admin"))) {
  if (name.endsWith(".html")) htmlFiles.push(path.join(root, "Admin", name));
}

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

if (authPages !== 63) throw new Error(`Expected 63 admin-auth pages (48 Modul/Exam + 7 Attributes + 3 OBE + 5 Admin), got ${authPages}`);
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
  }
}

const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-slides.yml"), "utf8");
if (/rsync -a \\\r?\n\s+--exclude='.git'/.test(workflow)) throw new Error("Pages workflow still copies repository root");
for (const required of ["Allowlist frontend publik", "Tolak artefak sensitif", "_site/functions", "*answers.js", "*questions.js"]) {
  if (!workflow.includes(required)) throw new Error(`Pages workflow missing ${required}`);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${checkedScripts} inline scripts, and Pages security gates.`);
