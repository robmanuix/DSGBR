# dsgbr-docsite-template

Plantilla del DocSite de DSGBR (Astro). Cada proyecto UI crea su repositorio a partir de esta plantilla.

## Qué contiene
- `src/` — sitio: Inicio, Foundations (Color, Tipografía, Espaciado y forma, Elevación y movimiento), Variables (con buscador y nombres por plataforma) y Descargas.
- `tokens/tokens.json` — tokens W3C que sube el plugin DSGBR (fuente única).
- `build/web|ios|android` — `tokens.css`, `tailwind.css`, `DSTokens.swift`, `DsTokens.kt`, también generados por el plugin.
- `docsite.config.json` — cliente, marca, base, plataformas y versión.
- `muestra/` — tokens de ejemplo; se usan solo si el repositorio aún no tiene `tokens/tokens.json`.
- `flujo-publicacion/publish.yml` — compila y publica en GitHub Pages en cada push a `main`. Al crear el repositorio debe quedar en `.github/workflows/publish.yml` (el plugin lo hará al publicar; a mano, muévelo ahí).

## Uso local
```
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
```

## Cómo se actualiza
1. En Figma, el plugin DSGBR → «Exportar tokens» → «Generar archivos» → «Descargar todo (.zip)». El ZIP trae siete archivos: `tokens.json`, `estilos.json`, `docsite.config.json`, `tokens.css`, `tailwind.css`, `DSTokens.swift` y `DsTokens.kt`.
2. Pon el `.zip` tal cual dentro de la carpeta `entrada/` del repositorio (créala si no existe). No hace falta descomprimirlo: `npm run build` lo abre y reparte los archivos en `tokens/`, `build/web|ios|android` y la raíz. También acepta los archivos sueltos.
3. Al hacer push a `main`, GitHub Actions publica el sitio.

De qué archivo sale cada cosa: nombre del cliente, versión y base → `docsite.config.json` (datos que el plugin guarda en el archivo de Figma); estilos de texto y de sombra → `estilos.json` (los estilos reales del archivo); colores, espaciado, radios y demás → `tokens.json`.

El sitio usa los propios tokens del cliente (`tokens.css`): sus colores, fuente y modo oscuro son los de la marca.

## Pendiente
Páginas de componentes (imagen de Figma, versión en vivo, especificación por plataforma), constructor (Storybook), historial de cambios por etiquetas de Git y las demás Foundations (iconografía, estados, accesibilidad, contenido y tono).


## Diseño (v0.2)
La interfaz parte del DocSite original de Robman (`robmanuix/dst-template`): sidebar, subpestañas, tarjetas con «Copiar» y constructores de componentes. Los datos salen de `tokens/tokens.json` (adaptador en `src/data/tokens.js`) y los colores, radios, sombras y tipografía de `tokens.css`. Las páginas de componentes todavía son las del archivo base y se alimentarán de la hoja de componentes más adelante.
