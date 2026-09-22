# Pemeriksa tata letak gambar SVG modul Teknik Tenaga Listrik dengan pengukuran NYATA di Chrome.
#
# Pembungkus tipis scripts/cad-modul/periksa_gambar_chrome.py: aturan, pengukuran getBBox/tinta
# (ukur_gambar.js), dan ambangnya sama persis; yang berbeda hanya sumber gambarnya, yaitu
# gambar1..gambar6 dari scripts/ttl-modul/modul_N.py (persis yang tampil di halaman dan di Word).
# Teks SVG TTL juga memakai 'Inter' yang tidak dimuat halaman modul, jadi jalankan dua kali:
# tanpa opsi (font sistem Windows) dan dengan --inter (pendekatan lebar font Mac/iPhone).
#
# Pada 22 September 2026 alat ini menemukan cacat di 67 dari 84 gambar TTL (teks keluar kanvas,
# keterangan satu baris lebih lebar dari gambar, label bertumpuk, garis mencoret label, batang
# grafik di luar kanvas); semuanya dirapikan dan alat ini menjaga agar tetap nol.
#
# Pakai:
#   python scripts/ttl-modul/periksa_gambar_chrome.py              gambar1..6 Modul 1-14
#   python scripts/ttl-modul/periksa_gambar_chrome.py 6 8 --inter  Modul 6 dan 8, font Inter
#   ... --rinci   cetak setiap temuan, termasuk yang kosmetik
# Kode keluar 1 bila ada cacat.
import collections
import importlib.util
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent


def _muat(nama, path):
    spec = importlib.util.spec_from_file_location(nama, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# Inti pemeriksa CAD. Ia menaruh scripts/cad-modul di depan sys.path saat dimuat; path itu
# dibuang lagi agar `modul_N` dan `pustaka` di bawah ini selalu milik TTL, bukan CAD.
INTI = _muat("periksa_gambar_inti", SCR.parent / "cad-modul" / "periksa_gambar_chrome.py")
sys.path[:] = [p for p in sys.path if pathlib.Path(p or ".").resolve() != (SCR.parent / "cad-modul").resolve()]
sys.path.insert(0, str(SCR))
if "pustaka" in sys.modules and pathlib.Path(sys.modules["pustaka"].__file__).resolve().parent != SCR:
    del sys.modules["pustaka"]


def kumpulkan(modul):
    """[(id, svg)] gambar materi gambar1..gambar6 tiap modul TTL."""
    out = []
    for N in modul:
        K = _muat(f"ttl_modul_{N}", SCR / f"modul_{N}.py")
        out += [(f"M{N} G{i}", getattr(K, f"gambar{i}")()) for i in range(1, 8) if hasattr(K, f"gambar{i}")]
    return out


def main():
    arg = sys.argv[1:]
    modul = [int(a) for a in arg if a.isdigit()] or list(range(1, 15))
    inter, rinci = "--inter" in arg, "--rinci" in arg
    hasil = INTI.nilai(INTI.ukur(kumpulkan(modul), inter), inter)
    jumlah, n_cacat = collections.Counter(), 0
    for gid, mas in hasil:
        cacat = [x for x in mas if x[0] in INTI.CACAT]
        for k, _ in mas:
            jumlah[k] += 1
        n_cacat += bool(cacat)
        tampil = mas if rinci else cacat
        if tampil:
            print(gid)
            for k, s in tampil:
                print(f"   - {k} {s}")
    total_cacat = sum(v for k, v in jumlah.items() if k in INTI.CACAT)
    font = "Inter (pendekatan Mac/iPhone)" if inter else "font sistem"
    rincian = "  ".join(f"{k}={v}" for k, v in sorted(jumlah.items()))
    print(f"{font}: {len(hasil)} gambar TTL, {total_cacat} cacat di {n_cacat} gambar" + (f"  [{rincian}]" if rincian else ""))
    sys.exit(1 if total_cacat else 0)


if __name__ == "__main__":
    main()
