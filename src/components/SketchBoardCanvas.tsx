import React, { useCallback, useEffect, useRef } from 'react';
import { Point, Sketch } from '../domain/Sketch';
import { useMouseDrawDetector } from '../hooks/useMouseDrawDetector';
import { useTouchDrawDetector } from '../hooks/useTouchDrawDetector';

function renderSketch(canvas: HTMLCanvasElement, sketch: Sketch, lastDrawnSegmentId: string | null) {
  const context = canvas.getContext('2d')!;

  let foundLastDrawnSegment = false;
  let newLastDrawnSegment: string | null = lastDrawnSegmentId;

  context.save();
  context.lineCap = 'round';
  sketch.lines.forEach((line) => {
    context.strokeStyle = `#${line.color}`;
    context.lineWidth = line.weight;
    line.segments.forEach((segment) => {
      if (!foundLastDrawnSegment && lastDrawnSegmentId !== null) {
        if (segment.id === lastDrawnSegmentId) {
          foundLastDrawnSegment = true;
        }
      } else {
        context.beginPath();
        context.moveTo(segment.from.x, segment.from.y);
        context.lineTo(segment.to.x, segment.to.y);
        context.stroke();
        context.closePath();
        newLastDrawnSegment = segment.id;
      }
    });
  });

  // Redraw all if last drawn segment wasn't found.
  // For example, this can happen if a user pressed Undo.
  if (!foundLastDrawnSegment) {
    console.log('NO LAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
    sketch.lines.forEach((line) => {
      context.strokeStyle = `#${line.color}`;
      context.lineWidth = line.weight;
      line.segments.forEach((segment) => {
        context.beginPath();
        context.moveTo(segment.from.x, segment.from.y);
        context.lineTo(segment.to.x, segment.to.y);
        context.stroke();
        newLastDrawnSegment = segment.id;
        context.closePath();
      });
    });
  }

  context.restore();
  return newLastDrawnSegment;
}

export interface SketchBoardViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SketchBoardCanvasControls {
  getImageDataUrl: () => string;
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
  onControlsChange?: (controls: SketchBoardCanvasControls) => void;
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
  onControlsChange,
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

  const getImageDataUrl = useCallback(() => {
    if (!offscreenCanvasRef.current) {
      throw new Error('Error getting image data from SketchBoardCanvas: No offscreen canvas ref.');
    }

    const dataUrl = offscreenCanvasRef.current.toDataURL();
    return dataUrl;
  }, []);

  useEffect(() => {
    const controls: SketchBoardCanvasControls = {
      getImageDataUrl: getImageDataUrl,
    };
    onControlsChange?.(controls);
  }, [getImageDataUrl, onControlsChange]);

  const animationFrame = useCallback(() => {
    if (shouldRerender.current === true) {
      shouldRerender.current = false;

      const sketch = sketchToRender.current;
      const viewport = viewPortToRender.current;
      const width = widthToRender.current;
      const height = heightToRender.current;

      if (offscreenCanvasRef.current != null) {
        lastDrawnSegmentId.current = renderSketch(offscreenCanvasRef.current, sketch, lastDrawnSegmentId.current);
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

        context.beginPath();
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
