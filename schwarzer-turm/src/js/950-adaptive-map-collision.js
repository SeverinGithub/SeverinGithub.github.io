/* ---------- the tower measures you: map pinch, adaptive foes, bosses that always test you, solid map objects ---------- */
// map: two fingers zoom around their midpoint, one finger pans, plus/minus buttons
(()=>{const pts=new Map();let pin=null,hold=false;
  const cv=()=>$('mapc'),zoomAt=(z,sx,sy)=>{const c=cv(),W2=c.clientWidth,H2=c.clientHeight,u=(sx-W2/2)/MV.z+(MV.x-MV.y),v=(sy-H2/2)*2/MV.z+(MV.x+MV.y);
    MV.z=clamp(z,1,18);const a=u-(sx-W2/2)/MV.z,b=v-(sy-H2/2)*2/MV.z;MV.x=(a+b)/2;MV.y=(b-a)/2};
  const loc=e=>{const r=cv().getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
  const two=()=>{const[a,b]=[...pts.values()];return{d:Math.max(20,hyp(a[0]-b[0],a[1]-b[1])),m:[(a[0]+b[0])/2,(a[1]+b[1])/2]}};
  addEventListener('pointerdown',e=>{if(G.state!=='map'||e.target.id!=='mapc')return;pts.set(e.pointerId,loc(e));
    if(pts.size>=2){const t=two();pin={d:t.d,z:MV.z,m:t.m};hold=true;e.stopImmediatePropagation()}},true);
  addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,loc(e));if(!hold)return;e.stopImmediatePropagation();
    if(pin&&pts.size>=2){const t=two();zoomAt(pin.z*t.d/pin.d,pin.m[0],pin.m[1]);
      const dx=(t.m[0]-pin.m[0])/MV.z,dy=(t.m[1]-pin.m[1])*2/MV.z;MV.x-=(dx+dy)/2;MV.y-=(dy-dx)/2;pin.m=t.m;pin.d=t.d;pin.z=MV.z}},true);
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pin=null;if(!pts.size)hold=false};
  addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-mapz]');if(!b||!MV)return;const c=cv();zoomAt(MV.z*(+b.dataset.mapz>0?1.35:1/1.35),c.clientWidth/2,c.clientHeight/2)})})();

// what the hero really brings: damage on one target per second, measured while fighting, and how much a hit hurts
const PW={b:new Map(),t0:0,dps:0,n:0};
const _hitEnemyPW=hitEnemy;hitEnemy=function(e,dmg,o={}){if(e&&!e.dead&&dmg>0&&!o.ally&&!(NET.role==='host'&&NET.hitBy))PW.b.set(e,(PW.b.get(e)||0)+dmg*(e.dmgTaken||1));return _hitEnemyPW(e,dmg,o)};
function pwTick(){const now=G.t;if(now-PW.t0<1)return;const dt=now-PW.t0;PW.t0=now;if(dt>3){PW.b.clear();return}
  let mx=0;for(const v of PW.b.values())mx=Math.max(mx,v);PW.b.clear();if(mx<=0)return;const s=mx/dt;
  PW.dps=PW.n?PW.dps*.88+s*.12:s;PW.n++}
// estimate from the sheet (weapon, crits, attack speed), so a fresh hero is judged before the first fight
function pwEst(){const d=P.d;return Math.max(1,pDmg(1)*(d.aspd||1)*(1+(d.crit||0)/100))}
function pwMit(ml){const d=P.d;return Math.max(.05,1-d.def/(d.def+45+ml*14))}
function myPow(){const ml=G.mlvl||1,est=pwEst(),dps=PW.n>=4?Math.max(PW.dps,est*.5):Math.max(PW.dps,est);
  return{dps,life:P.d.life,mit:pwMit(ml),red:P.d.dmgred||0}}
// in a group the strongest hero on this floor sets the bar
function teamPow(){const me=myPow();let best=me,sc=me.dps*me.life/me.mit,n=1;
  if(mpOn()&&NET.role==='host')for(const r of NET.others.values()){if(r.stale||r.floor!==G.floor||!r.pow)continue;n++;const q=r.pow,s=q.dps*q.life/q.mit;if(s>sc){sc=s;best=q}}
  return{...best,n}}
const _mpRecvPW=mpRecv;mpRecv=function(d,c){if(d&&d.t==='pw'){const r=c&&NET.others.get(c.mpId);if(r)r.pow={dps:+d.dps||1,life:+d.life||1,mit:+d.mit||1,red:+d.red||0};return}return _mpRecvPW(d,c)};
setInterval(()=>{if(NET.role==='guest'&&P&&P.d){const p=myPow();mpSend({t:'pw',dps:p.dps,life:p.life,mit:p.mit,red:p.red})}},4000);

