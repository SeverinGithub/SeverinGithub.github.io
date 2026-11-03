/* ---------- pixel art ---------- */
// 16x16 role buffers → 18x18 sprites with auto outline. Roles: mat 0..3 × shade 0..3, 16 = black, 17 = gem dark, 18 = gem mid, 19 = gem hi
const PXM={
steel:['#3a4252','#6b7587','#a7b1c2','#eef2f8'],iron:['#2a2c33','#4b4f59','#787d88','#acb1ba'],dark:['#101016','#24242e','#3e3e50','#7a7aa0'],
bronze:['#4a2c12','#8a5624','#c88a3e','#f4cf86'],gold:['#5c3c06','#a87418','#e2b23c','#fff2a6'],bone:['#544a3a','#958a6e','#cfc5a5','#f6f0de'],
wood:['#2c1a0c','#4f3017','#774a24','#a2703c'],leather:['#26140a','#482612','#714020','#9c6236'],blood:['#2c0606','#651010','#a3201a','#e85a40'],
venom:['#0f2410','#24502a','#4a8a46','#a6e08a'],moss:['#1a2a14','#35532a','#5e8a46','#a9cf7e'],sky:['#1a2a52','#3a5ea6','#7aa6e8','#e2f0ff'],
moon:['#4a4e5e','#8a90a6','#c8cee0','#ffffff'],void:['#0c0816','#22163a','#43306a','#8a6ad0'],stone:['#25272b','#45484e','#6c7078','#9da2aa'],
ember:['#3a1204','#8a2c08','#e0661a','#ffc070'],cloth:['#1a1030','#2e2058','#4a3a8a','#7a6ac0'],grass:['#1c3a0c','#2f6a14','#4fa020','#9ae050']};
const PXG={ruby:['#5a0808','#d0261c','#ff9c88'],sapphire:['#0c1c5c','#2a60e0','#a8d0ff'],emerald:['#0a3a1a','#2aa04a','#a6f0a0'],ember:['#6a1a04','#ff7a1a','#ffe0a0'],
frost:['#1a4a6a','#6ad0ff','#e8fbff'],amethyst:['#2a0c4a','#9a40e0','#e0b0ff'],soul:['#0c3a3a','#40e0d0','#e0fff8'],topaz:['#5a3a00','#ffc020','#fff4b0'],life:['#4a0404','#c41c14','#ff7a5a'],mana:['#040c4a','#1c4ad0','#7ab0ff']};
const PXR={};'dmlh'.split('').forEach((c,i)=>PXR[c]=i);'DMLH'.split('').forEach((c,i)=>PXR[c]=4+i);'1234'.split('').forEach((c,i)=>PXR[c]=8+i);PXR.k=16;PXR.e=17;PXR.g=18;PXR.G=19;
const pbuf=()=>new Array(256).fill(-1);
function pgrid(rows,half){const b=pbuf();rows.forEach((r,y)=>{
  const full=half?r+r.split('').reverse().map(c=>({h:'l',l:'m',H:'L',L:'M','4':'3','3':'2'}[c]||c)).join(''):r;
  for(let x=0;x<16;x++){const c=full[x];if(c&&c!=='.')b[y*16+x]=PXR[c]}});return b}
const pset=(b,x,y,v)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<16&&y>=0&&y<16)b[y*16+x]=v};
const pget=(b,x,y)=>x>=0&&x<16&&y>=0&&y<16?b[y*16+x]:-1;
function pfill(fn){const b=pbuf();for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=fn(x,y);if(v!=null&&v>=0)b[y*16+x]=v}return b}
// diagonal space for weapons: a runs handle→tip (−15..15), p across (negative = upper-left, the lit side)
function pdiag(fn){return pfill((x,y)=>fn(x-y,x+y-15))}
const sh=(m,p,w)=>m*4+(p<=-w?3:p<0?2:p===0?(w>1?2:1):p>=w?0:1);
function wBlade(o){const{tip,g,hw=2,gw=3,grip=-8,taper=4,curve=0,fuller=0,rune=0,serr=0,gem=0,pom=1}=o;
  return pdiag((a,p)=>{
    if(a>g&&a<=tip){const t=(a-g)/(tip-g),c=Math.round(curve*t*t),q=p-c,w=Math.min(hw,Math.ceil((tip-a)*hw/taper));
      if(Math.abs(q)<=w){if(serr&&q===w&&a%3===0)return -1;if(rune&&q===0&&a%2===1&&a<tip-2)return a%4===1?19:18;if(fuller&&q===0&&a<tip-3&&a>g+1)return 1;return sh(0,q,w)}}
    if((a===g||a===g-1)&&Math.abs(p)<=gw)return sh(1,p,gw)+(Math.abs(p)===gw&&o.gtip?1:0);
    if(a<g-1&&a>grip&&Math.abs(p)<=1)return 8+((a+(p<0?1:0))%3===0?0:p<0?2:1);
    if(a<=grip&&a>=grip-2&&Math.abs(p)<=1+(pom>1?1:0)){if(gem)return a===grip-1&&p===0?19:p<0?18:17;return sh(1,p,1)}
    return -1})}
