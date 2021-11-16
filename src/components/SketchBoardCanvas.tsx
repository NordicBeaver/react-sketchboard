import React, { useEffect, useRef } from 'react';
import { Sketch, Point } from '../domain/Sketch';

const canvasWidth = 400;
const canvasHeight = 400;

export interface SketchBoardProps {
  sketch: Sketch;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserStartDrawing?: () => void;
  onUserFinishDrawing?: () => void;
}

interface MouseState {
  isPressed: boolean;
  lastPosition: Point | null;
}

export default function SketchBoardCanvas({
  sketch,
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
          context.moveTo(segment.from.x, segment.from.y);
          context.lineTo(segment.to.x, segment.to.y);
          context.stroke();
        });
      });
    }
  }, [sketch]);

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
