/* ---------- menus: title, pause, settings, controls ---------- */
const KEYS_HTML=`<div class="keys">
  <b>Linksklick</b><span>Gehen, angreifen, aufheben, benutzen</span><b>Shift + Klick</b><span>Angriff auf der Stelle</span><b>Mittlere Maustaste</b><span>Grundangriff zum Mauszeiger, ohne zu gehen</span>
  <b>Rechtsklick</b><span>Gewählte Fertigkeit wirken</span><b>1 – 6</b><span>Fertigkeit wirken und auswählen</span>
  <b>Leertaste</b><span>Ausweichrolle (kostet Ausdauer)</span><b>F</b><span>Heilflakon</span><b>Y · X</b><span>Heiltrank · Manatrank</span>
  <b>C · I · K · J · P</b><span>Charakter · Inventar · Fertigkeiten · Sammlung · Talentbaum</span><b>L · M</b><span>Chronik der Quests · große Karte</span><b>Tab</b><span>Namen am Boden ein/aus</span><b>V</b><span>Minikarte ein/aus</span><b>N</b><span>Ton aus/an</span><b>R</b><span>Grafik neu laden, falls das Bild hängt</span><b>Esc</b><span>Pause und Menü</span></div>`;
let menuView=null,confirmFn=null;
function showMenu(v,msg=''){menuView=v;$('menu').hidden=false;const ingame=G.state==='paused',b=$('mbox');
  if(v==='pause')b.innerHTML=`<h2>Pause</h2><button class="mbtn" data-m="resume">Weiterspielen</button><button class="mbtn" data-m="save">Spiel speichern</button>
    <button class="mbtn" data-m="settings">Einstellungen</button><button class="mbtn" data-m="controls">Steuerung</button><button class="mbtn" data-m="title">Speichern und zum Hauptmenü</button>
    <button class="mbtn" data-m="reload">Grafik neu laden (R)</button><button class="mbtn" data-m="hardreload">Seite neu laden · Spielstand bleibt</button><button class="mbtn" data-m="newgame">Neuen Helden beginnen</button><div class="msg" role="status">${msg}</div>`;
  else if(v==='settings'){const sl=(k,n)=>`<label class="mrow"><span>${n}</span><input type="range" min="0" max="100" step="5" value="${CFG[k]}" data-cfg="${k}" id="cfg-${k}"><output>${CFG[k]}</output></label>`,
      ck=(k,n)=>`<label class="mcheck"><span>${n}</span><input type="checkbox" data-cfg="${k}" id="cfg-${k}" ${CFG[k]?'checked':''}></label>`;
    b.innerHTML=`<h2>Einstellungen</h2><h3>Ton</h3>${sl('music','Musik')}${sl('sfx','Effekte')}${sl('voice','Stimmen')}<label class="mcheck"><span>Alles stumm (M)</span><input type="checkbox" data-cfg="mute" id="cfg-mute" ${G.muted?'checked':''}></label>
      <h3>Kampf</h3>${ck('shake','Bildschirmwackeln')}${ck('hitstop','Trefferstopp')}${ck('numbers','Schadenszahlen')}<button class="mbtn" data-m="back">Zurück</button>`}
  else if(v==='controls')b.innerHTML=`<h2>Steuerung</h2>${KEYS_HTML}<button class="mbtn" data-m="back">Zurück</button>`;
  else if(v==='confirm')b.innerHTML=`<h2>Sicher?</h2><p class="hint" style="text-align:center;margin:0">${msg}</p><button class="mbtn" data-m="yes">Ja, neu beginnen</button><button class="mbtn" data-m="back">Abbrechen</button>`;
  const f=b.querySelector('button');f&&f.focus()}
function closeMenu(){$('menu').hidden=true;menuView=null;if(G.state==='paused')G.state='play'}
function openPause(){closeAll();G.state='paused';G.stepS=stopLoop(G.stepS);save();showMenu('pause')}
function escKey(){if(OVL.has(G.state)){ovClose();return}if(menuView){if(menuView!=='pause'&&G.state==='paused')showMenu('pause');else closeMenu();return}
  if(G.state!=='play')return;const open=G.hand||!$('dialog').hidden||panels.some(p=>!$(p).hidden);if(open){closeAll();return}openPause()}
function contInfo(){const d=loadData();$('btnCont').hidden=!d;if(d)$('contInfo').textContent=`Stufe ${d.p.lvl} · tiefste Ebene ${d.g.maxFloor||0}`}
function titleBackdrop(){P=newPlayer();resetTransient();recalc();P.hp=P.d.life;G.seed=4242;G.maps={0:genTown()};G.map=G.maps[0];P.x=G.map.start.x-2;P.y=G.map.start.y-4;camX=P.x;camY=P.y;G.map.objs=G.map.objs.filter(o=>o.type!=='merchant');
  G.tele=[];G.proj=[];G.fx=[];G.rings=[];G.bolts=[];G.texts=[];G.lights=[];G.glutmalShown=null}
