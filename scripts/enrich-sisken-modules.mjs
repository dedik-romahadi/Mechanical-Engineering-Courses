import fs from "node:fs";
import path from "node:path";

import { MATERI } from "./sisken-materi.mjs";
import { FORUM } from "./sisken-forum.mjs";
import { PUSTAKA } from "./sisken-pustaka.mjs";
import { rumusLatex as _rumusLatex, tokenLatex, tokenNotasi } from "./sisken-rumus.mjs";
import { PENJELASAN_RUMUS, NOTASI_KAMUS } from "./sisken-rumus-jelas.mjs";
import { normalizeSiskenExportHtml } from "./sisken-export-html.mjs";
import { normalizeSiskenForumRuntime } from "./sisken-forum-runtime.mjs";
import { ANIMASI_MODUL, PENJELASAN_ANIMASI } from "./sisken-animasi.mjs";

const rumusLatex = (teks) => _rumusLatex(teks, esc);

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
    concepts: [["Model state-space", "Keadaan menyimpan informasi minimum yang diperlukan untuk memprediksi evolusi sistem.", "x_dot=Ax+Bu"], ["Diskretisasi", "Sampling terlalu lambat menghilangkan dinamika; terlalu cepat menambah beban komputasi dan noise.", "T_s << 1/bandwidth"], ["Solver numerik", "Euler sederhana tetapi kurang akurat; Runge–Kutta memberi kompromi baik untuk banyak ODE nonstiff.", "x[k+1] = x[k] + T_s*f(x,u)"], ["Validasi", "Bandingkan model dan data nyata menggunakan residual, RMSE, serta pola error.", "RMSE=sqrt(mean(e²))"]],
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
    concepts: [["Sampling", "Frekuensi sampling harus cukup tinggi terhadap bandwidth kontrol dan konsisten untuk menjaga fase.", "f_s ≥ 10–20 f_bw"], ["Kontrol diskrit", "Integral dan derivative diaproksimasi dari sampel; pilihan metode memengaruhi stabilitas.", "I[k] = I[k-1] + Ki*T_s*e[k]"], ["Saturasi", "Actuator memiliki batas posisi, kecepatan, arus, dan temperatur.", "u_min≤u≤u_max"], ["Anti-windup", "Integrator dihentikan atau dikoreksi ketika output controller jenuh.", "I_aw=I+K_aw(u_sat-u)"]],
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
    analogies: [["Mikrofon dan speaker", "Gain tinggi memperkuat suara tetapi dapat memicu feedback melengking."], ["Koreksi berulang", "Semakin kuat koreksi, error turun, sampai keterlambatan membuat koreksi berlebihan."], ["Suspensi kendaraan", "Redaman rendah nyaman pada gangguan kecil tetapi dapat berosilasi lama."]],
    industries: [["Autopilot", "Margin fase melindungi kestabilan dari delay sensor dan actuator."], ["Power converter", "Loop arus cepat berada di dalam loop tegangan yang lebih lambat."], ["Web tension", "Feedback menjaga tegangan material saat diameter roll berubah."]],
    code: `import numpy as np\nfrom scipy import signal\n\n# L(s)=K/(s(s+2)), unity feedback\nfor K in [1, 4, 10, 20]:\n    den_cl = [1, 2, K]\n    poles = np.roots(den_cl)\n    wn = np.sqrt(K); zeta = 1/wn\n    print(f"K={K:>2}: poles={poles}, wn={wn:.3f}, zeta={zeta:.3f}")\n    sys = signal.TransferFunction([K], den_cl)\n    t, y = signal.step(sys)\n    print(f"    peak={y.max():.3f}, final={y[-1]:.3f}")`,
    refs: ["Åström & Murray — Feedback Systems", "Skogestad & Postlethwaite — Multivariable Feedback Control", "Nise — Control Systems Engineering", "Franklin, Powell & Emami-Naeini — Feedback Control"],
  },
  {
    title: "Analisis dan Perancangan Kontrol PID",
    sub: "Sub-CPMK 4.2 — Memahami aksi P, I, D dan melakukan tuning PID yang aman",
    intro: "PID tetap menjadi controller industri paling luas karena transparan, murah, dan efektif. P memperkuat koreksi saat ini, I menghapus bias masa lalu, dan D mengantisipasi perubahan, tetapi derivative harus difilter dan integral perlu anti-windup.",
    concepts: [["Proporsional", "Meningkatkan respons terhadap error saat ini; gain terlalu tinggi menurunkan robustness.", "u_P = Kp*e"], ["Integral", "Mengakumulasi error sehingga offset tunak hilang, namun dapat memperlambat dan menyebabkan windup.", "u_I=K_i∫e dt"], ["Derivatif", "Merespons laju perubahan untuk menambah redaman; sensitif terhadap noise.", "u_D=K_d de/dt"], ["Tuning", "Ziegler–Nichols, IMC, relay, dan optimization adalah titik awal yang harus divalidasi terhadap batas plant.", "K_p,T_i,T_d" ]],
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
    concepts: [["Forward path", "Lintasan dari input ke output yang tidak melewati node lebih dari sekali.", "P_k=produk branch"], ["Loop", "Lintasan tertutup yang kembali ke node awal tanpa mengulang node lain.", "L_i=produk branch loop"], ["Non-touching loops", "Dua loop tidak bersentuhan jika tidak berbagi node.", "L_i*L_j"], ["Mason", "Delta menggabungkan loop tunggal, pasangan, tripel non-touching secara inklusi–eksklusi.", "T=ΣP_kΔ_k/Δ" ]],
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
    concepts: [["Fuzzifikasi", "Input crisp diubah menjadi derajat keanggotaan 0–1 pada beberapa himpunan linguistik.", "μ_A(x)∈[0,1]"], ["Rule base", "Aturan IF–THEN menghubungkan kondisi error dan delta-error dengan aksi.", "IF e=P AND de=N THEN u=PM"], ["Inferensi", "Operator AND/OR dan implication menggabungkan kekuatan aturan.", "α=min(μ_e,μ_de)"], ["Defuzzifikasi", "Output fuzzy diubah menjadi nilai actuator, misalnya centroid atau weighted average.", "u = (Σ α_i*z_i)/(Σ α_i)" ]],
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
/* ── KETERBACAAN:START — teks isi halaman modul ─────────────────────────────
   Warna bawaan .section-desc dan paragraf kartu memakai var(--muted) #4a6080,
   yang di atas latar #060a10 hanya berkontras 3,09:1 — di bawah ambang WCAG AA
   4,5:1 untuk teks biasa. Dinaikkan ke #a8b8d4 (9,9:1) supaya nyaman dibaca,
   sementara label dan keterangan sekunder tetap redup agar hierarkinya jelas. */
#page-modul .section-desc,
#page-modul .card p,
#page-modul .tbl-wrap td{color:#a8b8d4}
#page-modul .formula-desc{color:#9aabc6}
#page-modul .card h3{color:#eef3fb}
/* ── KETERBACAAN:END ── */

/* ── TEMA-OBE:START — palet halaman modul mengikuti Penilaian-OBE ───────────
   Nilai variabel disalin dari body.obe-theme pada OBE/Penilaian-OBE.htm supaya
   mahasiswa melihat satu bahasa warna di seluruh mata kuliah. Nada ungu, biru,
   dan toska yang sama dipakai untuk permukaan besar; aksen kuning tetap untuk
   angka penting. */
body{
  --bg:#070b16; --bg2:#080f1e; --surface:#080f1e; --border:#243653;
  --cyan:#67e8f9; --teal:#5eead4; --green:#5eead4; --violet:#8b5cf6;
  --amber:#fbbf24; --pink:#ec4899; --text:#eef4ff; --muted:#aebbd0;
  background:#070b16;
}
#page-modul .hero{
  background:
    radial-gradient(circle at 88% 18%,rgba(139,92,246,.13),transparent 33%),
    radial-gradient(circle at 64% 108%,rgba(34,211,238,.09),transparent 36%),
    linear-gradient(145deg,#080f1f,#060a14 68%);
  border-bottom:1px solid rgba(96,165,250,.24);
}
#page-modul .section-title{color:#f4f8ff}
#page-modul .section-label{color:#a78bfa;letter-spacing:2px}
#page-modul .card{
  background:linear-gradient(145deg,rgba(8,15,30,.99),rgba(5,9,18,.99));
  border:1px solid #243653;
  box-shadow:0 14px 38px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025);
}
#page-modul .card:hover{border-color:#38577e;box-shadow:0 18px 46px rgba(0,0,0,.34)}
#page-modul .formula-block{
  background:linear-gradient(135deg,rgba(13,59,74,.30),rgba(37,32,95,.26) 58%,rgba(59,21,92,.24));
  border:1px solid #38577e;
}
#page-modul .formula-label{color:#67e8f9}
#page-modul .tbl-wrap table{border-color:#243653}
#page-modul .tbl-wrap thead th{background:#101a3d;color:#f8fbff;border-bottom:2px solid #22d3ee}
#page-modul .tbl-wrap tbody tr:nth-child(odd) td{background:#070e1c}
#page-modul .tbl-wrap tbody tr:nth-child(even) td{background:#0b1628}
#page-modul .tip-box{background:rgba(94,234,212,.07);border:1px solid rgba(94,234,212,.26)}
#page-modul .info-box{background:rgba(139,92,246,.07);border:1px solid rgba(139,92,246,.26)}
#page-modul .anim-panel,#page-modul .code-wrap{
  background:linear-gradient(145deg,rgba(8,15,30,.99),rgba(5,9,18,.99));
  border:1px solid #243653;
}
#page-modul .anim-header{background:linear-gradient(90deg,#0d3b4a,#25205f 58%,#3b155c);border-bottom:1px solid #38577e}
#page-modul .divider{background:linear-gradient(90deg,transparent,#243653 20%,#38577e 50%,#243653 80%,transparent)}
.subnav-bar{background:rgba(7,11,22,.92);border-bottom:1px solid rgba(139,92,246,.22)}
.subnav-bar a:hover{color:#a78bfa;background:rgba(139,92,246,.08)}
.subnav-geser{background:linear-gradient(90deg,rgba(7,11,22,.97),rgba(7,11,22,.72));color:#a78bfa}
.subnav-geser.kanan{background:linear-gradient(270deg,rgba(7,11,22,.97),rgba(7,11,22,.72))}
/* ── TEMA-OBE:END ── */

/* ── DAFTAR-PERIKSA:START — daftar periksa yang dapat dicentang ────────────── */
#page-modul .sisken-periksa{
  background:linear-gradient(145deg,rgba(8,15,30,.99),rgba(5,9,18,.99));
  border:1px solid #243653;border-radius:14px;padding:20px 22px;margin:16px 0 24px;
  box-shadow:0 14px 38px rgba(0,0,0,.26)}
#page-modul .sisken-periksa-kepala{display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap}
#page-modul .sisken-periksa-judul{font:600 13px 'JetBrains Mono',monospace;color:#a78bfa;letter-spacing:.6px;text-transform:uppercase}
#page-modul .sisken-periksa-hitung{font:700 15px 'JetBrains Mono',monospace;color:#67e8f9}
#page-modul .sisken-periksa-bar{height:6px;border-radius:99px;background:#0b1628;margin:12px 0 16px;overflow:hidden}
#page-modul .sisken-periksa-isi{height:100%;border-radius:99px;width:0;
  background:linear-gradient(90deg,#8b5cf6,#67e8f9 60%,#5eead4);transition:width .35s ease}
#page-modul .sisken-periksa-daftar{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
#page-modul .sisken-periksa-butir{
  display:flex;gap:14px;align-items:flex-start;cursor:pointer;user-select:none;
  padding:13px 16px;border-radius:11px;border:1px solid #243653;background:#070e1c;
  transition:border-color .2s,background .2s,transform .15s}
#page-modul .sisken-periksa-butir:hover{border-color:#38577e;background:#0b1628;transform:translateX(3px)}
#page-modul .sisken-periksa-butir:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}
#page-modul .sisken-periksa-kotak{
  flex:0 0 auto;width:24px;height:24px;border-radius:7px;border:1.5px solid #38577e;
  display:flex;align-items:center;justify-content:center;color:transparent;
  font-size:14px;font-weight:800;transition:all .2s}
