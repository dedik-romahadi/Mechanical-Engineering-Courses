#!/usr/bin/env python3
"""
SVG gambar halaman modul → PNG untuk Modul-Word, dirender MuPDF (PyMuPDF).

Dipakai bersama oleh `scripts/cad-modul/buat-modul-word.py` dan
`scripts/ttl-modul/buat-modul-word.py`. Pengurai SVG MuPDF (PyMuPDF 1.28 /
MuPDF 1.29) tidak selengkap peramban, dan tiap kekurangannya tampak di Word/PDF:

* isian/garis `rgba()` dan isian gradien `url(#…)` dicetak HITAM;
* `fill-opacity` pada <text>, clipPath, dan `opacity` pada <image> diabaikan,
  sedangkan opasitas <g> diterapkan per anak, bukan sebagai grup;
* `stroke-dasharray` diabaikan dalam bentuk apa pun, jadi garis putus-putus
  (garis sumbu, garis tersembunyi, garis bantu) tercetak sebagai garis utuh;
* metrik font cadangannya lebih lebar daripada font peramban, sehingga label
  panjang di tepi gambar bisa melewati viewBox.

Karena itu salinan SVG untuk Word diolah lebih dulu (`warna_mupdf`,
`garis_putus_mupdf`) dan, bila diminta, kanvasnya diperluas seperlunya
(`render_svg`). Halaman modul di peramban tidak ikut berubah. Kedua fungsi
pengolah berhenti dengan galat jelas bila menemui bentuk yang belum didukung,
bukan diam-diam mencetak hitam atau garis utuh.
"""
import base64
import math
import re
import struct
import zlib

import fitz  # PyMuPDF


def xml_aman(svg):
    """SVG inline HTML boleh memuat '<' dan '&' telanjang di teks; XML (MuPDF) tidak."""
    svg = re.sub(r"&(?![A-Za-z]+;|#\d+;|#x[0-9A-Fa-f]+;)", "&amp;", svg)
    return re.sub(r"<(?![A-Za-z/!?])", "&lt;", svg)


# ─────────────────── warna SVG yang tidak dikenal MuPDF ───────────────────
RGBA = re.compile(r"rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+%?)\s*\)")
TAG_SVG = re.compile(r'<([A-Za-z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)(\s*/?)>')
ATRIBUT = re.compile(r'\s+([\w:-]+)="([^"]*)"')
GRADIEN = re.compile(r'<linearGradient\b((?:\s+[\w:-]+="[^"]*")*)\s*>(.*?)</linearGradient>', re.S)
STOP = re.compile(r'<stop\b((?:\s+[\w:-]+="[^"]*")*)\s*/?>')
SKALA_GRADIEN = 4      # piksel PNG per unit viewBox untuk gradien yang dirasterkan


def _angka(v, bawaan=1.0):
    """'0.5', '.5', '50%' → 0.5; kosong → bawaan."""
    v = (v or "").strip()
    if not v:
        return bawaan
    return float(v[:-1]) / 100 if v.endswith("%") else float(v)


def _rgba(v):
    """'rgba(r,g,b,a)' → ('rgb(r,g,b)', a); warna lain → None."""
    m = RGBA.fullmatch(v.strip())
    return (f"rgb({m.group(1)},{m.group(2)},{m.group(3)})", _angka(m.group(4))) if m else None


def _rgb_tupel(v):
    """Warna padat SVG (#rgb, #rrggbb, rgb(), rgba()) → ((r, g, b), alpha)."""
    v = v.strip()
    if re.fullmatch(r"#(?:[0-9A-Fa-f]{3}){1,2}", v):
        h = v[1:] if len(v) == 7 else "".join(c * 2 for c in v[1:])
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)), 1.0
    m = re.fullmatch(r"rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)", v)
    if m:
        return tuple(round(float(m.group(i))) for i in (1, 2, 3)), _angka(m.group(4))
    raise ValueError(f"warna gradien tidak dikenali: {v!r}")


