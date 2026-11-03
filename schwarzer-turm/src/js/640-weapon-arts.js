/* ---------- weapon arts: twin blades, long blades, hammers and spears bring their own six skills · levels belong to the slot ---------- */
// what sits in slots 1–6 follows the weapon in hand; put it away and the class skills return. A point spent on a slot stays with the slot,
// whichever skill happens to fill it
var WSETS={
  dual:{n:'Doppelklingen',ids:['d_flurry','d_dash','d_cross','d_fan','d_dance','d_exec'],rgb:'200,225,255',pl:['#1a2440','#05070e'],c:['#ffffff','#cfe0ff','#7aa4ff','#1a2a6a']},
  great:{n:'Langklinge',ids:['g_cleave','g_lunge','g_quake','g_parry','g_spin','g_judg'],rgb:'255,220,170',pl:['#3a2410','#0a0502'],c:['#fff4d0','#ffd890','#d09040','#4a2a08']},
  hammer:{n:'Hammer',ids:['h_smash','h_quake','h_leap','h_throw','h_storm','h_titan'],rgb:'255,190,110',pl:['#3a1a08','#0a0402'],c:['#fff0d0','#ffc070','#c06a20','#3a1404']},
  spear:{n:'Speer',ids:['sp_thrust','sp_vault','sp_sweep','sp_throw','sp_wall','sp_rain'],rgb:'190,255,200',pl:['#10301a','#020a04'],c:['#f0fff0','#b0f0b8','#50b060','#0e3a18']}},WSC={};
const isDualB=n=>{const b=BASE[n];return!!(b&&(b.dual||(b.shape&&BASE[b.shape]&&BASE[b.shape].dual)))};
function wSetKey(){const w=P&&P.eq&&P.eq.weapon;if(!w||(P.d&&P.d.okS&&!P.d.okS.has(w)))return null;const sh=SH(w.b);
  if(isDualB(w.b))return'dual';if(w.cls==='great'||sh==='Langschwert'||sh==='Runenklinge')return'great';if(w.cls==='mace')return'hammer';if(w.cls==='spear')return'spear';return null}
function wSetCls(c){if(!P||typeof WSETS==='undefined')return c;const k=wSetKey();if(!k)return c;const ck=c.n+'|'+k;if(WSC[ck])return WSC[ck];
  const ids=WSETS[k].ids;ids.forEach((id,i)=>{const s=SKBY[id],o=SKBY[c.skills[i]];if(s&&o)s.req=o.req});return WSC[ck]=Object.assign({},c,{skills:ids,wset:k})}
// slot levels: P.slv mirrors the six slots; switching sets writes them into whichever skills fill the slots now
function slotSync(){if(!P||!P.sk)return;const base=(CLS[P.cls||'wanderer']||CLS.wanderer).skills,a=myCls().skills,key=a.join();
  if(!Array.isArray(P.slv))P.slv=base.map(id=>P.sk[id]||0);
  if(P._ska!==key){for(let i=0;i<6;i++)P.sk[a[i]]=P.slv[i]||0;const first=P._ska==null;P._ska=key;if(!a.includes(P.sel))P.sel=a[0];if(!first&&G.state==='play'){const k=myCls().wset;log(k?WSETS[k].n+': die Fertigkeiten folgen der Waffe.':'Die Fertigkeiten deiner Klasse kehren zurück.','#c8b890')}
    try{buildBelt();if(!$('pSkill').hidden)buildSkills()}catch(e){}}
  else for(let i=0;i<6;i++){const v=P.sk[a[i]]||0;if(v!==P.slv[i])P.slv[i]=v}}
