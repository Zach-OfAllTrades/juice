import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardVariant = 'outline' | 'raised' | 'flat';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual surface variant */
  variant?: CardVariant;
  /** Add interactive hover elevation */
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Card — content container organism structured with flexible slots.
 *
 * @example
 * ```tsx
 * <Card variant="raised">
 *   <Card.Header>
 *     <Card.Title>Component Library</Card.Title>
 *     <Card.Description>Build agnostic UI components</Card.Description>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Card body content</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button variant="primary">Get Started</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
export function Card({
  variant = 'outline',
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'juice-card',
        `juice-card--${variant}`,
        interactive && 'juice-card--interactive',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`juice-card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`juice-card-description ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardMedia({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-card-media ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/* Attach compound slots */
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Media = CardMedia;
Card.Body = CardBody;
Card.Footer = CardFooter;
