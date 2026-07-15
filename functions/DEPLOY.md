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
- **Phase 2 (✅ done)**: Extract kunci jawaban Getaran UTS → seed ke Firestore (45 docs).
- **Phase 3 (✅ done)**: Refactor client `Getaran-Mekanik/Exam/UTS.html` → panggil callable.
  - Feature flag `USE_SERVER_VALIDATION` di top file (default `true`).
  - Saat `true`: checkTF/checkMC/runAndCheck panggil server; award/record functions jadi no-op.
  - Saat `false`: fallback ke logika client lama (kunci jawaban di `window._utsAnswerKeys`).
  - Rollback emergency: flip flag → commit → deploy HTML (tidak perlu redeploy function).
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

## Export Verification Code (`generateExportCode` / `verifyExportCode`)

File "Export HTML" (tombol 📄 di tab Hasil setiap Modul) di-generate 100%
client-side dan bisa diedit manual (tidak ada proteksi bawaan). Untuk
mendeteksi (bukan mencegah) edit tsb, tiap export sekarang membawa kode
verifikasi pendek = `HMAC-SHA256(EXPORT_CODE_SECRET, modulId|nim|points|
generatedAt)`. Dosen bisa cocokkan kode via `Admin/verify-export-code.html`.

**Kenapa perlu secret terpisah (bukan hardcode di `functions/index.js`
seperti `ADMIN_PW_HASH`)**: repo ini public (GitHub Pages) — `ADMIN_PW_HASH`
aman di-expose karena itu HASH satu arah (tidak bisa dibalik jadi password
asli), tapi HMAC secret adalah **kunci mentah** — siapa pun yang punya
string-nya bisa forge kode valid sendiri. Kalau di-hardcode di source, fitur
ini jadi percuma (mahasiswa tinggal baca `functions/index.js` di GitHub).
Makanya secret disimpan di **Firebase Secret Manager** via `defineSecret`,
tidak pernah masuk git.

### Setup sekali saja (sebelum deploy_functions pertama kali)

1. Generate secret acak, mis.:
   ```bash
   openssl rand -hex 32
   ```
2. Simpan sbg GitHub Actions secret:
   Repo → Settings → Secrets and variables → Actions → New repository secret
   Name: `EXPORT_CODE_SECRET_VALUE`, Value: hasil langkah 1.
3. Jalankan workflow "Firebase Deploy Exam (multi-course)" **sekali** dengan
   input `set_export_secret = true` (boleh dibarengkan dengan
   `deploy_functions = true` di run yang sama) — ini push nilai secret dari
   GitHub Actions ke Firebase Secret Manager via
   `firebase functions:secrets:set EXPORT_CODE_SECRET`.
4. Service Account (`FIREBASE_SA_KEY`) butuh role tambahan
   **Secret Manager Admin** (`roles/secretmanager.admin`) di IAM — kalau step
   `set_export_secret` gagal dgn `PERMISSION_DENIED`, tambahkan role ini dulu.

Setelah secret ter-set, deploy `deploy_functions` berikutnya tinggal berjalan
normal — Cloud Functions v2 otomatis fetch secret dari Secret Manager saat
runtime, tidak perlu di-set ulang tiap deploy. Kalau mau rotate secret,
ulangi langkah 1-3 dgn value baru (kode verifikasi lama otomatis jadi
invalid — tidak masalah, karena verifikasi cuma dipakai retroaktif kalau
dosen curiga, bukan proses rutin).

### Cara pakai (dosen)

- Mahasiswa export HTML seperti biasa (tombol 📄 Export HTML) — sekarang ada
  kotak "🔐 Kode Verifikasi" berisi Kode, Poin (server), dan waktu dibuat.
- Kalau curiga file sudah diedit, buka `Admin/verify-export-code.html`,
  salin ke-4 nilai itu persis dari file export + password admin → submit.
  Server re-hitung HMAC dari field yang disubmit dan cocokkan ke kode.

### Cakupan: Modul DAN Exam (UTS/UAS)

`generateExportCode`/`verifyExportCode` menerima `modulId` ATAU `examId`
(di-resolve dari MODUL_CONFIG lalu EXAM_CONFIG). Poin exam bisa float
(proporsional bobot Sub-CPMK) — dibulatkan 2 desimal SEBELUM di-hash supaya
angka yang tertera di file & yang diketik ulang dosen saat verifikasi identik.
Di `Admin/verify-export-code.html`, pilih "UTS"/"UAS" di dropdown modul.

### Catatan regression fix EXAM_CONFIG (penting)

Saat menambahkan dukungan exam, ditemukan bahwa entry `EXAM_CONFIG` di
`functions/index.js` kehilangan SEMUA field path/scoring (`dbPath`,
`schedulePath`, `totalPoints`, `consolationThreshold`, `consolationPoint`,
`lateMultiplierValue`) yang dibaca `checkExamAnswer` & `recomputeExamPoints` —
kemungkinan tertimpa saat refactor bobot OBE (entry hanya berisi
`bobot`/`mapping`, yang justru tidak pernah dibaca fungsi mana pun). Efek:
`evalSchedule` menerima path `undefined` → baca ROOT database →
"schedule-incomplete" → semua submit exam DITOLAK. Field di-restore via loop
augmentasi tepat di bawah object `EXAM_CONFIG` — kalau menambah exam baru,
cukup tambah entry `bobot`/`mapping`, field path terisi otomatis dari pola
`<course>-uts|uas`.
