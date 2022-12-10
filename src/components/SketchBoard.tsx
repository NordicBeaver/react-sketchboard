import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Point, Sketch, SketchLine, SketchLineSegment } from '../domain/Sketch';
import { clamp } from '../util';
import SketchBoardCanvas, { SketchBoardViewport } from './SketchBoardCanvas';

const boardWidth = 400;
const boardHeight = 400;

const zoomMin = 0.5;
const zoomMax = 4;

export interface SketchBoardControls {
  undo: () => void;
}

export interface SketchBoardProps {
  weight: number;
  color: string;
  onControlsChange?: (controls: SketchBoardControls) => void;
}

export default function SketchBoard({ weight, color, onControlsChange }: SketchBoardProps) {
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

  const handleUserDraw = useCallback(
    (from: Point, to: Point) => {
      setSketch((oldSketch) => {
        const fromGlobal: Point = { x: xFromLocal(from.x), y: yFromLocal(from.y) };
        const toGlobal: Point = { x: xFromLocal(to.x), y: yFromLocal(to.y) };
        const newLineSegment = { from: fromGlobal, to: toGlobal, id: nanoid() };
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
        const newLine: SketchLine = { segments: [], weight: weight, color: color };
        const newLines = [...oldSketch.lines, newLine];
        const newSketch = { ...oldSketch, lines: newLines };
        return newSketch;
      });
    },
    [color, weight]
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
              id: nanoid(),
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
      const newZoom = oldZoom * amount;
      const newZoomLimited = clamp(newZoom, zoomMin, zoomMax);
      return newZoomLimited;
    });
  }, []);

  const undo = useCallback(() => {
    setSketch((oldSketch) => {
      const newLines = oldSketch.lines.slice(0, -1);
      const newSketch: Sketch = { ...oldSketch, lines: newLines };
      return newSketch;
    });
  }, []);

  useEffect(() => {
    const controls: SketchBoardControls = {
      undo: undo,
    };
    onControlsChange?.(controls);
  }, [undo, onControlsChange]);

  return (
    <div>
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
