#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seed answer keys ke Firestore `examAnswers/{examId}/qs/{qId}`.
 *
 * Support multiple exams via mapping table EXAMS di bawah. Tambah entry
 * baru di EXAMS map saat rollout exam tambahan.
 *
 * Cara pakai (dari direktori `functions/`):
 *
 *   # List exam yang tersedia:
 *   node seed/seed-firestore.js --list
 *
 *   # Dry-run untuk exam tertentu (preview, tidak nulis):
 *   node seed/seed-firestore.js --exam getaran-mekanik-uts --dry-run
 *
 *   # Live seed untuk satu exam:
 *   node seed/seed-firestore.js --exam getaran-mekanik-uas
 *
 *   # Live seed SEMUA exam:
 *   node seed/seed-firestore.js --all
 *
 *   # Shorthand (legacy default = getaran-mekanik-uts via npm script):
 *   npm run seed                 → getaran-mekanik-uts
 *   npm run seed -- --dry-run    → dry-run UTS
 *   npm run seed:uas             → getaran-mekanik-uas
 *
 * Autentikasi Firebase Admin SDK (pilih salah satu):
 *   (A) Application Default Credentials (recommended utk dev lokal):
 *       gcloud auth application-default login
 *   (B) Service account key JSON:
 *       export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
 *
 * ⚠ JANGAN commit service account key ke git (sudah di .gitignore).
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMS MAP — daftarkan exam baru di sini saat rollout
// Setiap entry: examId → { questions: Array, summary: {examId, totalSoal, totalPoin, ...} }
// ─────────────────────────────────────────────────────────────────────────────
const EXAMS = {
  "getaran-mekanik-uts": (() => {
    const { UTS_QUESTIONS, SUMMARY } = require("./uts-getaran-answers");
    return { questions: UTS_QUESTIONS, summary: SUMMARY };
  })(),
  "getaran-mekanik-uas": (() => {
    const { UAS_QUESTIONS, SUMMARY } = require("./uas-getaran-answers");
    return { questions: UAS_QUESTIONS, summary: SUMMARY };
  })(),
  "optoauto-uts": (() => {
    const { UTS_QUESTIONS, SUMMARY } = require("./uts-optoauto-answers");
    return { questions: UTS_QUESTIONS, summary: SUMMARY };
  })(),
  "optoauto-uas": (() => {
    const { UAS_QUESTIONS, SUMMARY } = require("./uas-optoauto-answers");
    return { questions: UAS_QUESTIONS, summary: SUMMARY };
  })(),
  // Tambah saat rollout: "math4-uts", "math4-uas"
};

const PROJECT_ID = "getaran-mekanik";
const N_RANGE = Array.from({ length: 100 }, (_, i) => i);  // 0..99

// CLI arg parsing
const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes("--dry-run");
const LIST_ONLY = ARGS.includes("--list");
const ALL = ARGS.includes("--all");
const EXAM_ARG_IDX = ARGS.indexOf("--exam");
const CLI_EXAM_ID = EXAM_ARG_IDX !== -1 ? ARGS[EXAM_ARG_IDX + 1] : null;

