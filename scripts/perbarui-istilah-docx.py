#!/usr/bin/env python3
"""
Menyelaraskan istilah pada modul versi Word dengan halaman HTML-nya.

Halaman modul sudah diseragamkan (sampling/sampel menggantikan cuplik/cacah,
filter menggantikan tapis/penapis, dan em dash prosa menjadi kata penghubung),
tetapi berkas .docx dibuat lebih dahulu sehingga masih memakai istilah lama.
Skrip ini menyunting teks di dalam .docx TANPA menyentuh format, gambar, atau
tata letaknya: hanya isi simpul <w:t> yang diubah.

Penggantian dilakukan sadar-run. Word memecah satu kalimat menjadi banyak
<w:t> (revisi, pemeriksa ejaan), sehingga "cuplikan" bisa tersimpan sebagai
"cup" + "likan". Skrip menyusun teks gabungan seluruh simpul, mencocokkan pola
di sana, lalu menuliskan hasilnya kembali ke simpul yang bersangkutan —
format teks di sekitarnya tetap utuh.

Pakai:
    python scripts/perbarui-istilah-docx.py            # semua docx modul & exam
    python scripts/perbarui-istilah-docx.py --periksa  # laporan saja, tanpa tulis
"""
import re
import shutil
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent

# Bagian dokumen yang memuat teks tampilan. Header/footer ikut supaya istilah
# pada kop halaman tidak tertinggal versi lama.
BAGIAN = re.compile(r"^word/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$")

# Urutan penting: frasa panjang lebih dahulu agar tidak dipotong aturan pendek.
ISTILAH = [
    # "Cuplikan Cell 1" berarti POTONGAN KODE, bukan sampel sinyal. Aturannya
    # harus mendahului aturan sampling di bawah supaya tidak salah terjemah.
    ("Cuplikan kode", "Potongan kode"), ("cuplikan kode", "potongan kode"),
    ("Cuplikan inti Cell", "Potongan inti Cell"), ("cuplikan inti Cell", "potongan inti Cell"),
    ("Cuplikan Cell", "Potongan Cell"), ("cuplikan Cell", "potongan Cell"),
    ("Pencuplikan", "Sampling"), ("pencuplikan", "sampling"),
    ("Periode Cuplik", "Periode Sampling"), ("periode cuplik", "periode sampling"),
    ("frekuensi cuplikan", "frekuensi sampling"), ("frekuensi cuplik", "frekuensi sampling"),
    ("indeks cuplikan", "indeks sampel"), ("antar-cuplikan", "antar-sampel"),
    ("selang cuplikan", "selang sampling"), ("aturan cuplikan", "aturan sampling"),
    ("Dicuplik", "Di-sampling"), ("dicuplik", "di-sampling"),
    ("mencuplik", "mengambil sampel dari"),
    ("Cuplikan", "Sampel"), ("cuplikan", "sampel"),
    ("Cuplik", "Sampling"), ("cuplik", "sampling"),
    ("WAKTU CACAH", "WAKTU SAMPLING"),  # judul bab ditulis huruf besar semua
    ("Waktu cacah", "Waktu sampling"), ("waktu cacah", "waktu sampling"),
    ("keteraturan cacah", "keteraturan sampling"),
    ("selang antarcacah", "selang antar-sampling"),
    ("tambahan per cacah", "tambahan per langkah sampling"),
    ("pada cacah saat ini", "pada langkah sampling saat ini"),
    ("satu cacah", "satu langkah sampling"),
    ("beberapa cacah", "beberapa langkah sampling"),
    ("Penapisan", "Pemfilteran"), ("penapisan", "pemfilteran"),
    ("Penapis", "Filter"), ("penapis", "filter"),
    ("ditapis", "difilter"), ("menapis", "memfilter"), ("tertapis", "terfilter"),
    ("Tapis", "Filter"), ("tapis", "filter"),
]

# Em dash prosa: yang diikuti huruf kecil adalah sambungan kalimat. Yang
# diikuti huruf besar/angka adalah pemisah label ("Sub-CPMK 3.2 — Merancang",
# "• Melupakan anti-windup — Actuator ...") dan sengaja dipertahankan.
EM_PROSA = re.compile(r"\s*—\s*(?=[a-zà-ÿ])")


# Hanya simpul teks yang dicocokkan. Batas kata wajib: tanpa itu pola juga
# menyambar <w:tab/>, <w:tc>, dan <w:tbl> sehingga tag ikut terbaca sebagai
# teks dan dokumennya rusak saat ditulis ulang.
SIMPUL_TEKS = re.compile(r"(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)", re.S)


