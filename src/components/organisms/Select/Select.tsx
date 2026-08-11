import * as SelectPrimitive from '@radix-ui/react-select';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef, useId } from 'react';
import './Select.css';

export type SelectSize = 'sm' | 'md' | 'lg';

/* ── Compound Sub-components ───────────────────────────────── */

export const SelectRoot = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: SelectSize;
  error?: boolean;
}

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className = '', size = 'md', error = false, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={[
      'juice-select-trigger',
      `juice-select-trigger--${size}`,
      error && 'juice-select-trigger--error',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <span className="juice-select-icon">
        <svg
          width="14"
          height="14"
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
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectContentProps
  extends ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className = '', children, position = 'popper', sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`juice-select-content ${className}`.trim()}
      position={position}
      sideOffset={sideOffset}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="juice-select-scroll-button">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="juice-select-viewport">
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="juice-select-scroll-button">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export interface SelectItemProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

export const SelectItem = forwardRef<ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className = '', children, ...props }, ref) => (
    <SelectPrimitive.Item ref={ref} className={`juice-select-item ${className}`.trim()} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="juice-select-item-indicator">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = 'SelectItem';

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`juice-select-label ${className}`.trim()}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`juice-select-separator ${className}`.trim()}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

/* ── Declarative Simple Option Interface ───────────────────── */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOption[];
}

export interface SimpleSelectProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  /** Visible label above the select */
  label?: string;
  /** Placeholder text shown when no value is selected */
  placeholder?: string;
  /** Accessible helper text */
  helperText?: string;
  /** Error message — presence signals error state */
  error?: string;
  /** Size variant */
  size?: SelectSize;
  /** Mark field as required */
  required?: boolean;
  /** Array of simple options or grouped options */
  options?: (SelectOption | SelectOptionGroup)[];
  /** Custom trigger class name */
  className?: string;
  /** Custom ID for connecting external labels */
  id?: string;
}

function isGroup(option: SelectOption | SelectOptionGroup): option is SelectOptionGroup {
  return 'group' in option && Array.isArray((option as SelectOptionGroup).options);
}

/**
 * Select — accessible custom dropdown organism powered by Radix UI primitives.
 *
 * Features:
 * - DOM portal rendering preventing overflow clipping & z-index issues
 * - Automatic collision detection & flip repositioning
 * - Full typeahead keyboard navigation (arrow keys, home, end, typing letters)
 * - Roving tabindex and screen-reader accessibility
 * - Supports compound composition (`Select.Content`, `Select.Item`, etc.) or simple declarative options
 *
 * @example
 * ```tsx
 * <Select
 *   label="Theme"
 *   placeholder="Choose theme"
 *   defaultValue="light"
 *   options={[
 *     { value: 'light', label: 'Light' },
 *     { value: 'dark', label: 'Dark' },
 *     { value: 'system', label: 'System preference' },
 *   ]}
 * />
 * ```
 */
export function Select({
  label,
  placeholder = 'Select an option…',
  helperText,
  error,
  size = 'md',
  required = false,
  options = [],
  className = '',
  id: propId,
  disabled,
  ...props
}: SimpleSelectProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  return (
    <div className="juice-select-wrapper">
      {label && (
        <label htmlFor={id} className="juice-label">
          {label}
          {required && (
            <span className="juice-label__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <SelectRoot disabled={disabled} required={required} {...props}>
        <SelectTrigger
          id={id}
          size={size}
          error={hasError}
          className={className}
          aria-invalid={hasError || undefined}
          aria-describedby={
            [hasError && errorId, hasHelper && descriptionId].filter(Boolean).join(' ') || undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((item, index) => {
            if (isGroup(item)) {
              return (
                <SelectGroup key={item.group}>
                  {index > 0 && <SelectSeparator />}
                  <SelectLabel>{item.group}</SelectLabel>
                  {item.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            }

            return (
              <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </SelectRoot>

      {hasError && (
        <span id={errorId} className="juice-error-text" role="alert" aria-live="polite">
          {error}
        </span>
      )}

      {hasHelper && !hasError && (
        <span id={descriptionId} className="juice-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}

/* Attach compound components to Select function */
Select.Root = SelectRoot;
Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Group = SelectGroup;
Select.Label = SelectLabel;
Select.Separator = SelectSeparator;
