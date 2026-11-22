"""Tema Premium (hitam - kuning - putih): pemasang ke halaman modul.

Desain standar halaman modul sejak 22 Nov 2026 (Pedoman-Modul.md §6.9). Acuannya Modul 1
Pemodelan CAD. Isi halaman TIDAK ditulis ulang: warna dipetakan di peramban, sehingga
skrip penyuntik lain, jangkar notasi, dan validator tetap membaca isi aslinya dan rantai
regenerasi modul tidak menghapus tema. Skrip ini hanya memasang dua blok bertanda:

  <head>  (antara <!-- TEMA-PREMIUM:KEPALA --> ... <!-- /TEMA-PREMIUM:KEPALA -->)
          font Outfit / Plus Jakarta Sans / Noto Emoji (di-subset ke emoji halaman),
          <style id="tema-premium-awal"> dan <script id="tema-premium-awal-js"> = awal.js
          (pustaka pemetaan warna + kanvas; halaman disembunyikan sampai warna siap)
  </body> <style id="tema-premium"> = tema-premium.css, <style id="tema-premium-ikon"> =
          ikon.css, <script id="tema-premium-warna-js"> = roda gigi + warna.js (CSSOM, gaya
          inline, SVG, roda gigi, label soal), <script id="tema-premium-ikon-js"> = ikon.js

Idempoten: blok lama dilepas dulu lalu dipasang ulang. Jalankan PALING AKHIR dalam rantai
regenerasi (sesudah draft-modul.mjs); --periksa gagal bila ada halaman yang belum/basi.

Pemakaian:
  python scripts/tema-premium/terapkan.py --semua                 (84 halaman modul)
  python scripts/tema-premium/terapkan.py --kursus cad,ttl
  python scripts/tema-premium/terapkan.py --semua --periksa
  python scripts/tema-premium/terapkan.py <sumber.html> <keluaran.html>
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

SINI = Path(__file__).resolve().parent
sys.path.insert(0, str(SINI))
from roda_gigi import svg_roda_gigi  # noqa: E402

AKAR = SINI.parents[1]
KURSUS = {
    "cad": "Pemodelan-Computer-Aided-Design",
    "ttl": "Teknik-Tenaga-Listrik",
    "getaran": "Getaran-Mekanik",
    "opto": "Optimalisasi-dan-Automasi",
    "sisken": "Sistem-Kendali-Cerdas",
    "math4": "Engineering-Mathematics",
}

KEPALA_A, KEPALA_Z = "<!-- TEMA-PREMIUM:KEPALA -->", "<!-- /TEMA-PREMIUM:KEPALA -->"
FONT = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:'
        'ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">')
SEMBUNYI = ('<style id="tema-premium-awal">html.tp-memuat body{visibility:hidden!important}'
            'html.tp-memuat *,html.tp-memuat *::before,html.tp-memuat *::after{transition:none!important}</style>')


def _baca(nama):
    """Isi berkas tema. Teks tag dokumen (head/body/html/script/style) dilarang di dalamnya:
    penyuntik lain mencari batas dokumen dengan teks itu."""
    isi = (SINI / nama).read_text(encoding="utf-8")
    m = re.search(r"</?(?:head|body|html|script|style)\b", isi)
    if m:
        raise SystemExit(f"tema-premium: {nama} memuat teks tag {m.group(0)!r}")
    return isi


def _buang_radial(teks):
    hasil, i = [], 0
    while True:
        j = teks.find("radial-gradient(", i)
        if j < 0:
            hasil.append(teks[i:])
            return "".join(hasil)
        k, d = j + len("radial-gradient("), 1
        while k < len(teks) and d:
            d += {"(": 1, ")": -1}.get(teks[k], 0)
            k += 1
        hasil.append(teks[i:j] + "linear-gradient(transparent,transparent)")
        i = k


def tegaskan_css(css):
    """CSS tema sendiri: tanpa blur, cahaya radial, dan bayangan."""
    css = re.sub(r"(?<![\w-])filter\s*:\s*[^;}]*(?:blur|drop-shadow)\([^;}]*", "filter:none", css)
    css = _buang_radial(css)
    return re.sub(r"(?<![\w-])(-webkit-backdrop-filter|backdrop-filter|box-shadow|text-shadow)\s*:\s*[^;}]*",
                  r"\1:none", css)


def font_emoji(html):
    """Noto Emoji hanya untuk emoji yang ada di halaman (parameter text=), plus 📝."""
    pakai = sorted((set(re.findall("[‼-㊙\U0001F000-\U0001FAFF]", html)) | {"📝"})
                   - set("→←↑↓↔─│┌┐└┘├┤━═▶◀●○■□▲▼◆◇★☆✓✗×"))
    return ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
            f'family=Noto+Emoji:wght@600&display=swap&text={quote("".join(pakai) + "‍️")}">')


def lepas(html):
    """Buang semua blok yang pernah dipasang skrip ini (termasuk versi statis lama)."""
    html = re.sub(re.escape(KEPALA_A) + r".*?" + re.escape(KEPALA_Z) + r"\n?", "", html, flags=re.S)
    html = re.sub(r'<style id="tema-premium(?:-ikon)?">.*?</style>\n?', "", html, flags=re.S)
    html = re.sub(r'<script id="tema-premium-(?:ikon|warna)-js">.*?</script>\n?', "", html, flags=re.S)
    return html


def gambar_untuk(halaman):
    """Ketentuan unit gambar satu halaman dari tema-gambar.json:
      "asli":  selektor unit yang warnanya data dunia nyata (peta warna FEM, warna UI FreeCAD,
               zona alarm): warna dan teksnya tidak dipetakan;
      "makna": selektor unit yang merah/hijaunya bermakna (benar/salah, layak/melanggar, batas):
               merah/hijau dan kata-katanya dipertahankan, warna lain dipetakan;
      "teks":  [[frasa persis, pengganti], ...] untuk seluruh halaman (juga prosa di luar unit)."""
    kosong = {"asli": [], "makna": [], "teks": []}
    if not halaman:
        return kosong
    data = json.loads(_baca("tema-gambar.json")).get(halaman.replace("\\", "/"), {})
    return {k: data.get(k, []) for k in kosong}


def terapkan(html, halaman=None):
    html = lepas(html)
    kec = ("window.__tpGambar = " + json.dumps(gambar_untuk(halaman), ensure_ascii=False).replace("</", "<\\/")
           + ";\n")
    kepala = (KEPALA_A + FONT + font_emoji(html) + SEMBUNYI
              + '<script id="tema-premium-awal-js">\n' + kec + _baca("awal.js") + "</script>" + KEPALA_Z + "\n")
    i = html.find("</head>")
    if i < 0:
        raise SystemExit("tema-premium: </head> tidak ditemukan")
    html = html[:i] + kepala + html[i:]
    gigi = "window.__tpGigi = " + json.dumps(svg_roda_gigi()) + ";\n"
    badan = (f'<style id="tema-premium">\n{tegaskan_css(_baca("tema-premium.css"))}\n</style>\n'
             f'<style id="tema-premium-ikon">\n{_baca("ikon.css")}</style>\n'
             f'<script id="tema-premium-warna-js">\n{gigi}{_baca("warna.js")}</script>\n'
             f'<script id="tema-premium-ikon-js">\n{_baca("ikon.js")}</script>\n')
    j = html.rfind("</body>")
    if j < 0:
        raise SystemExit("tema-premium: </body> tidak ditemukan")
    return html[:j] + badan + html[j:]


def halaman_modul(kursus):
    d = AKAR / KURSUS[kursus] / "Modul"
    return [d / f"Modul-{n}.html" for n in range(1, 15) if (d / f"Modul-{n}.html").exists()]


def baca(p):
    with open(p, encoding="utf-8", newline="") as f:
        return f.read()


def tulis(p, isi):
    """Tulis berkas; dicoba ulang bila OneDrive sedang mengunci berkas (OSError sesaat)."""
    import time
    for coba in range(6):
        try:
            with open(p, "w", encoding="utf-8", newline="") as f:
                f.write(isi)
            return
        except OSError:
            if coba == 5:
                raise
            time.sleep(1.5)


if __name__ == "__main__":
    arg = sys.argv[1:]
    periksa = "--periksa" in arg
    if "--semua" in arg:
        berkas = [h for k in KURSUS for h in halaman_modul(k)]
    elif "--kursus" in arg:
        berkas = [h for k in arg[arg.index("--kursus") + 1].split(",") for h in halaman_modul(k)]
    else:
        src, dst = arg[0], arg[1]
        tulis(dst, terapkan(baca(src), str(Path(src).resolve().relative_to(AKAR))))
        print("ditulis:", dst)
        sys.exit(0)
    gagal = 0
    for h in berkas:
        lama = baca(h)
        baru = terapkan(lama, str(h.relative_to(AKAR)))
        if periksa:
            if baru != lama:
                print("BELUM:", h.relative_to(AKAR))
                gagal += 1
        elif baru != lama:
            tulis(h, baru)
            print("diterapkan:", h.relative_to(AKAR))
    if periksa:
        print(f"tema-premium: {len(berkas) - gagal}/{len(berkas)} halaman mutakhir")
        sys.exit(1 if gagal else 0)
