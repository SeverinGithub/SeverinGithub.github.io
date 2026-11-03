/* ---------- combat ---------- */
function hurtPlayer(dmg,elem,src){
  if(P.dead||P.iframe>0||P.dash)return false;
  if(!elem&&P.d.block>0&&Math.random()*100<P.d.block){ftext(P.x,P.y,'Geblockt','#c8c2b0');sfx('hit');const a=src?Math.atan2(src.y-P.y,src.x-P.x):0;sparks(P.x+Math.cos(a)*.3,P.y+Math.sin(a)*.3,.8,a+Math.PI,12,['#ffffff','#fff0a8','#ffc070'],6);flash(P.x,P.y,.8,24,'255,240,200',.12);hitstop(.05);kick(a+Math.PI,2);return false}
  if(elem)dmg*=1-P.d.res/100;else dmg*=1-P.d.def/(P.d.def+45+G.mlvl*14);
  dmg=Math.max(1,dmg-(P.d.dmgred||0));if(!elem&&src&&src.hp!=null&&!src.dead&&P.d.thorns)hitEnemy(src,P.d.thorns,{col:'#a6e08a',thorns:1});
  if(P.ward>0){const a=Math.min(P.ward,dmg);P.ward-=a;dmg-=a;if(dmg<=0){ftext(P.x,P.y,'absorbiert','#e8e2d0');return true}}
  P.hp-=dmg;P.hurt=.2;G.shake=Math.max(G.shake,Math.min(10,3+dmg/P.d.life*30));if(CFG.numbers)ftext(P.x,P.y,Math.round(dmg),'#ff5040');sfx('hurt');
  {const a=src?Math.atan2(P.y-src.y,P.x-src.x):rnd(0,6.28);gore(P.x,P.y,a,9,GORE.blood,.8);kick(a,3.5);flash(P.x,P.y,.8,26,'255,60,40',.15);if(dmg>P.d.life*.08)hitstop(.07);if(Math.random()<.5)decal('drop',P.x,P.y,.8,25)}
  if(elem==='frost')P.chill=1.5;if(elem==='poison'){P.poisonT=3.5;P.poisonD=Math.max(P.poisonT>0?P.poisonD||0:0,dmg*.3);if(CFG.numbers)ftext(P.x,P.y-.3,'Vergiftet','#9ae050')}
  if(P.hp<=0)die();return true}
function die(){
  P.dead=true;P.hp=0;G.deathT=3.6;sfx('death');G.stepS=stopLoop(G.stepS);G.heartS=stopLoop(G.heartS);banner('DU BIST GEFALLEN',P.glut>0?`${P.glut} Glut bleibt hier zurück`:'','death',3400);
  if(P.glut>0){G.glutmal={floor:G.floor,x:P.x,y:P.y,amt:P.glut};P.glut=0}else if(G.glutmal&&G.glutmal.floor!==G.floor){/* old ember stays */}
  P.path=[];P.target=null}
// the guardian statue: every touch calls three random foes into the arena, matched to your level
function summonArena(o){const m=G.map,A=m.arena;if(!A)return;const alive=m.enemies.filter(e=>!e.dead&&e.arena).length;
  if((G.maxFloor||0)<20){log('Die Statue schläft. Sie erwacht erst, wenn du Ebene 20 des Turms erreicht hast.','#a39b88');return}
  if(alive>=12){log('Die Statue schweigt. Besiege zuerst, was in der Arena steht.','#a39b88');return}if(G.t<(G.sumT||0))return;G.sumT=G.t+1.2;
  G.mlvl=Math.max(1,P.lvl);const VP=varPool(Math.max(1,Math.floor(P.lvl/2)+1));m.enemies=m.enemies.filter(e=>!e.dead||e.dieT<20);
  for(let k=0;k<3;k++){let x=A.x,y=A.y;for(let tr=0;tr<20;tr++){const a=rnd(0,6.28),r=rnd(2.5,6.5);x=A.x+Math.cos(a)*r;y=A.y+Math.sin(a)*r;if(free(x,y,.5))break}
    const roll=Math.random(),e=makeEnemy(wpick(VP),x,y,roll<.08?'unique':roll<.22?'champ':'normal');e.aggro=true;e.arena=true;e.cd=rnd(.6,1.4);m.enemies.push(e);
    smoke(x,y,10,'rgba(60,40,70,',8,.6);flash(x,y,.8,40,'200,120,255',.3);shock(x,y,1.4,'200,150,255',.45,3);gore(x,y,0,10,GORE.rock,.2);voice(e)}
  G.statueT=1.6;G.shake=Math.max(G.shake,6);hitstop(.08);sfx('boom');sample('portal',.5,{rate:.7});log(`Der Wächter ruft drei Gegner herbei · Stufe ${G.mlvl}`,'#e8c878')}
