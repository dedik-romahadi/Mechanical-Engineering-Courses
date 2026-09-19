// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 9 TEKNIK TENAGA LISTRIK — Pemodelan Saluran Transmisi
// Kanvas: cvGeometri, cvABCD, cvProfilPanjang, cvSIL
// ════════════════════════════════════════════════════════════
const _SQ3_9=Math.sqrt(3), _W50=2*Math.PI*50, _KC=0.05563;
function _param9(D,r,n,s){
  // D jarak fasa berdekatan (m, susunan mendatar), r cm, n sub-konduktor, s cm
  const GMD=D*Math.cbrt(2), GMR=0.7788*r/100, rm=r/100, sm=s/100;
  const GMRb=n===1?GMR:Math.pow(n*GMR*Math.pow(sm,n-1),1/n), rb=n===1?rm:Math.pow(n*rm*Math.pow(sm,n-1),1/n);
  const L=0.2*Math.log(GMD/GMRb), C=_KC/Math.log(GMD/rb);   // mH/km, µF/km
  const x=_W50*L/1000, b=_W50*C*1e-6, Zc=Math.sqrt(x/b), beta=Math.sqrt(x*b);
  return {GMD,GMRb,rb,L,C,x,b,Zc,beta};
}

// ── ANIMASI 1 — Geometri konduktor → L, C, X, B ──
let _gmFrame=0;
function toggleGeometri(){_ttlToggle('geometri','btnGeometri',drawGeometri);}
window.toggleGeometri=toggleGeometri;
function drawGeometri(){
  const k=_ttlKanvas('cvGeometri'); if(!k) return; const {ctx,W,H}=k;
  const D=_ttlNilai('sl_gm_d',6), r=_ttlNilai('sl_gm_r',1.09), n=Math.round(_ttlNilai('sl_gm_n',1)), s=_ttlNilai('sl_gm_s',40);
  _ttlTulis('v_gm_d',D.toFixed(1)); _ttlTulis('v_gm_r',r.toFixed(2)); _ttlTulis('v_gm_n',n.toFixed(0)); _ttlTulis('v_gm_s',s.toFixed(0));
  const p=_param9(D,r,n,s);
  // kiri: gambar tiga fasa mendatar
  const cx=W*0.28, cy=H*0.45, sk=Math.min(W*0.22/D,60);
  _ttlGaris(ctx,cx-D*sk-30,cy+40,cx+D*sk+30,cy+40,'rgba(148,163,184,.4)',1);
  const warna=['rgba(239,68,68,.95)','rgba(255,179,0,.95)','rgba(0,229,255,.95)'];
  [[-1,'a'],[0,'b'],[1,'c']].forEach(([i,lab],q)=>{
    const x=cx+i*D*sk; const rr=Math.max(4,Math.min(10,r*4));
    for(let j=0;j<n;j++){const ang=2*Math.PI*j/n+(n===2?Math.PI/2:0); const px=x+(n>1?12:0)*Math.cos(ang), py=cy+(n>1?12:0)*Math.sin(ang); ctx.fillStyle=warna[q]; ctx.beginPath(); ctx.arc(px,py,rr,0,Math.PI*2); ctx.fill();}
    ctx.fillStyle=warna[q]; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText(lab,x,cy-26);
  });
  _ttlGaris(ctx,cx-D*sk,cy+28,cx,cy+28,'rgba(148,163,184,.8)',1.2); ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('D = '+D.toFixed(1)+' m',cx-D*sk/2,cy+42);
  ctx.fillText('GMD = D·∛2 = '+p.GMD.toFixed(3)+' m',cx,cy+62); ctx.fillText('GMR'+(n>1?'_b':'')+' = '+(p.GMRb*100).toFixed(3)+' cm · r'+(n>1?'_b':'')+' = '+(p.rb*100).toFixed(3)+' cm',cx,cy+76);
  // kanan: batang L, C, X, B
  const bx=W*0.55, bw=W-bx-20, by=24, bh=(H-60)/4;
  const item=[['L (mH/km)',p.L,2.0,'rgba(255,179,0,.85)'],['C (nF/km)',p.C*1000,20,'rgba(0,229,255,.85)'],['X_L (Ω/km)',p.x,0.6,'rgba(168,85,247,.85)'],['B (µS/km)',p.b*1e6,6,'rgba(0,224,158,.85)']];
  const fase=Math.min(1,(_gmFrame%100)/40);
  item.forEach(([lab,v,mx,c],i)=>{const y=by+i*bh; ctx.fillStyle='rgba(148,163,184,.9)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText(lab,bx,y+10); ctx.fillStyle=c; ctx.fillRect(bx,y+14,bw*Math.min(1,v/mx)*fase,bh*0.45); ctx.fillStyle='#e2e8f0'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText(v.toFixed(4),bx+bw*Math.min(1,v/mx)*fase+6,y+14+bh*0.3);});
  _ttlTulis('geometriInfo','GMD = '+p.GMD.toFixed(3)+' m, GMR = '+(p.GMRb*100).toFixed(3)+' cm → L = 0,2 ln(GMD/GMR) = '+p.L.toFixed(4)+' mH/km, X_L = '+p.x.toFixed(4)+' Ω/km   |   r_eff = '+(p.rb*100).toFixed(3)+' cm → C = 0,05563/ln(GMD/r) = '+(p.C*1000).toFixed(3)+' nF/km, B = '+(p.b*1e6).toFixed(3)+' µS/km   |   Z_c = √(x/b) = '+p.Zc.toFixed(1)+' Ω; SIL 150 kV = '+(22500/p.Zc).toFixed(1)+' MW, 500 kV = '+(250000/p.Zc).toFixed(0)+' MW');
  if(_ttlJalan('geometri')){_gmFrame++; requestAnimationFrame(drawGeometri);}
}

// ── ANIMASI 2 — Konstanta ABCD: nominal-π vs parameter tersebar terhadap panjang ──
let _abFrame=0;
function toggleABCD(){_ttlToggle('abcd','btnABCD',drawABCD);}
window.toggleABCD=toggleABCD;
function drawABCD(){
  const k=_ttlKanvas('cvABCD'); if(!k) return; const {ctx,W,H}=k;
  const x=_ttlNilai('sl_ab_x',0.42), b=_ttlNilai('sl_ab_b',2.7), lmax=_ttlNilai('sl_ab_l',600), ln=_ttlNilai('sl_ab_ln',200);
  _ttlTulis('v_ab_x',x.toFixed(2)); _ttlTulis('v_ab_b',b.toFixed(2)); _ttlTulis('v_ab_l',lmax.toFixed(0)); _ttlTulis('v_ab_ln',ln.toFixed(0));
  const bS=b*1e-6, beta=Math.sqrt(x*bS), Zc=Math.sqrt(x/bS);
  const Api=l=>1-x*l*bS*l/2, Along=l=>Math.cos(beta*l), Bpi=l=>x*l, Blong=l=>Zc*Math.sin(beta*l);
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=(H-padT-padB-16)/2;
  const X=l=>padL+l/lmax*plotW;
  // panel atas: A
  const yA0=padT+plotH, YA=v=>yA0-(v-0.5)/0.6*plotH;
  _ttlGaris(ctx,padL,padT,padL,yA0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,YA(1),padL+plotW,YA(1),'rgba(148,163,184,.25)',1,[3,3]);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right'; ctx.fillText('A = 1,0',padL-4,YA(1)+4); ctx.fillText('0,6',padL-4,YA(0.6)+4);
  const kurva=(f,warna,Y,putus)=>{ctx.strokeStyle=warna; ctx.lineWidth=2; ctx.setLineDash(putus||[]); ctx.beginPath(); for(let i=0;i<=200;i++){const l=lmax*i/200; i?ctx.lineTo(X(l),Y(f(l))):ctx.moveTo(X(l),Y(f(l)));} ctx.stroke(); ctx.setLineDash([]);};
  kurva(Along,'rgba(0,224,158,.95)',YA); kurva(Api,'rgba(255,179,0,.95)',YA,[5,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('A tersebar = cos(βℓ)',padL+6,padT+10); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('A nominal-π = 1 − xbℓ²/2',padL+150,padT+10);
  // panel bawah: B
  const yB0=padT+2*plotH+16, YB=v=>yB0-v/(x*lmax*1.05)*plotH;
  _ttlGaris(ctx,padL,yA0+16,padL,yB0,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,yB0,padL+plotW,yB0,'rgba(148,163,184,.45)',1.2);
  ctx.textAlign='right'; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.fillText('|B| Ω',padL-4,yA0+28); ctx.fillText((x*lmax).toFixed(0),padL-4,YB(x*lmax)+4);
  kurva(Blong,'rgba(0,229,255,.95)',YB); kurva(Bpi,'rgba(168,85,247,.95)',YB,[5,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('|B| tersebar = Z_c sin(βℓ)',padL+6,yA0+28); ctx.fillStyle='rgba(168,85,247,.95)'; ctx.fillText('|B| nominal = xℓ',padL+190,yA0+28);
  ctx.textAlign='center'; ctx.fillStyle='rgba(148,163,184,.7)'; for(let i=0;i<=6;i++) ctx.fillText((lmax*i/6).toFixed(0)+' km',X(lmax*i/6),yB0+16);
  // garis panjang terpilih (berkedip)
  const a=0.5+0.5*Math.sin(_abFrame*0.08); _ttlGaris(ctx,X(ln),padT,X(ln),yB0,'rgba(236,72,153,'+a.toFixed(2)+')',1.6);
  const errA=(Api(ln)-Along(ln))/Along(ln)*100, errB=(Bpi(ln)-Blong(ln))/Blong(ln)*100;
  _ttlTulis('abcdInfo','β = √(xb) = '+(beta*1000).toFixed(4)+'×10⁻³ rad/km, Z_c = '+Zc.toFixed(1)+' Ω, λ = 2π/β = '+(2*Math.PI/beta).toFixed(0)+' km   |   ℓ = '+ln+' km: βℓ = '+(beta*ln).toFixed(4)+' rad ('+(beta*ln*180/Math.PI).toFixed(1)+'°); A tersebar '+Along(ln).toFixed(5)+' vs nominal-π '+Api(ln).toFixed(5)+' (selisih '+errA.toFixed(2)+' %); |B| '+Blong(ln).toFixed(2)+' vs '+Bpi(ln).toFixed(2)+' Ω (selisih '+errB.toFixed(2)+' %)   |   nominal-π memadai sampai ±250 km');
  if(_ttlJalan('abcd')){_abFrame++; requestAnimationFrame(drawABCD);}
}

// ── ANIMASI 3 — Profil tegangan saluran panjang tanpa rugi: beban terhadap SIL ──
let _ppFrame=0;
function toggleProfilPanjang(){_ttlToggle('profilpanjang','btnProfilPanjang',drawProfilPanjang);}
window.toggleProfilPanjang=toggleProfilPanjang;
function drawProfilPanjang(){
  const k=_ttlKanvas('cvProfilPanjang'); if(!k) return; const {ctx,W,H}=k;
  const l=_ttlNilai('sl_pp_l',400), Zc=_ttlNilai('sl_pp_zc',280), rasio=_ttlNilai('sl_pp_p',1.0), VL=500, beta=1.06e-3;
  _ttlTulis('v_pp_l',l.toFixed(0)); _ttlTulis('v_pp_zc',Zc.toFixed(0)); _ttlTulis('v_pp_p',rasio.toFixed(2));
  // V_R = 1 pu acuan, I_R = rasio·(V_R/Zc) sefasa (beban resistif = rasio·SIL); V(x) = V_R cos βx + j Zc I_R sin βx
  const VR=1, IR=rasio*VR/Zc;
  const V=xk=>Math.hypot(VR*Math.cos(beta*xk),Zc*IR*Math.sin(beta*xk));
  const VS=V(l);   // tegangan kirim (pu terhadap V_R); dinormalisasi agar V_S = 1 pu
  const padL=60,padR=30,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const X=xk=>padL+(1-xk/l)*plotW, Y=v=>padT+plotH-(v-0.7)/0.6*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right';
  for(const v of [0.8,0.9,1.0,1.1,1.2]){_ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText((v*VL).toFixed(0)+' kV',padL-4,Y(v)+4);}
  ctx.textAlign='center'; ctx.fillText('kirim',padL,padT+plotH+16); ctx.fillText('terima ('+l+' km)',padL+plotW,padT+plotH+16); ctx.fillText('jarak dari ujung kirim →',padL+plotW/2,padT+plotH+16);
  _ttlGaris(ctx,padL,Y(1.05),padL+plotW,Y(1.05),'rgba(239,68,68,.6)',1,[4,4]); _ttlGaris(ctx,padL,Y(0.95),padL+plotW,Y(0.95),'rgba(239,68,68,.6)',1,[4,4]);
  const warna=rasio<0.98?'rgba(0,229,255,.95)':rasio>1.02?'rgba(255,179,0,.95)':'rgba(0,224,158,.95)';
  ctx.strokeStyle=warna; ctx.lineWidth=2.6; ctx.beginPath(); for(let i=0;i<=200;i++){const xk=l*i/200; const v=V(xk)/VS; i?ctx.lineTo(X(xk),Y(v)):ctx.moveTo(X(xk),Y(v));} ctx.stroke();
  const pos=(_ppFrame*0.5)%l, vv=V(pos)/VS; ctx.fillStyle='#e2e8f0'; ctx.beginPath(); ctx.arc(X(pos),Y(vv),4.5,0,Math.PI*2); ctx.fill();
  const SIL=VL*VL/Zc, VRpu=1/VS;
  ctx.textAlign='left'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillStyle=warna;
  ctx.fillText((rasio<0.98?'beban < SIL: tegangan NAIK ke ujung terima':rasio>1.02?'beban > SIL: tegangan TURUN ke ujung terima':'beban = SIL: profil rata')+' · V_R = '+(VRpu*VL).toFixed(1)+' kV ('+((VRpu-1)*100).toFixed(1)+' %)',padL+8,padT+14);
  _ttlTulis('profilPanjangInfo','SIL = '+VL+'²/'+Zc+' = '+SIL.toFixed(0)+' MW; beban '+(rasio*SIL).toFixed(0)+' MW ('+rasio.toFixed(2)+' SIL, resistif)   |   βℓ = '+(beta*l).toFixed(4)+' rad; V(x) = V_R cos βx + jZ_c I_R sin βx   |   dengan V_S = 500 kV: V_R = '+(VRpu*VL).toFixed(2)+' kV'+(rasio===0?' (tanpa beban: Ferranti +'+((1/Math.cos(beta*l)-1)*100).toFixed(2)+' %)':'')+'   |   pada SIL, Q kapasitansi = Q induktansi di tiap titik');
  if(_ttlJalan('profilpanjang')){_ppFrame++; requestAnimationFrame(drawProfilPanjang);}
}

// ── ANIMASI 4 — Z_c, SIL, dan Ferranti terhadap geometri dan berkas ──
let _slFrame=0;
function toggleSIL(){_ttlToggle('sil','btnSIL',drawSIL);}
window.toggleSIL=toggleSIL;
function drawSIL(){
  const k=_ttlKanvas('cvSIL'); if(!k) return; const {ctx,W,H}=k;
  const D=_ttlNilai('sl_sl_d',10), r=_ttlNilai('sl_sl_r',1.43), VL=_ttlNilai('sl_sl_v',500), l=_ttlNilai('sl_sl_l',350);
  _ttlTulis('v_sl_d',D.toFixed(1)); _ttlTulis('v_sl_r',r.toFixed(2)); _ttlTulis('v_sl_v',VL.toFixed(0)); _ttlTulis('v_sl_l',l.toFixed(0));
  const hasil=[1,2,3,4].map(n=>{const p=_param9(D,r,n,45); return {n,Zc:p.Zc,SIL:VL*VL/p.Zc,fer:(1/Math.cos(p.beta*l)-1)*100,x:p.x,b:p.b};});
  const padL=110,padR=20,padT=26,barH=(H-padT-40)/4,plotW=W-padL-padR;
  const maxSIL=Math.max(...hasil.map(h=>h.SIL))*1.15;
  const fase=Math.min(1,(_slFrame%100)/40);
  hasil.forEach((h,i)=>{
    const y=padT+i*barH;
    ctx.fillStyle='rgba(226,232,240,.9)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='right'; ctx.fillText('berkas '+h.n+'×',padL-10,y+barH/2+4);
    ctx.fillStyle=['rgba(239,68,68,.8)','rgba(255,179,0,.8)','rgba(0,229,255,.8)','rgba(0,224,158,.8)'][i]; ctx.fillRect(padL,y+6,plotW*h.SIL/maxSIL*fase,barH-12);
    ctx.fillStyle='#e2e8f0'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText('SIL '+h.SIL.toFixed(0)+' MW · Z_c '+h.Zc.toFixed(0)+' Ω · x '+h.x.toFixed(3)+' Ω/km · Ferranti '+l+' km: +'+h.fer.toFixed(1)+' %',padL+plotW*h.SIL/maxSIL*fase+6>W-260?padL+8:padL+plotW*h.SIL/maxSIL*fase+6,y+barH/2+4);
  });
  ctx.fillStyle='rgba(148,163,184,.8)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('SIL = V²/Z_c untuk 1–4 sub-konduktor (D = '+D+' m, r = '+r+' cm, s = 45 cm) pada '+VL+' kV',W/2,H-10);
  _ttlTulis('silInfo',hasil.map(h=>h.n+'×: Z_c = '+h.Zc.toFixed(1)+' Ω, SIL = '+h.SIL.toFixed(0)+' MW, b = '+(h.b*1e6).toFixed(2)+' µS/km, Ferranti '+l+' km = +'+h.fer.toFixed(2)+' %').join('   |   ')+'   |   berkas menurunkan x dan menaikkan b → Z_c turun, SIL naik, tetapi arus pengisian dan Ferranti ikut naik');
  if(_ttlJalan('sil')){_slFrame++; requestAnimationFrame(drawSIL);}
}

_TTL_DAFTAR.push(['cvGeometri',()=>drawGeometri(),'geometri',['sl_gm_d','sl_gm_r','sl_gm_n','sl_gm_s']]);
_TTL_DAFTAR.push(['cvABCD',()=>drawABCD(),'abcd',['sl_ab_x','sl_ab_b','sl_ab_l','sl_ab_ln']]);
_TTL_DAFTAR.push(['cvProfilPanjang',()=>drawProfilPanjang(),'profilpanjang',['sl_pp_l','sl_pp_zc','sl_pp_p']]);
_TTL_DAFTAR.push(['cvSIL',()=>drawSIL(),'sil',['sl_sl_d','sl_sl_r','sl_sl_v','sl_sl_l']]);
_ttlMulai();
