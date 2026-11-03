/* ---------- low poly: the yard, the chests and every prop lying about are small flat-shaded meshes in the light of the walls,
   built once and baked; only the items keep their pixels ---------- */
// x and y run along the tile axes (32 units to a tile), z is height in pixels; light falls from the upper left like on the walls
const LPV=[.577,.577,.577],LPL=(()=>{const l=[-.3,.55,.8],n=Math.hypot(...l);return l.map(v=>v/n)})();
const lpRz=(a,px=0,py=0)=>{const c=Math.cos(a),s=Math.sin(a);return([x,y,z])=>[px+(x-px)*c-(y-py)*s,py+(x-px)*s+(y-py)*c,z]};
const lpRx=(a,py=0,pz=0)=>{const c=Math.cos(a),s=Math.sin(a);return([x,y,z])=>[x,py+(y-py)*c-(z-pz)*s,pz+(y-py)*s+(z-pz)*c]};
const lpRy=(a,px=0,pz=0)=>{const c=Math.cos(a),s=Math.sin(a);return([x,y,z])=>[px+(x-px)*c+(z-pz)*s,y,pz-(x-px)*s+(z-pz)*c]};
const lpMv=(dx,dy,dz)=>([x,y,z])=>[x+dx,y+dy,z+dz];
const lpHex=c=>{if(c[0]!=='#')return c;if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return c};
function lpMesh(){const F=[],M={F,T:null};
  const tp=p=>M.T?M.T(p):p,tv=n=>{if(!M.T)return n;const a=M.T(n),b=M.T([0,0,0]);return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]};
  // o.c: a point inside (the face turns away from it), o.n: the outward direction; neither: the face shows both sides
  M.face=(pts,col,o={})=>{const q=Object.assign({},o);if(q.c)q.c=tp(q.c);if(q.n)q.n=tv(q.n);F.push({p:pts.map(tp),col:lpHex(col),o:q});return M};
  M.with=(T,f)=>{const o=M.T;M.T=o?(p=>o(T(p))):T;f();M.T=o;return M};
  M.box=(x0,y0,z0,x1,y1,z1,col,o={})=>{const c=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2],q=Object.assign({},o,{c}),ct=o.top||col,cx=o.sx||col,cy=o.sy||col;
    if(!o.noTop)M.face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],ct,q);
    M.face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],cy,q);M.face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],cy,q);
    M.face([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],cx,q);M.face([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],cx,q);return M};
  // a turned body: rings of [z, radius]; o.colf(k,i) colours facet k of band i, o.jf(k,i) wobbles a ring's points
  M.lathe=(cx,cy,rings,n,col,o={})=>{const a0=o.a0||0,ry=o.ry||1,pt=(i,k)=>{const[z,r]=rings[i],a=a0+k/n*6.2832,j=o.jf?o.jf(k%n,i):1;return[cx+Math.cos(a)*r*j,cy+Math.sin(a)*r*ry*j,z]};
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<n;k++){const a=pt(i,k),b=pt(i,k+1),c=pt(i+1,k+1),d=pt(i+1,k),zm=(rings[i][0]+rings[i+1][0])/2,cc=o.colf?o.colf(k,i):col;
      const pts=rings[i+1][1]<.01?[a,b,c]:rings[i][1]<.01?[a,c,d]:[a,b,c,d];M.face(pts,cc,Object.assign({},o,{c:[cx,cy,zm]}))}
    const top=rings[rings.length-1];if(o.cap!==false&&top[1]>.01){const p=[];for(let k=0;k<n;k++)p.push(pt(rings.length-1,k));M.face(p,o.capCol||col,Object.assign({},o,{c:[cx,cy,top[0]-1]}))}return M};
  M.cyl=(cx,cy,z0,z1,r,n,col,o={})=>M.lathe(cx,cy,[[z0,r],[z1,o.r1??r]],n,col,o);
  M.ball=(cx,cy,cz,r,n,col,o={})=>{const m=o.m||4,rz=o.rz||1,rings=[];for(let k=0;k<=m;k++){const a=Math.PI*k/m;rings.push([cz-Math.cos(a)*r*rz,Math.sin(a)*r])}return M.lathe(cx,cy,rings,n,col,Object.assign({cap:false},o))};
  // a flat outline pushed through: axis 'y' takes [x,z] points, axis 'x' takes [y,z] points
  M.ext=(pts,ax,d0,d1,col,o={})=>{const P=(u,d)=>ax==='y'?[u[0],d,u[1]]:[d,u[0],u[1]];let ar=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];ar+=a[0]*b[1]-b[0]*a[1]}const s=ar>0?1:-1;
    const nA=ax==='y'?[0,-1,0]:[-1,0,0],nB=ax==='y'?[0,1,0]:[1,0,0];
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],eu=b[0]-a[0],ev=b[1]-a[1],nu=ev*s,nv=-eu*s,n=ax==='y'?[nu,0,nv]:[0,nu,nv];
      M.face([P(a,d0),P(b,d0),P(b,d1),P(a,d1)],o.sideCol||col,Object.assign({},o,{n}))}
    if(!o.noCaps){M.face(pts.map(u=>P(u,d0)),col,Object.assign({},o,{n:nA}));M.face(pts.map(u=>P(u,d1)),o.capCol||col,Object.assign({},o,{n:nB}))}return M};
  return M}
// lays the visible faces down in the order they were built, each shaded by how it meets the light
function lpRender(g,M,ax,ay){for(const f of M.F){const p=f.p,o=f.o;let nx=0,ny=0,nz=0,cx=0,cy=0,cz=0;
    for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1]);cx+=a[0];cy+=a[1];cz+=a[2]}
    const l=Math.hypot(nx,ny,nz);if(l<1e-6)continue;nx/=l;ny/=l;nz/=l;cx/=p.length;cy/=p.length;cz/=p.length;
    let ref=o.n||(o.c?[cx-o.c[0],cy-o.c[1],cz-o.c[2]]:null);if(ref&&nx*ref[0]+ny*ref[1]+nz*ref[2]<0){nx=-nx;ny=-ny;nz=-nz}
    const vd=nx*LPV[0]+ny*LPV[1]+nz*LPV[2];if(ref){if(vd<=.002)continue}else if(vd<0){nx=-nx;ny=-ny;nz=-nz}
    const b=o.glow?1:(.42+.62*Math.max(0,nx*LPL[0]+ny*LPL[1]+nz*LPL[2]))*(o.bm||1),q=p.map(([x,y,z])=>[ax+x-y,ay+(x+y)/2-z]);
    let x0=1e9,x1=-1e9;for(const[x]of q){if(x<x0)x0=x;if(x>x1)x1=x}
    const c=f.col,flat=o.glow||x1-x0<3||c[0]!=='#';
    if(o.a!=null)g.globalAlpha=o.a;
    if(flat)g.fillStyle=c[0]==='#'&&!o.glow?shade(c,b):c;else{const gr=g.createLinearGradient(x0,0,x1+.01,0);gr.addColorStop(0,shade(c,b*1.08));gr.addColorStop(1,shade(c,b*.9));g.fillStyle=gr}
    g.beginPath();q.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
    if(!o.a&&!o.nos){g.strokeStyle=c[0]==='#'&&!o.glow?shade(c,b):c;g.lineWidth=.5;g.stroke()}
    if(o.sp){g.save();g.clip();const R=mulberry((cx*73+cy*31+cz*17)|0),n=Math.round((x1-x0)*o.sp);let y0=1e9,y1=-1e9;for(const[,y]of q){if(y<y0)y0=y;if(y>y1)y1=y}
      for(let k=0;k<n;k++){g.fillStyle=shade(c,b*(R()<.5?.78:1.18));g.fillRect(x0+R()*(x1-x0)|0,y0+R()*(y1-y0)|0,1+(o.sw&&R()<.5?1:0),1)}g.restore()}
    if(o.a!=null)g.globalAlpha=1}}
