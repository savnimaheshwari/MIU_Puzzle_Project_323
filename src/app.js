// app.js: React interface (Play, Explore, Reveal, Self-portrait, tutorial, intro).
import {h,useState,useMemo,useEffect,useRef,RC,RCs,MC,MCs,short} from "./common.js";
import {RULES,moves,enc,dec,numMoves,explainMove,iCount,search,runTests,gen,pathTo,parse} from "./engine.js";
import {layout} from "./layout.js";
import {Scene} from "./scene.js";
import {FORM,STAGES,TUT} from "./content.js";

function Intro({onStart,onSkip}){const [ready,setReady]=useState(false);useEffect(()=>{const t=setTimeout(()=>setReady(true),1900);return()=>clearTimeout(t)},[]);
 return h("div",{className:"intro",role:"dialog","aria-label":"Introduction"},
  h("div",null,h("span",{className:"fl cM"},"M"),h("span",{className:"fl cI"},"I"),h("span",{className:"fl cU"},"U")),
  h("h1",null,"The MU Puzzle"),h("p",null,"Can you turn MI into MU? Explore a formal system from the inside, then step outside it."),
  ready?h("div",{className:"row",style:{justifyContent:"center"}},h("button",{className:"on",onClick:onStart},"Start the tutorial"),h("button",{onClick:onSkip},"Skip"))
   :h("div",null,h("div",{className:"bar"}),h("p",{style:{marginTop:8}},"Building the derivation tree…")))}
const Mono=({t})=>h("span",null,[...t].map((c,i)=>h("span",{key:i,className:"c"+c},c)));
const Align=({s})=>{const t=[...s].slice(0,18);return h("div",{className:"al"},t.map((c,i)=>h("div",{key:i,className:"alc"},h("span",{className:"c"+c},c),h("span",{className:"c"+c},"310"["MIU".indexOf(c)]))),s.length>18?h("div",{className:"alc"},h("span",null,"…")):null)};
function Steps({items,num}){return h("div",null,items.map((n,i)=>{
 let calc=null;
 if(i&&num){const p=items[i-1],m=moves(p.s).find(x=>x.r===n.r&&x.s===n.s);if(m)calc=explainMove(n.r,enc(p.s),m.i).text}
 return h("div",{className:"step",key:i},
  h("div",{className:"mono"},h(Mono,{t:short(num?enc(n.s).toString():n.s,60)})),
  h("div",{style:{color:"var(--mute)"}},(i?"rule "+n.r+": "+(num?FORM[n.r]:RULES[n.r]):"axiom")+" · I’s: "+iCount(n.s)+" (≡ "+iCount(n.s)%3+")"),
  calc?h("div",{className:"mono",style:{color:"var(--mute)",fontSize:12}},short(calc,150)):null)}))}
function Deriv({nodes,sel,num}){
 if(sel==null||!nodes[sel])return h("p",null,"Click a node to highlight its derivation from MI.");
 return h("div",null,h("h2",null,"Derivation"),h(Steps,{items:pathTo(nodes,sel).map(n=>({s:n.s,r:n.rule})),num}))}

