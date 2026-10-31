<!--
  PowerTriangle.vue — Segitiga daya interaktif (Modul 1, Persamaan 3–5).
  Geser P dan cos φ: Q, S, sudut φ, dan arus saluran 3φ 380 V ikut berubah.
-->
<template>
  <div class="pt">
    <svg class="pt-svg" viewBox="0 0 420 190" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="pt-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#cbd5e1" />
        </marker>
      </defs>
      <polygon :points="`96,170 ${x2},170 ${x2},${y2}`" fill="rgba(124,77,255,.10)" />
      <line x1="96" y1="170" :x2="x2" y2="170" stroke="#34d399" stroke-width="3.5" stroke-linecap="round" />
      <line :x1="x2" y1="170" :x2="x2" :y2="y2" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" />
      <line x1="96" y1="170" :x2="x2" :y2="y2" stroke="#a78bfa" stroke-width="3.5" stroke-linecap="round" />
      <path :d="arc" fill="none" stroke="#38bdf8" stroke-width="1.6" />
      <text x="138" y="162" class="pt-lbl" fill="#38bdf8">φ = {{ fx(phiDeg, 1) }}°</text>
      <text :x="(96 + x2) / 2" y="186" class="pt-lbl" fill="#34d399" text-anchor="middle">P = {{ fx(P, 0) }} kW</text>
      <text :x="x2 + 6" :y="(170 + y2) / 2" class="pt-lbl" fill="#fbbf24">Q = {{ fx(Q, 1) }} kVAR</text>
      <text :x="Math.max(90, (96 + x2) / 2 - 12)" :y="(170 + y2) / 2 - 8" class="pt-lbl" fill="#a78bfa" text-anchor="end">S = {{ fx(S, 1) }} kVA</text>
    </svg>
    <div class="pt-side">
      <label class="pt-row">
        <span>P (kW)</span>
        <input type="range" min="20" max="120" step="1" v-model.number="P" />
        <b>{{ P }}</b>
      </label>
      <label class="pt-row">
        <span>cos φ</span>
        <input type="range" min="0.5" max="1" step="0.01" v-model.number="pf" />
        <b>{{ fx(pf, 2) }}</b>
      </label>
      <div class="pt-read">
        <div><span>Arus 3φ, 380 V</span><b>{{ fx(I, 1) }} A</b></div>
        <div><span>Arus bila cos φ = 1</span><b>{{ fx(I1, 1) }} A</b></div>
        <div><span>Rugi kabel relatif</span><b :class="{ bad: loss > 1.3 }">× {{ fx(loss, 2) }}</b></div>
      </div>
      <div class="pt-note">P sama, cos φ turun → S dan I naik → rugi I²·R naik dengan kuadratnya.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Angka tampil dengan koma desimal (gaya Indonesia).
const fx = (v, d) => v.toFixed(d).replace('.', ',')
const P = ref(80)
const pf = ref(0.8)
const phi = computed(() => Math.acos(pf.value))
const phiDeg = computed(() => (phi.value * 180) / Math.PI)
const S = computed(() => P.value / pf.value)
const Q = computed(() => S.value * Math.sin(phi.value))
// Skala gambar tetap: 1 kW = 1,8 px agar perubahan P terlihat sebagai panjang.
// Titik sudut di x = 96 menyisakan ruang kiri untuk label S saat P kecil.
const k = 1.8
const x2 = computed(() => 96 + P.value * k)
const y2 = computed(() => 170 - Math.min(Q.value * k, 160))
const arc = computed(() => {
  const r = 34
  return `M ${96 + r} 170 A ${r} ${r} 0 0 0 ${96 + r * Math.cos(phi.value)} ${170 - r * Math.sin(phi.value)}`
})
const I = computed(() => (P.value * 1000) / (Math.sqrt(3) * 380 * pf.value))
const I1 = computed(() => (P.value * 1000) / (Math.sqrt(3) * 380))
const loss = computed(() => (I.value / I1.value) ** 2)
</script>

<style scoped>
.pt { display: flex; gap: 16px; align-items: center; background: #0d1526; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px 14px; }
.pt-svg { width: 390px; height: auto; flex: none; }
.pt-lbl { font-size: 11px; font-weight: 700; font-family: 'Fira Code', ui-monospace, monospace; }
.pt-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.pt-row { display: grid; grid-template-columns: 52px 1fr 42px; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; }
.pt-row b { color: #f8fafc; font-family: 'Fira Code', ui-monospace, monospace; text-align: right; }
.pt-row input { accent-color: #a78bfa; width: 100%; }
.pt-read { display: grid; gap: 3px; margin-top: 4px; }
.pt-read div { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; background: #060c18; border-radius: 6px; padding: 3px 9px; }
.pt-read b { color: #38bdf8; font-family: 'Fira Code', ui-monospace, monospace; }
.pt-read b.bad { color: #fb7185; }
.pt-note { font-size: 11px; color: #64748b; line-height: 1.35; }
</style>
