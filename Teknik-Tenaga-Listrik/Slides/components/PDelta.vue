<!--
  PDelta.vue — Kurva P–δ dan kompensasi seri (Modul 6, Persamaan 4 dan 8).
  Saluran 220 kV, X_L = 80 Ω; geser derajat kompensasi k dan daya kirim P.
-->
<template>
  <div class="pd">
    <svg class="pd-svg" viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="160" x2="350" y2="160" stroke="#334155" />
      <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" />
      <g v-for="d in [30, 60, 90, 120, 150, 180]" :key="d">
        <line :x1="xOf(d)" y1="160" :x2="xOf(d)" y2="164" stroke="#64748b" />
        <text :x="xOf(d)" y="176" class="pd-ax" text-anchor="middle">{{ d }}°</text>
      </g>
      <text x="196" y="188" class="pd-ax" text-anchor="middle">sudut daya δ</text>
      <g v-for="p in [250, 500, 750, 1000]" :key="p">
        <text x="34" :y="yOf(p) + 3" class="pd-ax" text-anchor="end">{{ p }}</text>
      </g>
      <line x1="40" :y1="yOf(P)" x2="350" :y2="yOf(P)" stroke="#fbbf24" stroke-dasharray="4 3" />
      <path :d="path(0)" fill="none" stroke="#64748b" stroke-width="2" />
      <path :d="path(k)" fill="none" stroke="#38bdf8" stroke-width="2.4" />
      <circle v-if="P <= Pmax" :cx="xOf(delta)" :cy="yOf(P)" r="5.5" fill="#fbbf24" class="pd-dot" />
      <text x="56" y="22" class="pd-ax" fill="#64748b">tanpa kompensasi</text>
      <text x="56" y="34" class="pd-ax" fill="#38bdf8">k = {{ fx(k, 2) }}</text>
    </svg>
    <div class="pd-side">
      <label class="pd-row"><span>k</span>
        <input type="range" min="0" max="0.7" step="0.05" v-model.number="k" /><b>{{ fx(k, 2) }}</b></label>
      <label class="pd-row"><span>P (MW)</span>
        <input type="range" min="100" max="900" step="25" v-model.number="P" /><b>{{ P }}</b></label>
      <div class="pd-read">
        <div><span>X<sub>eff</sub> = X<sub>L</sub>·(1−k)</span><b>{{ fx(Xeff, 1) }} Ω</b></div>
        <div><span>P<sub>maks</sub> = V²/X<sub>eff</sub></span><b>{{ fx(Pmax, 0) }} MW</b></div>
        <div><span>δ pada P</span><b :class="{ bad: P > Pmax || delta > 45 }">{{ P > Pmax ? 'tak stabil' : fx(delta, 1) + '°' }}</b></div>
      </div>
      <div class="pd-note">Kapasitor seri memotong X → P<sub>maks</sub> naik, δ mengecil, cadangan stabilitas bertambah.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const V = 220, XL = 80
const k = ref(0.4)
const P = ref(400)
const Xeff = computed(() => XL * (1 - k.value))
const Pmax = computed(() => (V * V) / Xeff.value)
const delta = computed(() => (Math.asin(Math.min(1, P.value / Pmax.value)) * 180) / Math.PI)
const xOf = (d) => 40 + (d / 180) * 310
const yOf = (p) => 160 - (Math.min(p, 1100) / 1100) * 150
const path = (kk) => {
  const pm = (V * V) / (XL * (1 - kk))
  const pts = []
  for (let d = 0; d <= 180; d += 3) pts.push(`${xOf(d).toFixed(1)},${yOf(pm * Math.sin((d * Math.PI) / 180)).toFixed(1)}`)
  return 'M' + pts.join(' L')
}
</script>

<style scoped>
.pd { display: flex; gap: 14px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.pd-svg { width: 310px; height: auto; flex: none; }
.pd-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; }
.pd-dot { filter: drop-shadow(0 0 6px #fbbf24); }
.pd-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.pd-row { display: grid; grid-template-columns: 48px 1fr 36px; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; }
.pd-row b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; text-align: right; }
.pd-row input { accent-color: #38bdf8; width: 100%; }
.pd-read { display: grid; gap: 3px; margin-top: 4px; }
.pd-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.pd-read b { color: #38bdf8; font-family: 'Fira Code', ui-monospace, monospace; }
.pd-read b.bad { color: #fb7185; }
.pd-note { font-size: 11px; color: #64748b; line-height: 1.35; }
</style>
