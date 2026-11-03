/* ---------- the dead lands: a whole kingdom at the western rim, far beyond the last island lord ----------
   local frame: p runs from the city gate (0) up to the castle (476), q runs across (0 = the main road).
   The land always lies on the far side (screen-up), so the castle towers over you as you approach. */
const RG={P0:-8,P1:480,Q0:-92,Q1:92};
function rgInit(){if(RG.seed===G.seed)return RG;RG.seed=G.seed;const a=hsh(91,17,5)<.5,side=hsh(92,18,6)<.5?-1:1;RG.ax=a?'x':'y';RG.c=1280+side*1000;RG.plan=null;RG.bk=null;
  const[gx,gy]=rgW(-60,0);RG.gcx=Math.floor(gx/CH);RG.gcy=Math.floor(gy/CH);const d=RG.ax==='x'?[1,0]:[0,1];RG.chain=[1,2,3].map(k=>(RG.gcx+d[0]*k)+','+(RG.gcy+d[1]*k));return RG}
// local tile → world tile and back (a bijection on whole tiles)
function rgW(p,q){const a=550-p;return RG.ax==='x'?[a,RG.c+q]:[RG.c+q,a]}
function rgL(x,y){rgInit();const a=RG.ax==='x'?x:y,b=RG.ax==='x'?y:x;return[550-a,b-RG.c]}
function rgChunk(cx,cy){const R=rgInit();if(cx===R.gcx&&cy===R.gcy)return false;const[a,b]=rgL(cx*CH,cy*CH),[c,d]=rgL(cx*CH+CH-1,cy*CH+CH-1);
  return Math.max(a,c)>=R.P0&&Math.min(a,c)<R.P1&&Math.max(b,d)>=R.Q0&&Math.min(b,d)<R.Q1}
const RGZN={gate:'Das Totentor',city:'Die stille Stadt',road:'Der Pilgerweg',clo:'Vorhof des Riesenklosters',church:'Das Riesenkloster',wood:'Der dunkelrote Wald',castle:'Vor der Riesenburg'};
function rgZone(x,y){if(!G.map||!G.map.world)return null;const[p,q]=rgL(Math.floor(x),Math.floor(y));if(Math.abs(q)>95||p>480)return null;
  if(p<-4)return p>-80&&Math.abs(q)<30?'gate':null;if(p<136)return'city';if(p<150)return'road';if(p<243)return p>=184&&Math.abs(q)<=22?'church':'clo';if(p<436)return'wood';return'castle'}
const rgLvl=()=>lvlAt(...Object.values(wbPos(WB[7])))+4;

// the island at the dead gate, and three islands leading to it, always exist and always link
const _islandOfR=islandOf;islandOf=function(cx,cy){if(G.seed==null)return _islandOfR(cx,cy);const R=rgInit();
  if(cx===R.gcx&&cy===R.gcy)return{x:cx*CH+16.5,y:cy*CH+16.5,r:11,kind:'rgate',cx,cy,dist:Math.hypot(cx-40,cy-39.5)};
  if(rgChunk(cx,cy))return null;const I=_islandOfR(cx,cy);if(I||!R.chain.includes(cx+','+cy))return I;
  return{x:cx*CH+16.5,y:cy*CH+16.5,r:9,kind:'wild',cx,cy,dist:Math.hypot(cx-40,cy-39.5)}};
const _linkOnR=linkOn;linkOn=function(ax,ay,bx,by){const R=rgInit(),ch=[R.gcx+','+R.gcy,...R.chain];if(ch.includes(ax+','+ay)&&ch.includes(bx+','+by))return!!(islandOf(ax,ay)&&islandOf(bx,by));return _linkOnR(ax,ay,bx,by)};
KINDN.rgate='Totentor';

