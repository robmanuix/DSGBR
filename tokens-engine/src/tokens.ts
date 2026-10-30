import { brandRamp, neutralRamp } from './palette.js';
import { semanticRoles } from './roles.js';

// Formato W3C Design Tokens (DTCG): $type, $value, $extensions con codeSyntax.
interface Token { $type: 'color'; $value: string; $extensions?: Record<string, unknown> }

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');

export function buildTokens(brandHex: string) {
  const marca = brandRamp(brandHex);
  const neutro = neutralRamp(brandHex);
  const primitivos: Record<string, Record<string, Token>> = { marca: {}, neutro: {} };
  for (const [k, v] of Object.entries(marca)) primitivos.marca[k] = { $type: 'color', $value: v };
  for (const [k, v] of Object.entries(neutro)) primitivos.neutro[k] = { $type: 'color', $value: v };

  const semanticos: Record<string, Record<string, Token>> = { claro: {}, oscuro: {} };
  for (const mode of ['claro', 'oscuro'] as const) {
    for (const [rol, valor] of Object.entries(semanticRoles(brandHex, mode))) {
      semanticos[mode][slug(rol).replace('/', '.')] = {
        $type: 'color',
        $value: valor,
        $extensions: { 'com.dsgbr': { nombre: rol, codeSyntax: { WEB: `var(--${slug(rol).replace('/', '-')})` } } },
      };
    }
  }
  return { primitivos: { color: primitivos }, semanticos: { color: semanticos } };
}
