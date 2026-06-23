/* eslint-disable max-len */
/**
 * optoauto-modul-12 — answer-key metadata.
 *
 * Source of truth untuk kunci jawaban (server-side validation via
 * checkModulAnswer). Modul-12 = monitoring produksi (alarm management,
 * keandalan, OEE, redundansi) — DIBEDAKAN dari Modul-11 (fondasi monitoring).
 *
 * Format: MC entries pakai letter answer (A/B/C/D), Comp pakai numeric answer +
 * tolerance. Explain WAJIB ada (modul reveal jawaban setelah submit untuk
 * pembelajaran formative).
 */

const MC = [
  { qId: "mc1", type: "mc", points: 1, answer: "B", explain: "<strong>Alarm rationalization</strong> adalah tahap inti ANSI/ISA 18.2: tiap alarm di-review agar <em>unik, actionable, terprioritisasi, dan terdokumentasi</em> (setpoint, konsekuensi, waktu respons). Alarm yang tidak memerlukan aksi operator dihapus → menekan nuisance alarm &amp; alarm flood. (A) salah — justru mengurangi. (C) salah — bukan ML. (D) salah — bukan menonaktifkan buta." },
  { qId: "mc2", type: "mc", points: 1, answer: "C", explain: "<strong>Alarm flood</strong> = &gt; 10 alarm ter-annunciate dalam 10 menit per operator. Operator overwhelmed → ignore alarm → safety risk. Mitigasi: rationalization, shelving, suppression (parent/child). (A)/(D) justru target normal. (B) tidak terkait laju." },
  { qId: "mc3", type: "mc", points: 1, answer: "A", explain: "<strong>Availability</strong> = fraksi waktu mesin siap operasi = <code>MTBF / (MTBF + MTTR)</code>. MTBF (Mean Time Between Failures) = uptime rata-rata; MTTR (Mean Time To Repair) = downtime rata-rata. Mendekati 1 bila MTBF ≫ MTTR. (B)/(C)/(D) tidak berdimensi benar." },
  { qId: "mc4", type: "mc", points: 1, answer: "D", explain: "<strong>2oo3 voting</strong> (API 670 / IEC 61508 SIL): keluaran diambil bila minimal 2 dari 3 sensor sepakat. Tahan 1 sensor gagal (fail-safe) DAN menahan false trip (1 sensor noise tak cukup). Keandalan R_sys = 3R²−2R³. (C) itu 3oo3 (tidak toleran gagal)." },
  { qId: "mc5", type: "mc", points: 1, answer: "B", explain: "<strong>Shelving</strong> = operator menunda alarm yang sudah diketahui (mis. sedang diperbaiki) untuk sementara; auto-unshelve setelah timeout. Beda dari <em>suppression</em> (by-design, otomatis) dan penghapusan permanen. Mengurangi gangguan saat maintenance tanpa kehilangan alarm selamanya." },
  { qId: "mc6", type: "mc", points: 1, answer: "C", explain: "<strong>OEE</strong> = <code>Availability × Performance × Quality</code> (ketiganya fraksi 0–1). World-class ≈ 85%. Mengukur kerugian dari downtime (A), speed loss (P), dan defect (Q) sekaligus. Penjumlahan (A) salah secara dimensi." },
  { qId: "mc7", type: "mc", points: 1, answer: "B", explain: "<strong>Prioritisasi</strong> berbasis matriks: severity konsekuensi (safety &gt; lingkungan &gt; ekonomi) × waktu tersedia untuk merespons → priority (low/medium/high/critical). Memastikan alarm critical menonjol dan distribusi prioritas sehat (mis. piramida: banyak low, sedikit critical)." },
  { qId: "mc8", type: "mc", points: 1, answer: "A", explain: "<strong>TSDB</strong> dioptimasi untuk append-heavy time-series: partisi waktu (hypertable), continuous aggregate untuk downsampling (mis. 1 Hz → 1 menit), kompresi kolumnar, dan retention policy otomatis. Jauh lebih efisien dari RDBMS biasa atau spreadsheet untuk jutaan row/hari." },
  { qId: "mc9", type: "mc", points: 1, answer: "D", explain: "<strong>Edge computing</strong>: proses di dekat sensor (PLC/gateway) → latency rendah (&lt; 100 ms), kirim hanya fitur (RMS/alarm) bukan raw stream (hemat bandwidth), dan tetap berfungsi offline. Cloud dipakai untuk agregasi/analitik jangka panjang. (A)/(C) kebalikannya." },
  { qId: "mc10", type: "mc", points: 1, answer: "C", explain: "<strong>Alarm KPI</strong> (ANSI/ISA 18.2 / EEMUA 191): average annunciated alarm rate (target ≤ 1/10 menit), jumlah standing (stale) alarm, % waktu dalam flood, distribusi prioritas, dan top-10 most-frequent alarms. Dipakai untuk continuous improvement sistem alarm." }
];

