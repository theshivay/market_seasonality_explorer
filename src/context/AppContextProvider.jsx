import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { AppContext } from './AppContext';
import { VIEW_MODES, KEYBOARD_SHORTCUTS } from '../utils/constants';
import { getAllInstruments } from '../services/enhancedApiService';
import theme from '../theme';

// Get all available financial instruments
const INSTRUMENTS = getAllInstruments();

export const AppContextProvider = ({ children }) => {
  // Date state
  const [currentDate, setCurrentDate] = useState(moment());
  
  // View mode (day/week/month)
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  
  // Selected instrument
  const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENTS[0]);
  
  // Selected days for multi-selection mode
  const [selectedDays, setSelectedDays] = useState([]);
  
  // Date range selection state
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Selection mode: 'single', 'multi', 'range'
  const [selectionMode, setSelectionMode] = useState('single');
  
  // Selected time range
  const [timeRange, setTimeRange] = useState({
    start: moment().subtract(30, 'days'),
    end: moment(),
  });

  // Color theme
  const [colorTheme, setColorTheme] = useState('default'); // default, contrast, colorblind
  
  // Data source toggle - set to true to use real API data
  const [useRealData, setUseRealData] = useState(true);

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
    setDateRange({ start: null, end: null });
  }, []);

  // Date range selection functions
  const selectDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
    setSelectedDays([]); // Clear individual selections when range is set
  }, []);

  const updateDateRange = useCallback((newRange) => {
    setDateRange(newRange);
  }, []);

  // Selection mode functions
  const changeSelectionMode = useCallback((mode) => {
    setSelectionMode(mode);
    // Clear selections when changing mode
    setSelectedDays([]);
    setDateRange({ start: null, end: null });
  }, []);

  // Range analysis function
  const analyzeRange = useCallback((analysisData) => {
    console.log('Range analysis requested:', analysisData);
    // This can be extended to trigger specific analysis actions
    return analysisData;
  }, []);

  // For keyboard navigation
  const handleKeyNavigation = useCallback((event) => {
    // Check if the focus is on the calendar container (for individual date navigation)
    const calendarElement = document.querySelector('.calendar-container');
    const isCalendarFocused = calendarElement && (document.activeElement === calendarElement || calendarElement.contains(document.activeElement));
    
    // If calendar is focused, let the calendar handle arrow key navigation for individual dates
    if (isCalendarFocused) {
      return; // Let the calendar component handle the navigation
    }
    
    // Global navigation for when calendar is not focused
    switch(event.key) {
      case KEYBOARD_SHORTCUTS.ARROW_LEFT:
        event.preventDefault();
        if (viewMode === VIEW_MODES.MONTH) prevMonth();
        else if (viewMode === VIEW_MODES.WEEK) prevWeek();
        else prevDay();
        break;
      case KEYBOARD_SHORTCUTS.ARROW_RIGHT:
        event.preventDefault();
        if (viewMode === VIEW_MODES.MONTH) nextMonth();
        else if (viewMode === VIEW_MODES.WEEK) nextWeek();
        else nextDay();
        break;
      case KEYBOARD_SHORTCUTS.ESCAPE:
        clearSelection();
        break;
      case KEYBOARD_SHORTCUTS.ENTER:
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
    dateRange,
    setDateRange,
    selectionMode,
    setSelectionMode,
    selectDateRange,
    updateDateRange,
    changeSelectionMode,
    analyzeRange,
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
    setColorTheme,
    useRealData,
    setUseRealData,
    theme // Add theme to context
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
