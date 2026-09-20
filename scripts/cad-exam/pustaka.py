# Pustaka bersama generator halaman ujian Pemodelan CAD.
#
# Isinya tiga kelompok:
#   1. Penyunting teks ber-assert (ganti / ganti_re / potong / buang) — polanya
#      sama dengan scripts/cad-modul/bangun.py: setiap jangkar yang meleset
#      langsung menggagalkan build, bukan diam-diam menghasilkan halaman rusak.
#   2. Penghitung poin per soal (EXAM_QID_POINTS) dari bobot Sub-CPMK OBE, memakai
#      rumus yang sama dengan _examQPoints di backend functions/index.js.
#   3. Format angka gaya Indonesia untuk teks di halaman.
import re


class Sunting:
    """Naskah HTML yang disunting dengan jangkar ber-assert."""

    def __init__(self, teks, nama="berkas"):
        self.s = teks
        self.nama = nama

    # ── penyunting dasar ────────────────────────────────────────────────────
    def ganti(self, a, b, n=1):
        c = self.s.count(a)
        assert c == n, f"[{self.nama}] jangkar {a[:80]!r}: {c}x, harap {n}x"
        self.s = self.s.replace(a, b)

    def ganti_re(self, pola, pengganti, n=1, flags=re.S):
        self.s, c = re.subn(pola, pengganti, self.s, flags=flags)
        assert c == n, f"[{self.nama}] regex {pola[:80]!r}: {c}x, harap {n}x"

    def potong(self, awal, akhir, baru, sertakan_akhir=True):
        """Ganti seluruh rentang dari `awal` sampai `akhir` dengan `baru`."""
        ca = self.s.count(awal)
        assert ca == 1, f"[{self.nama}] awal {awal[:80]!r}: {ca}x, harap 1x"
        i = self.s.index(awal)
        j = self.s.find(akhir, i)
        assert j >= 0, f"[{self.nama}] akhir {akhir[:80]!r} tidak ada setelah awal"
        if sertakan_akhir:
            j += len(akhir)
        self.s = self.s[:i] + baru + self.s[j:]

    def buang(self, awal, akhir, sertakan_akhir=True):
        self.potong(awal, akhir, "", sertakan_akhir)

    def hapus(self, a, n=1):
        self.ganti(a, "", n)

    # ── pemeriksa ───────────────────────────────────────────────────────────
    def jumlah(self, a):
        return self.s.count(a)

    def wajib_kosong(self, *pola):
        """Pastikan sisa kerangka benar-benar sudah hilang (beserta cuplikannya)."""
        for p in pola:
            c = self.s.count(p)
            if c:
                cuplik = []
                i = 0
                while len(cuplik) < 4:
                    i = self.s.find(p, i)
                    if i < 0:
                        break
                    baris = self.s.count("\n", 0, i) + 1
                    cuplik.append(f"    baris {baris}: …{self.s[max(0, i - 70):i + 70]}…".replace("\n", "⏎"))
                    i += len(p)
                raise AssertionError(
                    f"[{self.nama}] sisa kerangka {p!r} masih {c}x\n" + "\n".join(cuplik))

    def wajib_ada(self, *pola):
        for p in pola:
            assert p in self.s, f"[{self.nama}] penanda {p!r} tidak ditemukan"


# ── Poin per soal (EXAM_QID_POINTS) ─────────────────────────────────────────
# Rumus identik dengan _examQPoints() di backend functions/index.js:
#   poin(soal) = (bobot_sub / Σbobot) × 100 × bobot_tipe(soal) / Σbobot_tipe(sub)
# Bobot tipe Pemodelan CAD: PG = 1, tugas unggah sub-model = 2, tugas rakitan = 6.
def poin_soal(bobot, mapping, urutan, bobot_tipe):
    """bobot: {sub: angka}; mapping: {sub: [posisi 1-based]}; urutan: [qId] 1-based;
    bobot_tipe: fungsi(indeks 0-based) -> bobot tipe soal."""
    sum_bobot = sum(float(v) for v in bobot.values())
    assert sum_bobot > 0, "Σ bobot Sub-CPMK harus > 0"
    tepat = {}
    for sub, posisi in mapping.items():
        sub_total = (float(bobot[sub]) / sum_bobot) * 100.0
        sum_w = sum(bobot_tipe(p - 1) for p in posisi)
        for p in posisi:
            tepat[urutan[p - 1]] = sub_total * (bobot_tipe(p - 1) / sum_w)
    assert len(tepat) == len(urutan), f"pemetaan OBE tidak menutup semua soal: {len(tepat)} vs {len(urutan)}"
    total = sum(tepat.values())
    assert abs(total - 100.0) < 1e-9, f"Σ poin = {total}, harap 100"
    # Pembulatan 4 desimal hanya untuk tampilan (sama seperti tabel exam lain);
    # simpangan total karenanya wajar beberapa per sepuluh ribu.
    poin = {q: round(tepat[q], 4) for q in urutan}
    assert abs(sum(poin.values()) - 100.0) < 1e-3, f"Σ poin bulat = {sum(poin.values())}"
    return poin


def json_poin(poin):
    """Tabel EXAM_QID_POINTS sebagai literal JS (angka tanpa nol ekor)."""
    bagian = []
    for q, p in poin.items():
        n = round(p, 4)
        teks = f"{n:.4f}".rstrip("0").rstrip(".")
        bagian.append(f'"{q}":{teks}')
    return "{" + ",".join(bagian) + "}"


def ind(x, d=2):
    """Angka gaya Indonesia: koma desimal, titik ribuan."""
    s = f"{x:,.{d}f}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".")


def persen(x):
    """Persentase ringkas untuk tabel bobot Sub-CPMK (mis. 18,18)."""
    return ind(x, 2)