function wAxe(o){const{h,prof,dbl,spike,shaft=1,low=-13}=o;
  return pdiag((a,p)=>{
    const i=h-a;if(i>=0&&i<prof.length){const W=prof[i];if(p<0&&-p<=W+1)return -p===W+1?(i>0&&i<prof.length-1?7:6):-p===W?3:-p>W-2?2:1;
      if(dbl&&p>0&&p<=W+1)return p===W+1?(i>0&&i<prof.length-1?6:5):p===W?2:1;}
    if(spike&&p>0&&p<=spike&&(a===h-2||a===h-3))return p===spike?3:1;
    if(a===h+1&&Math.abs(p)<=1)return sh(0,p,1);
    if(a<=h&&a>=low&&Math.abs(p)<=shaft)return 8+(a%5===0?0:p<0?2:1);
    return -1})}
function wMace(o){const{hc,r=2.5,spikes=0,low=-13,flange=0}=o,cx=(hc+15)/2,cy=(15-hc)/2;
  return pfill((x,y)=>{const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),a=x-y,p=x+y-15;
    if(d<=r){if(flange&&(Math.abs(dx)<.6||Math.abs(dy)<.6))return 7;const l=-(dx+dy)/(r*1.4);return l>.5?3:l>0?2:l>-.5?1:0}
    if(spikes&&d<=r+2&&(Math.abs(dx)<.6||Math.abs(dy)<.6||Math.abs(Math.abs(dx)-Math.abs(dy))<.6))return d>r+1?3:2;
    if(a<hc&&a>=low&&Math.abs(p)<=1)return 8+(a%4===0?0:p<0?2:1);
    if(a<low+2&&a>=low-1&&Math.abs(p)<=1)return sh(1,p,1);
    return -1})}
function wHammer(o){const{h=10,W=5,low=-13}=o;
  return pdiag((a,p)=>{if(a>=h-3&&a<=h&&Math.abs(p)<=W)return a===h?(Math.abs(p)===W?2:3):a===h-3?0:Math.abs(p)===W?1:2;
    if(a>h&&a<=h+2&&Math.abs(p)<=1)return sh(0,p,1);
    if(a<h-3&&a>h-6&&Math.abs(p)<=1)return sh(1,p,1);
    if(a<=h-6&&a>=low&&Math.abs(p)<=1)return 8+(a%4===0?0:p<0?2:1);return -1})}
function wClub(o){const{h=12,low=-13}=o;
  return pdiag((a,p)=>{if(a>h||a<low)return -1;const w=a<-2?1:a<5?2:3;if(Math.abs(p)>w)return -1;
    if(a===5||a===6)return sh(1,p,w);if(o.studs&&a>6&&Math.abs(p)===w&&a%3===0)return 7;return 8+(p<=-w?3:p<0?2:p<w?1:0)})}
function wSpear(o){const{s0,prof,low=-13,hook=0,blade=0,glow=0}=o;
  return pdiag((a,p)=>{const i=a-s0;
    if(i>=0&&i<prof.length&&Math.abs(p)<=prof[i]){if(glow&&p===0)return 19;return sh(0,p,prof[i])}
    if(blade&&a<s0&&a>=s0-blade&&p<0&&-p<=6)return -p===6?3:-p>=5?2:1;
    if(hook&&a<s0&&a>=s0-2&&p>0&&p<=3)return p===3?2:1;
    if((a===s0-1||a===s0-2)&&Math.abs(p)<=1&&!blade)return sh(1,p,1);
    if(a<s0&&a>=low&&Math.abs(p)<=1)return o.ring&&a%6===0?5:8+(a%5===0?0:p<0?2:1);return -1})}
