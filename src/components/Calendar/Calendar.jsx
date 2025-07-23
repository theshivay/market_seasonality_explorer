import React, { useState, useEffect, useContext } from 'react';
import { Typography, Grid, Paper, Box, styled, useMediaQuery, useTheme } from '@mui/material';
import moment from 'moment';
import { AppContext } from '../../context/AppContext.jsx';
import CalendarCell from './CalendarCell.jsx';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarControls from './CalendarControls.jsx';
import dateUtils from '../../utils/dateUtils.jsx';
import useSwipeGesture from '../../hooks/useSwipeGesture.jsx';
import './CalendarStyles.css';

const { getDatesInMonth, getWeeksInMonth, getDayNames } = dateUtils;

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3],
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    borderRadius: 0,
    boxShadow: 'none',
  },
  
  '@media (max-width: 900px) and (orientation: landscape)': {
    flexDirection: 'row',
    overflow: 'hidden'
  }
}));

const CalendarGrid = styled(Grid)(({ theme }) => ({
  flex: 1,
  width: '100%',
  
  [theme.breakpoints.down('sm')]: {
    maxHeight: 'calc(100vh - 200px)', // Allow scrolling on mobile
    overflowY: 'auto',
  }
}));

const Calendar = () => {
  const { 
    viewMode, 
    selectedDate, 
    selectDate, 
    selectedDateRange,
    selectDateRange,
    selectedInstrument,
    thresholds
  } = useContext(AppContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentMonth, setCurrentMonth] = useState(moment(selectedDate));
  const [calendarDays, setCalendarDays] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

  // Handle month navigation
  const nextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const prevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };
  
  // Configure swipe gestures for mobile navigation
  const swipeHandlers = useSwipeGesture(
    nextMonth, // Swipe left goes to next month
    prevMonth  // Swipe right goes to previous month
  );

  // Handle keyboard navigation
  const handleKeyDown = (e, day) => {
    if (e.key === 'Enter') {
      selectDate(day);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
               e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = calendarDays.findIndex(d => d.isSame(day, 'day'));
      let newIndex;

      switch(e.key) {
        case 'ArrowLeft':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          newIndex = Math.min(calendarDays.length - 1, currentIndex + 1);
          break;
        case 'ArrowUp':
          newIndex = Math.max(0, currentIndex - 7);
          break;
        case 'ArrowDown':
          newIndex = Math.min(calendarDays.length - 1, currentIndex + 7);
          break;
        default:
          newIndex = currentIndex;
      }

      if (newIndex !== currentIndex && calendarDays[newIndex]) {
        selectDate(calendarDays[newIndex]);
      }
    } else if (e.key === 'Escape') {
      // Cancel any selection
      setIsSelecting(false);
      setSelectionStart(null);
    }
  };

  // Update calendar days when month changes
  useEffect(() => {
    let days;
    switch(viewMode) {
      case 'weekly':
        days = getWeeksInMonth(currentMonth.year(), currentMonth.month())
          .flat()
          .filter((day, i, arr) => {
            // Limit to current week +/- 2 weeks
            const selectedWeekStart = moment(selectedDate).startOf('week');
            const dayWeekStart = moment(day).startOf('week');
            const weekDiff = Math.abs(dayWeekStart.diff(selectedWeekStart, 'weeks'));
            return weekDiff <= 2;
          });
        break;
      case 'monthly':
        days = getDatesInMonth(currentMonth.year(), currentMonth.month());
        break;
      case 'daily':
      default:
        // For daily view, show current week
        days = Array(7).fill(0).map((_, i) => {
          return moment(selectedDate).startOf('week').add(i, 'days');
        });
    }
    
    setCalendarDays(days);
  }, [currentMonth, viewMode, selectedDate]);

  // Handle date selection and range selection with improved UX
  const handleDateClick = (day) => {
    // Handle click with modifier keys for special selection behaviors
    if (window.event && window.event.shiftKey && selectionStart) {
      // Shift+Click extends the current selection
      const startDate = selectionStart.isBefore(day) ? selectionStart : day;
      const endDate = selectionStart.isBefore(day) ? day : selectionStart;
      
      selectDateRange(startDate, endDate);
      // Keep selection mode active for further refinement
      setIsSelecting(true);
    } else if (isSelecting) {
      // Finish selecting range
      const startDate = selectionStart.isBefore(day) ? selectionStart : day;
      const endDate = selectionStart.isBefore(day) ? day : selectionStart;
      
      selectDateRange(startDate, endDate);
      setIsSelecting(false);
      setSelectionStart(null);
      
      // Notify user of selection completion with range details
      const days = endDate.diff(startDate, 'days') + 1;
      console.log(`Selected range: ${startDate.format('MMM D')} - ${endDate.format('MMM D')} (${days} days)`);
    } else {
      // Start selecting range or select single day
      selectDate(day);
      setSelectionStart(day);
      setIsSelecting(true);
    }
  };

  // Handle mouse enter for range preview with enhanced feedback
  const handleMouseEnter = (day) => {
    if (isSelecting && selectionStart) {
      // Preview range selection
      const startDate = selectionStart.isBefore(day) ? selectionStart : day;
      const endDate = selectionStart.isBefore(day) ? day : selectionStart;
      
      // Preview range selection for better UX
      selectDateRange(startDate, endDate);
    }
  };
  
  // Handle mouse leave to reset preview if user moves out of calendar
  const handleMouseLeave = () => {
    if (isSelecting && selectionStart) {
      // Reset to just the start date selected when mouse leaves calendar
      selectDateRange(selectionStart, selectionStart);
    }
  };

  // Render calendar based on view mode
  const renderCalendar = () => {
    switch(viewMode) {
      case 'daily':
        return renderDailyView();
      case 'weekly':
        return renderWeeklyView();
      case 'monthly':
      default:
        return renderMonthlyView();
    }
  };

  // Render daily view (improved with multi-day navigation and hourly breakdown)
  const renderDailyView = () => {
    // Get the days of the current week for navigation context
    const startOfWeek = moment(selectedDate).startOf('week');
    const daysOfWeek = Array(7).fill(0).map((_, i) => 
      startOfWeek.clone().add(i, 'days')
    );
    
    // Daily view shows hours of selected day
    // On mobile, only show business hours to save space
    const hourRange = isMobile ? 
      [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] : // Business hours for mobile
      Array(24).fill(0).map((_, i) => i); // All 24 hours for desktop
    
    const hours = hourRange.map(i => {
      return moment(selectedDate).startOf('day').add(i, 'hours');
    });

    return (
      <>
        {/* Week day navigation bar */}
        <Grid container spacing={0} sx={{ mb: 1 }}>
          {daysOfWeek.map((day, index) => (
            <Grid 
              item 
              xs={12/7} 
              key={index} 
              onClick={() => selectDate(day)}
              sx={{
                textAlign: 'center',
                py: 1,
                cursor: 'pointer',
                bgcolor: selectedDate.isSame(day, 'day') ? 'primary.light' : 'transparent',
                color: selectedDate.isSame(day, 'day') ? 'primary.contrastText' : 
                       day.isSame(moment(), 'day') ? 'secondary.main' : 'text.primary',
                fontWeight: day.isSame(moment(), 'day') ? 'bold' : 'normal',
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                borderBottom: selectedDate.isSame(day, 'day') ? '2px solid' : 'none',
                borderColor: 'primary.main'
              }}
            >
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                {day.format('ddd')}
              </Typography>
              <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ fontWeight: 'bold' }}>
                {day.format('D')}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Current day's hourly breakdown */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>
        
        <Grid 
          container 
          spacing={isMobile ? 0.5 : 1} 
          sx={{
            maxHeight: isMobile ? 'calc(100vh - 230px)' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          {hours.map((hour, index) => (
            <Grid item xs={12} key={index}>
              <CalendarCell 
                date={hour}
                isSelected={false}
                isToday={moment().isSame(hour, 'hour')}
                isCurrentMonth={true}
                displayMode="hourly"
                onKeyDown={(e) => handleKeyDown(e, hour)}
                onClick={() => handleDateClick(hour)} // Enable selection in hourly view
                onMouseEnter={() => handleMouseEnter(hour)}
                instrument={selectedInstrument}
                thresholds={thresholds}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  // Render weekly view
  const renderWeeklyView = () => {
    const dayNames = getDayNames();
    
    // On mobile, use abbreviated day names with dates
    const responsiveDayNames = isMobile 
      ? dayNames.map(day => day.substring(0, 1)) 
      : dayNames;
    
    return (
      <>
        <Grid container spacing={0}>
          {responsiveDayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ 
              textAlign: 'center', 
              py: isMobile ? 0.5 : 1 
            }}>
              <Typography 
                variant={isMobile ? "caption" : "subtitle2"}
                sx={{ fontWeight: 'bold' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={isMobile ? 0.5 : 1}>
          {calendarDays.map((day, index) => (
            <Grid item xs={12 / 7} key={index}>
              <CalendarCell 
                date={day}
                isSelected={selectedDate.isSame(day, 'day')}
                isInRange={selectedDateRange[0] && selectedDateRange[1] && 
                  day.isSameOrAfter(selectedDateRange[0], 'day') && 
                  day.isSameOrBefore(selectedDateRange[1], 'day')}
                isToday={moment().isSame(day, 'day')}
                isCurrentMonth={day.month() === currentMonth.month()}
                displayMode="daily"
                onKeyDown={(e) => handleKeyDown(e, day)}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                instrument={selectedInstrument}
                thresholds={thresholds}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  // Render monthly view
  const renderMonthlyView = () => {
    const dayNames = getDayNames();
    const weeks = getWeeksInMonth(currentMonth.year(), currentMonth.month());
    
    // On mobile, use abbreviated day names
    const responsiveDayNames = isMobile 
      ? dayNames.map(day => day.substring(0, 1)) 
      : dayNames;
    
    return (
      <>
        <Grid container spacing={0}>
          {responsiveDayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ 
              textAlign: 'center', 
              py: isMobile ? 0.5 : 1 
            }}>
              <Typography 
                variant={isMobile ? "caption" : "subtitle2"}
                sx={{ fontWeight: 'bold' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={isMobile ? 0.5 : 1} key={weekIndex}>
            {week.map((day, dayIndex) => (
              <Grid item xs={12 / 7} key={dayIndex}>
                <CalendarCell 
                  date={day}
                  isSelected={selectedDate.isSame(day, 'day')}
                  isInRange={selectedDateRange[0] && selectedDateRange[1] && 
                    day.isSameOrAfter(selectedDateRange[0], 'day') && 
                    day.isSameOrBefore(selectedDateRange[1], 'day')}
                  isToday={moment().isSame(day, 'day')}
                  isCurrentMonth={day.month() === currentMonth.month()}
                  displayMode="daily"
                  onKeyDown={(e) => handleKeyDown(e, day)}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => handleMouseEnter(day)}
                  instrument={selectedInstrument}
                  thresholds={thresholds}
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </>
    );
  };

  // Adjust calendar for mobile display
  const renderCalendarForDevice = () => {
    // Show less information on mobile
    if (isMobile) {
      return (
        <div {...swipeHandlers}>
          {renderCalendar()}
        </div>
      );
    } else {
      return renderCalendar();
    }
  };

  return (
    <CalendarContainer className="calendar-container">
      <div className={isMobile ? "calendar-sidebar" : ""}>
        {/* Calendar Header with month name and navigation */}
        <CalendarHeader 
          currentDate={currentMonth}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          viewMode={viewMode}
        />
        
        {/* Calendar Controls for view switching, etc. */}
        <CalendarControls />
      </div>
      
      {/* Calendar Grid with swipe gesture support on mobile */}
      <CalendarGrid 
        container 
        direction="column" 
        spacing={isMobile ? 0.5 : 1}
        {...swipeHandlers}
        onMouseLeave={handleMouseLeave}
        className={`calendar-main scrollable-container ${isMobile ? 'mobile-calendar' : ''}`}
      >
        {renderCalendarForDevice()}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar;
