#!/usr/bin/env python3
"""
Merakit ulang berkas unduhan gabungan dari PDF modul per pertemuan.

Unduhan-Gabungan/Modul-Gabungan-*.pdf adalah rangkaian Modul 1..14 sebuah mata
kuliah. Begitu PDF per modul diperbarui, berkas gabungannya ikut basi.

Hanya modul yang dirakit di sini. Naskah ujian tidak: dokumen itu berkepala
"SOAL INI BERSIFAT RAHASIA — HARUS DIKEMBALIKAN" dan tempatnya di repo backend
yang privat, sedangkan repositori ini publik dan seluruh isi Unduhan-Gabungan
ikut ter-deploy ke GitHub Pages. Exam-Gabungan-*.pdf karena itu tidak lagi
dirakit di sini, dan validate-public-security.mjs menolak build bila berkas
semacam itu muncul kembali.

Gambar di dalamnya diturunkan resolusinya seperti berkas gabungan sebelumnya:
rangkaian mentah 14 modul berukuran ±20 MB, terlalu berat sebagai satu unduhan
mahasiswa. Sasarannya ±100 dpi, cukup tajam dibaca di layar tetapi jauh lebih
ringan; berkas per modul di Modul-Word tetap beresolusi penuh untuk dicetak.

Berkas gabungan yang belum ada tidak dibuat diam-diam: mata kuliah baru harus
diminta secara tegas lewat --buat-baru, supaya unduhan baru tidak muncul di
situs hanya karena skrip ini kebetulan dijalankan.

Pakai:
    python scripts/gabung-pdf-modul.py
    python scripts/gabung-pdf-modul.py --buat-baru
"""
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

AKAR = Path(__file__).resolve().parent.parent
TUJUAN = AKAR / "Unduhan-Gabungan"

DPI_SASARAN = 100      # resolusi gambar setelah dirapikan
DPI_AMBANG = 115       # gambar di bawah ambang ini dibiarkan apa adanya
MUTU_JPEG = 72

# Nama berkas gabungan mengikuti nama mata kuliah yang dipakai dosen, bukan
# nama direktori repositori.
KURSUS = [
    ("Getaran-Mekanik", "Getaran-Mekanik"),
    ("Engineering-Mathematics", "Matematika-4"),
    ("Optimalisasi-dan-Automasi", "Optimalisasi-dan-Otomasi"),
    ("Sistem-Kendali-Cerdas", "Sistem-Kendali-Cerdas"),
]


def nomor_modul(p: Path) -> int:
    m = re.search(r"Modul-(\d+)", p.name)
    return int(m.group(1)) if m else 999


def main() -> None:
    buat_baru = "--buat-baru" in sys.argv[1:]
    for direktori, nama in KURSUS:
        sumber = sorted((AKAR / direktori / "Modul-Word").glob("Modul-*.pdf"), key=nomor_modul)
        keluaran = TUJUAN / f"Modul-Gabungan-{nama}.pdf"
        if not sumber:
            print(f"  {nama}: tidak ada PDF modul, dilewati")
            continue
        # Hanya merakit berkas yang memang sudah disediakan sebelumnya; mata
        # kuliah tanpa unduhan gabungan tidak dibuatkan yang baru diam-diam.
        if not keluaran.exists() and not buat_baru:
            print(f"  {nama}: belum punya berkas gabungan, dilewati "
                  f"(pakai --buat-baru bila memang ingin dibuat)")
            continue
        lama_kb = keluaran.stat().st_size // 1024 if keluaran.exists() else 0
        doc = fitz.open()
        for p in sumber:
            with fitz.open(p) as s:
                doc.insert_pdf(s)
        doc.rewrite_images(dpi_target=DPI_SASARAN, dpi_threshold=DPI_AMBANG, quality=MUTU_JPEG)
        doc.subset_fonts()
        halaman = doc.page_count
        doc.save(str(keluaran), garbage=4, deflate=True, clean=True)
        doc.close()
        print(f"  {keluaran.relative_to(AKAR)}: {len(sumber)} modul, {halaman} halaman, "
              f"{lama_kb} KB -> {keluaran.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
