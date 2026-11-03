/* ---------- item expansion: material tiers, gem jewellery, generated uniques ---------- */
const MATS=[{p:'Obsidian',l:6,m:1.3,mat:'dark'},{p:'Blutstahl',l:12,m:1.6,mat:'blood'},{p:'Mondsilber',l:18,m:1.9,mat:'moon'},{p:'Sternenstahl',l:24,m:2.25,mat:'sky'},{p:'Leerenstahl',l:30,m:2.65,mat:'void'},{p:'Drachenglas',l:36,m:3.1,mat:'ember'}];
const UTHEME=[{w:'Glut',m:{fire:[8,45],ed:[60,220]},sk:['ember','gold',0,'ember']},{w:'Frost',m:{cold:[6,40],res:[8,30]},sk:['sky','moon',0,'frost']},{w:'Sturm',m:{light:[8,50],ias:[10,30]},sk:['sky','gold',0,'sapphire']},
 {w:'Blut',m:{ls:[3,9],life:[20,90]},sk:['blood','dark',0,'ruby']},{w:'Nacht',m:{crit:[4,15],dex:[8,32]},sk:['void','dark',0,'amethyst']},{w:'Seelen',m:{spell:[30,130],mana:[20,90]},sk:['moon','void',0,'soul']},
 {w:'Grab',m:{vit:[8,32],regen:[2,9]},sk:['bone','dark',0,'emerald']},{w:'Gift',m:{poison:[8,55],crit:[3,10]},sk:['venom','dark',0,'emerald']},{w:'Eisen',m:{edef:[60,220],str:[8,32]},sk:['iron','steel']},
 {w:'Sonnen',m:{allsk:[1,2],res:[10,32]},sk:['gold','gold',0,'topaz']},{w:'Dorn',m:{thorns:[5,45],edef:[40,160]},sk:['moss','bronze',0,'emerald']},{w:'Raben',m:{mf:[20,70],glutf:[20,90]},sk:['dark','iron',0,'sapphire']},
 {w:'Mond',m:{mregen:[2,8],ene:[8,30]},sk:['moon','moon',0,'frost']},{w:'Wolfs',m:{frw:[8,25],ias:[8,25]},sk:['stone','leather']},{w:'Asche',m:{fire:[5,30],xp:[5,15]},sk:['dark','ember',0,'ember']},{w:'Stein',m:{dmgred:[3,15],vit:[6,25]},sk:['stone','stone']}];
const UNOUN={weapon:['klinge','zahn','biss','sang','schwur','zorn','ruf','hunger','fluch','wache','spalter','dorn'],offhand:['wall','schild','wehr','tor','trutz'],helm:['krone','haube','blick','stirn','schädel'],armor:['mantel','haut','panzer','hülle','wehr','brust'],
 gloves:['griff','faust','klaue','hand','zange'],boots:['schritt','pfad','tritt','gang','sohle'],belt:['band','gurt','schnur','gürtel'],ring:['kreis','auge','reif','siegel','schwur'],amulet:['träne','herz','stern','siegel','auge']};
const UEPI=['des Ersten Königs','des Verlorenen','des Schwarzen Turms','des Ewigen Winters','des Roten Mondes','des Stummen Wächters','des Letzten Lichts','des Hügeltyrannen','des Aschenmeers','des Bleichen Ritters','der Weberin','des Wanderers','der Tiefe','der Krähen'];
const UXTRA={ed:[40,200],ias:[8,30],crit:[3,12],str:[5,30],dex:[5,30],ls:[2,8],frw:[8,30],vit:[5,30],res:[5,30],life:[15,90],edef:[40,180],mf:[10,40]};
function expandItems(){
  for(const b of Object.values(BASE)){if(b.shape||b.slot==='ring'||b.slot==='amulet')continue;
    for(const M of MATS){const n=M.p+'-'+b.n,nb=Object.assign({},b,{n,shape:b.n,tier:M.p,lvl:b.lvl+M.l,str:Math.round(b.str*(1+M.l/80)),dex:Math.round(b.dex*(1+M.l/80))});
      if(b.dmg)nb.dmg=b.dmg.map(v=>Math.max(1,Math.round(v*M.m)));if(b.def)nb.def=Math.round(b.def*M.m);if(b.block)nb.block=Math.min(40,b.block+Math.round(M.l/6));BASE[n]=nb;
      const s2=PXS[b.n];if(s2)PXS[n]=[s2[0],M.mat,s2[2],s2[3],s2[4]]}}
  [['Rubin','ruby'],['Saphir','sapphire'],['Smaragd','emerald'],['Amethyst','amethyst'],['Topas','topaz'],['Seelen','soul']].forEach(([g,gem],k)=>{
    for(const[sl,base,mat]of[['ring','Ring','gold'],['amulet','Amulett','moon']]){const n=g+(sl==='ring'?'ring':'amulett');BASE[n]=Object.assign({},BASE[base],{n,shape:base,lvl:1+k*6});PXS[n]=[PXS[base][0],k%2?'moon':mat,k%2?'moon':mat,'gold',gem]}});
  const rg=mulberry(9091),rp=a=>a[Math.floor(rg()*a.length)],ri=(a,b)=>a+Math.floor(rg()*(b-a+1)),used=new Set(UNIQ.map(u=>u.n)),all=Object.values(BASE);
  for(let k=0;k<240;k++){const lvl=ri(3,72),cands=all.filter(b=>b.lvl<=lvl&&b.lvl>=lvl-16);if(!cands.length)continue;const b=rp(cands),th=rp(UTHEME);let name='';
    for(let t=0;t<25;t++){name=th.w+rp(UNOUN[b.slot])+(rg()<.45?' '+rp(UEPI):'');if(!used.has(name))break}if(used.has(name))continue;used.add(name);
    const f=Math.min(1.15,lvl/45),sc=([lo,hi])=>Math.max(1,Math.round(lo+(hi-lo)*Math.min(1,f*(.75+rg()*.5)))),m={};
    for(const[key,rng]of Object.entries(th.m)){if(key==='ed'&&b.slot!=='weapon')continue;if(key==='edef'&&b.slot==='weapon')continue;m[key]=sc(rng)}
    const ex=rp(b.slot==='weapon'?['ed','ias','crit','str','dex','ls']:b.slot==='boots'?['frw','dex','vit','res']:b.slot==='gloves'?['ias','str','dex','crit']:b.slot==='ring'||b.slot==='amulet'?['life','res','mf','str','dex']:['life','res','vit','edef','str']);
    if(!m[ex])m[ex]=sc(UXTRA[ex]);if(rg()<.4){const ex2=rp(['life','res','str','dex','vit','mf']);if(!m[ex2])m[ex2]=sc(UXTRA[ex2])}
    UNIQ.push({n:name,b:b.n,lvl,m});PXU[name]=th.sk}}
