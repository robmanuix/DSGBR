import type { SVGProps } from 'react';
import { cn } from './cn';

export type SpinnerProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  tamano?: 'l' | 'm' | 's';
  tipo?: 'primario' | 'inverso' | 'negativo' | 'mono';
  /** Texto para lectores de pantalla. */
  etiqueta?: string;
};

const TAM = { l: 'size-8', m: 'size-6', s: 'size-4' } as const;
const COLOR = {
  primario: 'text-(--color-background-brand)',
  inverso: 'text-(--color-content-primary-inverse)',
  negativo: 'text-(--color-background-negative)',
  mono: 'text-(--color-content-primary)',
} as const;

export function Spinner({ tamano = 'm', tipo = 'primario', etiqueta = 'Cargando', className, ...rest }: SpinnerProps) {
  return (
    <svg role="status" aria-label={etiqueta} viewBox="0 0 24 24" fill="none"
      className={cn('animate-spin motion-reduce:animate-none', TAM[tamano], COLOR[tipo], className)} {...rest}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
