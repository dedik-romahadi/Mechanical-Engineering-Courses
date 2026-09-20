// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 5 PEMODELAN CAD — Pemodelan 3D Berbasis Sketsa
// Kanvas: cvSketsa, cvPad, cvRevolve, cvFillet (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C5X='#ef4444', _C5Y='#22c55e', _C5Z='#3b82f6';
// Proyeksi ortografis: putar sekeliling Z (azimut), lalu miringkan (elevasi); Z ke atas layar.
function _cad5P(p,az,el,sk,cx,cy){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [cx+sk*x1, cy-sk*(z1*Math.cos(e)+y1*Math.sin(e))];
}
function _cad5Sumbu(ctx,az,el,sk,cx,cy,L){
  const O=_cad5P([0,0,0],az,el,sk,cx,cy);
  [[[L,0,0],_C5X,'X'],[[0,L,0],_C5Y,'Y'],[[0,0,L],_C5Z,'Z']].forEach(([v,w,n])=>{const P=_cad5P(v,az,el,sk,cx,cy); ctx.strokeStyle=w; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(P[0],P[1]); ctx.stroke(); ctx.fillStyle=w; ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.fillText(n,P[0]+4,P[1]-3);});
}
function _cad5Poli3(ctx,pts,az,el,sk,cx,cy,isi,garis,lebar){
  const P=pts.map(p=>_cad5P(p,az,el,sk,cx,cy));
  ctx.beginPath(); P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
  if(isi){ctx.fillStyle=isi; ctx.fill();} ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.stroke();
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Sketsa terkonstrain: derajat kebebasan turun ke nol
// ════════════════════════════════════════════════════════════
let _skFrame=0;
function toggleSketsa(){_ttlToggle('sketsa','btnSketsa',drawSketsa);}
window.toggleSketsa=toggleSketsa;
function drawSketsa(){
  const k=_ttlKanvas('cvSketsa'); if(!k) return; const {ctx,W,H}=k;
  const w=_ttlNilai('sl_sk_w',80), h=_ttlNilai('sl_sk_h',50);
  _ttlTulis('v_sk_w',w.toFixed(0)); _ttlTulis('v_sk_h',h.toFixed(0));
  const langkah=['4 garis lepas','Coincident ×4 (kotak tertutup)','Horizontal ×2, Vertical ×2','Coincident sudut ke titik asal','Distance H = w, Distance V = h'];
  const dof=[16,8,4,2,0];
  const fase=_ttlJalan('sketsa')?Math.floor((_skFrame/75)%5):4;
  const sk=Math.max(0.05,Math.min((W*0.55)/(w+40),(H-60)/(h+40)));
  const ox=W*0.08+20*sk, oy=H*0.5+h*sk/2;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  ctx.strokeStyle='rgba(148,163,184,.12)'; for(let x=-20;x<=w+20;x+=10){ctx.beginPath(); ctx.moveTo(X(x),Y(-20)); ctx.lineTo(X(x),Y(h+20)); ctx.stroke();} for(let y=-20;y<=h+20;y+=10){ctx.beginPath(); ctx.moveTo(X(-20),Y(y)); ctx.lineTo(X(w+20),Y(y)); ctx.stroke();}
  ctx.strokeStyle=_C5X; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(X(-20),Y(0)); ctx.lineTo(X(w+20),Y(0)); ctx.stroke(); ctx.strokeStyle=_C5Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-20)); ctx.lineTo(X(0),Y(h+20)); ctx.stroke();
  // goyangan sebanding DOF (elemen belum terkunci)
  const g=fase===4?0:(dof[fase]/16)*6*Math.sin(_skFrame/9);
  const geser=[[g,-g],[-g,g],[g,g],[-g,-g]];
  let pts=[[0,0],[w,0],[w,h],[0,h]].map((p,i)=>fase>=3?p:[p[0]+geser[i][0],p[1]+geser[i][1]]);
  if(fase===0) pts=pts.map((p,i)=>[p[0]+(i%2?4:-4)*Math.sin(_skFrame/7+i),p[1]]);
  const warna=fase===4?'#00e09e':'#e2e8f0';
  ctx.strokeStyle=warna; ctx.lineWidth=2.2;
  for(let i=0;i<4;i++){const a=pts[i],b=pts[(i+1)%4]; const putus=fase===0&&i%2? [6,4]:[]; ctx.setLineDash(putus); ctx.beginPath(); ctx.moveTo(X(a[0]),Y(a[1])); ctx.lineTo(X(b[0]),Y(b[1])); ctx.stroke();}
  ctx.setLineDash([]);
  pts.forEach(p=>{ctx.fillStyle=fase>=1?'#f59e0b':'#94a3b8'; ctx.beginPath(); ctx.arc(X(p[0]),Y(p[1]),3.5,0,Math.PI*2); ctx.fill();});
  if(fase>=4){ctx.fillStyle='#00e09e'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('H '+w,X(w/2),Y(0)+16); ctx.save(); ctx.translate(X(w)+14,Y(h/2)); ctx.rotate(-Math.PI/2); ctx.fillText('V '+h,0,0); ctx.restore(); ctx.textAlign='left';}
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  langkah.forEach((s,i)=>{ctx.fillStyle=i===fase?'#00e09e':(i<fase?'rgba(226,232,240,.8)':'rgba(148,163,184,.45)'); ctx.fillText((i<=fase?'✓ ':'  ')+s,tx,H*0.22+i*22); ctx.fillStyle=i===fase?'#f59e0b':'rgba(148,163,184,.5)'; ctx.fillText('DOF '+dof[i],tx+178,H*0.22+i*22);});
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText(fase===4?'Fully constrained — hijau, 0 derajat kebebasan':'Under-constrained — geometri masih bisa bergeser',12,18);
  _ttlTulis('sketsaInfo','Empat garis bebas punya 16 derajat kebebasan (2 titik × 2 koordinat × 4 garis). Setiap konstrain mengurangi DOF; persegi panjang '+w+' × '+h+' terkunci penuh setelah coincident, horizontal/vertical, jangkar ke titik asal, dan dua konstrain jarak.');
  if(_ttlJalan('sketsa')){_skFrame++; requestAnimationFrame(drawSketsa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pad dan Pocket: balok berlubang tumbuh setinggi h
// ════════════════════════════════════════════════════════════
let _pdFrame=0;
function togglePad(){_ttlToggle('pad','btnPad',drawPad);}
window.togglePad=togglePad;
function drawPad(){
  const k=_ttlKanvas('cvPad'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_pd_a',80), b=_ttlNilai('sl_pd_b',50), hM=_ttlNilai('sl_pd_h',25), d=_ttlNilai('sl_pd_d',16);
  _ttlTulis('v_pd_a',a.toFixed(0)); _ttlTulis('v_pd_b',b.toFixed(0)); _ttlTulis('v_pd_h',hM.toFixed(0)); _ttlTulis('v_pd_d',d.toFixed(0));
  const h=_ttlJalan('pad')?hM*(0.5+0.5*Math.sin(_pdFrame/40-Math.PI/2)):hM;
  const az=35, el=28, sk=Math.max(0.05,Math.min(W*0.55,H*1.1)/(a+b+hM)*1.1), cx=W*0.36, cy=H*0.68;
  _cad5Sumbu(ctx,az,el,sk,cx,cy,Math.max(a,b)*0.5);
  const ka=[[0,0,0],[a,0,0],[a,b,0],[0,b,0]], atas=ka.map(p=>[p[0],p[1],h]);
  // sisi samping
  [[0,1],[1,2],[2,3],[3,0]].forEach(([i,j])=>_cad5Poli3(ctx,[ka[i],ka[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.2));
  _cad5Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.22)','#22d3ee',1.8);
  // lubang (pocket) pada muka atas dan bawah
  const ling=(z)=>{const p=[]; for(let i=0;i<40;i++){const t=i/40*2*Math.PI; p.push([a/2+d/2*Math.cos(t),b/2+d/2*Math.sin(t),z]);} return p;};
  _cad5Poli3(ctx,ling(h),az,el,sk,cx,cy,'#0a101f','#f59e0b',1.4);
  const V=(a*b-Math.PI*d*d/4)*h;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Pad '+h.toFixed(1)+' mm dari sketsa '+a+' × '+b+', Pocket ⌀'+d+' through all',12,18);
  const tx=W*0.68;
  ctx.fillStyle='#22d3ee'; ctx.fillText('V = (a·b − πd²/4)·h',tx,H*0.35); ctx.fillStyle='#00e09e'; ctx.fillText('= '+V.toLocaleString('id-ID',{maximumFractionDigits:1})+' mm³',tx,H*0.35+20);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('= '+(V/1000).toFixed(3)+' cm³ → baja '+(V/1000*7.85).toFixed(1)+' g',tx,H*0.35+40);
  _ttlTulis('padInfo','Pad menebalkan penampang sketsa a·b − π·d²/4 = '+(a*b-Math.PI*d*d/4).toFixed(2)+' mm² setinggi h = '+h.toFixed(1)+' mm → V = '+V.toFixed(2)+' mm³; massa baja (ρ = 7,85 g/cm³) ≈ '+(V/1000*7.85).toFixed(1)+' g');
  if(_ttlJalan('pad')){_pdFrame++; requestAnimationFrame(drawPad);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Revolution: profil XZ diputar mengelilingi sumbu Z
// ════════════════════════════════════════════════════════════
let _rvFrame=0;
function toggleRevolve(){_ttlToggle('revolve','btnRevolve',drawRevolve);}
window.toggleRevolve=toggleRevolve;
function drawRevolve(){
  const k=_ttlKanvas('cvRevolve'); if(!k) return; const {ctx,W,H}=k;
  const ri=_ttlNilai('sl_rv_ri',12), ro=Math.max(_ttlNilai('sl_rv_ro',24),ri+2), h=_ttlNilai('sl_rv_h',36);
  _ttlTulis('v_rv_ri',ri.toFixed(0)); _ttlTulis('v_rv_ro',ro.toFixed(0)); _ttlTulis('v_rv_h',h.toFixed(0));
  const phi=_ttlJalan('revolve')?((_rvFrame*1.5)%400>360?360:(_rvFrame*1.5)%400):360;
  const az=35, el=24, sk=Math.max(0.05,Math.min(W*0.5,H*1.2)/(2*ro+h)*1.05), cx=W*0.34, cy=H*0.62;
  _cad5Sumbu(ctx,az,el,sk,cx,cy,ro*1.4);
  // profil pada bidang XZ
  const prof=[[ri,0,0],[ro,0,0],[ro,0,h],[ri,0,h]];
  const n=Math.max(2,Math.round(phi/6));
  const rot=(p,t)=>[p[0]*Math.cos(t),p[0]*Math.sin(t),p[2]];
  for(let i=0;i<n;i++){const t0=i/n*phi*Math.PI/180, t1=(i+1)/n*phi*Math.PI/180;
    _cad5Poli3(ctx,[rot(prof[1],t0),rot(prof[1],t1),rot(prof[2],t1),rot(prof[2],t0)],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.35)',0.8);
    _cad5Poli3(ctx,[rot(prof[2],t0),rot(prof[2],t1),rot(prof[3],t1),rot(prof[3],t0)],az,el,sk,cx,cy,'rgba(34,211,238,.18)','rgba(34,211,238,.35)',0.8);
  }
  _cad5Poli3(ctx,prof,az,el,sk,cx,cy,'rgba(245,158,11,.25)','#f59e0b',2);
  const tEnd=phi*Math.PI/180; _cad5Poli3(ctx,prof.map(p=>rot(p,tEnd)),az,el,sk,cx,cy,'rgba(245,158,11,.15)','#f59e0b',1.4);
  const Vpenuh=Math.PI*(ro*ro-ri*ri)*h, V=Vpenuh*phi/360;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Revolution '+phi.toFixed(0)+'° profil ('+ri+'…'+ro+') × '+h+' pada XZ terhadap sumbu Z',12,18);
  const tx=W*0.66;
  ctx.fillStyle='#f59e0b'; ctx.fillText('A_profil = (r_o − r_i)·h = '+((ro-ri)*h).toFixed(1),tx,H*0.3);
  ctx.fillStyle='#22d3ee'; ctx.fillText('V(360°) = π(r_o² − r_i²)h',tx,H*0.3+22); ctx.fillStyle='#00e09e'; ctx.fillText('= '+Vpenuh.toLocaleString('id-ID',{maximumFractionDigits:1})+' mm³',tx,H*0.3+42);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Pappus: 2π·ȳ·A, ȳ = (r_i + r_o)/2 = '+((ri+ro)/2).toFixed(1),tx,H*0.3+64); ctx.fillText('V('+phi.toFixed(0)+'°) = '+V.toFixed(1),tx,H*0.3+84);
  _ttlTulis('revolveInfo','Bus berongga r_i = '+ri+', r_o = '+ro+', h = '+h+': V = π·('+ro+'² − '+ri+'²)·'+h+' = '+Vpenuh.toFixed(2)+' mm³; sama dengan teorema Pappus 2π × '+((ri+ro)/2).toFixed(2)+' × '+((ro-ri)*h).toFixed(1)+' = '+(2*Math.PI*(ri+ro)/2*(ro-ri)*h).toFixed(2));
  if(_ttlJalan('revolve')){_rvFrame++; requestAnimationFrame(drawRevolve);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Fillet dan Chamfer: penampang yang hilang di sudut
// ════════════════════════════════════════════════════════════
let _flFrame=0;
function toggleFillet(){_ttlToggle('fillet','btnFillet',drawFillet);}
window.toggleFillet=toggleFillet;
function drawFillet(){
  const k=_ttlKanvas('cvFillet'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_fl_a',80), b=_ttlNilai('sl_fl_b',50), fM=Math.min(_ttlNilai('sl_fl_f',10),Math.min(a,b)/2-1), mode=Math.round(_ttlNilai('sl_fl_mode',0));
  _ttlTulis('v_fl_a',a.toFixed(0)); _ttlTulis('v_fl_b',b.toFixed(0)); _ttlTulis('v_fl_f',fM.toFixed(0)); _ttlTulis('v_fl_mode',mode?'chamfer':'fillet');
  const f=_ttlJalan('fillet')?fM*(0.5+0.5*Math.sin(_flFrame/40)):fM;
  const sk=Math.max(0.05,Math.min((W*0.55)/(a+20),(H-56)/(b+20)));
  const ox=W*0.06, oy=H*0.5+b*sk/2;
  const X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // penampang asli (putus)
  ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.setLineDash([5,4]); ctx.lineWidth=1; ctx.strokeRect(X(0),Y(b),a*sk,b*sk); ctx.setLineDash([]);
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath();
  if(mode===0){ctx.moveTo(X(f),Y(0)); ctx.lineTo(X(a-f),Y(0)); ctx.arc(X(a-f),Y(f),f*sk,Math.PI/2,0,true); ctx.lineTo(X(a),Y(b-f)); ctx.arc(X(a-f),Y(b-f),f*sk,0,-Math.PI/2,true); ctx.lineTo(X(f),Y(b)); ctx.arc(X(f),Y(b-f),f*sk,-Math.PI/2,-Math.PI,true); ctx.lineTo(X(0),Y(f)); ctx.arc(X(f),Y(f),f*sk,Math.PI,Math.PI/2,true);}
  else {[[f,0],[a-f,0],[a,f],[a,b-f],[a-f,b],[f,b],[0,b-f],[0,f]].forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));}
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // sudut yang hilang disorot
  ctx.fillStyle='rgba(239,68,68,.35)';
  [[0,0,1,1],[a,0,-1,1],[a,b,-1,-1],[0,b,1,-1]].forEach(([px,py,sx,sy])=>{ctx.beginPath(); ctx.moveTo(X(px),Y(py)); ctx.lineTo(X(px+sx*f),Y(py)); if(mode===0){ctx.arc(X(px+sx*f),Y(py+sy*f),f*sk,(sy>0?Math.PI/2:-Math.PI/2)*(sx>0?1:1)+(sx>0&&sy>0?0:sx<0&&sy>0?Math.PI/2:sx<0&&sy<0?Math.PI:-Math.PI/2)*0,0,true);} ctx.lineTo(X(px),Y(py+sy*f)); ctx.closePath(); ctx.fill();});
  const hilang=mode===0?(4-Math.PI)*f*f:2*f*f, luas=a*b-hilang;
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText((mode?'C':'R')+f.toFixed(1),X(a-f)+6,Y(b-f)-8);
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.92)'; ctx.fillText((mode?'Chamfer':'Fillet')+' empat rusuk vertikal',tx,H*0.28);
  ctx.fillStyle='#ef4444'; ctx.fillText(mode?'hilang = 4·(f²/2) = 2f²':'hilang = 4·(1 − π/4)·f² = (4 − π)f²',tx,H*0.28+22); ctx.fillText('= '+hilang.toFixed(2)+' mm²',tx,H*0.28+42);
  ctx.fillStyle='#00e09e'; ctx.fillText('penampang = '+luas.toFixed(2)+' mm²',tx,H*0.28+70);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('× tinggi Pad = volume solid',tx,H*0.28+90);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('Penampang balok '+a+' × '+b+' setelah '+(mode?'Chamfer':'Fillet')+' '+f.toFixed(1)+' mm pada rusuk vertikal',12,18);
  _ttlTulis('filletInfo',(mode?'Chamfer':'Fillet')+' f = '+f.toFixed(2)+' mm pada empat rusuk vertikal membuang '+hilang.toFixed(2)+' mm² dari penampang '+(a*b)+' mm²; setiap mm tinggi Pad kehilangan volume sebesar itu — itulah suku (4 − π)·f² pada rumus Tugas 4');
  if(_ttlJalan('fillet')){_flFrame++; requestAnimationFrame(drawFillet);}
}

_TTL_DAFTAR.push(['cvSketsa',()=>drawSketsa(),'sketsa',['sl_sk_w','sl_sk_h']]);
_TTL_DAFTAR.push(['cvPad',()=>drawPad(),'pad',['sl_pd_a','sl_pd_b','sl_pd_h','sl_pd_d']]);
_TTL_DAFTAR.push(['cvRevolve',()=>drawRevolve(),'revolve',['sl_rv_ri','sl_rv_ro','sl_rv_h']]);
_TTL_DAFTAR.push(['cvFillet',()=>drawFillet(),'fillet',['sl_fl_a','sl_fl_b','sl_fl_f','sl_fl_mode']]);
_ttlMulai();
