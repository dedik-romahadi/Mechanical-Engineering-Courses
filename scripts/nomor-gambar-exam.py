#!/usr/bin/env python3
"""
Menomori gambar soal pada berkas ujian Word dan merujuknya di teks soal.

Berkas Exam berbeda bentuk dari modul: isinya formulir ujian, dan seluruh
soal duduk di dalam satu tabel besar berkolom "Pertanyaan/Soal". Tiap soal
kerap disertai satu ilustrasi, tetapi ilustrasi itu belum bernomor dan
dirujuk secara posisional saja ("Diagram di samping menampilkan ..."), yang
menjadi kabur begitu soal terpotong pergantian halaman.

Skrip ini menomori tiap gambar soal sebagai "Gambar N." lalu memastikan teks
soalnya menyebut nomor itu. Rujukan posisional yang sudah ada diganti dengan
nomornya, bukan ditumpuk, supaya kalimatnya tetap enak dibaca.

YANG TIDAK DINOMORI:

  - Logo dan tanda tangan pada kop serta blok verifikasi. Gambar hanya
    dihitung bila berada di dalam tabel soal dan berukuran cukup besar.
  - Kelima tabel berkas ujian. Semuanya blok formulir (kop, identitas,
    petunjuk, verifikasi, tabel soal), bukan tabel data yang dirujuk.
  - Persamaan. Berkas ujian tidak memuat persamaan display sama sekali;
    seluruh rumus menyatu di dalam kalimat soal.

Idempoten: caption dan rujukan yang sudah bernomor tidak digandakan.

Pakai:
    python scripts/nomor-gambar-exam.py               # seluruh berkas ujian
    python scripts/nomor-gambar-exam.py --periksa     # laporan saja
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

from lxml import etree

AKAR = Path(__file__).resolve().parent.parent
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
NS = f"{{{W}}}"
NSWP = f"{{{WP}}}"
XMLSPACE = "{http://www.w3.org/XML/1998/namespace}space"

EMU = 914400  # satuan panjang Word per inci

# Gambar soal jauh lebih besar daripada logo kop dan gambar tanda tangan.
LEBAR_MIN = 1.8
TINGGI_MIN = 0.8

# Baris keterangan yang sudah ada di sebagian berkas, tinggal diberi nomor.
AWALAN_KETERANGAN = re.compile(
    r"^(Ilustrasi|Visualisasi|Perbandingan|Spektrum|Diagram|Grafik|Plot|Skema"
    r"|ADC|Outlier|\d+-panel)\b", re.I)

# Rujukan posisional yang akan diganti nomornya. Bentuk "lihat ilustrasi" ikut
# ditangani supaya kalimatnya cukup diperbaiki di tempat, tanpa perlu
# menambahkan kalimat rujukan baru yang isinya mengulang.
RX_POSISIONAL = re.compile(
    r"\b(?:Diagram|Gambar|Ilustrasi|Grafik|Plot)\s+di\s+samping\b"
    r"|\blihat\s+(?:ilustrasi|grafik|gambar|diagram|plot)\b", re.I)

RX_SUDAH = re.compile(r"^Gambar\s+\d+\s*[.:]")


def keterangan(t):
    """Baris ini keterangan gambar, bukan kalimat soal?"""
    return bool(AWALAN_KETERANGAN.match(t)) and len(t) < 160


def teks_par(p):
    return "".join(t.text or "" for t in p.iter(NS + "t"))


def tabel_soal(body):
    """Tabel yang memuat kolom Pertanyaan/Soal; bukan blok kop atau identitas."""
    for tbl in body.findall(NS + "tbl"):
        baris = tbl.findall(NS + "tr")
        if not baris:
            continue
        kepala = teks_par(baris[0]) if baris else ""
        kepala = "".join(t.text or "" for t in baris[0].iter(NS + "t"))
        if "Pertanyaan" in kepala and "Bobot" in kepala:
            return tbl
    return None


def gambar_soal(tc):
    """Paragraf-paragraf di dalam sel yang memuat gambar berukuran soal."""
    hasil = []
    for p in tc.iter(NS + "p"):
        for dr in p.iter(NS + "drawing"):
            ext = dr.find(".//" + NSWP + "extent")
            if ext is None:
                continue
            if (int(ext.get("cx")) / EMU >= LEBAR_MIN
                    and int(ext.get("cy")) / EMU >= TINGGI_MIN):
                hasil.append(p)
                break
    return hasil


def ganti_teks_paragraf(p, cari, ganti):
    """Ganti satu kemunculan pola di paragraf, sadar pemenggalan run Word."""
    simpul = [t for t in p.iter(NS + "t")]
    if not simpul:
        return False
    potong = [t.text or "" for t in simpul]
    penuh = "".join(potong)
    m = cari.search(penuh)
    if not m:
        return False
    awal = []
    pos = 0
    for s in potong:
        awal.append(pos)
        pos += len(s)

    def simpul_ke(g):
        lo, hi = 0, len(awal) - 1
        while lo < hi:
            t = (lo + hi + 1) // 2
            if awal[t] <= g:
                lo = t
            else:
                hi = t - 1
        return lo

    i0, i1 = simpul_ke(m.start()), simpul_ke(max(m.start(), m.end() - 1))
    o0 = m.start() - awal[i0]
    if i0 == i1:
        potong[i0] = potong[i0][:o0] + ganti + potong[i0][m.end() - awal[i1]:]
    else:
        potong[i0] = potong[i0][:o0] + ganti
        for i in range(i0 + 1, i1):
            potong[i] = ""
        potong[i1] = potong[i1][m.end() - awal[i1]:]
    for t, baru in zip(simpul, potong):
        if (t.text or "") != baru:
            t.text = baru
            t.set(XMLSPACE, "preserve")
    return True


def tambah_di_ujung(p, tambahan):
    """Sisipkan teks di ujung paragraf, mewarisi format run terakhirnya."""
    run = [r for r in p.iter(NS + "r") if r.find(NS + "t") is not None]
    if not run:
        return False
    salinan = etree.fromstring(etree.tostring(run[-1]))
    for t in salinan.findall(NS + "t"):
        salinan.remove(t)
    tt = etree.SubElement(salinan, NS + "t")
    tt.text = tambahan
    tt.set(XMLSPACE, "preserve")
    run[-1].addnext(salinan)
    return True


def paragraf_caption(nomor):
    """Paragraf caption baru: rata tengah, miring, sedikit lebih kecil."""
    p = etree.Element(NS + "p")
    ppr = etree.SubElement(p, NS + "pPr")
    jc = etree.SubElement(ppr, NS + "jc")
    jc.set(NS + "val", "center")
    r = etree.SubElement(p, NS + "r")
    rpr = etree.SubElement(r, NS + "rPr")
    etree.SubElement(rpr, NS + "i")
    sz = etree.SubElement(rpr, NS + "sz")
    sz.set(NS + "val", "18")  # setengah-poin: 9 pt
    t = etree.SubElement(r, NS + "t")
    t.text = f"Gambar {nomor}."
    t.set(XMLSPACE, "preserve")
    return p


def proses(path: Path, tulis: bool):
    with zipfile.ZipFile(path) as z:
        isi = {n: z.read(n) for n in z.namelist()}
        urutan = z.namelist()
    root = etree.fromstring(isi["word/document.xml"])
    body = root.find(NS + "body")
    tbl = tabel_soal(body)
    if tbl is None:
        return 0, 0

    nomor = 0
    n_caption = n_rujuk = 0
    for tr in tbl.findall(NS + "tr"):
        for tc in tr.findall(NS + "tc"):
            gambar = gambar_soal(tc)
            if not gambar:
                continue
            par = list(tc.iter(NS + "p"))
            for pg in gambar:
                nomor += 1
                idx = par.index(pg)

                # 1. Caption. Baris keterangan yang sudah ada tinggal diberi
                #    nomor; bila belum ada, caption baru disisipkan.
                sasaran = None
                for k in range(idx + 1, min(len(par), idx + 3)):
                    t = teks_par(par[k]).strip()
                    if not t:
                        continue
                    if RX_SUDAH.match(t):
                        sasaran = "sudah"
                        break
                    if keterangan(t):
                        sasaran = par[k]
                    break
                if sasaran is None:
                    pg.addnext(paragraf_caption(nomor))
                    n_caption += 1
                elif sasaran != "sudah":
                    run = [r for r in sasaran.iter(NS + "r")
                           if r.find(NS + "t") is not None]
                    if run:
                        t = run[0].find(NS + "t")
                        t.text = f"Gambar {nomor}. " + (t.text or "")
                        t.set(XMLSPACE, "preserve")
                        n_caption += 1

                # 2. Rujukan pada teks soal: paragraf terpanjang di sel ini.
                #    Caption sendiri tidak dihitung sebagai rujukan — kalau
                #    ikut dihitung, memberi nomor pada caption membuat skrip
                #    mengira soalnya sudah menyebut nomor itu.
                par = list(tc.iter(NS + "p"))
                bukan_caption = [x for x in par if not RX_SUDAH.match(teks_par(x).strip())]
                if any(re.search(rf"\bGambar\s+{nomor}\b", teks_par(x)) for x in bukan_caption):
                    continue
                # Panjangnya ikut diperiksa: kalimat soal pun kerap dibuka
                # kata "Diagram" ("Diagram di samping menampilkan slope
                # field ..."), dan tanpa batas panjang kalimat itu tersaring
                # sebagai baris keterangan sehingga soalnya tak jadi dirujuk.
                kandidat = [x for x in bukan_caption
                            if len(teks_par(x).strip()) > 60
                            and not keterangan(teks_par(x).strip())]
                if not kandidat:
                    continue
                soal = max(kandidat, key=lambda x: len(teks_par(x)))
                cocok = RX_POSISIONAL.search(teks_par(soal))
                if cocok:
                    # "lihat ilustrasi" cukup diganti obyeknya supaya kalimat
                    # perintahnya tetap utuh: "lihat Gambar 3".
                    kata = cocok.group(0).split()[0]
                    ganti = (f"{kata} Gambar {nomor}" if kata.lower() == "lihat"
                             else f"Gambar {nomor}")
                    if ganti_teks_paragraf(soal, RX_POSISIONAL, ganti):
                        n_rujuk += 1
                elif tambah_di_ujung(soal, f" Perhatikan Gambar {nomor}."):
                    n_rujuk += 1

    if (n_caption or n_rujuk) and tulis:
        isi["word/document.xml"] = etree.tostring(
            root, xml_declaration=True, encoding="UTF-8", standalone=True)
        sementara = path.with_suffix(".docx.baru")
        with zipfile.ZipFile(sementara, "w", zipfile.ZIP_DEFLATED) as z:
            for nama in urutan:
                z.writestr(nama, isi[nama])
        with zipfile.ZipFile(sementara) as z:
            etree.fromstring(z.read("word/document.xml"))
        shutil.move(str(sementara), str(path))
    return n_caption, n_rujuk


def main() -> None:
    periksa = "--periksa" in sys.argv
    berkas = sorted(AKAR.glob("*/Exam/*.docx"))
    tc = tr = 0
    for p in berkas:
        c, r = proses(p, tulis=not periksa)
        tc += c
        tr += r
        print(f"  {p.parent.parent.name}/{p.name}: {c} caption, {r} rujukan")
    kata = "akan dipasang" if periksa else "dipasang"
    print(f"{len(berkas)} berkas ujian: {tc} nomor gambar {kata}, {tr} rujukan.")


if __name__ == "__main__":
    main()
