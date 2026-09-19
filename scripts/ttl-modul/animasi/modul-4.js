// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 4 TEKNIK TENAGA LISTRIK — Daya pada Jaringan DC Dua Sumber atau Lebih
// Kanvas: cvNodal, cvSuperposisi, cvThevenin, cvParalelSumber
// ════════════════════════════════════════════════════════════
function _ttlSimpul(E1,R1,E2,R2,R3){return (E1/R1+E2/R2)/(1/R1+1/R2+1/R3);}
function _ttlResistor(ctx,xa,ya,xb,yb,label,warna){
  const dx=xb-xa, dy=yb-ya, L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L;
  ctx.strokeStyle=warna; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(xa,ya);
  for(let i=1;i<=8;i++){const t=i/9, s=(i%2?1:-1)*7; ctx.lineTo(xa+dx*t+nx*s,ya+dy*t+ny*s);} ctx.lineTo(xb,yb); ctx.stroke();
  if(label){ctx.fillStyle=warna; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(label,(xa+xb)/2+nx*17,(ya+yb)/2+ny*17+4);}
}
function _ttlSumber(ctx,x,y,label,warna,tegak){
  if(tegak){_ttlGaris(ctx,x-14,y-6,x+14,y-6,warna,3); _ttlGaris(ctx,x-7,y+6,x+7,y+6,warna,3);}
  else{_ttlGaris(ctx,x-6,y-14,x-6,y+14,warna,3); _ttlGaris(ctx,x+6,y-7,x+6,y+7,warna,3);}
  ctx.fillStyle=warna; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(label,x,y+(tegak?-16:26));
}
function _ttlPartikel(ctx,path,arus,frame,warna){
  let seg=[],tot=0; for(let i=0;i<path.length-1;i++){const L=Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]); seg.push(L); tot+=L;}
  const n=Math.max(0,Math.min(14,Math.round(Math.abs(arus)*1.2))); const arah=arus>=0?1:-1;
  for(let q=0;q<n;q++){
    let d=(((frame*1.5*arah)%tot)+tot+q*tot/n)%tot, i=0; while(i<seg.length&&d>seg[i]){d-=seg[i];i++;} if(i>=seg.length) i=seg.length-1;
    const r=seg[i]?d/seg[i]:0, px=path[i][0]+(path[i+1][0]-path[i][0])*r, py=path[i][1]+(path[i+1][1]-path[i][1])*r;
    ctx.fillStyle=warna||'rgba(232,246,255,.9)'; ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fill();
  }
}