const _saveDataW=saveData;saveData=function(){const d=_saveDataW();if(d&&P&&P.slv)d.p.slv=P.slv.slice();return d};
const _recalcW=recalc;recalc=function(){_recalcW();try{slotSync()}catch(e){}};
// helpers: hits in an arc, a circle or a line, a leap that lands, a short sprint
const wFoes=()=>G.map.enemies.filter(e=>!e.dead&&!e.ally);
function wHit(e,mult,o,fx,fy){weaponHit(e,mult);if(o.kb)hitEnemy(e,0,{kb:o.kb,from:Math.atan2(e.y-fy,e.x-fx)});if(o.slow)e.slow=Math.max(e.slow||0,o.slow);if(o.bleed&&!e.dead){e.dotT=3;e.dotD=Math.max(e.dotD||0,o.bleed)}}
function hitArc(ang,r,arc,mult,o={}){let n=0;for(const e of wFoes()){const dx=e.x-P.x,dy=e.y-P.y,d=hyp(dx,dy);if(d<r+e.r&&(d<.5||Math.abs(angDiff(Math.atan2(dy,dx),ang))<arc/2)){wHit(e,o.exec&&e.hp/e.max<.3?mult*2:mult,o,P.x,P.y);n++}}return n}
function hitCirc(x,y,r,mult,o={}){let n=0;for(const e of wFoes())if(hyp(e.x-x,e.y-y)<r+e.r&&(!o.set||!o.set.has(e))){o.set&&o.set.add(e);wHit(e,o.exec&&e.hp/e.max<.3?mult*2:mult,o,x,y);n++}return n}
function hitLine(x,y,ang,len,w,mult,o={}){const c=Math.cos(ang),s=Math.sin(ang);let n=0;for(const e of wFoes()){const dx=e.x-x,dy=e.y-y,al=dx*c+dy*s,pe=Math.abs(-dx*s+dy*c);if(al>-.3&&al<len&&pe<w+e.r){wHit(e,mult,o,x,y);n++}}return n}
const wAvg=()=>P&&P.d?(P.d.dmin+P.d.dmax)/2:5;
const WL={land:null};
function leapTo(tx,ty,maxD,dur,l,fn){const a=Math.atan2(ty-P.y,tx-P.x),d=Math.min(maxD,Math.max(1.5,hyp(tx-P.x,ty-P.y)));let x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(!free(x,y,.3))[x,y]=nearWalk(x,y);
  P.leap={sx:P.x,sy:P.y,tx:x,ty:y,t:0,dur,l};P.iframe=dur+.1;P.cast=0;P.face=a;WL.land={ref:P.leap,fn}}
