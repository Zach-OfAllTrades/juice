import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import './Modal.css';

/* ── Types ─────────────────────────────────────────────────── */
export interface ModalProps extends DialogPrimitive.DialogProps {}

export interface ModalTriggerProps extends DialogPrimitive.DialogTriggerProps {}

export interface ModalContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Show the top-right accessible close icon button (default: true) */
  showClose?: boolean;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalTitleProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}

export interface ModalDescriptionProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalCloseProps extends DialogPrimitive.DialogCloseProps {}

/* ── Compound Sub-components ───────────────────────────────── */

export const ModalRoot = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalPortal = DialogPrimitive.Portal;
export const ModalClose = DialogPrimitive.Close;

export const ModalOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`juice-modal-overlay ${className}`.trim()}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

export const ModalContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className = '', children, showClose = true, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`juice-modal-content ${className}`.trim()}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="juice-modal-close-icon" aria-label="Close modal">
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = 'ModalContent';

export function ModalHeader({ className = '', children, ...props }: ModalHeaderProps) {
  return (
    <div className={`juice-modal-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export const ModalTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, ModalTitleProps>(
  ({ className = '', ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={`juice-modal-title ${className}`.trim()}
      {...props}
    />
  )
);
ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ModalDescriptionProps
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`juice-modal-description ${className}`.trim()}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export function ModalBody({ className = '', children, ...props }: ModalBodyProps) {
  return (
    <div className={`juice-modal-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className = '', children, ...props }: ModalFooterProps) {
  return (
    <div className={`juice-modal-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/* ── Declarative Standalone Modal Wrapper ──────────────────── */
export interface SimpleModalProps extends ModalProps {
  /** Modal heading title */
  title?: ReactNode;
  /** Modal subtext description */
  description?: ReactNode;
  /** Trigger element (e.g. `<Button>Open</Button>`) */
  trigger?: ReactNode;
  /** Modal body content */
  children?: ReactNode;
  /** Modal footer action buttons */
  footer?: ReactNode;
  /** Show the top-right accessible close icon button (default: true) */
  showClose?: boolean;
}

/**
 * Modal — accessible dialog organism powered by Radix UI primitives.
 *
 * Features:
 * - Focus trapping and automatic return on close
 * - Scroll-locking on document body
 * - Escape key listener & outside click dismiss
 * - Dynamic Top Layer portal rendering
 * - Supports compound composition (`Modal.Content`, `Modal.Header`, etc.) or simple declarative props
 *
 * @example
 * ```tsx
 * <Modal
 *   trigger={<Button>Edit Profile</Button>}
 *   title="Edit profile"
 *   description="Make changes to your profile here."
 *   footer={
 *     <>
 *       <Button variant="ghost">Cancel</Button>
 *       <Button variant="primary">Save changes</Button>
 *     </>
 *   }
 * >
 *   <Input label="Name" defaultValue="Zach Rose" />
 * </Modal>
 * ```
 */
export function Modal({
  title,
  description,
  trigger,
  children,
  footer,
  showClose = true,
  ...props
}: SimpleModalProps) {
  return (
    <ModalRoot {...props}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent showClose={showClose}>
        {(title || description) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {description && <ModalDescription>{description}</ModalDescription>}
          </ModalHeader>
        )}
        {children && <ModalBody>{children}</ModalBody>}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalRoot>
  );
}

/* Attach compound components to Modal function */
Modal.Root = ModalRoot;
Modal.Trigger = ModalTrigger;
Modal.Portal = ModalPortal;
Modal.Overlay = ModalOverlay;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Close = ModalClose;
