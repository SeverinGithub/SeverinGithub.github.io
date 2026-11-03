/* ---------- maps ---------- */
const walkT=t=>t===1||t===4||t===7||t===8;
function tileAt(x,y){const m=G.map,i=Math.floor(x),j=Math.floor(y);if(i<0||j<0||i>=m.w||j>=m.h)return 0;return m.t[j*m.w+i]}
const walkable=(x,y)=>walkT(tileAt(x,y));
const free=(x,y,r)=>walkable(x-r,y-r)&&walkable(x+r,y-r)&&walkable(x-r,y+r)&&walkable(x+r,y+r);
// a foe's sight line to its target is traced again about six times a second, or as soon as either side moves half a step
function eLos(e,r){const c=e._lc||(e._lc={}),k=c[r];if(k&&G.t-k.t<.18&&G.t>=k.t&&Math.abs(k.px-P.x)+Math.abs(k.py-P.y)<.5&&Math.abs(k.ex-e.x)+Math.abs(k.ey-e.y)<.5)return k.v;
  const v=los(e.x,e.y,P.x,P.y,r);c[r]={t:G.t-Math.random()*.06,v,px:P.x,py:P.y,ex:e.x,ey:e.y};return v}
function los(ax,ay,bx,by,r=0){const d=hyp(bx-ax,by-ay),n=Math.ceil(d/.2);for(let k=1;k<n;k++){const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n;if(r?!free(x,y,r):!walkable(x,y))return false}return true}

