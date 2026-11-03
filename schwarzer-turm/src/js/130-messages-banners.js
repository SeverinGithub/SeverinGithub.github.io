/* ---------- messages / banners ---------- */
function log(txt,col){const d=document.createElement('div');d.textContent=txt;if(col)d.style.color=col;$('log').appendChild(d);setTimeout(()=>d.style.opacity='0',4500);setTimeout(()=>d.remove(),5600);while($('log').children.length>6)$('log').firstChild.remove()}
let bannerT=null;
function banner(big,small='',cls='',dur=2600){const b=$('banner');b.className='show '+cls;$('bBig').textContent=big;$('bSmall').textContent=small;clearTimeout(bannerT);bannerT=setTimeout(()=>b.className=cls,dur)}
function ftext(x,y,txt,col,big){G.texts.push({x,y,z:1.2,txt,col,t:0,big,vx:rnd(-.7,.7)})}
function burst(x,y,col,n=10,sp=3,z=.6){for(let k=0;k<n;k++){const a=Math.random()*7;G.fx.push({x,y,z,vx:Math.cos(a)*sp*rnd(.3,1),vy:Math.sin(a)*sp*rnd(.3,1),vz:rnd(1,4),life:rnd(.4,.9),t:0,col,s:rnd(1.5,3.5)})}}

