import React, { useState, useEffect, useContext } from 'react';
import { Typography, Grid, Paper, styled } from '@mui/material';
import moment from 'moment';
import { AppContext } from '../../context/AppContext.jsx';
import CalendarCell from './CalendarCell.jsx';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarControls from './CalendarControls.jsx';
import dateUtils from '../../utils/dateUtils.jsx';

const { getDatesInMonth, getWeeksInMonth, getDayNames } = dateUtils;

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3],
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const CalendarGrid = styled(Grid)(({ theme }) => ({
  flex: 1,
  width: '100%'
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

  const [currentMonth, setCurrentMonth] = useState(moment(selectedDate));
  const [calendarDays, setCalendarDays] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

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

  // Handle month navigation
  const nextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const prevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  // Handle date selection and range selection
  const handleDateClick = (day) => {
    if (isSelecting) {
      // Finish selecting range
      const startDate = selectionStart.isBefore(day) ? selectionStart : day;
      const endDate = selectionStart.isBefore(day) ? day : selectionStart;
      
      selectDateRange(startDate, endDate);
      setIsSelecting(false);
      setSelectionStart(null);
    } else {
      // Start selecting range or select single day
      selectDate(day);
      setSelectionStart(day);
      setIsSelecting(true);
    }
  };

  // Handle mouse enter for range preview
  const handleMouseEnter = (day) => {
    if (isSelecting && selectionStart) {
      // Preview range selection
      const startDate = selectionStart.isBefore(day) ? selectionStart : day;
      const endDate = selectionStart.isBefore(day) ? day : selectionStart;
      
      // Just preview - don't commit yet
      selectDateRange(startDate, endDate);
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

  // Render daily view (detailed for a single day)
  const renderDailyView = () => {
    // Daily view shows hours of selected day
    const hours = Array(24).fill(0).map((_, i) => {
      return moment(selectedDate).startOf('day').add(i, 'hours');
    });

    return (
      <Grid container spacing={1} direction="column">
        {hours.map((hour, index) => (
          <Grid item xs={12} key={index}>
            <CalendarCell 
              date={hour}
              isSelected={false}
              isToday={moment().isSame(hour, 'hour')}
              isCurrentMonth={true}
              displayMode="hourly"
              onKeyDown={(e) => handleKeyDown(e, hour)}
              onClick={() => {}} // No click action for hourly view
              instrument={selectedInstrument}
              thresholds={thresholds}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render weekly view
  const renderWeeklyView = () => {
    const dayNames = getDayNames();
    
    return (
      <>
        <Grid container spacing={0}>
          {dayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="subtitle2">{day}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1}>
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
    
    return (
      <>
        <Grid container spacing={0}>
          {dayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="subtitle2">{day}</Typography>
            </Grid>
          ))}
        </Grid>
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex}>
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

  return (
    <CalendarContainer>
      {/* Calendar Header with month name and navigation */}
      <CalendarHeader 
        currentDate={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        viewMode={viewMode}
      />
      
      {/* Calendar Controls for view switching, etc. */}
      <CalendarControls />
      
      {/* Calendar Grid */}
      <CalendarGrid container direction="column" spacing={1}>
        {renderCalendar()}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar;
