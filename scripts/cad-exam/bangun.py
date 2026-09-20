# Membangun halaman ujian Pemodelan CAD dari kerangka Teknik Tenaga Listrik.
#
# Pakai (dari root repo):
#     python scripts/cad-exam/bangun.py uts      -> Pemodelan-Computer-Aided-Design/Exam/UTS.html
#     python scripts/cad-exam/bangun.py uas      -> Pemodelan-Computer-Aided-Design/Exam/UAS.html
#
# Sesudahnya jalankan penyuntik wajib repo (lihat Pedoman-Modul.md), lalu:
#     python scripts/cad-exam/periksa_exam.py
#     node scripts/validate-public-security.mjs
#
# ── APA YANG DIUBAH DARI KERANGKA ────────────────────────────────────────────
# Kerangka TTL adalah ujian 45 soal berbasis Python: 10 benar-salah + 20 pilihan
# ganda + 15 soal komputasi yang dijalankan di browser lewat Pyodide. Ujian
# Pemodelan CAD bentuknya lain dan sudah dikunci dosen:
#   • seluruh bagian BENAR-SALAH dibuang (bank.tf pada backend memang kosong);
#   • Pyodide, editor kode, dan runAndCheck dibuang seluruhnya — soal komputasi
#     diganti kartu unggah berkas .FCStd + satu kolom angka bacaan, meniru kartu
#     tugas yang sudah jalan di Modul/Modul-5.html;
#   • unggahan memanggil callable unggahBerkasTugas dengan `examId` (BUKAN
#     `modulId`), penilaian tetap lewat checkExamAnswer; server menolak angka
#     bila berkasnya belum ada;
#   • seluruh identitas course diganti (judul, EXAM_ID, kunci penyimpanan,
#     DB_PATH visitors/pemodelan_cad/<uts|uas>, SCHEDULE_PATH, nama unduhan,
#     tabel bobot Sub-CPMK, cakupan, registry chat AI).
#
# Jangkar memakai helper ber-assert di pustaka.py: satu jangkar meleset = build
# gagal, bukan halaman setengah jadi.
import importlib
import pathlib
import re
import sys

SCR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCR))
REPO = SCR.parent.parent

import kartu                      # noqa: E402
import pustaka                    # noqa: E402
from pustaka import Sunting       # noqa: E402

JENIS = (sys.argv[1] if len(sys.argv) > 1 else "").lower()
assert JENIS in ("uts", "uas"), "pakai: python scripts/cad-exam/bangun.py uts|uas"
K = importlib.import_module(JENIS)

PRE = K.PRE                      # 'UTS' / 'UAS' — awalan pengenal JS kerangka
pre = PRE.lower()
Pre = PRE.capitalize()           # 'Uts' / 'Uas'
LABEL = K.LABEL

SUMBER = REPO / K.SUMBER
TUJUAN = REPO / K.TUJUAN
TUJUAN.parent.mkdir(parents=True, exist_ok=True)

d = Sunting(SUMBER.read_text(encoding="utf-8"), K.TUJUAN)

# Kerangka UAS memakai nama penanda render campur aduk (_utsRendered pada halaman
# UAS). Samakan dulu supaya jangkar di bawah cukup satu bentuk.
d.s = re.sub(r"_(?:uts|uas)(Rendered|QuestionsLoading|ServerN|RenderRetryStarted)",
             lambda m: f"_{pre}{m.group(1)}", d.s)

POIN = pustaka.poin_soal(K.BOBOT, K.MAPPING, K.URUTAN, K.bobot_tipe)
TABEL_POIN = pustaka.json_poin(POIN)
POIN_MC = POIN["mc1"]
POIN_TUGAS = POIN["c1"]

# ═════════════════════════════════════════════════════════════════════════════
# 1. HEAD — judul, Pyodide dibuang, CSS kartu unggah
# ═════════════════════════════════════════════════════════════════════════════
d.ganti(f"<title>{LABEL} — {K.NAMA_PANJANG} | Teknik Tenaga Listrik</title>",
        f"<title>{K.JUDUL}</title>")
d.hapus('<script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>\n')

# CSS: seluruh gaya kartu benar-salah dibuang; hanya label (.tf-tag) dan lencana
# parameter NIM (.tf-nim-badge) yang dipertahankan karena dipakai kartu PG & tugas.
d.potong(
    "/* True/False Questions — adapted from MC, dual-option layout */",
    ".tf-card.tf-parametric .tf-submit:hover:not(:disabled){background:rgba(249,115,22,.18)}",
    """/* Label jenis soal & lencana parameter NIM — sisa gaya kartu benar-salah
   sengaja tidak ikut karena ujian ini tidak punya soal benar-salah. */
.tf-tag{display:inline-block;padding:2px 8px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;letter-spacing:.5px;margin-left:8px;text-transform:uppercase}
.tf-tag.tf-tag-theory{background:rgba(14,165,233,.1);color:var(--cyan);border:1px solid rgba(14,165,233,.2)}
.tf-tag.tf-tag-nim{background:rgba(249,115,22,.12);color:var(--amber);border:1px solid rgba(249,115,22,.25)}""",
)
d.ganti("@media (max-width:520px){\n  .tf-options{grid-template-columns:1fr}\n}\n", "")
d.ganti(".countdown-wrap,.reveal:not(.visible),.mc-submit,.comp-submit,.tf-submit,",
        ".countdown-wrap,.reveal:not(.visible),.mc-submit,.comp-submit,")

# CSS: blok Pyodide (textarea kode, kotak stdout, bilah status) -> kartu unggah.
d.potong(
    "/* ── Pyodide Python Runner ── */",
    "#pyodide-dot{width:8px;height:8px;border-radius:50%;background:var(--amber);animation:navPulse 1s ease-in-out infinite}",
    kartu.CSS,
)
# Salinan kedua .code-textarea (di blok input kolom) ikut dibuang.
d.ganti_re(
    r"\.code-textarea\{width:100%;min-height:140px;.*?\n\.code-textarea::placeholder\{color:#2a3a52;font-size:11px\}\n",
    "",
)
# Dua rujukan sisa .code-textarea (CSS cetak dan lapisan friksi) pindah ke kolom angka.
d.ganti("  /* Originals are hidden — print-visible clones used instead */\n  .code-textarea{display:none!important}",
        "  /* Kolom asli disembunyikan — versi cetak memakai salinan */\n  .berkas-row{display:none!important}")
d.ganti(".code-textarea,.v-input,[contenteditable=\"true\"]{", ".nilai-input,.v-input,[contenteditable=\"true\"]{")

# ═════════════════════════════════════════════════════════════════════════════
# 2. BODY — bilah status Pyodide, subnav, hero
# ═════════════════════════════════════════════════════════════════════════════
d.potong("<!-- Pyodide Status Bar -->", "</div>\n\n<!-- ─── NAVBAR TOP BAR", "<!-- ─── NAVBAR TOP BAR", False)

subnav = [
    '  <a href="#u-petunjuk">📋 Petunjuk</a>',
    '  <a href="#u-bagian-a">🅐 Pilihan Ganda</a>',
    '  <a href="#u-bagian-b">🅑 Tugas Pemodelan</a>',
]
if K.RAKITAN:
    subnav.append('  <a href="#u-bagian-c">🅒 Tugas Rakitan</a>')
subnav.append('  <a href="#u-finish">🏁 Selesai</a>')
d.potong(
    f'<div id="modulSubnav" class="subnav-bar show">',
    "</div>\n\n<!-- ═══════════════════════════════════════════════════════════\n     PAGE: MODUL",
    '<div id="modulSubnav" class="subnav-bar show">\n' + "\n".join(subnav) + "\n</div>\n",
    False,
)

d.potong(
    f'    <div class="hero-eyebrow"><div class="pulse-dot"></div>{LABEL} &nbsp;·&nbsp; Teknik Tenaga Listrik',
    "<!-- COUNTDOWN -->",
    f'''    <div class="hero-eyebrow"><div class="pulse-dot"></div>{LABEL} &nbsp;·&nbsp; Pemodelan CAD &nbsp;·&nbsp; 2026/2027</div>
    <h1 class="hero-title">
      <span class="hl-cyan">{K.NAMA_PANJANG.split()[0]} {K.NAMA_PANJANG.split()[1]}</span><br>
      <em>{K.NAMA_PANJANG.split()[2]}</em><br>
      <span class="hl-amber">Pemodelan CAD</span>
    </h1>
    <p class="hero-sub">{K.HERO_SUB}</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">{K.N_SOAL}</div><div class="stat-lbl">Soal</div></div>
      <div class="stat"><div class="stat-num">{K.N_BAGIAN}</div><div class="stat-lbl">Bagian</div></div>
      <div class="stat"><div class="stat-num">100</div><div class="stat-lbl">Total Poin</div></div>
      <div class="stat"><div class="stat-num">100</div><div class="stat-lbl">Skala Nilai</div></div>
    </div>
  </div>
</div>

<!-- COUNTDOWN -->''',
    False,
)
d.ganti(f"⏰ Hitung Mundur — Deadline {LABEL}", f"⏰ Hitung Mundur — Deadline {LABEL} Pemodelan CAD")

