/* ---------- sprites ---------- */
const TW=64,TH=32,WH=56,CL=70;
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c}
function dia(g,oy=0){g.beginPath();g.moveTo(32,oy);g.lineTo(64,oy+16);g.lineTo(32,oy+32);g.lineTo(0,oy+16);g.closePath()}
function specks(g,w,h,n,cols,sz=1){for(let k=0;k<n;k++){g.fillStyle=cols[Math.random()*cols.length|0];g.fillRect(Math.random()*w,Math.random()*h,sz,sz)}}
const SPR={floor:[],grass:[],wall:[],rock:[],cliffL:null,cliffR:null,tower:null};
// the island's earthen edge: a grass lip, a band of soil with pebbles, faceted rock going dark below, stones, roots hanging out,
// now and then moss, ivy, mushrooms, a crevice or a few crystals; six of each side, picked per tile
function cliffVariants(){const N=6,out=[[],[]];
  const mix=(a,b,t)=>{const p=parseInt(a.slice(1),16),q=parseInt(b.slice(1),16),c=[16,8,0].map(s=>Math.round(((p>>s)&255)+(((q>>s)&255)-((p>>s)&255))*t));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
  const tone=d=>d<12?mix('#5a3c22','#4a3222',d/12):d<28?mix('#4a3222','#3a3436',(d-12)/16):mix('#3a3436','#1c1c22',Math.min(1,(d-28)/(CL-20)));
  for(let side=0;side<2;side++)for(let v=0;v<N;v++){const R=mulberry(911+side*37+v*101),r=(a,b)=>a+R()*(b-a),L=side===0,dk=L?1:.62;
    const P=(u,d)=>L?[u*32,16+u*16+d]:[32+u*32,32-u*16+d];
    // the underside: fixed at the corners so neighbours meet, ragged between
    const bu=[0,.18,.32,.5,.66,.82,1],bot=bu.map((u,k)=>{const e=L?.8+(.7-.8)*u:.7+(.8-.7)*u;return(k===0||k===bu.length-1)?e*CL:e*CL+r(-8,6)+(k===2+v%3?r(8,16):0)});
    out[side].push(mk(64,32+CL+14,g=>{
      const sil=()=>{g.beginPath();const a=P(0,0),b=P(1,0);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);for(let k=bu.length-1;k>=0;k--){const p=P(bu[k],bot[k]);g.lineTo(p[0],p[1])}g.closePath()};
      g.save();sil();g.clip();
      // facets: a jittered grid of rows going down, each triangle its own shade
      const us=[0,.2,.4,.6,.8,1],ds=[0,5,11,18,27,38,50,63,CL+4],V=ds.map((d,ri)=>us.map((u,ci)=>{const uu=ci&&ci<us.length-1?u+r(-.06,.06):u,dd=ri?d+r(-2.5,2.5):d;return[uu,dd]}));
      for(let ri=0;ri<ds.length-1;ri++)for(let ci=0;ci<us.length-1;ci++){const a=V[ri][ci],b=V[ri][ci+1],c=V[ri+1][ci+1],e=V[ri+1][ci];
        for(const tri of[[a,b,c],[a,c,e]]){const dm=(tri[0][1]+tri[1][1]+tri[2][1])/3,col=shade(tone(dm),dk*r(.84,1.14)*(1-.35*Math.min(1,dm/CL)));
          g.fillStyle=col;g.strokeStyle=col;g.lineWidth=.6;g.beginPath();tri.forEach(([u,d],k)=>{const p=P(u,d);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath();g.fill();g.stroke()}}
      // strata following the edge
      g.lineWidth=.8;for(const d0 of[16+r(-2,2),31+r(-3,3),47+r(-3,3)]){g.strokeStyle=`rgba(255,240,220,${(.07*dk).toFixed(3)})`;g.beginPath();for(let k=0;k<=8;k++){const p=P(k/8,d0+Math.sin(k*1.7+v)*1.2);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke();
        g.strokeStyle='rgba(0,0,0,.18)';g.beginPath();for(let k=0;k<=8;k++){const p=P(k/8,d0+1+Math.sin(k*1.7+v)*1.2);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.stroke()}
      // pebbles in the soil
      for(let k=0;k<10;k++){const p=P(r(.04,.96),r(5,13));g.fillStyle=shade(R()<.5?'#8a7a64':'#6a5e50',dk);g.fillRect(p[0]|0,p[1]|0,R()<.3?2:1,1)}
      // a dark crevice now and then
      if(R()<.3){const u=r(.25,.75),d=r(26,40),w=r(.07,.12),h=r(5,9),pts=[[u-w,d],[u-w*.3,d-h*.4],[u+w*.4,d-h*.5],[u+w,d+h*.1],[u+w*.2,d+h*.6],[u-w*.6,d+h*.4]];
        g.fillStyle='#0a0a0e';g.beginPath();pts.forEach(([a,b],k)=>{const p=P(a,b);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath();g.fill()}
      // stones bedded in the face: a lit facet on the upper left, a dark one below
      for(let k=0,n=2+(R()*2|0);k<n;k++){const[cx,cy]=P(r(.12,.88),r(10,44)),rr=r(2.2,4.4),pts=[];for(let i=0;i<6;i++){const a=i/6*6.283+r(-.3,.3);pts.push([cx+Math.cos(a)*rr*r(.8,1.15),cy+Math.sin(a)*rr*.75*r(.8,1.15)])}
        const base=shade('#6e6a62',dk*r(.85,1.1));g.fillStyle=base;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
        g.fillStyle=shade(base,1.3);g.beginPath();g.moveTo(cx,cy);g.lineTo(pts[3][0],pts[3][1]);g.lineTo(pts[4][0],pts[4][1]);g.lineTo(pts[5][0],pts[5][1]);g.closePath();g.fill();
        g.fillStyle=shade(base,.62);g.beginPath();g.moveTo(cx,cy);g.lineTo(pts[0][0],pts[0][1]);g.lineTo(pts[1][0],pts[1][1]);g.lineTo(pts[2][0],pts[2][1]);g.closePath();g.fill()}
      // moss on the rock
      if(R()<.6)for(let c=0,n=1+(R()*2|0);c<n;c++){const[cx,cy]=P(r(.1,.9),r(16,40));for(let k=0;k<14;k++){g.fillStyle=shade(R()<.5?'#3e6e2a':'#5a8a34',dk);g.fillRect(cx+r(-4,4)|0,cy+r(-1.5,1.5)|0,1,1)}}
      // crystals, rarely
      if(R()<.08){const[cx,cy]=P(r(.25,.75),r(30,46));for(let k=0;k<3;k++){const a=-1.57+(k-1)*.45,l=r(3,6),x=cx+(k-1)*1.6;g.fillStyle=k===1?'#a8f0ff':'#5ab8e0';g.beginPath();g.moveTo(x-1,cy);g.lineTo(x+Math.cos(a)*l,cy+Math.sin(a)*l);g.lineTo(x+1,cy);g.closePath();g.fill()}
        g.fillStyle='rgba(200,250,255,.5)';g.fillRect(cx,cy-4,1,2)}
      g.restore();
      // the grass lip: a strip along the edge with blades hanging over
      const G2=['#3a7a22','#4e9a2a','#6ab83a'];g.fillStyle=shade('#3e8424',dk);g.beginPath();{const a=P(0,0),b=P(1,0),c=P(1,2.6),e=P(0,2.6);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(c[0],c[1]);g.lineTo(e[0],e[1])}g.closePath();g.fill();
      for(let k=0;k<16;k++){const u=r(0,1),l=r(2,6.5),p=P(u,1.5),q=P(u+r(-.02,.02),1.5+l);g.fillStyle=shade(G2[R()*3|0],dk);g.beginPath();g.moveTo(p[0]-1.2,p[1]);g.lineTo(p[0]+1.2,p[1]);g.lineTo(q[0],q[1]);g.closePath();g.fill()}
      // mushrooms in the soil
      if(R()<.3)for(let k=0,n=1+(R()*3|0);k<n;k++){const[x,y]=P(r(.15,.85),r(8,12)),red=R()<.6;g.fillStyle=shade('#e8dcc0',dk);g.fillRect(x|0,y|0,1,2);g.fillStyle=shade(red?'#c83a2a':'#b89060',dk);g.fillRect((x|0)-1,(y|0)-1,3,1);if(red){g.fillStyle='#fff';g.fillRect(x|0,(y|0)-1,1,1)}}
      // roots: they come out of the soil and hang down, some past the rock, with a few side shoots
      for(let k=0,n=1+(R()*3|0);k<n;k++){let u=r(.08,.92),d=r(5,11);const len=r(14,58),pts=[P(u,d)];let du=r(-.01,.01);
        for(let s=4;s<len;s+=3.5){du+=r(-.012,.012);u=clamp(u+du,.02,.98);d+=3.5;pts.push(P(u,d))}
        for(let i=1;i<pts.length;i++){const w=1.9*(1-i/pts.length)+.5;g.strokeStyle=shade(i<pts.length*.5?'#6a4828':'#4e3420',dk);g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(...pts[i-1]);g.lineTo(...pts[i]);g.stroke()}
        g.strokeStyle=shade('#9a7448',dk);g.lineWidth=.5;g.beginPath();pts.slice(0,Math.ceil(pts.length*.45)).forEach((p,i)=>i?g.lineTo(p[0]-.5,p[1]):g.moveTo(p[0]-.5,p[1]));g.stroke();
        for(let b=0;b<2;b++){const i=1+(R()*(pts.length-2)|0),p=pts[i];if(!p)continue;const s=R()<.5?-1:1;g.strokeStyle=shade('#5a3c22',dk);g.lineWidth=.6;g.beginPath();g.moveTo(...p);g.quadraticCurveTo(p[0]+s*3,p[1]+2,p[0]+s*r(3,6),p[1]+r(4,8));g.stroke()}}
      // ivy now and then, leaves on alternate sides
      if(R()<.4){let u=r(.1,.9),d=1;const len=r(14,34);g.strokeStyle=shade('#2e5a1e',dk);g.lineWidth=.7;g.beginPath();g.moveTo(...P(u,d));const lv=[];for(;d<len;d+=3){u+=r(-.025,.025);const p=P(u,d);g.lineTo(...p);lv.push(p)}g.stroke();
        lv.forEach(([x,y],i)=>{const s=i%2?1:-1;g.fillStyle=shade(i%3?'#4e8a2a':'#6aa83a',dk);g.beginPath();g.moveTo(x,y);g.lineTo(x+s*2.6,y-.6);g.lineTo(x+s*1.6,y+1.6);g.closePath();g.fill()})}
    }))}
  return out}
const CLV=(side,i,j)=>{const V=SPR.cliffV;if(!V)return side?SPR.cliffR:SPR.cliffL;return V[side][(((i*73856093)^(j*19349663))>>>0)%V[side].length]};
function buildSprites(){
  for(let v=0;v<6;v++)SPR.floor.push(mk(64,32,g=>{dia(g);const l=36+v*3;g.fillStyle=`rgb(${l+12},${l+7},${l+2})`;g.fill();g.save();g.clip();specks(g,64,32,90,['#0c0a08','#4a4036','#1a1612']);
    g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=1;g.beginPath();g.moveTo(32,0);g.lineTo(64,16);g.lineTo(32,32);g.lineTo(0,16);g.closePath();g.stroke();
    if(v%2===0){g.strokeStyle='rgba(5,5,8,.7)';g.beginPath();let x=10+Math.random()*30,y=8+Math.random()*12;g.moveTo(x,y);for(let k=0;k<4;k++){x+=rnd(-6,8);y+=rnd(-2,4);g.lineTo(x,y)}g.stroke()}g.restore()}));
  for(let v=0;v<6;v++)SPR.grass.push(mk(64,32,g=>{dia(g);g.fillStyle=['#6dbb1c','#76c522','#66b31a','#71bf20','#6ab71d','#7bc928'][v];g.fill();g.save();g.clip();
    for(let k=0;k<70;k++){const x=Math.random()*64,y=Math.random()*32;g.strokeStyle=Math.random()<.55?'#3f7f0d':'#a6e64e';g.globalAlpha=.75;g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-1.5,1.5),y-rnd(2,5));g.stroke()}
    g.globalAlpha=1;specks(g,64,32,25,['#1a2a08','#d8f59a']);g.restore()}));
  for(let v=0;v<4;v++)SPR.wall.push(mk(64,32+WH,g=>{
    g.beginPath();g.moveTo(0,16);g.lineTo(32,32);g.lineTo(32,32+WH);g.lineTo(0,16+WH);g.closePath();g.fillStyle='#4a4034';g.fill();
    g.beginPath();g.moveTo(32,32);g.lineTo(64,16);g.lineTo(64,16+WH);g.lineTo(32,32+WH);g.closePath();g.fillStyle='#241e18';g.fill();
    g.save();g.beginPath();g.rect(0,0,64,32+WH);g.clip();
    g.strokeStyle='rgba(0,0,0,.6)';for(let r=1;r<5;r++){const yy=r*WH/5;g.beginPath();g.moveTo(0,16+yy);g.lineTo(32,32+yy);g.lineTo(64,16+yy);g.stroke();
      for(let k=0;k<3;k++){const x=(k*11+r*7+v*5)%30+1;g.beginPath();g.moveTo(x,16+yy+x/2-WH/5);g.lineTo(x,16+yy+x/2);g.stroke();const x2=34+(k*13+r*5+v*3)%28;g.beginPath();g.moveTo(x2,32+yy-(x2-32)/2-WH/5);g.lineTo(x2,32+yy-(x2-32)/2);g.stroke()}}
    specks(g,64,32+WH,160,['#0a0806','#5a4e40','#2a221c']);g.restore();
    dia(g);g.fillStyle='#2a241e';g.fill();g.save();g.clip();specks(g,64,32,60,['#16120e','#3a322a']);g.restore();
    g.strokeStyle='#4e4436';g.lineWidth=1;g.beginPath();g.moveTo(0,16);g.lineTo(32,32);g.lineTo(64,16);g.stroke()}));
  for(let v=0;v<5;v++)SPR.rock.push(mk(72,64,g=>{const cx=36,cy=50,n=9,rr=rnd(16,24),pts=[];for(let k=0;k<n;k++){const a=Math.PI+k/(n-1)*Math.PI,r=rr*rnd(.75,1.15);pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*1.05])}
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,cy,rr*1.3,rr*.45,0,0,7);g.fill();
    g.beginPath();g.moveTo(pts[0][0],cy+4);for(const p of pts)g.lineTo(p[0],p[1]);g.lineTo(pts[n-1][0],cy+4);g.closePath();g.fillStyle='#141416';g.fill();
    g.save();g.clip();g.fillStyle='#34343a';g.beginPath();g.moveTo(pts[1][0],pts[1][1]);g.lineTo(pts[3][0],pts[3][1]);g.lineTo(cx-2,cy-4);g.closePath();g.fill();
    g.fillStyle='#232327';g.beginPath();g.moveTo(pts[4][0],pts[4][1]);g.lineTo(pts[6][0],pts[6][1]);g.lineTo(cx+6,cy-2);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.08)';for(let k=0;k<14;k++){const x=rnd(10,62);g.beginPath();g.moveTo(x,rnd(25,48));g.lineTo(x+rnd(-4,4),rnd(40,54));g.stroke()}
    specks(g,72,64,140,['#000','#55555c','#2a2a2e']);g.restore()}));
  const cliff=(left)=>mk(64,32+CL,g=>{g.beginPath();if(left){g.moveTo(0,16);g.lineTo(32,32);g.lineTo(32,32+CL*.7);g.lineTo(14,16+CL);g.lineTo(0,16+CL*.8)}else{g.moveTo(32,32);g.lineTo(64,16);g.lineTo(64,16+CL*.8);g.lineTo(48,16+CL);g.lineTo(32,32+CL*.7)}g.closePath();
    g.fillStyle=left?'#2a2a2e':'#151517';g.fill();g.save();g.clip();g.strokeStyle='rgba(0,0,0,.6)';for(let k=0;k<10;k++){const x=rnd(0,64);g.beginPath();g.moveTo(x,10);g.lineTo(x+rnd(-5,5),32+CL);g.stroke()}specks(g,64,32+CL,200,['#000','#4a4a52','#1d1d20']);g.restore()});
  SPR.cliffL=cliff(true);SPR.cliffR=cliff(false);SPR.cliffV=cliffVariants();
  const D=SPR.deco={bones:[],rubble:[],blood:[],skull:[]};
  for(let v=0;v<4;v++){
    D.bones.push(mk(40,24,g=>{g.lineCap='round';for(let k=0;k<3+v;k++){const x=rnd(8,32),y=rnd(6,18),a=rnd(0,3.14),l=rnd(4,9);g.strokeStyle='#0a0a0c';g.lineWidth=3.2;g.beginPath();g.moveTo(x-Math.cos(a)*l,y-Math.sin(a)*l*.5);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l*.5);g.stroke();g.strokeStyle='#bdb49a';g.lineWidth=1.6;g.stroke()}}));
    D.rubble.push(mk(40,24,g=>{for(let k=0;k<7+v*2;k++){const x=rnd(6,34),y=rnd(6,20),r=rnd(1.2,3.4);g.fillStyle='#0a0a0c';g.beginPath();g.ellipse(x,y+1,r+1,(r+1)*.6,0,0,7);g.fill();g.fillStyle=pick(['#4a4d58','#3a3c45','#565a66']);g.beginPath();g.ellipse(x,y,r,r*.6,0,0,7);g.fill()}}));
    D.blood.push(mk(48,24,g=>{g.fillStyle='rgba(70,6,6,.75)';for(let k=0;k<5;k++){g.beginPath();g.ellipse(24+rnd(-10,10),12+rnd(-4,4),rnd(4,11),rnd(2,5),0,0,7);g.fill()}g.fillStyle='rgba(30,2,2,.6)';g.beginPath();g.ellipse(24,12,6,3,0,0,7);g.fill()}));
    D.skull.push(mk(40,24,g=>{const x=20+rnd(-4,4),y=12;g.fillStyle='#0a0a0c';g.beginPath();g.ellipse(x,y,7,5.5,0,0,7);g.fill();g.fillStyle='#cfc6aa';g.beginPath();g.ellipse(x,y-1,5.5,4.2,0,0,7);g.fill();g.fillRect(x-3,y+1,6,3);g.fillStyle='#0a0a0c';g.fillRect(x-3.5,y-1.5,2.4,2);g.fillRect(x+1,y-1.5,2.4,2);
      g.strokeStyle='#bdb49a';g.lineWidth=1.6;g.beginPath();g.moveTo(x+6,y+4);g.lineTo(x+14,y+7);g.stroke()}))}
  SPR.tower=mk(300,620,g=>paintTower(g));
}