def _gradien(svg):
    """id → (x1, y1, x2, y2, [(offset, (r, g, b), alpha), ...]) tiap linearGradient."""
    hasil = {}
    for m in GRADIEN.finditer(svg):
        a = dict(ATRIBUT.findall(m.group(1)))
        if a.get("gradientUnits", "objectBoundingBox") != "objectBoundingBox" or "gradientTransform" in a:
            raise ValueError(f"gradien {a.get('id')}: hanya objectBoundingBox tanpa gradientTransform yang didukung")
        stops, batas = [], 0.0
        for isi in STOP.findall(m.group(2)):
            sa = dict(ATRIBUT.findall(isi))
            rgb, alpha = _rgb_tupel(sa.get("stop-color", "#000"))
            batas = max(batas, min(1.0, _angka(sa.get("offset"), 0.0)))
            stops.append((batas, rgb, alpha * _angka(sa.get("stop-opacity"))))
        if stops:
            hasil[a["id"]] = (_angka(a.get("x1"), 0.0), _angka(a.get("y1"), 0.0),
                              _angka(a.get("x2"), 1.0), _angka(a.get("y2"), 0.0), stops)
    return hasil


def _warna_di(stops, t):
    """(r, g, b, alpha) gradien pada posisi t; di luar rentang stop memakai stop ujung (pad)."""
    if t <= stops[0][0]:
        return (*stops[0][1], stops[0][2])
    for (o0, c0, a0), (o1, c1, a1) in zip(stops, stops[1:]):
        if t <= o1:
            f = (t - o0) / (o1 - o0) if o1 > o0 else 1.0
            return (*(c0[i] + (c1[i] - c0[i]) * f for i in range(3)), a0 + (a1 - a0) * f)
    return (*stops[-1][1], stops[-1][2])


def _png_rgba(lebar, tinggi, piksel):
    """PNG RGBA 8-bit (alpha lurus) dari bytes piksel baris demi baris."""
    def blok(jenis, isi):
        return struct.pack(">I", len(isi)) + jenis + isi + struct.pack(">I", zlib.crc32(jenis + isi) & 0xFFFFFFFF)
    mentah = b"".join(b"\x00" + piksel[y * lebar * 4:(y + 1) * lebar * 4] for y in range(tinggi))
    return (b"\x89PNG\r\n\x1a\n" + blok(b"IHDR", struct.pack(">IIBBBBB", lebar, tinggi, 8, 6, 0, 0, 0))
            + blok(b"IDAT", zlib.compress(mentah, 9)) + blok(b"IEND", b""))


def _tag(nama, a, tutup="/"):
    return f"<{nama}" + "".join(f' {k}="{v}"' for k, v in a.items()) + f"{tutup}>"


