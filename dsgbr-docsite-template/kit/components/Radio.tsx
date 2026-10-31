import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn, foco, fuente } from './cn';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { etiqueta: string; error?: boolean };

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ etiqueta, error, id, className, disabled, ...rest }, ref) {
  const auto = useId(); const campo = id ?? auto;
  return (
    <label htmlFor={campo} className={cn('inline-flex items-center gap-2 text-(length:--font-size-m) text-(--color-content-primary)', fuente, disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer', className)}>
      <input ref={ref} id={campo} type="radio" disabled={disabled} aria-invalid={error || undefined}
        className={cn('size-5 shrink-0 cursor-[inherit] appearance-none rounded-full border-(length:--border-width-m) bg-(--color-background-primary)',
          'border-(--color-border-primary) hover:border-(--color-border-brand)',
          'checked:border-(--color-background-brand) checked:bg-(--color-background-brand) checked:shadow-[inset_0_0_0_4px_var(--color-background-primary)]',
          error && 'border-(--color-border-negative)', foco)} {...rest} />
      {etiqueta}
    </label>
  );
});
