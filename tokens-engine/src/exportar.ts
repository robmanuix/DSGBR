/**
 * Exportación de tokens a W3C (DTCG), CSS, Tailwind v4, Swift y Kotlin.
 * Entrada: un modelo neutro de las variables de Figma (el plugin lo arma leyendo el archivo).
 */
export type Valor = number | string | { hex: string; a: number } | { alias: string };
export interface VarModelo {
  coleccion: string;
  modos: string[];
  nombre: string;
  tipo: 'COLOR' | 'FLOAT' | 'STRING';
  valores: Record<string, Valor>;
  codeSyntax?: { WEB?: string; ANDROID?: string; iOS?: string };
}
export interface ArchivoSalida { nombre: string; contenido: string }

const clave = (c: string, n: string) => `${c}::${n}`;
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esAlias = (v: Valor): v is { alias: string } => typeof v === 'object' && v !== null && 'alias' in v;
const esColor = (v: Valor): v is { hex: string; a: number } => typeof v === 'object' && v !== null && 'hex' in v;
const PESOS: Record<string, number> = { thin: 100, extralight: 200, light: 300, regular: 400, normal: 400, medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, black: 900 };
export const pesoNumerico = (s: string) => PESOS[s.toLowerCase().replace(/[\s-]/g, '')] ?? 400;

/** Colecciones que no se exportan: son internas de los componentes. */
const omitida = (c: string) => c.startsWith('Ícono:');
const esFamilia = (n: string) => /^Familia/.test(n) || /\/Familia$/.test(n) || n === 'Familia';
const esPeso = (n: string) => /^Peso\//.test(n) || /\/Peso$/.test(n);

export class Modelo {
  vars: VarModelo[];
  mapa = new Map<string, VarModelo>();
  constructor(vars: VarModelo[]) {
    this.vars = vars.filter((v) => !omitida(v.coleccion));
    for (const v of this.vars) this.mapa.set(clave(v.coleccion, v.nombre), v);
  }
  /** Valor final (sin alias) en un modo; si el destino no tiene ese modo usa el primero. */
  resolver(v: VarModelo, modo: string, vistos = 0): Exclude<Valor, { alias: string }> {
    const x = v.valores[modo] ?? v.valores[v.modos[0]];
    if (!esAlias(x)) return x;
    const t = this.mapa.get(x.alias);
    if (!t || vistos > 20) throw new Error(`Alias roto: ${x.alias}`);
    return this.resolver(t, t.modos.includes(modo) ? modo : t.modos[0], vistos + 1);
  }
}

// ---------- Nombres ----------
function nombreWeb(v: VarModelo): string {
  const m = v.codeSyntax?.WEB?.match(/var\((--[^)]+)\)/);
  return m ? m[1] : `--${slug(v.coleccion)}-${slug(v.nombre)}`;
}
function nombreNativo(v: VarModelo, plat: 'iOS' | 'ANDROID'): string {
  const cs = v.codeSyntax?.[plat];
  if (cs) return cs.replace(/^Color\./, '');
  const partes = `${slug(v.coleccion)}-${slug(v.nombre)}`.split('-');
  return partes.map((p, i) => (i ? p[0].toUpperCase() + p.slice(1) : p)).join('');
}

