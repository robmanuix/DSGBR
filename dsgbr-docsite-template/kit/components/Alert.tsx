import type { HTMLAttributes, ReactNode } from 'react';
import { cn, fuente } from './cn';

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  estado?: 'info' | 'aviso' | 'error' | 'exito';
  titulo?: string;
  /** Acciones o enlaces al pie (por ejemplo, botones terciarios). */
  acciones?: ReactNode;
};

const ESTILO = {
  info: { caja: 'bg-(--color-background-info-subtle) border-(--color-border-info)', texto: 'text-(--color-content-info-bold)', barra: 'bg-(--color-background-info)' },
  aviso: { caja: 'bg-(--color-background-notice-subtle) border-(--color-border-notice)', texto: 'text-(--color-content-notice-bold)', barra: 'bg-(--color-background-notice)' },
  error: { caja: 'bg-(--color-background-negative-subtle) border-(--color-border-negative)', texto: 'text-(--color-content-negative-bold)', barra: 'bg-(--color-background-negative)' },
  exito: { caja: 'bg-(--color-background-positive-subtle) border-(--color-border-positive)', texto: 'text-(--color-content-positive-bold)', barra: 'bg-(--color-background-positive)' },
} as const;

export function Alert({ estado = 'info', titulo, acciones, className, children, ...rest }: AlertProps) {
  const e = ESTILO[estado];
  return (
    <div role={estado === 'error' || estado === 'aviso' ? 'alert' : 'status'}
      className={cn('relative flex flex-col gap-2 overflow-hidden rounded-(--radius-m) border py-3 pl-5 pr-4', fuente, e.caja, e.texto, className)} {...rest}>
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1', e.barra)} />
      {titulo && <p className="text-(length:--font-size-m) font-semibold">{titulo}</p>}
      <div className="text-(length:--font-size-s)">{children}</div>
      {acciones && <div className="flex flex-wrap gap-(--space-s)">{acciones}</div>}
    </div>
  );
}
