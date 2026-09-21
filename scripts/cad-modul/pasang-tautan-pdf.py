#!/usr/bin/env python3
"""
Mengisi MODUL_PDF_URL/MODUL_PDF_FILENAME pada halaman modul Pemodelan CAD agar
tombol "Export PDF" mengunduh Modul-Word/Modul-N-<judul>.pdf, sama seperti
halaman modul course lain. Sekalian menghapus penanda "Versi Word/PDF Modul N
Pemodelan CAD belum dibuat" yang ditulis pembangun halaman selama dokumennya
memang belum ada. Idempoten; jalankan setelah buat-modul-word.py + docx-ke-pdf.py,
dan setiap kali halaman dibangun ulang bangun-modul-1.py/bangun.py.

Pakai:
    python scripts/cad-modul/pasang-tautan-pdf.py            # semua modul yang PDF-nya ada
    python scripts/cad-modul/pasang-tautan-pdf.py --periksa  # laporan saja
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pustaka import nama_berkas_word  # noqa: E402

AKAR = Path(__file__).resolve().parent.parent.parent
KURSUS = AKAR / "Pemodelan-Computer-Aided-Design"
PENANDA = re.compile(r"// Versi Word/PDF Modul \d+ Pemodelan CAD belum dibuat[^\n]*")


def main():
    periksa = "--periksa" in sys.argv
    ubah = sama = lewat = 0
    for html in sorted(KURSUS.glob("Modul/Modul-*.html"), key=lambda p: int(re.search(r"\d+", p.name).group())):
        n = int(re.search(r"Modul-(\d+)", html.name).group(1))
        s = html.read_text(encoding="utf-8", newline="")
        judul = re.search(r"<title>Modul \d+ — (.*?) \| ", s).group(1)
        nama = nama_berkas_word(n, judul)
        if not (KURSUS / "Modul-Word" / f"{nama}.pdf").exists():
            lewat += 1
            continue
        baru = PENANDA.sub(f"// Tautan Modul-Word/PDF Modul {n} Pemodelan CAD; diisi scripts/cad-modul/pasang-tautan-pdf.py.", s, count=1)
        baru = re.sub(r"const MODUL_PDF_URL = '[^']*';", f"const MODUL_PDF_URL = '../Modul-Word/{nama}.pdf';", baru, count=1)
        baru = re.sub(r"const MODUL_PDF_FILENAME = '[^']*';", f"const MODUL_PDF_FILENAME = '{nama}.pdf';", baru, count=1)
        if baru == s:
            sama += 1
            continue
        ubah += 1
        if not periksa:
            html.write_text(baru, encoding="utf-8", newline="")
        print(f"  {'UBAH' if not periksa else 'AKAN'}  {html.relative_to(AKAR)} -> {nama}.pdf")
    print(f"diubah {ubah}, sudah sesuai {sama}, tanpa PDF {lewat}")


if __name__ == "__main__":
    main()