// bosses: a fight of about seventy seconds, seven clean hits and you are gone; harder tiers stretch both
const BTTK=68,BHITS=7,BMOVE=1.35;
function adaptBoss(e){const T=teamPow(),D=diff(),ttk=BTTK*(1+.15*D),hits=BHITS/(1+.12*D);
  const hp=T.dps*ttk,mid=(T.life/hits/T.mit+T.red)/BMOVE,cur=(e.dmg[0]+e.dmg[1])/2;
  const kh=clamp(hp/e.max,.6,15)*T.n,kd=clamp(mid/cur,.6,8)*(1+.25*(T.n-1));
  e.hp*=kh;e.max*=kh;e.dmg=e.dmg.map(v=>v*kd);e.adapt={kh,kd,n:T.n}}
// everything else bends a little, never more than a third either way
const ETTK={normal:2,minion:2.8,champ:5.2,unique:8.5},EHITS={normal:42,minion:42,champ:28,unique:24};
function adaptFoe(e){const T=myPow(),r=ETTK[e.rank]?e.rank:'normal',hp=T.dps*ETTK[r],mid=T.life/EHITS[r]/T.mit+T.red,cur=(e.dmg[0]+e.dmg[1])/2;
  const kh=clamp(hp/e.max,.65,1.35),kd=clamp(mid/cur,.65,1.35);e.hp*=kh;e.max*=kh;e.dmg=e.dmg.map(v=>v*kd);e.adapt={kh,kd}}
const _updEnemyPW=updEnemy;updEnemy=function(e,dt){if(!e.dead&&e.aggro&&!e.adapt&&!e.mir&&e.max>0&&P&&P.d){if(e.boss)adaptBoss(e);else if(!e.summoned)adaptFoe(e)}return _updEnemyPW(e,dt)};

// the boss reads you: chained swings, held attacks, and it lunges when you drink
const _bossUpdatePW=bossUpdate;bossUpdate=function(e,dt,d,busy,sp){const cd0=e.cd,nt=G.tele.length;_bossUpdatePW(e,dt,d,busy,sp);
  if(e.p2&&!e.p2b){e.p2b=true;e.dmg=e.dmg.map(v=>v*1.15);e.spd*=1.12}
  if(e.cd>cd0+.2){const fresh=G.tele.slice(nt).filter(t=>t.owner===e);
    if(fresh.length&&Math.random()<(e.p2?.3:.2))for(const t of fresh)t.t-=.3;
    e.chain=(e.chain||0)+1;if(e.chain<=(e.p2?3:2)&&Math.random()<(e.p2?.55:.38))e.cd=Math.min(e.cd,rnd(.1,.3));else e.chain=0}};
const _drinkFlaskPW=drinkFlask;drinkFlask=function(){const had=P.flasks>0&&P.flaskT<=0&&!P.dead;_drinkFlaskPW();if(!had)return;
  for(const e of G.map.enemies)if(e.boss&&!e.dead&&e.aggro&&!e.mir&&hyp(e.x-P.x,e.y-P.y)<9){e.cd=Math.min(e.cd,.05);e.chain=0}};
const _updatePW=update;update=function(dt){_updatePW(dt);pwTick()};

// solid things on the map: merchants, beacons, rift stones and the like can no longer be walked through; a head-on bump slides you around them
const SOLID={merchant:.42,shrine:.5,riftstone:.48,smith:.42,chronist:.4,stash:.42,enchant:.45,anvil:.38,grind:.42,colossus:1.05,egg:.42,hoard:.5,chest:.32};
function solidNear(x,y){const m=G.map;if(!m||!m.objs)return[];const sig=m.objs.length+'|'+(m.objs[0]&&m.objs[0].x)+'|'+(m.objs.length&&m.objs[m.objs.length-1].x);if(m._soA!==m.objs||m._soS!==sig){m._soA=m.objs;m._soS=sig;m._so=new Map();
    for(const o of m.objs){const r=SOLID[o.type];if(!r)continue;const k=Math.floor(o.x/4)+','+Math.floor(o.y/4);if(!m._so.has(k))m._so.set(k,[]);m._so.get(k).push(o)}}
  const out=[],ci=Math.floor(x/4),cj=Math.floor(y/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=m._so.get((ci+a)+','+(cj+b));if(l)out.push(...l)}return out}
const _moveEntPW=moveEnt;moveEnt=function(e,dx,dy){const px=e.x,py=e.y;_moveEntPW(e,dx,dy);if(e!==P&&!e.d)return;
  for(const o of solidNear(e.x,e.y)){const R=SOLID[o.type]+(e.r||.3)*.8,ox=e.x-o.x,oy=e.y-o.y,dd=hyp(ox,oy);if(dd>=R)continue;
    let a=dd>.001?Math.atan2(oy,ox):Math.atan2(-dy,-dx);const mv=hyp(dx,dy);let s=(-Math.sin(a)*dx+Math.cos(a)*dy);if(Math.abs(s)<mv*.35)s=(s<0?-1:1)*mv*.7;a+=s/R;
    const nx=o.x+Math.cos(a)*R,ny=o.y+Math.sin(a)*R;if(free(nx,ny,(e.r||.3)*.8)){e.x=nx;e.y=ny}else{e.x=px;e.y=py}}};

