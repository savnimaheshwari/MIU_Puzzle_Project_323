// Unit tests for the formal-system engine (no browser needed): npm test
import test from "node:test";
import assert from "node:assert/strict";
import {rule1,rule2,rule3,rule4,moves,enc,dec,numMoves,iCount,gen,pathTo,search,runTests,parse} from "../src/engine.js";

const strs=ms=>ms.map(m=>m.s);

test("rule 1: xI -> xIU", ()=>{
  assert.deepEqual(strs(rule1("MI")),["MIU"]);
  assert.deepEqual(rule1("MU"),[]);
});
test("rule 2: Mx -> Mxx", ()=>{
  assert.deepEqual(strs(rule2("MIU")),["MIUIU"]);
  assert.deepEqual(rule2("IM"),[]);
});
test("rule 3: III -> U at every position", ()=>{
  assert.deepEqual(strs(rule3("MIIII")),["MUI","MIU"]);
  assert.deepEqual(rule3("MII"),[]);
});
test("rule 4: UU -> nothing at every position", ()=>{
  assert.deepEqual(strs(rule4("MUUU")),["MU","MU"]);
  assert.deepEqual(rule4("MUIU"),[]);
});
test("moves() removes duplicate results and tags the rule", ()=>{
  const m=moves("MUUU");
  assert.equal(m.filter(x=>x.r===4).length,1);
});

test("Godel numbering: M=3, I=1, U=0, so MI = 31", ()=>{
  assert.equal(enc("MI"),31n);
  assert.equal(enc("MIU"),310n);
  assert.equal(enc("MU"),30n);
});
test("decode inverts encode, and rejects other digits", ()=>{
  assert.equal(dec(31n),"MI");
  assert.equal(dec(32n),null);
  for(const n of gen(5,200)) assert.equal(dec(enc(n.s)),n.s);
});
test("arithmetic rules give exactly the same results as the string rules", ()=>{
  for(const n of gen(5,200)){
    const a=new Set(moves(n.s).map(m=>m.r+":"+enc(m.s)));
    const b=new Set(numMoves(enc(n.s)).map(([r,v])=>r+":"+v));
    assert.deepEqual([...a].sort(),[...b].sort(),n.s);
  }
});

test("a known derivation that unlocks every rule: MI to MII via rule 4", ()=>{
  const steps=[["MI",2,"MII"],["MII",2,"MIIII"],["MIIII",2,"MIIIIIIII"],["MIIIIIIII",3,"MUIIIII"],["MUIIIII",3,"MUUII"],["MUUII",4,"MII"]];
  for(const [from,r,to] of steps) assert.ok(moves(from).some(m=>m.r===r&&m.s===to),from+" -> "+to);
});

test("gen(): respects the depth limit and node cap, no duplicates", ()=>{
  const t=gen(4,50);
  assert.ok(t.length<=50);
  assert.ok(t.every(n=>n.d<=4));
  assert.equal(new Set(t.map(n=>n.s)).size,t.length);
});
test("gen(): every node records its parent and rule, so any derivation can be recovered", ()=>{
  const t=gen(5,150);
  for(const n of t.slice(1)){
    const p=t[n.par];
    assert.ok(moves(p.s).some(m=>m.r===n.rule&&m.s===n.s));
  }
  const last=t[t.length-1],path=pathTo(t,last.id);
  assert.equal(path[0].s,"MI");
  assert.equal(path[path.length-1].s,last.s);
});

test("I-mode invariant: no theorem has an I count divisible by 3", ()=>{
  const t=gen(6,500);
  assert.ok(t.every(n=>iCount(n.s)%3!==0));
  assert.equal(iCount("MU")%3,0);
});

test("theorem search: finds theorems, never finds MU", ()=>{
  const r=search("MIU",3);
  assert.ok(r.found);assert.equal(r.d,1);
  assert.deepEqual(r.path.map(x=>x.s),["MI","MIU"]);
  const mu=search("MU",8);
  assert.equal(mu.found,false);
  assert.equal(mu.bad,0);
});

test("parse(): accepts a string or a Godel number", ()=>{
  assert.equal(parse("mi").n,31n);
  assert.equal(parse("31").s,"MI");
  assert.ok(parse("abc").err);
  assert.ok(parse("32").err);
});

test("built-in self-test suite passes", ()=>{
  const out=runTests(gen(5,150));
  assert.ok(out.every(([,ok])=>ok),JSON.stringify(out.filter(x=>!x[1])));
});
