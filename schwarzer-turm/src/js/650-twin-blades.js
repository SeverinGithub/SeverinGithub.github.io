/* ---------- twin blades: a pair for the off hand too, from the first dagger pair to the last night-wings · a dexterous weapon ---------- */
// [name, level, min, max, speed, str, dex, look]; the look is the single blade they are drawn with
const DUALS=[['Zwillingsdolche',1,2,5,1.7,0,14,'Dolch'],['Klingenpaar',4,3,8,1.6,4,24,'Kurzschwert'],['Sichelzwillinge',9,5,12,1.55,8,38,'Krummsäbel'],['Schattenzwillinge',15,7,17,1.6,12,56,'Schattendolch'],
  ['Mondklingen',22,10,24,1.6,16,76,'Mondsichel'],['Zwillingszähne',28,13,31,1.65,20,96,'Drachenzahn'],['Nachtschwingen',34,16,38,1.7,24,118,'Nachtzahn']];
// mage gear: robes, hats, gloves, shoes, cords and folios · light, but full of mana and spell power
const MAGE=[['helm','Filzhut',1,2],['helm','Spitzhut',7,6],['helm','Runenhut',14,10],['helm','Sternenhut',22,15],['helm','Aschehaube',30,20],
  ['armor','Leinenrobe',1,5],['armor','Novizenrobe',6,11],['armor','Runenrobe',13,19],['armor','Sternenrobe',21,29],['armor','Aschenrobe',29,42],
  ['gloves','Seidenhandschuhe',3,1],['gloves','Runenhandschuhe',14,4],['gloves','Sternenhandschuhe',26,8],
  ['boots','Sandalen',2,1],['boots','Pilgerschuhe',12,4],['boots','Leerenschritt',25,8],
  ['belt','Kordel',3,1],['belt','Runenschärpe',15,4],['belt','Sternengurt',27,8],
  ['offhand','Zauberfibel',1,2],['offhand','Grimoire',12,6],['offhand','Sternenfolio',26,11]];
const MAGT=[{p:'Seiden',l:12,m:1.5,mat:'sky'},{p:'Mondseiden',l:24,m:2.1,mat:'moon'},{p:'Sternenseiden',l:36,m:2.8,mat:'void'}];
PXA.wizhat=['.......m','......ml','......ml','.....mll','.....mlh','....mllh','....mllh','...mlllh','...mlllh','..DDDLLD','..mlllll','.mmmlllh','mmmmmmmm','dddddddd'];
PXA.robe=['','....mmmD','..mmllmD','.mmllllL','mmllhlll','mlllhlll','mm.mllll','dm.mllll','...DDDLL','...mllll','..mlllll','..mllhll','.mllllhl','.mlllllh','mmmmmmmm','dddddddd'];
PXA.tome=['','..dddddddddddd..','.dDDDDDDDDDDDDd.','.dDmmmmmmmmmmDd.','.dDmllllllllmDd.','.dDml1111111mDd.','.dDml1lllll1mDd.','.dDml1lgGl1lmDd.','.dDml1lGgl1lmDd.','.dDml1lllll1mDd.','.dDml1111111mDd.','.dDmllllllllmDd.','.dDmmmmmmmmmmDd.','.dDDDDDDDDDDDDd.','..dddddddddddd..'];
const MGLOOK={helm:['wizhat',1,'cloth','gold'],armor:['robe',1,'cloth','gold'],gloves:['glove',0,'cloth','gold'],boots:['boot',0,'cloth','leather'],belt:['belt',1,'cloth','gold'],offhand:['tome',0,'leather','gold']};
const MGMAT=['cloth','sky','moon','void','blood','ember'];
HELMT.wizard='wizard';
function addArms(){
  for(const[n,lvl,a,b,sp,str,dex,look]of DUALS){const B={n,slot:'weapon',lvl,dmg:[a,b],speed:sp,str,dex,twoH:true,cls:'sword',dual:true,look};BASE[n]=B;PXS[n]=PXS[look];ISZ[n]=[2,3];
    for(const M of MATS){const tn=M.p+'-'+n;BASE[tn]=Object.assign({},B,{n:tn,shape:n,tier:M.p,lvl:lvl+M.l,str:Math.round(str*(1+M.l/80)),dex:Math.round(dex*(1+M.l/80)),dmg:[a,b].map(v=>Math.max(1,Math.round(v*M.m)))});const s2=PXS[look];if(s2)PXS[tn]=[s2[0],M.mat,s2[2],s2[3],s2[4]]}}
  MAGE.forEach(([slot,n,lvl,def],i)=>{const B={n,slot,lvl,def,str:0,dex:0,block:0,cls:slot==='offhand'?'shield':slot,mage:true};BASE[n]=B;if(slot==='helm')HELMT[n]='wizard';
    const[g,half,m0,m1]=MGLOOK[slot],src=slot==='gloves'||slot==='boots'?PXF[g]:PXA[g],mat=MGMAT[i%MGMAT.length];PXS[n]=[()=>pgrid(src,half),slot==='offhand'?['leather','blood','void','sky','moon'][i%5]:mat,m1,'cloth','sapphire'];
    ISZ[n]=slot==='offhand'?[2,2]:slot==='armor'?[2,3]:slot==='belt'?[2,1]:[2,2];
    for(const T of MAGT){const tn=T.p+'-'+n;BASE[tn]=Object.assign({},B,{n:tn,shape:n,tier:T.p,lvl:lvl+T.l,def:Math.round(def*T.m)});PXS[tn]=[PXS[n][0],T.mat,'gold','cloth','sapphire']}})}
