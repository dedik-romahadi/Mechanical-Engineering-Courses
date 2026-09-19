// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 10 TEKNIK TENAGA LISTRIK — Kompensasi dalam Sistem Distribusi
// Kanvas: cvPenyulang, cvDuaPertiga, cvHarian, cvRegulator
// ════════════════════════════════════════════════════════════
const _SQ3_10=Math.sqrt(3);
// Profil tegangan penyulang beban merata (pu) dengan satu kapasitor: integrasi dari pangkal.
function _profil10(L,r,x,Ip,Iq,Qc_pos,Ic,seg){
  const V=[1]; let v=1; const Vf=20000/_SQ3_10;
  for(let s=0;s<seg;s++){
    const pos=s/seg; const ip=Ip*(1-pos), iq=Iq*(1-pos)-(pos<Qc_pos?Ic:0);
    v-= (r*L/seg*ip + x*L/seg*iq)/Vf; V.push(v);
  }
  return V;
}

// ── ANIMASI 1 — Profil tegangan dan rugi penyulang dengan kapasitor ──
let _pyFrame=0;
function togglePenyulang(){_ttlToggle('penyulang','btnPenyulang',drawPenyulang);}
window.togglePenyulang=togglePenyulang;
function drawPenyulang(){
  const k=_ttlKanvas('cvPenyulang'); if(!k) return; const {ctx,W,H}=k;
  const L=_ttlNilai('sl_py_l',10), I=_ttlNilai('sl_py_i',200), pf=_ttlNilai('sl_py_pf',0.8), Qc=_ttlNilai('sl_py_qc',1500), pos=_ttlNilai('sl_py_pos',0.67);
  _ttlTulis('v_py_l',L.toFixed(0)); _ttlTulis('v_py_i',I.toFixed(0)); _ttlTulis('v_py_pf',pf.toFixed(2)); _ttlTulis('v_py_qc',Qc.toFixed(0)); _ttlTulis('v_py_pos',pos.toFixed(2));
  const r=0.4, x=0.35, Ip=I*pf, Iq=I*Math.sqrt(1-pf*pf), Ic=Qc/(_SQ3_10*20), seg=60;
  const V0=_profil10(L,r,x,Ip,Iq,2,0,seg), V1=_profil10(L,r,x,Ip,Iq,pos,Ic,seg);
  // rugi: Σ 3 I² r dl
  const rugi=(withC)=>{let p=0; for(let s=0;s<seg;s++){const ps=s/seg; const iq=Iq*(1-ps)-(withC&&ps<pos?Ic:0); const ip=Ip*(1-ps); p+=3*(ip*ip+iq*iq)*r*L/seg;} return p/1000;};
  const P0=rugi(false), P1=rugi(true);
  const padL=60,padR=30,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=0.9,vmax=1.03; const X=i=>padL+i/seg*plotW, Y=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right';
  for(const v of [0.9,0.95,1.0]){_ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),v===0.95?'rgba(239,68,68,.6)':'rgba(148,163,184,.12)',1,v===0.95?[4,4]:[]); ctx.fillText((v*20).toFixed(1)+' kV',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let i=0;i<=5;i++) ctx.fillText((L*i/5).toFixed(1)+' km',X(seg*i/5),padT+plotH+16);
  const kurva=(V,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.beginPath(); V.forEach((v,i)=>{const yy=Y(Math.max(vmin,Math.min(vmax,v))); i?ctx.lineTo(X(i),yy):ctx.moveTo(X(i),yy);}); ctx.stroke();};
  kurva(V0,'rgba(239,68,68,.9)',2); kurva(V1,'rgba(0,224,158,.95)',2.6);
  // kapasitor
  const a=0.5+0.5*Math.sin(_pyFrame*0.08); _ttlGaris(ctx,X(pos*seg),padT,X(pos*seg),padT+plotH,'rgba(168,85,247,'+a.toFixed(2)+')',1.6,[4,3]);
  ctx.fillStyle='rgba(168,85,247,.95)'; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('C '+Qc+' kVAR @ '+(pos*L).toFixed(1)+' km',X(pos*seg)+4,padT+12);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('tanpa kapasitor: V_ujung '+(V0[seg]*20).toFixed(2)+' kV, rugi '+P0.toFixed(1)+' kW',padL+6,padT+plotH-30);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('dengan kapasitor: V_ujung '+(V1[seg]*20).toFixed(2)+' kV, rugi '+P1.toFixed(1)+' kW',padL+6,padT+plotH-16);
  const Qb=_SQ3_10*20*Iq;
  _ttlTulis('penyulangInfo','Beban merata: I_pangkal '+I+' A (I_P '+Ip.toFixed(1)+' A, I_Q '+Iq.toFixed(1)+' A), Q_beban = '+Qb.toFixed(0)+' kVAR; r = 0,4, x = 0,35 Ω/km   |   tanpa C: ΔV '+((1-V0[seg])*100).toFixed(2)+' %, rugi '+P0.toFixed(2)+' kW   |   C = '+Qc+' kVAR ('+(Qc/Qb*100).toFixed(0)+' % Q_beban) di '+(pos*100).toFixed(0)+' % panjang: ΔV '+((1-V1[seg])*100).toFixed(2)+' %, rugi '+P1.toFixed(2)+' kW (−'+((1-P1/P0)*100).toFixed(1)+' %)   |   optimum aturan 2/3: '+(Qb*2/3).toFixed(0)+' kVAR di 67 %');
  if(_ttlJalan('penyulang')){_pyFrame++; requestAnimationFrame(drawPenyulang);}
}

