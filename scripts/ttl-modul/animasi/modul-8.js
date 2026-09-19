// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 8 TEKNIK TENAGA LISTRIK — Sistem Tenaga Listrik Saluran Transmisi
// Kanvas: cvRugiTegangan, cvIsolator, cvAndongan, cvKorona
// ════════════════════════════════════════════════════════════
const _SQ3_8=Math.sqrt(3);

// ── ANIMASI 1 — Rugi daya terhadap tingkat tegangan ──
let _rtFrame=0;
function toggleRugiTegangan(){_ttlToggle('rugitegangan','btnRugiTegangan',drawRugiTegangan);}
window.toggleRugiTegangan=toggleRugiTegangan;
function drawRugiTegangan(){
  const k=_ttlKanvas('cvRugiTegangan'); if(!k) return; const {ctx,W,H}=k;
  const P=_ttlNilai('sl_rt_p',300), L=_ttlNilai('sl_rt_l',120), r=_ttlNilai('sl_rt_r',0.08), pf=_ttlNilai('sl_rt_pf',0.9);
  _ttlTulis('v_rt_p',P.toFixed(0)); _ttlTulis('v_rt_l',L.toFixed(0)); _ttlTulis('v_rt_r',r.toFixed(3)); _ttlTulis('v_rt_pf',pf.toFixed(2));
  const R=r*L, tingkat=[[70,'rgba(239,68,68,.85)'],[150,'rgba(255,179,0,.85)'],[275,'rgba(0,229,255,.85)'],[500,'rgba(0,224,158,.85)']];
  const hasil=tingkat.map(([V,c])=>{const I=P*1e6/(_SQ3_8*V*1e3*pf); const loss=3*I*I*R/1e6; return {V,c,I,loss,eta:P/(P+loss)*100};});
  const padL=70,padR=30,padT=30,padB=40,plotW=W-padL-padR,plotH=H-padT-padB;
  const maks=Math.max(...hasil.map(h=>Math.min(h.loss,P*1.5)))*1.15||1;
  const bw=plotW/4*0.6, fase=Math.min(1,(_rtFrame%120)/60);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='right'; ctx.fillStyle='rgba(148,163,184,.7)';
  for(let i=0;i<=4;i++){const v=maks*i/4, y=padT+plotH-v/maks*plotH; _ttlGaris(ctx,padL,y,padL+plotW,y,'rgba(148,163,184,.12)',1); ctx.fillText(v.toFixed(1)+' MW',padL-4,y+4);}
  hasil.forEach((h,i)=>{
    const x=padL+plotW/4*(i+0.5)-bw/2, val=Math.min(h.loss,P*1.5), hh=val/maks*plotH*fase;
    ctx.fillStyle=h.loss>0.1*P?'rgba(239,68,68,.85)':h.c; ctx.fillRect(x,padT+plotH-hh,bw,hh);
    ctx.fillStyle='#e2e8f0'; ctx.textAlign='center'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(h.loss.toFixed(1)+' MW ('+(h.loss/P*100).toFixed(1)+' %)',x+bw/2,padT+plotH-hh-6);
    ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText(h.V+' kV',x+bw/2,padT+plotH+14); ctx.fillText('I = '+h.I.toFixed(0)+' A · η '+h.eta.toFixed(1)+' %',x+bw/2,padT+plotH+27);
  });
  ctx.textAlign='left'; ctx.fillStyle='rgba(148,163,184,.9)'; ctx.fillText('R = '+R.toFixed(2)+' Ω per fasa; merah = rugi > 10 % daya',padL,padT-10);
  _ttlTulis('rugiTeganganInfo',hasil.map(h=>h.V+' kV: I = '+h.I.toFixed(1)+' A, rugi = '+h.loss.toFixed(2)+' MW ('+(h.loss/P*100).toFixed(2)+' %)').join('   |   ')+'   |   rugi ∝ 1/V²: 150→500 kV membagi rugi '+((500/150)**2).toFixed(1)+' kali');
  if(_ttlJalan('rugitegangan')){_rtFrame++; requestAnimationFrame(drawRugiTegangan);}
}

