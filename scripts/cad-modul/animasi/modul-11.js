// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 11 PEMODELAN CAD — Perakitan Komponen dan Analisis Sistem
// Kanvas: cvEngkol, cvPusatMassa, cvSabuk, cvClearance (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C11C='#22d3ee', _C11A='#f59e0b', _C11G='#00e09e', _C11R='#ef4444', _C11V='#a855f7', _C11P='#ec4899', _C11T='rgba(226,232,240,.92)', _C11M='rgba(148,163,184,.85)';
function _cad11Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
function _cad11Lingkar(ctx,x,y,r,isi,garis,lebar,putus){ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad11Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad11Kotak(ctx,x,y,w,h,isi,garis,lebar){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h); ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}
function _cad11X(r,l,th){const s=r*Math.sin(th); return r*Math.cos(th)+Math.sqrt(Math.max(0,l*l-s*s));}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Engkol-peluncur: Revolute + Slider menyisakan satu DOF
// ════════════════════════════════════════════════════════════
let _ekFrame=0;
function toggleEngkol(){_ttlToggle('engkol','btnEngkol',drawEngkol);}
window.toggleEngkol=toggleEngkol;
function drawEngkol(){
  const k=_ttlKanvas('cvEngkol'); if(!k) return; const {ctx,W,H}=k;
  const r=_ttlNilai('sl_ek_r',25), l=Math.max(_ttlNilai('sl_ek_l',90),r+10), thS=_ttlNilai('sl_ek_th',60);
  _ttlTulis('v_ek_r',r.toFixed(0)); _ttlTulis('v_ek_l',l.toFixed(0)); _ttlTulis('v_ek_th',thS.toFixed(0));
  const thD=_ttlJalan('engkol')?(_ekFrame*1.5)%360:thS, th=thD*Math.PI/180;
  const x=_cad11X(r,l,th), xmin=l-r, xmax=l+r, phi=Math.asin(r*Math.sin(th)/l);
  const sk=Math.max(0.05,Math.min((W*0.56)/(xmax+r+40),(H-80)/(2*r+40)));
  const ox=W*0.04+(r+10)*sk, oy=H*0.52;
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // rel dan arsir dasar (grounded)
  const yRel=oy+12*sk;
  _ttlGaris(ctx,X(xmin-r-8),yRel,X(xmax+r+14),yRel,'rgba(148,163,184,.6)',1.4);
  for(let xx=X(xmin-r-8);xx<X(xmax+r+14);xx+=12) _ttlGaris(ctx,xx,yRel,xx-6,yRel+8,'rgba(148,163,184,.3)',1);
  _ttlGaris(ctx,X(xmin-r-8),oy,X(xmax+r+14),oy,'rgba(148,163,184,.25)',1,[5,4]);
  // batas langkah
  [xmin,xmax].forEach(v=>_ttlGaris(ctx,X(v),oy-16*sk,X(v),yRel,'rgba(0,224,158,.35)',1,[3,3]));
  _cad11Lingkar(ctx,X(0),Y(0),r*sk,null,'rgba(245,158,11,.35)',1,[4,4]);
  const A=[X(r*Math.cos(th)),Y(r*Math.sin(th))], B=[X(x),Y(0)];
  _cad11Kotak(ctx,B[0]-12*sk,oy-10*sk,24*sk,22*sk,'rgba(168,85,247,.25)',_C11V,1.6);
  _ttlGaris(ctx,A[0],A[1],B[0],B[1],_C11C,Math.max(3,4*sk));
  _ttlGaris(ctx,X(0),Y(0),A[0],A[1],_C11A,Math.max(4,5*sk));
  [[X(0),Y(0),'O'],[A[0],A[1],'A'],[B[0],B[1],'B']].forEach(([px,py,n])=>{_cad11Lingkar(ctx,px,py,4,'#0a101f','#e2e8f0',1.5); _cad11Teks(ctx,n,px+7,py-7,'#e2e8f0',"bold 10px 'JetBrains Mono',monospace");});
  // sudut θ
  ctx.strokeStyle=_C11G; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),18,0,-th,true); ctx.stroke();
  _cad11Teks(ctx,'θ',X(0)+22,Y(0)-6,_C11G,"bold 11px 'JetBrains Mono',monospace");
  // dimensi x
  const yD=yRel+22;
  _ttlGaris(ctx,X(0),yRel+4,X(0),yD+6,_C11G,0.8,[3,2]); _ttlGaris(ctx,B[0],yRel+4,B[0],yD+6,_C11G,0.8,[3,2]);
  _cad11Panah(ctx,X(0),yD,B[0],yD,_C11G); _cad11Panah(ctx,B[0],yD,X(0),yD,_C11G);
  _cad11Teks(ctx,'x = '+x.toFixed(2),(X(0)+B[0])/2,yD-5,_C11G,"10px 'JetBrains Mono',monospace",'center');
  _cad11Teks(ctx,'Engkol r = '+r+' (Revolute O), batang l = '+l+' (Revolute A, B), peluncur pada rel (Slider) — dasar grounded',12,18,_C11T);
  // kolom kanan: DOF dan rumus
  const tx=W*0.64;
  _cad11Teks(ctx,'Revolute ×3 + Slider ×1',tx,H*0.14,_C11T);
  _cad11Teks(ctx,'F = 3(4 − 1) − 2·4 = 1 DOF',tx,H*0.14+18,_C11G);
  _cad11Teks(ctx,'θ = '+thD.toFixed(0)+'°  →  φ = '+(phi*180/Math.PI).toFixed(2)+'°',tx,H*0.14+38,_C11A);
  _cad11Teks(ctx,'x = r cosθ + √(l² − r² sin²θ)',tx,H*0.14+58,_C11C);
  _cad11Teks(ctx,'  = '+x.toFixed(3)+' mm',tx,H*0.14+76,_C11G);
  _cad11Teks(ctx,'x ∈ ['+xmin+', '+xmax+'], langkah 2r = '+(2*r),tx,H*0.14+94,_C11M,"10px 'JetBrains Mono',monospace");
  // grafik x(θ)
  const gx=tx, gy=H-14, gw=W-12-tx, gh=H*0.34;
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  ctx.strokeStyle=_C11C; ctx.lineWidth=1.5; ctx.beginPath();
  for(let i=0;i<=72;i++){const tt=i/72*2*Math.PI; const xv=_cad11X(r,l,tt); const px=gx+i/72*gw, py=gy-(xv-xmin)/(2*r)*gh; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.stroke();
  _cad11Lingkar(ctx,gx+thD/360*gw,gy-(x-xmin)/(2*r)*gh,4,_C11G,null);
  _cad11Teks(ctx,'x(θ)',gx+4,gy-gh+10,_C11M,"9px 'JetBrains Mono',monospace"); _cad11Teks(ctx,'0°',gx,gy+10,_C11M,"9px 'JetBrains Mono',monospace"); _cad11Teks(ctx,'360°',gx+gw,gy+10,_C11M,"9px 'JetBrains Mono',monospace",'right');
  _ttlTulis('engkolInfo','θ = '+thD.toFixed(0)+'°: x = '+r+'·cos θ + √('+l+'² − '+r+'²·sin² θ) = '+x.toFixed(3)+' mm; kemiringan batang φ = '+(phi*180/Math.PI).toFixed(2)+'°. Titik mati luar x = '+xmax+' (θ = 0°), titik mati dalam x = '+xmin+' (θ = 180°); satu sudut engkol menentukan seluruh posisi karena F = 1.');
  if(_ttlJalan('engkol')){_ekFrame++; requestAnimationFrame(drawEngkol);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Placement komponen menggeser pusat massa rakitan
// ════════════════════════════════════════════════════════════
let _pmFrame=0;
function togglePusatMassa(){_ttlToggle('pusatmassa','btnPusatMassa',drawPusatMassa);}
window.togglePusatMassa=togglePusatMassa;
function drawPusatMassa(){
  const k=_ttlKanvas('cvPusatMassa'); if(!k) return; const {ctx,W,H}=k;
  const a=120, b=70, t=15;
  const xS=_ttlNilai('sl_pm_x',60), dB=_ttlNilai('sl_pm_d',30), hB=_ttlNilai('sl_pm_h',40);
  _ttlTulis('v_pm_x',xS.toFixed(0)); _ttlTulis('v_pm_d',dB.toFixed(0)); _ttlTulis('v_pm_h',hB.toFixed(0));
  const lo=dB/2+2, hi=a-dB/2-2;
  const xB=_ttlJalan('pusatmassa')?(lo+hi)/2+(hi-lo)/2*Math.sin(_pmFrame/45):Math.min(hi,Math.max(lo,xS));
  const V1=a*b*t, V2=Math.PI/4*dB*dB*hB;
  const xbar=(V1*a/2+V2*xB)/(V1+V2), zbar=(V1*t/2+V2*(t+hB/2))/(V1+V2);
  // tampak atas (kiri)
  const skT=Math.max(0.05,Math.min((W*0.40)/(a+10),(H-90)/(b+10)));
  const ox=W*0.04, oy=H*0.16+b*skT;
  const X=v=>ox+v*skT, Y=v=>oy-v*skT;
  _cad11Kotak(ctx,X(0),Y(b),a*skT,b*skT,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Lingkar(ctx,X(xB),Y(b/2),dB/2*skT,'rgba(245,158,11,.25)',_C11A,1.6);
  _cad11Lingkar(ctx,X(a/2),Y(b/2),3.5,null,_C11C,1.4); _cad11Lingkar(ctx,X(xB),Y(b/2),3.5,null,_C11A,1.4);
  _cad11Lingkar(ctx,X(xbar),Y(b/2),4.5,_C11G,'#0a101f',1.2);
  _cad11Teks(ctx,'tampak atas (XY) — pelat '+a+' × '+b+' grounded',X(0),Y(b)-8,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'x̄ = '+xbar.toFixed(2),X(xbar),Y(b/2)+dB/2*skT+16,_C11G,"10px 'JetBrains Mono',monospace",'center');
  // tampak samping (kanan atas)
  const skS=Math.max(0.05,Math.min((W*0.46)/(a+10),(H*0.5)/(t+hB+10)));
  const sx=W*0.52, sz=H*0.56;
  const XS=v=>sx+v*skS, ZS=v=>sz-v*skS;
  _cad11Kotak(ctx,XS(0),ZS(t),a*skS,t*skS,'rgba(34,211,238,.14)',_C11C,1.6);
  _cad11Kotak(ctx,XS(xB-dB/2),ZS(t+hB),dB*skS,hB*skS,'rgba(245,158,11,.22)',_C11A,1.6);
  [[XS(a/2),ZS(t/2),_C11C],[XS(xB),ZS(t+hB/2),_C11A]].forEach(([px,py,c])=>{_cad11Lingkar(ctx,px,py,3.5,'#0a101f',c,1.4); _ttlGaris(ctx,px-7,py,px+7,py,c,1); _ttlGaris(ctx,px,py-7,px,py+7,c,1);});
  _cad11Lingkar(ctx,XS(xbar),ZS(zbar),4.5,_C11G,'#0a101f',1.2);
  _cad11Teks(ctx,'tampak samping (XZ)',XS(0),ZS(t+hB)-10,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'G₁',XS(0)-6,ZS(t/2)+4,_C11C,"9px 'JetBrains Mono',monospace",'right'); _cad11Teks(ctx,'G₂',XS(xB)+dB/2*skS+5,ZS(t+hB/2)+4,_C11A,"9px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'G',XS(xbar)+8,ZS(zbar)-6,_C11G,"bold 10px 'JetBrains Mono',monospace");
  // angka
  const ty=H*0.66;
  _cad11Teks(ctx,'V₁ = '+V1.toLocaleString('id-ID')+' mm³ (pelat), V₂ = '+V2.toFixed(0)+' mm³ (boss ⌀'+dB+' × '+hB+')',sx,ty,_C11T,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'x̄ = (V₁·a/2 + V₂·x_B)/(V₁ + V₂) = '+xbar.toFixed(3)+' mm',sx,ty+18,_C11G,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'z̄ = (V₁·t/2 + V₂·(t + h_B/2))/(V₁ + V₂) = '+zbar.toFixed(3)+' mm',sx,ty+36,_C11G,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'Placement boss x_B = '+xB.toFixed(1)+' mm (Fixed joint + Offset)',sx,ty+54,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'Pusat massa gabungan G bergeser mengikuti Placement boss: x̄ ke arah boss, z̄ naik bila boss makin tinggi/besar',12,18,_C11T);
  _ttlTulis('pusatMassaInfo','Boss pada x_B = '+xB.toFixed(1)+' mm: x̄ = '+xbar.toFixed(3)+' mm, z̄ = '+zbar.toFixed(3)+' mm dari V₁ = '+V1+' dan V₂ = '+V2.toFixed(1)+' mm³; itulah CenterOfMass dari Part.makeCompound(Shape semua link) untuk bahan seragam.');
  if(_ttlJalan('pusatmassa')){_pmFrame++; requestAnimationFrame(drawPusatMassa);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Transmisi sabuk dua puli: panjang sabuk dan rasio putaran
// ════════════════════════════════════════════════════════════
let _sbFrame=0;
function toggleSabuk(){_ttlToggle('sabuk','btnSabuk',drawSabuk);}
window.toggleSabuk=toggleSabuk;
function drawSabuk(){
  const k=_ttlKanvas('cvSabuk'); if(!k) return; const {ctx,W,H}=k;
  const D1=_ttlNilai('sl_sb_d1',75), D2=Math.max(_ttlNilai('sl_sb_d2',150),D1), C=Math.max(_ttlNilai('sl_sb_c',250),(D1+D2)/2+20);
  _ttlTulis('v_sb_d1',D1.toFixed(0)); _ttlTulis('v_sb_d2',D2.toFixed(0)); _ttlTulis('v_sb_c',C.toFixed(0));
  const R1=D1/2, R2=D2/2, beta=Math.asin((R2-R1)/C);
  const Ldekat=2*C+Math.PI*(D1+D2)/2+(D2-D1)*(D2-D1)/(4*C);
  const Ltepat=2*Math.sqrt(C*C-(R2-R1)*(R2-R1))+Math.PI*(D1+D2)/2+(D2-D1)*beta;
  const i=D2/D1, n1=1450, n2=n1/i, lilit=180-2*beta*180/Math.PI;
  const sk=Math.max(0.05,Math.min((W*0.60)/(C+R1+R2+20),(H-70)/(D2+30)));
  const c1x=W*0.04+R1*sk+10, cy=H*0.55, c2x=c1x+C*sk;
  // sabuk (2 busur lilit + 2 garis singgung)
  ctx.strokeStyle=_C11V; ctx.lineWidth=2.4; ctx.beginPath();
  const n=40; let a0=Math.PI/2+beta, a1=3*Math.PI/2-beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; const px=c1x+R1*sk*Math.cos(ang), py=cy-R1*sk*Math.sin(ang); j?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  a0=-Math.PI/2-beta; a1=Math.PI/2+beta;
  for(let j=0;j<=n;j++){const ang=a0+(a1-a0)*j/n; ctx.lineTo(c2x+R2*sk*Math.cos(ang),cy-R2*sk*Math.sin(ang));}
  ctx.closePath(); ctx.stroke();
  _cad11Lingkar(ctx,c1x,cy,R1*sk,'rgba(34,211,238,.15)',_C11C,1.4); _cad11Lingkar(ctx,c2x,cy,R2*sk,'rgba(245,158,11,.15)',_C11A,1.4);
  // jari-jari berputar (rasio i)
  const th1=_sbFrame*4*Math.PI/180, th2=th1/i;
  for(let j=0;j<3;j++){const a=th1+j*2*Math.PI/3; _ttlGaris(ctx,c1x,cy,c1x+R1*sk*0.85*Math.cos(a),cy-R1*sk*0.85*Math.sin(a),'rgba(34,211,238,.6)',1.4);}
  for(let j=0;j<3;j++){const a=th2+j*2*Math.PI/3; _ttlGaris(ctx,c2x,cy,c2x+R2*sk*0.85*Math.cos(a),cy-R2*sk*0.85*Math.sin(a),'rgba(245,158,11,.6)',1.4);}
  _cad11Lingkar(ctx,c1x,cy,3,'#e2e8f0',null); _cad11Lingkar(ctx,c2x,cy,3,'#e2e8f0',null);
  _cad11Teks(ctx,'⌀D₁ = '+D1,c1x,cy+R1*sk+16,_C11C,"10px 'JetBrains Mono',monospace",'center');
  _cad11Teks(ctx,'⌀D₂ = '+D2,c2x,cy+R2*sk+16,_C11A,"10px 'JetBrains Mono',monospace",'center');
  const yD=H-16;
  _cad11Panah(ctx,c1x,yD,c2x,yD,_C11G); _cad11Panah(ctx,c2x,yD,c1x,yD,_C11G);
  _cad11Teks(ctx,'C = '+C,(c1x+c2x)/2,yD-5,_C11G,"10px 'JetBrains Mono',monospace",'center');
  _cad11Teks(ctx,'Puli penggerak n₁ = 1450 rpm (Revolute grounded) → puli ⌀D₂ berjarak C (Distance joint); joint Belt mengopling putaran',12,18,_C11T);
  const tx=W*0.68;
  _cad11Teks(ctx,'L = 2C + π(D₁+D₂)/2',tx,H*0.16,_C11C); _cad11Teks(ctx,'    + (D₂−D₁)²/(4C)',tx,H*0.16+16,_C11C);
  _cad11Teks(ctx,'= '+(2*C).toFixed(1)+' + '+(Math.PI*(D1+D2)/2).toFixed(1)+' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(2),tx,H*0.16+36,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'= '+Ldekat.toFixed(2)+' mm',tx,H*0.16+56,_C11G);
  _cad11Teks(ctx,'singgung tepat: '+Ltepat.toFixed(2)+' mm',tx,H*0.16+76,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'i = D₂/D₁ = '+i.toFixed(3),tx,H*0.16+104,_C11A);
  _cad11Teks(ctx,'n₂ = n₁/i = '+n2.toFixed(0)+' rpm',tx,H*0.16+122,_C11A);
  _cad11Teks(ctx,'lilit puli kecil = '+lilit.toFixed(1)+'°'+(lilit<120?' (< 120°!)':''),tx,H*0.16+142,lilit<120?_C11R:_C11M,"10px 'JetBrains Mono',monospace");
  _ttlTulis('sabukInfo','D₁ = '+D1+', D₂ = '+D2+', C = '+C+': L = 2·'+C+' + π·'+((D1+D2)/2)+' + '+((D2-D1)*(D2-D1)/(4*C)).toFixed(3)+' = '+Ldekat.toFixed(2)+' mm (panjang singgung tepat '+Ltepat.toFixed(2)+' mm, selisih '+Math.abs(Ltepat-Ldekat).toFixed(3)+' mm); rasio i = '+i.toFixed(3)+', puli besar '+n2.toFixed(0)+' rpm; sudut lilit puli kecil '+lilit.toFixed(1)+'°.');
  if(_ttlJalan('sabuk')){_sbFrame++; requestAnimationFrame(drawSabuk);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Kelonggaran poros-lubang: dari longgar ke interferensi
// ════════════════════════════════════════════════════════════
let _clFrame=0;
function toggleClearance(){_ttlToggle('clearance','btnClearance',drawClearance);}
window.toggleClearance=toggleClearance;
function drawClearance(){
  const k=_ttlKanvas('cvClearance'); if(!k) return; const {ctx,W,H}=k;
  const D=_ttlNilai('sl_cl_D',25), dS=_ttlNilai('sl_cl_d',24.94);
  _ttlTulis('v_cl_D',D.toFixed(1).replace('.',',')); _ttlTulis('v_cl_d',dS.toFixed(2).replace('.',','));
  const d=_ttlJalan('clearance')?dS+0.08*Math.sin(_clFrame/40):dS;
  const c=(D-d)/2, zoom=300;
  const R=Math.max(10,Math.min(W*0.22,(H-70)/2)), cx=W*0.26, cy=H*0.52;
  const rd=Math.max(4,R-c*zoom*R/120);          // celah diperbesar 300× relatif (skala gambar R ≙ 120 px)
  const warna=c>0?_C11G:(c<0?_C11R:_C11A);
  // bus (persegi) dan lubang
  _cad11Kotak(ctx,cx-R-24,cy-R-24,2*R+48,2*R+48,'rgba(148,163,184,.08)','rgba(148,163,184,.6)',1.2);
  _cad11Lingkar(ctx,cx,cy,R,'#0a101f',_C11C,1.8);
  // poros; bila interferensi, cincin tumpang tindih merah
  if(c<0){_cad11Lingkar(ctx,cx,cy,rd,'rgba(239,68,68,.35)',_C11R,1.8); _cad11Lingkar(ctx,cx,cy,R,null,_C11C,1.8,[4,3]);}
  else {_cad11Lingkar(ctx,cx,cy,rd,'rgba(245,158,11,.25)',_C11A,1.8);}
  // panah celah radial
  const ang=-0.6;
  if(c>0){_cad11Panah(ctx,cx+rd*Math.cos(ang),cy+rd*Math.sin(ang),cx+R*Math.cos(ang),cy+R*Math.sin(ang),_C11G); _cad11Teks(ctx,'c',cx+R*Math.cos(ang)+8,cy+R*Math.sin(ang)-4,_C11G,"bold 11px 'JetBrains Mono',monospace");}
  _cad11Teks(ctx,'lubang ⌀D (bus, grounded)',cx,cy+R+38,_C11C,"10px 'JetBrains Mono',monospace",'center');
  _cad11Teks(ctx,'poros ⌀d (Cylindrical joint)',cx,cy+R+52,_C11A,"10px 'JetBrains Mono',monospace",'center');
  _cad11Teks(ctx,'Penampang poros di dalam lubang — celah radial diperbesar '+zoom+'× agar terlihat',12,18,_C11T);
  const tx=W*0.56;
  _cad11Teks(ctx,'D = '+D.toFixed(2)+' mm, d = '+d.toFixed(3)+' mm',tx,H*0.2,_C11T);
  _cad11Teks(ctx,'c = (D − d)/2 = '+c.toFixed(4)+' mm',tx,H*0.2+22,warna);
  _cad11Teks(ctx,'celah diameter = '+(2*c).toFixed(4)+' mm',tx,H*0.2+40,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,c>0?'KELONGGARAN — suaian longgar, poros bebas':(c<0?'INTERFERENSI — poros menembus dinding':'PAS — c = 0'),tx,H*0.2+66,warna,"bold 11px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'Std Measure Distance dua silinder = '+(c>0?c.toFixed(4):'0'),tx,H*0.2+90,_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'Part Common volume = '+(c<0?'> 0 (tabrakan!)':'0'),tx,H*0.2+108,c<0?_C11R:_C11M,"10px 'JetBrains Mono',monospace");
  _cad11Teks(ctx,'joint tetap terbentuk; tabrakan harus Anda periksa',tx,H*0.2+130,_C11M,"10px 'JetBrains Mono',monospace");
  _ttlTulis('clearanceInfo','D = '+D.toFixed(2)+', d = '+d.toFixed(3)+': c = ('+D.toFixed(2)+' − '+d.toFixed(3)+')/2 = '+c.toFixed(4)+' mm — '+(c>0?'kelonggaran (Std Measure Distance membaca angka ini)':(c<0?'interferensi: Part Common bervolume > 0, model harus dikoreksi':'pas'))+'.');
  if(_ttlJalan('clearance')){_clFrame++; requestAnimationFrame(drawClearance);}
}

_TTL_DAFTAR.push(['cvEngkol',()=>drawEngkol(),'engkol',['sl_ek_r','sl_ek_l','sl_ek_th']]);
_TTL_DAFTAR.push(['cvPusatMassa',()=>drawPusatMassa(),'pusatmassa',['sl_pm_x','sl_pm_d','sl_pm_h']]);
_TTL_DAFTAR.push(['cvSabuk',()=>drawSabuk(),'sabuk',['sl_sb_d1','sl_sb_d2','sl_sb_c']]);
_TTL_DAFTAR.push(['cvClearance',()=>drawClearance(),'clearance',['sl_cl_D','sl_cl_d']]);
_ttlMulai();