function genTown(){
  R=mulberry(G.seed*31+7);
  const w=80,h=44,c=22,t=new Uint8Array(w*h),under=new Uint8Array(w*h),ph=rnd(0,6),ax=61,ay=22,blocks=[];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=i+.5-c,dy=j+.5-c,d=hyp(dx,dy),a=Math.atan2(dy,dx),rr=15.5+Math.sin(a*3+ph)*1.6+Math.sin(a*7+ph*2)*.8;if(d<rr)t[j*w+i]=4}
  for(let j=c-1;j<=c+1;j++)for(let i=c-1;i<=c+1;i++)t[j*w+i]=5;
  // the arena island: a stone floor inside a grassy rim
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=i+.5-ax,dy=j+.5-ay,d=hyp(dx,dy),a=Math.atan2(dy,dx),rr=14+Math.sin(a*4+ph)*1.1+Math.sin(a*9+ph)*.5;if(d<rr)t[j*w+i]=d<12.6?7:4}
  // an old stone bridge between the islands, three tiles wide with low parapets
  const by=21;for(let i=c+8;i<ax-8;i++){for(let j=by;j<by+3;j++)if(!t[j*w+i])t[j*w+i]=8;for(const j of[by-1,by+3])if(!t[j*w+i]){t[j*w+i]=9;under[j*w+i]=8;blocks.push({i,j,k:'parapet',v:R()<.2?2:rint(0,1)})}}
  const blk=(i,j,k,v)=>{if(t[j*w+i]!==7&&t[j*w+i]!==4)return;under[j*w+i]=t[j*w+i];t[j*w+i]=9;if(k)blocks.push({i,j,k,v})};
  // colosseum: an outer wall of stone blocks with gaps, a ring of menhirs and columns inside
  for(let a=0;a<6.283;a+=.075){const gap=Math.abs(angDiff(a,Math.PI))<.42||[.9,2.2,4.1,5.3].some(g=>Math.abs(angDiff(a,g))<.12);if(gap)continue;blk(Math.floor(ax+.5+Math.cos(a)*12.2),Math.floor(ay+.5+Math.sin(a)*12.2),'ringwall',R()<.25?2:rint(0,1))}
  for(let k=0;k<14;k++){const a=k/14*6.283+.22;if(Math.abs(angDiff(a,Math.PI))<.4||Math.abs(angDiff(a,0))<.3)continue;blk(Math.floor(ax+.5+Math.cos(a)*9),Math.floor(ay+.5+Math.sin(a)*9),'menhir',rint(0,2))}
  blk(ax+10,ay,null);
  const spots=[[c+6.5,c+8.5],[c+5.5,c+6.5],[c+7.5,c+2.5],[c+2.3,c+2.3],[c+3.5,c+7],[c+15,c+.5],[c+14,c+1.5],[ax-12,ay+.5],[ax-13,ay+1.5]];
  for(let k=0;k<34;k++){const i=rint(3,40),j=rint(3,h-4);if(t[j*w+i]!==4||hyp(i-c,j-c)<4.5)continue;if(spots.some(s=>hyp(s[0]-i-.5,s[1]-j-.5)<2.6))continue;
    // keep a path from the camp to the door clear
    if(i>=c+1&&j>=c+1&&i<=c+8&&j<=c+9)continue;t[j*w+i]=3}
  R=Math.random;
  const tm={kind:'town',floor:0,w,h,t,under,blocks,arena:{x:ax+.5,y:ay+.5,r:8},explored:new Uint8Array(w*h),enemies:[],items:[],tower:{x:c+.5,y:c+.5},start:{x:c+6.5,y:c+8.5},
    objs:[{type:'door',x:c+2.3,y:c+2.3},{type:'shrine',x:c+5.5,y:c+6.5},{type:'merchant',x:c+7.5,y:c+2.5},{type:'stash',x:c+3.5,y:c+7},{type:'colossus',x:ax+10.5,y:ay+.5}],
    clouds:Array.from({length:9},()=>({x:Math.random()*2400-1200,y:Math.random()*900-450,s:.6+Math.random()*1.1,v:4+Math.random()*8,seed:Math.random()*1e4|0}))};decorateTown(tm);return tm
}
function genDungeon(f){for(let tr=0;tr<16;tr++){const m=tryDungeon(f,tr);if(m)return m}return tryDungeon(f,99,true)}
// catacombs: large halls, caves and pillared crypts joined by wide, wandering passages
function tryDungeon(f,tr,force){
  R=mulberry(G.seed*7919+f*104729+tr*31337);
  const w=96,h=96,t=new Uint8Array(w*h),boss=f%3===0,rooms=[],T=(i,j)=>i<0||j<0||i>=w||j>=h?0:t[j*w+i];
  const place=(rw,rh,shape)=>{for(let k=0;k<140;k++){const x=rint(4,w-rw-5),y=rint(4,h-rh-5);if(rooms.every(r=>x>r.x+r.w+6||x+rw+6<r.x||y>r.y+r.h+6||y+rh+6<r.y)){const r={x,y,w:rw,h:rh,cx:x+(rw>>1),cy:y+(rh>>1),shape};rooms.push(r);return r}}return null};
  if(boss)place(24,24,'round');
  for(let k=0;k<90&&rooms.length<(boss?9:11);k++)place(rint(12,20),rint(12,20),pick(['hall','hall','round','cave','cave','crypt']));
  const carve=(i,j)=>{if(i>2&&j>2&&i<w-3&&j<h-3)t[j*w+i]=1};
  for(const r of rooms){const ph=rnd(0,6),ph2=rnd(0,6);
    for(let j=r.y;j<r.y+r.h;j++)for(let i=r.x;i<r.x+r.w;i++){const u=(i-r.x+.5)/r.w*2-1,v=(j-r.y+.5)/r.h*2-1,d=hyp(u,v),a=Math.atan2(v,u);
      let ok=r.shape==='round'?d<=1:r.shape==='cave'?d<.82+Math.sin(a*3+ph)*.14+Math.sin(a*5+ph2)*.08:Math.abs(u)+Math.abs(v)<1.7;if(ok)carve(i,j)}}
  const corr=(a,b)=>{const hw=rint(4,6)/2;let x=a.cx,y=a.cy,oy=0,ox=0;
    const brush=(cx,cy)=>{for(let j=Math.floor(cy-hw);j<cy+hw;j++)for(let i=Math.floor(cx-hw);i<cx+hw;i++)carve(i,j)};
    const sx=Math.sign(b.cx-a.cx)||1,sy=Math.sign(b.cy-a.cy)||1;
    while(x!==b.cx){brush(x,y+oy);x+=sx;if(R()<.3)oy=clamp(oy+(R()<.5?-1:1),-3,3)}
    while(y!==b.cy){brush(x+ox,y);y+=sy;if(R()<.3)ox=clamp(ox+(R()<.5?-1:1),-3,3)}brush(x,y)};
  const link=new Set();
  for(let i=1;i<rooms.length;i++){let best=0,bd=1e9;for(let j=0;j<i;j++){const d=hyp(rooms[i].cx-rooms[j].cx,rooms[i].cy-rooms[j].cy);if(d<bd){bd=d;best=j}}corr(rooms[i],rooms[best]);link.add(i+'-'+best)}
  for(let k=0;k<3;k++){const a=rint(0,rooms.length-1),b=rint(0,rooms.length-1);if(a!==b&&!link.has(a+'-'+b))corr(rooms[a],rooms[b])}
  // ragged edges, then one smoothing pass so nothing reads as a grid
  for(let j=3;j<h-3;j++)for(let i=3;i<w-3;i++)if(!t[j*w+i]&&(T(i+1,j)||T(i-1,j)||T(i,j+1)||T(i,j-1))&&R()<(rooms.some(r=>r.shape==='cave'&&i>=r.x-2&&i<=r.x+r.w+2&&j>=r.y-2&&j<=r.y+r.h+2)?.3:.03))t[j*w+i]=9;
  for(let k=0;k<t.length;k++)if(t[k]===9)t[k]=1;
  const n8=(i,j)=>{let n=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++)if((di||dj)&&T(i+di,j+dj)===1)n++;return n};
  const sm=t.slice();for(let j=3;j<h-3;j++)for(let i=3;i<w-3;i++){const n=n8(i,j);sm[j*w+i]=n>=5?1:n<=2?0:t[j*w+i]}t.set(sm);
  // pillars in crypts and the larger halls
  for(const r of rooms){if(!(r.shape==='crypt'||r.shape==='hall'&&r.w>=16&&r.h>=16))continue;
    for(let py=r.y+3;py<=r.y+r.h-5;py+=5)for(const px of[r.x+3,r.x+r.w-5]){if(T(px,py)&&T(px+1,py)&&T(px,py+1)&&T(px+1,py+1)&&n8(px-1,py-1)>=5&&n8(px+2,py+2)>=5)for(const[di,dj]of[[0,0],[1,0],[0,1],[1,1]])t[(py+dj)*w+px+di]=0}}
  const near=(x,y)=>{for(let rr=0;rr<8;rr++)for(let dj=-rr;dj<=rr;dj++)for(let di=-rr;di<=rr;di++){const i=Math.floor(x)+di,j=Math.floor(y)+dj;if(T(i,j)===1&&T(i+1,j)===1&&T(i,j+1)===1&&T(i-1,j)===1&&T(i,j-1)===1)return[i+.5,j+.5]}return[x,y]};
  let start,end;
  const far=from=>{let b=null,bd=-1;for(const r of rooms){const d=hyp(r.cx-from.cx,r.cy-from.cy);if(d>bd){bd=d;b=r}}return b};
  if(boss){end=rooms[0];start=far(end)}else{start=rooms[0];end=far(start)}
  const[sx0,sy0]=near(start.cx+.5,start.cy+.5),[ex0,ey0]=near(end.cx+.5,end.cy+.5);
  // keep only what is reachable from the start
  const seen=new Uint8Array(w*h),q=[Math.floor(sy0)*w+Math.floor(sx0)];seen[q[0]]=1;
  while(q.length){const c=q.pop(),ci=c%w,cj=(c/w)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=(cj+dy)*w+ci+dx;if(!seen[ni]&&t[ni]===1){seen[ni]=1;q.push(ni)}}}
  if(!seen[Math.floor(ey0)*w+Math.floor(ex0)]&&!force)return null;
  let fl=0;for(let k=0;k<t.length;k++){if(t[k]===1&&!seen[k])t[k]=0;if(t[k]===1)fl++}
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(t[j*w+i]===0){for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++)if(T(i+di,j+dj)===1)t[j*w+i]=2}
  const rspot=(r,pad=1)=>{for(let k=0;k<40;k++){const i=rint(r.x+pad,r.x+r.w-1-pad),j=rint(r.y+pad,r.y+r.h-1-pad);if(T(i,j)===1&&n8(i,j)===8)return[i+.5,j+.5]}return near(r.cx+.5,r.cy+.5)};
  const objs=[{type:'shrine',x:sx0,y:sy0}];
  if(!boss)objs.push({type:'stairs',x:ex0,y:ey0});
  const others=rooms.filter(r=>r!==start&&r!==end);
  for(let k=0,n=rint(2,4);k<n&&others.length;k++){const[x,y]=rspot(pick(others),2);objs.push({type:'chest',x,y,open:false})}
  // dressing: floor decals, wall torches, braziers
  const deco=[],props=[];
  for(let k=0;k<fl/22;k++){const i=rint(3,w-4),j=rint(3,h-4);if(T(i,j)===1)deco.push({k:pick(['bones','bones','rubble','rubble','blood','skull']),x:i+rnd(.1,.9),y:j+rnd(.1,.9),v:rint(0,3)})}
  for(let j=3;j<h-3;j++)for(let i=3;i<w-3;i++){if(T(i,j)!==2||R()>.07)continue;const fy=T(i,j+1)===1,fx=T(i+1,j)===1;if(!fy&&!fx)continue;
    const x=fy?i+.5:i+1,y=fy?j+1:j+.5;if(props.some(p=>hyp(p.x-x,p.y-y)<7))continue;props.push({k:'torch',x,y,face:fy?'y':'x',ph:rnd(0,6)})}
  for(const r of rooms){if(r===start||r.shape==='cave')continue;for(let k=0;k<2;k++){const[x,y]=rspot(r,3);props.push({k:'brazier',x,y,ph:rnd(0,6)})}}
  const dm={kind:'dungeon',floor:f,w,h,t,explored:new Uint8Array(w*h),rooms,startRoom:start,endRoom:end,boss,objs,deco,props,enemies:[],items:[],start:(([x,y])=>({x,y}))(near(sx0+1.5,sy0+1.5))};
  decorate(dm,start,end,objs,T,n8);R=Math.random;return dm}
