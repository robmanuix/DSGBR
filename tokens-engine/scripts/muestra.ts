/** Genera un conjunto de tokens de muestra (mismo formato que el plugin) para probar la plantilla del DocSite. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { brandRamp, neutralRamp, STEPS } from '../src/index.js';
import { exportarTodo, type VarModelo } from '../src/exportar.js';

const hex = process.argv[2] || '#3366E6';
const salida = process.argv[3] || '../dsgbr-docsite-template/muestra';
const c = (h: string) => ({ hex: h.toUpperCase(), a: 1 });
const cs = (web: string, nat: string) => ({ WEB: `var(--${web})`, ANDROID: nat, iOS: nat });
const v: VarModelo[] = [];
const prim = (n: string, h: string, web: string, nat: string) => v.push({ coleccion: 'Primitivos: Color', modos: ['Valor'], nombre: n, tipo: 'COLOR', valores: { Valor: c(h) }, codeSyntax: cs(web, nat) });
const r = brandRamp(hex);
for (const s of STEPS) prim(`Brand/${s}`, r[s], `color-brand-${s}`, `brand${s}`);
const n = neutralRamp(hex);
for (const s of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) prim(`Neutro/${s}`, n[s], `color-neutral-${s}`, `neutral${s}`);
prim('Base/Blanco', '#FFFFFF', 'color-base-white', 'baseWhite');
const sem = (nom: string, cl: string, os: string, web: string, nat: string) => v.push({ coleccion: 'Semánticos: Color', modos: ['Claro', 'Oscuro'], nombre: nom, tipo: 'COLOR', valores: { Claro: { alias: `Primitivos: Color::${cl}` }, Oscuro: { alias: `Primitivos: Color::${os}` } }, codeSyntax: cs(web, nat) });
sem('Fondo/Primario', 'Base/Blanco', 'Neutro/950', 'color-background-primary', 'backgroundPrimary');
sem('Fondo/Hover', 'Neutro/100', 'Neutro/900', 'color-background-hover', 'backgroundHover');
sem('Fondo/Marca', 'Brand/600', 'Brand/400', 'color-background-brand', 'backgroundBrand');
sem('Fondo/Seleccionado', 'Brand/100', 'Brand/900', 'color-background-selected', 'backgroundSelected');
sem('Contenido/Primario', 'Neutro/900', 'Base/Blanco', 'color-content-primary', 'contentPrimary');
sem('Contenido/Secundario', 'Neutro/600', 'Neutro/300', 'color-content-secondary', 'contentSecondary');
sem('Contenido/Marca', 'Brand/600', 'Brand/300', 'color-content-brand', 'contentBrand');
sem('Contenido/Enlace', 'Brand/600', 'Brand/300', 'color-content-link', 'contentLink');
sem('Borde/Primario', 'Neutro/300', 'Neutro/700', 'color-border-primary', 'borderPrimary');
sem('Borde/Marca', 'Brand/500', 'Brand/400', 'color-border-brand', 'borderBrand');
const num = (col: string, nom: string, val: number | { alias: string }, web: string, nat: string) => v.push({ coleccion: col, modos: ['Valor'], nombre: nom, tipo: 'FLOAT', valores: { Valor: val }, codeSyntax: cs(web, nat) });
for (const u of [2, 4, 8, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 72]) num('Unidad', `Unidad/${u}`, u, `unit-${u}`, `unit${u}`);
const esp: [string, number][] = [['2XS', 2], ['XS', 4], ['S', 8], ['M', 12], ['L', 16], ['XL', 24], ['2XL', 32], ['3XL', 40], ['4XL', 48]];
for (const [k, u] of esp) num('Espaciado', `Espacio/${k}`, { alias: `Unidad::Unidad/${u}` }, `space-${k.toLowerCase()}`, `space${k[0] + k.slice(1).toLowerCase()}`.replace('Space2xs', 'space2xs').replace('Space2xl', 'space2xl').replace('Space3xl', 'space3xl').replace('Space4xl', 'space4xl'));
for (const [k, px] of [['Ninguno', 0], ['XS', 6], ['S', 10], ['M', 14], ['L', 18], ['XL', 28], ['Píldora', 999]] as [string, number][]) num('Borde', `Radio/${k}`, px, `radius-${k === 'Píldora' ? 'pill' : k.toLowerCase()}`, `radius${k === 'Píldora' ? 'Pill' : k === 'Ninguno' ? 'None' : k[0] + k.slice(1).toLowerCase()}`);
for (const [k, px] of [['XS', 1], ['S', 1.5], ['M', 2]] as [string, number][]) num('Borde', `Grosor/${k}`, px, `border-width-${k.toLowerCase()}`, `borderWidth${k}`);
const str = (col: string, nom: string, val: string, web: string, nat: string) => v.push({ coleccion: col, modos: ['Valor'], nombre: nom, tipo: 'STRING', valores: { Valor: val }, codeSyntax: cs(web, nat) });
str('Primitivos: Tipografía', 'Familia/Marca', 'Inter', 'font-family-brand', 'fontFamilyBrand');
str('Primitivos: Tipografía', 'Peso/Regular', 'Regular', 'font-weight-regular', 'fontWeightRegular');
str('Primitivos: Tipografía', 'Peso/Seminegrita', 'Semi Bold', 'font-weight-semibold', 'fontWeightSemibold');
for (const [k, u] of [['XS', 12], ['S', 14], ['M', 16], ['L', 18], ['XL', 20], ['2XL', 24], ['3XL', 32]] as [string, number][]) num('Primitivos: Tipografía', `Tamaño/${k}`, { alias: `Unidad::Unidad/${u}` }, `font-size-${k.toLowerCase()}`, `fontSize${k[0] + k.slice(1).toLowerCase()}`);
const sh: [number, number, number, number][][] = [[[0.05, 2, 0, 1], [0.07, 4, 2, 2]], [[0.05, 4, 0, 1], [0.09, 8, 4, 2]]];
sh.forEach((capas, i) => capas.forEach(([a, bl, y], k) => {
  const base = `Sombra/N${i + 1}/Capa ${k + 1}`, w = `elevation-${i + 1}-layer-${k + 1}`, nt = `elevation${i + 1}Layer${k + 1}`;
  v.push({ coleccion: 'Elevación', modos: ['Claro', 'Oscuro'], nombre: `${base}/Color`, tipo: 'COLOR', valores: { Claro: { hex: '#000000', a }, Oscuro: { hex: '#000000', a: Math.min(1, a * 4) } }, codeSyntax: cs(`${w}-color`, `${nt}Color`) });
  v.push({ coleccion: 'Elevación', modos: ['Claro', 'Oscuro'], nombre: `${base}/Desenfoque`, tipo: 'FLOAT', valores: { Claro: bl, Oscuro: bl }, codeSyntax: cs(`${w}-blur`, `${nt}Blur`) });
  v.push({ coleccion: 'Elevación', modos: ['Claro', 'Oscuro'], nombre: `${base}/Desplazamiento Y`, tipo: 'FLOAT', valores: { Claro: y, Oscuro: y }, codeSyntax: cs(`${w}-offset-y`, `${nt}OffsetY`) });
}));
for (const [k, ms, web] of [['Rápida', 120, 'fast'], ['Media', 220, 'medium'], ['Lenta', 320, 'slow'], ['Énfasis', 480, 'emphasis']] as [string, number, string][])
  v.push({ coleccion: 'Movimiento', modos: ['Normal', 'Reducido'], nombre: `Duración/${k}`, tipo: 'FLOAT', valores: { Normal: ms, Reducido: 0 }, codeSyntax: cs(`motion-duration-${web}`, `motionDuration${web[0].toUpperCase() + web.slice(1)}`) });
for (const [k, cb, web] of [['Estándar', 'cubic-bezier(0.2, 0, 0, 1)', 'standard'], ['Entrada', 'cubic-bezier(0, 0, 0, 1)', 'enter'], ['Salida', 'cubic-bezier(0.3, 0, 1, 1)', 'exit']] as [string, string, string][])
  v.push({ coleccion: 'Movimiento', modos: ['Normal', 'Reducido'], nombre: `Curva/${k}`, tipo: 'STRING', valores: { Normal: cb, Reducido: 'linear' }, codeSyntax: cs(`motion-easing-${web}`, `motionEasing${web[0].toUpperCase() + web.slice(1)}`) });

mkdirSync(`${salida}/tokens`, { recursive: true });
mkdirSync(`${salida}/build/web`, { recursive: true });
mkdirSync(`${salida}/build/ios`, { recursive: true });
mkdirSync(`${salida}/build/android`, { recursive: true });
for (const a of exportarTodo(v)) {
  const dir = a.nombre === 'tokens.json' ? 'tokens' : a.nombre.endsWith('.swift') ? 'build/ios' : a.nombre.endsWith('.kt') ? 'build/android' : 'build/web';
  writeFileSync(`${salida}/${dir}/${a.nombre}`, a.contenido);
}
console.log('Muestra generada en', salida, '(', v.length, 'variables )');
