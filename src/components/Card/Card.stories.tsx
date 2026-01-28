import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'featured'],
      description: 'Visual variant of the card',
    },
    title: {
      control: 'text',
      description: 'Card title displayed in the header',
    },
    children: {
      control: 'text',
      description: 'Main content of the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default card with basic styling.
 */
export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'This is the card content. You can put any content here including text, images, or other components.',
  },
};

/**
 * Featured variant with highlighted styling.
 */
export const Featured: Story = {
  args: {
    title: 'Featured Card',
    children: 'This card uses the featured variant which highlights it with the primary color.',
    variant: 'featured',
  },
};

/**
 * Card with longer content demonstrating paragraph spacing.
 */
export const LongContent: Story = {
  args: {
    title: 'Article Preview',
    children: (
      <>
        <p>
          This is the first paragraph of content. It provides an introduction
          to the topic being discussed in this card.
        </p>
        <p>
          This is a second paragraph that continues the content. The card
          component automatically handles spacing between paragraphs.
        </p>
        <p>
          A third paragraph wraps up the content. This demonstrates how the
          card handles multiple blocks of text.
        </p>
      </>
    ),
  },
};

/**
 * Example showing custom className usage.
 */
export const WithCustomClass: Story = {
  args: {
    title: 'Custom Styled Card',
    children: 'This card has an additional custom class applied.',
    className: 'my-custom-class',
  },
};
