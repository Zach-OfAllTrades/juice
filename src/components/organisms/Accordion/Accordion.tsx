import * as AccordionPrimitive from '@radix-ui/react-accordion';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import './Accordion.css';

export const AccordionRoot = forwardRef<
  ElementRef<typeof AccordionPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className = '', ...props }, ref) => (
  // @ts-ignore Radix union type overload
  <AccordionPrimitive.Root
    ref={ref}
    className={`juice-accordion-root ${className}`.trim()}
    {...props}
  />
));
AccordionRoot.displayName = 'AccordionRoot';

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={`juice-accordion-item ${className}`.trim()}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Header className="juice-accordion-header">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={`juice-accordion-trigger ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      <span className="juice-accordion-chevron" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={`juice-accordion-content ${className}`.trim()}
    {...props}
  >
    <div className="juice-accordion-content-body">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

export interface AccordionItemDef {
  value: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface SimpleAccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  items: AccordionItemDef[];
  className?: string;
}

/**
 * Accordion — accessible collapsible content panels.
 *
 * Powered by `@radix-ui/react-accordion` with keyboard arrow navigation and ARIA attributes.
 *
 * @example
 * ```tsx
 * <Accordion
 *   type="single"
 *   collapsible
 *   items={[
 *     { value: 'item-1', title: 'Is it accessible?', content: 'Yes, full WAI-ARIA compliance.' },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  type = 'single',
  collapsible = true,
  defaultValue,
  items = [],
  className = '',
}: SimpleAccordionProps) {
  const rootProps =
    type === 'single'
      ? { type: 'single' as const, collapsible, defaultValue: defaultValue as string | undefined }
      : { type: 'multiple' as const, defaultValue: defaultValue as string[] | undefined };

  return (
    // @ts-ignore Radix conditional type
    <AccordionRoot {...rootProps} className={className}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
}

Accordion.Root = AccordionRoot;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
