import type { ReactNode } from 'react';

const Flecha = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Mas = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** Opciones para las propiedades de ícono en los controles. */
export const opcionesIcono = { ninguno: undefined as ReactNode, flecha: <Flecha />, mas: <Mas /> };
export const controlIcono = { control: 'select' as const, options: Object.keys(opcionesIcono), mapping: opcionesIcono };
