// Historial de versiones: se lee de los commits de publicación («DocSite v1.2.3: Cliente» + notas en el cuerpo).
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';

/** Convierte la salida de `git log` en entradas del historial (más reciente primero). */
export function analizarLog(salida) {
  return salida.split('\x1e').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [fecha, asunto = '', ...cuerpo] = r.split('\x1f');
    const m = asunto.match(/^DocSite v(\d+\.\d+\.\d+)\s*(?::\s*(.*))?$/);
    if (!m) return null;
    return { version: m[1], fecha: fecha.slice(0, 10), cliente: (m[2] || '').trim(), notas: cuerpo.join('\x1f').trim() };
  }).filter(Boolean);
}

/** Escribe tokens/historial.json; si no hay git o no hay publicaciones, lo borra. */
export function generarHistorial(destino = 'tokens/historial.json') {
  let entradas = [];
  try {
    if (existsSync('.git')) {
      const salida = execFileSync('git', ['log', '-n', '200', '--format=%aI%x1f%s%x1f%b%x1e'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      entradas = analizarLog(salida);
    }
  } catch { /* sin git: no hay historial */ }
  if (!entradas.length) { rmSync(destino, { force: true }); return 0; }
  writeFileSync(destino, JSON.stringify({ generado: new Date().toISOString().slice(0, 10), versiones: entradas }, null, 2));
  return entradas.length;
}
