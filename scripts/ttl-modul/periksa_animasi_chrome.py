# Pemeriksa galat animasi kanvas modul Teknik Tenaga Listrik di Chrome headless.
#
# Animasi yang sedang berjalan tetap dipanggil requestAnimationFrame saat mahasiswa pindah ke
# tab Forum/Tugas/Hasil, dan _ttlKanvas TTL (animasi/dasar.js, salinannya di animasi/modul-1.js)
# memberi W = 0 untuk kanvas tersembunyi. Radius arc/ellipse/createRadialGradient/roundRect yang
# dihitung dari W/H lalu bisa negatif: IndexSizeError, dan galat di dalam callback rAF menghentikan
# animasinya sampai PAUSE/PLAY ditekan atau halaman dimuat ulang (kasus Animasi 3 Modul 7,
# 29 September 2026). Pemeriksa ini memanggil setiap fungsi gambar di _TTL_DAFTAR pada:
#   - kanvas tersembunyi (induk display:none, buffer tetap / 1000 / 204) dan lebar 0 px;
#   - lebar kanvas nyata 1000..204 (layar >= 1366 px sampai ponsel 320 px), tinggi bawaan 280;
#   - lebar sangat sempit 150..1 px (peringatan saja; tidak terjadi di halaman);
# masing-masing berjalan (UJI_BINGKAI bingkai x slider bawaan/min/maks) dan dijeda (kisi slider).
# Setiap exception pada keadaan wajib membuat kode keluar 1. Tata letak teks TIDAK diperiksa di sini.
#
# Sumber yang diuji (bawaan: keduanya):
#   sumber   animasi/dasar.js + animasi/modul-N.js (Modul 1: animasi/modul-1.js saja), seperti
#            yang akan dirakit bangun.py; perubahan animasi bisa diuji tanpa membangun ulang halaman.
#   halaman  isi <script id="ttl-modul-N-animations"> di Teknik-Tenaga-Listrik/Modul/Modul-N.html,
#            yaitu yang benar-benar terbit (menangkap halaman yang tertinggal dari sumbernya).
# Materi (kanvas dan slider) selalu dari modul_N.materi().
#
# Pakai:
#   python scripts/ttl-modul/periksa_animasi_chrome.py              Modul 1-14, sumber + halaman
#   python scripts/ttl-modul/periksa_animasi_chrome.py 7 --sumber   Modul 7, sumber saja
#   ... --halaman    halaman terbit saja
#   ... --cepat      20 bingkai per keadaan slider (bawaan 120)
#   ... --rinci      semua temuan (bawaan: 3 per kanvas), termasuk peringatan
# Beberapa proses Chrome berjalan sekaligus (PARALEL); Modul 1-14 sumber + halaman sekitar 2 menit.
# Kode keluar 1 bila ada galat pada keadaan wajib, galat saat halaman dimuat, atau daftar animasi kosong.
import concurrent.futures
import html
import importlib.util
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))  # modul_N.py mengimpor pustaka milik TTL
HALAMAN = SCR.parent.parent / "Teknik-Tenaga-Listrik" / "Modul"
UJI_JS = SCR / "uji_animasi.js"
LEBAR_WAJIB = [1000, 800, 570, 369, 298, 274, 244, 204]
LEBAR_PERINGATAN = [150, 100, 50, 20, 1]
KEADAAN = ([{"label": "tersembunyi", "sembunyi": True, "wajib": True},
            {"label": "tersembunyi (buffer 1000)", "sembunyi": True, "buffer": 1000, "wajib": True},
            {"label": "tersembunyi (buffer 204)", "sembunyi": True, "buffer": 204, "wajib": True},
            {"label": "lebar 0", "lebar": 0, "wajib": True}]
           + [{"label": f"lebar {L}", "lebar": L, "wajib": True} for L in LEBAR_WAJIB]
           + [{"label": f"lebar {L}", "lebar": L, "wajib": False} for L in LEBAR_PERINGATAN])
