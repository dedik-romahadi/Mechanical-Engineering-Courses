#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seed answer keys ke Firestore `examAnswers/{examId}/qs/{qId}`.
 *
 * Pilot scope: getaran-mekanik-uts (45 soal). Untuk soal parametric,
 * generate byN[0..99] map (1 doc per qId, ukuran cukup utk semua varian).
 *
 * Cara pakai (dari direktori `functions/`):
 *
 *   # Dry-run (preview, tidak nulis ke Firestore):
 *   node seed/seed-firestore.js --dry-run
 *
 *   # Live seed (overwrite/upsert semua 45 doc):
 *   npm run seed
 *
 * Autentikasi Firebase Admin SDK (pilih salah satu):
 *   (A) Application Default Credentials (recommended utk dev lokal):
 *       gcloud auth application-default login
 *   (B) Service account key JSON:
 *       export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
 *
 * Untuk download service account key:
 *   Firebase Console → Project settings → Service accounts → Generate new private key
 *   ⚠ JANGAN commit file SA key ke git (sudah di .gitignore).
 */

const { UTS_QUESTIONS, SUMMARY } = require("./uts-getaran-answers");
// firebase-admin di-require lazy di main() agar dry-run tidak butuh npm install

const PROJECT_ID = "getaran-mekanik";
const EXAM_ID = SUMMARY.examId;     // "getaran-mekanik-uts"
const N_RANGE = Array.from({ length: 100 }, (_, i) => i);  // 0..99
const DRY_RUN = process.argv.includes("--dry-run");

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
    if (variant.tolerance !== undefined) entry.tolerance = variant.tolerance;   // override per-N
    if (variant.explain !== undefined) entry.explain = variant.explain;
    byN[String(N)] = entry;
  }
  common.byN = byN;
  return common;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanity check: pastikan byN map valid (semua N punya answer/correctIdx)
// ─────────────────────────────────────────────────────────────────────────────
function validatePayload(qId, payload) {
  if (payload.parametric) {
    const missing = [];
    for (const N of N_RANGE) {
      const v = payload.byN[String(N)];
      if (!v) { missing.push(N); continue; }
      if (payload.type === "tf" && typeof v.answer !== "boolean") missing.push(`${N} (no bool)`);
      if (payload.type === "mc" && typeof v.correctIdx !== "number") missing.push(`${N} (no idx)`);
      if (payload.type === "comp" && !Number.isFinite(v.answer)) missing.push(`${N} (no num)`);
    }
    if (missing.length) throw new Error(`${qId}: invalid byN at N=${missing.slice(0,5).join(",")}${missing.length>5?"...":""}`);
  } else {
    if (payload.type === "tf" && typeof payload.answer !== "boolean") {
      throw new Error(`${qId}: static TF must have boolean answer`);
    }
    if (payload.type === "mc" && typeof payload.correctIdx !== "number") {
      throw new Error(`${qId}: static MC must have number correctIdx`);
    }
    if (payload.type === "comp" && !Number.isFinite(payload.answer)) {
      throw new Error(`${qId}: static Comp must have finite number answer`);
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
              : `ans=${payload.answer}${payload.tolerance ? ` ±${payload.tolerance}` : ""}`;
    console.log(`${head}  → ${ans}`);
  } else {
    const sample = [0, 42, 99].map((N) => {
      const v = payload.byN[String(N)];
      const ans = payload.type === "tf" ? v.answer
                : payload.type === "mc" ? `idx=${v.correctIdx}`
                : v.answer?.toFixed?.(4) ?? v.answer;
      return `N=${N}:${ans}`;
    }).join("  ");
    console.log(`${head}  → ${sample}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("─".repeat(78));
  console.log(`Seed Firestore answer keys — ${EXAM_ID}`);
  console.log(`  Total soal:      ${SUMMARY.totalQuestions}`);
  console.log(`  Total poin:      ${SUMMARY.totalPoints}`);
  console.log(`  Parametric:      ${SUMMARY.parametricCount}/${SUMMARY.totalQuestions}`);
  console.log(`  Mode:            ${DRY_RUN ? "DRY-RUN (no write)" : "LIVE (will upsert all docs)"}`);
  console.log("─".repeat(78));

  // Build + validate semua payload dulu (fail-fast sebelum touch Firestore)
  const payloads = [];
  for (const q of UTS_QUESTIONS) {
    const payload = buildPayload(q);
    validatePayload(q.qId, payload);
    payloads.push({ qId: q.qId, payload });
    preview(q.qId, payload);
  }
  console.log("─".repeat(78));
  console.log(`✓ Built & validated ${payloads.length} payloads`);

  if (DRY_RUN) {
    console.log("DRY-RUN selesai. Tidak ada penulisan ke Firestore. Hapus --dry-run untuk live.");
    process.exit(0);
  }

  // Init Admin SDK (gunakan ADC atau GOOGLE_APPLICATION_CREDENTIALS)
  const admin = require("firebase-admin");   // lazy require — dry-run tidak butuh ini
  admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  // Batch write (max 500 ops per batch; kita cuma punya 45, jadi 1 batch cukup)
  const batch = db.batch();
  for (const { qId, payload } of payloads) {
    const ref = db.collection("examAnswers").doc(EXAM_ID).collection("qs").doc(qId);
    batch.set(ref, payload);
  }
  await batch.commit();
  console.log(`✅ Wrote ${payloads.length} docs → examAnswers/${EXAM_ID}/qs/`);

  // Verifikasi: read 3 docs (1 TF static, 1 MC parametric, 1 Comp Hard)
  console.log("─".repeat(78));
  console.log("Verifikasi (read back 3 sample docs):");
  for (const qId of ["tf1", "mc14", "c11"]) {
    const snap = await db.collection("examAnswers").doc(EXAM_ID).collection("qs").doc(qId).get();
    if (!snap.exists) {
      console.log(`  ✗ ${qId}: NOT FOUND`);
      continue;
    }
    const d = snap.data();
    const sample = d.parametric
      ? `byN keys: ${Object.keys(d.byN).length}, N=0 → ${JSON.stringify(d.byN["0"]).slice(0, 80)}`
      : JSON.stringify(d).slice(0, 100);
    console.log(`  ✓ ${qId}: ${sample}`);
  }
  console.log("─".repeat(78));
  console.log("Seed selesai. Cek di Firebase Console → Firestore → examAnswers/");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