// built, measured and baked onto its own canvas; c.ax, c.ay is the point on the ground
function lpBake(f,pad=3){const M=lpMesh();f(M);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const fc of M.F)for(const[x,y,z]of fc.p){const sx=x-y,sy=(x+y)/2-z;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy}
  const ax=Math.ceil(-x0)+pad,ay=Math.ceil(-y0)+pad,c=mk(Math.ceil(x1-x0)+pad*2+1,Math.ceil(y1-y0)+pad*2+1,g=>lpRender(g,M,ax,ay));c.ax=ax;c.ay=ay;return c}
function lpDraw(f,sx,sy){const M=lpMesh();f(M);lpRender(ctx,M,sx,sy)}
// straw, grass and leaves: thin spikes standing out of a surface
function lpSpikes(M,R,n,at,cols,len){for(let k=0;k<n;k++){const[x,y,z,dx,dy,dz]=at(R),l=len[0]+R()*(len[1]-len[0]),w=.5+R()*.5,c=cols[R()*cols.length|0];
  M.face([[x-w,y+w*.3,z],[x+w,y-w*.3,z],[x+dx*l,y+dy*l,z+dz*l]],c,{bm:1.05})}}

/* chests: the body, a half-octagon lid, bands, plate and lock, thrown open on its back hinge */
function lpChest(s,open){const X=9.5,Y=6.2,H=10,LR=6.2,B=s.b,T=s.t,K=s.k,IN='#1a0e06',R=mulberry(s.n.length*97+(open?5:1));
  const arc=(e=0)=>{const p=[];for(let k=0;k<=4;k++){const a=Math.PI*k/4;p.push([Math.cos(a)*(Y+e),H-e*.4+Math.sin(a)*(LR+e)])}return p};
  const GL=['#e8f8ff','#c8e8ff','#ffd8f0','#f0e8ff','#d8fff0'];
  const lid=M=>{M.ext(arc(),'x',-X,X,B[2],{sp:s.vines?.6:.35});
    if(s.glass){const p=arc(.12);for(let k=0;k<4;k++){const a=p[k],b=p[k+1];for(let i=0;i<4;i++){const x=-X+2*X*i/4,x2=x+2*X/4;
      M.face([[x+.3,a[0],a[1]],[x2-.3,a[0],a[1]],[x2-.3,b[0],b[1]],[x+.3,b[0],b[1]]],GL[(k*2+i)%5],{n:[0,(a[0]+b[0])/2,(a[1]+b[1])/2-H],bm:1.2})}}}
    for(const bx of[-X+2.2,X-4.4])M.ext(arc(.55),'x',bx,bx+2.2,T[2],{noCaps:1});
    if(s.studs)for(let k=0;k<5;k++)M.box(-X+4.6+k*2.3,Y*.86,H+LR*.62,-X+5.4+k*2.3,Y*.86+.7,H+LR*.62+.8,T[2])};
  return lpBake(M=>{
    if(open)M.with(lpRx(1.95,-Y,H),()=>lid(M));
    // the body: inside first when open, then the walls that face you
    if(open){M.face([[-X+1.2,-Y+1.2,2.5],[X-1.2,-Y+1.2,2.5],[X-1.2,-Y+1.2,H],[-X+1.2,-Y+1.2,H]],B[0],{n:[0,1,0]});M.face([[-X+1.2,-Y+1.2,2.5],[-X+1.2,Y-1.2,2.5],[-X+1.2,Y-1.2,H],[-X+1.2,-Y+1.2,H]],B[0],{n:[1,0,0]});
      M.face([[-X+1.2,-Y+1.2,2.5],[X-1.2,-Y+1.2,2.5],[X-1.2,Y-1.2,2.5],[-X+1.2,Y-1.2,2.5]],IN,{n:[0,0,1]});
      if(s.shine||s.crown||s.lock||s.gem){const cols=['#ffd040','#fff0a0','#e0a020','#ffe070'];for(let k=0;k<11;k++)M.ball(-X+3+R()*(2*X-6),-Y+3+R()*(2*Y-6),H-1.4+R()*2,1.3+R()*.8,5,cols[k%4],{m:2,rz:.6});
        if(s.gem)M.ball(1,0,H+.4,1.8,5,s.gem,{m:2,bm:1.3})}
      else if(!s.glass)for(let k=0;k<4;k++)M.ball(-X+3+R()*(2*X-6),-Y+3+R()*(2*Y-6),H-3,2,5,'#6a5a48',{m:2,rz:.5})}
    M.box(-X,-Y,0,X,Y,H,B[1],{noTop:open,sp:.35});
    if(open){const e=1.2;M.face([[-X,Y,H],[X,Y,H],[X-e,Y-e,H],[-X+e,Y-e,H]],B[2],{n:[0,0,1]});M.face([[X,-Y,H],[X,Y,H],[X-e,Y-e,H],[X-e,-Y+e,H]],B[2],{n:[0,0,1]});
      M.face([[-X,-Y,H],[X,-Y,H],[X-e,-Y+e,H],[-X+e,-Y+e,H]],B[2],{n:[0,0,1]});M.face([[-X,-Y,H],[-X,Y,H],[-X+e,Y-e,H],[-X+e,-Y+e,H]],B[2],{n:[0,0,1]})}
    M.box(-X-.5,-Y-.5,0,X+.5,Y+.5,1.8,T[1],{noTop:1});M.box(-X-.4,-Y-.4,H-1.5,X+.4,Y+.4,H,T[1],{noTop:open});
    for(const bx of[-X+2.2,X-4.4])M.box(bx,Y,0,bx+2.2,Y+.55,H,T[2]);M.box(X,-Y+1.6,0,X+.55,-Y+3.8,H,T[2]);M.box(X,Y-3.8,0,X+.55,Y-1.6,H,T[2]);
    if(s.studs)for(const x of[-X+5.4,-2.6,1.8,X-6.2])for(const z of[3.6,7])M.box(x,Y+.1,z,x+.9,Y+.8,z+.9,T[2]);
    if(s.vines){const V=['#2a5a1a','#3a7a2a','#5aa83a','#7ac84a'];lpSpikes(M,R,26,R=>{const top=!open&&R()<.45;return top?[-X+R()*2*X,Y*.3+R()*Y*.6,H+LR*.8,0,.3,1]:[-X+R()*2*X,Y+.3,R()*H,R()-.5,.6,R()*.6-.2]},V,[1.6,3.4])}
    if(open)return;
    lid(M);
    if(s.lock){M.box(-3,Y+.6,H-8.5,3,Y+2.4,H-3,K[1]);M.face([[-.6,Y+2.45,H-6.8],[.6,Y+2.45,H-6.8],[.6,Y+2.45,H-5],[-.6,Y+2.45,H-5]],IN,{n:[0,1,0]});
      M.box(-2.3,Y+1,H-3,-1.2,Y+1.9,H+.6,K[2]);M.box(1.2,Y+1,H-3,2.3,Y+1.9,H+.6,K[2]);M.box(-2.3,Y+1,H-.4,2.3,Y+1.9,H+.6,K[2])}
    else{M.box(-2,Y+.3,H-5,2,Y+1.1,H+2.6,K[2]);M.face([[-.5,Y+1.15,H-3.6],[.5,Y+1.15,H-3.6],[.5,Y+1.15,H-1.8],[-.5,Y+1.15,H-1.8]],IN,{n:[0,1,0]})}
    if(s.gem){const gx=0,gy=Y*.74,gz=H+LR*.72+.6,r=1.9,P=[[gx,gy,gz+r],[gx+r,gy,gz],[gx,gy+r,gz],[gx-r,gy,gz],[gx,gy-r,gz],[gx,gy,gz-r]];
      for(const[a,b]of[[1,2],[2,3],[3,4],[4,1]]){M.face([P[0],P[a],P[b]],s.gem,{c:[gx,gy,gz],bm:1.25});M.face([P[5],P[a],P[b]],s.gem,{c:[gx,gy,gz],bm:1.1})}
      for(const x of[-X+1.2,X-1.2])M.face([[x-.8,Y+.1,4.5],[x,Y+.1,5.6],[x+.8,Y+.1,4.5],[x,Y+.1,3.4]],s.gem,{n:[0,1,0],bm:1.2})}
    if(s.crown){const z=H+LR;M.cyl(0,0,z-.3,z+1.4,3,8,T[1]);for(let k=0;k<5;k++){const a=k/5*6.283+.3;M.cyl(Math.cos(a)*2.6,Math.sin(a)*2.6,z+1.4,z+4.2,.9,4,T[2],{r1:0})}M.ball(1.8,1.8,z+.6,.9,4,'#e02840',{m:2,bm:1.3})}})}
