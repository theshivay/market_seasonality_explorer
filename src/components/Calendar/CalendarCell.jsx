import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, styled, Tooltip, alpha } from '@mui/material';
import { 
  ArrowUpward, 
  ArrowDownward,
  Remove as NeutralIcon
} from '@mui/icons-material';
import { AppContext } from '../../context/AppContext.jsx';
import useMarketData from '../../hooks/useMarketData.jsx';
import { formatDate, getVolatilityLevel, getPerformanceLevel } from '../../utils/dateUtils.jsx';
import moment from 'moment';

// Styled components
const CellPaper = styled(Paper)(({ 
  theme, 
  isselected, 
  istoday, 
  iscurrentmonth, 
  isinrange,
  volatilitylevel,
  performancelevel 
}) => ({
  position: 'relative',
  padding: theme.spacing(1),
  height: '100%',
  minHeight: '80px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  overflow: 'hidden',
  border: isselected 
    ? `2px solid ${theme.palette.primary.main}` 
    : istoday 
      ? `2px solid ${theme.palette.secondary.main}` 
      : '2px solid transparent',
  opacity: iscurrentmonth === 'false' ? 0.5 : 1,
  backgroundColor: isinrange === 'true' 
    ? alpha(theme.palette.primary.main, 0.1)
    : volatilitylevel && theme.palette.volatility[volatilitylevel] 
      ? alpha(theme.palette.volatility[volatilitylevel], 0.2)
      : theme.palette.background.paper,
  '&:hover': {
    transform: 'scale(1.02)',
    zIndex: 2,
    boxShadow: theme.shadows[4],
  }
}));

const DateLabel = styled(Typography)(({ theme, istoday }) => ({
  fontWeight: istoday ? 'bold' : 'normal',
  color: istoday ? theme.palette.secondary.main : theme.palette.text.primary
}));

const Indicator = styled(Box)(({ theme, type, level }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: level && theme.palette[type][level] ? theme.palette[type][level] : 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const VolumeBar = styled(Box)(({ theme, volume, maxvolume }) => {
  const height = maxvolume > 0 ? (volume / maxvolume) * 100 : 0;
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: `${Math.min(60, height)}%`,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    zIndex: 0
  };
});

// Patterns for liquidity visualization
const patterns = {
  dots: {
    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
    backgroundSize: '4px 4px'
  },
  stripes: {
    backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)',
    backgroundSize: '8px 8px'
  },
  gradient: {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1))'
  }
};

