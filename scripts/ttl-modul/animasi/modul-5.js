// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 5 TEKNIK TENAGA LISTRIK — Daya pada Jaringan Listrik AC
// Kanvas: cvFasor, cvImpedansi, cvSegitiga, cvTigaFasa
// ════════════════════════════════════════════════════════════
const _RAD=Math.PI/180;
function _ttlPanah(ctx,x1,y1,x2,y2,warna,lebar){
  _ttlGaris(ctx,x1,y1,x2,y2,warna,lebar||2);
  const a=Math.atan2(y2-y1,x2-x1); ctx.fillStyle=warna; ctx.beginPath();
  ctx.moveTo(x2,y2); ctx.lineTo(x2-9*Math.cos(a-0.4),y2-9*Math.sin(a-0.4)); ctx.lineTo(x2-9*Math.cos(a+0.4),y2-9*Math.sin(a+0.4)); ctx.closePath(); ctx.fill();
}
function _ttlSumbu(ctx,x0,y0,w,h,warna){_ttlGaris(ctx,x0,y0,x0+w,y0,warna||'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,x0,y0-h/2,x0,y0+h/2,warna||'rgba(148,163,184,.45)',1.2);}

// ── ANIMASI 1 — Tegangan, arus, dan daya sesaat satu fasa ──
let _fsFrame=0;
function toggleFasor(){_ttlToggle('fasor','btnFasor',drawFasor);}
window.toggleFasor=toggleFasor;
function drawFasor(){
  const k=_ttlKanvas('cvFasor'); if(!k) return; const {ctx,W,H}=k;
  const Vm=_ttlNilai('sl_fs_vm',339.4), Im=_ttlNilai('sl_fs_im',22.6), phi=_ttlNilai('sl_fs_phi',53);
  _ttlTulis('v_fs_vm',Vm.toFixed(1)); _ttlTulis('v_fs_im',Im.toFixed(1)); _ttlTulis('v_fs_phi',phi.toFixed(0));
  const Vr=Vm/Math.SQRT2, Ir=Im/Math.SQRT2, P=Vr*Ir*Math.cos(phi*_RAD), Q=Vr*Ir*Math.sin(phi*_RAD), S=Vr*Ir;
  const padL=56, padR=170, padT=16, plotW=W-padL-padR, plotH=H-padT-30, y0=padT+plotH/2;
  const skV=(plotH/2-6)/Math.max(Vm,1), skI=(plotH/2-6)/Math.max(Im,1), skP=(plotH/2-6)/Math.max(Vm*Im,1);
  const wt0=(_fsFrame*0.03)%(2*Math.PI);
  _ttlSumbu(ctx,padL,y0,plotW,plotH);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.65)'; ctx.textAlign='center';
  for(let d=0;d<=720;d+=180){ctx.fillText(d+'°',padL+d/720*plotW,y0+plotH/2+14);}
  const gambarKurva=(f,warna,lebar,putus)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.setLineDash(putus||[]); ctx.beginPath(); for(let i=0;i<=400;i++){const th=i/400*4*Math.PI; const y=y0-f(th); i?ctx.lineTo(padL+i/400*plotW,y):ctx.moveTo(padL+i/400*plotW,y);} ctx.stroke(); ctx.setLineDash([]);};
  // daya sesaat (isian)
  ctx.fillStyle='rgba(0,224,158,.18)'; ctx.beginPath(); ctx.moveTo(padL,y0);
  for(let i=0;i<=400;i++){const th=i/400*4*Math.PI; const p=Vm*Math.sin(th+wt0)*Im*Math.sin(th+wt0-phi*_RAD); ctx.lineTo(padL+i/400*plotW,y0-p*skP);} ctx.lineTo(padL+plotW,y0); ctx.closePath(); ctx.fill();
  gambarKurva(th=>Vm*Math.sin(th+wt0)*skV,'rgba(255,179,0,.95)',2);
  gambarKurva(th=>Im*Math.sin(th+wt0-phi*_RAD)*skI,'rgba(0,229,255,.95)',2);
  gambarKurva(th=>Vm*Math.sin(th+wt0)*Im*Math.sin(th+wt0-phi*_RAD)*skP,'rgba(0,224,158,.95)',1.6);
  _ttlGaris(ctx,padL,y0-P*skP,padL+plotW,y0-P*skP,'rgba(236,72,153,.9)',1.5,[5,4]);
  ctx.textAlign='left'; ctx.fillStyle='rgba(236,72,153,.95)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.fillText('P rata-rata = '+P.toFixed(0)+' W',padL+6,y0-P*skP-6);
  // legenda & fasor kecil
  const cx=W-padR+80, cy=y0, r=Math.min(52,plotH/2-8);
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  _ttlPanah(ctx,cx,cy,cx+r*Math.cos(-wt0),cy+r*Math.sin(-wt0),'rgba(255,179,0,.95)',2.2);
  _ttlPanah(ctx,cx,cy,cx+r*0.8*Math.cos(-wt0+phi*_RAD),cy+r*0.8*Math.sin(-wt0+phi*_RAD),'rgba(0,229,255,.95)',2.2);
  ctx.textAlign='center'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('v(t)  V',cx,cy-r-16); ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('i(t)  I  (φ = '+phi.toFixed(0)+'°)',cx,cy+r+16); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('p(t) = v·i',cx,cy+r+28);
  _ttlTulis('fasorInfo','V_rms = '+Vr.toFixed(2)+' V, I_rms = '+Ir.toFixed(3)+' A   |   P = V·I·cos φ = '+P.toFixed(2)+' W,  Q = V·I·sin φ = '+Q.toFixed(2)+' VAR,  S = V·I = '+S.toFixed(2)+' VA,  pf = '+Math.cos(phi*_RAD).toFixed(4)+(phi>0?' tertinggal':phi<0?' mendahului':'')+'   |   p(t) berayun pada 2f di sekitar P; bagian di bawah nol = daya kembali ke sumber');
  if(_ttlJalan('fasor')){_fsFrame++; requestAnimationFrame(drawFasor);}
}

