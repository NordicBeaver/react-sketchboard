import { ComponentMeta, Meta } from '@storybook/react';
import Test from '../components/Test';

export default {
  title: 'Test',
  component: Test,
} as Meta;

export const Primary = () => <Test></Test>;
