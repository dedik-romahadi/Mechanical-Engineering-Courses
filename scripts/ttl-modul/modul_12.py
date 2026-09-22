# Konten Modul 12 Teknik Tenaga Listrik — Aliran Daya, Peralatan, dan Pengembangan
# Sistem Distribusi (Sub-CPMK 6.1, Pertemuan 13). Angka contoh dihitung di sini agar
# teks, tabel, dan gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula, teks2,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 12
PERTEMUAN = 13
SUB_CPMK = "6.1"
JUDUL = "Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi"
JUDUL_PANJANG = "Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi"
JUDUL_EKSPOR = "Aliran Daya dan Proteksi Distribusi"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
VF = 20000 / SQ3
# aliran daya dua bus
P_AD, Q_AD, R_AD, X_AD, V1_AD = 3.0, 1.8, 3.2, 2.8, 20.0
V2_AD = V1_AD - (P_AD * R_AD + Q_AD * X_AD) / V1_AD
RUGI_AD = (P_AD ** 2 + Q_AD ** 2) / V1_AD ** 2 * 2.4 * 1000            # kW pada R = 2,4 Ω
PF_AD = 0.9
S_AD = P_AD / PF_AD
I_AD = S_AD * 1e6 / (SQ3 * 20000)
RUGI_BS = 3 * I_AD ** 2 * R_AD / 1e6                                     # MW pada R = 3,2 Ω
P_SRC = P_AD + RUGI_BS
# hubung singkat
SSC, L_HS, R_KM, X_KM = 240.0, 8.0, 0.4, 0.35
XS = 400 / SSC
I_SC_GI = VF / XS
Z_UJUNG = math.hypot(R_KM * L_HS, XS + X_KM * L_HS)
I_SC_UJUNG = VF / Z_UJUNG
NGR, Z1_HS, Z0_HS = 40.0, 2.5, 7.5
I_1F = 3 * VF / math.hypot(3 * NGR, 2 * Z1_HS + Z0_HS)
# fuse & trafo
S_TRAFO = 630.0
I_N_TM = S_TRAFO * 1000 / (SQ3 * 20000)
FUSE_K = 2.5
I2T_FUSE100, I_F_FUSE = 3.0e5, 2000.0
T_FUSE = I2T_FUSE100 / I_F_FUSE ** 2 * 1000                              # ms
INRUSH_K, INRUSH_T = 10.0, 0.1
I2T_INRUSH = (INRUSH_K * I_N_TM) ** 2 * INRUSH_T
# relai IDMT
TMS_C, M_C = 0.15, 4.0
T_IDMT = TMS_C * 0.14 / (M_C ** 0.02 - 1)
IF_K, IS_HILIR, TMS_HILIR, IS_HULU, MARGIN = 2000.0, 300.0, 0.1, 500.0, 0.4
T_HILIR = TMS_HILIR * 0.14 / ((IF_K / IS_HILIR) ** 0.02 - 1)
TMS_HULU = (T_HILIR + MARGIN) * ((IF_K / IS_HULU) ** 0.02 - 1) / 0.14
# peramalan
P0_F, G_F, N_F = 5.0, 0.07, 10
P_N_F = P0_F * (1 + G_F) ** N_F
S0_J, CAP_J, G_J = 5.5, 8.0, 0.07
N_JENUH = math.log(CAP_J / S0_J) / math.log(1 + G_J)
T_GANDA = math.log(2) / math.log(1 + G_J)
S0_G, CAP_G, G_G = 160.0, 250.0, 0.06
N_GARDU = math.log(0.8 * CAP_G / S0_G) / math.log(1 + G_G)
# ekonomi pengembangan (CRF)
I_RATE, N_UMUR = 0.10, 20
CRF = I_RATE * (1 + I_RATE) ** N_UMUR / ((1 + I_RATE) ** N_UMUR - 1)


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def bus(x, y, label, c):
    return f'<circle cx="{x}" cy="{y}" r="7" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x, y - 13, label, 10, c, "middle", "700")


def gambar1():
    b = t(330, 18, "Aliran daya penyulang radial 4 bus: backward sweep (kuning) lalu forward sweep (cyan)", 11.5, TX, "middle", "700")
    xs_ = [56, 188, 320, 452, 584]
    beban = [0, 0.8, 0.8, 0.8, 0.8]
    r, x, V1 = 0.8, 0.7, 20.0
    Q = 0.8 * math.tan(math.acos(0.85))
    # backward sweep dengan V nominal
    Pf, Qf, rugi = [0] * 5, [0] * 5, [0] * 5
    for k in range(4, 0, -1):
        Pd = beban[k] + (Pf[k + 1] if k < 4 else 0)
        Qd = Q + (Qf[k + 1] if k < 4 else 0)
        rugi[k] = (Pd ** 2 + Qd ** 2) / V1 ** 2 * r
        Pf[k] = Pd + rugi[k]
        Qf[k] = Qd + (Pd ** 2 + Qd ** 2) / V1 ** 2 * x
    V = [V1]
    for k in range(1, 5):
        V.append(V[-1] - (Pf[k] * r + Qf[k] * x) / V[-1])
    for k in range(5):
        b += bus(xs_[k], 70, "GI" if k == 0 else f"bus {k}", "#f59e0b" if k == 0 else "#00e09e")
        if k:
            b += kawat(xs_[k - 1] + 7, 70, xs_[k] - 7, 70, "#22d3ee", 2.2)
            b += t((xs_[k - 1] + xs_[k]) / 2, 60, f"{ind(Pf[k], 3)} MW", 9.5, "#f59e0b", "middle", "600") + t((xs_[k - 1] + xs_[k]) / 2, 86, f"rugi {ind(rugi[k] * 1000, 1)} kW", 9, "#ef4444")
            b += kawat(xs_[k], 77, xs_[k], 100, "#00e09e", 1.4) + f'<rect x="{xs_[k] - 6}" y="100" width="12" height="12" fill="#00e09e"/>' + t(xs_[k], 126, f"{ind(beban[k], 1)} MW pf 0,85", 9.5, AX)
            b += t(xs_[k], 146, f"V = {ind(V[k], 2)} kV", 10, "#22d3ee", "middle", "600")
    b += t(xs_[0], 146, f"V = {ind(V1, 1)} kV", 10, "#22d3ee", "middle", "600")
    b += arrow(570, 40, 80, 40, "#f59e0b", 1.6) + t(325, 34, "backward: I dan rugi tiap ruas dijumlahkan dari ujung ke GI", 9.5, "#f59e0b")
    b += arrow(80, 170, 570, 170, "#22d3ee", 1.6) + t(325, 186, "forward: V bus dihitung dari GI ke ujung dengan aliran ruas yang baru; ulangi sampai ΔV < toleransi", 9.5, "#22d3ee")
    b += t(330, 206, f"Ruas 2 km (0,8 + j0,7 Ω) × 4, beban 0,8 MW pf 0,85 per bus: GI memasok {ind(Pf[1], 3)} MW, rugi total {ind(sum(rugi) * 1000, 1)} kW ({ind(sum(rugi) / Pf[1] * 100, 2)} %), ujung {ind(V[4], 2)} kV", 10.5, AX)
    return svg(660, 216, b, "Gambar 1 — Aliran daya penyulang radial dengan backward/forward sweep")


def gambar2():
    b = ""
    x0, x1, y0, y1 = 64, 616, 190, 26
    L = 15.0
    X = lambda d: x0 + d / L * (x1 - x0)
    i3 = lambda d: VF / math.hypot(R_KM * d, XS + X_KM * d)
    i1 = lambda d: 3 * VF / math.hypot(2 * R_KM * d + 3 * R_KM * d + 3 * NGR, 2 * (XS + X_KM * d) + XS + 3 * X_KM * d)
    imax = i3(0)
    Y = lambda v: y0 - v / imax * (y0 - y1)
    for d in [0, 3, 6, 9, 12, 15]:
        b += f'<line x1="{X(d):.1f}" y1="{y1}" x2="{X(d):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(d), y0 + 16, f"{d} km", 10.5, AX)
    for v in [0, 2000, 4000, 6000]:
        if v <= imax:
            b += t(x0 - 8, Y(v) + 4, f"{v}", 10.5, AX, "end")
    p3 = " ".join(f"{X(k / 4):.1f},{Y(i3(k / 4)):.1f}" for k in range(61))
    p1 = " ".join(f"{X(k / 4):.1f},{Y(i1(k / 4)):.1f}" for k in range(61))
    b += f'<polyline points="{p3}" fill="none" stroke="#ef4444" stroke-width="2.6"/>' + t(X(4), Y(i3(4)) - 10, f"3 fasa: {ind(i3(0), 0)} A di GI → {ind(i3(15), 0)} A di 15 km", 10, "#ef4444", "start", "600")
    b += f'<polyline points="{p1}" fill="none" stroke="#22d3ee" stroke-width="2.4"/>' + t(X(1), Y(600) - 10, f"1 fasa–tanah (NGR {ind(NGR, 0)} Ω, garis bawah): {ind(i1(0), 0)} → {ind(i1(15), 0)} A", 10, "#22d3ee", "start", "600")
    pk = 600
    b += f'<line x1="{x0}" y1="{Y(pk):.1f}" x2="{x1}" y2="{Y(pk):.1f}" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="6 4"/>' + t(x1 - 4, Y(pk) - 6, f"pickup relai fasa {pk} A", 9.5, "#f59e0b", "end", "600")
    b += f'<circle cx="{X(L_HS):.1f}" cy="{Y(i3(L_HS)):.1f}" r="5" fill="#ef4444"/>' + t(X(L_HS), Y(i3(L_HS)) - 10, f"{ind(L_HS, 0)} km: {ind(I_SC_UJUNG, 0)} A", 9.5, TX, "middle", "600")
    b += t(x0 - 8, y1 - 8, "A", 10.5, AX, "end") + t(340, 230, f"S_sc {ind(SSC, 0)} MVA (X_s {ind(XS, 3)} Ω), 0,4 + j0,35 Ω/km, Z₀ ≈ 3Z₁; arus gangguan tanah dibatasi NGR", 10.5, AX)
    b += t(340, 244, "sehingga hampir datar dan hanya terdeteksi relai tanah (GFR) berpickup rendah", 10.5, AX)
    return svg(660, 254, b, "Gambar 2 — Arus hubung singkat tiga fasa dan satu fasa–tanah sepanjang penyulang 20 kV")


def gambar3():
    b = t(330, 20, "Peralatan proteksi dan pemisah pada penyulang 20 kV (SUTM)", 12, TX, "middle", "700")
    y = 80
    b += f'<rect x="20" y="{y - 22}" width="60" height="44" rx="6" fill="{BOX}" stroke="#f59e0b" stroke-width="1.6"/>' + t(50, y - 4, "GI 20 kV", 9.5, "#f59e0b", "middle", "700") + t(50, y + 9, "OCR + GFR", 9, AX)
    alat = [(110, "PMT", "#ef4444", "pemutus di GI,\ndiperintah relai"), (200, "LBS", "#94a3b8", "pemisah beban,\nmanuver seksi"), (300, "REC", "#a855f7", "recloser: buka–tutup\notomatis 2–3×"), (400, "SEC", "#22d3ee", "sectionalizer: hitung\noperasi recloser"), (500, "FCO", "#f59e0b", "fuse cut-out\ncabang/trafo"), (590, "LA", "#00e09e", "arrester\npetir")]
    tepi = [80] + [v for x, *_ in alat for v in (x - 16, x + 16)] + [620]
    for xa, xb in zip(tepi[0::2], tepi[1::2]):              # penyulang terputus di tiap kotak alat
        b += kawat(xa, y, xb, y, "#22d3ee", 2.4)
    for x, nama, c, ket in alat:
        b += f'<rect x="{x - 16}" y="{y - 12}" width="32" height="24" rx="4" fill="{BOX}" stroke="{c}" stroke-width="1.8"/>' + t(x, y + 4, nama, 9.5, c, "middle", "700")
        for i, baris in enumerate(ket.split("\n")):
            b += t(x + 6, y + 34 + i * 12, baris, 9, AX, "start") if nama == "FCO" else t(x, y + 34 + i * 12, baris, 9, AX)
    b += kawat(500, y + 12, 500, y + 70, "#f59e0b", 1.4) + f'<circle cx="500" cy="{y + 80}" r="9" fill="{BOX}" stroke="#a855f7" stroke-width="1.6"/><circle cx="500" cy="{y + 92}" r="9" fill="{BOX}" stroke="#a855f7" stroke-width="1.6"/>' + t(524, y + 90, "trafo distribusi", 9, AX, "start")
    b += t(330, 198, "Zona: relai GI (cadangan seluruh penyulang) → recloser (seksi tengah–ujung) → fuse cabang (satu cabang/trafo);", 10.5, AX)
    b += t(330, 212, "makin ke hilir makin cepat dan makin kecil bagian yang padam", 10.5, AX)
    b += t(330, 230, "Gangguan temporer (70–80 %): recloser membuka cepat lalu menutup; permanen: recloser lockout atau fuse lebur,", 10.5, AX)
    b += t(330, 244, "sectionalizer/LBS mengisolasi seksi", 10.5, AX)
    return svg(660, 254, b, "Gambar 3 — Peralatan proteksi dan pemisah pada penyulang dan zonanya")