// ── ANIMASI 2 — Pengurangan rugi terhadap ukuran dan letak kapasitor (aturan 2/3) ──
let _dpFrame=0;
function toggleDuaPertiga(){_ttlToggle('duapertiga','btnDuaPertiga',drawDuaPertiga);}
window.toggleDuaPertiga=toggleDuaPertiga;
function drawDuaPertiga(){
  const k=_ttlKanvas('cvDuaPertiga'); if(!k) return; const {ctx,W,H}=k;
  const c=_ttlNilai('sl_dp_c',0.67), lam=_ttlNilai('sl_dp_lam',1.0);
  _ttlTulis('v_dp_c',c.toFixed(2)); _ttlTulis('v_dp_lam',lam.toFixed(2));
  // beban merata (λ=1) sampai terpusat di ujung (λ=0): I_Q(x) = I_Q[1 − λx]; rugi reaktif relatif dengan kapasitor c (fraksi I_Q) di posisi p:
  const rugiRel=(cf,p)=>{let s=0;const n=200;for(let i=0;i<n;i++){const xx=(i+0.5)/n; const iq=(1-lam*xx)-(xx<p?cf:0); s+=iq*iq/n;} return s;};
  const base=rugiRel(0,0);
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const X=p=>padL+p*plotW, Y=v=>padT+plotH-v*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right';
  for(let i=0;i<=4;i++){_ttlGaris(ctx,padL,Y(i/4),padL+plotW,Y(i/4),'rgba(148,163,184,.12)',1); ctx.fillText((i*25)+' %',padL-4,Y(i/4)+4);}
  ctx.textAlign='center'; for(let i=0;i<=5;i++) ctx.fillText((i*20)+' %',X(i/5),padT+plotH+16); ctx.fillText('letak kapasitor (% panjang penyulang)',padL+plotW/2,padT+plotH+28);
  // kurva pengurangan rugi vs posisi untuk beberapa ukuran
  const ukuran=[[0.33,'rgba(148,163,184,.7)'],[0.5,'rgba(0,229,255,.8)'],[c,'rgba(0,224,158,.95)'],[1.0,'rgba(255,179,0,.8)']];
  let best={v:-1,p:0};
  ukuran.forEach(([cf,warna],idx)=>{ctx.strokeStyle=warna; ctx.lineWidth=cf===c?2.8:1.6; ctx.beginPath(); for(let i=0;i<=100;i++){const p=i/100; const red=1-rugiRel(cf,p)/base; if(cf===c&&red>best.v) best={v:red,p}; const yy=Y(Math.max(0,red)); i?ctx.lineTo(X(p),yy):ctx.moveTo(X(p),yy);} ctx.stroke(); ctx.fillStyle=warna; ctx.textAlign='left'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillText('C = '+(cf*100).toFixed(0)+' % I_Q',padL+6,padT+12+idx*13);});
  const a=0.5+0.5*Math.sin(_dpFrame*0.08); ctx.fillStyle='rgba(0,224,158,'+(0.5+0.5*a).toFixed(2)+')'; ctx.beginPath(); ctx.arc(X(best.p),Y(best.v),6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('optimum: '+(best.p*100).toFixed(0)+' %, pengurangan '+(best.v*100).toFixed(1)+' %',X(best.p)+8,Y(best.v)-8);
  _ttlTulis('duaPertigaInfo','Sebaran beban λ = '+lam.toFixed(2)+' ('+(lam>0.99?'merata':lam<0.01?'terpusat di ujung':'campuran')+')   |   kapasitor '+(c*100).toFixed(0)+' % I_Q: letak optimum '+(best.p*100).toFixed(0)+' % panjang, pengurangan rugi reaktif '+(best.v*100).toFixed(1)+' %   |   teori beban merata: C = 2/3 I_Q di 2/3 panjang → 88,9 % (8/9); beban terpusat: C = 100 % di ujung → 100 %   |   kapasitor terlalu besar/terlalu jauh justru menaikkan rugi (arus kapasitif berlebih)');
  if(_ttlJalan('duapertiga')){_dpFrame++; requestAnimationFrame(drawDuaPertiga);}
}

// ── ANIMASI 3 — Kurva beban harian: kapasitor tetap + switched ──
let _hrFrame=0;
function toggleHarian(){_ttlToggle('harian','btnHarian',drawHarian);}
window.toggleHarian=toggleHarian;
function drawHarian(){
  const k=_ttlKanvas('cvHarian'); if(!k) return; const {ctx,W,H}=k;
  const Qf=_ttlNilai('sl_hr_qf',600), Qs=_ttlNilai('sl_hr_qs',1200), jamOn=_ttlNilai('sl_hr_on',8), jamOff=_ttlNilai('sl_hr_off',18);
  _ttlTulis('v_hr_qf',Qf.toFixed(0)); _ttlTulis('v_hr_qs',Qs.toFixed(0)); _ttlTulis('v_hr_on',jamOn.toFixed(0)); _ttlTulis('v_hr_off',jamOff.toFixed(0));
  // kurva beban penyulang industri: P(t) kW dan Q(t) kVAR
  const P=t=>1500+2500*Math.exp(-Math.pow((t-13)/4.5,2))+(t>=7&&t<=18?600:0);
  const Q=t=>0.75*P(t)+200;
  const padL=60,padR=20,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const X=t=>padL+t/24*plotW, Y=v=>padT+plotH-v/4000*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right'; for(let v=0;v<=4000;v+=1000){_ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),'rgba(148,163,184,.12)',1); ctx.fillText(v+' kVAR',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let t=0;t<=24;t+=4) ctx.fillText(t+':00',X(t),padT+plotH+16);
  // Q beban
  ctx.strokeStyle='rgba(239,68,68,.95)'; ctx.lineWidth=2; ctx.beginPath(); for(let i=0;i<=240;i++){const t=i/10; i?ctx.lineTo(X(t),Y(Q(t))):ctx.moveTo(X(t),Y(Q(t)));} ctx.stroke();
  // Q kapasitor
  const Qcap=t=>Qf+(t>=jamOn&&t<jamOff?Qs:0);
  ctx.strokeStyle='rgba(0,224,158,.95)'; ctx.lineWidth=2.2; ctx.beginPath(); for(let i=0;i<=240;i++){const t=i/10; i?ctx.lineTo(X(t),Y(Qcap(t))):ctx.moveTo(X(t),Y(Qcap(t)));} ctx.stroke();
  // Q dari jaringan (selisih), diarsir merah bila negatif (pf mendahului)
  ctx.beginPath(); for(let i=0;i<=240;i++){const t=i/10; const q=Q(t)-Qcap(t); i?ctx.lineTo(X(t),Y(Math.max(0,q))):ctx.moveTo(X(t),Y(Math.max(0,q)));} ctx.lineTo(X(24),Y(0)); ctx.lineTo(X(0),Y(0)); ctx.closePath(); ctx.fillStyle='rgba(255,179,0,.18)'; ctx.fill();
  let pfMin=1,pfMax=0,jamLead=0,tMin=0; for(let i=0;i<240;i++){const t=i/10; const q=Q(t)-Qcap(t); const pf=P(t)/Math.hypot(P(t),q); if(q<0) jamLead+=0.1; if(pf<pfMin){pfMin=pf;tMin=t;} if(pf>pfMax) pfMax=pf;}
  const tNow=(_hrFrame*0.05)%24; const qNow=Q(tNow)-Qcap(tNow); ctx.fillStyle=qNow<0?'rgba(239,68,68,.95)':'#00e5ff'; ctx.beginPath(); ctx.arc(X(tNow),Y(Q(tNow)),5,0,Math.PI*2); ctx.fill();
  ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('Q beban',padL+6,padT+12); ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('Q kapasitor (tetap + switched)',padL+70,padT+12); ctx.fillStyle='rgba(255,179,0,.95)'; ctx.fillText('Q dari jaringan',padL+280,padT+12);
  ctx.fillStyle=qNow<0?'rgba(239,68,68,.95)':'#e2e8f0'; ctx.fillText(tNow.toFixed(1)+' h: P '+P(tNow).toFixed(0)+' kW, Q beban '+Q(tNow).toFixed(0)+', Q_C '+Qcap(tNow).toFixed(0)+' → jaringan '+qNow.toFixed(0)+' kVAR, pf '+(P(tNow)/Math.hypot(P(tNow),qNow)).toFixed(3)+(qNow<0?' MENDAHULUI ⚠':''),padL+6,padT+26);
  _ttlTulis('harianInfo','Kapasitor tetap '+Qf+' kVAR + switched '+Qs+' kVAR ('+jamOn+':00–'+jamOff+':00)   |   pf di titik sambung: minimum '+pfMin.toFixed(3)+' pada '+tMin.toFixed(1)+' h, maksimum '+pfMax.toFixed(3)+'; jam dengan pf mendahului (Q negatif, tegangan naik): '+jamLead.toFixed(1)+' jam/hari   |   aturan praktis: tetap ≈ Q minimum malam, switched menutup selisih siang; kendali waktu/tegangan/VAR');
  if(_ttlJalan('harian')){_hrFrame++; requestAnimationFrame(drawHarian);}
}

// ── ANIMASI 4 — Regulator tegangan bertingkat dan LDC ──
let _rgFrame=0;
function toggleRegulator(){_ttlToggle('regulator','btnRegulator',drawRegulator);}
window.toggleRegulator=toggleRegulator;
function drawRegulator(){
  const k=_ttlKanvas('cvRegulator'); if(!k) return; const {ctx,W,H}=k;
  const Vs=_ttlNilai('sl_rg_vs',0.98), I=_ttlNilai('sl_rg_i',250), setp=_ttlNilai('sl_rg_set',1.0), ldc=_ttlNilai('sl_rg_ldc',0.5), L=12;
  _ttlTulis('v_rg_vs',Vs.toFixed(2)); _ttlTulis('v_rg_i',I.toFixed(0)); _ttlTulis('v_rg_set',setp.toFixed(3)); _ttlTulis('v_rg_ldc',ldc.toFixed(2));
  const r=0.4,x=0.35,pf=0.85, Vf=20000/_SQ3_10, seg=60;
  const drop=(pos)=>{ // jatuh tegangan pu dari pangkal sampai pos (beban merata)
    let d=0; for(let s=0;s<pos*seg;s++){const ps=s/seg; d+=(r*L/seg*I*pf*(1-ps)+x*L/seg*I*Math.sqrt(1-pf*pf)*(1-ps))/Vf;} return d;};
  // regulator di pangkal: mengatur agar tegangan di titik LDC (fraksi ldc) = setpoint; tingkat 0,625 %, ±16
  const target=setp+drop(ldc);   // tegangan keluaran regulator yang diperlukan
  let n=Math.round((target/Vs-1)/0.00625); n=Math.max(-16,Math.min(16,n));
  const Vout=Vs*(1+0.00625*n);
  const padL=60,padR=30,padT=24,padB=34,plotW=W-padL-padR,plotH=H-padT-padB;
  const vmin=0.88,vmax=1.08; const X=p=>padL+p*plotW, Y=v=>padT+plotH-(v-vmin)/(vmax-vmin)*plotH;
  _ttlGaris(ctx,padL,padT,padL,padT+plotH,'rgba(148,163,184,.45)',1.2); _ttlGaris(ctx,padL,padT+plotH,padL+plotW,padT+plotH,'rgba(148,163,184,.45)',1.2);
  ctx.font="10px 'JetBrains Mono',monospace"; ctx.fillStyle='rgba(148,163,184,.7)'; ctx.textAlign='right';
  for(const v of [0.9,0.95,1.0,1.05]){_ttlGaris(ctx,padL,Y(v),padL+plotW,Y(v),(v===0.95||v===1.05)?'rgba(239,68,68,.6)':'rgba(148,163,184,.12)',1,(v===0.95||v===1.05)?[4,4]:[]); ctx.fillText((v*20).toFixed(1)+' kV',padL-4,Y(v)+4);}
  ctx.textAlign='center'; for(let i=0;i<=4;i++) ctx.fillText((L*i/4).toFixed(0)+' km',X(i/4),padT+plotH+16);
  const kurva=(V0,warna,lebar)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.beginPath(); for(let i=0;i<=seg;i++){const p=i/seg; const v=V0-drop(p); i?ctx.lineTo(X(p),Y(v)):ctx.moveTo(X(p),Y(v));} ctx.stroke();};
  kurva(Vs,'rgba(239,68,68,.9)',2); kurva(Vout,'rgba(0,224,158,.95)',2.6);
  const a=0.5+0.5*Math.sin(_rgFrame*0.08); _ttlGaris(ctx,X(ldc),padT,X(ldc),padT+plotH,'rgba(168,85,247,'+a.toFixed(2)+')',1.6,[4,3]);
  ctx.fillStyle='rgba(168,85,247,.95)'; ctx.textAlign='left'; ctx.font="600 10px 'JetBrains Mono',monospace"; ctx.fillText('titik regulasi LDC ('+(ldc*L).toFixed(1)+' km) → set '+(setp*20).toFixed(2)+' kV',X(ldc)+4,padT+12);
  ctx.fillStyle='rgba(239,68,68,.95)'; ctx.fillText('tanpa regulator: ujung '+((Vs-drop(1))*20).toFixed(2)+' kV',padL+6,padT+plotH-30);
  ctx.fillStyle='rgba(0,224,158,.95)'; ctx.fillText('regulator tingkat '+(n>0?'+':'')+n+' ('+((1+0.00625*n-1)*100).toFixed(2)+' %): keluaran '+(Vout*20).toFixed(2)+' kV, ujung '+((Vout-drop(1))*20).toFixed(2)+' kV',padL+6,padT+plotH-16);
  _ttlTulis('regulatorInfo','Tegangan sumber '+(Vs*20).toFixed(2)+' kV, arus pangkal '+I+' A pf 0,85, beban merata 12 km   |   jatuh tegangan sampai titik LDC = '+(drop(ldc)*100).toFixed(2)+' %, sampai ujung = '+(drop(1)*100).toFixed(2)+' %   |   regulator memilih tingkat '+n+' (5/8 % per tingkat, ±16) agar titik LDC = '+(setp*20).toFixed(2)+' kV; keluaran '+(Vout*20).toFixed(2)+' kV, ujung '+((Vout-drop(1))*20).toFixed(2)+' kV, pangkal '+(Vout>1.05?'⚠ melampaui 21 kV':'aman')+'   |   LDC = 0 mengatur tegangan rel gardu saja; LDC = 1 mengatur ujung');
  if(_ttlJalan('regulator')){_rgFrame++; requestAnimationFrame(drawRegulator);}
}

_TTL_DAFTAR.push(['cvPenyulang',()=>drawPenyulang(),'penyulang',['sl_py_l','sl_py_i','sl_py_pf','sl_py_qc','sl_py_pos']]);
_TTL_DAFTAR.push(['cvDuaPertiga',()=>drawDuaPertiga(),'duapertiga',['sl_dp_c','sl_dp_lam']]);
_TTL_DAFTAR.push(['cvHarian',()=>drawHarian(),'harian',['sl_hr_qf','sl_hr_qs','sl_hr_on','sl_hr_off']]);
_TTL_DAFTAR.push(['cvRegulator',()=>drawRegulator(),'regulator',['sl_rg_vs','sl_rg_i','sl_rg_set','sl_rg_ldc']]);
_ttlMulai();
