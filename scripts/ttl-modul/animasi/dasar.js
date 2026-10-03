// ════════════════════════════════════════════════════════════
// HELPER ANIMASI MODUL TEKNIK TENAGA LISTRIK (dipakai animasi/modul-N.js)
// Satu tombol PAUSE per kanvas; kanvas yang dijeda digambar ulang saat resize
// atau saat tab Modul dibuka kembali (window._ttlGambarUlang).
// ════════════════════════════════════════════════════════════
// Notasi rumus di kanvas dan readout. Teks yang memuat <sub>…</sub> atau <sup>…</sup> (penanda
// yang sama dengan teks HTML modul, mis. 'R<sub>L</sub> = r') digambar dengan subskrip/superskrip
// sungguhan: ukuran 0,72× (tidak di bawah 8 px), turun 0,22 em atau naik 0,38 em. ctx dari
// _ttlKanvas sudah dibungkus _ttlRumusKtx, sehingga fillText/measureText (juga lewat _ttlTeks dan
// _ttlLabel) memahami penanda itu; teks tanpa penanda diteruskan apa adanya ke kanvas. _ttlTulis
// memasang penanda sebagai <sub>/<sup> sungguhan (teks lainnya di-escape).
function _ttlAdaRumus(s){return typeof s==='string'&&s.indexOf('<su')>=0;}
function _ttlPotongRumus(s){
  const rx=/<(sub|sup)>([\s\S]*?)<\/\1>/g, out=[]; let i=0, m;
  while((m=rx.exec(s))){ if(m.index>i) out.push([s.slice(i,m.index),0]); out.push([m[2],m[1]==='sub'?1:-1]); i=rx.lastIndex; }
  if(i<s.length) out.push([s.slice(i),0]);
  return out;
}
function _ttlRumusTata(ctx,s){
  const P=CanvasRenderingContext2D.prototype, f=ctx.font, al=ctx.textAlign, bl=ctx.textBaseline;
  const mm=/(\d+(?:\.\d+)?)px/.exec(f), px=mm?parseFloat(mm[1]):10;
  const kecil=f.replace(/\d+(?:\.\d+)?px/,Math.max(px*0.72,Math.min(px,8)).toFixed(2)+'px');
  const dyA=-P.measureText.call(ctx,'x').alphabeticBaseline;      // garis dasar alfabetik relatif ke y
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  let W=0;
  const pot=_ttlPotongRumus(s).map(([t,k])=>{
    ctx.font=k?kecil:f; const m=P.measureText.call(ctx,t);
    const o={t,font:ctx.font,x:W,g:k===1?0.22*px:(k===-1?-0.38*px:0),m}; W+=m.width; return o;
  });
  ctx.font=f; ctx.textAlign=al; ctx.textBaseline=bl;
  const s0=al==='center'?-W/2:((al==='right'||al==='end')?-W:0);
  return {pot,W,s0,dyA};
}
function _ttlRumusUkur(ctx,s){
  const {pot,W,s0,dyA}=_ttlRumusTata(ctx,s);
  let kiri=Infinity, kanan=-Infinity, naik=-Infinity, turun=-Infinity;
  for(const p of pot){
    kiri=Math.min(kiri,s0+p.x-p.m.actualBoundingBoxLeft); kanan=Math.max(kanan,s0+p.x+p.m.actualBoundingBoxRight);
    naik=Math.max(naik,p.m.actualBoundingBoxAscent-p.g-dyA); turun=Math.max(turun,p.m.actualBoundingBoxDescent+p.g+dyA);
  }
  const b=pot.length?pot[0].m:{};
  return {width:W, actualBoundingBoxLeft:-kiri, actualBoundingBoxRight:kanan, actualBoundingBoxAscent:naik, actualBoundingBoxDescent:turun,
          fontBoundingBoxAscent:b.fontBoundingBoxAscent, fontBoundingBoxDescent:b.fontBoundingBoxDescent};
}
function _ttlRumus(ctx,s,x,y){
  const P=CanvasRenderingContext2D.prototype, {pot,s0,dyA}=_ttlRumusTata(ctx,s);
  const f=ctx.font, al=ctx.textAlign, bl=ctx.textBaseline;
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.__rumus=(window._ttlRumusN=(window._ttlRumusN||0)+1);       // pengukur tata letak menyatukan potongannya
  for(const p of pot){ctx.font=p.font; P.fillText.call(ctx,p.t,x+s0+p.x,y+dyA+p.g);}
  ctx.__rumus=0; ctx.font=f; ctx.textAlign=al; ctx.textBaseline=bl;
}
function _ttlRumusKtx(ctx){
  if(!ctx||ctx.__ttlRumus) return ctx;
  const P=CanvasRenderingContext2D.prototype; ctx.__ttlRumus=true;
  ctx.fillText=function(t,x,y,w){if(_ttlAdaRumus(t)) return _ttlRumus(this,t,x,y); return w===undefined?P.fillText.call(this,t,x,y):P.fillText.call(this,t,x,y,w);};
  ctx.measureText=function(t){return _ttlAdaRumus(t)?_ttlRumusUkur(this,t):P.measureText.call(this,t);};
  return ctx;
}
function _ttlRumusHtml(s){
  const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return _ttlPotongRumus(String(s)).map(([t,k])=>k===1?'<sub>'+esc(t)+'</sub>':(k===-1?'<sup>'+esc(t)+'</sup>':esc(t))).join('');
}
function _ttlKanvas(id){
  const cv=document.getElementById(id); if(!cv) return null;
  const W=cv.clientWidth; if(W>0) cv.width=W; const H=cv.height;
  const ctx=_ttlRumusKtx(cv.getContext('2d'));
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#020812'); bg.addColorStop(1,'#080c18');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  return {ctx,W,H};
}
function _ttlNilai(id,def){const el=document.getElementById(id); const v=parseFloat(el&&el.value); return Number.isFinite(v)?v:def;}
function _ttlTulis(id,teks){const el=document.getElementById(id); if(!el) return; if(_ttlAdaRumus(teks)) el.innerHTML=_ttlRumusHtml(teks); else el.textContent=teks;}
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
