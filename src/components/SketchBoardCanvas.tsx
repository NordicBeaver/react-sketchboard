import React, { useEffect, useRef } from 'react';
import { Sketch, Point } from '../domain/Sketch';

const canvasWidth = 400;
const canvasHeight = 400;

export interface SketchBoardProps {
  sketch: Sketch;
  pan: Point;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserStartDrawing?: () => void;
  onUserFinishDrawing?: () => void;
}

interface MouseState {
  isPressed: boolean;
  lastPosition: Point | null;
}

function translate(point: Point, translation: Point) {
  const newPoint: Point = { x: point.x + translation.x, y: point.y + translation.y };
  return newPoint;
}

export default function SketchBoardCanvas({
  sketch,
  pan,
  onUserDraw,
  onUserStartDrawing,
  onUserFinishDrawing,
}: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseState = useRef<MouseState>({
    isPressed: false,
    lastPosition: null,
  });

  useEffect(() => {
    console.log(sketch);
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.lineCap = 'round';
      sketch.lines.forEach((line) => {
        context.strokeStyle = `#${line.color}`;
        context.lineWidth = line.thickness;
        line.segments.forEach((segment) => {
          context.beginPath();
          const fromPanned = translate(segment.from, pan);
          const toPanned = translate(segment.to, pan);
          context.moveTo(fromPanned.x, fromPanned.y);
          context.lineTo(toPanned.x, toPanned.y);
          context.stroke();
        });
      });
    }
  }, [sketch, pan]);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    mouseState.current.isPressed = true;
    onUserStartDrawing?.();
  };

  const handleMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    mouseState.current.isPressed = false;
    onUserFinishDrawing?.();
  };

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const currentPosition: Point = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    if (mouseState.current.isPressed && mouseState.current.lastPosition != null) {
      onUserDraw?.(mouseState.current.lastPosition, currentPosition);
    }
    mouseState.current.lastPosition = currentPosition;
  };

  return (
    <canvas
      width={canvasWidth}
      height={canvasHeight}
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
}