def gambar4():
    b = ""
    x0, x1, y0, y1 = 64, 616, 190, 26
    imin, imax, tmin, tmax = 100, 10000, 0.01, 100
    X = lambda i: x0 + math.log10(i / imin) / math.log10(imax / imin) * (x1 - x0)
    Y = lambda tt: y0 - math.log10(max(tmin, min(tmax, tt)) / tmin) / math.log10(tmax / tmin) * (y0 - y1)
    for tt in [0.01, 0.1, 1, 10, 100]:
        b += f'<line x1="{x0}" y1="{Y(tt):.1f}" x2="{x1}" y2="{Y(tt):.1f}" stroke="{GRID}" stroke-width="0.7"/>' + t(x0 - 8, Y(tt) + 4, f"{tt} s", 10, AX, "end")
    for i in [100, 300, 1000, 3000, 10000]:
        b += f'<line x1="{X(i):.1f}" y1="{y1}" x2="{X(i):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(i), y0 + 16, f"{i} A", 10, AX)
    idmt = lambda i, is_, tms: tms * 0.14 / ((i / is_) ** 0.02 - 1) if i > is_ * 1.05 else None
    fuse = lambda i: I2T_FUSE100 / i ** 2

    def kurva(f, c, w):
        pts = []
        for p in range(0, 201):
            i = imin * (imax / imin) ** (p / 200)
            tt = f(i)
            if tt is None or tt > tmax:
                continue
            pts.append(f"{X(i):.1f},{Y(tt):.1f}")
        return f'<polyline points="{" ".join(pts)}" fill="none" stroke="{c}" stroke-width="{w}"/>'
    b += kurva(lambda i: idmt(i, IS_HULU, TMS_HULU), "#ef4444", 2.4) + kurva(lambda i: idmt(i, IS_HILIR, TMS_HILIR), "#00e09e", 2.4) + kurva(fuse, "#f59e0b", 1.8)
    b += f'<line x1="{X(IF_K):.1f}" y1="{y1}" x2="{X(IF_K):.1f}" y2="{y0}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 3" opacity=".5"/>'
    tA, tB, tF = idmt(IF_K, IS_HULU, TMS_HULU), T_HILIR, fuse(IF_K)
    for tt, c in [(tA, "#ef4444"), (tB, "#00e09e"), (tF, "#f59e0b")]:
        b += f'<circle cx="{X(IF_K):.1f}" cy="{Y(tt):.1f}" r="4.5" fill="{c}"/>'
    for k, (c, lab) in enumerate([("#ef4444", f"relai GI: I_s {ind(IS_HULU, 0)} A, TMS {ind(TMS_HULU, 3)} → {ind(tA, 3)} s"),
                                  ("#00e09e", f"recloser/relai hilir: I_s {ind(IS_HILIR, 0)} A, TMS {ind(TMS_HILIR, 2)} → {ind(tB, 3)} s"),
                                  ("#f59e0b", f"fuse 100 A: {ind(tF * 1000, 0)} ms")]):
        yy = 150 + 14 * k                                   # kiri bawah: semua kurva berada di atas area ini
        b += f'<line x1="{x0 + 8}" y1="{yy - 4}" x2="{x0 + 24}" y2="{yy - 4}" stroke="{c}" stroke-width="2.4"/>' + t(x0 + 30, yy, lab, 9.5, c, "start", "600")
    b += t(X(IF_K), y1 - 6, f"I_f = {ind(IF_K, 0)} A", 9.5, TX, "middle", "600")
    b += t(x0 - 8, y1 - 8, "t", 10.5, AX, "end") + t(340, 230, "Kurva waktu–arus (log–log): fuse < hilir < hulu pada setiap arus gangguan;", 10.5, AX)
    b += t(340, 244, f"selang hulu–hilir {ind(MARGIN, 1)} s pada {ind(IF_K, 0)} A dicapai dengan TMS hulu {ind(TMS_HULU, 3)}", 10.5, AX)
    return svg(660, 254, b, "Gambar 4 — Koordinasi kurva waktu–arus fuse, relai hilir, dan relai gardu induk")


def gambar5():
    b = ""
    x0, x1, y0, y1 = 64, 630, 190, 26
    nT = 20
    X = lambda n: x0 + n / nT * (x1 - x0)
    beban = [S0_J * (1 + G_J) ** n for n in range(nT + 1)]
    cap = []
    c = CAP_J
    tambah = []
    for n in range(nT + 1):
        if beban[n] > 0.8 * c:
            c += 4
            tambah.append(n)
        cap.append(c)
    ymax = max(cap[-1], beban[-1]) * 1.1
    Y = lambda v: y0 - v / ymax * (y0 - y1)
    for n in range(0, nT + 1, 4):
        b += f'<line x1="{X(n):.1f}" y1="{y1}" x2="{X(n):.1f}" y2="{y0}" stroke="{GRID}" stroke-width="0.7"/>' + t(X(n), y0 + 16, f"th {n}", 10.5, AX)
    for v in [0, 5, 10, 15, 20, 25, 30]:
        if v <= ymax:
            b += t(x0 - 8, Y(v) + 4, f"{v} MVA", 10.5, AX, "end")
    pts = " ".join(f"{X(n):.1f},{Y(beban[n]):.1f}" for n in range(nT + 1))
    b += f'<polyline points="{pts}" fill="none" stroke="#ef4444" stroke-width="2.6"/>'
    d = f"M {X(0):.1f} {Y(cap[0]):.1f}"
    for n in range(1, nT + 1):
        d += f" L {X(n):.1f} {Y(cap[n - 1]):.1f} L {X(n):.1f} {Y(cap[n]):.1f}"
    b += f'<path d="{d}" fill="none" stroke="#22d3ee" stroke-width="2.2"/>'
    d2 = f"M {X(0):.1f} {Y(0.8 * cap[0]):.1f}"
    for n in range(1, nT + 1):
        d2 += f" L {X(n):.1f} {Y(0.8 * cap[n - 1]):.1f} L {X(n):.1f} {Y(0.8 * cap[n]):.1f}"
    b += f'<path d="{d2}" fill="none" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4 3"/>'
    for n in tambah:
        b += f'<circle cx="{X(n):.1f}" cy="{Y(cap[n]):.1f}" r="5" fill="#f59e0b"/>' + t(X(n), Y(cap[n]) - 9, "+4 MVA", 9, "#f59e0b", "middle", "600")
    for k, (c, w, putus, lab) in enumerate([("#ef4444", 2.6, "", f"beban {ind(S0_J, 1)} MVA × 1,07ⁿ (ganda tiap {ind(T_GANDA, 1)} th)"),
                                             ("#22d3ee", 2.2, "", f"kapasitas terpasang (awal {ind(CAP_J, 0)} MVA)"),
                                             ("#22d3ee", 1, ' stroke-dasharray="4 3"', "batas 80 % kapasitas")]):
        yy = y1 + 14 + 14 * k                               # kiri atas: kurva dan tangga kapasitas masih rendah
        b += f'<line x1="{x0 + 8}" y1="{yy - 4}" x2="{x0 + 26}" y2="{yy - 4}" stroke="{c}" stroke-width="{w}"{putus}/>' + t(x0 + 32, yy, lab, 10, c, "start", "600")
    b += t(347, 230, f"Tahun jenuh pertama n = ln(0,8 × {ind(CAP_J, 0)}/{ind(S0_J, 1)})/ln 1,07 = {ind(math.log(0.8 * CAP_J / S0_J) / math.log(1 + G_J), 2)}; penambahan 4 MVA bertahap pada tahun {', '.join(map(str, tambah))}", 10.5, AX)
    return svg(660, 240, b, "Gambar 5 — Peramalan beban majemuk dan penambahan kapasitas bertahap")


