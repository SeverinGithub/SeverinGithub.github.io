/* ---------- fire dragons: young ones from the deep islands and the lower tower on, bigger the higher their rank · Vyrthrax at the edge of the world ---------- */
MON.dragon={n:'Feuerdrache',hp:120,dmg:[9,15],spd:2.4,r:.55,range:1.5,wind:.55,cd:1.7,xp:70,kind:'melee',scale:1.4};
const DRC={jungdrache:{b:'red',w:'blood',u:'sand'},feuerdrache:{b:'ember',w:'red',u:'royal'},glutdrache:{b:'lava',w:'ember',u:'gold'},aschedrache:{b:'black',w:'char',u:'ember'},vyr:{b:'blood',w:'black',u:'gold'}};
for(const[id,n,hp,dmg,spd,sc,minF,w]of[['jungdrache','Jungdrache',1,1,1.05,.85,16,.9],['feuerdrache','Feuerdrache',1.3,1.2,1,1,19,.8],['glutdrache','Glutdrache',1.7,1.45,.95,1.15,23,.7],['aschedrache','Aschedrache',2.2,1.7,.95,1.3,27,.6]])
  VAR[id]={id,base:'dragon',n,pal:{},hp,dmg,spd,scale:sc,elem:'fire',proj:null,minF,w};
WB.push({id:'wb8',n:'Vyrthrax, der Feuerdrache',short:'Vyrthrax',look:'dragon',moves:['meteor','sweep','charge','nova'],dist:29,pal:{},scale:3.1,min:['feuerdrache','glutdrache']});
QUESTS.push(QW(4,8,'Der Feuerdrache','Ganz draußen, noch hinter der Aschemutter, kreist Vyrthrax über seinem Hort. Besiege den Feuerdrachen.'));
QUESTS.forEach((q,i)=>{q.i=i;q.glut=Math.round(40+i*38);q.tp=i===QUESTS.length-1||QUESTS[i+1].a!==q.a?1:0});
const _makeEnemyDZ=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyDZ(vid,x,y,rank);if(e.type==='dragon'){e.look='dragon';e.dsc=DRC[e.vid]||DRC.feuerdrache;
  const k=e.rank==='unique'?1.4:e.rank==='champ'?1.2:1;e.scale*=k;e.r*=Math.sqrt(k)}return e};
const _makeWBossDZ=makeWBoss;makeWBoss=function(i,x,y){const e=_makeWBossDZ(i,x,y);if(e.look==='dragon'){e.dsc=DRC.vyr;e.hp*=1.25;e.max=e.hp;e.r=1.1}return e};
// fire breath: a cone that burns where it lands
function dragonFire(e,a){const R=3.8+e.scale*.6;sample('fire',.7,{rate:.7});for(let k=0;k<46;k++){const q=a+rnd(-.5,.5),d=rnd(.4,R);fxp({k:'ember',x:e.x+Math.cos(q)*d,y:e.y+Math.sin(q)*d,z:rnd(.1,.8),vx:Math.cos(q)*rnd(.5,2),vy:Math.sin(q)*rnd(.5,2),vz:rnd(.5,2),life:rnd(.5,1.2),col:pick(['#fff0a0','#ffc070','#ff7a1a','#ff4a10']),s:rnd(1.4,2.6),g:-.6})}
  for(let k=1;k<=3;k++){const d=R*k/3.4;smoke(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,3,'rgba(40,26,20,',8,.6);addLight(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,200,.9,.4)}decal('scorch',e.x+Math.cos(a)*R*.55,e.y+Math.sin(a)*R*.55,1.3,30)}
const _updEnemyD=updEnemy;updEnemy=function(e,dt){_updEnemyD(e,dt);if(e.look!=='dragon'||e.dead)return;e.breathT=Math.max(0,(e.breathT||0)-dt);e.brCd=(e.brCd??rnd(2,4))-dt;
  const d=hyp(P.x-e.x,P.y-e.y);if(e.aggro&&e.brCd<=0&&d<4+e.scale*.5&&d>.8&&!G.tele.some(t=>t.owner===e&&!t.done)&&eLos(e,0)){e.brCd=rnd(4,6.5)/(e.boss?1.5:1);const a=Math.atan2(P.y-e.y,P.x-e.x);e.face=a;e.breathT=.8;
    G.tele.push({shape:'cone',x:e.x,y:e.y,ang:a,arc:1.05,r:3.8+e.scale*.6,t:0,dur:.8,dmg:e.dmg[1]*1.3,owner:e,follow:true,elem:'fire',onDone:()=>dragonFire(e,a)})}};