// ── ANIMASI 1 — Analisis nodal jaringan dua sumber ──
let _ndFrame=0;
function toggleNodal(){_ttlToggle('nodal','btnNodal',drawNodal);}
window.toggleNodal=toggleNodal;
function drawNodal(){
  const k=_ttlKanvas('cvNodal'); if(!k) return; const {ctx,W,H}=k;
  const E1=_ttlNilai('sl_nd_e1',14), E2=_ttlNilai('sl_nd_e2',11), R1=_ttlNilai('sl_nd_r1',2), R2=_ttlNilai('sl_nd_r2',4), R3=_ttlNilai('sl_nd_r3',5);
  _ttlTulis('v_nd_e1',E1.toFixed(1)); _ttlTulis('v_nd_e2',E2.toFixed(1)); _ttlTulis('v_nd_r1',R1.toFixed(1)); _ttlTulis('v_nd_r2',R2.toFixed(1)); _ttlTulis('v_nd_r3',R3.toFixed(1));
  const V=_ttlSimpul(E1,R1,E2,R2,R3), I1=(E1-V)/R1, I2=(E2-V)/R2, I3=V/R3;
  const xL=Math.max(50,W*0.1), xR=W-Math.max(50,W*0.1), xM=W/2, yT=44, yB=H-40;
  const kawat=(a,b,c,d)=>_ttlGaris(ctx,a,b,c,d,'rgba(148,163,184,.7)',2);
  kawat(xL,yT,xL,yB); kawat(xR,yT,xR,yB); kawat(xL,yB,xR,yB); kawat(xL,yT,xM,yT); kawat(xM,yT,xR,yT); kawat(xM,yT,xM,yT+30); kawat(xM,yB-30,xM,yB);
  _ttlSumber(ctx,xL,(yT+yB)/2,'E₁ '+E1.toFixed(1)+' V','rgba(255,179,0,.95)',true);
  _ttlSumber(ctx,xR,(yT+yB)/2,'E₂ '+E2.toFixed(1)+' V','rgba(249,115,22,.95)',true);
  _ttlResistor(ctx,xL+(xM-xL)*0.3,yT,xL+(xM-xL)*0.7,yT,'R₁ '+R1.toFixed(1)+' Ω','rgba(34,211,238,.95)');
  _ttlResistor(ctx,xM+(xR-xM)*0.3,yT,xM+(xR-xM)*0.7,yT,'R₂ '+R2.toFixed(1)+' Ω','rgba(168,85,247,.95)');
  _ttlResistor(ctx,xM,yT+30,xM,yB-30,'R₃ '+R3.toFixed(1)+' Ω','rgba(0,224,158,.95)');
  ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(xM,yT,5,0,Math.PI*2); ctx.fill();
  ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#fca5a5'; ctx.fillText('V = '+V.toFixed(3)+' V',xM,yT-14);
  _ttlPartikel(ctx,[[xL,yB],[xL,yT],[xM,yT]],I1,_ndFrame,'rgba(255,179,0,.95)');
  _ttlPartikel(ctx,[[xR,yB],[xR,yT],[xM,yT]],I2,_ndFrame,'rgba(249,115,22,.95)');
  _ttlPartikel(ctx,[[xM,yT],[xM,yB]],I3,_ndFrame,'rgba(0,224,158,.95)');
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.9)';
  ctx.fillText('I₁ = '+I1.toFixed(3)+' A'+(I1<0?' (masuk ke E₁: diisi)':''),xL+8,yT+18);
  ctx.textAlign='right'; ctx.fillText('I₂ = '+I2.toFixed(3)+' A'+(I2<0?' (masuk ke E₂: diisi)':''),xR-8,yT+18);
  ctx.textAlign='left'; ctx.fillText('I₃ = '+I3.toFixed(3)+' A',xM+12,(yT+yB)/2+40);
  _ttlTulis('nodalInfo','V = (E₁/R₁ + E₂/R₂)/(1/R₁ + 1/R₂ + 1/R₃) = '+V.toFixed(4)+' V   |   I₁ = '+I1.toFixed(3)+' A, I₂ = '+I2.toFixed(3)+' A, I₃ = '+I3.toFixed(3)+' A   |   KCL: I₁ + I₂ − I₃ = '+(I1+I2-I3).toFixed(4)+'   |   P₁ = '+(E1*I1).toFixed(2)+' W, P₂ = '+(E2*I2).toFixed(2)+' W, P_R3 = '+(V*I3).toFixed(2)+' W');
  if(_ttlJalan('nodal')){_ndFrame++; requestAnimationFrame(drawNodal);}
}

