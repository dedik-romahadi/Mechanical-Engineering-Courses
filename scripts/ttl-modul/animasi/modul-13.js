// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 13 TEKNIK TENAGA LISTRIK — Metode Single Line Diagram
// Kanvas: cvSLD, cvPerUnit, cvThevenin, cvJatuhPU
// ════════════════════════════════════════════════════════════
const _SQ3_13=Math.sqrt(3);
function _sumbu13(ctx,padL,padT,plotW,plotH){
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2);
  _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)';
}

// ── ANIMASI 1 — Dari single line diagram ke diagram reaktansi dan arus gangguan tiap rel ──
let _sdFrame=0;
function toggleSLD(){_ttlToggle('sld','btnSLD',drawSLD);}
window.toggleSLD=toggleSLD;
function drawSLD(){
  const k=_ttlKanvas('cvSLD'); if(!k) return; const {ctx,W,H}=k;
  const xg=_ttlNilai('sl_sd_xg',0.18), sg=_ttlNilai('sl_sd_sg',60), xt=_ttlNilai('sl_sd_xt',0.09), st=_ttlNilai('sl_sd_st',75), xl=_ttlNilai('sl_sd_xl',45), bus=Math.round(_ttlNilai('sl_sd_bus',3));
  _ttlTulis('v_sd_xg',xg.toFixed(2)); _ttlTulis('v_sd_sg',sg.toFixed(0)); _ttlTulis('v_sd_xt',xt.toFixed(2)); _ttlTulis('v_sd_st',st.toFixed(0)); _ttlTulis('v_sd_xl',xl.toFixed(0)); _ttlTulis('v_sd_bus',['rel generator (13,8 kV)','rel GI (150 kV)','ujung saluran (150 kV)'][bus-1]);
  const S=100, zb=150*150/S, Xg=xg*S/sg, Xt=xt*S/st, Xl=xl/zb;
  const xth=[Xg,Xg+Xt,Xg+Xt+Xl][bus-1], vb=[13.8,150,150][bus-1], ib=S*1e6/(_SQ3_13*vb*1e3);
  const isc=1/xth, iscA=isc*ib, ssc=S/xth;
  // baris atas: SLD
  const y1=54, xs=[60,200,340,480,620];
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('SINGLE LINE DIAGRAM',W/2,18);
  // generator
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(xs[0],y1,16,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('G',xs[0],y1+4); ctx.fillText(sg+' MVA 13,8 kV X\'\''+xg.toFixed(2),xs[0],y1+34);
  _ttlGaris(ctx,xs[0]+16,y1,xs[1]-4,y1,'rgba(148,163,184,.8)',2);
  // bus 1
  _ttlGaris(ctx,xs[1],y1-16,xs[1],y1+16,bus===1?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('rel 1 · 13,8 kV',xs[1],y1+34);
  // trafo (dua lingkaran)
  const xtr=(xs[1]+xs[2])/2; _ttlGaris(ctx,xs[1],y1,xtr-14,y1,'rgba(148,163,184,.8)',2); ctx.strokeStyle='rgba(168,85,247,.95)'; ctx.beginPath(); ctx.arc(xtr-6,y1,10,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(xtr+6,y1,10,0,Math.PI*2); ctx.stroke(); _ttlGaris(ctx,xtr+16,y1,xs[2],y1,'rgba(148,163,184,.8)',2); ctx.fillStyle='rgba(168,85,247,.95)'; ctx.fillText('T '+st+' MVA 13,8/150 kV X '+xt.toFixed(2),xtr,y1-24);
  // bus 2
  _ttlGaris(ctx,xs[2],y1-16,xs[2],y1+16,bus===2?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('rel 2 · 150 kV',xs[2],y1+34);
  // saluran
  _ttlGaris(ctx,xs[2],y1,xs[4],y1,'rgba(0,229,255,.9)',2); ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('saluran 150 kV  j'+xl+' Ω',(xs[2]+xs[4])/2,y1-24);
  _ttlGaris(ctx,xs[4],y1-16,xs[4],y1+16,bus===3?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('rel 3 · 150 kV',xs[4],y1+34);
  // baris bawah: diagram reaktansi pu
  const y2=170; ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('DIAGRAM REAKTANSI (dasar 100 MVA; 13,8 kV | 150 kV)',W/2,y2-46);
  const kotak=(x,w,label,warna)=>{ctx.strokeStyle=warna; ctx.lineWidth=1.8; ctx.strokeRect(x,y2-12,w,24); ctx.fillStyle=warna; ctx.fillText(label,x+w/2,y2+4);};
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.beginPath(); ctx.arc(xs[0],y2,14,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('E=1∠0',xs[0],y2+4);
  _ttlGaris(ctx,xs[0]+14,y2,xs[0]+40,y2,'rgba(148,163,184,.8)',2); kotak(xs[0]+40,90,'jX_g '+Xg.toFixed(4),'rgba(0,224,158,.95)'); _ttlGaris(ctx,xs[0]+130,y2,xs[1],y2,'rgba(148,163,184,.8)',2);
  _ttlGaris(ctx,xs[1],y2-14,xs[1],y2+14,bus===1?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4);
  _ttlGaris(ctx,xs[1],y2,xs[1]+25,y2,'rgba(148,163,184,.8)',2); kotak(xs[1]+25,90,'jX_t '+Xt.toFixed(4),'rgba(168,85,247,.95)'); _ttlGaris(ctx,xs[1]+115,y2,xs[2],y2,'rgba(148,163,184,.8)',2);
  _ttlGaris(ctx,xs[2],y2-14,xs[2],y2+14,bus===2?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4);
  _ttlGaris(ctx,xs[2],y2,xs[2]+60,y2,'rgba(148,163,184,.8)',2); kotak(xs[2]+60,140,'jX_L '+Xl.toFixed(4)+' ('+xl+'/'+zb+')','rgba(0,229,255,.95)'); _ttlGaris(ctx,xs[2]+200,y2,xs[4],y2,'rgba(148,163,184,.8)',2);
  _ttlGaris(ctx,xs[4],y2-14,xs[4],y2+14,bus===3?'rgba(239,68,68,1)':'rgba(226,232,240,.9)',4);
  // gangguan berkedip di rel terpilih
  const xf=[xs[1],xs[2],xs[4]][bus-1]; const a=0.5+0.5*Math.sin(_sdFrame*0.25);
  ctx.strokeStyle='rgba(239,68,68,'+a.toFixed(2)+')'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(xf-8,y2+18); ctx.lineTo(xf+2,y2+30); ctx.lineTo(xf-4,y2+32); ctx.lineTo(xf+8,y2+46); ctx.stroke();
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('gangguan 3φ: X_th = '+xth.toFixed(4)+' pu → I_sc = '+isc.toFixed(3)+' pu = '+(iscA/1000).toFixed(2)+' kA, S_sc = '+ssc.toFixed(1)+' MVA',W/2,H-14);
  _ttlTulis('sldInfo','Dasar 100 MVA; Z_base 150 kV = '+zb+' Ω, I_base = '+(S*1e6/(_SQ3_13*150e3)).toFixed(1)+' A (150 kV) / '+(S*1e6/(_SQ3_13*13.8e3)).toFixed(0)+' A (13,8 kV)   |   X_g = '+xg.toFixed(2)+'×100/'+sg+' = '+Xg.toFixed(4)+', X_t = '+xt.toFixed(2)+'×100/'+st+' = '+Xt.toFixed(4)+', X_L = '+xl+'/'+zb+' = '+Xl.toFixed(4)+' pu   |   gangguan di '+['rel 1','rel 2','rel 3'][bus-1]+': X_th = '+xth.toFixed(4)+' pu, I_sc = 1/X_th = '+isc.toFixed(4)+' pu × I_base('+vb+' kV) = '+iscA.toFixed(0)+' A, S_sc = 100/X_th = '+ssc.toFixed(2)+' MVA   |   makin jauh dari generator, X_th bertambah dan arus gangguan turun');
  if(_ttlJalan('sld')){_sdFrame++; requestAnimationFrame(drawSLD);}
}

// ── ANIMASI 2 — Sistem per unit: pemilihan dasar dan konversi ──
let _puFrame=0;
function togglePerUnit(){_ttlToggle('perunit','btnPerUnit',drawPerUnit);}
window.togglePerUnit=togglePerUnit;
function drawPerUnit(){
  const k=_ttlKanvas('cvPerUnit'); if(!k) return; const {ctx,W,H}=k;
  const sb=_ttlNilai('sl_pu_sb',100), vb=_ttlNilai('sl_pu_vb',150), zohm=_ttlNilai('sl_pu_z',45), sOwn=_ttlNilai('sl_pu_sown',60), xOwn=_ttlNilai('sl_pu_xown',0.18);
  _ttlTulis('v_pu_sb',sb.toFixed(0)); _ttlTulis('v_pu_vb',vb.toFixed(0)); _ttlTulis('v_pu_z',zohm.toFixed(0)); _ttlTulis('v_pu_sown',sOwn.toFixed(0)); _ttlTulis('v_pu_xown',xOwn.toFixed(2));
  const zb=vb*vb/sb, ib=sb*1e6/(_SQ3_13*vb*1e3), zpu=zohm/zb, xNew=xOwn*sb/sOwn;
  // kiri: empat besaran dasar
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(226,232,240,.95)'; ctx.fillText('BESARAN DASAR (2 dipilih, 2 mengikuti)',20,22);
  const baris=[['S_base (dipilih)',sb.toFixed(0)+' MVA','rgba(255,179,0,.95)'],['V_base (dipilih)',vb.toFixed(0)+' kV','rgba(255,179,0,.95)'],['Z_base = V²/S',zb.toFixed(3)+' Ω','rgba(0,229,255,.95)'],['I_base = S/(√3·V)',ib.toFixed(1)+' A','rgba(0,229,255,.95)']];
  baris.forEach(([n,v,w],i)=>{ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(n,20,48+i*22); ctx.fillStyle=w; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(v,190,48+i*22);});
  ctx.fillStyle='rgba(226,232,240,.95)'; ctx.fillText('KONVERSI',20,150);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('saluran '+zohm+' Ω → '+zohm+'/'+zb.toFixed(1)+' = '+zpu.toFixed(4)+' pu',20,170);
  ctx.fillStyle='rgba(168,85,247,.95)'; ctx.fillText('generator X '+xOwn.toFixed(2)+' pu @ '+sOwn+' MVA → '+xOwn.toFixed(2)+'×'+sb+'/'+sOwn+' = '+xNew.toFixed(4)+' pu',20,188);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('arus 1 pu = '+ib.toFixed(0)+' A; tegangan 1 pu = '+vb+' kV; 1 pu × 1 pu = '+sb+' MVA',20,206);
  // kanan: batang Z_pu saluran terhadap S_base (kurva) — invarian: Z_pu ∝ S_base/V_base²
  const padL=W*0.55,padT=30,padR=20,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  _sumbu13(ctx,padL,padT,plotW,plotH);
  const sMax=500, zMax=zohm/(vb*vb/sMax)*1.1;
  const X=s=>padL+s/sMax*plotW, Y=z=>padT+plotH-z/zMax*plotH;
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const z=zMax*i/4; _ttlGaris(ctx,padL,Y(z),padL+plotW,Y(z),'rgba(148,163,184,.12)',1); ctx.fillText(z.toFixed(2),padL-4,Y(z)+4);}
  ctx.textAlign='center'; for(const s of [0,100,200,300,400,500]) ctx.fillText(s+' MVA',X(s),padT+plotH+16);
  ctx.strokeStyle='rgba(0,224,158,.9)'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(sMax),Y(zohm/(vb*vb/sMax))); ctx.stroke();
  const a=0.5+0.5*Math.sin(_puFrame*0.15); ctx.fillStyle='rgba(255,179,0,'+(0.5+0.5*a).toFixed(2)+')'; ctx.beginPath(); ctx.arc(X(sb),Y(zpu),6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('Z_pu saluran '+zohm+' Ω vs S_base (V_base '+vb+' kV)',padL+6,padT+12);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('S_base '+sb+' → '+zpu.toFixed(4)+' pu',X(sb)+8,Y(zpu)-6);
  _ttlTulis('perUnitInfo','Dasar '+sb+' MVA, '+vb+' kV → Z_base = '+zb.toFixed(3)+' Ω, I_base = '+ib.toFixed(1)+' A   |   saluran '+zohm+' Ω = '+zpu.toFixed(4)+' pu; generator '+xOwn.toFixed(2)+' pu @ '+sOwn+' MVA = '+xNew.toFixed(4)+' pu @ '+sb+' MVA   |   Z_pu ∝ S_base/V_base²: menggandakan S_base menggandakan semua Z_pu, tetapi hasil akhir dalam ampere dan volt tetap sama   |   pilih S_base bulat (100 MVA) dan V_base = tegangan pengenal tiap tingkat agar trafo ideal hilang');
  if(_ttlJalan('perunit')){_puFrame++; requestAnimationFrame(drawPerUnit);}
}

// ── ANIMASI 3 — Reduksi Thevenin: seri, paralel, dan sumbangan tiap sumber ──
let _thFrame=0;
function toggleThevenin(){_ttlToggle('thevenin','btnThevenin',drawThevenin);}
window.toggleThevenin=toggleThevenin;
function drawThevenin(){
  const k=_ttlKanvas('cvThevenin'); if(!k) return; const {ctx,W,H}=k;
  const xa=_ttlNilai('sl_th_xa',0.4), xb=_ttlNilai('sl_th_xb',0.6), xm=_ttlNilai('sl_th_xm',2.0), motor=Math.round(_ttlNilai('sl_th_motor',1)), vb=_ttlNilai('sl_th_vb',20);
  _ttlTulis('v_th_xa',xa.toFixed(2)); _ttlTulis('v_th_xb',xb.toFixed(2)); _ttlTulis('v_th_xm',xm.toFixed(1)); _ttlTulis('v_th_motor',motor?'ya':'tidak'); _ttlTulis('v_th_vb',vb.toFixed(1));
  const S=100, ib=S*1e6/(_SQ3_13*vb*1e3);
  const gab=(...xs)=>1/xs.reduce((s,x)=>s+1/x,0);
  const xth=motor?gab(xa,xb,xm):gab(xa,xb);
  const isc=1/xth, ia=1/xa, ibb=1/xb, im=motor?1/xm:0;
  // gambar rangkaian: tiga cabang paralel ke rel gangguan
  const yb=150, xr=W*0.42; // rel
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  const cabang=[['sumber A (GI)',xa,'rgba(0,224,158,.95)',ia,50],['sumber B (GI tetangga)',xb,'rgba(0,229,255,.95)',ibb,110],['motor besar',xm,'rgba(255,179,0,.95)',im,170]];
  cabang.forEach(([nama,x,w,i,y],idx)=>{const on=idx<2||motor; const col=on?w:'rgba(100,116,139,.4)';
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(40,y,12,0,Math.PI*2); ctx.stroke(); ctx.fillStyle=col; ctx.fillText(idx===2?'M':'E',40,y+4);
    _ttlGaris(ctx,52,y,90,y,col,2); ctx.strokeRect(90,y-10,90,20); ctx.fillText('jX '+x.toFixed(2),135,y+4); _ttlGaris(ctx,180,y,xr,y,col,2);
    ctx.fillText(nama,135,y-16);
    if(on){ // panah arus berjalan
      const p=((_thFrame*2+idx*40)%(xr-180))/(xr-180); const px=180+p*(xr-180); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(px+6,y); ctx.lineTo(px-4,y-5); ctx.lineTo(px-4,y+5); ctx.closePath(); ctx.fill(); ctx.textAlign='left'; ctx.fillText(i.toFixed(3)+' pu',xr-70,y-6); ctx.textAlign='center';}
  });
  _ttlGaris(ctx,xr,30,xr,190,'rgba(226,232,240,.95)',4);
  const a=0.5+0.5*Math.sin(_thFrame*0.25); ctx.strokeStyle='rgba(239,68,68,'+a.toFixed(2)+')'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(xr+10,yb-20); ctx.lineTo(xr+22,yb-6); ctx.lineTo(xr+14,yb-4); ctx.lineTo(xr+28,yb+12); ctx.stroke();
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.textAlign='left'; ctx.fillText('gangguan 3φ di rel '+vb+' kV',xr+34,yb+4);
  // kanan: batang sumbangan
  const padL=W*0.62,padT=30,plotW=W-padL-20,plotH=H-padT-40;
  const items=[['A',ia,'rgba(0,224,158,.95)'],['B',ibb,'rgba(0,229,255,.95)'],['M',im,'rgba(255,179,0,.95)'],['total',isc,'rgba(239,68,68,.95)']];
  const vmax=isc*1.15, bw=plotW/items.length;
  items.forEach(([n,v,w],i)=>{const h=v/vmax*plotH; ctx.fillStyle=w; ctx.fillRect(padL+i*bw+bw*0.2,padT+plotH-h,bw*0.6,h); ctx.fillStyle='rgba(226,232,240,.95)'; ctx.textAlign='center'; ctx.fillText(n,padL+i*bw+bw*0.5,padT+plotH+14); ctx.fillStyle=w; ctx.fillText(v.toFixed(2)+' pu',padL+i*bw+bw*0.5,padT+plotH-h-5); ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText((v*ib/1000).toFixed(2)+' kA',padL+i*bw+bw*0.5,padT+plotH+26); ctx.font="600 10px 'JetBrains Mono',monospace";});
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='left'; ctx.fillText('sumbangan arus gangguan (pu, dasar 100 MVA)',padL,padT-8);
  _ttlTulis('theveninInfo','Rel '+vb+' kV: I_base = '+ib.toFixed(1)+' A   |   X_th = ('+xa.toFixed(2)+' ∥ '+xb.toFixed(2)+(motor?' ∥ '+xm.toFixed(1):'')+') = '+xth.toFixed(4)+' pu → I_sc = '+isc.toFixed(3)+' pu = '+(isc*ib/1000).toFixed(2)+' kA, S_sc = '+(S/xth).toFixed(1)+' MVA   |   tiap cabang menyumbang 1/X-nya: A '+ia.toFixed(3)+', B '+ibb.toFixed(3)+(motor?', motor '+im.toFixed(3)+' (berlangsung beberapa siklus, ikut menentukan kapasitas PMT)':'')+'   |   PMT harus mampu memutus ≥ '+(isc*ib/1000*1.1).toFixed(1)+' kA (dengan cadangan 10 %)');
  if(_ttlJalan('thevenin')){_thFrame++; requestAnimationFrame(drawThevenin);}
}

// ── ANIMASI 4 — Jatuh tegangan dan fasor dalam per unit ──
let _jpFrame=0;
function toggleJatuhPU(){_ttlToggle('jatuhpu','btnJatuhPU',drawJatuhPU);}
window.toggleJatuhPU=toggleJatuhPU;
function drawJatuhPU(){
  const k=_ttlKanvas('cvJatuhPU'); if(!k) return; const {ctx,W,H}=k;
  const I=_ttlNilai('sl_jp_i',0.8), pf=_ttlNilai('sl_jp_pf',0.85), R=_ttlNilai('sl_jp_r',0.05), X=_ttlNilai('sl_jp_x',0.2), lead=Math.round(_ttlNilai('sl_jp_lead',0));
  _ttlTulis('v_jp_i',I.toFixed(2)); _ttlTulis('v_jp_pf',pf.toFixed(2)); _ttlTulis('v_jp_r',R.toFixed(3)); _ttlTulis('v_jp_x',X.toFixed(2)); _ttlTulis('v_jp_lead',lead?'mendahului':'tertinggal');
  // V_r = 1∠0 acuan; I = I∠∓φ; V_s = V_r + I(R+jX)
  const phi=Math.acos(pf)*(lead?1:-1);
  const Ir=I*Math.cos(phi), Ii=I*Math.sin(phi);
  const dVr=Ir*R-Ii*X, dVi=Ir*X+Ii*R;
  const Vs=Math.hypot(1+dVr,dVi), dlt=Math.atan2(dVi,1+dVr)*180/Math.PI;
  const reg=(Vs-1)*100;
  // fasor kiri
  const ox=W*0.28, oy=H*0.62, sk=Math.min(W*0.22,H*0.5)/Math.max(1.05,Vs);
  const vek=(x,y,w,label,dx,dy)=>{ctx.strokeStyle=w; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+x*sk,oy-y*sk); ctx.stroke(); const ang=Math.atan2(-y,x); ctx.fillStyle=w; ctx.beginPath(); ctx.moveTo(ox+x*sk,oy-y*sk); ctx.lineTo(ox+x*sk-9*Math.cos(ang-0.4),oy-y*sk-9*Math.sin(ang-0.4)); ctx.lineTo(ox+x*sk-9*Math.cos(ang+0.4),oy-y*sk-9*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill(); ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText(label,ox+x*sk+dx,oy-y*sk+dy);};
  _ttlGaris(ctx,ox-20,oy,ox+sk*1.3,oy,'rgba(148,163,184,.3)',1); _ttlGaris(ctx,ox,oy+20,ox,oy-sk*0.7,'rgba(148,163,184,.3)',1);
  vek(1,0,'rgba(0,224,158,.95)','V_r = 1∠0',6,-6);
  const a=0.5+0.5*Math.sin(_jpFrame*0.1);
  vek(Ir*0.9,Ii*0.9,'rgba(255,179,0,.95)','I = '+I.toFixed(2)+'∠'+(phi*180/Math.PI).toFixed(1)+'°',6,12);
  // IR dan IX
  ctx.strokeStyle='rgba(239,68,68,.8)'; ctx.lineWidth=1.6; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(ox+1*sk,oy); ctx.lineTo(ox+(1+Ir*R)*sk,oy-(Ir*X)*sk*0+0); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle='rgba(239,68,68,.8)'; ctx.beginPath(); ctx.moveTo(ox+1*sk,oy); ctx.lineTo(ox+(1+Ir*R-Ii*X)*sk,oy-(Ir*X+Ii*R)*sk); ctx.stroke();
  vek(1+dVr,dVi,'rgba(0,229,255,'+(0.7+0.3*a).toFixed(2)+')','V_s = '+Vs.toFixed(4)+'∠'+dlt.toFixed(2)+'°',6,-8);
  ctx.fillStyle='rgba(239,68,68,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('I·Z = '+Math.hypot(dVr,dVi).toFixed(4)+' pu',ox+(1+dVr/2)*sk+6,oy-(dVi/2)*sk-4);
  // kanan: kurva V_s terhadap pf (tertinggal → mendahului)
  const padL=W*0.6,padT=26,plotW=W-padL-20,plotH=H-padT-40;
  _sumbu13(ctx,padL,padT,plotW,plotH);
  const vmin=0.9,vmax=1.2; const Xp=p=>padL+(p+1)/2*plotW, Yv=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  ctx.textAlign='right'; for(const v of [0.9,1.0,1.1,1.2]){_ttlGaris(ctx,padL,Yv(v),padL+plotW,Yv(v),v===1?'rgba(226,232,240,.4)':'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(2),padL-4,Yv(v)+4);}
  ctx.textAlign='center'; ctx.fillText('pf 0 tertinggal',Xp(-1),padT+plotH+14); ctx.fillText('pf 1',Xp(0),padT+plotH+14); ctx.fillText('pf 0 mendahului',Xp(1),padT+plotH+14);
  ctx.strokeStyle='rgba(0,229,255,.9)'; ctx.lineWidth=2; ctx.beginPath(); for(let i=0;i<=100;i++){const p=-1+2*i/100; const ph=Math.acos(Math.min(1,Math.abs(1-Math.abs(p))))*(p>0?1:-1); const ir=I*Math.cos(ph), ii=I*Math.sin(ph); const vs=Math.hypot(1+ir*R-ii*X,ir*X+ii*R); const yy=Yv(Math.max(vmin,Math.min(vmax,vs))); i?ctx.lineTo(Xp(p),yy):ctx.moveTo(Xp(p),yy);} ctx.stroke();
  const pNow=lead?(1-pf):-(1-pf); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(Xp(pNow),Yv(Math.max(vmin,Math.min(vmax,Vs))),5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('|V_s| yang diperlukan agar V_r = 1 pu, terhadap pf',padL+4,padT+12);
  _ttlTulis('jatuhPUInfo','Beban I = '+I.toFixed(2)+' pu pf '+pf.toFixed(2)+' '+(lead?'mendahului':'tertinggal')+' pada V_r = 1∠0; saluran '+R.toFixed(3)+' + j'+X.toFixed(2)+' pu   |   I·Z = ('+dVr.toFixed(4)+') + j('+dVi.toFixed(4)+') pu → V_s = '+Vs.toFixed(4)+'∠'+dlt.toFixed(2)+'° pu; regulasi = '+reg.toFixed(2)+' %   |   pendekatan |ΔV| ≈ I(R cos φ + X sin φ) = '+(I*(R*pf+X*Math.sqrt(1-pf*pf))*(lead?-1:1)+0).toFixed(4)+' pu (Modul 6/10 dalam bentuk pu)   |   pf mendahului (kapasitif) menaikkan V_r di atas V_s: efek Ferranti versi beban');
  if(_ttlJalan('jatuhpu')){_jpFrame++; requestAnimationFrame(drawJatuhPU);}
}

_TTL_DAFTAR.push(['cvSLD',()=>drawSLD(),'sld',['sl_sd_xg','sl_sd_sg','sl_sd_xt','sl_sd_st','sl_sd_xl','sl_sd_bus']]);
_TTL_DAFTAR.push(['cvPerUnit',()=>drawPerUnit(),'perunit',['sl_pu_sb','sl_pu_vb','sl_pu_z','sl_pu_sown','sl_pu_xown']]);
_TTL_DAFTAR.push(['cvThevenin',()=>drawThevenin(),'thevenin',['sl_th_xa','sl_th_xb','sl_th_xm','sl_th_motor','sl_th_vb']]);
_TTL_DAFTAR.push(['cvJatuhPU',()=>drawJatuhPU(),'jatuhpu',['sl_jp_i','sl_jp_pf','sl_jp_r','sl_jp_x','sl_jp_lead']]);
_ttlMulai();
