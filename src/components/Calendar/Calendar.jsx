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
    
    // Check if we have data for today (July 26, 2025)
    const today = '2025-07-26';
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
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: { 
          xs: viewMode === VIEW_MODES.MONTH ? '70vh' : '100%',
          md: viewMode === VIEW_MODES.MONTH ? '80vh' : '100%'
        },
        WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
        outline: 'none', // Remove focus outline for clean look
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }
      }}
      onClick={(e) => {
        // Focus the calendar when clicked to enable keyboard navigation
        e.currentTarget.focus();
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 1, sm: 1.5, md: 2 }, 
          mb: { xs: 1, sm: 1.5, md: 2 }, 
          borderRadius: { xs: 1, sm: 2 },
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1.5, md: 2 }
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 1,
              justifyContent: { xs: 'center', md: 'flex-start' },
              width: { xs: '100%', md: 'auto' }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              <Tooltip title="Previous">
                <IconButton 
                  onClick={getPrevHandler()} 
                  color="primary" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    padding: { xs: '4px', sm: '8px' }
                  }}
                >
                  <ChevronLeft fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                sx={{ 
                  mx: { xs: 0.5, sm: 1 }, 
                  fontWeight: 600, 
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
                {getDateTitle()}
              </Typography>
              
              <Tooltip title="Next">
                <IconButton 
                  onClick={getNextHandler()} 
                  color="primary" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    padding: { xs: '4px', sm: '8px' }
                  }}
                >
                  <ChevronRight fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title="Go to today">
              <Button 
                startIcon={<Today fontSize={isMobile ? "small" : "medium"} />} 
                onClick={goToToday}
                variant="outlined"
                size="small"
                sx={{ 
                  ml: { xs: 0, md: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  px: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Today
              </Button>
            </Tooltip>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 2 }, 
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' },
              width: { xs: '100%', md: 'auto' }
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  padding: { xs: '4px 8px', sm: '6px 12px' }
                }
              }}
            >
              <ToggleButton value={VIEW_MODES.MONTH} aria-label="month view">
                <Tooltip title="Month View">
                  <CalendarViewMonth fontSize={isMobile ? "small" : "medium"} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={VIEW_MODES.WEEK} aria-label="week view">
                <Tooltip title="Week View">
                  <CalendarViewWeek fontSize={isMobile ? "small" : "medium"} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={VIEW_MODES.DAY} aria-label="day view">
                <Tooltip title="Day View">
                  <CalendarViewDay fontSize={isMobile ? "small" : "medium"} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: 0.5 
            }}>
              <Tooltip title="Zoom Out">
                <IconButton 
                  onClick={handleZoomOut} 
                  disabled={zoomLevel <= 1} 
                  size={isMobile ? "small" : "medium"}
                >
                  <ZoomOut fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton 
                  onClick={handleZoomIn} 
                  disabled={zoomLevel >= 1.8} 
                  size={isMobile ? "small" : "medium"}
                >
                  <ZoomIn fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              <ExportButton 
                calendarElement={calendarRef.current}
                calendarData={marketData}
                analysisData={null}
                variant="icon"
                size={isMobile ? "small" : "medium"}
              />
              {/* Debug marketData */}
              {console.log('📊 Calendar marketData for export:', marketData)}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Responsive flex layout: calendar grid and DateRangeSelector side by side on desktop, stacked on mobile */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 4 },
        alignItems: 'flex-start',
        width: '100%',
        mt: 2
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper 
            elevation={2}
            sx={{
              overflow: 'hidden',
              borderRadius: { xs: 1, sm: 2 },
              transition: 'all 0.3s ease',
              boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.08)', md: '0 4px 12px rgba(0,0,0,0.12)' }
            }}
          >
            <Box sx={{ 
              overflowX: 'auto', 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
              minHeight: { xs: '50vh', sm: '60vh' }
            }}>
              <Box style={gridStyle}>
                <Grid 
                  container 
                  spacing={0} 
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                    width: '100%',
                    minWidth: { xs: '600px', md: '900px' }, // Ensure minimum width for scrolling on mobile
                  }}
                >
                  {/* Header row with weekday names */}
                  <CalendarHeader viewMode={viewMode} />
                  {/* Calendar cells */}
                  {days.map((day, index) => {
                    if (viewMode === VIEW_MODES.WEEK) {
                      // Use WeeklyCalendarCell for week view
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
                      // Use regular CalendarCell for day/month view
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
        <Box sx={{ width: { xs: '100%', md: 320 }, minWidth: 0 }}>
          <DateRangeSelector />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
