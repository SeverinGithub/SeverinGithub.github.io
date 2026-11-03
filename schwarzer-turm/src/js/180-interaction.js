/* ---------- interaction ---------- */
function interact(o){
  if(o.type==='shrine'||o.type==='merchant'||o.type==='stash')G.openAt={x:P.x,y:P.y};
  if(o.type==='shrine'){if(o.ow){if(!G.owFires[o.key]){G.owFires[o.key]={x:o.x,y:o.y,name:o.name};P.tbonus=(P.tbonus||0)+1;log('+1 Talentpunkt (P)','#e8c878');banner('LEUCHTFEUER ENTZÜNDET',o.name,'boss',2200);sfx('lvl');save()}}else if(!G.lit[G.floor]){G.lit[G.floor]=true;banner('LEUCHTFEUER ENTZÜNDET','','boss',2000);sfx('lvl')}G.restObj=o;openShrine(o)}
  else if(o.type==='stairs'){enterFloor(G.floor+1)}
  else if(o.type==='door'){const f=topFloor();enterFloor(f);if(f>1){const s=G.map.objs.find(o=>o.type==='shrine');if(s){const[x,y]=nearWalk(s.x+1,s.y+1);P.x=x;P.y=y;camX=x;camY=y}}}
  else if(o.type==='merchant'){openShop(o)}
  else if(o.type==='stash'){sample('chest',.6)||sfx('pick');openStash()}
  else if(o.type==='colossus')summonArena(o)
  else if(o.type==='chest'&&!o.open){o.open=true;qInc('chest');sample('chest',.75)||sfx('boom');const cl=mlNow(),n=rint(1,3);for(let k=0;k<n;k++)dropItem(junkFor(null,cl),o.x,o.y);if(Math.random()<.18)dropItem(makeItem(cl,{mf:P.d.mf}),o.x,o.y);if(Math.random()<.25)dropItem(makePotion('life',G.floor),o.x,o.y);if(runeOK()&&Math.random()<.03)dropItem(makeRune(pickRune(cl)),o.x,o.y);const gl=rint(3,8)*cl;P.glut+=gl;ftext(o.x,o.y,'+'+gl+' Glut','#ff9a3a')}
}
function pickup(gi){
  const m=G.map,idx=m.items.indexOf(gi);if(idx<0)return;
  
  if(!invAdd(gi.item)){log('Das Inventar ist voll.','#ff5a4a');return}m.items.splice(idx,1);discover(gi.item);sfx('pick');updatePanels()}


// the door leads to the deepest floor whose bonfire is lit; you wake beside that fire
function topFloor(){let f=1;for(const k in G.lit){const n=+k;if(G.lit[k]&&Number.isInteger(n)&&n>f)f=n}return f}
