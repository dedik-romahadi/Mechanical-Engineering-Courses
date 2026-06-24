<!--
  Callout.vue — Kotak sorot serbaguna: analogi, contoh industri, tips, peringatan, konsep.
  Props:
    type  : 'analogy' | 'industry' | 'tip' | 'warning' | 'concept'
    title : judul (opsional, ada default per-type)
  Slot   : isi konten.
-->
<template>
  <div class="callout" :class="type">
    <div class="callout-bar"></div>
    <div class="callout-body">
      <div class="callout-title">
        <span class="callout-ico">{{ ico }}</span>
        {{ title || defaultTitle }}
      </div>
      <div class="callout-content"><slot /></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  type: { type: String, default: 'tip' },
  title: { type: String, default: '' },
})
const map = {
  analogy:  { ico: '💡', t: 'Analogi' },
  industry: { ico: '🏭', t: 'Di Industri' },
  tip:      { ico: '✅', t: 'Catatan' },
  warning:  { ico: '⚠️', t: 'Perhatian' },
  concept:  { ico: '🧭', t: 'Inti Konsep' },
}
const ico = computed(() => (map[props.type] || map.tip).ico)
const defaultTitle = computed(() => (map[props.type] || map.tip).t)
</script>

<style scoped>
.callout {
  display: flex; gap: 0;
  border-radius: 8px; overflow: hidden;
  background: #1c1a14; border: 1px solid #2e2a21;
  margin: 10px 0; color: #e7e2d8;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.callout.analogy:hover  { border-color: rgba(200,146,42,0.6); box-shadow: 0 0 0 1px rgba(200,146,42,0.18), 0 6px 22px rgba(200,146,42,0.12); }
.callout.industry:hover { border-color: rgba(91,155,213,0.6); box-shadow: 0 0 0 1px rgba(91,155,213,0.18), 0 6px 22px rgba(91,155,213,0.12); }
.callout.tip:hover      { border-color: rgba(95,174,95,0.6);  box-shadow: 0 0 0 1px rgba(95,174,95,0.18), 0 6px 22px rgba(95,174,95,0.12); }
.callout.warning:hover  { border-color: rgba(217,101,90,0.6); box-shadow: 0 0 0 1px rgba(217,101,90,0.18), 0 6px 22px rgba(217,101,90,0.12); }
.callout.concept:hover  { border-color: rgba(167,139,200,0.6); box-shadow: 0 0 0 1px rgba(167,139,200,0.18), 0 6px 22px rgba(167,139,200,0.12); }
.callout-bar { flex: none; width: 5px; }
.callout-body { padding: 10px 14px; }
.callout-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 7px; }
.callout-ico { font-size: 16px; }
.callout-content { font-size: 13.5px; line-height: 1.5; color: #d3cdc3; }
.callout-content :deep(strong) { color: #f0ece3; }

.callout.analogy  .callout-bar { background: #c8922a; }
.callout.analogy  .callout-title { color: #e0b455; }
.callout.industry .callout-bar { background: #5b9bd5; }
.callout.industry .callout-title { color: #7fb4e3; }
.callout.tip      .callout-bar { background: #5fae5f; }
.callout.tip      .callout-title { color: #82c182; }
.callout.warning  .callout-bar { background: #d9655a; }
.callout.warning  .callout-title { color: #e58a80; }
.callout.concept  .callout-bar { background: #a78bc8; }
.callout.concept  .callout-title { color: #bda5da; }
</style>
