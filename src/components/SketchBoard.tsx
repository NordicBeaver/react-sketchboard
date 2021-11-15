import React from 'react';
import { useState } from 'react';
import SketchBoardCanvas, { Point, Sketch, SketchLine } from './SketchBoardCanvas';

export default function SketchBoard() {
  const [sketch, setSketch] = useState<Sketch>({
    lines: [{ from: { x: 10, y: 10 }, to: { x: 20, y: 20 } }],
  });

  const handleUserDraw = (from: Point, to: Point) => {
    const newLine: SketchLine = { from: from, to: to };
    const newLines = [...sketch.lines, newLine];
    const newSketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  return <SketchBoardCanvas sketch={sketch} onUserDraw={handleUserDraw}></SketchBoardCanvas>;
}
