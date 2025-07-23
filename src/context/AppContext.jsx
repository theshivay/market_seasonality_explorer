import React, { createContext, useState, useEffect, useCallback } from 'react';
import moment from 'moment';

// Create context
export const AppContext = createContext();

// Available financial instruments
const INSTRUMENTS = [
  { id: 'BTC-USD', name: 'Bitcoin (BTC/USD)' },
  { id: 'ETH-USD', name: 'Ethereum (ETH/USD)' },
  { id: 'SOL-USD', name: 'Solana (SOL/USD)' },
  { id: 'AAPL', name: 'Apple Inc. (AAPL)' },
  { id: 'MSFT', name: 'Microsoft (MSFT)' },
  { id: 'GOOGL', name: 'Google (GOOGL)' },
];

// View modes
const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

export const AppContextProvider = ({ children }) => {
  // Date state
  const [currentDate, setCurrentDate] = useState(moment());
  
  // View mode (day/week/month)
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  
  // Selected instrument
  const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENTS[0]);
  
  // Selected days for multi-selection mode
  const [selectedDays, setSelectedDays] = useState([]);
  
  // Selected time range
  const [timeRange, setTimeRange] = useState({
    start: moment().subtract(30, 'days'),
    end: moment(),
  });

  // Color theme
  const [colorTheme, setColorTheme] = useState('default'); // default, contrast, colorblind

  // Navigation functions
  const nextMonth = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).add(1, 'month'));
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).subtract(1, 'month'));
  }, []);

  const nextWeek = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).add(1, 'week'));
  }, []);

  const prevWeek = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).subtract(1, 'week'));
  }, []);

  const nextDay = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).add(1, 'day'));
  }, []);

  const prevDay = useCallback(() => {
    setCurrentDate(prevDate => moment(prevDate).subtract(1, 'day'));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(moment());
  }, []);

  // Date selection
  const selectDate = useCallback((date) => {
    setSelectedDays(prev => {
      const dateStr = moment(date).format('YYYY-MM-DD');
      const isAlreadySelected = prev.some(d => moment(d).format('YYYY-MM-DD') === dateStr);
      
      if (isAlreadySelected) {
        return prev.filter(d => moment(d).format('YYYY-MM-DD') !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedDays([]);
  }, []);

  // For keyboard navigation
  const handleKeyNavigation = useCallback((event) => {
    switch(event.key) {
      case 'ArrowLeft':
        if (viewMode === VIEW_MODES.MONTH) prevMonth();
        else if (viewMode === VIEW_MODES.WEEK) prevWeek();
        else prevDay();
        break;
      case 'ArrowRight':
        if (viewMode === VIEW_MODES.MONTH) nextMonth();
        else if (viewMode === VIEW_MODES.WEEK) nextWeek();
        else nextDay();
        break;
      case 'Escape':
        clearSelection();
        break;
      case 'Enter':
        // Handle date selection
        break;
      default:
        break;
    }
  }, [viewMode, prevMonth, nextMonth, prevWeek, nextWeek, prevDay, nextDay, clearSelection]);

  useEffect(() => {
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyNavigation);
    
    return () => {
      document.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  const contextValue = {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    VIEW_MODES,
    selectedInstrument,
    setSelectedInstrument,
    INSTRUMENTS,
    selectedDays,
    setSelectedDays,
    selectDate,
    clearSelection,
    timeRange,
    setTimeRange,
    nextMonth,
    prevMonth,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    goToToday,
    colorTheme,
    setColorTheme
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
