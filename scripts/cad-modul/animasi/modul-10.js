// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 10 PEMODELAN CAD — Optimasi Desain Pasca-Simulasi
// Kanvas: cvFilletKt, cvRusuk, cvLubangMassa, cvIprofil (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C10_SIZIN=125, _C10_E=210000;
function _cad10Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y); ctx.textAlign='left';}
// Batang ukur tegak: nilai v terhadap skala maks; garis batas (mis. σ_izin) opsional.
function _cad10Gauge(ctx,x,y0,w,h,v,maks,warna,label,batas){
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=1; ctx.strokeRect(x,y0-h,w,h);
  const f=Math.max(0,Math.min(1,v/maks)); ctx.fillStyle=warna; ctx.globalAlpha=.55; ctx.fillRect(x,y0-h*f,w,h*f); ctx.globalAlpha=1;
  if(batas){const yb=y0-h*Math.min(1,batas/maks); _ttlGaris(ctx,x-6,yb,x+w+6,yb,'#ef4444',1.2,[4,3]);}
  _cad10Teks(ctx,label,x+w/2,y0+14,'rgba(226,232,240,.85)',"10px 'JetBrains Mono',monospace",'center');
}
function _cad10Igab(b,t,tr,hr){const A1=b*t,y1=t/2,A2=tr*hr,y2=t+hr/2; const yb=(A1*y1+A2*y2)/(A1+A2); return {I:b*t*t*t/12+A1*(y1-yb)*(y1-yb)+tr*hr*hr*hr/12+A2*(y2-yb)*(y2-yb),yb:yb};}
function _cad10KtLubang(x){return 3.00-3.13*x+3.66*x*x-1.53*x*x*x;}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Radius fillet pada bahu: Kt dan σ_maks turun
// ════════════════════════════════════════════════════════════
let _fkFrame=0;
function toggleFilletKt(){_ttlToggle('filletkt','btnFilletKt',drawFilletKt);}
window.toggleFilletKt=toggleFilletKt;
function drawFilletKt(){
  const k=_ttlKanvas('cvFilletKt'); if(!k) return; const {ctx,W,H}=k;
  const rM=_ttlNilai('sl_fk_r',2), h=_ttlNilai('sl_fk_h',5), sn=_ttlNilai('sl_fk_s',90);
  _ttlTulis('v_fk_r',rM.toFixed(1)); _ttlTulis('v_fk_h',h.toFixed(0)); _ttlTulis('v_fk_s',sn.toFixed(0));
  const r=_ttlJalan('filletkt')?0.5+(rM-0.5)*(0.5+0.5*Math.sin(_fkFrame/45-Math.PI/2)):rM;
  const Kt=1+0.5*Math.sqrt(h/r), sm=Kt*sn;
  const d=20, D=d+2*h, L1=36, L2=34;
  const sk=Math.max(0.05,Math.min((W*0.56)/(L1+L2+8),(H-80)/(D+6)));
  const ox=W*0.05, oy=H*0.52, X=x=>ox+x*sk, Y=y=>oy-y*sk;
  // batang bertingkat dengan fillet radius r di kedua sudut dalam bahu
  ctx.beginPath(); ctx.moveTo(X(0),Y(D/2)); ctx.lineTo(X(L1),Y(D/2)); ctx.lineTo(X(L1),Y(d/2+r));
  ctx.arc(X(L1+r),Y(d/2+r),r*sk,Math.PI,Math.PI/2,true);
  ctx.lineTo(X(L1+L2),Y(d/2)); ctx.lineTo(X(L1+L2),Y(-d/2)); ctx.lineTo(X(L1+r),Y(-d/2));
  ctx.arc(X(L1+r),Y(-d/2-r),r*sk,3*Math.PI/2,Math.PI,true);
  ctx.lineTo(X(L1),Y(-D/2)); ctx.lineTo(X(0),Y(-D/2)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.stroke();
  // jepit kiri, beban F di ujung kanan
  for(let i=0;i<=6;i++){const yy=Y(D/2)+i*(D*sk/6); _ttlGaris(ctx,X(0),yy,X(0)-8,yy+8,'#94a3b8',1);}
  _ttlGaris(ctx,X(L1+L2-4),Y(d/2)-34,X(L1+L2-4),Y(d/2)-4,'#f59e0b',1.8); ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(X(L1+L2-4),Y(d/2)-2); ctx.lineTo(X(L1+L2-4)-5,Y(d/2)-11); ctx.lineTo(X(L1+L2-4)+5,Y(d/2)-11); ctx.fill();
  _cad10Teks(ctx,'F',X(L1+L2-4)+8,Y(d/2)-22,'#f59e0b',"bold 11px 'JetBrains Mono',monospace");
  // sorotan merah di kaki fillet, sebanding (Kt − 1)
  const a=Math.max(0.05,Math.min(0.85,(Kt-1)/1.3));
  [[X(L1+2),Y(d/2)-2],[X(L1+2),Y(-d/2)+2]].forEach(([cx,cy])=>{const g=ctx.createRadialGradient(cx,cy,1,cx,cy,14+8*a); g.addColorStop(0,'rgba(239,68,68,'+a+')'); g.addColorStop(1,'rgba(239,68,68,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,14+8*a,0,Math.PI*2); ctx.fill();});
  _cad10Teks(ctx,'r = '+r.toFixed(1),X(L1+r)+4,Y(d/2+r)-6,'#ec4899',"bold 10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'h = '+h.toFixed(0),X(L1)-6,Y(D/2)+12,'#f59e0b',"10px 'JetBrains Mono',monospace",'right');
  _cad10Teks(ctx,'Bahu bertingkat D/d = '+(D/d).toFixed(2)+', fillet r = '+r.toFixed(1)+' mm',12,18,'rgba(226,232,240,.92)');
  // panel kanan: batang σ_nom dan σ_maks vs σ_izin
  const gx=W*0.66, gy=H*0.80, gh=H*0.52, maks=Math.max(200,sm*1.15);
  _cad10Gauge(ctx,gx,gy,34,gh,sn,maks,'#22d3ee','σ_nom',_C10_SIZIN);
  _cad10Gauge(ctx,gx+70,gy,34,gh,sm,maks,sm>_C10_SIZIN?'#ef4444':'#00e09e','σ_maks',_C10_SIZIN);
  _cad10Teks(ctx,'σ_izin 125',gx+118,gy-gh*Math.min(1,_C10_SIZIN/maks)+4,'#ef4444',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'Kt ≈ 1 + 0,5·√(h/r) = '+Kt.toFixed(2),gx,H*0.16,'#22d3ee');
  _cad10Teks(ctx,'σ_maks = Kt·σ_nom = '+sm.toFixed(1)+' MPa',gx,H*0.16+18,sm>_C10_SIZIN?'#ef4444':'#00e09e');
  _cad10Teks(ctx,sm>_C10_SIZIN?'SF = 250/σ_maks = '+(250/sm).toFixed(2)+' < 2 → perbesar r':'SF = '+(250/sm).toFixed(2)+' ≥ 2 → lolos',gx,H*0.16+36,'rgba(148,163,184,.9)',"10px 'JetBrains Mono',monospace");
  _ttlTulis('filletKtInfo','Bahu h = '+h.toFixed(0)+' mm dengan fillet r = '+r.toFixed(2)+' mm: Kt ≈ 1 + 0,5·√('+h.toFixed(0)+'/'+r.toFixed(2)+') = '+Kt.toFixed(3)+'; σ_maks = '+Kt.toFixed(3)+' × '+sn.toFixed(0)+' = '+sm.toFixed(1)+' MPa ('+(sm>_C10_SIZIN?'melebihi':'di bawah')+' σ_izin 125 MPa, SF = '+(250/sm).toFixed(2)+')');
  if(_ttlJalan('filletkt')){_fkFrame++; requestAnimationFrame(drawFilletKt);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Rusuk tumbuh: momen inersia naik, defleksi turun
// ════════════════════════════════════════════════════════════
let _rbFrame=0;
function toggleRusuk(){_ttlToggle('rusuk','btnRusuk',drawRusuk);}
window.toggleRusuk=toggleRusuk;
function drawRusuk(){
  const k=_ttlKanvas('cvRusuk'); if(!k) return; const {ctx,W,H}=k;
  const hrM=_ttlNilai('sl_rb_hr',25), tr=_ttlNilai('sl_rb_tr',5), F=_ttlNilai('sl_rb_F',400);
  _ttlTulis('v_rb_hr',hrM.toFixed(0)); _ttlTulis('v_rb_tr',tr.toFixed(0)); _ttlTulis('v_rb_F',F.toFixed(0));
  const hr=_ttlJalan('rusuk')?hrM*(0.5+0.5*Math.sin(_rbFrame/50-Math.PI/2)):hrM;
  const b=60, t=6, L=200;
  const I0=b*t*t*t/12, g=hr>0?_cad10Igab(b,t,tr,hr):{I:I0,yb:t/2};
  const d0=F*L*L*L/(3*_C10_E*I0), d1=F*L*L*L/(3*_C10_E*g.I);
  // kiri: penampang T (skala)
  const sk=Math.max(0.05,Math.min((W*0.26)/(b+10),(H-90)/(t+hrM+10)));
  const cx=W*0.16, y0=H*0.80, X=x=>cx+x*sk, Y=y=>y0-y*sk;
  ctx.fillStyle='rgba(34,211,238,.18)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.8; ctx.fillRect(X(-b/2),Y(t),b*sk,t*sk); ctx.strokeRect(X(-b/2),Y(t),b*sk,t*sk);
  if(hr>0){ctx.fillStyle='rgba(245,158,11,.28)'; ctx.strokeStyle='#f59e0b'; ctx.fillRect(X(-tr/2),Y(t+hr),tr*sk,hr*sk); ctx.strokeRect(X(-tr/2),Y(t+hr),tr*sk,hr*sk);}
  _ttlGaris(ctx,X(-b/2)-14,Y(g.yb),X(b/2)+14,Y(g.yb),'#ef4444',1.2,[6,3,2,3]);
  _cad10Teks(ctx,'sumbu netral ȳ = '+g.yb.toFixed(1),X(b/2)+16,Y(g.yb)+4,'#ef4444',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'pelat '+b+' × '+t,cx,y0+16,'#22d3ee',"10px 'JetBrains Mono',monospace",'center');
  if(hr>0) _cad10Teks(ctx,'rusuk '+tr.toFixed(0)+' × '+hr.toFixed(1),X(tr/2)+6,Y(t+hr)+12,'#f59e0b',"10px 'JetBrains Mono',monospace");
  // kanan: kantilever samping dengan lendutan (dilebihkan; δ pelat polos = 28 % tinggi kanvas)
  const bx0=W*0.42, bx1=W*0.92, by=H*0.42, skala=(H*0.28)/Math.max(d0,1e-9);
  for(let i=0;i<=5;i++){_ttlGaris(ctx,bx0,by-24+i*10,bx0-8,by-16+i*10,'#94a3b8',1);} _ttlGaris(ctx,bx0,by-26,bx0,by+28,'#94a3b8',1.6);
  const kurva=(dd,warna,lebar,putus)=>{ctx.strokeStyle=warna; ctx.lineWidth=lebar; ctx.setLineDash(putus||[]); ctx.beginPath(); for(let i=0;i<=40;i++){const x=i/40; const y=dd*skala*(3*x*x-x*x*x)/2; i?ctx.lineTo(bx0+(bx1-bx0)*x,by+y):ctx.moveTo(bx0,by);} ctx.stroke(); ctx.setLineDash([]);};
  kurva(d0,'rgba(148,163,184,.5)',1.2,[5,4]); kurva(d1,'#00e09e',3);
  _ttlGaris(ctx,bx1-6,by+d1*skala+6,bx1-6,by+d1*skala+30,'#f59e0b',1.8); ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(bx1-6,by+d1*skala+32); ctx.lineTo(bx1-11,by+d1*skala+23); ctx.lineTo(bx1-1,by+d1*skala+23); ctx.fill();
  _cad10Teks(ctx,'F = '+F.toFixed(0)+' N',bx1-60,by+d1*skala+44,'#f59e0b',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'pelat polos δ = '+d0.toFixed(2)+' mm',bx0+8,by+d0*skala+16,'rgba(148,163,184,.85)',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'Kantilever L = '+L+' mm, pelat '+b+' × '+t+' baja; rusuk '+tr.toFixed(0)+' × '+hr.toFixed(1)+' mm',12,18,'rgba(226,232,240,.92)');
  _cad10Teks(ctx,'I_gab = '+g.I.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴  ('+(g.I/I0).toFixed(1)+'× pelat)',bx0,H*0.16,'#22d3ee');
  _cad10Teks(ctx,'δ = F·L³/(3·E·I) = '+d1.toFixed(3)+' mm',bx0,H*0.16+18,d1<=L/250?'#00e09e':'#ef4444');
  _cad10Teks(ctx,'batas L/250 = '+(L/250).toFixed(2)+' mm · volume +'+(100*tr*hr/(b*t)).toFixed(0)+' %',bx0,H*0.16+36,'rgba(148,163,184,.9)',"10px 'JetBrains Mono',monospace");
  _ttlTulis('rusukInfo','Rusuk '+tr.toFixed(0)+' × '+hr.toFixed(1)+' mm menggeser sumbu netral ke ȳ = '+g.yb.toFixed(2)+' mm dan menaikkan I dari '+I0.toFixed(0)+' ke '+g.I.toFixed(0)+' mm⁴ ('+(g.I/I0).toFixed(1)+'×); defleksi ujung turun dari '+d0.toFixed(3)+' ke '+d1.toFixed(3)+' mm dengan tambahan luas hanya '+(100*tr*hr/(b*t)).toFixed(0)+' %');
  if(_ttlJalan('rusuk')){_rbFrame++; requestAnimationFrame(drawRusuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Lubang penghemat massa: massa turun, σ_maks naik
// ════════════════════════════════════════════════════════════
let _lmFrame=0;
function toggleLubangMassa(){_ttlToggle('lubangmassa','btnLubangMassa',drawLubangMassa);}
window.toggleLubangMassa=toggleLubangMassa;
function drawLubangMassa(){
  const k=_ttlKanvas('cvLubangMassa'); if(!k) return; const {ctx,W,H}=k;
  const dM=_ttlNilai('sl_lm_d',15), F=_ttlNilai('sl_lm_F',12000), t=_ttlNilai('sl_lm_t',10);
  _ttlTulis('v_lm_d',dM.toFixed(0)); _ttlTulis('v_lm_F',F.toFixed(0)); _ttlTulis('v_lm_t',t.toFixed(0));
  const d=_ttlJalan('lubangmassa')?dM*(0.5+0.5*Math.sin(_lmFrame/50-Math.PI/2)):dM;
  const a=110, b=70;
  const m0=7.85e-3*a*b*t, m=7.85e-3*(a*b*t-3*Math.PI*d*d*t/4);
  const Kt=d>0.01?_cad10KtLubang(d/b):1, sn=F/((b-d)*t), sm=Kt*sn;
  const sk=Math.max(0.05,Math.min((W*0.5)/(a+20),(H-90)/(b+20)));
  const ox=W*0.06, oy=H*0.24, X=x=>ox+x*sk, Y=y=>oy+y*sk;
  ctx.fillStyle='rgba(34,211,238,.16)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.fillRect(X(0),Y(0),a*sk,b*sk); ctx.strokeRect(X(0),Y(0),a*sk,b*sk);
  [0.25,0.5,0.75].forEach(f=>{if(d>0.1){ctx.beginPath(); ctx.arc(X(a*f),Y(b/2),d/2*sk,0,Math.PI*2); ctx.fillStyle='#0a101f'; ctx.fill(); ctx.strokeStyle='#a855f7'; ctx.lineWidth=1.8; ctx.stroke();
    const g=ctx.createRadialGradient(X(a*f),Y(b/2),d/2*sk,X(a*f),Y(b/2),d/2*sk+10); g.addColorStop(0,'rgba(239,68,68,'+Math.min(.8,sm/250)+')'); g.addColorStop(1,'rgba(239,68,68,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(X(a*f),Y(b/2),d/2*sk+10,0,Math.PI*2); ctx.fill();}});
  // gaya tarik kiri-kanan
  _ttlGaris(ctx,X(0)-4,Y(b/2),X(0)-30,Y(b/2),'#f59e0b',1.8); _ttlGaris(ctx,X(a)+4,Y(b/2),X(a)+30,Y(b/2),'#f59e0b',1.8);
  _cad10Teks(ctx,'F',X(0)-30,Y(b/2)-8,'#f59e0b',"bold 11px 'JetBrains Mono',monospace",'center'); _cad10Teks(ctx,'F',X(a)+30,Y(b/2)-8,'#f59e0b',"bold 11px 'JetBrains Mono',monospace",'center');
  _cad10Teks(ctx,'pelat '+a+' × '+b+' × '+t.toFixed(0)+', 3 lubang ⌀'+d.toFixed(1),X(a/2),Y(b)+16,'#22d3ee',"10px 'JetBrains Mono',monospace",'center');
  _cad10Teks(ctx,'Pelat 3 lubang LinearPattern: massa vs tegangan tepi lubang',12,18,'rgba(226,232,240,.92)');
  // batang ukur: massa dan σ_maks
  const gx=W*0.66, gy=H*0.80, gh=H*0.50;
  _cad10Gauge(ctx,gx,gy,34,gh,m,m0,'#22d3ee','massa');
  _cad10Gauge(ctx,gx+70,gy,34,gh,sm,Math.max(250,sm*1.1),sm>_C10_SIZIN?'#ef4444':'#00e09e','σ_maks',_C10_SIZIN);
  _cad10Teks(ctx,'σ_izin 125',gx+118,gy-gh*Math.min(1,_C10_SIZIN/Math.max(250,sm*1.1))+4,'#ef4444',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'m = '+m.toFixed(1)+' g (−'+(100*(m0-m)/m0).toFixed(1)+' %)',gx,H*0.16,'#22d3ee');
  _cad10Teks(ctx,'Kt('+(d/b).toFixed(2)+') = '+Kt.toFixed(2)+' · σ_nom = '+sn.toFixed(1),gx,H*0.16+18,'rgba(148,163,184,.9)',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'σ_maks = '+sm.toFixed(1)+' MPa'+(sm>_C10_SIZIN?' → GAGAL':' → lolos'),gx,H*0.16+36,sm>_C10_SIZIN?'#ef4444':'#00e09e');
  _ttlTulis('lubangMassaInfo','Tiga lubang ⌀'+d.toFixed(1)+' pada pelat '+a+' × '+b+' × '+t.toFixed(0)+' menurunkan massa dari '+m0.toFixed(1)+' ke '+m.toFixed(1)+' g; tegangan nominal F/((b − d)·t) = '+sn.toFixed(2)+' MPa dikalikan Kt = '+Kt.toFixed(2)+' menjadi σ_maks = '+sm.toFixed(1)+' MPa ('+(sm>_C10_SIZIN?'melebihi':'≤')+' σ_izin 125 MPa)');
  if(_ttlJalan('lubangmassa')){_lmFrame++; requestAnimationFrame(drawLubangMassa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Profil I vs persegi panjang ber-I sama (parameter B, H, t_f, t_w)
// ════════════════════════════════════════════════════════════
let _ipFrame=0;
function toggleIprofil(){_ttlToggle('iprofil','btnIprofil',drawIprofil);}
window.toggleIprofil=toggleIprofil;
function drawIprofil(){
  const k=_ttlKanvas('cvIprofil'); if(!k) return; const {ctx,W,H}=k;
  const B=_ttlNilai('sl_ip_B',50), Hh=_ttlNilai('sl_ip_H',90), tf=Math.min(_ttlNilai('sl_ip_tf',6),Hh/2-1), tw=Math.min(_ttlNilai('sl_ip_tw',5),B-1);
  _ttlTulis('v_ip_B',B.toFixed(0)); _ttlTulis('v_ip_H',Hh.toFixed(0)); _ttlTulis('v_ip_tf',tf.toFixed(1)); _ttlTulis('v_ip_tw',tw.toFixed(1));
  const I=(B*Hh*Hh*Hh-(B-tw)*Math.pow(Hh-2*tf,3))/12, A=B*Hh-(B-tw)*(Hh-2*tf);
  const hR=Math.cbrt(12*I/B), AR=B*hR;
  const hNow=_ttlJalan('iprofil')?hR*(0.5+0.5*Math.sin(_ipFrame/55-Math.PI/2)):hR;
  const Inow=B*hNow*hNow*hNow/12;
  const sk=Math.max(0.05,Math.min((W*0.18)/B,(H-90)/Math.max(Hh,hR)));
  const cx1=W*0.17, cx2=W*0.46, cy=H*0.52;
  // profil I
  const p=[[-B/2,-Hh/2],[B/2,-Hh/2],[B/2,-Hh/2+tf],[tw/2,-Hh/2+tf],[tw/2,Hh/2-tf],[B/2,Hh/2-tf],[B/2,Hh/2],[-B/2,Hh/2],[-B/2,Hh/2-tf],[-tw/2,Hh/2-tf],[-tw/2,-Hh/2+tf],[-B/2,-Hh/2+tf]];
  ctx.beginPath(); p.forEach((q,i)=>i?ctx.lineTo(cx1+q[0]*sk,cy+q[1]*sk):ctx.moveTo(cx1+q[0]*sk,cy+q[1]*sk)); ctx.closePath();
  ctx.fillStyle='rgba(34,211,238,.18)'; ctx.fill(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.stroke();
  // persegi panjang lebar B, tinggi tumbuh sampai I sama
  ctx.fillStyle='rgba(236,72,153,.16)'; ctx.strokeStyle='#ec4899'; ctx.fillRect(cx2-B/2*sk,cy-hNow/2*sk,B*sk,hNow*sk); ctx.strokeRect(cx2-B/2*sk,cy-hNow/2*sk,B*sk,hNow*sk);
  _ttlGaris(ctx,cx1-B/2*sk-16,cy,cx2+B/2*sk+16,cy,'#ef4444',1,[8,3,2,3]);
  _cad10Teks(ctx,'X',cx2+B/2*sk+20,cy+4,'#ef4444',"bold 10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'profil I  B '+B.toFixed(0)+' · H '+Hh.toFixed(0)+' · t_f '+tf.toFixed(1)+' · t_w '+tw.toFixed(1),cx1,cy+Math.max(Hh,hR)/2*sk+18,'#22d3ee',"10px 'JetBrains Mono',monospace",'center');
  _cad10Teks(ctx,'persegi panjang B × '+hNow.toFixed(1),cx2,cy+Math.max(Hh,hR)/2*sk+18,'#ec4899',"10px 'JetBrains Mono',monospace",'center');
  _cad10Teks(ctx,'Iterasi penampang: alias B, H, t_f, t_w → I_x; persegi panjang tumbuh sampai I sama',12,18,'rgba(226,232,240,.92)');
  const tx=W*0.66;
  _cad10Teks(ctx,'I_x = [B·H³ − (B − t_w)(H − 2t_f)³]/12',tx,H*0.16,'#22d3ee',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'= '+I.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴, A = '+A.toFixed(0)+' mm²',tx,H*0.16+18,'#00e09e');
  _cad10Teks(ctx,'persegi panjang: I = '+Inow.toLocaleString('id-ID',{maximumFractionDigits:0})+' mm⁴',tx,H*0.16+46,'#ec4899',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'h = '+hNow.toFixed(1)+' mm, A = '+(B*hNow).toFixed(0)+' mm²',tx,H*0.16+64,'#ec4899',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'I sama saat h = (12·I/B)^(1/3) = '+hR.toFixed(1),tx,H*0.16+92,'rgba(148,163,184,.9)',"10px 'JetBrains Mono',monospace");
  _cad10Teks(ctx,'→ massa '+(AR/A).toFixed(2)+'× profil I',tx,H*0.16+110,'#f59e0b');
  _ttlTulis('iprofilInfo','Profil I B = '+B.toFixed(0)+', H = '+Hh.toFixed(0)+', t_f = '+tf.toFixed(1)+', t_w = '+tw.toFixed(1)+': I_x = '+I.toFixed(0)+' mm⁴ dengan luas '+A.toFixed(0)+' mm²; persegi panjang selebar B butuh tinggi '+hR.toFixed(2)+' mm (luas '+AR.toFixed(0)+' mm², '+(AR/A).toFixed(2)+'× massa per satuan panjang) untuk momen inersia yang sama');
  if(_ttlJalan('iprofil')){_ipFrame++; requestAnimationFrame(drawIprofil);}
}

_TTL_DAFTAR.push(['cvFilletKt',()=>drawFilletKt(),'filletkt',['sl_fk_r','sl_fk_h','sl_fk_s']]);
_TTL_DAFTAR.push(['cvRusuk',()=>drawRusuk(),'rusuk',['sl_rb_hr','sl_rb_tr','sl_rb_F']]);
_TTL_DAFTAR.push(['cvLubangMassa',()=>drawLubangMassa(),'lubangmassa',['sl_lm_d','sl_lm_F','sl_lm_t']]);
_TTL_DAFTAR.push(['cvIprofil',()=>drawIprofil(),'iprofil',['sl_ip_B','sl_ip_H','sl_ip_tf','sl_ip_tw']]);
_ttlMulai();
