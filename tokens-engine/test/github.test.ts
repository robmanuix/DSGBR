import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Extrae el bloque probado de la interfaz del plugin y lo ejecuta con un GitHub simulado.
const html = readFileSync(new URL('../../dsgbr-plugin/src/ui.html', import.meta.url), 'utf8');
const bloque = html.split('// GH:inicio')[1].split('// GH:fin')[0];
const cargar = (fetchFalso: any) => new Function('fetch', `${bloque}; return { publicarGitHub, ghSlug, ghMensaje };`)(fetchFalso);

type Llamada = { metodo: string; ruta: string; cuerpo?: any; auth?: string };
function githubFalso(opts: { existe?: boolean; tokenValido?: boolean; etiquetaExiste?: boolean; pagesError?: number; sinPermiso?: boolean; carrera?: boolean } = {}) {
  const llamadas: Llamada[] = [];
  let creado = !!opts.existe, sondeos = 0, blobs = 0, patches = 0, cabeza = 'c0';
  const resp = (status: number, json: any) => ({ ok: status < 400, status, text: async () => (json === null ? '' : JSON.stringify(json)) });
  const f = async (url: string, init: any) => {
    const ruta = String(url).replace('https://api.github.com', '');
    const cuerpo = init.body ? JSON.parse(init.body) : undefined;
    const metodo = init.method;
    llamadas.push({ metodo, ruta, cuerpo, auth: init.headers.Authorization });
    if (opts.tokenValido === false) return resp(401, { message: 'Bad credentials' });
    if (ruta === '/user') return resp(200, { login: 'robmanuix' });
    if (metodo === 'GET' && ruta === '/repos/robmanuix/ds-flash') return creado ? resp(200, { default_branch: 'main', html_url: 'https://github.com/robmanuix/ds-flash' }) : resp(404, { message: 'Not Found' });
    if (metodo === 'POST' && ruta === '/repos/robmanuix/plantilla/generate') { if (opts.sinPermiso) return resp(403, { message: 'Resource not accessible' }); creado = true; return resp(201, {}); }
    if (metodo === 'GET' && ruta === '/repos/robmanuix/ds-flash/git/ref/heads/main') { if (++sondeos < 2 && !opts.existe) return resp(409, { message: 'Git Repository is empty.' }); return resp(200, { object: { sha: cabeza } }); }
    if (metodo === 'GET' && /\/git\/commits\/c0b?$/.test(ruta)) return resp(200, { tree: { sha: 't0' } });
    if (metodo === 'POST' && ruta.endsWith('/git/blobs')) return resp(201, { sha: 'b' + ++blobs });
    if (metodo === 'POST' && ruta.endsWith('/git/trees')) return resp(201, { sha: 't1' });
    if (metodo === 'POST' && ruta.endsWith('/git/commits')) return resp(201, { sha: 'c1' });
    if (metodo === 'PATCH' && ruta.endsWith('/git/refs/heads/main')) { if (opts.carrera && ++patches === 1) { cabeza = 'c0b'; return resp(422, { message: 'Update is not a fast forward' }); } return resp(200, {}); }
    if (metodo === 'POST' && ruta.endsWith('/git/refs')) return opts.etiquetaExiste ? resp(422, { message: 'Reference already exists' }) : resp(201, {});
    if (metodo === 'POST' && ruta.endsWith('/pages')) return opts.pagesError ? resp(opts.pagesError, { message: 'x' }) : resp(201, {});
    return resp(500, { message: 'ruta no simulada ' + metodo + ' ' + ruta });
  };
  return { f, llamadas };
}
const archivos = [
  { ruta: 'entrada/docsite.config.json', contenido: '{"version":"1.1.0","cliente":"Flash ñ"}' },
  { ruta: 'entrada/componentes/web-boton.png', bytes: new Uint8Array([137, 80, 78, 71, 0, 255]) },
];
const base = { token: 'ghp_x', owner: '', plantilla: 'robmanuix/plantilla', repo: 'ds-flash', privado: true, version: '1.1.0', espera: 0, archivos };

