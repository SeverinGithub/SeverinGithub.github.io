/* ---------- the plan: every tile, building and skeleton of the dead lands, built once per world ---------- */
function rgPlan(){const R=rgInit();if(R.plan)return R.plan;rgBuildSprites();const PW=R.P1-R.P0,PH=R.Q1-R.Q0,T=new Uint8Array(PW*PH),U=new Uint8Array(PW*PH);
  const Rn=mulberry((G.seed|0)*13+4711),rr=(a,b)=>a+Rn()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),pk=a=>a[Math.floor(Rn()*a.length)];
  const ix=(p,q)=>p<R.P0||p>=R.P1||q<R.Q0||q>=R.Q1?-1:(q-R.Q0)*PW+(p-R.P0);
  const gt=(p,q)=>{const k=ix(p,q);return k<0?0:T[k]},st=(p,q,t,u=0)=>{const k=ix(p,q);if(k>=0){T[k]=t;U[k]=u}};
  const bk=new Map(),B=(x,y)=>{const key=Math.floor(x/CH)+','+Math.floor(y/CH);if(!bk.has(key))bk.set(key,{objs:[],props:[],deco:[],blocks:[],crit:[],spawn:[]});return bk.get(key)};
  const wc=(p,q)=>{const[x,y]=rgW(p,q);return[x+.5,y+.5]};
  // a rectangle of local cells as a world footprint
  const foot=(p,q,w,h)=>{const[a,b]=rgW(p,q),[c,d]=rgW(p+w-1,q+h-1);return{i:Math.min(a,c),j:Math.min(b,d),w:Math.abs(c-a)+1,h:Math.abs(d-b)+1}};
  const solid=(p,q,w,h,u)=>{for(let a=p;a<p+w;a++)for(let b=q;b<q+h;b++){const k=ix(a,b);if(k>=0){U[k]=u??(T[k]===9?U[k]:T[k]||4);T[k]=9}}};
  const free=(p,q,w=1,h=1,ok=[4,7,1])=>{for(let a=p;a<p+w;a++)for(let b=q;b<q+h;b++)if(!ok.includes(gt(a,b)))return false;return true};
  // a building drawn as one big sprite over its footprint
  const bld=(k,p,q,w,h,v=0,o={})=>{solid(p,q,w,h,o.u);const f=foot(p,q,w,h),pr={k,v,fw:f.w,fh:f.h,x:f.i+f.w/2,y:f.j+f.h/2,ph:rr(0,6),...o};B(pr.x,pr.y).props.push(pr);return pr};
  const blk=(k,p,q,v)=>{if(!free(p,q))return null;solid(p,q,1,1);const[i,j]=rgW(p,q),b={i,j,k,v:v??ri(0,(SPR.prop[k]||[0]).length-1)};B(i,j).blocks.push(b);return b};
  const prop=(k,p,q,o={})=>{const[x,y]=wc(p,q);const pr={k,x,y,ph:rr(0,6),v:0,...o};B(x,y).props.push(pr);return pr};
  const deco=(k,p,q)=>{const[x,y]=wc(p,q),L=SPR.deco[k];if(!L)return;B(x,y).deco.push({k,x:x+rr(-.4,.4),y:y+rr(-.4,.4),v:ri(0,L.length-1)})};
  const obj=(o,p,q)=>{const[x,y]=wc(p,q);o.x=x;o.y=y;B(x,y).objs.push(o);return o};
  const spawn=(pool,p,q,n,z,champ=.08)=>{const cr=Rn()<champ;for(let k=0;k<n;k++){const a=p+rr(-1.6,1.6),b=q+rr(-1.6,1.6);if(!free(Math.floor(a),Math.floor(b)))continue;const[x,y]=wc(Math.floor(a),Math.floor(b));
    B(x,y).spawn.push({vid:wpickR(pool,Rn),x:x+rr(-.3,.3),y:y+rr(-.3,.3),rank:cr&&k<2?'champ':k===0&&Rn()<champ*.35?'unique':'normal',rgz:z})}};
  const wob=(p,ph,a1,a2)=>Math.sin(p*.083+ph)*a1+Math.sin(p*.217+ph*2.3)*a2;
  // the land itself: one long floating plateau
  const hw=p=>p<136?68:p<150?28+wob(p,1,2,1):p<243?50:p<436?78+wob(p,2.2,6,3):p<442?0:64+wob(p,4,4,2);
  for(let p=-4;p<R.P1;p++){const h=Math.floor(hw(p));for(let q=-h;q<=h;q++)st(p,q,4)}
  // ----- the city -----
  const CW=130,CQ=62;
  for(let p=0;p<=CW;p++){st(p,-CQ,2);st(p,CQ,2)}for(let q=-CQ;q<=CQ;q++){st(0,q,2);st(CW,q,2)}
  for(let q=-2;q<=2;q++){st(0,q,7);st(CW,q,7)}
  const street=(p0,q0,p1,q1)=>{for(let p=p0;p<=p1;p++)for(let q=q0;q<=q1;q++)if(gt(p,q)&&gt(p,q)!==2&&gt(p,q)!==9)st(p,q,7)};
  street(-3,-2,CW+3,2);street(1,-CQ+1,2,CQ-1);street(CW-2,-CQ+1,CW-1,CQ-1);street(1,-CQ+1,CW-1,-CQ+2);street(1,CQ-2,CW-1,CQ-1);
  const VS=[22,44,88,110],HS=[-42,-21,21,42];for(const p of VS)street(p-1,-CQ+1,p+1,CQ-1);for(const q of HS)street(1,q-1,CW-1,q+1);
  street(54,-13,78,13);
  // the cathedral north of the square, a fountain in its middle, stalls around it
  const church=bld('rgchurch',56,-38,20,16,0);for(let p=56;p<76;p++)st(p,-21,7);
  bld('rgfount',64,-2,4,4,0,{u:7});
  for(const[p,q]of[[57,6],[61,8],[70,8],[74,6],[57,-10],[74,-10]])bld('rgstall',p,q,2,2,ri(0,2),{u:7});
  for(const[p,q]of[[55,-12],[77,-12],[55,12],[77,12]])prop('brazier',p,q);
  // wall towers and gatehouses
  for(const p of[0,26,52,78,104,CW])for(const q of[-CQ,CQ]){bld('rgwt',p-1,q-1,3,3,0)}
  for(const q of[-21,21,-42,42])for(const p of[0,CW])bld('rgwt',p-1,q-1,3,3,0);
  for(const p of[0,CW]){bld('rgwt',p-1,-6,3,3,1);bld('rgwt',p-1,4,3,3,1)}
  // city blocks packed with houses, every one still standing
  const cuts=[1,...VS,CW-1],rows=[-CQ+1,...HS,CQ-1];
  for(let a=0;a<cuts.length-1;a++)for(let b=0;b<rows.length-1;b++){const p0=cuts[a]+2,p1=cuts[a+1]-2,q0=rows[b]+2,q1=rows[b+1]-2;
    for(let p=p0;p<=p1;){const w=ri(3,5);if(p+w-1>p1)break;for(let q=q0;q<=q1;){const h=ri(3,4);if(q+h-1>q1)break;
      if(free(p,q,w,h)){const r=Rn();if(r<.86)bld('rghouse',p,q,w,h,ri(0,5));else if(r<.93){blk(pk(['barrel','crate']),p+1,q+1);deco('straw',p,q+1)}else{deco('flowers',p+1,q+1);deco('tuft',p,q)}}
      q+=h+(Rn()<.7?1:2)}p+=w+(Rn()<.6?1:2)}}
  for(let k=0;k<180;k++){const p=ri(2,CW-2),q=ri(-CQ+2,CQ-2);if(gt(p,q)===7)deco(pk(['pebbles','rubble','straw','bones','leaves']),p,q);else if(gt(p,q)===4)deco(pk(['tuft','flowers','moss']),p,q)}
  for(let k=0;k<70;k++){const p=ri(3,CW-3),q=ri(-CQ+3,CQ-3);if(gt(p,q)===7&&Math.abs(q)>3&&Rn()<.6)blk(pk(['barrel','crate','barrel']),p,q)}
  for(let k=0;k<34;k++){const p=ri(4,CW-4),q=pk([-1,1])*pk([3,20,23,40,43]);if(gt(p,q)===7)prop('rglamp',p,q)}
  // the burghers of bone: guards at the gates, crowds in the streets, knights here and there
  const CITIZ=[['rg_bauer',4],['rg_sense',2.4],['rg_dresch',2],['rg_metzger',2],['rg_buerger',3],['rg_bleich',2.4],['rg_wache',2.2],['rg_armbrust',1.6],['rg_jaeger',1.4],['rg_ritter',.9]];
  for(let k=0;k<52;k++){const p=ri(6,CW-6),q=ri(-CQ+4,CQ-4);if(gt(p,q)!==7)continue;spawn(CITIZ,p,q,ri(2,4),'city')}
  spawn([['rg_wache',3],['rg_armbrust',2],['rg_ritter',1]],6,0,4,'city',.4);spawn([['rg_ritter',2],['rg_wache',2]],CW-6,0,4,'city',.4);spawn([['rg_buerger',2],['rg_bleich',2],['rg_ritter',1]],66,6,5,'city',.5);
  // ----- the pilgrims' road -----
  street(CW+1,-2,150,2);for(let p=CW+4;p<150;p+=3){if(Rn()<.5)blk('tree',p,pk([-6,-5,5,6]),2);if(Rn()<.4)blk('grave',p,pk([-9,-10,9,10]))}
  // ----- the cloister: a walled yard of graves, then the giant church -----
  const C0=150,C1=242,CQ2=46,K0=184,KQ=22;
  for(let p=C0;p<=C1;p++){st(p,-CQ2,2);st(p,CQ2,2)}for(let q=-CQ2;q<=CQ2;q++){st(C0,q,2);st(C1,q,2)}for(let q=-2;q<=2;q++)st(C0,q,7);
  bld('rgbell',K0-6,-KQ-6,5,5,0);bld('rgbell',K0-6,KQ+2,4,4,1);
  street(C0,-2,K0,2);for(let p=C0+3;p<K0-2;p+=5)for(const q of[-4,4])prop('brazier',p,q);
  for(let p=C0+4;p<K0-4;p+=3)for(const s of[-1,1])for(let q=8;q<CQ2-3;q+=3)if(Rn()<.7)blk('grave',p,s*q);
  for(const[p,q]of[[C0+8,-20],[C0+8,20],[C0+22,-30],[C0+22,30]])blk('statue',p,q);for(let k=0;k<40;k++){const p=ri(C0+2,K0-2),q=ri(-CQ2+2,CQ2-2);if(gt(p,q)===4)deco(pk(['bones','skull','moss','tuft','blood']),p,q)}
  for(let p=K0;p<=C1;p++)for(let q=-KQ;q<=KQ;q++)st(p,q,p===K0||p===C1||Math.abs(q)===KQ?2:1);
  for(let q=-2;q<=2;q++)st(K0,q,1);
  // nave, aisles, chapels, the crossing wall and the boss hall
  for(let p=K0+1;p<=214;p++)for(const s of[-1,1])if(!(p>=193&&p<=195)&&!(p>=205&&p<=207))st(p,s*10,2);
  for(const s of[-1,1])for(let q=11;q<KQ;q++)if(!(q>=15&&q<=17))st(199,s*q,2);
  for(let q=-KQ;q<=KQ;q++)if(Math.abs(q)>3)st(215,q,2);
  for(let p=K0+4;p<=212;p+=4)for(const s of[-1,1])bld('rgpillar',p,s*6,1,1,0,{u:1});
  for(let p=K0+3;p<=212;p+=6)for(const s of[-1,1])prop('brazier',p,s*8);
  for(let p=K0+2;p<=214;p++)deco('rgcarpet',p,0);
  for(const s of[-1,1]){for(const[p,q]of[[188,16],[203,16],[210,13]])blk(pk(['sarcophagus','coffin']),p,s*q);for(const[p,q]of[[192,19],[208,19]])prop('candles',p,s*q,{v:ri(0,2)});blk('altar',190,s*20);blk('bonepile',197,s*13);blk('skullpile',211,s*20);prop('shaft',196,s*15)}
  const HB=216,HE=C1-1;for(let p=HB+2;p<=HE-2;p+=5)for(const s of[-1,1]){bld('rgpillar',p,s*15,1,1,1,{u:1});prop('brazier',p,s*10)}
  for(let p=HB;p<=HE-3;p++)for(const q of[-1,0,1])deco('rgcarpet',p,q);
  for(const s of[-1,1]){blk('sarcophagus',HB+4,s*19);blk('sarcophagus',HB+14,s*19);blk('skullpile',HE-1,s*19);prop('shaft',HB+8,s*7);prop('shaft',HB+18,s*6);bld('rgbanner',HE,s*8,1,1,0,{u:1})}
  bld('rgthrone',HE-2,-2,2,5,0,{u:1});prop('candles',HE-3,-4,{v:2});prop('candles',HE-3,4,{v:2});
  const gate=[];for(let q=-2;q<=2;q++){st(C1,q,9,1);gate.push(ix(C1,q))}bld('rgportc',C1,-2,1,5,0,{u:1});
  for(let p=K0+1;p<C1;p+=2)for(let q=-KQ+1;q<KQ;q+=2)if(gt(p,q)===1&&Rn()<.08)deco(pk(['bones','rubble','blood','cobweb','skull']),p,q);
  const CLO=[['rg_ross',3],['rg_reiter',2.4],['rg_riese',1.4],['rg_koenig',1.6],['rg_armritter',1.6],['rg_templer',1.2],['rg_hellebard',1.6]];
  for(let k=0;k<12;k++){const p=ri(C0+4,K0-4),q=ri(-CQ2+4,CQ2-4);if(gt(p,q)===4||gt(p,q)===7)spawn([['rg_ross',4],['rg_reiter',3],['rg_koenig',1],['rg_armritter',1]],p,q,ri(2,3),'clo',.15)}
  for(const[p,q,n]of[[190,0,3],[200,0,3],[210,0,3],[191,-16,3],[191,16,3],[207,-16,3],[207,16,3]])spawn(CLO,p,q,n,'church',.2);
  for(const[p,q]of[[HB+4,-8],[HB+4,8]])spawn([['rg_koenig',2],['rg_riese',1]],p,q,2,'church',.5);
  { const[x,y]=wc(HB+14,0);B(x,y).rgBoss={x,y}}
  // ----- the dark red forest -----
  const F0=243,F1=430,path=p=>Math.round(Math.sin((p-F0)*.034)*26*Math.min(1,(p-F0)/24)*Math.min(1,(F1-p)/30));
  for(let q=-2;q<=2;q++)st(C1+1,q,7);
  const clear=[],huts=[],towers=[];
  for(let k=0;k<7;k++){const p=F0+16+k*25+ri(-3,3),s=k%2?1:-1,q=path(p)+s*ri(14,22);if(Math.abs(q)>hw(p)-10)continue;huts.push([p,q]);clear.push([p+2,q+2,7])}
  for(let k=0;k<9;k++){const p=F0+10+k*20+ri(-4,4),s=Rn()<.5?1:-1,q=path(p)+s*ri(30,52);if(Math.abs(q)>hw(p)-8)continue;towers.push([p,q]);clear.push([p+2,q+2,4.5])}
  const nearClear=(p,q)=>clear.some(([a,b,r])=>Math.hypot(p-a,q-b)<r);
  for(let p=F0;p<F1;p++){const c=path(p);for(let q=c-2;q<=c+2;q++)if(gt(p,q))st(p,q,Rn()<.72?7:4)}
  for(let p=F0+1;p<F1;p++){const h=Math.floor(hw(p))-1,c=path(p);for(let q=-h;q<=h;q++){if(Math.abs(q-c)<4||nearClear(p,q)||gt(p,q)!==4)continue;const r=Rn();
    if(r<.15)blk(Rn()<.8?'rgtree':'rgdead',p,q);else if(r<.21)deco(pk(['leaves','leaves','roots','moss','shrooms','bones']),p,q)}}
  for(let p=F0;p<F1;p+=2){const c=path(p);if(Rn()<.5)deco(pk(['leaves','pebbles','roots']),p,c+ri(-2,2))}
  huts.forEach(([p,q],i)=>{bld('rghut',p,q,4,4,i%3);const cp=p+2,cq=q+(q>path(p)?-2:6);prop('rgcaul',cp,cq);blk('cage',p-2,q+1);deco('skull',p+5,q+2);deco('bones',p-1,q+4);
    obj({type:'rghut',idx:i,name:'Hexenhaus'},p+2,q+2);spawn([['rg_hexe',3],['rg_knecht',2]],cp+1,cq+1,3,'wood',.4)});
  RG.huts=huts.map(([p,q])=>wc(p+2,q+2));
  towers.forEach(([p,q],i)=>bld('rgtower',p,q,4,4,i%3));
  const WOOD=[['rg_hexe',2],['rg_knecht',2.4],['rg_waldjaeger',2],['blutspinne',2],['riesenspinne',.8],['schattenspinne',1.6],['moorghul',1.4],['glutgeist',1]];
  for(let k=0;k<46;k++){const p=ri(F0+6,F1-6),c=path(p),q=Rn()<.6?c+ri(-3,3):ri(-60,60);if(gt(p,q)!==4&&gt(p,q)!==7)continue;spawn(WOOD,p,q,ri(2,4),'wood',.14)}
  // ----- the castle: a statue-lined plaza, a chasm, one bridge, and the gate -----
  street(F1-6,-8,435,8);for(let p=F1-4;p<434;p+=4)for(const s of[-1,1]){blk('statue',p,s*10);prop('brazier',p+2,s*7)}
  for(let p=436;p<442;p++)for(let q=-hw(p)-2;q<=hw(p)+2;q++)st(p,q,0);
  for(let p=436;p<442;p++){for(let q=-2;q<=2;q++)st(p,q,8);for(const q of[-3,3]){st(p,q,9,8);const[i,j]=rgW(p,q);B(i,j).blocks.push({i,j,k:'parapet',v:Math.abs(p)%3?0:1})}}
  street(442,-14,451,14);
  const castle=bld('rgcastle',452,-16,16,16,0,{u:7});for(let p=452;p<R.P1;p++)for(let q=-hw(p);q<=hw(p);q++)if(gt(p,q)===4&&(p>=452||Math.abs(q)>30))st(p,q,9,4);
  // the painted walls reach past the footprint: tiles that sit visually behind them are closed
  {const[ci,cj]=rgW(452,-1);for(let p=438;p<452;p++)for(let q=-36;q<=36;q++){const t=gt(p,q);if(t!==7&&t!==4)continue;const[i,j]=rgW(p,q),dx=i-ci,dy=j-cj,sx=Math.abs(dx-dy)*32,sy=(dx+dy)*16,bot=sx<=120?20-sx*.5:sx<=190?-16:sx<=440?-70:-sx*.5;if(sy+12<bot)st(p,q,9,t)}}
  obj({type:'rgcgate',name:'Tor der Riesenburg'},451,-1);
  for(const s of[-1,1]){prop('brazier',449,s*5);blk('statue',446,s*12)}
  for(let k=0;k<18;k++){const[x,y]=wc(ri(436,476),pk([-1,1])*ri(34,86));B(x,y).props.push({k:'rgrock',x,y,v:ri(0,3),ph:rr(0,6)})}
  spawn([['rg_koenig',2],['rg_riese',1],['rg_hellebard',2]],420,0,4,'castle',.5);spawn([['rg_koenig',2],['rg_armritter',2]],446,0,3,'castle',.6);
  // ----- the dead gate island: a fire, a warning, the first of them -----
  R.gate=gate;R.plan={T,U,PW,PH,ix};R.bk=bk;R.cathedral=church;R.castle=castle;return R.plan}
