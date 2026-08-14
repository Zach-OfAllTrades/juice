import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Card } from '../../organisms/Card';
import { ButtonGroup } from '../ButtonGroup';
import { Row } from './Row';

const meta = {
  title: 'Molecules/Row',
  component: Row,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    meta: { control: 'text' },
  },
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Finish quarterly report',
    meta: 'Due tomorrow',
  },
  render: (args) => (
    <div style={{ width: '28rem' }}>
      <Row
        {...args}
        actions={
          <ButtonGroup variant="spaced">
            <Button variant="ghost" size="sm">
              Snooze
            </Button>
            <Button variant="danger-ghost" size="sm">
              Delete
            </Button>
          </ButtonGroup>
        }
      />
    </div>
  ),
};

export const WithExtraContent: Story = {
  args: {
    title: 'Ship the release notes',
    meta: 'Assigned to Priya',
  },
  render: (args) => (
    <div style={{ width: '28rem' }}>
      <Row
        {...args}
        actions={
          <Button variant="primary" size="sm">
            Complete
          </Button>
        }
      >
        <Badge variant="warning">Blocked</Badge>
      </Row>
    </div>
  ),
};

export const StackedList: Story = {
  args: { children: null },
  render: () => (
    <div style={{ width: '28rem' }}>
      <Row
        title="Write onboarding docs"
        meta="Due Friday"
        actions={
          <Button variant="ghost" size="sm">
            Snooze
          </Button>
        }
      />
      <Row
        title="Review pull request #482"
        meta="Due today"
        actions={
          <Button variant="ghost" size="sm">
            Snooze
          </Button>
        }
      />
      <Row
        title="Plan Q3 roadmap"
        meta="No due date"
        actions={
          <Button variant="ghost" size="sm">
            Snooze
          </Button>
        }
      />
    </div>
  ),
};

export const InsideCard: Story = {
  args: { children: null },
  render: () => (
    <div style={{ width: '28rem' }}>
      <Card variant="outline">
        <Card.Header>
          <Card.Title>Today</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row
            title="Stand-up"
            meta="9:00 AM"
            actions={
              <Button variant="ghost" size="sm">
                Skip
              </Button>
            }
          />
          <Row
            title="1:1 with manager"
            meta="2:00 PM"
            actions={
              <Button variant="ghost" size="sm">
                Skip
              </Button>
            }
          />
        </Card.Body>
      </Card>
    </div>
  ),
};

export const CompoundComposition: Story = {
  args: { children: null },
  render: () => (
    <div style={{ width: '28rem' }}>
      <Row>
        <Row.Content>
          <Row.Title>Custom compound row</Row.Title>
          <Row.Meta>Composed from Row.Content, Row.Title, Row.Meta, Row.Actions</Row.Meta>
        </Row.Content>
        <Row.Actions>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Row.Actions>
      </Row>
    </div>
  ),
};
