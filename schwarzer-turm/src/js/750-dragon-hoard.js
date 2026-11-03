/* ---------- the dragon hoard: once Vyrthrax has fallen his treasure lies open, guarded by eggs, with dragon-scale armour in it ---------- */
const DRAGB=[['helm','Drachenschuppenhelm',40,38],['armor','Drachenschuppenpanzer',40,95],['gloves','Drachenklauen',40,30],['boots','Drachenschuppenstiefel',40,30],['belt','Drachengurt',40,24],['offhand','Drachenschild',40,70]];
const DRIMP={helm:{life:40,res:12},armor:{life:80,res:18,dmgred:6},gloves:{life:30,res:10,ias:6},boots:{life:30,res:10,frw:12},belt:{life:45,res:10},offhand:{life:50,res:15,block:4}};
const DRN={};
function addDragonArms(){for(const[slot,n,lvl,def]of DRAGB){const src=Object.values(BASE).filter(b=>b.slot===slot&&!b.mage&&!b.shape&&!b.dual&&PXS[b.n]&&b.lvl<=45).sort((a,b)=>b.lvl-a.lvl)[0];if(!src)continue;
    const B=Object.assign({},src,{n,lvl,def,str:Math.round((src.str||0)*1.1),dex:src.dex||0,drg:1,shape:src.shape||src.n});BASE[n]=B;DRN[slot]=n;
    PXS[n]=[PXS[src.n][0],'blood','gold','ember','ruby'];if(ISZ[src.n])ISZ[n]=ISZ[src.n];if(HELMT[src.n])HELMT[n]=HELMT[src.n]}}
const _expandItemsDr=expandItems;expandItems=function(){_expandItemsDr();addDragonArms()};
// the scale pieces never drop by chance: they come only from the hoard and, seldom, from a dragon
const _makeItemDr=makeItem;makeItem=function(ilvl,o={}){const kept=[];for(const n of Object.values(DRN)){kept.push(BASE[n]);delete BASE[n]}try{return _makeItemDr(ilvl,o)}finally{for(const b of kept)BASE[b.n]=b}};
function mkDragon(slot,ilvl,rar){const it=makeItem(ilvl,{slot,rarity:rar||'rare',boost:.3}),n=DRN[slot];if(!n||it.rar==='unique')return it;const B=BASE[n],old=BASE[it.b];
  it.b=n;it.cls=B.cls;it.def=Math.round(B.def*rnd(.95,1.15));if(B.block)it.block=B.block;it.req={lvl:Math.max(B.lvl,it.req.lvl),str:B.str||0,dex:B.dex||0};
  if(old&&it.name&&it.name.includes(old.n))it.name=it.name.replace(old.n,n);else if(it.rar==='normal')it.name=n;
  for(const[k,v]of Object.entries(DRIMP[slot]))it.mods[k]=(it.mods[k]||0)+v;it.drg=1;return it}
const _killEnemyDr=killEnemy;killEnemy=function(e,a){const was=e&&!e.dead&&e.type==='dragon';_killEnemyDr(e,a);if(was&&e.dead&&Math.random()<(e.rank==='unique'?.35:e.rank==='champ'?.15:.05))dropItem(mkDragon(pick(DRAGB)[0],G.mlvl+2),e.x,e.y)};
const wb8C=()=>{for(const[k,v]of wbChunks())if(WB[v]&&WB[v].id==='wb8'){const[cx,cy]=k.split(',').map(Number);return islandOf(cx,cy)}return null};
function hoardTick(){const m=G.map;if(!m||!m.world||!P||!(G.owBoss&&G.owBoss.wb8))return;const I=wb8C();if(!I||hyp(P.x-I.x,P.y-I.y)>40)return;
  const c=m.cdata.get(I.cx+','+I.cy);if(!c)return;
  if(!c.hoard){c.hoard=1;const at=(dx,dy)=>nearWalk(I.x+dx,I.y+dy);const[hx,hy]=at(0,-4.5);c.objs.push({type:'hoard',x:hx,y:hy,open:!!(P.hoard&&P.hoard[diff()])});
    for(const[dx,dy]of[[-3.2,-2.6],[3.4,-2.2],[-1.6,-6.8],[2.2,-6.6]]){const[x,y]=at(dx,dy);c.objs.push({type:'dcgold',x,y,v:Math.random()})}
    for(const[dx,dy]of[[-4.6,-5.2],[4.8,-5],[0,-8.4]]){const[x,y]=at(dx,dy);c.objs.push({type:'egg',x,y,ph:Math.random()*6})}m.ac=null;owTick()}
  for(const o of c.objs.slice())if(o.type==='egg'&&hyp(o.x-P.x,o.y-P.y)<2.6){c.objs.splice(c.objs.indexOf(o),1);m.objs=m.objs.filter(q=>q!==o);const e=makeEnemy('jungdrache',o.x,o.y,'champ');e.aggro=true;e.ev=true;m.enemies.push(e);
    for(let k=0;k<14;k++)fxp({k:'bone',x:o.x,y:o.y,z:.4,vx:rnd(-2,2),vy:rnd(-2,2),vz:rnd(1,3),life:rnd(.8,1.4),col:pick(['#e8d8b0','#c8a868','#ff9a3a']),s:rnd(1.5,2.5),g:6,rot:0,vr:rnd(-8,8)});sample('bossscr2',.5,{rate:1.5});log('Ein Ei bricht auf. Ein junger Drache schlüpft!','#ff9a3a')}}
