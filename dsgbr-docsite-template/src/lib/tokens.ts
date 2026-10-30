import { readFileSync, existsSync } from 'node:fs';

export interface Token {
  ruta: string; coleccion: string; nombre: string; tipo: string;
  valor: any; modoBase: string; modos: Record<string, any>;
  codeSyntax?: { WEB?: string; ANDROID?: string; iOS?: string };
}

const raiz = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
export const config = existsSync('docsite.config.json') ? JSON.parse(readFileSync('docsite.config.json', 'utf8')) : {};
export const todos: Token[] = [];
const porRuta = new Map<string, Token>();
(function recorrer(nodo: any, ruta: string[]) {
  for (const [k, v] of Object.entries<any>(nodo)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const e = v.$extensions?.['com.dsgbr'] ?? {};
      const t: Token = { ruta: [...ruta, k].join('.'), coleccion: e.coleccion ?? ruta[0], nombre: e.nombre ?? k, tipo: v.$type, valor: v.$value, modoBase: e.modoBase ?? 'Valor', modos: e.modos ?? {}, codeSyntax: e.codeSyntax };
      todos.push(t); porRuta.set(t.ruta, t);
    } else if (v && typeof v === 'object') recorrer(v, [...ruta, k]);
  }
})(raiz, []);

/** Valor final de un token en un modo (sigue las referencias {a.b.c}). */
export function resolver(t: Token, modo?: string, prof = 0): any {
  let v = modo && modo !== t.modoBase && modo in t.modos ? t.modos[modo] : t.valor;
  if (typeof v === 'string' && /^\{.+\}$/.test(v)) {
    const dest = porRuta.get(v.slice(1, -1));
    if (!dest || prof > 20) return v;
    return resolver(dest, modo && modo in dest.modos ? modo : undefined, prof + 1);
  }
  return v;
}
export const deColeccion = (nombre: string) => todos.filter((t) => t.coleccion === nombre);
export const grupo = (t: Token) => t.nombre.split('/')[0];
export function agrupar<T>(xs: T[], f: (x: T) => string): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const x of xs) { const k = f(x); (m.get(k) ?? m.set(k, []).get(k)!).push(x); }
  return [...m.entries()];
}
export const cssVar = (t: Token) => t.codeSyntax?.WEB?.replace(/^var\((.*)\)$/, '$1') ?? '';

/** Texto legible de un valor resuelto (curvas Bézier como lista, números, texto). */
export function texto(v: any): string {
  if (Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;
  return String(v);
}

const lum = (hex: string) => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** Contraste WCAG entre dos colores hex. */
export function contraste(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const PARES: [string, string][] = [
  ['Contenido/Primario', 'Fondo/Primario'], ['Contenido/Secundario', 'Fondo/Primario'], ['Contenido/Marca', 'Fondo/Primario'],
  ['Contenido/Enlace', 'Fondo/Primario'], ['Contenido/Primario', 'Fondo/Seleccionado'], ['Contenido/Primario Inverso', 'Fondo/Marca'],
];
/** Pares texto/fondo presentes en los tokens, en claro y oscuro, con su razón de contraste. */
export function paresContraste() {
  const sem = todos.filter((t) => t.coleccion === 'Semánticos: Color');
  const por = (n: string) => sem.find((t) => t.nombre === n);
  const out: { texto: string; fondo: string; modo: string; razon: number; cumple: boolean }[] = [];
  for (const [a, b] of PARES) {
    const ta = por(a), tb = por(b);
    if (!ta || !tb) continue;
    for (const modo of ['Claro', 'Oscuro']) {
      const r = contraste(resolver(ta, modo), resolver(tb, modo));
      out.push({ texto: a, fondo: b, modo, razon: Math.round(r * 100) / 100, cumple: r >= 4.5 });
    }
  }
  return out;
}
