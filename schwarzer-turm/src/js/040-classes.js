/* ---------- classes: each brings its own six skills, start stats, look and talent entry ---------- */
SKILLS.push(
 {id:'slam',n:'Erdspalter',req:3,cd:1.1,mana:l=>7+l,desc:l=>`Spaltet die Erde vor dir: ${140+l*15}% Waffenschaden auf einer Linie, stößt Feinde zurück.`},
 {id:'cry',n:'Kriegsschrei',req:6,cd:12,mana:l=>10+l,desc:l=>`+${20+l*3}% Schaden für 10 Sekunden. Feinde in der Nähe weichen zurück und werden langsamer.`},
 {id:'leap',n:'Sprungschlag',req:9,cd:4,mana:l=>9+l,desc:l=>`Springt bis zu 7 Schritte weit, unverwundbar in der Luft, und schmettert ${160+l*18}% Waffenschaden in den Boden.`},
 {id:'multi',n:'Fächerschuss',req:1,cd:.45,mana:l=>4+Math.round(l*.6),desc:l=>`Schießt ${5+Math.floor(l/4)} Pfeile im Fächer, je ${60+l*6}% Waffenschaden.`},
 {id:'pierce',n:'Durchschlag',req:1,cd:.8,mana:l=>6+l,desc:l=>`Ein schwerer Pfeil, der alles durchbohrt: ${180+l*20}% Waffenschaden.`},
 {id:'trap',n:'Dornenfalle',req:3,cd:1,mana:l=>8+l,desc:l=>`Legt eine Falle, höchstens 3 zugleich. Sie zündet bei Feinden: ${Math.round(spellBase('trap',l))} Schaden und Gift.`},
 {id:'dash',n:'Schattenschritt',req:6,cd:3,mana:l=>6+l,desc:l=>`Huscht 5 Schritte weit, unverwundbar. Danach ${Math.min(3,2+l*.1).toFixed(1).replace('.',',')} Sekunden im Schatten: Gegner verlieren dich aus den Augen, bis du zuschlägst. 3 Sekunden lang +${30+l*3}% kritische Trefferchance.`},
 {id:'rain',n:'Pfeilregen',req:9,cd:5,mana:l=>14+l*2,desc:l=>`Lässt 2 Sekunden lang Pfeile auf ein Gebiet regnen: je Welle ${45+l*5}% Waffenschaden.`},
 {id:'venom',n:'Giftklinge',req:12,cd:14,mana:l=>12+l,desc:l=>`15 Sekunden lang vergiftet jeder Treffer: ${20+l*4}% des Schadens zusätzlich als Gift über 3 Sekunden.`},
 {id:'meteor',n:'Meteor',req:9,cd:3,mana:l=>16+l*2,desc:l=>`Ruft einen Meteor herab: ${Math.round(spellBase('meteor',l))} Feuerschaden, danach brennt der Boden.`},
 {id:'blink',n:'Aschesprung',req:6,cd:2.5,mana:l=>8+l,desc:l=>`Teleportiert dich bis zu 8 Schritte weit. Am Start und am Ziel bricht Feuer hervor: ${Math.round(spellBase('blink',l))} Schaden.`});
SKILLS.forEach(s=>SKBY[s.id]=s);
const CLS={
 wanderer:{n:'Wanderer',d:'Der alte Weg zwischen Klinge und Zauber. Von allem etwas.',skills:['whirl','fire','nova','charge','ward','chain'],stats:{str:15,dex:15,vit:15,ene:10},ts:null,wc:'sword',look:{}},
 krieger:{n:'Krieger',d:'Stahl und Zorn. Viel Leben, harte Schläge, springt mitten in die Feinde.',skills:['whirl','charge','slam','cry','leap','ward'],stats:{str:22,dex:13,vit:21,ene:5},ts:'krs0',wc:'sword',look:{legs:'darkbone'}},
 jaegerin:{n:'Jägerin',d:'Pfeile, Fallen und Gift. Schnell, wendig, tödlich aus der Ferne.',skills:['multi','pierce','trap','dash','rain','venom'],stats:{str:13,dex:25,vit:14,ene:10},ts:'jas0',wc:'dagger',look:{legs:'moss',torso:'moss'}},
 magier:{n:'Aschemagier',d:'Feuer, Frost und Blitz. Zerbrechlich, aber verheerend.',skills:['fire','nova','chain','meteor','blink','ward'],stats:{str:10,dex:12,vit:14,ene:26},ts:'mas0',wc:'staff',look:{legs:'robeV',torso:'robeV'}}};
