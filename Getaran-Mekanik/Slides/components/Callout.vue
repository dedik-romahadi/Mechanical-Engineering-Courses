<!--
  Callout.vue — Kotak sorot serbaguna.
  type: 'analogy' | 'industry' | 'tip' | 'warning' | 'concept'
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
  background: #0d1526; border: 1px solid rgba(255,255,255,.08);
  margin: 10px 0; color: #f1f5f9;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.callout.analogy:hover  { border-color: rgba(251,191,36,0.5);  box-shadow: 0 0 0 1px rgba(251,191,36,0.15), 0 6px 22px rgba(251,191,36,0.1); }
.callout.industry:hover { border-color: rgba(0,229,255,0.5);   box-shadow: 0 0 0 1px rgba(0,229,255,0.15), 0 6px 22px rgba(0,229,255,0.1); }
.callout.tip:hover      { border-color: rgba(52,211,153,0.5);  box-shadow: 0 0 0 1px rgba(52,211,153,0.15), 0 6px 22px rgba(52,211,153,0.1); }
.callout.warning:hover  { border-color: rgba(251,113,133,0.5); box-shadow: 0 0 0 1px rgba(251,113,133,0.15), 0 6px 22px rgba(251,113,133,0.1); }
.callout.concept:hover  { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 6px 22px rgba(167,139,250,0.1); }
.callout-bar { flex: none; width: 5px; }
.callout-body { padding: 10px 14px; }
.callout-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 7px; }
.callout-ico { font-size: 16px; }
.callout-content { font-size: 13.5px; line-height: 1.5; color: #94a3b8; }
.callout-content :deep(strong) { color: #f8fafc; }
.callout.analogy  .callout-bar { background: #fbbf24; }
.callout.analogy  .callout-title { color: #fbbf24; }
.callout.industry .callout-bar { background: #00e5ff; }
.callout.industry .callout-title { color: #67e8f9; }
.callout.tip      .callout-bar { background: #34d399; }
.callout.tip      .callout-title { color: #6ee7b7; }
.callout.warning  .callout-bar { background: #fb7185; }
.callout.warning  .callout-title { color: #fca5a5; }
.callout.concept  .callout-bar { background: #a78bfa; }
.callout.concept  .callout-title { color: #c4b5fd; }
</style>
