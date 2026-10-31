import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button } from '../components';

const meta = {
  title: 'Retroalimentación/Alerta',
  component: Alert,
  args: { estado: 'info', titulo: 'Información', children: 'Tu sesión expira en 10 minutos.' },
  argTypes: { estado: { control: 'select', options: ['info', 'aviso', 'error', 'exito'] }, children: { control: 'text', name: 'texto' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Alert>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Info: Historia = {};
export const Aviso: Historia = { args: { estado: 'aviso', titulo: 'Quedan pocos cupos', children: 'Reserva antes de que se agoten.' } };
export const Error: Historia = {
  args: { estado: 'error', titulo: 'No se pudo guardar', children: 'Revisa tu conexión.', acciones: <Button tamano="s" tipo="terciario">Reintentar</Button> },
};
export const Exito: Historia = { args: { estado: 'exito', titulo: '', children: 'Cambios guardados.' } };
