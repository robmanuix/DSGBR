import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn, foco, fuente, transicion } from './cn';

export type Pestana = { clave: string; etiqueta: string; contenido: ReactNode };
export type TabsProps = { pestanas: Pestana[]; inicial?: string; className?: string; 'aria-label'?: string };

/** Pestañas con indicador. Flechas, Inicio y Fin cambian de pestaña. */
export function Tabs({ pestanas, inicial, className, ...rest }: TabsProps) {
  const base = useId();
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.clave);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ir = (clave: string) => { setActiva(clave); refs.current[clave]?.focus(); };
  const tecla = (e: KeyboardEvent, i: number) => {
    const n = pestanas.length; let j = -1;
    if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
    if (j >= 0) { e.preventDefault(); ir(pestanas[j].clave); }
  };
  return (
    <div className={cn(fuente, className)}>
      <div role="tablist" aria-label={rest['aria-label']} className="flex gap-(--space-m) border-b border-(--color-border-primary)">
        {pestanas.map((p, i) => {
          const on = p.clave === activa;
          return (
            <button key={p.clave} ref={(n) => { refs.current[p.clave] = n; }} role="tab" type="button"
              id={`${base}-t-${p.clave}`} aria-selected={on} aria-controls={`${base}-p-${p.clave}`} tabIndex={on ? 0 : -1}
              onClick={() => setActiva(p.clave)} onKeyDown={(e) => tecla(e, i)}
              className={cn('-mb-px border-b-2 px-1 py-3 text-(length:--font-size-m) font-semibold', foco, transicion,
                on ? 'border-(--color-background-brand) text-(--color-content-brand)' : 'border-transparent text-(--color-content-secondary) hover:text-(--color-content-primary)')}>
              {p.etiqueta}
            </button>
          );
        })}
      </div>
      {pestanas.map((p) => (
        <div key={p.clave} role="tabpanel" id={`${base}-p-${p.clave}`} aria-labelledby={`${base}-t-${p.clave}`} hidden={p.clave !== activa} tabIndex={0}
          className={cn('pt-(--space-m) text-(--color-content-primary)', foco)}>
          {p.contenido}
        </div>
      ))}
    </div>
  );
}
