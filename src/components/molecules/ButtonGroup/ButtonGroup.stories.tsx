import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { ButtonGroup } from './ButtonGroup';

const meta = {
  title: 'Molecules/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['spaced', 'segmented', 'stacked'] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spaced: Story = {
  args: { variant: 'spaced', label: 'Actions', children: null },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="secondary">Draft</Button>
      <Button variant="primary">Publish</Button>
    </ButtonGroup>
  ),
};

export const Segmented: Story = {
  args: { variant: 'segmented', label: 'Calendar views', children: null },
  render: () => {
    const [view, setView] = useState('week');

    return (
      <ButtonGroup variant="segmented">
        <Button variant={view === 'day' ? 'primary' : 'secondary'} onClick={() => setView('day')}>
          Day
        </Button>
        <Button variant={view === 'week' ? 'primary' : 'secondary'} onClick={() => setView('week')}>
          Week
        </Button>
        <Button
          variant={view === 'month' ? 'primary' : 'secondary'}
          onClick={() => setView('month')}
        >
          Month
        </Button>
        <Button variant={view === 'year' ? 'primary' : 'secondary'} onClick={() => setView('year')}>
          Year
        </Button>
      </ButtonGroup>
    );
  },
};

export const Stacked: Story = {
  args: { variant: 'stacked', children: null },
  render: () => (
    <div style={{ width: 280 }}>
      <ButtonGroup variant="stacked">
        <Button variant="primary" fullWidth>
          Continue with Google
        </Button>
        <Button variant="secondary" fullWidth>
          Continue with GitHub
        </Button>
        <Button variant="ghost" fullWidth>
          Sign in with Email
        </Button>
      </ButtonGroup>
    </div>
  ),
};
