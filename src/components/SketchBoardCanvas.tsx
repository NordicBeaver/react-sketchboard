import React, { useEffect, useRef } from 'react';
import { Sketch, Point, addPoints, substractPoints } from '../domain/Sketch';

const canvasWidth = 400;
const canvasHeight = 400;

const LEFT_MOUSE_BUTTON_CODE = 0;
const MIDDLE_MOUSE_BUTTON_CODE = 1;

export interface SketchBoardProps {
  sketch: Sketch;
  pan: Point;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserStartDrawing?: () => void;
  onUserFinishDrawing?: () => void;
}

interface MouseState {
  leftButtonPressed: boolean;
  lastPosition: Point | null;
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
    leftButtonPressed: false,
    lastPosition: null,
  });

  useEffect(() => {
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.lineCap = 'round';
      sketch.lines.forEach((line) => {
        context.strokeStyle = `#${line.color}`;
        context.lineWidth = line.thickness;
        line.segments.forEach((segment) => {
          context.beginPath();
          const fromPanned = addPoints(segment.from, pan);
          const toPanned = addPoints(segment.to, pan);
          context.moveTo(fromPanned.x, fromPanned.y);
          context.lineTo(toPanned.x, toPanned.y);
          context.stroke();
        });
      });
    }
  }, [sketch, pan]);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === LEFT_MOUSE_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = true;
      onUserStartDrawing?.();
    }
  };

  const handleMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === LEFT_MOUSE_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = false;
      onUserFinishDrawing?.();
    }
  };

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const currentPosition: Point = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    const currentPositionPanned = substractPoints(currentPosition, pan);
    if (mouseState.current.leftButtonPressed && mouseState.current.lastPosition != null) {
      onUserDraw?.(mouseState.current.lastPosition, currentPositionPanned);
    }
    mouseState.current.lastPosition = currentPositionPanned;
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
