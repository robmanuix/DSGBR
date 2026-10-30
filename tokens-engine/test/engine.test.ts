import { describe, expect, it } from 'vitest';
import { buildTokens, checkContrast, checkExtra, EXTRA_ROLES, contrast, hexToOklch, oklchToHex, brandRamp } from '../src/index.js';

describe('color', () => {
  it('hex -> oklch -> hex es estable', () => {
    for (const hex of ['#3366E6', '#E63946', '#2A9D8F', '#F4A261']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
  it('contraste blanco/negro = 21', () => {
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });
});

describe('paleta', () => {
  it('la rampa es monótona de claro a oscuro', () => {
    const r = brandRamp('#3366E6');
    const ls = Object.values(r).map((h) => hexToOklch(h).l);
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1]);
  });
});

describe('contraste AA', () => {
  for (const hex of ['#3366E6', '#E63946', '#2A9D8F', '#F4A261', '#7B2CBF', '#FFD60A']) {
    for (const mode of ['claro', 'oscuro'] as const) {
      it(`${hex} ${mode}: todos los pares cumplen`, () => {
        const fallos = checkContrast(hex, mode).filter((c) => !c.cumple);
        expect(fallos).toEqual([]);
      });
    }
  }
});

describe('tokens W3C', () => {
  it('genera primitivos y semánticos', () => {
    const t = buildTokens('#3366E6');
    expect(t.primitivos.color.marca['500'].$type).toBe('color');
    expect(Object.keys(t.semanticos.color.claro).length).toBeGreaterThan(5);
  });
});

describe('colores adicionales', () => {
  for (const hex of ['#F4A261', '#2A9D8F', '#7B2CBF', '#FFD60A', '#E63946']) {
    for (const mode of ['claro', 'oscuro'] as const) {
      it(`${hex} ${mode}: roles del color adicional cumplen AA`, () => {
        expect(checkExtra('Secondary', hex, mode).filter((c) => !c.cumple)).toEqual([]);
      });
    }
  }
  it('define 4 roles por color', () => {
    expect(EXTRA_ROLES.length).toBe(4);
  });
});

import { BASES, espacioParaBase, masCercano, sombraParaBase } from '../src/index.js';
describe('bases', () => {
  const unidades = [2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64];
  it('los radios crecen de XS a XL en cada base', () => {
    for (const b of Object.values(BASES)) {
      const r = Object.values(b.radio);
      for (let i = 1; i < r.length; i++) expect(r[i]).toBeGreaterThan(r[i - 1]);
    }
  });
  it('utilitaria es más densa y calma más aireada que la original', () => {
    expect(espacioParaBase(16, 'utilitaria', unidades)).toBeLessThan(16);
    expect(espacioParaBase(16, 'calma', unidades)).toBeGreaterThan(16);
    expect(espacioParaBase(16, 'expresiva', unidades)).toBe(16);
  });
  it('el espaciado siempre cae en la escala Unidad', () => {
    for (const b of Object.keys(BASES) as (keyof typeof BASES)[])
      for (const u of [2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64]) expect(unidades).toContain(espacioParaBase(u, b, unidades));
  });
  it('la sombra utilitaria es más tenue y pequeña', () => {
    const o = { alfa: 0.1, desenfoque: 8, y: 4 };
    const s = sombraParaBase(o, 'utilitaria');
    expect(s.alfa).toBeLessThan(o.alfa);
    expect(s.desenfoque).toBeLessThan(o.desenfoque);
    expect(masCercano(5, [2, 8])).toBe(2);
  });
});

import { exportarTodo, type VarModelo } from '../src/index.js';
describe('exportación', () => {
  const c = (hex: string, a = 1) => ({ hex, a });
  const modelo: VarModelo[] = [
    { coleccion: 'Primitivos: Color', modos: ['Valor'], nombre: 'Brand/600', tipo: 'COLOR', valores: { Valor: c('#3366E6') }, codeSyntax: { WEB: 'var(--color-brand-600)', ANDROID: 'brand600', iOS: 'Color.brand600' } },
    { coleccion: 'Primitivos: Color', modos: ['Valor'], nombre: 'Brand/300', tipo: 'COLOR', valores: { Valor: c('#A9C4FE') }, codeSyntax: { WEB: 'var(--color-brand-300)', ANDROID: 'brand300', iOS: 'Color.brand300' } },
    { coleccion: 'Semánticos: Color', modos: ['Claro', 'Oscuro'], nombre: 'Fondo/Marca', tipo: 'COLOR', valores: { Claro: { alias: 'Primitivos: Color::Brand/600' }, Oscuro: { alias: 'Primitivos: Color::Brand/300' } }, codeSyntax: { WEB: 'var(--color-background-brand)', ANDROID: 'backgroundBrand', iOS: 'Color.backgroundBrand' } },
    { coleccion: 'Unidad', modos: ['Valor'], nombre: 'Unidad/16', tipo: 'FLOAT', valores: { Valor: 16 }, codeSyntax: { WEB: 'var(--unit-16)', ANDROID: 'unit16', iOS: 'unit16' } },
    { coleccion: 'Espaciado', modos: ['Valor'], nombre: 'Espacio/L', tipo: 'FLOAT', valores: { Valor: { alias: 'Unidad::Unidad/16' } }, codeSyntax: { WEB: 'var(--space-l)', ANDROID: 'spaceL', iOS: 'spaceL' } },
    { coleccion: 'Movimiento', modos: ['Normal', 'Reducido'], nombre: 'Duración/Media', tipo: 'FLOAT', valores: { Normal: 200, Reducido: 0 }, codeSyntax: { WEB: 'var(--motion-duration-medium)', ANDROID: 'motionDurationMedium', iOS: 'motionDurationMedium' } },
    { coleccion: 'Primitivos: Tipografía', modos: ['Valor'], nombre: 'Peso/Seminegrita', tipo: 'STRING', valores: { Valor: 'Semi Bold' }, codeSyntax: { WEB: 'var(--font-weight-semibold)', ANDROID: 'fontWeightSemibold', iOS: 'fontWeightSemibold' } },
    { coleccion: 'Primitivos: Tipografía', modos: ['Valor'], nombre: 'Tamaño/M', tipo: 'FLOAT', valores: { Valor: { alias: 'Unidad::Unidad/16' } }, codeSyntax: { WEB: 'var(--font-size-m)', ANDROID: 'fontSizeM', iOS: 'fontSizeM' } },
    { coleccion: 'Ícono: Color 1', modos: ['Primario'], nombre: 'Color', tipo: 'COLOR', valores: { Primario: c('#000000') } },
  ];
  const f = Object.fromEntries(exportarTodo(modelo).map((a) => [a.nombre, a.contenido]));
  it('CSS: referencias, modo oscuro y movimiento reducido', () => {
    expect(f['tokens.css']).toContain('--color-background-brand: var(--color-brand-600);');
    expect(f['tokens.css']).toMatch(/data-theme="dark"\] \{\n  --color-background-brand: var\(--color-brand-300\);/);
    expect(f['tokens.css']).toContain('--motion-duration-medium: 200ms;');
    expect(f['tokens.css']).toMatch(/prefers-reduced-motion[\s\S]*--motion-duration-medium: 0ms;/);
    expect(f['tokens.css']).toContain('--font-weight-semibold: 600;');
    expect(f['tokens.css']).not.toContain('Ícono');
  });
  it('JSON W3C: alias con llaves y modos en extensiones', () => {
    const j = JSON.parse(f['tokens.json']);
    expect(j['semanticos-color'].fondo.marca.$value).toBe('{primitivos-color.brand.600}');
    expect(j['semanticos-color'].fondo.marca.$extensions['com.dsgbr'].modos.Oscuro).toBe('{primitivos-color.brand.300}');
    expect(j['primitivos-tipografia'].peso.seminegrita.$type).toBe('fontWeight');
  });
  it('Swift y Kotlin: colores finales y unidades', () => {
    expect(f['DSTokens.swift']).toContain('Color(light: 0xFF3366E6, dark: 0xFFA9C4FE)');
    expect(f['DSTokens.swift']).toContain('motionDurationMedium: Double = 200');
    expect(f['DsTokens.kt']).toContain('val backgroundBrand = Color(0xFF3366E6)');
    expect(f['DsTokens.kt']).toContain('val spaceL = 16.dp');
    expect(f['DsTokens.kt']).toContain('val fontSizeM = 16.sp');
    expect(f['DsTokens.kt']).toContain('FontWeight.W600');
  });
  it('falla con un alias roto', () => {
    const roto: VarModelo[] = [{ coleccion: 'Espaciado', modos: ['Valor'], nombre: 'Espacio/L', tipo: 'FLOAT', valores: { Valor: { alias: 'Unidad::Unidad/99' } } }];
    expect(() => exportarTodo(roto)).toThrow(/Alias roto/);
  });
});

import { generarConfig, generarEstilos, exportarTodo as exportar2 } from '../src/exportar';
describe('config y estilos', () => {
  it('config con datos de marca', () => {
    const j = JSON.parse(generarConfig({ cliente: 'Acme', base: 'calma', plataformas: ['web'], version: '1.0.0', archivo: 'Acme DS' }, '2026-10-29'));
    expect(j).toMatchObject({ cliente: 'Acme', marca: 'Acme', generado: '2026-10-29', archivoFigma: 'Acme DS' });
  });
  it('estilos de texto y efecto', () => {
    const j = JSON.parse(generarEstilos(
      [{ nombre: 'Título/H1', familia: 'Inter', estilo: 'Semi Bold', tamano: 32, altura: 40, espaciado: 0 }],
      [{ nombre: 'Elevación/1', sombras: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgb(0 0 0 / 0.1)' }] }],
    ));
    expect(j.texto[0].peso).toBe(600);
    expect(j.efectos[0].css).toBe('0px 2px 4px 0px rgb(0 0 0 / 0.1)');
  });
  it('exportarTodo agrega los archivos extra solo si hay datos', () => {
    expect(exportar2([]).map((a) => a.nombre)).not.toContain('estilos.json');
    const n = exportar2([], { marca: { cliente: 'X', base: 'calma', plataformas: [], version: '1' }, estilosTexto: [] }).map((a) => a.nombre);
    expect(n).toEqual(expect.arrayContaining(['docsite.config.json', 'estilos.json', 'tokens.json']));
  });
});

import { sintaxisPrimitivo, sintaxisRolExtra } from '../src/roles.js';
describe('sintaxis de colores adicionales', () => {
  it('primitivos', () => {
    expect(sintaxisPrimitivo('Secondary', 500)).toEqual({ WEB: 'var(--color-secondary-500)', ANDROID: 'secondary500', iOS: 'Color.secondary500' });
    expect(sintaxisPrimitivo('Verde azulado', 100).WEB).toBe('var(--color-verde-azulado-100)');
  });
  it('roles sin chocar con los base', () => {
    expect(sintaxisRolExtra('Contenido/{n}'.replace('{n}', 'Secondary'), 'Secondary').WEB).toBe('var(--color-content-secondary-accent)');
    expect(sintaxisRolExtra('Fondo/Secondary Sutil', 'Secondary')).toEqual({ WEB: 'var(--color-background-secondary-accent-subtle)', ANDROID: 'backgroundSecondaryAccentSubtle', iOS: 'Color.backgroundSecondaryAccentSubtle' });
    expect(sintaxisRolExtra('Borde/Acme', 'Acme').WEB).toBe('var(--color-border-acme)');
  });
});

import { auditarRoles, PARES_AUDITORIA } from '../src/roles.js';
describe('auditoría de roles reales', () => {
  it('omite pares con roles que no existen y marca los que no cumplen', () => {
    const mapa: Record<string, [string, string]> = {
      'Contenido/Primario': ['#151515', '#ffffff'], 'Fondo/Primario': ['#ffffff', '#0b0b0b'],
      'Contenido/Secundario': ['#cccccc', '#ababab'],
    };
    const r = auditarRoles((rol, modo) => mapa[rol]?.[modo === 'claro' ? 0 : 1]);
    expect(r.length).toBe(4);
    expect(r.find((x) => x.rol === 'Contenido/Primario' && x.modo === 'claro')?.cumple).toBe(true);
    const mal = r.find((x) => x.rol === 'Contenido/Secundario' && x.modo === 'claro');
    expect(mal?.cumple).toBe(false);
    expect(mal?.minimo).toBe(4.5);
  });
  it('los bordes se exigen a 3:1 y no hay pares duplicados', () => {
    expect(PARES_AUDITORIA.filter(([r]) => r.startsWith('Borde/')).every(([, , m]) => m === 3)).toBe(true);
    const claves = PARES_AUDITORIA.map(([a, b]) => a + '|' + b);
    expect(new Set(claves).size).toBe(claves.length);
  });
});
