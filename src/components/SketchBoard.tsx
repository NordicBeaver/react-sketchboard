import React from 'react';
import { useState } from 'react';
import { Sketch, Point, SketchLine, addPoints, substractPoints } from '../domain/Sketch';
import { clamp } from '../util';
import ColorPicker from './ColorPicker';
import SketchBoardCanvas from './SketchBoardCanvas';
import ThicknessPicker from './ThicknessPicker';

const boardWidth = 400;
const boardHeight = 400;

export default function SketchBoard() {
  const [sketch, setSketch] = useState<Sketch>({
    lines: [],
  });
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

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
    const pan: Point = { x: panX, y: panY };
    const fromPanned = substractPoints(from, pan);
    const toPanned = substractPoints(to, pan);
    const newLineSegment = { from: fromPanned, to: toPanned };
    const lastLine = sketch.lines[sketch.lines.length - 1];
    const newLastLineSegments = [...lastLine.segments, newLineSegment];
    const newLastLine: SketchLine = { ...lastLine, segments: newLastLineSegments };
    const newLines = [...sketch.lines.slice(0, -1), newLastLine];
    const newSketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  const handleUserStartDrawing = () => {
    const newLine: SketchLine = { segments: [], thickness: currentThickness, color: currentColor };
    const newLines = [...sketch.lines, newLine];
    const newSketch = { ...sketch, lines: newLines };
    setSketch(newSketch);
  };

  const handleUserPan = (from: Point, to: Point) => {
    const newPanX = panX - from.x + to.x;
    const newPanXLimited = clamp(newPanX, -boardWidth / 2, boardWidth / 2);
    const newPanY = panY - from.y + to.y;
    const newPanYLimited = clamp(newPanY, -boardHeight / 2, boardHeight / 2);
    setPanX(newPanXLimited);
    setPanY(newPanYLimited);
  };

  return (
    <div>
      <div>
        <button onClick={hadnleUndoClick}>Undo</button>
      </div>
      <input type="range" min="-100" max="100" value={panX} onChange={(e) => setPanX(parseInt(e.target.value))}></input>
      <input type="range" min="-100" max="100" value={panY} onChange={(e) => setPanY(parseInt(e.target.value))}></input>
      <ColorPicker options={colors} current={currentColor} onPick={(color) => setCurrentColor(color)}></ColorPicker>
      <ThicknessPicker
        options={thicknesses}
        current={currentThickness}
        onPick={(thickness) => setCurrentThickness(thickness)}
      ></ThicknessPicker>
      <SketchBoardCanvas
        width={boardWidth}
        height={boardHeight}
        sketch={sketch}
        pan={{ x: panX, y: panY }}
        onUserDraw={handleUserDraw}
        onUserStartDrawing={handleUserStartDrawing}
        onUserPan={handleUserPan}
      ></SketchBoardCanvas>
    </div>
  );
}