# ═════════════════════════════════════════════════════════════════════════════
# 3. BODY — petunjuk, bilah nilai, seluruh bagian soal, penutup
#    Satu rentang besar ditulis ulang: dari komentar Petunjuk sampai penutup
#    pembungkus bilah nilai. Lebih aman daripada menambal potongan TF/Pyodide
#    satu per satu di tengah kerangka.
# ═════════════════════════════════════════════════════════════════════════════
kartu_petunjuk = "\n".join(
    f'''    <div class="card">
      <div class="card-icon">{ikon}</div>
      <h3>{judul}</h3>
      <p>{isi}</p>
    </div>''' for ikon, judul, isi in K.KARTU_PETUNJUK
)

baris_obe = "\n".join(
    f'              <tr><td style="padding:2px 0">{sub}</td><td align="right" style="padding:2px 0">{bobot}</td>'
    f'<td align="right" style="padding:2px 0;color:#94a3b8">{soal}</td></tr>'
    for sub, bobot, soal, _ in K.BARIS_OBE
)

rincian = [
    '      <div>PG: <span id="scoreMC" style="color:var(--violet)">0</span>/<span id="scoreMCTotal" style="color:var(--muted)">—</span> poin</div>',
    '      <div>Tugas model: <span id="scoreCompEz" style="color:var(--amber)">0</span>/<span id="scoreCompEzTotal" style="color:var(--muted)">—</span> poin</div>',
]
if K.RAKITAN:
    rincian.append('      <div>Rakitan: <span id="scoreCompHard" style="color:var(--pink)">0</span>/<span id="scoreCompHardTotal" style="color:var(--muted)">—</span> poin</div>')
rincian_html = "\n".join(rincian)

bagian_c_html = ""
if K.BAGIAN_C:
    bagian_c_html = f'''
<!-- ═══ BAGIAN C — TUGAS RAKITAN ═══ -->
<hr class="divider" style="margin-top:64px">
<div class="section" id="u-bagian-c" style="padding-left:0;padding-right:0">
  <div class="section-label reveal" style="color:var(--pink)">{K.BAGIAN_C["label"]}</div>
  <h2 class="section-title reveal">{K.BAGIAN_C["judul"]}</h2>
  <p class="section-desc reveal">{K.BAGIAN_C["desc"]}</p>
  <div id="container-comp-hard" style="margin-top:32px"></div>
</div>
'''
else:
    # UTS tidak punya tugas rakitan: wadahnya tetap ada (tersembunyi) supaya
    # fungsi bersama yang menyapu keempat wadah tidak perlu bercabang.
    bagian_c_html = '\n<div id="container-comp-hard" style="display:none"></div>\n'

badan = f'''<!-- ═══ PETUNJUK PENGERJAAN {LABEL} ═══ -->
<hr class="divider" style="margin-top:64px">
<div class="section" id="u-petunjuk">
  <div class="section-label reveal">Petunjuk</div>
  <h2 class="section-title reveal">Petunjuk<br>Pengerjaan {LABEL}</h2>

  <div class="info-box reveal" style="border-left:4px solid var(--amber);background:rgba(249,115,22,.06);margin-top:24px">
    <strong style="color:var(--amber);font-size:15px">⚠ PENTING: Baca Sebelum Mengerjakan</strong>
    <p style="margin-top:12px;line-height:1.7">
      Setiap soal pada ujian ini memiliki <strong>parameter unik</strong> yang dihitung dari <strong>2 digit terakhir NIM Anda</strong> (variabel <code style="color:var(--cyan)">N</code>).
      Sebagai contoh, jika NIM Anda <code>41320120<span style="color:var(--amber)">52</span></code>, maka <code>N = 52</code>.
      <strong style="color:var(--amber)">Pengecualian:</strong> jika 2 digit terakhir NIM = <code>00</code>, maka <code>N</code> diambil dari <strong>2 digit sebelumnya</strong> (mis. NIM <code>4132012<span style="color:var(--amber)">20</span>00</code> → <code>N = 20</code>), guna menghindari parameter degenerate <code>N=0</code>.
      Dimensi model Anda berbeda dari mahasiswa lain, jadi <strong>angka bacaan teman Anda tidak akan diterima server</strong>.
    </p>
  </div>

  <div class="cards reveal" style="margin-top:32px">
{kartu_petunjuk}
  </div>

  <div class="info-box reveal" style="border-left:4px solid var(--cyan);margin-top:32px">
    <strong style="color:var(--cyan);font-size:15px">📝 Aturan Skoring</strong>
    <ul style="margin-top:12px;line-height:1.8;padding-left:24px">
      <li><strong>Total maksimal: 100 poin</strong>, dengan poin per soal proporsional bobot Sub-CPMK OBE.</li>
      <li><strong>Satu kesempatan</strong>: setiap soal hanya bisa dikirim <strong>satu kali</strong>. Setelah dikirim (benar atau salah), soal terkunci permanen.</li>
      <li><strong>Tugas pemodelan</strong>: berkas <code>.FCStd</code> wajib diunggah lebih dulu. Angka benar = poin penuh; angka salah tetapi berkas sudah terunggah = <strong>partial credit</strong>.</li>
      <li><strong>Durasi {K.DURASI}</strong>. Pengerjaan setelah tenggat masih dinilai dengan <strong>penalti {K.PENALTI}</strong>.</li>
      <li><strong>Konsolasi</strong>: jika hampir seluruh soal dicoba tetapi total poin = 0, otomatis +1 poin konsolasi.</li>
      <li>Setelah selesai, <strong>Export HTML</strong> untuk laporan kerja yang menjadi bukti pengumpulan.</li>
    </ul>
  </div>

  <div class="info-box reveal" style="border-left:4px solid var(--violet);margin-top:24px">
    <strong style="color:var(--violet);font-size:15px">🧊 Alur Pengerjaan Tugas Pemodelan</strong>
    <ol style="margin-top:12px;line-height:1.8;padding-left:24px">
      <li>Buka <strong>FreeCAD 1.0</strong> (lihat tab Setup FreeCAD pada Modul 1) dan baca dimensi pada kartu soal — angkanya sudah disesuaikan dengan NIM Anda.</li>
      <li>Modelkan sesuai instruksi, lalu baca angka yang diminta lewat properti objek, <em>Std Measure</em>, atau Python console FreeCAD.</li>
      <li>Simpan dokumen dengan <strong>Ctrl+S</strong> sebagai <code>.FCStd</code> — <em>bukan</em> Export ke STEP/STL.</li>
      <li>Pada kartu soal: pilih berkas → klik <strong>⬆ Unggah</strong> → tunggu status hijau berisi nama berkas dan SHA-256.</li>
      <li>Isikan angka bacaan ke kolom angka (koma maupun titik desimal diterima), lalu klik <strong>▶ Kirim &amp; Validasi</strong>.</li>
      <li>Setelah semua soal selesai, klik <strong>📄 Export HTML</strong> di panel nilai atas.</li>
      <li>Unggah berkas HTML hasil ekspor ke <strong style="color:var(--cyan)">{LABEL} Fast Learning (LMS Universitas Mercu Buana)</strong>.</li>
    </ol>
  </div>

  <div class="info-box reveal" style="border-left:4px solid var(--green);margin-top:24px">
    <strong style="color:var(--green);font-size:15px">🗓 Cakupan &amp; Jadwal</strong>
    <p style="margin-top:12px;line-height:1.7">
      {LABEL} Pemodelan CAD menilai <strong>{K.CAKUPAN}</strong> dengan bobot <strong>{K.BOBOT_SIA}</strong> dari nilai akhir mata kuliah.
      Masa ujian: <strong>{K.MASA_UJIAN}</strong>. Durasi pengerjaan {K.DURASI}.
    </p>
  </div>
</div>

<!-- ═══ BAGIAN A — PILIHAN GANDA ═══ -->
<hr class="divider" style="margin-top:64px">

<!-- ─── BILAH NILAI (sticky) — pembungkus section dibuat MENCAKUP semua subseksi
     soal supaya containing block-nya membentang sepanjang area soal, sehingga
     `position: sticky` tetap jalan saat scroll. ─── -->
<div class="section" style="padding-bottom:0">
  <div class="score-bar reveal">
    <div class="score-num" id="scoreDisplay">0</div>
    <div class="score-info">
      <div class="score-title">Nilai Sementara · {LABEL} Pemodelan CAD</div>
      <div id="scoreDetail" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text);margin-top:1px">0 / 100 poin</div>
          <details style="margin-top:6px;font-size:10px;line-height:1.4;color:#94a3b8" id="obeInfo">
            <summary style="cursor:pointer;color:#7c4dff;font-weight:600;user-select:none">ⓘ Cara hitung nilai &amp; bobot Sub-CPMK</summary>
            <div style="margin-top:6px;padding:8px 10px;background:rgba(124,77,255,.06);border-left:2px solid #7c4dff;border-radius:4px">
              <div style="margin-bottom:6px"><b style="color:#cbd5e1">Pemodelan CAD · {LABEL}</b> dengan total bobot Σ <b>{K.BOBOT_SIA}</b> dari nilai akhir mata kuliah.</div>
              <table style="width:100%;border-collapse:collapse;font-family:'JetBrains Mono',monospace;font-size:10.5px">
                <thead><tr style="border-bottom:1px solid rgba(124,77,255,.3)"><th align="left" style="padding:2px 0">Sub-CPMK</th><th align="right" style="padding:2px 0">Bobot</th><th align="right" style="padding:2px 0">Soal</th></tr></thead>
                <tbody>
{baris_obe}
                </tbody>
              </table>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8">Poin per soal sudah proporsional bobot Sub-CPMK (Σ poin di ujian = 100). Total ujian = Σ poin diperoleh = nilai 0-100, langsung sama dengan nilai di Dokumen OBE Rekap.</div>
            </div>
          </details>
      <div class="score-progress" style="height:5px;margin-top:4px"><div class="score-fill" id="scoreFill" style="height:100%;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--amber),var(--pink));border-radius:3px;width:0%;transition:width .5s"></div></div>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-align:right;line-height:1.35">
{rincian_html}
    </div>
    <button class="btn-export" id="btn-score-export" onclick="exportTugasHtml()" disabled style="padding:7px 14px;border-radius:8px;border:1px solid rgba(168,85,247,.4);background:rgba(168,85,247,.1);color:var(--violet);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;min-height:auto">📄 Export HTML</button>
    <!-- ─── Info panel + pesan status + sisa waktu ─── -->
    <div style="flex-basis:100%;border-top:1px solid var(--border);padding-top:4px;margin-top:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:12px;flex-shrink:0;line-height:1">📤</span>
      <div style="flex:1;min-width:200px;font-size:12px;color:var(--muted);line-height:1.35">Jawab soal &amp; kirim tugas pemodelan, lalu klik <strong style="color:var(--violet)">📄 Export HTML</strong> untuk mengunduh laporan {LABEL}.</div>
      <div id="exportTimeLeft" style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:800;color:var(--green);white-space:nowrap;flex-shrink:0;padding:5px 12px;background:rgba(0,224,158,.10);border:1.5px solid rgba(0,224,158,.30);border-radius:8px;line-height:1.2;letter-spacing:.3px">⏰ <span id="exportTimeText">--</span></div>
      <div id="export-blocked-msg" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--amber);text-align:center;flex-basis:100%;line-height:1.3"></div>
    </div>
  </div>

<div class="section" id="u-bagian-a" style="padding-left:0;padding-right:0">
  <div class="section-label reveal" style="color:var(--violet)">Bagian A</div>
  <h2 class="section-title reveal">Pilihan Ganda<br><em style="color:var(--violet)">{K.N_MC} Soal</em></h2>
  <p class="section-desc reveal">{K.BAGIAN_A_DESC}</p>
  <div id="container-mc" style="margin-top:32px"></div>
</div>

<!-- ═══ BAGIAN B — TUGAS PEMODELAN (UNGGAH .FCStd) ═══ -->
<hr class="divider" style="margin-top:64px">
<div class="section" id="u-bagian-b" style="padding-left:0;padding-right:0">
  <div class="section-label reveal" style="color:var(--amber)">Bagian B</div>
  <h2 class="section-title reveal">{K.BAGIAN_B_JUDUL}</h2>
  <p class="section-desc reveal">{K.BAGIAN_B_DESC}</p>
  <div class="info-box reveal" style="border-left:4px solid var(--amber);background:rgba(249,115,22,.06);margin-top:20px">
    <strong style="color:var(--amber);font-size:14px">⚠ Sebelum klik ▶ Kirim &amp; Validasi</strong>
    <p style="margin-top:10px;line-height:1.7;font-size:13.5px">Pastikan berkas <strong>.FCStd sudah terunggah</strong> (status hijau berisi nama berkas dan SHA-256 di kartu soal) dan <strong>angka bacaan disalin dari FreeCAD</strong> untuk varian N Anda. Setiap tugas hanya punya <strong>satu kesempatan kirim</strong>; berkas masih boleh diganti selama tugas belum dikirim.</p>
  </div>
  <div id="container-comp-ez" style="margin-top:32px"></div>
</div>
{bagian_c_html}
<!-- ═══ SELESAI ═══ -->
<hr class="divider" style="margin-top:64px">
<div class="section" id="u-finish" style="padding-left:0;padding-right:0">
  <div class="section-label reveal">Selesai</div>
  <h2 class="section-title reveal">Sudah <em>Selesai?</em></h2>
  <p class="section-desc reveal">{K.PENUTUP}</p>
  <div class="info-box reveal" style="border-left:4px solid var(--green);background:rgba(0,224,158,.06);margin-top:24px">
    <strong style="color:var(--green);font-size:15px">✅ Setelah Selesai</strong>
    <p style="margin-top:12px;line-height:1.7">
      1. Pastikan setiap tugas pemodelan sudah punya <strong>berkas .FCStd terunggah</strong> dan angka bacaannya terkirim.<br>
      2. Klik tombol <strong>📄 Export HTML</strong> di panel nilai atas (aktif setelah minimal satu soal dijawab).<br>
      3. Simpan berkas HTML hasil ekspor.<br>
      4. Unggah berkas HTML tersebut ke <strong style="color:var(--cyan)">{LABEL} Fast Learning (LMS Universitas Mercu Buana)</strong>.<br>
      5. Nilai Anda sudah otomatis tersimpan di basis data, sehingga dosen dapat memantau secara langsung.
    </p>
  </div>
</div>

</div><!-- end outer score-bar section wrapper (sticky containment) -->'''

