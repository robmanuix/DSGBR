import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from '../components';

const meta = {
  title: 'Formularios/Opción',
  component: Radio,
  args: { etiqueta: 'Envío estándar', name: 'envio', error: false, disabled: false },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Radio {...args} defaultChecked />
      <Radio {...args} etiqueta="Envío express" />
    </div>
  ),
} satisfies Meta<typeof Radio>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const ConError: Historia = { args: { error: true } };
