// ════════════════════════════════════════════════════════════
// ANIMASI MODUL 7 PEMODELAN CAD — Proyek Gabungan 2D dan 3D, Blok, dan Sub-Assembly
// Kanvas: cvExtrude, cvPolar, cvLoft, cvShell (satu tombol PAUSE per kanvas)
// Helper _ttl* berasal dari animasi/dasar.js (dipakai bersama modul TTL/CAD).
// Kanvas sempit (W < _TTL_SEMPIT, ponsel): judul dipecah per frasa, gambar di atas dan kolom rumus di
// bawahnya; kanvas dipertinggi lewat _ttlKanvas(id, hSempit). Tata letak lebar (desktop) tidak berubah.
// ════════════════════════════════════════════════════════════
const _C7X='#ef4444', _C7Y='#22c55e', _C7Z='#3b82f6';
const _C7F11="11px 'JetBrains Mono',monospace", _C7F10="10px 'JetBrains Mono',monospace";
const _C7TEKS='rgba(226,232,240,.92)', _C7ABU='rgba(148,163,184,.85)';
// Proyeksi ortografis: putar sekeliling Z (azimut), lalu miringkan (elevasi); Z ke atas layar.
function _cad7P(p,az,el,sk,cx,cy){
  const a=az*Math.PI/180, e=el*Math.PI/180;
  const x1=p[0]*Math.cos(a)-p[1]*Math.sin(a), y1=p[0]*Math.sin(a)+p[1]*Math.cos(a), z1=p[2];
  return [cx+sk*x1, cy-sk*(z1*Math.cos(e)+y1*Math.sin(e))];
}
// Selubung cembung titik 2D (rantai monoton Andrew).
function _cad7Selubung(P){
  const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]); if(p.length<3) return p;
  const x=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
  for(const q of p){while(lo.length>=2&&x(lo[lo.length-2],lo[lo.length-1],q)<=0) lo.pop(); lo.push(q);}
  for(let i=p.length-1;i>=0;i--){const q=p[i]; while(up.length>=2&&x(up[up.length-2],up[up.length-1],q)<=0) up.pop(); up.push(q);}
  lo.pop(); up.pop(); return lo.concat(up);
}
// Kotak [x0, y0, x1, y1] bersentuhan dengan poligon cembung S? (uji sumbu pemisah)
function _cad7Kena(S,k){
  const R=[[k[0],k[1]],[k[2],k[1]],[k[2],k[3]],[k[0],k[3]]];
  const pisah=(nx,ny)=>{let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;
    for(const p of S){const v=p[0]*nx+p[1]*ny; if(v<a) a=v; if(v>b) b=v;}
    for(const p of R){const v=p[0]*nx+p[1]*ny; if(v<c) c=v; if(v>d) d=v;}
    return b<c||d<a;};
  if(pisah(1,0)||pisah(0,1)) return false;
  for(let i=0;i<S.length;i++){const p=S[i], q=S[(i+1)%S.length]; if(pisah(q[1]-p[1],p[0]-q[0])) return false;}
  return true;
}
// Tata letak sumbu X/Y/Z dari titik asal: tiap sumbu dipanjangkan (mulai panjang L) sampai hurufnya berada di luar
// selubung proyeksi titik model pts dengan celah 2 px, jadi huruf sumbu tidak pernah dilintasi rusuk model.
// Mengembalikan garis sumbu, letak huruf, dan kotak batas model + huruf.
function _cad7SumbuTata(ctx,az,el,sk,cx,cy,L,pts){
  const O=_cad7P([0,0,0],az,el,sk,cx,cy), M=pts.map(p=>_cad7P(p,az,el,sk,cx,cy)), S=_cad7Selubung(M);
  ctx.font="bold 10px 'JetBrains Mono',monospace";
  const sumbu=[[[L,0,0],_C7X,'X'],[[0,L,0],_C7Y,'Y'],[[0,0,L],_C7Z,'Z']].map(([v,w,n])=>{
    const T=_cad7P(v,az,el,sk,cx,cy), u=ctx.measureText(n);
    let dx=T[0]-O[0], dy=T[1]-O[1]; const s0=Math.hypot(dx,dy)||1; dx/=s0; dy/=s0;
    const hx=(u.actualBoundingBoxLeft+u.actualBoundingBoxRight)/2, hy=(u.actualBoundingBoxAscent+u.actualBoundingBoxDescent)/2;
    const jauh=3+hx*Math.abs(dx)+hy*Math.abs(dy), pusat=s=>[O[0]+dx*(s+jauh),O[1]+dy*(s+jauh)];
    const kena=s=>{const c=pusat(s); return _cad7Kena(S,[c[0]-hx-2,c[1]-hy-2,c[0]+hx+2,c[1]+hy+2]);};
    let s=s0; while(kena(s)&&s<s0+800) s+=4;       // selubung cembung: sekali bebas, lebih jauh tetap bebas
    while(s-1>=s0&&!kena(s-1)) s-=1;
    return {w,n,u,hx,hy,ujung:[O[0]+dx*s,O[1]+dy*s],C:pusat(s)};
  });
  let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
  for(const p of M){x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]);}
  for(const a of sumbu){x0=Math.min(x0,a.C[0]-a.hx); x1=Math.max(x1,a.C[0]+a.hx); y0=Math.min(y0,a.C[1]-a.hy); y1=Math.max(y1,a.C[1]+a.hy);}
  return {O,sumbu,kotak:[x0,y0,x1,y1]};
}
function _cad7Sumbu(ctx,sb){
  ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.textAlign='left';
  for(const a of sb.sumbu){
    ctx.strokeStyle=a.w; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(sb.O[0],sb.O[1]); ctx.lineTo(a.ujung[0],a.ujung[1]); ctx.stroke();
    ctx.fillStyle=a.w; ctx.fillText(a.n,a.C[0]-a.hx+a.u.actualBoundingBoxLeft,a.C[1]+a.hy-a.u.actualBoundingBoxDescent);
  }
}
// Skala dan pusat agar kotak batas model + huruf sumbu berada di daerah D = [x0, y0, x1, y1]. Lebar (tengah = false):
// titik asal tetap dan skala hanya dikecilkan bila perlu, jadi tampilan desktop tetap selama muat. Ponsel
// (tengah = true): tata letak juga digeser ke tengah D. Mengembalikan {sk, cx, cy, sb}.
function _cad7Pas(ctx,az,el,sk,cx,cy,L,pts,D,tengah){
  let sb=_cad7SumbuTata(ctx,az,el,sk,cx,cy,L,pts);
  for(let i=0;i<12;i++){
    const k=sb.kotak;
    if(tengah){
      const f=Math.min(1,(D[2]-D[0])/(k[2]-k[0]),(D[3]-D[1])/(k[3]-k[1])), g=f<1?f*0.99:1, mx=(k[0]+k[2])/2, my=(k[1]+k[3])/2;
      const ncx=(D[0]+D[2])/2+(cx-mx)*g, ncy=(D[1]+D[3])/2+(cy-my)*g;
      if(g===1&&Math.abs(ncx-cx)<0.3&&Math.abs(ncy-cy)<0.3) break;
      sk*=g; cx=ncx; cy=ncy;
    } else {
      let f=1;
      if(k[2]>D[2]) f=Math.min(f,(D[2]-cx)/(k[2]-cx));
      if(k[0]<D[0]) f=Math.min(f,(cx-D[0])/(cx-k[0]));
      if(k[1]<D[1]) f=Math.min(f,(cy-D[1])/(cy-k[1]));
      if(k[3]>D[3]) f=Math.min(f,(D[3]-cy)/(k[3]-cy));
      if(f>=1) break;
      sk*=Math.max(0.2,f*0.98);
    }
    sb=_cad7SumbuTata(ctx,az,el,sk,cx,cy,L,pts);
  }
  return {sk,cx,cy,sb};
}
// Tata letak di atas hanya bergantung pada ukuran kanvas dan slider (bukan bingkai), jadi disimpan per kanvas.
const _c7Tata={};
function _cad7Simpan(nama,kunci,hitung){
  kunci+='|'+(document.fonts?document.fonts.status:'');
  const c=_c7Tata[nama]; if(c&&c.k===kunci) return c.v;
  const v=hitung(); _c7Tata[nama]={k:kunci,v}; return v;
}
function _cad7Poli3(ctx,pts,az,el,sk,cx,cy,isi,garis,lebar,putus){
  const P=pts.map(p=>_cad7P(p,az,el,sk,cx,cy));
  ctx.setLineDash(putus||[]);
  ctx.beginPath(); P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath();
  if(isi){ctx.fillStyle=isi; ctx.fill();} ctx.strokeStyle=garis; ctx.lineWidth=lebar||1.4; ctx.stroke(); ctx.setLineDash([]);
}
function _cad7Silinder(ctx,x0,y0,z0,z1,r,az,el,sk,cx,cy,isi,garis){
  const n=28;
  for(let i=0;i<n;i++){const t0=i/n*2*Math.PI, t1=(i+1)/n*2*Math.PI;
    _cad7Poli3(ctx,[[x0+r*Math.cos(t0),y0+r*Math.sin(t0),z0],[x0+r*Math.cos(t1),y0+r*Math.sin(t1),z0],[x0+r*Math.cos(t1),y0+r*Math.sin(t1),z1],[x0+r*Math.cos(t0),y0+r*Math.sin(t0),z1]],az,el,sk,cx,cy,isi,'rgba(148,163,184,.25)',0.6);}
  const atas=[]; for(let i=0;i<n;i++){const t0=i/n*2*Math.PI; atas.push([x0+r*Math.cos(t0),y0+r*Math.sin(t0),z1]);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,isi,garis,1.3);
}
const _cad7Rp=(x,d)=>x.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});
// Tata letak ponsel: skala dan pusat proyeksi agar semua titik 3D muat di kotak (x0, y0, w, h). Kotak yang
// diberikan sudah menyisakan tepi atas dan kanan untuk huruf sumbu (ditulis di ujung sumbu + (4, −3)).
function _cad7Muat(pts,az,el,x0,y0,w,h){
  const P=pts.map(p=>_cad7P(p,az,el,1,0,0)), xs=P.map(q=>q[0]), ys=P.map(q=>q[1]);
  const xa=Math.min(...xs), xb=Math.max(...xs), ya=Math.min(...ys), yb=Math.max(...ys);
  const sk=Math.max(0.05,Math.min(w/Math.max(xb-xa,1e-6),h/Math.max(yb-ya,1e-6)));
  return {sk,cx:x0+(w-sk*(xb-xa))/2-sk*xa,cy:y0+(h-sk*(yb-ya))/2-sk*ya};
}
// Kolom teks: butir [warna, font, teks]; baris ke-i turun jarak[i] px dari baris sebelumnya (baris pertama di
// y + jarak[0]). Tiap baris dijaga muat maxW oleh _ttlTeks; bila tetap harus dipecah (kolom tablet yang sempit),
// baris lanjutannya berjarak 13 px dan baris-baris berikutnya ikut turun agar tidak saling menimpa.
// Mengembalikan y baris terakhir.
function _cad7Kolom(ctx,x,y,maxW,butir,jarak){
  butir.forEach(([warna,font,teks],i)=>{y+=jarak[i]||0; ctx.fillStyle=warna; ctx.font=font; y=_ttlTeks(ctx,teks,x,y,maxW,{lh:13})-13;});
  return y;
}

