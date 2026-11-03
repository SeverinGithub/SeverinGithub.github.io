/* ---------- class skills, second pass: the warrior fights without magic · the mage's spells take the element of the staff in hand ---------- */
const EL={fire:{n:'Feuer',col:'#ffb070',rgb:'255,150,60',kind:'glut',c:['#fff4d0','#ffc070','#ff7a1a','#8a2c08'],pl:['#3a1206','#080200']},
  frost:{n:'Frost',col:'#cfe8ff',rgb:'170,220,255',kind:'frost',c:['#ffffff','#c8e4ff','#6ad0ff','#1a4a6a'],pl:['#0e2238','#02060c']},
  light:{n:'Blitz',col:'#cfe0ff',rgb:'180,200,255',kind:'light',c:['#ffffff','#cfe0ff','#7aa4ff','#1a2a6a'],pl:['#101a3a','#02030a']},
  poison:{n:'Gift',col:'#b8e070',rgb:'150,230,90',kind:'poison',c:['#f0ffd0','#c8f878','#8ae050','#2a4a10'],pl:['#14280a','#030601']}};
const ELK=Object.keys(EL);
const MNAME={m_bolt:{fire:'Glutkugel',frost:'Eislanze',light:'Funkenschlag',poison:'Seuchenkugel',none:'Geschoss'},m_ring:{fire:'Feuerring',frost:'Frostring',light:'Blitzring',poison:'Giftring',none:'Ring'},
  m_jump:{fire:'Aschesprung',frost:'Frostschritt',light:'Blitzsprung',poison:'Nebelschritt',none:'Sprung'},m_storm:{fire:'Meteor',frost:'Hagelsturm',light:'Gewitter',poison:'Seuchenwolke',none:'Sturm'}};
const mElem=()=>{const w=P&&P.eq.weapon;return w&&w.cls==='staff'&&P.d&&P.d.okS.has(w)?w.elem||'fire':null};
const elN=()=>{const e=mElem();return e?EL[e].n:'—'};
SKILLS.push(
 {id:'atem',req:9,cd:50,n:'Zweiter Atem',mana:l=>10+l,desc:l=>`30 Sekunden lang regenerierst du ${(1.2+l*.15).toFixed(1)}% Leben pro Sekunde, Ausdauer kehrt doppelt so schnell zurück.`},
 {id:'schwur',req:15,cd:90,n:'Heiliger Schwur',mana:l=>16+l,desc:l=>`30 Sekunden lang +${60+l*8}% Schaden gegen Untote, 15% weniger erlittener Schaden, jeder Treffer gegen Untote heilt 1% Leben.`},
 {id:'m_bolt',req:1,cd:.35,mana:l=>4+Math.round(l*.8),desc:l=>{const d=Math.round(spellBase('fire',l)),e=mElem();return e==='frost'?`Eislanze durchbohrt alles in einer Linie: ${d} Kälteschaden, verlangsamt.`:e==='light'?`Schneller Funke: ${Math.round(d*.85)} Blitzschaden, springt auf 2 weitere Feinde über.`:e==='poison'?`Seuchenkugel: ${Math.round(d*.7)} Giftschaden, hinterlässt 3 Sekunden eine Giftwolke.`:e?`Feuerkugel, explodiert für ${d} Feuerschaden.`:'Braucht einen Zauberstab. Sein Element bestimmt, was du schleuderst.'}},
 {id:'m_ring',req:3,cd:1.2,mana:l=>8+l,desc:l=>{const d=Math.round(spellBase('nova',l)),e=mElem();return e==='fire'?`Feuerring um dich: ${d} Feuerschaden, der Boden brennt 3 Sekunden.`:e==='light'?`Blitzring: ${d} Blitzschaden, Funken springen auf Nachbarn über.`:e==='poison'?`Giftring: ${Math.round(d*.7)} Giftschaden und Gift über 3 Sekunden.`:e?`Eisring um dich: ${d} Kälteschaden, verlangsamt Feinde.`:'Braucht einen Zauberstab.'}},
 {id:'m_jump',req:6,cd:2.5,mana:l=>8+l,desc:l=>`Teleportiert dich bis zu 8 Schritte weit. Am Start und am Ziel bricht ${elN()} hervor: ${Math.round(spellBase('blink',l))} Schaden.`},
 {id:'m_storm',req:9,cd:3,mana:l=>16+l*2,desc:l=>{const d=Math.round(spellBase('meteor',l)),e=mElem();return e==='frost'?`Hagelsturm: 2,4 Sekunden lang Eis auf ein Gebiet, insgesamt etwa ${Math.round(d*1.6)} Kälteschaden, verlangsamt.`:e==='light'?`Gewitter: 6 Blitze schlagen in Feinde im Gebiet, je ${Math.round(d*.45)} Blitzschaden.`:e==='poison'?`Seuchenwolke: 4 Sekunden Giftnebel, insgesamt etwa ${Math.round(d*1.2)} Giftschaden.`:e?`Ruft einen Meteor herab: ${d} Feuerschaden, danach brennt der Boden.`:'Braucht einen Zauberstab.'}},
 {id:'m_fuse',req:18,cd:30,mana:l=>30+l*2,desc:l=>`Verschmelzung: ${(10+l*.5).toFixed(1)} Sekunden lang lösen deine Zauber ihre Resonanzen immer aus. Jeder Ring schießt 8 Geschosse, jedes Geschoss zündet einen Ring, jeder Sturm fällt doppelt.`});