const myCls=()=>wSetCls(CLS[(P&&P.cls)||'wanderer']||CLS.wanderer);
const mySk=()=>myCls().skills.map((id,i)=>{const s=SKBY[id];s.key=i+1;return s});
const clsStart=()=>myCls().ts;
function pickClass(){menuView='class';$('menu').hidden=false;
  $('mbox').innerHTML=`<h2>Wähle deinen Weg</h2><div class="clsgrid">${Object.entries(CLS).map(([k,c])=>`<button class="clscard" data-cls="${k}"><b>${c.n}</b><span>${c.d}</span><span class="clsk">${c.skills.map(id=>skImg(id)).join('')}</span><small>Stärke ${c.stats.str} · Geschick ${c.stats.dex} · Vitalität ${c.stats.vit} · Energie ${c.stats.ene}</small></button>`).join('')}</div><button class="mbtn" data-m="back">Zurück</button>`}
function startWeapon(c){const b=Object.values(BASE).filter(x=>x.slot==='weapon'&&x.cls===c).sort((a,b)=>a.lvl-b.lvl)[0];
  const it={id:UID++,b:b.n,name:b.n,slot:'weapon',cls:b.cls,rar:'normal',ilvl:1,dmg:b.dmg.slice(),speed:b.speed,twoH:b.twoH,mods:{},req:{lvl:1,str:0,dex:0}};if(b.cls==='staff')it.mods.spell=10+b.lvl*2;return it}
// damage of the hunter's arrows and other weapon-born projectiles
const pDmg=m=>((P.d.dmin+P.d.dmax)/2+P.d.ele)*m;
function pArrow(ang,dmg,o={}){const sp=o.sp||15;G.proj.push(Object.assign({x:P.x+Math.cos(ang)*.4,y:P.y+Math.sin(ang)*.4,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,owner:'p',dmg,kind:'arrow',r:.28,life:1.1},o))}
function castExt(id,l,ang,tx,ty){const m=G.map;
  if(id==='slam'){P.cast=.4;const n=12;for(let k=1;k<=n;k++){const d=k*.5,x=P.x+Math.cos(ang)*d,y=P.y+Math.sin(ang)*d;if(!walkable(x,y))break;setTimeout(()=>{gore(x,y,ang,4,GORE.rock,.6);smoke(x,y,2,'rgba(90,78,62,',6,.4);shock(x,y,.8,'200,180,140',.25,2)},k*25)}
    G.shake=Math.max(G.shake,6);sfx('boom');for(const e of m.enemies){if(e.dead)continue;const dx=e.x-P.x,dy=e.y-P.y,al=dx*Math.cos(ang)+dy*Math.sin(ang),pe=Math.abs(-dx*Math.sin(ang)+dy*Math.cos(ang));if(al>0&&al<6.2&&pe<1+e.r){weaponHit(e,1.4+l*.15);hitEnemy(e,0,{kb:.9,from:ang})}}}
  if(id==='cry'){P.cryT=10;P.cryB=20+l*3;shock(P.x,P.y,5,'255,120,60',.6,5);flash(P.x,P.y,1,60,'255,140,80',.3);G.shake=Math.max(G.shake,5);sfx('boom');ftext(P.x,P.y-.4,'Kriegsschrei!','#ff8a5a',true);
    for(const e of m.enemies){if(e.dead||hyp(e.x-P.x,e.y-P.y)>5)continue;e.slow=Math.max(e.slow,3);if(!e.boss)hitEnemy(e,0,{kb:1.4})}}
  if(id==='leap'){let d=Math.min(7,hyp(tx-P.x,ty-P.y));let ex=P.x,ey=P.y;for(let s=0;s<=d;s+=.25){const x=P.x+Math.cos(ang)*s,y=P.y+Math.sin(ang)*s;if(free(x,y,P.r)){ex=x;ey=y}}
    P.leap={sx:P.x,sy:P.y,tx:ex,ty:ey,t:0,dur:.5,l};P.iframe=.55;P.cast=0;sfx('roll')}
  if(id==='multi'){const n=5+Math.floor(l/4);sample('fire',.25,{rate:1.6});for(let k=0;k<n;k++)pArrow(ang+(k-(n-1)/2)*.13,pDmg(.6+l*.06))}
  if(id==='pierce'){pArrow(ang,pDmg(1.8+l*.2),{sp:20,pierce:true,big:true,life:.9});flash(P.x+Math.cos(ang)*.5,P.y+Math.sin(ang)*.5,.8,26,'255,240,200',.14);kick(ang+Math.PI,3)}
  if(id==='trap'){G.ptraps=(G.ptraps||[]).filter(t=>t.life>0);if(G.ptraps.length>=3)G.ptraps.shift();let d=Math.min(6,hyp(tx-P.x,ty-P.y)),x=P.x+Math.cos(ang)*d,y=P.y+Math.sin(ang)*d;if(!walkable(x,y)){x=P.x;y=P.y}
    G.ptraps.push({x,y,arm:.6,life:25,l,dmg:spellBase('trap',l)});sfx('pick');smoke(x,y,3,'rgba(60,70,40,',4,.3)}
  if(id==='dash'){let ex=P.x,ey=P.y;for(let s=0;s<=5;s+=.25){const x=P.x+Math.cos(ang)*s,y=P.y+Math.sin(ang)*s;if(!free(x,y,P.r))break;ex=x;ey=y;if(((s*4)|0)%2===0)P.ghosts.push({x,y,face:ang,t:0})}
    smoke(P.x,P.y,5,'rgba(40,30,60,',6,.3);P.x=ex;P.y=ey;P.iframe=.4;P.shadowT=3;P.shadowB=30+l*3;P.veilT=Math.min(3,2+l*.1);smoke(P.x,P.y,5,'rgba(40,30,60,',6,.3);sfx('roll');P.path=[]}
  if(id==='rain'){let d=Math.min(9,hyp(tx-P.x,ty-P.y));G.zones.push({k:'rain',x:P.x+Math.cos(ang)*d,y:P.y+Math.sin(ang)*d,r:2.5,t:0,dur:2,tick:.33,acc:.33,dmg:pDmg(.45+l*.05)})}
  if(id==='venom'){P.venomT=15;P.venomB=20+l*4;flash(P.x,P.y,1,40,'140,230,80',.3);for(let k=0;k<20;k++)fxp({k:'mote',x:P.x+rnd(-.5,.5),y:P.y+rnd(-.5,.5),z:rnd(.3,1.4),vx:rnd(-1,1),vy:rnd(-1,1),vz:rnd(0,1),life:.8,col:pick(['#9ae050','#d8ff9a']),s:rnd(1,2),g:0});sfx('cast')}
  if(id==='meteor'){let d=Math.min(10,hyp(tx-P.x,ty-P.y));G.zones.push({k:'meteor',x:P.x+Math.cos(ang)*d,y:P.y+Math.sin(ang)*d,r:2.4,t:0,dur:.9,dmg:spellBase('meteor',l)});sample('fire',.5,{rate:.7})}
  if(id==='blink'){let ex=P.x,ey=P.y;const d=Math.min(8,hyp(tx-P.x,ty-P.y));for(let s=0;s<=d;s+=.25){const x=P.x+Math.cos(ang)*s,y=P.y+Math.sin(ang)*s;if(free(x,y,P.r)){ex=x;ey=y}}
    const burst=(x,y)=>{boom(x,y,.9,'fire');for(const e of m.enemies)if(!e.dead&&hyp(e.x-x,e.y-y)<1.8+e.r)hitEnemy(e,spellBase('blink',l)*rnd(.85,1.15),{col:'#ffb070'})};burst(P.x,P.y);P.x=ex;P.y=ey;P.path=[];P.iframe=.25;camX+=0;burst(P.x,P.y);sfx('zap')}}
