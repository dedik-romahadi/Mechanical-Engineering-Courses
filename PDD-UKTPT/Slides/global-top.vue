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
      <span class="pdd-hd-div2"></span>
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
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: linear-gradient(90deg, #15418f, #0f9d8f 60%, #f59e0b);
}
.pdd-hd-l { display: flex; align-items: center; gap: 16px; }
.pdd-logo { height: 50px; width: auto; object-fit: contain; display: block; }
.pdd-logo-dikti { height: 52px; }
.pdd-hd-div { width: 1px; height: 38px; background: #e0e6ef; }
.pdd-hd-r { display: flex; align-items: center; gap: 11px; }
/* Wordmark gradien brand — lebih "keren" dari teks polos */
.pdd-hd-main {
  font-size: 17px; font-weight: 800; letter-spacing: 0.06em;
  background: linear-gradient(95deg, #15418f, #2f6bd6 48%, #0f9d8f);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
/* Pemisah: bilah gradien tipis (ganti '|') */
.pdd-hd-div2 {
  width: 2px; height: 18px; border-radius: 2px;
  background: linear-gradient(180deg, #15418f, #0f9d8f);
}
.pdd-hd-sub {
  font-size: 12px; letter-spacing: 0.10em; color: #0f6e56; font-weight: 800;
  background: rgba(15, 157, 143, 0.10); border: 1px solid rgba(15, 157, 143, 0.28);
  padding: 3px 11px; border-radius: 999px;
}
</style>
