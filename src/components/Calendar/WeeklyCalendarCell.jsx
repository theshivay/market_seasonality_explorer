import React from 'react';
import { Box, Typography, useTheme, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove, BarChart } from '@mui/icons-material';
import moment from 'moment';

const WeeklyCalendarCell = ({ 
  weekStart, 
  marketData = {},
  loading = false,
  isCurrentWeek = false,
  isSelected = false,
  isInRangePreview = false,
  onWeekClick 
}) => {
  const theme = useTheme();
  
  if (!weekStart || !weekStart.format) {
    console.warn('WeeklyCalendarCell: Invalid weekStart object received', weekStart);
    return null;
  }
  
  const weekKey = weekStart.format('YYYY-MM-DD');
  const isFutureWeek = weekStart.isAfter(moment(), 'week');
  
  // Don't show market data for future weeks
  const weekData = (marketData && weekKey && !isFutureWeek) ? (marketData[weekKey] || null) : null;
  
  // Calculate weekly volatility color (averaged)
  const getWeeklyVolatilityColor = (avgVolatility) => {
    if (!avgVolatility) return 'transparent';
    
    if (avgVolatility < 3) {
      return `rgba(76, 175, 80, ${Math.min(avgVolatility / 3, 0.8)})`;
    } else if (avgVolatility < 8) {
      return `rgba(255, 152, 0, ${Math.min((avgVolatility - 3) / 5, 0.8)})`;
    } else {
      return `rgba(244, 67, 54, ${Math.min((avgVolatility - 8) / 12, 0.8)})`;
    }
  };
  
  // Get weekly performance trend icon
  const getWeeklyPerformanceIcon = (weeklyReturn) => {
    if (!weeklyReturn) return null;
    
    const iconStyle = { fontSize: 18, opacity: 0.9 };
    
    if (weeklyReturn > 5) {
      return <TrendingUp sx={{ ...iconStyle, color: theme.palette.success.main }} />;
    } else if (weeklyReturn < -5) {
      return <TrendingDown sx={{ ...iconStyle, color: theme.palette.error.main }} />;
    } else {
      return <Remove sx={{ ...iconStyle, color: theme.palette.grey[500] }} />;
    }
  };
  
  // Generate weekly liquidity pattern based on total volume
  const getWeeklyLiquidityPattern = (totalVolume) => {
    if (!totalVolume) return 'none';
    
    // Adjust thresholds for weekly data (7x daily volume)
    if (totalVolume > 14000000000) { // Very high weekly volume
      return `radial-gradient(circle at 3px 3px, rgba(33, 150, 243, 0.4) 1.5px, transparent 1.5px)`;
    } else if (totalVolume > 7000000000) { // High weekly volume
      return `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(33, 150, 243, 0.3) 3px, rgba(33, 150, 243, 0.3) 6px)`;
    } else {
      return `linear-gradient(45deg, rgba(33, 150, 243, 0.2), transparent)`;
    }
  };
  
  // Calculate weekly volume bar height
  const getWeeklyVolumeBarHeight = (totalVolume) => {
    if (!totalVolume) return 0;
    // Normalize weekly volume to a height between 4-25px
    return Math.min(Math.max((totalVolume / 10000000000) * 25, 4), 25);
  };
  
  const handleClick = () => {
    // Don't allow clicking on future weeks
    if (isFutureWeek) {
      console.log('Future week clicked - no action taken:', weekKey);
      return;
    }
    
    console.log('WeeklyCalendarCell clicked:', weekKey, weekData);
    onWeekClick && onWeekClick(weekStart, weekData);
  };
  
  const volatilityColor = weekData ? getWeeklyVolatilityColor(weekData.avgVolatility) : 'transparent';
  const liquidityPattern = weekData ? getWeeklyLiquidityPattern(weekData.totalVolume) : 'none';
  const volumeBarHeight = weekData ? getWeeklyVolumeBarHeight(weekData.totalVolume) : 0;
  
  const weekEnd = weekStart.clone().endOf('week');
  
  const tooltipContent = isFutureWeek ? (
    <Typography variant="body2" sx={{ p: 1 }}>
      📅 Future Week - No market data available yet
    </Typography>
  ) : weekData ? (
    <Box sx={{ p: 1.5, maxWidth: 400, minWidth: 320 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: 'primary.main' }}>
        📊 Week of {weekStart.format('MMM D')} - {weekEnd.format('MMM D, YYYY')}
      </Typography>
      
      {/* Weekly Price Summary */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          💰 Weekly Price Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Week Open:</strong> ${weekData.weekOpen?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Week Close:</strong> ${weekData.weekClose?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Week High:</strong> ${weekData.weekHigh?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2">
          <strong>Week Low:</strong> ${weekData.weekLow?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
      </Box>
      
      {/* Weekly Performance Metrics */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          📈 Weekly Performance
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Weekly Return:</strong> <span style={{ 
            color: weekData.weeklyReturn >= 0 ? theme.palette.success.main : theme.palette.error.main,
            fontWeight: 'bold'
          }}>
            {weekData.weeklyReturn >= 0 ? '+' : ''}{weekData.weeklyReturn?.toFixed(2) || 'N/A'}%
          </span>
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Price Change:</strong> <span style={{ 
            color: weekData.weeklyChange >= 0 ? theme.palette.success.main : theme.palette.error.main 
          }}>
            ${weekData.weeklyChange >= 0 ? '+' : ''}{weekData.weeklyChange?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
          </span>
        </Typography>
        <Typography variant="body2">
          <strong>Trading Days:</strong> {weekData.tradingDays || 0} days
        </Typography>
      </Box>
      
      {/* Weekly Volume & Volatility */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          📊 Volume & Volatility
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Total Volume:</strong> ${weekData.totalVolume?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Avg Daily Volume:</strong> ${weekData.avgVolume?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Avg Volatility:</strong> {weekData.avgVolatility?.toFixed(2) || 'N/A'}%
        </Typography>
        <Typography variant="body2">
          <strong>Volatility Range:</strong> {weekData.minVolatility?.toFixed(1) || 'N/A'}% - {weekData.maxVolatility?.toFixed(1) || 'N/A'}%
        </Typography>
      </Box>
      
      {/* Weekly Market Insights */}
      <Box sx={{ mb: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          🔍 Weekly Insights
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Weekly Trend:</strong> {
            weekData.weeklyReturn > 10 ? 'Strong Bullish Week 🚀' :
            weekData.weeklyReturn > 3 ? 'Bullish Week 📈' :
            weekData.weeklyReturn > -3 ? 'Neutral Week ➡️' :
            weekData.weeklyReturn > -10 ? 'Bearish Week 📉' :
            'Strong Bearish Week 💥'
          }
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Volatility:</strong> {
            weekData.avgVolatility > 15 ? 'High Volatility Week 🌪️' :
            weekData.avgVolatility > 8 ? 'Moderate Volatility 🔥' :
            weekData.avgVolatility > 3 ? 'Low Volatility 😌' :
            'Very Stable Week 💤'
          }
        </Typography>
        <Typography variant="body2">
          <strong>Volume Activity:</strong> {
            weekData.totalVolume > 14000000000 ? 'Very High Activity 🌊' :
            weekData.totalVolume > 7000000000 ? 'High Activity 💧' :
            weekData.totalVolume > 3500000000 ? 'Moderate Activity 💦' :
            'Low Activity 🪣'
          }
        </Typography>
      </Box>
      
      {/* Data Source */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary', 
          fontStyle: 'italic',
          display: 'block',
          textAlign: 'center',
          mt: 0.5,
          p: 0.5,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 0.5
        }}
      >
        📊 Weekly Aggregated Data ({weekData.tradingDays} trading days)
      </Typography>
    </Box>
  ) : (
    <Typography variant="body2" sx={{ p: 1 }}>
      {loading ? 'Loading weekly data...' : 'No weekly data available'}
    </Typography>
  );

  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <Box
        onClick={handleClick}
        sx={{
          minHeight: { xs: '80px', sm: '100px', md: '120px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: 0.5, sm: 1 },
          cursor: isFutureWeek ? 'not-allowed' : 'pointer',
          position: 'relative',
          backgroundColor: isFutureWeek 
            ? 'rgba(0, 0, 0, 0.02)' 
            : isInRangePreview 
              ? 'rgba(25, 118, 210, 0.15)'
              : volatilityColor,
          backgroundImage: isFutureWeek ? 'none' : liquidityPattern,
          border: '1px solid',
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
          borderWidth: isSelected ? 2 : 1,
          borderRadius: 1,
          transition: 'all 0.2s ease-in-out',
          backgroundSize: liquidityPattern !== 'none' ? '8px 8px' : 'auto',
          opacity: isFutureWeek ? 0.3 : 1,
          '&:hover': isFutureWeek ? {} : {
            backgroundColor: `${volatilityColor}dd`,
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[2],
            borderColor: theme.palette.primary.light,
          },
          // Current week indicator
          ...(isCurrentWeek && {
            boxShadow: `0 0 0 2px ${theme.palette.warning.main}`,
            borderColor: theme.palette.warning.main,
          }),
        }}
      >
        {/* Week date range */}
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              color: isCurrentWeek ? theme.palette.warning.main : theme.palette.text.primary,
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            {weekStart.format('MMM D')} - {weekEnd.format('D')}
          </Typography>
          {weekData && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                color: weekData.weeklyReturn >= 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 'bold',
                fontSize: { xs: '0.65rem', sm: '0.7rem' }
              }}
            >
              {weekData.weeklyReturn >= 0 ? '+' : ''}{weekData.weeklyReturn?.toFixed(1) || 'N/A'}%
            </Typography>
          )}
        </Box>

        {/* Performance icon and volume bar container */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center',
          gap: 1,
          width: '100%',
          flex: 1
        }}>
          {/* Performance trend icon */}
          {weekData && getWeeklyPerformanceIcon(weekData.weeklyReturn)}
          
          {/* Volume bar indicator */}
          {volumeBarHeight > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <BarChart sx={{ 
                fontSize: 16, 
                color: theme.palette.info.main,
                opacity: Math.min(volumeBarHeight / 25, 1)
              }} />
            </Box>
          )}
        </Box>

        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default WeeklyCalendarCell;
