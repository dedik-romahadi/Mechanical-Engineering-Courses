<template>
  <div v-if="$slidev.nav.currentPage !== 1" class="global-header">
    <div class="header-left">
      <img src="/Logo/UMB-Logo.png" class="header-logo" alt="UMB" />
      <span class="header-course">Getaran Mekanik</span>
    </div>
    <div class="header-title">Analisis Getaran Berbasis Fourier Transform</div>
    <div class="header-right">
      <span class="header-tag">S1 Teknik Mesin — UMB</span>
    </div>
  </div>
</template>

<style scoped>
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #1e1e1e;
  border-bottom: 1px solid #c8922a44;
  z-index: 100;
  font-size: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.header-logo {
  height: 22px;
  width: auto;
  object-fit: contain;
}
.header-course {
  color: #c8922a;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.header-title {
  color: #a8a8a8;
  font-size: 11px;
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 12px;
}
.header-right {
  flex: 0 0 auto;
}
.header-tag {
  color: #6a6a6a;
  font-size: 11px;
}
</style>