function wStaff(o){const{top=9,orb=2,prongs=0,knot=0,leaves=0,star=0}=o,cx=(top+2+15)/2,cy=(15-top-2)/2;
  return pfill((x,y)=>{const a=x-y,p=x+y-15,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);
    if(star&&((Math.abs(dx)<.6&&Math.abs(dy)<=3.2)||(Math.abs(dy)<.6&&Math.abs(dx)<=3.2)))return d<1?19:18;
    if(d<=orb)return d<orb*.45?19:dx+dy<0?18:17;
    if(leaves&&d<=orb+2&&(x+y*3)%4===0)return 5;
    if(prongs&&d<=orb+1.3&&d>orb&&(dy>0||dx<0))return 6;
    const wig=knot?Math.round(Math.sin(a*.9)*.6):0;
    if(a<top&&a>=-13&&Math.abs(p-wig)<=1)return 8+(a%3===0?0:p-wig<0?2:1);
    if(knot&&a<top&&a>=-13&&a%5===0&&Math.abs(p-wig)<=2)return 8;return -1})}
function wShield(kind){
  return pfill((x,y)=>{const cx=7.5,cy=7.5,dx=x-cx,dy=y-cy;let inside,rim,boss=false,emb=false;
    if(kind==='round'){const d=Math.hypot(dx,dy);inside=d<=7;rim=d>5.6;boss=d<1.9}
    else if(kind==='tower'){inside=x>=2&&x<=13&&y>=1&&y<=14&&!((x===2||x===13)&&y===1);rim=x===2||x===13||y===1||y===14;emb=(x===7||x===8)&&y>=3&&y<=12||(y===6||y===7)&&x>=4&&x<=11}
    else if(kind==='heater'){const lim=6.6-Math.max(0,y-7)*1.0;inside=y>=1&&y<=14&&Math.abs(dx)<=lim;rim=y===1||Math.abs(dx)>lim-1.1;emb=!rim&&dx>=0&&y<9?'f':(!rim&&dx<0&&y>=9?'f':false)}
    else{inside=y>=1&&y<=14&&Math.abs(dx)<=6&&(y>=6||Math.hypot(dx,y-6)<=6.2);rim=y===14||Math.abs(dx)>5||(y<6&&Math.hypot(dx,y-6)>5.2);emb=(Math.abs(dx)<.6&&y>=4&&y<=11)||(y===6&&Math.abs(dx)<=3)?'c':false}
    if(!inside)return -1;const lit=-(dx+dy)/10;
    if(boss)return lit>0?7:6;
    if(rim)return 4+(lit>.25?3:lit>-.1?2:lit>-.5?1:0);
    if(emb==='f')return 18;if(emb==='c')return 16;if(emb)return 4+(lit>0?3:2);
    if(kind==='round'&&x%3===0)return 0;if(kind==='grave'&&((x*7+y*3)%11===0))return 0;
    return lit>.2?3:lit>-.2?2:1})}
function wRing(){return pfill((x,y)=>{const dx=x-7.5,dy=y-9.5,d=Math.hypot(dx,dy),gd=Math.hypot(x-7.5,y-3.5);
  if(gd<=2.3)return gd<1?19:x+y<11?18:17;if(y<=6&&Math.abs(x-7.5)<=3&&y>=5)return 5;
  if(d<=5&&d>=3.2){const l=-(dx+dy)/6;return 4+(l>.4?3:l>-.1?2:l>-.6?1:0)}return -1})}
function wAmulet(){return pfill((x,y)=>{const dx=x-7.5;
  const cy=10.5,d=Math.abs(dx)+Math.abs(y-cy);if(d<=2.2)return d<.8?19:dx+(y-cy)<0?18:17;if(d<=3.3)return d<=2.9&&y<cy?7:5;
  if(y<=7&&y>=1&&Math.abs(Math.abs(dx)-(1+(7-y)*.85))<.55)return (x+y)%2?6:5;return -1})}
function wPotion(){return pfill((x,y)=>{const dx=x-7.5,dy=y-10,d=Math.hypot(dx,dy);
  if(y>=1&&y<=2&&Math.abs(dx)<=1.5)return y===1?10:9;
  if(y>=3&&y<=5&&Math.abs(dx)<=1.5)return Math.abs(dx)>1?6:y===3?7:5;
  if(d<=5){if(d>4.2)return dx+dy<0?7:5;if(dx<-1&&dy<-1&&d>2.4&&d<3.6)return 19;return dy<-2?18:dy<2?18:17}return -1})}

