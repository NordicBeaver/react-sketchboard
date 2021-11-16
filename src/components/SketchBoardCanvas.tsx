import React, { useEffect, useRef } from 'react';
import { Sketch, Point, addPoints, substractPoints, scalePoint } from '../domain/Sketch';

const MOUSE_LEFT_BUTTON_CODE = 0;
const MOUSE_MIDDLE_BUTTON_CODE = 1;

export interface SketchBoardViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SketchBoardCanvasProps {
  width: number;
  height: number;
  sketch: Sketch;
  viewport?: SketchBoardViewport;
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
  viewport = { x: 0, y: 0, width: width, height: height },
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

  const xToLocal = (x: number) => ((x - viewport.x) * width) / viewport.width;
  const yToLocal = (y: number) => ((y - viewport.y) * height) / viewport.height;
  const widthToLocal = (w: number) => (w * width) / viewport.width;
  const heightToLocal = (h: number) => (h * height) / viewport.height;

  const pointToLocal = (point: Point) => {
    const result: Point = {
      x: ((point.x - viewport.x) * width) / viewport.width,
      y: ((point.y - viewport.y) * height) / viewport.height,
    };
    return result;
  };

  useEffect(() => {
    if (canvasRef?.current != null) {
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, width, height);

      // Show gray background, where the drawing is not allowed
      context.fillStyle = '#cccccc';
      context.fillRect(xToLocal(-width), yToLocal(-height), widthToLocal(width * 3), heightToLocal(height * 3));
      context.fillStyle = '#ffffff';
      context.fillRect(xToLocal(0), yToLocal(0), widthToLocal(width), heightToLocal(height));

      context.save();
      context.lineCap = 'round';
      context.rect(xToLocal(0), yToLocal(0), widthToLocal(width), heightToLocal(height));
      context.clip();
      sketch.lines.forEach((line) => {
        context.strokeStyle = `#${line.color}`;
        context.beginPath();
        line.segments.forEach((segment) => {
          const fromLocal = pointToLocal(segment.from);
          const toLocal = pointToLocal(segment.to);
          context.moveTo(fromLocal.x, fromLocal.y);
          context.lineTo(toLocal.x, toLocal.y);
          context.stroke();
        });
      });
      context.restore();
    }
  }, [sketch, viewport]);

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
