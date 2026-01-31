import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#0d6efd',
  text: '#212529',
  textSecondary: '#495057',
  border: '#e9ecef',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#4285f4',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#333333',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  const isDark = getEffectiveTheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    // In a real app, you'd use AsyncStorage for React Native
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newMode);
    }
  };

  useEffect(() => {
    // Load saved theme on mount
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme') as ThemeMode;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setMode(saved);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