const _updateW=update;update=function(dt){_updateW(dt);if(WL.land&&P&&P.leap!==WL.land.ref){const f=WL.land.fn;WL.land=null;if(f&&!P.dead)f()}};
const later=(ms,f)=>setTimeout(()=>{if(P&&!P.dead&&G.state==='play')f()},ms);
const dir=a=>[Math.cos(a),Math.sin(a)];
// the skills
const WSK={
 d_flurry(l,a){for(let k=0;k<4;k++)later(k*85,()=>{const q=P.face+(k%2?.4:-.4);slashFx(P.x,P.y,q,1.7,1.75,'225,235,255',.14,.75,.32);hitArc(P.face,1.9,1.9,.5+l*.05);if(k%2)sample('sword',.35)})},
 d_dash(l,a,tx,ty){const d=Math.min(6,Math.max(2.5,hyp(tx-P.x,ty-P.y)));const[c,s]=dir(a),sx=P.x,sy=P.y;P.dash={ang:a,left:d,l:Math.round(l*.6)};later(110,()=>{hitLine(sx,sy,a,d,.7,.8+l*.08);slashFx(sx+c*d*.5,sy+s*d*.5,a,.5,d*.55,'200,215,255',.2,.6,.2)})},
 d_cross(l,a){const b=wAvg()*.18*(1+l*.1);slashFx(P.x,P.y,a+.55,1.4,2,'235,240,255',.2,.8,.4);later(70,()=>slashFx(P.x,P.y,a-.55,1.4,2,'235,240,255',.2,.8,.4));hitArc(a,2.1,1.7,1.5+l*.14,{bleed:b});sample('sword',.5)},
 d_fan(l,a){const x0=P.x,y0=P.y,n=7;for(let i=0;i<n;i++){const q=a+(i-(n-1)/2)*.17,[c,s]=dir(q),hit=new Set();for(let k=1;k<=11;k++)setTimeout(()=>{if(!G.map)return;const x=x0+c*k*.65,y=y0+s*k*.65;if(!walkable(x,y))return;
     fxp({k:'shard',x,y,z:.7,vx:c*3,vy:s*3,vz:0,life:.12,col:pick(['#ffffff','#cfe0ff','#9ab8e8']),s:2.2,rot:q+k,g:0});hitCirc(x,y,.55,.7+l*.07,{set:hit})},k*38)}},
 d_dance(l){let k=0;const iv=setInterval(()=>{if(!P||P.dead||G.state!=='play'||++k>10){clearInterval(iv);return}P.whirl=.3;hitCirc(P.x,P.y,2,.45+l*.05);if(k%2)sample('sword',.25)},250);ftext(P.x,P.y-.4,'Klingentanz','#cfe0ff',true)},
 d_exec(l,a,tx,ty){leapTo(tx,ty,6,.38,Math.round(l*.5),()=>{slashFx(P.x,P.y,P.face,6.28,1.9,'235,240,255',.25,.7,.5);hitCirc(P.x,P.y,1.9,2.4+l*.25,{exec:1});flash(P.x,P.y,.7,50,'220,230,255',.25)})},
 g_cleave(l,a){slashFx(P.x,P.y,a,2.8,2.6,'255,235,200',.2,.8,.5);hitArc(a,2.7,2.8,1.2+l*.12,{kb:.4});sample('sword',.5,{rate:.85})},
 g_lunge(l,a){const sx=P.x,sy=P.y;P.dash={ang:a,left:3.5,l:Math.round(l*.5)};later(90,()=>{hitLine(sx,sy,a,4.3,.7,1.6+l*.15);slashFx(sx,sy,a,.35,4.2,'255,235,200',.18,.7,.3)})},
 g_quake(l,a){const set=new Set();for(let k=1;k<=8;k++)later(k*45,()=>{const x=P.x+Math.cos(a)*k*.8,y=P.y+Math.sin(a)*k*.8;if(!walkable(x,y))return;shock(x,y,1.1,'255,220,160',.35,3);smoke(x,y,2,'rgba(90,78,62,',6,.4);hitCirc(x,y,1.1,1+l*.1,{set,kb:.5})});G.shake=Math.max(G.shake,6);sfx('boom')},
 g_parry(l){P.ward=Math.round(P.d.life*(.22+l*.02));P.wardMax=P.ward;P.wardT=8;shock(P.x,P.y,1.6,'255,230,180',.5,4);flash(P.x,P.y,.8,40,'255,235,200',.3);ftext(P.x,P.y-.5,'Klingenwall','#ffd890',true)},
 g_spin(l){for(let k=0;k<6;k++)later(k*150,()=>{P.whirl=.3;hitCirc(P.x,P.y,2.3,.75+l*.07);if(k%2)sample('sword',.3,{rate:.8})})},
 g_judg(l,a,tx,ty){leapTo(tx,ty,7,.55,Math.round(l*.8),()=>{shock(P.x,P.y,3,'255,220,150',.6,5);flash(P.x,P.y,.6,70,'255,230,170',.35);hitCirc(P.x,P.y,3,1.5+l*.15,{slow:2})})},
 h_smash(l,a){later(110,()=>{const[c,s]=dir(P.face),x=P.x+c*1.2,y=P.y+s*1.2;slamFx(x,y,1.4,false);hitCirc(x,y,1.5,1.8+l*.15,{kb:1});G.shake=Math.max(G.shake,5);sfx('boom')})},
 h_quake(l){slamFx(P.x,P.y,3.5,true);hitCirc(P.x,P.y,3.5,1.1+l*.1,{slow:2});decal('crack',P.x,P.y,1.4,30);G.shake=Math.max(G.shake,8);sfx('boom')},
 h_leap(l,a,tx,ty){leapTo(tx,ty,6,.5,l,()=>{decal('crack',P.x,P.y,1.8,40)})},
 h_throw(l,a){const[c,s]=dir(a),x0=P.x,y0=P.y;let k=0;const step=()=>{if(!G.map)return;k++;const x=x0+c*k*.5,y=y0+s*k*.5;const e=wFoes().find(e=>hyp(e.x-x,e.y-y)<.6+e.r);
   fxp({k:'shard',x,y,z:.9,vx:0,vy:0,vz:0,life:.1,col:'#d0c8b8',s:3,rot:k*1.3,g:0});if(e||k>=16||!walkable(x,y)){slamFx(x,y,1.6,false);hitCirc(x,y,1.6,2+l*.18,{kb:.8});sfx('boom');return}setTimeout(step,28)};step()},
 h_storm(l,a,tx,ty){if(typeof blitzSnd==='function')blitzSnd();for(let k=0;k<3;k++)later(k*150,()=>{const x=tx+rnd(-1.4,1.4),y=ty+rnd(-1.4,1.4);G.bolts.push({a:[x-1.6,y-1.6],b:[x,y],t:.25});G.bolts.push({a:[x-1.6,y-1.6],b:[x-.6,y-1.2],t:.18});
   flash(x,y,1.2,60,'200,215,255',.35);shock(x,y,1.3,'180,200,255',.3,3);addLight(x,y,240,1,.3);sparks(x,y,.3,0,10,['#ffffff','#cfe0ff','#7aa4ff'],7,3.2);hitCirc(x,y,1.3,1.3+l*.12);G.shake=Math.max(G.shake,3)})},
 h_titan(l){P.cast=.55;G.rings.push({x:P.x,y:P.y,r:.3,max:4,v:7,col:'#ffc070',hit:new Set(),dmg:0});later(450,()=>{slamFx(P.x,P.y,4,true);boom(P.x,P.y,.8,'fire');hitCirc(P.x,P.y,4,3+l*.25,{kb:1.2});decal('crack',P.x,P.y,2.2,50);G.shake=Math.max(G.shake,12);hitstop(.12);sfx('boom')})},
 sp_thrust(l,a){slashFx(P.x,P.y,a,.35,3.3,'220,255,220',.16,.75,.25);hitLine(P.x,P.y,a,3.4,.55,1.25+l*.12);sample('sword',.4,{rate:1.2})},
 sp_vault(l,a,tx,ty){P.dash={ang:a,left:2.4,l:0};later(170,()=>{P.dash=null;const[c,s]=dir(a);leapTo(P.x+c*3.2,P.y+s*3.2,3.4,.4,Math.round(l*.4),()=>{slashFx(P.x,P.y,a,.6,2,'220,255,220',.2,.8,.3);hitCirc(P.x,P.y,1.8,1.8+l*.18,{kb:.5})})})},
 sp_sweep(l){P.whirl=.35;slashFx(P.x,P.y,P.face,6.28,2.5,'220,255,220',.22,.7,.45);hitCirc(P.x,P.y,2.6,1.1+l*.1,{kb:.9});sample('sword',.4,{rate:.9})},
 sp_throw(l,a){const[c,s]=dir(a),x0=P.x,y0=P.y;for(let k=1;k<=18;k++)setTimeout(()=>{if(!G.map)return;fxp({k:'shard',x:x0+c*k*.5,y:y0+s*k*.5,z:.9,vx:c*4,vy:s*4,vz:0,life:.1,col:'#e8f0d8',s:2.4,rot:a,g:0})},k*16);later(120,()=>hitLine(x0,y0,a,9,.5,1.8+l*.15))},
 sp_wall(l){let k=0;const iv=setInterval(()=>{if(!P||P.dead||G.state!=='play'||++k>10){clearInterval(iv);return}shock(P.x,P.y,2.2,'190,255,200',.3,2);for(let i=0;i<6;i++){const q=i/6*6.283+k;fxp({k:'shard',x:P.x+Math.cos(q)*1.8,y:P.y+Math.sin(q)*1.8,z:.2,vz:3,life:.25,col:'#e0f0d0',s:2,rot:q,g:6})}hitCirc(P.x,P.y,2.2,.6+l*.06)},500);ftext(P.x,P.y-.5,'Lanzenwall','#b0f0b8',true)},
 sp_rain(l,a,tx,ty){for(let k=0;k<10;k++)later(k*100,()=>{const r=Math.sqrt(Math.random())*3,q=rnd(0,6.283),x=tx+Math.cos(q)*r,y=ty+Math.sin(q)*r;fxp({k:'shard',x,y,z:3.5,vx:0,vy:0,vz:-14,life:.25,col:'#e8f0d8',s:2.6,rot:1.57,g:0});
   later(220,()=>{shock(x,y,1,'190,255,200',.3,2);smoke(x,y,2,'rgba(90,78,62,',5,.3);hitCirc(x,y,1,1+l*.1)})})}};
