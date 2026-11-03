/* ---------- companions: a hired blade from the traders, spirit ashes against the mighty ---------- */
const MERC={
 krieger:{n:'Schwertknecht',names:['Brandt','Hagen','Ulrich','Wolfram','Gerold'],hp:[70,15],dmg:[5,2.1],rng:0,dr:.25,spd:4.1,cd:.85,gear:{armor:'Kettenhemd',helm:'Eisenhelm',offhand:'Rundschild'},d:'Nahkampf, zäh, hält die Gegner fest'},
 jaegerin:{n:'Bogenschützin',names:['Wenna','Ilse','Kara','Runa','Sigrun'],hp:[55,11],dmg:[4,1.9],rng:6.5,dr:.1,spd:4.3,cd:1,proj:'arrow',gear:{armor:'Lederwams'},d:'Fernkampf, schnelle Pfeile'},
 magier:{n:'Aschenadept',names:['Corvin','Elric','Mira','Sefa','Anselm'],hp:[45,9],dmg:[6,2.3],rng:6,dr:.05,spd:3.9,cd:1.5,proj:'glut',gear:{},d:'Glutgeschosse, die in der Menge bersten'}};
const ASH=[
 {k:'skel',n:'Knochenrotte',vid:'skel',c:3,hp:.9,dmg:.7,d:'Drei Knochenwichte, die vorstürmen.'},
 {k:'spider',n:'Spinnenbrut',vid:'spider',c:5,hp:.45,dmg:.45,d:'Fünf flinke Spinnen umschwärmen den Feind.'},
 {k:'archer',n:'Schützengrab',vid:'archer',c:3,hp:.6,dmg:.8,d:'Drei Knochenschützen aus sicherer Entfernung.'},
 {k:'golem',n:'Steinwächter',vid:'golem',c:1,hp:4,dmg:1.8,d:'Ein Koloss, der jeden Schlag auf sich zieht.'},
 {k:'wraith',n:'Klagegeister',vid:'wraith',c:2,hp:.8,dmg:1.2,d:'Zwei Klageseelen mit eisigen Geschossen.'},
 {k:'cult',n:'Aschechor',vid:'cult',c:3,hp:.7,dmg:1,d:'Drei Kultisten werfen Feuer.'}];
const ASHBY={};ASH.forEach(a=>ASHBY[a.k]=a);
// world boss i unlocks ash i+1 (Rußklaue → Spinnenbrut …)
const SPIRR=['#0a1622','#24506e','#64aacc','#d6f4ff'];
const mercCost=()=>Math.round((200+P.lvl*45)*(1-((P.d&&P.d.shopDisc)||0)/100)),mercRevive=()=>Math.round((80+P.lvl*22)*(1-((P.d&&P.d.shopDisc)||0)/100));
const mercMax=m=>{const t=MERC[m.t];return Math.round(t.hp[0]+P.lvl*t.hp[1])};
function ashState(){if(!P.ash)P.ash={k:'skel',lv:1,have:['skel'],used:false};return P.ash}

function makeMercEnt(){const m=P.merc,t=MERC[m.t],eq={weapon:startWeapon(CLS[m.t].wc)};for(const k in t.gear){const b=BASE[t.gear[k]];if(b)eq[k]={id:UID++,b:b.n,slot:b.slot,cls:b.cls,rar:'normal',mods:{},req:{lvl:1,str:0,dex:0}}}
  const a={merc:true,t:m.t,name:m.n,x:P.x,y:P.y,r:.3,face:P.face,anim:0,atkT:0,atkDur:.5,whirl:0,leap:null,roll:0,dead:false,trail:[],moving:false,hurt:0,ghosts:[],flash:0,ward:0,cls:m.t,eq,d:{okS:new Set(Object.values(eq))},
    cd:0,spd:t.spd,rng:t.rng,dr:t.dr,proj:t.proj,dieT:0};placeNear(a,1.4);return a}
function placeNear(a,r){for(let k=0;k<20;k++){const an=Math.random()*7,x=P.x+Math.cos(an)*r,y=P.y+Math.sin(an)*r;if(walkable(x,y)&&free(x,y,a.r*.8)){a.x=x;a.y=y;return}}a.x=P.x;a.y=P.y}
function makeSpirit(def,lv){const e=makeEnemy(def.vid,P.x,P.y);const m=1+(lv-1)*.15;
  Object.assign(e,{ally:true,spirit:true,name:def.n,hp:(40+P.lvl*14)*def.hp*m,dmgA:(4+P.lvl*1.8)*def.dmg*(1+(lv-1)*.12),aggro:true,life:80,idle:0,dieT:0,cd:rnd(.2,.6)});e.max=e.hp;
  e.pal=new Map();for(const k in RP)e.pal.set(RP[k],SPIRR);for(const k in RMP)e.pal.set(RMP[k],SPIRR);
  e.rng=e.d.kind==='ranged'?Math.min(6.5,e.d.range):0;e.proj=e.proj||e.d.proj;placeNear(e,1.6);return e}