d.potong(f"<!-- ═══ PETUNJUK PENGERJAAN {LABEL} ═══ -->",
         "</div><!-- end outer score-bar section wrapper (sticky containment) -->", badan)

d.ganti(f"Dosen melihat semua data mahasiswa untuk monitoring &amp; evaluasi {LABEL} Teknik Tenaga Listrik.",
        f"Dosen melihat semua data mahasiswa untuk monitoring &amp; evaluasi {LABEL} Pemodelan CAD.")

# ═════════════════════════════════════════════════════════════════════════════
# 4. SKRIP KLASIK — konfigurasi nilai, poin per soal, N dari NIM
# ═════════════════════════════════════════════════════════════════════════════
hard_count = 1 if K.RAKITAN else 0
hard_point = 6 if K.RAKITAN else 0
rincian_soal = (f"{K.N_MC} pilihan ganda + {K.N_TUGAS} tugas unggah sub-model"
                + (" + 1 tugas rakitan" if K.RAKITAN else ""))
d.ganti(f"""// ═══════════════════════════════════════════════════════════════
// SCORING CONFIG — Universal 50-poin (Pedoman-Modul §15.1a)
// ═══════════════════════════════════════════════════════════════
// Skema scoring: poin per soal proporsional bobot Sub-CPMK OBE.
// Σ poin per exam = 100 → display sebagai nilai 0-100 langsung.
// Bobot per Sub-CPMK di server: functions/index.js → OBE_EXAM_CONFIG.""",
        f"""// ═══════════════════════════════════════════════════════════════
// KONFIGURASI NILAI — {K.N_SOAL} soal ({rincian_soal})
// ═══════════════════════════════════════════════════════════════
// Poin per soal proporsional bobot Sub-CPMK OBE; Σ poin per ujian = 100,
// sehingga poin langsung tampil sebagai nilai 0-100.
// Bobot per Sub-CPMK di server: functions/index.js → OBE_EXAM_CONFIG.""")

# Blok komentar bank soal warisan Getaran (45 soal, 10 benar-salah) diganti.
d.ganti_re(
    r"// ═+\n// U(?:TS|AS) QUESTION DEFINITIONS — embed dari u(?:ts|as)_questions\.js\n// ═+\n"
    r"// ═+\n// U(?:TS|AS) GETARAN MEKANIK — Definisi Soal & NIM-Based Parametrization\n// ═+\n"
    r"// ?\n// 45 soal total.*?//   - Jawaban setiap mahasiswa berbeda\n",
    lambda _m: f"""// ═══════════════════════════════════════════════════════════════════════════
// SOAL {LABEL} PEMODELAN CAD — dirakit server, diparameterkan per NIM
// ═══════════════════════════════════════════════════════════════════════════
//
// {K.N_SOAL} soal: {rincian_soal}. Tidak ada soal benar-salah.
// Cakupan: {K.CAKUPAN}.
//
// Parameter per NIM:
//   - N = dua digit terakhir NIM (0-99; "00" memakai dua digit sebelumnya)
//   - Dimensi tiap tugas pemodelan dan nilai opsi pilihan ganda mengikuti N
//   - Teks soal TIDAK ada di halaman publik: dikirim getExamQuestions setelah
//     PIN + jadwal (mahasiswa) atau sesi admin (dosen) terverifikasi
""",
)
d.ganti("""// ── CHECK EXPORT READY ──
// Universal 50-poin: cek 10 MC + 10 Comp E/M + 5 Comp Hard. Generate IDs dari
// SCORE_CONFIG agar konsisten jika struktur soal berubah di masa depan.""",
        f"""// ── KESIAPAN EKSPOR ──
// Daftar qId dibangun dari SCORE_CONFIG ({rincian_soal}) supaya tetap
// konsisten bila susunan soal berubah.""")
# Teks banner "akses belum dibuka" masih menyarankan menyiapkan Jupyter.
d.ganti("            Anda dapat menyiapkan environment Python (Jupyter) terlebih dahulu.",
        "            Anda dapat menyiapkan FreeCAD 1.0 dan berkas kerja Anda terlebih dahulu.")
