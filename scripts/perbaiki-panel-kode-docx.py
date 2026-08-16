#!/usr/bin/env python3
"""
Menggambar ulang panel kode pada modul Word yang latarnya tidak mencakup
seluruh kode.

Tangkapan panel kode di Modul 1 Sistem Kendali Cerdas dibuat dengan kotak
gelap yang kurang tinggi: dua baris terakhir jatuh di luar kotak, tercetak
nyaris putih di atas latar putih sehingga praktis tidak terbaca.

Menambal piksel yang ada tidak memuaskan — sambungan kotaknya terlihat, baris
yang terpotong tetap terpenggal separuh, dan goresan yang sudah pudar tidak
bisa dipulihkan kontrasnya. Panel karena itu digambar ulang dari teks
kodenya, memakai metrik yang diukur dari gambar aslinya supaya gayanya sama:
DejaVu Sans Mono 20 px, tinggi baris 30 px, kotak #0f172a, teks #e5e9ee.

Berkas docx ikut disesuaikan: lebar tampilnya dipertahankan dan tingginya
mengikuti perbandingan sisi gambar yang baru, jadi tata letak halaman tidak
bergeser selain karena panelnya memang menjadi lebih tinggi.

Pakai:
    python scripts/perbaiki-panel-kode-docx.py
    python scripts/perbaiki-panel-kode-docx.py --periksa
"""
import io
import shutil
import sys
import zipfile
from pathlib import Path

import numpy as np
from lxml import etree
from PIL import Image, ImageDraw, ImageFont

AKAR = Path(__file__).resolve().parent.parent
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
WPNS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
ANS = "http://schemas.openxmlformats.org/drawingml/2006/main"
RNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS, NSWP, NSA, NSR = f"{{{W}}}", f"{{{WPNS}}}", f"{{{ANS}}}", f"{{{RNS}}}"

# Metrik diukur dari panel aslinya supaya hasil gambar ulang menyatu.
LEBAR = 930
PANEL_KIRI, PANEL_KANAN = 8, 922
PANEL_ATAS = 57
TEKS_KIRI = 36
TINGGI_BARIS = 30
BARIS_PERTAMA = 74
SISA_BAWAH = 20
WARNA_PANEL = (15, 23, 42)
WARNA_TEKS = (229, 233, 238)

FONT_KODE = "C:/Windows/Fonts/DejaVuSansMono.ttf"
FONT_JUDUL = "C:/Windows/Fonts/arialbd.ttf"

# Panel yang perlu digambar ulang. Teks kodenya adalah potongan yang memang
# ditampilkan panel aslinya, bukan seluruh isi cell pada halaman HTML.
PANEL = [
    {
        "berkas": "Sistem-Kendali-Cerdas/Modul-Word/Modul-1-Pengantar-Sistem-Kontrol-Cerdas.docx",
        "media": "word/media/image11.png",
        "judul": "Cell 1 — Sistem Referensi dan Besaran Turunannya",
        "kode": [
            "import numpy as np",
            "K, tau, Kp = 2.0, 3.0, 4.0",
            "L      = Kp * K",
            "T      = L / (1 + L)",
            "S      = 1 / (1 + L)",
            "tau_cl = tau / (1 + L)",
            "t_s    = 4.0 * tau_cl",
            'print(f"L      = {L:.4f}")',
            'print(f"S + T  = {S + T:.4f}")',
            'print(f"tau_cl = {tau_cl:.4f} s")',
        ],
    },
]


