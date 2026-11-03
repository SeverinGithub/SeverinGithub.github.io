/* ---------- comfort: loot filter, auto pickup, quick loot, inventory sort, touch controls ---------- */
CFG.lootf??=0;CFG.autopot??=true;CFG.autorune??=true;
let altDown=false;
// filtered loot keeps lying there, faint and without a name; Alt shows everything
function lootShown(it){if(altDown||it.slot==='potion'||it.slot==='rune'||it.rar==='unique'||it.rar==='runeword')return true;const f=CFG.lootf||0;if(f>=1&&it.rar==='normal'&&!it.soc)return false;if(f>=2&&it.rar==='magic')return false;return true}
const _drawGroundItemK=drawGroundItem;drawGroundItem=function(gi,sx,sy){if(lootShown(gi.item))return _drawGroundItemK(gi,sx,sy);ctx.save();ctx.globalAlpha=.35;_drawGroundItemK(gi,sx,sy);ctx.restore()};
addEventListener('keydown',e=>{if(e.key==='Alt'){altDown=true;e.preventDefault()}});addEventListener('keyup',e=>{if(e.key==='Alt')altDown=false});addEventListener('blur',()=>altDown=false);
function autoLoot(dt){if(!P||P.dead||G.state!=='play'||!G.map)return;G.alT=(G.alT||0)-dt;if(G.alT>0)return;G.alT=.15;
  for(const gi of G.map.items.slice()){if(gi.t<.45||Math.abs(gi.x-P.x)>1.1||Math.abs(gi.y-P.y)>1.1||hyp(gi.x-P.x,gi.y-P.y)>1)continue;const it=gi.item;
    if((it.slot==='potion'&&CFG.autopot)||(it.slot==='rune'&&CFG.autorune)){const n=P.inv.length;pickup(gi);if(P.inv.length===n&&G.map.items.includes(gi))continue;ftext(P.x,P.y-.4,it.name,it.slot==='rune'?'#f0b25a':'#ece4cf')}}}
// E: grab the nearest visible thing on the ground
function quickLoot(){let b=null,bd=2.6;for(const gi of G.map.items){if(!lootShown(gi.item))continue;const d=hyp(gi.x-P.x,gi.y-P.y);if(d<bd){bd=d;b=gi}}if(b)pickup(b);else log('Nichts in Reichweite.','#a39b88')}
addEventListener('keydown',e=>{if(e.repeat||G.state!=='play'||!P)return;if(e.key.toLowerCase()==='e')quickLoot()});
function invSort(){if(G.hand)returnHand();const all=P.inv.slice();const ord={weapon:0,offhand:1,armor:2,helm:3,gloves:4,boots:5,belt:6,ring:7,amulet:8,rune:9,potion:10},rr={unique:0,runeword:1,rare:2,magic:3,normal:4,rune:5};
  all.sort((a,b)=>{const[aw,ah]=isz(a),[bw,bh]=isz(b);return(ord[a.slot]??11)-(ord[b.slot]??11)||bw*bh-aw*ah||(rr[a.rar]??6)-(rr[b.rar]??6)||(b.ilvl||0)-(a.ilvl||0)||(a.rune&&b.rune?RBY[b.rune].i-RBY[a.rune].i:0)});
  P.inv=[];const left=[];for(const it of all){if(it.slot==='potion'){it.n=it.n||1}if(!invAdd(it))left.push(it)}for(const it of left)dropItem(it,P.x,P.y);sfx('pick');updatePanels()}
const _buildInvK=buildInv;buildInv=function(){_buildInvK();const h=$('pInv').querySelector('h2 [data-close]');if(h&&!$('invSort'))h.insertAdjacentHTML('beforebegin','<button id="invSort" title="Nach Art, Größe und Seltenheit">Sortieren</button>')};
document.addEventListener('click',e=>{if(e.target.id==='invSort'&&P)invSort()});

// settings: a loot section
function cfgLootHTML(){return`<h3>Beute</h3><label class="mrow"><span>Am Boden beschriften</span><select data-cfg="lootf" id="cfg-lootf"><option value="0" ${CFG.lootf==0?'selected':''}>Alles</option><option value="1" ${CFG.lootf==1?'selected':''}>ab Magisch</option><option value="2" ${CFG.lootf==2?'selected':''}>ab Selten</option></select></label>
  <label class="mcheck"><span>Tränke automatisch aufheben</span><input type="checkbox" data-cfg="autopot" id="cfg-autopot" ${CFG.autopot?'checked':''}></label><label class="mcheck"><span>Runen automatisch aufheben</span><input type="checkbox" data-cfg="autorune" id="cfg-autorune" ${CFG.autorune?'checked':''}></label><p class="hint" style="margin:2px 0 0">Alt zeigt alles, E hebt das Nächste auf. Einzigartiges, Runen und gesockelte Gegenstände bleiben immer sichtbar.</p>`}
new MutationObserver(()=>{const b=$('mbox');if(!b)return;const h=[...b.querySelectorAll('h3')].find(x=>x.textContent==='Kampf');if(h&&!b.querySelector('#cfg-lootf')){const back=b.querySelector('[data-m="back"]');back&&back.insertAdjacentHTML('beforebegin',cfgLootHTML())}}).observe($('menu'),{childList:true,subtree:true});
$('menu').addEventListener('change',e=>{const t=e.target;if(t.id==='cfg-lootf'){CFG.lootf=+t.value;saveCfg()}});

// touch: the canvas answers fingers like a mouse, a pad offers skill, roll and potion
const TOUCH=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
function touchMouse(type,t,btn=0){cv.dispatchEvent(new MouseEvent(type,{bubbles:true,clientX:t.clientX,clientY:t.clientY,button:btn}))}
cv.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;e.preventDefault();const t=e.touches[0];mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM;touchMouse('mousedown',t)},{passive:false});
cv.addEventListener('touchmove',e=>{if(e.touches.length!==1)return;e.preventDefault();const t=e.touches[0];mouse.x=t.clientX/ZM;mouse.y=t.clientY/ZM},{passive:false});
cv.addEventListener('touchend',e=>{e.preventDefault();dispatchEvent(new MouseEvent('mouseup',{button:0}))},{passive:false});
function nearFoe(r){let b=null,bd=r;for(const e of G.map.enemies){if(e.dead)continue;const d=hyp(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b=e}}return b}
function touchCast(){if(!P||G.state!=='play')return;const f=nearFoe(9),a=P.face;castSkill(P.sel,f?f.x:P.x+Math.cos(a)*4,f?f.y:P.y+Math.sin(a)*4)}
function touchPad(){if(!TOUCH||$('tpad'))return;document.body.insertAdjacentHTML('beforeend',`<div id="tpad"><button data-tp="cast" aria-label="Fertigkeit wirken">✦</button><button data-tp="roll" aria-label="Ausweichrolle">⟲</button><button data-tp="flask" aria-label="Heilflakon">✚</button><button data-tp="loot" aria-label="Aufheben">⬇</button><button data-tp="ash" aria-label="Geisterasche">☁</button></div>`);
  $('tpad').addEventListener('touchstart',e=>{const b=e.target.closest('[data-tp]');if(!b||!P||G.state!=='play')return;e.preventDefault();const k=b.dataset.tp;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),150);
    if(k==='cast')touchCast();else if(k==='roll')doRoll();else if(k==='flask')drinkFlask();else if(k==='loot')quickLoot();else if(k==='ash')summonAsh()},{passive:false})}
function updComfort(dt){autoLoot(dt);if(G.state==='play')touchPad();const tp=$('tpad');if(tp)tp.hidden=G.state!=='play'}
