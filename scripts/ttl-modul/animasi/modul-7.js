// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 7 TEKNIK TENAGA LISTRIK — Reaktansi dan Impedansi di Sistem Tenaga Listrik
// Kanvas: cvPerUnit, cvYDelta, cvReduksi, cvHubungSingkat
// ════════════════════════════════════════════════════════════
const _SQ3_7=Math.sqrt(3);
function _ttlKotak7(ctx,x,y,w,h,warna,label,sub){
  ctx.fillStyle='rgba(14,22,40,.95)'; ctx.strokeStyle=warna; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(x,y,w,h,8); ctx.fill(); ctx.stroke();
  ctx.fillStyle=warna; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(label,x+w/2,y+h/2-(sub?4:-4));
  if(sub){ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(sub,x+w/2,y+h/2+12);}
}
function _ttlReaktor7(ctx,x1,x2,y,warna,label){
  const n=4,w=(x2-x1)/n; ctx.strokeStyle=warna; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<n;i++){ctx.arc(x1+w*(i+0.5),y,w/2,Math.PI,0,false);} ctx.stroke();
  if(label){ctx.fillStyle=warna; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(label,(x1+x2)/2,y-12);}
}

// ── ANIMASI 1 — Sistem per unit: basis, Z_base, I_base, dan konversi ohm ↔ pu ──
let _puFrame=0;
function togglePerUnit(){_ttlToggle('perunit','btnPerUnit',drawPerUnit);}
window.togglePerUnit=togglePerUnit;
function drawPerUnit(){
  const k=_ttlKanvas('cvPerUnit'); if(!k) return; const {ctx,W,H}=k;
  const S=_ttlNilai('sl_pu_s',100), kV=_ttlNilai('sl_pu_kv',150), Xohm=_ttlNilai('sl_pu_x',35), Xpu0=_ttlNilai('sl_pu_xpu',0.12), S0=_ttlNilai('sl_pu_s0',80);
  _ttlTulis('v_pu_s',S.toFixed(0)); _ttlTulis('v_pu_kv',kV.toFixed(0)); _ttlTulis('v_pu_x',Xohm.toFixed(1)); _ttlTulis('v_pu_xpu',Xpu0.toFixed(2)); _ttlTulis('v_pu_s0',S0.toFixed(0));
  const Zb=kV*kV/S, Ib=S*1e6/(_SQ3_7*kV*1e3), Xpu=Xohm/Zb, XpuNew=Xpu0*S/S0, XohmT=XpuNew*Zb;
  // kiri: kartu basis
  const cw=Math.min(200,W*0.26);
  _ttlKotak7(ctx,20,24,cw,44,'rgba(0,229,255,.95)','S_base = '+S.toFixed(0)+' MVA','V_base = '+kV.toFixed(0)+' kV');
  _ttlKotak7(ctx,20,80,cw,44,'rgba(255,179,0,.95)','Z_base = kV²/MVA','= '+Zb.toFixed(3)+' Ω');
  _ttlKotak7(ctx,20,136,cw,44,'rgba(168,85,247,.95)','I_base = S/(√3·V)','= '+Ib.toFixed(1)+' A');
  _ttlKotak7(ctx,20,192,cw,44,'rgba(148,163,184,.95)','V_base tetap ⇒ Z ∝ 1/S','I_base ∝ S');
  // kanan: dua batang konversi
  const bx=40+cw, bw=W-bx-20, y1=40, y2=150, bh=34;
  const fase=(Math.sin(_puFrame*0.04)+1)/2;
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('Saluran: '+Xohm.toFixed(1)+' Ω  →  X_pu = X_Ω / Z_base = '+Xpu.toFixed(4)+' pu',bx,y1-10);
  const skl=bw/Math.max(Xohm,Zb,1)*0.95;
  ctx.fillStyle='rgba(255,179,0,.35)'; ctx.fillRect(bx,y1,Zb*skl,bh); ctx.fillStyle='rgba(0,224,158,.85)'; ctx.fillRect(bx,y1,Xohm*skl*fase,bh);
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('Z_base '+Zb.toFixed(1)+' Ω = 1 pu',bx+4,y1+bh+14); ctx.fillText('X = '+Xohm.toFixed(1)+' Ω',bx+Math.max(4,Xohm*skl*fase-70),y1+bh/2+4);
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(236,72,153,.95)'; ctx.fillText('Trafo: X = '+Xpu0.toFixed(2)+' pu pada '+S0.toFixed(0)+' MVA  →  pada '+S.toFixed(0)+' MVA: '+XpuNew.toFixed(4)+' pu  ('+XohmT.toFixed(3)+' Ω)',bx,y2-10);
  const skp=bw/Math.max(Xpu0,XpuNew,0.05)*0.95;
  ctx.fillStyle='rgba(148,163,184,.35)'; ctx.fillRect(bx,y2,Xpu0*skp,bh); ctx.fillStyle='rgba(236,72,153,.85)'; ctx.fillRect(bx,y2+bh+6,XpuNew*skp*fase,bh);
  ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('basis lama '+S0.toFixed(0)+' MVA: '+Xpu0.toFixed(3)+' pu',bx+4,y2+bh/2+4); ctx.fillText('basis baru '+S.toFixed(0)+' MVA: '+XpuNew.toFixed(4)+' pu',bx+4,y2+bh+6+bh/2+4);
  _ttlTulis('perUnitInfo','Z_base = '+kV.toFixed(0)+'²/'+S.toFixed(0)+' = '+Zb.toFixed(4)+' Ω;  I_base = '+Ib.toFixed(2)+' A   |   saluran '+Xohm.toFixed(1)+' Ω = '+Xpu.toFixed(4)+' pu   |   trafo '+Xpu0.toFixed(2)+' pu @'+S0.toFixed(0)+' MVA → '+XpuNew.toFixed(4)+' pu @'+S.toFixed(0)+' MVA = '+XohmT.toFixed(3)+' Ω   |   MVA hubung singkat bila hanya reaktansi trafo: '+(S/XpuNew).toFixed(1)+' MVA');
  if(_ttlJalan('perunit')){_puFrame++; requestAnimationFrame(drawPerUnit);}
}