describe('publicación en GitHub', () => {
  it('si GitHub movió la rama mientras preparaba el repositorio, relee la cabeza y reintenta', async () => {
    const g = githubFalso({ carrera: true }); const { publicarGitHub } = cargar(g.f);
    const r = await publicarGitHub({ ...base });
    const commits = g.llamadas.filter((l) => l.ruta.endsWith('/git/commits'));
    expect(commits.map((c) => c.cuerpo.parents[0])).toEqual(['c0', 'c0b']);
    expect(g.llamadas.filter((l) => l.ruta.endsWith('/git/blobs')).length).toBe(2);
    expect(r.commit).toBe('c1');
  });
  it('crea el repositorio desde la plantilla, sube todo en un commit y etiqueta', async () => {
    const g = githubFalso(); const { publicarGitHub } = cargar(g.f);
    const r = await publicarGitHub({ ...base });
    const rutas = g.llamadas.map((l) => `${l.metodo} ${l.ruta.replace('/repos/robmanuix/ds-flash', '')}`);
    expect(r.creado).toBe(true);
    expect(rutas.filter((x) => x.endsWith('/git/blobs')).length).toBe(2);
    expect(rutas.filter((x) => x.endsWith('/git/commits')).length).toBe(1);
    const gen = g.llamadas.find((l) => l.ruta.endsWith('/generate'))!;
    expect(gen.cuerpo).toMatchObject({ owner: 'robmanuix', name: 'ds-flash', private: true });
    const arbol = g.llamadas.find((l) => l.ruta.endsWith('/git/trees'))!.cuerpo;
    expect(arbol.base_tree).toBe('t0');
    expect(arbol.tree.map((t: any) => t.path)).toEqual(['entrada/docsite.config.json', 'entrada/componentes/web-boton.png']);
    expect(g.llamadas.find((l) => l.ruta.endsWith('/git/commits'))!.cuerpo.parents).toEqual(['c0']);
    expect(g.llamadas.find((l) => l.ruta.endsWith('/git/refs'))!.cuerpo).toEqual({ ref: 'refs/tags/v1.1.0', sha: 'c1' });
    expect(r.etiqueta).toBe('v1.1.0'); expect(r.pages).toBe('activadas');
    expect(r.sitio).toBe('https://robmanuix.github.io/ds-flash/');
    expect(g.llamadas.every((l) => l.auth === 'Bearer ghp_x')).toBe(true);
  });
  it('codifica texto UTF-8 y binarios en base64 sin alterarlos', async () => {
    const g = githubFalso(); const { publicarGitHub } = cargar(g.f);
    await publicarGitHub({ ...base });
    const [txt, bin] = g.llamadas.filter((l) => l.ruta.endsWith('/git/blobs')).map((l) => l.cuerpo);
    expect(Buffer.from(txt.content, 'base64').toString('utf8')).toBe('{"version":"1.1.0","cliente":"Flash ñ"}');
    expect([...Buffer.from(bin.content, 'base64')]).toEqual([137, 80, 78, 71, 0, 255]);
    expect(txt.encoding).toBe('base64');
  });
  it('si el repositorio ya existe, no lo vuelve a crear y solo agrega un commit', async () => {
    const g = githubFalso({ existe: true }); const { publicarGitHub } = cargar(g.f);
    const r = await publicarGitHub({ ...base });
    expect(r.creado).toBe(false);
    expect(g.llamadas.some((l) => l.ruta.endsWith('/generate'))).toBe(false);
  });
  it('una etiqueta repetida no hace fallar la publicación', async () => {
    const g = githubFalso({ etiquetaExiste: true }); const { publicarGitHub } = cargar(g.f);
    const r = await publicarGitHub({ ...base });
    expect(r.etiqueta).toContain('ya existía');
  });
  it('si Pages no se puede activar, lo informa sin fallar', async () => {
    const g = githubFalso({ pagesError: 403 }); const { publicarGitHub } = cargar(g.f);
    const r = await publicarGitHub({ ...base });
    expect(r.pages).toContain('no se pudieron activar');
  });
  it('mensajes claros para token inválido y falta de permisos', async () => {
    const a = cargar(githubFalso({ tokenValido: false }).f);
    await expect(a.publicarGitHub({ ...base })).rejects.toThrow('El token no es válido');
    const b = cargar(githubFalso({ sinPermiso: true }).f);
    await expect(b.publicarGitHub({ ...base })).rejects.toThrow('crear repositorios y escribir contenido');
  });
  it('exige la plantilla cuando hay que crear el repositorio', async () => {
    const { publicarGitHub } = cargar(githubFalso().f);
    await expect(publicarGitHub({ ...base, plantilla: '' })).rejects.toThrow('usuario/repositorio');
  });
  it('slug del nombre del repositorio', () => {
    const { ghSlug } = cargar(githubFalso().f);
    expect(ghSlug('Proyecto Flash')).toBe('proyecto-flash');
    expect(ghSlug('Mi Menú ñandú!')).toBe('mi-menu-nandu');
    expect(ghSlug('')).toBe('cliente');
  });
});
