/**
 * @fileoverview DATN Color Constants
 * @description Centralized color configuration for easy theme management
 * 
 * Main Brand Colors:
 * - Black: #000000
 * - White: #FFFFFF
 * - Lime Green: #C6D870
 * 
 * Usage:
 * import { COLORS } from '@/lib/constants/colors';
 * className={COLORS.primary.bg}
 */

export const COLORS = {
  // ============================================
  // Brand Colors - Modify these to change theme
  // ============================================
  brand: {
    lime: '#C6D870',
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // ============================================
  // Semantic Colors (using brand colors)
  // ============================================
  primary: {
    bg: 'bg-[#C6D870]',
    text: 'text-[#C6D870]',
    border: 'border-[#C6D870]',
    hover: 'hover:bg-[#C6D870]',
    hoverText: 'hover:text-[#C6D870]',
    ring: 'ring-[#C6D870]',
    from: 'from-[#C6D870]',
    to: 'to-[#C6D870]',
    via: 'via-[#C6D870]',
  },

  dark: {
    bg: 'bg-black',
    text: 'text-black',
    border: 'border-black',
    hover: 'hover:bg-black',
    hoverText: 'hover:text-black',
  },

  light: {
    bg: 'bg-white',
    text: 'text-white',
    border: 'border-white',
    hover: 'hover:bg-white',
    hoverText: 'hover:text-white',
  },

  // ============================================
  // Status Colors
  // ============================================
  success: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    light: 'bg-green-50',
  },

  error: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    light: 'bg-red-50',
  },

  warning: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    light: 'bg-yellow-50',
  },

  info: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    light: 'bg-blue-50',
  },

  // ============================================
  // Component-specific Colors
  // ============================================
  button: {
    primary: 'bg-[#C6D870] text-black hover:bg-[#B5C760] active:bg-[#A4B650]',
    secondary: 'bg-black text-white hover:bg-gray-900 active:bg-gray-800',
    outline: 'border-2 border-[#C6D870] text-[#C6D870] hover:bg-[#C6D870] hover:text-black',
    ghost: 'hover:bg-gray-100 text-black',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  },

  card: {
    light: 'bg-white border border-gray-200 shadow-sm',
    dark: 'bg-black border border-gray-800 shadow-sm',
    hover: 'hover:shadow-md hover:border-[#C6D870] transition-all duration-200',
  },

  input: {
    base: 'border border-gray-300 focus:border-[#C6D870] focus:ring-2 focus:ring-[#C6D870] focus:ring-opacity-20',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  },

  nav: {
    active: 'bg-[#C6D870] text-black',
    inactive: 'text-gray-600 hover:text-black hover:bg-gray-100',
    border: 'border-b border-gray-200',
  },

  badge: {
    primary: 'bg-[#C6D870] text-black',
    secondary: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  },

  gradient: {
    primary: 'bg-gradient-to-r from-[#C6D870] to-[#B5C760]',
    dark: 'bg-gradient-to-r from-black to-gray-900',
    lime: 'bg-gradient-to-br from-[#C6D870] via-[#D4E180] to-[#E0EA90]',
    radial: 'bg-radial-gradient from-[#C6D870] to-white',
  },
} as const;

/**
 * Utility function to combine color classes
 */
export const combineColors = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get color hex value by name
 */
export const getColorHex = (colorName: keyof typeof COLORS.brand): string => {
  const color = COLORS.brand[colorName];
  return typeof color === 'string' ? color : '';
};

/**
 * Theme configuration object
 */
export const THEME_CONFIG = {
  defaultTheme: 'light' as const,
  themes: ['light', 'dark'] as const,
  colors: {
    primary: '#C6D870',
    secondary: '#000000',
    accent: '#FFFFFF',
  },
} as const;