def _rect_gradien(a, g):
    """<rect> berisi linearGradient → <image> PNG ber-alpha hasil rasterisasinya.

    Opasitas elemen dan sudut membulat (rx/ry) dipanggang ke kanal alpha PNG
    karena MuPDF mengabaikan `opacity` pada <image> dan tidak mengenal clipPath.
    Garis tepi kotak, bila ada, digambar ulang di atasnya tanpa isian.
    """
    x, y = _angka(a.get("x"), 0.0), _angka(a.get("y"), 0.0)
    w, h = _angka(a.get("width"), 0.0), _angka(a.get("height"), 0.0)
    rx = min(_angka(a.get("rx") or a.get("ry"), 0.0), w / 2)
    ry = min(_angka(a.get("ry") or a.get("rx"), 0.0), h / 2)
    op = _angka(a.get("opacity")) * _angka(a.get("fill-opacity"))
    x1, y1, x2, y2, stops = g
    dx, dy = x2 - x1, y2 - y1
    d2 = dx * dx + dy * dy or 1.0
    L, T = max(1, round(w * SKALA_GRADIEN)), max(1, round(h * SKALA_GRADIEN))
    piksel = bytearray(L * T * 4)
    for j in range(T):
        v = (j + 0.5) / T
        yy = v * h
        cy = ry if yy < ry else (h - ry if yy > h - ry else None)
        for i in range(L):
            u = (i + 0.5) / L
            r, g_, b, al = _warna_di(stops, ((u - x1) * dx + (v - y1) * dy) / d2)
            tutup = 1.0
            xx = u * w
            cx = rx if xx < rx else (w - rx if xx > w - rx else None)
            if cx is not None and cy is not None and rx > 0 and ry > 0:
                jarak = math.hypot((xx - cx) / rx, (yy - cy) / ry)
                tutup = min(1.0, max(0.0, (1.0 - jarak) * min(rx, ry) * SKALA_GRADIEN + 0.5))
            k = (j * L + i) * 4
            piksel[k:k + 4] = bytes((round(r), round(g_), round(b), round(255 * al * op * tutup)))
    uri = "data:image/png;base64," + base64.b64encode(_png_rgba(L, T, bytes(piksel))).decode("ascii")
    gambar = {"x": f"{x:g}", "y": f"{y:g}", "width": f"{w:g}", "height": f"{h:g}", "preserveAspectRatio": "none", "href": uri}
    if "transform" in a:
        gambar["transform"] = a["transform"]
    hasil = _tag("image", gambar)
    if a.get("stroke", "none") != "none":
        hasil += _tag("rect", {k: v for k, v in dict(a, fill="none").items() if k != "fill-opacity"})
    return hasil


def warna_mupdf(svg):
    """Sesuaikan warna SVG halaman modul dengan kemampuan MuPDF sebelum dirender.

    MuPDF (PyMuPDF 1.28 / MuPDF 1.29) merender isian dan garis `rgba()` serta
    isian gradien `url(#…)` sebagai HITAM, dan pada <text> mengabaikan
    `fill-opacity` (hanya `opacity` yang dihormati). Gambar CAD memakai rgba()
    untuk bidang transparan, arsiran, dan garis bantu (±2 100 atribut pada 134
    dari 168 gambar) serta dua batang skala kontur bergradien di Modul 9;
    tanpa langkah ini semuanya tercetak sebagai blok hitam di Word/PDF.

    * fill/stroke/stop-color rgba(r,g,b,a) → rgb(r,g,b) + *-opacity=a
      (dikalikan dengan *-opacity yang sudah ada);
    * pada <text>, alpha isian dipindah ke `opacity`;
    * <rect> berisi linearGradient → PNG ber-alpha hasil rasterisasi gradien
      itu (lihat `_rect_gradien`); elemen lain berisi gradien → warna tengahnya.

    Hanya salinan untuk Word yang diolah; halaman modul di peramban tidak berubah.
    """
    gradien = _gradien(svg)

    def tag(m):
        nama, isi, tutup = m.group(1), m.group(2), m.group(3)
        if "rgba(" not in isi and "url(#" not in isi and not (nama == "text" and "fill-opacity" in isi):
            return m.group(0)
        a = dict(ATRIBUT.findall(isi))
        for warna, opasitas in (("fill", "fill-opacity"), ("stroke", "stroke-opacity"), ("stop-color", "stop-opacity")):
            r = _rgba(a.get(warna, ""))
            if r:
                a[warna] = r[0]
                a[opasitas] = f"{r[1] * _angka(a.get(opasitas)):.4g}"
        for warna, opasitas in (("fill", "fill-opacity"), ("stroke", "stroke-opacity")):
            ref = re.fullmatch(r"url\(#([^)]+)\)", a.get(warna, "").strip())
            if not ref:
                continue
            if ref.group(1) not in gradien:
                raise ValueError(f"<{nama}> memakai {warna}=url(#{ref.group(1)}) yang bukan linearGradient")
            g = gradien[ref.group(1)]
            if nama == "rect" and warna == "fill":
                return _rect_gradien(a, g)
            r, g_, b, al = _warna_di(g[4], 0.5)
            a[warna] = f"rgb({round(r)},{round(g_)},{round(b)})"
            a[opasitas] = f"{al * _angka(a.get(opasitas)):.4g}"
        if nama == "text" and "fill-opacity" in a:
            a["opacity"] = f"{_angka(a.pop('fill-opacity')) * _angka(a.get('opacity')):.4g}"
        return _tag(nama, a, tutup)

    svg = TAG_SVG.sub(tag, svg)
    sisa = re.search(r'="[^"]*(?:rgba\(|url\(#)[^"]*"', svg)
    if sisa:
        raise ValueError(f"warna SVG yang tidak dapat dirender MuPDF masih tersisa: {sisa.group(0)[:80]}")
    return svg


