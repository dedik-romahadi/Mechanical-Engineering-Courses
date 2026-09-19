# Konten Modul 13 Teknik Tenaga Listrik — Metode Single Line Diagram (Sub-CPMK 7.1,
# Pertemuan 14). Angka contoh dihitung di sini agar teks, tabel, dan gambar konsisten,
# dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 13
PERTEMUAN = 14
SUB_CPMK = "7.1"
JUDUL = "Metode Single Line Diagram"
JUDUL_PANJANG = "Metode Single Line Diagram"
JUDUL_EKSPOR = "Single Line Diagram dan Per Unit"

# ─────────────────────────── angka contoh ───────────────────────────
SQ3 = math.sqrt(3)
S_B = 100.0
V_B_HV, V_B_LV = 150.0, 13.8
ZB_HV = V_B_HV ** 2 / S_B                     # 225 Ω
ZB_LV = V_B_LV ** 2 / S_B                     # 1,9044 Ω
IB_HV = S_B * 1e6 / (SQ3 * V_B_HV * 1e3)      # 384,9 A
IB_LV = S_B * 1e6 / (SQ3 * V_B_LV * 1e3)      # 4184 A
# generator 60 MVA 13,8 kV X'' 0,18; trafo 75 MVA 13,8/150 X 0,09; saluran 45 Ω
XG_OWN, SG = 0.18, 60.0
XT_OWN, ST = 0.09, 75.0
XL_OHM = 45.0
XG = XG_OWN * S_B / SG                         # 0,30
XT = XT_OWN * S_B / ST                         # 0,12
XL = XL_OHM / ZB_HV                            # 0,20
XTH = XG + XT + XL                             # 0,62
I_SC_PU = 1 / XTH
I_SC_A = I_SC_PU * IB_HV
S_SC = S_B / XTH
# gangguan di rel 2 (GI 150 kV)
XTH2 = XG + XT
I_SC2_PU = 1 / XTH2
S_SC2 = S_B / XTH2
# motor 6,3 kV 4 MVA X'' 0,2 pada dasar 6,6 kV
XM_OWN, SM, VM, VBM = 0.2, 4.0, 6.3, 6.6
XM = XM_OWN * (S_B / SM) * (VM / VBM) ** 2
# dua jalur paralel
XA, XB = 0.4, 0.6
XTH_P = XA * XB / (XA + XB)
I_SC_P = 1 / XTH_P
# beban pu
S_LOAD, PF_LOAD, V_LOAD = 15.0, 0.9, 0.97
I_LOAD = S_LOAD / S_B / V_LOAD
# jatuh tegangan pu
I_PU, R_PU, X_PU = 0.8, 0.04, 0.16
VS_PU = math.hypot(1 + I_PU * R_PU, I_PU * X_PU)
REG_PU = (VS_PU - 1) * 100
# konversi dasar 50 → 100 MVA contoh
X_OLD, S_OLD = 0.12, 50.0
X_NEW = X_OLD * S_B / S_OLD


