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
 *     → late multiplier (default 0.7) hanya berlaku di window (end, end+extension].
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
  // ROOT CAUSE bug "+0 poin tercatat" / RTDB↔Firestore inconsistency:
  // Function flow = schedule check (RTDB) + Firestore attempt check + answer key
  // lookup + Firestore attempt write + RTDB transaction (dgn retries). Cold start
  // tambah 2-5s. Total bisa lewat 10s → function di-kill mid-transaction →
  // Firestore done, RTDB belum → inconsistency permanen. 30s memberi headroom
  // cukup utk cold start + slow network + transaction retries.
  timeoutSeconds: 30,
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
    lateMultiplierValue: 0.7,    // di window (end, end+extension]
  },
  "getaran-mekanik-uas": {
    dbPath: "visitors/getaran_mekanik/uas",
    schedulePath: "settings/getaran_mekanik/uas/schedule",
    totalPoints: 70,             // schema identik UTS (10 TF + 20 MC + 10 Comp + 5 Hard)
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  },
  "optoauto-uts": {
    dbPath: "visitors/optoauto/uts",
    schedulePath: "settings/optoauto/uts/schedule",
    totalPoints: 70,             // schema identik (10 TF + 20 MC + 10 Comp + 5 Hard)
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  },
  "optoauto-uas": {
    dbPath: "visitors/optoauto/uas",
    schedulePath: "settings/optoauto/uas/schedule",
    totalPoints: 70,
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  },
  "math4-uts": {
    dbPath: "visitors/math4/uts",
    schedulePath: "settings/math4/uts/schedule",
    totalPoints: 70,
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  },
  "math4-uas": {
    dbPath: "visitors/math4/uas",
    schedulePath: "settings/math4/uas/schedule",
    totalPoints: 70,
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MODUL_CONFIG — generated per-modul config (42 modul = 3 course × 14 modul).
// Schema modul beda dgn exam:
// - totalPoints: 50 (universal: 10 MC + 10 Comp_EZ + 5 Comp_HARD)
// - MC answer format: letter 'A'/'B'/'C'/'D' (bukan index seperti exam)
// - Reveal explain pada submit (formative learning, bukan summative)
// - DB path pakai underscore course slug (math4, getaran_mekanik, optoauto)
// - RTDB stored at visitors/<courseSlug>/pertemuan-N
// ─────────────────────────────────────────────────────────────────────────────
function _makeModulConfig(courseSlug, modulNum) {
  return {
    dbPath: `visitors/${courseSlug}/pertemuan-${modulNum}`,
    schedulePath: `settings/${courseSlug}/pertemuan-${modulNum}/schedule`,
    totalPoints: 50,             // universal: 10 MC × 1 + 10 Comp E × 2 + 5 Comp H × 4
    consolationThreshold: 20,    // ≥20 distinct base-ID attempted
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  };
}
const MODUL_CONFIG = {};
const _MODUL_COURSES = [
  { slug: "math4",           id: "math4" },
  { slug: "getaran_mekanik", id: "getaran-mekanik" },
  { slug: "optoauto",        id: "optoauto" },
];
for (const { slug, id } of _MODUL_COURSES) {
  for (let n = 1; n <= 14; n++) {
    MODUL_CONFIG[`${id}-modul-${n}`] = _makeModulConfig(slug, n);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Sync dengan client `sanitizeKey()` (UTS.html line 5808).
function sanitizeKey(s) {
  return String(s).replace(/[.#$[\]/]/g, "_");
}

// Sync dengan client `getN()` (UTS.html line 1657-1672): 2 digit terakhir NIM,
// dengan fallback ke 2 digit sebelumnya kalau last-2 = "00" (May 2026 rule).
// Dipakai utk lookup variant parametric (byN map).
// CRITICAL: HARUS sync persis dgn client getN(). Kalau client pakai N=20 utk
// NIM "4132012000" (fallback dari "00"), server juga harus pakai N=20 — kalau
// tidak, expected mismatch → mahasiswa selalu salah meskipun jawaban benar.
function deriveN(nim) {
  const digits = String(nim).replace(/\D/g, "");
  if (digits.length < 2) return 0;
  let n = parseInt(digits.slice(-2), 10);
  if (n === 0 && digits.length >= 4) {
    n = parseInt(digits.slice(-4, -2), 10) || 0;
  }
  return n || 0;
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
    // expected is an alias for answer (legacy: UTS pakai answer:, UAS pakai expected:)
    expected: variant.expected !== undefined ? variant.expected : ans.expected,
    tolerance: variant.tolerance !== undefined ? variant.tolerance : ans.tolerance,
    explain: variant.explain !== undefined ? variant.explain : ans.explain,
    // Multi-step: per-variant array of {label, value, tolerance}. Kalau ada,
    // grader pakai sequence-matching alih-alih single-number check.
    expectedSteps: variant.expectedSteps !== undefined ? variant.expectedSteps : ans.expectedSteps,
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
async function evalSchedule(rtdb, schedulePath, lateMultiplierValue, mode = "exam") {
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
  // Mode differentiation (Pedoman §… v8):
  // - 'exam': window (end, end+extension] → terlambat dgn penalty. Setelah itu → diblokir.
  // - 'modul': TIDAK ADA upper bound. Mahasiswa terlambat tetap submit dgn penalty 70%
  //           indefinitely. Blocked hanya sebelum start atau schedule belum diatur.
  let isOpen, pastDeadline;
  if (mode === "modul") {
    isOpen = now >= start;
    pastDeadline = now > end;
  } else {
    isOpen = now >= start && now <= end + ext;
    pastDeadline = now > end && now <= end + ext;
  }
  let multiplier = 0;
  if (isOpen) multiplier = pastDeadline ? lateMultiplierValue : 1.0;
  let reason = "open";
  if (!isOpen) reason = now < start ? "before-start" : "after-deadline";
  return { isOpen, pastDeadline, multiplier, reason };
}

// Match user numbers ke expectedSteps secara berurutan, allow skip step yg tidak ketemu.
// Returns { matches: bool[], allMatch: bool, someMatch: bool }.
// Algoritma: untuk tiap expected step, cari first user number (≥ userIdx) yg match.
// Kalau ketemu → mark + advance userIdx. Kalau tidak → step ditandai false tapi userIdx
// TIDAK advance (next step boleh cari dari awal user list yg tersisa). Urutan tetap
// dijaga: step k+1 hanya boleh match user number setelah step k yg sudah match.
function matchExpectedSteps(userNums, steps) {
  const matches = new Array(steps.length).fill(false);
  let userIdx = 0;
  for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
    const s = steps[stepIdx];
    const target = Number(s.value);
    const tol = Number(s.tolerance ?? 0.01);
    if (!Number.isFinite(target)) continue;
    for (let i = userIdx; i < userNums.length; i++) {
      const n = userNums[i];
      if (Number.isFinite(n) && Math.abs(n - target) <= tol) {
        matches[stepIdx] = true;
        userIdx = i + 1;
        break;
      }
    }
  }
  return {
    matches,
    allMatch: matches.every(Boolean),
    someMatch: matches.some(Boolean),
  };
}

// Bandingkan jawaban berdasarkan tipe.
// Returns { correct: bool, allowPartial: bool, stepResults?: bool[] }.
function evaluateAnswer(ans, userAnswer, userAnswers) {
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
    // ── Multi-step path: expectedSteps array → harus print semua nilai berurutan ──
    // Strict mode: final answer benar SAJA tidak cukup. Semua step harus match.
    if (Array.isArray(ans.expectedSteps) && ans.expectedSteps.length > 0) {
      const userNums = Array.isArray(userAnswers)
        ? userAnswers.map(Number).filter(Number.isFinite)
        : (Number.isFinite(Number(userAnswer)) ? [Number(userAnswer)] : []);
      const m = matchExpectedSteps(userNums, ans.expectedSteps);
      return {
        correct: m.allMatch,
        allowPartial: ans.allowPartial === true,
        stepResults: m.matches,
      };
    }
    // ── Single-answer path (legacy, untuk soal 1-step) ──
    // null = client tidak punya jawaban yang bisa di-parse (mis. Pyodide error).
    // Tetap dianggap sbg attempt yg salah, tapi partial-credit logic tetap berlaku
    // utk Comp Hard non-late.
    if (userAnswer === undefined || userAnswer === null) {
      return { correct: false, allowPartial: ans.allowPartial === true };
    }
    const got = Number(userAnswer);
    // Field name flexibility: UTS Getaran pakai `answer:`, UAS Getaran pakai `expected:`
    // (legacy inconsistency dari source HTML). Server support keduanya.
    const target = Number(ans.answer ?? ans.expected);
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
  const { examId, qId, userAnswer, userAnswers, nim, pinHash, codeText } = d;

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
    const prevMarker = prev.marker || qId;

    // ── SELF-HEAL: RTDB↔Firestore consistency check ──────────────────────────
    // Skenario bug: attempt pertama berhasil tulis ke Firestore (line 383) tapi
    // transaksi RTDB (line 388+) gagal/timeout/race-condition. Akibat: Firestore
    // punya attempt record, tapi RTDB visitor.scoredQuestions kosong & points=0.
    // Student lapor "+0 poin" karena poin tidak pernah tercatat di RTDB.
    //
    // Fix: di sini, kalau prev correct + scoreDelta > 0 tapi RTDB tidak punya
    // marker ini di scoredQuestions, re-apply transaksi pakai prev.scoreDelta.
    // Idempotent — kalau RTDB sudah konsisten, transaksi return early no-op.
    let healed = false;
    if (prev.correct === true && Number(prev.scoreDelta) > 0) {
      const vRef = rtdb.ref(`${cfg.dbPath}/mhs_${nimKey}`);
      const vSnap = await vRef.get();
      const visitor = vSnap.val() || {};
      const currentScored = (visitor.scoredQuestions || "").split(",").filter(Boolean);
      if (!currentScored.includes(prevMarker)) {
        await vRef.transaction((cur) => {
          if (cur === null) {
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
          const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
          if (scored.includes(prevMarker)) return cur;   // race-safe: someone else healed
          scored.push(prevMarker);
          cur.scoredQuestions = scored.join(",");
          cur.points = Math.min((cur.points || 0) + Number(prev.scoreDelta), cfg.totalPoints);
          cur.pointTimestamp = new Date().toISOString();
          return cur;
        });
        healed = true;
        console.log("[SELF-HEAL]", nimKey, qId, "re-applied scoreDelta", prev.scoreDelta);
      }
    }

    return {
      alreadyAnswered: true,
      correct: prev.correct === true,
      status: prev.status || (prev.correct ? "correct" : "wrong"),
      explain: prev.explain || "",
      // Kalau baru saja heal, return scoreDelta dari attempt record supaya
      // client bisa update local state. Kalau tidak heal (RTDB sudah konsisten),
      // return 0 (poin tidak ditambahkan lagi — anti double-score).
      scoreDelta: healed ? Number(prev.scoreDelta) : 0,
      marker: prevMarker,
      lateMultiplier: prev.lateMultiplier ?? null,
      healed,
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
  const evalResult = evaluateAnswer(ans, userAnswer, userAnswers);
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
  if (Array.isArray(evalResult.stepResults)) {
    attemptDoc.stepResults = evalResult.stepResults;
    if (Array.isArray(userAnswers)) {
      // Simpan userAnswers (capped) utk audit trail multi-step
      attemptDoc.userAnswers = userAnswers.slice(0, 64).map(Number);
    }
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
    lateMultiplier: sched.multiplier, // 1.0 atau 0.7 (transparency utk UI)
    pastDeadline: sched.pastDeadline,
    consolationAwarded,
    // Multi-step diagnostic: array bool per langkah (mis. [true,false,true]).
    // Hanya ada utk soal comp dgn expectedSteps. UI pakai utk feedback "ζ ✓, ω_d ✗".
    stepResults: evalResult.stepResults || null,
    stepLabels: (ans.type === "comp" && Array.isArray(ans.expectedSteps))
      ? ans.expectedSteps.map((s) => s.label || "")
      : null,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// resetExamAttempts — callable function (admin-only).
//
// Hapus SELURUH collection examAttempts/{examId}/students/*/qs/* di Firestore.
// Dipanggil dari client `confirmReset()` saat dosen klik tombol "Reset Mahasiswa"
// di Tab Hasil. Selama ini reset hanya hapus RTDB visitors → mahasiswa tetap
// terkunci 'alreadyAnswered' untuk soal yang pernah dicoba. Reset ini melengkapi
// supaya benar-benar fresh.
//
// Auth: admin password hash (SHA-256) — sama dgn ADMIN_PW_HASH di client.
// TODO: pindah ke env var (firebase functions config) supaya hash tidak hardcoded.
//
// Request: { examId: 'getaran-mekanik-uts', adminPwHash: '<sha256-hex>' }
// Response: { deleted: <int>, students: <int> }
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_PW_HASH = "57ae60d11a0de7b13b9c77c4664dc951afe403952b46c3b4f95a8bc0eb8a0470";

exports.resetExamAttempts = onCall({ timeoutSeconds: 60 }, async (request) => {
  const { examId, adminPwHash } = request.data || {};

  if (!examId || typeof examId !== "string") {
    throw new HttpsError("invalid-argument", "examId wajib diisi");
  }
  if (!EXAM_CONFIG[examId]) {
    throw new HttpsError("invalid-argument", `examId '${examId}' tidak dikonfigurasi`);
  }
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah atau tidak disertakan");
  }

  const fs = getFirestore();
  try {
    const studentsRef = fs.collection(`examAttempts/${examId}/students`);
    const studentDocs = await studentsRef.listDocuments();

    if (studentDocs.length === 0) {
      return { deleted: 0, students: 0 };
    }

    let totalDeleted = 0;
    for (const studentDoc of studentDocs) {
      const qsDocs = await studentDoc.collection("qs").listDocuments();
      // Batch delete (max 500 per batch — pakai 400 untuk safety)
      for (let i = 0; i < qsDocs.length; i += 400) {
        const batch = fs.batch();
        qsDocs.slice(i, i + 400).forEach((d) => batch.delete(d));
        await batch.commit();
        totalDeleted += Math.min(400, qsDocs.length - i);
      }
      // Delete the student doc itself (empty container after qs cleared)
      await studentDoc.delete();
    }

    console.log("[resetExamAttempts]", examId, "deleted", totalDeleted, "attempts across", studentDocs.length, "students");
    return { deleted: totalDeleted, students: studentDocs.length };
  } catch (e) {
    // Surface penyebab asli ke dosen — tanpa ini Firebase membungkus exception
    // non-HttpsError jadi "internal" yang opaque & tidak bisa didiagnosa.
    console.error("[resetExamAttempts] FAILED", examId, e);
    throw new HttpsError("internal", `Reset exam gagal: ${e.message || e}`);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// MODUL VALIDATION — Phase 3 untuk Modul Pertemuan (formative, with reveal)
// ═════════════════════════════════════════════════════════════════════════════

// Modul scoring (universal 50-poin per Pedoman §15.1):
//   MC: 1 poin, answer format: letter 'A'/'B'/'C'/'D'
//   Comp Easy: 2 poin, expected numeric ± tolerance
//   Comp Hard: 4 poin (correct), 1 poin (partial — code submitted but wrong)
function _computeModulOutcome(ans, evalResult, pastDeadline) {
  const basePoints = Number(ans.points ?? 1);
  if (ans.type === "mc") {
    return evalResult.correct
      ? { markerSuffix: "",       points: basePoints, status: "correct" }
      : { markerSuffix: "_mc_used", points: 0,        status: "wrong" };
  }
  if (ans.type === "comp") {
    if (evalResult.correct) {
      return { markerSuffix: "_comp", points: basePoints, status: "correct" };
    }
    const allowPartial = ans.allowPartial === true;
    const partial = Number(ans.partialPoints ?? 1);
    if (allowPartial && !pastDeadline) {
      return { markerSuffix: "_comp_partial", points: partial, status: "partial" };
    }
    return { markerSuffix: "_comp_used", points: 0, status: "wrong" };
  }
  return { markerSuffix: "", points: 0, status: "wrong" };
}

function _evaluateModulAnswer(ans, userAnswer) {
  if (ans.type === "mc") {
    // Modul MC: answer adalah letter 'A'/'B'/'C'/'D'. User send letter juga.
    if (typeof userAnswer !== "string" || !/^[A-D]$/.test(userAnswer)) {
      return { correct: false };
    }
    return { correct: userAnswer.toUpperCase() === String(ans.answer).toUpperCase() };
  }
  if (ans.type === "comp") {
    if (userAnswer === undefined || userAnswer === null) {
      return { correct: false };
    }
    const got = Number(userAnswer);
    const target = Number(ans.answer ?? ans.expected);
    const tol = Number(ans.tolerance ?? 0.01);
    const correct = Number.isFinite(got) && Number.isFinite(target) && Math.abs(got - target) <= tol;
    return { correct };
  }
  return { correct: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// checkModulAnswer — callable function (HTTPS).
//
// Request: { modulId, qId, userAnswer, codeText?, nim, nama, pinHash }
// Response: { correct, status, scoreDelta, marker, explain, correctAnswer,
//             alreadyAnswered, healed, lateMultiplier, consolationAwarded }
//
// Berbeda dgn checkExamAnswer:
// - Reveal explain + correctAnswer ALWAYS (formative, untuk pembelajaran)
// - MC validasi pakai letter A/B/C/D (bukan index)
// - Tidak ada multi-step expectedSteps
// - Schedule per-modul (visitors/<course>/pertemuan-N)
// ─────────────────────────────────────────────────────────────────────────────
exports.checkModulAnswer = onCall(async (request) => {
  const { modulId, qId, userAnswer, codeText, nim, nama, pinHash } = request.data || {};

  if (!modulId || typeof modulId !== "string") {
    throw new HttpsError("invalid-argument", "modulId wajib diisi");
  }
  const cfg = MODUL_CONFIG[modulId];
  if (!cfg) {
    throw new HttpsError("invalid-argument", `modulId '${modulId}' tidak dikonfigurasi`);
  }
  if (!qId || typeof qId !== "string") {
    throw new HttpsError("invalid-argument", "qId wajib diisi");
  }
  if (!nim || !nama || !pinHash) {
    throw new HttpsError("invalid-argument", "nim/nama/pinHash wajib diisi");
  }

  const fs = getFirestore();
  const rtdb = getDatabase();
  const nimKey = sanitizeKey("mhs_" + nim);

  // ── 1) Verify PIN (cross-check dgn pins/ global) ──
  const pinSnap = await rtdb.ref(`pins/${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum di-setup utk NIM ini");
  }
  const storedPin = pinSnap.val();
  if (storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "PIN salah — silakan login ulang");
  }

  // ── 2) Schedule check (Pedoman §… v8: modul TIDAK ADA upper bound) ──
  // Modul rule: mahasiswa terlambat tetap bisa submit indefinitely dgn penalty 70%
  // (sched.multiplier = lateMultiplierValue saat now > end). Block hanya kalau:
  // - before-start: akses sebelum jadwal dimulai
  // - schedule-missing/incomplete: dosen belum atur jadwal
  // Berbeda dari exam yang punya cutoff di end + extension.
  const sched = await evalSchedule(rtdb, cfg.schedulePath, cfg.lateMultiplierValue, "modul");
  if (!sched.isOpen) {
    const msg = sched.reason === "before-start"
      ? "Akses modul belum dibuka"
      : "Jadwal modul belum dikonfigurasi";
    throw new HttpsError("failed-precondition", msg);
  }

  // ── 3) Idempotency check di Firestore modulAttempts ──
  const attemptRef = fs.doc(`modulAttempts/${modulId}/students/${nimKey}/qs/${qId}`);
  const attemptSnap = await attemptRef.get();
  if (attemptSnap.exists) {
    const prev = attemptSnap.data();
    const prevMarker = prev.marker || qId;

    // SELF-HEAL: replay RTDB transaction kalau inconsistent (mirror exam)
    let healed = false;
    if (prev.correct === true && Number(prev.scoreDelta) > 0) {
      const vRef = rtdb.ref(`${cfg.dbPath}/${nimKey}`);
      const vSnap = await vRef.get();
      const visitor = vSnap.val() || {};
      const currentScored = (visitor.scoredQuestions || "").split(",").filter(Boolean);
      if (!currentScored.includes(prevMarker)) {
        await vRef.transaction((cur) => {
          if (cur === null) {
            cur = {
              nama: storedPin.nama || "—", nim, role: "student",
              timestamp: new Date().toISOString(),
              lastVisit: new Date().toISOString(),
              visitCount: 1, points: 0, scoredQuestions: "",
            };
          }
          const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
          if (scored.includes(prevMarker)) return cur;
          scored.push(prevMarker);
          cur.scoredQuestions = scored.join(",");
          cur.points = Math.min((cur.points || 0) + Number(prev.scoreDelta), cfg.totalPoints);
          cur.pointTimestamp = new Date().toISOString();
          return cur;
        });
        healed = true;
        console.log("[MODUL SELF-HEAL]", nimKey, modulId, qId, "re-applied", prev.scoreDelta);
      }
    }

    return {
      alreadyAnswered: true,
      correct: prev.correct === true,
      status: prev.status || (prev.correct ? "correct" : "wrong"),
      scoreDelta: healed ? Number(prev.scoreDelta) : 0,
      marker: prevMarker,
      explain: prev.explain || "",
      correctAnswer: prev.correctAnswer || "",
      lateMultiplier: prev.lateMultiplier ?? null,
      healed,
    };
  }

  // ── 4) Lookup answer key di Firestore modulAnswers ──
  const ansRef = fs.doc(`modulAnswers/${modulId}/qs/${qId}`);
  const ansSnap = await ansRef.get();
  if (!ansSnap.exists) {
    throw new HttpsError("not-found", `Answer key for ${qId} not configured`);
  }
  const ans = ansSnap.data();

  // ── 5) Evaluate ──
  const evalResult = _evaluateModulAnswer(ans, userAnswer);
  const outcome = _computeModulOutcome(ans, evalResult, sched.pastDeadline);
  const scoreDelta = outcome.points * sched.multiplier;
  const markerKey = qId + outcome.markerSuffix;
  const correctAnswer = ans.type === "mc"
    ? String(ans.answer || "").toUpperCase()
    : String(ans.answer ?? ans.expected ?? "");

  // ── 6) Write attempt ──
  const attemptDoc = {
    modulId, qId,
    type: ans.type,
    userAnswer,
    correct: evalResult.correct,
    status: outcome.status,
    marker: markerKey,
    scoreDelta,
    lateMultiplier: sched.multiplier,
    pastDeadline: sched.pastDeadline,
    explain: ans.explain || "",
    correctAnswer,
    timestamp: FieldValue.serverTimestamp(),
  };
  if (ans.type === "comp" && typeof codeText === "string" && codeText.length > 0) {
    attemptDoc.codePreview = codeText.slice(0, 5000);
  }
  await attemptRef.set(attemptDoc);

  // ── 7) RTDB transaction (atomic points + scoredQuestions) ──
  let consolationAwarded = false;
  const vRef = rtdb.ref(`${cfg.dbPath}/${nimKey}`);
  await vRef.transaction((cur) => {
    consolationAwarded = false;
    if (cur === null) {
      cur = {
        nama: storedPin.nama || "—", nim, role: "student",
        timestamp: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitCount: 1, points: 0, scoredQuestions: "",
      };
    }
    delete cur.pinHash;
    delete cur.pinSetAt;
    const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
    if (scored.includes(markerKey)) return cur;
    scored.push(markerKey);
    cur.scoredQuestions = scored.join(",");
    if (scoreDelta > 0) {
      cur.points = Math.min((cur.points || 0) + scoreDelta, cfg.totalPoints);
      cur.pointTimestamp = new Date().toISOString();
    }
    if (ans.type === "mc") {
      cur.selections = Object.assign({}, cur.selections || {});
      cur.selections[qId] = String(userAnswer || "").toUpperCase();
    } else if (ans.type === "comp" && typeof codeText === "string" && codeText.length > 0) {
      cur.codes = Object.assign({}, cur.codes || {});
      cur.codes[qId] = codeText.slice(0, 5000);
    }
    // Consolation
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
    status: outcome.status,
    scoreDelta,
    marker: markerKey,
    explain: ans.explain || "",      // ALWAYS return for modul (formative reveal)
    correctAnswer,                    // ALWAYS return for modul (formative reveal)
    lateMultiplier: sched.multiplier,
    pastDeadline: sched.pastDeadline,
    consolationAwarded,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// resetModulAttempts — admin callable, hapus modulAttempts utk satu modul.
// Request: { modulId, adminPwHash }
// Response: { deleted, students }
// ─────────────────────────────────────────────────────────────────────────────
exports.resetModulAttempts = onCall({ timeoutSeconds: 60 }, async (request) => {
  const { modulId, adminPwHash } = request.data || {};
  if (!modulId || !MODUL_CONFIG[modulId]) {
    throw new HttpsError("invalid-argument", `modulId '${modulId}' tidak dikonfigurasi`);
  }
  if (!adminPwHash || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }

  const fs = getFirestore();
  try {
    const studentsRef = fs.collection(`modulAttempts/${modulId}/students`);
    const studentDocs = await studentsRef.listDocuments();
    if (studentDocs.length === 0) return { deleted: 0, students: 0 };

    let totalDeleted = 0;
    for (const studentDoc of studentDocs) {
      const qsDocs = await studentDoc.collection("qs").listDocuments();
      for (let i = 0; i < qsDocs.length; i += 400) {
        const batch = fs.batch();
        qsDocs.slice(i, i + 400).forEach((d) => batch.delete(d));
        await batch.commit();
        totalDeleted += Math.min(400, qsDocs.length - i);
      }
      await studentDoc.delete();
    }
    console.log("[resetModulAttempts]", modulId, "deleted", totalDeleted, "attempts");
    return { deleted: totalDeleted, students: studentDocs.length };
  } catch (e) {
    // Surface penyebab asli ke dosen — tanpa ini Firebase membungkus exception
    // non-HttpsError jadi "internal" yang opaque & tidak bisa didiagnosa.
    console.error("[resetModulAttempts] FAILED", modulId, e);
    throw new HttpsError("internal", `Reset modul gagal: ${e.message || e}`);
  }
});
