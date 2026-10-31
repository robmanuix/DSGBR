import { existsSync, readFileSync } from 'node:fs';

export type Brief = {
  sector?: string; propuesta?: string; publico?: string; idioma?: string;
  voz?: string; tono?: string; tratamiento?: string; mayusculas?: string;
  errores?: string; evitar?: string; ejemploBoton?: string; ejemploVacio?: string; fotografia?: string;
};

/** Brief de la marca (entrada/brief.json). Vacío si el plugin no lo exportó o no se llenó. */
export function leerBrief(): Brief {
  if (!existsSync('tokens/brief.json')) return {};
  try {
    const doc = JSON.parse(readFileSync('tokens/brief.json', 'utf8'));
    const b = doc?.brief ?? {};
    return Object.fromEntries(Object.entries(b).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, String(v).trim()])) as Brief;
  } catch { return {}; }
}

/** Separa «cálido, claro; directo» en una lista corta. */
export const lista = (t?: string): string[] => (t ?? '').split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean);

/** Separa un párrafo en líneas o frases para mostrarlo como lista. */
export const frases = (t?: string): string[] =>
  (t ?? '').split(/\n+|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/).map((x) => x.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
