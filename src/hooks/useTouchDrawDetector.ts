import { useEffect, useRef } from 'react';
import { distance, middle, Point } from '../domain/Sketch';

interface SketchBoardTouch {
  id: number;
  point: Point;
}

interface TouchState {
  lastTouches: SketchBoardTouch[];
}

export interface UseTouchDrawDetectorParams {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  onUserStartDrawing?: (point: Point) => void;
  onUserFinishDrawing?: (point: Point) => void;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserPan?: (from: Point, to: Point) => void;
  onUserZoom?: (amount: number) => void;
}

function touchLocalPoint(touch: Touch, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const point: Point = {
    x: touch.clientX - rect.x,
    y: touch.clientY - rect.y,
  };
  return point;
}

function touchesToSketchBoardTouches(touchList: TouchList, element: HTMLElement) {
  const sketchBoardTouches: SketchBoardTouch[] = [];
  for (let i = 0; i < touchList.length; i++) {
    const touch = touchList[i];
    const sketchBoardTouch: SketchBoardTouch = {
      id: touch.identifier,
      point: touchLocalPoint(touch, element),
    };
    sketchBoardTouches.push(sketchBoardTouch);
  }
  return sketchBoardTouches;
}

export function useTouchDrawDetector({
  canvasRef,
  onUserStartDrawing,
  onUserFinishDrawing,
  onUserDraw,
  onUserPan,
  onUserZoom,
}: UseTouchDrawDetectorParams) {
  const touchState = useRef<TouchState>({
    lastTouches: [],
  });

  useEffect(() => {
    if (canvasRef.current != null) {
      const canvas = canvasRef.current;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const targetCanvas = e.target as HTMLCanvasElement;

        const prevTouches = touchState.current.lastTouches;
        const prevTouchesCount = prevTouches.length;
        const currentTouchesCount = e.touches.length;

        if (prevTouchesCount === 0 && currentTouchesCount === 1) {
          const touch = e.touches[0];
          const touchPoint = touchLocalPoint(touch, targetCanvas);
          onUserStartDrawing?.(touchPoint);
        }
        if (prevTouchesCount === 1 && currentTouchesCount > 1) {
          onUserFinishDrawing?.(prevTouches[0].point);
        }

        const currentTouches = touchesToSketchBoardTouches(e.touches, targetCanvas);
        touchState.current.lastTouches = currentTouches;
      };

      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [canvasRef, onUserStartDrawing, onUserFinishDrawing]);

  useEffect(() => {
    if (canvasRef.current != null) {
      const canvas = canvasRef.current;

      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        const targetCanvas = e.target as HTMLCanvasElement;

        const prevTouches = touchState.current.lastTouches;
        const prevTouchesCount = prevTouches.length;
        const currentTouchesCount = e.touches.length;

        if (prevTouchesCount === 1 && currentTouchesCount === 0) {
          onUserFinishDrawing?.(prevTouches[0].point);
        }

        const currentTouches = touchesToSketchBoardTouches(e.touches, targetCanvas);
        touchState.current.lastTouches = currentTouches;
      };

      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      return () => {
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [canvasRef, onUserFinishDrawing]);

  useEffect(() => {
    if (canvasRef.current != null) {
      const canvas = canvasRef.current;

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const targetCanvas = e.target as HTMLCanvasElement;

        const prevTouches = touchState.current.lastTouches;
        const prevTouchesCount = prevTouches.length;
        const currentTouches = touchesToSketchBoardTouches(e.touches, targetCanvas);
        const currentTouchesCount = currentTouches.length;
        if (prevTouchesCount !== currentTouchesCount) {
          console.warn('Touches count changed on touchmove.');
          return;
        }
        if (prevTouchesCount === 1) {
          // Draw
          const currentTouch = e.touches[0];
          const currentTouchPoint = touchLocalPoint(currentTouch, targetCanvas);
          onUserDraw?.(prevTouches[0].point, currentTouchPoint);
          prevTouches[0].point = currentTouchPoint;
        } else if (prevTouchesCount === 2) {
          // Pan & Zoom
          const prevDistance = distance(prevTouches[0].point, prevTouches[1].point);
          const currentDistance = distance(currentTouches[0].point, currentTouches[1].point);
          const zoom = currentDistance / prevDistance;
          onUserZoom?.(zoom);

          const prevMiddlePoint = middle(prevTouches[0].point, prevTouches[1].point);
          const currentMiddlePoint = middle(currentTouches[0].point, currentTouches[1].point);
          onUserPan?.(prevMiddlePoint, currentMiddlePoint);
        }
        touchState.current.lastTouches = currentTouches;
      };
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        canvas.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [canvasRef, onUserDraw, onUserPan, onUserZoom]);
}
