/* ---------- loot economy: gear comes slowly, junk fills the bags ---------- */
// fallen guardians, tower keepers and island lords alike, open the way to jewels and runes
const bossCount=()=>Object.keys(G.bossDead||{}).filter(k=>k!=='rift'&&G.bossDead[k]).length+Object.keys(G.owBoss||{}).filter(k=>G.owBoss[k]).length;
const jewelOK=()=>bossCount()>=2,runeOK=()=>bossCount()>=3;
// plain gear is the rule; magic is a find, rare a story, unique a legend. Nothing above plain in the first steps
rollRarity=function(ilvl,mf,boost){const f=1+mf/100,x=R(),u=ilvl<12?0:(.0005+boost*.01)*f,r=u+(ilvl<8?0:(.005+boost*.06)*f),m=r+(ilvl<3?.015:.07+boost*.2)*Math.min(f,2.5);return x<u?'unique':x<r?'rare':x<m?'magic':'normal'};
// foes are as strong as their place, and never much weaker than the one who comes for them
function mlNow(){let b=G.mlvl;const f=G.floor;if(typeof f==='number'&&f>0&&G.map&&G.maps[f]===G.map)b=1+(f-1)*2;return Math.max(1,Math.round(b),P?P.lvl-1:1)}
const mlWrap=fn=>function(...a){const pm=G.mlvl,ml=mlNow();G.mlvl=ml;try{const e=fn.apply(this,a);if(e)e.ml=ml;return e}finally{G.mlvl=pm}};
makeEnemy=mlWrap(makeEnemy);makeBoss=mlWrap(makeBoss);makeWBoss=mlWrap(makeWBoss);
// a floor left behind by a hero who has since grown wakes up anew
const _enterFloorL=enterFloor;enterFloor=function(f){const tw=typeof f==='number'&&f>0;if(tw&&P&&G.maps[f]&&(G.maps[f].pl||0)<P.lvl-3)delete G.maps[f];_enterFloorL(f);if(tw&&G.map&&!G.map.pl)G.map.pl=P.lvl};

// junk: stackable, worth a few glut, and what most foes really carry
const JMAX=20;
const JUNK={
  holz:{n:'Morsches Holz',v:1,d:'Taugt nicht einmal zum Feuer.'},knochen:{n:'Knochen',v:1,d:'Abgenagt. Von wem, will man nicht wissen.'},
  schaedel:{n:'Schädelsplitter',v:2,d:'Ein Stück von jemandem, der hier nicht mehr wohnt.'},klinge:{n:'Zerbrochene Klinge',v:4,d:'Der bessere Teil fehlt.'},
  nagel:{n:'Rostige Nägel',v:1,d:'Aus einem Sarg gezogen.'},fleisch:{n:'Verrottetes Fleisch',v:1,d:'Riecht so, wie es aussieht.'},
  auge:{n:'Spinnenauge',v:3,d:'Es sieht dich noch an.'},seide:{n:'Spinnenseide',v:2,d:'Klebt an allem, nur nicht an Glück.'},
  zahn:{n:'Fauler Zahn',v:2,d:'Schwarz bis zur Wurzel.'},fetzen:{n:'Stofffetzen',v:1,d:'Einmal war das ein Gewand.'},
  feder:{n:'Krähenfeder',v:1,d:'Die Krähen waren zuerst hier.'},fluegel:{n:'Fledermausflügel',v:2,d:'Ledrig und kalt.'},
  kerze:{n:'Kerzenstummel',v:1,d:'Brannte für ein Gebet, das niemand hörte.'},scherbe:{n:'Tonscherbe',v:1,d:'Ein Krug, der zu oft fiel.'},
  asche:{n:'Grabstaub',v:2,d:'Ein Beutel voll von dem, was übrig bleibt.'},pilz:{n:'Modriger Pilz',v:1,d:'Wächst, wo Licht nie hinkommt.'},
  schuppe:{n:'Panzerschuppe',v:2,d:'Hart wie Horn, dünn wie Papier.'},stachel:{n:'Giftstachel',v:3,d:'Trocken. Meistens.'},
  brocken:{n:'Steinbrocken',v:1,d:'Schwer und völlig wertlos.'},stein:{n:'Zeichenloser Stein',v:2,d:'Glatt wie eine Rune, doch ohne Zeichen.'},
  schleim:{n:'Schleimklumpen',v:1,d:'Zuckt noch ein wenig.'}};
