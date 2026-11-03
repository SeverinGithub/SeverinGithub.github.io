/* ---------- fixes and speed: wake at the nearest fire ---------- */
// you wake at the lit fire nearest to where you fell: a beacon out on the islands, the fire on the hill, or the closest lit floor of the tower
const _respawnN=respawn;respawn=function(){const df=G.floor,dx=P.x,dy=P.y;
  if(df===0&&G.map&&G.map.world){const home=G.map.home&&G.map.home.objs.find(o=>o.type==='shrine');let best=home?{x:home.x,y:home.y,home:1}:null,bd=best?hyp(best.x-dx,best.y-dy):1e9;
    for(const f of Object.values(G.owFires||{})){const d=hyp(f.x-dx,f.y-dy);if(d<bd){bd=d;best=f}}
    G.respawnFloor=0;G.owRespawn=best&&!best.home?{x:best.x,y:best.y}:null}
  else if(typeof df==='number'&&df>0){const lit=Object.keys(G.lit).filter(k=>G.lit[k]).map(Number).filter(f=>f>=0);
    if(lit.length){G.respawnFloor=lit.sort((a,b)=>Math.abs(a-df)-Math.abs(b-df)||b-a)[0];if(G.respawnFloor===0)G.owRespawn=null}}
  _respawnN();
  if(G.floor>0){const s=G.map.objs.find(o=>o.type==='shrine');if(s){const[x,y]=nearWalk(s.x+1,s.y+1);P.x=x;P.y=y;camX=x;camY=y}}};
// crowds: once more than 30 foes stand near you, each ordinary creature is painted into its own small canvas about 15 times a second
// and stamped in between. Anything flashing, struck, lunging, winding up, enraged or blocking, and every boss, is still painted live each frame
const IMP={on:false,hz:15};
const _updateI=update;update=function(dt){_updateI(dt);const m=G.map;let n=0;if(m&&P)for(const e of m.enemies)if(!e.dead&&Math.abs(e.x-P.x)+Math.abs(e.y-P.y)<26)n++;IMP.on=IMP.on?n>20:n>30;IMP.hz=n>90?12:15};
const _drawEnemyI=drawEnemy;drawEnemy=function(e){
  if(e.dead||!IMP.on){if(e._imp)e._imp=null;return _drawEnemyI(e)}
  if(e.boss||e.rank==='boss'||e.flash>0||e.hitT>0||e.lungeT>0||e.charge>0||e.rageOn||e.blockT>0||(e.scale||1)>1.8||G.tele.some(t=>t.owner===e)){if(e._imp)e._imp.t=-1;return _drawEnemyI(e)}
  const[sx,sy]=iso(e.x,e.y);if(sx<-80||sx>W+80||sy<-140||sy>H+60)return;const s=e.scale||1;let I=e._imp;
  if(!I){const S=Math.ceil(96*s)+16,c=document.createElement('canvas');c.width=c.height=S;I=e._imp={c,g:c.getContext('2d'),S,t:-1,ph:Math.random()/IMP.hz}}
  const bx=Math.floor(sx),by=Math.floor(sy);
  if(I.t<0||G.t-I.t>=1/IMP.hz||G.t<I.t){I.t=G.t-(I.t<0?I.ph:0);const g=I.g,sv=ctx,sh=shadow;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,I.S,I.S);g.translate(I.S/2-bx,Math.round(I.S*.85)-by);
    ctx=g;shadow=()=>{};try{_drawEnemyI(e)}catch(err){}finally{ctx=sv;shadow=sh}}
  shadow(sx,sy,.38*s);ctx.drawImage(I.c,bx-I.S/2,by-Math.round(I.S*.85))};
