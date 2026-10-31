import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn, fuente } from './cn';

export type DialogProps = {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children?: ReactNode;
  /** Botones de acción, normalmente un Button primario y uno terciario. */
  acciones?: ReactNode;
  className?: string;
};

/** Modal centrado sobre <dialog>: el navegador gestiona el foco, Esc y el fondo inerte. */
export function Dialog({ abierto, onCerrar, titulo, children, acciones, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null); const idTitulo = useId();
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (abierto && !d.open) d.showModal(); else if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog ref={ref} aria-labelledby={idTitulo} onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) onCerrar(); }}
      className={cn('m-auto w-[min(32rem,calc(100vw-2rem))] rounded-(--radius-l) border border-(--color-border-primary) bg-(--color-background-primary) p-0 text-(--color-content-primary) shadow-(--shadow-elevation-2) backdrop:bg-black/40', fuente, className)}>
      <div className="flex flex-col gap-(--space-m) p-(--space-l)">
        <h2 id={idTitulo} className="text-(length:--font-size-xl) font-semibold">{titulo}</h2>
        <div className="text-(length:--font-size-m) text-(--color-content-secondary)">{children}</div>
        {acciones && <div className="flex flex-wrap justify-end gap-(--space-s)">{acciones}</div>}
      </div>
    </dialog>
  );
}