const JFAM={skel:['knochen','knochen','schaedel','klinge','nagel'],archer:['knochen','schaedel','feder','nagel'],ghoul:['fleisch','fleisch','zahn','fetzen'],
  spider:['auge','auge','seide'],cult:['kerze','fetzen','asche'],wraith:['asche','fetzen','kerze'],golem:['brocken','brocken','scherbe'],scorp:['schuppe','stachel'],
  x:['holz','holz','nagel','scherbe','pilz','feder','fetzen','fluegel','schleim','knochen']};
function makeJunk(k,lv){const j=JUNK[k]||JUNK.holz;lv=Math.max(1,lv||1);return{id:UID++,b:'Junk:'+k,jk:k,slot:'junk',cls:'junk',rar:'junk',name:j.n,ilvl:lv,v:Math.max(1,Math.round(j.v*(1+lv*.06))),n:1,mods:{},req:{lvl:1,str:0,dex:0}}}
function junkFor(e,lv){const f=e&&(JFAM[e.type]||JFAM[e.look]);return makeJunk(pick(f&&Math.random()<.7?f:JFAM.x),lv||(e&&e.ml)||mlNow())}

// pixel shapes for the junk, in the same 16x16 role language as the gear
const jl=(m,l)=>m*4+(l>.45?3:l>.05?2:l>-.4?1:0);
const jE=(x,y,cx,cy,rx,ry)=>{const dx=(x-cx)/rx,dy=(y-cy)/ry;return dx*dx+dy*dy<=1?-(dx+dy)*.7+.15:null};
const jSeg=(x,y,ax,ay,bx,by)=>{const vx=bx-ax,vy=by-ay,t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1);return Math.hypot(x-ax-vx*t,y-ay-vy*t)};
const JPX={
  holz:[()=>pdiag((a,p)=>{if(a<-10||a>10||Math.abs(p)>2.6)return -1;if(a>=9)return Math.abs(p)<1.5?7:5;return jl(0,-p/3+((a*7+p*3)%5===0?-.6:0))}),'wood','bone','wood','ruby'],
  knochen:[()=>pdiag((a,p)=>{const e=Math.abs(a);if(e<=7&&Math.abs(p)<=1)return jl(0,-p/2);if(e>7&&e<=11&&Math.abs(p)<=3&&!(e>=10&&Math.abs(p)<=1))return jl(0,-p/3+.25);return -1}),'bone','bone','bone','ruby'],
  schaedel:[()=>pfill((x,y)=>{const l=jE(x,y,7.5,7.5,6,5.4);if(l==null||x+y>17+(x*5%3))return -1;if(Math.hypot(x-6,y-8)<1.7)return 16;if(y===11&&x%2)return 16;return jl(0,l)}),'bone','bone','bone','ruby'],
  klinge:[()=>wBlade({tip:4,g:-3,hw:2,gw:3,grip:-8,taper:1,serr:1}),'iron','bronze','leather','ruby'],
  nagel:[()=>pfill((x,y)=>{for(const[nx,ny,h]of[[4,3,9],[8,5,9],[12,2,10]]){if(y===ny&&Math.abs(x-nx)<=1)return x<nx?3:x>nx?1:2;if(x===nx&&y>ny&&y<=ny+h)return y>ny+h-2?0:(y%3?2:1)}return -1}),'iron','iron','iron','ruby'],
  fleisch:[()=>pfill((x,y)=>{if(x>=10&&x<=14&&y>=2&&y<=7&&Math.abs((x-10)+(y-7))<=1.2)return x+y<14?7:5;const l=jE(x,y,7.5,9.5,6.5,4.6);if(l==null)return -1;if((x*7+y*11)%13===0)return 9;return jl(0,l+((x+y)%4===0?-.3:0))}),'blood','bone','moss','ruby'],
  auge:[()=>pfill((x,y)=>{for(const[cx,cy,r]of[[5,6,3.2],[11,7,2.7],[8,11.5,2.4]]){const d=Math.hypot(x-cx,y-cy);if(d<=r){if(d<r*.35)return 16;if(Math.hypot(x-cx+r*.45,y-cy+r*.45)<r*.3)return 19;return x-cx+y-cy<0?18:17}}return jE(x,y,8,9,7,5.5)!=null?1:-1}),'dark','dark','dark','ruby'],
  seide:[()=>pfill((x,y)=>{if(x===12&&y<6)return 1;const l=jE(x,y,7.5,9,5.6,5.2);if(l==null)return -1;return jl(0,l+((x+2*y)%4===0?.5:(x-y)%5===0?-.5:0))}),'moon','moon','moon','ruby'],
  zahn:[()=>pfill((x,y)=>{const l=jE(x,y,7.5,6,4.5,3.8);if(l!=null)return Math.hypot(x-9,y-5)<1.1?4:jl(0,l);for(const rx of[5.5,9.5]){const w=1.6-(y-8)*.22;if(y>=8&&y<=14&&Math.abs(x-rx)<=w)return jl(0,(rx-x)/2-.1)}return -1}),'bone','leather','bone','ruby'],
  fetzen:[()=>pfill((x,y)=>{if(Math.abs(x-7.5)>6.5-(y%3===0?1:0)||y<2+(x*7%3)||y>13-(x*5%4))return -1;return jl(0,Math.sin(x*.9)*.6-(y-8)*.05)}),'cloth','cloth','cloth','ruby'],
  feder:[()=>pdiag((a,p)=>{if(Math.abs(a)<=11&&Math.abs(p)<=1)return 6;if(a>-6&&a<=11){const w=3.4-Math.max(0,a-6)*.5;if(Math.abs(p)<=w&&(a-p+60)%6!==0)return jl(0,-p/3)}return -1}),'dark','bone','dark','ruby'],
  fluegel:[()=>pfill((x,y)=>{for(const[bx,by]of[[14,3],[11,10],[6,12]])if(jSeg(x,y,2,3,bx,by)<.7)return 6;if(x<2||x>14||y<3)return -1;const bot=12-Math.abs(x-8)*.55-((x%4)<2?0:1);if(y>bot)return -1;return jl(0,-(x-8)/10-(y-6)/6)}),'leather','bone','leather','ruby'],
  kerze:[()=>pfill((x,y)=>{if(x===7&&y>=3&&y<=5)return 16;if(x>=5&&x<=9&&y>=6&&y<=12)return jl(0,(7-x)/2.5+(y===6?.4:0));if((x===4||x===10)&&y>=7&&y<=7+(x%3))return 1;const l=jE(x,y,7.5,13,4.5,1.6);return l!=null?1:-1}),'bone','bone','bone','ember'],
  scherbe:[()=>pfill((x,y)=>{const a=(9-2)*(y-12)-(2-12)*(x-2),b=(13-9)*(y-2)-(13-2)*(x-9),c=(2-13)*(y-13)-(12-13)*(x-13);if(!(a<=0&&b<=0&&c<=0)&&!(a>=0&&b>=0&&c>=0))return -1;if(y===8||y===9&&x%2)return 5;return jl(0,-(x+y-14)/9)}),'bronze','dark','bronze','ruby'],
  asche:[()=>pfill((x,y)=>{if(y<=3&&(x*3+y*5)%4===0&&Math.abs(x-7.5)<4)return 9;if(y>=4&&y<=6&&x>=6&&x<=9)return y===5?6:jl(0,(7.5-x)/2);const l=jE(x,y,7.5,10.5,5.2,4.5);return l!=null?jl(0,l):-1}),'leather','bone','stone','ruby'],
  pilz:[()=>pfill((x,y)=>{const l=jE(x,y,7.5,6.5,6.2,3.8);if(l!=null&&y<=7)return(x*3+y*5)%7===0?7:jl(0,l);if(x>=6&&x<=9&&y>=7&&y<=13)return jl(1,(7.5-x)/2);return -1}),'blood','bone','bone','ruby'],
  schuppe:[()=>pfill((x,y)=>{if(y<2||y>14)return -1;const w=5.5-Math.max(0,y-8)*.85;if(Math.abs(x-7.5)>w)return -1;if((y-2)%4===0&&Math.abs(x-7.5)<w-.5)return 1;return jl(0,-(x-7.5)/5-(y-7)/10)}),'venom','venom','venom','ruby'],
  stachel:[()=>pfill((x,y)=>{if(jSeg(x,y,12,6,14,9)<.8)return 5;const d=Math.min(jSeg(x,y,3,13,5,8),jSeg(x,y,5,8,8,4),jSeg(x,y,8,4,12,4),jSeg(x,y,12,4,12,6)),w=1.9-(x>9?.6:0);return d<w?jl(0,-d+.3-(x-6)/12):-1}),'bronze','dark','bronze','ruby'],
  brocken:[()=>pfill((x,y)=>{const l=jE(x,y,8,9,6.5,5.2);if(l==null||x+y<7||y>13)return -1;return x<y-1?1:x+y<14?3:2}),'stone','stone','stone','ruby'],
  stein:[()=>pfill((x,y)=>{const l=jE(x,y,7.5,9,5.8,4.4);return l==null?-1:jl(0,l)}),'stone','stone','stone','ruby'],
  schleim:[()=>pfill((x,y)=>{const l=jE(x,y,7.5,10,5,4.2);if(l!=null)return Math.hypot(x-5.5,y-8.5)<1.2?3:jl(0,l);if(y>=2&&y<7&&Math.abs(x-7.5)<=(y-2)*.7)return jl(0,(7.5-x)/2+.2);return -1}),'venom','venom','venom','ruby']};
