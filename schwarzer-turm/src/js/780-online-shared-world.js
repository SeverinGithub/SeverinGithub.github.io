/* ---------- one world for everyone online: the host's clock, sky, night, trader and traps are the same for every friend ---------- */
// friends on the islands, as the host sees them
function mpIsleFriends(){const o=[];if(NET.role!=='host'||G.floor!==0)return o;for(const r of NET.others.values())if(!r.stale&&r.floor===0&&r.buf.length)o.push(r);return o}
function mpFriendNear(x,y,d){for(const r of mpIsleFriends())if(hyp(r.x-x,r.y-y)<d)return true;return false}
const mpGuestSynced=()=>NET.role==='guest'&&mpHostHere();
// run a world routine as if a friend were the hero: what it spawns lands around them, and its messages stay quiet here
function mpAsFriend(r,fn){const P0=P,L0=log,B0=banner,S0=sample,X0=sfx;P=mpProxy(r);log=banner=sample=sfx=()=>null;try{return fn()}finally{P=P0;log=L0;banner=B0;sample=S0;sfx=X0}}

// host: every second the hour and the weather go out; a guest takes them over as they are
const WD={t:0,wx:'',pd:0};
function mpWorldOut(){const w=G.wx||{k:'clear',t:1,i:0};mpSend({t:'wd',d:+(G.dayT||0).toFixed(2),r:G.state==='play'?1:0,k:w.k,i:+w.i.toFixed(3),f:w.t<=6?1:0})}
function mpWorldIn(d){NET.wd=Object.assign({},d,{rt:performance.now()});
  if(d.k!==WD.wx){if(WD.wx&&d.k!=='clear'&&G.map&&G.map.world)log(WXN[d.k]+' zieht auf.','#8a9ab0');WD.wx=d.k}}
const _updWorldMP=updWorld;updWorld=function(dt){_updWorldMP(dt);const d=NET.wd;
  // with friends online the day goes on even while the host is down in the tower
  if(NET.role==='host'&&NET.conns.size&&P&&G.map&&!G.map.world&&G.state==='play')G.dayT=(G.dayT||0)+dt;
  if(NET.role!=='guest'||!d||!NET.others.has('h')||performance.now()-d.rt>6000)return;
  G.dayT=d.d+(d.r?(performance.now()-d.rt)/1000:0);G.wx=G.wx||{};G.wx.k=d.k;G.wx.i=d.i;G.wx.t=d.f?3:999};
// thunder: the host's sky decides when it cracks
const _rainTickMP=rainTick;rainTick=function(dt){if(NET.role==='guest'&&NET.wd)SND.thT=999;const f0=SND.flash;_rainTickMP(dt);if(NET.role==='host'&&SND.flash===1&&f0<1)mpSend({t:'th'})};
function mpThunder(){const w=G.wx;if(!G.map||!G.map.world||!w||w.k!=='rain'||G.muted)return;sample('thunder',.8,{rate:rnd(.92,1.04)});SND.flash=1;G.shake=Math.max(G.shake||0,2)}
// resting at a fire moves the clock for everyone
const _restUntilMP=restUntil;restUntil=function(k){_restUntilMP(k);if(!mpOn())return;if(NET.role==='guest'){mpSend({t:'dn',d:G.dayT,k});if(NET.wd){NET.wd.d=G.dayT;NET.wd.rt=performance.now()}}else WD.t=0};
function mpRestIn(d,c){const r=NET.others.get(c.mpId);G.dayT=Math.max(G.dayT||0,d.d||0);WD.t=0;log((r?r.nm:'Ein Mitspieler')+' hat bis '+(d.k==='night'?'zur Nacht':'zum Morgen')+' gerastet.','#9ab0ff')}

// night foes: the host lets them rise around every hero on the islands; a guest beside the host raises none of their own
const _nightTickMP=nightTick;nightTick=function(dt){if(mpGuestSynced())return;_nightTickMP(dt);
  for(const r of mpIsleFriends()){const N0={t:NT.t,warned:NT.warned};NT.t=r.ntT??rnd(8,16);NT.warned=1;try{mpAsFriend(r,()=>_nightTickMP(dt))}finally{r.ntT=NT.t;NT.t=N0.t;NT.warned=N0.warned}}};