for(const id in MNAME)Object.defineProperty(SKBY[id]||SKILLS.find(s=>s.id===id),'n',{get(){return MNAME[id][mElem()||'none']},configurable:true});
Object.defineProperty(SKILLS.find(s=>s.id==='m_fuse'),'n',{value:'Verschmelzung',writable:true});
SKILLS.forEach(s=>SKBY[s.id]=s);
SKBY.cry.cd=40;SKBY.cry.desc=l=>`Wut: 30 Sekunden lang +${20+l*3}% Schaden. Feinde in der Nähe weichen zurück und werden langsamer.`;
CLS.krieger.skills=['whirl','slam','charge','cry','atem','schwur'];CLS.krieger.d='Stahl und Zorn, keine Zauber. Viel Leben, harte Schläge, Wut und Schwur statt Magie.';
CLS.magier.skills=['m_bolt','m_ring','m_jump','m_storm','ward','m_fuse'];CLS.magier.d='Der Stab bestimmt das Element: Feuer, Frost, Blitz oder Gift. Zauber nacheinander gewirkt erzeugen Resonanzen.';
const _startWeaponS=startWeapon;startWeapon=function(c){const it=_startWeaponS(c);if(it.cls==='staff')it.elem='fire';return it};
const _makeItemS=makeItem;makeItem=function(l,o){const it=_makeItemS(l,o);if(it.cls==='staff'&&!it.elem)it.elem=pick(ELK);return it};

// skill points move along with the new lists, freed points come back
function skMigrate(){if(!P||(P.skv||0)>=2)return;P.skv=2;const sk=P.sk||(P.sk={});let back=0;
  if(P.cls==='krieger')for(const id of['leap','ward'])if(sk[id]){back+=sk[id];delete sk[id]}
  if(P.cls==='magier'){const mp={fire:'m_bolt',nova:'m_ring',blink:'m_jump',meteor:'m_storm'};for(const a in mp)if(sk[a]){sk[mp[a]]=sk[a];delete sk[a]}if(sk.chain){back+=sk.chain;delete sk.chain}if(mp[P.sel])P.sel=mp[P.sel]}
  if(back){P.spts+=back;log(`Deine Fertigkeiten sind neu geordnet: ${back} Punkte zurück (K).`,'#e8c878')}
  if(!myCls().skills.includes(P.sel))P.sel=myCls().skills[0];buildBelt()}
function staffElems(){for(const it of[...Object.values(P.eq),...P.inv,...(P.stash||[])])if(it&&it.cls==='staff'&&!it.elem)it.elem=ELK[it.id%4]}

