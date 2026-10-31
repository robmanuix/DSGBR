import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '../components';
import { opcionesIcono } from './_iconos';

const meta = {
  title: 'Acciones/Botón de ícono',
  component: IconButton,
  args: { etiqueta: 'Agregar', icono: 'mas' as never, tipo: 'primario', tamano: 'l', cargando: false, disabled: false },
  argTypes: {
    tipo: { control: 'select', options: ['primario', 'secundario', 'terciario', 'mono', 'peligro'] },
    tamano: { control: 'inline-radio', options: ['l', 's'] },
    icono: { control: 'select', options: ['mas', 'flecha'], mapping: opcionesIcono },
    etiqueta: { control: 'text', description: 'Nombre accesible (no se ve, lo lee el lector de pantalla).' },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Pequeno: Historia = { args: { tamano: 's', tipo: 'mono' } };
export const Cargando: Historia = { args: { cargando: true } };
