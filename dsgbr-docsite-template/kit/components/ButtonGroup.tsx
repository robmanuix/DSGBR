import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & { orientacion?: 'horizontal' | 'vertical' };

/** Agrupa botones con el espacio de la marca. Para la versión píldora, pasa `pildora` a cada Button. */
export function ButtonGroup({ orientacion = 'horizontal', className, ...rest }: ButtonGroupProps) {
  return <div role="group" className={cn('flex gap-(--space-s)', orientacion === 'vertical' ? 'flex-col items-stretch' : 'flex-row items-center', className)} {...rest} />;
}
