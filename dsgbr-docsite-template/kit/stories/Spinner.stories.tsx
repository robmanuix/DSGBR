import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '../components';

const meta = {
  title: 'Retroalimentación/Indicador de carga',
  component: Spinner,
  args: { tamano: 'm', tipo: 'primario', etiqueta: 'Cargando' },
  argTypes: { tamano: { control: 'inline-radio', options: ['l', 'm', 's'] }, tipo: { control: 'select', options: ['primario', 'inverso', 'negativo', 'mono'] } },
} satisfies Meta<typeof Spinner>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
export const Grande: Historia = { args: { tamano: 'l' } };
export const Inverso: Historia = {
  args: { tipo: 'inverso' },
  render: (args) => <div className="rounded-(--radius-m) bg-(--color-background-brand) p-6"><Spinner {...args} /></div>,
};