const _castSkillS=castSkill;castSkill=function(id,tx,ty){if(id&&id.startsWith('m_')&&!mElem()){log('Ohne Zauberstab kein Zauber. Leg einen Stab an.','#a39b88');return}return _castSkillS(id,tx,ty)};
const _castExtS=castExt;castExt=function(id,l,ang,tx,ty){
  if(id==='cry'){_castExtS(id,l,ang,tx,ty);P.cryT=30;return}
  if(id==='atem'){P.atemT=30;P.atemL=l;flash(P.x,P.y,1,50,'255,120,100',.3);shock(P.x,P.y,2.2,'255,140,120',.5,3);ftext(P.x,P.y-.5,'Zweiter Atem','#ff9a8a',true);sfx('lvl');return}
  if(id==='schwur'){P.oathT=30;P.oathB=60+l*8;flash(P.x,P.y,1.2,80,'255,230,150',.4);shock(P.x,P.y,4,'255,220,140',.7,5);G.shake=Math.max(G.shake,4);ftext(P.x,P.y-.5,'Heiliger Schwur','#ffe08a',true);sfx('boom');
    for(let k=0;k<26;k++){const a=k/26*6.283;fxp({k:'mote',x:P.x+Math.cos(a)*1.4,y:P.y+Math.sin(a)*1.4,z:.2,vx:0,vy:0,vz:rnd(1,2.4),life:rnd(.6,1.1),col:pick(['#fff0a8','#ffd88a','#ffffff']),s:rnd(1.2,2),g:-.3})}return}
  if(id.startsWith('m_'))return mCast(id,l,ang,tx,ty);
  return _castExtS(id,l,ang,tx,ty)};

// the four shapes in four elements, and what happens when they follow each other
function eHit(el,e,dmg,o={}){if(e.dead)return;hitEnemy(e,dmg,Object.assign({col:EL[el].col,slow:el==='frost'?2:0},o));if(el==='poison'&&!e.dead){e.dotT=3;e.dotD=Math.max(e.dotD||0,dmg*.12)}}
function zap(a,b){G.bolts.push({a:[a.x,a.y],b:[b.x,b.y],t:.22});sparks(b.x,b.y,.7,0,6,['#ffffff','#cfe0ff','#7aa4ff'],5,3.2);addLight(b.x,b.y,150,.8,.2)}
function jumpOn(el,from,dmg,n,hit){let cur=from;for(let k=0;k<n;k++){let nx=null,nd=4;for(const e of G.map.enemies){if(e.dead||hit.has(e))continue;const d=hyp(e.x-cur.x,e.y-cur.y);if(d<nd){nd=d;nx=e}}if(!nx)break;hit.add(nx);zap(cur,nx);eHit(el,nx,dmg);cur=nx}}
function mBolt(el,a,dmg,l,o={}){const E=EL[el],x=(o.x??P.x)+Math.cos(a)*.4,y=(o.y??P.y)+Math.sin(a)*.4,mk=(sp,extra)=>G.proj.push(Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,owner:'p',dmg,kind:E.kind,r:.3,life:1.3,col:E.col,melem:el},extra));
  const impact=p=>{G.mImpact={x:p.x,y:p.y,t:G.t};if(P.fuseT>0&&!o.child)mRing(el,p.x,p.y,dmg*.5,l,true)};
  if(el==='fire')mk(10,{aoe:1.4,boomE:'fire',onBoom:impact});
  else if(el==='frost')mk(17,{pierce:true,slow:2,big:true,life:1,onHit:(e,p)=>{if(!p.imp){p.imp=1;impact(p)}}});
  else if(el==='light')mk(21,{dmg:dmg*.85,onHit:(e,p)=>{impact(p);jumpOn(el,e,dmg*.6,2,new Set([e]))}});
  else mk(9,{dmg:dmg*.7,onHit:(e,p)=>{impact(p);if(!e.dead){e.dotT=3;e.dotD=Math.max(e.dotD||0,dmg*.15)}G.zones.push({k:'mcloud',x:p.x,y:p.y,r:1.6,t:0,dur:3,tick:.5,acc:0,dmg:dmg*.12})}});
  sample('fire',.4,{rate:el==='fire'?1:el==='frost'?1.5:el==='light'?2:.8});flash(x,y,.8,22,E.rgb,.16)}
