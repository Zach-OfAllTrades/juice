import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta = {
  title: 'Organisms/Accordion',
  component: Accordion,
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const faqItems = [
  {
    value: 'item-1',
    title: 'What makes this library truly agnostic?',
    content:
      'All styling is controlled through CSS custom properties (:root tokens) and headless primitives. There are no opinionated CSS-in-JS runtimes or Tailwind dependencies.',
  },
  {
    value: 'item-2',
    title: 'How does dead code elimination work?',
    content:
      'The package uses an exports map with independent entry points. Modern bundlers (Vite, Next.js, Rollup) automatically tree-shake unreferenced components.',
  },
  {
    value: 'item-3',
    title: 'Can I override animations for users with reduced motion preferences?',
    content:
      'Yes. All motion tokens automatically zero out when prefers-reduced-motion: reduce is detected in the client browser.',
  },
];

export const SingleCollapsible: Story = {
  args: {
    type: 'single',
    collapsible: true,
    items: faqItems,
    defaultValue: 'item-1',
  },
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <Accordion {...args} />
    </div>
  ),
};

export const MultipleExpandable: Story = {
  args: {
    type: 'multiple',
    items: faqItems,
  },
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <Accordion {...args} />
    </div>
  ),
};
