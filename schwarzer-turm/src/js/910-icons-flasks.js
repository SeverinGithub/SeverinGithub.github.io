/* ---------- skill icons for the flasks and the oil, painted like the others, once the palette exists ---------- */
const _buildSpritesK=buildSprites;buildSprites=function(){_buildSpritesK();alIcons()};
function alIcons(){const mk=f=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d',{willReadFrequently:true});f(g);quantize(g,32,32);return c.toDataURL()};
  const plate=(g,a,b)=>{const q=g.createRadialGradient(16,14,2,16,16,24);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,32,32);g.fillStyle='#030202';g.fillRect(0,0,32,1);g.fillRect(0,31,32,1);g.fillRect(0,0,1,32);g.fillRect(31,0,1,32);
    g.fillStyle='rgba(255,230,190,.25)';g.fillRect(1,1,30,1);g.fillRect(1,1,1,30);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(1,30,30,1);g.fillRect(30,1,1,30)};
  const glow=(g,x,y,r,c)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,32,32)};
  const flask=(g,c,x=16,y=19,s=1)=>{g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#1a2422';g.beginPath();g.arc(0,2,8,0,7);g.fill();g.fillRect(-3.4,-9,6.8,8);
    g.fillStyle='#a8c8c0';g.beginPath();g.arc(0,2,6.8,0,7);g.fill();g.fillRect(-2.2,-8,4.4,7);const q=g.createLinearGradient(0,0,0,9);q.addColorStop(0,c[0]);q.addColorStop(.4,c[1]);q.addColorStop(1,c[2]);g.fillStyle=q;g.beginPath();g.arc(0,2,6.8,-.15,Math.PI+.15);g.fill();
    g.fillStyle='#8a5a2a';g.fillRect(-2.4,-11,4.8,3);g.fillStyle='#ffffff';g.fillRect(-4,-1,2,2);g.fillRect(-2.6,-6,1,3);g.restore()};
  SKIC.a_fire=mk(g=>{plate(g,'#3a1a08','#080200');glow(g,16,18,14,'rgba(255,140,50,.6)');flask(g,FLC.fire);g.fillStyle='#ffd070';for(const[x,h]of[[10,6],[16,9],[22,6]]){g.beginPath();g.moveTo(x-2.5,10);g.quadraticCurveTo(x,10-h,x+.5,10-h-2);g.quadraticCurveTo(x+2,7-h*.4,x+2.5,10);g.fill()}});
  SKIC.a_frost=mk(g=>{plate(g,'#0e2238','#02060c');glow(g,16,18,14,'rgba(150,210,255,.6)');g.strokeStyle='#e8f8ff';g.lineWidth=1.4;g.beginPath();g.arc(16,19,12.5,0,7);g.stroke();flask(g,FLC.frost,16,19,.85)});
  SKIC.a_heal=mk(g=>{plate(g,'#2a2208','#060402');glow(g,16,16,15,'rgba(255,230,140,.6)');flask(g,FLC.heal);g.fillStyle='#fff8d0';g.fillRect(14.5,15,3,9);g.fillRect(11.5,18,9,3)});
  SKIC.a_plague=mk(g=>{plate(g,'#14280a','#030601');glow(g,16,20,15,'rgba(150,230,90,.6)');for(const[x,y,r]of[[9,9,4],[16,6,5],[23,9,4]]){g.fillStyle='rgba(150,220,90,.55)';g.beginPath();g.arc(x,y,r,0,7);g.fill()}flask(g,FLC.poison,16,21,.95)});
  SKIC.a_oil=mk(g=>{plate(g,'#2a1c10','#060302');glow(g,16,16,15,'rgba(255,220,160,.45)');ELK.forEach((k,i)=>{g.fillStyle=EL[k].c[1];g.beginPath();g.arc(9+i*4.6,24-((i%2)*2),2.2,0,7);g.fill()});
    g.strokeStyle='#d8c8a8';g.lineWidth=2;g.beginPath();g.moveTo(6,26);g.lineTo(24,8);g.stroke();g.fillStyle='#e8e8f0';g.beginPath();g.moveTo(27,5);g.lineTo(20,8);g.lineTo(24,12);g.fill();g.fillStyle='#8a3a2a';g.fillRect(5,24,4,4)})}

