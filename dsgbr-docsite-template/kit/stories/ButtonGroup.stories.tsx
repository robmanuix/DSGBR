import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonGroup } from '../components';

const meta = {
  title: 'Acciones/Grupo de botones',
  component: ButtonGroup,
  args: { orientacion: 'horizontal' },
  argTypes: { orientacion: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Guardar</Button>
      <Button tipo="terciario">Cancelar</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Historia = StoryObj<typeof meta>;

export const Horizontal: Historia = {};
export const Vertical: Historia = { args: { orientacion: 'vertical' } };
