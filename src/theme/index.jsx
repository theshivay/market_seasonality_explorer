import { createTheme } from '@mui/material/styles';

// Define color schemes
const defaultTheme = {
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    volatility: {
      low: '#4caf50',      // Green
      medium: '#ff9800',   // Orange/Yellow
      high: '#f44336',     // Red
    },
    performance: {
      positive: '#4caf50', // Green
      neutral: '#9e9e9e',  // Gray
      negative: '#f44336', // Red
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
};

// High contrast theme for accessibility
const highContrastTheme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#dddddd',
    },
    volatility: {
      low: '#00aa00',
      medium: '#aa6600',
      high: '#cc0000',
    },
    performance: {
      positive: '#00aa00',
      neutral: '#666666',
      negative: '#cc0000',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#dddddd',
    },
  },
};

// Colorblind-friendly theme
const colorblindFriendlyTheme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    volatility: {
      low: '#0072B2',      // Blue
      medium: '#E69F00',   // Orange
      high: '#CC79A7',     // Pink/Purple
    },
    performance: {
      positive: '#009E73',  // Green (colorblind-friendly)
      neutral: '#999999',   // Gray
      negative: '#D55E00',  // Red/Orange (colorblind-friendly)
    },
  },
};

// Create theme objects
const themes = {
  default: createTheme(defaultTheme),
  highContrast: createTheme(highContrastTheme),
  colorblindFriendly: createTheme(colorblindFriendlyTheme),
};

export default themes;
