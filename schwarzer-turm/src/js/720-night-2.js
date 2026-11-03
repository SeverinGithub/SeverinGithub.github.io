/* ---------- the night, second pass: werewolves and night ghosts hunt the islands after dark, and pay for it ---------- */
MON.wolf={n:'Werwolf',hp:95,dmg:[9,15],spd:3.5,r:.42,range:1.3,wind:.32,cd:1.05,xp:60,kind:'melee',scale:1.15};
VAR.werwolf={id:'werwolf',base:'wolf',n:'Werwolf',pal:{},hp:1,dmg:1,spd:1,scale:1,elem:null,proj:null,minF:999,w:0};
VAR.grauwolf={id:'grauwolf',base:'wolf',n:'Grauer Werwolf',pal:{},hp:1.4,dmg:1.25,spd:1.05,scale:1.12,elem:null,proj:null,minF:999,w:0};
VAR.nachtgeist={id:'nachtgeist',base:'wraith',n:'Nachtgeist',pal:{dark:'ghostV'},hp:1.2,dmg:1.15,spd:1.1,scale:1.05,elem:'frost',proj:null,minF:999,w:0};
const WOLFC={werwolf:['char','wood'],grauwolf:['ash','char']};
const NT={t:20,warned:0};
const _makeEnemyNW=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyNW(vid,x,y,rank);if(e.type==='wolf'){e.look='wolf';e.fur=WOLFC[e.vid]||WOLFC.werwolf}return e};
function nightTick(dt){const m=G.map;if(!m||!m.world||!P||P.dead||G.state!=='play')return;const n=nightA();
  if(n<.3){for(const e of m.enemies)if(e.night&&!e.dead){e.dead=true;e.dieT=99;smoke(e.x,e.y,6,'rgba(120,130,160,',6,.5)}NT.warned=0;return}
  if(n<.85)return;const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),I=islandOf(cx,cy);if(!I||I.kind==='home'||I.kind==='boss')return;
  if(!NT.warned){NT.warned=1;log('In der Nacht jagen Werwölfe und Nachtgeister auf den Inseln. Sie bringen bessere Beute.','#9ab0ff')}
  if((NT.t-=dt)>0)return;NT.t=rnd(22,38);if(m.enemies.filter(e=>e.night&&!e.dead&&hyp(e.x-P.x,e.y-P.y)<30).length>=6)return;
  const deep=lvlAt(P.x,P.y)>=10,k=rint(2,3);let any=0;
  for(let i=0;i<k;i++){const s=evSpot(9,13);if(!s)continue;const id=Math.random()<.55?(deep&&Math.random()<.5?'grauwolf':'werwolf'):'nachtgeist',e=makeEnemy(id,s[0],s[1],Math.random()<.18?'champ':'normal');
    e.night=true;e.ev=true;e.aggro=true;G.map.enemies.push(e);smoke(s[0],s[1],4,'rgba(60,70,100,',6,.4);any++}
  if(any&&Math.random()<.5)sample('bossscr2',.35,{rate:rnd(1.25,1.4)})}
const _killEnemyNW=killEnemy;killEnemy=function(e,a){const was=e&&!e.dead&&e.night;_killEnemyNW(e,a);if(!was||!e.dead)return;
  if(Math.random()<(e.rank==='champ'?.9:.45)){const it=makeItem(G.mlvl+2,{mf:(P.d.mf||0)+120,boost:.35});dropItem(it,e.x,e.y)}const gl=Math.round(8*G.mlvl);P.glut+=gl;ftext(e.x,e.y-.3,'+'+gl+' Glut','#9ab0ff')};
// painted live: a hunched wolf-man on bent hind legs, claws forward, eyes burning
function drawWolf(e){const[sx,sy]=iso(e.x,e.y),s=e.scale||1;if(sx<-60||sx>W+60||sy<-90||sy>H+40)return;const fl=e.flash>0&&!e.dead,[c0,c1]=e.fur||WOLFC.werwolf,
    F=fl?RP.flash:(RMP[c0]||RP[c0]),D=fl?RP.flash:(RMP[c1]||RP[c1]),[fx]=scrDir(e.face),f=fx>=0?1:-1,t=G.t+(e.anim||0),mv=e.aggro?1:.35,sp=e.aggro?11:5,st=e.dead?0:Math.sin(t*sp)*3*mv,bob=e.dead?0:Math.abs(Math.sin(t*sp))*1.4*mv,
    atk=e.lungeT>0?Math.sin(e.lungeT/.22*Math.PI):0;
  if(!e.dead)shadow(sx,sy,.34*s);ctx.save();ctx.translate(sx,sy);
  if(e.dead){const p=Math.min(1,e.dieT/.5);ctx.globalAlpha=e.dieT>18?Math.max(0,1-(e.dieT-18)/6):1;ctx.rotate(f*p*1.3);ctx.translate(0,-p*4)}else{const h=e.hitT||0;if(h>0)ctx.translate(-f*h*16,0)}
  ctx.scale(s*.62*f,s*.62);
  limb(-4,-19+bob,-8-st,-10,4.2,3,D);limb(-8-st,-10,-5-st,0,3,2,D);limb(1,-33+bob,-5+st*.7,-23+bob,3,2.2,D);
  poly([[-9,-22+bob],[-16,-18+bob],[-12,-14+bob]],D);
  blob(0,-25+bob,9,9.5,F);blob(4,-32+bob,8.5,6.5,F);for(let i=0;i<4;i++)poly([[-4+i*3.5,-37+bob],[-2+i*3.5,-43+bob-(i===1?2:0)],[0+i*3.5,-37+bob]],D);
  limb(3,-19+bob,6+st,-10,4.6,3.2,F);limb(6+st,-10,3+st,0,3.2,2,F);
  const hx=10+atk*3,hy=-38+bob;blob(hx,hy,5.2,4.6,F);poly([[hx+3,hy-2],[hx+10,hy],[hx+9,hy+3],[hx+3,hy+3]],F);poly([[hx+3,hy+2],[hx+9,hy+3],[hx+8,hy+5+atk*2],[hx+3,hy+4]],D);
  poly([[hx-3,hy-3],[hx-2,hy-10],[hx+1,hy-4]],D);poly([[hx,hy-4],[hx+2,hy-9],[hx+3,hy-3]],D);
  ctx.fillStyle=e.dead?'#3a2a20':'#ffd040';ctx.fillRect(hx+1.5,hy-2,2,1.3);
  const ax=13+atk*9,ay=-27+bob-atk*4;limb(5,-31+bob,ax,ay,3.6,2.4,F);ctx.strokeStyle=fl?'#fff':'#e8e0d0';ctx.lineWidth=.8;ctx.beginPath();for(let k=-1;k<=1;k++){ctx.moveTo(ax,ay+k);ctx.lineTo(ax+4,ay+k*1.8+1)}ctx.stroke();
  ctx.restore()}
const _drawEnemyNW=drawEnemy;drawEnemy=function(e){if(e.look==='wolf')return drawWolf(e);if(e.night&&e.type==='wraith'&&!e.dead){const[sx,sy]=iso(e.x,e.y);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy-20,0,sx,sy-20,34);g.addColorStop(0,`rgba(120,170,255,${.22+Math.sin(G.t*4)*.06})`);g.addColorStop(1,'rgba(60,90,200,0)');ctx.fillStyle=g;ctx.fillRect(sx-36,sy-56,72,72);ctx.restore();ctx.save();ctx.globalAlpha=.78;try{return _drawEnemyNW(e)}finally{ctx.restore()}}return _drawEnemyNW(e)};