function updExt(dt){const m=G.map;
  if(P.cryT>0)P.cryT-=dt;if(P.shadowT>0)P.shadowT-=dt;if(P.veilT>0)P.veilT-=dt;if(P.venomT>0){P.venomT-=dt;if(Math.random()<dt*8)fxp({k:'mote',x:P.x+rnd(-.3,.3),y:P.y+rnd(-.3,.3),z:rnd(.5,1.2),vx:0,vy:0,vz:.6,life:.5,col:'#9ae050',s:1,g:0})}
  if(P.cryT>0&&Math.random()<dt*6)fxp({k:'ember',x:P.x+rnd(-.3,.3),y:P.y+rnd(-.3,.3),z:rnd(.5,1.4),vx:0,vy:0,vz:1,life:.5,col:'#ff7a3a',s:1,g:0});
  for(const z of G.zones){z.t+=dt;
    if(z.k==='rain'){z.acc+=dt;for(let q=0;q<3;q++){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'shard',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:3,vx:0,vy:0,vz:-14,life:.2,col:'#e8e2d0',s:1.4,rot:1.57,g:0})}
      if(z.acc>=z.tick){z.acc=0;sfx('hit');for(const e of m.enemies)if(!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r)hitEnemy(e,z.dmg*rnd(.85,1.15),{col:'#e8e2d0'})}}
    if(z.k==='meteor'&&!z.hit&&z.t>=z.dur){z.hit=true;boom(z.x,z.y,2,'fire');G.shake=Math.max(G.shake,8);sfx('boom');decal('scorch',z.x,z.y,2,40);for(const e of m.enemies)if(!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r)hitEnemy(e,z.dmg*rnd(.9,1.1),{col:'#ffb070',kb:.5,from:Math.atan2(e.y-z.y,e.x-z.x)});
      G.zones.push({k:'burn',x:z.x,y:z.y,r:2,t:0,dur:3,tick:.5,acc:0,dmg:z.dmg*.12})}
    if(z.k==='meteor'&&!z.hit&&Math.random()<.5)fxp({k:'ember',x:z.x+rnd(-.3,.3),y:z.y+rnd(-.3,.3),z:4*(1-z.t/z.dur)+.3,vx:0,vy:0,vz:-3,life:.3,col:'#ffc070',s:2,g:0});
    if(z.k==='burn'){z.acc+=dt;if(Math.random()<dt*20){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'ember',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:.1,vx:0,vy:0,vz:rnd(.8,2),life:rnd(.3,.7),col:pick(['#ffc070','#ff7a1a']),s:rnd(1,2),g:-.5})}
      if(z.acc>=z.tick){z.acc=0;for(const e of m.enemies)if(!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r)hitEnemy(e,z.dmg,{col:'#ff9a50'})}}}
  G.zones=G.zones.filter(z=>z.t<z.dur||(z.k==='meteor'&&!z.hit));
  for(const t of G.ptraps||[]){t.life-=dt;if(t.arm>0){t.arm-=dt;continue}const e=m.enemies.find(e=>!e.dead&&hyp(e.x-t.x,e.y-t.y)<1.2+e.r);
    if(e){t.life=0;sfx('boom');for(let k=0;k<24;k++){const a=k/24*6.283;fxp({k:'shard',x:t.x,y:t.y,z:.2,vx:Math.cos(a)*7,vy:Math.sin(a)*7,vz:rnd(1,3),life:.4,col:pick(['#c8b890','#6a8a3a','#e8e0c8']),s:rnd(1.5,2.5),rot:a,g:6})}
      shock(t.x,t.y,2.2,'160,220,90',.4,3);for(const q of m.enemies)if(!q.dead&&hyp(q.x-t.x,q.y-t.y)<2.2+q.r){hitEnemy(q,t.dmg*rnd(.9,1.1),{col:'#b8e070'});q.dotT=3;q.dotD=t.dmg*.15}}}
  if(G.ptraps)G.ptraps=G.ptraps.filter(t=>t.life>0);
  if(P.leap){const L=P.leap;L.t+=dt;const p=Math.min(1,L.t/L.dur);P.x=L.sx+(L.tx-L.sx)*p;P.y=L.sy+(L.ty-L.sy)*p;if(Math.random()<.5)P.ghosts.push({x:P.x,y:P.y,face:P.face,t:.1});
    if(p>=1){P.leap=null;slamFx(P.x,P.y,2.4,true);G.shake=Math.max(G.shake,10);hitstop(.12);sfx('boom');decal('crack',P.x,P.y,1.6,40);for(const e of m.enemies)if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<2.4+e.r){weaponHit(e,1.6+L.l*.18);hitEnemy(e,0,{kb:1,from:Math.atan2(e.y-P.y,e.x-P.x)})}}}}