def gambar6():
    b = t(330, 20, "Pilihan pengembangan saat penyulang/gardu jenuh", 12, TX, "middle", "700")
    opsi = [("Uprating konduktor", "AAAC 70 → 150 mm²:\nkapasitas +60 %, rugi −55 %;\nbiaya sedang, tanpa lahan", "#22d3ee"),
            ("Penyulang baru", "bagi beban dua penyulang:\nkapasitas 2×, keandalan naik,\nbutuh sel 20 kV di GI", "#00e09e"),
            ("Gardu sisipan / trafo lebih besar", "JTR lebih pendek, ΔV turun;\nmurah, cepat; tidak menambah\nkapasitas penyulang", "#f59e0b"),
            ("Kapasitor / regulator", "membebaskan kVA dan menaikkan\nV (Modul 10); murah, tetapi\nbatasnya pf ≈ 0,95", "#a855f7"),
            ("GI baru", "memotong panjang penyulang;\nsangat mahal (Rp 50–150 M),\n3–5 tahun; untuk kota tumbuh", "#ef4444")]
    for i, (judul, ket, c) in enumerate(opsi):
        x = 14 + i * 128
        b += f'<rect x="{x}" y="34" width="120" height="150" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>'
        b += teks2(x + 60, 52, judul, 9.5, c, maks=17, jarak=12, weight="700")
        b += teks2(x + 60, 84, ket.replace("\n", " "), 9, AX, maks=20, jarak=12)
        b += t(x + 60, 170, ["Rp/kVA rendah", "Rp/kVA sedang", "Rp/kVA rendah", "Rp/kVA terendah", "Rp/kVA tinggi"][i], 9.5, c, "middle", "600")
    b += t(330, 206, f"Biaya tahunan ekuivalen = modal × CRF; i = {ind(I_RATE * 100, 0)} %, umur {N_UMUR} th → CRF = {ind(CRF, 4)}:", 10.5, AX)
    b += t(330, 220, f"modal Rp 1 M setara Rp {ind(CRF * 1000, 0)} juta/tahun, dibandingkan nilai rugi dan ENS yang dihemat", 10.5, AX)
    return svg(660, 230, b, "Gambar 6 — Lima pilihan pengembangan jaringan distribusi dan sifat biayanya")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-aliran">Aliran Daya</a>
  <a href="#m-gangguan">Arus Gangguan</a>
  <a href="#m-peralatan">Peralatan Proteksi</a>
  <a href="#m-koordinasi">Koordinasi</a>
  <a href="#m-peramalan">Peramalan Beban</a>
  <a href="#m-pengembangan">Pengembangan</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="80" x2="90" y2="80" stroke="rgba(0,229,255,.5)" stroke-width="1.5"/>
      <rect x="30" y="72" width="14" height="16" fill="none" stroke="rgba(168,85,247,.7)" stroke-width="1.2"/>
      <text x="37" y="84" fill="rgba(168,85,247,.8)" font-family="JetBrains Mono" font-size="7" text-anchor="middle">R</text>
      <line x1="70" y1="80" x2="70" y2="110" stroke="rgba(255,179,0,.6)" stroke-width="1.2"/>
      <path d="M 66 96 L 74 96" stroke="rgba(255,179,0,.8)" stroke-width="2"/>
      <path d="M 78 60 L 84 70 L 80 70 L 86 80" stroke="rgba(239,68,68,.7)" stroke-width="1.4" fill="none"/>
      <text x="14" y="130" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">recloser · fuse</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 150 Q 50 140 90 90" stroke="rgba(239,68,68,.6)" stroke-width="1.6" fill="none"/>
      <path d="M 10 120 L 45 120 L 45 100 L 80 100 L 80 80 L 90 80" stroke="rgba(0,229,255,.6)" stroke-width="1.2" fill="none"/>
      <text x="12" y="70" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">beban vs kapasitas</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="12">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">I_sc = V_f/|Z_s + Z_L|</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">t = TMS·0,14/((I/I_s)^0,02 − 1)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">V₂ ≈ V₁ − (PR + QX)/V₁</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">P_n = P₀(1 + g)ⁿ</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">fuse &lt; recloser &lt; relai</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">Z_s = V²/S_sc</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">3V_f/(Z₁+Z₂+Z₀+3R_n)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">n = ln(S_cap/S₀)/ln(1+g)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Aliran Daya, Peralatan,</span><br>
      <em>dan Pengembangan</em><br>
      <span class="hl-amber">Sistem Distribusi</span>
    </h1>
    <p class="hero-sub">Setelah jaringan berdiri, tiga pertanyaan mengelolanya setiap hari: ke mana daya mengalir dan berapa tegangan tiap bus (aliran daya), apa yang terjadi saat hubung singkat dan alat mana yang harus memutus lebih dulu (arus gangguan, proteksi, koordinasi), dan kapan jaringan harus diperbesar (peramalan beban dan pengembangan). Modul ini menutup rangkaian distribusi dengan perhitungan yang dipakai insinyur perencana dan operasi, dari backward/forward sweep sampai kurva waktu–arus dan tahun jenuh.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Konsep, prinsip, dan rumus</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Contoh, tabel, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Python, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">@@N_CELL@@</div><div class="stat-lbl">Cell Python</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — aliran daya
    isi = figure(1, "Aliran daya penyulang radial dengan backward/forward sweep", "Untuk jaringan radial tidak diperlukan matriks admitansi seperti Newton–Raphson: arus dan rugi tiap ruas dijumlahkan dari ujung ke gardu induk (backward), lalu tegangan tiap bus dihitung dari gardu induk ke ujung (forward); dua–tiga iterasi sudah konvergen.", gambar1())
    isi += formula(1, "Rugi Ruas dan Tegangan Bus pada Penyulang Radial", r"P_{rugi} = \dfrac{P^2 + Q^2}{V^2}R, \qquad Q_{rugi} = \dfrac{P^2 + Q^2}{V^2}X, \qquad V_2 \approx V_1 - \dfrac{P R + Q X}{V_1}",
                   rf"Ruas {ind(R_AD, 1)} + j{ind(X_AD, 1)} Ω dari bus {ind(V1_AD, 0)} kV memasok {ind(P_AD, 0)} MW dan {ind(Q_AD, 1)} MVAR: \(V_2 \approx {ind(V1_AD, 0)} - ({ind(P_AD, 0)}\times{ind(R_AD, 1)} + {ind(Q_AD, 1)}\times{ind(X_AD, 1)})/{ind(V1_AD, 0)} = {ind(V2_AD, 3)}\) kV. Rugi ruas 2,4 Ω dengan beban yang sama: \(({ind(P_AD, 0)}^2 + {ind(Q_AD, 1)}^2)/{ind(V1_AD, 0)}^2\times2{{,}}4 = {ind(RUGI_AD, 1)}\) kW. Backward sweep dari beban {ind(P_AD, 0)} MW pf {ind(PF_AD, 1)}: \(I = {ind(I_AD, 1)}\) A, rugi \(3I^2R = {ind(RUGI_BS * 1000, 1)}\) kW → gardu induk memasok {ind(P_SRC, 4)} MW.",
                   "Dalam satuan MW, MVAR, kV, dan Ω rumus rugi dan jatuh tegangan langsung memberi MW dan kV tanpa faktor √3 (daya tiga fasa dan tegangan antar-saluran). Pendekatan V₂ ≈ V₁ − (PR + QX)/V₁ mengabaikan suku kuadrat dan sudut, cukup teliti untuk ΔV < 10 %. Perangkat lunak distribusi (ETAP, DIgSILENT, OpenDSS) memakai sweep yang sama dengan model beban lebih rinci (ZIP, tak seimbang per fasa).",
                   [("P, Q", "Daya yang masuk ruas ke arah beban (MW, MVAR)"), ("V", "Tegangan bus penerima (kV) — iterasi pertama memakai nominal"), ("R, X", "Impedansi ruas (Ω)")])
    isi += cards([
        ("🔁", "Backward Sweep", "Mulai dari bus ujung: aliran ruas = beban bus + aliran ruas hilir + rugi ruas hilir; bergerak ke gardu induk sampai daya sumber diketahui.", None),
        ("➡️", "Forward Sweep", "Mulai dari gardu induk (tegangan diketahui): tegangan bus berikutnya = tegangan bus ini − jatuh tegangan ruas; bergerak ke ujung.", None),
        ("🎯", "Konvergensi", "Ulangi sampai perubahan tegangan terbesar < 10⁻⁴ pu; radial konvergen dalam 2–4 iterasi, jauh lebih cepat daripada Newton–Raphson untuk ribuan bus.", None),
        ("🧮", "Model Beban", "Beban daya konstan (P, Q tetap) paling konservatif; beban impedansi konstan turun saat tegangan turun; model ZIP campuran mendekati kenyataan.", r"\(P = P_0(a V^2 + b V + c)\)"),
        ("📊", "Kegunaan", "Profil tegangan, rugi total, pembebanan tiap ruas, letak kapasitor/regulator (Modul 10), dan dampak pembangkit tersebar (PLTS) yang membalik aliran.", None),
        ("🔗", "Ke Modul Transmisi", "Modul 7–9 memakai ABCD dan aliran daya jaringan bertautan; penyulang radial cukup dengan sweep karena arahnya tunggal dan tidak ada loop tertutup.", None),
    ])
    isi += tabel(["Penyulang contoh (Gambar 1): ruas", "P masuk (MW)", "Q masuk (MVAR)", "Rugi ruas (kW)", "V bus penerima (kV)", "ΔV kumulatif (%)"],
                 [[f"ruas {k}", ind(p, 3), ind(q, 3), ind(rg, 1), ind(v, 3), ind((1 - v / 20) * 100, 2)] for k, p, q, rg, v in
                  [(1, 3.331, 2.15, 51.1, 19.792, ), (2, 2.489, 1.61, 28.5, 19.640), (3, 1.653, 1.07, 12.5, 19.539), (4, 0.822, 0.53, 3.1, 19.487)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> ruas pangkal membawa daya semua bus sehingga ruginya terbesar (51 kW) walau impedansinya sama; jatuh tegangan menumpuk sampai ujung. Kapasitor 1 MVAR di bus 3 akan mengurangi Q semua ruas hulu dan rugi ± 30 %: itulah cara aliran daya menilai kompensasi Modul 10. Soal C8, C9, dan C15 memakai Persamaan (1).")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 menghitung keadaan normal (aliran daya). Bagian 02 menghitung keadaan gangguan (arus hubung singkat), Bagian 03 memperkenalkan alat yang memutusnya, dan Bagian 04 mengatur agar alat yang tepat memutus lebih dulu (koordinasi). Bagian 05–06 melihat ke depan: berapa beban tahun depan dan kapan jaringan harus diperbesar. Animasi dan Python memakai penyulang contoh 20 kV yang sama.")
    m += bagian(1, "m-aliran", "Aliran Daya<br>Penyulang Radial",
                "Sebelum memasang apa pun, operator harus tahu berapa daya yang lewat tiap ruas dan berapa tegangan tiap bus pada beban puncak. Untuk jaringan radial, jawabannya diperoleh dengan metode sweep dua arah yang dirumuskan Persamaan (1) dan diperlihatkan Gambar 1: sederhana, cepat, dan menjadi dasar semua perangkat lunak distribusi.",
                isi, "ALIRAN DAYA")

    # 02 — arus gangguan
    isi = figure(2, "Arus hubung singkat tiga fasa dan satu fasa–tanah sepanjang penyulang 20 kV", f"Arus gangguan tiga fasa terbesar di gardu induk ({ind(I_SC_GI, 0)} A) dan turun sepanjang penyulang karena impedansi saluran bertambah; arus gangguan tanah dibatasi resistor pentanahan netral (NGR {ind(NGR, 0)} Ω) sehingga hampir datar dan kecil, dan harus dideteksi relai tanah tersendiri.", gambar2())
    isi += formula(2, "Arus Hubung Singkat pada Penyulang", r"Z_s = \dfrac{V_L^2}{S_{sc}}, \qquad I_{3\varphi}(x) = \dfrac{V_f}{|Z_s + z\,x|}, \qquad I_{1\varphi\text{-}t} = \dfrac{3V_f}{|Z_1 + Z_2 + Z_0 + 3R_n|}",
                   rf"Rel 20 kV dengan daya hubung singkat {ind(SSC, 0)} MVA: \(X_s = 400/{ind(SSC, 0)} = {ind(XS, 3)}\) Ω → \(I_{{3\varphi}}\) di gardu induk \(= {ind(VF, 0)}/{ind(XS, 3)} = {ind(I_SC_GI, 0)}\) A. Di ujung penyulang {ind(L_HS, 0)} km (0,4 + j0,35 Ω/km): \(Z = {ind(R_KM * L_HS, 1)} + j({ind(XS, 3)} + {ind(X_KM * L_HS, 1)})\), \(|Z| = {ind(Z_UJUNG, 3)}\) Ω → \({ind(I_SC_UJUNG, 0)}\) A. Gangguan satu fasa–tanah dengan NGR {ind(NGR, 0)} Ω, \(Z_1 = Z_2 = j{ind(Z1_HS, 1)}\), \(Z_0 = j{ind(Z0_HS, 1)}\) Ω: \(I = 3\times{ind(VF, 0)}/|{ind(3 * NGR, 0)} + j{ind(2 * Z1_HS + Z0_HS, 1)}| = {ind(I_1F, 0)}\) A.",
                   "Daya hubung singkat S_sc adalah cara utilitas menyatakan 'kekuatan' sumber: makin besar S_sc makin kecil impedansi sumber dan makin besar arus gangguan (tetapi makin kaku tegangannya). Arus gangguan menentukan kapasitas pemutus (breaking capacity PMT, biasanya 12,5–25 kA pada 20 kV), setelan relai, dan I²t yang harus ditahan kabel. Pentanahan netral lewat resistor (12 Ω/1000 A untuk kabel tanah, 40 Ω/300 A untuk SUTM, 500 Ω/25 A di beberapa sistem) membatasi arus gangguan tanah yang merupakan 80 % dari semua gangguan.",
                   [("S_{sc}", "Daya hubung singkat tiga fasa sumber (MVA)"), ("z\\,x", "Impedansi saluran per km × jarak ke titik gangguan (Ω)"), ("R_n", "Resistor pentanahan netral (Ω), tampil sebagai 3R_n pada jaringan urutan nol")])
    isi += cards([
        ("⚡", "Jenis Gangguan", "Satu fasa–tanah 70–80 %, dua fasa 10–15 %, dua fasa–tanah 5–10 %, tiga fasa < 5 %; tiga fasa dipakai untuk kapasitas alat, satu fasa–tanah untuk setelan relai tanah.", None),
        ("📐", "Komponen Simetris", "Gangguan tak seimbang dihitung dengan jaringan urutan positif, negatif, dan nol yang dihubung seri (1φ–tanah) atau paralel (2φ); Z₀ saluran ≈ 3 Z₁ untuk SUTM.", None),
        ("🔌", "Sumber Lain", "Motor besar dan pembangkit tersebar menyumbang arus gangguan beberapa siklus pertama; PLTS inverter hanya ± 1,1–1,5 × I_n sehingga sulit dideteksi relai arus lebih.", None),
        ("🌡️", "Ketahanan Kabel", "Kabel XLPE Al menahan I²t ≈ (94·A)² untuk 1 s (A dalam mm²): kabel 150 mm² tahan 14 kA selama 1 s; relai harus memutus sebelum itu.", r"\(I_{1s} \approx 94\,A\ \text{(Al XLPE)}\)"),
        ("📉", "Tegangan Sag", "Selama gangguan, tegangan bus di hulu jatuh sebanding jaraknya ke gangguan; pelanggan di penyulang tetangga merasakan sag 0,1–1 s (relai/VSD trip) walau bukan penyulang mereka yang terganggu.", None),
        ("🧭", "Lokasi Gangguan", "Dari arus gangguan yang terukur di GI dan impedansi per km, jarak gangguan ditaksir x ≈ (V_f/I − Z_s)/z: dasar fault locator pada relai modern.", None),
    ])
    isi += tabel(["Titik gangguan (S_sc 240 MVA, 0,4 + j0,35 Ω/km)", "R (Ω)", "X (Ω)", "|Z| (Ω)", "I_3φ (A)", "I_1φ–tanah, NGR 40 Ω (A)"],
                 [[f"{d} km", ind(R_KM * d, 2), ind(XS + X_KM * d, 3), ind(math.hypot(R_KM * d, XS + X_KM * d), 3), ind(VF / math.hypot(R_KM * d, XS + X_KM * d), 0), ind(3 * VF / math.hypot(5 * R_KM * d + 3 * NGR, 3 * XS + 5 * X_KM * d), 0)] for d in [0, 2, 5, 8, 12, 15]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> arus tiga fasa turun tiga kali lipat dari GI ke 15 km, sedangkan arus tanah hanya turun ± 10 % karena 3R_n = 120 Ω mendominasi. Relai fasa dengan pickup 600 A tidak melihat gangguan tanah mana pun; itulah mengapa setiap penyulang mempunyai relai tanah (GFR) berpickup 20–40 % dari relai fasa. Soal C1, C2, C10, dan C11 memakai Persamaan (2).")
    m += bagian(2, "m-gangguan", "Arus Hubung Singkat<br>pada Penyulang",
                "Alat proteksi hanya dapat disetel bila arus gangguan di tiap titik diketahui: paling besar di gardu induk, paling kecil di ujung penyulang, dan untuk gangguan tanah dibatasi resistor pentanahan. Persamaan (2) menghitung ketiganya dari daya hubung singkat sumber dan impedansi saluran; Gambar 2 memperlihatkan kurvanya sepanjang penyulang contoh.",
                isi, "ARUS GANGGUAN")

    # 03 — peralatan
    isi = figure(3, "Peralatan proteksi dan pemisah pada penyulang dan zonanya", "Relai arus lebih di gardu induk memerintah PMT, recloser membuka–menutup otomatis di tengah penyulang, sectionalizer menghitung operasi recloser lalu mengisolasi seksi, fuse cut-out melindungi cabang dan trafo, LBS untuk manuver, dan arrester untuk petir.", gambar3())
    isi += formula(3, "Fuse: Arus Nominal, I²t Lebur, dan Inrush Trafo", r"I_n = \dfrac{S}{\sqrt{3}\,V_L}, \qquad I_{fuse} \approx (2\text{–}3)\,I_n, \qquad t_{lebur} = \dfrac{I^2t_{min}}{I^2}, \qquad I^2t_{inrush} = (k\,I_n)^2\,t_{inrush} < I^2t_{min}",
                   rf"Trafo {ind(S_TRAFO, 0)} kVA pada 20 kV: \(I_n = {ind(S_TRAFO, 0)}\times10^3/(\sqrt{{3}}\times20\,000) = {ind(I_N_TM, 2)}\) A → fuse cut-out ≈ {ind(FUSE_K, 1)} × {ind(I_N_TM, 2)} = {ind(FUSE_K * I_N_TM, 1)} A → link 50 A (tipe K). Inrush {ind(INRUSH_K, 0)} × I_n selama {ind(INRUSH_T, 1)} s: \(I^2t = ({ind(INRUSH_K * I_N_TM, 1)})^2\times{ind(INRUSH_T, 1)} = {ind(I2T_INRUSH, 0)}\) A²s, jauh di bawah I²t lebur link 50 A (± 10⁴ A²s) sehingga fuse tidak putus saat energisasi. Fuse cabang 100 A (I²t ≈ {ind(I2T_FUSE100 / 1e5, 0)}×10⁵ A²s) pada gangguan {ind(I_F_FUSE, 0)} A lebur dalam \({ind(I2T_FUSE100 / 1e5, 0)}\times10^5/{ind(I_F_FUSE, 0)}^2 = {ind(T_FUSE, 0)}\) ms.",
                   "Fuse adalah pengaman termurah dan tercepat pada arus besar, tetapi sekali pakai dan tidak dapat membedakan gangguan temporer; karena itu ia ditempatkan di cabang dan trafo, sedangkan penyulang utama dijaga recloser dan relai yang dapat menutup kembali. Fuse tipe K (cepat) dan T (lambat) mempunyai kurva waktu–arus baku (ANSI C37.42); pemilihan link harus tahan inrush trafo dan arus beban dingin (cold load pickup 2–3 × I_n selama beberapa detik setelah pemadaman).",
                   [("S", "Daya trafo (VA) untuk fuse trafo, atau beban cabang"), ("I^2t_{min}", "Energi lebur minimum fuse link (A²s), dari katalog"), ("k, t_{inrush}", "Faktor dan lama inrush (8–12 × I_n, 0,1 s)")])
    isi += cards([
        ("🔥", "Fuse Cut-Out (FCO)", "Pemegang link fuse yang jatuh (drop-out) saat lebur sehingga terlihat dari bawah tiang; 20 kV, 100–200 A, kapasitas putus 8–12 kA; untuk trafo dan cabang.", None),
        ("🔁", "Recloser", "PMT vakum 20 kV dengan relai terpadu: buka cepat (kurva A) 1–2×, lalu buka lambat (kurva C) 1–2×, lalu lockout; interval mati 2–15 s; ± 400–800 A pengenal.", None),
        ("🔢", "Sectionalizer", "Tidak memutus arus gangguan; menghitung berapa kali arus gangguan lewat lalu recloser membuka, dan membuka pada interval mati ke-n; tanpa koordinasi kurva.", None),
        ("📟", "Relai OCR/GFR", "Relai arus lebih fasa (OCR) dan tanah (GFR) di GI: elemen IDMT (51) untuk koordinasi + elemen instan (50) untuk gangguan dekat; digital dengan rekaman gangguan.", None),
        ("⚙️", "PMT & LBS", "PMT (circuit breaker) memutus arus gangguan (12,5–25 kA); LBS (load break switch) hanya arus beban (± 630 A) untuk manuver; ABSW tanpa beban.", None),
        ("⚡", "Arrester & Pentanahan", "Arrester ZnO membatasi surja petir/switching; pentanahan tiang dan netral menentukan arus gangguan tanah dan tegangan sentuh (Modul 13).", None),
    ])
    isi += tabel(["Peralatan", "Memutus arus gangguan?", "Menutup kembali?", "Waktu kerja", "Letak khas", "Harga relatif"], [
        ["Fuse cut-out", "ya (≤ 12 kA)", "tidak (ganti link)", "ms–detik (kurva)", "cabang, trafo", "1"],
        ["Recloser", "ya (≤ 12,5 kA)", "ya, otomatis 2–4×", "kurva cepat/lambat", "tengah penyulang", "30–60"],
        ["Sectionalizer", "tidak", "manual/otomatis", "hitung + interval mati", "hilir recloser", "10–20"],
        ["Relai + PMT GI", "ya (≤ 25 kA)", "ya (autoreclose 1×)", "0,1–1,5 s (IDMT)", "sel penyulang GI", "100+"],
        ["LBS bermotor", "tidak (≤ 630 A beban)", "—", "manuver (SCADA)", "batas seksi", "15–25"],
    ])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> hanya fuse, recloser, dan PMT yang memutus arus gangguan; sectionalizer dan LBS hanya mengisolasi setelah arus terputus. Rancangan yang baik menempatkan alat murah (fuse) sebanyak-banyaknya di hilir dan alat mahal (recloser, PMT) sesedikit mungkin di hulu, lalu mengoordinasikannya (Bagian 04). Soal C3, C5, dan C13 memakai Persamaan (3).")
    m += bagian(3, "m-peralatan", "Peralatan Proteksi<br>dan Pemisah Penyulang",
                "Setelah arus gangguan diketahui, pertanyaannya: alat apa yang memutusnya? Penyulang distribusi memakai deretan alat dari yang paling sederhana (fuse) sampai yang paling cerdas (relai digital dan recloser), masing-masing dengan tugas dan zona sendiri, seperti diperlihatkan Gambar 3. Persamaan (3) memberi cara memilih fuse yang paling banyak dipakai.",
                isi, "PERALATAN PROTEKSI")

    # 04 — koordinasi
    isi = figure(4, "Koordinasi kurva waktu–arus fuse, relai hilir, dan relai gardu induk", f"Pada kurva log–log, setiap alat harus berada di atas alat di hilirnya untuk seluruh rentang arus gangguan zonanya; pada I_f = {ind(IF_K, 0)} A, fuse lebur {ind(T_FUSE * (I_F_FUSE / IF_K) ** 2, 0)} ms, relai hilir {ind(T_HILIR, 3)} s, dan relai GI {ind(T_HILIR + MARGIN, 3)} s.", gambar4())
    isi += formula(4, "Relai IDMT dan Selang Koordinasi", r"t = TMS\times\dfrac{0{,}14}{(I/I_s)^{0{,}02} - 1}\ \text{(standard inverse)}, \qquad t_{hulu} = t_{hilir} + \Delta t,\ \Delta t = 0{,}3\text{–}0{,}4\ \text{s}, \qquad I_s = (1{,}2\text{–}1{,}5)\,I_{beban,maks}",
                   rf"Relai dengan TMS {ind(TMS_C, 2)} melihat arus {ind(M_C, 0)} × I_s: \(t = {ind(TMS_C, 2)}\times0{{,}}14/({ind(M_C, 0)}^{{0,02}} - 1) = {ind(T_IDMT, 3)}\) s. Koordinasi: relai hilir I_s {ind(IS_HILIR, 0)} A TMS {ind(TMS_HILIR, 1)} pada gangguan {ind(IF_K, 0)} A bekerja \(t = {ind(T_HILIR, 3)}\) s; relai GI (I_s {ind(IS_HULU, 0)} A) harus bekerja pada \({ind(T_HILIR, 3)} + {ind(MARGIN, 1)} = {ind(T_HILIR + MARGIN, 3)}\) s → \(TMS = {ind(T_HILIR + MARGIN, 3)}\times(({ind(IF_K, 0)}/{ind(IS_HULU, 0)})^{{0,02}} - 1)/0{{,}}14 = {ind(TMS_HULU, 4)}\).",
                   "Relai IDMT (inverse definite minimum time) bekerja makin cepat pada arus makin besar, sehingga gangguan dekat sumber yang paling merusak diputus paling cepat, sementara gangguan jauh yang arusnya kecil masih sempat diputus alat hilir. Selang 0,3–0,4 s mencakup waktu buka PMT (0,05–0,1 s), kelebihan waktu relai (overshoot), dan kesalahan CT/relai. Koordinasi diperiksa pada arus gangguan maksimum di batas zona hilir (selang cukup) dan arus minimum di ujung zona (relai masih pickup).",
                   [("TMS", "Time multiplier setting (0,05–1,0), menggeser kurva ke atas"), ("I_s", "Arus setelan (pickup) relai (A primer)"), ("\\Delta t", "Selang koordinasi (grading margin)")])
    isi += cards([
        ("📈", "Kurva IEC", "Standard inverse (0,14/…^0,02), very inverse (13,5/…^1), extremely inverse (80/…^2): makin curam makin mirip fuse, dipakai untuk koordinasi dengan fuse.", None),
        ("💾", "Fuse Saving", "Recloser membuka cepat (kurva A) sebelum fuse lebur agar gangguan temporer di cabang tidak memutus fuse; bila permanen, recloser menutup dengan kurva lambat (C) dan fuse lebur.", None),
        ("🔥", "Fuse Blowing", "Alternatifnya: biarkan fuse lebur lebih dulu untuk semua gangguan cabang, sehingga penyulang utama tidak pernah 'kedip'; dipilih bila pelanggan peka terhadap sag/kedip.", None),
        ("🔗", "Fuse–Fuse", "Fuse hilir harus selesai lebur (total clearing) sebelum fuse hulu mulai lebur (min melting) × 0,75; rasio link biasanya 2–3 tingkat (mis. 25 K → 65 K).", None),
        ("⚡", "Elemen Instan (50)", "Relai instan di GI disetel > arus gangguan maksimum di batas zona hilir (mis. di recloser) agar tidak mendahului; memutus gangguan dekat GI dalam < 0,1 s.", None),
        ("🌐", "Relai Tanah", "GFR disetel 10–40 % I_n penyulang (mis. 60–120 A) dan dikoordinasikan sendiri dengan recloser tanah; tidak boleh terganggu ketidakseimbangan beban normal.", None),
    ])
    isi += tabel(["Alat (zona)", "Pickup", "Kurva / TMS", "t pada 2000 A", "t pada 800 A", "Fungsi"], [
        ["Fuse 100 K (cabang)", "≈ 150–200 A", "TCC pabrikan", f"{ind(T_FUSE * (I_F_FUSE / 2000) ** 2, 0)} ms", f"{ind(I2T_FUSE100 / 800 ** 2, 2)} s", "cabang: lebur untuk gangguan permanen"],
        ["Recloser (tengah)", "300 A", "cepat A (TMS 0,05) / lambat C (TMS 0,1)", f"{ind(0.05 * 0.14 / ((2000 / 300) ** 0.02 - 1), 3)} / {ind(T_HILIR, 3)} s", f"{ind(0.05 * 0.14 / ((800 / 300) ** 0.02 - 1), 3)} / {ind(0.1 * 0.14 / ((800 / 300) ** 0.02 - 1), 3)} s", "fuse saving lalu fuse blowing"],
        ["OCR GI (seluruh penyulang)", f"{ind(IS_HULU, 0)} A", f"SI, TMS {ind(TMS_HULU, 3)}", f"{ind(T_HILIR + MARGIN, 3)} s", f"{ind(TMS_HULU * 0.14 / ((800 / IS_HULU) ** 0.02 - 1), 3)} s", "cadangan recloser + zona GI–recloser"],
        ["OCR instan GI (50)", "3000 A", "—", "—", "—", "gangguan < 2 km dari GI, < 0,1 s"],
        ["GFR GI", "100 A", "SI, TMS 0,2", f"{ind(0.2 * 0.14 / ((300 / 100) ** 0.02 - 1), 2)} s (300 A)", "—", "gangguan tanah (NGR membatasi 300 A)"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> urutan waktu pada 2000 A adalah fuse → recloser cepat → recloser lambat → OCR GI, masing-masing terpisah cukup; pada 800 A (gangguan jauh) selang tetap terjaga karena semua kurva bertipe sama (standard inverse). Elemen instan GI dan GFR berkoordinasi sendiri-sendiri. Soal C4 dan C12 memakai Persamaan (4).")
    m += bagian(4, "m-koordinasi", "Koordinasi Proteksi:<br>Kurva Waktu–Arus dan Selang",
                "Beberapa alat proteksi yang dipasang berderet harus 'antre' dengan tertib: yang terdekat gangguan memutus lebih dulu, yang di hulu menunggu sebagai cadangan. Persamaan (4) memberi kurva relai IDMT dan selang waktu yang diperlukan, dan Gambar 4 memperlihatkan koordinasi fuse, recloser, dan relai gardu induk pada satu grafik waktu–arus.",
                isi, "KOORDINASI PROTEKSI")

    # 05 — peramalan
    isi = figure(5, "Peramalan beban majemuk dan penambahan kapasitas bertahap", f"Beban {ind(S0_J, 1)} MVA yang tumbuh {ind(G_J * 100, 0)} %/tahun berlipat dua setiap {ind(T_GANDA, 1)} tahun; kapasitas {ind(CAP_J, 0)} MVA dengan batas pembebanan 80 % jenuh dalam {ind(math.log(0.8 * CAP_J / S0_J) / math.log(1 + G_J), 1)} tahun, dan setiap penambahan 4 MVA hanya menunda beberapa tahun karena pertumbuhannya eksponensial.", gambar5())
    isi += formula(5, "Pertumbuhan Majemuk dan Tahun Jenuh", r"P_n = P_0(1 + g)^n, \qquad n_{jenuh} = \dfrac{\ln(S_{cap}/S_0)}{\ln(1 + g)}, \qquad T_{ganda} = \dfrac{\ln 2}{\ln(1 + g)} \approx \dfrac{70}{g\,(\%)}",
                   rf"Beban puncak {ind(P0_F, 0)} MW tumbuh {ind(G_F * 100, 0)} %/tahun: {N_F} tahun lagi \(= {ind(P0_F, 0)}\times1{{,}}07^{{{N_F}}} = {ind(P_N_F, 2)}\) MW. Penyulang {ind(S0_J, 1)} MVA berkapasitas {ind(CAP_J, 0)} MVA: \(n = \ln({ind(CAP_J, 0)}/{ind(S0_J, 1)})/\ln 1{{,}}07 = {ind(N_JENUH, 2)}\) tahun sampai kapasitas penuh, {ind(math.log(0.8 * CAP_J / S0_J) / math.log(1 + G_J), 2)} tahun sampai batas 80 %. Gardu {ind(CAP_G, 0)} kVA berbeban {ind(S0_G, 0)} kVA tumbuh {ind(G_G * 100, 0)} %: \(n = \ln(200/{ind(S0_G, 0)})/\ln 1{{,}}06 = {ind(N_GARDU, 2)}\) tahun.",
                   "Pertumbuhan beban distribusi 4–8 %/tahun (Indonesia) bersifat majemuk: kenaikannya makin besar setiap tahun, sehingga perencanaan harus melihat 5–10 tahun ke depan. Peramalan jangka pendek memakai tren dan regresi pada data historis per penyulang; jangka panjang memakai peramalan spasial (land-use, tata ruang) karena beban baru muncul di lokasi baru, bukan hanya tumbuh di tempat lama.",
                   [("g", "Laju pertumbuhan tahunan (pecahan)"), ("S_{cap}", "Kapasitas (termal atau batas kebijakan, mis. 80 %)"), ("T_{ganda}", "Waktu beban berlipat dua (tahun)")])
    isi += cards([
        ("📈", "Tren Historis", "Regresi eksponensial/linier atas 5–10 tahun data puncak penyulang; koreksi untuk perpindahan beban (manuver) dan tahun anomali (pandemi).", None),
        ("🗺️", "Peramalan Spasial", "Bagi wilayah menjadi sel 0,5–1 km²; tiap sel diberi kelas guna lahan dan kepadatan beban (kVA/km²) menurut tata ruang; beban muncul di sel yang berkembang.", None),
        ("🏭", "Beban Besar", "Pelanggan TM baru (pabrik, mal, data center) tidak terlihat dari tren; masuk lewat daftar permohonan sambungan dan izin bangunan.", None),
        ("☀️", "PLTS Atap & EV", "Pembangkit atap menurunkan beban siang tetapi tidak puncak malam; kendaraan listrik menambah puncak malam 2–7 kW per rumah: peramalan harus per jam, bukan hanya puncak.", None),
        ("📊", "Ketidakpastian", "Skenario rendah/dasar/tinggi (mis. 4/6/8 %) dan analisis sensitivitas; keputusan bertahap yang dapat ditunda lebih bernilai daripada investasi besar sekaligus.", None),
        ("🎯", "Kriteria Jenuh", "Penyulang: 60–80 % KHA (cadangan manuver N-1); trafo GI: 80 % dengan cadangan trafo tetangga; gardu distribusi: 80 %; JTR: ΔV 5 %.", None),
    ])
    isi += tabel(["Laju pertumbuhan g", "Beban th 5 (dari 5 MVA)", "Beban th 10", "Beban th 20", "T_ganda (tahun)", "Tahun jenuh 8 MVA @ 80 %"],
                 [[f"{gg * 100:.0f} %", ind(5 * (1 + gg) ** 5, 2), ind(5 * (1 + gg) ** 10, 2), ind(5 * (1 + gg) ** 20, 2), ind(math.log(2) / math.log(1 + gg), 1), ind(math.log(6.4 / 5) / math.log(1 + gg), 1)] for gg in [0.03, 0.05, 0.07, 0.10]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> perbedaan 3 % dan 7 % terlihat kecil setahun tetapi menjadi dua kali lipat dalam 20 tahun; salah menaksir laju pertumbuhan adalah kesalahan perencanaan yang paling mahal. Soal C6, C7, dan C14 memakai Persamaan (5).")
    m += bagian(5, "m-peramalan", "Peramalan Beban<br>dan Tahun Jenuh",
                "Jaringan yang cukup hari ini akan jenuh beberapa tahun lagi, dan pembangunannya memakan waktu 2–5 tahun; karena itu perencana harus meramal. Persamaan (5) memberi model pertumbuhan majemuk dan cara menghitung kapan kapasitas habis; Gambar 5 memperlihatkan perlombaan beban melawan kapasitas yang ditambah bertahap.",
                isi, "PERAMALAN BEBAN")

    # 06 — pengembangan
    isi = figure(6, "Lima pilihan pengembangan jaringan distribusi dan sifat biayanya", "Saat penyulang atau gardu jenuh, perencana memilih di antara uprating konduktor, penyulang baru, gardu sisipan, kompensasi, atau gardu induk baru, menurut biaya per kVA, waktu pelaksanaan, dan manfaat sampingan (rugi, keandalan, tegangan).", gambar6())
    isi += formula(6, "Biaya Tahunan Ekuivalen dan Perbandingan Pilihan", r"CRF = \dfrac{i(1+i)^n}{(1+i)^n - 1}, \qquad A = \text{Modal}\times CRF + \text{O\&M} + \text{Nilai rugi} + \text{Nilai ENS}, \qquad \text{pilih } A \text{ terkecil per kVA terlayani}",
                   rf"Suku bunga {ind(I_RATE * 100, 0)} %, umur {N_UMUR} tahun: \(CRF = 0{{,}}1\times1{{,}}1^{{20}}/(1{{,}}1^{{20}} - 1) = {ind(CRF, 4)}\). Uprating konduktor 8 km Rp 4 M: \(A = 4\times{ind(CRF, 4)} = {ind(4 * CRF * 1000, 0)}\) juta/tahun, ditambah O&M tetapi dikurangi penghematan rugi ± 150 MWh × Rp 1.200 = Rp 180 juta/tahun → biaya bersih ± Rp {ind(4 * CRF * 1000 - 180, 0)} juta/tahun untuk +3 MVA. Penyulang baru 8 km Rp 8 M + sel GI Rp 2 M: \(A = 10\times{ind(CRF, 4)} = {ind(10 * CRF * 1000, 0)}\) juta/tahun untuk +6 MVA dan keandalan (loop) yang lebih baik.",
                   "Capital recovery factor mengubah modal sekali bayar menjadi cicilan tahunan setara sehingga pilihan berumur dan berskala berbeda dapat dibandingkan per tahun. Pilihan yang murah per kVA tetapi tidak menambah keandalan (uprating) cocok untuk penyulang pendek; penyulang baru lebih mahal tetapi memberi jalur kedua (loop) yang menurunkan SAIDI (Modul 11). Keputusan akhir memakai analisis nilai sekarang seluruh rencana 10–20 tahun, termasuk kapan tiap tahap dilaksanakan.",
                   [("i", "Suku bunga / biaya modal tahunan"), ("n", "Umur ekonomis (tahun): kabel 25–30, trafo 20–25, relai 10–15"), ("\\text{Nilai ENS}", "Energi tak tersalurkan × biaya per kWh tak terlayani (Rp 10–50 ribu/kWh)")])
    isi += cards([
        ("🧭", "Rencana Induk", "RUPTL/rencana induk distribusi 5–10 tahun: peta beban spasial, daftar penyulang/gardu jenuh, dan urutan proyek per tahun dengan anggarannya.", None),
        ("🔀", "Manuver Dulu", "Sebelum membangun: pindahkan beban antar-penyulang lewat LBS, seimbangkan fasa, pasang kapasitor; sering menunda investasi 2–3 tahun tanpa biaya besar.", None),
        ("📏", "Standardisasi", "PLN membakukan AAAC 150/240, kabel XLPE 240/300, trafo 50–400 kVA, dan gardu beton; menyederhanakan stok, pemeliharaan, dan proteksi.", None),
        ("🤖", "Otomasi (DAS)", "LBS bermotor, recloser ber-SCADA, dan FLISR (fault location, isolation, service restoration) menaikkan keandalan tanpa menambah konduktor: pilihan pengembangan 'lunak'.", None),
        ("☀️", "Jaringan Aktif", "PLTS atap dan penyimpanan mengubah penyulang menjadi dua arah: pengembangan kini mencakup pengendalian tegangan/VAR terpusat dan hosting capacity, bukan hanya kVA.", None),
        ("🏭", "Sisi Pabrik", "Perencanaan yang sama di dalam pabrik: beban tumbuh dengan mesin baru, trafo dan feeder utama jenuh, koordinasi proteksi harus dihitung ulang setiap penambahan.", None),
    ])
    isi += tabel(["Pilihan untuk penyulang jenuh (8 MVA → perlu 12 MVA)", "Modal (Rp M)", "Tambahan kapasitas", "A = modal × CRF (Rp juta/th)", "Rp juta/th per MVA", "Manfaat lain"],
                 [[nama, ind(modal, 0), tambah, ind(modal * CRF * 1000, 0), ind(modal * CRF * 1000 / mva, 0), lain] for nama, modal, tambah, mva, lain in
                  [("Uprating AAAC 70 → 150 (8 km)", 4, "+3 MVA", 3, "rugi −55 %"), ("Penyulang baru 8 km + sel GI", 10, "+6 MVA", 6, "loop, SAIDI turun"), ("Kapasitor 2 × 1,2 MVAR", 0.8, "+0,8 MVA", 0.8, "ΔV, rugi −20 %"), ("GI baru 30 MVA (dibagi 6 penyulang)", 120, "+5 MVA per penyulang", 5, "penyulang lebih pendek")]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> per MVA, kapasitor dan uprating paling murah tetapi tambahan kapasitasnya terbatas; GI baru paling mahal per proyek tetapi bersaing per MVA bila dibagi ke banyak penyulang dan memperpendek semuanya. Perencana biasanya memadukan: kapasitor dan manuver sekarang, uprating 2 tahun lagi, penyulang baru 5 tahun lagi. Soal C7 dan C14 memakai Persamaan (5) dan konteks Bagian 06.")
    m += bagian(6, "m-pengembangan", "Pengembangan Jaringan:<br>Pilihan dan Ekonominya",
                "Ketika peramalan menunjukkan kapasitas akan habis, tersedia beberapa jalan keluar dengan biaya, waktu, dan manfaat berbeda. Persamaan (6) memberi cara membandingkannya secara tahunan lewat capital recovery factor, dan Gambar 6 merangkum lima pilihan yang lazim di distribusi 20 kV.",
                isi, "PENGEMBANGAN JARINGAN")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Aliran Daya Penyulang Radial: Backward/Forward Sweep, Profil Tegangan, dan Rugi", "cvAliranDaya",
                     [("sl_ad_bus", "v_ad_bus", "Jumlah bus beban", 2, 8, 1, 5, "5"), ("sl_ad_p", "v_ad_p", "Beban tiap bus (MW)", 0.2, 2.0, 0.05, 0.8, "0.80"), ("sl_ad_pf", "v_ad_pf", "Faktor daya beban", 0.7, 1.0, 0.01, 0.85, "0.85"), ("sl_ad_l", "v_ad_l", "Panjang tiap ruas (km)", 0.5, 5, 0.5, 2, "2.0"), ("sl_ad_iter", "v_ad_iter", "Jumlah iterasi sweep", 1, 6, 1, 3, "3")],
                     "btnAliranDaya", "toggleAliranDaya", "aliranDayaInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Titik hijau tegangan tiap bus setelah sweep; panah kuning menandai backward sweep (dari ujung ke GI), panah cyan forward sweep; di bawah tiap ruas tertulis daya masuk dan ruginya; garis merah batas 19 kV.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Iterasi 1 vs 3</strong>: rugi dihitung ulang dengan tegangan sebenarnya, hasilnya sedikit berubah lalu konvergen. (2) Naikkan beban atau panjang ruas: tegangan ujung jatuh di bawah 19 kV. (3) Naikkan pf ke 1: Q ruas hilang, rugi dan ΔV turun. Soal C8, C9, dan C15.")
    isi += anim_panel(2, "amber", r"Arus Hubung Singkat Sepanjang Penyulang dan Jangkauan Relai Arus Lebih", "cvHubungSingkat",
                      [("sl_hs_ssc", "v_hs_ssc", "Daya hubung singkat sumber (MVA)", 100, 600, 10, 300, "300"), ("sl_hs_l", "v_hs_l", "Panjang penyulang (km)", 5, 30, 1, 15, "15"), ("sl_hs_rn", "v_hs_rn", "NGR (Ω)", 0, 500, 4, 40, "40"), ("sl_hs_pick", "v_hs_pick", "Pickup relai fasa (A)", 200, 2000, 20, 600, "600")],
                      "btnHubungSingkat", "toggleHubungSingkat", "hubungSingkatInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Merah arus gangguan tiga fasa, cyan satu fasa–tanah, kuning putus pickup relai fasa; kilat putih berjalan menandai titik gangguan dan arusnya. Readout memberi jangkauan relai (titik terjauh yang arusnya masih ≥ pickup).<br>Amati: (1) <strong style=\"color:var(--amber)\">S_sc 100 vs 600 MVA</strong>: arus di GI berubah enam kali, di ujung hanya sedikit (impedansi saluran mendominasi). (2) NGR 0 → 500 Ω: arus tanah dari ribuan ampere ke puluhan ampere. (3) Pickup terlalu tinggi: ujung penyulang tak terjangkau. Soal C1, C2, C10, dan C11.")
    isi += anim_panel(3, "green", r"Koordinasi Kurva Waktu–Arus: Fuse, Relai Hilir, dan Relai Gardu Induk", "cvKoordinasi",
                      [("sl_ko_isa", "v_ko_isa", "Relai hulu A: I_s (A)", 300, 1200, 20, 600, "600"), ("sl_ko_tmsa", "v_ko_tmsa", "Relai hulu A: TMS", 0.05, 1.0, 0.01, 0.3, "0.30"), ("sl_ko_isb", "v_ko_isb", "Relai hilir B: I_s (A)", 100, 800, 20, 300, "300"), ("sl_ko_tmsb", "v_ko_tmsb", "Relai hilir B: TMS", 0.05, 0.5, 0.01, 0.1, "0.10"), ("sl_ko_if", "v_ko_if", "Arus gangguan uji (A)", 400, 8000, 100, 2500, "2500")],
                      "btnKoordinasi", "toggleKoordinasi", "koordinasiInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Kurva log–log waktu terhadap arus: merah relai hulu, hijau relai hilir, kuning fuse cabang 100 A; garis vertikal arus gangguan uji dengan titik waktu kerja masing-masing; readout memeriksa selang ≥ 0,3 s.<br>Amati: (1) <strong style=\"color:var(--green)\">Turunkan TMS A</strong> sampai selang < 0,3 s: koordinasi gagal, relai GI bisa mendahului. (2) Geser arus uji ke 800 A (gangguan jauh): selang berubah karena kurva melengkung. (3) I_s B di bawah 200 A: relai hilir tidak lagi 'di atas' fuse pada arus kecil. Soal C4 dan C12.")
    isi += anim_panel(4, "pink", r"Peramalan Beban Majemuk dan Penambahan Kapasitas Bertahap", "cvPeramalan",
                      [("sl_pr_s0", "v_pr_s0", "Beban awal (MVA)", 1, 8, 0.5, 4, "4.0"), ("sl_pr_g", "v_pr_g", "Pertumbuhan (%/tahun)", 1, 12, 1, 6, "6"), ("sl_pr_cap", "v_pr_cap", "Kapasitas awal (MVA)", 4, 12, 1, 8, "8"), ("sl_pr_tahap", "v_pr_tahap", "Penambahan tiap tahap (MVA)", 1, 10, 1, 4, "4"), ("sl_pr_batas", "v_pr_batas", "Batas pembebanan (%)", 60, 100, 5, 80, "80")],
                      "btnPeramalan", "togglePeramalan", "peramalanInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Merah beban yang tumbuh majemuk (digambar tahun demi tahun), cyan kapasitas bertangga dan batas pembebanannya (putus); titik kuning saat pengembangan dilakukan.<br>Amati: (1) <strong style=\"color:var(--pink)\">g 3 % vs 10 %</strong>: jumlah pengembangan dalam 20 tahun berubah drastis. (2) Tahap kecil (1 MVA) → sering membangun; tahap besar (10 MVA) → jarang tetapi modal menganggur. (3) Batas 100 %: proyek tertunda tetapi tanpa cadangan manuver. Soal C6, C7, dan C14.")
    isi += kotak("info-box", "<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur 4 bus × 0,8 MW pf 0,85 ruas 2 km dan cocokkan dengan Gambar 1. Pada Animasi 2 atur S_sc 240 MVA, 8 km, NGR 40 Ω dan cocokkan arus ujung dengan Bagian 02. Pada Animasi 3 atur B (300 A, TMS 0,1), A (500 A), arus uji 2000 A, lalu cari TMS A minimum yang memberi selang 0,4 s dan bandingkan dengan Bagian 04.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Operasi dan Perencanaan Distribusi",
                "Jalankan sweep aliran daya, geser daya hubung singkat dan NGR, atur setelan relai sampai terkoordinasi, lalu percepat pertumbuhan beban melawan kapasitas yang ditambah bertahap. Empat animasi ini memvisualkan Persamaan (1), (2), (4), dan (5).",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (A, Ω, kW, kV, s, ms, MW, MVA, tahun, A²s) dan jumlah desimal yang diminta.")
    isi += kode("Cell 1 — Aliran Daya Penyulang Radial: Backward/Forward Sweep", f'''import numpy as np

def sweep(beban_mw, pf, r, x, V1=20.0, iterasi=4):
    """Penyulang radial: bus 1..n dengan beban sama; r, x per ruas (ohm). Satuan MW, MVAR, kV."""
    n = len(beban_mw); Q = [p*np.tan(np.arccos(pf)) for p in beban_mw]
    V = np.full(n+1, V1)
    for it in range(iterasi):
        P_in = np.zeros(n+1); Q_in = np.zeros(n+1); rugi = np.zeros(n+1)
        for k in range(n, 0, -1):                       # backward
            Pd = beban_mw[k-1] + (P_in[k+1] if k < n else 0); Qd = Q[k-1] + (Q_in[k+1] if k < n else 0)
            rugi[k] = (Pd**2 + Qd**2)/V[k]**2*r; P_in[k] = Pd + rugi[k]; Q_in[k] = Qd + (Pd**2 + Qd**2)/V[k]**2*x
        for k in range(1, n+1):                         # forward
            V[k] = V[k-1] - (P_in[k]*r + Q_in[k]*x)/V[k-1]
        print(f"iterasi {{it+1}}: P_GI = {{P_in[1]:.4f}} MW, rugi total = {{rugi.sum()*1e3:.1f}} kW, V_ujung = {{V[n]:.4f}} kV")
    return V, P_in, rugi

V, P_in, rugi = sweep([0.8]*4, 0.85, 0.8, 0.7)
# Persamaan 1 pada ruas tunggal
P, Q, R, X, V1 = {ind(P_AD, 0)}, {ind(Q_AD, 1).replace(",", ".")}, {ind(R_AD, 1).replace(",", ".")}, {ind(X_AD, 1).replace(",", ".")}, 20.0
print(f"V2 = {{V1 - (P*R + Q*X)/V1:.4f}} kV; rugi (R = 2,4) = {{(P**2 + Q**2)/V1**2*2.4*1e3:.4f}} kW")
I = P/{ind(PF_AD, 1).replace(",", ".")}*1e6/(np.sqrt(3)*20e3); print(f"backward sweep: I = {{I:.2f}} A, rugi = {{3*I**2*R/1e3:.2f}} kW, P_sumber = {{P + 3*I**2*R/1e6:.4f}} MW")''')
    isi += kode("Cell 2 — Arus Hubung Singkat Sepanjang Penyulang dan Gangguan Tanah dengan NGR", f'''import numpy as np
import matplotlib.pyplot as plt

Vf = 20e3/np.sqrt(3); S_sc = {ind(SSC, 0)}; Xs = 400/S_sc
r, x = 0.4, 0.35
print(f"X_s = {{Xs:.4f}} ohm; I_sc di GI = {{Vf/Xs:.1f}} A")
def I3(d): return Vf/abs(complex(r*d, Xs + x*d))                         # Persamaan 2
def I1(d, Rn): return 3*Vf/abs(complex(5*r*d + 3*Rn, 3*Xs + 5*x*d))       # Z0 saluran ~ 3 Z1, Z0 sumber ~ Xs
for d in [0, 2, 5, 8, 12, 15]:
    print(f"{{d:2d}} km: I_3f = {{I3(d):7.1f}} A, I_1f-tanah (NGR 40) = {{I1(d, 40):6.1f}} A, (NGR 12) = {{I1(d, 12):6.1f}} A")
# NGR di titik gangguan dengan Z1 = Z2 = j2,5, Z0 = j7,5
Rn = {ind(NGR, 0)}; print(f"I_1f = 3Vf/|3Rn + j12.5| = {{3*Vf/abs(complex(3*Rn, 12.5)):.4f}} A")
d = np.linspace(0, 15, 151)
plt.figure(figsize=(7, 3.5)); plt.plot(d, [I3(v) for v in d], 'r', label='3 fasa'); plt.plot(d, [I1(v, 40) for v in d], 'c', label='1 fasa-tanah NGR 40')
plt.axhline(600, ls=':', color='orange', label='pickup 600 A'); plt.xlabel('km'); plt.ylabel('A'); plt.legend(); plt.grid(True); plt.show()''')
    isi += kode("Cell 3 — Fuse, Relai IDMT, dan Koordinasi TMS", f'''import numpy as np

# fuse trafo (Persamaan 3)
S = {ind(S_TRAFO, 0)}e3; In = S/(np.sqrt(3)*20e3)
print(f"I_n TM = {{In:.4f}} A -> fuse ~ {{2.5*In:.1f}} A; inrush 10 x 0,1 s: I2t = {{(10*In)**2*0.1:.1f}} A2s")
print(f"fuse 100 A (I2t 3e5) pada 2000 A lebur dalam {{3e5/2000**2*1e3:.2f}} ms")

# relai standard inverse (Persamaan 4)
def t_si(I, Is, TMS): return TMS*0.14/((I/Is)**0.02 - 1)
print(f"TMS {ind(TMS_C, 2).replace(",", ".")}, I = 4 Is: t = {{t_si(4, 1, {ind(TMS_C, 2).replace(",", ".")}):.4f}} s")
If, Is_B, TMS_B, Is_A, margin = {ind(IF_K, 0)}, {ind(IS_HILIR, 0)}, {ind(TMS_HILIR, 1).replace(",", ".")}, {ind(IS_HULU, 0)}, {ind(MARGIN, 1).replace(",", ".")}
tB = t_si(If, Is_B, TMS_B); tA = tB + margin
TMS_A = tA*((If/Is_A)**0.02 - 1)/0.14
print(f"t_B = {{tB:.4f}} s -> t_A = {{tA:.4f}} s -> TMS_A = {{TMS_A:.5f}}")
for I in [800, 1200, 2000, 4000]:
    print(f"I = {{I:5d}} A: fuse {{3e5/I**2:.3f}} s | B {{t_si(I, Is_B, TMS_B):.3f}} s | A {{t_si(I, Is_A, TMS_A):.3f}} s | selang {{t_si(I, Is_A, TMS_A) - t_si(I, Is_B, TMS_B):.3f}} s")''')
    isi += kode("Cell 4 — Peramalan Beban, Tahun Jenuh, dan Biaya Tahunan Ekuivalen", f'''import numpy as np

# Persamaan 5
P0, g, n = {ind(P0_F, 0)}, {ind(G_F, 2).replace(",", ".")}, {N_F}
print(f"P_{{n}} = {{P0*(1+g)**n:.4f}} MW; waktu ganda = {{np.log(2)/np.log(1+g):.2f}} tahun (aturan 70: {{70/(g*100):.1f}})")
S0, cap = {ind(S0_J, 1).replace(",", ".")}, {ind(CAP_J, 0)}
print(f"tahun jenuh 100 % = {{np.log(cap/S0)/np.log(1+g):.4f}}; 80 % = {{np.log(0.8*cap/S0)/np.log(1+g):.4f}}")
print(f"gardu 250 kVA berbeban {ind(S0_G, 0)} kVA, g 6 %: n = {{np.log(200/{ind(S0_G, 0)})/np.log(1.06):.4f}} tahun")

# kapasitas bertahap 20 tahun
kap, tambah = cap, []
for th in range(21):
    beban = S0*(1+g)**th
    if beban > 0.8*kap: kap += 4; tambah.append(th)
print(f"pengembangan +4 MVA pada tahun {{tambah}}; kapasitas akhir {{kap}} MVA untuk beban {{S0*(1+g)**20:.2f}} MVA")

# Persamaan 6: CRF dan biaya tahunan ekuivalen
i, umur = {ind(I_RATE, 2).replace(",", ".")}, {N_UMUR}
CRF = i*(1+i)**umur/((1+i)**umur - 1); print(f"CRF = {{CRF:.4f}}")
for nama, modal, mva in [("uprating", 4, 3), ("penyulang baru", 10, 6), ("kapasitor", 0.8, 0.8), ("GI baru per penyulang", 20, 5)]:
    print(f"{{nama:22s}}: A = {{modal*CRF*1e3:7.0f}} juta/th -> {{modal*CRF*1e3/mva:6.0f}} juta/th per MVA")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 01–06: V₂ {ind(V2_AD, 3)} kV, I_sc ujung {ind(I_SC_UJUNG, 0)} A, I_1φ {ind(I_1F, 0)} A, TMS hulu {ind(TMS_HULU, 4)}, P₁₀ {ind(P_N_F, 2)} MW, tahun jenuh {ind(N_JENUH, 2)}, CRF {ind(CRF, 4)}. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: sweep aliran daya, arus hubung singkat tiga fasa dan tanah, fuse dan koordinasi relai IDMT, serta peramalan, tahun jenuh, dan biaya tahunan ekuivalen. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "T. Gönen", "Electric Power Distribution Engineering", ", Third Edition. CRC Press, 2014.", "Bab 1 dan 3 (peramalan beban dan perencanaan), Bab 10 (proteksi sistem distribusi: fuse, recloser, sectionalizer, relai, dan koordinasinya): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "W. H. Kersting", "Distribution System Modeling and Analysis", ", Fourth Edition. CRC Press, 2018.", "Bab aliran daya penyulang radial (ladder iterative / backward-forward sweep) dan analisis hubung singkat pada penyulang.")
    refs += pm_ref(3, "violet", "168,85,247", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 7 dan 9 (hubung singkat simetris dan tak simetris) serta Bab 10 (proteksi: relai arus lebih, koordinasi, fuse dan recloser).")
    refs += pm_ref(4, "green", "0,224,158", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab sistem distribusi: peralatan penyulang, proteksi arus lebih, dan pertumbuhan beban; pustaka utama RPS.")
    refs += pm_ref(5, "pink", "236,72,153", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 6 (aliran daya) dan Bab 9–10 (hubung singkat seimbang dan tak seimbang dengan komponen simetris) sebagai pendalaman perhitungan.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk aliran daya penyulang radial, arus hubung singkat, peralatan dan koordinasi proteksi distribusi, serta peramalan dan perencanaan pengembangan. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> IEC 60255-151 (kurva relai arus lebih), ANSI/IEEE C37.42 (fuse cut-out dan link tipe K/T), IEEE Std 242 (Buff Book: koordinasi proteksi), dan SPLN 52-3 (pola pengaman sistem distribusi 20 kV) memuat kurva dan aturan koordinasi yang dipakai di Indonesia; RUPTL PLN memuat peramalan beban dan rencana pengembangan per wilayah. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul {NOMOR} — {JUDUL_PANJANG} · Teknik Tenaga Listrik · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = f'''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">I_sc = V_f/|Z_s + z·x|</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">t = TMS·0,14/((I/I_s)^0,02 − 1)</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">P_rugi = (P² + Q²)R/V²</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">n = ln(S_cap/S₀)/ln(1 + g)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">I²t = (k·I_n)²·t</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Aliran Daya, Proteksi,</em><br>dan Pengembangan</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar arus hubung singkat dan impedansi sumber, fuse dan I²t, relai IDMT dan koordinasi TMS, arus gangguan tanah dengan NGR, rugi dan tegangan aliran daya radial, peramalan majemuk, tahun jenuh, dan pengembangan gardu. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Fungsi <strong>fuse cut-out</strong> pada gardu distribusi adalah...",
     ["Menutup kembali penyulang secara otomatis setelah gangguan temporer", "Melebur pada arus gangguan trafo/JTR dan memisahkannya dari penyulang; dipilih 2–3 × I_n trafo agar tahan inrush", "Membatasi arus gangguan tanah lewat resistor netral", "Mengatur tegangan sekunder trafo"],
     "Fuse cut-out"),
    ("<strong>Recloser</strong> dipasang pada penyulang udara karena...",
     ["Ia lebih murah daripada fuse", "Ia membatasi tegangan surja petir", "Ia menghitung operasi pengaman hulu lalu membuka saat interval mati", "Sebagian besar gangguan SUTM (70–80 %) bersifat temporer dan hilang setelah pemutusan sesaat, sehingga buka–tutup otomatis memulihkan pasokan tanpa petugas"],
     "Recloser"),
    ("<strong>Sectionalizer</strong> berbeda dari recloser karena...",
     ["Ia tidak memutus arus gangguan; ia menghitung operasi recloser di hulunya dan membuka pada interval mati setelah hitungan tercapai", "Ia memutus arus gangguan lebih cepat daripada recloser", "Ia hanya dipasang di gardu induk", "Ia memerlukan kurva waktu–arus yang dikoordinasikan dengan fuse"],
     "Sectionalizer"),
    ("Relai arus lebih <strong>IDMT</strong> (inverse definite minimum time) bekerja...",
     ["Dalam waktu tetap berapa pun arusnya", "Seketika untuk semua arus di atas setelan", "Makin cepat untuk arus gangguan makin besar, mengikuti kurva seperti t = TMS·0,14/((I/I_s)^0,02 − 1)", "Hanya untuk gangguan satu fasa ke tanah"],
     "Relai IDMT"),
    ("Prinsip <strong>koordinasi</strong> pengaman berderet pada penyulang radial adalah...",
     ["Pengaman di gardu induk selalu bekerja lebih dulu", "Pengaman terdekat gangguan (hilir) bekerja lebih dulu; pengaman hulu diberi selang 0,3–0,4 s sebagai cadangan", "Semua pengaman bekerja serentak agar gangguan cepat hilang", "Fuse selalu disetel lebih lambat daripada relai"],
     "Koordinasi proteksi"),
    ("Skema <strong>fuse saving</strong> pada koordinasi recloser–fuse berarti...",
     ["Fuse dibiarkan lebur lebih dulu untuk setiap gangguan cabang", "Fuse diganti dengan recloser kecil", "Fuse dipasang seri dua buah agar lebih tahan", "Recloser membuka cepat sebelum fuse melebur agar gangguan temporer tidak memutus fuse; bila permanen, recloser menutup dengan kurva lambat dan fuse melebur"],
     "Fuse saving"),
    ("Daya hubung singkat 250 MVA pada rel 20 kV berarti impedansi ekuivalen sumber...",
     ["Z_s = V²/S_sc = 400/250 = 1,6 Ω, hampir seluruhnya reaktif", "Z_s = S_sc/V² = 0,625 Ω", "Z_s = V/S_sc = 0,08 Ω", "Tidak dapat ditentukan tanpa mengetahui panjang penyulang"],
     "Impedansi sumber"),
    ("<strong>Resistor pentanahan netral</strong> (NGR) pada trafo 20 kV berfungsi...",
     ["Menaikkan arus gangguan tiga fasa agar relai lebih peka", "Menghilangkan sama sekali arus gangguan tanah", "Membatasi arus gangguan satu fasa ke tanah (mis. 40 Ω → ± 300 A) agar kerusakan dan tegangan sentuh terkendali, sambil tetap terdeteksi relai tanah", "Mengompensasi daya reaktif penyulang"],
     "NGR"),
    ("Beban yang tumbuh <strong>7 % per tahun</strong> secara majemuk akan berlipat dua dalam kira-kira...",
     ["14 tahun", "10 tahun (aturan 70: 70/7)", "7 tahun", "20 tahun"],
     "Aturan 70"),
    ("Metode yang lazim untuk aliran daya <strong>penyulang radial</strong> adalah...",
     ["Newton–Raphson penuh dengan matriks Jacobian", "Metode simpleks", "Analisis komponen simetris", "Backward/forward sweep: arus dan rugi dijumlahkan dari ujung ke pangkal, lalu tegangan bus dihitung dari pangkal ke ujung, diulang sampai konvergen"],
     "Backward/forward sweep"),
]

COMP_EZ_LABELS = ["I_sc tiga fasa ujung penyulang", "Impedansi sumber dari S_sc", "Arus nominal TM dasar fuse cut-out", "Waktu kerja relai standard inverse", "Waktu lebur fuse dari I²t",
                  "Peramalan beban majemuk 8 tahun", "Tahun mencapai kapasitas penyulang", "Rugi ruas aliran daya (P²+Q²)R/V²", "Tegangan bus ujung V₁ − (PR+QX)/V₁", "Arus gangguan tanah dengan NGR"]
COMP_HARD_LABELS = ["I_sc pada titik x km dari S_sc", "TMS relai hulu untuk selang 0,4 s", "I²t inrush trafo untuk fuse",
                    "Tahun pengembangan gardu (batas 80 %)", "Daya sumber lewat backward sweep"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 2, 2: 0, 3: 3}
SSC_F, L_F = 240.0, 12.0
XS_F = 400 / SSC_F
I_GI_F = VF / XS_F
Z_UJ_F = math.hypot(R_KM * L_F, XS_F + X_KM * L_F)
I_UJ_F = VF / Z_UJ_F
I_BEBAN_F = 250.0
IS_F = 1.3 * I_BEBAN_F
L_REC = 6.0
Z_REC = math.hypot(R_KM * L_REC, XS_F + X_KM * L_REC)
I_REC_F = VF / Z_REC
IS_REC, TMS_REC = 200.0, 0.1
T_REC_F = TMS_REC * 0.14 / ((I_REC_F / IS_REC) ** 0.02 - 1)
TMS_GI_F = (T_REC_F + 0.4) * ((I_REC_F / IS_F) ** 0.02 - 1) / 0.14
T_GI_UJ = TMS_GI_F * 0.14 / ((I_UJ_F / IS_F) ** 0.02 - 1) if I_UJ_F > IS_F else float("inf")
S0_F, CAP_F, G_FF = 5.5, 8.0, 0.07
N_80_F = math.log(0.8 * CAP_F / S0_F) / math.log(1 + G_FF)
N_100_F = math.log(CAP_F / S0_F) / math.log(1 + G_FF)
S_10_F = S0_F * (1 + G_FF) ** 10

FQ_JUDUL = [
    f"Hitung arus hubung singkat di GI, di recloser ({ind(L_REC, 0)} km), dan di ujung ({ind(L_F, 0)} km) penyulang kawasan industri; apakah relai GI berpickup 1,3 × beban menjangkau ujungnya?",
    "Koordinasikan relai GI dengan recloser di tengah penyulang: hitung TMS relai GI untuk selang 0,4 s dan periksa waktu kerjanya pada gangguan ujung.",
    f"Beban penyulang {ind(S0_F, 1)} MVA tumbuh {ind(G_FF * 100, 0)} %/tahun dengan kapasitas {ind(CAP_F, 0)} MVA: kapan jenuh, dan pengembangan apa yang Anda usulkan beserta ekonominya?",
]
FQ_RINGKAS = [
    f"S_sc {ind(SSC_F, 0)} MVA → X_s (Persamaan 2); I_sc 3 fasa di 0, {ind(L_REC, 0)}, {ind(L_F, 0)} km dengan 0,4 + j0,35 Ω/km; pickup relai fasa 1,3 × {ind(I_BEBAN_F, 0)} A = {ind(IS_F, 0)} A dibandingkan I_sc ujung; peran GFR untuk gangguan tanah (NGR 40 Ω).",
    f"Recloser {ind(L_REC, 0)} km: I_s {ind(IS_REC, 0)} A, TMS {ind(TMS_REC, 1)}; pada I_sc di recloser hitung t_recloser (Persamaan 4), t_GI = t_rec + 0,4, TMS GI dengan I_s {ind(IS_F, 0)} A; periksa t_GI pada I_sc ujung dan pada elemen instan; bahas fuse saving untuk cabang.",
    f"Persamaan 5: tahun jenuh 80 % dan 100 %, beban tahun ke-10; Persamaan 6: bandingkan uprating (Rp 4 M, +3 MVA), penyulang baru (Rp 10 M, +6 MVA, loop), kapasitor (Rp 0,8 M, +0,8 MVA) dengan CRF 10 %/20 th; susun urutan pengembangan bertahap.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Penyulang 20 kV <b>{ind(L_F, 0)} km</b> (AAAC 150: 0,4 + j0,35 Ω/km) memasok kawasan industri dengan arus beban puncak <b>{ind(I_BEBAN_F, 0)} A</b>. Rel 20 kV gardu induk mempunyai daya hubung singkat <b>{ind(SSC_F, 0)} MVA</b> (sumber reaktif murni) dan netral trafo ditanahkan lewat NGR 40 Ω. Hitung impedansi sumber dan arus hubung singkat tiga fasa di gardu induk, di titik recloser ({ind(L_REC, 0)} km), dan di ujung penyulang (Persamaan 2). Relai arus lebih fasa di GI disetel 1,3 × arus beban puncak: apakah gangguan tiga fasa di ujung masih terdeteksi? Bagaimana dengan gangguan satu fasa ke tanah di ujung, dan alat apa yang menanganinya?",
            ["X_s = 400/S_sc", "I_sc(x) = V_f/|Z_s + z·x|", "I_s = 1,3 × I_beban"],
            "Arus hubung singkat tiga fasa di ujung penyulang dan jangkauan relai fasa kira-kira...",
            [f"{ind(I_GI_F, 0)} A di mana pun sepanjang penyulang, relai pasti menjangkau", f"{ind(I_UJ_F, 0)} A, di bawah pickup {ind(IS_F, 0)} A sehingga relai GI tidak menjangkau ujung", f"{ind(I_UJ_F, 0)} A (dari {ind(I_GI_F, 0)} A di GI), masih di atas pickup {ind(IS_F, 0)} A: relai fasa menjangkau ujung; gangguan tanah (± 300 A) ditangani GFR", f"{ind(VF / (R_KM * L_F), 0)} A (hanya resistansi saluran)"],
            f"✅ Tepat! \\(X_s = 400/{ind(SSC_F, 0)} = {ind(XS_F, 3)}\\) Ω → GI \\({ind(VF, 0)}/{ind(XS_F, 3)} = {ind(I_GI_F, 0)}\\) A; recloser \\(|{ind(R_KM * L_REC, 1)} + j{ind(XS_F + X_KM * L_REC, 3)}| = {ind(Z_REC, 3)}\\) Ω → {ind(I_REC_F, 0)} A; ujung \\(|{ind(R_KM * L_F, 1)} + j{ind(XS_F + X_KM * L_F, 3)}| = {ind(Z_UJ_F, 3)}\\) Ω → {ind(I_UJ_F, 0)} A. Pickup {ind(IS_F, 0)} A < {ind(I_UJ_F, 0)} A: gangguan tiga fasa di ujung terdeteksi ({ind(I_UJ_F / IS_F, 1)} × I_s, relai lambat tetapi bekerja). Gangguan tanah di ujung ≈ 3V_f/|120 + jX| ≈ 280 A, jauh di bawah pickup fasa → GFR berpickup ± 60–100 A yang menanganinya.",
            "❌ Hitung Z_s = V²/S_sc dulu, lalu tambahkan impedansi saluran (resistansi dan reaktansi) sampai titik gangguan; arus turun sepanjang penyulang, dan gangguan tanah dibatasi 3R_n.",
            "Petunjuk: (1) X_s, lalu |Z| dan I_sc di 0, 6, 12 km. (2) Bandingkan I_sc ujung dengan 1,3 × 250 A. (3) Taksir I gangguan tanah ujung dan jelaskan peran GFR.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Di titik {ind(L_REC, 0)} km dipasang recloser dengan setelan I_s {ind(IS_REC, 0)} A, kurva lambat standard inverse TMS {ind(TMS_REC, 1)}. Relai GI (I_s {ind(IS_F, 0)} A, standard inverse) harus menjadi cadangan dengan selang 0,4 s pada arus gangguan di lokasi recloser (Persamaan 4). Hitung waktu recloser dan TMS relai GI yang diperlukan, lalu periksa waktu kerja relai GI untuk gangguan di ujung penyulang (arus dari pertanyaan 1) dan untuk gangguan dekat GI (apakah elemen instan 50 boleh disetel 3000 A?). Bahas juga apakah cabang-cabang berfuse di hilir recloser sebaiknya memakai skema fuse saving.",
            ["t = TMS·0,14/((I/I_s)^0,02 − 1)", "t_GI = t_rec + 0,4", "instan GI > I_sc di recloser"],
            "TMS relai GI dan waktu kerjanya pada gangguan ujung kira-kira...",
            [f"TMS ≈ {ind(TMS_GI_F, 3)} (t_rec {ind(T_REC_F, 3)} s → t_GI {ind(T_REC_F + 0.4, 3)} s di recloser); pada gangguan ujung t_GI ≈ {ind(T_GI_UJ, 2)} s", f"TMS ≈ {ind(TMS_REC, 1)}, sama dengan recloser agar serentak", f"TMS ≈ {ind(TMS_GI_F * 3, 2)}; relai GI tidak perlu memperhatikan gangguan ujung", "TMS tidak dapat dihitung tanpa kurva fuse"],
            f"✅ Tepat! Di recloser I = {ind(I_REC_F, 0)} A: \\(t_{{rec}} = {ind(TMS_REC, 1)}\\times0{{,}}14/(({ind(I_REC_F, 0)}/{ind(IS_REC, 0)})^{{0,02}} - 1) = {ind(T_REC_F, 3)}\\) s → \\(t_{{GI}} = {ind(T_REC_F + 0.4, 3)}\\) s → \\(TMS = {ind(T_REC_F + 0.4, 3)}\\times(({ind(I_REC_F, 0)}/{ind(IS_F, 0)})^{{0,02}} - 1)/0{{,}}14 = {ind(TMS_GI_F, 4)}\\). Gangguan ujung ({ind(I_UJ_F, 0)} A): \\(t_{{GI}} = {ind(T_GI_UJ, 2)}\\) s, masih dalam ketahanan konduktor; recloser yang bekerja lebih dulu ({ind(TMS_REC * 0.14 / ((I_UJ_F / IS_REC) ** 0.02 - 1), 2)} s). Elemen instan 3000 A aman karena I_sc di recloser {ind(I_REC_F, 0)} A < 3000 A: hanya gangguan < ± 2 km dari GI yang diputus seketika. Fuse saving di hilir recloser mengurangi pemutusan fuse untuk gangguan temporer, tetapi menambah kedip pada seluruh seksi hilir; untuk kawasan industri dengan VSD, fuse blowing sering lebih disukai.",
            "❌ Selang koordinasi dihitung pada arus gangguan di lokasi pengaman hilir (recloser), bukan di GI; TMS relai GI diperoleh dengan membalik rumus IDMT pada waktu t_rec + 0,4 s.",
            "Petunjuk: (1) t_rec pada I_sc recloser, lalu t_GI dan TMS GI. (2) Hitung t_GI pada I_sc ujung dan periksa instan 3000 A. (3) Bahas fuse saving vs blowing untuk kawasan industri.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Beban puncak penyulang saat ini <b>{ind(S0_F, 1)} MVA</b> dan tumbuh <b>{ind(G_FF * 100, 0)} %/tahun</b>; kapasitas termal penyulang {ind(CAP_F, 0)} MVA dengan batas kebijakan 80 %. Hitung beban 10 tahun mendatang, tahun jenuh pada batas 80 % dan 100 % (Persamaan 5). Bandingkan tiga pilihan pengembangan dengan CRF (i = 10 %, 20 tahun; Persamaan 6): uprating konduktor (Rp 4 M, +3 MVA), penyulang baru dengan loop (Rp 10 M, +6 MVA), kapasitor 2 × 1,2 MVAR (Rp 0,8 M, +0,8 MVA), lalu susun urutan pengembangan bertahap 10 tahun untuk kawasan industri ini (pertimbangkan keandalan dari Modul 11).",
            ["P_n = P₀(1 + g)ⁿ", "n = ln(S_cap/S₀)/ln(1 + g)", "A = modal × CRF"],
            "Tahun jenuh batas 80 % dan beban 10 tahun mendatang kira-kira...",
            [f"{ind(N_100_F, 1)} tahun dan {ind(S0_F * (1 + G_FF * 10), 2)} MVA (pertumbuhan linier)", f"{ind(N_80_F, 1)} tahun dan {ind(S0_F + 10 * G_FF * S0_F, 2)} MVA", f"{ind(N_100_F, 1)} tahun dan {ind(S_10_F, 2)} MVA; batas 80 % tidak berpengaruh", f"{ind(N_80_F, 2)} tahun (100 %: {ind(N_100_F, 2)} tahun) dan {ind(S_10_F, 2)} MVA; kapasitor + manuver dulu, uprating ± tahun 2, penyulang baru (loop) ± tahun 6"],
            f"✅ Tepat! \\(n_{{80}} = \\ln(6{{,}}4/{ind(S0_F, 1)})/\\ln 1{{,}}07 = {ind(N_80_F, 2)}\\) tahun, \\(n_{{100}} = {ind(N_100_F, 2)}\\) tahun; \\(S_{{10}} = {ind(S0_F, 1)}\\times1{{,}}07^{{10}} = {ind(S_10_F, 2)}\\) MVA (> {ind(CAP_F, 0)} MVA). CRF = {ind(CRF, 4)}: uprating Rp {ind(4 * CRF * 1000, 0)} juta/th ({ind(4 * CRF * 1000 / 3, 0)} juta/MVA), penyulang baru Rp {ind(10 * CRF * 1000, 0)} juta/th ({ind(10 * CRF * 1000 / 6, 0)} juta/MVA + loop), kapasitor Rp {ind(0.8 * CRF * 1000, 0)} juta/th ({ind(0.8 * CRF * 1000 / 0.8, 0)} juta/MVA). Urutan wajar: kapasitor dan manuver sekarang (menunda ± 2 tahun), uprating saat mendekati 80 % (menambah ± 5 tahun), penyulang baru dengan loop menjelang tahun 6–8 karena beban tahun 10 melampaui 8 + 3 MVA dan kawasan industri memerlukan SAIDI rendah.",
            "❌ Pertumbuhan majemuk: pakai (1 + g)ⁿ, bukan 1 + n·g; tahun jenuh 80 % dihitung terhadap 0,8 × kapasitas, dan pengembangan disusun bertahap sesuai tahun jenuh tiap pilihan.",
            "Petunjuk: (1) S₁₀, n₈₀, n₁₀₀. (2) CRF dan A tiap pilihan per MVA. (3) Susun urutan bertahap dan kaitkan dengan keandalan (loop) untuk kawasan industri.")
    kartu = lambda teks, rgb, warna: f'      <div style="background:rgba({rgb},.05);border:1px solid rgba({rgb},.15);border-radius:10px;padding:12px 16px;font-family:\'JetBrains Mono\',monospace;font-size:13px;color:var(--{warna})">{teks}</div>'
    return f'''<div class="page" id="page-forum">
<div class="hero" data-tab="forum" style="min-height:55vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1c" d="" fill="none" stroke="rgba(0,230,118,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2c" d="" fill="none" stroke="rgba(124,77,255,.08)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">I_sc(x) = V_f/|Z_s + z·x|</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">t_GI = t_rec + 0,4 s</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">5,5 MVA × 1,07ⁿ</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">8 MVA?</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Penyulang Industri<br><em>Menuju Jenuh</em></h1>
    <p class="hero-sub">Sebuah penyulang 20 kV kawasan industri harus diperiksa proteksinya dan direncanakan pengembangannya sekaligus: berapa arus gangguannya, bagaimana relai dan recloser dikoordinasikan, dan kapan kapasitasnya habis. Terapkan kosakata Pertemuan {PERTEMUAN} — daya hubung singkat, kurva IDMT, selang koordinasi, pertumbuhan majemuk, CRF — untuk menjawabnya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Penyulang 20 kV, {ind(L_F, 0)} km, S_sc {ind(SSC_F, 0)} MVA —<br>Proteksi Hari Ini, Kapasitas Esok</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS PROTEKSI DAN PENGEMBANGAN PENYULANG INDUSTRI</div>
    <p>
      Sebuah <strong style="color:var(--amber)">penyulang 20 kV sepanjang {ind(L_F, 0)} km</strong> (AAAC 150, 0,4 + j0,35 Ω/km) dari gardu induk berdaya hubung singkat <strong style="color:var(--cyan)">{ind(SSC_F, 0)} MVA</strong> (NGR 40 Ω) memasok kawasan industri dengan arus beban puncak {ind(I_BEBAN_F, 0)} A ({ind(S0_F, 1)} MVA). Sebuah recloser terpasang di km {ind(L_REC, 0)}; cabang-cabang di hilirnya berfuse.
    </p>
    <p style="margin-top:12px">
      Dua pekerjaan menunggu: <strong style="color:var(--pink)">setelan relai GI belum pernah dihitung ulang</strong> sejak recloser dipasang, dan beban tumbuh <strong style="color:var(--pink)">{ind(G_FF * 100, 0)} %/tahun</strong> terhadap kapasitas termal {ind(CAP_F, 0)} MVA (batas kebijakan 80 %). Manajemen meminta rencana pengembangan 10 tahun dengan pilihan uprating, penyulang baru (loop), atau kapasitor.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menghitung arus gangguan, mengoordinasikan relai dengan recloser, dan menyusun rencana pengembangan <strong style="color:var(--cyan)">sebelum</strong> rapat perencanaan tahunan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"S_sc = {ind(SSC_F, 0)} MVA, NGR 40 Ω", "14,165,233", "cyan")}
{kartu(f"penyulang {ind(L_F, 0)} km, recloser di km {ind(L_REC, 0)}", "14,165,233", "cyan")}
{kartu(f"beban {ind(I_BEBAN_F, 0)} A ({ind(S0_F, 1)} MVA), g = {ind(G_FF * 100, 0)} %/th", "14,165,233", "cyan")}
{kartu(f"kapasitas {ind(CAP_F, 0)} MVA, batas 80 %", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Proteksi dan perencanaan bertemu di penyulang yang sama: setiap penambahan kapasitas mengubah arus gangguan dan setelan relai, dan setiap setelan relai membatasi seberapa jauh penyulang boleh diperpanjang. Forum ini mengajak Anda menghitung keduanya berurutan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Arus hubung singkat sepanjang penyulang {ind(L_F, 0)} km (S_sc {ind(SSC_F, 0)} MVA) dengan pickup relai GI dan letak recloser; kanan: beban {ind(S0_F, 1)} MVA × 1,07ⁿ melawan kapasitas {ind(CAP_F, 0)} MVA</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Penyulang 20 kV {ind(L_F, 0)} km (0,4 + j0,35 Ω/km) dari GI berdaya hubung singkat {ind(SSC_F, 0)} MVA (NGR 40 Ω), beban puncak {ind(I_BEBAN_F, 0)} A ({ind(S0_F, 1)} MVA) kawasan industri; recloser di km {ind(L_REC, 0)} (I_s {ind(IS_REC, 0)} A, TMS {ind(TMS_REC, 1)}), relai GI I_s 1,3 × beban dengan selang 0,4 s; beban tumbuh {ind(G_FF * 100, 0)} %/th terhadap kapasitas {ind(CAP_F, 0)} MVA (batas 80 %); pilihan: uprating Rp 4 M (+3 MVA), penyulang baru Rp 10 M (+6 MVA, loop), kapasitor Rp 0,8 M (+0,8 MVA); CRF 10 %/20 th."
FORUM_CHIPS_LMS = [f"S_sc = {ind(SSC_F, 0)} MVA, NGR 40 Ω", f"penyulang = {ind(L_F, 0)} km, recloser km {ind(L_REC, 0)}", f"beban = {ind(I_BEBAN_F, 0)} A, g {ind(G_FF * 100, 0)} %/th", f"kapasitas = {ind(CAP_F, 0)} MVA @ 80 %"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Arus hubung singkat sepanjang penyulang industri 12 km dan beban vs kapasitas (Pertemuan 13)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const Vf = 20e3 / Math.sqrt(3), Xs = 400 / 240, r = 0.4, x = 0.35, L = 12, n = 48, pickup = 325;
  const I3 = (d) => Vf / Math.hypot(r * d, Xs + x * d);
  // kiri: I_sc
  const padL = 56, padT = 18, padB = 26, plotW = Math.max(80, W * 0.5 - padL - 20), plotH = H - padT - padB;
  const X = (i) => padL + i / n * plotW, Y = (v) => padT + plotH - v / I3(0) * plotH;
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
  [0, 2000, 4000, 6000].forEach((v) => { if (v <= I3(0)) ctx.fillText(v + ' A', padL - 4, Y(v) + 3); });
  ctx.textAlign = 'center'; ctx.fillText('GI', padL, H - 8); ctx.fillText('km 6 (recloser)', X(n / 2), H - 8); ctx.fillText('12 km', X(n), H - 8);
  ctx.strokeStyle = 'rgba(239,68,68,1)'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= n; i++) { const v = I3(L * i / n); i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); } ctx.stroke();
  ctx.strokeStyle = 'rgba(255,179,0,.9)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Y(pickup)); ctx.lineTo(padL + plotW, Y(pickup)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(168,85,247,.9)'; ctx.beginPath(); ctx.moveTo(X(n / 2), padT); ctx.lineTo(X(n / 2), padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.textAlign = 'left'; ctx.fillText('I_sc: ' + I3(0).toFixed(0) + ' → ' + I3(6).toFixed(0) + ' → ' + I3(12).toFixed(0) + ' A', padL + 4, padT + 10);
  ctx.fillStyle = 'rgba(255,179,0,.95)'; ctx.fillText('pickup GI 1,3 × 250 = ' + pickup + ' A', padL + 4, Y(pickup) - 4);
  // kanan: beban vs kapasitas
  const pL = padL + plotW + 60, pW = W - pL - 16; if (pW < 60) return;
  const S0 = 5.5, g = 0.07, cap = 8, T = 12;
  const Xt = (t) => pL + t / T * pW, Yt = (v) => padT + plotH - v / 14 * plotH;
  ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.beginPath(); ctx.moveTo(pL, padT); ctx.lineTo(pL, padT + plotH); ctx.lineTo(pL + pW, padT + plotH); ctx.stroke();
  ctx.fillStyle = 'rgba(148,163,184,.65)'; ctx.textAlign = 'right'; [0, 4, 8, 12].forEach((v) => ctx.fillText(v + ' MVA', pL - 4, Yt(v) + 3));
  ctx.textAlign = 'center'; ctx.fillText('th 0', pL, H - 8); ctx.fillText('th 12', pL + pW, H - 8);
  ctx.strokeStyle = 'rgba(0,229,255,.9)'; ctx.beginPath(); ctx.moveTo(pL, Yt(cap)); ctx.lineTo(pL + pW, Yt(cap)); ctx.stroke();
  ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pL, Yt(0.8 * cap)); ctx.lineTo(pL + pW, Yt(0.8 * cap)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(239,68,68,1)'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 48; i++) { const t = T * i / 48, v = S0 * Math.pow(1 + g, t); i ? ctx.lineTo(Xt(t), Yt(v)) : ctx.moveTo(Xt(t), Yt(v)); } ctx.stroke();
  const n80 = Math.log(0.8 * cap / S0) / Math.log(1 + g), n100 = Math.log(cap / S0) / Math.log(1 + g);
  ctx.fillStyle = 'rgba(0,229,255,.95)'; ctx.textAlign = 'left'; ctx.fillText('kapasitas 8 MVA; 80 % pada th ' + n80.toFixed(1) + ', 100 % pada th ' + n100.toFixed(1), pL + 4, padT + 10);
  ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.fillText('beban 5,5 × 1,07ⁿ → th 10: ' + (S0 * Math.pow(1 + g, 10)).toFixed(2) + ' MVA', pL + 4, padT + 22);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
