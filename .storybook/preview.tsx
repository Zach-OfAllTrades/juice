import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import '../src/tokens/tokens.css';
import '../src/styles/reset.css';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-juice-theme', theme);
    document.body.style.background = 'var(--juice-color-bg)';
  }, [theme]);

  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Juice theme — toggles [data-juice-theme] to preview light/dark tokens',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
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
