import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn, foco, fuente } from './cn';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> & { etiqueta: string };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ etiqueta, id, className, disabled, ...rest }, ref) {
  const auto = useId(); const campo = id ?? auto;
  return (
    <label htmlFor={campo} className={cn('inline-flex items-center gap-3 text-(length:--font-size-m) text-(--color-content-primary)', fuente, disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer', className)}>
      <input ref={ref} id={campo} type="checkbox" role="switch" disabled={disabled}
        className={cn('peer relative h-6 w-11 shrink-0 cursor-[inherit] appearance-none rounded-full bg-(--color-border-primary) transition-colors duration-(--motion-duration-fast) motion-reduce:transition-none',
          'checked:bg-(--color-background-brand)',
          "before:absolute before:left-0.5 before:top-0.5 before:size-5 before:rounded-full before:bg-(--color-base-white) before:shadow-(--shadow-elevation-1) before:transition-transform before:duration-(--motion-duration-fast) before:content-[''] motion-reduce:before:transition-none checked:before:translate-x-5",
          foco)} {...rest} />
      {etiqueta}
    </label>
  );
});
