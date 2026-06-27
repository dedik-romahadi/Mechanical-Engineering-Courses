<template>
  <div v-if="$slidev.nav.currentPage !== 1" class="global-footer">
    <div class="footer-left">
      <span>Dedik Romahadi, S.T., M.Sc.</span>
      <span class="footer-sep">·</span>
      <span>Teknik Mesin Universitas Mercu Buana</span>
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
    <div class="footer-right">
      <span class="footer-page">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>

  <!-- Ruang kamera (pojok kanan bawah) — panduan posisi overlay webcam. -->
  <div v-if="$slidev.nav.currentPage !== 1" class="cam-space" aria-hidden="true">
    <svg class="cam-gear" viewBox="0 0 166 166" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradien logam (baja): pita terang–gelap bergantian (kilau metal),
             arah disapu berputar agar pantulan cahaya bergerak dinamik. -->
        <linearGradient id="cam-gear-grad" x1="0" y1="0" x2="166" y2="166" gradientUnits="userSpaceOnUse">
          <animateTransform attributeName="gradientTransform" type="rotate"
            values="0 83 83;360 83 83" dur="7s" repeatCount="indefinite"/>
          <stop offset="0"    stop-color="#39414f"/>
          <stop offset="0.16" stop-color="#aab7cb"/>
          <stop offset="0.3"  stop-color="#525c6d"/>
          <stop offset="0.5"  stop-color="#eef3fb"/>
          <stop offset="0.64" stop-color="#5a6577"/>
          <stop offset="0.82" stop-color="#9aa6bb"/>
          <stop offset="1"    stop-color="#333a47"/>
        </linearGradient>
      </defs>
      <g class="cam-gear-spin">
        <path fill-rule="evenodd" fill="url(#cam-gear-grad)" stroke="#161b24" stroke-width="0.8" stroke-linejoin="round"
          d="M148.19,72.68 L160.70,76.20 L160.70,89.80 L148.19,93.32 L144.62,106.65 L153.69,115.96 L146.89,127.74 L134.29,124.54 L124.54,134.29 L127.74,146.89 L115.96,153.69 L106.65,144.62 L93.32,148.19 L89.80,160.70 L76.20,160.70 L72.68,148.19 L59.35,144.62 L50.04,153.69 L38.26,146.89 L41.46,134.29 L31.71,124.54 L19.11,127.74 L12.31,115.96 L21.38,106.65 L17.81,93.32 L5.30,89.80 L5.30,76.20 L17.81,72.68 L21.38,59.35 L12.31,50.04 L19.11,38.26 L31.71,41.46 L41.46,31.71 L38.26,19.11 L50.04,12.31 L59.35,21.38 L72.68,17.81 L76.20,5.30 L89.80,5.30 L93.32,17.81 L106.65,21.38 L115.96,12.31 L127.74,19.11 L124.54,31.71 L134.29,41.46 L146.89,38.26 L153.69,50.04 L144.62,59.35 Z M28.00,83.00 A55.0,55.0 0 1 0 138.00,83.00 A55.0,55.0 0 1 0 28.00,83.00 Z"/>
      </g>
    </svg>
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
  bottom: 45px;
  width: 122px;
  height: 122px;
  border-radius: 50%;
  background: rgba(255,255,255,.02);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  pointer-events: none;
}
/* Bingkai kamera = roda gigi SOLID yang berputar pelan, warna selaras tema
   (gradien cyan→ungu→amber). Lebih besar dari lingkaran webcam (122px) agar
   gigi-giginya tetap terlihat mengelilingi kamera saat webcam menyala. */
.cam-gear {
  position: absolute;
  /* SVG 166px dipusatkan pada .cam-space 122px → inset (122-166)/2 = -22px */
  inset: -22px;
  width: 166px;
  height: 166px;
  z-index: 0;
  overflow: visible;
  /* bayangan gelap tipis untuk kesan logam timbul (bukan glow buram) */
  filter: drop-shadow(0 1px 2px rgba(0,0,0,.65));
}
.cam-gear-spin {
  transform-origin: 83px 83px;
  animation: cam-gear-spin 16s linear infinite;
}
@keyframes cam-gear-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.cam-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; opacity: .3; }
.cam-ic { font-size: 20px; line-height: 1; }
.cam-lb { font-size: 8.5px; letter-spacing: .08em; text-transform: uppercase; color: #cbd5e1; }
</style>
