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
      <button class="cam-btn" :class="{ on: camOn }" @click.stop="toggleCam" :title="camOn ? 'Matikan kamera' : 'Nyalakan kamera'">📷</button>
      <span class="footer-page">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>

  <!-- Ruang kamera (pojok kanan bawah) — tampil di semua slide termasuk cover. -->
  <div class="cam-space" aria-hidden="true">
    <video ref="camVideo" class="cam-video" v-show="camOn" autoplay muted playsinline></video>
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
          d="M148.19,72.68 L156.72,76.55 L156.72,89.45 L148.19,93.32 L144.62,106.65 L150.07,114.27 L143.62,125.44 L134.29,124.54 L124.54,134.29 L125.44,143.62 L114.27,150.07 L106.65,144.62 L93.32,148.19 L89.45,156.72 L76.55,156.72 L72.68,148.19 L59.35,144.62 L51.73,150.07 L40.56,143.62 L41.46,134.29 L31.71,124.54 L22.38,125.44 L15.93,114.27 L21.38,106.65 L17.81,93.32 L9.28,89.45 L9.28,76.55 L17.81,72.68 L21.38,59.35 L15.93,51.73 L22.38,40.56 L31.71,41.46 L41.46,31.71 L40.56,22.38 L51.73,15.93 L59.35,21.38 L72.68,17.81 L76.55,9.28 L89.45,9.28 L93.32,17.81 L106.65,21.38 L114.27,15.93 L125.44,22.38 L124.54,31.71 L134.29,41.46 L143.62,40.56 L150.07,51.73 L144.62,59.35 Z M23.00,83.00 A60.0,60.0 0 1 0 143.00,83.00 A60.0,60.0 0 1 0 23.00,83.00 Z"/>
      </g>
    </svg>
    <div class="cam-inner" v-show="!camOn">
      <span class="cam-ic">📷</span>
      <span class="cam-lb">Kamera</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// Webcam terkunci di .cam-space (bingkai roda gigi). Tombol nyala/mati di footer.
const camVideo = ref(null)
const camOn = ref(false)
let stream = null

function attach() {
  if (camVideo.value && stream) camVideo.value.srcObject = stream
}
async function startCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    camOn.value = true
    attach()
    try { localStorage.setItem('opto-cam-on', '1') } catch (e) {}
  } catch (e) {
    stream = null
    camOn.value = false
  }
}
function stopCam() {
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null }
  if (camVideo.value) camVideo.value.srcObject = null
  camOn.value = false
  try { localStorage.setItem('opto-cam-on', '0') } catch (e) {}
}
function toggleCam() {
  camOn.value ? stopCam() : startCam()
}

// Pasang ulang stream bila elemen video di-mount ulang (mis. balik dari slide 1).
watch(camVideo, () => attach())

onMounted(() => {
  let saved = '0'
  try { saved = localStorage.getItem('opto-cam-on') || '0' } catch (e) {}
  if (saved === '1') startCam()
})
onBeforeUnmount(stopCam)
</script>

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
.footer-right { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
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
  z-index: 1;
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
.cam-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 1px; opacity: .3; }
.cam-ic { font-size: 20px; line-height: 1; }
.cam-lb { font-size: 8.5px; letter-spacing: .08em; text-transform: uppercase; color: #cbd5e1; }

/* Webcam terkunci: mengisi lingkaran 122px, di belakang bingkai roda gigi. */
.cam-video {
  position: absolute; top: 50%; left: 50%; width: 124px; height: 124px;
  border-radius: 50%; object-fit: cover; z-index: 0;
  transform: translate(-50%, -50%) rotateY(180deg); background: #06091a;
}

/* Tombol nyala/mati kamera (footer kanan). */
.cam-btn {
  background: transparent; border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 6px; padding: 0 6px; height: 18px; line-height: 1;
  font-size: 11px; cursor: pointer; color: #cbd5e1; opacity: .65;
  pointer-events: auto; transition: opacity .15s, border-color .15s, color .15s;
}
.cam-btn:hover { opacity: 1; border-color: #38bdf8; }
.cam-btn.on { opacity: 1; border-color: #34d399; color: #34d399; }
</style>