// ── ANIMASI 2 — Distribusi tegangan pada rentengan isolator ──
let _isFrame=0;
function toggleIsolator(){_ttlToggle('isolator','btnIsolator',drawIsolator);}
window.toggleIsolator=toggleIsolator;
function drawIsolator(){
  const k=_ttlKanvas('cvIsolator'); if(!k) return; const {ctx,W,H}=k;
  const n=Math.round(_ttlNilai('sl_is_n',5)), kk=_ttlNilai('sl_is_k',0.11), VL=_ttlNilai('sl_is_v',150);
  _ttlTulis('v_is_n',n.toFixed(0)); _ttlTulis('v_is_k',kk.toFixed(2)); _ttlTulis('v_is_v',VL.toFixed(0));
  // rekursi: V(i+1) = V(i)(1+k) + k·Σ_{j<i} V(j)... bentuk baku: V_{m+1} = (1+k)V_m + k Σ_{j=1}^{m-1} V_j
  const V=[1]; for(let m=1;m<n;m++){let s=0; for(let j=0;j<m-1;j++) s+=V[j]; V.push((1+kk)*V[m-1]+kk*s);}
  const tot=V.reduce((a,b)=>a+b,0), Vfasa=VL/_SQ3_8, sk=Vfasa/tot;
  const volt=V.map(v=>v*sk), vmax=Math.max(...volt), eff=Vfasa/(n*vmax)*100;
  // gambar rentengan di kiri (menara di atas, konduktor di bawah)
  const x0=80, yTop=24, tinggi=H-60, dy=tinggi/n;
  _ttlGaris(ctx,x0-40,yTop,x0+40,yTop,'rgba(148,163,184,.9)',4); ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('lengan menara',x0,yTop-8);
  const fase=(Math.sin(_isFrame*0.05)+1)/2;
  for(let i=0;i<n;i++){
    const y=yTop+dy*(i+0.5); const idx=n-1-i; // piring teratas = V[0] (terjauh dari konduktor)
    const rel=volt[idx]/vmax; const warna='rgba('+Math.round(80+175*rel)+','+Math.round(200-120*rel)+',120,'+(0.6+0.4*fase*rel).toFixed(2)+')';
    ctx.fillStyle=warna; ctx.beginPath(); ctx.ellipse(x0,y,26,dy*0.32,0,0,Math.PI*2); ctx.fill();
    _ttlGaris(ctx,x0,y+dy*0.32,x0,y+dy*0.5,'rgba(148,163,184,.8)',2);
    ctx.fillStyle='#e2e8f0'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('piring '+(idx+1)+': '+volt[idx].toFixed(2)+' kV ('+(volt[idx]/Vfasa*100).toFixed(1)+' %)',x0+36,y+4);
  }
  _ttlGaris(ctx,x0,yTop+tinggi,x0+60,yTop+tinggi,'rgba(255,179,0,.95)',3); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.textAlign='left'; ctx.fillText('konduktor '+VL+' kV (fasa '+Vfasa.toFixed(1)+' kV)',x0+66,yTop+tinggi+4);
  // kanan: batang distribusi
  const bx=Math.max(x0+330,W*0.55), bw2=W-bx-20, by=30, bh=H-70;
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Tegangan tiap piring (kV) · piring 1 = terdekat konduktor',bx+bw2/2,by-10);
  const wb=bw2/n*0.7;
  for(let i=0;i<n;i++){const idx=n-1-i; const hh=volt[idx]/vmax*bh; const x=bx+bw2/n*(i+0.5)-wb/2; ctx.fillStyle=idx===n-1?'rgba(239,68,68,.85)':'rgba(0,229,255,.8)'; ctx.fillRect(x,by+bh-hh,wb,hh); ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(volt[idx].toFixed(1),x+wb/2,by+bh-hh-4); ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('#'+(idx+1),x+wb/2,by+bh+12);}
  _ttlGaris(ctx,bx,by+bh-Vfasa/n/vmax*bh,bx+bw2,by+bh-Vfasa/n/vmax*bh,'rgba(0,224,158,.9)',1.4,[5,4]); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.textAlign='left'; ctx.fillText('rata-rata '+(Vfasa/n).toFixed(2)+' kV',bx+4,by+bh-Vfasa/n/vmax*bh-5);
  _ttlTulis('isolatorInfo','n = '+n+', k = '+kk.toFixed(2)+': tegangan piring (dari konduktor) = '+volt.slice().reverse().map(v=>v.toFixed(2)).join(' / ')+' kV;  piring terdekat konduktor memikul '+vmax.toFixed(2)+' kV ('+(vmax/(Vfasa/n)).toFixed(2)+'× rata-rata)   |   efisiensi rentengan = V/(n·V_maks) = '+eff.toFixed(2)+' %   |   k → 0 (cincin perata, grading) membuat distribusi merata');
  if(_ttlJalan('isolator')){_isFrame++; requestAnimationFrame(drawIsolator);}
}

