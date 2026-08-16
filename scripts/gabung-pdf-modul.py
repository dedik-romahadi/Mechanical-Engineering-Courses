#!/usr/bin/env python3
"""
Merakit ulang berkas unduhan gabungan dari PDF modul per pertemuan.

Unduhan-Gabungan/Modul-Gabungan-*.pdf adalah rangkaian Modul 1..14 sebuah mata
kuliah. Begitu PDF per modul diperbarui, berkas gabungannya ikut basi.

Gambar di dalamnya diturunkan resolusinya seperti berkas gabungan sebelumnya:
rangkaian mentah 14 modul berukuran ±20 MB, terlalu berat sebagai satu unduhan
mahasiswa. Sasarannya ±100 dpi, cukup tajam dibaca di layar tetapi jauh lebih
ringan; berkas per modul di Modul-Word tetap beresolusi penuh untuk dicetak.

Pakai:
    python scripts/gabung-pdf-modul.py
"""
import re
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


def urutan_ujian(p: Path) -> tuple:
    """UTS lebih dahulu, baru UAS — urutan berjalannya semester."""
    return (0 if p.name.upper().startswith("UTS") else 1, p.name)


def rakit(sumber, keluaran, satuan):
    """Gabungkan PDF sumber menjadi satu berkas unduhan yang sudah diringankan."""
    if not sumber:
        print(f"  {keluaran.name}: tidak ada PDF sumber, dilewati")
        return
    # Hanya merakit berkas yang memang sudah disediakan sebelumnya; mata
    # kuliah tanpa unduhan gabungan tidak dibuatkan yang baru diam-diam.
    if not keluaran.exists():
        print(f"  {keluaran.name}: belum punya berkas gabungan, dilewati")
        return
    lama_kb = keluaran.stat().st_size // 1024
    doc = fitz.open()
    for p in sumber:
        with fitz.open(p) as s:
            doc.insert_pdf(s)
    doc.rewrite_images(dpi_target=DPI_SASARAN, dpi_threshold=DPI_AMBANG, quality=MUTU_JPEG)
    doc.subset_fonts()
    halaman = doc.page_count
    doc.save(str(keluaran), garbage=4, deflate=True, clean=True)
    doc.close()
    print(f"  {keluaran.relative_to(AKAR)}: {len(sumber)} {satuan}, {halaman} halaman, "
          f"{lama_kb} KB -> {keluaran.stat().st_size // 1024} KB")


def main() -> None:
    for direktori, nama in KURSUS:
        rakit(sorted((AKAR / direktori / "Exam").glob("*.pdf"), key=urutan_ujian),
              TUJUAN / f"Exam-Gabungan-{nama}.pdf", "berkas ujian")
    for direktori, nama in KURSUS:
        sumber = sorted((AKAR / direktori / "Modul-Word").glob("Modul-*.pdf"), key=nomor_modul)
        keluaran = TUJUAN / f"Modul-Gabungan-{nama}.pdf"
        if not sumber:
            print(f"  {nama}: tidak ada PDF modul, dilewati")
            continue
        # Hanya merakit berkas yang memang sudah disediakan sebelumnya; mata
        # kuliah tanpa unduhan gabungan tidak dibuatkan yang baru diam-diam.
        if not keluaran.exists():
            print(f"  {nama}: belum punya berkas gabungan, dilewati")
            continue
        lama_kb = keluaran.stat().st_size // 1024
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
