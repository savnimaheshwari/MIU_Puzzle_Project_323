// engine.js: the MIU formal system. Pure logic. No DOM, no React, no three.js.
// The system does not know how it is displayed, just as the MIU system does not
// know what its strings mean until we assign an interpretation.
// Exports: the four rules, Godel numbering (M=3, I=1, U=0, so MI = 31),
// the same rules as arithmetic on numbers, breadth-first derivation, a
// brute-force theorem search, and the I-count (mod 3) invariant.

export const RULES=["axiom","xI → xIU","Mx → Mxx","III → U","UU → (nothing)"];

/* ---------- rule engine (no UI knowledge) ---------- */
export const rule1=s=>s.endsWith("I")?[{i:s.length,s:s+"U"}]:[];
export const rule2=s=>s[0]==="M"?[{i:1,s:s+s.slice(1)}]:[];
export const rule3=s=>{const o=[];for(let i=s.indexOf("III");i>=0;i=s.indexOf("III",i+1))o.push({i,s:s.slice(0,i)+"U"+s.slice(i+3)});return o};
export const rule4=s=>{const o=[];for(let i=s.indexOf("UU");i>=0;i=s.indexOf("UU",i+1))o.push({i,s:s.slice(0,i)+s.slice(i+2)});return o};
export function moves(s){const o=[],seen=new Set();
 [rule1,rule2,rule3,rule4].forEach((f,k)=>f(s).forEach(m=>{const key=(k+1)+":"+m.s;if(!seen.has(key)){seen.add(key);o.push({r:k+1,s:m.s,i:m.i})}}));return o}
/* ---------- Gödel numbering: M=3, I=1, U=0  (MI = 31) ---------- */
export const enc=s=>BigInt(s.replace(/M/g,"3").replace(/I/g,"1").replace(/U/g,"0"));
/* the same four rules as pure arithmetic on the number */
export function numMoves(n){const o=[],L=n.toString().length;
 if(n%10n===1n)o.push([1,n*10n]);
 const p=10n**BigInt(L-1);o.push([2,n*p+n%p]);
 for(let q=0;q<L;q++){const P=10n**BigInt(q);
  if(q+3<=L&&(n/P)%1000n===111n)o.push([3,(n/(P*1000n))*P*10n+n%P]);
  if(q+2<=L&&(n/P)%100n===0n)o.push([4,(n/(P*100n))*P+n%P])}
 return o}

/* ---------- worked arithmetic: shows HOW a rule acts on the number ---------- */
// n = the Godel number before the move (BigInt); i = position (0-based) in the
// string, only needed for rules 3 and 4. Returns {text, result}: the calculation
// written out, and the number it produces (always equal to enc() of the string result).
export function explainMove(rule,n,i=0){
 const L=n.toString().length;
 if(rule===1){const r=n*10n;return{text:n+" × 10 = "+r,result:r}}
 if(rule===2){const k=L-1,p=10n**BigInt(k),x=n%p,r=n*p+x;
  return{text:n+" × 10^"+k+" + ("+n+" mod 10^"+k+") = "+n*p+" + "+x+" = "+r,result:r}}
 const w=rule===3?3:2,q=L-i-w,P=10n**BigInt(q),a=n/(P*10n**BigInt(w)),b=n%P;
 if(rule===3){const r=a*P*10n+b;
  return{text:n+" = "+a+" | 111 | "+b+", so replace 111 by 0: "+a+" × 10^"+(q+1)+" + "+b+" = "+r,result:r}}
 const r=a*P+b;
 return{text:n+" = "+a+" | 00 | "+b+", so delete the 00: "+a+" × 10^"+q+" + "+b+" = "+r,result:r}}
export const iCount=s=>s.split("I").length-1;
export const dec=n=>{const t=n.toString();return/^[310]+$/.test(t)?t.replace(/3/g,"M").replace(/1/g,"I").replace(/0/g,"U"):null};
export function search(target,N,cap=20000){const par=new Map([["MI",null]]);let fr=["MI"],d=0,bad=0;
 const path=x=>{const p=[];for(let c=x;c!==null;){const e=par.get(c);p.unshift({s:c,r:e?e.r:0});c=e?e.p:null}return p};
 if(target==="MI")return{found:true,d:0,path:path("MI"),seen:1,bad};
 while(d<N&&fr.length){const nx=[];d++;
  for(const x of fr)for(const m of moves(x)){if(par.has(m.s))continue;par.set(m.s,{p:x,r:m.r});if(iCount(m.s)%3===0)bad++;
   if(m.s===target)return{found:true,d,path:path(m.s),seen:par.size,bad};
   if(par.size>=cap)return{found:false,capped:true,d,seen:par.size,bad};nx.push(m.s)}fr=nx}
 return{found:false,d,seen:par.size,bad}}
export function runTests(nodes){const T=[],t=(n,f)=>{let ok=false;try{ok=!!f()}catch(e){}T.push([n,ok])};
 t("encode(MI) = 31",()=>enc("MI")===31n);
 t("decode(31) = MI",()=>dec(31n)==="MI");
 t("decode(encode(s)) = s for every node",()=>nodes.every(n=>dec(enc(n.s))===n.s));
 t("arithmetic rules give the same results as string rules, every node",()=>nodes.every(n=>{
  const a=new Set(moves(n.s).map(m=>m.r+":"+enc(m.s))),b=new Set(numMoves(enc(n.s)).map(([r,v])=>r+":"+v));
  return a.size===b.size&&[...a].every(x=>b.has(x))}));
 t("no node has I count ≡ 0 (mod 3)",()=>nodes.every(n=>iCount(n.s)%3!==0));
 t("MU not found within 8 steps",()=>!search("MU",8).found);
 return T}

/* ---------- breadth-first derivation tree (parent + rule stored on every node) ---------- */
export function gen(maxD,maxN){const root={id:0,s:"MI",par:-1,rule:0,d:0,ch:[]},all=[root],seen=new Set(["MI"]);
 for(let i=0;i<all.length&&all.length<maxN;i++){const n=all[i];if(n.d>=maxD)continue;
  for(const m of moves(n.s)){if(all.length>=maxN)break;if(seen.has(m.s))continue;seen.add(m.s);
   const c={id:all.length,s:m.s,par:n.id,rule:m.r,d:n.d+1,ch:[]};n.ch.push(c);all.push(c)}}
 return all}
export const pathTo=(all,id)=>{const p=[];for(let n=all[id];n;n=all[n.par])p.unshift(n);return p};

/* ---------- reading user input as a string or as a Godel number ---------- */
export const parse=t=>{t=t.trim().toUpperCase();
 if(/^\d+$/.test(t)){const s=dec(BigInt(t));return s?{s,n:BigInt(t)}:{err:"Gödel numbers here use only the digits 3, 1 and 0."}}
 if(/^[MIU]+$/.test(t))return{s:t,n:enc(t)};return{err:"Type a string of M, I, U or a Gödel number."}};