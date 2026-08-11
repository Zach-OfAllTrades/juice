import type { HTMLAttributes, ReactNode } from 'react';
import './InputStack.css';

export interface InputStackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Input fields and other form atoms to stack vertically.
   * Typically a list of `<Input>` components.
   */
  children: ReactNode;
}

/**
 * InputStack — a simple vertical wrapper molecule that groups
 * form fields with consistent spacing.
 *
 * Pairs naturally with `<Input>` atoms. Does not impose any
 * data structure — it only handles layout.
 *
 * @example
 * ```tsx
 * <InputStack>
 *   <Input label="First name" />
 *   <Input label="Last name" />
 *   <Input label="Email" type="email" />
 * </InputStack>
 * ```
 */
export function InputStack({ children, className = '', ...props }: InputStackProps) {
  const classes = ['juice-input-stack', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
