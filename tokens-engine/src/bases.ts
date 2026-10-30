/** Bases de diseño: valores de forma, espacio, elevación y movimiento que definen el carácter del sistema. */
export type BaseId = 'calma' | 'expresiva' | 'utilitaria';

export interface BaseDef {
  nombre: string;
  /** Radios en px (Ninguno y Píldora no cambian). */
  radio: { XS: number; S: number; M: number; L: number; XL: number };
  /** Multiplicadores sobre la elevación original: opacidad de la sombra y tamaño (desenfoque y desplazamiento). */
  sombra: { alfa: number; escala: number };
  /** Duraciones en ms (modo Normal; el modo Reducido siempre queda en 0). */
  duracion: { Rápida: number; Media: number; Lenta: number; Énfasis: number };
  /** Curva de entrada (opcional). */
  curvaEntrada?: string;
  /** Factor de densidad sobre el espaciado original (>1 más aireado, <1 más denso). */
  espacio: number;
}

export const BASES: Record<BaseId, BaseDef> = {
  calma: {
    nombre: 'Calma',
    radio: { XS: 6, S: 10, M: 14, L: 18, XL: 28 },
    sombra: { alfa: 0.8, escala: 1.2 },
    duracion: { Rápida: 120, Media: 220, Lenta: 320, Énfasis: 480 },
    espacio: 1.1,
  },
  expresiva: {
    nombre: 'Expresiva',
    radio: { XS: 4, S: 12, M: 20, L: 28, XL: 40 },
    sombra: { alfa: 0.55, escala: 1 },
    duracion: { Rápida: 140, Media: 260, Lenta: 400, Énfasis: 600 },
    curvaEntrada: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    espacio: 1,
  },
  utilitaria: {
    nombre: 'Utilitaria',
    radio: { XS: 2, S: 4, M: 6, L: 8, XL: 12 },
    sombra: { alfa: 0.35, escala: 0.5 },
    duracion: { Rápida: 80, Media: 120, Lenta: 180, Énfasis: 250 },
    espacio: 0.8,
  },
};

/** Valor más cercano de una lista (a igualdad, el menor). */
export function masCercano(valor: number, lista: number[]): number {
  return lista.reduce((mejor, x) => (Math.abs(x - valor) < Math.abs(mejor - valor) ? x : mejor), lista[0]);
}

/** Aplica la base a un paso de espaciado: devuelve el valor de la escala Unidad más cercano al original por el factor. */
export function espacioParaBase(unidadOriginal: number, base: BaseId, unidades: number[]): number {
  return masCercano(unidadOriginal * BASES[base].espacio, unidades);
}

/** Escala una capa de sombra a partir de sus valores originales. */
export function sombraParaBase(orig: { alfa: number; desenfoque: number; y: number }, base: BaseId) {
  const { alfa, escala } = BASES[base].sombra;
  return {
    alfa: Math.min(1, Math.round(orig.alfa * alfa * 1000) / 1000),
    desenfoque: Math.round(orig.desenfoque * escala),
    y: Math.round(orig.y * escala),
  };
}
