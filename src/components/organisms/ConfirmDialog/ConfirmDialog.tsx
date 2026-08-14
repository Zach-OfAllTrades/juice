import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import './ConfirmDialog.css';

export type ConfirmDialogTone = 'default' | 'danger';

/* ── Types ─────────────────────────────────────────────────── */
export interface ConfirmDialogProps extends AlertDialogPrimitive.AlertDialogProps {}

export interface ConfirmDialogTriggerProps extends AlertDialogPrimitive.AlertDialogTriggerProps {}

export interface ConfirmDialogContentProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {}

export interface ConfirmDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface ConfirmDialogTitleProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}

export interface ConfirmDialogDescriptionProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}

export interface ConfirmDialogBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface ConfirmDialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface ConfirmDialogCancelProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {}

export interface ConfirmDialogActionProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  /** Visual tone of the confirm action — `danger` for destructive/irreversible actions */
  tone?: ConfirmDialogTone;
}

/* ── Compound Sub-components ───────────────────────────────── */

export const ConfirmDialogRoot = AlertDialogPrimitive.Root;
export const ConfirmDialogTrigger = AlertDialogPrimitive.Trigger;
export const ConfirmDialogPortal = AlertDialogPrimitive.Portal;

export const ConfirmDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={`juice-confirm-dialog-overlay ${className}`.trim()}
    {...props}
  />
));
ConfirmDialogOverlay.displayName = 'ConfirmDialogOverlay';

export const ConfirmDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ConfirmDialogContentProps
>(({ className = '', children, ...props }, ref) => (
  <ConfirmDialogPortal>
    <ConfirmDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={`juice-confirm-dialog-content ${className}`.trim()}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </ConfirmDialogPortal>
));
ConfirmDialogContent.displayName = 'ConfirmDialogContent';

export function ConfirmDialogHeader({
  className = '',
  children,
  ...props
}: ConfirmDialogHeaderProps) {
  return (
    <div className={`juice-confirm-dialog-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export const ConfirmDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ConfirmDialogTitleProps
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={`juice-confirm-dialog-title ${className}`.trim()}
    {...props}
  />
));
ConfirmDialogTitle.displayName = 'ConfirmDialogTitle';

export const ConfirmDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Description>,
  ConfirmDialogDescriptionProps
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={`juice-confirm-dialog-description ${className}`.trim()}
    {...props}
  />
));
ConfirmDialogDescription.displayName = 'ConfirmDialogDescription';

export function ConfirmDialogBody({ className = '', children, ...props }: ConfirmDialogBodyProps) {
  return (
    <div className={`juice-confirm-dialog-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ConfirmDialogFooter({
  className = '',
  children,
  ...props
}: ConfirmDialogFooterProps) {
  return (
    <div className={`juice-confirm-dialog-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export const ConfirmDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ConfirmDialogCancelProps
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={`juice-confirm-dialog-cancel ${className}`.trim()}
    {...props}
  />
));
ConfirmDialogCancel.displayName = 'ConfirmDialogCancel';

export const ConfirmDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  ConfirmDialogActionProps
>(({ className = '', tone = 'default', ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={[
      'juice-confirm-dialog-action',
      tone === 'danger' && 'juice-confirm-dialog-action--danger',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
ConfirmDialogAction.displayName = 'ConfirmDialogAction';

/* ── Declarative Standalone ConfirmDialog Wrapper ──────────── */
export interface SimpleConfirmDialogProps extends ConfirmDialogProps {
  /** Trigger element (e.g. `<Button>Delete</Button>`) */
  trigger?: ReactNode;
  /** Dialog heading title */
  title?: ReactNode;
  /** Dialog subtext description */
  description?: ReactNode;
  /** Extra content slot rendered between the description and the actions —
   * e.g. a `Textarea` for capturing a reason/note before confirming. Fully
   * generic: the dialog has no opinion on what it contains. */
  children?: ReactNode;
  /** Label for the cancel action */
  cancelLabel?: ReactNode;
  /** Label for the confirm action */
  confirmLabel?: ReactNode;
  /** Visual tone of the confirm action — `danger` for destructive/irreversible actions */
  tone?: ConfirmDialogTone;
  /** Called when the confirm action is activated */
  onConfirm?: () => void;
  /** Called when the cancel action is activated */
  onCancel?: () => void;
}

/**
 * ConfirmDialog — accessible "confirm before doing something
 * destructive/irreversible" organism powered by Radix UI's AlertDialog primitive.
 *
 * Unlike `Modal`, it cannot be dismissed by clicking the overlay or pressing
 * Escape without an explicit Cancel/Confirm choice — the pattern Radix ships
 * AlertDialog for.
 *
 * Features:
 * - Focus trapping and automatic return on close
 * - Requires an explicit Cancel or Confirm choice to close
 * - Dynamic Top Layer portal rendering
 * - Supports compound composition (`ConfirmDialog.Content`, `ConfirmDialog.Action`, etc.)
 *   or simple declarative props
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   trigger={<Button variant="danger">Delete task</Button>}
 *   title="Delete this task?"
 *   description="This action can't be undone."
 *   tone="danger"
 *   confirmLabel="Delete"
 *   onConfirm={() => deleteTask(id)}
 * >
 *   <Textarea label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
 * </ConfirmDialog>
 * ```
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  children,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  tone = 'default',
  onConfirm,
  onCancel,
  ...props
}: SimpleConfirmDialogProps) {
  return (
    <ConfirmDialogRoot {...props}>
      {trigger && <ConfirmDialogTrigger asChild>{trigger}</ConfirmDialogTrigger>}
      <ConfirmDialogContent>
        {(title || description) && (
          <ConfirmDialogHeader>
            {title && <ConfirmDialogTitle>{title}</ConfirmDialogTitle>}
            {description && <ConfirmDialogDescription>{description}</ConfirmDialogDescription>}
          </ConfirmDialogHeader>
        )}
        {children && <ConfirmDialogBody>{children}</ConfirmDialogBody>}
        <ConfirmDialogFooter>
          <ConfirmDialogCancel onClick={onCancel}>{cancelLabel}</ConfirmDialogCancel>
          <ConfirmDialogAction tone={tone} onClick={onConfirm}>
            {confirmLabel}
          </ConfirmDialogAction>
        </ConfirmDialogFooter>
      </ConfirmDialogContent>
    </ConfirmDialogRoot>
  );
}

/* Attach compound components to ConfirmDialog function */
ConfirmDialog.Root = ConfirmDialogRoot;
ConfirmDialog.Trigger = ConfirmDialogTrigger;
ConfirmDialog.Portal = ConfirmDialogPortal;
ConfirmDialog.Overlay = ConfirmDialogOverlay;
ConfirmDialog.Content = ConfirmDialogContent;
ConfirmDialog.Header = ConfirmDialogHeader;
ConfirmDialog.Title = ConfirmDialogTitle;
ConfirmDialog.Description = ConfirmDialogDescription;
ConfirmDialog.Body = ConfirmDialogBody;
ConfirmDialog.Footer = ConfirmDialogFooter;
ConfirmDialog.Cancel = ConfirmDialogCancel;
ConfirmDialog.Action = ConfirmDialogAction;