# ─────────────────────────── primitif gambar ───────────────────────────
def kawat(x1, y1, x2, y2, c=AX, w=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>'


def rel(x, y, c=TX, h=32):
    return f'<line x1="{x}" y1="{y - h / 2}" x2="{x}" y2="{y + h / 2}" stroke="{c}" stroke-width="4"/>'


def generator(x, y, c):
    return f'<circle cx="{x}" cy="{y}" r="14" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x, y + 4, "G", 11, c, "middle", "700")


def trafo(x, y, c):
    return f'<circle cx="{x - 7}" cy="{y}" r="10" fill="none" stroke="{c}" stroke-width="2"/><circle cx="{x + 7}" cy="{y}" r="10" fill="none" stroke="{c}" stroke-width="2"/>'


def reaktansi(x, y, w, label, c):
    return f'<rect x="{x}" y="{y - 11}" width="{w}" height="22" rx="3" fill="{BOX}" stroke="{c}" stroke-width="1.8"/>' + t(x + w / 2, y + 4, label, 9.5, c, "middle", "700")


def gambar1():
    b = t(330, 18, "Single line diagram sistem contoh: pembangkit → GI → saluran → GI beban → motor", 11.5, TX, "middle", "700")
    y = 70
    b += generator(40, y, "#00e09e") + t(40, y + 30, "G 60 MVA", 9, AX) + t(40, y + 42, "13,8 kV X'' 0,18", 9, AX)
    b += kawat(54, y, 120, y) + rel(120, y) + t(120, y - 24, "rel 1 · 13,8 kV", 9.5, TX, "middle", "600")
    b += kawat(120, y, 175, y) + trafo(190, y, "#a855f7") + kawat(207, y, 260, y) + t(190, y + 30, "T1 75 MVA", 9, "#a855f7") + t(190, y + 42, "13,8/150 kV X 0,09", 9, "#a855f7")
    b += rel(260, y) + t(260, y - 24, "rel 2 · 150 kV", 9.5, TX, "middle", "600")
    b += kawat(260, y, 420, y, "#22d3ee", 2.4) + t(340, y - 10, "saluran 150 kV, j45 Ω", 9.5, "#22d3ee", "middle", "600")
    b += rel(420, y) + t(420, y - 24, "rel 3 · 150 kV", 9.5, TX, "middle", "600")
    b += kawat(420, y, 475, y) + trafo(490, y, "#a855f7") + kawat(507, y, 560, y) + t(490, y + 30, "T2 30 MVA", 9, "#a855f7") + t(490, y + 42, "150/6,6 kV X 0,08", 9, "#a855f7")
    b += rel(560, y) + t(560, y - 24, "rel 4 · 6,6 kV", 9.5, TX, "middle", "600")
    b += kawat(560, y, 600, y) + f'<circle cx="614" cy="{y}" r="14" fill="{BOX}" stroke="#f59e0b" stroke-width="2"/>' + t(614, y + 4, "M", 11, "#f59e0b", "middle", "700") + t(614, y + 30, "M 4 MVA", 9, "#f59e0b") + t(614, y + 42, "6,3 kV X'' 0,2", 9, "#f59e0b")
    # simbol lain: PMT, beban, pentanahan
    for x in [95, 235, 445] :
        b += f'<rect x="{x - 5}" y="{y - 5}" width="10" height="10" fill="{BOX}" stroke="#ef4444" stroke-width="1.5"/>'
    b += t(95, y + 16, "PMT", 8.5, "#ef4444") + t(235, y + 16, "PMT", 8.5, "#ef4444") + t(445, y + 16, "PMT", 8.5, "#ef4444")
    b += kawat(420, y + 16, 420, y + 40) + f'<polygon points="414,{y + 40} 426,{y + 40} 420,{y + 52}" fill="#ef4444"/>' + t(420, y + 64, "beban 20 MW", 9, "#ef4444")
    b += t(330, 156, "Kaidah: satu garis per rangkaian tiga fasa; rel digambar tebal; peralatan diberi simbol baku beserta pengenalnya (MVA, kV, X %); PMT kotak, beban panah, pentanahan di netral trafo/generator", 10, AX)
    b += t(330, 172, "SLD adalah 'peta' sistem: dasar untuk diagram impedansi, studi hubung singkat, aliran daya, dan koordinasi proteksi (Modul 12)", 10, AX)
    return svg(660, 184, b, "Gambar 1 — Single line diagram sistem contoh dengan simbol dan pengenal peralatan")


def gambar2():
    b = t(330, 18, "Empat besaran dasar dan hubungan antar-tingkat tegangan", 12, TX, "middle", "700")
    kol = [("Dipilih", "S_base = 100 MVA", "sama untuk seluruh sistem", "#f59e0b"), ("Dipilih", "V_base = 150 kV", "per tingkat tegangan; berubah mengikuti rasio trafo", "#f59e0b"), ("Turunan", f"Z_base = V²/S = {ind(ZB_HV, 0)} Ω", "per tingkat tegangan", "#22d3ee"), ("Turunan", f"I_base = S/(√3 V) = {ind(IB_HV, 1)} A", "per tingkat tegangan", "#22d3ee")]
    for i, (jenis, rumus, ket, c) in enumerate(kol):
        x = 14 + i * 160
        b += f'<rect x="{x}" y="32" width="150" height="70" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>' + t(x + 75, 50, jenis, 9.5, c, "middle", "700") + t(x + 75, 68, rumus, 10, TX, "middle", "600") + t(x + 75, 86, ket, 8.5, AX)
    # tiga tingkat tegangan
    tingkat = [("13,8 kV", V_B_LV, "#00e09e"), ("150 kV", V_B_HV, "#22d3ee"), ("6,6 kV", 6.6, "#f59e0b")]
    for i, (nama, v, c) in enumerate(tingkat):
        x = 40 + i * 215
        zb = v * v / S_B
        ib = S_B * 1e6 / (SQ3 * v * 1e3)
        b += f'<rect x="{x}" y="118" width="190" height="62" rx="8" fill="{BOX}" stroke="{c}" stroke-width="1.6"/>' + t(x + 95, 136, f"tingkat {nama}", 10.5, c, "middle", "700") + t(x + 95, 152, f"Z_base = {nama.split()[0]}²/100 = {ind(zb, 3)} Ω", 9.5, TX) + t(x + 95, 168, f"I_base = {ind(ib, 0)} A", 9.5, TX)
        if i < 2:
            b += arrow(x + 190, 149, x + 215, 149, "#a855f7", 1.6)
    b += t(145, 200, "T1: 13,8/150 → V_base × 150/13,8", 9, "#a855f7") + t(470, 200, "T2: 150/6,6 → V_base × 6,6/150", 9, "#a855f7")
    b += t(330, 222, "Tegangan dasar ditetapkan di satu tingkat, lalu 'dipindahkan' lewat perbandingan lilitan setiap trafo; impedansi pu trafo lalu sama dari kedua sisinya sehingga trafo ideal hilang", 10, AX)
    return svg(660, 232, b, "Gambar 2 — Besaran dasar sistem per unit dan perambatannya melewati transformator")


def gambar3():
    b = t(330, 18, "Diagram reaktansi pada dasar 100 MVA (150 kV | 13,8 kV | 6,6 kV)", 12, TX, "middle", "700")
    y = 80
    b += f'<circle cx="34" cy="{y}" r="13" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + t(34, y + 4, "E", 10, "#00e09e", "middle", "700") + t(34, y + 26, "1∠0", 9, "#00e09e")
    b += kawat(47, y, 62, y) + reaktansi(62, y, 78, f"jX_g {ind(XG, 2)}", "#00e09e") + kawat(140, y, 160, y) + rel(160, y) + t(160, y - 24, "rel 1", 9.5, TX, "middle", "600")
    b += kawat(160, y, 178, y) + reaktansi(178, y, 78, f"jX_t1 {ind(XT, 2)}", "#a855f7") + kawat(256, y, 276, y) + rel(276, y) + t(276, y - 24, "rel 2", 9.5, TX, "middle", "600")
    b += kawat(276, y, 296, y) + reaktansi(296, y, 78, f"jX_L {ind(XL, 2)}", "#22d3ee") + kawat(374, y, 394, y) + rel(394, y) + t(394, y - 24, "rel 3", 9.5, TX, "middle", "600")
    xt2 = 0.08 * S_B / 30
    b += kawat(394, y, 414, y) + reaktansi(414, y, 82, f"jX_t2 {ind(xt2, 3)}", "#a855f7") + kawat(496, y, 516, y) + rel(516, y) + t(516, y - 24, "rel 4", 9.5, TX, "middle", "600")
    b += kawat(516, y, 536, y) + reaktansi(536, y, 78, f"jX_m {ind(XM, 2)}", "#f59e0b") + kawat(614, y, 628, y) + f'<circle cx="641" cy="{y}" r="13" fill="{BOX}" stroke="#f59e0b" stroke-width="2"/>' + t(641, y + 4, "E", 10, "#f59e0b", "middle", "700") + t(641, y + 26, "1∠0", 9, "#f59e0b")
    b += t(101, y + 34, f"0,18×100/60", 8.5, AX) + t(217, y + 34, "0,09×100/75", 8.5, AX) + t(335, y + 34, f"45/{ind(ZB_HV, 0)}", 8.5, AX) + t(455, y + 34, "0,08×100/30", 8.5, AX) + t(575, y + 34, "0,2×(100/4)×(6,3/6,6)²", 8.5, AX)
    b += t(330, 140, "Dihilangkan: resistansi (≪ X), kapasitansi saluran, beban statis, dan trafo ideal (sudah terserap dalam pemilihan V_base); generator dan motor = tegangan internal seri X''", 10, AX)
    b += t(330, 158, f"Gangguan 3φ di rel 3: dari kiri X = {ind(XTH, 2)}, dari kanan (motor) X = {ind(xt2 + XM, 3)} → X_th = {ind(XTH * (xt2 + XM) / (XTH + xt2 + XM), 4)} pu; motor menyumbang beberapa siklus pertama", 10, AX)
    return svg(660, 170, b, "Gambar 3 — Diagram reaktansi sistem contoh setelah konversi ke dasar bersama")


def gambar4():
    b = t(330, 18, "Reduksi Thevenin untuk gangguan di rel 3 (tanpa sumbangan motor)", 12, TX, "middle", "700")
    y1, y2, y3 = 62, 118, 174
    # langkah 1: seri
    b += t(40, y1 + 4, "1", 11, "#22d3ee", "middle", "700") + f'<circle cx="70" cy="{y1}" r="11" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + kawat(81, y1, 96, y1) + reaktansi(96, y1, 60, f"{ind(XG, 2)}", "#00e09e") + kawat(156, y1, 170, y1) + reaktansi(170, y1, 60, f"{ind(XT, 2)}", "#a855f7") + kawat(230, y1, 244, y1) + reaktansi(244, y1, 60, f"{ind(XL, 2)}", "#22d3ee") + kawat(304, y1, 330, y1) + rel(330, y1)
    b += t(480, y1 + 4, f"seri: X_th = {ind(XG, 2)} + {ind(XT, 2)} + {ind(XL, 2)} = {ind(XTH, 2)} pu", 10.5, TX, "middle", "600")
    # langkah 2: satu reaktansi
    b += t(40, y2 + 4, "2", 11, "#22d3ee", "middle", "700") + f'<circle cx="70" cy="{y2}" r="11" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + kawat(81, y2, 150, y2) + reaktansi(150, y2, 100, f"jX_th {ind(XTH, 2)}", "#ef4444") + kawat(250, y2, 330, y2) + rel(330, y2)
    b += f'<path d="M 330 {y2 + 10} l 8 10 l -6 2 l 10 12" fill="none" stroke="#ef4444" stroke-width="2.4"/>'
    b += t(480, y2 + 4, f"I_sc = E/X_th = 1/{ind(XTH, 2)} = {ind(I_SC_PU, 3)} pu", 10.5, TX, "middle", "600")
    # langkah 3: ke satuan nyata
    b += t(40, y3 + 4, "3", 11, "#22d3ee", "middle", "700")
    b += t(200, y3 + 4, f"I_base(150 kV) = 100 MVA/(√3·150 kV) = {ind(IB_HV, 1)} A", 10.5, TX, "middle", "600")
    b += t(480, y3 + 4, f"I_sc = {ind(I_SC_PU, 3)} × {ind(IB_HV, 1)} = {ind(I_SC_A, 0)} A;  S_sc = 100/{ind(XTH, 2)} = {ind(S_SC, 1)} MVA", 10.5, "#ef4444", "middle", "600")
    b += t(330, 206, f"Gangguan di rel 2: X_th = {ind(XTH2, 2)} → I_sc = {ind(I_SC2_PU, 3)} pu = {ind(I_SC2_PU * IB_HV, 0)} A, S_sc = {ind(S_SC2, 1)} MVA; di rel 1 (13,8 kV): X_th = {ind(XG, 2)} → {ind(1 / XG, 3)} pu × {ind(IB_LV, 0)} A = {ind(IB_LV / XG / 1000, 2)} kA", 10, AX)
    return svg(660, 216, b, "Gambar 4 — Tiga langkah studi hubung singkat: reduksi seri, arus per unit, konversi ke ampere dan MVA")


def gambar5():
    b = t(330, 18, "Dua jalur paralel dan sumbangan tiap sumber ke titik gangguan", 12, TX, "middle", "700")
    y = 90
    b += f'<circle cx="60" cy="{y - 36}" r="12" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + t(60, y - 32, "A", 10, "#00e09e", "middle", "700") + kawat(72, y - 36, 120, y - 36) + reaktansi(120, y - 36, 90, f"jX_A {ind(XA, 1)}", "#00e09e") + kawat(210, y - 36, 300, y - 36) + kawat(300, y - 36, 300, y)
    b += f'<circle cx="60" cy="{y + 36}" r="12" fill="{BOX}" stroke="#22d3ee" stroke-width="2"/>' + t(60, y + 40, "B", 10, "#22d3ee", "middle", "700") + kawat(72, y + 36, 120, y + 36) + reaktansi(120, y + 36, 90, f"jX_B {ind(XB, 1)}", "#22d3ee") + kawat(210, y + 36, 300, y + 36) + kawat(300, y + 36, 300, y)
    b += rel(300, y, TX, 90) + f'<path d="M 306 {y} l 10 12 l -7 2 l 12 14" fill="none" stroke="#ef4444" stroke-width="2.4"/>' + t(300, y + 60, "rel gangguan", 9.5, TX, "middle", "600")
    b += arrow(215, y - 46, 290, y - 46, "#00e09e", 1.6) + t(252, y - 52, f"I_A = 1/{ind(XA, 1)} = {ind(1 / XA, 2)} pu", 9.5, "#00e09e") + arrow(215, y + 50, 290, y + 50, "#22d3ee", 1.6) + t(252, y + 62, f"I_B = 1/{ind(XB, 1)} = {ind(1 / XB, 3)} pu", 9.5, "#22d3ee")
    b += t(490, y - 30, f"X_th = X_A ∥ X_B = {ind(XA, 1)}×{ind(XB, 1)}/({ind(XA, 1)} + {ind(XB, 1)}) = {ind(XTH_P, 2)} pu", 10.5, TX, "middle", "600")
    b += t(490, y - 8, f"I_sc = 1/{ind(XTH_P, 2)} = {ind(I_SC_P, 3)} pu = I_A + I_B", 10.5, "#ef4444", "middle", "600")
    b += t(490, y + 14, f"S_sc = 100/{ind(XTH_P, 2)} = {ind(S_B / XTH_P, 1)} MVA", 10.5, TX, "middle", "600")
    b += t(490, y + 36, "sumbangan tiap sumber ∝ 1/X-nya:", 10, AX) + t(490, y + 50, f"A {ind(1 / XA / I_SC_P * 100, 0)} %, B {ind(1 / XB / I_SC_P * 100, 0)} %", 10, AX)
    b += t(330, 176, "Menutup jalur kedua (loop, Modul 11) menaikkan keandalan tetapi juga arus gangguan: PMT dan kabel harus diperiksa ulang setiap kali topologi berubah", 10, AX)
    return svg(660, 186, b, "Gambar 5 — Reduksi paralel: arus gangguan total dan sumbangan tiap jalur")


def gambar6():
    b = ""
    ox, oy, sk = 70, 160, 420
    b += kawat(ox - 20, oy, ox + sk * 1.12, oy, GRID, 1) + kawat(ox, oy + 20, ox, oy - sk * 0.3, GRID, 1)
    phi = math.acos(0.9)
    Ir, Ii = I_PU * math.cos(phi), -I_PU * math.sin(phi)
    dVr, dVi = Ir * R_PU - Ii * X_PU, Ir * X_PU + Ii * R_PU
    Vs = math.hypot(1 + dVr, dVi)
    b += arrow(ox, oy, ox + sk, oy, "#00e09e", 2.6) + t(ox + sk / 2, oy + 18, "V_r = 1∠0 pu (acuan)", 10.5, "#00e09e", "middle", "700")
    b += arrow(ox, oy, ox + Ir * sk * 0.6, oy - Ii * sk * 0.6, "#f59e0b", 2.2) + t(ox + Ir * sk * 0.6 + 8, oy - Ii * sk * 0.6 + 12, f"I = {ind(I_PU, 1)}∠−{ind(math.degrees(phi), 1)}° pu", 10, "#f59e0b", "start", "600")
    b += arrow(ox + sk, oy, ox + (1 + Ir * R_PU) * sk, oy - (Ir * X_PU) * sk * 0, "#ef4444", 1.6)
    b += arrow(ox + sk, oy, ox + (1 + dVr) * sk, oy - dVi * sk, "#ef4444", 1.8) + t(ox + (1 + dVr / 2) * sk + 30, oy - dVi * sk / 2 - 6, f"I·Z = {ind(math.hypot(dVr, dVi), 4)} pu", 10, "#ef4444", "start", "600")
    b += arrow(ox, oy, ox + (1 + dVr) * sk, oy - dVi * sk, "#22d3ee", 2.6) + t(ox + (1 + dVr) * sk * 0.55, oy - dVi * sk * 0.55 - 14, f"V_s = {ind(Vs, 4)}∠{ind(math.degrees(math.atan2(dVi, 1 + dVr)), 2)}° pu", 10.5, "#22d3ee", "middle", "700")
    b += t(330, 200, f"Saluran {ind(R_PU, 2)} + j{ind(X_PU, 2)} pu, beban I = {ind(I_PU, 1)} pu pf 0,9 tertinggal: V_s = V_r + I(R + jX) → regulasi {ind((Vs - 1) * 100, 2)} %; pendekatan I(R cos φ + X sin φ) = {ind(I_PU * (R_PU * 0.9 + X_PU * math.sin(phi)), 4)} pu", 10, AX)
    b += t(330, 218, f"Beban resistif {ind(I_PU, 1)} pu (pf 1): |V_s| = √((1 + {ind(I_PU * R_PU, 3)})² + ({ind(I_PU * X_PU, 3)})²) = {ind(VS_PU, 4)} pu ({ind(REG_PU, 2)} %); dalam pu, rumus Modul 6 dan 10 berlaku tanpa √3 dan tanpa rasio trafo", 10, AX)
    return svg(660, 230, b, "Gambar 6 — Fasor tegangan dan arus dalam per unit: V_s = V_r + I·Z")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-sld">Single Line Diagram</a>
  <a href="#m-perunit">Sistem Per Unit</a>
  <a href="#m-konversi">Konversi Dasar</a>
  <a href="#m-reaktansi">Diagram Reaktansi</a>
  <a href="#m-thevenin">Hubung Singkat</a>
  <a href="#m-fasor">Tegangan &amp; Arus pu</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="80" r="8" fill="none" stroke="rgba(0,224,158,.6)" stroke-width="1.5"/>
      <line x1="26" y1="80" x2="40" y2="80" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="40" y1="68" x2="40" y2="92" stroke="rgba(226,232,240,.7)" stroke-width="3"/>
      <line x1="40" y1="80" x2="52" y2="80" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <circle cx="58" cy="80" r="6" fill="none" stroke="rgba(168,85,247,.7)" stroke-width="1.2"/><circle cx="66" cy="80" r="6" fill="none" stroke="rgba(168,85,247,.7)" stroke-width="1.2"/>
      <line x1="72" y1="80" x2="90" y2="80" stroke="rgba(0,229,255,.5)" stroke-width="1.5"/>
      <text x="14" y="120" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">G — rel — T — saluran</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="70" width="60" height="20" rx="3" fill="none" stroke="rgba(0,229,255,.6)" stroke-width="1.2"/>
      <text x="50" y="84" fill="rgba(0,229,255,.7)" font-family="JetBrains Mono" font-size="8" text-anchor="middle">jX 0,62 pu</text>
      <text x="50" y="120" fill="rgba(239,68,68,.6)" font-family="JetBrains Mono" font-size="8" text-anchor="middle">I_sc = 1/X_th</text>
      <text x="50" y="140" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8" text-anchor="middle">Z_b = V²/S</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="13">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">Z_base = V²/S</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">X_baru = X_lama·(S_b/S_l)·(V_l/V_b)²</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">I_sc = 1/X_th</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">S_sc = S_base/X_th</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">I_base = S/(√3·V)</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">pu = nyata/dasar</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">trafo ideal hilang</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">V_s = V_r + I·Z</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Metode</span><br>
      <em>Single Line</em><br>
      <span class="hl-amber">Diagram</span>
    </h1>
    <p class="hero-sub">Sistem tenaga listrik sesungguhnya berupa ratusan rel dan tiga fasa pada beberapa tingkat tegangan; untuk dianalisis ia dipadatkan menjadi satu garis per rangkaian dan satu skala per unit untuk semua tegangan. Modul ini mengajarkan membaca dan menyusun single line diagram, memilih besaran dasar, mengonversi impedansi peralatan ke dasar bersama, menyusun diagram reaktansi, lalu mereduksinya menjadi impedansi Thevenin untuk menghitung arus dan daya hubung singkat, dengan contoh yang sama dari pembangkit sampai motor pabrik.</p>
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

    # 01 — SLD
    isi = figure(1, "Single line diagram sistem contoh dengan simbol dan pengenal peralatan", "Generator 60 MVA 13,8 kV, transformator T1 75 MVA 13,8/150 kV, saluran 150 kV 45 Ω, transformator T2 30 MVA 150/6,6 kV, dan motor 4 MVA 6,3 kV, dihubungkan lewat empat rel; setiap peralatan membawa pengenalnya sehingga diagram dapat langsung diubah menjadi diagram impedansi.", gambar1())
    isi += formula(1, "Tiga Fasa Seimbang Menjadi Satu Garis", r"S_{3\varphi} = 3\,V_f I = \sqrt{3}\,V_L I, \qquad Z_{per\ fasa} = \dfrac{V_f}{I}, \qquad \text{analisis per fasa: } V_f = \dfrac{V_L}{\sqrt{3}},\ \text{lalu hasil} \times 3",
                   rf"Saluran 150 kV contoh menyalurkan 60 MVA: \(I = 60\times10^6/(\sqrt{{3}}\times150\times10^3) = {ind(60e6 / (SQ3 * 150e3), 1)}\) A per fasa; rangkaian per fasa memakai \(V_f = 150/\sqrt{{3}} = {ind(150 / SQ3, 2)}\) kV dan impedansi per fasa, dan daya tiga fasa = 3 × daya per fasa. Single line diagram menggambar rangkaian per fasa itu tanpa netral, karena pada sistem seimbang arus netral nol.",
                   "Sistem seimbang mempunyai tiga fasa yang identik kecuali bergeser 120°, sehingga cukup satu fasa yang dianalisis. Single line diagram (SLD) membuang dua fasa dan netral, lalu menyimbolkan peralatan: lingkaran G/M untuk mesin, dua lingkaran untuk trafo, garis tebal untuk rel, kotak untuk PMT, panah untuk beban. Ia adalah dokumen teknik paling dasar sebuah instalasi: dari SLD lahir diagram impedansi, studi hubung singkat, aliran daya, setelan proteksi, dan prosedur manuver.",
                   [("V_f, V_L", "Tegangan fasa–netral dan antar-saluran (V)"), ("Z_{per\\ fasa}", "Impedansi hubungan Y ekuivalen (Δ dikonversi Z_Y = Z_Δ/3)"), ("I", "Arus saluran (A)")])
    isi += cards([
        ("🔣", "Simbol Baku", "IEC 60617 / ANSI Y32.2: generator (G dalam lingkaran), trafo (dua lingkaran atau dua kumparan), rel (garis tebal), PMT (kotak), pemisah (saklar), fuse, arrester, kapasitor, beban (panah), tanah.", None),
        ("🏷️", "Pengenal", "Tiap peralatan membawa MVA, kV, dan X % (atau Ω/km dan panjang untuk saluran); tanpa pengenal SLD tidak dapat dihitung, hanya dibaca.", None),
        ("🔀", "Hubungan Trafo", "Y-Δ, Δ-Y, Y-Y dengan pentanahan netral: menentukan pergeseran fasa 30° dan jalur arus urutan nol (penting untuk gangguan tanah), tetapi tidak mengubah diagram urutan positif.", None),
        ("🏭", "SLD Pabrik", "Dari gardu pelanggan 20 kV ke trafo, panel utama TR, dan feeder mesin: dokumen wajib untuk izin, pemeliharaan, dan koordinasi proteksi; sering usang setelah penambahan mesin.", None),
        ("🗺️", "Tingkat Detail", "SLD operasi (rel, PMT, pemisah, status buka/tutup) untuk manuver; SLD studi (impedansi) untuk perhitungan; SLD proteksi (CT, relai) untuk koordinasi.", None),
        ("🔗", "Rantai Modul", "Modul 9 memberi impedansi saluran, Modul 8 trafo, Modul 12 arus gangguan penyulang; modul ini menyatukan semuanya dalam satu skala per unit untuk sistem multi-tegangan.", None),
    ])
    isi += tabel(["Peralatan pada SLD contoh", "Simbol", "Pengenal", "Data untuk diagram impedansi", "Catatan"], [
        ["Generator G", "lingkaran G", "60 MVA, 13,8 kV", "X'' = 0,18 pu (dasar sendiri)", "X'' untuk hubung singkat awal; X_d untuk keadaan tunak"],
        ["Transformator T1", "dua lingkaran", "75 MVA, 13,8/150 kV, YNd", "X = 0,09 pu (dasar sendiri)", "R diabaikan; tap nominal"],
        ["Saluran 150 kV", "garis", "80 km", "X = 45 Ω (0,56 Ω/km)", "B diabaikan untuk hubung singkat"],
        ["Transformator T2", "dua lingkaran", "30 MVA, 150/6,6 kV, Dyn", "X = 0,08 pu", "sisi 6,6 kV memasok motor"],
        ["Motor M", "lingkaran M", "4 MVA, 6,3 kV", "X'' = 0,2 pu (dasar sendiri)", "tegangan pengenal ≠ V_base sisi itu"],
        ["Beban rel 3", "panah", "20 MW pf 0,9", "—", "diabaikan pada studi hubung singkat"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> setiap baris pengenal memakai dasarnya sendiri (60, 75, 30, 4 MVA; 13,8, 150, 6,3 kV) sehingga belum bisa dijumlahkan; Bagian 02–03 menyamakan dasarnya. Perhatikan motor 6,3 kV pada tingkat 6,6 kV: tegangan pengenal dan tegangan dasar berbeda, dan itu harus dikoreksi kuadratis. Soal C5 dan C10 memakai konversi satuan Persamaan (1).")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 membaca SLD, Bagian 02 memperkenalkan per unit dan empat besaran dasar, Bagian 03 mengonversi pengenal tiap peralatan ke dasar bersama, Bagian 04 menyusun diagram reaktansi, Bagian 05 mereduksinya (seri, paralel) menjadi arus dan daya hubung singkat, dan Bagian 06 memakai per unit untuk tegangan dan arus beban. Semua bagian memakai sistem contoh Gambar 1; animasi dan Python mengulanginya.")
    m += bagian(1, "m-sld", "Single Line Diagram:<br>Simbol, Kaidah, dan Pengenal",
                "Sebelum menghitung apa pun, insinyur harus dapat membaca 'peta' sistem: siapa memasok siapa, lewat trafo dan saluran mana, dan berapa pengenalnya. Single line diagram menggambar sistem tiga fasa seimbang sebagai satu garis per rangkaian dengan simbol baku, seperti Gambar 1; Persamaan (1) mengingatkan mengapa satu fasa cukup mewakili tiganya.",
                isi, "SINGLE LINE DIAGRAM")

    # 02 — per unit
    isi = figure(2, "Besaran dasar sistem per unit dan perambatannya melewati transformator", f"Dua besaran dipilih (S_base untuk seluruh sistem, V_base pada satu tingkat), dua lainnya mengikuti: Z_base = V²/S = {ind(ZB_HV, 0)} Ω dan I_base = {ind(IB_HV, 1)} A pada 150 kV. Menyeberangi trafo, V_base berubah mengikuti perbandingan lilitan sehingga tiap tingkat mempunyai Z_base dan I_base sendiri.", gambar2())
    isi += formula(2, "Besaran Dasar dan Nilai Per Unit", r"\text{nilai}_{pu} = \dfrac{\text{nilai sebenarnya}}{\text{nilai dasar}}, \qquad Z_{base} = \dfrac{V_{base}^2}{S_{base}}, \qquad I_{base} = \dfrac{S_{base}}{\sqrt{3}\,V_{base}}, \qquad V_{base,2} = V_{base,1}\dfrac{N_2}{N_1}",
                   rf"Dasar {ind(S_B, 0)} MVA, 150 kV: \(Z_{{base}} = 150^2/100 = {ind(ZB_HV, 0)}\) Ω, \(I_{{base}} = 100\times10^6/(\sqrt{{3}}\times150\times10^3) = {ind(IB_HV, 1)}\) A. Saluran 45 Ω → \(45/{ind(ZB_HV, 0)} = {ind(XL, 2)}\) pu. Sisi 13,8 kV (lewat T1 13,8/150): \(V_{{base}} = 13{{,}}8\) kV, \(Z_{{base}} = {ind(ZB_LV, 4)}\) Ω, \(I_{{base}} = {ind(IB_LV, 0)}\) A. Sisi 6,6 kV (lewat T2 150/6,6): \(Z_{{base}} = {ind(6.6 ** 2 / S_B, 4)}\) Ω. Tegangan rel 0,97 pu pada tingkat 150 kV = {ind(0.97 * 150, 1)} kV.",
                   "Per unit adalah persen dibagi seratus: semua besaran dinyatakan sebagai pecahan dari nilai dasar yang dipilih. Keuntungannya: (1) impedansi peralatan sejenis berada dalam rentang sempit (trafo 0,05–0,12, generator 0,1–0,25 pu) sehingga kesalahan mudah terlihat; (2) √3 dan rasio trafo hilang dari perhitungan; (3) seluruh sistem multi-tegangan menjadi satu rangkaian tanpa trafo ideal, asalkan V_base tiap tingkat mengikuti perbandingan lilitan. Pabrikan selalu memberi X trafo dan mesin dalam persen pada dasar pengenalnya sendiri.",
                   [("S_{base}", "Daya dasar, satu untuk seluruh sistem (lazim 100 MVA; pabrik 10 MVA)"), ("V_{base}", "Tegangan dasar antar-saluran per tingkat (kV), biasanya tegangan pengenal"), ("N_2/N_1", "Perbandingan lilitan (tegangan pengenal) transformator")])
    isi += cards([
        ("🎯", "Memilih S_base", "Angka bulat yang memudahkan: 100 MVA untuk sistem utilitas, 10 atau 1 MVA untuk pabrik; pilihan tidak mengubah hasil dalam ampere dan volt.", None),
        ("📏", "Memilih V_base", "Tetapkan di satu tingkat (mis. 150 kV), lalu rambatkan lewat rasio tegangan pengenal setiap trafo; jangan memakai tegangan operasi sesaat.", None),
        ("⚖️", "Rentang Wajar", "Trafo daya X 5–12 %; generator X'' 12–25 %; motor X'' 15–25 %; saluran 150 kV 0,3–0,6 Ω/km ≈ 0,15–0,3 pu per 100 km (dasar 100 MVA).", None),
        ("🔁", "Kembali ke Nyata", "Kalikan dengan dasarnya: I = I_pu × I_base, V = V_pu × V_base, S = S_pu × S_base; ingat I_base berbeda tiap tingkat tegangan.", None),
        ("⚡", "Tegangan 1 pu", "Pada studi hubung singkat, tegangan pragangguan diambil 1,0 pu (tegangan pengenal) dan arus beban diabaikan; pada aliran daya, tegangan rel 0,95–1,05 pu.", None),
        ("🏭", "Di Pabrik", "Katalog motor/trafo memberi Z % pada pengenalnya; menghitung arus hubung singkat panel TR pabrik adalah latihan per unit dengan S_base 1 MVA dan V_base 0,4 kV.", None),
    ])
    isi += tabel(["Tingkat tegangan (S_base 100 MVA)", "V_base (kV)", "Z_base = V²/S (Ω)", "I_base = S/(√3 V) (A)", "1 pu tegangan", "Contoh: 0,2 pu ="],
                 [[nama, ind(v, 1), ind(v * v / S_B, 4), ind(S_B * 1e6 / (SQ3 * v * 1e3), 1), f"{ind(v, 1)} kV", f"{ind(0.2 * v * v / S_B, 4)} Ω / {ind(0.2 * S_B * 1e6 / (SQ3 * v * 1e3), 1)} A"] for nama, v in
                  [("Transmisi 500 kV", 500), ("Transmisi 150 kV", 150), ("Pembangkit 13,8 kV", 13.8), ("Distribusi 20 kV", 20), ("Pabrik 6,6 kV", 6.6), ("Tegangan rendah 0,4 kV", 0.4)]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> 0,2 pu berarti 45 Ω di 150 kV tetapi hanya 0,00032 Ω di 400 V; dan 1 pu arus adalah 385 A di 150 kV tetapi 144 kA di 400 V. Per unit menyembunyikan perbedaan skala itu sehingga satu angka (0,2) bermakna sama di mana pun: 20 % jatuh tegangan pada arus penuh. Soal C1, C2, dan C5 memakai Persamaan (2).")
    m += bagian(2, "m-perunit", "Sistem Per Unit:<br>Besaran Dasar dan Maknanya",
                "Sistem tenaga mempunyai beberapa tingkat tegangan yang dihubungkan trafo; menghitungnya dalam volt dan ohm berarti mengonversi bolak-balik lewat rasio trafo. Sistem per unit menggantikan semua itu dengan satu skala: setiap besaran dinyatakan sebagai pecahan dari nilai dasarnya. Persamaan (2) mendefinisikan empat besaran dasar, dan Gambar 2 memperlihatkan bagaimana tegangan dasar merambat melewati transformator.",
                isi, "SISTEM PER UNIT")

    # 03 — konversi dasar
    isi = formula(3, "Konversi Impedansi ke Dasar Bersama", r"Z_{pu,baru} = Z_{pu,lama}\left(\dfrac{S_{base,baru}}{S_{base,lama}}\right)\left(\dfrac{V_{base,lama}}{V_{base,baru}}\right)^2, \qquad Z_{pu} = \dfrac{Z_\Omega}{Z_{base}} = Z_\Omega\dfrac{S_{base}}{V_{base}^2}",
                   rf"Generator 60 MVA X'' 0,18 → \(0{{,}}18\times100/60 = {ind(XG, 2)}\) pu; T1 75 MVA X 0,09 → \(0{{,}}09\times100/75 = {ind(XT, 2)}\) pu; saluran 45 Ω → \(45/{ind(ZB_HV, 0)} = {ind(XL, 2)}\) pu; T2 30 MVA X 0,08 → \(0{{,}}08\times100/30 = {ind(0.08 * S_B / 30, 3)}\) pu. Motor 4 MVA 6,3 kV X'' 0,2 pada tingkat berdasar 6,6 kV: \(0{{,}}2\times(100/4)\times(6{{,}}3/6{{,}}6)^2 = 0{{,}}2\times25\times{ind((VM / VBM) ** 2, 4)} = {ind(XM, 3)}\) pu. Contoh lain: X 0,12 pu pada 50 MVA → \(0{{,}}12\times100/50 = {ind(X_NEW, 2)}\) pu pada 100 MVA.",
                   "Impedansi per unit berbanding lurus S_base dan berbanding terbalik kuadrat V_base, karena Z_pu = Z_Ω·S/V². Konversi daya (S) hampir selalu diperlukan sebab pabrikan memakai pengenal masing-masing; konversi tegangan hanya bila tegangan pengenal peralatan berbeda dari tegangan dasar tingkat itu (motor 6,3 kV pada tingkat 6,6 kV, generator 13,2 kV pada tingkat 13,8 kV). Lupa faktor kuadrat tegangan adalah kesalahan paling umum.",
                   [("S_{base,lama}, V_{base,lama}", "Dasar pengenal peralatan (nameplate)"), ("S_{base,baru}, V_{base,baru}", "Dasar sistem yang dipilih pada tingkat itu"), ("Z_\\Omega", "Impedansi dalam ohm (saluran, kabel, reaktor)")])
    isi += cards([
        ("✖️", "Skala Daya", "Menaikkan S_base 50 → 100 MVA menggandakan semua Z_pu peralatan; ampere hasil akhirnya sama karena I_base ikut berlipat.", None),
        ("²", "Skala Tegangan", "Motor 6,3 kV pada dasar 6,6 kV: faktor (6,3/6,6)² = 0,911; generator 13,2 kV pada dasar 13,8: 0,915; kecil tetapi tidak boleh diabaikan.", None),
        ("🧮", "Ohm ke pu", "Saluran dan kabel diberi dalam Ω (atau Ω/km × km): bagi dengan Z_base tingkatnya; reaktor pembatas arus juga demikian.", None),
        ("🔁", "Trafo Tiga Kumparan", "Impedansi diberi antar-pasangan kumparan pada dasar berbeda; konversi semua ke S_base sistem dulu, baru hitung Z₁, Z₂, Z₃ model bintang.", None),
        ("⚙️", "Tap Trafo", "Tap bukan nominal (mis. 150 ± 10 %) mengubah rasio sehingga V_base yang dirambatkan berbeda dari pengenal; diperlakukan sebagai trafo ideal sisa 1:t.", None),
        ("📋", "Tabel Konversi", "Buat tabel: peralatan, pengenal, X lama, dasar lama, faktor S, faktor V², X baru; ini langkah yang diperiksa penguji dan auditor.", None),
    ])
    isi += tabel(["Peralatan", "X (dasar sendiri)", "S pengenal (MVA)", "V pengenal / V_base (kV)", "Faktor S × faktor V²", "X pada 100 MVA"],
                 [[nama, x, s, v, f, ind(hasil, 4)] for nama, x, s, v, f, hasil in
                  [("Generator G", "0,18", "60", "13,8 / 13,8", "1,667 × 1", XG), ("Transformator T1", "0,09", "75", "13,8 / 13,8", "1,333 × 1", XT), ("Saluran 150 kV", "45 Ω", "—", "150", f"÷ {ind(ZB_HV, 0)} Ω", XL), ("Transformator T2", "0,08", "30", "150 / 150", "3,333 × 1", 0.08 * S_B / 30), ("Motor M", "0,20", "4", "6,3 / 6,6", f"25 × {ind((VM / VBM) ** 2, 4)}", XM)]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> motor kecil (4 MVA) mempunyai X terbesar pada dasar 100 MVA (4,56 pu) walau X pengenalnya biasa: dasar besar membuat peralatan kecil tampak 'berimpedansi tinggi', yang benar karena sumbangan arus gangguannya memang kecil. Soal C3, C4, C11, dan C13 memakai Persamaan (3).")
    m += bagian(3, "m-konversi", "Konversi Dasar:<br>dari Pengenal ke Dasar Sistem",
                "Setiap peralatan lahir dengan dasarnya sendiri, dan angka-angka itu tidak dapat dijumlahkan sebelum diseragamkan. Persamaan (3) mengonversi impedansi per unit dari dasar pengenal ke dasar sistem, dengan faktor daya linear dan faktor tegangan kuadrat, dan mengubah ohm saluran ke per unit. Tabel di bagian ini mengerjakan seluruh peralatan sistem contoh.",
                isi, "KONVERSI DASAR")

    # 04 — diagram reaktansi
    isi = figure(3, "Diagram reaktansi sistem contoh setelah konversi ke dasar bersama", f"Setelah semua reaktansi berada pada dasar 100 MVA, sistem multi-tegangan menjadi satu rangkaian seri: E — jX_g {ind(XG, 2)} — jX_t1 {ind(XT, 2)} — jX_L {ind(XL, 2)} — jX_t2 {ind(0.08 * S_B / 30, 3)} — jX_m {ind(XM, 2)} — E_motor; trafo ideal tidak muncul, resistansi dan beban dihilangkan.", gambar3())
    isi += formula(4, "Dari Diagram Impedansi ke Diagram Reaktansi", r"Z = R + jX \xrightarrow{R \ll X}\ jX, \qquad \text{generator/motor: } E'' \text{ seri } jX'', \qquad \text{beban statis, kapasitansi saluran: diabaikan (studi hubung singkat)}",
                   rf"Saluran 150 kV contoh: R ≈ 0,1 Ω/km × 80 km = 8 Ω = {ind(8 / ZB_HV, 3)} pu terhadap X {ind(XL, 2)} pu (rasio X/R ≈ 5,6): mengabaikan R menaikkan I_sc hanya ≈ {ind((math.hypot(8 / ZB_HV, XL) / XL - 1) * 100, 1)} % untuk ruas itu, dan lebih kecil lagi setelah dijumlahkan dengan reaktansi mesin dan trafo. Beban 20 MW di rel 3 menarik {ind(20 / 0.9 / S_B, 3)} pu, jauh di bawah arus gangguan {ind(I_SC_PU, 2)} pu.",
                   "Diagram impedansi memuat semua parameter model (R, X, B, beban); diagram reaktansi adalah penyederhanaannya untuk studi hubung singkat: resistansi dibuang karena X/R sistem transmisi 5–20 (kesalahan < 2 %) dan hasilnya konservatif; kapasitansi saluran dan beban statis dibuang karena arusnya kecil dibanding arus gangguan; mesin berputar diwakili tegangan internal 1 pu seri reaktansi subtransien X''. Untuk aliran daya (Modul 14) R dan beban harus dikembalikan.",
                   [("X''", "Reaktansi subtransien mesin (beberapa siklus pertama)"), ("E''", "Tegangan internal pragangguan, diambil 1∠0 pu"), ("R", "Resistansi, dipertahankan bila X/R < 3 (kabel TR, pabrik)")])
    isi += cards([
        ("🧭", "Langkah Baku", "SLD → pilih S_base, V_base per tingkat → konversi tiap Z → gambar diagram impedansi → sederhanakan ke diagram reaktansi → reduksi Thevenin ke titik gangguan.", None),
        ("⏱️", "X'', X', X_d", "Subtransien (0–3 siklus) untuk kapasitas PMT dan setelan instan; transien (3–30 siklus) untuk relai berwaktu; sinkron untuk keadaan tunak.", None),
        ("🔌", "Motor Ikut Menyumbang", "Motor induksi/sinkron memberi arus gangguan beberapa siklus (X'' 0,15–0,25); di pabrik dengan banyak motor sumbangannya bisa 20–40 % dari arus total.", None),
        ("📉", "Kapan R Penting", "Kabel tegangan rendah dan pabrik (X/R 1–3): abaikan R menyebabkan I_sc terlalu besar 10–30 %; pakai diagram impedansi lengkap atau metode IEC 60909.", None),
        ("🌐", "Jaringan Urutan", "Diagram reaktansi ini adalah jaringan urutan positif; gangguan tak simetris memerlukan jaringan urutan negatif dan nol yang disusun dengan cara sama (Modul 12).", None),
        ("💻", "Perangkat Lunak", "ETAP, DIgSILENT, PSS/E membangun diagram impedansi otomatis dari SLD berpengenal; kesalahan masukan pengenal (MVA, kV, X %) adalah sumber kesalahan utama.", None),
    ])
    isi += tabel(["Elemen", "Diagram impedansi (aliran daya)", "Diagram reaktansi (hubung singkat)", "Alasan penyederhanaan"], [
        ["Generator / motor", "E seri R_a + jX_d, kurva kapabilitas", "E'' = 1∠0 seri jX''", "R_a ≪ X''; beberapa siklus pertama"],
        ["Transformator", "R + jX seri, rasio tap, Y_m shunt", "jX", "R ≪ X; arus magnetisasi ≪ I_sc"],
        ["Saluran", "R + jX seri, jB/2 shunt di kedua ujung", "jX", "X/R 5–20; arus pengisian ≪ I_sc"],
        ["Beban statis", "P + jQ atau Z tetap", "dihilangkan", "arus beban ≪ arus gangguan"],
        ["Kapasitor shunt", "−jX_C", "dihilangkan", "arus kapasitif kecil, mendahului"],
        ["Kabel TR pabrik", "R + jX", "R + jX (dipertahankan)", "X/R ≈ 1–3, R menentukan"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> kolom kanan adalah 'izin menyederhanakan' beserta syaratnya; pelanggarannya (mengabaikan R di panel TR pabrik) memberi arus gangguan yang terlalu besar, PMT yang terlalu mahal, dan fuse yang salah kurva. Soal C11 dan C12 menyusun diagram reaktansi seperti Gambar 3.")
    m += bagian(4, "m-reaktansi", "Diagram Impedansi<br>dan Diagram Reaktansi",
                "Setelah semua impedansi berada pada dasar bersama, SLD berubah menjadi rangkaian listrik biasa yang dapat dihitung dengan hukum Kirchhoff: diagram impedansi. Untuk studi hubung singkat, rangkaian itu disederhanakan lagi menjadi diagram reaktansi dengan aturan Persamaan (4), seperti pada Gambar 3 untuk sistem contoh.",
                isi, "DIAGRAM REAKTANSI")

    # 05 — thevenin & hubung singkat
    isi = figure(4, "Tiga langkah studi hubung singkat: reduksi seri, arus per unit, konversi ke ampere dan MVA", f"Untuk gangguan di rel 3, reaktansi dari generator dijumlahkan seri menjadi X_th {ind(XTH, 2)} pu, arus gangguan 1/X_th = {ind(I_SC_PU, 3)} pu, lalu dikalikan I_base 150 kV menjadi {ind(I_SC_A, 0)} A; daya hubung singkat 100/X_th = {ind(S_SC, 1)} MVA.", gambar4())
    isi += formula(5, "Impedansi Thevenin, Arus dan Daya Hubung Singkat", r"X_{th} = \sum X_{seri}, \qquad X_A \parallel X_B = \dfrac{X_A X_B}{X_A + X_B}, \qquad I_{sc,pu} = \dfrac{V_{pra}}{X_{th}} = \dfrac{1}{X_{th}}, \qquad I_{sc} = I_{sc,pu}\,I_{base}, \qquad S_{sc} = \dfrac{S_{base}}{X_{th}}",
                   rf"Rel 3: \(X_{{th}} = {ind(XG, 2)} + {ind(XT, 2)} + {ind(XL, 2)} = {ind(XTH, 2)}\) pu → \(I_{{sc}} = 1/{ind(XTH, 2)} = {ind(I_SC_PU, 3)}\) pu \(= {ind(I_SC_PU, 3)}\times{ind(IB_HV, 1)} = {ind(I_SC_A, 0)}\) A, \(S_{{sc}} = 100/{ind(XTH, 2)} = {ind(S_SC, 1)}\) MVA. Rel 2: \(X_{{th}} = {ind(XTH2, 2)}\) → {ind(I_SC2_PU, 3)} pu = {ind(I_SC2_PU * IB_HV, 0)} A, {ind(S_SC2, 1)} MVA. Dua jalur paralel {ind(XA, 1)} dan {ind(XB, 1)} pu (Gambar 5): \(X_{{th}} = {ind(XA, 1)}\times{ind(XB, 1)}/({ind(XA, 1)} + {ind(XB, 1)}) = {ind(XTH_P, 2)}\) → \(I_{{sc}} = {ind(I_SC_P, 3)}\) pu, dengan sumbangan A {ind(1 / XA, 2)} dan B {ind(1 / XB, 3)} pu.",
                   "Dilihat dari titik gangguan, seluruh jaringan adalah satu sumber 1 pu seri satu reaktansi Thevenin; arus gangguan adalah kebalikannya. Reduksi seri untuk jalur tunggal, paralel untuk beberapa sumber/jalur, dan transformasi Δ–Y untuk jaringan bertautan. Daya hubung singkat S_sc adalah bahasa utilitas untuk 'kekuatan' rel: dari S_sc pelanggan dapat menghitung Z_s = V²/S_sc (Modul 12) tanpa mengetahui jaringan di hulunya. Kapasitas pemutus PMT dipilih ≥ arus gangguan subtransien maksimum × faktor asimetri.",
                   [("V_{pra}", "Tegangan pragangguan (1,0 pu pada studi baku)"), ("I_{base}", "Arus dasar pada tingkat tegangan titik gangguan"), ("S_{sc}", "Daya hubung singkat tiga fasa (MVA)")])
    isi += figure(5, "Reduksi paralel: arus gangguan total dan sumbangan tiap jalur", f"Dua sumber yang memasok rel yang sama lewat jalur {ind(XA, 1)} dan {ind(XB, 1)} pu bergabung menjadi X_th {ind(XTH_P, 2)} pu; arus gangguan {ind(I_SC_P, 3)} pu adalah jumlah sumbangan tiap jalur (1/X masing-masing), sehingga menutup loop menaikkan arus gangguan.", gambar5())
    isi += cards([
        ("🔢", "Reduksi Seri–Paralel", "Radial: jumlahkan seri; beberapa sumber: paralel; jaringan mesh: Δ–Y atau matriks Z_bus (Z_ii adalah X_th rel i).", None),
        ("⚡", "Kapasitas PMT", "PMT 20 kV 12,5/16/25 kA; 150 kV 31,5/40 kA; pilih ≥ I_sc'' × (1,0–1,6 untuk asimetri DC) dengan cadangan pertumbuhan sistem.", None),
        ("🔥", "I²t Peralatan", "Kabel, CT, dan rel harus menahan I_sc² × t_pemutusan; kabel XLPE Al 240 mm²: ± 22 kA selama 1 s.", None),
        ("📡", "Dari S_sc Utilitas", "PLN memberi S_sc rel 20 kV (mis. 250–500 MVA); pabrik memakainya sebagai X_s = S_base/S_sc pu di ujung diagram reaktansinya sendiri.", None),
        ("🏭", "Studi Pabrik", "Trafo 2 MVA 20/0,4 kV Z 6 %: X_th sisi TR ≈ 0,06 × (S_base/2) + X_s; I_sc panel utama ≈ 40–50 kA: MCCB harus ≥ itu.", None),
        ("🔁", "Perubahan Topologi", "Menambah generator, menutup loop, atau mengganti trafo yang lebih besar (Z % sama, S lebih besar → X_pu lebih kecil) selalu menaikkan I_sc: hitung ulang.", None),
    ])
    isi += tabel(["Titik gangguan (sistem contoh, tanpa motor)", "X_th (pu)", "I_sc (pu)", "I_base (A)", "I_sc (kA)", "S_sc (MVA)"],
                 [[nama, ind(x, 3), ind(1 / x, 3), ind(ib, 1), ind(ib / x / 1000, 2), ind(S_B / x, 1)] for nama, x, ib in
                  [("Rel 1 (13,8 kV)", XG, IB_LV), ("Rel 2 (150 kV)", XTH2, IB_HV), ("Rel 3 (150 kV)", XTH, IB_HV), ("Rel 4 (6,6 kV)", XTH + 0.08 * S_B / 30, S_B * 1e6 / (SQ3 * 6600)), ("Rel 4 + sumbangan motor", (XTH + 0.08 * S_B / 30) * XM / (XTH + 0.08 * S_B / 30 + XM), S_B * 1e6 / (SQ3 * 6600))]])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> dalam pu arus gangguan turun dari rel 1 ke rel 4 (X_th bertambah), tetapi dalam kA rel 1 (13,8 kV) dan rel 4 (6,6 kV) tetap besar karena I_base tegangan rendah besar. Sumbangan motor menaikkan I_sc rel 4 sekitar 20 %: PMT rel motor harus memperhitungkannya. Soal C6–C8, C12, dan C14 memakai Persamaan (5).")
    m += bagian(5, "m-thevenin", "Reduksi Thevenin:<br>Arus dan Daya Hubung Singkat",
                "Diagram reaktansi dibuat untuk satu tujuan: mengetahui berapa arus yang mengalir bila suatu rel terhubung singkat. Persamaan (5) mereduksi seluruh jaringan menjadi satu reaktansi Thevenin dilihat dari titik gangguan, lalu mengubah kebalikannya menjadi ampere dan MVA; Gambar 4 dan 5 mengerjakannya untuk jalur seri dan dua jalur paralel.",
                isi, "HUBUNG SINGKAT")

    # 06 — fasor pu
    isi = figure(6, "Fasor tegangan dan arus dalam per unit: V_s = V_r + I·Z", f"Dengan V_r = 1∠0 sebagai acuan, beban 0,8 pu pf 0,9 tertinggal lewat saluran 0,04 + j0,16 pu memerlukan V_s = {ind(math.hypot(1 + 0.8 * 0.9 * 0.04 + 0.8 * math.sin(math.acos(0.9)) * 0.16, 0.8 * 0.9 * 0.16 - 0.8 * math.sin(math.acos(0.9)) * 0.04), 4)} pu; hukum yang sama dengan Modul 6 dan 10, kini tanpa √3 dan tanpa rasio trafo.", gambar6())
    isi += formula(6, "Tegangan, Arus, dan Daya dalam Per Unit", r"\bar V_s = \bar V_r + \bar I(R + jX), \qquad |\bar I| = \dfrac{S_{pu}}{|V_{pu}|}, \qquad \bar S = \bar V\,\bar I^{*}, \qquad \Delta V \approx I(R\cos\varphi + X\sin\varphi)\ \text{(pu)}",
                   rf"Beban resistif {ind(I_PU, 1)} pu pada V_r = 1∠0 lewat {ind(R_PU, 2)} + j{ind(X_PU, 2)} pu: \(|V_s| = \sqrt{{(1 + {ind(I_PU * R_PU, 3)})^2 + ({ind(I_PU * X_PU, 3)})^2}} = {ind(VS_PU, 4)}\) pu → regulasi {ind(REG_PU, 2)} %. Beban {ind(S_LOAD, 0)} MVA pf {ind(PF_LOAD, 1)} pada rel {ind(V_LOAD, 2)} pu (dasar 100 MVA): \(S_{{pu}} = {ind(S_LOAD / S_B, 2)}\), \(|I| = {ind(S_LOAD / S_B, 2)}/{ind(V_LOAD, 2)} = {ind(I_LOAD, 4)}\) pu \(= {ind(I_LOAD * IB_HV, 1)}\) A pada 150 kV. Tegangan rel 0,97 pu pada tingkat 150 kV = {ind(0.97 * 150, 1)} kV; pada tingkat 20 kV = 19,4 kV.",
                   "Dalam per unit, hubungan tegangan–arus–daya per fasa berlaku langsung untuk sistem tiga fasa: S_pu = V_pu·I_pu* tanpa faktor 3 atau √3, dan V_s = V_r + I·Z melewati trafo tanpa mengalikan rasio. Hasil aliran daya (Modul 14) dilaporkan dalam pu: tegangan rel 0,95–1,05, aliran cabang dalam pu MVA; untuk pelaporan ke lapangan dikalikan kembali dengan dasar tingkatnya.",
                   [("\\bar I^{*}", "Konjugat fasor arus"), ("S_{pu}", "Daya semu beban dibagi S_base"), ("\\varphi", "Sudut faktor daya beban (tertinggal positif)")])
    isi += cards([
        ("📐", "Fasor pu", "Sudut tetap dalam derajat; hanya besar yang diskalakan. V_r sebagai acuan 1∠0 memudahkan: I = I∠−φ, V_s = 1 + I·Z.", None),
        ("🔁", "Regulasi", "(|V_s| − |V_r|)/|V_r| × 100 % pada beban penuh; dalam pu langsung terbaca dari |V_s| − 1.", None),
        ("⚙️", "Daya pu", "P_pu = V I cos φ, Q_pu = V I sin φ; rugi ruas I²R pu × S_base = MW; 0,01 pu pada 100 MVA = 1 MW.", None),
        ("📊", "Hasil Aliran Daya", "Rel 0,96 pu di 150 kV = 144 kV; 0,96 pu di 20 kV = 19,2 kV: batas ±5 % berlaku sama di semua tingkat, itulah kemudahan pu.", None),
        ("🏭", "Pabrik", "Trafo 2 MVA Z 6 %: pada beban penuh pf 0,85 jatuh tegangan ≈ I(R cos φ + X sin φ) ≈ 1 × (0,01 × 0,85 + 0,059 × 0,53) ≈ 4 %: 400 V menjadi 384 V.", None),
        ("🔗", "Ke Modul 14", "Persamaan aliran daya ditulis seluruhnya dalam pu: Y_bus dari 1/Z_pu, P dan Q dalam pu, tegangan rel dalam pu; modul ini menyiapkan semua masukannya.", None),
    ])
    isi += tabel(["Kasus (V_r = 1∠0, saluran 0,04 + j0,16 pu)", "I (pu)", "pf", "I·Z (pu)", "|V_s| (pu)", "Regulasi (%)"],
                 [[nama, ind(i_, 1), pfk, ind(math.hypot(i_ * math.cos(ph) * R_PU - i_ * math.sin(ph) * X_PU, i_ * math.cos(ph) * X_PU + i_ * math.sin(ph) * R_PU), 4), ind(math.hypot(1 + i_ * math.cos(ph) * R_PU - i_ * math.sin(ph) * X_PU, i_ * math.cos(ph) * X_PU + i_ * math.sin(ph) * R_PU), 4), ind((math.hypot(1 + i_ * math.cos(ph) * R_PU - i_ * math.sin(ph) * X_PU, i_ * math.cos(ph) * X_PU + i_ * math.sin(ph) * R_PU) - 1) * 100, 2)] for nama, i_, pfk, ph in
                  [("Resistif", 0.8, "1,0", 0.0), ("Induktif", 0.8, "0,9 tertinggal", -math.acos(0.9)), ("Induktif berat", 0.8, "0,7 tertinggal", -math.acos(0.7)), ("Kapasitif", 0.8, "0,9 mendahului", math.acos(0.9)), ("Beban ringan", 0.3, "0,9 tertinggal", -math.acos(0.9))]])
    isi += kotak("tip-box", "💡 <strong>Membaca Tabel di Atas:</strong> beban induktif menaikkan V_s yang diperlukan (jatuh tegangan besar), beban kapasitif menurunkannya sampai di bawah 1 (tegangan terima lebih tinggi daripada kirim): inilah efek kompensasi Modul 10 dalam bahasa pu. Soal C9, C10, dan C15 memakai Persamaan (6).")
    m += bagian(6, "m-fasor", "Tegangan, Arus, dan Daya<br>dalam Per Unit",
                "Per unit bukan hanya untuk hubung singkat: tegangan rel, arus beban, aliran daya, dan rugi juga dinyatakan dalam pu, dan semua rumus rangkaian per fasa berlaku tanpa √3. Persamaan (6) mengulang hubungan V_s = V_r + I·Z dan S = V·I* dalam pu, dan Gambar 6 menggambar fasornya untuk beban contoh.",
                isi, "TEGANGAN DAN ARUS PU")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Dari Single Line Diagram ke Diagram Reaktansi dan Arus Gangguan Tiap Rel", "cvSLD",
                     [("sl_sd_xg", "v_sd_xg", "Generator X'' (pu, dasar sendiri)", 0.1, 0.3, 0.01, 0.18, "0.18"), ("sl_sd_sg", "v_sd_sg", "Generator S (MVA)", 20, 150, 5, 60, "60"), ("sl_sd_xt", "v_sd_xt", "Trafo X (pu, dasar sendiri)", 0.05, 0.15, 0.01, 0.09, "0.09"), ("sl_sd_st", "v_sd_st", "Trafo S (MVA)", 20, 150, 5, 75, "75"), ("sl_sd_xl", "v_sd_xl", "Saluran X (Ω)", 5, 120, 5, 45, "45"), ("sl_sd_bus", "v_sd_bus", "Rel gangguan", 1, 3, 1, 3, "ujung saluran (150 kV)")],
                     "btnSLD", "toggleSLD", "sldInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Baris atas SLD dengan pengenal, baris bawah diagram reaktansi pada dasar 100 MVA; rel yang dipilih berkedip merah dengan X_th, I_sc (pu dan kA), dan S_sc di bawahnya.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Pindahkan gangguan dari rel 3 ke rel 1</strong>: X_th mengecil, I_sc pu naik, dan kA melonjak karena I_base 13,8 kV besar. (2) Perbesar S generator dengan X'' tetap: X_g pu turun, arus gangguan naik. (3) Perpanjang saluran: hanya rel 3 yang berubah. Soal C1–C4, C6–C8, C11, dan C12.")
    isi += anim_panel(2, "amber", r"Sistem Per Unit: Pemilihan Dasar, Besaran Turunan, dan Konversi", "cvPerUnit",
                      [("sl_pu_sb", "v_pu_sb", "S_base (MVA)", 10, 500, 10, 100, "100"), ("sl_pu_vb", "v_pu_vb", "V_base (kV)", 6.6, 500, 0.1, 150, "150"), ("sl_pu_z", "v_pu_z", "Reaktansi saluran (Ω)", 5, 200, 5, 45, "45"), ("sl_pu_sown", "v_pu_sown", "S pengenal generator (MVA)", 10, 200, 5, 60, "60"), ("sl_pu_xown", "v_pu_xown", "X'' generator (pu dasar sendiri)", 0.1, 0.3, 0.01, 0.18, "0.18")],
                      "btnPerUnit", "togglePerUnit", "perUnitInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Kiri: empat besaran dasar (dua dipilih, dua turunan) dan konversi saluran (Ω → pu) serta generator (pu → pu). Kanan: Z_pu saluran terhadap S_base pada V_base yang dipilih; titik kuning pilihan Anda.<br>Amati: (1) <strong style=\"color:var(--amber)\">Gandakan S_base</strong>: semua Z_pu berlipat dua, I_base juga, hasil ampere tetap. (2) Turunkan V_base ke 20 kV dengan Ω tetap: Z_pu melonjak kuadratis (Z_base kecil). (3) Generator besar dengan X'' sama: X pada dasar sistem mengecil. Soal C1–C5.")
    isi += anim_panel(3, "green", r"Reduksi Thevenin: Jalur Paralel, Sumbangan Motor, dan Kapasitas PMT", "cvThevenin",
                      [("sl_th_xa", "v_th_xa", "Jalur A: X (pu)", 0.1, 2.0, 0.05, 0.4, "0.40"), ("sl_th_xb", "v_th_xb", "Jalur B: X (pu)", 0.1, 2.0, 0.05, 0.6, "0.60"), ("sl_th_xm", "v_th_xm", "Motor: X'' (pu, dasar sistem)", 0.5, 10, 0.5, 2.0, "2.0"), ("sl_th_motor", "v_th_motor", "Sertakan sumbangan motor (0/1)", 0, 1, 1, 1, "ya"), ("sl_th_vb", "v_th_vb", "Tegangan rel (kV)", 6.6, 150, 0.1, 20, "20.0")],
                      "btnThevenin", "toggleThevenin", "theveninInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Tiga cabang paralel menuju rel gangguan dengan panah arus berjalan; batang kanan sumbangan tiap cabang dan totalnya dalam pu dan kA (dasar 100 MVA, I_base dari tegangan rel).<br>Amati: (1) <strong style=\"color:var(--green)\">Perkecil X jalur B</strong> (jalur baru/loop): total arus naik, sumbangan bergeser. (2) Matikan motor: I_sc turun 10–30 %. (3) Ubah tegangan rel ke 6,6 kV: pu sama, kA berlipat. Soal C6–C8 dan C14.")
    isi += anim_panel(4, "pink", r"Fasor Tegangan dan Arus dalam Per Unit: V_s = V_r + I·Z", "cvJatuhPU",
                      [("sl_jp_i", "v_jp_i", "Arus beban (pu)", 0.1, 1.5, 0.05, 0.8, "0.80"), ("sl_jp_pf", "v_jp_pf", "Faktor daya", 0.5, 1.0, 0.01, 0.85, "0.85"), ("sl_jp_r", "v_jp_r", "R saluran (pu)", 0.0, 0.2, 0.005, 0.05, "0.050"), ("sl_jp_x", "v_jp_x", "X saluran (pu)", 0.02, 0.6, 0.02, 0.2, "0.20"), ("sl_jp_lead", "v_jp_lead", "Arus mendahului (0 tertinggal, 1 mendahului)", 0, 1, 1, 0, "tertinggal")],
                      "btnJatuhPU", "toggleJatuhPU", "jatuhPUInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Kiri: fasor V_r (hijau, acuan), I (kuning), I·Z (merah), dan V_s (cyan) dalam pu; kanan: |V_s| yang diperlukan agar V_r = 1 pu untuk seluruh rentang pf tertinggal–mendahului, titik kuning kasus Anda.<br>Amati: (1) <strong style=\"color:var(--pink)\">Turunkan pf tertinggal</strong>: V_s naik (jatuh tegangan besar). (2) Ubah ke mendahului: V_s bisa di bawah 1 (kompensasi). (3) Naikkan R dengan X tetap: kasus kabel TR pabrik, sudut V_s mengecil tetapi besarnya tetap naik. Soal C9, C10, dan C15.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 pasang X'' 0,18 / 60 MVA, X 0,09 / 75 MVA, saluran 45 Ω dan cocokkan X_th rel 3 = {ind(XTH, 2)} pu dan {ind(I_SC_A, 0)} A dengan Bagian 05; lalu cari panjang saluran yang membuat S_sc rel 3 tepat 100 MVA. Pada Animasi 3 atur A 0,4, B 0,6 tanpa motor dan cocokkan {ind(I_SC_P, 3)} pu dengan Gambar 5.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>SLD dan Per Unit",
                "Ubah pengenal peralatan dan pindahkan titik gangguan, mainkan pemilihan dasar, gabungkan jalur paralel dan sumbangan motor, lalu putar fasor beban dalam pu. Empat animasi ini memvisualkan Persamaan (2)–(6) pada sistem contoh.",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; perhatikan satuan (Ω, A, kV, MVA, pu) dan jumlah desimal yang diminta (banyak soal pu meminta 5 desimal).")
    isi += kode("Cell 1 — Besaran Dasar dan Konversi Impedansi ke Dasar Sistem", f'''import numpy as np

S_base = 100.0                                            # MVA, satu untuk seluruh sistem
def dasar(V_kV, S_MVA=S_base):
    Zb = V_kV**2/S_MVA; Ib = S_MVA*1e6/(np.sqrt(3)*V_kV*1e3)
    return Zb, Ib
for V in [500, 150, 20, 13.8, 6.6, 0.4]:
    Zb, Ib = dasar(V); print(f"V_base {{V:6.1f}} kV: Z_base = {{Zb:10.4f}} ohm, I_base = {{Ib:10.1f}} A")

def konversi(X_lama, S_lama, S_baru, V_lama=1.0, V_baru=1.0):
    """Persamaan 3: X_baru = X_lama (S_baru/S_lama) (V_lama/V_baru)^2"""
    return X_lama*(S_baru/S_lama)*(V_lama/V_baru)**2
Xg = konversi({ind(XG_OWN, 2).replace(",", ".")}, {ind(SG, 0)}, S_base); Xt1 = konversi({ind(XT_OWN, 2).replace(",", ".")}, {ind(ST, 0)}, S_base)
XL = {ind(XL_OHM, 0)}/dasar(150)[0]; Xt2 = konversi(0.08, 30, S_base); Xm = konversi(0.2, 4, S_base, 6.3, 6.6)
print(f"X_g = {{Xg:.5f}}, X_t1 = {{Xt1:.5f}}, X_L = {{XL:.5f}}, X_t2 = {{Xt2:.5f}}, X_m = {{Xm:.5f}} pu (dasar 100 MVA)")
print(f"contoh soal: 0,12 pu @ 50 MVA -> {{konversi(0.12, 50, 100):.5f}} pu @ 100 MVA; 45 ohm @ 150 kV -> {{45/225:.5f}} pu")''')
    isi += kode("Cell 2 — Diagram Reaktansi dan Arus Hubung Singkat Tiap Rel", f'''import numpy as np

S_base = 100.0
Xg, Xt1, XL, Xt2, Xm = {ind(XG, 2).replace(",", ".")}, {ind(XT, 2).replace(",", ".")}, {ind(XL, 2).replace(",", ".")}, {ind(0.08 * S_B / 30, 5).replace(",", ".")}, {ind(XM, 5).replace(",", ".")}
rel = {{"rel 1 (13,8 kV)": (Xg, 13.8), "rel 2 (150 kV)": (Xg + Xt1, 150), "rel 3 (150 kV)": (Xg + Xt1 + XL, 150), "rel 4 (6,6 kV)": (Xg + Xt1 + XL + Xt2, 6.6)}}
for nama, (Xth, V) in rel.items():                                    # Persamaan 5
    Ib = S_base*1e6/(np.sqrt(3)*V*1e3); Isc = 1/Xth
    print(f"{{nama:16s}}: X_th = {{Xth:.5f}} pu, I_sc = {{Isc:.4f}} pu = {{Isc*Ib/1e3:.3f}} kA, S_sc = {{S_base/Xth:.2f}} MVA")
# sumbangan motor di rel 4 (paralel)
Xkiri = Xg + Xt1 + XL + Xt2; Xth4 = Xkiri*Xm/(Xkiri + Xm)
print(f"rel 4 + motor: X_th = {{Xth4:.5f}} pu, I_sc = {{1/Xth4:.4f}} pu (sistem {{1/Xkiri:.4f}} + motor {{1/Xm:.4f}})")
# dua jalur paralel (Persamaan 5)
XA, XB = {ind(XA, 1).replace(",", ".")}, {ind(XB, 1).replace(",", ".")}
Xp = XA*XB/(XA + XB); print(f"paralel: X_th = {{Xp:.5f}}, I_sc = {{1/Xp:.4f}} pu = I_A {{1/XA:.4f}} + I_B {{1/XB:.4f}}; S_sc = {{S_base/Xp:.2f}} MVA")''')
    isi += kode("Cell 3 — Fasor dalam Per Unit: V_s = V_r + I·Z dan Arus Beban", f'''import numpy as np
import matplotlib.pyplot as plt

Vr = 1.0 + 0j
def Vs_dari(I_pu, pf, R, X, lead=False):
    phi = np.arccos(pf)*(1 if lead else -1)
    I = I_pu*np.exp(1j*phi); Vs = Vr + I*(R + 1j*X)
    return Vs, I
for pf, lead in [(1.0, False), (0.9, False), (0.7, False), (0.9, True)]:
    Vs, I = Vs_dari({ind(I_PU, 1).replace(",", ".")}, pf, {ind(R_PU, 2).replace(",", ".")}, {ind(X_PU, 2).replace(",", ".")}, lead)
    print(f"pf {{pf}} {{'mendahului' if lead else 'tertinggal'}}: V_s = {{abs(Vs):.5f}} < {{np.degrees(np.angle(Vs)):.2f}} deg, regulasi {{(abs(Vs)-1)*100:.2f}} %")
# Persamaan 6: arus beban pu
S, pf, V = {ind(S_LOAD, 0)}, {ind(PF_LOAD, 1).replace(",", ".")}, {ind(V_LOAD, 2).replace(",", ".")}
I = S/100/V; print(f"beban {{S}} MVA pf {{pf}} pada {{V}} pu: |I| = {{I:.5f}} pu = {{I*100e6/(np.sqrt(3)*150e3):.1f}} A (150 kV)")
# soal: beban resistif I pu, |V_s| = sqrt((1+IR)^2 + (IX)^2)
I0, R, X = {ind(I_PU, 1).replace(",", ".")}, {ind(R_PU, 2).replace(",", ".")}, {ind(X_PU, 2).replace(",", ".")}
print(f"|V_s| resistif = {{np.hypot(1 + I0*R, I0*X):.5f}} pu")
Vs, I = Vs_dari(0.8, 0.9, 0.04, 0.16)
plt.figure(figsize=(6, 4)); plt.quiver([0, 0, 1], [0, 0, 0], [Vr.real, I.real, (Vs-Vr).real], [Vr.imag, I.imag, (Vs-Vr).imag], color=['g', 'orange', 'r'], angles='xy', scale_units='xy', scale=1)
plt.quiver(0, 0, Vs.real, Vs.imag, color='c', angles='xy', scale_units='xy', scale=1); plt.xlim(-0.2, 1.3); plt.ylim(-0.6, 0.4); plt.grid(True); plt.gca().set_aspect('equal'); plt.title('Fasor pu: V_r, I, I·Z, V_s'); plt.show()''')
    isi += kode("Cell 4 — Studi Hubung Singkat Pabrik dari S_sc Utilitas (Latihan Terapan)", f'''import numpy as np

# gardu pelanggan: PLN 20 kV S_sc 250 MVA; trafo 2 MVA 20/0,4 kV Z 6 % (X/R 5); kabel TR 30 m 2x(3x240) mm2; motor 400 kW 400 V X'' 0,17 (5 MVA total motor ekuivalen? pakai 0,5 MVA)
S_base, V_TM, V_TR = 1.0, 20.0, 0.4                        # dasar 1 MVA untuk pabrik
Xs = S_base/250                                            # Persamaan 2/5: X_s = S_base/S_sc
Zt = 0.06*S_base/2; Xt = Zt*5/np.sqrt(26); Rt = Zt/np.sqrt(26)
Zb_TR = V_TR**2/S_base; R_kabel = 0.0375*0.03/2/Zb_TR; X_kabel = 0.08*0.03/2/Zb_TR   # 240 mm2 Cu: 0,0375 + j0,08 ohm/km per kabel, 2 paralel
Z_th = complex(Rt + R_kabel, Xs + Xt + X_kabel)
Ib_TR = S_base*1e6/(np.sqrt(3)*V_TR*1e3)
Isc = 1/abs(Z_th)
print(f"X_s = {{Xs:.5f}}, Z_trafo = {{Rt:.5f}} + j{{Xt:.5f}}, Z_kabel = {{R_kabel:.5f}} + j{{X_kabel:.5f}} pu (dasar 1 MVA, 0,4 kV)")
print(f"Z_th panel utama = {{abs(Z_th):.5f}} pu (X/R = {{Z_th.imag/Z_th.real:.2f}}) -> I_sc = {{Isc:.3f}} pu x {{Ib_TR:.0f}} A = {{Isc*Ib_TR/1e3:.2f}} kA")
Xm = 0.17*S_base/0.5; Isc_m = 1/Xm
print(f"sumbangan motor 0,5 MVA X'' 0,17: {{Isc_m:.3f}} pu = {{Isc_m*Ib_TR/1e3:.2f}} kA -> total ~ {{(Isc + Isc_m)*Ib_TR/1e3:.2f}} kA; MCCB utama harus >= {{np.ceil((Isc + Isc_m)*Ib_TR/1e3*1.1)}} kA")
print(f"tanpa R (diagram reaktansi murni): I_sc = {{1/Z_th.imag*Ib_TR/1e3:.2f}} kA -> terlalu besar {{(1/Z_th.imag/Isc - 1)*100:.1f}} %: di TR pabrik R harus dipertahankan")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan Bagian 02–06: Z_base 150 kV = {ind(ZB_HV, 0)} Ω, X_g {ind(XG, 2)}, X_t1 {ind(XT, 2)}, X_L {ind(XL, 2)}, X_m {ind(XM, 3)}, X_th rel 3 {ind(XTH, 2)} pu → {ind(I_SC_A, 0)} A dan {ind(S_SC, 1)} MVA, paralel {ind(I_SC_P, 3)} pu, |V_s| resistif {ind(VS_PU, 4)} pu. Cell 1–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut mengerjakan seluruh contoh modul ini: besaran dasar dan konversi impedansi, diagram reaktansi dan arus hubung singkat tiap rel, fasor dan arus beban dalam pu, serta studi hubung singkat panel pabrik dari S_sc utilitas. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "J. D. Glover, T. J. Overbye &amp; M. S. Sarma", "Power System Analysis and Design", ", Sixth Edition. Cengage Learning, 2017.", "Bab 3 (sistem per unit, single line diagram, diagram impedansi dan reaktansi) dan Bab 7 (hubung singkat simetris, Thevenin, S_sc): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "H. Saadat", "Power System Analysis", ", International Edition. McGraw-Hill, 1999.", "Bab 3 (model peralatan dan sistem per unit dengan banyak contoh konversi dasar) dan Bab 9 (analisis gangguan seimbang).")
    refs += pm_ref(3, "violet", "168,85,247", "J. J. Grainger &amp; W. D. Stevenson", "Power System Analysis", ". McGraw-Hill, 1994.", "Bab 1 (besaran per unit dan diagram) dan Bab 10 (gangguan tiga fasa simetris, Z_bus) sebagai pendalaman.")
    refs += pm_ref(4, "green", "0,224,158", "R. D. Shultz &amp; R. A. Smith", "Introduction to Electric Power Engineering", ". John Wiley &amp; Sons, 1988.", "Bab single line diagram dan per unit dalam bahasa pengantar; pustaka utama RPS.")
    refs += pm_ref(5, "pink", "236,72,153", "Zuhal", "Dasar Tenaga Listrik dan Elektronika Daya", ". Gramedia, Jakarta.", "Bab sistem per unit dan gangguan hubung singkat dalam bahasa mata kuliah ini.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk single line diagram, sistem per unit, konversi dasar, diagram reaktansi, dan reduksi Thevenin untuk hubung singkat. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> IEC 60617 dan ANSI/IEEE Y32.2 (simbol diagram listrik), IEC 60909 (perhitungan arus hubung singkat, termasuk faktor tegangan c dan sumbangan motor), dan IEEE Std 141 (Red Book: studi hubung singkat instalasi industri) memuat kaidah dan contoh yang dipakai dalam praktik; katalog trafo dan motor memberi Z % pada pengenalnya. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Z_base = V²/S</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">X_baru = X_lama·(S_b/S_l)·(V_l/V_b)²</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">I_sc = 1/X_th</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">S_sc = S_base/X_th</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">|V_s| = √((1+IR)² + (IX)²)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Single Line Diagram</em><br>dan Per Unit</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar besaran dasar, konversi impedansi ke dasar sistem, diagram reaktansi, reduksi Thevenin seri dan paralel, arus dan daya hubung singkat dalam pu, ampere, dan MVA, serta tegangan dan arus beban dalam per unit. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Tujuan <strong>single line diagram</strong> (SLD) adalah...",
     ["Menggambarkan sistem tiga fasa seimbang dengan satu garis per rangkaian dan simbol baku tiap peralatan, sehingga topologi, pengenal, dan alat proteksi terbaca sekilas", "Menggambar ketiga fasa dan netral secara lengkap untuk instalasi", "Menunjukkan tata letak fisik peralatan di gardu", "Menggantikan diagram impedansi dalam perhitungan"],
     "Tujuan SLD"),
    ("Pada SLD, sistem tiga fasa dapat digambar sebagai satu garis karena...",
     ["Tegangan tiga fasa selalu sama besar dan sefasa", "Netral selalu ditanahkan langsung", "Sistem dianggap seimbang sehingga satu fasa mewakili ketiganya; netral tidak digambar dan analisis dilakukan per fasa", "Peralatan tiga fasa hanya mempunyai satu terminal"],
     "Dasar satu garis"),
    ("Nilai <strong>per unit</strong> suatu besaran adalah...",
     ["Nilai sebenarnya dikalikan nilai dasar", "Nilai sebenarnya dibagi nilai dasar yang dipilih pada satuan yang sama; dua dasar dipilih bebas (S dan V), dua lainnya (I, Z) mengikuti", "Nilai sebenarnya dalam persen dari nilai maksimum", "Nilai sebenarnya dibagi √3"],
     "Definisi per unit"),
    ("Impedansi dasar dihitung dengan...",
     ["Z_base = S_base/V_base", "Z_base = √3·V_base/S_base", "Z_base = V_base/(√3·I_base) hanya untuk satu fasa", "Z_base = V_base²/S_base (kV², MVA → Ω), mis. 150²/100 = 225 Ω"],
     "Z_base"),
    ("Ketika melewati transformator, tegangan dasar...",
     ["Berubah mengikuti perbandingan lilitan trafo, sehingga impedansi pu trafo sama dari kedua sisi dan trafo ideal 'hilang' dari diagram", "Tetap sama di seluruh sistem", "Berubah mengikuti rasio daya trafo", "Menjadi nol di sisi sekunder"],
     "V_base melewati trafo"),
    ("Keunggulan sistem per unit antara lain...",
     ["Semua impedansi menjadi tepat 1 pu", "Resistansi dapat selalu diabaikan", "Impedansi peralatan sejenis berada dalam rentang sempit, √3 dan rasio trafo hilang dari perhitungan, dan sistem multi-tegangan menjadi satu rangkaian tanpa trafo ideal", "Perhitungan hanya perlu dilakukan pada satu tingkat tegangan"],
     "Keunggulan pu"),
    ("Konversi impedansi per unit ke dasar baru mengikuti...",
     ["Z_baru = Z_lama × (S_lama/S_baru) × (V_baru/V_lama)²", "Z_baru = Z_lama × (S_baru/S_lama) × (V_lama/V_baru)²", "Z_baru = Z_lama × (S_baru/S_lama) × (V_baru/V_lama)", "Z_baru = Z_lama × (V_lama/V_baru)"],
     "Konversi dasar"),
    ("<strong>Diagram reaktansi</strong> untuk studi hubung singkat mengabaikan...",
     ["Reaktansi transformator", "Reaktansi subtransien generator", "Tegangan internal generator", "Resistansi, kapasitansi saluran, dan beban statis, karena arusnya kecil dibanding arus gangguan dan X ≫ R"],
     "Diagram reaktansi"),
    ("Dengan tegangan pragangguan 1,0 pu, arus hubung singkat tiga fasa di suatu rel adalah...",
     ["I_sc = 1/X_th pu, X_th reaktansi Thevenin dilihat dari rel itu", "I_sc = X_th pu", "I_sc = √3/X_th pu", "I_sc = 1/(3X_th) pu"],
     "I_sc pu"),
    ("<strong>Daya hubung singkat</strong> S_sc suatu rel adalah...",
     ["S_sc = X_th × S_base", "S_sc = S_base²/X_th", "S_sc = S_base/X_th (MVA) = √3·V·I_sc; menyatakan 'kekuatan' rel dan menentukan kapasitas pemutus PMT", "S_sc = V_base/X_th"],
     "S_sc"),
]

COMP_EZ_LABELS = ["Impedansi dasar Z_base = V²/S", "Reaktansi saluran Ω → pu", "Konversi dasar daya (S)", "Reaktansi trafo pada dasar sistem", "Arus dasar I_base",
                  "I_sc pu dari X_th seri", "Daya hubung singkat S_sc", "I_sc dalam ampere", "Tegangan kirim pu (regulasi)", "Tegangan pu → kV"]
COMP_HARD_LABELS = ["X_total diagram reaktansi gen–trafo–saluran", "S_sc ujung saluran", "Konversi dasar motor (S dan V berbeda)",
                    "Dua jalur paralel (X_th, I_sc)", "Arus beban pu"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 3, 2: 1, 3: 2}
SSC_F, V_TM, S_BF = 250.0, 20.0, 10.0
XS_F = S_BF / SSC_F                                   # 0,04 pu dasar 10 MVA
ST_F, ZT_F, XR_F = 2.5, 0.065, 6.0
XT_F = ZT_F * S_BF / ST_F * (XR_F / math.hypot(1, XR_F))
RT_F = ZT_F * S_BF / ST_F * (1 / math.hypot(1, XR_F))
V_TR = 0.4
ZB_TR = V_TR ** 2 / S_BF
IB_TR = S_BF * 1e6 / (SQ3 * V_TR * 1e3)
L_KAB, R_KAB_KM, X_KAB_KM = 0.04, 0.0375, 0.08
R_KAB = R_KAB_KM * L_KAB / 2 / ZB_TR
X_KAB = X_KAB_KM * L_KAB / 2 / ZB_TR
Z_TH_F = complex(RT_F + R_KAB, XS_F + XT_F + X_KAB)
I_SC_F_PU = 1 / abs(Z_TH_F)
I_SC_F_KA = I_SC_F_PU * IB_TR / 1000
I_SC_F_NOR = 1 / Z_TH_F.imag * IB_TR / 1000
S_MOT, X_MOT = 1.2, 0.17
XM_F = X_MOT * S_BF / S_MOT
I_MOT_KA = 1 / XM_F * IB_TR / 1000
I_TOT_KA = I_SC_F_KA + I_MOT_KA
S_BEBAN_F, PF_F = 1.8, 0.85
I_BEBAN_PU = S_BEBAN_F / S_BF
DV_F = I_BEBAN_PU * (RT_F * PF_F + XT_F * math.sin(math.acos(PF_F)))
V_PANEL = (1 - DV_F) * 400

FQ_JUDUL = [
    f"Susun SLD dan diagram impedansi gardu pabrik (PLN 20 kV S_sc {ind(SSC_F, 0)} MVA, trafo {ind(ST_F, 1)} MVA, kabel TR) pada dasar {ind(S_BF, 0)} MVA: berapa X_s, Z_trafo, dan Z_kabel dalam pu?",
    "Hitung arus hubung singkat di panel utama 400 V dengan dan tanpa resistansi, tambahkan sumbangan motor, lalu pilih kapasitas pemutus MCCB utama.",
    f"Beban pabrik {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}: hitung arus beban pu, jatuh tegangan trafo, dan tegangan panel; usulkan tap trafo atau kompensasi bila perlu.",
]
FQ_RINGKAS = [
    f"Dasar {ind(S_BF, 0)} MVA; V_base 20 kV dan 0,4 kV (rasio trafo); X_s = S_base/S_sc (Persamaan 2 dan 5); Z_trafo = {ind(ZT_F * 100, 1)} % × 10/{ind(ST_F, 1)} dipecah R dan X dari X/R = {ind(XR_F, 0)}; kabel 2 × (3×240) Cu {ind(L_KAB * 1000, 0)} m: R, X per km ÷ 2 ÷ Z_base 0,4 kV (Persamaan 3).",
    f"Z_th = jumlah seri (kompleks) → I_sc pu = 1/|Z_th| → × I_base 0,4 kV = {ind(IB_TR / 1000, 2)} kA/pu (Persamaan 5); bandingkan dengan diagram reaktansi murni (tanpa R); tambah motor {ind(S_MOT, 1)} MVA X'' {ind(X_MOT, 2)} paralel; MCCB ≥ 1,1 × total; bahas kapan R boleh diabaikan.",
    f"I_beban = S/S_base pu (Persamaan 6); ΔV ≈ I(R cos φ + X sin φ) trafo dalam pu; V_panel = (1 − ΔV) × 400 V; batas −5 %/−10 %; tap +2,5 %/+5 % atau kapasitor untuk pf 0,95; kaitkan dengan Modul 5 dan 10.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Sebuah pabrik berlangganan 20 kV dari PLN dengan daya hubung singkat rel <b>{ind(SSC_F, 0)} MVA</b>. Gardu pabrik: trafo <b>{ind(ST_F, 1)} MVA, 20/0,4 kV, Z {ind(ZT_F * 100, 1)} %</b> (X/R = {ind(XR_F, 0)}), kabel dari trafo ke panel utama <b>2 × (3×240 mm²) Cu, {ind(L_KAB * 1000, 0)} m</b> (0,0375 + j0,08 Ω/km per kabel). Pilih dasar {ind(S_BF, 0)} MVA dengan V_base 20 kV dan 0,4 kV. Gambarkan SLD-nya (PLN — PMT 20 kV — trafo — kabel — panel utama — feeder motor) dan susun diagram impedansi lengkap (R dan X) dalam pu: X_s dari S_sc (Persamaan 2 dan 5), Z trafo pada dasar 10 MVA dipecah menjadi R dan X, serta Z kabel dari Ω ke pu (Persamaan 3).",
            ["X_s = S_base/S_sc", "Z_trafo,pu = Z % × S_base/S_trafo", "Z_kabel,pu = Z_Ω/Z_base(0,4 kV)"],
            "Pada dasar 10 MVA, X_s, Z_trafo, dan Z_base sisi 0,4 kV kira-kira...",
            [f"X_s = {ind(SSC_F / S_BF, 0)} pu, Z_trafo = {ind(ZT_F, 3)} pu, Z_base = {ind(V_TM ** 2 / S_BF, 0)} Ω", f"X_s = {ind(XS_F, 2)} pu, Z_trafo = {ind(ZT_F, 3)} pu (tidak perlu dikonversi), Z_base = {ind(ZB_TR, 3)} Ω", f"X_s = {ind(XS_F, 2)} pu, Z_trafo = {ind(ZT_F * S_BF / ST_F, 2)} pu, Z_base = {ind(V_TR ** 2 / ST_F, 3)} Ω", f"X_s = {ind(XS_F, 2)} pu, Z_trafo = {ind(ZT_F * S_BF / ST_F, 2)} pu ({ind(RT_F, 4)} + j{ind(XT_F, 4)}), Z_base 0,4 kV = {ind(ZB_TR, 3)} Ω"],
            f"✅ Tepat! \\(X_s = {ind(S_BF, 0)}/{ind(SSC_F, 0)} = {ind(XS_F, 2)}\\) pu; \\(Z_{{trafo}} = {ind(ZT_F, 3)}\\times{ind(S_BF, 0)}/{ind(ST_F, 1)} = {ind(ZT_F * S_BF / ST_F, 2)}\\) pu, dengan X/R = {ind(XR_F, 0)}: \\(R = {ind(RT_F, 4)}\\), \\(X = {ind(XT_F, 4)}\\) pu; \\(Z_{{base}}(0{{,}}4\\ \\text{{kV}}) = 0{{,}}4^2/{ind(S_BF, 0)} = {ind(ZB_TR, 3)}\\) Ω sehingga kabel (dua paralel, {ind(L_KAB * 1000, 0)} m): \\(R = 0{{,}}0375\\times{ind(L_KAB, 2)}/2/{ind(ZB_TR, 3)} = {ind(R_KAB, 4)}\\), \\(X = {ind(X_KAB, 4)}\\) pu. I_base sisi 0,4 kV = {ind(IB_TR, 0)} A.",
            "❌ Konversi Z trafo dari dasar pengenalnya (2,5 MVA) ke dasar sistem (10 MVA) dengan faktor S_baru/S_lama, dan hitung Z_base sisi 0,4 kV dengan V_base 0,4 kV (bukan 20 kV) sebelum mengubah ohm kabel ke pu.",
            "Petunjuk: (1) X_s dari S_sc. (2) Z trafo × 10/2,5 lalu pecah R, X. (3) Z_base 0,4 kV dan Z kabel pu. Gambar SLD dan diagram impedansinya.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Dari diagram impedansi pertanyaan 1, hitung impedansi Thevenin di panel utama 400 V (jumlah seri kompleks), arus hubung singkat tiga fasa dalam pu dan kA (I_base 0,4 kV = {ind(IB_TR, 0)} A), lalu bandingkan dengan hasil diagram reaktansi murni (R diabaikan). Motor-motor pabrik setara <b>{ind(S_MOT, 1)} MVA dengan X'' {ind(X_MOT, 2)} pu</b> (dasar sendiri) tersambung di panel yang sama: tambahkan sumbangannya (paralel, Persamaan 5). Pilih kapasitas pemutus MCCB utama (deret 25, 36, 50, 65, 85 kA) dengan cadangan 10 %, dan bahas mengapa di sisi TR pabrik resistansi tidak boleh diabaikan.",
            ["Z_th = Σ(R + jX)", "I_sc = I_base/|Z_th|", "I_motor = I_base/X''_m,pu"],
            "Arus hubung singkat panel utama (dengan R) dan sumbangan motor kira-kira...",
            [f"{ind(I_SC_F_NOR, 1)} kA dari jaringan + {ind(I_MOT_KA, 1)} kA motor: MCCB 50 kA", f"{ind(I_SC_F_KA, 1)} kA dari jaringan (tanpa R: {ind(I_SC_F_NOR, 1)} kA, terlalu besar {ind((I_SC_F_NOR / I_SC_F_KA - 1) * 100, 0)} %) + motor {ind(I_MOT_KA, 1)} kA = {ind(I_TOT_KA, 1)} kA → MCCB {int(math.ceil(I_TOT_KA * 1.1 / 5) * 5) if I_TOT_KA * 1.1 > 36 else 36} kA", f"{ind(I_SC_F_PU, 2)} kA (nilai pu langsung dibaca sebagai kA)", f"{ind(I_SC_F_KA, 1)} kA; motor tidak menyumbang karena hanya menyerap daya"],
            f"✅ Tepat! \\(Z_{{th}} = ({ind(Z_TH_F.real, 4)}) + j({ind(Z_TH_F.imag, 4)})\\) pu, \\(|Z_{{th}}| = {ind(abs(Z_TH_F), 4)}\\) (X/R = {ind(Z_TH_F.imag / Z_TH_F.real, 1)}) → \\(I_{{sc}} = {ind(I_SC_F_PU, 3)}\\) pu × {ind(IB_TR, 0)} A = {ind(I_SC_F_KA, 2)} kA; tanpa R: \\(1/{ind(Z_TH_F.imag, 4)} = {ind(1 / Z_TH_F.imag, 3)}\\) pu = {ind(I_SC_F_NOR, 2)} kA ({ind((I_SC_F_NOR / I_SC_F_KA - 1) * 100, 1)} % terlalu besar). Motor: \\(X'' = {ind(X_MOT, 2)}\\times{ind(S_BF, 0)}/{ind(S_MOT, 1)} = {ind(XM_F, 3)}\\) pu → {ind(1 / XM_F, 3)} pu = {ind(I_MOT_KA, 2)} kA; total ≈ {ind(I_TOT_KA, 1)} kA → MCCB {int(math.ceil(I_TOT_KA * 1.1 / 5) * 5) if I_TOT_KA * 1.1 > 36 else 36} kA (deret di atas {ind(I_TOT_KA * 1.1, 1)} kA). Di TR X/R hanya ± {ind(Z_TH_F.imag / Z_TH_F.real, 0)} karena kabel dan trafo kecil beresistansi relatif besar.",
            "❌ Jumlahkan R dan X sebagai bilangan kompleks lalu ambil besarnya; sumbangan motor dihitung dari X'' pada dasar sistem (paralel dengan jaringan), dan kA = pu × I_base sisi 0,4 kV.",
            "Petunjuk: (1) Z_th kompleks dan |Z_th|. (2) I_sc pu → kA; bandingkan tanpa R. (3) Sumbangan motor, total, MCCB × 1,1.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Pada beban puncak pabrik menarik <b>{ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}</b> tertinggal dari panel utama. Hitung arus beban dalam pu (Persamaan 6, dasar {ind(S_BF, 0)} MVA; tegangan sisi 20 kV dianggap 1,0 pu), jatuh tegangan trafo dengan pendekatan I(R cos φ + X sin φ) memakai R dan X trafo dari pertanyaan 1, dan tegangan panel utama dalam volt. Bandingkan dengan batas −5 % (rancangan) dan −10 % (SPLN); bila kurang, usulkan tap trafo (+2,5 %, +5 % di sisi 20 kV menurunkan rasio sehingga sekunder naik) atau kapasitor untuk pf 0,95, dan hitung ulang jatuh tegangannya.",
            ["I_pu = S/S_base", "ΔV ≈ I(R cos φ + X sin φ)", "V_panel = (1 − ΔV) × 400"],
            f"Arus beban dan tegangan panel pada {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)} kira-kira...",
            [f"I = {ind(S_BEBAN_F / ST_F, 2)} pu (dasar trafo) dan V_panel = 400 V karena trafo tidak menjatuhkan tegangan", f"I = {ind(I_BEBAN_PU, 2)} pu; ΔV = {ind(DV_F * 100, 2)} % hanya dari X sehingga V_panel ≈ {ind(400 * (1 - I_BEBAN_PU * XT_F * math.sin(math.acos(PF_F))), 0)} V", f"I = {ind(I_BEBAN_PU, 2)} pu (= {ind(I_BEBAN_PU * IB_TR, 0)} A); ΔV ≈ {ind(I_BEBAN_PU, 2)}({ind(RT_F, 4)}×{ind(PF_F, 2)} + {ind(XT_F, 4)}×{ind(math.sin(math.acos(PF_F)), 3)}) = {ind(DV_F * 100, 2)} % → V_panel ≈ {ind(V_PANEL, 0)} V (memenuhi −5 %); kapasitor ke pf 0,95 memangkas ΔV ke ≈ {ind(S_BEBAN_F * PF_F / 0.95 / S_BF * (RT_F * 0.95 + XT_F * math.sin(math.acos(0.95))) * 100, 2)} %", f"I = {ind(I_BEBAN_PU * IB_TR / 1000, 2)} pu; ΔV = {ind(DV_F * 100 * 5, 1)} % sehingga perlu tap +5 %"],
            f"✅ Tepat! \\(I = {ind(S_BEBAN_F, 1)}/{ind(S_BF, 0)} = {ind(I_BEBAN_PU, 2)}\\) pu = {ind(I_BEBAN_PU * IB_TR, 0)} A; \\(\\Delta V = {ind(I_BEBAN_PU, 2)}({ind(RT_F, 4)}\\times{ind(PF_F, 2)} + {ind(XT_F, 4)}\\times{ind(math.sin(math.acos(PF_F)), 3)}) = {ind(DV_F, 4)}\\) pu = {ind(DV_F * 100, 2)} % → \\(V = (1 - {ind(DV_F, 4)})\\times400 = {ind(V_PANEL, 1)}\\) V, dalam batas −5 % (380 V). Dengan kapasitor ke pf 0,95: P = {ind(S_BEBAN_F * PF_F, 2)} MW → S = {ind(S_BEBAN_F * PF_F / 0.95, 2)} MVA, ΔV ≈ {ind(S_BEBAN_F * PF_F / 0.95 / S_BF * (RT_F * 0.95 + XT_F * math.sin(math.acos(0.95))) * 100, 2)} %; tap +2,5 % menaikkan sekunder tanpa beban ke 410 V bila kabel dan beban ujung masih rendah. Semua dalam pu, tanpa √3 dan tanpa rasio 20/0,4.",
            "❌ Arus beban pu = S beban / S_base sistem (10 MVA), bukan dasar trafo; jatuh tegangan memakai R dan X trafo dalam pu pada dasar yang sama, lalu dikalikan 400 V.",
            "Petunjuk: (1) I pu dan ampere. (2) ΔV pu dari R, X trafo. (3) V_panel, bandingkan batas; hitung ulang dengan pf 0,95 atau tap.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">X_s = S_base/S_sc</span>
    <span class="ff" style="left:32%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">Z_base(0,4 kV) = 0,016 Ω</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">I_sc = I_base/|Z_th|</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">MCCB ≥ ? kA</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Gardu Pabrik<br><em>dalam Per Unit</em></h1>
    <p class="hero-sub">Sebuah pabrik harus membuktikan kepada PLN dan asuransinya bahwa panel utamanya mampu memutus arus hubung singkat dan tegangannya tetap dalam batas: dari S_sc rel PLN, trafo, dan kabel sampai MCCB dan tap trafo. Terapkan kosakata Pertemuan {PERTEMUAN} — besaran dasar, konversi dasar, diagram impedansi, Thevenin, pu — untuk menyusunnya dengan angka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PLN 20 kV, {ind(SSC_F, 0)} MVA → Trafo {ind(ST_F, 1)} MVA → Panel 400 V —<br>SLD, Hubung Singkat, dan Tegangan Panel</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS STUDI PER UNIT GARDU PELANGGAN INDUSTRI</div>
    <p>
      Sebuah pabrik komponen otomotif berlangganan <strong style="color:var(--amber)">20 kV</strong> dari PLN; rel 20 kV mempunyai daya hubung singkat <strong style="color:var(--cyan)">{ind(SSC_F, 0)} MVA</strong>. Gardu pabrik: trafo <strong>{ind(ST_F, 1)} MVA, 20/0,4 kV, Z {ind(ZT_F * 100, 1)} %</strong> (X/R = {ind(XR_F, 0)}); kabel trafo–panel utama <strong>2 × (3×240 mm²) Cu, {ind(L_KAB * 1000, 0)} m</strong>; motor-motor setara {ind(S_MOT, 1)} MVA (X'' {ind(X_MOT, 2)}); beban puncak {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}.
    </p>
    <p style="margin-top:12px">
      Asuransi meminta <strong style="color:var(--pink)">bukti kapasitas pemutus MCCB utama</strong>, dan operasi mengeluh <strong style="color:var(--pink)">tegangan panel rendah</strong> saat puncak. Konsultan sebelumnya menghitung dalam ohm dan volt dengan rasio trafo bolak-balik; Anda diminta mengulanginya dalam per unit pada dasar {ind(S_BF, 0)} MVA.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menyusun SLD dan diagram impedansi, menghitung arus hubung singkat dan tegangan panel, dan merekomendasikan MCCB serta perbaikan tegangan <strong style="color:var(--cyan)">sebelum</strong> audit asuransi.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"PLN 20 kV: S_sc = {ind(SSC_F, 0)} MVA", "14,165,233", "cyan")}
{kartu(f"trafo {ind(ST_F, 1)} MVA, Z {ind(ZT_F * 100, 1)} %, X/R {ind(XR_F, 0)}", "14,165,233", "cyan")}
{kartu(f"kabel 2 × (3×240) Cu, {ind(L_KAB * 1000, 0)} m; motor {ind(S_MOT, 1)} MVA", "14,165,233", "cyan")}
{kartu(f"beban {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}; dasar {ind(S_BF, 0)} MVA", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Per unit lahir untuk kasus seperti ini: tiga peralatan dengan tiga dasar berbeda pada dua tingkat tegangan, yang harus dijumlahkan menjadi satu angka arus gangguan dan satu angka tegangan panel. Forum ini mengajak Anda menjalani ketiga langkahnya.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">SLD gardu pabrik (PLN — trafo — kabel — panel — motor) dan diagram impedansinya pada dasar {ind(S_BF, 0)} MVA dengan arus hubung singkat panel utama</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Gardu pabrik: PLN 20 kV S_sc {ind(SSC_F, 0)} MVA; trafo {ind(ST_F, 1)} MVA 20/0,4 kV Z {ind(ZT_F * 100, 1)} % (X/R {ind(XR_F, 0)}); kabel 2 × (3×240 mm²) Cu {ind(L_KAB * 1000, 0)} m (0,0375 + j0,08 Ω/km per kabel); motor setara {ind(S_MOT, 1)} MVA X'' {ind(X_MOT, 2)}; beban puncak {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}; dasar {ind(S_BF, 0)} MVA (20 kV | 0,4 kV); tugas: SLD + diagram impedansi pu, I_sc panel dengan/tanpa R + motor → MCCB, arus beban dan tegangan panel → tap/kapasitor."
FORUM_CHIPS_LMS = [f"PLN = 20 kV, S_sc {ind(SSC_F, 0)} MVA", f"trafo = {ind(ST_F, 1)} MVA, Z {ind(ZT_F * 100, 1)} %, X/R {ind(XR_F, 0)}", f"kabel = 2×(3×240) Cu {ind(L_KAB * 1000, 0)} m; motor {ind(S_MOT, 1)} MVA", f"beban = {ind(S_BEBAN_F, 1)} MVA pf {ind(PF_F, 2)}; dasar {ind(S_BF, 0)} MVA"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — SLD gardu pabrik dan diagram impedansi pu dengan arus hubung singkat panel (Pertemuan 14)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const Sb = 10, Xs = Sb / 250, Zt = 0.065 * Sb / 2.5, Xt = Zt * 6 / Math.sqrt(37), Rt = Zt / Math.sqrt(37), Zb = 0.16 / Sb, Rk = 0.0375 * 0.04 / 2 / Zb, Xk = 0.08 * 0.04 / 2 / Zb;
  const R = Rt + Rk, X = Xs + Xt + Xk, Zth = Math.hypot(R, X), Ib = Sb * 1e6 / (Math.sqrt(3) * 400), Isc = Ib / Zth / 1000, Xm = 0.17 * Sb / 1.2, Im = Ib / Xm / 1000;
  const y1 = 46, y2 = 120, xs = [30, W * 0.2, W * 0.42, W * 0.64, W * 0.84];
  ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'center';
  const garis = (x1, y, x2, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); };
  // SLD
  ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('SLD', 30, 20);
  ctx.fillStyle = 'rgba(0,229,255,.95)'; ctx.fillText('PLN 20 kV', xs[0] + 24, y1 - 16); ctx.fillText('S_sc 250 MVA', xs[0] + 24, y1 + 24);
  garis(xs[0], y1, xs[1] - 4, 2, 'rgba(148,163,184,.8)'); ctx.strokeStyle = 'rgba(226,232,240,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs[1], y1 - 14); ctx.lineTo(xs[1], y1 + 14); ctx.stroke(); ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('rel 20 kV', xs[1], y1 + 28);
  const xtr = (xs[1] + xs[2]) / 2; garis(xs[1], y1, xtr - 12, 2, 'rgba(148,163,184,.8)'); ctx.strokeStyle = 'rgba(168,85,247,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xtr - 5, y1, 9, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(xtr + 5, y1, 9, 0, Math.PI * 2); ctx.stroke(); garis(xtr + 14, y1, xs[2] - 4, 2, 'rgba(148,163,184,.8)');
  ctx.fillStyle = 'rgba(168,85,247,.95)'; ctx.fillText('T 2,5 MVA 20/0,4 kV Z 6,5 %', xtr, y1 - 16);
  ctx.strokeStyle = 'rgba(226,232,240,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs[2], y1 - 14); ctx.lineTo(xs[2], y1 + 14); ctx.stroke(); ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('rel TR trafo', xs[2], y1 + 28);
  garis(xs[2], y1, xs[3] - 4, 2, 'rgba(0,224,158,.9)'); ctx.fillStyle = 'rgba(0,224,158,.95)'; ctx.fillText('kabel 2×(3×240) 40 m', (xs[2] + xs[3]) / 2, y1 - 16);
  ctx.strokeStyle = 'rgba(239,68,68,1)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs[3], y1 - 14); ctx.lineTo(xs[3], y1 + 14); ctx.stroke(); ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.fillText('panel utama 400 V', xs[3], y1 + 28);
  garis(xs[3], y1, xs[4] - 12, 2, 'rgba(255,179,0,.9)'); ctx.strokeStyle = 'rgba(255,179,0,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xs[4], y1, 11, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(255,179,0,.95)'; ctx.fillText('M', xs[4], y1 + 4); ctx.fillText('motor 1,2 MVA', xs[4], y1 + 28);
  // diagram impedansi
  ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.fillText('pu (10 MVA)', 40, y2 - 26);
  const kotak = (x, w, label, c) => { ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.strokeRect(x, y2 - 10, w, 20); ctx.fillStyle = c; ctx.font = '9px JetBrains Mono'; ctx.fillText(label, x + w / 2, y2 + 4); ctx.font = '600 10px JetBrains Mono'; };
  garis(xs[0], y2, xs[0] + 20, 2, 'rgba(148,163,184,.8)'); kotak(xs[0] + 20, 70, 'jX_s ' + Xs.toFixed(3), 'rgba(0,229,255,.95)'); garis(xs[0] + 90, y2, xs[1] + 10, 2, 'rgba(148,163,184,.8)');
  kotak(xs[1] + 10, xs[2] - xs[1] - 20, 'R_t ' + Rt.toFixed(4) + ' + jX_t ' + Xt.toFixed(4), 'rgba(168,85,247,.95)'); garis(xs[2] - 10, y2, xs[2] + 10, 2, 'rgba(148,163,184,.8)');
  kotak(xs[2] + 10, xs[3] - xs[2] - 20, 'R_k ' + Rk.toFixed(4) + ' + jX_k ' + Xk.toFixed(4), 'rgba(0,224,158,.95)'); garis(xs[3] - 10, y2, xs[3], 2, 'rgba(148,163,184,.8)');
  ctx.strokeStyle = 'rgba(239,68,68,1)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs[3], y2 - 14); ctx.lineTo(xs[3], y2 + 14); ctx.stroke();
  garis(xs[3], y2, xs[4] - 60, 2, 'rgba(255,179,0,.9)'); kotak(xs[4] - 60, 56, 'jX_m ' + Xm.toFixed(2), 'rgba(255,179,0,.95)');
  ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.textAlign = 'center'; ctx.fillText('|Z_th| = ' + Zth.toFixed(4) + ' pu (X/R ' + (X / R).toFixed(1) + ') → I_sc = ' + Isc.toFixed(1) + ' kA + motor ' + Im.toFixed(1) + ' kA ≈ ' + (Isc + Im).toFixed(1) + ' kA (I_base 0,4 kV = ' + (Ib / 1000).toFixed(2) + ' kA)', W / 2, H - 12);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
