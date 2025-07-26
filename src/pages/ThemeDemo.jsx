import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Palette,
  LightMode,
  DarkMode,
  Accessibility,
  Contrast,
  Business,
  Visibility,
  CheckCircle,
  Star,
  ColorLens
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeSelector } from '../context/ThemeContext.jsx';
import { useCustomTheme } from '../hooks/useCustomTheme';

const ThemeDemo = () => {
  const { currentTheme, getThemeInfo, availableThemes } = useCustomTheme();
  const themeInfo = getThemeInfo();

  const themeFeatures = {
    default: {
      icon: <LightMode color="primary" />,
      description: 'Clean and modern light theme optimized for daytime use',
      features: ['High readability', 'Professional appearance', 'Comfortable for long sessions'],
      bestFor: 'General use, business environments'
    },
    dark: {
      icon: <DarkMode color="primary" />,
      description: 'Dark theme that reduces eye strain in low-light conditions',
      features: ['Reduced eye strain', 'Battery saving (OLED)', 'Modern aesthetic'],
      bestFor: 'Night work, low-light environments'
    },
    colorblind: {
      icon: <ColorLens color="primary" />,
      description: 'Designed for users with color vision deficiencies',
      features: ['Deuteranopia/Protanopia friendly', 'High contrast ratios', 'Alternative color patterns'],
      bestFor: 'Users with color vision deficiencies'
    },
    highContrast: {
      icon: <Contrast color="primary" />,
      description: 'Maximum contrast for enhanced accessibility',
      features: ['WCAG AAA compliance', 'Bold borders', 'Clear visual hierarchy'],
      bestFor: 'Vision impairments, accessibility requirements'
    },
    corporate: {
      icon: <Business color="primary" />,
      description: 'Professional theme suitable for corporate environments',
      features: ['Conservative color palette', 'Business-appropriate', 'Trust-inspiring design'],
      bestFor: 'Corporate presentations, client meetings'
    }
  };

  const getCurrentThemeFeatures = () => {
    return themeFeatures[currentTheme] || themeFeatures.default;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🎨 Theme Gallery
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Explore our collection of accessible and beautiful color themes
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            color="primary"
          >
            ← Back to Calendar
          </Button>
          <Button
            component={RouterLink}
            to="/export-demo"
            variant="outlined"
            color="primary"
          >
            📤 Export Demo
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Current Theme Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {getCurrentThemeFeatures().icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">Current Theme</Typography>
                  <Chip 
                    label={themeInfo.currentName} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>
                {getCurrentThemeFeatures().description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Key Features:
              </Typography>
              <List dense>
                {getCurrentThemeFeatures().features.map((feature, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Best for:</strong> {getCurrentThemeFeatures().bestFor}
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Selector */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              🎯 Theme Selection
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <ThemeSelector variant="dropdown" size="medium" showLabel={true} />
              <ThemeSelector variant="menu" size="medium" />
              <ThemeSelector variant="toggle" size="medium" />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Try different theme selector variants above. Your preference is automatically saved.
            </Typography>
          </Paper>

          {/* All Themes Overview */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              🌈 Available Themes
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(availableThemes).map(([key, name]) => {
                const features = themeFeatures[key];
                const isActive = currentTheme === key;
                
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card 
                      variant={isActive ? "elevation" : "outlined"}
                      sx={{ 
                        height: '100%',
                        border: isActive ? 2 : 1,
                        borderColor: isActive ? 'primary.main' : 'divider',
                        position: 'relative'
                      }}
                    >
                      {isActive && (
                        <Chip
                          icon={<Star />}
                          label="Active"
                          color="primary"
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            zIndex: 1
                          }}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {features.icon}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {features.description}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          Best for: {features.bestFor}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Accessibility Features */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          ♿ Accessibility Features
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Visibility color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="WCAG 2.1 Compliance"
                  secondary="All themes meet accessibility standards"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Contrast color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="High Contrast Options"
                  secondary="Enhanced visibility for low vision users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ColorLens color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Colorblind Friendly"
                  secondary="Designed for color vision deficiencies"
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Automatic Theme Persistence
              </Typography>
              Your theme choice is saved locally and restored on next visit.
            </Alert>
            
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                System Preference Detection
              </Typography>
              The app can detect and respect your system's dark mode preference.
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Theme Usage Instructions */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          📋 How to Use Themes
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              1. Select Theme
            </Typography>
            <Typography variant="body2">
              Use the theme selector in the top toolbar or visit this page to choose your preferred theme.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              2. Automatic Saving
            </Typography>
            <Typography variant="body2">
              Your theme preference is automatically saved and will be restored when you return to the app.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              3. Real-time Updates
            </Typography>
            <Typography variant="body2">
              Theme changes apply immediately across all pages and components without requiring a refresh.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ThemeDemo;
