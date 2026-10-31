import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpText } from '../components';

const meta = {
  title: 'Formularios/Texto de ayuda',
  component: HelpText,
  args: { children: 'Usa al menos 8 caracteres.', tamano: 'm', estado: 'predeterminado' },
  argTypes: {
    tamano: { control: 'inline-radio', options: ['l', 'm'] },
    estado: { control: 'select', options: ['predeterminado', 'info', 'aviso', 'error', 'exito', 'deshabilitado'] },
    children: { control: 'text', name: 'texto' },
  },
} satisfies Meta<typeof HelpText>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Error: Historia = { args: { estado: 'error', children: 'Esta contraseña es muy corta.' } };
export const Exito: Historia = { args: { estado: 'exito', children: 'Contraseña segura.' } };