// ---------- CSS ----------
const rgbaCss = (c: { hex: string; a: number }) => {
  if (c.a >= 1) return c.hex.toLowerCase();
  const n = c.hex.replace('#', '');
  return `rgb(${parseInt(n.slice(0, 2), 16)} ${parseInt(n.slice(2, 4), 16)} ${parseInt(n.slice(4, 6), 16)} / ${Math.round(c.a * 1000) / 1000})`;
};
function numCss(v: VarModelo, n: number): string {
  if (v.coleccion === 'Movimiento' && /^Duración/.test(v.nombre)) return `${n}ms`;
  if (/^Columnas/.test(v.nombre)) return String(n);
  return n === 0 ? '0' : `${n}px`;
}
function valorCss(m: Modelo, v: VarModelo, modo: string): string {
  const x = v.valores[modo] ?? v.valores[v.modos[0]];
  if (esAlias(x)) {
    const t = m.mapa.get(x.alias);
    if (!t) throw new Error(`Alias roto: ${x.alias}`);
    return `var(${nombreWeb(t)})`;
  }
  if (esColor(x)) return rgbaCss(x);
  if (typeof x === 'number') return numCss(v, x);
  if (esPeso(v.nombre)) return String(pesoNumerico(x));
  if (esFamilia(v.nombre)) return `"${x}"`;
  return x;
}
const BLOQUE_OSCURO = new Set(['Semánticos: Color', 'Semánticos: Color para datos', 'Elevación']);

