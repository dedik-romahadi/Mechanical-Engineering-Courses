# Data halaman UAS Pemodelan CAD (dipakai scripts/cad-exam/bangun.py uas).
#
# Bentuk ujian dikunci dosen dan SUDAH ter-seed di backend:
#   31 soal = 20 pilihan ganda (mc1..mc20, posisi 1-20)
#           + 10 tugas unggah sub-model (c1..c10, posisi 21-30)
#           + 1 tugas unggah rakitan (c11, posisi 31)
# Kesepuluh sub-model adalah komponen SATU produk — kompresor torak mini satu
# silinder "KT-40" — dan c11 merakitnya di Assembly Workbench.
# Tidak ada soal benar-salah dan tidak ada editor kode Python.

SUMBER = "Teknik-Tenaga-Listrik/Exam/UAS.html"
TUJUAN = "Pemodelan-Computer-Aided-Design/Exam/UAS.html"

EXAM_ID = "pemodelan-cad-uas"
JENIS = "uas"                    # segmen RTDB: visitors/pemodelan_cad/uas
PRE = "UAS"
LABEL = "UAS"
NAMA_PANJANG = "Ujian Akhir Semester"
JUDUL = "UAS — Ujian Akhir Semester | Pemodelan CAD"
UNDUHAN = "UAS_PemodelanCAD_"

N_MC = 20
N_TUGAS = 10                     # c1..c10 (sub-model KT-40)
RAKITAN = "c11"                  # tugas rakitan, bobot tipe 6
N_SOAL = N_MC + N_TUGAS + 1      # 31
N_BAGIAN = 3

DURASI = "180 menit + perpanjangan 120 menit"
PENALTI = "35 persen"
MASA_UJIAN = "5–18 Januari 2027"
BOBOT_SIA = "23%"
CAKUPAN = "Modul 8 hingga Modul 12 (Sub-CPMK 3.1–4.2)"

BOBOT = {"3.1": 5, "3.2": 5, "3.3": 5, "4.1": 4, "4.2": 4}
MAPPING = {
    "3.1": [1, 2, 3, 4, 5, 21, 22],
    "3.2": [6, 7, 8, 9, 10, 23, 24],
    "3.3": [11, 12, 13, 14, 25, 26, 27],
    "4.1": [15, 16, 28, 31],
    "4.2": [17, 18, 19, 20, 29, 30],
}
URUTAN = [f"mc{i}" for i in range(1, 21)] + [f"c{i}" for i in range(1, 11)] + ["c11"]


# Bobot tipe soal (cermin _qTypeWeightByIdx): PG 1, sub-model 2, rakitan 6.
def bobot_tipe(idx0):
    if idx0 < 20:
        return 1
    return 2 if idx0 < 30 else 6


BARIS_OBE = [
    ("3.1", "5%", "Q1-5, Q21-22", "Modul 8 — simulasi kinerja komponen"),
    ("3.2", "5%", "Q6-10, Q23-24", "Modul 9 — evaluasi hasil simulasi"),
    ("3.3", "5%", "Q11-14, Q25-27", "Modul 10 — optimasi desain pasca-simulasi"),
    ("4.1", "4%", "Q15-16, Q28, Q31", "Modul 11 — perakitan komponen &amp; analisis sistem"),
    ("4.2", "4%", "Q17-20, Q29-30", "Modul 12 — identifikasi masalah desain"),
]

HERO_SUB = (
    "Ujian komprehensif materi <strong>Modul 8 hingga Modul 12</strong> (Sub-CPMK 3.1–4.2), yakni simulasi "
    "kinerja komponen, evaluasi hasil simulasi dan analisis kekuatan, optimasi desain pasca-simulasi, "
    "perakitan komponen, hingga identifikasi masalah desain. Dua puluh soal pilihan ganda, sepuluh tugas "
    "sub-model komponen <strong>kompresor torak mini satu silinder KT-40</strong>, dan satu tugas merakit "
    "kesepuluhnya menjadi satu rakitan di Assembly Workbench. Seluruh dimensi dihitung dari "
    "<strong>2 digit terakhir NIM</strong> Anda, sehingga model setiap mahasiswa berbeda."
)