BATAS_WAKTU = 900
PARALEL = max(1, min(6, (os.cpu_count() or 2) // 2))  # proses Chrome sekaligus


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


def _muat(nama, path):
    spec = importlib.util.spec_from_file_location(nama, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def skrip_animasi(N, asal):
    """Teks skrip animasi Modul N dari sumber atau dari halaman terbit; (teks, galat)."""
    if asal == "sumber":
        js = (SCR / "animasi" / f"modul-{N}.js").read_text(encoding="utf-8")
        return (js if N == 1 else (SCR / "animasi" / "dasar.js").read_text(encoding="utf-8") + "\n" + js), None
    berkas = HALAMAN / f"Modul-{N}.html"
    if not berkas.exists():
        return None, f"{berkas.name} tidak ada"
    m = re.search(rf'<script id="ttl-modul-{N}-animations">(.*?)</script>', berkas.read_text(encoding="utf-8"), re.S)
    return (m.group(1), None) if m else (None, f'{berkas.name}: <script id="ttl-modul-{N}-animations"> tidak ditemukan')


def daftar_cadangan(js):
    """Modul 1 tidak memakai _TTL_DAFTAR: daftar dan slidernya lokal di IIFE kickoff, jadi disalin dari teksnya."""
    m = re.search(r"const daftar=(\[.*?\]);\s*const slider=(\{.*?\});", js, re.S)
    if not m:
        return ""
    return (f"window.__DAFTAR_CADANGAN=(()=>{{const daftar={m.group(1)};const slider={m.group(2)};"
            "return daftar.map(([id,g,nama])=>[id,g,nama,slider[nama]||[]]);})();")


def rakit(N, asal, tmp, bingkai):
    """Tulis halaman uji Modul N (materi + skrip animasi + uji_animasi.js); (berkas, galat)."""
    js, galat = skrip_animasi(N, asal)
    if galat:
        return None, galat
    K = _muat(f"ttl_modul_{N}", SCR / f"modul_{N}.py")
    atur = f"window.UJI_KEADAAN={json.dumps(KEADAAN)}; window.UJI_BINGKAI={bingkai};"
    tangkap = ("window.__galatMulai=[]; window.addEventListener('error', e => window.__galatMulai.push("
               "String(e.message || e.error || 'galat').slice(0, 200)));")
    halaman = ('<!doctype html><html><head><meta charset="utf-8"><style>body{background:#0a101f;color:#ddd;'
               'font-family:sans-serif;margin:8px} canvas{width:100%;display:block}</style></head>'
               f'<body><div id="page-modul">{K.materi()}</div>'
               f'<script>window.requestAnimationFrame=()=>0; {atur} {tangkap}</script>'
               f'<script>{js}</script><script>{daftar_cadangan(js)}</script>'
               f'<script>{UJI_JS.read_text(encoding="utf-8")}</script></body></html>')
    berkas = pathlib.Path(tmp) / f"animasi_{N}_{asal}.html"
    berkas.write_text(halaman, encoding="utf-8")
    return berkas, None


def jalankan(chrome, berkas):
    """Buka halaman uji di Chrome headless (profil sendiri per halaman); (data, galat)."""
    try:
        r = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                            f"--user-data-dir={berkas.with_suffix('.profil')}", "--window-size=1280,900",
                            "--virtual-time-budget=600000", "--dump-dom", berkas.as_uri()],
                           capture_output=True, timeout=BATAS_WAKTU)
    except subprocess.TimeoutExpired:
        return None, f"waktu habis sesudah {BATAS_WAKTU} s (loop tak berujung pada salah satu keadaan?)"
    m = re.search(r"DATA&gt;&gt;(.*?)&lt;&lt;DATA", r.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        return None, f"pengujian gagal (kode {r.returncode}): {r.stderr.decode('utf-8', 'replace')[:400]}"
    return json.loads(html.unescape(m.group(1))), None


def main():
    arg = sys.argv[1:]
    modul = [int(a) for a in arg if a.isdigit()] or list(range(1, 15))
    asal = [a for a in ("sumber", "halaman") if f"--{a}" in arg] or ["sumber", "halaman"]
    cepat, rinci = "--cepat" in arg, "--rinci" in arg
    bingkai = 20 if cepat else 120
    chrome = cari_chrome()
    n_galat = n_peringatan = n_kanvas = n_panggil = 0
    with tempfile.TemporaryDirectory() as tmp:
        tugas = [(N, a, *rakit(N, a, tmp, bingkai)) for N in modul for a in asal]
        with concurrent.futures.ThreadPoolExecutor(PARALEL) as ex:
            hasil = list(ex.map(lambda t: (None, t[3]) if t[3] else jalankan(chrome, t[2]), tugas))
        for (N, a, _, _), (data, galat) in zip(tugas, hasil):
            if galat:
                print(f"M{N} {a}: GALAT {galat}")
                n_galat += 1
                continue
            for g in data["mulai"]:
                print(f"M{N} {a} saat halaman dimuat: GALAT {g}")
                n_galat += 1
            if not data["jumlah"]:
                print(f"M{N} {a}: GALAT daftar animasi kosong (_TTL_DAFTAR / kickoff Modul 1 tidak terbaca)")
                n_galat += 1
            for cv, r in data["kanvas"].items():
                n_kanvas += 1
                n_panggil += r["panggilan"]
                n_galat += len(r["galat"])
                n_peringatan += len(r["peringatan"])
                if r["galat"]:
                    print(f"M{N} {a} {cv}: {len(r['galat'])} GALAT")
                    for s in (r["galat"] if rinci else r["galat"][:3]):
                        print(f"     - {s}")
                if r["peringatan"] and rinci:
                    print(f"M{N} {a} {cv}: {len(r['peringatan'])} peringatan (lebar < 204)")
                    for s in r["peringatan"]:
                        print(f"     - {s}")
    wajib = len([k for k in KEADAAN if k["wajib"]])
    print(f"Animasi TTL modul {', '.join(map(str, modul))} ({' + '.join(asal)}, {n_kanvas} kanvas, "
          f"{wajib} keadaan wajib + {len(KEADAAN) - wajib} peringatan, {bingkai} bingkai x 3 slider + kisi jeda, "
          f"{n_panggil} panggilan gambar): "
          f"{n_galat} galat; {n_peringatan} peringatan pada lebar < 204" + ("" if rinci else " (--rinci untuk rinciannya)"))
    sys.exit(1 if n_galat else 0)


if __name__ == "__main__":
    main()
