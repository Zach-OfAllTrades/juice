import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import './Tabs.css';

export type TabsVariant = 'underline' | 'pill';

/* ── Compound Sub-components ───────────────────────────────── */

export const TabsRoot = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={`juice-tabs-root ${className}`.trim()} {...props} />
));
TabsRoot.displayName = 'TabsRoot';

export interface TabsListProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsVariant;
}

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className = '', variant = 'underline', ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={['juice-tabs-list', variant === 'pill' && 'juice-tabs-list--pill', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`juice-tabs-trigger ${className}`.trim()}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`juice-tabs-content ${className}`.trim()}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

/* ── Declarative Simple Tabs Interface ─────────────────────── */
export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface SimpleTabsProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant;
  items?: TabItem[];
}

/**
 * Tabs — accessible tabbed interface powered by Radix UI primitives.
 *
 * Implements roving tabindex arrow key navigation and ARIA tablist/tabpanel standards.
 *
 * @example
 * ```tsx
 * <Tabs
 *   defaultValue="general"
 *   items={[
 *     { value: 'general', label: 'General', content: <p>General settings</p> },
 *     { value: 'security', label: 'Security', content: <p>Security options</p> },
 *   ]}
 * />
 * ```
 */
export function Tabs({
  variant = 'underline',
  items = [],
  defaultValue,
  className = '',
  ...props
}: SimpleTabsProps) {
  const initialValue = defaultValue ?? items[0]?.value;

  return (
    <TabsRoot defaultValue={initialValue} className={className} {...props}>
      <TabsList variant={variant}>
        {items.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

/* Attach compound components to Tabs */
Tabs.Root = TabsRoot;
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;
