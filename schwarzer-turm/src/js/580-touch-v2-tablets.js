/* ---------- touch V2 for tablets: a fixed stick and dash under the left thumb, attack and six skills under the right,
   potions in the middle, the settings coin and a tab row on top, and panels that slide in from the right ---------- */
const TPAD={tabs:[['C','pChar','Held'],['I','pInv','Taschen'],['K','pSkill','Können'],['J','pColl','Sammlung'],['L','quests','Chronik'],['M','map','Karte'],['P','tree','Talente']],
  R:64,tap:null,float:false,pot:'',ride:null,open:false};
// the skill coins sit on two arcs around the roll button: [distance from the right edge, from the bottom] of each centre
const TVSK=[[272,226],[198,256],[232,166],[160,186],[88,198],[120,262]];
function tvHtml(){if($('tvstick'))return;document.body.insertAdjacentHTML('beforeend',`
  <button id="tvdrop" class="tv" aria-label="Knöpfe ein- oder ausklappen"><span>&gt;</span></button>
  <div id="tvbar" class="tv"><button id="tvset" aria-label="Einstellungen und Pause">⚙</button>
  <div id="tvtabs">${TPAD.tabs.map(([k,id,n])=>`<button class="tvt" data-tv="${id}" aria-label="${n}"><b>${k}</b><small>${n}</small></button>`).join('')}</div></div>
  <button id="tvx" class="tv" aria-label="Schließen" hidden>✕</button>
  <div id="tvstick" class="tv"><i></i><span>Laufen</span></div>
  <button id="tvdash" class="tv tvb" data-t="atk" aria-label="Angriff">⚔<small>Angriff</small></button>
  <div id="tvextra" class="tv"></div>
  <div id="tvpot" class="tv"></div>
  <div id="tvcl" class="tv"></div>`);
  const pad=(id,fn)=>$(id).addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();wake();fn(e)},{passive:false});
  pad('tvset',()=>{if(OVL.has(G.state))ovClose();closeAll();escKey()});
  pad('tvx',()=>tvCloseAll());
  // the small button beside the stick attacks while held, the big one on the right rolls
  bindPad($('tvdash'));
  // the quiet mark at the top folds the settings coin and the tab row down and up again
  pad('tvdrop',()=>{TPAD.open=!TPAD.open;sfx('pick');touchHud()});
  $('tvtabs').addEventListener('touchstart',e=>{const b=e.target.closest('[data-tv]');if(!b)return;e.preventDefault();e.stopPropagation();wake();tvTab(b.dataset.tv)},{passive:false});
  // potions, flask, pickup and the extra coins answer a plain tap
  for(const id of['tvpot','tvextra'])$(id).addEventListener('touchstart',e=>{const b=e.target.closest('[data-tvp]');if(!b||!P||G.state!=='play')return;e.preventDefault();e.stopPropagation();wake();
    const k=b.dataset.tvp;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),140);
    if(k==='life'||k==='mana')quickPotion(k);else if(k==='flask')drinkFlask();else if(k==='loot')quickLoot();else if(k==='ash')summonAsh();else if(k==='ride')toggleRide()},{passive:false});
  // attack and skills keep the hold-to-fight and drag-to-aim of before
  bindPad($('tvcl'))}
function tvCloseAll(){if(OVL.has(G.state))ovClose();closeAll();for(const p of panels)$(p).hidden=true;updatePanels()}
const tvActive=()=>OVL.has(G.state)?{quests:'quests',map:'map',tree:'tree'}[G.state]:TPAD.tabs.map(t=>t[1]).find(id=>id[0]==='p'&&!$(id).hidden)||null;
// tabs behave like tabs: one page at a time, tapping the open one closes it
function tvTab(id){if(!P||!(G.state==='play'||OVL.has(G.state)))return;const was=tvActive();tvCloseAll();if(was===id)return;
  if(id==='quests')toggleQuests();else if(id==='map')toggleMap();else if(id==='tree')toggleTree();else{$(id).hidden=false;updatePanels()}sfx('pick')}
