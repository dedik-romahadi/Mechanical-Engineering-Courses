<!--
  global-top.vue — Header global untuk slide 2+.
  Judul topik tiap slide (route.meta.slide.title) ditampilkan secara dinamis
  dengan garis aksen emas di kiri DAN kanan, posisi benar-benar di tengah.
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
          <span class="gh-title" :key="page">{{ title }}</span>
        </transition>
        <span class="gh-bar"></span>
      </div>

      <!-- Index + equalizer (kanan) -->
      <div class="gh-index">
        <span class="gh-eq">
          <i v-for="(b, k) in 6" :key="k"></i>
        </span>
        <span class="gh-num">{{ pad(page) }}</span>
        <span class="gh-tot">/{{ total }}</span>
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
    radial-gradient(120% 180% at 50% -60%, rgba(200,146,42,0.10), transparent 60%),
    linear-gradient(90deg, #1b1b1a 0%, #272725 50%, #1b1b1a 100%);
}
.gh-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

/* Brand */
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
  background: radial-gradient(circle at 50% 30%, #2a2a28, #121211);
  border: 1px solid rgba(200,146,42,0.45);
  box-shadow: 0 0 10px rgba(200,146,42,0.18), inset 0 1px 2px rgba(0,0,0,0.5);
}
.gh-logo { height: 21px; width: auto; object-fit: contain; }
.gh-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.gh-brand-name {
  font-size: 11px; font-weight: 800; letter-spacing: 0.13em; color: #c8922a;
}
.gh-brand-sub { font-size: 9px; letter-spacing: 0.05em; color: #8f8f8a; text-transform: uppercase; }

/* Topik: absolutely centered */
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
  background: linear-gradient(#f0cd86, #c8922a);
  box-shadow: 0 0 8px rgba(200,146,42,0.7);
}
.gh-title {
  font-size: 18px;
  font-weight: 700;
  color: #f0ece3;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 8px rgba(0,0,0,0.5);
}

/* Index + equalizer */
.gh-index {
  display: flex; align-items: center; gap: 9px;
  flex: 0 0 auto; z-index: 1;
}
.gh-eq {
  display: flex; align-items: center; gap: 2.5px; height: 16px;
}
.gh-eq i {
  display: block; width: 2.5px; border-radius: 2px;
  background: linear-gradient(#f0cd86, #c8922a);
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
.gh-num { font-size: 14px; font-weight: 800; color: #c8922a; font-variant-numeric: tabular-nums; }
.gh-tot { font-size: 11px; color: #7a7a76; font-variant-numeric: tabular-nums; }

/* Gold rule */
.gh-rule {
  position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(200,146,42,0.2) 12%,
    #c8922a 38%, #f0cd86 50%, #c8922a 62%,
    rgba(200,146,42,0.2) 88%,
    transparent
  );
}

/* Title transition */
.gh-swap-enter-active, .gh-swap-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1);
}
.gh-swap-enter-from { opacity: 0; transform: translateY(7px); }
.gh-swap-leave-to   { opacity: 0; transform: translateY(-7px); }
</style>
