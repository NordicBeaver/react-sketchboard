import React, { useState } from 'react';
import SketchBoard from './SketchBoard';
import WeightPicker from './WeightPicker';

const weightOptions = [1, 2, 4, 8];

export default function SketchBoardDemo() {
  const [currentWeight, setCurrentWeight] = useState(2);

  return (
    <div>
      <WeightPicker
        options={weightOptions}
        current={currentWeight}
        onPick={(thickness) => setCurrentWeight(thickness)}
      ></WeightPicker>
      <SketchBoard weight={currentWeight}></SketchBoard>
    </div>
  );
}
