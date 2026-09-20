# Konten Modul 12 Pemodelan CAD — Identifikasi Masalah Desain dan Solusi Optimasi
# (Sub-CPMK 4.2: daftar periksa masalah desain rakitan, toleransi dan fit ISO, uji gerak
# dan tabrakan, kelemahan struktur, DFM, perbaikan terukur, Part Check Geometry). Angka
# contoh dihitung di sini agar teks, tabel, dan gambar konsisten, dan sengaja tidak sama
# dengan varian tugas parametrik mana pun (bank tugas ada di backend privat).
import math
import pathlib
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
from pustaka import (AX, GRID, TX, anim_panel, arrow, bagian, box, cards, chip, figure, formula, fq, ind, kode, kotak,  # noqa: E402
                     mc_block, pm_ref, svg, t, tabel, teks2)

NOMOR = 12
JUDUL = "Identifikasi Masalah Desain dan Solusi Optimasi"
JUDUL_PANJANG = "Identifikasi Masalah Desain dan Solusi Optimasi"
JUDUL_EKSPOR = "Masalah Desain dan Solusi Optimasi"

# ─────────────────────────── angka contoh ───────────────────────────
# Interferensi dua komponen (Bagian 03)
A1_I, A2_I, B_I, H_I = 60, 50, 45, 28            # balok A dan B contoh (mm)
DELTA_I = 2.5                                    # tumpang tindih arah X (mm)
V_INT = DELTA_I * B_I * H_I                      # 3.150 mm³
# Fit ISO ⌀12 H7/g6 (Bagian 02) — deviasi dalam µm
D_FIT = 12
ES_LUB, EI_LUB = 18, 0                           # lubang H7 (10–18 mm): IT7 = 18 µm
ES_POR, EI_POR = -6, -17                         # poros g6: es = −6 µm, IT6 = 11 µm
C_MAKS = (ES_LUB - EI_POR) / 1000                # 0,035 mm
C_MIN_FIT = (EI_LUB - ES_POR) / 1000             # 0,006 mm
LUB_MAKS, LUB_MIN = D_FIT + ES_LUB / 1000, D_FIT + EI_LUB / 1000
POR_MAKS, POR_MIN = D_FIT + ES_POR / 1000, D_FIT + EI_POR / 1000
# Rumah berdinding tipis (Bagian 05)
A_H, B_H, H_H, W_H, P_H = 80, 60, 40, 4, 30
V_BALOK = A_H * B_H * H_H
V_POCKET = (A_H - 2 * W_H) * (B_H - 2 * W_H) * P_H
V_RUMAH = V_BALOK - V_POCKET                     # 79.680 mm³
DASAR_H = H_H - P_H
# Slot obround dan jarak tepi (Bagian 05)
A_S, B_S, LS_S, WS_S, T_S = 120, 50, 64, 18, 6
E_X = (A_S - (LS_S + WS_S)) / 2                  # 19 mm
E_Y = (B_S - WS_S) / 2                           # 16 mm
E_BATAS = 1.5 * T_S                              # aturan DFM: e ≥ 1,5·t
# Lengan berputar dekat dinding (Bagian 06)
R_L, W_L, W_DIND = 70, 24, 100
R_SUDUT = math.hypot(R_L, W_L / 2)               # 71,021 mm
C_MIN_L = W_DIND - R_SUDUT                       # 28,979 mm
TH_KRITIS = math.degrees(math.atan2(W_L / 2, R_L))
R_LAMA = 90                                      # lengan sebelum diperbaiki
R_SUDUT_LAMA = math.hypot(R_LAMA, W_L / 2)
C_MIN_LAMA = W_DIND - R_SUDUT_LAMA               # 9,20 mm
# Metrik perbaikan (Bagian 04 dan 06)
KT_SEBELUM, KT_SESUDAH = 2.85, 1.72
SIG_NOM = 59.0                                   # tegangan nominal bahu contoh (MPa)
SIG_SEBELUM = KT_SEBELUM * SIG_NOM
SIG_SESUDAH = KT_SESUDAH * SIG_NOM
TURUN_SIG = (SIG_SEBELUM - SIG_SESUDAH) / SIG_SEBELUM * 100
W_TIPIS = 1.8                                    # tebal dinding sebelum diperbaiki (mm)
W_MIN_PROSES = 3.0                               # batas tebal dinding proses contoh (mm)


