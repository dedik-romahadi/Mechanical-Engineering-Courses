// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 2 TEKNIK TENAGA LISTRIK — Komponen Sistem Tenaga Listrik
// Kanvas: cvRasio, cvEfisiensi, cvHubungSingkat, cvParalel
// ════════════════════════════════════════════════════════════
const _TTL_PMT=[8,12.5,16,20,25,31.5,40,50];

// ── ANIMASI 1 — Rasio belitan transformator ──
let _rsFrame=0;
function toggleRasio(){_ttlToggle('rasio','btnRasio',drawRasio);}
window.toggleRasio=toggleRasio;
function drawRasio(){
  const k=_ttlKanvas('cvRasio'); if(!k) return; const {ctx,W,H}=k;
  const N1=Math.round(_ttlNilai('sl_rs_n1',1000)), N2=Math.round(_ttlNilai('sl_rs_n2',50)), S=_ttlNilai('sl_rs_s',100);
  _ttlTulis('v_rs_n1',String(N1)); _ttlTulis('v_rs_n2',String(N2)); _ttlTulis('v_rs_s',S.toFixed(0));
  const V1=20000, a=N1/N2, V2=V1/a, I1=S*1e3/V1, I2=S*1e3/V2;
  const cx=W/2, top=36, bot=H-40, inti=Math.min(70,W*0.09);
  // inti besi
  ctx.fillStyle='rgba(148,163,184,.18)'; ctx.strokeStyle='rgba(148,163,184,.6)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.roundRect(cx-inti*1.6,top,inti*3.2,bot-top,10); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(cx-inti*0.8,top+34,inti*1.6,bot-top-68,8); ctx.fillStyle='#020812'; ctx.fill(); ctx.stroke();
  // lilitan: jumlah garis sebanding dengan N (dibatasi agar terbaca)
  const gambarLilitan=(x,n,warna,kiri)=>{
    const jumlah=Math.max(3,Math.min(28,Math.round(n/60)));
    const h=bot-top-80, dy=h/jumlah;
    ctx.strokeStyle=warna; ctx.lineWidth=2.2;
    for(let i=0;i<jumlah;i++){
      const y=top+40+i*dy+dy/2;
      ctx.beginPath(); ctx.ellipse(x,y,inti*0.34,dy*0.42,0,kiri?Math.PI/2:-Math.PI/2,kiri?3*Math.PI/2:Math.PI/2); ctx.stroke();
    }
  };
  gambarLilitan(cx-inti*1.2,N1,'rgba(34,211,238,.95)',true);
  gambarLilitan(cx+inti*1.2,N2,'rgba(249,115,22,.95)',false);
  // label
  ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  ctx.fillStyle='rgba(34,211,238,.95)'; ctx.fillText('N₁ = '+N1,cx-inti*1.2,top-14);
  ctx.fillStyle='rgba(249,115,22,.95)'; ctx.fillText('N₂ = '+N2,cx+inti*1.2,top-14);
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.9)';
  ctx.textAlign='right'; ctx.fillText('V₁ = '+(V1/1000).toFixed(1)+' kV',cx-inti*1.75,H/2-8); ctx.fillText('I₁ = '+I1.toFixed(2)+' A',cx-inti*1.75,H/2+10);
  ctx.textAlign='left'; ctx.fillStyle='rgba(249,115,22,.95)'; ctx.fillText('V₂ = '+V2.toFixed(1)+' V',cx+inti*1.75,H/2-8); ctx.fillText('I₂ = '+I2.toFixed(1)+' A',cx+inti*1.75,H/2+10);
  // partikel: laju sebanding arus
  const lajuA=1+I1/50, lajuB=1+I2/500;
  for(let p=0;p<4;p++){
    const f1=((_rsFrame*0.004*lajuA)+p/4)%1, y1=top+40+f1*(bot-top-80);
    ctx.fillStyle='rgba(232,246,255,.85)'; ctx.beginPath(); ctx.arc(cx-inti*1.2-inti*0.34,y1,2.2,0,Math.PI*2); ctx.fill();
    const f2=((_rsFrame*0.004*lajuB)+p/4)%1, y2=top+40+f2*(bot-top-80);
    ctx.beginPath(); ctx.arc(cx+inti*1.2+inti*0.34,y2,2.2+Math.min(3,I2/400),0,Math.PI*2); ctx.fill();
  }
  ctx.textAlign='center'; ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText('fluks bersama Φ di inti',cx,bot+16);
  ctx.textAlign='left';
  _ttlTulis('rasioInfo','a = N₁/N₂ = '+a.toFixed(3)+'   |   V₂ = V₁/a = '+V2.toFixed(2)+' V   |   S = '+S.toFixed(0)+' kVA → I₁ = '+I1.toFixed(3)+' A, I₂ = '+I2.toFixed(2)+' A   |   V₁I₁ = V₂I₂ = '+(V1*I1/1000).toFixed(1)+' kVA');
  if(_ttlJalan('rasio')){_rsFrame++; requestAnimationFrame(drawRasio);}
}

