import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import './Drawer.css';

export type DrawerSide = 'bottom' | 'right' | 'left';

export interface DrawerProps extends DialogPrimitive.DialogProps {}

export const DrawerRoot = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`juice-drawer-overlay ${className}`.trim()}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

export interface DrawerContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: DrawerSide;
}

export const DrawerContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ side = 'bottom', className = '', children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={['juice-drawer-content', `juice-drawer-content--${side}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {side === 'bottom' && <div className="juice-drawer-handle" aria-hidden="true" />}
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

export function DrawerHeader({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-drawer-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export const DrawerTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`juice-drawer-title ${className}`.trim()}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`juice-drawer-description ${className}`.trim()}
    {...props}
  />
));
DrawerDescription.displayName = 'DrawerDescription';

export function DrawerBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-drawer-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-drawer-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export interface SimpleDrawerProps extends DrawerProps {
  side?: DrawerSide;
  title?: ReactNode;
  description?: ReactNode;
  trigger?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Drawer — slide-over panel and bottom sheet organism.
 *
 * Built on `@radix-ui/react-dialog` with focus trapping, scroll locking, and Escape key handling.
 *
 * @example
 * ```tsx
 * <Drawer
 *   side="right"
 *   trigger={<Button>Open Filters</Button>}
 *   title="Filter Products"
 * >
 *   <p>Filter options</p>
 * </Drawer>
 * ```
 */
export function Drawer({
  side = 'bottom',
  title,
  description,
  trigger,
  children,
  footer,
  ...props
}: SimpleDrawerProps) {
  return (
    <DrawerRoot {...props}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent side={side}>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        {children && <DrawerBody>{children}</DrawerBody>}
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </DrawerRoot>
  );
}

Drawer.Root = DrawerRoot;
Drawer.Trigger = DrawerTrigger;
Drawer.Portal = DrawerPortal;
Drawer.Overlay = DrawerOverlay;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Title = DrawerTitle;
Drawer.Description = DrawerDescription;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
Drawer.Close = DrawerClose;
