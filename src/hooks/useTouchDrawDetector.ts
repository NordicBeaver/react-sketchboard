import { useEffect, useRef } from 'react';
import { Point } from '../domain/Sketch';

interface TouchState {
  lastPosition: Point | null;
}

export interface UseTouchDrawDetectorParams {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  onUserStartDrawing?: (point: Point) => void;
  onUserFinishDrawing?: (point: Point) => void;
  onUserDraw?: (from: Point, to: Point) => void;
}

export function useTouchDrawDetector({
  canvasRef,
  onUserStartDrawing,
  onUserFinishDrawing,
  onUserDraw,
}: UseTouchDrawDetectorParams) {
  const touchState = useRef<TouchState>({
    lastPosition: null,
  });

  useEffect(() => {
    if (canvasRef.current != null) {
      const canvas = canvasRef.current;
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const targetCanvas = e.target as HTMLCanvasElement;
        const targetCanvasRect = targetCanvas.getBoundingClientRect();
        const localTouchPoint: Point = {
          x: e.changedTouches[0].clientX - targetCanvasRect.x,
          y: e.changedTouches[0].clientY - targetCanvasRect.y,
        };
        onUserStartDrawing?.(localTouchPoint);
        touchState.current.lastPosition = localTouchPoint;
      };
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [canvasRef, onUserStartDrawing]);

  useEffect(() => {
    if (canvasRef.current != null) {
      const canvas = canvasRef.current;
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        const targetCanvas = e.target as HTMLCanvasElement;
        const targetCanvasRect = targetCanvas.getBoundingClientRect();
        const localTouchPoint: Point = {
          x: e.changedTouches[0].clientX - targetCanvasRect.x,
          y: e.changedTouches[0].clientY - targetCanvasRect.y,
        };
        onUserFinishDrawing?.(localTouchPoint);
        touchState.current.lastPosition = null;
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
        if (touchState.current.lastPosition != null) {
          const targetCanvas = e.target as HTMLCanvasElement;
          const targetCanvasRect = targetCanvas.getBoundingClientRect();
          const localTouchPoint: Point = {
            x: e.changedTouches[0].clientX - targetCanvasRect.x,
            y: e.changedTouches[0].clientY - targetCanvasRect.y,
          };
          onUserDraw?.(touchState.current.lastPosition, localTouchPoint);
          touchState.current.lastPosition = localTouchPoint;
        }
      };
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        canvas.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [canvasRef, onUserDraw]);
}
