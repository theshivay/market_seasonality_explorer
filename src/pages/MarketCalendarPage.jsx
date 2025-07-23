import React, { useContext } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem,
  Grid, 
  CssBaseline
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { 
  Settings, 
  Notifications, 
  FileDownload, 
  Help 
} from '@mui/icons-material';
import { AppContext } from '../context/AppContext.jsx';
import Calendar from '../components/Calendar/Calendar.jsx';
import Dashboard from '../components/Dashboard/Dashboard.jsx';
import themes from '../theme/index.jsx';

const MarketCalendarPage = () => {
  const { themeMode } = useContext(AppContext);
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState(null);

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <ThemeProvider theme={themes[themeMode] || themes.default}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Header */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Market Seasonality Explorer
            </Typography>
            
            {/* Header Icons */}
            <IconButton color="inherit" aria-label="notifications">
              <Notifications />
            </IconButton>
            
            <IconButton color="inherit" aria-label="export">
              <FileDownload />
            </IconButton>
            
            <IconButton color="inherit" aria-label="help">
              <Help />
            </IconButton>
            
            <IconButton 
              color="inherit" 
              aria-label="settings"
              onClick={handleSettingsClick}
            >
              <Settings />
            </IconButton>
            
            <Menu
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
            >
              <MenuItem onClick={handleSettingsClose}>Preferences</MenuItem>
              <MenuItem onClick={handleSettingsClose}>Display Settings</MenuItem>
              <MenuItem onClick={handleSettingsClose}>Alert Settings</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Calendar />
            </Grid>
          </Grid>
        </Container>
        
        {/* Dashboard Panel (shown as drawer) */}
        <Dashboard />
        
        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: 2, 
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.grey[100] 
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              Market Seasonality Explorer &copy; {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MarketCalendarPage;
