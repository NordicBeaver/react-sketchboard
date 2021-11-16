export interface Point {
  x: number;
  y: number;
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
