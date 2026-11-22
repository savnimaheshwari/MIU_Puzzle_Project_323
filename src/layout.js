// layout.js: display-only. Gives every derivation node an x/y/z position on a
// circular layout (rings by depth, angular wedges by subtree size).
// Kept out of engine.js so the formal system stays free of visual concerns.
export function layout(all){const root=all[0];
 const w=n=>n.w=n.ch.length?n.ch.reduce((a,c)=>a+w(c),0):1;w(root);
 const go=(n,a0,a1)=>{const a=(a0+a1)/2,r=n.d*3.4;n.x=r*Math.cos(a);n.z=r*Math.sin(a);n.y=-n.d*.5;
  let t=a0;for(const c of n.ch){const e=t+(a1-a0)*c.w/n.w;go(c,t,e);t=e}};
 go(root,0,Math.PI*2);return all}
