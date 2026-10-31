import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../components';
import { controlIcono } from './_iconos';

const meta = {
  title: 'Formularios/Campo de texto',
  component: Input,
  args: { etiqueta: 'Correo electrónico', placeholder: 'nombre@empresa.com', ayuda: '', error: '', disabled: false, iconoInicial: 'ninguno', iconoFinal: 'ninguno' },
  argTypes: { iconoInicial: controlIcono, iconoFinal: controlIcono, ayuda: { control: 'text' }, error: { control: 'text', description: 'Si tiene texto, el campo pasa a estado de error.' } },
} satisfies Meta<typeof Input>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const ConAyuda: Historia = { args: { ayuda: 'Te avisaremos por este correo.' } };
export const ConError: Historia = { args: { error: 'Escribe un correo válido.', defaultValue: 'nombre@' } };
export const Deshabilitado: Historia = { args: { disabled: true } };
