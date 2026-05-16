# Deploy Cloud Functions — Validasi Exam Server-Side

Pilot scope: **Getaran Mekanik UTS**. Setelah stabil, akan di-extend ke exam lain.

## Status Phase

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **Phase 1** | Infrastructure: Cloud Function shell, Firestore rules deny-all | ✅ Done (#195) |
| **Phase 2** | Server-side data: `exam-data/getaran-uts.js` (45 soal + compute(N) + verify) | ✅ Done — `getExamPresentation` & `checkExamAnswer` callable; kunci jawaban TIDAK pernah di-return ke client |
| **Phase 3** | Client refactor: hapus kunci dari `Getaran-Mekanik/Exam/UTS.html`; ganti `checkMC`/`checkTF`/`runAndCheck` ke `httpsCallable` | ⏳ Belum mulai (next PR) |
| **Phase 4** | Audit & deploy to production, test end-to-end dengan NIM dummy | ⏳ |
| **Phase 5** | Rollout ke UAS Getaran + 4 exam mata kuliah lain | ⏳ |

## Prasyarat (sekali setup)

1. **Firebase project sudah Blaze plan** ✅
2. **Firestore database created** (Production mode, region `asia-southeast2` / Jakarta) ✅
3. **Budget alert aktif** di Google Cloud Console > Billing > Budgets — rekomendasi 50.000 IDR/bulan
4. **Firebase CLI** terinstall di mesin lokal:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use getaran-mekanik
   ```

## Install dependency

```bash
cd functions
npm install
```

## Test lokal (sebelum deploy)

Saat baru menambah/edit `exam-data/`, jalankan smoke test untuk validasi compute & verifyAnswer:

```bash
cd functions
node exam-data/test-getaran-uts.js
```

Output yang diharapkan: `PASS: 853    FAIL: 0   All checks passed.`

Test ini cek:
- Semua 45 qId terdaftar (10 TF + 20 MC + 10 Comp Easy + 5 Comp Hard)
- `verifyAnswer()` di boundary N = 0, 25, 50, 75, 99 untuk setiap soal
- `getMCOptions()` return 4 elemen dengan exactly 1 correct di setiap N
- Shuffle deterministik (call ke-2 sama dengan call ke-1)
- Edge case: NaN input → `correct: false` (bukan exception)

## Deploy commands

```bash
# Phase 2: deploy function update (sekaligus push exam-data/)
firebase deploy --only functions

# Deploy Firestore rules (sudah aktif sejak Phase 1, hanya saat update rules):
firebase deploy --only firestore:rules

# Deploy keduanya:
firebase deploy --only functions,firestore:rules
```

Deploy pertama akan butuh beberapa menit (Google Cloud build container).

## Verifikasi deploy

Setelah deploy sukses, cek di Firebase Console:
- **Functions**: harus muncul DUA callable di region `asia-southeast1`:
  - `getExamPresentation`
  - `checkExamAnswer`
- **Firestore**: `examAttempts/{examId}/students/{nimKey}/qs/{qId}` akan otomatis ter-buat saat ada request

## Logs

```bash
firebase functions:log
firebase functions:log --only checkExamAnswer
firebase functions:log --only getExamPresentation
```

Atau cek di Firebase Console → Functions → Logs.

## API Contract (untuk Phase 3 client refactor)

### `getExamPresentation`
```js
// Request
{ examId: "getaran-mekanik-uts", nim: "41421010050", pinHash: "<64-char hex>" }

// Response
{
  N: 50,
  scoreTotal: 70,
  questions: [
    { id: "tf1", type: "tf", modul: 1, points: 1, parametric: false },
    { id: "tf4", type: "tf", modul: 2, points: 1, parametric: true },
    { id: "mc1", type: "mc", modul: 1, points: 1, parametric: false,
      options: ["Perpindahan (mm)", "Kecepatan (mm/s)", "Percepatan (m/s²)", "Tekanan (Pa)"] },
    { id: "mc3", type: "mc", modul: 1, points: 1, parametric: true,
      options: ["X rad/s", "Y rad/s", "Z rad/s", "W rad/s"] },  // shuffled per-N
    { id: "c1", type: "comp", category: "easy", modul: 1, points: 2, parametric: true, tolerance: 0.05 },
    { id: "c11", type: "comp", category: "hard", modul: 3, points: 4, parametric: true, tolerance: 0.005 },
    // ... 45 total
  ]
}
```

**Client tanggung jawab:** render text soal + diagram menggunakan `compute_presentation(N)` lokal (yang akan dibuat di Phase 3 — versi stripped dari compute() lama, TANPA field answer/correctIdx/explain). `options` array untuk MC HARUS pakai response server (jangan generate client-side).

### `checkExamAnswer`
```js
// Request — TF
{ examId: "getaran-mekanik-uts", qId: "tf4", userAnswer: true,
  nim: "41421010050", pinHash: "...", lateMultiplier: 1.0 }

// Request — MC (userAnswer = index 0..3 di shuffled options yang DILIHAT mahasiswa)
{ examId: "...", qId: "mc5", userAnswer: 2, nim: "...", pinHash: "...", lateMultiplier: 1.0 }

// Request — Comp (userAnswer = nilai numerik hasil komputasi)
{ examId: "...", qId: "c1", userAnswer: 31.42, nim: "...", pinHash: "...", lateMultiplier: 1.0 }

// Response — sukses
{ correct: true, scoreDelta: 1, alreadyAnswered: false }
// atau:
{ correct: false, scoreDelta: 0, alreadyAnswered: false }
// atau (sudah pernah submit):
{ correct: true, scoreDelta: 0, alreadyAnswered: true }
```

**Yang TIDAK PERNAH di-return:**
- `explain` — kunci konseptual disembunyikan dari mahasiswa selama dan setelah exam (per aturan UTS-Murni §27.7)
- `correctAnswer` / `correctIdx` / `expected` — kunci jawaban itu sendiri
- `tolerance` (untuk comp) — tidak perlu di-return; sudah dikirim di `getExamPresentation`

## Safety

- Function di-set `maxInstances: 10` (mencegah runaway scale)
- Memory 256MiB, timeout 10s
- Free tier Blaze: 2 juta invocations/bulan — skenario 30 mahasiswa × 45 soal = ~1.350 invocations/exam → sangat jauh di bawah limit
- Firestore rules `deny all` untuk `examAttempts` → log audit tidak bisa dibaca client SDK
- **Kunci jawaban TIDAK ada di Firestore sama sekali** (Phase 2 arsitektur). Source of truth = code module `exam-data/getaran-uts.js`. Untuk update jawaban, edit file → re-deploy. Untuk update tanpa redeploy (future): pindahkan ke Firestore + tambah override layer.

## Tambah Exam Baru (Phase 5)

1. Buat `functions/exam-data/<exam-id>.js` dengan struktur yang sama (TF_QUESTIONS, MC_QUESTIONS, COMP_EZ_QUESTIONS, COMP_HARD_QUESTIONS + export `getNFromNim`, `getQuestionMeta`, `getMCOptions`, `verifyAnswer`, `listAllQuestionIds`, `SCORE_TOTAL`)
2. Buat smoke test `functions/exam-data/test-<exam-id>.js` (copy dari `test-getaran-uts.js`, sesuaikan jumlah soal)
3. Tambahkan entry di `EXAM_REGISTRY` di `index.js`:
   ```js
   "math4-uts": { dbPath: "visitors/math4/uts", data: require("./exam-data/math4-uts") },
   ```
4. Run smoke test, deploy.
