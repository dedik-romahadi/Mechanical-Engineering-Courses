# Halaman "🐍 Setup Python" Modul 1 Pemodelan CAD (id page-python). Mendampingi
# "🧊 Setup FreeCAD": Miniconda + VS Code + freecadcmd untuk skrip FreeCAD tanpa GUI,
# olah data geometri, dan grafik laporan. CSS-nya salinan blok #page-setup yang
# diganti prefiksnya menjadi #page-python oleh bangun-modul-1.py.
SETUP_PYTHON_PAGE = r'''<div class="page" id="page-python">

<section class="sp-hero">
  <div class="sp-hero-inner">
    <div class="sp-badge">🐍 SETUP GUIDE · PEMODELAN CAD</div>
    <h1 class="sp-h1">Setup <span class="hl">Python &amp; Jupyter</span><br>untuk Pemodelan CAD</h1>
    <p class="sp-sub">Python sudah tertanam di FreeCAD (Python console). Setup ini menambahkan Miniconda + VS Code agar Anda bisa menjalankan skrip FreeCAD tanpa GUI (freecadcmd), mengolah angka bacaan geometri, dan membuat grafik untuk laporan.</p>
    <div class="sp-chips">
      <div class="sp-chip"><span class="dot"></span>Windows / macOS / Linux</div>
      <div class="sp-chip"><span class="dot"></span>~10 menit</div>
      <div class="sp-chip"><span class="dot"></span>NumPy · Matplotlib · pandas · freecadcmd</div>
    </div>
  </div>
</section>

<div class="sp-wrap">
  <div class="sp-timeline">

    <!-- ── PESAN DOSEN ── -->
    <div class="sp-step">
      <div class="sp-dot s1">👋</div>
      <div class="sp-card">
        <div class="sp-bar s1"></div>
        <div class="sp-head">
          <div class="sp-icon">👨‍🏫</div>
          <div><div class="sp-label">Pesan Dosen</div><div class="sp-title">Halo Mahasiswa Pemodelan CAD!</div></div>
        </div>
        <div class="sp-body">
          <p>Ada dua Python yang akan kalian pakai di kuliah ini. <strong>Pertama</strong>, Python di dalam FreeCAD (<em>View → Panels → Python console</em>) untuk membaca <code>Shape.Area</code>, <code>Shape.Length</code>, <code>CenterOfMass</code>, dan <code>Volume</code> yang diminta setiap tugas. <strong>Kedua</strong>, Python sistem lewat Miniconda untuk menulis skrip parametrik, menjalankan FreeCAD tanpa GUI lewat <code>freecadcmd</code>, dan membuat grafik. Setup ini tidak wajib untuk mengerjakan tugas Modul 1, tetapi sangat memudahkan mulai Modul 3 (skrip Python untuk objek Draft) dan tugas-tugas 3D berikutnya. Kerjakan sekali, lalu pakai sepanjang semester.</p>
        </div>
      </div>
    </div>

    <!-- ── STEP 1: MINICONDA ── -->
    <div class="sp-step">
      <div class="sp-dot s1">1</div>
      <div class="sp-card">
        <div class="sp-bar s1"></div>
        <div class="sp-head">
          <div class="sp-icon">📦</div>
          <div><div class="sp-label">Langkah 1</div><div class="sp-title">Instal Miniconda</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">Miniconda adalah manajer environment Python yang ringan dan andal; environment-nya terpisah dari Python milik FreeCAD sehingga tidak saling mengganggu.</p>
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li>Buka → <a href="https://docs.conda.io/en/latest/miniconda.html" target="_blank" rel="noopener">docs.conda.io/miniconda</a></li>
            <li>Pilih <strong>Miniconda3</strong> terbaru (Python 3.x) sesuai OS, lalu pilih <strong>64-bit</strong></li>
            <li>Jalankan installer → <strong style="color:var(--sp-c4)">Centang "Add Miniconda3 to my PATH"</strong></li>
            <li>Verifikasi, yaitu buka terminal baru lalu ketik: <code>conda --version</code></li>
          </ol>
          <div class="sp-cb" style="margin-top:1rem;">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Terminal</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># Verifikasi Miniconda berhasil diinstal</span>
conda --version
<span class="sp-cm"># Output contoh: conda 24.x.x</span></pre></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 2: ENVIRONMENT ── -->
    <div class="sp-step">
      <div class="sp-dot s2">2</div>
      <div class="sp-card">
        <div class="sp-bar s2"></div>
        <div class="sp-head">
          <div class="sp-icon">🌐</div>
          <div><div class="sp-label">Langkah 2</div><div class="sp-title">Buat Environment Khusus</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">Buat environment terpisah <code>pemodelan_cad</code> dengan <strong>Python 3.11</strong> — versi yang sama dengan Python bawaan FreeCAD 1.0, sehingga modul <code>FreeCAD</code> kelak bisa dipanggil dari Jupyter.</p>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Terminal</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># Buat environment baru dengan Python 3.11</span>
conda create -n pemodelan_cad python=3.11 -y

<span class="sp-cm"># Aktivasi environment</span>
conda activate pemodelan_cad

<span class="sp-cm"># Verifikasi versi Python</span>
python --version</pre></div>
          </div>
          <p style="margin-top:1rem;font-size:.85rem;color:var(--sp-t3)"><strong style="color:var(--sp-c4)">⚠ Penting:</strong> Setiap kali membuka terminal baru, jangan lupa <code>conda activate pemodelan_cad</code> sebelum menjalankan skrip atau Jupyter.</p>
        </div>
      </div>
    </div>

    <!-- ── STEP 3: LIBRARIES ── -->
    <div class="sp-step">
      <div class="sp-dot s3">3</div>
      <div class="sp-card">
        <div class="sp-bar s3"></div>
        <div class="sp-head">
          <div class="sp-icon">📚</div>
          <div><div class="sp-label">Langkah 3</div><div class="sp-title">Instal Library Komputasi</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;">Library inti untuk pemodelan CAD: NumPy (koordinat dan vektor), SciPy (geometri dan optimasi), Matplotlib (grafik profil dan hasil pengukuran), pandas (tabel dimensi per varian), serta Jupyter untuk buku kerja interaktif.</p>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Terminal — environment pemodelan_cad</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># Library numerik &amp; visualisasi</span>
pip install numpy scipy matplotlib pandas

<span class="sp-cm"># Jupyter Notebook &amp; IPython kernel</span>
pip install jupyter ipykernel

<span class="sp-cm"># Daftarkan kernel Jupyter (agar VS Code bisa pilih env ini)</span>
python -m ipykernel install --user --name pemodelan_cad --display-name "Python (Pemodelan CAD)"</pre></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STEP 4: VS CODE ── -->
    <div class="sp-step">
      <div class="sp-dot s4">4</div>
      <div class="sp-card">
        <div class="sp-bar s4"></div>
        <div class="sp-head">
          <div class="sp-icon">💻</div>
          <div><div class="sp-label">Langkah 4</div><div class="sp-title">Instal VS Code &amp; Extensions</div></div>
        </div>
        <div class="sp-body">
          <ol style="padding-left:1.5rem;color:var(--sp-t2);line-height:2">
            <li>Download VS Code: <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">code.visualstudio.com</a></li>
            <li>Install lalu buka VS Code → tab <strong>Extensions</strong> (Ctrl+Shift+X)</li>
            <li>Install extensions berikut (cari nama persisnya):
              <ul style="margin-top:.5rem;padding-left:1.2rem">
                <li><strong>Python</strong> by Microsoft</li>
                <li><strong>Jupyter</strong> by Microsoft</li>
                <li><strong>Pylance</strong> by Microsoft (auto-installed bersama Python)</li>
                <li><strong>Jupyter Notebook Renderers</strong> by Microsoft</li>
              </ul>
            </li>
            <li>Restart VS Code setelah instalasi extensions; saat membuka <code>.ipynb</code>, pilih kernel <strong>Python (Pemodelan CAD)</strong></li>
          </ol>
        </div>
      </div>
    </div>

    <!-- ── STEP 5: TEST ── -->
    <div class="sp-step">
      <div class="sp-dot s5">5</div>
      <div class="sp-card">
        <div class="sp-bar s5"></div>
        <div class="sp-head">
          <div class="sp-icon">✅</div>
          <div><div class="sp-label">Langkah 5</div><div class="sp-title">Test Setup — Hello CAD!</div></div>
        </div>
        <div class="sp-body">
          <p style="margin-bottom:1rem;"><strong>Uji A — Jupyter.</strong> Buat file baru <code>test_setup.ipynb</code> di VS Code, pastikan kernel <strong>Python (Pemodelan CAD)</strong> dipilih, lalu paste &amp; run cell di bawah. Cell ini menghitung luas poligon beraturan dengan rumus Modul 1 dan mengeceknya dengan rumus shoelace dari koordinat titik sudut.</p>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">test_setup.ipynb — Cell 1</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-kw">import</span> numpy <span class="sp-kw">as</span> np
<span class="sp-kw">import</span> matplotlib.pyplot <span class="sp-kw">as</span> plt

<span class="sp-cm"># Poligon beraturan n sisi, radius R (mode inscribed seperti Draft Polygon)</span>
n, R = 6, 40.0
sudut = np.linspace(0, 2 * np.pi, n, endpoint=<span class="sp-kw">False</span>)
x, y = R * np.cos(sudut), R * np.sin(sudut)
A_rumus = 0.5 * n * R**2 * np.sin(2 * np.pi / n)
A_shoelace = 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))

plt.figure(figsize=(4.5, 4.5))
plt.fill(x, y, alpha=0.25)
plt.plot(np.append(x, x[0]), np.append(y, y[0]), <span class="sp-str">'o-'</span>)
t = np.linspace(0, 2 * np.pi, 200)
plt.plot(R * np.cos(t), R * np.sin(t), <span class="sp-str">'--'</span>, lw=0.8)
plt.gca().set_aspect(<span class="sp-str">'equal'</span>); plt.grid(alpha=0.3)
plt.title(<span class="sp-str">f'Hello CAD! A = {A_rumus:.2f} mm² (shoelace {A_shoelace:.2f})'</span>)
plt.show()</pre></div>
          </div>
          <p style="margin-top:1.25rem;margin-bottom:1rem;"><strong>Uji B — freecadcmd.</strong> Simpan skrip berikut sebagai <code>hello_cad.py</code>, lalu jalankan dengan FreeCAD tanpa GUI dari terminal (path sesuai folder instalasi FreeCAD 1.0). Skrip membuat pelat 120 × 60 × 10 mm berlubang ⌀16, mencetak volumenya, dan menyimpan <code>hello_cad.FCStd</code> yang bisa dibuka di FreeCAD.</p>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">hello_cad.py</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># hello_cad.py — dijalankan oleh freecadcmd (FreeCAD tanpa GUI)</span>
<span class="sp-kw">import</span> FreeCAD, Part

doc = FreeCAD.newDocument(<span class="sp-str">"HelloCAD"</span>)
pelat = Part.makeBox(120, 60, 10)                            <span class="sp-cm"># balok 120 × 60 × 10 mm</span>
lubang = Part.makeCylinder(8, 10, FreeCAD.Vector(30, 30, 0))  <span class="sp-cm"># ⌀16 tembus</span>
hasil = pelat.cut(lubang)
Part.show(hasil)
<span class="sp-kw">print</span>(<span class="sp-str">f"Hello CAD! Volume = {hasil.Volume:.1f} mm^3, luas permukaan = {hasil.Area:.1f} mm^2"</span>)
doc.saveAs(<span class="sp-str">"hello_cad.FCStd"</span>)</pre></div>
          </div>
          <div class="sp-cb">
            <div class="sp-cbh">
              <div class="sp-cbh-left"><div class="sp-cbh-dots"><span></span><span></span><span></span></div><span class="sp-cbh-title">Terminal — folder tempat hello_cad.py disimpan</span></div>
              <button class="sp-cbh-copy" onclick="cpC(this)">📋 Copy</button>
            </div>
            <div class="sp-cbd"><pre><span class="sp-cm"># Windows (PowerShell) — sesuaikan folder instalasi FreeCAD 1.0</span>
&amp; "C:\Program Files\FreeCAD 1.0\bin\freecadcmd.exe" hello_cad.py

<span class="sp-cm"># macOS</span>
/Applications/FreeCAD.app/Contents/MacOS/FreeCADCmd hello_cad.py

<span class="sp-cm"># Linux (AppImage)</span>
./FreeCAD_1.0-x86_64.AppImage -c hello_cad.py

<span class="sp-cm"># Output yang diharapkan: Hello CAD! Volume = 69989.4 mm^3, luas permukaan = ... mm^2</span></pre></div>
          </div>
          <p style="margin-top:1rem;font-size:.85rem;color:var(--sp-t3)"><strong style="color:var(--sp-c4)">Opsional — FreeCAD dari Jupyter:</strong> karena environment memakai Python 3.11 yang sama dengan FreeCAD 1.0, modul FreeCAD biasanya bisa diimpor langsung: <code>import sys; sys.path.append(r"C:\Program Files\FreeCAD 1.0\bin"); import FreeCAD, Part</code> (macOS: <code>/Applications/FreeCAD.app/Contents/lib</code>). Bila muncul <em>ImportError</em> (versi Python berbeda), tetap pakai <code>freecadcmd</code> seperti Uji B.</p>
          <p style="margin-top:1rem;font-size:.9rem;">✅ Jika grafik heksagon muncul di Jupyter <strong>dan</strong> terminal mencetak <code>Hello CAD! Volume = 69989.4 mm^3</code> → setup Anda <strong style="color:var(--sp-c2)">SUKSES</strong>! Sekarang siap menulis skrip FreeCAD dan mengolah hasil pemodelan.</p>
        </div>
      </div>
    </div>

  </div>
</div>

<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Setup Python — Miniconda, VS Code, dan freecadcmd untuk Pemodelan CAD · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>

</div><!-- end page-python -->'''
