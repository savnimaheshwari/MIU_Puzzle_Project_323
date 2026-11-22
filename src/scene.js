// scene.js: the three.js view (nodes, edges, labels, proof-path highlight,
// camera rise, 3D tutorial guide). Takes nodes from the engine and draws them.
import {h,useEffect,useRef,RC,MC,short} from "./common.js";
import {enc,iCount,pathTo} from "./engine.js";
export function Scene({nodes,showNum,mod,sel,rise,onPick,dark,guide}){
 const box=useRef(),R=useRef(),pick=useRef(onPick);pick.current=onPick;
 useEffect(()=>{
  const el=box.current,ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
  ren.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(ren.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,500),group=new THREE.Group(),hl=new THREE.Group();
  scene.add(group,hl);
  const pg=new THREE.BufferGeometry(),pp=[];for(let i=0;i<300;i++){const r=60+Math.random()*60,a=Math.random()*6.28,b=Math.acos(2*Math.random()-1);pp.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a))}
  pg.setAttribute("position",new THREE.Float32BufferAttribute(pp,3));scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0x8892b0,size:2,sizeAttenuation:false,transparent:true,opacity:.6})));
  const gg=new THREE.Group(),gr=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,32),new THREE.MeshBasicMaterial({color:0xffd33d}));
  gg.add(new THREE.Mesh(new THREE.OctahedronGeometry(.55),new THREE.MeshBasicMaterial({color:0xffd33d})),gr);gg.visible=false;scene.add(gg);
  const S={ren,scene,cam,group,hl,picks:[],cur:{t:.6,p:1.3,d:30},tgt:{t:.6,p:1.3,d:30},drag:null,gt:null,k:1};R.current=S;
  const size=()=>{const w=el.clientWidth,hh=el.clientHeight;ren.setSize(w,hh,false);cam.aspect=w/hh;cam.updateProjectionMatrix()};
  const ro=new ResizeObserver(size);ro.observe(el);size();
  const cv=ren.domElement,ray=new THREE.Raycaster(),m=new THREE.Vector2();
  cv.onpointerdown=e=>{S.drag={x:e.clientX,y:e.clientY,moved:false};cv.setPointerCapture(e.pointerId)};
  cv.onpointermove=e=>{const d=S.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
   if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;d.x=e.clientX;d.y=e.clientY;
   S.tgt.t-=dx*.008;S.tgt.p=Math.max(.08,Math.min(1.5,S.tgt.p-dy*.006))};
  cv.onpointerup=e=>{const d=S.drag;S.drag=null;if(!d||d.moved)return;
   const r=cv.getBoundingClientRect();m.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
   ray.setFromCamera(m,cam);const hit=ray.intersectObjects(S.picks)[0];pick.current(hit?hit.object.userData.id:null)};
  cv.addEventListener("wheel",e=>{e.preventDefault();S.tgt.d=Math.max(6,Math.min(100,S.tgt.d*(1+e.deltaY*.001)))},{passive:false});
  let raf;const loop=()=>{raf=requestAnimationFrame(loop);
   if(!S.drag)S.tgt.t+=.0008;
   const c=S.cur,t=S.tgt;c.t+=(t.t-c.t)*.06;c.p+=(t.p-c.p)*.04;c.d+=(t.d-c.d)*.04;
   cam.position.set(c.d*Math.sin(c.p)*Math.cos(c.t),c.d*Math.cos(c.p)-1,c.d*Math.sin(c.p)*Math.sin(c.t));
   const k=Math.max(1,c.d/30);if(Math.abs(k-S.k)>.01){S.k=k;S.group.children.forEach(o=>{const b=o.userData.b;if(!b)return;if(o.isSprite)o.scale.set(b[0]*k,b[1]*k,1);else o.scale.setScalar(b*k)})}
   if(S.gt){gg.scale.setScalar(k);gg.visible=true;gg.position.lerp(new THREE.Vector3(S.gt.x,S.gt.y+Math.sin(performance.now()*.004)*.25,S.gt.z),.07);gg.rotation.y+=.03;gr.rotation.x+=.02}else gg.visible=false;
   cam.lookAt(0,-1,0);ren.render(scene,cam)};loop();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();ren.dispose();el.removeChild(cv)}},[]);
 /* rebuild nodes, edges and labels */
 useEffect(()=>{const S=R.current,g=S.group;
  while(g.children.length){const c=g.children.pop();if(c.material){c.material.map&&c.material.map.dispose();c.material.dispose()}c.geometry&&c.geometry.dispose()}
  S.picks=[];const sg=new THREE.SphereGeometry(1,16,12),ep=[];
  nodes.forEach(n=>{
   const col=mod?MC[iCount(n.s)%3]:RC[n.rule];
   const mesh=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:col}));
   mesh.position.set(n.x,n.y,n.z);mesh.scale.setScalar(n.id?.36:.6);mesh.userData.id=n.id;mesh.userData.b=n.id?.36:.6;g.add(mesh);S.picks.push(mesh);
   if(n.par>=0){const p=nodes[n.par];ep.push(p.x,p.y,p.z,n.x,n.y,n.z)}
   const txt=short(showNum?enc(n.s).toString():n.s),cvs=document.createElement("canvas");cvs.width=512;cvs.height=96;
   const x=cvs.getContext("2d");x.font="bold 40px ui-monospace,Menlo,Consolas,monospace";x.textAlign="center";x.textBaseline="middle";
   x.fillStyle=dark?"#e6e9f0":"#1d2330";x.fillText(txt,256,72);x.font="30px ui-monospace,Menlo,monospace";x.fillStyle=dark?"#98a2b3":"#667085";x.fillText(n.rule?"rule "+n.rule:"axiom",256,22);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cvs),transparent:true,depthWrite:false}));
   sp.userData.b=[4,.75];sp.scale.set(4,.75,1);sp.position.set(n.x,n.y+1,n.z);g.add(sp)});
  const eg=new THREE.BufferGeometry();eg.setAttribute("position",new THREE.Float32BufferAttribute(ep,3));
  S.k=0;g.add(new THREE.LineSegments(eg,new THREE.LineBasicMaterial({color:dark?0x667085:0x9ca3af,transparent:true,opacity:.7})))
 },[nodes,showNum,mod,dark]);
 /* proof-path highlight */
 useEffect(()=>{const S=R.current,g=S.hl;while(g.children.length){const c=g.children.pop();c.geometry.dispose();c.material.dispose()}
  if(sel==null||!nodes[sel])return;const p=pathTo(nodes,sel),col=dark?0xffd33d:0xc58a00;
  const lg=new THREE.BufferGeometry().setFromPoints(p.map(n=>new THREE.Vector3(n.x,n.y,n.z)));
  g.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:col})));
  p.forEach(n=>{const s=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.45}));
   s.position.set(n.x,n.y,n.z);s.scale.setScalar(.7);g.add(s)})},[nodes,sel,dark]);
 useEffect(()=>{R.current.gt=guide?new THREE.Vector3(guide[0],guide[1],guide[2]):null},[guide&&guide.join()]);
 /* camera reveal: rise out of the tree and look straight down */
 useEffect(()=>{const S=R.current,md=Math.max(...nodes.map(n=>n.d))*3.4;
  S.tgt.p=rise?.1:1.3;S.tgt.d=rise===2?10+md*2.8:rise?6+md*2.1:12+md*1.3},[rise,nodes]);
 return h("div",{className:"cv",ref:box,role:"img","aria-label":"3D derivation tree of the MIU system"});
}