def ganti_sadar_run(xml: str, pakai_em: bool = True):
    """Terapkan seluruh aturan pada teks gabungan <w:t>, lalu tulis kembali."""
    simpul = [(m.start(1), m.end(1), m.start(2), m.end(2), m.group(1), m.group(2))
              for m in SIMPUL_TEKS.finditer(xml)]
    if not simpul:
        return xml, 0
    penuh = "".join(s[5] for s in simpul)

    suntingan = []  # (mulai, akhir, teks_baru)
    for lama, baru in ISTILAH:
        for m in re.finditer(re.escape(lama), penuh):
            suntingan.append((m.start(), m.end(), baru))
    if pakai_em:
        for m in EM_PROSA.finditer(penuh):
            suntingan.append((m.start(), m.end(), ", "))

    # Buang tumpang tindih: aturan yang lebih awal (frasa panjang) menang.
    suntingan.sort(key=lambda e: (e[0], -(e[1] - e[0])))
    bersih, batas = [], -1
    for e in suntingan:
        if e[0] >= batas:
            bersih.append(e)
            batas = e[1]
    if not bersih:
        return xml, 0

    # Peta indeks global -> simpul.
    awal_simpul, pos = [], 0
    for teks in (s[5] for s in simpul):
        awal_simpul.append(pos)
        pos += len(teks)

    teks_simpul = [s[5] for s in simpul]

    def cari_simpul(g):
        lo, hi = 0, len(awal_simpul) - 1
        while lo < hi:
            tengah = (lo + hi + 1) // 2
            if awal_simpul[tengah] <= g:
                lo = tengah
            else:
                hi = tengah - 1
        return lo

    for mulai, akhir, baru in reversed(bersih):
        i0 = cari_simpul(mulai)
        i1 = cari_simpul(max(mulai, akhir - 1))
        o0 = mulai - awal_simpul[i0]
        if i0 == i1:
            o1 = akhir - awal_simpul[i1]
            teks_simpul[i0] = teks_simpul[i0][:o0] + baru + teks_simpul[i0][o1:]
        else:
            # Teks baru masuk ke simpul pertama; sisa kecocokan di simpul
            # berikutnya dihapus sehingga formatnya sendiri tidak berubah.
            teks_simpul[i0] = teks_simpul[i0][:o0] + baru
            for i in range(i0 + 1, i1):
                teks_simpul[i] = ""
            o1 = akhir - awal_simpul[i1]
            teks_simpul[i1] = teks_simpul[i1][o1:]

    # Tulis balik dari belakang agar indeks simpul sebelumnya tetap sahih.
    # Dalam satu simpul, isi (indeks lebih besar) diganti sebelum tag pembuka.
    for i in range(len(simpul) - 1, -1, -1):
        tag_a, tag_b, isi_a, isi_b, tag, lama_teks = simpul[i]
        if teks_simpul[i] == lama_teks:
            continue
        xml = xml[:isi_a] + teks_simpul[i] + xml[isi_b:]
        # Spasi di ujung harus dipertahankan Word.
        if "xml:space" not in tag:
            xml = xml[:tag_a] + tag[:-1] + ' xml:space="preserve">' + xml[tag_b:]
    return xml, len(bersih)


def proses(path: Path, tulis: bool) -> int:
    with zipfile.ZipFile(path) as z:
        isi = {n: z.read(n) for n in z.namelist()}
        urutan = z.namelist()
    # Berkas ujian memakai gaya "Judul bagian — penjelasan" yang tetap dibaca
    # sebagai label meski diteruskan huruf kecil, jadi em dash-nya dibiarkan.
    pakai_em = path.parent.name != "Exam"
    total = 0
    for nama in urutan:
        if not BAGIAN.match(nama):
            continue
        xml = isi[nama].decode("utf-8")
        baru, jumlah = ganti_sadar_run(xml, pakai_em)
        if jumlah:
            # XML yang cacat membuat Word dan LibreOffice menolak seluruh
            # dokumen, jadi hasilnya diurai dahulu sebelum disimpan.
            try:
                ET.fromstring(baru)
            except ET.ParseError as e:
                raise SystemExit(f"{path.name}/{nama}: hasil suntingan bukan XML sah ({e})")
            isi[nama] = baru.encode("utf-8")
            total += jumlah
    if total and tulis:
        sementara = path.with_suffix(".docx.baru")
        with zipfile.ZipFile(sementara, "w", zipfile.ZIP_DEFLATED) as z:
            for nama in urutan:
                z.writestr(nama, isi[nama])
        shutil.move(str(sementara), str(path))
    return total


def main() -> None:
    periksa = "--periksa" in sys.argv
    berkas = sorted(AKAR.glob("*/Modul-Word/*.docx")) + sorted(AKAR.glob("*/Exam/*.docx"))
    diubah, penggantian = 0, 0
    for p in berkas:
        n = proses(p, tulis=not periksa)
        if n:
            diubah += 1
            penggantian += n
            print(f"  {p.relative_to(AKAR)}: {n} penggantian")
    kata = "akan diubah" if periksa else "diperbarui"
    print(f"{diubah} dari {len(berkas)} docx {kata}, {penggantian} penggantian.")


if __name__ == "__main__":
    main()
