import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, foco, transicion } from './cn';
import { Spinner } from './Spinner';
import type { ButtonProps } from './Button';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Pick<ButtonProps, 'tamano' | 'tipo' | 'cargando'> & {
    icono: ReactNode;
    /** Obligatoria: nombre accesible del botón (no tiene texto visible). */
    etiqueta: string;
  };

const TAM = { l: 'size-12', s: 'size-9' } as const;
const TIPO = {
  primario: 'bg-(--color-background-brand) text-(--color-content-primary-inverse) hover:bg-(--color-background-brand-hover) active:bg-(--color-background-brand-pressed)',
  secundario: 'bg-(--color-background-selected) text-(--color-content-brand) hover:bg-(--color-background-hover)',
  terciario: 'bg-transparent text-(--color-content-brand) hover:bg-(--color-background-selected)',
  mono: 'bg-transparent text-(--color-content-primary) hover:bg-(--color-background-hover)',
  peligro: 'bg-(--color-background-negative) text-(--color-content-primary-inverse) hover:bg-(--color-background-negative-hover)',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tamano = 'l', tipo = 'primario', cargando, icono, etiqueta, disabled, className, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} aria-label={etiqueta} disabled={disabled || cargando} aria-busy={cargando || undefined}
      className={cn('inline-flex items-center justify-center rounded-(--radius-s)', foco, transicion, TAM[tamano], TIPO[tipo],
        'disabled:cursor-not-allowed disabled:opacity-45', className)} {...rest}>
      {cargando ? <Spinner tamano="s" tipo={tipo === 'primario' || tipo === 'peligro' ? 'inverso' : 'primario'} /> : icono}
    </button>
  );
});
