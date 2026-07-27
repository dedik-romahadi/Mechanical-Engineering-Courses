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
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");

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
    bobot:   {"1.1":5,"1.2":4,"1.3":2,"2.1":3,"2.2":3,"3.1":5,"3.2":3},
    mapping: {"1.1":[34,35,36,37,38,39,40],"1.2":[1,2,3,4,5,6,7,8],"1.3":[9,10,11,12,31],"2.1":[13,14,15,16,17,18,32],"2.2":[19,20,21,22,23,24,33],"3.1":[41,42,43,44,45],"3.2":[25,26,27,28,29,30]},
  },
  "getaran-mekanik-uas": {
    bobot:   {"3.3":2,"4.1":3,"4.2":3,"5.1":4,"6.1":4,"6.2":4,"6.3":4},
    mapping: {"3.3":[1,2,11,12,13,31,32],"4.1":[3,4,14,15,16,33,41],"4.2":[5,17,18,19,34,35],"5.1":[6,7,20,21,22,36,37,42],"6.1":[8,23,24,25,38,39,43],"6.2":[9,26,27,28,40,44],"6.3":[10,29,30,45]},
  },
  "optoauto-uts": {
    bobot:   {"1.1":5,"1.2":5,"1.3":4,"2.2":3,"2.3":3},
    mapping: {"1.1":[34,35,36,37,38,39,40],"1.2":[41,42,43,44,45],"1.3":[1,2,3,4,5,6,7,8,9,10,11,12,31],"2.2":[13,14,15,16,17,18,19,20,21,32],"2.3":[22,23,24,25,26,27,28,29,30,33]},
  },
  "optoauto-uas": {
    bobot:   {"3.1":4,"3.2":3,"3.3":3,"4.1":3,"4.2":3,"4.3":4},
    mapping: {"3.1":[8,26,27,28,39],"3.2":[1,2,11,12,13,31,32,41],"3.3":[3,4,14,15,16,33,42],"4.1":[5,17,18,19,34,35,43],"4.2":[6,20,21,22,36,37],"4.3":[7,23,24,25,38]},
  },
  "math4-uts": {
    bobot:   {"1.1":5,"1.2":6,"2.1":5,"2.2":10,"2.3":5},
    mapping: {"1.1":[1,2,3,4,5,6,7,8,9,10,31],"1.2":[34,35,36,37,38,39,40],"2.1":[11,12,13,14,15,16,17,18,19,20,32],"2.2":[41,42,43,44,45],"2.3":[21,22,23,24,25,26,27,28,29,30,33]},
  },
  "math4-uas": {
    bobot:   {"3.1":20,"4.1":2,"4.2":3,"5.1":5},
    mapping: {"3.1":[1,2,3,4,5,11,12,13,14,15,16,17,18,31,32,33,34,41],"4.1":[6,19,20,21,35,42],"4.2":[7,8,9,22,23,24,25,26,36,37,38,43,44],"5.1":[10,27,28,29,30,39,40,45]},
  },
};

