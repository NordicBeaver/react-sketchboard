import { useEffect, useRef } from 'react';
import { Point } from '../domain/Sketch';

// For some reason mouse button codes are different whether we're checking
// the .button property or the .buttons property of the event.

const MOUSE_LEFT_BUTTON_CODE = 0;
const MOUSE_MIDDLE_BUTTON_CODE = 1;

const MOUSE_LEFT_BUTTONS_CODE = 1;
const MOUSE_MIDDLE_BUTTONS_CODE = 4;

interface MouseState {
  leftButtonPressed: boolean;
  middleButtonPressed: boolean;
  lastPosition: Point | null;
}

export interface UseMouseDrawDetectorParams {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  onUserStartDrawing?: (point: Point) => void;
  onUserFinishDrawing?: (point: Point) => void;
  onUserDraw?: (from: Point, to: Point) => void;
  onUserPan?: (from: Point, to: Point) => void;
  onUserZoom?: (amount: number) => void;
}
export function useMouseDrawDetector({
  canvasRef,
  onUserStartDrawing,
  onUserFinishDrawing,
  onUserDraw,
  onUserPan,
  onUserZoom,
}: UseMouseDrawDetectorParams) {
  const mouseState = useRef<MouseState>({
    leftButtonPressed: false,
    middleButtonPressed: false,
    lastPosition: null,
  });

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === MOUSE_LEFT_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = true;
      onUserStartDrawing?.({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (e.button === MOUSE_MIDDLE_BUTTON_CODE) {
      e.preventDefault();
      mouseState.current.middleButtonPressed = true;
    }
  };

  const handleMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button === MOUSE_LEFT_BUTTON_CODE) {
      mouseState.current.leftButtonPressed = false;
      onUserFinishDrawing?.({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (e.button === MOUSE_MIDDLE_BUTTON_CODE) {
      mouseState.current.middleButtonPressed = false;
    }
  };

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    // Check if a mouse button was unpressed outside of the element
    if ((e.buttons & MOUSE_LEFT_BUTTONS_CODE) === 0) {
      mouseState.current.leftButtonPressed = false;
    }
    if ((e.buttons & MOUSE_MIDDLE_BUTTONS_CODE) === 0) {
      mouseState.current.middleButtonPressed = false;
    }

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

  // We need to register onWheel this way because we need to set 'passive: false'.
  // Otherwise preventDefault would not work.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas != null) {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const zoom = 1 - e.deltaY / 1000;
          onUserZoom?.(zoom);
        }
      };
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [canvasRef, onUserZoom]);

  return { handleMouseDown, handleMouseUp, handleMouseMove };
}
