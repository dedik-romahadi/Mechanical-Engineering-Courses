<!--
  LoadCurve.vue — Kurva beban harian bertingkat (Modul 1, Tabel 5, Persamaan 9).
  Kursor menyapu 24 jam sambil "mengisi" energi; di akhir hari tampak garis
  rata-rata vs puncak sehingga faktor beban terbaca langsung.
-->
<template>
  <div class="anim-card lc">
    <svg viewBox="0 0 330 130" class="lc-svg" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="110" x2="322" y2="110" stroke="#334155" />
      <rect v-for="b in blok" :key="b.t0" :x="xOf(b.t0)" :y="yOf(b.p)" :width="xOf(b.t0 + b.d) - xOf(b.t0)" :height="110 - yOf(b.p)"
        fill="rgba(56,189,248,.10)" stroke="rgba(56,189,248,.35)" />
      <clipPath id="lc-clip"><rect x="30" y="0" :width="xOf(jam) - 30" height="110" /></clipPath>
      <g clip-path="url(#lc-clip)">
        <rect v-for="b in blok" :key="'f' + b.t0" :x="xOf(b.t0)" :y="yOf(b.p)" :width="xOf(b.t0 + b.d) - xOf(b.t0)" :height="110 - yOf(b.p)" fill="rgba(56,189,248,.45)" />
      </g>
      <line x1="30" :y1="yOf(70)" x2="322" :y2="yOf(70)" stroke="#fb7185" stroke-dasharray="5 4" />
      <text x="322" :y="yOf(70) - 3" class="lc-ax" fill="#fb7185" text-anchor="end">puncak 70 MW</text>
      <g :opacity="jam >= 24 ? 1 : 0.15" class="lc-avg">
        <line x1="30" :y1="yOf(rata)" x2="322" :y2="yOf(rata)" stroke="#34d399" stroke-width="2" />
        <text x="34" :y="yOf(rata) - 3" class="lc-ax" fill="#34d399">rata-rata 44,38 MW</text>
      </g>
      <line :x1="xOf(jam)" y1="8" :x2="xOf(jam)" y2="110" stroke="#fbbf24" stroke-width="1.6" />
      <text v-for="h in [0, 6, 12, 17, 22, 24]" :key="h" :x="xOf(h)" y="123" class="lc-ax" text-anchor="middle">{{ h }}</text>
    </svg>
    <div class="lc-read">
      <span>jam <b>{{ fx(Math.min(jam, 24), 1) }}</b></span>
      <span>energi <b>{{ fx(energi, 0) }} MWh</b></span>
      <span>LF = rata/puncak <b>{{ jam >= 24 ? '63,4 %' : '…' }}</b></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const blok = [{ t0: 0, d: 6, p: 25 }, { t0: 6, d: 11, p: 45 }, { t0: 17, d: 5, p: 70 }, { t0: 22, d: 2, p: 35 }]
const rata = 1065 / 24
const xOf = (h) => 30 + (h / 24) * 292
const yOf = (p) => 110 - (p / 80) * 100
const jam = ref(0)
const energi = computed(() => blok.reduce((s, b) => s + b.p * Math.max(0, Math.min(jam.value, b.t0 + b.d) - b.t0), 0))
let raf, t0
// 24 jam disapu dalam 8 detik, lalu jeda 3 detik sebelum mengulang.
function step(t) {
  if (t0 != null) jam.value += ((t - t0) / 1000) * 3
  if (jam.value > 33) jam.value = 0
  t0 = t
  raf = requestAnimationFrame(step)
}
onMounted(() => { raf = requestAnimationFrame(step) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.lc-svg { width: 100%; height: auto; display: block; }
.lc-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; font-weight: 700; }
.lc-avg { transition: opacity .5s; }
.lc-read { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 2px; }
.lc-read b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; }
</style>
