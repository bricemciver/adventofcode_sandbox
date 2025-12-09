type Point = { x: number; y: number };

function orient(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function onSegment(a: Point, b: Point, p: Point) {
  const minX = Math.min(a.x, b.x) - 1e-9;
  const maxX = Math.max(a.x, b.x) + 1e-9;
  const minY = Math.min(a.y, b.y) - 1e-9;
  const maxY = Math.max(a.y, b.y) + 1e-9;
  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
}

export function segIntersect(a: Point, b: Point, c: Point, d: Point) {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);

  if (Math.abs(o1) < 1e-12 && onSegment(a, b, c)) return true;
  if (Math.abs(o2) < 1e-12 && onSegment(a, b, d)) return true;
  if (Math.abs(o3) < 1e-12 && onSegment(c, d, a)) return true;
  if (Math.abs(o4) < 1e-12 && onSegment(c, d, b)) return true;

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

function pointInPolygon(pt: Point, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 0.0) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function rectCornersFromPoints(a: Point, c: Point) {
  const x1 = Math.min(a.x, c.x);
  const x2 = Math.max(a.x, c.x);
  const y1 = Math.min(a.y, c.y);
  const y2 = Math.max(a.y, c.y);
  return [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 }
  ];
}

export function rectEdges(corners: Point[]) {
  const edges: [Point, Point][] = [];
  for (let i = 0; i < corners.length; i++) {
    edges.push([corners[i], corners[(i + 1) % corners.length]]);
  }
  return edges;
}

export function polygonEdges(poly: Point[]) {
  const edges: [Point, Point][] = [];
  for (let i = 0; i < poly.length; i++) {
    edges.push([poly[i], poly[(i + 1) % poly.length]]);
  }
  return edges;
}

// Check containment: rectangle may touch polygon border. We ensure
// - rectangle center is inside polygon (or on boundary), and
// - rectangle edges do not cross polygon edges (touching is allowed).
export function rectInsidePolygonAxisAligned(a: Point, c: Point, poly: Point[]) {
  const corners = rectCornersFromPoints(a, c);
  const center = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };

  // center must be inside or on boundary
  if (!pointInPolygon(center, poly)) return false;
  const rEdges = rectEdges(corners);
  const pEdges = polygonEdges(poly);

  // All rectangle corners must be inside polygon or lie on polygon edges (touching allowed)
  for (const corner of corners) {
    if (pointInPolygon(corner, poly)) continue;
    // check if corner lies on any polygon edge
    const onEdge = pEdges.some(([pa, pb]) => onSegment(pa, pb, corner));
    if (!onEdge) return false;
  }
  const eq = (p: Point, q: Point) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9;

  for (const [ra, rb] of rEdges) {
    for (const [pa, pb] of pEdges) {
      if (!segIntersect(ra, rb, pa, pb)) continue;

      // If intersection is only because a polygon vertex lies on the rectangle edge, allow.
      const polyVertexTouch = onSegment(ra, rb, pa) || onSegment(ra, rb, pb);
      if (polyVertexTouch) continue;

      // If rectangle corner lies exactly on a polygon edge (including interior), allow.
      const rectCornerOnPolyEdge = corners.some(corner => onSegment(pa, pb, corner));
      if (rectCornerOnPolyEdge) continue;

      // If segments are colinear (orientations zero) allow overlaps (touching along an edge).
      const colinear = Math.abs(orient(ra, rb, pa)) < 1e-12 && Math.abs(orient(ra, rb, pb)) < 1e-12;
      if (colinear) continue;

      // Otherwise this is a proper crossing - reject containment.
      return false;
    }
  }

  return true;
}

type RectResult = { a: Point; c: Point; area: number; corners: Point[] } | null;

// Enumerate unordered pairs of points as opposite corners (axis-aligned rectangle)
// and return the largest rectangle contained in polygon.
function findLargestAxisAlignedRectFromPointPairs(
  points: Point[],
  polygon: Point[],
  options?: { inclusiveArea?: boolean }
): RectResult {
  let best: RectResult = null;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const c = points[j];
      if (a.x === c.x && a.y === c.y) continue;

      const corners = rectCornersFromPoints(a, c);
      // Area: default is exclusive grid-area (width * height). If `inclusiveArea` is true,
      // treat integer grid coordinates as inclusive cell counts: (dx+1)*(dy+1).
      const dx = corners[1].x - corners[0].x;
      const dy = corners[3].y - corners[0].y;
      const area = options?.inclusiveArea ? (dx + 1) * (dy + 1) : dx * dy;
      if (area <= 0) continue;

      if (!rectInsidePolygonAxisAligned(a, c, polygon)) continue;

      if (!best || area > best.area) {
        best = { a, c, area, corners };
      }
    }
  }

  return best;
}

// Example usage when run directly
if (require.main === module) {
  // Example polygon (simple nonconvex)
  const polygon: Point[] = [
    { x: 0, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 4 },
    { x: 0, y: 4 }
  ];

  // Use the polygon vertices as candidate opposite-corner points
  const points = polygon.slice();

  const best = findLargestAxisAlignedRectFromPointPairs(points, polygon);
  if (best) {
    console.log('Best area', best.area);
    console.log('Opposite corners A, C:', best.a, best.c);
    console.log('Corners:', best.corners);
  } else {
    console.log('No axis-aligned rectangle found with vertex-diagonals from points');
  }
}

export { Point, findLargestAxisAlignedRectFromPointPairs };
