import { exportarTodo, type VarModelo, type EstiloTexto, type EstiloEfecto } from '../../tokens-engine/src/exportar';
import { auditarRoles, BASES, brandRamp, checkContrast, checkExtra, contrast, type AuditoriaPar, EXTRA_ROLES, espacioParaBase, sintaxisPrimitivo, sintaxisRolExtra, STEPS, type BaseId, type Sintaxis } from '../../tokens-engine/src/index';
import { paginasDeGrupo, paginasFueraDePerfil, paginasRequeridas, SEP, type Perfil, type Plataforma } from './estructura';

figma.showUI(__html__, { width: 380, height: 620, title: 'DS Generate by Robman Digital' });

const COL_PRIM = 'Primitivos: Color';
const COL_SEM = 'Semánticos: Color';

interface Entrada {
  cliente: string;
  colores: { nombre: string; hex: string }[];
  base: BaseId;
  plataformas: Plataforma[];
  extras: string[];
  quitarSobrantes: boolean;
  perfil?: Perfil;
  tipografia?: string;
  brief?: Brief;
  versionDS?: string;
}

/** Textos del brief que se escriben en «Resumen» y «Contenido y tono». Vacío = se deja el marcador. */
interface Brief {
  sector?: string; propuesta?: string; publico?: string; idioma?: string;
  voz?: string; tono?: string; tratamiento?: string; mayusculas?: string;
  errores?: string; evitar?: string; ejemploBoton?: string; ejemploVacio?: string;
  /** Dirección fotográfica (solo se muestra en el DocSite; no tiene página en Figma). */
  fotografia?: string;
}

/** Asigna la sintaxis de código solo si la variable aún no la tiene (no cambia nombres ya entregados). */
function asignarSintaxis(v: Variable, x: Sintaxis) {
  if (v.codeSyntax.WEB) return;
  v.setVariableCodeSyntax('WEB', x.WEB);
  v.setVariableCodeSyntax('ANDROID', x.ANDROID);
  v.setVariableCodeSyntax('iOS', x.iOS);
}

function hexToRgb(hex: string): RGB {
  const n = hex.replace('#', '');
  return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255 };
}

/** Lee todas las variables del archivo en el modelo neutro del exportador. */
async function leerModelo(): Promise<VarModelo[]> {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const todas = await figma.variables.getLocalVariablesAsync();
  const porId = new Map(todas.map((v) => [v.id, v]));
  const colPorId = new Map(cols.map((c) => [c.id, c]));
  const h2 = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const salida: VarModelo[] = [];
  for (const c of cols) {
    for (const v of todas.filter((x) => x.variableCollectionId === c.id)) {
      const valores: VarModelo['valores'] = {};
      for (const m of c.modes) {
        const x: any = v.valuesByMode[m.modeId];
        if (x && x.type === 'VARIABLE_ALIAS') {
          const t = porId.get(x.id)!;
          valores[m.name] = { alias: colPorId.get(t.variableCollectionId)!.name + '::' + t.name };
        } else if (v.resolvedType === 'COLOR') valores[m.name] = { hex: '#' + h2(x.r) + h2(x.g) + h2(x.b), a: Math.round((x.a ?? 1) * 1000) / 1000 };
        else valores[m.name] = x;
      }
      salida.push({ coleccion: c.name, modos: c.modes.map((m) => m.name), nombre: v.name, tipo: v.resolvedType as VarModelo['tipo'], valores, codeSyntax: v.codeSyntax as VarModelo['codeSyntax'] });
    }
  }
  return salida;
}

/** Estilos de texto y de efecto (sombras) del archivo. */
async function leerEstilos(): Promise<{ texto: EstiloTexto[]; efectos: EstiloEfecto[] }> {
  const h2 = (n: number) => Math.round(n * 255);
  const texto: EstiloTexto[] = (await figma.getLocalTextStylesAsync()).map((t) => ({
    nombre: t.name, familia: t.fontName.family, estilo: t.fontName.style, tamano: t.fontSize,
    altura: t.lineHeight.unit === 'AUTO' ? Math.round(t.fontSize * 1.25) : t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : Math.round((t.fontSize * t.lineHeight.value) / 100),
    espaciado: t.letterSpacing.unit === 'PIXELS' ? t.letterSpacing.value : Math.round((t.fontSize * t.letterSpacing.value) / 100 * 100) / 100,
  }));
  const efectos: EstiloEfecto[] = (await figma.getLocalEffectStylesAsync()).map((e) => ({
    nombre: e.name,
    sombras: e.effects.filter((x): x is DropShadowEffect => x.type === 'DROP_SHADOW' && x.visible !== false).map((x) => ({
      x: x.offset.x, y: x.offset.y, blur: x.radius, spread: x.spread ?? 0,
      color: `rgb(${h2(x.color.r)} ${h2(x.color.g)} ${h2(x.color.b)} / ${Math.round(x.color.a * 1000) / 1000})`,
    })),
  }));
  return { texto, efectos };
}

async function verificarMaestro() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const nombres = cols.map((c) => c.name);
  const faltan = [COL_PRIM, COL_SEM].filter((n) => !nombres.includes(n));
  return { esMaestro: faltan.length === 0, colecciones: nombres.length, faltan, paginas: figma.root.children.length };
}