function drawExtGround(){const el=(x,y,r)=>{const[sx,sy]=iso(x,y);ctx.beginPath();ctx.ellipse(sx,sy,r*45,r*22.6,0,0,7)};
  for(const z of G.zones){if(z.k==='meteor'&&!z.hit){const p=z.t/z.dur;el(z.x,z.y,z.r);ctx.fillStyle=`rgba(255,110,30,${.08+p*.12})`;ctx.fill();ctx.strokeStyle='rgba(255,140,60,.7)';ctx.lineWidth=1.5;ctx.stroke();el(z.x,z.y,z.r*p);ctx.strokeStyle='rgba(255,200,120,.6)';ctx.stroke()}
    if(z.k==='rain'){el(z.x,z.y,z.r);ctx.strokeStyle='rgba(232,226,208,.35)';ctx.lineWidth=1;ctx.stroke()}if(z.k==='burn'){el(z.x,z.y,z.r);ctx.fillStyle='rgba(255,90,20,.12)';ctx.fill()}}
  for(const t of G.ptraps||[]){const[sx,sy]=iso(t.x,t.y),a=t.arm>0?.5:1;ctx.globalAlpha=a;ctx.fillStyle='#2a2414';ctx.beginPath();ctx.ellipse(sx,sy,9,4.5,0,0,7);ctx.fill();ctx.strokeStyle='#8a7a4a';ctx.lineWidth=1;ctx.stroke();
    ctx.strokeStyle='#c8b890';for(let k=0;k<6;k++){const q=k/6*6.283;ctx.beginPath();ctx.moveTo(sx+Math.cos(q)*3,sy+Math.sin(q)*1.5);ctx.lineTo(sx+Math.cos(q)*8,sy+Math.sin(q)*4-3);ctx.stroke()}ctx.globalAlpha=1}}