function mRing(el,x,y,dmg,l,child){const E=EL[el];G.rings.push({x,y,r:.3,max:4.6,v:9,col:E.c[1],hcol:E.col,hit:new Set(),dmg:el==='poison'?dmg*.7:dmg,slow:el==='frost'?2.5:0,
    onHit:el==='light'?(e=>{if(Math.random()<.5)jumpOn(el,e,dmg*.4,1,new Set([e]))}):el==='poison'?(e=>{if(!e.dead){e.dotT=3;e.dotD=Math.max(e.dotD||0,dmg*.15)}}):null});
  for(let k=0;k<36;k++){const a=k/36*6.283;fxp({k:el==='fire'?'ember':el==='poison'?'mote':'shard',x,y,z:.3+rnd(0,.4),vx:Math.cos(a)*9,vy:Math.sin(a)*9,vz:rnd(0,1),life:.5,col:pick(E.c.slice(0,3)),s:rnd(2,3.5),rot:a,g:el==='fire'?-.2:1})}
  shock(x,y,4.6,E.rgb,.5,4);flash(x,y,.6,50,E.rgb,.25);addLight(x,y,300,.9,.5);decal(el==='fire'?'scorch':el==='poison'?'ichor':'frost',x,y,1.1,20);
  if(el==='fire')G.zones.push({k:'burn',x,y,r:2,t:0,dur:3,tick:.5,acc:0,dmg:dmg*.1});if(!child)sfx(el==='light'?'zap':'cast');
  if(P.fuseT>0&&!child)for(let k=0;k<8;k++)mBolt(el,k*Math.PI/4,spellBase('fire',l)*.5,l,{x,y,child:true})}
function mStorm(el,x,y,dmg,big){const r=2.4*(big?1.35:1);
  if(el==='fire')G.zones.push({k:'meteor',x,y,r,t:0,dur:.9,dmg});
  else if(el==='frost')G.zones.push({k:'hail',x,y,r:r+.2,t:0,dur:2.4,tick:.3,acc:.3,dmg:dmg*.2});
  else if(el==='light')G.zones.push({k:'thunder',x,y,r:r+.6,t:0,dur:1.65,tick:.27,acc:.27,dmg:dmg*.45});
  else G.zones.push({k:'mcloud',x,y,r:r+.6,t:0,dur:4,tick:.5,acc:0,dmg:dmg*.15,big:1});
  sample('fire',.5,{rate:el==='fire'?.7:el==='frost'?1.3:el==='light'?1.8:.6})}
function mBurst(el,x,y,dmg){boom(x,y,.9,el==='fire'?'fire':el==='poison'?'poison':'frost');for(const e of G.map.enemies)if(!e.dead&&hyp(e.x-x,e.y-y)<1.8+e.r)eHit(el,e,dmg*rnd(.85,1.15));if(el==='light')for(let k=0;k<3;k++)G.bolts.push({a:[x,y],b:[x+rnd(-1.6,1.6),y+rnd(-1.6,1.6)],t:.2})}
function mCast(id,l,ang,tx,ty){const el=mElem(),E=EL[el],now=G.t,last=G.mLast,prev=last&&now-last.t<1.6&&last.id!==id?last.id:null,fuse=P.fuseT>0;G.mLast={id,t:now};
  const res=n=>{ftext(P.x,P.y-.9,'Resonanz: '+n,E.col,true);flash(P.x,P.y,1,40,E.rgb,.25)};
  if(id==='m_bolt'){const dmg=spellBase('fire',l),kr=prev==='m_ring'||fuse;if(prev==='m_ring')res('Kranz');if(kr)for(let k=0;k<8;k++)mBolt(el,ang+k*Math.PI/4,dmg*.7,l);else mBolt(el,ang,dmg,l)}
  if(id==='m_ring'){const dmg=spellBase('nova',l);mRing(el,P.x,P.y,dmg,l);
    if(prev==='m_bolt'&&G.mImpact&&now-G.mImpact.t<2){res('Einschlag');mRing(el,G.mImpact.x,G.mImpact.y,dmg*.8,l,true)}
    if(prev==='m_jump'&&G.mJumpFrom){res('Doppelring');mRing(el,G.mJumpFrom.x,G.mJumpFrom.y,dmg*.8,l,true)}}
  if(id==='m_jump'){let ex=P.x,ey=P.y;const d=Math.min(8,hyp(tx-P.x,ty-P.y));for(let s=0;s<=d;s+=.25){const x=P.x+Math.cos(ang)*s,y=P.y+Math.sin(ang)*s;if(free(x,y,P.r)){ex=x;ey=y}}
    const dmg=spellBase('blink',l);G.mJumpFrom={x:P.x,y:P.y};mBurst(el,P.x,P.y,dmg);P.x=ex;P.y=ey;P.path=[];P.iframe=.25;mBurst(el,P.x,P.y,dmg);sfx('zap');
    if(prev==='m_storm'||fuse){res('Sturmlauf');mStorm(el,P.x,P.y,spellBase('meteor',l)*.6,false)}}
  if(id==='m_storm'){const dist=Math.min(10,hyp(tx-P.x,ty-P.y)),x=P.x+Math.cos(ang)*dist,y=P.y+Math.sin(ang)*dist,big=prev==='m_ring'||prev==='m_bolt';if(big)res('Entfesselt');
    mStorm(el,x,y,spellBase('meteor',l)*(big?1.4:1),big);
    if(fuse){let t=null,bd=12;for(const e of G.map.enemies){if(e.dead)continue;const dd=hyp(e.x-x,e.y-y);if(dd>2.5&&dd<bd&&hyp(e.x-P.x,e.y-P.y)<11){bd=dd;t=e}}const[sx2,sy2]=t?[t.x,t.y]:[x+rnd(-3,3),y+rnd(-3,3)];setTimeout(()=>{if(P&&G.map)mStorm(el,sx2,sy2,spellBase('meteor',l)*.8,false)},350)}}
  if(id==='m_fuse'){P.fuseT=10+l*.5;flash(P.x,P.y,1.2,90,E.rgb,.45);for(const k of ELK)shock(P.x,P.y,3+ELK.indexOf(k)*.6,EL[k].rgb,.7,4);G.shake=Math.max(G.shake,5);ftext(P.x,P.y-.6,'Verschmelzung','#ffe8b0',true);sfx('boom')}}