for(const k in JPX)PXS['Junk:'+k]=JPX[k];
RCOL.junk='#9a9282';

// stacks, prices, tips and the shop's junk counter
const _invAddL=invAdd;invAdd=function(it){if(it&&it.slot==='junk'){let left=it.n||1;for(const s of P.inv)if(left>0&&s.slot==='junk'&&s.jk===it.jk&&s.n<JMAX){const t=Math.min(JMAX-s.n,left);s.v=Math.round((s.v*s.n+it.v*t)/(s.n+t));s.n+=t;left-=t}if(!left)return true;it.n=left}return _invAddL(it)};
const _itemValueL=itemValue;itemValue=function(it){return it&&it.slot==='junk'?it.v*(it.n||1):_itemValueL(it)};
const _invClickL=invClick;invClick=function(it,shift){if(it&&it.slot==='junk'&&!shift&&$('pShop').hidden){hideTip();return}return _invClickL(it,shift)};
const _discoverL=discover;discover=function(it){if(it&&it.slot==='junk')return;return _discoverL(it)};
const _tipL=itemTipHTML;itemTipHTML=function(it,c){if(!it||it.slot!=='junk')return _tipL(it,c);
  return`${invImg(it)}<div class="nm c-junk">${it.name}</div><div class="base">Ramsch${it.n>1?' · Stapel: '+it.n+' / '+JMAX:''}</div><div class="base"><i>${JUNK[it.jk].d}</i></div><div class="base" style="margin-top:4px">Wert: ${it.v} Glut pro Stück${it.n>1?' · '+it.v*it.n+' zusammen':''}</div>${c&&c!=='equipped'?'<div class="act">'+c+'</div>':''}`};
