import type { HTMLAttributes } from 'react';
import { cn, fuente } from './cn';

export type HelpTextProps = HTMLAttributes<HTMLParagraphElement> & {
  tamano?: 'l' | 'm';
  estado?: 'predeterminado' | 'info' | 'aviso' | 'error' | 'exito' | 'deshabilitado';
};

const COLOR = {
  predeterminado: 'text-(--color-content-secondary)',
  info: 'text-(--color-content-info-bold)',
  aviso: 'text-(--color-content-notice-bold)',
  error: 'text-(--color-content-negative-bold)',
  exito: 'text-(--color-content-positive-bold)',
  deshabilitado: 'text-(--color-content-disabled)',
} as const;

export function HelpText({ tamano = 'm', estado = 'predeterminado', className, ...rest }: HelpTextProps) {
  return <p className={cn(fuente, tamano === 'l' ? 'text-(length:--font-size-s)' : 'text-(length:--font-size-xs)', COLOR[estado], className)}
    role={estado === 'error' ? 'alert' : undefined} {...rest} />;
}
