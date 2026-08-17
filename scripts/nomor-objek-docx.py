#!/usr/bin/env python3
"""
Menomori persamaan pada modul Word dan memastikan tiap nomor dirujuk teksnya.

Modul .docx sudah menomori gambar dan tabel lewat caption ("Gambar 3. …",
"Tabel 1. …"), tetapi persamaannya belum bernomor sama sekali, dan sebagian
nomor gambar/tabel tidak pernah disebut di badan penjelasan. Pembaca jadi
tidak punya pegangan untuk menghubungkan kalimat dengan rumus atau gambar
yang dimaksud.

Skrip ini melengkapi ketiganya:

  1. Persamaan display — paragraf rata tengah yang berisi rumus — diberi
     nomor "(N)" berurutan per modul.
  2. Tiap nomor persamaan disebut pada paragraf penjelasan terdekat di
     atasnya.
  3. Nomor gambar dan tabel yang belum pernah dirujuk ikut disebutkan pada
     paragraf penjelasan terdekat.

MEMBEDAKAN RUMUS DARI KALIMAT. Penentunya bukan tebakan atas kata-katanya,
melainkan gaya yang dipakai dokumen itu sendiri: baris rumus selalu ditulis
rata tengah dengan warna biru tua 305496, sedangkan prosa tidak pernah
memakai warna itu. Menebak lewat kata pernah dicoba dan rapuh — "e(t) = r(t)
- y(t)" lolos karena tanda minusnya bukan hubung biasa, dan "r -> Sigma -> e
-> C(s)" lolos karena tak memuat tanda sama dengan.

Gaya saja belum cukup: sebagian sorotan bergaya sama hanyalah kalimat
("laju umpan terukur"), jadi baris itu juga wajib memuat tanda matematis.

Idempoten: nomor dan kalimat rujukan yang sudah ada tidak digandakan.

Pakai:
    python scripts/nomor-objek-docx.py               # seluruh modul
    python scripts/nomor-objek-docx.py --periksa     # laporan saja
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

from lxml import etree

AKAR = Path(__file__).resolve().parent.parent
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = f"{{{W}}}"
XMLSPACE = "{http://www.w3.org/XML/1998/namespace}space"

# Warna yang dipakai dokumen untuk baris rumus. Prosa memakai warna otomatis
# atau abu-abu, jadi warna ini menjadi penanda yang tegas.
WARNA_RUMUS = "305496"

# Tanda yang membuat sebuah baris menjadi rumus, bukan sekadar sorotan.
# Tanda panah ikut dihitung: rantai "r -> Sigma -> e -> C(s)" juga sebuah
# pernyataan matematis, bukan kalimat.
RX_MATEMATIS = re.compile(
    r"[=→⇒⇔↔≈≤≥±×÷√∫Σ∏∂∞−‖]"
    r"|[A-Za-z]\([A-Za-z0-9]\)"
    r"|(?:max|min|log|ln|sin|cos|tan|exp)\(")

RX_CAPTION = re.compile(r"^(Gambar|Tabel|Grafik|Diagram)\s+\d+\s*[.:]")
RX_KODE = re.compile(r"\b(?:np|sp|pd|plt|df)\.|import |\bdef |\.py\b|\.ipynb\b|\*\*")

# Kalimat rujukan. Dirotasi supaya satu halaman tidak terdengar monoton, pola
# yang sama dipakai halaman HTML sehingga gayanya seragam lintas format.
FRASA_PERSAMAAN = [
    "Hubungan ini dirangkum dalam Persamaan ({n}).",
    "Bentuk ringkasnya dituliskan pada Persamaan ({n}).",
    "Persamaan ({n}) memadatkan aturan tersebut.",
    "Rangkuman kuantitatifnya tertulis pada Persamaan ({n}).",
]
FRASA_GAMBAR = [
    "Gambar {n} mengilustrasikan gagasan ini.",
    "Skemanya diperlihatkan pada Gambar {n}.",
    "Perhatikan ilustrasinya pada Gambar {n}.",
    "Gambar {n} merangkum alurnya secara visual.",
]
FRASA_TABEL = [
    "Rinciannya dirangkum pada Tabel {n}.",
    "Tabel {n} memuat angka selengkapnya.",
    "Perbandingan lengkapnya tersaji pada Tabel {n}.",
    "Tabel {n} menyajikan hasilnya secara berdampingan.",
]

RX_SUDAH_NOMOR = re.compile(r"\(\d+\)\s*$")


def teks_paragraf(p):
    return "".join(t.text or "" for t in p.iter(NS + "t"))


def rata_tengah(p):
    jc = p.find(NS + "pPr/" + NS + "jc")
    return jc is not None and jc.get(NS + "val") == "center"


def bergaya_rumus(p):
    """Seluruh teks paragraf memakai warna baris rumus dokumen ini?"""
    warna = set()
    for r in p.iter(NS + "r"):
        if r.find(NS + "t") is None:
            continue
        rpr = r.find(NS + "rPr")
        c = rpr.find(NS + "color") if rpr is not None else None
        warna.add(c.get(NS + "val") if c is not None else "auto")
    return warna == {WARNA_RUMUS}


def rumus(p, teks):
    """Paragraf ini persamaan display, bukan kalimat biasa atau caption?"""
    t = teks.strip()
    if not t or len(t) > 220 or not rata_tengah(p):
        return False
    if RX_CAPTION.match(t) or RX_KODE.search(t):
        return False
    if not bergaya_rumus(p):
        return False
    return bool(RX_MATEMATIS.search(t))


def tambah_teks(p, tambahan):
    """Sisipkan teks di ujung paragraf, mewarisi format run terakhirnya."""
    run = [r for r in p.iter(NS + "r") if r.find(NS + "t") is not None]
    if not run:
        return False
    akhir = run[-1]
    salinan = etree.fromstring(etree.tostring(akhir))
    for t in salinan.findall(NS + "t"):
        salinan.remove(t)
    # Format naik/turun run terakhir tidak boleh menular ke teks tambahan:
    # rumus kerap berakhir dengan pangkat, dan nomornya harus setara garis.
    rpr = salinan.find(NS + "rPr")
    if rpr is not None:
        for va in rpr.findall(NS + "vertAlign"):
            rpr.remove(va)
    tt = etree.SubElement(salinan, NS + "t")
    tt.text = tambahan
    tt.set(XMLSPACE, "preserve")
    akhir.addnext(salinan)
    return True


def paragraf_penjelas(par, teks, batas, nomor_lain):
    """Paragraf prosa terdekat DI ATAS `batas` yang layak memuat rujukan."""
    # Rumus kerap muncul beruntun, sehingga paragraf prosanya bisa terletak
    # beberapa langkah ke atas; jendelanya dibuat cukup lebar. Paragraf yang
    # berakhir dengan titik dua tetap diterima karena lazim mengantar rumus.
    for i in range(batas - 1, max(-1, batas - 14), -1):
        t = teks[i].strip()
        if len(t) < 25 or rata_tengah(par[i]) or RX_CAPTION.match(t):
            continue
        if RX_KODE.search(t) or not t.endswith((".", ":", "!")):
            continue
        if nomor_lain and nomor_lain in t:
            return None  # sudah disebut di sini
        return i
    # Sebagian rumus membuka sebuah bagian sehingga tidak ada prosa di atasnya;
    # dalam hal itu penjelasnya justru paragraf sesudahnya.
    for i in range(batas + 1, min(len(teks), batas + 4)):
        t = teks[i].strip()
        if len(t) < 25 or rata_tengah(par[i]) or RX_CAPTION.match(t):
            continue
        if RX_KODE.search(t) or not t.endswith((".", ":", "!")):
            continue
        if nomor_lain and nomor_lain in t:
            return None
        return i
    # Upaya terakhir: paragraf yang menyinggung kode pun boleh dipakai, sebab
    # sebagian gambar memang menampilkan potongan kode dan penjelasnya di situ.
    for i in range(batas - 1, max(-1, batas - 6), -1):
        t = teks[i].strip()
        if len(t) < 25 or rata_tengah(par[i]) or RX_CAPTION.match(t):
            continue
        if nomor_lain and nomor_lain in t:
            return None
        return i
    return None


def proses(path: Path, tulis: bool):
    with zipfile.ZipFile(path) as z:
        isi = {n: z.read(n) for n in z.namelist()}
        urutan = z.namelist()
    root = etree.fromstring(isi["word/document.xml"])
    body = root.find(NS + "body")
    par = list(body.iter(NS + "p"))
    teks = [teks_paragraf(p) for p in par]

    n_nomor = n_rujuk = 0

    # --- 1. Nomori persamaan display, lalu rujuk nomornya.
    persamaan = [i for i, p in enumerate(par) if rumus(p, teks[i])]
    for urut, i in enumerate(persamaan, start=1):
        if not RX_SUDAH_NOMOR.search(teks[i].strip()):
            if tambah_teks(par[i], f"   ({urut})"):
                n_nomor += 1
        if any(f"Persamaan ({urut})" in t for t in teks):
            continue
        j = paragraf_penjelas(par, teks, i, f"Persamaan ({urut})")
        if j is None:
            continue
        frasa = FRASA_PERSAMAAN[(urut - 1) % len(FRASA_PERSAMAAN)].format(n=urut)
        if tambah_teks(par[j], " " + frasa):
            teks[j] += " " + frasa
            n_rujuk += 1

    # --- 2. Nomor gambar dan tabel yang belum pernah dirujuk.
    for jenis, frasa_set in (("Gambar", FRASA_GAMBAR), ("Tabel", FRASA_TABEL)):
        caption = {}
        for i, t in enumerate(teks):
            m = re.match(rf"^{jenis}\s+(\d+)\s*[.:]", t.strip())
            if m:
                caption[int(m.group(1))] = i
        for nomor, i in sorted(caption.items()):
            rx = re.compile(rf"\b{jenis}\s+{nomor}\b")
            if any(rx.search(t) for j, t in enumerate(teks) if j != i):
                continue
            j = paragraf_penjelas(par, teks, i, f"{jenis} {nomor}")
            if j is None:
                continue
            frasa = frasa_set[(nomor - 1) % len(frasa_set)].format(n=nomor)
            if tambah_teks(par[j], " " + frasa):
                teks[j] += " " + frasa
                n_rujuk += 1

    if (n_nomor or n_rujuk) and tulis:
        isi["word/document.xml"] = etree.tostring(
            root, xml_declaration=True, encoding="UTF-8", standalone=True)
        sementara = path.with_suffix(".docx.baru")
        with zipfile.ZipFile(sementara, "w", zipfile.ZIP_DEFLATED) as z:
            for nama in urutan:
                z.writestr(nama, isi[nama])
        with zipfile.ZipFile(sementara) as z:
            etree.fromstring(z.read("word/document.xml"))
        shutil.move(str(sementara), str(path))
    return len(persamaan), n_nomor, n_rujuk


def main() -> None:
    periksa = "--periksa" in sys.argv
    pilihan = [Path(a).resolve() for a in sys.argv[1:] if a.endswith(".docx")]
    berkas = pilihan or sorted(AKAR.glob("*/Modul-Word/*.docx"))
    tp = tn = tr = 0
    for p in berkas:
        pers, nomor, rujuk = proses(p, tulis=not periksa)
        tp += pers
        tn += nomor
        tr += rujuk
        if nomor or rujuk:
            print(f"  {p.parent.parent.name}/{p.name[:44]}: {nomor} nomor, {rujuk} rujukan")
    print(f"{len(berkas)} docx: {tp} persamaan terdeteksi, {tn} diberi nomor, {tr} kalimat rujukan.")


if __name__ == "__main__":
    main()
