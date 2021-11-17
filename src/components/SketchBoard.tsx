import React, { useCallback } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Sketch, Point, SketchLine, addPoints, substractPoints, SketchLineSegment } from '../domain/Sketch';
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
    prevZoom.current = zoom;
    setViewport((oldViewport) => {
      const newWidth = oldViewport.width / zoomUpdate;
      const newHeight = oldViewport.height / zoomUpdate;
      const newX = oldViewport.x - (newWidth - oldViewport.width) / 2;
      const newY = oldViewport.y - (newHeight - oldViewport.height) / 2;
      const newViewport: SketchBoardViewport = { x: newX, y: newY, width: newWidth, height: newHeight };
      return newViewport;
    });
  }, [zoom]);

  const xFromLocal = useCallback((x: number) => (x * viewport.width) / boardWidth + viewport.x, [viewport]);
  const yFromLocal = useCallback((y: number) => (y * viewport.height) / boardHeight + viewport.y, [viewport]);
  const widthFromLocal = (w: number) => (w * viewport.width) / boardWidth;
  const heightFromLocal = (h: number) => (h * viewport.height) / boardHeight;

  const colors = ['000000', 'ff0000', '00ff00', '0000ff'];
  const thicknesses = [1, 2, 4, 8];

  const [currentColor, setCurrentColor] = useState('000000');
  const [currentThickness, setCurrentThickness] = useState(2);

  const hadnleUndoClick = useCallback(() => {
    setSketch((oldSketch) => {
      const newLines = oldSketch.lines.slice(0, -1);
      const newSketch: Sketch = { ...oldSketch, lines: newLines };
      return newSketch;
    });
  }, []);

  const handleUserDraw = useCallback(
    (from: Point, to: Point) => {
      setSketch((oldSketch) => {
        const fromGlobal: Point = { x: xFromLocal(from.x), y: yFromLocal(from.y) };
        const toGlobal: Point = { x: xFromLocal(to.x), y: yFromLocal(to.y) };
        const newLineSegment = { from: fromGlobal, to: toGlobal };
        const lastLine = oldSketch.lines[oldSketch.lines.length - 1];
        const newLastLineSegments = [...lastLine.segments, newLineSegment];
        const newLastLine: SketchLine = { ...lastLine, segments: newLastLineSegments };
        const newLines = [...oldSketch.lines.slice(0, -1), newLastLine];
        const newSketch = { ...oldSketch, lines: newLines };
        return newSketch;
      });
    },
    [xFromLocal, yFromLocal]
  );

  const handleUserStartDrawing = useCallback(
    (point: Point) => {
      setSketch((oldSketch) => {
        const newLine: SketchLine = { segments: [], thickness: currentThickness, color: currentColor };
        const newLines = [...oldSketch.lines, newLine];
        const newSketch = { ...oldSketch, lines: newLines };
        return newSketch;
      });
    },
    [currentColor, currentThickness]
  );

  const handleUserFinishDrawing = useCallback(
    (point: Point) => {
      setSketch((oldSketch) => {
        if (oldSketch.lines.length > 0) {
          const lastLine = oldSketch.lines[oldSketch.lines.length - 1];
          if (lastLine.segments.length == 0) {
            // If on drawing finish last line has not segments, add a 'dot' to it.

            const newSegment: SketchLineSegment = {
              from: { x: xFromLocal(point.x), y: yFromLocal(point.y) },
              to: { x: xFromLocal(point.x), y: yFromLocal(point.y) },
            };
            const newLastLine: SketchLine = { ...lastLine, segments: [newSegment] };
            const newLines = [...oldSketch.lines, newLastLine];
            const newSketch = { ...oldSketch, lines: newLines };
            return newSketch;
          } else {
            return oldSketch;
          }
        } else {
          return oldSketch;
        }
      });
    },
    [xFromLocal, yFromLocal]
  );

  const handleUserPan = useCallback((from: Point, to: Point) => {
    setViewport((oldViewport) => {
      const newViewportX = oldViewport.x - ((to.x - from.x) * oldViewport.width) / boardWidth;
      const newVieportXLimited = clamp(newViewportX, -oldViewport.width / 2, boardWidth - oldViewport.width / 2);
      const newViewportY = oldViewport.y - ((to.y - from.y) * oldViewport.height) / boardHeight;
      const newViewportYLimited = clamp(newViewportY, -oldViewport.height / 2, boardHeight - oldViewport.height / 2);
      const newViewport: SketchBoardViewport = { ...oldViewport, x: newVieportXLimited, y: newViewportYLimited };
      return newViewport;
    });
  }, []);

  const handleUserZoom = useCallback((amount: number) => {
    setZoom((oldZoom) => {
      const newZoom = oldZoom + amount;
      const newZoomLimited = clamp(newZoom, zoomMin, zoomMax);
      return newZoomLimited;
    });
  }, []);

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
        onUserFinishDrawing={handleUserFinishDrawing}
        onUserPan={handleUserPan}
        onUserZoom={handleUserZoom}
      ></SketchBoardCanvas>
    </div>
  );
}