// ════════════════════════════════════════════════════════════
// ANIMASI 1 — Profil L ditebalkan: Part Extrude tumbuh sepanjang L
// ════════════════════════════════════════════════════════════
let _c7exFrame=0;
function toggleExtrude(){_ttlToggle('extrude','btnExtrude',drawExtrude);}
window.toggleExtrude=toggleExtrude;
function drawExtrude(){
  const k=_ttlKanvas('cvExtrude',350); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const w=_ttlNilai('sl_ex_w',50), h=_ttlNilai('sl_ex_h',30), tM=_ttlNilai('sl_ex_t',6), LM=_ttlNilai('sl_ex_l',25);
  const t=Math.max(1,Math.min(tM,Math.min(w,h)-2));
  _ttlTulis('v_ex_w',w.toFixed(0)); _ttlTulis('v_ex_h',h.toFixed(0)); _ttlTulis('v_ex_t',t.toFixed(0)); _ttlTulis('v_ex_l',LM.toFixed(0));
  const L=_ttlJalan('extrude')?LM*(0.5+0.5*Math.sin(_c7exFrame/40-Math.PI/2)):LM;
  const az=35, el=28, Ls=Math.max(w,h)*0.45;
  const prof=[[0,0,0],[w,0,0],[w,t,0],[t,t,0],[t,h,0],[0,h,0]], atas=prof.map(p=>[p[0],p[1],L]), penuh=[...prof,...prof.map(p=>[p[0],p[1],LM])];
  // Selubung model pada panjang penuh LM (tetap selama animasi). Ponsel: model + huruf sumbu ditengahkan di bawah
  // judul dua baris. Lebar: titik asal dan skala semula, dikecilkan hanya bila akan masuk judul atau kolom rumus.
  const {sk,cx,cy,sb}=_cad7Simpan('ex',[W,H,w,h,t,LM].join('|'),()=>{
    const D=sempit?[8,44,W-8,224]:[8,30,W*0.64-10,H-6];
    const b0=sempit?_cad7Muat(penuh,az,el,D[0]+18,D[1]+14,D[2]-D[0]-36,D[3]-D[1]-28):{sk:Math.max(0.05,Math.min(W*0.55,H*1.1)/(w+h+LM)*1.05),cx:W*0.30,cy:H*0.72};
    return _cad7Pas(ctx,az,el,b0.sk,b0.cx,b0.cy,Ls,penuh,D,sempit);
  });
  _cad7Sumbu(ctx,sb);
  for(let i=0;i<6;i++){const j=(i+1)%6; _cad7Poli3(ctx,[prof[i],prof[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.1);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.22)','#22d3ee',1.8);
  _cad7Poli3(ctx,prof,az,el,sk,cx,cy,'rgba(245,158,11,.12)','#f59e0b',1.4,[5,3]);
  const A=w*t+(h-t)*t, V=L*A;
  ctx.textAlign='left';
  const judul=['Draft Wire L '+w+' × '+h+' (t = '+t+')','→ Part Extrude '+L.toFixed(1)+' mm searah Z'];
  const butir=[['#f59e0b',_C7F11,'A_L = W·t + (H − t)·t'],['#00e09e',_C7F11,'= '+_cad7Rp(A,1)+' mm²'],['#22d3ee',_C7F11,'V = L·A_L'],['#00e09e',_C7F11,'= '+_cad7Rp(V,1)+' mm³'],
    [_C7ABU,_C7F10,'= '+(V/1000).toFixed(3)+' cm³ → baja '+(V/1000*7.85).toFixed(1)+' g'],[_C7ABU,_C7F10,'Create solid · Direction Normal']];
  if(sempit){
    _cad7Kolom(ctx,10,18,W-18,judul.map(s=>[_C7TEKS,_C7F11,s]),[0,15]);
    _cad7Kolom(ctx,10,246,W-18,butir,[0,17,22,17,19,15]);
  } else {
    ctx.fillStyle=_C7TEKS; ctx.font=_C7F11; ctx.fillText(judul.join(' '),12,18);
    const tx=W*0.64; _cad7Kolom(ctx,tx,H*0.30,W-tx-2,butir,[0,20,30,20,22,20]);
  }
  _ttlTulis('extrudeInfo','Profil L: kaki mendatar W × t = '+(w*t).toFixed(1)+' mm² + kaki tegak (H − t) × t = '+((h-t)*t).toFixed(1)+' mm² → A_L = '+A.toFixed(1)+' mm²; Extrude sepanjang '+L.toFixed(1)+' mm memberi V = '+V.toFixed(2)+' mm³ (Persamaan (1)).');
  if(_ttlJalan('extrude')){_c7exFrame++; requestAnimationFrame(drawExtrude);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 2 — Pola polar lubang baut: jumlah n dan diameter berubah
// ════════════════════════════════════════════════════════════
let _c7poFrame=0;
function togglePolar(){_ttlToggle('polar','btnPolar',drawPolar);}
window.togglePolar=togglePolar;
function drawPolar(){
  const k=_ttlKanvas('cvPolar',376); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const n=Math.max(2,Math.round(_ttlNilai('sl_po_n',6))), D=_ttlNilai('sl_po_D',90), d0M=_ttlNilai('sl_po_d0',26), dbM=_ttlNilai('sl_po_db',7), h=_ttlNilai('sl_po_h',10);
  const d0=Math.max(4,Math.min(d0M,D-30)), Dbc=(D+d0)/2;
  const db=Math.max(2,Math.min(dbM,(D-d0)/2-2,Math.PI*Dbc/n*0.8));
  _ttlTulis('v_po_n',n.toFixed(0)); _ttlTulis('v_po_D',D.toFixed(0)); _ttlTulis('v_po_d0',d0.toFixed(0)); _ttlTulis('v_po_db',db.toFixed(0)); _ttlTulis('v_po_h',h.toFixed(0));
  const tampil=_ttlJalan('polar')?Math.min(n,Math.floor((_c7poFrame/28)%(n+2))+1):n;
  // Sudut antarlubang ditandai dimensi sudut di LUAR cakram: busur pada jari-jari D/2 + 6 px dari lubang induk
  // (sudut 0) sampai lubang kedua (a₁), labelnya di luar busur pada a₁/2. Skala dijaga agar sumbu dan label itu
  // muat di kanan (≥ 14 px sebelum kolom rumus, ≥ 8 px dari tepi kanan ponsel) dan di bawah judul. Ponsel: cakram
  // di tengah (≤ 88 px).
  const a1=2*Math.PI/n, th=a1/2, sSudut=(360/n).toFixed(1)+'°';
  ctx.font="10px 'JetBrains Mono',monospace"; const wSudut=ctx.measureText(sSudut).width;
  const tx=Math.min(W*0.62,W-250), cx=sempit?W/2:W*0.29, cy=sempit?134:H*0.52, kanan=(sempit?W-8:tx-14)-cx, atas=cy-(sempit?42:30);
  const sk=Math.max(0.05,Math.min(sempit?Math.min((W-24)/2,88)/(D/2+8):Math.min((W*0.52)/(D+12),(H-36)/(D+12)),
    kanan/(D/2+8),((kanan-wSudut)/Math.cos(th)-11)/(D/2),((atas-8)/Math.sin(th)-11)/(D/2)));
  const X=x=>cx+x*sk, Y=y=>cy-y*sk;
  // Sumbu Y berhenti di bawah judul.
  ctx.strokeStyle=_C7X; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(-D/2-8),Y(0)); ctx.lineTo(X(D/2+8),Y(0)); ctx.stroke(); ctx.strokeStyle=_C7Y; ctx.beginPath(); ctx.moveTo(X(0),Y(-D/2-8)); ctx.lineTo(X(0),Math.max(Y(D/2+8),sempit?42:28)); ctx.stroke();
  ctx.fillStyle='rgba(34,211,238,.14)'; ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X(0),Y(0),D/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#020812'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(X(0),Y(0),d0/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.arc(X(0),Y(0),Dbc/2*sk,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  for(let i=0;i<tampil;i++){const a=i/n*2*Math.PI; ctx.fillStyle='#020812'; ctx.strokeStyle=i?'#a855f7':'#00e09e'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(X(Dbc/2*Math.cos(a)),Y(Dbc/2*Math.sin(a)),db/2*sk,0,Math.PI*2); ctx.fill(); ctx.stroke();}
  if(n>1){
    const rD=D/2*sk+6, rL=rD+5;
    ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(X(0),Y(0),rD,-a1,0); ctx.stroke();
    [0,a1].forEach(a=>{ctx.beginPath(); ctx.moveTo(X(0)+(rD-3)*Math.cos(a),Y(0)-(rD-3)*Math.sin(a)); ctx.lineTo(X(0)+(rD+3)*Math.cos(a),Y(0)-(rD+3)*Math.sin(a)); ctx.stroke();});
    ctx.fillStyle='#ec4899'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='left'; ctx.fillText(sSudut,X(0)+rL*Math.cos(th),Y(0)-rL*Math.sin(th));
  }
  const V=h*Math.PI/4*(D*D-d0*d0-n*db*db), satu=Math.PI/4*db*db*h;
  ctx.textAlign='left';
  const j1='Flens ⌀'+D+' × '+h+', lubang pusat ⌀'+d0, j2='PolarPattern '+tampil+'/'+n+' lubang ⌀'+db.toFixed(0);
  const sAx='Axis Z · Angle 360°', sOc='Occurrences '+n, sDbc='D_bc = (D + d₀)/2 = '+Dbc.toFixed(1)+' mm', sV='V = h·(π/4)(D² − d₀² − n·d_b²)', sVn='= '+_cad7Rp(V,1)+' mm³';
  const sSatu='tiap lubang baut membuang '+satu.toFixed(1)+' mm³', sN='n lubang: '+(n*satu).toFixed(1)+' mm³', sSud='sudut 360°/n = '+(360/n).toFixed(1)+'°';
  if(sempit){
    _cad7Kolom(ctx,10,18,W-18,[[_C7TEKS,_C7F11,j1],[_C7TEKS,_C7F11,j2]],[0,15]);
    _cad7Kolom(ctx,10,244,W-18,[['#a855f7',_C7F11,sAx],['#a855f7',_C7F11,sOc],['#f59e0b',_C7F11,sDbc],['#22d3ee',_C7F11,sV],['#00e09e',_C7F11,sVn],
      [_C7ABU,_C7F10,sSatu],[_C7ABU,_C7F10,sN],[_C7ABU,_C7F10,sSud]],[0,15,18,22,16,19,14,14]);
  } else {
    ctx.fillStyle=_C7TEKS; ctx.font=_C7F11; ctx.fillText(j1+', '+j2,12,18);
    // Kolom di tx = min(0,62 W, W − 250): tablet digeser ke kiri secukupnya agar baris terpanjang muat.
    _cad7Kolom(ctx,tx,H*0.26,W-tx-2,[['#a855f7',_C7F11,sAx+' · '+sOc],['#f59e0b',_C7F11,sDbc],['#22d3ee',_C7F11,sV],['#00e09e',_C7F11,sVn],
      [_C7ABU,_C7F10,sSatu],[_C7ABU,_C7F10,sN+' · '+sSud]],[0,20,30,20,22,20]);
  }
  _ttlTulis('polarInfo','Cakram (π/4)·'+D+'²·'+h+' = '+(Math.PI/4*D*D*h).toFixed(1)+' mm³ dikurangi lubang pusat '+(Math.PI/4*d0*d0*h).toFixed(1)+' mm³ dan '+n+' lubang baut × '+satu.toFixed(1)+' mm³ → V = '+V.toFixed(2)+' mm³ (Persamaan (2)); posisi D_bc tidak mengubah volume selama lubang tidak saling memotong.');
  if(_ttlJalan('polar')){_c7poFrame++; requestAnimationFrame(drawPolar);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 3 — Loft dua persegi panjang: penampang bergerak dari z = 0 ke z = h
// ════════════════════════════════════════════════════════════
let _c7lfFrame=0;
function toggleLoft(){_ttlToggle('loft','btnLoft',drawLoft);}
window.toggleLoft=toggleLoft;
function drawLoft(){
  const k=_ttlKanvas('cvLoft',368); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const a1=_ttlNilai('sl_lf_a1',50), b1=_ttlNilai('sl_lf_b1',30), a2=_ttlNilai('sl_lf_a2',25), b2=_ttlNilai('sl_lf_b2',15), h=_ttlNilai('sl_lf_h',40);
  _ttlTulis('v_lf_a1',a1.toFixed(0)); _ttlTulis('v_lf_b1',b1.toFixed(0)); _ttlTulis('v_lf_a2',a2.toFixed(0)); _ttlTulis('v_lf_b2',b2.toFixed(0)); _ttlTulis('v_lf_h',h.toFixed(0));
  const z=_ttlJalan('loft')?h*(0.5+0.5*Math.sin(_c7lfFrame/45-Math.PI/2)):h*0.5;
  const s_=z/h, az_=a1+(a2-a1)*s_, bz=b1+(b2-b1)*s_;
  const az=35, el=26, Ls=Math.max(a1,b1)*0.7;
  const R=(a,b,zz)=>[[-a/2,-b/2,zz],[a/2,-b/2,zz],[a/2,b/2,zz],[-a/2,b/2,zz]];
  const bawah=R(a1,b1,0), atas=R(a2,b2,h), tengah=R(az_,bz,z), penuh=[...bawah,...atas];
  // Ponsel: kedua profil + huruf sumbu ditengahkan di bawah judul dua baris. Lebar: titik asal dan skala semula,
  // dikecilkan hanya bila akan masuk judul atau kolom rumus.
  const {sk,cx,cy,sb}=_cad7Simpan('lf',[W,H,a1,b1,a2,b2,h].join('|'),()=>{
    const D=sempit?[8,42,W-8,214]:[8,30,Math.min(W*0.62,W-262)-10,H-6];
    const b0=sempit?_cad7Muat(penuh,az,el,D[0]+18,D[1]+14,D[2]-D[0]-36,D[3]-D[1]-28):{sk:Math.max(0.05,Math.min(W*0.5,H*1.15)/(Math.max(a1,a2)+Math.max(b1,b2)+h)*1.05),cx:W*0.30,cy:H*0.74};
    return _cad7Pas(ctx,az,el,b0.sk,b0.cx,b0.cy,Ls,penuh,D,sempit);
  });
  _cad7Sumbu(ctx,sb);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[bawah[i],bawah[j],atas[j],atas[i]],az,el,sk,cx,cy,'rgba(34,211,238,.10)','rgba(34,211,238,.7)',1.1);}
  _cad7Poli3(ctx,atas,az,el,sk,cx,cy,'rgba(34,211,238,.24)','#22d3ee',1.8);
  _cad7Poli3(ctx,bawah,az,el,sk,cx,cy,'rgba(245,158,11,.12)','#f59e0b',1.4,[5,3]);
  _cad7Poli3(ctx,tengah,az,el,sk,cx,cy,'rgba(236,72,153,.28)','#ec4899',1.6);
  const da=a2-a1, db=b2-b1, V=h*(a1*b1+(a1*db+b1*da)/2+da*db/3), Az=az_*bz;
  ctx.textAlign='left';
  const j1='Loft ruled '+a1+' × '+b1+' (z = 0)', j2='→ '+a2+' × '+b2+' (z = '+h+')', j3='penampang di z = '+z.toFixed(1);
  const sAb='a(z) × b(z) = '+az_.toFixed(1)+' × '+bz.toFixed(1), sAz='A(z) = '+Az.toFixed(1)+' mm²', sV1='V = h·[a₁b₁ + (a₁Δb + b₁Δa)/2', sV2='        + ΔaΔb/3]', sVn='= '+_cad7Rp(V,1)+' mm³';
  const sD='Δa = '+da.toFixed(0)+', Δb = '+db.toFixed(0), sP='prisma a₁b₁h = '+_cad7Rp(a1*b1*h,0);
  if(sempit){
    // Posisi penampang (ujung judul versi lebar) menjadi kepala kelompok merah muda di bawah gambar.
    _cad7Kolom(ctx,10,18,W-18,[[_C7TEKS,_C7F11,j1],[_C7TEKS,_C7F11,j2]],[0,15]);
    _cad7Kolom(ctx,10,236,W-18,[['#ec4899',_C7F11,j3],['#ec4899',_C7F11,sAb],['#ec4899',_C7F11,sAz],['#22d3ee',_C7F11,sV1],['#22d3ee',_C7F11,sV2],['#00e09e',_C7F11,sVn],
      [_C7ABU,_C7F10,sD],[_C7ABU,_C7F10,sP]],[0,16,16,22,16,17,19,14]);
  } else {
    ctx.fillStyle=_C7TEKS; ctx.font=_C7F11; ctx.fillText(j1+' '+j2+'; '+j3,12,18);
    // Tablet (570 px): kolom digeser ke kiri secukupnya agar baris Δa/prisma muat; desktop tetap 0,62 W.
    const tx=Math.min(W*0.62,W-262);
    _cad7Kolom(ctx,tx,H*0.26,W-tx-2,[['#ec4899',_C7F11,sAb],['#ec4899',_C7F11,sAz],['#22d3ee',_C7F11,sV1],['#22d3ee',_C7F11,sV2],['#00e09e',_C7F11,sVn],
      [_C7ABU,_C7F10,sD+' · '+sP]],[0,20,30,20,20,22]);
  }
  _ttlTulis('loftInfo','Penampang pada z = '+z.toFixed(1)+' mm berukuran '+az_.toFixed(2)+' × '+bz.toFixed(2)+' mm (linear antara profil bawah dan atas); mengintegralkan a(z)·b(z) dari 0 sampai h = '+h+' memberi V = '+V.toFixed(2)+' mm³ (Persamaan (3)).');
  if(_ttlJalan('loft')){_c7lfFrame++; requestAnimationFrame(drawLoft);}
}

// ════════════════════════════════════════════════════════════
// ANIMASI 4 — Thickness: balok menjadi cangkang dengan tebal dinding t berubah
// ════════════════════════════════════════════════════════════
let _c7shFrame=0;
function toggleShell(){_ttlToggle('shell','btnShell',drawShell);}
window.toggleShell=toggleShell;
function drawShell(){
  const k=_ttlKanvas('cvShell',372); if(!k) return; const {ctx,W,H}=k; const sempit=W<_TTL_SEMPIT;
  const a=_ttlNilai('sl_sh_a',70), b=_ttlNilai('sl_sh_b',45), h=_ttlNilai('sl_sh_h',35), tM=_ttlNilai('sl_sh_t',2.5);
  const tMax=Math.max(0.5,Math.min(tM,Math.min(a,b)/2-1,h-1));
  _ttlTulis('v_sh_a',a.toFixed(0)); _ttlTulis('v_sh_b',b.toFixed(0)); _ttlTulis('v_sh_h',h.toFixed(0)); _ttlTulis('v_sh_t',tMax.toFixed(1).replace('.',','));
  const t=_ttlJalan('shell')?tMax*(0.55+0.45*Math.sin(_c7shFrame/40)):tMax;
  const az=35, el=28, Ls=Math.max(a,b)*0.4;
  const luar=[[0,0,0],[a,0,0],[a,b,0],[0,b,0]], luarAtas=luar.map(p=>[p[0],p[1],h]), penuh=[...luar,...luarAtas];
  // Ponsel: balok isometrik + huruf sumbu di atas, penampang x–z di bawahnya, lalu kolom rumus. Lebar: titik asal
  // dan skala semula, dikecilkan hanya bila akan masuk judul atau label h penampang.
  const {sk,cx,cy,sb}=_cad7Simpan('sh',[W,H,a,b,h].join('|'),()=>{
    const D=sempit?[8,42,W-8,162]:[8,30,W*0.46-20,H-6];
    const b0=sempit?_cad7Muat(penuh,az,el,D[0]+18,D[1]+14,D[2]-D[0]-36,D[3]-D[1]-28):{sk:Math.max(0.05,Math.min(W*0.36,H*1.0)/(a+b+h)*1.15),cx:W*0.20,cy:H*0.74};
    return _cad7Pas(ctx,az,el,b0.sk,b0.cx,b0.cy,Ls,penuh,D,sempit);
  });
  _cad7Sumbu(ctx,sb);
  const dalam=[[t,t,t],[a-t,t,t],[a-t,b-t,t],[t,b-t,t]], dalamAtas=dalam.map(p=>[p[0],p[1],h]);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[luar[i],luar[j],luarAtas[j],luarAtas[i]],az,el,sk,cx,cy,'rgba(236,72,153,.10)','rgba(236,72,153,.7)',1.1);}
  _cad7Poli3(ctx,dalam,az,el,sk,cx,cy,'rgba(236,72,153,.06)','rgba(236,72,153,.35)',0.8);
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[dalam[i],dalam[j],dalamAtas[j],dalamAtas[i]],az,el,sk,cx,cy,'rgba(2,8,18,.55)','rgba(236,72,153,.35)',0.8);}
  for(let i=0;i<4;i++){const j=(i+1)%4; _cad7Poli3(ctx,[luarAtas[i],luarAtas[j],dalamAtas[j],dalamAtas[i]],az,el,sk,cx,cy,'rgba(236,72,153,.28)','#ec4899',1.3);}
  // penampang tegak (x–z): di tengah kanvas (lebar) atau di bawah balok, ditengahkan bersama label h dan t (ponsel)
  const pw=sempit?Math.min(W*0.36,110):W*0.16, px=sempit?(W-pw-60)/2+12:W*0.46, ph=Math.min(sempit?56:H*0.5,pw*h/a), sx=pw/a, sz=ph/h, py=sempit?242:H*0.78;
  ctx.fillStyle='rgba(236,72,153,.25)'; ctx.strokeStyle='#ec4899'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.rect(px,py-ph,pw,ph); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#020812'; ctx.fillRect(px+t*sx,py-ph,pw-2*t*sx,ph-t*sz);
  ctx.strokeStyle='rgba(236,72,153,.6)'; ctx.lineWidth=1; ctx.strokeRect(px+t*sx,py-ph-0.5,pw-2*t*sx,ph-t*sz+0.5);
  ctx.fillStyle='#f59e0b'; ctx.font="10px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillText('a',px+pw/2,py+14); ctx.fillText('penampang x–z',px+pw/2,py-ph-8); ctx.textAlign='left'; ctx.fillText('t = '+t.toFixed(1),px+pw+6,py-ph/2); ctx.fillText('h',px-12,py-ph/2+4);
  const V=a*b*h-(a-2*t)*(b-2*t)*(h-t), pct=100*V/(a*b*h);
  ctx.textAlign='left';
  const j1='Balok '+a+' × '+b+' × '+h+' → Thickness', j2='t = '+t.toFixed(1)+' mm, muka atas dibuang';
  const butir=[['#22d3ee',_C7F11,'V = abh − (a−2t)(b−2t)(h−t)'],['#00e09e',_C7F11,'= '+_cad7Rp(V,1)+' mm³'],[_C7ABU,_C7F10,'balok pejal '+_cad7Rp(a*b*h,0)+' mm³'],[_C7ABU,_C7F10,'sisa bahan '+pct.toFixed(1)+' %'],
    [_C7ABU,_C7F10,'massa baja ≈ '+(V/1000*7.85).toFixed(1)+' g'],[_C7ABU,_C7F10,'rongga '+(a-2*t).toFixed(1)+' × '+(b-2*t).toFixed(1)+' × '+(h-t).toFixed(1)]];
  if(sempit){
    _cad7Kolom(ctx,10,18,W-18,[[_C7TEKS,_C7F11,j1],[_C7TEKS,_C7F11,j2]],[0,15]);
    _cad7Kolom(ctx,10,280,W-18,butir,[0,17,20,15,15,15]);
  } else {
    ctx.fillStyle=_C7TEKS; ctx.font=_C7F11; ctx.fillText(j1+' '+j2,12,18);
    // Kolom rumus di 0,68 W; digeser ke kanan hanya bila label "t = …" penampang (lebar maksimumnya dari tMax,
    // jadi tetap selama animasi) akan kurang dari 6 px darinya (laptop 800 px, tablet). Desktop 1000 px tetap.
    ctx.font=_C7F10; const tT=px+pw+6+ctx.measureText('t = '+tMax.toFixed(1)).width+6;
    const tx=tT>W*0.68+0.5?tT:W*0.68; _cad7Kolom(ctx,tx,H*0.28,W-tx-2,butir,[0,20,22,20,20,22]);
  }
  _ttlTulis('shellInfo','Thickness t = '+t.toFixed(2)+' mm ke dalam menyisakan dinding dan dasar; rongga ('+(a-2*t).toFixed(1)+' × '+(b-2*t).toFixed(1)+' × '+(h-t).toFixed(1)+') dibuang dari balok '+(a*b*h).toFixed(0)+' mm³ → V = '+V.toFixed(2)+' mm³ ('+pct.toFixed(1)+' % bahan tersisa), Persamaan (4).');
  if(_ttlJalan('shell')){_c7shFrame++; requestAnimationFrame(drawShell);}
}

_TTL_DAFTAR.push(['cvExtrude',()=>drawExtrude(),'extrude',['sl_ex_w','sl_ex_h','sl_ex_t','sl_ex_l']]);
_TTL_DAFTAR.push(['cvPolar',()=>drawPolar(),'polar',['sl_po_n','sl_po_D','sl_po_d0','sl_po_db','sl_po_h']]);
_TTL_DAFTAR.push(['cvLoft',()=>drawLoft(),'loft',['sl_lf_a1','sl_lf_b1','sl_lf_a2','sl_lf_b2','sl_lf_h']]);
_TTL_DAFTAR.push(['cvShell',()=>drawShell(),'shell',['sl_sh_a','sl_sh_b','sl_sh_h','sl_sh_t']]);
_ttlMulai();
