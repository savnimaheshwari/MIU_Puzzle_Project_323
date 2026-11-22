// content.js: all explanatory text (rule arithmetic, Reveal stages, tutorial steps).
export const FORM=["","n × 10 (append a 0)","n·10^k + (n mod 10^k), k = digits of x","replace the digits 111 by a single 0","delete two adjacent 0 digits"];
export const STAGES=[
["M-mode: follow the rules","Apply rules one after another and watch the tree grow. You could do this forever and still never be sure MU will not turn up: the machine has no way to say “never”."],
["I-mode: notice a pattern","Stop following the rules and look at them. Rules 1 and 4 leave the number of I’s alone, rule 3 removes three, rule 2 doubles it. Colours now show I count mod 3: only blue (1) and orange (2) ever appear. In Gödel numbers an I is the digit 1, and MU is the number 30, which has no 1-digits."],
["U-mode: step outside","U-mode (unmechanical) steps out completely. Instead of asking whether MU is reachable, it questions the game itself: the Zen reply “mu” unasks the question. The camera rising above the tree is that move. From up here the rules are one pattern among many, and the I-mode argument (MU has 0 I’s, and 0 is a multiple of 3) holds at every node, however far the tree grows."]];
export const TUT=[
{t:"Meet MI",b:"The glowing guide is sitting on MI, the one string we are given. Every other string in the system is derived from it by rules, and each node you see is one derived string.",n:false,mod:false,rise:0,at:"MI"},
{t:"Rules grow the tree",b:"Rule 2 doubles everything after the M, so MI becomes MII. Each rule application is one edge. Later you can drag to orbit, scroll to zoom and click any node to trace it back to MI.",n:false,mod:false,rise:0,at:"MII"},
{t:"Strings are numbers",b:"Gödel numbering swaps M, I, U for 3, 1, 0. MI is 31 and MII is 311, and rule 2 on numbers is plain arithmetic: 31 × 10 + 1. Same structure, two readings.",n:true,mod:false,rise:0,at:"MII",s:"MII"},
{t:"Count the I’s",b:"Colour now shows I count mod 3. Rule 2 doubles the count and rule 3 removes three. This node has eight I’s, which is 2 mod 3. Blue is 1, orange is 2, red would be 0.",n:false,mod:true,rise:0,at:"MIIIIIIII"},
{t:"Rise above the tree",b:"Step outside. From up here no node is red: none has an I count divisible by 3. MU has no I’s, so it can never appear. That is the I-mode argument, seen from outside the game.",n:false,mod:true,rise:1,at:null},
{t:"Your turn",b:"Try to reach MU in Play, or explore the tree. You will not get there, and now you know why.",n:false,mod:false,rise:0,at:null}];
