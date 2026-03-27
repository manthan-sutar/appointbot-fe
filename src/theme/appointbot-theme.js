/**
 * Programmatic brand tokens — mirrors `appointbot-theme.css` (--ab-* and primary hex).
 * Use for charts, canvas, or inline styles; prefer Tailwind/CSS variables in components.
 */
export const appointbotBrand = {
  light: {
    bg: '#f1f5f9',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#0d9488',
    accentDark: '#0f766e',
    userBubble: '#ecfdf5',
    userBorder: '#99f6e4',
    headerGradient:
      'linear-gradient(135deg, #0f766e 0%, #115e59 48%, #134e4a 100%)',
  },
  dark: {
    bg: '#0c1917',
    surface: '#0f1f1c',
    text: '#ecfdf5',
    muted: '#94a3b8',
    accent: '#2dd4bf',
    accentDark: '#14b8a6',
    userBubble: '#134e4a',
    userBorder: '#115e59',
    headerGradient:
      'linear-gradient(135deg, #134e4a 0%, #115e59 52%, #0f766e 100%)',
  },
};
