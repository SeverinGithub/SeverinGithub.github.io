/* ---------- items ---------- */
function rollRarity(ilvl,mf,boost){const f=1+mf/100;const u=(0.012+boost*0.04)*f,r=u+(0.07+boost*0.2)*f,m=r+0.3+boost*0.3;const x=R();return x<u?'unique':x<r?'rare':x<m?'magic':'normal'}
function makeItem(ilvl,o={}){
  ilvl=Math.max(1,ilvl);let rar=o.rarity||rollRarity(ilvl,o.mf||0,o.boost||0);let slot=o.slot,uq=null,b;
  if(rar==='unique'){const c=UNIQ.filter(u=>u.lvl<=ilvl+3&&(!slot||BASE[u.b].slot===slot)&&(slot||jewelOK()||!/^(ring|amulet)$/.test(BASE[u.b].slot)));if(c.length)uq=pick(c);else rar='rare'}
  if(uq)b=BASE[uq.b];else{slot=slot||wpick(jewelOK()?SLOTW:SLOTW.filter(s=>s[0]!=='ring'&&s[0]!=='amulet'));const cap=ilvl*.75+1,c=Object.values(BASE).filter(x=>x.slot===slot&&x.lvl<=cap).sort((a,b)=>a.lvl-b.lvl),win=c.filter(x=>x.lvl>=cap-20),pool=win.length>=3?win:c;b=pool[Math.floor(Math.pow(R(),2.2)*pool.length)]||c[0]}
  const it={id:UID++,b:b.n,slot:b.slot,cls:b.cls,rar,ilvl,mods:{},req:{lvl:b.lvl,str:b.str,dex:b.dex}};
  if(b.dmg){it.dmg=b.dmg.slice();it.speed=b.speed;it.twoH=b.twoH}
  if(b.def)it.def=Math.round(b.def*rnd(.9,1.15));
  if(b.block)it.block=b.block;
  if(b.cls==='staff')it.mods.spell=10+b.lvl*2;
  if(uq){it.name=uq.n;for(const k in uq.m)it.mods[k]=(it.mods[k]||0)+uq.m[k];it.req.lvl=Math.max(b.lvl,uq.lvl)}
  else if(rar==='magic'||rar==='rare'){
    const code=SLOTCODE[it.slot],maxT=ilvl<6?0:ilvl<14?1:ilvl<24?2:3,n=rar==='magic'?rint(1,2):rint(3,5),maxP=rar==='magic'?1:3;
    const pool=AFF.filter(a=>a.s.includes(code)&&(a.minT||0)<=maxT),used=new Set();let pre=0,suf=0,cnt=0,pN='',sN='',g=0;
    while(cnt<n&&g++<60){const a=pick(pool);if(used.has(a.k)||(a.p&&pre>=maxP)||(!a.p&&suf>=maxP))continue;
      const t=Math.max(a.minT||0,rint(Math.max(0,maxT-1),maxT)),[lo,hi]=a.r(t),v=rint(lo,hi);
      it.mods[a.k]=(it.mods[a.k]||0)+v;used.add(a.k);if(a.p){pre++;pN=a.n[t]}else{suf++;sN=a.n[t]}cnt++}
    it.name=rar==='magic'?(pN?pN+' ':'')+b.n+(sN?' '+sN:''):pick(RARE1)+pick(RARE2[it.slot]);
    it.req.lvl=Math.max(b.lvl,Math.floor(ilvl*.7));
  }else it.name=b.n;
  return it}
function makePotion(kind,f){return{id:UID++,slot:'potion',cls:kind==='life'?'potL':'potM',kind,rar:'normal',name:kind==='life'?'Heiltrank':'Manatrank',amt:40+Math.max(0,f)*14,mods:{},req:{lvl:1,str:0,dex:0}}}
const potCount=k=>P.inv.reduce((a,it)=>a+(it&&it.slot==='potion'&&it.kind===k?it.n||1:0),0);
const sellP=it=>Math.round(itemValue(it)*(1+((P.d&&P.d.sellB)||0)/100)),buyP=it=>Math.round(itemValue(it)*4*(1-((P.d&&P.d.shopDisc)||0)/100));
function itemValue(it){if(it.slot==='potion')return 4*(it.n||1);if(it.slot==='rune')return 15+RBY[it.rune].l*10*(1+RBY[it.rune].i*.25)|0;return Math.round((it.ilvl*3+6)*({normal:1,magic:3,rare:7,unique:15,runeword:20}[it.rar]||1)*(1+(it.runes||[]).length*.15))}
function itemDmg(it){const e=1+(it.mods.ed||0)/100;return[Math.round(it.dmg[0]*e),Math.round(it.dmg[1]*e)]}
function itemDef(it){return Math.round((it.def||0)*(1+(it.mods.edef||0)/100))}
function meetsReq(it){return P.lvl>=it.req.lvl&&P.d.s.str>=it.req.str&&P.d.s.dex>=it.req.dex}

