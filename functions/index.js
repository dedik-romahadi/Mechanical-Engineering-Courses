/* eslint-disable max-len */
/**
 * Cloud Functions — server-side exam answer validation.
 *
 * Pilot scope (Phase 2): Getaran Mekanik UTS.
 * Setelah stabil, akan di-extend ke UAS + 4 exam mata kuliah lain (lihat EXAM_DB_PATHS).
 *
 * Arsitektur (Phase 2 — code as source of truth):
 *   - Kunci jawaban + compute(N) untuk 45 soal hidup di functions/exam-data/getaran-uts.js
 *   - Firestore HANYA dipakai untuk audit trail (examAttempts/), bukan storage kunci.
 *   - Client TIDAK PUNYA akses ke kunci jawaban — semua verifikasi server-side.
 *
 * Callable functions:
 *   1. getExamPresentation({examId, nim, pinHash})
 *        Return: { N, questions: [{id, type, modul, points, options?(MC only), tolerance?(comp)}] }
 *        Tujuan: client tahu meta + options (untuk MC) tanpa tahu correctIdx.
 *
 *   2. checkExamAnswer({examId, qId, userAnswer, nim, pinHash, lateMultiplier})
 *        Return: { correct, scoreDelta, alreadyAnswered }
 *        TIDAK return explain — sesuai aturan UTS-Murni (§27.7 Pedoman Modul).
 *
 * Security:
 *   - PIN verifikasi via RTDB pins/mhs_<NIM> (read-only access)
 *   - Rate limit: 1 attempt per qId per NIM (enforced via Firestore examAttempts/)
 *   - lateMultiplier di-clamp ke [0, 1]
 *   - userAnswer index MC dibatasi 0..3
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const getaranUts = require("./exam-data/getaran-uts");

initializeApp();

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
  memory: "256MiB",
  timeoutSeconds: 10,
});

// ─────────────────────────────────────────────────────────────────────────────
// Registry: examId → { dbPath (RTDB visitor record), dataModule }
// Saat extend ke exam baru, tambahkan entry + require module-nya.
// ─────────────────────────────────────────────────────────────────────────────
const EXAM_REGISTRY = {
  "getaran-mekanik-uts": {
    dbPath: "visitors/getaran_mekanik/uts",
    data: getaranUts,
  },
  // "getaran-mekanik-uas": { dbPath: "visitors/getaran_mekanik/uas", data: require("./exam-data/getaran-uas") },
  // "math4-uts":           { dbPath: "visitors/math4/uts",          data: require("./exam-data/math4-uts") },
};

function sanitizeKey(s) {
  return String(s).replace(/[.#$[\]/]/g, "_");
}

function clampMultiplier(m) {
  const n = Number(m);
  if (!Number.isFinite(n) || n < 0 || n > 1) return 1;
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: verifikasi PIN vs RTDB pins/mhs_<NIM>.
// Throws HttpsError jika invalid.
// ─────────────────────────────────────────────────────────────────────────────
async function verifyPin(nim, pinHash) {
  if (!nim || !pinHash) {
    throw new HttpsError("invalid-argument", "Missing nim or pinHash");
  }
  const nimKey = sanitizeKey(nim);
  const rtdb = getDatabase();
  const pinSnap = await rtdb.ref(`pins/mhs_${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum terdaftar — login ulang");
  }
  const storedPin = pinSnap.val();
  if (!storedPin || storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "Kredensial tidak valid");
  }
  return nimKey;
}

// ═════════════════════════════════════════════════════════════════════════════
// getExamPresentation — return question metadata + MC options (NO answers).
// Dipanggil client saat mahasiswa membuka exam, sekali untuk semua 45 soal.
// ═════════════════════════════════════════════════════════════════════════════
exports.getExamPresentation = onCall(async (request) => {
  const { examId, nim, pinHash } = request.data || {};
  const exam = EXAM_REGISTRY[examId];
  if (!exam) {
    throw new HttpsError("not-found", `Unknown exam: ${examId}`);
  }
  await verifyPin(nim, pinHash);

  const N = exam.data.getNFromNim(nim);
  const questions = exam.data.listAllQuestionIds().map((qId) => {
    const meta = exam.data.getQuestionMeta(qId);
    const out = {
      id: meta.id,
      type: meta.type,
      modul: meta.modul,
      points: meta.points,
      parametric: meta.parametric,
    };
    if (meta.category) out.category = meta.category;
    if (meta.type === "comp") out.tolerance = meta.tolerance;
    if (meta.type === "mc") {
      out.options = exam.data.getMCOptions(qId, N);
    }
    return out;
  });

  return { N, scoreTotal: exam.data.SCORE_TOTAL, questions };
});

// ═════════════════════════════════════════════════════════════════════════════
// checkExamAnswer — validate single answer, award points.
// ═════════════════════════════════════════════════════════════════════════════
exports.checkExamAnswer = onCall(async (request) => {
  const d = request.data || {};
  const { examId, qId, userAnswer, nim, pinHash, lateMultiplier } = d;

  if (!examId || typeof qId !== "string" || userAnswer === undefined || userAnswer === null) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  const exam = EXAM_REGISTRY[examId];
  if (!exam) {
    throw new HttpsError("not-found", `Unknown exam: ${examId}`);
  }

  const nimKey = await verifyPin(nim, pinHash);
  const N = exam.data.getNFromNim(nim);

  // ── Rate-limit: 1 attempt per soal per mahasiswa (enforce di Firestore) ──
  const fs = getFirestore();
  const attemptRef = fs.doc(`examAttempts/${examId}/students/${nimKey}/qs/${qId}`);
  const attemptSnap = await attemptRef.get();
  if (attemptSnap.exists()) {
    const prev = attemptSnap.data();
    // TIDAK return explain — exam-murni rule.
    return {
      alreadyAnswered: true,
      correct: prev.correct === true,
      scoreDelta: 0,
    };
  }

  // ── Verifikasi via code module (source of truth) ──
  const verdict = exam.data.verifyAnswer(qId, N, userAnswer);
  if (verdict.error) {
    throw new HttpsError("not-found", `Answer key error for ${qId}: ${verdict.error}`);
  }

  const mult = clampMultiplier(lateMultiplier);
  const scoreDelta = verdict.correct ? Math.round(verdict.points * mult * 1000) / 1000 : 0;

  // ── Log attempt (audit trail). userAnswer disimpan untuk forensik dosen,
  //    TAPI tidak pernah di-return ke client. ──
  await attemptRef.set({
    examId,
    qId,
    nim,
    N,
    userAnswer: typeof userAnswer === "object" ? JSON.stringify(userAnswer) : userAnswer,
    correct: verdict.correct,
    pointsAwarded: scoreDelta,
    lateMultiplier: mult,
    timestamp: FieldValue.serverTimestamp(),
  });

  // ── Award poin ke RTDB visitor record (transaction-safe) ──
  if (verdict.correct && scoreDelta > 0) {
    const rtdb = getDatabase();
    const vRef = rtdb.ref(`${exam.dbPath}/mhs_${nimKey}`);
    await vRef.transaction((cur) => {
      if (!cur) return cur;
      const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
      if (scored.includes(qId)) return cur;
      scored.push(qId);
      cur.points = (cur.points || 0) + scoreDelta;
      cur.pointTimestamp = new Date().toISOString();
      cur.scoredQuestions = scored.join(",");
      // Simpan selection untuk TF/MC saja (untuk visual restore di client)
      if (typeof userAnswer === "boolean" || typeof userAnswer === "number") {
        const sel = Object.assign({}, cur.selections || {});
        sel[qId] = userAnswer;
        cur.selections = sel;
      }
      return cur;
    });
  }

  return {
    correct: verdict.correct,
    scoreDelta,
    alreadyAnswered: false,
  };
});
