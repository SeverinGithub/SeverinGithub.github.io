/* ---------- pages, third pass: the statistics page · a question before anything is sold · on tablets every page fills the screen,
   a tap on an item shows it with its actions, a drag moves it ---------- */
// statistics: counted as you play, kept with the hero
const STF={deaths:0,glutIn:0,glutOut:0,drinks:0,maxHit:0,walk:0,kills:{},wbK:0,tbK:0};
const stOf=()=>{if(!P.st2)P.st2=JSON.parse(JSON.stringify(STF));for(const k in STF)if(P.st2[k]==null)P.st2[k]=JSON.parse(JSON.stringify(STF[k]));return P.st2};
const _saveDataSt=saveData;saveData=function(){const d=_saveDataSt();if(d&&P){d.p.st2=stOf()}return d};
let stLast={g:null,x:null,y:null};
function statTick(){if(!P||G.state!=='play')return;const S=stOf();
  if(stLast.g!=null){const d=P.glut-stLast.g;if(d>0)S.glutIn+=d;else if(d<0)S.glutOut-=d}stLast.g=P.glut;
  if(stLast.x!=null&&!P.dead){const d=hyp(P.x-stLast.x,P.y-stLast.y);if(d<3)S.walk+=d}stLast.x=P.x;stLast.y=P.y}
const _killEnemySt=killEnemy;killEnemy=function(e,a){const was=e&&!e.dead&&!e.dummy&&!e.wall;_killEnemySt(e,a);if(!was||!e.dead||!P)return;const S=stOf(),k=e.boss?(e.wb?'wboss':'tboss'):e.type;S.kills[k]=(S.kills[k]||0)+1};
const _hitEnemySt=hitEnemy;hitEnemy=function(e,dmg,o={}){const r=_hitEnemySt(e,dmg,o);if(P&&dmg>0&&!o.ally&&!o.dot&&dmg<1e8){const S=stOf();if(dmg>S.maxHit)S.maxHit=Math.round(dmg)}return r};
const _dieSt=die;die=function(){const was=P&&P.dead;_dieSt();if(P&&P.dead&&!was)stOf().deaths++};
const _drinkFlaskSt=drinkFlask;drinkFlask=function(){const n=P.flasks;_drinkFlaskSt();if(P.flasks<n)stOf().drinks++};
const _usePotionSt=usePotion;usePotion=function(it){stOf().drinks++;return _usePotionSt(it)};
const STNM={skel:'Knochenwichte',archer:'Knochenschützen',ghoul:'Ghule',spider:'Spinnen',cult:'Kultisten',wraith:'Klageseelen',golem:'Kolosse',scorp:'Skorpione',dragon:'Drachen',wolf:'Werwölfe',tboss:'Turmwächter',wboss:'Inselherren'};
const fmtN=n=>Math.round(n).toLocaleString('de-DE');
function buildStats(){const S=stOf(),f=P.found||{},row=(a,b)=>`<span>${a}</span><b>${b}</b>`,pt=P.playT||0,
    tb=Object.keys(G.bossDead||{}).filter(k=>G.bossDead[k]).length,wb=Object.keys(G.owBoss||{}).length,uq=Object.keys(f).filter(k=>k.startsWith('u:')).length,rw=Object.keys(f).filter(k=>k.startsWith('rw:')).length,
    kl=Object.entries(S.kills).sort((a,b)=>b[1]-a[1]);
  $('pStat').innerHTML=`<h2>Statistik <button data-close>Schließen</button></h2><div class="stcols">
  <div class="stcard"><h3>Der Weg</h3><div class="recs">${row('Spielzeit',Math.floor(pt/3600)+' h '+Math.floor(pt%3600/60)+' min')}${row('Stufe',P.lvl+(P.pl?' · Paragon '+P.pl:''))}${row('Tiefste Ebene',G.maxFloor||0)}${row('Höchster Riss',P.riftMax||1)}${row('Risse geschlossen',qCnt('rift'))}${row('Schwierigkeit',DIFF[diff()].n)}${row('Gelaufen',(S.walk/1000).toFixed(2).replace('.',',')+' km')}${row('Tode',S.deaths)}</div></div>
  <div class="stcard"><h3>Kämpfe</h3><div class="recs">${row('Gegner besiegt',fmtN(qCnt('kill')))}${row('Champions',fmtN(qCnt('champ')))}${row('Einzigartige Gegner',fmtN(qCnt('uniq')))}${row('Turmwächter',tb)}${row('Inselherren',wb+' / '+WB.length)}${row('Höchster Treffer',fmtN(S.maxHit))}${row('Kopfgelder',qCnt('bounty'))}${row('Glutdiebe gestellt',qCnt('thief'))}</div>
    ${kl.length?`<div class="recs sm">${kl.slice(0,8).map(([k,n])=>row(STNM[k]||k,fmtN(n))).join('')}</div>`:''}</div>
  <div class="stcard"><h3>Schätze</h3><div class="recs">${row('Einzigartige gefunden',uq+' / '+UNIQ.length)}${row('Runenwörter',rw+' / '+RW.length)}${row('Truhen geöffnet',fmtN(qCnt('chest')))}${row('Gekauft',fmtN(qCnt('buy')))}${row('Verkauft',fmtN(qCnt('sell')))}${row('Glut verdient',fmtN(S.glutIn))}${row('Glut ausgegeben',fmtN(S.glutOut))}${row('Tränke getrunken',fmtN(S.drinks))}${row('Händler gerettet',qCnt('rescue'))}</div></div>
  </div><p class="hint">Alles wird mit deinem Helden gespeichert.</p>`}