// barrels and crates, whole or smashed
function lpBarrel(open){const W=['#7a4a22','#9a6634','#8a5a2c','#b07a40'],H=['#4a4a52','#6a6a74'],R=mulberry(open?91:19),cf=k=>k%3===0?W[2]:k%2?W[0]:W[1];
  return lpBake(M=>{if(!open){M.lathe(0,0,[[0,5.8],[3,6.8],[9,7.5],[15,6.8],[18,5.8]],10,W[1],{colf:cf,capCol:W[3],sp:.25});
      for(const z of[2.3,13.4])M.lathe(0,0,[[z,z<9?6.95:7.05],[z+1.8,z<9?7.15:6.85]],10,H[1],{cap:false});
      for(const y of[-2.4,0,2.4]){const w=Math.sqrt(5.5*5.5-y*y);M.face([[-w,y-.22,18.05],[w,y-.22,18.05],[w,y+.22,18.05],[-w,y+.22,18.05]],'#5a3818',{n:[0,0,1],nos:1})}return}
    for(let k=0;k<8;k++){const a=k/8*6.28+R()*.5,d=8.5+R()*4,x=Math.cos(a)*d,y=Math.sin(a)*d;M.with(lpRz(a+1.57+(R()-.5)*.8,x,y),()=>M.box(x-4.8,y-1.1,0,x+4.8,y+1.1,1.1,cf(k),{sp:.3}))}
    const n=10,tops=[];for(let k=0;k<n;k++)tops.push(4.5+R()*6.5);const pt=(k,z,r)=>{const a=k/n*6.2832;return[Math.cos(a)*r,Math.sin(a)*r,z]};
    {const p=[];for(let k=0;k<n;k++)p.push(pt(k,1.5,5.6));M.face(p,'#1e1208',{n:[0,0,1]})}
    for(let k=0;k<n;k++){const k2=(k+1)%n;M.face([pt(k,0,5.8),pt(k2,0,5.8),pt(k2,tops[k2],6.4),pt(k,tops[k],6.4)],cf(k),{c:[0,0,3],sp:.25})}
    M.lathe(0,0,[[1,6.25],[2.4,6.45]],n,H[1],{cap:false});
    for(let k=0;k<8;k++){const a=k/8*6.283,b=(k+1)/8*6.283,r=5.6,ox=11,oy=3;M.face([[ox+Math.cos(a)*r,oy+Math.sin(a)*r,.2],[ox+Math.cos(b)*r,oy+Math.sin(b)*r,.2],[ox+Math.cos(b)*(r+1.4),oy+Math.sin(b)*(r+1.4),.6],[ox+Math.cos(a)*(r+1.4),oy+Math.sin(a)*(r+1.4),.6]],H[1],{n:[0,0,1]})}})}
function lpCrate(open){const W=['#6a4420','#8a5a2c','#a8743c','#c08a50'],R=mulberry(open?71:17),S=8,Z=13;
  const frame=(M,top)=>{const b=2.1,o=.5;
    M.box(-S,S,0,S,S+o,b,W[2]);M.box(-S,S,Z-b,S,S+o,Z,W[2]);M.box(-S,S,b,-S+b,S+o,Z-b,W[2]);M.box(S-b,S,b,S,S+o,Z-b,W[2]);
    M.face([[-S+b,S+o,b],[-S+b+2.6,S+o,b],[S-b,S+o,Z-b-2.6],[S-b,S+o,Z-b],[S-b-2.6,S+o,Z-b],[-S+b,S+o,b+2.6]],W[2],{n:[0,1,0]});
    M.box(S,-S,0,S+o,S,b,W[2]);M.box(S,-S,Z-b,S+o,S,Z,W[2]);M.box(S,-S,b,S+o,-S+b,Z-b,W[2]);M.box(S,S-b,b,S+o,S,Z-b,W[2]);
    M.face([[S+o,S-b,b],[S+o,S-b-2.6,b],[S+o,-S+b,Z-b-2.6],[S+o,-S+b,Z-b],[S+o,-S+b+2.6,Z-b],[S+o,S-b,b+2.6]],W[2],{n:[1,0,0]});
    if(top){for(const y of[-S/3,S/3])M.face([[-S,y-.25,Z+.03],[S,y-.25,Z+.03],[S,y+.25,Z+.03],[-S,y+.25,Z+.03]],'#3a2410',{n:[0,0,1],nos:1})}};
  return lpBake(M=>{if(!open){M.box(-S,-S,0,S,S,Z,W[1],{sp:.3,top:W[2]});frame(M,true);return}
    M.with(lpMv(-14,4,0),()=>M.with(lpRz(.5),()=>{M.box(-7,-2,0,7,2,1.3,W[2],{sp:.3});M.box(-7,2.6,0,7,6.6,1.3,W[1],{sp:.3})}));
    M.face([[-S+1.2,-S+1.2,2],[S-1.2,-S+1.2,2],[S-1.2,-S+1.2,Z],[-S+1.2,-S+1.2,Z]],W[0],{n:[0,1,0]});M.face([[-S+1.2,-S+1.2,2],[-S+1.2,S-1.2,2],[-S+1.2,S-1.2,Z],[-S+1.2,-S+1.2,Z]],W[0],{n:[1,0,0]});
    M.face([[-S+1.2,-S+1.2,2],[S-1.2,-S+1.2,2],[S-1.2,S-1.2,2],[-S+1.2,S-1.2,2]],'#2a1a0c',{n:[0,0,1]});
    lpSpikes(M,R,30,R=>[-S+2+R()*(2*S-4),-S+2+R()*(2*S-4),2,R()-.5,R()-.5,.5+R()*.5],['#e0c060','#c8a448','#f0d878','#a8822e'],[3,7]);
    M.box(-S,-S,0,S,S,Z,W[1],{noTop:1,sp:.3});frame(M,false);
    const e=1.2;M.face([[-S,S,Z],[S,S,Z],[S-e,S-e,Z],[-S+e,S-e,Z]],W[3],{n:[0,0,1]});M.face([[S,-S,Z],[S,S,Z],[S-e,S-e,Z],[S-e,-S+e,Z]],W[3],{n:[0,0,1]});
    M.face([[-S,-S,Z],[S,-S,Z],[S-e,-S+e,Z],[-S+e,-S+e,Z]],W[3],{n:[0,0,1]});M.face([[-S,-S,Z],[-S,S,Z],[-S+e,S-e,Z],[-S+e,-S+e,Z]],W[3],{n:[0,0,1]})})}
