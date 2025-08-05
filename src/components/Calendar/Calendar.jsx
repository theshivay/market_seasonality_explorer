import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box,
  Grid, 
  Paper,
  Typography,
  IconButton,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight,
  Today,
  ZoomIn,
  ZoomOut,
  CalendarViewMonth,
  CalendarViewWeek,
  CalendarViewDay,
  ExpandMore
} from '@mui/icons-material';
import moment from 'moment';
import { AppContext } from '../../context/AppContext';
import CalendarHeader from './CalendarHeader';
import CalendarCell from './CalendarCell';
import WeeklyCalendarCell from './WeeklyCalendarCell';
import DateRangeSelector from './DateRangeSelector';
import ExportButton from '../ExportButton';
import { getCalendarDaysForMonth } from '../../utils/dateUtils';
import { getTodayString } from '../../utils/dateUtils';
import useMarketData from '../../hooks/useMarketData';

const Calendar = ({ onDaySelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const calendarRef = useRef(null);
  
  console.log('Calendar component rendering...', { theme: !!theme, isMobile });
  
  const { 
    currentDate, 
    nextMonth, 
    prevMonth,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    goToToday,
    selectedInstrument,
    viewMode,
    setViewMode,
    VIEW_MODES,
    useRealData, // Get useRealData from context
    selectedDays,
    selectDate,
    dateRange,
    selectionMode,
    selectDateRange
  } = useContext(AppContext);
  
  console.log('Calendar context loaded:', { 
    currentDate: currentDate?.format('YYYY-MM-DD'), 
    instrument: selectedInstrument?.id, 
    viewMode, 
    VIEW_MODES 
  });
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedDateForKeyboard, setSelectedDateForKeyboard] = useState(currentDate);
  const [rangeSelectStart, setRangeSelectStart] = useState(null);
  const [isRangeSelecting, setIsRangeSelecting] = useState(false);

  // Enhanced day click handler for different selection modes
  const handleDayClick = useCallback((clickedDay, dayData) => {
    setSelectedDateForKeyboard(clickedDay);
    
    const isFutureDate = clickedDay.isAfter(moment(), 'day');
    if (isFutureDate) {
      return; // Don't allow selection of future dates
    }
    
    switch (selectionMode) {
      case 'single':
        // Standard single date selection - just open dashboard
        onDaySelect && onDaySelect(clickedDay, dayData);
        break;
        
      case 'multi':
        // Multi-date selection
        selectDate(clickedDay);
        break;
        
      case 'range':
        // Range selection
        if (!isRangeSelecting) {
          // Start range selection
          setRangeSelectStart(clickedDay);
          setIsRangeSelecting(true);
        } else {
          // Complete range selection
          const start = rangeSelectStart;
          const end = clickedDay;
          
          // Ensure start is before end
          const sortedStart = start.isBefore(end) ? start : end;
          const sortedEnd = start.isBefore(end) ? end : start;
          
          selectDateRange(sortedStart, sortedEnd);
          setRangeSelectStart(null);
          setIsRangeSelecting(false);
        }
        break;
        
      default:
        onDaySelect && onDaySelect(clickedDay, dayData);
    }
  }, [selectionMode, selectDate, selectDateRange, rangeSelectStart, isRangeSelecting, onDaySelect]);

  // Helper function to check if a day is selected
  const isDaySelected = useCallback((day) => {
    if (!day) return false;
    
    const dayStr = day.format('YYYY-MM-DD');
    
    // Check if day is in selectedDays array
    if (selectedDays.some(d => moment(d).format('YYYY-MM-DD') === dayStr)) {
      return true;
    }
    
    // Check if day is in date range
    if (dateRange.start && dateRange.end) {
      return day.isBetween(dateRange.start, dateRange.end, 'day', '[]');
    }
    
    // Check if day is range selection start
    if (rangeSelectStart && day.isSame(rangeSelectStart, 'day')) {
      return true;
    }
    
    return false;
  }, [selectedDays, dateRange, rangeSelectStart]);

  // Helper function to check if a day is in range preview
  const isDayInRangePreview = useCallback((day) => {
    if (!isRangeSelecting || !rangeSelectStart || !day) return false;
    
    const start = rangeSelectStart.isBefore(day) ? rangeSelectStart : day;
    const end = rangeSelectStart.isBefore(day) ? day : rangeSelectStart;
    
    return day.isBetween(start, end, 'day', '[]');
  }, [isRangeSelecting, rangeSelectStart]);

  // Use the hook to fetch market data with view mode
  const { data: marketData, loading } = useMarketData(currentDate, selectedInstrument, viewMode);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    if (!selectedDateForKeyboard) return;
    
    let newDate = selectedDateForKeyboard.clone();
    
    switch(event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newDate = selectedDateForKeyboard.clone().subtract(1, 'week');
        break;
      case 'ArrowDown':
        event.preventDefault();
        newDate = selectedDateForKeyboard.clone().add(1, 'week');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newDate = selectedDateForKeyboard.clone().subtract(1, 'day');
        break;
      case 'ArrowRight':
        event.preventDefault();
        newDate = selectedDateForKeyboard.clone().add(1, 'day');
        break;
      case 'Enter':
        event.preventDefault();
        onDaySelect && onDaySelect(selectedDateForKeyboard, marketData?.[selectedDateForKeyboard.format('YYYY-MM-DD')]);
        return;
      case 'Escape':
        event.preventDefault();
        setSelectedDateForKeyboard(currentDate);
        return;
      case 'Home':
        event.preventDefault();
        newDate = moment().startOf('month');
        break;
      case 'End':
        event.preventDefault();
        newDate = moment().endOf('month');
        break;
      default:
        return;
    }
    
    setSelectedDateForKeyboard(newDate);
  }, [selectedDateForKeyboard, currentDate, onDaySelect, marketData]);

  // Add keyboard event listener
  useEffect(() => {
    const calendarElement = document.querySelector('.calendar-container');
    if (calendarElement) {
      calendarElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        calendarElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  // Enhanced debug: Log the market data we're receiving with more details
  React.useEffect(() => {
    console.log('[Calendar] Market data loaded:', { 
      date: currentDate.format('YYYY-MM-DD'),
      instrument: selectedInstrument?.id,
      dataAvailable: marketData ? Object.keys(marketData).length : 0,
      availableDates: marketData ? Object.keys(marketData) : [],
      loading,
      useRealData
    });
    
    // Check if we have data for today (current date)
    const today = getTodayString();
    if (marketData && marketData[today]) {
      console.log(`[Calendar] Found data for today (${today}):`, marketData[today]);
    } else {
      console.log(`[Calendar] No data for today (${today}) in marketData`);
      
      // Add synthetic data for today if it's missing
      if (marketData && !marketData[today]) {
        console.log(`[Calendar] Adding synthetic data for today (${today}) to calendar`);
        marketData[today] = {
          date: today,
          instrument: { id: selectedInstrument?.id || 'BTC-USDT' },
          open: 109.5,
          high: 119.5,
          low: 107.4,
          close: 115.7,
          volume: 1821655.44,
          volatility: 11.2,
          performance: 3.8,
          liquidity: 1.8,
          isMarketOpen: true,
          dataSource: 'synthetic-calendar',
          technicalIndicators: {
            sma5: 102.5,
            sma20: 98.5,
            rsi: 55
          }
        };
      }
    }
  }, [currentDate, marketData, loading, selectedInstrument, useRealData]);
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 1.8));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode) setViewMode(newMode);
  };

  // Get next/prev handler based on view mode
  const getNextHandler = () => {
    switch(viewMode) {
      case VIEW_MODES.MONTH: return nextMonth;
      case VIEW_MODES.WEEK: return nextWeek;
      case VIEW_MODES.DAY: return nextDay;
      default: return nextMonth;
    }
  };

  const getPrevHandler = () => {
    switch(viewMode) {
      case VIEW_MODES.MONTH: return prevMonth;
      case VIEW_MODES.WEEK: return prevWeek;
      case VIEW_MODES.DAY: return prevDay;
      default: return prevMonth;
    }
  };
  
  // Format the date title based on view mode
  const getDateTitle = () => {
    switch(viewMode) {
      case VIEW_MODES.MONTH:
        return currentDate.format('MMMM YYYY');
      case VIEW_MODES.WEEK: {
        const weekStart = moment(currentDate).startOf('week');
        const weekEnd = moment(currentDate).endOf('week');
        if (weekStart.month() === weekEnd.month()) {
          return `${weekStart.format('MMM D')} - ${weekEnd.format('D, YYYY')}`;
        } else if (weekStart.year() === weekEnd.year()) {
          return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;
        } else {
          return `${weekStart.format('MMM D, YYYY')} - ${weekEnd.format('MMM D, YYYY')}`;
        }
      }
      case VIEW_MODES.DAY:
        return currentDate.format('dddd, MMMM D, YYYY');
      default:
        return currentDate.format('MMMM YYYY');
    }
  };
  
    // Generate calendar days based on view mode
  const generateCalendarDays = () => {
    switch(viewMode) {
      case VIEW_MODES.DAY:
        return [currentDate.clone()];
        
      case VIEW_MODES.WEEK:
        // For week view, generate weeks for the current month
        const weeks = [];
        const startOfMonth = moment(currentDate).startOf('month');
        const endOfMonth = moment(currentDate).endOf('month');
        let currentWeek = moment(startOfMonth).startOf('week');
        
        while (currentWeek.isSameOrBefore(endOfMonth, 'week')) {
          weeks.push(currentWeek.clone());
          currentWeek.add(1, 'week');
        }
        
        return weeks;
        
      case VIEW_MODES.MONTH:
      default:
        return getCalendarDaysForMonth(currentDate);
    }
  };

  const days = generateCalendarDays();

  // Calculate grid columns based on view mode and screen size
  const getGridColumns = () => {
    switch(viewMode) {
      case VIEW_MODES.DAY:
        return 1;
      case VIEW_MODES.WEEK:
        return 1; // Show weeks vertically, one per row
      case VIEW_MODES.MONTH:
      default:
        return 7; // 7 days in a week for month view as well
    }
  };

  // Apply zoom effect to grid with responsive adjustments
  const gridStyle = {
    transform: isMobile ? 'scale(1)' : `scale(${zoomLevel})`,
    transformOrigin: 'top center',
    transition: 'transform 0.3s ease',
    width: isMobile ? '100%' : undefined,
  };

  return (
    <Box 
      ref={calendarRef}
      className="calendar-container"
      tabIndex={0} // Make it focusable
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }
      }}
      onClick={(e) => {
        e.currentTarget.focus();
      }}
    >
      {/* Professional Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            p: { xs: 2, sm: 2.5, md: 3 },
            gap: { xs: 2, lg: 3 },
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
              : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          }}
        >
          {/* Navigation Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              justifyContent: { xs: 'center', lg: 'flex-start' },
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Tooltip title="Previous">
                <IconButton 
                  onClick={getPrevHandler()} 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  color: theme.palette.text.primary,
                  minWidth: '200px',
                  textAlign: 'center',
                }}
              >
                {getDateTitle()}
              </Typography>
              
              <Tooltip title="Next">
                <IconButton 
                  onClick={getNextHandler()} 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title="Go to today">
              <Button 
                startIcon={<Today />} 
                onClick={goToToday}
                variant="outlined"
                size="medium"
                sx={{ 
                  ml: 1,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Today
              </Button>
            </Tooltip>
          </Box>
          
          {/* Controls Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', lg: 'flex-end' },
            }}
          >
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="medium"
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 'none',
                  borderRadius: '0 !important',
                  '&:not(:first-of-type)': {
                    borderLeft: `1px solid ${theme.palette.divider}`,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }
              }}
            >
              <ToggleButton value={VIEW_MODES.MONTH} aria-label="month view">
                <Tooltip title="Month View">
                  <CalendarViewMonth />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={VIEW_MODES.WEEK} aria-label="week view">
                <Tooltip title="Week View">
                  <CalendarViewWeek />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={VIEW_MODES.DAY} aria-label="day view">
                <Tooltip title="Day View">
                  <CalendarViewDay />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Zoom and Export Controls */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}>
              <Tooltip title="Zoom Out">
                <IconButton 
                  onClick={handleZoomOut} 
                  disabled={zoomLevel <= 1}
                  sx={{
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton 
                  onClick={handleZoomIn} 
                  disabled={zoomLevel >= 1.8}
                  sx={{
                    borderRadius: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Box sx={{ borderLeft: `1px solid ${theme.palette.divider}` }}>
                <ExportButton 
                  calendarElement={calendarRef.current}
                  calendarData={marketData}
                  analysisData={null}
                  variant="icon"
                  size="medium"
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Calendar Area */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', xl: 'row' },
        gap: 3,
        flex: 1,
        minHeight: 0, // Important for flex children
      }}>
        {/* Calendar Grid */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0, // Important for flex children
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Paper 
            elevation={2}
            sx={{
              flex: 1,
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              position: 'relative',
            }}>
              <Box 
                style={{
                  ...gridStyle,
                  minHeight: '100%',
                }}
              >
                <Grid 
                  container 
                  spacing={0} 
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                    width: '100%',
                    minWidth: { 
                      xs: viewMode === VIEW_MODES.MONTH ? '700px' : '100%', 
                      md: '100%' 
                    },
                    minHeight: '100%',
                  }}
                >
                  {/* Header row with weekday names */}
                  <CalendarHeader viewMode={viewMode} />
                  
                  {/* Calendar cells */}
                  {days.map((day, index) => {
                    if (viewMode === VIEW_MODES.WEEK) {
                      return (
                        <WeeklyCalendarCell
                          key={index}
                          weekStart={day}
                          marketData={marketData || {}}
                          loading={loading}
                          isCurrentWeek={day && day.isSame && day.isSame(moment(), 'week')}
                          isSelected={isDaySelected(day)}
                          onWeekClick={handleDayClick}
                        />
                      );
                    } else {
                      return (
                        <CalendarCell 
                          key={index} 
                          day={day}
                          viewMode={viewMode}
                          marketData={marketData || {}}
                          loading={loading}
                          isToday={day && day.isSame && day.isSame(moment(), 'day')}
                          isCurrentMonth={day && day.month && day.month() === currentDate.month()}
                          isSelected={isDaySelected(day)}
                          isInRangePreview={isDayInRangePreview(day)}
                          onDayClick={handleDayClick}
                        />
                      );
                    }
                  })}
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Date Range Selector */}
        <Box sx={{ 
          width: { xs: '100%', xl: 320 },
          flexShrink: 0,
        }}>
          <DateRangeSelector />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
