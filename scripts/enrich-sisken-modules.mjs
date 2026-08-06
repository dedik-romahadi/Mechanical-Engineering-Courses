import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const moduleDir = path.join(root, "Sistem-Kendali-Cerdas", "Modul");

const modules = [
  {
    title: "Pengantar Sistem Kontrol Cerdas",
    sub: "Sub-CPMK 1.1 — Menjelaskan definisi, sejarah, komponen, dan konfigurasi sistem kontrol",
    intro: "Sistem kontrol mengatur perilaku plant agar keluaran mengikuti sasaran meskipun terdapat gangguan dan ketidakpastian. Modul ini membangun bahasa dasar yang dipakai sepanjang mata kuliah: setpoint, error, sensor, controller, actuator, plant, dan feedback.",
    concepts: [
      ["Tujuan kontrol", "Mengubah keluaran aktual y(t) agar mengikuti referensi r(t), dengan error sekecil mungkin dan aksi kontrol tetap aman.", "e(t) = r(t) - y(t)"],
      ["Loop terbuka", "Aksi kontrol tidak dikoreksi oleh keluaran. Sederhana dan murah, tetapi sensitif terhadap perubahan beban dan gangguan.", "u(t) = f(r(t))"],
      ["Loop tertutup", "Sensor mengukur keluaran, komparator membentuk error, lalu controller mengoreksi plant secara berulang.", "T(s) = G(s)/(1+G(s)H(s))"],
      ["Kontrol cerdas", "Fuzzy, neural network, dan algoritma evolusioner membantu saat model sulit diperoleh, nonlinier, atau berubah terhadap waktu.", "u = Kecerdasan(e, de/dt, data)"],
    ],
    steps: ["Tentukan keluaran yang harus dikendalikan", "Ukur keluaran dengan sensor", "Bandingkan dengan setpoint", "Koreksi plant melalui actuator"],
    analogies: [["Shower air hangat", "Tangan bertindak sebagai sensor; otak membandingkan suhu aktual dengan suhu nyaman lalu memutar keran."], ["Mengemudi di jalur", "Mata mengukur posisi mobil, otak menghitung penyimpangan, tangan mengoreksi sudut kemudi."], ["Oven otomatis", "Thermocouple memberi feedback sehingga heater hidup-mati untuk menjaga temperatur."]],
    industries: [["Boiler", "Menjaga tekanan dan level drum dengan valve bahan bakar serta feedwater."], ["Robot industri", "Servo loop mengendalikan posisi, kecepatan, dan torsi setiap joint."], ["Kendaraan listrik", "Controller mengatur torsi motor berdasarkan pedal, traksi, dan batas arus baterai."]],
    code: `import numpy as np\nimport matplotlib.pyplot as plt\n\n# Model plant orde satu: G(s)=K/(tau*s+1)\nK, tau, Kp = 2.0, 3.0, 4.0\nL = Kp*K\nK_cl = L/(1+L)\ntau_cl = tau/(1+L)\n\nt = np.linspace(0, 5, 500)\nr = np.ones_like(t)\ny = K_cl*(1-np.exp(-t/tau_cl))\ne = r-y\n\nprint(f"Gain loop tertutup = {K_cl:.4f}")\nprint(f"Error tunak = {e[-1]:.4f}")\nprint(f"Konstanta waktu tertutup = {tau_cl:.4f} s")\nplt.plot(t, r, '--', label='setpoint r(t)')\nplt.plot(t, y, label='output y(t)')\nplt.xlabel('Waktu (s)'); plt.ylabel('Respons')\nplt.grid(True); plt.legend(); plt.show()`,
    refs: ["Nise — Control Systems Engineering", "Ogata — Modern Control Engineering", "Dorf & Bishop — Modern Control Systems", "Åström & Murray — Feedback Systems"],
  },
  {
    title: "Proses Perancangan Sistem Kontrol",
    sub: "Sub-CPMK 1.2 — Menyusun alur spesifikasi, pemodelan, desain, simulasi, implementasi, dan validasi",
    intro: "Perancangan kontrol bukan sekadar memilih gain. Engineer harus menerjemahkan kebutuhan operasi menjadi spesifikasi terukur, membuat model yang cukup akurat, memilih arsitektur, menguji risiko, lalu memvalidasi sistem pada perangkat nyata.",
    concepts: [["Spesifikasi", "Nyatakan rise time, settling time, overshoot, error tunak, batas actuator, dan robustness dalam angka.", "M_p, t_r, t_s, e_ss"], ["Model plant", "Pilih model mekanik, listrik, termal, fluida, atau berbasis data sesuai bandwidth dan tujuan kontrol.", "x_dot=Ax+Bu"], ["Arsitektur", "Tentukan sensor, controller, actuator, feedforward, feedback, filter, dan lapisan keselamatan.", "r→C→P→y"], ["Verifikasi & validasi", "Verifikasi menjawab apakah desain dibuat dengan benar; validasi menjawab apakah sistem yang dibuat benar-benar memenuhi kebutuhan.", "uji ≠ asumsi"]],
    steps: ["Definisikan kebutuhan dan bahaya", "Bangun serta validasi model", "Desain dan simulasi controller", "Implementasi bertahap dan acceptance test"],
    analogies: [["Membangun rumah", "Spesifikasi adalah gambar kerja; simulasi seperti model 3D; commissioning adalah inspeksi akhir."], ["Resep produksi", "Bahan, urutan, toleransi, dan pemeriksaan mutu harus ditentukan sebelum produksi massal."], ["Latihan pilot", "Simulator menguji skenario ekstrem tanpa membahayakan pesawat nyata."]],
    industries: [["Commissioning mesin", "Gunakan FAT, SAT, interlock test, dan trend respons sebelum serah terima."], ["Process control", "Model valve, dead time, dan dinamika tangki menentukan struktur loop."], ["Medical device", "Traceability kebutuhan–risiko–uji wajib untuk fungsi keselamatan."]],
    code: `import numpy as np\n\n# Matriks keputusan sederhana untuk memilih desain controller\ndesigns = ['P', 'PI', 'PID']\n# kolom: error_tunak, settling_time, overshoot, effort (lebih kecil lebih baik)\nmetrics = np.array([[0.12, 5.0, 4.0, 2.0],\n                    [0.01, 3.8, 8.0, 3.0],\n                    [0.00, 2.4, 5.0, 4.5]])\nlimits = np.array([0.02, 4.0, 10.0, 5.0])\nweights = np.array([0.35, 0.30, 0.20, 0.15])\nnormalized = metrics/limits\nscores = normalized@weights\nfor name, score, ok in zip(designs, scores, (metrics<=limits).all(axis=1)):\n    print(f"{name}: skor={score:.3f}, memenuhi semua batas={ok}")\nprint('Pilihan terbaik:', designs[np.argmin(np.where((metrics<=limits).all(axis=1), scores, np.inf))])`,
    refs: ["INCOSE — Systems Engineering Handbook", "Nise — Control Systems Engineering", "Franklin, Powell & Emami-Naeini — Feedback Control", "IEC 61508 — Functional Safety"],
  },
  {
    title: "Transformasi Laplace untuk Sistem Dinamik",
    sub: "Sub-CPMK 2.1 — Mengubah persamaan diferensial domain waktu menjadi model aljabar domain-s",
    intro: "Transformasi Laplace memindahkan persoalan dinamika dari turunan terhadap waktu menjadi operasi aljabar. Dengan kondisi awal yang jelas, engineer dapat memperoleh fungsi transfer, pole, zero, respons transien, dan respons tunak secara sistematis.",
    concepts: [["Transformasi dasar", "Eksponensial, sinus, step, ramp, dan impulse memiliki pasangan transformasi yang menjadi blok penyusun respons.", "L{f(t)}=F(s)"], ["Sifat turunan", "Kondisi awal masuk eksplisit saat turunan ditransformasikan.", "L{x'}=sX-x(0)"], ["Pecahan parsial", "Fungsi rasional diuraikan menjadi bentuk sederhana agar mudah diinverskan.", "Y(s)=Σ A_i/(s-p_i)"], ["Pole dan stabilitas", "Lokasi pole menentukan laju peluruhan, osilasi, dan kestabilan respons.", "Re(p_i)<0"]],
    steps: ["Tuliskan ODE dan kondisi awal", "Transformasikan setiap suku", "Susun X(s) secara aljabar", "Invers Laplace dan cek kondisi awal"],
    analogies: [["Kurs mata uang", "Laplace mengubah representasi tanpa mengubah fenomena; perhitungan tertentu menjadi lebih mudah di domain baru."], ["Membongkar akor", "Pecahan parsial memecah respons kompleks menjadi mode sederhana seperti nada pembentuk akor."], ["Peta metro", "Pole adalah stasiun penting yang menentukan jalur dan karakter perjalanan respons."]],
    industries: [["Motor DC", "Persamaan listrik dan mekanik digabung di domain-s untuk memperoleh kecepatan terhadap tegangan."], ["Suspensi aktif", "Laplace menghubungkan gaya actuator dengan displacement serta percepatan kendaraan."], ["Heat exchanger", "Model orde satu plus dead time dipakai untuk tuning controller temperatur."]],
    code: `import sympy as sp\ns, t = sp.symbols('s t', positive=True)\nX = sp.symbols('X')\n# x'' + 4x' + 13x = 10, x(0)=0, x'(0)=0\nXs = sp.solve(sp.Eq(s**2*X + 4*s*X + 13*X, 10/s), X)[0]\nxt = sp.inverse_laplace_transform(Xs, s, t)\nprint('X(s) =', sp.apart(Xs, s))\nprint('x(t) =', sp.simplify(xt))\nprint('Nilai tunak =', sp.limit(xt, t, sp.oo))\nsp.plot(xt, (t, 0, 8), title='Respons sistem dari invers Laplace')`,
    refs: ["Kreyszig — Advanced Engineering Mathematics", "Ogata — Modern Control Engineering", "Nise — Control Systems Engineering", "Zill — Differential Equations with Boundary-Value Problems"],
  },
  {
    title: "Fungsi Transfer dan Diagram Blok",
    sub: "Sub-CPMK 2.2 — Menurunkan fungsi transfer dan mereduksi interkoneksi seri, paralel, serta feedback",
    intro: "Fungsi transfer menyatakan rasio keluaran terhadap masukan pada kondisi awal nol. Representasi ini mengungkap gain, pole, zero, orde sistem, dan memudahkan reduksi subsistem menjadi satu hubungan masukan–keluaran.",
    concepts: [["Fungsi transfer", "Diperoleh dari model dinamik dengan kondisi awal nol; tidak memuat informasi keadaan internal secara lengkap.", "G(s)=Y(s)/U(s)"], ["Seri", "Gain lintasan seri dikalikan selama tidak ada loading yang mengubah dinamika antarblok.", "G_eq=G1G2"], ["Paralel", "Cabang yang menerima masukan sama dan dijumlahkan di output menghasilkan penjumlahan transfer.", "G_eq=G1±G2"], ["Feedback", "Loop negatif mengubah denominator karakteristik dan biasanya menurunkan sensitivitas.", "T=G/(1+GH)"]],
    steps: ["Tentukan input dan output", "Turunkan model tiap komponen", "Susun arah sinyal dan summing point", "Reduksi lalu cek satuan serta limit DC"],
    analogies: [["Rantai produksi", "Tahap seri mengalikan pengaruh; bottleneck atau dinamika satu tahap memengaruhi seluruh jalur."], ["Dua jalur transportasi", "Cabang paralel membawa kontribusi berbeda yang bertemu kembali di tujuan."], ["Koreksi editor", "Feedback membandingkan hasil dengan standar lalu mengirim koreksi ke penulis."]],
    industries: [["Servo positioning", "Motor, gearbox, beban, encoder, dan controller disusun sebagai diagram blok tertutup."], ["Drive conveyor", "Transfer dari command frekuensi hingga kecepatan belt membantu analisis tracking."], ["Aircraft autopilot", "Loop attitude berada di dalam loop altitude untuk membentuk arsitektur cascade."]],
    code: `import sympy as sp\ns = sp.symbols('s')\nG1 = 5/(2*s+1)\nG2 = 3/(s+4)\nH = 0.2\nG_series = sp.factor(G1*G2)\nT_closed = sp.factor(G_series/(1+G_series*H))\nprint('G seri =', G_series)\nprint('T closed-loop =', T_closed)\nprint('Pole closed-loop =', sp.solve(sp.denom(T_closed), s))\nprint('Gain DC =', sp.simplify(T_closed.subs(s, 0)))`,
    refs: ["Ogata — Modern Control Engineering", "Dorf & Bishop — Modern Control Systems", "Nise — Control Systems Engineering", "Franklin, Powell & Emami-Naeini — Feedback Control"],
  },
  {
    title: "Pemodelan dan Simulasi Sistem Kontrol",
    sub: "Sub-CPMK 3.1 — Menyusun eksperimen simulasi, memilih solver, dan memvalidasi model",
    intro: "Simulasi memungkinkan pengujian skenario normal, ekstrem, dan gagal sebelum controller menyentuh plant nyata. Hasilnya hanya dapat dipercaya jika model, parameter, kondisi awal, solver, dan metrik validasi dinyatakan dengan jelas.",
    concepts: [["Model state-space", "Keadaan menyimpan informasi minimum yang diperlukan untuk memprediksi evolusi sistem.", "x_dot=Ax+Bu"], ["Diskretisasi", "Sampling terlalu lambat menghilangkan dinamika; terlalu cepat menambah beban komputasi dan noise.", "T_s << 1/bandwidth"], ["Solver numerik", "Euler sederhana tetapi kurang akurat; Runge–Kutta memberi kompromi baik untuk banyak ODE nonstiff.", "x[k+1]=x[k]+T_sf(x,u)"], ["Validasi", "Bandingkan model dan data nyata menggunakan residual, RMSE, serta pola error.", "RMSE=sqrt(mean(e²))"]],
    steps: ["Definisikan model dan parameter", "Pilih input, kondisi awal, dan horizon", "Jalankan solver serta simpan metrik", "Bandingkan dengan data dan revisi model"],
    analogies: [["Crash test virtual", "Ribuan varian dapat disaring sebelum prototipe fisik diuji."], ["Ramalan cuaca", "Model perlu data awal dan selalu mengandung ketidakpastian."], ["Peta digital", "Model yang lebih detail belum tentu lebih berguna jika tujuan hanya memilih rute tercepat."]],
    industries: [["Digital twin", "Model aset diperbarui data sensor untuk monitoring dan prediksi."], ["Hardware-in-the-loop", "Controller nyata diuji terhadap plant virtual real-time."], ["Process simulator", "Operator berlatih start-up, trip, dan recovery tanpa risiko produksi."]],
    code: `import numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy.integrate import solve_ivp\n\n# Sistem massa-pegas-redam dengan gaya kontrol proporsional\nm, c, k, Kp, r = 2.0, 1.2, 20.0, 30.0, 1.0\ndef model(t, x):\n    pos, vel = x\n    u = Kp*(r-pos)\n    return [vel, (u-c*vel-k*pos)/m]\nsol = solve_ivp(model, [0, 10], [0, 0], max_step=0.01, dense_output=True)\nt = np.linspace(0, 10, 1001)\npos = sol.sol(t)[0]\nprint(f"Peak={pos.max():.4f}, nilai akhir={pos[-1]:.4f}")\nplt.plot(t, pos, label='posisi'); plt.axhline(r, ls='--', label='setpoint')\nplt.grid(True); plt.legend(); plt.show()`,
    refs: ["Cellier & Kofman — Continuous System Simulation", "Åström & Murray — Feedback Systems", "MathWorks — Simulation and Model-Based Design", "Sargent — Verification and Validation of Simulation Models"],
  },
  {
    title: "Perancangan Kontrol melalui Komputer",
    sub: "Sub-CPMK 3.2 — Merancang alur kontrol digital dari sampling hingga perintah actuator",
    intro: "Controller digital bekerja dalam siklus deterministik: membaca sensor, memfilter, menghitung error, menjalankan algoritma, menerapkan limit keselamatan, mengirim perintah, dan mencatat data. Timing dan saturasi sama pentingnya dengan persamaan kontrol.",
    concepts: [["Sampling", "Frekuensi sampling harus cukup tinggi terhadap bandwidth kontrol dan konsisten untuk menjaga fase.", "f_s ≥ 10–20 f_bw"], ["Kontrol diskrit", "Integral dan derivative diaproksimasi dari sampel; pilihan metode memengaruhi stabilitas.", "I[k]=I[k-1]+K_iT_se[k]"], ["Saturasi", "Actuator memiliki batas posisi, kecepatan, arus, dan temperatur.", "u_min≤u≤u_max"], ["Anti-windup", "Integrator dihentikan atau dikoreksi ketika output controller jenuh.", "I_aw=I+K_aw(u_sat-u)"]],
    steps: ["Pilih sample time dan task priority", "Kalibrasi serta filter sensor", "Hitung controller dengan limit", "Log timestamp, error, output, dan alarm"],
    analogies: [["Metronom", "Loop digital harus berdetak konsisten; jitter mengubah respons seperti tempo musik yang tidak stabil."], ["Gelas penuh", "Integrator terus menambah isi saat actuator sudah penuh; anti-windup mencegah tumpahan."], ["Petugas lalu lintas", "Scheduler menentukan tugas mana yang diproses lebih dahulu saat sumber daya terbatas."]],
    industries: [["PLC", "Scan cycle membaca input, mengeksekusi program, lalu memperbarui output."], ["Embedded motor control", "Interrupt timer menjamin perhitungan arus dan kecepatan tepat waktu."], ["DCS", "Loop process berjalan periodik dengan alarm, historian, dan fail-safe."]],
    code: `import numpy as np\n\n# Simulasi PI digital dengan saturasi dan anti-windup\nTs, Kp, Ki, Kaw = 0.05, 2.0, 1.2, 0.8\nsetpoint, y, integ = 1.0, 0.0, 0.0\nfor k in range(200):\n    e = setpoint-y\n    u_raw = Kp*e+integ\n    u = np.clip(u_raw, -1.0, 1.0)\n    integ += Ts*(Ki*e+Kaw*(u-u_raw))\n    y += Ts*(-y+u)/0.4\nprint(f"output={y:.4f}, error={setpoint-y:.4f}, integral={integ:.4f}")`,
    refs: ["Åström & Wittenmark — Computer-Controlled Systems", "Franklin, Powell & Workman — Digital Control", "IEC 61131-3 — PLC Programming Languages", "Nise — Control Systems Engineering"],
  },
  {
    title: "Membaca Grafik Keluaran dan Respons",
    sub: "Sub-CPMK 3.3 — Mengukur rise time, peak time, overshoot, settling time, dan steady-state error",
    intro: "Grafik respons adalah sidik jari kinerja controller. Engineer tidak cukup menyebut kurva 'bagus'; ia harus mengukur metrik transien dan tunak, mengenali noise atau saturasi, serta menghubungkan bentuk kurva dengan parameter sistem.",
    concepts: [["Rise time", "Waktu keluaran naik dari batas rendah ke batas tinggi, lazimnya 10–90% nilai akhir.", "t_r=t_90%-t_10%"], ["Overshoot", "Puncak di atas nilai akhir menunjukkan kompromi antara kecepatan dan redaman.", "M_p=(y_peak-y_ss)/y_ss×100%"], ["Settling time", "Waktu setelah respons tetap berada di pita toleransi, misalnya ±2%.", "|y-y_ss|≤0.02|y_ss|"], ["Error tunak", "Selisih referensi dan keluaran setelah transien hilang.", "e_ss=lim(t→∞)(r-y)" ]],
    steps: ["Tentukan baseline dan nilai akhir", "Temukan crossing 10% dan 90%", "Ukur peak serta overshoot", "Cari sampel terakhir di luar settling band"],
    analogies: [["Mendaratkan pesawat", "Cepat mencapai landasan tidak cukup; overshoot dan osilasi menentukan keselamatan."], ["Mengisi tangki", "Respons lambat membuang waktu, tetapi terlalu agresif dapat meluap."], ["Menimbang barang", "Jarum yang berosilasi perlu settling sebelum hasil dibaca."]],
    industries: [["Servo CNC", "Overshoot posisi dapat merusak toleransi dimensi."], ["Temperature chamber", "Settling menentukan kapan pengujian material boleh dimulai."], ["Grid frequency", "Nadir, rate of change, dan settling dipakai mengevaluasi respons pembangkit."]],
    code: `import numpy as np\nfrom scipy.signal import find_peaks\n\nt = np.linspace(0, 10, 2001)\nzeta, wn = 0.45, 2.5\nwd = wn*np.sqrt(1-zeta**2)\ny = 1-np.exp(-zeta*wn*t)*(np.cos(wd*t)+zeta/np.sqrt(1-zeta**2)*np.sin(wd*t))\nyss = y[-1]\nt10=t[np.where(y>=0.1*yss)[0][0]]; t90=t[np.where(y>=0.9*yss)[0][0]]\npeak_i=np.argmax(y); overshoot=(y[peak_i]-yss)/yss*100\noutside=np.where(np.abs(y-yss)>0.02*abs(yss))[0]\nts=t[outside[-1]+1] if outside[-1]+1<len(t) else np.nan\nprint(f"rise time={t90-t10:.3f} s")\nprint(f"peak time={t[peak_i]:.3f} s, overshoot={overshoot:.2f}%")\nprint(f"settling time 2%={ts:.3f} s, error tunak={1-yss:.5f}")`,
    refs: ["Nise — Control Systems Engineering", "Ogata — Modern Control Engineering", "IEC 60050 — Control Technology Terminology", "Åström & Murray — Feedback Systems"],
  },
  {
    title: "Karakteristik Respons Sistem Umpan Balik",
    sub: "Sub-CPMK 4.1 — Menganalisis pole, damping ratio, natural frequency, gain, dan sensitivitas",
    intro: "Feedback membentuk persamaan karakteristik baru. Lokasi pole closed-loop menentukan stabilitas dan kecepatan, sedangkan loop gain mengatur tracking, penolakan gangguan, noise, dan robustness. Semua manfaat feedback mempunyai trade-off.",
    concepts: [["Pole dominan", "Pole paling dekat sumbu imajiner biasanya menguasai transien yang tampak.", "s=-ζω_n±jω_n√(1-ζ²)"], ["Sensitivitas", "Sensitivity kecil memperbaiki tracking dan disturbance rejection pada frekuensi terkait.", "S=1/(1+L)"], ["Complementary sensitivity", "T menjelaskan tracking dan transmisi noise pada loop.", "T=L/(1+L), S+T=1"], ["Robustness", "Margin gain dan fase memberi ukuran jarak terhadap ketidakstabilan akibat ketidakpastian.", "PM, GM" ]],
    steps: ["Bentuk loop transfer L(s)", "Hitung pole closed-loop", "Evaluasi S dan T lintas frekuensi", "Periksa margin dan variasi parameter"],
    analogies: [["Mikrofon dan speaker", "Gain tinggi memperkuat suara tetapi dapat memicu feedback melengking."], ["Koreksi berulang", "Semakin kuat koreksi, error turun—hingga keterlambatan membuat koreksi berlebihan."], ["Suspensi kendaraan", "Redaman rendah nyaman pada gangguan kecil tetapi dapat berosilasi lama."]],
    industries: [["Autopilot", "Margin fase melindungi kestabilan dari delay sensor dan actuator."], ["Power converter", "Loop arus cepat berada di dalam loop tegangan yang lebih lambat."], ["Web tension", "Feedback menjaga tegangan material saat diameter roll berubah."]],
    code: `import numpy as np\nfrom scipy import signal\n\n# L(s)=K/(s(s+2)), unity feedback\nfor K in [1, 4, 10, 20]:\n    den_cl = [1, 2, K]\n    poles = np.roots(den_cl)\n    wn = np.sqrt(K); zeta = 1/wn\n    print(f"K={K:>2}: poles={poles}, wn={wn:.3f}, zeta={zeta:.3f}")\n    sys = signal.TransferFunction([K], den_cl)\n    t, y = signal.step(sys)\n    print(f"    peak={y.max():.3f}, final={y[-1]:.3f}")`,
    refs: ["Åström & Murray — Feedback Systems", "Skogestad & Postlethwaite — Multivariable Feedback Control", "Nise — Control Systems Engineering", "Franklin, Powell & Emami-Naeini — Feedback Control"],
  },
  {
    title: "Analisis dan Perancangan Kontrol PID",
    sub: "Sub-CPMK 4.2 — Memahami aksi P, I, D dan melakukan tuning PID yang aman",
    intro: "PID tetap menjadi controller industri paling luas karena transparan, murah, dan efektif. P memperkuat koreksi saat ini, I menghapus bias masa lalu, dan D mengantisipasi perubahan—tetapi derivative harus difilter dan integral perlu anti-windup.",
    concepts: [["Proporsional", "Meningkatkan respons terhadap error saat ini; gain terlalu tinggi menurunkan robustness.", "u_P=K_pe"], ["Integral", "Mengakumulasi error sehingga offset tunak hilang, namun dapat memperlambat dan menyebabkan windup.", "u_I=K_i∫e dt"], ["Derivatif", "Merespons laju perubahan untuk menambah redaman; sensitif terhadap noise.", "u_D=K_d de/dt"], ["Tuning", "Ziegler–Nichols, IMC, relay, dan optimization adalah titik awal yang harus divalidasi terhadap batas plant.", "K_p,T_i,T_d" ]],
    steps: ["Identifikasi dinamika dan batas actuator", "Mulai P lalu tambahkan I", "Tambahkan D terfilter bila diperlukan", "Uji setpoint, disturbance, noise, dan saturasi"],
    analogies: [["Mengisi gelas", "P melihat selisih saat ini, I mengingat kekurangan, D memperlambat saat mendekati penuh."], ["Mengemudi", "P melihat jarak dari jalur, D melihat seberapa cepat mobil menyimpang."], ["Menabung target", "Integral mengakumulasi kekurangan kecil hingga tindakan cukup untuk menghapus offset."]],
    industries: [["Flow control", "PI umum dipakai karena sensor flow cepat dan derivative mudah memperkuat noise."], ["Furnace", "PID temperatur harus menangani dead time serta limit heater."], ["Motion control", "Cascade current–velocity–position memanfaatkan bandwidth berbeda."]],
    code: `import numpy as np\nimport matplotlib.pyplot as plt\n\nTs=0.01; t=np.arange(0,8,Ts); r=np.ones_like(t)\nKp,Ki,Kd,N=3.0,2.2,0.35,20.0\ny=0.0; integ=0.0; d_filt=0.0; e_prev=0.0; ys=[]; us=[]\nfor rk in r:\n    e=rk-y\n    derivative=(e-e_prev)/Ts\n    d_filt += Ts*N*(derivative-d_filt)\n    u_raw=Kp*e+integ+Kd*d_filt\n    u=np.clip(u_raw,-2,2)\n    integ += Ts*(Ki*e+1.0*(u-u_raw))\n    y += Ts*(-y+u)/0.6\n    e_prev=e; ys.append(y); us.append(u)\nprint(f"final={ys[-1]:.4f}, max={max(ys):.4f}")\nplt.plot(t,ys,label='y'); plt.plot(t,r,'--',label='r'); plt.plot(t,us,label='u')\nplt.grid(True); plt.legend(); plt.show()`,
    refs: ["Åström & Hägglund — Advanced PID Control", "Visioli — Practical PID Control", "ISA — PID Algorithms and Performance", "Skogestad — Simple Analytic Rules for Model Reduction and PID Tuning"],
  },
  {
    title: "Aturan Mason dan Grafik Aliran Sinyal",
    sub: "Sub-CPMK 4.3 — Menghitung gain total dari lintasan maju dan loop menggunakan Mason's Gain Formula",
    intro: "Signal-flow graph menampilkan hubungan antarvariabel sebagai node dan branch gain. Mason's Gain Formula menghitung transfer total tanpa mereduksi diagram blok satu per satu, terutama saat terdapat banyak loop yang saling bersinggungan.",
    concepts: [["Forward path", "Lintasan dari input ke output yang tidak melewati node lebih dari sekali.", "P_k=produk branch"], ["Loop", "Lintasan tertutup yang kembali ke node awal tanpa mengulang node lain.", "L_i=produk branch loop"], ["Non-touching loops", "Dua loop tidak bersentuhan jika tidak berbagi node.", "L_iL_j"], ["Mason", "Delta menggabungkan loop tunggal, pasangan, tripel non-touching secara inklusi–eksklusi.", "T=ΣP_kΔ_k/Δ" ]],
    steps: ["Daftar seluruh forward path", "Daftar loop individual", "Cari pasangan loop non-touching", "Hitung Δ, Δk, lalu T"],
    analogies: [["Rute logistik", "Forward path adalah rute asal–tujuan; loop adalah kendaraan yang kembali ke titik sebelumnya."], ["Arus informasi organisasi", "Cabang menggambarkan pengaruh satu bagian terhadap bagian lain."], ["Jaringan listrik", "Beberapa lintasan dan loop berkontribusi simultan pada respons total."]],
    industries: [["Control architecture", "Mason membantu menganalisis loop silang pada sistem multivariabel sederhana."], ["Mechatronics", "Interaksi sensor–controller–actuator dapat dipetakan sebagai graph."], ["Communication system", "Gain lintasan dan feedback receiver dianalisis tanpa reduksi panjang."]],
    code: `import sympy as sp\nG1,G2,G3,H1,H2=sp.symbols('G1 G2 G3 H1 H2')\n# Contoh: satu forward path P1 dan dua loop yang saling bersentuhan\nP1=G1*G2*G3\nL1=-G2*H1\nL2=-G1*G2*G3*H2\nDelta=1-(L1+L2)  # tidak ada pasangan non-touching\nT=sp.factor(P1/Delta)\nprint('P1 =',P1)\nprint('Loop =',L1,L2)\nprint('Delta =',Delta)\nprint('Transfer Mason =',T)\nprint('Contoh numerik =',T.subs({G1:2,G2:3,G3:4,H1:.1,H2:.05}))`,
    refs: ["Mason — Feedback Theory: Further Properties of Signal Flow Graphs", "Nise — Control Systems Engineering", "Ogata — Modern Control Engineering", "Dorf & Bishop — Modern Control Systems"],
  },
  {
    title: "Ikhtisar Metode Kontrol Cerdas",
    sub: "Sub-CPMK 5.1 — Membandingkan fuzzy logic, neural network, dan genetic algorithm",
    intro: "Kontrol cerdas melengkapi kontrol klasik ketika plant nonlinier, parameter berubah, model sulit diturunkan, atau aturan operator lebih mudah dinyatakan daripada persamaan. Pemilihan metode harus mempertimbangkan data, interpretabilitas, komputasi, dan jaminan keselamatan.",
    concepts: [["Fuzzy logic", "Mengubah pengetahuan linguistik menjadi aturan IF–THEN yang transparan.", "e,de → fuzzifikasi → u"], ["Neural network", "Belajar pemetaan nonlinier dari data; kuat tetapi membutuhkan validasi distribusi dan proteksi out-of-domain.", "y=f_W(x)"], ["Genetic algorithm", "Mencari parameter melalui populasi, seleksi, crossover, dan mutasi tanpa gradien.", "min J(θ)"], ["Hybrid control", "Kontrol klasik menjaga baseline; AI menala, mengestimasi, atau mengoptimasi di lapisan supervisori.", "safety shell + AI" ]],
    steps: ["Definisikan tujuan dan batas aman", "Nilai ketersediaan model serta data", "Pilih metode paling sederhana yang memadai", "Validasi nominal, ekstrem, dan kegagalan"],
    analogies: [["Ahli operator", "Fuzzy menuliskan intuisi operator sebagai aturan yang dapat dihitung."], ["Magang dari contoh", "Neural network belajar pola setelah melihat banyak pasangan input–output."], ["Seleksi alam", "GA mempertahankan kandidat baik dan mengombinasikannya untuk mencari solusi baru."]],
    industries: [["HVAC", "Fuzzy supervisor menyeimbangkan kenyamanan dan energi."], ["Predictive maintenance", "NN mengestimasi kondisi atau remaining useful life dari sensor."], ["Controller tuning", "GA mencari parameter PID multiobjektif dengan batas actuator."]],
    code: `import numpy as np\n\n# Pembanding sederhana: controller P vs rule-based fuzzy-like\ndef fuzzy_like(e, de):\n    # aturan transparan dengan blending halus\n    aggressive=np.tanh(2.5*e)\n    damping=np.tanh(1.5*de)\n    return 1.4*aggressive+0.5*damping\n\nfor e,de in [(-1,-.2),(-.2,.1),(0,0),(.3,-.1),(1,.4)]:\n    u_p=1.8*e\n    u_f=fuzzy_like(e,de)\n    print(f"e={e:+.1f}, de={de:+.1f} | P={u_p:+.3f}, cerdas={u_f:+.3f}")`,
    refs: ["Passino & Yurkovich — Fuzzy Control", "Haykin — Neural Networks and Learning Machines", "Goldberg — Genetic Algorithms", "Sutton & Barto — Reinforcement Learning"],
  },
  {
    title: "Sistem Kontrol Artificial Neural Network",
    sub: "Sub-CPMK 5.2 — Menjelaskan neuron, aktivasi, loss, training, dan penggunaan ANN pada kontrol",
    intro: "ANN dapat mengaproksimasi hubungan nonlinier untuk identifikasi plant, inverse model, estimasi keadaan, atau supervisory control. ANN tidak otomatis aman: kualitas data, normalisasi, overfitting, latency, dan perilaku di luar distribusi harus diuji.",
    concepts: [["Neuron", "Menjumlahkan input berbobot dan bias lalu melewati fungsi aktivasi.", "z=wᵀx+b; a=φ(z)"], ["Loss", "Mengukur selisih prediksi dan target, kadang ditambah regularisasi atau penalti batas fisik.", "J=MSE+λR"], ["Backpropagation", "Gradient dihitung dari output kembali ke layer awal untuk memperbarui bobot.", "W←W-η∂J/∂W"], ["ANN dalam loop", "Gunakan sebagai model, estimator, tuner, atau residual compensator dengan controller aman sebagai fallback.", "u=u_baseline+u_NN" ]],
    steps: ["Kumpulkan data yang mewakili operasi", "Pisahkan train/validation/test", "Latih dan cek generalisasi", "Pasang guard, monitor drift, dan fallback"],
    analogies: [["Jaringan jalan", "Setiap koneksi membawa bobot pengaruh; banyak jalur membentuk keputusan akhir."], ["Belajar mengemudi", "Model membaik dari contoh tetapi perlu skenario cuaca dan jalan yang beragam."], ["Asisten operator", "ANN memberi rekomendasi, sementara interlock tetap memegang keputusan keselamatan."]],
    industries: [["Soft sensor", "ANN memperkirakan kualitas produk yang sulit diukur online."], ["Robot", "Inverse dynamics NN mengompensasi friksi dan nonlinearitas."], ["Energy system", "NN memprediksi beban untuk supervisory control."]],
    code: `import numpy as np\nfrom sklearn.neural_network import MLPRegressor\nfrom sklearn.metrics import mean_squared_error\n\nrng=np.random.default_rng(7)\nu=rng.uniform(-2,2,800)\ny=np.tanh(1.4*u)+0.08*u**3\nX=u.reshape(-1,1)\nidx=rng.permutation(len(X)); train=idx[:600]; test=idx[600:]\nmodel=MLPRegressor(hidden_layer_sizes=(16,16),activation='tanh',\n                   max_iter=4000,random_state=7).fit(X[train],y[train])\npred=model.predict(X[test])\nprint('Test RMSE =',mean_squared_error(y[test],pred)**0.5)\nfor value in [-1.5,-.5,.5,1.5]:\n    print(value,'->',model.predict([[value]])[0])`,
    refs: ["Haykin — Neural Networks and Learning Machines", "Goodfellow, Bengio & Courville — Deep Learning", "Narendra & Parthasarathy — Identification and Control Using Neural Networks", "ISO/IEC 23894 — AI Risk Management"],
  },
  {
    title: "Sistem Kontrol Logika Fuzzy",
    sub: "Sub-CPMK 5.3 — Merancang variabel linguistik, membership function, rule base, inferensi, dan defuzzifikasi",
    intro: "Fuzzy control memetakan istilah seperti 'error besar positif' dan 'perubahan cepat' menjadi aksi kontrol numerik. Kekuatan utamanya adalah interpretabilitas dan kemampuan menangkap heuristik operator tanpa model plant presisi.",
    concepts: [["Fuzzifikasi", "Input crisp diubah menjadi derajat keanggotaan 0–1 pada beberapa himpunan linguistik.", "μ_A(x)∈[0,1]"], ["Rule base", "Aturan IF–THEN menghubungkan kondisi error dan delta-error dengan aksi.", "IF e=P AND de=N THEN u=PM"], ["Inferensi", "Operator AND/OR dan implication menggabungkan kekuatan aturan.", "α=min(μ_e,μ_de)"], ["Defuzzifikasi", "Output fuzzy diubah menjadi nilai actuator, misalnya centroid atau weighted average.", "u*=Σα_iz_i/Σα_i" ]],
    steps: ["Tentukan rentang dan scaling input", "Rancang membership function overlap", "Susun rule table lengkap", "Uji surface, saturasi, dan noise"],
    analogies: [["Bahasa sehari-hari", "Kata 'agak panas' tidak biner; memiliki derajat yang berubah halus."], ["Mengatur keran", "Aksi tidak hanya ON/OFF, tetapi sedikit, sedang, atau banyak berdasarkan kondisi."], ["Operator senior", "Rule base merekam keputusan yang biasanya tersimpan sebagai intuisi."]],
    industries: [["Crane", "Fuzzy meredam swing berdasarkan sudut dan kecepatan ayun."], ["Air conditioning", "Mengatur compressor dan fan dari error suhu serta kelembapan."], ["Water level", "Valve diatur halus berdasarkan level dan laju perubahan."]],
    code: `import numpy as np\n\ndef tri(x,a,b,c):\n    return max(0.0,min((x-a)/(b-a) if b!=a else 1,\n                       (c-x)/(c-b) if c!=b else 1))\n\ndef fuzzy_control(error):\n    mu_N=tri(error,-2,-1,0); mu_Z=tri(error,-1,0,1); mu_P=tri(error,0,1,2)\n    consequents=np.array([-1.0,0.0,1.0])\n    weights=np.array([mu_N,mu_Z,mu_P])\n    return float(weights@consequents/weights.sum()) if weights.sum() else 0.0\n\nfor e in np.linspace(-1.5,1.5,7):\n    print(f"error={e:+.2f} -> u={fuzzy_control(e):+.3f}")`,
    refs: ["Zadeh — Fuzzy Sets", "Mamdani & Assilian — Experiment in Linguistic Synthesis with a Fuzzy Logic Controller", "Ross — Fuzzy Logic with Engineering Applications", "Passino & Yurkovich — Fuzzy Control"],
  },
  {
    title: "Optimasi Kontrol dengan Algoritma Genetika",
    sub: "Sub-CPMK 5.4 — Mengoptimalkan parameter controller melalui kromosom, fitness, seleksi, crossover, dan mutasi",
    intro: "Genetic Algorithm mencari parameter controller tanpa memerlukan turunan objective. Metode ini cocok untuk objective nonlinier, diskrit, multi-puncak, atau berbasis simulasi, tetapi memerlukan evaluasi banyak kandidat dan desain fitness yang tidak dapat dieksploitasi secara keliru.",
    concepts: [["Kromosom", "Satu kandidat menyimpan parameter controller, misalnya [Kp, Ki, Kd].", "θ=[K_p,K_i,K_d]"], ["Fitness", "Objective menggabungkan tracking error, overshoot, settling, control effort, dan penalti constraint.", "J=w1IAE+w2M_p+w3∫u²dt"], ["Seleksi & crossover", "Kandidat baik lebih mungkin menjadi parent; crossover mengombinasikan informasi antarsolusi.", "child=αp1+(1-α)p2"], ["Mutasi & elitisme", "Mutasi menjaga keragaman; elitisme mempertahankan solusi terbaik agar tidak hilang.", "θ'=θ+N(0,σ)" ]],
    steps: ["Tentukan bounds dan fitness", "Inisialisasi populasi beragam", "Seleksi, crossover, mutasi, repair", "Validasi solusi terbaik pada skenario baru"],
    analogies: [["Pemuliaan tanaman", "Karakter baik dipilih dan dikombinasikan lintas generasi."], ["Turnamen desain", "Banyak rancangan diuji; terbaik dipertahankan, sebagian dimodifikasi."], ["Eksplorasi resep", "Mutasi mencoba kombinasi yang tidak terpikirkan tetapi tetap dalam batas aman."]],
    industries: [["PID tuning", "GA mengoptimalkan tracking dan effort pada model nonlinear."], ["Energy management", "Parameter dispatch dicari di bawah constraint kapasitas dan biaya."], ["Trajectory planning", "Waypoint atau spline dioptimalkan untuk waktu, energi, dan collision avoidance."]],
    code: `import numpy as np\nrng=np.random.default_rng(42)\n\ndef fitness(pop):\n    kp,ki,kd=pop.T\n    # surrogate objective tuning PID; minimum dekat (2.5,1.2,0.35)\n    return (kp-2.5)**2+2*(ki-1.2)**2+3*(kd-.35)**2+0.02*(kp+ki+kd)**2\n\npop=rng.uniform([0,0,0],[6,4,2],size=(60,3))\nfor gen in range(100):\n    J=fitness(pop); elite=pop[np.argsort(J)[:10]]\n    children=[]\n    while len(children)<50:\n        p1,p2=elite[rng.integers(0,len(elite),2)]\n        a=rng.random(); child=a*p1+(1-a)*p2+rng.normal(0,[.15,.1,.04])\n        children.append(np.clip(child,[0,0,0],[6,4,2]))\n    pop=np.vstack([elite,children])\nbest=pop[np.argmin(fitness(pop))]\nprint(f"Kp={best[0]:.4f}, Ki={best[1]:.4f}, Kd={best[2]:.4f}")\nprint('fitness=',fitness(best.reshape(1,-1))[0])`,
    refs: ["Goldberg — Genetic Algorithms in Search, Optimization, and Machine Learning", "Holland — Adaptation in Natural and Artificial Systems", "Deb — Multi-Objective Optimization Using Evolutionary Algorithms", "Michalewicz — Genetic Algorithms + Data Structures"],
  },
];