chestSprites=function(){for(const[k,s]of Object.entries(CHT))if(s.b)CHS[k]={c:lpChest(s,false),o:lpChest(s,true)};CHS.barrel={c:lpBarrel(false),o:lpBarrel(true)};CHS.crate={c:lpCrate(false),o:lpCrate(true)}};

/* the yard: hay, the rack, lantern posts, the fence and the dummy */
const HAYC=['#e8c86a','#f4dc80','#d8b450','#c49a3a','#b08a30'];
function lpBale(M,x,y,z,R,L=9){const Y=6,H=10,c=2.2,pr=[[-Y,0],[Y,0],[Y,H-c],[Y-c,H],[-Y+c,H],[-Y,H-c]].map(([v,w])=>[v+y,w+z]);
  M.ext(pr,'x',x-L,x+L,HAYC[0],{sp:1.1,sw:1,capCol:HAYC[2]});
  for(const b of[-L*.45,L*.45]){const e=.45,p2=[[-Y-e,0],[Y+e,0],[Y+e,H-c],[Y-c,H+e],[-Y+c,H+e],[-Y-e,H-c]].map(([v,w])=>[v+y,w+z]);M.ext(p2,'x',x+b-.6,x+b+.6,'#7a5a20',{noCaps:1})}
  lpSpikes(M,R,34,R=>{const k=R();return k<.45?[x-L+R()*2*L,y-Y+R()*2*Y,z+H,R()-.5,R()-.5,.6]:k<.8?[x-L+R()*2*L,y+Y,z+R()*H,R()-.5,1,R()-.3]:[x+L,y-Y+R()*2*Y,z+R()*H,1,R()-.5,R()-.3]},HAYC,[1.5,4])}
function lpRack(){const Wd='#6e4a26',St='#c8ccd4',R=mulberry(5);return lpBake(M=>{
  for(const x of[-13,13]){M.box(x-3,-3,0,x+3,3,2.4,'#56381c');M.box(x-1.3,-1.3,0,x+1.3,1.3,40,Wd,{sp:.25})}
  M.box(-14,-.9,14,14,.9,16.6,Wd,{sp:.25});M.box(-14,-.9,30,14,.9,32.6,Wd,{sp:.25});
  M.box(-8.6,1.2,0,-7.4,2.2,7,'#4a3018');M.ball(-8,1.7,-.3,1.1,5,'#d8b040',{m:2});M.box(-11,1,7,-5,2.4,8.4,'#d8b040');M.box(-8.6,1.3,8.4,-7.4,2,33,St);M.ext([[-8.6,33],[-7.4,33],[-8,36.5]],'y',1.3,2,St);
  M.box(-3.5,1.2,0,-2.5,2.2,45,'#7a5030');M.box(-3.8,1,36,-2.2,2.4,38,'#b8302a');M.ext([[-3.9,45],[-2.1,45],[-2.4,49],[-3,53],[-3.6,49]],'y',1.3,2.1,St);
  M.box(1.6,1.2,0,2.6,2.2,37,'#7a5030');M.ext([[2.6,26],[7,23],[8.2,30],[7,37.5],[2.6,34]],'y',1.1,2.3,'#a8acb4');
  M.with(lpMv(9,3.4,19),()=>M.with(lpRx(-1.5708),()=>{M.cyl(0,0,0,1.6,6.6,8,'#c8a040');M.cyl(0,0,1.6,2.1,5.6,8,'#8a2a1e');M.ball(0,0,2.1,1.6,6,'#d8b040',{m:2,rz:.6})}))})}
function lpLamp(){return lpBake(M=>{M.box(-3,-3,0,3,3,3,'#3a2614');M.box(-1.4,-1.4,0,1.4,1.4,52,'#5a3c20',{sp:.25});
  M.box(-1.2,-1,48.5,13,1,51,'#5a3c20');M.ext([[1.4,40],[2.6,40],[9,48.5],[7.4,48.5]],'y',-.6,.6,'#4a3018');
  M.box(9.7,-.3,40,10.3,.3,48.5,'#2a2420');
  M.lathe(10,0,[[27,3.8],[28.4,3.8]],4,'#2a2420',{a0:.785});M.lathe(10,0,[[28.4,3.3],[37.6,3.3]],4,'#ffd070',{a0:.785,glow:1,cap:false});
  for(let k=0;k<4;k++){const a=.785+k*1.5708,x=10+Math.cos(a)*3.3,y=Math.sin(a)*3.3;M.box(x-.5,y-.5,28.4,x+.5,y+.5,37.6,'#2a2420')}
  M.lathe(10,0,[[37.6,4.2],[40,1.2],[41,.01]],4,'#2a2420',{a0:.785})})}
function lpDummy(){const R=mulberry(77),S='#a8a294',Hy=HAYC;return lpBake(M=>{
  M.box(-5,-5,0,5,5,2,'#3e2814');M.box(-1.6,-1.6,0,1.6,1.6,34,'#56381c',{sp:.25});
  M.box(-15,-1.2,33.5,-5,1.2,36.5,'#56381c');  M.cyl(0,0,16,44,7,8,S,{sp:.5,a0:.39,r1:6.6});M.cyl(0,0,20,22.4,7.25,8,'#c8a868',{cap:false,a0:.39});M.cyl(0,0,42,44.6,5,8,'#c8a868',{a0:.39});
  M.box(5,-1.2,33.5,15,1.2,36.5,'#56381c');
  lpSpikes(M,R,22,R=>{const sd=R()<.5?-1:1;return[sd*(14+R()*2),-1+R()*2,33.5+R()*3,sd,R()-.5,R()-.5]},Hy,[2,4]);
  lpSpikes(M,R,18,R=>{const a=R()*6.28;return[Math.cos(a)*6,Math.sin(a)*6,16.5,Math.cos(a)*.4,Math.sin(a)*.4,-1]},Hy,[2,5]);
  const tg=(r,col,d)=>{const p=[];for(let k=0;k<10;k++){const a=k/10*6.2832,u=Math.cos(a)*r,v=Math.sin(a)*r;p.push([4.4+d+u*.707,4.4+d-u*.707,31+v])}M.face(p,col,{n:[1,1,0]})};
  tg(5.4,'#b8302a',.62);tg(4,'#efe6d2',.66);tg(2.6,'#b8302a',.7);tg(1.2,'#efe6d2',.74);
  M.ball(0,0,51,7.4,8,S,{m:4,a0:.39,sp:.5});
  const fp=(u,v,c)=>{const p=[[u-.6,v-.6],[u+.6,v-.6],[u+.6,v+.6],[u-.6,v+.6]].map(([a,b])=>[5.3+a*.707,5.3-a*.707,b]);M.face(p,c,{n:[1,1,0],glow:1})};
  for(const u of[-2.4,2])for(const[du,dv]of[[-1,1],[1,-1],[0,0],[-1,-1],[1,1]])fp(u+du*.7,53+dv*.7,'#2a2420');
  for(let u=-2.6;u<=2.6;u+=1.3)fp(u,47.6,'#3a342c');
  lpSpikes(M,R,14,R=>[R()*4-2,R()*4-2,58,R()-.5,R()-.5,1],Hy,[2,4.5])})}
const _ydSpritesLP=ydSprites;ydSprites=function(){_ydSpritesLP();const R=mulberry(311);
  YDS.hay=[lpBake(M=>lpBale(M,0,0,0,R)),lpBake(M=>{lpBale(M,-1,-7,0,R);lpBale(M,1,7,0,R);lpBale(M,1.5,0,10,R,8)})];
  YDS.rack=lpRack();YDS.lamp=lpLamp();YDS.lamp.fl=[10,5-33]};