// world events stay with the host while you share the islands
const _worldEventsMP=worldEvents;worldEvents=function(dt){if(mpGuestSynced())return;return _worldEventsMP(dt)};

// the travelling trader: the host chooses where they stop, near any hero, and tells everyone
const _peddlerTickMP=peddlerTick;peddlerTick=function(dt){
  if(mpGuestSynced()){if(PDL.o)PDL.o.left=Math.max(0,PDL.o.left-dt);return}
  const had=PDL.o,ok=(x,y)=>{const I=islandOf(Math.floor(x/CH),Math.floor(y/CH));return I&&I.kind!=='home'&&I.kind!=='boss'},
    F=had?[]:mpIsleFriends().filter(r=>ok(r.x,r.y));
  // the clock runs while any hero is out on the wild islands; when it strikes, one of them gets the visit
  if(F.length&&(PDL.t-dt<=0||!ok(P.x,P.y))){const c=ok(P.x,P.y)?[null,...F]:F,who=pick(c);if(who)mpAsFriend(who,()=>_peddlerTickMP(dt));else _peddlerTickMP(dt)}else _peddlerTickMP(dt);
  if(NET.role!=='host')return;
  if(PDL.o&&(PDL.o!==had||(WD.pd-=dt)<=0)){WD.pd=4;mpSend({t:'pd',o:mpPdOut(PDL.o),ck:PDL.ck,nw:PDL.o!==had?1:0})}else if(had&&!PDL.o)mpSend({t:'pd',o:null})};
function mpPdOut(o){return{x:o.x,y:o.y,name:o.name,lvl:o.lvl,left:Math.round(o.left),quote:o.quote,stock:o.stock}}
function mpPdIn(d){const m=G.maps&&G.maps[0];if(!m)return;const old=PDL.o;
  if(!d.o){if(old){const c=m.cdata.get(PDL.ck);if(c)c.objs=c.objs.filter(q=>q!==old);m.objs=m.objs.filter(q=>q!==old);if(G.map===m)smoke(old.x,old.y,8,'rgba(150,138,118,',6,.5);PDL.o=null}return}
  let o=old;if(!o||o.name!==d.o.name||hyp(o.x-d.o.x,o.y-d.o.y)>.5){if(old)mpPdIn({o:null});o={type:'merchant',peddler:true,...d.o};for(const it of o.stock||[])it.ped=1;PDL.o=o;PDL.ck=d.ck;
    if(d.nw&&G.map===m&&hyp(o.x-P.x,o.y-P.y)<40){banner('EIN FAHRENDER HÄNDLER',o.name+' bietet Einzigartiges an · nur für kurze Zeit','',3000);log(o.name+' ist in eurer Nähe eingetroffen. Seltene Ware, für etwa fünf Minuten.','#ffd88a')}}
  else o.left=d.o.left;
  // the chunk may have been built anew since: put the stall back where it belongs
  const c=m.cdata.get(d.ck);if(c&&!c.objs.includes(o))c.objs.push(o);if(!m.objs.includes(o))m.objs.push(o)}

// dragon eggs: a friend close by wakes them on the host too, and everyone sees the shell break
const _hoardTickMP=hoardTick;hoardTick=function(){const m=G.map,eggs=()=>{const o=[];if(m&&m.cdata)for(const c of m.cdata.values())for(const q of c.objs)if(q.type==='egg')o.push(q);return o};
  if(mpGuestSynced()){const I=wb8C&&wb8C();if(!I||!m||!m.world)return;for(const o of eggs())if(hyp(o.x-P.x,o.y-P.y)<2.6){const c=m.cdata.get(I.cx+','+I.cy);if(c)c.objs=c.objs.filter(q=>q!==o);m.objs=m.objs.filter(q=>q!==o)}return _hoardTickMP.call(this)}
  const b=NET.role==='host'?eggs():null;_hoardTickMP();for(const r of mpIsleFriends())mpAsFriend(r,()=>_hoardTickMP());
  if(b){const a=new Set(eggs()),l=b.filter(o=>!a.has(o)).map(o=>[o.x,o.y]);if(l.length)mpSend({t:'hx',l})}};
