import Aura from '@primeng/themes/aura';

export const themePreset = {
  ...Aura,
  semantic: {
    ...(Aura as any).semantic,
    colorScheme: {
      ...(Aura as any).semantic.colorScheme,
      light: {
        ...(Aura as any).semantic.colorScheme.light,
        text: {
          color: '{surface.900}',
          mutedColor: '{surface.600}',
          hoverColor: '{surface.900}',
          hoverMutedColor: '{surface.700}'
        },
        surface: {
          0: '#ffffff',
          50: '#f9f6f0',
          100: '#f1ece4',
          200: '#e6ded2',
          300: '#d6cab9',
          400: '#b9a991',
          500: '#9c8a73',
          600: '#7a6b59',
          700: '#594e43',
          800: '#3f372f',
          900: '#2c2621',
          950: '#1b1714'
        },
        primary: {
          color: '#1a8f78',
          contrastColor: '#ffffff',
          hoverColor: '#11715f',
          activeColor: '#0c5a4b'
        },
        highlight: {
          background: '#e6f4f0',
          focusBackground: '#d5efe8',
          color: '#0f6f5d',
          focusColor: '#0c5a4b'
        },
        content: {
          background: '#ffffff',
          borderColor: '#e2ddd3',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
          hoverBackground: '#f4efe6'
        },
        formField: {
          background: '#ffffff',
          borderColor: '#d9d3c8',
          color: '{text.color}',
          placeholderColor: '#8a7f72'
        }
      }
    }
  }
};
