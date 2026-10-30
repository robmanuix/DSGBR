// Deja listos los datos del sitio.
// 1) Si existe la carpeta entrada/, reparte ahí los archivos que descargas del plugin DSGBR.
// 2) Si el repositorio aún no tiene tokens/tokens.json, usa la muestra.
// 3) Copia los archivos descargables a public/descargas.
import { cpSync, existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';

// Lector de ZIP mínimo (métodos «almacenado» y «deflate»): abre el .zip que descarga el plugin sin dependencias.
function descomprimir(ruta, salida) {
  const b = readFileSync(ruta);
  let fin = b.length - 22;
  while (fin >= 0 && b.readUInt32LE(fin) !== 0x06054b50) fin--;
  if (fin < 0) throw new Error(`${ruta} no es un ZIP válido`);
  const n = b.readUInt16LE(fin + 10);
  let p = b.readUInt32LE(fin + 16);
  mkdirSync(salida, { recursive: true });
  for (let i = 0; i < n; i++) {
    const metodo = b.readUInt16LE(p + 10), tam = b.readUInt32LE(p + 20), ln = b.readUInt16LE(p + 28), le = b.readUInt16LE(p + 30), lc = b.readUInt16LE(p + 32), off = b.readUInt32LE(p + 42);
    const nombre = b.toString('utf8', p + 46, p + 46 + ln);
    p += 46 + ln + le + lc;
    if (nombre.endsWith('/')) continue;
    const dato = off + 30 + b.readUInt16LE(off + 26) + b.readUInt16LE(off + 28);
    const crudo = b.subarray(dato, dato + tam);
    const contenido = metodo === 0 ? crudo : metodo === 8 ? inflateRawSync(crudo) : null;
    if (!contenido) throw new Error(`${nombre}: método de compresión ${metodo} no soportado`);
    const partes = nombre.split('/');
    const rel = partes.includes('componentes') ? 'componentes/' + partes.pop() : partes.pop();
    mkdirSync(`${salida}/${rel}`.split('/').slice(0, -1).join('/'), { recursive: true });
    writeFileSync(`${salida}/${rel}`, contenido);
  }
}


const destinos = {
  'tokens.json': 'tokens/tokens.json', 'estilos.json': 'tokens/estilos.json', 'docsite.config.json': 'docsite.config.json',
  'tokens.css': 'build/web/tokens.css', 'tailwind.css': 'build/web/tailwind.css',
  'componentes.json': 'tokens/componentes.json', 'DSTokens.swift': 'build/ios/DSTokens.swift', 'DsTokens.kt': 'build/android/DsTokens.kt',
};
if (existsSync('entrada')) {
  for (const z of readdirSync('entrada').filter((f) => f.toLowerCase().endsWith('.zip'))) {
    console.log('Abriendo entrada/' + z);
    descomprimir(`entrada/${z}`, 'entrada/.contenido');
  }
  const carpeta = existsSync('entrada/.contenido') ? 'entrada/.contenido' : null;
  const soloArchivos = (dir) => readdirSync(dir).filter((x) => statSync(`${dir}/${x}`).isFile());
  const sueltos = soloArchivos('entrada').filter((x) => !x.startsWith('.') && !x.toLowerCase().endsWith('.zip'));
  if (carpeta && sueltos.length) console.log('Aviso: hay archivos sueltos en entrada/ (' + sueltos.join(', ') + '). Con un .zip presente se usa el contenido del .zip; borra los sueltos para evitar confusiones.');
  // Los sueltos se copian primero y el ZIP al final: el ZIP más reciente siempre gana.
  for (const f of [...sueltos, ...(carpeta ? soloArchivos(carpeta).map((x) => `.contenido/${x}`) : [])]) {
    const d = destinos[f.split('/').pop()];
    if (!d) { console.log('Archivo desconocido en entrada/:', f); continue; }
    mkdirSync(d.split('/').slice(0, -1).join('/') || '.', { recursive: true });
    copyFileSync(`entrada/${f}`, d);
    console.log('entrada/' + f + ' ->', d);
  }
  // Imágenes de componentes exportadas desde Figma: entrada/componentes/*.png (suelto o dentro del ZIP).
  for (const origen of [...(carpeta ? [`${carpeta}/componentes`] : []), 'entrada/componentes']) {
    if (!existsSync(origen)) continue;
    rmSync('public/componentes', { recursive: true, force: true });
    mkdirSync('public/componentes', { recursive: true });
    for (const f of readdirSync(origen)) copyFileSync(`${origen}/${f}`, `public/componentes/${f}`);
    console.log('Imágenes de componentes ->', 'public/componentes');
  }
  if (carpeta) rmSync(carpeta, { recursive: true, force: true });
}
// La configuración del cliente sale del ZIP; sin ella (clon nuevo) se usa la de muestra.
if (!existsSync('docsite.config.json') && existsSync('muestra/docsite.config.json')) copyFileSync('muestra/docsite.config.json', 'docsite.config.json');
if (!existsSync('tokens/tokens.json')) {
  console.log('Sin tokens/tokens.json: se usa la muestra.');
  cpSync('muestra/tokens', 'tokens', { recursive: true });
  cpSync('muestra/build', 'build', { recursive: true });
}
mkdirSync('public/descargas', { recursive: true });
copyFileSync('tokens/tokens.json', 'public/descargas/tokens.json');
for (const dir of ['web', 'ios', 'android']) {
  if (!existsSync(`build/${dir}`)) continue;
  for (const f of readdirSync(`build/${dir}`)) copyFileSync(`build/${dir}/${f}`, `public/descargas/${f}`);
}
console.log('Descargas listas en public/descargas');
