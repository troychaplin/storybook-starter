import type { Meta, StoryObj } from '@storybook/react-vite';
import { Main } from './Main';

const meta = {
  title: 'Components/Main',
  component: Main,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary main layout for main actions.
 */
export const Primary: Story = {
  args: {
    children: 'Primary Main',
  },
};