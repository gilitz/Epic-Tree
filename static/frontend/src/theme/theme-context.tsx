import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ThemeColors, lightTheme, darkTheme } from './colors';

interface ThemeContextType {
  isDarkTheme: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = false 
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(initialTheme);
  
  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);
  
  const setTheme = useCallback((isDark: boolean) => {
    setIsDarkTheme(isDark);
  }, []);
  
  const colors = isDarkTheme ? darkTheme : lightTheme;
  
  const value: ThemeContextType = {
    isDarkTheme,
    colors,
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