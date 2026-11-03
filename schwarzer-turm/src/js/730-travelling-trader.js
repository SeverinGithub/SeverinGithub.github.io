/* ---------- a travelling trader: now and then, out on the islands, someone with rare goods stops for a few minutes ---------- */
const PDL={t:rnd(240,420)};
const PDLN=['Ysolde die Fahrende','Meister Quarz','Hagen Wanderbart','Die Schwarze Elke','Bruder Ansgar','Lorwin Silberzunge'];
function peddlerTick(dt){const m=G.map;if(!m||!m.world||!P||G.state!=='play')return;
  const o=PDL.o;if(o){o.left-=dt;if(o.left<=0&&hyp(o.x-P.x,o.y-P.y)>9){const c=m.cdata.get(PDL.ck);if(c)c.objs=c.objs.filter(q=>q!==o);m.objs=m.objs.filter(q=>q!==o);PDL.o=null;smoke(o.x,o.y,8,'rgba(150,138,118,',6,.5);if(hyp(o.x-P.x,o.y-P.y)<30)log(o.name+' ist weitergezogen.','#a39b88')}return}
  const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),I=islandOf(cx,cy);if(!I||I.kind==='home'||I.kind==='boss'||G.ev)return;
  if((PDL.t-=dt)>0)return;PDL.t=rnd(420,720);if(Math.random()>.6)return;const s=evSpot(5,7);if(!s)return;
  const lv=Math.max(P.lvl,G.mlvl),R0=R;R=mulberry(Math.floor(Math.random()*1e9));const stock=[];
  try{for(let k=0;k<3;k++)stock.push(makeItem(lv+2,{rarity:'unique'}));for(let k=0;k<3;k++)stock.push(makeItem(lv+2,{rarity:'rare',boost:.3}))}finally{R=R0}
  for(const it of stock)it.ped=1;
  const n=pick(PDLN),p={type:'merchant',peddler:true,x:s[0],y:s[1],name:n,quote:'„Seltene Ware, Wanderer. Ich bleibe nicht lange.“',lvl:lv,stock,left:300},ck=cx+','+cy,c=m.cdata.get(ck);if(c)c.objs.push(p);m.objs.push(p);PDL.o=p;PDL.ck=ck;
  banner('EIN FAHRENDER HÄNDLER',n+' bietet Einzigartiges an · nur für kurze Zeit','',3000);sample('region',.6,{rate:1.08});log(n+' ist in deiner Nähe eingetroffen. Seltene Ware, für etwa fünf Minuten.','#ffd88a')}
const _drawObjPd=drawObj;drawObj=function(o){_drawObjPd(o);if(o.peddler){const[sx,sy]=iso(o.x,o.y);const m=Math.floor(o.left/60),s=Math.floor(o.left%60);
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy-30,0,sx,sy-30,40);g.addColorStop(0,`rgba(255,200,90,${.18+Math.sin(G.t*3)*.06})`);g.addColorStop(1,'rgba(255,160,40,0)');ctx.fillStyle=g;ctx.fillRect(sx-42,sy-72,84,84);ctx.restore();
  if(o.left>0&&hyp(o.x-P.x,o.y-P.y)<9)label(sx,sy-74,'Fahrender Händler · noch '+m+':'+String(s).padStart(2,'0'),'#ffd88a')}};