function respawn(){
  const df=G.floor;if(G.maps[df]&&df>0)populate(G.maps[df]);
  recalc();P.flasks=fMax();enterFloor(G.respawnFloor);P.hp=P.d.life;P.mp=P.d.mana;P.st=P.d.stam;
  if(G.map.kind==='dungeon'&&df!==G.floor)populate(G.map);
  if(G.floor===0){G.map.enemies=[];if(G.owRespawn){const[x,y]=nearWalk(G.owRespawn.x+1,G.owRespawn.y+1);P.x=x;P.y=y;camX=x;camY=y}G.map.ac=null;owRestart()}
  log('Du erwachst am Leuchtfeuer.','#ffd88a')}
function hitEnemy(e,dmg,o={}){
  if(e.dead)return;if(!o.ally&&dmg>0){if(P.cryT>0)dmg*=1+P.cryB/100;if(P.venomT>0){e.dotT=3;e.dotD=Math.max(e.dotD||0,dmg*P.venomB/300)}}dmg*=e.dmgTaken;e.hp-=dmg;e.flash=.1;e.hitT=.22;e.aggro=true;if(e.pack)for(const p of e.pack)p.aggro=true;
  if(CFG.numbers)ftext(e.x,e.y,Math.round(dmg)+(o.crit?'!':''),o.crit?'#ffd94f':o.col||'#f2ecd8',o.crit);
  if(o.slow)e.slow=Math.max(e.slow,o.slow);
  const a=o.from!=null?o.from:Math.atan2(e.y-P.y,e.x-P.x);
  if(o.kb&&!e.boss){const k=o.kb*16/(e.scale||1);e.kvx=(e.kvx||0)+Math.cos(a)*k;e.kvy=(e.kvy||0)+Math.sin(a)*k}
  gore(e.x,e.y,a,o.crit?11:5,goreOf(e),.8*(e.scale||1));
  if(e.hp<=0)killEnemy(e,a)}
function weaponHit(e,mult=1){
  const d=P.d;let dmg=rnd(d.dmin,d.dmax)*mult+d.ele;const crit=Math.random()*100<d.crit+(P.shadowT>0?P.shadowB:0);if(crit)dmg*=1.9;
  const a=Math.atan2(e.y-P.y,e.x-P.x),hx=e.x-Math.cos(a)*e.r*.6,hy=e.y-Math.sin(a)*e.r*.6,z=.8*(e.scale||1);
  sparks(hx,hy,z,a,crit?16:8,d.ele>0?(d.cold>0?['#ffffff','#c8e4ff','#6ad0ff']:['#ffffff','#ffc070','#ff9a30']):['#ffffff','#fff0c0','#ffc070'],crit?8:6);
  flash(hx,hy,z,crit?40:22,crit?'255,220,120':'255,235,200',crit?.18:.11);hitstop(crit?.1:.05);kick(a,crit?4.5:2.2);if(crit)G.shake=Math.max(G.shake,4);
  hitEnemy(e,dmg,{crit,slow:d.cold>0?1.2:0,kb:.28,from:a});
  if(d.ls>0&&!e.dead){P.hp=Math.min(d.life,P.hp+dmg*d.ls/100)}else if(d.ls>0)P.hp=Math.min(d.life,P.hp+dmg*d.ls/100)}
