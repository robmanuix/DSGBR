/** Une clases ignorando valores vacíos. */
export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/** Anillo de foco visible, común a todos los controles. */
export const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)';

/** Transición corta que respeta «reducir movimiento». */
export const transicion = 'transition-colors duration-(--motion-duration-fast) ease-(--motion-easing-standard) motion-reduce:transition-none';

/** Tipografía de la marca. */
export const fuente = 'font-(family-name:--font-family-brand)';
