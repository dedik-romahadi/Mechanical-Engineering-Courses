#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Extract answer keys dari Modul HTML → output seed file siap pakai.
 *
 * USAGE:
 *   node seed/extract-modul-answers.js <html-path> <modulId> [--write-to <output-path>]
 *
 * CONTOH:
 *   node seed/extract-modul-answers.js \
 *     ../Getaran-Mekanik/Modul/Modul-1.html \
 *     getaran-mekanik-modul-1 \
 *     --write-to ./modul/getaran-mekanik-modul-1-answers.js
 *
 * Mengekstrak:
 * - MC_HINTS const → MC entries (qId, answer letter, explain)
 * - COMP_HINTS const → Comp entries explanation
 * - <button onclick="runAndCheck('qId', answer, tolerance)"> → Comp answer + tolerance
 *
 * Comp HARD detection: qId starts with c11..c15 (per Getaran convention)
 * atau berdasarkan SCORE_CONFIG COMP_HARD_COUNT di source.
 */

const fs = require("fs");
const path = require("path");

const ARGS = process.argv.slice(2);
if (ARGS.length < 2) {
  console.error("Usage: extract-modul-answers.js <html-path> <modulId> [--write-to <output>]");
  process.exit(1);
}

const HTML_PATH = ARGS[0];
const MODUL_ID = ARGS[1];
const WRITE_TO_IDX = ARGS.indexOf("--write-to");
const OUTPUT_PATH = WRITE_TO_IDX !== -1 ? ARGS[WRITE_TO_IDX + 1] : null;

const html = fs.readFileSync(HTML_PATH, "utf8");

// ─────────────────────────────────────────────────────────────────────────────
// Extract MC_HINTS const (each entry: qId → {answer:'A'|'B'|..., explain:'...'})
// Pattern: const MC_HINTS = { mc1: { answer: 'B', explain: '...' }, ... };
// We extract by evaluating the const block in isolated scope.
// ─────────────────────────────────────────────────────────────────────────────
function extractConstObject(constName) {
  // Find the const declaration and balanced braces
  const startRe = new RegExp(`const\\s+${constName}\\s*=\\s*\\{`, "m");
  const startMatch = html.match(startRe);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length - 1; // position of opening {
  let depth = 0;
  let i = startIdx;
  let inString = null;       // null | "'" | '"' | '`'
  let escape = false;
  while (i < html.length) {
    const ch = html[i];
    if (escape) { escape = false; i++; continue; }
    if (inString) {
      if (ch === "\\") { escape = true; }
      else if (ch === inString) { inString = null; }
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        // Include closing brace
        const blockSrc = html.slice(startIdx, i + 1);
        try {
          // eslint-disable-next-line no-new-func
          const obj = new Function("return " + blockSrc)();
          return obj;
        } catch (e) {
          console.error(`Failed to eval ${constName}:`, e.message);
          return null;
        }
      }
    }
    i++;
  }
  return null;
}

const MC_HINTS = extractConstObject("MC_HINTS") || {};
const COMP_HINTS = extractConstObject("COMP_HINTS") || {};

