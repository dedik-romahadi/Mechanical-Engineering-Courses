#!/usr/bin/env python3
"""
Menyeragamkan dan merapikan panel "Modul Interaktif" pada modul Word.

Panel ini memuat tautan modul interaktif beserta keterangan Mode Preview.
Sebelumnya bentuknya tidak seragam: 42 modul Getaran Mekanik, Matematika 4,
dan Optimalisasi & Otomasi memakai kotak hijau satu paragraf, sedangkan 13
modul Sistem Kendali Cerdas kehilangan kotaknya sama sekali dan Modul 1
Sisken punya kotak tetapi seluruh teksnya menumpuk pada satu run sehingga
tautannya tidak biru, tidak bergaris bawah, dan tidak dapat diklik.

Susunannya juga padat: label, tautan, dan keterangan berdesakan dalam satu
alinea rata kiri-kanan sehingga tautan yang panjang sulit dipindai mata.

Panel dibangun ulang menjadi dua paragraf yang berbagi pengaturan garis dan
arsiran yang sama, sehingga Word maupun LibreOffice menggambarnya sebagai
satu kotak utuh:

    🔗 MODUL INTERAKTIF          ← label kecil, spasi huruf renggang
    https://…/Modul-2.html       ← tautan, biru, bergaris bawah, dapat diklik
    Pada layar masuk, …          ← keterangan, abu-abu, ukuran lebih kecil

Aksen tebal di tepi kiri menggantikan kotak bergaris seragam; sisi lain
dibuat tipis agar panel terasa ringan dan tidak bersaing dengan panel judul
bagian yang berwarna biru tua.

Isi keterangan tidak diubah. Yang berubah hanya dua hal kecil: titik pemisah
setelah tautan dihapus karena keterangan kini berdiri sebagai kalimat sendiri,
dan label "Modul Interaktif:" ditulis "MODUL INTERAKTIF" mengikuti panel judul
bagian lain di dokumen yang memang memakai huruf besar (PENDAHULUAN, DAFTAR
PUSTAKA).

Pakai:
    python scripts/panel-modul-interaktif-docx.py --periksa   # laporan saja
    python scripts/panel-modul-interaktif-docx.py             # tulis perubahan
    python scripts/panel-modul-interaktif-docx.py <berkas>…   # berkas tertentu
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

AKAR = Path(__file__).resolve().parent.parent
COURSES = ["Getaran-Mekanik", "Engineering-Mathematics",
           "Optimalisasi-dan-Automasi", "Sistem-Kendali-Cerdas"]

AKSEN = "1F7A55"      # hijau tua untuk aksen kiri dan label
GARIS = "BFE3D0"      # hijau muda untuk sisi tipis
LATAR = "F1FAF5"      # arsiran panel
TAUTAN = "0563C1"     # biru tautan bawaan Word
BADAN = "44525F"      # abu-abu kebiruan untuk keterangan

ARIAL = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'


def _bingkai():
    """Garis panel: aksen tebal di kiri, sisi lain tipis.

    Keempat sisi harus identik pada semua paragraf panel. Word dan
    LibreOffice hanya menyatukan paragraf berurutan menjadi satu kotak bila
    pengaturan garisnya persis sama; begitu sisi atas atau bawah dibedakan,
    keduanya digambar sebagai dua kotak terpisah dengan celah di tengah.
    """
    sisi = [
        f'<w:top w:val="single" w:sz="6" w:space="10" w:color="{GARIS}"/>',
        f'<w:left w:val="single" w:sz="24" w:space="12" w:color="{AKSEN}"/>',
        f'<w:bottom w:val="single" w:sz="6" w:space="10" w:color="{GARIS}"/>',
        f'<w:right w:val="single" w:sz="6" w:space="10" w:color="{GARIS}"/>',
    ]
    return "<w:pBdr>" + "".join(sisi) + "</w:pBdr>"


def _pPr(before, after):
    return ("<w:pPr>" + _bingkai()
            + f'<w:shd w:val="clear" w:fill="{LATAR}"/>'
            + f'<w:spacing w:before="{before}" w:after="{after}" w:line="264" w:lineRule="auto"/>'
            + '<w:ind w:left="170" w:right="170"/>'
            + '<w:jc w:val="left"/></w:pPr>')


def _run(teks, rpr):
    return f"<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space=\"preserve\">{escape(teks)}</w:t></w:r>"


def bangun(url, ekor, rid):
    """XML dua paragraf yang membentuk satu panel."""
    label = (ARIAL + "<w:b/><w:i w:val=\"0\"/>"
             + f'<w:color w:val="{AKSEN}"/><w:sz w:val="17"/>'
             + '<w:spacing w:val="30"/>')
    tautan = (ARIAL + "<w:b/>" + f'<w:color w:val="{TAUTAN}"/>'
              + '<w:sz w:val="20"/><w:u w:val="single"/>')
    badan = (ARIAL + "<w:b w:val=\"0\"/><w:i w:val=\"0\"/>"
             + f'<w:color w:val="{BADAN}"/><w:sz w:val="19"/>')

    p1 = ("<w:p>" + _pPr(140, 60)
          + _run("🔗 MODUL INTERAKTIF", label)
          + "<w:r><w:br/></w:r>"
          + f'<w:hyperlink r:id="{rid}">'
          + _run(url, tautan) + "</w:hyperlink></w:p>")
    p2 = ("<w:p>" + _pPr(0, 140)
          + _run(ekor, badan) + "</w:p>")
    return p1 + p2


POLA = re.compile(r"^\s*🔗\s*MODUL INTERAKTIF\s*:?\s*"
                  r"(https?://\S+?\.html)\s*\.?\s*(.*)$", re.S | re.I)


def polos(p):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", p)).strip()


def bagian(dokumen):
    """Paragraf pembentuk panel, baik bentuk lama maupun yang sudah dirapikan.

    Bentuk lama satu paragraf; bentuk baru dua paragraf berurutan. Pencarian
    memakai huruf besar-kecil bebas supaya pemeriksaan tetap mengenali panel
    yang labelnya sudah diubah menjadi MODUL INTERAKTIF.
    """
    ps = re.findall(r"<w:p[ >].*?</w:p>", dokumen, re.S)
    # Dijangkarkan pada emoji rantai di awal paragraf. Kata "modul interaktif"
    # juga muncul di bagian Tugas ("dikerjakan pada halaman modul interaktif"),
    # jadi pencocokan kata saja akan menangkap paragraf yang salah.
    idx = [i for i, p in enumerate(ps)
           if polos(p).startswith("🔗") and "modul interaktif" in polos(p).lower()]
    if len(idx) != 1:
        return None
    i = idx[0]
    # Sudah dirapikan bila paragraf memakai arsiran panel yang baru dan
    # paragraf sesudahnya melanjutkan panel yang sama.
    if LATAR in ps[i] and i + 1 < len(ps) and LATAR in ps[i + 1]:
        return ps[i:i + 2]
    return ps[i:i + 1]


def rid_tautan(rels, url):
    """rId relasi hyperlink yang menunjuk url; None bila belum ada."""
    for rid, target in re.findall(r'Id="([^"]+)"[^>]*Target="([^"]*)"', rels):
        if target == url:
            return rid
    return None


def olah(berkas, tulis):
    z = zipfile.ZipFile(berkas)
    isi = {n: z.read(n) for n in z.namelist()}
    info = {i.filename: i for i in z.infolist()}
    z.close()

    dokumen = isi["word/document.xml"].decode("utf8")
    rels = isi["word/_rels/document.xml.rels"].decode("utf8")

    blok = bagian(dokumen)
    if not blok:
        return "LEWAT  paragraf panel tidak ditemukan atau lebih dari satu"
    lama = "".join(blok)
    teks = " ".join(polos(p) for p in blok)

    cocok = POLA.match(teks)
    if not cocok:
        return "LEWAT  susunan teks tidak dikenali"
    url, ekor = cocok.group(1), cocok.group(2).strip()

    rid = rid_tautan(rels, url)
    if rid is None:
        return "LEWAT  relasi hyperlink untuk url tidak ada"

    baru = bangun(url, ekor, rid)
    if lama == baru:
        return "SAMA   sudah sesuai"
    if not tulis:
        return "UBAH   akan dirapikan"

    isi["word/document.xml"] = dokumen.replace(lama, baru, 1).encode("utf8")

    cadangan = berkas.with_suffix(".docx.bak")
    shutil.copy2(berkas, cadangan)
    with zipfile.ZipFile(berkas, "w", zipfile.ZIP_DEFLATED) as keluar:
        for nama in info:
            keluar.writestr(info[nama], isi[nama])
    cadangan.unlink()
    return "OK     dirapikan"


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith("--")]
    tulis = "--periksa" not in sys.argv[1:]
    if argv:
        berkas = [Path(a) for a in argv]
    else:
        berkas = sorted(p for c in COURSES
                        for p in (AKAR / c / "Modul-Word").glob("*.docx"))
    rekap = {}
    for b in berkas:
        hasil = olah(b, tulis)
        rekap[hasil.split()[0]] = rekap.get(hasil.split()[0], 0) + 1
        if not hasil.startswith(("SAMA", "OK")):
            print(f"  {hasil}  {b.relative_to(AKAR)}")
    print("\n".join(f"{k}: {v}" for k, v in sorted(rekap.items())))


if __name__ == "__main__":
    main()
