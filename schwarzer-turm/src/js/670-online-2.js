/* ---------- online, second pass: items laid on the ground are there for everyone · a fallen guardian counts for the whole party ---------- */
// What a player drops at their own feet is announced to the others and appears in their world too. The host keeps the list and decides
// who gets it: a guest asks before picking up, so two hands can never close on the same item. Guests who join later receive the list.
const GD={reg:new Map(),wait:[],pend:new Set()};
const gdKey=()=>NET.me+'-'+Date.now().toString(36)+'-'+(Math.random()*1e6|0).toString(36);
function gdPlace(d){const m=G.maps[d.fl];if(!m){if(!GD.wait.some(w=>w.u===d.u))GD.wait.push(d);return}if(m.items.some(g=>g.su===d.u))return;
  const it=JSON.parse(JSON.stringify(d.it));it.id=UID++;m.items.push({item:it,x:d.x,y:d.y,t:0,su:d.u})}
function gdGone(u){GD.reg.delete(u);GD.pend.delete(u);GD.wait=GD.wait.filter(w=>w.u!==u);for(const m of Object.values(G.maps)){if(!m||!m.items)continue;const i=m.items.findIndex(g=>g.su===u);if(i>=0)m.items.splice(i,1)}}
const _dropItemG=dropItem;dropItem=function(it,x,y){const own=mpOn()&&P&&x===P.x&&y===P.y;_dropItemG(it,x,y);if(!own)return;const L=G.map.items,gi=L[L.length-1];if(!gi||gi.item!==it)return;
  gi.su=gdKey();const d={t:'gd',u:gi.su,it:JSON.parse(JSON.stringify(it)),x:+gi.x.toFixed(2),y:+gi.y.toFixed(2),fl:G.floor,by:mpName()};if(NET.role==='host')GD.reg.set(d.u,d);mpSend(d)};
const _pickupG=pickup;pickup=function(gi){if(!gi||!gi.su||!mpOn())return _pickupG(gi);const u=gi.su;
  if(NET.role==='host'){if(!GD.reg.has(u)){gdGone(u);return}const m=G.map,n=m.items.length;_pickupG(gi);if(m.items.length<n){GD.reg.delete(u);mpSend({t:'gp',u})}return}
  if(GD.pend.has(u))return;GD.pend.add(u);mpSend({t:'gq',u});setTimeout(()=>GD.pend.delete(u),4000)};
// the host answers: granted (it is yours), gone (someone was quicker)
function gdAsk(d,c){const r=GD.reg.get(d.u);if(!r){mpTo(c,{t:'gn',u:d.u});return}GD.reg.delete(d.u);mpTo(c,{t:'gg',u:d.u});for(const[id,cc]of NET.conns)if(cc!==c)mpTo(cc,{t:'gp',u:d.u});gdGone(d.u)}
function gdGrant(u){GD.pend.delete(u);for(const m of Object.values(G.maps)){if(!m||!m.items)continue;const gi=m.items.find(g=>g.su===u);if(!gi)continue;
  if(m!==G.map||!invAdd(gi.item)){m.items.splice(m.items.indexOf(gi),1);if(m===G.map){log('Das Inventar ist voll.','#ff5a4a');dropItem(gi.item,P.x,P.y)}return}
  m.items.splice(m.items.indexOf(gi),1);discover(gi.item);pickSnd(gi.item);updatePanels();return}}
// guardians: the host tells everyone when one falls, and every guest who joins learns which ones lie dead
function bossCredit(fl,wb,name,late){let fresh=false;
  if(wb){if(!G.owBoss[wb]){G.owBoss[wb]=1;fresh=true}}
  else if(typeof fl==='number'&&fl>0&&!G.bossDead[fl]){G.bossDead[fl]=true;fresh=true;const m=G.maps[fl];if(m){m.enemies=m.enemies.filter(e=>!e.boss||e.dead);bossStairs(m)}}
  if(!fresh)return;if(late){save();return}P.tbonus=(P.tbonus||0)+2;log((name||'Der Hüter')+' ist gefallen. Der Sieg zählt auch für dich. +2 Talentpunkte (P)','#e8c878');
  if(!wb&&fl===G.floor){banner('FEIND BEZWUNGEN',name||'','boss',3600)}save()}
function bossStairs(m){if(!m||!m.boss||!m.endRoom||m.objs.some(o=>o.type==='stairs'))return;const r=m.endRoom;m.objs.push({type:'stairs',x:r.cx+.5,y:r.cy+.5})}
const _killEnemyG=killEnemy;killEnemy=function(e,a){const was=e&&e.boss&&!e.dead,fl=G.floor;_killEnemyG(e,a);if(was&&NET.role==='host')mpSend({t:'bk',fl,wb:e.wb||null,n:e.name})};
// a guest who is dead or far away when the mirror falls still counts the kill
const _mpMirrorDiesG=mpMirrorDies;mpMirrorDies=function(d){const e=NET.mir.get(d.n),boss=e&&e.boss&&!e.dead,fl=G.floor;_mpMirrorDiesG(d);if(boss)bossCredit(fl,e.wb,e.name)};
const _mpRecvG=mpRecv;mpRecv=function(d,c){if(!d||!d.t)return _mpRecvG(d,c);
  if(d.t==='gd'){if(NET.role==='host'){if(!c||!c.mpId)return;GD.reg.set(d.u,d);for(const[id,cc]of NET.conns)if(cc!==c)mpTo(cc,d)}if(d.u.split('-')[0]!==NET.me){gdPlace(d);if(d.fl===G.floor&&d.by)log(d.by+' legt '+(d.it.name||d.it.b)+' ab.','#9ad0ff')}return}
  if(d.t==='gl'){for(const x of d.l||[])gdPlace(x);return}
  if(d.t==='gp'){gdGone(d.u);return}
  if(d.t==='gq'){if(NET.role==='host')gdAsk(d,c);return}
  if(d.t==='gg'){gdGrant(d.u);return}
  if(d.t==='gn'){gdGone(d.u);return}
  if(d.t==='bk'){if(NET.role==='guest')bossCredit(d.fl,d.wb,d.n);return}
  if(d.t==='bd'){if(NET.role==='guest'){for(const k of d.bd||[])bossCredit(+k,null,'',true)}return}
  const fresh=NET.role==='host'&&d.t==='l'&&c&&c.mpId&&!(NET.others.get(c.mpId)||{}).hello;_mpRecvG(d,c);
  if(fresh){mpTo(c,{t:'gl',l:[...GD.reg.values()]});mpTo(c,{t:'bd',bd:Object.keys(G.bossDead).filter(k=>G.bossDead[k])})}};
function mpShareTick(){if(GD.wait.length)for(const d of GD.wait.slice())if(G.maps[d.fl]){GD.wait.splice(GD.wait.indexOf(d),1);gdPlace(d)}
  const m=G.map;if(m&&m.boss&&typeof G.floor==='number'&&G.bossDead[G.floor])bossStairs(m)}