const pct=v=>Math.round(v*100)+'%';
SKILLS.push(
 {id:'d_flurry',n:'Klingenwirbel',req:1,cd:.8,mana:l=>4+l,desc:l=>`Vier schnelle Schnitte nach vorn, je ${pct(.5+l*.05)} Waffenschaden.`},
 {id:'d_dash',n:'Schattenschnitt',req:1,cd:3,mana:l=>8+l,desc:l=>`Du schneidest dich bis zu 6 Schritte durch die Reihen: ${pct(.8+l*.08)} Waffenschaden auf dem Weg, am Ende ein Hieb.`},
 {id:'d_cross',n:'Kreuzschnitt',req:3,cd:2,mana:l=>7+l,desc:l=>`Zwei Klingen schneiden ein X: ${pct(1.5+l*.14)} Waffenschaden, die Wunden bluten 3 Sekunden.`},
 {id:'d_fan',n:'Klingenfächer',req:6,cd:4,mana:l=>10+l,desc:l=>`Wirft sieben Wurfklingen im Fächer, jede trifft für ${pct(.7+l*.07)} Waffenschaden.`},
 {id:'d_dance',n:'Klingentanz',req:9,cd:10,mana:l=>14+l,desc:l=>`2,5 Sekunden lang wirbeln beide Klingen um dich: viermal pro Sekunde ${pct(.45+l*.05)} Waffenschaden im Umkreis.`},
 {id:'d_exec',n:'Todesreigen',req:15,cd:8,mana:l=>18+l*2,desc:l=>`Sprung zum Ziel, dann ein Rundschnitt für ${pct(2.4+l*.25)} Waffenschaden. Gegner unter 30% Leben trifft er doppelt.`},
 {id:'g_cleave',n:'Weiter Schwung',req:1,cd:.9,mana:l=>5+l,desc:l=>`Ein weiter Bogen vor dir: ${pct(1.2+l*.12)} Waffenschaden, stößt zurück.`},
 {id:'g_lunge',n:'Ausfall',req:1,cd:3,mana:l=>8+l,desc:l=>`Ein Sprung nach vorn mit gestreckter Klinge: ${pct(1.6+l*.15)} Waffenschaden in einer Linie.`},
 {id:'g_quake',n:'Erdspalter',req:3,cd:4,mana:l=>10+l,desc:l=>`Die Klinge reißt den Boden auf, 6 Schritte weit: ${pct(1+l*.1)} Waffenschaden.`},
 {id:'g_parry',n:'Klingenwall',req:6,cd:14,mana:l=>12+l,desc:l=>`8 Sekunden lang fängt die Klinge ${Math.round(22+l*2)}% deines Lebens an Schaden ab.`},
 {id:'g_spin',n:'Sturmwirbel',req:9,cd:6,mana:l=>14+l,desc:l=>`Sechs Umdrehungen in einer Sekunde, je ${pct(.75+l*.07)} Waffenschaden im Umkreis.`},
 {id:'g_judg',n:'Richtspruch',req:15,cd:9,mana:l=>18+l*2,desc:l=>`Ein hoher Sprung, die Klinge voran: ${pct(1.5+l*.15)} Waffenschaden im weiten Kreis, Getroffene werden langsam.`},
 {id:'h_smash',n:'Schmetterschlag',req:1,cd:1,mana:l=>5+l,desc:l=>`Ein schwerer Schlag auf den Boden vor dir: ${pct(1.8+l*.15)} Waffenschaden, wirft Gegner zurück.`},
 {id:'h_quake',n:'Bebenring',req:1,cd:4,mana:l=>9+l,desc:l=>`Der Boden bebt rings um dich: ${pct(1.1+l*.1)} Waffenschaden, Gegner werden langsam.`},
 {id:'h_leap',n:'Sprungschmetterer',req:3,cd:5,mana:l=>10+l,desc:l=>`Sprung zum Ziel, Landung mit ${pct(1.6+l*.18)} Waffenschaden.`},
 {id:'h_throw',n:'Hammerwurf',req:6,cd:3,mana:l=>9+l,desc:l=>`Der Hammer fliegt bis zum ersten Gegner und schlägt dort ein: ${pct(2+l*.18)} Waffenschaden im Umkreis.`},
 {id:'h_storm',n:'Donnerhammer',req:9,cd:7,mana:l=>14+l,desc:l=>`Drei Blitze fahren am Ziel herab, je ${pct(1.3+l*.12)} Waffenschaden.`},
 {id:'h_titan',n:'Titanenschlag',req:15,cd:10,mana:l=>20+l*2,desc:l=>`Ausholen, dann ein Schlag, der alles im Umkreis von 4 Schritten trifft: ${pct(3+l*.25)} Waffenschaden.`},
 {id:'sp_thrust',n:'Durchstich',req:1,cd:.8,mana:l=>4+l,desc:l=>`Ein langer Stoß, der durch alle Gegner in der Linie geht: ${pct(1.25+l*.12)} Waffenschaden.`},
 {id:'sp_vault',n:'Stabsprung',req:1,cd:4,mana:l=>9+l,desc:l=>`Anlauf, Sprung am Speer, Landung mit gesenkter Spitze: ${pct(1.8+l*.18)} Waffenschaden.`},
 {id:'sp_sweep',n:'Rundschlag',req:3,cd:3,mana:l=>8+l,desc:l=>`Der Schaft fegt einmal im Kreis: ${pct(1.1+l*.1)} Waffenschaden, stößt Gegner weg.`},
 {id:'sp_throw',n:'Speerwurf',req:6,cd:2.5,mana:l=>8+l,desc:l=>`Ein geworfener Speer, der 9 Schritte weit alles durchbohrt: ${pct(1.8+l*.15)} Waffenschaden.`},
 {id:'sp_wall',n:'Lanzenwall',req:9,cd:12,mana:l=>14+l,desc:l=>`5 Sekunden lang sticht ein Ring aus Spitzen jeden, der dir zu nahe kommt: zweimal pro Sekunde ${pct(.6+l*.06)} Waffenschaden.`},
 {id:'sp_rain',n:'Speerregen',req:15,cd:9,mana:l=>18+l*2,desc:l=>`Zehn Speere fallen auf das Ziel herab, je ${pct(1+l*.1)} Waffenschaden.`});
