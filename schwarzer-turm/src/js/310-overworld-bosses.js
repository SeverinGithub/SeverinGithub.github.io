/* ---------- overworld bosses: eight lords, each ruling one island further out ---------- */
const WB=[
 {id:'wb0',n:'Rußklaue, Plünderer der Dörfer',short:'Rußklaue',look:'knight',moves:['slam','sweep','charge'],dist:4.5,pal:{dark:'ember'},scale:2.1,min:['skel','ghoul']},
 {id:'wb1',n:'Die Nebelweberin',short:'der Nebelweberin',look:'weaver',moves:['nova','summon','sweep'],dist:6.5,pal:{dark:'ghostV'},scale:2.1,min:['wraith','spider']},
 {id:'wb2',n:'Moosfaust, der Grabwächter',short:'Moosfaust',look:'warden',moves:['slam','charge','nova'],dist:8.5,pal:{stone:'moss',dark:'bog'},scale:2.3,min:['ghoul','golem']},
 {id:'wb3',n:'Kaltherz von der Frostfurt',short:'Kaltherz',look:'knight',moves:['slam','sweep','charge','nova'],dist:11,pal:{dark:'iceS',stone:'ice'},scale:2.3,min:['wraith','archer']},
 {id:'wb4',n:'Die Brutkönigin',short:'der Brutkönigin',look:'weaver',moves:['summon','nova','meteor'],dist:14,pal:{dark:'venom'},scale:2.4,min:['spider','scorp']},
 {id:'wb5',n:'Glutkoloss Vharn',short:'Vharn',look:'warden',moves:['slam','meteor','charge','nova','sweep'],dist:17,pal:{stone:'lava',dark:'ember'},scale:2.6,min:['golem','cult']},
 {id:'wb6',n:'Der Schattenkönig',short:'dem Schattenkönig',look:'knight',moves:['slam','sweep','charge','meteor','nova'],dist:21,pal:{dark:'shadow',stone:'black',robe:'robeV'},scale:2.5,min:['wraith','cult']},
 {id:'wb7',n:'Aschemutter, die Letzte',short:'der Aschemutter',look:'weaver',moves:['nova','summon','meteor','sweep'],dist:26,pal:{dark:'royal',robe:'robeD'},scale:2.7,min:['cult','skel','golem']}];
let WBC=null,WBS=null;
function wbChunks(){if(WBC&&WBS===G.seed)return WBC;WBS=G.seed;WBC=new Map();
  WB.forEach((b,i)=>{const a=hsh(i,77,3)*6.283+i*2.4;let cx=clamp(Math.round(40+Math.cos(a)*b.dist),4,WS/CH-5),cy=clamp(Math.round(39.5+Math.sin(a)*b.dist),4,WS/CH-5);
    while(WBC.has(cx+','+cy)||isHomeC(cx,cy))cx++;WBC.set(cx+','+cy,i);b.cx=cx;b.cy=cy});return WBC}
const wbPos=b=>(wbChunks(),{x:b.cx*CH+16.5,y:b.cy*CH+16.5});
function makeWBoss(i,x,y){const b=WB[i],ml=G.mlvl,hs=1+(ml-1)*.32,ds=1+(ml-1)*.2;
  const e={type:'boss',d:{kind:'boss',range:2,look:b.look,moves:b.moves},look:b.look,x,y,r:.8,rank:'boss',name:b.n,sub:'Herr der Himmelsinseln · Stufe '+ml,hp:620*hs,dmg:[13*ds,21*ds],spd:2.3,cd:1.5,aggro:false,face:2.3,anim:0,flash:0,slow:0,
    xp:480*(1+(ml-1)*.35),aff:[],charge:0,scale:b.scale,dmgTaken:1,boss:true,wb:b.id,pal:new Map(Object.entries(b.pal).map(([k,r])=>[RP[k],RMP[r]]))};e.max=e.hp;return e}

