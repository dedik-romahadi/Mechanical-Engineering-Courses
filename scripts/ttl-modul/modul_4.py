# Konten Modul 4 Teknik Tenaga Listrik — Daya pada Jaringan Listrik DC dengan Dua
# atau Lebih Sumber Tegangan (Sub-CPMK 2.1, Pertemuan 4). Angka contoh dihitung di
# sini agar teks, tabel, dan gambar konsisten, dan sengaja berbeda dari varian soal.
import math

from pustaka import (AX, BOX, GRID, TX, anim_panel, arrow, bagian, box, cards, figure, formula,
                     fq, ind, kode, kotak, mc_block, pm_ref, svg, t, tabel)

NOMOR = 4
PERTEMUAN = 4
SUB_CPMK = "2.1"
JUDUL = "Daya pada Jaringan DC Dua Sumber"
JUDUL_PANJANG = "Daya pada Jaringan Listrik DC dengan Dua atau Lebih Sumber Tegangan"
JUDUL_EKSPOR = "Daya pada Jaringan DC Dua Sumber"

# ─────────────────────────── angka contoh ───────────────────────────
E1S, E2S, RS = 12.0, 7.5, 4.0                                # seri aiding/opposing (Bagian 01)
I_AID, I_OPP = (E1S + E2S) / RS, (E1S - E2S) / RS
E1M, R1M, E2M, R2M, R3M = 18.0, 3.0, 12.0, 6.0, 4.0           # mesh (Bagian 02): kedua ggl searah jarum jam
DET_M = (R1M + R3M) * (R2M + R3M) - R3M * R3M
I1M = (E1M * (R2M + R3M) + R3M * E2M) / DET_M
I2M = ((R1M + R3M) * E2M + R3M * E1M) / DET_M
I3M = I1M - I2M
P3M = I3M ** 2 * R3M
E1N, R1N, E2N, R2N, R3N = 14.0, 2.0, 11.0, 4.0, 5.0           # nodal & superposisi (Bagian 03–04)
G_N = 1 / R1N + 1 / R2N + 1 / R3N
V_N = (E1N / R1N + E2N / R2N) / G_N
I1N, I2N, I3N = (E1N - V_N) / R1N, (E2N - V_N) / R2N, V_N / R3N
V_S1, V_S2 = (E1N / R1N) / G_N, (E2N / R2N) / G_N
I3_S1, I3_S2 = V_S1 / R3N, V_S2 / R3N
ET, R1T, R2T, R3T = 24.0, 8.0, 8.0, 2.0                       # Thevenin (Bagian 05)
VTH = ET * R2T / (R1T + R2T)
RTH = R1T * R2T / (R1T + R2T) + R3T
IN_ = VTH / RTH
PMAKS = VTH ** 2 / (4 * RTH)
E1P, R1P, E2P, R2P, RLP = 12.8, 0.05, 12.2, 0.08, 0.6         # baterai paralel (Bagian 06)
G_P = 1 / R1P + 1 / R2P + 1 / RLP
V_P = (E1P / R1P + E2P / R2P) / G_P
I1P, I2P, ILP = (E1P - V_P) / R1P, (E2P - V_P) / R2P, V_P / RLP
I_SIRK = (E1P - E2P) / (R1P + R2P)
P_SIRK = I_SIRK ** 2 * (R1P + R2P)
EG1, RG1, EG2, RG2, IG = 240.0, 0.2, 236.0, 0.1, 150.0        # generator paralel beban arus tetap
V_G = ((EG1 / RG1 + EG2 / RG2) - IG) / (1 / RG1 + 1 / RG2)
IG1, IG2 = (EG1 - V_G) / RG1, (EG2 - V_G) / RG2


def p_thev(RL):
    return VTH ** 2 * RL / (RTH + RL) ** 2


# ─────────────────────────── primitif gambar ───────────────────────────
def sumber(x, y, c, label, anchor="end", dx=-14):
    return (f'<line x1="{x - 16}" y1="{y - 6}" x2="{x + 16}" y2="{y - 6}" stroke="{c}" stroke-width="4"/>'
            f'<line x1="{x - 8}" y1="{y + 8}" x2="{x + 8}" y2="{y + 8}" stroke="{c}" stroke-width="4"/>'
            + t(x + dx, y + 5, label, 12, c, anchor, "700"))


def res_h(x1, x2, y, c, label, dy=-10):
    return f'<rect x="{x1}" y="{y - 10}" width="{x2 - x1}" height="20" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t((x1 + x2) / 2, y + dy - 4, label, 11, c, "middle", "600")


def res_v(x, y1, y2, c, label, dx=14):
    return f'<rect x="{x - 10}" y="{y1}" width="20" height="{y2 - y1}" rx="3" fill="{BOX}" stroke="{c}" stroke-width="2"/>' + t(x + dx, (y1 + y2) / 2 + 4, label, 11, c, "start", "600")


