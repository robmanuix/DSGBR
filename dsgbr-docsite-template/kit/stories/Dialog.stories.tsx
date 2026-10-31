import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog } from '../components';

const meta = {
  title: 'Retroalimentación/Diálogo',
  component: Dialog,
  args: { abierto: false, onCerrar: () => {}, titulo: '¿Eliminar cliente?', children: 'Esta acción no se puede deshacer.' },
  argTypes: { abierto: { control: false }, onCerrar: { action: 'cerrado' } },
  render: ({ onCerrar, ...args }) => {
    const [abierto, setAbierto] = useState(false);
    return (
      <>
        <Button onClick={() => setAbierto(true)}>Abrir diálogo</Button>
        <Dialog {...args} abierto={abierto} onCerrar={() => { setAbierto(false); onCerrar(); }}
          acciones={<><Button tipo="terciario" onClick={() => setAbierto(false)}>Cancelar</Button><Button tipo="peligro" onClick={() => setAbierto(false)}>Eliminar</Button></>} />
      </>
    );
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Predeterminado: Historia = {};
