import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import './Dropdown.css';

export const DropdownRoot = DropdownPrimitive.Root;
export const DropdownTrigger = DropdownPrimitive.Trigger;
export const DropdownGroup = DropdownPrimitive.Group;
export const DropdownSub = DropdownPrimitive.Sub;
export const DropdownRadioGroup = DropdownPrimitive.RadioGroup;

export const DropdownContent = forwardRef<
  ElementRef<typeof DropdownPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className = '', sideOffset = 4, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={`juice-dropdown-content ${className}`.trim()}
      {...props}
    />
  </DropdownPrimitive.Portal>
));
DropdownContent.displayName = 'DropdownContent';

export interface DropdownItemProps extends ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> {
  variant?: 'default' | 'danger';
}

export const DropdownItem = forwardRef<
  ElementRef<typeof DropdownPrimitive.Item>,
  DropdownItemProps
>(({ variant = 'default', className = '', ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={[
      'juice-dropdown-item',
      variant === 'danger' && 'juice-dropdown-item--danger',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
DropdownItem.displayName = 'DropdownItem';

export const DropdownLabel = forwardRef<
  ElementRef<typeof DropdownPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={`juice-dropdown-label ${className}`.trim()}
    {...props}
  />
));
DropdownLabel.displayName = 'DropdownLabel';

export const DropdownSeparator = forwardRef<
  ElementRef<typeof DropdownPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <DropdownPrimitive.Separator
    ref={ref}
    className={`juice-dropdown-separator ${className}`.trim()}
    {...props}
  />
));
DropdownSeparator.displayName = 'DropdownSeparator';

export function DropdownShortcut({
  className = '',
  children,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <span className={`juice-dropdown-shortcut ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

export interface DropdownMenuItemDef {
  label: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  shortcut?: string;
  separatorAfter?: boolean;
}

export interface SimpleDropdownProps
  extends ComponentPropsWithoutRef<typeof DropdownPrimitive.Root> {
  trigger: ReactNode;
  items: DropdownMenuItemDef[];
}

/**
 * Dropdown — accessible context menu and actions popup organism.
 *
 * Powered by `@radix-ui/react-dropdown-menu` with DOM portal rendering, collision detection, and arrow-key roving tabindex.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button variant="secondary">Actions</Button>}
 *   items={[
 *     { label: 'Edit Project', onClick: () => {} },
 *     { label: 'Duplicate', shortcut: '⌘D' },
 *     { label: 'Delete', variant: 'danger', separatorAfter: true },
 *   ]}
 * />
 * ```
 */
export function Dropdown({ trigger, items, ...props }: SimpleDropdownProps) {
  return (
    <DropdownRoot {...props}>
      <DropdownTrigger asChild>{trigger}</DropdownTrigger>
      <DropdownContent>
        {items.map((item, index) => {
          const itemKey = typeof item.label === 'string' ? item.label : `item-${index}`;
          return (
            <div key={itemKey}>
              <DropdownItem variant={item.variant} disabled={item.disabled} onClick={item.onClick}>
                <span>{item.label}</span>
                {item.shortcut && <DropdownShortcut>{item.shortcut}</DropdownShortcut>}
              </DropdownItem>
              {item.separatorAfter && <DropdownSeparator />}
            </div>
          );
        })}
      </DropdownContent>
    </DropdownRoot>
  );
}

Dropdown.Root = DropdownRoot;
Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;
Dropdown.Label = DropdownLabel;
Dropdown.Separator = DropdownSeparator;
Dropdown.Shortcut = DropdownShortcut;
Dropdown.Group = DropdownGroup;
Dropdown.Sub = DropdownSub;
Dropdown.RadioGroup = DropdownRadioGroup;
