import type { Meta, StoryObj } from '@storybook/react-vite';
import { Main } from '@/components/Main';
import { Section } from '@/components/Section';

const meta = {
  title: 'Layouts/Page',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary main layout for main actions.
 */
export const PageLayout: Story = {
  render: () => (
    <Main>
        <Section>
            <h1>Page Layout</h1>
            <p>Test</p>
            <article className="alignfull">
                <p>Test</p>
            </article>
        </Section>
    </Main>
  ),
};