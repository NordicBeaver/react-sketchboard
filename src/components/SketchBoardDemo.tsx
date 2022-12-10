import React, { useCallback, useState } from 'react';
import ColorPicker from './ColorPicker';
import SketchBoard, { SketchBoardControls } from './SketchBoard';
import WeightPicker from './WeightPicker';

const weightOptions = [1, 2, 4, 8];
const colorOptions = ['000000', 'ff0000', '00ff00', '0000ff'];

export default function SketchBoardDemo() {
  const [currentWeight, setCurrentWeight] = useState(2);
  const [currentColor, setCurrentColor] = useState('000000');

  const [boardControls, setBoardControls] = useState<SketchBoardControls | null>(null);

  const hadnleUndoClick = useCallback(() => {
    boardControls?.undo();
  }, [boardControls]);

  return (
    <div>
      <div>
        <button onClick={hadnleUndoClick}>Undo</button>
      </div>
      <WeightPicker
        options={weightOptions}
        current={currentWeight}
        onPick={(thickness) => setCurrentWeight(thickness)}
      ></WeightPicker>
      <ColorPicker
        options={colorOptions}
        current={currentColor}
        onPick={(color) => setCurrentColor(color)}
      ></ColorPicker>
      <SketchBoard weight={currentWeight} color={currentColor} onControlsChange={setBoardControls}></SketchBoard>
    </div>
  );
}
