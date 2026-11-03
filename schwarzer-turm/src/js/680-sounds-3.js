/* ---------- recorded sounds, third batch: guardians, pick-ups by rarity, level, quest, death, the Sturmangriff's impact · boss music ---------- */
Object.assign(SFXF,{sturm:1,bossdown:1,bosscrit:1,bossscr:1,bossscr2:1,pdie:1,pickn:1,pickr:1,picku:1,lvlup:1,quest:1});
MUSL.boss=['music/boss1.mp3','music/boss2.mp3'];
const SN3={pk:0,lv:0,chg:null,movT:-9,bossOff:0,prev:null,tl:0,crT:-9};
function pickSnd(it){const r=it&&it.rar;sample(r==='unique'||r==='runeword'||r==='set'?'picku':r==='rare'?'pickr':'pickn',.7,{rate:1})}
const _sfxG=sfx;sfx=function(type){if(type==='pick'&&SN3.pk&&SBUF.pickn&&SBUF.pickn.length)return;if(type==='lvl'&&SN3.lv&&SBUF.lvlup&&SBUF.lvlup.length)return;return _sfxG(type)};
const _pickupS3=pickup;pickup=function(gi){const m=G.map,n=m?m.items.length:0,it=gi&&gi.item;SN3.pk=1;try{_pickupS3(gi)}finally{SN3.pk=0}if(m&&m.items.length<n&&it)pickSnd(it)};
const _gainXpS=gainXp;gainXp=function(x){const l0=P.lvl;SN3.lv=1;try{_gainXpS(x)}finally{SN3.lv=0}if(P.lvl>l0)sample('lvlup',.75,{rate:1})};
const _dieS=die;die=function(){const was=P&&P.dead;_dieS();if(P&&P.dead&&!was)sample('pdie',.8,{rate:1})};
const _bannerS=banner;banner=function(big,small,cls,dur){_bannerS(big,small,cls,dur);if(big==='QUEST ERFÜLLT')sample('quest',.75,{rate:1});else if(big==='FEIND BEZWUNGEN')bossFallSnd();else if(small==='erhebt sich in Raserei')sample('bossscr',.8,{rate:.92})};
const _hitEnemyS3=hitEnemy;hitEnemy=function(e,dmg,o={}){if(e&&e.boss&&!e.dead&&o.crit&&dmg>0&&G.t-SN3.crT>.3){SN3.crT=G.t;sample('bosscrit',.6)};return _hitEnemyS3(e,dmg,o)};
// the Sturmangriff sounds when it strikes home, not when it sets off
const _castSkillS3=castSkill;castSkill=function(id,tx,ty){const b=P&&P.cds?P.cds[id]||0:0;_castSkillS3(id,tx,ty);if(id==='charge'&&P&&P.dash&&(P.cds[id]||0)>b+.01)SN3.chg=P.dash};
function bossSndTick(dt){const m=G.map;if(!m||!P)return;if(SN3.chg&&P.dash!==SN3.chg){SN3.chg=null;sample('sturm',.8,{rate:1})}
  let fight=false;for(const e of m.enemies){if(!e.boss||e.dead)continue;const d=hyp(e.x-P.x,e.y-P.y);if((e.aggro||e.mir)&&d<16)fight=true;if(!e._scr&&(e.aggro||e.mir)&&d<14){e._scr=1;sample('bossscr',.85,{rate:1})}}
  const n=G.tele.length;if(n>SN3.tl&&G.t-SN3.movT>6)for(let i=SN3.tl;i<n;i++){const o=G.tele[i].owner;if(o&&o.boss&&!o.dead){SN3.movT=G.t;sample('bossscr2',.5,{rate:rnd(.95,1.05)});break}}SN3.tl=n;
  if(G.t<(SN3.hold||0))return;if(mus.key==='still'){SN3.prev=null;playMusic(G.floor===0?'town':'dungeon')}
  if(fight&&!P.dead){SN3.bossOff=0;if(mus.key!=='boss'){SN3.prev=mus.key;playMusic('boss')}}
  else if(mus.key==='boss'&&(SN3.bossOff+=dt)>3)playMusic(SN3.prev&&SN3.prev!=='boss'?SN3.prev:G.floor===0?'town':'dungeon')}
const _updForgeG=updForge;updForge=function(dt){_updForgeG(dt);if(P&&G.state==='play'){mpShareTick();bossSndTick(dt)}};

