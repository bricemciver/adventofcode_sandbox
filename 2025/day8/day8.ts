import { processFile } from "../common-utils";

type Point3D = [number, number, number];
type Span<T> = [T, T];

const distanceBetween3DPoints = (
  pointA: Point3D,
  pointB: Point3D,
): number => {
  const dx = pointA[0] - pointB[0];
  const dy = pointA[1] - pointB[1];
  const dz = pointA[2] - pointB[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const clusterSpans = <T>(
  spans: Span<T>[],
  keyFn: (item: T) => string = (item) => JSON.stringify(item),
  allItems?: T[]
): T[][] =>{
  if (spans.length === 0) return [];
  
  // Build adjacency map using string keys for comparison
  const graph = new Map<string, Set<string>>();
  const keyToItem = new Map<string, T>();
  
  for (const [a, b] of spans) {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    
    // Store original items
    keyToItem.set(keyA, a);
    keyToItem.set(keyB, b);
    
    // Build graph
    if (!graph.has(keyA)) graph.set(keyA, new Set());
    if (!graph.has(keyB)) graph.set(keyB, new Set());
    graph.get(keyA)!.add(keyB);
    graph.get(keyB)!.add(keyA);
  }

  // Ensure items that have no incident spans are still present as isolated nodes
  if (allItems) {
    for (const it of allItems) {
      const k = keyFn(it);
      if (!graph.has(k)) graph.set(k, new Set());
      keyToItem.set(k, it);
    }
  }
  
  // Find connected components using DFS
  const visited = new Set<string>();
  const clusters: T[][] = [];
  
  const dfs = (nodeKey: string, cluster: Set<string>) => {
    if (visited.has(nodeKey)) return;
    visited.add(nodeKey);
    cluster.add(nodeKey);
    
    const neighbors = graph.get(nodeKey);
    if (neighbors) {
      for (const neighbor of neighbors) {
        dfs(neighbor, cluster);
      }
    }
  }
  
  // Start DFS from each unvisited node
  for (const nodeKey of graph.keys()) {
    if (!visited.has(nodeKey)) {
      const cluster = new Set<string>();
      dfs(nodeKey, cluster);
      clusters.push(Array.from(cluster).map(key => keyToItem.get(key)!));
    }
  }
  
  return clusters;
}

/** CLI runner when executed directly. */
if (require.main === module) {
  const file = process.argv[2] ?? "2025/day8/day8.input.txt";
  const lines: string[] = [];
  // Preserve all spans even when distances are identical
  const spansWithDistance: { d: number; span: Span<Point3D> }[] = [];
  (async () => {
    console.log(`Reading lines from: ${file}`);
    await processFile(file, (line, idx) => {
      lines.push(line);
    });
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const pointA = lines[i].split(",").map(Number) as Point3D;
        const pointB = lines[j].split(",").map(Number) as Point3D;
        const distance = distanceBetween3DPoints(pointA, pointB);
        spansWithDistance.push({ d: distance, span: [pointA, pointB] });
      }
    }

    // Sort spans by distance (ascending) while preserving duplicates
    spansWithDistance.sort((a, b) => a.d - b.d);
    const sortedSpans = spansWithDistance.map((e) => e.span);

    const allPoints = lines.map((l) => l.split(",").map(Number) as Point3D);

    // Binary search for the minimal number of smallest spans that yields a single cluster.
    // We reason from the full set (which should be a single cluster) downwards.
    let low = 1;
    let high = sortedSpans.length;
    let bestK = -1;
    let bestClusters: Point3D[][] | undefined;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testSpans = sortedSpans.slice(0, mid);

      const clusters = clusterSpans(testSpans, undefined, allPoints);
      console.log(`Trying top ${mid} spans: found ${clusters.length} clusters.`);

      if (clusters.length === 1) {
        bestK = mid;
        bestClusters = clusters;
        high = mid - 1; // try fewer spans (move downwards)
      } else {
        low = mid + 1; // need more spans to connect into one cluster
      }
    }

    if (bestK === -1 || !bestClusters) {
      console.log("No selection of spans produced a single cluster.");
    } else {
      // Recompute clusters for the best set and compute product of top-three cluster sizes
      const allPoints = lines.map((l) => l.split(",").map(Number) as Point3D);
      const bestSpans = sortedSpans.slice(0, bestK);
      const clusters = clusterSpans(bestSpans, undefined, allPoints);
      clusters.sort((a, b) => b.length - a.length);
      console.log("Minimal spans used:", bestK);
      clusters.forEach((c, idx) => console.log(idx + 1, c));

      // For debugging: check whether the expected point is present in the primary cluster
      const targetA = JSON.stringify([216, 146, 977]);
      const targetB = JSON.stringify([117, 168, 530]);
      const primaryKeys = new Set(clusters[0].map((p) => JSON.stringify(p)));
      console.log('Primary cluster contains 216,146,977?', primaryKeys.has(targetA));
      console.log('Primary cluster contains 117,168,530?', primaryKeys.has(targetB));
      console.log('Last span used: ', spansWithDistance[bestK - 1]);
      console.log('Product of x axis of last span:', spansWithDistance[bestK - 1].span[0][0] * spansWithDistance[bestK - 1].span[1][0]);
    }
  })().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
