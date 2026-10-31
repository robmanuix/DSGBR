import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, foco, fuente, transicion } from './cn';
import { Spinner } from './Spinner';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tamano?: 'l' | 's';
  tipo?: 'primario' | 'secundario' | 'terciario' | 'mono' | 'peligro';
  /** Forma de píldora (Botón píldora). */
  pildora?: boolean;
  cargando?: boolean;
  /** Ícono al inicio y al final (opcionales). */
  iconoInicial?: ReactNode;
  iconoFinal?: ReactNode;
};

const TAM = {
  l: 'min-h-12 px-6 text-(length:--font-size-m) gap-2',
  s: 'min-h-9 px-4 text-(length:--font-size-s) gap-1.5',
} as const;

const TIPO = {
  primario:
    'bg-(--color-background-brand) text-(--color-content-primary-inverse) hover:bg-(--color-background-brand-hover) active:bg-(--color-background-brand-pressed)',
  secundario:
    'bg-(--color-background-selected) text-(--color-content-brand) hover:bg-(--color-background-hover) active:bg-(--color-background-hover)',
  terciario:
    'bg-transparent text-(--color-content-brand) hover:bg-(--color-background-selected) active:bg-(--color-background-hover)',
  mono:
    'bg-transparent text-(--color-content-primary) hover:bg-(--color-background-hover) active:bg-(--color-background-selected)',
  peligro:
    'bg-(--color-background-negative) text-(--color-content-primary-inverse) hover:bg-(--color-background-negative-hover)',
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { tamano = 'l', tipo = 'primario', pildora, cargando, iconoInicial, iconoFinal, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  const inactivo = disabled || cargando;
  return (
    <button ref={ref} type={type} disabled={inactivo} aria-busy={cargando || undefined}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap font-semibold select-none',
        fuente, foco, transicion, TAM[tamano], TIPO[tipo],
        pildora ? 'rounded-(--radius-pill)' : 'rounded-(--radius-s)',
        'disabled:cursor-not-allowed disabled:opacity-45', className,
      )} {...rest}>
      {cargando ? <Spinner tamano="s" tipo={tipo === 'primario' || tipo === 'peligro' ? 'inverso' : 'primario'} /> : iconoInicial}
      {children}
      {!cargando && iconoFinal}
    </button>
  );
});