function killEnemy(e,a){
  e.dead=true;e.dieT=0;qInc('k_'+e.type);qInc('kill');if(e.arena)qInc('arena');if(P.d.lok)P.hp=Math.min(P.d.life,P.hp+P.d.lok);if(P.d.mok)P.mp=Math.min(P.d.mana,P.mp+P.d.mok);e.fallA=a??Math.atan2(e.y-P.y,e.x-P.x);e.kvx=e.kvy=0;sfx('hit');{const g=goreOf(e),sc=e.scale||1;gore(e.x,e.y,e.fallA,e.boss?40:16,g,.9*sc);
    if(g.k==='blood')decal(g===GORE.ichor?'ichor':'blood',e.x+Math.cos(e.fallA)*.3,e.y+Math.sin(e.fallA)*.3,sc*(e.boss?1.8:1),60);if(g.k==='rock')smoke(e.x,e.y,9,'rgba(90,78,62,',8,.5);if(g.k==='mote'){flash(e.x,e.y,1,34,'190,220,255',.4);for(let k=0;k<20;k++)fxp({k:'mote',x:e.x+rnd(-.3,.3),y:e.y+rnd(-.3,.3),z:rnd(.2,1.2),vz:rnd(.8,2),life:rnd(.6,1.2),col:pick(GORE.mote.cols),s:rnd(1,2),g:-.5})}
    hitstop(e.boss?.45:.06);if(e.boss){boom(e.x,e.y,2.4,'fire');shock(e.x,e.y,5,'255,220,160',.9,5);addLight(e.x,e.y,420,1,1.2)}}
  const xp=Math.round(e.xp);gainXp(xp);
  const gl=Math.round((3+(e.ml||G.mlvl)*1.6)*rnd(.8,1.25)*(e.rank==='boss'?25:e.rank==='unique'?6:e.rank==='champ'?2.5:1)*(1+(P.d.glutf||0)/100));
  if(!e.arena){P.glut+=gl;ftext(e.x,e.y-.3,'+'+gl+' Glut','#ff9a3a')}
  if(e.aff.includes('feuer'))G.tele.push({shape:'circle',x:e.x,y:e.y,r:1.8,t:0,dur:.6,dmg:e.dmg[1]*1.2,elem:'fire',owner:null});
  const eml=e.ml||G.mlvl,ilvl=eml+(e.rank==='boss'?3:e.rank==='unique'?2:e.rank==='champ'?1:0),mf=P.d.mf;
  let n=0,boost=0,nj=0;
  if(e.rank==='boss'){n=2;boost=.6;nj=rint(3,5)}else if(e.rank==='unique'){n=rint(1,2);boost=.3;nj=rint(2,3)}else if(e.rank==='champ'){n=Math.random()<.3?1:0;boost=.12;nj=rint(1,2)}else{n=Math.random()<.045?1:0;nj=Math.random()<.42?1:0}
  if(e.arena)n=nj=0; // the statue's summons give xp, never loot or glut
  for(let k=0;k<n;k++)dropItem(makeItem(ilvl,{mf,boost,rarity:e.rank==='boss'&&k<1?(Math.random()<.06?'unique':Math.random()<.4?'rare':'magic'):undefined}),e.x,e.y);
  for(let k=0;k<nj;k++)dropItem(junkFor(e),e.x,e.y);
  if(!e.arena&&Math.random()<1e-4){dropItem(makeItem(ilvl+22,{rarity:'unique',mf}),e.x,e.y);banner('EIN WUNDER','Das Schicksal lächelt dir zu','boss',3600)}
  if(!e.arena&&Math.random()<(e.rank==='normal'?.06:.35))dropItem(makePotion(Math.random()<.65?'life':'mana',G.floor),e.x,e.y);
  if(e.ck&&G.map.world&&!G.map.enemies.some(o=>o.ck===e.ck&&!o.dead)){G.owClear.add(e.ck);log('Gebiet befreit. Es bleibt ruhig, bis du an einem Leuchtfeuer rastest.','#a39b88')}
  if(e.wb){if(!G.owBoss[e.wb]){G.owBoss[e.wb]=1;P.tbonus=(P.tbonus||0)+2;log('+2 Talentpunkte (P)','#e8c878')}banner('FEIND BEZWUNGEN',e.name,'boss',4200);sfx('unique');G.shake=14;save();return}
  if(e.boss&&!G.bossDead[G.floor]){P.tbonus=(P.tbonus||0)+2;log('+2 Talentpunkte (P)','#e8c878')}
  if(e.boss){G.bossDead[G.floor]=true;const r=G.map.endRoom;G.map.objs.push({type:'stairs',x:r.cx+.5,y:r.cy+.5});banner('FEIND BEZWUNGEN',e.name,'boss',4200);sfx('unique');G.shake=14;save()}}
