module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Sora"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        ink: 'var(--ink)',
        ash: 'var(--ash)',
        ember: 'var(--ember)',
        emberSoft: 'var(--ember-soft)',
        mint: 'var(--mint)',
        sky: 'var(--sky)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        stroke: 'var(--stroke)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)'
      }
    }
  },
  plugins: []
};
