#!/usr/bin/env python3
# Pemeriksa halaman ujian Pemodelan CAD — GAGAL KERAS bila halaman hasil masih
# memuat sisa kerangka Teknik Tenaga Listrik.
#
# Pakai (dari root repo):  python scripts/cad-exam/periksa_exam.py
#
# Yang diperiksa:
#   1. Sisa kerangka terlarang: pyodide, editor kode, runAndCheck(, identitas
#      course TTL, dan seluruh mesin soal benar-salah. Blok widget chat AI
#      (AI-CHAT-AGENT:BEGIN/END) dikecualikan: isinya satu sumber dari repo
#      backend untuk seluruh 96 halaman dan memang menyebut keenam mata kuliah,
#      termasuk Teknik Tenaga Listrik. Blok itu wajib ada tepat sekali dan
#      mengenal Pemodelan CAD.
#   2. Jumlah kartu soal: UTS 20 PG + 10 tugas; UAS 20 PG + 10 tugas + 1 rakitan.
#      Karena kartu dirakit di klien dari data server, yang dihitung adalah
#      tabel poin per soal (EXAM_QID_POINTS) dan wadah bagiannya.
#   3. Konstanta halaman: EXAM_ID, DB_PATH, SCHEDULE_PATH, kunci penyimpanan,
#      nama berkas ekspor, callable unggah, dan potongan kartu unggah.
#   4. Poin per soal cocok dengan bobot Sub-CPMK di scripts/cad-exam/<jenis>.py
#      (yang mencerminkan OBE_EXAM_CONFIG backend) dan berjumlah 100.
import importlib
import json
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
REPO = SCR.parent.parent

import pustaka  # noqa: E402

# (potongan terlarang, penjelasan)
TERLARANG = [
    ("pyodide", "Pyodide (Python di peramban) harus dibuang seluruhnya"),
    ("Pyodide", "Pyodide (Python di peramban) harus dibuang seluruhnya"),
    ("loadPyodide", "pemuat Pyodide"),
    ("runAndCheck(", "pemanggil eksekutor Python kerangka"),
    ("code-textarea", "editor kode Python"),
    ("<textarea class=\"code-textarea\"", "editor kode Python"),
    ("stdout-box", "kotak keluaran Python"),
    ("onCodeInput", "penangan editor kode"),
    ("getElementById('code-", "kolom kode Python per soal"),
    ("teknik_tenaga_listrik", "identitas course Teknik Tenaga Listrik"),
    ("teknik-tenaga-listrik", "identitas course Teknik Tenaga Listrik"),
    ("Teknik Tenaga Listrik", "nama course Teknik Tenaga Listrik"),
    ("TeknikTenagaListrik", "nama berkas ekspor Teknik Tenaga Listrik"),
    # Soal benar-salah: bank CAD memang tidak punya tf sama sekali.
    ("tf-card", "kartu soal benar-salah"),
    ("tfopts-", "wadah opsi benar-salah"),
    ("tfAnswered", "state jawaban benar-salah"),
    ("tfScores", "nilai benar-salah"),
    ("selectTF(", "penangan pilih benar-salah"),
    ("checkTF(", "penangan periksa benar-salah"),
    ("container-tf", "wadah soal benar-salah"),
    ("BENAR (TRUE)", "label opsi benar-salah"),
    ("SALAH (FALSE)", "label opsi benar-salah"),
    ("True / False", "judul bagian benar-salah"),
    ("scoreTFTotal", "penyebut nilai bagian benar-salah"),
    ("_TF = d.tf", "pemuat bank soal benar-salah"),
    # Tautan Google Drive diganti unggahan berkas langsung ke server.
    ("id=\"gdrive-link\"", "kolom tautan Google Drive"),
    ("getElementById('gdrive-link')", "kolom tautan Google Drive"),
]

# Potongan yang WAJIB ada (kartu unggah berkas + identitas CAD).
WAJIB = [
    "window._unggahBerkasCallable",
    "unggahBerkasTugas",
    "examId: window.EXAM_ID, qId, nim: me.nim",
    "_buildTugasCard",
    "function pilihBerkas(qId)",
    "async function unggahBerkas(qId)",
    "function onNilaiInput(qId)",
    "async function kirimTugas(qId)",
    "window._terapkanSyaratBerkas",
    "function _parseNilai(v)",
    "berkas-row",
    "berkas-btn",
    "berkas-status-",
    "nilai-input",
    "visitors/pemodelan_cad/",
    "settings/pemodelan_cad/",
    "pemodelan_cad_identity_",
    "PemodelanCAD_",
    "Pemodelan CAD",
]

JENIS = {"uts": "UTS", "uas": "UAS"}
galat = []
catatan = []

BLOK_AI = re.compile(r"<!-- AI-CHAT-AGENT:BEGIN v\d+[^>]*-->.*?<!-- AI-CHAT-AGENT:END v\d+ -->", re.S)
BLOK_AI_WAJIB = ('"pemodelan_cad": [', '"pemodelan_cad": "', "pemodelan-cad)-(uts|uas)", "pemodelan_cad)-modul-")


