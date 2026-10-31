import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '../components';

const meta = {
  title: 'Formularios/Interruptor',
  component: Switch,
  args: { etiqueta: 'Recibir avisos', disabled: false },
} satisfies Meta<typeof Switch>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Apagado: Historia = {};
export const Encendido: Historia = { args: { defaultChecked: true } };
