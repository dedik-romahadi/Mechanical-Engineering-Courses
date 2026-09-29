// Penguji galat animasi kanvas modul TTL, dijalankan periksa_animasi_chrome.py di Chrome headless.
// requestAnimationFrame sudah dimatikan SEBELUM skrip animasi dimuat (lihat halaman uji), jadi
// setiap panggilan fungsi gambar = tepat satu bingkai dan hasil setiap jalan sama.
// Untuk tiap kanvas di _TTL_DAFTAR (Modul 1: daftar cadangan __DAFTAR_CADANGAN) dan tiap keadaan
// di UJI_KEADAAN (kanvas tersembunyi seperti saat tab Forum/Tugas/Hasil dibuka, lebar 0, lebar
// kanvas nyata 1000..204, lebar sangat sempit):
//   1) BERJALAN: UJI_BINGKAI bingkai pada tiga keadaan slider (bawaan, semua min, semua maks);
//   2) DIJEDA (_ttlJeda[nama] = true, seperti _ttlGambarUlang saat resize dari tab lain): kisi
//      nilai slider min/tengah/maks (3^k kombinasi, dibatasi 81; bila lebih, tiap slider sendiri).
// Setiap exception yang keluar dari fungsi gambar dicatat (sekali per keadaan dan jenis pesan);
// exception di dalam callback requestAnimationFrame di halaman sungguhan menghentikan animasinya.
window.addEventListener('load', () => {
  const DAFTAR = (typeof _TTL_DAFTAR !== 'undefined' && _TTL_DAFTAR.length) ? _TTL_DAFTAR : (window.__DAFTAR_CADANGAN || []);
  const KEADAAN = window.UJI_KEADAAN || [];
  const BINGKAI = window.UJI_BINGKAI || 120;
  const pm = document.getElementById('page-modul');
  const jeda = window._ttlJeda || (window._ttlJeda = {});
  // Kunci pengelompokan pesan: angka disamarkan, dan awalan "Failed to execute 'arc' on ...: " dibuang
  // karena Chrome kadang melempar pesan yang sama tanpa awalan itu (jalur panggilan cepat V8).
  const norm = s => String(s).replace(/Failed to execute '[^']*' on '[^']*': /, '').replace(/-?\d+(\.\d+)?(e[-+]?\d+)?/gi, '#');
  const hasil = { mulai: (window.__galatMulai || []).slice(), kanvas: {} };
  for (const [id, gambar, nama, slider] of DAFTAR) {
    const r = { galat: [], peringatan: [], panggilan: 0 };
    hasil.kanvas[id] = r;
    const cv = document.getElementById(id);
    if (!cv) { r.galat.push('kanvas tidak ada di materi'); continue; }
    const hilang = (slider || []).filter(s => !document.getElementById(s));
    if (hilang.length) r.galat.push('slider tidak ada di materi: ' + hilang.join(', '));
    const els = (slider || []).map(s => document.getElementById(s)).filter(Boolean);
    const awal = els.map(e => e.value);
    const tiga = e => { const mn = +e.min, mx = +e.max, st = +e.step || 1; return [String(mn), String(mn + Math.round((mx - mn) / 2 / st) * st), String(mx)]; };
    let kisi = [[]];
    for (const e of els) { const baru = []; for (const k of kisi) for (const v of tiga(e)) baru.push([...k, v]); kisi = baru; }
    if (kisi.length > 81) {
      kisi = [els.map(e => tiga(e)[0]), els.map(e => tiga(e)[1]), els.map(e => tiga(e)[2])];
      els.forEach((e, i) => tiga(e).forEach(v => { const k = awal.slice(); k[i] = v; kisi.push(k); }));
    }
    const status = { bawaan: awal, min: els.map(e => e.min), maks: els.map(e => e.max) };
    const catat = new Map();
    for (const K of KEADAAN) {
      if (K.sembunyi) { pm.style.display = ''; cv.style.width = ''; if (K.buffer) cv.width = K.buffer; pm.style.display = 'none'; }
      else { pm.style.display = ''; cv.style.width = K.lebar + 'px'; }
      const coba = kode => {
        r.panggilan++;
        try { gambar(); } catch (e) {
          const pesan = (e && e.name ? e.name + ': ' : '') + String(e && e.message || e);
          const kunci = K.label + '|' + norm(pesan);
          if (!catat.has(kunci)) catat.set(kunci, { K, kode, pesan: pesan.slice(0, 200) });
        }
      };
      jeda[nama] = false;
      for (const [kode, nilai] of Object.entries(status)) {
        els.forEach((e, i) => { e.value = nilai[i]; });
        for (let f = 0; f < BINGKAI; f++) coba(`jalan ${kode}, bingkai ${f + 1}`);
      }
      jeda[nama] = true;
      for (const nilai of kisi) { els.forEach((e, i) => { e.value = nilai[i]; }); coba(`jeda ${nilai.join('/') || '-'}`); }
      jeda[nama] = false;
    }
    pm.style.display = ''; cv.style.width = '';
    els.forEach((e, i) => { e.value = awal[i]; });
    for (const { K, kode, pesan } of catat.values()) (K.wajib ? r.galat : r.peringatan).push(`${K.label} (${kode}): ${pesan}`);
  }
  hasil.jumlah = DAFTAR.length;
  const pre = document.createElement('pre');
  pre.textContent = 'DA' + 'TA>>' + JSON.stringify(hasil) + '<<DA' + 'TA';
  document.body.appendChild(pre);
});
