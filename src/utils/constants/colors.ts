export const COLORS = {
  // Primary colors (Beer theme)
  primary: '#D4A574', // Beer gold
  primaryDark: '#B8955F',
  primaryLight: '#E6C49A',

  // Secondary colors
  secondary: '#8B4513', // Dark brown
  secondaryLight: '#CD853F',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#FAFAFA',

  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8F8',

  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#FFFFFF',

  // Border colors
  border: '#E5E5E5',
  borderSecondary: '#D0D0D0',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Dark theme colors
  dark: {
    primary: '#E6B887',
    secondary: '#CD853F',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    surface: '#2D2D2D',
    surfaceSecondary: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textTertiary: '#888888',
    border: '#404040',
    borderSecondary: '#555555',
  },
} as const;

export type ColorKeys = keyof typeof COLORS;