// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 14 TEKNIK TENAGA LISTRIK — Metode Analisis Aliran Daya (Load Flow)
// Kanvas: cvYbus, cvDuaBus, cvGaussSeidel, cvNewton
// ════════════════════════════════════════════════════════════
const _DEG14=Math.PI/180;
const _c14={add:(a,b)=>[a[0]+b[0],a[1]+b[1]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1]],mul:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div:(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];},conj:a=>[a[0],-a[1]],abs:a=>Math.hypot(a[0],a[1]),ang:a=>Math.atan2(a[1],a[0])/_DEG14,pol:(m,d)=>[m*Math.cos(d*_DEG14),m*Math.sin(d*_DEG14)]};
function _sumbu14(ctx,padL,padT,plotW,plotH){
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2);
  _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)';
}

// ── ANIMASI 1 — Menyusun Y_bus tiga bus dengan aturan inspeksi ──
let _ybFrame=0;
function toggleYbus(){_ttlToggle('ybus','btnYbus',drawYbus);}
window.toggleYbus=toggleYbus;
function drawYbus(){
  const k=_ttlKanvas('cvYbus'); if(!k) return; const {ctx,W,H}=k;
  const x12=_ttlNilai('sl_yb_x12',0.1), x13=_ttlNilai('sl_yb_x13',0.25), x23=_ttlNilai('sl_yb_x23',0.2), r=_ttlNilai('sl_yb_r',0), bsh=_ttlNilai('sl_yb_b',0);
  _ttlTulis('v_yb_x12',x12.toFixed(2)); _ttlTulis('v_yb_x13',x13.toFixed(2)); _ttlTulis('v_yb_x23',x23.toFixed(2)); _ttlTulis('v_yb_r',r.toFixed(2)); _ttlTulis('v_yb_b',bsh.toFixed(2));
  const y=(x)=>_c14.div([1,0],[r*x,x]); // admitansi cabang dengan R = r·X
  const y12=y(x12), y13=y(x13), y23=y(x23);
  const Y=[[_c14.add(_c14.add(y12,y13),[0,2*bsh]),_c14.mul([-1,0],y12),_c14.mul([-1,0],y13)],[_c14.mul([-1,0],y12),_c14.add(_c14.add(y12,y23),[0,2*bsh]),_c14.mul([-1,0],y23)],[_c14.mul([-1,0],y13),_c14.add(_c14.add(y13,y23),[0,2*bsh]),_c14.mul([-1,0],y23)]];
  Y[2]=[_c14.mul([-1,0],y13),_c14.mul([-1,0],y23),_c14.add(_c14.add(y13,y23),[0,2*bsh])];
  // gambar jaringan segitiga kiri
  const bx=[90,230,160], by=[70,70,190];
  const sorot=Math.floor((_ybFrame/50)%3); // bus yang sedang "diinspeksi"
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='center';
  const cab=[[0,1,x12,'1–2'],[0,2,x13,'1–3'],[1,2,x23,'2–3']];
  cab.forEach(([a,b,x,l])=>{const aktif=(a===sorot||b===sorot); _ttlGaris(ctx,bx[a],by[a],bx[b],by[b],aktif?'rgba(0,229,255,.95)':'rgba(148,163,184,.5)',aktif?2.6:1.6); ctx.fillStyle=aktif?'rgba(0,229,255,.95)':'rgba(148,163,184,.8)'; ctx.fillText('z '+l+' = '+(r*x).toFixed(3)+' + j'+x.toFixed(2),(bx[a]+bx[b])/2+(l==='1–2'?0:l==='1–3'?-58:58),(by[a]+by[b])/2+(l==='1–2'?-8:4));});
  for(let i=0;i<3;i++){const a=0.5+0.5*Math.sin(_ybFrame*0.15); ctx.fillStyle=i===sorot?'rgba(255,179,0,'+(0.6+0.4*a).toFixed(2)+')':'rgba(226,232,240,.9)'; ctx.beginPath(); ctx.arc(bx[i],by[i],11,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#020812'; ctx.fillText(String(i+1),bx[i],by[i]+4); if(bsh>0){ctx.fillStyle='rgba(168,85,247,.9)'; ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillText('jB/2 ×2',bx[i]+(i===2?0:i===0?-34:34),by[i]+(i===2?24:-16)); ctx.font="600 10px 'JetBrains Mono',monospace";}}
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('inspeksi bus '+(sorot+1)+': Y_'+(sorot+1)+(sorot+1)+' = Σ y terhubung'+(bsh>0?' + jB shunt':''),160,236);
  // matriks kanan
  const mx=330, my=44, cw=(W-mx-20)/3, rh=52;
  ctx.fillStyle='rgba(226,232,240,.95)'; ctx.textAlign='left'; ctx.fillText('Y_bus (pu):',mx,my-16);
  for(let i=0;i<3;i++) for(let j=0;j<3;j++){const v=Y[i][j]; const diag=i===j; const sor=(i===sorot||j===sorot); ctx.fillStyle=diag?(sor?'rgba(255,179,0,.18)':'rgba(255,179,0,.08)'):(sor?'rgba(0,229,255,.14)':'rgba(0,229,255,.05)'); ctx.fillRect(mx+j*cw,my+i*rh,cw-4,rh-4); ctx.fillStyle=diag?'rgba(255,179,0,.95)':'rgba(0,229,255,.95)'; ctx.textAlign='center'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText((v[0]>=0?'':'−')+Math.abs(v[0]).toFixed(2)+(v[1]>=0?' + j':' − j')+Math.abs(v[1]).toFixed(2),mx+j*cw+cw/2-2,my+i*rh+rh/2+4); ctx.font="9px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.8)'; ctx.fillText('|Y'+(i+1)+(j+1)+'| = '+_c14.abs(v).toFixed(3),mx+j*cw+cw/2-2,my+i*rh+rh/2+18);}
  ctx.textAlign='left'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('diagonal (kuning) = Σ y_ij + y_shunt;  luar-diagonal (cyan) = −y_ij;  simetris',mx,my+3*rh+12);
  const jumlahBaris=_c14.add(_c14.add(Y[0][0],Y[0][1]),Y[0][2]);
  _ttlTulis('ybusInfo','y₁₂ = 1/z₁₂ = '+y12[0].toFixed(3)+' '+(y12[1]<0?'−':'+')+' j'+Math.abs(y12[1]).toFixed(3)+', y₁₃ = '+y13[0].toFixed(3)+' '+(y13[1]<0?'−':'+')+' j'+Math.abs(y13[1]).toFixed(3)+', y₂₃ = '+y23[0].toFixed(3)+' '+(y23[1]<0?'−':'+')+' j'+Math.abs(y23[1]).toFixed(3)+' pu   |   Y₁₁ = y₁₂ + y₁₃'+(bsh>0?' + j2B/2':'')+' = '+Y[0][0][0].toFixed(3)+' '+(Y[0][0][1]<0?'−':'+')+' j'+Math.abs(Y[0][0][1]).toFixed(3)+'; Y₁₂ = −y₁₂   |   pemeriksaan: jumlah baris 1 = '+jumlahBaris[0].toFixed(3)+' + j'+jumlahBaris[1].toFixed(3)+(bsh>0?' (≠ 0 karena ada shunt)':' (= 0 tanpa shunt: tidak ada admitansi ke tanah)')+'   |   R = '+r.toFixed(2)+' × X: makin besar R, elemen makin "miring" dari sumbu imajiner');
  if(_ttlJalan('ybus')){_ybFrame++; requestAnimationFrame(drawYbus);}
}

// ── ANIMASI 2 — Persamaan aliran daya dua bus: P dan Q terhadap δ dan |V| ──
let _dbFrame=0;
function toggleDuaBus(){_ttlToggle('duabus','btnDuaBus',drawDuaBus);}
window.toggleDuaBus=toggleDuaBus;
function drawDuaBus(){
  const k=_ttlKanvas('cvDuaBus'); if(!k) return; const {ctx,W,H}=k;
  const v2=_ttlNilai('sl_db_v2',0.96), x=_ttlNilai('sl_db_x',0.2), rr=_ttlNilai('sl_db_r',0.02), dmax=_ttlNilai('sl_db_dmax',40);
  _ttlTulis('v_db_v2',v2.toFixed(2)); _ttlTulis('v_db_x',x.toFixed(2)); _ttlTulis('v_db_r',rr.toFixed(3)); _ttlTulis('v_db_dmax',dmax.toFixed(0));
  const V1=[1,0], Z=[rr,x];
  const aliran=(d)=>{const V2=_c14.pol(v2,-d); const I=_c14.div(_c14.sub(V1,V2),Z); const S1=_c14.mul(V1,_c14.conj(I)); const S2=_c14.mul(V2,_c14.conj(I)); return {P1:S1[0],Q1:S1[1],P2:S2[0],Q2:S2[1],loss:S1[0]-S2[0]};};
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  let pmax=0; for(let i=0;i<=100;i++){const a=aliran(dmax*i/100); pmax=Math.max(pmax,Math.abs(a.P1),Math.abs(a.Q1),Math.abs(a.Q2));}
  pmax=Math.ceil(pmax*10)/10; const pmin=-pmax*0.6;
  const X=d=>padL+d/dmax*plotW, Y=p=>padT+plotH-(p-pmin)/(pmax-pmin)*plotH;
  _sumbu14(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const p=pmin+(pmax-pmin)*i/4; _ttlGaris(ctx,padL,Y(p),padL+plotW,Y(p),'rgba(148,163,184,.12)',1); ctx.fillText(p.toFixed(2),padL-4,Y(p)+4);} _ttlGaris(ctx,padL,Y(0),padL+plotW,Y(0),'rgba(226,232,240,.4)',1);
  ctx.textAlign='center'; for(let i=0;i<=4;i++) ctx.fillText((dmax*i/4).toFixed(0)+'°',X(dmax*i/4),padT+plotH+16);
  const kurva=(f,warna,lebar,dash)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.setLineDash(dash||[]); ctx.beginPath(); for(let i=0;i<=100;i++){const d=dmax*i/100; const yy=Y(f(aliran(d))); i?ctx.lineTo(X(d),yy):ctx.moveTo(X(d),yy);} ctx.stroke(); ctx.setLineDash([]);};
  kurva(a=>a.P1,'rgba(0,224,158,.95)',2.4); kurva(a=>a.P2,'rgba(0,224,158,.6)',1.4,[4,3]); kurva(a=>a.Q1,'rgba(255,179,0,.95)',2); kurva(a=>a.Q2,'rgba(255,179,0,.6)',1.4,[4,3]); kurva(a=>a.loss*10,'rgba(239,68,68,.9)',1.6);
  const d=(_dbFrame*0.25)%dmax; const a=aliran(d);
  _ttlGaris(ctx,X(d),padT,X(d),padT+plotH,'rgba(255,255,255,.5)',1,[3,3]);
  [[a.P1,'rgba(0,224,158,.95)'],[a.Q1,'rgba(255,179,0,.95)'],[a.loss*10,'rgba(239,68,68,.95)']].forEach(([v,w])=>{ctx.fillStyle=w; ctx.beginPath(); ctx.arc(X(d),Y(v),4.5,0,Math.PI*2); ctx.fill();});
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('P₁ kirim (tebal) / P₂ terima (putus): δ = '+d.toFixed(1)+'° → '+a.P1.toFixed(3)+' / '+a.P2.toFixed(3)+' pu',padL+6,padT+12);
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('Q₁ kirim / Q₂ terima: '+a.Q1.toFixed(3)+' / '+a.Q2.toFixed(3)+' pu',padL+6,padT+26);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('rugi × 10: '+(a.loss).toFixed(4)+' pu',padL+6,padT+40);
  const pIdeal=v2*Math.sin(d*_DEG14)/x;
  _ttlTulis('duaBusInfo','V₁ = 1∠0, |V₂| = '+v2.toFixed(2)+', Z = '+rr.toFixed(3)+' + j'+x.toFixed(2)+' pu   |   δ = '+d.toFixed(1)+'°: P₁ = '+a.P1.toFixed(4)+', P₂ = '+a.P2.toFixed(4)+' (rugi '+a.loss.toFixed(4)+'), Q₁ = '+a.Q1.toFixed(4)+', Q₂ = '+a.Q2.toFixed(4)+' pu   |   tanpa rugi: P = V₁V₂ sin δ/X = '+pIdeal.toFixed(4)+', Q₂ = (V₁V₂ cos δ − V₂²)/X = '+((v2*Math.cos(d*_DEG14)-v2*v2)/x).toFixed(4)+' pu   |   P bergantung δ (sinus), Q bergantung |V| dan cos δ: dasar decoupling P–δ / Q–V; batas statis pada δ = 90°');
  if(_ttlJalan('duabus')){_dbFrame++; requestAnimationFrame(drawDuaBus);}
}

// ── ANIMASI 3 — Iterasi Gauss–Seidel pada sistem tiga bus ──
let _gsFrame=0;
function toggleGaussSeidel(){_ttlToggle('gaussseidel','btnGaussSeidel',drawGaussSeidel);}
window.toggleGaussSeidel=toggleGaussSeidel;
function drawGaussSeidel(){
  const k=_ttlKanvas('cvGaussSeidel'); if(!k) return; const {ctx,W,H}=k;
  const p2=_ttlNilai('sl_gs_p2',0.8), q2=_ttlNilai('sl_gs_q2',0.4), p3=_ttlNilai('sl_gs_p3',0.6), alpha=_ttlNilai('sl_gs_alpha',1.0), nIter=Math.round(_ttlNilai('sl_gs_n',12));
  _ttlTulis('v_gs_p2',p2.toFixed(2)); _ttlTulis('v_gs_q2',q2.toFixed(2)); _ttlTulis('v_gs_p3',p3.toFixed(2)); _ttlTulis('v_gs_alpha',alpha.toFixed(2)); _ttlTulis('v_gs_n',nIter.toFixed(0));
  // jaringan: z12 = j0,1, z13 = j0,25, z23 = j0,2 (tanpa R); bus 1 slack 1∠0; bus 2, 3 PQ (beban)
  const y12=[0,-10], y13=[0,-4], y23=[0,-5];
  const Y=[[_c14.add(y12,y13),_c14.mul([-1,0],y12),_c14.mul([-1,0],y13)],[_c14.mul([-1,0],y12),_c14.add(y12,y23),_c14.mul([-1,0],y23)],[_c14.mul([-1,0],y13),_c14.mul([-1,0],y23),_c14.add(y13,y23)]];
  const S=[null,[-p2,-q2],[-p3,-0.3]];
  let V=[[1,0],[1,0],[1,0]]; const hist=[[1,1]]; const mism=[];
  for(let it=0;it<nIter;it++){
    for(let i=1;i<3;i++){let sum=[0,0]; for(let j=0;j<3;j++) if(j!==i) sum=_c14.add(sum,_c14.mul(Y[i][j],V[j])); const term=_c14.div(_c14.conj(S[i]),_c14.conj(V[i])); const vNew=_c14.div(_c14.sub(term,sum),Y[i][i]); V[i]=_c14.add(V[i],_c14.mul([alpha,0],_c14.sub(vNew,V[i])));}
    hist.push([_c14.abs(V[1]),_c14.abs(V[2])]);
    // mismatch P2
    let I2=[0,0]; for(let j=0;j<3;j++) I2=_c14.add(I2,_c14.mul(Y[1][j],V[j])); const S2c=_c14.mul(V[1],_c14.conj(I2)); mism.push(Math.abs(S2c[0]-S[1][0]));
  }
  const padL=60,padR=190,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=Math.min(0.85,Math.floor(Math.min(...hist.map(h=>Math.min(h[0],h[1])))*20)/20), vmax=1.01;
  const X=i=>padL+i/nIter*plotW, Y2=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  _sumbu14(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=vmin+(vmax-vmin)*i/4; _ttlGaris(ctx,padL,Y2(v),padL+plotW,Y2(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(3),padL-4,Y2(v)+4);}
  ctx.textAlign='center'; for(let i=0;i<=nIter;i+=Math.max(1,Math.round(nIter/6))) ctx.fillText('it '+i,X(i),padT+plotH+16);
  const tampil=Math.min(nIter,Math.floor((_gsFrame/25)%(nIter+8)));
  [[0,'rgba(0,229,255,.95)','|V₂|'],[1,'rgba(255,179,0,.95)','|V₃|']].forEach(([idx,w,l])=>{ctx.strokeStyle=w; ctx.lineWidth=2.2; ctx.beginPath(); for(let i=0;i<=tampil;i++){const yy=Y2(Math.max(vmin,hist[i][idx])); i?ctx.lineTo(X(i),yy):ctx.moveTo(X(i),yy);} ctx.stroke(); for(let i=0;i<=tampil;i++){ctx.fillStyle=w; ctx.beginPath(); ctx.arc(X(i),Y2(Math.max(vmin,hist[i][idx])),3,0,Math.PI*2); ctx.fill();} ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle=w; ctx.fillText(l+' → '+hist[tampil][idx].toFixed(5),X(Math.min(tampil,nIter))+6,Y2(Math.max(vmin,hist[tampil][idx]))+(idx?12:-6));});
  // panel kanan: mismatch log
  const lx=padL+plotW+16; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(226,232,240,.95)'; ctx.fillText('|ΔP₂| tiap iterasi',lx,padT+4);
  ctx.font="10px 'JetBrains Mono',monospace"; const mulai=Math.max(0,tampil-9); for(let i=mulai;i<tampil;i++){ctx.fillStyle=mism[i]<1e-4?'rgba(0,224,158,.95)':'rgba(148,163,184,.85)'; ctx.fillText('it '+(i+1)+': '+mism[i].toExponential(2),lx,padT+20+(i-mulai)*15);}
  const konv=mism.findIndex(m=>m<1e-4);
  ctx.fillStyle=konv>=0?'rgba(0,224,158,.95)':'rgba(239,68,68,.95)'; ctx.fillText(konv>=0?'konvergen (<1e-4) pada it '+(konv+1):'belum konvergen dalam '+nIter+' it',lx,padT+plotH+2);
  _ttlTulis('gaussSeidelInfo','Tiga bus: z₁₂ = j0,1, z₁₃ = j0,25, z₂₃ = j0,2; bus 1 slack 1∠0; bus 2 beban '+p2.toFixed(2)+' + j'+q2.toFixed(2)+'; bus 3 beban '+p3.toFixed(2)+' + j0,30 pu; α = '+alpha.toFixed(2)+'   |   setelah '+nIter+' iterasi: V₂ = '+_c14.abs(V[1]).toFixed(5)+'∠'+_c14.ang(V[1]).toFixed(2)+'°, V₃ = '+_c14.abs(V[2]).toFixed(5)+'∠'+_c14.ang(V[2]).toFixed(2)+'°; |ΔP₂| = '+mism[nIter-1].toExponential(2)+'   |   '+(konv>=0?'toleransi 10⁻⁴ dicapai pada iterasi '+(konv+1):'perlu lebih banyak iterasi atau α lebih besar')+'   |   α 1,4–1,6 biasanya mempercepat; α > 1,8 dapat berosilasi; beban terlalu besar → tidak konvergen (batas statis)');
  if(_ttlJalan('gaussseidel')){_gsFrame++; requestAnimationFrame(drawGaussSeidel);}
}

// ── ANIMASI 4 — Newton–Raphson vs Gauss–Seidel pada masalah dua bus ──
let _nrFrame=0;
function toggleNewton(){_ttlToggle('newton','btnNewton',drawNewton);}
window.toggleNewton=toggleNewton;
function drawNewton(){
  const k=_ttlKanvas('cvNewton'); if(!k) return; const {ctx,W,H}=k;
  const p=_ttlNilai('sl_nr_p',1.2), x=_ttlNilai('sl_nr_x',0.3), d0=_ttlNilai('sl_nr_d0',0), v2=_ttlNilai('sl_nr_v2',1.0);
  _ttlTulis('v_nr_p',p.toFixed(2)); _ttlTulis('v_nr_x',x.toFixed(2)); _ttlTulis('v_nr_d0',d0.toFixed(0)); _ttlTulis('v_nr_v2',v2.toFixed(2));
  const f=d=>v2*Math.sin(d*_DEG14)/x; const fp=d=>v2*Math.cos(d*_DEG14)/x; // P(δ), dP/dδ (per rad)
  const pmaks=v2/x; const layak=p<pmaks;
  // iterasi NR
  const nr=[d0]; for(let i=0;i<8;i++){const d=nr[nr.length-1]; const dd=(p-f(d))/fp(d)/_DEG14; let dn=d+dd; if(!isFinite(dn)) break; dn=Math.max(-89,Math.min(89,dn)); nr.push(dn); if(Math.abs(p-f(dn))<1e-8) break;}
  // "GS" sederhana untuk dua bus: δ_{k+1} = asin(P X / V2) tidak iteratif; pakai iterasi titik tetap δ = δ + 0,3 (P − f(δ))·X (linear lambat)
  const gs=[d0]; for(let i=0;i<40;i++){const d=gs[gs.length-1]; const dn=d+(p-f(d))*x*0.4/_DEG14*0.5; gs.push(Math.max(-89,Math.min(89,dn))); if(Math.abs(p-f(dn))<1e-6) break;}
  const padL=60,padR=200,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const dmin=-10,dmax=95; const X=d=>padL+(d-dmin)/(dmax-dmin)*plotW, Yp=v=>padT+plotH-v/(pmaks*1.15)*plotH;
  _sumbu14(ctx,padL,padT,plotW,plotH);
  ctx.textAlign='right'; for(let i=0;i<=4;i++){const v=pmaks*1.15*i/4; _ttlGaris(ctx,padL,Yp(v),padL+plotW,Yp(v),'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(2),padL-4,Yp(v)+4);}
  ctx.textAlign='center'; for(const d of [0,30,60,90]) ctx.fillText(d+'°',X(d),padT+plotH+16);
  ctx.strokeStyle='rgba(0,229,255,.9)'; ctx.lineWidth=2.2; ctx.beginPath(); for(let i=0;i<=100;i++){const d=dmin+(dmax-dmin)*i/100; const yy=Yp(Math.max(0,f(d))); i?ctx.lineTo(X(d),yy):ctx.moveTo(X(d),yy);} ctx.stroke();
  _ttlGaris(ctx,padL,Yp(p),padL+plotW,Yp(p),layak?'rgba(0,224,158,.9)':'rgba(239,68,68,.9)',1.6,[6,4]);
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle=layak?'rgba(0,224,158,.95)':'rgba(239,68,68,.95)'; ctx.fillText('P terjadwal '+p.toFixed(2)+' pu'+(layak?'':' > P_maks '+pmaks.toFixed(2)+': tidak ada solusi'),padL+6,Yp(p)-6);
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('P(δ) = V₂ sin δ/X',padL+6,padT+12);
  // langkah NR bertahap: garis singgung
  const langkah=Math.min(nr.length-1,Math.floor((_nrFrame/40)%(nr.length+3)));
  for(let i=0;i<langkah;i++){const d=nr[i], dn=nr[i+1]; ctx.strokeStyle='rgba(255,179,0,'+(i===langkah-1?0.95:0.5)+')'; ctx.lineWidth=i===langkah-1?2:1.2; ctx.beginPath(); ctx.moveTo(X(d),Yp(f(d))); ctx.lineTo(X(dn),Yp(p)); ctx.stroke(); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(X(d),Yp(f(d)),4,0,Math.PI*2); ctx.fill(); _ttlGaris(ctx,X(dn),Yp(p),X(dn),Yp(f(dn)),'rgba(255,179,0,.6)',1,[2,2]);}
  if(langkah<nr.length){ctx.fillStyle='rgba(255,179,0,.95)'; ctx.beginPath(); ctx.arc(X(nr[langkah]),Yp(f(nr[langkah])),5,0,Math.PI*2); ctx.fill();}
  // panel kanan
  const lx=padL+plotW+16; ctx.textAlign='left'; ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('Newton–Raphson: δ_k',lx,padT+4); ctx.font="10px 'JetBrains Mono',monospace";
  nr.slice(0,Math.min(nr.length,8)).forEach((d,i)=>{ctx.fillStyle=i<=langkah?'rgba(255,179,0,.95)':'rgba(148,163,184,.4)'; ctx.fillText('k='+i+': '+d.toFixed(5)+'°  ΔP='+(p-f(d)).toExponential(1),lx,padT+20+i*14);});
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('iterasi titik-tetap (GS): '+(gs.length-1)+' langkah',lx,padT+140); ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('δ akhir '+gs[gs.length-1].toFixed(4)+'°',lx,padT+155);
  const dSol=layak?Math.asin(p*x/v2)/_DEG14:NaN;
  _ttlTulis('newtonInfo','Dua bus tanpa rugi: P = V₂ sin δ/X dengan V₂ = '+v2.toFixed(2)+', X = '+x.toFixed(2)+' (P_maks = '+pmaks.toFixed(3)+' pu pada δ = 90°); target P = '+p.toFixed(2)+' pu, tebakan δ⁽⁰⁾ = '+d0+'°   |   '+(layak?'solusi eksak δ = asin(PX/V₂) = '+dSol.toFixed(4)+'°; NR: '+nr.map(d=>d.toFixed(3)).join(' → ')+' ('+(nr.length-1)+' iterasi, konvergensi kuadratis: kesalahan dikuadratkan tiap langkah); iterasi titik-tetap perlu '+(gs.length-1)+' langkah (linear)':'P melampaui batas statis: NR melompat-lompat/menyimpang, GS tidak konvergen — inilah tanda sistem tidak mampu menyalurkan daya itu (perlu kompensasi atau saluran tambahan)')+'   |   Jacobian J = ∂P/∂δ = V₂ cos δ/X mengecil mendekati 90°: langkah NR membesar dan mudah melompat');
  if(_ttlJalan('newton')){_nrFrame++; requestAnimationFrame(drawNewton);}
}

_TTL_DAFTAR.push(['cvYbus',()=>drawYbus(),'ybus',['sl_yb_x12','sl_yb_x13','sl_yb_x23','sl_yb_r','sl_yb_b']]);
_TTL_DAFTAR.push(['cvDuaBus',()=>drawDuaBus(),'duabus',['sl_db_v2','sl_db_x','sl_db_r','sl_db_dmax']]);
_TTL_DAFTAR.push(['cvGaussSeidel',()=>drawGaussSeidel(),'gaussseidel',['sl_gs_p2','sl_gs_q2','sl_gs_p3','sl_gs_alpha','sl_gs_n']]);
_TTL_DAFTAR.push(['cvNewton',()=>drawNewton(),'newton',['sl_nr_p','sl_nr_x','sl_nr_d0','sl_nr_v2']]);
_ttlMulai();
