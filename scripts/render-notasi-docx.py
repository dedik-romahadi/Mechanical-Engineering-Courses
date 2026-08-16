#!/usr/bin/env python3
"""
Merender notasi matematika pada modul versi Word.

Modul .docx ditulis dengan matematika ASCII: huruf Yunani dieja ("omega_n"),
pangkat ditulis mendatar ("s^2", "pangkat 3", "kuadrat"), dan akar ditulis
sebagai pemanggilan fungsi ("akar(k/m)"). Sebagian berkas sudah dirapikan
tangan memakai Unicode (m₁·ẍ₁ = −k₁·x₁), jadi gaya sasarannya sudah ada:
huruf Yunani sebagai lambang, pangkat dan indeks sebagai format naik-turun
Word yang sesungguhnya, serta operator sebagai lambang matematis.

Skrip ini menuntaskan gaya itu ke seluruh modul. Indeks dan pangkat dibuat
sebagai run ber-vertAlign, bukan karakter Unicode subscript, supaya berlaku
untuk sembarang huruf dan tampil bersih pula setelah dikonversi ke PDF.

YANG SENGAJA TIDAK DISENTUH — kode. Modul memuat potongan Python di dalam
prosa ("hitung y1=sp.diff(y_expr,x)", "np.arctan2(2*zeta*r, 1-r**2)"). Kalau
ikut dirender, kode yang disalin mahasiswa menjadi tidak bisa dijalankan.
Rentang kode dikenali dari dua sumber: pemanggilan pustaka/berkas skrip, dan
daftar identifier yang dipanen langsung dari blok kode halaman HTML modul.

Pakai:
    python scripts/render-notasi-docx.py               # seluruh modul
    python scripts/render-notasi-docx.py --periksa     # laporan saja
    python scripts/render-notasi-docx.py <berkas.docx>…
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

from lxml import etree

AKAR = Path(__file__).resolve().parent.parent
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = f"{{{W}}}"

BAGIAN = re.compile(r"^word/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$")

# ---------------------------------------------------------------- perlindungan

# Pemanggilan pustaka, nama berkas skrip, dan penanda sintaks Python. Pola
# pemanggilan sengaja memuat satu tingkat kurung bersarang supaya argumen di
# dalamnya ("2*zeta*r") ikut terlindungi, bukan hanya nama fungsinya.
KODE_SPAN = re.compile(
    r"\b(?:np|sp|pd|plt|sns|sk|scipy|numpy|pandas|signal|stats|df|math|sm)"
    r"\.[A-Za-z_][A-Za-z0-9_.]*\((?:[^()]|\([^()]*\))*\)"
    r"|\b[A-Za-z_][A-Za-z0-9_]*\.(?:py|ipynb|csv|json|txt|html)\b"
    r"|\b(?:import|def|lambda x|self)\b[^.;]*"
    r"|\*\*|==|!=(?==)|\bnp\.[A-Za-z_]+|\bsp\.[A-Za-z_]+|\bplt\.[A-Za-z_]+"
    # Pemanggilan metode pada objek apa pun ("F.subs(s,5)", "pfd.subs(...)")
    # dan fungsi pustaka yang ditulis tanpa awalan ("randn(N)"). Keduanya
    # muncul di baris HINT dan tetap harus dibaca sebagai kode.
    r"|\b[A-Za-z_]\w*\.(?:subs|diff|inv|evalf|simplify|dsolve|expand|factor"
    r"|apply|fit|predict|ewm|rolling|mean|std|sum|max|min|reshape|astype)\b"
    r"|\b(?:randn|rand|arange|linspace|zeros|ones|seed|dsolve|simplify)\("
)

# Penanda pada berkas ujian yang bentuknya menyerupai notasi berindeks tetapi
# sebenarnya label: nomor soal ("P5", "C13"), kode capaian ("Sub CPMK 1.1",
# "CPL 2"), dan penanda bobot. Tanpa pagar ini "Dari sistem P5" berubah menjadi
# "Dari sistem P₅" dan penomoran soalnya jadi kacau.
LABEL_UJIAN = re.compile(
    r"\b[PC]\d{1,2}\b|\bSub[- ]CPMK\s*\d+(?:\.\d+)?\b|\bCPL\s*\d+\b"
    r"|\bP\d{1,2}\b|\bBagian\s+[A-Z]\b")

# Nama yang jelas milik dunia kode meski tidak dipanen dari HTML.
KODE_TAMBAHAN = {
    "predict_proba", "class_weight", "feature_importances_", "cross_val_score",
    "n_estimators", "train_test_split", "random_state", "test_size", "fit_transform",
}


def panen_identifier_kode():
    """Identifier ber-underscore yang muncul di blok kode halaman modul."""
    nama = set(KODE_TAMBAHAN)
    for p in AKAR.glob("*/Modul/Modul-*.html"):
        h = p.read_text(encoding="utf-8")
        for blok in re.findall(r"<pre[\s\S]*?</pre>|<code[\s\S]*?</code>", h):
            polos = re.sub(r"<[^>]*>", "", blok)
            nama.update(t for t in re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", polos) if "_" in t)
    return nama


# ------------------------------------------------------------------ kosakata

# "xi" sengaja tidak masuk: di modul ia berarti x indeks i (|xi-median(x)|),
# bukan huruf ksi. "nu" dan "rho" tidak pernah muncul, jadi ikut dilewati.
YUNANI = {
    "omega": "ω", "Omega": "Ω", "alpha": "α", "alfa": "α", "beta": "β",
    "gamma": "γ", "Gamma": "Γ", "delta": "δ", "Delta": "Δ", "epsilon": "ε",
    "zeta": "ζ", "eta": "η", "theta": "θ", "Theta": "Θ", "lambda": "λ",
    "Lambda": "Λ", "mu": "μ", "sigma": "σ", "Sigma": "Σ", "tau": "τ",
    "phi": "φ", "Phi": "Φ", "psi": "ψ", "Psi": "Ψ", "chi": "χ", "kappa": "κ",
    "pi": "π", "Pi": "Π",
}
# Batas kata sendiri tidak dipakai: garis bawah termasuk aksara kata bagi
# regex, sehingga \bSigma\b gagal pada "Sigma_{n=1}" yang justru sasarannya.
RX_YUNANI = re.compile(r"(?<![A-Za-z0-9])(" + "|".join(sorted(YUNANI, key=len, reverse=True))
                       + r")(?![A-Za-z0-9])")

# Identifier ber-underscore yang langsung dirapatkan ke kurung buka adalah
# pemanggilan fungsi, penanda paling andal bahwa paragrafnya berbicara tentang
# kode. Basisnya wajib tiga aksara ke atas dan kurungnya tanpa spasi: sel tabel
# "m_a (ton)" adalah notasi berketerangan satuan, bukan pemanggilan fungsi.
PANGGIL_KODE = re.compile(r"\b[A-Za-z_][A-Za-z0-9]{2,}_[A-Za-z0-9_]+\(")

LAMBANG_YUNANI = "".join(sorted(set(YUNANI.values())))
# Aksara yang sah sebagai sisi kiri/kanan operator perkalian. Aksara indeks
# Unicode ikut masuk: di dalam pangkat, indeks sudah lebih dahulu diubah
# menjadi aksara itu, dan tanda kali sesudahnya tetap harus terbaca.
NOTASI = "A-Za-z0-9" + LAMBANG_YUNANI + "₀-ₜᵢ-ᵥⱼ"
# Nama Yunani boleh menjadi basis indeks (omega_n), jadi polanya ikut disusun.
# Basis indeks: satu-dua aksara, lambang Yunani, nama Yunani, atau akronim
# huruf besar (DMF_max, RMS_total, SNR_dB) yang lazim dipakai modul.
BASIS = (r"[A-Z]{2,4}|[A-Za-z]{1,2}|[" + LAMBANG_YUNANI + r"]|"
         + "|".join(sorted(YUNANI, key=len, reverse=True)))

# Aksara indeks Unicode yang tersedia pada font dokumen.
INDEKS_UNICODE = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
    "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
    "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
    "v": "ᵥ", "x": "ₓ",
}

OPERATOR = [
    ("<=>", "⇔"), ("<->", "↔"), ("->", "→"), ("=>", "⇒"),
    ("<=", "≤"), (">=", "≥"), ("!=", "≠"), ("+-", "±"),
]

# ------------------------------------------------------------- aturan render


def render_isi(frag):
    """Render isi indeks/pangkat: lambang saja, tanpa bertingkat lagi.

    Word tidak menampilkan indeks di dalam indeks dengan enak dibaca, jadi
    tingkat kedua diratakan; yang penting isinya tidak tertinggal mentah
    ("^{~}" harus menjadi ∞, bukan tanda gelombang).
    """
    frag = RX_YUNANI.sub(lambda m: YUNANI[m.group(1)], frag)
    # Indeks di dalam pangkat tidak bisa dibuat bertingkat dengan enak dibaca,
    # jadi dipakai aksara indeks Unicode; yang tak tersedia dibiarkan apa adanya.
    frag = re.sub(r"_([A-Za-z0-9]{1,4})(?![A-Za-z0-9])",
                  lambda m: ("".join(INDEKS_UNICODE[c] for c in m.group(1))
                             if all(c in INDEKS_UNICODE for c in m.group(1)) else m.group(0)),
                  frag)
    frag = re.sub(rf"(?<=[{NOTASI}\)\]])\s*\*\s*(?=[{NOTASI}\(\[])", "·", frag)
    frag = frag.replace("~", "∞")
    frag = re.sub(r"\binf\b", "∞", frag)
    for lama, baru in OPERATOR:
        frag = frag.replace(lama, baru)
    return frag


def sunting_paragraf(teks, kode_set, ujian=False):
    """Daftar (mulai, akhir, [(potongan, gaya)]) untuk satu teks paragraf.

    `gaya` bernilai None, "sub", atau "sup". Rentang yang tumpang tindih
    dibuang belakangan; aturan yang diterapkan lebih dahulu menang.
    """
    lindung = bytearray(len(teks))

    def tandai(a, b):
        for i in range(a, b):
            lindung[i] = 1

    def bebas(a, b):
        return not any(lindung[a:b])

    for m in KODE_SPAN.finditer(teks):
        tandai(m.start(), m.end())
    if ujian:
        for m in LABEL_UJIAN.finditer(teks):
            tandai(m.start(), m.end())
    # Daftar identifier kode hanya diberlakukan pada paragraf yang memang
    # berbicara tentang kode. Nama variabel Python di modul ini sengaja
    # meniru notasinya (omega_n, zeta_opt, m_a), jadi memberlakukannya di
    # mana-mana justru memblokir notasi yang hendak dirender.
    berkode = bool(KODE_SPAN.search(teks) or PANGGIL_KODE.search(teks))
    if berkode:
        for m in re.finditer(r"\b[A-Za-z_][A-Za-z0-9_]*\b", teks):
            if m.group(0) in kode_set:
                tandai(m.start(), m.end())
    # Nomor bagian dan berkas modul ("Bagian 08 Modul-10.html") bukan rumus.
    for m in re.finditer(r"Modul-\d+\.html|ISO\s*\d+[-\d]*|\b\d{4,}\b", teks):
        tandai(m.start(), m.end())

    sunting = []

    def tambah(a, b, bagian):
        if bebas(a, b):
            sunting.append((a, b, bagian))
            tandai(a, b)

    # 1. Turunan bertitik: x_dot menjadi ẋ dan x_ddot menjadi ẍ. Dipakai tanda
    #    diakritik gabungan, bukan aksara jadi, supaya berlaku untuk sembarang
    #    huruf basis.
    for m in re.finditer(r"\b([a-zA-Z])_(d?)dot(\d?)(?![A-Za-z0-9_])", teks):
        titik = "̈" if m.group(2) else "̇"
        bagian = [(m.group(1) + titik, None)]
        if m.group(3):
            bagian.append((m.group(3), "sub"))
        tambah(m.start(), m.end(), bagian)

    # 2. Batas integral dan penjumlahan: Int_0^T, Sigma_{n=1}^{~}
    for m in re.finditer(r"\b(Int|integral|Sigma|Sum|Prod)"
                         r"_(?:\{([^{}]*)\}|([A-Za-z0-9]+))"
                         r"(?:\^(?:\{([^{}]*)\}|([A-Za-z0-9~]+)))?", teks):
        kepala = {"Int": "∫", "integral": "∫", "Sigma": "Σ", "Sum": "Σ", "Prod": "∏"}[m.group(1)]
        bawah = m.group(2) if m.group(2) is not None else m.group(3)
        atas = m.group(4) if m.group(4) is not None else m.group(5)
        bagian = [(kepala, None), (render_isi(bawah), "sub")]
        if atas:
            bagian.append((render_isi(atas), "sup"))
        tambah(m.start(), m.end(), bagian)

    # 3. Indeks dan pangkat berkurung: _{...} dan ^{...}
    for m in re.finditer(r"([_^])\{([^{}]*)\}", teks):
        tambah(m.start(), m.end(),
               [(render_isi(m.group(2)), "sub" if m.group(1) == "_" else "sup")])

    # 4. Pangkat berkurung: e^(-2t) sampai e^(-2(t-1)) dan e^((3/2)x). Satu
    #    tingkat kurung bersarang ikut ditangkap; tanpa itu pangkat seperti
    #    z^(1/(1-n)) berhenti di kurung dalam dan tertinggal mentah.
    for m in re.finditer(r"\^\(((?:[^()]|\([^()]*\)){1,40})\)", teks):
        tambah(m.start(), m.end(), [(render_isi(m.group(1)), "sup")])

    # 5. Pangkat polos: s^2, x^m, r^-1, dan pangkat berlambang (e^-τ, ∫₀^∞)
    for m in re.finditer(rf"\^(-?[A-Za-z0-9{LAMBANG_YUNANI}∞]{{1,3}})(?![A-Za-z0-9])", teks):
        tambah(m.start(), m.end(), [(render_isi(m.group(1)), "sup")])

    # 6. Pangkat yang dieja. Basis wajib berupa notasi pendek atau kurung
    #    tutup, supaya frasa biasa ("rata-rata kuadrat") tidak ikut terangkat.
    #    "pangkat" dan "kuadrat" jauh lebih sering menjadi kata biasa bahasa
    #    Indonesia ("rumus kuadrat", "akar kuadrat", "bulatkan ke pangkat 2")
    #    daripada eksponen, jadi basisnya dibatasi pada kurung tutup, angka,
    #    atau notasi berindeks — bentuk yang tidak mungkin muncul dalam prosa.
    for m in re.finditer(r"(?<=[)\d])\s+pangkat\s+(-?\d{1,3})(?![A-Za-z0-9])", teks):
        tambah(m.start(), m.end(), [(m.group(1), "sup")])
    for kata, pangkat in (("kuadrat", "2"), ("kubik", "3")):
        for m in re.finditer(rf"(?:\)|\d|[A-Za-z]_[A-Za-z0-9]{{1,9}}"
                             rf"|(?<![A-Za-zà-ÿ])[A-Za-z])\s+{kata}(?![A-Za-z])", teks):
            tambah(m.end() - len(kata) - 1, m.end(), [(pangkat, "sup")])

    # 7. Akar: akar(...) dan sqrt(...)
    for m in re.finditer(r"\b(?:akar|sqrt)\(", teks):
        tambah(m.start(), m.end(), [("√(", None)])

    # 8. Indeks polos: omega_n, m_a, u_nyata. Basis satu-dua aksara atau nama
    #    Yunani; identifier berbasis kata adalah nama kode, bukan notasi.
    #    Wajib mendahului penggantian huruf Yunani, sebab kalau "omega" sudah
    #    berubah lebih dahulu, rentang "omega_a" tertolak karena bersinggungan.
    #    Kurung tutup ikut sah sebagai basis: "(αβ)_ij" pada tabel ANOVA.
    for m in re.finditer(rf"(?<![A-Za-z0-9_])({BASIS}|\))"
                         r"_([A-Za-z0-9]{1,9})(?![A-Za-z0-9_])", teks):
        basis = YUNANI.get(m.group(1), m.group(1))
        tambah(m.start(), m.end(), [(basis, None), (render_isi(m.group(2)), "sub")])

    # 9. Huruf Yunani yang berdiri sendiri
    for m in RX_YUNANI.finditer(teks):
        tambah(m.start(), m.end(), [(YUNANI[m.group(1)], None)])

    # 10. Indeks angka yang menempel: x0, C1, F0 — hanya bila bersentuhan
    #     dengan operator, supaya penomoran biasa ("Cell 4") tidak tersentuh.
    for m in (() if berkode else re.finditer(r"(?<![A-Za-z0-9_])([A-Za-z])(\d)(?![A-Za-z0-9])", teks)):
        kiri = teks[max(0, m.start() - 2):m.start()]
        kanan = teks[m.end():m.end() + 2]
        if re.search(r"[=+\-*/^_(\[·√,]", kiri) or re.search(r"^\s*[=+\-*/^)\]·,;]", kanan):
            tambah(m.start(), m.end(), [(m.group(1), None), (m.group(2), "sub")])

    # 11. Operator
    for lama, baru in OPERATOR:
        for m in re.finditer(re.escape(lama), teks):
            tambah(m.start(), m.end(), [(baru, None)])
    # Bintang sebagai kali, hanya di antara notasi.
    # Spasi wajib setangkup. "Z* optimal" memakai bintang sebagai penanda nilai
    # optimum, bukan perkalian, dan spasinya hanya di satu sisi.
    #
    # Paragraf bermuatan kode dilewati sama sekali: di sana bintang jauh lebih
    # sering menjadi operator Python ("np.random.randn(100)*0.1") yang akan
    # rusak bila diganti lambang kali.
    if not berkode:
        for m in re.finditer(rf"(?<=[{NOTASI}\)\]])(\s*)\*(\s*)(?=[{NOTASI}\(\[])", teks):
            if bool(m.group(1)) != bool(m.group(2)):
                continue
            tambah(m.start(), m.end(), [("·", None)])
    # Titik sebagai tanda kali ("3.mu", "zeta.r", "2 . m_a"). Syarat sisi kiri
    # diperiksa di Python, bukan lewat lookbehind: nama Yunani panjangnya
    # berbeda-beda, dan lookbehind Python menuntut lebar tetap.
    #
    # Sisi kiri yang sah: kurung tutup, angka, lambang atau nama Yunani, dan
    # notasi satu-dua aksara yang berdiri sendiri. Kata biasa sengaja ditolak
    # supaya titik akhir kalimat dan pemisah ribuan (1.000.000) tidak ikut
    # terbaca sebagai perkalian.
    KIRI_SAH = re.compile(rf"(?:\)|[0-9{LAMBANG_YUNANI}]|(?<![A-Za-zà-ÿ])[A-Za-z]{{1,2}}"
                          rf"|(?:{'|'.join(sorted(YUNANI, key=len, reverse=True))}))$")
    # Paragraf bermuatan kode dilewati: di sana titik adalah akses atribut
    # Python ("y(t).diff(t).subs(t,0)"), dan menggantinya dengan lambang kali
    # membuat kode yang disalin mahasiswa tidak bisa dijalankan.
    for m in (() if berkode else re.finditer(r"\s*\.\s*", teks)):
        rapat = m.group(0) == "."
        kanan = teks[m.end():m.end() + 2]
        # Bentuk berspasi wajib berspasi di KEDUA sisi. Tanpa syarat itu, titik
        # penutup nomor caption ikut tersambar ("Gambar 5. 5-fold" menjadi
        # "Gambar 5 · 5-fold") dan captionnya rusak.
        if not rapat and not m.group(0)[0].isspace():
            continue
        if not KIRI_SAH.search(teks[:m.start()]):
            continue
        if rapat and not re.match(rf"[a-z(\[{LAMBANG_YUNANI}]", kanan):
            continue
        if not rapat and not re.match(rf"[{NOTASI}(\[]", kanan):
            continue
        if not rapat and re.match(r"[A-Z][a-z]", kanan):
            continue  # awal kalimat baru, bukan perkalian
        tambah(m.start(), m.end(), [("·" if rapat else " · ", None)])
    # Tak hingga: hanya di posisi batas, bukan tanda "kira-kira" dalam kalimat.
    for m in re.finditer(r"(?<=[_^{\-+])~(?=[}\s)\],]|$)|\binf\b(?=[\s)}\],;]|$)", teks):
        tambah(m.start(), m.end(), [("∞", None)])

    sunting.sort()
    return sunting


# --------------------------------------------------------- penulisan ke Word


def rakit_ulang(p, sunting_untuk):
    """Terapkan hasil suntingan pada satu elemen paragraf Word."""
    run = [r for r in p.iter(NS + "r") if r.find(NS + "t") is not None]
    if not run:
        return 0
    potong, awal, pos = [], [], 0
    for r in run:
        t = r.find(NS + "t")
        s = t.text or ""
        potong.append(s)
        awal.append(pos)
        pos += len(s)
    teks = "".join(potong)
    sunting = sunting_untuk(teks)
    if not sunting:
        return 0

    def cari(g):
        lo, hi = 0, len(awal) - 1
        while lo < hi:
            t = (lo + hi + 1) // 2
            if awal[t] <= g:
                lo = t
            else:
                hi = t - 1
        return lo

    baru = list(potong)
    tambahan = {}  # indeks run -> daftar (teks, gaya) yang disisipkan sesudahnya
    for mulai, akhir, bagian in reversed(sunting):
        i0 = cari(mulai)
        i1 = cari(max(mulai, akhir - 1))
        o0 = mulai - awal[i0]
        # Bagian tanpa gaya digabung ke teks run itu sendiri; yang bergaya
        # harus menjadi run tersendiri karena formatnya berbeda.
        if all(g is None for _, g in bagian):
            gabung = "".join(t for t, _ in bagian)
            if i0 == i1:
                baru[i0] = baru[i0][:o0] + gabung + baru[i0][akhir - awal[i1]:]
            else:
                baru[i0] = baru[i0][:o0] + gabung
                for i in range(i0 + 1, i1):
                    baru[i] = ""
                baru[i1] = baru[i1][akhir - awal[i1]:]
            continue
        ekor = baru[i0][akhir - awal[i0]:] if i0 == i1 else ""
        baru[i0] = baru[i0][:o0]
        if i0 != i1:
            for i in range(i0 + 1, i1):
                baru[i] = ""
            baru[i1] = baru[i1][akhir - awal[i1]:]
        tambahan.setdefault(i0, [])
        tambahan[i0] = list(bagian) + ([(ekor, None)] if ekor else []) + tambahan[i0]

    for i, r in enumerate(run):
        t = r.find(NS + "t")
        if baru[i] != potong[i]:
            t.text = baru[i]
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    # Run tambahan disisipkan dari belakang supaya indeks saudara tetap sahih.
    for i in sorted(tambahan, reverse=True):
        induk = run[i].getparent()
        sisip = list(induk).index(run[i])
        for teks_bagian, gaya in reversed(tambahan[i]):
            if not teks_bagian:
                continue
            salinan = etree.fromstring(etree.tostring(run[i]))
            for anak in salinan.findall(NS + "t"):
                salinan.remove(anak)
            rpr = salinan.find(NS + "rPr")
            if rpr is None:
                rpr = etree.SubElement(salinan, NS + "rPr")
                salinan.insert(0, rpr)
            for lama in rpr.findall(NS + "vertAlign"):
                rpr.remove(lama)
            if gaya:
                va = etree.SubElement(rpr, NS + "vertAlign")
                va.set(NS + "val", "subscript" if gaya == "sub" else "superscript")
            tt = etree.SubElement(salinan, NS + "t")
            tt.text = teks_bagian
            tt.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
            induk.insert(sisip + 1, salinan)
    return len(sunting)


def proses(path: Path, kode_set, tulis: bool, ujian: bool = False) -> int:
    with zipfile.ZipFile(path) as z:
        isi = {n: z.read(n) for n in z.namelist()}
        urutan = z.namelist()
    total = 0
    for nama in urutan:
        if not BAGIAN.match(nama):
            continue
        root = etree.fromstring(isi[nama])
        n = 0
        for p in root.iter(NS + "p"):
            n += rakit_ulang(p, lambda t: sunting_paragraf(t, kode_set, ujian))
        if n:
            isi[nama] = etree.tostring(root, xml_declaration=True,
                                       encoding="UTF-8", standalone=True)
            total += n
    if total and tulis:
        sementara = path.with_suffix(".docx.baru")
        with zipfile.ZipFile(sementara, "w", zipfile.ZIP_DEFLATED) as z:
            for nama in urutan:
                z.writestr(nama, isi[nama])
        # Berkas hasil dibuka ulang sebagai sanitasi terakhir: docx yang rusak
        # ditolak Word maupun LibreOffice secara diam-diam.
        with zipfile.ZipFile(sementara) as z:
            for nama in urutan:
                if BAGIAN.match(nama):
                    etree.fromstring(z.read(nama))
        shutil.move(str(sementara), str(path))
    return total


def main() -> None:
    periksa = "--periksa" in sys.argv
    pilihan = [Path(a).resolve() for a in sys.argv[1:] if a.endswith(".docx")]
    # Berkas ujian punya pagar tambahan, jadi dipilih lewat saklar tersendiri
    # agar tidak ikut terproses bersama modul tanpa disengaja.
    if "--ujian" in sys.argv:
        berkas = pilihan or sorted(AKAR.glob("*/Exam/*.docx"))
    else:
        berkas = pilihan or sorted(AKAR.glob("*/Modul-Word/*.docx"))
    kode_set = panen_identifier_kode()
    print(f"{len(kode_set)} identifier kode dilindungi.")
    diubah = notasi = 0
    for p in berkas:
        n = proses(p, kode_set, tulis=not periksa, ujian=p.parent.name == "Exam")
        if n:
            diubah += 1
            notasi += n
            print(f"  {p.relative_to(AKAR)}: {n} notasi dirender")
    kata = "akan dirender" if periksa else "dirender"
    print(f"{diubah} dari {len(berkas)} docx {kata}, {notasi} notasi.")


if __name__ == "__main__":
    main()
