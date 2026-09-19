// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 12 TEKNIK TENAGA LISTRIK — Aliran Daya, Peralatan, dan Pengembangan Sistem Distribusi
// Kanvas: cvAliranDaya, cvHubungSingkat, cvKoordinasi, cvPeramalan
// ════════════════════════════════════════════════════════════
const _SQ3_12=Math.sqrt(3);
function _sumbu12(ctx,padL,padT,plotW,plotH){
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2);
  _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)';
}

// ── ANIMASI 1 — Aliran daya penyulang radial: backward/forward sweep ──
let _adFrame=0;
function toggleAliranDaya(){_ttlToggle('alirandaya','btnAliranDaya',drawAliranDaya);}
window.toggleAliranDaya=toggleAliranDaya;
function drawAliranDaya(){
  const k=_ttlKanvas('cvAliranDaya'); if(!k) return; const {ctx,W,H}=k;
  const nBus=Math.round(_ttlNilai('sl_ad_bus',5)), pBus=_ttlNilai('sl_ad_p',0.8), pf=_ttlNilai('sl_ad_pf',0.85), Lr=_ttlNilai('sl_ad_l',2), iter=Math.round(_ttlNilai('sl_ad_iter',3));
  _ttlTulis('v_ad_bus',nBus.toFixed(0)); _ttlTulis('v_ad_p',pBus.toFixed(2)); _ttlTulis('v_ad_pf',pf.toFixed(2)); _ttlTulis('v_ad_l',Lr.toFixed(1)); _ttlTulis('v_ad_iter',iter.toFixed(0));
  const r=0.4*Lr, x=0.35*Lr, V1=20.0, Q=pBus*Math.tan(Math.acos(pf));
  // backward/forward sweep (MW, MVAR, kV, Ω)
  let V=Array(nBus+1).fill(V1); let Pflow=[],Qflow=[],rugi=[];
  for(let it=0;it<iter;it++){
    Pflow=Array(nBus+1).fill(0); Qflow=Array(nBus+1).fill(0); rugi=Array(nBus+1).fill(0);
    for(let b=nBus;b>=1;b--){ // backward: aliran masuk bus b = beban b + aliran ke bus b+1 + rugi ruas b→b+1
      const Pd=pBus+(b<nBus?Pflow[b+1]:0), Qd=Q+(b<nBus?Qflow[b+1]:0);
      const pl=(Pd*Pd+Qd*Qd)/(V[b]*V[b])*r, ql=(Pd*Pd+Qd*Qd)/(V[b]*V[b])*x;
      Pflow[b]=Pd+pl; Qflow[b]=Qd+ql; rugi[b]=pl;
    }
    for(let b=1;b<=nBus;b++){ V[b]=V[b-1]-(Pflow[b]*r+Qflow[b]*x)/V[b-1]; } // forward
  }
  const totRugi=rugi.reduce((a,c)=>a+c,0), Psrc=Pflow[1], Qsrc=Qflow[1];
  const padL=60,padR=30,padT=22,padB=70,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=Math.min(0.85,Math.floor(V[nBus]/V1*20)/20), vmax=1.01;
  const X=b=>padL+b/nBus*plotW, Y=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  _sumbu12(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=vmin+(vmax-vmin)*i/4; _ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText((v*20).toFixed(1)+' kV',padL-4,Y(v)+4);}
  _ttlGaris(ctx,padL,Y(0.95),padL+plotW,Y(0.95),'rgba(239,68,68,.6)',1,[4,4]);
  // profil tegangan
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.6; ctx.beginPath(); for(let b=0;b<=nBus;b++){const yy=Y(Math.max(vmin,V[b]/V1)); b?ctx.lineTo(X(b),yy):ctx.moveTo(X(b),yy);} ctx.stroke();
  for(let b=0;b<=nBus;b++){ctx.fillStyle=b?'rgba(0,224,158,.95)':'rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(X(b),Y(Math.max(vmin,V[b]/V1)),5,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='center'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText(b?'bus '+b:'GI',X(b),padT+plotH+14); ctx.fillText(b?V[b].toFixed(2)+' kV':V1.toFixed(1)+' kV',X(b),padT+plotH+26);}
  // panah aliran (backward sweep berjalan dari ujung ke pangkal, forward sebaliknya)
  const fase=(_adFrame%200)/200; const arah=fase<0.5; const pos=arah?1-fase*2:(fase-0.5)*2; const xb=padL+pos*plotW;
  const a=0.5+0.5*Math.sin(_adFrame*0.2); ctx.fillStyle=arah?'rgba(255,179,0,'+a.toFixed(2)+')':'rgba(0,229,255,'+a.toFixed(2)+')'; ctx.beginPath(); ctx.moveTo(xb+(arah?8:-8),padT+10); ctx.lineTo(xb-(arah?6:-6),padT+4); ctx.lineTo(xb-(arah?6:-6),padT+16); ctx.closePath(); ctx.fill();
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle=arah?'rgba(255,179,0,.95)':'rgba(0,229,255,.95)'; ctx.fillText(arah?'backward sweep: jumlahkan arus/daya + rugi dari ujung ke GI':'forward sweep: hitung tegangan bus dari GI ke ujung',padL+6,padT+14);
  // rugi tiap ruas di bawah
  for(let b=1;b<=nBus;b++){ctx.fillStyle='rgba(239,68,68,.85)'; ctx.textAlign='center'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText('ruas '+(b)+': '+Pflow[b].toFixed(2)+' MW, rugi '+(rugi[b]*1000).toFixed(0)+' kW',(X(b-1)+X(b))/2,padT+plotH+44);}
  _ttlTulis('aliranDayaInfo',nBus+' bus × '+pBus.toFixed(2)+' MW pf '+pf.toFixed(2)+' (Q '+Q.toFixed(3)+' MVAR/bus), ruas '+Lr.toFixed(1)+' km (r '+r.toFixed(2)+', x '+x.toFixed(2)+' Ω), '+iter+' iterasi   |   GI memasok '+Psrc.toFixed(3)+' MW + j'+Qsrc.toFixed(3)+' MVAR; beban total '+(nBus*pBus).toFixed(2)+' MW; rugi total '+(totRugi*1000).toFixed(1)+' kW ('+(totRugi/Psrc*100).toFixed(2)+' %)   |   tegangan ujung '+V[nBus].toFixed(3)+' kV ('+((1-V[nBus]/V1)*100).toFixed(2)+' %)'+(V[nBus]/V1<0.95?' ⚠ di bawah 19 kV':'')+'   |   iterasi 1 memakai V nominal untuk rugi; iterasi berikutnya mengoreksi dengan tegangan sebenarnya');
  if(_ttlJalan('alirandaya')){_adFrame++; requestAnimationFrame(drawAliranDaya);}
}

// ── ANIMASI 2 — Arus hubung singkat sepanjang penyulang dan jangkauan pengaman ──
let _hsFrame=0;
function toggleHubungSingkat(){_ttlToggle('hubungsingkat','btnHubungSingkat',drawHubungSingkat);}
window.toggleHubungSingkat=toggleHubungSingkat;
function drawHubungSingkat(){
  const k=_ttlKanvas('cvHubungSingkat'); if(!k) return; const {ctx,W,H}=k;
  const ssc=_ttlNilai('sl_hs_ssc',300), L=_ttlNilai('sl_hs_l',15), rn=_ttlNilai('sl_hs_rn',40), pickup=_ttlNilai('sl_hs_pick',600);
  _ttlTulis('v_hs_ssc',ssc.toFixed(0)); _ttlTulis('v_hs_l',L.toFixed(0)); _ttlTulis('v_hs_rn',rn.toFixed(0)); _ttlTulis('v_hs_pick',pickup.toFixed(0));
  const Vf=20000/_SQ3_12, xs=400/ssc, r=0.4, x=0.35, x0=3*x, r0=3*r;
  const seg=60;
  const i3=[],i1=[];
  for(let s=0;s<=seg;s++){const d=L*s/seg; const R=r*d, X=xs+x*d; i3.push(Vf/Math.hypot(R,X));
    // gangguan 1 fasa-tanah: 3Vf/|Z1+Z2+Z0+3Rn|, Z0 saluran ≈ 3× (pendekatan), Z0 sumber ≈ Xs
    const R1=r*d, X1=xs+x*d, R0=r0*d, X0=xs+x0*d; i1.push(3*Vf/Math.hypot(2*R1+R0+3*rn,2*X1+X0));}
  const imax=Math.max(i3[0],i1[0]);
  const padL=64,padR=20,padT=22,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const X=s=>padL+s/seg*plotW, Y=v=>padT+plotH-v/imax*plotH;
  _sumbu12(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=imax*i/4; _ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(0)+' A',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let i=0;i<=5;i++) ctx.fillText((L*i/5).toFixed(0)+' km',X(seg*i/5),padT+plotH+16);
  const kurva=(arr,warna)=>{ctx.strokeStyle=warna; ctx.lineWidth=2.4; ctx.beginPath(); arr.forEach((v,i)=>{i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v));}); ctx.stroke();};
  kurva(i3,'rgba(239,68,68,.95)'); kurva(i1,'rgba(0,229,255,.95)');
  // pickup relai & jangkauan
  _ttlGaris(ctx,padL,Y(Math.min(pickup,imax)),padL+plotW,Y(Math.min(pickup,imax)),'rgba(255,179,0,.9)',1.6,[6,4]);
  let jangkau3=L, jangkau1=L; for(let s=0;s<=seg;s++){if(i3[s]<pickup){jangkau3=L*s/seg;break;}} for(let s=0;s<=seg;s++){if(i1[s]<pickup){jangkau1=L*s/seg;break;}}
  // titik gangguan berjalan
  const pos=(_hsFrame*0.4)%(seg+1); const si=Math.floor(pos);
  const a=0.5+0.5*Math.sin(_hsFrame*0.3); ctx.strokeStyle='rgba(255,255,255,'+a.toFixed(2)+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(X(si)-6,Y(i3[si])-12); ctx.lineTo(X(si)+2,Y(i3[si])-2); ctx.lineTo(X(si)-3,Y(i3[si])); ctx.lineTo(X(si)+6,Y(i3[si])+10); ctx.stroke();
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('3 fasa: '+i3[0].toFixed(0)+' A di GI → '+i3[seg].toFixed(0)+' A di ujung',padL+6,padT+12);
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('1 fasa-tanah (NGR '+rn+' Ω): '+i1[0].toFixed(0)+' → '+i1[seg].toFixed(0)+' A',padL+6,padT+26);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('pickup relai '+pickup+' A: jangkauan 3 fasa '+jangkau3.toFixed(1)+' km, 1 fasa-tanah '+jangkau1.toFixed(1)+' km',padL+6,padT+40);
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillText('gangguan di '+(L*si/seg).toFixed(1)+' km: I_3φ = '+i3[si].toFixed(0)+' A, I_1φ = '+i1[si].toFixed(0)+' A',padL+6,padT+54);
  _ttlTulis('hubungSingkatInfo','S_sc '+ssc+' MVA → X_s = '+xs.toFixed(3)+' Ω; penyulang '+L+' km (0,4 + j0,35 Ω/km; Z₀ ≈ 3Z₁); NGR '+rn+' Ω   |   I_sc 3 fasa: GI '+i3[0].toFixed(0)+' A, ujung '+i3[seg].toFixed(0)+' A (turun karena impedansi saluran bertambah)   |   I_sc 1 fasa-tanah dibatasi 3R_n: ujung '+i1[seg].toFixed(0)+' A   |   relai arus lebih fasa dengan pickup '+pickup+' A hanya "melihat" gangguan 3 fasa sampai '+jangkau3.toFixed(1)+' km → gangguan di luar jangkauan perlu relai tanah/recloser hilir atau pickup lebih rendah (tetapi > 1,2–1,5 × beban maks)');
  if(_ttlJalan('hubungsingkat')){_hsFrame++; requestAnimationFrame(drawHubungSingkat);}
}