KARTU_PETUNJUK = [
    ("🅐", "Bagian A — Pilihan Ganda",
     "<strong>20 soal pilihan ganda.</strong> Pilih satu jawaban dari 4 opsi (A, B, C, D). Poin per soal "
     "proporsional bobot Sub-CPMK. Urutan opsi diacak per NIM, jadi huruf jawaban teman Anda tidak berlaku "
     "untuk Anda. Sekali submit, jawaban dikunci."),
    ("🅑", "Bagian B — Sub-Model KT-40",
     "<strong>10 tugas sub-model.</strong> Kesepuluhnya adalah komponen satu produk: kompresor torak mini satu "
     "silinder <strong>KT-40</strong>. Modelkan sesuai dimensi NIM Anda, simpan sebagai <code>.FCStd</code>, "
     "<strong>unggah berkasnya</strong>, lalu isikan satu angka bacaan. Server menolak angka bila berkas belum "
     "terunggah, dan memberi <strong>partial credit</strong> bila berkas ada tetapi angkanya meleset."),
    ("🅒", "Bagian C — Rakitan KT-40",
     "<strong>1 tugas rakitan.</strong> Rakit kesepuluh sub-model Bagian B menjadi satu rakitan KT-40 di "
     "Assembly Workbench, lalu unggah dokumen rakitannya beserta angka bacaan yang diminta. Ini soal bernilai "
     "tertinggi di ujian (bobot tipe 6 lawan 2 untuk sub-model)."),
]

BAGIAN_A_DESC = (
    "Pilih satu jawaban dari 4 opsi (A, B, C, D). Soal teori menguji pemahaman simulasi, optimasi, dan "
    "perakitan di FreeCAD; soal berhitung memiliki nilai opsi yang dihitung dari NIM Anda, jadi opsi Anda "
    "berbeda dari mahasiswa lain."
)
BAGIAN_B_JUDUL = "Sub-Model KT-40<br><em style=\"color:var(--amber)\">10 Komponen Kompresor</em>"
BAGIAN_B_DESC = (
    "Sepuluh tugas ini bukan latihan lepas: kesepuluhnya adalah komponen <strong>satu produk</strong>, yaitu "
    "kompresor torak mini satu silinder <strong>KT-40</strong> — pelat dasar, blok bantalan, bus bantalan, "
    "poros engkol, pelat engkol, pin penghubung, batang penghubung, torak, silinder/liner, dan tiang penyangga. "
    "Tugas terakhir (Bagian C) merakit kesepuluhnya menjadi satu rakitan, jadi kerjakan setiap komponen dengan "
    "sumbu lubang atau sumbu putarnya di titik asal supaya perakitannya lancar. Untuk tiap tugas: kerjakan di "
    "FreeCAD 1.0, simpan lewat <strong>Ctrl+S</strong> sebagai <code>.FCStd</code> (bukan Export), unggah "
    "berkasnya, lalu salin angka bacaan yang diminta."
)

BAGIAN_C = {
    "judul": "Tugas Rakitan<br><em style=\"color:var(--pink)\">Kompresor KT-40</em>",
    "label": "Bagian C",
    "desc": (
        "Rakit kesepuluh komponen Bagian B menjadi satu rakitan kompresor torak mini KT-40 di Assembly "
        "Workbench: pelat dasar (grounded) → blok bantalan → bus → poros engkol (Revolute) → pelat engkol → "
        "pin engkol → batang penghubung (Revolute) → pin torak → torak → Slider di dalam liner → tiang "
        "penyangga → kembali ke pelat dasar. Muka atas pelat dasar adalah bidang z = 0 rakitan. Unggah dokumen "
        "rakitannya lalu isikan angka bacaan yang diminta. <strong>Soal bernilai tertinggi</strong> di ujian ini."
    ),
}

PENUTUP = (
    "Periksa kembali semua jawaban di panel nilai atas. Pastikan kesepuluh sub-model dan rakitan KT-40 sudah "
    "punya <strong>berkas .FCStd terunggah</strong> beserta angka bacaannya. Klik "
    "<strong>📄 Export HTML</strong> untuk mengunduh laporan resmi UAS yang menjadi bukti pengerjaan."
)
