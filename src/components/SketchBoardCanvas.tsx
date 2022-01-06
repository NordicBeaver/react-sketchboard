import React, { useCallback, useEffect, useRef } from 'react';
import { Point, Sketch } from '../domain/Sketch';
import { useMouseDrawDetector } from '../hooks/useMouseDrawDetector';
import { useTouchDrawDetector } from '../hooks/useTouchDrawDetector';

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
  onUserStartDrawing?: (point: Point) => void;
  onUserFinishDrawing?: (point: Point) => void;
  onUserPan?: (from: Point, to: Point) => void;
  onUserZoom?: (amount: number) => void;
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
  onUserZoom,
}: SketchBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const animationFrameRequestRef = useRef<number | null>(null);

  const sketchToRender = useRef(sketch);
  useEffect(() => {
    sketchToRender.current = sketch;
  }, [sketch]);

  const heightToRender = useRef(height);
  useEffect(() => {
    heightToRender.current = height;
  }, [height]);

  const widthToRender = useRef(width);
  useEffect(() => {
    widthToRender.current = width;
  }, [width]);

  const viewPortToRender = useRef(viewport);
  useEffect(() => {
    viewPortToRender.current = viewport;
  }, [viewport]);

  const shouldRerender = useRef(true);
  useEffect(() => {
    shouldRerender.current = true;
  }, [sketch, height, width, viewport]);

  const { handleMouseDown, handleMouseUp, handleMouseMove } = useMouseDrawDetector({
    canvasRef: canvasRef,
    onUserStartDrawing: onUserStartDrawing,
    onUserFinishDrawing: onUserFinishDrawing,
    onUserDraw: onUserDraw,
    onUserPan: onUserPan,
    onUserZoom: onUserZoom,
  });

  useTouchDrawDetector({
    canvasRef: canvasRef,
    onUserStartDrawing: onUserStartDrawing,
    onUserFinishDrawing: onUserFinishDrawing,
    onUserDraw: onUserDraw,
    onUserPan: onUserPan,
    onUserZoom: onUserZoom,
  });

  const animationFrame = useCallback(() => {
    if (shouldRerender.current === true) {
      shouldRerender.current = false;

      const sketch = sketchToRender.current;
      const viewport = viewPortToRender.current;
      const width = widthToRender.current;
      const height = heightToRender.current;

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
          context.lineWidth = (line.thickness * (width / viewport.width + height / viewport.height)) / 2;
          context.beginPath();
          line.segments.forEach((segment) => {
            const fromLocal = pointToLocal(segment.from);
            const toLocal = pointToLocal(segment.to);
            context.moveTo(fromLocal.x, fromLocal.y);
            context.lineTo(toLocal.x, toLocal.y);
            context.stroke();
          });
          context.closePath();
        });
        context.restore();
      }
    }

    animationFrameRequestRef.current = requestAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    animationFrameRequestRef.current = requestAnimationFrame(animationFrame);
    return () => {
      if (animationFrameRequestRef.current) {
        cancelAnimationFrame(animationFrameRequestRef.current);
      }
    };
  }, [animationFrame]);

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
