import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/store';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = storage.getTheme();
    setThemeState(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