async function aplicarPaleta(colores: { nombre: string; hex: string }[]) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const prim = cols.find((c) => c.name === COL_PRIM)!;
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  // El color principal (el primero) puede cambiar de nombre: se renombra su rampa existente para no perder los enlaces.
  const hay = (pre: string) => vars.some((v) => v.variableCollectionId === prim.id && v.name.startsWith(pre + '/'));
  const guardado = figma.root.getPluginData('dsgbr.marca');
  let previo: string | undefined;
  try { previo = guardado ? JSON.parse(guardado).colores?.[0]?.nombre : undefined; } catch { previo = undefined; }
  const principal = colores[0].nombre;
  const origen = previo && previo !== principal && hay(previo) ? previo : !hay(principal) && hay('Marca') ? 'Marca' : null;
  if (origen && !hay(principal)) {
    for (const v of vars) {
      if (v.variableCollectionId === prim.id && v.name.startsWith(origen + '/')) v.name = principal + '/' + v.name.slice(origen.length + 1);
    }
  }
  let escritas = 0, nuevas = 0;
  for (const { nombre, hex } of colores) {
    const ramp = brandRamp(hex);
    for (const paso of STEPS) {
      const nom = `${nombre}/${paso}`;
      let v = vars.find((x) => x.variableCollectionId === prim.id && x.name === nom);
      if (!v) {
        v = figma.variables.createVariable(nom, prim, 'COLOR');
        vars.push(v);
        nuevas++;
      }
      v.setValueForMode(prim.defaultModeId, { ...hexToRgb(ramp[paso]), a: 1 });
      asignarSintaxis(v, sintaxisPrimitivo(nombre, paso));
      escritas++;
    }
  }
  return { escritas, nuevas };
}

/** Crea (si faltan) los roles semánticos de cada color adicional, apuntando a su rampa en Claro y Oscuro. */
async function aplicarRolesExtra(colores: { nombre: string; hex: string }[]) {
  const extras = colores.slice(1);
  if (!extras.length) return 0;
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const prim = cols.find((c) => c.name === COL_PRIM)!;
  const sem = cols.find((c) => c.name === COL_SEM)!;
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  const modo = (n: string) => sem.modes.find((m) => m.name === n)!;
  const claro = modo('Claro'), oscuro = modo('Oscuro');
  const scopes: Record<string, VariableScope[]> = {
    texto: ['TEXT_FILL'], fondo: ['FRAME_FILL', 'SHAPE_FILL'], borde: ['STROKE_COLOR'],
  };
  let creadas = 0;
  for (const { nombre } of extras) {
    for (const r of EXTRA_ROLES) {
      const nom = r.rol.replace('{n}', nombre);
      let v = vars.find((x) => x.variableCollectionId === sem.id && x.name === nom);
      if (!v) { v = figma.variables.createVariable(nom, sem, 'COLOR'); v.scopes = scopes[r.tipo]; vars.push(v); creadas++; }
      asignarSintaxis(v, sintaxisRolExtra(nom, nombre));
      const paso = (n: number) => vars.find((x) => x.variableCollectionId === prim.id && x.name === `${nombre}/${n}`)!;
      v.setValueForMode(claro.modeId, figma.variables.createVariableAlias(paso(r.claro)));
      v.setValueForMode(oscuro.modeId, figma.variables.createVariableAlias(paso(r.oscuro)));
    }
  }
  return creadas;
}

/**
 * Aplica la base de diseño: radios, espaciado (alias a Unidad), elevación y movimiento.
 * Parte siempre de los valores originales del maestro, guardados la primera vez, así que se puede cambiar de base sin acumular.
 */
async function aplicarBase(id: BaseId) {
  const def = BASES[id];
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = (n: string) => cols.find((c) => c.name === n);
  const todas = await figma.variables.getLocalVariablesAsync();
  const de = (c: VariableCollection | undefined) => (c ? todas.filter((v) => v.variableCollectionId === c.id) : []);
  const borde = col('Borde'), esp = col('Espaciado'), uni = col('Unidad'), elev = col('Elevación'), mov = col('Movimiento');
  let base: { esp: Record<string, number>; elev: Record<string, Record<string, any>>; curva?: string } | null = null;
  try { const g = figma.root.getPluginData('dsgbr.baseline'); base = g ? JSON.parse(g) : null; } catch { base = null; }
  if (!base) {
    base = { esp: {}, elev: {} };
    for (const v of de(esp)) {
      const a = v.valuesByMode[esp!.defaultModeId] as VariableAlias;
      const u = todas.find((x) => x.id === a.id);
      if (u) base.esp[v.name] = Number(u.name.split('/')[1]);
    }
    for (const v of de(elev)) base.elev[v.name] = { ...v.valuesByMode };
    const ce = de(mov).find((v) => v.name === 'Curva/Entrada');
    if (ce && mov) base.curva = ce.valuesByMode[mov.modes[0].modeId] as string;
    figma.root.setPluginData('dsgbr.baseline', JSON.stringify(base));
  }
  let cambios = 0;
  // Forma
  for (const [k, px] of Object.entries(def.radio)) {
    const v = de(borde).find((x) => x.name === `Radio/${k}`);
    if (v && borde) { v.setValueForMode(borde.defaultModeId, px); cambios++; }
  }
  // Espaciado
  const unidades = de(uni).map((v) => Number(v.name.split('/')[1])).filter((n) => !isNaN(n));
  for (const v of de(esp)) {
    const orig = base.esp[v.name];
    if (orig === undefined || !esp) continue;
    const u = de(uni).find((x) => x.name === `Unidad/${espacioParaBase(orig, id, unidades)}`);
    if (u) { v.setValueForMode(esp.defaultModeId, figma.variables.createVariableAlias(u)); cambios++; }
  }
  // Elevación (cada modo parte de su valor original)
  for (const v of de(elev)) {
    const orig = base.elev[v.name];
    if (!orig || !elev) continue;
    for (const m of elev.modes) {
      const o = orig[m.modeId];
      if (o === undefined) continue;
      if (v.name.endsWith('/Color')) v.setValueForMode(m.modeId, { r: o.r, g: o.g, b: o.b, a: Math.min(1, Math.round(o.a * def.sombra.alfa * 1000) / 1000) });
      else v.setValueForMode(m.modeId, Math.round(Number(o) * def.sombra.escala));
    }
    cambios++;
  }
  // Movimiento (solo el modo Normal; Reducido queda en 0)
  if (mov) {
    const normal = mov.modes[0].modeId;
    for (const [k, ms] of Object.entries(def.duracion)) {
      const v = de(mov).find((x) => x.name === `Duración/${k}`);
      if (v) { v.setValueForMode(normal, ms); cambios++; }
    }
    const ce = de(mov).find((x) => x.name === 'Curva/Entrada');
    const curva = def.curvaEntrada || base.curva;
    if (ce && curva) { ce.setValueForMode(normal, curva); cambios++; }
  }
  return { base: def.nombre, cambios };
}