// ── ANIMASI 2 — Impedansi seri RLC dan fasor tegangan–arus ──
let _imFrame=0;
function toggleImpedansi(){_ttlToggle('impedansi','btnImpedansi',drawImpedansi);}
window.toggleImpedansi=toggleImpedansi;
function drawImpedansi(){
  const k=_ttlKanvas('cvImpedansi'); if(!k) return; const {ctx,W,H}=k;
  const R=_ttlNilai('sl_im_r',9), L=_ttlNilai('sl_im_l',50), C=_ttlNilai('sl_im_c',150), f=_ttlNilai('sl_im_f',50), V=240;
  _ttlTulis('v_im_r',R.toFixed(1)); _ttlTulis('v_im_l',L.toFixed(0)); _ttlTulis('v_im_c',C.toFixed(0)); _ttlTulis('v_im_f',f.toFixed(0));
  const XL=2*Math.PI*f*L/1000, XC=1/(2*Math.PI*f*C*1e-6), X=XL-XC, Z=Math.hypot(R,X), phi=Math.atan2(X,R), I=V/Z;
  // kiri: segitiga impedansi
  const ox=40, oy=H/2, sk=Math.min((W*0.42-60)/Math.max(R,1e-6),(H/2-30)/Math.max(Math.abs(X),Math.max(XL,XC),1e-6)*1)*0.9;
  const skala=Math.min((W*0.42-70)/Math.max(R,XL,XC,1),(H/2-30)/Math.max(XL,XC,Math.abs(X),1));
  _ttlSumbu(ctx,ox,oy,W*0.42-40,H-40);
  _ttlPanah(ctx,ox,oy,ox+R*skala,oy,'rgba(0,229,255,.95)',2.4);
  _ttlPanah(ctx,ox+R*skala,oy,ox+R*skala,oy-XL*skala,'rgba(255,179,0,.6)',1.6);
  _ttlPanah(ctx,ox+R*skala+8,oy-XL*skala,ox+R*skala+8,oy-XL*skala+XC*skala,'rgba(168,85,247,.6)',1.6);
  _ttlPanah(ctx,ox,oy,ox+R*skala,oy-X*skala,'rgba(0,224,158,.95)',2.6);
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('R = '+R.toFixed(1)+' Ω',ox+R*skala/2-20,oy+14);
  ctx.fillStyle='rgba(255,179,0,.9)'; ctx.fillText('X_L = '+XL.toFixed(2)+' Ω',ox+R*skala+14,oy-XL*skala/2);
  ctx.fillStyle='rgba(168,85,247,.9)'; ctx.fillText('−X_C = '+XC.toFixed(2)+' Ω',ox+R*skala+14,oy-XL*skala+XC*skala/2+12);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('|Z| = '+Z.toFixed(2)+' Ω ∠'+(phi/_RAD).toFixed(1)+'°',ox+6,oy-X*skala-8-(X<0?-26:0));
  // kanan: fasor V dan I berputar
  const cx=W*0.42+Math.min(120,W*0.12)+60, cy=H/2, r=Math.min(H/2-24,110);
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  const wt=(_imFrame*0.025)%(2*Math.PI);
  _ttlPanah(ctx,cx,cy,cx+r*Math.cos(-wt),cy+r*Math.sin(-wt),'rgba(255,179,0,.95)',2.4);
  const rI=r*Math.min(1,I/40+0.25);
  _ttlPanah(ctx,cx,cy,cx+rI*Math.cos(-wt+phi),cy+rI*Math.sin(-wt+phi),'rgba(0,229,255,.95)',2.4);
  ctx.textAlign='center'; ctx.font="10px 'JetBrains Mono',monospace";
  ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('V = 240 V',cx,cy-r-12);
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('I = '+I.toFixed(2)+' A  ('+(phi>0?'tertinggal ':phi<0?'mendahului ':'sefasa ')+Math.abs(phi/_RAD).toFixed(1)+'°)',cx,cy+r+16);
  // proyeksi: bentuk gelombang kecil di kanan
  const gx=cx+r+30, gw=W-gx-16, gy=cy, gh=r;
  if(gw>60){_ttlSumbu(ctx,gx,gy,gw,gh*2);
    const kurva=(A,ph,warna)=>{ctx.strokeStyle=warna; ctx.lineWidth=1.8; ctx.beginPath(); for(let i=0;i<=200;i++){const th=i/200*4*Math.PI; const y=gy-A*Math.sin(th-wt+ph); i?ctx.lineTo(gx+i/200*gw,y):ctx.moveTo(gx+i/200*gw,y);} ctx.stroke();};
    kurva(gh*0.9,0,'rgba(255,179,0,.9)'); kurva(gh*0.9*Math.min(1,I/40+0.25),-phi,'rgba(0,229,255,.9)');}
  _ttlTulis('impedansiInfo','X_L = 2πfL = '+XL.toFixed(3)+' Ω, X_C = 1/(2πfC) = '+XC.toFixed(3)+' Ω, X = '+X.toFixed(3)+' Ω ('+(X>0?'induktif':X<0?'kapasitif':'resonansi')+')   |   |Z| = '+Z.toFixed(3)+' Ω, φ = '+(phi/_RAD).toFixed(2)+'°, pf = '+Math.cos(phi).toFixed(4)+'   |   I = 240/|Z| = '+I.toFixed(3)+' A;  P = I²R = '+(I*I*R).toFixed(1)+' W, Q = I²X = '+(I*I*X).toFixed(1)+' VAR   |   f_res = '+(1/(2*Math.PI*Math.sqrt(L/1000*C*1e-6))).toFixed(1)+' Hz');
  if(_ttlJalan('impedansi')){_imFrame++; requestAnimationFrame(drawImpedansi);}
}

