import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// CSS Custom Properties based theme interface
interface CSSThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    hover: string;
    active: string;
    disabled: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
  };
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
    epic: string;
    epicBg: string;
    epicBorder: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  tree: {
    lines: string;
    linesHover: string;
  };
}

interface ThemeContextType {
  isDarkTheme: boolean;
  colors: CSSThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS Custom Properties color object
const cssColors: CSSThemeColors = {
  background: {
    primary: 'var(--color-background-primary)',
    secondary: 'var(--color-background-secondary)',
    tertiary: 'var(--color-background-tertiary)',
    elevated: 'var(--color-background-elevated)',
    overlay: 'var(--color-background-overlay)',
  },
  surface: {
    primary: 'var(--color-surface-primary)',
    secondary: 'var(--color-surface-secondary)',
    tertiary: 'var(--color-surface-tertiary)',
    elevated: 'var(--color-surface-elevated)',
    hover: 'var(--color-surface-hover)',
    active: 'var(--color-surface-active)',
    disabled: 'var(--color-surface-disabled)',
  },
  border: {
    primary: 'var(--color-border-primary)',
    secondary: 'var(--color-border-secondary)',
    focus: 'var(--color-border-focus)',
    error: 'var(--color-border-error)',
    success: 'var(--color-border-success)',
    warning: 'var(--color-border-warning)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    disabled: 'var(--color-text-disabled)',
    inverse: 'var(--color-text-inverse)',
    link: 'var(--color-text-link)',
    linkHover: 'var(--color-text-link-hover)',
  },
  interactive: {
    primary: 'var(--color-interactive-primary)',
    primaryHover: 'var(--color-interactive-primary-hover)',
    primaryActive: 'var(--color-interactive-primary-active)',
    secondary: 'var(--color-interactive-secondary)',
    secondaryHover: 'var(--color-interactive-secondary-hover)',
    secondaryActive: 'var(--color-interactive-secondary-active)',
  },
  status: {
    success: 'var(--color-status-success)',
    successBg: 'var(--color-status-success-bg)',
    successBorder: 'var(--color-status-success-border)',
    warning: 'var(--color-status-warning)',
    warningBg: 'var(--color-status-warning-bg)',
    warningBorder: 'var(--color-status-warning-border)',
    error: 'var(--color-status-error)',
    errorBg: 'var(--color-status-error-bg)',
    errorBorder: 'var(--color-status-error-border)',
    info: 'var(--color-status-info)',
    infoBg: 'var(--color-status-info-bg)',
    infoBorder: 'var(--color-status-info-border)',
  },
  jira: {
    todo: 'var(--color-jira-todo)',
    todoBg: 'var(--color-jira-todo-bg)',
    todoBorder: 'var(--color-jira-todo-border)',
    inProgress: 'var(--color-jira-in-progress)',
    inProgressBg: 'var(--color-jira-in-progress-bg)',
    inProgressBorder: 'var(--color-jira-in-progress-border)',
    done: 'var(--color-jira-done)',
    doneBg: 'var(--color-jira-done-bg)',
    doneBorder: 'var(--color-jira-done-border)',
    blocked: 'var(--color-jira-blocked)',
    blockedBg: 'var(--color-jira-blocked-bg)',
    blockedBorder: 'var(--color-jira-blocked-border)',
    epic: 'var(--color-jira-epic)',
    epicBg: 'var(--color-jira-epic-bg)',
    epicBorder: 'var(--color-jira-epic-border)',
  },
  shadow: {
    sm: 'var(--color-shadow-sm)',
    md: 'var(--color-shadow-md)',
    lg: 'var(--color-shadow-lg)',
    xl: 'var(--color-shadow-xl)',
  },
  tree: {
    lines: 'var(--color-tree-lines)',
    linesHover: 'var(--color-tree-lines-hover)',
  },
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = false 
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(initialTheme);
  
  // Update data-theme attribute when theme changes
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkTheme]);
  
  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);
  
  const setTheme = useCallback((isDark: boolean) => {
    setIsDarkTheme(isDark);
  }, []);
  
  const value: ThemeContextType = {
    isDarkTheme,
    colors: cssColors,
    toggleTheme,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export types for styled components
export type { CSSThemeColors };
export interface StyledComponentColors {
  colors: CSSThemeColors;
} 