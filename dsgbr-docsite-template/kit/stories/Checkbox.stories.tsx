import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../components';

const meta = {
  title: 'Formularios/Casilla',
  component: Checkbox,
  args: { etiqueta: 'Acepto los términos', indeterminada: false, error: false, disabled: false },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Marcada: Historia = { args: { defaultChecked: true } };
export const Indeterminada: Historia = { args: { indeterminada: true } };
export const ConError: Historia = { args: { error: true } };
