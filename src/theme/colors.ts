// 🎨 TEMA OSCURO FUTURISTA

export const colors = {
  // Colores principales (Neon/Cyberpunk)
  primary: '#00f0ff', // Cyan neón
  primaryDark: '#00d4e8',
  primaryLight: '#5ff4ff',
  
  secondary: '#ff00ff', // Magenta neón
  secondaryDark: '#e600e6',
  secondaryLight: '#ff5fff',
  
  accent: '#ffea00', // Amarillo neón
  accentGreen: '#00ff88', // Verde neón
  accentPurple: '#b026ff', // Púrpura neón
  
  // Colores de fondo oscuros
  background: '#0a0a0f', // Casi negro
  backgroundGradient1: '#0a0a0f',
  backgroundGradient2: '#1a1a2e',
  surface: '#16161f', // Superficie oscura
  surfaceLight: '#1f1f2e',
  surfaceDark: '#0d0d14',
  
  // Textos
  text: '#ffffff',
  textLight: '#b4b4c8',
  textDark: '#6b6b7f',
  textGlow: '#00f0ff',
  
  // Estados (versiones neón)
  success: '#00ff88',
  warning: '#ffea00',
  error: '#ff0066',
  info: '#00f0ff',
  
  // Prioridades de objetivos (neón)
  priorityLow: '#00ff88',
  priorityMedium: '#ffea00',
  priorityHigh: '#ff0066',
  
  // Colores para objetivos (paleta neón futurista)
  goalColors: [
    '#ff0066', // Rosa neón
    '#ff00ff', // Magenta
    '#b026ff', // Púrpura
    '#6600ff', // Azul púrpura
    '#00f0ff', // Cyan
    '#00ff88', // Verde neón
    '#ffea00', // Amarillo neón
    '#ff6600', // Naranja neón
    '#ff3366', // Rosa rojizo
    '#00ffdd', // Turquesa
  ],
  
  // Grises
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
