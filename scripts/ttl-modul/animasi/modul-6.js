// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 6 TEKNIK TENAGA LISTRIK — Aliran Daya dan Transien pada Saluran Transmisi
// Kanvas: cvFasorSaluran, cvProfil, cvTransfer, cvGelombang
// ════════════════════════════════════════════════════════════
const _RAD6=Math.PI/180, _SQ3=Math.sqrt(3);
function _ttlPanah6(ctx,x1,y1,x2,y2,warna,lebar){
  _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar||2);
  const a=Math.atan2(y2-y1,x2-x1); ctx.fillStyle=warna; ctx.beginPath();
  ctx.moveTo(x2,y2); ctx.lineTo(x2-9*Math.cos(a-0.4),y2-9*Math.sin(a-0.4)); ctx.lineTo(x2-9*Math.cos(a+0.4),y2-9*Math.sin(a+0.4)); ctx.closePath(); ctx.fill();
}
// nominal-π: kembalikan V_S (kompleks) untuk V_R acuan, beban P (MW) pf, Z, B
function _piKirim(VRph,PMW,pf,R,X,B){
  const I=PMW*1e6/(3*VRph*pf), phi=Math.acos(pf), Ir=[I*Math.cos(-phi),I*Math.sin(-phi)];
  const Ic=[-B/2*0, B/2*VRph]; // arus kapasitor ujung terima = jB/2·V_R
  const Il=[Ir[0]+Ic[0],Ir[1]+Ic[1]];
  const VS=[VRph+R*Il[0]-X*Il[1], R*Il[1]+X*Il[0]];
  return {VS,Ir,Il,I,phi};
}