const css = `
/* SISKENCERDAS-RICH-CONTENT:START */
.sisken-placeholder{max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;text-align:left!important}
.sisken-rich{min-height:calc(100vh - 100px);padding:48px clamp(18px,4vw,64px) 80px;background:radial-gradient(circle at 85% 5%,rgba(0,229,255,.08),transparent 30%),radial-gradient(circle at 15% 15%,rgba(124,77,255,.1),transparent 28%)}
.sisken-rich *{box-sizing:border-box}.sisken-kicker{font:700 11px 'JetBrains Mono',monospace;letter-spacing:2px;text-transform:uppercase;color:var(--cyan)}
.sisken-title{font:900 clamp(38px,6vw,72px)/1.04 'Playfair Display',serif;color:#f4f7ff;max-width:1050px;margin:14px 0}.sisken-title em{color:var(--cyan);font-style:normal}
.sisken-lead{font-size:18px;color:#9eacc5;max-width:1000px;line-height:1.75}.sisken-sub{display:inline-flex;margin-top:18px;padding:8px 13px;border:1px solid rgba(0,229,255,.24);border-radius:9px;background:rgba(0,229,255,.06);color:#b8f6ff;font:600 12px 'JetBrains Mono',monospace}
.sisken-tabs{display:flex;gap:8px;overflow-x:auto;margin:34px 0 22px;padding-bottom:4px;scrollbar-width:thin}.sisken-tab{border:1px solid #24344d;background:#0b1421;color:#7185a6;padding:11px 15px;border-radius:10px;font:700 11px 'JetBrains Mono',monospace;white-space:nowrap;cursor:pointer}.sisken-tab.active{color:#071118;background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 24px rgba(0,229,255,.2)}
.sisken-pane{display:none}.sisken-pane.active{display:block;animation:siskenFade .25s ease}@keyframes siskenFade{from{opacity:.25;transform:translateY(5px)}to{opacity:1;transform:none}}
.sisken-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:15px}.sisken-card{padding:20px;border:1px solid #1b2b42;border-radius:14px;background:linear-gradient(145deg,rgba(13,21,32,.96),rgba(7,13,22,.96));box-shadow:0 15px 34px rgba(0,0,0,.18)}.sisken-card h3{font-size:18px;color:#eef4ff;margin:0 0 8px}.sisken-card p{color:#91a1bb;line-height:1.65;margin:0}.sisken-formula{margin-top:14px;padding:9px 11px;border-left:3px solid var(--violet);background:rgba(124,77,255,.08);color:#cabfff;font:600 13px 'JetBrains Mono',monospace;overflow-x:auto}
.sisken-section-head{font:800 28px 'Playfair Display',serif;color:#f0f5ff;margin:8px 0 16px}.sisken-flow{counter-reset:flow;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:22px}.sisken-flow div{counter-increment:flow;padding:17px;border:1px solid rgba(255,179,0,.2);border-radius:12px;background:rgba(255,179,0,.04);color:#b5c0d3}.sisken-flow div:before{content:counter(flow,decimal-leading-zero);display:block;color:var(--amber);font:800 19px 'JetBrains Mono',monospace;margin-bottom:7px}
.sisken-analogy{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.sisken-analogy .sisken-card{border-top:3px solid var(--amber)}.sisken-industry .sisken-card{border-top:3px solid var(--green)}
.sisken-anim-box{padding:20px;border:1px solid rgba(0,229,255,.25);border-radius:16px;background:#07111d}.sisken-anim-box canvas{width:100%;height:310px;display:block;background:#050b13;border-radius:11px;border:1px solid #15263c}.sisken-controls{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:15px 0}.sisken-controls label{color:#9eb0ca;font:600 12px 'JetBrains Mono',monospace}.sisken-controls input{accent-color:var(--cyan);width:min(320px,70vw)}.sisken-run{padding:9px 14px;border-radius:9px;border:1px solid var(--cyan);background:rgba(0,229,255,.12);color:var(--cyan);font:700 11px 'JetBrains Mono',monospace;cursor:pointer}
.sisken-rich .code-wrap{margin:16px 0}.sisken-code-note{padding:13px 15px;border:1px solid rgba(124,77,255,.22);border-radius:11px;background:rgba(124,77,255,.06);color:#aebbd0;margin-bottom:14px}.sisken-ref-list{display:grid;gap:10px;counter-reset:refs}.sisken-ref-list li{list-style:none;counter-increment:refs;padding:14px 16px 14px 54px;position:relative;border:1px solid #1b2b42;border-radius:11px;background:#0a131f;color:#aab7cc}.sisken-ref-list li:before{content:counter(refs);position:absolute;left:15px;top:11px;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:rgba(0,229,255,.1);color:var(--cyan);font:700 11px 'JetBrains Mono',monospace}
.sisken-task{margin:36px auto;max-width:1060px;padding:clamp(22px,4vw,42px);border:1px solid #22334d;border-radius:18px;background:linear-gradient(145deg,#0c1624,#08111d)}.sisken-task h2{font:800 clamp(30px,5vw,50px) 'Playfair Display',serif;color:#f4f7ff}.sisken-task>p{color:#9eacc3;font-size:17px;line-height:1.7}.sisken-task .sisken-card{border-top:3px solid var(--cyan)}.sisken-task-note{margin-top:20px;padding:14px 16px;border:1px solid rgba(0,230,118,.25);border-radius:11px;background:rgba(0,230,118,.06);color:#b8efd0}
@media(max-width:700px){.sisken-rich{padding-top:28px}.sisken-tabs{margin-top:24px}.sisken-anim-box canvas{height:240px}}
@media(prefers-reduced-motion:reduce){.sisken-pane.active{animation:none}}
/* SISKENCERDAS-RICH-CONTENT:END */`;

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function cards(items, className = "") {
  return `<div class="sisken-grid ${className}">${items.map(([h, p, f]) => `<article class="sisken-card"><h3>${h}</h3><p>${p}</p>${f ? `<div class="sisken-formula">${f}</div>` : ""}</article>`).join("")}</div>`;
}

