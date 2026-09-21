# Pemeriksa tata letak gambar SVG modul CAD dengan pengukuran NYATA di Chrome headless.
#
# periksa_gambar.py hanya menaksir lebar teks (0,46 em per huruf) dan meloloskan teks sampai
# 4 px melewati tepi, sehingga banyak cacat lolos: pada 21-22 September 2026 alat ini menemukan
# 179 temuan di 40 dari 70 gambar tugas dan puluhan di gambar materi yang semuanya "bersih"
# menurut periksa_gambar.py (label dicoret garis, baris catatan terpotong tepi kanan, dimensi
# tergambar di luar kanvas). Semuanya sudah diperbaiki; alat ini menjaga agar tetap nol.
#
# Teks SVG memakai font 'Inter', yang TIDAK dimuat halaman modul (halaman hanya memuat Source
# Sans 3, Playfair Display, JetBrains Mono), jadi gambar tampil dengan font sistem perangkat.
# Jalankan dua kali: tanpa opsi (font sistem Windows, Segoe UI) dan dengan --inter (Inter dari
# Google Fonts, pendekatan lebar font sistem Mac/iPhone yang lebih lebar).
#
# Pakai:
#   python scripts/cad-modul/periksa_gambar_chrome.py               gambar tugas T1-T5, Modul 1-14
#   python scripts/cad-modul/periksa_gambar_chrome.py --materi 4 5  gambar1..gambar7 Modul 4 dan 5
#   python scripts/cad-modul/periksa_gambar_chrome.py --semua --inter
#   ... --rinci   cetak setiap temuan, termasuk yang kosmetik
#
# Aturan (koordinat ruang pengguna SVG, W x H = viewBox):
#   LEWAT   teks keluar kanvas                                   -> cacat
#   KANAN   x1 > W - 16 (ruang untuk font yang lebih lebar)       -> cacat; dengan --inter hanya peringatan
#   KIRI/ATAS/BAWAH  kurang dari 6 px dari tepi                   -> cacat
#   TUMPANG kotak TINTA dua teks bersentuhan (celah < 1 px)       -> cacat
#   KOTAK   teks memotong tepi <rect>                             -> cacat
#   GARIS   titik sampel garis/tepi jatuh di kotak TINTA teks     -> cacat
#   TUMPANG-bbox / GARIS-bbox  hanya kotak getBBox (ruang kosong di atas/bawah huruf) -> kosmetik
# Kode keluar 1 bila ada cacat.
import collections
import html
import importlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))

KANAN, TEPI, CELAH = 16, 6, 1.0
CACAT = {"LEWAT", "KANAN", "KIRI", "ATAS", "BAWAH", "TUMPANG", "KOTAK", "GARIS"}


def cari_chrome():
    calon = [os.environ.get("CHROME", ""),
             r"C:\Program Files\Google\Chrome\Application\chrome.exe",
             r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
             os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
             r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
             r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]
    calon += [shutil.which(n) or "" for n in ("google-chrome", "chromium", "chromium-browser", "chrome")]
    for c in calon:
        if c and pathlib.Path(c).exists():
            return c
    sys.exit("Chrome/Edge tidak ditemukan; set variabel lingkungan CHROME ke berkas chrome.exe")


def kumpulkan(modul, materi, tugas):
    """[(id, svg)] untuk gambar materi (gambar1..7 modul_N) dan/atau gambar tugas (T1..T5)."""
    out = []
    TG = importlib.import_module("tugas_gambar") if tugas else None
    for N in modul:
        if materi:
            K = importlib.import_module(f"modul_{N}")
            out += [(f"M{N} G{i}", getattr(K, f"gambar{i}")()) for i in range(1, 8) if hasattr(K, f"gambar{i}")]
        if tugas:
            out += [(f"M{N} T{k}", s) for k, s in enumerate(TG.tugas_gambar(N), 1)]
    return out