# ─────────────────── garis putus yang diabaikan MuPDF ───────────────────
GEOMETRI = {"line": {"x1", "y1", "x2", "y2"}, "polyline": {"points"}, "polygon": {"points"},
            "rect": {"x", "y", "width", "height", "rx", "ry"}, "circle": {"cx", "cy", "r"},
            "ellipse": {"cx", "cy", "rx", "ry"}, "path": {"d"}}
TAG_BENTUK = re.compile(r'<(line|polyline|polygon|rect|circle|ellipse|path)((?:\s+[\w:-]+="[^"]*")*)(\s*/?)>')
ANGKA_SVG = re.compile(r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")
TOKEN_PATH = re.compile(r"[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")
LANGKAH_KURVA = 0.5    # panjang maksimum potongan lurus saat kurva/busur dipecah (unit viewBox)


def _busur(x0, y0, rx, ry, phi, besar, sapu, x, y):
    """Titik busur eliptis SVG (perintah A) dari (x0, y0) ke (x, y), tanpa titik awalnya.

    Konversi titik-ujung → pusat mengikuti catatan implementasi SVG (F.6.5),
    termasuk pembesaran jari-jari yang terlalu kecil.
    """
    if (x0, y0) == (x, y):
        return []
    rx, ry = abs(rx), abs(ry)
    if rx == 0 or ry == 0:
        return [(x, y)]
    c, s = math.cos(math.radians(phi)), math.sin(math.radians(phi))
    dx, dy = (x0 - x) / 2, (y0 - y) / 2
    x1, y1 = c * dx + s * dy, -s * dx + c * dy
    lam = (x1 / rx) ** 2 + (y1 / ry) ** 2
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    pembilang = (rx * ry) ** 2 - (rx * y1) ** 2 - (ry * x1) ** 2
    k = math.sqrt(max(0.0, pembilang / ((rx * y1) ** 2 + (ry * x1) ** 2))) * (-1 if besar == sapu else 1)
    pcx, pcy = k * rx * y1 / ry, -k * ry * x1 / rx
    cx, cy = c * pcx - s * pcy + (x0 + x) / 2, s * pcx + c * pcy + (y0 + y) / 2
    t0 = math.atan2((y1 - pcy) / ry, (x1 - pcx) / rx)
    dt = math.atan2((-y1 - pcy) / ry, (-x1 - pcx) / rx) - t0
    if sapu and dt < 0:
        dt += 2 * math.pi
    elif not sapu and dt > 0:
        dt -= 2 * math.pi
    n = max(8, math.ceil(abs(dt) * max(rx, ry) / LANGKAH_KURVA))
    titik = []
    for i in range(1, n):
        t = t0 + dt * i / n
        ex, ey = rx * math.cos(t), ry * math.sin(t)
        titik.append((cx + c * ex - s * ey, cy + s * ex + c * ey))
    return titik + [(x, y)]


def _bezier(p):
    """Titik kurva Bezier kuadrat/kubik berkendali p (de Casteljau), tanpa titik awalnya."""
    n = max(4, math.ceil(sum(math.dist(a, b) for a, b in zip(p, p[1:])) / LANGKAH_KURVA))
    hasil = []
    for i in range(1, n + 1):
        t, q = i / n, list(p)
        while len(q) > 1:
            q = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) for a, b in zip(q, q[1:])]
        hasil.append(q[0])
    return hasil


