/* ---------- four ways up the tower: the warrior, the huntress, the mage and the alchemist · the wanderer has gone, and every weapon now belongs to someone ---------- */
const OLDW={str:15,dex:15,vit:15,ene:10};
// the alchemist's six: arrows, and flasks that cost nothing but mana and break where they land
SKILLS.push(
 {id:'a_fire',n:'Brandphiole',req:1,cd:.9,mana:l=>5+l,desc:l=>`Wirft eine Phiole Brandöl: ${pct(1.1+l*.12)} Waffenschaden als Feuer im Umkreis, danach brennt der Boden 3 Sekunden.`},
 {id:'a_frost',n:'Frostphiole',req:3,cd:1.4,mana:l=>7+l,desc:l=>`Die Phiole zerspringt zu einem Eisring: ${pct(.9+l*.1)} Waffenschaden als Kälte, Feinde werden langsamer.`},
 {id:'a_heal',n:'Heilnebel',req:6,cd:12,mana:l=>12+l,desc:l=>`Ein goldener Nebel um dich: 4 Sekunden lang ${12+Math.round(l*1.5)}% deines Lebens zurück, Gift verfliegt. Heilt auch Mitspieler im Nebel.`},
 {id:'a_plague',n:'Seuchenkolben',req:9,cd:6,mana:l=>14+l*2,desc:l=>`Ein schwerer Kolben, der als Giftwolke aufplatzt: 4 Sekunden lang insgesamt etwa ${pct((1.6+l*.16)*1.2)} Waffenschaden als Gift.`},
 {id:'a_oil',n:'Alchemistenöl',req:12,cd:30,mana:l=>18+l,desc:l=>`${15+l} Sekunden lang tragen deine Pfeile reihum Feuer, Frost, Blitz und Gift: je ${30+l*4}% des Schadens zusätzlich als Element, Blitze springen über.`});
SKILLS.forEach(s=>SKBY[s.id]=s);
SKBY.multi.desc=l=>`Schießt ${5+Math.floor(l/4)} Pfeile im Fächer, je ${60+l*6}% Waffenschaden. Mit Bogen oder Armbrust am stärksten.`;
SKBY.d_flurry.req=1;SKBY.d_dash.req=1;SKBY.d_cross.req=3;SKBY.dash.req=6;SKBY.d_dance.req=9;SKBY.d_exec.req=15;
// the order the hero sees them in; the old name stays as a quiet fallback until a wanderer has chosen
{const C0=Object.assign({},CLS);for(const k of Object.keys(CLS))delete CLS[k];
  CLS.krieger=Object.assign(C0.krieger,{stats:{str:24,dex:12,vit:24,ene:5},d:'Stahl und Zorn, keine Zauber. Am meisten Leben, schwere Waffen, mitten hinein. Langklinge, Hammer und Speer bringen eigene Fertigkeiten. +25% Leben, −30% Mana.'});
  CLS.jaegerin=Object.assign(C0.jaegerin,{look:{legs:'robeV'},skills:['d_flurry','d_dash','d_cross','dash','d_dance','d_exec'],stats:{str:14,dex:26,vit:15,ene:10},d:'Schnell, scharf, schwer zu fassen. Mit Dolch oder Doppelklingen durch die Reihen, zuschlagen und weg. +15% Angriffstempo, +10% Lauftempo, +5% kritische Treffer.'});
  CLS.magier=Object.assign(C0.magier,{stats:{str:10,dex:12,vit:12,ene:30},d:C0.magier.d+' +30% Mana, −15% Leben.'});
  CLS.alchemist={n:'Alchemist',d:'Bogen, Armbrust oder Holzzauberstab, dazu Phiolen voller Feuer, Frost und Seuche. Heilt sich und andere. +40% Trankwirkung, auch für geworfene Phiolen.',
    skills:['multi','a_fire','a_frost','a_heal','a_plague','a_oil'],stats:{str:12,dex:20,vit:16,ene:16},ts:'als0',wc:'bow',look:{}};
  Object.defineProperty(CLS,'wanderer',{value:CLS.krieger,enumerable:false,configurable:true})}
const CBON={krieger:d=>{d.life=Math.round(d.life*1.25);d.mana=Math.round(d.mana*.7)},jaegerin:d=>{d.aspd*=1.15;d.frw+=10;d.crit+=5},
  magier:d=>{d.life=Math.round(d.life*.85);d.mana=Math.round(d.mana*1.3)},alchemist:d=>{d.potPow+=40;d.flaskH+=15}};

