export interface ColorPalette {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Secondary colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Status colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  info: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Neutral colors
  neutral: {
    0: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    hover: string;
    active: string;
    disabled: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  
  // Interactive colors
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
  };
  
  // Status colors
  status: {
    success: string;
    successBg: string;
    successBorder: string;
    warning: string;
    warningBg: string;
    warningBorder: string;
    error: string;
    errorBg: string;
    errorBorder: string;
    info: string;
    infoBg: string;
    infoBorder: string;
  };
  
  // Jira-specific status colors
  jira: {
    todo: string;
    todoBg: string;
    todoBorder: string;
    inProgress: string;
    inProgressBg: string;
    inProgressBorder: string;
    done: string;
    doneBg: string;
    doneBorder: string;
    blocked: string;
    blockedBg: string;
    blockedBorder: string;
  };
  
  // Shadow colors
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Tree-specific colors
  tree: {
    lines: string;
    linesHover: string;
  };
}

// Professional color palette based on modern design systems
const colorPalette: ColorPalette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  neutral: {
    0: '#ffffff',
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
    950: '#030712',
  },
};

// Light theme colors
export const lightTheme: ThemeColors = {
  background: {
    primary: colorPalette.neutral[0],
    secondary: colorPalette.neutral[50],
    tertiary: colorPalette.neutral[100],
    elevated: colorPalette.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  surface: {
    primary: colorPalette.neutral[0],
    secondary: colorPalette.neutral[50],
    tertiary: colorPalette.neutral[100],
    elevated: colorPalette.neutral[0],
    hover: colorPalette.neutral[50],
    active: colorPalette.neutral[100],
    disabled: colorPalette.neutral[100],
  },
  
  border: {
    primary: colorPalette.neutral[200],
    secondary: colorPalette.neutral[300],
    focus: colorPalette.primary[500],
    error: colorPalette.error[300],
    success: colorPalette.success[300],
    warning: colorPalette.warning[300],
  },
  
  text: {
    primary: colorPalette.neutral[900],
    secondary: colorPalette.neutral[600],
    tertiary: colorPalette.neutral[500],
    disabled: colorPalette.neutral[400],
    inverse: colorPalette.neutral[0],
    link: colorPalette.primary[600],
    linkHover: colorPalette.primary[700],
  },
  
  interactive: {
    primary: colorPalette.primary[600],
    primaryHover: colorPalette.primary[700],
    primaryActive: colorPalette.primary[800],
    secondary: colorPalette.secondary[200],
    secondaryHover: colorPalette.secondary[300],
    secondaryActive: colorPalette.secondary[400],
  },
  
  status: {
    success: colorPalette.success[600],
    successBg: colorPalette.success[50],
    successBorder: colorPalette.success[200],
    warning: colorPalette.warning[600],
    warningBg: colorPalette.warning[50],
    warningBorder: colorPalette.warning[200],
    error: colorPalette.error[600],
    errorBg: colorPalette.error[50],
    errorBorder: colorPalette.error[200],
    info: colorPalette.info[600],
    infoBg: colorPalette.info[50],
    infoBorder: colorPalette.info[200],
  },
  
  jira: {
    todo: colorPalette.secondary[600],
    todoBg: colorPalette.secondary[100],
    todoBorder: colorPalette.secondary[300],
    inProgress: colorPalette.warning[600],
    inProgressBg: colorPalette.warning[100],
    inProgressBorder: colorPalette.warning[300],
    done: colorPalette.success[600],
    doneBg: colorPalette.success[100],
    doneBorder: colorPalette.success[300],
    blocked: colorPalette.error[600],
    blockedBg: colorPalette.error[100],
    blockedBorder: colorPalette.error[300],
  },
  
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  tree: {
    lines: colorPalette.info[400],
    linesHover: colorPalette.info[500],
  },
};

// Dark theme colors
export const darkTheme: ThemeColors = {
  background: {
    primary: colorPalette.neutral[950],
    secondary: colorPalette.neutral[900],
    tertiary: colorPalette.neutral[800],
    elevated: colorPalette.neutral[900],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  surface: {
    primary: colorPalette.neutral[900],
    secondary: colorPalette.neutral[800],
    tertiary: colorPalette.neutral[700],
    elevated: colorPalette.neutral[800],
    hover: colorPalette.neutral[800],
    active: colorPalette.neutral[700],
    disabled: colorPalette.neutral[800],
  },
  
  border: {
    primary: colorPalette.neutral[700],
    secondary: colorPalette.neutral[600],
    focus: colorPalette.primary[400],
    error: colorPalette.error[600],
    success: colorPalette.success[600],
    warning: colorPalette.warning[600],
  },
  
  text: {
    primary: colorPalette.neutral[50],
    secondary: colorPalette.neutral[300],
    tertiary: colorPalette.neutral[400],
    disabled: colorPalette.neutral[600],
    inverse: colorPalette.neutral[900],
    link: colorPalette.primary[400],
    linkHover: colorPalette.primary[300],
  },
  
  interactive: {
    primary: colorPalette.primary[500],
    primaryHover: colorPalette.primary[400],
    primaryActive: colorPalette.primary[600],
    secondary: colorPalette.secondary[700],
    secondaryHover: colorPalette.secondary[600],
    secondaryActive: colorPalette.secondary[500],
  },
  
  status: {
    success: colorPalette.success[400],
    successBg: `${colorPalette.success[950]  }40`,
    successBorder: colorPalette.success[700],
    warning: colorPalette.warning[400],
    warningBg: `${colorPalette.warning[950]  }40`,
    warningBorder: colorPalette.warning[700],
    error: colorPalette.error[400],
    errorBg: `${colorPalette.error[950]  }40`,
    errorBorder: colorPalette.error[700],
    info: colorPalette.info[400],
    infoBg: `${colorPalette.info[950]  }40`,
    infoBorder: colorPalette.info[700],
  },
  
  jira: {
    todo: colorPalette.secondary[400],
    todoBg: colorPalette.secondary[800],
    todoBorder: colorPalette.secondary[600],
    inProgress: colorPalette.warning[300], // Even more yellowish text for dark theme
    inProgressBg: `${colorPalette.warning[300]}35`, // More yellowish transparent background
    inProgressBorder: colorPalette.warning[400], // More yellowish border
    done: colorPalette.success[400],
    doneBg: `${colorPalette.success[400]}35`, // Transparent green background like in-progress
    doneBorder: colorPalette.success[500],
    blocked: colorPalette.error[400],
    blockedBg: colorPalette.error[800],
    blockedBorder: colorPalette.error[600],
  },
  
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  },
  
  tree: {
    lines: colorPalette.info[300],
    linesHover: colorPalette.info[200],
  },
};

// Type for styled components
export interface StyledComponentColors {
  colors: ThemeColors;
} 