function gainXp(x){x=Math.round(x*(1+((P.d&&P.d.xp)||0)/100));P.xp+=x;while(P.xp>=xpNext(P.lvl)){P.xp-=xpNext(P.lvl);P.lvl++;P.pts+=5;P.spts+=1;recalc();P.hp=P.d.life;P.mp=P.d.mana;banner('Stufe '+P.lvl,'5 Attributpunkte · 1 Fertigkeitspunkt','',2200);sfx('lvl');burst(P.x,P.y,'#ffe08a',30,3);updatePanels()}}
function dropItem(it,x,y){
  const m=G.map;for(let k=0;k<12;k++){const a=Math.random()*7,r=Math.random()*1.1,nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(walkable(nx,ny)){x=nx;y=ny;break}}
  m.items.push({item:it,x,y,t:0});if(it.rar==='unique'){sfx('unique');log('Einzigartig: '+it.name,'var(--r-unique)')}}
function startAttack(ang){
  if(P.st<=0)return false;P.veilT=0;P.face=ang;P.atkDur=1/P.d.aspd;P.atkT=P.atkDur;P.hitDone=false;P.st-=8;P.stDelay=.7;if(isRangedW(P.eq.weapon)&&P.d.okS.has(P.eq.weapon))sfx('draw');else sample('sword',.55)||sfx('swing');return true}
function resolveSwing(){
  const reach=P.d.reach+.35;let any=false;
  for(const e of G.map.enemies){if(e.dead)continue;const d=hyp(e.x-P.x,e.y-P.y);if(d>reach+e.r)continue;if(Math.abs(angDiff(Math.atan2(e.y-P.y,e.x-P.x),P.face))>1.05&&d>e.r+.2)continue;weaponHit(e);any=true}
  if(any)G.shake=Math.max(G.shake,2)}
