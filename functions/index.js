/* eslint-disable max-len */
/**
 * Cloud Functions — server-side exam answer validation.
 *
 * Pilot scope (Phase 1): Getaran Mekanik UTS.
 * Setelah stabil, akan di-extend ke UAS + 4 exam mata kuliah lain (lihat EXAM_DB_PATHS).
 *
 * Arsitektur:
 *   - Client mengirim {examId, qId, userAnswer, nim, pinHash, lateMultiplier}
 *   - Function verifikasi pinHash vs RTDB pins/mhs_<NIM>
 *   - Cek rate-limit (1 attempt per soal per mahasiswa) di Firestore examAttempts/...
 *   - Lookup kunci jawaban dari Firestore examAnswers/{examId}/qs/{qId} (admin-only readable)
 *   - Bandingkan jawaban (tf / mc / comp dengan tolerance)
 *   - Award poin ke RTDB visitor record (transaction)
 *   - Return {correct, explain, scoreDelta, alreadyAnswered}
 *
 * Kunci jawaban TIDAK PERNAH disertakan dalam HTML client.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,        // mencegah runaway scale (cost safety)
  memory: "256MiB",
  timeoutSeconds: 10,
});

// ─────────────────────────────────────────────────────────────────────────────
// Whitelist exam yang sudah dimigrasi ke server-side validation.
// Format: examId → RTDB path untuk visitor record (sama dengan client `DB_PATH`).
// ─────────────────────────────────────────────────────────────────────────────
const EXAM_DB_PATHS = {
  "getaran-mekanik-uts": "visitors/getaran_mekanik/uts",
  // "getaran-mekanik-uas": "visitors/getaran_mekanik/uas",
  // "math4-uts":           "visitors/math4/uts",
  // "math4-uas":           "visitors/math4/uas",
  // "optoauto-uts":        "visitors/optoauto/uts",
  // "optoauto-uas":        "visitors/optoauto/uas",
};

// Konsisten dengan helper client `sanitizeKey()` di exam HTML.
function sanitizeKey(s) {
  return String(s).replace(/[.#$[\]/]/g, "_");
}

// Late multiplier dikirim dari client (schedule logic kompleks ada di sana).
// Kita clamp ke range [0, 1] supaya tidak bisa di-spoof menjadi negatif/besar.
function clampMultiplier(m) {
  const n = Number(m);
  if (!Number.isFinite(n) || n < 0 || n > 1) return 1;
  return n;
}

// ═════════════════════════════════════════════════════════════════════════════
// checkExamAnswer — callable function (HTTPS).
// Client memanggil via: httpsCallable(getFunctions(app, 'asia-southeast1'), 'checkExamAnswer')
// ═════════════════════════════════════════════════════════════════════════════
exports.checkExamAnswer = onCall(async (request) => {
  const d = request.data || {};
  const { examId, qId, userAnswer, nim, pinHash, lateMultiplier } = d;

  // ── 1) Validasi input ──
  if (!examId || typeof qId !== "string" ||
      userAnswer === undefined || userAnswer === null ||
      !nim || !pinHash) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  const dbPath = EXAM_DB_PATHS[examId];
  if (!dbPath) {
    throw new HttpsError("not-found", `Unknown exam: ${examId}`);
  }

  const nimKey = sanitizeKey(nim);

  // ── 2) Auth: verifikasi pinHash vs RTDB pins/ ──
  const rtdb = getDatabase();
  const pinSnap = await rtdb.ref(`pins/mhs_${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum terdaftar — login ulang");
  }
  const storedPin = pinSnap.val();
  if (!storedPin || storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "Kredensial tidak valid");
  }

  // ── 3) Rate-limit: 1 attempt per soal per mahasiswa ──
  const fs = getFirestore();
  const attemptRef = fs.doc(`examAttempts/${examId}/students/${nimKey}/qs/${qId}`);
  const attemptSnap = await attemptRef.get();
  if (attemptSnap.exists()) {
    const prev = attemptSnap.data();
    return {
      alreadyAnswered: true,
      correct: prev.correct === true,
      explain: prev.explain || "",
      scoreDelta: 0,
    };
  }

  // ── 4) Lookup kunci jawaban (Firestore admin-only readable) ──
  const ansRef = fs.doc(`examAnswers/${examId}/qs/${qId}`);
  const ansSnap = await ansRef.get();
  if (!ansSnap.exists()) {
    throw new HttpsError("not-found", `Answer key for ${qId} not configured`);
  }
  const ans = ansSnap.data();

  // ── 5) Bandingkan jawaban berdasarkan tipe ──
  let correct = false;
  if (ans.type === "tf") {
    correct = Boolean(userAnswer) === Boolean(ans.answer);
  } else if (ans.type === "mc") {
    correct = Number(userAnswer) === Number(ans.correctIdx);
  } else if (ans.type === "comp") {
    const got = Number(userAnswer);
    const target = Number(ans.answer);
    const tol = Number(ans.tolerance ?? 0.01);
    correct = Number.isFinite(got) && Math.abs(got - target) <= tol;
  } else {
    throw new HttpsError("internal", `Unknown question type: ${ans.type}`);
  }

  const basePoints = Number(ans.points ?? 1);
  const mult = clampMultiplier(lateMultiplier ?? 1);
  const scoreDelta = correct ? basePoints * mult : 0;

  // ── 6) Log attempt (audit trail) ──
  await attemptRef.set({
    examId,
    qId,
    userAnswer,
    correct,
    scoreDelta,
    explain: ans.explain || "",
    lateMultiplier: mult,
    timestamp: FieldValue.serverTimestamp(),
  });

  // ── 7) Award poin ke RTDB visitor record (transaction-safe) ──
  if (correct && scoreDelta > 0) {
    const vRef = rtdb.ref(`${dbPath}/mhs_${nimKey}`);
    await vRef.transaction((cur) => {
      if (!cur) return cur;   // visitor record harus sudah ada (created saat login)
      const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
      if (scored.includes(qId)) return cur;   // double-protect (seharusnya tidak terjadi karena rate-limit)
      scored.push(qId);
      const selections = Object.assign({}, cur.selections || {});
      // Simpan pilihan mahasiswa untuk audit (MC/TF saja)
      if (ans.type === "mc" || ans.type === "tf") {
        selections[qId] = userAnswer;
      }
      cur.points = (cur.points || 0) + scoreDelta;
      cur.pointTimestamp = new Date().toISOString();
      cur.scoredQuestions = scored.join(",");
      cur.selections = selections;
      return cur;
    });
  }

  return {
    correct,
    explain: ans.explain || "",
    scoreDelta,
    alreadyAnswered: false,
  };
});