const _interactDr=interact;interact=function(o){if(o&&o.type==='hoard'){if(o.open||(P.hoard&&P.hoard[diff()])){log('Der Hort ist geplündert. Auf einer höheren Schwierigkeit füllt er sich neu.','#a39b88');return}
    if(G.map.enemies.some(e=>!e.dead&&e.type==='dragon'&&hyp(e.x-o.x,e.y-o.y)<8)){log('Die Jungdrachen bewachen den Hort noch.','#ff9a3a');return}
    o.open=true;P.hoard=P.hoard||{};P.hoard[diff()]=1;const ml=G.mlvl+3;for(const s of['armor',pick(['helm','gloves','boots','belt','offhand'])])dropItem(mkDragon(s,ml,'rare'),o.x,o.y);dropItem(mkDragon(pick(['helm','gloves','boots','belt','offhand']),ml,'magic'),o.x,o.y);
    dropItem(makeItem(ml,{rarity:'unique'}),o.x,o.y);const gl=400*G.mlvl;P.glut+=gl;ftext(o.x,o.y-.5,'+'+gl+' Glut','#ffd040',true);for(let k=0;k<40;k++)fxp({k:'ember',x:o.x,y:o.y,z:.6,vx:rnd(-2.5,2.5),vy:rnd(-2.5,2.5),vz:rnd(2,5),life:rnd(.8,1.6),col:pick(['#ffd040','#fff0a0','#ffa020']),s:rnd(1.5,3),g:5});
    banner('DER HORT DES VYRTHRAX','Drachenschuppen und Gold','boss',3200);sample('chest',.9,{rate:.8});sample('picku',.8);G.shake=4;save();return}
  return _interactDr(o)};
function drawHoard(o){const[sx,sy]=iso(o.x,o.y);if(sx<-90||sx>W+90||sy<-90||sy>H+60)return;const t=G.t,R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(sx+x),Math.round(sy+y),w,h)};
  if(o.type==='dcgold'){const n=5+Math.floor(o.v*4);ctx.fillStyle='#6a4a10';ctx.beginPath();ctx.ellipse(sx,sy-2,16,6,0,0,7);ctx.fill();ctx.fillStyle='#c89a20';ctx.beginPath();ctx.ellipse(sx,sy-4,13,5,0,0,7);ctx.fill();
    for(let k=0;k<n;k++){const x=((k*37+o.v*99)%24)-12,y=-5-((k*13)%6);R(x,y,3,2,k%3?'#ffd040':'#fff0a0')}if(Math.sin(t*3+o.v*9)>.92)R(-2,-9,1,3,'#fff');return}
  if(o.type==='egg'){shadow(sx,sy,.2);const w=Math.sin(t*2+o.ph)*.06;ctx.save();ctx.translate(sx,sy-9);ctx.rotate(w);ctx.fillStyle='#4a1a10';ctx.beginPath();ctx.ellipse(0,0,7,10,0,0,7);ctx.fill();ctx.fillStyle='#8a2a18';ctx.beginPath();ctx.ellipse(-1,-1,5.6,8.6,0,0,7);ctx.fill();
    ctx.fillStyle='#c8541c';for(let k=0;k<5;k++)ctx.fillRect(-4+k*2,-6+(k%2)*5,2,2);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,140,40,${.15+Math.sin(t*3+o.ph)*.1})`;ctx.beginPath();ctx.ellipse(0,0,8,11,0,0,7);ctx.fill();ctx.restore();return}
  // the hoard: a mound of gold around an iron-bound chest, open once plundered
  ctx.fillStyle='#5a3a0c';ctx.beginPath();ctx.ellipse(sx,sy,46,17,0,0,7);ctx.fill();ctx.fillStyle='#a8781a';ctx.beginPath();ctx.ellipse(sx,sy-3,40,14,0,0,7);ctx.fill();ctx.fillStyle='#d8a828';ctx.beginPath();ctx.ellipse(sx,sy-6,30,10,0,0,7);ctx.fill();
  for(let k=0;k<26;k++){const a=k*2.4,r=8+(k*7)%28;R(Math.cos(a)*r,-6+Math.sin(a)*r*.33,3,2,k%4?'#ffd040':'#fff0a0')}
  R(-16,-30,32,20,'#3a2210');R(-15,-29,30,18,'#6a3a18');R(-15,-29,30,3,'#8a5428');R(-16,-22,32,3,'#2a2a30');R(-2,-24,4,6,'#c8a040');
  if(o.open){R(-16,-40,32,10,'#4a2a12');R(-14,-38,28,6,'#2a1a0a')}else{R(-16,-36,32,7,'#5a3218');R(-16,-36,32,2,'#8a5428')}
  R(-12,-29,2,18,'#2a2a30');R(10,-29,2,18,'#2a2a30');
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy-20,0,sx,sy-20,o.open?40:70);g.addColorStop(0,`rgba(255,200,80,${o.open?.12:.3+Math.sin(t*2)*.08})`);g.addColorStop(1,'rgba(255,140,30,0)');ctx.fillStyle=g;ctx.fillRect(sx-70,sy-90,140,120);ctx.restore();
  if(Math.sin(t*5)>.85)R(-20+((t*37)%40),-12,1,3,'#fff');
  if(hyp(o.x-P.x,o.y-P.y)<7)label(sx,sy-52,o.open?'Der Hort · geplündert':'Der Hort des Vyrthrax','#ffd040')}
const _drawObjDr=drawObj;drawObj=function(o){if(o.type==='hoard'||o.type==='egg'||o.type==='dcgold')return drawHoard(o);return _drawObjDr(o)};
const _updForgeW5=updForge;updForge=function(dt){_updForgeW5(dt);if(P&&G.state==='play'){nightTick(dt);peddlerTick(dt);hoardTick();statTick()}};

