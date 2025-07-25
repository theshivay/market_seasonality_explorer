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
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { Settings, Menu as MenuIcon, Api, Storage } from '@mui/icons-material';
import { AppContext } from '../context/AppContext';
import Calendar from '../components/Calendar/Calendar';
import Dashboard from '../components/Dashboard/Dashboard';
import moment from 'moment';
import marketDataService from '../services/marketDataService';

const MarketCalendarPage = () => {
  const { 
    currentDate, 
    selectedInstrument, 
    setSelectedInstrument,
    viewMode,
    setViewMode,
    selectedDays,
    INSTRUMENTS
  } = useContext(AppContext);

  // Dashboard state
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Handle day selection for dashboard
  const handleDaySelect = (day) => {
    setSelectedDate(day);
    setShowDashboard(true);
  };

  // Data source toggle - now using context
  const { useRealData, setUseRealData } = useContext(AppContext);
  
  // Toggle data source between real API data and mock data
  const handleToggleDataSource = () => {
    const newValue = !useRealData;
    setUseRealData(newValue);
    marketDataService.toggleDataSource(newValue);
  };
  
  // Using instruments from AppContext
  return (
    <Box 
      className="min-h-screen"
      sx={{
        background: 'linear-gradient(145deg, rgba(240, 244, 248, 1) 0%, rgba(220, 230, 240, 1) 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <AppBar 
        position="static" 
        className="bg-primary-dark shadow-lg"
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'linear-gradient(to right, #1A365D, #2E5077)'
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
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              className="hover:bg-primary-light hover:bg-opacity-20 transition-all"
              sx={{ 
                borderRadius: '8px',
                mr: 1.5,
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              className="font-bold tracking-wide"
              sx={{ 
                textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.5px',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Market Seasonality Explorer
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: 1.5,
              justifyContent: { xs: 'center', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Tooltip title={useRealData ? "Using API Data" : "Using Mock Data"}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useRealData}
                    onChange={handleToggleDataSource}
                    color="default"
                    icon={<Storage />}
                    checkedIcon={<Api />}
                    size="small"
                    sx={{
                      '& .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: '500',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {useRealData ? "API Data" : "Mock Data"}
                  </Typography>
                }
                sx={{ mr: { xs: 0, md: 2 } }}
              />
            </Tooltip>
            <FormControl 
              size="small" 
              variant="outlined" 
              sx={{ 
                minWidth: { xs: '100px', sm: '120px' },
                flexShrink: 1
              }}
            >
              <InputLabel id="instrument-select-label" 
                sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Instrument
              </InputLabel>
              <Select
                labelId="instrument-select-label"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                label="Instrument"
                sx={{
                  backgroundColor: 'rgba(46, 80, 119, 0.8)',
                  color: 'white',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                {INSTRUMENTS.map(instrument => (
                  <MenuItem key={instrument.id} value={instrument}>
                    {instrument.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl 
              size="small" 
              variant="outlined" 
              sx={{ 
                minWidth: { xs: '100px', sm: '120px' },
                flexShrink: 1
              }}
            >
              <InputLabel id="view-mode-select-label" 
                sx={{ color: 'rgba(255,255,255,0.85)' }}>
                View
              </InputLabel>
              <Select
                labelId="view-mode-select-label"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                label="View"
                sx={{
                  backgroundColor: 'rgba(46, 80, 119, 0.8)',
                  color: 'white',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="calendar">Calendar</MenuItem>
                <MenuItem value="heatmap">Heat Map</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Settings">
              <IconButton 
                color="inherit" 
                className="hover:bg-primary-light hover:bg-opacity-20 transition-all"
                sx={{ 
                  borderRadius: '6px',
                }}
              >
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 4, md: 6 },
          px: { xs: 1.5, sm: 3, md: 3 }
        }}
      >
        <Paper 
          elevation={0} 
          className="overflow-hidden rounded-xl shadow-md"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3, md: 6 } }}>
            <Typography 
              variant="h5" 
              className="font-semibold"
              sx={{
                mb: { xs: 2, sm: 4, md: 6 },
                borderBottom: '2px solid rgba(46, 80, 119, 0.2)',
                paddingBottom: '0.75rem',
                color: '#1A365D',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {currentDate.format('MMMM YYYY')} - {selectedInstrument.name || selectedInstrument.id} Market Calendar
            </Typography>
            <Calendar onDaySelect={handleDaySelect} />
          </Box>
        </Paper>
        
        {/* Selected days summary */}
        {selectedDays.length > 0 && (
          <Paper 
            elevation={0}
            sx={{
              mt: { xs: 2, sm: 4, md: 6 },
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: '12px', sm: '16px' },
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography 
              variant="subtitle1"
              sx={{
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                color: '#1A365D',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                '&::before': {
                  content: '""',
                  display: { xs: 'none', sm: 'inline-block' },
                  width: '6px',
                  height: '18px',
                  backgroundColor: '#2E5077',
                  marginRight: '10px',
                  borderRadius: '3px',
                },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              Selected Days: {selectedDays.length}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 1.5, md: 2 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              {selectedDays.map(dateStr => (
                <Box 
                  key={dateStr}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    bgcolor: 'rgba(224, 242, 254, 0.8)', // tailwind bg-blue-50 equivalent
                    color: '#1A365D', // primary-dark
                    borderRadius: '6px',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    border: '1px solid rgba(46, 80, 119, 0.2)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 80, 119, 0.1)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  onClick={() => handleDaySelect(moment(dateStr))}
                >
                  {moment(dateStr).format('MMM D')}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Container>
      
      {/* Market Data Dashboard */}
      <Dashboard 
        open={showDashboard} 
        onClose={() => setShowDashboard(false)}
        selectedDate={selectedDate}
        instrument={selectedInstrument}
        useRealData={useRealData}
      />
    </Box>
  );
};

export default MarketCalendarPage;