const COMP_EZ = [
  { qId: "c1", type: "comp", points: 2, answer: 96.1538, tolerance: 0.1, explain: "<code>200/(200+8)×100 = 96.15%</code>. MTBF ≫ MTTR → availability tinggi. Target world-class umumnya ≥ 99%." },
  { qId: "c2", type: "comp", points: 2, answer: 144, tolerance: 0.5, explain: "<code>6 alarm/jam × 24 jam = 144 alarm/hari</code>. Lebih dari ini berisiko alarm flood &amp; alarm fatigue." },
  { qId: "c3", type: "comp", points: 2, answer: 84.645, tolerance: 0.1, explain: "<code>0.90×0.95×0.99×100 = 84.65%</code>. Di bawah world-class (85%) — peluang perbaikan terbesar pada Availability." },
  { qId: "c4", type: "comp", points: 2, answer: 0.972, tolerance: 0.01, explain: "<code>3(0.81)−2(0.729) = 2.43−1.458 = 0.972</code>. Voting 2oo3 menaikkan keandalan dari 0.9 → 0.972 (toleran 1 sensor gagal)." },
  { qId: "c5", type: "comp", points: 2, answer: 2000, tolerance: 1, explain: "<code>10000/5 = 2000 jam</code>. MTBF = rata-rata waktu antar kegagalan; makin besar = makin andal." },
  { qId: "c6", type: "comp", points: 2, answer: 2, tolerance: 0.5, explain: "Yang &gt; 30: 45 dan 120 → <strong>2</strong>. Standing/stale alarm = alarm aktif lama tanpa di-clear, indikator masalah kronis." },
  { qId: "c7", type: "comp", points: 2, answer: 60, tolerance: 0.5, explain: "<code>3600/60 = 60 titik</code>. Continuous aggregate TSDB memadatkan data tanpa kehilangan tren — hemat storage &amp; mempercepat query dashboard." },
  { qId: "c8", type: "comp", points: 2, answer: 43.8, tolerance: 0.5, explain: "<code>8760×0.005 = 43.8 jam/tahun</code>. \"Error budget\" downtime; melebihinya berarti melanggar SLA availability." },
  { qId: "c9", type: "comp", points: 2, answer: 3, tolerance: 0.5, explain: "'C' muncul 3× → <strong>3</strong>. Distribusi prioritas dipantau agar tidak terlalu banyak Critical (over-prioritization menumpulkan urgensi)." },
  { qId: "c10", type: "comp", points: 2, answer: 76, tolerance: 0.1, explain: "<code>(500−120)/500×100 = 76%</code>. Rationalization efektif memangkas nuisance alarm secara drastis." }
];

const COMP_HARD = [
  { qId: "c11", type: "comp", points: 4, answer: 95.9488, tolerance: 1, allowPartial: true, partialPoints: 1, explain: "MTBF = mean(100,150,200) = 150; MTTR = mean(5,8,6) = 6.33; <code>150/156.33×100 ≈ 95.95%</code>. Estimasi availability langsung dari log kejadian nyata." },
  { qId: "c12", type: "comp", points: 4, answer: 0.9719, tolerance: 0.02, allowPartial: true, partialPoints: 1, explain: "Teoritis R_sys = 3(0.9²)−2(0.9³) = 0.972. Simulasi seed=42 → ≈ 0.9719, konvergen ke teori. Monte Carlo berguna saat formula analitik sulit." },
  { qId: "c13", type: "comp", points: 4, answer: 22, tolerance: 4, allowPartial: true, partialPoints: 1, explain: "Geser window 600 detik dan hitung kepadatan alarm; maksimum ≈ 22 (&gt; 10 → kondisi flood). Inti deteksi flood ANSI/ISA 18.2 dari log alarm." },
  { qId: "c14", type: "comp", points: 4, answer: 77.2615, tolerance: 3, allowPartial: true, partialPoints: 1, explain: "OEE dari rata-rata 30 hari ≈ 77.3%. Tracking OEE harian mengungkap loss dominan (Availability/Performance/Quality) untuk prioritas perbaikan." },
  { qId: "c15", type: "comp", points: 4, answer: 3.0903, tolerance: 1.5, allowPartial: true, partialPoints: 1, explain: "Downtime ≈ 3.09% (mendekati parameter 3%). Availability = 100 − 3.09 = 96.91%. Pipeline produksi: dari stream status → KPI availability real-time." }
];

const MODUL_QUESTIONS = [...MC, ...COMP_EZ, ...COMP_HARD];

const SUMMARY = {
  "modulId": "optoauto-modul-12",
  "totalSoal": 25,
  "totalPoin": 50,
  "breakdown": {
    "mc": 10,
    "compEz": 10,
    "compHard": 5
  }
};

module.exports = { MODUL_QUESTIONS, SUMMARY };
