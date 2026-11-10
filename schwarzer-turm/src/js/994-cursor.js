/* ---------- the pointer: a plated steel gauntlet instead of the system arrow, painted here in the game's own pixels · gold-lit over anything you can use, a drawn blade over a foe, a closed fist while it carries an item ---------- */
const CURS=3,
 CURBLADE=[
 'hh..............',
 'hhm.............',
 '.hhm............',
 '..hhm...........',
 '...hhm..........',
 '....hhm.........',
 '.....hhm........',
 '......hhm.......',
 '.......hhm...g..',
 '........hhm.gg..',
 '.........hhgg...',
 '..........ggd...',
 '.........gggrr..',
 '........gg..rrd.',
 '........g....rrg',
 '..............gg'],
 CURPAL={steel:{h:'#f0f2ee',l:'#b9c2c2',m:'#869393',d:'#4b565a',k:'#12161a',g:'#b8742a',r:'#6e3620',c:'#0b0d11'},lit:{h:'#fffbe6',l:'#f6dc8c',m:'#dcae52',d:'#96692a',k:'#24180a',g:'#ffd870',r:'#8a4a1c',c:'#140e06'},blood:{h:'#fff0e8',m:'#e8c0b0',d:'#b06a5a',g:'#e03a24',r:'#5a1810'}};
// the gauntlet lies on the clean diagonal, fingertip up and to the left. Every pixel is placed on the hand's own lattice: s = x+y runs along the hand from the tip,
// t = x-y runs across it towards the knuckles, so every seam is a true pixel diagonal and every plate a clean stair. Open, the forefinger points; closed, four knuckles and the thumb hold what you carry
function curHand(fist){const W=30,H=27,rows=[];
  // light falls from the upper right: a white ridge along each plate, grey flanks, a dark underside
  const lane=(t,a,b)=>{const q=(t-a)/(b-a);return q>.8?'l':q>.52?'h':q>.2?'m':'d'};
  const at=(s,t)=>{
    if(!fist){
      // forefinger: three lames, each a little broader than the one before and lapping over it, ending in a sharp point. Two flat facets meet in a bright ridge, so it reads as folded steel, not as a tube
      if(s>=0&&s<=19){const lo=s<1?0:s<4?-1:s<14?-2:-3,hi=s<1?0:s<4?1:s<8?2:3;if(t>=lo&&t<=hi){if(s===7||s===13)return 'k';const edge=s===8||s===14;
        return t===1?'h':t>=2?(edge?'h':'l'):t===0?(edge||s<2?'l':'m'):t===lo&&s>3?'d':edge?'m':'d'}}
      // the three curled fingers: each a rounded knuckle plate, stepped back, with a gap between
      for(let i=0;i<3;i++){const a=3+i*3,b=a+2,s0=12+i*2;if(t>=a&&t<=b&&s>=s0&&s<=21){if(t===a)return 'k';if(s===s0&&t===b)return '.';return s<=s0+1?'d':s<=s0+3?(t===b?'l':'h'):s===s0+4?'m':t===b?'m':'d'}}
      if(t===12&&s>=18&&s<=21)return s===18?'.':'d'}
    else{
      // fist: four knuckles in a row, the fingers folded under them, the thumb laid across in front
      if(s>=12&&s<=21&&t>=-2&&t<=12){const j=Math.floor((t+2)/3.75),a=Math.round(-2+j*3.75),b=Math.round(-2+(j+1)*3.75)-1;if(t===a&&j>0)return 'k';if(s===12&&(t===a||t===b||j===0&&t===-2))return '.';
        return s<=13?'d':s===14?'k':s<=17?(t===b?'l':t===b-1?'h':s<=16&&t===b-2?'l':'m'):s===18?'m':t>=b-1?'m':'d'}
      if(s>=14&&s<=20&&t>=-7&&t<=-3&&!(s===14&&(t===-7||t===-3)))return t===-3?'k':s<=15?(t>=-5?'l':'m'):t>=-5?(s<=18?'h':'l'):t===-6?'m':'d'}
    // the joint behind the knuckles, then the back of the hand in two plates
    if(s===22&&t>=-2&&t<=12)return 'k';
    if(s>=23&&s<=32&&t>=-2&&t<=12){if(s===27&&t<=3||s===28&&t>=4&&t<=6||s===29&&t>=7)return 'k';if(t===12)return 'd';return lane(t,-2,12)}
    // thumb: lies along the hand, tip forward, split from it by a dark line
    if(s>=20&&s<=31&&t>=-8&&t<=-3&&!fist){if(s===20&&(t<=-7||t>=-4)||s===21&&t===-8)return '.';if(t===-3)return s>=23?'k':'m';if(s===26)return 'k';return t>=-5?(s<26||s===27?'h':'l'):t===-6?'m':'d'}
    if(s>=22&&s<=31&&t>=-6&&t<=-3&&fist)return t===-3?'k':t===-4?'m':'d';
    // leather strap round the wrist, lighter where the light catches it
    if(s===33&&t>=-3&&t<=12)return 'k';
    if(s>=34&&s<=35&&t>=-3&&t<=12)return t>=6&&t<=10?'g':t>=3?(s===34?'g':'r'):'r';
    if(s===36&&t>=-3&&t<=12)return 'k';
    // wrist plate
    if(s>=37&&s<=41&&t>=-2&&t<=11)return t===11?'d':lane(t,-2,11);
    // the cuff opens towards you: a leather rim, darkness inside
    const e=Math.hypot((s-46)/4.6,(t-4.5)/8.6);if(e<=1)return e>.7?(t>=5?'g':t>=0?'r':'r'):e>.56&&t<3?'k':'c';return '.'};
  for(let y=0;y<H;y++){let r='';for(let x=0;x<W;x++)r+=at(x+y,x-y);rows.push(r)}return rows}