def _subjalur_path(d):
    """Data path SVG → [(titik, tertutup), ...] per subjalur; kurva dan busur dipecah lurus."""
    tok = TOKEN_PATH.findall(d)
    hasil, titik = [], []
    x = y = x0 = y0 = 0.0
    kendali, perintah, i = None, None, 0

    def ambil(jml):
        nonlocal i
        if i + jml > len(tok) or any(t.isalpha() for t in tok[i:i + jml]):
            raise ValueError(f"data path tidak lengkap: {d[:60]!r}")
        i += jml
        return [float(t) for t in tok[i - jml:i]]

    while i < len(tok):
        if tok[i].isalpha():
            perintah = tok[i]
            i += 1
        elif perintah is None:
            raise ValueError(f"data path tanpa perintah: {d[:60]!r}")
        P, rel = perintah.upper(), perintah.islower()
        if P == "Z":
            if len(titik) > 1:
                hasil.append((titik, True))
            titik, x, y, kendali, perintah = [], x0, y0, None, None
            continue
        ox, oy = (x, y) if rel else (0.0, 0.0)
        if P == "M":
            if len(titik) > 1:
                hasil.append((titik, False))
            vx, vy = ambil(2)
            x = x0 = ox + vx
            y = y0 = oy + vy
            titik, kendali = [(x, y)], None
            perintah = "l" if rel else "L"          # pasangan koordinat berikutnya = lineto
            continue
        if not titik:
            titik = [(x, y)]
        if P == "L":
            vx, vy = ambil(2)
            x, y, kendali = ox + vx, oy + vy, None
            titik.append((x, y))
        elif P == "H":
            x, kendali = ox + ambil(1)[0], None
            titik.append((x, y))
        elif P == "V":
            y, kendali = oy + ambil(1)[0], None
            titik.append((x, y))
        elif P in "CS":
            if P == "C":
                a1, b1, a2, b2, a, b = ambil(6)
                k1 = (ox + a1, oy + b1)
            else:
                a2, b2, a, b = ambil(4)
                k1 = (2 * x - kendali[0], 2 * y - kendali[1]) if kendali and kendali[2] == "C" else (x, y)
            k2, akhir = (ox + a2, oy + b2), (ox + a, oy + b)
            titik += _bezier([(x, y), k1, k2, akhir])
            kendali, (x, y) = (*k2, "C"), akhir
        elif P in "QT":
            if P == "Q":
                a1, b1, a, b = ambil(4)
                k1 = (ox + a1, oy + b1)
            else:
                a, b = ambil(2)
                k1 = (2 * x - kendali[0], 2 * y - kendali[1]) if kendali and kendali[2] == "Q" else (x, y)
            akhir = (ox + a, oy + b)
            titik += _bezier([(x, y), k1, akhir])
            kendali, (x, y) = (*k1, "Q"), akhir
        elif P == "A":
            rx, ry, phi, besar, sapu, a, b = ambil(7)
            if besar not in (0, 1) or sapu not in (0, 1):
                raise ValueError(f"flag busur harus 0/1 dan dipisah spasi: {d[:60]!r}")
            akhir = (ox + a, oy + b)
            titik += _busur(x, y, rx, ry, phi, besar == 1, sapu == 1, *akhir)
            kendali, (x, y) = None, akhir
        else:
            raise ValueError(f"perintah path {perintah!r} tidak dikenal: {d[:60]!r}")
    if len(titik) > 1:
        hasil.append((titik, False))
    return hasil


