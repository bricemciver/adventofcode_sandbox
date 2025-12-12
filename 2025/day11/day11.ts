import { processFile } from "../common-utils";

type Graph = Map<string, string[]>;

const parseLine = (line: string): [string, string[]] => {
  const parts = line.split(":");
  const left = parts[0].trim();
  const rights = parts[1] ? parts[1].trim().split(/\s+/).filter(Boolean) : [];
  return [left, rights];
};

const countPaths = (graph: Graph, start: string, target: string): { infinite: boolean; count?: bigint } => {
  // collect nodes
  const nodes = new Set<string>();
  for (const [u, outs] of graph.entries()) {
    nodes.add(u);
    for (const v of outs) nodes.add(v);
  }
  if (!nodes.has(start) || !nodes.has(target)) return { infinite: false, count: BigInt(0) };

  // build reverse graph
  const rev = new Map<string, string[]>();
  for (const n of nodes) rev.set(n, []);
  for (const [u, outs] of graph.entries()) {
    for (const v of outs) {
      if (!rev.has(v)) rev.set(v, []);
      rev.get(v)!.push(u);
    }
  }

  // reverse BFS from target to find nodes that can reach target
  const reachable = new Set<string>();
  const q: string[] = [target];
  reachable.add(target);
  while (q.length) {
    const x = q.pop()!;
    const preds = rev.get(x) || [];
    for (const p of preds) {
      if (!reachable.has(p)) {
        reachable.add(p);
        q.push(p);
      }
    }
  }

  if (!reachable.has(start)) return { infinite: false, count: BigInt(0) };

  // detect cycles in subgraph of reachable nodes reachable from start
  const visiting = new Set<string>();
  const visited = new Set<string>();
  let hasCycle = false;

  const dfsCycle = (u: string) => {
    if (hasCycle) return;
    visiting.add(u);
    const outs = graph.get(u) || [];
    for (const v of outs) {
      if (!reachable.has(v)) continue; // ignore nodes that can't reach target
      if (!visited.has(v)) {
        if (visiting.has(v)) { hasCycle = true; return; }
        dfsCycle(v);
        if (hasCycle) return;
      } else if (visiting.has(v)) {
        hasCycle = true; return;
      }
    }
    visiting.delete(u);
    visited.add(u);
  };

  dfsCycle(start);
  if (hasCycle) return { infinite: true };

  // memoized DFS count using BigInt
  const memo = new Map<string, bigint>();

  const dfsCount = (u: string): bigint => {
    if (u === target) return BigInt(1);
    if (memo.has(u)) return memo.get(u)!;
    let sum = BigInt(0);
    const outs = graph.get(u) || [];
    for (const v of outs) {
      if (!reachable.has(v)) continue;
      sum += dfsCount(v);
    }
    memo.set(u, sum);
    return sum;
  };

  const result = dfsCount(start);
  return { infinite: false, count: result };
};

const countPathsWithRequirements = (
  graph: Graph,
  startPrefix: string,
  target: string,
  required: string[],
): { infinite: boolean; count?: bigint } => {
  // collect nodes
  const nodes = new Set<string>();
  for (const [u, outs] of graph.entries()) {
    nodes.add(u);
    for (const v of outs) nodes.add(v);
  }
  if (!nodes.has(target)) return { infinite: false, count: BigInt(0) };

  // build reverse graph
  const rev = new Map<string, string[]>();
  for (const n of nodes) rev.set(n, []);
  for (const [u, outs] of graph.entries()) {
    for (const v of outs) {
      if (!rev.has(v)) rev.set(v, []);
      rev.get(v)!.push(u);
    }
  }

  // reverse BFS from target to find nodes that can reach target
  const reachable = new Set<string>();
  const q: string[] = [target];
  reachable.add(target);
  while (q.length) {
    const x = q.pop()!;
    const preds = rev.get(x) || [];
    for (const p of preds) {
      if (!reachable.has(p)) {
        reachable.add(p);
        q.push(p);
      }
    }
  }

  // find starts
  const starts: string[] = [];
  for (const n of nodes) {
    if (n.startsWith(startPrefix) && reachable.has(n)) starts.push(n);
  }
  if (starts.length === 0) return { infinite: false, count: BigInt(0) };

  // if any required node is not in reachable, no path can satisfy
  for (const r of required) if (!reachable.has(r)) return { infinite: false, count: BigInt(0) };

  // For each start, detect cycles reachable from that start within reachable-subgraph
  const detectCycleFrom = (start: string): boolean => {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    let hasCycle = false;
    const dfs = (u: string) => {
      if (hasCycle) return;
      visiting.add(u);
      const outs = graph.get(u) || [];
      for (const v of outs) {
        if (!reachable.has(v)) continue;
        if (!visited.has(v)) {
          if (visiting.has(v)) { hasCycle = true; return; }
          dfs(v);
          if (hasCycle) return;
        } else if (visiting.has(v)) { hasCycle = true; return; }
      }
      visiting.delete(u);
      visited.add(u);
    };
    dfs(start);
    return hasCycle;
  };

  for (const s of starts) {
    if (detectCycleFrom(s)) return { infinite: true };
  }

  // DP over (node, mask) where mask tracks which required nodes seen
  const reqIndex = new Map<string, number>();
  required.forEach((r, i) => reqIndex.set(r, i));
  const fullMask = (1 << required.length) - 1;

  const memo = new Map<string, Map<number, bigint>>();

  const dfs = (u: string, mask: number): bigint => {
    // update mask with u
    let curMask = mask;
    const idx = reqIndex.get(u);
    if (idx !== undefined) curMask = mask | (1 << idx);
    if (u === target) return curMask === fullMask ? BigInt(1) : BigInt(0);
    const mm = memo.get(u) ?? new Map<number, bigint>();
    if (mm.has(curMask)) return mm.get(curMask)!;
    let sum = BigInt(0);
    const outs = graph.get(u) || [];
    for (const v of outs) {
      if (!reachable.has(v)) continue;
      sum += dfs(v, curMask);
    }
    mm.set(curMask, sum);
    memo.set(u, mm);
    return sum;
  };

  let total = BigInt(0);
  for (const s of starts) {
    total += dfs(s, 0);
  }
  return { infinite: false, count: total };
};

/** CLI runner */
if (require.main === module) {
  const file = process.argv[2] ?? "2025/day11/day11.input.txt";
  const graph: Graph = new Map();
  (async () => {
    await processFile(file, (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // only accept lines that look like "name: outputs"
      if (!/^\s*[A-Za-z0-9_]+\s*:/.test(trimmed)) return;
      const [left, rights] = parseLine(trimmed);
      graph.set(left, rights);
    });
    const res = countPaths(graph, 'you', 'out');
    if (res.infinite) {
      console.log('Part1: infinite');
    } else {
      console.log('Part1:', String(res.count ?? BigInt(0)));
    }

    // Part 2: paths from 'svr' to 'out' that include both 'dac' and 'fft'
    const res2 = countPathsWithRequirements(graph, 'svr', 'out', ['dac', 'fft']);
    if (res2.infinite) {
      console.log('Part2: infinite');
    } else {
      console.log('Part2:', String(res2.count ?? BigInt(0)));
    }
  })().catch((err) => { console.error(err); process.exit(1); });
}