// ── ANIMASI 2 — Transformasi bintang ↔ segitiga ──
let _ydFrame=0;
function toggleYDelta(){_ttlToggle('ydelta','btnYDelta',drawYDelta);}
window.toggleYDelta=toggleYDelta;
function drawYDelta(){
  const k=_ttlKanvas('cvYDelta'); if(!k) return; const {ctx,W,H}=k;
  const Za=_ttlNilai('sl_yd_a',3), Zb=_ttlNilai('sl_yd_b',6), Zc=_ttlNilai('sl_yd_c',9);
  _ttlTulis('v_yd_a',Za.toFixed(1)); _ttlTulis('v_yd_b',Zb.toFixed(1)); _ttlTulis('v_yd_c',Zc.toFixed(1));
  const num=Za*Zb+Zb*Zc+Zc*Za, Zab=num/Zc, Zbc=num/Za, Zca=num/Zb;
  const warna=['rgba(239,68,68,.95)','rgba(255,179,0,.95)','rgba(0,229,255,.95)'];
  const gambarSimpul=(x,y,lab,c)=>{ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill(); ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(lab,x,y-10);};
  // bintang kiri
  const cx=W*0.25, cy=H/2+10, r=Math.min(H/2-40,90);
  const pts=[[cx,cy-r],[cx-r*0.87,cy+r*0.5],[cx+r*0.87,cy+r*0.5]];
  const ZY=[Za,Zb,Zc], lab=['a','b','c'];
  pts.forEach((p,i)=>{_ttlGaris(ctx,cx,cy,p[0],p[1],'rgba(148,163,184,.7)',2); const mx=(cx+p[0])/2,my=(cy+p[1])/2; ctx.fillStyle='rgba(14,22,40,.95)'; ctx.fillRect(mx-22,my-9,44,18); ctx.strokeStyle=warna[i]; ctx.lineWidth=1.8; ctx.strokeRect(mx-22,my-9,44,18); ctx.fillStyle=warna[i]; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Z_'+lab[i]+' '+ZY[i].toFixed(1),mx,my+4); gambarSimpul(p[0],p[1],lab[i],warna[i]);});
  ctx.fillStyle='rgba(148,163,184,.95)'; ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e2e8f0'; ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Bintang (Y)',cx,26);
  // panah tengah berkedip
  const a=0.5+0.5*Math.sin(_ydFrame*0.06);
  ctx.fillStyle='rgba(0,224,158,'+a.toFixed(2)+')'; ctx.font="700 22px 'JetBrains Mono',monospace"; ctx.fillText('⇄',W/2,H/2+18);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.9)'; ctx.fillText('Z_Δ = Σ(Z_iZ_j)/Z_lawan',W/2,H/2+40); ctx.fillText('Z_Y = Z_iZ_j/ΣZ_Δ',W/2,H/2+54);
  // segitiga kanan
  const cx2=W*0.75, pts2=[[cx2,cy-r],[cx2-r*0.87,cy+r*0.5],[cx2+r*0.87,cy+r*0.5]];
  const ZD=[[0,1,Zab,'Z_ab'],[1,2,Zbc,'Z_bc'],[2,0,Zca,'Z_ca']];
  ZD.forEach(([i,j,Z,l],q)=>{const p=pts2[i],s=pts2[j]; _ttlGaris(ctx,p[0],p[1],s[0],s[1],'rgba(148,163,184,.7)',2); const mx=(p[0]+s[0])/2,my=(p[1]+s[1])/2; ctx.fillStyle='rgba(14,22,40,.95)'; ctx.fillRect(mx-30,my-9,60,18); ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=1.8; ctx.strokeRect(mx-30,my-9,60,18); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(l+' '+Z.toFixed(1),mx,my+4);});
  pts2.forEach((p,i)=>gambarSimpul(p[0],p[1],lab[i],warna[i]));
  ctx.fillStyle='#e2e8f0'; ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Segitiga (Δ)',cx2,26);
  const RabY=Za+Zb, RabD=Zab*(Zbc+Zca)/(Zab+Zbc+Zca);
  _ttlTulis('yDeltaInfo','Σ(Z_iZ_j) = '+num.toFixed(3)+';  Z_ab = '+Zab.toFixed(4)+' Ω, Z_bc = '+Zbc.toFixed(4)+' Ω, Z_ca = '+Zca.toFixed(4)+' Ω   |   pemeriksaan: resistansi a–b dengan c terbuka = Z_a + Z_b = '+RabY.toFixed(4)+' Ω pada Y, dan Z_ab ‖ (Z_bc + Z_ca) = '+RabD.toFixed(4)+' Ω pada Δ (harus sama)'+(Math.abs(Za-Zb)<1e-9&&Math.abs(Zb-Zc)<1e-9?'   |   seimbang: Z_Δ = 3 Z_Y':''));
  if(_ttlJalan('ydelta')){_ydFrame++; requestAnimationFrame(drawYDelta);}
}

