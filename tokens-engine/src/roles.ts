import { contrast } from './color.js';
import { brandRamp, neutralRamp, STEPS, type Step } from './palette.js';

export type Mode = 'claro' | 'oscuro';
export interface RoleCheck { rol: string; sobre: string; ratio: number; minimo: number; cumple: boolean }

/** Roles semánticos mínimos (nombres en español del archivo maestro). */
export function semanticRoles(brandHex: string, mode: Mode) {
  const marca = brandRamp(brandHex);
  const n = neutralRamp(brandHex);
  const claro = mode === 'claro';
  const roles: Record<string, string> = {
    'Fondo/Primario': claro ? n[0] : n[1000],
    'Fondo/Secundario': claro ? n[50] : n[950],
    'Fondo/Inverso': claro ? n[900] : n[100],
    'Fondo/Marca': claro ? marca[600] : marca[400],
    'Contenido/Primario': claro ? n[900] : n[50],
    'Contenido/Secundario': claro ? n[700] : n[300],
    'Contenido/Terciario': claro ? n[600] : n[400],
    'Contenido/Primario Inverso': claro ? n[0] : n[900],
    'Contenido/Marca': claro ? marca[600] : marca[300],
    'Contenido/Enlace': claro ? marca[600] : marca[300],
    'Fondo/Seleccionado': claro ? marca[100] : marca[900],
    'Fondo/Marca Hover': claro ? marca[600] : marca[300],
    'Fondo/Marca Presionado': claro ? marca[700] : marca[200],
    'Borde/Marca': claro ? marca[500] : marca[400],
  };
  return roles;
}

const PAIRS: [string, string, number][] = [
  ['Contenido/Primario', 'Fondo/Primario', 4.5],
  ['Contenido/Secundario', 'Fondo/Primario', 4.5],
  ['Contenido/Terciario', 'Fondo/Primario', 4.5],
  ['Contenido/Primario', 'Fondo/Secundario', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Inverso', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Marca', 4.5],
  ['Contenido/Marca', 'Fondo/Primario', 4.5],
  ['Contenido/Enlace', 'Fondo/Primario', 4.5],
  ['Contenido/Primario', 'Fondo/Seleccionado', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Marca Hover', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Marca Presionado', 4.5],
  ['Borde/Marca', 'Fondo/Primario', 3],
];

/**
 * Roles que el plugin crea para cada color de marca adicional (Secondary, Tertiary…).
 * `{n}` se reemplaza por el nombre del color. Cada rol apunta a un paso de la rampa en cada modo.
 */
export const EXTRA_ROLES: { rol: string; claro: Step; oscuro: Step; tipo: 'texto' | 'fondo' | 'borde' }[] = [
  { rol: 'Contenido/{n}', claro: 600, oscuro: 300, tipo: 'texto' },
  { rol: 'Fondo/{n}', claro: 600, oscuro: 400, tipo: 'fondo' },
  { rol: 'Fondo/{n} Sutil', claro: 100, oscuro: 900, tipo: 'fondo' },
  { rol: 'Borde/{n}', claro: 500, oscuro: 400, tipo: 'borde' },
];

/** Contraste de los roles de un color adicional: texto del color sobre el fondo y texto inverso sobre su fondo sólido. */
export function checkExtra(nombre: string, hex: string, mode: Mode): RoleCheck[] {
  const base = semanticRoles(hex, mode);
  const r = brandRamp(hex);
  const claro = mode === 'claro';
  const texto = r[claro ? 600 : 300];
  const fondo = r[claro ? 600 : 400];
  const sutil = r[claro ? 100 : 900];
  const par = (rol: string, sobre: string, a: string, b: string, minimo: number): RoleCheck => {
    const ratio = Math.round(contrast(a, b) * 100) / 100;
    return { rol: rol.replace('{n}', nombre), sobre, ratio, minimo, cumple: ratio >= minimo };
  };
  return [
    par('Contenido/{n}', 'Fondo/Primario', texto, base['Fondo/Primario'], 4.5),
    par('Contenido/Primario Inverso', 'Fondo/{n}'.replace('{n}', nombre), base['Contenido/Primario Inverso'], fondo, 4.5),
    par('Contenido/Primario', 'Fondo/{n} Sutil'.replace('{n}', nombre), base['Contenido/Primario'], sutil, 4.5),
  ];
}

/** Verifica todos los pares texto/fondo de los roles generados. */
export function checkContrast(brandHex: string, mode: Mode): RoleCheck[] {
  const r = semanticRoles(brandHex, mode);
  return PAIRS.map(([rol, sobre, minimo]) => {
    const ratio = contrast(r[rol], r[sobre]);
    return { rol, sobre, ratio: Math.round(ratio * 100) / 100, minimo, cumple: ratio >= minimo };
  });
}

export { STEPS };
export type { Step };