const CalendarCell = ({ 
  date, 
  isSelected, 
  isInRange,
  isToday, 
  isCurrentMonth,
  displayMode,
  onKeyDown,
  onClick,
  onMouseEnter,
  instrument,
  thresholds
}) => {
  const { toggleDetailsPanel } = useContext(AppContext);
  const [cellData, setCellData] = useState(null);
  
  // Set up date range for market data fetch
  const startDate = moment(date).startOf('day');
  const endDate = moment(date).endOf('day');
  
  // Fetch market data for this cell
  const { data: marketData, loading } = useMarketData(
    instrument, 
    displayMode, 
    startDate.valueOf(), 
    endDate.valueOf()
  );
  
  useEffect(() => {
    if (marketData && marketData.processed) {
      setCellData(marketData.processed[0]); // Just take first day's data
    }
  }, [marketData]);
  
  // Determine volatility and performance levels
  const volatilityLevel = cellData?.volatility 
    ? getVolatilityLevel(cellData.volatility, thresholds.volatility) 
    : null;
  
  const performanceLevel = cellData?.performance 
    ? getPerformanceLevel(cellData.performance, thresholds.performance) 
    : null;
  
  // Determine volume relative to max volume (for bar height)
  const maxVolume = 1000000; // This should ideally be passed down from parent
  
  // Render performance indicator arrow
  const renderPerformanceIndicator = () => {
    if (!performanceLevel) return null;
    
    switch (performanceLevel) {
      case 'positive':
        return <ArrowUpward fontSize="small" />;
      case 'negative':
        return <ArrowDownward fontSize="small" />;
      case 'neutral':
      default:
        return <NeutralIcon fontSize="small" />;
    }
  };
  
  // Render tooltip content
  const tooltipContent = () => {
    if (loading) return "Loading data...";
    
    if (!cellData) return "No data available";
    
    return (
      <>
        <Typography variant="body2"><strong>Date:</strong> {formatDate(date, 'MMM D, YYYY')}</Typography>
        {cellData.open && (
          <>
            <Typography variant="body2"><strong>Open:</strong> {cellData.open.toFixed(2)}</Typography>
            <Typography variant="body2"><strong>High:</strong> {cellData.high.toFixed(2)}</Typography>
            <Typography variant="body2"><strong>Low:</strong> {cellData.low.toFixed(2)}</Typography>
            <Typography variant="body2"><strong>Close:</strong> {cellData.close.toFixed(2)}</Typography>
          </>
        )}
        <Typography variant="body2"><strong>Volume:</strong> {cellData.volume.toLocaleString()}</Typography>
        {cellData.volatility && (
          <Typography variant="body2">
            <strong>Volatility:</strong> {(cellData.volatility * 100).toFixed(2)}%
          </Typography>
        )}
        {cellData.performance && (
          <Typography variant="body2">
            <strong>Performance:</strong> {cellData.performance > 0 ? '+' : ''}{cellData.performance.toFixed(2)}%
          </Typography>
        )}
      </>
    );
  };

  // Render cell content based on display mode
  const renderContent = () => {
    switch (displayMode) {
      case 'hourly':
        return (
          <>
            <DateLabel variant="body2" istoday={isToday ? 'true' : 'false'}>
              {formatDate(date, 'HH:mm')}
            </DateLabel>
            {cellData && cellData.performance && (
              <Typography variant="body2" color={performanceLevel && performanceLevel !== 'neutral' ? `performance.${performanceLevel}` : 'textSecondary'}>
                {cellData.performance > 0 ? '+' : ''}{cellData.performance.toFixed(2)}%
              </Typography>
            )}
          </>
        );
      case 'weekly':
        return (
          <>
            <DateLabel variant="body2" istoday={isToday ? 'true' : 'false'}>
              {`Week ${date.week()}`}
            </DateLabel>
            <Typography variant="caption">
              {formatDate(date.startOf('week'), 'MMM D')} - {formatDate(date.endOf('week'), 'MMM D')}
            </Typography>
          </>
        );
      case 'daily':
      default:
        return (
          <>
            <DateLabel variant="body2" istoday={isToday ? 'true' : 'false'}>
              {date.date()}
            </DateLabel>
            {cellData && cellData.performance && (
              <Typography variant="body2" color={performanceLevel && performanceLevel !== 'neutral' ? `performance.${performanceLevel}` : 'textSecondary'}>
                {cellData.performance > 0 ? '+' : ''}{cellData.performance.toFixed(2)}%
              </Typography>
            )}
          </>
        );
    }
  };

  const handleClick = () => {
    onClick();
    toggleDetailsPanel(); // Open details panel when cell is clicked
  };
  
  return (
    <Tooltip title={tooltipContent()} placement="top" arrow>
      <CellPaper
        isselected={isSelected ? 'true' : 'false'}
        istoday={isToday ? 'true' : 'false'}
        iscurrentmonth={isCurrentMonth ? 'true' : 'false'}
        isinrange={isInRange ? 'true' : 'false'}
        volatilitylevel={volatilityLevel}
        performancelevel={performanceLevel}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onKeyDown={onKeyDown}
        tabIndex={0} // Make cell focusable for keyboard navigation
      >
        {/* Date and basic content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {renderContent()}
        </Box>
        
        {/* Performance indicator */}
        <Indicator type="performance" level={performanceLevel}>
          {renderPerformanceIndicator()}
        </Indicator>
        
        {/* Liquidity pattern */}
        {cellData && cellData.volume > 0 && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.2,
            ...patterns.dots
          }} />
        )}
        
        {/* Volume bar */}
        {cellData && (
          <VolumeBar 
            volume={cellData.volume} 
            maxvolume={maxVolume} 
          />
        )}
      </CellPaper>
    </Tooltip>
  );
};

export default CalendarCell;