const _buildShopL=buildShop;buildShop=function(){_buildShopL();const el=$('pShop');
  if(!jewelOK())el.querySelectorAll('[data-gamble="ring"],[data-gamble="amulet"]').forEach(b=>{b.disabled=true;b.title='Erst nach dem zweiten Hüter'});
  const j=P.inv.filter(it=>it.slot==='junk'),n=j.reduce((a,it)=>a+it.n,0),v=j.reduce((a,it)=>a+sellP(it),0);
  if(n)el.insertAdjacentHTML('beforeend',`<div class="shoprow"><span class="c-junk">Allen Ramsch verkaufen (${n} Stück)</span><span class="c">${v}</span><button data-selljunk>Verkaufen</button></div>`)};
document.addEventListener('click',e=>{if(!P||!(e.target.closest&&e.target.closest('[data-selljunk]')))return;let v=0,n=0;
  for(const it of P.inv.filter(it=>it.slot==='junk')){v+=sellP(it);n+=it.n;invDel(it)}if(!n)return;P.glut+=v;qInc('sell');sfx('gold');log(`${n} Stück Ramsch für ${v} Glut verkauft.`,'#ff9a3a');hideTip();updatePanels()});
// runes: Odalinde keeps her pouch shut until three guardians have fallen
const _shopRuneL=shopRuneHTML;shopRuneHTML=function(){const h=_shopRuneL();return runeOK()?h:h.replace(/<div class="shoprow"><span class="c-rune">[\s\S]*?<\/div>/,'<p class="hint">„Runen? Erst wenn drei Hüter gefallen sind, Wanderer.“</p>')};
const _makeRuneL=makeRune;makeRune=function(k){return runeOK()?_makeRuneL(k):makeJunk('stein',mlNow())};

