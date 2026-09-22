// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 10 PEMODELAN CAD — Optimasi Desain Pasca-Simulasi
// Kanvas: cvFilletKt, cvRusuk, cvLubangMassa, cvIprofil (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Kanvas sempit (W < _TTL_SEMPIT, ponsel) memakai tata letak bertumpuk yang lebih tinggi;
// kanvas lebar mempertahankan tata letak desktop. Teks panjang ditulis lewat _ttlTeks.
// ════════════════════════════════════════════════════════════
const _C10_SIZIN=125, _C10_E=210000, _C10F="'JetBrains Mono',monospace";
function _cad10Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px "+_C10F; ctx.textAlign=align||'left'; ctx.fillText(s,x,y); ctx.textAlign='left';}
// Seperti _cad10Teks, tetapi dijaga muat maxW lewat _ttlTeks (dikecilkan, lalu dipecah). Kembali: y berikutnya.
function _cad10Muat(ctx,s,x,y,maxW,warna,font,align,lh){ctx.fillStyle=warna; ctx.font=font||"11px "+_C10F; ctx.textAlign=align||'left'; const yb=_ttlTeks(ctx,s,x,y,maxW,{lh:lh||13}); ctx.textAlign='left'; return yb;}
// Label rata tengah di xc, digeser (dan bila perlu dikecilkan) agar utuh di antara 12 dan W − 12.
function _cad10Tengah(ctx,s,xc,y,W,warna,font){ctx.font=font; const w=Math.min(ctx.measureText(s).width,W-24); return _cad10Muat(ctx,s,Math.max(12+w/2,Math.min(W-12-w/2,xc)),y,W-24,warna,font,'center');}
// Sekolom baris [teks, warna, font, dy] mulai y (dy = jarak baku dari y), masing-masing lewat
// _ttlTeks; baris yang dipecah menggeser baris sesudahnya ke bawah. Bila semuanya muat, hasilnya
// sama dengan fillText biasa. Kembali: y berikutnya.
function _cad10Kolom(ctx,x,y,maxW,baris){
  let geser=0, akhir=y;
  for(const [teks,warna,font,dy] of baris){
    const lh=Math.round(parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)[1])*1.3), yy=y+dy+geser;
    ctx.fillStyle=warna; ctx.font=font; ctx.textAlign='left'; akhir=_ttlTeks(ctx,teks,x,yy,maxW,{lh}); geser+=akhir-(yy+lh);
  }
  return akhir;
}
// Batang ukur tegak: nilai v terhadap skala maks; garis batas (mis. σ_izin) opsional.
function _cad10Gauge(ctx,x,y0,w,h,v,maks,warna,label,batas){
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=1; ctx.strokeRect(x,y0-h,w,h);
  const f=Math.max(0,Math.min(1,v/maks)); ctx.fillStyle=warna; ctx.globalAlpha=.55; ctx.fillRect(x,y0-h*f,w,h*f); ctx.globalAlpha=1;
  if(batas){const yb=y0-h*Math.min(1,batas/maks); _ttlGaris(ctx,x-6,yb,x+w+6,yb,'#ef4444',1.2,[4,3]);}
  _cad10Teks(ctx,label,x+w/2,y0+14,'rgba(226,232,240,.85)',"10px "+_C10F,'center');
}
function _cad10Igab(b,t,tr,hr){const A1=b*t,y1=t/2,A2=tr*hr,y2=t+hr/2; const yb=(A1*y1+A2*y2)/(A1+A2); return {I:b*t*t*t/12+A1*(y1-yb)*(y1-yb)+tr*hr*hr*hr/12+A2*(y2-yb)*(y2-yb),yb:yb};}
function _cad10KtLubang(x){return 3.00-3.13*x+3.66*x*x-1.53*x*x*x;}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Radius fillet pada bahu: Kt dan σ_maks turun
// ════════════════════════════════════════════════════════════
let _fkFrame=0;
function toggleFilletKt(){_ttlToggle('filletkt','btnFilletKt',drawFilletKt);}
window.toggleFilletKt=toggleFilletKt;
function drawFilletKt(){
  const k=_ttlKanvas('cvFilletKt',340); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, sedang=!sempit&&W<700, f10="10px "+_C10F, f11="11px "+_C10F;
  const rM=_ttlNilai('sl_fk_r',2), h=_ttlNilai('sl_fk_h',5), sn=_ttlNilai('sl_fk_s',90);
  _ttlTulis('v_fk_r',rM.toFixed(1)); _ttlTulis('v_fk_h',h.toFixed(0)); _ttlTulis('v_fk_s',sn.toFixed(0));
  const r=_ttlJalan('filletkt')?0.5+(rM-0.5)*(0.5+0.5*Math.sin(_fkFrame/45-Math.PI/2)):rM;
  const Kt=1+0.5*Math.sqrt(h/r), sm=Kt*sn;
  // tinggi: bila r > h busur fillet melewati bahu, jadi skala tegak ikut memperhitungkan r slider
  const d=20, D=d+2*h, L1=36, L2=34, tinggi=Math.max(D,d+2*rM);
  // judul (ponsel: dua baris selalu disediakan karena panjangnya ikut r yang beranimasi)
  _cad10Muat(ctx,'Bahu bertingkat D/d = '+(D/d).toFixed(2)+', fillet\u00a0r\u00a0=\u00a0'+r.toFixed(1)+'\u00a0mm',12,18,W-24,'rgba(226,232,240,.92)',f11,'left',14);
  const yJ=sempit?46:32;
  // Ponsel: batang bertingkat selebar kanvas di bawah judul, lalu rumus, lalu batang ukur.
  const sk=Math.max(0.05,sempit?Math.min((W-46)/(L1+L2+8),96/(tinggi+6)):Math.min((W*0.56)/(L1+L2+8),(H-80)/(tinggi+6)));
  const ox=sempit?24:W*0.05, oy=sempit?yJ+8+Math.max(10*sk+34,(10+rM)*sk+14,D/2*sk):H*0.52, X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // batang bertingkat dengan fillet radius r di kedua sudut dalam bahu
  ctx.beginPath(); ctx.moveTo(X(0),Y(D/2)); ctx.lineTo(X(L1),Y(D/2)); ctx.lineTo(X(L1),Y(d/2+r));
  ctx.arc(X(L1+r),Y(d/2+r),r*sk,Math.PI,Math.PI/2,true);
  ctx.lineTo(X(L1+L2),Y(d/2)); ctx.lineTo(X(L1+L2),Y(-d/2)); ctx.lineTo(X(L1+r),Y(-d/2));
  ctx.arc(X(L1+r),Y(-d/2-r),r*sk,3*Math.PI/2,Math.PI,true);
  ctx.lineTo(X(L1),Y(-D/2)); ctx.lineTo(X(0),Y(-D/2)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.stroke();
  // jepit kiri, beban F di ujung kanan
  for(let i=0;i<=6;i++){const yy=Y(D/2)+i*(D*sk/6); _ttlGaris(ctx,X(0),yy,X(0)-8,yy+8,'#94a3b8',1);}
  _ttlGaris(ctx,X(L1+L2-4),Y(d/2)-34,X(L1+L2-4),Y(d/2)-4,'#f59e0b',1.8); ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(X(L1+L2-4),Y(d/2)-2); ctx.lineTo(X(L1+L2-4)-5,Y(d/2)-11); ctx.lineTo(X(L1+L2-4)+5,Y(d/2)-11); ctx.fill();
  _cad10Teks(ctx,'F',X(L1+L2-4)+8,Y(d/2)-22,'#f59e0b',"bold 11px "+_C10F);
  // sorotan merah di kaki fillet, sebanding (Kt − 1)
  const a=Math.max(0.05,Math.min(0.85,(Kt-1)/1.3));
  [[X(L1+2),Y(d/2)-2],[X(L1+2),Y(-d/2)+2]].forEach(([cx,cy])=>{const g=ctx.createRadialGradient(cx,cy,1,cx,cy,14+8*a); g.addColorStop(0,'rgba(239,68,68,'+a+')'); g.addColorStop(1,'rgba(239,68,68,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,14+8*a,0,Math.PI*2); ctx.fill();});
  // label r mengikuti fillet, tetapi berhenti 6 px sebelum panah F (r besar di kanvas kecil)
  const sR='r = '+r.toFixed(1); ctx.font="bold 10px "+_C10F;
  _cad10Teks(ctx,sR,Math.min(X(L1+r)+4,X(L1+L2-4)-6-ctx.measureText(sR).width),Y(d/2+r)-6,'#ec4899',"bold 10px "+_C10F);
  _cad10Teks(ctx,'h = '+h.toFixed(0),X(L1)-6,Y(D/2)+12,'#f59e0b',f10,'right');
  // rumus (kanan; ponsel: di bawah batang) lalu batang σ_nom dan σ_maks vs σ_izin.
  // Batang ukur dibuat sedikit lebih pendek dari semula agar puncaknya tidak menabrak baris SF.
  const col=sm>_C10_SIZIN?'#ef4444':'#00e09e';
  const baris=[['Kt ≈ 1 + 0,5·√(h/r) = '+Kt.toFixed(2),'#22d3ee',f11,0],
    ['σ_maks = Kt·σ_nom = '+sm.toFixed(1)+' MPa',col,f11,sempit?17:18],
    [sm>_C10_SIZIN?'SF = 250/σ_maks = '+(250/sm).toFixed(2)+' < 2 →\u00a0perbesar\u00a0r':'SF = '+(250/sm).toFixed(2)+' ≥ 2 →\u00a0lolos','rgba(148,163,184,.9)',f10,sempit?34:36]];
  let gx,gy,gh,dxG,wG;
  if(sempit){const yK=_cad10Kolom(ctx,12,oy+Math.max(D/2,10+rM)*sk+22,W-24,baris); gx=16; gy=H-24; gh=Math.max(40,gy-yK-14); dxG=64; wG=30;}
  else {gx=sedang?W*0.60:W*0.66; _cad10Kolom(ctx,gx,H*0.16,W-gx-8,baris); gy=H*0.80; gh=H*0.48; dxG=70; wG=34;}
  const maks=Math.max(200,sm*1.15);
  _cad10Gauge(ctx,gx,gy,wG,gh,sn,maks,'#22d3ee','σ_nom',_C10_SIZIN);
  _cad10Gauge(ctx,gx+dxG,gy,wG,gh,sm,maks,col,'σ_maks',_C10_SIZIN);
  _cad10Teks(ctx,'σ_izin 125',gx+dxG+wG+14,gy-gh*Math.min(1,_C10_SIZIN/maks)+4,'#ef4444',f10);
  _ttlTulis('filletKtInfo','Bahu h = '+h.toFixed(0)+' mm dengan fillet r = '+r.toFixed(2)+' mm: Kt ≈ 1 + 0,5·√('+h.toFixed(0)+'/'+r.toFixed(2)+') = '+Kt.toFixed(3)+'; σ_maks = '+Kt.toFixed(3)+' × '+sn.toFixed(0)+' = '+sm.toFixed(1)+' MPa ('+(sm>_C10_SIZIN?'melebihi':'di bawah')+' σ_izin 125 MPa, SF = '+(250/sm).toFixed(2)+')');
  if(_ttlJalan('filletkt')){_fkFrame++; requestAnimationFrame(drawFilletKt);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Rusuk tumbuh: momen inersia naik, defleksi turun
// ════════════════════════════════════════════════════════════
let _rbFrame=0;
function toggleRusuk(){_ttlToggle('rusuk','btnRusuk',drawRusuk);}
window.toggleRusuk=toggleRusuk;
function drawRusuk(){
  const k=_ttlKanvas('cvRusuk',350); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, f10="10px "+_C10F, f11="11px "+_C10F;
  const hrM=_ttlNilai('sl_rb_hr',25), tr=_ttlNilai('sl_rb_tr',5), F=_ttlNilai('sl_rb_F',400);
  _ttlTulis('v_rb_hr',hrM.toFixed(0)); _ttlTulis('v_rb_tr',tr.toFixed(0)); _ttlTulis('v_rb_F',F.toFixed(0));
  const hr=_ttlJalan('rusuk')?hrM*(0.5+0.5*Math.sin(_rbFrame/50-Math.PI/2)):hrM;
  const b=60, t=6, L=200;
  const I0=b*t*t*t/12, g=hr>0?_cad10Igab(b,t,tr,hr):{I:I0,yb:t/2};
  const d0=F*L*L*L/(3*_C10_E*I0), d1=F*L*L*L/(3*_C10_E*g.I);
  // judul (ponsel: dua baris selalu disediakan karena panjangnya ikut h_r yang beranimasi)
  _cad10Muat(ctx,'Kantilever L = '+L+' mm, pelat '+b+'\u00a0×\u00a0'+t+' baja; rusuk '+tr.toFixed(0)+'\u00a0×\u00a0'+hr.toFixed(1)+'\u00a0mm',12,18,W-24,'rgba(226,232,240,.92)',f11,'left',14);
  const baris=[['I_gab = '+g.I.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴  ('+(g.I/I0).toFixed(1)+'×\u00a0pelat)','#22d3ee',f11,0],
    ['δ = F·L³/(3·E·I) = '+d1.toFixed(3)+' mm',d1<=L/250?'#00e09e':'#ef4444',f11,sempit?17:18],
    ['batas L/250 = '+(L/250).toFixed(2)+' mm · volume\u00a0+'+(100*tr*hr/(b*t)).toFixed(0)+'\u00a0%','rgba(148,163,184,.9)',f10,sempit?34:36]];
  // Label sumbu netral: templat berangka tetap agar tata letak tidak bergeser saat ȳ beranimasi.
  // Di bawah lebar 700 label dipecah dua baris supaya kantilever di kanannya cukup panjang
  // (bila terlalu pendek, label F yang bergerak menabrak label "pelat polos δ").
  const duaBaris=W<700; ctx.font=f10; const wSumbu=ctx.measureText(duaBaris?'sumbu netral':'sumbu netral ȳ = 00.0').width;
  let sk,cx,y0,bx0,bx1,by,skala;
  if(sempit){
    // Ponsel: angka di bawah judul → penampang T (label sumbu dua baris) → kantilever selebar kanvas.
    const yK=_cad10Kolom(ctx,12,54,W-24,baris);
    sk=Math.max(0.05,Math.min((W-54-wSumbu)/b,64/(t+hrM))); cx=26+b/2*sk; y0=yK+24+(t+hrM)*sk;
    bx0=26; bx1=W-14; by=y0+46; skala=Math.max(24,Math.min(48,H-by-70))/Math.max(d0,1e-9);
  } else {
    sk=Math.max(0.05,Math.min((W*0.26)/(b+10),(H-90)/(t+hrM+10))); cx=W*0.16; y0=H*0.80;
    // Kantilever mulai sesudah label sumbu netral (dulu tertimpa label "pelat polos δ" di lebar 800).
    bx0=Math.max(W*0.42,cx+b/2*sk+16+wSumbu+6); bx1=W*0.92; by=H*0.42; skala=(H*0.28)/Math.max(d0,1e-9);
    _cad10Kolom(ctx,bx0,H*0.16,W-bx0-8,baris);
  }
  const X=x=>cx+x*sk, Y=y=>y0-y*sk;
  // kiri: penampang T (skala)
  ctx.fillStyle='rgba(34,211,238,.18)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.fillRect(X(-b/2),Y(t),b*sk,t*sk); ctx.strokeRect(X(-b/2),Y(t),b*sk,t*sk);
  if(hr>0){ctx.fillStyle='rgba(245,158,11,.28)'; ctx.strokeStyle='#f59e0b'; ctx.fillRect(X(-tr/2),Y(t+hr),tr*sk,hr*sk); ctx.strokeRect(X(-tr/2),Y(t+hr),tr*sk,hr*sk);}
  _ttlGaris(ctx,X(-b/2)-14,Y(g.yb),X(b/2)+14,Y(g.yb),'#ef4444',1.2,[6,3,2,3]);
  if(duaBaris){_cad10Teks(ctx,'sumbu netral',X(b/2)+16,Y(g.yb)+4,'#ef4444',f10); _cad10Teks(ctx,'ȳ = '+g.yb.toFixed(1),X(b/2)+16,Y(g.yb)+15,'#ef4444',f10);}
  else _cad10Teks(ctx,'sumbu netral ȳ = '+g.yb.toFixed(1),X(b/2)+16,Y(g.yb)+4,'#ef4444',f10);
  _cad10Teks(ctx,'pelat '+b+' × '+t,cx,y0+16,'#22d3ee',f10,'center');
  // Label rusuk di samping puncak rusuk; bila bisa menabrak label sumbu netral (kanvas kecil atau
  // rusuk tebal), dipindah ke atas puncak rusuk. Pilihan ini hanya bergantung pada slider dan lebar.
  if(hr>0){const sR='rusuk '+tr.toFixed(0)+' × '+hr.toFixed(1); ctx.font=f10; const wR=ctx.measureText('rusuk '+tr.toFixed(0)+' × 00.0').width;
    if(sempit||X(tr/2)+6+wR>X(b/2)+12) _cad10Teks(ctx,sR,cx,Y(t+hr)-6,'#f59e0b',f10,'center');
    else _cad10Teks(ctx,sR,X(tr/2)+6,Y(t+hr)+12,'#f59e0b',f10);}
  // kanan (ponsel: bawah): kantilever samping dengan lendutan (dilebihkan; δ pelat polos = skala tetap)
  for(let i=0;i<=5;i++){_ttlGaris(ctx,bx0,by-24+i*10,bx0-8,by-16+i*10,'#94a3b8',1);} _ttlGaris(ctx,bx0,by-26,bx0,by+28,'#94a3b8',1.6);
  const kurva=(dd,warna,lebar,putus)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.setLineDash(putus||[]); ctx.beginPath(); for(let i=0;i<=40;i++){const x=i/40; const y=dd*skala*(3*x*x-x*x*x)/2; i?ctx.lineTo(bx0+(bx1-bx0)*x,by+y):ctx.moveTo(bx0,by);} ctx.stroke(); ctx.setLineDash([]);};
  kurva(d0,'rgba(148,163,184,.5)',1.2,[5,4]); kurva(d1,'#00e09e',3);
  _ttlGaris(ctx,bx1-6,by+d1*skala+6,bx1-6,by+d1*skala+30,'#f59e0b',1.8); ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(bx1-6,by+d1*skala+32); ctx.lineTo(bx1-11,by+d1*skala+23); ctx.lineTo(bx1-1,by+d1*skala+23); ctx.fill();
  _cad10Teks(ctx,'F = '+F.toFixed(0)+' N',bx1-60,by+d1*skala+44,'#f59e0b',f10);
  // ponsel: label pelat polos di baris sendiri paling bawah agar tidak ditabrak label F yang bergerak
  _cad10Teks(ctx,'pelat polos δ = '+d0.toFixed(2)+' mm',sempit?12:bx0+8,sempit?H-10:by+d0*skala+16,'rgba(148,163,184,.85)',f10);
  _ttlTulis('rusukInfo','Rusuk '+tr.toFixed(0)+' × '+hr.toFixed(1)+' mm menggeser sumbu netral ke ȳ = '+g.yb.toFixed(2)+' mm dan menaikkan I dari '+I0.toFixed(0)+' ke '+g.I.toFixed(0)+' mm⁴ ('+(g.I/I0).toFixed(1)+'×); defleksi ujung turun dari '+d0.toFixed(3)+' ke '+d1.toFixed(3)+' mm dengan tambahan luas hanya '+(100*tr*hr/(b*t)).toFixed(0)+' %');
  if(_ttlJalan('rusuk')){_rbFrame++; requestAnimationFrame(drawRusuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Lubang penghemat massa: massa turun, σ_maks naik
// ════════════════════════════════════════════════════════════
let _lmFrame=0;
function toggleLubangMassa(){_ttlToggle('lubangmassa','btnLubangMassa',drawLubangMassa);}
window.toggleLubangMassa=toggleLubangMassa;
function drawLubangMassa(){
  const k=_ttlKanvas('cvLubangMassa',340); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, f10="10px "+_C10F, f11="11px "+_C10F;
  const dM=_ttlNilai('sl_lm_d',15), F=_ttlNilai('sl_lm_F',12000), t=_ttlNilai('sl_lm_t',10);
  _ttlTulis('v_lm_d',dM.toFixed(0)); _ttlTulis('v_lm_F',F.toFixed(0)); _ttlTulis('v_lm_t',t.toFixed(0));
  const d=_ttlJalan('lubangmassa')?dM*(0.5+0.5*Math.sin(_lmFrame/50-Math.PI/2)):dM;
  const a=110, b=70;
  const m0=7.85e-3*a*b*t, m=7.85e-3*(a*b*t-3*Math.PI*d*d*t/4);
  const Kt=d>0.01?_cad10KtLubang(d/b):1, sn=F/((b-d)*t), sm=Kt*sn;
  const yJ=_cad10Muat(ctx,'Pelat 3 lubang LinearPattern: massa vs tegangan tepi lubang',12,18,W-24,'rgba(226,232,240,.92)',f11,'left',14);
  // Ponsel: pelat di tengah di bawah judul (ruang kiri-kanan untuk panah F), lalu angka, lalu batang ukur.
  const sk=Math.max(0.05,sempit?Math.min((W-92)/a,84/b):Math.min((W*0.5)/(a+20),(H-90)/(b+20)));
  const ox=sempit?(W-a*sk)/2:Math.max(W*0.06,38), oy=sempit?yJ+10:H*0.24, X=x=>ox+x*sk, Y=y=>oy+y*sk;
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.fillRect(X(0),Y(0),a*sk,b*sk); ctx.strokeRect(X(0),Y(0),a*sk,b*sk);
  [0.25,0.5,0.75].forEach(f=>{if(d>0.1){ctx.beginPath(); ctx.arc(X(a*f),Y(b/2),d/2*sk,0,Math.PI*2); ctx.fillStyle='#0a101f'; ctx.fill(); ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.8; ctx.stroke();
    const g=ctx.createRadialGradient(X(a*f),Y(b/2),d/2*sk,X(a*f),Y(b/2),d/2*sk+10); g.addColorStop(0,'rgba(239,68,68,'+Math.min(.8,sm/250)+')'); g.addColorStop(1,'rgba(239,68,68,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(X(a*f),Y(b/2),d/2*sk+10,0,Math.PI*2); ctx.fill();}});
  // gaya tarik kiri-kanan
  _ttlGaris(ctx,X(0)-4,Y(b/2),X(0)-30,Y(b/2),'#f59e0b',1.8); _ttlGaris(ctx,X(a)+4,Y(b/2),X(a)+30,Y(b/2),'#f59e0b',1.8);
  _cad10Teks(ctx,'F',X(0)-30,Y(b/2)-8,'#f59e0b',"bold 11px "+_C10F,'center'); _cad10Teks(ctx,'F',X(a)+30,Y(b/2)-8,'#f59e0b',"bold 11px "+_C10F,'center');
  _cad10Tengah(ctx,'pelat '+a+' × '+b+' × '+t.toFixed(0)+', 3 lubang ⌀'+d.toFixed(1),X(a/2),Y(b)+16,W,'#22d3ee',f10);
  // angka (kanan atas; ponsel: di bawah pelat) dan batang ukur massa serta σ_maks
  const col=sm>_C10_SIZIN?'#ef4444':'#00e09e';
  const baris=[['m = '+m.toFixed(1)+' g (−'+(100*(m0-m)/m0).toFixed(1)+' %)','#22d3ee',f11,0],
    ['Kt('+(d/b).toFixed(2)+') = '+Kt.toFixed(2)+' · σ_nom = '+sn.toFixed(1),'rgba(148,163,184,.9)',f10,sempit?17:18],
    ['σ_maks = '+sm.toFixed(1)+' MPa'+(sm>_C10_SIZIN?' →\u00a0GAGAL':' →\u00a0lolos'),col,f11,sempit?34:36]];
  let gx,gy,gh,dxG,wG;
  if(sempit){const yK=_cad10Kolom(ctx,12,Y(b)+40,W-24,baris); gx=16; gy=H-24; gh=Math.max(40,gy-yK-14); dxG=64; wG=30;}
  else {gx=Math.min(W*0.66,W-186); _cad10Kolom(ctx,gx,H*0.16,W-gx-8,baris); gy=H*0.80; gh=H*0.50; dxG=70; wG=34;}
  const maksS=Math.max(250,sm*1.1);
  _cad10Gauge(ctx,gx,gy,wG,gh,m,m0,'#22d3ee','massa');
  _cad10Gauge(ctx,gx+dxG,gy,wG,gh,sm,maksS,col,'σ_maks',_C10_SIZIN);
  _cad10Teks(ctx,'σ_izin 125',gx+dxG+wG+14,gy-gh*Math.min(1,_C10_SIZIN/maksS)+4,'#ef4444',f10);
  _ttlTulis('lubangMassaInfo','Tiga lubang ⌀'+d.toFixed(1)+' pada pelat '+a+' × '+b+' × '+t.toFixed(0)+' menurunkan massa dari '+m0.toFixed(1)+' ke '+m.toFixed(1)+' g; tegangan nominal F/((b − d)·t) = '+sn.toFixed(2)+' MPa dikalikan Kt = '+Kt.toFixed(2)+' menjadi σ_maks = '+sm.toFixed(1)+' MPa ('+(sm>_C10_SIZIN?'melebihi':'≤')+' σ_izin 125 MPa)');
  if(_ttlJalan('lubangmassa')){_lmFrame++; requestAnimationFrame(drawLubangMassa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Profil I vs persegi panjang ber-I sama (parameter B, H, t_f, t_w)
// ════════════════════════════════════════════════════════════
let _ipFrame=0;
function toggleIprofil(){_ttlToggle('iprofil','btnIprofil',drawIprofil);}
window.toggleIprofil=toggleIprofil;
function drawIprofil(){
  const k=_ttlKanvas('cvIprofil',356); if(!k) return; const {ctx,W,H}=k;
  const sempit=W<_TTL_SEMPIT, sedang=!sempit&&W<780, f10="10px "+_C10F, f11="11px "+_C10F;
  const B=_ttlNilai('sl_ip_B',50), Hh=_ttlNilai('sl_ip_H',90), tf=Math.min(_ttlNilai('sl_ip_tf',6),Hh/2-1), tw=Math.min(_ttlNilai('sl_ip_tw',5),B-1);
  _ttlTulis('v_ip_B',B.toFixed(0)); _ttlTulis('v_ip_H',Hh.toFixed(0)); _ttlTulis('v_ip_tf',tf.toFixed(1)); _ttlTulis('v_ip_tw',tw.toFixed(1));
  const I=(B*Hh*Hh*Hh-(B-tw)*Math.pow(Hh-2*tf,3))/12, A=B*Hh-(B-tw)*(Hh-2*tf);
  const hR=Math.cbrt(12*I/B), AR=B*hR;
  const hNow=_ttlJalan('iprofil')?hR*(0.5+0.5*Math.sin(_ipFrame/55-Math.PI/2)):hR;
  const Inow=B*hNow*hNow*hNow/12, tMaks=Math.max(Hh,hR);
  const judul='Iterasi penampang: alias\u00a0B,\u00a0H,\u00a0t_f,\u00a0t_w\u00a0→\u00a0I_x;', judul2='persegi panjang tumbuh sampai I\u00a0sama';
  const yJ=sempit?_cad10Muat(ctx,judul2,12,_cad10Muat(ctx,judul,12,18,W-24,'rgba(226,232,240,.92)',f11,'left',14),W-24,'rgba(226,232,240,.92)',f11,'left',14)
    :_cad10Muat(ctx,judul+' '+judul2,12,18,W-24,'rgba(226,232,240,.92)',f11,'left',14);
  // Ponsel: kedua penampang di bawah judul, label bertingkat, lalu kolom angka di bawahnya.
  // Kanvas sedang: penampang diperkecil agar kolom angka kanan muat.
  const sk=Math.max(0.05,sempit?Math.min(W*0.28/B,(W<230?96:112)/tMaks):sedang?Math.min(W*0.13/B,205/tMaks):Math.min((W*0.18)/B,(H-90)/tMaks));
  const cx1=W*(sempit?0.27:sedang?0.15:0.17), cx2=W*(sempit?0.70:sedang?0.40:0.46), cy=sempit?yJ+6+tMaks/2*sk:H*(sedang?0.48:0.52);
  // profil I
  const p=[[-B/2,-Hh/2],[B/2,-Hh/2],[B/2,-Hh/2+tf],[tw/2,-Hh/2+tf],[tw/2,Hh/2-tf],[B/2,Hh/2-tf],[B/2,Hh/2],[-B/2,Hh/2],[-B/2,Hh/2-tf],[-tw/2,Hh/2-tf],[-tw/2,-Hh/2+tf],[-B/2,-Hh/2+tf]];
  ctx.beginPath(); p.forEach((q,i)=>i?ctx.lineTo(cx1+q[0]*sk,cy+q[1]*sk):ctx.moveTo(cx1+q[0]*sk,cy+q[1]*sk)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.18)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.stroke();
  // persegi panjang lebar B, tinggi tumbuh sampai I sama
  ctx.fillStyle='rgba(236,72,153,.16)'; ctx.strokeStyle='#ec4899'; ctx.fillRect(cx2-B/2*sk,cy-hNow/2*sk,B*sk,hNow*sk); ctx.strokeRect(cx2-B/2*sk,cy-hNow/2*sk,B*sk,hNow*sk);
  _ttlGaris(ctx,cx1-B/2*sk-16,cy,cx2+B/2*sk+16,cy,'#ef4444',1,[8,3,2,3]);
  _cad10Teks(ctx,'X',cx2+B/2*sk+20,cy+4,'#ef4444',"bold 10px "+_C10F);
  // label penampang; di kanvas sempit/sedang dipecah bertingkat agar tidak saling menimpa
  const yL=cy+tMaks/2*sk+(sempit?15:18), pI='B '+B.toFixed(0)+' · H '+Hh.toFixed(0), pT='t_f '+tf.toFixed(1)+' · t_w '+tw.toFixed(1);
  if(sempit){
    _cad10Tengah(ctx,'profil I',cx1,yL,W,'#22d3ee',f10); _cad10Tengah(ctx,'persegi panjang',cx2,yL,W,'#ec4899',f10);
    _cad10Tengah(ctx,pI,cx1,yL+13,W,'#22d3ee',f10); _cad10Tengah(ctx,'B × '+hNow.toFixed(1),cx2,yL+13,W,'#ec4899',f10);
    _cad10Tengah(ctx,pT,cx1,yL+26,W,'#22d3ee',f10);
  } else if(sedang){
    _cad10Tengah(ctx,'profil I',cx1,yL,W,'#22d3ee',f10); _cad10Tengah(ctx,'persegi panjang B × '+hNow.toFixed(1),cx2,yL,W,'#ec4899',f10);
    _cad10Tengah(ctx,pI+' · '+pT,cx1,yL+13,W,'#22d3ee',f10);
  } else {
    _cad10Tengah(ctx,'profil I  '+pI+' · '+pT,cx1,yL,W,'#22d3ee',f10);
    _cad10Tengah(ctx,'persegi panjang B × '+hNow.toFixed(1),cx2,yL,W,'#ec4899',f10);
  }
  const tx=sempit?12:sedang?W*0.57:W*0.66, dg=sempit?[0,16,35,50,68,84]:[0,18,46,64,92,110];
  _cad10Kolom(ctx,tx,sempit?yL+26+24:H*0.16,W-tx-(sempit?12:8),[
    ['I_x = [B·H³ − (B\u00a0−\u00a0t_w)(H\u00a0−\u00a02t_f)³]/12','#22d3ee',f10,dg[0]],
    ['= '+I.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴, A = '+A.toFixed(0)+' mm²','#00e09e',f11,dg[1]],
    ['persegi panjang: I = '+Inow.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴','#ec4899',f10,dg[2]],
    ['h = '+hNow.toFixed(1)+' mm, A = '+(B*hNow).toFixed(0)+' mm²','#ec4899',f10,dg[3]],
    ['I sama saat h = (12·I/B)^(1/3) =\u00a0'+hR.toFixed(1),'rgba(148,163,184,.9)',f10,dg[4]],
    ['→ massa '+(AR/A).toFixed(2)+'× profil I','#f59e0b',f11,dg[5]]]);
  _ttlTulis('iprofilInfo','Profil I B = '+B.toFixed(0)+', H = '+Hh.toFixed(0)+', t_f = '+tf.toFixed(1)+', t_w = '+tw.toFixed(1)+': I_x = '+I.toFixed(0)+' mm⁴ dengan luas '+A.toFixed(0)+' mm²; persegi panjang selebar B butuh tinggi '+hR.toFixed(2)+' mm (luas '+AR.toFixed(0)+' mm², '+(AR/A).toFixed(2)+'× massa per satuan panjang) untuk momen inersia yang sama');
  if(_ttlJalan('iprofil')){_ipFrame++; requestAnimationFrame(drawIprofil);}
}

_TTL_DAFTAR.push(['cvFilletKt',()=>drawFilletKt(),'filletkt',['sl_fk_r','sl_fk_h','sl_fk_s']]);
_TTL_DAFTAR.push(['cvRusuk',()=>drawRusuk(),'rusuk',['sl_rb_hr','sl_rb_tr','sl_rb_F']]);
_TTL_DAFTAR.push(['cvLubangMassa',()=>drawLubangMassa(),'lubangmassa',['sl_lm_d','sl_lm_F','sl_lm_t']]);
_TTL_DAFTAR.push(['cvIprofil',()=>drawIprofil(),'iprofil',['sl_ip_B','sl_ip_H','sl_ip_tf','sl_ip_tw']]);
_ttlMulai();