// ---------- Sintaxis de código de los colores adicionales ----------
export type Sintaxis = { WEB: string; ANDROID: string; iOS: string };
const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const camel = (slug: string) => slug.split('-').map((p, i) => (i ? p[0].toUpperCase() + p.slice(1) : p)).join('');
/** Nombres que ya usan los roles base; un color adicional con uno de ellos recibe el sufijo «-accent» para no chocar. */
const RESERVADOS = ['primary', 'secondary', 'tertiary', 'brand', 'disabled', 'inverse', 'link', 'primario', 'secundario', 'terciario'];
export const slugColor = (nombre: string) => ascii(nombre) || 'color';

/** Sintaxis de un paso de la rampa primitiva de un color adicional, p. ej. `--color-secondary-500`. */
export function sintaxisPrimitivo(nombre: string, paso: number): Sintaxis {
  const s = slugColor(nombre);
  return { WEB: `var(--color-${s}-${paso})`, ANDROID: `${camel(s)}${paso}`, iOS: `Color.${camel(s)}${paso}` };
}

const TIPO_ROL: Record<string, string> = { Contenido: 'content', Fondo: 'background', Borde: 'border' };
const SUFIJO_ROL: Record<string, string> = { Sutil: 'subtle', Hover: 'hover', Presionado: 'pressed', Intenso: 'bold' };
/** Sintaxis de un rol semántico de color adicional, p. ej. `Fondo/Secondary Sutil` → `--color-background-secondary-accent-subtle`. */
export function sintaxisRolExtra(rol: string, nombre: string): Sintaxis {
  const [tipo, resto] = rol.split('/');
  const s0 = slugColor(nombre);
  const s = RESERVADOS.includes(s0) ? `${s0}-accent` : s0;
  const sufijos = resto.replace(nombre, '').trim().split(/\s+/).filter(Boolean).map((x) => SUFIJO_ROL[x] ?? ascii(x));
  const partes = [TIPO_ROL[tipo] ?? ascii(tipo), s, ...sufijos].join('-');
  return { WEB: `var(--color-${partes})`, ANDROID: camel(partes), iOS: `Color.${camel(partes)}` };
}

// ---------- Auditoría de contraste sobre los roles reales del archivo ----------
export interface AuditoriaPar extends RoleCheck { modo: Mode }

/** Pares texto/fondo (4,5:1) y borde/fondo (3:1) que el archivo debe cumplir en Claro y Oscuro. Deshabilitado queda exento (WCAG). */
export const PARES_AUDITORIA: [string, string, number][] = [
  ...['Primario', 'Secundario', 'Terciario'].flatMap((t): [string, string, number][] => [
    [`Contenido/${t}`, 'Fondo/Primario', 4.5], [`Contenido/${t}`, 'Superficie/N1', 4.5],
  ]),
  ['Contenido/Primario', 'Fondo/Secundario', 4.5],
  ['Contenido/Primario', 'Fondo/Hover', 4.5],
  ['Contenido/Primario', 'Fondo/Presionado', 4.5],
  ['Contenido/Primario', 'Fondo/Seleccionado', 4.5],
  ...['Primario', 'Secundario', 'Terciario'].map((t): [string, string, number] => [`Contenido/${t} Inverso`, 'Fondo/Inverso', 4.5]),
  ['Contenido/Primario Inverso', 'Fondo/Marca', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Marca Hover', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Marca Presionado', 4.5],
  ['Contenido/Marca', 'Fondo/Primario', 4.5],
  ['Contenido/Enlace', 'Fondo/Primario', 4.5],
  ['Contenido/Enlace Hover', 'Fondo/Primario', 4.5],
  ['Contenido/Enlace Presionado', 'Fondo/Primario', 4.5],
  ...['Aviso', 'Negativo', 'Positivo', 'Info'].flatMap((e): [string, string, number][] => [
    [`Contenido/${e}`, 'Fondo/Primario', 4.5],
    [`Contenido/${e} Intenso`, `Fondo/${e} Sutil`, 4.5],
    [`Contenido/${e}`, `Fondo/${e} Sutil`, 4.5],
  ]),
  ['Contenido/Primario Inverso', 'Fondo/Negativo', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Positivo', 4.5],
  ['Contenido/Primario Inverso', 'Fondo/Info', 4.5],
  ['Fondo/Aviso', 'Fondo/Primario', 3],
  ...['Primario', 'Marca', 'Foco', 'Info', 'Aviso', 'Negativo', 'Positivo'].map((b): [string, string, number] => [`Borde/${b}`, 'Fondo/Primario', 3]),
];

/** Revisa los pares sobre los colores reales. `color(rol, modo)` devuelve el hex resuelto o undefined si el rol no existe (el par se omite). */
export function auditarRoles(color: (rol: string, modo: Mode) => string | undefined): AuditoriaPar[] {
  const out: AuditoriaPar[] = [];
  for (const modo of ['claro', 'oscuro'] as Mode[]) {
    for (const [rol, sobre, minimo] of PARES_AUDITORIA) {
      const a = color(rol, modo), b = color(sobre, modo);
      if (!a || !b) continue;
      const ratio = Math.round(contrast(a, b) * 100) / 100;
      out.push({ rol, sobre, ratio, minimo, cumple: ratio >= minimo, modo });
    }
  }
  return out;
}
