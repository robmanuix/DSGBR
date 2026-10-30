// Estructura estándar de páginas del archivo maestro DSGBR (sección 9A del documento de contexto).
export const SEP = '---';

export const PAGINAS_BASE: string[] = [
  '👋 Portada', SEP,
  '📋 Brief y marca', '↳ Resumen', '↳ Logo', '↳ Activos de marca', '↳ Contenido y tono', SEP,
  '🌈 Fundamentos', '↳ Color', '↳ Color para datos', '↳ Tipografía', '↳ Espaciado', '↳ Retícula', '↳ Bordes',
  '↳ Elevación', '↳ Movimiento', '↳ Accesibilidad', SEP,
  'ℹ︎ Iconografía', '↳ Íconos', '↳ Pictogramas', '↳ Ilustraciones',
];

const COMP = [
  'Botón', 'Botón píldora', 'Botón de ícono', 'Grupo de botones', 'Grupo de botones píldora', 'Campo de texto',
  'Texto de ayuda', 'Casilla', 'Opción', 'Alerta', 'Indicador de carga', 'Fila', 'Interruptor', 'Selector',
  'Pestañas', 'Diálogo',
];

export const PAGINAS_WEB: string[] = [SEP, '🖥️ Componentes Web', ...COMP.map((c) => `↳ ${c} · Web`)];
export const PAGINAS_APP: string[] = [
  SEP, '📱 Componentes App',
  ...COMP.map((c) => `↳ ${c} · App`), '↳ Botón fijo · App', '↳ Sistema · App',
];
export const PAGINAS_FINAL: string[] = [SEP, '🔨 Herramientas'];

export type Plataforma = 'web' | 'ios' | 'android';

/** Lista ordenada de páginas que debe tener el archivo según lo que eligió el usuario. */
export function paginasRequeridas(plataformas: Plataforma[], extras: string[]): string[] {
  const lista = [...PAGINAS_BASE];
  // Las páginas adicionales van al final de Brief y marca (antes del separador de Fundamentos).
  const iFund = lista.indexOf('🌈 Fundamentos');
  lista.splice(iFund - 1, 0, ...extras.map((e) => `↳ ${e}`));
  if (plataformas.includes('web')) lista.push(...PAGINAS_WEB);
  if (plataformas.includes('ios') || plataformas.includes('android')) lista.push(...PAGINAS_APP);
  lista.push(...PAGINAS_FINAL);
  return lista;
}

/** Páginas del maestro que pertenecen a una plataforma no elegida. */
export function paginasDeGrupo(grupo: 'web' | 'app'): string[] {
  return (grupo === 'web' ? PAGINAS_WEB : PAGINAS_APP).filter((p) => p !== SEP);
}