d.potong("const SCORE_CONFIG = {", "window.pointsToScore = pointsToScore;", f'''const SCORE_CONFIG = {{
  MC_COUNT:        {K.N_MC},
  MC_POINT:        1,
  COMP_EZ_COUNT:   {K.N_TUGAS},
  COMP_EZ_POINT:   2,
  COMP_HARD_COUNT: {hard_count},
  COMP_HARD_POINT: {hard_point},
  CONSOLATION_THRESHOLD: 30,   // sama dengan EXAM_CONFIG.consolationThreshold di server
  CONSOLATION_POINT:     1,
  get MC_TOTAL()       {{ return SECTION_TOTALS.MC; }},
  get COMP_EZ_TOTAL()  {{ return SECTION_TOTALS.E; }},
  get COMP_HARD_TOTAL(){{ return SECTION_TOTALS.H; }},
  get TOTAL()          {{ return 100; }}   // Σ poin per soal proporsional bobot Sub-CPMK OBE = 100
}};
window.SCORE_CONFIG = SCORE_CONFIG;

// Poin per soal, proporsional bobot Sub-CPMK OBE (Σ = 100). Dibangkitkan
// scripts/cad-exam/bangun.py dari BOBOT/MAPPING di scripts/cad-exam/{JENIS}.py,
// yang harus sama persis dengan OBE_EXAM_CONFIG["{K.EXAM_ID}"] di backend.
// Tabel ini hanya untuk TAMPILAN; nilai resmi selalu datang dari server.
const EXAM_QID_POINTS = {TABEL_POIN};
window.EXAM_QID_POINTS = EXAM_QID_POINTS;
function getQPoints(qId, fallback) {{
  const p = EXAM_QID_POINTS[qId];
  return (typeof p === "number") ? p : (fallback ?? 1);
}}

{kartu.is_hard(K.RAKITAN)}

// Total poin per bagian, dihitung dari EXAM_QID_POINTS.
// MC = pilihan ganda · E = tugas sub-model (c1..c{K.N_TUGAS}) · H = tugas rakitan.
const SECTION_TOTALS = (() => {{
  const t = {{ MC:0, E:0, H:0 }};
  for (const [qId, pts] of Object.entries(EXAM_QID_POINTS)) {{
    if (/^mc\\d+$/.test(qId)) t.MC += pts;
    else if (window._isHardComp(qId)) t.H += pts;
    else t.E += pts;
  }}
  return {{ MC: +t.MC.toFixed(2), E: +t.E.toFixed(2), H: +t.H.toFixed(2) }};
}})();

// Isi penyebut pada rincian nilai.
document.addEventListener("DOMContentLoaded", () => {{
  const set = (id, v) => {{ const el = document.getElementById(id); if (el) el.textContent = v; }};
  set("scoreMCTotal",       SECTION_TOTALS.MC);
  set("scoreCompEzTotal",   SECTION_TOTALS.E);
  set("scoreCompHardTotal", SECTION_TOTALS.H);
}});

function pointsToScore(pts) {{
  // Σ poin per ujian = 100 (proporsional bobot Sub-CPMK OBE), jadi pts langsung
  // sama dengan nilai 0-100. Dibulatkan hanya untuk tampilan.
  return Math.round(pts || 0);
}}
window.pointsToScore = pointsToScore;''')

# getN: satukan bentuknya di kedua kerangka (utamakan N dari server, lalu NIM
# dengan pengecualian dua digit "00" seperti deriveN di backend).
d.potong("// ── Helper: ambil 2 digit terakhir NIM sebagai integer ──", "window.getN = getN;",
         f'''// ── Helper: ambil 2 digit terakhir NIM sebagai integer ──
// Utamakan N yang dikirim server bersama soal; fallback ke NIM lokal dengan
// pengecualian yang sama seperti deriveN() di backend: dua digit terakhir "00"
// memakai dua digit sebelumnya supaya tidak ada parameter degenerate N = 0.
function getN() {{
  if (Number.isInteger(window._{pre}ServerN)) return window._{pre}ServerN;
  const me = (typeof window.getIdentity === 'function') ? window.getIdentity() : null;
  if (!me || !me.nim) return 0;
  const s = String(me.nim).replace(/\\D/g, '');
  if (s.length < 2) return 0;
  let n = parseInt(s.slice(-2), 10);
  if (n === 0 && s.length >= 4) n = parseInt(s.slice(-4, -2), 10) || 0;
  return n || 0;
}}
window.getN = getN;''')

# ═════════════════════════════════════════════════════════════════════════════
# 5. SKRIP KLASIK — buang seluruh mesin benar-salah
# ═════════════════════════════════════════════════════════════════════════════
d.ganti_re(
    r"// Helper: deteksi apakah qId termasuk Comp Hard.*?\n(let mcAnswered = \{\}, mcScores = \{\};)\n"
    r"let tfAnswered[^\n]*\n(?:let compHardPartial[^\n]*\n)?",
    lambda m: m.group(1) + "\n",
)
d.buang("function selectTF(qId, opt, isTrue) {",
        "// ─── PHASE 3 helpers — apply hasil dari server callable ke UI/state ──────────", False)
d.ganti_re(r"// ═+\n// TRUE/FALSE SYSTEM — U(?:TS|AS) Bagian A\n// ═+\n", "")
# Rentang ini sekaligus memuat `window.selectTF = selectTF;` di barisnya sendiri.
d.buang("async function checkTF(qId) {", "window.checkTF = checkTF;\n")

# Kerangka UAS masih membawa bank SVG massa-pegas-peredam milik Getaran. Bank soal
# CAD tidak pernah mengirim field `diagram`, jadi seluruhnya kode mati di sini.
if "const _svg = {" in d.s:
    d.buang("const _svg = {", "window._diagram = _diagram;\n")

# Dua komentar yang masih menyebut handler benar-salah dan runAndCheck.
d.ganti("// CRITICAL: Set ini di-akses dari BOTH regular script (selectMC, checkMC, selectTF,\n"
        "// checkTF, runAndCheck) DAN module script",
        "// PENTING: Set ini diakses dari skrip klasik (selectMC, checkMC, kirimTugas)\n"
        "// DAN skrip modul")
d.ganti("// Guard dipanggil di baris pertama tiap handler jawaban (selectMC/checkMC/selectTF/\n"
        "// checkTF/runAndCheck) — soal tetap TERLIHAT tapi tidak bisa dijawab/dinilai saat preview.",
        "// Penjaga dipanggil di baris pertama tiap handler jawaban (selectMC/checkMC/\n"
        "// unggahBerkas/kirimTugas) — soal tetap TERLIHAT tetapi tidak bisa dijawab,\n"
        "// diunggah, atau dinilai saat mode pratinjau.")

# _applyServerExamResult: cabang 'tf' dibuang.
d.ganti_re(r"[ ]*if \(type === 'tf'\)\s+tfAnswered\[qId\] = true;\n", "")
d.ganti_re(r"[ ]*if \(type === 'tf'\)\s+tfScores\[qId\] = delta;\n", "")
d.ganti_re(r"[ ]*if \(type === 'tf'\)\s+\{ tfScores\[qId\] = delta; tfAnswered\[qId\] = true; \}\n", "")
d.ganti_re(r"[ ]*if \(type === 'tf'\) delete tfAnswered\[qId\];\n", "")

# Kartu tugas yang terkunci dibuka lagi untuk akun simulasi.
d.ganti(
    "    if (sub) { sub.disabled = false; sub.textContent = '🔁 Simulasi — coba lagi';",
    "    if (typeof window._bukaTugasCad === 'function' && /^c\\d+$/.test(qId)) window._bukaTugasCad(qId);\n"
    "    if (sub) { sub.disabled = false; sub.textContent = '🔁 Simulasi — coba lagi';",
)

# ═════════════════════════════════════════════════════════════════════════════
# 6. SKRIP KLASIK — perender soal (PG + kartu unggah)
# ═════════════════════════════════════════════════════════════════════════════
if K.RAKITAN:
    render_hard = f'''
  // ── BAGIAN C: TUGAS RAKITAN ──
  const rakitanContainer = document.getElementById('container-comp-hard');
  if (rakitanContainer) {{
    rakitanContainer.innerHTML = '';
    (window.{PRE}_COMP_HARD || []).forEach((q, i) => {{
      rakitanContainer.appendChild(_buildTugasCard(q, i + 1, q, 'C', true));
    }});
  }}
'''
else:
    render_hard = ""

