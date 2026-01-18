import Aura from '@primeng/themes/aura';

export const themePreset = {
  ...Aura,
  semantic: {
    ...(Aura as any).semantic,
    colorScheme: {
      ...(Aura as any).semantic.colorScheme,
      dark: {
        ...(Aura as any).semantic.colorScheme.dark,
        text: {
          color: '#f4f2ee',
          mutedColor: '#a2a8b3',
          hoverColor: '#ffffff',
          hoverMutedColor: '#c2c8d2'
        },
        surface: {
          0: '#0c0f14',
          50: '#111722',
          100: '#161d29',
          200: '#1d2633',
          300: '#273243',
          400: '#344156',
          500: '#46556d',
          600: '#617088',
          700: '#7a879e',
          800: '#a0aab7',
          900: '#d7dde6',
          950: '#f2f4f8'
        },
        primary: {
          color: '#ff7d3b',
          contrastColor: '#0b0c10',
          hoverColor: '#ff965c',
          activeColor: '#e65f25'
        },
        highlight: {
          background: 'rgba(255, 125, 59, 0.18)',
          focusBackground: 'rgba(255, 125, 59, 0.28)',
          color: '#ffb381',
          focusColor: '#ffd0b1'
        },
        content: {
          background: '#141922',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
          hoverBackground: '#1c2431'
        },
        formField: {
          background: '#11161e',
          borderColor: 'rgba(255, 255, 255, 0.14)',
          color: '{text.color}',
          placeholderColor: '#7c8594'
        }
      }
    }
  }
};