# ─────────────────────────── gambar ───────────────────────────
def _garis(x1, y1, x2, y2, warna, w=1.2, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{warna}" stroke-width="{w}"{d}/>'


def _ling(cx, cy, r, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def _kotak(x, y, w, h, fill, stroke, lw=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{lw}"{d}/>'


def _poli(pts, fill, stroke, w=1.4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"{d}/>'


def gambar1():
    b = ""
    w, h = 124, 54
    tahap = [("Temuan", "gejala prototipe", "#22d3ee"), ("Kelompokkan", "fit · tabrak · DFM", "#f59e0b"),
             ("Metrik", "angka dari model", "#a855f7"), ("Perbaikan", "ubah parameter", "#ec4899"),
             ("Verifikasi", "metrik sesudah", "#00e09e")]
    xs = [10, 142, 274, 406, 538]
    for (a_, s_, c), x in zip(tahap, xs):
        b += box(x, 34, w, h, [a_, s_], c, 11.5)
    for i in range(4):
        b += arrow(xs[i] + w, 61, xs[i + 1], 61)
    b += t(34, 120, "Empat kelompok temuan:", 11, TX, "start", "600")
    for i, s_ in enumerate(["1. Fit — longgar atau sesak di luar rencana",
                            "2. Interferensi — komponen saling menembus",
                            "3. Kekuatan — tegangan/defleksi lewat batas",
                            "4. DFM — sulit, lama, atau mahal dibuat"]):
        b += t(34, 142 + i * 18, s_, 10.5, AX, "start")
    b += t(372, 120, "Tiap temuan wajib bermetrik:", 11, TX, "start", "600")
    for i, s_ in enumerate(["V_int (mm³) · c_maks, c_min (mm)",
                            "tebal dinding w · jarak tepi e (mm)",
                            "σ_maks (MPa) · SF · defleksi δ (mm)",
                            "c_min gerak (mm) · Check Geometry"]):
        b += t(372, 142 + i * 18, s_, 10.5, AX, "start")
    b += teks2(340, 232, "Tanpa angka, “kelihatannya rapat” bukan temuan: perbaikan baru dapat dipertanggungjawabkan bila metrik sebelum dan sesudah dibaca dari model yang sama", 11, AX, maks=74)
    return svg(680, 268, b, "Gambar 1 — Alur identifikasi masalah desain: temuan, metrik, perbaikan, verifikasi")


def gambar2():
    b = ""
    y0, sk = 158, 2.3
    Z = lambda mu: y0 - mu * sk  # noqa: E731
    b += _garis(40, y0, 424, y0, "#ef4444", 1.4, "7 4")
    b += t(40, 150, "garis nol", 9.5, "#ef4444", "start")
    b += t(430, y0 + 4, "0", 10, "#ef4444", "start", "700")
    kolom = [(96, "#22d3ee", EI_LUB, ES_LUB, "lubang ⌀12 H7", "EI = 0 / ES = +18"),
             (184, "#00e09e", EI_POR, ES_POR, "poros g6", "es = −6 / ei = −17"),
             (272, "#f59e0b", 1, 12, "poros k6", "ei = +1 / es = +12"),
             (360, "#ef4444", 18, 29, "poros p6", "ei = +18 / es = +29")]
    for (x, c, bawah, atas, nama, dev) in kolom:
        isi = "rgba(34,211,238,.20)" if c == "#22d3ee" else ("rgba(0,224,158,.20)" if c == "#00e09e" else ("rgba(245,158,11,.20)" if c == "#f59e0b" else "rgba(239,68,68,.20)"))
        b += _kotak(x, Z(atas), 56, (atas - bawah) * sk, isi, c, 1.6)
        b += t(x + 28, Z(atas) - 9, dev.split(" / ")[1], 9.5, c, "middle", "600")
        b += t(x + 28, Z(bawah) + 17, dev.split(" / ")[0], 9.5, c, "middle")
        b += t(x + 28, 228, nama, 10.5, c, "middle", "700")
    b += t(96 + 28, 246, "IT7", 9.5, AX, "middle")
    b += t(184 + 28, 246, "longgar", 9.5, "#00e09e", "middle")
    b += t(272 + 28, 246, "transisi", 9.5, "#f59e0b", "middle")
    b += t(360 + 28, 246, "sesak", 9.5, "#ef4444", "middle")
    b += t(40, 62, "Zona toleransi (µm) terhadap garis nol ⌀12", 11, TX, "start", "600")
    b += t(448, 62, "Lubang H: EI = 0, ES = +IT", 10.5, "#22d3ee", "start", "600")
    for i, s_ in enumerate(["Poros g, f, c: es < 0 → longgar", "Poros j, k, n: zona memotong 0",
                            "Poros p, s, u: ei > 0 → sesak", "c_maks = (ES − ei)/1000 mm",
                            "c_min = (EI − es)/1000 mm", f"⌀{D_FIT} H7/g6 (contoh materi):",
                            f"c_maks = {ind(C_MAKS, 3)} mm", f"c_min = {ind(C_MIN_FIT, 3)} mm"]):
        b += t(448, 84 + i * 19, s_, 10.5, "#00e09e" if i >= 6 else AX, "start")
    b += teks2(340, 262, "Huruf menentukan letak zona terhadap garis nol, angka menentukan lebarnya (kualitas IT); pasangan huruf-angka itulah yang menetapkan longgar, transisi, atau sesak", 11, AX, maks=76)
    return svg(680, 292, b, "Gambar 2 — Zona toleransi lubang dan poros ISO serta jenis suaian yang dihasilkan")


def gambar3():
    b = ""
    ax0, ay0, aw, ah = 34, 96, 112, 76
    bw, ov = 96, 13
    bx0 = ax0 + aw - ov
    b += _kotak(ax0, ay0, aw, ah, "rgba(34,211,238,.12)", "#22d3ee", 1.6)
    b += _kotak(bx0, ay0, bw, ah, "rgba(245,158,11,.12)", "#f59e0b", 1.6)
    b += _kotak(bx0, ay0, ov, ah, "rgba(239,68,68,.40)", "#ef4444", 1.4)
    b += t(ax0 + 42, ay0 - 14, "Komponen A", 10.5, "#22d3ee", "middle", "600")
    b += t(bx0 + bw - 38, ay0 - 14, "Komponen B", 10.5, "#f59e0b", "middle", "600")
    b += t(bx0 + ov / 2, ay0 - 34, "δ", 12, "#ef4444", "middle", "700")
    b += _garis(bx0 + ov / 2, ay0 - 28, bx0 + ov / 2, ay0 - 4, "#ef4444", 0.9, "3 2")
    b += arrow(ax0, ay0 + ah + 16, ax0 + aw, ay0 + ah + 16, "#22d3ee", 1.1)
    b += t(ax0 + aw / 2, ay0 + ah + 32, "a₁", 11, "#22d3ee", "middle", "600")
    b += arrow(bx0, ay0 + ah + 40, bx0 + bw, ay0 + ah + 40, "#f59e0b", 1.1)
    b += t(bx0 + bw / 2, ay0 + ah + 56, "a₂", 11, "#f59e0b", "middle", "600")
    b += t(ax0 - 8, ay0 + ah / 2 + 4, "b", 11, "#f59e0b", "end", "600")
    b += _garis(bx0 + ov / 2, ay0 + ah, 200, 214, "#ef4444", 0.9, "3 2")
    b += t(204, 218, "irisan A ∩ B", 10.5, "#ef4444", "start", "600")
    # inset: irisan sebagai slab δ × b × h
    b += t(352, 74, "Part → Boolean → Common", 10.5, "#ef4444", "middle", "600")
    sx, sy = 300, 104
    b += _poli([(sx, sy + 70), (sx + 26, sy + 46), (sx + 26, sy), (sx, sy + 24)], "rgba(239,68,68,.30)", "#ef4444", 1.3)
    b += _poli([(sx, sy + 24), (sx + 26, sy), (sx + 96, sy), (sx + 70, sy + 24)], "rgba(239,68,68,.45)", "#ef4444", 1.3)
    b += _poli([(sx, sy + 24), (sx + 70, sy + 24), (sx + 70, sy + 70), (sx, sy + 70)], "rgba(239,68,68,.20)", "#ef4444", 1.3)
    b += t(sx + 35, sy + 88, "δ", 11, "#ef4444", "middle", "700")
    b += t(sx + 104, sy + 16, "b", 11, "#ef4444", "start", "700")
    b += t(sx - 8, sy + 50, "h", 11, "#ef4444", "end", "700")
    b += t(352, 218, "V = δ · b · h", 11, TX, "middle", "600")
    b += t(448, 62, "Uji tabrakan dua komponen", 10.5, TX, "start", "600")
    for i, s_ in enumerate([f"contoh δ = {ind(DELTA_I, 1)} · b = {B_I} · h = {H_I}",
                            f"V_int = {ind(V_INT, 2)} mm³",
                            "V_int = 0 → tidak bertabrakan",
                            "distToShape → jarak minimum",
                            "   dan pasangan titik terdekat",
                            "Ulangi pada posisi kritis gerak,",
                            "bukan hanya posisi awal rakitan"]):
        b += t(448, 86 + i * 19, s_, 10.5, "#00e09e" if i == 1 else AX, "start")
    b += teks2(340, 244, "Common menyisakan bahan yang dimiliki kedua solid; volumenya adalah ukuran tabrakan yang bisa ditulis di laporan, bukan sekadar kesan visual", 11, AX, maks=74)
    return svg(680, 272, b, "Gambar 3 — Uji interferensi dua komponen dengan Part Common dan distToShape")


def gambar4():
    b = ""
    # Panel A — bahu tajam vs fillet
    b += t(124, 34, "Bahu tajam → fillet", 11, "#22d3ee", "middle", "600")
    b += _poli([(40, 182), (112, 182), (112, 162), (62, 162), (62, 106), (40, 106)], "rgba(239,68,68,.14)", "#ef4444", 1.6)
    b += _ling(62, 162, 7, "none", "#ef4444", 1.4)
    b += t(62, 196, f"Kt = {ind(KT_SEBELUM, 2)}", 10, "#ef4444", "middle", "700")
    b += f'<path d="M 140 182 L 212 182 L 212 162 L 176 162 A 14 14 0 0 1 162 148 L 162 106 L 140 106 Z" fill="rgba(0,224,158,.14)" stroke="#00e09e" stroke-width="1.6"/>'
    b += _ling(176, 148, 7, "none", "#00e09e", 1.4)
    b += t(178, 196, f"Kt = {ind(KT_SESUDAH, 2)}  (r)", 10, "#00e09e", "middle", "700")
    b += teks2(124, 216, "Fillet pada bahu menurunkan konsentrasi tegangan; σ_maks = Kt · σ_nom ikut turun", 9.5, AX, maks=32, jarak=13)
    # Panel B — dinding tipis vs tebal + rusuk
    b += t(340, 34, "Dinding tipis → tebal + rusuk", 11, "#f59e0b", "middle", "600")
    b += _poli([(256, 106), (264, 106), (264, 174), (316, 174), (316, 106), (324, 106), (324, 182), (256, 182)], "rgba(239,68,68,.14)", "#ef4444", 1.5)
    b += t(290, 196, f"w = {ind(W_TIPIS, 1)} mm", 10, "#ef4444", "middle", "700")
    b += _poli([(356, 106), (372, 106), (372, 174), (408, 174), (408, 106), (424, 106), (424, 182), (356, 182)], "rgba(0,224,158,.14)", "#00e09e", 1.5)
    b += _poli([(372, 174), (396, 174), (372, 142)], "rgba(0,224,158,.30)", "#00e09e", 1.2)
    b += t(390, 196, f"w = {ind(W_H, 1)} mm + rusuk", 10, "#00e09e", "middle", "700")
    b += teks2(340, 216, "Dinding di bawah batas proses retak atau melengkung; tebalkan atau tambah rusuk", 9.5, AX, maks=32, jarak=13)
    # Panel C — lubang terlalu dekat tepi
    b += t(556, 34, "Lubang terlalu dekat tepi", 11, "#a855f7", "middle", "600")
    b += _kotak(466, 112, 180, 64, "rgba(148,163,184,.10)", AX, 1.4)
    b += _ling(486, 144, 13, "#0a101f", "#ef4444", 1.6)
    b += _ling(586, 144, 13, "#0a101f", "#00e09e", 1.6)
    b += _garis(466, 190, 473, 190, "#ef4444", 1.2)
    b += t(480, 196, "e kecil → sobek", 10, "#ef4444", "middle", "700")
    b += t(600, 196, "e ≥ 1,5 · t", 10, "#00e09e", "middle", "700")
    b += teks2(556, 216, "Jarak tepi diukur dari tepi lubang ke tepi pelat, bukan dari pusat lubang", 9.5, AX, maks=32, jarak=13)
    b += teks2(340, 264, "Tiga kelemahan struktur yang paling sering muncul pada rakitan prototipe, dan perbaikan yang metriknya dapat diukur ulang di model", 11, AX, maks=76)
    return svg(680, 288, b, "Gambar 4 — Kelemahan struktur yang sering ditemukan dan perbaikan terukurnya")


def gambar5():
    b = ""
    pusat = [95, 265, 435, 600]
    b += t(pusat[0], 34, "Tebal dinding", 11, "#22d3ee", "middle", "600")
    b += _poli([(48, 96), (58, 96), (58, 156), (132, 156), (132, 96), (142, 96), (142, 166), (48, 166)], "rgba(34,211,238,.16)", "#22d3ee", 1.5)
    b += arrow(48, 82, 58, 82, "#00e09e", 1.1)
    b += t(70, 78, "w ≥ w_min", 10, "#00e09e", "start", "700")
    b += teks2(pusat[0], 190, "Tiap proses punya tebal dinding minimum; di bawahnya cacat isi atau retak", 9.5, AX, maks=26, jarak=13)
    b += t(pusat[1], 34, "Sudut tirus (draft)", 11, "#f59e0b", "middle", "600")
    b += _poli([(212, 166), (318, 166), (302, 96), (228, 96)], "rgba(245,158,11,.16)", "#f59e0b", 1.5)
    b += _garis(228, 96, 224, 166, AX, 0.9, "4 3")
    b += t(238, 88, "α ≈ 1°–3°", 10, "#f59e0b", "middle", "700")
    b += arrow(318, 122, 342, 108, "#00e09e", 1.1)
    b += t(330, 150, "lepas cetakan", 9.5, "#00e09e", "middle")
    b += teks2(pusat[1], 190, "Dinding sedikit miring agar benda lepas dari cetakan tanpa merusak muka", 9.5, AX, maks=26, jarak=13)
    b += t(pusat[2], 34, "Undercut", 11, "#ef4444", "middle", "600")
    b += _poli([(378, 166), (492, 166), (492, 96), (462, 96), (462, 124), (408, 124), (408, 96), (378, 96)], "rgba(239,68,68,.14)", "#ef4444", 1.5)
    b += _kotak(418, 128, 34, 14, "rgba(148,163,184,.25)", AX, 1.1)
    b += t(435, 152, "alat tak masuk", 9.5, "#ef4444", "middle", "700")
    b += teks2(pusat[2], 190, "Takik tersembunyi menuntut alat khusus atau cetakan bergeser; hindari bila bisa", 9.5, AX, maks=26, jarak=13)
    b += t(pusat[3], 34, "Lubang & jarak tepi", 11, "#a855f7", "middle", "600")
    b += _kotak(528, 108, 144, 52, "rgba(168,85,247,.12)", "#a855f7", 1.5)
    b += _ling(576, 134, 14, "#0a101f", "#a855f7", 1.5)
    b += arrow(528, 176, 562, 176, "#00e09e", 1.1)
    b += t(556, 192, "e", 10.5, "#00e09e", "middle", "700")
    b += t(624, 100, "⌀d standar", 9.5, "#a855f7", "middle")
    b += teks2(pusat[3], 208, "Pakai diameter mata bor standar dan jaga jarak tepi minimum", 9.5, AX, maks=26, jarak=13)
    b += teks2(340, 248, "Daftar periksa DFM dijalankan sebelum gambar kerja dilepas: tebal dinding, kemiringan, undercut, lubang standar, dan jarak tepi", 11, AX, maks=76)
    return svg(680, 276, b, "Gambar 5 — Daftar periksa DFM: tebal dinding, sudut tirus, undercut, lubang dan jarak tepi")


def gambar6():
    b = ""
    ox, oy = 150, 150
    b += _ling(ox, oy, R_SUDUT, "none", "#ec4899", 1.1, "5 4")
    b += _kotak(ox + W_DIND, 54, 12, 182, "rgba(148,163,184,.22)", AX, 1.2)
    for k in range(9):
        yy = 60 + k * 20
        b += _garis(ox + W_DIND, yy + 10, ox + W_DIND + 12, yy - 2, AX, 0.6)
    th = math.radians(-TH_KRITIS)
    rot = lambda x, y: (ox + x * math.cos(th) - y * math.sin(th), oy - (x * math.sin(th) + y * math.cos(th)))  # noqa: E731
    b += _poli([rot(0, -W_L / 2), rot(R_L, -W_L / 2), rot(R_L, W_L / 2), rot(0, W_L / 2)], "rgba(34,211,238,.20)", "#22d3ee", 1.8)
    b += _ling(ox, oy, 4, TX, "none", 1)
    b += _ling(ox + R_SUDUT, oy, 3.5, "#ec4899", "none", 1)
    b += t(ox - 10, oy + 18, "sumbu putar", 9.5, AX, "end")
    b += t(ox + W_DIND + 6, 46, "dinding", 9.5, AX, "middle")
    b += arrow(ox + R_SUDUT, oy - 26, ox + W_DIND, oy - 26, "#00e09e", 1.1)
    b += _garis(ox + R_SUDUT, oy - 20, ox + R_SUDUT, oy - 4, "#00e09e", 0.8, "3 2")
    b += t(ox + R_SUDUT + 14, oy - 34, "c_min", 10, "#00e09e", "start", "700")
    b += arrow(ox, oy + 84, ox + W_DIND, oy + 84, "#f59e0b", 1.1)
    b += t(ox + W_DIND / 2, oy + 78, "W", 11, "#f59e0b", "middle", "700")
    b += t(rot(R_L / 2, W_L / 2 + 14)[0], rot(R_L / 2, W_L / 2 + 14)[1], "R", 11, "#22d3ee", "middle", "700")
    b += t(ox + 4, oy - 84, "lintasan sudut terjauh √(R² + (w/2)²)", 9.5, "#ec4899", "middle")
    b += t(408, 44, "Metrik sebelum → sesudah", 11, TX, "start", "600")
    baris = [("V_int rakitan (mm³)", ind(V_INT, 0), "0", "0", "#00e09e"),
             ("c_min lengan (mm)", ind(C_MIN_LAMA, 2), ind(C_MIN_L, 2), "≥ 15", "#00e09e"),
             ("tebal dinding (mm)", ind(W_TIPIS, 1), ind(W_H, 1), "≥ " + ind(W_MIN_PROSES, 1), "#00e09e"),
             ("jarak tepi e (mm)", ind(6.0, 1), ind(E_X, 1), "≥ " + ind(E_BATAS, 1), "#00e09e"),
             ("Kt bahu", ind(KT_SEBELUM, 2), ind(KT_SESUDAH, 2), "≤ 2,00", "#00e09e")]
    b += t(408, 70, "metrik", 9.5, AX, "start", "700")
    b += t(556, 70, "sblm", 9.5, "#ef4444", "middle", "700")
    b += t(606, 70, "ssdh", 9.5, "#00e09e", "middle", "700")
    b += t(654, 70, "batas", 9.5, AX, "middle", "700")
    b += _garis(404, 78, 672, 78, "rgba(148,163,184,.4)", 1)
    for i, (nama, sb, ss, bt, c) in enumerate(baris):
        yy = 100 + i * 26
        b += t(408, yy, nama, 10, TX, "start")
        b += t(556, yy, sb, 10, "#ef4444", "middle")
        b += t(606, yy, ss, 10, c, "middle", "700")
        b += t(654, yy, bt, 9.5, AX, "middle")
        b += _garis(404, yy + 8, 672, yy + 8, "rgba(148,163,184,.18)", 0.8)
    b += t(408, 248, "Semua metrik dibaca ulang dari berkas yang sama", 9.5, "#00e09e", "start")
    b += teks2(340, 274, "Perbaikan yang tidak diukur ulang bukan perbaikan: tiap baris tabel harus punya angka sesudah dan batas penerimaan yang disepakati", 11, AX, maks=76)
    return svg(680, 300, b, "Gambar 6 — Jarak bebas lengan berputar dan tabel metrik sebelum-sesudah perbaikan")


# ─────────────────────────── kerangka halaman ───────────────────────────
SUBNAV = '''<div id="modulSubnav" class="subnav-bar show">
  <a href="#m-periksa">Daftar Periksa</a>
  <a href="#m-toleransi">Toleransi &amp; Fit</a>
  <a href="#m-tabrakan">Gerak &amp; Tabrakan</a>
  <a href="#m-struktur">Kelemahan Struktur</a>
  <a href="#m-dfm">DFM</a>
  <a href="#m-metrik">Perbaikan Terukur</a>
  <a href="#m-validasi">Check Geometry</a>
  <a href="#m-python">Python</a>
  <a href="#m-praktik">Praktik</a>
  <a href="#m-pustaka">Referensi</a>
</div>'''

HERO_SCHEMATIC_1 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="120" x2="92" y2="120" stroke="rgba(239,68,68,.45)" stroke-width="1.2" stroke-dasharray="5 3"/>
      <rect x="22" y="98" width="24" height="22" fill="rgba(0,229,255,.22)" stroke="rgba(0,229,255,.75)" stroke-width="1"/>
      <rect x="56" y="126" width="24" height="14" fill="rgba(0,230,118,.22)" stroke="rgba(0,230,118,.75)" stroke-width="1"/>
      <text x="34" y="92" text-anchor="middle" fill="rgba(0,229,255,.6)" font-family="JetBrains Mono" font-size="7">ES</text>
      <text x="68" y="152" text-anchor="middle" fill="rgba(0,230,118,.6)" font-family="JetBrains Mono" font-size="7">ei</text>
      <text x="50" y="176" text-anchor="middle" fill="rgba(148,163,184,.55)" font-family="JetBrains Mono" font-size="8">zona toleransi</text>
      <text x="50" y="192" text-anchor="middle" fill="rgba(255,179,0,.55)" font-family="JetBrains Mono" font-size="8">c = ES &#8722; ei</text>
    </svg>
  </div>'''

HERO_SCHEMATIC_2 = '''  <div class="hero-schematic">
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="70" width="46" height="44" fill="rgba(0,229,255,.14)" stroke="rgba(0,229,255,.7)" stroke-width="1.2"/>
      <rect x="52" y="70" width="40" height="44" fill="rgba(255,179,0,.14)" stroke="rgba(255,179,0,.7)" stroke-width="1.2"/>
      <rect x="52" y="70" width="8" height="44" fill="rgba(239,68,68,.45)" stroke="rgba(239,68,68,.9)" stroke-width="1"/>
      <circle cx="30" cy="160" r="22" fill="none" stroke="rgba(236,72,153,.5)" stroke-width="1" stroke-dasharray="4 3"/>
      <rect x="30" y="156" width="22" height="8" fill="rgba(0,229,255,.25)" stroke="rgba(0,229,255,.7)" stroke-width="1"/>
      <rect x="60" y="136" width="6" height="48" fill="rgba(148,163,184,.25)" stroke="rgba(148,163,184,.6)" stroke-width="1"/>
      <text x="50" y="130" text-anchor="middle" fill="rgba(239,68,68,.6)" font-family="JetBrains Mono" font-size="8">V_int = &#948;bh</text>
      <text x="50" y="204" text-anchor="middle" fill="rgba(0,230,118,.6)" font-family="JetBrains Mono" font-size="8">c_min &gt; 0</text>
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
    <span class="ff" style="left:4%;font-size:1rem;color:var(--cyan);--dur:18s;--del:0s">H7/g6</span>
    <span class="ff" style="left:19%;font-size:.85rem;color:var(--violet);--dur:22s;--del:4s">c_maks = ES &minus; ei</span>
    <span class="ff" style="left:34%;font-size:.78rem;color:var(--amber);--dur:16s;--del:8s">V_int = &delta;&middot;b&middot;h</span>
    <span class="ff" style="left:49%;font-size:.9rem;color:var(--pink);--dur:20s;--del:2s">Part Common</span>
    <span class="ff" style="left:64%;font-size:.8rem;color:var(--green);--dur:24s;--del:6s">distToShape</span>
    <span class="ff" style="left:80%;font-size:.72rem;color:var(--cyan);--dur:17s;--del:10s">Check Geometry</span>
    <span class="ff" style="left:11%;font-size:.68rem;color:var(--violet);--dur:19s;--del:12s">tebal dinding w</span>
    <span class="ff" style="left:60%;font-size:.72rem;color:var(--amber);--dur:21s;--del:14s">c_min = W &minus; &radic;(R&sup2; + (w/2)&sup2;)</span>
  </div>
{HERO_SCHEMATIC_2}
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan 13 &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">Dari Temuan</span><br>
      <em>ke Perbaikan:</em><br>
      <span class="hl-amber">Fit, Tabrakan, DFM</span>
    </h1>
    <p class="hero-sub">Rakitan yang “kelihatannya jadi” sering menyimpan empat masalah: suaian yang salah, komponen yang saling menembus, bagian yang lemah, dan bentuk yang sulit dibuat. Pertemuan ini melatih cara menemukannya secara sistematis lalu memperbaikinya dengan angka: daftar periksa masalah desain, toleransi dan fit ISO (ES, EI, es, ei), uji gerak dan tabrakan dengan Part Common serta distToShape, aturan DFM (tebal dinding, sudut tirus, undercut, jarak tepi), Part Check Geometry, dan pencatatan metrik sebelum–sesudah; tugasnya lima berkas FreeCAD dengan satu angka bacaan tiap berkas.</p>
    <div class="academic-roadmap" aria-label="Alur belajar modul">
      <div class="road-step"><span>01</span><strong>Pelajari</strong><small>Daftar periksa, fit ISO, dan DFM</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>02</span><strong>Eksplorasi</strong><small>Uji tabrakan, clearance, dan animasi</small></div><div class="road-arrow" aria-hidden="true">→</div>
      <div class="road-step"><span>03</span><strong>Terapkan</strong><small>Perbaikan terukur, diskusi, dan tugas</small></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">@@N_BAGIAN@@</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">@@N_ANIMASI@@</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>'''


# ─────────────────────────── MATERI ───────────────────────────
def materi():
    m = ""

    # 01 — Daftar periksa masalah desain
    isi = figure(1, "Alur identifikasi masalah desain: temuan, metrik, perbaikan, verifikasi", "Setiap gejala pada prototipe dikelompokkan lebih dulu (fit, interferensi, kekuatan, DFM), lalu diberi metrik yang bisa dibaca dari model. Perbaikan dipilih setelah metriknya jelas, dan metrik yang sama dibaca ulang sesudah model diubah.", gambar1())
    isi += cards([
        ("🔎", "Temuan, bukan kesan", "“Rodanya seret”, “dindingnya tipis”, “lengannya hampir kena” adalah gejala. Temuan baru lengkap bila disertai tempat (komponen dan muka mana), kondisi (posisi gerak, ukuran batas), dan angka yang dibaca dari model.", "gejala → temuan"),
        ("📐", "Metrik yang bisa dibaca", "Tiap kelompok temuan punya besaran bakunya: volume interferensi (mm³), kelonggaran maksimum dan minimum (mm), tebal dinding dan jarak tepi (mm), tegangan dan faktor keamanan, serta jarak bebas minimum selama gerak.", "satu temuan, satu angka"),
        ("🎯", "Batas penerimaan", "Angka tanpa batas tidak menolong. Tetapkan batas sebelum mengukur: V_int = 0, c_min &ge; kelonggaran kerja, tebal dinding &ge; batas proses, jarak tepi &ge; 1,5&nbsp;&times;&nbsp;tebal pelat, SF &ge; 2.", "metrik vs batas"),
        ("🔁", "Verifikasi ulang", "Perbaikan dinyatakan berhasil hanya bila metrik yang sama dibaca ulang pada berkas yang sudah diubah, bukan dari ingatan atau tangkapan layar lama. Catat sebelum dan sesudah pada satu tabel.", "sebelum → sesudah"),
    ])
    isi += tabel(["Kelompok temuan", "Gejala yang terlihat", "Alat baca di FreeCAD 1.0", "Metrik dan batas lazim"],
                 [["<strong>Fit (suaian)</strong>", "Poros goyang, atau tidak masuk sama sekali", "Std Measure Distance antar muka silinder; ukuran batas dari deviasi", "c_maks, c_min (mm, 4 desimal) sesuai kelas fit (Tugas 2)"],
                  ["<strong>Interferensi</strong>", "Komponen saling menembus, solver tetap diam", "Part &rarr; Boolean &rarr; Common; <code>distToShape</code>", "V_int = 0 mm&sup3; (Tugas 1)"],
                  ["<strong>Gerak</strong>", "Lengan menyenggol rangka pada sudut tertentu", "Placement Angle + Std Measure; loop <code>distToShape</code>", "c_min &gt; 0 dan &ge; batas kerja (Tugas 5)"],
                  ["<strong>Kekuatan</strong>", "Retak pada bahu, defleksi berlebih", "FEM (Pertemuan 9–10), K_t dari tabel", "&sigma;_maks &le; &sigma;_izin; SF &ge; 2"],
                  ["<strong>DFM — dinding</strong>", "Cacat isi pada cor, dinding melengkung saat dipesin", "Std Measure Distance dua muka; volume Pocket", "w &ge; batas proses (Tugas 3)"],
                  ["<strong>DFM — tepi</strong>", "Tepi lubang atau slot sobek", "Std Measure dari ujung fitur ke tepi benda", "e &ge; 1,5&nbsp;&times;&nbsp;t (Tugas 4)"],
                  ["<strong>Validitas model</strong>", "Boolean gagal, ekspor STEP menolak, FEM tidak mau mesh", "Part &rarr; Check Geometry, <code>Shape.isValid()</code>", "0 kesalahan sebelum langkah berikutnya"]])
    isi += kotak("tip-box", "💡 <strong>Cara Membaca Modul Ini:</strong> Bagian 02 membahasakan suaian dengan deviasi ISO (Tugas 2). Bagian 03 menguji tabrakan dengan Part Common dan distToShape (Tugas 1). Bagian 04 menelusuri kelemahan struktur dan perbaikannya, Bagian 05 menjalankan daftar periksa DFM (Tugas 3 dan 4), dan Bagian 06 menutup siklus dengan metrik sebelum–sesudah termasuk jarak bebas gerak (Tugas 5). Bagian 07 memeriksa kesehatan geometri, Bagian 08 mengotomasi pemeriksaan dengan Python, dan Bagian 09 melatih semuanya pada satu dokumen.")
    m += bagian(1, "m-periksa", "Daftar Periksa Masalah Desain:<br>Dari Gejala ke Angka", "Prototipe jarang gagal karena satu sebab besar; ia gagal karena beberapa hal kecil yang tidak pernah diukur. Bagian ini menyusun cara kerja tetap: kelompokkan temuan, beri metrik, tetapkan batas, perbaiki, lalu baca ulang.", isi, "DAFTAR PERIKSA MASALAH DESAIN")

    # 02 — Toleransi dan fit ISO
    isi = figure(2, "Zona toleransi lubang dan poros ISO serta jenis suaian yang dihasilkan", f"Huruf menentukan letak zona terhadap garis nol (H untuk lubang berarti EI = 0), angka menentukan lebar zona. Poros g berada di bawah garis nol (longgar), k memotongnya (transisi), dan p berada di atasnya (sesak). Contoh ⌀{D_FIT} H7/g6 memberi c_maks = {ind(C_MAKS, 3)} mm dan c_min = {ind(C_MIN_FIT, 3)} mm.", gambar2())
    isi += formula(1, "Kelonggaran Maksimum dan Minimum Suaian Lubang–Poros", r"c_{\text{maks}} = \frac{ES - ei}{1000}, \qquad c_{\text{min}} = \frac{EI - es}{1000}",
                   r"\(ES, EI\) = deviasi atas dan bawah lubang (µm) &nbsp;·&nbsp; \(es, ei\) = deviasi atas dan bawah poros (µm) &nbsp;·&nbsp; nilai negatif berarti di bawah garis nol. Contoh " + f"⌀{D_FIT} H7/g6 (ES = +{ES_LUB}, EI = 0, es = −6, ei = −17 µm)" + r": \(c_{\text{maks}} = " + ind(C_MAKS, 4) + r"\) mm, \(c_{\text{min}} = " + ind(C_MIN_FIT, 4) + r"\) mm.",
                   "Kelonggaran terbesar muncul pada kombinasi terburuk: lubang pada ukuran maksimumnya bertemu poros pada ukuran minimumnya. Sebaliknya, kelonggaran terkecil muncul saat lubang minimum bertemu poros maksimum; bila hasilnya negatif, pasangan itu sesak (interferensi). Di FreeCAD kedua keadaan dimodelkan dengan memasukkan ukuran batas ke konstrain Diameter — itulah yang diminta Tugas 2 — dan Std Measure Distance antara dua muka silinder sesumbu membaca setengahnya, yaitu celah radial.",
                   [("c_{\\text{maks}}", "Kelonggaran diametral maksimum (mm)"), ("c_{\\text{min}}", "Kelonggaran diametral minimum (mm)"), ("ES, EI", "Deviasi atas dan bawah lubang (µm)"), ("es, ei", "Deviasi atas dan bawah poros (µm)")])
    isi += tabel(["Istilah", "Arti", "Cara menuliskannya", "Catatan pemodelan"],
                 [["<strong>Ukuran nominal</strong>", "Ukuran dasar yang sama untuk lubang dan poros", "⌀12", "Angka yang ditulis di gambar sebelum kelas toleransi"],
                  ["<strong>Deviasi fundamental</strong>", "Jarak zona toleransi terdekat ke garis nol", "Huruf: H, g, k, p …", "Huruf besar untuk lubang, huruf kecil untuk poros"],
                  ["<strong>Kualitas IT</strong>", "Lebar zona toleransi", "Angka: IT6, IT7, IT11 …", "Makin kecil angkanya, makin mahal pembuatannya"],
                  ["<strong>Ukuran batas</strong>", "Ukuran terbesar dan terkecil yang masih diterima", "12,000 … 12,018 (lubang H7)", "Ukuran inilah yang dimasukkan ke Sketch saat memodelkan keadaan ekstrem"],
                  ["<strong>Suaian longgar</strong>", "Selalu ada celah (c_min &gt; 0)", "H7/g6, H8/f7, H11/c11", "Poros berputar atau bergeser di dalam lubang"],
                  ["<strong>Suaian transisi</strong>", "Bisa sedikit longgar atau sedikit sesak", "H7/k6, H7/n6", "Pemusatan teliti, dibongkar-pasang dengan palu lunak"],
                  ["<strong>Suaian sesak</strong>", "Selalu interferensi (c_maks &le; 0)", "H7/p6, H7/s6", "Dipres atau dipanaskan; jangan dipakai untuk bagian yang harus bergerak"]])
    isi += tabel(["Pasangan ⌀12", "ES / EI lubang (µm)", "es / ei poros (µm)", "c_maks (mm)", "Sifat"],
                 [["<strong>H7/g6</strong>", "+18 / 0", "−6 / −17", ind(C_MAKS, 4), "Longgar; poros berputar ringan"],
                  ["<strong>H7/k6</strong>", "+18 / 0", "+12 / +1", ind(0.017, 4), "Transisi; pemusatan teliti"],
                  ["<strong>H7/p6</strong>", "+18 / 0", "+29 / +18", ind(0.0, 4), "Sesak; interferensi sampai 29 µm"],
                  ["<strong>H11/c11</strong>", "+110 / 0", "−95 / −205", ind(0.315, 4), "Sangat longgar; engsel kasar, penutup"]])
    isi += anim_panel(1, "cyan", "Zona toleransi bergeser: dari suaian longgar ke sesak", "cvFit",
                      [("sl_ft_ES", "v_ft_ES", "Lebar zona lubang ES = IT (µm)", 6, 60, 1, 18, "18"),
                       ("sl_ft_es", "v_ft_es", "Deviasi fundamental poros saat PAUSE (µm)", -40, 30, 1, -6, "−6"),
                       ("sl_ft_it", "v_ft_it", "Lebar zona poros IT (µm)", 4, 40, 1, 11, "11")],
                      "btnFit", "toggleFit", "fitInfo",
                      "<strong>Cara membaca:</strong> batang biru adalah zona lubang (selalu mulai dari garis nol karena H), batang oranye adalah zona poros yang naik-turun mengikuti deviasi fundamentalnya. Saat berjalan, zona poros bergeser perlahan dari bawah ke atas garis nol sehingga suaian berubah longgar → transisi → sesak. Angka c_maks dan c_min mengikuti Persamaan (1); PAUSE lalu geser slider untuk menguji satu pasangan tertentu.")
    isi += kotak("warning-box", "⚠️ <strong>Jangan memodelkan ukuran nominal saja:</strong> sketsa ⌀12 untuk lubang dan ⌀12 untuk poros menghasilkan celah nol, sehingga Part Common tetap nol dan Anda merasa aman. Keadaan yang harus diperiksa adalah ukuran batas: lubang maksimum bertemu poros minimum (paling longgar) dan lubang minimum bertemu poros maksimum (paling sesak). Isi konstrain Diameter dengan empat desimal, karena beda 0,018 mm menentukan apakah poros berputar ringan atau macet.")
    m += bagian(2, "m-toleransi", "Toleransi dan Fit ISO:<br>Bahasa Suaian yang Dapat Diukur", "Tidak ada benda yang dibuat tepat pada ukuran nominal. Bagian ini membaca sistem ISO 286 — deviasi fundamental, kualitas IT, ukuran batas — lalu menghitung kelonggaran maksimum dan minimum yang menentukan apakah pasangan lubang–poros longgar, transisi, atau sesak.", isi, "TOLERANSI DAN FIT ISO")

    # 03 — Uji gerak dan tabrakan
    isi = figure(3, "Uji interferensi dua komponen dengan Part Common dan distToShape", f"Komponen B digeser sehingga menumpang A sejauh δ arah X. Part → Boolean → Common menyisakan slab δ × b × h yang volumenya adalah ukuran tabrakan; contoh δ = {ind(DELTA_I, 1)}, b = {B_I}, h = {H_I} memberi V_int = {ind(V_INT, 2)} mm³. Bila tidak bertabrakan, Common kosong dan distToShape memberi jarak terdekat yang positif.", gambar3())
    isi += formula(2, "Volume Interferensi Dua Balok yang Saling Menumpang", r"V_{\text{int}} = \delta \cdot b \cdot h",
                   r"\(\delta\) = panjang tumpang tindih searah geseran (mm) &nbsp;·&nbsp; \(b, h\) = lebar dan tinggi penampang bersama (mm). Contoh " + f"δ = {ind(DELTA_I, 1)} mm, b = {B_I} mm, h = {H_I} mm" + r": \(V_{\text{int}} = " + ind(V_INT, 2) + r"\) mm³.",
                   "Bila dua balok sejajar sumbu dan hanya bergeser pada satu arah, daerah irisannya juga balok: penampangnya sama dengan penampang bersama dan panjangnya sama dengan tumpang tindih. Karena itu volume Common dapat dihitung tangan lebih dulu dan dipakai memeriksa apakah operasi Boolean berjalan benar. Untuk bentuk rumit angkanya tetap dibaca dari Common.Shape.Volume; nilai nol berarti kedua komponen paling banter bersinggungan, bukan saling menembus. Tugas 1 membaca angka ini dengan dua desimal.",
                   [("V_{\\text{int}}", "Volume interferensi (mm³)"), ("\\delta", "Tumpang tindih arah geser (mm)"), ("b", "Lebar penampang bersama (mm)"), ("h", "Tinggi penampang bersama (mm)")])
    isi += tabel(["Pemeriksaan", "Perintah / API", "Bacaan", "Kapan dipakai"],
                 [["Volume tabrakan", "Part &rarr; Boolean &rarr; Common", "mm&sup3;; 0 berarti aman", "Dua komponen pada satu posisi tertentu (Tugas 1)"],
                  ["Jarak terdekat", "<code>a.distToShape(b)[0]</code>", "mm + pasangan titik terdekat", "Kelonggaran yang harus dibuktikan positif"],
                  ["Jarak di GUI", "Std Measure Distance dua muka/rusuk", "mm", "Pemeriksaan cepat tanpa skrip (Tugas 4, 5)"],
                  ["Sapuan gerak", "Placement Angle/Base dalam loop + distToShape", "c_min dan sudut kritisnya", "Lengan berputar, peluncur, tuas (Tugas 5)"],
                  ["Tumpang tindih banyak komponen", "Loop pasangan komponen (Bagian 08)", "Matriks V_int antar pasangan", "Rakitan dengan banyak bagian"],
                  ["Pemeriksaan visual", "Transparansi + Std Section cutting", "Pengamatan, bukan bukti", "Menemukan calon masalah, lalu diukur"]])
    isi += anim_panel(2, "amber", "Dua komponen saling masuk: volume interferensi vs δ", "cvTabrak",
                      [("sl_tb_d", "v_tb_d", "Tumpang tindih δ saat PAUSE (mm)", 0, 12, 0.1, 2.5, "2,5"),
                       ("sl_tb_b", "v_tb_b", "Lebar penampang b (mm)", 20, 60, 1, 45, "45"),
                       ("sl_tb_h", "v_tb_h", "Tinggi penampang h (mm)", 10, 40, 1, 28, "28")],
                      "btnTabrak", "toggleTabrak", "tabrakInfo",
                      "<strong>Cara membaca:</strong> balok B bergerak maju-mundur terhadap A; daerah merah adalah hasil Part Common. Selama masih ada celah, V_int = 0 dan distToShape memberi jarak positif (hijau). Begitu B menembus A, volume merah tumbuh linear terhadap δ mengikuti Persamaan (2). PAUSE lalu kunci δ untuk membaca satu keadaan tertentu.")
    isi += cards([
        ("🧊", "Common bukan Cut", "Boolean Common menyisakan irisan, yaitu bahan milik kedua solid; Cut justru membuang. Untuk uji tabrakan selalu Common, dan batalkan (Ctrl+Z) atau sembunyikan hasilnya agar model asli tidak ikut termakan.", "A &cap; B"),
        ("📏", "distToShape", "<code>bentukA.distToShape(bentukB)</code> mengembalikan jarak minimum, pasangan titik terdekat, dan info geometrinya. Nilai 0 berarti bersentuhan atau menembus, sehingga perlu dipasangkan dengan Common untuk membedakan keduanya.", "jarak + titik"),
        ("🎞️", "Posisi kritis", "Mekanisme diperiksa pada titik mati, sudut ekstrem, dan posisi saat komponen paling berdekatan — bukan hanya posisi awal. Untuk lengan berputar, keadaan kritisnya adalah saat sudut terjauhnya menghadap penghalang.", "uji sapuan penuh"),
        ("🚦", "Batas gerak", "Setelah jarak bebas diketahui, pasang batas gerak (Angle/Length Min-Max pada joint) atau stopper fisik agar tabrakan tidak mungkin terjadi walaupun operator salah menggerakkan.", "cegah, bukan hanya deteksi"),
    ])
    isi += kotak("info-box", "<strong>🧭 Urutan yang hemat waktu:</strong> jalankan dulu <code>distToShape</code> untuk semua pasangan komponen — murah, dan langsung memberi peringkat mana yang paling rawan — baru hitung Common pada pasangan yang jaraknya nol. Pada rakitan besar, saring lebih dulu dengan kotak pembatas: hanya pasangan yang BoundBox-nya saling memotong yang perlu diperiksa.")
    m += bagian(3, "m-tabrakan", "Uji Gerak dan Tabrakan:<br>Membuktikan Komponen Tidak Bertemu", "Tabrakan adalah masalah desain yang paling mudah dibuktikan sekaligus paling sering terlewat. Bagian ini memakai Part Common untuk mengukur volume interferensi, distToShape untuk jarak terdekat, dan pemindaian posisi gerak untuk mencari keadaan terkritis.", isi, "UJI GERAK DAN TABRAKAN")

    # 04 — Kelemahan struktur dan perbaikannya
    isi = figure(4, "Kelemahan struktur yang sering ditemukan dan perbaikan terukurnya", f"Bahu tajam memusatkan tegangan (K_t tinggi) dan menjadi tempat retak pertama; fillet menurunkannya. Dinding di bawah batas proses melengkung atau retak, sehingga ditebalkan atau diberi rusuk. Lubang yang terlalu dekat tepi menyobek bahan. Contoh: K_t turun dari {ind(KT_SEBELUM, 2)} menjadi {ind(KT_SESUDAH, 2)}, sehingga σ_maks turun {ind(TURUN_SIG, 1)}%.", gambar4())
    isi += formula(3, "Tegangan Maksimum pada Daerah Kritis dan Faktor Keamanan", r"\sigma_{\text{maks}} = K_t \cdot \sigma_{\text{nom}}, \qquad SF = \frac{\sigma_y}{\sigma_{\text{maks}}}",
                   r"\(K_t\) = faktor konsentrasi tegangan geometri &nbsp;·&nbsp; \(\sigma_{\text{nom}}\) = tegangan nominal penampang &nbsp;·&nbsp; \(\sigma_y\) = tegangan luluh bahan. Contoh " + f"σ_nom = {ind(SIG_NOM, 1)} MPa" + r": \(K_t = " + ind(KT_SEBELUM, 2) + r"\) memberi \(\sigma_{\text{maks}} = " + ind(SIG_SEBELUM, 1) + r"\) MPa, dan setelah difillet \(K_t = " + ind(KT_SESUDAH, 2) + r"\) memberi \(" + ind(SIG_SESUDAH, 1) + r"\) MPa.",
                   "Retak hampir selalu dimulai pada perubahan bentuk mendadak: bahu tajam, ujung slot, pangkal rusuk, dan tepi lubang. Faktor K_t menyatakan berapa kali tegangan lokal melampaui tegangan nominal, dan ia ditentukan geometri, bukan besar beban. Memperbesar jari-jari fillet, melandaikan transisi penampang, serta menjauhkan fitur dari tepi menurunkan K_t hampir tanpa tambahan massa — perbaikan termurah setelah simulasi Pertemuan 10 dan 11.",
                   [("\\sigma_{\\text{maks}}", "Tegangan puncak lokal (MPa)"), ("K_t", "Faktor konsentrasi tegangan"), ("\\sigma_{\\text{nom}}", "Tegangan nominal penampang (MPa)"), ("SF", "Faktor keamanan"), ("\\sigma_y", "Tegangan luluh bahan (MPa)")])
    isi += tabel(["Kelemahan", "Tanda pada model atau prototipe", "Perbaikan yang lazim", "Metrik yang dibaca ulang"],
                 [["<strong>Bahu tajam</strong>", "Kontur tegangan menyala di sudut dalam; retak dari sudut", "Fillet r &ge; 0,1&nbsp;&times;&nbsp;tebal; transisi bertingkat", "K_t dan &sigma;_maks (MPa)"],
                  ["<strong>Dinding terlalu tipis</strong>", "Dinding melengkung, cacat isi pada benda cor", "Tebalkan w, atau tambahkan rusuk penguat", "w (mm) dan defleksi &delta; (mm)"],
                  ["<strong>Rusuk terlalu tinggi dan tipis</strong>", "Rusuk sendiri tertekuk", "Tebal rusuk &asymp; 0,6&nbsp;&times;&nbsp;tebal dinding, tinggi &le; 3&nbsp;&times;&nbsp;tebalnya", "Rasio tinggi terhadap tebal rusuk"],
                  ["<strong>Lubang dekat tepi</strong>", "Tepi menggelembung atau sobek", "Geser lubang ke dalam atau perlebar pelat", "Jarak tepi e (mm)"],
                  ["<strong>Ulir pada dinding tipis</strong>", "Ulir tercabut saat dikencangkan", "Tambah boss, pakai insert, perpanjang pengikatan", "Panjang pengikatan dibagi diameter baut"],
                  ["<strong>Penampang berubah mendadak</strong>", "Defleksi dan tegangan melonjak di satu titik", "Tirus bertahap, tambah pelat buhul", "&sigma;_maks, SF, dan massa (g)"]])
    isi += cards([
        ("🧩", "Perbaiki penyebab, bukan gejala", "Menebalkan seluruh komponen memang menurunkan tegangan, tetapi menambah massa dan biaya. Menemukan satu daerah kritis lalu memfilletnya sering memberi penurunan tegangan yang sama dengan tambahan massa hampir nol.", "lokal &gt; global"),
        ("⚖️", "Perbaikan selalu berbiaya", "Setiap perubahan menukar sesuatu: massa, ruang, waktu pemesinan, atau jumlah operasi. Catat biaya itu di sebelah metriknya agar pemilihan dapat dipertanggungjawabkan.", "untung vs biaya"),
        ("🔗", "Efek samping ke rakitan", "Menebalkan dinding memperkecil ruang dalam dan bisa menimbulkan interferensi baru; memperbesar fillet dapat menabrak komponen tetangga. Setelah perbaikan struktur, ulangi uji tabrakan Bagian 03.", "periksa ulang rakitan"),
        ("📚", "Pakai hasil pertemuan sebelumnya", "K_t, konvergensi mesh, dan faktor keamanan sudah dibahas pada Pertemuan 10 dan 11. Modul ini memakainya sebagai alat diagnosis, bukan mengulang teorinya.", "FEM → diagnosis"),
    ])
    isi += kotak("tip-box", "💡 <strong>Fillet di FreeCAD:</strong> pada Part Design gunakan Fillet setelah fitur yang membentuk bahu, dan pilih rusuk (edge), bukan muka, agar radius mengikuti kontur. Bila Fillet gagal, biasanya radius lebih besar daripada bahan yang tersedia atau ada dua fillet yang saling bertemu; kecilkan radius, atau buat fillet dalam dua tahap dengan urutan berbeda.")
    m += bagian(4, "m-struktur", "Kelemahan Struktur:<br>Daerah Kritis dan Perbaikannya", "Setelah fit dan tabrakan beres, masalah berikutnya biasanya kekuatan: bahu tajam, dinding tipis, rusuk yang salah ukuran, dan fitur yang terlalu dekat tepi. Bagian ini mengenali tandanya di model dan memilih perbaikan yang dampaknya bisa diukur ulang.", isi, "KELEMAHAN STRUKTUR")

    # 05 — Design for Manufacturing
    isi = figure(5, "Daftar periksa DFM: tebal dinding, sudut tirus, undercut, lubang dan jarak tepi", f"Empat pemeriksaan yang dijalankan sebelum gambar kerja dilepas. Contoh materi: rumah {A_H} × {B_H} × {H_H} mm dengan Pocket {A_H - 2 * W_H} × {B_H - 2 * W_H} mm sedalam {P_H} mm menyisakan dinding {ind(W_H, 1)} mm dan dasar {ind(DASAR_H, 1)} mm, dengan volume {ind(V_RUMAH, 2)} mm³; pelat berslot {A_S} × {B_S} mm memberi jarak tepi e = {ind(E_X, 1)} mm arah X.", gambar5())
    isi += formula(4, "Volume Rumah Berdinding Tipis (Pad lalu Pocket Berpusat)", r"V = a\,b\,h - (a - 2w)(b - 2w)\,p, \qquad t_{\text{dasar}} = h - p",
                   r"\(a, b, h\) = ukuran luar balok (mm) &nbsp;·&nbsp; \(w\) = tebal dinding sisa di keempat sisi &nbsp;·&nbsp; \(p\) = kedalaman Pocket dari muka atas. Contoh " + f"a = {A_H}, b = {B_H}, h = {H_H}, w = {ind(W_H, 1)}, p = {P_H}" + r": \(V = " + ind(V_BALOK, 0) + r" - " + ind(V_POCKET, 0) + r" = " + ind(V_RUMAH, 2) + r"\) mm³.",
                   "Pocket persegi panjang yang dipusatkan pada muka atas membuang prisma bervolume (a − 2w)(b − 2w)·p dan menyisakan dinding setebal w di keempat sisi serta dasar setebal h − p. Dua angka terakhir itulah metrik DFM yang dibandingkan dengan batas proses: dinding yang terlalu tipis melengkung saat dipesin atau gagal terisi saat dicor, sedangkan dasar yang terlalu tipis melendut ketika dicekam. Tugas 3 meminta volume akhir sebagai bukti bahwa Pocket benar-benar berpusat dan sedalam yang diminta.",
                   [("V", "Volume solid akhir (mm³)"), ("a, b, h", "Ukuran luar balok (mm)"), ("w", "Tebal dinding sisa (mm)"), ("p", "Kedalaman Pocket (mm)"), ("t_{\\text{dasar}}", "Tebal dasar = h − p (mm)")])
    isi += formula(5, "Jarak Tepi Slot Obround pada Pelat", r"e_x = \frac{a - (L_s + w_s)}{2}, \qquad e_y = \frac{b - w_s}{2}",
                   r"\(a, b\) = panjang dan lebar pelat (mm) &nbsp;·&nbsp; \(L_s\) = jarak pusat-ke-pusat busur slot &nbsp;·&nbsp; \(w_s\) = lebar slot. Contoh " + f"a = {A_S}, b = {B_S}, L_s = {LS_S}, w_s = {WS_S}" + r": \(e_x = " + ind(E_X, 3) + r"\) mm dan \(e_y = " + ind(E_Y, 3) + r"\) mm, keduanya di atas batas " + f"1,5 × t = {ind(E_BATAS, 1)} mm" + r".",
                   "Slot obround dibatasi dua setengah lingkaran berjari-jari w_s/2, sehingga ujungnya berada pada x = ±(L_s + w_s)/2 — bukan pada ±L_s/2. Jarak tepi diukur dari ujung busur itu ke tepi benda terdekat, bukan dari pusat busur; kekeliruan ini membuat pelat tampak aman di gambar tetapi sobek saat dipunch. Tugas 4 membaca e_x dengan tiga desimal dan melaporkan e_y sebagai pembanding.",
                   [("e_x", "Jarak tepi arah panjang slot (mm)"), ("e_y", "Jarak tepi arah lebar slot (mm)"), ("L_s", "Jarak pusat-ke-pusat busur (mm)"), ("w_s", "Lebar slot (mm)"), ("a, b", "Panjang dan lebar pelat (mm)")])
    isi += tabel(["Aturan DFM", "Pedoman umum", "Alasan", "Cara memeriksanya di model"],
                 [["<strong>Tebal dinding minimum</strong>", "Pemesinan &ge; 1 mm; cetak 3D FDM &ge; 1,2 mm; cor aluminium &ge; 3 mm; cor besi &ge; 4 mm", "Dinding tipis melengkung, bergetar, atau tidak terisi logam cair", "Std Measure Distance antara dua muka sejajar; periksa juga dasar Pocket"],
                  ["<strong>Tebal seragam</strong>", "Hindari selisih tebal &gt; 2 kali di satu benda cor", "Bagian tebal membeku terakhir dan meninggalkan rongga susut", "Bandingkan tebal tiap dinding dari sketsa parametrik"],
                  ["<strong>Sudut tirus (draft)</strong>", "1°–3° pada dinding yang sejajar arah pelepasan", "Benda tersangkut di cetakan dan mukanya tergores", "Draft pada Part Design; periksa kemiringan muka di TechDraw"],
                  ["<strong>Undercut</strong>", "Hindari; bila terpaksa, pakai cetakan bergeser atau operasi kedua", "Alat atau cetakan tidak dapat menjangkau", "Putar model, cari muka yang tidak terlihat dari arah alat"],
                  ["<strong>Lubang standar</strong>", "Pakai diameter mata bor standar; kedalaman &le; 5&nbsp;&times;&nbsp;diameter", "Alat khusus mahal; lubang dalam sulit membuang tatal", "Lihat daftar diameter pada konstrain Diameter sketsa"],
                  ["<strong>Jarak tepi</strong>", "e &ge; 1,5&nbsp;&times;&nbsp;tebal pelat, dan tidak kurang dari diameter lubang", "Tepi sobek, melengkung, atau retak saat dipunch", "Std Measure dari ujung fitur ke tepi (Tugas 4)"],
                  ["<strong>Fillet dan sudut dalam</strong>", "Radius sudut dalam &ge; radius alat yang dipakai", "Endmill tidak bisa membuat sudut dalam yang benar-benar tajam", "Cocokkan radius fillet dengan diameter endmill yang tersedia"],
                  ["<strong>Toleransi secukupnya</strong>", "Beri toleransi ketat hanya pada muka fungsional", "Tiap tingkat IT yang lebih rapat menaikkan biaya", "Tandai muka fungsional di TechDraw, sisanya toleransi umum"]])
    isi += anim_panel(3, "violet", "Dinding tipis: tebal dinding w terhadap volume dan batas proses", "cvDinding",
                      [("sl_dd_w", "v_dd_w", "Tebal dinding w saat PAUSE (mm)", 1, 12, 0.5, 4, "4,0"),
                       ("sl_dd_p", "v_dd_p", "Kedalaman Pocket p (mm)", 5, 38, 1, 30, "30"),
                       ("sl_dd_min", "v_dd_min", "Batas tebal dinding proses (mm)", 1, 8, 0.5, 3, "3,0")],
                      "btnDinding", "toggleDinding", "dindingInfo",
                      f"<strong>Cara membaca:</strong> penampang rumah {A_H} × {H_H} mm dengan Pocket sedalam p. Saat berjalan, tebal dinding menipis dan menebal; begitu w turun di bawah batas proses, dinding berubah merah dan volume solid ikut mengecil mengikuti Persamaan (4). Perhatikan dasar h − p juga punya batasnya sendiri. PAUSE lalu kunci w untuk membaca satu keadaan.")
    isi += kotak("warning-box", "⚠️ <strong>Volume yang mengecut tidak selalu lebih baik:</strong> menipiskan dinding memang mengurangi massa dan biaya bahan, tetapi di bawah batas proses ia justru menaikkan biaya karena produk cacat, perlu perkakas khusus, atau harus dikerjakan ulang. Karena itu setiap penipisan dilaporkan bersama dua angka: volume (atau massa) baru dan tebal dinding tersisa, lalu dibandingkan dengan batas proses yang dipakai bengkel.")
    m += bagian(5, "m-dfm", "Design for Manufacturing:<br>Bentuk yang Bisa Dibuat dengan Wajar", "Model yang benar secara geometri belum tentu mudah dibuat. Bagian ini menjalankan daftar periksa DFM — tebal dinding, keseragaman tebal, sudut tirus, undercut, lubang standar, jarak tepi, dan toleransi — dengan angka yang semuanya dapat dibaca dari model.", isi, "DESIGN FOR MANUFACTURING")

    # 06 — Perbaikan terukur
    isi = figure(6, "Jarak bebas lengan berputar dan tabel metrik sebelum-sesudah perbaikan", f"Titik terjauh lengan dari sumbu putar adalah sudut ujungnya pada jarak √(R² + (w/2)²); ketika berputar, titik itu menyapu lingkaran. Contoh R = {R_L}, w = {W_L}, dinding pada W = {W_DIND} memberi c_min = {ind(C_MIN_L, 3)} mm pada θ* = {ind(TH_KRITIS, 2)}°. Tabel kanan mencatat lima metrik sebelum dan sesudah perbaikan berikut batas penerimaannya.", gambar6())
    isi += formula(6, "Jarak Bebas Minimum Lengan Berputar terhadap Dinding", r"c_{\text{min}} = W - \sqrt{R^{2} + \left(\tfrac{w}{2}\right)^{2}}, \qquad \theta^{*} = \arctan\frac{w/2}{R}",
                   r"\(W\) = jarak dinding dari sumbu putar (mm) &nbsp;·&nbsp; \(R\) = panjang lengan &nbsp;·&nbsp; \(w\) = lebar lengan &nbsp;·&nbsp; \(\theta^{*}\) = sudut saat sudut ujung lengan tepat menghadap dinding. Contoh " + f"W = {W_DIND}, R = {R_L}, w = {W_L}" + r": \(c_{\text{min}} = " + ind(C_MIN_L, 3) + r"\) mm pada \(\theta^{*} = " + ind(TH_KRITIS, 2) + r"\)°.",
                   "Kesalahan yang sering terjadi adalah memakai W − R, seolah ujung lengan berupa titik di sumbu tengahnya. Padahal titik terjauh adalah sudut ujung lengan, sejauh √(R² + (w/2)²) dari pusat putar, sehingga jarak bebas sebenarnya selalu lebih kecil daripada W − R. Selama satu putaran penuh, sudut itu menyapu lingkaran, dan jarak terdekat ke dinding datar terjadi tepat ketika ia menghadap dinding. Tugas 5 membaca c_min dengan tiga desimal; nilai negatif berarti lengan menabrak dinding dan model harus diperbaiki.",
                   [("c_{\\text{min}}", "Jarak bebas minimum (mm)"), ("W", "Jarak dinding dari sumbu putar (mm)"), ("R", "Panjang lengan (mm)"), ("w", "Lebar lengan (mm)"), ("\\theta^{*}", "Sudut kritis (derajat)")])
    isi += tabel(["Metrik", "Sebelum", "Sesudah", "Batas penerimaan", "Perubahan yang dilakukan"],
                 [["Volume interferensi V_int (mm&sup3;)", ind(V_INT, 2), "0,00", "0", "Komponen B digeser keluar sejauh &delta;"],
                  ["Jarak bebas lengan c_min (mm)", ind(C_MIN_LAMA, 2), ind(C_MIN_L, 2), "&ge; 15", f"Lengan dipendekkan {R_LAMA} &rarr; {R_L} mm"],
                  ["Tebal dinding w (mm)", ind(W_TIPIS, 1), ind(W_H, 1), "&ge; " + ind(W_MIN_PROSES, 1), "Pocket diperkecil, dinding ditebalkan"],
                  ["Jarak tepi slot e (mm)", "6,0", ind(E_X, 1), "&ge; " + ind(E_BATAS, 1), f"Slot diperpendek dan pelat diperlebar menjadi {A_S} mm"],
                  ["Faktor konsentrasi K_t", ind(KT_SEBELUM, 2), ind(KT_SESUDAH, 2), "&le; 2,00", "Fillet ditambahkan pada bahu"],
                  ["Tegangan puncak &sigma;_maks (MPa)", ind(SIG_SEBELUM, 1), ind(SIG_SESUDAH, 1), "&le; 125", f"Akibat langsung penurunan K_t ({ind(TURUN_SIG, 1)}%)"]])
    isi += anim_panel(4, "green", "Lengan berputar mendekati dinding: jarak bebas minimum", "cvLengan",
                      [("sl_lg_R", "v_lg_R", "Panjang lengan R (mm)", 40, 120, 1, 70, "70"),
                       ("sl_lg_w", "v_lg_w", "Lebar lengan w (mm)", 8, 40, 1, 24, "24"),
                       ("sl_lg_W", "v_lg_W", "Jarak dinding W (mm)", 60, 160, 1, 100, "100")],
                      "btnLengan", "toggleLengan", "lenganInfo",
                      "<strong>Cara membaca:</strong> lengan berputar terhadap sumbu di ujung kirinya; lingkaran putus-putus adalah lintasan sudut terjauhnya. Angka hijau adalah jarak sesaat ke dinding, angka di bawahnya adalah c_min menurut Persamaan (6). Perhatikan c_min selalu lebih kecil daripada W − R; bila lengan menembus dinding, angkanya menjadi negatif dan tulisannya merah.")
    isi += cards([
        ("📊", "Satu tabel, bukan cerita", "Laporan perbaikan yang baik muat dalam satu tabel: metrik, nilai sebelum, nilai sesudah, batas, dan perubahan yang dilakukan. Pembaca dapat memeriksa ulang tiap baris pada berkas yang sama.", "sebelum · sesudah · batas"),
        ("🔬", "Ukur dengan cara yang sama", "Bila nilai sebelum dibaca dengan Std Measure, nilai sesudah juga dibaca dengan Std Measure. Mengganti cara ukur di tengah jalan membuat selisihnya tidak bermakna.", "metode tetap"),
        ("🧾", "Perubahan yang dicatat", "Tulis parameter mana yang diubah dan berapa nilainya, bukan sekadar “diperbaiki”. Dengan model parametrik, satu baris catatan cukup untuk mengulang perbaikan yang sama.", "parameter, bukan kesan"),
        ("♻️", "Satu putaran belum tentu cukup", "Perbaikan sering memunculkan masalah baru di tempat lain. Setelah tabel selesai, jalankan lagi daftar periksa Bagian 01 dari awal sampai seluruh metrik memenuhi batas.", "iterasi sampai lolos"),
    ])
    isi += kotak("tip-box", "💡 <strong>Menyimpan bukti:</strong> beri nama berkas dengan tahapannya (<code>rumah_v1.FCStd</code>, <code>rumah_v2.FCStd</code>) dan simpan tangkapan layar Std Measure untuk tiap metrik. Bila memakai Spreadsheet, letakkan seluruh parameter pada satu lembar dengan alias, sehingga perbandingan sebelum–sesudah cukup dilakukan dengan mengganti angka di satu tempat lalu menekan recompute.")
    m += bagian(6, "m-metrik", "Perbaikan Terukur:<br>Metrik Sebelum dan Sesudah", "Perbaikan yang tidak diukur ulang tidak dapat dibuktikan. Bagian ini menutup siklus: menetapkan metrik dan batasnya, membaca jarak bebas gerak dengan benar, lalu menyusun tabel sebelum–sesudah yang dapat diperiksa siapa pun pada berkas yang sama.", isi, "PERBAIKAN TERUKUR")

    # 07 — Check Geometry dan validasi model
    isi = tabel(["Laporan Check Geometry", "Artinya", "Penyebab yang sering", "Perbaikan"],
                [["<strong>Invalid Shape / BOP check failed</strong>", "Topologi solid tidak konsisten", "Boolean beruntun pada muka yang tepat bersinggungan", "Geser salah satu bentuk 0,01 mm, atau ubah urutan Boolean"],
                 ["<strong>Self-intersection</strong>", "Muka memotong dirinya sendiri", "Fillet terlalu besar, Loft dengan profil bersilang", "Kecilkan radius; luruskan urutan titik profil"],
                 ["<strong>Not closed / Free edges</strong>", "Shell tidak tertutup sehingga bukan solid", "Impor STEP/STL cacat, muka hilang", "Part &rarr; Refine shape; tutup muka; buat ulang fitur"],
                 ["<strong>Small edge / Small face</strong>", "Ada rusuk atau muka sangat kecil", "Sisa pemotongan, sketsa dengan titik ganda", "Refine shape; bersihkan sketsa dari garis rangkap"],
                 ["<strong>Wrong orientation</strong>", "Arah normal muka terbalik", "Kompon dari beberapa sumber", "Part &rarr; Refine / rebuild; periksa arah Pad"],
                 ["<strong>Multiple solids</strong>", "Hasil bukan satu solid tunggal", "Bagian terlepas setelah Pocket, atau union tidak bersinggungan", "Periksa apakah memang dikehendaki; bila tidak, sambungkan geometrinya"]])
    isi += cards([
        ("🩺", "Kapan dijalankan", "Sebelum Boolean besar, sebelum ekspor STEP, sebelum analisis FEM, dan sebelum mengunggah berkas tugas. Menemukan kesalahan lebih awal jauh lebih murah daripada membongkar sepuluh fitur berikutnya.", "Part &rarr; Check Geometry"),
        ("🧪", "Pemeriksaan di skrip", "<code>Shape.isValid()</code> memberi jawaban ya/tidak dan <code>Shape.check()</code> menuliskan rinciannya; <code>Shape.Volume</code> yang nol atau negatif hampir selalu tanda geometri rusak.", "isValid() &middot; check()"),
        ("🧹", "Refine shape", "Part &rarr; Refine shape menghapus rusuk sisa antar muka sebidang setelah Boolean. Modelnya menjadi lebih ringan, mesh FEM lebih rapi, dan pemilihan muka di GUI jadi lebih mudah.", "bersihkan rusuk sisa"),
        ("📦", "Sebelum diunggah", "Pastikan dokumen menyimpan seluruh Body/Part yang diminta, hasil pemeriksaan bersih, dan angka bacaan diambil dari bentuk akhir — bukan dari fitur perantara yang masih tersembunyi di pohon.", "bersih sebelum dikirim"),
    ])
    isi += kotak("info-box", "<strong>🧭 Geometri rusak menular:</strong> solid yang tidak valid masih tampak wajar di layar, tetapi Boolean berikutnya bisa menghasilkan volume yang salah tanpa pesan kesalahan. Karena itu angka bacaan tugas hanya sah bila Check Geometry bersih; bila Anda merasa volume atau jarak yang terbaca “aneh”, periksa validitas geometri lebih dulu sebelum menyalahkan rumusnya.")
    m += bagian(7, "m-validasi", "Part Check Geometry:<br>Memastikan Model Layak Dipakai", "Sebelum mengukur apa pun, modelnya sendiri harus sehat. Bagian ini membaca laporan Part Check Geometry, mengenali kesalahan topologi yang paling sering muncul, dan menetapkan kapan pemeriksaan itu wajib dijalankan.", isi, "CHECK GEOMETRY")

    # 08 — Python console
    isi = kode("Python console — deteksi interferensi otomatis: Common, distToShape, dan matriks pasangan", '''import FreeCAD as App, Part
V = App.Vector
doc = App.newDocument("Latihan12")
A = Part.makeBox(60, 45, 28)                            # komponen A, sudut di titik asal
B = Part.makeBox(50, 45, 28, V(60 - 2.5, 0, 0))         # komponen B digeser: menumpang delta = 2.5 mm
irisan = A.common(B)                                    # sama dengan Part -> Boolean -> Common
print(f"V interferensi = {irisan.Volume:.2f} mm^3")      # 3150.00 = delta * b * h
print(f"jarak terdekat = {A.distToShape(B)[0]:.3f} mm")  # 0.000 -> bersentuhan atau menembus
# Matriks pasangan: semua kombinasi komponen rakitan diperiksa sekaligus
komponen = {"A": A, "B": B, "C": Part.makeBox(40, 45, 28, V(130, 0, 0))}
nama = list(komponen)
for i, n1 in enumerate(nama):
    for n2 in nama[i+1:]:
        v = komponen[n1].common(komponen[n2]).Volume
        d = komponen[n1].distToShape(komponen[n2])[0]
        print(f"{n1}-{n2}: V_int = {v:8.2f} mm^3, jarak = {d:7.3f} mm")
# A-B: 3150.00 / 0.000 (TABRAKAN)    A-C: 0.00 / 70.000    B-C: 0.00 / 22.500''', "Python (FreeCAD)")
    isi += kode("Python console — ukuran batas, kelonggaran fit ISO, dan celah radial pada model", '''import FreeCAD as App, Part
V = App.Vector
D, ES, EI, es, ei = 12.0, 18, 0, -6, -17                 # deviasi dalam mikrometer (lubang H7, poros g6)
lub_min, lub_maks = D + EI/1000, D + ES/1000
por_min, por_maks = D + ei/1000, D + es/1000
c_maks, c_min = lub_maks - por_min, lub_min - por_maks
print(f"lubang {lub_min:.4f} .. {lub_maks:.4f} mm | poros {por_min:.4f} .. {por_maks:.4f} mm")
print(f"c_maks = {c_maks:.4f} mm, c_min = {c_min:.4f} mm")            # 0.0350 / 0.0060
# Keadaan paling longgar dimodelkan: lubang pada ukuran maksimum, poros pada ukuran minimum
cincin = Part.makeCylinder(16, 10).cut(Part.makeCylinder(lub_maks/2, 10))
poros = Part.makeCylinder(por_min/2, 30, V(0, 0, -10))
print(f"celah radial model = {cincin.distToShape(poros)[0]:.4f} mm")   # 0.0175 = c_maks / 2
print(f"V interferensi = {cincin.common(poros).Volume:.4f} mm^3")      # 0.0000 -> masih longgar
# Keadaan paling sesak: ganti lub_maks -> lub_min dan por_min -> por_maks, lalu ulangi dua baris di atas''', "Python (FreeCAD)")
    isi += kode("Python console — pemindaian gerak, volume dinding tipis, dan validasi geometri", '''import FreeCAD as App, Part, math
V = App.Vector
R, w, Wd, t = 70.0, 24.0, 100.0, 8.0                     # lengan R x w x t, dinding pada x = Wd
lengan = Part.makeBox(R, w, t, V(0, -w/2, 0))            # sumbu putar Z di titik asal
dinding = Part.makeBox(10, 400, 60, V(Wd, -200, -10))
c_min, th_min = 1e9, 0
for th in range(360):                                    # satu putaran penuh, langkah 1 derajat
    putar = lengan.copy()
    putar.Placement = App.Placement(V(0, 0, 0), App.Rotation(V(0, 0, 1), th))
    d = putar.distToShape(dinding)[0]
    if d < c_min: c_min, th_min = d, th
print(f"c_min = {c_min:.3f} mm pada theta = {th_min} deg")                    # 28.979
print(f"rumus W - sqrt(R^2 + (w/2)^2) = {Wd - math.hypot(R, w/2):.3f} mm")    # 28.979
# Rumah berdinding tipis: metrik DFM dan volume akhir
a, b, h, wd, p = 80.0, 60.0, 40.0, 4.0, 30.0
rumah = Part.makeBox(a, b, h).cut(Part.makeBox(a-2*wd, b-2*wd, p, V(wd, wd, h-p)))
print(f"V rumah = {rumah.Volume:.2f} mm^3 (rumus {a*b*h-(a-2*wd)*(b-2*wd)*p:.2f})")   # 79680.00
print(f"isValid = {rumah.isValid()}, dinding {wd} mm, dasar {h-p} mm")
# Part -> Check Geometry di GUI menjalankan pemeriksaan yang sama dan merincinya di panel Tasks''', "Python (FreeCAD)")
    isi += kotak("tip-box", "💡 <strong>Sebelum Mengerjakan Tugas:</strong> jalankan ketiga cell dan cocokkan angkanya dengan komentar (volume interferensi " + ind(V_INT, 2) + " mm³, c_maks " + ind(C_MAKS, 4) + " mm dengan celah radial " + ind(C_MAKS / 2, 4) + " mm, jarak bebas lengan " + ind(C_MIN_L, 3) + " mm, volume rumah " + ind(V_RUMAH, 2) + " mm³). Tugas tetap meminta model dibangun di GUI — Sketch, Pad, Pocket, Placement, Boolean — agar pohon dokumen terlihat di berkas .FCStd; Python di sini dipakai untuk memeriksa angka bacaan dan memindai posisi gerak yang jumlahnya terlalu banyak bila dilakukan satu per satu.")
    m += bagian(8, "m-python", "Python Console:<br>Pemeriksaan yang Berjalan Sendiri", "Cell pertama memeriksa tabrakan seluruh pasangan komponen sekaligus; cell kedua menghitung ukuran batas dan kelonggaran fit lalu membuktikannya pada model; cell ketiga memindai satu putaran gerak lengan, menghitung volume rumah berdinding tipis, dan memvalidasi geometrinya.", isi, "PYTHON CONSOLE")

    # 09 — Praktik terbimbing
    langkah = [("1", "Siapkan dua komponen", f"Buat dokumen baru. Part &rarr; Primitives &rarr; Box A berukuran {A1_I} × {B_I} × {H_I} mm di titik asal, lalu Box B berukuran {A2_I} × {B_I} × {H_I} mm dengan Placement Position x = {ind(A1_I - DELTA_I, 1)} mm sehingga B menumpang A sejauh δ = {ind(DELTA_I, 1)} mm."),
               ("2", "Ukur tabrakan", f"Pilih A dan B &rarr; Part &rarr; Boolean &rarr; Common. Baca Common.Shape.Volume (atau Std Measure Volume): {ind(V_INT, 2)} mm³, sama dengan δ·b·h. Catat sebagai nilai “sebelum”, lalu batalkan Boolean dengan Ctrl+Z."),
               ("3", "Perbaiki lalu verifikasi", "Ubah Placement Position x milik B menjadi tepat di ujung A sehingga keduanya hanya bersinggungan. Ulangi Common: volumenya harus 0 mm³, dan <code>A.distToShape(B)[0]</code> bernilai 0 karena bersentuhan. Beri jarak rakit kecil bila memang diinginkan celah."),
               ("4", "Modelkan keadaan fit ekstrem", f"Body baru: cincin (Sketch dua lingkaran sepusat, lubang pada ukuran maksimum ⌀{ind(LUB_MAKS, 4)}) di-Pad 10 mm, dan poros pada ukuran minimum ⌀{ind(POR_MIN, 4)} di-Pad 30 mm, sesumbu. Std Measure Distance antara dua muka silinder memberi celah radial {ind(C_MAKS / 2, 4)} mm; kalikan dua menjadi c_maks = {ind(C_MAKS, 4)} mm."),
               ("5", "Rumah berdinding tipis", f"Body baru: Sketch {A_H} × {B_H} mm &rarr; Pad {H_H} mm. Pada muka atas, Sketch {A_H - 2 * W_H} × {B_H - 2 * W_H} mm yang dipusatkan dengan konstrain Symmetric &rarr; Pocket Dimension {P_H} mm. Periksa tebal dinding {ind(W_H, 1)} mm dan dasar {ind(DASAR_H, 1)} mm dengan Std Measure; volume solid harus {ind(V_RUMAH, 2)} mm³."),
               ("6", "Slot dan jarak tepi", f"Body baru: pelat {A_S} × {B_S} × {T_S} mm simetris terhadap origin &rarr; Pad. Pada muka atas gambar satu slot obround (alat Slot) dengan jarak pusat-ke-pusat {LS_S} mm dan lebar {WS_S} mm &rarr; Pocket Through all. Std Measure dari ujung busur ke tepi pendek pelat memberi e = {ind(E_X, 3)} mm, di atas batas 1,5·t = {ind(E_BATAS, 1)} mm."),
               ("7", "Gerak, validasi, simpan", f"Body lengan {R_L} × {W_L} × 8 mm dengan sumbu putar Z di titik asal, dan dinding Part Box yang muka dalamnya di x = {W_DIND} mm. Putar Placement Angle ke θ* = {ind(TH_KRITIS, 2)}° lalu Std Measure Distance sudut lengan &rarr; muka dinding: {ind(C_MIN_L, 3)} mm. Jalankan Part &rarr; Check Geometry pada semua Body (harus bersih), lalu Ctrl+S ke <code>Latihan12_NIM.FCStd</code>.")]
    isi = '  <div class="cards reveal">\n'
    for no, judul, teks in langkah:
        isi += f'''    <div class="card">
      <div class="card-icon" style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--cyan)">{no}</div>
      <h3>{judul}</h3>
      <p>{teks}</p>
    </div>
'''
    isi += "  </div>\n"
    isi += tabel(["Gejala", "Penyebab yang sering", "Perbaikan"],
                 [["Common menghasilkan objek kosong padahal jelas menumpang", "Yang dipilih objek induk yang sudah termakan Boolean sebelumnya, atau salah satu bukan solid", "Batalkan Boolean terdahulu; periksa Check Geometry kedua bentuk"],
                  ["Volume Common jauh dari δ·b·h", "Placement B juga bergeser arah Y atau Z, sehingga penampang bersama mengecil", "Nolkan y dan z pada Placement Position; ukur ulang"],
                  ["Std Measure Distance memberi 0 padahal tampak ada celah", "Yang terpilih muka yang bersinggungan, bukan pasangan muka yang dimaksud", "Perbesar tampilan, pilih muka lewat pohon atau tekan Space untuk menyembunyikan komponen penghalang"],
                  ["Kelonggaran terbaca setengah dari perkiraan", "Yang diukur celah radial, sedangkan yang diminta kelonggaran diametral", "Kalikan dua: c_diametral = 2 × celah radial"],
                  ["Pocket tidak berpusat sehingga dinding tidak sama tebal", "Sketch Pocket hanya diberi jarak dari dua sisi", "Pakai konstrain Symmetric terhadap sumbu sketsa, atau beri jarak w dari keempat tepi"],
                  ["Jarak tepi slot terbaca lebih besar daripada hitungan", "Yang diukur dari pusat busur, bukan dari ujung busur", "Ukur dari titik ujung slot; ujungnya di ±(L_s + w_s)/2"],
                  ["Lengan menembus dinding padahal W &gt; R", "Yang dipakai W − R, bukan memperhitungkan sudut ujung lengan", "Pakai √(R² + (w/2)²) sesuai Persamaan (6)"],
                  ["Pocket membelah benda menjadi dua solid", "Kedalaman p melebihi tinggi h, atau dinding w terlalu besar", "Kembalikan p &lt; h dan (a − 2w) &gt; 0; jalankan Check Geometry"]])
    isi += kotak("tip-box", "💡 <strong>Daftar periksa sebelum mengunggah:</strong> (1) tiap tugas punya Body/objek yang diminta, bukan sisa percobaan yang tersembunyi; (2) ukuran dimasukkan lewat konstrain sketsa atau properti, bukan digeser dengan mouse; (3) Part &rarr; Check Geometry bersih untuk semua solid yang diukur; (4) angka bacaan diambil dari bentuk akhir dengan jumlah desimal yang diminta dan memakai koma sesuai isian; (5) berkas disimpan lewat Ctrl+S sebagai .FCStd tanpa spasi pada namanya, lalu diunggah pada kartu tugasnya masing-masing.")
    m += bagian(9, "m-praktik", "Praktik Terbimbing:<br>Audit Satu Dokumen dari Fit sampai Gerak", "Tujuh langkah berikut menjalankan seluruh daftar periksa pada satu dokumen: membuat tabrakan yang disengaja lalu mengukurnya, memperbaikinya, memodelkan fit pada ukuran batas, memeriksa dinding tipis dan jarak tepi, serta membaca jarak bebas gerak; ditutup tabel gejala dan daftar periksa unggah.", isi, "PRAKTIK TERBIMBING")

    refs = pm_ref(1, "cyan", "14,165,233", "FreeCAD Community", "FreeCAD 1.0 Documentation: Part Boolean (Common), Part CheckGeometry, Part RefineShape, Std Measure, Sketcher Slot, PartDesign Pocket, Part TopoShape (distToShape, isValid, common)", " (wiki.freecad.org), 2024–2026.", "Acuan nama perintah, laporan Check Geometry, serta API yang dipakai pada ketiga cell Python di Bagian 08.")
    refs += pm_ref(2, "amber", "249,115,22", "R. G. Budynas &amp; J. K. Nisbett", "Shigley's Mechanical Engineering Design", ", 11th ed. McGraw-Hill, 2020.", "Suaian dan toleransi ISO (deviasi fundamental, kualitas IT, suaian longgar/transisi/sesak) serta faktor konsentrasi tegangan pada bahu dan lubang.")
    refs += pm_ref(3, "violet", "168,85,247", "G. Boothroyd, P. Dewhurst, &amp; W. Knight", "Product Design for Manufacture and Assembly", ", 3rd ed. CRC Press, 2011.", "Dasar aturan DFM yang dipakai Bagian 05: tebal dinding minimum, keseragaman tebal, sudut tirus, undercut, dan penyederhanaan fitur.")
    refs += pm_ref(4, "green", "0,224,158", "F. E. Giesecke dkk.", "Technical Drawing with Engineering Graphics", ", 15th ed. Pearson, 2016.", "Penulisan toleransi dan suaian pada gambar kerja, ukuran batas, jarak tepi lubang dan slot, serta tanda pemesinan.")
    refs += pm_ref(5, "pink", "236,72,153", "M. Lombard", "Mastering SolidWorks", ". Wiley, 2019.", "Rujukan utama RPS: interference detection pada rakitan, pemeriksaan geometri model, dan kebiasaan memeriksa desain sebelum gambar kerja dilepas.")
    m += f'''<!-- ═══ PUSTAKA ═══ -->
<hr class="divider">
<div class="section" id="m-pustaka" style="padding-bottom:40px">
  <div class="section-label reveal">Referensi</div>
  <h2 class="section-title reveal">Daftar Pustaka</h2>
  <p class="section-desc reveal">Lima referensi inti modul ini: dokumentasi FreeCAD 1.0 sebagai acuan perintah dan API pemeriksaan, buku elemen mesin untuk suaian dan konsentrasi tegangan, buku DFMA untuk aturan pembuatan, buku gambar teknik untuk penulisan toleransi, dan buku CAD komersial untuk kebiasaan memeriksa rakitan.</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
{refs}  </div>

  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> halaman wiki Part Boolean, Part CheckGeometry, Part RefineShape, Std Measure, Sketcher CreateSlot, PartDesign Pocket dan PartDesign Fillet, serta Part TopoShape (Volume, common, cut, distToShape, isValid, BoundBox). Tabel deviasi ISO 286 tersedia pada lampiran buku elemen mesin; nilai yang dipakai di modul ini hanya contoh, sedangkan tugas memberikan deviasinya langsung di teks soal.
  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul 12 — Identifikasi Masalah Desain dan Solusi Optimasi · Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>'''
    return m


# ─────────────────────────── TUGAS ───────────────────────────
TUGAS_HERO = '''<div class="hero" data-tab="tugas" style="min-height:60vh">
  <div class="hero-waves">
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="wave-trace w1" d="" fill="none" stroke="rgba(124,77,255,.12)" stroke-width="1.5"/>
      <path class="wave-trace w2" d="" fill="none" stroke="rgba(0,229,255,.08)" stroke-width="1"/>
      <path class="wave-trace w3" d="" fill="none" stroke="rgba(255,179,0,.06)" stroke-width="1"/>
    </svg>
  </div>
  <div class="float-formulas">
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">Part Common</span>
    <span class="ff" style="left:28%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">c_maks = ES &minus; ei</span>
    <span class="ff" style="left:48%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">tebal dinding w</span>
    <span class="ff" style="left:68%;font-size:.75rem;color:var(--pink);--dur:21s;--del:3s">e = (a &minus; (Ls + ws))/2</span>
    <span class="ff" style="left:85%;font-size:.7rem;color:var(--green);--dur:22s;--del:11s">c_min gerak</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Tugas Pertemuan 13 · Identifikasi Masalah Desain dan Solusi Optimasi</div>
    <h1 class="hero-title"><span class="hl-amber">Tugas 12</span><br><em>Lima Pemeriksaan</em><br>Desain di FreeCAD</h1>
    <p class="hero-sub">10 soal pilihan ganda tentang daftar periksa masalah desain, deviasi dan suaian ISO, Part Common dan distToShape, aturan DFM, Check Geometry, serta perbaikan terukur, ditambah 5 tugas pemodelan: dua balok saling masuk (volume interferensi), fit lubang–poros pada ukuran batas (kelonggaran maksimum), rumah berdinding tipis dari Pad dan Pocket (volume), pelat berslot obround (jarak tepi arah X), dan lengan berputar dekat dinding (jarak bebas minimum). Setiap tugas mengunggah berkas .FCStd dan mengisi satu angka bacaan. Total 50 poin.</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-lbl">Pilihan Ganda</div></div>
      <div class="stat"><div class="stat-num">5</div><div class="stat-lbl">Tugas Pemodelan</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Total Poin</div></div>
    </div>
  </div>
</div>'''

# (teks soal, opsi A-D kanonik, judul singkat untuk ekspor). Kunci kanonik ada di seed backend.
MC = [
    ("Ketika prototipe rakitan bermasalah, langkah pertama yang benar adalah...",
     ["Menebalkan semua komponen agar lebih kuat", "Mengganti material dengan yang lebih mahal",
      "Mengelompokkan temuan (fit, interferensi, kekuatan, DFM) dan memberi tiap temuan metrik terukur sebelum memilih perbaikan",
      "Membuat ulang seluruh model dari awal"],
     "Langkah pertama audit desain"),
    ("<strong>Kelonggaran maksimum</strong> pasangan lubang–poros dihitung dari...",
     ["Deviasi atas lubang dikurangi deviasi bawah poros: c_maks = ES − ei", "Deviasi bawah lubang dikurangi deviasi atas poros: c_maks = EI − es",
      "Selisih ukuran nominal lubang dan poros", "Rata-rata kedua deviasi poros: c_maks = (es + ei)/2"],
     "Rumus kelonggaran maksimum"),
    ("<strong>Boolean Common</strong> pada dua komponen rakitan dipakai untuk...",
     ["Menggabungkan keduanya menjadi satu solid", "Membuang bagian komponen pertama yang tertutup komponen kedua",
      "Membuat pandangan potong di TechDraw",
      "Menyisakan bahan yang dimiliki kedua solid, sehingga volumenya menjadi ukuran interferensi (0 berarti tidak bertabrakan)"],
     "Fungsi Boolean Common"),
    ("Fungsi <code>distToShape</code> pada TopoShape mengembalikan...",
     ["Volume irisan dua bentuk", "Jarak minimum antara dua shape beserta pasangan titik terdekatnya; nilai 0 berarti bersentuhan atau berpotongan",
      "Jumlah muka dan rusuk kedua bentuk", "Daftar kesalahan topologi kedua bentuk"],
     "Arti distToShape"),
    ("Pasangan <strong>H7/g6</strong> pada sistem ISO selalu menghasilkan...",
     ["Suaian longgar, karena poros g berdeviasi es negatif sehingga seluruh zonanya di bawah garis nol, sedangkan lubang H mulai dari EI = 0",
      "Suaian transisi, karena zona poros memotong garis nol", "Suaian sesak, karena poros selalu lebih besar daripada lubang",
      "Bergantung ukuran nominal: sesak untuk diameter kecil dan longgar untuk diameter besar"],
     "Sifat suaian H7/g6"),
    ("Balok a × b × h diberi Pocket berpenampang (a − 2w) × (b − 2w) sedalam p dari muka atas. Volume solid akhirnya adalah...",
     ["a·b·h − (a − 2w)(b − 2w)·h", "a·b·h − a·b·p", "(a − 2w)(b − 2w)·(h − p)", "a·b·h − (a − 2w)(b − 2w)·p"],
     "Volume rumah berdinding tipis"),
    ("Aturan DFM tentang <strong>jarak tepi</strong> lubang atau slot pada pelat menyatakan bahwa jarak itu...",
     ["Bebas, asalkan lubang tidak menembus tepi pelat",
      "Sekurang-kurangnya 1,5–2 kali tebal pelat dan tidak kurang dari diameter lubang, agar tepi tidak sobek atau melengkung",
      "Tepat setengah diameter lubang", "Minimal 10 mm untuk semua tebal pelat dan semua proses"],
     "Aturan jarak tepi DFM"),
    ("Lengan panjang R dan lebar w berputar pada sumbu di ujungnya, dengan dinding datar sejauh W dari sumbu. Jarak bebas minimumnya adalah...",
     ["W − R", "W − (R + w)", "W − √(R² + (w/2)²), karena titik terjauh lengan adalah sudut ujungnya", "W − w/2"],
     "Jarak bebas lengan berputar"),
    ("<strong>Part → Check Geometry</strong> dijalankan untuk...",
     ["Menghitung massa dan pusat massa model", "Membuat gambar kerja beserta toleransinya", "Mengukur jarak antara dua muka",
      "Memeriksa validitas topologi shape (BOP check, self-intersection, shell tidak tertutup) sebelum Boolean, ekspor STEP, atau FEM"],
     "Fungsi Check Geometry"),
    ("Sebuah perbaikan desain disebut <strong>terukur</strong> bila...",
     ["Tiap perubahan dicatat dengan metrik sebelum dan sesudah yang dibaca dari model yang sama, lalu dibandingkan dengan batas penerimaan",
      "Sudah disetujui dalam rapat tinjauan desain", "Tampilan isometriknya terlihat lebih rapi daripada sebelumnya",
      "Massanya berkurang, apa pun akibatnya terhadap kekuatan"],
     "Arti perbaikan terukur"),
]

TUGAS_LABELS = ["Dua balok saling masuk — volume interferensi (mm³)", "Fit lubang–poros ukuran batas — kelonggaran maksimum (mm)",
                "Rumah berdinding tipis — volume (mm³)", "Pelat berslot obround — jarak tepi e arah X (mm)",
                "Lengan berputar dekat dinding — jarak bebas minimum (mm)"]

# ─────────────────────────── FORUM ───────────────────────────
FORUM_POLL_BENAR = {1: 1, 2: 3, 3: 0}

FQ_JUDUL = [
    "Bagaimana menetapkan suaian poros pinion yang benar dan membuktikannya pada model?",
    "Bagaimana membuktikan tutup dan tuas selektor tidak bertabrakan sepanjang geraknya?",
    "Bagaimana menyusun usulan perbaikan DFM yang metriknya dapat diperiksa ulang?",
]
FQ_RINGKAS = [
    "Hitung c_maks dan c_min kedua kelas suaian dengan Persamaan (1), pilih yang sesuai fungsi, lalu jelaskan cara memodelkan ukuran batas dan mengukurnya di FreeCAD.",
    "Rancang uji tabrakan: Part Common pada posisi pemasangan dan pemindaian distToShape sepanjang putaran tuas, lalu hitung jarak bebas dengan Persamaan (6) dan usulkan batas gerak.",
    "Periksa tebal dinding dan jarak tepi terhadap batas proses (Bagian 05), usulkan perubahan parameter, lalu susun tabel metrik sebelum–sesudah beserta batas penerimaannya.",
]


def forum_page():
    q1 = fq(1, "14,165,233", "cyan", FQ_JUDUL[0],
            f"Poros pinion ⌀{D_FIT} mm berputar di dalam bus rumah gearbox. Gambar kerja prototipe menuliskan H11/c11 (c_maks {ind(0.315, 3)} mm) sehingga pinion goyang dan bunyi, padahal fungsi yang dituju adalah poros berputar ringan tanpa goyang. Hitung c_maks dan c_min untuk H11/c11 dan untuk H7/g6 (ES = +{ES_LUB}, EI = 0, es = −6, ei = −17 µm) dengan Persamaan (1), pilih kelas yang tepat, lalu jelaskan cara memodelkan keadaan paling longgar dan paling sesak di FreeCAD serta cara mengukurnya.",
            [f"⌀{D_FIT} H11/c11 → H7/g6", "c_maks = (ES − ei)/1000", "Std Measure celah radial"],
            "Kelonggaran maksimum suatu pasangan lubang–poros dihitung dari...",
            ["Selisih ukuran nominal lubang dan poros", "(ES − ei)/1000: lubang pada ukuran maksimum bertemu poros pada ukuran minimum",
             "Rata-rata deviasi lubang dan poros", "Lebar zona toleransi IT poros saja"],
            "✅ Tepat! Keadaan paling longgar adalah lubang terbesar bertemu poros terkecil, sehingga c_maks = (ES − ei)/1000 mm. Keadaan sebaliknya memberi c_min = (EI − es)/1000; kedua angka itulah yang menentukan apakah pinion berputar ringan atau goyang.",
            "❌ Ukuran nominal sama untuk keduanya sehingga selisihnya nol, rata-rata deviasi tidak punya makna fisik, dan lebar zona poros saja mengabaikan lubang. Lihat Bagian 02 dan Animasi 1.",
            "Petunjuk: (1) Hitung c_maks dan c_min kedua kelas suaian. (2) Pilih kelas yang sesuai fungsi dan beri alasannya. (3) Jelaskan pemodelan ukuran batas dan cara pengukurannya.")
    q2 = fq(2, "249,115,22", "amber", FQ_JUDUL[1],
            f"Tutup rumah gearbox ternyata menumpang rusuk dalam sejauh δ = {ind(DELTA_I, 1)} mm pada penampang {B_I} × {H_I} mm sehingga tidak dapat ditutup rapat, dan tuas selektor sepanjang R = {R_LAMA} mm dengan lebar w = {W_L} mm hanya berjarak {ind(C_MIN_LAMA, 2)} mm dari dinding rumah (W = {W_DIND} mm) padahal QA meminta sekurang-kurangnya 15 mm. Rancang prosedur pembuktian: Part Common pada posisi pemasangan, pemindaian distToShape sepanjang putaran tuas, dan perhitungan jarak bebas dengan Persamaan (6); usulkan perubahan yang membuat kedua metrik memenuhi batas.",
            [f"δ = {ind(DELTA_I, 1)} mm · V_int = {ind(V_INT, 0)} mm³", f"tuas R = {R_LAMA} · w = {W_L}", "target c_min ≥ 15 mm"],
            "Bukti paling kuat bahwa tutup dan tuas selektor tidak bertabrakan sepanjang geraknya adalah...",
            ["Tampilan isometrik pada posisi awal terlihat tidak bersentuhan", "Solver rakitan tidak menampilkan peringatan apa pun",
             "Semua komponen ditransparankan lalu diamati sekilas",
             "Part Common bervolume nol dan distToShape positif pada seluruh sudut yang dipindai, termasuk sudut kritis"],
            "✅ Tepat! Joint dan tampilan tidak memeriksa tabrakan; volume irisan nol dan jarak minimum positif pada posisi kritis adalah bukti berangka yang dapat diperiksa ulang siapa pun.",
            "❌ Satu posisi, ketiadaan peringatan, dan pengamatan sekilas bukan bukti. Lihat Bagian 03, Bagian 06, dan Animasi 2 serta 4.",
            "Petunjuk: (1) Tulis prosedur uji Common dan distToShape. (2) Hitung c_min dengan Persamaan (6). (3) Usulkan perubahan R, W, atau batas gerak agar c_min ≥ 15 mm.")
    q3 = fq(3, "168,85,247", "violet", FQ_JUDUL[2],
            f"Rumah gearbox dicor aluminium dengan dinding {ind(W_TIPIS, 1)} mm (batas proses {ind(W_MIN_PROSES, 1)} mm) dan lubang baut flens berjarak tepi 6,0 mm pada pelat setebal {T_S} mm. Bagian produksi menolak karena cacat isi dan tepi flens sobek. Periksa keduanya terhadap aturan Bagian 05, usulkan perubahan parameter yang konkret (tebal dinding, ukuran pelat, letak lubang), lalu susun tabel metrik sebelum–sesudah beserta batas penerimaannya dan jelaskan biaya dari tiap perubahan.",
            [f"dinding {ind(W_TIPIS, 1)} mm vs {ind(W_MIN_PROSES, 1)} mm", f"jarak tepi 6,0 mm vs {ind(E_BATAS, 1)} mm", "tabel sebelum → sesudah"],
            "Sebuah usulan perbaikan dapat disebut terukur bila...",
            ["Tiap metrik punya nilai sebelum, nilai sesudah, dan batas penerimaan yang dibaca dari berkas yang sama",
             "Disertai gambar tiga dimensi yang menarik", "Semua dinding ditebalkan dua kali lipat sekaligus",
             "Sudah disetujui kepala bengkel tanpa perlu angka"],
            "✅ Tepat! Tabel sebelum–sesudah dengan batas penerimaan membuat perbaikan dapat diperiksa ulang, dan memaksa tiap perubahan parameter dituliskan apa adanya.",
            "❌ Gambar yang menarik, penebalan menyeluruh, dan persetujuan lisan tidak membuktikan apa pun tentang kelayakan produksi. Lihat Bagian 05 dan Bagian 06.",
            "Petunjuk: (1) Bandingkan tebal dinding dan jarak tepi dengan batasnya. (2) Usulkan parameter baru yang konkret. (3) Susun tabel metrik sebelum–sesudah dan sebutkan biayanya.")
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
    <span class="ff" style="left:8%;font-size:.9rem;color:var(--cyan);--dur:19s;--del:0s">gearbox prototipe</span>
    <span class="ff" style="left:30%;font-size:.8rem;color:var(--violet);--dur:23s;--del:5s">H11/c11 &rarr; H7/g6</span>
    <span class="ff" style="left:55%;font-size:.85rem;color:var(--amber);--dur:17s;--del:9s">V_int &gt; 0</span>
    <span class="ff" style="left:78%;font-size:.75rem;color:var(--green);--dur:21s;--del:3s">c_min &ge; 15 mm</span>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Forum Diskusi · Pertemuan 13 · Identifikasi Masalah Desain dan Solusi Optimasi</div>
    <h1 class="hero-title" style="font-size:clamp(36px,5vw,60px)">Empat Temuan QA<br><em>pada Satu Gearbox</em></h1>
    <p class="hero-sub">Tim QA PT Roda Presisi menemukan suaian yang terlalu longgar, tutup yang tidak bisa menutup, tuas yang hampir menyentuh dinding, dan rumah cor yang ditolak produksi. Terapkan Pertemuan 13: deviasi dan suaian ISO, uji tabrakan dan gerak, aturan DFM, serta tabel metrik sebelum–sesudah, untuk mengubah keempat keluhan itu menjadi perbaikan yang berangka.</p>
  </div>
</div>

<div class="section">
  <div class="section-label reveal cyan-label">Skenario</div>
  <h2 class="section-title reveal">PT Roda Presisi —<br>Audit Prototipe Gearbox Reduksi Kecil</h2>

  <div class="forum-scenario reveal">
    <div class="scenario-label">📋 KASUS AUDIT DESAIN</div>
    <p>
      <strong style="color:var(--amber)">PT Roda Presisi</strong> membuat lima unit prototipe <strong style="color:var(--cyan)">gearbox reduksi kecil</strong> untuk mesin pengaduk. Tim QA mencatat empat temuan sekaligus: poros pinion &oslash;{D_FIT} mm dipasang dengan suaian H11/c11 sehingga goyang dan berbunyi; tutup rumah menumpang rusuk dalam sejauh &delta; = {ind(DELTA_I, 1)} mm pada penampang {B_I} &times; {H_I} mm sehingga tidak dapat menutup rapat; tuas selektor sepanjang {R_LAMA} mm dan lebar {W_L} mm hanya berjarak {ind(C_MIN_LAMA, 2)} mm dari dinding rumah; serta rumah cor berdinding {ind(W_TIPIS, 1)} mm dengan lubang baut flens berjarak tepi 6,0 mm.
    </p>
    <p style="margin-top:12px">
      Laporan pertama ditolak pembimbing karena berisi kalimat seperti “agak longgar”, “nyaris kena”, dan “dindingnya kurang tebal” <strong style="color:var(--cyan)">tanpa satu pun angka</strong>. Bagian produksi juga menolak rumah cor karena cacat isi pada dinding tipis, dan tepi flens sobek saat lubang dibuat.
    </p>
    <p style="margin-top:12px">
      Anda diminta menyusun <strong style="color:var(--cyan)">audit desain yang berangka</strong>: kelas suaian yang tepat beserta c_maks dan c_min-nya, bukti tabrakan dan jarak bebas gerak dari model, pemeriksaan DFM terhadap batas proses, dan satu tabel metrik sebelum&ndash;sesudah lengkap dengan batas penerimaan.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">
{kartu(f"Pinion &oslash;{D_FIT}: H11/c11 &rarr; H7/g6", "14,165,233", "cyan")}
{kartu(f"Tutup menumpang &delta; = {ind(DELTA_I, 1)} mm", "14,165,233", "cyan")}
{kartu(f"Tuas R = {R_LAMA}, w = {W_L}, W = {W_DIND}", "14,165,233", "cyan")}
{kartu(f"Dinding cor {ind(W_TIPIS, 1)} mm &middot; jarak tepi 6,0 mm", "239,68,68", "pink")}
    </div>
    <p style="margin-top:14px;font-size:14px;color:var(--muted)">Keempat keluhan itu sebenarnya empat metrik yang belum pernah dibaca: kelonggaran, volume interferensi, jarak bebas gerak, dan tebal dinding beserta jarak tepi. Forum ini mengajak Anda mengubah keluhan menjadi angka, lalu angka menjadi perbaikan.</p>
  </div>

  <!-- Canvas Animasi Forum -->
  <canvas id="cvForum" height="180" style="margin-bottom:12px;border-radius:12px"></canvas>
  <p style="font-size:13px;color:var(--muted);margin-bottom:40px;font-family:'JetBrains Mono',monospace;text-align:center">Prototipe gearbox: pinion pada bus, tutup yang menumpang rusuk, tuas selektor dekat dinding, dan flens berlubang baut</p>

  <!-- Pertanyaan Diskusi -->
  <div class="section-label reveal">Pertanyaan Diskusi</div>
  <h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>

{q1}{q2}{q3}'''


FORUM_SKENARIO_LMS = "PT Roda Presisi membuat lima unit prototipe gearbox reduksi kecil dan tim QA mencatat empat temuan: poros pinion &oslash;12 mm dipasang dengan suaian H11/c11 sehingga goyang dan berbunyi; tutup rumah menumpang rusuk dalam sejauh &delta; = 2,5 mm pada penampang 45 &times; 28 mm sehingga tidak dapat menutup rapat; tuas selektor sepanjang 90 mm dan lebar 24 mm hanya berjarak 9,20 mm dari dinding rumah (W = 100 mm) padahal QA meminta sekurang-kurangnya 15 mm; serta rumah cor berdinding 1,8 mm dengan lubang baut flens berjarak tepi 6,0 mm pada pelat 6 mm. Laporan pertama ditolak karena hanya berisi kesan tanpa angka. Susun audit desain berangka: kelas suaian yang tepat beserta c_maks dan c_min, bukti tabrakan dan jarak bebas gerak dari model (Part Common, distToShape), pemeriksaan DFM terhadap batas proses, dan tabel metrik sebelum&ndash;sesudah lengkap dengan batas penerimaan."
FORUM_CHIPS_LMS = ["pinion ⌀12: H11/c11 → H7/g6", "tutup menumpang δ = 2,5 mm", "tuas R = 90, w = 24, W = 100", "dinding cor 1,8 mm · jarak tepi 6,0 mm"]

FORUM_KANVAS = r"""// ════════════════════════════════════════════════════════════
// FORUM CANVAS — Audit prototipe gearbox: fit pinion, tutup menumpang, tuas dekat dinding (Pertemuan 13)
// ════════════════════════════════════════════════════════════
function drawForumCanvas() {
  const cv = document.getElementById('cvForum'); if (!cv) return;
  const W = cv.clientWidth || cv.width; if (cv.clientWidth > 0) cv.width = W; const H = cv.height;
  if (W < 120) return;   // tab tersembunyi: digambar ulang saat resize/tab dibuka
  const ctx = cv.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#020812'); bg.addColorStop(1, '#1a0a12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const s = Math.min(W / 700, H / 180);
  const X = x => W * 0.5 + (x - 350) * s, Y = y => H * 0.5 + (y - 90) * s;
  const garis = (x1, y1, x2, y2, w, lw) => { ctx.strokeStyle = w; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); };
  const ling = (x, y, r, isi, garisW) => { ctx.beginPath(); ctx.arc(X(x), Y(y), Math.max(0.1, r * s), 0, Math.PI * 2); if (isi) { ctx.fillStyle = isi; ctx.fill(); } if (garisW) { ctx.strokeStyle = garisW; ctx.lineWidth = 1.2; ctx.stroke(); } };
  const kotak = (x, y, w, h, isi, gr) => { ctx.fillStyle = isi; ctx.fillRect(X(x), Y(y), w * s, h * s); ctx.strokeStyle = gr; ctx.lineWidth = 1.3; ctx.strokeRect(X(x), Y(y), w * s, h * s); };
  // rumah gearbox dan tutup yang menumpang rusuk
  kotak(40, 44, 210, 110, 'rgba(34,211,238,.10)', 'rgba(34,211,238,.7)');
  kotak(40, 44, 210, 10, 'rgba(34,211,238,.18)', 'rgba(34,211,238,.5)');
  kotak(232, 30, 120, 26, 'rgba(245,158,11,.14)', '#f59e0b');
  kotak(232, 30, 18, 26, 'rgba(239,68,68,.45)', '#ef4444');
  // pinion pada bus (fit longgar)
  ling(120, 104, 34, 'rgba(148,163,184,.10)', 'rgba(148,163,184,.6)');
  ling(120, 104, 22, 'rgba(34,211,238,.14)', '#22d3ee');
  ling(120, 104, 15, 'rgba(245,158,11,.30)', '#f59e0b');
  ling(120, 104, 3, '#e2e8f0');
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; garis(120 + 22 * Math.cos(a), 104 + 22 * Math.sin(a), 120 + 28 * Math.cos(a), 104 + 28 * Math.sin(a), 'rgba(34,211,238,.55)', 1.2); }
  // tuas selektor dekat dinding kanan
  const th = -0.17, R = 74;
  ctx.save(); ctx.translate(X(392), Y(118)); ctx.rotate(th); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,224,158,.18)'; ctx.strokeStyle = '#00e09e'; ctx.lineWidth = 1.6;
  ctx.fillRect(0, -10, R, 20); ctx.strokeRect(0, -10, R, 20); ctx.restore();
  ctx.setLineDash([4, 3]); ling(392, 118, Math.hypot(R, 10), null, 'rgba(236,72,153,.55)'); ctx.setLineDash([]);
  ling(392, 118, 3.5, '#e2e8f0');
  kotak(494, 50, 10, 136, 'rgba(148,163,184,.22)', 'rgba(148,163,184,.6)');
  garis(392, 118, 494, 118, 'rgba(245,158,11,.5)', 1);
  // flens berlubang baut dengan jarak tepi kecil
  kotak(540, 74, 116, 46, 'rgba(168,85,247,.12)', '#a855f7');
  ling(556, 97, 9, '#0a101f', '#ef4444'); ling(640, 97, 9, '#0a101f', '#ef4444');
  ctx.fillStyle = 'rgba(226,232,240,.92)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText('pinion ⌀12 pada bus — fit terlalu longgar', X(120), Y(164));
  ctx.fillText('tutup menumpang δ', X(300), Y(22));
  ctx.fillText('tuas selektor — c_min ke dinding', X(410), Y(168));
  ctx.fillText('flens: jarak tepi kecil', X(598), Y(136));
  ctx.fillStyle = 'rgba(239,68,68,.95)'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left';
  ctx.fillText('■ empat temuan QA: c_maks salah kelas · V_int > 0 · c_min < 15 mm · dinding & jarak tepi di bawah batas', 14, 16);
}
// Resize handler — gambar ulang kanvas forum; animasi materi mengurus dirinya sendiri.
window.addEventListener('resize', () => {
  drawForumCanvas();
});"""