function richModule(m, index) {
  const n = index + 1;
  const p = n <= 7 ? n : n + 1;
  return `<div class="sisken-placeholder"><section class="sisken-rich" id="sisken-module-${n}">
    <div class="sisken-kicker">Sistem Kendali Cerdas · Modul ${n} · Pertemuan ${p}</div>
    <h1 class="sisken-title">${m.title.replace(/ (\S+)$/, " <em>$1</em>")}</h1>
    <p class="sisken-lead">${m.intro}</p><div class="sisken-sub">${m.sub}</div>
    <div class="sisken-tabs" role="tablist" aria-label="Bagian materi Modul ${n}">
      ${[["materi","Materi Inti"],["analogi","Analogi"],["animasi","Animasi"],["industri","Penerapan Industri"],["python","Python"],["referensi","Referensi"]].map(([id,label],i)=>`<button class="sisken-tab${i===0?" active":""}" role="tab" aria-selected="${i===0}" onclick="openSiskenPane(${n},'${id}',this)">${label}</button>`).join("")}
    </div>
    <div class="sisken-pane active" data-sisken-pane="${n}-materi"><h2 class="sisken-section-head">Konsep yang Wajib Dikuasai</h2>${cards(m.concepts)}<h2 class="sisken-section-head" style="margin-top:30px">Alur Berpikir Engineer</h2><div class="sisken-flow">${m.steps.map(s=>`<div>${s}</div>`).join("")}</div></div>
    <div class="sisken-pane" data-sisken-pane="${n}-analogi"><h2 class="sisken-section-head">Analogi untuk Membangun Intuisi</h2><div class="sisken-analogy">${cards(m.analogies)}</div></div>
    <div class="sisken-pane" data-sisken-pane="${n}-animasi"><h2 class="sisken-section-head">Animasi Respons Loop Tertutup</h2><p class="sisken-lead" style="font-size:15px;margin-bottom:14px">Geser parameter untuk mengamati perubahan kecepatan, overshoot, dan error. Visual ini menjadi jembatan antara konsep ${m.title.toLowerCase()} dan respons waktu.</p><div class="sisken-anim-box"><div class="sisken-controls"><label>Agresivitas controller <span id="siskenGainValue${n}">1.5</span></label><input id="siskenGain${n}" type="range" min="0.2" max="5" step="0.1" value="1.5" oninput="drawSiskenAnimation(${n})"><button class="sisken-run" onclick="toggleSiskenAnimation(${n})">▶ Jalankan Animasi</button></div><canvas id="siskenCanvas${n}" width="1000" height="360" aria-label="Animasi respons kontrol Modul ${n}"></canvas></div></div>
    <div class="sisken-pane" data-sisken-pane="${n}-industri"><h2 class="sisken-section-head">Penerapan pada Sistem Industri</h2>${cards(m.industries,"sisken-industry")}</div>
    <div class="sisken-pane" data-sisken-pane="${n}-python"><h2 class="sisken-section-head">Implementasi Python Siap Salin</h2><div class="sisken-code-note">Salin satu cell lengkap ke Jupyter Notebook atau VS Code. Jalankan tanpa perubahan terlebih dahulu, kemudian ubah parameter untuk eksperimen.</div><div class="code-wrap reveal visible"><div class="code-header"><div class="code-dots"><span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span></div><span class="code-label">Cell 1 — ${m.title}</span><span class="code-lang">Python</span><button class="code-copy" onclick="cpC(this)">📋 Copy</button></div><pre>${esc(m.code)}</pre></div></div>
    <div class="sisken-pane" data-sisken-pane="${n}-referensi"><h2 class="sisken-section-head">Referensi Utama</h2><ol class="sisken-ref-list">${m.refs.map(r=>`<li>${r}</li>`).join("")}</ol></div>
  </section>${runtime}</div>`;
}

