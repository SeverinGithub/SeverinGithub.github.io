/* ---------- touch, second pass: a floating stick under the left thumb, attack and skills under the right, a menu row on top, popups that close ---------- */
if(TOUCH)document.body.classList.add('touch');
touchPad=function(){};
const JOY={id:null,ox:0,oy:0,v:[0,0]},ATK={held:false};let tapId=null,aimT=null,TQ=null;
const joyEl=()=>$('joy')||(document.body.insertAdjacentHTML('beforeend','<div id="joy" hidden><i></i></div>'),$('joy'));
function joyShow(){const j=joyEl();j.hidden=false;j.style.left=JOY.ox+'px';j.style.top=JOY.oy+'px';j.firstChild.style.transform=`translate(${JOY.v[0]*56}px,${JOY.v[1]*56}px)`}
function wake(){try{initAudio();if(AC&&AC.state==='suspended')AC.resume()}catch(_){}}
// every touch on the canvas lands here first: the left half steers, the right half taps like a mouse
document.addEventListener('touchstart',e=>{if(e.target!==cv)return;e.preventDefault();e.stopImmediatePropagation();wake();
  for(const t of e.changedTouches){if(JOY.id===null&&G.state==='play'&&t.clientX<innerWidth*.5){JOY.id=t.identifier;JOY.ox=t.clientX;JOY.oy=t.clientY;JOY.v=[0,0];joyShow()}
    else if(tapId===null){tapId=t.identifier;mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM;cv.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:t.clientX,clientY:t.clientY,button:0}))}}},{capture:true,passive:false});
document.addEventListener('touchmove',e=>{if(e.target!==cv)return;e.preventDefault();e.stopImmediatePropagation();
  for(const t of e.changedTouches){if(t.identifier===JOY.id){let dx=t.clientX-JOY.ox,dy=t.clientY-JOY.oy;const d=Math.hypot(dx,dy),R=56;if(d>R){JOY.ox=t.clientX-dx/d*R;JOY.oy=t.clientY-dy/d*R;dx=dx/d*R;dy=dy/d*R}JOY.v=[dx/R,dy/R];joyShow()}
    else if(t.identifier===tapId){mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM}}},{capture:true,passive:false});
const tEnd=e=>{if(e.target!==cv)return;e.preventDefault();e.stopImmediatePropagation();
  for(const t of e.changedTouches){if(t.identifier===JOY.id){JOY.id=null;JOY.v=[0,0];joyEl().hidden=true;if(P)P.path=[]}else if(t.identifier===tapId){tapId=null;dispatchEvent(new MouseEvent('mouseup',{button:0}))}}};
document.addEventListener('touchend',tEnd,{capture:true,passive:false});document.addEventListener('touchcancel',tEnd,{capture:true,passive:false});
// screen direction to world direction, through the isometric camera
function scrToWorldDir(vx,vy){const[sx,sy]=iso(P.x,P.y),a=scr2w(sx,sy),b=scr2w(sx+vx*100,sy+vy*100),dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return[dx/d,dy/d]}
function joyTick(){if(JOY.id===null||!P||P.dead||G.state!=='play')return;const[vx,vy]=JOY.v;if(Math.hypot(vx,vy)<.2)return;
  if(ATK.held&&P.target&&!P.target.dead&&hyp(P.target.x-P.x,P.target.y-P.y)<=P.d.reach+P.target.r+.2)return;
  const[dx,dy]=scrToWorldDir(vx,vy);P.target=null;P.interact=null;P.pickup=null;P.standAtk=null;P.path=[[P.x+dx*.7,P.y+dy*.7]]}
function atkTick(){if(!ATK.held||!P||P.dead||G.state!=='play')return;const e=nearFoe(7);
  if(e){if(JOY.id===null||hyp(e.x-P.x,e.y-P.y)<=P.d.reach+e.r+.2)P.target=e}else if(!(P.atkT>0)&&JOY.id===null)startAttack(P.face)}