// a roll goes where the stick points, or where the hero faces
function tvDash(){if(!P||P.dead||G.state!=='play')return;const[dx,dy]=JOY.id!==null&&Math.hypot(...JOY.v)>.2?scrToWorldDir(...JOY.v):[Math.cos(P.face),Math.sin(P.face)];
  const[sx,sy]=iso(P.x+dx*3,P.y+dy*3),mx=mouse.x,my=mouse.y;mouse.x=sx;mouse.y=sy;try{doRoll()}finally{mouse.x=mx;mouse.y=my}}
// aimless casts fly where the stick points when no foe is near
const _tCastV=tCast;tCast=function(id,aim){if(!aim&&!MOVERS.has(id)&&JOY.id!==null&&Math.hypot(...JOY.v)>.2&&!nearFoe(10)){const[dx,dy]=scrToWorldDir(...JOY.v);P.face=Math.atan2(dy,dx)}return _tCastV(id,aim)};
// the stick: a touch near it grabs it where it stands, a touch elsewhere on the left brings it there
function tvStickHome(){const s=$('tvstick');s.style.left=s.style.top='';s.classList.remove('float');const r=s.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
function tvStickDraw(){const s=$('tvstick');if(!s)return;s.firstElementChild.style.transform=`translate(${JOY.v[0]*TPAD.R*.62}px,${JOY.v[1]*TPAD.R*.62}px)`;s.classList.toggle('live',JOY.id!==null)}
addEventListener('touchstart',e=>{if(e.target!==cv||!$('tvstick'))return;e.preventDefault();e.stopImmediatePropagation();wake();
  for(const t of e.changedTouches){
    if(JOY.id===null&&G.state==='play'&&t.clientX<innerWidth*.42&&t.clientY>innerHeight*.3){const[hx,hy]=tvStickHome();JOY.id=t.identifier;
      if(Math.hypot(t.clientX-hx,t.clientY-hy)<TPAD.R*2.2){JOY.ox=hx;JOY.oy=hy}else{JOY.ox=t.clientX;JOY.oy=t.clientY;const s=$('tvstick');s.classList.add('float');s.style.left=(t.clientX-TPAD.R)+'px';s.style.top=(t.clientY-TPAD.R)+'px'}
      TPAD.mv(t)}
    else if(tapId===null){tapId=t.identifier;mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM;cv.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:t.clientX,clientY:t.clientY,button:0}))}}},{capture:true,passive:false});
TPAD.mv=t=>{let dx=t.clientX-JOY.ox,dy=t.clientY-JOY.oy;const d=Math.hypot(dx,dy),R=TPAD.R;if(d>R){dx=dx/d*R;dy=dy/d*R}JOY.v=[dx/R,dy/R];tvStickDraw()};
addEventListener('touchmove',e=>{if(e.target!==cv||!$('tvstick'))return;e.preventDefault();e.stopImmediatePropagation();
  for(const t of e.changedTouches){if(t.identifier===JOY.id)TPAD.mv(t);else if(t.identifier===tapId){mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM}}},{capture:true,passive:false});
const tvEnd=e=>{if(e.target!==cv||!$('tvstick'))return;e.preventDefault();e.stopImmediatePropagation();
  for(const t of e.changedTouches){if(t.identifier===JOY.id){JOY.id=null;JOY.v=[0,0];tvStickHome();tvStickDraw();if(P)P.path=[]}else if(t.identifier===tapId){tapId=null;dispatchEvent(new MouseEvent('mouseup',{button:0}))}}};
addEventListener('touchend',tvEnd,{capture:true,passive:false});addEventListener('touchcancel',tvEnd,{capture:true,passive:false});

function tvCluster(){const sk=mySk();let h=`<button class="tb atk" data-t="dash" aria-label="Ausweichen in Laufrichtung">⟲</button>`;
  sk.forEach((s,i)=>{const[x,y]=TVSK[i]||TVSK[0];h+=`<button class="tb sk ${P.sk[s.id]?'':'locked'}" data-t="sk" data-id="${s.id}" style="right:${x-31}px;bottom:${y-31}px" aria-label="${s.n}">${skImg(s.id)}<i class="cd"></i><span class="k">F${s.key}</span></button>`});return h}