function populate(m){
  if(m.kind!=='dungeon')return;
  m.enemies=[];const f=m.floor;
  const VP=varPool(f),pool={length:1},pk=()=>wpick(VP);
  const spot=r=>{for(let k=0;k<20;k++){const x=r.x+rnd(1,r.w-1),y=r.y+rnd(1,r.h-1);if(free(x,y,.35))return[x,y]}return[r.cx+.5,r.cy+.5]};
  const prev=G.map;G.map=m;
  for(const r of m.rooms){
    if(r===m.startRoom)continue;
    if(m.boss&&r===m.endRoom){if(!G.bossDead[f])m.enemies.push(makeBoss(f,r.cx+.5,r.cy+.5));continue}
    const roll=R(),n=Math.round((rint(3,5)+Math.min(5,f>>1))*clamp(r.w*r.h/120,1,2.4)),pack=[];
    if(roll<.13){const ty=pk();for(let k=0;k<rint(3,4);k++){const[x,y]=spot(r);pack.push(makeEnemy(ty,x,y,'champ'))}}
    else if(roll<.24&&f>=2){const ty=pk();const[x,y]=spot(r);pack.push(makeEnemy(ty,x,y,'unique'));for(let k=0;k<rint(3,4);k++){const[a,b]=spot(r);pack.push(makeEnemy(ty,a,b,'minion'))}}
    else{const mix=[pk(),pk(),pk()];for(let k=0;k<n;k++){const[x,y]=spot(r);pack.push(makeEnemy(pick(mix),x,y))}}
    for(const e of pack)e.pack=pack;m.enemies.push(...pack);
  }
  G.map=prev}
