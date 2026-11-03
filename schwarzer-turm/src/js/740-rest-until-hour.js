/* ---------- rest until morning or until night: the fires on the islands let you choose the hour ---------- */
const _openShrineDN=openShrine;openShrine=function(o){_openShrineDN(o);if(!G.map||!G.map.world)return;const op=$('dialog').querySelector('.opts');if(!op)return;
  op.insertAdjacentHTML('beforeend','<div class="dnrow"><button data-dn="day">☀ Rasten bis zum Morgen</button><button data-dn="night">☾ Rasten bis zur Nacht</button></div>')};
function restUntil(k){const ph=k==='day'?.005:.62,base=Math.floor((G.dayT||0)/DAYLEN)*DAYLEN;let t=base+ph*DAYLEN;if(t<=(G.dayT||0)+5)t+=DAYLEN;G.dayT=t;
  rest();closeDialog();const n=k==='night';banner(n?'DIE NACHT IST DA':'EIN NEUER MORGEN',n?'Du hast bis zur Dunkelheit gerastet':'Du hast bis zum Sonnenaufgang gerastet','',2600)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-dn]');if(b&&P)restUntil(b.dataset.dn)});