d.potong(f"let _{pre}Rendered = false;", f"window.render{PRE}Questions = render{PRE}Questions;", f'''let _{pre}Rendered = false;

// ═══════════════════════════════════════════════════════════════════════════
// PERENDER SOAL — kartu dibangun dari data yang sudah dirakit server
// (getExamQuestions), bukan dari bank soal di halaman publik.
// Bagian A pilihan ganda; Bagian B (dan C pada UAS) kartu unggah .FCStd.
// ═══════════════════════════════════════════════════════════════════════════
function render{PRE}Questions() {{
  if (_{pre}Rendered) return;   // hanya sekali (hindari render ganda)
  if (typeof window.{PRE}_MC === 'undefined') {{
    console.warn('[{PRE}] Soal belum dimuat');
    return;
  }}
  const N = (typeof window.getN === 'function') ? window.getN() : 0;
  console.log('[{PRE}] Merender soal dengan N =', N);

  // ── BAGIAN A: PILIHAN GANDA ──
  const mcContainer = document.getElementById('container-mc');
  if (mcContainer) {{
    mcContainer.innerHTML = '';
    (window.{PRE}_MC || []).forEach((q, i) => {{
      const data = q;   // sudah dirakit server (getExamQuestions)
      const num = i + 1;
      const isParam = q.parametric;
      const card = document.createElement('div');
      card.className = 'mc-card reveal' + (isParam ? ' mc-parametric' : '');
      const optsHtml = (data.options || []).map((opt, idx) => `
          <div class="radio-option" onclick="selectMC('${{q.id}}', this, ${{idx}})">
            <div class="radio-circle"></div>
            <span><strong style="color:var(--cyan);margin-right:6px">${{String.fromCharCode(65 + idx)}}.</strong> ${{opt}}</span>
          </div>`).join('');
      card.innerHTML = `
        <div class="mc-header">
          <div class="mc-num">A${{String(num).padStart(2, '0')}}</div>
          <div class="mc-q">
            ${{isParam ? `<div class="tf-nim-badge" style="background:rgba(168,85,247,.08);border-color:rgba(168,85,247,.25);color:var(--violet);margin-bottom:10px">📐 Parameter dari NIM Anda · N = ${{N}}</div>` : ''}}
            ${{data.text}}
            <span class="tf-tag ${{isParam ? 'tf-tag-nim' : 'tf-tag-theory'}}" style="margin-left:8px">${{isParam ? 'NIM-based' : 'Teori'}} · Modul ${{q.modul}}</span>
          </div>
          <div class="mc-pts">${{formatPoints(getQPoints(q.id, 1))}} poin</div>
        </div>
        <div class="radio-group" id="rg-${{q.id}}">${{optsHtml}}</div>
        <button class="mc-submit" id="sub-${{q.id}}" onclick="checkMC('${{q.id}}')" disabled>🔒 Periksa &amp; Kunci Jawaban</button>
        <div class="feedback" id="fb-${{q.id}}"></div>
      `;
      mcContainer.appendChild(card);
    }});
  }}

  // ── BAGIAN B: TUGAS PEMODELAN (UNGGAH .FCStd) ──
  const tugasContainer = document.getElementById('container-comp-ez');
  if (tugasContainer) {{
    tugasContainer.innerHTML = '';
    (window.{PRE}_COMP_EZ || []).forEach((q, i) => {{
      tugasContainer.appendChild(_buildTugasCard(q, i + 1, q, 'B', false));
    }});
  }}
{render_hard}
  _{pre}Rendered = true;
  window._{pre}RenderedFlag = true;
  if (typeof revealObs !== 'undefined') {{
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObs.observe(el));
  }}
  if (typeof _update{PRE}AccessGate === 'function') setTimeout(_update{PRE}AccessGate, 100);
  if (typeof window._reapply{PRE}StateFromCache === 'function') {{
    setTimeout(() => window._reapply{PRE}StateFromCache(), 150);
  }}
  // Draft angka bacaan dimuat SETELAH kartu ada; _loadDraft() di jalur Firebase
  // biasanya berjalan sebelum render, saat kolom angkanya belum dibuat.
  if (typeof _loadDraft === 'function') setTimeout(_loadDraft, 200);
}}

{kartu.KARTU_JS}
window.render{PRE}Questions = render{PRE}Questions;''')

# ═════════════════════════════════════════════════════════════════════════════
# 7. SKRIP KLASIK — Pyodide dibuang, draft & pengiriman tugas ditulis ulang
# ═════════════════════════════════════════════════════════════════════════════
d.buang("// ═══════════════════════════════════════════════════════\n// PYODIDE — Python-in-Browser Runner",
        "// ═══════════════════════════════════════════════════════\n// PEDOMAN §15.4 — DRAFT PERSISTENCE", False)
# Pemanasan Pyodide saat tab soal dibuka ikut dibuang.
d.ganti_re(
    r"[ ]*// Lazy load Pyodide on U(?:TS|AS) tab open\n"
    r"[ ]*setTimeout\(\(\) => getPyodide\(\)[^\n]*\n",
    "",
)
# Dokumentasi argumen callable: tidak ada lagi kode Python maupun multi-langkah.
d.potong("// Helper: panggil Cloud Function utk validasi 1 soal.", "async function _callCheckExamAnswer(",
         """// Helper: panggil Cloud Function utk validasi 1 soal.
// Args:
//   qId         — string question ID (mis. "mc3", "c7")
//   userAnswer  — number 0-3 (PG) | number (tugas pemodelan: angka bacaan FreeCAD)
//   codeText    — tidak dipakai pada ujian ini (tidak ada kode yang dikirim)
//   userAnswers — number[] optional; tugas pemodelan mengirim [angka] saja
// Returns Promise<{correct, status, scoreDelta, marker, explain, lateMultiplier,
//                  pastDeadline, consolationAwarded, alreadyAnswered}>
// Throws Error dengan .code (HttpsError code: 'unauthenticated', 'failed-precondition',
//   'not-found', 'invalid-argument', 'internal') dan .message yang bisa dibaca manusia.
""", False)

d.potong("function _draftKey() {", "window._draftKey  = _draftKey;", f'''function _draftKey() {{
  try {{
    const me = JSON.parse(localStorage.getItem(LOCAL_IDENTITY) || 'null');
    if (!me || !me.nim || me.role === 'dosen') return null;
    return 'pemodelan_cad_draft_' + MODULE_ID + '_' + me.nim;   // per-NIM, per-course
  }} catch(e) {{ return null; }}
}}

// Draft menyimpan angka bacaan yang BELUM dikirim (berkasnya sendiri sudah di
// server begitu diunggah, jadi tidak perlu ikut disimpan di peramban).
function _saveDraft() {{
  const key = _draftKey();
  if (!key) return;
  try {{
    const draft = {{ nilai: {{}}, savedAt: new Date().toISOString() }};
    document.querySelectorAll('.nilai-input').forEach((el) => {{
      const qId = el.id.replace(/^nilai-/, '');
      if (qId && el.value) draft.nilai[qId] = el.value;
    }});
    localStorage.setItem(key, JSON.stringify(draft));
  }} catch(e) {{ /* kuota penuh — sengaja diam */ }}
}}

function _loadDraft() {{
  const key = _draftKey();
  if (!key) return;
  try {{
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (!draft || !draft.nilai) return;
    Object.keys(draft.nilai).forEach((qId) => {{
      const el = document.getElementById('nilai-' + qId);
      if (el && !el.value && !el.disabled) {{
        el.value = draft.nilai[qId];
        if (typeof _refreshTugasBtn === 'function') _refreshTugasBtn(qId);
      }}
    }});
    if (typeof checkExportReady === 'function') checkExportReady();
  }} catch(e) {{ /* JSON rusak — sengaja diam */ }}
}}

window._saveDraft = _saveDraft;
window._loadDraft = _loadDraft;
window._draftKey  = _draftKey;''')

d.potong("function onCodeInput(qId) {", "function checkComp(qId) { runAndCheck(qId, 'easy'); }",
         kartu.skrip(K.RAKITAN, pre))

# ── Ringkasan nilai ──
label_hard = "Rakitan" if K.RAKITAN else "—"
set_hard = "  set('scoreCompHard', formatPoints(hardComp));\n" if K.RAKITAN else ""
d.ganti("""// ── SCORE UPDATE ──
// Universal 50-poin breakdown: mc (10) + ezComp (20) + hardComp (20) = 50
// Comp E/M (c1..c10) dan Comp Hard (c11..c15) dipisahkan via _isHardComp().""",
        f"""// ── RINGKASAN NILAI ──
// Rincian: PG + tugas sub-model{" + tugas rakitan" if K.RAKITAN else ""}.
// Pemisah bagian tugas memakai window._isHardComp().""")
d.potong("function updateScore() {", "// ── FORUM LOGIC ──", f'''function updateScore() {{
  const mc = Object.values(mcScores).reduce((a,b) => a+b, 0);
  let ezComp = 0, hardComp = 0;
  for (const qId in compScores) {{
    const pts = compScores[qId] || 0;
    if (window._isHardComp(qId)) hardComp += pts;
    else                         ezComp   += pts;
  }}
  const total = mc + ezComp + hardComp;
  const nilai = pointsToScore(total);   // Σ poin = 100, jadi poin = nilai

  const set = (id, v) => {{ const e = document.getElementById(id); if (e) e.textContent = v; }};
  set('scoreDisplay',  nilai);
  set('scoreDetail',   formatPoints(total) + ' / 100 poin');
  set('scoreMC',       formatPoints(mc));
  set('scoreCompEz',   formatPoints(ezComp));
{set_hard}  const fill = document.getElementById('scoreFill');
  if (fill) fill.style.width = nilai + '%';
}}

// ── FORUM LOGIC ──''', False)

