import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContextBase';

// Hook to use theme context
export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};
