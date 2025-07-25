import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Tooltip,
  useTheme,
  Paper,
  alpha,
  Zoom,
  Fade,
  Popper,
  ClickAwayListener
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  TrendingFlat,
  BarChart,
  StackedLineChart,
  TimelineOutlined
} from '@mui/icons-material';
import { 
  formatNumber, 
  formatPercentage, 
  getVolatilityColor,
  getPerformanceIndicator,
  formatPrice
} from '../../utils/dateUtils';

// Performance indicator component
const PerformanceIndicator = ({ value, size = 'small', colorTheme = 'default' }) => {
  const { direction, color } = getPerformanceIndicator(value, colorTheme);
  
  return (
    <Box 
      sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {direction === 'up' && (
        <TrendingUp 
          fontSize={size} 
          sx={{ 
            color,
            animation: 'pulse 2s infinite'
          }} 
        />
      )}
      {direction === 'down' && (
        <TrendingDown 
          fontSize={size} 
          sx={{ color }} 
        />
      )}
      {direction === 'neutral' && (
        <TrendingFlat 
          fontSize={size} 
          sx={{ color }} 
        />
      )}
    </Box>
  );
};

// Volume indicator with bars
const VolumeIndicator = ({ volume, maxVolume = 10000, colorTheme = 'default' }) => {
  const theme = useTheme();
  const normalizedVolume = Math.min(100, Math.max(10, (volume / maxVolume) * 100));
  
  // Volume bar color based on volume and theme
  const getVolumeColor = () => {
    if (colorTheme === 'colorblind') {
      return normalizedVolume > 70 
        ? 'rgb(0, 114, 178)' // Blue
        : 'rgb(86, 180, 233)'; // Light Blue
    }
    
    return normalizedVolume > 70 
      ? theme.palette.primary.main
      : theme.palette.primary.light;
  };
  
  return (
    <Box 
      sx={{ 
        width: '100%',
        height: '4px',
        backgroundColor: theme.palette.divider,
        borderRadius: '2px',
        overflow: 'hidden',
        my: 0.5
      }}
    >
      <Box 
        sx={{
          width: `${normalizedVolume}%`,
          height: '100%',
          backgroundColor: getVolumeColor(),
          transition: 'width 0.5s ease-in-out',
        }}
      />
    </Box>
  );
};