def periksa(jenis):
    K = importlib.import_module(jenis)
    berkas = REPO / K.TUJUAN
    if not berkas.exists():
        galat.append(f"{K.TUJUAN}: berkas belum dibangun (jalankan bangun.py {jenis})")
        return
    s = berkas.read_text(encoding="utf-8")
    nama = K.TUJUAN

    # 1. Sisa kerangka (di luar blok widget chat AI; baris kosong pengganti blok
    #    menjaga nomor baris laporan tetap sama dengan berkas aslinya)
    blok = BLOK_AI.findall(s)
    if len(blok) != 1:
        galat.append(f"{nama}: blok AI-CHAT-AGENT harus ada tepat sekali, ditemukan {len(blok)}x")
    else:
        for w in BLOK_AI_WAJIB:
            if w not in blok[0]:
                galat.append(f"{nama}: blok AI-CHAT-AGENT belum mengenal Pemodelan CAD ({w!r})")
    luar = BLOK_AI.sub(lambda m: "\n" * m.group(0).count("\n"), s)
    for potongan, alasan in TERLARANG:
        n = luar.count(potongan)
        if n:
            baris = luar.count("\n", 0, luar.index(potongan)) + 1
            galat.append(f"{nama}: sisa kerangka {potongan!r} ({alasan}) — {n}x, pertama di baris {baris}")

    # 2. Potongan wajib
    for potongan in WAJIB:
        if potongan not in s:
            galat.append(f"{nama}: potongan wajib hilang -> {potongan!r}")

    # 3. Konstanta halaman
    konstanta = [
        (f"const EXAM_ID = '{K.EXAM_ID}';", "EXAM_ID"),
        (f"const DB_PATH = `visitors/pemodelan_cad/${{MODULE_ID}}`;", "DB_PATH"),
        (f"const SCHEDULE_PATH = `settings/pemodelan_cad/${{PERTEMUAN}}/schedule`;", "SCHEDULE_PATH"),
        ("const LOCAL_IDENTITY = `pemodelan_cad_identity_${MODULE_ID}`;", "LOCAL_IDENTITY"),
        (f"const _PIN_SESSION_KEY = 'pemodelan_cad_{jenis}_pinhash';", "kunci PIN sessionStorage"),
        (f"'pemodelan_cad_identity_{jenis}'", "kunci identitas localStorage"),
        (f"a.download = '{K.UNDUHAN}' + nim + '.html';", "nama berkas ekspor"),
        (f"const MODULE_ID = '{jenis}';", "MODULE_ID"),
        (f"const PERTEMUAN = '{jenis}';", "PERTEMUAN"),
        (f"<title>{K.JUDUL}</title>", "judul halaman"),
    ]
    for potongan, label in konstanta:
        if potongan not in s:
            galat.append(f"{nama}: konstanta {label} tidak sesuai — harap menemukan {potongan!r}")

    # 4. Jumlah kartu soal: tabel poin harus berisi tepat qId yang benar.
    m = re.search(r"const EXAM_QID_POINTS = (\{.*?\});", s)
    if not m:
        galat.append(f"{nama}: tabel EXAM_QID_POINTS tidak ditemukan")
        return
    tabel = json.loads(m.group(1))
    harap = pustaka.poin_soal(K.BOBOT, K.MAPPING, K.URUTAN, K.bobot_tipe)

    n_mc = sum(1 for q in tabel if re.fullmatch(r"mc\d+", q))
    n_c = sum(1 for q in tabel if re.fullmatch(r"c\d+", q))
    n_tugas = K.N_TUGAS + (1 if K.RAKITAN else 0)
    if n_mc != K.N_MC:
        galat.append(f"{nama}: jumlah kartu pilihan ganda {n_mc}, harap {K.N_MC}")
    if n_c != n_tugas:
        galat.append(f"{nama}: jumlah kartu tugas unggah {n_c}, harap {n_tugas}")
    if len(tabel) != K.N_SOAL:
        galat.append(f"{nama}: jumlah kartu soal {len(tabel)}, harap {K.N_SOAL}")
    if list(tabel) != list(harap):
        galat.append(f"{nama}: urutan qId tidak sama dengan OBE_ORDER backend")
    for q, p in harap.items():
        if abs(float(tabel.get(q, -1)) - p) > 1e-4:
            galat.append(f"{nama}: poin {q} = {tabel.get(q)}, harap {p}")
    total = sum(tabel.values())
    if abs(total - 100.0) > 1e-3:
        galat.append(f"{nama}: Σ poin per soal {total}, harap 100")

    # 5. Wadah bagian: PG selalu ada, tugas selalu ada, rakitan hanya di UAS.
    for wadah in ('id="container-mc"', 'id="container-comp-ez"', 'id="container-comp-hard"'):
        if wadah not in s:
            galat.append(f"{nama}: wadah soal {wadah} tidak ada")
    if K.RAKITAN:
        if 'id="u-bagian-c"' not in s:
            galat.append(f"{nama}: bagian tugas rakitan (u-bagian-c) tidak ada")
        if f"return qId === '{K.RAKITAN}';" not in s:
            galat.append(f"{nama}: _isHardComp tidak menandai {K.RAKITAN} sebagai tugas rakitan")
    else:
        if 'id="u-bagian-c"' in s:
            galat.append(f"{nama}: UTS tidak boleh punya bagian tugas rakitan")

    catatan.append(
        f"{nama}: {len(tabel)} soal ({n_mc} PG + {n_c} tugas unggah), "
        f"Σ poin {pustaka.ind(total)}, {len(s):,} karakter")


for jenis in JENIS:
    periksa(jenis)

print("── periksa_exam.py — halaman ujian Pemodelan CAD ──")
for c in catatan:
    print("  OK  " + c)
if galat:
    print()
    for g in galat:
        print("  GAGAL  " + g)
    print(f"\n{len(galat)} masalah ditemukan.")
    sys.exit(1)
print("\nSemua pemeriksaan lolos.")
