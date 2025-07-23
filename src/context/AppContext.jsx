import React, { createContext, useState, useCallback } from 'react';
import moment from 'moment';

// Create context
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // State for current view mode (daily, weekly, monthly)
  const [viewMode, setViewMode] = useState('daily');
  
  // State for currently selected date(s)
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  
  // State for financial instrument selection
  const [selectedInstrument, setSelectedInstrument] = useState('BTCUSDT');
  
  // State for theme selection
  const [themeMode, setThemeMode] = useState('default');
  
  // State for market data
  const [marketData, setMarketData] = useState({
    isLoading: false,
    data: null,
    error: null,
  });
  
  // State for whether details panel is open
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // State for alerts/thresholds
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({
    volatility: {
      low: 0.5,  // Below 0.5% is low volatility
      high: 2.0, // Above 2.0% is high volatility
    },
    performance: {
      good: 1.0,  // Above 1.0% is good performance
      bad: -1.0,  // Below -1.0% is bad performance
    }
  });
  
  // Function to toggle view mode
  const toggleViewMode = (mode) => {
    if (['daily', 'weekly', 'monthly'].includes(mode)) {
      setViewMode(mode);
    }
  };
  
  // Function to select date
  const selectDate = (date) => {
    setSelectedDate(moment(date));
  };
  
  // Function to select date range
  const selectDateRange = (startDate, endDate) => {
    setSelectedDateRange([
      startDate ? moment(startDate) : null,
      endDate ? moment(endDate) : null
    ]);
  };
  
  // Function to toggle details panel
  const toggleDetailsPanel = useCallback(() => {
    setDetailsOpen(prevState => !prevState);
  }, []);
  
  // Function to change financial instrument
  const changeInstrument = (instrument) => {
    setSelectedInstrument(instrument);
  };
  
  // Function to change theme
  const changeTheme = (theme) => {
    if (['default', 'highContrast', 'colorblindFriendly'].includes(theme)) {
      setThemeMode(theme);
    }
  };
  
  // Function to add alert
  const addAlert = (alert) => {
    setAlerts(prev => [...prev, { ...alert, id: Date.now() }]);
  };
  
  // Function to remove alert
  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };
  
  // Function to update thresholds
  const updateThresholds = (newThresholds) => {
    setThresholds(prev => ({
      ...prev,
      ...newThresholds
    }));
  };
  
  // Provide context value to children
  const contextValue = {
    viewMode,
    toggleViewMode,
    selectedDate,
    selectDate,
    selectedDateRange,
    selectDateRange,
    selectedInstrument,
    changeInstrument,
    themeMode,
    changeTheme,
    marketData,
    setMarketData,
    detailsOpen,
    toggleDetailsPanel,
    alerts,
    addAlert,
    removeAlert,
    thresholds,
    updateThresholds,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
