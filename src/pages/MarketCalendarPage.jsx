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
    <Box className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AppBar position="static" className="bg-primary-dark">
        <Toolbar className="justify-between">
          <Box className="flex items-center">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              className="mr-2"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className="font-bold">
              Market Seasonality Explorer
            </Typography>
          </Box>
          <Box className="flex items-center">
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
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {useRealData ? "API Data" : "Mock Data"}
                  </Typography>
                }
                sx={{ mr: 2 }}
              />
            </Tooltip>
            <FormControl size="small" variant="outlined" className="min-w-[100px] mr-3">
              <InputLabel id="instrument-select-label" className="text-white">Instrument</InputLabel>
              <Select
                labelId="instrument-select-label"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                label="Instrument"
                className="bg-primary-main text-white"
              >
                {INSTRUMENTS.map(instrument => (
                  <MenuItem key={instrument.id} value={instrument}>
                    {instrument.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" variant="outlined" className="min-w-[100px] mr-3">
              <InputLabel id="view-mode-select-label" className="text-white">View</InputLabel>
              <Select
                labelId="view-mode-select-label"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                label="View"
                className="bg-primary-main text-white"
              >
                <MenuItem value="calendar">Calendar</MenuItem>
                <MenuItem value="heatmap">Heat Map</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" className="py-6">
        <Paper elevation={0} className="overflow-hidden rounded-xl shadow-md">
          <Box className="p-6">
            <Typography variant="h5" className="mb-6 font-semibold">
              {currentDate.format('MMMM YYYY')} - {selectedInstrument.name || selectedInstrument.id} Market Calendar
            </Typography>
            <Calendar onDaySelect={handleDaySelect} />
          </Box>
        </Paper>
        
        {/* Selected days summary */}
        {selectedDays.length > 0 && (
          <Paper elevation={0} className="mt-6 p-4 rounded-xl shadow-md">
            <Typography variant="subtitle1" className="mb-2 font-medium">
              Selected Days: {selectedDays.length}
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {selectedDays.map(dateStr => (
                <Box 
                  key={dateStr} 
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
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
