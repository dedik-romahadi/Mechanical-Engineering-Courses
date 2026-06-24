<!--
  global-top.vue — Header global untuk slide 2+.
  Judul topik tiap slide (route.meta.slide.title) ditampilkan secara dinamis
  dengan garis aksen di kiri DAN kanan, posisi benar-benar di tengah.
-->
<template>
  <div v-if="show" class="gh">
    <div class="gh-inner">
      <!-- Brand (kiri) -->
      <div class="gh-brand">
        <div class="gh-logo-wrap">
          <img src="/UMB.png" class="gh-logo" alt="UMB" />
        </div>
        <div class="gh-brand-text">
          <span class="gh-brand-name">GETARAN MEKANIK</span>
          <span class="gh-brand-sub">Fourier Transform · UMB</span>
        </div>
      </div>

      <!-- Topik: truly centered via absolute positioning -->
      <div class="gh-topic">
        <span class="gh-bar"></span>
        <transition name="gh-swap" mode="out-in">
          <svg v-if="isClosing" key="wave" class="gh-wave" viewBox="0 0 140 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q 8.75 2 17.5 10 T 35 10 T 52.5 10 T 70 10 T 87.5 10 T 105 10 T 122.5 10 T 140 10" stroke="url(#ghw)" stroke-width="2.2" stroke-linecap="round"/>
            <defs><linearGradient id="ghw" x1="0" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00e5ff"/><stop offset="0.5" stop-color="#a78bfa"/><stop offset="1" stop-color="#fbbf24"/>
            </linearGradient></defs>
          </svg>
          <span v-else class="gh-title" :key="page">{{ title }}</span>
        </transition>
        <span class="gh-bar"></span>
      </div>

      <!-- Gear icon (kanan) -->
      <div class="gh-index">
        <span class="gh-eq">
          <i v-for="(b, k) in 6" :key="k"></i>
        </span>
        <svg class="gh-gear" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="gear-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00e5ff"/>
              <stop offset="0.5" stop-color="#a78bfa"/>
              <stop offset="1" stop-color="#fbbf24"/>
            </linearGradient>
          </defs>
          <path fill="url(#gear-grad)" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.72L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.72C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.28L4.34,18.73C4.46,18.95 4.73,19.05 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.05 19.54,18.95 19.66,18.73L21.66,15.28C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
      </div>
    </div>
    <div class="gh-rule"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { currentPage, total, currentSlideRoute } = useNav()

const page = currentPage
const show = computed(() => currentPage.value !== 1)
const title = computed(
  () => currentSlideRoute.value?.meta?.slide?.title || 'Analisis Getaran Berbasis Fourier Transform',
)
// Slide penutup: judul header diganti animasi gelombang (relevan tema getaran).
const isClosing = computed(() => title.value === 'Terima Kasih')
function pad(n) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.gh {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 44px;
  z-index: 100;
  background:
    radial-gradient(120% 180% at 50% -60%, rgba(124,77,255,0.14), transparent 60%),
    linear-gradient(90deg, #060c18 0%, #0d1526 50%, #060c18 100%);
}
.gh-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}
.gh-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  z-index: 1;
}
.gh-logo-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  background: radial-gradient(circle at 50% 30%, #0d1526, #060c18);
  border: 1px solid rgba(124,77,255,0.45);
  box-shadow: 0 0 10px rgba(124,77,255,0.22), inset 0 1px 2px rgba(0,0,0,0.5);
}
.gh-logo { height: 21px; width: auto; object-fit: contain; }
.gh-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.gh-brand-name {
  font-size: 11px; font-weight: 800; letter-spacing: 0.13em; color: #a78bfa;
}
.gh-brand-sub { font-size: 9px; letter-spacing: 0.05em; color: #475569; text-transform: uppercase; }
.gh-topic {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 56%;
  pointer-events: none;
}
.gh-bar {
  flex: none;
  width: 3px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00e5ff, #7c4dff);
  box-shadow: 0 0 8px rgba(124,77,255,0.7);
}
.gh-title {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 8px rgba(0,0,0,0.6);
}
.gh-wave {
  width: 140px; height: 20px;
  filter: drop-shadow(0 0 5px rgba(0,229,255,.5));
}
.gh-wave path {
  stroke-dasharray: 8 6;
  animation: gh-flow 1.2s linear infinite;
}
@keyframes gh-flow { to { stroke-dashoffset: -28; } }
.gh-index {
  display: flex; align-items: center; gap: 9px;
  flex: 0 0 auto; z-index: 1;
}
.gh-eq {
  display: flex; align-items: center; gap: 2.5px; height: 16px;
}
.gh-eq i {
  display: block; width: 2.5px; border-radius: 2px;
  background: linear-gradient(180deg, #00e5ff, #7c4dff);
  transform-origin: center;
  animation: gh-eq 1.15s ease-in-out infinite;
}
.gh-eq i:nth-child(1) { height: 6px;  animation-delay: 0s; }
.gh-eq i:nth-child(2) { height: 12px; animation-delay: 0.18s; }
.gh-eq i:nth-child(3) { height: 8px;  animation-delay: 0.36s; }
.gh-eq i:nth-child(4) { height: 14px; animation-delay: 0.10s; }
.gh-eq i:nth-child(5) { height: 9px;  animation-delay: 0.28s; }
.gh-eq i:nth-child(6) { height: 11px; animation-delay: 0.42s; }
@keyframes gh-eq {
  0%, 100% { transform: scaleY(0.35); opacity: 0.65; }
  50%       { transform: scaleY(1);   opacity: 1; }
}
.gh-gear {
  width: 30px; height: 30px;
  filter: drop-shadow(0 0 6px rgba(124,77,255,.6));
  animation: gear-spin 4s linear infinite;
}
@keyframes gear-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.gh-rule {
  position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%;
  animation: rule-slide 4s linear infinite;
}
@keyframes rule-slide {
  from { background-position: 0% 0%; }
  to   { background-position: 100% 0%; }
}
.gh-swap-enter-active, .gh-swap-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1);
}
.gh-swap-enter-from { opacity: 0; transform: translateY(7px); }
.gh-swap-leave-to   { opacity: 0; transform: translateY(-7px); }
</style>
