# The MU Puzzle: Inside and Outside a Formal System

An interactive project for the *Gödel, Escher, Bach* final project. It lets you play Hofstadter's MU puzzle, see every string as a Gödel number, and then "step outside" the system to see why MU can never be reached.

**Core idea:** a formal system looks different from inside (mechanically applying rules) than from outside (reasoning about the whole system). The project also shows isomorphism: the same derivation can be read as symbol-shuffling or as arithmetic on numbers.

## How to run

The project is plain HTML and JavaScript modules, with no build step. React and three.js are bundled in `vendor/`, so it works offline.

Browsers block ES modules opened straight from a file, so serve the folder with any local web server, then open the address it prints:

```bash
# option 1 (Python, already installed on most machines)
python3 -m http.server 8000
# then open http://localhost:8000

# option 2 (Node)
npx serve .
```

Use a recent Chrome, Edge, Firefox or Safari with WebGL enabled.

### Run the tests

The logic engine has unit tests that run without a browser (Node 18 or newer):

```bash
npm test
```

There are 17 tests. They cover the four rules, Gödel encoding and decoding, string rules versus arithmetic rules, derivation recovery, the I-count invariant, and the theorem search.

## The puzzle

- One axiom: `MI`.
- Four rules for changing strings of M, I and U:
  1. If a string ends in I, add a U (`xI → xIU`).
  2. If a string starts with M, double everything after it (`Mx → Mxx`).
  3. Replace any `III` with `U`.
  4. Remove any `UU`.
- Question: can you turn `MI` into `MU`?

**Answer: no.** Rule 2 doubles the number of I's, rule 3 removes three, and rules 1 and 4 leave it alone. Starting from one I, the count is never a multiple of 3. `MU` has zero I's, and zero is a multiple of 3.

**Gödel numbering:** M = 3, I = 1, U = 0, so `MI` = 31 and `MU` = 30. Each rule is also arithmetic on the number. For example, rule 1 is `n × 10`. The question becomes: can the arithmetic rules turn 31 into 30?

## What you can do in the app

| Part | What it shows |
|---|---|
| **Intro and tutorial** | A loading screen, then a 6-step tutorial. A gold 3D guide flies to the node each step discusses. A "Tutorial" button replays it. |
| **Play** (mechanical mode) | Start at MI and pick from all four rules. Each shows its string pattern and its arithmetic form, and is greyed out when its pattern isn't in your string. The current string is shown with its digits under each letter. The goal is MU = 30. |
| **Explore** | A circular derivation tree growing outward from MI. Each node shows its string and the rule that made it. Sliders set the depth limit and node cap. Click a node to highlight its derivation back to MI. A "Form / Meaning" button in the header switches every label between strings and Gödel numbers. A theorem checker searches up to N steps for a string or number. "Run tests" checks that string rules and arithmetic rules agree. |
| **Reveal** (stepping outside) | Three steps. M-mode: follow the rules. I-mode: the camera rises and nodes are coloured by I count mod 3, so no node is ever red. U-mode: step outside the game entirely. |
| **Self-portrait** (stretch goal) | The app writes the derivation you are viewing as an MIU string, shows its Gödel number live, and lets you feed that number back into the theorem checker. |

**Controls:** drag to orbit, scroll to zoom, click a node to trace its derivation.

## Project structure

```
mu-puzzle/
  index.html         page shell
  styles.css         all styling
  package.json       npm scripts (test, start)
  src/
    engine.js        THE FORMAL SYSTEM: rules, Gödel numbering, arithmetic rules,
                     breadth-first derivation, theorem search, I-count check.
                     No DOM, React or three.js.
    layout.js        circular positions for tree nodes (display only)
    scene.js         three.js scene: nodes, edges, labels, camera rise, guide
    app.js           React interface: Play, Explore, Reveal, Self-portrait, tutorial
    content.js       explanatory text (Reveal stages, tutorial steps, rule arithmetic)
    common.js        shared helpers and colour tables
    main.js          entry point
  tests/
    engine.test.js   unit tests for engine.js
  vendor/            React 18.3.1, ReactDOM 18.3.1, three.js r128 (MIT licensed)
```

### Why the engine is separate

`engine.js` knows nothing about how it is displayed, just as the MIU system doesn't know what its strings mean until we assign an interpretation. The same engine drives the game, the tree and the self-portrait, and it can be tested on its own. All display code is in `layout.js`, `scene.js` and `app.js`.

### Key algorithms (in `engine.js`)

- **Rules:** `rule1` to `rule4` each return every string that applying that rule once can produce (including every position for rules 3 and 4). `moves(s)` combines them and removes duplicates.
- **Derivation:** `gen(maxDepth, maxNodes)` is a breadth-first search from MI. It uses a duplicate check, a depth limit and a node cap. Each node stores its parent and the rule used, so `pathTo` can recover the full derivation of any theorem.
- **Encoding:** `enc` and `dec` convert between strings and BigInt numbers. `numMoves` implements the four rules purely as arithmetic on the number.
- **Theorem checker:** `search(target, N)` is a brute-force search. It can prove a string is a theorem. For MU it can only say "not found yet". The I-count argument is what proves MU is impossible.
- **Invariant:** `iCount` counts I's. No generated string has a count divisible by 3.

## Known limits

- The tree is a sample of the theorems: depth and node cap are limited, and duplicates are removed.
- The theorem search stops at 10 steps and 20,000 strings.
- Labels longer than 16 characters are shortened with "…".

## Notes on the design

- The proposal planned Unity and C#. This version uses a web framework (React and three.js) instead, so it runs in any browser with no install.
- The proposal says M=1 in one place, but also says `MI` becomes 31. Only M=3, I=1, U=0 gives 31, which is Hofstadter's mapping in Chapter 9.
- The Self-portrait encodes a derivation path as `M` followed by, for each rule k, k I's and a U. This is a design choice made for this project.

## Credits

Based on Douglas Hofstadter, *Gödel, Escher, Bach: An Eternal Golden Braid* (MU puzzle in Chapter 1, Gödel numbering in Chapter 9). Built with React and three.js, both MIT licensed.