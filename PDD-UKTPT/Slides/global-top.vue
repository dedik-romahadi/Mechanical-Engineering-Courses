<!--
  global-top.vue — Header global (tampil di semua slide).
  Kiri: logo UMB + logo Diktisaintek Berdampak. Kanan: "PDD UKTPT | SERDOS 2026".
  Logo di-import sebagai modul agar Vite mem-bundle dengan path/base yang benar.
-->
<template>
  <header class="pdd-hd">
    <div class="pdd-hd-l">
      <img :src="umb" class="pdd-logo" alt="Universitas Mercu Buana" />
      <span class="pdd-hd-div"></span>
      <img :src="dikti" class="pdd-logo pdd-logo-dikti" alt="Diktisaintek Berdampak" />
    </div>
    <div class="pdd-hd-r">
      <span class="pdd-hd-main">PDD UKTPT</span>
      <span class="pdd-hd-bar">|</span>
      <span class="pdd-hd-sub">SERDOS 2026</span>
    </div>
  </header>
</template>

<script setup>
import umb from './assets/umb.png'
import dikti from './assets/diktisaintek.png'
</script>

<style scoped>
.pdd-hd {
  position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 100;
  display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e7ebf2;
  box-shadow: 0 6px 18px -14px rgba(15, 28, 52, 0.35);
}
/* Aksen "kop dokumen": pita gradien brand tipis di dasar header (pasangan footer). */
.pdd-hd::after {
  content: ''; position: absolute; left: 0; bottom: -1px; height: 2px; width: 176px;
  background: linear-gradient(90deg, #15418f, #0f9d8f 60%, #f59e0b);
  border-radius: 0 2px 2px 0;
}
.pdd-hd-l { display: flex; align-items: center; gap: 16px; }
.pdd-logo { height: 50px; width: auto; object-fit: contain; display: block; }
.pdd-logo-dikti { height: 52px; }
.pdd-hd-div { width: 1px; height: 38px; background: #e0e6ef; }
.pdd-hd-r { display: flex; align-items: center; gap: 9px; font-weight: 800; }
.pdd-hd-main { font-size: 16px; letter-spacing: 0.02em; color: #15418f; }
.pdd-hd-bar { color: #cdd6e4; font-weight: 400; }
.pdd-hd-sub {
  font-size: 12.5px; letter-spacing: 0.08em; color: #0f9d8f; font-weight: 800;
  background: rgba(15, 157, 143, 0.10); border: 1px solid rgba(15, 157, 143, 0.25);
  padding: 3px 10px; border-radius: 999px;
}
</style>
