import React from 'react';
import { Box, Typography, useTheme, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import moment from 'moment';

const CalendarCell = ({ 
  day, 
  viewMode = 'month',
  marketData = {},
  loading = false,
  isToday = false, 
  isCurrentMonth = true,
  isSelected = false,
  isInRangePreview = false,
  onDayClick 
}) => {
  const theme = useTheme();
  
  if (!day || !day.format) {
    console.warn('CalendarCell: Invalid day object received', day);
    return null;
  }
  
  const dateKey = day.format('YYYY-MM-DD');
  const isFutureDate = day.isAfter(moment(), 'day');
  
  // Don't show market data for future dates
  const dayData = (marketData && dateKey && !isFutureDate) ? (marketData[dateKey] || null) : null;
  
  // Calculate volatility color based on volatility level
  const getVolatilityColor = (volatility) => {
    if (!volatility) return 'transparent';
    
    if (volatility < 5) {
      // Low volatility: Green shades
      return `rgba(76, 175, 80, ${Math.min(volatility / 5, 0.8)})`;
    } else if (volatility < 15) {
      // Medium volatility: Yellow/Orange shades
      return `rgba(255, 152, 0, ${Math.min((volatility - 5) / 10, 0.8)})`;
    } else {
      // High volatility: Red shades
      return `rgba(244, 67, 54, ${Math.min((volatility - 15) / 20, 0.8)})`;
    }
  };
  
  // Get performance trend icon
  const getPerformanceIcon = (performance) => {
    if (!performance) return null;
    
    const iconStyle = { fontSize: 16, opacity: 0.8 };
    
    if (performance > 2) {
      return <TrendingUp sx={{ ...iconStyle, color: theme.palette.success.main }} />;
    } else if (performance < -2) {
      return <TrendingDown sx={{ ...iconStyle, color: theme.palette.error.main }} />;
    } else {
      return <Remove sx={{ ...iconStyle, color: theme.palette.grey[500] }} />;
    }
  };
  
  // Generate liquidity pattern
  const getLiquidityPattern = (liquidity) => {
    if (!liquidity) return 'none';
    
    if (liquidity > 2) {
      // High liquidity: Dots pattern
      return `radial-gradient(circle at 2px 2px, rgba(33, 150, 243, 0.3) 1px, transparent 1px)`;
    } else if (liquidity > 1) {
      // Medium liquidity: Stripes pattern
      return `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(33, 150, 243, 0.2) 2px, rgba(33, 150, 243, 0.2) 4px)`;
    } else {
      // Low liquidity: Gradient
      return `linear-gradient(45deg, rgba(33, 150, 243, 0.1), transparent)`;
    }
  };
  
  // Calculate volume bar height
  const getVolumeBarHeight = (volume) => {
    if (!volume) return 0;
    // Normalize volume to a height between 2-20px
    return Math.min(Math.max((volume / 2000000) * 20, 2), 20);
  };
  
  const handleClick = () => {
    // Don't allow clicking on future dates
    if (isFutureDate) {
      console.log('Future date clicked - no action taken:', dateKey);
      return;
    }
    
    console.log('CalendarCell clicked:', dateKey, dayData);
    onDayClick && onDayClick(day, dayData);
  };
  
  const volatilityColor = dayData ? getVolatilityColor(dayData.volatility) : 'transparent';
  const liquidityPattern = dayData ? getLiquidityPattern(dayData.liquidity) : 'none';
  const volumeBarHeight = dayData ? getVolumeBarHeight(dayData.volume) : 0;
  
  const tooltipContent = isFutureDate ? (
    <Typography variant="body2" sx={{ p: 1 }}>
      📅 Future Date - Market data not available yet
    </Typography>
  ) : dayData ? (
    <Box sx={{ p: 1.5, maxWidth: 350, minWidth: 280 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: 'primary.main' }}>
        📈 {day.format('MMM D, YYYY')}
      </Typography>
      
      {/* Price Information */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          💰 Price Data
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Close Price:</strong> ${dayData.close?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Open Price:</strong> ${dayData.open?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>High:</strong> ${dayData.high?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
        <Typography variant="body2">
          <strong>Low:</strong> ${dayData.low?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
        </Typography>
      </Box>
      
      {/* Performance & Volatility */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          📊 Performance Metrics
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3, color: dayData.performance > 0 ? 'success.main' : dayData.performance < 0 ? 'error.main' : 'text.primary' }}>
          <strong>Daily Change:</strong> {dayData.performance?.toFixed(2) || 'N/A'}%
          {dayData.performance && (dayData.performance > 0 ? ' 📈' : dayData.performance < 0 ? ' 📉' : ' ➡️')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Volatility:</strong> {dayData.volatility?.toFixed(2) || 'N/A'}%
          {dayData.volatility && (dayData.volatility > 15 ? ' 🔥' : dayData.volatility > 5 ? ' ⚡' : ' 😌')}
        </Typography>
        <Typography variant="body2">
          <strong>Price Range:</strong> {dayData.high && dayData.low ? `$${(dayData.high - dayData.low).toFixed(2)}` : 'N/A'}
        </Typography>
      </Box>
      
      {/* Volume & Liquidity */}
      <Box sx={{ mb: 1.5, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          🌊 Market Activity
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Volume:</strong> {dayData.volume ? 
            (dayData.volume >= 1000000000 ? 
              `$${(dayData.volume / 1000000000).toFixed(2)}B` : 
              dayData.volume >= 1000000 ? 
                `$${(dayData.volume / 1000000).toFixed(1)}M` : 
                `$${(dayData.volume / 1000).toFixed(0)}K`
            ) : 'N/A'
          }
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Liquidity Score:</strong> {dayData.liquidity?.toFixed(1) || 'N/A'}
          {dayData.liquidity && (dayData.liquidity > 7 ? ' 🟢' : dayData.liquidity > 4 ? ' 🟡' : ' 🔴')}
        </Typography>
        <Typography variant="body2">
          <strong>Market Cap Impact:</strong> {dayData.volume && dayData.close ? 
            `${((dayData.volume / (dayData.close * 21000000)) * 100).toFixed(3)}%` : 'N/A'
          }
        </Typography>
      </Box>
      
      {/* Additional Insights */}
      <Box sx={{ mb: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
          🔍 Market Insights
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Trend:</strong> {
            dayData.performance > 5 ? 'Strong Bullish 🚀' :
            dayData.performance > 2 ? 'Bullish 📈' :
            dayData.performance > -2 ? 'Neutral ➡️' :
            dayData.performance > -5 ? 'Bearish 📉' :
            'Strong Bearish 💥'
          }
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.3 }}>
          <strong>Volatility Level:</strong> {
            dayData.volatility > 20 ? 'Extreme 🌪️' :
            dayData.volatility > 15 ? 'High 🔥' :
            dayData.volatility > 8 ? 'Moderate ⚡' :
            dayData.volatility > 3 ? 'Low 😌' :
            'Very Low 💤'
          }
        </Typography>
        <Typography variant="body2">
          <strong>Volume Level:</strong> {
            dayData.volume > 1000000000 ? 'Very High 🌊' :
            dayData.volume > 500000000 ? 'High 💧' :
            dayData.volume > 100000000 ? 'Moderate 💦' :
            'Low 🪣'
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
          backgroundColor: (dayData.dataSource === 'okx' || dayData.dataSource === 'coingecko') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
          borderRadius: 1,
          border: `1px solid ${(dayData.dataSource === 'okx' || dayData.dataSource === 'coingecko') ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`
        }}
      >
        {(dayData.dataSource === 'okx' || dayData.dataSource === 'coingecko') ? '🟢 Real API Data' : '🟡 Demo Data'} • 
        Source: {dayData.dataSource === 'coingecko' ? 'CoinGecko' : dayData.dataSource === 'okx' ? 'OKX' : 'Demo'}
      </Typography>
    </Box>
  ) : (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
        📅 {day.format('MMM D, YYYY')}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        No market data available for this date
      </Typography>
    </Box>
  );
  
  return (
    <Tooltip 
      title={tooltipContent} 
      arrow 
      placement="top"
      enterDelay={300}
      leaveDelay={100}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: theme.shadows[16],
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            fontSize: '0.875rem',
            maxWidth: 'none',
            '& .MuiTooltip-arrow': {
              color: 'background.paper'
            }
          }
        }
      }}
    >
      <Box
        sx={{
          minHeight: viewMode === 'day' ? 120 : viewMode === 'week' ? 100 : 80,
          p: 1,
          border: isSelected ? '2px solid' : '1px solid #e0e0e0',
          borderColor: isSelected ? theme.palette.primary.main : '#e0e0e0',
          cursor: isFutureDate ? 'not-allowed' : 'pointer',
          backgroundColor: isFutureDate 
            ? 'rgba(0, 0, 0, 0.02)' 
            : isInRangePreview 
              ? 'rgba(25, 118, 210, 0.15)'
              : volatilityColor || (isToday ? '#e3f2fd' : isSelected ? 'rgba(25, 118, 210, 0.08)' : 'white'),
          backgroundImage: isFutureDate ? 'none' : liquidityPattern,
          backgroundSize: liquidityPattern !== 'none' ? '8px 8px' : 'auto',
          opacity: isCurrentMonth ? (isFutureDate ? 0.3 : 1) : 0.5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease-in-out',
          '&:hover': isFutureDate ? {} : {
            backgroundColor: dayData ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            transform: 'scale(1.05)',
            zIndex: 10,
            boxShadow: theme.shadows[8],
            border: '2px solid',
            borderColor: dayData ? theme.palette.primary.main : '#e0e0e0',
            '& .MuiTypography-root': {
              fontWeight: 'bold'
            }
          }
        }}
        onClick={handleClick}
      >
        {/* Date and Performance Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: isToday ? 700 : 500,
              color: isFutureDate 
                ? theme.palette.text.disabled 
                : isToday 
                  ? theme.palette.primary.main 
                  : 'inherit',
              mb: 0.5
            }}
          >
            {day.format('D')}
          </Typography>
          
          {dayData && getPerformanceIcon(dayData.performance)}
        </Box>
        
        {/* Market Data Display or Future Label */}
        {isFutureDate ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.disabled,
                fontStyle: 'italic',
                fontSize: '0.65rem'
              }}
            >
              Future
            </Typography>
          </Box>
        ) : dayData ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {viewMode !== 'month' && (
              <>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }}>
                  ${dayData.close?.toFixed(0) || 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.2 }}>
                  Vol: {dayData.volatility?.toFixed(1) || 'N/A'}%
                </Typography>
              </>
            )}
            
            {viewMode === 'day' && (
              <>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.2 }}>
                  Volume: {dayData.volume ? (dayData.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.2 }}>
                  Liquidity: {dayData.liquidity?.toFixed(1) || 'N/A'}
                </Typography>
              </>
            )}
          </Box>
        ) : null}
        
        {/* Volume Bar at Bottom */}
        {dayData && volumeBarHeight > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${volumeBarHeight}px`,
              backgroundColor: 'rgba(33, 150, 243, 0.6)',
              borderRadius: '2px 2px 0 0'
            }}
          />
        )}
        
        {loading && (
          <Typography variant="caption" sx={{ color: 'gray', textAlign: 'center' }}>
            Loading...
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default CalendarCell;
