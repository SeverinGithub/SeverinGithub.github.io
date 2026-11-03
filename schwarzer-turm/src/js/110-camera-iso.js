/* ---------- camera / iso ---------- */
let CX=0,CY=0,camX=0,camY=0;
const iso=(x,y)=>[(x-y)*32+CX,(x+y)*16+CY];
function scr2w(sx,sy){const a=(sx-CX)/32,b=(sy-CY)/16;return[(a+b)/2,(b-a)/2]}