def _subjalur(nama, a):
    """Bentuk SVG → subjalur (titik, tertutup) menurut path setaranya di SVG 2.

    Titik awal dan arahnya mengikuti spesifikasi agar pola putus-putus jatuh di
    tempat yang sama dengan di peramban: persegi mulai di (x + rx, y) lalu
    searah jarum jam; lingkaran dan elips mulai di (cx + r, cy) ke arah sudut
    positif (searah jarum jam di layar).
    """
    def f(k):
        return _angka(a.get(k), 0.0)

    if nama == "line":
        return [([(f("x1"), f("y1")), (f("x2"), f("y2"))], False)]
    if nama in ("polyline", "polygon"):
        v = [float(t) for t in ANGKA_SVG.findall(a.get("points", ""))]
        return [(list(zip(v[0::2], v[1::2])), nama == "polygon")]
    if nama == "path":
        return _subjalur_path(a.get("d", ""))
    if nama == "rect":
        x, y, w, h = f("x"), f("y"), f("width"), f("height")
        rx = min(_angka(a.get("rx") or a.get("ry"), 0.0), w / 2)
        ry = min(_angka(a.get("ry") or a.get("rx"), 0.0), h / 2)
        if rx <= 0 or ry <= 0:
            return [([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], True)]
        return _subjalur_path(f"M {x + rx} {y} H {x + w - rx} A {rx} {ry} 0 0 1 {x + w} {y + ry} V {y + h - ry} "
                              f"A {rx} {ry} 0 0 1 {x + w - rx} {y + h} H {x + rx} A {rx} {ry} 0 0 1 {x} {y + h - ry} "
                              f"V {y + ry} A {rx} {ry} 0 0 1 {x + rx} {y} Z")
    cx, cy = f("cx"), f("cy")
    rx, ry = (f("r"), f("r")) if nama == "circle" else (f("rx"), f("ry"))
    return _subjalur_path(f"M {cx + rx} {cy} A {rx} {ry} 0 0 1 {cx} {cy + ry} A {rx} {ry} 0 0 1 {cx - rx} {cy} "
                          f"A {rx} {ry} 0 0 1 {cx} {cy - ry} A {rx} {ry} 0 0 1 {cx + rx} {cy} Z")


def _pola_putus(v):
    """'5 3' / '8,3,2,3' → daftar panjang strip-celah; 'none', negatif, atau jumlah 0 → None (utuh)."""
    v = v.strip()
    if v in ("", "none"):
        return None
    nilai = [float(t[:-2] if t.endswith("px") else t) for t in re.split(r"[\s,]+", v) if t]
    if any(n < 0 for n in nilai) or sum(nilai) <= 0:
        return None
    return nilai * 2 if len(nilai) % 2 else nilai       # jumlah ganjil diulang, seperti di peramban


def _strip(titik, tertutup, pola, geser):
    """Potongan 'nyala' pola garis putus di sepanjang satu subjalur → daftar polyline.

    Pola dimulai di titik awal subjalur (digeser `stroke-dashoffset`), berlanjut
    melewati sudut, dan strip yang melewati sudut tetap satu polyline sehingga
    sambungannya digambar seperti di peramban.
    """
    if tertutup and titik[0] != titik[-1]:
        titik = titik + [titik[0]]
    fase, i = geser % sum(pola), 0
    while fase >= pola[i]:
        fase -= pola[i]
        i = (i + 1) % len(pola)
    sisa = pola[i] - fase
    hasil, kini = [], ([titik[0]] if i % 2 == 0 else None)
    for a, b in zip(titik, titik[1:]):
        seg = math.dist(a, b)
        if seg <= 1e-9:
            continue
        t = 0.0
        while seg - t > sisa:
            t += sisa
            p = (a[0] + (b[0] - a[0]) * t / seg, a[1] + (b[1] - a[1]) * t / seg)
            if i % 2 == 0:
                kini.append(p)
                hasil.append(kini)
                kini = None
            else:
                kini = [p]
            i = (i + 1) % len(pola)
            sisa = pola[i]
        sisa -= seg - t
        if i % 2 == 0:
            kini.append(b)
    if i % 2 == 0 and kini and len(kini) > 1:
        hasil.append(kini)
    return hasil