/** Cambia la familia de marca. Los estilos de texto están ligados a estas variables, así que se actualizan solos. */
async function aplicarTipografia(familia: string) {
  const fuentes = await figma.listAvailableFontsAsync();
  const estilos = fuentes.filter((f) => f.fontName.family.toLowerCase() === familia.toLowerCase()).map((f) => f.fontName);
  if (!estilos.length) throw new Error(`La fuente «${familia}» no está disponible en Figma. Revisa el nombre (por ejemplo «Poppins») o instálala.`);
  const fam = estilos[0].family;
  const buscar = (opts: string[]) => opts.map((o) => estilos.find((e) => e.style.toLowerCase() === o.toLowerCase())).find(Boolean);
  const regular = buscar(['Regular', 'Normal', 'Book']);
  const semi = buscar(['Semi Bold', 'SemiBold', 'Semibold', 'Demi Bold', 'Medium', 'Bold']);
  if (!regular) throw new Error(`«${fam}» no tiene el peso Regular, que el sistema necesita.`);
  if (!semi) throw new Error(`«${fam}» no tiene un peso Seminegrita (Semi Bold o Bold).`);
  await figma.loadFontAsync(regular); await figma.loadFontAsync(semi);
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name === 'Primitivos: Tipografía');
  if (!col) throw new Error('No encuentro la colección «Primitivos: Tipografía».');
  const vars = await figma.variables.getLocalVariablesAsync('STRING');
  const poner = (nombre: string, valor: string) => {
    const v = vars.find((x) => x.variableCollectionId === col.id && x.name === nombre);
    if (!v) throw new Error(`Falta la variable «${nombre}».`);
    v.setValueForMode(col.modes[0].modeId, valor);
  };
  poner('Familia/Marca', fam);
  poner('Peso/Regular', regular.style);
  poner('Peso/Seminegrita', semi.style);
  return { familia: fam, regular: regular.style, seminegrita: semi.style };
}

/** Crea las páginas que faltan, respetando el orden estándar. Devuelve las creadas. */
async function crearPaginas(requeridas: string[]): Promise<string[]> {
  const creadas: string[] = [];
  for (let i = 0; i < requeridas.length; i++) {
    const nombre = requeridas[i];
    const existe = figma.root.children.some((p) => p.name === nombre);
    if (nombre !== SEP && existe) continue;
    if (nombre === SEP) {
      // El separador solo se crea si el anterior en la lista existe y el siguiente no está ya precedido por uno.
      const prev = figma.root.children.findIndex((p) => p.name === requeridas[i - 1]);
      const sig = figma.root.children.findIndex((p) => p.name === requeridas[i + 1]);
      if (prev < 0) continue;
      if (sig >= 0 && figma.root.children[sig - 1]?.name === SEP) continue;
      if (figma.root.children[prev + 1]?.name === SEP) continue;
      const p = figma.createPage(); p.name = SEP;
      figma.root.insertChild(prev + 1, p);
      continue;
    }
    const pagina = figma.createPage(); pagina.name = nombre;
    const prev = i > 0 ? figma.root.children.findIndex((p) => p.name === requeridas[i - 1] && p !== pagina) : -1;
    figma.root.insertChild(prev >= 0 ? prev + 1 : figma.root.children.length - 1, pagina);
    creadas.push(nombre);
  }
  return creadas;
}

async function quitarPaginas(nombres: string[]): Promise<string[]> {
  const quitadas: string[] = [];
  for (const n of nombres) {
    const p = figma.root.children.find((x) => x.name === n);
    if (p && p !== figma.currentPage) { p.remove(); quitadas.push(n); }
  }
  return quitadas;
}

