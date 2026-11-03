/* ---------- music: one looping track per area, cross-faded ---------- */
const MUSIC={town:'music/huegel.mp4',dungeon:'music/gewoelbe.mp4'};
const mus={key:null,a:null};
function fadeAudio(a,to,ms,done){const from=a.volume,t0=performance.now();clearInterval(a._f);a._f=setInterval(()=>{const p=Math.min(1,(performance.now()-t0)/ms);a.volume=from+(to-from)*p;if(p>=1){clearInterval(a._f);done&&done()}},50)}
function playMusic(key){if(mus.key===key)return;mus.key=key;const old=mus.a;if(old)fadeAudio(old,0,1500,()=>old.pause());
  const src=MUSIC[key];if(!src){mus.a=null;return}const a=new Audio(src);a.loop=true;a.preload='auto';a.volume=0;mus.a=a;
  a.play().then(()=>fadeAudio(a,musVol(),2000)).catch(()=>{})}
function enterFloor(f){playMusic(f===0?'town':'dungeon');if(G.state==='play')sample('portal',.6,{rate:1});
  G.floor=f;G.mlvl=f===0?1:1+(f-1)*2;
  if(!G.maps[f]){G.maps[f]=f===0?genWorld():genDungeon(f);if(f>0)populate(G.maps[f])}
  G.map=G.maps[f];P.x=G.map.start.x;P.y=G.map.start.y;if(f===0&&G.owAt){const[x,y]=nearWalk(G.owAt.x+1,G.owAt.y+1);P.x=x;P.y=y;G.owAt=null}resetTransient();if(G.map.world){G.map.ac=null;owTick()}
  G.tele=[];G.proj=[];G.fx=[];G.rings=[];G.bolts=[];G.texts=[];G.lights=[];G.zones=[];G.ptraps=[];P.trail=[];P.ghosts=[];G.flowT=0;computeFlow();
  if(f>G.maxFloor)G.maxFloor=f;
  camX=P.x;camY=P.y;
  const m=G.map;banner(floorTitle(f),f===0?'Ein Turm, schwarz gegen den Himmel':m.boss?(G.bossDead[f]?'Der Hüter ist bezwungen':'Hier haust ein Hüter der Tiefe'):'Monsterstufe '+G.mlvl);
  $('floorName').textContent=floorTitle(f);
  save()}
function rest(){
  recalc();P.hp=P.d.life;P.mp=P.d.mana;P.st=P.d.stam;P.flasks=fMax();G.respawnFloor=G.floor;G.lit[G.floor]=true;
  if(G.map.kind==='dungeon'){populate(G.map);G.map.items=G.map.items.filter(it=>it.item.rar!=='normal')}
  if(G.map.world){const o=G.restObj;G.owRespawn=o&&o.ow?{x:o.x,y:o.y}:null;G.owClear.clear();owRestart()}
  burst(P.x,P.y,'#ffd88a',24,2,.4);log('Du rastest am Leuchtfeuer. Die Feinde dieser Ebene kehren zurück.','#ffd88a');sfx('lvl');save()}


