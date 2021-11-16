import React, { useEffect, useRef } from 'react';
import { Sketch, Point, addPoints, substractPoints } from '../domain/Sketch';

const canvasWidth = 400;
const canvasHeight = 400;

const MOUSE_LEFT_BUTTON_CODE = 0;
const MOUSE_MIDDLE_BUTTON_CODE = 1;

export interface SketchBoardProps {
  sketch: Sketch;
  pan: Point;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserStartDrawing?: () => void;
  onUserFinishDrawing?: () => void;
  onUserPan?: (from: Point, to: Point) => void;
}

interface MouseState {
  leftButtonPressed: boolean;
  middleButtonPressed: boolean;
  lastPosition: Point | null;
}

export default function SketchBoardCanvas({
  sketch,
  pan,
  onUserDraw,
  onUserStartDrawing,
  onUserFinishDrawing,
  onUserPan,
}: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseState = useRef<MouseState>({
    leftButtonPressed: false,
    middleButtonPressed: false,
    lastPosition: null,
  });

  useEffect(() => {
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Show gray background, where the drawing is not allowed
      context.fillStyle = '#cccccc';
      context.fillRect(-canvasWidth + pan.x, -canvasHeight + pan.y, canvasWidth * 3, canvasHeight * 3);
      context.fillStyle = '#ffffff';
      context.fillRect(0 + pan.x, 0 + pan.y, canvasWidth, canvasHeight);

      context.save();
      context.lineCap = 'round';
      context.rect(0 + pan.x, 0 + pan.y, canvasWidth, canvasHeight);
      context.clip();
      sketch.lines.forEach((line) => {
        context.strokeStyle = `#${line.color}`;
        context.lineWidth = line.thickness;
        context.beginPath();
        line.segments.forEach((segment) => {
          const fromPanned = addPoints(segment.from, pan);
          const toPanned = addPoints(segment.to, pan);
          context.moveTo(fromPanned.x, fromPanned.y);
          context.lineTo(toPanned.x, toPanned.y);
          context.stroke();
        });
      });
      context.restore();
    }
  }, [sketch, pan]);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === MOUSE_LEFT_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = true;
      onUserStartDrawing?.();
    } else if (e.button === MOUSE_MIDDLE_BUTTON_CODE) {
      e.preventDefault();
      mouseState.current.middleButtonPressed = true;
    }
  };

  const handleMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === MOUSE_LEFT_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = false;
      onUserFinishDrawing?.();
    } else if (e.button === MOUSE_MIDDLE_BUTTON_CODE) {
      mouseState.current.middleButtonPressed = false;
    }
  };

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const currentPosition: Point = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    if (mouseState.current.leftButtonPressed && mouseState.current.lastPosition != null) {
      onUserDraw?.(mouseState.current.lastPosition, currentPosition);
    }
    if (mouseState.current.middleButtonPressed && mouseState.current.lastPosition != null) {
      onUserPan?.(mouseState.current.lastPosition, currentPosition);
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