async function rellenarPortada(e: Entrada) {
  const portada = figma.root.children[0];
  await figma.setCurrentPageAsync(portada);
  const textos = portada.findAll((n) => n.type === 'TEXT') as TextNode[];
  const titulo = textos.find((t) => t.getPluginData('rol') === 'cliente') || textos.find((t) => t.characters.startsWith('['));
  const sub = textos.find((t) => t.getPluginData('rol') === 'subtitulo') || textos.find((t) => t.characters.startsWith('Sistema de diseño'));
  const nombresPlat: Record<Plataforma, string> = { web: 'Web', ios: 'iOS', android: 'Android' };
  const lista = e.plataformas.map((p) => nombresPlat[p]);
  const txtPlat = lista.length > 1 ? lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1] : lista[0];
  if (titulo) { await figma.loadFontAsync(titulo.fontName as FontName); titulo.characters = e.cliente; titulo.setPluginData('rol', 'cliente'); }
  if (sub) {
    await figma.loadFontAsync(sub.fontName as FontName);
    sub.characters = `Sistema de diseño · Variables, estilos y componentes para ${txtPlat}`;
    sub.setPluginData('rol', 'subtitulo');
  }
}

/** Escribe el texto de la celda de un campo (marco con el nombre del campo dentro de «Campos»). */
async function ponerCampo(pagina: PageNode, campo: string, valor: string): Promise<boolean> {
  const marco = pagina.findOne((n) => n.type === 'FRAME' && n.name === campo && !!n.parent && n.parent.name === 'Campos') as FrameNode | null;
  if (!marco) return false;
  const celda = marco.findOne((n) => n.type === 'TEXT' && !!n.parent && n.parent.name.startsWith('Herramientas/Celda')) as TextNode | null;
  if (!celda) return false;
  const fuentes = celda.getStyledTextSegments(['fontName']).map((x) => x.fontName);
  for (const f of fuentes) await figma.loadFontAsync(f);
  if (!fuentes.length) await figma.loadFontAsync(celda.fontName as FontName);
  celda.characters = valor;
  return true;
}

/** Rellena «Resumen», «Contenido y tono» y el nombre del logo. Devuelve cuántos campos escribió. */
async function rellenarBrief(e: Entrada): Promise<{ campos: number; sinPagina: string[] }> {
  const b = e.brief || {};
  const original = figma.currentPage;
  const nombresPlat: Record<Plataforma, string> = { web: 'Web', ios: 'iOS', android: 'Android' };
  const resumen: Record<string, string | undefined> = {
    'Cliente': e.cliente, 'Sector': b.sector, 'Propuesta de valor': b.propuesta, 'Público objetivo': b.publico,
    'Plataformas': e.plataformas.map((p) => nombresPlat[p]).join(' · '), 'Idioma principal': b.idioma,
    'Fuente tipográfica': e.tipografia, 'Color de marca': e.colores[0]?.hex.toUpperCase(), 'Versión del sistema': e.versionDS || '1.0.0',
  };
  const tono: Record<string, string | undefined> = {
    'Voz de marca': b.voz, 'Tono en interfaz': b.tono, 'Tratamiento': b.tratamiento, 'Mayúsculas en botones': b.mayusculas,
    'Mensajes de error': b.errores, 'Palabras a evitar': b.evitar, 'Ejemplo de botón principal': b.ejemploBoton, 'Ejemplo de estado vacío': b.ejemploVacio,
  };
  let campos = 0; const sinPagina: string[] = [];
  for (const [nombrePagina, datos] of [['↳ Resumen', resumen], ['↳ Contenido y tono', tono]] as [string, Record<string, string | undefined>][]) {
    const pagina = figma.root.children.find((p) => p.name === nombrePagina);
    if (!pagina) { sinPagina.push(nombrePagina); continue; }
    await figma.setCurrentPageAsync(pagina);
    for (const [campo, valor] of Object.entries(datos)) {
      if (valor && valor.trim() && (await ponerCampo(pagina, campo, valor.trim()))) campos++;
    }
  }
  // Nombre de marca del logo: cambia el valor por defecto de la propiedad de texto.
  const pLogo = figma.root.children.find((p) => p.name === '↳ Logo');
  if (pLogo && e.cliente.trim()) {
    await figma.setCurrentPageAsync(pLogo);
    const conj = pLogo.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Logo/Marca') as ComponentSetNode | null;
    if (conj) {
      const clave = Object.keys(conj.componentPropertyDefinitions).find((k) => k.startsWith('Nombre de marca'));
      if (clave) {
        const nodos = conj.findAll((n) => n.type === 'TEXT') as TextNode[];
        for (const t of nodos) await figma.loadFontAsync(t.fontName as FontName);
        conj.editComponentProperty(clave, { defaultValue: e.cliente.trim() });
        campos++;
      }
    }
  }
  await figma.setCurrentPageAsync(original);
  return { campos, sinPagina };
}

