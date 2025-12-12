import { processFile } from "../common-utils";

type Button = {
  position: number
  indicators: number[]
}

type Machine = {
  desiredIndicatorState: boolean[];
  currentIndicatorState: boolean[];
  buttons: Button[];
  counters?: number[];
}

/* Sample input: [.###.#] */
const processIndicators = (indicatorString: string) => {
  // Remove the brackets and convert to boolean array
  return indicatorString.slice(1, -1).split("").map((value) => value === '#');
}

const processMachine = (machine: Machine) => {
  const { desiredIndicatorState, currentIndicatorState, buttons } = machine;
  
  // Solve A x = b over GF(2) where columns of A are buttons and b is desiredIndicatorState
  const n = desiredIndicatorState.length;
  const m = buttons.length;

  // Build row masks: row i has bit j set if button j toggles light i
  const rows: number[] = new Array(n).fill(0);
  const rhs: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    rhs[i] = desiredIndicatorState[i] ? 1 : 0;
  }
  for (let j = 0; j < m; j++) {
    const inds = buttons[j].indicators;
    for (const i of inds) {
      if (j >= 31) throw new Error(`Too many buttons (${m}) to pack into 32-bit mask`);
      rows[i] = rows[i] | (1 << j);
    }
  }

  // Gauss-Jordan elimination over GF(2)
  const pivotRowForCol: number[] = new Array(m).fill(-1);
  let row = 0;
  for (let col = 0; col < m && row < n; col++) {
    // find pivot
    let sel = -1;
    for (let r = row; r < n; r++) {
      if (((rows[r] >> col) & 1) === 1) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    // swap
    if (sel !== row) {
      const tmp = rows[sel]; rows[sel] = rows[row]; rows[row] = tmp;
      const t2 = rhs[sel]; rhs[sel] = rhs[row]; rhs[row] = t2;
    }
    pivotRowForCol[col] = row;
    // eliminate other rows
    for (let r = 0; r < n; r++) {
      if (r !== row && ((rows[r] >> col) & 1) === 1) {
        rows[r] = rows[r] ^ rows[row];
        rhs[r] = rhs[r] ^ rhs[row];
      }
    }
    row++;
  }

  // Check inconsistency: a zero row with rhs 1
  for (let r = 0; r < n; r++) {
    if (rows[r] === 0 && rhs[r] === 1) {
      // no solution
      return Infinity;
    }
  }

  // Build particular solution (set all free vars = 0)
  const xPart: number[] = new Array(m).fill(0);
  for (let col = 0; col < m; col++) {
    const prow = pivotRowForCol[col];
    if (prow !== -1) {
      // pivot row equation: x_col + sum_{free j} a_j x_j = rhs[prow]
      // with free vars = 0 => x_col = rhs[prow]
      xPart[col] = rhs[prow];
    } else {
      xPart[col] = 0; // free variable
    }
  }

  // Collect nullspace basis vectors (one per free column)
  const freeCols: number[] = [];
  for (let col = 0; col < m; col++) if (pivotRowForCol[col] === -1) freeCols.push(col);
  const k = freeCols.length;
  if (k > 28) throw new Error(`Too many free variables (${k}) to enumerate safely`);
  const nullBasis: number[] = [];
  for (let idx = 0; idx < freeCols.length; idx++) {
    const f = freeCols[idx];
    // basis vector v with v[f] = 1 and v[p] = rows[pivotRow][f]
    let mask = 0;
    mask = mask | (1 << f);
    for (let col = 0; col < m; col++) {
      const prow = pivotRowForCol[col];
      if (prow !== -1) {
        if (((rows[prow] >> f) & 1) === 1) {
          mask = mask | (1 << col);
        }
      }
    }
    nullBasis.push(mask);
  }

  // Convert xPart to mask
  let xPartMask = 0;
  for (let j = 0; j < m; j++) if (xPart[j] === 1) xPartMask |= (1 << j);

  // Enumerate nullspace combinations to minimize popcount
  const totalComb = 1 << k;
  let best = Infinity;
  for (let t = 0; t < totalComb; t++) {
    let s = 0;
    for (let bit = 0; bit < k; bit++) {
      if ((t >> bit) & 1) s = s ^ nullBasis[bit];
    }
    const candidate = xPartMask ^ s;
    // popcount
    let c = 0;
    let temp = candidate >>> 0;
    while (temp) {
      c += temp & 1;
      temp = temp >>> 1;
    }
    if (c < best) best = c;
  }
  return best;
}

/** Solve the integer counter problem: each button increments listed counters by 1 per press.
 *  Returns minimal total presses (integer) or Infinity if impossible.
 */
