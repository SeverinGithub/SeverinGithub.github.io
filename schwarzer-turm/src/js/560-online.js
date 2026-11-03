/* ---------- online: one player hosts a world, friends join it with a four-digit code ----------
   Browsers talk directly over WebRTC; the free PeerJS broker only introduces them. The host's world seed
   is sent to every guest, so islands, tower floors and the dead lands are the same for everyone.
   Two channels per friend: a reliable one for events, an unordered one for the 30 Hz movement stream.
   Wherever the host is, the host's machine runs every monster of that floor for everyone: guests see mirrors, their
   blows travel to the host, every death is felt by all, and each player rolls their own loot and experience.
   Every stream carries its sender's clock and is replayed a tenth of a second late, so nothing jumps or runs backwards. */
const NET={role:null,code:null,peer:null,host:null,hostU:null,conns:new Map(),others:new Map(),me:'h',n:0,st:'',err:'',lookH:'',lookT:0,hudT:0,goTo:0,
  nid:0,mir:new Map(),sync:false,syncT:0,syncMap:null,hc:{},lastSnap:0,ask:{},hitBy:null,bfSig:'',bfT:0,sx:0,sy:0,st0:0,snapT:0};
const MPPRE='schwarzer-turm-mp-',MPMAX=3,MPSEE=40,MPLAG=100,MPDOWN=15,MPREV=2.4;
G.vproj=[];G.vzones=[];
const mpEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const MPICE={debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]}};
function mpLib(){return window.Peer?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js';s.onload=ok;s.onerror=()=>no(new Error('lib'));document.head.appendChild(s)})}
function mpName(){return(CFG.mpName||'').trim().slice(0,14)||myCls().n||'Wanderer'}
const mpOn=()=>NET.role==='host'||NET.role==='guest';
function mpErr(er){const t=er&&er.type;return t==='network'||t==='server-error'||t==='socket-error'||t==='socket-closed'?'Keine Verbindung zum Online-Dienst.':t==='browser-incompatible'?'Dieser Browser kann kein Online-Spiel.':t==='peer-unavailable'?'Kein Spiel mit diesem Code gefunden.':'Verbindung fehlgeschlagen.'}
function mpFail(msg){mpStop(true);NET.err=msg;NET.st='';mpMenu()}

// hosting: claim a free four-digit code on the broker and wait for friends
async function mpHost(){if(mpOn())return;mpStop(true);NET.err='';NET.st='Spiel wird eröffnet …';NET.role='opening';mpMenu();
  try{await mpLib()}catch(e){return mpFail('Der Online-Dienst ist gerade nicht erreichbar.')}
  let tries=0;const go=()=>{const code=String(1000+Math.floor(Math.random()*9000)),p=new Peer(MPPRE+code,MPICE);NET.peer=p;
    p.on('open',()=>{NET.role='host';NET.code=code;NET.me='h';NET.st='';NET.shared=mpShHost();log('Online: dein Spiel-Code ist '+code,'#9ad0ff');mpMenu();mpHud(1)});
    p.on('connection',c=>c.label==='u'?mpAcceptFast(c):mpAccept(c));
    p.on('disconnected',()=>{if(NET.role==='host'&&!p.destroyed)setTimeout(()=>{try{p.reconnect()}catch(e){}},1500)});
    p.on('error',er=>{if(er.type==='unavailable-id'&&tries++<8){p.destroy();go()}else if(NET.role!=='host')mpFail(mpErr(er));else if(er.type!=='peer-unavailable')log('Online: '+mpErr(er),'#ff8a6a')})};go()}
function mpAccept(c){const id='g'+(++NET.n);c.mpId=id;c.known=new Set();
  c.on('open',()=>{if(NET.conns.size>=MPMAX){c.send({t:'full'});setTimeout(()=>c.close(),400);return}
    NET.conns.set(id,c);NET.bfSig='';c.send({t:'w',seed:G.seed,id,code:NET.code,host:mpName()});c.send(mpLook());for(const r of NET.others.values())if(r.look)c.send(Object.assign({},r.look,{id:r.id}));c.send({t:'sl',l:mpShList(),ack:0})});
  c.on('data',d=>mpRecv(d,c));c.on('close',()=>mpDrop(id));c.on('error',()=>mpDrop(id))}
// the fast lane belongs to whichever friend opened it from the same address
function mpAcceptFast(c){c.on('open',()=>{for(const m of NET.conns.values())if(m.peer===c.peer)m.fast=c});
  c.on('data',d=>{let m=null;for(const x of NET.conns.values())if(x.peer===c.peer){m=x;break}if(m){m.fast=c;mpRecv(d,m)}})}
function mpDrop(id){const had=NET.conns.delete(id),r=NET.others.get(id);NET.others.delete(id);if(r)log(r.nm+' hat das Spiel verlassen.','#a39b88');if(had)for(const c of NET.conns.values())if(c.open)c.send({t:'gone',id});mpMenu();mpHud(1)}

// joining: ask the broker for the host's code, then talk to the host directly
async function mpJoin(code){code=String(code||'').replace(/\D/g,'');if(code.length!==4){NET.err='Der Code hat vier Ziffern.';mpMenu();return}
  mpStop(true);NET.err='';NET.st='Suche Spiel '+code+' …';NET.role='joining';mpMenu();
  try{await mpLib()}catch(e){return mpFail('Der Online-Dienst ist gerade nicht erreichbar.')}
  const p=new Peer(MPICE);NET.peer=p;let ok=false;
  p.on('open',()=>{const c=p.connect(MPPRE+code,{reliable:true});NET.host=c;
    const to=setTimeout(()=>{if(!ok)mpFail('Keine Antwort. Stimmt der Code, und ist der Host noch online?')},15000);
    c.on('open',()=>{ok=true;clearTimeout(to);c.send({t:'hi',nm:mpName()});
      const u=p.connect(MPPRE+code,{reliable:false,label:'u'});u.on('open',()=>{NET.hostU=u});u.on('data',d=>mpRecv(d,c));u.on('close',()=>{if(NET.hostU===u)NET.hostU=null})});
    c.on('data',d=>mpRecv(d,c));
    c.on('close',()=>{if(NET.role==='guest'){log('Die Verbindung zum Host ist abgerissen.','#ff8a6a');banner('OFFLINE','Zurück in deiner eigenen Welt','',2200);mpStop()}})});
  p.on('error',er=>{if(NET.role==='joining')mpFail(mpErr(er));else if(NET.role==='guest'&&er.type!=='peer-unavailable')log('Online: '+mpErr(er),'#ff8a6a')})}

function mpStop(quiet){const was=NET.role;
  try{if(NET.role==='host')for(const c of NET.conns.values())if(c.open)c.send({t:'bye'});if(NET.host&&NET.host.open)NET.host.send({t:'bye'})}catch(e){}
  try{NET.peer&&NET.peer.destroy()}catch(e){}
  if(NET.sync)mpUnsync();if(NET.shView)mpShView(false);NET.shared=null;NET.shSeq=0;NET.shAck={};
  NET.peer=null;NET.host=null;NET.hostU=null;NET.hostSync=null;NET.joinView=0;NET.conns.clear();NET.others.clear();NET.role=null;NET.code=null;NET.st='';NET.goTo=0;
  if(P&&P.down>0){P.down=0;P.dead=false;P.hp=Math.max(1,P.d.life*.2)}
  if(was==='guest')mpLeaveWorld();if(!quiet&&was)log('Online beendet.','#a39b88');mpMenu();mpHud(1)}
addEventListener('pagehide',()=>{try{NET.peer&&NET.peer.destroy()}catch(e){}});

// sending: the fast lane for the movement stream, the reliable one for everything that must arrive
function mpTo(c,o,fast){if(!c)return;if(fast&&c.fast&&c.fast.open)c.fast.send(o);else if(c.open)c.send(o)}
function mpSend(o,fast){if(NET.role==='host'){for(const c of NET.conns.values())mpTo(c,o,fast)}else if(NET.role==='guest'){if(fast&&NET.hostU&&NET.hostU.open)NET.hostU.send(o);else if(NET.host&&NET.host.open)NET.host.send(o)}}
const mpConnOf=id=>NET.conns.get(id);
// clocks: the smallest gap between sending and arriving is the path itself; anything above it is a late packet
function mpClock(o,ts){const v=performance.now()-ts;if(o.off==null||v<o.off)o.off=v;else o.off+=(v-o.off)*.02}
const mpNow=o=>performance.now()-(o.off||0);
function mpPush(b,q){if(b.length&&q.t<=b[b.length-1].t)return;b.push(q);if(b.length>14)b.shift()}
// a stream replayed late: between the two samples around that moment, a little beyond the last when one is missing
function mpAt(b,t){const n=b.length;if(!n)return null;if(n===1||t<=b[0].t)return b[0];
  for(let i=n-1;i>0;i--){const a=b[i-1],c=b[i];if(t>=a.t){if(hyp(c.x-a.x,c.y-a.y)>5)return t<c.t?a:c;
    if(t<=c.t){const k=(t-a.t)/Math.max(1,c.t-a.t);return{x:a.x+(c.x-a.x)*k,y:a.y+(c.y-a.y)*k}}
    const k=Math.min(t-c.t,120)/Math.max(1,c.t-a.t),x=c.x+(c.x-a.x)*k,y=c.y+(c.y-a.y)*k;return walkable(x,y)?{x,y}:c}}return b[0]}
// where a friend stands right now on their own screen: the newest sample, carried forward by the time it travelled
function mpLatest(r){const b=r.buf||[],n=b.length;if(!n)return[r.tx,r.ty];const c=b[n-1];if(n<2)return[c.x,c.y];const a=b[n-2];if(hyp(c.x-a.x,c.y-a.y)>3)return[c.x,c.y];
  const k=Math.min(150,Math.max(0,mpNow(r)-c.t))/Math.max(1,c.t-a.t),x=c.x+(c.x-a.x)*k,y=c.y+(c.y-a.y)*k;return walkable(x,y)?[x,y]:[c.x,c.y]}

// a guest plays in the host's world while connected; their own islands wait in the save
function mpWorldPack(){return{owFires:G.owFires||{},owSeen:[...(G.owSeen||[])],owClear:[...(G.owClear||[])],owRespawn:G.owRespawn||null}}
function mpWorldUnpack(w){w=w||{};G.owFires=w.owFires||{};G.owSeen=new Set(w.owSeen||[]);G.owClear=new Set(w.owClear||[]);G.owRespawn=w.owRespawn||null}
function mpEnterWorld(seed){if(G.mpOwn&&G.seed===seed)return;if(!G.mpOwn&&G.seed===seed){G.mpOwn={seed,same:1,...mpWorldPack()};return}
  if(!G.mpOwn)G.mpOwn={seed:G.seed,...mpWorldPack()};else{G.mpw=G.mpw||{};G.mpw[G.seed]=mpWorldPack()}
  G.seed=seed;mpWorldUnpack((G.mpw||{})[seed]);G.maps={};G.owAt=null;if(G.state==='play'||G.state==='paused')enterFloor(0)}
function mpLeaveWorld(){const o=G.mpOwn;if(!o)return;G.mpOwn=null;if(o.same)return;G.mpw=G.mpw||{};G.mpw[G.seed]=mpWorldPack();
  G.seed=o.seed;mpWorldUnpack(o);G.maps={};G.owAt=null;if(G.state==='play'||G.state==='paused'){enterFloor(0);banner('DER HÜGEL','Zurück in deiner eigenen Welt','',2200)}}
const _saveDataMP=saveData;saveData=function(){const d=_saveDataMP();if(!d)return d;const o=G.mpOwn;
  if(o&&!o.same){const w=mpWorldPack();d.g.mpw=Object.assign({},G.mpw||{},{[G.seed]:w});d.g.seed=o.seed;d.g.owFires=o.owFires;d.g.owSeen=o.owSeen;d.g.owClear=o.owClear;d.g.owRespawn=o.owRespawn}
  else if(G.mpw)d.g.mpw=G.mpw;return d};

// messages. Everyone: s state, l look, k skill, bf beacons, rv revive. Host to guest: w welcome, e/es/ed/eo monsters, tl/pj attacks, hu hurt. Guest to host: h hit
const MPRELAY=new Set(['s','l','k','bf','rv']);
function mpRecv(d,c){if(!d||!d.t)return;
  if(d.t==='w'){if(NET.role!=='joining')return;NET.role='guest';NET.code=d.code;NET.me=d.id;NET.st='';NET.hostName=d.host;NET.bfSig='';mpEnterWorld(d.seed);NET.goTo=1;
    log('Verbunden: du bist in der Welt von '+d.host+'.','#9ad0ff');banner('ONLINE','In der Welt von '+d.host,'boss',2600);sample&&sample('portal',.5,{rate:1.2});closeMenu();mpHud(1);c.send(mpLook());return}
  if(d.t==='full'){mpFail('Dieses Spiel ist schon voll.');return}
  if(d.t==='bye'){if(NET.role==='guest'&&c===NET.host){log(NET.hostName+' hat das Spiel beendet.','#ff8a6a');banner('OFFLINE','Der Host hat das Spiel beendet','',2400);mpStop(true)}else if(c.mpId)mpDrop(c.mpId);return}
  if(d.t==='gone'){const r=NET.others.get(d.id);if(r)log(r.nm+' hat das Spiel verlassen.','#a39b88');NET.others.delete(d.id);mpHud(1);return}
  if(d.t==='hi')return;
  if(NET.role==='guest'){
    if(d.t==='sl'){mpShRecv(d);return}if(d.t==='sno'){mpShLate(d);return}
    if(d.t==='e'){mpSnap(d);return}if(d.t==='es'){mpSpawnMirrors(d);return}if(d.t==='ex'){mpMirGone(d);return}if(d.t==='ed'){mpMirrorDies(d);return}if(d.t==='eo'){if(NET.sync)mpUnsync();return}
    if(d.t==='tl'){mpEnemyTeles(d);return}if(d.t==='pj'){mpEnemyShots(d);return}
    // a blow lands when its swing shows here, since monsters are replayed a tenth of a second late
    if(d.t==='hu'){setTimeout(()=>{if(P&&!P.dead&&mpOn()){const src=d.n!=null?NET.mir.get(d.n):d.sx!=null?{x:d.sx,y:d.sy}:null;hurtPlayer(d.d,d.el||null,src)}},MPLAG);return}}
  if(NET.role==='host'&&d.t==='h'){mpGuestHit(d,c);return}
  if(NET.role==='host'&&d.t==='sx'){mpShOps(d,c);return}
  if(NET.role==='host'&&d.t==='rq'){if(c.known)for(const n of d.l||[])c.known.delete(n);return}
  const id=NET.role==='host'?c.mpId:d.id;if(!id||id===NET.me)return;
  if(NET.role==='host'&&MPRELAY.has(d.t)){d.id=id;for(const[k,cc]of NET.conns)if(k!==id)mpTo(cc,d,d.t==='s')}
  if(d.t==='bf'){mpBeacons(d,id);return}
  if(d.t==='rv'){if(d.to===NET.me)mpRevived(d.by);return}
  let r=NET.others.get(id);if(!r){r=mpRemote(id);NET.others.set(id,r)}
  if(d.t==='s')mpState(r,d);
  else if(d.t==='k')mpCastFx(r,d);
  else if(d.t==='l'){r.look=d;r.cls=d.cls||'wanderer';if(d.qi>(P&&P.qi||0))mpQuestSync(d.qi,d.nm||r.nm);r.eq=d.eq||{};r.d.okS=new Set(Object.values(r.eq).filter(Boolean));if(d.nm)r.nm=d.nm;
    if(!r.hello){r.hello=1;log(r.nm+(NET.role==='host'?' ist deinem Spiel beigetreten.':' ist online.'),'#9ad0ff');if(NET.role==='host')banner(r.nm.toUpperCase(),'ist deinem Spiel beigetreten','',2200);mpMenu()}}}
// the chronicle follows whoever is furthest: the others have those quests marked done at once, but without glut, experience or talent points
function mpQuestSync(qi,who){if(!P||G.state==='title')return;const to=Math.min(qi,QUESTS.length),from=P.qi||0;if(to<=from)return;
  P.qi=to;qStart();const n=curQ();banner('CHRONIK ANGEGLICHEN',(to-from)+(to-from===1?' Quest':' Quests')+' von '+(who||'deinem Mitspieler')+' übernommen','',2800);sfx('pick');
  log(`Chronik an ${who||'deinen Mitspieler'} angeglichen: ${to-from} ${to-from===1?'Quest':'Quests'} als erledigt eingetragen, ohne Belohnung.`,'#e8c878');
  if(n)log('Neue Quest: '+n.t,'#ffd88a');else log('Die Chronik ist vollendet.','#ffd88a');qHtml='';save()}
function mpRemote(id){return{id,nm:'Mitspieler',x:0,y:0,tx:0,ty:0,vx:0,vy:0,face:0,floor:null,anim:0,atkT:0,atkDur:.4,eq:{},d:{okS:new Set()},cls:'wanderer',ghosts:[],trail:[],buf:[],hurt:0,moving:false,dead:false,down:0,rv:0,roll:0,whirl:0,ward:0,leap:null,ride:false,hs:rgHS(),lvl:1,hp:1,hm:1,seen:0,fresh:1}}
function mpState(r,d){const ts=d.ts!=null?d.ts:performance.now();if(r.lts!=null&&ts<=r.lts)return;r.lts=ts;mpClock(r,ts);
  const far=r.fresh||r.floor!==d.fl;if(far){r.buf=[];r.x=d.x;r.y=d.y;r.hs=rgHS()}mpPush(r.buf,{t:ts,x:d.x,y:d.y});r.tx=d.x;r.ty=d.y;r.at=performance.now();r.fresh=0;
  r.face=d.f;r.floor=d.fl;r.moving=!!d.mv;r.ride=!!d.r;r.dead=!!d.dd;r.down=performance.now()<r.rvCool?0:d.dn||0;if(r.down===0&&performance.now()<r.rvCool)r.dead=false;r.roll=d.ro||0;r.rollFlip=!!d.rf;r.veilT=d.vl||0;r.lvl=d.lv;r.hp=d.hp;r.hm=d.hm;r.rvi=d.rvi||null;r.rvp=d.rvp||0;if(d.nm)r.nm=d.nm;r.seen=performance.now();
  if(d.a>0){r.atkDur=d.ad||.4;const t=(1-d.a)*r.atkDur;if(!(r.atkT>0)||Math.abs(r.atkT-t)>.15)r.atkT=t}
  if(NET.goTo&&NET.role==='guest'&&r.id==='h'){NET.goTo=0;if(typeof d.fl==='number'&&d.fl===0&&G.floor===0)mpTravel('h',1);else if(typeof d.fl==='number')log(r.nm+' ist im Turm, '+floorTitle(d.fl)+'. Am Leuchtfeuer kannst du zu '+r.nm+' reisen.','#9ad0ff')}}
function mpLook(){const eq={};for(const k of['weapon','offhand','helm','armor','gloves','boots','belt','mount']){const it=P&&P.eq[k];if(it&&(k==='mount'||P.d.okS.has(it)))eq[k]=it}return{t:'l',id:NET.me,cls:P?P.cls:'wanderer',nm:mpName(),eq,qi:P?P.qi||0:0}}

// the movement stream: 30 times a second, with a velocity so the others can look a little ahead
setInterval(()=>{if(!mpOn()||!P||G.state==='title'||!P.d)return;const now=performance.now(),dt=Math.max(.016,(now-(NET.st0||now-33))/1000);
  NET.st0=now;
  let rvi=null,rvp=0;for(const r of NET.others.values())if(r.rv>0){rvi=r.id;rvp=+(r.rv/MPREV).toFixed(2)}
  mpSend({t:'s',id:NET.me,ts:Math.round(now),x:+P.x.toFixed(2),y:+P.y.toFixed(2),f:+(P.face||0).toFixed(2),fl:G.floor,hp:Math.round(P.hp),hm:Math.round(P.d.life),lv:P.lvl,mv:P.moving?1:0,
    a:P.atkT>0?+(1-P.atkT/P.atkDur).toFixed(2):0,ad:P.atkDur||.4,r:riding()?1:0,dd:P.dead?1:0,dn:P.down>0?+P.down.toFixed(1):0,ro:P.roll>0?+P.roll.toFixed(2):0,rf:P.roll>0&&P.rollFlip?1:0,vl:P.veilT>0?+P.veilT.toFixed(1):0,rvi,rvp,nm:mpName()},true);
  const L=mpLook(),h=JSON.stringify(L.eq).length+'|'+Object.values(L.eq).map(i=>i.id).join(',')+L.cls+L.nm+'|'+L.qi;if(h!==NET.lookH||now-NET.lookT>6000){NET.lookH=h;NET.lookT=now;mpSend(L)}},33);

/* ----- shared monsters ----- */
// host: who stands close enough to share the host's monsters, and a stand-in hero for each of them
function mpSyncList(){const out=[];if(NET.role!=='host'||typeof G.floor!=='number')return out;
  for(const[id,c]of NET.conns){const r=NET.others.get(id);c.syncOn=r&&!r.stale&&r.floor===G.floor&&r.buf.length?1:0;if(c.syncOn){r.conn=c;out.push(r)}}return out}
// the islands around a friend on the host's floor stay awake on the host's machine
owCentres=(cx,cy)=>{const o=[[cx,cy]];if(NET.role!=='host'||G.floor!==0)return o;
  for(const r of NET.others.values())if(!r.stale&&r.floor===0&&r.buf.length){const q=[Math.floor(r.tx/CH),Math.floor(r.ty/CH)];if(!o.some(z=>z[0]===q[0]&&z[1]===q[1]))o.push(q)}return o};
function mpProxy(r){const[x,y]=mpLatest(r),p=Object.create(P);Object.assign(p,{x,y,dead:r.dead||r.down>0,iframe:0,dash:null,roll:0,leap:null,hp:Math.max(1,r.hp),mpProxy:r});return p}
// host: monsters pick the nearest standing hero, and keep their choice unless another comes much closer
const _updEnemyMP=updEnemy;updEnemy=function(e,dt){if(e.mir){mpMirTick(e,dt);return}const L=NET.hostSync;if(!L||!L.length)return _updEnemyMP(e,dt);
  const me=!(P.dead||P.down>0);let best=me?null:undefined,bd=me?hyp(e.x-P.x,e.y-P.y)-(e.tg==='h'?2:0):1e9;
  for(const r of L){if(r.dead||r.down>0)continue;const d=hyp(e.x-r.x,e.y-r.y)-(e.tg===r.id?2:0);if(d<bd){bd=d;best=r}}
  if(!best){e.tg='h';return _updEnemyMP(e,dt)}e.tg=best.id;const P0=P,F0=G.flow,O0=G.flowO;P=best.px||(best.px=mpProxy(best));
  // around walls a monster follows the path to the friend it hunts, not to the host
  if(best.flow){G.flow=best.flow;G.flowO=best.flowO}try{_updEnemyMP(e,dt)}finally{P=P0;G.flow=F0;G.flowO=O0}};
// host: a blow meant for a friend's stand-in travels to that friend, who takes it with their own armour
const _hurtPlayerMP=hurtPlayer;hurtPlayer=function(dmg,elem,src){if(P&&P.mpProxy){const c=P.mpProxy.conn;mpTo(c,{t:'hu',d:+dmg.toFixed(1),el:elem||null,n:src&&src.nid!=null?src.nid:null,sx:src?+(+src.x).toFixed(2):null,sy:src?+(+src.y).toFixed(2):null});return true}return _hurtPlayerMP(dmg,elem,src)};
// host: more heroes, tougher monsters
const mpParty=f=>function(...a){const e=f.apply(this,a);if(e&&NET.role==='host'&&NET.conns.size){const k=1+.6*Math.min(3,NET.conns.size);e.hp*=k;e.max=e.hp}return e};
makeEnemy=mpParty(makeEnemy);makeBoss=mpParty(makeBoss);makeWBoss=mpParty(makeWBoss);
const _recalcMP=recalc;recalc=function(){_recalcMP();if(P&&P.d&&mpOn())P.d.mf+=20*(NET.others.size)};
// host: what a guest needs to rebuild a monster of their own
function mpDesc(e){const p={};for(const k of Object.keys(e)){const v=e[k];if(k==='dead'||k==='dieT'||k==='ck'||k==='tg'||k==='_mp')continue;if(v==null||typeof v==='number'||typeof v==='string'||typeof v==='boolean')p[k]=v;else if(Array.isArray(v)&&v.length<12&&v.every(q=>q==null||typeof q!=='object'))p[k]=v.slice()}
  return{c:e.rgk?'r':e.wb?'w':e.boss?'b':'e',p}}
// host: twenty times a second, every friend on this floor gets the monsters around them
function mpHostSync(dt){const L=NET.hostSync=mpSyncList();NET.snapT-=dt;const m=G.map;
  for(const c of NET.conns.values())if(!c.syncOn&&c.wasSync){c.wasSync=0;c.known.clear();mpTo(c,{t:'eo'})}
  if(!L.length)return;
  for(const r of L){r.px=mpProxy(r);r.flT=(r.flT||0)-dt;
    if(r.flT<=0){r.flT=.3;const P0=P,F0=G.flow,O0=G.flowO;P=r.px;G.flow=r.flow||null;try{computeFlow();r.flow=G.flow;r.flowO=G.flowO}finally{P=P0;G.flow=F0;G.flowO=O0}}
    // monsters make room for a friend just as they do for the host
    for(const e of m.enemies){if(e.dead||e.mir)continue;const dx=e.x-r.px.x,dy=e.y-r.px.y,dd=hyp(dx,dy),mn=e.r+P.r;if(dd<mn&&dd>.001&&!(r.roll>0))moveEnt(e,dx/dd*(mn-dd),dy/dd*(mn-dd))}}
  // monster attacks: every new strike zone and shot goes to the friends near it
  const tl=[],pj=[];
  for(const t of G.tele)if(!t._mp){t._mp=1;if(t.ally||t.owner==='p')continue;const o=t.owner;if(o&&o.nid==null)o.nid=++NET.nid;
    tl.push({shape:t.shape,x:+t.x.toFixed(2),y:+t.y.toFixed(2),r:t.r,ang:t.ang,arc:t.arc,len:t.len,w:t.w,t:t.t,dur:t.dur,dmg:+(t.dmg||0).toFixed(1),elem:t.elem||null,meteor:t.meteor?1:0,follow:t.follow?1:0,n:o?o.nid:null})}
  for(const p of G.proj)if(!p._mp){p._mp=1;if(p.owner!=='e')continue;pj.push({x:+p.x.toFixed(2),y:+p.y.toFixed(2),vx:+p.vx.toFixed(2),vy:+p.vy.toFixed(2),dmg:+(p.dmg||0).toFixed(1),kind:p.kind,r:p.r,life:p.life})}
  for(const r of L){const near=o=>hyp(o.x-r.px.x,o.y-r.px.y)<MPSEE;const a=tl.filter(near),b=pj.filter(near);if(a.length)mpTo(r.conn,{t:'tl',fl:G.floor,l:a});if(b.length)mpTo(r.conn,{t:'pj',fl:G.floor,l:b})}
  if(NET.snapT>0)return;NET.snapT=.05;
  const ts=Math.round(performance.now());
  for(const r of L){const c=r.conn,nw=[],snap=[],seen=new Set();c.wasSync=1;
    for(const e of m.enemies){if(e.dead||(e.dummy||e.wall))continue;if(e.nid==null)e.nid=++NET.nid;if(hyp(e.x-r.px.x,e.y-r.px.y)>(c.known.has(e.nid)?MPSEE+6:MPSEE))continue;seen.add(e.nid);if(!c.known.has(e.nid)){c.known.add(e.nid);nw.push([e.nid,mpDesc(e)])}
      snap.push([e.nid,Math.round(e.x*100)/100,Math.round(e.y*100)/100,Math.round((e.face||0)*100)/100,Math.round(e.hp),(e.aggro?1:0)|(e.charge>0?2:0)|(e.lungeT>0?4:0)|(e.slow>0?8:0),Math.round(e.max)])}
    // what walked out of sight or was unloaded leaves the friend's screen too
    const gone=[];for(const n of c.known)if(!seen.has(n))gone.push(n);for(const n of gone)c.known.delete(n);
    if(gone.length)mpTo(c,{t:'ex',l:gone});if(nw.length)mpTo(c,{t:'es',fl:G.floor,ts,l:nw});mpTo(c,{t:'e',fl:G.floor,ts,l:snap},true)}}
// host: a friend's blow lands on the real monster
function mpGuestHit(d,c){const r=NET.others.get(c.mpId);if(!r||r.floor!==G.floor)return;const e=G.map.enemies.find(x=>x.nid===d.n&&!x.dead);if(!e)return;const o=d.o||{};
  if(o.ven){e.dotT=3;e.dotD=Math.max(e.dotD||0,o.ven)}
  NET.hitBy=r.id;try{hitEnemy(e,d.d,{crit:!!o.crit,slow:o.slow||0,kb:o.kb||0,from:o.from!=null?o.from:Math.atan2(e.y-r.y,e.x-r.x),col:o.col||'#9ad0ff',ally:true})}finally{NET.hitBy=null}}
// host: every death is announced to the friends who saw that monster
const _killEnemyMP=killEnemy;killEnemy=function(e,a){const was=e.dead;_killEnemyMP(e,a);if(NET.role!=='host'||was||e.nid==null||e.mir)return;
  for(const c of NET.conns.values())if(c.known&&c.known.has(e.nid)){c.known.delete(e.nid);mpTo(c,{t:'ed',n:e.nid,a:+(e.fallA||0).toFixed(2)})}};

// guest: mirrors of the host's monsters
function mpHostHere(){const h=NET.others.get('h');return NET.role==='guest'&&!!h&&!h.stale&&typeof G.floor==='number'&&h.floor===G.floor}
function mpSyncOn(){if(NET.sync&&NET.syncMap===G.map)return;if(NET.sync)mpUnsync();NET.sync=true;NET.syncMap=G.map;NET.mir.clear();NET.lastSnap=0;NET.ask={};G.map.enemies=G.map.enemies.filter(e=>(e.dead||(e.dummy||e.wall))&&!e.mir)}
// the host went elsewhere: in the tower the monsters left behind are yours now, on the islands your own come back
function mpUnsync(){const m=NET.syncMap;NET.sync=false;NET.syncMap=null;NET.mir.clear();if(!m)return;
  if(m.world){m.enemies=m.enemies.filter(e=>!e.mir&&!e.ck);m.active=new Set();m.ac=null;if(m===G.map)owTick()}
  else for(const e of m.enemies)if(e.mir){delete e.mir;e.buf=null;e.aggro=false}}
function mpMkMirror(nid,s){const p=s.p||{},pm=G.mlvl;let e=null;G.mlvl=p.ml||pm;
  try{if(s.c==='r'&&typeof makeRgBoss==='function')e=makeRgBoss(p.x,p.y);else if(s.c==='w')e=makeWBoss(Math.max(0,WB.findIndex(b=>b.id===p.wb)),p.x,p.y);
    else if(s.c==='b')e=makeBoss(typeof G.floor==='number'&&G.floor>0?G.floor:3,p.x,p.y);else e=makeEnemy(p.vid||p.type||'skel',p.x,p.y,p.rank||'normal')}catch(er){e=null}finally{G.mlvl=pm}
  if(!e)return null;Object.assign(e,p);delete e.ck;e.nid=nid;e.mir=1;e.tx=e.x;e.ty=e.y;e.ix=e.x;e.iy=e.y;e.pack=null;e.seenT=performance.now();e.buf=[];return e}
function mpSpawnMirrors(d){if(d.fl!==G.floor||!mpHostHere())return;mpSyncOn();const ts=d.ts!=null?d.ts:mpNow(NET.hc);
  for(const[nid,s]of d.l){if(NET.mir.has(nid))continue;const e=mpMkMirror(nid,s);if(e){e.buf.push({t:ts,x:e.x,y:e.y});NET.mir.set(nid,e);G.map.enemies.push(e)}}}
function mpMirGone(d){const g=new Set();for(const n of d.l||[]){const e=NET.mir.get(n);if(e){NET.mir.delete(n);g.add(e)}}if(g.size)G.map.enemies=G.map.enemies.filter(e=>!g.has(e))}
function mpSnap(d){if(d.fl!==G.floor||!mpHostHere())return;const ts=d.ts!=null?d.ts:performance.now();if(NET.lastSnap&&ts<=NET.lastSnap)return;NET.lastSnap=ts;mpClock(NET.hc,ts);
  mpSyncOn();NET.syncT=performance.now();const now=NET.syncT;let ask=null;
  for(const[nid,x,y,f,hp,fl,mx]of d.l){const e=NET.mir.get(nid);
    // a monster we never heard of: ask for it again rather than be hit by something unseen
    if(!e){if(!(now-(NET.ask[nid]||0)<1200)){NET.ask[nid]=now;(ask||(ask=[])).push(nid)}continue}if(e.dead)continue;
    mpPush(e.buf,{t:ts,x,y});e.tx=x;e.ty=y;e.face=f;
    // a friend's blows show here as they land on the host
    const lost=e.hp-hp;if(lost>.5&&now-(e.myT||0)>400){e.flash=.1;e.hitT=.18;e.oT=now;e.oAcc=(e.oAcc||0)+lost;if(now-(e.oNT||0)>180){e.oNT=now;if(CFG.numbers)ftext(e.x,e.y,Math.round(e.oAcc)+'','#9ad0ff',false);e.oAcc=0}}
    e.hp=now-(e.myT||0)<400?Math.min(e.hp,hp):hp;if(mx)e.max=mx;e.aggro=!!(fl&1);e.charge=fl&2?.2:0;if(fl&4)e.lungeT=Math.max(e.lungeT||0,.1);e.slow=fl&8?.2:0;e.seenT=now}
  if(ask)mpSend({t:'rq',l:ask})}
function mpMirTick(e,dt){const q=mpAt(e.buf||[],mpNow(NET.hc)-MPLAG),ox=e.ix,oy=e.iy;if(q){e.ix=q.x;e.iy=q.y}e.x=e.ix;e.y=e.iy;
  if(hyp(e.ix-ox,e.iy-oy)>dt*.3)e.anim+=dt*(e.spd||2)*.6;else e.anim+=dt*.3;e.flash=Math.max(0,(e.flash||0)-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);e.lungeT=Math.max(0,(e.lungeT||0)-dt);e.kvx=e.kvy=0}
// guest: the host says it fell. Whoever stood close gets the kill: experience, glut, quests and their own loot
function mpMirrorDies(d){const e=NET.mir.get(d.n);if(!e||e.dead)return;NET.mir.delete(d.n);
  if(P&&!P.dead&&hyp(e.x-P.x,e.y-P.y)<32){delete e.mir;try{killEnemy(e,d.a)}catch(er){e.dead=true;e.dieT=0}}else{e.dead=true;e.dieT=0;e.fallA=d.a}}
// guest: a strike zone or a shot from a mirrored monster; it is judged here, against your own hero
function mpEnemyTeles(d){if(!NET.sync||d.fl!==G.floor)return;for(const t of d.l){const o=t.n!=null?NET.mir.get(t.n):null;const q=Object.assign({},t,{owner:o||null,meteor:!!t.meteor,follow:!!t.follow&&!!o,_mp:1});delete q.n;G.tele.push(q)}}
function mpEnemyShots(d){if(!NET.sync||d.fl!==G.floor)return;for(const p of d.l)G.proj.push(Object.assign({owner:'e',_mp:1},p))}
// guest: your blow on a mirror shows at once here and is settled on the host
const _hitEnemyMP=hitEnemy;hitEnemy=function(e,dmg,o={}){if(!e||!e.mir)return _hitEnemyMP(e,dmg,o);if(e.dead)return;
  let d=dmg,ven=0;if(!o.ally&&d>0){if(P.cryT>0)d*=1+P.cryB/100;if(P.venomT>0)ven=d*P.venomB/300}
  mpSend({t:'h',n:e.nid,d:Math.round(d*10)/10,o:{crit:o.crit?1:0,slow:o.slow||0,kb:o.kb||0,from:o.from!=null?+o.from.toFixed(2):null,col:o.col||null,ven}});
  const now=performance.now();e.myT=now;d*=e.dmgTaken||1;if(now-(e.oT||0)<MPPINCER*1000)d*=MPPINCERX,mpPincerFx(e);e.flash=.1;e.hitT=.22;if(CFG.numbers)ftext(e.x,e.y,Math.round(d)+(o.crit?'!':''),o.crit?'#ffd94f':o.col||'#f2ecd8',o.crit);
  if(o.slow)e.slow=Math.max(e.slow||0,o.slow);const a=o.from!=null?o.from:Math.atan2(e.y-P.y,e.x-P.x);gore(e.x,e.y,a,o.crit?11:5,goreOf(e),.8*(e.scale||1));e.hp=Math.max(1,e.hp-d)};
function mpGuestTick(){if(!mpHostHere()){if(NET.sync)mpUnsync();return}
  mpSyncOn();const now=performance.now(),m=G.map;
  // on the host's floor only the host's monsters live
  if(m.enemies.some(e=>!e.mir&&!e.dead&&!(e.dummy||e.wall)))m.enemies=m.enemies.filter(e=>e.mir||e.dead||(e.dummy||e.wall));
  // a mirror that has gone quiet is dropped, and the host is asked to send it again
  const lost=[];for(const[nid,e]of NET.mir)if(!e.dead&&now-e.seenT>3000){NET.mir.delete(nid);lost.push(e)}if(lost.length){const g=new Set(lost);m.enemies=m.enemies.filter(e=>!g.has(e))}
  // your own hero pushed them aside a moment ago; where they stand is the host's word
  for(const e of NET.mir.values())if(!e.dead){e.x=e.ix;e.y=e.iy;e.kvx=e.kvy=0}}

/* ----- the pincer: hit what your friend just hit ----- */
const MPPINCER=2.5,MPPINCERX=1.2;
function mpPincerFx(e){const now=performance.now();if(now-(e.zgT||0)<2600)return;e.zgT=now;ftext(e.x,e.y-.5,'Zangengriff!','#ffd94f',true);sparks(e.x,e.y,.9,0,10,['#fff0a8','#ffd94f'],5,3)}
// host: who struck last decides; a friend's blow and yours within a breath of each other bite harder
const _hitEnemyPin=hitEnemy;hitEnemy=function(e,dmg,o={}){if(!e||e.mir||NET.role!=='host'||!NET.others.size||e.dead)return _hitEnemyPin(e,dmg,o);
  const who=NET.hitBy||(o.ally?null:'h');if(!who)return _hitEnemyPin(e,dmg,o);const now=performance.now(),hb=e.hb||(e.hb={});
  let pin=false;for(const k in hb)if(k!==who&&now-hb[k]<MPPINCER*1000)pin=true;hb[who]=now;if(pin){dmg*=MPPINCERX;mpPincerFx(e)}return _hitEnemyPin(e,dmg,o)};

/* ----- skills, seen from afar ----- */
// another hero's spell: the same light and noise, without the damage (that is dealt on their machine)
function mpCastFx(r,d){if(r.floor!==G.floor||typeof G.floor!=='number')return;const x=r.x,y=r.y,a=d.a||0,l=d.l||1,far=hyp(x-P.x,y-P.y);if(far>MPSEE)return;
  const vol=Math.max(.15,1-far/MPSEE),cs=Math.cos(a),sn=Math.sin(a);r.face=a;
  const at=mx=>{const dd=Math.min(mx,hyp((d.tx??x)-x,(d.ty??y)-y));return[x+cs*dd,y+sn*dd]};
  const vp=o=>G.vproj.push(Object.assign({x:x+cs*.4,y:y+sn*.4,life:1.2,r:.28,owner:'v'},o));
  switch(d.sk){
    case'whirl':for(let k=0;k<4;k++)slashFx(x,y,a+k*1.571,2.4,1.9,'235,225,205',.3,.6,.5);r.whirl=.35;smoke(x,y,5,'rgba(90,78,62,',6,.2);G.rings.push({x,y,r:.4,max:2,v:10,col:'#e8e2d0',hit:new Set(),dmg:0});sample('sword',.4*vol);break;
    case'fire':flash(x+cs*.5,y+sn*.5,.8,22,'255,180,80',.16);vp({vx:cs*10,vy:sn*10,kind:'glut',r:.3,life:1.4,aoe:1.4});sample('fire',.6*vol);break;
    case'nova':for(let k=0;k<40;k++){const q=k/40*6.283;fxp({k:'shard',x,y,z:.3+rnd(0,.4),vx:Math.cos(q)*9,vy:Math.sin(q)*9,vz:rnd(0,1),life:.5,col:pick(['#ffffff','#e0fff8','#a8d0ff','#6ad0ff']),s:rnd(2,3.5),rot:q,g:1})}
      shock(x,y,4.6,'170,220,255',.5,4);flash(x,y,.6,50,'170,220,255',.25);decal('frost',x,y,1.6,20);G.rings.push({x,y,r:.3,max:4.6,v:9,col:'#bfe2ff',hit:new Set(),dmg:0});break;
    case'charge':smoke(x,y,4,'rgba(90,78,62,',5,.3);setTimeout(()=>{if(r.floor===G.floor){slamFx(r.x,r.y,1.8,false);sfx('boom')}},380);break;
    case'ward':r.wardU=G.t+15;for(let k=0;k<22;k++){const q=rnd(0,6.28),rr=rnd(1.2,2);fxp({k:'bone',x:x+Math.cos(q)*rr,y:y+Math.sin(q)*rr,z:rnd(.3,1.2),vx:-Math.cos(q)*rr*3,vy:-Math.sin(q)*rr*3,vz:0,life:.33,col:pick(GORE.bone.cols),s:rnd(1.4,2.4),g:0,rot:q,vr:8})}flash(x,y,.8,40,'236,228,200',.3);break;
    case'chain':{const[tx,ty]=at(10);let cur=null,bd=3.2;for(const e of G.map.enemies){if(e.dead)continue;const dd=hyp(e.x-tx,e.y-ty);if(dd<bd&&hyp(e.x-x,e.y-y)<10){bd=dd;cur=e}}
      if(!cur)G.bolts.push({a:[x,y],b:[x+cs*4,y+sn*4],t:.2});let from={x,y};const hit=new Set();
      for(let k=0;k<3+Math.floor(l/3)&&cur;k++){G.bolts.push({a:[from.x,from.y],b:[cur.x,cur.y],t:.25});hit.add(cur);flash(cur.x,cur.y,.7,30,'180,210,255',.2);sparks(cur.x,cur.y,.7,0,10,['#ffffff','#cfe0ff','#7aa4ff'],6,3.2);from=cur;let nx=null,nd=4.5;for(const e of G.map.enemies){if(e.dead||hit.has(e))continue;const dd=hyp(e.x-from.x,e.y-from.y);if(dd<nd){nd=dd;nx=e}}cur=nx}
      sfx('zap');break}
    case'slam':for(let k=1;k<=12;k++){const dd=k*.5,px=x+cs*dd,py=y+sn*dd;if(!walkable(px,py))break;setTimeout(()=>{gore(px,py,a,4,GORE.rock,.6);smoke(px,py,2,'rgba(90,78,62,',6,.4);shock(px,py,.8,'200,180,140',.25,2)},k*25)}sfx('boom');break;
    case'cry':shock(x,y,5,'255,120,60',.6,5);flash(x,y,1,60,'255,140,80',.3);ftext(x,y-.4,'Kriegsschrei!','#ff8a5a',true);sfx('boom');break;
    case'leap':{const[ex,ey]=at(7);setTimeout(()=>{if(r.floor!==G.floor)return;slamFx(ex,ey,2.4,true);decal('crack',ex,ey,1.6,40);sfx('boom');if(hyp(ex-P.x,ey-P.y)<8)G.shake=Math.max(G.shake,5)},500);sfx('roll');break}
    case'multi':{const n=5+Math.floor(l/4);sample('fire',.25*vol,{rate:1.6});for(let k=0;k<n;k++){const q=a+(k-(n-1)/2)*.13;G.vproj.push({x:x+Math.cos(q)*.4,y:y+Math.sin(q)*.4,vx:Math.cos(q)*15,vy:Math.sin(q)*15,kind:'arrow',r:.28,life:1.1,owner:'v'})}break}
    case'pierce':vp({vx:cs*20,vy:sn*20,kind:'arrow',big:true,pierce:true,life:.9});flash(x+cs*.5,y+sn*.5,.8,26,'255,240,200',.14);break;
    case'trap':{const[tx,ty]=at(6);smoke(tx,ty,3,'rgba(60,70,40,',4,.3);sfx('pick');break}
    case'dash':smoke(x,y,5,'rgba(40,30,60,',6,.3);setTimeout(()=>{if(r.floor===G.floor)smoke(r.x,r.y,5,'rgba(40,30,60,',6,.3)},120);sfx('roll');break;
    case'rain':{const[rx,ry]=at(9);G.vzones.push({k:'rain',x:rx,y:ry,r:2.5,t:0,dur:2});break}
    case'venom':flash(x,y,1,40,'140,230,80',.3);for(let k=0;k<20;k++)fxp({k:'mote',x:x+rnd(-.5,.5),y:y+rnd(-.5,.5),z:rnd(.3,1.4),vx:rnd(-1,1),vy:rnd(-1,1),vz:rnd(0,1),life:.8,col:pick(['#9ae050','#d8ff9a']),s:rnd(1,2),g:0});break;
    case'meteor':{const[mx,my]=at(10);G.vzones.push({k:'meteor',x:mx,y:my,r:2.4,t:0,dur:.9});sample('fire',.5*vol,{rate:.7});break}
    case'blink':{boom(x,y,.9,'fire');const[bx,by]=at(8);boom(bx,by,.9,'fire');sfx('zap');break}}}
// your own casts are announced the moment they succeed
const _castSkillMP=castSkill;castSkill=function(id,tx,ty){const before=P&&P.cds?P.cds[id]||0:0;_castSkillMP(id,tx,ty);
  if(mpOn()&&P&&P.cds&&(P.cds[id]||0)>before+.01)mpSend({t:'k',id:NET.me,sk:id,l:skLvl(id),a:+(P.face||0).toFixed(3),tx:+(+tx).toFixed(2),ty:+(+ty).toFixed(2)})};
// shadow shots and falling stars: they fly and burn, but only for the eye
function mpFxTick(dt){const m=G.map;G.vproj=G.vproj||[];G.vzones=G.vzones||[];
  for(const p of G.vproj){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;let end=!walkable(p.x,p.y);
    if(!end&&!p.pierce)for(const e of m.enemies)if(!e.dead&&hyp(e.x-p.x,e.y-p.y)<e.r+p.r){end=true;break}
    if(end||p.life<=0){p.life=0;if(p.aoe){boom(p.x,p.y,p.aoe/1.3,'fire')}else if(p.kind==='arrow')sparks(p.x,p.y,.5,Math.atan2(-p.vy,-p.vx),5,['#ffffff','#d8d0bc'],3)}
    else if(p.kind==='glut')fxp({k:'ember',x:p.x,y:p.y,z:.55+rnd(-.1,.1),vx:rnd(-.6,.6),vy:rnd(-.6,.6),vz:rnd(.3,1.2),life:rnd(.25,.5),col:pick(['#ffc070','#ff9a30','#e0661a']),s:rnd(1,2),g:-1})}
  G.vproj=G.vproj.filter(p=>p.life>0);
  for(const z of G.vzones){z.t+=dt;
    if(z.k==='rain')for(let q=0;q<3;q++){const a=rnd(0,6.28),rr=rnd(0,z.r);fxp({k:'shard',x:z.x+Math.cos(a)*rr,y:z.y+Math.sin(a)*rr,z:3,vx:0,vy:0,vz:-14,life:.2,col:'#e8e2d0',s:1.4,rot:1.57,g:0})}
    if(z.k==='meteor'){if(!z.hit&&z.t>=z.dur){z.hit=1;boom(z.x,z.y,2,'fire');decal('scorch',z.x,z.y,2,40);sfx('boom');if(hyp(z.x-P.x,z.y-P.y)<10)G.shake=Math.max(G.shake,6)}
      else if(!z.hit&&Math.random()<.5)fxp({k:'ember',x:z.x+rnd(-.3,.3),y:z.y+rnd(-.3,.3),z:4*(1-z.t/z.dur)+.3,vx:0,vy:0,vz:-3,life:.3,col:'#ffc070',s:2,g:0})}}
  G.vzones=G.vzones.filter(z=>z.t<z.dur||(z.k==='meteor'&&!z.hit))}
const _renderMP=render;render=function(){if(!(G.vproj&&G.vproj.length)&&!(G.vzones&&G.vzones.length))return _renderMP();const p0=G.proj,z0=G.zones;G.proj=p0.concat(G.vproj);G.zones=z0.concat(G.vzones.filter(z=>z.k!=='meteor'||!z.hit));try{_renderMP()}finally{G.proj=p0;G.zones=z0}};

/* ----- beacons for everyone ----- */
function mpBeaconSig(){return Object.keys(G.owFires||{}).sort().join(',')+'|'+Object.keys(G.lit||{}).sort().join(',')}
function mpBeacons(d,id){let n=0;const r=NET.others.get(id),who=r?r.nm:'Ein Mitspieler';
  for(const k in d.f||{})if(!G.owFires[k]){G.owFires[k]=d.f[k];n++;if(n<=2)log(`${who} hat ein Leuchtfeuer entzündet: ${d.f[k].name||'Leuchtfeuer'}`,'#ffd88a')}
  for(const f of d.lit||[]){const k=+f;if(k>0&&!G.lit[k]){G.lit[k]=true;n++}}if(n)NET.bfSig=''}

/* ----- falling, and being carried back ----- */
function mpAllyNear(){for(const r of NET.others.values())if(!r.stale&&!r.dead&&!(r.down>0)&&r.floor===G.floor&&hyp(r.x-P.x,r.y-P.y)<60)return true;return false}
const _dieMP=die;die=function(){if(mpOn()&&P&&!(P.down>0)&&mpAllyNear()){P.down=MPDOWN;P.dead=true;P.hp=0;P.poisonT=0;P.heal=0;G.deathT=1e9;P.path=[];P.target=null;P.interact=null;
    sfx('death');G.stepS=stopLoop(G.stepS);G.heartS=stopLoop(G.heartS);banner('NIEDERGESTRECKT','Dein Mitspieler hat '+MPDOWN+' Sekunden, dich aufzurichten','death',3200);mpSend({t:'s',id:NET.me,ts:Math.round(performance.now()),x:+P.x.toFixed(2),y:+P.y.toFixed(2),fl:G.floor,dd:1,dn:MPDOWN,hp:0,hm:Math.round(P.d.life),lv:P.lvl,f:P.face||0,nm:mpName()});return}
  if(P)P.down=0;_dieMP()};
function mpRevived(by){if(!P||!(P.down>0))return;const r=NET.others.get(by);P.down=0;P.dead=false;G.deathT=0;P.hp=Math.max(1,P.d.life*.35);P.iframe=2;
  banner('WIEDERBELEBT',r?'von '+r.nm:'','',2200);sfx('lvl');burst(P.x,P.y,'#ffe08a',26,3);flash(P.x,P.y,1,60,'255,230,160',.35)}
// while you lie there the world goes on: the monsters move, you cannot
const _updateMP=update;update=function(dt){if(!P||!(P.down>0)){_updateMP(dt);if(P&&P.dead&&mpOn())mpTick(dt);return}
  P.down-=dt;if(P.down<=0||!mpAllyNear()){P.down=0;P.dead=false;_dieMP();_updateMP(dt);return}
  const md=mouse.down;mouse.down=false;P.dead=false;P.hp=1;P.iframe=Math.max(P.iframe,.2);P.path=[];P.target=null;P.interact=null;P.pickup=null;P.standAtk=null;P.atkT=0;
  try{_updateMP(dt)}finally{P.hp=0;P.dead=true;mouse.down=md;G.deathT=1e9}};
// a fallen hero: a slow red pulse, the time left, and the friend's hand on the shoulder
const _drawPlayerMP=drawPlayer;drawPlayer=function(){_drawPlayerMP();if(!P||!(P.down>0))return;const[sx,sy]=iso(P.x,P.y);
  const pr=P.mpRemote?P.rv/MPREV:Math.max(0,...[...NET.others.values()].filter(r=>r.rvi===NET.me).map(r=>r.rvp||0),0),pul=.5+Math.sin(G.t*6)*.25;
  ctx.save();ctx.strokeStyle=`rgba(200,40,30,${pul})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy,30,15,0,0,7);ctx.stroke();
  if(pr>0){ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx,sy,30,15,0,-Math.PI/2,-Math.PI/2+pr*Math.PI*2);ctx.stroke()}
  ctx.font="bold 13px 'IM Fell English', Georgia, serif";ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillText(Math.ceil(P.down)+'',sx+1,sy-35);ctx.fillStyle=pr>0?'#ffe08a':'#ff6a50';ctx.fillText(Math.ceil(P.down)+'',sx,sy-36);
  if(P.mpRemote&&pr<=0&&hyp(P.x-NET.meX,P.y-NET.meY)<5){ctx.font="12px 'IM Fell English', Georgia, serif";ctx.fillStyle='#ffe08a';ctx.fillText('Daneben stehen bleiben',sx,sy+30)}ctx.restore()};

/* ----- the shared chest: one more drawer in the bottomless chest while online ----- */
// It lives in the host's save and the host's word is final: a guest's item leaves their hands when the host has it, and
// a guest takes one only for as long as nobody else was quicker. Each change goes out as a whole new list.
NET.shared=null;NET.shView=false;NET.shSnap=null;NET.shSeq=0;NET.shAck={};NET.shU=0;NET.shC=0;
const mpShKey=i=>i.su!=null?i.su:i.cu;
const mpShHost=()=>{if(!G.mpShared)G.mpShared=[];for(const it of G.mpShared)if(it.su==null)it.su=++NET.shU;else NET.shU=Math.max(NET.shU,it.su);return G.mpShared};
const mpShSnap=a=>new Map(a.map(it=>[it,it.gx+','+it.gy]));
function mpShList(){return JSON.parse(JSON.stringify(G.mpShared||[]))}
function mpShBroadcast(){if(NET.role!=='host')return;const l=mpShList();for(const[id,c]of NET.conns)if(c.open)c.send({t:'sl',l,ack:NET.shAck[id]||0})}
function mpShView(on){on=!!on&&mpOn()&&!!NET.shared;if(on===NET.shView)return;
  if(on){P.ownStash=P.stash;P.stash=NET.shared;NET.shSnap=mpShSnap(NET.shared)}else{P.stash=P.ownStash||P.stash;P.ownStash=null;NET.shSnap=null}NET.shView=on}
// host: place an item where it was dropped, or in the first free spot when someone else got there first
function mpShPut(it,x,y){const L=G.mpShared,[w,h]=isz(it),fits=(a,b)=>!L.some(o=>{const[c,d]=isz(o);return a<o.gx+c&&a+w>o.gx&&b<o.gy+d&&b+h>o.gy});
  if(it.su==null||L.some(o=>o.su===it.su))it.su=++NET.shU;
  if(x!=null&&x>=0&&x<=SW-w&&y>=0&&fits(x,y)){it.gx=x;it.gy=y}else{let ok=false;for(let b=0;!ok;b++)for(let a=0;a<=SW-w;a++)if(fits(a,b)){it.gx=a;it.gy=b;ok=true;break}}L.push(it)}
// host: a friend's changes to the shared drawer
function mpShOps(d,c){mpShHost();const L=G.mpShared,no=[];
  for(const su of d.take||[]){const i=L.findIndex(o=>mpShKey(o)===su);if(i>=0)L.splice(i,1);else no.push(su)}
  for(const[su,x,y]of d.mv||[]){const it=L.find(o=>mpShKey(o)===su);if(!it)continue;const i=L.indexOf(it);L.splice(i,1);mpShPut(it,x,y)}
  for(const it of d.put||[])mpShPut(it,it.gx,it.gy);
  NET.shAck[c.mpId]=d.seq||0;if(no.length)mpTo(c,{t:'sno',l:no});mpShRefresh();mpShBroadcast();save()}
// guest: the host's list is the truth, unless it predates something we just sent
function mpShRecv(d){if((d.ack||0)<NET.shSeq)return;const l=d.l||[];
  if(NET.shView){NET.shared=l;P.stash=l;NET.shSnap=mpShSnap(l);if(!$('pStash').hidden)mpShQuiet(updatePanels)}else NET.shared=l}
// guest: too late, someone else took it first: it goes back where it came from
function mpShLate(d){for(const su of d.l||[]){const is=o=>o&&mpShKey(o)===su;let nm=null;
  if(is(G.hand)){nm=G.hand.name;G.hand=null}else{const i=P.inv.findIndex(is);if(i>=0){nm=P.inv[i].name;invDel(P.inv[i])}else for(const k in P.eq)if(is(P.eq[k])){nm=P.eq[k].name;P.eq[k]=null}}
  if(nm)log('Zu spät: '+nm+' hat schon jemand anderes genommen.','#ff8a6a')}updatePanels()}
function mpShRefresh(){if(NET.role!=='host')return;NET.shared=G.mpShared;if(NET.shView){P.stash=G.mpShared;NET.shSnap=mpShSnap(G.mpShared);if(!$('pStash').hidden)mpShQuiet(updatePanels)}}
let mpShMute=0;const mpShQuiet=f=>{mpShMute++;try{f()}finally{mpShMute--}};
// every change in the open drawer, seen as what left, what came and what moved
const _updatePanelsSh=updatePanels;updatePanels=function(){if(NET.shView&&(!mpOn()||$('pStash').hidden))mpShView(false);
  if(NET.shView&&!mpShMute&&P){const now=P.stash,old=NET.shSnap||new Map(),cur=mpShSnap(now),take=[],put=[],mv=[];
    for(const[it]of old)if(!cur.has(it))take.push(it);for(const[it,k]of cur)if(!old.has(it))put.push(it);else if(old.get(it)!==k)mv.push(it);
    if(take.length||put.length||mv.length){
      if(NET.role==='host'){if(now!==G.mpShared){G.mpShared=now;NET.shared=now}for(const it of put)if(it.su==null||now.some(o=>o!==it&&o.su===it.su))it.su=++NET.shU;mpShBroadcast();save()}
      // a fresh item gets a name of our own at once, so it can be taken again before the host has numbered it
      else{NET.shared=now;for(const it of put){delete it.su;it.cu=NET.me+'.'+(++NET.shC)}mpSend({t:'sx',id:NET.me,seq:++NET.shSeq,take:take.map(mpShKey),put:JSON.parse(JSON.stringify(put)),mv:mv.map(i=>[mpShKey(i),i.gx,i.gy])})}}
    NET.shSnap=cur}
  _updatePanelsSh()};
// the drawer's tabs, shown only while online
const _buildStashSh=buildStash;buildStash=function(){_buildStashSh();if(!mpOn()||!NET.shared)return;const b=$('pStash'),h=b.querySelector('h2');
  if(NET.shView&&h)h.firstChild.textContent='Gemeinsame Truhe ';
  const t=document.createElement('div');t.className='sttabs';t.innerHTML=`<button data-sttab="own" class="${NET.shView?'':'on'}">Eigene Truhe</button><button data-sttab="sh" class="${NET.shView?'on':''}">Gemeinsam <small>${NET.shared.length}</small></button>`;
  h.after(t);if(NET.shView){const hint=b.querySelector('.srow .hint');if(hint)hint.textContent='Alle Spieler dieses Online-Spiels sehen diese Truhe';}};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sttab]');if(!t||!P)return;mpShView(t.dataset.sttab==='sh');sfx('pick');mpShQuiet(updatePanels)});
// the host's chest is saved with the host's world; a guest keeps only their own
const _saveDataSh=saveData;saveData=function(){const sw=NET.shView;if(sw){P.stash=P.ownStash}try{const d=_saveDataSh();if(d&&NET.role!=='guest'&&G.mpShared&&!(G.mpOwn&&!G.mpOwn.same))d.g.mpShared=JSON.parse(JSON.stringify(G.mpShared));return d}finally{if(sw)P.stash=NET.shared}};
const _applyDataSh=applyData;applyData=function(d){const sh=d&&d.g&&d.g.mpShared;_applyDataSh(d);G.mpShared=sh||[]};

/* ----- the others ----- */
// glide toward where they will be in a moment, not where they were
function mpTick(dt){const now=performance.now();NET.meX=P.x;NET.meY=P.y;
  for(const r of NET.others.values()){const q=mpAt(r.buf,mpNow(r)-MPLAG);if(q){r.x=q.x;r.y=q.y}if(r.moving)r.anim+=dt;if(r.atkT>0)r.atkT=Math.max(0,r.atkT-dt);if(r.whirl>0){r.whirl-=dt;slashFx(r.x,r.y,G.t*22,1.5,1.9,'235,225,205',.12,.6,.38)}r.trail.length=0;
    r.dash=r.dashU>G.t?{ang:r.dashA,left:1,l:0}:null;r.ward=r.wardU>G.t?1:0;if(r.dash)r.ghosts.push({x:r.x,y:r.y,face:r.dashA,t:0});for(const g of r.ghosts)g.t+=dt;if(r.ghosts.length)r.ghosts=r.ghosts.filter(g=>g.t<.3);r.stale=now-r.seen>4000;
    // standing beside a fallen friend raises them
    if(r.down>0&&!(now<r.rvCool)&&!P.dead&&!r.stale&&r.floor===G.floor&&hyp(r.x-P.x,r.y-P.y)<1.9){r.rv+=dt;if(r.rv>=MPREV){r.rv=0;r.down=0;r.rvCool=now+2000;mpSend({t:'rv',id:NET.me,to:r.id,by:NET.me});log('Du hast '+r.nm+' wieder aufgerichtet.','#ffe08a')}}else r.rv=Math.max(0,r.rv-dt*2)}
  if(NET.role==='host')mpHostSync(dt);else if(NET.role==='guest')mpGuestTick();
  if(mpOn()&&now-NET.bfT>1000){NET.bfT=now;const sg=mpBeaconSig();if(sg!==NET.bfSig){NET.bfSig=sg;mpSend({t:'bf',id:NET.me,f:G.owFires||{},lit:Object.keys(G.lit||{})})}}
  mpFxTick(dt);mpHud()}
function mpVis(){if(!NET.others.size||typeof G.floor!=='number')return[];const out=[];for(const r of NET.others.values())if(!r.stale&&r.floor===G.floor&&Math.abs(r.x-P.x)<30&&Math.abs(r.y-P.y)<30)out.push(r);return out}
function mpDraw(r){const P0=P,H0=G.rgHS;r.mpRemote=1;P=r;G.rgHS=r.hs;try{drawPlayer()}catch(e){}finally{P=P0;G.rgHS=H0}
  const[sx,sy]=iso(r.x,r.y),top=sy-(r.ride?84:60)-(r.down>0?14:0);label(sx,top,r.nm+' · Stufe '+r.lvl+(r.down>0?' · am Boden':''),r.down>0?'#ff8a6a':'#9ad0ff');
  const w=34,f=Math.max(0,Math.min(1,r.hp/Math.max(1,r.hm)));ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(sx-w/2-1,top+8,w+2,4);ctx.fillStyle=f>.35?'#c42a1c':'#ff5a2a';ctx.fillRect(sx-w/2,top+9,w*f,2)}

// where the others are: a small line at the top of the screen
function mpWhere(r){if(r.stale)return'keine Antwort';if(r.floor==null)return'…';if(r.down>0)return'am Boden · '+Math.ceil(r.down)+' s';if(r.dead)return'gefallen';
  if(r.floor===G.floor&&typeof r.floor==='number'){const d=Math.round(Math.hypot(r.x-P.x,r.y-P.y));return d<14?'bei dir':d+' Schritte'}return floorTitle(r.floor)}
function mpHud(force){const now=performance.now();if(!force&&now-NET.hudT<400)return;NET.hudT=now;let b=$('mpbadge');
  if(!mpOn()||G.state==='title'){if(b)b.hidden=true;return}
  if(!b){b=document.createElement('div');b.id='mpbadge';document.body.appendChild(b)}b.hidden=false;
  const parts=[...NET.others.values()].filter(r=>r.hello||r.seen).map(r=>`<span class="mpp">${mpEsc(r.nm)} · ${r.lvl} · ${mpWhere(r)}</span>`);
  b.innerHTML=(NET.role==='host'?`<b>Spiel-Code ${NET.code}</b>`:`<b>Online · ${NET.code}</b>`)+(parts.length?' '+parts.join(' '):NET.role==='host'?' <span class="mpp">wartet auf Mitspieler</span>':'')}

// travel to someone from a beacon
function mpTravel(id,quiet){const r=NET.others.get(id);if(!r||r.floor==null)return;closeDialog();
  if(typeof r.floor!=='number'){log(r.nm+' ist in einem Turm-Riss. Dorthin führt kein Weg.','#a39b88');return}
  if(G.floor!==r.floor)enterFloor(r.floor);const[x,y]=nearWalk(r.tx+1,r.ty+.6);P.x=x;P.y=y;P.path=[];camX=x;camY=y;if(G.map.world){G.map.ac=null;owRestart()}
  if(!quiet){sample('portal',.6,{rate:1});banner('ZU '+r.nm.toUpperCase(),floorTitle(r.floor),'',1600)}}
const _openShrineMP=openShrine;openShrine=function(o){_openShrineMP(o);if(!NET.others.size)return;const d=$('dialog');
  const bs=[...NET.others.values()].filter(r=>!r.stale&&r.floor!=null).map(r=>`<button data-mptravel="${r.id}">Zu ${mpEsc(r.nm)} <small>${mpEsc(mpWhere(r))}</small></button>`).join('');if(!bs)return;
  const box=document.createElement('div');box.innerHTML='<h3 style="font-family:var(--f-sc);font-weight:400;margin:0;color:#9ad0ff">Mitspieler</h3><div class="travel">'+bs+'</div>';
  const close=d.querySelector('[data-close]');d.insertBefore(box,close)};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-mptravel],[data-mp]');if(!t)return;
  if(t.dataset.mptravel){mpTravel(t.dataset.mptravel);return}
  const a=t.dataset.mp;if(a==='menu'){menuView='online';mpMenu()}else if(a==='host')mpHost();else if(a==='join'){NET.joinView=1;NET.err='';mpMenu();setTimeout(()=>{const i=$('mpcode');i&&i.focus()},30)}
  else if(a==='go'){const i=$('mpcode');mpJoin(i&&i.value)}else if(a==='stop'){mpStop()}else if(a==='cancel'){NET.joinView=0;if(NET.role==='joining'||NET.role==='opening')mpStop(true);NET.err='';mpMenu()}});

// the menu: Einstellungen → Online-Hosting
const _showMenuMP=showMenu;showMenu=function(v,msg){_showMenuMP(v,msg);if(v!=='settings')return;const b=$('mbox'),back=b.querySelector('[data-m="back"]');if(!back)return;
  const h=document.createElement('div');h.innerHTML=`<h3>Online</h3><button class="mbtn" data-mp="menu">Online-Hosting${mpOn()?' <small>'+(NET.role==='host'?'Code '+NET.code:'verbunden')+'</small>':''}</button>`;b.insertBefore(h,back)};
function mpMenu(){if(menuView!=='online')return;const b=$('mbox');if(!b)return;const ing=G.state==='play'||G.state==='paused';
  let h='<h2>Online-Hosting</h2>';
  if(!ing)h+='<p class="hint" style="text-align:center">Starte oder lade zuerst ein Spiel. Dann kannst du es hier hosten oder einem anderen beitreten.</p>';
  else if(NET.role==='host'){const ps=[...NET.others.values()].filter(r=>r.hello);h+=`<p class="hint" style="text-align:center;margin:0">Dein Spiel-Code</p><div class="mpcodebig">${NET.code}</div>
      <p class="hint" style="text-align:center">Dein Mitspieler öffnet Einstellungen → Online-Hosting → Online beitreten und gibt diesen Code ein.</p>
      <div class="mplist">${ps.length?ps.map(r=>`<div>${mpEsc(r.nm)} · Stufe ${r.lvl} · ${mpEsc(mpWhere(r))}</div>`).join(''):'<div class="dim">Noch niemand da …</div>'}</div>
      <button class="mbtn" data-mp="stop">Online beenden</button>`}
  else if(NET.role==='guest')h+=`<p class="hint" style="text-align:center">Du spielst in der Welt von <b>${mpEsc(NET.hostName||'?')}</b> · Code ${NET.code}</p>
      <div class="mplist">${[...NET.others.values()].map(r=>`<div>${mpEsc(r.nm)} · Stufe ${r.lvl} · ${mpEsc(mpWhere(r))}</div>`).join('')}</div>
      <button class="mbtn" data-mp="stop">Verbindung trennen</button>`;
  else if(NET.role==='opening'||NET.role==='joining')h+=`<p class="hint" style="text-align:center">${mpEsc(NET.st)}</p><button class="mbtn" data-mp="cancel">Abbrechen</button>`;
  else if(NET.joinView)h+=`<p class="hint" style="text-align:center;margin:0">Spiel-Code des Hosts</p><input id="mpcode" class="mpin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="0000">
      <button class="mbtn" data-mp="go">Beitreten</button><button class="mbtn" data-mp="cancel">Zurück</button>`;
  else h+=`<label class="mrow mpname"><span>Dein Name</span><input id="mpname" maxlength="14" value="${mpEsc(CFG.mpName||'')}" placeholder="${mpEsc(myCls().n)}"></label>
      <button class="mbtn" data-mp="host">Spiel hosten <small>andere treten deiner Welt bei</small></button><button class="mbtn" data-mp="join">Online beitreten <small>mit dem Code eines Freundes</small></button>
      <p class="hint" style="text-align:center;font-size:13px">Ihr spielt auf verschiedenen Geräten in derselben Welt und kämpft gegen dieselben Monster. Jeder behält seinen Charakter und findet seine eigene Beute. Leuchtfeuer gelten für alle.</p>`;
  if(NET.err)h+=`<div class="msg mperr" role="status">${mpEsc(NET.err)}</div>`;
  if(!(NET.joinView&&!mpOn()&&NET.role!=='joining'))h+='<button class="mbtn" data-m="settings">Zurück</button>';b.innerHTML=h;
  const i=$('mpcode');if(i)i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')mpJoin(i.value)});
  const n=$('mpname');if(n){n.addEventListener('keydown',e=>e.stopPropagation());n.addEventListener('input',()=>{CFG.mpName=n.value.slice(0,14);saveCfg()})}}
// leaving the game ends the session first, so the guest's own world is what gets saved
const _toTitleMP=toTitle;toTitle=function(){if(mpOn())mpStop(true);_toTitleMP()};
const _startNewMP=startNew;startNew=function(c){if(mpOn()||NET.role)mpStop(true);G.mpOwn=null;G.mpw=null;G.mpShared=[];_startNewMP(c)};
