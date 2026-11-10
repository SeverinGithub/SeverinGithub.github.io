/* ---------- input ---------- */
const mouse={x:0,y:0,down:false,right:false,mid:false,shift:false};const keys={};
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousemove',e=>{mouse.x=e.clientX/ZM;mouse.y=e.clientY/ZM});
cv.addEventListener('mousedown',e=>{initAudio();if(AC&&AC.state==='suspended')AC.resume();mouse.x=e.clientX/ZM;mouse.y=e.clientY/ZM;if(G.state!=='play')return;
  if(G.hand&&e.button===0){dropItem(G.hand,P.x,P.y);G.hand=null;sfx('pick');updatePanels();return}
  if(e.button===2){mouse.right=true;const[wx,wy]=scr2w(mouse.x,mouse.y);const he=hoverEnemy();castSkill(P.sel,he?he.x:wx,he?he.y:wy);return}
  // the wheel button is a second plain attack: it never walks to a spot, it strikes toward the pointer (or goes for the foe under it) for as long as it is held
  if(e.button===1){e.preventDefault();if(P.dead)return;mouse.mid=true;closeDialog();const he=hoverEnemy();P.interact=null;P.pickup=null;P.moveTo=null;P.path=[];P.target=he||null;P.repath=0;return}
  if(e.button!==0)return;mouse.down=true;closeDialog();
  if(P.dead)return;
  const lab=hoverLabel();if(lab){P.pickup=lab.gi;P.target=null;P.interact=null;P.moveTo=null;P.path=findPath(P.x,P.y,lab.gi.x,lab.gi.y)||[];return}
  if(e.shiftKey){const[wx,wy]=scr2w(mouse.x,mouse.y);P.standAtk=Math.atan2(wy-P.y,wx-P.x);P.path=[];P.target=null;return}
  const he=hoverEnemy();if(he){P.target=he;P.interact=null;P.pickup=null;P.repath=0;return}
  const ho=hoverObj();if(ho){P.interact=ho;P.target=null;P.pickup=null;P.path=findPath(P.x,P.y,ho.x,ho.y)||[];return}
  P.target=null;P.interact=null;P.pickup=null;setMove()});
addEventListener('mouseup',e=>{if(e.button===0){mouse.down=false;P&&(P.standAtk=null)}if(e.button===1)mouse.mid=false;if(e.button===2)mouse.right=false});
addEventListener('blur',()=>{mouse.mid=false});
function setMove(){const[wx,wy]=scr2w(mouse.x,mouse.y);if(hyp(wx-P.x,wy-P.y)<.3){P.path=[];return}if(los(P.x,P.y,wx,wy,P.r)&&walkable(wx,wy))P.path=[[wx,wy]];else P.path=findPath(P.x,P.y,wx,wy)||[];G.clickFx={x:wx,y:wy,t:.4}}
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();escKey();return}
  if(!e.repeat&&(G.state==='play'||OVL.has(G.state))){if(k==='p'){toggleTree();return}if(k==='m'){toggleMap();return}if(k==='l'){toggleQuests();return}}
  if(G.state!=='play')return;
  if(k==='tab'){e.preventDefault();if(!e.repeat){CFG.lblOff=!CFG.lblOff;saveCfg();log(CFG.lblOff?'Namen am Boden ausgeblendet (Tab zeigt sie wieder, Alt solange gedrückt)':'Namen am Boden eingeblendet','#a39b88')}return}
  if(k==='v'&&!e.repeat){G.showMap=!G.showMap;return}
  if(e.repeat)return;
  if(k===' '){e.preventDefault();doRoll()}
  else if(k>='1'&&k<='6'){const s=mySk()[+k-1];if(!s)return;P.sel=s.id;const he=hoverEnemy();const[wx,wy]=scr2w(mouse.x,mouse.y);castSkill(s.id,he?he.x:wx,he?he.y:wy);buildBelt()}
  else if(k==='f')drinkFlask();else if(k==='q'||k==='y')quickPotion('life');else if(k==='x')quickPotion('mana');
  else if(k==='c')togglePanel('pChar');else if(k==='i'||k==='b')togglePanel('pInv');else if(k==='k'||k==='t')togglePanel('pSkill');else if(k==='j')togglePanel('pColl');
  else if(k==='r')reloadRes();else if(k==='n'){G.muted=!G.muted;if(G.muted){G.stepS=stopLoop(G.stepS);G.heartS=stopLoop(G.heartS)}if(mus.a)fadeAudio(mus.a,musVol(),400);log(G.muted?'Ton aus':'Ton an')}});
// both are asked many times per frame (every drawn object asks hoverObj), so each answer is kept until the next frame or mouse move
const HOV={f:-1,x:0,y:0,m:null,e:undefined,o:undefined};function hovFresh(){if(HOV.f!==RF||HOV.x!==mouse.x||HOV.y!==mouse.y||HOV.m!==G.map){HOV.f=RF;HOV.x=mouse.x;HOV.y=mouse.y;HOV.m=G.map;HOV.e=HOV.o=undefined}}
function hoverEnemy(){hovFresh();if(HOV.e===undefined)HOV.e=hoverEnemyRaw();return HOV.e}
function hoverObj(){hovFresh();if(HOV.o===undefined)HOV.o=hoverObjRaw();return HOV.o}
function hoverEnemyRaw(){let best=null,bd=1e9;for(const e of G.map.enemies){if(e.dead)continue;const[sx,sy]=iso(e.x,e.y),s=e.scale||1,dx=mouse.x-sx,dy=mouse.y-(sy-18*s);if(Math.abs(dx)<16*s+4&&Math.abs(dy)<22*s+4){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=e}}}return best}
function hoverObjRaw(){for(const o of G.map.objs){const[sx,sy]=iso(o.x,o.y);const big=o.type==='colossus',dx=mouse.x-sx,dy=mouse.y-(sy-(o.type==='door'?40:big?110:16));if(Math.abs(dx)<(big?42:26)&&Math.abs(dy)<(o.type==='door'?50:big?120:26))return o}return null}
function hoverLabel(){for(const l of G.labels)if(mouse.x>=l.x&&mouse.x<=l.x+l.w&&mouse.y>=l.y&&mouse.y<=l.y+l.h)return l;return null}

