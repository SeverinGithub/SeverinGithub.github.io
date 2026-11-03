/* ---------- player stats ---------- */
function recalc(){
  const m={},raw=P.stats;
  const eq=Object.values(P.eq).filter(Boolean);
  const sum=list=>{for(const k in m)delete m[k];for(const it of list)for(const k in it.mods)m[k]=(m[k]||0)+it.mods[k];for(const id of[...(P.tree||[]),clsStart()]){const n=TREE[id];if(n)for(const k in n.m)m[k]=(m[k]||0)+n.m[k]}};
  sum(eq);let s={str:raw.str+(m.str||0),dex:raw.dex+(m.dex||0),vit:raw.vit+(m.vit||0),ene:raw.ene+(m.ene||0)};
  const ok=eq.filter(it=>P.lvl>=it.req.lvl&&s.str>=it.req.str&&s.dex>=it.req.dex);
  if(ok.length!==eq.length){sum(ok);s={str:raw.str+(m.str||0),dex:raw.dex+(m.dex||0),vit:raw.vit+(m.vit||0),ene:raw.ene+(m.ene||0)}}
  const okS=new Set(ok),w=P.eq.weapon&&okS.has(P.eq.weapon)?P.eq.weapon:null,sh=P.eq.offhand&&okS.has(P.eq.offhand)?P.eq.offhand:null;
  const base=w?w.dmg:[1,3],mult=1+(m.ed||0)/100+s.str*.008+s.dex*.004,ele=(m.fire||0)+(m.cold||0)+(m.light||0)+(m.poison||0);
  let def=s.dex*.25;for(const it of ok)def+=itemDef(it);def*=Math.max(.1,1+(m.tdef||0)/100);
  const d={s,m,okS,
    life:Math.round((40+s.vit*4+P.lvl*5+(m.life||0))*(1+(m.lifeP||0)/100)),mana:Math.round((15+s.ene*2+P.lvl*1.5+(m.mana||0))*(1+(m.manaP||0)/100)),stam:Math.round(70+s.dex*.6+s.vit*.4+(m.stam||0)),
    dmin:Math.max(1,Math.round(base[0]*mult)),dmax:Math.max(2,Math.round(base[1]*mult)),ele,fire:m.fire||0,cold:m.cold||0,light:m.light||0,
    aspd:(w?w.speed:1.5)*(1+(m.ias||0)/100),crit:Math.min(60,5+s.dex*.05+(m.crit||0)),def:Math.round(def),block:sh?Math.min(75,sh.block+s.dex*.05+(m.block||0)):0,thorns:m.thorns||0,xp:m.xp||0,glutf:m.glutf||0,mregen:m.mregen||0,dmgred:m.dmgred||0,
    res:Math.min(75,m.res||0),ls:Math.min(25,m.ls||0),frw:Math.min(60,m.frw||0),mf:m.mf||0,allsk:m.allsk||0,regen:m.regen||0,
    spellMul:1+s.ene*.02+(m.spell||0)/100,cdr:Math.min(40,m.cdr||0),mcost:Math.min(40,m.mcost||0),potPow:m.potPow||0,flask:m.flask||0,flaskH:m.flaskH||0,potStack:1+Math.min(4,m.potStack||0),invRows:Math.min(3,m.invRows||0),shopDisc:Math.min(30,m.shopDisc||0),sellB:m.sellB||0,lok:m.lok||0,mok:m.mok||0,reach:w&&w.cls==='spear'?1.5:w&&w.cls==='great'?1.25:1.05,wcls:w?w.cls:'fist'};
  P.d=d;IH=5+d.invRows;P.hp=Math.min(P.hp,d.life);P.mp=Math.min(P.mp,d.mana);P.st=Math.min(P.st,d.stam);
}
const skLvl=id=>P.sk[id]>0?P.sk[id]+P.d.allsk+(P.d.m['sk_'+id]||0):0;
const fMax=()=>P.flaskMax+((P.d&&P.d.flask)||0);
function spellBase(id,l){const sm=P&&P.d?P.d.spellMul:1;if(id==='trap')return(10+l*7)*(1+((P&&P.d)?P.d.s.dex:0)*.015);return{fire:(6+l*5),nova:(5+l*4),chain:(5+l*5),ward:(25+l*18),meteor:(16+l*11),blink:(5+l*3)}[id]*sm}

