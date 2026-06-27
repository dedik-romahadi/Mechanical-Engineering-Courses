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
    <svg class="cam-gear" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cam-gear-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00e5ff"/><stop offset="0.5" stop-color="#a78bfa"/><stop offset="1" stop-color="#fbbf24"/>
        </linearGradient>
      </defs>
      <g class="cam-gear-spin">
        <path d="M117.96,62.02 L116.51,73.05 L107.81,72.81 L103.71,83.24 L109.19,90.74 L102.42,99.56 L95.00,95.00 L86.23,101.98 L87.23,111.21 L76.96,115.47 L72.81,107.81 L61.73,109.47 L57.98,117.96 L46.95,116.51 L47.19,107.81 L36.76,103.71 L29.26,109.19 L20.44,102.42 L25.00,95.00 L18.02,86.23 L8.79,87.23 L4.53,76.96 L12.19,72.81 L10.53,61.73 L2.04,57.98 L3.49,46.95 L12.19,47.19 L16.29,36.76 L10.81,29.26 L17.58,20.44 L25.00,25.00 L33.77,18.02 L32.77,8.79 L43.04,4.53 L47.19,12.19 L58.27,10.53 L62.02,2.04 L73.05,3.49 L72.81,12.19 L83.24,16.29 L90.74,10.81 L99.56,17.58 L95.00,25.00 L101.98,33.77 L111.21,32.77 L115.47,43.04 L107.81,47.19 L109.47,58.27 Z"
          fill="none" stroke="url(#cam-gear-grad)" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        <circle cx="60" cy="60" r="41" fill="none" stroke="url(#cam-gear-grad)" stroke-width="1" stroke-dasharray="2 5" vector-effect="non-scaling-stroke" opacity="0.55"/>
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
/* Bingkai kamera = roda gigi tipis yang berputar pelan, warna selaras
   tema (gradien cyan→ungu→amber, sama seperti gear di header). */
.cam-gear {
  position: absolute;
  inset: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  z-index: 0;
  overflow: visible;
  filter: drop-shadow(0 0 4px rgba(124,77,255,.45));
}
.cam-gear-spin {
  transform-origin: 60px 60px;
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
