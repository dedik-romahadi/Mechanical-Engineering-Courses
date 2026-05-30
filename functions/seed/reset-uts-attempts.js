#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Reset SEMUA attempt records UTS Getaran di Firestore.
 *
 * Hapus collection `examAttempts/getaran-mekanik-uts/students/*\/qs/*`.
 * RTDB visitor records TIDAK disentuh — pakai panel "Reset Mahasiswa"
 * atau Firebase Console untuk itu.
 *
 * SETELAH JALAN, mahasiswa bisa attempt ulang semua soal seolah pertama
 * kali (server tidak lagi return alreadyAnswered=true).
 *
 * USAGE (dari direktori `functions/`):
 *
 *   # Dry-run (preview, tidak hapus):
 *   node seed/reset-uts-attempts.js --dry-run
 *
 *   # Live reset (hapus beneran):
 *   node seed/reset-uts-attempts.js --confirm
 *
 * Auth sama dengan seed-firestore.js (ADC atau service account key).
 *
 * ⚠ DESTRUCTIVE — semua attempt history hilang permanen. Audit trail
 * (correct/wrong/timestamp/codePreview untuk soal Comp) ikut terhapus.
 */

const EXAM_ID = "getaran-mekanik-uts";
const DRY_RUN = process.argv.includes("--dry-run");
const CONFIRM = process.argv.includes("--confirm");

async function main() {
  if (!DRY_RUN && !CONFIRM) {
    console.error("❌ Pakai --dry-run untuk preview, atau --confirm untuk reset beneran.");
    console.error("   Tanpa flag, script tidak melakukan apa-apa (safety).");
    process.exit(1);
  }

  const admin = require("firebase-admin");
  admin.initializeApp({ projectId: "getaran-mekanik" });
  const fs = admin.firestore();

  const studentsRef = fs.collection(`examAttempts/${EXAM_ID}/students`);
  console.log(`📋 Listing students under examAttempts/${EXAM_ID}/students/...`);
  const studentsSnap = await studentsRef.listDocuments();
  console.log(`   Found ${studentsSnap.length} students.`);

  if (studentsSnap.length === 0) {
    console.log("✓ Tidak ada attempt yang perlu di-reset.");
    process.exit(0);
  }

  let totalAttempts = 0;
  const studentSummaries = [];

  for (const studentDoc of studentsSnap) {
    const qsRef = studentDoc.collection("qs");
    const qsSnap = await qsRef.listDocuments();
    totalAttempts += qsSnap.length;
    studentSummaries.push({ nim: studentDoc.id, qsCount: qsSnap.length });
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${studentsSnap.length} students, ${totalAttempts} total attempt docs`);
  if (studentSummaries.length <= 20) {
    studentSummaries.forEach((s) => console.log(`   - ${s.nim}: ${s.qsCount} attempts`));
  } else {
    studentSummaries.slice(0, 10).forEach((s) => console.log(`   - ${s.nim}: ${s.qsCount} attempts`));
    console.log(`   ... and ${studentSummaries.length - 10} more`);
  }

  if (DRY_RUN) {
    console.log(`\n🔍 DRY-RUN — tidak ada penghapusan. Jalankan dengan --confirm untuk eksekusi.`);
    process.exit(0);
  }

  console.log(`\n🗑  Menghapus ${totalAttempts} attempt docs...`);
  let deleted = 0;
  for (const studentDoc of studentsSnap) {
    const qsRef = studentDoc.collection("qs");
    const qsSnap = await qsRef.listDocuments();
    // Batch delete (max 500 per batch)
    for (let i = 0; i < qsSnap.length; i += 400) {
      const batch = fs.batch();
      qsSnap.slice(i, i + 400).forEach((d) => batch.delete(d));
      await batch.commit();
      deleted += Math.min(400, qsSnap.length - i);
      process.stdout.write(`\r   Deleted: ${deleted}/${totalAttempts}`);
    }
    // Delete the student doc itself (empty container)
    await studentDoc.delete();
  }
  console.log(`\n✅ Selesai. ${deleted} attempt docs + ${studentsSnap.length} student containers dihapus.`);
  console.log(`\nNext: pastikan RTDB visitors juga di-reset (kalau belum), lalu mahasiswa hard refresh.`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
