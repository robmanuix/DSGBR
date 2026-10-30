// Adaptador: convierte tokens/tokens.json (generado por el plugin) a las formas que usan las páginas.
import { existsSync, readFileSync } from 'node:fs';
import { deColeccion, resolver, grupo } from '../lib/tokens';

// Estilos reales del archivo de Figma (los exporta el plugin). Si no existen, se arman desde las variables.
const estilos = existsSync('tokens/estilos.json') ? JSON.parse(readFileSync('tokens/estilos.json', 'utf8')) : null;

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
const hex = (v) => (typeof v === 'string' && v.startsWith('#') ? v : '#000000');

export const primColors = deColeccion('Primitivos: Color').map((t) => ({
  name: `${slug(grupo(t))}/${t.nombre.split('/').slice(1).join('/').toLowerCase()}`,
  hex: hex(resolver(t)),
  group: grupo(t),
}));

export const semColors = deColeccion('Semánticos: Color').map((t) => ({
  name: slug(t.nombre),
  hex: hex(resolver(t, 'Claro')),
  group: grupo(t),
}));

export const spacing = deColeccion('Espaciado').map((t) => ({ name: `espaciado/${slug(t.nombre.split('/')[1])}`, value: Number(resolver(t)) }));

export const borderRadius = deColeccion('Borde').filter((t) => t.nombre.startsWith('Radio/')).map((t) => ({
  name: `radio/${slug(t.nombre.split('/')[1])}`, value: Number(resolver(t)), label: t.nombre.split('/')[1],
}));

const tip = deColeccion('Primitivos: Tipografía');
const familia = String(resolver(tip.find((t) => t.nombre.startsWith('Familia/')) ?? { valor: 'Inter', modos: {}, modoBase: 'Valor' }));
export const fontFamily = familia;
const pesos = tip.filter((t) => t.nombre.startsWith('Peso/'));
const nombrePeso = (n) => (n >= 700 ? 'Bold' : n >= 600 ? 'SemiBold' : n >= 500 ? 'Medium' : 'Regular');
const pesoCuerpo = Number(resolver(pesos[0] ?? { valor: 400, modos: {}, modoBase: 'Valor' }));
const pesoTitulo = Number(resolver(pesos[pesos.length - 1] ?? { valor: 600, modos: {}, modoBase: 'Valor' }));
const variablesTexto = tip.filter((t) => t.nombre.startsWith('Tamaño/')).map((t) => {
  const px = Number(resolver(t));
  const titulo = px >= 24;
  return {
    name: `${titulo ? 'Título' : 'Cuerpo'}/${t.nombre.split('/')[1]}`, fontSize: px, family: familia,
    weight: nombrePeso(titulo ? pesoTitulo : pesoCuerpo), lineHeight: Math.round(px * (titulo ? 1.25 : 1.5)), category: titulo ? 'Títulos' : 'Cuerpo',
  };
}).reverse();
export const textStyles = estilos?.texto?.length
  ? estilos.texto.map((t) => ({ name: t.nombre, fontSize: t.tamano, family: t.familia, weight: nombrePeso(t.peso), lineHeight: t.altura, category: t.nombre.split('/').slice(0, 2).join(' · ') }))
  : variablesTexto;
export const textCategories = [...new Set(textStyles.map((t) => t.category))];
export const textSource = estilos?.texto?.length ? 'estilos' : 'variables';

const niveles = [...new Set(deColeccion('Elevación').map((t) => t.nombre.split('/')[1]))];
const capa = (n, c, campo) => deColeccion('Elevación').find((t) => t.nombre === `Sombra/${n}/Capa ${c}/${campo}`);
const efectosVariables = niveles.map((n) => ({
  name: `elevacion/${n.toLowerCase()}`, label: n,
  css: [1, 2].map((c) => `0 ${resolver(capa(n, c, 'Desplazamiento Y'))}px ${resolver(capa(n, c, 'Desenfoque'))}px ${resolver(capa(n, c, 'Color'))}`).join(', '),
}));
export const effectStyles = estilos?.efectos?.length
  ? estilos.efectos.map((e) => ({ name: `elevacion/${slug(e.nombre.split('/').pop())}`, label: e.nombre.split('/').pop(), css: e.css }))
  : efectosVariables;
