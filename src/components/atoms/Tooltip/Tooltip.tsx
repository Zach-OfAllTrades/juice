import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  /** Content shown in the tooltip bubble on hover/focus */
  content: ReactNode;
  /**
   * The trigger element. Must be a single element that can accept a ref and
   * event handlers (Radix clones its own props onto it via `asChild`) —
   * typically a `<span>`, `<button>`, or an icon.
   */
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Hover delay before the tooltip opens, in ms. */
  delayDuration?: number;
}

/**
 * Tooltip — hover/focus-triggered content bubble, built on
 * `@radix-ui/react-tooltip`.
 *
 * Not a wrapper around the native `title` attribute: `title` renders nothing
 * at all in Tauri apps on macOS (WKWebView doesn't implement the native
 * title-tooltip UI Safari itself provides), so any hover-detail need has to
 * go through an actual component rather than that attribute.
 *
 * @example
 * ```tsx
 * <Tooltip content="Realistic given your current time and resources.">
 *   <span className="smart-term">achievable</span>
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children, side = 'top', delayDuration = 200 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="juice-tooltip-content" side={side} sideOffset={6}>
            {content}
            <TooltipPrimitive.Arrow className="juice-tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
