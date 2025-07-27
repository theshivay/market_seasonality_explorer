import React, { useContext, useState } from 'react';
import { 
  Box, 
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Button,
  Alert,
  Grid,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { 
  Settings, 
  Api, 
  Storage, 
  Keyboard, 
  Speed, 
  CalendarToday, 
  CheckCircle, 
  CompareArrows,
  NotificationsActive
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ThemeSelector } from '../context/ThemeContext.jsx';
import Calendar from '../components/Calendar/Calendar';
import Dashboard from '../components/Dashboard/DashboardSimple';
import RealTimeDataDashboard from '../components/RealTimeDataDashboard';
import EnhancedInstrumentSelector from '../components/EnhancedInstrumentSelector';
import ImplementationSummary from '../components/ImplementationSummary';
import ExportButton from '../components/ExportButton';
import DataComparison from '../components/DataComparison';
import AlertSystem from '../components/AlertSystem';
import marketDataService from '../services/marketDataService';

const MarketCalendarPage = () => {
  const theme = useTheme();
  
  // State for dashboard and settings
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // 0 = Calendar, 1 = Real-time Data, 2 = Implementation Summary, 3 = Alert System
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  
  // Filter states (currently unused but reserved for future features)
  // eslint-disable-next-line no-unused-vars
  const [selectedMetrics, setSelectedMetrics] = useState(['volatility', 'volume', 'performance']);
  // eslint-disable-next-line no-unused-vars  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  // eslint-disable-next-line no-unused-vars
  const [showVolatilityHeatmap, setShowVolatilityHeatmap] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [showLiquidityIndicators, setShowLiquidityIndicators] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  
  // Date range selection state
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  const context = useContext(AppContext);
  
  if (!context) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h4">
            Error: App Context not available
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            The application context could not be loaded. Please refresh the page.
          </Typography>
        </Alert>
      </Container>
    );
  }
  
  const { 
    currentDate, 
    selectedInstrument, 
    setSelectedInstrument,
    INSTRUMENTS,
    useRealData, 
    setUseRealData
  } = context;

  // Handle day selection for dashboard
  const handleDaySelect = (day, dayData) => {
    console.log('Day selected:', day.format('YYYY-MM-DD'), dayData);
    setSelectedDate(day);
    setSelectedDateData(dayData);
    setShowDashboard(true);
  };

  // Handle date range selection (currently unused but reserved for future features)
  // eslint-disable-next-line no-unused-vars
  const handleDateRangeSelect = (startDate, endDate, action) => {
    console.log('Date range selected:', { startDate, endDate, action });
    setDateRange({ start: startDate, end: endDate });
    
    if (action === 'analyze') {
      // Open dashboard with range analysis
      setShowDashboard(true);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDateRangeClear = () => {
    setDateRange({ start: null, end: null });
  };

  // Toggle between OKX API data and minimal data
  const handleToggleDataSource = () => {
    const newValue = !useRealData;
    setUseRealData(newValue);
    marketDataService.toggleDataSource(newValue);
    console.log(`Data source switched to ${newValue ? 'CoinGecko API' : 'demo data'}`);
  };

  // Handle settings menu
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <AppBar 
        position="static" 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, #0D1B2A, #1B2632)' 
            : 'linear-gradient(to right, #1A365D, #2E5077)',
          color: theme.palette.primary.contrastText
        }}
      >
        <Toolbar 
          sx={{ 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 1 },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              📊 Market Calendar
            </Typography>
            
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              size="small"
              sx={{ ml: 2, color: theme.palette.primary.contrastText }}
            >
              ← Home
            </Button>
            
            <Button
              component={RouterLink}
              to="/export-demo"
              color="inherit"
              size="small"
              variant="outlined"
              sx={{ 
                ml: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              📤 Export Demo
            </Button>
            
            <Button
              component={RouterLink}
              to="/theme-demo"
              color="inherit"
              size="small"
              variant="outlined"
              sx={{ 
                ml: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              🎨 Themes
            </Button>

            <Button
              onClick={() => setComparisonDialogOpen(true)}
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<CompareArrows />}
              sx={{ 
                ml: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Compare Periods
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Enhanced Instrument Selector */}
            <EnhancedInstrumentSelector
              instruments={INSTRUMENTS}
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
              variant="outlined"
              size="small"
              fullWidth
            />

            {/* Data Source Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={useRealData}
                  onChange={handleToggleDataSource}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4CAF50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4CAF50',
                    },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: theme.palette.primary.contrastText }}>
                  {useRealData ? 'Live Data' : 'Demo Data'}
                </Typography>
              }
            />

            {/* Debug Button */}
            <Button
              onClick={() => {
                console.log('🔄 Forcing data refresh...');
                console.log('📊 Current settings:', { useRealData, instrument: selectedInstrument?.id });
                // Force component re-render by toggling data source
                setUseRealData(prev => {
                  const newVal = !prev;
                  marketDataService.toggleDataSource(newVal);
                  setTimeout(() => {
                    setUseRealData(!newVal);
                    marketDataService.toggleDataSource(!newVal);
                  }, 100);
                  return prev;
                });
              }}
              variant="outlined"
              size="small"
              sx={{ 
                color: theme.palette.primary.contrastText,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              🔄 Debug
            </Button>

            {/* Export Button */}
            <ExportButton 
              calendarElement={document.querySelector('.calendar-container')}
              calendarData={[]} // Will be populated when calendar renders
              variant="button"
              size="small"
            />

            {/* Theme Selector */}
            <ThemeSelector 
              variant="menu"
              size="large"
            />

            {/* Settings Menu */}
            <Tooltip title="Settings">
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleSettingsClick}
              >
                <Settings />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
            >
              <MenuItem component={RouterLink} to="/api-test" onClick={handleSettingsClose}>
                <Api sx={{ mr: 1 }} /> API Test
              </MenuItem>
              <MenuItem onClick={handleSettingsClose}>
                <Storage sx={{ mr: 1 }} /> Export Data
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.background.default
        }}
      >
        {/* Header with Current Date and Instrument Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
            Market Seasonality Explorer
          </Typography>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
            {currentDate.format('MMMM YYYY')} • {selectedInstrument?.name} • {useRealData ? 'Live Enhanced Data' : 'Demo Data'}
          </Typography>
          
          {/* Data Source Status Alert */}
          <Alert 
            severity={useRealData ? "success" : "info"} 
            sx={{ 
              mt: 2, 
              mb: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? (useRealData ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)')
                : undefined,
              color: theme.palette.text.primary,
              '& .MuiAlert-icon': {
                color: useRealData ? theme.palette.success.main : theme.palette.info.main
              }
            }}
          >
            <Typography variant="body2">
              <strong>Data Source:</strong> {useRealData ? 'Enhanced API (Multi-Asset Real Market Data)' : 'Demo Data (Static Values)'}
              {useRealData && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  📊 Fetching live data for crypto, stocks, forex, commodities, and indices
                </Typography>
              )}
            </Typography>
          </Alert>
        </Box>

        {/* Main Content Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(event, newValue) => setCurrentTab(newValue)}
            aria-label="main content tabs"
            sx={{
              '& .MuiTab-root': {
                color: theme.palette.text.primary,
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              }
            }}
          >
            <Tab 
              icon={<CalendarToday />} 
              label="Market Calendar" 
              id="tab-0" 
              aria-controls="tabpanel-0" 
            />
            <Tab 
              icon={<Speed />} 
              label="Real-Time Data" 
              id="tab-1" 
              aria-controls="tabpanel-1" 
            />
            <Tab 
              icon={<CheckCircle />} 
              label="Implementation Summary" 
              id="tab-2" 
              aria-controls="tabpanel-2" 
            />
            <Tab 
              icon={<NotificationsActive />} 
              label="Alert System" 
              id="tab-3" 
              aria-controls="tabpanel-3" 
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Left Column - Controls */}
            <Grid item xs={12} lg={3}>
              {/* Keyboard Navigation Help */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Keyboard sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
                    Keyboard Navigation
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                  Arrow Keys: Navigate dates
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                  Enter: Open dashboard
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Escape: Reset selection
                </Typography>
              </Paper>
            </Grid>

            {/* Right Column - Calendar */}
            <Grid item xs={12} lg={9}>
              <Calendar onDaySelect={handleDaySelect} />
            </Grid>
          </Grid>
        )}

        {/* Real-Time Data Tab */}
        {currentTab === 1 && (
          <RealTimeDataDashboard 
            selectedInstrument={selectedInstrument}
            onToggleRealTime={(enabled) => {
              setUseRealData(enabled);
              marketDataService.toggleDataSource(enabled);
            }}
          />
        )}

        {/* Implementation Summary Tab */}
        {currentTab === 2 && (
          <ImplementationSummary />
        )}

        {/* Alert System Tab */}
        {currentTab === 3 && (
          <AlertSystem />
        )}

        {/* Dashboard Modal/Drawer */}
        {showDashboard && selectedDate && (
          <Dashboard
            selectedDate={selectedDate}
            selectedDateData={selectedDateData}
            instrument={selectedInstrument}
            open={showDashboard}
            onClose={() => setShowDashboard(false)}
            useRealData={useRealData}
            dateRange={dateRange}
          />
        )}

        {/* Data Comparison Dialog */}
        <DataComparison
          open={comparisonDialogOpen}
          onClose={() => setComparisonDialogOpen(false)}
        />
      </Container>
    </Box>
  );
};

export default MarketCalendarPage;