document.querySelector('#pColl').insertAdjacentHTML('afterend','<div class="panel left" id="pStat" hidden></div>');panels.push('pStat');
const _togglePanelSt=togglePanel;togglePanel=function(id){if(id==='pStat'){const open=$('pStat').hidden;for(const p of['pChar','pSkill','pShop','pColl','pStash'])$(p).hidden=true;$('pStat').hidden=!open;updatePanels();hideTip();return}$('pStat').hidden=true;return _togglePanelSt(id)};
const _updatePanelsSt=updatePanels;updatePanels=function(){_updatePanelsSt();if(P&&!$('pStat').hidden)buildStats()};
TPAD.tabs.splice(5,0,['S','pStat','Statistik']);
addEventListener('keydown',e=>{if(e.repeat||G.state!=='play'||!P)return;if(e.key.toLowerCase()==='o'){togglePanel('pStat')}});

// selling asks first; junk goes without a question
const SQ={it:null};
function sellAsk(it){if(!it)return;const v=sellP(it),who=(G.shop&&G.shop.name)||'Odalinde';let el=$('sellq');
  if(!el){document.body.insertAdjacentHTML('beforeend','<div id="sellq" hidden><div class="sqbox"><div class="sqimg"></div><p></p><div class="sqb"><button data-sq="yes">Verkaufen</button><button data-sq="no">Behalten</button></div></div></div>');el=$('sellq');
    el.addEventListener('click',e=>{const b=e.target.closest('[data-sq]');if(!b&&e.target!==el)return;const it2=SQ.it;SQ.it=null;el.hidden=true;if(b&&b.dataset.sq==='yes'&&it2&&P.inv.includes(it2)){SQ.ok=it2;sellItem(it2);SQ.ok=null}})}
  SQ.it=it;hideTip();el.querySelector('.sqimg').innerHTML=`<img class="px" src="${invIcon(it)}" alt="">`;
  el.querySelector('p').innerHTML=`<b style="color:${RCOL[it.rar]||'#e8e2d0'}">${it.name}</b><br>an ${who} verkaufen?<br><span class="sqv">${v} Glut</span>`;el.hidden=false}
const _sellItemQ=sellItem;sellItem=function(it){if(!it)return;if(it.slot==='junk'||SQ.ok===it)return _sellItemQ(it);sellAsk(it)};
addEventListener('keydown',e=>{const el=$('sellq');if(!el||el.hidden)return;if(e.key==='Enter'){e.preventDefault();el.querySelector('[data-sq="yes"]').click()}else if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();el.querySelector('[data-sq="no"]').click()}},true);