// zones of the new storms, buffs ticking down
function updForge(dt){if(!P||!G.map||G.state==='title')return;forgeTick();skMigrate();staffElems();slateHud();smithTick(dt);
  const e=mElem();if(e!==G.lastEl){G.lastEl=e;if(P.cls==='magier'){buildBelt();if(!$('pSkill').hidden)updatePanels()}}
  for(const it of G.map.items)if(it.item.slot==='slate'&&it.t>.45&&hyp(it.x-P.x,it.y-P.y)<1.2&&!P.dead){pickup(it);break}
  const m=G.map;
  for(const z of G.zones){if(z.k!=='hail'&&z.k!=='thunder'&&z.k!=='mcloud')continue;z.acc+=dt;
    if(z.k==='hail'){for(let q=0;q<2;q++){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'shard',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:3,vx:1.5,vy:1.5,vz:-12,life:.25,col:pick(['#ffffff','#c8e4ff','#6ad0ff']),s:rnd(1.6,2.6),rot:1.2,g:0})}
      if(z.acc>=z.tick){z.acc=0;decal('frost',z.x+rnd(-1,1),z.y+rnd(-1,1),.6,8);for(const e of m.enemies)if(!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r)eHit('frost',e,z.dmg*rnd(.85,1.15))}}
    if(z.k==='thunder'){if(z.acc>=z.tick){z.acc=0;const c=m.enemies.filter(e=>!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r),t=c.length?pick(c):null,x=t?t.x:z.x+rnd(-z.r,z.r)*.7,y=t?t.y:z.y+rnd(-z.r,z.r)*.7;
        G.bolts.push({a:[x-1.6,y-1.6],b:[x,y],t:.25});G.bolts.push({a:[x-1.6,y-1.6],b:[x-.6,y-1.2],t:.18});flash(x,y,1.2,60,'200,215,255',.35);shock(x,y,1.2,'180,200,255',.3,3);addLight(x,y,260,1,.3);sparks(x,y,.3,0,12,['#ffffff','#cfe0ff','#7aa4ff'],7,3.2);sfx('zap');G.shake=Math.max(G.shake,2);
        for(const e of m.enemies)if(!e.dead&&hyp(e.x-x,e.y-y)<1.1+e.r)eHit('light',e,z.dmg*rnd(.85,1.15))}}
    if(z.k==='mcloud'){if(Math.random()<dt*(z.big?40:18)){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'mote',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:rnd(.1,.6),vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(.2,.6),life:rnd(.6,1.2),col:pick(['#9ae050','#c8f878','#4a8a2a']),s:rnd(1.5,3),g:0})}
      if(z.acc>=z.tick){z.acc=0;for(const e of m.enemies)if(!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r)eHit('poison',e,z.dmg*rnd(.85,1.15))}}}
  if(P.atemT>0){P.atemT-=dt;P.hp=Math.min(P.d.life,P.hp+P.d.life*(.012+(P.atemL||1)*.0015)*dt);P.st=Math.min(P.d.stam,P.st+P.d.stam*.12*dt);if(Math.random()<dt*6)fxp({k:'mote',x:P.x+rnd(-.3,.3),y:P.y+rnd(-.3,.3),z:rnd(.2,1),vx:0,vy:0,vz:.8,life:.6,col:pick(['#ff7a6a','#ffb0a0']),s:1.2,g:0})}
  if(P.oathT>0){P.oathT-=dt;if(Math.random()<dt*8)fxp({k:'mote',x:P.x+rnd(-.35,.35),y:P.y+rnd(-.35,.35),z:rnd(.2,1.4),vx:0,vy:0,vz:.7,life:.7,col:pick(['#fff0a8','#ffd88a']),s:1.3,g:0})}
  if(P.fuseT>0){P.fuseT-=dt;if(Math.random()<dt*14){const k=pick(ELK),a=rnd(0,6.28);fxp({k:'mote',x:P.x+Math.cos(a)*.6,y:P.y+Math.sin(a)*.6,z:rnd(.3,1.3),vx:-Math.sin(a)*1.5,vy:Math.cos(a)*1.5,vz:.3,life:.6,col:EL[k].c[1],s:1.6,g:0})}}
  buffHud()}
