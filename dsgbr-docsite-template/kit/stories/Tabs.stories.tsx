import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '../components';

const meta = {
  title: 'Navegación/Pestañas',
  component: Tabs,
  args: {
    'aria-label': 'Secciones',
    pestanas: [
      { clave: 'resumen', etiqueta: 'Resumen', contenido: 'Vista general de tu cuenta.' },
      { clave: 'pedidos', etiqueta: 'Pedidos', contenido: 'Tus pedidos recientes.' },
      { clave: 'ajustes', etiqueta: 'Ajustes', contenido: 'Preferencias de la cuenta.' },
    ],
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const ConInicial: Historia = { args: { inicial: 'pedidos' } };