# ── Kesiapan ekspor ──
sisa_hard = ("      if (emptyRakitan.length)   remainParts.push(emptyRakitan.length + ' Rakitan');\n"
             if K.RAKITAN else "")
id_hard = (f"  const rakitanIds = ['{K.RAKITAN}'];\n" if K.RAKITAN else "  const rakitanIds = [];\n")
d.potong("function checkExportReady() {", "  if (ready) _saveDraft();\n}", f'''function checkExportReady() {{
  // Ekspor LONGGAR: aktif setelah minimal satu soal dijawab, supaya mahasiswa
  // bisa menyimpan bukti sebagian. Peringatan tetap menyebut sisa pekerjaan.
  const btnTop    = document.getElementById('btn-score-export');
  const btnBottom = document.getElementById('btn-export-tugas');
  const msgEl     = document.getElementById('export-blocked-msg');

  const mcIds    = Array.from({{length: SCORE_CONFIG.MC_COUNT}},      (_,i)=>'mc'+(i+1));
  const tugasIds = Array.from({{length: SCORE_CONFIG.COMP_EZ_COUNT}}, (_,i)=>'c'+(i+1));
{id_hard}
  const emptyMC      = mcIds.filter(id => !mcAnswered[id]);
  const emptyTugas   = tugasIds.filter(id => !compAnswered[id]);
  const emptyRakitan = rakitanIds.filter(id => !compAnswered[id]);

  const totalSoal = mcIds.length + tugasIds.length + rakitanIds.length;
  const totalAnswered = totalSoal - emptyMC.length - emptyTugas.length - emptyRakitan.length;

  const allAnswered = emptyMC.length === 0 && emptyTugas.length === 0 && emptyRakitan.length === 0;
  const ready = totalAnswered >= 1;

  _setBtnState(btnTop,    ready);
  _setBtnState(btnBottom, ready);

  if (msgEl) {{
    if (allAnswered) {{
      msgEl.style.color = 'var(--green)';
      msgEl.textContent = '✅ Semua ' + totalSoal + ' soal sudah dijawab. Export siap!';
    }} else if (ready) {{
      msgEl.style.color = 'var(--amber)';
      const remainParts = [];
      if (emptyMC.length)        remainParts.push(emptyMC.length + ' PG');
      if (emptyTugas.length)     remainParts.push(emptyTugas.length + ' Tugas model');
{sisa_hard}      msgEl.textContent = '⚠ Belum dikerjakan: ' + remainParts.join(', ') + ' (' + totalAnswered + '/' + totalSoal + ' sudah dijawab), jadi bisa export sekarang sebagai bukti, atau lanjutkan mengerjakan.';
    }} else {{
      msgEl.textContent = '';
    }}
  }}

  if (ready) _saveDraft();
}}''')

# ═════════════════════════════════════════════════════════════════════════════
# 8. SKRIP KLASIK — laporan ekspor HTML
# ═════════════════════════════════════════════════════════════════════════════
d.ganti_re(
    r"  // ─── 4 sub-total breakdown ───\n  const tf = Object\.values\(tfScores\)\.reduce\(\(a,b\)=>a\+b, 0\);\n",
    "  // ─── Sub-total per bagian ───\n",
)
d.ganti_re(
    r"  const gdriveLink = \(document\.getElementById\('gdrive-link'\)\?\.value \|\| ''\)\.trim\(\);\n",
    "",
)
d.ganti_re(r"[ ]*if \(/\^tf\\d\+\$/\.test\(qId\)\) tfScores\[qId\] = delta;\n[ ]*else if", "        if"
           )
# Data yang dikumpulkan untuk laporan: PG + tugas unggah.
d.potong("  // ── Collect TF data ──", "  const html = `<!DOCTYPE html>", f'''  // ── Data pilihan ganda ──
  const mcData = (window.{PRE}_MC || []).map((q, i) => {{
    const data = q;   // sudah dirakit server; kunci TIDAK pernah dikirim
    const id = q.id;
    const rg = document.getElementById('rg-' + id);
    const sel = rg?.querySelector('.radio-option.selected');
    let answered = '(Belum dijawab)';
    if (sel) {{
      answered = stripTags(sel.textContent).slice(0, 80);
    }} else if (typeof fbSelections[id] === 'number') {{
      const optIdx = fbSelections[id];
      const optText = (data.options || [])[optIdx] || '';
      answered = String.fromCharCode(65 + optIdx) + '. ' + stripTags(optText).slice(0, 70);
    }} else if (mcAnswered[id]) {{
      answered = mcScores[id] > 0 ? '(Dijawab, jawaban benar)' : '(Dijawab, jawaban salah)';
    }}
    return {{
      no: i+1,
      title: stripTags(data.text).slice(0, 100) + (stripTags(data.text).length > 100 ? '…' : ''),
      modul: q.modul,
      type: q.parametric ? 'NIM-based' : 'Teori',
      selected: answered,
      pts: mcScores[id] || 0,
      maks: (window.EXAM_QID_POINTS || {{}})[id] || 0
    }};
  }});

  // ── Data tugas pemodelan (berkas .FCStd + angka bacaan) ──
  const _tugasRow = (q, i) => {{
    const id = q.id;
    return {{
      no: i+1,
      title: stripTags(q.text).slice(0, 120) + (stripTags(q.text).length > 120 ? '…' : ''),
      modul: q.modul,
      label: q.inputLabel || 'Angka bacaan dari FreeCAD',
      bukti: (typeof window._ringkasTugasCad === 'function' ? window._ringkasTugasCad(id) : '') || '(belum ada berkas / angka)',
      pts: compScores[id] || 0,
      maks: (window.EXAM_QID_POINTS || {{}})[id] || 0
    }};
  }};
  const tugasData   = (window.{PRE}_COMP_EZ || []).map(_tugasRow);
  const rakitanData = (window.{PRE}_COMP_HARD || []).map(_tugasRow);

  const html = `<!DOCTYPE html>''')

d.ganti(f"<title>{LABEL} Teknik Tenaga Listrik — ${{esc(name)}}</title>",
        f"<title>{LABEL} Pemodelan CAD — ${{esc(name)}}</title>")

# Ringkas nilai di sampul laporan.
mini_hard = ('\n        <span class="score-mini">C·Rakitan: <strong>${formatPoints(compHard)}/${SCORE_CONFIG.COMP_HARD_TOTAL}</strong></span>'
             if K.RAKITAN else "")
d.ganti_re(
    r'        <span class="score-mini">A·TF:.*?D·Komp Hard: <strong>\$\{formatPoints\(compHard\)\}/\$\{SCORE_CONFIG\.COMP_HARD_TOTAL\}</strong></span>',
    '        <span class="score-mini">A·PG: <strong>${formatPoints(mc)}/${SCORE_CONFIG.MC_TOTAL}</strong></span>\n'
    '        <span class="score-mini">B·Tugas model: <strong>${formatPoints(compEz)}/${SCORE_CONFIG.COMP_EZ_TOTAL}</strong></span>'
    + mini_hard,
)

tabel_rakitan = ""
if K.RAKITAN:
    tabel_rakitan = '''
  <!-- BAGIAN C: TUGAS RAKITAN -->
  <div class="section-head sh-hard"><h2><span class="anim-icon icon-float" style="color:#ec4899">🅒</span><span>Bagian C — Tugas Rakitan KT-40 (${formatPoints(compHard)}/${SCORE_CONFIG.COMP_HARD_TOTAL} poin)</span></h2></div>
  <table>
    <thead><tr><th style="width:42px">No</th><th style="width:34%">Tugas (Singkat)</th><th style="width:22%">Angka Diminta</th><th style="width:30%">Bukti Unggahan</th><th style="width:55px;text-align:center">Poin</th></tr></thead>
    <tbody>
      ${rakitanData.map(d => `<tr class="row-${statusPoin(d)}">
        <td>C${String(d.no).padStart(2,'0')}</td>
        <td style="font-size:.78rem;color:#475569"><span class="badge-modul">M${d.modul}</span>${esc(d.title)}</td>
        <td style="font-size:.76rem;color:#475569">${esc(d.label)}</td>
        <td style="font-family:monospace;font-size:.7rem;background:#fdf2f8;padding:6px 8px;border-radius:4px;white-space:pre-wrap;word-break:break-word">${esc(d.bukti)}</td>
        <td><span class="pts pts-${statusPoin(d)}">${formatPoints(d.pts)}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>
'''