const _hitEnemyK=hitEnemy;hitEnemy=function(e,dmg,o={}){if(P&&P.oathT>0&&!o.ally&&dmg>0&&!e.dead&&UNDEAD.has(e.type)){dmg*=1+P.oathB/100;P.hp=Math.min(P.d.life,P.hp+P.d.life*.01);if(Math.random()<.4)sparks(e.x,e.y,.8,0,4,['#fff0a8','#ffd88a'],3,3)}return _hitEnemyK(e,dmg,o)};
const _hurtPlayerS=hurtPlayer;hurtPlayer=function(dmg,el,src){if(P&&P.oathT>0)dmg*=.85;return _hurtPlayerS(dmg,el,src)};
// running buffs, small and above the belt
const BUFFS=[['cryT','cry','Wut'],['atemT','atem','Zweiter Atem'],['oathT','schwur','Heiliger Schwur'],['fuseT','m_fuse','Verschmelzung'],['venomT','venom','Giftklinge'],['shadowT','dash','Schattenschritt']];
function buffHud(){let el=$('buffs');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="buffs"></div>');el=$('buffs')}
  const on=G.state==='play'?BUFFS.filter(([k])=>P[k]>0):[],key=on.map(([k])=>k+Math.ceil(P[k])).join();if(el.dataset.k===key)return;el.dataset.k=key;
  el.innerHTML=on.map(([k,ic,n])=>`<span title="${n}">${SKIC[ic]?`<img class="px" src="${SKIC[ic]}" alt="">`:''}<b>${Math.ceil(P[k])}</b></span>`).join('')}

