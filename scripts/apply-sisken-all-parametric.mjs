import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");
const genericPlaceholder = "Tulis atau paste kode Python Anda, lalu print() hanya nilai akhir yang diminta server.";

function extractBetween(source, start, end, label) {
  const from = source.indexOf(start);
  const to = from < 0 ? -1 : source.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Template ${label} tidak ditemukan`);
  return source.slice(from, to);
}

const moduleOne = fs.readFileSync(path.join(moduleDir, "Modul-1.html"), "utf8");
const scoreAndLatePanel = extractBetween(
  moduleOne,
  "  <!-- SCORE BAR -->",
  "  <div class=\"warn-box\">",
  "panel skor dan akses terlambat",
);
const drivePanel = extractBetween(
  moduleOne,
  "  <!-- GOOGLE DRIVE LINK -->",
  "\n\n</div><!-- end section -->",
  "kolom Google Drive",
);

function removeLegacyTaskParameters(source, moduleNumber) {
  if (moduleNumber !== 1) return source;
  const legacyBox = /\n    <div class="info-box" style="margin-bottom:28px">\r?\n      <strong>📌 Parameter Sistem Referensi \(dipakai soal C1–C10\):<\/strong><br>[\s\S]*?\n    <\/div>\r?\n/;
  const matches = count(source, legacyBox);
  if (matches > 1) throw new Error(`Modul-${moduleNumber}: kotak parameter tugas lama tidak unik`);
  return source.replace(legacyBox, "\n");
}

function ensureVisibleTaskPanel(source, moduleNumber) {
  const standard = '<div class="hero" data-tab="tugas" style="min-height:60vh">';
  if (source.includes(standard)) return source;
  const legacy = '<div class="hero" data-tab="tugas">';
  if (count(source, legacy) !== 1) throw new Error(`Modul-${moduleNumber}: hero halaman Tugas tidak unik`);
  return source.replace(legacy, standard);
}

function ensureTaskPanelEntryScroll(source, moduleNumber) {
  const standard = `  if (tab === 'tugas') {
    const scoreBar = document.querySelector('#page-tugas .score-bar');
    const top = scoreBar ? window.scrollY + scoreBar.getBoundingClientRect().top - 72 : 0;
    window.scrollTo({ top, behavior: 'auto' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }`;
  if (source.includes(standard)) return source;
  const legacy = "  window.scrollTo({ top: 0, behavior: 'smooth' });";
  if (count(source, legacy) !== 1) throw new Error(`Modul-${moduleNumber}: perilaku scroll tab tidak unik`);
  return source.replace(legacy, standard);
}

function ensureStickyBodyScroll(source, moduleNumber) {
  const standard = "body{overflow-x:clip!important;overflow-y:visible!important}";
  if (source.includes(standard)) return source;
  const anchor = "html,body{height:auto!important;min-height:100%!important;overflow-y:auto!important}";
  if (count(source, anchor) !== 1) throw new Error(`Modul-${moduleNumber}: aturan scroll global tidak unik`);
  return source.replace(anchor, `${anchor}${standard}`);
}

function ensureStandardTaskPanels(source, moduleNumber) {
  const pageStart = source.indexOf('<div class="page" id="page-tugas">');
  const pageEnd = pageStart < 0 ? -1 : source.indexOf("<!-- end page-tugas -->", pageStart);
  if (pageStart < 0 || pageEnd < 0) throw new Error(`Modul-${moduleNumber}: halaman tugas tidak ditemukan`);

  const prefix = source.slice(0, pageStart);
  let page = source.slice(pageStart, pageEnd);
  const suffix = source.slice(pageEnd);
  const panelIds = ["scoreDisplay", "scoreDetail", "scoreFill", "scoreMC", "scoreCompEz", "scoreCompHard", "btn-score-export", "export-blocked-msg"];
  const panelCount = panelIds.filter((id) => page.includes(`id="${id}"`)).length;
  if (panelCount !== 0 && panelCount !== panelIds.length) throw new Error(`Modul-${moduleNumber}: panel skor lama tidak lengkap`);
  if (panelCount === 0) {
    const anchor = '<div class="section">\n';
    if (count(page, anchor) !== 1) throw new Error(`Modul-${moduleNumber}: lokasi panel skor tidak unik`);
    page = page.replace(anchor, `${anchor}\n${scoreAndLatePanel}`);
  }

  const driveCount = ["gdrive-link", "gdrive-feedback"].filter((id) => page.includes(`id="${id}"`)).length;
  if (driveCount !== 0 && driveCount !== 2) throw new Error(`Modul-${moduleNumber}: kolom Google Drive lama tidak lengkap`);
  if (driveCount === 0) {
    const anchor = "\n</div><!-- end section -->";
    if (count(page, anchor) !== 1) throw new Error(`Modul-${moduleNumber}: lokasi kolom Google Drive tidak unik`);
    page = page.replace(anchor, `\n\n${drivePanel}${anchor}`);
  }
  return prefix + page + suffix;
}

const loader = `
let _parametricQuestionKey = null;
async function _loadParametricModulQuestions() {
  const me = getIdentity();
  if (!me || !['student', 'dosen'].includes(me.role)) return false;
  const key = me.role + '|' + (me.nim || 'admin');
  if (_parametricQuestionKey === key) return true;
  const payload = { modulId: MODUL_ID };
  if (me.role === 'student') {
    if (!me.nim || !window._sessionPinHash) return false;
    payload.nim = me.nim;
    payload.pinHash = window._sessionPinHash;
  }
  try {
    const result = await _getModulQuestionsCallable(payload);
    const data = result && result.data;
    const questions = data && Array.isArray(data.comp) ? data.comp : [];
    if (questions.length !== 15) throw new Error('Server tidak mengembalikan 15 soal.');
    for (const question of questions) {
      if (!/^c(?:1[0-5]|[1-9])$/.test(question.id)) throw new Error('qId soal tidak valid.');
      const text = document.getElementById('text-' + question.id);
      const hint = document.getElementById('hint-' + question.id);
      const input = document.getElementById('input-' + question.id);
      if (!text || !hint || !input) throw new Error('Wadah soal tidak lengkap: ' + question.id);
      text.textContent = question.text || '';
      hint.textContent = '💡 ' + (question.hint || 'Kerjakan dengan Python dan tampilkan hasil akhir.');
      input.textContent = question.inputLabel || 'print() hasil akhir';
    }
    const note = document.getElementById('parametric-modul-note');
    if (note) note.setAttribute('data-loaded-n', String(data.N));
    _parametricQuestionKey = key;
    return true;
  } catch (error) {
    for (let n = 1; n <= 15; n += 1) {
      const text = document.getElementById('text-c' + n);
      if (text) text.textContent = '⚠ Soal belum dapat dimuat: ' + (error.message || error);
    }
    console.error('[getModulQuestions]', error);
    return false;
  }
}
window._loadParametricModulQuestions = _loadParametricModulQuestions;
`;

function count(source, pattern) {
  if (typeof pattern === "string") return source.split(pattern).length - 1;
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...source.matchAll(new RegExp(pattern.source, flags))].length;
}

for (let moduleNumber = 1; moduleNumber <= 14; moduleNumber += 1) {
  const file = path.join(moduleDir, `Modul-${moduleNumber}.html`);
  const original = fs.readFileSync(file, "utf8");
  const alreadyMigrated = count(original, /id="text-c(?:1[0-5]|[1-9])"/) === 15;
  if (alreadyMigrated) {
    const required = [
      count(original, /id="hint-c(?:1[0-5]|[1-9])"/) === 15,
      count(original, /id="input-c(?:1[0-5]|[1-9])"/) === 15,
      original.includes("httpsCallable(_functions, 'getModulQuestions')"),
      original.includes("window._loadParametricModulQuestions = _loadParametricModulQuestions"),
    ];
    if (required.every(Boolean)) {
      let normalized = ensureStickyBodyScroll(
        ensureTaskPanelEntryScroll(
          ensureVisibleTaskPanel(
            ensureStandardTaskPanels(removeLegacyTaskParameters(original, moduleNumber), moduleNumber),
            moduleNumber,
          ),
          moduleNumber,
        ),
        moduleNumber,
      );
      for (let n = 1; n <= 15; n += 1) {
        const textarea = new RegExp(`(<textarea class="code-textarea" id="code-c${n}"[^>]*?)placeholder="[^"]*"([^>]*>)`);
        if (count(normalized, textarea) !== 1) throw new Error(`Modul-${moduleNumber}: textarea c${n} tidak unik`);
        normalized = normalized.replace(textarea, `$1placeholder="${genericPlaceholder}"$2`);
      }
      if (normalized !== original) {
        const temporary = `${file}.tmp-${process.pid}`;
        fs.writeFileSync(temporary, normalized, "utf8");
        fs.renameSync(temporary, file);
        console.log(`Modul-${moduleNumber}: struktur tugas parametrik diperbarui`);
      } else {
        console.log(`Modul-${moduleNumber}: sudah parametrik, tidak diubah`);
      }
      continue;
    }
    throw new Error(`Modul-${moduleNumber}: migrasi lama tidak lengkap; berkas dilewati utuh`);
  }

  let html = ensureStickyBodyScroll(
    ensureTaskPanelEntryScroll(
      ensureVisibleTaskPanel(
        ensureStandardTaskPanels(removeLegacyTaskParameters(original, moduleNumber), moduleNumber),
        moduleNumber,
      ),
      moduleNumber,
    ),
    moduleNumber,
  );
  const problems = [];
  const replaceOnce = (before, after, label) => {
    const matches = count(html, before);
    if (matches !== 1) {
      problems.push(`${label}: ${matches}, expected 1`);
      return;
    }
    html = html.replace(before, after);
  };

  const note = `<div class="ref-params" id="parametric-modul-note">
<strong style="color:var(--cyan)">Soal parametrik per NIM.</strong>
<span style="font-size:13px;color:var(--muted);margin-top:6px;display:block">Masuk sebagai mahasiswa untuk memuat angka milik Anda. Teks soal dirakit server dan tidak disimpan di halaman publik.</span>
</div>`;

  if (moduleNumber === 1) {
    replaceOnce("    <!-- COMP 1 -->", `    ${note}\n\n    <!-- COMP 1 -->`, "lokasi catatan parametrik");
  } else {
    replaceOnce(/<div class="ref-params">[\s\S]*?<\/div>\r?\n<div class="comp-card reveal">/, `${note}\n<div class="comp-card reveal">`, "kotak parameter acuan");
  }

  for (let n = 1; n <= 15; n += 1) {
    const start = html.indexOf(`<div class="comp-num">C${n}</div>`);
    const end = html.indexOf(`id="code-c${n}"`, start);
    if (start < 0 || end < 0) {
      problems.push(`blok c${n} tidak ditemukan`);
      continue;
    }
    const block = html.slice(start, end);
    let changed = block;
    changed = changed.replace(/<div class="comp-q">[\s\S]*?<\/div>/, `<div class="comp-q" id="text-c${n}">🔒 Masuk untuk memuat soal parametrik C${n}.</div>`);
    changed = changed.replace(/<div class="comp-hint">[\s\S]*?<\/div>/, `<div class="comp-hint" id="hint-c${n}">💡 Hint akan dimuat bersama soal.</div>`);
    changed = changed.replace(/<div class="input-label">[\s\S]*?<\/div>/, `<div class="input-label"><span class="col-badge col-badge-code">Python</span> Kode Jupyter Notebook — <span id="input-c${n}" style="color:var(--muted);font-size:10px">output akan ditentukan server</span></div>`);
    if (!changed.includes(`id="text-c${n}"`) || !changed.includes(`id="hint-c${n}"`) || !changed.includes(`id="input-c${n}"`)) {
      problems.push(`anchor isi c${n} tidak lengkap`);
      continue;
    }
    html = html.slice(0, start) + changed + html.slice(end);

    const textarea = new RegExp(`(<textarea class="code-textarea" id="code-c${n}"[^>]*?)placeholder="[^"]*"([^>]*>)`);
    replaceOnce(textarea, `$1placeholder="${genericPlaceholder}"$2`, `placeholder c${n}`);
  }

  replaceOnce(
    "const _checkModulAnswerCallable = httpsCallable(_functions, 'checkModulAnswer');",
    "const _checkModulAnswerCallable = httpsCallable(_functions, 'checkModulAnswer');\nconst _getModulQuestionsCallable = httpsCallable(_functions, 'getModulQuestions');",
    "deklarasi callable",
  );
  replaceOnce(
    "window._callCheckModulAnswer = _callCheckModulAnswer;\nconst CHAT_LIMIT = 50;",
    `window._callCheckModulAnswer = _callCheckModulAnswer;${loader}\nconst CHAT_LIMIT = 50;`,
    "loader soal parametrik",
  );
  replaceOnce(
    "  if (v && v.role === 'student') setTimeout(() => window.shuffleMCOptions && window.shuffleMCOptions(), 0);",
    "  if (v && v.role === 'student') setTimeout(() => window.shuffleMCOptions && window.shuffleMCOptions(), 0);\n  if (v && ['student', 'dosen'].includes(v.role)) setTimeout(() => window._loadParametricModulQuestions && window._loadParametricModulQuestions(), 0);",
    "pemicu setelah login",
  );
  replaceOnce(
    "if (typeof shuffleMCOptions === 'function') shuffleMCOptions();\ninitVisitor();",
    "if (typeof shuffleMCOptions === 'function') shuffleMCOptions();\nif (typeof window._loadParametricModulQuestions === 'function') window._loadParametricModulQuestions();\ninitVisitor();",
    "pemicu auto-login",
  );

  if (problems.length) {
    console.error(`Modul-${moduleNumber}.html dilewati utuh: ${problems.join("; ")}`);
    process.exitCode = 1;
    continue;
  }
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, html, "utf8");
  fs.renameSync(temporary, file);
  console.log(`Modul-${moduleNumber}: migrasi parametrik selesai`);
}
