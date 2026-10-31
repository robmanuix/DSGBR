import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes } from 'react';
import { cn, foco, fuente } from './cn';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  etiqueta: string; indeterminada?: boolean; error?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { etiqueta, indeterminada, error, id, className, disabled, ...rest }, ref,
) {
  const auto = useId(); const campo = id ?? auto; const interno = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (interno.current) interno.current.indeterminate = !!indeterminada; }, [indeterminada]);
  return (
    <label htmlFor={campo} className={cn('inline-flex items-center gap-2 text-(length:--font-size-m) text-(--color-content-primary)', fuente, disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer', className)}>
      <input ref={(n) => { interno.current = n; if (typeof ref === 'function') ref(n); else if (ref) ref.current = n; }}
        id={campo} type="checkbox" disabled={disabled} aria-invalid={error || undefined}
        className={cn('size-5 shrink-0 cursor-[inherit] appearance-none rounded-(--radius-xs) border-(length:--border-width-m) bg-(--color-background-primary)',
          'border-(--color-border-primary) hover:border-(--color-border-brand)',
          'checked:border-(--color-background-brand) checked:bg-(--color-background-brand) indeterminate:border-(--color-background-brand) indeterminate:bg-(--color-background-brand)',
          'bg-center bg-no-repeat checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%20fill=%27none%27%20stroke=%27white%27%20stroke-width=%272.2%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27M3.5%208.5l3%203%206-7%27/%3E%3C/svg%3E")]',
          'indeterminate:bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%20fill=%27none%27%20stroke=%27white%27%20stroke-width=%272.2%27%20stroke-linecap=%27round%27%3E%3Cpath%20d=%27M4%208h8%27/%3E%3C/svg%3E")]',
          error && 'border-(--color-border-negative)', foco)} {...rest} />
      {etiqueta}
    </label>
  );
});