// ── ANIMASI 3 — Andongan, gaya tarik, dan jarak bebas ──
let _anFrame=0;
function toggleAndongan(){_ttlToggle('andongan','btnAndongan',drawAndongan);}
window.toggleAndongan=toggleAndongan;
function drawAndongan(){
  const k=_ttlKanvas('cvAndongan'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_an_l',350), w=_ttlNilai('sl_an_w',9), T=_ttlNilai('sl_an_t',25), Hm=_ttlNilai('sl_an_h',30), Tk=_ttlNilai('sl_an_suhu',30);
  _ttlTulis('v_an_l',L.toFixed(0)); _ttlTulis('v_an_w',w.toFixed(1)); _ttlTulis('v_an_t',T.toFixed(1)); _ttlTulis('v_an_h',Hm.toFixed(0)); _ttlTulis('v_an_suhu',Tk.toFixed(0));
  // pendekatan: tarik turun ±0,4 kN per °C di atas 30 °C (pemuaian), tidak kurang dari 30 % T
  const Tef=Math.max(T*0.3,T-0.4*(Tk-30));
  const S=w*L*L/(8*Tef*1000), bebas=Hm-S;
  const padL=50,padR=30,padT=26,padB=30,plotW=W-padL-padR,plotH=H-padT-padB;
  const skY=plotH/Math.max(Hm*1.1,S+5);
  const X=x=>padL+x/L*plotW, Y=h=>padT+plotH-h*skY;
  // tanah
  ctx.fillStyle='rgba(120,90,40,.35)'; ctx.fillRect(padL,Y(0),plotW,padB-8);
  _ttlGaris(ctx,padL,Y(0),padL+plotW,Y(0),'rgba(180,140,80,.9)',2);
  // menara
  [[0],[L]].forEach(([x])=>{_ttlGaris(ctx,X(x),Y(0),X(x),Y(Hm),'rgba(148,163,184,.9)',4); _ttlGaris(ctx,X(x)-14,Y(Hm),X(x)+14,Y(Hm),'rgba(148,163,184,.9)',3);});
  // konduktor (parabola)
  ctx.strokeStyle='rgba(255,179,0,.95)'; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=100;i++){const x=L*i/100; const y=Hm-4*S*(x/L)*(1-x/L); i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));} ctx.stroke();
  // andongan & jarak bebas
  _ttlGaris(ctx,X(L/2),Y(Hm),X(L/2),Y(Hm-S),'rgba(0,229,255,.9)',1.5,[4,3]); _ttlGaris(ctx,X(L/2),Y(Hm-S),X(L/2),Y(0),'rgba(0,224,158,.9)',1.5,[4,3]);
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('S = '+S.toFixed(2)+' m',X(L/2)+6,Y(Hm-S/2)+4);
  ctx.fillStyle=bebas<8?'rgba(239,68,68,.95)':'rgba(0,224,158,.95)'; ctx.fillText('jarak bebas '+bebas.toFixed(2)+' m'+(bebas<8?' ⚠ < 8 m':''),X(L/2)+6,Y((Hm-S)/2)+4);
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('gawang '+L+' m · T efektif '+Tef.toFixed(1)+' kN pada '+Tk+' °C',padL+6,padT+12);
  // titik bergerak sepanjang konduktor
  const p=(_anFrame*0.01)%1; const xx=L*p, yy=Hm-4*S*p*(1-p); ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(X(xx),Y(yy),4,0,Math.PI*2); ctx.fill();
  _ttlTulis('andonganInfo','S = wL²/(8T) = '+w.toFixed(1)+'×'+L+'²/(8×'+(Tef*1000).toFixed(0)+') = '+S.toFixed(3)+' m; panjang konduktor ≈ L + 8S²/(3L) = '+(L+8*S*S/(3*L)).toFixed(2)+' m   |   jarak bebas = '+Hm+' − '+S.toFixed(2)+' = '+bebas.toFixed(2)+' m (syarat SUTT 150 kV ≥ 8–9 m di atas tanah)   |   suhu naik → konduktor memuai → T turun → S bertambah');
  if(_ttlJalan('andongan')){_anFrame++; requestAnimationFrame(drawAndongan);}
}

