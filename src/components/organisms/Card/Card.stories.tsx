import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Card } from './Card';

const meta = {
  title: 'Organisms/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outline', 'raised', 'flat'] },
    interactive: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  args: { variant: 'outline', children: null },
  render: (args) => (
    <div style={{ width: 340 }}>
      <Card {...args}>
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Card.Title>Agnostic Design System</Card.Title>
            <Badge variant="success" dot>
              Active
            </Badge>
          </div>
          <Card.Description>Zero-bloat React primitives for web apps.</Card.Description>
        </Card.Header>
        <Card.Body>
          <p>
            Build accessible, high-performance UI components with headless Radix logic and pure CSS
            custom properties.
          </p>
        </Card.Body>
        <Card.Footer>
          <Button variant="ghost">Learn More</Button>
          <Button variant="primary">Get Started</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const RaisedWithMedia: Story = {
  args: { variant: 'raised', interactive: true, children: null },
  render: (args) => (
    <div style={{ width: 340 }}>
      <Card {...args}>
        <Card.Media
          style={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(230 85% 60%), hsl(260 85% 55%))',
            color: 'white',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em' }}>
            JUICE UI
          </span>
        </Card.Media>
        <Card.Header>
          <Card.Title>Vite Library Mode</Card.Title>
          <Card.Description>Multi-entry ESM & CJS distribution</Card.Description>
        </Card.Header>
        <Card.Body>
          <p>Tree-shakeable architecture ensures your bundle only pays for what it renders.</p>
        </Card.Body>
        <Card.Footer>
          <Button variant="secondary" fullWidth>
            View Documentation
          </Button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const Flat: Story = {
  args: { variant: 'flat', children: null },
  render: (args) => (
    <div style={{ width: 340 }}>
      <Card {...args}>
        <Card.Header>
          <Card.Title>Quick Start Guide</Card.Title>
          <Card.Description>Installation and setup instructions</Card.Description>
        </Card.Header>
        <Card.Body>
          <pre
            style={{
              backgroundColor: 'var(--juice-color-bg-muted)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontFamily: 'var(--juice-font-mono)',
            }}
          >
            npm install @zach-ofalltrades/juice
          </pre>
        </Card.Body>
      </Card>
    </div>
  ),
};
