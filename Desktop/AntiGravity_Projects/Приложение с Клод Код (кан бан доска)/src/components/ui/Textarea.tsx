import React, { forwardRef, useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, autoResize = true, id, rows = 3, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const internalRef = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        adjustHeight();

        textarea.addEventListener('input', adjustHeight);
        return () => {
          textarea.removeEventListener('input', adjustHeight);
        };
      }
    }, [autoResize]);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          rows={rows}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500',
            autoResize && 'resize-none overflow-hidden',
            error && 'border-red-500 focus-visible:ring-red-500 dark:border-red-600 dark:focus-visible:ring-red-500',
            className
          )}
          ref={internalRef}
          aria-invalid={error}
          aria-describedby={helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {helperText && (
          <p
            id={`${textareaId}-helper`}
            className={cn(
              'text-sm',
              error
                ? 'text-red-600 dark:text-red-500'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };