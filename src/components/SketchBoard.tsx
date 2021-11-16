import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Sketch, Point, SketchLine, addPoints, substractPoints } from '../domain/Sketch';
import { clamp } from '../util';
import ColorPicker from './ColorPicker';
import SketchBoardCanvas, { SketchBoardViewport } from './SketchBoardCanvas';
import ThicknessPicker from './ThicknessPicker';

const boardWidth = 400;
const boardHeight = 400;

const zoomMin = 0.5;
const zoomMax = 4;

export default function SketchBoard() {
  const [sketch, setSketch] = useState<Sketch>({
    lines: [],
  });

  const [viewport, setViewport] = useState<SketchBoardViewport>({ x: 0, y: 0, width: boardWidth, height: boardHeight });
  const [zoom, setZoom] = useState(1);
  const prevZoom = useRef(1);

  useEffect(() => {
    const zoomUpdate = zoom / prevZoom.current;
    const newWidth = viewport.width / zoomUpdate;
    const newHeight = viewport.height / zoomUpdate;
    const newX = viewport.x - (newWidth - viewport.width) / 2;
    const newY = viewport.y - (newHeight - viewport.height) / 2;
    const newViewport: SketchBoardViewport = { x: newX, y: newY, width: newWidth, height: newHeight };
    setViewport(newViewport);
    prevZoom.current = zoom;
  }, [zoom]);

  const xFromLocal = (x: number) => (x * viewport.width) / boardWidth + viewport.x;
  const yFromLocal = (y: number) => (y * viewport.height) / boardHeight + viewport.y;
  const widthFromLocal = (w: number) => (w * viewport.width) / boardWidth;
  const heightFromLocal = (h: number) => (h * viewport.height) / boardHeight;

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
    const fromGlobal: Point = { x: xFromLocal(from.x), y: yFromLocal(from.y) };
    const toGlobal: Point = { x: xFromLocal(to.x), y: yFromLocal(to.y) };
    const newLineSegment = { from: fromGlobal, to: toGlobal };
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
    const newViewportX = viewport.x - ((to.x - from.x) * viewport.width) / boardWidth;
    const newVieportXLimited = clamp(newViewportX, -boardWidth / 2, boardWidth / 2);
    const newViewportY = viewport.y - ((to.y - from.y) * viewport.height) / boardHeight;
    const newViewportYLimited = clamp(newViewportY, -boardHeight / 2, boardHeight / 2);
    setViewport({ ...viewport, x: newVieportXLimited, y: newViewportYLimited });
  };

  const handleUserZoom = (amount: number) => {
    const newZoom = zoom + amount;
    const newZoomLimited = clamp(newZoom, zoomMin, zoomMax);
    setZoom(newZoomLimited);
  };

  return (
    <div>
      <div>
        <button onClick={hadnleUndoClick}>Undo</button>
      </div>
      <div>
        <input
          type="range"
          min="-100"
          max="100"
          value={viewport.x}
          onChange={(e) => setViewport({ ...viewport, x: parseInt(e.target.value) })}
        ></input>
        <input
          type="range"
          min="-100"
          max="100"
          value={viewport.y}
          onChange={(e) => setViewport({ ...viewport, y: parseInt(e.target.value) })}
        ></input>
      </div>
      <div>
        <input
          type="range"
          min="0"
          max="100"
          value={zoom * 10}
          onChange={(e) => setZoom(parseInt(e.target.value) / 10)}
        ></input>
      </div>
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
        viewport={viewport}
        onUserDraw={handleUserDraw}
        onUserStartDrawing={handleUserStartDrawing}
        onUserPan={handleUserPan}
        onUserZoom={handleUserZoom}
      ></SketchBoardCanvas>
    </div>
  );
}
