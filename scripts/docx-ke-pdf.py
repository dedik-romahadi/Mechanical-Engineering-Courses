#!/usr/bin/env python3
"""
Membuat ulang PDF modul dari berkas .docx memakai LibreOffice.

PDF yang sudah ada di repositori juga dihasilkan LibreOffice, jadi konversi
lewat alat yang sama menjaga tata letak, font, dan jumlah halamannya tetap
sepadan dengan berkas lama.

Pakai:
    python scripts/docx-ke-pdf.py                 # hanya docx yang berubah (git)
    python scripts/docx-ke-pdf.py --semua         # seluruh docx modul & exam
    python scripts/docx-ke-pdf.py <berkas.docx>…  # daftar berkas tertentu
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
SOFFICE = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")


def daftar_berubah():
    """Berkas .docx yang berubah menurut git (staged maupun belum)."""
    keluar = subprocess.run(
        ["git", "diff", "--name-only", "HEAD", "--", "*.docx"],
        cwd=AKAR, capture_output=True, text=True, check=True).stdout
    return [AKAR / b for b in keluar.split("\n") if b.strip().endswith(".docx")]


def konversi(berkas):
    """Konversi sekumpulan docx menjadi PDF di sebelah berkas asalnya."""
    if not SOFFICE.exists():
        raise SystemExit(f"LibreOffice tidak ditemukan di {SOFFICE}")
    berhasil = 0
    # Profil pengguna sementara supaya konversi tidak bentrok dengan sesi
    # LibreOffice yang mungkin sedang dibuka dosen.
    with tempfile.TemporaryDirectory() as profil:
        url = Path(profil).as_uri()
        for p in berkas:
            hasil = subprocess.run(
                [str(SOFFICE), "--headless", f"-env:UserInstallation={url}",
                 "--convert-to", "pdf", "--outdir", str(p.parent), str(p)],
                capture_output=True, text=True)
            pdf = p.with_suffix(".pdf")
            if hasil.returncode == 0 and pdf.exists():
                berhasil += 1
                print(f"  {p.relative_to(AKAR)} -> {pdf.stat().st_size // 1024} KB")
            else:
                print(f"  GAGAL {p.relative_to(AKAR)}: {hasil.stderr.strip()[:120]}")
    return berhasil


def main():
    argumen = [a for a in sys.argv[1:] if not a.startswith("--")]
    if argumen:
        berkas = [Path(a) if Path(a).is_absolute() else AKAR / a for a in argumen]
    elif "--semua" in sys.argv:
        berkas = sorted(AKAR.glob("*/Modul-Word/*.docx")) + sorted(AKAR.glob("*/Exam/*.docx"))
    else:
        berkas = daftar_berubah()
    if not berkas:
        print("Tidak ada docx yang perlu dikonversi.")
        return
    print(f"Mengonversi {len(berkas)} docx ...")
    n = konversi(berkas)
    print(f"{n} PDF diperbarui.")


if __name__ == "__main__":
    main()