function validar(e: Entrada) {
  if (!e.cliente.trim()) throw new Error('Escribe el nombre del cliente.');
  if (!e.colores.length) throw new Error('Agrega al menos el color de marca.');
  const usados = new Set<string>();
  for (const c of e.colores) {
    if (!c.nombre.trim() || /[\/]/.test(c.nombre)) throw new Error('Cada color necesita un nombre sin «/».');
    if (usados.has(c.nombre.toLowerCase())) throw new Error(`El nombre «${c.nombre}» está repetido.`);
    usados.add(c.nombre.toLowerCase());
    if (!/^#[0-9A-Fa-f]{6}$/.test(c.hex)) throw new Error(`El color «${c.nombre}» debe ser un hex de 6 dígitos, por ejemplo #3366E6.`);
  }
  if (!e.plataformas.length) throw new Error('Elige al menos una plataforma.');
  if (e.versionDS && !/^\d+\.\d+\.\d+$/.test(e.versionDS)) throw new Error('La versión del sistema debe tener el formato 1.0.0.');
}

async function aplicar(e: Entrada) {
  validar(e);
  const estado = await verificarMaestro();
  if (!estado.esMaestro) throw new Error('Este archivo no parece un maestro DSGBR. Faltan: ' + estado.faltan.join(', '));

  const perfil: Perfil = e.perfil === 'minimo' || e.perfil === 'estandar' ? e.perfil : 'completo';
  const requeridas = paginasRequeridas(e.plataformas, e.extras, perfil);
  const creadas = await crearPaginas(requeridas);

  let quitadas: string[] = [];
  if (e.quitarSobrantes) {
    const sobran: string[] = [];
    if (!e.plataformas.includes('web')) sobran.push('🖥️ Componentes Web', ...paginasDeGrupo('web'));
    if (!e.plataformas.includes('ios') && !e.plataformas.includes('android')) sobran.push('📱 Componentes App', ...paginasDeGrupo('app'));
    quitadas = await quitarPaginas(sobran);
  }

  const poda = perfil !== 'completo' ? await aplicarPerfil(perfil) : null;

  const { escritas, nuevas } = await aplicarPaleta(e.colores);
  const rolesNuevos = await aplicarRolesExtra(e.colores);
  const baseAplicada = await aplicarBase(e.base);
  const fuente = e.tipografia && e.tipografia.trim() ? await aplicarTipografia(e.tipografia.trim()) : null;
  await rellenarPortada(e);
  const briefRes = await rellenarBrief(e);
  figma.root.setPluginData('dsgbr.marca', JSON.stringify({ ...e, perfil, plugin: '0.11.0' }));
  return {
    escritas, nuevas, creadas, quitadas, poda, fuente, rolesNuevos, baseAplicada, briefRes, auditoria: await auditarContraste(),
    contraste: {
      claro: [...checkContrast(e.colores[0].hex, 'claro'), ...e.colores.slice(1).flatMap((c) => checkExtra(c.nombre, c.hex, 'claro'))],
      oscuro: [...checkContrast(e.colores[0].hex, 'oscuro'), ...e.colores.slice(1).flatMap((c) => checkExtra(c.nombre, c.hex, 'oscuro'))],
    },
  };
}


// ---------- Perfiles: recortar el archivo del cliente ----------
/** Quita del archivo lo que el perfil no conserva. Nunca quita una página cuyos componentes use otra página que se queda. */
async function aplicarPerfil(perfil: Perfil) {
  await figma.loadAllPagesAsync();
  const portada = figma.root.children.find((p) => p.name === '👋 Portada') || figma.root.children[0];
  await figma.setCurrentPageAsync(portada);
  const nombres = new Set(paginasFueraDePerfil(perfil));
  const candidatas = figma.root.children.filter((p) => nombres.has(p.name) || (perfil === 'minimo' && p.name === SEP));
  const ids = new Set(candidatas.map((p) => p.id));
  // Componentes que viven en las páginas candidatas.
  const comps = new Set<string>();
  for (const p of candidatas) for (const n of p.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] })) comps.add(n.id);
  const protegidas = new Set<string>();
  if (comps.size) {
    for (const p of figma.root.children) {
      if (ids.has(p.id)) continue;
      for (const inst of p.findAllWithCriteria({ types: ['INSTANCE'] })) {
        const m = await inst.getMainComponentAsync();
        if (!m) continue;
        const dueño = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m;
        if (comps.has(m.id) || comps.has(dueño.id)) {
          // Averigua a qué página candidata pertenece ese componente.
          let n: BaseNode | null = dueño;
          while (n && n.parent && n.parent.type !== 'DOCUMENT') n = n.parent;
          if (n && ids.has(n.id)) protegidas.add(n.id);
        }
      }
    }
  }
  const quitadas: string[] = [];
  for (const p of candidatas) {
    if (protegidas.has(p.id)) continue;
    quitadas.push(p.name);
    p.remove();
  }
  let coleccion = false;
  if (perfil === 'minimo' && quitadas.includes('↳ Color para datos')) {
    for (const col of await figma.variables.getLocalVariableCollectionsAsync()) {
      if (col.name === 'Semánticos: Color para datos') { col.remove(); coleccion = true; }
    }
  }
  let iconos = 0;
  try { iconos = (await podarIconos(true)).quitados; } catch (_) { /* sin página de íconos: nada que quitar */ }
  return { perfil, paginas: quitadas.length, protegidas: candidatas.filter((p) => protegidas.has(p.id)).map((p) => p.name), coleccion, iconos };
}

// ---------- Auditoría de contraste sobre los roles reales del archivo ----------
const MODOS = { claro: 'Claro', oscuro: 'Oscuro' } as const;