def ukur(gambar, inter):
    bag = []
    for gid, s in gambar:
        w, h = s.split('viewBox="0 0 ')[1].split('"')[0].split()[:2]
        bag.append(s.replace("<svg ", f'<svg width="{w}" height="{h}" data-id="{gid}" ', 1))
    js = (SCR / "ukur_gambar.js").read_text(encoding="utf-8")
    if inter:
        kepala = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">'
        skrip = ("Promise.all(['400 11px Inter','600 11px Inter','700 11px Inter'].map(f => document.fonts.load(f)))"
                 ".then(() => document.fonts.ready).then(() => { document.title = 'INTER=' + document.fonts.check('11px Inter'); " + js + " });")
    else:
        kepala, skrip = "", js
    halaman = (f'<!doctype html><html><head><meta charset="utf-8">{kepala}</head>'
               f'<body style="background:#111">{"".join(bag)}<script>{skrip}</script></body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        berkas = pathlib.Path(tmp) / "ukur.html"
        berkas.write_text(halaman, encoding="utf-8")
        r = subprocess.run([cari_chrome(), "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                            f"--user-data-dir={pathlib.Path(tmp) / 'profil'}", "--virtual-time-budget=30000",
                            "--dump-dom", berkas.as_uri()], capture_output=True, timeout=600)
    keluaran = r.stdout.decode("utf-8", "replace")
    m = re.search(r"DATA&gt;&gt;(.*?)&lt;&lt;DATA", keluaran, re.S)
    if not m:
        sys.exit(f"pengukuran gagal (kode {r.returncode}): {r.stderr.decode('utf-8', 'replace')[:600]}")
    if inter and "INTER=true" not in keluaran:
        sys.exit("font Inter gagal dimuat dari Google Fonts (perlu koneksi internet untuk --inter)")
    return json.loads(html.unescape(m.group(1)))


def nilai(data, inter):
    hasil = []
    for d in data:
        W, H, T = d["W"], d["H"], d["T"]
        mas = []
        for a in T:
            s = a["s"].strip()
            if a["x0"] < 0 or a["y0"] < 0 or a["x1"] > W or a["y1"] > H:
                mas.append(("LEWAT", f"'{s}' {a['x0']:.1f}..{a['x1']:.1f} × {a['y0']:.1f}..{a['y1']:.1f} (kanvas {W:g}×{H:g})"))
            if a["x1"] > W - KANAN:
                mas.append(("KANAN-peringatan" if inter else "KANAN", f"'{s}' berakhir {a['x1']:.1f}, sisa {W - a['x1']:.1f} px"))
            if 0 <= a["x0"] < TEPI:
                mas.append(("KIRI", f"'{s}' x0 = {a['x0']:.1f}"))
            if 0 <= a["y0"] < TEPI:
                mas.append(("ATAS", f"'{s}' y0 = {a['y0']:.1f}"))
            if H - TEPI < a["y1"] <= H:
                mas.append(("BAWAH", f"'{s}' y1 = {a['y1']:.1f} (H {H:g})"))
            for desk, n, ni in a["hits"]:
                mas.append(("GARIS" if ni else "GARIS-bbox", f"'{s}' ← {desk} ({ni} titik di tinta, {n} di bbox)"))
        for i in range(len(T)):
            for j in range(i + 1, len(T)):
                a, b = T[i], T[j]
                dx = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"])
                dy = min(a["y1"], b["y1"]) - max(a["y0"], b["y0"])
                if dx > -CELAH and dy > -CELAH:
                    ia, ib = a["ink"], b["ink"]
                    idx = min(ia[2], ib[2]) - max(ia[0], ib[0])
                    idy = min(ia[3], ib[3]) - max(ia[1], ib[1])
                    jenis = "TUMPANG" if (idx > -CELAH and idy > -CELAH) else "TUMPANG-bbox"
                    mas.append((jenis, f"'{a['s'].strip()}' ↔ '{b['s'].strip()}'"))
        for rx, ry, rw, rh in d["R"]:
            for a in T:
                potong = a["x0"] < rx + rw and rx < a["x1"] and a["y0"] < ry + rh and ry < a["y1"]
                dalam = a["x0"] >= rx and a["x1"] <= rx + rw and a["y0"] >= ry and a["y1"] <= ry + rh
                if potong and not dalam:
                    mas.append(("KOTAK", f"'{a['s'].strip()}' memotong rect {rx:g},{ry:g} {rw:g}×{rh:g}"))
        hasil.append((d["id"], mas))
    return hasil


def main():
    arg = sys.argv[1:]
    modul = [int(a) for a in arg if a.isdigit()] or list(range(1, 15))
    semua = "--semua" in arg
    materi = semua or "--materi" in arg
    tugas = semua or "--materi" not in arg
    inter = "--inter" in arg
    rinci = "--rinci" in arg
    hasil = nilai(ukur(kumpulkan(modul, materi, tugas), inter), inter)
    jumlah, n_cacat = collections.Counter(), 0
    for gid, mas in hasil:
        cacat = [x for x in mas if x[0] in CACAT]
        for k, _ in mas:
            jumlah[k] += 1
        n_cacat += bool(cacat)
        tampil = mas if rinci else cacat
        if tampil:
            print(gid)
            for k, s in tampil:
                print(f"   - {k} {s}")
    total_cacat = sum(v for k, v in jumlah.items() if k in CACAT)
    font = "Inter (pendekatan Mac/iPhone)" if inter else "font sistem"
    rincian = "  ".join(f"{k}={v}" for k, v in sorted(jumlah.items()))
    print(f"{font}: {len(hasil)} gambar, {total_cacat} cacat di {n_cacat} gambar" + (f"  [{rincian}]" if rincian else ""))
    sys.exit(1 if total_cacat else 0)


if __name__ == "__main__":
    main()