// ── ANIMASI 2 — Kurva efisiensi transformator terhadap beban ──
let _efFrame=0;
function toggleEfisiensi(){_ttlToggle('efisiensi','btnEfisiensi',drawEfisiensi);}
window.toggleEfisiensi=toggleEfisiensi;
function drawEfisiensi(){
  const k=_ttlKanvas('cvEfisiensi'); if(!k) return; const {ctx,W,H}=k;
  const S=630, pFe=_ttlNilai('sl_ef_fe',1.0), pCu=_ttlNilai('sl_ef_cu',6.0), pf=_ttlNilai('sl_ef_pf',0.85);
  _ttlTulis('v_ef_fe',pFe.toFixed(2)); _ttlTulis('v_ef_cu',pCu.toFixed(2)); _ttlTulis('v_ef_pf',pf.toFixed(2));
  const eta=x=>{const out=x*S*pf; return out/(out+pFe+x*x*pCu)*100;};
  const padL=52,padR=18,padT=22,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const xMax=1.25, yMin=94, yMax=100;
  const X=x=>x0+x/xMax*plotW, Y=e=>y0-(Math.max(e,yMin)-yMin)/(yMax-yMin)*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let e=yMin;e<=yMax;e+=1){_ttlGaris(ctx,x0,Y(e),x0+plotW,Y(e),'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.fillText(e+'%',8,Y(e)+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  ctx.textAlign='center'; for(const x of [0.25,0.5,0.75,1,1.25]){ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText((x*100).toFixed(0)+'%',X(x),y0+16);} ctx.textAlign='left';
  ctx.fillStyle='rgba(148,163,184,.7)'; ctx.fillText('beban (% dari '+S+' kVA)',x0+plotW-150,y0+30);
  _ttlGaris(ctx,X(1),padT,X(1),y0,'rgba(239,68,68,.6)',1,[4,4]); ctx.fillStyle='rgba(239,68,68,.9)'; ctx.fillText('beban penuh',X(1)+4,padT+12);
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=300;i++){const x=0.02+(i/300)*(xMax-0.02); i?ctx.lineTo(X(x),Y(eta(x))):ctx.moveTo(X(x),Y(eta(x)));}
  ctx.stroke();
  const xOpt=Math.sqrt(pFe/pCu), eOpt=eta(xOpt);
  if(xOpt<=xMax){
    _ttlGaris(ctx,X(xOpt),padT,X(xOpt),y0,'rgba(236,72,153,.85)',1.5,[3,3]);
    ctx.fillStyle='rgba(236,72,153,.95)'; ctx.fillText('x_opt = √(P_Fe/P_Cu) = '+(xOpt*100).toFixed(1)+'%',Math.min(X(xOpt)+6,x0+plotW-190),padT+28);
    ctx.fillStyle='#ec4899'; ctx.beginPath(); ctx.arc(X(xOpt),Y(eOpt),5,0,Math.PI*2); ctx.fill();
  }
  const xNow=0.02+((_efFrame*0.004)%1)*(xMax-0.02), eNow=eta(xNow);
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(xNow),Y(eNow),4.5,0,Math.PI*2); ctx.fill();
  const rugiCu=xNow*xNow*pCu;
  _ttlTulis('efisiensiInfo','beban '+(xNow*100).toFixed(0)+'%: P_out = '+(xNow*S*pf).toFixed(1)+' kW, rugi inti '+pFe.toFixed(2)+' kW, rugi tembaga '+rugiCu.toFixed(2)+' kW → η = '+eNow.toFixed(3)+'%   |   η maks '+eOpt.toFixed(3)+'% pada '+(xOpt*100).toFixed(1)+'% beban');
  if(_ttlJalan('efisiensi')){_efFrame++; requestAnimationFrame(drawEfisiensi);}
}

