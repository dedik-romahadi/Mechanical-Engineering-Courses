# Pemeriksa animasi kanvas modul CAD di Chrome headless: teks yang TERPOTONG tepi kanvas,
# huruf terlalu kecil, teks yang saling menimpa, galat JavaScript, dan bentuk yang meluber.
#
# Halaman uji dirakit dari sumbernya (modul_N.materi() + animasi/dasar.js + animasi/modul-N.js,
# dengan font halaman modul dari Google Fonts), jadi perubahan skrip animasi bisa diuji TANPA
# membangun ulang halaman. requestAnimationFrame dimatikan sebelum skrip animasi dimuat, jadi
# satu panggilan fungsi gambar = satu bingkai dan hasil setiap jalan sama.
#
# Lebar kanvas nyata (diukur 22 Sep 2026 di halaman modul; tinggi bawaan 280):
#   layar >= 1366 px -> 1000 | 1024 -> 800 | 768 -> 570 | 500 -> 369
#   ponsel 414 -> 298 | 390 -> 274 | 360 -> 244 | 320 -> 204
# Tablet dan ponsel mendatar menghasilkan lebar di antaranya, jadi mode baku menyapu 33 lebar
# 1000..204 dengan siklus 460 bingkai pada tiga keadaan slider plus kisi keadaan dijeda.
# Cacat pada lebar >= 244 (ponsel 360 px ke atas) membuat kode keluar 1; lebar < 244 peringatan.
#
# Pakai:
#   python scripts/cad-modul/periksa_animasi_chrome.py              semua modul, mode ketat
#   python scripts/cad-modul/periksa_animasi_chrome.py 3 7 --cepat  8 lebar, 60 bingkai, tanpa jeda
#   ... --rinci          semua temuan
#   ... --bentuk         tampilkan juga bentuk yang meluber (peringatan)
#   ... --gambar DIR     simpan PNG tiap kanvas (keadaan bawaan) pada lebar 1000, 570, 298, 244
import base64
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
UKUR_JS = SCR / "ukur_animasi.js"
LEBAR_KETAT = [1000, 960, 920, 880, 840, 800, 760, 720, 680, 640, 600, 570, 540, 520, 519, 500, 480,
               460, 440, 420, 400, 380, 369, 350, 330, 310, 298, 285, 274, 260, 244, 224, 204]
LEBAR_CEPAT = [1000, 800, 570, 369, 298, 274, 244, 204]
WAJIB_MIN = 244
GAMBAR = [1000, 570, 298, 244]
FONT = ("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900"
        "&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap")
JENIS = (("potong", "TERPOTONG"), ("kecil", "HURUF < 8 px"), ("tumpang", "BERTUMPUK"), ("galat", "GALAT"))


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


def ukur_modul(N, chrome, tmp, lebar, bingkai, jeda, gambar):
    K = importlib.import_module(f"modul_{N}")
    js = (SCR / "animasi" / "dasar.js").read_text(encoding="utf-8") + "\n" + (SCR / "animasi" / f"modul-{N}.js").read_text(encoding="utf-8")
    uji = UKUR_JS.read_text(encoding="utf-8")
    atur = (f"window.UJI_LEBAR={json.dumps(lebar)}; window.UJI_BINGKAI={bingkai}; window.UJI_JEDA={json.dumps(jeda)}; "
            f"window.UJI_GAMBAR={json.dumps(GAMBAR if gambar else [])};")
    halaman = (f'<!doctype html><html><head><meta charset="utf-8"><link href="{FONT}" rel="stylesheet">'
               '<style>body{background:#0a101f;color:#ddd;font-family:"Source Sans 3",sans-serif} canvas{display:block}</style></head>'
               f'<body>{K.materi()}<script>window.requestAnimationFrame=()=>0; {atur}</script>'
               f'<script>{js}</script><script>{uji}</script></body></html>')
    berkas = pathlib.Path(tmp) / f"animasi_{N}.html"
    berkas.write_text(halaman, encoding="utf-8")
    r = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                        f"--user-data-dir={pathlib.Path(tmp) / 'profil'}", "--window-size=1280,900",
                        "--virtual-time-budget=600000", "--dump-dom", berkas.as_uri()], capture_output=True, timeout=1800)
    m = re.search(r"DATA&gt;&gt;(.*?)&lt;&lt;DATA", r.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        return None, f"pengukuran Modul {N} gagal (kode {r.returncode}): {r.stderr.decode('utf-8', 'replace')[:400]}"
    return json.loads(html.unescape(m.group(1))), None


def main():
    arg = sys.argv[1:]
    dir_gambar = pathlib.Path(arg[arg.index("--gambar") + 1]) if "--gambar" in arg else None
    modul = [int(a) for i, a in enumerate(arg) if a.isdigit() and (i == 0 or arg[i - 1] != "--gambar")] or list(range(1, 15))
    cepat, rinci, bentuk = "--cepat" in arg, "--rinci" in arg, "--bentuk" in arg
    lebar = LEBAR_CEPAT if cepat else LEBAR_KETAT
    if dir_gambar:
        dir_gambar.mkdir(parents=True, exist_ok=True)
        lebar = sorted(set(lebar) | set(GAMBAR), reverse=True)
    chrome = cari_chrome()
    cacat = {k: 0 for k, _ in JENIS}
    peringatan = 0
    with tempfile.TemporaryDirectory() as tmp:
        for N in modul:
            data, galat = ukur_modul(N, chrome, tmp, lebar, 60 if cepat else 460, not cepat, bool(dir_gambar))
            if galat:
                print(galat)
                cacat["galat"] += 1
                continue
            if not data["monoSiap"]:
                print(f"PERINGATAN Modul {N}: JetBrains Mono gagal dimuat dari Google Fonts; lebar teks memakai font cadangan")
            for cv, per in data["hasil"].items():
                if "galat" in per:
                    print(f"M{N} {cv}: {per['galat']}")
                    cacat["galat"] += 1
                    continue
                for L in map(str, lebar):
                    d = per[L]
                    if dir_gambar and d.get("png"):
                        (dir_gambar / f"M{N}_{cv}_{L}.png").write_bytes(base64.b64decode(d["png"].split(",", 1)[1]))
                    wajib = int(L) >= WAJIB_MIN
                    for k, label in JENIS:
                        if not d[k]:
                            continue
                        if wajib:
                            cacat[k] += len(d[k])
                        else:
                            peringatan += len(d[k])
                        print(f"M{N} {cv} lebar {L} (tinggi {d['H']}): {len(d[k])} {label}{'' if wajib else ' (peringatan)'}")
                        for c in (d[k] if rinci else d[k][:3]):
                            print(f"     - {c}")
                    if bentuk and d["bentuk"]:
                        print(f"M{N} {cv} lebar {L}: bentuk meluber {d['bentuk']} (peringatan)")
    mode = "cepat, 8 lebar" if cepat else f"ketat, {len(LEBAR_KETAT)} lebar + keadaan dijeda"
    ringkas = ", ".join(f"{cacat[k]} {label.lower()}" for k, label in JENIS)
    print(f"Animasi modul {', '.join(map(str, modul))} ({mode}): {ringkas} pada lebar >= {WAJIB_MIN}; {peringatan} peringatan di bawahnya")
    sys.exit(1 if sum(cacat.values()) else 0)


if __name__ == "__main__":
    main()