def kawat(x1, y1, x2, y2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{AX}" stroke-width="2"/>'


def loop_arrow(cx, cy, r, c, label):
    # busur searah jarum jam dengan mata panah, untuk arus mesh
    return (f'<path d="M {cx - r} {cy} A {r} {r} 0 1 1 {cx} {cy + r}" fill="none" stroke="{c}" stroke-width="1.8"/>'
            f'<polygon points="{cx},{cy + r} {cx - 8},{cy + r - 5} {cx - 7},{cy + r + 4}" fill="{c}"/>'
            + t(cx, cy + 4, label, 12, c, "middle", "700"))


def jaringan_dua_sumber(ox, oy, w, e1, e2, r1, r2, r3, c_v="#ef4444", ket_v=None, mati=None):
    """E1—R1—simpul—R2—E2, R3 dari simpul ke bawah; mati='E1'/'E2' menggambar sumber sebagai kawat."""
    xl, xr, xm, yt, yb = ox, ox + w, ox + w / 2, oy, oy + 120
    b = kawat(xl, yt, xr, yt) + kawat(xl, yb, xr, yb) + kawat(xl, yt, xl, yb) + kawat(xr, yt, xr, yb)
    b += kawat(xm, yt, xm, yt + 30) + kawat(xm, yb - 30, xm, yb)
    ym = (yt + yb) / 2
    if mati == "E1":
        b += t(xl - 6, ym + 4, "0 V", 10.5, AX, "end", "600")
    else:
        b += f'<rect x="{xl - 18}" y="{ym - 12}" width="36" height="26" fill="{BOX}"/>' + sumber(xl, ym, "#f59e0b", e1, "end", -20)
    if mati == "E2":
        b += t(xr + 6, ym + 4, "0 V", 10.5, AX, "start", "600")
    else:
        b += f'<rect x="{xr - 18}" y="{ym - 12}" width="36" height="26" fill="{BOX}"/>' + sumber(xr, ym, "#f97316", e2, "start", 20)
    b += res_h(xl + w * 0.16, xl + w * 0.36, yt, "#22d3ee", r1) + res_h(xm + w * 0.14, xm + w * 0.34, yt, "#a855f7", r2)
    b += res_v(xm, yt + 30, yb - 30, "#00e09e", r3)
    b += f'<circle cx="{xm}" cy="{yt}" r="5" fill="{c_v}"/>'
    if ket_v:
        b += t(xm, yt - 14, ket_v, 11.5, c_v, "middle", "700")
    return b


# ─────────────────────────── gambar ───────────────────────────
def gambar1():
    b = t(165, 24, "Seri saling menguatkan (aiding)", 12, TX, "middle", "700")
    b += kawat(40, 60, 290, 60) + kawat(40, 160, 290, 160) + kawat(40, 60, 40, 84) + kawat(40, 136, 40, 160) + kawat(290, 60, 290, 160)
    b += sumber(40, 96, "#f59e0b", f"E₁ {ind(E1S, 0)} V", "start", 22) + sumber(40, 130, "#f97316", f"E₂ {ind(E2S, 1)} V", "start", 22)
    b += kawat(40, 84, 40, 96) + kawat(40, 104, 40, 122)
    b += res_v(290, 85, 135, "#22d3ee", f"R {ind(RS, 0)} Ω", -60)
    b += arrow(140, 60, 200, 60, "#00e09e", 2.2) + t(170, 50, f"I = {ind(I_AID, 3)} A", 12, "#00e09e", "middle", "700")
    b += t(165, 186, f"E_tot = E₁ + E₂ = {ind(E1S + E2S, 1)} V", 12, TX)
    b += t(495, 24, "Seri saling melawan (opposing)", 12, TX, "middle", "700")
    b += kawat(370, 60, 620, 60) + kawat(370, 160, 620, 160) + kawat(370, 60, 370, 84) + kawat(370, 136, 370, 160) + kawat(620, 60, 620, 160)
    b += sumber(370, 96, "#f59e0b", f"E₁ {ind(E1S, 0)} V", "start", 22)
    b += (f'<line x1="362" y1="122" x2="378" y2="122" stroke="#f97316" stroke-width="4"/><line x1="354" y1="136" x2="386" y2="136" stroke="#f97316" stroke-width="4"/>'
          + t(392, 133, f"E₂ {ind(E2S, 1)} V (dibalik)", 12, "#f97316", "start", "700"))
    b += kawat(370, 84, 370, 96) + kawat(370, 104, 370, 122)
    b += res_v(620, 85, 135, "#22d3ee", f"R {ind(RS, 0)} Ω", -60)
    b += arrow(470, 60, 530, 60, "#00e09e", 2.2) + t(500, 50, f"I = {ind(I_OPP, 3)} A", 12, "#00e09e", "middle", "700")
    b += t(495, 186, f"E_tot = E₁ − E₂ = {ind(E1S - E2S, 1)} V, searah E₁", 12, TX)
    b += t(330, 210, "Dua ggl dalam satu loop: polaritas menentukan apakah keduanya dijumlahkan atau dikurangkan", 11.5, AX)
    return svg(660, 220, b, "Gambar 1 — Dua sumber seri: menguatkan dan melawan")


def gambar2():
    xl, xm, xr, yt, yb = 80, 330, 580, 50, 170
    b = kawat(xl, yt, xr, yt) + kawat(xl, yb, xr, yb) + kawat(xl, yt, xl, yb) + kawat(xr, yt, xr, yb) + kawat(xm, yt, xm, yt + 30) + kawat(xm, yb - 30, xm, yb)
    b += f'<rect x="{xl - 18}" y="98" width="36" height="26" fill="{BOX}"/>' + sumber(xl, 110, "#f59e0b", f"E₁ {ind(E1M, 0)} V", "end", -20)
    b += (f'<rect x="{xr - 18}" y="98" width="36" height="26" fill="{BOX}"/>'
          f'<line x1="{xr - 8}" y1="104" x2="{xr + 8}" y2="104" stroke="#f97316" stroke-width="4"/><line x1="{xr - 16}" y1="118" x2="{xr + 16}" y2="118" stroke="#f97316" stroke-width="4"/>'
          + t(xr + 20, 115, f"E₂ {ind(E2M, 0)} V", 12, "#f97316", "start", "700"))
    b += res_h(130, 220, yt, "#22d3ee", f"R₁ {ind(R1M, 0)} Ω") + res_h(420, 510, yt, "#a855f7", f"R₂ {ind(R2M, 0)} Ω") + res_v(xm, yt + 30, yb - 30, "#00e09e", f"R₃ {ind(R3M, 0)} Ω")
    b += loop_arrow(205, 110, 26, "#f59e0b", "I₁") + loop_arrow(455, 110, 26, "#f97316", "I₂")
    b += t(xm - 14, 105, f"I₁ − I₂", 10.5, "#00e09e", "end", "600") + arrow(xm - 30, 90, xm - 30, 130, "#00e09e", 1.6)
    b += t(330, 200, f"Loop 1: {ind(E1M, 0)} = {ind(R1M + R3M, 0)}·I₁ − {ind(R3M, 0)}·I₂;  Loop 2: {ind(E2M, 0)} = {ind(R2M + R3M, 0)}·I₂ − {ind(R3M, 0)}·I₁  →  I₁ = {ind(I1M, 3)} A, I₂ = {ind(I2M, 3)} A, I_R3 = {ind(I3M, 3)} A", 11.5, AX)
    return svg(660, 214, b, "Gambar 2 — Jaringan dua loop dan arus mesh (kedua ggl mendorong searah jarum jam)")


def gambar3():
    b = jaringan_dua_sumber(90, 50, 480, f"E₁ {ind(E1N, 0)} V", f"E₂ {ind(E2N, 0)} V", f"R₁ {ind(R1N, 0)} Ω", f"R₂ {ind(R2N, 0)} Ω", f"R₃ {ind(R3N, 0)} Ω", "#ef4444", f"simpul A: V = {ind(V_N, 3)} V")
    b += arrow(150, 88, 210, 88, "#f59e0b", 1.8) + t(180, 104, f"I₁ = {ind(I1N, 3)} A", 11, "#f59e0b", "middle", "600")
    b += arrow(510, 88, 450, 88, "#f97316", 1.8) + t(480, 104, f"I₂ = {ind(I2N, 3)} A", 11, "#f97316", "middle", "600")
    b += arrow(305, 95, 305, 135, "#00e09e", 1.8) + t(300, 150, f"I₃ = {ind(I3N, 3)} A", 11, "#00e09e", "end", "600")
    b += t(330, 200, f"KCL di A: (E₁−V)/R₁ + (E₂−V)/R₂ = V/R₃  →  {ind(I1N, 3)} + {ind(I2N, 3)} = {ind(I3N, 3)} A;  referensi (0 V) adalah rel bawah", 11.5, AX)
    return svg(660, 214, b, "Gambar 3 — Analisis nodal jaringan dua sumber")


def gambar4():
    b = t(110, 22, "① Hanya E₁ (E₂ → kawat)", 11.5, "#f59e0b", "middle", "700")
    b += jaringan_dua_sumber(20, 40, 180, f"{ind(E1N, 0)} V", "", "R₁", "R₂", "R₃", "#f59e0b", f"V′ = {ind(V_S1, 2)} V", mati="E2")
    b += t(110, 182, f"I₃′ = {ind(I3_S1, 3)} A", 11.5, "#f59e0b", "middle", "600")
    b += t(330, 22, "② Hanya E₂ (E₁ → kawat)", 11.5, "#f97316", "middle", "700")
    b += jaringan_dua_sumber(240, 40, 180, "", f"{ind(E2N, 0)} V", "R₁", "R₂", "R₃", "#f97316", f"V″ = {ind(V_S2, 2)} V", mati="E1")
    b += t(330, 182, f"I₃″ = {ind(I3_S2, 3)} A", 11.5, "#f97316", "middle", "600")
    b += t(550, 22, "③ Jumlah = rangkaian lengkap", 11.5, "#00e09e", "middle", "700")
    b += jaringan_dua_sumber(460, 40, 180, f"{ind(E1N, 0)} V", f"{ind(E2N, 0)} V", "R₁", "R₂", "R₃", "#00e09e", f"V = {ind(V_N, 2)} V")
    b += t(550, 182, f"I₃ = {ind(I3_S1, 3)} + {ind(I3_S2, 3)} = {ind(I3N, 3)} A", 11.5, "#00e09e", "middle", "600")
    b += t(330, 206, f"Daya R₃ = I₃²R₃ = {ind(I3N ** 2 * R3N, 2)} W, bukan {ind(I3_S1 ** 2 * R3N, 2)} + {ind(I3_S2 ** 2 * R3N, 2)} W: daya tidak disuperposisikan", 11.5, AX)
    return svg(660, 218, b, "Gambar 4 — Superposisi: satu sumber aktif pada satu waktu, lalu dijumlahkan")


def gambar5():
    # kiri: jaringan asli; tengah: Thevenin; kanan: Norton
    b = t(110, 22, "Jaringan asli", 11.5, TX, "middle", "700")
    b += kawat(30, 50, 30, 150) + kawat(30, 50, 150, 50) + kawat(30, 150, 200, 150) + kawat(150, 50, 150, 80) + kawat(150, 120, 150, 150) + kawat(150, 50, 200, 50)
    b += f'<rect x="12" y="88" width="36" height="26" fill="{BOX}"/>' + sumber(30, 100, "#f59e0b", f"{ind(ET, 0)} V", "start", 20)
    b += res_h(60, 120, 50, "#22d3ee", f"R₁ {ind(R1T, 0)} Ω") + res_v(150, 80, 120, "#a855f7", f"R₂ {ind(R2T, 0)} Ω", -62)
    b += f'<rect x="200" y="42" width="0" height="0"/>' + kawat(200, 50, 205, 50)
    b += f'<rect x="165" y="40" width="30" height="20" rx="3" fill="{BOX}" stroke="#00e09e" stroke-width="2"/>' + t(180, 34, f"R₃ {ind(R3T, 0)} Ω", 10.5, "#00e09e", "middle", "600")
    b += f'<circle cx="205" cy="50" r="4" fill="#ec4899"/><circle cx="205" cy="150" r="4" fill="#ec4899"/>' + t(214, 54, "a", 11, "#ec4899", "start", "700") + t(214, 154, "b", 11, "#ec4899", "start", "700")
    b += arrow(235, 100, 265, 100, "#94a3b8", 2)
    b += t(360, 22, "Ekuivalen Thevenin", 11.5, TX, "middle", "700")
    b += kawat(290, 50, 290, 88) + kawat(290, 112, 290, 150) + kawat(290, 50, 400, 50) + kawat(290, 150, 440, 150) + kawat(400, 50, 440, 50)
    b += f'<rect x="272" y="88" width="36" height="26" fill="{BOX}"/>' + sumber(290, 100, "#f59e0b", f"V_th {ind(VTH, 0)} V", "start", 20)
    b += res_h(320, 390, 50, "#22d3ee", f"R_th {ind(RTH, 0)} Ω")
    b += f'<circle cx="440" cy="50" r="4" fill="#ec4899"/><circle cx="440" cy="150" r="4" fill="#ec4899"/>' + t(449, 54, "a", 11, "#ec4899", "start", "700") + t(449, 154, "b", 11, "#ec4899", "start", "700")
    b += arrow(468, 100, 498, 100, "#94a3b8", 2)
    b += t(580, 22, "Ekuivalen Norton", 11.5, TX, "middle", "700")
    b += kawat(520, 50, 640, 50) + kawat(520, 150, 640, 150) + kawat(520, 50, 520, 84) + kawat(520, 116, 520, 150) + kawat(580, 50, 580, 80) + kawat(580, 120, 580, 150)
    b += f'<circle cx="520" cy="100" r="16" fill="{BOX}" stroke="#f59e0b" stroke-width="2"/>' + arrow(520, 110, 520, 90, "#f59e0b", 1.8) + t(500, 104, f"I_N {ind(IN_, 0)} A", 11, "#f59e0b", "end", "700")
    b += res_v(580, 80, 120, "#22d3ee", f"R_N {ind(RTH, 0)} Ω", 14)
    b += f'<circle cx="640" cy="50" r="4" fill="#ec4899"/><circle cx="640" cy="150" r="4" fill="#ec4899"/>' + t(649, 54, "a", 11, "#ec4899", "start", "700") + t(649, 154, "b", 11, "#ec4899", "start", "700")
    b += t(330, 190, f"V_th = {ind(ET, 0)}·{ind(R2T, 0)}/({ind(R1T, 0)}+{ind(R2T, 0)}) = {ind(VTH, 0)} V;  R_th = {ind(R1T, 0)}‖{ind(R2T, 0)} + {ind(R3T, 0)} = {ind(RTH, 0)} Ω;  I_N = V_th/R_th = {ind(IN_, 0)} A;  P_maks = V_th²/(4R_th) = {ind(PMAKS, 0)} W", 11.5, AX)
    return svg(660, 204, b, "Gambar 5 — Dari jaringan asli ke ekuivalen Thevenin dan Norton")


def gambar6():
    xl, xm, xr, yt, yb = 90, 300, 510, 46, 176
    b = kawat(xl, yt, xr, yt) + kawat(xl, yb, xr, yb) + kawat(xl, yt, xl, 70) + kawat(xl, 110, xl, 130) + kawat(xl, 150, xl, yb) + kawat(xr, yt, xr, 70) + kawat(xr, 110, xr, 130) + kawat(xr, 150, xr, yb)
    b += kawat(xm, yt, xm, 80) + kawat(xm, 140, xm, yb)
    b += res_v(xl, 70, 110, "#22d3ee", f"r₁ {ind(R1P, 2)} Ω", -70) + sumber(xl, 140, "#f59e0b", f"E₁ {ind(E1P, 1)} V", "end", -20)
    b += res_v(xr, 70, 110, "#a855f7", f"r₂ {ind(R2P, 2)} Ω", 14) + sumber(xr, 140, "#f97316", f"E₂ {ind(E2P, 1)} V", "start", 20)
    b += res_v(xm, 80, 140, "#00e09e", f"R_L {ind(RLP, 1)} Ω", 14)
    b += f'<circle cx="{xm}" cy="{yt}" r="5" fill="#ef4444"/>' + t(xm, yt - 14, f"V = {ind(V_P, 3)} V", 11.5, "#ef4444", "middle", "700")
    b += arrow(150, yt + 26, 230, yt + 26, "#f59e0b", 1.8) + t(190, yt + 42, f"I₁ = {ind(I1P, 2)} A", 11, "#f59e0b", "middle", "600")
    b += arrow(450, yt + 26, 370, yt + 26, "#f97316", 1.8) + t(410, yt + 42, f"I₂ = {ind(I2P, 2)} A", 11, "#f97316", "middle", "600")
    b += t(xm + 28, 116, f"I_L = {ind(ILP, 2)} A", 11, "#00e09e", "start", "600")
    b += (f'<path d="M 130 {yb - 14} L 130 {yt + 14} L 470 {yt + 14} L 470 {yb - 14} Z" fill="none" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="5 4"/>'
          + t(300, yb - 22, f"tanpa beban: arus sirkulasi (E₁−E₂)/(r₁+r₂) = {ind(I_SIRK, 2)} A, rugi {ind(P_SIRK, 2)} W terus-menerus", 10.5, "#ef4444", "middle", "600"))
    b += t(330, 204, f"Sumber ber-ggl lebih tinggi dan ber-r lebih kecil memikul bagian terbesar; selisih ggl memicu arus antar-sumber walau beban dilepas", 11.5, AX)
    return svg(660, 214, b, "Gambar 6 — Dua baterai paralel memasok satu beban")


# ─────────────────────────── SUBNAV & HERO ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-seri">Sumber Seri</a>
  <a href="#m-mesh">Mesh</a>
  <a href="#m-nodal">Nodal</a>
  <a href="#m-superposisi">Superposisi</a>
  <a href="#m-thevenin">Thevenin–Norton</a>
  <a href="#m-paralel">Sumber Paralel</a>
  <a href="#m-animasi">Animasi</a>
  <a href="#m-jupyter">Python</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="14" y1="50" x2="14" y2="160" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="86" y1="50" x2="86" y2="160" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="14" y1="50" x2="86" y2="50" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="14" y1="160" x2="86" y2="160" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="50" y1="50" x2="50" y2="160" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <rect x="44" y="85" width="12" height="40" rx="2" fill="none" stroke="rgba(0,224,158,.6)" stroke-width="1.5"/>
      <line x1="6" y1="100" x2="22" y2="100" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <line x1="9" y1="110" x2="19" y2="110" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <line x1="78" y1="100" x2="94" y2="100" stroke="rgba(249,115,22,.6)" stroke-width="2.4"/>
      <line x1="81" y1="110" x2="91" y2="110" stroke="rgba(249,115,22,.6)" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="3" fill="rgba(239,68,68,.7)"/>
      <text x="4" y="90" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">E₁</text>
      <text x="84" y="90" fill="rgba(249,115,22,.55)" font-family="JetBrains Mono" font-size="8">E₂</text>
      <text x="56" y="42" fill="rgba(239,68,68,.6)" font-family="JetBrains Mono" font-size="8">V</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="60" x2="10" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="10" y1="60" x2="70" y2="60" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <line x1="10" y1="150" x2="70" y2="150" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>
      <rect x="30" y="54" width="24" height="12" rx="2" fill="none" stroke="rgba(0,229,255,.55)" stroke-width="1.5"/>
      <line x1="2" y1="100" x2="18" y2="100" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <line x1="5" y1="110" x2="15" y2="110" stroke="rgba(255,179,0,.6)" stroke-width="2.4"/>
      <circle cx="70" cy="60" r="3" fill="rgba(236,72,153,.7)"/>
      <circle cx="70" cy="150" r="3" fill="rgba(236,72,153,.7)"/>
      <text x="76" y="64" fill="rgba(236,72,153,.6)" font-family="JetBrains Mono" font-size="8">a</text>
      <text x="76" y="154" fill="rgba(236,72,153,.6)" font-family="JetBrains Mono" font-size="8">b</text>
      <text x="26" y="48" fill="rgba(0,229,255,.55)" font-family="JetBrains Mono" font-size="8">R_th</text>
      <text x="0" y="90" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">V_th</text>
    </svg>
  </div>'''

HERO = f'''<div class="hero academic-hero" data-tab="modul" data-module-number="04">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
{HERO_SCHEMATIC_1}
  <div class="float-formulas">
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">ΣV_loop = 0</span>
    <span class="ff" style="left:18%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">V = (ΣE/R)/(Σ1/R)</span>
    <span class="ff" style="left:35%;font-size:.75rem;color:var(--amber);--dur:16s;--del:8s">I = I′ + I″</span>
    <span class="ff" style="left:50%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">V_th, R_th</span>
    <span class="ff" style="left:68%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">I_N = V_th/R_th</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--cyan);--dur:17s;--del:10s">P_maks = V_th²/4R_th</span>
    <span class="ff" style="left:12%;font-size:.65rem;color:var(--violet);--dur:19s;--del:12s">E₁ − E₂ = I(r₁ + r₂)</span>
    <span class="ff" style="left:62%;font-size:.7rem;color:var(--amber);--dur:21s;--del:14s">E = (R₁+R₃)I₁ − R₃I₂</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan {PERTEMUAN} &nbsp;·&nbsp; Teknik Tenaga Listrik &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Daya pada</span><br>
      <em>Jaringan DC</em><br>
      <span class="hl-amber">Dua Sumber atau Lebih</span>
    </h1>
    <p class="hero-sub">Begitu ada dua sumber, reduksi seri–paralel tidak lagi cukup: arus tiap sumber, arah alirannya, dan siapa memikul beban harus dicari dari persamaan simultan. Modul ini membangun empat alat yang dipakai seumur hidup insinyur: analisis mesh dan nodal, superposisi, ekuivalen Thevenin–Norton, dan pembagian beban pada sumber paralel, langsung pada kasus baterai, alternator, dan generator DC yang bekerja bersama.</p>
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

    # 01 — sumber seri
    isi = figure(1, "Dua sumber seri: menguatkan dan melawan", f"Sumber {ind(E1S, 0)} V dan {ind(E2S, 1)} V dalam satu loop beresistansi {ind(RS, 0)} Ω: bila polaritasnya searah, ggl dijumlahkan; bila berlawanan, dikurangkan dan arus mengikuti ggl yang lebih besar.", gambar1())
    isi += formula(1, "KVL dengan Beberapa Ggl dalam Satu Loop", r"\sum E_k = I \sum R_k \qquad (E_k \text{ bertanda: + searah lintasan, − berlawanan})",
                   rf"Aiding: \(I = ({ind(E1S, 0)} + {ind(E2S, 1)})/{ind(RS, 0)} = {ind(I_AID, 3)}\) A. Opposing: \(I = ({ind(E1S, 0)} - {ind(E2S, 1)})/{ind(RS, 0)} = {ind(I_OPP, 3)}\) A, searah \(E_1\). Pada kasus kedua, arus <em>masuk</em> ke kutub positif \(E_2\): sumber itu menyerap daya, persis seperti baterai yang sedang diisi.",
                   "Tanda ggl ditentukan oleh arah kita menelusuri loop, bukan oleh nilai ggl. Hasil arus negatif berarti arah sebenarnya berlawanan dengan arah telusur; tidak ada yang salah, cukup dibalik. Inilah konvensi yang dipakai semua metode di modul ini.",
                   [("E_k", "Ggl ke-k dalam loop (V)"), ("R_k", "Resistansi ke-k, termasuk hambatan dalam sumber (Ω)"), ("I", "Arus loop (A)")])
    isi += formula(2, "Daya Tiap Sumber dan Neraca Daya", r"P_k = E_k\,I_k \quad (>0 \text{ membangkitkan}, <0 \text{ menyerap}), \qquad \sum E_k I_k = \sum I_k^2 R_k",
                   rf"Opposing di atas: \(P_1 = {ind(E1S, 0)}\times{ind(I_OPP, 3)} = {ind(E1S * I_OPP, 3)}\) W dibangkitkan, \(P_2 = -{ind(E2S, 1)}\times{ind(I_OPP, 3)} = -{ind(E2S * I_OPP, 3)}\) W diserap, dan resistor membuang \(I^2R = {ind(I_OPP ** 2 * RS, 3)}\) W. Neraca: \({ind(E1S * I_OPP, 3)} - {ind(E2S * I_OPP, 3)} = {ind(I_OPP ** 2 * RS, 3)}\) W ✓.",
                   "Pada jaringan banyak sumber, tanda daya tiap sumber adalah informasi rekayasa yang penting: ia memberi tahu sumber mana yang bekerja dan mana yang justru menjadi beban. Neraca daya adalah pemeriksaan wajib setiap hasil hitung.",
                   [("P_k", "Daya sumber ke-k (W)"), ("I_k", "Arus keluar dari kutub positif sumber ke-k (A)")])
    isi += cards([
        ("🔋", "Sel Seri", "Baterai 12 V adalah enam sel 2 V seri aiding; paket EV 400 V adalah ±100 sel Li-ion seri. Satu sel yang terbalik atau mati berarti ggl-nya melawan dan tegangan paket anjlok.", r"\(E = \sum E_k\)"),
        ("🔌", "Pengisian Baterai", "Pengisi daya (ggl lebih tinggi) melawan ggl baterai; arus pengisian \\((E_c - E_b)/(r_c + r_b)\\). Baterai menyerap daya \\(E_b I\\) dan membuang \\(I^2 r_b\\) sebagai panas.", r"\(I = \dfrac{E_c - E_b}{r_c + r_b}\)"),
        ("⚙️", "Motor DC sebagai Ggl Lawan", "Motor DC yang berputar membangkitkan ggl lawan \\(E_b\\) melawan sumbernya; arus jangkar \\((V - E_b)/R_a\\). Saat start \\(E_b = 0\\) dan arusnya sangat besar.", r"\(I_a = \dfrac{V - E_b}{R_a}\)"),
        ("🧭", "Konvensi Tanda", "Tetapkan arah telusur loop; ggl yang dilewati dari − ke + bertanda +, resistor searah arus bertanda −IR. Konsisten lebih penting daripada 'benar' di awal.", None),
        ("⚖️", "Neraca Daya", "Jumlah daya yang dibangkitkan sumber (bertanda) harus sama dengan jumlah \\(I^2R\\). Selisih sekecil apa pun berarti ada tanda yang salah.", r"\(\sum E_k I_k = \sum I_k^2 R_k\)"),
        ("⚠️", "Ggl Sama, Loop Tertutup", "Dua baterai identik dihubungkan melawan: ggl total nol, tidak ada arus. Sedikit saja selisih ggl, arus mengalir hanya dibatasi hambatan dalam, sangat besar. Dasar bahaya di Bagian 06.", None),
    ], [("E_c, E_b", "Ggl pengisi daya dan baterai (V)"), ("r_c, r_b", "Hambatan dalam pengisi dan baterai (Ω)"), ("E_b", "Ggl lawan motor (V)"), ("R_a", "Resistansi jangkar (Ω)")])
    isi += tabel(["Susunan dua sumber", "Ggl efektif", "Arus pada R = 4 Ω", "Daya E₁", "Daya E₂", "Daya R"], [
        [f"{ind(E1S, 0)} V + {ind(E2S, 1)} V aiding", f"{ind(E1S + E2S, 1)} V", f"{ind(I_AID, 3)} A", f"{ind(E1S * I_AID, 2)} W", f"{ind(E2S * I_AID, 2)} W", f"{ind(I_AID ** 2 * RS, 2)} W"],
        [f"{ind(E1S, 0)} V − {ind(E2S, 1)} V opposing", f"{ind(E1S - E2S, 1)} V", f"{ind(I_OPP, 3)} A", f"{ind(E1S * I_OPP, 2)} W", f"−{ind(E2S * I_OPP, 2)} W (diserap)", f"{ind(I_OPP ** 2 * RS, 2)} W"],
        ["12 V − 12 V opposing", "0 V", "0 A", "0 W", "0 W", "0 W"],
        ["Pengisi 14,4 V − baterai 12,6 V, r total 0,15 Ω", "1,8 V", "12 A", "172,8 W", "−151,2 W (diisi)", "21,6 W (panas)"],
    ])
    isi += kotak("info-box", "<strong>📜 Sedikit Sejarah:</strong> Gustav Kirchhoff merumuskan hukum arus dan tegangannya pada 1845 ketika masih mahasiswa di Königsberg; James Clerk Maxwell kemudian memperkenalkan 'arus siklik' (yang kini disebut arus mesh) pada 1873 untuk menyusun persamaan Kirchhoff secara sistematis. Léon Charles Thévenin (1883) dan Edward Lawry Norton (1926) menyumbangkan dua teorema ekuivalen yang mengubah jaringan serumit apa pun menjadi satu sumber dan satu resistor: alat yang dipakai setiap hari untuk menghitung arus hubung singkat dan memilih pengaman pada sistem tenaga.")
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 01 mengulang KVL untuk loop bergantung banyak ggl. Bagian 02–03 adalah dua metode umum, mesh dan nodal, yang menyelesaikan jaringan apa pun; Bagian 04–05 adalah tiga teorema yang menyederhanakannya: superposisi, Thevenin, dan Norton. Bagian 06 menerapkan semuanya pada persoalan tenaga yang paling sering muncul: sumber-sumber DC yang bekerja paralel. Animasi (07) dan Python (08) memakai jaringan contoh yang sama.")
    m += bagian(1, "m-seri", "Dua Ggl dalam<br>Satu Loop",
                "Modul 3 menyelesaikan jaringan satu sumber dengan reduksi seri–paralel. Begitu ada sumber kedua, muncul pertanyaan baru: ke mana arus mengalir, sumber mana yang membangkitkan dan mana yang menyerap, dan berapa bagian beban yang dipikul masing-masing. Semuanya dijawab oleh KVL yang sama, hanya dengan disiplin tanda yang lebih ketat, pada Persamaan (1) dan (2). Gambar 1 memperlihatkan dua susunan paling sederhana.",
                isi, "DUA GGL SATU LOOP")

    # 02 — mesh
    isi = figure(2, "Jaringan dua loop dan arus mesh", f"Loop kiri berisi E₁ = {ind(E1M, 0)} V dan R₁ = {ind(R1M, 0)} Ω, loop kanan E₂ = {ind(E2M, 0)} V dan R₂ = {ind(R2M, 0)} Ω; R₃ = {ind(R3M, 0)} Ω dimiliki bersama. Kedua ggl mendorong arus searah jarum jam di loopnya, sehingga pada R₃ keduanya berlawanan.", gambar2())
    isi += formula(3, "Persamaan Mesh (Arus Loop)", r"\begin{aligned} E_1 &= (R_1 + R_3)\,I_1 - R_3\,I_2 \\ E_2 &= (R_2 + R_3)\,I_2 - R_3\,I_1 \end{aligned} \qquad I_{R3} = I_1 - I_2",
                   rf"Gambar 2: \({ind(E1M, 0)} = {ind(R1M + R3M, 0)}I_1 - {ind(R3M, 0)}I_2\) dan \({ind(E2M, 0)} = {ind(R2M + R3M, 0)}I_2 - {ind(R3M, 0)}I_1\). Determinan \({ind(R1M + R3M, 0)}\times{ind(R2M + R3M, 0)} - {ind(R3M, 0)}^2 = {ind(DET_M, 0)}\); \(I_1 = {ind(I1M, 4)}\) A, \(I_2 = {ind(I2M, 4)}\) A; arus R₃ = \({ind(I3M, 4)}\) A ke bawah, \(P_{{R3}} = {ind(I3M, 4)}^2\times{ind(R3M, 0)} = {ind(P3M, 3)}\) W.",
                   "Aturan cepat menyusun tiap baris: koefisien diagonal = jumlah resistansi di loop itu; koefisien silang = −(resistansi bersama); ruas kanan = jumlah ggl bertanda searah arus loop. Bila E₂ dipasang terbalik (mendorong berlawanan jarum jam), ruas kanannya menjadi −E₂ dan kedua ggl bekerja sama pada R₃. Jumlah persamaan = jumlah loop bebas, sehingga metode ini sangat cocok untuk jaringan dengan sedikit loop tetapi banyak simpul.",
                   [("I_1, I_2", "Arus loop (mesh), searah jarum jam (A)"), ("R_3", "Resistor bersama dua loop (Ω)"), ("I_{R3}", "Arus sebenarnya melalui R₃ (A)"), ("E_1, E_2", "Ggl tiap loop, bertanda (V)")])
    isi += cards([
        ("🔁", "Arus Loop Itu Fiksi Berguna", "Arus mesh bukan arus yang terukur di semua cabang; pada cabang bersama arus sebenarnya adalah selisih (atau jumlah) dua arus loop. Setelah sistem terpecahkan, semua arus cabang mengikuti.", r"\(I_{cabang} = I_a - I_b\)"),
        ("🧮", "Matriks Resistansi", "Bentuk umum \\(\\mathbf{R}\\,\\mathbf{I} = \\mathbf{E}\\): matriks simetris, diagonal positif, luar-diagonal negatif. Python (Cell 2) menyelesaikannya dengan satu baris <code>np.linalg.solve</code>.", r"\(\mathbf{R}\,\mathbf{I} = \mathbf{E}\)"),
        ("📐", "Cramer untuk Dua Loop", "Dua persamaan dua variabel: \\(I_1 = (E_1 a_{22} - a_{12}E_2)/\\Delta\\), \\(\\Delta = a_{11}a_{22} - a_{12}a_{21}\\). Cukup untuk soal C11 dan sebagian besar kasus praktis.", None),
        ("⚡", "Sumber Arus", "Sumber arus di cabang luar langsung menetapkan arus loop itu; di cabang bersama diperlukan 'supermesh'. Modul ini berfokus pada sumber tegangan; sumber arus diperkenalkan pada Norton (Bagian 05).", None),
        ("🚗", "Penerapan", "Sistem kelistrikan kendaraan (alternator + baterai + beban), pengisi daya dengan baterai, dan jembatan Wheatstone pada sensor: semuanya jaringan berloop dua–tiga yang tidak dapat direduksi seri–paralel.", None),
        ("✅", "Pemeriksaan", "Setelah menemukan arus loop, hitung daya tiap sumber (bertanda) dan jumlah \\(I^2R\\); keduanya harus sama. Lalu periksa satu KVL pada loop luar.", None),
    ])
    isi += tabel(["Besaran (Gambar 2)", "Rumus", "Nilai"], [
        ["Arus loop 1", "(E₁·a₂₂ + R₃·E₂)/Δ", f"{ind(I1M, 4)} A"],
        ["Arus loop 2", "(a₁₁·E₂ + R₃·E₁)/Δ", f"{ind(I2M, 4)} A"],
        ["Arus R₃ (ke bawah)", "I₁ − I₂", f"{ind(I3M, 4)} A"],
        ["Daya R₁, R₂, R₃", "I²R", f"{ind(I1M ** 2 * R1M, 3)}, {ind(I2M ** 2 * R2M, 3)}, {ind(P3M, 3)} W"],
        ["Daya E₁, E₂", "E·I loop", f"{ind(E1M * I1M, 3)}, {ind(E2M * I2M, 3)} W"],
        ["<strong>Neraca</strong>", "ΣEI = ΣI²R", f"<strong>{ind(E1M * I1M + E2M * I2M, 3)} = {ind(I1M ** 2 * R1M + I2M ** 2 * R2M + P3M, 3)} W</strong>"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> kedua sumber membangkitkan daya positif walau keduanya melawan pada R₃, karena masing-masing tetap mendorong arus keluar dari kutub positifnya. Neraca daya yang tepat sama adalah bukti bahwa tanda dan aljabarnya benar. Soal C11 memakai topologi ini persis dengan angka dari NIM Anda.")
    m += bagian(2, "m-mesh", "Analisis Mesh:<br>KVL per Loop",
                "Analisis mesh menuliskan KVL untuk setiap loop bebas dengan arus loop sebagai variabel. Karena arus loop otomatis memenuhi KCL di setiap simpul, yang tersisa hanyalah sistem persamaan linear sebanyak jumlah loop. Persamaan (3) memberi bentuknya untuk jaringan dua loop pada Gambar 2, dan aturan penyusunannya berlaku untuk berapa pun jumlah loop.",
                isi, "ANALISIS MESH")

    # 03 — nodal
    isi = figure(3, "Analisis nodal jaringan dua sumber", f"E₁ = {ind(E1N, 0)} V melalui R₁ = {ind(R1N, 0)} Ω dan E₂ = {ind(E2N, 0)} V melalui R₂ = {ind(R2N, 0)} Ω bertemu di simpul A; beban R₃ = {ind(R3N, 0)} Ω ke referensi. Satu tegangan tak diketahui, satu persamaan KCL.", gambar3())
    isi += formula(4, "Tegangan Simpul (KCL di Simpul Bersama)", r"\dfrac{E_1 - V}{R_1} + \dfrac{E_2 - V}{R_2} = \dfrac{V}{R_3} \quad\Rightarrow\quad V = \dfrac{E_1/R_1 + E_2/R_2}{1/R_1 + 1/R_2 + 1/R_3}",
                   rf"Gambar 3: \(V = ({ind(E1N, 0)}/{ind(R1N, 0)} + {ind(E2N, 0)}/{ind(R2N, 0)})/(1/{ind(R1N, 0)} + 1/{ind(R2N, 0)} + 1/{ind(R3N, 0)}) = {ind(E1N / R1N + E2N / R2N, 2)}/{ind(G_N, 2)} = {ind(V_N, 4)}\) V. Rumus ini adalah rata-rata ggl <em>berbobot konduktansi</em>: sumber yang ber-R kecil 'menarik' tegangan simpul mendekati ggl-nya.",
                   "Analisis nodal memilih tegangan simpul sebagai variabel dan menulis KCL di tiap simpul selain referensi. Untuk jaringan sumber paralel (Bagian 06) hanya ada satu simpul tak diketahui, apa pun jumlah sumbernya: itulah sebabnya nodal menjadi metode baku untuk rel DC, bank baterai, dan generator paralel.",
                   [("V", "Tegangan simpul terhadap referensi (V)"), ("E_k", "Ggl cabang ke-k (V)"), ("R_k", "Resistansi cabang ke-k, termasuk hambatan dalam (Ω)")])
    isi += formula(5, "Arus Cabang dari Tegangan Simpul", r"I_k = \dfrac{E_k - V}{R_k} \;(\text{cabang bersumber}), \qquad I_3 = \dfrac{V}{R_3}, \qquad \sum_k I_k = I_3",
                   rf"\(I_1 = ({ind(E1N, 0)} - {ind(V_N, 4)})/{ind(R1N, 0)} = {ind(I1N, 4)}\) A, \(I_2 = ({ind(E2N, 0)} - {ind(V_N, 4)})/{ind(R2N, 0)} = {ind(I2N, 4)}\) A, \(I_3 = {ind(V_N, 4)}/{ind(R3N, 0)} = {ind(I3N, 4)}\) A; \(I_1 + I_2 = {ind(I1N + I2N, 4)}\) A ✓. Bila \(E_2 < V\), \(I_2\) negatif: sumber 2 sedang diisi oleh sumber 1.",
                   "Tanda arus cabang langsung memberi tahu peran tiap sumber. Pada sistem tenaga, syarat sebuah sumber ikut memikul beban sederhana: ggl-nya harus lebih tinggi daripada tegangan rel. Sumber yang ggl-nya di bawah tegangan rel menjadi beban.",
                   [("I_k", "Arus keluar dari sumber ke-k (A)"), ("I_3", "Arus beban (A)")])
    isi += cards([
        ("🔵", "Pilih Referensi", "Simpul referensi (0 V) biasanya rel negatif atau badan kendaraan. Semua tegangan simpul diukur terhadapnya; memilih referensi yang tersambung ke banyak cabang mengurangi jumlah persamaan.", None),
        ("🧮", "Matriks Konduktansi", "Bentuk umum \\(\\mathbf{G}\\,\\mathbf{V} = \\mathbf{I}\\): diagonal = jumlah konduktansi yang menyentuh simpul, luar-diagonal = −konduktansi antar simpul, ruas kanan = arus sumber yang disuntikkan (\\(E_k/R_k\\)).", r"\(\mathbf{G}\,\mathbf{V} = \mathbf{I}\)"),
        ("🔄", "Mesh atau Nodal?", "Hitung jumlah loop bebas dan jumlah simpul selain referensi; pilih yang lebih sedikit. Sumber paralel: nodal (1 persamaan). Rangkaian tangga panjang: sering mesh.", None),
        ("⚡", "Sumber Tegangan Tanpa Resistansi", "Sumber ideal langsung ke dua simpul menetapkan selisih tegangannya; ia butuh 'supernode'. Pada sistem tenaga selalu ada hambatan dalam, jadi bentuk Persamaan (4) hampir selalu cukup.", None),
        ("🔋", "Rel DC Kendaraan", "Alternator, baterai, dan beban bertemu pada satu simpul: tegangan rel dari Persamaan (4) menentukan apakah baterai diisi atau dikosongkan pada tiap kondisi mesin.", None),
        ("✅", "Pemeriksaan", "Jumlah arus masuk simpul harus sama dengan arus beban, dan daya tiap sumber (E·I) dijumlahkan harus sama dengan Σ I²R. Dua pemeriksaan ini menangkap hampir semua salah tanda.", None),
    ])
    isi += tabel(["E₂ (V) pada Gambar 3", "V simpul (V)", "I₁ (A)", "I₂ (A)", "I₃ (A)", "Peran sumber 2"],
                 [[f"{e2:g}", ind((E1N / R1N + e2 / R2N) / G_N, 3), ind((E1N - (E1N / R1N + e2 / R2N) / G_N) / R1N, 3), ind((e2 - (E1N / R1N + e2 / R2N) / G_N) / R2N, 3), ind((E1N / R1N + e2 / R2N) / G_N / R3N, 3),
                   "diisi (menyerap)" if e2 < (E1N / R1N + e2 / R2N) / G_N else "memasok"] for e2 in [6, 9, 11, 14, 18]])
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> dengan E₁ tetap {ind(E1N, 0)} V, sumber 2 baru ikut memasok bila ggl-nya melampaui tegangan simpul; pada 6 V dan 9 V ia justru menyerap arus dari sumber 1. Perhatikan bahwa arus beban I₃ naik lambat walau E₂ dinaikkan banyak, karena R₂ = {ind(R2N, 0)} Ω membatasi sumbangannya. Soal C3, C4, dan C9 memakai bentuk Persamaan (4)–(5).")
    m += bagian(3, "m-nodal", "Analisis Nodal:<br>KCL per Simpul",
                "Analisis nodal adalah cerminan mesh: variabelnya tegangan simpul, persamaannya KCL. Untuk jaringan sumber-sumber yang bertemu di satu rel, cukup satu persamaan berapa pun jumlah sumbernya, sehingga metode ini menjadi bahasa alami sistem tenaga DC: bank baterai, alternator dengan baterai, dan generator paralel. Persamaan (4) memberi tegangan simpul dan Persamaan (5) arus tiap cabang; Gambar 3 memberi contoh yang dipakai lagi di Bagian 04 dan Animasi 1.",
                isi, "ANALISIS NODAL")

    # 04 — superposisi
    isi = figure(4, "Superposisi: satu sumber aktif pada satu waktu, lalu dijumlahkan", f"Jaringan Gambar 3 dipecah menjadi dua: hanya E₁ (E₂ diganti kawat) memberi I₃′ = {ind(I3_S1, 3)} A; hanya E₂ memberi I₃″ = {ind(I3_S2, 3)} A; jumlahnya {ind(I3N, 3)} A, sama dengan hasil nodal.", gambar4())
    isi += formula(6, "Teorema Superposisi", r"I = \sum_{k} I^{(k)}, \qquad I^{(k)} = \text{respons saat hanya sumber } k \text{ aktif (sumber tegangan lain} \to \text{hubung singkat, sumber arus lain} \to \text{terbuka)}",
                   rf"E₁ saja: \(V' = (E_1/R_1)/(1/R_1 + 1/R_2 + 1/R_3) = {ind(V_S1, 4)}\) V, \(I_3' = {ind(I3_S1, 4)}\) A. E₂ saja: \(V'' = {ind(V_S2, 4)}\) V, \(I_3'' = {ind(I3_S2, 4)}\) A. Jumlah \(I_3 = {ind(I3N, 4)}\) A ✓. Tetapi daya: \(I_3^2R_3 = {ind(I3N ** 2 * R3N, 3)}\) W, sedangkan \(I_3'^2R_3 + I_3''^2R_3 = {ind(I3_S1 ** 2 * R3N + I3_S2 ** 2 * R3N, 3)}\) W: berbeda, karena daya bukan fungsi linear.",
                   "Superposisi berlaku karena hukum Ohm dan Kirchhoff linear: respons terhadap jumlah penyebab sama dengan jumlah respons. Ia hanya boleh dipakai untuk arus dan tegangan, tidak untuk daya, dan tidak pada elemen tak linear (dioda, inti besi jenuh). Kegunaan terbesarnya bukan menghitung, melainkan <em>memahami</em>: berapa sumbangan tiap sumber, dan apa yang terjadi bila satu sumber hilang.",
                   [("I^{(k)}", "Kontribusi sumber ke-k saja (A)"), ("V', V''", "Tegangan simpul saat hanya E₁ atau E₂ aktif (V)")])
    isi += cards([
        ("🔕", "Mematikan Sumber", "Sumber tegangan dimatikan = ggl 0 V = kawat (hubung singkat); hambatan dalamnya <em>tetap</em> ada. Sumber arus dimatikan = 0 A = rangkaian terbuka. Ini kesalahan paling sering pada ujian.", None),
        ("➕", "Linear Saja", "Arus dan tegangan boleh dijumlahkan; daya tidak, karena \\(P \\propto I^2\\) dan \\((a+b)^2 \\ne a^2 + b^2\\). Hitung daya dari arus total.", r"\((I' + I'')^2 \ne I'^2 + I''^2\)"),
        ("🔍", "Analisis Sensitivitas", "Berapa arus beban bila alternator mati? Berapa bila baterai dilepas? Superposisi menjawab dengan hasil yang sudah ada, tanpa menghitung ulang seluruh jaringan.", None),
        ("🌊", "AC dan DC Bersamaan", "Pada Modul 5 dan seterusnya, superposisi memisahkan komponen DC dan AC (riak) pada catu daya, atau frekuensi berbeda pada jaringan yang sama; masing-masing dihitung sendiri lalu dijumlahkan.", None),
        ("⚠️", "Bukan Selalu Lebih Cepat", "Untuk n sumber diperlukan n perhitungan penuh; nodal sering lebih singkat. Pakailah superposisi saat sumbangan tiap sumber memang yang ditanyakan (soal C13).", None),
        ("🧪", "Uji Laboratorium", "Superposisi dapat diverifikasi langsung: lepas satu sumber, ganti dengan kawat, ukur arus; ulangi untuk sumber lain; jumlahkan dan bandingkan dengan pengukuran lengkap.", None),
    ])
    isi += tabel(["Besaran (Gambar 4)", "Hanya E₁", "Hanya E₂", "Jumlah", "Nodal langsung"], [
        ["V simpul (V)", ind(V_S1, 4), ind(V_S2, 4), ind(V_S1 + V_S2, 4), ind(V_N, 4)],
        ["I₁ (A)", ind((E1N - V_S1) / R1N, 4), ind((0 - V_S2) / R1N, 4), ind((E1N - V_S1) / R1N + (0 - V_S2) / R1N, 4), ind(I1N, 4)],
        ["I₂ (A)", ind((0 - V_S1) / R2N, 4), ind((E2N - V_S2) / R2N, 4), ind((0 - V_S1) / R2N + (E2N - V_S2) / R2N, 4), ind(I2N, 4)],
        ["I₃ (A)", ind(I3_S1, 4), ind(I3_S2, 4), ind(I3_S1 + I3_S2, 4), ind(I3N, 4)],
        ["P pada R₃ (W)", ind(I3_S1 ** 2 * R3N, 4), ind(I3_S2 ** 2 * R3N, 4), f"<span style=\"color:var(--pink)\">{ind(I3_S1 ** 2 * R3N + I3_S2 ** 2 * R3N, 4)} ✗</span>", f"<strong>{ind(I3N ** 2 * R3N, 4)}</strong>"],
    ])
    isi += kotak("info-box", "<strong>📊 Cara Membaca Tabel di Atas:</strong> empat baris pertama dijumlahkan dengan tepat; baris daya tidak. Perhatikan juga bahwa saat hanya E₁ aktif, arus I₂ negatif: sumber 2 yang 'mati' (kawat) menjadi jalur balik bagi arus E₁. Inilah alasan hambatan dalam sumber yang dimatikan tetap harus dipertahankan dalam rangkaian.")
    m += bagian(4, "m-superposisi", "Teorema<br>Superposisi",
                "Karena seluruh hukum jaringan resistif linear, respons terhadap beberapa sumber sama dengan jumlah respons terhadap masing-masing sumber sendirian. Teorema superposisi pada Persamaan (6) mengubah satu persoalan banyak sumber menjadi beberapa persoalan satu sumber yang sudah dikuasai di Modul 3, dan memberi sesuatu yang tidak diberikan mesh maupun nodal: sumbangan tiap sumber secara terpisah. Gambar 4 memperlihatkan pemecahannya untuk jaringan Gambar 3.",
                isi, "SUPERPOSISI")

    # 05 — thevenin norton
    isi = figure(5, "Dari jaringan asli ke ekuivalen Thevenin dan Norton", f"Sumber {ind(ET, 0)} V dengan pembagi R₁ = R₂ = {ind(R1T, 0)} Ω dan R₃ = {ind(R3T, 0)} Ω menuju terminal a–b diringkas menjadi V_th = {ind(VTH, 0)} V seri R_th = {ind(RTH, 0)} Ω, atau I_N = {ind(IN_, 0)} A paralel R_N = {ind(RTH, 0)} Ω. Beban apa pun di a–b melihat rangkaian yang sama.", gambar5())
    isi += formula(7, "Ekuivalen Thevenin", r"V_{th} = V_{ab}\big|_{\text{terbuka}}, \qquad R_{th} = R_{ab}\big|_{\text{semua sumber bebas dimatikan}}",
                   rf"Gambar 5: terbuka, tidak ada arus di R₃, jadi \(V_{{th}} = {ind(ET, 0)}\times{ind(R2T, 0)}/({ind(R1T, 0)}+{ind(R2T, 0)}) = {ind(VTH, 0)}\) V. Sumber dihubung singkat: dari a–b terlihat \(R_3\) seri \((R_1 \parallel R_2)\), \(R_{{th}} = {ind(R3T, 0)} + {ind(R1T * R2T / (R1T + R2T), 0)} = {ind(RTH, 0)}\) Ω. Beban 6 Ω di a–b: \(I = {ind(VTH, 0)}/({ind(RTH, 0)}+6) = {ind(VTH / (RTH + 6), 3)}\) A, tanpa perlu menghitung ulang seluruh jaringan.",
                   "Thevenin adalah 'sudut pandang beban': apa pun di balik dua terminal, beban hanya merasakan satu ggl dan satu resistansi seri. Pada sistem tenaga, V_th adalah tegangan tanpa beban dan R_th adalah 'kekuatan' sumber: makin kecil R_th, makin kaku tegangannya dan makin besar arus hubung singkatnya. Ekuivalen untuk jaringan dengan sumber tak bebas memerlukan cara lain (sumber uji), di luar modul ini.",
                   [("V_{th}", "Tegangan Thevenin = tegangan terminal terbuka (V)"), ("R_{th}", "Resistansi Thevenin dilihat dari terminal (Ω)"), ("V_{ab}", "Tegangan terminal a terhadap b (V)")])
    isi += formula(8, "Ekuivalen Norton dan Transfer Daya Maksimum", r"I_N = \dfrac{V_{th}}{R_{th}} = I_{ab}\big|_{\text{hubung singkat}}, \qquad R_N = R_{th}, \qquad P_{L,maks} = \dfrac{V_{th}^2}{4R_{th}}\ \text{ saat } R_L = R_{th}",
                   rf"\(I_N = {ind(VTH, 0)}/{ind(RTH, 0)} = {ind(IN_, 0)}\) A, dan bila terminal a–b dihubung singkat pada jaringan asli memang mengalir {ind(IN_, 0)} A. Daya maksimum ke beban: \({ind(VTH, 0)}^2/(4\times{ind(RTH, 0)}) = {ind(PMAKS, 0)}\) W pada \(R_L = {ind(RTH, 0)}\) Ω. Kurvanya ada di Animasi 3.",
                   "Norton adalah Thevenin yang ditulis sebagai sumber arus; keduanya saling dikonversi dengan hukum Ohm. Arus Norton adalah arus hubung singkat: angka yang dipakai untuk memilih sekring dan pemutus. Teorema transfer daya maksimum Modul 3 kini berlaku untuk jaringan apa pun, cukup dengan mengganti E dan r menjadi V_th dan R_th.",
                   [("I_N", "Arus Norton = arus hubung singkat terminal (A)"), ("R_N", "Resistansi Norton = R_th (Ω)"), ("P_{L,maks}", "Daya maksimum yang dapat diserap beban (W)"), ("R_L", "Resistansi beban (Ω)")])
    isi += cards([
        ("🎯", "Kapan Dipakai", "Saat satu bagian rangkaian (beban) akan diubah-ubah sementara sisanya tetap: hitung Thevenin sekali, lalu setiap beban baru cukup satu pembagi tegangan.", None),
        ("⚡", "Arus Hubung Singkat", "\\(I_{sc} = V_{th}/R_{th}\\) pada titik mana pun di jaringan menentukan kapasitas pemutus dan ukuran kabel yang tahan sampai pengaman bekerja. Pada bank baterai besar, ribuan ampere.", r"\(I_{sc} = V_{th}/R_{th}\)"),
        ("📏", "Mengukur di Lapangan", "V_th = tegangan terminal tanpa beban; R_th = (V_th − V_beban)/I_beban dari satu pengukuran berbeban. Cara yang sama dengan mengukur hambatan dalam baterai di Modul 3.", r"\(R_{th} = \dfrac{V_{th} - V_L}{I_L}\)"),
        ("🔁", "Konversi Sumber", "Sumber tegangan V seri R ⇔ sumber arus V/R paralel R. Konversi berulang sering meruntuhkan jaringan bertingkat tanpa menulis satu pun persamaan simultan.", None),
        ("🔋", "Sumber Paralel = Satu Thevenin", "Beberapa sumber paralel dengan hambatan dalamnya dapat diganti satu \\(E_{eq}\\) seri \\(r_{eq}\\) (Bagian 06); beban lalu dihitung seperti sumber tunggal. Soal C15.", None),
        ("⚠️", "Hanya Untuk Terminal Itu", "Ekuivalen Thevenin benar untuk arus dan tegangan di terminal a–b saja; daya yang 'hilang' di R_th bukan daya rugi nyata jaringan asli.", None),
    ])
    isi += tabel(["R_L pada a–b (Ω)", "I (A)", "V_ab (V)", "P_L (W)", "Efisiensi V_ab/V_th"],
                 [[f"{RL:g}", ind(VTH / (RTH + RL), 3), ind(VTH * RL / (RTH + RL), 3), ind(p_thev(RL), 3), ind(RL / (RTH + RL) * 100, 1) + "%"] for RL in [2, 6, 12, 24, 60]])
    isi += kotak("tip-box", f"💡 <strong>Membaca Tabel di Atas:</strong> daya beban memuncak {ind(PMAKS, 0)} W tepat di R_L = R_th = {ind(RTH, 0)} Ω, tetapi efisiensinya 50%; pada 60 Ω efisiensi 91% walau daya tinggal {ind(p_thev(60), 2)} W. Soal C5–C7 meminta V_th, R_th, dan I_N; soal C12 melanjutkannya sampai daya maksimum.")
    m += bagian(5, "m-thevenin", "Teorema Thevenin<br>dan Norton",
                "Dari sudut pandang sebuah beban, jaringan di belakang dua terminalnya, seberapa pun rumitnya, berperilaku seperti satu ggl dengan satu resistansi seri. Itulah teorema Thevenin pada Persamaan (7); bentuk kembarnya dengan sumber arus adalah Norton pada Persamaan (8), yang sekaligus memperluas teorema transfer daya maksimum ke jaringan apa pun. Gambar 5 memperlihatkan ketiga wajah rangkaian yang sama.",
                isi, "THEVENIN DAN NORTON")

    # 06 — sumber paralel
    isi = figure(6, "Dua baterai paralel memasok satu beban", f"B1 ({ind(E1P, 1)} V, r = {ind(R1P, 2)} Ω) dan B2 ({ind(E2P, 1)} V, r = {ind(R2P, 2)} Ω) memasok beban {ind(RLP, 1)} Ω: tegangan rel {ind(V_P, 3)} V, B1 memikul {ind(I1P, 2)} A dan B2 hanya {ind(I2P, 2)} A. Tanpa beban, selisih ggl tetap memutar arus {ind(I_SIRK, 2)} A di antara keduanya.", gambar6())
    isi += formula(9, "Sumber Paralel: Ekuivalen Thevenin dan Pembagian Beban", r"E_{eq} = \dfrac{\sum E_k/r_k}{\sum 1/r_k}, \qquad r_{eq} = \dfrac{1}{\sum 1/r_k}, \qquad I_k = \dfrac{E_k - V}{r_k},\quad V = E_{eq}\dfrac{R_L}{r_{eq} + R_L}",
                   rf"Gambar 6: \(E_{{eq}} = ({ind(E1P, 1)}/{ind(R1P, 2)} + {ind(E2P, 1)}/{ind(R2P, 2)})/(1/{ind(R1P, 2)} + 1/{ind(R2P, 2)}) = {ind((E1P / R1P + E2P / R2P) / (1 / R1P + 1 / R2P), 4)}\) V, \(r_{{eq}} = {ind(R1P * R2P / (R1P + R2P), 4)}\) Ω; \(V = {ind(V_P, 4)}\) V; \(I_1 = {ind(I1P, 3)}\) A, \(I_2 = {ind(I2P, 3)}\) A, \(I_L = {ind(ILP, 3)}\) A. Untuk ggl sama, \(I_k \propto 1/r_k\): sumber ber-r kecil memikul lebih banyak.",
                   "Ini Persamaan (4) yang ditulis untuk rel: tegangan rel adalah rata-rata ggl berbobot konduktansi, dan tiap sumber memberi arus sebanding selisih ggl-nya terhadap tegangan rel dibagi hambatan dalamnya. Dua hal menentukan pembagian beban: ggl (siapa yang 'lebih tinggi') dan hambatan dalam (siapa yang 'lebih kuat'). Pada generator DC paralel, ggl diatur lewat eksitasi medan untuk membagi beban dengan adil; pada baterai, kesesuaian ggl dan r ditentukan kimia dan umurnya.",
                   [("E_{eq}, r_{eq}", "Ggl dan hambatan dalam ekuivalen gabungan (V, Ω)"), ("E_k, r_k", "Ggl dan hambatan dalam sumber ke-k"), ("V", "Tegangan rel (V)"), ("I_k", "Arus sumber ke-k, negatif bila diisi (A)"), ("R_L", "Resistansi beban (Ω)")])
    isi += formula(10, "Arus Sirkulasi Tanpa Beban", r"I_{sirk} = \dfrac{E_1 - E_2}{r_1 + r_2}, \qquad P_{rugi} = I_{sirk}^2\,(r_1 + r_2)",
                   rf"Gambar 6 dengan beban dilepas: \(I_{{sirk}} = ({ind(E1P, 1)} - {ind(E2P, 1)})/({ind(R1P, 2)} + {ind(R2P, 2)}) = {ind(I_SIRK, 3)}\) A memutar terus-menerus dari B1 ke B2, membuang \({ind(P_SIRK, 2)}\) W dan mengosongkan B1 sambil mengisi paksa B2. Selisih ggl hanya {ind(E1P - E2P, 1)} V, tetapi hambatan dalamnya kecil.",
                   "Arus sirkulasi adalah harga yang dibayar untuk memaralel sumber yang tidak sama. Aturan praktis: paralel hanya baterai yang sama jenis, kapasitas, umur, dan keadaan muatannya; untuk generator, samakan tegangan sebelum menutup saklar paralel (Modul 12 membahasnya untuk generator AC, dengan syarat tambahan frekuensi dan fasa). Dioda pemisah (isolator) atau pengendali muatan memutus jalur sirkulasi pada sistem yang sumbernya memang berbeda.",
                   [("I_{sirk}", "Arus antar-sumber tanpa beban (A)"), ("E_1 - E_2", "Selisih ggl (V)"), ("r_1 + r_2", "Jumlah hambatan dalam, satu-satunya pembatas (Ω)")])
    isi += cards([
        ("🔋", "Bank Baterai", "Sel/blok paralel menambah kapasitas (Ah) dan menurunkan r total. Baterai baru diparalel dengan yang lama: yang baru memikul hampir semua beban dan mengisi paksa yang lama (soal C14).", None),
        ("⚙️", "Generator DC Paralel", "Beban dibagi lewat karakteristik tegangan–arus (droop) tiap mesin; generator dengan droop lebih landai (r kecil) memikul lebih banyak. Eksitasi diatur agar bagian bebannya sesuai kapasitas.", r"\(I_k \propto 1/r_k\)"),
        ("🚗", "Alternator + Baterai", "Alternator (28 V, r kecil) paralel baterai 24 V: tegangan rel di atas ggl baterai, jadi baterai diisi sambil beban dipasok alternator. Mesin mati: baterai mengambil alih. Forum Pertemuan 4.", None),
        ("☀️", "String PLTS Paralel", "String panel dengan tegangan berbeda (bayangan, jumlah modul) saling mengalirkan arus; dioda blok atau pengendali per string mencegahnya.", None),
        ("🔌", "Catu Daya Redundan", "Dua catu daya server diparalel lewat dioda ORing atau pembagian beban aktif, bukan langsung: selisih beberapa puluh mV pun akan membuat satu unit memikul semuanya.", None),
        ("⚠️", "Menutup Paralel Saat Beda Tegangan", "Menyambungkan dua bank baterai besar dengan selisih 1 V dan r total 5 mΩ memutar 200 A seketika: percikan, kabel panas, sel rusak. Samakan dulu, atau pakai resistor pra-isi.", None),
    ])
    isi += tabel(["Kasus paralel", "V rel (V)", "I sumber 1 (A)", "I sumber 2 (A)", "I beban (A)", "Catatan"], [
        [f"Gambar 6, beban {ind(RLP, 1)} Ω", ind(V_P, 3), ind(I1P, 2), ind(I2P, 2), ind(ILP, 2), "B1 memikul 85%"],
        ["Gambar 6, tanpa beban", ind((E1P / R1P + E2P / R2P) / (1 / R1P + 1 / R2P), 3), ind(I_SIRK, 2), f"−{ind(I_SIRK, 2)}", "0", f"sirkulasi {ind(P_SIRK, 2)} W"],
        [f"Ggl sama {ind(E1P, 1)} V, r 0,05 dan 0,08 Ω, beban {ind(RLP, 1)} Ω", ind((E1P / R1P + E1P / R2P) / G_P, 3), ind((E1P - (E1P / R1P + E1P / R2P) / G_P) / R1P, 2), ind((E1P - (E1P / R1P + E1P / R2P) / G_P) / R2P, 2), ind((E1P / R1P + E1P / R2P) / G_P / RLP, 2), "bagian 8 : 5 (∝ 1/r)"],
        [f"Generator {ind(EG1, 0)} V/{ind(RG1, 1)} Ω ‖ {ind(EG2, 0)} V/{ind(RG2, 1)} Ω, beban {ind(IG, 0)} A", ind(V_G, 2), ind(IG1, 1), ind(IG2, 1), ind(IG, 0), "G2 (r kecil) memikul lebih banyak"],
    ])
    isi += kotak("info-box", "<strong>🏭 Catatan Praktik bagi Insinyur Mesin:</strong> genset DC cadangan, forklift, kapal, dan bengkel bertenaga surya hampir selalu memakai lebih dari satu sumber DC yang bekerja bersama. Tiga pertanyaan yang harus selalu dijawab dengan Persamaan (9)–(10) sebelum menyambungkan sumber secara paralel: berapa tegangan rel, siapa memikul berapa, dan berapa arus sirkulasi bila beban dilepas. Ketiganya juga menentukan pengaman: sekring tiap sumber harus tahan arus bagiannya, dan kabel antar-sumber harus tahan arus sirkulasi terburuk.")
    m += bagian(6, "m-paralel", "Sumber Paralel:<br>Pembagian Beban dan Arus Sirkulasi",
                "Persoalan banyak sumber yang paling sering ditemui insinyur mesin adalah sumber-sumber yang diparalel: baterai baru dengan baterai lama, alternator dengan baterai, dua generator memasok satu rel. Analisis nodal memberi jawabannya dalam satu persamaan, dan Thevenin meringkas seluruh kelompok sumber menjadi satu ggl ekuivalen pada Persamaan (9). Persamaan (10) menghitung arus yang tetap berputar walau beban dilepas, penyebab utama baterai paralel cepat rusak. Gambar 6 memperlihatkan keduanya.",
                isi, "SUMBER PARALEL")

    # 07 — animasi
    isi = anim_panel(1, "cyan", r"Analisis Nodal Dua Sumber: Tegangan Simpul dan Arus Tiap Cabang", "cvNodal",
                     [("sl_nd_e1", "v_nd_e1", "Ggl E₁ (V)", 0, 24, 0.5, 14, "14.0"), ("sl_nd_e2", "v_nd_e2", "Ggl E₂ (V)", 0, 24, 0.5, 11, "11.0"), ("sl_nd_r1", "v_nd_r1", "R₁ (Ω)", 0.5, 10, 0.5, 2, "2.0"), ("sl_nd_r2", "v_nd_r2", "R₂ (Ω)", 0.5, 10, 0.5, 4, "4.0"), ("sl_nd_r3", "v_nd_r3", "Beban R₃ (Ω)", 0.5, 20, 0.5, 5, "5.0")],
                     "btnNodal", "toggleNodal", "nodalInfo",
                     "<strong>📊 Cara Membaca Animasi 1:</strong> Titik-titik bergerak adalah arus tiap cabang; arah balik berarti arus negatif (sumber diisi). Readout memberi tegangan simpul, ketiga arus, pemeriksaan KCL, dan daya tiap sumber.<br>Amati: (1) <strong style=\"color:var(--cyan)\">Turunkan E₂ di bawah tegangan simpul</strong> dan lihat arus E₂ berbalik arah: sumber 2 menjadi beban. (2) Memperkecil R₁ menarik tegangan simpul mendekati E₁ (bobot konduktansi). (3) Memperbesar R₃ menaikkan V tetapi menurunkan I₃. Soal C3, C4, dan C13.")
    isi += anim_panel(2, "amber", r"Superposisi: Kontribusi Tiap Sumber terhadap Arus Cabang", "cvSuperposisi",
                      [("sl_su_e1", "v_su_e1", "Ggl E₁ (V)", 0, 24, 0.5, 14, "14.0"), ("sl_su_e2", "v_su_e2", "Ggl E₂ (V)", 0, 24, 0.5, 11, "11.0"), ("sl_su_r1", "v_su_r1", "R₁ (Ω)", 0.5, 10, 0.5, 2, "2.0"), ("sl_su_r2", "v_su_r2", "R₂ (Ω)", 0.5, 10, 0.5, 4, "4.0")],
                      "btnSuperposisi", "toggleSuperposisi", "superposisiInfo",
                      "<strong>📊 Cara Membaca Animasi 2:</strong> Tiga langkah bergantian: hanya E₁ (batang kuning), hanya E₂ (jingga), lalu keduanya ditumpuk; bingkai adalah jumlahnya, sama dengan arus rangkaian lengkap (R₃ = 5 Ω). Batang ke kiri berarti arus negatif.<br>Amati: (1) <strong style=\"color:var(--amber)\">Saat hanya E₁ aktif, I₂ negatif</strong>: cabang E₂ yang 'mati' menjadi jalur balik. (2) Kontribusi tiap sumber sebanding ggl-nya dan berbanding terbalik resistansi cabangnya. (3) Readout menunjukkan daya R₃ dari arus total, bukan jumlah daya tiap langkah. Soal C13.")
    isi += anim_panel(3, "green", r"Ekuivalen Thevenin dan Kurva Daya Beban \(P_L(R_L)\)", "cvThevenin",
                      [("sl_th_e", "v_th_e", "Sumber E (V)", 6, 60, 1, 24, "24"), ("sl_th_r1", "v_th_r1", "R₁ (Ω)", 1, 30, 0.5, 8, "8.0"), ("sl_th_r2", "v_th_r2", "R₂ (Ω)", 1, 30, 0.5, 8, "8.0"), ("sl_th_r3", "v_th_r3", "R₃ seri terminal (Ω)", 0, 20, 0.5, 2, "2.0")],
                      "btnThevenin", "toggleThevenin", "theveninInfo",
                      "<strong>📊 Cara Membaca Animasi 3:</strong> Kiri: ekuivalen Thevenin yang dihitung dari jaringan Gambar 5; kanan: daya beban terhadap R_L, dengan titik yang menyapu R_L dari kecil ke besar dan garis merah muda di R_L = R_th.<br>Amati: (1) <strong style=\"color:var(--green)\">V_th hanya bergantung pada pembagi R₁–R₂</strong>, sedangkan R₃ hanya menambah R_th. (2) Memperbesar R₃ menurunkan puncak daya (∝ 1/R_th) dan menggesernya ke kanan. (3) Readout memberi I_N = V_th/R_th, arus hubung singkat terminal. Soal C5–C7 dan C12.")
    isi += anim_panel(4, "pink", r"Dua Sumber Paralel: Tegangan Rel, Pembagian Beban, dan Arus Sirkulasi", "cvParalelSumber",
                      [("sl_ps_e1", "v_ps_e1", "Ggl E₁ (V)", 10, 15, 0.1, 12.8, "12.8"), ("sl_ps_r1", "v_ps_r1", "r₁ (Ω)", 0.01, 0.3, 0.005, 0.05, "0.050"), ("sl_ps_e2", "v_ps_e2", "Ggl E₂ (V)", 10, 15, 0.1, 12.2, "12.2"), ("sl_ps_r2", "v_ps_r2", "r₂ (Ω)", 0.01, 0.3, 0.005, 0.08, "0.080"), ("sl_ps_rl", "v_ps_rl", "Beban R_L (Ω)", 0.1, 5, 0.05, 0.6, "0.60")],
                      "btnParalelSumber", "toggleParalelSumber", "paralelSumberInfo",
                      "<strong>📊 Cara Membaca Animasi 4:</strong> Dua sumber dengan hambatan dalamnya memasok satu beban; kerapatan titik menggambarkan arus tiap cabang, dan label merah menandai sumber yang justru diisi.<br>Amati: (1) <strong style=\"color:var(--pink)\">Samakan E₁ = E₂</strong>: beban terbagi persis berbanding terbalik r. (2) Turunkan E₂ sedikit di bawah E₁: pada beban ringan (R_L besar) sumber 2 diisi, pada beban berat ia ikut memasok. (3) Readout memberi arus sirkulasi tanpa beban dan rugi yang ditimbulkannya. Soal C8–C10, C14, dan C15.")
    isi += kotak("info-box", f"<strong>🔍 Latihan Mandiri:</strong> pada Animasi 1 atur E₁ = {ind(E1N, 0)}, E₂ = {ind(E2N, 0)}, R = {ind(R1N, 0)}/{ind(R2N, 0)}/{ind(R3N, 0)} Ω: tegangan simpul harus {ind(V_N, 3)} V seperti Bagian 03. Turunkan E₂ sampai arusnya tepat nol dan bandingkan dengan tabel Bagian 03. Lalu pada Animasi 4 buat E₁ = E₂ = 12,8 V dan periksa bahwa I₁ : I₂ = r₂ : r₁.")
    m += bagian(7, "m-animasi", "Animasi Interaktif<br>Jaringan Dua Sumber",
                "Geser ggl dan resistansi, lalu amati bagaimana tegangan simpul, arah arus tiap sumber, sumbangan tiap sumber, ekuivalen Thevenin, dan pembagian beban berubah. Empat animasi ini memvisualkan Persamaan (4)–(10) pada jaringan contoh yang sama dengan Bagian 03–06.",
                isi, "ANIMASI")

    # 08 — python
    isi = kotak("info-box", "<strong>📦 Paket yang Diperlukan:</strong> <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">numpy</code> dan <code style=\"font-family:'JetBrains Mono',monospace;color:var(--cyan)\">matplotlib</code>. Untuk soal tugas, yang dinilai adalah <strong>nilai numerik yang Anda <code>print()</code></strong>; cetak dengan angka desimal secukupnya, jangan membulatkan di tengah perhitungan, dan pertahankan tanda (arus negatif berarti sumber diisi).")
    isi += kode("Cell 1 — Analisis Nodal Dua Sumber, Arus Cabang, dan Neraca Daya", f'''import numpy as np

# ═══ Jaringan Gambar 3 (Persamaan 4–5) ═══
E1, R1, E2, R2, R3 = {ind(E1N, 0).replace(",", ".")}.0, {ind(R1N, 0)}.0, {ind(E2N, 0)}.0, {ind(R2N, 0)}.0, {ind(R3N, 0)}.0
G = 1/R1 + 1/R2 + 1/R3
V = (E1/R1 + E2/R2) / G                       # tegangan simpul
I1, I2, I3 = (E1 - V)/R1, (E2 - V)/R2, V/R3
print(f"V simpul = {{V:.4f}} V;  I1 = {{I1:.4f}} A, I2 = {{I2:.4f}} A, I3 = {{I3:.4f}} A")
print(f"KCL: I1 + I2 - I3 = {{I1 + I2 - I3:.6f}} (harus 0)")
P_sumber = E1*I1 + E2*I2                      # bertanda: negatif = diisi
P_resistor = I1**2*R1 + I2**2*R2 + I3**2*R3
print(f"Neraca daya: sumber {{P_sumber:.4f}} W = resistor {{P_resistor:.4f}} W")

# ═══ Dua ggl seri (Persamaan 1) ═══
E1s, E2s, R = {ind(E1S, 0)}.0, {ind(E2S, 1).replace(",", ".")}, {ind(RS, 0)}.0
print(f"Seri aiding: I = {{(E1s + E2s)/R:.4f}} A;  opposing: I = {{(E1s - E2s)/R:.4f}} A")''')
    isi += kode("Cell 2 — Analisis Mesh dengan Matriks dan Teorema Superposisi", f'''import numpy as np

# ═══ Mesh dua loop, Gambar 2 (Persamaan 3): R I = E ═══
E1, R1, E2, R2, R3 = {ind(E1M, 0)}.0, {ind(R1M, 0)}.0, {ind(E2M, 0)}.0, {ind(R2M, 0)}.0, {ind(R3M, 0)}.0
Rm = np.array([[R1 + R3, -R3],
               [-R3,     R2 + R3]])           # diagonal: jumlah R di loop; silang: -R bersama
Em = np.array([E1, E2])                       # ggl bertanda searah arus loop (searah jarum jam)
I1, I2 = np.linalg.solve(Rm, Em)
I_R3 = I1 - I2
print(f"I1 = {{I1:.4f}} A, I2 = {{I2:.4f}} A, arus R3 = {{I_R3:.4f}} A, P_R3 = {{I_R3**2*R3:.4f}} W")
print(f"Neraca: E1*I1 + E2*I2 = {{E1*I1 + E2*I2:.4f}} W;  sum I^2R = {{I1**2*R1 + I2**2*R2 + I_R3**2*R3:.4f}} W")

# ═══ Superposisi pada jaringan Gambar 3 (Persamaan 6) ═══
def nodal(E1, R1, E2, R2, R3):
    V = (E1/R1 + E2/R2) / (1/R1 + 1/R2 + 1/R3)
    return V, (E1 - V)/R1, (E2 - V)/R2, V/R3

E1, R1, E2, R2, R3 = {ind(E1N, 0)}.0, {ind(R1N, 0)}.0, {ind(E2N, 0)}.0, {ind(R2N, 0)}.0, {ind(R3N, 0)}.0
_, _, _, I3a = nodal(E1, R1, 0.0, R2, R3)     # hanya E1 (E2 -> kawat)
_, _, _, I3b = nodal(0.0, R1, E2, R2, R3)     # hanya E2 (E1 -> kawat)
_, _, _, I3  = nodal(E1, R1, E2, R2, R3)      # lengkap
print(f"I3' = {{I3a:.4f}} A, I3'' = {{I3b:.4f}} A, jumlah = {{I3a + I3b:.4f}} A, langsung = {{I3:.4f}} A")
print(f"Daya R3: benar {{I3**2*R3:.4f}} W, jumlah daya tiap langkah {{(I3a**2 + I3b**2)*R3:.4f}} W (salah)")''')
    isi += kode("Cell 3 — Ekuivalen Thevenin–Norton dan Kurva Daya Beban", f'''import numpy as np
import matplotlib.pyplot as plt

# ═══ Gambar 5 (Persamaan 7–8): sumber E, R1 seri R2, terminal pada R2 lewat R3 ═══
E, R1, R2, R3 = {ind(ET, 0)}.0, {ind(R1T, 0)}.0, {ind(R2T, 0)}.0, {ind(R3T, 0)}.0
V_th = E * R2 / (R1 + R2)                     # terminal terbuka: tidak ada arus di R3
R_th = R1*R2/(R1 + R2) + R3                   # sumber dihubung singkat
I_N  = V_th / R_th
P_maks = V_th**2 / (4*R_th)
print(f"V_th = {{V_th:.4f}} V, R_th = {{R_th:.4f}} ohm, I_N = {{I_N:.4f}} A, P_maks = {{P_maks:.4f}} W pada R_L = {{R_th:.4f}} ohm")

for RL in [2, 6, 12, 24, 60]:
    I = V_th / (R_th + RL)
    print(f"R_L = {{RL:3d}} ohm: I = {{I:.4f}} A, V_ab = {{I*RL:.4f}} V, P_L = {{I**2*RL:.4f}} W, eta = {{RL/(R_th+RL)*100:.1f}} %")

RL = np.linspace(0.05, 5*R_th, 400)
plt.figure(figsize=(7, 4))
plt.plot(RL, V_th**2*RL/(R_th + RL)**2, color='tab:green'); plt.axvline(R_th, ls=':', color='tab:red')
plt.xlabel('R_L (ohm)'); plt.ylabel('P_L (W)'); plt.title('Daya beban pada ekuivalen Thevenin'); plt.grid(True); plt.show()''')
    isi += kode("Cell 4 — Sumber Paralel: Pembagian Beban, Sumber yang Diisi, dan Arus Sirkulasi", f'''import numpy as np

def rel_paralel(E, r, R_L=None, I_beban=None):
    """Tegangan rel dan arus tiap sumber (Persamaan 9). Beban resistif R_L, atau beban arus tetap I_beban."""
    E, r = np.asarray(E, float), np.asarray(r, float)
    G = np.sum(1/r) + (1/R_L if R_L else 0.0)
    V = (np.sum(E/r) - (I_beban or 0.0)) / G
    return V, (E - V)/r

# ═══ Gambar 6: dua baterai, beban resistif ═══
V, I = rel_paralel([{ind(E1P, 1).replace(",", ".")}, {ind(E2P, 1).replace(",", ".")}], [{ind(R1P, 2).replace(",", ".")}, {ind(R2P, 2).replace(",", ".")}], R_L={ind(RLP, 1).replace(",", ".")})
print(f"V rel = {{V:.4f}} V;  I1 = {{I[0]:.4f}} A, I2 = {{I[1]:.4f}} A, I_L = {{I.sum():.4f}} A")
for k, Ik in enumerate(I, 1):
    print(f"  sumber {{k}}: {{'memasok' if Ik > 0 else 'DIISI (menyerap)'}} {{abs(Ik):.3f}} A")

# ═══ Arus sirkulasi tanpa beban (Persamaan 10) ═══
E1, r1, E2, r2 = {ind(E1P, 1).replace(",", ".")}, {ind(R1P, 2).replace(",", ".")}, {ind(E2P, 1).replace(",", ".")}, {ind(R2P, 2).replace(",", ".")}
I_sirk = (E1 - E2) / (r1 + r2)
print(f"Tanpa beban: I_sirk = {{I_sirk:.4f}} A, rugi = {{I_sirk**2*(r1 + r2):.4f}} W terus-menerus")

# ═══ Dua generator, beban arus tetap ═══
V, I = rel_paralel([{ind(EG1, 0)}, {ind(EG2, 0)}], [{ind(RG1, 1).replace(",", ".")}, {ind(RG2, 1).replace(",", ".")}], I_beban={ind(IG, 0)})
print(f"Generator: V rel = {{V:.4f}} V, I_G1 = {{I[0]:.4f}} A, I_G2 = {{I[1]:.4f}} A, P_G1 = {{{ind(EG1, 0)}*I[0]:.2f}} W, P_G2 = {{{ind(EG2, 0)}*I[1]:.2f}} W")

# ═══ Ekuivalen Thevenin sumber paralel ═══
E_eq = (E1/r1 + E2/r2) / (1/r1 + 1/r2);  r_eq = 1 / (1/r1 + 1/r2)
print(f"E_eq = {{E_eq:.4f}} V, r_eq = {{r_eq:.4f}} ohm")''')
    isi += kotak("tip-box", f"💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan keempat cell dan cocokkan dengan angka di Bagian 02–06: V simpul {ind(V_N, 3)} V, arus R₃ mesh {ind(I3M, 3)} A, V_th = {ind(VTH, 0)} V dan R_th = {ind(RTH, 0)} Ω, serta arus sirkulasi {ind(I_SIRK, 2)} A. Cell 2–4 memuat pola penyelesaian soal Hard C11–C15; ubah angkanya sesuai soal Anda, jangan hanya menyalin.")
    m += bagian(8, "m-jupyter", "Implementasi Python<br>di Jupyter Notebook",
                "Empat cell berikut menyelesaikan seluruh jaringan contoh modul ini: nodal, mesh dengan matriks, superposisi, Thevenin–Norton, dan sumber paralel. Salin satu cell utuh ke Jupyter Notebook (VS Code), jalankan apa adanya lebih dulu, baru ubah parameternya. Setiap perhitungan diberi nomor persamaan yang dipakainya.",
                isi, "IMPLEMENTASI PYTHON")

    refs = pm_ref(1, "cyan", "14,165,233", "C. K. Alexander &amp; M. N. O. Sadiku", "Fundamentals of Electric Circuits", ", Seventh Edition. McGraw-Hill, 2021.", "Bab 3 (metode nodal dan mesh) dan Bab 4 (linearitas, superposisi, Thevenin, Norton, transfer daya maksimum): rujukan utama modul ini.")
    refs += pm_ref(2, "amber", "249,115,22", "R. L. Boylestad", "Introductory Circuit Analysis", ", Thirteenth Edition. Pearson, 2016.", "Bab 8 (metode analisis: sumber seri–paralel, mesh, nodal) dan Bab 9 (teorema jaringan) dengan banyak contoh bertahap.")
    refs += pm_ref(3, "violet", "168,85,247", "J. D. Irwin &amp; D. V. Kerns, Jr.", "Introduction to Electrical Engineering", ". Prentice Hall, 1995.", "Bab 3–4: teknik analisis jaringan dan teorema rangkaian; pustaka utama RPS.")
    refs += pm_ref(4, "green", "0,224,158", "S. J. Chapman", "Electric Machinery Fundamentals", ", Fifth Edition. McGraw-Hill, 2012.", "Bab 8–9: karakteristik terminal generator DC dan pengoperasian generator DC secara paralel (pembagian beban lewat droop).")
    refs += pm_ref(5, "pink", "236,72,153", "Zuhal", "Dasar Tenaga Listrik dan Elektronika Daya", ". Gramedia, Jakarta.", "Bab rangkaian listrik arus searah dan mesin DC: bahasa dan notasi yang dipakai pada mata kuliah ini.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti untuk metode mesh dan nodal, teorema superposisi, Thevenin, dan Norton, serta pengoperasian sumber DC secara paralel. Bab-bab yang disebut cukup untuk memperdalam seluruh perhitungan modul ini.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> simulator rangkaian daring (mis. Falstad atau EveryCircuit) memungkinkan Anda mematikan satu sumber dan mengamati superposisi secara langsung; lembar data baterai (mis. dari pabrikan VRLA dan LiFePO₄) mencantumkan hambatan dalam yang dipakai untuk menaksir arus sirkulasi bank paralel. Untuk tugas modul ini, cukup gunakan <code style="font-family:'JetBrains Mono',monospace;color:var(--cyan)">numpy</code>.
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V = (ΣE/R)/(Σ1/R)</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">E = (R₁+R₃)I₁ − R₃I₂</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">V_th, R_th, I_N</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">I = I′ + I″</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">I_sirk = ΔE/(r₁+r₂)</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas {NOMOR}</span><br><em>Jaringan DC</em><br>Dua Sumber atau Lebih</h1>
    <p class="hero-sub">10 soal pilihan ganda + 10 soal komputasi easy/medium + 5 soal komputasi hard (Jupyter Notebook) seputar ggl seri, analisis mesh dan nodal, superposisi, ekuivalen Thevenin–Norton, transfer daya maksimum, dan pembagian beban pada sumber paralel. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">15</div><div class="stat-lbl">Komputasi</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

MC = [
    ("Perbedaan pokok <strong>analisis mesh</strong> dan <strong>analisis nodal</strong> adalah...",
     ["Mesh hanya untuk rangkaian seri, nodal hanya untuk rangkaian paralel", "Mesh memakai hukum Ohm, nodal memakai hukum Kirchhoff", "Mesh menulis KVL tiap loop dengan arus loop sebagai variabel; nodal menulis KCL tiap simpul dengan tegangan simpul sebagai variabel", "Mesh hanya berlaku untuk satu sumber, nodal untuk banyak sumber"],
     "Mesh vs nodal"),
    ("Saat menerapkan <strong>teorema superposisi</strong>, sumber yang sedang tidak ditinjau harus...",
     ["Sumber tegangan diganti hubung singkat, sumber arus diganti rangkaian terbuka", "Sumber tegangan diganti rangkaian terbuka, sumber arus diganti hubung singkat", "Keduanya dilepas dari rangkaian (terbuka)", "Keduanya dibiarkan, hanya nilainya dibagi dua"],
     "Mematikan sumber pada superposisi"),
    ("Teorema superposisi <strong>tidak boleh</strong> dipakai untuk...",
     ["Menghitung arus cabang pada jaringan dua sumber", "Menghitung tegangan simpul", "Jaringan resistif dengan tiga sumber", "Elemen tak linear, dan menjumlahkan daya dari tiap kontribusi"],
     "Batas superposisi"),
    ("Menurut <strong>teorema Thevenin</strong>, \\(V_{th}\\) dan \\(R_{th}\\) sebuah jaringan dilihat dari dua terminal adalah...",
     ["Tegangan hubung singkat dan resistansi beban", "Tegangan terminal terbuka, dan resistansi dari terminal dengan semua sumber bebas dimatikan", "Tegangan sumber terbesar dan jumlah semua resistor", "Tegangan rata-rata dan resistansi rata-rata"],
     "Definisi Thevenin"),
    ("<strong>Ekuivalen Norton</strong> suatu jaringan terdiri atas...",
     ["Sumber tegangan \\(V_{th}\\) seri \\(R_{th}\\)", "Sumber arus \\(I_N\\) seri \\(R_{th}\\)", "Sumber arus \\(I_N = V_{th}/R_{th}\\) paralel dengan \\(R_N = R_{th}\\)", "Sumber tegangan \\(V_{th}\\) paralel \\(R_{th}\\)"],
     "Ekuivalen Norton"),
    ("Dua ggl yang dihubungkan seri <strong>saling melawan</strong> (opposing) menghasilkan ggl total sebesar...",
     ["Selisih keduanya, mengalir searah ggl yang lebih besar", "Jumlah keduanya", "Nol, apa pun nilainya", "Rata-rata keduanya"],
     "Ggl seri opposing"),
    ("Dua sumber dengan <strong>ggl berbeda</strong> yang diparalel tanpa beban akan...",
     ["Tidak mengalirkan arus karena tidak ada beban", "Menghasilkan ggl sama dengan jumlah keduanya", "Menghasilkan ggl sama dengan rata-rata keduanya tanpa arus", "Mengalirkan arus sirkulasi antar-sumber yang hanya dibatasi hambatan dalam"],
     "Arus sirkulasi"),
    ("Dua sumber dengan <strong>ggl sama</strong> tetapi hambatan dalam berbeda memikul beban paralel dengan pembagian...",
     ["Sama rata", "Berbanding terbalik dengan hambatan dalam; sumber ber-r kecil memikul lebih banyak", "Sebanding dengan hambatan dalam", "Seluruhnya oleh sumber ber-r besar"],
     "Pembagian beban sumber paralel"),
    ("Tegangan simpul bersama pada jaringan dua sumber \\(E_1\\) (melalui \\(R_1\\)) dan \\(E_2\\) (melalui \\(R_2\\)) dengan beban \\(R_3\\) ke referensi adalah...",
     ["\\(V = (E_1 + E_2)/2\\)", "\\(V = (E_1 + E_2)\\,R_3/(R_1 + R_2 + R_3)\\)", "\\(V = \\dfrac{E_1/R_1 + E_2/R_2}{1/R_1 + 1/R_2 + 1/R_3}\\)", "\\(V = (E_1 R_1 + E_2 R_2)/R_3\\)"],
     "Rumus tegangan simpul"),
    ("Daya maksimum yang dapat diserap beban dari jaringan apa pun, dinyatakan dengan ekuivalen Thevenin-nya, adalah...",
     ["\\(V_{th}^2/(4R_{th})\\) saat \\(R_L = R_{th}\\)", "\\(V_{th}^2/R_{th}\\) saat \\(R_L = 0\\)", "\\(V_{th} I_N\\) saat \\(R_L\\) tak hingga", "\\(V_{th}^2/(2R_{th})\\) saat \\(R_L = 2R_{th}\\)"],
     "Transfer daya maksimum via Thevenin"),
]

COMP_EZ_LABELS = ["Arus dua ggl seri aiding", "Arus dua ggl seri opposing", "Tegangan simpul (nodal dua sumber)", "Arus beban I₃ dari tegangan simpul", "Tegangan Thevenin V_th",
                  "Resistansi Thevenin R_th", "Arus Norton I_N", "Arus baterai B1 pada paralel", "Arus generator G2 (beban arus tetap)", "Daya sumber S1 = E₁·I₁"]
COMP_HARD_LABELS = ["Mesh dua loop: daya pada R₃", "Thevenin lalu daya maksimum V_th²/(4R_th)", "Superposisi: kontribusi E₁ pada I₃",
                    "Baterai baru–lama paralel: arus B2 bertanda", "Ekuivalen Thevenin dua sumber paralel: daya beban"]


# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}
EA, RA, EB, RB, RLK = 28.5, 0.05, 25.2, 0.04, 0.75            # alternator, baterai utama, beban malam
G_K = 1 / RA + 1 / RB + 1 / RLK
V_K = (EA / RA + EB / RB) / G_K
IA_K, IB_K, IL_K = (EA - V_K) / RA, (EB - V_K) / RB, V_K / RLK
EL, RL_ = 24.0, 0.10                                          # baterai lama
G_M = 1 / RB + 1 / RL_ + 1 / RLK
V_M = (EB / RB + EL / RL_) / G_M
IB_M, IL_M, ILD_M = (EB - V_M) / RB, (EL - V_M) / RL_, V_M / RLK
I_SIRK_K = (EB - EL) / (RB + RL_)
P_SIRK_K = I_SIRK_K ** 2 * (RB + RL_)
EEQ_K = (EA / RA + EB / RB) / (1 / RA + 1 / RB)
REQ_K = RA * RB / (RA + RB)
PMAKS_K = EEQ_K ** 2 / (4 * REQ_K)
P_LAS = 1500.0 + 840.0
I_LAS = P_LAS / 25.0
V_LAS = EEQ_K - I_LAS * REQ_K

FQ_JUDUL = [
    "Mesin hidup: hitung tegangan rel dan arus alternator serta baterai. Mengapa baterai terasa hangat?",
    "Baterai lama diparalel saat mesin mati: berapa sumbangannya, dan ke mana arus mengalir saat lampu dipadamkan?",
    "Ringkas alternator + baterai menjadi satu ekuivalen Thevenin: sanggupkah rel memikul inverter las 1,5 kW?",
]
FQ_RINGKAS = [
    f"Tiga cabang bertemu di rel 24 V: alternator ({ind(EA, 1)} V, r {ind(RA, 2)} Ω), baterai utama ({ind(EB, 1)} V, r {ind(RB, 2)} Ω), dan beban malam {ind(RLK, 2)} Ω. Hitung tegangan rel dengan Persamaan (4), arus tiap cabang dengan Persamaan (5), tanda arus baterai, dan daya yang diserap/dibangkitkan tiap sumber.",
    f"Mesin mati; baterai utama ({ind(EB, 1)} V, r {ind(RB, 2)} Ω) diparalel baterai lama ({ind(EL, 1)} V, r {ind(RL_, 2)} Ω) memasok beban {ind(RLK, 2)} Ω. Hitung tegangan rel dan arus tiap baterai (Persamaan 9), lalu arus sirkulasi dan rugi saat beban dilepas (Persamaan 10). Nilai apakah baterai lama membantu atau merugikan.",
    f"Gabungkan alternator dan baterai utama menjadi E_eq dan r_eq (Persamaan 9), hitung P_maks = E_eq²/(4r_eq), lalu tegangan rel bila beban total menjadi {ind(P_LAS, 0)} W (inverter las + beban malam). Bandingkan dengan syarat minimum 24 V dan jelaskan mengapa P_maks bukan batas kerja yang aman.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Saat mesin hidup, tiga cabang bertemu di rel 24 V kapal: alternator (ggl {ind(EA, 1)} V, r = {ind(RA, 2)} Ω), baterai utama (ggl {ind(EB, 1)} V, r = {ind(RB, 2)} Ω), dan beban malam (lampu sorot, pompa, radio) yang setara {ind(RLK, 2)} Ω. Hitung tegangan rel dengan Persamaan (4) dan arus tiap cabang dengan Persamaan (5). Perhatikan tanda arus baterai: apakah ia memasok atau justru diisi? Hitung daya yang dibangkitkan alternator, daya yang diserap baterai, dan panas \\(I^2 r\\) di dalam baterai, lalu jelaskan keluhan nelayan bahwa baterai 'terasa hangat' saat mesin hidup.",
            ["V = (ΣE/r)/(Σ1/r + 1/R_L)", "I_k = (E_k − V)/r_k", "P_bat = E_b·I_b"],
            "Saat mesin hidup, tegangan rel dan arus baterai utama adalah sekitar...",
            [f"{ind(EB, 1)} V dan 0 A: baterai tidak terlibat", f"{ind(V_K, 2)} V dan {ind(abs(IB_K), 1)} A masuk ke baterai: baterai sedang diisi", f"{ind(EA, 1)} V dan {ind(IL_K, 1)} A keluar: baterai memikul seluruh beban", f"{ind(V_K, 2)} V dan {ind(abs(IB_K), 1)} A keluar: baterai dan alternator berbagi beban sama rata"],
            f"✅ Tepat! \\(V = ({ind(EA, 1)}/{ind(RA, 2)} + {ind(EB, 1)}/{ind(RB, 2)})/(1/{ind(RA, 2)} + 1/{ind(RB, 2)} + 1/{ind(RLK, 2)}) \\approx {ind(V_K, 3)}\\) V, di atas ggl baterai, sehingga \\(I_b = ({ind(EB, 1)} - {ind(V_K, 3)})/{ind(RB, 2)} \\approx {ind(IB_K, 1)}\\) A (negatif: diisi). Alternator memasok \\(\\approx {ind(IA_K, 1)}\\) A: {ind(IL_K, 1)} A ke beban dan {ind(abs(IB_K), 1)} A ke baterai. Panas \\(I^2 r = {ind(IB_K ** 2 * RB, 1)}\\) W ditambah reaksi kimia pengisian membuat baterai hangat.",
            "❌ Ggl alternator lebih tinggi daripada ggl baterai, jadi tegangan rel berada di antara keduanya dan baterai berada di bawah tegangan rel: arus masuk ke baterai. Hitung V dari Persamaan (4) lebih dulu, baru tanda tiap arus dari Persamaan (5).",
            "Petunjuk: (1) Hitung tegangan rel. (2) Hitung arus alternator, baterai (bertanda), dan beban; periksa KCL. (3) Hitung daya tiap sumber dan panas di baterai; jelaskan gejala hangat.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Untuk 'menambah daya' saat mesin mati, nelayan memaralel baterai lama (ggl {ind(EL, 1)} V, r = {ind(RL_, 2)} Ω) dengan baterai utama (ggl {ind(EB, 1)} V, r = {ind(RB, 2)} Ω). Hitung tegangan rel dan arus tiap baterai saat memasok beban {ind(RLK, 2)} Ω (Persamaan 9): berapa persen beban yang dipikul baterai lama? Lalu lepas beban (lampu dipadamkan) dan hitung arus sirkulasi serta rugi dayanya (Persamaan 10). Berapa energi yang terbuang semalam (10 jam)? Simpulkan apakah baterai lama membantu, dan usulkan cara yang benar (mis. dioda pemisah, saklar pemilih, atau mengganti dengan baterai sejenis).",
            ["I_k = (E_k − V)/r_k", "I_sirk = (E₁ − E₂)/(r₁ + r₂)", "E_rugi = P·t"],
            "Saat beban dilepas, arus yang berputar antara baterai utama dan baterai lama adalah sekitar...",
            ["0 A, karena tidak ada beban", f"{ind(IB_M, 1)} A, sama seperti saat berbeban", f"{ind((EB - EL) / RB, 1)} A, dibatasi r baterai utama saja", f"{ind(I_SIRK_K, 2)} A, membuang {ind(P_SIRK_K, 1)} W terus-menerus"],
            f"✅ Tepat! \\(I_{{sirk}} = ({ind(EB, 1)} - {ind(EL, 1)})/({ind(RB, 2)} + {ind(RL_, 2)}) \\approx {ind(I_SIRK_K, 2)}\\) A dan \\(P = I^2(r_1 + r_2) \\approx {ind(P_SIRK_K, 1)}\\) W; semalam 10 jam berarti \\(\\approx {ind(P_SIRK_K * 10, 0)}\\) Wh hilang, sambil mengisi paksa baterai lama yang tidak mampu menyimpannya. Saat berbeban, baterai lama hanya menyumbang \\(\\approx {ind(IL_M, 2)}\\) A dari {ind(ILD_M, 1)} A ({ind(IL_M / ILD_M * 100, 1)}%).",
            "❌ Tanpa beban, dua ggl yang berbeda dalam satu loop tetap mengalirkan arus, hanya dibatasi jumlah hambatan dalam keduanya (Persamaan 10). Hitung \\((E_1 - E_2)/(r_1 + r_2)\\).",
            "Petunjuk: (1) Hitung V rel dan arus tiap baterai saat berbeban; persentase sumbangan baterai lama. (2) Hitung arus sirkulasi, rugi daya, dan energi semalam. (3) Simpulkan dan usulkan susunan yang benar.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Nelayan ingin memasang inverter las kecil 1,5 kW yang dipakai bersamaan dengan beban malam ({ind(P_LAS, 0)} W total), hanya saat mesin hidup. Ganti alternator dan baterai utama dengan satu ekuivalen Thevenin: \\(E_{{eq}}\\) dan \\(r_{{eq}}\\) (Persamaan 9). Hitung daya maksimum teoretis \\(P_{{maks}} = E_{{eq}}^2/(4r_{{eq}})\\) dan arusnya, lalu tegangan rel yang sebenarnya pada beban {ind(P_LAS, 0)} W (perkirakan arus ≈ P/25 V, lalu \\(V = E_{{eq}} - I r_{{eq}}\\)). Apakah rel tetap di atas 24 V? Jelaskan mengapa \\(P_{{maks}}\\) bukan batas kerja yang aman (efisiensi 50%, arus hubung singkat, kemampuan alternator), dan sebutkan batas nyata apa yang sebaiknya dipakai.",
            ["E_eq = (ΣE/r)/(Σ1/r)", "r_eq = r₁‖r₂", "P_maks = E_eq²/(4r_eq)"],
            f"Ekuivalen Thevenin alternator + baterai utama dan tegangan rel pada beban {ind(P_LAS, 0)} W adalah sekitar...",
            [f"E_eq ≈ {ind(EEQ_K, 2)} V, r_eq ≈ {ind(REQ_K, 3)} Ω; rel ≈ {ind(V_LAS, 1)} V, masih di atas 24 V", f"E_eq = {ind(EA, 1)} V, r_eq = {ind(RA, 2)} Ω; rel ≈ {ind(EA - I_LAS * RA, 1)} V", f"E_eq = {ind((EA + EB) / 2, 2)} V, r_eq = {ind(RA + RB, 2)} Ω; rel ≈ {ind((EA + EB) / 2 - I_LAS * (RA + RB), 1)} V, di bawah 24 V", "Tidak dapat dihitung tanpa mengetahui beban"],
            f"✅ Tepat! \\(E_{{eq}} = ({ind(EA, 1)}/{ind(RA, 2)} + {ind(EB, 1)}/{ind(RB, 2)})/(1/{ind(RA, 2)} + 1/{ind(RB, 2)}) \\approx {ind(EEQ_K, 3)}\\) V, \\(r_{{eq}} = {ind(RA, 2)}\\parallel{ind(RB, 2)} \\approx {ind(REQ_K, 4)}\\) Ω. \\(P_{{maks}} \\approx {ind(PMAKS_K / 1000, 1)}\\) kW pada \\(\\approx {ind(EEQ_K / (2 * REQ_K), 0)}\\) A: mustahil bagi alternator dan hanya 50% efisien. Beban {ind(P_LAS, 0)} W menarik \\(\\approx {ind(I_LAS, 0)}\\) A dan rel \\(\\approx {ind(V_LAS, 2)}\\) V: masih di atas 24 V, tetapi batas nyatanya adalah arus pengenal alternator, bukan \\(P_{{maks}}\\).",
            "❌ Sumber paralel diringkas dengan rata-rata ggl berbobot konduktansi (bukan rata-rata biasa) dan hambatan dalam paralel (bukan seri). Hitung \\(E_{eq}\\) dan \\(r_{eq}\\) dari Persamaan (9) lebih dulu.",
            "Petunjuk: (1) Hitung E_eq dan r_eq. (2) Hitung P_maks, arusnya, dan tegangan rel pada beban 2340 W. (3) Jelaskan batas kerja yang aman dan apa yang membatasinya.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">V = (ΣE/r)/(Σ1/r)</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">I_k = (E_k − V)/r_k</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">I_sirk = ΔE/(r₁+r₂)</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">E_eq, r_eq</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan {PERTEMUAN} · {JUDUL_PANJANG}</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Rel 24 V<br><em>Kapal Nelayan</em></h1>
    <p class="hero-sub">Sebuah kapal nelayan memakai alternator mesin dan bank baterai 24 V yang bekerja bersama, lalu menambahkan baterai lama untuk 'menambah daya'. Terapkan kosakata Pertemuan {PERTEMUAN} — analisis nodal, tanda arus tiap sumber, arus sirkulasi, dan ekuivalen Thevenin — untuk menjelaskan gejalanya dan menilai rencana pemasangan inverter las.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">Alternator, Baterai Utama, dan Baterai Lama —<br>Siapa Memasok Siapa?</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS JARINGAN DC DUA SUMBER ATAU LEBIH</div>
    <p>
      Sebuah <strong style="color:var(--amber)">kapal nelayan 24 V DC</strong> memiliki <strong style="color:var(--cyan)">alternator mesin</strong> (ggl {ind(EA, 1)} V, r = {ind(RA, 2)} Ω) dan <strong style="color:var(--cyan)">bank baterai utama</strong> (ggl {ind(EB, 1)} V, r = {ind(RB, 2)} Ω) yang terhubung paralel pada satu rel. Beban malam: lampu sorot, pompa lambung, dan radio navigasi, setara <strong>{ind(RLK, 2)} Ω</strong> (≈ {ind(IL_K, 0)} A). Nelayan mengeluh baterai <strong>terasa hangat</strong> setiap kali mesin hidup.
    </p>
    <p style="margin-top:12px">
      Saat mesin mati, ia memaralel <strong style="color:var(--pink)">baterai lama</strong> (ggl {ind(EL, 1)} V, r = {ind(RL_, 2)} Ω) untuk 'menambah daya', tetapi merasa baterai utama justru <strong>lebih cepat habis</strong>. Kini ia berencana memasang <strong style="color:var(--amber)">inverter las 1,5 kW</strong> yang dipakai saat mesin hidup, dan bertanya apakah rel 24 V-nya sanggup.
    </p>
    <p style="margin-top:12px">
      Sebagai mahasiswa yang baru menyelesaikan Modul {NOMOR}, Anda diminta menjelaskan kedua gejala itu dengan angka dan menilai rencana las <strong style="color:var(--cyan)">sebelum</strong> nelayan membeli peralatan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Alternator: {ind(EA, 1)} V, r = {ind(RA, 2)} Ω", "14,165,233", "cyan")}
{kartu(f"Baterai utama: {ind(EB, 1)} V, r = {ind(RB, 2)} Ω", "14,165,233", "cyan")}
{kartu(f"Beban malam: {ind(RLK, 2)} Ω (≈ {ind(IL_K, 0)} A)", "14,165,233", "cyan")}
{kartu(f"Baterai lama: {ind(EL, 1)} V, r = {ind(RL_, 2)} Ω", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Baterai yang hangat bukan baterai yang rusak, dan baterai lama yang 'tidak membantu' bukan baterai yang kosong: keduanya adalah akibat langsung dari sumber-sumber ber-ggl berbeda yang berbagi satu rel. Forum ini mengajak Anda menghitung <strong>siapa memasok siapa</strong>, <strong>berapa</strong> yang terbuang, dan <strong>sejauh mana</strong> rel dapat dibebani.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Arus tiap cabang pada dua kondisi: mesin hidup (alternator + baterai utama) dan mesin mati dengan baterai lama diparalel; batang ke kiri berarti sumber diisi</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = f"Kapal nelayan 24 V DC: alternator (ggl {ind(EA, 1)} V, r = {ind(RA, 2)} Ω) paralel bank baterai utama (ggl {ind(EB, 1)} V, r = {ind(RB, 2)} Ω) memasok beban malam {ind(RLK, 2)} Ω (≈ {ind(IL_K, 0)} A); baterai terasa hangat saat mesin hidup. Saat mesin mati, baterai lama (ggl {ind(EL, 1)} V, r = {ind(RL_, 2)} Ω) diparalel untuk 'menambah daya' tetapi baterai utama makin cepat habis. Rencana: inverter las 1,5 kW saat mesin hidup."
FORUM_CHIPS_LMS = [f"alternator = {ind(EA, 1)} V, r {ind(RA, 2)} Ω", f"baterai utama = {ind(EB, 1)} V, r {ind(RB, 2)} Ω", f"beban = {ind(RLK, 2)} Ω (≈ {ind(IL_K, 0)} A)", f"baterai lama = {ind(EL, 1)} V, r {ind(RL_, 2)} Ω"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Arus tiap cabang rel 24 V kapal nelayan (Pertemuan 4)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth; if (W > 0) cv.width = W; const H = cv.height;
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#061e1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const rel = (E, r, RL) => { const G = E.map((_, i) => 1 / r[i]).reduce((a, b) => a + b, 0) + 1 / RL; const V = E.map((e, i) => e / r[i]).reduce((a, b) => a + b, 0) / G; return [V, E.map((e, i) => (e - V) / r[i]), V / RL]; };
  const [V1, I1, IL1] = rel([28.5, 25.2], [0.05, 0.04], 0.75);
  const [V2, I2, IL2] = rel([25.2, 24.0], [0.04, 0.10], 0.75);
  const kolom = [
    ['Mesin hidup — V rel ' + V1.toFixed(2) + ' V', [['alternator', I1[0], 'rgba(0,229,255,.9)'], ['baterai utama', I1[1], 'rgba(255,179,0,.9)'], ['beban', IL1, 'rgba(0,224,158,.9)']]],
    ['Mesin mati + baterai lama — V rel ' + V2.toFixed(2) + ' V', [['baterai utama', I2[0], 'rgba(255,179,0,.9)'], ['baterai lama', I2[1], 'rgba(236,72,153,.9)'], ['beban', IL2, 'rgba(0,224,158,.9)']]],
  ];
  const maks = 60, padT = 22, barH = 22, gap = 12, lebar = (W - 40) / 2;
  kolom.forEach(([judul, baris], k) => {
    const x0 = 20 + k * lebar + 90, plotW = lebar - 110, xz = x0 + plotW * 0.3;
    ctx.fillStyle = 'rgba(226,232,240,.9)'; ctx.font = '600 10px JetBrains Mono'; ctx.textAlign = 'left'; ctx.fillText(judul, 20 + k * lebar, 14);
    ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.beginPath(); ctx.moveTo(xz, padT); ctx.lineTo(xz, padT + 3 * (barH + gap)); ctx.stroke();
    baris.forEach(([label, I, warna], i) => {
      const y = padT + i * (barH + gap);
      ctx.fillStyle = 'rgba(148,163,184,.85)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'right'; ctx.fillText(label, x0 - 6, y + barH / 2 + 4);
      const w = I / maks * plotW * 0.7; ctx.fillStyle = I < 0 ? 'rgba(239,68,68,.85)' : warna;
      ctx.fillRect(Math.min(xz, xz + w), y, Math.abs(w), barH);
      ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(I.toFixed(1) + ' A' + (I < 0 ? ' (diisi)' : ''), Math.max(xz, xz + w) + 6, y + barH / 2 + 4);
    });
  });
  ctx.fillStyle = 'rgba(148,163,184,.7)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('Tanpa beban, baterai utama ↔ baterai lama memutar ' + ((25.2 - 24) / 0.14).toFixed(2) + ' A terus-menerus', W / 2, H - 8);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