dummySprite=function(){const c=lpDummy();return{c,w:ydWhite(c)}};
const _drawDummyLP=drawDummy;drawDummy=function(e){const[sx,sy]=iso(e.x,e.y);if(sx<-80||sx>W+80||sy<-140||sy>H+60)return;if(!YD.spr)YD.spr=dummySprite();const c=YD.spr.c;
  shadow(sx,sy,.36);const w=e.wob||0,[dx]=scrDir(e.wobA||0),rot=Math.sin(G.t*15)*w*.16*(dx>=0?1:-1),h=(e.hitT||0)/.22;
  ctx.save();ctx.translate(Math.round(sx),Math.round(sy));ctx.rotate(rot);ctx.scale(1+h*.06,1-h*.05);ctx.drawImage(e.flash>0?YD.spr.w:c,-c.ax,-c.ay);ctx.restore();
  const act=G.t-YD.last<4;if(act)label(sx,sy-78,ydNum(YD.dps)+' Schaden/s · '+ydNum(YD.tot)+' gesamt','#ffd94f');else if(hyp(P.x-e.x,P.y-e.y)<6)label(sx,sy-78,'Übungspuppe · unendlich Leben','#e8d8a8')};
const _drawYdLP=drawYd;drawYd=function(p){const[sx,sy]=iso(p.x,p.y);if(sx<-90||sx>W+90||sy<-140||sy>H+80)return;if(!YDS.hay)ydSprites();
  if(p.k==='ydlamp'){const c=YDS.lamp;shadow(sx,sy,.16);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));flame(sx+c.fl[0],sy+c.fl[1],3,p.ph||0);return}
  if(p.k==='ydfence'){const A=[(p.x0-p.x)*32,(p.y0-p.y)*32],B=[(p.x1-p.x)*32,(p.y1-p.y)*32],alongX=Math.abs(B[0]-A[0])>Math.abs(B[1]-A[1]);
    lpDraw(M=>{const post=([x,y])=>{M.box(x-2,y-2,0,x+2,y+2,24,'#5a3c1e',{sp:.3});M.lathe(x,y,[[24,2],[26.5,.01]],4,'#5a3c1e',{a0:.785})},rail=z=>alongX?M.box(Math.min(A[0],B[0]),A[1]-.9,z,Math.max(A[0],B[0]),A[1]+.9,z+3,'#7a5430',{sp:.3}):M.box(A[0]-.9,Math.min(A[1],B[1]),z,A[0]+.9,Math.max(A[1],B[1]),z+3,'#7a5430',{sp:.3});
      post(A);rail(8);rail(17);if(p.end)post(B)},sx,sy);return}
  if(p.k==='ydflower')return drawBedLP(p,sx,sy);
  return _drawYdLP(p)};
// flower beds: a low mound of turned earth, the blossoms are small five-petal fans that nod in the wind
function drawBedLP(p,sx,sy){if(!p.bed){const R=mulberry(p.seed||7),E=['#5a3a1e','#6a4424','#4a2e16','#73492a'];p.bed=lpBake(M=>M.lathe(0,0,[[0,21],[1.2,19.5],[2.4,15],[3.4,.01]],11,E[0],{colf:k=>E[k%4],jf:()=>.9+R()*.18,sp:.7,sw:1}))}
  const c=p.bed;ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  if(!p.f){const R=ydR(p.seed);p.f=[];for(let k=0;k<22;k++){const a=R()*6.283,q=Math.sqrt(R());p.f.push([Math.cos(a)*q*26,Math.sin(a)*q*11,6+R()*7,p.pal[R()*p.pal.length|0],R()*6])}p.f.sort((a,b)=>a[1]-b[1])}
  const w=windAt(p.x,p.y);
  for(const[x,y,h,col,ph]of p.f){const b=Math.sin(G.t*1.6+ph)*1.2+w*3,X=sx+x,Y=sy+y-1,tx=X+b,ty=Y-h;
    ctx.strokeStyle='#3a7a2a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X,Y-h*.5,tx,ty);ctx.stroke();
    ctx.fillStyle='#4a9a32';ctx.beginPath();ctx.moveTo(X+b*.3,Y-h*.4);ctx.lineTo(X+b*.3-3,Y-h*.4-2);ctx.lineTo(X+b*.3-.5,Y-h*.4+1);ctx.fill();
    for(let k=0;k<5;k++){const a0=ph+k*1.2566,a1=a0+1.2566,r=2.6;ctx.fillStyle=shade(col,Math.sin(a0+.6)<0?1.08:.8);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(a0)*r,ty+Math.sin(a0)*r*.7);ctx.lineTo(tx+Math.cos(a1)*r,ty+Math.sin(a1)*r*.7);ctx.fill()}
    ctx.fillStyle='#fff4b0';ctx.fillRect(Math.round(tx)-.5,Math.round(ty)-.5,1,1)}}
// hens and butterflies, cut from a few flat facets
drawHen=function(c){const[sx,sy]=iso(c.x,c.y);if(sx<-20||sx>W+20||sy<-40||sy>H+20)return;const[dx]=scrDir(c.a),f=dx>=0?1:-1,walk=c.sp>0?Math.sin(c.t*22):0,hop=c.flap>0?Math.abs(Math.sin(c.t*30))*3:0,
    peck=c.peck&&c.sp===0&&Math.sin(c.t*7)>.3?3:0,X=sx,Y=sy-hop-Math.abs(walk)*.6,L=c.col[0],D=c.col[1];
  const Q=(pts,col)=>{ctx.fillStyle=col;ctx.beginPath();pts.forEach(([x,y],k)=>k?ctx.lineTo(X+x*f,Y+y):ctx.moveTo(X+x*f,Y+y));ctx.closePath();ctx.fill()};
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(sx,sy,6,2.5,0,0,7);ctx.fill();
  ctx.strokeStyle='#d8962a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X-1*f,Y-4);ctx.lineTo(X+(-1+walk)*f,Y);ctx.moveTo(X+1.5*f,Y-4);ctx.lineTo(X+(1.5-walk)*f,Y);ctx.stroke();
  Q([[-6,-9],[-9,-15],[-7,-15.5],[-4,-10]],shade(D,.8));Q([[-6,-9],[-8,-13.5],[-5.5,-12]],L);
  Q([[-6,-8],[-3,-11.5],[3,-11],[5,-7]],shade(L,1.06));Q([[5,-7],[2,-3.5],[-4,-3.6],[-6,-8]],shade(D,.92));Q([[-6,-8],[5,-7],[2,-3.5]],shade(L,.88));
  const wu=c.flap>0?Math.sin(c.t*40)*4:0;Q([[-3.5,-9],[2,-9.5],[-1,-6.5-wu*.2],[-5,-6.8+wu]],shade(D,.85));
  const hy=peck;Q([[2.5,-10.5+hy],[4,-15.5+hy],[7,-14.5+hy],[6.5,-10+hy]],shade(L,1.08));Q([[2.5,-10.5+hy],[6.5,-10+hy],[5,-8+hy]],shade(L,.85));
  Q([[3.5,-15.2+hy],[4.4,-17.4+hy],[5.3,-15.6+hy],[6.2,-17+hy],[6.6,-14.8+hy]],'#d83a2a');Q([[6.2,-11.2+hy],[7.2,-11+hy],[6.6,-9+hy]],'#c82a1a');
  Q([[6.8,-13.6+hy],[9,-12.8+hy],[6.8,-12.2+hy]],'#e8a830');ctx.fillStyle='#1a140c';ctx.fillRect(X+5*f-.5,Y-13.4+hy,1,1)};