function makeEnemy(vid,x,y,rank='normal'){
  const v=VAR[vid]||VAR.skel,type=v.base,d=MON[type],ml=G.mlvl,hs=(1+(ml-1)*.32)*v.hp,ds=(1+(ml-1)*.2)*v.dmg;
  const e={type,vid:v.id,d,x,y,r:d.r*Math.sqrt(v.scale),rank,name:v.n,sub:'',hp:d.hp*.7*hs,dmg:[d.dmg[0]*ds,d.dmg[1]*ds],spd:d.spd*v.spd*rnd(.9,1.1),cd:rnd(.3,1.2),aggro:false,face:rnd(0,6),anim:rnd(0,9),flash:0,slow:0,xp:d.xp*(1+(ml-1)*.35)*(v.hp*.6+v.dmg*.4),aff:[],charge:0,scale:(d.scale||1)*v.scale,dmgTaken:1,elem:v.elem,proj:v.proj,
    pal:new Map(Object.entries(v.pal).map(([k,r])=>[RP[k],RMP[r]]))};
  if(rank==='champ'){e.hp*=2.6;e.dmg=e.dmg.map(v=>v*1.4);e.spd*=1.12;e.xp*=3;e.sub='Champion';e.scale*=1.1}
  if(rank==='minion'){e.hp*=1.4;e.xp*=1.5;e.sub='Gefolge'}
  if(rank==='unique'){e.hp*=4.2;e.dmg=e.dmg.map(v=>v*1.6);e.xp*=6;e.scale*=1.2;
    e.name=pick(['Grimm','Asch','Morr','Kral','Vel','Hrok','Zeph','Ulv','Brann','Teer'])+pick(['zahn','fang','mar','grim','wolf','hart','brand','kiel'])+' '+pick(['der Verfluchte','die Hungrige','der Knochenbrecher','der Rastlose','die Graue','der Leichenfresser','der Schwarze','die Stumme']);
    const ks=Object.keys(ELITE_AFF);while(e.aff.length<2){const k=pick(ks);if(!e.aff.includes(k))e.aff.push(k)}
    if(e.aff.includes('schnell'))e.spd*=1.5;if(e.aff.includes('stein'))e.dmgTaken=.6;if(e.aff.includes('stark'))e.dmg=e.dmg.map(v=>v*1.5);
    e.sub=e.aff.map(k=>ELITE_AFF[k]).join(' · ')}
  e.sub=(e.sub?e.sub+' · ':'')+'Stufe '+ml;e.max=e.hp;return e}
function makeBoss(f,x,y){
  const bi=Math.floor(f/3)-1,def=BOSSES[bi%3],cyc=Math.floor(bi/3),ml=G.mlvl,hs=1+(ml-1)*.32,ds=1+(ml-1)*.2;
  const e={type:'boss',d:{kind:'boss',range:2,look:def.look,moves:def.moves},look:def.look,x,y,r:.8,rank:'boss',name:def.n+(cyc?' '+roman(cyc+1):''),sub:'Hüter der Tiefe',
    hp:560*hs*(1+cyc*.5),dmg:[12*ds,20*ds],spd:2.3,cd:1.5,aggro:false,face:2.3,anim:0,flash:0,slow:0,xp:420*(1+(ml-1)*.35),aff:[],charge:0,scale:2.3,dmgTaken:1,boss:true};
  e.max=e.hp;return e}

