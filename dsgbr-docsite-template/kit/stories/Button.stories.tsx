import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components';
import { controlIcono } from './_iconos';

const meta = {
  title: 'Acciones/Botón',
  component: Button,
  args: { children: 'Continuar', tipo: 'primario', tamano: 'l', pildora: false, cargando: false, disabled: false, iconoInicial: 'ninguno', iconoFinal: 'ninguno' },
  argTypes: {
    tipo: { control: 'select', options: ['primario', 'secundario', 'terciario', 'mono', 'peligro'] },
    tamano: { control: 'inline-radio', options: ['l', 's'] },
    iconoInicial: controlIcono, iconoFinal: controlIcono,
    children: { control: 'text', name: 'etiqueta' },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Pildora: Historia = { args: { pildora: true } };
export const Cargando: Historia = { args: { cargando: true, children: 'Guardando' } };
export const ConIconos: Historia = { args: { iconoInicial: 'mas', iconoFinal: 'flecha', children: 'Agregar' } };