function tvPots(){return`<button class="tvq" data-tvp="life"><img class="px" src="${pxURL('potL')}" alt=""><b id="tvL"></b><small>Heiltrank</small></button>
  <button class="tvq" data-tvp="mana"><img class="px" src="${pxURL('potM')}" alt=""><b id="tvM"></b><small>Manatrank</small></button>
  <button class="tvq gold" data-tvp="flask">${skImg('flask')}<b id="tvF"></b><small>Flakon</small></button>
  <button class="tvq" data-tvp="loot"><span>⬇</span><small>Aufheben</small></button>`}
const _touchHudV=touchHud;touchHud=function(){if(!TOUCH)return;tvHtml();const play=G.state==='play'&&!!P,ovl=OVL.has(G.state)&&!!P,act=play||ovl?tvActive():null,pan=!!act||(play&&panels.some(p=>!$(p).hidden));
  document.body.classList.toggle('tvon',play||ovl);document.body.classList.toggle('tvpanel',pan);
  document.body.classList.toggle('tvdual',!$('pInv').hidden&&(!$('pShop').hidden||!$('pStash').hidden));
  $('tvdrop').hidden=!(play||ovl);$('tvbar').hidden=!(play||ovl)||!(TPAD.open||pan);$('tvdrop').classList.toggle('open',TPAD.open||pan);for(const id of['tvstick','tvdash','tvextra'])$(id).hidden=!play;
  for(const id of['tvpot','tvcl'])$(id).hidden=!play||pan;
  if(!(play||ovl)){$('tvx').hidden=true;return}
  for(const b of $('tvtabs').children)b.classList.toggle('act',b.dataset.tv===act);
  // the red close mark sits on the open page's upper left corner
  const x=$('tvx');x.hidden=!pan;if(pan){const el=ovl?null:[...panels].map(p=>$(p)).filter(p=>!p.hidden).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left)[0];
    const r=el?el.getBoundingClientRect():{left:8,top:$('tvtabs').getBoundingClientRect().bottom+6};x.style.left=Math.max(4,r.left-18)+'px';x.style.top=Math.max(4,r.top-14)+'px'}
  if(!play)return;
  const c=$('tvcl'),sig=P.cls+'|'+mySk().map(s=>s.id+(P.sk[s.id]?1:0)).join()+'|'+(typeof mElem==='function'?mElem():'');if(c.dataset.sig!==sig){c.dataset.sig=sig;c.innerHTML=tvCluster()}
  const pt=$('tvpot');if(!pt.firstChild)pt.innerHTML=tvPots();
  const set=(id,v)=>{const el=$(id);if(el&&el.textContent!==String(v))el.textContent=v};set('tvF',P.flasks);set('tvL',potCount('life'));set('tvM',potCount('mana'));
  // spirit ash and the horse show up beside the dash once they exist
  const ex=(typeof summonAsh==='function'?'a':'')+(P.eq&&P.eq.mount?'r':'');if(TPAD.pot!==ex){TPAD.pot=ex;$('tvextra').innerHTML=(ex.includes('a')?'<button class="tvb sm" data-tvp="ash" aria-label="Geisterasche">☁<small>Asche</small></button>':'')+(ex.includes('r')?'<button class="tvb sm" data-tvp="ride" aria-label="Reiten">♞<small>Reiten</small></button>':'')}
  for(const b of c.querySelectorAll('.tb.sk')){const s=SKBY[b.dataset.id],l=P.sk[s.id]?skLvl(s.id):0,cd=P.cds[s.id]||0,mx=s.cd*(1-P.d.cdr/100)||1,f=cd>0?Math.round(cd/mx*50)/50:0;
    if(b.dataset.f!==String(f)){b.dataset.f=f;b.style.setProperty('--cd',f)}b.classList.toggle('low',l>0&&P.mp<Math.max(1,Math.round(s.mana(l)*(1-P.d.mcost/100))))}
  if(JOY.id===null)tvStickDraw()};