// ── EXAM_CONFIG path & scoring fields (RESTORASI — regression fix) ──────────
// checkExamAnswer & recomputeExamPoints membaca cfg.dbPath / cfg.schedulePath /
// cfg.totalPoints / cfg.consolationThreshold / cfg.consolationPoint /
// cfg.lateMultiplierValue — TAPI object EXAM_CONFIG di atas hanya berisi
// bobot/mapping (yang justru tidak pernah dibaca siapa pun; _examQPoints pakai
// OBE_EXAM_CONFIG). Field path/scoring hilang di suatu refactor — akibatnya
// evalSchedule menerima path undefined (→ rtdb.ref(undefined) = ROOT →
// "schedule-incomplete" → SEMUA submit exam ditolak), dan visitor write
// mengarah ke path "undefined/mhs_<nim>". Loop ini mengembalikan field-field
// tsb. Nilai diambil dari client Exam HTML (SSOT): DB_PATH =
// visitors/<slug>/uts|uas, SCHEDULE_PATH = settings/<slug>/uts|uas/schedule,
// total 100 poin (Σ _examQPoints = 100), konsolasi ≥30 attempt → 1 poin,
// late multiplier 0.7 (PR #284).
const _EXAM_COURSE_SLUG = {
  "getaran-mekanik": "getaran_mekanik",
  "optoauto": "optoauto",
  "math4": "math4",
};
for (const _examId of Object.keys(EXAM_CONFIG)) {
  const _m = _examId.match(/^(.+)-(uts|uas)$/);
  const _slug = _m && _EXAM_COURSE_SLUG[_m[1]];
  if (!_slug) throw new Error(`EXAM_CONFIG id '${_examId}' tidak match pola <course>-uts|uas`);
  Object.assign(EXAM_CONFIG[_examId], {
    dbPath: `visitors/${_slug}/${_m[2]}`,
    schedulePath: `settings/${_slug}/${_m[2]}/schedule`,
    totalPoints: 100,
    consolationThreshold: 30,
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// OBE_EXAM_CONFIG — mapping (Sub-CPMK → daftar Q 1-45) & bobot Sub-CPMK per
// exam. SUMBER UTAMA poin per soal:
//   _examQPoints(examId, qIdx0) = (bobot/Σbobot) × 100 / jumlah_soal_di_sub
// Per soal jadi float proporsional. Σ poin per exam = 100.
// Juga dipakai computeObeScores untuk hitung Sub-CPMK breakdown (Rekap OBE).
// Mapping & bobot HARUS sinkron dgn DEFAULT_MAPPING+FORMS di OBE HTML
// masing-masing course. Lihat Pedoman §38.
// ─────────────────────────────────────────────────────────────────────────────
const OBE_EXAM_CONFIG = {
  "optoauto-uts": {
    bobot:   {"1.1":5,"1.2":5,"1.3":4,"2.2":3,"2.3":3},
    mapping: {"1.1":Array.from({length:10},(_,i)=>i+31),"1.2":[41,42,43,44,45],"1.3":Array.from({length:11},(_,i)=>i+1),"2.2":[12,13,14,15,16,17,18,19,20],"2.3":Array.from({length:10},(_,i)=>i+21)},
  },
  "optoauto-uas": {
    bobot:   {"3.1":4,"3.2":3,"3.3":3,"4.1":3,"4.2":3,"4.3":4},
    // Mapping per Q# derived dari tag `modul:` riil tiap soal di UAS.html
    // (bukan rentang datar) — lihat Pedoman §40.27/§40.28. Sub-CPMK 3.1
    // (Pertemuan 7, FFT/PSD/bearing-fault) diisi 5 soal BARU (tf8,mc16-18,c9)
    // krn bank lama tidak py soal bertopik itu sama sekali. Q9,10,29,30,40,44,45
    // (LogReg/RF-SVM, modul13/14) SENGAJA tidak dipetakan ke Sub-CPMK manapun —
    // per RPS resmi itu Sub-CPMK 5.1/5.2 berstatus "Bentuk: Tugas", bukan UAS;
    // soal tetap tampil & bisa dijawab (feedback benar/salah), tapi poinnya
    // di-set 0 di EXAM_QID_POINTS supaya Σ exam tetap persis 100.
    mapping: {"3.1":[8,26,27,28,39],"3.2":[1,2,11,12,13,31,32,41],"3.3":[3,4,14,15,16,33,42],"4.1":[5,17,18,19,34,35,43],"4.2":[6,20,21,22,36,37],"4.3":[7,23,24,25,38]},
  },
  "getaran-mekanik-uts": {
    bobot:   {"1.1":5,"1.2":4,"1.3":2,"2.1":3,"2.2":3,"3.1":5,"3.2":3},
    mapping: {"1.1":Array.from({length:10},(_,i)=>i+31),"1.2":[1,2,3,4,5,6,7],"1.3":[8,9,10,11,12],"2.1":[13,14,15,16,17,18],"2.2":[19,20,21,22,23,24],"3.1":[41,42,43,44,45],"3.2":[25,26,27,28,29,30]},
  },
  "getaran-mekanik-uas": {
    bobot:   {"3.3":2,"4.1":3,"4.2":3,"5.1":4,"6.1":4,"6.2":4,"6.3":4},
    // Mapping per Q# derived dari tag `modul:` riil tiap soal di UAS.html (bukan
    // rentang datar) — lihat Pedoman §40.27.
    mapping: {"3.3":[1,2,11,12,13,31,32],"4.1":[3,4,14,15,16,33,41],"4.2":[5,17,18,19,34,35],"5.1":[6,7,20,21,22,36,37,42],"6.1":[8,23,24,25,38,39,43],"6.2":[9,26,27,28,40,44],"6.3":[10,29,30,45]},
  },
  "math4-uts": {
    bobot:   {"1.1":5,"1.2":6,"2.1":5,"2.2":10,"2.3":5},
    mapping: {"1.1":Array.from({length:10},(_,i)=>i+1),"1.2":Array.from({length:10},(_,i)=>i+31),"2.1":Array.from({length:10},(_,i)=>i+11),"2.2":[41,42,43,44,45],"2.3":Array.from({length:10},(_,i)=>i+21)},
  },
  "math4-uas": {
    bobot:   {"3.1":20,"4.1":2,"4.2":3,"5.1":5},
    // Mapping per Q# derived dari tag `modul:` riil tiap soal di UAS.html (bukan
    // rentang datar) — lihat Pedoman §40.27.
    mapping: {"3.1":[1,2,3,4,5,11,12,13,14,15,16,17,18,31,32,33,34,41],"4.1":[6,19,20,21,35,42],"4.2":[7,8,9,22,23,24,25,26,36,37,38,43,44],"5.1":[10,27,28,29,30,39,40,45]},
  },
};

// Poin per soal berdasarkan bobot Sub-CPMK OBE + bobot tipe soal.
// qIdOrIdx: bisa qId string ("tf1","c1",...) atau index 0-based (0..44).
// Bobot tipe: TF=1, MC=1, Comp Easy=2, Comp Hard=4 (rasio 1:1:2:4).
// Σ per Sub-CPMK = (bobot_sub/Σbobot)×100 (tetap sesuai bobot OBE);
// dalam sub yang sama, Hard 4× TF/MC, Easy 2× TF/MC.
// Σ semua 45 soal = 100. Return null kalau examId/qIdx tidak ketemu.
const _OBE_TYPE_WEIGHTS = { tf: 1, mc: 1, ce: 2, c_easy: 2, c_hard: 4, ch: 4 };
function _qTypeWeightByIdx(qIdx0) {
  if (qIdx0 < 10) return 1;   // tf1-tf10
  if (qIdx0 < 30) return 1;   // mc1-mc20
  if (qIdx0 < 40) return 2;   // c1-c10 atau ce1-ce10 (Comp Easy)
  return 4;                   // c11-c15 atau ch1-ch5 (Comp Hard)
}
function _examQPoints(examId, qIdOrIdx) {
  const cfg = OBE_EXAM_CONFIG[examId];
  if (!cfg) return null;
  const order = OBE_ORDER[examId];
  if (!order) return null;
  let qIdx;
  if (typeof qIdOrIdx === "number") qIdx = qIdOrIdx;
  else qIdx = order.indexOf(qIdOrIdx);
  if (qIdx < 0) return null;
  const qNum = qIdx + 1;
  const sumBobot = Object.values(cfg.bobot).reduce((a,b) => a + Number(b || 0), 0);
  if (sumBobot <= 0) return null;
  for (const [sub, qNums] of Object.entries(cfg.mapping)) {
    if (qNums.includes(qNum)) {
      const bobot = Number(cfg.bobot[sub] || 0);
      if (bobot <= 0 || qNums.length <= 0) return null;
      const subTotal = (bobot / sumBobot) * 100;
      // Distribusi internal sub: bobot per tipe (1/1/2/4)
      let sumW = 0;
      for (const q of qNums) sumW += _qTypeWeightByIdx(q - 1);
      const myW = _qTypeWeightByIdx(qIdx);
      return subTotal * (myW / sumW);
    }
  }
  return null;
}

// Sum poin semua soal correct di satu attempt-set utk satu exam (sum scoreDelta).
// Dipakai recomputeExamPoints untuk recompute visitor.points dari attempts.
async function _sumExamPointsFromAttempts(examId, nimKey) {
  const cfg = OBE_EXAM_CONFIG[examId];
  const order = OBE_ORDER[examId];
  if (!cfg || !order) return null;
  const fs = getFirestore();
  const qsSnap = await fs.collection(`examAttempts/${examId}/students/${nimKey}/qs`).get();
  if (qsSnap.empty) return 0;
  let sum = 0;
  qsSnap.forEach(d => {
    const a = d.data() || {};
    const qId = d.id;
    const pts = _examQPoints(examId, qId);
    if (pts == null) return;
    const mult = Number(a.lateMultiplier ?? 1);
    if (a.status === "correct" || a.correct === true) sum += pts * mult;
    else if (a.status === "partial") sum += 1 * mult;  // konsolasi partial (comp hard)
  });
  return sum;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODUL_CONFIG — generated per-modul config (42 modul = 3 course × 14 modul).
// Schema modul beda dgn exam:
// - totalPoints: 50 (universal: 10 MC + 10 Comp_EZ + 5 Comp_HARD)
// - MC answer format: letter 'A'/'B'/'C'/'D' (bukan index seperti exam)
// - Reveal explain pada submit (formative learning, bukan summative)
// - DB path pakai underscore course slug (math4, getaran_mekanik, optoauto)
// - RTDB segment per-modul HARUS match client MODULE_ID & PERTEMUAN supaya
//   server menulis ke path yang sama dgn data mahasiswa & jadwal dosen.
//   Penomoran TIDAK 1:1 dgn nomor file modul; SEMUA mata kuliah skip 8 (UTS).
//     • math4: visitor di visitors/math4/modul-N (MODULE_ID client = file slot),
//       schedule di settings/math4/pertemuan-(N≤7?N:N+1) — Pertemuan 8 = UTS.
//     • Getaran/Opto: visitor & schedule keduanya pakai pertemuan-(N≤7?N:N+1).
//   Misal Modul-8.html (any course) = Pertemuan 9 (lesson pertama post-UTS).
// ─────────────────────────────────────────────────────────────────────────────
function _makeModulConfig(courseSlug, dbSegment, scheduleSegment) {
  return {
    dbPath: `visitors/${courseSlug}/${dbSegment}`,
    schedulePath: `settings/${courseSlug}/${scheduleSegment}/schedule`,
    totalPoints: 50,             // universal: 10 MC × 1 + 10 Comp E × 2 + 5 Comp H × 4
    consolationThreshold: 20,    // ≥20 distinct base-ID attempted
    consolationPoint: 1,
    lateMultiplierValue: 0.7,
  };
}

// Resolve RTDB segments per nomor file modul, sesuai client paths.
//   - math4: visitor pakai modul-N (file slot), schedule pakai pertemuan-(offset)
//   - Getaran/Opto: keduanya pakai pertemuan-(offset)
// Offset rule (semua mata kuliah): N≤7 → N; N≥8 → N+1 (Pertemuan 8 = UTS).
function _segmentsForModul(courseId, modulNum) {
  const pertemuan = modulNum <= 7 ? modulNum : modulNum + 1;
  const pertSeg = `pertemuan-${pertemuan}`;
  if (courseId === "math4") {
    return { db: `modul-${modulNum}`, sched: pertSeg };
  }
  return { db: pertSeg, sched: pertSeg };
}

const MODUL_CONFIG = {};
const _MODUL_COURSES = [
  { slug: "math4",           id: "math4" },
  { slug: "getaran_mekanik", id: "getaran-mekanik" },
  { slug: "optoauto",        id: "optoauto" },
];
for (const { slug, id } of _MODUL_COURSES) {
  for (let n = 1; n <= 14; n++) {
    const seg = _segmentsForModul(id, n);
    MODUL_CONFIG[`${id}-modul-${n}`] = _makeModulConfig(slug, seg.db, seg.sched);
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
function evaluateAnswer(ans, userAnswer, userAnswers, lineAnswers) {
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
    const target = Number(ans.answer ?? ans.expected);
    const tol = Number(ans.tolerance ?? 0.01);
    if (!Number.isFinite(target)) {
      return { correct: false, allowPartial: ans.allowPartial === true };
    }
    // ROBUST number matching (fix laporan mhs: c1/c5/c8 tidak dapat poin walau
    // output benar). Client kirim userAnswer = nums[0] (angka PERTAMA output),
    // padahal mahasiswa sering print nilai antara dulu (matrix, eigenvalue array)
    // sehingga jawaban final BUKAN angka pertama. Konvensi universal: jawaban di-
    // print TERAKHIR. Jadi cek angka TERAKHIR dan PERTAMA dari output.
    //   - Angka terakhir → menangkap "print(intermediate); print(jawaban)".
    //   - Angka pertama  → backward-compat "print(jawaban)" saja.
    // Sengaja TIDAK "match angka mana pun di seluruh output" supaya jawaban
    // integer kecil (0, 1, 5) tidak lolos hanya karena kebetulan muncul di
    // nilai antara (mis. index array). Tapi TETAP cek `lineAnswers` — angka
    // PERTAMA per baris print() (mirror client _lineAnswers()) — karena pola
    // umum mahasiswa print BEBERAPA baris berlabel ("Label: value unit") dan
    // baris jawaban yang diminta seringkali BUKAN baris pertama/terakhir (mis.
    // ada baris bonus konversi satuan setelahnya). Fix laporan: C4/C6/C7
    // Getaran Modul-14 — jawaban benar ada di baris tengah, bukan awal/akhir.
    // Field name flexibility: UTS pakai `answer:`, UAS pakai `expected:`
    // (legacy) — keduanya sudah ditangani di `target`.
    const finiteNums = Array.isArray(userAnswers)
      ? userAnswers.map(Number).filter(Number.isFinite)
      : [];
    const candidates = [];
    if (finiteNums.length > 0) {
      candidates.push(finiteNums[finiteNums.length - 1]); // angka TERAKHIR
      candidates.push(finiteNums[0]);                      // angka PERTAMA
    }
    const ua = Number(userAnswer);
    if (Number.isFinite(ua)) candidates.push(ua);          // fallback nums[0] client
    if (Array.isArray(lineAnswers)) {
      for (const v of lineAnswers) {
        const n = Number(v);
        if (Number.isFinite(n)) candidates.push(n);         // angka pertama per baris print()
      }
    }
    if (candidates.length === 0) {
      return { correct: false, allowPartial: ans.allowPartial === true };
    }
    const correct = candidates.some((v) => Math.abs(v - target) <= tol);
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
  const { examId, qId, userAnswer, userAnswers, lineAnswers, nim, pinHash, codeText } = d;

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
  const evalResult = evaluateAnswer(ans, userAnswer, userAnswers, lineAnswers);
  const outcome = computeOutcome(ans, evalResult, sched.pastDeadline);
  // Override poin per soal dgn bobot OBE — proporsional Sub-CPMK / jumlah soal.
  // Σ poin semua soal = 100 (lihat _examQPoints + OBE_EXAM_CONFIG).
  // Mempertahankan logika status (correct=poin penuh, partial=1 konsolasi, wrong=0).
  const obePts = _examQPoints(examId, qId);
  if (obePts != null) {
    if (outcome.status === "correct") outcome.points = obePts;
    else if (outcome.status === "partial") outcome.points = 1;
  }
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

// ─────────────────────────────────────────────────────────────────────────────
// getExamQuestions — callable function (HTTPS). Server-gated question delivery.
//
// Kunci jawaban SUDAH TIDAK PERNAH ada di client (lihat komentar baris 34) —
// tapi TEKS SOAL sendiri dulu ter-embed statis di UAS.html (window.UAS_TF dst.)
// sehingga bisa dibaca siapa pun via View Source/DevTools SEBELUM jadwal exam
// dibuka (mahasiswa tidak bisa submit lebih awal — sudah digate di
// checkExamAnswer — tapi soal tetap bisa DIBACA lebih awal). Fungsi ini menutup
// celah itu: soal HANYA dikirim setelah PIN+jadwal (mahasiswa) atau admin
// password (dosen, bypass jadwal — utk preview/monitoring) terverifikasi
// server-side. Lihat Pedoman §40.29.
//
// Bank soal (TIDAK berisi correctIdx/answer/expected — cuma text/options/hint)
// ada di functions/questions/uas-<slug>-questions.js, hasil ekstraksi VERBATIM
// dari UAS.html supaya dijamin identik dgn yang dulu ada di client.
//
// Request:  { examId, nim?, pinHash?, adminPwHash? }
//   - Mahasiswa: nim + pinHash wajib; jadwal harus isOpen (evalSchedule, sama
//     persis window yg dipakai checkExamAnswer utk submit).
//   - Dosen: adminPwHash wajib (bypass jadwal).
// Response: { examId, N, tf:[...], mc:[...], compEz:[...], compHard:[...] }
//   Soal parametric SUDAH di-evaluate server-side pakai N (dari NIM mahasiswa,
//   atau N=0 utk dosen) — client tidak pernah menerima source compute() mentah,
//   cuma hasil akhir text/options/hint yang sudah personalized.
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_BANKS = {
  "getaran-mekanik-uas": require("./questions/uas-getaran-questions"),
  "optoauto-uas": require("./questions/uas-optoauto-questions"),
  "math4-uas": require("./questions/uas-math4-questions"),
};

function _renderQuestionSet(bank, N) {
  const render = (arr) => arr.map((q) => {
    const data = q.parametric
      ? q.compute(N)
      : { text: q.text, options: q.options, hint: q.hint, diagram: q.diagram };
    return {
      id: q.id,
      modul: q.modul,
      parametric: !!q.parametric,
      text: data.text,
      options: data.options,
      hint: data.hint,
      diagram: data.diagram,
    };
  });
  return {
    tf: render(bank.UAS_TF),
    mc: render(bank.UAS_MC),
    compEz: render(bank.UAS_COMP_EZ),
    compHard: render(bank.UAS_COMP_HARD),
  };
}

exports.getExamQuestions = onCall(async (request) => {
  const { examId, nim, pinHash, adminPwHash } = request.data || {};
  if (!examId || typeof examId !== "string") {
    throw new HttpsError("invalid-argument", "examId wajib diisi");
  }
  const bank = QUESTION_BANKS[examId];
  const cfg = EXAM_CONFIG[examId];
  if (!bank || !cfg) {
    throw new HttpsError("not-found", `Bank soal belum tersedia utk exam: ${examId}`);
  }

  const rtdb = getDatabase();

  // ── Jalur DOSEN: admin password, bypass jadwal (preview/monitoring) ──
  if (adminPwHash) {
    if (typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
      throw new HttpsError("permission-denied", "Admin password salah");
    }
    return { examId, N: 0, ..._renderQuestionSet(bank, 0) };
  }

  // ── Jalur MAHASISWA: PIN + jadwal WAJIB terbuka (sama dgn checkExamAnswer) ──
  if (!nim || !/^[0-9]{1,20}$/.test(nim)) {
    throw new HttpsError("invalid-argument", "nim wajib angka");
  }
  if (!pinHash || typeof pinHash !== "string" || !/^[0-9a-f]{64}$/.test(pinHash)) {
    throw new HttpsError("invalid-argument", "pinHash tidak valid");
  }
  const nimKey = sanitizeKey(nim);
  if (!/^[0-9A-Z_]{1,20}$/.test(nimKey)) {
    throw new HttpsError("invalid-argument", "Invalid NIM format");
  }
  const pinSnap = await rtdb.ref(`pins/mhs_${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum terdaftar — login ulang");
  }
  const storedPin = pinSnap.val();
  if (!storedPin || storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "Kredensial tidak valid");
  }

  const sched = await evalSchedule(rtdb, cfg.schedulePath, cfg.lateMultiplierValue);
  if (!sched.isOpen) {
    const msg = sched.reason === "before-start"
      ? "Akses UAS belum dibuka — tunggu waktu mulai"
      : sched.reason === "after-deadline"
        ? "Batas waktu UAS sudah lewat"
        : "Jadwal UAS belum dikonfigurasi";
    throw new HttpsError("failed-precondition", msg);
  }

  const N = deriveN(nim);
  return { examId, N, ..._renderQuestionSet(bank, N) };
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

function _evaluateModulAnswer(ans, userAnswer, userAnswers, lineAnswers) {
  if (ans.type === "mc") {
    // Modul MC: answer adalah letter 'A'/'B'/'C'/'D'. User send letter juga.
    if (typeof userAnswer !== "string" || !/^[A-D]$/.test(userAnswer)) {
      return { correct: false };
    }
    return { correct: userAnswer.toUpperCase() === String(ans.answer).toUpperCase() };
  }
  if (ans.type === "comp") {
    const target = Number(ans.answer ?? ans.expected);
    const tol = Number(ans.tolerance ?? 0.01);
    if (!Number.isFinite(target)) {
      return { correct: false };
    }
    // ROBUST number matching (mirror checkExamAnswer #312). Client kirim
    // userAnswer = nums[0] (angka PERTAMA output), padahal mahasiswa sering
    // print label / nilai antara (mis. "ω1= 10" → angka pertama = 1 dari "ω1")
    // sehingga jawaban final BUKAN angka pertama. Konvensi: jawaban di-print
    // TERAKHIR. Cek angka TERAKHIR dan PERTAMA dari output (+ fallback userAnswer),
    // plus `lineAnswers` (angka pertama per baris print(), mirror client
    // _lineAnswers()) — fix laporan mhs (C4/C6/C7 Getaran Modul-14): jawaban
    // benar sering ada di baris TENGAH saat mahasiswa print beberapa baris
    // berlabel + baris bonus (mis. konversi satuan) setelahnya.
    const finiteNums = Array.isArray(userAnswers)
      ? userAnswers.map(Number).filter(Number.isFinite)
      : [];
    const candidates = [];
    if (finiteNums.length > 0) {
      candidates.push(finiteNums[finiteNums.length - 1]); // angka TERAKHIR
      candidates.push(finiteNums[0]);                      // angka PERTAMA
    }
    const ua = Number(userAnswer);
    if (Number.isFinite(ua)) candidates.push(ua);          // fallback nums[0] client
    if (Array.isArray(lineAnswers)) {
      for (const v of lineAnswers) {
        const n = Number(v);
        if (Number.isFinite(n)) candidates.push(n);         // angka pertama per baris print()
      }
    }
    if (candidates.length === 0) {
      return { correct: false };
    }
    const correct = candidates.some((v) => Math.abs(v - target) <= tol);
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
  const { modulId, qId, userAnswer, userAnswers, lineAnswers, codeText, nim, nama, pinHash } = request.data || {};

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
  const evalResult = _evaluateModulAnswer(ans, userAnswer, userAnswers, lineAnswers);
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
// EXPORT VERIFICATION CODE — deterrent utk file "Export HTML" (Tugas/Forum).
//
// Export HTML (mis. Tugas4_<NIM>_<Course>.html) di-generate 100% client-side
// dari state DOM/JS lokal saat tombol Export diklik — TIDAK ada proteksi
// apa pun terhadap edit manual (mahasiswa buka file di text editor, ubah
// poin/kode/nama). File export BUKAN sumber nilai resmi (nilai asli tetap
// di RTDB via checkModulAnswer), tapi bisa disalahgunakan sbg bukti klaim
// yang menyesatkan kalau di-edit lalu ditunjukkan ke dosen.
//
// Mitigasi (bukan mencegah edit — file lokal selalu bisa diedit siapa pun
// yang punya file itu — tapi membuat edit TERDETEKSI): kode verifikasi
// pendek = HMAC-SHA256(SECRET, modulId|nim|points|generatedAt), di-embed ke
// file export saat generate. Dosen cocokkan via Admin/verify-export-code.html
// (verifyExportCode) kapan pun curiga — field apa pun yang diedit (poin,
// NIM, timestamp) bikin kode tidak lagi cocok.
//
// PENTING: SECRET disimpan via Firebase Secret Manager (defineSecret), BUKAN
// hardcoded di source — repo ini public (GitHub Pages), hardcode secret di
// sini akan membuatnya bisa dibaca siapa saja & mematahkan seluruh mekanisme.
// Wajib di-set SEKALI via CLI sebelum deploy pertama:
//   firebase functions:secrets:set EXPORT_CODE_SECRET
// (isi bebas — string acak panjang, mis. hasil `openssl rand -hex 32`).
// ─────────────────────────────────────────────────────────────────────────────
const EXPORT_CODE_SECRET = defineSecret("EXPORT_CODE_SECRET");

function _computeExportCode(secretValue, modulId, nim, points, generatedAt) {
  const payload = `${modulId}|${nim}|${points}|${generatedAt}`;
  const h = crypto.createHmac("sha256", secretValue).update(payload).digest("hex").toUpperCase();
  // 3 grup 4-karakter (dari 256-bit HMAC) -- cukup pendek utk diketik ulang manual
  // saat verifikasi, cukup panjang (~2^48 kemungkinan) utk sulit ditebak asal-asalan.
  return `${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

// generateExportCode — student callable (PIN-authenticated), dipanggil client
// SEBELUM membangun HTML export, supaya poin yg di-embed adalah poin RESMI
// dari server (bukan state lokal yg bisa saja sudah stale/dimanipulasi).
// Support Modul DAN Exam (UTS/UAS): kirim `modulId` ATAU `examId` — keduanya
// di-resolve dari MODUL_CONFIG lalu EXAM_CONFIG. Poin exam bisa float
// (proporsional bobot Sub-CPMK) → dibulatkan 2 desimal SEBELUM di-hash supaya
// nilai yg di-embed & yg diketik ulang dosen saat verifikasi identik persis.
// Request: { modulId | examId, nim, pinHash }
// Response: { code, points, nilai, generatedAt }
exports.generateExportCode = onCall({ secrets: [EXPORT_CODE_SECRET] }, async (request) => {
  const { modulId, examId, nim, pinHash } = request.data || {};
  const id = (typeof modulId === "string" && modulId) || (typeof examId === "string" && examId) || "";
  if (!id) {
    throw new HttpsError("invalid-argument", "modulId atau examId wajib diisi");
  }
  const cfg = MODUL_CONFIG[id] || EXAM_CONFIG[id];
  if (!cfg) {
    throw new HttpsError("invalid-argument", `id '${id}' tidak dikonfigurasi (bukan modul maupun exam)`);
  }
  if (!nim || !pinHash) {
    throw new HttpsError("invalid-argument", "nim/pinHash wajib diisi");
  }

  const rtdb = getDatabase();
  const nimKey = sanitizeKey("mhs_" + nim);

  const pinSnap = await rtdb.ref(`pins/${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum di-setup utk NIM ini");
  }
  if (pinSnap.val().pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "PIN salah — silakan login ulang");
  }

  const vSnap = await rtdb.ref(`${cfg.dbPath}/${nimKey}`).get();
  const rawPoints = Number((vSnap.val() || {}).points) || 0;
  const points = Math.round(rawPoints * 100) / 100;   // 2 desimal — exam points float
  const generatedAt = new Date().toISOString();
  const code = _computeExportCode(EXPORT_CODE_SECRET.value(), id, nim, points, generatedAt);

  return { code, points, nilai: Math.round((points / cfg.totalPoints) * 100), generatedAt };
});

// verifyExportCode — admin callable, cocokkan kode yg tertera di file export
// terhadap field (modulId/nim/points/generatedAt) yg juga tertera di file yg
// sama. Kalau file diedit (poin/nim/timestamp berubah), kode tidak akan
// cocok lagi -- HMAC dihitung ulang dari field yg di-submit, bukan dibaca
// dari storage manapun.
// Request: { adminPwHash, modulId, nim, points, generatedAt, code }
// Response: { valid, currentPoints }
exports.verifyExportCode = onCall({ secrets: [EXPORT_CODE_SECRET] }, async (request) => {
  const { adminPwHash, modulId, examId, nim, points, generatedAt, code } = request.data || {};
  if (!adminPwHash || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  const id = (typeof modulId === "string" && modulId) || (typeof examId === "string" && examId) || "";
  if (!id || !nim || points === undefined || points === null || !generatedAt || !code) {
    throw new HttpsError("invalid-argument", "modulId|examId/nim/points/generatedAt/code wajib diisi");
  }
  const expected = _computeExportCode(
    EXPORT_CODE_SECRET.value(), id, String(nim), Number(points), String(generatedAt)
  );
  const valid = expected === String(code).toUpperCase().trim();

  // Info tambahan (bukan indikasi curang) -- poin TERKINI di RTDB, kalau beda
  // dari poin di file berarti mahasiswa sudah lanjut mengerjakan setelah
  // export dibuat (wajar), bukan tanda manipulasi.
  let currentPoints = null;
  const cfg = MODUL_CONFIG[id] || EXAM_CONFIG[id];
  if (valid && cfg) {
    const rtdb = getDatabase();
    const nimKey = sanitizeKey("mhs_" + nim);
    const vSnap = await rtdb.ref(`${cfg.dbPath}/${nimKey}`).get();
    currentPoints = Number((vSnap.val() || {}).points) || 0;
  }

  return { valid, currentPoints };
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

// ─────────────────────────────────────────────────────────────────────────────
// resetModulQuestion — admin callable, reset PRESISI per-soal.
//
// Dua mode (ditentukan oleh field `nim`):
//   • nim DIISI  → reset qIds untuk 1 mahasiswa tsb.
//   • nim KOSONG → reset qIds untuk SEMUA mahasiswa yang punya attempt di modul
//     ini (mis. kunci jawaban 1 soal salah → buka ulang utk seluruh kelas).
//
// Berbeda dgn resetModulAttempts (hapus SEMUA attempt 1 modul utk semua mhs),
// fungsi ini hanya menyentuh qIds yang dipilih. Anti double-count: baca
// scoreDelta + marker dari attempt record, lalu:
//   1. Hapus Firestore attempt doc (unlock soal).
//   2. RTDB: buang marker dari scoredQuestions + kurangi points sebesar scoreDelta.
//   3. RTDB: hapus selections[qId] / codes[qId] (kebersihan).
//
// Setelah reset, mahasiswa bisa submit ulang → di-skor fresh dgn kunci terbaru.
//
// Request: { modulId, nim?, qIds:[...], adminPwHash }   (nim kosong = semua mhs)
// Response (single): { modulId, nim, allStudents:false, perQuestion, pointsBefore, pointsAfter, markersRemoved }
// Response (all):    { modulId, allStudents:true, studentsScanned, studentsAffected, totalMarkersRemoved, perStudent }
// ─────────────────────────────────────────────────────────────────────────────
exports.resetModulQuestion = onCall({ timeoutSeconds: 540, memory: "512MiB" }, async (request) => {
  const { modulId, nim, qIds, adminPwHash } = request.data || {};

  if (!modulId || !MODUL_CONFIG[modulId]) {
    throw new HttpsError("invalid-argument", `modulId '${modulId}' tidak dikonfigurasi`);
  }
  // nim opsional — kosong/absent = reset untuk SEMUA mahasiswa (per-soal).
  const allStudents = (nim === undefined || nim === null || String(nim).trim() === "");
  if (!allStudents && !/^[0-9]{1,20}$/.test(String(nim))) {
    throw new HttpsError("invalid-argument", "nim harus angka (1-20 digit), atau kosongkan untuk semua mahasiswa");
  }
  if (!Array.isArray(qIds) || qIds.length === 0) {
    throw new HttpsError("invalid-argument", "qIds harus array berisi minimal 1 qId");
  }
  if (qIds.length > 30) {
    throw new HttpsError("invalid-argument", "qIds maksimal 30 soal per panggilan");
  }
  for (const q of qIds) {
    if (typeof q !== "string" || !/^[a-zA-Z0-9_-]{1,20}$/.test(q)) {
      throw new HttpsError("invalid-argument", `qId '${q}' tidak valid`);
    }
  }
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }

  const cfg = MODUL_CONFIG[modulId];
  const fs = getFirestore();
  const rtdb = getDatabase();

  // Reset qIds untuk satu mahasiswa (nimKey sudah ter-sanitize). Return ringkasan.
  async function resetOne(nimKey) {
    const perQuestion = [];
    const markersToRemove = [];
    let totalScoreToSubtract = 0;

    // Baca semua attempt qId dalam SATU getAll (1 round-trip, bukan N), lalu
    // hapus via SATU batch — minim I/O per mahasiswa supaya reset massal kelas
    // besar tidak melewati timeout instance.
    const refs = qIds.map((qId) =>
      fs.doc(`modulAttempts/${modulId}/students/${nimKey}/qs/${qId}`));
    const snaps = await fs.getAll(...refs);
    const batch = fs.batch();
    let haveDeletes = false;
    snaps.forEach((snap, i) => {
      const qId = qIds[i];
      if (!snap.exists) {
        perQuestion.push({ qId, found: false, marker: null, scoreDelta: 0 });
        return;
      }
      const data = snap.data() || {};
      const marker = data.marker || qId;
      const scoreDelta = Number(data.scoreDelta) || 0;
      markersToRemove.push(marker);
      totalScoreToSubtract += scoreDelta;
      batch.delete(refs[i]);
      haveDeletes = true;
      perQuestion.push({ qId, found: true, marker, scoreDelta });
    });
    if (haveDeletes) await batch.commit();

    // Mahasiswa ini tak punya attempt utk qIds tsb → tak ada marker/poin yang
    // perlu diubah di RTDB. Lewati transaksi (operasi termahal) agar reset massal
    // tidak menumpuk transaksi sia-sia untuk non-partisipan → cegah timeout.
    if (markersToRemove.length === 0) {
      return { perQuestion, markersRemoved: [], pointsBefore: null, pointsAfter: null };
    }

    let pointsBefore = null;
    let pointsAfter = null;
    const vRef = rtdb.ref(`${cfg.dbPath}/${nimKey}`);
    await vRef.transaction((cur) => {
      if (cur === null) return cur;
      pointsBefore = cur.points || 0;
      const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
      const removeSet = new Set(markersToRemove);
      cur.scoredQuestions = scored.filter((m) => !removeSet.has(m)).join(",");
      cur.points = Math.max(0, (cur.points || 0) - totalScoreToSubtract);
      cur.pointTimestamp = new Date().toISOString();
      if (cur.selections) qIds.forEach((q) => { delete cur.selections[q]; });
      if (cur.codes) qIds.forEach((q) => { delete cur.codes[q]; });
      if ((cur.points || 0) === 0) cur.consolationAwarded = false;
      pointsAfter = cur.points;
      return cur;
    });

    return { perQuestion, markersRemoved: markersToRemove, pointsBefore, pointsAfter };
  }

  try {
    // ── MODE 1: satu mahasiswa ──
    if (!allStudents) {
      const nimKey = sanitizeKey("mhs_" + String(nim));
      const r = await resetOne(nimKey);
      console.log("[resetModulQuestion] single", modulId, nimKey,
        "qIds:", qIds.join(","), "markers:", r.markersRemoved.length,
        "points:", r.pointsBefore, "→", r.pointsAfter);
      return {
        modulId, nim: String(nim), allStudents: false,
        perQuestion: r.perQuestion,
        pointsBefore: r.pointsBefore,
        pointsAfter: r.pointsAfter,
        markersRemoved: r.markersRemoved,
      };
    }

    // ── MODE 2: SEMUA mahasiswa (nim kosong) ──
    // Enumerate peserta dari RTDB visitors node — jalur yang dipakai tiap submit,
    // jadi pasti tersedia & ber-permission. SEBELUMNYA pakai Firestore
    // collection.listDocuments(), yang ternyata menggantung instance sampai
    // timeout (butuh izin Firestore "list" tersendiri) → "internal" polos meski
    // per-NIM jalan normal. resetOne tetap menghapus attempt Firestore + update
    // RTDB seperti biasa, di-key per nimKey yang sama.
    const visSnap = await rtdb.ref(cfg.dbPath).once("value");
    const nimKeys = [];
    visSnap.forEach((child) => { if (child.key) nimKeys.push(child.key); });
    console.log("[resetModulQuestion] ALL start", modulId,
      "students:", nimKeys.length, "qIds:", qIds.join(","));
    let studentsAffected = 0;
    let totalMarkersRemoved = 0;
    const perStudent = [];
    const errors = [];

    // Proses paralel ber-batch (concurrency terbatas) supaya selesai cepat dan
    // tidak melewati timeout instance/callable untuk kelas besar. Tiap mahasiswa
    // di-ISOLASI: satu record bermasalah tidak menggagalkan seluruh batch,
    // melainkan dicatat di `errorsSample` agar selalu kelihatan.
    const BATCH = 24;
    for (let i = 0; i < nimKeys.length; i += BATCH) {
      const slice = nimKeys.slice(i, i + BATCH);
      const results = await Promise.all(slice.map(async (nimKey) => {
        try {
          return { nimKey, ok: true, r: await resetOne(nimKey) };
        } catch (err) {
          return { nimKey, ok: false, err: (err && err.message) ? err.message : String(err) };
        }
      }));
      for (const res of results) {
        if (!res.ok) { errors.push({ nimKey: res.nimKey, error: res.err }); continue; }
        const removed = res.r.markersRemoved.length;
        if (removed > 0) {
          studentsAffected++;
          totalMarkersRemoved += removed;
          perStudent.push({
            nimKey: res.nimKey,
            markersRemoved: removed,
            pointsBefore: res.r.pointsBefore,
            pointsAfter: res.r.pointsAfter,
          });
        }
      }
    }

    console.log("[resetModulQuestion] ALL", modulId,
      "qIds:", qIds.join(","), "scanned:", nimKeys.length,
      "affected:", studentsAffected, "markers:", totalMarkersRemoved,
      "errors:", errors.length);

    return {
      modulId, allStudents: true,
      studentsScanned: nimKeys.length,
      studentsAffected,
      totalMarkersRemoved,
      perStudent,
      studentsErrored: errors.length,
      errorsSample: errors.slice(0, 5),
    };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error("[resetModulQuestion] FAILED", modulId, allStudents ? "ALL" : nim, e);
    throw new HttpsError("internal", `Reset soal gagal: ${e && e.message ? e.message : e}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// rescaleModulLatePenalty — admin callable. (Opsional) SET deadline baru, lalu
// HITUNG ULANG outcome tiap attempt modul terhadap deadline tsb — TANPA mahasiswa
// submit ulang.
//
// Recompute PENUH (semua tipe soal, termasuk Comp HARD):
//   Pakai correctness yang sudah tersimpan + timestamp submit asli vs deadline
//   terkini, lalu jalankan ulang _computeModulOutcome:
//     • Jawaban BENAR yg dulu telat (×0.7) → kini on-time → poin PENUH (×1.0).
//     • Soal HARD SALAH yg dulu telat (0 poin, marker _comp_used) → kini on-time
//       → dapat PARTIAL (+partialPoints, marker _comp_partial). ← termasuk soal Hard
//     • MC/Comp EZ salah → tetap 0 (tak ada partial).
//   Marker di scoredQuestions ikut ditukar bila berubah; points RTDB disesuaikan.
//   Idempoten — hanya menyentuh attempt yang outcome-nya berubah.
//
// Request:  { modulId, adminPwHash, nims?:[...], newEnd? }
//   newEnd  — ISO datetime opsional. Jika diisi → tulis ke schedule end DULU
//             (sekalian atur jadwal), lalu rescale terhadapnya. Jika kosong →
//             pakai end yang sudah ada di schedule.
// Response: { modulId, scheduleEnd, totalStudents, totalAdjusted,
//             students:[{ nimKey, pointsBefore, pointsAfter,
//               adjustments:[{ qId, oldMarker, newMarker, oldStatus, newStatus,
//                              oldScoreDelta, newScoreDelta }] }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.rescaleModulLatePenalty = onCall({ timeoutSeconds: 300 }, async (request) => {
  const { modulId, adminPwHash, nims, newEnd } = request.data || {};

  if (!modulId || !MODUL_CONFIG[modulId]) {
    throw new HttpsError("invalid-argument", `modulId '${modulId}' tidak dikonfigurasi`);
  }
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  if (nims !== undefined && nims !== null && !Array.isArray(nims)) {
    throw new HttpsError("invalid-argument", "nims harus array (atau dikosongkan)");
  }

  const cfg = MODUL_CONFIG[modulId];
  const fs = getFirestore();
  const rtdb = getDatabase();
  const EPS = 1e-9;
  const round4 = (x) => Math.round(x * 1e4) / 1e4;

  // PEDOMAN — try dimulai di sini (bukan setelah baca schedule) supaya kedua
  // panggilan RTDB di bawah (update newEnd + get schedule) ikut ke-tangkap.
  // Bug lama: keduanya di luar try/catch → exception apa pun (mis. transient
  // RTDB error) lolos tanpa HttpsError, klien cuma lihat "internal" generik
  // tanpa detail (lihat laporan dosen utk optoauto-modul-4).
  try {
    const hasNims = Array.isArray(nims) && nims.length > 0;

    // ── (Opsional) newEnd sbg acuan deadline ──
    // Bug lama: newEnd SELALU ditulis ke schedule.end GLOBAL (settings/.../schedule),
    // walau nims di-scope ke mahasiswa tertentu — akibatnya mahasiswa LAIN yang
    // sebenarnya terlambat ikut ke-reclass "tepat waktu" karena deadline modul
    // bergeser utk SEMUA orang, bukan cuma yg dituju.
    // Fix: kalau nims diisi (scope ke mahasiswa tertentu), newEnd HANYA dipakai
    // sbg acuan hitung ulang utk mereka — TIDAK menimpa schedule.end global.
    // Kalau nims kosong (scope = semua mahasiswa modul ini), newEnd tetap
    // persist ke schedule.end seperti semula (use-case: perpanjangan deadline
    // utk satu kelas penuh).
    let refEndIso = null;
    if (newEnd !== undefined && newEnd !== null && String(newEnd).trim() !== "") {
      const t = new Date(newEnd).getTime();
      if (!Number.isFinite(t)) {
        throw new HttpsError("invalid-argument", `newEnd '${newEnd}' bukan tanggal valid`);
      }
      refEndIso = new Date(t).toISOString();
      if (!hasNims) {
        // update() sparse → preserve start/extension yang sudah ada
        await rtdb.ref(cfg.schedulePath).update({ end: refEndIso });
      }
    }

    // ── Baca schedule terkini → tentukan 'end' acuan (refEndIso menang kalau ada) ──
    const schedSnap = await rtdb.ref(cfg.schedulePath).get();
    if (!schedSnap.exists() && !refEndIso) {
      throw new HttpsError("failed-precondition", "Jadwal modul belum dikonfigurasi");
    }
    const sched = schedSnap.val() || {};
    if (!sched.end && !refEndIso) {
      throw new HttpsError("failed-precondition", "Jadwal modul belum punya field 'end'");
    }
    const effectiveEnd = refEndIso || sched.end;
    const endMs = new Date(effectiveEnd).getTime();
    const lateMul = Number(cfg.lateMultiplierValue) || 0.7;

    // ── Daftar studentDoc yang diproses ──
    let studentDocs;
    if (hasNims) {
      studentDocs = nims.map((n) => {
        if (typeof n !== "string" || !/^[0-9]{1,20}$/.test(n)) {
          throw new HttpsError("invalid-argument", `nim '${n}' tidak valid`);
        }
        return fs.doc(`modulAttempts/${modulId}/students/${sanitizeKey("mhs_" + n)}`);
      });
    } else {
      studentDocs = await fs.collection(`modulAttempts/${modulId}/students`).listDocuments();
    }

    // Cache answer-key per qId (allowPartial/partialPoints/points/type)
    const ansCache = {};
    const getAns = async (qId) => {
      if (ansCache[qId] !== undefined) return ansCache[qId];
      const s = await fs.doc(`modulAnswers/${modulId}/qs/${qId}`).get();
      ansCache[qId] = s.exists ? (s.data() || null) : null;
      return ansCache[qId];
    };

    const students = [];
    let totalAdjusted = 0;

    for (const studentDoc of studentDocs) {
      const nimKey = studentDoc.id;
      const qsDocs = await studentDoc.collection("qs").listDocuments();
      const adjustments = [];
      const markerSwaps = []; // { oldMarker, newMarker }
      let netDiff = 0;

      for (const qDoc of qsDocs) {
        const snap = await qDoc.get();
        if (!snap.exists) continue;
        const data = snap.data() || {};
        const qId = data.qId || qDoc.id;
        const ts = data.timestamp && typeof data.timestamp.toMillis === "function"
          ? data.timestamp.toMillis()
          : null;
        if (ts === null) continue; // tak ada timestamp → tak bisa recompute

        const ans = await getAns(qId);
        if (!ans) continue; // answer key hilang → lewati

        const newPastDeadline = ts > endMs;
        const newMul = newPastDeadline ? lateMul : 1.0;

        // Recompute outcome PENUH dari correctness tersimpan + deadline baru.
        const evalResult = { correct: data.correct === true };
        const outcome = _computeModulOutcome(ans, evalResult, newPastDeadline);
        const newMarker = qId + outcome.markerSuffix;
        const newScoreDelta = round4(outcome.points * newMul);

        const oldMarker = data.marker || qId;
        const oldScoreDelta = Number(data.scoreDelta) || 0;
        const oldStatus = data.status || "";

        const markerChanged = newMarker !== oldMarker;
        const deltaChanged = Math.abs(newScoreDelta - oldScoreDelta) > EPS;
        if (!markerChanged && !deltaChanged) continue; // tidak ada perubahan

        await qDoc.set({
          marker: newMarker,
          status: outcome.status,
          scoreDelta: newScoreDelta,
          lateMultiplier: newMul,
          pastDeadline: newPastDeadline,
          rescaledAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        if (markerChanged) markerSwaps.push({ oldMarker, newMarker });
        netDiff += (newScoreDelta - oldScoreDelta);
        adjustments.push({
          qId,
          oldMarker, newMarker,
          oldStatus, newStatus: outcome.status,
          oldScoreDelta, newScoreDelta,
        });
        totalAdjusted += 1;
      }

      // ── Satu transaksi RTDB per mahasiswa: tukar marker + sesuaikan points ──
      let pointsBefore = null;
      let pointsAfter = null;
      if (adjustments.length > 0) {
        const removeSet = new Set(markerSwaps.map((m) => m.oldMarker));
        const addList = markerSwaps.map((m) => m.newMarker);
        const vRef = rtdb.ref(`${cfg.dbPath}/${nimKey}`);
        await vRef.transaction((cur) => {
          if (cur === null) return cur;
          pointsBefore = cur.points || 0;

          if (markerSwaps.length > 0) {
            const scored = (cur.scoredQuestions || "").split(",").filter(Boolean);
            const kept = scored.filter((m) => !removeSet.has(m));
            for (const am of addList) if (!kept.includes(am)) kept.push(am);
            cur.scoredQuestions = kept.join(",");
          }

          const next = Math.max(0, Math.min((cur.points || 0) + netDiff, cfg.totalPoints));
          cur.points = round4(next);
          cur.pointTimestamp = new Date().toISOString();
          pointsAfter = cur.points;
          return cur;
        });
        students.push({ nimKey, pointsBefore, pointsAfter, adjustments });
      }
    }

    console.log("[rescaleModulLatePenalty]", modulId,
      "newEnd:", (newEnd || "(none)"), "scopedToNims:", hasNims,
      "students:", students.length, "attempts:", totalAdjusted);
    return {
      modulId,
      scheduleEnd: effectiveEnd,
      scheduleUnchanged: hasNims && !!refEndIso,
      totalStudents: students.length,
      totalAdjusted,
      students,
    };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error("[rescaleModulLatePenalty] FAILED", modulId, e);
    throw new HttpsError("internal", `Rescale gagal: ${e.message || e}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// analyzeModulData — admin callable. Kembalikan paket data mentah untuk analisis
// korban bug grading di BROWSER (Admin/analyze-victims.html re-run kode via Pyodide).
//
// Server tidak menjalankan Python (Cloud Functions tidak punya numpy/scipy).
// Jadi fungsi ini hanya mengumpulkan: answer key comp (answer/tolerance) +
// tiap mahasiswa (scoredQuestions + codes tersimpan). Browser yang re-run & nilai.
//
// Request:  { modulId, adminPwHash }
// Response: { modulId, answers:{ qId:{answer,tolerance,allowPartial,partialPoints,points} },
//             students:[{ nimKey, nim, nama, points, scoredQuestions, codes:{qId:code} }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.analyzeModulData = onCall({ timeoutSeconds: 120 }, async (request) => {
  const { modulId, adminPwHash } = request.data || {};
  if (!modulId || !MODUL_CONFIG[modulId]) {
    throw new HttpsError("invalid-argument", `modulId '${modulId}' tidak dikonfigurasi`);
  }
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }

  const cfg = MODUL_CONFIG[modulId];
  const fs = getFirestore();
  const rtdb = getDatabase();

  try {
    // ── Answer key comp (answer + tolerance) ──
    const answers = {};
    const qsSnap = await fs.collection(`modulAnswers/${modulId}/qs`).get();
    qsSnap.forEach((doc) => {
      const d = doc.data() || {};
      if (d.type === "comp") {
        answers[doc.id] = {
          answer: Number(d.answer ?? d.expected),
          tolerance: Number(d.tolerance ?? 0.01),
          allowPartial: d.allowPartial === true,
          partialPoints: Number(d.partialPoints ?? 1),
          points: Number(d.points ?? 1),
        };
      }
    });

    // ── Visitor records (scoredQuestions + codes) ──
    const vSnap = await rtdb.ref(cfg.dbPath).get();
    const visitors = vSnap.val() || {};
    const students = [];
    for (const [key, rec] of Object.entries(visitors)) {
      if (!key.startsWith("mhs_") || !rec || typeof rec !== "object") continue;
      const codes = (rec.codes && typeof rec.codes === "object") ? rec.codes : {};
      // hanya kirim mahasiswa yang punya minimal 1 marker comp _used/_partial
      const scored = String(rec.scoredQuestions || "");
      if (!/c\d+_comp_(used|partial)/.test(scored)) continue;
      students.push({
        nimKey: key,
        nim: rec.nim || key.replace(/^mhs_/, ""),
        nama: rec.nama || "",
        points: rec.points || 0,
        scoredQuestions: scored,
        codes,
      });
    }

    console.log("[analyzeModulData]", modulId, "students:", students.length, "answers:", Object.keys(answers).length);
    return { modulId, answers, students };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error("[analyzeModulData] FAILED", modulId, e);
    throw new HttpsError("internal", `Analyze gagal: ${e.message || e}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// publishObeNilai — admin callable. Tulis batch nilai OBE per mahasiswa ke
// Firestore obeNilai/{courseId}/students/{nimKey}. Mahasiswa membaca via
// getMyObeNilai (PIN-gated).
//
// Request: {
//   adminPwHash, courseId,
//   scores: { "<nim>": { pre:88, TGS:{"1.3":80,...}, UTS:{"1.1":75,...}, UAS:{"3.1":70,...} } }
// }
// Response: { courseId, students, written, skipped }
// ─────────────────────────────────────────────────────────────────────────────
exports.publishObeNilai = onCall({ timeoutSeconds: 60 }, async (request) => {
  const { adminPwHash, courseId, scores } = request.data || {};
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  if (!courseId || typeof courseId !== "string" || !/^[a-z0-9_-]{1,40}$/.test(courseId)) {
    throw new HttpsError("invalid-argument", "courseId wajib (alfanumerik/dash/underscore)");
  }
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new HttpsError("invalid-argument", "scores wajib berupa object {nim: {TGS:{...}}}");
  }

  const fs = getFirestore();
  const batch = fs.batch();
  let written = 0, skipped = 0;

  for (const [nim, perForm] of Object.entries(scores)) {
    if (!/^[0-9]{1,20}$/.test(nim)) { skipped++; continue; }
    if (!perForm || typeof perForm !== "object") { skipped++; continue; }
    // Sanitize: only TGS/UTS/UAS, only numeric sub keys, values 0-100
    const sanitized = { nim, publishedAt: FieldValue.serverTimestamp() };
    for (const form of ["TGS", "UTS", "UAS"]) {
      const f = perForm[form];
      if (!f || typeof f !== "object") continue;
      const cleanForm = {};
      for (const [sub, v] of Object.entries(f)) {
        if (!/^\d+\.\d+$/.test(sub)) continue;
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 100) continue;
        cleanForm[sub] = n;
      }
      if (Object.keys(cleanForm).length > 0) sanitized[form] = cleanForm;
    }
    // PRE (presensi, %) — opsional, 0-100
    if (perForm.pre !== undefined) {
      const preN = Number(perForm.pre);
      if (Number.isFinite(preN) && preN >= 0 && preN <= 100) sanitized.pre = Math.round(preN);
    }
    const nimKey = sanitizeKey("mhs_" + nim);
    batch.set(fs.doc(`obeNilai/${courseId}/students/${nimKey}`), sanitized, { merge: true });
    written++;
  }

  if (written === 0) {
    throw new HttpsError("invalid-argument", "Tidak ada nilai valid untuk dipublish");
  }
  await batch.commit();
  console.log("[publishObeNilai]", courseId, "written:", written, "skipped:", skipped);
  return { courseId, written, skipped };
});

// ─────────────────────────────────────────────────────────────────────────────
// getMyObeNilai — callable PIN-gated. Mahasiswa fetch nilai OBE-nya sendiri.
//
// Request: { courseId, nim, pinHash }
// Response: { courseId, nim, pre, TGS, UTS, UAS, publishedAt }   (atau {courseId, nim, empty:true})
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyObeNilai = onCall(async (request) => {
  const { courseId, nim, pinHash } = request.data || {};
  if (!courseId || !/^[a-z0-9_-]{1,40}$/.test(courseId)) {
    throw new HttpsError("invalid-argument", "courseId wajib");
  }
  if (!nim || !/^[0-9]{1,20}$/.test(nim)) {
    throw new HttpsError("invalid-argument", "nim wajib angka");
  }
  if (!pinHash || typeof pinHash !== "string") {
    throw new HttpsError("invalid-argument", "pinHash wajib");
  }
  const rtdb = getDatabase();
  const nimKey = sanitizeKey("mhs_" + nim);
  const pinSnap = await rtdb.ref(`pins/${nimKey}`).get();
  if (!pinSnap.exists()) {
    throw new HttpsError("unauthenticated", "PIN belum di-setup untuk NIM ini");
  }
  const storedPin = pinSnap.val();
  if (storedPin.pinHash !== pinHash) {
    throw new HttpsError("unauthenticated", "PIN salah");
  }
  const fs = getFirestore();
  const docSnap = await fs.doc(`obeNilai/${courseId}/students/${nimKey}`).get();
  if (!docSnap.exists) {
    return { courseId, nim, empty: true, nama: storedPin.nama || "" };
  }
  const d = docSnap.data() || {};
  return {
    courseId, nim,
    nama: storedPin.nama || "",
    pre: (typeof d.pre === "number") ? d.pre : null,
    TGS: d.TGS || {},
    UTS: d.UTS || {},
    UAS: d.UAS || {},
    publishedAt: d.publishedAt ? d.publishedAt.toMillis() : null,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteObeNilai — admin callable. Hapus SEMUA nilai OBE yang sudah dipublish
// untuk satu course (obeNilai/{courseId}/students/*). Mahasiswa tidak lagi bisa
// melihat nilai setelah ini. Tidak menyentuh localStorage dosen.
//
// Request:  { adminPwHash, courseId }
// Response: { courseId, deleted }
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteObeNilai = onCall({ timeoutSeconds: 60 }, async (request) => {
  const { adminPwHash, courseId } = request.data || {};
  if (!adminPwHash || typeof adminPwHash !== "string" || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  if (!courseId || typeof courseId !== "string" || !/^[a-z0-9_-]{1,40}$/.test(courseId)) {
    throw new HttpsError("invalid-argument", "courseId wajib (alfanumerik/dash/underscore)");
  }
  const fs = getFirestore();
  const docs = await fs.collection(`obeNilai/${courseId}/students`).listDocuments();
  let deleted = 0;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = fs.batch();
    docs.slice(i, i + 400).forEach((ref) => { batch.delete(ref); deleted++; });
    await batch.commit();
  }
  console.log("[deleteObeNilai]", courseId, "deleted:", deleted);
  return { courseId, deleted };
});

// ─────────────────────────────────────────────────────────────────────────────
// recomputeExamPoints — admin callable. Recompute visitor.points untuk SEMUA
// mahasiswa di satu exam, pakai poin per soal OBE-mapped (skema 100 poin).
// Dipakai utk migrasi data lama (visitor.points masih /70 skala) atau setelah
// perubahan mapping/bobot di OBE_EXAM_CONFIG.
// Hapus juga visitor.obeScore (legacy) bila ada.
//
// Request:  { adminPwHash, examId }
// Response: { examId, processed, updated, skipped }
// ─────────────────────────────────────────────────────────────────────────────
exports.recomputeExamPoints = onCall({ timeoutSeconds: 300 }, async (request) => {
  const { adminPwHash, examId } = request.data || {};
  if (!adminPwHash || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  if (!examId || typeof examId !== "string") {
    throw new HttpsError("invalid-argument", "examId wajib");
  }
  const cfg = EXAM_CONFIG[examId];
  if (!cfg) throw new HttpsError("not-found", `Unknown exam: ${examId}`);
  if (!OBE_EXAM_CONFIG[examId]) {
    throw new HttpsError("failed-precondition", `OBE_EXAM_CONFIG belum support ${examId}`);
  }

  const rtdb = getDatabase();
  const visitorsSnap = await rtdb.ref(cfg.dbPath).get();
  const visitors = visitorsSnap.val() || {};
  let processed = 0, updated = 0, skipped = 0;

  for (const nimKey of Object.keys(visitors)) {
    if (!nimKey.startsWith("mhs_")) { skipped++; continue; }
    processed++;
    const cleanKey = nimKey.replace(/^mhs_/, "");
    try {
      const pts = await _sumExamPointsFromAttempts(examId, cleanKey);
      if (pts == null) { skipped++; continue; }
      const capped = Math.min(pts, cfg.totalPoints);
      const updates = { points: Math.round(capped * 100) / 100, obeScore: null };
      await rtdb.ref(`${cfg.dbPath}/${nimKey}`).update(updates);
      updated++;
    } catch (e) {
      console.warn("[recomputeExamPoints]", examId, nimKey, e.message);
      skipped++;
    }
  }

  console.log("[recomputeExamPoints]", examId,
              "processed:", processed, "updated:", updated, "skipped:", skipped);
  return { examId, processed, updated, skipped };
});

// ─────────────────────────────────────────────────────────────────────────────
// computeObeScores — admin callable. Hitung nilai OBE per Sub-CPMK dari data
// performa mahasiswa (poin modul utk Tugas; per-soal exam utk UTS/UAS).
//
// MAPPING (kontigu, proporsional bobot — bisa disesuaikan di OBE_MAP):
//   Tugas kolom: 1.3←M1, 2.1←M2, 2.2←M3, 2.3←M4, 3.1←M5, 3.2←M6, 3.3←M7,
//                4.1←M8, 4.2←M9, 4.3←M10, 5.1←avg(M11,M12), 5.2←avg(M13,M14)
//                (poin modul 0..50 → ×2 → skala 0..100)
//   UTS soal (Q1-10 tf, Q11-30 mc, Q31-40 comp-2pt, Q41-45 hard-4pt):
//     1.1←Q1-11, 1.2←Q12-22, 1.3←Q23-31, 2.2←Q32-38, 2.3←Q39-45
//   UAS soal:
//     3.1←Q1-9, 3.2←Q10-16, 3.3←Q17-23, 4.1←Q24-30, 4.2←Q31-36, 4.3←Q37-45
//   Nilai Sub-CPMK exam = Σ poin diperoleh / Σ poin maks (grup) × 100.
//
// Request: { adminPwHash, courseId, nims:[...] }
// Response: { courseId, scores: { nim: { TGS:{sub:val}, UTS:{...}, UAS:{...} } }, missing }
// ─────────────────────────────────────────────────────────────────────────────
const OBE_EXAM_ORDER = (prefixComp) => [
  ...Array.from({length:10}, (_,i)=>`tf${i+1}`),
  ...Array.from({length:20}, (_,i)=>`mc${i+1}`),
  ...Array.from({length:10}, (_,i)=>`${prefixComp}${i+1}`),       // comp easy
  ...Array.from({length:5},  (_,i)=>`${prefixComp}${i+11}`),      // comp hard
];
const OBE_ORDER = {
  "optoauto-uts": (() => { // UTS comp easy = ce1-ce10, hard = ch1-ch5
    return [
      ...Array.from({length:10}, (_,i)=>`tf${i+1}`),
      ...Array.from({length:20}, (_,i)=>`mc${i+1}`),
      ...Array.from({length:10}, (_,i)=>`ce${i+1}`),
      ...Array.from({length:5},  (_,i)=>`ch${i+1}`),
    ];
  })(),
  "optoauto-uas": OBE_EXAM_ORDER("c"),  // c1-c10 (easy), c11-c15 (hard)
  // Getaran & Math4: skema seragam c1-c10 easy + c11-c15 hard (lihat seed)
  "getaran-mekanik-uts": OBE_EXAM_ORDER("c"),
  "getaran-mekanik-uas": OBE_EXAM_ORDER("c"),
  "math4-uts": OBE_EXAM_ORDER("c"),
  "math4-uas": OBE_EXAM_ORDER("c"),
};
// courseId (OBE HTML) → [utsExamId, uasExamId]
const OBE_COURSE_EXAMS = {
  "optoauto":        ["optoauto-uts",        "optoauto-uas"],
  "getaran_mekanik": ["getaran-mekanik-uts", "getaran-mekanik-uas"],
  "math4":           ["math4-uts",           "math4-uas"],
};
// Poin maks per posisi Q (1-based): Q1-30=1, Q31-40=2, Q41-45=4
// _obeQPoints (legacy fixed 1/2/4) dihapus — semua call site beralih ke
// _examQPoints(examId, qIdx0) yang menghitung poin per soal dari bobot
// Sub-CPMK (proporsional). Skema baru: Σ poin per exam = 100.
const OBE_MAP = {
  uts: { "1.1":[1,11], "1.2":[12,22], "1.3":[23,31], "2.2":[32,38], "2.3":[39,45] },
  uas: { "3.1":[1,9], "3.2":[10,16], "3.3":[17,23], "4.1":[24,30], "4.2":[31,36], "4.3":[37,45] },
};
const OBE_TUGAS_COLS = [
  ["1.3",[1]], ["2.1",[2]], ["2.2",[3]], ["2.3",[4]], ["3.1",[5]], ["3.2",[6]],
  ["3.3",[7]], ["4.1",[8]], ["4.2",[9]], ["4.3",[10]], ["5.1",[11,12]], ["5.2",[13,14]],
];

// Default mapping bentuk LIST (jadi fallback kalau client tak kirim).
function _rangeToList(lo, hi){ const a=[]; for(let i=lo;i<=hi;i++) a.push(i); return a; }
function _defaultObeMapping(){
  const tugas = {}; OBE_TUGAS_COLS.forEach(([sub,mods]) => tugas[sub] = mods.slice());
  const uts = {}; for (const [sub,[lo,hi]] of Object.entries(OBE_MAP.uts)) uts[sub] = _rangeToList(lo,hi);
  const uas = {}; for (const [sub,[lo,hi]] of Object.entries(OBE_MAP.uas)) uas[sub] = _rangeToList(lo,hi);
  return { tugas, uts, uas };
}

exports.computeObeScores = onCall({ timeoutSeconds: 300 }, async (request) => {
  const { adminPwHash, courseId, nims, mapping } = request.data || {};
  if (!adminPwHash || adminPwHash !== ADMIN_PW_HASH) {
    throw new HttpsError("permission-denied", "Admin password salah");
  }
  if (!OBE_COURSE_EXAMS[courseId]) {
    throw new HttpsError(
      "invalid-argument",
      `computeObeScores belum mendukung courseId '${courseId}'. Tambah entry di OBE_COURSE_EXAMS.`
    );
  }
  const [utsExamId, uasExamId] = OBE_COURSE_EXAMS[courseId];
  if (!Array.isArray(nims) || nims.length === 0) {
    throw new HttpsError("invalid-argument", "nims wajib array NIM");
  }
  const validNims = nims.filter(n => /^[0-9]{1,20}$/.test(n));

  // ── Mapping efektif: keys diambil dari CLIENT (truth per course), default
  //    Opto hanya fallback bila client tidak kirim mapping sama sekali.
  //    Bug lama: iterate _def keys → Sub-CPMK unik per course (mis. Getaran 6.1,
  //    6.2, 6.3; Math4 1.1, 5.1) tidak ke-compute → blank di UI Rekap.
  const _def = _defaultObeMapping();
  const _m = (mapping && typeof mapping === "object") ? mapping : {};
  const _clean = (arr, lo, hi) => Array.isArray(arr)
    ? Array.from(new Set(arr.map(Number).filter(x => Number.isInteger(x) && x >= lo && x <= hi)))
    : [];
  function _effFor(which, hi) {
    const cm = _m[which];
    const out = {};
    if (cm && typeof cm === "object" && Object.keys(cm).length > 0) {
      // Client provided mapping → trust its keys
      for (const [sub, arr] of Object.entries(cm)) {
        const v = _clean(arr, 1, hi);
        if (v.length) out[sub] = v;
      }
      if (Object.keys(out).length) return out;
    }
    // Fallback default (Opto)
    for (const [sub, d0] of Object.entries(_def[which])) out[sub] = d0;
    return out;
  }
  const effTugas = _effFor("tugas", 14);
  const effUts   = _effFor("uts",   45);
  const effUas   = _effFor("uas",   45);

  const fs = getFirestore();
  const rtdb = getDatabase();
  const courseSlug = courseId;  // visitors/<slug>/pertemuan-N pakai courseId yg sama

  try {
    // ── 1) TUGAS: baca poin modul 1..14 (RTDB visitors/<slug>/<seg>) ──
    // Segmen path beda per course: _segmentsForModul handle Opto/Getaran
    // (pertemuan-N, skip 8) vs Math4 (modul-N langsung).
    const modulPoints = {};  // nimKey → {1..14: points}
    for (let n = 1; n <= 14; n++) {
      const { db: dbSeg } = _segmentsForModul(courseId, n);
      const snap = await rtdb.ref(`visitors/${courseSlug}/${dbSeg}`).get();
      const node = snap.val() || {};
      for (const [key, rec] of Object.entries(node)) {
        if (!key.startsWith("mhs_") || !rec || typeof rec !== "object") continue;
        modulPoints[key] = modulPoints[key] || {};
        modulPoints[key][n] = Number(rec.points) || 0;
      }
    }

    // ── 2) EXAM (UTS/UAS): baca attempts per mahasiswa ──
    async function examEarned(examId, nimKey) {
      // return { earnedByQ: {qId: pts}, } berdasar correct/status × maks poin
      const order = OBE_ORDER[examId];
      const qsCol = fs.collection(`examAttempts/${examId}/students/${nimKey}/qs`);
      const docs = await qsCol.get();
      const att = {};
      docs.forEach(d => { att[d.id] = d.data() || {}; });
      const earned = {};
      order.forEach((qId, idx) => {
        const maxP = _examQPoints(examId, idx) ?? 0;
        const a = att[qId];
        if (!a) { earned[qId] = 0; return; }
        if (a.status === "correct" || a.correct === true) earned[qId] = maxP;
        else if (a.status === "partial") earned[qId] = (maxP >= 4 ? 1 : 0); // hard partial = 1
        else earned[qId] = 0;
      });
      return earned;
    }

    const scores = {};
    const missing = [];
    for (const nim of validNims) {
      // Key NIM beda format: modul/visitor pakai prefix "mhs_", examAttempts tanpa.
      const modulKey = sanitizeKey("mhs_" + nim);   // visitors/<...>/mhs_<NIM>
      const examKey = sanitizeKey(nim);             // examAttempts/<...>/students/<NIM>
      const out = { TGS:{}, UTS:{}, UAS:{} };

      // TUGAS — tiap kolom = rata-rata nilai modul (skala 100) sesuai mapping
      const mp = modulPoints[modulKey] || {};
      const tugas = {};  // 1..14 → skala 100
      for (let n = 1; n <= 14; n++) tugas[n] = Math.min(100, (mp[n] || 0) * 2);
      for (const [sub, mods] of Object.entries(effTugas)) {
        const vals = mods.map(m => tugas[m] || 0);
        out.TGS[sub] = vals.length ? Math.round((vals.reduce((a,b)=>a+b,0) / vals.length) * 100) / 100 : 0;
      }

      // UTS / UAS — tiap Sub-CPMK = Σ poin diperoleh / Σ poin maks (grup soal) × 100
      for (const [examId, key, effMap] of [[utsExamId,"UTS",effUts], [uasExamId,"UAS",effUas]]) {
        const order = OBE_ORDER[examId];
        let earned;
        try { earned = await examEarned(examId, examKey); }
        catch (e) { earned = null; }
        if (!earned) { missing.push(`${nim}/${key}`); continue; }
        for (const [sub, qNums] of Object.entries(effMap)) {
          let got = 0, max = 0;
          for (const q of qNums) {
            const qId = order[q-1];
            if (!qId) continue;
            got += earned[qId] || 0;
            max += _examQPoints(examId, q-1) ?? 0;
          }
          out[key][sub] = max > 0 ? Math.round((got / max) * 100 * 100) / 100 : 0;
        }
      }
      scores[nim] = out;
    }

    console.log("[computeObeScores]", courseId, "students:", validNims.length);
    return { courseId, scores, missing };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error("[computeObeScores] FAILED", e);
    throw new HttpsError("internal", `Compute gagal: ${e.message || e}`);
  }
});
