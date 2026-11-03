/* ---------- utils ---------- */
let R=Math.random;
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd=(a,b)=>a+R()*(b-a),rint=(a,b)=>Math.floor(a+R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,hyp=Math.hypot;
function wpick(l){let s=0;for(const x of l)s+=x[1];let r=R()*s;for(const x of l){r-=x[1];if(r<=0)return x[0]}return l[0][0]}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
const roman=n=>['','I','II','III','IV','V','VI','VII','VIII','IX','X'][n]||String(n);