// painted live: body, neck, horned head, two beating wings, a swaying tail; the mouth glows before the breath
function drawDragon(e){const[sx,sy]=iso(e.x,e.y),s=e.scale;if(sx<-60*s||sx>W+60*s||sy<-90*s||sy>H+40*s)return;const S=e.dsc||DRC.feuerdrache,fl=e.flash>0&&!e.dead,
    B=fl?RP.flash:RMP[S.b],Wm=fl?RP.flash:RMP[S.w],U=fl?RP.flash:RMP[S.u],[fx]=scrDir(e.face),f=fx>=0?1:-1,t=G.t+(e.anim||0),mv=e.aggro?1:.4,fl2=Math.sin(t*(e.aggro?7:3))*(6+mv*4);
  if(!e.dead)shadow(sx,sy,.42*s);ctx.save();ctx.translate(sx,sy);
  if(e.dead){const p=Math.min(1,e.dieT/.6);ctx.globalAlpha=e.dieT>18?Math.max(0,1-(e.dieT-18)/6):1;ctx.translate(0,-2);ctx.rotate(f*p*.5);ctx.scale(1,1-p*.35)}
  else{const h=e.hitT||0;if(h>0){ctx.translate(-f*h*20,0)}if(e.lungeT>0)ctx.translate(f*Math.sin(e.lungeT/.22*Math.PI)*7,0)}
  ctx.scale(s*.62*f,s*.62);const bob=e.dead?0:Math.sin(t*3)*1.2,wing=(far)=>{const k=far?.75:1,o=far?-3:3,y0=-22+bob;
    poly([[o,y0],[o-4,y0-22-fl2*k],[o-16,y0-34-fl2*k*1.2],[o-24,y0-20-fl2*.6*k],[o-30,y0-8-fl2*.3],[o-12,y0+2]],Wm);
    limb(o,y0,o-16,y0-34-fl2*k*1.2,2.2,1,B);limb(o-16,y0-34-fl2*k*1.2,o-30,y0-8-fl2*.3,1.4,.6,B);limb(o-6,y0-12-fl2*.6*k,o-24,y0-20-fl2*.6*k,1,.5,B)};
  wing(true);
  const sw=Math.sin(t*2.3)*4;limb(-10,-14+bob,-24,-9+sw*.4,6,3.5,B);limb(-24,-9+sw*.4,-36,-13+sw,3.5,1.2,B);poly([[-36,-13+sw],[-42,-17+sw],[-40,-10+sw]],U);
  const st=e.dead?0:Math.sin(t*(e.aggro?9:4))*2*mv;limb(-7,-11+bob,-8-st,0,4,3,B);limb(8,-11+bob,9+st,0,4,3,B);
  blob(0,-15+bob,14,8.5,B);blob(2,-11.5+bob,10,4.6,U);for(let i=0;i<5;i++){const x=-8+i*4;poly([[x-1.6,-21.5+bob],[x,-26+bob-(i===2?1:0)],[x+1.6,-21.5+bob]],U)}
  limb(-5,-11+bob,-6+st,0,4.4,3.2,B);limb(10,-11+bob,11-st,0,4.4,3.2,B);
  const nx=17,ny=-30+bob-(e.breathT>0?2:0);limb(9,-18+bob,nx-1,ny+2,5.5,3.8,B);
  blob(nx+2,ny,6.4,4.6,B);poly([[nx+5,ny-2.4],[nx+14,ny-.6],[nx+13,ny+2.8],[nx+5,ny+3]],B);poly([[nx+6,ny+1.6],[nx+13,ny+2.4],[nx+12,ny+4.4+(e.breathT>0?2:0)],[nx+6,ny+3.6]],U);
  limb(nx,ny-3,nx-6,ny-10,1.8,.4,U);limb(nx+3,ny-3.4,nx-1,ny-11,1.6,.3,U);
  ctx.fillStyle=e.dead?'#2a1a10':'#ffe060';ctx.fillRect(nx+4.5,ny-2.2,2,1.4);
  if(e.breathT>0&&!e.dead){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(nx+14,ny+2,0,nx+14,ny+2,9);g.addColorStop(0,`rgba(255,200,90,${(.9*e.breathT/.8+.2).toFixed(2)})`);g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.fillRect(nx+4,ny-8,20,20);ctx.globalCompositeOperation='source-over'}
  wing(false);ctx.restore()}
const _drawEnemyD=drawEnemy;drawEnemy=function(e){if(e.look==='dragon')return drawDragon(e);return _drawEnemyD(e)};