// ── ANIMASI 3 — Segitiga daya dan perbaikan faktor daya ──
let _sgFrame=0;
function toggleSegitiga(){_ttlToggle('segitiga','btnSegitiga',drawSegitiga);}
window.toggleSegitiga=toggleSegitiga;
function drawSegitiga(){
  const k=_ttlKanvas('cvSegitiga'); if(!k) return; const {ctx,W,H}=k;
  const P=_ttlNilai('sl_sg_p',60), pf1=_ttlNilai('sl_sg_pf1',0.75), pf2=_ttlNilai('sl_sg_pf2',0.95), VL=400, f=50;
  _ttlTulis('v_sg_p',P.toFixed(0)); _ttlTulis('v_sg_pf1',pf1.toFixed(2)); _ttlTulis('v_sg_pf2',pf2.toFixed(2));
  const t1=Math.tan(Math.acos(pf1)), t2=Math.tan(Math.acos(Math.min(pf2,1)));
  const Q1=P*t1, Q2=P*t2, Qc=Math.max(0,Q1-Q2), S1=Math.hypot(P,Q1), S2=Math.hypot(P,Q2);
  const I1=S1*1000/(Math.sqrt(3)*VL), I2=S2*1000/(Math.sqrt(3)*VL);
  const Cfasa=Qc*1000/(3*2*Math.PI*f*VL*VL)*1e6;
  const ox=60, oy=H-40, sk=Math.min((W*0.55-80)/P,(H-70)/Math.max(Q1,1));
  _ttlSumbu(ctx,ox,oy,W*0.55-60,10);
  // segitiga sebelum
  ctx.fillStyle='rgba(239,68,68,.12)'; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+P*sk,oy); ctx.lineTo(ox+P*sk,oy-Q1*sk); ctx.closePath(); ctx.fill();
  _ttlPanah(ctx,ox,oy,ox+P*sk,oy,'rgba(0,229,255,.95)',2.6);
  _ttlPanah(ctx,ox+P*sk,oy,ox+P*sk,oy-Q1*sk,'rgba(239,68,68,.85)',2);
  _ttlPanah(ctx,ox,oy,ox+P*sk,oy-Q1*sk,'rgba(239,68,68,.95)',2.2);
  // segitiga sesudah
  ctx.fillStyle='rgba(0,224,158,.15)'; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+P*sk,oy); ctx.lineTo(ox+P*sk,oy-Q2*sk); ctx.closePath(); ctx.fill();
  _ttlPanah(ctx,ox,oy,ox+P*sk,oy-Q2*sk,'rgba(0,224,158,.95)',2.6);
  // kapasitor: panah turun animasi
  const fase=(Math.sin(_sgFrame*0.05)+1)/2;
  _ttlPanah(ctx,ox+P*sk+22,oy-Q1*sk,ox+P*sk+22,oy-Q1*sk+Qc*sk*fase,'rgba(168,85,247,.95)',2.2);
  ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  ctx.fillStyle='rgba(0,229,255,.95)'; ctx.fillText('P = '+P.toFixed(0)+' kW',ox+P*sk/2-24,oy+16);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('S₁ = '+S1.toFixed(1)+' kVA  (φ₁ = '+(Math.acos(pf1)/_RAD).toFixed(1)+'°)',ox+8,oy-Q1*sk-8);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('S₂ = '+S2.toFixed(1)+' kVA  (φ₂ = '+(Math.acos(Math.min(pf2,1))/_RAD).toFixed(1)+'°)',ox+P*sk*0.35,oy-Q2*sk-8);
  ctx.fillStyle='rgba(168,85,247,.95)'; ctx.fillText('Q_C = '+Qc.toFixed(1)+' kVAR',ox+P*sk+30,oy-Q1*sk+Qc*sk/2+4);
  ctx.fillStyle='rgba(239,68,68,.85)'; ctx.fillText('Q₁ = '+Q1.toFixed(1),ox+P*sk-70,oy-Q1*sk/2+4);
  // kanan: batang arus saluran
  const bx=W*0.62, bw=W-bx-20, by=40, bh=H-80, maks=Math.max(I1,1)*1.15;
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('Arus saluran pada '+VL+' V tiga fasa',bx+bw/2,by-14);
  const batang=(x,w,I,warna,label)=>{const h=I/maks*bh; ctx.fillStyle=warna; ctx.fillRect(x,by+bh-h,w,h); ctx.fillStyle='#e2e8f0'; ctx.font="11px 'JetBrains Mono',monospace"; ctx.fillText(I.toFixed(1)+' A',x+w/2,by+bh-h-6); ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText(label,x+w/2,by+bh+16);};
  batang(bx+bw*0.12,bw*0.3,I1,'rgba(239,68,68,.75)','sebelum (pf '+pf1.toFixed(2)+')');
  batang(bx+bw*0.58,bw*0.3,I2,'rgba(0,224,158,.75)','sesudah (pf '+pf2.toFixed(2)+')');
  _ttlTulis('segitigaInfo','Sebelum: Q₁ = P·tan φ₁ = '+Q1.toFixed(2)+' kVAR, S₁ = '+S1.toFixed(2)+' kVA, I₁ = '+I1.toFixed(2)+' A   |   Sesudah: Q₂ = '+Q2.toFixed(2)+' kVAR, S₂ = '+S2.toFixed(2)+' kVA, I₂ = '+I2.toFixed(2)+' A ('+((1-I2/I1)*100).toFixed(1)+'% lebih kecil; rugi saluran I²R turun '+((1-(I2/I1)**2)*100).toFixed(1)+'%)   |   Q_C = '+Qc.toFixed(2)+' kVAR → bank Δ: C per fasa = '+Cfasa.toFixed(1)+' µF pada '+VL+' V');
  if(_ttlJalan('segitiga')){_sgFrame++; requestAnimationFrame(drawSegitiga);}
}

