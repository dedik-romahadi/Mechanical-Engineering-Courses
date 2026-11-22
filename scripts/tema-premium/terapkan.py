"""Tema Premium (hitam - kuning - putih) untuk halaman modul.

Uji coba 22 Nov 2026 pada duplikat Modul 1 CAD. Skrip ini:
  1. memetakan ulang setiap literal warna di blok <style> dan atribut style=""
     (di luar <svg>, supaya gambar materi tidak berubah):
       - warna netral/gelap bernada navy  -> abu netral dengan kecerahan sama
       - biru, toska, ungu, magenta        -> kuning (atau putih bila pucat)
       - jingga-kuning                      -> kuning tema
       - hijau dan merah/pink               -> dibiarkan (makna benar/salah)
  2. menyisipkan blok <style id="tema-premium"> tepat sebelum </body> sehingga
     menang atas semua blok tema lama (tipografi, kartu, tombol, hero).

Pemakaian:
  python scripts/tema-premium/terapkan.py <sumber.html> <keluaran.html>
"""
import colorsys
import re
import sys
from pathlib import Path

KUNING = (255, 214, 10)  # #FFD60A


def _hex_to_rgb(h):
    h = h[1:]
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _abu(l):
    """Abu netral. Abu menengah (teks keterangan) dicerahkan agar tidak pudar
    di atas hitam; abu gelap (latar, garis) dipertahankan."""
    if 0.38 <= l < 0.8:
        l = min(0.86, l + 0.16)
    v = round(l * 255)
    return (v, v, v)


def petakan(rgb):
    r, g, b = (x / 255 for x in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    deg = h * 360
    # Netral, slate, dan latar gelap bernada navy -> abu netral.
    if s < 0.38 or l < 0.24:
        return _abu(l)
    # Hijau (benar) dan merah/pink (salah) dipertahankan.
    if 75 <= deg < 162 or deg >= 325 or deg < 18:
        return rgb
    # Biru/toska/ungu dan jingga-kuning -> kuning, pucat -> putih hangat.
    if l > 0.8:
        return (250, 248, 240)
    if l < 0.3:  # latar ungu/biru tua -> arang netral (bukan kuning keruh)
        return _abu(l)
    return KUNING


def petakan_gelap(rgb):
    """Untuk gambar SVG dan kanvas: hanya latar gelap/slate yang dinetralkan,
    warna garis dan blok tetap supaya kode warna gambar tidak hilang."""
    r, g, b = (x / 255 for x in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < 0.24 or (s < 0.38 and l < 0.8):
        return _abu(l)
    return rgb


def ganti_warna(css, peta=None):
    peta = peta or petakan

    def hex_ke(m):
        r, g, b = peta(_hex_to_rgb(m.group(0)))
        return f"#{r:02x}{g:02x}{b:02x}"

    def rgba_ke(m):
        fn, isi = m.group(1), m.group(2)
        bag = [x.strip() for x in isi.split(",")]
        if len(bag) < 3 or not all(re.fullmatch(r"\d+(\.\d+)?", x) for x in bag[:3]):
            return m.group(0)
        r, g, b = peta(tuple(int(float(x)) for x in bag[:3]))
        return f"{fn}({','.join([str(r), str(g), str(b)] + bag[3:])})"

    # Di dalam <svg>/skrip hanya #rrggbb: #abc pendek bisa berupa rujukan id (url(#bed)).
    pola = r"#[0-9a-fA-F]{6}\b"
    if peta is not petakan_gelap:
        pola += r"|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])"
    css = re.sub(pola, hex_ke, css)
    css = re.sub(r"(rgba?)\(([^()]*)\)", rgba_ke, css)
    return css


TEMA = Path(__file__).with_name("tema-premium.css").read_text(encoding="utf-8")
FONT = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:'
        'ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">')


def terapkan(html):
    # 1. Blok <style>.
    html = re.sub(r"(<style[^>]*>)(.*?)(</style>)",
                  lambda m: m.group(1) + ganti_warna(m.group(2)) + m.group(3),
                  html, flags=re.S)
    # 2. Atribut style="" di luar <svg>.
    bagian = re.split(r"(<svg\b.*?</svg>)", html, flags=re.S)
    for i in range(0, len(bagian), 2):
        bagian[i] = re.sub(r'style="([^"]*)"',
                           lambda m: f'style="{ganti_warna(m.group(1))}"', bagian[i])
    for i in range(1, len(bagian), 2):  # isi <svg>: hanya latar gelap
        bagian[i] = ganti_warna(bagian[i], petakan_gelap)
    html = "".join(bagian)
    # 2b. Literal warna bertanda kutip di skrip (latar kanvas animasi).
    def skrip(m):
        return m.group(1) + re.sub(
            r"(['\"])(#[0-9a-fA-F]{6}|rgba?\([0-9.,\s]+\))\1",
            lambda k: k.group(1) + ganti_warna(k.group(2), petakan_gelap) + k.group(1),
            m.group(2)) + m.group(3)
    html = re.sub(r"(<script\b[^>]*>)(.*?)(</script>)", skrip, html, flags=re.S)
    # 3. Palet animasi latar login (kanvas) -> kuning, putih, abu.
    html = html.replace(
        "const NODE_COLORS = ['#818cf8', '#ec4899', '#fbbf24', '#a78bfa', '#f472b6', '#60a5fa'];",
        "const NODE_COLORS = ['#ffd60a', '#ffffff', '#ffc300', '#8e8e93', '#ffd60a', '#d4d4d8'];")
    # 4. Font dan blok tema terakhir.
    html = html.replace("</head>", FONT + "\n</head>", 1)
    i = html.rfind("</body>")
    html = html[:i] + f'<style id="tema-premium">\n{TEMA}\n</style>\n' + html[i:]
    return html


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    Path(dst).write_text(terapkan(Path(src).read_text(encoding="utf-8")), encoding="utf-8")
    print("ditulis:", dst)