// ── ANIMASI 1 — Diagram fasor saluran pendek: V_S = V_R + I(R + jX) ──
let _fsFrame6=0;
function toggleFasorSaluran(){_ttlToggle('fasorsaluran','btnFasorSaluran',drawFasorSaluran);}
window.toggleFasorSaluran=toggleFasorSaluran;
function drawFasorSaluran(){
  const k=_ttlKanvas('cvFasorSaluran'); if(!k) return; const {ctx,W,H}=k;
  const P=_ttlNilai('sl_fl_p',18), pf=_ttlNilai('sl_fl_pf',0.8), R=_ttlNilai('sl_fl_r',9), X=_ttlNilai('sl_fl_x',25.2), VLL=66;
  _ttlTulis('v_fl_p',P.toFixed(1)); _ttlTulis('v_fl_pf',pf.toFixed(2)); _ttlTulis('v_fl_r',R.toFixed(1)); _ttlTulis('v_fl_x',X.toFixed(1));
  const VR=VLL*1000/_SQ3, I=P*1e6/(3*VR*pf), phi=Math.acos(pf);
  const Ir=[I*Math.cos(-phi),I*Math.sin(-phi)];
  const VRv=[I*R*Math.cos(-phi),I*R*Math.sin(-phi)], VXv=[-I*X*Math.sin(-phi),I*X*Math.cos(-phi)];
  const VS=[VR+VRv[0]+VXv[0],VRv[1]+VXv[1]];
  const dV=I*(R*pf+X*Math.sin(phi));
  const ox=40, oy=H*0.62, sk=(W*0.6-60)/Math.max(Math.hypot(VS[0],VS[1]),VR)*0.98;
  const P2=(v)=>[ox+v[0]*sk,oy-v[1]*sk];
  const pR=P2([VR,0]), pRv=P2([VR+VRv[0],VRv[1]]), pS=P2(VS);
  _ttlPanah6(ctx,ox,oy,pR[0],pR[1],'rgba(0,229,255,.95)',2.6);
  _ttlPanah6(ctx,pR[0],pR[1],pRv[0],pRv[1],'rgba(255,179,0,.95)',2.2);
  _ttlPanah6(ctx,pRv[0],pRv[1],pS[0],pS[1],'rgba(168,85,247,.95)',2.2);
  _ttlPanah6(ctx,ox,oy,pS[0],pS[1],'rgba(0,224,158,.95)',2.8);
  const skI=VR*sk/Math.max(I,1)*0.45; const pI=[ox+Ir[0]*skI,oy-Ir[1]*skI];
  _ttlPanah6(ctx,ox,oy,pI[0],pI[1],'rgba(239,68,68,.9)',2);
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('V_R = '+(VR/1000).toFixed(2)+' kV/fasa',pR[0]-120,pR[1]+16);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('I·R',pRv[0]+4,pRv[1]+12);
  ctx.fillStyle='rgba(168,85,247,.95)'; ctx.fillText('j·I·X',pS[0]+6,pS[1]+2);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('V_S = '+(Math.hypot(VS[0],VS[1])/1000).toFixed(2)+' kV/fasa ∠'+(Math.atan2(VS[1],VS[0])/_RAD6).toFixed(1)+'°',ox+10,pS[1]-8);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('I = '+I.toFixed(0)+' A ∠−'+(phi/_RAD6).toFixed(1)+'°',pI[0]+6,pI[1]+12);
  // panel kanan: batang jatuh tegangan
  const bx=W*0.66, bw=W-bx-20, by=30, bh=H-70;
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Tegangan antar-saluran (kV)',bx+bw/2,by-10);
  const maks=Math.max(Math.hypot(VS[0],VS[1]),VR)*_SQ3/1000*1.1;
  const batang=(x,w,v,warna,label)=>{const h=v/maks*bh; ctx.fillStyle=warna; ctx.fillRect(x,by+bh-h,w,h); ctx.fillStyle='#e2e8f0'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(v.toFixed(1),x+w/2,by+bh-h-6); ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText(label,x+w/2,by+bh+16);};
  batang(bx+bw*0.1,bw*0.32,Math.hypot(VS[0],VS[1])*_SQ3/1000,'rgba(0,224,158,.7)','V_S kirim');
  batang(bx+bw*0.58,bw*0.32,VLL,'rgba(0,229,255,.7)','V_R terima');
  const VSll=Math.hypot(VS[0],VS[1])*_SQ3/1000, loss=3*I*I*R/1e6;
  _ttlTulis('fasorSaluranInfo','I = '+I.toFixed(1)+' A;  ΔV ≈ I(R cos φ + X sin φ) = '+(dV/1000).toFixed(3)+' kV/fasa;  |V_S| = '+VSll.toFixed(2)+' kV (antar-saluran) → regulasi ≈ '+((VSll-VLL)/VLL*100).toFixed(2)+' %   |   rugi 3I²R = '+loss.toFixed(3)+' MW, η = '+(P/(P+loss)*100).toFixed(2)+' %   |   sudut daya δ = '+(Math.atan2(VS[1],VS[0])/_RAD6).toFixed(2)+'°');
  if(_ttlJalan('fasorsaluran')){_fsFrame6++; requestAnimationFrame(drawFasorSaluran);}
}