export function generarCss(m: Modelo): string {
  const base: string[] = [], oscuro: string[] = [], reducido: string[] = [], movil: string[] = [];
  for (const v of m.vars) {
    if (v.coleccion === 'Semánticos: Tipografía App') continue;
    const n = nombreWeb(v);
    const b = valorCss(m, v, v.modos[0]);
    base.push(`  ${n}: ${b};`);
    const otro = v.modos[1];
    if (!otro) continue;
    const o = valorCss(m, v, otro);
    if (o === b) continue;
    if (BLOQUE_OSCURO.has(v.coleccion)) oscuro.push(`    ${n}: ${o};`);
    else if (v.coleccion === 'Movimiento') reducido.push(`    ${n}: ${o};`);
    else if (v.coleccion === 'Semánticos: Tipografía Web') movil.push(`    ${n}: ${o};`);
  }
  // Sombras compuestas: --shadow-n1 = capa 1, capa 2…
  const sombras: string[] = [];
  const niveles = new Set<string>();
  for (const v of m.vars) { const r = v.nombre.match(/^Sombra\/(N\d)\//); if (v.coleccion === 'Elevación' && r) niveles.add(r[1]); }
  for (const nivel of [...niveles].sort()) {
    const capas: string[] = [];
    for (const k of [1, 2, 3]) {
      const g = (s: string) => m.mapa.get(clave('Elevación', `Sombra/${nivel}/Capa ${k}/${s}`));
      const c = g('Color'), d = g('Desenfoque'), y = g('Desplazamiento Y');
      if (c && d && y) capas.push(`0 var(${nombreWeb(y)}) var(${nombreWeb(d)}) var(${nombreWeb(c)})`);
    }
    if (capas.length) sombras.push(`  --shadow-${nivel.toLowerCase()}: ${capas.join(', ')};`);
  }
  const bp = m.mapa.get(clave('Retícula', 'Breakpoint/M'));
  const bpM = bp ? Number(m.resolver(bp, bp.modos[0])) - 1 : 767;
  const partes = ['/* Generado por DSGBR. No editar a mano. */', `:root {\n${[...base, ...sombras].join('\n')}\n}`];
  if (oscuro.length) {
    partes.push(`:root[data-theme="dark"] {\n${oscuro.map((l) => l.slice(2)).join('\n')}\n}`);
    partes.push(`@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${oscuro.map((l) => '  ' + l).join('\n')}\n  }\n}`);
  }
  if (movil.length) partes.push(`@media (max-width: ${bpM}px) {\n  :root {\n${movil.join('\n')}\n  }\n}`);
  if (reducido.length) partes.push(`@media (prefers-reduced-motion: reduce) {\n  :root {\n${reducido.join('\n')}\n  }\n}`);
  return partes.join('\n\n') + '\n';
}

/** Tailwind v4: los primitivos de color, radios, breakpoints, sombras y familia entran al tema. */
export function generarTailwind(m: Modelo): string {
  const lin: string[] = [];
  for (const v of m.vars) {
    const n = nombreWeb(v);
    if (v.coleccion === 'Primitivos: Color' && n.startsWith('--color-')) lin.push(`  ${n}: ${valorCss(m, { ...v, valores: { [v.modos[0]]: m.resolver(v, v.modos[0]) } }, v.modos[0])};`);
    else if (v.coleccion === 'Borde' && n.startsWith('--radius-')) lin.push(`  ${n}: ${valorCss(m, { ...v, valores: { [v.modos[0]]: m.resolver(v, v.modos[0]) } }, v.modos[0])};`);
    else if (v.coleccion === 'Retícula' && /^Breakpoint\//.test(v.nombre)) lin.push(`  --breakpoint-${slug(v.nombre.split('/')[1])}: ${m.resolver(v, v.modos[0])}px;`);
    else if (v.coleccion === 'Primitivos: Tipografía' && v.nombre === 'Familia/Marca') lin.push(`  --font-brand: "${m.resolver(v, v.modos[0])}", system-ui, sans-serif;`);
  }
  const css = generarCss(m);
  const sombras = css.split('\n').filter((l) => /^\s+--shadow-n\d:/.test(l)).map((l) => l.replace('--shadow-n', '--shadow-elevation-'));
  return ['/* Generado por DSGBR. Importa tokens.css antes que este archivo. */', '@theme {', ...lin, ...sombras, '}', ''].join('\n');
}

// ---------- JSON W3C (DTCG) ----------
const refDtcg = (alias: string) => { const [c, n] = alias.split('::'); return `{${[slug(c), ...n.split('/').map(slug)].join('.')}}`; };
function tipoDtcg(v: VarModelo, x: Exclude<Valor, { alias: string }>): { $type: string; $value: unknown } {
  if (esColor(x)) return { $type: 'color', $value: x.a >= 1 ? x.hex.toLowerCase() : rgbaCss(x) };
  if (typeof x === 'number') return { $type: 'number', $value: x };
  if (esPeso(v.nombre)) return { $type: 'fontWeight', $value: pesoNumerico(x) };
  if (esFamilia(v.nombre)) return { $type: 'fontFamily', $value: x };
  const cb = x.match(/^cubic-bezier\(([^)]+)\)$/);
  if (cb) return { $type: 'cubicBezier', $value: cb[1].split(',').map((n) => Number(n.trim())) };
  return { $type: 'string', $value: x };
}
export function generarJson(m: Modelo): string {
  const raiz: Record<string, any> = {};
  for (const v of m.vars) {
    const ruta = [slug(v.coleccion), ...v.nombre.split('/').map(slug)];
    let nodo = raiz;
    for (const p of ruta.slice(0, -1)) nodo = nodo[p] ??= {};
    const x = v.valores[v.modos[0]];
    const final = m.resolver(v, v.modos[0]);
    const t = tipoDtcg(v, final);
    const tok: Record<string, unknown> = { $type: t.$type, $value: esAlias(x) ? refDtcg(x.alias) : t.$value };
    const ext: Record<string, unknown> = { nombre: v.nombre, coleccion: v.coleccion, modoBase: v.modos[0] };
    if (v.codeSyntax) ext.codeSyntax = v.codeSyntax;
    const modos: Record<string, unknown> = {};
    for (const mo of v.modos.slice(1)) {
      const y = v.valores[mo];
      modos[mo] = esAlias(y) ? refDtcg(y.alias) : tipoDtcg(v, m.resolver(v, mo)).$value;
    }
    if (Object.keys(modos).length) ext.modos = modos;
    tok.$extensions = { 'com.dsgbr': ext };
    nodo[ruta[ruta.length - 1]] = tok;
  }
  return JSON.stringify({ $description: 'Tokens generados por DSGBR (W3C Design Tokens)', ...raiz }, null, 2) + '\n';
}

// ---------- Nativo ----------
const hex8 = (c: { hex: string; a: number }) => (Math.round(c.a * 255).toString(16).padStart(2, '0') + c.hex.replace('#', '')).toUpperCase();
const NATIVO_OMITE_MODO: Record<string, string> = { 'Semánticos: Tipografía App': '' };
function nativos(m: Modelo, modoApp: 'iOS' | 'Android') {
  // Para nativo: tipografía solo de la colección App, y se omite la tipografía Web.
  return m.vars.filter((v) => v.coleccion !== 'Semánticos: Tipografía Web').map((v) => ({
    v,
    modo: v.coleccion in NATIVO_OMITE_MODO ? modoApp : v.modos[0],
  }));
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function generarSwift(m: Modelo): string {
  const colores: string[] = [], semC: string[] = [], nums: string[] = [], strs: string[] = [];
  const nom = new Set<string>();
  for (const { v, modo } of nativos(m, 'iOS')) {
    const n = nombreNativo(v, 'iOS');
    if (nom.has(n)) continue;
    nom.add(n);
    const x = m.resolver(v, modo);
    if (esColor(x)) {
      if (v.modos.length > 1 && v.modos[1] === 'Oscuro') {
        const o = m.resolver(v, 'Oscuro') as { hex: string; a: number };
        if (!v.coleccion.startsWith('Elevación')) semC.push(`    public static let ${n} = Color(light: 0x${hex8(x)}, dark: 0x${hex8(o)})`);
      } else colores.push(`    public static let ${n} = Color(argb: 0x${hex8(x)})`);
    } else if (typeof x === 'number') {
      if (v.coleccion === 'Elevación' || v.coleccion === 'Movimiento') nums.push(`    public static let ${n}: Double = ${x}`);
      else if (/^Columnas/.test(v.nombre)) nums.push(`    public static let ${n}: Int = ${x}`);
      else nums.push(`    public static let ${n}: CGFloat = ${x}`);
    } else if (esPeso(v.nombre)) strs.push(`    public static let ${n}: Font.Weight = ${swiftPeso(pesoNumerico(x))}`);
    else strs.push(`    public static let ${n} = ${JSON.stringify(x)}`);
  }
  return `// Generado por DSGBR. No editar a mano.
import SwiftUI
import UIKit

extension Color {
    init(argb: UInt32) {
        self.init(.sRGB,
                  red: Double((argb >> 16) & 0xFF) / 255,
                  green: Double((argb >> 8) & 0xFF) / 255,
                  blue: Double(argb & 0xFF) / 255,
                  opacity: Double((argb >> 24) & 0xFF) / 255)
    }
    /// Color que cambia solo entre claro y oscuro.
    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(argb: dark)) : UIColor(Color(argb: light)) })
    }
}

// Colores primitivos
extension Color {
${colores.join('\n')}
}

// Colores semánticos (claro y oscuro)
extension Color {
${semC.join('\n')}
}

// Medidas, tipografía y movimiento
public enum DS {
${nums.join('\n')}
${strs.join('\n')}
}
`;
}
const swiftPeso = (n: number) => ({ 100: '.ultraLight', 200: '.thin', 300: '.light', 400: '.regular', 500: '.medium', 600: '.semibold', 700: '.bold', 800: '.heavy', 900: '.black' } as Record<number, string>)[n] ?? '.regular';
const ktPeso = (n: number) => `FontWeight.W${n}`;

export function generarKotlin(m: Modelo): string {
  const prim: string[] = [], claro: string[] = [], oscuro: string[] = [], nums: string[] = [];
  const nom = new Set<string>();
  for (const { v, modo } of nativos(m, 'Android')) {
    const n = nombreNativo(v, 'ANDROID');
    if (nom.has(n)) continue;
    nom.add(n);
    const x = m.resolver(v, modo);
    if (esColor(x)) {
      if (v.modos.length > 1 && v.modos[1] === 'Oscuro') {
        if (v.coleccion === 'Elevación') continue;
        claro.push(`        val ${n} = Color(0x${hex8(x)})`);
        oscuro.push(`        val ${n} = Color(0x${hex8(m.resolver(v, 'Oscuro') as { hex: string; a: number })})`);
      } else prim.push(`    val ${n} = Color(0x${hex8(x)})`);
    } else if (typeof x === 'number') {
      const sp = /(^|\/)(Tamaño|Interlineado|Espaciado de letras)(\/|$)/.test(v.nombre) && v.coleccion.includes('Tipograf');
      if (v.coleccion === 'Movimiento' || /^Columnas/.test(v.nombre)) nums.push(`    const val ${n} = ${x}`);
      else nums.push(`    val ${n} = ${x}.${sp ? 'sp' : 'dp'}`);
    } else if (esPeso(v.nombre)) nums.push(`    val ${n} = ${ktPeso(pesoNumerico(x))}`);
    else nums.push(`    const val ${n} = ${JSON.stringify(x)}`);
  }
  const objetoCapas = (nombre: string, filas: string[]) => `    object ${nombre} {\n${filas.join('\n')}\n    }`;
  return `// Generado por DSGBR. No editar a mano.
package ds.tokens

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object DsTokens {
${prim.join('\n')}

${objetoCapas('Claro', claro)}

${objetoCapas('Oscuro', oscuro)}

${nums.join('\n')}
}
`;
}

export interface EstiloTexto { nombre: string; familia: string; estilo: string; tamano: number; altura: number; espaciado: number }
export interface EstiloEfecto { nombre: string; sombras: { x: number; y: number; blur: number; spread: number; color: string }[] }
export interface DatosMarca { cliente: string; base: string; plataformas: string[]; version: string; archivo?: string; colores?: { nombre: string; hex: string }[]; tipografia?: string }
export interface ExtraExport { marca?: DatosMarca; estilosTexto?: EstiloTexto[]; estilosEfecto?: EstiloEfecto[]; fecha?: string }

/** Configuración del DocSite: datos de la marca guardados en el archivo de Figma. */
export function generarConfig(d: DatosMarca, fecha: string): string {
  return JSON.stringify({
    cliente: d.cliente, marca: d.cliente, base: d.base, plataformas: d.plataformas,
    version: d.version, generado: fecha, archivoFigma: d.archivo ?? '',
    colores: d.colores ?? [], tipografia: d.tipografia ?? '',
  }, null, 2) + '\n';
}

/** Estilos de texto y de efecto del archivo, listos para mostrar en el DocSite. */
export function generarEstilos(texto: EstiloTexto[], efectos: EstiloEfecto[]): string {
  const css = (e: EstiloEfecto) => e.sombras.map((o) => `${o.x}px ${o.y}px ${o.blur}px ${o.spread}px ${o.color}`).join(', ');
  return JSON.stringify({
    texto: texto.map((t) => ({ ...t, peso: pesoNumerico(t.estilo) })),
    efectos: efectos.map((e) => ({ nombre: e.nombre, css: css(e) })),
  }, null, 2) + '\n';
}

export function exportarTodo(vars: VarModelo[], extra: ExtraExport = {}): ArchivoSalida[] {
  const m = new Modelo(vars);
  const adicionales: ArchivoSalida[] = [];
  if (extra.marca) adicionales.push({ nombre: 'docsite.config.json', contenido: generarConfig(extra.marca, extra.fecha ?? new Date().toISOString().slice(0, 10)) });
  if (extra.estilosTexto || extra.estilosEfecto) adicionales.push({ nombre: 'estilos.json', contenido: generarEstilos(extra.estilosTexto ?? [], extra.estilosEfecto ?? []) });
  return [
    ...adicionales,
    { nombre: 'tokens.json', contenido: generarJson(m) },
    { nombre: 'tokens.css', contenido: generarCss(m) },
    { nombre: 'tailwind.css', contenido: generarTailwind(m) },
    { nombre: 'DSTokens.swift', contenido: generarSwift(m) },
    { nombre: 'DsTokens.kt', contenido: generarKotlin(m) },
  ];
}
