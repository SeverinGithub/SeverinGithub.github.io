/* ---------- state ---------- */
let G={state:'title',zones:[],ptraps:[],owSeen:new Set(),owBoss:{},owFires:{},owClear:new Set(),owRespawn:null,owAt:null,lights:[],hitstop:0,kx:0,ky:0,seed:1,floor:0,maps:{},map:null,mlvl:1,lit:{0:true},bossDead:{},glutmal:null,maxFloor:0,respawnFloor:0,
  tele:[],proj:[],fx:[],texts:[],rings:[],bolts:[],labels:[],shake:0,t:0,showMap:true,flowT:0,flow:null,deathT:0,bossSeen:{},muted:false};
let P=null,UID=1;
function newPlayer(){return{x:0,y:0,r:.28,face:.8,anim:0,hp:1,mp:1,st:1,lvl:1,xp:0,stats:{str:15,dex:15,vit:15,ene:10},pts:0,spts:1,
  sk:{whirl:1,fire:0,nova:0,charge:0,ward:0,chain:0},sel:'whirl',eq:{weapon:null,offhand:null,helm:null,armor:null,gloves:null,boots:null,belt:null,ring1:null,ring2:null,amulet:null},
  inv:[],stash:[],found:{},glut:0,flaskMax:3,flasks:3,flaskPow:0,tree:[],tbonus:0,qi:0,qc:{},qb:0}}
function resetTransient(){Object.assign(P,{leap:null,cryT:0,shadowT:0,crossT:0,crossN:0,veilT:0,venomT:0,path:[],target:null,interact:null,pickup:null,atkT:0,atkDur:0,hitDone:true,roll:0,iframe:0,cast:0,cds:{},ward:0,wardT:0,stDelay:0,dead:false,dash:null,poisonT:0,poisonD:0,flaskT:0,hurt:0,moveTo:null,standAtk:null,repath:0,heal:0})}
const xpNext=l=>Math.floor(80*Math.pow(l,1.75));

