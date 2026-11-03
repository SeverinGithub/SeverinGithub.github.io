/* ---------- recorded sounds, second batch: anvil, lightning, trade, dash, skill slots 2·3·6, a new place, rain and thunder · music playlists ---------- */
Object.assign(SFXF,{anvil:2,blitz:1,buy:1,dash:1,sktwo:1,skthree:1,sksix:1,region:1,rain:1,thunder:1});
const SND={blitzT:-9,regT:-9,seen:-1,rg:-1,mf:-1,rain:null,thT:0,flash:0};
const isBlitz=id=>id==='chain'||(!!id&&id.startsWith('m_')&&mElem()==='light');
function blitzSnd(){if(G.t-SND.blitzT<.35)return false;const h=sample('blitz',.55);if(h)SND.blitzT=G.t;return!!h}
// lightning in any form, and every dash, roll and leap, use the recordings; the synthesised versions stay as a fallback
const _sfxS=sfx;sfx=function(type){
  if(type==='zap'&&(mElem()==='light'||G.t-SND.blitzT<.15||SND.cast==='chain')){if(SBUF.blitz&&SBUF.blitz.length){blitzSnd();return}}
  if(type==='roll'&&sample('dash',.6))return;
  return _sfxS(type)};
// a skill that fires: lightning sounds as lightning, otherwise slots 2, 3 and 6 have their own voice
const SLOTSND={1:['sktwo',.6],2:['skthree',.6],5:['sksix',.55]};
const _castSkillSnd=castSkill;castSkill=function(id,tx,ty){const b=P&&P.cds?P.cds[id]||0:0;SND.cast=id;try{_castSkillSnd(id,tx,ty)}finally{SND.cast=null}
  if(!P||!P.cds||(P.cds[id]||0)<=b+.01)return;
  if(isBlitz(id)){blitzSnd();return}const s=id==='charge'?null:SLOTSND[myCls().skills.indexOf(id)];if(s)sample(s[0],s[1],{rate:1})};
// anvil: the smith's upgrade and the merge on the Amboss der Vereinung
function anvilSnd(){return sample('anvil',.9,{rate:rnd(.97,1.03)})}
// trade: anything bought from Odalinde, the gambler or Brannoc
const _qIncSnd=qInc;qInc=function(k,...a){if(k==='buy')sample('buy',.7,{rate:1});return _qIncSnd(k,...a)};
// a new place: the first step onto an island, the first sight of a part of the burg, a tower floor never reached before
function placeTick(){if(G.state==='title'||!P){SND.seen=SND.rg=SND.mf=-1;return}if(G.state!=='play')return;
  const s=G.owSeen?G.owSeen.size:0,r=P.rgSeen?Object.keys(P.rgSeen).length:0,f=G.maxFloor||0;
  if(SND.seen>=0&&(s>SND.seen||r>SND.rg||f>SND.mf)&&G.t-SND.regT>6){SND.regT=G.t;sample('region',.7,{rate:1})}SND.seen=s;SND.rg=r;SND.mf=f}
// rain: a recorded loop that swells and fades with the weather, thunder somewhere between one and four minutes apart, with a flash
function rainTick(dt){const w=G.wx,on=G.state==='play'&&!G.muted&&G.map&&G.map.world&&w&&w.k==='rain'&&w.i>0;
  if(on&&!SND.rain&&SBUF.rain&&SBUF.rain.length){SND.rain=sample('rain',0,{loop:true,rate:1});SND.thT=rnd(60,240)}
  if(SND.rain){if(!on){SND.rain=stopLoop(SND.rain,1200);return}SND.rain.g.gain.setTargetAtTime(.55*w.i,AC.currentTime,.4)}
  if(on&&w.i>.5&&(SND.thT-=dt)<=0){SND.thT=rnd(60,240);sample('thunder',.8,{rate:rnd(.92,1.04)});SND.flash=1;G.shake=Math.max(G.shake,2)}
  SND.flash=Math.max(0,SND.flash-dt*2.2)}
const _drawWeatherS=drawWeather;drawWeather=function(){_drawWeatherS();if(SND.flash>0&&G.map&&G.map.world){const f=SND.flash,a=f>.8?.55:f>.6?.08:f>.45?.4:f*.2;ctx.fillStyle=`rgba(225,235,255,${a.toFixed(3)})`;ctx.fillRect(0,0,W,H)}};
const _updMusicLayersS=updMusicLayers;updMusicLayers=function(){_updMusicLayersS();if(MX.rain&&SBUF.rain&&SBUF.rain.length)MX.rain.gain.setTargetAtTime(0,AC.currentTime,.5)};
const _updForgeSnd=updForge;updForge=function(dt){_updForgeSnd(dt);placeTick();if(AC)rainTick(dt)};
// music: each area draws from its own playlist; a track plays through and hands over to another one
const MUSL={town:['music/overworld1.mp3','music/overworld2.mp3','music/overworld3.mp3','music/overworld4.mp3'],dungeon:['music/tower1.mp3','music/tower2.mp3','music/tower3.mp3']};
playMusic=function(key){if(mus.key===key)return;mus.key=key;const old=mus.a;if(old){old.onended=null;fadeAudio(old,0,1500,()=>old.pause())}
  const L=MUSL[key];if(!L){mus.a=null;return}
  const start=prev=>{if(mus.key!==key)return;const o=L.filter(s=>s!==prev),src=pick(o.length?o:L),a=new Audio(src);a.preload='auto';a.volume=0;mus.a=a;
    a.onended=()=>{if(mus.a===a)start(src)};a.play().then(()=>fadeAudio(a,musVol()*(MX.duck||1),2000)).catch(()=>{})};
  start(null)};
