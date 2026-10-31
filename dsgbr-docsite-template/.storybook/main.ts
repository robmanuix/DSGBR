import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readFileSync } from 'node:fs';

/** Familia tipográfica de la marca (build/web/tokens.css), para cargarla desde Google Fonts como hace el DocSite. */
function familiaDeLaMarca(): string | null {
  if (!existsSync('build/web/tokens.css')) return null;
  const m = readFileSync('build/web/tokens.css', 'utf8').match(/--font-family-brand:\s*"?([^";,]+)"?/);
  return m ? m[1].trim() : null;
}

// Constructor de componentes: lee kit/components y los tokens de la marca (build/web).
const config: StorybookConfig = {
  stories: ['../kit/stories/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: [],
  previewHead: (head) => {
    const f = familiaDeLaMarca();
    return head + (f ? `\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700&display=swap">` : '');
  },
  core: { disableTelemetry: true },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    cfg.esbuild = { ...(cfg.esbuild || {}), jsx: 'automatic' }; // el kit no importa React en cada archivo
    cfg.publicDir = false; // no copiar public/ (descargas, imágenes) dentro del constructor
    return cfg;
  },
};
export default config;