// armor sheets (left half, mirrored with darker right side)
const PXA={
cap:['','','','','......mm','....mmll','...mlllh','..mllhhl','..mlllll','..mmmmmm','.dDDLDDL','.dmm....','.dmm....','..dd....'],
ironhelm:['','','.......L','.....mml','...mmlll','..mllhhh','..mlllll','.dmmmmmm','.dDDDDDD','.dmmkkkM','.dmmkkkM','.dmmkkkM','.ddmkk..','..dd....'],
greathelm:['','','....mmmm','...mllll','..mllhhh','..mlllll','..mmmmmm','..mmkkkk','..mmmmmM','..mlmkmM','..mlmmmM','..mlmkmM','..dmmmmM','..dddddd'],
crown:['','','','.H.....H','.L..H..L','.M..L..M','.MM.M.MM','.MMMMMMM','.mhhhhhh','.mlglllg','.dmmmmmm','.ddddddd'],
tunic:['','...mmm..','.mmlllmD','mmllhllm','mlllllll','mllmllll','mmmmllll','dm.mllll','dd.mmlll','...mmlll','...mmmll','...DDDLL','...dmmmm','...dmmmm','...ddddd'],
plate:['','.MMMM...','MLHHLmmm','MLLLLlll','DMMMDlhl','.DDD.lll','....mlll','....mlll','....mmll','....dmml','...DDDDD','...mlmlm','...mlmlm','...dmdmd'],
belt:['','','','','','.....DDD','dmmmmDLL','mllhlDLk','mllllDLk','dmmmmDLL','.....DDD'],
beltp:['','','','','','.....DDD','dmmmmDLL','mllhlDLk','mllllDLk','dmmmmDLL','.MMM.DDD','.mlm....','.mlm....','.ddd....']};
const PXF={
glove:['','','....m.m.m.......','....mlmlml......','....mlmlml......','....mlmlml.mm...','....mllllllml...','....mlllllmll...','....mlhllllll...','....mlllllll....','....mmmmmmmm....','...DDDDDDDDDD...','...DLLLLLLLLD...','...DMMMMMMMMD...','...DDDDDDDDDD...'],
boot:['','','......DDDDDD....','......LLLLLL....','.......mlllm....','.......mlhlm....','.......mlllm....','.......mlllm....','.......mlllm....','......mmlllm....','...mmmmllllm....','..mlllllllllm...','..mhllllllllm...','..DDDDDDDDDDD...']};
const chainify=b=>b.map((v,i)=>v>=0&&v<4&&v>0?((i%16+(i>>4))&1?2:1):v);
const scalify=b=>b.map((v,i)=>{if(!(v>=0&&v<4))return v;const x=i%16,y=i>>4;return((x+((y>>1)&1)*2)%4===0&&y%2===0)?0:y%2?1:2});
const over=(b,pts)=>{for(const[x,y,v]of pts)pset(b,x,y,v);return b};