const CalendarCell = ({ 
  day, 
  instrument, 
  viewMode = 'month',
  marketData = {},
  loading = false,
  isToday = false, 
  isCurrentMonth = true,
  colorTheme = 'default',
  onDayClick 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const dateKey = day?.format('YYYY-MM-DD');
  const dayData = marketData && dateKey ? (marketData[dateKey] || null) : null;
  
  // State for responsive design
  const [isXsScreen, setIsXsScreen] = useState(false);
  const [isSmScreen, setIsSmScreen] = useState(false);
  
  // Handle responsive UI with useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsXsScreen(window.innerWidth < theme.breakpoints.values.sm);
      setIsSmScreen(window.innerWidth < theme.breakpoints.values.md);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [theme.breakpoints.values.sm, theme.breakpoints.values.md]);
  
  // Cell styling based on conditions
  const getCellStyle = () => {
    // Using responsive state for styling
    
    let cellHeight;
    if (viewMode === 'month') {
      cellHeight = isXsScreen ? 80 : isSmScreen ? 100 : 120;
    } else if (viewMode === 'week') {
      cellHeight = isXsScreen ? 120 : isSmScreen ? 150 : 180;
    } else {
      cellHeight = 'auto';
    }
    
    let style = {
      height: cellHeight,
      p: isXsScreen ? 0.5 : 1,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      borderRight: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%', // Ensure cells take full width of grid column
      minWidth: viewMode === 'week' ? isXsScreen ? '8rem' : '12rem' : 'auto', // Responsive min width
      fontSize: isXsScreen ? '0.75rem' : 'inherit', // Smaller font on mobile
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.light, 0.1),
        transform: isXsScreen ? 'none' : 'scale(1.01)', // Disable transform on mobile for better performance
        zIndex: 1,
      }
    };
    
    // Today styling
    if (isToday) {
      style = {
        ...style,
        borderLeft: `3px solid ${theme.palette.primary.main}`,
      };
    }
    
    // Not current month styling
    if (!isCurrentMonth) {
      style = {
        ...style,
        opacity: 0.5,
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900]
      };
    }
    
    // Set background color based on volatility if day data exists
    if (dayData && dayData.volatility !== undefined && isCurrentMonth) {
      style = {
        ...style,
        backgroundColor: alpha(getVolatilityColor(dayData.volatility, colorTheme), 0.2)
      };
    }
    
    return style;
  };
  
  // Show tooltip on hover
  const handleMouseEnter = (event) => {
    if (dayData) {
      setAnchorEl(event.currentTarget);
      setShowTooltip(true);
    }
  };
  
  // Hide tooltip on leave
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  // Tooltip close on click away
  const handleClickAway = () => {
    setShowTooltip(false);
  };
  
  // Handle click on cell
  const handleClick = () => {
    onDayClick && onDayClick(day);
  };
  
  // Day number with indicator for today
  const renderDayNumber = () => {
    // Using responsive state variable defined by the useEffect
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: isXsScreen ? 0.5 : 1,
          px: isXsScreen ? 0.5 : 0 // Add some padding on small screens
        }}
      >
        <Typography 
          variant={isXsScreen ? "caption" : "body2"} 
          sx={{ 
            fontWeight: isToday ? 700 : isCurrentMonth ? 500 : 400,
            color: isToday ? theme.palette.primary.main : 'inherit',
            fontSize: isXsScreen ? '0.7rem' : 'inherit'
          }}
        >
          {day.format('D')}
        </Typography>
        
        {isToday && (
          <Box 
            sx={{ 
              width: isXsScreen ? 6 : 8, 
              height: isXsScreen ? 6 : 8, 
              borderRadius: '50%', 
              backgroundColor: theme.palette.primary.main,
              ml: 0.5
            }}
          />
        )}
      </Box>
    );
  };
  
  // Render market data indicators if available
  const renderMarketData = () => {
    if (loading) {
      return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Loading...
          </Typography>
        </Box>
      );
    }
    
    if (!dayData) {
      return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            No Data
          </Typography>
        </Box>
      );
    }
    
    // Market closed case
    if (dayData && dayData.isMarketOpen === false) {
      return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Market Closed
          </Typography>
        </Box>
      );
    }
    
    return (
      <Fade in={!!dayData}>
        <Box sx={{ mt: 1 }}>
          {/* Price */}
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {typeof dayData.close === 'number' ? formatPrice(dayData.close, instrument) : '-'}
            </Typography>
            {typeof dayData.performance === 'number' && (
              <PerformanceIndicator value={dayData.performance} colorTheme={colorTheme} />
            )}
          </Box>
          
          {/* Volume */}
          {typeof dayData.volume === 'number' && dayData.volume > 0 && (
            <VolumeIndicator volume={dayData.volume} colorTheme={colorTheme} />
          )}
          
          {/* Volatility and Liquidity Indicators */}
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {/* Volatility */}
            {typeof dayData.volatility === 'number' && (
              <Tooltip title={`Volatility: ${dayData.volatility.toFixed(2)}%`}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(getVolatilityColor(dayData.volatility, colorTheme), 0.2),
                    border: `1px solid ${alpha(getVolatilityColor(dayData.volatility, colorTheme), 0.3)}`,
                  }}
                >
                  <StackedLineChart 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: getVolatilityColor(dayData.volatility, colorTheme)
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 0.5,
                      color: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                  >
                    {dayData.volatility.toFixed(1)}%
                  </Typography>
              </Box>
            </Tooltip>
            )}
            
            {/* Liquidity */}
            {typeof dayData.volume === 'number' && dayData.volume > 0 && (
              <Tooltip title={`Volume: ${formatNumber(dayData.volume)}`}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                }}
              >
                <BarChart 
                  sx={{ 
                    fontSize: '0.875rem', 
                    color: theme.palette.info.main
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 0.5,
                    color: theme.palette.text.secondary,
                    fontWeight: 500
                  }}
                >
                  {formatNumber(dayData.volume)}
                </Typography>
              </Box>
            </Tooltip>
            )}
          </Box>
        </Box>
      </Fade>
    );
  };
  
  // Enhanced tooltip content
  const renderTooltipContent = () => {
    if (!dayData) return null;
    
    return (
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {day.format('dddd, MMMM D, YYYY')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Price info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Open: <strong>{formatPrice(dayData.open, instrument)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Close: <strong>{formatPrice(dayData.close, instrument)}</strong>
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              High: <strong>{formatPrice(dayData.high, instrument)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Low: <strong>{formatPrice(dayData.low, instrument)}</strong>
            </Typography>
          </Box>
          
          {/* Performance */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Performance: 
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 1,
                fontWeight: 600,
                color: dayData.performance > 0 
                  ? theme.palette.success.main 
                  : dayData.performance < 0
                    ? theme.palette.error.main
                    : theme.palette.text.primary
              }}
            >
              {formatPercentage(dayData.performance)}
            </Typography>
            <PerformanceIndicator value={dayData.performance} colorTheme={colorTheme} />
          </Box>
          
          {/* Volume and Volatility */}
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Volume: <strong>{formatNumber(dayData.volume)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Volatility: <strong>{dayData.volatility.toFixed(2)}%</strong>
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ color: theme.palette.info.main, mt: 0.5 }}>
            Click for more details
          </Typography>
        </Box>
      </Box>
    );
  };
  
  return (
    <>
      <Grid 
        gridSize={viewMode === 'day' ? 12 : 1}
        sx={getCellStyle()}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderDayNumber()}
        {renderMarketData()}
      </Grid>
      
      <Popper
        open={showTooltip}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ]}
        sx={{ zIndex: 1500 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={250}>
              <Paper 
                elevation={3}
                sx={{ 
                  borderRadius: 1,
                  maxWidth: 280,
                  boxShadow: theme.shadows[5]
                }}
              >
                {renderTooltipContent()}
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

export default CalendarCell;
