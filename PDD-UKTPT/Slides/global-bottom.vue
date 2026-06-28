<!--
  global-bottom.vue — Footer global (tampil di semua slide).
  Slidev auto-load global-bottom.vue (sejajar global-top.vue), tak perlu registrasi.
  Ramping (30px), putih, garis PENUH (full-width) + aksen "kop dokumen" pita gradien.
  Kanan: teks "SERDOS 2026" (dipindah dari header).
  Aman thd kamera: pita footer (y kira-kira 522-552) berada DI BAWAH frame kamera
  (berakhir y kira-kira 488), jadi tak menutupi kamera meski selebar layar.
-->
<template>
  <footer class="pdd-ft" aria-hidden="true">
    <div class="pdd-ft-l">
      <span class="pdd-ft-mark"></span>
      <span class="pdd-ft-strong">PDD UKTPT</span>
      <span class="pdd-ft-dot">·</span>
      <span class="pdd-ft-soft">Bidang Pengajaran</span>
      <span class="pdd-ft-dot">·</span>
      <span class="pdd-ft-inst">Teknik Mesin · Universitas Mercu Buana</span>
    </div>
    <div class="pdd-ft-r">
      <span class="pdd-ft-year">SERDOS&nbsp;2026</span>
    </div>
  </footer>
</template>

<style scoped>
.pdd-ft {
  position: fixed; left: 0; bottom: 0; z-index: 95;
  width: 100%;
  height: 36px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 30px 0 30px;
  background: #ffffff;
  border-top: 1px solid #e7ebf2;
  font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, Inter, Arial, sans-serif;
  font-size: 11.5px; letter-spacing: 0.02em; color: #5b6b86;
  pointer-events: none;
}
/* Aksen "kop dokumen": pita gradien brand penuh di tepi ATAS footer (pasangan header). */
.pdd-ft::before {
  content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #15418f, #0f9d8f 60%, #f59e0b);
}
.pdd-ft-l { display: flex; align-items: center; gap: 8px; min-width: 0; }
.pdd-ft-mark {
  width: 7px; height: 7px; border-radius: 2px; flex: none;
  background: linear-gradient(135deg, #15418f, #0f9d8f);
}
.pdd-ft-strong {
  font-weight: 800; letter-spacing: 0.06em; color: #15418f; text-transform: uppercase;
}
.pdd-ft-soft { font-weight: 600; color: #5b6b86; }
.pdd-ft-dot { color: #cdd6e4; font-weight: 700; }
.pdd-ft-inst {
  font-weight: 600; color: #8c98ad; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.pdd-ft-r { display: flex; align-items: center; flex: none; padding-right: 6px; }
/* Teks "SERDOS 2026" (dipindah dari header) */
.pdd-ft-year {
  font-weight: 800; font-size: 11px; letter-spacing: 0.10em; color: #0f6e56;
  background: rgba(15, 157, 143, 0.10); border: 1px solid rgba(15, 157, 143, 0.24);
  padding: 2px 9px; border-radius: 999px; white-space: nowrap;
  transform: translateX(8px);
}
</style>