d.potong("  <!-- BAGIAN A: TF -->", "  <div class=\"footer\">", '''  <!-- BAGIAN A: PILIHAN GANDA -->
  <div class="section-head sh-mc"><h2><span class="anim-icon icon-wiggle" style="color:#a855f7">🅐</span><span>Bagian A — Pilihan Ganda (${formatPoints(mc)}/${SCORE_CONFIG.MC_TOTAL} poin)</span></h2></div>
  <table>
    <thead><tr><th style="width:42px">No</th><th>Soal</th><th style="width:200px">Jawaban</th><th style="width:55px;text-align:center">Poin</th></tr></thead>
    <tbody>
      ${mcData.map(d => `<tr class="row-${statusPoin(d)}">
        <td>A${String(d.no).padStart(2,'0')}</td>
        <td><span class="badge-modul">M${d.modul}</span><span class="badge-type ${d.type==='Teori'?'theory':'nim'}">${d.type}</span>${esc(d.title)}</td>
        <td><span class="${d.pts?'correct':(d.selected.includes('Belum')?'':'wrong')}" style="font-size:.78rem">${esc(d.selected)}</span></td>
        <td><span class="pts pts-${statusPoin(d)}">${formatPoints(d.pts)}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- BAGIAN B: TUGAS PEMODELAN -->
  <div class="section-head sh-ez"><h2><span class="anim-icon icon-pulse" style="color:#22d3ee">🅑</span><span>Bagian B — Tugas Pemodelan FreeCAD (${formatPoints(compEz)}/${SCORE_CONFIG.COMP_EZ_TOTAL} poin)</span></h2></div>
  <table>
    <thead><tr><th style="width:42px">No</th><th style="width:34%">Tugas (Singkat)</th><th style="width:22%">Angka Diminta</th><th style="width:30%">Bukti Unggahan</th><th style="width:55px;text-align:center">Poin</th></tr></thead>
    <tbody>
      ${tugasData.map(d => `<tr class="row-${statusPoin(d)}">
        <td>B${String(d.no).padStart(2,'0')}</td>
        <td style="font-size:.78rem;color:#475569"><span class="badge-modul">M${d.modul}</span>${esc(d.title)}</td>
        <td style="font-size:.76rem;color:#475569">${esc(d.label)}</td>
        <td style="font-family:monospace;font-size:.7rem;background:#fff7ed;padding:6px 8px;border-radius:4px;white-space:pre-wrap;word-break:break-word">${esc(d.bukti)}</td>
        <td><span class="pts pts-${statusPoin(d)}">${formatPoints(d.pts)}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>
''' + tabel_rakitan + '''
  <div style="margin-top:24px;padding:16px 20px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px">
    <div style="font-weight:700;color:#15803d;font-size:.92rem;margin-bottom:6px">🧊 Berkas Model FreeCAD</div>
    <div style="font-size:.78rem;color:#475569">Setiap dokumen <code>.FCStd</code> sudah diunggah langsung ke server saat ujian berlangsung; kolom <strong>Bukti Unggahan</strong> di atas memuat nama berkas, ukuran, dan sidik SHA-256 yang tercatat di server. Tidak ada tautan berbagi yang perlu Anda sertakan.</div>
  </div>

  <div class="footer">''', False)

d.ganti(f"  a.href = url; a.download = '{LABEL}_TeknikTenagaListrik_' + nim + '.html';",
        f"  a.href = url; a.download = '{K.UNDUHAN}' + nim + '.html';")

# Gaya tautan Google Drive di laporan ekspor ikut dibuang: berkas .FCStd
# langsung tersimpan di server, jadi tidak ada tautan berbagi yang dilaporkan.
d.ganti_re(r"[ ]*\.gdrive-block\{position:relative.*?\n[ ]*\.gdrive-link:hover::before\{transform:translateX\(100%\)\}\n", "")
d.ganti("  .gdrive-block h3 .anim-icon{font-size:1.6em}\n", "")

# ═════════════════════════════════════════════════════════════════════════════
# 9. SKRIP MODUL — identitas Firebase, callable unggah, pemuat soal
# ═════════════════════════════════════════════════════════════════════════════
# Komentar pembuka skrip modul masih menyebut jalur benar-salah/Pyodide.
d.ganti_re(
    r"//   • checkTF/checkMC/runAndCheck panggil callable `checkExamAnswer`\.\n",
    "//   • checkMC dan kirimTugas memanggil callable `checkExamAnswer`.\n",
    d.jumlah("//   • checkTF/checkMC/runAndCheck panggil callable `checkExamAnswer`.\n"),
)
d.ganti_re(
    r"//   jawaban \(TF/MC/Comp\) dan award poin\.",
    "//   jawaban (PG/tugas pemodelan) dan award poin.",
    d.jumlah("//   jawaban (TF/MC/Comp) dan award poin."),
)

d.ganti(f"const DB_PATH = `visitors/teknik_tenaga_listrik/${{MODULE_ID}}`;",
        f"const DB_PATH = `visitors/pemodelan_cad/${{MODULE_ID}}`;")
d.ganti(f"const SCHEDULE_PATH = `settings/teknik_tenaga_listrik/${{PERTEMUAN}}/schedule`;",
        f"const SCHEDULE_PATH = `settings/pemodelan_cad/${{PERTEMUAN}}/schedule`;")
d.ganti("const LOCAL_IDENTITY = `teknik_tenaga_listrik_identity_${MODULE_ID}`;",
        "const LOCAL_IDENTITY = `pemodelan_cad_identity_${MODULE_ID}`;")
d.ganti("const PRESENCE_PATH = `presence/teknik_tenaga_listrik/${MODULE_ID}`;",
        "const PRESENCE_PATH = `presence/pemodelan_cad/${MODULE_ID}`;")
d.ganti(f"const EXAM_ID = 'teknik-tenaga-listrik-{JENIS}';", f"const EXAM_ID = '{K.EXAM_ID}';")
d.ganti(f"const _PIN_SESSION_KEY = 'teknik_tenaga_listrik_{JENIS}_pinhash';",
        f"const _PIN_SESSION_KEY = 'pemodelan_cad_{JENIS}_pinhash';")

# Callable unggah berkas tugas (dipakai kartu unggah di skrip klasik).
d.ganti("const _generateExportCodeCallable = httpsCallable(_functions, 'generateExportCode');",
        "const _generateExportCodeCallable = httpsCallable(_functions, 'generateExportCode');\n"
        "// Unggah berkas FreeCAD tugas ujian: callable yang sama dengan jalur modul,\n"
        "// tetapi dipanggil dengan `examId` sehingga ledger & jadwalnya jalur ujian.\n"
        "window._unggahBerkasCallable = httpsCallable(_functions, 'unggahBerkasTugas');")

d.potong(f"function _show{PRE}LoadState(html) {{", "}\n", f'''function _show{PRE}LoadState(html) {{
  const c = document.getElementById('container-mc');
  if (c) c.innerHTML = html;
  ['container-comp-ez', 'container-comp-hard'].forEach(id => {{
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  }});
}}
''')
d.ganti_re(r"\n[ ]*window\.{}_TF = d\.tf \|\| \[\];".format(PRE), "")
d.ganti_re(r"// window\.U(?:TS|AS)_TF/MC/COMP_EZ/COMP_HARD di-isi oleh",
           f"// window.{PRE}_MC/COMP_EZ/COMP_HARD diisi oleh",
           d.jumlah(f"// window.{PRE}_TF/MC/COMP_EZ/COMP_HARD di-isi oleh"))
d.ganti_re(r"// statis di window\.U(?:TS|AS)_TF/MC/COMP_EZ/COMP_HARD sehingga bisa dibaca via View",
           f"// statis di window.{PRE}_MC/COMP_EZ/COMP_HARD sehingga bisa dibaca via View",
           d.jumlah(f"// statis di window.{PRE}_TF/MC/COMP_EZ/COMP_HARD sehingga bisa dibaca via View"))

# ═════════════════════════════════════════════════════════════════════════════
# 10. SKRIP MODUL — gerbang akses & pemulihan tampilan
# ═════════════════════════════════════════════════════════════════════════════
d.ganti("    const tfC = document.getElementById('container-tf');\n    const mcC", "    const mcC")
d.ganti("[tfC, mcC, ezC, hardC]", "[mcC, ezC, hardC]", 4)
d.ganti(f"""function _ensure{Pre}LockBanner() {{
  if (document.getElementById('{pre}LockBanner')) return;
  const tfContainer = document.getElementById('container-tf');
  if (!tfContainer) return;""",
        f"""function _ensure{Pre}LockBanner() {{
  if (document.getElementById('{pre}LockBanner')) return;
  const tfContainer = document.getElementById('container-mc');
  if (!tfContainer) return;""")
d.ganti("  // Insert sebelum container-tf", "  // Sisipkan sebelum container-mc")

