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

export function scalePoint(point: Point, scalar: number) {
  const result: Point = {
    x: point.x * scalar,
    y: point.y * scalar,
  };
  return result;
}

export function distance(p1: Point, p2: Point) {
  const result = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
  return result;
}

export function middle(p1: Point, p2: Point) {
  const result: Point = {
    x: p1.x + p2.x / 2,
    y: p1.y + p2.y / 2,
  };
  return result;
}

export interface SketchLineSegment {
  from: Point;
  to: Point;
  id: string;
}

export interface SketchLine {
  segments: SketchLineSegment[];
  thickness: number;
  color: string;
}

export interface Sketch {
  lines: SketchLine[];
}
