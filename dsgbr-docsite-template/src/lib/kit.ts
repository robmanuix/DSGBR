import { existsSync, readFileSync, readdirSync } from 'node:fs';

export type PropKit = { nombre: string; valores: string };
export type ComponenteKit = {
  clave: string; nombre: string; props: PropKit[];
  tokens: { nombre: string; grupo: string; existe: boolean }[];
};

const NOMBRES: Record<string, string> = {
  Button: 'Botón', IconButton: 'Botón de ícono', ButtonGroup: 'Grupo de botones', Input: 'Campo de texto', HelpText: 'Texto de ayuda',
  Checkbox: 'Casilla', Radio: 'Opción', Switch: 'Interruptor', Select: 'Selector', Alert: 'Alerta', Spinner: 'Indicador de carga',
  Tabs: 'Pestañas', Dialog: 'Diálogo',
};
const GRUPOS: [RegExp, string][] = [
  [/^--color-/, 'Color'], [/^--radius-/, 'Radio'], [/^--font-/, 'Tipografía'], [/^--space-/, 'Espacio'],
  [/^--motion-/, 'Movimiento'], [/^--shadow-|^--elevation-/, 'Elevación'], [/^--border-width-/, 'Borde'],
];

/** Variables CSS que define la marca (build/web/tokens.css y tailwind.css). */
function variablesDeLaMarca(): Set<string> {
  const v = new Set<string>();
  for (const f of ['build/web/tokens.css', 'build/web/tailwind.css']) {
    if (!existsSync(f)) continue;
    for (const m of readFileSync(f, 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/g)) v.add(m[1]);
  }
  return v;
}

/** Propiedades de cada componente: salen de la tabla de kit/README.md (una sola fuente). */
function propsDelReadme(): Record<string, PropKit[]> {
  if (!existsSync('kit/README.md')) return {};
  const out: Record<string, PropKit[]> = {};
  for (const linea of readFileSync('kit/README.md', 'utf8').split('\n')) {
    const m = linea.match(/^\|\s*(\w+)\s*\|\s*(.+?)\s*\|\s*$/);
    if (!m || m[1] === 'Componente') continue;
    out[m[1]] = m[2].split(' · ').map((p) => {
      const mm = p.trim().match(/^`([^`]+)`\s*(.*)$/);
      return { nombre: mm ? mm[1] : p.trim(), valores: mm ? mm[2] : '' };
    });
  }
  return out;
}

/** Componentes del kit con sus propiedades y los tokens que realmente usa su código. */
export function leerKit(): ComponenteKit[] {
  const dir = 'kit/components';
  if (!existsSync(dir)) return [];
  const marca = variablesDeLaMarca();
  const props = propsDelReadme();
  return readdirSync(dir).filter((f) => /^[A-Z]\w*\.tsx$/.test(f)).sort().map((f) => {
    const clave = f.replace('.tsx', '');
    const codigo = readFileSync(`${dir}/${f}`, 'utf8') + (clave === 'Input' || clave === 'Select' ? '' : '');
    const usados = [...new Set([...codigo.matchAll(/\(?(--[a-z][a-z0-9-]*)\)?/g)].map((m) => m[1]))]
      .filter((t) => GRUPOS.some(([re]) => re.test(t)))
      .map((t) => ({ nombre: t, grupo: GRUPOS.find(([re]) => re.test(t))![1], existe: marca.has(t) }));
    return { clave, nombre: NOMBRES[clave] ?? clave, props: props[clave] ?? [], tokens: usados };
  });
}
