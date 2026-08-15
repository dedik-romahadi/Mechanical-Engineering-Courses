import fs from "node:fs";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "..", "Sistem-Kendali-Cerdas", "Modul", "Modul-3.html");
const original = fs.readFileSync(file, "utf8");
let html = original;
const problems = [];

function replaceOnce(before, after, label) {
  const count = typeof before === "string" ? html.split(before).length - 1 : [...html.matchAll(new RegExp(before.source, before.flags.includes("g") ? before.flags : `${before.flags}g`))].length;
  if (count !== 1) {
    problems.push(`${label}: ${count}, expected 1`);
    return;
  }
  html = html.replace(before, after);
}

replaceOnce(
  /<div class="ref-params">[\s\S]*?<\/div>\r?\n<div class="comp-card reveal">/,
  `<div class="ref-params" id="parametric-modul-note">
<strong style="color:var(--cyan)">Soal parametrik per NIM.</strong>
<span style="font-size:13px;color:var(--muted);margin-top:6px;display:block">Masuk sebagai mahasiswa untuk memuat angka milik Anda. Teks soal dirakit server dan tidak disimpan di halaman publik.</span>
</div>
<div class="comp-card reveal">`,
  "kotak parameter acuan",
);

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
  changed = changed.replace(/<div class="input-label">[\s\S]*?<\/div>/, `<div class="input-label"><span class="col-badge col-badge-code">Python</span> Kode Jupyter Notebook <span id="input-c${n}" style="color:var(--muted);font-size:10px">(output akan ditentukan server)</span></div>`);
  if (changed === block || !changed.includes(`id="text-c${n}"`) || !changed.includes(`id="hint-c${n}"`) || !changed.includes(`id="input-c${n}"`)) {
    problems.push(`anchor isi c${n} tidak lengkap`);
    continue;
  }
  html = html.slice(0, start) + changed + html.slice(end);
}

replaceOnce(
  "const _checkModulAnswerCallable = httpsCallable(_functions, 'checkModulAnswer');",
  "const _checkModulAnswerCallable = httpsCallable(_functions, 'checkModulAnswer');\nconst _getModulQuestionsCallable = httpsCallable(_functions, 'getModulQuestions');",
  "deklarasi callable",
);

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
  console.error(`Modul-3.html dilewati utuh: ${problems.join("; ")}`);
  process.exit(1);
}

fs.writeFileSync(file, html, "utf8");
console.log("Modul-3.html diperbarui secara atomik untuk soal parametrik.");
