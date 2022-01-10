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

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    offscreenCanvasRef.current = offscreenCanvas;
  }, [width, height]);

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

  const lastDrawnSegmentId = useRef<string | null>(null);

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

      if (offscreenCanvasRef.current != null) {
        const context = offscreenCanvasRef.current.getContext('2d')!;

        let foundLastDrawnSegment = false;

        context.save();
        context.lineCap = 'round';
        sketch.lines.forEach((line) => {
          context.strokeStyle = `#${line.color}`;
          context.lineWidth = line.thickness;
          context.beginPath();
          line.segments.forEach((segment) => {
            if (!foundLastDrawnSegment && lastDrawnSegmentId.current !== null) {
              if (segment.id === lastDrawnSegmentId.current) {
                foundLastDrawnSegment = true;
              }
            } else {
              context.moveTo(segment.from.x, segment.from.y);
              context.lineTo(segment.to.x, segment.to.y);
              context.stroke();
              lastDrawnSegmentId.current = segment.id;
            }
          });
          context.closePath();
        });
        context.restore();
      }

      if (canvasRef.current !== null && offscreenCanvasRef.current !== null) {
        const context = canvasRef.current.getContext('2d')!;

        context.save();

        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        context.scale(canvasRef.current.width / viewport.width, canvasRef.current.height / viewport.height);
        context.translate(-viewport.x, -viewport.y);

        // Show gray background, where the drawing is not allowed
        context.fillStyle = '#cccccc';
        context.fillRect(-width, -height, width * 3, height * 3);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);

        context.rect(0, 0, width, height);
        context.clip();

        context.drawImage(offscreenCanvasRef.current, 0, 0);

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