for(const s of SKILLS)SKBY[s.id]=s;
Object.assign(ANK,{d_flurry:'thrust',d_cross:'thrust',d_fan:'fire',d_dance:'nova',g_quake:'stomp',g_parry:'ward',h_smash:'stomp',h_quake:'stomp',h_throw:'fire',h_storm:'sky',h_titan:'stomp',sp_thrust:'thrust',sp_throw:'fire',sp_wall:'ward',sp_rain:'sky'});
const _castExtW=castExt;castExt=function(id,l,ang,tx,ty){const f=WSK[id];if(f){f(l,ang,tx,ty);return}return _castExtW(id,l,ang,tx,ty)};
// icons: the set's plate and glow, with a motif per skill
const WMOT={d_flurry:'slashes',d_dash:'dash',d_cross:'cross',d_fan:'fan',d_dance:'spin',d_exec:'leap',g_cleave:'arc',g_lunge:'dash',g_quake:'line',g_parry:'shield',g_spin:'spin',g_judg:'leap',
  h_smash:'hammer',h_quake:'ring',h_leap:'leap',h_throw:'throw',h_storm:'bolt',h_titan:'burst',sp_thrust:'thrust',sp_vault:'leap',sp_sweep:'spin',sp_throw:'throw',sp_wall:'ring',sp_rain:'rain'};
