import { rectInsidePolygonAxisAligned, findLargestAxisAlignedRectFromPointPairs, Point } from './largest-rect-points';

const polygon: Point[] = [
  { x: 7, y: 1 },
  { x: 11, y: 1 },
  { x: 11, y: 7 },
  { x: 9, y: 7 },
  { x: 9, y: 5 },
  { x: 2, y: 5 },
  { x: 2, y: 3 },
  { x: 7, y: 3 }
];

const a = { x: 9, y: 5 };
const c = { x: 2, y: 3 };

console.log('Rect corners from points:', a, c);
console.log('Contained?', rectInsidePolygonAxisAligned(a, c, polygon));

// Detailed edge intersection diagnostics
import { rectEdges, polygonEdges, segIntersect } from './largest-rect-points';

const corners = [{ x: Math.min(a.x, c.x), y: Math.min(a.y, c.y) },
                 { x: Math.max(a.x, c.x), y: Math.min(a.y, c.y) },
                 { x: Math.max(a.x, c.x), y: Math.max(a.y, c.y) },
                 { x: Math.min(a.x, c.x), y: Math.max(a.y, c.y) }];

const rEdges = rectEdges(corners);
const pEdges = polygonEdges(polygon);

for (const [ri, [ra, rb]] of rEdges.entries()) {
  for (const [pi, [pa, pb]] of pEdges.entries()) {
    const intersects = segIntersect(ra, rb, pa, pb);
    if (intersects) {
      console.log(`Rect edge ${ri} intersects poly edge ${pi}:`, ra, rb, pa, pb);
    }
  }
}

const best = findLargestAxisAlignedRectFromPointPairs(polygon, polygon);
console.log('Best found by function:', best);
