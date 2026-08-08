import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");

const shuffleBlock = `// ═══════════════════════════════════════════════════════════════
// Urutan opsi PG Sisken diacak deterministik per NIM. Huruf yang dikirim
// adalah POSISI yang terlihat; checkModulAnswer v1 memetakannya kembali ke
// huruf kanonik dengan shuffleSeed dan seed yang sama.
// ═══════════════════════════════════════════════════════════════
let _mcShuffleKey = null;

function _deriveModulN(nim) {
  const digits = String(nim || '').replace(/\\D/g, '');
  if (digits.length < 2) return 0;
  let n = parseInt(digits.slice(-2), 10);
  if (n === 0 && digits.length >= 4) n = parseInt(digits.slice(-4, -2), 10) || 0;
  return n || 0;
}

// Salinan browser dari helper shuffleSeed bank exam. Jangan ubah algoritma
// atau formula seed tanpa memperbarui backend dan verifikator bersamaan.
function _shuffleModulOptions(arr, seed) {
  const result = [...arr];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleMCOptions() {
  const me = getIdentity();
  if (!me || me.role !== 'student' || !me.nim) return false;
  const modulId = String(window.MODUL_ID || '');
  const modulMatch = /^sistem_kendali_cerdas-modul-(\\d+)$/.exec(modulId);
  if (!modulMatch) return false;
  const shuffleKey = modulId + '|' + me.nim;
  if (_mcShuffleKey === shuffleKey) return true;

  const N = _deriveModulN(me.nim);
  const modulNum = Number(modulMatch[1]);
  for (let qNum = 1; qNum <= 10; qNum += 1) {
    const rg = document.getElementById('rg-mc' + qNum);
    if (!rg) continue;
    const options = Array.from(rg.querySelectorAll('.radio-option'));
    if (options.length !== 4) continue;
    const seed = N + modulNum * 101 + qNum * 17;
    const shuffled = _shuffleModulOptions(options, seed);
    shuffled.forEach((option, visibleIdx) => {
      const visibleLetter = String.fromCharCode(65 + visibleIdx);
      option.dataset.displayLetter = visibleLetter;
      option.innerHTML = option.innerHTML.replace(/\\([A-D]\\)(\\s*&nbsp;\\s*)/, '(' + visibleLetter + ')$1');
      rg.appendChild(option);
    });
  }
  _mcShuffleKey = shuffleKey;
  return true;
}
window.shuffleMCOptions = shuffleMCOptions;`;

const plans = [];
for (let n = 1; n <= 14; n += 1) {
  const file = path.join(moduleDir, `Modul-${n}.html`);
  const original = fs.readFileSync(file, "utf8");
  let html = original;
  const problems = [];

  const onclickPattern = /onclick="selectMC\('(mc(?:10|[1-9]))',this,'[A-D]'\)"/g;
  const onclickMatches = [...html.matchAll(onclickPattern)];
  if (onclickMatches.length !== 40) problems.push(`onclick PG: ${onclickMatches.length}, expected 40`);
  else html = html.replace(onclickPattern, 'onclick="selectMC(\'$1\',this)"');

  const replacements = [
    ["function selectMC(qId, opt, selectedLetter) {", "function selectMC(qId, opt) {\n  shuffleMCOptions();"],
    ["  opt._letter = selectedLetter;", "  opt._letter = opt.dataset.displayLetter;"],
    [
      "  const payload = { modulId: MODUL_ID, qId, userAnswer, nim: me.nim, nama: me.nama, pinHash };",
      "  const payload = { modulId: MODUL_ID, qId, userAnswer, nim: me.nim, nama: me.nama, pinHash };\n  if (/^mc(?:10|[1-9])$/.test(qId)) payload.mcOrderVersion = 1;",
    ],
    [
      "  localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(v));",
      "  localStorage.setItem(LOCAL_IDENTITY, JSON.stringify(v));\n  if (v && v.role === 'student') setTimeout(() => window.shuffleMCOptions && window.shuffleMCOptions(), 0);",
    ],
  ];
  for (const [before, after] of replacements) {
    const count = html.split(before).length - 1;
    if (count !== 1) problems.push(`anchor ${JSON.stringify(before.slice(0, 48))}: ${count}, expected 1`);
    else html = html.replace(before, after);
  }

  const blockPattern = /\/\/ ═{10,}\r?\n\/\/ PHASE 3 — SHUFFLE MC OPTIONS DI-NONAKTIFKAN\.[\s\S]*?window\.shuffleMCOptions = shuffleMCOptions;/;
  const blocks = html.match(blockPattern);
  if (!blocks) problems.push("blok shuffle no-op tidak ditemukan");
  else html = html.replace(blockPattern, shuffleBlock);

  plans.push({ file, original, html, problems });
}

let failed = false;
for (const plan of plans) {
  if (plan.problems.length) {
    failed = true;
    console.error(`${path.basename(plan.file)} dilewati utuh: ${plan.problems.join("; ")}`);
    continue;
  }
  fs.writeFileSync(plan.file, plan.html, "utf8");
  console.log(`${path.basename(plan.file)} diperbarui`);
}

if (failed) process.exitCode = 1;
