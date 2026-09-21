# Pemeriksa struktur konten modul CAD sebelum dibangun bangun.py: modul_N.py,
# animasi/modul-N.js, dan tugas_gambar_N.py harus lengkap dan saling cocok
# (9 bagian, 4 animasi dengan kanvas/slider/tombol yang ada di skrip animasi,
# 7 gambar — Gambar 7 = gambar kerja praktik terbimbing di bagian m-praktik —, 10 PG × 4 opsi, 5 label tugas, 3 pertanyaan forum × 4 opsi jajak,
# 5 gambar acuan tugas) tanpa menyentuh berkas bersama (index, validator, Admin).
#
# Pakai:  python scripts/cad-modul/periksa_modul.py 6
import importlib
import pathlib
import re
import subprocess
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from periksa_gambar import gambar_tugas_modul, periksa_svg  # noqa: E402


def periksa(N):
    gagal = []

    def cek(kondisi, pesan):
        if not kondisi:
            gagal.append(pesan)

    K = importlib.import_module(f"modul_{N}")
    P = N if N <= 7 else N + 1
    cek(K.NOMOR == N, "NOMOR")
    for nama in ["JUDUL", "JUDUL_PANJANG", "JUDUL_EKSPOR", "SUBNAV", "HERO", "TUGAS_HERO", "FORUM_SKENARIO_LMS", "FORUM_KANVAS"]:
        cek(isinstance(getattr(K, nama, None), str) and getattr(K, nama).strip(), f"{nama} kosong")
    cek(hasattr(K, "mc_block"), "mc_block belum diimpor dari pustaka")
    cek(len(re.findall(r'<a href="#m-', K.SUBNAV)) == 10, "SUBNAV harus 10 tautan (9 bagian + #m-pustaka)")
    cek(f'data-module-number="{N:02d}"' in K.HERO, "HERO data-module-number")
    cek("@@N_BAGIAN@@" in K.HERO and "@@N_ANIMASI@@" in K.HERO, "HERO placeholder @@N_BAGIAN@@/@@N_ANIMASI@@")
    cek(f"Pertemuan {P} " in K.HERO or f"Pertemuan {P}&" in K.HERO, f"HERO harus menyebut Pertemuan {P}")
    cek(f"Pertemuan {P}" in K.TUGAS_HERO, f"TUGAS_HERO harus menyebut Pertemuan {P}")

    materi = K.materi()
    n_bagian = len(re.findall(r'<div class="section" id="m-(?!pustaka)', materi))
    n_anim = len(re.findall(r'class="anim-title">Animasi \d', materi))
    n_fig = len(re.findall(r'<figure class="ilustrasi', materi))
    cek(n_bagian == 9, f"bagian materi {n_bagian}, harus 9")
    cek(n_anim == 4, f"animasi {n_anim}, harus 4")
    cek(n_fig == 7, f"gambar {n_fig}, harus 7 (6 materi + 1 gambar kerja praktik terbimbing)")
    # Gambar 7 = gambar kerja praktik terbimbing: harus berada di bagian m-praktik.
    i_pr, i_pu = materi.find('id="m-praktik"'), materi.find('id="m-pustaka"')
    cek(0 <= i_pr < materi.find("<strong>Gambar 7</strong>") < i_pu, "Gambar 7 harus berada di bagian m-praktik")
    cek('id="m-pustaka"' in materi, "bagian m-pustaka (referensi) tidak ada")
    for sid in re.findall(r'<a href="#(m-[\w-]+)"', K.SUBNAV):
        cek(f'id="{sid}"' in materi, f"tautan subnav #{sid} tidak punya bagian")
    for g in range(1, 8):
        fn = getattr(K, f"gambar{g}", None)
        cek(callable(fn), f"gambar{g} tidak ada")
        if callable(fn):
            svg = fn()
            cek(svg.startswith("<svg") and 'aria-label="Gambar' in svg, f"gambar{g} bukan SVG berlabel")
            # Pengurai SVG MuPDF (dipakai buat-modul-word.py) tidak mengenal rgba(): bidangnya
            # tercetak hitam pekat di dokumen Word. Gambar baru memakai hex + fill-opacity.
            if g == 7:
                cek("rgba(" not in svg, "gambar7 memakai rgba(); pakai warna hex + fill-opacity/stroke-opacity")
            for m in periksa_svg(svg):
                gagal.append(f"gambar{g}: {m}")

    js_path = SCR / "animasi" / f"modul-{N}.js"
    cek(js_path.exists(), "animasi/modul-N.js tidak ada")
    js = js_path.read_text(encoding="utf-8") if js_path.exists() else ""
    if js:
        r = subprocess.run(["node", "--check", str(js_path)], capture_output=True, text=True)
        cek(r.returncode == 0, f"node --check animasi gagal: {r.stderr[:300]}")
        daftar = re.findall(r"_TTL_DAFTAR\.push\(\['(\w+)',\s*\(\)\s*=>\s*(\w+)\(\),\s*'(\w+)',\s*\[([^\]]*)\]\]\)", js)
        cek(len(daftar) == 4, f"_TTL_DAFTAR.push harus 4 entri, ada {len(daftar)}")
        canvases = re.findall(r'<canvas id="(\w+)"', materi)
        cek(len(canvases) == 4, f"kanvas di materi {len(canvases)}, harus 4")
        for cv, draw, kunci, sliders in daftar:
            cek(cv in canvases, f"kanvas {cv} di _TTL_DAFTAR tidak ada di materi")
            cek(f"function {draw}(" in js, f"fungsi {draw} tidak ada di animasi")
            for sid in re.findall(r"'(\w+)'", sliders):
                cek(f'id="{sid}"' in materi, f"slider {sid} ({cv}) tidak ada di materi")
        for toggle in re.findall(r'onclick="(\w+)\(\)"', materi):
            cek(f"function {toggle}(" in js, f"tombol {toggle}() tidak punya fungsi di animasi")
        for tombol in re.findall(r'<button class="btn-anim" id="(\w+)"', materi):
            cek(tombol in js, f"id tombol {tombol} tidak dirujuk di animasi")
        for info in re.findall(r"<div id=\"(\w+)\" style=\"margin-top:10px", materi):
            cek(info in js, f"id info {info} tidak dirujuk di animasi")

    cek(isinstance(K.MC, list) and len(K.MC) == 10, "MC harus 10 soal")
    for i, item in enumerate(K.MC, 1):
        ok = isinstance(item, tuple) and len(item) == 3 and isinstance(item[1], list) and len(item[1]) == 4 and all(isinstance(o, str) and o.strip() for o in item[1])
        cek(ok, f"MC {i} harus (teks, [4 opsi], judul singkat)")
    cek(len(K.TUGAS_LABELS) == 5, "TUGAS_LABELS harus 5")
    cek(sorted(K.FORUM_POLL_BENAR) == [1, 2, 3] and all(v in (0, 1, 2, 3) for v in K.FORUM_POLL_BENAR.values()), "FORUM_POLL_BENAR {1..3: 0..3}")
    cek(len(K.FQ_JUDUL) == 3 and len(K.FQ_RINGKAS) == 3, "FQ_JUDUL/FQ_RINGKAS harus 3")
    cek(len(K.FORUM_CHIPS_LMS) == 4, "FORUM_CHIPS_LMS harus 4")
    forum = K.forum_page()
    cek('id="page-forum"' in forum and 'id="cvForum"' in forum, "forum_page harus memuat page-forum dan cvForum")
    for n in (1, 2, 3):
        cek(forum.count(f"voteForum({n},this,") == 4, f"jajak forum {n} harus 4 opsi")
        cek(f'id="fq{n}"' in forum, f"kartu fq{n} tidak ada")
    cek("function drawForumCanvas()" in K.FORUM_KANVAS, "FORUM_KANVAS harus mendefinisikan drawForumCanvas()")

    try:
        tg = gambar_tugas_modul(N)
        cek(len(tg) == 5, f"gambar tugas {len(tg)}, harus 5")
        for k, svg in enumerate(tg, 1):
            cek(f'aria-label="Tugas {k} — ' in svg, f"gambar tugas T{k} harus berlabel 'Tugas {k} — …'")
            for m in periksa_svg(svg):
                gagal.append(f"tugas T{k}: {m}")
    except Exception as e:  # noqa: BLE001
        gagal.append(f"tugas_gambar_{N}.gambar() gagal: {e}")

    if gagal:
        print(f"Modul {N}: {len(gagal)} masalah")
        for g in gagal:
            print("   -", g)
        return False
    print(f"Modul {N}: struktur OK (9 bagian, 4 animasi, 7 gambar, 10 PG, 5 tugas, 3 forum, 5 gambar tugas)")
    return True


if __name__ == "__main__":
    hasil = [periksa(int(x)) for x in sys.argv[1:]]
    sys.exit(0 if all(hasil) else 1)
