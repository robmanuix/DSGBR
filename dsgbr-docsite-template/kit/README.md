# Kit de componentes web (React + Tailwind v4)

Componentes listos para copiar al producto. Leen los tokens de la marca (`tokens.css` y `tailwind.css` de `build/web/`), así que cambian solos cuando cambia la marca: no llevan colores, radios ni tamaños fijos.

## Qué incluye

Botón (con versión píldora), Botón de ícono, Grupo de botones, Campo de texto, Texto de ayuda, Casilla, Opción, Interruptor, Selector, Alerta, Indicador de carga, Pestañas y Diálogo.

## Cómo usarlo en tu proyecto

1. Requisitos: React 18 o 19 y Tailwind v4.
2. Copia la carpeta `kit/components` a tu proyecto (por ejemplo `src/components/ds`).
3. En tu CSS principal, importa Tailwind y los tokens, en este orden:

```css
@import "tailwindcss";
@import "./tokens.css";   /* build/web/tokens.css */
@import "./tailwind.css"; /* build/web/tailwind.css */
@source "./components/ds";
```

4. Importa lo que necesites:

```tsx
import { Button, Input, Alert } from './components/ds';

<Button tipo="primario" iconoFinal={<Flecha />}>Continuar</Button>
<Input etiqueta="Correo" ayuda="Te avisaremos por aquí." />
<Alert estado="error" titulo="No se pudo guardar">Revisa tu conexión.</Alert>
```

`@source` le dice a Tailwind que busque clases dentro de los componentes; sin esa línea, los estilos no se generan.

## Probarlo antes de copiarlo

El DocSite incluye un **Constructor** (pestaña Components → Constructor) donde puedes cambiar las propiedades de cada componente con los tokens de la marca. En local: `npm run storybook`. Las historias están en `kit/stories`.

## Propiedades

Los nombres de las propiedades siguen los del archivo de Figma, en español.

| Componente | Propiedades principales |
|---|---|
| Button | `tamano` l/s · `tipo` primario/secundario/terciario/mono/peligro · `pildora` · `cargando` · `iconoInicial` · `iconoFinal` |
| IconButton | `tamano` · `tipo` · `cargando` · `icono` · `etiqueta` (obligatoria, es el nombre accesible) |
| ButtonGroup | `orientacion` horizontal/vertical |
| Input | `etiqueta` · `ayuda` · `error` · `iconoInicial` · `iconoFinal` |
| HelpText | `tamano` l/m · `estado` predeterminado/info/aviso/error/exito/deshabilitado |
| Checkbox | `etiqueta` · `indeterminada` · `error` |
| Radio | `etiqueta` · `error` |
| Switch | `etiqueta` |
| Select | `etiqueta` · `ayuda` · `error` (lista nativa del navegador) |
| Alert | `estado` info/aviso/error/exito · `titulo` · `acciones` |
| Spinner | `tamano` l/m/s · `tipo` primario/inverso/negativo/mono · `etiqueta` |
| Tabs | `pestanas` [{clave, etiqueta, contenido}] · `inicial` |
| Dialog | `abierto` · `onCerrar` · `titulo` · `acciones` |

Todos aceptan además los atributos normales de su elemento HTML (`onClick`, `disabled`, `name`, etc.) y `className`.

## Accesibilidad

Foco visible con el rol `Borde/Foco`, nombres accesibles en todos los controles, errores anunciados (`role="alert"`), Pestañas con flechas, Inicio y Fin, Diálogo sobre `<dialog>` (Esc y foco gestionados por el navegador) y animaciones desactivadas con «reducir movimiento».

## Tokens que usa

Si tu marca exporta menos roles de los necesarios, el componente que falte se verá sin ese color.

- `--color-background-brand`
- `--color-background-brand-hover`
- `--color-background-brand-pressed`
- `--color-background-hover`
- `--color-background-info`
- `--color-background-info-subtle`
- `--color-background-negative`
- `--color-background-negative-hover`
- `--color-background-negative-subtle`
- `--color-background-notice`
- `--color-background-notice-subtle`
- `--color-background-positive`
- `--color-background-positive-subtle`
- `--color-background-primary`
- `--color-background-selected`
- `--color-base-white`
- `--color-border-brand`
- `--color-border-focus`
- `--color-border-info`
- `--color-border-negative`
- `--color-border-notice`
- `--color-border-positive`
- `--color-border-primary`
- `--color-content-brand`
- `--color-content-disabled`
- `--color-content-info-bold`
- `--color-content-negative-bold`
- `--color-content-notice-bold`
- `--color-content-positive-bold`
- `--color-content-primary`
- `--color-content-primary-inverse`
- `--color-content-secondary`
- `--color-content-tertiary`
- `--motion-duration-fast`
- `--motion-easing-standard`
- `--radius-l`
- `--radius-m`
- `--radius-pill`
- `--radius-s`
- `--radius-xs`
- `--shadow-elevation-1`
- `--shadow-elevation-2`
- `--space-l`
- `--space-m`
- `--space-s`

## Limitaciones

- Solo web. Las versiones iOS (SwiftUI) y Android (Compose) llegan después del MVP.
- Fila, Botón fijo e Indicador de inicio no están: el primero queda para después y los otros dos son solo de app.
- Tarjeta, Insignia y Área de texto quedan para después del MVP.
