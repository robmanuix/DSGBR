import { hexToOklch, oklchToHex } from './color.js';

export const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type Step = (typeof STEPS)[number];
export type Ramp = Record<Step, string>;

// Luminosidad OKLCH objetivo por paso (de claro a oscuro).
const L_CURVE: Record<Step, number> = {
  100: 0.96, 200: 0.91, 300: 0.84, 400: 0.74, 500: 0.64, 600: 0.54, 700: 0.45, 800: 0.35, 900: 0.26,
};
// Multiplicador de croma: los extremos son más apagados.
const C_CURVE: Record<Step, number> = {
  100: 0.18, 200: 0.35, 300: 0.6, 400: 0.85, 500: 1, 600: 1, 700: 0.9, 800: 0.72, 900: 0.55,
};

/** Rampa de 9 pasos con el tono y croma del color de marca. */
export function brandRamp(hex: string): Ramp {
  const base = hexToOklch(hex);
  const out = {} as Ramp;
  for (const s of STEPS) out[s] = oklchToHex({ l: L_CURVE[s], c: base.c * C_CURVE[s], h: base.h });
  return out;
}

/** Rampa neutra de 9 pasos (más 50 y 950) con una pizca del tono de marca. */
export function neutralRamp(brandHex: string): Record<number, string> {
  const { h } = hexToOklch(brandHex);
  const steps: Record<number, number> = {
    0: 1, 50: 0.985, 100: 0.965, 200: 0.925, 300: 0.87, 400: 0.74, 500: 0.62, 600: 0.5, 700: 0.4, 800: 0.3, 900: 0.2, 950: 0.14, 1000: 0.1,
  };
  const out: Record<number, string> = {};
  for (const [k, l] of Object.entries(steps)) out[Number(k)] = oklchToHex({ l, c: 0.012, h });
  return out;
}
