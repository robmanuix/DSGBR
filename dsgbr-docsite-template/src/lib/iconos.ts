import { existsSync, readFileSync } from 'node:fs';

export type Icono = { key: string; title: string; svg: string };

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Íconos que usa el proyecto de Figma (entrada/iconos.json). Vacío si no se exportaron. `tam` es el tamaño en px del SVG. */
export function iconosDelProyecto(tam: number): Icono[] {
  if (!existsSync('tokens/iconos.json')) return [];
  const doc = JSON.parse(readFileSync('tokens/iconos.json', 'utf8'));
  return (doc?.iconos ?? []).map((i: any) => ({
    key: i.clave, title: i.nombre, svg: String(i.svg).replace('<svg ', `<svg width="${tam}" height="${tam}" `),
  }));
}

/** Refleja un SVG de izquierda a derecha (para obtener la flecha contraria). */
function espejo(svg: string): string {
  const m = svg.match(/^(<svg[^>]*>)([\s\S]*)<\/svg>\s*$/);
  if (!m) return svg;
  const vb = m[1].match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+)/);
  return `${m[1]}<g transform="translate(${vb ? vb[1] : '16'} 0) scale(-1 1)">${m[2]}</g></svg>`;
}

/**
 * Listas para el selector izquierdo y el derecho. Los íconos con dirección (…izquierda / …derecha)
 * se espejan para que cada lado ofrezca ambos sentidos, y los de su propio sentido van primero.
 */
export function iconosPorLado(base: Icono[]): { izq: Icono[]; der: Icono[] } {
  const dir = (i: Icono) => (/izquierda/.test(norm(i.title)) ? 'izq' : /derecha/.test(norm(i.title)) ? 'der' : null);
  const lado = (a: 'izq' | 'der'): Icono[] => {
    const otro = a === 'izq' ? 'der' : 'izq';
    const propios = base.filter((i) => dir(i) !== otro);
    const nombres = new Set(propios.map((i) => norm(i.title)));
    const reflejados = base.filter((i) => dir(i) === otro)
      .map((i) => ({ key: `${i.key}-${a}`, title: i.title.replace(/derecha|izquierda/i, a === 'izq' ? 'izquierda' : 'derecha'), svg: espejo(i.svg) }))
      .filter((i) => !nombres.has(norm(i.title)));
    const todos = [...propios, ...reflejados];
    return [...todos.filter((i) => dir(i) === a), ...todos.filter((i) => dir(i) !== a)];
  };
  return { izq: lado('izq'), der: lado('der') };
}