// every base item: shape + default materials [primary, secondary, tertiary, gem]
const PXS={
'Kurzschwert':[()=>wBlade({tip:10,g:-3,gw:3,grip:-8}),'steel','iron','leather'],
'Dolch':[()=>wBlade({tip:6,g:-4,gw:2,grip:-8,taper:3}),'iron','iron','leather'],
'Langschwert':[()=>wBlade({tip:13,g:-4,gw:3,grip:-9,fuller:1,taper:5}),'steel','steel','leather'],
'Krummsäbel':[()=>wBlade({tip:12,g:-4,gw:2,grip:-9,curve:-3,taper:3}),'steel','bronze','leather'],
'Runenklinge':[()=>wBlade({tip:13,g:-4,gw:3,grip:-9,rune:1,gem:1,taper:5,gtip:1}),'dark','steel','leather','sapphire'],
'Mondsichel':[()=>wBlade({tip:12,g:-4,gw:3,grip:-9,curve:-5,taper:3,gem:1}),'moon','gold','cloth','frost'],
'Drachenzahn':[()=>wBlade({tip:13,g:-4,hw:3,gw:4,grip:-9,serr:1,taper:6,gem:1,gtip:1}),'bone','bronze','leather','ruby'],
'Zweihänder':[()=>wBlade({tip:13,g:-5,hw:3,gw:4,grip:-11,fuller:1,taper:5}),'steel','iron','leather'],
'Kolossklinge':[()=>wBlade({tip:13,g:-5,hw:3,gw:5,grip:-11,rune:1,taper:5,gtip:1,pom:2}),'dark','iron','leather','ember'],
'Schattendolch':[()=>wBlade({tip:7,g:-4,gw:2,grip:-8,taper:4,rune:1,gem:1}),'void','dark','cloth','amethyst'],
'Nachtzahn':[()=>wBlade({tip:8,g:-4,gw:3,grip:-8,taper:4,curve:-2,gem:1,gtip:1}),'dark','steel','cloth','sapphire'],
'Handaxt':[()=>wAxe({h:9,prof:[3,4,5,4,3],low:-11}),'iron','iron','wood'],
'Kriegsaxt':[()=>wAxe({h:11,prof:[3,5,6,6,5,3],dbl:1}),'steel','steel','wood'],
'Bluthacke':[()=>wAxe({h:11,prof:[4,6,7,7,6,4],spike:3}),'blood','iron','dark'],
'Henkersbeil':[()=>wAxe({h:12,prof:[5,7,8,9,9,8,7,5],spike:2}),'iron','iron','wood'],
'Keule':[()=>wClub({h:11}),'iron','iron','wood'],
'Morgenstern':[()=>wMace({hc:9,r:2.4,spikes:1}),'iron','iron','wood'],
'Kriegshammer':[()=>wHammer({h:10,W:5}),'steel','bronze','wood'],
'Speer':[()=>wSpear({s0:7,prof:[1,2,2,2,1,1,0]}),'steel','iron','wood'],
'Hellebarde':[()=>wSpear({s0:10,prof:[1,1,1,0],blade:5,hook:1}),'steel','iron','wood'],
'Seelenspieß':[()=>wSpear({s0:6,prof:[2,3,2,2,2,1,1,0],glow:1,ring:1}),'dark','gold','dark','soul'],
'Eichenstab':[()=>wStaff({top:9,orb:1.6,knot:1,leaves:1}),'wood','moss','wood','emerald'],
'Aschestab':[()=>wStaff({top:9,orb:2.2,prongs:1}),'dark','iron','dark','ember'],
'Sternenstab':[()=>wStaff({top:9,orb:1.4,star:1}),'moon','gold','moon','sapphire'],
'Lederkappe':[()=>pgrid(PXA.cap,1),'leather','bronze'],
'Eisenhelm':[()=>pgrid(PXA.ironhelm,1),'iron','steel'],
'Topfhelm':[()=>pgrid(PXA.greathelm,1),'steel','bronze'],
'Hornhelm':[()=>over(pgrid(PXA.greathelm,1),[[0,0,7],[1,0,6],[0,1,6],[1,1,7],[1,2,6],[2,2,5],[2,3,4],[15,0,6],[14,0,5],[15,1,5],[14,1,6],[14,2,5],[13,2,4],[13,3,4]]),'dark','bone'],
'Totenkrone':[()=>pgrid(PXA.crown,1),'dark','gold','dark','ruby'],
'Lederwams':[()=>pgrid(PXA.tunic,1),'leather','bronze'],
'Kettenhemd':[()=>chainify(pgrid(PXA.tunic,1)),'iron','leather'],
'Schuppenpanzer':[()=>scalify(pgrid(PXA.tunic,1)),'bronze','leather'],
'Plattenharnisch':[()=>pgrid(PXA.plate,1),'steel','steel'],
'Schwarzer Harnisch':[()=>over(pgrid(PXA.plate,1),[[1,0,7],[3,0,6],[14,0,6],[12,0,5],[7,6,18],[8,6,18],[7,7,17],[8,7,17]]),'dark','iron','dark','ruby'],
'Lederhandschuhe':[()=>pgrid(PXF.glove),'leather','leather'],
'Kettenhandschuhe':[()=>chainify(pgrid(PXF.glove)),'iron','leather'],
'Panzerhandschuhe':[()=>pgrid(PXF.glove),'steel','bronze'],
'Klauenhandschuhe':[()=>over(pgrid(PXF.glove),[[4,1,6],[6,1,6],[8,1,6],[4,0,7],[6,0,7],[8,0,7]]),'dark','bone'],
'Stiefel':[()=>pgrid(PXF.boot),'leather','leather'],
'Kettenstiefel':[()=>chainify(pgrid(PXF.boot)),'iron','leather'],
'Plattenstiefel':[()=>pgrid(PXF.boot),'steel','bronze'],
'Schattentreter':[()=>over(pgrid(PXF.boot),[[8,6,18],[8,8,18],[4,11,18]]),'void','dark','dark','amethyst'],
'Schärpe':[()=>pgrid(PXA.belt,1),'cloth','bronze'],
'Ledergürtel':[()=>pgrid(PXA.belt,1),'leather','iron'],
'Kriegsgürtel':[()=>pgrid(PXA.beltp,1),'leather','steel'],
'Kettengürtel':[()=>chainify(pgrid(PXA.beltp,1)),'iron','gold'],
'Rundschild':[()=>wShield('round'),'wood','iron'],
'Turmschild':[()=>wShield('tower'),'iron','steel'],
'Wappenschild':[()=>wShield('heater'),'cloth','gold','wood','ruby'],
'Grabsteinschild':[()=>wShield('grave'),'stone','stone'],
'Ring':[()=>wRing(),'gold','gold','gold','ruby'],
'Amulett':[()=>wAmulet(),'gold','gold','gold','sapphire'],
'potL':[()=>wPotion(),'gold','sky','wood','life'],'potM':[()=>wPotion(),'gold','sky','wood','mana']};
// unique skins: [primary, secondary, tertiary, gem]
const PXU={'Hügelwacht':['moss','gold',0,'emerald'],'Grünes Blut':['venom','dark',0,'emerald'],'Der Erste Stein':['stone','stone','stone','frost'],'Wächterrund':['sky','gold'],
'Grasläufer':['grass','leather'],'Aschenwurzel':['dark',0,'dark','ember'],'Himmelsriss':['sky','gold',0,'frost'],'Mantel des Hügels':['moss','bronze'],'Ring der Blauen Stunde':['moon','moon',0,'sapphire'],
'Turmglocke':['bronze','gold','dark'],'Fäuste des Steinmetzes':['stone','stone'],'Wolkenbrecher':['sky','moon',0,'frost'],'Krone der Zinnen':['gold','bronze'],'Blutring':['blood','blood',0,'ruby'],
'Auge des Turms':['dark','dark',0,'ember'],'Sturmtreter':['sky','gold',0,'frost'],'Gürtel der Ewigen Wache':['gold','gold'],'Stab des Blauen Mittags':['gold','gold','gold','sapphire'],
'Kargsteins Ende':['blood','dark','dark'],'Mondsichel des Schweigens':['moon','moon','cloth','frost'],'Grabsteinwall':['dark','stone'],'Drachenzahn Vaels':['ember','gold',0,'ember'],
'Totenmaske':['bone','void',0,'amethyst'],'Schwarze Haut':['void','dark',0,'amethyst'],'Nachtgesang':['void','moon','cloth','sapphire']};
const PXCACHE={};
const hex3=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
// 16x16 shape → 32x32 shaded icon: smooth silhouette, bevel light from upper left, metal sheen, palette + dither
function pxCanvas(key,uq,sil,N=32){const ck=key+'|'+(uq||'')+(sil?'|s':'')+'|'+N;if(PXCACHE[ck])return PXCACHE[ck];
  const s=PXS[key]||PXS.Ring,b=s[0](),sk=uq&&PXU[uq]||[],names=[0,1,2].map(i=>sk[i]||s[i+1]||s[1]);
  const mats=names.map(n=>PXM[n].map(hex3)),metal=names.map(n=>METAL.has(n)),gem=PXG[sk[3]||s[4]||'ruby'].map(hex3);
  const f=N/16,O=N+2,role=new Int16Array(N*N).fill(-1),M=new Uint8Array(N*N),at=(x,y)=>x<0||y<0||x>15||y>15?-1:b[y*16+x];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5)/f-.5,v=(y+.5)/f-.5,x0=Math.floor(u),y0=Math.floor(v),fu=u-x0,fv=v-y0;let m=0,best=-1,bw=0;
    for(const[cx,cy,w]of[[x0,y0,(1-fu)*(1-fv)],[x0+1,y0,fu*(1-fv)],[x0,y0+1,(1-fu)*fv],[x0+1,y0+1,fu*fv]]){const r=at(cx,cy);if(r>=0){m+=w;if(w>bw){bw=w;best=r}}}
    if(m>=.5){const own=at(Math.floor(x/f),Math.floor(y/f));role[y*N+x]=own>=0?own:best;M[y*N+x]=1}}
  let Hm=Float32Array.from(M);for(let k=0;k<Math.max(1,Math.round(f));k++){const n=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<N&&Y<N)t+=Hm[Y*N+X]}n[y*N+x]=t/9}Hm=n}
  const c=document.createElement('canvas');c.width=c.height=O;const g=c.getContext('2d',{willReadFrequently:true}),img=g.createImageData(O,O),D=img.data;
  const put=(x,y,rgb)=>{const i=(y*O+x)*4;D[i]=rgb[0];D[i+1]=rgb[1];D[i+2]=rgb[2];D[i+3]=255};
  const ramp=(r,t)=>{t=clamp(t,0,1)*(r.length-1);const k=Math.min(r.length-2,Math.floor(t)),u=t-k;return[0,1,2].map(i=>r[k][i]+(r[k+1][i]-r[k][i])*u)};
  const h=(X,Y)=>X<0||Y<0||X>=N||Y>=N?0:Hm[Y*N+X];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;if(!M[i])continue;if(sil){put(x+1,y+1,[46,42,38]);continue}
    const v=role[i];if(v===16){put(x+1,y+1,[6,5,4]);continue}
    const nx=(h(x-1,y)-h(x+1,y))*2.4,ny=(h(x,y-1)-h(x,y+1))*2.4,lam=(-.55*nx-.65*ny+.52)/Math.hypot(nx,ny,1);
    const isGem=v>=17,r=isGem?gem:mats[v>>2],met=!isGem&&metal[v>>2];let t=(isGem?(v-17)/2:(v&3)/3)*.55+(lam-.4)*1.15+.22;
    if(met)t+=Math.pow(Math.max(0,lam),12)*.7;put(x+1,y+1,ramp(r,t))}
  const filled=(x,y)=>x>=1&&y>=1&&x<=N&&y<=N&&M[(y-1)*N+x-1];
  for(let y=0;y<O;y++)for(let x=0;x<O;x++)if(!filled(x,y)&&(filled(x-1,y)||filled(x+1,y)||filled(x,y-1)||filled(x,y+1)))put(x,y,sil?[20,18,16]:[10,8,6]);
  g.putImageData(img,0,0);if(!sil)quantize(g,O,O);return PXCACHE[ck]=c}
