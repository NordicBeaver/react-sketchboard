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
  const [imageDataUrl, setImageDataUrl] = useState<string>('');

  const hadnleUndoClick = useCallback(() => {
    boardControls?.undo();
  }, [boardControls]);

  const handleGetImageDataClick = () => {
    const dataUrl = boardControls?.getImageDataUrl();
    if (dataUrl) {
      setImageDataUrl(dataUrl);
    }
  };

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
      <div>
        <h1>image data</h1>
        <button onClick={handleGetImageDataClick}>Get data</button>
        <p>{imageDataUrl}</p>
      </div>
    </div>
  );
}