const _expandItemsW=expandItems;expandItems=function(){_expandItemsW();addArms()};
// a mage piece carries its power built in, more the deeper it was made
const MGIMP={helm:L=>({mana:8+L*.8,spell:4+L*.5}),armor:L=>({mana:12+L*1.2,spell:6+L*.7,mregen:1+L*.06}),gloves:L=>({spell:4+L*.5,mregen:1+L*.05}),boots:L=>({frw:5+L*.15,mregen:1+L*.05}),belt:L=>({mana:10+L,ene:2+L*.2}),offhand:L=>({spell:8+L*.8,mana:10+L})};
const _makeItemW=makeItem;makeItem=function(ilvl,o={}){const it=_makeItemW(ilvl,o);const b=it&&BASE[it.b];if(b&&b.mage&&!it.mgi){it.mgi=1;const im=MGIMP[b.slot](b.lvl);for(const k in im)it.mods[k]=(it.mods[k]||0)+Math.round(im[k]);if(b.slot==='offhand')it.block=0}return it};
// drawn in the hand: twin blades show the second one in the off hand; a pointed hat, a robe to the ankles, a book instead of a shield
const _vWeaponW=vWeapon;vWeapon=function(hx,hy,ang,cls,m,b){const B=BASE[b],D=B&&(B.dual?B:B.shape&&BASE[B.shape]&&BASE[B.shape].dual?BASE[B.shape]:null);return _vWeaponW(hx,hy,ang,cls,m,D?D.look:b)};
function iconW(it){if(!isDualB(it.b))return vWeapon(0,0,0,it.cls,wRampsOf(it),it.b);ctx.save();ctx.rotate(-.2);ctx.translate(0,-2.5);vWeapon(0,0,0,it.cls,wRampsOf(it),it.b);ctx.restore();ctx.save();ctx.rotate(.2);ctx.translate(0,2.5);vWeapon(0,0,0,it.cls,wRampsOf(it),it.b);ctx.restore()}
const _vHelmW=vHelm;vHelm=function(it,hx,hy,back,f){if(HELMT[SH(it.b)]!=='wizard')return _vHelmW(it,hx,hy,back,f);const m=itemRamps(it),t=Math.sin(G.t*2)*.6;
  blob(hx,hy-1.4,8.2,2.4,m.p);poly([[hx-5,hy-2.5],[hx+5,hy-2.5],[hx+3.4-f*1.5,hy-9],[hx-f*5+t,hy-15.5],[hx-3,hy-8]],m.p);limb(hx-4.8,hy-3.2,hx+4.8,hy-3.2,1.1,1.1,m.s,true);
  if(!back)blob(hx+f*1.2,hy-3.3,.9,.9,[m.gem[0],m.gem[0],m.gem[1],m.gem[2]],true)};
const _heroLookW=heroLook;heroLook=function(fl){const r=_heroLookW(fl),ar=P.eq.armor;if(!fl&&ar&&P.d.okS.has(ar)&&BASE[SH(ar.b)]&&BASE[SH(ar.b)].mage){const m=itemRamps(ar);r.R.legs=r.R.shin=m.p;r.R.skirt=m.p}return r};
const _vShieldW=vShield;vShield=function(it,x,y,back,f){const B=BASE[SH(it.b)];if(!B||!B.mage)return _vShieldW(it,x,y,back,f);const m=itemRamps(it);ctx.save();ctx.translate(x-f*1.5,y-4);
  poly([[-5,-6],[5,-6],[5,6],[-5,6]],m.p);poly([[-4,-5],[4.2,-5],[4.2,5],[-4,5]],[m.s[0],m.s[1],'#e8dcc0','#fff4d8']);limb(-5,-6,-5,6,1.2,1.2,m.p);blob(.2,0,1.3,1.3,[m.gem[0],m.gem[0],m.gem[1],m.gem[2]],true);ctx.restore()};

