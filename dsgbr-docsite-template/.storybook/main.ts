import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

// Constructor de componentes: lee kit/components y los tokens de la marca (build/web).
const config: StorybookConfig = {
  stories: ['../kit/stories/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: [],
  core: { disableTelemetry: true },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    cfg.esbuild = { ...(cfg.esbuild || {}), jsx: 'automatic' }; // el kit no importa React en cada archivo
    cfg.publicDir = false; // no copiar public/ (descargas, imágenes) dentro del constructor
    return cfg;
  },
};
export default config;
