/* ---------- a boss falls: the music breaks off at once, then the fanfare, then quiet before the area's music comes back ---------- */
function bossFallSnd(){if(mus.a){const a=mus.a;clearInterval(a._f);a.onended=null;try{a.pause()}catch(e){}}mus.a=null;mus.key='still';
  if(AC&&typeof MX!=='undefined'&&MX.boss){try{for(const n of[MX.boss,MX.out]){n.gain.cancelScheduledValues(AC.currentTime);n.gain.setValueAtTime(0,AC.currentTime)}}catch(e){}}
  const L=SBUF.bossdown,dur=L&&L.length?L[0].duration:3;SN3.hold=G.t+.15+dur+2.5;setTimeout(()=>sample('bossdown',.85,{rate:1}),150)}

// the Aschemagier's robe: long and hooded, cloth in flat facets that swing with the step, a gold-worked border down the open front
// and round the hem, wide sleeves with gold cuffs, two gold clasps at the chest and runes on the hem that glow in the staff's colour
const _heroLookM=heroLook;heroLook=function(fl){const r=_heroLookM(fl);if(P&&P.cls==='magier'){r.R.mage=1;r.R.mageFl=!!fl;r.R.mageHelm=!!(P.eq.helm&&P.d.okS.has(P.eq.helm))}return r};
function mageGlyph(x,y,k,col,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.lineCap='round';
  const S=[[[0,-2.6,0,2.6],[-1.8,-1.2,1.8,-1.2],[-1.4,1.3,1.4,1.3]],[[-2,0,0,-2.4],[0,-2.4,2,0],[2,0,0,2.4],[0,2.4,-2,0],[0,-1,0,1]],[[-1.6,-2.4,-1.6,2.4],[-1.6,-.4,1.8,-2.4],[-1.6,-.4,1.8,2]]][k%3];
  for(const[w,al]of[[2.2,a*.28],[.8,a]]){ctx.globalAlpha=al;ctx.lineWidth=w;ctx.beginPath();for(const[x1,y1,x2,y2]of S){ctx.moveTo(x+x1,y+y1);ctx.lineTo(x+x2,y+y2)}ctx.stroke()}ctx.restore()}
// a strip of gold along a polyline, w wide, with a dark worked pattern stamped along it
function mageBorder(pts,w,gold,dark,plain){for(let k=1;k<pts.length;k++){const[a,b]=pts[k-1],[c,d]=pts[k];limb(a,b,c,d,w,w,gold,true)}
  if(plain)return;ctx.fillStyle=dark;ctx.globalAlpha=.55;for(let k=1;k<pts.length;k++){const[a,b]=pts[k-1],[c,d]=pts[k],l=Math.hypot(c-a,d-b),n=Math.max(1,Math.round(l/3));for(let s=0;s<n;s++){const t=(s+.5)/n;ctx.fillRect(a+(c-a)*t-.3,b+(d-b)*t-.3,.6,.6)}}ctx.globalAlpha=1}