const _drawCritterLP=drawCritter;drawCritter=function(c){if(c.k!=='fly')return _drawCritterLP(c);const[sx,sy]=iso(c.x,c.y);if(sx<-20||sx>W+20||sy<-60||sy>H+20)return;
  const z=26+Math.sin(c.t*1.3)*8,fl=Math.abs(Math.sin(c.t*14)),y=sy-z,d=shade(lpHex(c.col),.7);
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(sx,sy,3,1.2,0,0,7);ctx.fill();
  for(const s of[-1,1]){const w=4.2*(.25+fl*.75);ctx.fillStyle=c.col;ctx.beginPath();ctx.moveTo(sx,y-.5);ctx.lineTo(sx+s*w,y-3.2);ctx.lineTo(sx+s*w*.9,y);ctx.closePath();ctx.fill();
    ctx.fillStyle=d;ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(sx+s*w*.75,y+.4);ctx.lineTo(sx+s*w*.4,y+2.6);ctx.closePath();ctx.fill()}
  ctx.fillStyle='#1a1a1a';ctx.fillRect(sx-.5,y-2,1,3.5)};
// the anvil of joining on its stump and the glyph table, as meshes with their glow laid on top
const LPA={};
function lpAnvil(M,x,y,z,s=1){const P=[[-7,0],[7,0],[5,2],[3,3.5],[3,7],[9,9],[17,10],[9,12.5],[-9,12.5],[-12,11],[-9,9],[-3,7],[-3,3.5],[-5,2]].map(([u,v])=>[x+u*s,z+v*s]);
  M.ext(P,'y',y-3.5*s,y+3.5*s,'#3a3c44',{sp:.15});M.box(x-9*s,y-3.5*s,z+12.5*s-.6,x+9*s,y+3.5*s,z+12.5*s+.2,'#8a8f9a',{noTop:0})}
function lpStump(M,x,y,r,h,R){const B=['#4a2e16','#5a3a1e','#6a4424'];M.lathe(x,y,[[0,r*1.12],[2,r],[h,r*.96]],9,B[1],{colf:k=>B[k%3],jf:()=>.94+R()*.12,capCol:'#a8784a',sp:.4});
  M.lathe(x,y,[[h+.05,r*.6],[h+.1,r*.6]],9,'#94683c',{cap:true,capCol:'#94683c',nos:1});M.lathe(x,y,[[h+.15,r*.25],[h+.2,r*.25]],7,'#a8784a',{capCol:'#7a5230'})}
const _drawAnvilJLP=drawAnvilJ;drawAnvilJ=function(o){const[sx,sy]=iso(o.x,o.y);if(sx<-80||sx>W+80||sy<-100||sy>H+60)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t;
  if(!LPA.anv){const R=mulberry(23);LPA.anv=lpBake(M=>{lpStump(M,16.5,-4.5,5,9,R);M.with(lpMv(16.5,-4.5,9),()=>M.with(lpRy(.35),()=>{M.box(-.7,-.7,0,.7,.7,16,'#7a5430');M.box(-4,-1.6,16,4,1.6,20,'#3a3c44')}));
    lpStump(M,0,0,11,12,R);lpAnvil(M,0,0,12)})}
  const c=LPA.anv;shadow(sx+4,sy,.5);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(122,240,224,${.45+Math.sin(t*3)*.3})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx-11,sy-23);ctx.lineTo(sx+5.5,sy-15);ctx.stroke();ctx.restore();
  if(hov)label(sx,sy-48,'Amboss der Vereinung','#7af0e0')};
const _drawEnchTLP=drawEnchT;drawEnchT=function(o){const[sx,sy]=iso(o.x,o.y);if(sx<-80||sx>W+80||sy<-110||sy>H+60)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t;
  if(!LPA.tab)LPA.tab=lpBake(M=>{const Wd='#7a5430';for(const[x,y]of[[-12,-7],[12,-7],[-12,7],[12,7]])M.box(x-1.4,y-1.4,0,x+1.4,y+1.4,13,'#5a3a1e');
    M.box(-15,-9,13,15,9,16,Wd,{sp:.4,top:'#9a6a3a'});for(const x of[-8,0,8])M.face([[x-.2,-9,16.03],[x+.2,-9,16.03],[x+.2,9,16.03],[x-.2,9,16.03]],'#6a4424',{n:[0,0,1],nos:1});
    M.box(-7,-5,16,7,5,16.8,'#2a4a48');M.face([[-6.5,-4.5,16.8],[0,-4.5,17.6],[0,4.5,17.6],[-6.5,4.5,16.8]],'#e8dcc0',{n:[.15,0,1]});M.face([[0,-4.5,17.6],[6.5,-4.5,16.8],[6.5,4.5,16.8],[0,4.5,17.6]],'#d8ccb0',{n:[-.15,0,1]});
    for(let i=0;i<4;i++)for(const sd of[-1,1])M.face([[sd*1.5,-3+i*1.8,17.5],[sd*5.5,-3+i*1.8,17.05],[sd*5.5,-2.6+i*1.8,17.05],[sd*1.5,-2.6+i*1.8,17.5]],'#1a9a8a',{n:[0,0,1],nos:1,glow:1})});
  const c=LPA.tab;shadow(sx,sy-2,.55);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  const q=ctx.createRadialGradient(sx,sy-30,1,sx,sy-30,22);q.addColorStop(0,`rgba(122,240,224,${.35+Math.sin(t*2)*.08})`);q.addColorStop(1,'rgba(122,240,224,0)');ctx.fillStyle=q;ctx.fillRect(sx-22,sy-52,44,44);
  for(let i=0;i<4;i++){const a=t*.9+i*1.5708,x=sx+Math.cos(a)*13,y=sy-42+Math.sin(a)*4+Math.sin(t*2+i)*1.5,fr=Math.sin(a)>0;
    ctx.fillStyle=fr?'#5ef0d8':'#1a9a8a';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+2.5,y);ctx.lineTo(x,y+4);ctx.closePath();ctx.fill();ctx.fillStyle=fr?'#c8fff4':'#3ac8b0';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x-2.5,y);ctx.lineTo(x,y+4);ctx.closePath();ctx.fill()}
  if(hov)label(sx,sy-58,'Glyphentisch','#7af0e0')};

/* the props scattered through the tower and over the islands */
const BONE='#d8d0bc';
function lpRock(M,x,y,r,R,col,o={}){const C=col||['#5a544a','#6a6458','#4a443c','#7a7468'];M.ball(x,y,r*(o.rz||.62)*.9,r,o.n||7,C[0],{m:3,rz:o.rz||.62,colf:k=>C[(k+(R()*4|0))%C.length],jf:()=>.78+R()*.4,sp:.3})}
function lpSkull(M,x,y,z,r,a=0){const d=[Math.cos(.785+a),Math.sin(.785+a)],u=[d[1],-d[0]];M.ball(x,y,z+r,r,7,'#e0d8c4',{m:4,rz:.92});
  M.box(x+d[0]*r*.2-r*.5,y+d[1]*r*.2-r*.5,z,x+d[0]*r*.2+r*.5,y+d[1]*r*.2+r*.5,z+r*.6,'#cfc6ae');
  const F=(du,dz,w,h,col)=>{const cx=x+d[0]*r*.98+u[0]*du,cy=y+d[1]*r*.98+u[1]*du,cz=z+r+dz;M.face([[cx-u[0]*w,cy-u[1]*w,cz-h],[cx+u[0]*w,cy+u[1]*w,cz-h],[cx+u[0]*w,cy+u[1]*w,cz+h],[cx-u[0]*w,cy-u[1]*w,cz+h]],col,{n:[d[0],d[1],0],glow:1})};
  F(-r*.38,0,r*.24,r*.22,'#1a140c');F(r*.38,0,r*.24,r*.22,'#1a140c');F(0,-r*.42,r*.1,r*.14,'#3a3226')}
