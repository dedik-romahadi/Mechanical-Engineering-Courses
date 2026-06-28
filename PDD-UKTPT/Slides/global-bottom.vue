<!--
  global-bottom.vue — Footer global (tampil di semua slide).
  Slidev auto-load global-bottom.vue (sejajar global-top.vue) — tak perlu registrasi.
  Ramping (30px), putih, garis PENUH (full-width) + aksen "kop dokumen" pita gradien.
  Aman thd kamera: pita footer (y≈522-552) berada DI BAWAH frame kamera (berakhir y≈488),
  jadi tak menutupi kamera meski selebar layar.
-->
<template>
  <footer class="pdd-ft" aria-hidden="true">
    <div class="pdd-ft-l">
      <span class="pdd-ft-mark"></span>
      <span class="pdd-ft-strong">PDD UKTPT</span>
      <span class="pdd-ft-sep">—</span>
      <span class="pdd-ft-soft">Bidang Pengajaran</span>
      <span class="pdd-ft-dot">·</span>
      <span class="pdd-ft-inst">Teknik Mesin · Universitas Mercu Buana</span>
    </div>
    <div class="pdd-ft-r">
      <svg class="pdd-ft-gears" viewBox="0 0 41 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sertifikasi Dosen 2026">
        <g class="pdd-g pdd-g-a"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.72L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.72C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.28L4.34,18.73C4.46,18.95 4.73,19.05 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.05 19.54,18.95 19.66,18.73L21.66,15.28C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" fill="#15418f"/></g>
        <g transform="translate(17,0)"><g class="pdd-g pdd-g-b"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.72L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.72C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.28L4.34,18.73C4.46,18.95 4.73,19.05 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.05 19.54,18.95 19.66,18.73L21.66,15.28C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" fill="#0f9d8f"/></g></g>
      </svg>
    </div>
  </footer>
</template>

<style scoped>
.pdd-ft {
  position: fixed; left: 0; bottom: 0; z-index: 95;
  width: 100%;
  height: 30px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 30px 0 30px;
  background: #ffffff;
  border-top: 1px solid #e7ebf2;
  font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, Inter, Arial, sans-serif;
  font-size: 10.5px; letter-spacing: 0.02em; color: #5b6b86;
  pointer-events: none;
}
/* Aksen "kop dokumen": pita gradien brand tipis di tepi ATAS footer (pasangan header). */
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
.pdd-ft-sep { color: #cdd6e4; }
.pdd-ft-soft { font-weight: 600; color: #5b6b86; }
.pdd-ft-dot { color: #cdd6e4; font-weight: 700; }
.pdd-ft-inst {
  font-weight: 600; color: #8c98ad; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.pdd-ft-r { display: flex; align-items: center; flex: none; padding-right: 6px; }
/* Sepasang gear meshing — animasi (ganti teks "SERDOS 2026") */
.pdd-ft-gears { height: 22px; width: auto; display: block; overflow: visible; }
.pdd-g { transform-box: fill-box; transform-origin: center; }
.pdd-g-a { animation: pdd-gear 6s linear infinite; }
.pdd-g-b { animation: pdd-gear-rev 6s linear infinite; animation-delay: -0.375s; }
@keyframes pdd-gear { to { transform: rotate(360deg); } }
@keyframes pdd-gear-rev { to { transform: rotate(-360deg); } }
@media (prefers-reduced-motion: reduce) { .pdd-g-a, .pdd-g-b { animation: none; } }
</style>