// ── ANIMASI 2 — Profil tegangan sepanjang saluran (nominal-π bertingkat): beban berat, SIL, tanpa beban ──
let _prFrame=0;
function toggleProfil(){_ttlToggle('profil','btnProfil',drawProfil);}
window.toggleProfil=toggleProfil;
function drawProfil(){
  const k=_ttlKanvas('cvProfil'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_pr_l',150), P=_ttlNilai('sl_pr_p',60), pf=_ttlNilai('sl_pr_pf',0.9), Qc=_ttlNilai('sl_pr_qc',0), VLL=132;
  _ttlTulis('v_pr_l',L.toFixed(0)); _ttlTulis('v_pr_p',P.toFixed(0)); _ttlTulis('v_pr_pf',pf.toFixed(2)); _ttlTulis('v_pr_qc',Qc.toFixed(0));
  const r=0.1, x=0.4, b=3e-6, seg=30, dl=L/seg;
  // integrasi dari ujung terima ke ujung kirim, V_R = acuan
  const VR=VLL*1000/_SQ3;
  let V=[VR,0]; const I0=P*1e6/(3*VR*pf), phi=Math.acos(pf);
  let I=[I0*Math.cos(-phi),I0*Math.sin(-phi)];
  // kapasitor shunt di ujung terima: arus mendahului 90°
  const Iq=Qc*1e6/(3*VR); I=[I[0],I[1]+Iq];
  const prof=[Math.hypot(V[0],V[1])];
  for(let s=0;s<seg;s++){
    // shunt setengah segmen di kedua ujung: arus kapasitor jB·dl/2·V
    const Bh=b*dl/2; I=[I[0]-Bh*V[1],I[1]+Bh*V[0]];
    V=[V[0]+r*dl*I[0]-x*dl*I[1],V[1]+r*dl*I[1]+x*dl*I[0]];
    I=[I[0]-Bh*V[1],I[1]+Bh*V[0]];
    prof.push(Math.hypot(V[0],V[1]));
  }
  const VS=prof[seg];
  // gambar profil dinormalisasi pada V_S (tegangan kirim dijaga 132 kV): V(x)/V_S·132
  const padL=60,padR=30,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=0.8,vmax=1.15; const Y=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right';
  for(const v of [0.8,0.9,1.0,1.1]){_ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText((v*VLL).toFixed(0)+' kV',padL-5,Y(v)+4);}
  ctx.textAlign='center'; for(let i=0;i<=5;i++) ctx.fillText((L*i/5).toFixed(0)+' km',padL+plotW*i/5,padT+plotH+16);
  ctx.fillText('kirim',padL,padT+plotH+28); ctx.fillText('terima',padL+plotW,padT+plotH+28);
  _ttlGaris(ctx,padL,Y(1.05),padL+plotW,Y(1.05),'rgba(239,68,68,.7)',1,[4,4]); _ttlGaris(ctx,padL,Y(0.95),padL+plotW,Y(0.95),'rgba(239,68,68,.7)',1,[4,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(239,68,68,.85)'; ctx.fillText('±5 %',padL+4,Y(1.05)-4);
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.6; ctx.beginPath();
  for(let s=0;s<=seg;s++){const xx=padL+plotW*(1-s/seg); const yy=Y(prof[s]/VS); s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} ctx.stroke();
  // titik berjalan
  const pos=(_prFrame*0.4)%seg; const s0=Math.floor(pos), fr=pos-s0, vv=(prof[s0]*(1-fr)+prof[Math.min(seg,s0+1)]*fr)/VS;
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(padL+plotW*(1-pos/seg),Y(vv),4.5,0,Math.PI*2); ctx.fill();
  const VRact=VLL/ (VS/VR); // tegangan terima aktual bila V_S = 132 kV
  const Zc=Math.sqrt(x/(b)), SIL=VLL*VLL/Zc;
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='left'; ctx.font="600 11px 'JetBrains Mono',monospace";
  ctx.fillText('V_R = '+VRact.toFixed(1)+' kV bila V_S = 132 kV ('+((VRact-VLL)/VLL*100).toFixed(1)+' %)',padL+8,padT+14);
  _ttlTulis('profilInfo','R = '+(r*L).toFixed(1)+' Ω, X = '+(x*L).toFixed(1)+' Ω, B = '+(b*L*1e6).toFixed(0)+' µS   |   V_S = 132 kV → V_R = '+VRact.toFixed(2)+' kV ('+((VRact-VLL)/VLL*100).toFixed(2)+' %)'+(P===0?'  ⚠ efek Ferranti: tanpa beban V_R > V_S':'')+'   |   Z_c = '+Zc.toFixed(0)+' Ω, SIL = '+SIL.toFixed(1)+' MW: beban di bawah SIL menaikkan tegangan, di atas SIL menurunkannya   |   kapasitor shunt ujung terima '+Qc.toFixed(0)+' MVAR');
  if(_ttlJalan('profil')){_prFrame++; requestAnimationFrame(drawProfil);}
}

// ── ANIMASI 3 — Kurva P–δ: kompensasi seri dan batas kestabilan ──
let _trFrame=0;
function toggleTransfer(){_ttlToggle('transfer','btnTransfer',drawTransfer);}
window.toggleTransfer=toggleTransfer;
function drawTransfer(){
  const k=_ttlKanvas('cvTransfer'); if(!k) return; const {ctx,W,H}=k;
  const V=_ttlNilai('sl_tr_v',220), X=_ttlNilai('sl_tr_x',80), kc=_ttlNilai('sl_tr_k',40), Pop=_ttlNilai('sl_tr_p',400);
  _ttlTulis('v_tr_v',V.toFixed(0)); _ttlTulis('v_tr_x',X.toFixed(0)); _ttlTulis('v_tr_k',kc.toFixed(0)); _ttlTulis('v_tr_p',Pop.toFixed(0));
  const Xeff=X*(1-kc/100), Pm0=V*V/X, Pm1=V*V/Xeff;
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const Xd=d=>padL+d/180*plotW, Yp=p=>padT+plotH-p/(Pm1*1.1)*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='center';
  for(const d of [0,30,60,90,120,150,180]){ctx.fillText(d+'°',Xd(d),padT+plotH+16); _ttlGaris(ctx,Xd(d),padT,Xd(d),padT+plotH,'rgba(148,163,184,.1)',1);}
  ctx.textAlign='right'; for(let i=1;i<=4;i++){ctx.fillText((Pm1*1.1*i/4).toFixed(0)+' MW',padL-4,Yp(Pm1*1.1*i/4)+4);}
  const kurva=(Pm,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.beginPath(); for(let i=0;i<=180;i++){const p=Pm*Math.sin(i*_RAD6); i?ctx.lineTo(Xd(i),Yp(p)):ctx.moveTo(Xd(i),Yp(p));} ctx.stroke();};
  kurva(Pm0,'rgba(148,163,184,.8)',1.8); kurva(Pm1,'rgba(0,224,158,.95)',2.6);
  _ttlGaris(ctx,padL,Yp(Pop),padL+plotW,Yp(Pop),'rgba(255,179,0,.9)',1.6,[5,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(148,163,184,.9)'; ctx.fillText('tanpa kompensasi: P_maks = '+Pm0.toFixed(0)+' MW',Xd(92),Yp(Pm0)-6);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('kompensasi '+kc.toFixed(0)+' %: P_maks = '+Pm1.toFixed(0)+' MW',Xd(92),Yp(Pm1)-6);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('P beban = '+Pop.toFixed(0)+' MW',padL+6,Yp(Pop)-6);
  // titik operasi berayun kecil di sekitar δ operasi
  let info='';
  if(Pop<Pm1){const d0=Math.asin(Pop/Pm1)/_RAD6, d1=Pop<Pm0?Math.asin(Pop/Pm0)/_RAD6:NaN; const dd=d0+3*Math.sin(_trFrame*0.05);
    ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(Xd(dd),Yp(Pm1*Math.sin(dd*_RAD6)),5,0,Math.PI*2); ctx.fill();
    if(Number.isFinite(d1)){ctx.fillStyle='rgba(148,163,184,.9)'; ctx.beginPath(); ctx.arc(Xd(d1),Yp(Pop),4,0,Math.PI*2); ctx.fill();}
    info='δ operasi = '+d0.toFixed(1)+'° (tanpa kompensasi '+(Number.isFinite(d1)?d1.toFixed(1)+'°':'TIDAK TERCAPAI')+');  cadangan kestabilan = '+((1-Pop/Pm1)*100).toFixed(0)+' %';}
  else{info='⚠ P beban melampaui P_maks: tidak ada titik operasi tunak (hilang sinkron)';}
  _ttlTulis('transferInfo','X_eff = '+X+'(1 − '+(kc/100).toFixed(2)+') = '+Xeff.toFixed(1)+' Ω;  P_maks = V²/X_eff = '+Pm1.toFixed(1)+' MW (naik '+((Pm1/Pm0-1)*100).toFixed(0)+' %)   |   '+info+'   |   Q pada δ operasi ≈ V²(1 − cos δ)/X_eff (perlu dipasok kedua ujung)');
  if(_ttlJalan('transfer')){_trFrame++; requestAnimationFrame(drawTransfer);}
}

// ── ANIMASI 4 — Gelombang berjalan: pantulan dan transmisi di sambungan Z₁ → Z₂ ──
let _gwFrame=0;
function toggleGelombang(){_ttlToggle('gelombang','btnGelombang',drawGelombang);}
window.toggleGelombang=toggleGelombang;
function drawGelombang(){
  const k=_ttlKanvas('cvGelombang'); if(!k) return; const {ctx,W,H}=k;
  const V=_ttlNilai('sl_gw_v',150), Z1=_ttlNilai('sl_gw_z1',380), Z2=_ttlNilai('sl_gw_z2',45);
  _ttlTulis('v_gw_v',V.toFixed(0)); _ttlTulis('v_gw_z1',Z1.toFixed(0)); _ttlTulis('v_gw_z2',Z2.toFixed(0));
  const rho=(Z2-Z1)/(Z1+Z2), tau=2*Z2/(Z1+Z2);
  const padL=30,padR=30,padT=30,padB=40,plotW=W-padL-padR,plotH=H-padT-padB,xj=padL+plotW*0.55,y0=padT+plotH*0.6;
  const sk=plotH*0.5/Math.max(V*Math.max(1,Math.abs(1+rho)),1);
  _ttlGaris(ctx,padL,y0,padL+plotW,y0,'rgba(148,163,184,.5)',1.4);
  _ttlGaris(ctx,xj,padT,xj,padT+plotH,'rgba(255,179,0,.8)',1.6,[5,4]);
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='rgba(148,163,184,.9)';
  ctx.fillText('saluran udara Z₁ = '+Z1+' Ω',padL+plotW*0.27,padT+plotH+18); ctx.fillText('kabel Z₂ = '+Z2+' Ω',padL+plotW*0.78,padT+plotH+18);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('sambungan',xj,padT-8);
  // posisi pulsa: t dalam satuan lebar plot; kecepatan di kabel setengah kecepatan udara
  const T=(_gwFrame*0.5)%(plotW*1.6); const lebar=plotW*0.12;
  const pulsa=(xc,amp,w,warna,xmin,xmax)=>{ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(Math.max(xmin,xc-w),y0);
    for(let i=0;i<=40;i++){const xx=xc-w+2*w*i/40; if(xx<xmin||xx>xmax) continue; const yy=y0-amp*sk*Math.exp(-Math.pow((xx-xc)/(w*0.4),2)); ctx.lineTo(xx,yy);} ctx.lineTo(Math.min(xmax,xc+w),y0); ctx.closePath(); ctx.fill();};
  const xIn=padL+T; // gelombang datang
  if(xIn-lebar<xj) pulsa(xIn,V,lebar,'rgba(0,229,255,.8)',padL,xj);
  if(xIn+lebar>xj){const dt=xIn-xj; pulsa(xj-dt,rho*V,lebar,'rgba(239,68,68,.75)',padL,xj); pulsa(xj+dt*0.5,tau*V,lebar*0.5,'rgba(0,224,158,.8)',xj,padL+plotW);}
  ctx.textAlign='left'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('datang V = '+V+' kV →',padL+6,padT+12);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('← pantul ρV = '+(rho*V).toFixed(1)+' kV',padL+6,padT+26);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('diteruskan τV = '+(tau*V).toFixed(1)+' kV →',xj+8,padT+12);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('v₂ ≈ ½ v₁ (kabel)',xj+8,padT+26);
  _ttlTulis('gelombangInfo','ρ = (Z₂ − Z₁)/(Z₁ + Z₂) = '+rho.toFixed(4)+',  τ = 2Z₂/(Z₁ + Z₂) = '+tau.toFixed(4)+'   |   V_pantul = '+(rho*V).toFixed(2)+' kV, V_teruskan = '+(tau*V).toFixed(2)+' kV (tegangan di sambungan = V + ρV = τV)   |   arus: I_datang = V/Z₁ = '+(V*1000/Z1).toFixed(1)+' A, I_teruskan = τV/Z₂ = '+(tau*V*1000/Z2).toFixed(1)+' A'+(Z2>Z1?'   ⚠ Z₂ > Z₁: tegangan diteruskan LEBIH BESAR dari yang datang':''));
  if(_ttlJalan('gelombang')){_gwFrame++; requestAnimationFrame(drawGelombang);}
}

_TTL_DAFTAR.push(['cvFasorSaluran',()=>drawFasorSaluran(),'fasorsaluran',['sl_fl_p','sl_fl_pf','sl_fl_r','sl_fl_x']]);
_TTL_DAFTAR.push(['cvProfil',()=>drawProfil(),'profil',['sl_pr_l','sl_pr_p','sl_pr_pf','sl_pr_qc']]);
_TTL_DAFTAR.push(['cvTransfer',()=>drawTransfer(),'transfer',['sl_tr_v','sl_tr_x','sl_tr_k','sl_tr_p']]);
_TTL_DAFTAR.push(['cvGelombang',()=>drawGelombang(),'gelombang',['sl_gw_v','sl_gw_z1','sl_gw_z2']]);
_ttlMulai();