// ── ANIMASI 3 — Koordinasi relai IDMT, recloser, dan fuse (kurva waktu–arus) ──
let _kdFrame12=0;
function toggleKoordinasi(){_ttlToggle('koordinasi','btnKoordinasi',drawKoordinasi);}
window.toggleKoordinasi=toggleKoordinasi;
function drawKoordinasi(){
  const k=_ttlKanvas('cvKoordinasi'); if(!k) return; const {ctx,W,H}=k;
  const isA=_ttlNilai('sl_ko_isa',600), tmsA=_ttlNilai('sl_ko_tmsa',0.3), isB=_ttlNilai('sl_ko_isb',300), tmsB=_ttlNilai('sl_ko_tmsb',0.1), If=_ttlNilai('sl_ko_if',2500);
  _ttlTulis('v_ko_isa',isA.toFixed(0)); _ttlTulis('v_ko_tmsa',tmsA.toFixed(2)); _ttlTulis('v_ko_isb',isB.toFixed(0)); _ttlTulis('v_ko_tmsb',tmsB.toFixed(2)); _ttlTulis('v_ko_if',If.toFixed(0));
  const idmt=(i,is,tms)=>i<=is?Infinity:tms*0.14/(Math.pow(i/is,0.02)-1);
  const fuse=(i)=>Math.max(0.01,3.0e5/(i*i)); // fuse 100 A: I²t lebur ≈ 3e5 A²s (kurva waktu-arus sederhana)
  const padL=64,padR=20,padT=22,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const imin=100,imax=10000,tmin=0.01,tmax=100;
  const X=i=>padL+Math.log10(i/imin)/Math.log10(imax/imin)*plotW, Y=t=>padT+plotH-Math.log10(Math.min(tmax,Math.max(tmin,t))/tmin)/Math.log10(tmax/tmin)*plotH;
  _sumbu12(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(const t of [0.01,0.1,1,10,100]){_ttlGaris(ctx,padL,Y(t),padL+plotW,Y(t),'rgba(148,163,184,.12)',1); ctx.fillText(t+' s',padL-4,Y(t)+4);}
  ctx.textAlign='center'; for(const i of [100,200,500,1000,2000,5000,10000]){_ttlGaris(ctx,X(i),padT,X(i),padT+plotH,'rgba(148,163,184,.08)',1); ctx.fillText(i+' A',X(i),padT+plotH+16);}
  const kurva=(f,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.beginPath(); let first=true; for(let p=0;p<=200;p++){const i=imin*Math.pow(imax/imin,p/200); const t=f(i); if(!isFinite(t)||t>tmax){first=true;continue;} const yy=Y(t); first?ctx.moveTo(X(i),yy):ctx.lineTo(X(i),yy); first=false;} ctx.stroke();};
  kurva(i=>idmt(i,isA,tmsA),'rgba(239,68,68,.95)',2.4); kurva(i=>idmt(i,isB,tmsB),'rgba(0,224,158,.95)',2.4); kurva(fuse,'rgba(255,179,0,.9)',1.8);
  // titik arus gangguan
  const tA=idmt(If,isA,tmsA), tB=idmt(If,isB,tmsB), tF=fuse(If);
  const a=0.5+0.5*Math.sin(_kdFrame12*0.15); _ttlGaris(ctx,X(If),padT,X(If),padT+plotH,'rgba(255,255,255,'+(0.3+0.4*a).toFixed(2)+')',1.4,[4,3]);
  [[tA,'rgba(239,68,68,.95)'],[tB,'rgba(0,224,158,.95)'],[tF,'rgba(255,179,0,.95)']].forEach(([t,w])=>{if(isFinite(t)&&t<=tmax){ctx.fillStyle=w; ctx.beginPath(); ctx.arc(X(If),Y(t),5,0,Math.PI*2); ctx.fill();}});
  const margin=isFinite(tA)&&isFinite(tB)?tA-tB:NaN;
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('relai hulu A: I_s '+isA+' A, TMS '+tmsA.toFixed(2)+' → t('+If+' A) = '+(isFinite(tA)?tA.toFixed(3)+' s':'tidak pickup'),padL+6,padT+12);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('relai hilir B: I_s '+isB+' A, TMS '+tmsB.toFixed(2)+' → t = '+(isFinite(tB)?tB.toFixed(3)+' s':'tidak pickup'),padL+6,padT+26);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('fuse 100 A cabang: t_lebur('+If+' A) = '+tF.toFixed(3)+' s',padL+6,padT+40);
  ctx.fillStyle=isFinite(margin)&&margin>=0.3?'rgba(0,224,158,.95)':'rgba(239,68,68,.95)'; ctx.fillText('selang A − B = '+(isFinite(margin)?margin.toFixed(3)+' s':'—')+(isFinite(margin)&&margin>=0.3?' ✓ ≥ 0,3 s':' ✗ perlu ≥ 0,3 s'),padL+6,padT+54);
  _ttlTulis('koordinasiInfo','Kurva standard inverse t = TMS·0,14/((I/I_s)^0,02 − 1); fuse cabang 100 A (I²t ≈ 3×10⁵ A²s)   |   pada I_f = '+If+' A: fuse '+tF.toFixed(3)+' s → relai B '+(isFinite(tB)?tB.toFixed(3):'∞')+' s → relai A '+(isFinite(tA)?tA.toFixed(3):'∞')+' s   |   syarat: fuse < B < A dengan selang ≥ 0,3–0,4 s (waktu PMT + kesalahan relai + margin) → '+(isFinite(margin)&&margin>=0.3?'terkoordinasi':'BELUM terkoordinasi: naikkan TMS A atau turunkan TMS B')+'   |   I_s dipilih 1,2–1,5 × beban maksimum dan < I_sc minimum di ujung zona');
  if(_ttlJalan('koordinasi')){_kdFrame12++; requestAnimationFrame(drawKoordinasi);}
}

// ── ANIMASI 4 — Peramalan beban dan pengembangan kapasitas ──
let _prFrame=0;
function togglePeramalan(){_ttlToggle('peramalan','btnPeramalan',drawPeramalan);}
window.togglePeramalan=togglePeramalan;
function drawPeramalan(){
  const k=_ttlKanvas('cvPeramalan'); if(!k) return; const {ctx,W,H}=k;
  const s0=_ttlNilai('sl_pr_s0',4), g=_ttlNilai('sl_pr_g',6)/100, cap=_ttlNilai('sl_pr_cap',8), tahap=_ttlNilai('sl_pr_tahap',4), batas=_ttlNilai('sl_pr_batas',80)/100;
  _ttlTulis('v_pr_s0',s0.toFixed(1)); _ttlTulis('v_pr_g',(g*100).toFixed(0)); _ttlTulis('v_pr_cap',cap.toFixed(0)); _ttlTulis('v_pr_tahap',tahap.toFixed(0)); _ttlTulis('v_pr_batas',(batas*100).toFixed(0));
  const nTahun=20;
  const beban=[]; for(let n=0;n<=nTahun;n++) beban.push(s0*Math.pow(1+g,n));
  // kapasitas bertahap: mulai cap, setiap kali beban > batas×kapasitas, tambah 'tahap' MVA
  const kapasitas=[]; let capNow=cap, penambahan=[]; for(let n=0;n<=nTahun;n++){ if(beban[n]>batas*capNow){capNow+=tahap; penambahan.push(n);} kapasitas.push(capNow);}
  const nJenuh=Math.log(batas*cap/s0)/Math.log(1+g);
  const ymax=Math.max(capNow,beban[nTahun])*1.1;
  const padL=60,padR=30,padT=22,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const X=n=>padL+n/nTahun*plotW, Y=v=>padT+plotH-v/ymax*plotH;
  _sumbu12(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=ymax*i/4; _ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(1)+' MVA',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let n=0;n<=nTahun;n+=4) ctx.fillText('th '+n,X(n),padT+plotH+16);
  // kapasitas tangga
  ctx.strokeStyle='rgba(0,229,255,.9)'; ctx.lineWidth=2; ctx.beginPath(); for(let n=0;n<=nTahun;n++){const yy=Y(kapasitas[n]); if(n===0) ctx.moveTo(X(0),yy); else {ctx.lineTo(X(n),Y(kapasitas[n-1])); ctx.lineTo(X(n),yy);} } ctx.stroke();
  ctx.strokeStyle='rgba(0,229,255,.4)'; ctx.setLineDash([3,3]); ctx.beginPath(); for(let n=0;n<=nTahun;n++){const yy=Y(batas*kapasitas[n]); if(n===0) ctx.moveTo(X(0),yy); else {ctx.lineTo(X(n),Y(batas*kapasitas[n-1])); ctx.lineTo(X(n),yy);}} ctx.stroke(); ctx.setLineDash([]);
  // beban (tumbuh dengan animasi)
  const grow=Math.min(nTahun,(_prFrame*0.06)%(nTahun+6));
  ctx.strokeStyle='rgba(239,68,68,.95)'; ctx.lineWidth=2.6; ctx.beginPath(); for(let n=0;n<=nTahun;n++){if(n>grow) break; const yy=Y(beban[n]); n?ctx.lineTo(X(n),yy):ctx.moveTo(X(n),yy);} ctx.stroke();
  penambahan.forEach(n=>{if(n<=grow){ctx.fillStyle='rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(X(n),Y(kapasitas[n]),5,0,Math.PI*2); ctx.fill(); ctx.textAlign='center'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText('+'+tahap+' MVA',X(n),Y(kapasitas[n])-9);}});
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('beban: '+s0.toFixed(1)+' MVA × (1 + '+(g*100).toFixed(0)+' %)ⁿ → th 10: '+beban[10].toFixed(2)+', th 20: '+beban[20].toFixed(2)+' MVA',padL+6,padT+12);
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('kapasitas (tangga) dan batas '+(batas*100).toFixed(0)+' % (putus); pengembangan pada th '+(penambahan.length?penambahan.join(', '):'—'),padL+6,padT+26);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('tahun jenuh pertama n = ln('+(batas*cap).toFixed(1)+'/'+s0.toFixed(1)+')/ln(1,'+(g*100).toFixed(0).padStart(2,'0')+') = '+(nJenuh>0?nJenuh.toFixed(2):'sudah terlampaui'),padL+6,padT+40);
  _ttlTulis('peramalanInfo','S₀ = '+s0.toFixed(1)+' MVA, g = '+(g*100).toFixed(0)+' %/tahun (waktu ganda ≈ '+(Math.log(2)/Math.log(1+g)).toFixed(1)+' tahun), kapasitas awal '+cap+' MVA, batas '+(batas*100).toFixed(0)+' %, tiap tahap +'+tahap+' MVA   |   beban th 5: '+beban[5].toFixed(2)+', th 10: '+beban[10].toFixed(2)+', th 20: '+beban[20].toFixed(2)+' MVA   |   pengembangan diperlukan '+penambahan.length+' kali dalam 20 tahun (tahun '+(penambahan.length?penambahan.join(', '):'—')+'); kapasitas akhir '+capNow+' MVA   |   tahap kecil dan sering menghemat modal awal tetapi menambah biaya proyek; tahap besar sebaliknya (economy of scale vs modal menganggur)');
  if(_ttlJalan('peramalan')){_prFrame++; requestAnimationFrame(drawPeramalan);}
}

_TTL_DAFTAR.push(['cvAliranDaya',()=>drawAliranDaya(),'alirandaya',['sl_ad_bus','sl_ad_p','sl_ad_pf','sl_ad_l','sl_ad_iter']]);
_TTL_DAFTAR.push(['cvHubungSingkat',()=>drawHubungSingkat(),'hubungsingkat',['sl_hs_ssc','sl_hs_l','sl_hs_rn','sl_hs_pick']]);
_TTL_DAFTAR.push(['cvKoordinasi',()=>drawKoordinasi(),'koordinasi',['sl_ko_isa','sl_ko_tmsa','sl_ko_isb','sl_ko_tmsb','sl_ko_if']]);
_TTL_DAFTAR.push(['cvPeramalan',()=>drawPeramalan(),'peramalan',['sl_pr_s0','sl_pr_g','sl_pr_cap','sl_pr_tahap','sl_pr_batas']]);
_ttlMulai();