// ── ANIMASI 4 — Korona: tegangan kritis dan rugi Peek ──
let _koFrame=0;
function toggleKorona(){_ttlToggle('korona','btnKorona',drawKorona);}
window.toggleKorona=toggleKorona;
function drawKorona(){
  const k=_ttlKanvas('cvKorona'); if(!k) return; const {ctx,W,H}=k;
  const r=_ttlNilai('sl_ko_r',1.05), D=_ttlNilai('sl_ko_d',500), m=_ttlNilai('sl_ko_m',0.87), VL=_ttlNilai('sl_ko_v',150), nb=Math.round(_ttlNilai('sl_ko_n',1));
  _ttlTulis('v_ko_r',r.toFixed(2)); _ttlTulis('v_ko_d',D.toFixed(0)); _ttlTulis('v_ko_m',m.toFixed(2)); _ttlTulis('v_ko_v',VL.toFixed(0)); _ttlTulis('v_ko_n',nb.toFixed(0));
  // konduktor berkas: jari-jari efektif r_eq = (n·r·s^(n-1))^(1/n), s = 40 cm
  const s=40, req=nb===1?r:Math.pow(nb*r*Math.pow(s,nb-1),1/nb);
  const Vc=21.1*m*req*Math.log(D/req), Vf=VL/_SQ3_8;
  const rugi=V=>V>Vc?241*75*Math.sqrt(req/D)*(V-Vc)*(V-Vc)*1e-5:0;   // kW/km/fasa
  const padL=60,padR=20,padT=26,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const Vmax=Math.max(Vf*1.3,Vc*1.4,100), X=v=>padL+v/Vmax*plotW, Pm=Math.max(rugi(Vmax),1), Y=p=>padT+plotH-p/Pm*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='center';
  for(let i=0;i<=5;i++) ctx.fillText((Vmax*i/5).toFixed(0)+' kV',X(Vmax*i/5),padT+plotH+16);
  ctx.textAlign='right'; for(let i=1;i<=4;i++) ctx.fillText((Pm*i/4).toFixed(1)+' kW/km',padL-4,Y(Pm*i/4)+4);
  ctx.strokeStyle='rgba(236,72,153,.95)'; ctx.lineWidth=2.4; ctx.beginPath(); for(let i=0;i<=200;i++){const v=Vmax*i/200; i?ctx.lineTo(X(v),Y(rugi(v))):ctx.moveTo(X(v),Y(rugi(v)));} ctx.stroke();
  _ttlGaris(ctx,X(Vc),padT,X(Vc),padT+plotH,'rgba(255,179,0,.9)',1.5,[5,4]); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('V_c = '+Vc.toFixed(1)+' kV',X(Vc)+4,padT+12);
  const a=0.5+0.5*Math.sin(_koFrame*0.1);
  _ttlGaris(ctx,X(Vf),padT,X(Vf),padT+plotH,Vf>Vc?'rgba(239,68,68,'+a.toFixed(2)+')':'rgba(0,224,158,.9)',2); ctx.fillStyle=Vf>Vc?'rgba(239,68,68,.95)':'rgba(0,224,158,.95)'; ctx.fillText('V_fasa = '+Vf.toFixed(1)+' kV'+(Vf>Vc?' ⚠ KORONA':' aman'),X(Vf)+4,padT+26);
  // ikon konduktor berkas
  const cx=W-70, cy=padT+50; for(let i=0;i<nb;i++){const ang=2*Math.PI*i/nb; const px=cx+(nb>1?18:0)*Math.cos(ang), py=cy+(nb>1?18:0)*Math.sin(ang); ctx.fillStyle='rgba(148,163,184,.9)'; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill(); if(Vf>Vc){ctx.strokeStyle='rgba(168,85,247,'+(0.3+0.5*a).toFixed(2)+')'; ctx.beginPath(); ctx.arc(px,py,9+4*a,0,Math.PI*2); ctx.stroke();}}
  ctx.fillStyle='rgba(148,163,184,.9)'; ctx.textAlign='center'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('berkas '+nb+'×, r_eq '+req.toFixed(2)+' cm',cx,cy+40);
  _ttlTulis('koronaInfo','r_eq = '+req.toFixed(3)+' cm ('+nb+' sub-konduktor); V_c = 21,1·m·δ·r_eq·ln(D/r_eq) = '+Vc.toFixed(2)+' kV fasa = '+(Vc*_SQ3_8).toFixed(1)+' kV antar-saluran   |   V_fasa '+Vf.toFixed(2)+' kV → '+(Vf>Vc?'rugi korona ≈ '+rugi(Vf).toFixed(3)+' kW/km/fasa (Peek, cuaca cerah; hujan bisa ×5–10)':'di bawah V_c: tanpa korona (cuaca cerah)')+'   |   gradien permukaan ≈ '+(Vf/(req*Math.log(D/req))).toFixed(2)+' kV/cm rms (kritis ≈ 21,1·m)');
  if(_ttlJalan('korona')){_koFrame++; requestAnimationFrame(drawKorona);}
}

_TTL_DAFTAR.push(['cvRugiTegangan',()=>drawRugiTegangan(),'rugitegangan',['sl_rt_p','sl_rt_l','sl_rt_r','sl_rt_pf']]);
_TTL_DAFTAR.push(['cvIsolator',()=>drawIsolator(),'isolator',['sl_is_n','sl_is_k','sl_is_v']]);
_TTL_DAFTAR.push(['cvAndongan',()=>drawAndongan(),'andongan',['sl_an_l','sl_an_w','sl_an_t','sl_an_h','sl_an_suhu']]);
_TTL_DAFTAR.push(['cvKorona',()=>drawKorona(),'korona',['sl_ko_r','sl_ko_d','sl_ko_m','sl_ko_v','sl_ko_n']]);
_ttlMulai();
