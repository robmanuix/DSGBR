import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn, foco, fuente, transicion } from './cn';
import { HelpText } from './HelpText';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  iconoInicial?: ReactNode;
  iconoFinal?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { etiqueta, ayuda, error, iconoInicial, iconoFinal, id, className, disabled, ...rest }, ref,
) {
  const auto = useId(); const campo = id ?? auto; const nota = (error || ayuda) ? campo + '-nota' : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', fuente, className)}>
      <label htmlFor={campo} className="text-(length:--font-size-s) font-semibold text-(--color-content-primary)">{etiqueta}</label>
      <div className={cn(
        'flex min-h-12 items-center gap-2 rounded-(--radius-s) border bg-(--color-background-primary) px-3',
        'border-(--color-border-primary) hover:border-(--color-content-secondary) focus-within:border-(--color-border-brand)',
        'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-border-focus)',
        error && 'border-(--color-border-negative) hover:border-(--color-border-negative)',
        disabled && 'opacity-45', transicion)}>
        {iconoInicial && <span className="text-(--color-content-secondary)" aria-hidden="true">{iconoInicial}</span>}
        <input ref={ref} id={campo} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={nota}
          className="min-w-0 flex-1 bg-transparent py-2 text-(length:--font-size-m) text-(--color-content-primary) outline-none placeholder:text-(--color-content-tertiary) disabled:cursor-not-allowed" {...rest} />
        {iconoFinal && <span className="text-(--color-content-secondary)" aria-hidden="true">{iconoFinal}</span>}
      </div>
      {(error || ayuda) && <HelpText id={nota} estado={error ? 'error' : disabled ? 'deshabilitado' : 'predeterminado'}>{error || ayuda}</HelpText>}
    </div>
  );
});
