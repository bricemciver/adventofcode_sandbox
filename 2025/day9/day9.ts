import { processFile } from "../common-utils";
import { findLargestAxisAlignedRectFromPointPairs } from "./largest-rect-points";

type Point = {
  x: number
  y: number
};

/** CLI runner when executed directly. */
if (require.main === module) {
  const file = process.argv[2] ?? "2025/day9/day9.input.txt";
  const coordinates: Point[] = [];
  (async () => {
    console.log(`Reading lines from: ${file}`);
    await processFile(file, (line, idx) => {
      const [xStr, yStr] = line.split(",").map((s) => s.trim());
      const x = Number(xStr);
      const y = Number(yStr);
      coordinates.push({x, y});
    })
    // Find the largest rectangle inside the polygon created from the coordinates in order
    const points = coordinates.slice();
    const best = findLargestAxisAlignedRectFromPointPairs(points, coordinates, {inclusiveArea:true});
    if (best) {
      console.log('Best area', best.area);
      console.log('Opposite corners A, C:', best.a, best.c);
      console.log('Corners:', best.corners);
    } else {
      console.log('No axis-aligned rectangle found with vertex-diagonals from points');
    }    
  })().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
