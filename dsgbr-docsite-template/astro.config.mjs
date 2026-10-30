import { defineConfig } from 'astro/config';

// SITE y BASE los define el flujo de publicación (GitHub Pages: https://<org>.github.io/<repo>/).
export default defineConfig({
  site: process.env.SITE || undefined,
  base: process.env.BASE || '/',
  trailingSlash: 'ignore',
});
