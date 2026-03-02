import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';

const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary section layout for section actions.
 */
export const Primary: Story = {
  args: {
    children: 'Primary Section',
  },
};