const solveCounters = (buttons: Button[], target: number[]): number => {
  // Use javascript-lp-solver to solve the integer linear program:
  // minimize sum x_j subject to for each i: sum_j A[i,j]*x_j == target[i], x_j >= 0 integer
  // Build model
  // require at runtime to avoid hard dependency in types
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Solver = require('javascript-lp-solver');
  const m = buttons.length;
  const n = target.length;
  const model: any = {
    optimize: 'cost',
    opType: 'min',
    constraints: {},
    variables: {},
    ints: {}
  };

  // constraints names c0..c{n-1}
  for (let i = 0; i < n; i++) {
    model.constraints[`c${i}`] = { equal: target[i] };
  }

  // for each variable (button) define coefficients
  for (let j = 0; j < m; j++) {
    const name = `x${j}`;
    const obj: any = { cost: 1 };
    for (const i of buttons[j].indicators) {
      obj[`c${i}`] = (obj[`c${i}`] ?? 0) + 1;
    }
    model.variables[name] = obj;
    model.ints[name] = 1;
    // lower bound 0 implicit
  }

  // Solve
  try {
    const res = Solver.Solve(model);
    if (!res.feasible) return Infinity;
    // the solver returns objective and variable values
    const objective = res.result;
    // result may be fractional if solver fails; ensure integer
    return Math.round(objective);
  } catch (err: any) {
    // fallback to previous DFS solver if anything goes wrong
    console.error('LP solver error, falling back to DFS:', err && err.message ? err.message : err);
    // fallback simple bounded DFS (previous implementation)
    const sets: number[][] = buttons.map((b) => b.indicators.slice());
    const staticUB = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      if (sets[j].length === 0) staticUB[j] = 0;
      else staticUB[j] = Math.min(...sets[j].map((i) => target[i]));
    }
    const order = Array.from({ length: m }, (_, i) => i).sort((a, b) => sets[b].length - sets[a].length);
    let best = Infinity;
    const counts = new Array(n).fill(0);
    const dfs = (idx: number, sumSoFar: number) => {
      if (sumSoFar >= best) return;
      let maxRem = 0;
      let allZero = true;
      for (let i = 0; i < n; i++) {
        const rem = target[i] - counts[i];
        if (rem > 0) allZero = false;
        if (rem > maxRem) maxRem = rem;
      }
      if (allZero) {
        best = Math.min(best, sumSoFar);
        return;
      }
      if (sumSoFar + maxRem >= best) return;
      if (idx === m) return;
      const j = order[idx];
      let ub = staticUB[j];
      if (ub > 0) {
        ub = Math.min(ub, ...sets[j].map((i) => target[i] - counts[i]));
        if (ub < 0) ub = 0;
      }
      for (let take = ub; take >= 0; take--) {
        if (take > 0) for (const i of sets[j]) counts[i] += take;
        dfs(idx + 1, sumSoFar + take);
        if (take > 0) for (const i of sets[j]) counts[i] -= take;
      }
    };
    dfs(0, 0);
    return best;
  }
};

const processMachineCounters = (machine: Machine) => {
  if (!machine.counters) return Infinity;
  const target = machine.counters;
  const res = solveCounters(machine.buttons, target);
  return res;
};

/** CLI runner when executed directly. */
if (require.main === module) {
  const file = process.argv[2] ?? "2025/day10/day10.input.txt";
  const machines: Machine[] = [];
  (async () => {
    console.log(`Reading lines from: ${file}`);
    await processFile(file, (line, idx) => {
      const machine = new Object() as Machine;
      const lineParts = line.trim().split(/\s+/);
      machine.desiredIndicatorState = processIndicators(lineParts[0]);
      machine.currentIndicatorState = machine.desiredIndicatorState.map(_ => false);
      // buttons are tokens 1..(last-1)
      machine.buttons = lineParts.slice(1, -1).map((buttonStr, index) => {
        // Remove parentheses
        buttonStr = buttonStr.slice(1, -1);
        const inds = buttonStr.length === 0 ? [] : buttonStr.split(",").map((v) => parseInt(v, 10));
        return {
          position: index,
          indicators: inds
        } as Button;
      });
      // parse counters in last token if present (curly braces)
      const last = lineParts[lineParts.length - 1];
      if (last.startsWith('{') && last.endsWith('}')) {
        const inner = last.slice(1, -1).trim();
        machine.counters = inner.length === 0 ? [] : inner.split(',').map(s => parseInt(s.trim(), 10));
      }
      machines.push(machine);
    });
    // Part 1: indicator lights (GF(2))
    const indicatorResults = machines.map((machine) => processMachine(machine));
    const indicatorImpossible = indicatorResults.some((r) => !isFinite(r));
    if (indicatorImpossible) {
      console.log('Part 1: At least one machine has no indicator solution');
    } else {
      const total1 = indicatorResults.reduce((a, b) => a + b, 0 as number);
      console.log('Part 1 - Fewest total button presses (indicators):', total1);
    }

    // Part 2: counters (integer counters, if present)
    const counterResults = machines.map((machine) => processMachineCounters(machine));
    const counterImpossible = counterResults.some((r) => !isFinite(r));
    if (counterImpossible) {
      console.log('Part 2: At least one machine has no counter solution');
    } else {
      const total2 = counterResults.reduce((a, b) => a + b, 0 as number);
      console.log('Part 2 - Fewest total button presses (counters):', total2);
    }
  })().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