// ─────────────────────────────────────────────────────────────────────────────
// Build payload utk satu soal: static → field langsung; parametric → byN map
// ─────────────────────────────────────────────────────────────────────────────
function buildPayload(q) {
  const common = {
    type: q.type,
    parametric: q.parametric,
    points: q.points,
  };
  if (q.tolerance !== undefined) common.tolerance = q.tolerance;
  if (q.allowPartial === true) {
    common.allowPartial = true;
    common.partialPoints = q.partialPoints ?? 1;
  }
  if (q.explain !== undefined) common.explain = q.explain;

  if (!q.parametric) {
    if (q.answer !== undefined) common.answer = q.answer;
    if (q.correctIdx !== undefined) common.correctIdx = q.correctIdx;
    return common;
  }

  // Parametric: build byN[0..99]
  const byN = {};
  for (const N of N_RANGE) {
    const variant = q.compute(N);
    const entry = {};
    if (variant.answer !== undefined) entry.answer = variant.answer;
    if (variant.correctIdx !== undefined) entry.correctIdx = variant.correctIdx;
    // `expected` is the Comp answer field name in UAS (UTS pakai `answer:`).
    // Server `evaluateAnswer` fallback ke `ans.expected` kalau `ans.answer` undefined.
    if (variant.expected !== undefined) entry.expected = variant.expected;
    if (variant.tolerance !== undefined) entry.tolerance = variant.tolerance;   // override per-N
    if (variant.explain !== undefined) entry.explain = variant.explain;
    // Multi-step: array of {label, value, tolerance}. Kalau ada, server pakai
    // sequence-matching alih-alih single-number check.
    if (variant.expectedSteps !== undefined) entry.expectedSteps = variant.expectedSteps;
    byN[String(N)] = entry;
  }
  common.byN = byN;
  return common;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanity check: pastikan byN map valid
// ─────────────────────────────────────────────────────────────────────────────
function validatePayload(qId, payload) {
  if (payload.parametric) {
    const missing = [];
    for (const N of N_RANGE) {
      const v = payload.byN[String(N)];
      if (!v) { missing.push(N); continue; }
      if (payload.type === "tf" && typeof v.answer !== "boolean") missing.push(`${N} (no bool)`);
      if (payload.type === "mc" && typeof v.correctIdx !== "number") missing.push(`${N} (no idx)`);
      if (payload.type === "comp") {
        const hasAnswer = Number.isFinite(v.answer);
        const hasExpected = Number.isFinite(v.expected);
        const hasSteps = Array.isArray(v.expectedSteps) && v.expectedSteps.length > 0 &&
          v.expectedSteps.every((s) => Number.isFinite(Number(s.value)));
        if (!hasAnswer && !hasExpected && !hasSteps) {
          missing.push(`${N} (no num & no expectedSteps)`);
        }
      }
    }
    if (missing.length) throw new Error(`${qId}: invalid byN at N=${missing.slice(0,5).join(",")}${missing.length>5?"...":""}`);
  } else {
    if (payload.type === "tf" && typeof payload.answer !== "boolean") {
      throw new Error(`${qId}: static TF must have boolean answer`);
    }
    if (payload.type === "mc" && typeof payload.correctIdx !== "number") {
      throw new Error(`${qId}: static MC must have number correctIdx`);
    }
    if (payload.type === "comp" && !Number.isFinite(payload.answer) && !Number.isFinite(payload.expected)) {
      throw new Error(`${qId}: static Comp must have finite number answer/expected`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview untuk dry-run (sampel 3 N values utk parametric)
// ─────────────────────────────────────────────────────────────────────────────
function preview(qId, payload) {
  const head = `  ${qId.padEnd(6)} type=${payload.type.padEnd(4)} pts=${payload.points}${payload.allowPartial?" [PARTIAL]":""}${payload.parametric?" PARAM":""}`;
  if (!payload.parametric) {
    const ans = payload.type === "tf" ? payload.answer
              : payload.type === "mc" ? `idx=${payload.correctIdx}`
              : `ans=${payload.answer ?? payload.expected}${payload.tolerance ? ` ±${payload.tolerance}` : ""}`;
    console.log(`${head}  → ${ans}`);
  } else {
    const sample = [0, 42, 99].map((N) => {
      const v = payload.byN[String(N)];
      let ans;
      if (payload.type === "tf") ans = v.answer;
      else if (payload.type === "mc") ans = `idx=${v.correctIdx}`;
      else if (Array.isArray(v.expectedSteps)) {
        ans = `steps=[${v.expectedSteps.map((s) => Number(s.value).toFixed?.(3)).join(",")}]`;
      } else {
        const num = v.answer ?? v.expected;
        ans = num?.toFixed?.(4) ?? num;
      }
      return `N=${N}:${ans}`;
    }).join("  ");
    console.log(`${head}  → ${sample}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed satu exam
// ─────────────────────────────────────────────────────────────────────────────
async function seedExam(examId, db) {
  const exam = EXAMS[examId];
  if (!exam) {
    throw new Error(`Unknown examId '${examId}'. Available: ${Object.keys(EXAMS).join(", ")}`);
  }
  const { questions, summary } = exam;
  const totalQuestions = summary.totalSoal ?? summary.totalQuestions ?? questions.length;
  const totalPoints = summary.totalPoin ?? summary.totalPoints ?? 0;
  const parametricCount = summary.parametricCount ?? questions.filter((q) => q.parametric).length;

  console.log("─".repeat(78));
  console.log(`Seed Firestore answer keys — ${examId}`);
  console.log(`  Total soal:      ${totalQuestions}`);
  console.log(`  Total poin:      ${totalPoints}`);
  console.log(`  Parametric:      ${parametricCount}/${totalQuestions}`);
  console.log(`  Mode:            ${DRY_RUN ? "DRY-RUN (no write)" : "LIVE (will upsert all docs)"}`);
  console.log("─".repeat(78));

  const payloads = [];
  for (const q of questions) {
    const payload = buildPayload(q);
    validatePayload(q.qId, payload);
    payloads.push({ qId: q.qId, payload });
    preview(q.qId, payload);
  }
  console.log("─".repeat(78));
  console.log(`✓ Built & validated ${payloads.length} payloads`);

  if (DRY_RUN) {
    console.log(`DRY-RUN selesai untuk ${examId}. Tidak ada penulisan ke Firestore.`);
    return { examId, count: payloads.length, written: false };
  }

  // Batch write
  const batch = db.batch();
  for (const { qId, payload } of payloads) {
    const ref = db.collection("examAnswers").doc(examId).collection("qs").doc(qId);
    batch.set(ref, payload);
  }
  await batch.commit();
  console.log(`✅ Wrote ${payloads.length} docs → examAnswers/${examId}/qs/`);

  // Sample verification: read first qId of each type
  console.log("Verifikasi (read back sample docs):");
  const samples = new Set();
  for (const q of questions) {
    if (samples.has(q.type)) continue;
    samples.add(q.type);
    const snap = await db.collection("examAnswers").doc(examId).collection("qs").doc(q.qId).get();
    if (!snap.exists) {
      console.log(`  ✗ ${q.qId}: NOT FOUND`);
      continue;
    }
    const d = snap.data();
    const sample = d.parametric
      ? `byN keys: ${Object.keys(d.byN || {}).length}, N=0 → ${JSON.stringify(d.byN["0"]).slice(0, 80)}`
      : JSON.stringify(d).slice(0, 100);
    console.log(`  ✓ ${q.qId} (${q.type}): ${sample}`);
  }
  return { examId, count: payloads.length, written: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  if (LIST_ONLY) {
    console.log("Available exams:");
    for (const [id, ex] of Object.entries(EXAMS)) {
      const total = ex.summary.totalSoal ?? ex.summary.totalQuestions ?? ex.questions.length;
      console.log(`  • ${id.padEnd(28)} (${total} soal / ${ex.summary.totalPoin ?? ex.summary.totalPoints ?? "?"} poin)`);
    }
    process.exit(0);
  }

  // Determine which exams to seed
  let targets;
  if (ALL) {
    targets = Object.keys(EXAMS);
  } else if (CLI_EXAM_ID) {
    if (!EXAMS[CLI_EXAM_ID]) {
      console.error(`❌ Unknown --exam '${CLI_EXAM_ID}'. Available:`);
      Object.keys(EXAMS).forEach((id) => console.error(`     • ${id}`));
      process.exit(1);
    }
    targets = [CLI_EXAM_ID];
  } else {
    // Backward compat: default ke getaran-mekanik-uts
    targets = ["getaran-mekanik-uts"];
    console.log("ℹ Tidak ada --exam atau --all flag. Default ke getaran-mekanik-uts (backward compat).");
    console.log("  Pakai --list untuk lihat exam tersedia, atau --exam <id> / --all untuk eksplisit.\n");
  }

  // Init Admin SDK (skip kalau DRY_RUN)
  let db = null;
  if (!DRY_RUN) {
    const admin = require("firebase-admin");
    admin.initializeApp({ projectId: PROJECT_ID });
    db = admin.firestore();
  }

  const results = [];
  for (const examId of targets) {
    try {
      const result = await seedExam(examId, db);
      results.push(result);
    } catch (err) {
      console.error(`❌ Gagal seed ${examId}:`, err.message);
      results.push({ examId, error: err.message });
    }
  }

  console.log("\n" + "═".repeat(78));
  console.log("SUMMARY:");
  for (const r of results) {
    if (r.error) {
      console.log(`  ✗ ${r.examId}: ERROR — ${r.error}`);
    } else {
      console.log(`  ${r.written ? "✅" : "🔍"} ${r.examId}: ${r.count} soal ${r.written ? "written" : "(dry-run only)"}`);
    }
  }
  console.log("═".repeat(78));

  const hadError = results.some((r) => r.error);
  process.exit(hadError ? 1 : 0);
}

main().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
