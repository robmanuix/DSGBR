import { describe, it, expect } from 'vitest';
import { paginasFueraDePerfil, paginasRequeridas, SEP } from '../../dsgbr-plugin/src/estructura';

const web = ['web'] as const;
describe('perfiles del archivo del cliente', () => {
  it('Completo conserva todas las páginas', () => {
    const l = paginasRequeridas([...web, 'ios'], [], 'completo');
    expect(l.length).toBe(63);
    expect(paginasFueraDePerfil('completo')).toEqual([]);
  });
  it('Estándar solo quita las páginas vacías', () => {
    const l = paginasRequeridas([...web, 'ios'], [], 'estandar');
    expect(l.length).toBe(61);
    expect(l).not.toContain('↳ Pictogramas');
    expect(l).toContain('↳ Retícula');
    expect(l).toContain('↳ Botón píldora · Web');
  });
  it('Mínimo deja Color, Tipografía, 8 componentes por plataforma y sin separadores', () => {
    const l = paginasRequeridas([...web, 'ios'], [], 'minimo');
    expect(l).not.toContain(SEP);
    expect(l).toContain('🖥️ Componentes Web'); expect(l).toContain('📱 Componentes App');
    expect(l).toContain('↳ Color'); expect(l).toContain('↳ Tipografía'); expect(l).toContain('🔨 Herramientas');
    for (const c of ['Botón', 'Botón de ícono', 'Campo de texto', 'Texto de ayuda', 'Casilla', 'Opción', 'Interruptor', 'Alerta']) {
      expect(l).toContain(`↳ ${c} · Web`); expect(l).toContain(`↳ ${c} · App`);
    }
    for (const x of ['↳ Botón píldora · Web', '↳ Selector · App', '↳ Botón fijo · App', '↳ Sistema · App', '↳ Retícula', '↳ Color para datos', '↳ Activos de marca', '↳ Pictogramas']) expect(l).not.toContain(x);
    expect(l.filter((p) => p.startsWith('↳ ') && p.endsWith('· Web')).length).toBe(8);
    expect(l.length).toBe(29);
  });
  it('conserva las páginas adicionales del usuario', () => {
    expect(paginasRequeridas(['web'], ['Voz y tono'], 'minimo')).toContain('↳ Voz y tono');
  });
});
