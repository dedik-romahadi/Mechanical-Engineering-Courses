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
        <linearGradient id="cam-gear-grad" x1="0" y1="0" x2="166" y2="166" gradientUnits="userSpaceOnUse">
          <animateTransform attributeName="gradientTransform" type="rotate"
            values="0 83 83;360 83 83" dur="9s" repeatCount="indefinite"/>
          <stop offset="0" stop-color="#0c4a5a">
            <animate attributeName="stop-color" dur="8s" repeatCount="indefinite"
              values="#0c4a5a;#2e2168;#6b4f16;#0c4a5a"/>
          </stop>
          <stop offset="0.5" stop-color="#2e2168">
            <animate attributeName="stop-color" dur="8s" repeatCount="indefinite"
              values="#2e2168;#6b4f16;#0c4a5a;#2e2168"/>
          </stop>
          <stop offset="1" stop-color="#6b4f16">
            <animate attributeName="stop-color" dur="8s" repeatCount="indefinite"
              values="#6b4f16;#0c4a5a;#2e2168;#6b4f16"/>
          </stop>
        </linearGradient>
      </defs>
      <g class="cam-gear-spin">
        <path fill-rule="evenodd" fill="url(#cam-gear-grad)" stroke="rgba(255,255,255,.18)" stroke-width="0.6"
          d="M160.95,85.72 L159.00,100.55 L146.75,100.08 L141.27,113.99 L149.15,124.33 L140.05,136.20 L129.67,129.67 L117.97,138.97 L119.62,151.87 L105.80,157.59 L100.08,146.75 L85.30,148.96 L80.28,160.95 L65.45,159.00 L65.92,146.75 L52.01,141.27 L41.67,149.15 L29.80,140.05 L36.33,129.67 L27.03,117.97 L14.13,119.62 L8.41,105.80 L19.25,100.08 L17.04,85.30 L5.05,80.28 L7.00,65.45 L19.25,65.92 L24.73,52.01 L16.85,41.67 L25.95,29.80 L36.33,36.33 L48.03,27.03 L46.38,14.13 L60.20,8.41 L65.92,19.25 L80.70,17.04 L85.72,5.05 L100.55,7.00 L100.08,19.25 L113.99,24.73 L124.33,16.85 L136.20,25.95 L129.67,36.33 L138.97,48.03 L151.87,46.38 L157.59,60.20 L146.75,65.92 L148.96,80.70 Z M28.00,83.00 A55.0,55.0 0 1 0 138.00,83.00 A55.0,55.0 0 1 0 28.00,83.00 Z"/>
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
  filter: drop-shadow(0 0 5px rgba(124,77,255,.5));
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