const _humanoidM=humanoid;humanoid=function(o){const R=o.R;if(!R||!R.mage||o.robeDone)return _humanoidM(o);
  const C=R.torso,GD=R.mageFl?RP.flash:RP.gold,DK=R.mageFl?'#c8c8c8':'#3a2406',f=o.f,back=o.back,tw=o.tw||1,mv=o.moving,ph=o.ph||0,s=mv?Math.sin(ph):0,c2=mv?Math.cos(ph*2):0;
  const e=typeof mElem==='function'?mElem():null,rc=R.mageFl?'#ffffff':e&&EL[e]?EL[e].c[1]:'#7aa8ff',glow=.65+.35*Math.sin(G.t*2.3);
  const head0=o.head,o2=Object.assign({},o,{robe:true,robeDone:1});
  o2.torsoFx=(shX,shY,hipX,hipY)=>{
    // three rows of points: shoulders, a drawn-in waist, a flared hem that swings with the step and is cut ragged
    const hemY=-.6,sx=s*1.8,X0=[-7.6,-3.8,0,3.8,7.6],X1=[-6.6,-3.2,0,3.2,6.6],X2=[-11.8,-6,0,6,11.8],cut=[.4,-.5,.8,-.4,.5];
    const T=X0.map(x=>[shX+x*tw,shY]),W=X1.map(x=>[hipX+x*tw,hipY+1]),B=X2.map((x,k)=>[hipX+x*tw+sx*(.6+Math.abs(x)/12),hemY+cut[k]+(mv?Math.abs(x)/12*c2*.8:0)]);
    // facets: light from the left, the folds lean with the swing
    const lv=[3,2,2,1,1],quad=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.closePath();ctx.fill()};
    for(let k=0;k<4;k++){const l=back?lv[k+1]-.3:lv[k]-(k===1||k===2?.5:0),u=clamp(Math.round(l),0,3),w2=clamp(Math.round(l-.6+s*(k<2?.5:-.5)),0,3);
      quad(T[k],T[k+1],W[k+1],W[k],C[Math.max(1,u)]);quad(W[k],W[k+1],B[k+1],B[k],C[Math.max(0,w2)])}
    // fold lines from the waist down
    ctx.strokeStyle=C[0];ctx.lineWidth=.7;ctx.globalAlpha=.7;ctx.beginPath();for(const k of[1,3]){ctx.moveTo(W[k][0],W[k][1]+1);ctx.lineTo(B[k][0]+(k<2?-.6:.6),B[k][1]-.6)}ctx.stroke();ctx.globalAlpha=1;
    // under the hem: the toes of the boots, now one, now the other
    if(!back&&mv)for(const sd of[-1,1]){const q=sd*s;if(q>.1)blob(hipX+sd*3.5+f*1.5+q*2.5,-.6,2.6,1.4,R.feet||RP.shoe)}
    // the hem: a gold band, dark-stamped, with runes above it
    mageBorder(B,.85,GD,DK);
    for(const[k,u]of[[0,.55],[3,.45]]){const a=B[k],b=B[k+1],gx=a[0]+(b[0]-a[0])*u,gy=a[1]+(b[1]-a[1])*u-4.6;mageGlyph(gx,gy,k+(back?1:0),rc,glow*(back?.7:1))}
    if(!back){
      // the open front: dark lining between two gold borders, wider towards the hem
      const cx=hipX+f*1.2,top=[shX+f*1,shY+4],L=[[top[0]-1,top[1]],[cx-1.6,hipY+1],[B[2][0]-3.4,B[2][1]-.6]],Rr=[[top[0]+1,top[1]],[cx+1.6,hipY+1],[B[2][0]+3.4,B[2][1]-.6]];
      ctx.fillStyle='#07040c';ctx.beginPath();L.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));for(let k=2;k>=0;k--)ctx.lineTo(Rr[k][0],Rr[k][1]);ctx.closePath();ctx.fill();
      mageBorder(L,.48,GD,DK,1);mageBorder(Rr,.48,GD,DK,1);
      // two clasps: a bar across with a knob at each end
      for(const y of[shY+5,shY+9.5]){const xa=top[0]+(cx-top[0])*((y-top[1])/(hipY+1-top[1]));limb(xa-2.2,y,xa+2.2,y,.5,.5,GD,true);blob(xa-2.2,y,.95,.95,GD,true);blob(xa+2.2,y,.95,.95,GD,true)}
      // a cord at the waist, its tassel swinging
      limb(hipX-6.4*tw,hipY+.6,hipX+6.4*tw,hipY+.6,.6,.6,GD,true);limb(cx+f*2,hipY+1,cx+f*2.4+s*.8,hipY+6.5,.5,.4,GD,true);blob(cx+f*2.4+s*.8,hipY+7,.9,1.3,GD,true)}
    else{// the back seam and a big rune between the shoulder blades
      mageGlyph(shX,shY+8,1,rc,glow*.55)}
    if(o.torsoFx)o.torsoFx(shX,shY,hipX,hipY,back)};
  // the wide sleeve: it opens from the elbow into a bell, and a gold cuff turns round its mouth
  o2.armFx=a=>{const dx=a.hx-a.ex,dy=a.hy-a.ey,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,ux=dx/l,uy=dy/l,mx=a.hx-ux*1.2,my=a.hy-uy*1.2+(mv?Math.abs(s)*.6:0),w=3.7;
    ctx.fillStyle=lgrad(mx+nx*w,my+ny*w,mx-nx*w,my-ny*w,[C[0],C[0],C[1],C[2]]);ctx.beginPath();ctx.moveTo(a.ex+nx*2.6,a.ey+ny*2.6);ctx.quadraticCurveTo(mx+nx*w*.8-ux*2,my+ny*w*.8-uy*2,mx+nx*w,my+ny*w+1.6);ctx.lineTo(mx-nx*w,my-ny*w+1.6);ctx.quadraticCurveTo(mx-nx*w*.6-ux*2,my-ny*w*.6-uy*2,a.ex-nx*2.6,a.ey-ny*2.6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#07040c';ctx.beginPath();ctx.ellipse(mx,my+1.6,w*.9,1.3,Math.atan2(ny,nx),0,7);ctx.fill();
    ctx.strokeStyle=GD[2];ctx.lineWidth=.75;ctx.beginPath();ctx.ellipse(mx,my+1.6,w,1.45,Math.atan2(ny,nx),0,7);ctx.stroke();ctx.strokeStyle=GD[3];ctx.lineWidth=.35;ctx.beginPath();ctx.ellipse(mx,my+1.4,w,1.45,Math.atan2(ny,nx),3.4,6);ctx.stroke()};
  // the hood: drawn up when there is no helm, a gold edge round the face; under a helm it lies as a cowl on the shoulders
  o2.head=(hx,hy)=>{const H=C,peak=-f*2.2;
    if(R.mageHelm){blob(hx,hy+5.2,6.8,2.6,H);if(!back)limb(hx-5,hy+5,hx+5,hy+5,.7,.7,GD,true);head0(hx,hy);return}
    if(back){head0(hx,hy);poly([[hx-6.8,hy+5.6],[hx-5.6,hy+1],[hx+5.6,hy+1],[hx+6.8,hy+5.6]],H);blob(hx,hy-.6,5.8,6.4,H);poly([[hx-3,hy-5],[hx+peak*1.2,hy-9.6],[hx+3,hy-5]],[H[1],H[1],H[2],H[2]]);
      ctx.strokeStyle=H[0];ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(hx+peak*.5,hy-7);ctx.quadraticCurveTo(hx-.4,hy-1,hx,hy+5);ctx.stroke();return}
    // the hood's lining behind the head, then the face, then the hood's rim over it with the gold edge
    blob(hx,hy,5.6,6.2,[H[0],H[0],H[1],H[1]]);head0(hx,hy);
    ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(hx+f*.6,hy-2.2,4.3,2.6,0,0,7);ctx.fill();ctx.restore();
    poly([[hx-6,hy+5.4],[hx-6,hy-2],[hx-3.6,hy-7.6],[hx+peak,hy-9],[hx+3.6,hy-7.6],[hx+6,hy-2],[hx+6,hy+5.4],[hx+4.3,hy+5.4],[hx+4.6,hy-1.6],[hx+3,hy-4.9],[hx,hy-5.6],[hx-3,hy-4.9],[hx-4.6,hy-1.6],[hx-4.3,hy+5.4]],H);
    mageBorder([[hx-4.6,hy+5],[hx-4.6,hy-1.6],[hx-3,hy-4.9],[hx,hy-5.6],[hx+3,hy-4.9],[hx+4.6,hy-1.6],[hx+4.6,hy+5]],.45,GD,DK)};
  return _humanoidM(o2)};
