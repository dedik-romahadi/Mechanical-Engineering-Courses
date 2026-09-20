// Pengisi struktur kelas Pemodelan Computer Aided Design (CAD) di FAST Learning
// (Moodle course id 4601, kelas Reguler 2 Selasa 19:30–22:00, kode SIA 2A2132FF).
// Dijalankan dari konsol browser pada tab fast.mercubuana.ac.id yang sudah login sebagai dosen
// (memakai sesi dan sesskey yang ada; tidak ada kredensial di berkas ini).
//
// Salinan pola scripts/ttl-lms-poster.js (Teknik Tenaga Listrik) untuk kelas CAD:
//   1. Menamai tiap section pekan dan menaruh banner (Pemodelan-Computer-Aided-Design/Banner/*.html)
//      sebagai ringkasan section — banner diambil dari GitHub (raw) pada cabang BRANCH.
//   2. Membuat aktivitas lewat form "Add an activity" (bukan Duplicate) HANYA untuk
//      pertemuan yang disebut di `only` — kebijakan dosen: Attendance, Tugas, dan Forum
//      diberikan sesuai minggunya, bukan disiapkan sekaligus. Attendance (pekan TMV),
//      Tugas Modul N — Submit Hasil Export, Forum Modul N — Submit Hasil Copy Forum;
//      UTS/UAS — Submit Hasil Export pada pekan ujian.
//      Google Meet™ for Moodle dibuat terpisah lewat UI form pada pekannya (room dibuat plugin).
//   3. Idempoten: aktivitas yang namanya sudah ada di section itu dilewati.
//   Catatan: situs mewajibkan deskripsi aktivitas minimal 100 karakter.
//
// Pemakaian di konsol:
//   const s = document.createElement('script'); s.src = RAW + 'scripts/cad-lms-poster.js'; document.head.append(s);
//   await cadPoster.run({ sections: true });                              // banner + nama semua section
//   await cadPoster.run({ sections: true, activities: true, only: [2] });  // pekan ke-2: banner + aktivitasnya
//   await cadPoster.run({ activities: true, only: [3], forum: false });    // pekan tanpa forum LMS
//   `activities: true` tanpa `only` ditolak supaya aktivitas tidak dibuat serentak.
//   Catatan dosen 19 Sep 2026 (TTL): pada pekan tertentu FAST tidak menerima forum
//   (form Forum kembali tanpa pesan); gunakan `forum: false` untuk pekan seperti itu.

