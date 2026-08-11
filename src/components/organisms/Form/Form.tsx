import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import './Form.css';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Form-level error alert message */
  error?: ReactNode;
  children: ReactNode;
}

/**
 * Form — semantic `<form>` orchestrator organism.
 *
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit} error={formError}>
 *   <InputStack>
 *     <Input label="Email" type="email" required />
 *     <Input label="Password" type="password" required />
 *   </InputStack>
 *   <Form.Actions>
 *     <Button type="button" variant="ghost">Cancel</Button>
 *     <Button type="submit" variant="primary">Sign In</Button>
 *   </Form.Actions>
 * </Form>
 * ```
 */
export function Form({ error, className = '', children, ...props }: FormProps) {
  return (
    <form className={`juice-form ${className}`.trim()} {...props}>
      {error && <FormErrorSummary>{error}</FormErrorSummary>}
      {children}
    </form>
  );
}

export function FormErrorSummary({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`juice-form-error-summary ${className}`.trim()}
      {...props}
    >
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
        style={{ marginTop: 2, flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

export function FormActions({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-form-actions ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

Form.ErrorSummary = FormErrorSummary;
Form.Actions = FormActions;
