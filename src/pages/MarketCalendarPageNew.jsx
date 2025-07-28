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
  const [currentTab, setCurrentTab] = useState(0); // 0 = Calendar, 1 = Real-time Data, 2 = Implementation Summary, 3 = Alert System
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  // Add dateRange state for Dashboard
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  
  const context = useContext(AppContext);
  if (!context) return null;
  const {
    INSTRUMENTS,
    selectedInstrument,
    setSelectedInstrument,
    useRealData,
    setUseRealData
  } = context;
  // Handle day selection for dashboard
  const handleDaySelect = (day, dayData) => {
    setSelectedDate(day);
    setSelectedDateData(dayData);
    setShowDashboard(true);
  };

  // Handle date range selection (for future dashboard features)
  const handleDateRangeSelect = (startDate, endDate, action) => {
    setDateRange({ start: startDate, end: endDate });
    if (action === 'analyze') {
      setShowDashboard(true);
    }
  };
  // Toggle between OKX API data and minimal data
  const handleToggleDataSource = () => {
    const newValue = !useRealData;
    setUseRealData(newValue);
    marketDataService.toggleDataSource(newValue);
    console.log(`Data source switched to ${newValue ? 'CoinGecko API' : 'demo data'}`);
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', flexDirection: 'column', alignItems: 'center', py: { xs: 1, md: 3 } }}>
      {/* Modern AppBar/Header */}
      <AppBar
        position="static"
        sx={{
          borderRadius: 3,
          mt: 2,
          width: { xs: '98vw', sm: '96vw', md: '90vw' },
          mx: 'auto',
          backgroundImage: theme.palette.mode === 'dark'
          ? 'linear-gradient(to right, #0D1B2A, #1B2632)'
          : 'linear-gradient(to right, #1A365D, #2E5077)',
          color: theme.palette.primary.contrastText,
          boxShadow: 3,
        }}
        >
        <Toolbar
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 1 },
            gap: { xs: 2, sm: 0 },
            width: '100%',
          }}
          >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              📊 Market Calendar
            </Typography>
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
            <EnhancedInstrumentSelector
              instruments={INSTRUMENTS}
              selectedInstrument={selectedInstrument}
              onInstrumentChange={setSelectedInstrument}
              variant="outlined"
              size="small"
              fullWidth
              />
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
            <ThemeSelector variant="menu" size="large" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
          mb: 4,
          px: { xs: 0.5, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 },
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #101C2C 0%, #1B2632 100%)'
          : 'linear-gradient(135deg, #F5F7FA 0%, #E3ECF7 100%)',
          boxShadow: 2,
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        >
        {/* Main Content Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, mb: 3, width: '100%' }}>
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
              },
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
        <Box sx={{ width: '100%', mt: 2 }}>
          {currentTab === 0 && (
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={10} lg={9}>
                <Calendar onDaySelect={handleDaySelect} onDateRangeSelect={handleDateRangeSelect} />
              </Grid>
            </Grid>
          )}
          {currentTab === 1 && (
            <RealTimeDataDashboard
            selectedInstrument={selectedInstrument}
            onToggleRealTime={(enabled) => {
              setUseRealData(enabled);
              marketDataService.toggleDataSource(enabled);
            }}
            />
          )}
          {currentTab === 2 && <ImplementationSummary />}
          {currentTab === 3 && <AlertSystem />}
        </Box>

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
  
  // ...existing code...
};

export default MarketCalendarPage;