// tablet pages: wide layouts instead of one long column
function tvCols(el,splits){if(!TOUCH||!el)return;const kids=[...el.children],h2=kids[0];if(!h2||h2.tagName!=='H2')return;const cols=[[]];
  for(const k of kids.slice(1)){if(cols[cols.length-1].length&&splits(k))cols.push([]);cols[cols.length-1].push(k)}
  const w=document.createElement('div');w.className='tvcols';for(const c of cols){const d=document.createElement('div');for(const k of c)d.appendChild(k);w.appendChild(d)}el.appendChild(w)}
TPAD.sec={};
function tvSections(el,id){if(!TOUCH||!el)return;const kids=[...el.children],h2=kids[0];if(!h2||h2.tagName!=='H2')return;const secs=[];let pre=[];
  for(const k of kids.slice(1)){if(k.tagName==='H3'){secs.push({h:k,els:[]});continue}if(secs.length)secs[secs.length-1].els.push(k);else pre.push(k)}
  if(secs.length<2)return;const cur=Math.min(TPAD.sec[id]||0,secs.length-1),bar=document.createElement('div');bar.className='tvsec';
  bar.innerHTML=secs.map((s,i)=>`<button data-tvsec="${i}" data-tvp="${id}" class="${i===cur?'on':''}">${s.h.textContent.replace(/·.*$/,'').trim()}</button>`).join('');
  h2.after(bar);secs.forEach((s,i)=>{for(const k of[s.h,...s.els])k.hidden=i!==cur})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tvsec]');if(!b)return;TPAD.sec[b.dataset.tvp]=+b.dataset.tvsec;sfx('pick');updatePanels()});
const _buildCharT=buildChar;buildChar=function(){_buildCharT();tvCols($('pChar'),k=>k.tagName==='H3'&&/Kampfwerte|Paragon/.test(k.textContent))};
const _buildInvT=buildInv;buildInv=function(){_buildInvT();const h=TOUCH&&$('pInv').querySelector(':scope>.hint');if(h)h.textContent='Tippen: ansehen und handeln · Ziehen: verschieben, anlegen oder auf den Boden legen'};
const _buildCollT=buildColl;buildColl=function(){_buildCollT();tvSections($('pColl'),'pColl')};

// tablet items: a tap shows the piece with what can be done with it, a drag carries it, a drop on the world lays it on the ground
const TI={t:null};
function tvTipFor(src){const d=src.dataset;let it,acts=[],where;
  if(d.inv!=null){it=P.inv[+d.inv];if(!it)return null;where='inv';
    if(!$('pShop').hidden)acts.push(['sell','Verkaufen · '+sellP(it)+' Glut']);
    if(it.slot==='potion')acts.push(['drink','Trinken']);else if(it.slot!=='junk'&&it.slot!=='rune')acts.push(['equip','Anlegen']);
    if(!$('pStash').hidden)acts.push(['stash','In die Truhe']);acts.push(['drop','Auf den Boden'])}
  else if(d.eq){it=P.eq[d.eq];if(!it)return null;where='eq';acts.push(['uneq','Ablegen'])}
  else if(d.st!=null){it=P.stash[+d.st];if(!it)return null;where='st';acts.push(['toinv','Ins Inventar'])}
  else if(d.shopit!=null){it=stockFor(G.shop||{})[+d.shopit];if(!it)return null;where='shop'}
  if(!it)return null;return{it,where,acts}}
function tvShowTip(src,x,y){const T=tvTipFor(src);if(!T)return;const{it,where,acts}=T;TI.sel={it,where,key:src.dataset.eq};
  showTip(itemTipHTML(it,where==='eq'?'equipped':where==='shop'?'Kaufen: '+buyP(it)+' Glut':'')+(acts.length?`<div class="tva">${acts.map(([k,n])=>`<button data-tva="${k}">${n}</button>`).join('')}</div>`:'')+(where!=='shop'?'<div class="act">Ziehen verschiebt</div>':''),x,y);
  $('tip').classList.add('tvtip')}
