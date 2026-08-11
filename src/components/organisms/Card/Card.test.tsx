import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders card title, body, and footer slots', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>My Title</Card.Title>
        </Card.Header>
        <Card.Body>
          <p>My Content</p>
        </Card.Body>
      </Card>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Content')).toBeInTheDocument();
  });
});
