import type { Preview } from '@storybook/react-vite';
import './preview.css';

// El DocSite se muestra siempre en modo claro; el constructor igual.
document.documentElement.setAttribute('data-theme', 'light');

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true, sort: 'requiredFirst' },
    options: { storySort: { order: ['Acciones', 'Formularios', 'Retroalimentación', 'Navegación'] } },
  },
};
export default preview;
