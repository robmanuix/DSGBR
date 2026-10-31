import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '../components';

const meta = {
  title: 'Formularios/Selector',
  component: Select,
  args: { etiqueta: 'País', ayuda: '', error: '', disabled: false },
  render: (args) => (
    <Select {...args}>
      <option>Ecuador</option>
      <option>Perú</option>
      <option>Colombia</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const ConAyuda: Historia = { args: { ayuda: 'Elige donde recibirás el pedido.' } };
export const ConError: Historia = { args: { error: 'Elige un país.' } };