def gambar_panel(judul, kode):
    mono = ImageFont.truetype(FONT_KODE, 20)
    tebal = ImageFont.truetype(FONT_JUDUL, 25)
    bawah = BARIS_PERTAMA + (len(kode) - 1) * TINGGI_BARIS + 26 + SISA_BAWAH
    im = Image.new("RGB", (LEBAR, bawah + 8), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.text((LEBAR // 2, 8), judul, font=tebal, fill=(0, 0, 0), anchor="ma")
    d.rectangle([PANEL_KIRI, PANEL_ATAS, PANEL_KANAN, bawah], fill=WARNA_PANEL)
    for i, baris in enumerate(kode):
        d.text((TEKS_KIRI, BARIS_PERTAMA + i * TINGGI_BARIS), baris,
               font=mono, fill=WARNA_TEKS)
    return im


def teks_di_luar_panel(im):
    """Berapa piksel teks pudar yang tercecer di luar kotak gelap."""
    lum = np.asarray(im.convert("RGB")).astype(int).mean(axis=2)
    baris = np.where((lum < 90).mean(axis=1) > 0.80)[0]
    if len(baris) == 0:
        return 0
    sisa = lum[int(baris[-1]) + 3:]
    if sisa.size == 0:
        return 0
    # Teks pudar tanpa teks gelap: khas panel kode yang kotaknya kurang tinggi.
    # Grafik matplotlib selalu punya label sumbu gelap, jadi tidak ikut kena.
    if (sisa < 150).sum() >= 40:
        return 0
    return int(((sisa > 200) & (sisa < 250)).sum())


def proses(spec, tulis: bool) -> bool:
    path = AKAR / spec["berkas"]
    with zipfile.ZipFile(path) as z:
        isi = {n: z.read(n) for n in z.namelist()}
        urutan = z.namelist()
    lama = Image.open(io.BytesIO(isi[spec["media"]]))
    tercecer = teks_di_luar_panel(lama)
    if not tercecer:
        print(f"  {spec['berkas']}: panel sudah utuh, dilewati")
        return False
    baru = gambar_panel(spec["judul"], spec["kode"])
    if teks_di_luar_panel(baru):
        raise SystemExit("panel hasil gambar ulang masih menyisakan teks di luar kotak")
    buf = io.BytesIO()
    baru.save(buf, format="PNG", optimize=True)
    isi[spec["media"]] = buf.getvalue()

    # Lebar tampil dipertahankan, tinggi mengikuti perbandingan sisi baru.
    root = etree.fromstring(isi["word/document.xml"])
    peta = {r.get("Id"): "word/" + r.get("Target")
            for r in etree.fromstring(isi["word/_rels/document.xml.rels"])}
    disetel = 0
    for dr in root.iter(NS + "drawing"):
        blip = dr.find(".//" + NSA + "blip")
        ext = dr.find(".//" + NSWP + "extent")
        if blip is None or ext is None:
            continue
        if peta.get(blip.get(NSR + "embed")) != spec["media"]:
            continue
        cx = int(ext.get("cx"))
        cy = int(round(cx * baru.size[1] / baru.size[0]))
        ext.set("cy", str(cy))
        for e in dr.iter(NSA + "ext"):
            if e.get("cx") and e.get("cy"):
                e.set("cy", str(int(round(int(e.get("cx")) * baru.size[1] / baru.size[0]))))
        disetel += 1
    isi["word/document.xml"] = etree.tostring(
        root, xml_declaration=True, encoding="UTF-8", standalone=True)

    if tulis:
        sementara = path.with_suffix(".docx.baru")
        with zipfile.ZipFile(sementara, "w", zipfile.ZIP_DEFLATED) as z:
            for nama in urutan:
                z.writestr(nama, isi[nama])
        with zipfile.ZipFile(sementara) as z:
            etree.fromstring(z.read("word/document.xml"))
        shutil.move(str(sementara), str(path))
    print(f"  {spec['berkas']}")
    print(f"    {spec['media']}: {lama.size[0]}x{lama.size[1]} -> "
          f"{baru.size[0]}x{baru.size[1]}, {len(spec['kode'])} baris kode, "
          f"{tercecer} piksel teks tercecer diperbaiki, {disetel} rujukan gambar disetel")
    return True


def main() -> None:
    periksa = "--periksa" in sys.argv
    n = sum(proses(s, tulis=not periksa) for s in PANEL)
    kata = "akan digambar ulang" if periksa else "digambar ulang"
    print(f"{n} panel kode {kata}.")


if __name__ == "__main__":
    main()