export function App(){
 const [mode,setMode]=useState("explore"),[num,setNum]=useState(false),[depth,setDepth]=useState(4),[cap,setCap]=useState(80),[sel,setSel]=useState(null);
 const [hist,setHist]=useState([{s:"MI",r:0}]),[stage,setStage]=useState(0),[q,setQ]=useState("MU"),[nSteps,setN]=useState(6);
 const [res,setRes]=useState(null),[tests,setTests]=useState(null),[imode,setIm]=useState(false),[loops,setLoops]=useState(0),[tut,setTut]=useState(null),[intro,setIntro]=useState(true);
 const dark=matchMedia("(prefers-color-scheme: dark)").matches;
 const nodes=useMemo(()=>layout(gen(depth,cap)),[depth,cap]);
 const cnt=useMemo(()=>{const c=[0,0,0];nodes.forEach(n=>c[iCount(n.s)%3]++);return c},[nodes]);
 const last=hist[hist.length-1],cur=last.s,mv=moves(cur),lab=x=>num?enc(x).toString():x;
 const P=parse(q),inTree=P.s?nodes.find(n=>n.s===P.s):null;
 const check=()=>{if(P.s)setRes({...search(P.s,nSteps),target:P.s})};
 const verdict=r=>r.found?r.target+" is a theorem: derived in "+r.d+" steps. Searched "+r.seen+" strings; "+r.bad+" had an I count ≡ 0 (mod 3).":
  iCount(r.target)%3===0||r.target[0]!=="M"?"Not a theorem, and never will be: its I count is "+iCount(r.target)+" ≡ "+iCount(r.target)%3+" (mod 3), or it lacks a leading M. Reasoning (I-mode) shows this; searching alone never could.":
  "Not found within "+nSteps+" steps ("+r.seen+" strings searched"+(r.capped?", search cap hit":"")+"). Search can only say “not yet”.";
 const selPath=sel!=null&&nodes[sel]?pathTo(nodes,sel).slice(1).map(n=>n.rule):hist.slice(1).map(x=>x.r);
 const code=selPath.length?"M"+selPath.map(r=>"I".repeat(r)+"U").join(""):"MI",codeNum=enc(code);
 const feed=()=>{const s=dec(codeNum),f=nodes.find(n=>n.s===s);setQ(codeNum.toString());setRes({...search(s,nSteps),target:s});setLoops(loops+1);if(f)setSel(f.id)};
 const legend=ks=>h("div",{className:"lg"},ks.map(k=>h("span",{key:k},h("i",{className:"dot",style:{background:MCs[k]}}),"≡ "+k+" (mod 3): "+cnt[k]+" nodes")));
 const ruleLegend=h("div",{className:"lg"},[1,2,3,4].map(r=>h("span",{key:r},h("i",{className:"dot",style:{background:RCs[r]}}),"rule "+r+": "+RULES[r])));
 let panel;
 if(mode==="play")panel=h("div",null,h("h2",null,"Play: can you reach MU?"),
  h("p",null,"Start at MI and pick a rule. Every string is also a number (Gödel numbering: M=3, I=1, U=0) and every rule is also arithmetic on that number. You are shifting symbols and doing arithmetic at once."),
  h("div",{className:"cur"},h(Align,{s:cur}),
   h("div",{className:"inf"},"Gödel number "+short(enc(cur).toString(),30)+" · goal: MU = 30 · step "+(hist.length-1)+(cur==="MU"?" · reached!":"")),
   last.r?h("div",{className:"inf"},"Last step on numbers (rule "+last.r+"): "+short(explainMove(last.r,enc(hist[hist.length-2].s),last.i).text,150)):null),
  [1,2,3,4].map(r=>{const ms=mv.filter(m=>m.r===r);
   return h("div",{key:r,className:"card"+(ms.length?"":" off"),style:{borderLeftColor:RCs[r]}},
    h("div",{className:"hd"},h("b",{style:{color:RCs[r]}},"Rule "+r),h("span",null,RULES[r])),
    h("div",{className:"why"},"on numbers: "+FORM[r]),
    ms.length?ms.map((m,i)=>h("button",{key:i,className:"mv mono",onClick:()=>setHist([...hist,m])},(r>2?"at "+(m.i+1)+": ":"")+"→ ",h(Mono,{t:short(m.s,18)}),h("span",{style:{color:"var(--mute)"}}," = "+short(enc(m.s).toString(),18)),cur.length<=16?h("div",{className:"why"},explainMove(r,enc(cur),m.i).text):null))
    :h("div",{className:"why"},"Not available: "+["","needs a string ending in I","needs a string starting with M","needs III in the string","needs UU in the string"][r]))}),
  !mv.some(m=>m.r>2)?h("p",null,"Rules 3 and 4 need III or UU. From MI only rules 1 and 2 apply until you build one, for example by doubling with rule 2."):null,
  h("div",{className:"row"},h("button",{onClick:()=>setHist([{s:"MI",r:0}])},"Start over")));
 else if(mode==="explore")panel=h("div",null,h("h2",null,"Explore the derivation tree"),
  h("p",null,"Every node is a theorem and shows the rule that made it. Drag to orbit, scroll to zoom, click a node to trace it back to MI."),
  h("div",{className:"row"},h("span",null,"Depth "+depth),h("input",{type:"range",min:1,max:6,value:depth,"aria-label":"depth limit",onChange:e=>{setDepth(+e.target.value);setSel(null)}})),
  h("div",{className:"row"},h("span",null,"Nodes "+cap),h("input",{type:"range",min:10,max:250,step:10,value:cap,"aria-label":"node cap",onChange:e=>{setCap(+e.target.value);setSel(null)}})),
  h("div",{className:"row"},h("button",{className:imode?"on":"",onClick:()=>setIm(!imode)},"Colour by I count mod 3")),
  imode?legend([1,2,0]):ruleLegend,
  h("div",{className:"box"},h("div",null,"Theorem checker. Enter a string or a Gödel number:"),
   h("div",{className:"row"},h("input",{className:"mono",value:q,"aria-label":"string or number",onChange:e=>{setQ(e.target.value);setRes(null)},style:{flex:1,minWidth:0}})),
   P.err?h("div",{style:{color:"var(--mute)"}},P.err):h("div",{className:"mono",style:{color:"var(--mute)"}},P.s+" ⇄ "+short(P.n.toString(),40)),
   h("div",{className:"row"},h("span",null,"Up to "+nSteps+" steps"),h("input",{type:"range",min:1,max:10,value:nSteps,"aria-label":"search steps",onChange:e=>{setN(+e.target.value);setRes(null)}})),
   h("div",{className:"row"},h("button",{className:"on",disabled:!P.s,onClick:check},"Search"),h("button",{disabled:!inTree,onClick:()=>setSel(inTree.id)},"Highlight in tree")),
   res&&res.target===P.s?h("div",null,h("div",{style:{color:"var(--mute)"}},verdict(res)),res.found?h(Steps,{items:res.path,num}):null):null),
  h("div",{className:"box"},h("div",null,"Engine tests (strings vs Gödel arithmetic, invariant):"),h("div",{className:"row"},h("button",{onClick:()=>setTests(runTests(nodes))},"Run tests")),
   tests?tests.map((t,i)=>h("div",{key:i},(t[1]?"✓ ":"✗ ")+t[0])):null),
  h(Deriv,{nodes,sel,num}));
 else if(mode==="reveal")panel=h("div",null,h("h2",null,STAGES[stage][0]),
  h("div",{className:"note"},STAGES[stage][1]),
  h("div",{className:"row"},h("button",{disabled:!stage,onClick:()=>setStage(stage-1)},"Back"),h("span",{style:{flex:1,textAlign:"center",color:"var(--mute)"}},(stage+1)+" of 3"),h("button",{className:"on",disabled:stage>1,onClick:()=>setStage(stage+1)},"Next")),
  stage>=1?h("div",null,legend([1,2,0]),h("p",null,"Invariant check: "+cnt[0]+" of "+nodes.length+" theorems have an I count ≡ 0 (mod 3)."),
   h("div",{className:"box mono"},"rule 1: n → n",h("br"),"rule 4: n → n",h("br"),"rule 3: n → n − 3 ≡ n",h("br"),"rule 2: n → 2n, so 1 ⇄ 2",h("br"),"0 can never be reached")):ruleLegend,
  h(Deriv,{nodes,sel,num}));
 else panel=h("div",null,h("h2",null,"Self-portrait: a strange loop"),
  h("p",null,"The app describes its own state as an MIU string, Gödel-numbers it live, and lets you feed that number back in as input. The visualization becomes an object inside the system it displays."),
  h("p",null,"State read from "+(sel!=null?"the derivation selected in the tree":"your Play path")+" ("+selPath.length+" steps). Encoding: M, then k I’s and a U for each rule k."),
  h(Align,{s:code}),h("div",{className:"note mono"},codeNum.toString()),
  h("p",null,"I count "+iCount(code)+" ≡ "+iCount(code)%3+" (mod 3)"+(iCount(code)%3===0?": this description can never be a theorem.":".")),
  h("div",{className:"row"},h("button",{className:"on",onClick:feed},"Feed number back in"),h("span",null,"fed back "+loops+"×")),
  res&&res.target?h("div",{className:"box"},verdict(res)):null,
  h("p",null,"If the decoded string is a theorem, it gets selected, the state changes, and the new description is a different number."));
 const T=tut!==null?TUT[tut]:null,tg=T&&T.at?nodes.find(n=>n.s===T.at):null;
 const guide=T?(T.at?(tg?[tg.x,tg.y+2.2,tg.z]:null):[0,9,0]):null;
 if(T)panel=h("div",null,h("h2",null,T.t),h("div",{className:"note"},T.b),T.s?h(Align,{s:T.s}):null,
  h("div",{className:"row"},h("button",{disabled:!tut,onClick:()=>setTut(tut-1)},"Back"),h("span",{style:{flex:1,textAlign:"center",color:"var(--mute)"}},(tut+1)+" of "+TUT.length),
   tut<TUT.length-1?h("button",{className:"on",onClick:()=>setTut(tut+1)},"Next"):h("button",{className:"on",onClick:()=>{setTut(null);setMode("play")}},"Play")),
  h("div",{className:"row"},h("button",{onClick:()=>{setTut(null);setMode("explore")}},"Skip to Explore")));
 const tab=(k,t)=>h("button",{className:mode===k?"on":"",onClick:()=>{setTut(null);setMode(k);if(k==="reveal")setStage(0)}},t);
 const rv=mode==="reveal";
 return h(React.Fragment,null,intro?h(Intro,{onStart:()=>{setIntro(false);setDepth(4);setCap(80);setTut(0)},onSkip:()=>setIntro(false)}):null,
  h("header",null,h("h1",null,"The MU Puzzle"),h("div",{className:"tabs"},tab("play","Play"),tab("explore","Explore"),tab("reveal","Reveal"),tab("self","Self-portrait")),
   h("div",{className:"sp"}),h("button",{onClick:()=>{setDepth(4);setCap(80);setSel(null);setTut(0)}},"Tutorial"),h("button",{className:num?"on":"",onClick:()=>setNum(!num),"aria-pressed":num},num?"Meaning: Gödel numbers":"Form: strings")),
  h("main",null,h(Scene,{nodes,showNum:T?T.n:num,mod:T?T.mod:(rv&&stage>=1)||(mode==="explore"&&imode),sel:T||mode==="play"?null:sel,rise:T?T.rise:(rv?stage:0),onPick:setSel,dark,guide}),h("aside",null,panel)));
}