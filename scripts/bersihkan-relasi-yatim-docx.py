#!/usr/bin/env python3
"""
Membuang relasi gambar yang menggantung pada modul Word.

Tiga belas modul Sistem Kendali Cerdas menyimpan relasi ke media yang tidak
ada di dalam arsipnya: word/_rels/document.xml.rels menyebut image8.png
sampai image12.png, sedangkan word/media hanya memuat image1 sampai image7.
Sisanya kemungkinan tertinggal ketika gambar diganti pada penyuntingan
sebelumnya.

Word tidak menampilkan gejala apa pun karena tidak satu pun rId itu dirujuk
dari document.xml — dokumennya tercetak normal. Namun python-docx memuat
seluruh bagian gambar begitu berkas dibuka, sehingga gagal dengan

    There is no item named 'word/media/image8.png' in the archive

Akibatnya skrip docx lain di repositori ini — render-notasi-docx.py,
nomor-objek-docx.py, perbarui-istilah-docx.py — tidak bisa dipakai untuk
Sistem Kendali Cerdas sama sekali.

Relasi yang dibuang hanya yang menunjuk berkas media tidak ada DAN tidak
dirujuk document.xml. Bila ada rujukan yang benar-benar dipakai, berkas
dilewati dan dilaporkan: membuang relasi semacam itu akan menghapus gambar
yang sungguh tampil.

Pakai:
    python scripts/bersihkan-relasi-yatim-docx.py --periksa
    python scripts/bersihkan-relasi-yatim-docx.py
    python scripts/bersihkan-relasi-yatim-docx.py <berkas>…
"""
import re
import sys
import zipfile
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
COURSES = ["Getaran-Mekanik", "Engineering-Mathematics",
           "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas"]

RELASI = re.compile(r"<Relationship\b[^>]*/>")


def olah(berkas, tulis):
    z = zipfile.ZipFile(berkas)
    isi = {n: z.read(n) for n in z.namelist()}
    info = {i.filename: i for i in z.infolist()}
    z.close()

    kunci_rels = "word/_rels/document.xml.rels"
    rels = isi[kunci_rels].decode("utf8")
    dokumen = isi["word/document.xml"].decode("utf8")
    media = {n.split("/")[-1] for n in isi if n.startswith("word/media/")}
    dirujuk = set(re.findall(r'r:(?:embed|link|id)="([^"]+)"', dokumen))

    yatim = []
    for el in RELASI.findall(rels):
        target = re.search(r'Target="(media/[^"]+)"', el)
        if not target or target.group(1).split("/")[-1] in media:
            continue
        rid = re.search(r'Id="([^"]+)"', el).group(1)
        if rid in dirujuk:
            return f"LEWAT  {rid} menunjuk media hilang TETAPI dipakai dokumen"
        yatim.append(el)

    if not yatim:
        return "SAMA   tidak ada relasi yatim"
    if not tulis:
        return f"UBAH   {len(yatim)} relasi yatim akan dibuang"

    bersih = rels
    for el in yatim:
        bersih = bersih.replace(el, "", 1)
    isi[kunci_rels] = bersih.encode("utf8")

    with zipfile.ZipFile(berkas, "w", zipfile.ZIP_DEFLATED) as keluar:
        for nama in info:
            keluar.writestr(info[nama], isi[nama])
    return f"OK     {len(yatim)} relasi yatim dibuang"


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith("--")]
    tulis = "--periksa" not in sys.argv[1:]
    berkas = ([Path(a) for a in argv] if argv else
              sorted(p for c in COURSES
                     for p in (AKAR / c / "Modul-Word").glob("*.docx")))
    rekap = {}
    for b in berkas:
        hasil = olah(b, tulis)
        kode = hasil.split()[0]
        rekap[kode] = rekap.get(kode, 0) + 1
        if kode not in ("SAMA",):
            print(f"  {hasil}  {b.name}")
    print("\n".join(f"{k}: {v}" for k, v in sorted(rekap.items())))


if __name__ == "__main__":
    main()