function mpEggsIn(d){const m=G.maps&&G.maps[0];if(!m)return;for(const[x,y]of d.l||[])for(const c of m.cdata.values())for(const o of c.objs.slice())if(o.type==='egg'&&hyp(o.x-x,o.y-y)<.6){c.objs.splice(c.objs.indexOf(o),1);m.objs=m.objs.filter(q=>q!==o);
  if(G.map===m)for(let k=0;k<14;k++)fxp({k:'bone',x:o.x,y:o.y,z:.4,vx:rnd(-2,2),vy:rnd(-2,2),vz:rnd(1,3),life:rnd(.8,1.4),col:pick(['#e8d8b0','#c8a868','#ff9a3a']),s:rnd(1.5,2.5),g:6,rot:0,vr:rnd(-8,8)})}}

// the tower: a broken wall stays broken for everyone, and a boulder set rolling rolls on every screen
function mpSecretIn(d){const f=d.fl;if(typeof f!=='number')return;G.secOpen=G.secOpen||new Set();G.secOpen.add(f);const m=G.maps&&G.maps[f];if(!m||!m.secret||m.secret.open)return;
  const e=m.enemies.find(e=>e.wall&&!e.dead);if(e){e.dead=true;e.dieT=99}
  if(m===G.map&&e){secretOpen(m,e);log('Ein Mitspieler hat eine rissige Wand aufgebrochen.','#ffd88a')}else secretOpen(m,e,true)}
const _boulderTickMP=boulderTick;boulderTick=function(b,dt){const s0=b.st;_boulderTickMP(b,dt);
  if(s0===0&&b.st===1&&!b.net&&mpOn()){const i=G.map.traps.filter(t=>t.k==='boulder').indexOf(b);mpSend({t:'bo',fl:G.floor,i})}b.net=0};
function mpBoulderIn(d){if(d.fl!==G.floor||!G.map||!G.map.traps)return;const b=G.map.traps.filter(t=>t.k==='boulder')[d.i];if(!b||b.st!==0)return;
  b.st=1;b.t=0;b.net=1;b.x=b.x0;b.y=b.y0;if(hyp(b.x0-P.x,b.y0-P.y)<24){sample('thunder',.35,{rate:1.6})||syn('quake');G.shake=Math.max(G.shake||0,2)}}
// boulders far away keep rolling on their own here once set off
const _updTrapsMP=updTraps;updTraps=function(dt){_updTrapsMP(dt);const m=G.map;if(!m||!m.traps||G.state!=='play')return;
  for(const b of m.traps)if(b.k==='boulder'&&b.st>0&&!(Math.abs(b.x0-P.x)<24&&Math.abs(b.y0-P.y)<24))_boulderTickMP(b,dt)};

const _mpRecvW=mpRecv;mpRecv=function(d,c){if(!d||!d.t)return _mpRecvW(d,c);
  const relay=()=>{if(NET.role==='host')for(const cc of NET.conns.values())if(cc!==c)mpTo(cc,d)};
  if(NET.role==='guest'){if(d.t==='wd'){mpWorldIn(d);return}if(d.t==='th'){mpThunder();return}if(d.t==='pd'){mpPdIn(d);return}if(d.t==='hx'){mpEggsIn(d);return}}
  if(NET.role==='host'&&d.t==='dn'){mpRestIn(d,c);return}
  if(d.t==='so'){relay();mpSecretIn(d);return}if(d.t==='bo'){relay();mpBoulderIn(d);return}
  return _mpRecvW(d,c)};
const _mpTickW=mpTick;mpTick=function(dt){_mpTickW(dt);if(NET.role==='host'&&NET.conns.size&&(WD.t-=dt)<=0){WD.t=1;mpWorldOut()}};
