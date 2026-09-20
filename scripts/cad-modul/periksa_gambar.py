# Pemeriksa tata letak gambar SVG modul CAD: menaksir lebar teks (0,55 × ukuran font per
# karakter; monospace 0,62) lalu melaporkan teks yang saling menimpa, keluar kanvas, atau
# melebihi kotak (rect) tempat ia berada. Dipakai sebelum PR agar gambar materi dan gambar
# acuan tugas tidak berantakan (keluhan dosen 20 Sep 2026). Pemeriksaan bbox nyata tetap
# dilakukan di browser (getBBox) untuk hasil akhir.
#
# Pakai:  python scripts/cad-modul/periksa_gambar.py 6 7      (modul_N.gambar1..6 + gambar tugas)
import importlib
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
RX_TEXT = re.compile(r'<text x="([\d.\-]+)" y="([\d.\-]+)" text-anchor="(\w+)" font-size="([\d.]+)" fill="[^"]*"(?: font-weight="[^"]*")? font-family="([^"]*)"[^>]*>([^<]*)</text>')
RX_RECT = re.compile(r'<rect x="([\d.\-]+)" y="([\d.\-]+)" width="([\d.]+)" height="([\d.]+)"')


def _bbox(m):
    x, y, anchor, size, fam, teks = float(m.group(1)), float(m.group(2)), m.group(3), float(m.group(4)), m.group(5), m.group(6)
    teks = re.sub(r"&[a-z]+;", "x", teks)
    if "Mono" in fam:
        lebar = len(teks) * size * 0.6
    else:  # Inter: spasi sempit, huruf rata-rata ~0,46 em (dikalibrasi dengan getBBox di browser)
        spasi = teks.count(" ")
        lebar = (len(teks) - spasi) * size * 0.46 + spasi * size * 0.28
    x0 = x - lebar / 2 if anchor == "middle" else (x - lebar if anchor == "end" else x)
    return [x0, y - size * 0.8, x0 + lebar, y + size * 0.25, teks, size]


def _tumpang(a, b, tol=1.0):
    return a[0] < b[2] - tol and b[0] < a[2] - tol and a[1] < b[3] - tol and b[1] < a[3] - tol


def periksa_svg(svg):
    """Daftar masalah tata letak pada satu string SVG (kosong bila bersih)."""
    vb = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
    if not vb:
        return ["viewBox tidak ditemukan"]
    W, H = int(vb.group(1)), int(vb.group(2))
    teks = [_bbox(m) for m in RX_TEXT.finditer(svg)]
    masalah = []
    for i, a in enumerate(teks):
        if a[0] < -2 or a[2] > W + 4 or a[1] < -2 or a[3] > H + 2:
            masalah.append(f"keluar kanvas: '{a[4][:40]}' [{a[0]:.0f}..{a[2]:.0f}] × [{a[1]:.0f}..{a[3]:.0f}] (kanvas {W}×{H})")
        for b in teks[i + 1:]:
            if _tumpang(a, b):
                masalah.append(f"teks × teks: '{a[4][:34]}' ↔ '{b[4][:34]}'")
    for m in RX_RECT.finditer(svg):
        rx, ry, rw, rh = (float(m.group(k)) for k in range(1, 5))
        for a in teks:
            cx, cy = (a[0] + a[2]) / 2, (a[1] + a[3]) / 2
            if rx < cx < rx + rw and ry < cy < ry + rh and (a[0] < rx - 2 or a[2] > rx + rw + 2) and rw < 260:
                masalah.append(f"teks melebihi kotak {rw:.0f}px: '{a[4][:40]}' lebar {a[2] - a[0]:.0f}")
    return sorted(set(masalah))


def gambar_tugas_modul(N):
    if N >= 6:
        return importlib.import_module(f"tugas_gambar_{N}").gambar()
    return importlib.import_module("tugas_gambar").tugas_gambar(N)


def periksa_modul(N):
    K = importlib.import_module(f"modul_{N}")
    total = 0
    for nama in sorted([n for n in dir(K) if re.fullmatch(r"gambar\d+", n)], key=lambda x: int(x[6:])):
        masalah = periksa_svg(getattr(K, nama)())
        total += len(masalah)
        print(f"Modul {N} {nama}: {len(masalah)} masalah")
        for mm in masalah:
            print("   -", mm)
    for k, svg in enumerate(gambar_tugas_modul(N), 1):
        masalah = periksa_svg(svg)
        total += len(masalah)
        print(f"Modul {N} tugas T{k}: {len(masalah)} masalah")
        for mm in masalah:
            print("   -", mm)
    return total


if __name__ == "__main__":
    jumlah = sum(periksa_modul(int(x)) for x in sys.argv[1:] or ["1", "2", "3", "4", "5"])
    print("TOTAL masalah:", jumlah)
    sys.exit(1 if jumlah else 0)