// ── ANIMASI 2 — Superposisi: kontribusi tiap sumber pada arus beban ──
let _suFrame=0;
function toggleSuperposisi(){_ttlToggle('superposisi','btnSuperposisi',drawSuperposisi);}
window.toggleSuperposisi=toggleSuperposisi;
function drawSuperposisi(){
  const k=_ttlKanvas('cvSuperposisi'); if(!k) return; const {ctx,W,H}=k;
  const E1=_ttlNilai('sl_su_e1',14), E2=_ttlNilai('sl_su_e2',11), R1=_ttlNilai('sl_su_r1',2), R2=_ttlNilai('sl_su_r2',4), R3=5;
  _ttlTulis('v_su_e1',E1.toFixed(1)); _ttlTulis('v_su_e2',E2.toFixed(1)); _ttlTulis('v_su_r1',R1.toFixed(1)); _ttlTulis('v_su_r2',R2.toFixed(1));
  const G=1/R1+1/R2+1/R3;
  const V1=(E1/R1)/G, V2=(E2/R2)/G, V=V1+V2;
  const I3a=V1/R3, I3b=V2/R3, I3=V/R3;
  const I1a=(E1-V1)/R1, I1b=(0-V2)/R1, I2a=(0-V1)/R2, I2b=(E2-V2)/R2;
  const fase=Math.floor((_suFrame/140)%3); // 0: E1 saja, 1: E2 saja, 2: keduanya
  const padL=150, padR=20, padT=30, plotW=W-padL-padR;
  const barH=Math.min(34,(H-padT-40)/4.2), gap=barH*0.35;
  const maks=Math.max(Math.abs(I1a),Math.abs(I1b),Math.abs(I2a),Math.abs(I2b),Math.abs(I3),Math.abs(I1a+I1b),Math.abs(I2a+I2b))*1.15||1;
  const x0=padL+plotW/2, X=v=>x0+v/maks*plotW/2;
  ctx.font="10px 'JetBrains Mono',monospace";
  _ttlGaris(ctx,x0,padT-8,x0,padT+3*(barH+gap)+8,'rgba(148,163,184,.5)',1.2);
  for(const v of [-maks,-maks/2,maks/2,maks]){_ttlGaris(ctx,X(v),padT-8,X(v),padT+3*(barH+gap)+8,'rgba(148,163,184,.12)',1,[3,3]); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.textAlign='center'; ctx.fillText(v.toFixed(1)+' A',X(v),padT+3*(barH+gap)+22);}
  const baris=[['I₁ (cabang E₁)',I1a,I1b,'rgba(255,179,0,.9)'],['I₂ (cabang E₂)',I2a,I2b,'rgba(249,115,22,.9)'],['I₃ (beban R₃)',I3a,I3b,'rgba(0,224,158,.9)']];
  baris.forEach(([label,a,b,warna],i)=>{
    const y=padT+i*(barH+gap);
    ctx.textAlign='right'; ctx.fillStyle='#e2e8f0'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(label,padL-10,y+barH/2+4);
    const gambar=(nilai,warnaBar,y1,h)=>{ctx.fillStyle=warnaBar; const xa=Math.min(x0,X(nilai)); ctx.fillRect(xa,y1,Math.abs(X(nilai)-x0),h);};
    if(fase===0){gambar(a,'rgba(255,179,0,.8)',y,barH);}
    else if(fase===1){gambar(b,'rgba(249,115,22,.8)',y,barH);}
    else{gambar(a,'rgba(255,179,0,.55)',y,barH/2); gambar(b,'rgba(249,115,22,.55)',y+barH/2,barH/2); ctx.strokeStyle=warna; ctx.lineWidth=2.4; ctx.strokeRect(Math.min(x0,X(a+b)),y,Math.abs(X(a+b)-x0),barH);}
    ctx.textAlign='left'; ctx.fillStyle='#e2e8f0'; ctx.font="11px 'JetBrains Mono',monospace";
    const teks=fase===0?a.toFixed(3)+' A (E₁ saja)':fase===1?b.toFixed(3)+' A (E₂ saja)':a.toFixed(3)+' + '+b.toFixed(3)+' = '+(a+b).toFixed(3)+' A';
    ctx.fillText(teks,padL+plotW+4-Math.min(plotW/2-4,0),y+barH/2+4);
  });
  ctx.textAlign='left'; ctx.fillStyle=['rgba(255,179,0,.95)','rgba(249,115,22,.95)','rgba(0,224,158,.95)'][fase]; ctx.font="600 12px 'JetBrains Mono',monospace";
  ctx.fillText(['Langkah 1 — hanya E₁ (E₂ dihubung singkat)','Langkah 2 — hanya E₂ (E₁ dihubung singkat)','Langkah 3 — jumlahkan: rangkaian lengkap'][fase],padL,padT-14);
  _ttlTulis('superposisiInfo','E₁ saja: I₃′ = '+I3a.toFixed(3)+' A;  E₂ saja: I₃″ = '+I3b.toFixed(3)+' A;  jumlah I₃ = '+I3.toFixed(3)+' A (= nodal langsung '+(V/R3).toFixed(3)+' A)   |   daya R₃ = I₃²R₃ = '+(I3*I3*R3).toFixed(2)+' W, BUKAN '+(I3a*I3a*R3).toFixed(2)+' + '+(I3b*I3b*R3).toFixed(2)+' = '+(I3a*I3a*R3+I3b*I3b*R3).toFixed(2)+' W');
  if(_ttlJalan('superposisi')){_suFrame++; requestAnimationFrame(drawSuperposisi);}
}

