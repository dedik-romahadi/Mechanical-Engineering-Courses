(function () {
  'use strict';

  const script = document.currentScript;
  const context = (script && script.dataset.context) || 'sisken';
  const label = (script && script.dataset.label) || 'Sistem Kendali Cerdas';
  const moduleMatch = context.match(/^module-(\d+)$/);
  const moduleNumber = moduleMatch ? Number(moduleMatch[1]) : null;

  const guides = {
    1: {
      analogy: 'Bayangkan AC ruangan. Anda memilih suhu yang diinginkan, sensor membaca suhu nyata, lalu AC mengoreksi selisihnya. Itulah inti sistem kontrol.',
      steps: ['Tentukan hasil yang diinginkan.', 'Ukur keadaan yang sedang terjadi.', 'Koreksi tindakan sampai hasil mendekati target.'],
      terms: [['Setpoint', 'target yang ingin dicapai'], ['Plant', 'mesin atau proses yang dikendalikan'], ['Feedback', 'informasi hasil nyata yang dikirim kembali']]
    },
    2: {
      analogy: 'Merancang sistem kontrol mirip merencanakan perjalanan: tentukan tujuan, kenali kendaraan dan hambatan, pilih rute, lalu cek apakah benar-benar sampai.',
      steps: ['Ubah kebutuhan menjadi target yang terukur.', 'Buat model sederhana sebelum membangun alat.', 'Uji hasil dan perbaiki rancangan secara bertahap.'],
      terms: [['Spesifikasi', 'ukuran keberhasilan yang jelas'], ['Model', 'versi sederhana dari sistem nyata'], ['Verifikasi', 'pemeriksaan bahwa rancangan memenuhi target']]
    },
    3: {
      analogy: 'Transformasi Laplace seperti menerjemahkan kalimat sulit ke bahasa yang lebih mudah dihitung. Gerak terhadap waktu diubah menjadi bentuk aljabar.',
      steps: ['Kenali persamaan geraknya.', 'Ubah setiap bagian ke domain-s.', 'Selesaikan aljabar lalu tafsirkan kembali maknanya.'],
      terms: [['Domain waktu', 'perubahan yang dilihat terhadap waktu'], ['Domain-s', 'bentuk bantu untuk mempermudah hitungan'], ['Pole', 'nilai yang sangat memengaruhi perilaku sistem']]
    },
    4: {
      analogy: 'Fungsi transfer memandang mesin sebagai kotak: kita memberi masukan, lalu mengamati keluarannya tanpa harus melihat seluruh detail di dalam kotak.',
      steps: ['Tentukan masukan dan keluaran.', 'Susun hubungan matematikanya.', 'Gabungkan blok untuk melihat perilaku sistem lengkap.'],
      terms: [['Input', 'perintah atau gangguan yang masuk'], ['Output', 'hasil yang dihasilkan sistem'], ['Gain', 'seberapa besar input diperkuat atau diperkecil']]
    },
    5: {
      analogy: 'Simulasi adalah uji coba virtual. Seperti mencoba desain mobil di komputer sebelum membuat prototipe mahal.',
      steps: ['Masukkan model dan parameter.', 'Jalankan skenario yang terkontrol.', 'Bandingkan grafik dengan dugaan dan kondisi nyata.'],
      terms: [['Simulasi', 'percobaan menggunakan model komputer'], ['Parameter', 'angka yang menentukan sifat model'], ['Reproduksibel', 'hasil dapat diulang dengan cara yang sama']]
    },
    6: {
      analogy: 'Kontrol digital bekerja seperti petugas yang berulang kali membaca sensor, mengambil keputusan, lalu memberi perintah kepada mesin.',
      steps: ['Baca keadaan sistem pada selang waktu tertentu.', 'Hitung tindakan pengendalian.', 'Kirim perintah dan evaluasi respons berikutnya.'],
      terms: [['Sampling', 'pengambilan data pada waktu-waktu tertentu'], ['Controller', 'aturan untuk menentukan tindakan'], ['Saturasi', 'batas maksimum kemampuan aktuator']]
    },
    7: {
      analogy: 'Grafik respons seperti rekam medis mesin. Bentuk kurvanya memberi tahu apakah sistem cepat, lambat, berlebihan, atau belum mencapai target.',
      steps: ['Tandai nilai awal dan nilai akhir.', 'Cari puncak serta waktu menuju target.', 'Jelaskan apa arti bentuk grafik bagi kinerja mesin.'],
      terms: [['Rise time', 'waktu awal untuk mendekati target'], ['Overshoot', 'kelebihan melewati target'], ['Settling time', 'waktu sampai respons stabil']]
    },
    8: {
      analogy: 'Umpan balik mirip menjaga kecepatan sepeda: Anda melihat kondisi nyata dan terus menambah atau mengurangi kayuhan.',
      steps: ['Bandingkan target dengan keluaran.', 'Perhatikan seberapa cepat koreksi berlangsung.', 'Pastikan koreksi tidak membuat sistem berosilasi atau tidak stabil.'],
      terms: [['Damping', 'kemampuan meredam ayunan'], ['Natural frequency', 'kecenderungan alami sistem untuk bergetar'], ['Sensitivitas', 'seberapa besar hasil berubah saat parameter berubah']]
    },
    9: {
      analogy: 'PID seperti tiga anggota tim: P bereaksi pada kesalahan sekarang, I mengingat kesalahan masa lalu, dan D memperkirakan arah perubahan.',
      steps: ['Mulai dari aksi P untuk respons dasar.', 'Tambahkan I untuk mengurangi sisa kesalahan.', 'Gunakan D secukupnya untuk meredam perubahan cepat.'],
      terms: [['P', 'reaksi terhadap kesalahan saat ini'], ['I', 'akumulasi kesalahan dari waktu ke waktu'], ['D', 'reaksi terhadap kecepatan perubahan kesalahan']]
    },
    10: {
      analogy: 'Aturan Mason seperti mencari semua rute pada peta aliran sinyal, termasuk jalan yang berputar kembali, lalu menghitung pengaruh totalnya.',
      steps: ['Temukan semua jalur dari input ke output.', 'Temukan loop yang kembali ke titik sebelumnya.', 'Gabungkan pengaruh jalur dan loop dengan rumus Mason.'],
      terms: [['Forward path', 'jalur yang bergerak dari input ke output'], ['Loop', 'jalur yang kembali ke titik awal'], ['Gain total', 'pengaruh gabungan seluruh jalur']]
    },
    11: {
      analogy: 'Kontrol cerdas adalah kotak peralatan: fuzzy memakai aturan manusia, neural network belajar dari contoh, dan genetic algorithm mencari kombinasi terbaik.',
      steps: ['Kenali jenis masalah dan data yang tersedia.', 'Pilih alat cerdas yang sesuai, bukan yang paling rumit.', 'Bandingkan hasilnya dengan kontrol klasik.'],
      terms: [['Fuzzy', 'penalaran dengan tingkat seperti rendah-sedang-tinggi'], ['Neural network', 'model yang belajar pola dari data'], ['Genetic algorithm', 'pencarian solusi melalui proses mirip evolusi']]
    },
    12: {
      analogy: 'Neural network seperti peserta magang: ia diberi banyak contoh, melakukan kesalahan, lalu memperbaiki bobot keputusan sedikit demi sedikit.',
      steps: ['Siapkan data contoh yang mewakili kondisi nyata.', 'Latih model dan ukur kesalahannya.', 'Uji dengan data baru yang belum pernah dilihat.'],
      terms: [['Neuron', 'unit perhitungan sederhana'], ['Bobot', 'angka yang menunjukkan kuatnya hubungan'], ['Loss', 'ukuran seberapa jauh prediksi dari jawaban benar']]
    },
    13: {
      analogy: 'Logika fuzzy meniru cara manusia berkata “agak panas” atau “sangat cepat”, lalu mengubah bahasa tersebut menjadi tindakan kontrol.',
      steps: ['Ubah angka menjadi tingkat linguistik.', 'Terapkan aturan jika-maka.', 'Ubah hasil aturan kembali menjadi angka kendali.'],
      terms: [['Membership', 'derajat keanggotaan pada suatu kategori'], ['Rule base', 'kumpulan aturan jika-maka'], ['Defuzzifikasi', 'mengubah hasil fuzzy menjadi satu angka']]
    },
    14: {
      analogy: 'Genetic algorithm seperti membiakkan banyak rancangan: rancangan terbaik dipilih, digabung, dan sedikit diubah sampai ditemukan hasil yang lebih baik.',
      steps: ['Nyatakan solusi sebagai kromosom.', 'Nilai setiap solusi dengan fungsi fitness.', 'Ulangi seleksi, crossover, dan mutasi.'],
      terms: [['Kromosom', 'representasi satu calon solusi'], ['Fitness', 'nilai kualitas calon solusi'], ['Mutasi', 'perubahan kecil untuk menjaga variasi']]
    }
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function addStyles() {
    if (document.getElementById('sisken-accessible-assessment-style')) return;
    const style = document.createElement('style');
    style.id = 'sisken-accessible-assessment-style';
    style.textContent = `
      .sisken-plain-guide,.sisken-integrity-panel{max-width:1100px;margin:28px auto;padding:26px;border-radius:18px;background:linear-gradient(145deg,rgba(8,47,73,.92),rgba(30,27,75,.92));border:1px solid rgba(34,211,238,.35);box-shadow:0 18px 46px rgba(2,8,23,.32);color:#e2e8f0}
      .sisken-plain-guide h2,.sisken-integrity-panel h2{margin:0 0 10px;color:#fff;font-size:clamp(22px,3vw,32px)}
      .sisken-kicker{font:800 11px/1.4 'JetBrains Mono',monospace;letter-spacing:1.8px;text-transform:uppercase;color:#67e8f9;margin-bottom:9px}
      .sisken-analogy{font-size:16px;line-height:1.75;color:#dbeafe;margin:0 0 18px}
      .sisken-guide-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}
      .sisken-guide-card{background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.24);border-radius:14px;padding:17px}
      .sisken-guide-card h3{margin:0 0 10px;color:#a5f3fc;font-size:14px}
      .sisken-guide-card ol{margin:0;padding-left:22px;color:#cbd5e1;line-height:1.7}
      .sisken-term{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid rgba(148,163,184,.14);font-size:13px;line-height:1.5}
      .sisken-term:last-child{border-bottom:0}.sisken-term strong{color:#f9a8d4}
      .sisken-integrity-panel{border-color:rgba(251,191,36,.42);background:linear-gradient(145deg,rgba(69,26,3,.94),rgba(30,27,75,.94))}
      .sisken-integrity-note{line-height:1.65;color:#fde68a;margin-bottom:18px}
      .sisken-integrity-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .sisken-field{display:flex;flex-direction:column;gap:7px}.sisken-field.wide{grid-column:1/-1}
      .sisken-field label{font-size:12px;font-weight:800;color:#f8fafc}
      .sisken-field input,.sisken-field textarea{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid rgba(148,163,184,.38);background:#08111f;color:#e2e8f0;padding:11px 12px;font:13px/1.55 'Segoe UI',sans-serif}
      .sisken-field textarea{min-height:105px;resize:vertical}.sisken-help{font-size:11px;color:#a5b4c7;line-height:1.5}
      .sisken-challenge{padding:13px;border-radius:10px;background:rgba(34,211,238,.09);border:1px dashed rgba(34,211,238,.48);color:#a5f3fc;font-family:'JetBrains Mono',monospace}
      .sisken-declare{display:flex;align-items:flex-start;gap:10px;margin-top:15px;color:#e2e8f0;font-size:13px;line-height:1.55}.sisken-declare input{margin-top:3px}
      .sisken-integrity-status{margin-top:14px;padding:11px 13px;border-radius:10px;background:rgba(15,23,42,.72);color:#cbd5e1;font-size:12px;line-height:1.55}
      .sisken-integrity-status.ok{border:1px solid rgba(52,211,153,.5);color:#a7f3d0}.sisken-integrity-status.bad{border:1px solid rgba(248,113,113,.5);color:#fecaca}
      @media(max-width:760px){.sisken-guide-grid,.sisken-integrity-grid{grid-template-columns:1fr}.sisken-field.wide{grid-column:auto}.sisken-term{grid-template-columns:90px 1fr}}
      @media print{.sisken-plain-guide,.sisken-integrity-panel{break-inside:avoid;background:#fff!important;color:#111827!important;border:1px solid #94a3b8!important;box-shadow:none!important}.sisken-integrity-panel input,.sisken-integrity-panel textarea{color:#111827!important;background:#fff!important}}
    `;
    document.head.appendChild(style);
  }

  function injectPlainGuide() {
    if (!moduleNumber || !guides[moduleNumber] || document.querySelector('.sisken-plain-guide')) return;
    const guide = guides[moduleNumber];
    const hero = document.querySelector('#page-modul .hero, .page#page-modul .hero, .hero[data-tab="modul"], #page-materi .hero, .hero[data-tab="materi"]');
    if (!hero) return;
    const section = document.createElement('section');
    section.className = 'sisken-plain-guide';
    section.innerHTML = `
      <div class="sisken-kicker">Mulai dari sini · Bahasa awam</div>
      <h2>Gambaran sederhananya</h2>
      <p class="sisken-analogy">${escapeHtml(guide.analogy)}</p>
      <div class="sisken-guide-grid">
        <div class="sisken-guide-card"><h3>Tiga langkah memahami materi</h3><ol>${guide.steps.map(function (step) { return '<li>' + escapeHtml(step) + '</li>'; }).join('')}</ol></div>
        <div class="sisken-guide-card"><h3>Kamus singkat</h3>${guide.terms.map(function (term) { return '<div class="sisken-term"><strong>' + escapeHtml(term[0]) + '</strong><span>' + escapeHtml(term[1]) + '</span></div>'; }).join('')}</div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function fnv1a(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function challengeFor(nim) {
    if (!/^\d{8,16}$/.test(nim)) return 'Isi NIM untuk membuat kode';
    const suffix = String((fnv1a(context + '|' + nim) % 9000) + 1000);
    return 'SKC-' + context.toUpperCase().replace(/[^A-Z0-9]+/g, '-') + '-' + suffix;
  }

  const storageKey = 'sisken-integrity:' + location.pathname + ':' + context;
  const openedAt = Date.now();
  let trustedInteractions = 0;
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
    document.addEventListener(name, function (event) {
      if (event.isTrusted) trustedInteractions += 1;
    }, { capture: true, passive: true });
  });

  function panelValues(panel) {
    const get = function (name) { return (panel.querySelector('[name="' + name + '"]') || {}).value || ''; };
    return {
      nim: get('integrityNim').trim(),
      observation: get('integrityObservation').trim(),
      process: get('integrityProcess').trim(),
      evidence: get('integrityEvidence').trim(),
      challenge: get('integrityChallenge').trim().toUpperCase(),
      declared: Boolean((panel.querySelector('[name="integrityDeclared"]') || {}).checked)
    };
  }

  function validatePanel(showMessage) {
    const panel = document.querySelector('.sisken-integrity-panel');
    if (!panel) return { ok: false, errors: ['Panel bukti proses belum tersedia.'] };
    const values = panelValues(panel);
    const expected = challengeFor(values.nim);
    const numbers = values.observation.match(/-?\d+(?:[.,]\d+)?/g) || [];
    const errors = [];
    if (!/^\d{8,16}$/.test(values.nim)) errors.push('NIM harus berisi 8–16 digit.');
    if (values.observation.length < 120 || numbers.length < 3) errors.push('Observasi harus minimal 120 karakter dan memuat sedikitnya tiga data angka hasil pengamatan.');
    if (values.process.length < 150) errors.push('Uraian proses harus minimal 150 karakter dan menjelaskan langkah, kesalahan, serta perbaikan.');
    if (!/^https:\/\//i.test(values.evidence)) errors.push('Tautan bukti penjelasan lisan harus menggunakan HTTPS.');
    if (values.challenge !== expected) errors.push('Kode verifikasi belum sesuai.');
    if (!values.declared) errors.push('Pernyataan integritas belum disetujui.');
    if (navigator.webdriver) errors.push('Export diblokir karena terdeteksi browser otomatis/WebDriver. Gunakan browser biasa dan kerjakan sendiri.');
    if ((Date.now() - openedAt) < 90000 || trustedInteractions < 3) errors.push('Luangkan waktu membaca dan berinteraksi langsung dengan halaman sebelum export.');

    const status = panel.querySelector('.sisken-integrity-status');
    if (showMessage && status) {
      status.className = 'sisken-integrity-status ' + (errors.length ? 'bad' : 'ok');
      status.innerHTML = errors.length
        ? '<strong>Bukti belum lengkap:</strong><br>' + errors.map(escapeHtml).join('<br>')
        : '<strong>Bukti proses lengkap.</strong> Export dapat dilanjutkan; dosen dapat meminta verifikasi lisan acak.';
      if (errors.length) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return { ok: errors.length === 0, errors: errors, values: values, expected: expected };
  }

  function injectIntegrityPanel() {
    if (document.querySelector('.sisken-integrity-panel')) return;
    const taskHero = document.querySelector('#page-tugas .hero, .page#page-tugas .hero');
    const scoreBar = document.querySelector('.score-bar');
    const anchor = taskHero || scoreBar;
    if (!anchor) return;

    const panel = document.createElement('section');
    panel.className = 'sisken-integrity-panel';
    panel.innerHTML = `
      <div class="sisken-kicker">Bukti proses autentik · Wajib sebelum export</div>
      <h2>Asesmen berbasis pengalaman pribadi</h2>
      <p class="sisken-integrity-note">Jawaban benar saja belum cukup. Mahasiswa wajib menunjukkan proses yang hanya dapat diperoleh melalui pengamatan langsung, jejak pengerjaan, dan penjelasan lisan. Penggunaan AI boleh untuk belajar konsep, tetapi dilarang menggantikan proses berpikir dan bukti pribadi.</p>
      <div class="sisken-integrity-grid">
        <div class="sisken-field"><label>NIM</label><input name="integrityNim" inputmode="numeric" autocomplete="off" maxlength="16" placeholder="Masukkan NIM"><span class="sisken-help">Dipakai untuk membuat kode verifikasi khusus.</span></div>
        <div class="sisken-field"><label>Kode verifikasi</label><div class="sisken-challenge" data-challenge>Isi NIM untuk membuat kode</div><input name="integrityChallenge" autocomplete="off" placeholder="Ketik ulang kode yang ditampilkan"></div>
        <div class="sisken-field wide"><label>Observasi nyata di sekitar Anda</label><textarea name="integrityObservation" placeholder="Sebutkan objek/mesin yang benar-benar diamati, kondisi pengukuran, serta sedikitnya tiga data angka beserta satuannya."></textarea><span class="sisken-help">Minimal 120 karakter dan tiga data numerik. Data yang sama persis antarmahasiswa akan ditinjau.</span></div>
        <div class="sisken-field wide"><label>Jejak proses berpikir</label><textarea name="integrityProcess" placeholder="Jelaskan langkah kerja Anda, satu kesalahan atau dugaan awal yang tidak tepat, dan bagaimana Anda memperbaikinya."></textarea><span class="sisken-help">Minimal 150 karakter. Gunakan bahasa sendiri, bukan jawaban generik.</span></div>
        <div class="sisken-field wide"><label>Tautan bukti penjelasan lisan 60–90 detik</label><input name="integrityEvidence" type="url" placeholder="https://drive.google.com/... atau tautan universitas"><span class="sisken-help">Rekam layar/objek yang diamati dan kertas bertuliskan kode verifikasi. Wajah tidak wajib terlihat. Pastikan dosen dapat membuka tautan.</span></div>
      </div>
      <label class="sisken-declare"><input type="checkbox" name="integrityDeclared"><span>Saya menyatakan bukti di atas berasal dari proses saya sendiri dan bersedia menjelaskan satu jawaban yang dipilih dosen secara lisan. Jika bukti tidak konsisten, nilai dapat ditahan untuk verifikasi.</span></label>
      <div class="sisken-integrity-status">Lengkapi seluruh bukti sebelum menekan Export HTML.</div>`;

    if (taskHero) taskHero.insertAdjacentElement('afterend', panel);
    else scoreBar.parentNode.insertBefore(panel, scoreBar);

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      Object.keys(saved).forEach(function (key) {
        const field = panel.querySelector('[name="' + key + '"]');
        if (!field) return;
        if (field.type === 'checkbox') field.checked = Boolean(saved[key]);
        else field.value = saved[key];
      });
    } catch (error) { /* local storage may be disabled */ }

    const nimInput = panel.querySelector('[name="integrityNim"]');
    const challenge = panel.querySelector('[data-challenge]');
    function persist() {
      const values = panelValues(panel);
      challenge.textContent = challengeFor(values.nim);
      try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch (error) { /* ignore */ }
    }
    panel.addEventListener('input', persist);
    panel.addEventListener('change', persist);
    nimInput.addEventListener('input', persist);
    persist();
  }

  function guardExports() {
    if (typeof window.exportTugasHtml === 'function' && !window.exportTugasHtml.__siskenGuarded) {
      const original = window.exportTugasHtml;
      const guarded = function () {
        const result = validatePanel(true);
        if (!result.ok) return false;
        return original.apply(this, arguments);
      };
      guarded.__siskenGuarded = true;
      window.exportTugasHtml = guarded;
    }

    if (!document.documentElement.dataset.siskenExportGuard) {
      document.documentElement.dataset.siskenExportGuard = 'active';
      document.addEventListener('click', function (event) {
        const target = event.target instanceof Element
          ? event.target.closest('#btn-score-export, .btn-export, [onclick*="exportTugasHtml"]')
          : null;
        if (!target) return;
        const result = validatePanel(true);
        if (!result.ok) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    }
  }

  window.SISKEN_INTEGRITY = {
    validate: validatePanel,
    context: context,
    label: label
  };

  function init() {
    addStyles();
    injectPlainGuide();
    injectIntegrityPanel();
    guardExports();
    window.setTimeout(guardExports, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
