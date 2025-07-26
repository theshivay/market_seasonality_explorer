import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createCustomTheme, availableThemes } from '../theme';
import { useCustomTheme } from '../hooks/useCustomTheme';
import { ThemeContext } from './ThemeContextBase';

// Theme Provider Component
export const CustomThemeProvider = ({ children }) => {
  // Load saved theme from localStorage or default to 'default'
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    return savedTheme && availableThemes[savedTheme] ? savedTheme : 'default';
  });

  // Create the current theme object
  const theme = createCustomTheme(currentTheme);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedTheme', currentTheme);
    console.log(`🎨 Theme switched to: ${availableThemes[currentTheme]}`);
  }, [currentTheme]);

  // Theme switching function
  const switchTheme = (themeName) => {
    if (availableThemes[themeName]) {
      setCurrentTheme(themeName);
    } else {
      console.warn(`Theme "${themeName}" not found. Available themes:`, Object.keys(availableThemes));
    }
  };

  // Get theme info
  const getThemeInfo = () => ({
    current: currentTheme,
    currentName: availableThemes[currentTheme],
    available: availableThemes,
    isDark: theme.palette.mode === 'dark'
  });

  // Context value
  const contextValue = {
    theme,
    currentTheme,
    switchTheme,
    getThemeInfo,
    availableThemes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Theme selector component
export const ThemeSelector = ({ 
  variant = 'menu', // 'menu', 'toggle', 'dropdown'
  size = 'medium',
  showLabel = true 
}) => {
  const { currentTheme, switchTheme, availableThemes } = useCustomTheme();

  if (variant === 'menu') {
    return (
      <ThemeSelectorMenu 
        currentTheme={currentTheme}
        switchTheme={switchTheme}
        availableThemes={availableThemes}
        size={size}
      />
    );
  }

  if (variant === 'dropdown') {
    return (
      <ThemeSelectorDropdown 
        currentTheme={currentTheme}
        switchTheme={switchTheme}
        availableThemes={availableThemes}
        size={size}
        showLabel={showLabel}
      />
    );
  }

  return (
    <ThemeSelectorToggle 
      currentTheme={currentTheme}
      switchTheme={switchTheme}
      size={size}
    />
  );
};

// Theme selector components
import {
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Box,
  Typography,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Palette,
  LightMode,
  DarkMode,
  Accessibility,
  Contrast,
  Business,
  ColorLens
} from '@mui/icons-material';

// Get icon for theme
const getThemeIcon = (themeName) => {
  const icons = {
    default: <LightMode />,
    dark: <DarkMode />,
    colorblind: <ColorLens />,
    highContrast: <Contrast />,
    corporate: <Business />
  };
  return icons[themeName] || <Palette />;
};

// Menu variant
const ThemeSelectorMenu = ({ currentTheme, switchTheme, availableThemes, size }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName) => {
    switchTheme(themeName);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change Theme">
        <IconButton
          onClick={handleClick}
          size={size}
          color="inherit"
        >
          {getThemeIcon(currentTheme)}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.entries(availableThemes).map(([key, name]) => (
          <MenuItem
            key={key}
            onClick={() => handleThemeSelect(key)}
            selected={currentTheme === key}
          >
            <ListItemIcon>
              {getThemeIcon(key)}
            </ListItemIcon>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// Dropdown variant
const ThemeSelectorDropdown = ({ currentTheme, switchTheme, availableThemes, size, showLabel }) => {
  return (
    <FormControl size={size} sx={{ minWidth: 120 }}>
      {showLabel && <InputLabel>Theme</InputLabel>}
      <Select
        value={currentTheme}
        onChange={(e) => switchTheme(e.target.value)}
        label={showLabel ? "Theme" : undefined}
        startAdornment={getThemeIcon(currentTheme)}
      >
        {Object.entries(availableThemes).map(([key, name]) => (
          <MenuItem key={key} value={key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getThemeIcon(key)}
              <Typography>{name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Toggle variant (simplified for common themes)
const ThemeSelectorToggle = ({ currentTheme, switchTheme, size }) => {
  const toggleTheme = () => {
    const nextTheme = currentTheme === 'default' ? 'dark' : 'default';
    switchTheme(nextTheme);
  };

  return (
    <Tooltip title={`Switch to ${currentTheme === 'default' ? 'Dark' : 'Light'} Mode`}>
      <IconButton onClick={toggleTheme} size={size} color="inherit">
        {currentTheme === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export default CustomThemeProvider;
