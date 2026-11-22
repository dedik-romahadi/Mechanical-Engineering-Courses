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


# Penanda jawaban benar/lulus: hanya di aturan/konteks ini hijau dipertahankan.
BENAR = re.compile(r"(?i)benar|correct|tepat|lulus|sukses|success")


def petakan(rgb, hijau=False):
    r, g, b = (x / 255 for x in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    deg = h * 360
    # Netral, slate, dan latar gelap bernada navy -> abu netral.
    if s < 0.38 or l < 0.24:
        return _abu(l)
    # Merah murni (salah/galat/peringatan) dipertahankan; hijau hanya untuk
    # penanda benar. Hijau, pink, dan rose dekoratif ikut menjadi kuning/putih.
    if deg >= 348 or deg < 14:
        return rgb
    if hijau and 75 <= deg < 170:
        return rgb
    # Biru/toska/ungu dan jingga-kuning -> kuning, pucat -> putih hangat.
    if l > 0.8:
        return (250, 248, 240)
    if l < 0.3:  # latar ungu/biru tua -> arang netral (bukan kuning keruh)
        return _abu(l)
    return KUNING


SALAH = re.compile(r"(?i)salah|wrong|error|galat|gagal|terlambat|telat|missing|danger|"
                   r"hapus|delete|reset|peringatan|logout|log out|absen|invalid|❌|⚠")


def _merah(rgb):
    r, g, b = (int(x) / 255 for x in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return s >= 0.38 and (h * 360 >= 348 or h * 360 < 14)


def petakan_benar(rgb):
    return petakan(rgb, hijau=True)


def petakan_gelap(rgb):
    """Untuk gambar SVG dan kanvas: hanya latar gelap/slate yang dinetralkan,
    warna garis dan blok tetap supaya kode warna gambar tidak hilang."""
    r, g, b = (x / 255 for x in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < 0.24 or (s < 0.38 and l < 0.8):
        return _abu(l)
    # Hijau mint/toska (aksen tema lama, mis. #00e09e) -> kuning tema; hijau sumbu Y
    # FreeCAD (#22c55e, hue ~142) tetap karena konvensi X merah, Y hijau, Z biru.
    if 148 <= h * 360 < 178 and s >= 0.5:
        return KUNING
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
        # Rona kuning tembus pandang tampak keruh/pudar di atas hitam: rona tipis
        # menjadi abu netral, rona tebal menjadi kuning pekat.
        if (r, g, b) == KUNING and len(bag) > 3 and peta is not petakan_gelap:
            try:
                a = float(bag[3])
            except ValueError:
                a = 1.0
            if a < 0.35:
                return f"rgba(255,255,255,{round(a / 2, 3)})"
            return "rgb(255,214,10)"
        return f"{fn}({','.join([str(r), str(g), str(b)] + bag[3:])})"

    # Di dalam <svg>/skrip hanya #rrggbb: #abc pendek bisa berupa rujukan id (url(#bed)).
    pola = r"#[0-9a-fA-F]{6}\b"
    if peta is not petakan_gelap:
        pola += r"|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])"
    css = re.sub(pola, hex_ke, css)
    css = re.sub(r"(rgba?)\(([^()]*)\)", rgba_ke, css)
    if peta is not petakan_gelap:  # variabel berisi triplet "R,G,B"
        def triplet(m):
            r, g, b = peta(tuple(int(x) for x in m.group(2, 3, 4)))
            return f"{m.group(1)}{r},{g},{b}"
        css = re.sub(r"(--[\w-]+\s*:\s*)(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?=\s*(?:[;}]|$))",
                     triplet, css)
    return css


def ganti_css(css):
    """Per aturan CSS: hijau dipertahankan hanya bila selektornya penanda benar."""
    return re.sub(r"([^{}]*)\{([^{}]*)\}",
                  lambda m: m.group(1) + "{" + ganti_warna(
                      m.group(2), petakan_benar if BENAR.search(m.group(1)) else petakan) + "}",
                  css)


TEMA = Path(__file__).with_name("tema-premium.css").read_text(encoding="utf-8")
FONT = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:'
        'ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">')


def _buang_radial(teks):
    """Ganti setiap radial-gradient(...) (kurung bersarang) dengan lapisan transparan
    supaya jumlah lapisan background tetap sah."""
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


def tegaskan(html):
    """Tanpa blur dan cahaya: buang filter blur/drop-shadow, cahaya radial,
    dan bayangan kanvas. text-/box-shadow dan backdrop-filter dimatikan di CSS tema."""
    html = re.sub(r"(?<![\w-])filter\s*:\s*[^;}\"'`]*(?:blur|drop-shadow)\([^;}\"'`]*",
                  "filter:none", html)
    html = _buang_radial(html)
    html = re.sub(r"(?<![\w-])(-webkit-backdrop-filter|backdrop-filter|box-shadow|text-shadow)"
                  r"\s*:\s*[^;}\"'`]*", r"\1:none", html)
    html = re.sub(r"\b(boxShadow|textShadow|backdropFilter)(\s*[:=]\s*)"
                  r"(?:`[^`]*`|'[^']*'|\"[^\"]*\"|[^,;\n}]+)",
                  r"\1\2'none'", html)
    # Halo dan kilatan radial di kanvas animasi -> tidak digambar.
    html = re.sub(r"ctx\.fillStyle\s*=\s*(haloGrad|flashGrad)\s*;",
                  "ctx.fillStyle = 'rgba(0,0,0,0)';", html)
    # Animasi latar login: warna muatan/garis -> kuning & putih pekat, tanpa kilat layar.
    i = html.find("function initLoginAnimation")
    j = html.find("Floating particles", i)
    if i >= 0 and j > i:
        seg = html[i:j]
        for lama, baru in (("251,191,36", "255,214,10"), ("96,165,250", "255,255,255"),
                           ("129,140,248", "255,214,10")):
            seg = seg.replace(lama, baru)
        seg = re.sub(r"Math\.min\(activeFlash \* 0\.08, 0\.18\)", "0", seg)
        seg = seg.replace("globalAlpha = 0.55 + 0.45 * pulse", "globalAlpha = 1")
        html = html[:i] + seg + html[j:]
    html = re.sub(r"shadowBlur\s*=\s*[^;\n]+", "shadowBlur = 0", html)
    # Filter SVG (glow/bayangan) pada gambar materi.
    html = re.sub(r'\sfilter="url\(#[^)]*\)"', "", html)
    return html


def terapkan(html):
    # 1. Blok <style>.
    html = re.sub(r"(<style[^>]*>)(.*?)(</style>)",
                  lambda m: m.group(1) + ganti_css(m.group(2)) + m.group(3),
                  html, flags=re.S)
    # 2. Atribut style="" di luar <svg>.
    bagian = re.split(r"(<svg\b.*?</svg>)", html, flags=re.S)
    for i in range(0, len(bagian), 2):
        def atribut(m):
            gaya = m.group(1)
            # Rona merah tipis (alpha <= 0.2) di kotak isi materi hanyalah hiasan,
            # kecuali teks di sekitarnya memang pesan salah/galat.
            sekitar = m.string[m.start():m.end() + 250].split("</", 1)[0]
            if not SALAH.search(sekitar):
                gaya = re.sub(r"rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0?\.\d+)\)",
                              lambda k: (f"rgba(255,214,10,{k.group(4)})"
                                         if float(k.group(4)) <= 0.2 and _merah(k.group(1, 2, 3))
                                         else k.group(0)), gaya)
            return f'style="{ganti_warna(gaya)}"'
        bagian[i] = re.sub(r'style="([^"]*)"', atribut, bagian[i])
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
    # 2c. CSS yang ditulis di dalam JavaScript (template string, Object.assign style,
    #     cssText) dan larik palet bernama *colors -> pemetaan penuh. Warna gambar
    #     kanvas (fillStyle = ...) tidak tersentuh karena tidak memakai titik dua.
    def skrip_css(m):
        def prop(k):
            sekitar = k.string[max(0, k.start() - 120):k.end() + 40]
            return ganti_warna(k.group(0), petakan_benar if BENAR.search(sekitar) else petakan)
        isi = re.sub(r"(?i)\b[\w-]*(?:color|background|border|shadow)[\w-]*\s*:\s*[^;{}\n]*",
                     prop, m.group(2))
        isi = re.sub(r"(?i)(\w*(?:colou?rs?|cols)\w*\s*=\s*\[)([^\]]*)(\])",
                     lambda k: k.group(1) + ganti_warna(k.group(2)) + k.group(3), isi)
        return m.group(1) + isi + m.group(3)
    html = re.sub(r"(<script\b[^>]*>)(.*?)(</script>)", skrip_css, html, flags=re.S)
    # 3. Palet animasi latar login (kanvas) -> kuning, putih, abu.
    html = html.replace(
        "const NODE_COLORS = ['#818cf8', '#ec4899', '#fbbf24', '#a78bfa', '#f472b6', '#60a5fa'];",
        "const NODE_COLORS = ['#ffd60a', '#ffffff', '#ffc300', '#ffffff', '#ffd60a', '#f5f5f5'];")
    html = tegaskan(html)
    # 4. Font dan blok tema terakhir.
    html = html.replace("</head>", FONT + "\n</head>", 1)
    i = html.rfind("</body>")
    sini = Path(__file__).parent
    ikon_css = (sini / "ikon.css").read_text(encoding="utf-8")
    ikon_js = (sini / "ikon.js").read_text(encoding="utf-8")
    html = (html[:i] + f'<style id="tema-premium">\n{tegaskan(TEMA)}\n</style>\n'
            f'<style id="tema-premium-ikon">\n{ikon_css}</style>\n'
            f'<script id="tema-premium-ikon-js">\n{ikon_js}</script>\n' + html[i:])
    return html


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    Path(dst).write_text(terapkan(Path(src).read_text(encoding="utf-8")), encoding="utf-8")
    print("ditulis:", dst)
