import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ThemeColors } from '../types/theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E9ECEF',
  card: '#FFFFFF',
  primary: '#4361EE',
  primaryVariant: '#3A56D4',
  secondary: '#7209B7',
  text: '#212529',
  textSecondary: '#6C757D',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  border: '#DEE2E6',
  shadow: '#000000',
  error: '#E63946',
  success: '#2A9D8F',
  warning: '#F4A261',
  info: '#457B9D',
  disabled: '#ADB5BD',
  ripple: '#4361EE1A',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  card: '#1E1E1E',
  primary: '#6C8CFF',
  primaryVariant: '#5A7AE6',
  secondary: '#9D4EDD',
  text: '#E9ECEF',
  textSecondary: '#ADB5BD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  border: '#495057',
  shadow: '#000000',
  error: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FFD166',
  info: '#118AB2',
  disabled: '#6C757D',
  ripple: '#6C8CFF1A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const getActualMode = useCallback((): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const getColors = useCallback((): ThemeColors => {
    const actualMode = getActualMode();
    return actualMode === 'dark' ? darkColors : lightColors;
  }, [getActualMode]);

  const handleSetTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const value = {
    mode,
    colors: getColors(),
    isDark: getActualMode() === 'dark',
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