function taskPanel(m, index) {
  const n = index + 1;
  return `<div class="sisken-placeholder"><section class="sisken-task"><div class="sisken-kicker">Tugas Modul ${n} · Asesmen Teknis</div><h2>${m.title}</h2><p>Tugas difokuskan sepenuhnya pada bukti analisis teknik yang dapat diverifikasi: model, perhitungan, kode, grafik, dan interpretasi hasil.</p><div class="sisken-grid" style="margin-top:24px"><article class="sisken-card"><h3>1 · Analisis Sistem</h3><p>Identifikasi input, output, gangguan, constraint, dan metrik kinerja untuk kasus yang diberikan.</p></article><article class="sisken-card"><h3>2 · Implementasi Python</h3><p>Gunakan panel kode pada tab Python sebagai titik awal. Ubah parameter, jalankan, dan dokumentasikan output.</p></article><article class="sisken-card"><h3>3 · Interpretasi Teknik</h3><p>Jelaskan hubungan parameter dengan stabilitas, respons, robustness, atau kualitas keputusan controller.</p></article></div><div class="sisken-task-note">✓ Penilaian objektif dan komputasi dijalankan melalui mekanisme server. Setiap kesimpulan harus didukung hasil hitung atau keluaran program.</div></section></div>`;
}

const runtime = `<script id="sisken-rich-runtime">
window.openSiskenPane=function(n,id,button){
  var root=document.getElementById('sisken-module-'+n); if(!root)return;
  root.querySelectorAll('.sisken-pane').forEach(function(p){p.classList.toggle('active',p.dataset.siskenPane===n+'-'+id)});
  root.querySelectorAll('.sisken-tab').forEach(function(b){var active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
  if(id==='animasi')requestAnimationFrame(function(){drawSiskenAnimation(n)});
};
window._siskenAnim={};
window.drawSiskenAnimation=function(n,phase){
  var canvas=document.getElementById('siskenCanvas'+n), slider=document.getElementById('siskenGain'+n);if(!canvas||!slider)return;
  var ctx=canvas.getContext('2d'),g=Number(slider.value),w=canvas.width,h=canvas.height,pad=58;document.getElementById('siskenGainValue'+n).textContent=g.toFixed(1);
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#050b13';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#14243a';ctx.lineWidth=1;
  for(var i=0;i<=10;i++){var x=pad+i*(w-2*pad)/10;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,h-pad);ctx.stroke()}
  for(var j=0;j<=5;j++){var y=pad+j*(h-2*pad)/5;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
  var z=Math.max(.18,1.05-.14*g),wn=.7+g*.65,wd=wn*Math.sqrt(Math.max(.02,1-z*z));
  ctx.setLineDash([9,7]);ctx.strokeStyle='#ffb300';ctx.beginPath();ctx.moveTo(pad,h-pad-(h-2*pad)*.7);ctx.lineTo(w-pad,h-pad-(h-2*pad)*.7);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#00e5ff';ctx.lineWidth=3;ctx.beginPath();var points=[];
  for(var k=0;k<650;k++){var t=8*k/649;var resp=1-Math.exp(-z*wn*t)*(Math.cos(wd*t)+(z/Math.sqrt(Math.max(.02,1-z*z)))*Math.sin(wd*t));var px=pad+k*(w-2*pad)/649,py=h-pad-(h-2*pad)*.7*resp;points.push([px,py]);if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.stroke();
  var idx=Math.floor((((phase||0)%1)+1)%1*(points.length-1)),pt=points[idx];ctx.fillStyle='#ff4081';ctx.beginPath();ctx.arc(pt[0],pt[1],7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8da1bf';ctx.font='20px JetBrains Mono';ctx.fillText('waktu →',w-170,h-18);ctx.fillText('y(t)',12,38);ctx.fillStyle='#ffb300';ctx.fillText('setpoint',w-165,h-pad-(h-2*pad)*.7-12);
};
window.toggleSiskenAnimation=function(n){var state=window._siskenAnim[n]||{running:false,start:0};state.running=!state.running;state.start=performance.now();window._siskenAnim[n]=state;if(!state.running)return;(function tick(now){if(!state.running)return;drawSiskenAnimation(n,(now-state.start)/6000);requestAnimationFrame(tick)})(performance.now())};
</script>`;

