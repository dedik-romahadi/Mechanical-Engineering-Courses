/* eslint-disable no-console, max-len */
/**
 * Smoke test untuk getaran-uts.js — verifikasi:
 *   1. Semua 45 qId terdaftar
 *   2. verifyAnswer() di N = 0, 25, 50, 75, 99 menghasilkan correct=true untuk
 *      jawaban benar dan correct=false untuk jawaban salah (TF & MC)
 *   3. getMCOptions() return 4 elemen untuk semua MC
 *   4. Tidak ada exception/NaN
 *
 * Jalankan dari functions/: node exam-data/test-getaran-uts.js
 * Exit code 0 jika semua pass, 1 jika ada gagal.
 */

"use strict";
const data = require("./getaran-uts");

let pass = 0;
let fail = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(msg);
  }
}

// ── Test 1: Semua qId terdaftar (10 tf + 20 mc + 10 c easy + 5 c hard = 45) ──
const allIds = data.listAllQuestionIds();
assert(allIds.length === 45, `Total qId: expected 45, got ${allIds.length}`);
const expectedIds = [
  ...Array.from({ length: 10 }, (_, i) => "tf" + (i + 1)),
  ...Array.from({ length: 20 }, (_, i) => "mc" + (i + 1)),
  ...Array.from({ length: 15 }, (_, i) => "c" + (i + 1)),
];
for (const id of expectedIds) {
  assert(allIds.includes(id), `Missing qId: ${id}`);
}

// ── Test 2: Boundary N values ──
const boundaryNs = [0, 25, 50, 75, 99];

for (const N of boundaryNs) {
  // ── TF: jawaban benar harus correct=true, jawaban salah → false ──
  for (const tfId of ["tf1", "tf2", "tf3", "tf4", "tf5", "tf6", "tf7", "tf8", "tf9", "tf10"]) {
    const meta = data.getQuestionMeta(tfId);
    assert(meta && meta.type === "tf" && meta.points === 1, `TF meta wrong: ${tfId}`);
    // Probe: cari yang benar dengan brute force (2 options saja)
    const r1 = data.verifyAnswer(tfId, N, true);
    const r2 = data.verifyAnswer(tfId, N, false);
    assert(!r1.error, `TF ${tfId} N=${N}: r1.error=${r1.error}`);
    assert(!r2.error, `TF ${tfId} N=${N}: r2.error=${r2.error}`);
    assert(r1.correct !== r2.correct, `TF ${tfId} N=${N}: both options gave same result (broken)`);
    assert((r1.correct && r1.points === 1) || (r2.correct && r2.points === 1), `TF ${tfId} N=${N}: no correct answer scored 1pt`);
  }

  // ── MC: getMCOptions return 4 elements; exactly one verifyAnswer with idx 0..3 returns correct ──
  for (let i = 1; i <= 20; i++) {
    const mcId = "mc" + i;
    const meta = data.getQuestionMeta(mcId);
    assert(meta && meta.type === "mc" && meta.points === 1, `MC meta wrong: ${mcId}`);

    const opts = data.getMCOptions(mcId, N);
    assert(Array.isArray(opts) && opts.length === 4, `MC ${mcId} N=${N}: options not 4-array, got ${opts && opts.length}`);
    let correctCount = 0;
    for (let idx = 0; idx < 4; idx++) {
      const r = data.verifyAnswer(mcId, N, idx);
      if (r.error) { fail++; failures.push(`MC ${mcId} N=${N} idx=${idx}: error=${r.error}`); }
      if (r.correct) correctCount++;
    }
    assert(correctCount === 1, `MC ${mcId} N=${N}: expected exactly 1 correct, got ${correctCount}`);
  }

  // ── Comp Easy: verifyAnswer dengan expected exactly harus correct=true ──
  for (let i = 1; i <= 10; i++) {
    const cId = "c" + i;
    const meta = data.getQuestionMeta(cId);
    assert(meta && meta.type === "comp" && meta.category === "easy" && meta.points === 2, `CompEZ meta wrong: ${cId}`);
    // Pakai internal compute langsung untuk dapat expected
    const q = data._internal.COMP_EZ_QUESTIONS[cId];
    const expected = q.compute(N).expected;
    const rCorrect = data.verifyAnswer(cId, N, expected);
    assert(rCorrect.correct === true && rCorrect.points === 2, `CompEZ ${cId} N=${N}: exact match should give 2pt, got ${JSON.stringify(rCorrect)}`);
    // Jawaban jauh dari expected (×2) harus salah
    const rWrong = data.verifyAnswer(cId, N, expected * 2 + 100);
    assert(rWrong.correct === false && rWrong.points === 0, `CompEZ ${cId} N=${N}: 2× wrong answer should give 0pt, got ${JSON.stringify(rWrong)}`);
    // Jawaban string-invalid harus correct=false (bukan error)
    const rNaN = data.verifyAnswer(cId, N, "bukan_angka");
    assert(rNaN.correct === false && rNaN.points === 0, `CompEZ ${cId} N=${N}: NaN input should give 0pt, got ${JSON.stringify(rNaN)}`);
  }

  // ── Comp Hard: similar ──
  for (let i = 11; i <= 15; i++) {
    const cId = "c" + i;
    const meta = data.getQuestionMeta(cId);
    assert(meta && meta.type === "comp" && meta.category === "hard" && meta.points === 4, `CompHard meta wrong: ${cId}`);
    const q = data._internal.COMP_HARD_QUESTIONS[cId];
    const expected = q.compute(N).expected;
    const rCorrect = data.verifyAnswer(cId, N, expected);
    assert(rCorrect.correct === true && rCorrect.points === 4, `CompHard ${cId} N=${N}: exact match should give 4pt, got ${JSON.stringify(rCorrect)}`);
  }
}

// ── Test 3: getNFromNim ──
assert(data.getNFromNim("41421010001") === 1, "getNFromNim(...001) should be 1");
assert(data.getNFromNim("41421010099") === 99, "getNFromNim(...099) should be 99");
assert(data.getNFromNim("41421010050") === 50, "getNFromNim(...050) should be 50");
assert(data.getNFromNim("") === 0, "getNFromNim('') should be 0");

// ── Test 4: getMCOptions stable across calls (deterministic shuffle) ──
const opts1 = data.getMCOptions("mc5", 42);
const opts2 = data.getMCOptions("mc5", 42);
assert(JSON.stringify(opts1) === JSON.stringify(opts2), "getMCOptions should be deterministic for same N");

// ── Test 5: Unknown qId returns undefined / error ──
assert(data.getQuestionMeta("xyz") === undefined, "Unknown qId meta should be undefined");
assert(data.verifyAnswer("xyz", 0, 0).error === "unknown-question", "Unknown qId verify should error");

// ── Report ──
console.log("─".repeat(60));
console.log(`PASS: ${pass}    FAIL: ${fail}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  for (const f of failures.slice(0, 20)) console.log("  - " + f);
  if (failures.length > 20) console.log(`  ... and ${failures.length - 20} more`);
  process.exit(1);
}
console.log("All checks passed.");
process.exit(0);
