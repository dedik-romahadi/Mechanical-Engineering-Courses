// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 12 PEMODELAN CAD — Identifikasi Masalah Desain dan Solusi Optimasi
// Kanvas: cvFit, cvTabrak, cvDinding, cvLengan (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// ════════════════════════════════════════════════════════════
const _C12C='#22d3ee', _C12A='#f59e0b', _C12G='#00e09e', _C12R='#ef4444', _C12V='#a855f7', _C12P='#ec4899', _C12T='rgba(226,232,240,.92)', _C12M='rgba(148,163,184,.85)';
function _cad12Teks(ctx,s,x,y,warna,font,align){ctx.fillStyle=warna; ctx.font=font||"11px 'JetBrains Mono',monospace"; ctx.textAlign=align||'left'; ctx.fillText(s,x,y);}
function _cad12Kotak(ctx,x,y,w,h,isi,garis,lebar){if(isi){ctx.fillStyle=isi; ctx.fillRect(x,y,w,h);} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.strokeRect(x,y,w,h);}}
function _cad12Lingkar(ctx,x,y,r,isi,garis,lebar,putus){ctx.setLineDash(putus||[]); ctx.beginPath(); ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2); if(isi){ctx.fillStyle=isi; ctx.fill();} if(garis){ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.2; ctx.stroke();} ctx.setLineDash([]);}
function _cad12Panah(ctx,x1,y1,x2,y2,warna){const a=Math.atan2(y2-y1,x2-x1); _ttlGaris(ctx,x1,y1,x2,y2,warna,1.2); ctx.fillStyle=warna; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-7*Math.cos(a)+3.5*Math.sin(a),y2-7*Math.sin(a)-3.5*Math.cos(a)); ctx.lineTo(x2-7*Math.cos(a)-3.5*Math.sin(a),y2-7*Math.sin(a)+3.5*Math.cos(a)); ctx.closePath(); ctx.fill();}
function _cad12Koma(x,d){return x.toFixed(d).replace('.',',');}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Zona toleransi bergeser: dari suaian longgar ke sesak
// ════════════════════════════════════════════════════════════
let _ftFrame=0;
function toggleFit(){_ttlToggle('fit','btnFit',drawFit);}
window.toggleFit=toggleFit;
function drawFit(){
  const k=_ttlKanvas('cvFit'); if(!k) return; const {ctx,W,H}=k;
  const ES=_ttlNilai('sl_ft_ES',18), esS=_ttlNilai('sl_ft_es',-6), IT=_ttlNilai('sl_ft_it',11);
  _ttlTulis('v_ft_ES',ES.toFixed(0)); _ttlTulis('v_ft_es',(esS<0?'−':'')+Math.abs(esS).toFixed(0)); _ttlTulis('v_ft_it',IT.toFixed(0));
  const es=_ttlJalan('fit')?Math.round(-40+70*(0.5+0.5*Math.sin(_ftFrame/90))):esS;
  const ei=es-IT, EI=0;
  const cMaks=(ES-ei)/1000, cMin=(EI-es)/1000;
  const jenis=cMin>0?'SUAIAN LONGGAR':(cMaks<0?'SUAIAN SESAK':'SUAIAN TRANSISI');
  const warna=cMin>0?_C12G:(cMaks<0?_C12R:_C12A);
  const atas=Math.max(ES,es,0)+6, bawah=Math.min(ei,0)-6;
  const sk=Math.max(0.05,(H*0.56)/(atas-bawah));
  const y0=H*0.30+atas*sk, Z=v=>y0-v*sk;
  const x1=W*0.10, x2=W*0.30, lb=Math.max(20,W*0.14);
  // garis nol
  _ttlGaris(ctx,W*0.05,Z(0),W*0.52,Z(0),_C12R,1.4,[7,4]);
  _cad12Teks(ctx,'garis nol (ukuran nominal)',W*0.05,Z(0)-6,_C12R,"9px 'JetBrains Mono',monospace");
  // zona lubang (H: EI = 0) dan zona poros
  _cad12Kotak(ctx,x1,Z(ES),lb,Math.max(1,(ES-EI)*sk),'rgba(34,211,238,.22)',_C12C,1.6);
  _cad12Kotak(ctx,x2,Z(es),lb,Math.max(1,IT*sk),'rgba(245,158,11,.22)',_C12A,1.6);
  _cad12Teks(ctx,'lubang H',x1+lb/2,H*0.20,_C12C,"10px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'poros',x2+lb/2,H*0.20,_C12A,"10px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'ES +'+ES,x1+lb+6,Z(ES)+4,_C12C,"9px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'EI 0',x1+lb+6,Z(EI)+12,_C12C,"9px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'es '+(es<0?'−':'+')+Math.abs(es),x2+lb+6,Z(es)+4,_C12A,"9px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'ei '+(ei<0?'−':'+')+Math.abs(ei),x2+lb+6,Z(ei)+12,_C12A,"9px 'JetBrains Mono',monospace");
  // pita kelonggaran maksimum (ES .. ei)
  _cad12Panah(ctx,W*0.06,Z(ES),W*0.06,Z(ei),warna); _cad12Panah(ctx,W*0.06,Z(ei),W*0.06,Z(ES),warna);
  _cad12Teks(ctx,'c_maks',W*0.06+4,(Z(ES)+Z(ei))/2,warna,"9px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'Zona toleransi (µm): huruf menetapkan letaknya terhadap garis nol, angka IT menetapkan lebarnya',12,18,_C12T);
  // kolom kanan
  const tx=W*0.58;
  _cad12Teks(ctx,'lubang: '+(12+EI/1000).toFixed(4)+' … '+(12+ES/1000).toFixed(4)+' mm',tx,H*0.22,_C12C,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'poros : '+(12+ei/1000).toFixed(4)+' … '+(12+es/1000).toFixed(4)+' mm',tx,H*0.22+18,_C12A,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'c_maks = (ES − ei)/1000 = '+cMaks.toFixed(4)+' mm',tx,H*0.22+44,warna);
  _cad12Teks(ctx,'c_min  = (EI − es)/1000 = '+cMin.toFixed(4)+' mm',tx,H*0.22+64,warna);
  _cad12Teks(ctx,jenis,tx,H*0.22+92,warna,"bold 12px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,cMin>0?'poros selalu bebas berputar':(cMaks<0?'harus dipres atau dipanaskan':'bisa longgar, bisa sesak'),tx,H*0.22+112,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'contoh nominal ⌀12 mm',tx,H*0.22+136,_C12M,"10px 'JetBrains Mono',monospace");
  _ttlTulis('fitInfo','ES = +'+ES+', EI = 0, es = '+es+', ei = '+ei+' µm → c_maks = ('+ES+' − ('+ei+'))/1000 = '+cMaks.toFixed(4)+' mm dan c_min = (0 − ('+es+'))/1000 = '+cMin.toFixed(4)+' mm — '+jenis.toLowerCase()+'. Kelonggaran maksimum selalu dibaca dari lubang terbesar bertemu poros terkecil.');
  if(_ttlJalan('fit')){_ftFrame++; requestAnimationFrame(drawFit);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Dua komponen saling masuk: volume interferensi vs δ
// ════════════════════════════════════════════════════════════
let _tbFrame=0;
function toggleTabrak(){_ttlToggle('tabrak','btnTabrak',drawTabrak);}
window.toggleTabrak=toggleTabrak;
function drawTabrak(){
  const k=_ttlKanvas('cvTabrak'); if(!k) return; const {ctx,W,H}=k;
  const dS=_ttlNilai('sl_tb_d',2.5), b=_ttlNilai('sl_tb_b',45), h=_ttlNilai('sl_tb_h',28);
  _ttlTulis('v_tb_d',_cad12Koma(dS,1)); _ttlTulis('v_tb_b',b.toFixed(0)); _ttlTulis('v_tb_h',h.toFixed(0));
  const d=_ttlJalan('tabrak')?(-3+7.5*(0.5+0.5*Math.sin(_tbFrame/70))):dS;
  const a1=60, a2=50, V=d>0?d*b*h:0;
  const sk=Math.max(0.05,Math.min((W*0.50)/(a1+a2+14),(H*0.44)/(b+10)));
  const ox=W*0.05, oy=H*0.30;
  const X=v=>ox+v*sk, Y=v=>oy+v*sk;
  _cad12Kotak(ctx,X(0),Y(0),a1*sk,b*sk,'rgba(34,211,238,.12)',_C12C,1.6);
  _cad12Kotak(ctx,X(a1-d),Y(0),a2*sk,b*sk,'rgba(245,158,11,.12)',_C12A,1.6);
  if(d>0) _cad12Kotak(ctx,X(a1-d),Y(0),d*sk,b*sk,'rgba(239,68,68,.45)',_C12R,1.4);
  _cad12Teks(ctx,'A',X(a1/2),Y(0)-8,_C12C,"bold 11px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'B',X(a1-d+a2/2),Y(0)-8,_C12A,"bold 11px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'tampak atas (XY) — penampang bersama b × h',X(0),Y(b)+16,_C12M,"10px 'JetBrains Mono',monospace");
  if(d>0){_cad12Teks(ctx,'δ = '+_cad12Koma(d,2),X(a1-d/2),Y(b)+34,_C12R,"10px 'JetBrains Mono',monospace",'center');}
  else{_cad12Teks(ctx,'celah = '+_cad12Koma(-d,2)+' mm',X(a1-d/2),Y(b)+34,_C12G,"10px 'JetBrains Mono',monospace",'center');}
  _cad12Teks(ctx,'Part → Boolean → Common menyisakan irisan A ∩ B; volumenya adalah ukuran tabrakan',12,18,_C12T);
  // kolom kanan
  const tx=W*0.60;
  _cad12Teks(ctx,'V_int = δ · b · h',tx,H*0.22,_C12C);
  _cad12Teks(ctx,d>0?('= '+_cad12Koma(d,2)+' × '+b+' × '+h):'= 0 (tidak bertabrakan)',tx,H*0.22+18,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'= '+V.toFixed(2)+' mm³',tx,H*0.22+40,d>0?_C12R:_C12G,"bold 12px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'distToShape = '+(d>0?'0,000 (menembus)':_cad12Koma(-d,3)+' mm'),tx,H*0.22+64,d>0?_C12R:_C12G,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,d>0?'TABRAKAN — model harus diperbaiki':'AMAN — masih ada celah',tx,H*0.22+88,d>0?_C12R:_C12G,"bold 11px 'JetBrains Mono',monospace");
  // grafik V_int(δ)
  const gx=tx, gy=H-16, gw=Math.max(40,W-14-tx), gh=H*0.26;
  _ttlGaris(ctx,gx,gy,gx+gw,gy,'rgba(148,163,184,.5)',1); _ttlGaris(ctx,gx,gy,gx,gy-gh,'rgba(148,163,184,.5)',1);
  const vmax=12*b*h;
  ctx.strokeStyle=_C12R; ctx.lineWidth=1.5; ctx.beginPath();
  for(let i=0;i<=60;i++){const dv=-3+i/60*15; const vv=dv>0?dv*b*h:0; const px=gx+i/60*gw, py=gy-vv/vmax*gh; i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.stroke();
  _cad12Lingkar(ctx,gx+(d+3)/15*gw,gy-V/vmax*gh,4,_C12G,null);
  _cad12Teks(ctx,'V_int(δ)',gx+4,gy-gh+10,_C12M,"9px 'JetBrains Mono',monospace");
  _ttlTulis('tabrakInfo',d>0?('δ = '+_cad12Koma(d,2)+' mm: V_int = δ·b·h = '+_cad12Koma(d,2)+' × '+b+' × '+h+' = '+V.toFixed(2)+' mm³; Part Common menghasilkan solid dan distToShape bernilai 0, jadi kedua komponen benar-benar menembus.'):('Tidak ada tumpang tindih: Part Common kosong (V_int = 0) dan distToShape memberi jarak terdekat '+_cad12Koma(-d,3)+' mm — itulah kelonggaran rakit yang tersedia.'));
  if(_ttlJalan('tabrak')){_tbFrame++; requestAnimationFrame(drawTabrak);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Dinding tipis: tebal dinding w terhadap volume dan batas proses
// ════════════════════════════════════════════════════════════
let _ddFrame=0;
function toggleDinding(){_ttlToggle('dinding','btnDinding',drawDinding);}
window.toggleDinding=toggleDinding;
function drawDinding(){
  const k=_ttlKanvas('cvDinding'); if(!k) return; const {ctx,W,H}=k;
  const a=80, bb=60, h=40;
  const wS=_ttlNilai('sl_dd_w',4), pS=_ttlNilai('sl_dd_p',30), wMin=_ttlNilai('sl_dd_min',3);
  _ttlTulis('v_dd_w',_cad12Koma(wS,1)); _ttlTulis('v_dd_p',pS.toFixed(0)); _ttlTulis('v_dd_min',_cad12Koma(wMin,1));
  const w=_ttlJalan('dinding')?(1+11*(0.5+0.5*Math.sin(_ddFrame/80))):wS;
  const p=Math.min(pS,h-1), ai=Math.max(0.1,a-2*w), bi=Math.max(0.1,bb-2*w);
  const V=a*bb*h-ai*bi*p, dasar=h-p;
  const tipis=w<wMin, dasarTipis=dasar<wMin;
  const warna=tipis?_C12R:_C12G;
  const sk=Math.max(0.05,Math.min((W*0.46)/(a+16),(H*0.46)/(h+16)));
  const ox=W*0.06, oy=H*0.30+h*sk;
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  // penampang XZ: badan penuh lalu rongga Pocket
  _cad12Kotak(ctx,X(0),Y(h),a*sk,h*sk,tipis?'rgba(239,68,68,.16)':'rgba(34,211,238,.16)',tipis?_C12R:_C12C,1.8);
  _cad12Kotak(ctx,X(w),Y(h),ai*sk,p*sk,'#0a101f','rgba(168,85,247,.85)',1.4);
  // penanda tebal dinding dan dasar
  _cad12Panah(ctx,X(0),Y(h)-10,X(w),Y(h)-10,warna); _cad12Panah(ctx,X(w),Y(h)-10,X(0),Y(h)-10,warna);
  _cad12Teks(ctx,'w = '+_cad12Koma(w,2),X(w)+8,Y(h)-14,warna,"10px 'JetBrains Mono',monospace");
  _cad12Panah(ctx,X(a)+12,Y(dasar),X(a)+12,Y(0),dasarTipis?_C12R:_C12M);
  _cad12Teks(ctx,'dasar '+_cad12Koma(dasar,1),X(a)+18,Y(dasar/2)+4,dasarTipis?_C12R:_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'Pocket p = '+p.toFixed(0),X(w+ai/2),Y(h)+16,_C12V,"10px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'penampang rumah '+a+' × '+h+' mm (b = '+bb+' mm)',X(0),Y(0)+18,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'Menipiskan dinding memang mengurangi volume, tetapi di bawah batas proses ia menjadi cacat',12,18,_C12T);
  // batas proses sebagai pita
  const tx=W*0.60;
  _cad12Teks(ctx,'V = a·b·h − (a−2w)(b−2w)·p',tx,H*0.22,_C12C,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'= '+(a*bb*h).toFixed(0)+' − '+(ai*bi*p).toFixed(0),tx,H*0.22+18,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'= '+V.toFixed(2)+' mm³',tx,H*0.22+40,_C12G,"bold 12px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'tebal dinding w = '+_cad12Koma(w,2)+' mm',tx,H*0.22+66,warna);
  _cad12Teks(ctx,'batas proses w_min = '+_cad12Koma(wMin,1)+' mm',tx,H*0.22+86,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,tipis?'DI BAWAH BATAS — cacat isi / melengkung':'MEMENUHI BATAS PROSES',tx,H*0.22+110,warna,"bold 11px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,dasarTipis?'dasar '+_cad12Koma(dasar,1)+' mm juga di bawah batas':'dasar h − p = '+_cad12Koma(dasar,1)+' mm',tx,H*0.22+132,dasarTipis?_C12R:_C12M,"10px 'JetBrains Mono',monospace");
  _ttlTulis('dindingInfo','w = '+_cad12Koma(w,2)+' mm, p = '+p.toFixed(0)+' mm: V = '+(a*bb*h).toFixed(0)+' − '+ai.toFixed(2)+' × '+bi.toFixed(2)+' × '+p.toFixed(0)+' = '+V.toFixed(2)+' mm³, dasar '+_cad12Koma(dasar,1)+' mm. '+(tipis?'Tebal dinding di bawah batas proses '+_cad12Koma(wMin,1)+' mm: hemat bahan tetapi berisiko cacat.':'Tebal dinding memenuhi batas proses '+_cad12Koma(wMin,1)+' mm.'));
  if(_ttlJalan('dinding')){_ddFrame++; requestAnimationFrame(drawDinding);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Lengan berputar mendekati dinding: jarak bebas minimum
// ════════════════════════════════════════════════════════════
let _lgFrame=0;
function toggleLengan(){_ttlToggle('lengan','btnLengan',drawLengan);}
window.toggleLengan=toggleLengan;
function drawLengan(){
  const k=_ttlKanvas('cvLengan'); if(!k) return; const {ctx,W,H}=k;
  const R=_ttlNilai('sl_lg_R',70), w=_ttlNilai('sl_lg_w',24), Wd=_ttlNilai('sl_lg_W',100);
  _ttlTulis('v_lg_R',R.toFixed(0)); _ttlTulis('v_lg_w',w.toFixed(0)); _ttlTulis('v_lg_W',Wd.toFixed(0));
  const rs=Math.hypot(R,w/2), cMin=Wd-rs, thStar=Math.atan2(w/2,R)*180/Math.PI;
  const th=_ttlJalan('lengan')?(_lgFrame*0.9)%360:(360-thStar);
  const tr=th*Math.PI/180;
  const sudut=[[0,-w/2],[R,-w/2],[R,w/2],[0,w/2]].map(([x,y])=>[x*Math.cos(tr)-y*Math.sin(tr),x*Math.sin(tr)+y*Math.cos(tr)]);
  const xMaks=Math.max.apply(null,sudut.map(q=>q[0]));
  const cSaat=Wd-xMaks;
  const sk=Math.max(0.05,Math.min((W*0.50)/(Wd+rs*0.4+30),(H*0.46)/(rs+10)));
  const ox=W*0.06+rs*sk, oy=H*0.52;
  const X=v=>ox+v*sk, Y=v=>oy-v*sk;
  _cad12Lingkar(ctx,X(0),Y(0),rs*sk,null,'rgba(236,72,153,.55)',1,[5,4]);
  // dinding
  _cad12Kotak(ctx,X(Wd),H*0.10,10,H*0.78,'rgba(148,163,184,.20)','rgba(148,163,184,.65)',1.2);
  for(let yy=H*0.12;yy<H*0.86;yy+=14) _ttlGaris(ctx,X(Wd)+10,yy,X(Wd)+18,yy-6,'rgba(148,163,184,.4)',0.8);
  // lengan
  ctx.beginPath(); sudut.forEach(([x,y],i)=>{i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}); ctx.closePath();
  ctx.fillStyle=cSaat>0?'rgba(34,211,238,.20)':'rgba(239,68,68,.35)'; ctx.fill();
  ctx.strokeStyle=cSaat>0?_C12C:_C12R; ctx.lineWidth=1.8; ctx.stroke();
  _cad12Lingkar(ctx,X(0),Y(0),4,'#e2e8f0',null);
  _cad12Teks(ctx,'sumbu putar',X(0)-6,Y(0)+18,_C12M,"9px 'JetBrains Mono',monospace",'right');
  // jarak sesaat
  const warna=cSaat>0?(Math.abs(cSaat-cMin)<0.5?_C12G:_C12A):_C12R;
  _cad12Panah(ctx,X(xMaks),Y(0)-24,X(Wd),Y(0)-24,warna);
  _cad12Teks(ctx,_cad12Koma(cSaat,2),(X(xMaks)+X(Wd))/2,Y(0)-30,warna,"10px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'θ = '+th.toFixed(0)+'°',X(0),H-12,_C12M,"10px 'JetBrains Mono',monospace",'center');
  _cad12Teks(ctx,'Titik terjauh lengan adalah sudut ujungnya: ia menyapu lingkaran √(R² + (w/2)²), bukan R',12,18,_C12T);
  const tx=W*0.62;
  _cad12Teks(ctx,'√(R² + (w/2)²) = '+rs.toFixed(3)+' mm',tx,H*0.22,_C12P);
  _cad12Teks(ctx,'W − R = '+(Wd-R).toFixed(3)+' mm (keliru)',tx,H*0.22+20,_C12M,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'c_min = W − √(R² + (w/2)²)',tx,H*0.22+44,_C12C);
  _cad12Teks(ctx,'      = '+cMin.toFixed(3)+' mm',tx,H*0.22+64,cMin>0?_C12G:_C12R,"bold 12px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'θ* = arctan((w/2)/R) = '+thStar.toFixed(2)+'°',tx,H*0.22+88,_C12A,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,'jarak sesaat = '+_cad12Koma(cSaat,3)+' mm',tx,H*0.22+110,warna,"10px 'JetBrains Mono',monospace");
  _cad12Teks(ctx,cMin>0?'AMAN sepanjang putaran':'MENABRAK — perpendek R atau jauhkan dinding',tx,H*0.22+134,cMin>0?_C12G:_C12R,"bold 11px 'JetBrains Mono',monospace");
  _ttlTulis('lenganInfo','R = '+R+', w = '+w+', W = '+Wd+': jarak sudut terjauh ke sumbu = √('+R+'² + '+(w/2)+'²) = '+rs.toFixed(3)+' mm, sehingga c_min = '+Wd+' − '+rs.toFixed(3)+' = '+cMin.toFixed(3)+' mm pada θ* = '+thStar.toFixed(2)+'°. Memakai W − R = '+(Wd-R).toFixed(3)+' mm akan menaksir jarak bebas terlalu besar.');
  if(_ttlJalan('lengan')){_lgFrame++; requestAnimationFrame(drawLengan);}
}

_TTL_DAFTAR.push(['cvFit',()=>drawFit(),'fit',['sl_ft_ES','sl_ft_es','sl_ft_it']]);
_TTL_DAFTAR.push(['cvTabrak',()=>drawTabrak(),'tabrak',['sl_tb_d','sl_tb_b','sl_tb_h']]);
_TTL_DAFTAR.push(['cvDinding',()=>drawDinding(),'dinding',['sl_dd_w','sl_dd_p','sl_dd_min']]);
_TTL_DAFTAR.push(['cvLengan',()=>drawLengan(),'lengan',['sl_lg_R','sl_lg_w','sl_lg_W']]);
_ttlMulai();
