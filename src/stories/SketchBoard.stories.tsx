import { Meta } from '@storybook/react';
import { Sketch } from '../components/SketchBoard';
import { SketchBoard } from '../main';

export default {
  title: 'SketchBoard',
  component: SketchBoard,
} as Meta;

export const Primary = () => {
  const sketch: Sketch = {
    lines: [
      {
        from: { x: 10, y: 20 },
        to: { x: 50, y: 40 },
      },
      {
        from: { x: 50, y: 40 },
        to: { x: 120, y: 30 },
      },
      {
        from: { x: 75, y: 69 },
        to: { x: 150, y: 150 },
      },
    ],
  };

  return <SketchBoard sketch={sketch}></SketchBoard>;
};