function wIcons(){for(const[k,S]of Object.entries(WSETS))for(const id of S.ids){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d',{willReadFrequently:true});
  const q=g.createRadialGradient(16,14,2,16,16,24);q.addColorStop(0,S.pl[0]);q.addColorStop(1,S.pl[1]);g.fillStyle=q;g.fillRect(0,0,32,32);
  const gl=g.createRadialGradient(16,16,0,16,16,15);gl.addColorStop(0,`rgba(${S.rgb},.45)`);gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,32,32);
  g.lineCap='round';const L=(x0,y0,x1,y1,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()},A=(r,a0,a1,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.arc(16,16,r,a0,a1);g.stroke()},C=S.c,blade=(x0,y0,x1,y1)=>{L(x0,y0,x1,y1,3,C[3]);L(x0,y0,x1,y1,1.6,C[1]);L(x0,y0,x0+(x1-x0)*.25,y0+(y1-y0)*.25,3,'#5a3a1a')};
  const m=WMOT[id];
  if(m==='slashes'){for(let i=0;i<3;i++)A(9+i*3,-2.4+i*.3,-.6+i*.3,1.6,C[i])}
  else if(m==='cross'){blade(6,26,26,6);blade(26,26,6,6)}
  else if(m==='dash'){blade(8,24,26,6);for(let i=0;i<3;i++)L(3+i*3,18+i*3,9+i*3,12+i*3,1,C[2])}
  else if(m==='fan'){for(let i=-2;i<=2;i++){const q=-1.57+i*.32;blade(16,27,16+Math.cos(q)*13,27+Math.sin(q)*13)}}
  else if(m==='spin'){A(10,0,5.2,2,C[1]);A(6,2,6.6,1.4,C[2]);blade(16,16,27,9)}
  else if(m==='leap'){g.strokeStyle=C[2];g.lineWidth=1.4;g.beginPath();g.moveTo(5,26);g.quadraticCurveTo(14,0,25,22);g.stroke();blade(20,10,27,25)}
  else if(m==='arc'){A(11,-2.8,-.2,3,C[1]);A(13,-2.6,-.4,1.2,C[0]);blade(8,24,24,8)}
  else if(m==='line'){blade(5,27,13,19);for(let i=0;i<4;i++){L(13+i*4,19-i*4,16+i*4,14-i*4,1.6,C[2-i%2])}}
  else if(m==='shield'){blade(16,28,16,4);A(11,3.6,5.8,2.4,C[1]);A(11,-.3,1.9,2.4,C[1])}
  else if(m==='hammer'){L(8,26,20,10,2.4,'#6a4a2a');g.fillStyle=C[2];g.save();g.translate(21,9);g.rotate(.9);g.fillRect(-7,-4,14,8);g.fillStyle=C[1];g.fillRect(-7,-4,14,2);g.restore()}
  else if(m==='ring'){A(11,0,6.3,2.4,C[1]);A(7,0,6.3,1.2,C[2]);g.fillStyle=C[0];g.fillRect(14,14,4,4)}
  else if(m==='throw'){for(let i=0;i<3;i++)L(4+i*2,24-i*5,10+i*2,22-i*5,1,C[2]);blade(12,22,27,7)}
  else if(m==='bolt'){g.strokeStyle=C[0];g.lineWidth=2;g.beginPath();g.moveTo(18,3);g.lineTo(11,15);g.lineTo(18,15);g.lineTo(12,29);g.stroke();g.strokeStyle=C[2];g.lineWidth=1;g.stroke()}
  else if(m==='burst'){for(let i=0;i<10;i++){const q=i/10*6.283;L(16+Math.cos(q)*4,16+Math.sin(q)*4,16+Math.cos(q)*13,16+Math.sin(q)*13,1.6,C[i%3])}g.fillStyle=C[0];g.fillRect(13,13,6,6)}
  else if(m==='thrust'){blade(4,28,28,4);L(20,12,26,4,1,C[0])}
  else if(m==='rain'){for(let i=0;i<4;i++)blade(6+i*6,3+i%2*4,6+i*6,20+i%2*4);L(3,29,29,29,1.4,C[2])}
  g.fillStyle='#030202';g.fillRect(0,0,32,1);g.fillRect(0,31,32,1);g.fillRect(0,0,1,32);g.fillRect(31,0,1,32);g.fillStyle='rgba(255,230,190,.25)';g.fillRect(1,1,30,1);g.fillRect(1,1,1,30);
  quantize(g,32,32);SKIC[id]=c.toDataURL()}}
const _addSkillIconsW=addSkillIcons;addSkillIcons=function(){_addSkillIconsW();wIcons()};
const _updForgeW=updForge;updForge=function(dt){_updForgeW(dt);if(P&&G.state!=='title')slotSync()};