// ── ANIMASI 3 — Reduksi jaringan per unit dan MVA hubung singkat ──
let _rdFrame=0;
function toggleReduksi(){_ttlToggle('reduksi','btnReduksi',drawReduksi);}
window.toggleReduksi=toggleReduksi;
function drawReduksi(){
  const k=_ttlKanvas('cvReduksi'); if(!k) return; const {ctx,W,H}=k;
  const Xg1=_ttlNilai('sl_rd_g1',0.18), Xg2=_ttlNilai('sl_rd_g2',0.25), Xt=_ttlNilai('sl_rd_t',0.15), Xl=_ttlNilai('sl_rd_l',0.1556), S=100;
  _ttlTulis('v_rd_g1',Xg1.toFixed(2)); _ttlTulis('v_rd_g2',Xg2.toFixed(2)); _ttlTulis('v_rd_t',Xt.toFixed(2)); _ttlTulis('v_rd_l',Xl.toFixed(3));
  const Xpar=Xg1*Xg2/(Xg1+Xg2), XA=Xpar, XB=Xpar+Xt, XC=XB+Xl;
  const y=H*0.42, x0=30, xA=W*0.36, xB=W*0.62, xC=W-40;
  // dua generator paralel
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  [[Xg1,y-38,'G1 X″='+Xg1.toFixed(2)],[Xg2,y+38,'G2 X″='+Xg2.toFixed(2)]].forEach(([X,yy,l])=>{
    ctx.strokeStyle='rgba(255,179,0,.95)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x0+14,yy,14,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('G',x0+14,yy+4);
    _ttlGaris(ctx,x0+28,yy,x0+60,yy,'rgba(148,163,184,.7)',2); _ttlReaktor7(ctx,x0+60,x0+120,yy,'rgba(255,179,0,.95)',l); _ttlGaris(ctx,x0+120,yy,xA,yy,'rgba(148,163,184,.7)',2); _ttlGaris(ctx,xA,yy,xA,y,'rgba(148,163,184,.7)',2);
  });
  // rel A, trafo, rel B, saluran, rel C
  const rel=(x,lab,X)=>{_ttlGaris(ctx,x,y-50,x,y+50,'rgba(0,229,255,.95)',5); ctx.fillStyle='rgba(0,229,255,.95)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(lab,x,y-58); ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('X_th '+X.toFixed(4),x,y+66); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('S_sc '+(S/X).toFixed(0)+' MVA',x,y+80);};
  rel(xA,'rel A (13,8 kV)',XA);
  _ttlGaris(ctx,xA,y,xA+(xB-xA)*0.25,y,'rgba(148,163,184,.7)',2); _ttlReaktor7(ctx,xA+(xB-xA)*0.25,xA+(xB-xA)*0.75,y,'rgba(168,85,247,.95)','T X='+Xt.toFixed(2)); _ttlGaris(ctx,xA+(xB-xA)*0.75,y,xB,y,'rgba(148,163,184,.7)',2);
  rel(xB,'rel B (150 kV)',XB);
  _ttlGaris(ctx,xB,y,xB+(xC-xB)*0.25,y,'rgba(148,163,184,.7)',2); _ttlReaktor7(ctx,xB+(xC-xB)*0.25,xB+(xC-xB)*0.75,y,'rgba(0,224,158,.95)','saluran X='+Xl.toFixed(3)); _ttlGaris(ctx,xB+(xC-xB)*0.75,y,xC,y,'rgba(148,163,184,.7)',2);
  rel(xC,'rel C',XC);
  // titik gangguan berkedip bergantian di tiga rel
  const idx=Math.floor((_rdFrame/90)%3), xs=[xA,xB,xC][idx], Xs=[XA,XB,XC][idx];
  const a=0.5+0.5*Math.sin(_rdFrame*0.2); ctx.fillStyle='rgba(239,68,68,'+a.toFixed(2)+')'; ctx.beginPath(); ctx.arc(xs,y+30,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('gangguan 3φ di sini: I_sc = '+(S/Xs).toFixed(0)+' MVA / (√3·V)',xs,y+H*0.5-30>H-14?H-14:y+H*0.52);
  _ttlTulis('reduksiInfo','X_par = '+Xg1.toFixed(2)+'‖'+Xg2.toFixed(2)+' = '+Xpar.toFixed(4)+' pu → S_sc(A) = '+(S/XA).toFixed(1)+' MVA, I_sc(13,8 kV) = '+(S/XA/(_SQ3_7*13.8)).toFixed(2)+' kA   |   + trafo '+Xt.toFixed(2)+' → X = '+XB.toFixed(4)+', S_sc(B) = '+(S/XB).toFixed(1)+' MVA, I_sc(150 kV) = '+(S/XB/(_SQ3_7*150)).toFixed(3)+' kA   |   + saluran '+Xl.toFixed(3)+' → X = '+XC.toFixed(4)+', S_sc(C) = '+(S/XC).toFixed(1)+' MVA   (basis '+S+' MVA)');
  if(_ttlJalan('reduksi')){_rdFrame++; requestAnimationFrame(drawReduksi);}
}

// ── ANIMASI 4 — Arus hubung singkat generator: subtransien, transien, tunak ──
let _hsFrame=0;
function toggleHubungSingkat(){_ttlToggle('hubungsingkat','btnHubungSingkat',drawHubungSingkat);}
window.toggleHubungSingkat=toggleHubungSingkat;
function drawHubungSingkat(){
  const k=_ttlKanvas('cvHubungSingkat'); if(!k) return; const {ctx,W,H}=k;
  const Xd2=_ttlNilai('sl_hs_x2',0.18), Xd1=_ttlNilai('sl_hs_x1',0.28), Xd=_ttlNilai('sl_hs_xd',1.4), Td2=_ttlNilai('sl_hs_t2',0.03), Td1=_ttlNilai('sl_hs_t1',1.0);
  _ttlTulis('v_hs_x2',Xd2.toFixed(2)); _ttlTulis('v_hs_x1',Xd1.toFixed(2)); _ttlTulis('v_hs_xd',Xd.toFixed(2)); _ttlTulis('v_hs_t2',Td2.toFixed(3)); _ttlTulis('v_hs_t1',Td1.toFixed(2));
  const I2=1/Xd2, I1=1/Xd1, I0=1/Xd;
  const env=t=>(I2-I1)*Math.exp(-t/Td2)+(I1-I0)*Math.exp(-t/Td1)+I0;
  const padL=56,padR=20,padT=20,padB=34,plotW=W-padL-padR,plotH=H-padT-padB,y0=padT+plotH/2,tmax=3.0;
  const X=t=>padL+t/tmax*plotW, Y=i=>y0-i/(I2*1.15)*(plotH/2);
  _ttlGaris(ctx,padL,y0,padL+plotW,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='center';
  for(let t=0;t<=3;t+=0.5) ctx.fillText(t.toFixed(1)+' s',X(t),padT+plotH+16);
  ctx.textAlign='right'; for(const v of [-I2,-I1,-I0,I0,I1,I2]){ctx.fillText(v.toFixed(1)+' pu',padL-4,Y(v)+4);}
  // selubung
  ctx.strokeStyle='rgba(236,72,153,.85)'; ctx.setLineDash([4,3]); ctx.lineWidth=1.4; ctx.beginPath(); for(let i=0;i<=300;i++){const t=i/300*tmax; i?ctx.lineTo(X(t),Y(env(t))):ctx.moveTo(X(t),Y(env(t)));} ctx.stroke();
  ctx.beginPath(); for(let i=0;i<=300;i++){const t=i/300*tmax; i?ctx.lineTo(X(t),Y(-env(t))):ctx.moveTo(X(t),Y(-env(t)));} ctx.stroke(); ctx.setLineDash([]);
  // arus sesaat (50 Hz, simetris) sampai waktu berjalan
  const tNow=((_hsFrame*0.006)%tmax);
  ctx.strokeStyle='rgba(0,229,255,.95)'; ctx.lineWidth=1.4; ctx.beginPath();
  const n=Math.floor(tNow*400); for(let i=0;i<=n;i++){const t=i/400; const v=env(t)*Math.sin(2*Math.PI*50*t); i?ctx.lineTo(X(t),Y(v)):ctx.moveTo(X(t),Y(v));} ctx.stroke();
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(236,72,153,.95)'; ctx.fillText('I″ = 1/X″ = '+I2.toFixed(2)+' pu',X(0.05),Y(I2)-6);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('I′ = 1/X′ = '+I1.toFixed(2)+' pu',X(0.35),Y(I1)-6);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('I_tunak = 1/X_s = '+I0.toFixed(2)+' pu',X(2.0),Y(I0)-6);
  _ttlTulis('hubungSingkatInfo','Selubung arus: i(t) = (I″ − I′)e^(−t/T″) + (I′ − I) e^(−t/T′) + I   |   I″ = '+I2.toFixed(3)+' pu (untuk PMT: arus putus dievaluasi 3–5 siklus setelah gangguan ≈ '+env(0.08).toFixed(2)+' pu), I′ = '+I1.toFixed(3)+' pu, I_tunak = '+I0.toFixed(3)+' pu   |   pada t = '+tNow.toFixed(2)+' s selubung = '+env(tNow).toFixed(3)+' pu   |   komponen DC (asimetri) tidak digambar; menambah puncak awal sampai ×1,6–1,8');
  if(_ttlJalan('hubungsingkat')){_hsFrame++; requestAnimationFrame(drawHubungSingkat);}
}

_TTL_DAFTAR.push(['cvPerUnit',()=>drawPerUnit(),'perunit',['sl_pu_s','sl_pu_kv','sl_pu_x','sl_pu_xpu','sl_pu_s0']]);
_TTL_DAFTAR.push(['cvYDelta',()=>drawYDelta(),'ydelta',['sl_yd_a','sl_yd_b','sl_yd_c']]);
_TTL_DAFTAR.push(['cvReduksi',()=>drawReduksi(),'reduksi',['sl_rd_g1','sl_rd_g2','sl_rd_t','sl_rd_l']]);
_TTL_DAFTAR.push(['cvHubungSingkat',()=>drawHubungSingkat(),'hubungsingkat',['sl_hs_x2','sl_hs_x1','sl_hs_xd','sl_hs_t2','sl_hs_t1']]);
_ttlMulai();
