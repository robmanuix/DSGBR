# DSGBR — DS Generate by Robman Digital

Plugin de Figma que genera un design system a partir del brief y el manual de marca de un cliente, y un DocSite (Astro) que muestra sus tokens y componentes.

| Carpeta | Qué es |
|---|---|
| `tokens-engine/` | Motor de tokens (TypeScript): paletas OKLCH, roles claro/oscuro, contraste AA, bases de diseño, salida W3C, CSS, Tailwind, Swift y Kotlin |
| `dsgbr-plugin/` | Plugin de Figma: aplica la marca al archivo maestro, audita contraste, exporta tokens e imágenes de componentes |
| `dsgbr-docsite-template/` | Plantilla del DocSite (Astro 5) que lee el ZIP exportado por el plugin |
| `schemas/` | Esquema JSON de `brand.json` |

## Flujo
1. Duplica el archivo maestro de Figma y ponle el nombre del cliente.
2. Abre el plugin, llena la marca (o léela con IA) y pulsa «Crear estructura y aplicar marca».
3. En «Exportar tokens» genera los archivos y descarga `dsgbr-entrada.zip`.
4. Copia el ZIP a `dsgbr-docsite-template/entrada/` y ejecuta `npm install` y `npm run dev` en esa carpeta.

## Motor y plugin
```bash
npm install
npm test        # pruebas del motor
npm run build   # compila motor y plugin
```
Figma Desktop > Plugins > Development > Import plugin from manifest… > `dsgbr-plugin/manifest.json`.

## Datos de clientes
`entrada/`, `tokens/`, `build/` y `docsite.config.json` se generan por cliente y no se suben a este repositorio.
