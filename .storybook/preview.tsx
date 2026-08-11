import type { Preview } from '@storybook/react';
import '../src/tokens/tokens.css';
import '../src/styles/reset.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'light-subtle', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