function lpBone(M,x,y,a,l){M.with(lpRz(a,x,y),()=>{M.box(x-l/2,y-.6,0,x+l/2,y+.6,1.2,BONE);for(const s of[-1,1])for(const t of[-.8,.8])M.ball(x+s*l/2,y+t,.6,1,5,BONE,{m:2})})}
const DCL={},DCB={
  dcbones:(M,R)=>{lpBone(M,-4,2,.4,11);lpBone(M,3,-3,-.6,9);lpBone(M,5,5,1.4,7);lpSkull(M,-2,-5,0,3.4,.3)},
  dcskulls:(M,R)=>{lpSkull(M,-4,-3,0,3.6,-.2);lpSkull(M,3,-5,0,3.4,.4);lpSkull(M,1,3,0,3.6,0);lpSkull(M,-1,-1,5.4,3.3,.15)},
  dcurn:(M,R)=>{const T=['#9a5632','#b0683c','#8a4a2a'];M.lathe(0,0,[[0,3],[1,4.6],[5,6.2],[10,5],[13,2.6],[15,2.7],[16,3.3]],9,T[1],{colf:k=>T[k%3],capCol:'#1a0e06',sp:.3});
    for(const s of[-1,1])M.box(s*4.4-.6,-.6,10,s*4.4+.6,.6,14,T[2]);M.with(lpMv(9,4,3.2),()=>{M.with(lpRx(1.5708),()=>M.lathe(0,0,[[0,2.6],[2,3.4],[6,3.2]],7,T[1],{colf:k=>T[k%3],capCol:'#1a0e06'}))});
    M.face([[-6,6,.1],[-3,8,.1],[-5,9,.6]],T[0],{n:[0,0,1]})},
  dccand:(M,R)=>{M.lathe(0,0,[[0,6],[.5,5.4],[.8,.01]],9,'#d8d0b0',{jf:()=>.85+R()*.3});for(const[x,y,h]of DCC)M.cyl(x,y,.5,h,1.2,6,'#e8e0c8',{capCol:'#f4eed8'})},
  dcrubble:(M,R)=>{for(const[x,y,r]of[[-6,-2,3.4],[1,-5,4.2],[6,1,3],[-1,3,4.6],[8,-6,2.4],[-8,5,2]])lpRock(M,x,y,r,R)},
  dcsword:(M,R)=>{M.lathe(0,0,[[0,6],[1.4,3],[2,.01]],8,'#4a3a2a',{jf:()=>.8+R()*.4});M.with(lpRx(-.18),()=>M.with(lpRy(.22),()=>{const S='#9a9488';
    M.ext([[-1.3,0],[1.3,0],[1.1,20],[-1.1,20]],'y',-.35,.35,S);M.box(-5,-1.1,20,5,1.1,21.6,'#6a4a2a');M.box(-.8,-.8,21.6,.8,.8,27,'#4a3018');M.ball(0,0,27.6,1.4,5,'#c8a040',{m:2})}))},
  dcbook:(M,R)=>{M.box(-7,-4,0,4,4,2.4,'#5a1a14',{sx:'#e8dcc0'});M.with(lpRz(.5,1,0),()=>M.box(-4,-3,2.4,5,3,4.4,'#2a3a5a',{sx:'#e8dcc0'}));
    M.with(lpMv(8,7,0),()=>{M.box(-5,-3.5,0,5,3.5,.8,'#4a2a14');M.face([[-4.6,-3.2,.8],[0,-3.2,1.8],[0,3.2,1.8],[-4.6,3.2,.8]],'#e8dcc0',{n:[.2,0,1]});M.face([[0,-3.2,1.8],[4.6,-3.2,.8],[4.6,3.2,.8],[0,3.2,1.8]],'#d8ccac',{n:[-.2,0,1]})})},
  dccage:(M,R)=>{const I='#3e3a34';M.cyl(0,0,0,2,8.5,8,'#2a2622');const bars=[];for(let k=0;k<10;k++){const a=k/10*6.283;bars.push([Math.cos(a)*7.6,Math.sin(a)*7.6])}bars.sort((a,b)=>a[0]+a[1]-b[0]-b[1]);
    const bar=([x,y])=>M.box(x-.55,y-.55,2,x+.55,y+.55,30,I);bars.filter(b=>b[0]+b[1]<0).forEach(bar);lpSkull(M,0,0,2,3.6,.2);bars.filter(b=>b[0]+b[1]>=0).forEach(bar);
    M.lathe(0,0,[[30,8.5],[32,8.2],[35,4],[36,.01]],8,'#2a2622');M.box(-.5,-.5,36,.5,.5,40,I)},
  dcbanner:(M,R)=>{M.box(-1.1,-1.1,0,1.1,1.1,44,'#3a2614');M.box(-1,-1,42,14,1,43.6,'#3a2614');
    M.ext([[1.5,42],[13.5,42],[13.5,18],[10,21],[7.5,15],[5,21],[1.5,18]],'y',.9,1.3,'#8a1c12',{sp:.2});M.face([[5.5,1.35,34],[9.5,1.35,34],[9.5,1.35,30],[7.5,1.35,27.5],[5.5,1.35,30]],'#d8a838',{n:[0,1,0]});M.ball(7.5,1.4,31.6,1,5,'#fff0a0',{m:2})},
  dclog:(M,R)=>{const B=['#4a2e18','#5a3820','#3e2614'];M.with(lpMv(0,0,4.6),()=>M.with(lpRy(1.5708),()=>M.lathe(0,0,[[-17,4.6],[17,4.4]],8,B[0],{colf:k=>B[k%3],capCol:'#a88858',sp:.5})));
    M.face([[17.05,-2.3,4.6-2.3],[17.05,2.3,4.6-2.3],[17.05,2.3,4.6+2.3],[17.05,-2.3,4.6+2.3]].map(([x,y,z])=>[x,y*.9,z]),'#8a6a40',{n:[1,0,0],nos:1});
    lpSpikes(M,R,22,R=>[-14+R()*26,-2+R()*4,8.6,R()-.5,R()-.5,1],['#3a6a24','#4a8a2a','#5aa83a'],[1.5,3]);M.cyl(-6,4.4,0,3,.6,5,'#e8dcc0');M.lathe(-6,4.4,[[3,2.2],[4.2,1.4],[4.8,.01]],6,'#b8302a')},
  dcstump:(M,R)=>{for(let k=0;k<4;k++){const a=k*1.5708+.5;M.with(lpRz(a),()=>M.ext([[5,0],[11,0],[5,4]],'y',-1.4,1.4,'#4a2e16'))}lpStump(M,0,0,6.5,10,R);M.cyl(3,5.4,0,2.4,.5,5,'#e8dcc0');M.lathe(3,5.4,[[2.4,1.8],[3.4,1],[3.8,.01]],6,'#c8282a')},
  dcbush:(M,R)=>{const Gn=['#1e4a18','#2a6a20','#3a8a2a','#4aa034'];for(const[x,y,z,r]of[[-5,-4,4,6],[5,-5,4,5.5],[0,0,6,7.4],[-6,3,3,5],[5,4,3,5.2]])M.ball(x,y,z,r,7,Gn[1],{m:3,colf:k=>Gn[(k+(R()*4|0))%4],jf:()=>.85+R()*.3});
    for(let k=0;k<7;k++){const a=R()*1.6-.2,r=6+R()*2;M.ball(Math.cos(a)*r,Math.sin(a)*r,3+R()*7,.8,4,'#c8282a',{m:2,bm:1.2})}},
  dcmush:(M,R)=>{for(const[x,y,h,r]of[[-5,2,5,3.6],[1,-3,8,5],[6,4,4,2.8]]){M.cyl(x,y,0,h,r*.3,6,'#e8dcc0');M.lathe(x,y,[[h-.6,r*.35],[h,r],[h+r*.35,r*.8],[h+r*.65,.01]],8,'#b02c1c',{colf:k=>k%2?'#b02c1c':'#c83a24'});
    for(let k=0;k<3;k++){const a=R()*1.5+.1;M.ball(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,h+r*.38,.5,4,'#f0e8d8',{m:2,glow:1})}}},
  dcsign:(M,R)=>{M.box(-1.2,-1.2,0,1.2,1.2,30,'#3a2614',{sp:.3});M.box(-10,1.2,20,10,2.4,27,'#6a4424',{sp:.4,top:'#8a5c30'});M.with(lpRy(-.08,0,14),()=>M.box(-8,1.2,10,8,2.4,16,'#6a4424',{sp:.4,top:'#8a5c30'}));
    for(const[z,w]of[[24.5,7],[22.5,5]])M.face([[-w,2.45,z],[w,2.45,z],[w,2.45,z+.6],[-w,2.45,z+.6]],'#2a1808',{n:[0,1,0],glow:1});M.face([[-5,2.45,13],[4,2.45,13],[4,2.45,13.6],[-5,2.45,13.6]],'#2a1808',{n:[0,1,0],glow:1});
    lpSpikes(M,R,10,R=>[-2+R()*4,-2+R()*4,0,R()-.5,R()-.5,1],['#3a6a24','#5aa83a'],[2,4])},
  dccart:(M,R)=>{const Wd=['#4a2e18','#6a4424','#8a5c30'],wheel=y=>M.with(lpMv(-4,y,7),()=>M.with(lpRx(-1.5708),()=>{M.cyl(0,0,-.9,.9,7,10,Wd[1],{capCol:Wd[1]});M.cyl(0,0,.9,1.6,1.8,6,'#3a3c44')}));
    wheel(-8.6);M.box(-15,-8,8,15,8,10.5,Wd[1],{sp:.4});M.box(-15,-8,10.5,15,-7,15,Wd[0]);M.box(-15,-8,10.5,-14,8,15,Wd[0]);M.box(14,-8,10.5,15,8,15,Wd[0]);
    M.ball(-6,-2,13.5,4.4,7,'#c8b080',{m:3,rz:.8});M.ball(3,0,13,4,7,'#b8a070',{m:3,rz:.8});M.box(-15,7,10.5,15,8,15,Wd[0]);
    for(const y of[-4,4])M.with(lpRy(.22,15,9),()=>M.box(15,y-.7,8.6,30,y+.7,10,Wd[0]));wheel(8.6);
    M.with(lpMv(-4,10.25,7),()=>{for(let k=0;k<5;k++){const a=k/5*3.1416,c=Math.cos(a)*6.3,s=Math.sin(a)*6.3;M.face([[-c-.4*s,0,-s+.4*c],[c-.4*s,0,s+.4*c],[c+.4*s,0,s-.4*c],[-c+.4*s,0,-s-.4*c]],Wd[2],{n:[0,1,0]})}})},
  dcwell:(M,R)=>{const S=['#5a544a','#6a6458','#4a443c','#7a7468'];M.lathe(0,0,[[9.9,8],[10,8]],10,'#0a1418',{capCol:'#0a1418',cap:true,glow:1});
    M.box(-10,-.9,10,-8,.9,30,'#3a2614');M.lathe(0,0,[[0,10.8],[10,10.4]],10,S[1],{colf:k=>S[k%4],cap:false,sp:.5});
    for(let k=0;k<10;k++){const a=k/10*6.283,b=(k+1)/10*6.283;M.face([[Math.cos(a)*10.4,Math.sin(a)*10.4,10],[Math.cos(b)*10.4,Math.sin(b)*10.4,10],[Math.cos(b)*8,Math.sin(b)*8,10],[Math.cos(a)*8,Math.sin(a)*8,10]],S[3],{n:[0,0,1]})}
    M.box(8,-.9,10,10,.9,30,'#3a2614');M.box(-10,-.6,22,10,.6,23.2,'#5a3a1c');M.box(-.3,-.3,14,.3,.3,22,'#8a8274');M.cyl(0,0,11,14,1.8,6,'#5a3a1c');
    M.face([[-12,0,36],[12,0,36],[12,-7,28],[-12,-7,28]],'#6a3a24',{n:[0,-1,1],sp:.3});M.box(-10,-.9,28,-8,.9,36,'#3a2614');M.box(8,-.9,28,10,.9,36,'#3a2614');M.face([[-12,0,36],[12,0,36],[12,7,28],[-12,7,28]],'#7a4428',{n:[0,1,1],sp:.3})},
  dcscare:(M,R)=>{const Hy=HAYC;M.box(-1.2,-1.2,0,1.2,1.2,33,'#5a3a1c');M.box(-13,-1.6,26,-4,1.6,29.6,'#7a5a3a',{sp:.4});M.lathe(0,0,[[15,4.6],[28,6.2],[31,3]],6,'#7a5a3a',{a0:.5,sp:.4});M.box(4,-1.6,26,13,1.6,29.6,'#7a5a3a',{sp:.4});
    M.face([[2,4.2,20],[5,1.6,20],[5,1.6,24],[2,4.2,24]],'#3a6a8a',{n:[1,1,0]});lpSpikes(M,R,16,R=>{const sd=R()<.5?-1:1;return[sd*13,-1+R()*2,26+R()*3,sd,R()-.5,R()-.6]},Hy,[2,4]);
    lpSpikes(M,R,10,R=>[R()*6-3,R()*6-3,15,R()-.5,R()-.5,-1],Hy,[2,4]);M.ball(0,0,36,4.6,7,'#d8c088',{m:4});
    for(const du of[-1.5,1.5])M.face([[3.1+du*.7-.5,3.1-du*.7+.5,36.4],[3.1+du*.7+.5,3.1-du*.7-.5,36.4],[3.1+du*.7+.5,3.1-du*.7-.5,37.6],[3.1+du*.7-.5,3.1-du*.7+.5,37.6]],'#1a140c',{n:[1,1,0],glow:1});
    M.lathe(0,0,[[40,7.4],[40.8,7.2]],8,'#4a3018');M.lathe(0,0,[[40.8,3.6],[46,2.2],[48,.01]],7,'#4a3018',{sp:.3})},
  dcstones:(M,R)=>{for(const[x,y,r]of[[-7,-2,5],[1,-5,6.4],[7,2,4.6]]){lpRock(M,x,y,r,R,null,{rz:.8});M.ball(x-.5,y-.5,r*1.2,r*.75,6,'#3a6a24',{m:2,rz:.35,colf:k=>k%2?'#3a6a24':'#4a8a2a',jf:()=>.8+R()*.3})}}};
const DCC=[[-2.2,-1.6,8],[1.4,-2.4,11],[2.6,1.8,6],[-1.6,2.4,9]];
function dcLP(k){if(DCL[k])return DCL[k];const R=mulberry(k.length*131+k.charCodeAt(2)*7);const c=lpBake(M=>DCB[k](M,R));
  if(k==='dccand')c.fl=DCC.map(([x,y,h])=>[x-y,(x+y)/2-h-1]);return DCL[k]=c}
const _drawPropLP=drawProp;drawProp=function(p){if(!p.k||!DCB[p.k])return _drawPropLP(p);const c=dcLP(p.k),[sx,sy]=iso(p.x,p.y);
  if(sx<-c.width||sx>W+c.width||sy<-c.height||sy>H+c.height)return;if(c.height>24)shadow(sx,sy,c.width/90);
  if(p.f){ctx.save();ctx.translate(Math.round(sx),0);ctx.scale(-1,1);ctx.drawImage(c,-c.ax,Math.round(sy-c.ay));ctx.restore()}else ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  if(c.fl)for(const[x,y]of c.fl)flame(sx+(p.f?-x:x),sy+y,1.6,(p.ph||0)+x)};
