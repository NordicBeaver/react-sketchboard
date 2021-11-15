import React from 'react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';
import SketchBoardCanvas, { Point, Sketch, SketchLine } from './SketchBoardCanvas';

export default function SketchBoard() {
  const [sketch, setSketch] = useState<Sketch>({
    lines: [],
  });

  const colors = ['000000', 'ff0000', '00ff00', '0000ff'];

  const [currentColor, setCurrentColor] = useState('000000');

  const handleUserDraw = (from: Point, to: Point) => {
    const newLine: SketchLine = { from: from, to: to, color: currentColor };
    const newLines = [...sketch.lines, newLine];
    const newSketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  return (
    <div>
      <ColorPicker options={colors} current={currentColor} onPick={(color) => setCurrentColor(color)}></ColorPicker>
      <SketchBoardCanvas sketch={sketch} onUserDraw={handleUserDraw}></SketchBoardCanvas>
    </div>
  );
}
