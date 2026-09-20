// ════════════════════════════════════════════════════════════
// HELPER ANIMASI MODUL TEKNIK TENAGA LISTRIK (dipakai animasi/modul-N.js)
// Satu tombol PAUSE per kanvas; kanvas yang dijeda digambar ulang saat resize
// atau saat tab Modul dibuka kembali (window._ttlGambarUlang).
// ════════════════════════════════════════════════════════════
function _ttlKanvas(id){
  const cv=document.getElementById(id); if(!cv) return null;
  // Kanvas pada tab yang tersembunyi punya clientWidth 0; pakai lebar buffer agar
  // skala tidak negatif (arc dengan radius negatif melempar IndexSizeError).
  const W=cv.clientWidth||cv.width; if(cv.clientWidth>0) cv.width=W; const H=cv.height;
  const ctx=cv.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#020812'); bg.addColorStop(1,'#080c18');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  return {ctx,W,H};
}
function _ttlNilai(id,def){const el=document.getElementById(id); const v=parseFloat(el&&el.value); return Number.isFinite(v)?v:def;}
function _ttlTulis(id,teks){const el=document.getElementById(id); if(el) el.textContent=teks;}
function _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar,putus){
  ctx.strokeStyle=warna; ctx.lineWidth=lebar||1; ctx.setLineDash(putus||[]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
}
function _ttlToggle(nama,btnId,gambar){
  const st=window._ttlJeda||(window._ttlJeda={});
  st[nama]=!st[nama];
  const b=document.getElementById(btnId); if(b) b.textContent=st[nama]?'▶ PLAY':'⏸ PAUSE';
  if(!st[nama]) gambar();
}
const _ttlJalan=nama=>!((window._ttlJeda||{})[nama]);
// Daftar animasi modul: [idKanvas, fungsiGambar, nama, [idSlider...]]; diisi modul-N.js lalu dipakai _ttlMulai().
const _TTL_DAFTAR=[];
function _ttlMulai(){
  const start=()=>{
    _TTL_DAFTAR.forEach(([id,gambar,nama,slider])=>{
      if(document.getElementById(id)) gambar();
      (slider||[]).forEach(sid=>{const s=document.getElementById(sid); if(s) s.addEventListener('input',()=>{if(!_ttlJalan(nama)) gambar();});});
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  // Dipanggil switchTab('modul') dan resize: hanya kanvas yang dijeda perlu digambar ulang.
  window._ttlGambarUlang=()=>{_TTL_DAFTAR.forEach(([,gambar,nama])=>{if(!_ttlJalan(nama)) gambar();});};
  window.addEventListener('resize',window._ttlGambarUlang);
}