// ── ANIMASI 3 — Ekuivalen Thevenin dan daya beban ──
let _thFrame=0;
function toggleThevenin(){_ttlToggle('thevenin','btnThevenin',drawThevenin);}
window.toggleThevenin=toggleThevenin;
function drawThevenin(){
  const k=_ttlKanvas('cvThevenin'); if(!k) return; const {ctx,W,H}=k;
  const E=_ttlNilai('sl_th_e',24), R1=_ttlNilai('sl_th_r1',8), R2=_ttlNilai('sl_th_r2',8), R3=_ttlNilai('sl_th_r3',2);
  _ttlTulis('v_th_e',E.toFixed(0)); _ttlTulis('v_th_r1',R1.toFixed(1)); _ttlTulis('v_th_r2',R2.toFixed(1)); _ttlTulis('v_th_r3',R3.toFixed(1));
  const Vth=E*R2/(R1+R2), Rth=R1*R2/(R1+R2)+R3, Pmax=Vth*Vth/(4*Rth);
  const PL=RL=>Vth*Vth*RL/((Rth+RL)*(Rth+RL));
  // kiri: rangkaian Thevenin kecil; kanan: kurva P_L
  const xs=30, ys=H/2, lebarSkema=Math.min(200,W*0.3);
  const kawat=(a,b,c,d)=>_ttlGaris(ctx,a,b,c,d,'rgba(148,163,184,.7)',2);
  kawat(xs+20,ys-60,xs+20,ys-12); kawat(xs+20,ys+12,xs+20,ys+60); kawat(xs+20,ys-60,xs+lebarSkema-10,ys-60); kawat(xs+20,ys+60,xs+lebarSkema-10,ys+60);
  _ttlSumber(ctx,xs+20,ys,'V_th '+Vth.toFixed(2)+' V','rgba(255,179,0,.95)',true);
  _ttlResistor(ctx,xs+50,ys-60,xs+lebarSkema-40,ys-60,'R_th '+Rth.toFixed(2)+' Ω','rgba(34,211,238,.95)');
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.beginPath(); ctx.arc(xs+lebarSkema-10,ys-60,4,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(xs+lebarSkema-10,ys+60,4,0,Math.PI*2); ctx.fill();
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('terminal beban',xs+lebarSkema-10,ys+80);
  const padL=xs+lebarSkema+50, padR=20, padT=24, padB=36, x0=padL, y0=H-padB, plotW=W-padL-padR, plotH=H-padT-padB;
  const RLmax=5*Rth, X=RL=>x0+RL/RLmax*plotW, Y=p=>y0-p/(Pmax*1.1)*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let i=0;i<=4;i++){_ttlGaris(ctx,x0,y0-plotH*i/4,x0+plotW,y0-plotH*i/4,'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.textAlign='right'; ctx.fillText((Pmax*1.1*i/4).toFixed(1)+' W',x0-4,y0-plotH*i/4+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  ctx.textAlign='center'; for(let i=0;i<=5;i++){ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText((i*Rth).toFixed(1)+' Ω',X(i*Rth),y0+16);}
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=300;i++){const RL=0.01+(i/300)*RLmax; i?ctx.lineTo(X(RL),Y(PL(RL))):ctx.moveTo(X(RL),Y(PL(RL)));} ctx.stroke();
  _ttlGaris(ctx,X(Rth),padT,X(Rth),y0,'rgba(236,72,153,.85)',1.5,[3,3]);
  ctx.fillStyle='rgba(236,72,153,.95)'; ctx.textAlign='left'; ctx.fillText('R_L = R_th → P_maks = '+Pmax.toFixed(2)+' W',Math.min(X(Rth)+6,x0+plotW-170),padT+12);
  const RLnow=0.01+((_thFrame*0.004)%1)*RLmax;
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(RLnow),Y(PL(RLnow)),4.5,0,Math.PI*2); ctx.fill();
  _ttlTulis('theveninInfo','V_th = E·R₂/(R₁+R₂) = '+Vth.toFixed(3)+' V;  R_th = R₁‖R₂ + R₃ = '+Rth.toFixed(3)+' Ω;  I_N = '+(Vth/Rth).toFixed(3)+' A   |   R_L = '+RLnow.toFixed(2)+' Ω → I = '+(Vth/(Rth+RLnow)).toFixed(3)+' A, P_L = '+PL(RLnow).toFixed(2)+' W   |   P_maks = V_th²/(4R_th) = '+Pmax.toFixed(2)+' W');
  if(_ttlJalan('thevenin')){_thFrame++; requestAnimationFrame(drawThevenin);}
}

