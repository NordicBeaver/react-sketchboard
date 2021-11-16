export interface Point {
  x: number;
  y: number;
}

export interface SketchLine {
  from: Point;
  to: Point;
  thickness: number;
  color: string;
}

export interface Sketch {
  lines: SketchLine[];
}