# Pemulihan tampilan setelah muat ulang: kode Python -> berkas + angka bacaan.
d.potong("""  // ── Restore code Komputasi dari Firebase codes/ ──
  if (data.codes && typeof data.codes === 'object') {
    Object.keys(data.codes).forEach(qId => {
      const ta = document.getElementById('code-' + qId);
      if (ta && !ta.value && typeof data.codes[qId] === 'string') {
        ta.value = data.codes[qId];
      }
    });
  }
""", "  // ── Restore user selections (TF/MC) jika tersimpan ──", """  // ── Pulihkan ringkasan berkas tugas dari ledger server (codes/) ──
  // Server membekukan ringkasan berkas .FCStd + angka bacaan ke field codes/
  // saat tugas dinilai, jadi status kartu tetap terbaca setelah muat ulang.
  if (data.codes && typeof data.codes === 'object') {
    Object.keys(data.codes).forEach(qId => {
      const st = document.getElementById('berkas-status-' + qId);
      if (st && typeof data.codes[qId] === 'string' && data.codes[qId]) {
        st.textContent = data.codes[qId];
        st.style.color = 'var(--green)';
      }
    });
  }
""", False)

d.potong("  // ── Restore user selections (TF/MC) jika tersimpan ──", "  // ── Restore answered state per qId (lock + feedback) ──",
         """  // ── Pulihkan pilihan PG yang tersimpan ──
  // Bentuk: data.selections = { mc1: 2, mc3: 0, ... } (indeks opsi 0-3).
  if (data.selections && typeof data.selections === 'object') {
    Object.keys(data.selections).forEach(qId => {
      const val = data.selections[qId];
      if (/^mc\\d+$/.test(qId) && typeof val === 'number') {
        const rg = document.getElementById('rg-' + qId);
        if (rg) {
          const opts = rg.querySelectorAll('.radio-option');
          if (opts[val] && !opts[val].classList.contains('selected')) opts[val].classList.add('selected');
        }
      }
    });
  }

""", False)

# Cabang pemulihan TF dibuang seluruhnya; cabang PG naik menjadi `if` pertama
# (tanpa ini rantai `else if` menggantung dan skrip modul gagal parse).
d.buang("    // ── Restore TF correct answers", "    // ── Restore MC correct answers ──", False)
d.ganti("    // ── Restore MC correct answers ──\n    else if (/^mc\\d+$/.test(qId)) {",
        "    // ── Pulihkan jawaban PG yang benar ──\n    if (/^mc\\d+$/.test(qId)) {")

# Kartu tugas: yang dikunci bukan textarea kode, melainkan kolom angka + unggahan.
d.ganti_re(
    r"[ ]*const ta ?= ?document\.getElementById\('code-' ?\+ ?baseId\);\n"
    r"[ ]*if ?\(ta\) ?\{ ?ta\.disabled ?= ?true; ?ta\.style\.borderColor ?= ?'[^']*'; ?ta\.style\.opacity ?= ?'[^']*'; ?\}\n",
    "      if (typeof window._kunciTugasCad === 'function') window._kunciTugasCad(baseId);\n",
    3,
)

# ═════════════════════════════════════════════════════════════════════════════
# 11. Pembantu lain: kunci identitas lokal, lapisan friksi, registry chat AI
# ═════════════════════════════════════════════════════════════════════════════
d.ganti_re(
    r"function getIdentityLocal\(\) \{.*?\n\}",
    "function getIdentityLocal() {\n"
    "  // Skrip klasik tidak bisa membaca const LOCAL_IDENTITY milik skrip modul\n"
    f"  // (jebakan lingkup lintas-skrip), jadi kuncinya ditulis eksplisit di sini.\n"
    f"  try {{ return JSON.parse(localStorage.getItem('pemodelan_cad_identity_{JENIS}')); }} catch(e) {{ return null; }}\n"
    "}",
)
d.ganti_re(r"  const LK = 'teknik_tenaga_listrik_identity_u(?:ts|as)';",
           f"  const LK = 'pemodelan_cad_identity_{JENIS}';")

# Registry chat AI: daftar topik + nama course + pola examId.
d.ganti_re(
    r'    "teknik_tenaga_listrik": \[\n(?:      "[^"]*",\n)+    \],\n',
    '''    "pemodelan_cad": [
      "Pengenalan FreeCAD dan Menggambar 2D",
      "Drafting dan Penyuntingan 2D: Trim, Extend, Offset, Layer, Dimensi",
      "Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek",
      "Dimensi, Anotasi, dan Format Gambar Teknik",
      "Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep",
      "Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D",
      "Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly",
      "Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik",
      "Evaluasi Hasil Simulasi dan Analisis Kekuatan",
      "Optimasi Desain Pasca-Simulasi",
      "Perakitan Komponen dan Analisis Sistem",
      "Identifikasi Masalah Desain dan Solusi Optimasi",
      "Prinsip Desain Berkelanjutan dalam CAD",
      "Optimasi Desain untuk Efisiensi dan Lingkungan",
    ],
''',
)
d.ganti('    "teknik_tenaga_listrik": "Teknik Tenaga Listrik",\n  };',
        '    "pemodelan_cad": "Pemodelan CAD",\n  };')
d.ganti_re(
    r'var e = /\^\(getaran-mekanik\|math4\|optoauto\|sisken(?:\|teknik-tenaga-listrik)?\)-\(uts\|uas\)\$/\.exec\(id\);',
    'var e = /^(getaran-mekanik|math4|optoauto|sisken|pemodelan-cad)-(uts|uas)$/.exec(id);',
)
d.ganti_re(
    r'var examCourseId = e\[1\] === "sisken" \? "sistem_kendali_cerdas" : (?:e\[1\] === "teknik-tenaga-listrik" \? "teknik_tenaga_listrik" : )?e\[1\];',
    'var examCourseId = e[1] === "sisken" ? "sistem_kendali_cerdas" : e[1] === "pemodelan-cad" ? "pemodelan_cad" : e[1];',
)
d.ganti_re(
    r'var m = /\^\(getaran-mekanik\|math4\|optoauto\|sistem_kendali_cerdas\|teknik_tenaga_listrik\)-modul-\(\\d\{1,2\}\)\$/\.exec\(id\);',
    lambda _m: 'var m = /^(getaran-mekanik|math4|optoauto|sistem_kendali_cerdas|pemodelan_cad)-modul-(\\d{1,2})$/.exec(id);',
)

# ═════════════════════════════════════════════════════════════════════════════
# 12. Sapuan akhir identitas course
# ═════════════════════════════════════════════════════════════════════════════
d.ganti("visitors/teknik_tenaga_listrik/", "visitors/pemodelan_cad/")
d.ganti("teknik_tenaga_listrik_identity_", "pemodelan_cad_identity_")
d.ganti(f"presence/teknik_tenaga_listrik/{JENIS}", f"presence/pemodelan_cad/{JENIS}",
        d.jumlah(f"presence/teknik_tenaga_listrik/{JENIS}"))
d.ganti(f"examAnswers/teknik-tenaga-listrik-{JENIS}/qs/<qId>", f"examAnswers/{K.EXAM_ID}/qs/<qId>",
        d.jumlah(f"examAnswers/teknik-tenaga-listrik-{JENIS}/qs/<qId>"))
d.s = d.s.replace("Teknik Tenaga Listrik", "Pemodelan CAD")
d.s = re.sub(r"\bteknik_tenaga_listrik\b", "pemodelan_cad", d.s)
d.s = re.sub(r"\bteknik-tenaga-listrik\b", "pemodelan-cad", d.s)

# ═════════════════════════════════════════════════════════════════════════════
# 13. Penjaga: sisa kerangka harus benar-benar hilang
# ═════════════════════════════════════════════════════════════════════════════
d.wajib_kosong(
    "pyodide", "Pyodide", "PYODIDE",
    "runAndCheck(", "code-textarea", "stdout-box", "onCodeInput",
    "tfAnswered", "tfScores", "selectTF", "checkTF", "container-tf",
    f"{PRE}_TF", "tf-card", "tfopts-", "BENAR (TRUE)", "SALAH (FALSE)",
    "teknik_tenaga_listrik", "teknik-tenaga-listrik", "Teknik Tenaga Listrik",
    "gdrive-link", "gdrive-feedback",
)
d.wajib_ada(
    f"const EXAM_ID = '{K.EXAM_ID}';",
    "visitors/pemodelan_cad/",
    "settings/pemodelan_cad/",
    "window._unggahBerkasCallable",
    "unggahBerkasTugas",
    "examId: window.EXAM_ID, qId, nim: me.nim",
    "_buildTugasCard",
    "berkas-status-",
    "nilai-input",
    "_terapkanSyaratBerkas",
    "_parseNilai",
)

# newline="\n": seluruh repo memakai LF, dan penyuntik .mjs mencari jangkar
# ber-"\n" — menulis dengan terjemahan baris bawaan Windows (CRLF) membuat
# jangkar mereka meleset dan halaman disuntik ulang tiap kali dijalankan.
TUJUAN.write_text(d.s, encoding="utf-8", newline="\n")
print(f"[cad-exam] {K.TUJUAN} ditulis — {len(d.s):,} karakter")
print(f"[cad-exam] {K.N_SOAL} soal · {K.N_MC} PG @ {pustaka.ind(POIN_MC)} poin · "
      f"{K.N_TUGAS} tugas @ {pustaka.ind(POIN_TUGAS)} poin"
      + (f" · rakitan @ {pustaka.ind(POIN[K.RAKITAN])} poin" if K.RAKITAN else ""))
