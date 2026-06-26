<template>
  <div v-if="$slidev.nav.currentPage !== 1" class="global-footer">
    <div class="footer-left">
      <span>Dedik Romahadi, S.T., M.Sc.</span>
      <span class="footer-sep">·</span>
      <span>Teknik Mesin Universitas Mercu Buana</span>
      <span class="footer-sep">·</span>
      <span class="footer-page">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
    <div class="footer-center">
      <span class="footer-dots">
        <span
          v-for="i in $slidev.nav.total"
          :key="i"
          class="footer-dot"
          :class="{ active: i === $slidev.nav.currentPage }"
        ></span>
      </span>
    </div>
    <!-- Pojok kanan bawah dikosongkan untuk ruang kamera terkunci. -->
    <div class="footer-right" style="min-width:150px"></div>
  </div>

  <!-- Ruang kamera (pojok kanan bawah) — panduan posisi overlay webcam. -->
  <div v-if="$slidev.nav.currentPage !== 1" class="cam-space" aria-hidden="true">
    <div class="cam-inner">
      <span class="cam-ic">📷</span>
      <span class="cam-lb">Kamera</span>
    </div>
  </div>
</template>

<style scoped>
.global-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #060c18;
  border-top: none;
  z-index: 100;
  font-size: 11px;
}
.global-footer::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%;
  animation: rule-slide 4s linear infinite;
}
@keyframes rule-slide {
  from { background-position: 0% 0%; }
  to   { background-position: 100% 0%; }
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  flex: 0 0 auto;
}
.footer-sep { color: #334155; }
.footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-dots { display: flex; gap: 4px; align-items: center; }
.footer-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  transition: background 0.2s;
}
.footer-dot.active {
  background: #a78bfa;
  width: 14px;
  border-radius: 3px;
}
.footer-right { flex: 0 0 auto; }
.footer-page {
  color: #00e5ff;
  font-weight: 700;
  font-size: 12px;
}

/* Ruang kamera 16:9 di pojok kanan bawah, di atas footer (32px).
   pointer-events:none agar tidak menghalangi interaksi konten di baliknya. */
.cam-space {
  position: fixed;
  /* Cocok dengan kamera bawaan Slidev: diameter = lebar kanvas (980) / 8
     ≈ innerWidth/8, posisi pojok kanan bawah ~30px margin (skala kanvas). */
  right: 18px;
  bottom: 18px;
  width: 122px;
  height: 122px;
  border: 1.5px dashed rgba(255,255,255,.18);
  border-radius: 50%;
  background: rgba(255,255,255,.02);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  pointer-events: none;
}
.cam-inner { display: flex; flex-direction: column; align-items: center; gap: 1px; opacity: .3; }
.cam-ic { font-size: 20px; line-height: 1; }
.cam-lb { font-size: 8.5px; letter-spacing: .08em; text-transform: uppercase; color: #cbd5e1; }
</style>
