import { forwardRef, cloneElement, isValidElement, type ReactElement } from 'react'
import { cn } from '@/lib/cn'

const fieldBase =
  'block w-full min-h-[48px] rounded-md border border-secondary-500 bg-white px-3 py-2.5 text-base text-secondary-900 placeholder:text-secondary-500 shadow-sm transition-colors focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700 disabled:bg-secondary-50 disabled:text-secondary-500'

const errorRing = 'border-danger focus:border-danger focus:ring-danger/30'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, htmlFor, required, error, hint, children, className }: FieldWrapperProps) {
  const describedBy = [hint ? `${htmlFor}-hint` : '', error ? `${htmlFor}-error` : ''].filter(Boolean).join(' ') || undefined
  const child = isValidElement(children) ? children as ReactElement<InputProps> : null
  const control = child?.props.id === htmlFor
    ? cloneElement(child, { required, hasError: !!error, 'aria-invalid': !!error, 'aria-describedby': describedBy })
    : children
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-secondary-800">
        {label}
        {required && <span className="text-red-700 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {control}
      {hint && <p id={`${htmlFor}-hint`} className="text-sm text-secondary-700">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(fieldBase, hasError && errorRing, className)}
      {...props}
    />
  )
})

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, 'resize-y', hasError && errorRing, className)}
      {...props}
    />
  )
})

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, hasError, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(fieldBase, 'pr-8', hasError && errorRing, className)}
      {...props}
    >
      {children}
    </select>
  )
})
