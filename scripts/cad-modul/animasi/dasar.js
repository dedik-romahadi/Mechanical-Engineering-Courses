// ════════════════════════════════════════════════════════════
// HELPER ANIMASI MODUL PEMODELAN CAD (dipakai animasi/modul-N.js; asal salinan dari TTL)
// Satu tombol PAUSE per kanvas; kanvas yang dijeda digambar ulang saat resize
// atau saat tab Modul dibuka kembali (window._ttlGambarUlang).
// ════════════════════════════════════════════════════════════
// Batas kanvas "sempit". Lebar kanvas nyata (22 Sep 2026): desktop 1000, laptop 1024 px 800,
// tablet 768 px 570, ponsel 414/390/360/320 px = 298/274/244/204. Tinggi bawaan 280.
const _TTL_SEMPIT=520;
function _ttlKanvas(id,hSempit){
  const cv=document.getElementById(id); if(!cv) return null;
  // Kanvas pada tab yang tersembunyi punya clientWidth 0; pakai lebar buffer agar
  // skala tidak negatif (arc dengan radius negatif melempar IndexSizeError).
  const W=cv.clientWidth||cv.width; if(cv.clientWidth>0) cv.width=W;
  // hSempit (opsional): tinggi kanvas saat W < _TTL_SEMPIT, supaya teks yang dipecah dan
  // gambar yang diperkecil tetap muat di ponsel. Tinggi bawaan disimpan dan dipulihkan.
  if(hSempit){const hBaku=+(cv.dataset.hBaku||(cv.dataset.hBaku=cv.height)); const hMau=W<_TTL_SEMPIT?hSempit:hBaku; if(cv.height!==hMau) cv.height=hMau;}
  const H=cv.height;
  const ctx=cv.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#020812'); bg.addColorStop(1,'#080c18');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  return {ctx,W,H};
}
// Menulis teks agar muat dalam lebar maxW (perataan mengikuti ctx.textAlign): ukuran huruf
// dikecilkan dulu sampai opsi.susut × ukuran semula (bawaan 0,85, tidak di bawah opsi.min
// = 8 px); bila masih terlalu lebar, teks dipecah per kata menjadi beberapa baris berjarak
// opsi.lh. Mengembalikan y untuk baris berikutnya. Font ctx dipulihkan sesudahnya.
function _ttlTeks(ctx,teks,x,y,maxW,opsi){
  opsi=opsi||{};
  const f=ctx.font, m=/(\d+(?:\.\d+)?)px/.exec(f), px=m?parseFloat(m[1]):10;
  const minPx=Math.max(opsi.min||8,px*(opsi.susut||0.85));
  let uk=px;
  while(ctx.measureText(teks).width>maxW&&uk>minPx){uk=Math.max(minPx,uk-0.5); ctx.font=f.replace(/\d+(?:\.\d+)?px/,uk+'px');}
  const lh=opsi.lh||Math.round(uk*1.35);
  let yy=y;
  if(ctx.measureText(teks).width<=maxW){ctx.fillText(teks,x,yy); ctx.font=f; return yy+lh;}
  let baris='';
  for(const k of String(teks).split(' ')){const coba=baris?baris+' '+k:k; if(baris&&ctx.measureText(coba).width>maxW){ctx.fillText(baris,x,yy); yy+=lh; baris=k;} else baris=coba;}
  if(baris){ctx.fillText(baris,x,yy); yy+=lh;}
  ctx.font=f; return yy;
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