for (const [index, m] of modules.entries()) {
  const file = path.join(moduleDir, `Modul-${index + 1}.html`);
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<script id="sisken-rich-runtime">[\s\S]*?<\/script>/g, "");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>Modul ${index + 1} — ${m.title} | Sistem Kendali Cerdas</title>`);
  html = html.replace(/^[ \t]*<span class="nav-brand">[^\r\n]*$/m, `  <span class="nav-brand"><span class="pulse"></span><span>SISKENCERDAS // M${index + 1}</span></span>`);
  html = html.replace(/id="visitorTableBody" style="max-height:[^;\"]+;overflow-y:auto;"/g, 'id="visitorTableBody" style="max-height:min(72vh,820px);overflow-y:auto;"');
  html = html.replace(/<div class="page active" id="page-modul">[\s\S]*?<\/div>\s*<!-- end page-modul -->/, `<div class="page active" id="page-modul">${richModule(m, index)}\n</div><!-- end page-modul -->`);
  html = html.replace(/<div class="page" id="page-tugas">[\s\S]*?<\/div>\s*<!-- end page-tugas -->/, `<div class="page" id="page-tugas">${taskPanel(m, index)}\n</div><!-- end page-tugas -->`);
  html = html.replace(/\/\* SISKENCERDAS-RICH-CONTENT:START \*\/[\s\S]*?\/\* SISKENCERDAS-RICH-CONTENT:END \*\//, css.trim());
  if (!html.includes("SISKENCERDAS-RICH-CONTENT:START")) html = html.replace("</head>", `<style>${css}</style>\n</head>`);
  fs.writeFileSync(file, html, "utf8");
}

console.log(`Enriched ${modules.length} Sistem Kendali Cerdas modules.`);