// ── ANIMASI 3 — Arus hubung singkat dan pemilihan PMT ──
let _hsFrame=0;
function toggleHubungSingkat(){_ttlToggle('hubungsingkat','btnHubungSingkat',drawHubungSingkat);}
window.toggleHubungSingkat=toggleHubungSingkat;
function drawHubungSingkat(){
  const k=_ttlKanvas('cvHubungSingkat'); if(!k) return; const {ctx,W,H}=k;
  const S=_ttlNilai('sl_hs_s',60), Z=_ttlNilai('sl_hs_z',12), V=_ttlNilai('sl_hs_v',20);
  _ttlTulis('v_hs_s',S.toFixed(0)); _ttlTulis('v_hs_z',Z.toFixed(1)); _ttlTulis('v_hs_v',V.toFixed(0));
  const In=S*1e3/(Math.sqrt(3)*V), Isc=In/(Z/100)/1000;
  const pilih=_TTL_PMT.find(r=>r>=Isc);
  const padL=52,padR=18,padT=26,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const kolom=plotW/(_TTL_PMT.length+1), yMax=Math.max(55,Isc*1.15);
  const Y=v=>y0-v/yMax*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let v=0;v<=yMax;v+=10){_ttlGaris(ctx,x0,Y(v),x0+plotW,Y(v),'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.fillText(v+' kA',6,Y(v)+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  // batang arus hubung singkat (berdenyut)
  const denyut=1+0.05*Math.sin(_hsFrame*0.12);
  const xb=x0+kolom*0.25, wb=kolom*0.5;
  ctx.fillStyle='rgba(239,68,68,.85)'; ctx.fillRect(xb,Y(Isc*denyut),wb,y0-Y(Isc*denyut));
  ctx.fillStyle='#fca5a5'; ctx.textAlign='center'; ctx.fillText('I_sc',xb+wb/2,y0+14); ctx.fillText(Isc.toFixed(2)+' kA',xb+wb/2,Y(Isc)-6);
  // batang rating PMT
  _TTL_PMT.forEach((r,i)=>{
    const x=x0+kolom*(i+1)+kolom*0.25;
    const cukup=r>=Isc, terpilih=r===pilih;
    ctx.fillStyle=terpilih?'rgba(0,224,158,.95)':cukup?'rgba(34,211,238,.45)':'rgba(148,163,184,.25)';
    ctx.fillRect(x,Y(Math.min(r,yMax)),wb,y0-Y(Math.min(r,yMax)));
    ctx.fillStyle=terpilih?'#6ee7b7':'rgba(148,163,184,.8)'; ctx.fillText(r+' kA',x+wb/2,y0+14);
    if(terpilih) ctx.fillText('✓ dipilih',x+wb/2,Y(Math.min(r,yMax))-6);
  });
  _ttlGaris(ctx,x0,Y(Isc),x0+plotW,Y(Isc),'rgba(239,68,68,.6)',1,[4,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText('rating pemutusan PMT yang tersedia (kA)',x0+kolom*1.2,padT+2);
  _ttlTulis('hubungSingkatInfo','I_n = '+S+' MVA / (√3 × '+V+' kV) = '+In.toFixed(1)+' A   |   I_sc = I_n / '+(Z/100).toFixed(3)+' = '+(Isc*1000).toFixed(0)+' A = '+Isc.toFixed(2)+' kA   |   PMT dipilih: '+(pilih?pilih+' kA':'melebihi 50 kA — perlu impedansi lebih besar atau rel dipisah'));
  if(_ttlJalan('hubungsingkat')){_hsFrame++; requestAnimationFrame(drawHubungSingkat);}
}

// ── ANIMASI 4 — Pembagian beban transformator paralel ──
let _prFrame=0;
function toggleParalel(){_ttlToggle('paralel','btnParalel',drawParalel);}
window.toggleParalel=toggleParalel;
function drawParalel(){
  const k=_ttlKanvas('cvParalel'); if(!k) return; const {ctx,W,H}=k;
  const S1=1000, Z1=_ttlNilai('sl_pr_z1',5), S2=_ttlNilai('sl_pr_s2',1600), Z2=_ttlNilai('sl_pr_z2',7), tot=_ttlNilai('sl_pr_tot',2200);
  _ttlTulis('v_pr_z1',Z1.toFixed(1)); _ttlTulis('v_pr_s2',S2.toFixed(0)); _ttlTulis('v_pr_z2',Z2.toFixed(1)); _ttlTulis('v_pr_tot',tot.toFixed(0));
  const k1=S1/Z1, k2=S2/Z2, b1=tot*k1/(k1+k2), b2=tot*k2/(k1+k2), p1=b1/S1*100, p2=b2/S2*100;
  const padL=110,padR=70,padT=30, x0=padL,plotW=W-padL-padR;
  const barH=Math.min(46,(H-padT-40)/2.6), gap=barH*0.8;
  const X=v=>x0+Math.min(v,140)/140*plotW;
  ctx.font="11px 'JetBrains Mono',monospace";
  for(const v of [25,50,75,100,125]){_ttlGaris(ctx,X(v),padT-8,X(v),padT+2*barH+gap+8,'rgba(148,163,184,.15)',1,[3,3]); ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='center'; ctx.fillText(v+'%',X(v),padT+2*barH+gap+22);}
  _ttlGaris(ctx,X(100),padT-8,X(100),padT+2*barH+gap+8,'rgba(239,68,68,.85)',1.6,[6,4]);
  ctx.fillStyle='rgba(239,68,68,.9)'; ctx.fillText('batas 100%',X(100),padT-12);
  const kilau=0.85+0.15*Math.sin(_prFrame*0.08);
  const batang=(y,pct,beban,rating,label,warna)=>{
    ctx.fillStyle='rgba(148,163,184,.12)'; ctx.fillRect(x0,y,plotW,barH);
    ctx.fillStyle=pct>100?'rgba(239,68,68,'+kilau+')':warna; ctx.fillRect(x0,y,X(pct)-x0,barH);
    ctx.textAlign='right'; ctx.fillStyle='#e2e8f0'; ctx.font="600 12px 'JetBrains Mono',monospace"; ctx.fillText(label,x0-10,y+barH/2-4);
    ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText(rating+' kVA',x0-10,y+barH/2+11);
    ctx.textAlign='left'; ctx.fillStyle=pct>100?'#fca5a5':'#e2e8f0'; ctx.font="600 12px 'JetBrains Mono',monospace";
    ctx.fillText(beban.toFixed(0)+' kVA ('+pct.toFixed(1)+'%)'+(pct>100?' ⚠':''),Math.min(X(pct),x0+plotW)+8,y+barH/2+4);
    ctx.font="11px 'JetBrains Mono',monospace";
  };
  batang(padT,p1,b1,S1,'T1 · Z '+Z1.toFixed(1)+'%','rgba(34,211,238,.85)');
  batang(padT+barH+gap,p2,b2,S2,'T2 · Z '+Z2.toFixed(1)+'%','rgba(168,85,247,.85)');
  ctx.textAlign='left';
  const kapasitas=S1+S2, efektif=Math.min(S1*(k1+k2)/k1, S2*(k1+k2)/k2);
  _ttlTulis('paralelInfo','S₁/Z₁ = '+k1.toFixed(1)+', S₂/Z₂ = '+k2.toFixed(1)+'   |   T1 memikul '+b1.toFixed(0)+' kVA ('+p1.toFixed(1)+'%), T2 '+b2.toFixed(0)+' kVA ('+p2.toFixed(1)+'%)   |   kapasitas terpasang '+kapasitas+' kVA, beban total maksimum tanpa ada yang lebih beban '+efektif.toFixed(0)+' kVA'+(p1>100||p2>100?'   ⚠ satu trafo lebih beban':''));
  if(_ttlJalan('paralel')){_prFrame++; requestAnimationFrame(drawParalel);}
}

_TTL_DAFTAR.push(['cvRasio',()=>drawRasio(),'rasio',['sl_rs_n1','sl_rs_n2','sl_rs_s']]);
_TTL_DAFTAR.push(['cvEfisiensi',()=>drawEfisiensi(),'efisiensi',['sl_ef_fe','sl_ef_cu','sl_ef_pf']]);
_TTL_DAFTAR.push(['cvHubungSingkat',()=>drawHubungSingkat(),'hubungsingkat',['sl_hs_s','sl_hs_z','sl_hs_v']]);
_TTL_DAFTAR.push(['cvParalel',()=>drawParalel(),'paralel',['sl_pr_z1','sl_pr_s2','sl_pr_z2','sl_pr_tot']]);
_ttlMulai();
