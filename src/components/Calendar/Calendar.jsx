import React, { useContext, useState } from 'react';
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
import { getCalendarDaysForMonth, getCalendarDaysForWeek } from '../../utils/dateUtils';
import useMarketData from '../../hooks/useMarketData';

const Calendar = ({ onDaySelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
        return getCalendarDaysForWeek(currentDate);
        
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
        return 7; // Always 7 days in a week
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
      className="calendar-container"
      sx={{ 
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: { 
          xs: viewMode === VIEW_MODES.MONTH ? '70vh' : '100%',
          md: viewMode === VIEW_MODES.MONTH ? '80vh' : '100%'
        },
        WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 1, sm: 1.5, md: 2 }, 
          mb: { xs: 1, sm: 1.5, md: 2 }, 
          borderRadius: { xs: 1, sm: 2 },
          background: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 10,
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
            </Box>
          </Box>
        </Box>
      </Paper>
      
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
