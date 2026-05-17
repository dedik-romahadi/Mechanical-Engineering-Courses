/* eslint-disable max-len */
/**
 * Cloud Functions — server-side exam answer validation.
 *
 * Pilot scope (Phase 1): Getaran Mekanik UTS (45 soal / 70 poin).
 * Setelah stabil → extend ke UAS + 4 exam mata kuliah lain via EXAM_CONFIG.
 *
 * Arsitektur (full parity dengan client UTS.html):
 *   - Client kirim {examId, qId, userAnswer, nim, pinHash, codeText?}
 *   - Function verifikasi pinHash vs RTDB pins/mhs_<NIM>
 *   - Function baca jadwal dari RTDB settings/.../schedule (server-authoritative)
 *     → tolak jika sebelum start atau setelah (end + extension).
 *     → late multiplier (default 0.8) hanya berlaku di window (end, end+extension].
 *   - Rate-limit: 1 attempt per soal via Firestore examAttempts/{examId}/students/{nim}/qs/{qId}
 *   - Lookup kunci jawaban Firestore examAnswers/{examId}/qs/{qId} (deny-all utk client)
 *   - Bandingkan jawaban (tf / mc / comp ± tolerance)
 *   - Marker konvensi (sync dgn client _checkConsolationPoint):
 *       TF benar    → qId            (mis. "tf1")
 *       TF salah    → qId + "_tf_used"
 *       MC benar    → qId            (mis. "mc1")
 *       MC salah    → qId + "_mc_used"
 *       Comp benar  → qId + "_comp"
 *       Comp partial→ qId + "_comp_partial"  (Hard saja, & non-late)
 *       Comp salah  → qId + "_comp_used"
 *   - RTDB visitor transaction:
 *       - Auto-create record jika belum ada (race-condition guard)
 *       - Strip legacy pinHash/pinSetAt (PIN sekarang di pins/ global)
 *       - Append marker ke scoredQuestions CSV (dedupe)
 *       - Tambah scoreDelta ke points, cap ke totalPoints (mis. 70)
 *       - Simpan selections[qId] (TF/MC) atau codes[qId] (Comp)
 *       - Consolation check: jika ≥threshold base-ID attempted & points=0 → +consolationPoint
 *   - Audit trail: setiap attempt dicatat di Firestore examAttempts/...
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
  maxInstances: 10,        // cost safety: cegah runaway scale
  memory: "256MiB",
  timeoutSeconds: 10,
});

// ─────────────────────────────────────────────────────────────────────────────
// EXAM_CONFIG — per-exam scoring & path rules.
// Tambahkan entry baru saat rollout (UAS, math4, optoauto, dst).
// ─────────────────────────────────────────────────────────────────────────────
const EXAM_CONFIG = {
  "getaran-mekanik-uts": {
    dbPath: "visitors/getaran_mekanik/uts",
    schedulePath: "settings/getaran_mekanik/uts/schedule",
    totalPoints: 70,             // 10 TF + 20 MC + 10 Comp E/M + 5 Comp Hard
    consolationThreshold: 30,    // ≥30 distinct base-ID attempted
    consolationPoint: 1,
    lateMultiplierValue: 0.8,    // di window (end, end+extension]
  },
  // "getaran-mekanik-uas": { dbPath: "visitors/getaran_mekanik/uas", ... },
  // "math4-uts":           { dbPath: "visitors/math4/uts",            ... },
  // "math4-uas":           { dbPath: "visitors/math4/uas",            ... },
  // "optoauto-uts":        { dbPath: "visitors/optoauto/uts",         ... },
  // "optoauto-uas":        { dbPath: "visitors/optoauto/uas",         ... },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Sync dengan client `sanitizeKey()` (UTS.html line 5808).
function sanitizeKey(s) {
  return String(s).replace(/[.#$[\]/]/g, "_");
}

// Sync dengan client `getN()` (UTS.html line 1596-1602): 2 digit terakhir NIM.
// Dipakai utk lookup variant parametric (byN map).
function deriveN(nim) {
  const digits = String(nim).replace(/\D/g, "");
  if (digits.length < 2) return 0;
  return parseInt(digits.slice(-2), 10) || 0;
}

// Resolve answer key: kalau parametric, ambil variant dari byN[N] dengan fallback
// ke field shared. Returns objek dengan field {type, answer/correctIdx, tolerance,
// points, allowPartial, partialPoints, explain} yang sudah final utk evaluasi.
function resolveAnswerKey(ans, nim) {
  if (ans.parametric !== true) return ans;
  const N = deriveN(nim);
  const variant = (ans.byN && ans.byN[String(N)]) || null;
  if (!variant) {
    throw new HttpsError("internal",
      `Parametric answer key missing variant for N=${N}`);
  }
  return {
    type: ans.type,
    parametric: true,
    points: ans.points,
    allowPartial: ans.allowPartial,
    partialPoints: ans.partialPoints,
    answer: variant.answer !== undefined ? variant.answer : ans.answer,
    correctIdx: variant.correctIdx !== undefined ? variant.correctIdx : ans.correctIdx,
    tolerance: variant.tolerance !== undefined ? variant.tolerance : ans.tolerance,
    explain: variant.explain !== undefined ? variant.explain : ans.explain,
  };
}

// Hapus suffix marker → ambil base qId.
// Dipakai untuk hitung distinct attempted IDs (consolation threshold).
function stripMarkerSuffix(tag) {
  return tag
    .replace(/_tf_used$/, "")
    .replace(/_mc_used$/, "")
    .replace(/_comp_used$/, "")
    .replace(/_comp_partial$/, "")
    .replace(/_comp$/, "");
}

// Baca jadwal dari RTDB → evaluasi server-authoritative.
// Returns { isOpen, pastDeadline, multiplier, reason }.
async function evalSchedule(rtdb, schedulePath, lateMultiplierValue) {
  const snap = await rtdb.ref(schedulePath).get();
  if (!snap.exists()) {
    return { isOpen: false, pastDeadline: false, multiplier: 0, reason: "schedule-missing" };
  }
  const s = snap.val() || {};
  if (!s.start || !s.end) {
    return { isOpen: false, pastDeadline: false, multiplier: 0, reason: "schedule-incomplete" };
  }
  const now = Date.now();
  const start = new Date(s.start).getTime();
  const end = new Date(s.end).getTime();
  const ext = Number(s.extension || 0) * 60 * 1000;     // menit → ms
  const isOpen = now >= start && now <= end + ext;
  const pastDeadline = now > end && now <= end + ext;
  let multiplier = 0;
  if (isOpen) multiplier = pastDeadline ? lateMultiplierValue : 1.0;
  let reason = "open";
  if (!isOpen) reason = now < start ? "before-start" : "after-deadline";
  return { isOpen, pastDeadline, multiplier, reason };
}

// Bandingkan jawaban berdasarkan tipe.
// Returns { correct: bool, allowPartial: bool }.
function evaluateAnswer(ans, userAnswer) {
  if (ans.type === "tf") {
    if (userAnswer === undefined || userAnswer === null) {
      throw new HttpsError("invalid-argument", "userAnswer required for TF");
    }
    return { correct: Boolean(userAnswer) === Boolean(ans.answer), allowPartial: false };
  }
  if (ans.type === "mc") {
    if (userAnswer === undefined || userAnswer === null) {
      throw new HttpsError("invalid-argument", "userAnswer required for MC");
    }
    return { correct: Number(userAnswer) === Number(ans.correctIdx), allowPartial: false };
  }
  if (ans.type === "comp") {
    // null = client tidak punya jawaban yang bisa di-parse (mis. Pyodide error).
    // Tetap dianggap sbg attempt yg salah, tapi partial-credit logic tetap berlaku
    // utk Comp Hard non-late.
    if (userAnswer === undefined || userAnswer === null) {
      return { correct: false, allowPartial: ans.allowPartial === true };
    }
    const got = Number(userAnswer);
    const target = Number(ans.answer);
    const tol = Number(ans.tolerance ?? 0.01);
    const correct = Number.isFinite(got) && Number.isFinite(target) && Math.abs(got - target) <= tol;
    return { correct, allowPartial: ans.allowPartial === true };
  }
  throw new HttpsError("internal", `Unknown question type: ${ans.type}`);
}

// Tentukan marker suffix + base points + status berdasarkan tipe & outcome.
// Mirror persis client logic (_awardPoint / _recordMcAttempt / _awardTfPoint /
// _recordTfAttempt / _awardCompPoint / _awardCompPartial / _recordCompAttempt).
function computeOutcome(ans, evalResult, pastDeadline) {
  const { correct, allowPartial } = evalResult;
  const basePoints = Number(ans.points ?? 1);

  if (ans.type === "tf") {
    return correct
      ? { markerSuffix: "",          points: basePoints, status: "correct" }
      : { markerSuffix: "_tf_used",  points: 0,          status: "wrong" };
  }
  if (ans.type === "mc") {
    return correct
      ? { markerSuffix: "",          points: basePoints, status: "correct" }
      : { markerSuffix: "_mc_used",  points: 0,          status: "wrong" };
  }
  if (ans.type === "comp") {
    if (correct) {
      return { markerSuffix: "_comp", points: basePoints, status: "correct" };
    }
    // Partial credit hanya untuk Hard (allowPartial=true) DAN bukan late window.
    // Mirror client _awardCompPartial: `if (_isPastDeadline()) return;`
    if (allowPartial && !pastDeadline) {
      const partial = Number(ans.partialPoints ?? 1);
      return { markerSuffix: "_comp_partial", points: partial, status: "partial" };
    }
    return { markerSuffix: "_comp_used", points: 0, status: "wrong" };
  }
  throw new HttpsError("internal", `Unknown question type: ${ans.type}`);
}

// Normalisasi userAnswer untuk disimpan di selections (TF=boolean, MC=number).
function normalizeSelection(type, userAnswer) {
  if (type === "tf") return Boolean(userAnswer);
  if (type === "mc") return Number(userAnswer);
  return userAnswer;
}

// ═════════════════════════════════════════════════════════════════════════════
// checkExamAnswer — callable function (HTTPS).
// Client: httpsCallable(getFunctions(app, 'asia-southeast1'), 'checkExamAnswer')
// ═════════════════════════════════════════════════════════════════════════════
exports.checkExamAnswer = onCall(async (request) => {
  const d = request.data || {};
  const { examId, qId, userAnswer, nim, pinHash, codeText } = d;

  // ── 1) Validate input ──
  // Catatan: utk Comp dgn Pyodide error, client kirim userAnswer=null → tetap
  // dianggap attempt (cek tipe-specific di evaluateAnswer). Jadi null bukan
  // invalid di sini.
  if (!examId || typeof qId !== "string" || qId.length === 0 || qId.length > 40 ||
      !nim || !pinHash) {
    throw new HttpsError("invalid-argument", "Missing or malformed required fields");
  }
  if (typeof pinHash !== "string" || !/^[0-9a-f]{64}$/.test(pinHash)) {
    throw new HttpsError("invalid-argument", "Invalid pinHash format");
  }
  const cfg = EXAM_CONFIG[examId];
  if (!cfg) {
    throw new HttpsError("not-found", `Unknown exam: ${examId}`);
  }
  const nimKey = sanitizeKey(nim);
  if (!/^[0-9A-Z_]{1,20}$/.test(nimKey)) {
    throw new HttpsError("invalid-argument", "Invalid NIM format");
  }

  const rtdb = getDatabase();
  const fs = getFirestore();

  // ── 2) Auth: verifikasi pinHash vs RTDB pins/ ──
  const pinSnap = await rtdb.ref(`pins/mhs_${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum terdaftar — login ulang");
  }
  const storedPin = pinSnap.val();
  if (!storedPin || storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "Kredensial tidak valid");
  }

  // ── 3) Schedule gate (server-authoritative) ──
  const sched = await evalSchedule(rtdb, cfg.schedulePath, cfg.lateMultiplierValue);
  if (!sched.isOpen) {
    const msg = sched.reason === "before-start"
      ? "Akses ujian belum dibuka — tunggu waktu mulai"
      : sched.reason === "after-deadline"
        ? "Batas waktu ujian sudah lewat — submit ditolak"
        : "Jadwal ujian belum dikonfigurasi";
    throw new HttpsError("failed-precondition", msg);
  }

  // ── 4) Rate-limit: 1 attempt per qId per nim (Firestore idempotency check) ──
  const attemptRef = fs.doc(`examAttempts/${examId}/students/${nimKey}/qs/${qId}`);
  const attemptSnap = await attemptRef.get();
  if (attemptSnap.exists) {
    const prev = attemptSnap.data();
    return {
      alreadyAnswered: true,
      correct: prev.correct === true,
      status: prev.status || (prev.correct ? "correct" : "wrong"),
      explain: prev.explain || "",
      scoreDelta: 0,
      marker: prev.marker || qId,
      lateMultiplier: prev.lateMultiplier ?? null,
    };
  }

  // ── 5) Lookup answer key (Firestore admin-only readable) ──
  const ansRef = fs.doc(`examAnswers/${examId}/qs/${qId}`);
  const ansSnap = await ansRef.get();
  if (!ansSnap.exists) {
    throw new HttpsError("not-found", `Answer key for ${qId} not configured`);
  }
  const rawAns = ansSnap.data();
  const ans = resolveAnswerKey(rawAns, nim);

  // ── 6) Evaluate ──
  const evalResult = evaluateAnswer(ans, userAnswer);
  const outcome = computeOutcome(ans, evalResult, sched.pastDeadline);
  const scoreDelta = outcome.points * sched.multiplier;
  const markerKey = qId + outcome.markerSuffix;

  // ── 7) Log attempt (audit trail) ──
  const attemptDoc = {
    examId,
    qId,
    type: ans.type,
    parametric: rawAns.parametric === true,
    nVariant: rawAns.parametric === true ? deriveN(nim) : null,
    userAnswer,
    correct: evalResult.correct,
    status: outcome.status,
    marker: markerKey,
    scoreDelta,
    lateMultiplier: sched.multiplier,
    pastDeadline: sched.pastDeadline,
    explain: ans.explain || "",
    timestamp: FieldValue.serverTimestamp(),
  };
  if (ans.type === "comp" && typeof codeText === "string" && codeText.length > 0) {
    attemptDoc.codePreview = codeText.slice(0, 5000);
  }
  await attemptRef.set(attemptDoc);

  // ── 8) Update RTDB visitor record (atomic transaction with consolation) ──
  let consolationAwarded = false;
  const vRef = rtdb.ref(`${cfg.dbPath}/mhs_${nimKey}`);
  await vRef.transaction((cur) => {
    consolationAwarded = false;   // reset di setiap iterasi (transaction bisa retry)

    if (cur === null) {
      // Auto-create (race-condition guard, mirror client PEDOMAN §15.4e)
      cur = {
        nama: storedPin.nama || "—",
        nim,
        role: "student",
        timestamp: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitCount: 1,
        points: 0,
        scoredQuestions: "",
      };
    }

    // Strip legacy PIN fields (PEDOMAN §8.6 — PIN sekarang di pins/ global)
    delete cur.pinHash;
    delete cur.pinSetAt;

    const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
    if (scored.includes(markerKey)) {
      // Sudah ada — idempotent (defense-in-depth; rate-limit Firestore harusnya sudah catch)
      return cur;
    }
    scored.push(markerKey);
    cur.scoredQuestions = scored.join(",");

    if (scoreDelta > 0) {
      cur.points = Math.min((cur.points || 0) + scoreDelta, cfg.totalPoints);
      cur.pointTimestamp = new Date().toISOString();
    }

    // Selections (TF/MC) atau codes (Comp)
    if (ans.type === "tf" || ans.type === "mc") {
      cur.selections = Object.assign({}, cur.selections || {});
      cur.selections[qId] = normalizeSelection(ans.type, userAnswer);
    } else if (ans.type === "comp" && typeof codeText === "string" && codeText.length > 0) {
      cur.codes = Object.assign({}, cur.codes || {});
      cur.codes[qId] = codeText.slice(0, 5000);
    }

    // Consolation: ≥threshold distinct base-IDs attempted AND points masih 0
    if (!cur.consolationAwarded && (cur.points || 0) === 0) {
      const baseIds = new Set(scored.map(stripMarkerSuffix));
      if (baseIds.size >= cfg.consolationThreshold) {
        cur.points = cfg.consolationPoint;
        cur.pointTimestamp = new Date().toISOString();
        cur.consolationAwarded = true;
        consolationAwarded = true;
      }
    }

    return cur;
  });

  return {
    alreadyAnswered: false,
    correct: evalResult.correct,
    status: outcome.status,           // "correct" | "partial" | "wrong"
    scoreDelta,                       // poin yang sudah ditambahkan ke RTDB (sudah × multiplier)
    marker: markerKey,                // marker yang ditulis ke scoredQuestions
    explain: ans.explain || "",
    lateMultiplier: sched.multiplier, // 1.0 atau 0.8 (transparency utk UI)
    pastDeadline: sched.pastDeadline,
    consolationAwarded,
  };
});
