import { Meta } from '@storybook/react';
import { SketchBoard } from '../main';

export default {
  title: 'SketchBoard',
  component: SketchBoard,
} as Meta;

export const Primary = () => {
  return <SketchBoard></SketchBoard>;
};
