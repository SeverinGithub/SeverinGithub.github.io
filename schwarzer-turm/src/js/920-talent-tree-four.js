/* ---------- the talent tree grows four branches instead of six: the guardian joins the warrior, the wanderer's packs go to the alchemist ---------- */
{const by=id=>TB.find(b=>b.id===id),kr=by('kr'),ja=by('ja'),al=by('al'),ma=by('ma'),wc=by('wc'),wa=by('wa');
  kr.cl=kr.cl.concat(wc.cl.map(c=>c.n==='Knochenpanzer'?{s:c.s,n:c.n,m:{thorns:20,life:25,dmgred:2}}:c));
  ja.n='Jägerin';ja.cl=ja.cl.concat({s:[{ias:4},{crit:2},{ias:4}],n:'Schattentanz',m:{sk_d_dance:1,ias:8}});
  al.cl=al.cl.concat(wa.cl);ma.cl[0].m={sk_m_bolt:1,spell:12};ma.cl[1].m={sk_m_ring:1,mcost:10};ma.cl[2].m={sk_m_storm:1,cdr:8};
  TB.length=0;TB.push(kr,ja,al,ma);for(const k in TREE)delete TREE[k];TEDGE.length=0;
  const N=TB.length,D=62,R0=110,add=(id,x,y,o)=>TREE[id]=Object.assign({id,x,y,adj:[]},o),link=(a,b)=>{TREE[a].adj.push(b);TREE[b].adj.push(a);TEDGE.push([a,b])};
  const SLOT={1:[[2,1]],2:[[2,-1],[4,1]],3:[[2,-1],[4,1],[6,-1]],4:[[1,-1],[2,1],[4,1],[5,-1]],5:[[1,-1],[2,1],[3,-1],[4,1],[6,-1]],6:[[1,-1],[2,1],[3,-1],[4,1],[5,-1],[6,1]]};
  add('o',0,0,{k:'origin',n:'Ursprung',m:{},b:-1});
  TB.forEach((b,bi)=>{const th=-Math.PI/2+bi*2*Math.PI/N,ax=Math.cos(th),ay=Math.sin(th),px=-ay,py=ax;let prev='o';
    for(let k=0;k<7;k++){const r=R0+k*D,id=b.id+'s'+k;add(id,ax*r,ay*r,{k:'small',b:bi,m:b.spine[k%3]});link(prev,id);prev=id}
    const kr2=R0+7*D+16;add(b.id+'K',ax*kr2,ay*kr2,{k:'key',b:bi,n:b.key.n,m:b.key.m});link(prev,b.id+'K');
    b.cl.forEach((c,ci)=>{const[s,side]=SLOT[b.cl.length][ci],r=R0+s*D;let pr=b.id+'s'+s;
      for(let j=1;j<=4;j++){const al2=r+j*D*.5,pe=side*j*D*.42,id=b.id+'c'+ci+j;add(id,ax*al2+px*pe,ay*al2+py*pe,j<4?{k:'small',b:bi,m:c.s[j-1]}:{k:'not',b:bi,n:c.n,m:c.m});link(pr,id);pr=id}})});
  TB.forEach((b,bi)=>{const c=TB[(bi+1)%N],th=-Math.PI/2+(bi+.5)*2*Math.PI/N,r=(R0+D)*Math.cos(Math.PI/N),id='br'+bi,m={};
    for(const mm of[b.spine[0],c.spine[0]])for(const k in mm)m[k]=(m[k]||0)+Math.ceil(mm[k]*.6);
    add(id,Math.cos(th)*r,Math.sin(th)*r,{k:'small',b:-1,m});link(b.id+'s1',id);link(c.id+'s1',id)})}