async function modeloColor() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const sem = cols.find((c) => c.name === COL_SEM);
  if (!sem) throw new Error('No encuentro la colección «Semánticos: Color».');
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  const porId = new Map(vars.map((v) => [v.id, v]));
  const colDe = new Map(cols.map((c) => [c.id, c]));
  const aHex = (c: RGB) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  const resolver = (v: Variable, nombreModo: string, prof = 0): string | undefined => {
    if (prof > 8) return undefined;
    const col = colDe.get(v.variableCollectionId);
    if (!col) return undefined;
    const modo = col.modes.find((m) => m.name === nombreModo) || col.modes[0];
    const val: any = v.valuesByMode[modo.modeId];
    if (val && val.type === 'VARIABLE_ALIAS') { const t = porId.get(val.id); return t ? resolver(t, nombreModo, prof + 1) : undefined; }
    return val && typeof val.r === 'number' ? aHex(val as RGB) : undefined;
  };
  const roles = new Map(vars.filter((v) => v.variableCollectionId === sem.id).map((v) => [v.name, v]));
  return { sem, vars, porId, resolver, roles };
}
type ModeloColor = Awaited<ReturnType<typeof modeloColor>>;

function auditoriaDe(m: ModeloColor): AuditoriaPar[] {
  return auditarRoles((rol, modo) => { const v = m.roles.get(rol); return v ? m.resolver(v, MODOS[modo]) : undefined; });
}

/** Revisa los pares reales (texto 4,5:1, bordes 3:1) en Claro y Oscuro y devuelve los que no cumplen. */
async function auditarContraste() {
  const todos = auditoriaDe(await modeloColor());
  return { total: todos.length, fallos: todos.filter((p) => !p.cumple) };
}

/** Roles de primer plano que el plugin no mueve solo porque afectan a muchos pares a la vez. */
const NO_TOCAR = new Set(['Contenido/Primario', 'Contenido/Primario Inverso', 'Contenido/Deshabilitado']);

/** Mueve un paso en la rampa el color de los roles de primer plano que no cumplen, hasta que cumplan (máx. 8 pasadas). */
async function corregirContraste() {
  const cambios: string[] = [];
  for (let pasada = 0; pasada < 8; pasada++) {
    const m = await modeloColor();
    const fallos = auditoriaDe(m).filter((p) => !p.cumple && !NO_TOCAR.has(p.rol));
    const hechos = new Set<string>();
    for (const f of fallos) {
      const clave = f.rol + '|' + f.modo;
      if (hechos.has(clave)) continue;
      const v = m.roles.get(f.rol); const fondo = m.roles.get(f.sobre);
      if (!v || !fondo) continue;
      const modo = MODOS[f.modo];
      const modeId = m.sem.modes.find((x) => x.name === modo)!.modeId;
      const val: any = v.valuesByMode[modeId];
      if (!val || val.type !== 'VARIABLE_ALIAS') continue;
      const actual = m.porId.get(val.id);
      if (!actual) continue;
      const fam = actual.name.split('/')[0];
      const hermanos = m.vars
        .filter((x) => x.variableCollectionId === actual.variableCollectionId && x.name.startsWith(fam + '/') && !isNaN(Number(x.name.split('/')[1])))
        .map((x) => ({ v: x, n: Number(x.name.split('/')[1]) })).sort((a, b) => a.n - b.n);
      const i = hermanos.findIndex((x) => x.v.id === actual.id);
      const fondoHex = m.resolver(fondo, modo);
      if (i < 0 || !fondoHex) continue;
      const ratio = (k: number) => { const h = m.resolver(hermanos[k].v, modo); return h ? contrast(h, fondoHex) : -1; };
      const arriba = i + 1 < hermanos.length ? ratio(i + 1) : -1;
      const abajo = i - 1 >= 0 ? ratio(i - 1) : -1;
      if (Math.max(arriba, abajo) <= f.ratio) continue;
      const j = arriba >= abajo ? i + 1 : i - 1;
      v.setValueForMode(modeId, figma.variables.createVariableAlias(hermanos[j].v));
      cambios.push(`${f.rol} (${modo}): ${actual.name} → ${hermanos[j].v.name}`);
      hechos.add(clave);
    }
    if (!hechos.size) break;
  }
  const restantes = (await auditarContraste()).fallos;
  return { cambios, restantes };
}

// ---------- Imágenes de los componentes (para el DocSite) ----------
const slugArchivo = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'componente';

