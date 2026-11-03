/* ---------- endgame: tower rifts from the rift stone, nightmare and hell, local records ---------- */
const DIFF=[{n:'Normal',hp:1,dmg:1,xp:1,il:0,mf:0},{n:'Albtraum',hp:2.4,dmg:1.7,xp:2.2,il:8,mf:40},{n:'Hölle',hp:5,dmg:2.6,xp:4,il:16,mf:90}];
const RMOD={eisern:{n:'Eisern',d:'Gegner haben 50% mehr Leben'},rasend:{n:'Rasend',d:'Gegner sind 25% schneller'},dicht:{n:'Dicht',d:'Doppelt so viele Gegner'},glutblut:{n:'Glutblut',d:'Gefallene Gegner bersten in Flammen'},gierig:{n:'Gierig',d:'Jeder Kill bringt zusätzliche Glut'},elite:{n:'Erlesen',d:'Mehr Champions'}};
const riftMl=lv=>4+lv*3;
const fmtT=t=>{t=Math.round(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
const riftPts=e=>e.rank==='unique'?8:e.rank==='champ'?3:e.rank==='minion'?2:1;
const diff=()=>(P&&P.diff)||0;

// difficulty scales every foe and every find
const _makeEnemyD=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyD(vid,x,y,rank),D=DIFF[diff()];if(D.hp>1){e.hp*=D.hp;e.max=e.hp;e.dmg=e.dmg.map(v=>v*D.dmg);e.xp*=D.xp;e.sub+=' · '+D.n}return e};
const _makeBossD=makeBoss;makeBoss=function(f,x,y){const e=_makeBossD(f,x,y),D=DIFF[diff()];if(D.hp>1){e.hp*=D.hp;e.max=e.hp;e.dmg=e.dmg.map(v=>v*D.dmg);e.xp*=D.xp}return e};
const _makeWBossD=makeWBoss;makeWBoss=function(i,x,y){const e=_makeWBossD(i,x,y),D=DIFF[diff()];if(D.hp>1){e.hp*=D.hp;e.max=e.hp;e.dmg=e.dmg.map(v=>v*D.dmg);e.xp*=D.xp;e.sub+=' · '+D.n}return e};
const _makeItemD=makeItem;makeItem=function(ilvl,o){return _makeItemD(ilvl+DIFF[diff()].il,o)};
const _recalcD=recalc;recalc=function(){_recalcD();if(P&&P.d)P.d.mf+=DIFF[diff()].mf};
function setDiff(d){if(d===diff()||d>(P.diffMax||0))return;G.dstore=G.dstore||{};G.dstore[diff()]={owBoss:G.owBoss,bossDead:G.bossDead};
  const s=G.dstore[d]||{owBoss:{},bossDead:{}};G.owBoss=s.owBoss;G.bossDead=s.bossDead;P.diff=d;for(const k in G.maps)if(k!=='0')delete G.maps[k];G.lit={0:true};G.owClear=new Set();
  closeDialog();recalc();if(G.map.world)owRestart();banner(DIFF[d].n.toUpperCase(),d?`Gegner ×${DIFF[d].hp} Leben · Beute +${DIFF[d].il} Stufen · +${DIFF[d].mf}% Magiefund`:'Die Welt kehrt zur Ruhe zurück','boss',3600);sfx('boom');G.shake=10;save()}

// the rift stone stands on the hill beside the tower
function riftStoneTick(){const m=G.map;if(!m||!m.world||!m.home||m.home.objs.some(o=>o.type==='riftstone'))return;
  const od=m.home.objs.find(o=>o.type==='merchant');if(!od)return;const prev=G.map;const[x,y]=nearWalk(od.x+3.2,od.y-2.4);m.home.objs.push({type:'riftstone',x,y,name:'Riss-Stein'});m.ac=null;owTick()}
function openRiftStone(){const d=$('dialog'),mx=P.riftMax||1,rec=(P.recs&&P.recs.rift)||{},ok=G.maxFloor>=3||P.lvl>=10;
  let h='<h2>Riss-Stein</h2>';
  if(!ok)h+='<p class="hint">Der Stein ist kalt. Steig bis Ebene 3 hinab und bezwinge den Hügeltyrann, dann öffnet er Risse in den Turm.</p>';
  else{h+='<p class="hint">Jeder Riss ist eine fremde Ebene des Turms mit eigenen Gesetzen. Besiege genug Gegner, dann erscheint ein Risswächter. Schließ den Riss, um den nächsten zu öffnen. Tod schließt den Riss, kostet aber keine Glut.</p><h3 class="dh">Turm-Risse</h3><div class="travel rifts">';
    for(let l=Math.max(1,mx-11);l<=mx;l++)h+=`<button data-rift="${l}">Stufe ${l}<small>${rec[l]?'Bestzeit '+fmtT(rec[l]):'Monsterstufe '+(riftMl(l)+DIFF[diff()].il)}</small></button>`;h+='</div>'}
  h+=`<h3 class="dh">Schwierigkeit</h3><div class="travel">${DIFF.map((D,i)=>`<button data-diff="${i}" ${i>(P.diffMax||0)?'disabled':''} class="${i===diff()?'cur':''}">${D.n}${i>(P.diffMax||0)?'<small>'+(i===1?'nach der Aschemutter':'nach der Aschemutter im Albtraum')+'</small>':i===diff()?'<small>aktiv</small>':''}</button>`).join('')}</div>`;
  if(diff())h+=`<p class="hint">${DIFF[diff()].n}: Gegner ×${DIFF[diff()].hp} Leben, ×${DIFF[diff()].dmg} Schaden, ×${DIFF[diff()].xp} Erfahrung. Beute +${DIFF[diff()].il} Stufen, +${DIFF[diff()].mf}% Magiefund. Bosse kehren zurück.</p>`;
  d.innerHTML=h+'<button data-close>Gehen</button>';d.hidden=false}
function startRift(lv){closeDialog();const D=3*lv+1,sv=G.seed,pm=G.mlvl,pv=G.map;G.mlvl=riftMl(lv);G.seed=sv+Math.floor(Math.random()*1e6);const m=genDungeon(D);G.seed=sv;m.floor=D;
  m.objs=m.objs.filter(o=>o.type!=='stairs'&&o.type!=='shrine');G.map=m;const[gx,gy]=nearWalk(m.start.x+1.4,m.start.y+.6);m.objs.push({type:'riftgate',x:gx,y:gy});G.map=pv;
  const ks=Object.keys(RMOD),mods=[];while(mods.length<(lv>=4?3:2)){const k=pick(ks);if(!mods.includes(k))mods.push(k)}
  populate(m);
  if(mods.includes('dicht')){const add=[];G.map=m;for(const e of m.enemies)if(!e.boss&&e.rank!=='unique'){const[x,y]=nearWalk(e.x+rnd(-.8,.8),e.y+rnd(-.8,.8));const c=makeEnemy(e.vid,x,y,e.rank==='champ'?'champ':'normal');c.pack=e.pack;add.push(c)}G.map=pv;m.enemies.push(...add)}
  if(mods.includes('elite'))for(const e of m.enemies)if(e.rank==='normal'&&Math.random()<.2){e.rank='champ';e.hp*=2.6;e.max=e.hp;e.dmg=e.dmg.map(v=>v*1.4);e.xp*=3;e.scale*=1.1;e.sub='Champion · '+e.sub}
  for(const e of m.enemies){if(mods.includes('eisern')){e.hp*=1.5;e.max=e.hp}if(mods.includes('rasend'))e.spd*=1.25;if(mods.includes('glutblut')&&!e.aff.includes('feuer'))e.aff.push('feuer')}
  const need=Math.round(m.enemies.reduce((a,e)=>a+riftPts(e),0)*.62);
  G.owAt=G.map.world?{x:P.x,y:P.y}:null;G.maps.rift=m;G.rift={lv,t:0,prog:0,need,mods,guard:false,done:false,D};G.mlvl=pm;delete G.bossSeen.rift;
  enterFloor('rift');G.mlvl=riftMl(lv);banner('RISS DER STUFE '+lv,mods.map(k=>RMOD[k].n).join(' · '),'boss',3200);log('Riss-Gesetze: '+mods.map(k=>RMOD[k].n+' ('+RMOD[k].d+')').join(', '),'#c8a0ff');qInc('riftin')}
const _floorTitle=floorTitle;floorTitle=function(f){return f==='rift'?'Turm-Riss'+(G.rift?' · Stufe '+G.rift.lv:''):_floorTitle(f)};
function leaveRift(){if(G.floor!=='rift')return;const ow=G.owAt;enterFloor(0);if(!ow){const s=G.map.home&&G.map.home.objs.find(o=>o.type==='riftstone');if(s){const[x,y]=nearWalk(s.x+1,s.y+1);P.x=x;P.y=y;camX=x;camY=y}}}
function spawnGuardian(){const R2=G.rift;R2.guard=true;let x=P.x,y=P.y;for(let k=0;k<40;k++){const a=Math.random()*7,r=rnd(5,7.5),nx=P.x+Math.cos(a)*r,ny=P.y+Math.sin(a)*r;if(free(nx,ny,.8)){x=nx;y=ny;break}}
  G.bossDead.rift=true;const pm=G.mlvl;G.mlvl=riftMl(R2.lv);const e=makeBoss(R2.D,x,y);G.mlvl=pm;e.rg=true;e.hp*=1+R2.lv*.08;e.max=e.hp;e.name='Risswächter '+e.name.split(',')[0];e.sub='Wächter des Risses · Stufe '+R2.lv;e.aggro=true;G.map.enemies.push(e);
  shock(x,y,5,'200,140,255',.9,5);flash(x,y,2,60,'200,120,255',.6);G.shake=12;sfx('boom');sample('portal',.7,{rate:.6});banner('DER RISSWÄCHTER','erscheint','boss',2600)}
const _killEnemyR=killEnemy;killEnemy=function(e,a){_killEnemyR(e,a);const R2=G.rift;
  if(e.wb&&e.wb==='wb7'){const nx=diff()+1;if(nx<=2&&(P.diffMax||0)<nx){P.diffMax=nx;setTimeout(()=>banner(DIFF[nx].n.toUpperCase()+' ERWACHT','Der Riss-Stein auf dem Hügel öffnet ihn','boss',4200),4400);log(DIFF[nx].n+' freigeschaltet: wähle die Schwierigkeit am Riss-Stein.','#c8a0ff')}}
  if(G.floor!=='rift'||!R2||R2.done)return;
  if(e.rg){R2.done=true;G.map.objs=G.map.objs.filter(o=>o.type!=='stairs');const[gx,gy]=nearWalk(e.x,e.y);G.map.objs.push({type:'riftgate',x:gx,y:gy});
    P.recs=P.recs||{rift:{}};P.recs.rift=P.recs.rift||{};const best=P.recs.rift[R2.lv],rec=!best||R2.t<best;if(rec)P.recs.rift[R2.lv]=Math.round(R2.t);P.riftMax=Math.max(P.riftMax||1,R2.lv+1);
    const gl=Math.round((80+R2.lv*60)*(1+diff()));P.glut+=gl;ftext(e.x,e.y-.6,'+'+gl+' Glut','#ff9a3a');for(let k=0;k<1+(R2.lv>=5?1:0)+(R2.lv>=10?1:0);k++)dropItem(makeRune(pickRune(riftMl(R2.lv),true)),e.x,e.y);qInc('rift');
    setTimeout(()=>banner('RISS GESCHLOSSEN',fmtT(R2.t)+(rec?' · neue Bestzeit':'')+' · Stufe '+(R2.lv+1)+' offen','',4200),3000);log(`Riss ${R2.lv} geschlossen in ${fmtT(R2.t)}${rec?' (Bestzeit)':''}. Das Tor bringt dich zurück.`,'#c8a0ff');save();return}
  R2.prog+=riftPts(e);if(R2.mods.includes('gierig')){const g=Math.round((2+G.mlvl)*1.2);P.glut+=g}
  if(R2.prog>=R2.need&&!R2.guard)spawnGuardian()};
const _die=die;die=function(){const rf=G.floor==='rift';_die();if(rf&&G.glutmal&&G.glutmal.floor==='rift'){P.glut=G.glutmal.amt;G.glutmal=null;log('Der Riss schließt sich. Deine Glut bleibt bei dir.','#c8a0ff')}};
function updEnd(dt){if(!P)return;if(G.state==='play')P.playT=(P.playT||0)+dt;riftStoneTick();
  if(G.rift&&G.floor!=='rift'){G.rift=null;delete G.maps.rift}
  let el=$('riftbar');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="riftbar" hidden><div class="rt"></div><div class="rb"><i></i></div></div>');el=$('riftbar')}
  const R2=G.rift;if(!R2||G.floor!=='rift'){el.hidden=true;return}el.hidden=false;if(G.state==='play'&&!R2.done)R2.t+=dt;
  const txt=`Turm-Riss ${R2.lv} · ${R2.mods.map(k=>RMOD[k].n).join(' · ')} · ${fmtT(R2.t)}${R2.done?' · geschlossen':R2.guard?' · Wächter!':''}`;if(el.dataset.t!==txt){el.dataset.t=txt;el.querySelector('.rt').textContent=txt}
  el.querySelector('i').style.width=Math.min(100,R2.prog/R2.need*100).toFixed(1)+'%'}

// rift stone and gate: a dark obelisk with a violet wound, an oval of swirling light
function drawRiftObj(o){const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-200||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t;
  shadow(sx,sy,.55);ctx.save();ctx.translate(sx,sy);
  if(o.type==='riftstone'){ctx.fillStyle='#14111a';ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-8,-46);ctx.lineTo(0,-58);ctx.lineTo(8,-44);ctx.lineTo(12,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='#2a2434';ctx.beginPath();ctx.moveTo(-8,-46);ctx.lineTo(0,-58);ctx.lineTo(1,-2);ctx.lineTo(-11,0);ctx.closePath();ctx.fill();
    const a=.55+Math.sin(t*2.2)*.25;ctx.strokeStyle=`rgba(200,130,255,${a})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1,-50);ctx.lineTo(2,-40);ctx.lineTo(-2,-30);ctx.lineTo(1,-20);ctx.lineTo(-1,-10);ctx.stroke();
    ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-30,0,0,-30,34);g.addColorStop(0,`rgba(170,90,255,${.35*a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-34,-64,68,68);
    if(Math.random()<.2)fxp({k:'mote',x:o.x+rnd(-.2,.2),y:o.y+rnd(-.2,.2),z:rnd(.4,1.6),vx:0,vy:0,vz:.5,life:1,col:pick(['#c8a0ff','#8a50e0']),s:1,g:-.3})}
  else{ctx.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const r=22-k*3.5;ctx.strokeStyle=`rgba(${170+k*15},${90+k*25},255,${.25+k*.1})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-26,r*.55,r,0,t*(1.5+k*.4)+k,t*(1.5+k*.4)+k+4.4);ctx.stroke()}
    const g=ctx.createRadialGradient(0,-26,0,0,-26,30);g.addColorStop(0,'rgba(220,180,255,.45)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-30,-56,60,60)}
  ctx.restore();if(hov)label(sx,sy-(o.type==='riftstone'?66:52),o.type==='riftstone'?'Riss-Stein':'Rückkehr zum Hügel','#c8a0ff')}
const _drawObj=drawObj;drawObj=function(o){if(o.type==='riftstone'||o.type==='riftgate')return drawRiftObj(o);return _drawObj(o)};
const _interact=interact;interact=function(o){if(o&&o.type==='riftstone'){G.openAt={x:P.x,y:P.y};openRiftStone();return}if(o&&o.type==='riftgate'){leaveRift();return}return _interact(o)};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-rift],[data-diff]');if(!t||!P)return;if(t.dataset.rift)startRift(+t.dataset.rift);else setDiff(+t.dataset.diff)});

// records: kept on this device only
function recordsHTML(){const r=(P.recs&&P.recs.rift)||{},ks=Object.keys(r).map(Number).sort((a,b)=>b-a),wb=Object.keys(G.owBoss||{}).length,rw=Object.keys(P.found||{}).filter(k=>k.startsWith('rw:')).length;
  const row=(a,b)=>`<span>${a}</span><b>${b}</b>`;
  return`<h3 class="dh">Rekorde</h3><div class="recs">${row('Spielzeit',Math.floor((P.playT||0)/3600)+' h '+Math.floor((P.playT||0)%3600/60)+' min')}${row('Tiefste Ebene',G.maxFloor)}${row('Höchster offener Riss',P.riftMax||1)}${row('Risse geschlossen',qCnt('rift'))}
  ${row('Gegner besiegt',qCnt('kill'))}${row('Einzigartige besiegt',qCnt('uniq'))}${row('Weltbosse (diese Schwierigkeit)',wb+' / '+WB.length)}${row('Runenwörter geschmiedet',rw+' / '+RW.length)}${row('Kopfgelder',qCnt('bounty'))}${row('Glutdiebe gestellt',qCnt('thief'))}${row('Schwierigkeit',DIFF[diff()].n)}</div>
  ${ks.length?'<div class="recs">'+ks.slice(0,10).map(l=>row('Riss '+l,fmtT(r[l]))).join('')+'</div>':''}<p class="hint">Rekorde werden nur auf diesem Gerät gespeichert. Es gibt keine Online-Bestenliste.</p>`}
const _buildQuestsR=buildQuests;buildQuests=function(){_buildQuestsR();$('pQuest').insertAdjacentHTML('beforeend','<div class="recwrap">'+recordsHTML()+'</div>')};