function tvAct(k){const S=TI.sel;if(!S||!P)return;const it=S.it;hideTip();
  if(k==='sell'&&P.inv.includes(it))sellItem(it);else if(k==='drink'&&P.inv.includes(it))usePotion(it);else if(k==='equip'&&P.inv.includes(it))equip(it);
  else if(k==='stash'&&P.inv.includes(it)){invDel(it);stAdd(it);sfx('pick');updatePanels()}else if(k==='drop'&&P.inv.includes(it)){invDel(it);dropItem(it,P.x,P.y);sfx('pick');updatePanels()}
  else if(k==='uneq'&&S.key&&P.eq[S.key]===it)unequip(S.key);else if(k==='toinv'&&P.stash.includes(it))stToInv(it)}
// on a tablet the card stays until a finger lands elsewhere; stray mouse moves do not close it
const _hideTipT=hideTip;hideTip=function(){const t=$('tip');if(TI.mm&&t.classList.contains('tvtip'))return;t.classList.remove('tvtip');TI.sel=null;_hideTipT()};
if(TOUCH)document.addEventListener('mousemove',()=>{TI.mm=1;clearTimeout(TI.mmT);TI.mmT=setTimeout(()=>TI.mm=0,0)},true);
function tvLift(src){const d=src.dataset;let it=null;
  if(d.inv!=null){it=P.inv[+d.inv];if(it)invDel(it)}else if(d.eq){it=P.eq[d.eq];if(it){P.eq[d.eq]=null}}else if(d.st!=null){it=P.stash[+d.st];if(it)stDel(it)}
  if(!it)return false;G.hand=it;TI.from=d.inv!=null?'inv':d.eq?'eq':'st';sfx('pick');hideTip();updatePanels();return true}
const tvUnder=(x,y)=>{const h=$('hand'),v=h.style.visibility;h.style.visibility='hidden';const el=document.elementFromPoint(x,y);h.style.visibility=v;return el};
function tvMove(x,y){const el=tvUnder(x,y);if(el)el.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:x,clientY:y}))}
function tvDrop(x,y){const el=tvUnder(x,y),it=G.hand;if(!it)return;
  if(el===cv){cv.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:x,clientY:y,button:0}));dispatchEvent(new MouseEvent('mouseup',{button:0}));return}
  if(el&&el.closest('#pShop')&&TI.from==='inv'){returnHand();updatePanels();if(P.inv.includes(it))sellItem(it);return}
  if(el&&el.closest('#grid,#sgrid,[data-eq]'))el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y,button:0}));
  if(G.hand){returnHand();updatePanels()}}
const TISEL='#pInv [data-inv],#pInv [data-eq],#pStash [data-st],#pShop [data-shopit]';
if(TOUCH){
  document.addEventListener('touchstart',e=>{const tip=$('tip');if(e.target.closest&&e.target.closest('#tip'))return;
    const src=e.target.closest&&e.target.closest(TISEL);if(!src||G.hand||!P||!(G.state==='play'||OVL.has(G.state))){if(!tip.hidden&&tip.classList.contains('tvtip'))hideTip();return}
    e.preventDefault();const t=e.changedTouches[0],T={id:t.identifier,x0:t.clientX,y0:t.clientY,src,drag:false,t0:performance.now()};TI.t=T;
    const mv=ev=>{for(const q of ev.changedTouches){if(q.identifier!==T.id)continue;ev.preventDefault();
        if(!T.drag&&Math.hypot(q.clientX-T.x0,q.clientY-T.y0)>12&&src.dataset.shopit==null){T.drag=tvLift(src)}
        if(T.drag)tvMove(q.clientX,q.clientY)}},
      up=ev=>{for(const q of ev.changedTouches){if(q.identifier!==T.id)continue;ev.preventDefault();src.removeEventListener('touchmove',mv);src.removeEventListener('touchend',up);src.removeEventListener('touchcancel',up);TI.t=null;
        if(T.drag){if(ev.type==='touchcancel'){returnHand();updatePanels()}else tvDrop(q.clientX,q.clientY)}
        else{const r=src.getBoundingClientRect();tvShowTip(src,r.right,r.top+r.height/2)}}};
    src.addEventListener('touchmove',mv,{passive:false});src.addEventListener('touchend',up,{passive:false});src.addEventListener('touchcancel',up,{passive:false})},{capture:true,passive:false});
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tva]');if(b){e.stopPropagation();tvAct(b.dataset.tva)}},true)}