def garis_putus_mupdf(svg):
    """Ganti garis putus-putus SVG dengan strip nyata sebelum dirender MuPDF.

    MuPDF mengabaikan `stroke-dasharray` dalam bentuk apa pun (spasi, koma, px,
    maupun style), sehingga garis tersembunyi, garis sumbu titik-strip, garis
    bantu, dan kontur rencana pada gambar CAD (453 elemen di 125 dari 168
    gambar) tercetak sebagai garis utuh di Word/PDF dan makna gambarnya berubah.
    Setiap bentuk bergaris putus dijalani sepanjang path setaranya (`_subjalur`)
    dan pola strip-celahnya dipotong menjadi subjalur M…L… dalam satu <path>
    tanpa isian, dengan atribut garis yang sama (warna, tebal, opasitas, ujung,
    sambungan, transform). Pola dimulai ulang di setiap subjalur dan
    `stroke-dashoffset` dihormati, seperti di peramban. Isian bentuknya, bila
    ada, tetap digambar dari elemen asli (stroke="none") di bawah garisnya.
    """
    def tag(m):
        nama, isi, tutup = m.group(1), m.group(2), m.group(3)
        if "stroke-dasharray" not in isi:
            return m.group(0)
        a = dict(ATRIBUT.findall(isi))
        polos = {k: v for k, v in a.items() if k not in ("stroke-dasharray", "stroke-dashoffset")}
        pola = _pola_putus(a.get("stroke-dasharray", ""))
        if pola is None or a.get("stroke", "none") == "none":
            return _tag(nama, polos, tutup)
        if "/" not in tutup:
            raise ValueError(f"<{nama}> bergaris putus yang berisi elemen anak belum didukung")
        if "pathLength" in a:
            raise ValueError(f"<{nama}> bergaris putus dengan pathLength belum didukung")
        geser = _angka(a.get("stroke-dashoffset"), 0.0)
        strip = [s for titik, tertutup in _subjalur(nama, a) if len(titik) > 1
                 for s in _strip(titik, tertutup, pola, geser)]
        d = " ".join("M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in s) for s in strip)
        hasil = ""
        if nama != "line" and a.get("fill") != "none":
            hasil += _tag(nama, dict(polos, stroke="none"), tutup)
        garis = {k: v for k, v in polos.items() if k not in GEOMETRI[nama] and k not in ("fill", "fill-opacity", "fill-rule")}
        return hasil + (_tag("path", {"d": d, "fill": "none", **garis}) if d else "")

    svg = TAG_BENTUK.sub(tag, svg)
    if "stroke-dasharray" in svg:
        raise ValueError("stroke-dasharray yang tidak dapat diubah menjadi segmen masih tersisa")
    return svg


PAD_UKUR = 64          # kelebihan kanvas saat mengukur luapan isi gambar (unit viewBox)
VIEWBOX = re.compile(r'viewBox="0 0 ([\d.]+) ([\d.]+)"')
LATAR_SVG = re.compile(r'<rect x="0" y="0" width="[\d.]+" height="[\d.]+"')


def _tulis_png(svg, png_path, dpi):
    svg_path = png_path.with_suffix(".svg")
    svg_path.write_text(svg, encoding="utf-8")
    d = fitz.open(str(svg_path))
    try:
        d[0].get_pixmap(dpi=dpi).save(str(png_path))
    finally:
        d.close()
    svg_path.unlink()


def _kanvas(svg, W, H, kiri, kanan, atas, bawah):
    """SVG dengan viewBox dan kotak latarnya diperluas sekian unit ke tiap sisi."""
    lebar, tinggi = W + kiri + kanan, H + atas + bawah
    svg = VIEWBOX.sub(f'viewBox="{-kiri:g} {-atas:g} {lebar:g} {tinggi:g}"', svg, count=1)
    return LATAR_SVG.sub(f'<rect x="{-kiri:g}" y="{-atas:g}" width="{lebar:g}" height="{tinggi:g}"', svg, count=1)


def _luapan(png_path, W, H, pad):
    """Berapa unit isi gambar melewati tiap sisi viewBox aslinya.

    Diukur pada PNG kanvas-lebih: hanya jalur tepi selebar `pad` yang dipindai.
    Tiga piksel terluar dilewati karena itu tepi anti-alias kotak latar, bukan isi.
    """
    pm = fitz.Pixmap(str(png_path))
    W_px, H_px, n, s = pm.width, pm.height, pm.n, memoryview(pm.samples)
    skala = W_px / (W + 2 * pad)                      # piksel per unit
    i0 = (3 * W_px + 3) * n
    latar = bytes(s[i0:i0 + 3])

    def kolom(x):
        return any(bytes(s[(y * W_px + x) * n:(y * W_px + x) * n + 3]) != latar for y in range(3, H_px - 3))

    def baris(y):
        return any(bytes(s[(y * W_px + x) * n:(y * W_px + x) * n + 3]) != latar for x in range(3, W_px - 3))

    x0, x1 = round(pad * skala), round((pad + W) * skala)
    y0, y1 = round(pad * skala), round((pad + H) * skala)
    lebih = (max((x0 - x for x in range(3, x0) if kolom(x)), default=0),
             max((x - x1 for x in range(x1, W_px - 3) if kolom(x)), default=0),
             max((y0 - y for y in range(3, y0) if baris(y)), default=0),
             max((y - y1 for y in range(y1, H_px - 3) if baris(y)), default=0))
    return [round(v / skala) + 3 if v > skala else 0 for v in lebih]


def render_svg(svg_markup, png_path, perluas_kanvas=True):
    """SVG halaman modul → PNG beresolusi cetak untuk disisipkan ke Word.

    Kanvasnya tidak selalu persis viewBox gambar. Metrik font MuPDF tidak sama
    dengan Inter yang dipakai peramban, sehingga sebagian label — terutama baris
    tebal pada gambar acuan tugas — melebar beberapa unit dan ujungnya terpotong
    bila gambar dirender tepat pada viewBox-nya. Gambar karena itu diukur dulu
    pada kanvas yang dilebihkan, lalu dirender ulang dengan viewBox dan kotak
    latar yang diperluas seperlunya saja. Gambar yang isinya sudah muat dirender
    apa adanya, sama seperti sebelumnya. Warna rgba() dan gradien lebih dulu
    diubah ke bentuk yang dikenal MuPDF (`warna_mupdf`) agar tidak tercetak hitam,
    dan garis putus-putus dipecah menjadi strip nyata (`garis_putus_mupdf`) agar
    tidak tercetak sebagai garis utuh.

    `perluas_kanvas=False` melewati langkah perluasan: gambar dirender tepat pada
    viewBox-nya. Dipakai generator TTL selama sebagian gambar TTL masih memuat
    teks yang juga melewati tepi kanvas di peramban (keterangan satu baris yang
    lebih lebar dari gambarnya); memperluas kanvas untuk teks semacam itu hanya
    mengecilkan seluruh gambar di Word tanpa membuat teksnya utuh.
    """
    svg = xml_aman(svg_markup)
    if "xmlns=" not in svg[:200]:
        svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    svg = garis_putus_mupdf(warna_mupdf(svg))
    m = VIEWBOX.search(svg[:300])
    if perluas_kanvas and m and LATAR_SVG.search(svg[:600]):
        W, H = float(m.group(1)), float(m.group(2))
        _tulis_png(_kanvas(svg, W, H, PAD_UKUR, PAD_UKUR, PAD_UKUR, PAD_UKUR), png_path, 72)
        lebih = _luapan(png_path, W, H, PAD_UKUR)
        if any(lebih):
            svg = _kanvas(svg, W, H, *lebih)
    _tulis_png(svg, png_path, 200)
