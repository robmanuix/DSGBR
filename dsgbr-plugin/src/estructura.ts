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

// ---------- Perfiles: cuánto del maestro se conserva en el archivo de cada cliente ----------
export type Perfil = 'completo' | 'estandar' | 'minimo';
export const PERFIL_TEXTO: Record<Perfil, string> = {
  completo: 'Completo: todo el maestro, sin quitar nada.',
  estandar: 'Estándar: quita las páginas vacías (Pictogramas, Ilustraciones) y los íconos sin uso.',
  minimo: 'Mínimo: solo Color y Tipografía en Fundamentos, 8 componentes por plataforma y los íconos que usan. Sin separadores ni Activos de marca.',
};
const VACIAS = ['↳ Pictogramas', '↳ Ilustraciones'];
const DOCS_MINIMO = ['↳ Activos de marca', '↳ Color para datos', '↳ Espaciado', '↳ Retícula', '↳ Bordes', '↳ Elevación', '↳ Movimiento', '↳ Accesibilidad'];
const COMP_MINIMO = ['Botón', 'Botón de ícono', 'Campo de texto', 'Texto de ayuda', 'Casilla', 'Opción', 'Interruptor', 'Alerta'];

/** Páginas que el perfil no conserva (sin contar los separadores, que el perfil Mínimo quita aparte). */
export function paginasFueraDePerfil(perfil: Perfil): string[] {
  if (perfil === 'completo') return [];
  const fuera = [...VACIAS];
  if (perfil === 'minimo') {
    fuera.push(...DOCS_MINIMO);
    for (const [grupo, sufijo] of [['web', 'Web'], ['app', 'App']] as const) {
      for (const p of paginasDeGrupo(grupo)) {
        if (!p.startsWith('↳ ')) continue; // las páginas índice («🖥️ Componentes Web») se conservan
        const base = p.replace(/^↳ /, '').replace(new RegExp(' · ' + sufijo + '$'), '');
        if (!COMP_MINIMO.includes(base)) fuera.push(p);
      }
    }
  }
  return fuera;
}

/** Lista ordenada de páginas que debe tener el archivo según lo que eligió el usuario. */
export function paginasRequeridas(plataformas: Plataforma[], extras: string[], perfil: Perfil = 'completo'): string[] {
  const lista = [...PAGINAS_BASE];
  // Las páginas adicionales van al final de Brief y marca (antes del separador de Fundamentos).
  const iFund = lista.indexOf('🌈 Fundamentos');
  lista.splice(iFund - 1, 0, ...extras.map((e) => `↳ ${e}`));
  if (plataformas.includes('web')) lista.push(...PAGINAS_WEB);
  if (plataformas.includes('ios') || plataformas.includes('android')) lista.push(...PAGINAS_APP);
  lista.push(...PAGINAS_FINAL);
  const fuera = new Set(paginasFueraDePerfil(perfil));
  return lista.filter((p) => !fuera.has(p) && !(perfil === 'minimo' && p === SEP));
}

/** Páginas del maestro que pertenecen a una plataforma no elegida. */
export function paginasDeGrupo(grupo: 'web' | 'app'): string[] {
  return (grupo === 'web' ? PAGINAS_WEB : PAGINAS_APP).filter((p) => p !== SEP);
}