// ── ANIMASI 4 — Dua sumber paralel: pembagian beban dan arus sirkulasi ──
let _psFrame=0;
function toggleParalelSumber(){_ttlToggle('paralelsumber','btnParalelSumber',drawParalelSumber);}
window.toggleParalelSumber=toggleParalelSumber;
function drawParalelSumber(){
  const k=_ttlKanvas('cvParalelSumber'); if(!k) return; const {ctx,W,H}=k;
  const E1=_ttlNilai('sl_ps_e1',12.8), r1=_ttlNilai('sl_ps_r1',0.05), E2=_ttlNilai('sl_ps_e2',12.2), r2=_ttlNilai('sl_ps_r2',0.08), RL=_ttlNilai('sl_ps_rl',0.6);
  _ttlTulis('v_ps_e1',E1.toFixed(1)); _ttlTulis('v_ps_r1',r1.toFixed(3)); _ttlTulis('v_ps_e2',E2.toFixed(1)); _ttlTulis('v_ps_r2',r2.toFixed(3)); _ttlTulis('v_ps_rl',RL.toFixed(2));
  const G=1/r1+1/r2+(RL>0?1/RL:0), V=(E1/r1+E2/r2)/G, I1=(E1-V)/r1, I2=(E2-V)/r2, IL=RL>0?V/RL:0;
  const xL=Math.max(50,W*0.1), xR=W-Math.max(50,W*0.1), xM=W/2, yT=44, yB=H-40;
  const kawat=(a,b,c,d)=>_ttlGaris(ctx,a,b,c,d,'rgba(148,163,184,.7)',2);
  kawat(xL,yT,xR,yT); kawat(xL,yB,xR,yB); kawat(xL,yT,xL,yB); kawat(xR,yT,xR,yB); kawat(xM,yT,xM,yT+30); kawat(xM,yB-30,xM,yB);
  _ttlResistor(ctx,xL,yT+30,xL,yT+80,'r₁ '+r1.toFixed(3)+' Ω','rgba(34,211,238,.95)');
  _ttlSumber(ctx,xL,yB-40,'E₁ '+E1.toFixed(1)+' V','rgba(255,179,0,.95)',true);
  _ttlResistor(ctx,xR,yT+30,xR,yT+80,'r₂ '+r2.toFixed(3)+' Ω','rgba(168,85,247,.95)');
  _ttlSumber(ctx,xR,yB-40,'E₂ '+E2.toFixed(1)+' V','rgba(249,115,22,.95)',true);
  _ttlResistor(ctx,xM,yT+30,xM,yB-30,'R_L '+RL.toFixed(2)+' Ω','rgba(0,224,158,.95)');
  ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#fca5a5'; ctx.fillText('V rel = '+V.toFixed(3)+' V',xM,yT-14);
  _ttlPartikel(ctx,[[xL,yB],[xL,yT],[xM,yT]],I1,_psFrame,'rgba(255,179,0,.95)');
  _ttlPartikel(ctx,[[xR,yB],[xR,yT],[xM,yT]],I2,_psFrame,'rgba(249,115,22,.95)');
  _ttlPartikel(ctx,[[xM,yT],[xM,yB]],IL,_psFrame,'rgba(0,224,158,.95)');
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillStyle=I1<0?'#fca5a5':'rgba(226,232,240,.9)'; ctx.fillText('I₁ = '+I1.toFixed(2)+' A'+(I1<0?' ⚠ diisi':''),xL+8,yT+18);
  ctx.textAlign='right'; ctx.fillStyle=I2<0?'#fca5a5':'rgba(226,232,240,.9)'; ctx.fillText('I₂ = '+I2.toFixed(2)+' A'+(I2<0?' ⚠ diisi':''),xR-8,yT+18);
  ctx.textAlign='left'; ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('I_L = '+IL.toFixed(2)+' A',xM+12,(yT+yB)/2+40);
  const sirk=Math.abs(E1-E2)/(r1+r2);
  _ttlTulis('paralelSumberInfo','V = '+V.toFixed(4)+' V; I₁ = '+I1.toFixed(3)+' A, I₂ = '+I2.toFixed(3)+' A, I_L = '+IL.toFixed(3)+' A'+(I2<0||I1<0?'   ⚠ satu sumber diisi oleh yang lain':'')+'   |   tanpa beban: arus sirkulasi |E₁−E₂|/(r₁+r₂) = '+sirk.toFixed(2)+' A, rugi '+(sirk*sirk*(r1+r2)).toFixed(2)+' W terus-menerus');
  if(_ttlJalan('paralelsumber')){_psFrame++; requestAnimationFrame(drawParalelSumber);}
}

_TTL_DAFTAR.push(['cvNodal',()=>drawNodal(),'nodal',['sl_nd_e1','sl_nd_e2','sl_nd_r1','sl_nd_r2','sl_nd_r3']]);
_TTL_DAFTAR.push(['cvSuperposisi',()=>drawSuperposisi(),'superposisi',['sl_su_e1','sl_su_e2','sl_su_r1','sl_su_r2']]);
_TTL_DAFTAR.push(['cvThevenin',()=>drawThevenin(),'thevenin',['sl_th_e','sl_th_r1','sl_th_r2','sl_th_r3']]);
_TTL_DAFTAR.push(['cvParalelSumber',()=>drawParalelSumber(),'paralelsumber',['sl_ps_e1','sl_ps_r1','sl_ps_e2','sl_ps_r2','sl_ps_rl']]);
_ttlMulai();
