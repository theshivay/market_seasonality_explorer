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
import FinanceChatbot from '../components/FinanceChatbot';
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
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Modern AppBar/Header - Professional and responsive */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderRadius: { xs: 0, sm: 2 },
          mt: { xs: 0, sm: 2 },
          mx: { xs: 0, sm: 2 },
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0D1B2A 0%, #1B2632 50%, #2E5077 100%)'
            : 'linear-gradient(135deg, #1A365D 0%, #2E5077 50%, #4A90A4 100%)',
          color: theme.palette.primary.contrastText,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            py: { xs: 2, sm: 1.5, md: 2 },
            px: { xs: 2, sm: 3, md: 4 },
            gap: { xs: 2, md: 3 },
            minHeight: { xs: 'auto', md: 80 },
          }}
        >
          {/* Left Section - Title and Compare Button */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 3 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              📊 Market Calendar
            </Typography>
            
            <Button
              onClick={() => setComparisonDialogOpen(true)}
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<CompareArrows />}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.4)',
                color: theme.palette.primary.contrastText,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Compare Periods
            </Button>
          </Box>

          {/* Right Section - Controls */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1.5, md: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}
          >
            <Box sx={{ minWidth: { xs: '200px', sm: '240px' } }}>
              <EnhancedInstrumentSelector
                instruments={INSTRUMENTS}
                selectedInstrument={selectedInstrument}
                onInstrumentChange={setSelectedInstrument}
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: theme.palette.primary.contrastText,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: theme.palette.primary.contrastText,
                  },
                }}
              />
            </Box>
            
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
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
              }
              label={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.primary.contrastText,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500,
                  }}
                >
                  {useRealData ? 'Live Data' : 'Demo Data'}
                </Typography>
              }
            />
            
            <ThemeSelector variant="menu" size="large" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Professional container */}
      <Box
        sx={{
          flex: 1,
          mx: { xs: 0, sm: 2 },
          mt: { xs: 2, sm: 3 },
          mb: { xs: 1, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #101C2C 0%, #1B2632 50%, #0D1B2A 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Professional Tabs */}
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            px: { xs: 1, sm: 2, md: 3 },
            pt: { xs: 1, sm: 2 },
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            aria-label="main content tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: { xs: 48, sm: 56 },
                padding: { xs: '6px 12px', sm: '12px 16px' },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            }}
          >
            <Tab
              icon={<CalendarToday fontSize="small" />}
              label="Market Calendar"
              iconPosition="start"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
          </Tabs>
        </Box>

        {/* Tab Content with proper spacing */}
        <Box 
          sx={{ 
            flex: 1,
            p: { xs: 1, sm: 2, md: 3 },
            overflow: 'auto',
          }}
        >
          {currentTab === 0 && (
            <Calendar onDaySelect={handleDaySelect} onDateRangeSelect={handleDateRangeSelect} />
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

        {/* Finance Chatbot */}
        <FinanceChatbot />
      </Box>
    </Box>
  );
  
  // ...existing code...
};

export default MarketCalendarPage;