function wpickR(l,Rn){let s=0;for(const x of l)s+=x[1];let r=Rn()*s;for(const x of l){r-=x[1];if(r<=0)return x[0]}return l[0][0]}

// copy the plan into the world as chunks come into view
const _owIslandR=owIsland;owIsland=function(m,cx,cy){_owIslandR(m,cx,cy);rgFill(m,cx,cy)};
function rgFill(m,cx,cy){const key='rg'+cx+','+cy;if(m.gen.has(key))return;m.gen.add(key);const R=rgInit();
  if(cx===R.gcx&&cy===R.gcy||rgChunk(cx,cy))rgCause(m);if(!rgChunk(cx,cy))return;const pl=rgPlan(),open=G.owBoss&&G.owBoss.rgk;
  for(let j=cy*CH;j<cy*CH+CH;j++)for(let i=cx*CH;i<cx*CH+CH;i++){const[p,q]=rgL(i,j),k=pl.ix(p,q);if(k<0||!pl.T[k])continue;const w=j*m.w+i;
    let t=pl.T[k];if(open&&R.gate.includes(k))t=1;m.t[w]=t;m.under[w]=pl.U[k]}}
// the causeway: a stone bridge from the dead-gate island to the city gate
function rgCause(m){if(m.gen.has('rgc'))return;m.gen.add('rgc');const R=rgInit();_owIslandR(m,R.gcx,R.gcy);const I=islandOf(R.gcx,R.gcy),[gp,gq]=rgL(Math.floor(I.x),Math.floor(I.y)),W=m.w,t=m.t;
  const cells=[],par=[];for(let q=Math.min(gq,0)-1;q<=Math.max(gq,0)+1;q++)for(let p=gp-1;p<=gp+1;p++)cells.push([p,q]);for(let p=gp-1;p<=-5;p++)for(let q=-1;q<=1;q++)cells.push([p,q]);
  for(const[p,q]of cells){const[i,j]=rgW(p,q),k=j*W+i;if(!t[k]){t[k]=8;m.under[k]=0}}
  for(const[p,q]of cells)for(const[dp,dq]of[[1,0],[-1,0],[0,1],[0,-1]]){if(p+dp>-5)continue;const[i,j]=rgW(p+dp,q+dq),k=j*W+i;if(t[k])continue;t[k]=9;m.under[k]=8;const ck=Math.floor(i/CH)+','+Math.floor(j/CH);if(!m.bblocks.has(ck))m.bblocks.set(ck,[]);m.bblocks.get(ck).push({i,j,k:'parapet',v:hsh(i,j,11)<.2?2:hsh(i,j,12)<.5?0:1})}}