// icons for the new skills, painted like the old ones
function addSkillIcons(){const mk=f=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d',{willReadFrequently:true});f(g);quantize(g,32,32);return c.toDataURL()};
  const plate=(g,a,b)=>{const q=g.createRadialGradient(16,14,2,16,16,24);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,32,32);g.fillStyle='#030202';g.fillRect(0,0,32,1);g.fillRect(0,31,32,1);g.fillRect(0,0,1,32);g.fillRect(31,0,1,32);g.fillStyle='rgba(255,230,190,.25)';g.fillRect(1,1,30,1);g.fillRect(1,1,1,30);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(1,30,30,1);g.fillRect(30,1,1,30)};
  const glow=(g,x,y,r,c)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,32,32)};
  const orb=(g,x,y,r,c)=>{const q=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);q.addColorStop(0,c[0]);q.addColorStop(.5,c[1]);q.addColorStop(1,c[2]);g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
  const NONE={c:['#9da2aa','#6c7078','#45484e','#25272b'],pl:['#25272b','#060606'],rgb:'150,150,150'};
  for(const k of[...ELK,'none']){const E=EL[k]||NONE;
    SKIC['m_bolt_'+k]=mk(g=>{plate(g,...E.pl);glow(g,20,12,13,`rgba(${E.rgb},.55)`);g.lineCap='round';for(let i=0;i<3;i++){g.strokeStyle=E.c[2-i];g.lineWidth=3-i;g.beginPath();g.moveTo(5+i*2,27-i);g.lineTo(17,15);g.stroke()}orb(g,20,12,6,E.c)});
    SKIC['m_ring_'+k]=mk(g=>{plate(g,...E.pl);glow(g,16,16,15,`rgba(${E.rgb},.5)`);g.strokeStyle=E.c[1];g.lineWidth=2.2;g.beginPath();g.arc(16,16,10,0,7);g.stroke();g.strokeStyle=E.c[2];g.lineWidth=1;g.beginPath();g.arc(16,16,12.5,0,7);g.stroke();
      for(let i=0;i<8;i++){const a=i/8*6.283;g.fillStyle=i%2?E.c[0]:E.c[1];g.fillRect(16+Math.cos(a)*10-1.5,16+Math.sin(a)*10-1.5,3,3)}orb(g,16,16,2.5,E.c)});
    SKIC['m_storm_'+k]=mk(g=>{plate(g,...E.pl);glow(g,16,24,13,`rgba(${E.rgb},.55)`);g.lineCap='round';for(const[x,y]of[[8,4],[16,2],[23,6]]){g.strokeStyle=E.c[2];g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x-4,y+14);g.stroke();g.strokeStyle=E.c[0];g.lineWidth=1;g.stroke()}
      g.fillStyle=E.c[1];g.beginPath();g.ellipse(14,25,10,3.5,0,0,7);g.fill();g.fillStyle=E.c[0];g.beginPath();g.ellipse(14,25,5,1.6,0,0,7);g.fill()});
    SKIC['m_jump_'+k]=mk(g=>{plate(g,...E.pl);glow(g,24,10,10,`rgba(${E.rgb},.5)`);g.setLineDash([2,3]);g.strokeStyle=E.c[1];g.lineWidth=1.6;g.beginPath();g.moveTo(8,24);g.quadraticCurveTo(10,6,24,10);g.stroke();g.setLineDash([]);
      g.strokeStyle=E.c[2];g.lineWidth=1.4;g.beginPath();g.ellipse(8,25,5,2,0,0,7);g.stroke();orb(g,24,10,4.5,E.c)})}
  SKIC.m_fuse=mk(g=>{plate(g,'#2a2014','#040302');glow(g,16,16,15,'rgba(255,230,160,.5)');ELK.forEach((k,i)=>{g.strokeStyle=EL[k].c[1];g.lineWidth=2.4;g.beginPath();g.arc(16,16,10,i*1.571,i*1.571+1.4);g.stroke()});orb(g,16,16,5,['#ffffff','#ffe8b0','#c8962a'])});
  SKIC.atem=mk(g=>{plate(g,'#3a0c0a','#080202');glow(g,16,18,13,'rgba(255,90,70,.55)');g.fillStyle='#c41c14';g.beginPath();g.moveTo(16,27);g.bezierCurveTo(4,18,6,8,12,8);g.bezierCurveTo(14,8,16,10,16,12);g.bezierCurveTo(16,10,18,8,20,8);g.bezierCurveTo(26,8,28,18,16,27);g.fill();
    g.fillStyle='#ff7a5a';g.fillRect(10,11,3,3);for(const[x,y]of[[24,6],[7,5],[27,15]]){g.fillStyle='#ffb0a0';g.fillRect(x,y,2,2)}});
  SKIC.schwur=mk(g=>{plate(g,'#2a2208','#060402');glow(g,16,12,14,'rgba(255,220,120,.6)');g.strokeStyle='#ffe08a';g.lineWidth=1.4;g.beginPath();g.ellipse(16,7,7,2.5,0,0,7);g.stroke();
    g.fillStyle='#eef2f8';g.fillRect(15,10,3,15);g.fillStyle='#a7b1c2';g.fillRect(17,10,1,15);g.fillStyle='#eef2f8';g.beginPath();g.moveTo(15,25);g.lineTo(16.5,29);g.lineTo(18,25);g.fill();g.fillStyle='#c8962a';g.fillRect(10,9,13,2);g.fillStyle='#714020';g.fillRect(15,3,3,6);g.fillStyle='#e2b23c';g.fillRect(15,2,3,2)});
  for(const id of['m_bolt','m_ring','m_jump','m_storm'])Object.defineProperty(SKIC,id,{get(){return SKIC[id+'_'+(mElem()||'none')]},configurable:true})}
const _buildUIS=buildUI;buildUI=function(){_buildUIS();addSkillIcons()};