// casting from a button: a tap aims at the nearest foe, a drag aims where you pull
const MOVERS=new Set(['charge','leap','dash','m_jump','blink']);
function tCast(id,aim){if(!P||G.state!=='play')return;let tx,ty;
  if(aim){const[dx,dy]=scrToWorldDir(aim[0],aim[1]),L=clamp(Math.hypot(aim[0],aim[1])/12,2,9);tx=P.x+dx*L;ty=P.y+dy*L}
  else if(MOVERS.has(id)){const[dx,dy]=JOY.id!==null&&Math.hypot(...JOY.v)>.2?scrToWorldDir(...JOY.v):[Math.cos(P.face),Math.sin(P.face)];tx=P.x+dx*6;ty=P.y+dy*6}
  else{const f=nearFoe(10);if(f){tx=f.x;ty=f.y}else{tx=P.x+Math.cos(P.face)*4;ty=P.y+Math.sin(P.face)*4}}
  P.sel=id;if(P.atkT>0||P.cast>0||P.roll>0){TQ={id,tx,ty,t:G.t};return}castSkill(id,tx,ty)}
const aimEl=()=>$('aim')||(document.body.insertAdjacentHTML('beforeend','<div id="aim" hidden></div>'),$('aim'));
function aimShow(dx,dy){const a=aimEl(),[sx,sy]=iso(P.x,P.y),L=Math.min(260,Math.hypot(dx,dy)*2.2);a.hidden=false;a.style.left=sx*ZM+'px';a.style.top=(sy-16)*ZM+'px';a.style.width=L+'px';a.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`}

// the right-hand cluster: attack in the corner, six skills on two arcs; a utility row at the bottom; a menu row on top
const ICO={atk:'⚔',roll:'⟲',flask:'✚',loot:'⬇',ash:'☁',menu:'☰'};
function clusterHTML(){const sk=mySk(),pos=[[0,108],[45,108],[90,108],[12,182],[45,182],[78,182]];
  let h=`<button class="tb atk" data-t="atk" aria-label="Angriff">${ICO.atk}</button>`;
  sk.forEach((s,i)=>{const[a,R]=pos[i],r=a*Math.PI/180,x=64+Math.cos(r)*R-28,y=64+Math.sin(r)*R-28;h+=`<button class="tb sk ${P.sk[s.id]?'':'locked'}" data-t="sk" data-id="${s.id}" style="right:${x.toFixed(0)}px;bottom:${y.toFixed(0)}px" aria-label="${s.n}">${skImg(s.id)}<i class="cd"></i><span class="k">${s.key}</span></button>`});
  return h}
function utilHTML(){return`<button class="tb" data-t="roll" aria-label="Ausweichrolle">${ICO.roll}<small>Rolle</small></button><button class="tb" data-t="flask" aria-label="Heilflakon">${skImg('flask')}<b id="tuF"></b><small>Flakon</small></button>
  <button class="tb" data-pot="life" aria-label="Heiltrank"><img class="px" src="${pxURL('potL')}" alt=""><b id="tuL"></b><small>Leben</small></button><button class="tb" data-pot="mana" aria-label="Manatrank"><img class="px" src="${pxURL('potM')}" alt=""><b id="tuM"></b><small>Mana</small></button>
  <button class="tb" data-t="loot" aria-label="Aufheben">${ICO.loot}<small>Aufheben</small></button><button class="tb" data-t="ash" aria-label="Geisterasche">${ICO.ash}<small>Asche</small></button>`}
function menuHTML(){return[['data-open="pChar"','♙','Held'],['data-open="pInv"','▣','Taschen'],['data-open="pSkill"','✦','Können'],['data-tree','✺','Talente'],['data-quests','☰','Chronik'],['data-bigmap','⌖','Karte'],['data-open="pColl"','❖','Sammlung'],['data-t="menu"','⏸','Pause']]
  .map(([a,i,n])=>`<button class="tm" ${a} aria-label="${n}"><span>${i}</span><small>${n}</small></button>`).join('')}
function bindPad(el){
  el.addEventListener('touchstart',e=>{const b=e.target.closest('[data-t]');if(!b||!P)return;e.preventDefault();wake();const k=b.dataset.t,t=e.changedTouches[0];b.classList.add('on');
    if(k==='atk'){ATK.held=true;ATK.tid=t.identifier;atkTick();return}
    if(k==='sk'){aimT={id:b.dataset.id,x0:t.clientX,y0:t.clientY,tid:t.identifier,b,drag:false};return}
    if(G.state!=='play')return;if(k==='roll')doRoll();else if(k==='dash')tvDash();else if(k==='flask')drinkFlask();else if(k==='loot')quickLoot();else if(k==='ash')summonAsh();else if(k==='menu')escKey()},{passive:false});
  el.addEventListener('touchmove',e=>{if(!aimT||!P)return;for(const t of e.changedTouches){if(t.identifier!==aimT.tid)continue;e.preventDefault();const dx=t.clientX-aimT.x0,dy=t.clientY-aimT.y0;if(Math.hypot(dx,dy)>18){aimT.drag=[dx,dy];aimShow(dx,dy)}}},{passive:false});
  const up=e=>{for(const t of e.changedTouches){el.classList.remove('on');el.querySelectorAll('.on').forEach(x=>x.classList.remove('on'));
      if(aimT&&t.identifier===aimT.tid){const a=aimT;aimT=null;aimEl().hidden=true;tCast(a.id,a.drag||null)}if(t.identifier===ATK.tid){ATK.held=false;ATK.tid=null}}};
  el.addEventListener('touchend',up);el.addEventListener('touchcancel',up)}
function touchHud(){if(!TOUCH)return;const play=G.state==='play'&&!!P;
  let c=$('tcl'),u=$('tutil'),m=$('tmenu2');
  if(!c){document.body.insertAdjacentHTML('beforeend','<div id="tcl" hidden></div><div id="tutil" hidden></div><div id="tmenu2" hidden></div>');c=$('tcl');u=$('tutil');m=$('tmenu2');bindPad(c);bindPad(u);bindPad(m)}
  c.hidden=u.hidden=m.hidden=!play;if(!play)return;
  const sig=P.cls+'|'+mySk().map(s=>s.id+(P.sk[s.id]?1:0)).join()+'|'+(typeof mElem==='function'?mElem():'');if(c.dataset.sig!==sig){c.dataset.sig=sig;c.innerHTML=clusterHTML()}
  if(!u.firstChild)u.innerHTML=utilHTML();if(!m.firstChild)m.innerHTML=menuHTML();
  const fl=$('tuF'),pl=$('tuL'),pm=$('tuM');if(fl&&fl.textContent!==String(P.flasks))fl.textContent=P.flasks;const nl=potCount('life'),nm=potCount('mana');if(pl&&pl.textContent!==String(nl))pl.textContent=nl;if(pm&&pm.textContent!==String(nm))pm.textContent=nm;
  for(const b of c.querySelectorAll('.tb.sk')){const s=SKBY[b.dataset.id],l=P.sk[s.id]?skLvl(s.id):0,cd=P.cds[s.id]||0,mx=s.cd*(1-P.d.cdr/100)||1,f=cd>0?Math.round(cd/mx*50)/50:0;
    if(b.dataset.f!==String(f)){b.dataset.f=f;b.style.setProperty('--cd',f)}const low=l>0&&P.mp<Math.max(1,Math.round(s.mana(l)*(1-P.d.mcost/100)));b.classList.toggle('low',low)}}

// popups: the narrator gets a close mark and closes on the first tap; the quest list folds away
function popupTick(){const t=$('tale');if(t&&!t.dataset.x){t.dataset.x=1;t.insertAdjacentHTML('afterbegin','<button class="tx" aria-label="Schließen">✕</button>');
    const close=ev=>{ev.stopPropagation();taleT=0;t.classList.remove('show');setTimeout(()=>{if(taleT<=0)t.hidden=true},400)};t.addEventListener('click',close);if(TOUCH){const c=t.querySelector('.tc');if(c)c.textContent='Tippen zum Schließen'}}
  const q=$('qtrack');if(q&&!$('qtog')){q.insertAdjacentHTML('beforebegin','<button id="qtog" aria-label="Aufgaben ein- oder ausklappen">Aufgaben ▾</button>');$('qtog').addEventListener('click',()=>{const h=q.classList.toggle('qhide');$('qtog').textContent=h?'Aufgaben ▸':'Aufgaben ▾'})}}
function updTouch(dt){popupTick();if(!TOUCH)return;joyTick();atkTick();touchHud();
  // a skill tapped during a swing fires as soon as the swing ends
  if(TQ&&P){if(G.t-TQ.t>.7)TQ=null;else if(!(P.atkT>0)&&!(P.cast>0)&&!(P.roll>0)){const q=TQ;TQ=null;castSkill(q.id,q.tx,q.ty)}}}

