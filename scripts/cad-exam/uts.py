# Data halaman UTS Pemodelan CAD (dipakai scripts/cad-exam/bangun.py uts).
#
# Bentuk ujian dikunci dosen dan SUDAH ter-seed di backend:
#   30 soal = 20 pilihan ganda (mc1..mc20, posisi 1-20)
#           + 10 tugas unggah model (c1..c10, posisi 21-30)
# Tidak ada soal benar-salah dan tidak ada editor kode Python.
# Bobot/pemetaan Sub-CPMK harus sama persis dengan OBE_EXAM_CONFIG
# ["pemodelan-cad-uts"] di backend functions/index.js.

SUMBER = "Teknik-Tenaga-Listrik/Exam/UTS.html"
TUJUAN = "Pemodelan-Computer-Aided-Design/Exam/UTS.html"

EXAM_ID = "pemodelan-cad-uts"
JENIS = "uts"                    # segmen RTDB: visitors/pemodelan_cad/uts
PRE = "UTS"                      # awalan pengenal JS pada kerangka
LABEL = "UTS"
NAMA_PANJANG = "Ujian Tengah Semester"
JUDUL = "UTS — Ujian Tengah Semester | Pemodelan CAD"
UNDUHAN = "UTS_PemodelanCAD_"

N_MC = 20
N_TUGAS = 10                     # c1..c10
RAKITAN = None                   # UTS tanpa tugas rakitan
N_SOAL = N_MC + N_TUGAS          # 30
N_BAGIAN = 2

DURASI = "180 menit + perpanjangan 120 menit"
PENALTI = "35 persen"
MASA_UJIAN = "3–16 November 2026"
BOBOT_SIA = "22%"
CAKUPAN = "Modul 3 hingga Modul 7 (Sub-CPMK 2.1–2.5)"

# Bobot & pemetaan OBE (cermin OBE_EXAM_CONFIG backend).
BOBOT = {"2.1": 4, "2.2": 4, "2.3": 4, "2.4": 4, "2.5": 6}
MAPPING = {
    "2.1": [1, 2, 3, 4, 21, 22],
    "2.2": [5, 6, 7, 8, 23, 24],
    "2.3": [9, 10, 11, 12, 25, 26],
    "2.4": [13, 14, 15, 16, 27, 28],
    "2.5": [17, 18, 19, 20, 29, 30],
}
URUTAN = [f"mc{i}" for i in range(1, 21)] + [f"c{i}" for i in range(1, 11)]

# Bobot tipe soal (cermin _qTypeWeightByIdx): PG 1, tugas unggah 2.
def bobot_tipe(idx0):
    return 1 if idx0 < 20 else 2


BARIS_OBE = [
    ("2.1", "4%", "Q1-4, Q21-22", "Modul 3 — gambar 2D Draft"),
    ("2.2", "4%", "Q5-8, Q23-24", "Modul 4 — dimensi, anotasi, TechDraw"),
    ("2.3", "4%", "Q9-12, Q25-26", "Modul 5 — Pad, Revolution, Pipe, Pocket"),
    ("2.4", "4%", "Q13-16, Q27-28", "Modul 6 — pandangan, proyeksi, potongan"),
    ("2.5", "6%", "Q17-20, Q29-30", "Modul 7 — gabungan 2D+3D, pola, Clone"),
]

HERO_SUB = (
    "Ujian komprehensif materi <strong>Modul 3 hingga Modul 7</strong> (Sub-CPMK 2.1–2.5), yakni gambar 2D "
    "Draft, dimensi dan anotasi TechDraw, pemodelan 3D berbasis sketsa, sudut pandang dan proyeksi, hingga "
    "proyek gabungan 2D+3D dengan pola dan Clone. Dua puluh soal pilihan ganda dan sepuluh tugas pemodelan: "
    "modelkan di <strong>FreeCAD 1.0</strong>, unggah dokumen <code>.FCStd</code>, lalu isikan satu angka "
    "bacaan geometri. Seluruh dimensi tugas dihitung dari <strong>2 digit terakhir NIM</strong> Anda, sehingga "
    "model setiap mahasiswa berbeda."
)

# Kartu petunjuk (ikon, judul, isi).
KARTU_PETUNJUK = [
    ("🅐", "Bagian A — Pilihan Ganda",
     "<strong>20 soal pilihan ganda.</strong> Pilih satu jawaban dari 4 opsi (A, B, C, D). Poin per soal "
     "proporsional bobot Sub-CPMK. Urutan opsi diacak per NIM, jadi huruf jawaban teman Anda tidak berlaku "
     "untuk Anda. Sekali submit, jawaban dikunci."),
    ("🅑", "Bagian B — Tugas Pemodelan",
     "<strong>10 tugas pemodelan FreeCAD.</strong> Setiap tugas: modelkan sesuai dimensi milik NIM Anda, "
     "simpan sebagai <code>.FCStd</code>, <strong>unggah berkasnya</strong>, lalu isikan satu angka bacaan "
     "(luas, keliling, volume, atau panjang kotak batas). Server menolak angka bila berkas belum terunggah, "
     "dan memberi <strong>partial credit</strong> bila berkas sudah ada tetapi angkanya meleset."),
]

BAGIAN_A_DESC = (
    "Pilih satu jawaban dari 4 opsi (A, B, C, D). Soal teori menguji pemahaman perintah dan konsep FreeCAD; "
    "soal berhitung memiliki nilai opsi yang dihitung dari NIM Anda, jadi opsi Anda berbeda dari mahasiswa lain."
)
BAGIAN_B_JUDUL = "Tugas Pemodelan<br><em style=\"color:var(--amber)\">10 Model FreeCAD</em>"
BAGIAN_B_DESC = (
    "Sepuluh tugas pemodelan dengan dimensi milik NIM Anda. Untuk setiap tugas: kerjakan di FreeCAD 1.0, simpan "
    "lewat <strong>Ctrl+S</strong> sebagai dokumen <code>.FCStd</code> (bukan Export), unggah berkasnya pada "
    "kartu soal, lalu salin angka bacaan yang diminta ke kolom angka. Berkas adalah bukti pengerjaan yang "
    "diperiksa dosen; angkanya diperiksa server dengan toleransi."
)

# Bagian rakitan hanya ada di UAS.
BAGIAN_C = None

PENUTUP = (
    "Periksa kembali semua jawaban di panel nilai atas. Pastikan setiap tugas pemodelan sudah punya "
    "<strong>berkas .FCStd terunggah</strong> dan angka bacaannya terkirim. Klik <strong>📄 Export HTML</strong> "
    "untuk mengunduh laporan resmi UTS yang menjadi bukti pengerjaan."
)
