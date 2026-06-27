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
          d="M161.00,83.00 L158.34,103.19 L146.75,100.08 L140.16,116.00 L150.55,122.00 L138.15,138.15 L129.67,129.67 L116.00,140.16 L122.00,150.55 L103.19,158.34 L100.08,146.75 L83.00,149.00 L83.00,161.00 L62.81,158.34 L65.92,146.75 L50.00,140.16 L44.00,150.55 L27.85,138.15 L36.33,129.67 L25.84,116.00 L15.45,122.00 L7.66,103.19 L19.25,100.08 L17.00,83.00 L5.00,83.00 L7.66,62.81 L19.25,65.92 L25.84,50.00 L15.45,44.00 L27.85,27.85 L36.33,36.33 L50.00,25.84 L44.00,15.45 L62.81,7.66 L65.92,19.25 L83.00,17.00 L83.00,5.00 L103.19,7.66 L100.08,19.25 L116.00,25.84 L122.00,15.45 L138.15,27.85 L129.67,36.33 L140.16,50.00 L150.55,44.00 L158.34,62.81 L146.75,65.92 L149.00,83.00 Z M28.00,83.00 A55.0,55.0 0 1 0 138.00,83.00 A55.0,55.0 0 1 0 28.00,83.00 Z"/>
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
