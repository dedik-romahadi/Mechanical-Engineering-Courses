# Deploy Cloud Functions — Validasi Exam Server-Side

Pilot scope: **Getaran Mekanik UTS**. Setelah stabil, akan di-extend ke exam lain.

## Prasyarat (sekali setup)

1. **Firebase project sudah Blaze plan** ✅ (sudah dikonfirmasi)
2. **Budget alert aktif** di Google Cloud Console > Billing > Budgets
   - Rekomendasi: budget 50.000 IDR/bulan, alert di 50%/90%/100%
3. **Firebase CLI terinstall** di mesin lokal Bapak:
   ```bash
   npm install -g firebase-tools
   ```
4. **Login & inisialisasi** (sekali):
   ```bash
   firebase login
   firebase use getaran-mekanik   # alias dari .firebaserc
   ```
5. **Aktifkan Firestore di project** (sekali, lewat Console):
   - Firebase Console → Firestore Database → Create database → mode "Production"
   - Pilih region **`asia-southeast1`** (sama dengan RTDB)

## Install dependency

```bash
cd functions
npm install
```

## Deploy commands

```bash
# Deploy hanya Cloud Functions:
firebase deploy --only functions

# Deploy hanya Firestore rules (saat update rules):
firebase deploy --only firestore:rules

# Deploy keduanya:
firebase deploy --only functions,firestore:rules
```

Deploy pertama akan butuh beberapa menit (Google Cloud build container).

## Verifikasi deploy

Setelah deploy sukses, cek di:
- Firebase Console → Functions → harus muncul `checkExamAnswer` dengan region `asia-southeast1`
- Firebase Console → Firestore → setelah Phase 2 (seed data), akan ada koleksi `examAnswers/` dan (saat ada attempt) `examAttempts/`

## Logs

```bash
firebase functions:log              # semua log
firebase functions:log --only checkExamAnswer
```

Atau cek di Firebase Console → Functions → Logs.

## Roadmap

- **Phase 1 (sekarang)**: Infrastructure — function deployed, Firestore rules aktif. ⏳ MENUNGGU DEPLOY.
- **Phase 2 (next)**: Extract kunci jawaban Getaran UTS → seed ke Firestore.
- **Phase 3**: Rewrite client-side di `Getaran-Mekanik/Exam/UTS.html`.
- **Phase 4 (kalau pilot OK)**: Extend ke UAS + 4 exam mata kuliah lain.

## Safety

- Function di-set `maxInstances: 10` (mencegah runaway scale)
- Memory 256MiB, timeout 10s (cost minimal per invocation)
- Free tier Blaze: 2 juta invocations/bulan — untuk skenario 30 mahasiswa × 33 soal = ~1.000 invocations/exam, sangat jauh di bawah limit
- Firestore rules `deny all` untuk `examAnswers` dan `examAttempts` → kunci jawaban tidak bisa dibaca client SDK
