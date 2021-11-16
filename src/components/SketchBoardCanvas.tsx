import React, { useEffect, useRef } from 'react';
import { Sketch, Point, addPoints, substractPoints, scalePoint } from '../domain/Sketch';

const MOUSE_LEFT_BUTTON_CODE = 0;
const MOUSE_MIDDLE_BUTTON_CODE = 1;

export interface SketchBoardCanvasProps {
  width: number;
  height: number;
  sketch: Sketch;
  pan?: Point;
  zoom?: number;
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
  width,
  height,
  sketch,
  pan = { x: 0, y: 0 },
  zoom = 1,
  onUserDraw,
  onUserStartDrawing,
  onUserFinishDrawing,
  onUserPan,
}: SketchBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseState = useRef<MouseState>({
    leftButtonPressed: false,
    middleButtonPressed: false,
    lastPosition: null,
  });

  useEffect(() => {
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, width, height);

      // Show gray background, where the drawing is not allowed
      context.fillStyle = '#cccccc';
      context.fillRect(-width + pan.x, -height + pan.y, width * 3, height * 3);
      context.fillStyle = '#ffffff';
      context.fillRect(0 + pan.x, 0 + pan.y, width, height);

      context.save();
      context.lineCap = 'round';
      context.rect(0 + pan.x, 0 + pan.y, width, height);
      context.clip();
      sketch.lines.forEach((line) => {
        context.strokeStyle = `#${line.color}`;
        context.lineWidth = line.thickness * zoom;
        context.beginPath();
        line.segments.forEach((segment) => {
          const fromPanned = addPoints(segment.from, pan);
          const fromZoomed = scalePoint(fromPanned, zoom);
          const toPanned = addPoints(segment.to, pan);
          const toZoomed = scalePoint(toPanned, zoom);
          context.moveTo(fromZoomed.x, fromZoomed.y);
          context.lineTo(toZoomed.x, toZoomed.y);
          context.stroke();
        });
      });
      context.restore();

      const data = context.getImageData(0, 0, width, height);
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
      width={width}
      height={height}
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
}
