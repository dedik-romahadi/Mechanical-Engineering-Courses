// Pengisi struktur kelas Teknik Tenaga Listrik di FAST Learning (Moodle course id 5923).
// Dijalankan dari konsol browser pada tab fast.mercubuana.ac.id yang sudah login sebagai dosen
// (memakai sesi dan sesskey yang ada; tidak ada kredensial di berkas ini).
//
// Apa yang dilakukan (pola Getaran/Opto/Math, desain Sisken):
//   1. Menamai tiap section pekan dan menaruh banner (Teknik-Tenaga-Listrik/Banner/*.html)
//      sebagai ringkasan section — banner diambil dari GitHub (raw) pada cabang BRANCH.
//   2. Membuat aktivitas lewat form "Add an activity" (bukan Duplicate) HANYA untuk
//      pertemuan yang disebut di `only` — kebijakan dosen: Attendance, Tugas, dan Forum
//      diberikan sesuai minggunya, bukan disiapkan sekaligus. Attendance (pekan TMV/TMK),
//      Tugas Modul N — Submit Hasil Export, Forum Modul N — Submit Hasil Copy Forum;
//      UTS/UAS — Submit Hasil Export pada pekan ujian.
//      Google Meet™ for Moodle dibuat terpisah lewat UI form pada pekannya (room dibuat plugin).
//   3. Idempoten: aktivitas yang namanya sudah ada di section itu dilewati.
//   Catatan: situs mewajibkan deskripsi aktivitas minimal 100 karakter.
//
// Pemakaian di konsol:
//   const s = document.createElement('script'); s.src = RAW + 'scripts/ttl-lms-poster.js'; document.head.append(s);
//   await ttlPoster.run({ sections: true });                              // banner + nama semua section
//   await ttlPoster.run({ sections: true, activities: true, only: [2] });  // pekan ke-2: banner + aktivitasnya
//   `activities: true` tanpa `only` ditolak supaya aktivitas tidak dibuat serentak.

