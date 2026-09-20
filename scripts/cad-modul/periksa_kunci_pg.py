# Memasangkan kunci PG kanonik di backend dengan opsi yang benar-benar tertulis di
# frontend. Backend hanya menyimpan huruf (A-D) + penjelasan; halaman publik
# menyimpan urutan opsi. Bila urutannya tidak sama, mahasiswa melihat opsi benar
# pada posisi lain dan jawabannya dinilai salah — tidak ada validator lain yang
# menangkap ini. Pemeriksaan dilakukan dengan mencocokkan tiap opsi dengan
# penjelasan (explain) kunci: opsi yang benar biasanya berbagi paling banyak kata
# khas dengan penjelasannya. Hasilnya petunjuk, bukan vonis — periksa manual
# setiap temuan (pakai --rinci untuk melihat pasangannya).
#
# Pakai:  python scripts/cad-modul/periksa_kunci_pg.py 6 7 8      (tanpa argumen: 1..14)
#         python scripts/cad-modul/periksa_kunci_pg.py --rinci 9  (cetak pasangan lengkap)
import importlib
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
BE = SCR.parent.parent.parent / "Mechanical-Engineering-Courses-Backend"
STOP = set("""yang dan atau dengan untuk pada dari adalah akan tidak bukan dalam oleh ini itu sebagai
karena agar bisa dapat harus juga saat jika maka lalu serta tanpa satu dua tiga per setiap semua
hanya saja lebih paling sama tetap masih sudah belum antara sehingga bila ketika tiap
the and for with are not from that this they them""".split())
# Selisih minimum kata cocok sebelum sebuah pasangan dianggap mencurigakan.
AMBANG = 3


def _kata(teks):
    teks = re.sub(r"<[^>]+>", " ", teks).lower()
    return {w for w in re.findall(r"[a-zà-ÿ0-9_.]{4,}", teks) if w not in STOP}


def _bersih(teks):
    return re.sub(r"<[^>]+>", "", teks)


def _kunci_backend(N):
    """[(qId, huruf, explain)] dari seed backend, dibaca tanpa menjalankan Node."""
    p = BE / "functions" / "seed" / "modul" / f"pemodelan_cad-modul-{N}-answers.js"
    s = p.read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r'\{\s*qId:\s*"(mc\d+)",\s*type:\s*"mc",\s*points:\s*1,\s*answer:\s*"([A-D])",\s*explain:\s*"((?:[^"\\]|\\.)*)"', s):
        out.append((m.group(1), m.group(2), m.group(3).replace('\\"', '"')))
    return out


def periksa(N, rinci=False):
    K = importlib.import_module(f"modul_{N}")
    if not hasattr(K, "MC"):
        return [f"Modul {N}: modul_{N}.py belum memuat MC (konten belum lengkap)"]
    kunci = _kunci_backend(N)
    if len(kunci) != 10:
        return [f"Modul {N}: seed memuat {len(kunci)} kunci PG, harus 10"]
    if len(K.MC) != 10:
        return [f"Modul {N}: MC frontend {len(K.MC)} soal, harus 10"]
    gagal = []
    for (qid, huruf, explain), (soal, opsi, judul) in zip(kunci, K.MC):
        idx = "ABCD".index(huruf)
        kata_explain = _kata(explain)
        # Jumlah kata khas bersama, bukan rasio: opsi pendek yang salah
        # ("Hanya massa jenis") ber-rasio tinggi padahal isinya sedikit.
        skor = [len(kata_explain & _kata(o)) for o in opsi]
        terbaik = max(range(4), key=lambda k: skor[k])
        if rinci:
            print(f"  {qid} [{huruf}] {judul}")
            print(f"     opsi kunci : {_bersih(opsi[idx])[:110]}")
            print("     kata cocok : " + "  ".join(f"{'ABCD'[k]}={skor[k]}" + ("*" if k == idx else "") for k in range(4)))
        if skor[terbaik] >= skor[idx] + AMBANG:
            gagal.append(
                f"Modul {N} {qid}: kunci {huruf} ({skor[idx]} kata cocok) kalah dari opsi "
                f"{'ABCD'[terbaik]} ({skor[terbaik]} kata cocok)\n"
                f"     kunci   {huruf}: {_bersih(opsi[idx])[:100]}\n"
                f"     dugaan  {'ABCD'[terbaik]}: {_bersih(opsi[terbaik])[:100]}\n"
                f"     explain  : {_bersih(explain)[:130]}")
        if len({_bersih(o).strip() for o in opsi}) != 4:
            gagal.append(f"Modul {N} {qid}: ada opsi kembar")
    return gagal


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    rinci = "--rinci" in sys.argv
    total = []
    for N in [int(a) for a in args] or list(range(1, 15)):
        if not (SCR / f"modul_{N}.py").exists():
            continue
        if rinci:
            print(f"Modul {N}:")
        g = periksa(N, rinci)
        total += g
        print(f"Modul {N}: {len(g)} pasangan mencurigakan")
        for x in g:
            print("   -", x)
    print("TOTAL:", len(total))
    sys.exit(1 if total else 0)
