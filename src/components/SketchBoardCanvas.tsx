import React, { useEffect, useRef } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface SketchLine {
  from: Point;
  to: Point;
  thickness: number;
  color: string;
}

export interface Sketch {
  lines: SketchLine[];
}

export interface SketchBoardProps {
  sketch: Sketch;
  onUserDraw?: (from: Point, to: Point) => void;
}

interface MouseState {
  isPressed: boolean;
  lastPosition: Point | null;
}

export default function SketchBoardCanvas({ sketch, onUserDraw }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseState = useRef<MouseState>({
    isPressed: false,
    lastPosition: null,
  });

  useEffect(() => {
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      sketch.lines.forEach((line) => {
        context.beginPath();
        context.strokeStyle = `#${line.color}`;
        context.lineWidth = line.thickness;
        context.moveTo(line.from.x, line.from.y);
        context.lineTo(line.to.x, line.to.y);
        context.stroke();
      });
    }
  }, [sketch]);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    mouseState.current.isPressed = true;
  };

  const handleMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    mouseState.current.isPressed = false;
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
      width="400"
      height="400"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
}
