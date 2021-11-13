import React, { useEffect, useRef } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface SketchLine {
  from: Point;
  to: Point;
}

export interface Sketch {
  lines: SketchLine[];
}

export interface SketchBoardProps {
  sketch: Sketch;
}

export default function SketchBoard({ sketch }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef != null) {
      const context = canvasRef.current.getContext('2d');
      sketch.lines.forEach((line) => {
        context.beginPath();
        context.moveTo(line.from.x, line.from.y);
        context.lineTo(line.to.x, line.to.y);
        context.stroke();
      });
    }
  }, [sketch]);

  return <canvas width="400" height="400" ref={canvasRef}></canvas>;
}
