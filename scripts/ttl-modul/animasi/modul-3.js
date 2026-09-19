// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 3 TEKNIK TENAGA LISTRIK — Daya pada Jaringan DC Satu Sumber
// Kanvas: cvSeriParalel, cvTransfer, cvKabel, cvSumber
// ════════════════════════════════════════════════════════════

// ── ANIMASI 1 — Rangkaian seri–paralel: reduksi, arus, dan tegangan ──
let _spFrame=0;
function toggleSeriParalel(){_ttlToggle('seriparalel','btnSeriParalel',drawSeriParalel);}
window.toggleSeriParalel=toggleSeriParalel;
function drawSeriParalel(){
  const k=_ttlKanvas('cvSeriParalel'); if(!k) return; const {ctx,W,H}=k;
  const V=_ttlNilai('sl_sp_v',48), R1=_ttlNilai('sl_sp_r1',4), R2=_ttlNilai('sl_sp_r2',12), R3=_ttlNilai('sl_sp_r3',6);
  _ttlTulis('v_sp_v',V.toFixed(0)); _ttlTulis('v_sp_r1',R1.toFixed(1)); _ttlTulis('v_sp_r2',R2.toFixed(1)); _ttlTulis('v_sp_r3',R3.toFixed(1));
  const Rp=R2*R3/(R2+R3), Rt=R1+Rp, I=V/Rt, V1=I*R1, Vp=I*Rp, I2=Vp/R2, I3=Vp/R3;
  const x0=Math.max(40,W*0.08), x1=W-Math.max(40,W*0.08), yAtas=48, yBawah=H-40, xR1a=x0+(x1-x0)*0.18, xR1b=x0+(x1-x0)*0.40, xCab=x0+(x1-x0)*0.55, xR2=x0+(x1-x0)*0.72, xR3=xR2, yR2=yAtas+30, yR3=yBawah-30;
  const kawat=(a,b,c,d)=>_ttlGaris(ctx,a,b,c,d,'rgba(148,163,184,.7)',2);
  const resistor=(xa,ya,xb,yb,label,warna)=>{
    const dx=xb-xa, dy=yb-ya, L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L, nx=-uy, ny=ux;
    ctx.strokeStyle=warna; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(xa,ya);
    for(let i=1;i<=8;i++){const t=i/9, s=(i%2?1:-1)*7; ctx.lineTo(xa+dx*t+nx*s,ya+dy*t+ny*s);} ctx.lineTo(xb,yb); ctx.stroke();
    ctx.fillStyle=warna; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(label,(xa+xb)/2+nx*16,(ya+yb)/2+ny*16+4);
  };
  // sumber
  _ttlGaris(ctx,x0,yAtas+40,x0,yBawah-40,'rgba(148,163,184,0)',0);
  kawat(x0,yAtas,x0,H/2-14); kawat(x0,H/2+14,x0,yBawah);
  _ttlGaris(ctx,x0-16,H/2-8,x0+16,H/2-8,'rgba(255,179,0,.95)',3); _ttlGaris(ctx,x0-8,H/2+8,x0+8,H/2+8,'rgba(255,179,0,.95)',3);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='right'; ctx.fillText(V.toFixed(0)+' V',x0-20,H/2+4);
  kawat(x0,yAtas,xR1a,yAtas); resistor(xR1a,yAtas,xR1b,yAtas,'R₁ '+R1.toFixed(1)+' Ω','rgba(34,211,238,.95)'); kawat(xR1b,yAtas,xCab,yAtas);
  kawat(xCab,yAtas,xCab,yR2); kawat(xCab,yAtas,xCab,yR3); kawat(xCab,yR2,xR2-40,yR2); kawat(xCab,yR3,xR3-40,yR3);
  resistor(xR2-40,yR2,xR2+40,yR2,'R₂ '+R2.toFixed(1)+' Ω','rgba(168,85,247,.95)'); resistor(xR3-40,yR3,xR3+40,yR3,'R₃ '+R3.toFixed(1)+' Ω','rgba(0,224,158,.95)');
  kawat(xR2+40,yR2,x1,yR2); kawat(xR3+40,yR3,x1,yR3); kawat(x1,yR2,x1,yR3); kawat(x1,yR3,x1,yBawah); kawat(x0,yBawah,x1,yBawah);
  // partikel: kerapatan sebanding arus tiap cabang
  const jalur=[[[x0,yBawah],[x0,yAtas],[xCab,yAtas]],[[xCab,yAtas],[xCab,yR2],[x1,yR2],[x1,yBawah]],[[xCab,yAtas],[xCab,yR3],[x1,yR3],[x1,yBawah]],[[x1,yBawah],[x0,yBawah]]];
  const arus=[I,I2,I3,I];
  jalur.forEach((p,j)=>{
    let seg=[],tot=0; for(let i=0;i<p.length-1;i++){const L=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]); seg.push(L); tot+=L;}
    const n=Math.max(1,Math.round(arus[j]*1.5));
    for(let q=0;q<n;q++){
      let d=((_spFrame*1.4)+q*tot/n)%tot, i=0; while(i<seg.length&&d>seg[i]){d-=seg[i];i++;} if(i>=seg.length) i=seg.length-1;
      const r=seg[i]?d/seg[i]:0, px=p[i][0]+(p[i+1][0]-p[i][0])*r, py=p[i][1]+(p[i+1][1]-p[i][1])*r;
      ctx.fillStyle='rgba(232,246,255,.9)'; ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fill();
    }
  });
  ctx.textAlign='left'; ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillText('I = '+I.toFixed(3)+' A',xR1a,yAtas-22); ctx.fillText('I₂ = '+I2.toFixed(3)+' A',xR2-40,yR2-22); ctx.fillText('I₃ = '+I3.toFixed(3)+' A',xR3-40,yR3+30);
  _ttlTulis('seriParalelInfo','R_par = '+Rp.toFixed(3)+' Ω, R_total = '+Rt.toFixed(3)+' Ω   |   I = '+I.toFixed(3)+' A; V₁ = '+V1.toFixed(2)+' V, V_par = '+Vp.toFixed(2)+' V (V₁ + V_par = '+(V1+Vp).toFixed(2)+' V)   |   I₂ + I₃ = '+(I2+I3).toFixed(3)+' A = I   |   P_total = '+(V*I).toFixed(2)+' W');
  if(_ttlJalan('seriparalel')){_spFrame++; requestAnimationFrame(drawSeriParalel);}
}