// ── ANIMASI 4 — Sistem tiga fasa seimbang: gelombang, fasor, daya sesaat ──
let _tfFrame=0;
function toggleTigaFasa(){_ttlToggle('tigafasa','btnTigaFasa',drawTigaFasa);}
window.toggleTigaFasa=toggleTigaFasa;
function drawTigaFasa(){
  const k=_ttlKanvas('cvTigaFasa'); if(!k) return; const {ctx,W,H}=k;
  const VL=_ttlNilai('sl_tf_vl',400), IL=_ttlNilai('sl_tf_il',18.5), pf=_ttlNilai('sl_tf_pf',0.8);
  _ttlTulis('v_tf_vl',VL.toFixed(0)); _ttlTulis('v_tf_il',IL.toFixed(1)); _ttlTulis('v_tf_pf',pf.toFixed(2));
  const Vp=VL/Math.sqrt(3), phi=Math.acos(pf), P=Math.sqrt(3)*VL*IL*pf, Q=Math.sqrt(3)*VL*IL*Math.sin(phi), S=Math.sqrt(3)*VL*IL;
  const wt=(_tfFrame*0.03)%(2*Math.PI);
  const warna=['rgba(239,68,68,.95)','rgba(255,179,0,.95)','rgba(0,229,255,.95)'], nama=['a','b','c'];
  // kiri: fasor
  const cx=90, cy=H/2, r=Math.min(H/2-26,80);
  ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  for(let p=0;p<3;p++){const a=-wt+p*2*Math.PI/3; _ttlPanah(ctx,cx,cy,cx+r*Math.cos(a),cy+r*Math.sin(a),warna[p],2.2); _ttlPanah(ctx,cx,cy,cx+r*0.6*Math.cos(a+phi),cy+r*0.6*Math.sin(a+phi),warna[p].replace('.95','.5'),1.6);}
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='rgba(148,163,184,.85)'; ctx.fillText('V_a, V_b, V_c (tebal) dan I (tipis, φ = '+(phi/_RAD).toFixed(1)+'°)',cx,cy+r+18); ctx.fillText('V_fasa = '+Vp.toFixed(1)+' V',cx,cy-r-12);
  // tengah: gelombang tegangan tiga fasa; bawah: daya sesaat tiap fasa + total
  const gx=cx+r+40, gw=W-gx-20, gy1=H*0.3, gh1=H*0.22, gy2=H*0.76, gh2=H*0.2;
  _ttlSumbu(ctx,gx,gy1,gw,gh1*2); _ttlSumbu(ctx,gx,gy2,gw,gh2*2);
  const Vm=Vp*Math.SQRT2, Im=IL*Math.SQRT2, Pfasa=Vp*IL*pf;
  for(let p=0;p<3;p++){
    ctx.strokeStyle=warna[p]; ctx.lineWidth=1.8; ctx.beginPath();
    for(let i=0;i<=300;i++){const th=i/300*4*Math.PI; const y=gy1-gh1*0.9*Math.sin(th-wt-p*2*Math.PI/3); i?ctx.lineTo(gx+i/300*gw,y):ctx.moveTo(gx+i/300*gw,y);} ctx.stroke();
    ctx.strokeStyle=warna[p].replace('.95','.55'); ctx.lineWidth=1.2; ctx.beginPath();
    for(let i=0;i<=300;i++){const th=i/300*4*Math.PI; const pw=Vm*Math.sin(th-wt-p*2*Math.PI/3)*Im*Math.sin(th-wt-p*2*Math.PI/3-phi); const y=gy2-pw/(3*Pfasa*1.6)*gh2; i?ctx.lineTo(gx+i/300*gw,y):ctx.moveTo(gx+i/300*gw,y);} ctx.stroke();
  }
  _ttlGaris(ctx,gx,gy2-3*Pfasa/(3*Pfasa*1.6)*gh2,gx+gw,gy2-3*Pfasa/(3*Pfasa*1.6)*gh2,'rgba(0,224,158,.95)',2.6);
  ctx.textAlign='left'; ctx.fillStyle='rgba(0,224,158,.95)'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('p_a + p_b + p_c = P = '+(P/1000).toFixed(2)+' kW (konstan!)',gx+6,gy2-3*Pfasa/(3*Pfasa*1.6)*gh2-6);
  ctx.fillStyle='rgba(148,163,184,.85)'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('v_a, v_b, v_c: beda fasa 120°',gx+6,gy1-gh1-4); ctx.fillText('p(t) tiap fasa berayun, jumlahnya rata',gx+6,gy2-gh2-4);
  _ttlTulis('tigaFasaInfo','V_fasa = V_L/√3 = '+Vp.toFixed(2)+' V   |   P = √3·V_L·I_L·cos φ = '+(P/1000).toFixed(3)+' kW,  Q = '+(Q/1000).toFixed(3)+' kVAR,  S = '+(S/1000).toFixed(3)+' kVA   |   per fasa: P = '+(Pfasa/1000).toFixed(3)+' kW; beban Y setara Z = '+(Vp/IL).toFixed(2)+' Ω ∠'+(phi/_RAD).toFixed(1)+'° = '+(Vp/IL*pf).toFixed(2)+' + j'+(Vp/IL*Math.sin(phi)).toFixed(2)+' Ω');
  if(_ttlJalan('tigafasa')){_tfFrame++; requestAnimationFrame(drawTigaFasa);}
}

_TTL_DAFTAR.push(['cvFasor',()=>drawFasor(),'fasor',['sl_fs_vm','sl_fs_im','sl_fs_phi']]);
_TTL_DAFTAR.push(['cvImpedansi',()=>drawImpedansi(),'impedansi',['sl_im_r','sl_im_l','sl_im_c','sl_im_f']]);
_TTL_DAFTAR.push(['cvSegitiga',()=>drawSegitiga(),'segitiga',['sl_sg_p','sl_sg_pf1','sl_sg_pf2']]);
_TTL_DAFTAR.push(['cvTigaFasa',()=>drawTigaFasa(),'tigafasa',['sl_tf_vl','sl_tf_il','sl_tf_pf']]);
_ttlMulai();
