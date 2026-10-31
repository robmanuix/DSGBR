import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn, fuente, transicion } from './cn';
import { HelpText } from './HelpText';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { etiqueta: string; ayuda?: string; error?: string };

/** Lista desplegable nativa: accesible y con el selector propio de cada sistema. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { etiqueta, ayuda, error, id, className, disabled, children, ...rest }, ref,
) {
  const auto = useId(); const campo = id ?? auto; const nota = (error || ayuda) ? campo + '-nota' : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', fuente, className)}>
      <label htmlFor={campo} className="text-(length:--font-size-s) font-semibold text-(--color-content-primary)">{etiqueta}</label>
      <div className="relative">
        <select ref={ref} id={campo} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={nota}
          className={cn('min-h-12 w-full appearance-none rounded-(--radius-s) border bg-(--color-background-primary) py-2 pl-3 pr-10 text-(length:--font-size-m) text-(--color-content-primary)',
            'border-(--color-border-primary) hover:border-(--color-content-secondary) focus-visible:border-(--color-border-brand)',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)',
            error && 'border-(--color-border-negative)', 'disabled:cursor-not-allowed disabled:opacity-45', transicion)} {...rest}>
          {children}
        </select>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-(--color-content-secondary)"><path d="M4 6l4 4 4-4" /></svg>
      </div>
      {(error || ayuda) && <HelpText id={nota} estado={error ? 'error' : 'predeterminado'}>{error || ayuda}</HelpText>}
    </div>
  );
});