function castSkill(id,tx,ty){
  if(P.dead||P.roll>0||P.dash||P.leap||P.cast>0||P.atkT>0)return;
  const s=SKBY[id],l=skLvl(id);if(l<=0){log(s.n+' ist noch nicht erlernt (K).','#a39b88');return}
  if((P.cds[id]||0)>0)return;const cost=Math.max(1,Math.round(s.mana(l)*(1-P.d.mcost/100)));if(P.mp<cost){log('Nicht genug Mana.','#7aa4ff');return}
  if(id!=='dash')P.veilT=0;P.mp-=cost;P.cds[id]=s.cd*(1-P.d.cdr/100);P.sel=id;const ang=Math.atan2(ty-P.y,tx-P.x);P.face=ang;P.cast=.28;P.path=[];P.target=null;sfx('cast');
  if(!['whirl','fire','nova','charge','ward','chain'].includes(id)){castExt(id,l,ang,tx,ty);return}
  if(id==='whirl'){P.cast=.35;P.whirl=.35;for(let k=0;k<4;k++)slashFx(P.x,P.y,ang+k*1.571,2.4,1.9,'235,225,205',.3,.6,.5);smoke(P.x,P.y,5,'rgba(90,78,62,',6,.2);for(const e of G.map.enemies){if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<1.9+e.r)weaponHit(e,1.1+l*.15)}G.rings.push({x:P.x,y:P.y,r:.4,max:2,v:10,col:'#e8e2d0',hit:new Set(),dmg:0})}
  if(id==='fire'){const sp=10;sample('fire',.6);flash(P.x+Math.cos(ang)*.5,P.y+Math.sin(ang)*.5,.8,22,'255,180,80',.16);G.proj.push({x:P.x+Math.cos(ang)*.4,y:P.y+Math.sin(ang)*.4,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,owner:'p',dmg:spellBase('fire',l),kind:'glut',r:.3,life:1.4,aoe:1.4})}
  if(id==='nova'){for(let k=0;k<40;k++){const a=k/40*6.283;fxp({k:'shard',x:P.x,y:P.y,z:.3+rnd(0,.4),vx:Math.cos(a)*9,vy:Math.sin(a)*9,vz:rnd(0,1),life:.5,col:pick(['#ffffff','#e0fff8','#a8d0ff','#6ad0ff']),s:rnd(2,3.5),rot:a,g:1})}shock(P.x,P.y,4.6,'170,220,255',.5,4);flash(P.x,P.y,.6,50,'170,220,255',.25);decal('frost',P.x,P.y,1.6,20);addLight(P.x,P.y,300,.9,.5);G.rings.push({x:P.x,y:P.y,r:.3,max:4.6,v:9,col:'#bfe2ff',hit:new Set(),dmg:spellBase('nova',l),slow:2.5})}
  if(id==='charge'){let d=Math.min(6,hyp(tx-P.x,ty-P.y));P.dash={ang,left:Math.max(1,d),l};P.cast=0}
  if(id==='ward'){P.ward=spellBase('ward',l);P.wardMax=P.ward;P.wardT=15;for(let k=0;k<22;k++){const a=rnd(0,6.28),r=rnd(1.2,2);fxp({k:'bone',x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r,z:rnd(.3,1.2),vx:-Math.cos(a)*r*3,vy:-Math.sin(a)*r*3,vz:0,life:.33,col:pick(GORE.bone.cols),s:rnd(1.4,2.4),g:0,rot:a,vr:8})}flash(P.x,P.y,.8,40,'236,228,200',.3)}
  if(id==='chain'){
    let first=null,bd=3.2;for(const e of G.map.enemies){if(e.dead)continue;const d=hyp(e.x-tx,e.y-ty);if(d<bd&&hyp(e.x-P.x,e.y-P.y)<10&&los(P.x,P.y,e.x,e.y)){bd=d;first=e}}
    if(!first){for(const e of G.map.enemies){if(e.dead)continue;const d=hyp(e.x-P.x,e.y-P.y);if(d<7&&d<bd+4&&los(P.x,P.y,e.x,e.y)){first=e;break}}}
    let from={x:P.x,y:P.y},cur=first;const hit=new Set(),n=3+Math.floor(l/3),dmg=spellBase('chain',l);
    if(!cur){G.bolts.push({a:[P.x,P.y],b:[P.x+Math.cos(ang)*4,P.y+Math.sin(ang)*4],t:.2})}
    for(let k=0;k<n&&cur;k++){G.bolts.push({a:[from.x,from.y],b:[cur.x,cur.y],t:.25});hit.add(cur);flash(cur.x,cur.y,.7,30,'180,210,255',.2);sparks(cur.x,cur.y,.7,0,10,['#ffffff','#cfe0ff','#7aa4ff'],6,3.2);addLight(cur.x,cur.y,180,.9,.25);hitEnemy(cur,dmg*rnd(.8,1.2),{col:'#cfe0ff'});from=cur;let nx=null,nd=4.5;for(const e of G.map.enemies){if(e.dead||hit.has(e))continue;const d=hyp(e.x-from.x,e.y-from.y);if(d<nd){nd=d;nx=e}}cur=nx}
    sfx('zap')}
}
function doRoll(){
  if(P.dead||P.roll>0||P.dash||P.st<12)return;
  const[wx,wy]=scr2w(mouse.x,mouse.y);let a=Math.atan2(wy-P.y,wx-P.x);if(hyp(wx-P.x,wy-P.y)<.2)a=P.face;
  P.rollN=(P.rollN||0)+1;P.rollFlip=P.rollN>=6||(P.rollN>=4&&Math.random()<.4);if(P.rollFlip)P.rollN=0;P.roll=.38;P.iframe=.3;P.rollA=a;P.face=a;smoke(P.x,P.y,4,'rgba(90,78,62,',5,.3);P.st-=22;P.stDelay=.8;P.atkT=0;P.cast=0;P.path=[];sfx('roll')}
function drinkFlask(){
  if(P.dead||P.flasks<=0||P.flaskT>0){if(P.flasks<=0)log('Der Flakon ist leer. Raste an einem Leuchtfeuer.','#a39b88');return}
  P.flasks--;P.flaskT=.5;P.poisonT=0;sample('potion',.7);P.heal=P.d.life*(.45+P.flaskPow*.08+P.d.flaskH/100);burst(P.x,P.y,'#ffcf6a',14,1.5)}
function quickPotion(kind='life'){const i=P.inv.find(it=>it.slot==='potion'&&it.kind===kind);if(!i){log(kind==='life'?'Kein Heiltrank im Inventar.':'Kein Manatrank im Inventar.','#a39b88');return}usePotion(i);hudLast={}}
function usePotion(it){const a=Math.round(it.amt*(1+P.d.potPow/100));if(it.kind==='life'){P.heal+=a;P.poisonT=0}else P.mp=Math.min(P.d.mana,P.mp+a);if((it.n||1)>1)it.n--;else invDel(it);sample('potion',.7)||sfx('pick');updatePanels()}

