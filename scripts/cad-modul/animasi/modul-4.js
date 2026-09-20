// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 4 PEMODELAN CAD — Dimensi, Anotasi, dan Format Gambar Teknik
// Kanvas: cvJenis, cvChain, cvSektor, cvFormat (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
function _cad4Kisi(ctx,W,H,lebarMm,tinggiMm,padL,padB,ox0,oy0){
  const sk=Math.max(0.05,Math.min((W-padL-24)/lebarMm,(H-padB-26)/tinggiMm));
  const ox=padL+(ox0||0)*sk, oy=H-padB-(oy0||0)*sk;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.10)'; ctx.lineWidth=1;
  for(let x=-(ox0||0);x<=lebarMm-(ox0||0);x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-(oy0||0))); ctx.lineTo(X(x),Y(tinggiMm-(oy0||0))); ctx.stroke();}
  for(let y=-(oy0||0);y<=tinggiMm-(oy0||0);y+=10){ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(y)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(y)); ctx.stroke();}
  return {X,Y,sk};
}
// Dimensi linear antara dua titik layar, digeser tegak lurus sejauh ofs px; gaya (font, panah, desimal) dapat diatur.
function _cad4Dim(ctx,x1,y1,x2,y2,teks,warna,ofs,gaya){
  const g=Object.assign({font:10,panah:8,ext:1.15,tebal:1},gaya||{});
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L*ofs, ny=dx/L*ofs;
  ctx.strokeStyle=warna; ctx.lineWidth=g.tebal; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+nx*g.ext,y1+ny*g.ext); ctx.moveTo(x2,y2); ctx.lineTo(x2+nx*g.ext,y2+ny*g.ext); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1+nx,y1+ny); ctx.lineTo(x2+nx,y2+ny); ctx.stroke();
  const ux=dx/L, uy=dy/L, p=g.panah;
  [[x1+nx,y1+ny,1],[x2+nx,y2+ny,-1]].forEach(([px,py,s])=>{ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+s*ux*p-uy*p*0.35,py+s*uy*p+ux*p*0.35); ctx.lineTo(px+s*ux*p+uy*p*0.35,py+s*uy*p-ux*p*0.35); ctx.closePath(); ctx.fill();});
  ctx.fillStyle=warna; ctx.font=g.font+"px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.save(); ctx.translate((x1+x2)/2+nx*1.3,(y1+y2)/2+ny*1.3); let ang=Math.atan2(dy,dx); if(ang>Math.PI/2||ang<-Math.PI/2) ang+=Math.PI; ctx.rotate(ang); ctx.fillText(teks,0,g.font*0.35); ctx.restore();
  ctx.textAlign='left';
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Jenis Draft Dimension pada satu pelat
// ════════════════════════════════════════════════════════════
let _jnFrame=0;
function toggleJenis(){_ttlToggle('jenis','btnJenis',drawJenis);}
window.toggleJenis=toggleJenis;
function drawJenis(){
  const k=_ttlKanvas('cvJenis'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_jn_a',120), b=_ttlNilai('sl_jn_b',70), d=_ttlNilai('sl_jn_d',20), c=_ttlNilai('sl_jn_c',15);
  _ttlTulis('v_jn_a',a.toFixed(0)); _ttlTulis('v_jn_b',b.toFixed(0)); _ttlTulis('v_jn_d',d.toFixed(0)); _ttlTulis('v_jn_c',c.toFixed(0));
  const {X,Y}=_cad4Kisi(ctx,W,H,a+80,b+70,60,44,30,26);
  const sk=X(1)-X(0);
  const pts=[[0,0],[a,0],[a,b-c],[a-c,b],[0,b]];
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#0a101f'; ctx.beginPath(); ctx.arc(X(a/2),Y(b/2),d/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const jenis=['linear','aligned','diameter','angular','radius'];
  const aktif=_ttlJalan('jenis')?Math.floor((_jnFrame/70)%5):5;
  const tampil=(j)=>aktif===5||jenis[aktif]===j;
  if(tampil('linear')){_cad4Dim(ctx,X(0),Y(0),X(a),Y(0),a.toFixed(0),'#00e09e',24); _cad4Dim(ctx,X(0),Y(b),X(0),Y(0),b.toFixed(0),'#00e09e',26);}
  if(tampil('aligned')) _cad4Dim(ctx,X(a),Y(b-c),X(a-c),Y(b),(c*Math.SQRT2).toFixed(2),'#f59e0b',-16);
  if(tampil('diameter')){const ang=-Math.PI/4; ctx.strokeStyle='#a855f7'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(a/2)+d/2*sk*Math.cos(ang),Y(b/2)+d/2*sk*Math.sin(ang)); ctx.lineTo(X(a/2)+(d/2*sk+30)*Math.cos(ang),Y(b/2)+(d/2*sk+30)*Math.sin(ang)); ctx.stroke(); ctx.fillStyle='#a855f7'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('⌀'+d.toFixed(0),X(a/2)+(d/2*sk+34)*Math.cos(ang),Y(b/2)+(d/2*sk+34)*Math.sin(ang)+4);}
  if(tampil('angular')){const r=c*sk*0.9; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(a),Y(b-c),r,Math.PI*0.75,Math.PI*1.5); ctx.stroke(); ctx.fillStyle='#ec4899'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('45°',X(a)-r*1.6,Y(b-c)-r*0.9);}
  if(tampil('radius')){const cx=X(a/2),cy=Y(b/2),ang=Math.PI*1.2; ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+(d/2*sk+26)*Math.cos(ang),cy+(d/2*sk+26)*Math.sin(ang)); ctx.stroke(); ctx.fillStyle='#f97316'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right'; ctx.fillText('R'+(d/2).toFixed(1),cx+(d/2*sk+30)*Math.cos(ang),cy+(d/2*sk+30)*Math.sin(ang)); ctx.textAlign='left';}
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace';";
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(aktif===5?'Semua jenis dimensi':'Draft Dimension '+jenis[aktif],12,18);
  _ttlTulis('jenisInfo','Linear (hijau): '+a+' dan '+b+' · aligned (kuning) sisi chamfer '+(c*Math.SQRT2).toFixed(2)+' · diameter ⌀'+d+' (ungu) · angular 45° (merah muda) · radius R'+(d/2).toFixed(1)+' (jingga); luas bersih = a·b − c²/2 − πd²/4 = '+(a*b-c*c/2-Math.PI*d*d/4).toFixed(2)+' mm²');
  if(_ttlJalan('jenis')){_jnFrame++; requestAnimationFrame(drawJenis);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Chain vs baseline: akumulasi toleransi
// ════════════════════════════════════════════════════════════
let _chFrame=0;
function toggleChain(){_ttlToggle('chain','btnChain',drawChain);}
window.toggleChain=toggleChain;
function drawChain(){
  const k=_ttlKanvas('cvChain'); if(!k) return; const {ctx,W,H}=k;
  const n=Math.round(_ttlNilai('sl_ch_n',4)), t=_ttlNilai('sl_ch_t',0.2), seg=_ttlNilai('sl_ch_l',30);
  _ttlTulis('v_ch_n',String(n)); _ttlTulis('v_ch_t','±'+t.toFixed(2)); _ttlTulis('v_ch_l',seg.toFixed(0));
  const total=n*seg;
  const {X,Y}=_cad4Kisi(ctx,W,H,total+40,120,52,30,10,10);
  const sk=X(1)-X(0);
  // pelat dengan n-1 lubang
  const bar=(y0,warna,label,mode)=>{
    ctx.fillStyle='rgba(34,211,238,.10)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.strokeRect(X(0),Y(y0+20),total*sk,20*sk);
    for(let i=1;i<n;i++){ctx.fillStyle='#0a101f'; ctx.beginPath(); ctx.arc(X(i*seg),Y(y0+10),4*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();}
    ctx.fillStyle=warna; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(label,X(0),Y(y0+20)-30);
    if(mode==='chain'){for(let i=0;i<n;i++) _cad4Dim(ctx,X(i*seg),Y(y0+20),X((i+1)*seg),Y(y0+20),seg+'±'+t,warna,14,{font:9,panah:6});}
    else {for(let i=1;i<=n;i++) _cad4Dim(ctx,X(0),Y(y0+20),X(i*seg),Y(y0+20),(i*seg)+'±'+t,warna,8+i*9,{font:9,panah:6});}
  };
  bar(70,'#f59e0b','CHAIN — toleransi keseluruhan ±'+(n*t).toFixed(2)+' (menumpuk)','chain');
  bar(10,'#00e09e','BASELINE — toleransi tiap fitur ±'+t.toFixed(2)+' dari acuan','baseline');
  // indikator penyimpangan bergerak
  const fase=_ttlJalan('chain')?Math.sin(_chFrame/30):1;
  ctx.fillStyle='rgba(239,68,68,.9)'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillText('posisi lubang terakhir: chain '+(total+fase*n*t).toFixed(2)+'  vs  baseline '+(total+fase*t).toFixed(2),12,18);
  _ttlTulis('chainInfo','Dengan '+n+' ruas @'+seg+' ±'+t+': dimensi berantai membiarkan penyimpangan bertambah sampai ±'+(n*t).toFixed(2)+' pada ukuran keseluruhan, sedangkan baseline menahan tiap fitur pada ±'+t+' dari acuan yang sama');
  if(_ttlJalan('chain')){_chFrame++; requestAnimationFrame(drawChain);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Radius, diameter, sudut: sektor lingkaran dan slot
// ════════════════════════════════════════════════════════════
let _skFrame=0;
function toggleSektor(){_ttlToggle('sektor','btnSektor',drawSektor);}
window.toggleSektor=toggleSektor;
function drawSektor(){
  const k=_ttlKanvas('cvSektor'); if(!k) return; const {ctx,W,H}=k;
  const r=_ttlNilai('sl_sk_r',40), thMaks=_ttlNilai('sl_sk_th',60), L=_ttlNilai('sl_sk_L',60), d=_ttlNilai('sl_sk_d',16);
  _ttlTulis('v_sk_r',r.toFixed(0)); _ttlTulis('v_sk_th',thMaks.toFixed(0)+'°'); _ttlTulis('v_sk_L',L.toFixed(0)); _ttlTulis('v_sk_d',d.toFixed(0));
  const th=_ttlJalan('sektor')?thMaks*(0.55+0.45*Math.sin(_skFrame/45)):thMaks;
  const rad=th*Math.PI/180;
  // kiri: sektor
  const sk=Math.max(0.05,Math.min(W*0.42/(r*1.4),(H-60)/(r*1.6)));
  const cx=W*0.06+r*0.1*sk+20, cy=H*0.72;
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r*sk,0,-rad,true); ctx.closePath(); ctx.fill(); ctx.stroke();
  const am=-rad/2; ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+r*sk*Math.cos(am),cy+r*sk*Math.sin(am)); ctx.stroke();
  ctx.fillStyle='#f97316'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('R'+r,cx+r*sk*0.5*Math.cos(am)+4,cy+r*sk*0.5*Math.sin(am)-4);
  const ra=r*sk*0.3; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(cx,cy,ra,0,-rad,true); ctx.stroke(); ctx.fillStyle='#ec4899'; ctx.fillText(th.toFixed(1)+'°',cx+ra*1.15,cy-ra*0.5);
  const luasSektor=0.5*r*r*rad;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('sektor: ½r²θ = '+luasSektor.toFixed(2)+' mm²',cx-20,H-12);
  // kanan: slot
  const sk2=Math.max(0.05,Math.min(W*0.4/(L+d+20),(H-70)/(d*3)));
  const ox=W*0.56, oy=H*0.5, rr=d/2;
  ctx.fillStyle='rgba(0,224,158,.12)'; ctx.strokeStyle='#00e09e'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(ox,oy-rr*sk2); ctx.lineTo(ox+L*sk2,oy-rr*sk2); ctx.arc(ox+L*sk2,oy,rr*sk2,-Math.PI/2,Math.PI/2); ctx.lineTo(ox,oy+rr*sk2); ctx.arc(ox,oy,rr*sk2,Math.PI/2,Math.PI*1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  _cad4Dim(ctx,ox,oy,ox+L*sk2,oy,L.toFixed(0),'#f59e0b',-(rr*sk2+22),{font:9,panah:6});
  _cad4Dim(ctx,ox-rr*sk2,oy+rr*sk2,ox+(L+rr)*sk2,oy+rr*sk2,(L+d).toFixed(0),'#f59e0b',18,{font:9,panah:6});
  ctx.strokeStyle='#f97316'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ox+L*sk2,oy); ctx.lineTo(ox+L*sk2+rr*sk2*Math.cos(-0.6),oy+rr*sk2*Math.sin(-0.6)); ctx.stroke(); ctx.fillStyle='#f97316'; ctx.fillText('R'+rr,ox+L*sk2+rr*sk2*Math.cos(-0.6)+4,oy+rr*sk2*Math.sin(-0.6)-4);
  const luasSlot=2*rr*L+Math.PI*rr*rr;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('slot: 2rL + πr² = '+luasSlot.toFixed(2)+' mm²',ox-10,H-12);
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Radius (R), diameter (⌀), dan angular (°) pada sektor dan slot',12,18);
  _ttlTulis('sektorInfo','Sektor r = '+r+', θ = '+th.toFixed(1)+'°: luas ½·r²·θ(rad) = '+luasSektor.toFixed(2)+' mm² · slot L = '+L+', d = '+d+': luas 2·r·L + π·r² = '+luasSlot.toFixed(2)+' mm², panjang total L + d = '+(L+d));
  if(_ttlJalan('sektor')){_skFrame++; requestAnimationFrame(drawSektor);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Format dimensi: FontSize, ArrowSize, Decimals, ExtLines
// ════════════════════════════════════════════════════════════
let _fmFrame=0;
function toggleFormat(){_ttlToggle('format','btnFormat',drawFormat);}
window.toggleFormat=toggleFormat;
function drawFormat(){
  const k=_ttlKanvas('cvFormat'); if(!k) return; const {ctx,W,H}=k;
  const font=_ttlNilai('sl_fm_font',3.5), panah=_ttlNilai('sl_fm_panah',2), dec=Math.round(_ttlNilai('sl_fm_dec',2)), ext=_ttlNilai('sl_fm_ext',1.2);
  _ttlTulis('v_fm_font',font.toFixed(1)); _ttlTulis('v_fm_panah',panah.toFixed(1)); _ttlTulis('v_fm_dec',String(dec)); _ttlTulis('v_fm_ext',ext.toFixed(1));
  const nilai=120.4567;
  const {X,Y}=_cad4Kisi(ctx,W,H,200,110,52,34,20,20);
  const sk=X(1)-X(0);
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.strokeRect(X(0),Y(60),120.4567*sk,60*sk);
  const gaya={font:font*3.2,panah:panah*4,ext:ext};
  const teks=nilai.toFixed(dec)+(dec===0?'':'');
  _cad4Dim(ctx,X(0),Y(0),X(nilai),Y(0),teks,'#00e09e',26,gaya);
  _cad4Dim(ctx,X(0),Y(60),X(0),Y(0),(60).toFixed(dec),'#00e09e',28,gaya);
  const denyut=_ttlJalan('format')?0.5+0.5*Math.sin(_fmFrame/25):1;
  ctx.fillStyle='rgba(168,85,247,'+(0.5+0.5*denyut)+')'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillText('AnnotationStyle "ISO-A4": FontSize '+font.toFixed(1)+' · ArrowSize '+panah.toFixed(1)+' · Decimals '+dec+' · ExtLines '+ext.toFixed(1),X(0),Y(60)-40);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText('Nilai geometri tetap '+nilai+' mm; yang berubah hanya tampilannya',12,18);
  _ttlTulis('formatInfo','Decimals '+dec+' menampilkan "'+teks+'" dari nilai '+nilai+'; FontSize/ArrowSize dalam mm kertas (ISO: teks 3,5 mm, panah 2–3 mm untuk A4); ExtLines mengatur seberapa jauh garis perpanjangan melewati garis dimensi');
  if(_ttlJalan('format')){_fmFrame++; requestAnimationFrame(drawFormat);}
}

_TTL_DAFTAR.push(['cvJenis',()=>drawJenis(),'jenis',['sl_jn_a','sl_jn_b','sl_jn_d','sl_jn_c']]);
_TTL_DAFTAR.push(['cvChain',()=>drawChain(),'chain',['sl_ch_n','sl_ch_t','sl_ch_l']]);
_TTL_DAFTAR.push(['cvSektor',()=>drawSektor(),'sektor',['sl_sk_r','sl_sk_th','sl_sk_L','sl_sk_d']]);
_TTL_DAFTAR.push(['cvFormat',()=>drawFormat(),'format',['sl_fm_font','sl_fm_panah','sl_fm_dec','sl_fm_ext']]);
_ttlMulai();