function toTitle(){save();closeAll();$('menu').hidden=true;menuView=null;G.state='title';G.stepS=stopLoop(G.stepS);G.heartS=stopLoop(G.heartS);
  $('hud').hidden=true;$('topinfo').hidden=true;$('bossbar').hidden=true;$('target').hidden=true;titleBackdrop();contInfo();$('title').hidden=false;playMusic(null)}
// a new hero never replaces an old one: every hero keeps a save of their own (790-heroes.js)
function askNew(){closeMenu();pickClass()}
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-cls]');if(c){closeMenu();startNew(c.dataset.cls)}});
$('menu').addEventListener('click',e=>{const t=e.target.closest('[data-m]');if(!t){if(e.target.id==='menu'&&G.state!=='title')escKey();return}const m=t.dataset.m;
  if(m==='resume')closeMenu();else if(m==='save'){save();showMenu('pause','Gespeichert.')}else if(m==='settings'||m==='controls')showMenu(m);
  else if(m==='back')G.state==='paused'?showMenu('pause'):closeMenu();else if(m==='title')toTitle();else if(m==='reload'){reloadRes();showMenu('pause','Grafik neu geladen.')}else if(m==='hardreload'){save();location.reload()}else if(m==='newgame'){save();toTitle();pickClass()}
  else if(m==='yes'&&confirmFn){const f=confirmFn;confirmFn=null;f()}});
$('menu').addEventListener('input',e=>{const t=e.target,k=t.dataset.cfg;if(!k)return;
  if(k==='mute'){G.muted=t.checked;if(G.muted){G.stepS=stopLoop(G.stepS);G.heartS=stopLoop(G.heartS)}applyCfg();return}
  CFG[k]=t.type==='checkbox'?t.checked:+t.value;if(t.nextElementSibling&&t.nextElementSibling.tagName==='OUTPUT')t.nextElementSibling.value=t.value;applyCfg();saveCfg();
  if(k==='sfx'&&AC)sample('sword',.55);if(k==='voice'&&AC&&!(VO.src&&AC.currentTime<VO.end))voice(pick(['vodal','vsmith','vquest','vtrade']))});
$('title').addEventListener('click',e=>{const t=e.target.closest('[data-m]');if(t){initAudio();showMenu(t.dataset.m)}});
addEventListener('pagehide',()=>{if(G.state==='play'||G.state==='paused')save()});
function startNew(cls='wanderer'){
  G.seed=(Math.random()*1e9)|0;G.lit={0:true};G.owFires={};G.owClear=new Set();G.owRespawn=null;G.owSeen=new Set();G.owBoss={};G.bossDead={};G.glutmal=null;G.maxFloor=0;G.respawnFloor=0;G.maps={};G.bossSeen={};
  P=newPlayer();resetTransient();
  {const C=CLS[cls]||CLS.wanderer;P.cls=cls;P.stats={...C.stats};P.sk={};C.skills.forEach((id,i)=>P.sk[id]=i===0?1:0);P.sel=C.skills[0];P.eq.weapon=startWeapon(C.wc)}
  P.eq.armor={id:UID++,b:'Lederwams',name:'Lederwams',slot:'armor',cls:'armor',rar:'normal',ilvl:1,def:8,mods:{},req:{lvl:1,str:0,dex:0}};
  invAdd(makePotion('life',1));invAdd(makePotion('life',1));invAdd(makePotion('mana',1));
  P.found={[P.eq.weapon.b]:1,Lederwams:1};recalc();P.hp=P.d.life;P.mp=P.d.mana;P.st=P.d.stam;begin(0);
  setTimeout(()=>log(TOUCH?'Links ziehen, um zu gehen, rechts angreifen und zaubern. Der Eingang des Turms liegt vor dem Tor.':'Klicke auf den Boden, um zu gehen. Der Eingang des Turms liegt vor dem Tor.','#ece4cf'),1200);
  setTimeout(()=>log('Odalinde verkauft Tränke und verstärkt deinen Flakon.','#a39b88'),3200)}
function begin(f){G.state='play';G.hand=null;$('title').hidden=true;$('hud').hidden=false;$('topinfo').hidden=false;buildBelt();enterFloor(f);P.hp=P.d.life;if(P._over&&P._over.length){for(const it of P._over)dropItem(it,P.x,P.y);log('Nicht alles passte ins neue Inventar. Der Rest liegt neben dir.','#a39b88')}P._over=null}
$('btnNew').onclick=()=>{initAudio();askNew()};
$('btnCont').onclick=()=>{initAudio();const d=loadData();if(!d)return pickClass();applyData(d);const ps=G.pos;delete G.pos;
  // back where you left off: on the islands the world grows around the spot, in the tower the floor is rebuilt from its seed
  let f=G.respawnFloor;if(ps&&typeof ps.f==='number'&&ps.f>=0&&ps.f<=(G.maxFloor||0)){f=ps.f;if(f===0)G.owAt={x:ps.x-1,y:ps.y-1}}
  begin(f);if(ps&&f>0&&G.floor===f&&walkable(ps.x,ps.y)){P.x=ps.x;P.y=ps.y;camX=P.x;camY=P.y}log('Willkommen zurück, Wanderer.','#ffd88a')};
contInfo();

