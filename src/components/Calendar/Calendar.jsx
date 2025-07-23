import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  IconButton, 
  Typography,
  ButtonGroup,
  Button,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Zoom,
  useMediaQuery,
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
import { getCalendarDaysForMonth, getCalendarDaysForWeek } from '../../utils/dateUtils';
import useMarketData from '../../hooks/useMarketData';

const Calendar = ({ onDaySelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
    colorTheme
  } = useContext(AppContext);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [calendarWidth, setCalendarWidth] = useState(null);

  // Fetch market data for the current view
  const { data: marketData, loading } = useMarketData(currentDate, selectedInstrument);
  
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
      case VIEW_MODES.WEEK:
        const weekStart = moment(currentDate).startOf('week');
        const weekEnd = moment(currentDate).endOf('week');
        if (weekStart.month() === weekEnd.month()) {
          return `${weekStart.format('MMM D')} - ${weekEnd.format('D, YYYY')}`;
        } else if (weekStart.year() === weekEnd.year()) {
          return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;
        } else {
          return `${weekStart.format('MMM D, YYYY')} - ${weekEnd.format('MMM D, YYYY')}`;
        }
      case VIEW_MODES.DAY:
        return currentDate.format('dddd, MMMM D, YYYY');
      default:
        return currentDate.format('MMMM YYYY');
    }
  };
  
  // Generate calendar days based on view mode
  const generateCalendarDays = () => {
    const startDay = moment(currentDate).startOf('month').startOf('week');
    switch(viewMode) {
      case VIEW_MODES.DAY:
        return [currentDate.clone()];
        
      case VIEW_MODES.WEEK:
        return getCalendarDaysForWeek(currentDate);
        
      case VIEW_MODES.MONTH:
      default:
        return getCalendarDaysForMonth(currentDate);
    }
  };

  const days = generateCalendarDays();

  // Calculate grid columns based on view mode
  const getGridColumns = () => {
    switch(viewMode) {
      case VIEW_MODES.DAY:
        return 1;
      case VIEW_MODES.WEEK:
        return 7;
      case VIEW_MODES.MONTH:
      default:
        return 7;
    }
  };

  // Apply zoom effect to grid
  const gridStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top center',
    transition: 'transform 0.3s ease',
  };

  return (
    <Box 
      className="calendar-container"
      sx={{ 
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: viewMode === VIEW_MODES.MONTH ? '80vh' : '100%',
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          background: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isTablet ? 'column' : 'row',
            alignItems: isTablet ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Previous">
                <IconButton onClick={getPrevHandler()} color="primary" sx={{ color: theme.palette.text.secondary }}>
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
              
              <Typography variant="h6" sx={{ mx: 1, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {getDateTitle()}
              </Typography>
              
              <Tooltip title="Next">
                <IconButton onClick={getNextHandler()} color="primary" sx={{ color: theme.palette.text.secondary }}>
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title="Go to today">
              <Button 
                startIcon={<Today />} 
                onClick={goToToday}
                variant="outlined"
                size="small"
                sx={{ ml: { xs: 0, md: 2 } }}
              >
                Today
              </Button>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 1.8}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <Paper 
        elevation={2}
        sx={{
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ overflowX: 'auto', overflowY: 'auto' }}>
          <Box style={gridStyle}>
            <Grid container spacing={0} gridColumns={getGridColumns()}>
              <CalendarHeader viewMode={viewMode} />
              {days.map((day, index) => (
                <CalendarCell 
                  key={index} 
                  day={day}
                  viewMode={viewMode}
                  instrument={selectedInstrument}
                  marketData={marketData || {}}
                  loading={loading}
                  isToday={day && day.isSame && day.isSame(moment(), 'day')}
                  isCurrentMonth={day && day.month && day.month() === currentDate.month()}
                  colorTheme={colorTheme}
                  onDayClick={() => day && onDaySelect && onDaySelect(day)}
                />
              ))}
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Calendar;