// ─────────────────────────────────────────────────────────────────────────────
// Extract runAndCheck('qId', answer, tolerance[, difficulty]) from onclick.
// Supports 3-arg (legacy) dan 4-arg (Math Modul-4 dgn 'easy'/'hard' suffix).
// ─────────────────────────────────────────────────────────────────────────────
const runAndCheckRe = /runAndCheck\(\s*['"](\w+)['"]\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*(?:,\s*['"](easy|hard)['"]\s*)?\)/g;
const compRunMap = {};   // qId → {answer, tolerance, difficulty?}
let m;
while ((m = runAndCheckRe.exec(html)) !== null) {
  const qId = m[1];
  const answer = parseFloat(m[2]);
  const tolerance = parseFloat(m[3]);
  const difficulty = m[4] || null;   // 'easy' | 'hard' | null
  if (Number.isFinite(answer) && Number.isFinite(tolerance)) {
    compRunMap[qId] = { answer, tolerance, difficulty };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: extract MC answer dari onclick="selectMC('qId',this,VALUE)"
// VALUE bisa: true/false (legacy boolean) atau 'A'/'B'/'C'/'D' (Math Modul-4).
// Untuk boolean: scan semua 4 options per qId, cari yg true, hitung index → letter.
// Untuk letter: ambil letter dari option yg matches dgn MC_HINTS atau special.
// ─────────────────────────────────────────────────────────────────────────────
function extractMcFromOnclick() {
  const result = {};
  const selectMcRe = /selectMC\(\s*['"](\w+)['"]\s*,\s*this\s*,\s*(true|false|['"][A-D]['"])\s*\)/g;
  const byQid = {};   // qId → [{val, order}]
  let mm;
  while ((mm = selectMcRe.exec(html)) !== null) {
    const qId = mm[1];
    const raw = mm[2];
    if (!byQid[qId]) byQid[qId] = [];
    byQid[qId].push({ raw, order: byQid[qId].length });
  }
  for (const [qId, options] of Object.entries(byQid)) {
    if (options.length !== 4) continue;   // expect 4 options per MC
    // Letter format: pakai letter dari option dgn val='X' (selalu correct kalau letter explicit)
    // Wait — Math Modul-4 pakai letter di ALL options (A/B/C/D as the option's identity).
    // Untuk Math Modul-4, NEED MC_HINTS to know which letter is correct.
    // Untuk boolean format: cari option dgn true → index → letter.
    const firstRaw = options[0].raw;
    if (firstRaw === "true" || firstRaw === "false") {
      // Boolean format
      const trueIdx = options.findIndex((o) => o.raw === "true");
      if (trueIdx >= 0 && trueIdx <= 3) {
        result[qId] = String.fromCharCode("A".charCodeAt(0) + trueIdx);
      }
    } else {
      // Letter format (each option carries its own letter A/B/C/D).
      // Cannot determine correct from this alone — need MC_HINTS.
      // Skip; will rely on MC_HINTS.
    }
  }
  return result;
}
const mcFromOnclick = extractMcFromOnclick();

// ─────────────────────────────────────────────────────────────────────────────
// Detect Comp Hard qIds (default: c11..c15 per Getaran convention).
// Override via SCORE_CONFIG if present.
// ─────────────────────────────────────────────────────────────────────────────
function isHardComp(qId) {
  const m2 = /^c(\d+)$/.exec(qId);
  if (!m2) return false;
  const n = parseInt(m2[1], 10);
  return n >= 11 && n <= 15;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build entries
// ─────────────────────────────────────────────────────────────────────────────
const MC = [];
const COMP_EZ = [];
const COMP_HARD = [];

// Union: qId yang ada di MC_HINTS ATAU di mcFromOnclick
const allMcQids = new Set([
  ...Object.keys(MC_HINTS),
  ...Object.keys(mcFromOnclick),
]);
for (const qId of allMcQids) {
  const hintInfo = MC_HINTS[qId] || {};
  const onclickLetter = mcFromOnclick[qId] || "";
  // Prefer MC_HINTS answer (explicit), fallback ke onclick (boolean-derived)
  const answer = String(hintInfo.answer || onclickLetter || "").toUpperCase();
  if (!answer || !/^[A-D]$/.test(answer)) {
    console.warn(`⚠ ${qId}: cannot determine answer (no MC_HINTS, no boolean onclick)`);
    continue;
  }
  MC.push({
    qId, type: "mc", points: 1,
    answer,
    explain: hintInfo.explain || "",
  });
}

for (const [qId, run] of Object.entries(compRunMap)) {
  const explainSrc = COMP_HINTS[qId] || {};
  // Prefer explicit difficulty dari onclick 4th arg, fallback ke qId-based detection
  const isHard = run.difficulty === "hard" || (run.difficulty === null && isHardComp(qId));
  const entry = {
    qId, type: "comp",
    points: isHard ? 4 : 2,
    answer: run.answer,
    tolerance: run.tolerance,
    explain: explainSrc.explain || "",
  };
  if (isHard) {
    entry.allowPartial = true;
    entry.partialPoints = 1;
    COMP_HARD.push(entry);
  } else {
    COMP_EZ.push(entry);
  }
}

// Sort by qId numeric
const numSort = (a, b) => {
  const an = parseInt(a.qId.replace(/^\D+/, ""), 10);
  const bn = parseInt(b.qId.replace(/^\D+/, ""), 10);
  return an - bn;
};
MC.sort(numSort);
COMP_EZ.sort(numSort);
COMP_HARD.sort(numSort);

const ALL = [...MC, ...COMP_EZ, ...COMP_HARD];
const totalPoin = ALL.reduce((s, e) => s + (e.points || 0), 0);

const SUMMARY = {
  modulId: MODUL_ID,
  totalSoal: ALL.length,
  totalPoin,
  breakdown: { mc: MC.length, compEz: COMP_EZ.length, compHard: COMP_HARD.length },
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate seed file content
// ─────────────────────────────────────────────────────────────────────────────
function serializeEntry(e) {
  const parts = [`{ qId: ${JSON.stringify(e.qId)}, type: ${JSON.stringify(e.type)}, points: ${e.points}`];
  if (e.type === "mc") {
    parts.push(`answer: ${JSON.stringify(e.answer)}`);
  } else if (e.type === "comp") {
    parts.push(`answer: ${e.answer}`);
    parts.push(`tolerance: ${e.tolerance}`);
    if (e.allowPartial) {
      parts.push(`allowPartial: true`);
      parts.push(`partialPoints: ${e.partialPoints ?? 1}`);
    }
  }
  if (e.explain) {
    parts.push(`explain: ${JSON.stringify(e.explain)}`);
  }
  return "  " + parts.join(", ") + " }";
}

const fileContent = `/* eslint-disable max-len */
/**
 * ${MODUL_ID} — answer-key metadata.
 *
 * Auto-generated by functions/seed/extract-modul-answers.js dari source HTML.
 * Edit source HTML, lalu re-extract; JANGAN edit file ini manual.
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
${MC.map(serializeEntry).join(",\n")}
];

const COMP_EZ = [
${COMP_EZ.map(serializeEntry).join(",\n")}
];

const COMP_HARD = [
${COMP_HARD.map(serializeEntry).join(",\n")}
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = ${JSON.stringify(SUMMARY, null, 2)};

module.exports = { MODUL_QUESTIONS, SUMMARY };
`;

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────
console.log("─".repeat(78));
console.log(`Extracted from: ${HTML_PATH}`);
console.log(`modulId:        ${MODUL_ID}`);
console.log(`MC:             ${MC.length} soal`);
console.log(`Comp Easy:      ${COMP_EZ.length} soal`);
console.log(`Comp Hard:      ${COMP_HARD.length} soal`);
console.log(`Total:          ${ALL.length} soal / ${totalPoin} poin`);
console.log("─".repeat(78));

// Diagnostic: any MC without explain? Any Comp tolerance missing?
const mcNoExplain = MC.filter((e) => !e.explain).map((e) => e.qId);
const compNoTolerance = [...COMP_EZ, ...COMP_HARD].filter((e) => e.tolerance === undefined).map((e) => e.qId);
if (mcNoExplain.length) console.warn(`⚠ MC without explain: ${mcNoExplain.join(", ")}`);
if (compNoTolerance.length) console.warn(`⚠ Comp without tolerance: ${compNoTolerance.join(", ")}`);

if (OUTPUT_PATH) {
  fs.writeFileSync(OUTPUT_PATH, fileContent);
  console.log(`✅ Wrote seed file: ${OUTPUT_PATH}`);
} else {
  // Print to stdout
  console.log(fileContent);
}