const PXURL={};
const pxURL=(key,uq,sil)=>{const k=key+'|'+(uq||'')+(sil?'|s':'');return PXURL[k]||(PXURL[k]=pxCanvas(key,uq,sil).toDataURL())};
const itKey=it=>it.slot==='potion'?it.cls:it.slot==='rune'?'Rune:'+it.rune:it.b;
const itUq=it=>it.rar==='unique'?it.name.replace(/ \+\d+$/,''):'';
// inventory: 10x5 grid, every item covers w x h cells by how big and heavy it is
const IW=10,ICW=24;let IH=5;
const ISZ={'Dolch':[1,2],'Schattendolch':[1,2],'Kurzschwert':[1,3],'Krummsäbel':[1,3],'Nachtzahn':[1,3],'Langschwert':[1,4],'Runenklinge':[1,4],'Mondsichel':[1,4],'Drachenzahn':[2,4],'Zweihänder':[2,4],'Kolossklinge':[2,5],
 'Handaxt':[1,3],'Keule':[1,3],'Kriegsaxt':[2,3],'Bluthacke':[2,3],'Morgenstern':[2,3],'Kriegshammer':[2,3],'Henkersbeil':[2,4],'Speer':[2,4],'Hellebarde':[2,4],'Seelenspieß':[2,5],'Eichenstab':[1,4],'Aschestab':[2,4],'Sternenstab':[2,5],
 'Lederwams':[2,2],'Kettenhemd':[2,3],'Schuppenpanzer':[2,3],'Plattenharnisch':[2,3],'Schwarzer Harnisch':[2,3],'Rundschild':[2,2],'Wappenschild':[2,3],'Turmschild':[2,3],'Grabsteinschild':[2,4],
 'Schärpe':[2,1],'Ledergürtel':[2,1],'Kriegsgürtel':[2,1],'Kettengürtel':[2,1],'Ring':[1,1],'Amulett':[1,1]};
