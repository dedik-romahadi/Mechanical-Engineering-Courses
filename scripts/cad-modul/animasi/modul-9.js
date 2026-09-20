// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 9 PEMODELAN CAD — Evaluasi Hasil Simulasi dan Analisis Kekuatan
// Kanvas: cvKonturVM, cvKonvergensi, cvKtLubang, cvTekuk (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C9E=210000, _C9SY=250;
// Skala kontur FEM: biru → cyan → hijau → kuning → merah untuk v = 0…1.
function _cad9Warna(v){
  const s=[[0,[59,130,246]],[0.25,[34,211,238]],[0.5,[34,197,94]],[0.75,[245,158,11]],[1,[239,68,68]]];
  v=Math.max(0,Math.min(1,v));
  for(let i=0;i<4;i++){const [a,ca]=s[i],[b,cb]=s[i+1]; if(v<=b){const f=(v-a)/(b-a); return 'rgb('+ca.map((c,k)=>Math.round(c+(cb[k]-c)*f)).join(',')+')';}}
  return 'rgb(239,68,68)';
}
function _cad9Legenda(ctx,x,y,h,teksMaks,teksMin){
  for(let i=0;i<h;i++){ctx.fillStyle=_cad9Warna(1-i/h); ctx.fillRect(x,y+i,10,1.2);}
  ctx.strokeStyle='rgba(226,232,240,.5)'; ctx.lineWidth=1; ctx.strokeRect(x,y,10,h);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText(teksMaks,x+16,y+8); ctx.fillText(teksMin,x+16,y+h);
}
function _cad9Dinding(ctx,x,y0,y1){
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y1); ctx.stroke();
  ctx.lineWidth=1; for(let y=y0;y<y1;y+=8){ctx.beginPath(); ctx.moveTo(x,y+8); ctx.lineTo(x-8,y); ctx.stroke();}
}
function _cad9Panah(ctx,x1,y1,x2,y2,warna,lebar){
  const a=Math.atan2(y2-y1,x2-x1), bx=x2-9*Math.cos(a), by=y2-9*Math.sin(a);
  ctx.strokeStyle=warna; ctx.lineWidth=lebar||2; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(bx,by); ctx.stroke();
  ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(bx+4.5*Math.sin(a),by-4.5*Math.cos(a)); ctx.lineTo(bx-4.5*Math.sin(a),by+4.5*Math.cos(a)); ctx.closePath(); ctx.fill();
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Kontur von Mises kantilever berbeban ujung
// ════════════════════════════════════════════════════════════
let _c9vmFrame=0;
function toggleKonturVM(){_ttlToggle('konturvm','btnKonturVM',drawKonturVM);}
window.toggleKonturVM=toggleKonturVM;
function drawKonturVM(){
  const k=_ttlKanvas('cvKonturVM'); if(!k) return; const {ctx,W,H}=k;
  const F=_ttlNilai('sl_vm_F',500), L=_ttlNilai('sl_vm_L',200), h=_ttlNilai('sl_vm_h',20), b=20;
  _ttlTulis('v_vm_F',F.toFixed(0)); _ttlTulis('v_vm_L',L.toFixed(0)); _ttlTulis('v_vm_h',h.toFixed(0));
  const lam=_ttlJalan('konturvm')?0.5+0.5*Math.sin(_c9vmFrame/45-Math.PI/2):1;
  const I=b*h*h*h/12, sigMaks=6*F*L/(b*h*h), delta=F*L*L*L/(3*_C9E*I);
  const x0=W*0.08, bw=W*0.52, sk=Math.min(bw/L,(H*0.45)/h), bl=L*sk, bh=Math.max(h*sk,16), y0=H*0.42-bh/2;
  const nx=48, nz=12;
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){
    const xm=(i+0.5)/nx, ym=Math.abs((j+0.5)/nz-0.5)*2, v=lam*(1-xm)*ym;
    ctx.fillStyle=_cad9Warna(v); ctx.fillRect(x0+bl*i/nx,y0+bh*j/nz,bl/nx+0.5,bh/nz+0.5);
  }
  ctx.strokeStyle='rgba(226,232,240,.8)'; ctx.lineWidth=1.2; ctx.strokeRect(x0,y0,bl,bh);
  _cad9Dinding(ctx,x0,y0-10,y0+bh+10);
  ctx.setLineDash([6,3]); ctx.strokeStyle='rgba(226,232,240,.6)'; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(x0,y0+bh/2); ctx.lineTo(x0+bl,y0+bh/2); ctx.stroke(); ctx.setLineDash([]);
  // beban dan lendutan (visual)
  const pj=16+40*lam; _cad9Panah(ctx,x0+bl,y0-pj-4,x0+bl,y0-3,'#ef4444',2.2);
  ctx.fillStyle='#ef4444'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('F = '+(lam*F).toFixed(0)+' N',x0+bl+8,y0-pj/2);
  ctx.strokeStyle='rgba(0,224,158,.8)'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]); ctx.beginPath();
  const dv=Math.min(40,delta*lam*sk*12); for(let i=0;i<=30;i++){const u=i/30; const y=y0+bh/2+dv*u*u*(3-u)/2; i?ctx.lineTo(x0+bl*u,y):ctx.moveTo(x0,y);} ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(0,224,158,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('δ (diperbesar)',x0+bl+8,y0+bh/2+dv+4);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('Kantilever '+L+' × '+b+' × '+h+' mm, beban ujung berdenyut 0 → F',12,18);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('merah = serat terluar jepitan (σ_maks) · biru = sumbu netral dan ujung bebas',12,H-14);
  _cad9Legenda(ctx,W*0.66,H*0.16,H*0.42,(lam*sigMaks).toFixed(1)+' MPa (maks)','0 (min)');
  const tx=W*0.66;
  ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillStyle='#22d3ee'; ctx.fillText('σ_maks = 6FL/(bh²)',tx,H*0.66); ctx.fillStyle='#00e09e'; ctx.fillText('= '+sigMaks.toFixed(2)+' MPa',tx,H*0.66+18);
  ctx.fillStyle='#f59e0b'; ctx.fillText('δ = FL³/(3EI) = '+delta.toFixed(3)+' mm',tx,H*0.66+40);
  ctx.fillStyle=sigMaks<_C9SY?'rgba(148,163,184,.85)':'#ef4444'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('SF = 250/σ_maks = '+(_C9SY/sigMaks).toFixed(2)+(sigMaks>=_C9SY?' → luluh!':''),tx,H*0.66+60);
  _ttlTulis('infoKonturVM','I = '+b+'·'+h+'³/12 = '+I.toFixed(1)+' mm⁴; σ_maks = 6·'+F+'·'+L+'/('+b+'·'+h+'²) = '+sigMaks.toFixed(3)+' MPa di serat terluar jepitan (von Mises FEM ≈ nilai ini pada jarak ≥ h dari rusuk Fixed); δ = '+delta.toFixed(4)+' mm; SF luluh S235 = '+(_C9SY/sigMaks).toFixed(3));
  if(_ttlJalan('konturvm')){_c9vmFrame++; requestAnimationFrame(drawKonturVM);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Konvergensi mesh: σ_maks terhadap jumlah elemen
// ════════════════════════════════════════════════════════════
let _c9kvFrame=0;
const _C9SIG_EX=53.83;   // σ_maks analitis pelat berlubang contoh (Kt·σ_nom)
function toggleKonvergensi(){_ttlToggle('konvergensi','btnKonvergensi',drawKonvergensi);}
window.toggleKonvergensi=toggleKonvergensi;
function drawKonvergensi(){
  const k=_ttlKanvas('cvKonvergensi'); if(!k) return; const {ctx,W,H}=k;
  const tingkat=Math.round(_ttlNilai('sl_kv_tingkat',5)), p=_ttlNilai('sl_kv_orde',1.2);
  _ttlTulis('v_kv_tingkat',tingkat.toFixed(0)); _ttlTulis('v_kv_orde',p.toFixed(1).replace('.',','));
  const data=[]; for(let i=0;i<tingkat;i++){const h=8/Math.pow(2,i), n=900*Math.pow(8,i), e=0.15*Math.pow(h/8,p); data.push({h,n,s:_C9SIG_EX*(1-e)});}
  const tampil=_ttlJalan('konvergensi')?Math.min(tingkat,Math.floor((_c9kvFrame/55)%(tingkat+2))+1):tingkat;
  const gx0=W*0.08, gx1=W*0.60, gy0=H*0.80, gy1=H*0.16;
  const X=n=>gx0+(gx1-gx0)*(Math.log10(n)-2.5)/(Math.log10(900*Math.pow(8,6))-2.5), Y=s=>gy0-(gy0-gy1)*(s-44)/12;
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; for(let s=44;s<=56;s+=2){ctx.beginPath(); ctx.moveTo(gx0,Y(s)); ctx.lineTo(gx1,Y(s)); ctx.stroke();}
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.beginPath(); ctx.moveTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.moveTo(gx0,gy0); ctx.lineTo(gx0,gy1); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right';
  for(let s=44;s<=56;s+=4) ctx.fillText(s,gx0-4,Y(s)+3);
  ctx.textAlign='center'; [1e3,1e4,1e5,1e6].forEach(n=>ctx.fillText(n.toExponential(0).replace('e+','e'),X(n),gy0+14));
  ctx.fillText('jumlah elemen (log)',(gx0+gx1)/2,gy0+28); ctx.textAlign='left'; ctx.fillText('σ_maks (MPa)',gx0,gy1-8);
  // pita ± 5 % dan garis analitis
  ctx.fillStyle='rgba(0,224,158,.10)'; ctx.fillRect(gx0,Y(_C9SIG_EX*1.05),gx1-gx0,Y(_C9SIG_EX*0.95)-Y(_C9SIG_EX*1.05));
  ctx.setLineDash([6,3]); ctx.strokeStyle='#00e09e'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(gx0,Y(_C9SIG_EX)); ctx.lineTo(gx1,Y(_C9SIG_EX)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#00e09e'; ctx.textAlign='right'; ctx.fillText('analitis '+_C9SIG_EX.toFixed(2)+' (pita ± 5 %)',gx1-2,Y(_C9SIG_EX)-5);
  // kurva dan titik
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.beginPath(); for(let i=0;i<tampil;i++){const d=data[i]; i?ctx.lineTo(X(d.n),Y(d.s)):ctx.moveTo(X(d.n),Y(d.s));} ctx.stroke();
  for(let i=0;i<tampil;i++){const d=data[i]; ctx.fillStyle=i===tampil-1?'#f59e0b':'#22d3ee'; ctx.beginPath(); ctx.arc(X(d.n),Y(d.s),i===tampil-1?5:4,0,Math.PI*2); ctx.fill();}
  // tabel kanan
  const tx=W*0.66; ctx.textAlign='left'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.fillText('h (mm)   elemen    σ_maks   Δ',tx,H*0.16);
  let ubahAkhir=null;
  for(let i=0;i<tampil;i++){const d=data[i]; const ubah=i?Math.abs(d.s-data[i-1].s)/data[i-1].s*100:null; if(i===tampil-1) ubahAkhir=ubah;
    ctx.fillStyle=i===tampil-1?'#f59e0b':'rgba(226,232,240,.8)';
    ctx.fillText((d.h<1?d.h.toFixed(2):d.h.toFixed(d.h%1?1:0)).padStart(5)+'  '+Math.round(d.n).toLocaleString('id-ID').padStart(10)+'  '+d.s.toFixed(2).padStart(6)+'  '+(ubah===null?'   —':ubah.toFixed(1).padStart(4)+'%'),tx,H*0.16+16*(i+1));}
  const konv=ubahAkhir!==null&&ubahAkhir<5;
  ctx.fillStyle=konv?'#00e09e':'#ef4444'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(ubahAkhir===null?'satu mesh: belum ada bukti':(konv?'konvergen (Δ < 5 %)':'belum konvergen (Δ ≥ 5 %)'),tx,H*0.16+16*(tampil+2));
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('kesalahan thd analitis '+(Math.abs(data[tampil-1].s-_C9SIG_EX)/_C9SIG_EX*100).toFixed(1)+' %',tx,H*0.16+16*(tampil+3));
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText('h dibagi dua tiap tingkat → elemen × 8; kesalahan ~ h^p',12,18);
  _ttlTulis('infoKonvergensi','Tingkat '+tampil+'/'+tingkat+': h = '+data[tampil-1].h+' mm, ≈ '+Math.round(data[tampil-1].n).toLocaleString('id-ID')+' elemen, σ_maks = '+data[tampil-1].s.toFixed(2)+' MPa'+(ubahAkhir===null?'':', perubahan '+ubahAkhir.toFixed(2)+' % dari tingkat sebelumnya')+'; nilai analitis '+_C9SIG_EX+' MPa. Laju p besar (elemen orde 2) mencapai pita ± 5 % dengan lebih sedikit elemen.');
  if(_ttlJalan('konvergensi')){_c9kvFrame++; requestAnimationFrame(drawKonvergensi);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Kt pelat berlubang terhadap d/W
// ════════════════════════════════════════════════════════════
let _c9ktFrame=0;
function _cad9Kt(r){return 3.00-3.13*r+3.66*r*r-1.53*r*r*r;}
function toggleKtLubang(){_ttlToggle('ktlubang','btnKtLubang',drawKtLubang);}
window.toggleKtLubang=toggleKtLubang;
function drawKtLubang(){
  const k=_ttlKanvas('cvKtLubang'); if(!k) return; const {ctx,W,H}=k;
  const dS=_ttlNilai('sl_kt_d',15), Wp=_ttlNilai('sl_kt_W',60), F=_ttlNilai('sl_kt_F',5000), t=5;
  _ttlTulis('v_kt_d',dS.toFixed(0)); _ttlTulis('v_kt_W',Wp.toFixed(0)); _ttlTulis('v_kt_F',F.toFixed(0));
  const d=_ttlJalan('ktlubang')?Math.min(0.6*Wp,Wp*(0.05+0.55*(0.5+0.5*Math.sin(_c9ktFrame/60-Math.PI/2)))):Math.min(dS,0.6*Wp);
  const r=d/Wp, Kt=_cad9Kt(r), sigNom=F/((Wp-d)*t), sigMaks=Kt*sigNom, sigKotor=F/(Wp*t);
  // pelat kiri (tampak depan): panjang tetap 2,4·W agar proporsional
  const sk=Math.min((W*0.42)/(2.4*Wp),(H*0.5)/Wp), pl=2.4*Wp*sk, ph=Wp*sk, px=W*0.07, py=H*0.50-ph/2, cx=px+pl/2, cy=py+ph/2, rr=d/2*sk;
  ctx.fillStyle='rgba(34,211,238,.12)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.6; ctx.fillRect(px,py,pl,ph); ctx.strokeRect(px,py,pl,ph);
  ctx.fillStyle='#050b16'; ctx.strokeStyle='#a855f7'; ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // distribusi Kirsch pada ligamen (skala relatif terhadap Kt)
  ctx.fillStyle='rgba(239,68,68,.35)'; ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.2;
  [-1,1].forEach(sg=>{ctx.beginPath(); ctx.moveTo(cx,cy+sg*rr); for(let i=0;i<=20;i++){const rho=rr+(ph/2-rr)*i/20; const s=rho>0?(1+0.5*Math.pow(rr/rho,2)+1.5*Math.pow(rr/rho,4))/3:1; ctx.lineTo(cx+Math.min(0.35*pl,ph*0.45)*s*Kt/3,cy+sg*rho);} ctx.lineTo(cx,cy+sg*ph/2); ctx.closePath(); ctx.fill(); ctx.stroke();});
  _cad9Panah(ctx,px,cy,px-30,cy,'#f59e0b',2); _cad9Panah(ctx,px+pl,cy,px+pl+30,cy,'#f59e0b',2);
  ctx.fillStyle='#f59e0b'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='right'; ctx.fillText('F',px-34,cy+4); ctx.textAlign='left'; ctx.fillText('F',px+pl+34,cy+4);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('W = '+Wp+' · ⌀d = '+d.toFixed(1)+' · t = '+t,cx,py+ph+16);
  ctx.fillStyle='#ef4444'; ctx.fillText('σ_maks di tepi lubang',cx,py-8);
  // grafik Kt(d/W) kanan
  const gx0=W*0.60, gx1=W*0.95, gy0=H*0.80, gy1=H*0.16;
  const X=x=>gx0+(gx1-gx0)*x/0.6, Y=y=>gy0-(gy0-gy1)*(y-2)/1.1;
  ctx.strokeStyle='rgba(148,163,184,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.moveTo(gx0,gy0); ctx.lineTo(gx0,gy1); ctx.stroke();
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; [0,0.2,0.4,0.6].forEach(x=>ctx.fillText(x.toFixed(1).replace('.',','),X(x),gy0+14)); ctx.fillText('d/W',(gx0+gx1)/2,gy0+28);
  ctx.textAlign='right'; [2,2.5,3].forEach(y=>ctx.fillText(y.toFixed(1).replace('.',','),gx0-4,Y(y)+3)); ctx.textAlign='left'; ctx.fillText('Kt',gx0,gy1-8);
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.beginPath(); for(let i=0;i<=60;i++){const x=i/100; i?ctx.lineTo(X(x),Y(_cad9Kt(x))):ctx.moveTo(X(x),Y(_cad9Kt(x)));} ctx.stroke();
  ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(X(r),Y(Kt),5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='left'; ctx.fillText('Kt = '+Kt.toFixed(3)+' pada d/W = '+r.toFixed(3),gx0+6,gy1+6);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillText('σ_nom = F/((W − d)·t) = '+sigNom.toFixed(2)+' MPa  →  σ_maks = Kt·σ_nom = '+sigMaks.toFixed(2)+' MPa',12,18);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('tegangan kotor F/(W·t) = '+sigKotor.toFixed(2)+' MPa; Kt turun, σ_nom naik: σ_maks tetap membesar dengan d',12,H-14);
  _ttlTulis('infoKtLubang','d/W = '+r.toFixed(3)+' → Kt = 3,00 − 3,13r + 3,66r² − 1,53r³ = '+Kt.toFixed(4)+'; σ_nom = '+F+'/(('+Wp+' − '+d.toFixed(1)+')·'+t+') = '+sigNom.toFixed(3)+' MPa; σ_maks = '+sigMaks.toFixed(3)+' MPa di tepi lubang (pembanding von Mises FEM dengan mesh halus di lubang).');
  if(_ttlJalan('ktlubang')){_c9ktFrame++; requestAnimationFrame(drawKtLubang);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Tekuk kolom sendi–sendi terhadap beban P
// ════════════════════════════════════════════════════════════
let _c9tkFrame=0;
function toggleTekuk(){_ttlToggle('tekuk','btnTekuk',drawTekuk);}
window.toggleTekuk=toggleTekuk;
function drawTekuk(){
  const k=_ttlKanvas('cvTekuk'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_tk_L',500), h=_ttlNilai('sl_tk_h',10), Ps=_ttlNilai('sl_tk_P',10000), b=20;
  _ttlTulis('v_tk_L',L.toFixed(0)); _ttlTulis('v_tk_h',h.toFixed(1).replace('.',',')); _ttlTulis('v_tk_P',Ps.toFixed(0));
  const I=b*h*h*h/12, Pcr=Math.PI*Math.PI*_C9E*I/(L*L), A=b*h, lam=L/(h/Math.sqrt(12));
  const P=_ttlJalan('tekuk')?Ps*(0.5+0.5*Math.sin(_c9tkFrame/70-Math.PI/2)):Ps;
  const rasio=P/Pcr, amp=rasio<1?0:Math.min(1,Math.sqrt(rasio-1)*0.8+0.15);
  const cx=W*0.26, yTop=H*0.14, yBot=H*0.88, sk=(yBot-yTop), tebal=Math.max(4,h*sk/L*2);
  // tumpuan sendi
  ctx.fillStyle='rgba(148,163,184,.8)'; [yTop,yBot].forEach(y=>{ctx.beginPath(); ctx.arc(cx,y,4,0,Math.PI*2); ctx.fill();});
  ctx.strokeStyle='rgba(148,163,184,.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx-40,yBot+6); ctx.lineTo(cx+40,yBot+6); ctx.stroke();
  // kolom
  ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,yTop); ctx.lineTo(cx,yBot); ctx.stroke(); ctx.setLineDash([]);
  const A0=amp*W*0.07, goyang=amp?1+0.05*Math.sin(_c9tkFrame/6):1;
  ctx.strokeStyle=rasio<1?'#22d3ee':'#ef4444'; ctx.lineWidth=tebal; ctx.lineCap='round'; ctx.beginPath();
  for(let i=0;i<=40;i++){const u=i/40; const x=cx+A0*goyang*Math.sin(Math.PI*u), y=yBot-(yBot-yTop)*u; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); ctx.lineCap='butt';
  // beban
  const pj=14+50*Math.min(1,P/30000); _cad9Panah(ctx,cx,yTop-pj-6,cx,yTop-6,'#f59e0b',2.4);
  ctx.fillStyle='#f59e0b'; ctx.font="bold 11px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('P = '+P.toFixed(0)+' N',cx+12,yTop-pj/2);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('L = '+L+' · '+b+' × '+h.toFixed(1)+' (h sumbu lemah)',cx+14,(yTop+yBot)/2);
  // meter P/P_cr
  const mx=W*0.50, my=H*0.22, mw=W*0.10, mh=H*0.56;
  ctx.strokeStyle='rgba(226,232,240,.5)'; ctx.lineWidth=1; ctx.strokeRect(mx,my,mw,mh);
  const isi=Math.min(1,rasio/2)*mh; ctx.fillStyle=rasio<1?'rgba(34,211,238,.6)':'rgba(239,68,68,.7)'; ctx.fillRect(mx,my+mh-isi,mw,isi);
  ctx.strokeStyle='#ef4444'; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(mx-6,my+mh/2); ctx.lineTo(mx+mw+6,my+mh/2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#ef4444'; ctx.textAlign='left'; ctx.fillText('P_cr',mx+mw+8,my+mh/2+4); ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('2·P_cr',mx+mw+8,my+4); ctx.fillText('0',mx+mw+8,my+mh+4);
  ctx.fillStyle='rgba(226,232,240,.9)'; ctx.textAlign='center'; ctx.fillText('P / P_cr',mx+mw/2,my-8);
  // teks kanan
  const tx=W*0.68; ctx.textAlign='left'; ctx.font="11px 'JetBrains Mono',monospace";
  ctx.fillStyle='#22d3ee'; ctx.fillText('I = bh³/12 = '+I.toFixed(1)+' mm⁴',tx,H*0.22);
  ctx.fillText('P_cr = π²EI/L²',tx,H*0.22+20); ctx.fillStyle='#00e09e'; ctx.fillText('= '+Pcr.toFixed(1)+' N',tx,H*0.22+40);
  ctx.fillStyle=rasio<1?'#00e09e':'#ef4444'; ctx.fillText('SF tekuk = P_cr/P = '+(Pcr/P).toFixed(2)+(rasio>=1?' → tekuk!':''),tx,H*0.22+66);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillText('σ = P/A = '+(P/A).toFixed(1)+' MPa (σ_y 250)',tx,H*0.22+88); ctx.fillText('σ_cr = P_cr/A = '+(Pcr/A).toFixed(1)+' MPa'+(Pcr/A<_C9SY?' → elastis':' > σ_y: bukan Euler'),tx,H*0.22+106);
  ctx.fillText('kelangsingan λ = L/r = '+lam.toFixed(0)+' (r = h/√12)',tx,H*0.22+124);
  ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(rasio<1?'P < P_cr: kolom tetap lurus, von Mises kecil':'P ≥ P_cr: kolom menekuk pada sumbu lemah walau σ ≪ σ_y',12,18);
  _ttlTulis('infoTekuk','I sumbu lemah = '+b+'·'+h.toFixed(1)+'³/12 = '+I.toFixed(2)+' mm⁴; P_cr = π²·210000·'+I.toFixed(2)+'/'+L+'² = '+Pcr.toFixed(1)+' N; pada P = '+Ps.toFixed(0)+' N, SF tekuk = '+(Pcr/Ps).toFixed(3)+' dan tegangan hanya '+(Ps/A).toFixed(2)+' MPa — CalculiX Buckling memberi buckling factor ≈ P_cr/P yang dibandingkan dengan Euler.');
  if(_ttlJalan('tekuk')){_c9tkFrame++; requestAnimationFrame(drawTekuk);}
}

_TTL_DAFTAR.push(['cvKonturVM',()=>drawKonturVM(),'konturvm',['sl_vm_F','sl_vm_L','sl_vm_h']]);
_TTL_DAFTAR.push(['cvKonvergensi',()=>drawKonvergensi(),'konvergensi',['sl_kv_tingkat','sl_kv_orde']]);
_TTL_DAFTAR.push(['cvKtLubang',()=>drawKtLubang(),'ktlubang',['sl_kt_d','sl_kt_W','sl_kt_F']]);
_TTL_DAFTAR.push(['cvTekuk',()=>drawTekuk(),'tekuk',['sl_tk_L','sl_tk_h','sl_tk_P']]);
_ttlMulai();