function allySync(){if(!G.allies)G.allies=[];if(!G.aproj)G.aproj=[];
  if(G.allyMap!==G.map){G.allyMap=G.map;G.allies=G.allies.filter(a=>a.merc);G.aproj=[];for(const a of G.allies)placeNear(a,1.4)}
  const has=G.allies.find(a=>a.merc);if(P.merc&&!P.merc.dead&&!has){const a=makeMercEnt();a.hp=Math.min(P.merc.hp??1e9,mercMax(P.merc));G.allies.push(a)}
  if((!P.merc||P.merc.dead)&&has&&!has.dead)G.allies.splice(G.allies.indexOf(has),1)}
const foeNear=(x,y,r,f)=>{let b=null,bd=r;for(const e of G.map.enemies){if(e.dead||e.ally||e.dummy||(f&&!f(e)))continue;const d=hyp(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b};

function updAllies(dt){if(!P||!G.map||G.state!=='play')return;allySync();
  for(const a of G.allies.slice()){
    if(a.dead){a.dieT+=dt;if(a.dieT>(a.merc?3.5:1.2))G.allies.splice(G.allies.indexOf(a),1);continue}
    a.flash=Math.max(0,a.flash-dt);a.hurt=Math.max(0,(a.hurt||0)-dt);a.hitT=Math.max(0,(a.hitT||0)-dt);a.lungeT=Math.max(0,(a.lungeT||0)-dt);a.cd-=dt;if(a.trail)a.trail.length=0;a.moving=false;
    if(a.atkT>0)a.atkT=Math.max(0,a.atkT-dt);
    if(a.spirit){a.life-=dt;a.idle=foeNear(a.x,a.y,16)?0:a.idle+dt;if(a.life<=0||a.idle>5){a.dead=true;a.dieT=1;smoke(a.x,a.y,6,'rgba(150,200,230,',6,.4);continue}
      if(Math.random()<dt*3)fxp({k:'mote',x:a.x+rnd(-.2,.2),y:a.y+rnd(-.2,.2),z:rnd(.2,1),vx:0,vy:0,vz:.6,life:.7,col:pick(SPIRR.slice(2)),s:1,g:-.3})}
    const dP=hyp(P.x-a.x,P.y-a.y);if(dP>15){placeNear(a,1.4);if(a.spirit)burst(a.x,a.y,'#a8e0ff',8,2);continue}
    if(!a.tgt||a.tgt.dead||(a.retT=(a.retT||0)-dt)<0){a.retT=.4;a.tgt=foeNear(a.x,a.y,a.spirit?11:8.5,e=>e.aggro||hyp(e.x-P.x,e.y-P.y)<7)}
    const t=a.tgt&&!a.tgt.dead&&hyp(a.tgt.x-P.x,a.tgt.y-P.y)<13?a.tgt:null,sp=a.merc?a.spd*(dP>5?1.5:1):a.spd||3;
    const go=(tx,ty,s)=>{const an=Math.atan2(ty-a.y,tx-a.x);a.face=an;moveEnt(a,Math.cos(an)*s*dt,Math.sin(an)*s*dt);a.anim+=dt*s*.6;a.moving=true};
    if(!t){if(a.merc)a.hp=Math.min(mercMax(P.merc),a.hp+mercMax(P.merc)*.02*dt);if(dP>2.4)go(P.x,P.y,sp);continue}
    const d=hyp(t.x-a.x,t.y-a.y),reach=a.rng?a.rng:(a.merc?.9:a.d.range)+a.r+t.r;
    if(d>reach||(a.rng&&!los(a.x,a.y,t.x,t.y,.1))){go(t.x,t.y,sp);continue}
    a.face=Math.atan2(t.y-a.y,t.x-a.x);if(a.rng&&d<1.8&&a.merc)go(a.x*2-t.x,a.y*2-t.y,sp*.6);
    if(a.cd>0)continue;allyAttack(a,t)}
  updAproj(dt);mercHUD()}
function allyDmg(a){if(a.merc){const t=MERC[a.t];return(t.dmg[0]+P.lvl*t.dmg[1])*rnd(.85,1.15)}return a.dmgA*rnd(.85,1.15)}
function allyAttack(a,t){const ang=a.face;a.cd=a.merc?MERC[a.t].cd:(a.d.cd*.8+.2);a.lungeT=.22;if(a.merc){a.atkT=a.atkDur=.42}
  if(a.rng){const k=a.proj||'arrow',sp=k==='arrow'?12:8;G.aproj.push({x:a.x+Math.cos(ang)*.4,y:a.y+Math.sin(ang)*.4,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,dmg:allyDmg(a),kind:k,r:.28,life:1.4,aoe:k==='glut'||k==='fire'?1.2:0});return}
  hitEnemy(t,allyDmg(a),{ally:true,from:ang,kb:a.merc?.15:.08,col:a.spirit?'#a8e0ff':'#e8d8b0'});sparks(t.x,t.y,.6,ang+Math.PI,4,a.spirit?['#d6f4ff','#64aacc']:['#ffffff','#e8e0c8'],3)}
function updAproj(dt){const m=G.map;for(const p of G.aproj){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    const pop=()=>{p.life=0;if(p.aoe){boom(p.x,p.y,.7,'fire');for(const e of m.enemies)if(!e.dead&&hyp(e.x-p.x,e.y-p.y)<p.aoe+e.r)hitEnemy(e,p.dmg*(hyp(e.x-p.x,e.y-p.y)<.5?1:.7),{ally:true,col:'#ffb070'})}};
    if(!walkable(p.x,p.y)){pop();continue}
    for(const e of m.enemies){if(e.dead||hyp(e.x-p.x,e.y-p.y)>=e.r+p.r)continue;if(p.aoe)pop();else{p.life=0;hitEnemy(e,p.dmg,{ally:true,from:Math.atan2(p.vy,p.vx),kb:.08,col:'#e8d8b0'});sparks(p.x,p.y,.6,Math.atan2(-p.vy,-p.vx),4,['#ffffff','#e8e0c8'],3)}break}
    if(p.kind==='glut'&&Math.random()<.5)fxp({k:'ember',x:p.x,y:p.y,z:.55,vx:rnd(-.6,.6),vy:rnd(-.6,.6),vz:rnd(.3,1.2),life:rnd(.25,.5),col:pick(['#ffc070','#ff9a30']),s:rnd(1,2),g:-1})}
  G.aproj=G.aproj.filter(p=>p.life>0)}
function hurtAlly(a,dmg){if(a.dead)return;dmg*=1-(a.dr||0);a.hp-=dmg;a.flash=.1;a.hitT=.22;a.hurt=.2;if(CFG.numbers)ftext(a.x,a.y,Math.round(dmg),'#ff9a7a');
  if(a.merc&&P.merc)P.merc.hp=a.hp;
  if(a.hp<=0){a.dead=true;a.dieT=0;a.fallA=Math.random()*7;if(a.merc){P.merc.dead=true;P.merc.hp=0;log(`${a.name} ist gefallen. Jeder Händler kann ${a.t==='krieger'?'ihn':'sie'} gegen Glut zurückholen.`,'#ff8a6a');sfx('hit')}
    else{smoke(a.x,a.y,8,'rgba(150,200,230,',7,.5);burst(a.x,a.y,'#a8e0ff',14,2.4)}}}
function allyProjHit(p){for(const a of G.allies||[]){if(a.dead||hyp(a.x-p.x,a.y-p.y)>=a.r+p.r)continue;p.life=0;hurtAlly(a,p.dmg);if(p.kind!=='arrow')boom(p.x,p.y,.4,p.kind==='glut'?'fire':p.kind);return true}return false}
function allyTele(t){for(const a of G.allies||[])if(!a.dead&&inShape(t,a.x,a.y,a.r))hurtAlly(a,t.dmg)}
// monsters turn on whoever is closest: a companion between you and them takes the blows
const _updEnemy=updEnemy;updEnemy=function(e,dt){
  if(e.dead||!G.allies||!G.allies.length)return _updEnemy(e,dt);
  if((e.atgtT=(e.atgtT||0)-dt)<0){e.atgtT=.6;e.atgt=null;let bd=hyp(P.x-e.x,P.y-e.y)-.8;for(const a of G.allies){if(a.dead)continue;const d=hyp(a.x-e.x,a.y-e.y);if(d<bd&&d<8){bd=d;e.atgt=a}}}
  const a=e.atgt;if(!a||a.dead)return _updEnemy(e,dt);
  const sx=P.x,sy=P.y,sr=P.r;P.x=a.x;P.y=a.y;P.r=a.r;e.aggro=true;try{_updEnemy(e,dt)}finally{P.x=sx;P.y=sy;P.r=sr}};

function drawAlly(a){if(a.merc){const sv=P;P=a;try{drawPlayer()}finally{P=sv}return}
  ctx.save();ctx.globalAlpha=a.dead?Math.max(0,1-a.dieT):.78;drawEnemy(a);ctx.restore()}
function mercHUD(){let el=$('mercbar');if(!el){$('topinfo').insertAdjacentHTML('beforeend','<div id="mercbar" hidden><span class="mn"></span><div class="mb"><i></i></div></div>');el=$('mercbar')}
  const a=G.allies&&G.allies.find(x=>x.merc);if(!P.merc){el.hidden=true;return}el.hidden=false;
  const mx=mercMax(P.merc),hp=a&&!a.dead?Math.max(0,a.hp):0,txt=`${P.merc.n} · ${MERC[P.merc.t].n}${P.merc.dead?' · gefallen':''}`;
  if(el.dataset.t!==txt){el.dataset.t=txt;el.querySelector('.mn').textContent=txt}el.querySelector('i').style.width=(hp/mx*100).toFixed(1)+'%'}

// spirit ash: once per rest, only near a mighty foe
function summonAsh(){const s=ashState(),def=ASHBY[s.k];if(P.dead)return;
  if(s.used){log('Die Asche ist verbraucht. Raste an einem Leuchtfeuer.','#a39b88');return}
  const foe=foeNear(P.x,P.y,14,e=>e.boss||e.wb||e.rank==='unique');if(!foe){log('Die Asche regt sich nur in der Nähe eines mächtigen Feindes.','#a39b88');return}
  s.used=true;allySync();for(let k=0;k<def.c;k++){const e=makeSpirit(def,s.lv);G.allies.push(e);burst(e.x,e.y,'#a8e0ff',14,2.6);flash(e.x,e.y,1,30,'160,220,255',.35)}
  sample('portal',.5)||sfx('cast');log(`${def.n} erhebt sich aus der Asche.`,'#a8e0ff');buildBelt()}
function cycleAsh(){const s=ashState(),i=s.have.indexOf(s.k);s.k=s.have[(i+1)%s.have.length];log('Geisterasche: '+ASHBY[s.k].n,'#a8e0ff');buildBelt()}
function ashTip(){const s=ashState(),def=ASHBY[s.k];return`<div class="nm" style="color:#a8e0ff">Geisterasche: ${def.n}</div><div class="base">Stufe ${s.lv} · ${s.have.length} von ${ASH.length} Aschen</div><div>${def.d}</div>
  <div class="base" style="margin-top:4px">Nur nahe Bossen und einzigartigen Gegnern. Einmal pro Rast.</div><div class="${s.used?'req bad':'mod'}">${s.used?'Verbraucht · Leuchtfeuer füllt sie':'Bereit'}</div><div class="act">G oder Klick: beschwören · Rechtsklick: wechseln</div>`}

function wUrn(){return pfill((x,y)=>{const dx=x-7.5;
  if(y>=1&&y<=6){const fl=Math.abs(dx)<=2.6-(6-y)*.25+Math.sin(y*1.7)*.4;if(fl)return Math.abs(dx)<1?19:dx<0?18:17}
  if(y===7&&Math.abs(dx)<=3.5)return 6;if(y===8&&Math.abs(dx)<=2.5)return 1;
  if(y>=9&&y<=14){const w=y<=11?3+(y-9)*.7:4.4-(y-11)*.8;if(Math.abs(dx)<=w)return dx<-1?3:dx<1.5?2:y===12?5:1}
  if(y===15&&Math.abs(dx)<=2.5)return 4;return -1})}
PXS['Asche']=[()=>wUrn(),'dark','bone','dark','soul'];
const _buildBelt=buildBelt;buildBelt=function(){_buildBelt();if(!P)return;const b=$('belt'),s=ashState(),mk=b.querySelector('.sep+button.mini');
  const h=`<div class="slot ${s.used?'locked':''}" data-ash><img class="px" src="${pxURL('Asche')}" alt=""><span class="k">G</span></div><div class="sep"></div>`;
  if(mk)mk.previousElementSibling.insertAdjacentHTML('beforebegin',h);else b.insertAdjacentHTML('beforeend',h)};

// hooks: rest refills the ash and mends the hireling, bosses feed the ash, the flask heals both
const _rest=rest;rest=function(){_rest();const s=ashState();s.used=false;if(P.merc&&!P.merc.dead){P.merc.hp=mercMax(P.merc);const a=G.allies&&G.allies.find(x=>x.merc);if(a)a.hp=P.merc.hp}G.allies=(G.allies||[]).filter(a=>a.merc);buildBelt()};
const _drinkFlask=drinkFlask;drinkFlask=function(){const f=P.flasks;_drinkFlask();if(P.flasks<f){const a=G.allies&&G.allies.find(x=>x.merc&&!x.dead);if(a){a.hp=Math.min(mercMax(P.merc),a.hp+mercMax(P.merc)*.4);P.merc.hp=a.hp}}};
const _killEnemyA=killEnemy;killEnemy=function(e,a){const first=e.boss&&!e.wb&&!G.bossDead[G.floor];_killEnemyA(e,a);const s=ashState();
  if(e.wb){const i=WB.findIndex(b=>b.id===e.wb),nx=ASH[Math.min(ASH.length-1,i+1)];if(nx&&!s.have.includes(nx.k)){s.have.push(nx.k);banner('GEISTERASCHE',nx.n,'',3000);log('Neue Geisterasche: '+nx.n+' (Rechtsklick auf die Urne wechselt)','#a8e0ff')}else if(s.lv<10){s.lv++;log('Deine Geisterasche wird stärker: Stufe '+s.lv,'#a8e0ff')}}
  else if(first&&s.lv<10){s.lv++;log('Deine Geisterasche wird stärker: Stufe '+s.lv,'#a8e0ff')}};
function shopMercHTML(){const m=P.merc;let h='<h3>Söldner</h3>';
  if(m){const t=MERC[m.t];h+=`<p class="hint">${m.n}, ${t.n}: ${t.d}. Kämpft auf deiner Stufe, folgt dir überallhin und trinkt mit, wenn du den Flakon nimmst.</p>`;
    if(m.dead){const c=mercRevive();h+=`<div class="shoprow"><span>${m.n} zurückholen</span><span class="c">${c}</span><button data-merc="revive" data-cost="${c}">Zurückholen</button></div>`}
    h+=`<div class="shoprow"><span>${m.n} entlassen</span><span class="c">–</span><button data-merc="fire" data-cost="0">Entlassen</button></div>`}
  else{const c=mercCost();h+='<p class="hint">Eine Klinge auf Zeit. Bleibt, bis du sie entlässt.</p>'+Object.entries(MERC).map(([k,t])=>`<div class="shoprow"><span>${t.n} <small class="base">· ${t.d}</small></span><span class="c">${c}</span><button data-hire="${k}" data-cost="${c}">Anheuern</button></div>`).join('')}
  return h}
const _buildShopM=buildShop;buildShop=function(){_buildShopM();const gs=[...$('pShop').querySelectorAll('h3')].find(x=>x.textContent.startsWith('Glücksspiel'));if(gs)gs.insertAdjacentHTML('beforebegin',shopMercHTML())};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-hire],[data-merc],[data-ash]');if(!t||!P)return;
  if(t.dataset.ash!=null){summonAsh();return}
  const c=+t.dataset.cost||0;if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}
  if(t.dataset.hire){const ty=MERC[t.dataset.hire];P.glut-=c;P.merc={t:t.dataset.hire,n:pick(ty.names),dead:false};P.merc.hp=mercMax(P.merc);qInc('merc');sfx('gold');log(`${P.merc.n} schließt sich dir an.`,'#e8d8b0')}
  else if(t.dataset.merc==='revive'){P.glut-=c;P.merc.dead=false;P.merc.hp=mercMax(P.merc);G.allies=(G.allies||[]).filter(a=>!a.merc);sfx('gold');log(`${P.merc.n} steht wieder an deiner Seite.`,'#e8d8b0')}
  else if(t.dataset.merc==='fire'){log(`${P.merc.n} zieht weiter.`,'#a39b88');P.merc=null;G.allies=(G.allies||[]).filter(a=>!a.merc)}
  updatePanels()});
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-ash]')){e.preventDefault();cycleAsh()}});
document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('[data-ash]');if(t&&P)showTip(ashTip(),e.clientX,e.clientY)});
addEventListener('keydown',e=>{if(e.repeat||G.state!=='play'||!P)return;if(e.key.toLowerCase()==='g')summonAsh()});
