# Deploy Cloud Functions — Validasi Exam Server-Side

Pilot scope: **Getaran Mekanik UTS** (45 soal / 70 poin — 10 TF + 20 MC + 10 Comp E/M + 5 Comp Hard).
Setelah stabil → extend ke UAS + 4 exam mata kuliah lain (lihat `EXAM_CONFIG` di `index.js`).

## Pilihan deploy method

- **Lokal (Firebase CLI)** — butuh `firebase login` + akses lancar ke Google services
- **GitHub Actions** — untuk situasi di mana akses Google diblok (mis. user di China, network restricted). Lihat `.github/workflows/firebase-deploy-pilot.yml`.

## Prasyarat (sekali setup)

1. **Firebase project Blaze plan** ✅ (sudah dikonfirmasi)
2. **Budget alert aktif** di Google Cloud Console > Billing > Budgets
   - Rekomendasi: budget 50.000 IDR/bulan, alert di 50%/90%/100%
3. **Firebase CLI terinstall** di mesin lokal:
   ```bash
   npm install -g firebase-tools
   ```
4. **Login & inisialisasi** (sekali):
   ```bash
   firebase login
   firebase use getaran-mekanik   # alias dari .firebaserc
   ```
5. **Aktifkan Firestore di project** (sekali, manual di Console):
   - Firebase Console → Firestore Database → **Create database**
   - Mode: **Production** (rules deny-all kita akan langsung aktif)
   - Region: **`asia-southeast1`** (Jakarta — sama dgn RTDB & Functions)

## Install dependency

```bash
cd functions
npm install
```

## Deploy commands

```bash
# Langkah 1 — deploy rules dulu (deny-all utk client, sebelum data ada):
firebase deploy --only firestore:rules

# Langkah 2 — seed answer keys Getaran UTS:
npm run seed          # menjalankan functions/seed/seed-firestore.js

# Langkah 3 — deploy function:
firebase deploy --only functions

# Atau gabungan (rules + functions, tanpa seed):
firebase deploy --only functions,firestore:rules
```

Deploy pertama akan butuh beberapa menit (Cloud Build container untuk Node 20).

## Verifikasi deploy

- Firebase Console → **Functions** → harus muncul `checkExamAnswer` (region `asia-southeast1`, memory 256MiB, timeout 10s, max 10 instances)
- Firebase Console → **Firestore** → koleksi `examAnswers/getaran-mekanik-uts/qs/` (setelah seed) dan `examAttempts/...` (setelah ada attempt)
- **Smoke test**: panggil function dari client dgn payload valid → cek log `firebase functions:log --only checkExamAnswer`

## Schema answer keys (Firestore)

Path: `examAnswers/{examId}/qs/{qId}` — readable hanya oleh admin SDK (deny-all utk client).

```json
// TF (True/False)
{ "type": "tf", "answer": true, "points": 1, "explain": "..." }

// MC (Multiple Choice)
{ "type": "mc", "correctIdx": 2, "points": 1, "explain": "..." }

// Comp (computational, Easy/Medium)
{ "type": "comp", "answer": 20.0, "tolerance": 0.05, "points": 2, "explain": "..." }

// Comp Hard (with partial credit)
{ "type": "comp", "answer": 0.0729, "tolerance": 0.005, "points": 4,
  "allowPartial": true, "partialPoints": 1, "explain": "..." }
```

## Marker konvensi (sync dengan client UTS.html)

Disimpan di RTDB `visitors/.../scoredQuestions` (CSV string):

| Tipe + Outcome      | Marker                       | Poin                          |
|---------------------|------------------------------|-------------------------------|
| TF benar            | `tf1`                        | `points × multiplier`         |
| TF salah            | `tf1_tf_used`                | 0                             |
| MC benar            | `mc1`                        | `points × multiplier`         |
| MC salah            | `mc1_mc_used`                | 0                             |
| Comp benar          | `c1_comp`                    | `points × multiplier`         |
| Comp Hard partial   | `c11_comp_partial`           | `partialPoints × multiplier`  |
| Comp salah          | `c1_comp_used`               | 0                             |
| Konsolasi           | (tidak ada marker khusus)    | `+consolationPoint`           |

**Late multiplier** (default 0.8) hanya berlaku di window `(end, end+extension]`.
Setelah `end + extension`, `_isScheduleOpen=false` → semua submit DITOLAK (HttpsError `failed-precondition`).

**Partial credit Comp Hard** TIDAK diberikan saat late window (mirror client `_awardCompPartial`).

**Konsolasi** diberikan otomatis di RTDB transaction saat: ≥30 distinct base-ID attempted, `points === 0`, dan `consolationAwarded !== true`. One-time.

## Logs

```bash
firebase functions:log                          # semua log
firebase functions:log --only checkExamAnswer
```

Atau cek di Firebase Console → Functions → Logs.

## Roadmap

- **Phase 1 (✅ done)**: Infrastructure — function deployed, Firestore rules aktif.
- **Phase 2 (sekarang)**: Extract kunci jawaban Getaran UTS → seed ke Firestore.
- **Phase 3**: Rewrite client-side di `Getaran-Mekanik/Exam/UTS.html` (panggil callable).
- **Phase 4 (pilot OK)**: Extend ke UAS + 4 exam mata kuliah lain (tambah entry di `EXAM_CONFIG`).
- **Phase 5 (kalau Exam stabil)**: Pertimbangkan rollout ke Tugas (Modul 1-14).

## Safety

- Function di-set `maxInstances: 10` (cegah runaway scale)
- Memory 256MiB, timeout 10s (cost minimal per invocation)
- Free tier Blaze: 2 juta invocations/bulan — untuk 30 mahasiswa × 45 soal = ~1.350 invocations/exam, jauh di bawah limit
- Firestore rules `deny all` untuk `examAnswers` dan `examAttempts` → kunci jawaban tidak bisa dibaca client SDK
- PinHash validasi: 64 hex chars (SHA-256). Format invalid → reject `invalid-argument`
- NIM validasi: max 20 char alphanumeric setelah sanitize → reject `invalid-argument`
- Schedule gate server-authoritative: client tidak bisa spoof `lateMultiplier`
