import React from 'react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';
import SketchBoardCanvas, { Point, Sketch, SketchLine } from './SketchBoardCanvas';
import ThicknessPicker from './ThicknessPicker';

export default function SketchBoard() {
  const [sketch, setSketch] = useState<Sketch>({
    lines: [],
  });

  const colors = ['000000', 'ff0000', '00ff00', '0000ff'];
  const thicknesses = [1, 2, 4, 8];

  const [currentColor, setCurrentColor] = useState('000000');
  const [currentThickness, setCurrentThickness] = useState(2);

  const hadnleUndoClick = () => {
    const newLines = sketch.lines.slice(0, -1);
    const newSketch: Sketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  const handleUserDraw = (from: Point, to: Point) => {
    const newLine: SketchLine = { from: from, to: to, thickness: currentThickness, color: currentColor };
    const newLines = [...sketch.lines, newLine];
    const newSketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  return (
    <div>
      <button onClick={hadnleUndoClick}>Undo</button>
      <ColorPicker options={colors} current={currentColor} onPick={(color) => setCurrentColor(color)}></ColorPicker>
      <ThicknessPicker
        options={thicknesses}
        current={currentThickness}
        onPick={(thickness) => setCurrentThickness(thickness)}
      ></ThicknessPicker>
      <SketchBoardCanvas sketch={sketch} onUserDraw={handleUserDraw}></SketchBoardCanvas>
    </div>
  );
}