const isz=it=>it.slot==='potion'?[1,1]:ISZ[SH(it.b)]||(it.slot==='helm'||it.slot==='gloves'||it.slot==='boots'?[2,2]:[1,1]);
function invAt(x,y,w,h,skip){return P.inv.filter(it=>{if(it===skip)return false;const[a,b]=isz(it);return x<it.gx+a&&x+w>it.gx&&y<it.gy+b&&y+h>it.gy})}
const invFits=(x,y,w,h)=>x>=0&&y>=0&&x+w<=IW&&y+h<=IH&&!invAt(x,y,w,h).length;
function invAdd(it){if(it.slot==='potion'&&P.d&&P.d.potStack>1){const s2=P.inv.find(o=>o.slot==='potion'&&o.kind===it.kind&&(o.n||1)+(it.n||1)<=P.d.potStack);if(s2){s2.n=(s2.n||1)+(it.n||1);s2.amt=Math.max(s2.amt,it.amt);return true}}const[w,h]=isz(it);for(let x=0;x<=IW-w;x++)for(let y=0;y<=IH-h;y++)if(invFits(x,y,w,h)){it.gx=x;it.gy=y;P.inv.push(it);return true}return false}
function invDel(it){const i=P.inv.indexOf(it);if(i>=0)P.inv.splice(i,1)}
const WEXT={sword:[-8.6,21,0,3.8],dagger:[-8.6,12,0,3.8],great:[-8.6,30,0,5.2],axe:[-7.5,21,2.5,10],mace:[-7.5,19,8,7],spear:[-14.5,26,10.5,4],staff:[-14.5,24,8,5]};
const INVC={};
// icon at inventory size: weapons are painted upright from the same shapes the hero holds; the rest are shaded at size
function invIcon(it){const[w,h]=isz(it),key=itKey(it)+'|'+itUq(it)+'|'+w+'x'+h+(it.soc?'|'+it.soc+':'+(it.runes||[]).join(','):'');if(INVC[key])return INVC[key];
  const c=document.createElement('canvas');c.width=w*ICW;c.height=h*ICW;const g=c.getContext('2d',{willReadFrequently:true});
  const wc=SH(it.b)==='Henkersbeil'?'axe':it.cls;if(it.dmg&&WEXT[wc]){const[lo,L,ex,hw0]=WEXT[wc],hw=SH(it.b)==='Hellebarde'?7.5:hw0,sc=Math.min((c.height-4)/(L+ex-lo),(c.width-2)/(hw*2));
    g.translate(c.width/2,c.height-2+lo*sc);g.rotate(-Math.PI/2);g.scale(sc,sc);const prev=ctx;ctx=g;try{iconW(it)}finally{ctx=prev}g.setTransform(1,0,0,1,0,0)}
  else{const S=Math.min(w,h)*ICW-2,src=pxCanvas(itKey(it),itUq(it),false,S-2);g.drawImage(src,(c.width-src.width)/2|0,(c.height-src.height)/2|0)}
  const img=g.getImageData(0,0,c.width,c.height),d=img.data,W2=c.width,H2=c.height,op=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2&&d[(y*W2+x)*4+3]>120;
  const rim=[];for(let y=0;y<H2;y++)for(let x=0;x<W2;x++)if(!op(x,y)&&(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1)))rim.push((y*W2+x)*4);
  for(let i=0;i<d.length;i+=4)if(d[i+3]<=120)d[i+3]=0;for(const i of rim){d[i]=10;d[i+1]=8;d[i+2]=6;d[i+3]=255}g.putImageData(img,0,0);if(it.soc)drawSocks(g,it,W2,H2);quantize(g,W2,H2);
  return INVC[key]=c.toDataURL()}
const invImg=(it,maxH=150)=>{const[w,h]=isz(it),sc=Math.min(2,maxH/(h*ICW));return`<img class="px" src="${invIcon(it)}" width="${Math.round(w*ICW*sc)}" height="${Math.round(h*ICW*sc)}" alt="">`};
const pxImg=(it,sz)=>`<img class="px" src="${pxURL(itKey(it),itUq(it))}" width="${sz}" height="${sz}" alt="">`;


