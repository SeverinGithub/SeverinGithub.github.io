/* ---------- pathfinding ---------- */
function findPath(sx,sy,tx,ty){for(const mg of[24,72]){const p=findPathIn(sx,sy,tx,ty,mg);if(p!==undefined)return p}return null}
// A* inside a box around start and goal, so huge maps cost no more than small ones
function findPathIn(sx,sy,tx,ty,mg){
  const m=G.map,MW=m.w,MH=m.h,TT=(i,j)=>i<0||j<0||i>=MW||j>=MH?0:m.t[j*MW+i];let ti=Math.floor(tx),tj=Math.floor(ty);
  if(!walkT(TT(ti,tj))){let best=null,bd=1e9;for(let dj=-3;dj<=3;dj++)for(let di=-3;di<=3;di++){const i=ti+di,j=tj+dj;if(walkT(TT(i,j))){const d=di*di+dj*dj;if(d<bd){bd=d;best=[i,j]}}}if(!best)return null;[ti,tj]=best;tx=ti+.5;ty=tj+.5}
  const si=Math.floor(sx),sj=Math.floor(sy);if(si===ti&&sj===tj)return[[tx,ty]];
  const x0=Math.max(0,Math.min(si,ti)-mg),y0=Math.max(0,Math.min(sj,tj)-mg),x1=Math.min(MW-1,Math.max(si,ti)+mg),y1=Math.min(MH-1,Math.max(sj,tj)+mg),w=x1-x0+1,h=y1-y0+1;if(w*h>90000)return null;
  const L=(lx,ly)=>m.t[(ly+y0)*MW+lx+x0],start=(sj-y0)*w+(si-x0),goal=(tj-y0)*w+(ti-x0);
  const g=new Float32Array(w*h).fill(1e9),from=new Int32Array(w*h).fill(-1),heap=[];
  const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let s2=k;if(l<heap.length&&heap[l][0]<heap[s2][0])s2=l;if(r<heap.length&&heap[r][0]<heap[s2][0])s2=r;if(s2===k)break;[heap[s2],heap[k]]=[heap[k],heap[s2]];k=s2}}return top};
  const gx=ti-x0,gy=tj-y0,hf=i=>{const dx=Math.abs(i%w-gx),dy=Math.abs(((i/w)|0)-gy);return Math.max(dx,dy)+.41*Math.min(dx,dy)};
  g[start]=0;push(hf(start),start);let n=0,found=false;
  while(heap.length&&n++<30000){const[,c]=pop();if(c===goal){found=true;break}const cx=c%w,cy=(c/w)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const ni=ny*w+nx;if(!walkT(L(nx,ny)))continue;
      if(dx&&dy&&(!walkT(L(nx,cy))||!walkT(L(cx,ny))))continue;const ng=g[c]+(dx&&dy?1.414:1);if(ng<g[ni]){g[ni]=ng;from[ni]=c;push(ng+hf(ni),ni)}}}
  if(!found)return mg>=72?null:undefined;const path=[];let c=goal;while(c!==start&&c>=0){path.push([c%w+x0+.5,((c/w)|0)+y0+.5]);c=from[c]}path.reverse();path[path.length-1]=[tx,ty];return path}
// enemies follow a breadth-first field in an 80x80 window around the hero
const FW=80;
function computeFlow(){const m=G.map,ox=Math.floor(P.x)-FW/2,oy=Math.floor(P.y)-FW/2;G.flowO=[ox,oy];if(!G.flow||G.flow.length!==FW*FW)G.flow=new Int16Array(FW*FW);const fl=G.flow;fl.fill(-1);
  const q=G.flowQ||(G.flowQ=new Int32Array(FW*FW)),TT=(i,j)=>i<0||j<0||i>=m.w||j>=m.h?0:m.t[j*m.w+i],s=(FW/2)*FW+FW/2;let a=0,b=0;fl[s]=0;q[b++]=s;
  while(a<b){const c=q[a++],cx=c%FW,cy=(c/FW)|0,d=fl[c];if(d>30)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=FW||ny>=FW)continue;const ni=ny*FW+nx;if(fl[ni]<0&&walkT(TT(nx+ox,ny+oy))){fl[ni]=d+1;q[b++]=ni}}}}
const flowAt=(i,j)=>{if(!G.flowO)return -1;i-=G.flowO[0];j-=G.flowO[1];return i<0||j<0||i>=FW||j>=FW?-1:G.flow[j*FW+i]};
function flowDir(e){
  const i=Math.floor(e.x),j=Math.floor(e.y),c=flowAt(i,j);if(c<0)return null;let best=null,bd=c;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const v=flowAt(i+dx,j+dy);if(v<0||v>=bd)continue;if(dx&&dy&&(flowAt(i+dx,j)<0||flowAt(i,j+dy)<0))continue;bd=v;best=[i+dx+.5,j+dy+.5]}
  return best}
function moveEnt(e,dx,dy){const nx=e.x+dx;if(free(nx,e.y,e.r*.8))e.x=nx;const ny=e.y+dy;if(free(e.x,ny,e.r*.8))e.y=ny}