// region content joins the island content of the same chunk
const _owContentR=owContent;owContent=function(m,cx,cy){const c=_owContentR(m,cx,cy),R=rgInit();
  if(cx===R.gcx&&cy===R.gcy){const I=islandOf(cx,cy);c.lvl=rgLvl();const at=(dx,dy)=>[Math.floor(I.x)+dx+.5,Math.floor(I.y)+dy+.5];
    {const[x,y]=at(-3,-3);c.objs.push({type:'shrine',ow:true,key:cx+','+cy,name:'Leuchtfeuer am Totentor',x,y})}
    {const[x,y]=at(3,-3);c.objs.push({type:'rgsign',name:'Ein verwitterter Wegstein',x,y})}
    for(let k=0;k<10;k++){const a=k/10*6.283,x=Math.floor(I.x+Math.cos(a)*7),y=Math.floor(I.y+Math.sin(a)*7);if(m.t[y*m.w+x]===4&&k%3){m.under[y*m.w+x]=4;m.t[y*m.w+x]=9;c.blocks.push({i:x,j:y,k:'grave',v:k%3})}}
    for(let k=0;k<14;k++)c.deco.push({k:pick(['bones','skull','tuft','moss']),x:I.x+rnd(-8,8),y:I.y+rnd(-8,8),v:rint(0,3)});
    for(let k=0;k<4;k++){const[x,y]=at(rint(-5,5),rint(2,6));c.spawn.push({vid:pick(['rg_bauer','rg_buerger','rg_bleich']),x,y,rank:'normal',rgz:'gate'})}}
  if(!rgChunk(cx,cy))return c;rgPlan();const b=R.bk.get(cx+','+cy);
  {const[p]=rgL(cx*CH+16,cy*CH+16);c.lvl=rgLvl()+(p<136?0:p<184?2:p<243?3:p<436?6:9)}
  if(!b)return c;c.objs.push(...b.objs);c.props.push(...b.props);c.deco.push(...b.deco);c.blocks.push(...b.blocks);c.spawn.push(...b.spawn.map(s=>({...s})));if(b.rgBoss)c.rgBoss=b.rgBoss;return c};
const _owSpawnR=owSpawn;owSpawn=function(m,key){_owSpawnR(m,key);const c=m.cdata.get(key);if(!c)return;
  if(c.spawn.length&&!G.owClear.has(key))for(const e of m.enemies)if(e.ck===key&&!e.rgz){const s=c.spawn.find(s=>Math.abs(s.x-e.x)<.01&&Math.abs(s.y-e.y)<.01);if(s&&s.rgz)e.rgz=s.rgz}
  if(c.rgBoss&&!G.owBoss.rgk&&!m.enemies.some(e=>e.rgk)){const prev=G.mlvl;G.mlvl=c.lvl+2;const e=makeRgBoss(c.rgBoss.x,c.rgBoss.y);G.mlvl=prev;e.ck=key;m.enemies.push(e)}};