// ── ANIMASI 2 — Transfer daya maksimum dan efisiensi terhadap R_L ──
let _tdFrame=0;
function toggleTransfer(){_ttlToggle('transfer','btnTransfer',drawTransfer);}
window.toggleTransfer=toggleTransfer;
function drawTransfer(){
  const k=_ttlKanvas('cvTransfer'); if(!k) return; const {ctx,W,H}=k;
  const E=_ttlNilai('sl_td_e',24), r=_ttlNilai('sl_td_r',1.0);
  _ttlTulis('v_td_e',E.toFixed(0)); _ttlTulis('v_td_r',r.toFixed(2));
  const PL=RL=>E*E*RL/((r+RL)*(r+RL)), eta=RL=>RL/(r+RL)*100, Pmax=E*E/(4*r);
  const padL=56,padR=56,padT=24,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const RLmax=5*r;
  const X=RL=>x0+RL/RLmax*plotW, Yp=p=>y0-p/(Pmax*1.1)*plotH, Ye=e=>y0-e/100*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let i=0;i<=4;i++){_ttlGaris(ctx,x0,y0-plotH*i/4,x0+plotW,y0-plotH*i/4,'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(0,224,158,.75)'; ctx.fillText((Pmax*1.1*i/4).toFixed(0)+' W',6,y0-plotH*i/4+4); ctx.fillStyle='rgba(255,179,0,.8)'; ctx.fillText((25*i)+'%',W-40,y0-plotH*i/4+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  ctx.textAlign='center'; for(let i=0;i<=5;i++){ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText((i*r).toFixed(2)+' Ω',X(i*r),y0+16);} ctx.textAlign='left';
  ctx.fillStyle='rgba(148,163,184,.7)'; ctx.fillText('R_L (kelipatan r)',x0+plotW-110,y0+30);
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=300;i++){const RL=0.01+(i/300)*RLmax; i?ctx.lineTo(X(RL),Yp(PL(RL))):ctx.moveTo(X(RL),Yp(PL(RL)));} ctx.stroke();
  ctx.strokeStyle='rgba(255,179,0,.9)'; ctx.lineWidth=2; ctx.setLineDash([5,4]); ctx.beginPath();
  for(let i=0;i<=300;i++){const RL=0.01+(i/300)*RLmax; i?ctx.lineTo(X(RL),Ye(eta(RL))):ctx.moveTo(X(RL),Ye(eta(RL)));} ctx.stroke(); ctx.setLineDash([]);
  _ttlGaris(ctx,X(r),padT,X(r),y0,'rgba(236,72,153,.85)',1.5,[3,3]);
  ctx.fillStyle='rgba(236,72,153,.95)'; ctx.fillText('R_L = r → P_maks = '+Pmax.toFixed(2)+' W, η = 50%',Math.min(X(r)+6,x0+plotW-230),padT+12);
  const RLnow=0.01+((_tdFrame*0.004)%1)*RLmax;
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(RLnow),Yp(PL(RLnow)),4.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffb300'; ctx.beginPath(); ctx.arc(X(RLnow),Ye(eta(RLnow)),4.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('■ daya beban P_L',x0+8,padT+12); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('■ efisiensi η',x0+8,padT+26);
  _ttlTulis('transferInfo','R_L = '+RLnow.toFixed(2)+' Ω → I = '+(E/(r+RLnow)).toFixed(3)+' A, P_L = '+PL(RLnow).toFixed(2)+' W, η = '+eta(RLnow).toFixed(1)+' %   |   P_maks = E²/(4r) = '+Pmax.toFixed(2)+' W pada R_L = '+r.toFixed(2)+' Ω');
  if(_ttlJalan('transfer')){_tdFrame++; requestAnimationFrame(drawTransfer);}
}

// ── ANIMASI 3 — Jatuh tegangan dan rugi kabel DC ──
let _kbFrame=0;
const _KABEL=[1.5,2.5,4,6,10,16,25,35,50];
function toggleKabel(){_ttlToggle('kabel','btnKabel',drawKabel);}
window.toggleKabel=toggleKabel;
function drawKabel(){
  const k=_ttlKanvas('cvKabel'); if(!k) return; const {ctx,W,H}=k;
  const V=48, I=_ttlNilai('sl_kb_i',25), L=_ttlNilai('sl_kb_l',30), batas=_ttlNilai('sl_kb_b',3);
  _ttlTulis('v_kb_i',I.toFixed(0)); _ttlTulis('v_kb_l',L.toFixed(0)); _ttlTulis('v_kb_b',batas.toFixed(1));
  const rho=0.0172, dV=A=>2*rho*L*I/A, dVmaks=batas/100*V, Amin=2*rho*L*I/dVmaks;
  const pilih=_KABEL.find(a=>a>=Amin);
  const padL=52,padR=18,padT=26,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const kolom=plotW/_KABEL.length, yMax=Math.max(dVmaks*2.5,dV(_KABEL[2]));
  const Y=v=>y0-Math.min(v,yMax)/yMax*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let i=0;i<=4;i++){const v=yMax*i/4; _ttlGaris(ctx,x0,Y(v),x0+plotW,Y(v),'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.fillText(v.toFixed(1)+' V',4,Y(v)+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  const denyut=1+0.04*Math.sin(_kbFrame*0.1);
  _KABEL.forEach((A,i)=>{
    const v=dV(A), x=x0+kolom*i+kolom*0.2, w=kolom*0.6, ok=v<=dVmaks, ter=A===pilih;
    ctx.fillStyle=ter?'rgba(0,224,158,.95)':ok?'rgba(34,211,238,.45)':'rgba(239,68,68,.7)';
    ctx.fillRect(x,Y(v*(ter?denyut:1)),w,y0-Y(v*(ter?denyut:1)));
    ctx.textAlign='center'; ctx.fillStyle=ter?'#6ee7b7':'rgba(148,163,184,.85)'; ctx.fillText(A+' mm²',x+w/2,y0+14);
    ctx.fillStyle='#e2e8f0'; ctx.fillText(v.toFixed(2)+' V',x+w/2,Y(Math.min(v,yMax))-6);
  });
  _ttlGaris(ctx,x0,Y(dVmaks),x0+plotW,Y(dVmaks),'rgba(239,68,68,.85)',1.5,[6,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('batas '+batas.toFixed(1)+'% = '+dVmaks.toFixed(2)+' V',x0+6,Y(dVmaks)-6);
  const rugi=A=>I*dV(A), eta=A=>V*I/(V*I+rugi(A))*100;
  _ttlTulis('kabelInfo','A minimum = 2ρLI/ΔV_maks = '+Amin.toFixed(2)+' mm² → kabel '+(pilih?pilih+' mm²':'> 50 mm²')+(pilih?': ΔV = '+dV(pilih).toFixed(2)+' V ('+(dV(pilih)/V*100).toFixed(2)+'%), rugi '+rugi(pilih).toFixed(1)+' W, η = '+eta(pilih).toFixed(2)+'%':'')+'   |   beban '+(V*I).toFixed(0)+' W pada '+V+' V, '+L.toFixed(0)+' m');
  if(_ttlJalan('kabel')){_kbFrame++; requestAnimationFrame(drawKabel);}
}

// ── ANIMASI 4 — Sumber nyata: tegangan terminal dan daya terhadap arus beban ──
let _snFrame=0;
function toggleSumber(){_ttlToggle('sumber','btnSumber',drawSumber);}
window.toggleSumber=toggleSumber;
function drawSumber(){
  const k=_ttlKanvas('cvSumber'); if(!k) return; const {ctx,W,H}=k;
  const E=_ttlNilai('sl_sn_e',12.6), r=_ttlNilai('sl_sn_r',0.05), Imax=_ttlNilai('sl_sn_imax',120);
  _ttlTulis('v_sn_e',E.toFixed(1)); _ttlTulis('v_sn_r',r.toFixed(3)); _ttlTulis('v_sn_imax',Imax.toFixed(0));
  const Vt=I=>E-I*r, PL=I=>Vt(I)*I, Isc=E/r, Iplot=Math.min(Imax,Isc);
  const padL=56,padR=56,padT=24,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const Pmax=E*E/(4*r), Pskala=Math.max(PL(Iplot),Iplot<Isc/2?PL(Iplot):Pmax)*1.1;
  const X=I=>x0+I/Iplot*plotW, Yv=v=>y0-v/(E*1.1)*plotH, Yp=p=>y0-p/Pskala*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let i=0;i<=4;i++){_ttlGaris(ctx,x0,y0-plotH*i/4,x0+plotW,y0-plotH*i/4,'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(34,211,238,.8)'; ctx.fillText((E*1.1*i/4).toFixed(1)+' V',6,y0-plotH*i/4+4); ctx.fillStyle='rgba(0,224,158,.8)'; ctx.fillText((Pskala*i/4).toFixed(0)+' W',W-48,y0-plotH*i/4+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  ctx.textAlign='center'; for(let i=0;i<=4;i++){ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText((Iplot*i/4).toFixed(0)+' A',X(Iplot*i/4),y0+16);} ctx.textAlign='left';
  ctx.fillStyle='rgba(148,163,184,.7)'; ctx.fillText('arus beban I',x0+plotW-80,y0+30);
  ctx.strokeStyle='rgba(34,211,238,.95)'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(X(0),Yv(E)); ctx.lineTo(X(Iplot),Yv(Vt(Iplot))); ctx.stroke();
  ctx.strokeStyle='rgba(0,224,158,.9)'; ctx.lineWidth=2; ctx.setLineDash([5,4]); ctx.beginPath();
  for(let i=0;i<=200;i++){const I=Iplot*i/200; i?ctx.lineTo(X(I),Yp(PL(I))):ctx.moveTo(X(I),Yp(PL(I)));} ctx.stroke(); ctx.setLineDash([]);
  const Inow=Iplot*((_snFrame*0.004)%1);
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(Inow),Yv(Vt(Inow)),4.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#00e09e'; ctx.beginPath(); ctx.arc(X(Inow),Yp(PL(Inow)),4.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(34,211,238,.95)'; ctx.fillText('■ V_t = E − I·r',x0+8,padT+12); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('■ P_beban = V_t·I',x0+8,padT+26);
  _ttlTulis('sumberInfo','I = '+Inow.toFixed(1)+' A → V_t = '+Vt(Inow).toFixed(3)+' V (turun '+(Inow*r).toFixed(3)+' V), P_beban = '+PL(Inow).toFixed(1)+' W, rugi dalam = '+(Inow*Inow*r).toFixed(1)+' W   |   I hubung singkat = E/r = '+Isc.toFixed(0)+' A; P_maks = '+Pmax.toFixed(0)+' W pada '+(Isc/2).toFixed(0)+' A');
  if(_ttlJalan('sumber')){_snFrame++; requestAnimationFrame(drawSumber);}
}

_TTL_DAFTAR.push(['cvSeriParalel',()=>drawSeriParalel(),'seriparalel',['sl_sp_v','sl_sp_r1','sl_sp_r2','sl_sp_r3']]);
_TTL_DAFTAR.push(['cvTransfer',()=>drawTransfer(),'transfer',['sl_td_e','sl_td_r']]);
_TTL_DAFTAR.push(['cvKabel',()=>drawKabel(),'kabel',['sl_kb_i','sl_kb_l','sl_kb_b']]);
_TTL_DAFTAR.push(['cvSumber',()=>drawSumber(),'sumber',['sl_sn_e','sl_sn_r','sl_sn_imax']]);
_ttlMulai();
