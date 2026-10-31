<!--
  LossVoltage.vue — Rugi saluran terhadap tegangan (Modul 1, Persamaan 5–6).
  P = 100 MW, cos φ = 0,9; geser tegangan dan resistansi per fasa.
-->
<template>
  <div class="lv">
    <svg class="lv-svg" viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="160" x2="350" y2="160" stroke="#334155" />
      <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" />
      <line x1="40" :y1="yOf(3)" x2="350" :y2="yOf(3)" stroke="#fb7185" stroke-dasharray="5 4" />
      <text x="346" :y="yOf(3) - 4" class="lv-ax" fill="#fb7185" text-anchor="end">batas 3%</text>
      <g v-for="v in std" :key="v">
        <line :x1="xOf(v)" y1="160" :x2="xOf(v)" y2="164" stroke="#64748b" />
        <text :x="xOf(v)" y="176" class="lv-ax" text-anchor="middle">{{ v }}</text>
      </g>
      <text x="196" y="188" class="lv-ax" text-anchor="middle">tegangan saluran (kV)</text>
      <text x="34" :y="yOf(0) + 3" class="lv-ax" text-anchor="end">0</text>
      <text x="34" :y="yOf(10) + 3" class="lv-ax" text-anchor="end">10%</text>
      <text x="34" :y="yOf(20) + 3" class="lv-ax" text-anchor="end">20%</text>
      <path :d="curve" fill="none" stroke="#38bdf8" stroke-width="2.4" />
      <circle class="lv-dot" :cx="xOf(V)" :cy="yOf(Math.min(pct, 20))" r="6" fill="#fbbf24" />
    </svg>
    <div class="lv-side">
      <label class="lv-row"><span>V<sub>L</sub> (kV)</span>
        <input type="range" min="40" max="500" step="5" v-model.number="V" /><b>{{ V }}</b></label>
      <label class="lv-row"><span>R (Ω/fasa)</span>
        <input type="range" min="1" max="10" step="0.5" v-model.number="R" /><b>{{ fx(R, 1) }}</b></label>
      <div class="lv-read">
        <div><span>I<sub>L</sub></span><b>{{ fx(I, 1) }} A</b></div>
        <div><span>P<sub>rugi</sub></span><b>{{ fx((loss / 1e6), 2) }} MW</b></div>
        <div><span>rugi / P</span><b :class="pct > 3 ? 'bad' : 'ok'">{{ fx(pct, 2) }} %</b></div>
      </div>
      <div class="lv-note">P = 100 MW, cos φ = 0,9. Tegangan ×2 → rugi ÷4.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const P = 100e6, pf = 0.9
const V = ref(150)
const R = ref(5)
const std = [70, 150, 275, 500]
const xOf = (v) => 40 + ((v - 40) / 460) * 310
const yOf = (p) => 160 - (p / 20) * 150
const pctAt = (v) => (P * R.value) / ((v * 1e3) ** 2 * pf ** 2) * 100
const I = computed(() => P / (Math.sqrt(3) * V.value * 1e3 * pf))
const loss = computed(() => 3 * I.value ** 2 * R.value)
const pct = computed(() => (loss.value / P) * 100)
const curve = computed(() => {
  const pts = []
  for (let v = 40; v <= 500; v += 4) pts.push(`${xOf(v).toFixed(1)},${yOf(Math.min(pctAt(v), 20)).toFixed(1)}`)
  return 'M' + pts.join(' L')
})
</script>

<style scoped>
.lv { display: flex; gap: 14px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.lv-svg { width: 370px; height: auto; flex: none; }
.lv-ax { font-size: 9.5px; fill: #94a3b8; font-family: 'Fira Code', ui-monospace, monospace; }
.lv-dot { filter: drop-shadow(0 0 6px #fbbf24); animation: lv-pulse 1.4s ease-in-out infinite; }
@keyframes lv-pulse { 50% { r: 8px; } }
.lv-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.lv-row { display: grid; grid-template-columns: 70px 1fr 36px; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; }
.lv-row b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; text-align: right; }
.lv-row input { accent-color: #38bdf8; width: 100%; }
.lv-read { display: grid; gap: 3px; margin-top: 4px; }
.lv-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.lv-read b { color: #38bdf8; font-family: 'Fira Code', ui-monospace, monospace; }
.lv-read b.bad { color: #fb7185; }
.lv-read b.ok { color: #34d399; }
.lv-note { font-size: 11px; color: #64748b; }
</style>