#page-modul .sisken-periksa-teks{font-size:15px;line-height:1.65;color:#a8b8d4}
#page-modul .sisken-periksa-butir.dicentang{border-color:rgba(94,234,212,.45);background:rgba(94,234,212,.06)}
#page-modul .sisken-periksa-butir.dicentang .sisken-periksa-kotak{
  background:linear-gradient(135deg,#5eead4,#67e8f9);border-color:#5eead4;color:#04121c}
#page-modul .sisken-periksa-butir.dicentang .sisken-periksa-teks{color:#d7e5f6}
#page-modul .sisken-periksa-pesan{margin-top:14px;font-size:13.5px;color:#aebbd0}
#page-modul .sisken-periksa-pesan.tuntas{color:#5eead4;font-weight:600}
@media (prefers-reduced-motion: reduce){
  #page-modul .sisken-periksa-butir,#page-modul .sisken-periksa-isi{transition:none}
  #page-modul .sisken-periksa-butir:hover{transform:none}
}
/* ── DAFTAR-PERIKSA:END ── */

/* ── LEBAR-LENTUR:START — paragraf mengikuti lebar jendela ──────────────────
   Bawaannya .section dikunci 1100px dan .section-desc dikunci 680px, sehingga
   pada layar lebar teksnya menumpuk di kolom sempit dengan ruang kosong luas
   di kanan-kiri. Kini keduanya melar mengikuti jendela; jarak tepi yang ikut
   melar (clamp) menjaga teks tidak menempel ke sisi layar. */
.section{max-width:none;padding:80px clamp(18px,4.5vw,72px)}
#page-modul .section-desc,
#page-modul .hero-sub,
#page-modul .card p,
#page-modul .tip-box,
#page-modul .info-box,
#page-modul .formula-desc{max-width:none}
#page-modul .cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}
#page-modul .tbl-wrap{max-width:none;overflow-x:auto}
/* Panel rumus di dalam kartu tadinya inline-block sehingga lebarnya mengikuti
   panjang rumus dan tampak tidak sejajar dengan kartunya. Kini selebar kartu,
   rata tengah, dan bergulir sendiri bila rumusnya panjang. */
#page-modul .card{display:flex;flex-direction:column}
#page-modul .card .formula{
  display:block;width:100%;box-sizing:border-box;margin-top:auto;
  text-align:center;overflow-x:auto;overflow-y:hidden}
#page-modul .formula-block{overflow-x:auto}
/* Pada layar sangat sempit, jarak tepi dikecilkan supaya baris tidak terlalu
   pendek dan kata tidak terpenggal berlebihan. */
@media (max-width:560px){
  .section{padding:56px 16px}
}
/* ── LEBAR-LENTUR:END ── */
/* Tombol geser bilah bagian. Bilahnya melebihi lebar layar karena jumlah
   bagiannya banyak, sedangkan batang gulirnya sengaja disembunyikan. */
/* Halaman modul panjangnya sekitar 20.000 piksel dengan sembilan belas bagian.
   Bagian yang belum terlihat dilewati perhitungan tata letaknya supaya guliran
   tetap ringan; tinggi perkiraan diberikan agar batang gulir tidak melompat. */
#page-modul > .section{content-visibility:auto;contain-intrinsic-size:auto 900px;scroll-margin-top:112px}
.subnav-geser{position:fixed;top:60px;z-index:100;height:40px;width:30px;border:0;cursor:pointer;
  background:linear-gradient(90deg,rgba(4,8,16,.97),rgba(4,8,16,.72));color:var(--violet);
  font:700 20px/1 'JetBrains Mono',monospace;display:none;align-items:center;justify-content:center;
  backdrop-filter:blur(16px);transition:color .2s,opacity .2s}
