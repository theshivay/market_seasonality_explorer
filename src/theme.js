import { createTheme } from '@mui/material/styles';

// Define color schemes for different themes
const colorSchemes = {
  default: {
    palette: {
      mode: 'light',
      primary: {
        light: '#5A7CA5',
        main: '#2E5077',
        dark: '#1A365D',
        contrastText: '#fff',
      },
      secondary: {
        light: '#81C784',
        main: '#4CAF50',
        dark: '#388E3C',
        contrastText: '#fff',
      },
      error: {
        light: '#FED7D7',
        main: '#F56565',
        dark: '#C53030',
        contrastText: '#fff',
      },
      warning: {
        light: '#FEEBC8',
        main: '#ED8936',
        dark: '#C05621',
        contrastText: '#fff',
      },
      info: {
        light: '#BEE3F8',
        main: '#4299E1',
        dark: '#2B6CB0',
        contrastText: '#fff',
      },
      success: {
        light: '#C6F6D5',
        main: '#48BB78',
        dark: '#2F855A',
        contrastText: '#fff',
      },
      background: {
        default: '#F7FAFC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1A202C',
        secondary: '#4A5568',
      },
      custom: {
        calendar: {
          cellBorder: '#E2E8F0',
          weekendBg: '#F8F9FA',
          todayBg: '#EBF8FF',
          selectedBg: '#4299E1',
          volatilityHigh: '#F56565',
          volatilityMedium: '#ED8936',
          volatilityLow: '#48BB78',
        }
      }
    }
  },
  
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        light: '#90CAF9',
        main: '#2196F3',
        dark: '#1565C0',
        contrastText: '#fff',
      },
      secondary: {
        light: '#A5D6A7',
        main: '#4CAF50',
        dark: '#2E7D32',
        contrastText: '#fff',
      },
      error: {
        light: '#EF5350',
        main: '#F44336',
        dark: '#C62828',
        contrastText: '#fff',
      },
      warning: {
        light: '#FFB74D',
        main: '#FF9800',
        dark: '#F57C00',
        contrastText: '#fff',
      },
      info: {
        light: '#64B5F6',
        main: '#2196F3',
        dark: '#1976D2',
        contrastText: '#fff',
      },
      success: {
        light: '#81C784',
        main: '#4CAF50',
        dark: '#388E3C',
        contrastText: '#fff',
      },
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      },
      custom: {
        calendar: {
          cellBorder: '#424242',
          weekendBg: '#2C2C2C',
          todayBg: '#1E3A8A',
          selectedBg: '#2196F3',
          volatilityHigh: '#F44336',
          volatilityMedium: '#FF9800',
          volatilityLow: '#4CAF50',
        }
      }
    }
  },
  
  // Colorblind-friendly theme (Deuteranopia/Protanopia)
  colorblind: {
    palette: {
      mode: 'light',
      primary: {
        light: '#7FB3D3',
        main: '#1976D2',
        dark: '#0D47A1',
        contrastText: '#fff',
      },
      secondary: {
        light: '#FFEB3B',
        main: '#FFC107',
        dark: '#FF8F00',
        contrastText: '#000',
      },
      error: {
        light: '#FF8A65',
        main: '#FF5722',
        dark: '#D84315',
        contrastText: '#fff',
      },
      warning: {
        light: '#FFE082',
        main: '#FFC107',
        dark: '#FF8F00',
        contrastText: '#000',
      },
      info: {
        light: '#81D4FA',
        main: '#03A9F4',
        dark: '#0277BD',
        contrastText: '#fff',
      },
      success: {
        light: '#FFEB3B',
        main: '#CDDC39',
        dark: '#827717',
        contrastText: '#000',
      },
      background: {
        default: '#FAFAFA',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
      custom: {
        calendar: {
          cellBorder: '#BDBDBD',
          weekendBg: '#F5F5F5',
          todayBg: '#E3F2FD',
          selectedBg: '#1976D2',
          volatilityHigh: '#FF5722',  // Orange instead of red
          volatilityMedium: '#FFC107', // Yellow
          volatilityLow: '#1976D2',   // Blue instead of green
        }
      }
    }
  },
  
  // High contrast theme for accessibility
  highContrast: {
    palette: {
      mode: 'light',
      primary: {
        light: '#666666',
        main: '#000000',
        dark: '#000000',
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#CCCCCC',
        main: '#666666',
        dark: '#333333',
        contrastText: '#FFFFFF',
      },
      error: {
        light: '#FF6666',
        main: '#CC0000',
        dark: '#990000',
        contrastText: '#FFFFFF',
      },
      warning: {
        light: '#FFCC66',
        main: '#FF9900',
        dark: '#CC7700',
        contrastText: '#000000',
      },
      info: {
        light: '#6666FF',
        main: '#0000CC',
        dark: '#000099',
        contrastText: '#FFFFFF',
      },
      success: {
        light: '#66CC66',
        main: '#009900',
        dark: '#006600',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#000000',
        secondary: '#333333',
      },
      custom: {
        calendar: {
          cellBorder: '#000000',
          weekendBg: '#F0F0F0',
          todayBg: '#CCCCCC',
          selectedBg: '#000000',
          volatilityHigh: '#CC0000',
          volatilityMedium: '#FF9900',
          volatilityLow: '#009900',
        }
      }
    }
  },
  
  // Corporate/Professional theme
  corporate: {
    palette: {
      mode: 'light',
      primary: {
        light: '#4A90A4',
        main: '#2C5F7A',
        dark: '#1E3E52',
        contrastText: '#fff',
      },
      secondary: {
        light: '#B8860B',
        main: '#B8860B',
        dark: '#8B6914',
        contrastText: '#fff',
      },
      error: {
        light: '#E57373',
        main: '#D32F2F',
        dark: '#C62828',
        contrastText: '#fff',
      },
      warning: {
        light: '#FFB74D',
        main: '#F57C00',
        dark: '#E65100',
        contrastText: '#fff',
      },
      info: {
        light: '#64B5F6',
        main: '#1976D2',
        dark: '#0D47A1',
        contrastText: '#fff',
      },
      success: {
        light: '#81C784',
        main: '#388E3C',
        dark: '#2E7D32',
        contrastText: '#fff',
      },
      background: {
        default: '#F8F9FA',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#2C5F7A',
        secondary: '#546E7A',
      },
      custom: {
        calendar: {
          cellBorder: '#ECEFF1',
          weekendBg: '#F5F5F5',
          todayBg: '#E8F4FD',
          selectedBg: '#2C5F7A',
          volatilityHigh: '#D32F2F',
          volatilityMedium: '#F57C00',
          volatilityLow: '#388E3C',
        }
      }
    }
  }
};

// Base typography and component configurations
const baseThemeConfig = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
};

// Component overrides that work with all themes
const getComponentOverrides = (theme) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
            : '0 8px 16px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
});

// Create theme function
export const createCustomTheme = (themeMode = 'default') => {
  const colorScheme = colorSchemes[themeMode] || colorSchemes.default;
  
  const theme = createTheme({
    ...baseThemeConfig,
    ...colorScheme,
  });
  
  // Add component overrides
  theme.components = getComponentOverrides(theme);
  
  return theme;
};

// Default theme export (for backward compatibility)
const theme = createCustomTheme('default');

export default theme;

// Export available themes
export const availableThemes = {
  default: 'Default',
  dark: 'Dark Mode',
  colorblind: 'Colorblind Friendly',
  highContrast: 'High Contrast',
  corporate: 'Corporate'
};

export { colorSchemes };
