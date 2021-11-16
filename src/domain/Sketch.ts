export interface Point {
  x: number;
  y: number;
}

export function addPoints(p1: Point, p2: Point) {
  const result: Point = {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
  return result;
}

export function substractPoints(p1: Point, p2: Point) {
  const result: Point = {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
  return result;
}

export interface SketchLineSegment {
  from: Point;
  to: Point;
}

export interface SketchLine {
  segments: SketchLineSegment[];
  thickness: number;
  color: string;
}

export interface Sketch {
  lines: SketchLine[];
}