// every painted pixel gets a dark rim so the pointer reads on snow, lava and parchment alike
function curPaint(rows,pal){const w=rows[0].length,h=rows.length,c=document.createElement('canvas');c.width=(w+2)*CURS;c.height=(h+2)*CURS;const g=c.getContext('2d'),at=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&rows[y][x]&&rows[y][x]!=='.';
  g.fillStyle='#0a0806';for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++)if(!at(x,y)&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)))g.fillRect((x+1)*CURS,(y+1)*CURS,CURS,CURS);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)){g.fillStyle=pal[rows[y][x]];g.fillRect((x+1)*CURS,(y+1)*CURS,CURS,CURS)}return c.toDataURL()}
function curInit(){if(TOUCH)return;const u=(rows,pal,hx,hy,fb)=>`url(${curPaint(rows,pal)}) ${(hx+1)*CURS} ${(hy+1)*CURS}, ${fb}`,st=document.documentElement.style;
  const open=curHand(0);st.setProperty('--cur',u(open,CURPAL.steel,0,0,'default'));st.setProperty('--cur-p',u(open,CURPAL.lit,0,0,'pointer'));st.setProperty('--cur-h',u(curHand(1),CURPAL.steel,0,0,'grabbing'));st.setProperty('--cur-a',u(CURBLADE,CURPAL.blood,0,0,'crosshair'));
  document.head.insertAdjacentHTML('beforeend',`<style>*{cursor:var(--cur) !important}
button:not(:disabled),a,label,select,summary,input[type=range],input[type=checkbox],.iitem,.tn,.mcheck,.fit,[data-inv],[data-eq],[data-st],[data-close],[data-ash]{cursor:var(--cur-p) !important}
button:not(:disabled) *,label *,.iitem *,.mcheck *,.fit *{cursor:var(--cur-p) !important}
input[type=text],input:not([type]),textarea{cursor:text !important}
body[data-cur=use] canvas#c{cursor:var(--cur-p) !important}body[data-cur=foe] canvas#c{cursor:var(--cur-a) !important}
body[data-cur=hold],body[data-cur=hold] *{cursor:var(--cur-h) !important}</style>`);
  // what lies under the pointer in the world decides its look; asked a few times a second, which is plenty for a pointer
  setInterval(()=>{let k='';if(G.hand)k='hold';else if(G.state==='play'&&P&&!P.dead){try{k=hoverEnemy()?'foe':hoverLabel()||hoverObj()?'use':''}catch(e){}}if(document.body.dataset.cur!==k)document.body.dataset.cur=k},90)}
curInit();
