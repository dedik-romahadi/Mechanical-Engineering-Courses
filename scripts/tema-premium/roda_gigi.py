"""Hiasan cover: roda gigi bergaris halus yang berputar dan saling berkait.

Dua kelompok SVG (kanan atas dan kiri bawah) menggantikan gelombang sinyal di dalam
<div class="hero-waves">. Setiap pasangan roda gigi memakai modul yang sama sehingga
lingkaran jarak bagi bersinggungan, kecepatan sudut berbanding terbalik dengan jumlah
gigi, dan fase awal diatur agar gigi masuk ke celah pasangannya.
"""
import math


def _profil(n, m):
    """Jalur tertutup satu roda gigi (pusat 0,0): gigi trapesium sederhana."""
    rp = m * n / 2            # jari-jari lingkaran jarak bagi
    ra = rp + m               # jari-jari kepala
    rf = rp - 1.25 * m        # jari-jari kaki
    p = 2 * math.pi / n
    titik = []
    for i in range(n):
        c = i * p
        for sudut, r in ((c - 0.5 * p, rf), (c - 0.27 * p, rf), (c - 0.15 * p, ra),
                         (c + 0.15 * p, ra), (c + 0.27 * p, rf)):
            titik.append((r * math.cos(sudut), r * math.sin(sudut)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in titik) + " Z"
    return d, rp, rf


def _roda(n, m, periode, arah, fase, kelas):
    d, rp, rf = _profil(n, m)
    hub, lubang = rf * 0.42, rf * 0.16
    jari = "".join(
        f'<circle cx="{0.68 * rf * math.cos(k * math.pi / 3):.1f}" '
        f'cy="{0.68 * rf * math.sin(k * math.pi / 3):.1f}" r="{0.14 * rf:.1f}"/>'
        for k in range(6)) if n >= 16 else ""
    return (f'<g transform="rotate({fase:.2f})"><g class="tp-gigi {kelas}" '
            f'style="--tp-putar:{periode:.1f}s;--tp-arah:{arah}">'
            f'<path d="{d}"/><circle r="{rf * 0.86:.1f}"/><circle r="{hub:.1f}"/>'
            f'<circle r="{lubang:.1f}"/>{jari}</g></g>')


def _pasangan(ga, gb, m, sudut_deg, periode_a, kelas):
    """Dua roda gigi berkait: A di (0,0), B pada arah sudut_deg."""
    na, nb = ga, gb
    jarak = m * (na + nb) / 2
    t = math.radians(sudut_deg)
    bx, by = jarak * math.cos(t), jarak * math.sin(t)
    pa, pb = 360 / na, 360 / nb
    fase_a = sudut_deg % pa                       # gigi A menghadap B
    fase_b = (sudut_deg + 180 + pb / 2) % pb      # celah B menghadap A
    periode_b = periode_a * nb / na
    a = _roda(na, m, periode_a, "normal", fase_a, kelas + "-a")
    b = _roda(nb, m, periode_b, "reverse", fase_b, kelas + "-b")
    return a, (bx, by), b


def svg_roda_gigi():
    m = 12
    # Kelompok kanan atas: 24 gigi + 14 gigi.
    a1, (bx1, by1), b1 = _pasangan(24, 14, m, 145, 60, "k1")
    # Kelompok kiri bawah: 18 gigi + 10 gigi.
    a2, (bx2, by2), b2 = _pasangan(18, 10, m, -40, 46, "k2")
    kanan = (f'<svg class="tp-gigi-kanan" viewBox="-290 -165 455 395" aria-hidden="true" '
             f'focusable="false" xmlns="http://www.w3.org/2000/svg">'
             f'<g>{a1}<g transform="translate({bx1:.1f} {by1:.1f})">{b1}</g></g></svg>')
    kiri = (f'<svg class="tp-gigi-kiri" viewBox="-128 -188 335 316" aria-hidden="true" '
            f'focusable="false" xmlns="http://www.w3.org/2000/svg">'
            f'<g>{a2}<g transform="translate({bx2:.1f} {by2:.1f})">{b2}</g></g></svg>')
    return f'<div class="hero-waves tp-roda-gigi">{kanan}{kiri}</div>'


if __name__ == "__main__":
    print(svg_roda_gigi()[:400])
