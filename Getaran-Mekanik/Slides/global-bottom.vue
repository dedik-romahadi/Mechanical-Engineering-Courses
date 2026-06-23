<template>
  <div v-if="$slidev.nav.currentPage !== 1" class="global-footer">
    <div class="footer-left">
      <span>Dedik Romahadi, S.T., M.T.</span>
      <span class="footer-sep">·</span>
      <span>Teknik Mesin Universitas Mercu Buana</span>
    </div>
    <div class="footer-center">
      <span class="footer-dots">
        <span
          v-for="i in $slidev.nav.total"
          :key="i"
          class="footer-dot"
          :class="{ active: i === $slidev.nav.currentPage }"
        ></span>
      </span>
    </div>
    <div class="footer-right">
      <span class="footer-page">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

<style scoped>
.global-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #1e1e1e;
  border-top: 1px solid #c8922a33;
  z-index: 100;
  font-size: 11px;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6a6a6a;
  flex: 0 0 auto;
}
.footer-sep {
  color: #3a3a3a;
}
.footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}
.footer-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #3a3a3a;
  transition: background 0.2s;
}
.footer-dot.active {
  background: #c8922a;
  width: 14px;
  border-radius: 3px;
}
.footer-right {
  flex: 0 0 auto;
}
.footer-page {
  color: #c8922a;
  font-weight: 700;
  font-size: 12px;
}
</style>
