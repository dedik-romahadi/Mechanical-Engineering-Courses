// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 3 PEMODELAN CAD — Bentuk Dasar 2D, Pengukuran, dan Transformasi Objek
// Kanvas: cvBentuk, cvUkur, cvPutar, cvTransform (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _CAD3_X='#ef4444', _CAD3_Y='#22c55e';
function _cad3Kisi(ctx,W,H,lebarMm,tinggiMm,padL,padB,ox0,oy0){
  const sk=Math.max(0.05,Math.min((W-padL-24)/lebarMm,(H-padB-26)/tinggiMm));
  const ox=padL+(ox0||0)*sk, oy=H-padB-(oy0||0)*sk;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.lineWidth=1;
  for(let x=-(ox0||0);x<=lebarMm-(ox0||0);x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-(oy0||0))); ctx.lineTo(X(x),Y(tinggiMm-(oy0||0))); ctx.stroke();}
  for(let y=-(oy0||0);y<=tinggiMm-(oy0||0);y+=10){ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(y)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_CAD3_X; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(X(-(ox0||0)),Y(0)); ctx.lineTo(X(lebarMm-(ox0||0)),Y(0)); ctx.stroke();
  ctx.strokeStyle=_CAD3_Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-(oy0||0))); ctx.lineTo(X(0),Y(tinggiMm-(oy0||0))); ctx.stroke();
  return {X,Y,sk};
}
function _cad3Poli(ctx,X,Y,pts,isi,garis,lebar,putus){
  ctx.fillStyle=isi; ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.6; ctx.setLineDash(putus||[]);
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1]))); ctx.closePath(); if(isi) ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
}
function _cad3Titik(ctx,x,y,warna,r){ctx.fillStyle=warna; ctx.beginPath(); ctx.arc(x,y,r||3.5,0,Math.PI*2); ctx.fill();}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Poligon beraturan: DrawMode inscribed vs circumscribed
// ════════════════════════════════════════════════════════════
let _btFrame=0;
function toggleBentuk(){_ttlToggle('bentuk','btnBentuk',drawBentuk);}
window.toggleBentuk=toggleBentuk;
function drawBentuk(){
  const k=_ttlKanvas('cvBentuk'); if(!k) return; const {ctx,W,H}=k;
  const n=Math.round(_ttlNilai('sl_bt_n',6)), R=_ttlNilai('sl_bt_R',40), mode=Math.round(_ttlNilai('sl_bt_mode',2));
  _ttlTulis('v_bt_n',String(n)); _ttlTulis('v_bt_R',R.toFixed(0)); _ttlTulis('v_bt_mode',['inscribed','circumscribed','keduanya'][mode]);
  const cx=W*0.34, cy=H*0.52, sk=Math.max(0.05,Math.min(W*0.3,H*0.42)/(R*1.15));
  const putar=_ttlJalan('bentuk')?_btFrame*0.003:0;
  ctx.strokeStyle='rgba(245,158,11,.75)'; ctx.lineWidth=1.4; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.arc(cx,cy,R*sk,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  const Rc=R/Math.cos(Math.PI/n);
  const poli=(rad)=>{const p=[]; for(let i=0;i<n;i++){const th=putar+Math.PI/2+i*2*Math.PI/n; p.push([cx+rad*sk*Math.cos(th),cy-rad*sk*Math.sin(th)]);} return p;};
  const gambar=(p,isi,garis)=>{ctx.fillStyle=isi; ctx.strokeStyle=garis; ctx.lineWidth=2; ctx.beginPath(); p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();};
  if(mode!==0){const pc=poli(Rc).map(([x,y])=>{const dx=x-cx,dy=y-cy,ang=Math.atan2(dy,dx)+Math.PI/n; const r=Math.hypot(dx,dy); return [cx+r*Math.cos(ang),cy+r*Math.sin(ang)];}); gambar(pc,'rgba(168,85,247,.10)','#a855f7');}
  if(mode!==1) gambar(poli(R),'rgba(34,211,238,.16)','#22d3ee');
  _cad3Titik(ctx,cx,cy,'#f59e0b',3);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+R*sk*Math.cos(putar+Math.PI/2),cy-R*sk*Math.sin(putar+Math.PI/2)); ctx.stroke();
  const Ain=n*R*R*Math.sin(2*Math.PI/n)/2, Acirc=n*R*R*Math.tan(Math.PI/n);
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  const tx=W*0.66;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText('Draft Polygon n = '+n+', R = '+R+' mm',tx,H*0.28);
  ctx.fillStyle='#22d3ee'; ctx.fillText('inscribed (bawaan):',tx,H*0.28+26); ctx.fillText('A = ½nR²sin(2π/n) = '+Ain.toFixed(2),tx,H*0.28+44);
  ctx.fillStyle='#a855f7'; ctx.fillText('circumscribed:',tx,H*0.28+72); ctx.fillText('A = nR²tan(π/n) = '+Acirc.toFixed(2),tx,H*0.28+90);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('rasio = 1/cos²(π/n) = '+(Acirc/Ain).toFixed(4),tx,H*0.28+114);
  _ttlTulis('bentukInfo','Sudut poligon inscribed berada pada lingkaran radius R (luas '+Ain.toFixed(2)+' mm²); sisi poligon circumscribed menyinggung lingkaran yang sama (luas '+Acirc.toFixed(2)+' mm²); makin banyak sisi, keduanya makin mendekati luas lingkaran '+(Math.PI*R*R).toFixed(2)+' mm²');
  if(_ttlJalan('bentuk')){_btFrame++; requestAnimationFrame(drawBentuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pengukuran segitiga: titik berat, jarak titik–garis, sudut
// ════════════════════════════════════════════════════════════
let _ukFrame=0;
function toggleUkur(){_ttlToggle('ukur','btnUkur',drawUkur);}
window.toggleUkur=toggleUkur;
function drawUkur(){
  const k=_ttlKanvas('cvUkur'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_uk_a',120), c=_ttlNilai('sl_uk_c',40), h=_ttlNilai('sl_uk_h',70);
  _ttlTulis('v_uk_a',a.toFixed(0)); _ttlTulis('v_uk_c',c.toFixed(0)); _ttlTulis('v_uk_h',h.toFixed(0));
  const {X,Y}=_cad3Kisi(ctx,W,H,200,130,52,34,10,10);
  const A=[0,0],B=[a,0],C=[c,h];
  _cad3Poli(ctx,X,Y,[A,B,C],'rgba(34,211,238,.14)','#22d3ee',2);
  const G=[(a+c)/3,h/3];
  // kaki tegak lurus dari A ke BC
  const bx=c-a, by=h, L2=bx*bx+by*by, tt=((0-a)*bx+(0-0)*by)/L2, F=[a+tt*bx,tt*by];
  const dAG=Math.hypot(c-G[0],h-G[1]), dABC=Math.abs(a*h)/Math.sqrt((c-a)**2+h*h), sudutB=Math.atan2(h,a-c)*180/Math.PI;
  const fase=_ttlJalan('ukur')?Math.floor((_ukFrame/80)%3):3;
  // median ke titik berat
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
  [[A,[(a+c)/2,h/2]],[B,[c/2,h/2]],[C,[a/2,0]]].forEach(([p,q])=>{ctx.beginPath(); ctx.moveTo(X(p[0]),Y(p[1])); ctx.lineTo(X(q[0]),Y(q[1])); ctx.stroke();}); ctx.setLineDash([]);
  _cad3Titik(ctx,X(G[0]),Y(G[1]),'#00e09e',4.5);
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('A',X(0)-12,Y(0)+12); ctx.fillText('B',X(a)+4,Y(0)+12); ctx.fillText('C',X(c)-4,Y(h)-6);
  ctx.fillStyle='#00e09e'; ctx.fillText('G ('+G[0].toFixed(2)+', '+G[1].toFixed(2)+')',X(G[0])+6,Y(G[1])+12);
  if(fase===0||fase===3){ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(c),Y(h)); ctx.lineTo(X(G[0]),Y(G[1])); ctx.stroke(); ctx.fillStyle='#00e09e'; ctx.fillText('CG = '+dAG.toFixed(3),X((c+G[0])/2)+8,Y((h+G[1])/2));}
  if(fase===1||fase===3){ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(F[0]),Y(F[1])); ctx.stroke(); _cad3Titik(ctx,X(F[0]),Y(F[1]),'#f59e0b',3); ctx.fillStyle='#f59e0b'; ctx.fillText('d(A, BC) = '+dABC.toFixed(3),X(F[0]/2)+6,Y(F[1]/2)-8);}
  if(fase===2||fase===3){const r=Math.min(a-c,40)*0.35*(X(1)-X(0)); ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(a),Y(0),r,Math.PI-Math.atan2(h,a-c),Math.PI); ctx.stroke(); ctx.fillStyle='#a855f7'; ctx.fillText('∠B = '+sudutB.toFixed(3)+'°',X(a)-r*2.4,Y(0)-r*0.6);}
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText(['Shape.CenterOfMass → titik berat G','Std Measure Distance: vertex A → edge BC','Std Measure Angle: edge AB dan edge BC','Tiga pengukuran sekaligus'][fase],12,18);
  _ttlTulis('ukurInfo','G = ((0 + '+a+' + '+c+')/3, (0 + 0 + '+h+')/3); jarak CG = '+dAG.toFixed(3)+' mm; jarak A ke garis BC = a·h/|BC| = '+dABC.toFixed(3)+' mm; sudut di B = arctan(h/(a − c)) = '+sudutB.toFixed(3)+'°');
  if(_ttlJalan('ukur')){_ukFrame++; requestAnimationFrame(drawUkur);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Rotate: garis diputar di titik asal, jarak kedua ujung bebas
// ════════════════════════════════════════════════════════════
let _ptFrame=0;
function togglePutar(){_ttlToggle('putar','btnPutar',drawPutar);}
window.togglePutar=togglePutar;
function drawPutar(){
  const k=_ttlKanvas('cvPutar'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_pt_L',100), thMaks=_ttlNilai('sl_pt_th',40);
  _ttlTulis('v_pt_L',L.toFixed(0)); _ttlTulis('v_pt_th',thMaks.toFixed(0)+'°');
  const th=_ttlJalan('putar')?thMaks*(0.5+0.5*Math.sin(_ptFrame/50-Math.PI/2)):thMaks;
  const {X,Y}=_cad3Kisi(ctx,W,H,180,140,52,34,20,20);
  const rad=th*Math.PI/180, P=[L,0], Q=[L*Math.cos(rad),L*Math.sin(rad)];
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(P[0]),Y(P[1])); ctx.stroke();
  ctx.strokeStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.arc(X(0),Y(0),L*(X(1)-X(0)),-rad,0); ctx.stroke(); ctx.setLineDash([]);
  const rr=Math.min(L,40)*0.5*(X(1)-X(0)); ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rr,-rad,0); ctx.stroke();
  ctx.fillStyle='#a855f7'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('θ = '+th.toFixed(1)+'°',X(0)+rr*1.1,Y(0)-rr*0.4);
  const d=2*L*Math.sin(rad/2);
  ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(X(P[0]),Y(P[1])); ctx.lineTo(X(Q[0]),Y(Q[1])); ctx.stroke();
  _cad3Titik(ctx,X(P[0]),Y(P[1]),'#22d3ee'); _cad3Titik(ctx,X(Q[0]),Y(Q[1]),'#f59e0b'); _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  ctx.fillStyle='#00e09e'; ctx.fillText('d = 2L·sin(θ/2) = '+d.toFixed(3),X((P[0]+Q[0])/2)+8,Y((P[1]+Q[1])/2));
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Draft Rotate (Copy): pusat (0,0), sudut acuan 0°, sudut rotasi θ',12,18);
  _ttlTulis('putarInfo','Kedua ujung bebas berjarak L = '+L+' dari pusat; tali busur di antara keduanya d = 2·'+L+'·sin('+(th/2).toFixed(2)+'°) = '+d.toFixed(3)+' mm; ujung yang diputar berada di ('+Q[0].toFixed(2)+', '+Q[1].toFixed(2)+')');
  if(_ttlJalan('putar')){_ptFrame++; requestAnimationFrame(drawPutar);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Move, Rotate, Scale pada satu persegi panjang + kotak pembatas
// ════════════════════════════════════════════════════════════
let _tfFrame=0;
function toggleTransform(){_ttlToggle('transform','btnTransform',drawTransform);}
window.toggleTransform=toggleTransform;
function drawTransform(){
  const k=_ttlKanvas('cvTransform'); if(!k) return; const {ctx,W,H}=k;
  const dx=_ttlNilai('sl_tf_dx',80), dy=_ttlNilai('sl_tf_dy',45), th=_ttlNilai('sl_tf_th',30), kf=_ttlNilai('sl_tf_k',1.5);
  _ttlTulis('v_tf_dx',dx.toFixed(0)); _ttlTulis('v_tf_dy',dy.toFixed(0)); _ttlTulis('v_tf_th',th.toFixed(0)+'°'); _ttlTulis('v_tf_k',kf.toFixed(2));
  const a=100,b=40, rad=th*Math.PI/180;
  const {X,Y}=_cad3Kisi(ctx,W,H,300,180,52,34,40,30);
  const asal=[[0,0],[a,0],[a,b],[0,b]];
  const fase=_ttlJalan('transform')?Math.floor((_tfFrame/90)%3):3;
  _cad3Poli(ctx,X,Y,asal,'rgba(34,211,238,.16)','#22d3ee',2);
  const pindah=asal.map(([x,y])=>[x+dx,y+dy]);
  const putar=asal.map(([x,y])=>[x*Math.cos(rad)-y*Math.sin(rad),x*Math.sin(rad)+y*Math.cos(rad)]);
  const skala=asal.map(([x,y])=>[x*kf,y*kf]);
  if(fase===0||fase===3){_cad3Poli(ctx,X,Y,pindah,'rgba(0,224,158,.10)','#00e09e',1.6,[6,4]); ctx.strokeStyle='#00e09e'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(dx),Y(dy)); ctx.stroke(); ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Move |v| = '+Math.hypot(dx,dy).toFixed(3),X(dx)+6,Y(dy)-6);}
  if(fase===1||fase===3){_cad3Poli(ctx,X,Y,putar,'rgba(245,158,11,.10)','#f59e0b',1.6); const ymax=a*Math.sin(rad)+b*Math.cos(rad), xmin=-b*Math.sin(rad); ctx.strokeStyle='rgba(245,158,11,.5)'; ctx.setLineDash([3,3]); ctx.strokeRect(X(xmin),Y(ymax),(a*Math.cos(rad)-xmin)*(X(1)-X(0)),ymax*(X(1)-X(0))); ctx.setLineDash([]); ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Rotate θ: BoundBox YMax = '+ymax.toFixed(3),X(xmin),Y(ymax)-6);}
  if(fase===2||fase===3){_cad3Poli(ctx,X,Y,skala,null,'#a855f7',1.6,[2,3]); ctx.fillStyle='#a855f7'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Scale k: luas = k²·'+(a*b)+' = '+(kf*kf*a*b).toFixed(1),X(a*kf)-60,Y(b*kf)-6);}
  _cad3Titik(ctx,X(0),Y(0),'#e2e8f0',3);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText(['Draft Move (Copy) vektor (dx, dy)','Draft Rotate di titik asal sebesar θ','Draft Scale (Copy) faktor k di titik asal','Tiga transformasi pada persegi panjang '+a+' × '+b][fase],12,18);
  _ttlTulis('transformInfo','Move: jarak sudut asal–salinan √('+dx+'² + '+dy+'²) = '+Math.hypot(dx,dy).toFixed(3)+' mm · Rotate: YMax = a·sin θ + b·cos θ = '+(a*Math.sin(rad)+b*Math.cos(rad)).toFixed(3)+' mm · Scale: luas '+(kf*kf*a*b).toFixed(1)+' mm² (k² = '+(kf*kf).toFixed(3)+')');
  if(_ttlJalan('transform')){_tfFrame++; requestAnimationFrame(drawTransform);}
}

_TTL_DAFTAR.push(['cvBentuk',()=>drawBentuk(),'bentuk',['sl_bt_n','sl_bt_R','sl_bt_mode']]);
_TTL_DAFTAR.push(['cvUkur',()=>drawUkur(),'ukur',['sl_uk_a','sl_uk_c','sl_uk_h']]);
_TTL_DAFTAR.push(['cvPutar',()=>drawPutar(),'putar',['sl_pt_L','sl_pt_th']]);
_TTL_DAFTAR.push(['cvTransform',()=>drawTransform(),'transform',['sl_tf_dx','sl_tf_dy','sl_tf_th','sl_tf_k']]);
_ttlMulai();