(function () {
  const COURSE = 5923;
  const BRANCH = window.TTL_BRANCH || "main";
  const RAW = `https://raw.githubusercontent.com/dedik-romahadi/Mechanical-Engineering-Courses/${BRANCH}/`;
  const BANNER = RAW + "Teknik-Tenaga-Listrik/Banner/";

  // section number (urutan pekan) -> section id Moodle, pertemuan, tipe, tanggal Sabtu, modul
  const PLAN = [
    { sec: 0, id: 110262, p: 0, tipe: "INTRO", nama: null, banner: "Banner-Introduction.html" },
    { sec: 1, id: 110263, p: 1, tipe: "TMV", tgl: "2026-09-19", modul: 1, judul: "Konsep Dasar Sistem Tenaga Listrik" },
    { sec: 2, id: 110264, p: 2, tipe: "DARING", tgl: "2026-09-26", modul: 2, judul: "Komponen Sistem Tenaga Listrik" },
    { sec: 3, id: 110265, p: 3, tipe: "TMV", tgl: "2026-10-03", modul: 3, judul: "Daya pada Jaringan DC dengan Satu Sumber Tegangan" },
    { sec: 4, id: 110266, p: 4, tipe: "DARING", tgl: "2026-10-10", modul: 4, judul: "Daya pada Jaringan DC dengan Dua atau Lebih Sumber Tegangan" },
    { sec: 5, id: 110267, p: 5, tipe: "TMV", tgl: "2026-10-17", modul: 5, judul: "Daya pada Jaringan Listrik AC" },
    { sec: 6, id: 110268, p: 6, tipe: "DARING", tgl: "2026-10-24", modul: 6, judul: "Aliran Daya dan Transien pada Saluran Transmisi serta Kompensasi Reaktif" },
    { sec: 7, id: 110269, p: 7, tipe: "TMV", tgl: "2026-10-31", modul: 7, judul: "Reaktansi dan Impedansi di Sistem Tenaga Listrik" },
    { sec: 8, id: 110270, p: 8, tipe: "UTS", tgl: "2026-11-07", akhir: "2026-11-20" },
    { sec: 9, id: 110271, p: 8, tipe: "UTS2", tgl: "2026-11-14", akhir: "2026-11-20" },
    { sec: 10, id: 110272, p: 9, tipe: "TMV", tgl: "2026-11-21", modul: 8, judul: "Sistem Tenaga Listrik Saluran Transmisi" },
    { sec: 11, id: 110273, p: 10, tipe: "DARING", tgl: "2026-11-28", modul: 9, judul: "Pemodelan Saluran Transmisi" },
    { sec: 12, id: 110274, p: 11, tipe: "TMV", tgl: "2026-12-05", modul: 10, judul: "Kompensasi dalam Sistem Distribusi" },
    { sec: 13, id: 110275, p: 12, tipe: "DARING", tgl: "2026-12-12", modul: 11, judul: "Konsep dan Teori Dasar Sistem Distribusi Tenaga Listrik" },
    { sec: 14, id: 110276, p: 13, tipe: "TMV", tgl: "2026-12-19", modul: 12, judul: "Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi" },
    { sec: 15, id: 110277, p: 14, tipe: "DARING", tgl: "2026-12-26", modul: 13, judul: "Metode Single Line Diagram" },
    { sec: 16, id: 110278, p: 15, tipe: "TMV", tgl: "2027-01-02", modul: 14, judul: "Metode Analisis Aliran Daya (Load Flow)" },
    { sec: 17, id: 110279, p: 16, tipe: "UAS", tgl: "2027-01-09", akhir: "2027-01-22" },
    { sec: 18, id: 110280, p: 16, tipe: "UAS2", tgl: "2027-01-16", akhir: "2027-01-22" },
  ];

  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const d = (iso) => { const [y, m, dd] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const plus = (iso, n) => { const x = d(iso); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const panjang = (iso) => { const x = d(iso); return `${HARI[x.getUTCDay()]}, ${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
  const rentang = (a, b) => { const x = d(a), y = d(b); return x.getUTCMonth() === y.getUTCMonth() ? `${x.getUTCDate()}–${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}` : `${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} – ${y.getUTCDate()} ${BULAN[y.getUTCMonth()]} ${y.getUTCFullYear()}`; };
  const TIPE_NAMA = { TMV: "Tatap Muka Virtual", DARING: "Daring", TMK: "Tatap Muka Kelas" };

  const namaSection = (k) => {
    if (k.tipe === "UTS" || k.tipe === "UAS") return `Pertemuan ${k.p} · ${k.tipe} · ${rentang(k.tgl, k.akhir)} · jadwal sesuai SIA`;
    if (k.tipe === "UTS2" || k.tipe === "UAS2") return `Pekan ${k.tipe.slice(0, 3)} lanjutan · ${rentang(k.tgl, k.akhir)}`;
    return `Pertemuan ${k.p} · ${panjang(k.tgl)} · Modul ${k.modul} · ${TIPE_NAMA[k.tipe]}`;
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
    const cara = k.tipe === "TMV" ? "TMV melalui Google Meet" : "tatap muka di ruang B-304-2";
    return mform(add("attendance", k.sec), {
      name: `Attendance Pertemuan ${k.p} — ${k.tipe}`,
      "introeditor[text]": `<p>Kehadiran Pertemuan ${k.p} — ${panjang(k.tgl)}, pukul 12:00–13:40 WIB (${cara}). Modul ${k.modul}: ${k.judul}.</p>`,
      "introeditor[format]": 1,
      "grade[modgrade_type]": "point", "grade[modgrade_point]": 100,
    });
  }

  async function addAssign(k) {
    const due = plus(k.tgl, 6);
    return mform(add("assign", k.sec), {
      name: `Tugas Modul ${k.modul} — Submit Hasil Export`,
      "introeditor[text]": `<p>Unggah satu file HTML (.html) hasil export tugas Modul ${k.modul} (${k.judul}). Pastikan file dapat dibuka dan memuat jawaban serta bukti proses pengerjaan. Deadline: ${panjang(due)}, 23:59 WIB — sesudah itu poin setiap soal dipotong 35%.</p>`,
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
    const due = plus(k.tgl, 6);
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

  async function run({ sections = true, activities = false, only = null, dry = false } = {}) {
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
          if ((k.tipe === "TMV" || k.tipe === "TMK") && !has("attendance", `Attendance Pertemuan ${k.p} — ${k.tipe}`)) { if (!dry) await addAttendance(k); log.push(`+attendance P${k.p}`); }
          if (!has("assign", `Tugas Modul ${k.modul} — Submit Hasil Export`)) { if (!dry) await addAssign(k); log.push(`+assign M${k.modul}`); }
          if (!has("forum", `Forum Modul ${k.modul} — Submit Hasil Copy Forum`)) { if (!dry) await addForum(k); log.push(`+forum M${k.modul}`); }
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

  window.ttlPoster = { run, mform, existing, PLAN, namaSection, bannerFile, BANNER };
})();
