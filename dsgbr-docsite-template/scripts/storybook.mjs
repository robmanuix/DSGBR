// Compila el constructor (Storybook) dentro de dist/storybook, después de `astro build`.
// Si falla, avisa y sigue: el DocSite se publica igual, solo sin constructor.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('kit/stories')) {
  console.log('Sin kit/stories: no se compila el constructor.');
  process.exit(0);
}
try {
  execFileSync('npx', ['storybook', 'build', '-o', 'dist/storybook', '--quiet'], { stdio: 'inherit', shell: process.platform === 'win32' });
  console.log('Constructor listo en dist/storybook');
} catch {
  console.warn('Aviso: no se pudo compilar el constructor (Storybook). El DocSite se publica sin él.');
}
