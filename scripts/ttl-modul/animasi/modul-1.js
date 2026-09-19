// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 1 TEKNIK TENAGA LISTRIK — Konsep Dasar Sistem Tenaga Listrik
// Kanvas: cvRantai, cvRugi, cvFasa, cvBeban, cvGen (satu tombol PAUSE per kanvas)
// ════════════════════════════════════════════════════════════
function _ttlKanvas(id){
  const cv=document.getElementById(id); if(!cv) return null;
  const W=cv.clientWidth; if(W>0) cv.width=W; const H=cv.height;
  const ctx=cv.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#020812'); bg.addColorStop(1,'#080c18');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  return {ctx,W,H};
}
function _ttlNilai(id,def){const el=document.getElementById(id); const v=parseFloat(el&&el.value); return Number.isFinite(v)?v:def;}
function _ttlTulis(id,teks){const el=document.getElementById(id); if(el) el.textContent=teks;}
function _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar,putus){
  ctx.strokeStyle=warna; ctx.lineWidth=lebar||1; ctx.setLineDash(putus||[]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
}
function _ttlToggle(nama,btnId,gambar){
  const st=window._ttlJeda||(window._ttlJeda={});
  st[nama]=!st[nama];
  const b=document.getElementById(btnId); if(b) b.textContent=st[nama]?'▶ PLAY':'⏸ PAUSE';
  if(!st[nama]) gambar();
}
const _ttlJalan=nama=>!((window._ttlJeda||{})[nama]);

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Aliran energi bahan bakar → konsumen (efisiensi berantai)
// ════════════════════════════════════════════════════════════
let _raFrame=0;
function toggleRantai(){_ttlToggle('rantai','btnRantai',drawRantai);}
window.toggleRantai=toggleRantai;
function drawRantai(){
  const k=_ttlKanvas('cvRantai'); if(!k) return; const {ctx,W,H}=k;
  const ep=_ttlNilai('sl_ra_p',38)/100, et=_ttlNilai('sl_ra_t',96.5)/100, ed=_ttlNilai('sl_ra_d',93)/100, etrf=0.985;
  _ttlTulis('v_ra_p',(ep*100).toFixed(1)); _ttlTulis('v_ra_t',(et*100).toFixed(1)); _ttlTulis('v_ra_d',(ed*100).toFixed(1));
  const simpul=['Bahan bakar','Pembangkit','Trafo','Transmisi','Konsumen'];
  const tahap=['pembangkit','trafo','transmisi','distribusi'];
  const eta=[ep,etrf,et,ed];
  const nilai=[100]; for(let i=0;i<4;i++) nilai.push(nilai[i]*eta[i]);
  const warna=['#f97316','#a855f7','#22d3ee','#0ea5e9','#00e09e'];
  const padL=24,padR=24,top=44,maxH=H-120;
  const kolom=(W-padL-padR)/5, X=i=>padL+kolom*(i+0.5), tinggi=v=>v/100*maxH, lebarSimpul=Math.min(26,kolom*0.22);
  // Layar sempit: label rugi tanpa awalan "rugi" dan huruf lebih kecil agar tidak bertabrakan.
  const sempit=kolom<120;
  ctx.font=(sempit?"9px":"10px")+" 'JetBrains Mono',monospace";
  for(let i=0;i<4;i++){
    const x1=X(i)+lebarSimpul/2, x2=X(i+1)-lebarSimpul/2, h1=tinggi(nilai[i]), h2=tinggi(nilai[i+1]);
    const g=ctx.createLinearGradient(x1,0,x2,0); g.addColorStop(0,warna[i]+'88'); g.addColorStop(1,warna[i+1]+'88');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(x1,top); ctx.lineTo(x2,top); ctx.lineTo(x2,top+h2); ctx.lineTo(x1,top+h2); ctx.closePath(); ctx.fill();
    // pita rugi turun ke bawah
    const rugi=nilai[i]-nilai[i+1], xm=(x1+x2)/2, wr=Math.max(2,h1-h2);
    ctx.fillStyle='rgba(239,68,68,.35)'; ctx.beginPath();
    ctx.moveTo(x1,top+h2); ctx.lineTo(x1,top+h1);
    ctx.quadraticCurveTo(xm-wr/2,top+h1,xm-wr/2,H-44); ctx.lineTo(xm+wr/2,H-44);
    ctx.quadraticCurveTo(xm+wr/2,top+h2,x1,top+h2); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(248,113,113,.95)'; ctx.textAlign='center';
    ctx.fillText((sempit?'':'rugi ')+tahap[i],xm,H-28); ctx.fillText(rugi.toFixed(1),xm,H-14);
    // partikel energi
    for(let p=0;p<6;p++){
      const frac=((_raFrame*0.006)+p/6)%1, x=x1+(x2-x1)*frac, y=top+(p+0.5)/6*h2;
      ctx.fillStyle='rgba(232,246,255,.85)'; ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill();
    }
  }
  // Layar sempit: label simpul genap dan ganjil diselang di dua baris agar tidak bertumpuk.
  for(let i=0;i<5;i++){
    const h=tinggi(nilai[i]), naik=sempit&&i%2===1?24:0;
    ctx.fillStyle=warna[i]; ctx.beginPath(); ctx.roundRect(X(i)-lebarSimpul/2,top,lebarSimpul,Math.max(3,h),4); ctx.fill();
    ctx.fillStyle='#e2e8f0'; ctx.textAlign='center'; ctx.font=(sempit?"600 9px":"600 11px")+" 'JetBrains Mono',monospace";
    ctx.fillText(simpul[i],X(i),top-22-naik);
    ctx.fillStyle=warna[i]; ctx.fillText(nilai[i].toFixed(sempit?1:2),X(i),top-8-naik);
    ctx.font="10px 'JetBrains Mono',monospace";
  }
  ctx.textAlign='left';
  let terbesar=0; for(let i=1;i<4;i++) if(nilai[i]-nilai[i+1]>nilai[terbesar]-nilai[terbesar+1]) terbesar=i;
  _ttlTulis('rantaiInfo','η_total = '+(nilai[4]).toFixed(2)+' %   |   dari 100 MWh bahan bakar sampai konsumen '+nilai[4].toFixed(2)+' MWh   |   rugi terbesar di '+tahap[terbesar]+' ('+(nilai[terbesar]-nilai[terbesar+1]).toFixed(2)+' MWh)');
  if(_ttlJalan('rantai')){_raFrame++; requestAnimationFrame(drawRantai);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Rugi saluran sebagai persen daya kirim terhadap tegangan
// ════════════════════════════════════════════════════════════
let _ruFrame=0;
function toggleRugi(){_ttlToggle('rugi','btnRugi',drawRugi);}
window.toggleRugi=toggleRugi;
function drawRugi(){
  const k=_ttlKanvas('cvRugi'); if(!k) return; const {ctx,W,H}=k;
  const P=_ttlNilai('sl_ru_p',100), R=_ttlNilai('sl_ru_r',5), V=_ttlNilai('sl_ru_v',150), pf=0.9;
  _ttlTulis('v_ru_p',P.toFixed(0)); _ttlTulis('v_ru_r',R.toFixed(1)); _ttlTulis('v_ru_v',V.toFixed(0));
  const persen=v=>P*1e6*R/((v*1e3)**2*pf*pf)*100;
  const padL=52,padR=18,padT=22,padB=36, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const vMin=20,vMax=500,pMax=30;
  const X=v=>x0+(v-vMin)/(vMax-vMin)*plotW, Y=p=>y0-Math.min(p,pMax)/pMax*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(const p of [0,10,20,30]){_ttlGaris(ctx,x0,Y(p),x0+plotW,Y(p),'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.fillText(p+'%',8,Y(p)+4);}
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  for(const v of [20,70,150,275,500]){
    _ttlGaris(ctx,X(v),padT,X(v),y0,'rgba(168,85,247,.28)',1,[3,4]);
    ctx.fillStyle='rgba(148,163,184,.75)'; ctx.textAlign='center'; ctx.fillText(v+' kV',X(v),y0+16);
  }
  ctx.textAlign='left';
  _ttlGaris(ctx,x0,Y(3),x0+plotW,Y(3),'rgba(239,68,68,.8)',1.5,[6,4]);
  ctx.fillStyle='rgba(239,68,68,.9)'; ctx.fillText('batas rugi 3%',x0+plotW-96,Y(3)-6);
  ctx.strokeStyle='rgba(255,179,0,.95)'; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=300;i++){const v=vMin+(i/300)*(vMax-vMin); i?ctx.lineTo(X(v),Y(persen(v))):ctx.moveTo(X(v),Y(persen(v)));}
  ctx.stroke();
  const vBatas=Math.sqrt(P*1e6*R/(0.03*pf*pf))/1e3;
  if(vBatas>=vMin && vBatas<=vMax){
    _ttlGaris(ctx,X(vBatas),padT,X(vBatas),y0,'rgba(236,72,153,.85)',1.5,[3,3]);
    ctx.fillStyle='rgba(236,72,153,.95)'; ctx.fillText('V min = '+vBatas.toFixed(1)+' kV',Math.min(X(vBatas)+6,x0+plotW-120),padT+14);
  }
  const pSel=persen(V), denyut=1+0.3*Math.sin(_ruFrame*0.1);
  ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(V),Y(pSel),5*denyut,0,Math.PI*2); ctx.fill();
  if(pSel>pMax){ctx.fillStyle='rgba(0,229,255,.9)'; ctx.fillText('> 30%',X(V)+8,Y(pMax)+12);}
  const IL=P*1e6/(Math.sqrt(3)*V*1e3*pf), Prugi=pSel/100*P;
  _ttlTulis('rugiInfo','V_L = '+V.toFixed(0)+' kV → I_L = '+IL.toFixed(1)+' A   |   P_rugi = '+Prugi.toFixed(3)+' MW ('+pSel.toFixed(2)+' % dari P)   |   V_L minimum untuk rugi ≤ 3% = '+vBatas.toFixed(1)+' kV');
  if(_ttlJalan('rugi')){_ruFrame++; requestAnimationFrame(drawRugi);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Tegangan tiga fasa seimbang dan fasor berputar
// ════════════════════════════════════════════════════════════
let _faFrame=0;
function toggleFasa(){_ttlToggle('fasa','btnFasa',drawFasa);}
window.toggleFasa=toggleFasa;
function drawFasa(){
  const k=_ttlKanvas('cvFasa'); if(!k) return; const {ctx,W,H}=k;
  const f=_ttlNilai('sl_fa_f',50), Vf=_ttlNilai('sl_fa_v',230);
  _ttlTulis('v_fa_f',f.toFixed(1)); _ttlTulis('v_fa_v',Vf.toFixed(0));
  const Vm=Math.SQRT2*Vf, cy=H/2, Rr=Math.min(H*0.36,W*0.13), cx=24+Rr;
  const theta=_faFrame*0.02*(f/50);
  const fasa=[['R','#ef4444',0],['S','#f59e0b',-2*Math.PI/3],['T','#22d3ee',-4*Math.PI/3]];
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,Rr,0,Math.PI*2); ctx.stroke();
  _ttlGaris(ctx,cx-Rr-6,cy,cx+Rr+6,cy,'rgba(148,163,184,.35)',1); _ttlGaris(ctx,cx,cy-Rr-6,cx,cy+Rr+6,'rgba(148,163,184,.35)',1);
  const xs=cx+Rr+40, xe=W-18, siklus=2;
  _ttlGaris(ctx,xs,cy,xe,cy,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace";
  for(const [nama,warna,geser] of fasa){
    const a=theta+geser, px=cx+Rr*Math.cos(a), py=cy-Rr*Math.sin(a);
    _ttlGaris(ctx,cx,cy,px,py,warna,2.4);
    ctx.fillStyle=warna; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillText(nama,px+(Math.cos(a)>=0?6:-14),py-4);
    _ttlGaris(ctx,px,py,xs,py,warna+'55',1,[3,4]);
    ctx.strokeStyle=warna; ctx.lineWidth=2; ctx.beginPath();
    for(let i=0;i<=300;i++){const psi=(i/300)*siklus*2*Math.PI; const x=xs+(i/300)*(xe-xs); const y=cy-Rr*Math.sin(a-psi); i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.stroke();
  }
  // jumlah sesaat ketiga fasa (selalu nol)
  ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=1.2; ctx.beginPath();
  let jumlahMaks=0;
  for(let i=0;i<=120;i++){
    const psi=(i/120)*siklus*2*Math.PI, x=xs+(i/120)*(xe-xs);
    let s=0; for(const [, , geser] of fasa) s+=Math.sin(theta+geser-psi);
    jumlahMaks=Math.max(jumlahMaks,Math.abs(s)); i?ctx.lineTo(x,cy-Rr*s):ctx.moveTo(x,cy-Rr*s);
  }
  ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.75)'; ctx.fillText('+'+Vm.toFixed(0)+' V',xs+4,cy-Rr-6); ctx.fillText('−'+Vm.toFixed(0)+' V',xs+4,cy+Rr+14);
  ctx.fillText('2 siklus = '+(2000/f).toFixed(1)+' ms',xe-118,H-8);
  ctx.fillStyle='rgba(255,255,255,.8)'; ctx.fillText('v_R + v_S + v_T',xe-120,cy-6);
  _ttlTulis('fasaInfo','V_f = '+Vf.toFixed(0)+' V rms → V_m = √2·V_f = '+Vm.toFixed(1)+' V   |   V_L = √3·V_f = '+(Math.sqrt(3)*Vf).toFixed(1)+' V   |   T = 1/f = '+(1000/f).toFixed(2)+' ms   |   jumlah sesaat = '+(jumlahMaks*Vm).toFixed(3)+' V');
  if(_ttlJalan('fasa')){_faFrame++; requestAnimationFrame(drawFasa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Kurva beban harian, faktor beban, faktor kapasitas, cadangan
// ════════════════════════════════════════════════════════════
let _beFrame=0;
const _TTL_BENTUK=[0.08,0.03,0,0,0.03,0.10,0.24,0.36,0.44,0.48,0.50,0.52,0.48,0.48,0.50,0.52,0.60,0.80,0.96,1,0.92,0.72,0.42,0.20];
function toggleBeban(){_ttlToggle('beban','btnBeban',drawBeban);}
window.toggleBeban=toggleBeban;
function drawBeban(){
  const k=_ttlKanvas('cvBeban'); if(!k) return; const {ctx,W,H}=k;
  const puncak=_ttlNilai('sl_be_puncak',80), kap=_ttlNilai('sl_be_kap',120);
  const dasar=Math.min(_ttlNilai('sl_be_dasar',30),puncak);
  _ttlTulis('v_be_puncak',puncak.toFixed(0)); _ttlTulis('v_be_dasar',dasar.toFixed(0)); _ttlTulis('v_be_kap',kap.toFixed(0));
  const beban=_TTL_BENTUK.map(s=>dasar+(puncak-dasar)*s);
  const E=beban.reduce((a,b)=>a+b,0), rata=E/24, LF=rata/puncak*100, CF=rata/kap*100, cadangan=(kap-puncak)/puncak*100;
  const padL=46,padR=18,padT=22,padB=32, x0=padL,y0=H-padB,plotW=W-padL-padR,plotH=H-padT-padB;
  const yMax=Math.max(kap,puncak)*1.12;
  const X=h=>x0+h/24*plotW, Y=v=>y0-v/yMax*plotH;
  ctx.font="10px 'JetBrains Mono',monospace";
  for(let i=0;i<=4;i++){const v=yMax*i/4; _ttlGaris(ctx,x0,Y(v),x0+plotW,Y(v),'rgba(148,163,184,.10)',1); ctx.fillStyle='rgba(148,163,184,.65)'; ctx.fillText(v.toFixed(0),8,Y(v)+4);}
  for(let h=0;h<=24;h+=3){ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='center'; ctx.fillText(String(h).padStart(2,'0'),X(h),y0+16);}
  ctx.textAlign='left';
  _ttlGaris(ctx,x0,padT,x0,y0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0,x0+plotW,y0,'rgba(148,163,184,.45)',1.2);
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
  beban.forEach((v,h)=>{ctx.lineTo(X(h),Y(v)); ctx.lineTo(X(h+1),Y(v));}); ctx.lineTo(X(24),Y(0)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(34,211,238,1)'; ctx.lineWidth=2.2; ctx.beginPath();
  beban.forEach((v,h)=>{h?ctx.lineTo(X(h),Y(v)):ctx.moveTo(X(h),Y(v)); ctx.lineTo(X(h+1),Y(v));}); ctx.stroke();
  _ttlGaris(ctx,x0,Y(kap),x0+plotW,Y(kap),'rgba(249,115,22,.9)',1.6,[7,4]);
  _ttlGaris(ctx,x0,Y(puncak),x0+plotW,Y(puncak),'rgba(239,68,68,.85)',1.3,[5,4]);
  _ttlGaris(ctx,x0,Y(rata),x0+plotW,Y(rata),'rgba(0,224,158,.9)',1.3,[5,4]);
  ctx.fillStyle='rgba(249,115,22,.95)'; ctx.fillText('kapasitas '+kap.toFixed(0)+' MW',x0+6,Y(kap)-5);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('puncak '+puncak.toFixed(0)+' MW',x0+6,Y(puncak)-5);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('rata-rata '+rata.toFixed(1)+' MW',x0+6,Y(rata)-5);
  const jam=(_beFrame*0.03)%24, iJam=Math.floor(jam);
  _ttlGaris(ctx,X(jam),padT,X(jam),y0,'rgba(255,255,255,.35)',1);
  ctx.fillStyle='#e8f6ff'; ctx.beginPath(); ctx.arc(X(jam),Y(beban[iJam]),4.5,0,Math.PI*2); ctx.fill();
  ctx.fillText('pukul '+String(iJam).padStart(2,'0')+'.00 — '+beban[iJam].toFixed(1)+' MW',Math.min(X(jam)+8,x0+plotW-170),padT+12);
  _ttlTulis('bebanInfo','E harian = '+E.toFixed(1)+' MWh   |   P_rata = '+rata.toFixed(2)+' MW   |   LF = '+LF.toFixed(2)+' %   |   CF = '+CF.toFixed(2)+' %   |   cadangan = '+cadangan.toFixed(1)+' %'+(kap<puncak?'   ⚠ kapasitas lebih kecil daripada beban puncak!':''));
  if(_ttlJalan('beban')){_beFrame++; requestAnimationFrame(drawBeban);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 5 — Generator sinkron: kutub, putaran, dan frekuensi
// ════════════════════════════════════════════════════════════
let _geFrame=0, _geSudut=0;
function toggleGen(){_ttlToggle('gen','btnGen',drawGen);}
window.toggleGen=toggleGen;
function drawGen(){
  const k=_ttlKanvas('cvGen'); if(!k) return; const {ctx,W,H}=k;
  const p=Math.max(2,Math.round(_ttlNilai('sl_ge_p',4)/2)*2), n=_ttlNilai('sl_ge_n',1500);
  _ttlTulis('v_ge_p',String(p)); _ttlTulis('v_ge_n',n.toFixed(0));
  const f=p*n/120, nSinkron=6000/p;
  const cy=H/2, Rs=Math.min(H*0.40,W*0.15), cx=28+Rs, Rr=Rs*0.70;
  // stator
  ctx.strokeStyle='rgba(148,163,184,.55)'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(cx,cy,Rs,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillRect(cx-7,cy-Rs-9,14,18);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('kumparan',cx+12,cy-Rs-2);
  // rotor
  ctx.fillStyle='rgba(30,41,59,.9)'; ctx.beginPath(); ctx.arc(cx,cy,Rr*0.35,0,Math.PI*2); ctx.fill();
  const lebarSudut=Math.PI*2/p;
  for(let i=0;i<p;i++){
    const a=_geSudut+i*lebarSudut;
    ctx.fillStyle=i%2===0?'rgba(239,68,68,.85)':'rgba(59,130,246,.85)';
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,Rr,a-lebarSudut*0.38,a+lebarSudut*0.38); ctx.closePath(); ctx.fill();
    if(p<=12){ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(i%2===0?'U':'S',cx+Rr*0.72*Math.cos(a),cy+Rr*0.72*Math.sin(a)+4); ctx.textAlign='left';}
  }
  // gelombang tegangan kumparan (3 siklus, digeser mengikuti sudut rotor)
  const xs=cx+Rs+36, xe=W-18, amp=Rs*0.85, siklus=3;
  _ttlGaris(ctx,xs,cy,xe,cy,'rgba(148,163,184,.45)',1.2);
  const fase=_geSudut*p/2;
  ctx.strokeStyle='rgba(236,72,153,1)'; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=300;i++){const psi=(i/300)*siklus*2*Math.PI; const x=xs+(i/300)*(xe-xs); const y=cy-amp*Math.cos(fase-psi+Math.PI/2); i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText('3 siklus = '+(f>0?(3000/f).toFixed(1):'—')+' ms',xe-128,H-8);
  const sinkron=Math.abs(f-50)<=0.5;
  ctx.fillStyle=sinkron?'rgba(0,224,158,.95)':'rgba(255,179,0,.95)'; ctx.font="600 13px 'JetBrains Mono',monospace";
  ctx.fillText('f = '+f.toFixed(2)+' Hz',xs+6,24);
  const info=document.getElementById('genInfo');
  if(info){
    info.style.color=sinkron?'var(--green)':'var(--amber)';
    info.textContent='f = p·n/120 = '+p+' × '+n.toFixed(0)+' / 120 = '+f.toFixed(2)+' Hz   |   putaran sinkron untuk 50 Hz = '+nSinkron.toFixed(0)+' rpm'+(sinkron?'   ✓ sinkron dengan jaringan 50 Hz':'   ✗ belum sinkron');
  }
  if(_ttlJalan('gen')){_geFrame++; _geSudut+=0.05*(n/1500)*(4/p); requestAnimationFrame(drawGen);}
}

// Kickoff kelima animasi setelah DOM siap
(function(){
  const daftar=[['cvRantai',()=>drawRantai(),'rantai'],['cvRugi',()=>drawRugi(),'rugi'],['cvFasa',()=>drawFasa(),'fasa'],['cvBeban',()=>drawBeban(),'beban'],['cvGen',()=>drawGen(),'gen']];
  const slider={rantai:['sl_ra_p','sl_ra_t','sl_ra_d'],rugi:['sl_ru_p','sl_ru_r','sl_ru_v'],fasa:['sl_fa_f','sl_fa_v'],beban:['sl_be_puncak','sl_be_dasar','sl_be_kap'],gen:['sl_ge_p','sl_ge_n']};
  const start=()=>{
    daftar.forEach(([id,gambar,nama])=>{
      if(document.getElementById(id)) gambar();
      (slider[nama]||[]).forEach(sid=>{const s=document.getElementById(sid); if(s) s.addEventListener('input',()=>{if(!_ttlJalan(nama)) gambar();});});
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  // Dipanggil switchTab('modul') dan resize: hanya kanvas yang dijeda perlu digambar ulang.
  window._ttlGambarUlang=()=>{daftar.forEach(([,gambar,nama])=>{if(!_ttlJalan(nama)) gambar();});};
  window.addEventListener('resize',window._ttlGambarUlang);
})();