/** Exporta cada conjunto de componentes Web y App como PNG (2x) y arma el índice `componentes.json`. */
async function exportarComponentes() {
  const imagenes: { nombre: string; bytes: Uint8Array }[] = [];
  const lista: any[] = [];
  const usados = new Set<string>();
  for (const [grupo, plataforma] of [['web', 'Web'], ['app', 'App']] as const) {
    for (const nombrePagina of paginasDeGrupo(grupo)) {
      const pagina = figma.root.children.find((p) => p.name === nombrePagina);
      if (!pagina) continue;
      await pagina.loadAsync();
      for (const set of pagina.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
        if (!/^(Web|App)\//.test(set.name)) continue;
        let base = slugArchivo(set.name), k = 2;
        while (usados.has(base)) base = slugArchivo(set.name) + '-' + k++;
        usados.add(base);
        const bytes = await set.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
        const archivo = `componentes/${base}.png`;
        imagenes.push({ nombre: archivo, bytes });
        const defs = set.componentPropertyDefinitions;
        lista.push({
          nombre: set.name.replace(/^(Web|App)\//, ''), plataforma, archivo,
          ancho: Math.round(set.width), alto: Math.round(set.height), variantes: set.children.length,
          propiedades: Object.keys(defs).map((c) => {
            const d: any = defs[c];
            return { nombre: c.split('#')[0], tipo: d.type, ...(d.type === 'VARIANT' ? { valores: d.variantOptions } : { porDefecto: d.defaultValue }) };
          }),
        });
      }
    }
  }
  const manifiesto = JSON.stringify({ generado: new Date().toISOString().slice(0, 10), archivoFigma: figma.root.name, componentes: lista }, null, 2) + '\n';
  let iconos = '', nIconos = 0;
  try { const r = await exportarIconos(); iconos = r.json; nIconos = r.cantidad; } catch (_) { /* sin íconos exportables: el DocSite usa su lista mínima */ }
  return { manifiesto, imagenes, iconos, nIconos };
}


// ---------- Íconos sin uso (aligerar el archivo de cada cliente) ----------
const PAGINA_ICONOS = '↳ Íconos';

/** Ids de los conjuntos `Ícono/…` que usa algún componente o página (fuera de la página Íconos). */
async function iconosEnUso(pagIconos: PageNode): Promise<Set<string>> {
  await figma.loadAllPagesAsync();
  const esIcono = (n: BaseNode | null): n is ComponentSetNode => !!n && n.type === 'COMPONENT_SET' && n.name.indexOf('Ícono/') === 0;
  const aSet = (n: BaseNode | null): ComponentSetNode | null => {
    if (!n) return null;
    if (esIcono(n)) return n;
    if (n.type === 'COMPONENT' && esIcono(n.parent)) return n.parent as ComponentSetNode;
    return null;
  };
  const usados = new Set<string>();
  const marcar = async (id: unknown) => {
    if (typeof id !== 'string') return;
    const s = aSet(await figma.getNodeByIdAsync(id));
    if (s) usados.add(s.id);
  };
  for (const pagina of figma.root.children) {
    if (pagina === pagIconos) continue;
    for (const inst of pagina.findAllWithCriteria({ types: ['INSTANCE'] })) {
      const m = await inst.getMainComponentAsync();
      const s = aSet(m);
      if (s) usados.add(s.id);
      for (const k of Object.keys(inst.componentProperties)) {
        const p = inst.componentProperties[k];
        if (p.type === 'INSTANCE_SWAP') await marcar(p.value);
      }
    }
    // Valores por defecto y preferidos de las propiedades de intercambio de los componentes.
    for (const comp of pagina.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
      if (comp.type === 'COMPONENT' && comp.parent && comp.parent.type === 'COMPONENT_SET') continue;
      const defs = comp.componentPropertyDefinitions;
      for (const k of Object.keys(defs)) {
        const d: any = defs[k];
        if (d.type !== 'INSTANCE_SWAP') continue;
        await marcar(d.defaultValue);
        for (const pv of d.preferredValues || []) await marcar(pv.key);
      }
    }
  }
  return usados;
}

/** Calcula qué conjuntos `Ícono/…` de la página Íconos no usa ningún componente ni página. `quitar` los elimina. Mantiene todo lo dudoso. */
async function podarIconos(quitar: boolean) {
  const pagIconos = figma.root.children.find((p) => p.name === PAGINA_ICONOS);
  if (!pagIconos) throw new Error('No encuentro la página «' + PAGINA_ICONOS + '».');
  const usados = await iconosEnUso(pagIconos);
  if (usados.size === 0) throw new Error('No encontré ningún ícono en uso; no quito nada por seguridad.');
  const todos = pagIconos.findAllWithCriteria({ types: ['COMPONENT_SET'] }).filter((s) => s.name.indexOf('Ícono/') === 0);
  const sinUso = todos.filter((s) => !usados.has(s.id));
  const nombres = sinUso.map((s) => s.name.replace('Ícono/', ''));
  if (quitar) {
    for (const s of sinUso) s.remove();
    figma.root.setPluginData('dsgbr.iconosQuitados', String(nombres.length));
  }
  return { total: todos.length, enUso: usados.size, sinUso: nombres.length, quitados: quitar ? nombres.length : 0, muestra: nombres.slice(0, 12) };
}

/** SVG de cada ícono en uso (estilo Lineal, 16 px) para el Constructor del DocSite. El color pasa a `currentColor`. */
async function exportarIconos() {
  const pagIconos = figma.root.children.find((p) => p.name === PAGINA_ICONOS);
  if (!pagIconos) return { json: '', cantidad: 0 };
  const usados = await iconosEnUso(pagIconos);
  const iconos: { clave: string; nombre: string; svg: string }[] = [];
  const claves = new Set<string>();
  for (const set of pagIconos.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    if (set.name.indexOf('Ícono/') !== 0 || !usados.has(set.id)) continue;
    const variante = (set.children.find((c) => /Estilo=Lineal/.test(c.name) && /Tamaño=16/.test(c.name)) || set.children[0]) as SceneNode | undefined;
    if (!variante) continue;
    let svg = await variante.exportAsync({ format: 'SVG_STRING' });
    svg = svg.replace(/<svg[^>]*>/, (t) => t.replace(/\s(width|height)="[^"]*"/g, '')).replace(/fill="(?!none|currentColor)[^"]*"/g, 'fill="currentColor"').replace(/stroke="(?!none|currentColor)[^"]*"/g, 'stroke="currentColor"').replace(/>\s+</g, '><').trim();
    const nombre = set.name.replace('Ícono/', '');
    let clave = slugArchivo(nombre), k = 2;
    while (claves.has(clave)) clave = slugArchivo(nombre) + '-' + k++;
    claves.add(clave);
    iconos.push({ clave, nombre, svg });
  }
  return { json: JSON.stringify({ generado: new Date().toISOString().slice(0, 10), iconos }, null, 2) + '\n', cantidad: iconos.length };
}

figma.ui.onmessage = async (msg: { tipo: string; datos?: Entrada }) => {
  try {
    if (msg.tipo === 'verificar') {
      figma.ui.postMessage({ tipo: 'estado', ...(await verificarMaestro()) });
    } else if (msg.tipo === 'aplicar' && msg.datos) {
      const r = await aplicar(msg.datos);
      figma.notify(`DSGBR: ${r.creadas.length} páginas creadas, ${r.escritas} variables de color escritas`);
      figma.ui.postMessage({ tipo: 'aplicado', ...r });
    } else if (msg.tipo === 'auditar') {
      figma.ui.postMessage({ tipo: 'auditoria', ...(await auditarContraste()) });
    } else if (msg.tipo === 'corregirContraste') {
      figma.ui.postMessage({ tipo: 'corregido', ...(await corregirContraste()) });
    } else if (msg.tipo === 'exportarComponentes') {
      figma.ui.postMessage({ tipo: 'componentes', ...(await exportarComponentes()) });
    } else if (msg.tipo === 'iconos') {
      figma.ui.postMessage({ tipo: 'iconos', ...(await podarIconos(!!(msg as any).quitar)) });
    } else if (msg.tipo === 'cargar') {
      const guardado = figma.root.getPluginData('dsgbr.marca');
      figma.ui.postMessage({ tipo: 'guardado', datos: guardado ? JSON.parse(guardado) : null });
    } else if (msg.tipo === 'exportar') {
      const guardado = figma.root.getPluginData('dsgbr.marca');
      const marca = guardado ? JSON.parse(guardado) : null;
      const est = await leerEstilos();
      const archivos = exportarTodo(await leerModelo(), {
        marca: marca ? { cliente: marca.cliente, base: marca.base, plataformas: marca.plataformas, version: marca.versionDS || '1.0.0', archivo: figma.root.name, colores: marca.colores, tipografia: marca.tipografia } : undefined,
        estilosTexto: est.texto, estilosEfecto: est.efectos,
      });
      // Brief de la marca para las páginas «Voz y tono» y «Fotografía» del DocSite.
      if (marca && marca.brief && Object.keys(marca.brief).length) {
        archivos.push({ nombre: 'brief.json', contenido: JSON.stringify({ generado: new Date().toISOString().slice(0, 10), cliente: marca.cliente || '', brief: marca.brief }, null, 2) } as any);
      }
      figma.ui.postMessage({ tipo: 'exportado', archivos });
    } else if (msg.tipo === 'pedirClave') {
      figma.ui.postMessage({ tipo: 'clave', clave: (await figma.clientStorage.getAsync('dsgbr.apikey')) || '' });
    } else if (msg.tipo === 'guardarClave') {
      await figma.clientStorage.setAsync('dsgbr.apikey', (msg as any).clave);
    } else if (msg.tipo === 'pedirGh') {
      figma.ui.postMessage({ tipo: 'gh', cfg: (await figma.clientStorage.getAsync('dsgbr.gh')) || null, token: (await figma.clientStorage.getAsync('dsgbr.ghtoken')) || '' });
    } else if (msg.tipo === 'guardarGh') {
      const m = msg as any;
      await figma.clientStorage.setAsync('dsgbr.gh', m.cfg || {});
      if (m.borrarToken) await figma.clientStorage.deleteAsync('dsgbr.ghtoken');
      else if (m.token) await figma.clientStorage.setAsync('dsgbr.ghtoken', m.token);
    } else if (msg.tipo === 'borrarClave') {
      await figma.clientStorage.deleteAsync('dsgbr.apikey');
    } else if (msg.tipo === 'fuentes') {
      const fam = [...new Set((await figma.listAvailableFontsAsync()).map((f) => f.fontName.family))].sort();
      const vars = await figma.variables.getLocalVariablesAsync('STRING');
      const actual = vars.find((v) => v.name === 'Familia/Marca');
      const col = actual && (await figma.variables.getVariableCollectionByIdAsync(actual.variableCollectionId));
      figma.ui.postMessage({ tipo: 'fuentes', familias: fam, actual: actual && col ? actual.valuesByMode[col.modes[0].modeId] : null });
    } else if (msg.tipo === 'cerrar') {
      figma.closePlugin();
    }
  } catch (err) {
    figma.ui.postMessage({ tipo: 'error', mensaje: (err as Error).message });
  }
};

figma.ui.postMessage({ tipo: 'listo' });