.subnav-geser.kiri{left:0}
.subnav-geser.kanan{right:0;background:linear-gradient(270deg,rgba(4,8,16,.97),rgba(4,8,16,.72))}
.subnav-geser:hover{color:#fff}
.subnav-geser.tampil{display:flex}
.subnav-geser[disabled]{opacity:.25;cursor:default}
.subnav-bar.show ~ .subnav-geser{display:flex}
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
html,body{height:auto!important;min-height:100%!important;overflow-y:auto!important}.visitor-overlay{overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;align-items:flex-start!important;padding:clamp(14px,4vh,42px) 12px;box-sizing:border-box}.visitor-overlay>.visitor-modal{margin:auto;flex:none}
@media(max-width:700px){.sisken-rich{padding-top:28px}.sisken-tabs{margin-top:24px}.sisken-anim-box canvas{height:240px}}
.sisken-prose{max-width:1000px;margin:0 0 34px}
.sisken-prose h3{font:800 21px/1.35 'Playfair Display',serif;color:#e8eefc;margin:26px 0 10px}
.sisken-prose p{font-size:16px;line-height:1.85;color:#9eacc5;margin:0 0 13px}
.sisken-derive{margin:26px 0 34px;padding:22px;border:1px solid #1b2b42;border-radius:14px;background:rgba(0,229,255,.04)}
.sisken-derive ol{margin:16px 0 0;padding:0;list-style:none;counter-reset:drv}
.sisken-derive li{counter-increment:drv;position:relative;padding:0 0 16px 42px;margin-bottom:14px;border-bottom:1px solid rgba(27,43,66,.7)}
.sisken-derive li:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
.sisken-derive li::before{content:counter(drv);position:absolute;left:0;top:0;width:27px;height:27px;border-radius:50%;background:rgba(0,229,255,.14);color:var(--cyan);font:700 12px 'JetBrains Mono',monospace;display:grid;place-items:center}
.sisken-derive .lbl{display:block;font-weight:700;color:#dce6f7;margin-bottom:6px}
.sisken-derive .note{display:block;margin-top:7px;font-size:14px;line-height:1.7;color:#8b9ab4}
.sisken-pitfall{border-left:3px solid #ff6b6b;background:rgba(255,107,107,.06);padding:15px 17px;border-radius:0 11px 11px 0;margin-bottom:12px}
.sisken-pitfall strong{display:block;color:#ffb4b4;margin-bottom:5px;font-size:15px}
.sisken-pitfall span{font-size:15px;line-height:1.75;color:#9eacc5}
.sisken-check{margin:18px 0 0;padding:0;list-style:none}
.sisken-check li{position:relative;padding:0 0 9px 28px;font-size:15px;line-height:1.7;color:#9eacc5}
.sisken-check li::before{content:'✓';position:absolute;left:0;color:var(--cyan);font-weight:700}
@media(prefers-reduced-motion:reduce){.sisken-pane.active{animation:none}}
/* Nomor persamaan (kanan blok, konvensi buku teks) + chip notasi penjelasan.
   Ukuran teks chip mengikuti paragraf (.section-desc = 16px) atas permintaan
   dosen; notasi tampil sebagai pil menyala supaya langsung terbaca. */
.formula-main{position:relative;padding-right:60px;margin:12px 0 10px}
.formula-number{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--cyan);opacity:.85}
.rumus-jelas{margin-top:-6px;font-size:16.5px;line-height:1.65}
.anim-jelas{margin-top:-4px;font-size:16.5px;line-height:1.65}
.anim-var-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.anim-var{--na:0,229,255;--nt:#9ff6ff;display:inline-flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid rgba(var(--na),.22);border-radius:12px;background:linear-gradient(180deg,rgba(var(--na),.07),rgba(var(--na),.02));font-size:16.5px;line-height:1.55;color:var(--text);max-width:100%;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,opacity .18s ease}
/* Lima varian warna bersiklus, mengikuti palet penyorot kode Python halaman
   ini (kw violet, fn sky, st hijau, nm oranye) plus cyan situs — atas
   permintaan dosen agar panel notasi berwarna-warni seperti kode. */
.anim-var.nw1{--na:168,85,247;--nt:#dcbcff}
.anim-var.nw2{--na:0,224,158;--nt:#8dffd8}
.anim-var.nw3{--na:249,115,22;--nt:#ffc59b}
.anim-var.nw4{--na:14,165,233;--nt:#a5dcff}
.rumus-notasi,.anim-var code{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--nt);background:rgba(var(--na),.14);border:1px solid rgba(var(--na),.38);border-radius:8px;padding:3px 10px;white-space:nowrap;flex-shrink:0}
/* Interaksi sorotan: chip yang disentuh terangkat & menyala, saudaranya
   meredup — membantu mata mengunci satu notasi di antara banyak chip. */
@media(hover:hover){
  .anim-var-list:hover .anim-var:not(:hover){opacity:.4}
  .anim-var:hover{transform:translateY(-2px);border-color:rgba(var(--na),.7);box-shadow:0 6px 18px rgba(var(--na),.18)}
  .anim-var:hover .rumus-notasi,.anim-var:hover code{background:rgba(var(--na),.28);color:#f2fdff;border-color:rgba(var(--na),.75)}
}
.anim-var:active{transform:scale(.985)}
@media(prefers-reduced-motion:reduce){.anim-var{transition:none}.anim-var:hover{transform:none}}
/* SISKENCERDAS-RICH-CONTENT:END */`;

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function cards(items, className = "") {
  return `<div class="sisken-grid ${className}">${items.map(([h, p, f]) => `<article class="sisken-card"><h3>${h}</h3><p>${p}</p>${f ? `<div class="sisken-formula">${f}</div>` : ""}</article>`).join("")}</div>`;
}

// Materi mendalam bersifat opsional: modul yang belum punya entri di
// sisken-materi.mjs tetap dirender dengan kartu konsep dan alur seperti semula.
function materiMendalam(n) {
  const d = MATERI[n];
  if (!d) return "";
  const bagian = (d.deep || []).map((s) => `<section class="sisken-prose"><h3>${s.head}</h3>${s.body.map((p) => `<p>${p}</p>`).join("")}${s.formula ? `<div class="sisken-formula">${esc(s.formula)}</div>` : ""}</section>`).join("");

  const turunan = d.derivation
    ? `<h2 class="sisken-section-head" style="margin-top:34px">${d.derivation.head}</h2>`
      + `<p class="sisken-lead" style="font-size:16px">${d.derivation.intro}</p>`
      + `<div class="sisken-derive"><ol>${d.derivation.steps.map(([lbl, ex, note]) => `<li><span class="lbl">${lbl}</span><div class="sisken-formula" style="margin-top:0">${esc(ex)}</div><span class="note">${note}</span></li>`).join("")}</ol></div>`
      + `<p class="sisken-lead" style="font-size:16px">${d.derivation.closing}</p>`
    : "";

  const contoh = d.worked
    ? `<h2 class="sisken-section-head" style="margin-top:34px">${d.worked.head}</h2>`
      + `<div class="sisken-code-note">Diketahui: ${d.worked.given.join(" · ")}</div>`
      + `<div class="sisken-derive"><ol>${d.worked.steps.map(([lbl, ex, note]) => `<li><span class="lbl">${lbl}</span><div class="sisken-formula" style="margin-top:0">${esc(ex)}</div><span class="note">${note}</span></li>`).join("")}</ol></div>`
      + `<p class="sisken-lead" style="font-size:16px"><strong style="color:#dce6f7">Jawaban.</strong> ${d.worked.answer}</p>`
    : "";

  const jebakan = d.pitfalls
    ? `<h2 class="sisken-section-head" style="margin-top:34px">Salah Kaprah yang Sering Terjadi</h2>`
      + d.pitfalls.map(([h, p]) => `<div class="sisken-pitfall"><strong>${h}</strong><span>${p}</span></div>`).join("")
    : "";

  const periksa = d.checklist
    ? `<h2 class="sisken-section-head" style="margin-top:34px">Daftar Periksa Sebelum Lanjut</h2>`
      + `<ul class="sisken-check">${d.checklist.map((c) => `<li>${c}</li>`).join("")}</ul>`
    : "";

  return bagian + turunan + contoh + jebakan + periksa;
}

// Hash yang sama seperti dipakai halaman Modul 1, supaya jawaban jajak
// pendapat tidak terbaca langsung dari sumber halaman. Ini bukan pengamanan
// sungguhan — hanya menghalangi pembacaan sepintas. Penilaian yang berbobot
// nilai tetap dijalankan server lewat checkModulAnswer.
function ahash(s) {
  let h = 5381;
  s += "mEKsP9k4tQ2";
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) & 0xffffffff;
  return (h >>> 0).toString(36);
}

function forumPage(n) {
  const d = FORUM[n];
  if (!d) return null;
  // Sama seperti hero: nomor pertemuan Sisken = nomor modul.
  const pert = n;

  const chip = d.chip.map((c) => `<div style="background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15);border-radius:10px;padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--cyan)">${esc(c)}</div>`).join("");

  const jajak = d.jajak.map((p, i) => {
    const k = i + 1;
    const opts = p.opts.map((o, j) => `<div class="p-opt" onclick="voteForum(${k},this,${j})"><div class="p-circle"></div>${esc(o)}</div>`).join("");
    // Bentuknya mengikuti Modul 1: blok .poll yang menempel pada kartu diskusi.
    return `<div class="poll">
      <div class="poll-q">QUICK CHECK — ${esc(p.q)}</div>
      <div class="poll-opts" id="fp${k}">${opts}</div>
      <div class="p-fb r" id="fp${k}r">✅ ${esc(p.benar)}</div>
      <div class="p-fb w" id="fp${k}w">❌ ${esc(p.salah)}</div>
    </div>`;
  });

  const diskusi = d.diskusi.map((q, i) => {
    const k = i + 1;
    // Kartu diskusi mengikuti Modul 1: kepala yang dapat dilipat (nomor, judul,
    // panah) dan badan yang berisi petunjuk beserta kolom jawaban. Halaman
    // forum jadi jauh lebih pendek sehingga gulirannya ringan.
    const rona = ["14,165,233", "249,115,22", "168,85,247"][i % 3];
    const warna = ["var(--cyan)", "var(--amber)", "var(--violet)"][i % 3];
    return `<div class="fq-card reveal" id="fq${k}">
<div class="fq-head" onclick="toggleFQ('fq${k}')">
  <div class="fq-num" style="background:rgba(${rona},.1);border:1px solid rgba(${rona},.2);color:${warna}">${String(k).padStart(2, "0")}</div>
  <h3>${esc(q.q)}</h3>
  <span class="fq-arrow">›</span>
</div>
<div class="fq-body">
  <div class="fq-inner">
    <p style="color:var(--muted);font-size:14px;margin-bottom:14px">${esc(q.petunjuk)}</p>
    ${jajak[i] || ""}
    <textarea class="fq-textarea" id="ans-fq${k}" placeholder="Tulis jawaban diskusi Anda di sini (minimal 30 kata)…" oninput="checkForumReady()"></textarea>
    <div id="wc-fq${k}" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:6px;text-align:right">0 / min 30 kata</div>
  </div>
</div>
</div>`;
  }).join("");

  const pa = d.jajak.map((p, i) => `${i + 1}:'${ahash(`${i + 1}_${p.jawab}`)}'`).join(",");
  const judulEsc = d.diskusi.map((q) => q.q.replaceAll("'", "\\'"));

  const markup = `${heroForum}<div class="hero-content">
<div class="hero-eyebrow"><div class="pulse-dot"></div>${esc(d.eyebrow)}</div>
<h1 class="hero-title" style="font-size:clamp(34px,5vw,56px)">${esc(d.judul)}</h1>
<p class="hero-sub">${esc(d.ringkas)}</p>
</div>
</div>
<div class="section">
<h2 class="section-title reveal">${esc(d.judul)}</h2>
<div class="forum-scenario reveal">
<div class="scenario-label">📋 KASUS INDUSTRI</div>
${d.narasi.map((p) => `<p style="margin-top:12px">${p}</p>`).join("")}
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px">${chip}</div>
</div>
<div class="section-label reveal" style="margin-top:34px">Pertanyaan Diskusi</div>
<h2 class="section-title reveal" style="margin-bottom:28px">Diskusikan<br>Tiga Hal Ini</h2>
${diskusi}
${panelForum.replaceAll("__PERTEMUAN__", String(pert))}
`;

  // Runtime ditulis sebagai <script> klasik supaya terjangkau atribut onclick
  // dan dapat memanggil getIdentityLocal() yang juga berada di skrip klasik.
  // Runtime forum memakai skrip Modul 1 apa adanya supaya perilakunya sama
  // persis: penghitung kata per jawaban, status jajak, bilah kemajuan, dan
  // penyusun HTML yang ditempel ke Forum FAST Learning. Yang khusus per modul
  // hanya kunci jajak, nomor pertemuan, judul, serta teks pertanyaannya.
  const isiBangun = bangunForum
    .replaceAll("__PERTEMUAN__", String(pert))
    .replaceAll("__JUDUL__", esc(d.judul))
    .replace("__Q1__", esc(d.diskusi[0].q)).replace("__Q2__", esc(d.diskusi[1].q)).replace("__Q3__", esc(d.diskusi[2].q))
    .replace("__H1__", esc(d.diskusi[0].petunjuk)).replace("__H2__", esc(d.diskusi[1].petunjuk)).replace("__H3__", esc(d.diskusi[2].petunjuk));

  const runtime = `<script id="sisken-forum-runtime">
function _ah(s){var h=5381;s=s+'mEKsP9k4tQ2';for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))&0xffffffff;return(h>>>0).toString(36);}
window._ah = _ah;
window._forumPollAnswerHashes = {${pa}};
${skripForum}
${isiBangun}
document.addEventListener('DOMContentLoaded', function(){ if (typeof checkForumReady === 'function') checkForumReady(); });
</script>`;

  // Halaman Forum Modul 1 ditutup footer yang sama seperti halaman lainnya.
  const footerForum = `<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Forum ${n} — ${d.judul} · Sistem Kendali Cerdas · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>`;
  return markup + footerForum + runtime;
}

// ── Cetakan desain diambil apa adanya dari Modul 1 ───────────────────────────
// Modul 1 ditulis tangan dan menjadi acuan tampilan seluruh modul. Kosakata
// desainnya — hero, hr.divider, div.section (section-label, section-title,
// section-desc), formula-block, cards, tip-box, info-box, anim-panel, code-wrap
// — seluruhnya sudah bergaya lewat blok <head> yang dimiliki semua modul, jadi
// yang perlu disalin hanya cangkang hero-nya (SVG gelombang, skema, rumus).
const heroShell = fs.readFileSync(path.join(import.meta.dirname, "sisken-hero-shell.html"), "utf8");
const hitungMundur = fs.readFileSync(path.join(import.meta.dirname, "sisken-countdown.html"), "utf8");
const heroForum = fs.readFileSync(path.join(import.meta.dirname, "sisken-hero-forum.html"), "utf8");
const panelForum = fs.readFileSync(path.join(import.meta.dirname, "sisken-forum-panel.html"), "utf8");
const skripForum = fs.readFileSync(path.join(import.meta.dirname, "sisken-forum-script.js"), "utf8");
const bangunForum = fs.readFileSync(path.join(import.meta.dirname, "sisken-forum-build.js"), "utf8");

const IKON = ["🎯", "⚙️", "🔁", "📐", "🧭", "🧪", "📊", "🛠️", "🧠", "⚡", "🔍", "📌"];

// Dua cell tambahan yang berlaku untuk seluruh modul: menyapu parameter lalu
// membaca indikator kinerja dari data respons. Keduanya dipakai berulang di
// tugas komputasi, jadi sengaja ditulis sekali dan dipakai di semua modul.
const KODE_SAPUAN = `import numpy as np
import matplotlib.pyplot as plt

# Plant orde satu G(s)=K/(tau*s+1) dengan controller proporsional Kp.
K, tau = 2.0, 3.0
Kp_uji = np.linspace(0.5, 25, 200)

L = Kp_uji * K                 # gain loop
e_ss = 1.0 / (1.0 + L)         # error tunak terhadap step satuan
tau_cl = tau / (1.0 + L)       # konstanta waktu lingkar tertutup
t_s = 4.0 * tau_cl             # waktu menetap pita dua persen

batas_error, batas_ts = 0.05, 2.0
layak = (e_ss <= batas_error) & (t_s <= batas_ts)
print(f"Kp terkecil yang memenuhi kedua batas: {Kp_uji[layak][0]:.2f}")

fig, ax = plt.subplots(1, 2, figsize=(11, 4))
ax[0].plot(Kp_uji, e_ss); ax[0].axhline(batas_error, ls='--', color='r')
ax[0].set_xlabel('Kp'); ax[0].set_ylabel('error tunak'); ax[0].grid(alpha=.3)
ax[1].plot(Kp_uji, t_s); ax[1].axhline(batas_ts, ls='--', color='r')
ax[1].set_xlabel('Kp'); ax[1].set_ylabel('waktu menetap (s)'); ax[1].grid(alpha=.3)
plt.tight_layout(); plt.show()`;

const KODE_INDIKATOR = `import numpy as np

def indikator(t, y, setpoint=1.0, pita=0.02):
    """Baca overshoot, waktu naik, waktu menetap, dan error tunak dari data."""
    y = np.asarray(y, dtype=float)
    akhir = y[-1]
    overshoot = max(0.0, (y.max() - setpoint) / setpoint * 100.0)

    i10 = np.argmax(y >= 0.1 * setpoint)
    i90 = np.argmax(y >= 0.9 * setpoint)
    t_naik = t[i90] - t[i10]

    di_luar = np.abs(y - setpoint) > pita * setpoint
    t_menetap = t[len(y) - 1 - np.argmax(di_luar[::-1])] if di_luar.any() else 0.0

    return {
        'overshoot_persen': overshoot,
        'waktu_naik_s': t_naik,
        'waktu_menetap_s': t_menetap,
        'error_tunak': setpoint - akhir,
    }

# Contoh pemakaian pada respons orde dua.
zeta, wn = 0.5, 2.0
t = np.linspace(0, 10, 1200)
wd = wn * np.sqrt(1 - zeta ** 2)
y = 1 - np.exp(-zeta * wn * t) * (np.cos(wd * t) + (zeta / np.sqrt(1 - zeta ** 2)) * np.sin(wd * t))
for nama, nilai in indikator(t, y).items():
    print(f"{nama:>18}: {nilai:.4f}")`;

// Setiap bagian diberi id supaya bilah tautan di bawah nav (subnav-bar) bisa
// meloncat ke sana. Judul pendeknya dikumpulkan untuk membangun bilah itu.
const daftarBagian = [];

function bagian(nomor, judul, isi) {
  const id = `m-${nomor}`;
  daftarBagian.push([id, judulPendek(judul)]);
  return `<hr class="divider">
<div class="section" id="${id}">
  <div class="section-label reveal">Bagian ${String(nomor).padStart(2, "0")}</div>
  <h2 class="section-title reveal">${judul}</h2>
${isi}
</div>`;
}

function judulPendek(judul) {
  const bersih = String(judul).replace(/<[^>]+>/g, "").replace(/[:—–].*$/, "").trim();
  const kata = bersih.split(/\s+/);
  return kata.length <= 3 ? bersih : kata.slice(0, 3).join(" ");
}

function paragraf(teks) {
  return teks.map((t) => `  <p class="section-desc reveal">${t}</p>`).join("\n");
}

// Nama multi-huruf pada kamus menjadi "nama dikenal" pengekstrak token,
// supaya RMSE tidak terpecah menjadi R, M, S, E.
const NAMA_DIKENAL = new Set(Object.keys(NOTASI_KAMUS)
  .filter((k) => k.length > 1 && !k.startsWith("\\") && !k.includes("_")));

// Legenda arti notasi untuk sekumpulan rumus kartu/tabel: token diekstrak
// dengan pengekstrak yang sama, artinya diambil dari NOTASI_KAMUS. Token tanpa
// arti menghentikan generator — notasi tidak boleh tayang tanpa penjelasan.
function legendaNotasi(daftarRumus) {
  const urutan = [];
  const sudah = new Set();
  for (const f of daftarRumus) {
    if (!f) continue;
    for (const tk of tokenNotasi(f, NAMA_DIKENAL)) {
      if (!sudah.has(tk)) { sudah.add(tk); urutan.push([tk, f]); }
    }
  }
  if (!urutan.length) return "";
  const chips = urutan.map(([tk, asal], iw) => {
    const arti = NOTASI_KAMUS[tk];
    if (!arti) throw new Error(`Notasi tanpa arti di NOTASI_KAMUS: "${tk}" (dari rumus: ${asal.slice(0, 60)})`);
    // Perintah yang WAJIB berargumen tidak boleh tampil telanjang — KaTeX
    // menolaknya dan menampilkan teks mentah merah (\sqrt, \mathcal).
    const TAMPIL = { "ᵀ": "{}^{T}", "\\mathcal": "\\mathcal{L}", "\\sqrt": "\\sqrt{x}", "\\frac": "\\frac{a}{b}" };
    const latexTok = TAMPIL[tk] || tk;
    return `<span class="anim-var nw${iw % 5}"><span class="rumus-notasi">\\(${latexTok}\\)</span><span>${esc(arti)}</span></span>`;
  }).join("");
  return `\n  <div class="tip-box reveal rumus-jelas"><strong>🔤 Arti notasi:</strong>
    <div class="anim-var-list" aria-label="Arti tiap notasi">${chips}</div>
  </div>`;
}

// Nomor persamaan berjalan per halaman; di-reset di awal richModule. Hanya
// blok yang benar-benar matematis (keluaran rumusLatex memuat KaTeX) yang
// dinomori — blok prosa panduan bukan persamaan.
let nomorPersamaan = 0;

// {{token}} pada teks penjelasan dirender lewat tokenLatex yang SAMA dengan
// persamaannya, sehingga notasi di penjelasan identik dengan di persamaan.
function siapkanTeksRumus(teks) {
  return String(teks).replace(/\{\{([^}]+)\}\}/g, (_, t) => `\\(${tokenLatex(t.trim())}\\)`);
}

// Persamaan panjang tidak boleh patah di sembarang titik saat lebar layar
// terbatas. Lanjutan dipenggal di pemisah alami: segmen "|" dahulu, lalu
// SATU koma terdekat titik tengah (di luar KaTeX dan tag) agar dua barisnya
// seimbang. Baris tanpa pemisah alami dibiarkan melipat sendiri.
const AMBANG_PECAH = 64;
function panjangPolos(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\\[a-zA-Z]+/g, "x")
    .replace(/[{}]/g, "")
    .replace(/\\[()]/g, "").length;
}
function pecahDiKomaTengah(baris) {
  const posisi = [];
  let math = false;
  let tag = false;
  for (let i = 0; i < baris.length; i += 1) {
    const dua = baris.slice(i, i + 2);
    if (!tag && dua === "\\(") math = true;
    if (!tag && dua === "\\)") math = false;
    if (baris[i] === "<") tag = true;
    if (baris[i] === ">") tag = false;
    if (!math && !tag && dua === ", ") posisi.push(i);
  }
  if (!posisi.length) return baris;
  const tengah = baris.length / 2;
  const pilih = posisi.reduce((a, b) => (Math.abs(b - tengah) < Math.abs(a - tengah) ? b : a));
  return `${baris.slice(0, pilih + 1)}<br>${baris.slice(pilih + 2)}`;
}
function pecahBaris(html) {
  if (panjangPolos(html) <= AMBANG_PECAH) return html;
  const PIPA = / ?<span style="color:var\(--muted\)">&nbsp;\|&nbsp;<\/span> ?/g;
  return html
    .split(PIPA)
    .map((b) => (panjangPolos(b) > AMBANG_PECAH ? pecahDiKomaTengah(b) : b))
    .join("<br>");
}

function blokRumus(label, rumus, keterangan = "") {
  const isi = pecahBaris(rumusLatex(rumus));
  const matematis = isi.includes("\\(");
  // Label kosong tidak dirender — label pengisi "Inti bagian ini" dibuang
  // atas permintaan dosen; persamaannya berbicara sendiri lewat nomor dan
  // kotak penjelasannya.
  const barisLabel = label ? `\n    <div class="formula-label">${esc(label)}</div>` : "";
  if (!matematis) {
    return `  <div class="formula-block reveal">${barisLabel}
    <div class="formula-main">${isi}</div>${keterangan ? `\n    <div class="formula-desc">${keterangan}</div>` : ""}
  </div>`;
  }
  nomorPersamaan += 1;
  const nomor = nomorPersamaan;
  // Setiap persamaan bernomor WAJIB punya penjelasan rinci + arti tiap
  // notasi. Tanpa entri, generator berhenti — persamaan tidak boleh tayang
  // tanpa penjelasan.
  const j = PENJELASAN_RUMUS[rumus];
  if (!j || !j.apa || !j.variabel?.length) {
    throw new Error(`Persamaan tanpa penjelasan di sisken-rumus-jelas.mjs:\n  "${rumus}"`);
  }
  const chips = j.variabel.map(([token, arti], iw) =>
    `<span class="anim-var nw${iw % 5}"><span class="rumus-notasi">\\(${tokenLatex(token)}\\)</span><span>${siapkanTeksRumus(esc(arti))}</span></span>`).join("");
  return `  <div class="formula-block reveal">${barisLabel}
    <div class="formula-main">${isi}<span class="formula-number">(${nomor})</span></div>${keterangan ? `\n    <div class="formula-desc">${keterangan}</div>` : ""}
  </div>
  <div class="tip-box reveal rumus-jelas">
    <strong>📐 Persamaan (${nomor})</strong> — ${siapkanTeksRumus(esc(j.apa))}
    <div class="anim-var-list" aria-label="Arti tiap notasi">${chips}</div>
  </div>`;
}

// Kartu pustaka mengikuti Modul 1: nomor rujukan berwarna bergantian, kutipan
// lengkap, lalu satu baris keterangan bab dan alasan relevansinya.
const WARNA_PUSTAKA = [
  ["14,165,233", "var(--cyan)"],
  ["249,115,22", "var(--amber)"],
  ["168,85,247", "var(--violet)"],
  ["0,224,158", "var(--green)"],
  ["236,72,153", "var(--pink)"],
];

function daftarPustaka(n, m) {
  const d = PUSTAKA[n];
  if (!d) {
    // Modul tanpa data pustaka rinci tetap menampilkan judul ringkasnya.
    return m.refs.map((r) => `  <div class="info-box reveal">📚 ${r}</div>`).join("\n");
  }
  const kartu = d.ref.map(([kutipan, catatan], i) => {
    const [rgb, warna] = WARNA_PUSTAKA[i % WARNA_PUSTAKA.length];
    return `    <div class="reference-card" style="display:flex;gap:16px;padding:18px 22px;background:rgba(${rgb},.05);border:1px solid rgba(${rgb},.15);border-left:3px solid ${warna};border-radius:10px;align-items:flex-start">
      <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:${warna};flex-shrink:0;min-width:32px">[${i + 1}]</span>
      <div style="font-size:14px;line-height:1.7">
        ${kutipan}
        <br><span style="color:var(--muted);font-size:13px">${catatan}</span>
      </div>
    </div>`;
  }).join("\n");

  return `  <p class="section-desc reveal">${d.intro}</p>
  <div class="reveal" style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
${kartu}
  </div>
  <div class="info-box reveal" style="margin-top:22px">
    <strong>🔗 Sumber Daring Pendukung:</strong> ${d.daring}
  </div>`;
}

// ── Rumus: ASCII menjadi LaTeX ───────────────────────────────────────────────
// Kolom rumus pada data materi ditulis apa adanya (mis. "T(s) = wn^2/(s^2 + ...)").
// Modul 1 menampilkannya sebagai matematika tersusun lewat KaTeX, jadi ruas yang
// memang persamaan diubah ke LaTeX dan dibungkus \( \). Ruas yang sebenarnya
// kalimat biasa dibiarkan sebagai teks supaya tidak berubah menjadi rumus palsu.
function tabel(judul, kepala, baris) {
  return `  <div class="tbl-wrap reveal">
    <table>
      <caption class="table-caption"><span class="anim-dot" aria-hidden="true"></span><span class="anim-title">${judul}</span></caption>
      <thead><tr>${kepala.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${baris.map((b) => `<tr>${b.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>`;
}

function panelAnimasi(idKanvas, judul, kendali) {
  return `  <div class="anim-panel reveal">
    <div class="anim-header">
      <div class="anim-dot" style="background:var(--cyan)"></div>
      <span class="anim-title">${judul}</span>
    </div>
    <div class="anim-body">
      <canvas id="${idKanvas}" width="1000" height="400" aria-label="${judul}"></canvas>
      <div class="ctrl-row">${kendali}</div>
    </div>
  </div>`;
}

// Penyorotan sintaks Python memakai kelas yang sama seperti Modul 1:
// kw (kata kunci), cm (komentar), st (teks), nm (angka), fn (nama fungsi).
const KATA_KUNCI = ["import", "from", "as", "def", "return", "for", "in", "while", "if",
  "elif", "else", "and", "or", "not", "None", "True", "False", "lambda", "with", "try",
  "except", "finally", "class", "print", "break", "continue", "pass", "global", "is"];

function sorotPython(kode) {
  const simpan = [];
  // Penanda memakai huruf besar di antara dua karakter kendali. Sengaja tanpa
  // angka: penanda milik komentar dan teks akan ikut tersorot sebagai bilangan
  // pada langkah berikutnya kalau memuat angka, sehingga pemulihannya gagal.
  const titip = (html) => {
    let sisa = simpan.push(html);
    let huruf = "";
    while (sisa > 0) { huruf = String.fromCharCode(65 + ((sisa - 1) % 26)) + huruf; sisa = Math.floor((sisa - 1) / 26); }
    return "\u0001" + huruf + "\u0002";
  };

  let out = esc(kode);
  // Urutannya penting: komentar dan teks diamankan lebih dulu supaya isinya
  // tidak ikut disorot sebagai kata kunci, angka, atau nama fungsi.
  out = out.replace(/#[^\n]*/g, (m) => titip('<span class="cm">' + m + "</span>"));
  out = out.replace(/(['"])(?:(?!\1)[^\n])*\1/g, (m) => titip('<span class="st">' + m + "</span>"));
  out = out.replace(/\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?\b/g, (m) => titip('<span class="nm">' + m + "</span>"));
  out = out.replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, (m) => (KATA_KUNCI.includes(m) ? m : titip('<span class="fn">' + m + "</span>")));
  out = out.replace(new RegExp("\\b(" + KATA_KUNCI.join("|") + ")\\b", "g"), (m) => titip('<span class="kw">' + m + "</span>"));

  return out.replace(/\u0001([A-Z]+)\u0002/g, (_, huruf) => {
    let idx = 0;
    for (const c of huruf) idx = idx * 26 + (c.charCodeAt(0) - 64);
    return simpan[idx - 1];
  });
}

function panelKode(label, kode) {
  return `  <div class="code-wrap reveal">
    <div class="code-header">
      <div class="code-dots"><span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span></div>
      <span class="code-label">${label}</span>
      <span class="code-lang">Python</span>
      <button class="code-copy" onclick="cpC(this)">📋 Copy</button>
    </div>
    <pre>${sorotPython(kode)}</pre>
  </div>`;
}

function kartu(items) {
  return `  <div class="cards reveal">${items.map(([h, p, f], i) => `
    <div class="card">
      <div class="card-icon">${IKON[i % IKON.length]}</div>
      <h3>${h}</h3>
      <p>${p}</p>${f ? `\n      <div class="formula">${rumusLatex(f)}</div>` : ""}
    </div>`).join("")}
  </div>`;
}

// Materi mendalam dipetakan ke kosakata Modul 1: tiap bagian menjadi satu
// div.section, rumus ringkasnya menjadi formula-block.
// Sembilan bagian pendalaman dahulu berdiri sendiri-sendiri sehingga satu
// halaman memuat dua puluh bagian. Kini dikelompokkan bertiga menurut
// urutannya — fondasi, penerapan, lalu pendalaman — dengan judul aslinya
// tetap tampil sebagai sub-judul di dalam kelompok.
const KELOMPOK_MATERI = [
  ["Fondasi: Konsep yang Menopang Sisanya", 0, 3],
  ["Penerapan: Dari Konsep ke Perhitungan", 3, 6],
  ["Pendalaman: Hal yang Menentukan di Lapangan", 6, 9],
];

// Daftar periksa dibuat dapat dicentang. Kemajuannya tersimpan di peramban
// masing-masing mahasiswa, jadi tanda centang tidak hilang ketika halaman
// dimuat ulang. Ini catatan pribadi, bukan penilaian — tidak dikirim ke server.
function daftarPeriksa(n, butir) {
  const baris = butir.map((c, i) => `    <li class="sisken-periksa-butir" data-butir="${i}" onclick="siskenCentang(${n},${i})" tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();siskenCentang(${n},${i});}"
        role="checkbox" aria-checked="false">
      <span class="sisken-periksa-kotak" aria-hidden="true">✓</span>
      <span class="sisken-periksa-teks">${c}</span>
    </li>`).join("\n");
  return `  <div class="sisken-periksa reveal" id="periksa-${n}">
    <div class="sisken-periksa-kepala">
      <span class="sisken-periksa-judul">Centang setiap butir yang sudah Anda kuasai</span>
      <span class="sisken-periksa-hitung" id="periksa-hitung-${n}">0 / ${butir.length}</span>
    </div>
    <div class="sisken-periksa-bar"><div class="sisken-periksa-isi" id="periksa-bar-${n}" style="width:0%"></div></div>
    <ul class="sisken-periksa-daftar">
${baris}
    </ul>
    <div class="sisken-periksa-pesan" id="periksa-pesan-${n}">Belum ada yang dicentang. Mulailah dari butir pertama.</div>
  </div>`;
}

function subBagian(judul, isi) {
  return `  <h3 class="reveal" style="font-size:23px;color:#e7eefc;margin:34px 0 14px;font-family:'Playfair Display',serif">${judul}</h3>\n${isi}`;
}

function bagianMateri(n, mulai) {
  const d = MATERI[n];
  if (!d) return { html: "", berikut: mulai };
  let nomor = mulai;
  const dalam = d.deep || [];
  const potongan = KELOMPOK_MATERI.map(([judul, awal, akhir]) => {
    const isi = dalam.slice(awal, akhir).map((s) => subBagian(
      s.head,
      paragraf(s.body) + (s.formula ? `\n${blokRumus("", s.formula)}` : ""),
    )).join("\n");
    return isi ? bagian(nomor++, judul, isi) : "";
  }).filter(Boolean);

  // Penurunan rumus dan contoh terselesaikan digabung: keduanya perhitungan
  // yang dibaca berurutan.
  if (d.derivation || d.worked) {
    let isi = "";
    if (d.derivation) {
      const langkah = d.derivation.steps.map(([lbl, ex, note]) => [lbl, note, ex]);
      isi += subBagian(d.derivation.head,
        paragraf([d.derivation.intro]) + "\n" + kartu(langkah)
        + legendaNotasi(d.derivation.steps.map((x) => x[1])) + "\n" + paragraf([d.derivation.closing]));
    }
    if (d.worked) {
      const langkah = d.worked.steps.map(([lbl, ex, note]) => [lbl, note, ex]);
      isi += "\n" + subBagian(d.worked.head,
        `  <div class="info-box reveal"><strong>Diketahui:</strong> ${d.worked.given.join(" &nbsp;·&nbsp; ")}</div>\n`
        + kartu(langkah) + legendaNotasi(d.worked.steps.map((x) => x[1]))
        + `\n  <div class="tip-box reveal">✅ <strong>Jawaban.</strong> ${d.worked.answer}</div>`);
    }
    potongan.push(bagian(nomor++, "Penurunan Rumus dan Contoh Terselesaikan", isi));
  }

  // Salah kaprah dan daftar periksa digabung: keduanya alat memeriksa diri
  // sebelum melanjutkan.
  if ((d.pitfalls && d.pitfalls.length) || (d.checklist && d.checklist.length)) {
    let isi = "";
    if (d.pitfalls && d.pitfalls.length) {
      isi += subBagian("Salah Kaprah yang Sering Terjadi", kartu(d.pitfalls.map(([h, p]) => [h, p])));
    }
    if (d.checklist && d.checklist.length) {
      isi += "\n" + subBagian("Daftar Periksa Sebelum Lanjut", daftarPeriksa(n, d.checklist));
    }
    potongan.push(bagian(nomor++, "Periksa Diri Sebelum Lanjut", isi));
  }
  return { html: potongan.join("\n"), berikut: nomor };
}

function richModule(m, index) {
  const n = index + 1;
  // Nomor pertemuan Sisken = nomor modul. Modul 7 dan UTS digabung pada
  // Pertemuan 7 dan jadwalnya tiga pertemuan per minggu, sehingga totalnya 15
  // pertemuan dan TIDAK ada pergeseran +1 setelah UTS. Ini yang tampil ke
  // mahasiswa dan harus cocok dengan label di Moodle. Path Firebase tetap
  // memakai rumus lamanya (pertemuan-N+1) lewat MODULE_ID — jangan disamakan.
  const p = n;
  daftarBagian.length = 0;
  nomorPersamaan = 0;
  const kata = m.title.split(" ");
  const judulHero = kata.length >= 3
    ? `<span class="hl-cyan">${kata.slice(0, Math.ceil(kata.length / 3)).join(" ")}</span><br>\n      <em>${kata.slice(Math.ceil(kata.length / 3), -1).join(" ")}</em><br>\n      <span class="hl-amber">${kata[kata.length - 1]}</span>`
    : `<span class="hl-cyan">${m.title}</span>`;

  // Angka pada hero DIHITUNG dari isi yang benar-benar dihasilkan, bukan dari
  // rumus terpisah. Versi lama memakai `MATERI[n].deep.length + 4` yang menjadi
  // basi begitu bagian-bagian materi digabung (9 + 4 = 13 padahal yang terbit
  // 11 bagian), dan mematok "1 Animasi"/"1 Cell Python" padahal ada 3 dan 3.
  // Karena hero dirakit setelah seluruh bagian dibuat, angkanya tidak dapat
  // menyimpang lagi.
  const buatHero = (bagianTerbit, isiSeluruhBagian) => {
    // Hitung judul yang TAMPIL saja. Tiap panel menulis labelnya dua kali —
    // sekali di .anim-title dan sekali di aria-label kanvas — sehingga pola
    // polos "Animasi N —" menghasilkan angka dua kali lipat.
    const jumlahAnimasi = (isiSeluruhBagian.match(/class="anim-title">Animasi \d+ —/g) || []).length;
    const jumlahPython = (isiSeluruhBagian.match(/class="code-wrap/g) || []).length;
    return `${heroShell}<div class="hero-content">
    <div class="hero-eyebrow"><div class="pulse-dot"></div>Pertemuan ${p} &nbsp;·&nbsp; Sistem Kendali Cerdas &nbsp;·&nbsp; 2025/2026</div>
    <h1 class="hero-title">
      ${judulHero}
    </h1>
    <p class="hero-sub">${m.intro}</p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">${bagianTerbit}</div><div class="stat-lbl">Bagian Materi</div></div>
      <div class="stat"><div class="stat-num">${jumlahAnimasi}</div><div class="stat-lbl">Animasi</div></div>
      <div class="stat"><div class="stat-num">${jumlahPython}</div><div class="stat-lbl">Cell Python</div></div>
      <div class="stat"><div class="stat-num">50</div><div class="stat-lbl">Poin Tugas</div></div>
    </div>
  </div>
</div>`;
  };

  let nomor = 1;
  // Peta kemajuan dipasang paling depan supaya mahasiswa tahu posisinya dan
  // berapa modul lagi yang tersisa sebelum mulai membaca.
  // Peta kemajuan dan hitung mundur berada pada satu bagian yang sama, seperti
  // pada Modul 1: mahasiswa langsung tahu posisinya dan sisa waktunya.
  const peta = bagian(nomor++, "Posisi Anda dan Sisa Waktu",
    paragraf([`Modul ${n} adalah satu dari empat belas modul. Setiap modul menambah satu lapis pada kerangka yang sama, jadi bagian yang terasa sulit di modul lanjut hampir selalu berakar pada modul sebelumnya.`])
    + `\n  <div class="anim-panel reveal">
    <div class="anim-header">
      <div class="anim-dot" style="background:var(--violet)"></div>
      <span class="anim-title">Peta Kemajuan — Modul ${n} dari 14</span>
    </div>
    <div class="anim-body"><canvas id="siskenPetaCanvas${n}" width="1000" height="210" aria-label="Peta kemajuan modul"></canvas></div>
  </div>\n`
    + hitungMundur.replaceAll("__PERTEMUAN__", String(p)));

  const konsep = bagian(nomor++, "Konsep yang Wajib Dikuasai",
    paragraf([m.sub]) + "\n" + kartu(m.concepts)
    + `\n  <div class="tip-box reveal">🧭 <strong>Alur berpikir engineer:</strong> ${m.steps.join(" &nbsp;→&nbsp; ")}</div>\n`
    + tabel("Tabel 1 — Ringkasan konsep inti beserta bentuk matematisnya",
      ["Konsep", "Bentuk / Rumus", "Yang perlu diingat"],
      m.concepts.map(([h, p, f]) => [h, f ? rumusLatex(f) : "—", p]))
    + legendaNotasi(m.concepts.map((c) => c[2])));

  const mendalam = bagianMateri(n, nomor);
  nomor = mendalam.berikut;

  const analogi = bagian(nomor++, "Analogi dan Penerapan Nyata",
    subBagian("Analogi untuk Membangun Intuisi", kartu(m.analogies))
    + "\n" + subBagian("Penerapan pada Sistem Industri", kartu(m.industries)));
  const industri = "";

  // Animasi PER MODUL dari sisken-animasi.mjs. Dahulu ketiga belas modul
  // memakai tiga animasi yang sama apa pun topiknya — respons step tampil
  // sampai di modul Logika Fuzzy. Setiap modul kini wajib punya entri sendiri;
  // absennya entri adalah kesalahan fatal, bukan alasan memakai animasi generik.
  const spekAnimasi = ANIMASI_MODUL[n];
  if (!spekAnimasi) throw new Error(`Modul ${n}: tidak ada entri di sisken-animasi.mjs`);
  // Penjelasan wajib ada untuk TIAP panel — mengikuti pola "📊 Cara Membaca"
  // Modul 1. Panel tanpa penjelasan menghentikan generator, bukan tayang bisu.
  const penjelasan = PENJELASAN_ANIMASI[n];
  if (!penjelasan || penjelasan.panel.length !== spekAnimasi.panel.length || !penjelasan.grafik) {
    throw new Error(`Modul ${n}: PENJELASAN_ANIMASI tidak lengkap (butuh ${spekAnimasi.panel.length} panel + grafik)`);
  }
  const kotakJelas = (j) => {
    if (!j.apa || !j.variabel?.length) throw new Error(`Modul ${n}: penjelasan panel kosong`);
    const daftar = j.variabel.map(([notasi, arti], iw) =>
      `<span class="anim-var nw${iw % 5}"><code>${notasi}</code><span>${arti}</span></span>`).join("");
    return `  <div class="tip-box reveal anim-jelas">
    <strong>📊 Cara Membaca:</strong> ${j.apa}
    <div class="anim-var-list" aria-label="Arti tiap notasi">${daftar}</div>
  </div>`;
  };
  const panelSpek = spekAnimasi.panel.map((p, i) => {
    const slot = i + 1;
    const kendali = `<div class="ctrl-group">
          <label>${p.label} — <span class="ctrl-val" id="siskenAnim${slot}Nilai${n}">${p.nilai.toFixed(p.des)}</span></label>
          <input id="siskenAnim${slot}Geser${n}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.nilai}" oninput="drawSiskenAnim${slot}(${n})">
        </div>`
      + (slot === 1 ? `
        <button class="btn-anim" onclick="toggleSiskenAnimation(${n})">▶ Jalankan Animasi</button>` : "");
    return panelAnimasi(`siskenAnim${slot}Canvas${n}`, p.judul, kendali)
      + "\n" + kotakJelas(penjelasan.panel[i]);
  }).join("\n");
  const animasi = bagian(nomor++, "Animasi Respons dan Karakteristik Sistem",
    paragraf([spekAnimasi.intro])
    + "\n" + panelSpek
    + "\n" + paragraf([spekAnimasi.grafikIntro])
    + "\n" + panelAnimasi(`siskenGrafikCanvas${n}`, spekAnimasi.grafik.judul, "")
    + "\n" + kotakJelas(penjelasan.grafik));

  const python = bagian(nomor++, "Implementasi Python Siap Salin",
    paragraf(["Salin satu cell lengkap ke Jupyter Notebook atau VS Code. Jalankan tanpa perubahan terlebih dahulu, kemudian ubah parameter untuk eksperimen."])
    + "\n" + panelKode(`Cell 1 — ${m.title}`, m.code)
    + "\n" + panelKode("Cell 2 — Sapuan Parameter: memilih gain dari gambar, bukan dari tebakan", KODE_SAPUAN)
    + "\n" + panelKode("Cell 3 — Mengukur Indikator Kinerja dari Data Respons", KODE_INDIKATOR));

  const referensi = bagian(nomor++, "Daftar Pustaka", daftarPustaka(n, m));

  const footer = `<footer>
  <p>© 2026 · <a href="#">Dedik Romahadi</a> · Modul ${n} — ${m.title} · Sistem Kendali Cerdas · S1 Teknik Mesin · Universitas Mercu Buana</p>
</footer>`;

  const isiBagian = [peta, konsep, mendalam.html, analogi, industri, animasi, python, referensi]
    .filter(Boolean).join("\n");
  const hero = buatHero(daftarBagian.length, isiBagian);

  return [hero, isiBagian, footer].filter(Boolean).join("\n") + bangunRuntime(n);
}

function taskPanel(m, index) {
  const n = index + 1;
  return `<div class="sisken-placeholder"><section class="sisken-task"><div class="sisken-kicker">Tugas Modul ${n} · Asesmen Teknis</div><h2>${m.title}</h2><p>Tugas difokuskan sepenuhnya pada bukti analisis teknik yang dapat diverifikasi: model, perhitungan, kode, grafik, dan interpretasi hasil.</p><div class="sisken-grid" style="margin-top:24px"><article class="sisken-card"><h3>1 · Analisis Sistem</h3><p>Identifikasi input, output, gangguan, constraint, dan metrik kinerja untuk kasus yang diberikan.</p></article><article class="sisken-card"><h3>2 · Implementasi Python</h3><p>Gunakan panel kode pada tab Python sebagai titik awal. Ubah parameter, jalankan, dan dokumentasikan output.</p></article><article class="sisken-card"><h3>3 · Interpretasi Teknik</h3><p>Jelaskan hubungan parameter dengan stabilitas, respons, robustness, atau kualitas keputusan controller.</p></article></div><div class="sisken-task-note">✓ Penilaian objektif dan komputasi dijalankan melalui mekanisme server. Setiap kesimpulan harus didukung hasil hitung atau keluaran program.</div></section></div>`;
}

const runtimeAwal = `<script id="sisken-rich-runtime">
window.openSiskenPane=function(n,id,button){
  var root=document.getElementById('sisken-module-'+n); if(!root)return;
  root.querySelectorAll('.sisken-pane').forEach(function(p){p.classList.toggle('active',p.dataset.siskenPane===n+'-'+id)});
  root.querySelectorAll('.sisken-tab').forEach(function(b){var active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
  if(id==='animasi')requestAnimationFrame(function(){drawSiskenAnim1(n)});
};
window._siskenAnim={};
window.toggleSiskenAnimation=function(n){var state=window._siskenAnim[n]||{running:false,start:0};state.running=!state.running;state.start=performance.now();window._siskenAnim[n]=state;if(!state.running)return;(function tick(now){if(!state.running)return;drawSiskenAnim1(n,(now-state.start)/6000);requestAnimationFrame(tick)})(performance.now())};
// Bidang gambar dipisahkan dari jalur keterangan: batas atas menyisakan pita
// untuk legenda dan batas bawah untuk nama sumbu, sehingga tulisan tidak pernah
// menimpa kurva. Semua penggambar memakai batas ini, bukan angka lepas.
function _siskenSiapkan(id,pad,pitaAtas,pitaBawah){
  var c=document.getElementById(id);if(!c)return null;
  var x=c.getContext('2d'),w=c.width,h=c.height;
  _siskenPasangTeksPas(c,x);
  // Tiap render mulai dari catatan kotak teks yang bersih utk kanvas ini.
  window._siskenTeksKotak=(window._siskenTeksKotak||[]).filter(function(r){return r[0]!==id});
  var atas=pad+(pitaAtas||0), bawah=h-pad-(pitaBawah||0);
  x.clearRect(0,0,w,h);x.fillStyle='#070b16';x.fillRect(0,0,w,h);
  x.strokeStyle='#243653';x.lineWidth=1;
  for(var i=0;i<=10;i++){var px=pad+i*(w-2*pad)/10;x.beginPath();x.moveTo(px,atas);x.lineTo(px,bawah);x.stroke()}
  for(var j=0;j<=5;j++){var py=atas+j*(bawah-atas)/5;x.beginPath();x.moveTo(pad,py);x.lineTo(w-pad,py);x.stroke()}
  return {ctx:x,w:w,h:h,pad:pad,atas:atas,bawah:bawah,tinggi:bawah-atas,lebar:w-2*pad};
}
// Legenda digambar berjajar pada pita atas, jaraknya dihitung dari lebar teks
// supaya antar-butir tidak berhimpit.
function _siskenLegenda(x,butir,kiri,y){
  x.font='17px JetBrains Mono';
  var maju=kiri;
  butir.forEach(function(b){
    x.fillStyle=b[1];x.fillRect(maju,y-9,16,4);
    x.fillStyle='#cfdaec';x.fillText(b[0],maju+24,y);
    maju+=24+x.measureText(b[0]).width+34;
  });
}
// ── Helper gambar bersama untuk animasi per-modul (sisken-animasi.mjs) ──
// _siskenSkala memetakan koordinat data ke piksel bidang gambar; _siskenJalur
// dan _siskenKurva menggambar polyline/fungsi dengannya. Badan fungsi gambar
// per-modul mengandalkan kelima helper ini, jadi ubah dengan hati-hati.
function _siskenSkala(s,x0,x1,y0,y1){
  return {x:function(v2){return s.pad+(v2-x0)/(x1-x0)*s.lebar},
          y:function(v2){return s.bawah-(v2-y0)/(y1-y0)*s.tinggi}};
}
function _siskenJalur(x,sk,pts,warna,tebal,putus){
  x.strokeStyle=warna;x.lineWidth=tebal||3;
  if(putus)x.setLineDash(putus);
  x.beginPath();
  for(var i=0;i<pts.length;i++){var px=sk.x(pts[i][0]),py=sk.y(pts[i][1]);if(i===0)x.moveTo(px,py);else x.lineTo(px,py)}
  x.stroke();x.setLineDash([]);
}
function _siskenKurva(x,sk,f,x0,x1,warna,tebal,putus){
  var pts=[];for(var i=0;i<=400;i++){var t=x0+(x1-x0)*i/400;pts.push([t,f(t)])}
  _siskenJalur(x,sk,pts,warna,tebal,putus);
}
function _siskenTitik(x,px,py,r,warna){
  x.fillStyle=warna;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
}
function _siskenGarisDatar(x,s,py,warna){
  x.setLineDash([9,7]);x.strokeStyle=warna;x.lineWidth=2;
  x.beginPath();x.moveTo(s.pad,py);x.lineTo(s.w-s.pad,py);x.stroke();x.setLineDash([]);
}
// Membaca slider slot & memutakhirkan label nilainya. null berarti panel tidak
// ada di halaman ini — pemanggil wajib berhenti.
function _siskenNilai(awalan,n,des){
  var sl=document.getElementById(awalan+'Geser'+n); if(!sl)return null;
  var v=Number(sl.value);
  var lab=document.getElementById(awalan+'Nilai'+n); if(lab)lab.textContent=v.toFixed(des);
  return v;
}
function _siskenStep2(z,wn,t){
  if(z<1){var wd=wn*Math.sqrt(1-z*z);return 1-Math.exp(-z*wn*t)*(Math.cos(wd*t)+(z/Math.sqrt(1-z*z))*Math.sin(wd*t));}
  return 1-(1+wn*t)*Math.exp(-wn*t);
}
// LCG deterministik — animasi GA (Modul 14) harus menggambar populasi yang
// SAMA setiap kali digambar ulang, kalau tidak slider terasa acak.
function _siskenAcak(benih){var s2=benih>>>0;return function(){s2=(s2*1664525+1013904223)>>>0;return s2/4294967296}}
// fillText yang menyusut otomatis: keterangan pada kanvas TIDAK BOLEH terpotong
// tepi. Bila teks lebih lebar dari ruang yang tersisa, ukuran font diturunkan
// bertahap (paling kecil 12px); bila masih lebih juga, dipotong berelipsis.
// Setiap penyusutan tercatat di window._siskenTeksSusut supaya bisa diaudit —
// teks yang sering menyusut jauh sebaiknya DIPERPENDEK di sisken-animasi.mjs,
// bukan dibiarkan mengecil.
function _siskenPasangTeksPas(c,x){
  if(x._teksPas)return; x._teksPas=true;
  var asli=x.fillText.bind(x), w=c.width;
  x.fillText=function(teks,px,py,maxW){
    teks=String(teks);
    var align=x.textAlign||'left', batas;
    if(maxW!==undefined)batas=maxW;
    else if(align==='right')batas=px-8;
    else if(align==='center')batas=2*Math.min(px-8,w-px-8);
    else batas=w-px-8;
    if(batas<=12||x.measureText(teks).width<=batas){asli(teks,px,py);_siskenCatatKotak(c,x,teks,px,py,align);return;}
    var fontAsli=x.font, m=fontAsli.match(/(\\d+(?:\\.\\d+)?)px/);
    if(m){var uk=parseFloat(m[1]);
      while(uk>12&&x.measureText(teks).width>batas){uk-=0.5;x.font=fontAsli.replace(/\\d+(?:\\.\\d+)?px/,uk+'px');}}
    var utuh=teks, potong=false;
    // Elipsis hanya bila teks TELANJANG masih tak muat setelah menyusut —
    // jangan menghukum teks yang pas hanya karena '…' ikut ditimbang.
    if(x.measureText(teks).width>batas){
      while(teks.length>4&&x.measureText(teks+'…').width>batas)teks=teks.slice(0,-1);
      teks+='…';potong=true;
    }
    asli(teks,px,py);
    var ukAkhir=m?parseFloat(x.font.match(/(\\d+(?:\\.\\d+)?)px/)[1]):0;
    (window._siskenTeksSusut=window._siskenTeksSusut||[]).push([c.id,ukAkhir,potong,utuh.slice(0,90)]);
    _siskenCatatKotak(c,x,teks,px,py,align);
    x.font=fontAsli;
  };
}
function _siskenUkFont(f){var m2=f.match(/(\\d+(?:\\.\\d+)?)px/);return m2?parseFloat(m2[1]):14}
// Baris keterangan dasar kanvas: label sumbu kanan digambar LEBIH DULU, lalu
// teks kiri diberi maxW yang berhenti sebelum label — dua teks pada baris yang
// sama tidak akan pernah bertumpuk.
function _siskenBawah(x,s,kiri,kanan,warnaKiri){
  x.font='17px JetBrains Mono';
  var batasKanan=s.w-s.pad;
  if(kanan){
    x.textAlign='right';x.fillStyle='#aebbd0';
    x.fillText(kanan,s.w-s.pad,s.h-13);
    batasKanan=s.w-s.pad-x.measureText(kanan).width-18;
  }
  x.textAlign='left';x.fillStyle=warnaKiri||'#9fb2cc';
  x.fillText(kiri,s.pad,s.h-13,batasKanan-s.pad);
}
// Kotak pembatas tiap teks dicatat supaya tumpang tindih antar-teks bisa
// diaudit: dua teks pada baris yang sama pernah saling menimpa tanpa ada
// yang menyadarinya (legenda vs catatan kanan-atas pada root locus).
function _siskenCatatKotak(c,x,teks,px,py,align){
  var lebar=x.measureText(teks).width, uk=_siskenUkFont(x.font);
  var x0=align==='right'?px-lebar:(align==='center'?px-lebar/2:px);
  (window._siskenTeksKotak=window._siskenTeksKotak||[]).push([c.id,x0,x0+lebar,py,uk,teks.slice(0,60)]);
}
`;

// Bagian runtime SETELAH fungsi gambar per-modul: peta kemajuan, checklist,
// subnav, dan boot. Dipisah dari runtimeAwal supaya bangunRuntime(n) dapat
// menyisipkan fungsi gambar milik modul itu di antara keduanya.
const runtimeAkhir = `
window.drawSiskenPeta=function(n){
  var s=_siskenSiapkan('siskenPetaCanvas'+n,40,0,0);if(!s)return;
  var x=s.ctx,w=s.w,h=s.h,pad=s.pad,total=14,nomor=Number(n);
  x.clearRect(0,0,w,h);x.fillStyle='#070b16';x.fillRect(0,0,w,h);
  var lebar=s.lebar/total, y=66;
  x.font='17px JetBrains Mono';x.fillStyle='#aebbd0';
  x.textAlign='left';x.fillText('Modul 1',pad,40);
  x.textAlign='right';x.fillText('Modul 14',w-pad,40);
  for(var i=1;i<=total;i++){
    var kiri=pad+(i-1)*lebar+5, ini=(i===nomor), lewat=(i<nomor);
    x.fillStyle=ini?'#8b5cf6':(lewat?'#0d3b4a':'#0b1628');
    x.strokeStyle=ini?'#67e8f9':'#243653';x.lineWidth=ini?2.5:1;
    x.beginPath();
    if(x.roundRect)x.roundRect(kiri,y,lebar-10,56,10);else x.rect(kiri,y,lebar-10,56);
    x.fill();x.stroke();
    x.fillStyle=ini?'#ffffff':(lewat?'#9fd8e6':'#6d7f9c');
    x.font=(ini?'bold ':'')+'20px JetBrains Mono';
    x.textAlign='center';x.fillText(String(i),kiri+(lebar-10)/2,y+37);
  }
  x.textAlign='center';x.fillStyle='#c4b5fd';x.font='bold 19px JetBrains Mono';
  x.fillText('Anda di Modul '+nomor+', masih tersisa '+(total-nomor)+' modul menuju tuntas',w/2,h-20);
  x.textAlign='left';
};
window.siskenCentang=function(n,i){
  var akar=document.getElementById('periksa-'+n); if(!akar) return;
  var butir=akar.querySelectorAll('.sisken-periksa-butir')[i]; if(!butir) return;
  var aktif=!butir.classList.contains('dicentang');
  butir.classList.toggle('dicentang',aktif);
  butir.setAttribute('aria-checked',String(aktif));
  _siskenSimpanPeriksa(n); _siskenPerbaruiPeriksa(n);
};
function _siskenKunciPeriksa(n){ return 'sisken-periksa-modul-'+n; }
function _siskenSimpanPeriksa(n){
  var akar=document.getElementById('periksa-'+n); if(!akar) return;
  var pilih=[];
  akar.querySelectorAll('.sisken-periksa-butir').forEach(function(b,i){ if(b.classList.contains('dicentang')) pilih.push(i); });
  try{ localStorage.setItem(_siskenKunciPeriksa(n), JSON.stringify(pilih)); }catch(e){}
}
function _siskenPerbaruiPeriksa(n){
  var akar=document.getElementById('periksa-'+n); if(!akar) return;
  var semua=akar.querySelectorAll('.sisken-periksa-butir');
  var jadi=akar.querySelectorAll('.sisken-periksa-butir.dicentang').length;
  var hitung=document.getElementById('periksa-hitung-'+n);
  var bar=document.getElementById('periksa-bar-'+n);
  var pesan=document.getElementById('periksa-pesan-'+n);
  if(hitung) hitung.textContent=jadi+' / '+semua.length;
  if(bar) bar.style.width=(semua.length?Math.round(jadi/semua.length*100):0)+'%';
  if(pesan){
    pesan.classList.toggle('tuntas',jadi===semua.length&&semua.length>0);
    if(jadi===0) pesan.textContent='Belum ada yang dicentang. Mulailah dari butir pertama.';
    else if(jadi===semua.length) pesan.textContent='Seluruh butir tercentang. Anda siap melanjutkan ke modul berikutnya.';
    else pesan.textContent='Tersisa '+(semua.length-jadi)+' butir. Tinjau kembali bagian yang bersangkutan sebelum melanjutkan.';
  }
}
window.geserSubnav=function(arah){
  var bar=document.getElementById('modulSubnav'); if(!bar) return;
  bar.scrollBy({left:arah*Math.max(180,bar.clientWidth*0.6),behavior:'smooth'});
};
function _perbaruiPanahSubnav(){
  var bar=document.getElementById('modulSubnav');
  var kiri=document.getElementById('subnavKiri'), kanan=document.getElementById('subnavKanan');
  if(!bar||!kiri||!kanan) return;
  var meluber=bar.scrollWidth>bar.clientWidth+4;
  var tampak=bar.classList.contains('show');
  [kiri,kanan].forEach(function(b){ b.classList.toggle('tampil', meluber&&tampak); });
  kiri.disabled=bar.scrollLeft<=2;
  kanan.disabled=bar.scrollLeft>=bar.scrollWidth-bar.clientWidth-2;
}
function _siskenMuatPeriksa(){
  document.querySelectorAll('.sisken-periksa').forEach(function(akar){
    var n=akar.id.replace('periksa-','');
    var pilih=[];
    try{ pilih=JSON.parse(localStorage.getItem(_siskenKunciPeriksa(n))||'[]')||[]; }catch(e){}
    akar.querySelectorAll('.sisken-periksa-butir').forEach(function(b,i){
      var aktif=pilih.indexOf(i)>=0;
      b.classList.toggle('dicentang',aktif);
      b.setAttribute('aria-checked',String(aktif));
    });
    _siskenPerbaruiPeriksa(n);
  });
}
document.addEventListener('DOMContentLoaded',function(){
  var bar=document.getElementById('modulSubnav');
  if(bar){
    bar.addEventListener('scroll',_perbaruiPanahSubnav,{passive:true});
    window.addEventListener('resize',_perbaruiPanahSubnav,{passive:true});
    // Kelas .show dipasang skrip lain saat halaman digulir, jadi keadaannya diamati.
    new MutationObserver(_perbaruiPanahSubnav).observe(bar,{attributes:true,attributeFilter:['class']});
    setTimeout(_perbaruiPanahSubnav,300);
  }

  // Keempatnya digambar sejak halaman dimuat. Dahulu animasi pertama baru
  // digambar saat tab "Animasi" dibuka; tab itu sudah tidak ada.
  document.querySelectorAll('[id^="siskenAnim1Geser"]').forEach(function(el){var m=el.id.match(/(\\d+)$/);if(m)drawSiskenAnim1(m[1])});
  document.querySelectorAll('[id^="siskenAnim2Geser"]').forEach(function(el){var m=el.id.match(/(\\d+)$/);if(m)drawSiskenAnim2(m[1])});
  document.querySelectorAll('[id^="siskenAnim3Geser"]').forEach(function(el){var m=el.id.match(/(\\d+)$/);if(m)drawSiskenAnim3(m[1])});
  document.querySelectorAll('[id^="siskenGrafikCanvas"]').forEach(function(el){var m=el.id.match(/(\\d+)$/);if(m)drawSiskenGrafik(m[1])});
  document.querySelectorAll('[id^="siskenPetaCanvas"]').forEach(function(el){var m=el.id.match(/(\\d+)$/);if(m)drawSiskenPeta(m[1])});
  _siskenMuatPeriksa();
});
</script>`;

// Merakit runtime untuk SATU modul: bagian bersama + fungsi gambar milik modul
// itu saja (dari sisken-animasi.mjs). Tiap halaman berdiri sendiri, jadi kode
// gambar modul lain tidak ikut terkirim.
function bangunRuntime(n) {
  const spek = ANIMASI_MODUL[n];
  if (!spek) throw new Error(`Modul ${n}: tidak ada entri di sisken-animasi.mjs`);
  const gambarPanel = spek.panel.map((p, i) => {
    const slot = i + 1;
    return `window.drawSiskenAnim${slot}=function(n,phase){\n`
      + `  var v=_siskenNilai('siskenAnim${slot}',n,${p.des}); if(v===null)return;\n`
      + `${p.gambar}\n};`;
  }).join("\n");
  const gambarGrafik = `window.drawSiskenGrafik=function(n){\n${spek.grafik.gambar}\n};`;
  return runtimeAwal
    + (spek.bantu ? `\n${spek.bantu}` : "")
    + `\n${gambarPanel}\n${gambarGrafik}`
    + runtimeAkhir;
}

// Modul 1 ditulis tangan mengikuti Modul 1 Getaran Mekanik dan JAUH lebih dalam
// daripada keluaran generator ini (6.469 kata vs ~1.430). Menjalankan generator
// atas Modul 1 akan menimpanya dan menghapus sembilan seksi materi, panel
// animasi, serta halaman tugas 25 soal yang qId-nya terikat bank soal Firestore.
// Karena itu Modul 1 sengaja dilewati; entri datanya tetap disimpan sebagai
// rujukan gaya. validate-sisken-modules.mjs menguji Modul 1 dengan aturan
// terpisah, jadi pelanggaran pengaman ini akan ketahuan di sana.
const LEWATI = new Set([1]);

for (const [index, m] of modules.entries()) {
  const nomor = index + 1;
  if (LEWATI.has(nomor)) continue;
  const file = path.join(moduleDir, `Modul-${nomor}.html`);
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<script id="sisken-rich-runtime">[\s\S]*?<\/script>/g, "");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>Modul ${index + 1} — ${m.title} | Sistem Kendali Cerdas</title>`);
  html = html.replace(/^[ \t]*<span class="nav-brand">[^\r\n]*$/m, `  <span class="nav-brand"><span class="pulse"></span><span>SISKENCERDAS // M${index + 1}</span></span>`);
  html = html.replace(/id="visitorTableBody" style="max-height:[^;\"]+;overflow-y:auto;"/g, 'id="visitorTableBody" style="max-height:min(72vh,820px);overflow-y:auto;"');
  html = html.replace(/<div class="page active" id="page-modul">[\s\S]*?<\/div>\s*<!-- end page-modul -->/, `<div class="page active" id="page-modul">${richModule(m, index)}\n</div><!-- end page-modul -->`);

  // Bilah tautan di bawah nav dibangun ulang dari bagian yang benar-benar ada.
  // Sebelumnya isinya masih menunjuk ke anchor halaman lama sehingga seluruh
  // tautannya tidak menuju ke mana-mana.
  // Bagiannya banyak sehingga bilahnya melebihi lebar layar. Dua tombol panah
  // ditambahkan supaya tautan yang tersembunyi tetap dapat dijangkau tanpa
  // mengandalkan gulir mendatar yang batang gulirnya memang disembunyikan.
  const tautanSubnav = daftarBagian.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("");
  html = html.replace(/<div id="modulSubnav" class="subnav-bar show">[\s\S]*?<\/div>/,
    `<button class="subnav-geser kiri" id="subnavKiri" onclick="geserSubnav(-1)" aria-label="Geser tab ke kiri">‹</button>`
    + `<div id="modulSubnav" class="subnav-bar show">${tautanSubnav}</div>`
    + `<button class="subnav-geser kanan" id="subnavKanan" onclick="geserSubnav(1)" aria-label="Geser tab ke kanan">›</button>`);
  // Halaman tugas yang sudah berisi soal sungguhan dibangun dari repo backend
  // (build-sisken-tugas.js), tempat kunci jawabannya berada. Repo ini publik
  // sehingga tidak boleh memuat kunci. Panel generik di bawah hanya dipakai
  // selama modul belum punya soal; menimpanya akan menghapus 25 soal yang
  // qId-nya terikat Firestore.
  // Halaman forum dibangkitkan bila modul sudah punya data kasus di
  // sisken-forum.mjs. Modul yang belum punya dibiarkan apa adanya.
  const forum = forumPage(nomor);
  if (forum) {
    const reForum = /(<div class="page" id="page-forum">)[\s\S]*?(<\/div>\s*<!-- end page-forum -->)/;
    if (reForum.test(html)) {
      html = html.replace(reForum, `$1\n${forum}\n$2`);
    } else {
      console.error(`  Modul ${nomor}: penanda page-forum tidak ditemukan`);
    }
  }

  // Kunci jajak forum memakai namespace khusus. Nama global window._pa juga
  // pernah dipakai skrip legacy di bagian bawah halaman dan menimpa kunci
  // Modul 2-14 (bahkan tidak mempunyai entri soal 3).
  html = html.replace(
    "const correct = (_ah(n+'_'+idx) === window._pa[n]);",
    "const correct = (_ah(n+'_'+idx) === (window._forumPollAnswerHashes || {})[n]);",
  );

  const sudahAdaSoal = /id="rg-mc1"/.test(html);
  if (!sudahAdaSoal) {
    html = html.replace(/<div class="page" id="page-tugas">[\s\S]*?<\/div>\s*<!-- end page-tugas -->/, `<div class="page" id="page-tugas">${taskPanel(m, index)}\n</div><!-- end page-tugas -->`);
  }
  // Tombol "Unduh PDF" menunjuk ke berkas Word yang sudah dirender ke PDF di
  // Modul-Word. Nama berkasnya dibentuk dari judul modul dengan aturan yang
  // sama seperti pembangun berkas Word, lalu hanya dipasang bila berkasnya
  // memang ada supaya tombolnya tidak pernah menunjuk ke alamat kosong.
  const namaPdf = `Modul-${nomor}-${m.title.replace(/[^A-Za-z0-9 ]/g, "").trim().replace(/\s+/g, "-")}.pdf`;
  if (fs.existsSync(path.join(root, "Sistem-Kendali-Cerdas", "Modul-Word", namaPdf))) {
    html = html.replace(/const MODUL_PDF_URL = '[^']*';/, `const MODUL_PDF_URL = '../Modul-Word/${namaPdf}';`);
    html = html.replace(/const MODUL_PDF_FILENAME = '[^']*';/, `const MODUL_PDF_FILENAME = '${namaPdf}';`);
  }

  html = html.replace(/\/\* SISKENCERDAS-RICH-CONTENT:START \*\/[\s\S]*?\/\* SISKENCERDAS-RICH-CONTENT:END \*\//, css.trim());
  if (!html.includes("SISKENCERDAS-RICH-CONTENT:START")) html = html.replace("</head>", `<style>${css}</style>\n</head>`);

  // Gaya halaman sudah tersedia di blok utama <head> yang dimiliki semua modul
  // (memuat .hero, .section-title, .card, .formula-block, .tip-box, .anim-panel).
  // Percobaan sebelumnya menyuntikkan blok gaya lain dari Modul 1; blok itu
  // ternyata milik dokumen ekspor Tugas dan membuat latar halaman menjadi
  // terang. Sisa penyuntikan itu dibuang bila masih ada.
  html = html.replace(/<style>\/\* SISKEN-DESAIN-MODUL1:START[\s\S]*?SISKEN-DESAIN-MODUL1:END \*\/<\/style>\n?/, "");

  // Setup Python dan Pembagian Kelompok hanya ada di Modul 1. Pada modul 2-14
  // tombol nav, halaman, dan blok gayanya dibuang seluruhnya supaya tidak ada
  // tab yang menuju halaman kosong.
  for (const nama of ["setup", "kelompok"]) {
    html = html.replace(new RegExp(`\\s*<button class="nav-tab" id="tab-${nama}"[\\s\\S]*?</button>`), "");
    html = html.replace(new RegExp(`\\s*<div class="page[^"]*" id="page-${nama}">[\\s\\S]*?<!-- end page-${nama} -->`), "");
  }
  // Blok gaya keduanya dibuang dengan menyaring per blok, bukan lewat pola
  // rentang: blok gaya utama juga menyebut #page-setup sehingga pola rentang
  // sempat ikut menelannya.
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (blok) => {
    const isi = blok.slice(0, 400);
    const milikSetup = /CSS variables scoped untuk Setup Python|^\s*#page-setup\s*\{/m.test(isi);
    const milikKelompok = /^\s*#page-kelompok\s*\{/m.test(isi);
    return (milikSetup || milikKelompok) ? "" : blok;
  });
  // Komentar penanda kedua halaman itu ikut dibuang supaya tidak menyisakan
  // judul bagian yang isinya sudah tidak ada.
  html = html.replace(/\s*<!--\s*═+\s*PAGE: (SETUP PYTHON|PEMBAGIAN KELOMPOK)[\s\S]*?-->/g, "");
  html = normalizeSiskenExportHtml(html, nomor, m.title);
  html = normalizeSiskenForumRuntime(html, nomor);
  fs.writeFileSync(file, html, "utf8");
}

console.log(
  `Enriched ${modules.length - LEWATI.size} Sistem Kendali Cerdas modules `
  + `(Modul ${[...LEWATI].join(", ")} dilewati: ditulis tangan).`,
);