(function () {
  const COURSE = 4601;
  const BRANCH = window.CAD_BRANCH || "main";
  const RAW = `https://raw.githubusercontent.com/dedik-romahadi/Mechanical-Engineering-Courses/${BRANCH}/`;
  const BANNER = RAW + "Pemodelan-Computer-Aided-Design/Banner/";

  // section number (urutan pekan) -> section id Moodle, pertemuan, tipe, tanggal Selasa, modul
  const PLAN = [
    { sec: 0, id: 75890, p: 0, tipe: "INTRO", nama: null, banner: "Banner-Introduction.html" },
    { sec: 1, id: 75891, p: 1, tipe: "TMV", tgl: "2026-09-15", modul: 1, judul: "Pengenalan FreeCAD dan Menggambar 2D", aktual: { tgl: "2026-09-20", jam: "20:00–22:00 WIB" } }, // TMV P1 dipindah ke Minggu malam (dosen, 20 Sep 2026)
    { sec: 2, id: 75892, p: 2, tipe: "DARING", tgl: "2026-09-22", modul: 2, judul: "Drafting dan Penyuntingan 2D: Trimex, Offset, Array, Layer, Dimensi" },
    { sec: 3, id: 75893, p: 3, tipe: "TMV", tgl: "2026-09-29", modul: 3, judul: "Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek" },
    { sec: 4, id: 75894, p: 4, tipe: "DARING", tgl: "2026-10-06", modul: 4, judul: "Dimensi, Anotasi, dan Format Gambar Teknik" },
    { sec: 5, id: 75895, p: 5, tipe: "TMV", tgl: "2026-10-13", modul: 5, judul: "Pemodelan 3D Berbasis Sketsa: Extrude, Revolve, Sweep" },
    { sec: 6, id: 75896, p: 6, tipe: "DARING", tgl: "2026-10-20", modul: 6, judul: "Sudut Pandang, Proyeksi, dan Manajemen Tampilan 3D" },
    { sec: 7, id: 75897, p: 7, tipe: "TMV", tgl: "2026-10-27", modul: 7, judul: "Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly" },
    { sec: 8, id: 75898, p: 8, tipe: "UTS", tgl: "2026-11-03", akhir: "2026-11-16" },
    { sec: 9, id: 75899, p: 8, tipe: "UTS2", tgl: "2026-11-10", akhir: "2026-11-16" },
    { sec: 10, id: 75900, p: 9, tipe: "TMV", tgl: "2026-11-17", modul: 8, judul: "Simulasi Kinerja Komponen: Tegangan, Termal, Kinematik" },
    { sec: 11, id: 75901, p: 10, tipe: "DARING", tgl: "2026-11-24", modul: 9, judul: "Evaluasi Hasil Simulasi dan Analisis Kekuatan" },
    { sec: 12, id: 75902, p: 11, tipe: "TMV", tgl: "2026-12-01", modul: 10, judul: "Optimasi Desain Pasca-Simulasi" },
    { sec: 13, id: 75903, p: 12, tipe: "DARING", tgl: "2026-12-08", modul: 11, judul: "Perakitan Komponen dan Analisis Sistem" },
    { sec: 14, id: 75904, p: 13, tipe: "TMV", tgl: "2026-12-15", modul: 12, judul: "Identifikasi Masalah Desain dan Solusi Optimasi" },
    { sec: 15, id: 75905, p: 14, tipe: "DARING", tgl: "2026-12-22", modul: 13, judul: "Prinsip Desain Berkelanjutan dalam CAD" },
    { sec: 16, id: 75906, p: 15, tipe: "TMV", tgl: "2026-12-29", modul: 14, judul: "Optimasi Desain untuk Efisiensi dan Lingkungan" },
    { sec: 17, id: 75907, p: 16, tipe: "UAS", tgl: "2027-01-05", akhir: "2027-01-18" },
    { sec: 18, id: 75908, p: 16, tipe: "UAS2", tgl: "2027-01-12", akhir: "2027-01-18" },
  ];

  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const d = (iso) => { const [y, m, dd] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const plus = (iso, n) => { const x = d(iso); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const panjang = (iso) => { const x = d(iso); return `${HARI[x.getUTCDay()]}, ${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
  const rentang = (a, b) => { const x = d(a), y = d(b); return x.getUTCMonth() === y.getUTCMonth() ? `${x.getUTCDate()}–${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}` : `${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} – ${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}`; };
  const TIPE_NAMA = { TMV: "Tatap Muka Virtual", DARING: "Daring" };
  const tglK = (k) => (k.aktual && k.aktual.tgl) || k.tgl;          // tanggal pelaksanaan (aktual menimpa kalender)
  const jamK = (k) => (k.aktual && k.aktual.jam) || "19:30–22:00 WIB";

  const namaSection = (k) => {
    if (k.tipe === "UTS" || k.tipe === "UAS") return `Pertemuan ${k.p} · ${k.tipe} · ${rentang(k.tgl, k.akhir)} · jadwal sesuai SIA`;
    if (k.tipe === "UTS2" || k.tipe === "UAS2") return `Pekan ${k.tipe.slice(0, 3)} lanjutan · ${rentang(k.tgl, k.akhir)}`;
    return `Pertemuan ${k.p} · ${panjang(tglK(k))} · Modul ${k.modul} · ${TIPE_NAMA[k.tipe]}`;
  };
  const bannerFile = (k) => k.banner || (k.modul ? `Banner-Pertemuan-${k.p}.html` : k.tipe.endsWith("2") ? `Banner-${k.tipe.slice(0, 3)}-Lanjutan.html` : `Banner-${k.tipe}.html`);

  // ---------- form helper: GET form, isi ulang semua field, timpa, POST ----------
  async function mform(url, overrides, { expectRedirect = true } = {}) {
    const abs = new URL(url, location.origin).href;
    const html = await (await fetch(abs, { credentials: "same-origin" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const form = [...doc.querySelectorAll("form")].find((f) => f.querySelector("[name=sesskey]"));
    if (!form) throw new Error("form tidak ditemukan: " + url);
    const fd = new FormData();
    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      if (el.type === "submit" || el.type === "button" || el.type === "image" || el.type === "file") continue;
      if (el.type === "checkbox" || el.type === "radio") { if (el.checked) fd.append(el.name, el.value); continue; }
      if (el.tagName === "SELECT") { for (const o of el.selectedOptions) fd.append(el.name, o.value); continue; }
      fd.append(el.name, el.value);
    }
    for (const [k, v] of Object.entries(overrides)) {
      fd.delete(k);
      if (v === null || v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => fd.append(k, String(x)));
    }
    // Moodle memproses form hanya bila nama tombol submit ikut terkirim
    // (modedit: submitbutton2 = "Save and return to course"; editsection: submitbutton).
    const submitName = /editsection\.php/.test(abs) ? "submitbutton" : "submitbutton2";
    if (!fd.has(submitName)) fd.append(submitName, "1");
    const action = new URL(form.getAttribute("action") || abs, abs).href;
    const res = await fetch(action, { method: "POST", credentials: "same-origin", body: fd, redirect: "follow" });
    const text = await res.text();
    const back = /modedit\.php|editsection\.php/.test(res.url);
    if (expectRedirect && back) {
      const rdoc = new DOMParser().parseFromString(text, "text/html");
      const errs = [...rdoc.querySelectorAll(".form-control-feedback, .invalid-feedback, .alert-danger, .error, .errormessage")].map((e) => e.textContent.trim()).filter(Boolean);
      throw new Error("form ditolak (" + res.url + "): " + (errs.join(" | ").slice(0, 400) || "tanpa pesan"));
    }
    return { url: res.url, ok: res.ok };
  }

  const dateFields = (prefix, iso, hour, minute) => {
    const x = d(iso);
    return { [`${prefix}[enabled]`]: 1, [`${prefix}[day]`]: x.getUTCDate(), [`${prefix}[month]`]: x.getUTCMonth() + 1, [`${prefix}[year]`]: x.getUTCFullYear(), [`${prefix}[hour]`]: hour, [`${prefix}[minute]`]: minute };
  };

  // ---------- pembacaan kondisi saat ini (idempotensi) ----------
  async function existing() {
    const html = await (await fetch(`/course/view.php?id=${COURSE}`, { credentials: "same-origin" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const map = {};
    doc.querySelectorAll("li.section, li.course-section").forEach((s) => {
      const id = Number(s.getAttribute("data-id"));
      map[id] = [...s.querySelectorAll("li.activity")].map((a) => ({
        cmid: Number((a.id || "").replace("module-", "")),
        type: ([...a.classList].find((c) => c.startsWith("modtype_")) || "").replace("modtype_", ""),
        name: (a.querySelector(".instancename")?.childNodes[0]?.textContent || "").trim(),
      }));
    });
    return map;
  }

  // ---------- section: nama + banner ----------
  async function pushSection(k) {
    const banner = await (await fetch(BANNER + bannerFile(k) + "?t=" + Date.now())).text();
    if (!/^<!--|^<div/.test(banner.trim())) throw new Error("banner tidak valid: " + bannerFile(k));
    const over = { "summary_editor[text]": banner, "summary_editor[format]": 1 };
    if (k.nama !== null) over.name = k.nama || namaSection(k);
    await mform(`/course/editsection.php?id=${k.id}&sr=0`, over);
    return `section ${k.id} ← ${bannerFile(k)}`;
  }

  // ---------- aktivitas ----------
  const add = (mod, sec) => `/course/modedit.php?add=${mod}&type=&course=${COURSE}&section=${sec}&return=0&sr=0`;

  async function addAttendance(k) {
    return mform(add("attendance", k.sec), {
      name: `Attendance Pertemuan ${k.p} — ${k.tipe}`,
      "introeditor[text]": `<p>Kehadiran Pertemuan ${k.p} — ${panjang(tglK(k))}, pukul ${jamK(k)} (TMV melalui Google Meet). Modul ${k.modul}: ${k.judul}.</p>`,
      "introeditor[format]": 1,
      "grade[modgrade_type]": "point", "grade[modgrade_point]": 100,
    });
  }

  async function addAssign(k) {
    const due = plus(tglK(k), 6);
    return mform(add("assign", k.sec), {
      name: `Tugas Modul ${k.modul} — Submit Hasil Export`,
      "introeditor[text]": `<p>Unggah satu file HTML (.html) hasil export tugas Modul ${k.modul} (${k.judul}). Berkas .FCStd tiap tugas pemodelan diunggah di halaman modul, bukan di sini. Pastikan file dapat dibuka dan memuat jawaban serta bukti proses pengerjaan. Deadline: ${panjang(due)}, 23:59 WIB — sesudah itu poin setiap soal dipotong 35%.</p>`,
      "introeditor[format]": 1,
      "allowsubmissionsfromdate[enabled]": null,
      ...dateFields("duedate", due, 23, 59),
      "cutoffdate[enabled]": null,
      "gradingduedate[enabled]": null,
      assignsubmission_file_enabled: 1, assignsubmission_onlinetext_enabled: null,
      assignsubmission_file_maxfiles: 1, "assignsubmission_file_filetypes[filetypes]": ".html",
      assignfeedback_comments_enabled: 1,
      maxattempts: 1,
      "grade[modgrade_type]": "point", "grade[modgrade_point]": 100,
    });
  }

  async function addExamAssign(k) {
    return mform(add("assign", k.sec), {
      name: `${k.tipe} — Submit Hasil Export`,
      "introeditor[text]": `<p>Unggah satu file HTML (.html) hasil export ${k.tipe === "UTS" ? "Ujian Tengah Semester" : "Ujian Akhir Semester"}. Masa ${k.tipe}: ${rentang(k.tgl, k.akhir)}; hari dan jam ujian mengikuti jadwal resmi di web SIA. Kumpulkan sebelum fase perpanjangan berakhir.</p>`,
      "introeditor[format]": 1,
      "allowsubmissionsfromdate[enabled]": null, "duedate[enabled]": null, "cutoffdate[enabled]": null, "gradingduedate[enabled]": null,
      assignsubmission_file_enabled: 1, assignsubmission_onlinetext_enabled: null,
      assignsubmission_file_maxfiles: 1, "assignsubmission_file_filetypes[filetypes]": ".html",
      assignfeedback_comments_enabled: 1, maxattempts: 1,
      "grade[modgrade_type]": "point", "grade[modgrade_point]": 100,
    });
  }

  async function addForum(k) {
    const due = plus(tglK(k), 6);
    return mform(add("forum", k.sec), {
      name: `Forum Modul ${k.modul} — Submit Hasil Copy Forum`,
      "introeditor[text]": `<p>Gunakan forum ini untuk mengirim hasil diskusi Modul ${k.modul}. Di halaman modul, isi seluruh pertanyaan diskusi lalu klik tombol <strong>Copy Forum (kode HTML)</strong> — kode jawaban Anda otomatis tersalin. Buat satu posting di forum ini: pada editor, klik tombol <strong>&lt;/&gt; HTML</strong> untuk beralih ke mode HTML, kemudian paste kode tersebut. Tidak perlu melampirkan file. Deadline: ${panjang(due)}, 23:59 WIB.</p>`,
      "introeditor[format]": 1,
      type: "single",
      ...dateFields("duedate", due, 23, 59),
      "cutoffdate[enabled]": null,
      maxattachments: 1,
    });
  }

  async function run({ sections = true, activities = false, only = null, dry = false, forum = true } = {}) {
    const log = [];
    if (activities && !only) throw new Error("activities:true membutuhkan only:[nomor pertemuan] — aktivitas dibuat per pekan");
    const cur = await existing();
    for (const k of PLAN) {
      if (only && !only.includes(k.p)) continue;
      const have = (cur[k.id] || []);
      const has = (type, name) => have.some((a) => a.type === type && a.name === name);
      try {
        if (sections) { log.push(dry ? `[dry] section ${k.id}` : await pushSection(k)); }
        if (activities && k.modul) {
          if (k.tipe === "TMV" && !has("attendance", `Attendance Pertemuan ${k.p} — ${k.tipe}`)) { if (!dry) await addAttendance(k); log.push(`+attendance P${k.p}`); }
          if (!has("assign", `Tugas Modul ${k.modul} — Submit Hasil Export`)) { if (!dry) await addAssign(k); log.push(`+assign M${k.modul}`); }
          if (forum && !has("forum", `Forum Modul ${k.modul} — Submit Hasil Copy Forum`)) { if (!dry) await addForum(k); log.push(`+forum M${k.modul}`); }
        }
        if (activities && (k.tipe === "UTS" || k.tipe === "UAS") && !has("assign", `${k.tipe} — Submit Hasil Export`)) { if (!dry) await addExamAssign(k); log.push(`+assign ${k.tipe}`); }
      } catch (e) {
        log.push(`!! P${k.p} (${k.tipe}): ${e.message}`);
        console.error(e);
        break; // berhenti pada kesalahan pertama supaya tidak menumpuk aktivitas setengah jadi
      }
    }
    return log;
  }

  window.cadPoster = { run, mform, existing, PLAN, namaSection, bannerFile, BANNER };
})();
