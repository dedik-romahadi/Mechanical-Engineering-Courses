// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 7 PEMODELAN CAD — Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly
// Kanvas: cvExtrude, cvPolar, cvLoft, cvShell (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C7X='#ef4444', _C7Y='#22c55e', _C7Z='#3b82f6';
// Proyeksi ortografis: putar sekeliling Z (azimut), lalu miringkan (elevasi); Z ke atas layar.
function _cad7P(p,az,el,sk,cx,cy){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [cx+sk*x1, cy-sk*(z1*Math.cos(e)+y1*Math.sin(e))];
}
function _cad7Sumbu(ctx,az,el,sk,cx,cy,L){
  const O=_cad7P([0,0,0],az,el,sk,cx,cy);
  [[[L,0,0],_C7X,'X'],[[0,L,0],_C7Y,'Y'],[[0,0,L],_C7Z,'Z']].forEach(([v,w,n])=>{const P=_cad7P(v,az,el,sk,cx,cy); ctx.strokeStyle=w; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(O[0],O[1]); ctx.lineTo(P[0],P[1]); ctx.stroke(); ctx.fillStyle=w; ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.fillText(n,P[0]+4,P[1]-3);});
}
function _cad7Poli3(ctx,pts,az,el,sk,cx,cy,isi,garis,lebar,putus){
  const P=pts.map(p=>_cad7P(p,az,el,sk,cx,cy));
  ctx.setLineDash(putus||[]);
  ctx.beginPath(); P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
  if(isi){ctx.fillStyle=isi; ctx.fill();} ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.stroke(); ctx.setLineDash([]);
}
function _cad7Silinder(ctx,x0,y0,z0,z1,r,az,el,sk,cx,cy,isi,garis){
  const n=28;
  for(let i=0;i<n;i++){const t0=i/n*2*Math.PI, t1=(i+1)/n*2*Math.PI;
    _cad7Poli3(ctx,[[x0+r*Math.cos(t0),y0+r*Math.sin(t0),z0],[x0+r*Math.cos(t1),y0+r*Math.sin(t1),z0],[x0+r*Math.cos(t1),y0+r*Math.sin(t1),z1],[x0+r*Math.cos(t0),y0+r*Math.sin(t0),z1]],az,el,sk,cx,cy,isi,'rgba(148,163,184,.25)',0.6);}
  const atas=[]; for(let i=0;i<n;i++){const t0=i/n*2*Math.PI; atas.push([x0+r*Math.cos(t0),y0+r*Math.sin(t0),z1]);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,isi,garis,1.3);
}
const _cad7Rp=(x,d)=>x.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Profil L ditebalkan: Part Extrude tumbuh sepanjang L
// ════════════════════════════════════════════════════════════
let _c7exFrame=0;
function toggleExtrude(){_ttlToggle('extrude','btnExtrude',drawExtrude);}
window.toggleExtrude=toggleExtrude;
function drawExtrude(){
  const k=_ttlKanvas('cvExtrude'); if(!k) return; const {ctx,W,H}=k;
  const w=_ttlNilai('sl_ex_w',50), h=_ttlNilai('sl_ex_h',30), tM=_ttlNilai('sl_ex_t',6), LM=_ttlNilai('sl_ex_l',25);
  const t=Math.max(1,Math.min(tM,Math.min(w,h)-2));
  _ttlTulis('v_ex_w',w.toFixed(0)); _ttlTulis('v_ex_h',h.toFixed(0)); _ttlTulis('v_ex_t',t.toFixed(0)); _ttlTulis('v_ex_l',LM.toFixed(0));
  const L=_ttlJalan('extrude')?LM*(0.5+0.5*Math.sin(_c7exFrame/40-Math.PI/2)):LM;
  const az=35, el=28, sk=Math.max(0.05,Math.min(W*0.55,H*1.1)/(w+h+LM)*1.05), cx=W*0.30, cy=H*0.72;
  _cad7Sumbu(ctx,az,el,sk,cx,cy,Math.max(w,h)*0.45);
  const prof=[[0,0,0],[w,0,0],[w,t,0],[t,t,0],[t,h,0],[0,h,0]], atas=prof.map(p=>[p[0],p[1],L]);
  for(let i=0;i<6;i++){const j=(i+1)%6; _cad7Poli3(ctx,[prof[i],prof[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.1);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.22)','#22d3ee',1.8);
  _cad7Poli3(ctx,prof,az,el,sk,cx,cy,'rgba(245,158,11,.12)','#f59e0b',1.4,[5,3]);
  const A=w*t+(h-t)*t, V=L*A;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Draft Wire L '+w+' × '+h+' (t = '+t+') → Part Extrude '+L.toFixed(1)+' mm searah Z',12,18);
  const tx=W*0.64;
  ctx.fillStyle='#f59e0b'; ctx.fillText('A_L = W·t + (H − t)·t',tx,H*0.30); ctx.fillStyle='#00e09e'; ctx.fillText('= '+_cad7Rp(A,1)+' mm²',tx,H*0.30+20);
  ctx.fillStyle='#22d3ee'; ctx.fillText('V = L·A_L',tx,H*0.30+50); ctx.fillStyle='#00e09e'; ctx.fillText('= '+_cad7Rp(V,1)+' mm³',tx,H*0.30+70);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('= '+(V/1000).toFixed(3)+' cm³ → baja '+(V/1000*7.85).toFixed(1)+' g',tx,H*0.30+92);
  ctx.fillText('Create solid · Direction Normal',tx,H*0.30+112);
  _ttlTulis('extrudeInfo','Profil L: kaki mendatar W × t = '+(w*t).toFixed(1)+' mm² + kaki tegak (H − t) × t = '+((h-t)*t).toFixed(1)+' mm² → A_L = '+A.toFixed(1)+' mm²; Extrude sepanjang '+L.toFixed(1)+' mm memberi V = '+V.toFixed(2)+' mm³ (Persamaan (1)).');
  if(_ttlJalan('extrude')){_c7exFrame++; requestAnimationFrame(drawExtrude);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pola polar lubang baut: jumlah n dan diameter berubah
// ════════════════════════════════════════════════════════════
let _c7poFrame=0;
function togglePolar(){_ttlToggle('polar','btnPolar',drawPolar);}
window.togglePolar=togglePolar;
function drawPolar(){
  const k=_ttlKanvas('cvPolar'); if(!k) return; const {ctx,W,H}=k;
  const n=Math.max(2,Math.round(_ttlNilai('sl_po_n',6))), D=_ttlNilai('sl_po_D',90), d0M=_ttlNilai('sl_po_d0',26), dbM=_ttlNilai('sl_po_db',7), h=_ttlNilai('sl_po_h',10);
  const d0=Math.max(4,Math.min(d0M,D-30)), Dbc=(D+d0)/2;
  const db=Math.max(2,Math.min(dbM,(D-d0)/2-2,Math.PI*Dbc/n*0.8));
  _ttlTulis('v_po_n',n.toFixed(0)); _ttlTulis('v_po_D',D.toFixed(0)); _ttlTulis('v_po_d0',d0.toFixed(0)); _ttlTulis('v_po_db',db.toFixed(0)); _ttlTulis('v_po_h',h.toFixed(0));
  const tampil=_ttlJalan('polar')?Math.min(n,Math.floor((_c7poFrame/28)%(n+2))+1):n;
  const sk=Math.max(0.05,Math.min((W*0.52)/(D+12),(H-36)/(D+12))), cx=W*0.29, cy=H*0.52;
  const X=x=>cx+x*sk, Y=y=>cy-y*sk;
  ctx.strokeStyle=_C7X; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(-D/2-8),Y(0)); ctx.lineTo(X(D/2+8),Y(0)); ctx.stroke(); ctx.strokeStyle=_C7Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-D/2-8)); ctx.lineTo(X(0),Y(D/2+8)); ctx.stroke();
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X(0),Y(0),D/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#020812'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(X(0),Y(0),d0/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.arc(X(0),Y(0),Dbc/2*sk,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  for(let i=0;i<tampil;i++){const a=i/n*2*Math.PI; ctx.fillStyle='#020812'; ctx.strokeStyle=i?'#a855f7':'#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(X(Dbc/2*Math.cos(a)),Y(Dbc/2*Math.sin(a)),db/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();}
  if(n>1){const a1=2*Math.PI/n; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),Dbc/2*sk*0.55,-a1,0); ctx.stroke(); ctx.fillStyle='#ec4899'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText((360/n).toFixed(1)+'°',X(Dbc/2*0.6*Math.cos(a1/2))+4,Y(Dbc/2*0.6*Math.sin(a1/2)));}
  const V=h*Math.PI/4*(D*D-d0*d0-n*db*db), satu=Math.PI/4*db*db*h;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Flens ⌀'+D+' × '+h+', lubang pusat ⌀'+d0+', PolarPattern '+tampil+'/'+n+' lubang ⌀'+db.toFixed(0),12,18);
  const tx=W*0.62;
  ctx.fillStyle='#a855f7'; ctx.fillText('Axis Z · Angle 360° · Occurrences '+n,tx,H*0.26);
  ctx.fillStyle='#f59e0b'; ctx.fillText('D_bc = (D + d₀)/2 = '+Dbc.toFixed(1)+' mm',tx,H*0.26+20);
  ctx.fillStyle='#22d3ee'; ctx.fillText('V = h·(π/4)(D² − d₀² − n·d_b²)',tx,H*0.26+50); ctx.fillStyle='#00e09e'; ctx.fillText('= '+_cad7Rp(V,1)+' mm³',tx,H*0.26+70);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('tiap lubang baut membuang '+satu.toFixed(1)+' mm³',tx,H*0.26+92); ctx.fillText('n lubang: '+(n*satu).toFixed(1)+' mm³ · sudut 360°/n = '+(360/n).toFixed(1)+'°',tx,H*0.26+112);
  _ttlTulis('polarInfo','Cakram (π/4)·'+D+'²·'+h+' = '+(Math.PI/4*D*D*h).toFixed(1)+' mm³ dikurangi lubang pusat '+(Math.PI/4*d0*d0*h).toFixed(1)+' mm³ dan '+n+' lubang baut × '+satu.toFixed(1)+' mm³ → V = '+V.toFixed(2)+' mm³ (Persamaan (2)); posisi D_bc tidak mengubah volume selama lubang tidak saling memotong.');
  if(_ttlJalan('polar')){_c7poFrame++; requestAnimationFrame(drawPolar);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Loft dua persegi panjang: penampang bergerak dari z = 0 ke z = h
// ════════════════════════════════════════════════════════════
let _c7lfFrame=0;
function toggleLoft(){_ttlToggle('loft','btnLoft',drawLoft);}
window.toggleLoft=toggleLoft;
function drawLoft(){
  const k=_ttlKanvas('cvLoft'); if(!k) return; const {ctx,W,H}=k;
  const a1=_ttlNilai('sl_lf_a1',50), b1=_ttlNilai('sl_lf_b1',30), a2=_ttlNilai('sl_lf_a2',25), b2=_ttlNilai('sl_lf_b2',15), h=_ttlNilai('sl_lf_h',40);
  _ttlTulis('v_lf_a1',a1.toFixed(0)); _ttlTulis('v_lf_b1',b1.toFixed(0)); _ttlTulis('v_lf_a2',a2.toFixed(0)); _ttlTulis('v_lf_b2',b2.toFixed(0)); _ttlTulis('v_lf_h',h.toFixed(0));
  const z=_ttlJalan('loft')?h*(0.5+0.5*Math.sin(_c7lfFrame/45-Math.PI/2)):h*0.5;
  const s_=z/h, az_=a1+(a2-a1)*s_, bz=b1+(b2-b1)*s_;
  const az=35, el=26, sk=Math.max(0.05,Math.min(W*0.5,H*1.15)/(Math.max(a1,a2)+Math.max(b1,b2)+h)*1.05), cx=W*0.30, cy=H*0.74;
  _cad7Sumbu(ctx,az,el,sk,cx,cy,Math.max(a1,b1)*0.7);
  const R=(a,b,zz)=>[[-a/2,-b/2,zz],[a/2,-b/2,zz],[a/2,b/2,zz],[-a/2,b/2,zz]];
  const bawah=R(a1,b1,0), atas=R(a2,b2,h), tengah=R(az_,bz,z);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[bawah[i],bawah[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.1);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.24)','#22d3ee',1.8);
  _cad7Poli3(ctx,bawah,az,el,sk,cx,cy,'rgba(245,158,11,.12)','#f59e0b',1.4,[5,3]);
  _cad7Poli3(ctx,tengah,az,el,sk,cx,cy,'rgba(236,72,153,.28)','#ec4899',1.6);
  const da=a2-a1, db=b2-b1, V=h*(a1*b1+(a1*db+b1*da)/2+da*db/3), Az=az_*bz;
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Loft ruled '+a1+' × '+b1+' (z = 0) → '+a2+' × '+b2+' (z = '+h+'); penampang di z = '+z.toFixed(1),12,18);
  const tx=W*0.62;
  ctx.fillStyle='#ec4899'; ctx.fillText('a(z) × b(z) = '+az_.toFixed(1)+' × '+bz.toFixed(1),tx,H*0.26); ctx.fillText('A(z) = '+Az.toFixed(1)+' mm²',tx,H*0.26+20);
  ctx.fillStyle='#22d3ee'; ctx.fillText('V = h·[a₁b₁ + (a₁Δb + b₁Δa)/2',tx,H*0.26+50); ctx.fillText('        + ΔaΔb/3]',tx,H*0.26+70); ctx.fillStyle='#00e09e'; ctx.fillText('= '+_cad7Rp(V,1)+' mm³',tx,H*0.26+90);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Δa = '+da.toFixed(0)+', Δb = '+db.toFixed(0)+' · prisma a₁b₁h = '+_cad7Rp(a1*b1*h,0),tx,H*0.26+112);
  _ttlTulis('loftInfo','Penampang pada z = '+z.toFixed(1)+' mm berukuran '+az_.toFixed(2)+' × '+bz.toFixed(2)+' mm (linear antara profil bawah dan atas); mengintegralkan a(z)·b(z) dari 0 sampai h = '+h+' memberi V = '+V.toFixed(2)+' mm³ (Persamaan (3)).');
  if(_ttlJalan('loft')){_c7lfFrame++; requestAnimationFrame(drawLoft);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Thickness: balok menjadi cangkang dengan tebal dinding t berubah
// ════════════════════════════════════════════════════════════
let _c7shFrame=0;
function toggleShell(){_ttlToggle('shell','btnShell',drawShell);}
window.toggleShell=toggleShell;
function drawShell(){
  const k=_ttlKanvas('cvShell'); if(!k) return; const {ctx,W,H}=k;
  const a=_ttlNilai('sl_sh_a',70), b=_ttlNilai('sl_sh_b',45), h=_ttlNilai('sl_sh_h',35), tM=_ttlNilai('sl_sh_t',2.5);
  const tMax=Math.max(0.5,Math.min(tM,Math.min(a,b)/2-1,h-1));
  _ttlTulis('v_sh_a',a.toFixed(0)); _ttlTulis('v_sh_b',b.toFixed(0)); _ttlTulis('v_sh_h',h.toFixed(0)); _ttlTulis('v_sh_t',tMax.toFixed(1).replace('.',','));
  const t=_ttlJalan('shell')?tMax*(0.55+0.45*Math.sin(_c7shFrame/40)):tMax;
  const az=35, el=28, sk=Math.max(0.05,Math.min(W*0.36,H*1.0)/(a+b+h)*1.15), cx=W*0.20, cy=H*0.74;
  _cad7Sumbu(ctx,az,el,sk,cx,cy,Math.max(a,b)*0.4);
  const luar=[[0,0,0],[a,0,0],[a,b,0],[0,b,0]], luarAtas=luar.map(p=>[p[0],p[1],h]);
  const dalam=[[t,t,t],[a-t,t,t],[a-t,b-t,t],[t,b-t,t]], dalamAtas=dalam.map(p=>[p[0],p[1],h]);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[luar[i],luar[j],luarAtas[j],luarAtas[i]],az,el,sk,cx,cy,'rgba(236,72,153,.10)','rgba(236,72,153,.7)',1.1);}
  _cad7Poli3(ctx,dalam,az,el,sk,cx,cy,'rgba(236,72,153,.06)','rgba(236,72,153,.35)',0.8);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[dalam[i],dalam[j],dalamAtas[j],dalamAtas[i]],az,el,sk,cx,cy,'rgba(2,8,18,.55)','rgba(236,72,153,.35)',0.8);}
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[luarAtas[i],luarAtas[j],dalamAtas[j],dalamAtas[i]],az,el,sk,cx,cy,'rgba(236,72,153,.28)','#ec4899',1.3);}
  // penampang tegak (x–z) di tengah kanvas
  const px=W*0.46, pw=W*0.16, ph=Math.min(H*0.5,pw*h/a), sx=pw/a, sz=ph/h, py=H*0.78;
  ctx.fillStyle='rgba(236,72,153,.25)'; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.rect(px,py-ph,pw,ph); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#020812'; ctx.fillRect(px+t*sx,py-ph,pw-2*t*sx,ph-t*sz);
  ctx.strokeStyle='rgba(236,72,153,.6)'; ctx.lineWidth=1; ctx.strokeRect(px+t*sx,py-ph-0.5,pw-2*t*sx,ph-t*sz+0.5);
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('a',px+pw/2,py+14); ctx.fillText('penampang x–z',px+pw/2,py-ph-8); ctx.textAlign='left'; ctx.fillText('t = '+t.toFixed(1),px+pw+6,py-ph/2); ctx.fillText('h',px-12,py-ph/2+4);
  const V=a*b*h-(a-2*t)*(b-2*t)*(h-t), pct=100*V/(a*b*h);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Balok '+a+' × '+b+' × '+h+' → Thickness t = '+t.toFixed(1)+' mm, muka atas dibuang',12,18);
  const tx=W*0.68;
  ctx.fillStyle='#22d3ee'; ctx.fillText('V = abh − (a−2t)(b−2t)(h−t)',tx,H*0.28); ctx.fillStyle='#00e09e'; ctx.fillText('= '+_cad7Rp(V,1)+' mm³',tx,H*0.28+20);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('balok pejal '+_cad7Rp(a*b*h,0)+' mm³',tx,H*0.28+42); ctx.fillText('sisa bahan '+pct.toFixed(1)+' %',tx,H*0.28+62); ctx.fillText('massa baja ≈ '+(V/1000*7.85).toFixed(1)+' g',tx,H*0.28+82);
  ctx.fillText('rongga '+(a-2*t).toFixed(1)+' × '+(b-2*t).toFixed(1)+' × '+(h-t).toFixed(1),tx,H*0.28+104);
  _ttlTulis('shellInfo','Thickness t = '+t.toFixed(2)+' mm ke dalam menyisakan dinding dan dasar; rongga ('+(a-2*t).toFixed(1)+' × '+(b-2*t).toFixed(1)+' × '+(h-t).toFixed(1)+') dibuang dari balok '+(a*b*h).toFixed(0)+' mm³ → V = '+V.toFixed(2)+' mm³ ('+pct.toFixed(1)+' % bahan tersisa), Persamaan (4).');
  if(_ttlJalan('shell')){_c7shFrame++; requestAnimationFrame(drawShell);}
}

_TTL_DAFTAR.push(['cvExtrude',()=>drawExtrude(),'extrude',['sl_ex_w','sl_ex_h','sl_ex_t','sl_ex_l']]);
_TTL_DAFTAR.push(['cvPolar',()=>drawPolar(),'polar',['sl_po_n','sl_po_D','sl_po_d0','sl_po_db','sl_po_h']]);
_TTL_DAFTAR.push(['cvLoft',()=>drawLoft(),'loft',['sl_lf_a1','sl_lf_b1','sl_lf_a2','sl_lf_b2','sl_lf_h']]);
_TTL_DAFTAR.push(['cvShell',()=>drawShell(),'shell',['sl_sh_a','sl_sh_b','sl_sh_h','sl_sh_t']]);
_ttlMulai();
